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
 *   GET /uncached?key= → luôn đi xuống database, dùng làm mốc so sánh (Bài 5)
 *   POST /reset-stats  → xoá bộ đếm, để mỗi phép đo bắt đầu từ số 0 (Bài 5)
 *   GET /client-ip     → phơi bày lỗ hổng X-Forwarded-For (Bài 4, mục 4.2)
 *   GET /aggregate     → gộp nhiều nhánh (BFF); so song song vs tuần tự (Bài 4, mục 4.4)
 *
 * Biến môi trường: PORT, INSTANCE, REDIS_URL, DB_DELAY_MS, DB_MAX_CONCURRENCY, GRACEFUL,
 *                  TRUST_PROXY_HOPS
 */

'use strict';

const http = require('http');
const net = require('net');

const PORT = Number(process.env.PORT || 3000);
// Agent rieng cho /aggregate: keep-alive de chi phi bat tay TCP khong lan vao so do
// cua fan-out (Bai 4, muc 4.4).
const aggAgent = new http.Agent({ keepAlive: true, maxSockets: 32 });
// Doi hrtime.bigint() thanh milliseconds dang so thuc.
const msSince = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;
const INSTANCE = process.env.INSTANCE || 'app';
// Độ trễ giả lập của "database" phía sau cache — để thấy cache tiết kiệm bao nhiêu (Bài 5).
const DB_DELAY_MS = Number(process.env.DB_DELAY_MS || 40);
// Số truy vấn database ĐỒNG THỜI tối đa — đại diện cho connection pool có thật.
// Đây là chi tiết làm nên khác biệt ở Bài 5 mục 5.4: nếu "database" là một hàm sleep
// không giới hạn, thundering herd chỉ làm TĂNG SỐ TRUY VẤN mà không làm chậm gì cả, nên
// bài học mất hẳn phần quan trọng nhất. Database thật luôn có giới hạn kết nối.
const DB_MAX_CONCURRENCY = Number(process.env.DB_MAX_CONCURRENCY || 10);
const REDIS_URL = process.env.REDIS_URL || '';
const GRACEFUL = process.env.GRACEFUL !== '0';

let healthy = true;
let inFlight = 0;
let totalRequests = 0;
let cacheHits = 0;
let dbQueries = 0;
let singleFlightJoins = 0;
let dbWaitTotalMs = 0;
let dbMaxQueueDepth = 0;
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

/**
 * Đọc "database": ở lab này là một khoảng chờ, đại diện cho truy vấn thật.
 *
 * `dbQueries` là số liệu QUAN TRỌNG NHẤT của Bài 5. Đánh giá cache bằng "có nhanh hơn
 * không" là chưa đủ — thứ cần đo là bao nhiêu truy vấn đã được đẩy KHỎI database.
 */
// Semaphore mô phỏng connection pool: chỉ DB_MAX_CONCURRENCY truy vấn chạy cùng lúc,
// phần còn lại XẾP HÀNG. Hàng đợi này chính là nơi thundering herd biến thành độ trễ.
let dbActive = 0;
const dbWaiters = [];

function dbAcquire() {
  if (dbActive < DB_MAX_CONCURRENCY) {
    dbActive++;
    return Promise.resolve(0);
  }
  const t0 = process.hrtime.bigint();
  if (dbWaiters.length + 1 > dbMaxQueueDepth) dbMaxQueueDepth = dbWaiters.length + 1;
  return new Promise((resolve) => {
    dbWaiters.push(() => resolve(Number(process.hrtime.bigint() - t0) / 1e6));
  });
}

function dbRelease() {
  const next = dbWaiters.shift();
  if (next) next();
  else dbActive--;
}

async function readFromDb(key) {
  dbQueries++;
  const waitedMs = await dbAcquire();
  dbWaitTotalMs += waitedMs;
  try {
    await sleep(DB_DELAY_MS);
    return { key, value: `giá trị của ${key}`, from: 'database', instance: INSTANCE };
  } finally {
    dbRelease();
  }
}

/**
 * SINGLE-FLIGHT (Bài 5, mục 5.4).
 *
 * Khi N request cùng miss một key đúng lúc nó hết hạn, cả N đều gọi database — đó là
 * thundering herd. Map dưới đây gom chúng lại: request ĐẦU TIÊN đi xuống database, các
 * request sau cùng chờ trên CHÍNH promise đó.
 *
 * GIỚI HẠN PHẢI BIẾT: map này nằm trong BỘ NHỚ CỦA MỘT TIẾN TRÌNH. Với 3 replica, mỗi
 * lần key hết hạn bạn vẫn thấy tối đa 3 truy vấn database chứ không phải 1. Muốn về 1 thì
 * phải dùng lock chia sẻ trong Redis (SET NX) — đắt hơn và phải xử lý cả trường hợp
 * người giữ lock chết. Bài học đo cả hai con số này.
 */
const inFlightLoads = new Map();

function singleFlight(key, loader) {
  const pending = inFlightLoads.get(key);
  if (pending) {
    singleFlightJoins++;
    return pending;
  }
  // Phải xoá khỏi map trong `finally`, nếu không một lần lỗi sẽ khiến key bị kẹt
  // vĩnh viễn với một promise đã reject — mọi request sau đó cùng nhận lỗi đó.
  const promise = loader().finally(() => inFlightLoads.delete(key));
  inFlightLoads.set(key, promise);
  return promise;
}

/**
 * TTL có jitter (Bài 5, mục 5.3).
 *
 * Nếu mọi key được nạp cùng lúc (ví dụ ngay sau khi deploy) và cùng TTL, chúng sẽ hết hạn
 * cùng một thời điểm => một đợt miss đồng loạt đập vào database. Cộng thêm một lượng ngẫu
 * nhiên vào TTL để rải các thời điểm hết hạn ra.
 */
function ttlWithJitter(baseSec, ratio) {
  if (!(ratio > 0)) return baseSec;
  const delta = baseSec * ratio * (Math.random() * 2 - 1);
  return Math.max(1, Math.round(baseSec + delta));
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

    if (p === '/client-ip') {
      // Endpoint nay ton tai de CHUNG MINH mot lo hong that (Bai 4, muc 4.2).
      //
      // `X-Forwarded-For` la header do CLIENT co the tu dat. Neu app tin nguyen
      // chuoi do, bat ky ai cung gia duoc IP cua minh => vuot rate limit theo IP,
      // lam sai toan bo log/audit, va co the vuot ca IP allowlist.
      //
      // Cach doc DUNG: chi tin `TRUST_PROXY_HOPS` phan tu tinh TU BEN PHAI, vi
      // moi proxy tin cay se APPEND IP that cua chang truoc vao cuoi chuoi.
      const xff = req.headers['x-forwarded-for'] || '';
      const chain = xff
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      const hops = Number(process.env.TRUST_PROXY_HOPS || 0);
      let trusted;
      if (hops <= 0) {
        // Khong tin proxy nao: dung dia chi TCP that cua ket noi.
        trusted = req.socket.remoteAddress;
      } else if (chain.length >= hops) {
        trusted = chain[chain.length - hops];
      } else {
        // Chuoi ngan hon so hop khai bao => cau hinh sai hoac co ai dang gia mao.
        trusted = req.socket.remoteAddress;
      }
      return json(res, 200, {
        instance: INSTANCE,
        remoteAddress: req.socket.remoteAddress,
        xForwardedForRaw: xff || null,
        xForwardedForChain: chain,
        trustProxyHops: hops,
        // Day moi la IP duoc phep dung cho rate limit / log / allowlist.
        trustedClientIp: trusted,
        // Neu tin ca chuoi (CACH SAI) thi se ra IP nay - de doi chieu.
        naiveClientIp: chain[0] || req.socket.remoteAddress,
      });
    }

    if (p === '/aggregate') {
      // BFF/aggregation that: goi NHIEU dich vu phia sau roi gop ket qua.
      //
      // ?branches=50,120,200  do tre gia lap cua tung nhanh (ms)
      // ?mode=parallel|sequential
      //
      // Muc dich: do de CHUNG MINH cong thuc do tre cua fan-out (Bai 4, muc 4.4):
      //   song song  => tong ~= MAX(cac nhanh)
      //   tuan tu    => tong ~= SUM(cac nhanh)
      // Day la ly do mot gateway aggregation phai goi song song; goi tuan tu bien
      // 3 nhanh 100ms thanh 300ms ma khong ai o phia sau cham hon.
      const branches = (url.searchParams.get('branches') || '50,120,200')
        .split(',')
        .map((v) => Math.max(0, Math.min(5000, Number(v) || 0)))
        .slice(0, 8);
      const mode = url.searchParams.get('mode') === 'sequential' ? 'sequential' : 'parallel';
      const t0 = process.hrtime.bigint();

      // Moi nhanh la mot request HTTP THAT den /slow-async cua chinh instance nay,
      // nen chi phi socket + event loop deu that, khong phai setTimeout gia.
      const callBranch = (ms) =>
        new Promise((resolve) => {
          const b0 = process.hrtime.bigint();
          const r = http.get({ host: '127.0.0.1', port: PORT, path: `/slow-async?ms=${ms}`, agent: aggAgent }, (br) => {
            br.resume();
            br.on('end', () => resolve({ requestedMs: ms, elapsedMs: msSince(b0), status: br.statusCode }));
          });
          r.on('error', (e) => resolve({ requestedMs: ms, elapsedMs: msSince(b0), error: e.code }));
        });

      let results;
      if (mode === 'parallel') {
        results = await Promise.all(branches.map(callBranch));
      } else {
        results = [];
        for (const ms of branches) results.push(await callBranch(ms));
      }

      const totalMs = msSince(t0);
      return json(res, 200, {
        instance: INSTANCE,
        mode,
        branches,
        // Hai con so de doi chieu voi totalMs do duoc:
        maxBranchMs: Math.max(...branches),
        sumBranchMs: branches.reduce((a, b) => a + b, 0),
        totalMs: Number(totalMs.toFixed(2)),
        perBranch: results,
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
        dbQueries,
        singleFlightJoins,
        dbMaxQueueDepth,
        dbAvgWaitMs: dbQueries ? Number((dbWaitTotalMs / dbQueries).toFixed(2)) : 0,
        dbMaxConcurrency: DB_MAX_CONCURRENCY,
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

    if (p === '/reset-stats') {
      // Mỗi phép đo của Bài 5 phải bắt đầu từ số 0, nếu không con số dbQueries
      // sẽ lẫn cả các lần chạy trước.
      cacheHits = 0;
      cacheMisses = 0;
      dbQueries = 0;
      singleFlightJoins = 0;
      totalRequests = 0;
      dbWaitTotalMs = 0;
      dbMaxQueueDepth = 0;
      return json(res, 200, { ok: true, instance: INSTANCE });
    }

    if (p === '/uncached') {
      // Mốc so sánh: KHÔNG cache, mọi request đều xuống database.
      const key = url.searchParams.get('key') || 'k1';
      cacheMisses++;
      const fresh = await readFromDb(key);
      return json(res, 200, { ...fresh, cache: 'bypassed' });
    }

    if (p === '/cached') {
      // Cache-aside thật. Ba tham số để bạn tự bật/tắt từng cơ chế và ĐO chênh lệch:
      //   ?ttl=30       TTL cơ sở, giây. Đặt nhỏ (1-2s) để tái tạo thundering herd.
      //   ?flight=single  bật single-flight (mặc định: tắt, để thấy herd trước đã)
      //   ?jitter=0.2   cộng/trừ tối đa 20% vào TTL để rải thời điểm hết hạn
      const key = url.searchParams.get('key') || 'k1';
      const baseTtl = Math.max(1, Number(url.searchParams.get('ttl') || 30));
      const useSingleFlight = url.searchParams.get('flight') === 'single';
      const jitter = Number(url.searchParams.get('jitter') || 0);

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

      // Đây là chỗ DUY NHẤT khác nhau giữa "có herd" và "không herd".
      const load = async () => {
        const fresh = await readFromDb(key);
        try {
          await redis.cmd('SET', cacheKey, JSON.stringify(fresh), 'EX', String(ttlWithJitter(baseTtl, jitter)));
        } catch {
          /* không ghi được cache thì bỏ qua, đừng làm request thất bại */
        }
        return fresh;
      };
      const fresh = useSingleFlight ? await singleFlight(cacheKey, load) : await load();
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
