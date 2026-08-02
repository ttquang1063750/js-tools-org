/**
 * app.js — App server cho Traffic Lab (Series 20: Thiết Kế Hệ Thống).
 *
 * Viết bằng module `http` THUẦN của Node, không Express, không dependency nào.
 * Lý do: để bạn thấy rõ vòng đời một request và biết chính xác chỗ nào có hàng đợi ẩn —
 * thứ mà framework thường che đi (xem Bài 2, mục 2.1).
 *
 * Các endpoint:
 *   GET /whoami        → cho biết instance nào phục vụ (dùng để thấy LB phân phối, Bài 3)
 *   GET /health        → health check; `?fail=1` để cố ý báo hỏng (Bài 3, mục 3.4)
 *   GET /fast          → trả lời ngay, dùng làm mốc so sánh
 *   GET /slow-async?ms → chậm nhưng KHÔNG chặn event loop (I/O giả lập)
 *   GET /slow-sync?ms  → chậm và CHẶN event loop — thủ phạm ở Bài 2, mục 2.2
 *   GET /cached?key=   → cache-aside thật với Redis nếu có REDIS_URL (Bài 5)
 *
 * Biến môi trường: PORT, INSTANCE, REDIS_URL, DB_DELAY_MS, GRACEFUL
 */

'use strict';

const http = require('http');
const net = require('net');

const PORT = Number(process.env.PORT || 3000);
const INSTANCE = process.env.INSTANCE || 'app';
// Độ trễ giả lập của "database" phía sau cache — để thấy cache tiết kiệm bao nhiêu (Bài 5).
const DB_DELAY_MS = Number(process.env.DB_DELAY_MS || 40);
const REDIS_URL = process.env.REDIS_URL || '';
const GRACEFUL = process.env.GRACEFUL !== '0';

let healthy = true;
let inFlight = 0;
let totalRequests = 0;
let cacheHits = 0;
let cacheMisses = 0;

// ---------------------------------------------------------------------------
// Client Redis tối giản nói trực tiếp giao thức RESP qua TCP.
//
// Vì sao không dùng thư viện? Để lab không cần `npm install` (giữ đúng tinh thần
// không build step của cả site), và để bạn thấy giao thức Redis đơn giản đến mức nào:
// một lệnh chỉ là mảng bulk string phân cách bằng CRLF.
// ---------------------------------------------------------------------------
class MiniRedis {
  constructor(url) {
    const u = new URL(url);
    this.host = u.hostname;
    this.port = Number(u.port || 6379);
    this.sock = null;
    this.buf = Buffer.alloc(0);
    this.waiters = []; // FIFO: Redis trả lời đúng thứ tự lệnh gửi đi
    this.connecting = null;
  }

  connect() {
    if (this.sock && !this.sock.destroyed) return Promise.resolve();
    if (this.connecting) return this.connecting;
    this.connecting = new Promise((resolve, reject) => {
      const sock = net.createConnection({ host: this.host, port: this.port });
      sock.setNoDelay(true);
      sock.on('connect', () => {
        this.sock = sock;
        this.connecting = null;
        resolve();
      });
      sock.on('data', (chunk) => {
        this.buf = Buffer.concat([this.buf, chunk]);
        this._drain();
      });
      sock.on('error', (err) => {
        this.connecting = null;
        this.sock = null;
        // Mọi lệnh đang chờ đều phải được trả lời, nếu không request sẽ treo vô hạn.
        while (this.waiters.length) this.waiters.shift().reject(err);
        reject(err);
      });
      sock.on('close', () => {
        this.sock = null;
      });
    });
    return this.connecting;
  }

  /** Bóc từng reply hoàn chỉnh ra khỏi buffer. Chỉ hỗ trợ các kiểu lab cần dùng. */
  _drain() {
    for (;;) {
      const idx = this.buf.indexOf('\r\n');
      if (idx === -1) return;
      const type = String.fromCharCode(this.buf[0]);
      const head = this.buf.slice(1, idx).toString();

      if (type === '+' || type === '-' || type === ':') {
        this.buf = this.buf.slice(idx + 2);
        const w = this.waiters.shift();
        if (!w) continue;
        if (type === '-') w.reject(new Error(head));
        else w.resolve(type === ':' ? Number(head) : head);
        continue;
      }

      if (type === '$') {
        const len = Number(head);
        if (len === -1) {
          // $-1 = khoá không tồn tại (cache miss)
          this.buf = this.buf.slice(idx + 2);
          const w = this.waiters.shift();
          if (w) w.resolve(null);
          continue;
        }
        const start = idx + 2;
        const end = start + len;
        if (this.buf.length < end + 2) return; // chưa nhận đủ, chờ thêm dữ liệu
        const val = this.buf.slice(start, end).toString();
        this.buf = this.buf.slice(end + 2);
        const w = this.waiters.shift();
        if (w) w.resolve(val);
        continue;
      }

      // Kiểu chưa hỗ trợ: bỏ dòng để không kẹt vòng lặp.
      this.buf = this.buf.slice(idx + 2);
    }
  }

  async cmd(...args) {
    await this.connect();
    // Mã hoá RESP: *<số phần tử>\r\n rồi mỗi phần tử là $<độ dài>\r\n<nội dung>\r\n
    let out = `*${args.length}\r\n`;
    for (const a of args) {
      const s = String(a);
      out += `$${Buffer.byteLength(s)}\r\n${s}\r\n`;
    }
    return new Promise((resolve, reject) => {
      this.waiters.push({ resolve, reject });
      this.sock.write(out);
    });
  }
}

const redis = REDIS_URL ? new MiniRedis(REDIS_URL) : null;

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Chặn hẳn event loop trong `ms` — mô phỏng handler đồng bộ nặng. */
function blockFor(ms) {
  const until = Date.now() + ms;
  // Vòng lặp bận: KHÔNG nhường quyền cho event loop, nên mọi request khác phải xếp hàng.
  while (Date.now() < until) {
    /* đốt CPU có chủ đích */
  }
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'X-Instance': INSTANCE,
  });
  res.end(body);
}

/** Đọc "database": ở lab này là một khoảng chờ, đại diện cho truy vấn thật. */
async function readFromDb(key) {
  await sleep(DB_DELAY_MS);
  return { key, value: `giá trị của ${key}`, from: 'database', instance: INSTANCE };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  totalRequests++;
  inFlight++;
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  try {
    if (p === '/health') {
      // Cho phép chủ động làm health check thất bại để xem LB rút node ra (Bài 3).
      if (url.searchParams.has('fail')) healthy = url.searchParams.get('fail') !== '0';
      if (!healthy) return json(res, 503, { status: 'unhealthy', instance: INSTANCE });
      return json(res, 200, {
        status: 'ok',
        instance: INSTANCE,
        uptimeSec: Math.round(process.uptime()),
        inFlight,
        totalRequests,
      });
    }

    if (p === '/whoami') {
      return json(res, 200, { instance: INSTANCE, pid: process.pid, totalRequests });
    }

    if (p === '/stats') {
      return json(res, 200 /* dùng để đối chiếu số liệu sau mỗi lần đo */, {
        instance: INSTANCE,
        totalRequests,
        inFlight,
        cacheHits,
        cacheMisses,
        hitRatio: cacheHits + cacheMisses === 0 ? null : cacheHits / (cacheHits + cacheMisses),
      });
    }

    if (p === '/fast') {
      return json(res, 200, { ok: true, instance: INSTANCE });
    }

    if (p === '/slow-async') {
      const ms = Number(url.searchParams.get('ms') || 50);
      await sleep(ms); // nhường event loop => request khác vẫn được phục vụ
      return json(res, 200, { ok: true, mode: 'async', ms, instance: INSTANCE });
    }

    if (p === '/slow-sync') {
      const ms = Number(url.searchParams.get('ms') || 50);
      blockFor(ms); // CHẶN event loop => mọi request khác nằm chờ
      return json(res, 200, { ok: true, mode: 'sync-blocking', ms, instance: INSTANCE });
    }

    if (p === '/cached') {
      const key = url.searchParams.get('key') || 'k1';
      if (!redis) {
        const fresh = await readFromDb(key);
        cacheMisses++;
        return json(res, 200, { ...fresh, cache: 'disabled' });
      }
      const cacheKey = `demo:${key}`;
      let hit = null;
      try {
        hit = await redis.cmd('GET', cacheKey);
      } catch {
        hit = null; // Redis sập thì vẫn phải phục vụ được (suy giảm, không sụp — Bài 17)
      }
      if (hit !== null) {
        cacheHits++;
        return json(res, 200, { ...JSON.parse(hit), from: 'cache', instance: INSTANCE });
      }
      cacheMisses++;
      const fresh = await readFromDb(key);
      try {
        await redis.cmd('SET', cacheKey, JSON.stringify(fresh), 'EX', '30');
      } catch {
        /* không ghi được cache thì bỏ qua, đừng làm request thất bại */
      }
      return json(res, 200, fresh);
    }

    return json(res, 404, { error: 'không có endpoint này', path: p });
  } catch (err) {
    return json(res, 500, { error: String((err && err.message) || err) });
  } finally {
    inFlight--;
  }
});

// Keep-alive: bộ đo tải dùng kết nối bền, nếu đóng sớm sẽ đo ra toàn chi phí bắt tay TCP.
server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;

server.listen(PORT, () => {
  console.log(`[${INSTANCE}] đang nghe cổng ${PORT} | DB_DELAY_MS=${DB_DELAY_MS} | redis=${REDIS_URL || 'không'}`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown (Bài 3, mục 3.4)
//
// Không có phần này thì mỗi lần deploy là một đợt lỗi 502 cho người dùng thật:
// container chết ngay lập tức trong khi LB vẫn đang gửi request tới.
// Đặt GRACEFUL=0 để tắt và tự đo số request lỗi tăng lên bao nhiêu.
// ---------------------------------------------------------------------------
function shutdown(signal) {
  console.log(`[${INSTANCE}] nhận ${signal}`);
  if (!GRACEFUL) {
    console.log(`[${INSTANCE}] GRACEFUL=0 → thoát ngay, request đang xử lý bị cắt`);
    process.exit(0);
  }
  healthy = false; // 1) báo không khoẻ để LB ngừng gửi request mới
  console.log(`[${INSTANCE}] đánh dấu unhealthy, chờ ${inFlight} request đang xử lý...`);
  server.close(() => {
    // 2) chờ các request đang dở hoàn tất rồi mới thoát
    console.log(`[${INSTANCE}] đã drain xong, thoát`);
    process.exit(0);
  });
  // Chốt an toàn: không chờ quá lâu nếu có kết nối treo.
  setTimeout(() => process.exit(0), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
