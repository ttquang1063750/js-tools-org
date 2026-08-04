/**
 * shortener.js — hệ thống rút gọn URL cho Bài 18 (capstone), 0 dependency.
 *
 * Vì sao chọn bài toán này: nó hội đủ ba dạng tải rất khác nhau trong một hệ thống
 * nhỏ đủ để đọc hết trong một buổi.
 *   - ĐỌC cực nặng   : mỗi lần ai đó bấm link là một lượt chuyển hướng
 *   - GHI vừa phải   : tạo link mới thì hiếm hơn nhiều
 *   - ANALYTICS      : đếm lượt click — quan trọng, nhưng KHÔNG cần chính xác tức thì
 *
 * Toàn bộ tối ưu được bật/tắt bằng biến môi trường, để mỗi vòng "đo → vá → đo lại"
 * chỉ đổi ĐÚNG MỘT tham số. Đó là điều kiện để quy kết cải thiện cho đúng nguyên nhân.
 *
 *   CACHE=1         cache-aside code -> url trong Redis          (Bài 5)
 *   ASYNC_CLICKS=1  đếm click bằng bộ đệm trong Redis thay vì ghi thẳng DB (Bài 12)
 *   READ_REPLICA=1  đọc từ replica, ghi vào primary              (Bài 7)
 *   RATE_LIMIT=N    token bucket theo IP, 0 = tắt                (Bài 13)
 *
 * Endpoint:
 *   GET /new?url=...   tạo link mới, trả mã rút gọn
 *   GET /r/<code>      chuyển hướng — đây là đường nóng, mọi phép đo nhắm vào đây
 *   GET /stats/<code>  số lượt click
 *   GET /admin/stats   số liệu vận hành của chính service
 *   GET /admin/reset   xoá bộ đếm
 */

'use strict';

const http = require('http');
const net = require('net');
const { PgPool } = require('./minipg');

const PORT = Number(process.env.PORT || 3000);
const PG_PRIMARY = process.env.PG_PRIMARY || 'postgres';
const PG_REPLICA = process.env.PG_REPLICA || '';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const CACHE = process.env.CACHE === '1';
const ASYNC_CLICKS = process.env.ASYNC_CLICKS === '1';
const READ_REPLICA = process.env.READ_REPLICA === '1' && !!PG_REPLICA;
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 0);
const CACHE_TTL = Number(process.env.CACHE_TTL || 300);

const msSince = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;

let hits = 0;
let cacheHits = 0;
let cacheMisses = 0;
let dbReads = 0;
let dbWrites = 0;
let redisOps = 0;
let limited = 0;
let notFound = 0;

// ---------------------------------------------------------------------------
// Client Redis tối giản (cùng bản với worker/queue.js và worker/ratelimit.js)
// ---------------------------------------------------------------------------
class MiniRedis {
  constructor(url) {
    const u = new URL(url);
    this.host = u.hostname;
    this.port = Number(u.port || 6379);
    this.buf = Buffer.alloc(0);
    this.queue = [];
  }
  connect() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const s = net.createConnection({ host: this.host, port: this.port }, () => resolve(this));
      s.setNoDelay(true);
      s.on('data', (d) => {
        this.buf = Buffer.concat([this.buf, d]);
        this._pump();
      });
      s.on('error', reject);
      this.sock = s;
    });
    return this.ready;
  }
  _parse(i) {
    const b = this.buf;
    if (i >= b.length) return null;
    const nl = b.indexOf('\r\n', i);
    if (nl < 0) return null;
    const t = String.fromCharCode(b[i]);
    const head = b.toString('utf8', i + 1, nl);
    if (t === '+') return [head, nl + 2];
    if (t === '-') return [new Error(head), nl + 2];
    if (t === ':') return [Number(head), nl + 2];
    if (t === '$') {
      const len = Number(head);
      if (len === -1) return [null, nl + 2];
      if (b.length < nl + 2 + len + 2) return null;
      return [b.toString('utf8', nl + 2, nl + 2 + len), nl + 2 + len + 2];
    }
    if (t === '*') {
      const n = Number(head);
      if (n === -1) return [null, nl + 2];
      const out = [];
      let p = nl + 2;
      for (let k = 0; k < n; k++) {
        const r = this._parse(p);
        if (!r) return null;
        out.push(r[0]);
        p = r[1];
      }
      return [out, p];
    }
    return [head, nl + 2];
  }
  _pump() {
    for (;;) {
      if (!this.queue.length) return;
      const r = this._parse(0);
      if (!r) return;
      this.buf = this.buf.subarray(r[1]);
      const q = this.queue.shift();
      if (r[0] instanceof Error) q.reject(r[0]);
      else q.resolve(r[0]);
    }
  }
  cmd(...args) {
    return this.connect().then(
      () =>
        new Promise((resolve, reject) => {
          this.queue.push({ resolve, reject });
          let out = `*${args.length}\r\n`;
          for (const a of args) {
            const s = String(a);
            out += `$${Buffer.byteLength(s)}\r\n${s}\r\n`;
          }
          this.sock.write(out);
        })
    );
  }
}

const redis = new MiniRedis(REDIS_URL);
const pgWrite = new PgPool({ host: PG_PRIMARY }, 8);
const pgRead = READ_REPLICA ? new PgPool({ host: PG_REPLICA }, 8) : pgWrite;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS links (
  code       TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS clicks (
  id   BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  ts   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS clicks_code_idx ON clicks (code);
`;

// Rate limit token bucket — cùng script Lua với Bài 13, không viết lại bản khác.
const RATE_LUA = `
local cap  = tonumber(ARGV[1])
local win  = tonumber(ARGV[2])
local k    = KEYS[1]
local t    = redis.call('TIME')
local now  = t[1] * 1000 + math.floor(t[2] / 1000)
local d    = redis.call('HMGET', k, 'tokens', 'ts')
local tokens = tonumber(d[1])
local ts     = tonumber(d[2])
if tokens == nil then tokens = cap; ts = now end
local delta = now - ts
if delta < 0 then delta = 0 end
tokens = math.min(cap, tokens + delta * cap / win)
if tokens < 1 then
  redis.call('HSET', k, 'tokens', tokens, 'ts', now)
  redis.call('PEXPIRE', k, win * 2)
  return '0'
end
redis.call('HSET', k, 'tokens', tokens - 1, 'ts', now)
redis.call('PEXPIRE', k, win * 2)
return '1'`;
let rateSha = null;

const CODE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
function makeCode(n) {
  let s = '';
  for (let i = 0; i < 6; i++) ((s = CODE_CHARS[n % CODE_CHARS.length] + s), (n = Math.floor(n / CODE_CHARS.length)));
  return s;
}

/** Escape tối thiểu cho chuỗi SQL — lab dùng simple query protocol, xem minipg.js. */
const q = (v) => "'" + String(v).replace(/'/g, "''") + "'";

async function lookup(code) {
  if (CACHE) {
    const cached = await redis.cmd('GET', `s:${code}`);
    redisOps++;
    if (cached !== null) {
      cacheHits++;
      return cached;
    }
    cacheMisses++;
  }
  dbReads++;
  const rows = await pgRead.query(`SELECT url FROM links WHERE code = ${q(code)}`);
  const url = rows.length ? rows[0].url : null;
  if (CACHE && url) {
    // TTL có jitter (Bài 5): tránh mọi khoá cùng hết hạn một lúc sau khi nạp hàng loạt.
    const ttl = Math.max(1, Math.round(CACHE_TTL * (0.85 + Math.random() * 0.3)));
    await redis.cmd('SET', `s:${code}`, url, 'EX', String(ttl));
    redisOps++;
  }
  return url;
}

async function recordClick(code) {
  if (ASYNC_CLICKS) {
    // Đếm trong Redis rồi gộp về DB sau. Đánh đổi: số liệu thống kê trễ vài giây —
    // và đó là đánh đổi ĐÚNG cho analytics, vì không ai cần con số chính xác tức thì.
    redisOps++;
    return redis.cmd('INCR', `c:${code}`);
  }
  // Bản v1: ghi thẳng một dòng vào DB cho MỖI lượt chuyển hướng. Đường đọc nóng nhất
  // của hệ thống bị gắn vào một lệnh GHI — đây chính là nút cổ chai mà lab sẽ đo ra.
  dbWrites++;
  return pgWrite.query(`INSERT INTO clicks (code) VALUES (${q(code)})`);
}

const json = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (p === '/admin/stats') {
      let bufferedClicks = null;
      if (ASYNC_CLICKS) {
        const keys = await redis.cmd('KEYS', 'c:*');
        bufferedClicks = Array.isArray(keys) ? keys.length : 0;
      }
      return json(res, 200, {
        cauHinh: { CACHE, ASYNC_CLICKS, READ_REPLICA, RATE_LIMIT },
        hits,
        cacheHits,
        cacheMisses,
        hitRatio: cacheHits + cacheMisses ? Number((cacheHits / (cacheHits + cacheMisses)).toFixed(4)) : null,
        dbReads,
        dbWrites,
        redisOps,
        limited,
        notFound,
        bufferedClicks,
      });
    }

    if (p === '/admin/reset') {
      hits = cacheHits = cacheMisses = dbReads = dbWrites = redisOps = limited = notFound = 0;
      return json(res, 200, { ok: true });
    }

    if (p === '/new') {
      const target = url.searchParams.get('url') || 'https://js-tools.org';
      // `code` cho phép đặt mã cụ thể — cần cho việc gieo dữ liệu đo, vì bộ đo tải
      // sinh tham số dạng `k0`, `k1`... và ta muốn mã khớp đúng với nó.
      const code =
        url.searchParams.get('code') || makeCode(Number(url.searchParams.get('n') || Math.floor(Math.random() * 1e9)));
      dbWrites++;
      await pgWrite.query(
        `INSERT INTO links (code, url) VALUES (${q(code)}, ${q(target)}) ON CONFLICT (code) DO NOTHING`
      );
      return json(res, 200, { code, url: target });
    }

    if (p.startsWith('/r/')) {
      hits++;
      if (RATE_LIMIT > 0) {
        if (!rateSha) rateSha = await redis.cmd('SCRIPT', 'LOAD', RATE_LUA);
        const ip = req.socket.remoteAddress || 'anon';
        const ok = await redis.cmd('EVALSHA', rateSha, '1', `rl:${ip}`, String(RATE_LIMIT), '1000');
        redisOps++;
        if (ok !== '1') {
          limited++;
          res.writeHead(429, { 'Retry-After': '1' });
          return res.end();
        }
      }
      // Hai dạng đều được: `/r/<code>` cho người dùng thật, `/r/?code=<code>` cho bộ
      // đo tải (nó chỉ sinh được tham số truy vấn, không sinh được đoạn đường dẫn).
      const code = p.slice(3) || url.searchParams.get('code') || '';
      const target = await lookup(code);
      if (!target) {
        notFound++;
        return json(res, 404, { error: 'khong tim thay ma' });
      }
      // Ghi nhận click SAU khi đã biết sẽ trả lời được — và không chờ nó xong nếu
      // đang ở chế độ bất đồng bộ.
      const rec = recordClick(code);
      if (!ASYNC_CLICKS) await rec;
      else rec.catch(() => {});
      res.writeHead(302, { Location: target, 'Cache-Control': 'no-store' });
      return res.end();
    }

    if (p.startsWith('/stats/')) {
      const code = p.slice(7);
      const fromDb = await pgRead.query(`SELECT COUNT(*) AS c FROM clicks WHERE code = ${q(code)}`);
      let buffered = 0;
      if (ASYNC_CLICKS) {
        const v = await redis.cmd('GET', `c:${code}`);
        buffered = Number(v || 0);
      }
      return json(res, 200, {
        code,
        clickTrongDb: Number(fromDb[0].c),
        clickConTrongBoDem: buffered,
        // Tổng mới là con số đúng — và khoảng cách giữa hai số là cái giá của
        // việc xử lý bất đồng bộ: nhất quán cuối (Bài 9).
        tong: Number(fromDb[0].c) + buffered,
      });
    }

    return json(res, 404, { error: 'khong co endpoint nay', path: p });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;

pgWrite
  .query(SCHEMA)
  .then(() =>
    server.listen(PORT, () =>
      console.log(
        `[shortener] cong ${PORT} | CACHE=${CACHE} ASYNC_CLICKS=${ASYNC_CLICKS} READ_REPLICA=${READ_REPLICA} RATE_LIMIT=${RATE_LIMIT}`
      )
    )
  )
  .catch((e) => {
    console.error('[shortener] khong tao duoc schema:', e.message);
    process.exit(1);
  });
