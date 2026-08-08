/**
 * ratelimit.js — bốn thuật toán rate limit chạy THẬT trên Redis (Bài 13), 0 dependency.
 *
 * Mọi thuật toán đều nằm trong một script Lua duy nhất và được nạp bằng SCRIPT LOAD +
 * EVALSHA. Hai lý do, cả hai đều là lý do thật của production:
 *   1. NGUYÊN TỬ. Đọc bộ đếm rồi quyết định rồi ghi lại — nếu tách thành nhiều lệnh thì
 *      giữa chúng có chỗ cho instance khác chen vào. Redis chạy trọn một script Lua như
 *      một lệnh đơn, nên toàn bộ "đọc - quyết định - ghi" là bất khả phân.
 *   2. MỘT VÒNG MẠNG. Rate limiter nằm trên đường đi của MỌI request, nên số round-trip
 *      của nó cộng thẳng vào p99 của toàn hệ thống (đo ở ROLE=bench).
 *
 *   ROLE=boundary   thí nghiệm biên cửa sổ: bắn 2 lô L request quanh mốc giao cửa sổ,
 *                   đo số request ĐƯỢC CHO QUA nhiều nhất trong một cửa sổ trượt 1 giây
 *   ROLE=bench      đo độ trễ của chính lời gọi limiter (p50/p99) cho từng thuật toán
 *   ROLE=nonatomic  tái tạo lỗi INCR + EXPIRE tách rời: đếm số khoá KHÔNG có TTL
 *
 * Biến môi trường: REDIS_URL, ROLE, LIMIT, WINDOW_MS, CALLS, ALGO, CRASH_EVERY
 */

'use strict';

const net = require('net');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const ROLE = process.env.ROLE || 'boundary';
const LIMIT = Number(process.env.LIMIT || 100);
const WINDOW_MS = Number(process.env.WINDOW_MS || 1000);
const CALLS = Number(process.env.CALLS || 20000);
const ALGO = process.env.ALGO || 'all';
// nonatomic: cứ bao nhiêu khoá thì "tiến trình chết" ngay giữa INCR và EXPIRE.
const CRASH_EVERY = Number(process.env.CRASH_EVERY || 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Client Redis tối giản (cùng bản với worker/queue.js — Bài 12)
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

// ---------------------------------------------------------------------------
// THE FOUR ALGORITHMS
//
// All four return the same string format: "<0|1>|<remaining>|<retryAfterMs>".
// Returning a string rather than an array is deliberate: the minimal RESP client in this
// lab only needs to unwrap a bulk string, and any real limiter needs exactly these three
// numbers to build its headers.
//
// All four read the time with `redis.call('TIME')` rather than taking `now` from the
// client. The reason: many app instances call the same limiter and their clocks differ —
// if the client sent `now`, a machine running 200 ms fast would move itself into the next
// window early. Reading the clock in Redis is the cheapest way to have ONE single clock.
// ---------------------------------------------------------------------------
const LUA = {
  // 1. FIXED WINDOW — the counter resets on absolute time boundaries.
  //    Cheapest: one integer key per (user × window).
  fixed: `
local limit = tonumber(ARGV[1])
local win   = tonumber(ARGV[2])
local t     = redis.call('TIME')
local now   = t[1] * 1000 + math.floor(t[2] / 1000)
local wid   = math.floor(now / win)
local k     = KEYS[1] .. ':' .. wid
local n     = redis.call('INCR', k)
if n == 1 then
  -- PEXPIRE is INSIDE the script so it cannot be skipped: either both commands run,
  -- or neither does. This is precisely the bug that ROLE=nonatomic reproduces.
  redis.call('PEXPIRE', k, win * 2)
end
if n > limit then
  return '0|0|' .. (win - (now % win))
end
return '1|' .. (limit - n) .. '|0'`,

  // 2. SLIDING WINDOW LOG — stores the timestamp of EVERY request in a ZSET.
  //    Perfectly exact, and expensive by exactly the price of that exactness:
  //    memory is proportional to the NUMBER OF REQUESTS allowed, not the number of users.
  slidinglog: `
local limit = tonumber(ARGV[1])
local win   = tonumber(ARGV[2])
local id    = ARGV[3]
local k     = KEYS[1]
local t     = redis.call('TIME')
local now   = t[1] * 1000 + math.floor(t[2] / 1000)
redis.call('ZREMRANGEBYSCORE', k, 0, now - win)
local n = redis.call('ZCARD', k)
if n >= limit then
  local oldest = redis.call('ZRANGE', k, 0, 0, 'WITHSCORES')
  local retry = win - (now - tonumber(oldest[2]))
  if retry < 0 then retry = 0 end
  return '0|0|' .. retry
end
redis.call('ZADD', k, now, id)
redis.call('PEXPIRE', k, win)
return '1|' .. (limit - n - 1) .. '|0'`,

  // 3. SLIDING WINDOW COUNTER — approximates a sliding window with TWO fixed counters:
  //    take a linearly weighted share of the previous window, plus the current one.
  //    Memory like fixed window, but without the cliff at the window boundary.
  slidingcounter: `
local limit = tonumber(ARGV[1])
local win   = tonumber(ARGV[2])
local t     = redis.call('TIME')
local now   = t[1] * 1000 + math.floor(t[2] / 1000)
local wid   = math.floor(now / win)
local cur   = KEYS[1] .. ':' .. wid
local prev  = KEYS[1] .. ':' .. (wid - 1)
local c = tonumber(redis.call('GET', cur) or '0')
local p = tonumber(redis.call('GET', prev) or '0')
local elapsed = now % win
local est = p * ((win - elapsed) / win) + c
if est >= limit then
  return '0|0|' .. (win - elapsed)
end
local n = redis.call('INCR', cur)
if n == 1 then redis.call('PEXPIRE', cur, win * 2) end
return '1|' .. math.floor(limit - est - 1) .. '|0'`,

  // 4. TOKEN BUCKET — a bucket of capacity `cap`, refilled steadily at `cap` per `win`.
  //    There are no window boundaries at all, so there is no cliff to exploit. Bursts are
  //    ALLOWED but capped by exactly the bucket capacity — that is the difference from
  //    fixed window.
  token: `
local cap  = tonumber(ARGV[1])
local win  = tonumber(ARGV[2])
local k    = KEYS[1]
local t    = redis.call('TIME')
local now  = t[1] * 1000 + math.floor(t[2] / 1000)
local d    = redis.call('HMGET', k, 'tokens', 'ts')
local tokens = tonumber(d[1])
local ts     = tonumber(d[2])
if tokens == nil then
  tokens = cap
  ts = now
end
local delta = now - ts
if delta < 0 then delta = 0 end
tokens = math.min(cap, tokens + delta * cap / win)
local ttl = win * 2
if tokens < 1 then
  redis.call('HSET', k, 'tokens', tokens, 'ts', now)
  redis.call('PEXPIRE', k, ttl)
  return '0|0|' .. math.ceil((1 - tokens) * win / cap)
end
tokens = tokens - 1
redis.call('HSET', k, 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', k, ttl)
return '1|' .. math.floor(tokens) .. '|0'`,
};

const ALGOS = ['fixed', 'slidinglog', 'slidingcounter', 'token'];
const sha = {};

async function loadScripts() {
  for (const name of ALGOS) sha[name] = await redis.cmd('SCRIPT', 'LOAD', LUA[name]);
}

let seq = 0;
/** Gọi limiter một lần. Trả { allowed, remaining, retryAfterMs }. */
async function hit(algo, key) {
  const out = await redis.cmd('EVALSHA', sha[algo], '1', key, String(LIMIT), String(WINDOW_MS), `r${seq++}`);
  const [a, rem, retry] = String(out).split('|');
  return { allowed: a === '1', remaining: Number(rem), retryAfterMs: Number(retry) };
}

async function resetKeys(algo) {
  const pat = `lab:rl:${algo}*`;
  const res = await redis.cmd('KEYS', pat);
  if (Array.isArray(res) && res.length) await redis.cmd('DEL', ...res);
}

// ---------------------------------------------------------------------------
// ROLE=boundary — thí nghiệm biên cửa sổ
//
// Kịch bản giống hệt nhau cho cả bốn thuật toán: đứng yên, bắn L request ngay TRƯỚC
// mốc giao cửa sổ, rồi bắn tiếp L request ngay SAU mốc đó. Con số cần nhìn không phải
// tổng số request được cho qua, mà là `maxIn1s` — số request được cho qua nhiều nhất
// trong MỘT cửa sổ trượt 1 giây bất kỳ. Đó mới là thứ server phía sau thực sự hứng.
// ---------------------------------------------------------------------------
function maxInWindow(timestamps, win) {
  let best = 0;
  let i = 0;
  for (let j = 0; j < timestamps.length; j++) {
    while (timestamps[j] - timestamps[i] >= win) i++;
    best = Math.max(best, j - i + 1);
  }
  return best;
}

async function boundary() {
  const results = [];
  for (const algo of ALGOS) {
    await resetKeys(algo);
    const key = `lab:rl:${algo}:u1`;

    // Chờ tới mốc giao cửa sổ kế tiếp, chừa đủ chỗ cho lô thứ nhất.
    let now = Date.now();
    let edge = Math.ceil(now / WINDOW_MS) * WINDOW_MS;
    if (edge - now < 300) edge += WINDOW_MS;
    await sleep(edge - Date.now() - 150);

    const allowedAt = [];
    let passA = 0;
    let passB = 0;
    // Lô A: ngay TRƯỚC mốc giao cửa sổ.
    for (let i = 0; i < LIMIT; i++) {
      const r = await hit(algo, key);
      if (r.allowed) {
        allowedAt.push(Date.now());
        passA++;
      }
    }
    // Lô B: ngay SAU mốc giao cửa sổ.
    const wait = edge + 10 - Date.now();
    if (wait > 0) await sleep(wait);
    for (let i = 0; i < LIMIT; i++) {
      const r = await hit(algo, key);
      if (r.allowed) {
        allowedAt.push(Date.now());
        passB++;
      }
    }

    results.push({
      algo,
      truocMoc: passA,
      sauMoc: passB,
      tongChoQua: passA + passB,
      // Đây là con số của bài học: hạn mức danh nghĩa là LIMIT/giây, còn đây là
      // lượng thật sự lọt qua trong một giây tệ nhất.
      maxIn1s: maxInWindow(allowedAt, WINDOW_MS),
      vuotHanMuc: `${((maxInWindow(allowedAt, WINDOW_MS) / LIMIT) * 100).toFixed(0)}%`,
    });
  }
  console.log(JSON.stringify({ role: 'boundary', limit: LIMIT, windowMs: WINDOW_MS, results }, null, 2));
}

// ---------------------------------------------------------------------------
// ROLE=bench — limiter tốn bao nhiêu mili giây của MỖI request
//
// Đặt hạn mức rất cao để không request nào bị từ chối: ta đang đo CHI PHÍ, không đo
// hành vi chặn. Mốc so sánh là một lệnh `GET` rỗng — nó đại diện cho "một vòng mạng
// tới Redis và không làm gì cả", nên hiệu số chính là phần Lua thực sự tốn.
// ---------------------------------------------------------------------------
function pct(sorted, p) {
  if (!sorted.length) return 0;
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))];
}

async function bench() {
  const out = [];
  const targets = ALGO === 'all' ? ['baseline', ...ALGOS] : [ALGO];
  for (const algo of targets) {
    await resetKeys(algo);
    const lat = [];
    // Warm-up: bỏ 500 lần gọi đầu (kết nối TCP, JIT, khoá chưa tồn tại).
    for (let i = 0; i < 500; i++) {
      if (algo === 'baseline') await redis.cmd('GET', 'lab:rl:noop');
      else await hit(algo, `lab:rl:${algo}:b${i % 1000}`);
    }
    const t0 = Date.now();
    for (let i = 0; i < CALLS; i++) {
      const s = process.hrtime.bigint();
      if (algo === 'baseline') await redis.cmd('GET', 'lab:rl:noop');
      else await hit(algo, `lab:rl:${algo}:b${i % 1000}`);
      lat.push(Number(process.hrtime.bigint() - s) / 1e6);
    }
    const ms = Date.now() - t0;
    lat.sort((a, b) => a - b);
    out.push({
      algo,
      calls: CALLS,
      callsPerSec: Math.round((CALLS / ms) * 1000),
      p50: Number(pct(lat, 50).toFixed(3)),
      p95: Number(pct(lat, 95).toFixed(3)),
      p99: Number(pct(lat, 99).toFixed(3)),
      max: Number(lat[lat.length - 1].toFixed(3)),
    });
  }
  console.log(JSON.stringify({ role: 'bench', limit: LIMIT, windowMs: WINDOW_MS, results: out }, null, 2));
}

// ---------------------------------------------------------------------------
// ROLE=nonatomic — why INCR then EXPIRE as TWO commands is a time bomb
//
// The most common limiter you will find online:
//     INCR key
//     if n == 1: EXPIRE key 60
// There is a gap between those two commands. If the process dies right there — a
// deploy, an OOM kill, a CPU-throttled container — the key survives FOREVER with no
// TTL. The counter never resets, and that user is blocked permanently until somebody
// deletes the key by hand. Here "dying" is simulated by skipping the EXPIRE entirely.
// ---------------------------------------------------------------------------
async function nonatomic() {
  const N = 200;
  const report = [];

  for (const mode of ['two-commands', 'lua']) {
    const prefix = `lab:rl:na:${mode}`;
    const old = await redis.cmd('KEYS', `${prefix}*`);
    if (Array.isArray(old) && old.length) await redis.cmd('DEL', ...old);

    for (let i = 0; i < N; i++) {
      const k = `${prefix}:u${i}`;
      if (mode === 'two-commands') {
        const n = await redis.cmd('INCR', k);
        // The "process dies" right here, with probability 1/CRASH_EVERY.
        if (i % CRASH_EVERY === 0) continue;
        if (n === 1) await redis.cmd('PEXPIRE', k, String(WINDOW_MS));
      } else {
        await redis.cmd('EVALSHA', sha.fixed, '1', k, String(LIMIT), String(WINDOW_MS), 'x');
      }
    }

    const keys = await redis.cmd('KEYS', `${prefix}*`);
    let noTtl = 0;
    for (const k of keys) {
      const ttl = await redis.cmd('PTTL', k);
      // -1 means: the key exists but has NO expiry.
      if (ttl === -1) noTtl++;
    }
    report.push({
      mode,
      keyCount: keys.length,
      keysWithoutTtl: noTtl,
      consequence: noTtl > 0 ? `${noTtl} users blocked FOREVER` : 'no keys stuck',
    });
  }
  console.log(JSON.stringify({ role: 'nonatomic', crashEvery: CRASH_EVERY, report }, null, 2));
}

// ---------------------------------------------------------------------------
// ROLE=memory — cái giá thật của "chính xác tuyệt đối"
//
// Bốn thuật toán tốn gần như nhau về THỜI GIAN (xem ROLE=bench), nên chọn thuật toán
// không phải là chuyện tốc độ. Khác biệt nằm ở BỘ NHỚ, và nó chỉ lộ ra khi mỗi người
// dùng đã dùng gần hết hạn mức: sliding window log phải nhớ dấu thời gian của TỪNG
// request còn hiệu lực, ba thuật toán kia chỉ nhớ vài con số.
// ---------------------------------------------------------------------------
async function memory() {
  const USERS = Number(process.env.USERS || 200);
  const out = [];
  for (const algo of ALGOS) {
    // Xoá khoá của MỌI thuật toán, không chỉ thuật toán sắp đo: khoá của lượt trước
    // còn TTL vài giây, và nếu chúng hết hạn giữa hai lần chụp `used_memory` thì phần
    // bộ nhớ được giải phóng sẽ trừ vào số của thuật toán này (đã gặp: ra số ÂM).
    await resetKeys('');
    await sleep(2500);
    const before = Number((await redis.cmd('INFO', 'memory')).match(/used_memory:(\d+)/)[1]);
    for (let u = 0; u < USERS; u++) {
      for (let i = 0; i < LIMIT; i++) await hit(algo, `lab:rl:${algo}:m${u}`);
    }
    const after = Number((await redis.cmd('INFO', 'memory')).match(/used_memory:(\d+)/)[1]);
    out.push({
      algo,
      users: USERS,
      requestsPerUser: LIMIT,
      bytesTotal: after - before,
      bytesPerUser: Math.round((after - before) / USERS),
    });
  }
  console.log(JSON.stringify({ role: 'memory', limit: LIMIT, results: out }, null, 2));
}

const main = ROLE === 'bench' ? bench : ROLE === 'nonatomic' ? nonatomic : ROLE === 'memory' ? memory : boundary;
loadScripts()
  .then(main)
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(ROLE, 'loi:', e.message);
    process.exit(1);
  });
