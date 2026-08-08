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
 *   GET /cacheable     → phát header cache cho tầng edge; ETag/304, Vary (Bài 6)
 *   GET /shard?key=&mode= → router theo shard key; so shard key tốt vs lệch (Bài 8)
 *   GET /charge?key=&idem= → trừ tiền có/không idempotency key (Bài 11)
 *   GET /limited?user=  → như /fast nhưng qua rate limiter token bucket; so p99 với
 *                        /fast ra chi phí limiter, hạ RATE_LIMIT xuống thì thấy 429 (Bài 13)
 *   GET /chain?mode=   → cùng N bước việc, chạy trong tiến trình (mono) hay qua N hop
 *                        HTTP (micro); ?fail= để thấy độ khả dụng nhân dồn (Bài 15)
 *   GET /saga?failAt=  → saga 3 service, ?compensate=0 để thấy dữ liệu lệch (Bài 15)
 *   GET /metrics       → histogram RED tự viết; METRIC_LABELS quyết định cardinality (Bài 16)
 *   GET /trace?id=     → waterfall các chặng của một correlation ID (Bài 16)
 *   GET /incident?p=   → đa số nhanh, một tỉ lệ nhỏ rất chậm — hình dạng mà trung bình che đi
 *   GET /traced-chain  → chuỗi hop CÓ truyền correlation ID; ?propagate=0 để thấy trace đứt
 *   GET /layer?depth=&retries= → chuỗi N tầng, mỗi tầng thử lại R lần: đo retry
 *                        amplification thật; ?budget=1 để bật retry budget (Bài 17)
 *   GET /leaf          → service tận cùng, chỉ đếm số lần bị gọi (Bài 17)
 *   GET /rww?id=&pin=  → ghi primary rồi đọc ngay replica: tái tạo bug read-your-writes,
 *                        và bật/tắt cơ chế ghim-về-primary để kiểm chứng bản vá (Bài 7)
 *
 * Biến môi trường: PORT, INSTANCE, REDIS_URL, DB_DELAY_MS, DB_MAX_CONCURRENCY, GRACEFUL,
 *                  TRUST_PROXY_HOPS, PG_PRIMARY, PG_REPLICA, READ_PIN_MS, PG_SHARDS,
 *                  RATE_LIMIT, RATE_WINDOW_MS, PEERS, PEERS_SAGA, METRIC_LABELS, TRACE_MAX
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
// Bài 7: hai đích khác nhau cho ghi và đọc. Nếu không đặt thì phần /rww bị tắt.
const PG_PRIMARY = process.env.PG_PRIMARY || '';
const PG_REPLICA = process.env.PG_REPLICA || '';
// Sau khi một người dùng GHI, ghim lệnh ĐỌC của chính họ về primary trong bao nhiêu ms.
// 0 = tắt (để thấy bug trước đã).
const READ_PIN_MS = Number(process.env.READ_PIN_MS || 0);
// Bài 8: danh sách shard, phân tách bằng dấu phẩy. Thứ tự QUAN TRỌNG với modulo hashing —
// đổi thứ tự là đổi toàn bộ ánh xạ key → shard.
const PG_SHARDS = (process.env.PG_SHARDS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const GRACEFUL = process.env.GRACEFUL !== '0';

let healthy = true;
let inFlight = 0;
let totalRequests = 0;
let cacheHits = 0;
let dbQueries = 0;
let singleFlightJoins = 0;
let dbWaitTotalMs = 0;
let rwwTotal = 0;
let rwwStale = 0;
let rwwPinned = 0;
let chargeCreated = 0;
let chargeReplays = 0;
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
// Bài 13 — rate limiter token bucket
//
// Chỉ token bucket, không phải cả bốn thuật toán: bốn bản đầy đủ nằm ở
// `worker/ratelimit.js` để so sánh cạnh nhau, còn ở đây ta cần đúng một thuật toán
// để đo CHI PHÍ mà limiter cộng vào đường đi của request thật. Token bucket là lựa
// chọn mặc định hợp lý cho API: cho phép burst nhưng burst bị chặn trên bởi sức chứa.
//
// Toàn bộ "đọc số token - tính lượng rót thêm - quyết định - ghi lại" nằm trong MỘT
// script Lua, vì ba app replica cùng chạm một khoá: tách ra nhiều lệnh là mở cửa cho
// hai replica cùng đọc "còn 1 token" rồi cùng cho qua.
// ---------------------------------------------------------------------------
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 0);
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS || 1000);
const RATE_LIMIT_ON = RATE_LIMIT > 0;
let rateAllowed = 0;
let rateLimited = 0;

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
  return '0|0|' .. math.ceil((1 - tokens) * win / cap)
end
tokens = tokens - 1
redis.call('HSET', k, 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', k, win * 2)
return '1|' .. math.floor(tokens) .. '|0'`;

let rateSha = null;

/** Trả { allowed, remaining, retryAfterMs } cho một chiều giới hạn (ở đây: theo user). */
async function rateLimit(who) {
  // SCRIPT LOAD một lần rồi EVALSHA: gửi lại toàn bộ script mỗi request là tự cộng
  // vài trăm byte vào mọi lời gọi, và chi phí đó nằm đúng trên đường đi nóng nhất.
  if (!rateSha) rateSha = await redis.cmd('SCRIPT', 'LOAD', RATE_LUA);
  const out = await redis.cmd('EVALSHA', rateSha, '1', `lab:rl:app:${who}`, String(RATE_LIMIT), String(RATE_WINDOW_MS));
  const [a, rem, retry] = String(out).split('|');
  return { allowed: a === '1', remaining: Number(rem), retryAfterMs: Number(retry) };
}

// ---------------------------------------------------------------------------
// Bài 7 — router đọc/ghi
// ---------------------------------------------------------------------------
const { PgPool } = require('./minipg');
const pgPrimary = PG_PRIMARY ? new PgPool({ host: PG_PRIMARY }, 6) : null;
const pgReplica = PG_REPLICA ? new PgPool({ host: PG_REPLICA }, 6) : null;

/**
 * Bảng ghim: id người dùng -> thời điểm hết ghim.
 *
 * GIỚI HẠN PHẢI BIẾT (và bài học đo được ở mục 7.3): bảng này nằm trong bộ nhớ của MỘT
 * replica app. Nếu request ghi đi vào app1 mà request đọc kế tiếp đi vào app2 thì app2
 * không biết gì về lệnh ghi đó và vẫn đọc replica — bug quay lại. Muốn đúng thì trạng
 * thái ghim phải nằm ở chỗ dùng chung (cookie của chính người dùng, hoặc Redis).
 */
const readPin = new Map();

// ---------------------------------------------------------------------------
// Bài 8 — shard router
// ---------------------------------------------------------------------------
const pgShards = PG_SHARDS.map((host) => new PgPool({ host }, 4));
const shardHits = new Array(pgShards.length).fill(0);

// FNV-1a rồi trộn bằng fmix32 của MurmurHash3. Vì sao cần bước trộn: FNV-1a có avalanche
// kém với chuỗi ngắn và giống nhau ('user:1', 'user:2'...), nên các key liên tiếp rơi vào
// cùng shard theo cụm. Bước fmix32 rẻ và xoá hẳn hiện tượng đó.
function shardHash(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

function pickShard(shardKey) {
  return shardHash(String(shardKey)) % pgShards.length;
}

function shouldReadPrimary(id, now) {
  if (READ_PIN_MS <= 0) return false;
  const until = readPin.get(id);
  if (until === undefined) return false;
  if (until <= now) {
    readPin.delete(id);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Block the event loop for `ms` — simulates a heavy synchronous handler. */
function blockFor(ms) {
  const until = Date.now() + ms;
  // Busy loop: does NOT yield to the event loop, so every other request queues up.
  while (Date.now() < until) {
    /* burning CPU on purpose */
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
// Bài 15 — monolith vs microservices
//
// Toàn bộ bài học nằm ở chỗ: CÙNG một lượng công việc (`doUnitOfWork`) được gọi theo
// hai cách. Gọi trong tiến trình thì chi phí gọi gần bằng 0; gọi qua HTTP thì mỗi lần
// cộng thêm một vòng mạng, một lần serialize, một lần parse — và một xác suất hỏng.
// ---------------------------------------------------------------------------
const PEERS = (process.env.PEERS || 'app1:3000,app2:3000,app3:3000').split(',').filter(Boolean);
// Ba service của saga được GHIM vào ba instance cố định, vì mỗi service phải sở hữu
// dữ liệu của riêng nó. Nếu để round-robin thì trạng thái `order` nằm rải ở cả ba
// tiến trình và không còn ranh giới service nào cả.
const PEERS_SAGA = (process.env.PEERS_SAGA || 'app1:3000,app2:3000,app3:3000').split(',').filter(Boolean);
const sagaAgent = new http.Agent({ keepAlive: true, maxSockets: 64 });
const sagaState = { order: 0, payment: 0, inventory: 0 };
let sagaCompleted = 0;
let sagaFailed = 0;
let sagaCompensations = 0;
let stepFailures = 0;

/**
 * Một đơn vị công việc xác định: `w` vòng lặp số học.
 *
 * Cố ý dùng việc TỐN CPU chứ không phải `sleep`: nếu mỗi bước chỉ là một khoảng chờ
 * thì chi phí thật của việc tách service bị chìm mất trong khoảng chờ đó, và phép đo
 * sẽ cho kết luận sai theo hướng có lợi cho microservices.
 */
function doUnitOfWork(w) {
  let acc = 0;
  for (let i = 0; i < w; i++) acc = (acc + Math.imul(i ^ acc, 2654435761)) >>> 0;
  return acc;
}

/** Gọi peer và đọc luôn JSON trả về (dùng cho bộ thu gom span ở Bài 16). */
function fetchPeerJson(peer, path) {
  const [host, port] = peer.split(':');
  return new Promise((resolve) => {
    const r = http.get({ host, port: Number(port || 3000), path, agent: sagaAgent }, (pr) => {
      let b = '';
      pr.on('data', (c) => (b += c));
      pr.on('end', () => {
        try {
          resolve(JSON.parse(b));
        } catch {
          resolve(null);
        }
      });
    });
    r.on('error', () => resolve(null));
  });
}

/**
 * Gọi một instance khác qua HTTP. Trả { ok, status }.
 *
 * Tham số `corrId` là toàn bộ phần "distributed" của distributed tracing: chỉ cần một
 * header đi kèm thì chặng sau ghi span vào ĐÚNG trace của request gốc. Bỏ nó đi thì
 * mỗi chặng thành một trace riêng lẻ và waterfall không bao giờ dựng lại được.
 */
function callPeer(peer, path, corrId) {
  const [host, port] = peer.split(':');
  const headers = corrId ? { 'X-Correlation-Id': corrId } : {};
  return new Promise((resolve) => {
    const r = http.get({ host, port: Number(port || 3000), path, agent: sagaAgent, headers }, (pr) => {
      pr.resume();
      pr.on('end', () => resolve({ ok: pr.statusCode >= 200 && pr.statusCode < 300, status: pr.statusCode }));
    });
    // Lỗi kết nối cũng là một dạng thất bại của bước — và nó CHỈ tồn tại ở kiến trúc
    // tách service. Gọi hàm trong cùng tiến trình không có chế độ lỗi này.
    r.on('error', () => resolve({ ok: false, status: 0 }));
  });
}

// ---------------------------------------------------------------------------
// Bài 16 — observability: metrics, correlation ID, tracing
//
// Ba trụ cột được cài ở đây đúng theo thứ tự chi phí tăng dần: metrics (rẻ nhất,
// tổng hợp sẵn), log có cấu trúc (đắt hơn, một dòng mỗi request), trace (đắt nhất,
// một bản ghi cho mỗi chặng). Cả ba tự viết, không thư viện, để thấy rõ chỗ nào tốn.
// ---------------------------------------------------------------------------

// Vành đai histogram cố định (đơn vị ms). Vì sao histogram chứ không phải trung bình:
// từ histogram tính được percentile, còn từ trung bình thì KHÔNG — và Bài 1 đã chứng
// minh trung bình che mất chính thứ người dùng cảm nhận.
const HIST_BUCKETS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, Infinity];

// Nhãn nào được đưa vào khoá chuỗi thời gian. 'route' là an toàn (số route hữu hạn).
// Thêm 'user' để TÁI TẠO vụ nổ cardinality ở mục 16.2 — mỗi người dùng thành một
// chuỗi thời gian riêng.
const METRIC_LABELS = (process.env.METRIC_LABELS || 'route,status').split(',').filter(Boolean);

const metrics = new Map(); // khoá chuỗi thời gian -> { count, sumMs, buckets }

function observe(labels, ms) {
  const key = METRIC_LABELS.map((l) => `${l}=${labels[l] ?? '-'}`).join('|');
  let s = metrics.get(key);
  if (!s) {
    s = { count: 0, sumMs: 0, buckets: new Array(HIST_BUCKETS.length).fill(0) };
    metrics.set(key, s);
  }
  s.count++;
  s.sumMs += ms;
  for (let i = 0; i < HIST_BUCKETS.length; i++) {
    if (ms <= HIST_BUCKETS[i]) {
      s.buckets[i]++;
      break;
    }
  }
}

/** Percentile suy ra TỪ HISTOGRAM (nội suy tuyến tính trong vành đai) — cách các hệ metrics thật làm. */
function histPercentile(s, p) {
  const target = (p / 100) * s.count;
  let cum = 0;
  for (let i = 0; i < HIST_BUCKETS.length; i++) {
    const prev = cum;
    cum += s.buckets[i];
    if (cum >= target) {
      const lo = i === 0 ? 0 : HIST_BUCKETS[i - 1];
      const hi = HIST_BUCKETS[i] === Infinity ? lo * 2 : HIST_BUCKETS[i];
      const frac = s.buckets[i] === 0 ? 0 : (target - prev) / s.buckets[i];
      return Number((lo + (hi - lo) * frac).toFixed(2));
    }
  }
  return 0;
}

// Trace: mỗi correlation ID giữ danh sách span. Ring buffer giới hạn, vì giữ mọi trace
// trong bộ nhớ là cách nhanh nhất để chính hệ giám sát giết chết ứng dụng.
const TRACE_MAX = Number(process.env.TRACE_MAX || 200);
const traces = new Map();
let tracesDropped = 0;

function addSpan(corrId, span) {
  if (!corrId) return;
  if (!traces.has(corrId)) {
    if (traces.size >= TRACE_MAX) {
      traces.delete(traces.keys().next().value);
      tracesDropped++;
    }
    traces.set(corrId, []);
  }
  traces.get(corrId).push(span);
}

/**
 * Correlation ID sinh ở chặng ĐẦU TIÊN rồi truyền đi khắp nơi.
 *
 * Điểm mấu chốt: nếu một chặng nào đó quên truyền tiếp, trace đứt tại đúng chỗ đó —
 * và chỗ hay quên nhất là ranh giới bất đồng bộ (queue), tức là chỗ khó debug nhất.
 */
function corrIdOf(req) {
  return req.headers['x-correlation-id'] || `c-${INSTANCE}-${Date.now().toString(36)}-${(corrSeq++).toString(36)}`;
}
let corrSeq = 0;

// ---------------------------------------------------------------------------
// Bài 17 — bộ đếm cho chuỗi nhiều tầng và retry budget
// ---------------------------------------------------------------------------
let leafHits = 0;
let leafErrors = 0;
let retryCount = 0;
let retryBudgetDenied = 0;
let abandonedResponses = 0;

// Retry budget: giữ dấu thời gian của các lần gọi gần đây để tính TỈ LỆ retry.
// Ngưỡng 10% là con số hay dùng trong thực tế: đủ để chịu lỗi lẻ tẻ, không đủ để
// biến một sự cố nhỏ thành một cơn bão retry.
const RETRY_BUDGET_RATIO = Number(process.env.RETRY_BUDGET_RATIO || 0.1);
const retryWindow = []; // { t, retry } cho MỌI lần gọi, không chỉ lần thử lại

/** Ghi nhận một lần gọi vào cửa sổ 5 giây. `isRetry` phân biệt lần đầu và lần thử lại. */
function recordAttempt(isRetry) {
  const now = Date.now();
  while (retryWindow.length && now - retryWindow[0].t > 5000) retryWindow.shift();
  retryWindow.push({ t: now, retry: isRetry });
}

/**
 * Có được phép thử lại nữa không.
 *
 * Điểm khác biệt so với "tối đa N lần": giới hạn theo TỈ LỆ trên tổng lưu lượng. Khi
 * mọi thứ bình thường, vài lỗi lẻ tẻ vẫn được thử lại thoải mái. Khi toàn hệ đang
 * hỏng, tỉ lệ retry vọt lên và budget đóng cửa — tổng lượng retry bị chặn thay vì
 * nhân lên theo số tầng.
 */
function retryBudgetAllows() {
  const now = Date.now();
  while (retryWindow.length && now - retryWindow[0].t > 5000) retryWindow.shift();
  if (retryWindow.length < 20) return true; // chưa đủ mẫu để kết luận
  const retries = retryWindow.filter((e) => e.retry).length;
  return retries / retryWindow.length < RETRY_BUDGET_RATIO;
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  totalRequests++;
  inFlight++;
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;
  const reqT0 = process.hrtime.bigint();
  const corrId = corrIdOf(req);
  // Trả lại cho client để họ đính kèm ID này khi báo lỗi — một dòng code, tiết kiệm
  // hàng giờ dò log sau này.
  res.setHeader('X-Correlation-Id', corrId);
  // Bài 17: client bỏ đi TRƯỚC khi ta trả lời xong = toàn bộ công đã làm là công toi.
  // Đây là thứ không dashboard nào mặc định đo, vì nhìn từ phía server thì "request
  // hoàn tất bình thường".
  let clientGone = false;
  res.on('close', () => {
    if (!res.writableFinished) {
      clientGone = true;
      abandonedResponses++;
    }
  });

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

    if (p === '/cacheable') {
      // Endpoint nay ton tai de tang edge (nginx proxy_cache) co thu ma cache (Bai 6).
      //
      // ?ttl=60          gia tri max-age / s-maxage
      // ?vary=cookie     them `Vary: Cookie` — de CHUNG MINH no bam nho cache
      // ?etag=0          tat ETag (mac dinh bat) de so co/khong revalidation
      // ?private=1       Cache-Control: private => tang edge KHONG duoc cache
      // ?immutable=1     max-age dai + immutable, kieu asset co hash trong ten file
      const ttl = Math.max(0, Number(url.searchParams.get('ttl') || 60));
      const wantEtag = url.searchParams.get('etag') !== '0';
      const isPrivate = url.searchParams.get('private') === '1';
      const immutable = url.searchParams.get('immutable') === '1';
      const vary = url.searchParams.get('vary') || '';

      // Noi dung PHAI on dinh theo key, neu khong ETag doi moi lan va revalidation
      // se khong bao gio tra 304 — mot loi rat de mac phai.
      const key = url.searchParams.get('key') || 'doc1';
      const body = JSON.stringify({ key, value: `noi dung on dinh cua ${key}`, servedBy: INSTANCE });
      // ETag yeu, tinh tu chinh noi dung. Dung hash don gian de khong can dependency.
      let h = 2166136261;
      for (let i = 0; i < body.length; i++) {
        h ^= body.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      const etag = `"${(h >>> 0).toString(16)}"`;

      const headers = { 'Content-Type': 'application/json; charset=utf-8', 'X-Instance': INSTANCE };
      if (immutable) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      else if (isPrivate) headers['Cache-Control'] = `private, max-age=${ttl}`;
      else headers['Cache-Control'] = `public, max-age=${ttl}, s-maxage=${ttl}`;
      if (wantEtag) headers['ETag'] = etag;
      if (vary) headers['Vary'] = vary === 'cookie' ? 'Cookie' : vary;

      // Revalidation: client/edge gui lai ETag da co. Neu con dung thi tra 304 KHONG BODY.
      const inm = req.headers['if-none-match'];
      if (wantEtag && inm && inm.split(',').some((v) => v.trim() === etag)) {
        res.writeHead(304, headers);
        return res.end();
      }

      // Cho tre nhe de thay ro chenh lech giua MISS (co cho) va HIT (khong cho).
      await sleep(Number(url.searchParams.get('originMs') || 30));
      headers['Content-Length'] = Buffer.byteLength(body);
      res.writeHead(200, headers);
      return res.end(body);
    }

    if (p === '/rww') {
      // Reproduces exactly one bug: the user changes their avatar (WRITE to the primary)
      // then reloads the page (READ from the replica) and sees the OLD avatar. That is a
      // read-your-writes violation.
      //
      // ?id=N     the row to write/read (default: random in 1..1000)
      // ?pin=1    use the pin-to-primary mechanism, if READ_PIN_MS > 0
      if (!pgPrimary || !pgReplica) {
        return json(res, 503, { error: 'PG_PRIMARY / PG_REPLICA not set' });
      }
      const id = Number(url.searchParams.get('id') || 1 + Math.floor(Math.random() * 1000));
      const usePin = url.searchParams.get('pin') !== '0';
      const now = Date.now();

      // 1) WRITE to the primary. RETURNING tells us exactly which version we just wrote.
      const wrote = await pgPrimary.query(
        `UPDATE profiles SET avatar = 'avatar-v' || (version + 1) || '.png',
                             version = version + 1, updated_at = now()
         WHERE id = ${id} RETURNING version`
      );
      const wroteVersion = Number(wrote[0] && wrote[0].version);
      if (usePin && READ_PIN_MS > 0) readPin.set(id, Date.now() + READ_PIN_MS);

      // 2) READ IMMEDIATELY. This is the decisive moment: the replica may not have caught up.
      const pinned = usePin && shouldReadPrimary(id, Date.now());
      if (pinned) rwwPinned++;
      const target = pinned ? pgPrimary : pgReplica;
      const read = await target.query(`SELECT version, avatar FROM profiles WHERE id = ${id}`);
      const readVersion = Number(read[0] && read[0].version);

      rwwTotal++;
      // "Stale" is MEASURABLE, not a feeling: reading a version LOWER than the one we
      // just wrote is not open to argument.
      const stale = readVersion < wroteVersion;
      if (stale) rwwStale++;

      return json(res, 200, {
        instance: INSTANCE,
        id,
        wroteVersion,
        readVersion,
        readFrom: pinned ? 'primary' : 'replica',
        stale,
        lostVersions: stale ? wroteVersion - readVersion : 0,
      });
    }

    if (p === '/shard') {
      // ?key=...      gia tri dung lam SHARD KEY
      // ?mode=good    shard key = chinh key (cardinality cao, phan bo deu)
      // ?mode=skew    shard key = mot gia tri gan nhu khong doi => moi thu don vao 1 shard,
      //               mo phong "shard theo tenant khi co mot tenant khong lo" hoac
      //               "shard theo ngay khi moi ghi deu la hom nay"
      if (pgShards.length === 0) return json(res, 503, { error: 'chua dat PG_SHARDS' });
      const key = url.searchParams.get('key') || 'k0';
      const mode = url.searchParams.get('mode') === 'skew' ? 'skew' : 'good';
      // Voi mode=skew, 95% request dung CUNG mot shard key.
      const shardKey = mode === 'skew' ? (shardHash(key) % 100 < 95 ? 'tenant-khong-lo' : key) : key;
      const idx = pickShard(shardKey);
      shardHits[idx]++;
      const id = 1 + (shardHash(key) % 1000);
      const rows = await pgShards[idx].query(
        `UPDATE profiles SET version = version + 1 WHERE id = ${id} RETURNING id, version`
      );
      return json(res, 200, {
        instance: INSTANCE,
        shardKey,
        shard: PG_SHARDS[idx],
        shardIndex: idx,
        row: rows[0] || null,
      });
    }

    if (p === '/charge') {
      // Tru tien mot lan. ?idem=1 dung idempotency key, ?idem=0 thi khong.
      //
      // Diem quan trong nhat: CA hai viec — ghi bang dedup VA tru so du — nam trong
      // MOT cau lenh SQL duy nhat. Postgres chay mot cau lenh trong mot transaction ngam,
      // nen khong ton tai cua so nao cho hai request song song cung lot qua (muc 11.3).
      if (!pgPrimary) return json(res, 503, { error: 'chua dat PG_PRIMARY' });
      const useIdem = url.searchParams.get('idem') !== '0';
      const amount = Math.max(1, Number(url.searchParams.get('amount') || 100));
      // Khong co idempotency key thi moi lan thu la mot "y dinh" moi => key ngau nhien.
      // Day chinh la hanh vi cua `POST /orders` khong kem key.
      const key = useIdem
        ? String(url.searchParams.get('key') || 'idem-demo')
        : `no-idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      // minipg khong tham so hoa duoc, nen phai tu lam sach. Chi cho phep ky tu an toan.
      const safeKey = key.replace(/[^A-Za-z0-9:_-]/g, '').slice(0, 120) || 'k';

      // CTE: `ins` co gang ghi ban ghi dedup. ON CONFLICT DO NOTHING nghia la neu key da
      // ton tai thi khong ghi gi va `ins` rong. `upd` chi tru so du KHI `ins` co dong —
      // tuc la chi lan DAU TIEN moi co hieu ung nghiep vu.
      // Cau SELECT cuoi tra ve ket qua moi (created=true) hoac ket qua DA LUU (false).
      const sql = `
        WITH ins AS (
          INSERT INTO charges (idem_key, amount, response)
          VALUES ('${safeKey}', ${amount}, 'charge-ok-' || ${amount})
          ON CONFLICT (idem_key) DO NOTHING
          RETURNING id, amount, response
        ), upd AS (
          UPDATE balances SET balance = balance - ${amount}
          WHERE id = 1 AND EXISTS (SELECT 1 FROM ins)
          RETURNING balance
        )
        SELECT id, amount, response, 'true' AS created FROM ins
        UNION ALL
        SELECT c.id, c.amount, c.response, 'false' FROM charges c
        WHERE c.idem_key = '${safeKey}' AND NOT EXISTS (SELECT 1 FROM ins)`;

      const rows = await pgPrimary.query(sql);
      const row = rows[0] || null;
      const replay = row && row.created === 'false';
      if (replay) chargeReplays++;
      else chargeCreated++;
      return json(res, replay ? 200 : 201, {
        instance: INSTANCE,
        idempotencyKey: useIdem ? safeKey : null,
        chargeId: row && row.id,
        amount: row && Number(row.amount),
        // Tra lai CHINH ket qua da luu, khong phai mot 200 rong (muc 11.2).
        response: row && row.response,
        replayed: Boolean(replay),
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
        rwwTotal,
        rwwStale,
        rwwPinned,
        rwwStaleRatio: rwwTotal ? Number((rwwStale / rwwTotal).toFixed(4)) : null,
        readPinMs: READ_PIN_MS,
        chargeCreated,
        chargeReplays,
        shards: PG_SHARDS,
        shardHits,
        cacheMisses,
        hitRatio: cacheHits + cacheMisses === 0 ? null : cacheHits / (cacheHits + cacheMisses),
        rateLimit: RATE_LIMIT_ON ? RATE_LIMIT : null,
        rateAllowed,
        rateLimited,
        sagaState,
        sagaCompleted,
        sagaFailed,
        sagaCompensations,
        stepFailures,
      });
    }

    if (p === '/fast') {
      return json(res, 200, { ok: true, instance: INSTANCE });
    }

    // -----------------------------------------------------------------------
    // Bài 16 — observability
    // -----------------------------------------------------------------------
    if (p === '/metrics') {
      // Trả về đúng những gì một hệ metrics thật giữ: mỗi tổ hợp nhãn là MỘT chuỗi
      // thời gian, và mỗi chuỗi tốn bộ nhớ riêng. `soChuoiThoiGian` chính là con số
      // làm sập hệ giám sát khi bạn đặt nhầm nhãn (mục 16.2).
      const out = [];
      let bytes = 0;
      for (const [key, s] of metrics) {
        bytes += key.length * 2 + 8 * (HIST_BUCKETS.length + 2);
        out.push({
          series: key,
          count: s.count,
          // RED: Rate - Errors - Duration. Cả ba đều suy được từ chính histogram này.
          meanMs: Number((s.sumMs / s.count).toFixed(3)),
          p50: histPercentile(s, 50),
          p99: histPercentile(s, 99),
          p999: histPercentile(s, 99.9),
        });
      }
      out.sort((a, b) => b.count - a.count);

      // SLI tính TỪ HISTOGRAM: tỉ lệ "sự kiện tốt" trên tổng sự kiện, trong đó "tốt"
      // nghĩa là request thành công và dưới ngưỡng thời gian. Đây đúng là cách các hệ
      // thật tính SLI — và nó chỉ làm được nhờ có histogram, không làm được từ trung bình.
      const sloMs = Number(url.searchParams.get('sloMs') || 250);
      const sloTarget = Number(url.searchParams.get('sloTarget') || 99.9);
      let good = 0;
      let total = 0;
      for (const [key, s] of metrics) {
        if (!key.includes('route=/metrics')) {
          total += s.count;
          const isErr = key.includes('status=5');
          for (let i = 0; i < HIST_BUCKETS.length; i++) {
            if (!isErr && HIST_BUCKETS[i] <= sloMs) good += s.buckets[i];
          }
        }
      }
      const sli = total ? (good / total) * 100 : null;

      return json(res, 200, {
        instance: INSTANCE,
        labels: METRIC_LABELS,
        soChuoiThoiGian: metrics.size,
        uocLuongBytes: bytes,
        bytesMoiChuoi: metrics.size ? Math.round(bytes / metrics.size) : 0,
        slo: {
          nguongMs: sloMs,
          mucTieu: sloTarget,
          sli: sli === null ? null : Number(sli.toFixed(3)),
          // Error budget là phần "được phép hỏng". Đốt hết budget nghĩa là phải dừng
          // ship tính năng để đi vá độ tin cậy — nó biến độ tin cậy thành một con số
          // có thể ra quyết định, thay vì một cuộc tranh luận.
          budgetDaDot: sli === null ? null : Number((((sloTarget - sli) / (100 - sloTarget)) * 100).toFixed(1)) + '%',
          datSlo: sli === null ? null : sli >= sloTarget,
        },
        top: out.slice(0, Number(url.searchParams.get('top') || 8)),
      });
    }

    // -----------------------------------------------------------------------
    // Bài 17 — chế độ lỗi & khả năng chống chịu
    // -----------------------------------------------------------------------
    if (p === '/leaf') {
      // Service tận cùng của chuỗi — nơi hứng toàn bộ lưu lượng khuếch đại. Nó chỉ
      // đếm, không làm gì khác, để con số đếm được là con số sạch.
      leafHits++;
      const fail = Number(url.searchParams.get('fail') || 0);
      const ms = Number(url.searchParams.get('ms') || 0);
      if (ms > 0) await sleep(ms);
      if (fail > 0 && Math.random() < fail) {
        leafErrors++;
        return json(res, 503, { ok: false, instance: INSTANCE });
      }
      return json(res, 200, { ok: true, instance: INSTANCE, leafHits });
    }

    if (p === '/layer') {
      // Một tầng trong chuỗi. Mỗi tầng thử lại `retries` lần khi tầng dưới lỗi — nghe
      // rất hợp lý khi nhìn riêng một tầng, và đó chính là lý do retry amplification
      // luôn xảy ra: KHÔNG AI nhìn thấy tích của cả chuỗi (mục 17.1).
      const depth = Math.max(1, Math.min(5, Number(url.searchParams.get('depth') || 3)));
      const retries = Math.max(1, Math.min(5, Number(url.searchParams.get('retries') || 3)));
      const fail = url.searchParams.get('fail') || '1';
      const budget = url.searchParams.get('budget') === '1';
      const next =
        depth > 1
          ? `/layer?depth=${depth - 1}&retries=${retries}&fail=${fail}&budget=${budget ? 1 : 0}`
          : `/leaf?fail=${fail}`;
      const peer = PEERS[(depth - 1) % PEERS.length];

      let lastStatus = 0;
      for (let attempt = 1; attempt <= retries; attempt++) {
        // Retry budget: chỉ cho phép thử lại khi tỉ lệ retry gần đây còn dưới ngưỡng.
        // Khác biệt then chốt so với "retry tối đa N lần": giới hạn theo TỈ LỆ nên khi
        // toàn hệ đang hỏng, tổng lượng retry bị chặn lại thay vì nhân lên.
        if (budget && attempt > 1 && !retryBudgetAllows()) {
          retryBudgetDenied++;
          break;
        }
        recordAttempt(attempt > 1);
        if (attempt > 1) retryCount++;
        const r = await callPeer(peer, next, corrId);
        lastStatus = r.status;
        if (r.ok) return json(res, 200, { ok: true, depth, attempt, instance: INSTANCE });
      }
      return json(res, 503, { ok: false, depth, retries, lastStatus, instance: INSTANCE });
    }

    if (p === '/leaf-stats') {
      return json(res, 200, {
        instance: INSTANCE,
        leafHits,
        leafErrors,
        retryCount,
        retryBudgetDenied,
        // Response đã sinh ra xong nhưng client đã bỏ đi từ trước — công toi hoàn toàn.
        abandonedResponses,
      });
    }

    if (p === '/leaf-reset') {
      leafHits = 0;
      leafErrors = 0;
      retryCount = 0;
      retryBudgetDenied = 0;
      abandonedResponses = 0;
      retryWindow.length = 0;
      return json(res, 200, { ok: true, instance: INSTANCE });
    }

    if (p === '/metrics-reset') {
      metrics.clear();
      traces.clear();
      tracesDropped = 0;
      return json(res, 200, { ok: true, instance: INSTANCE });
    }

    if (p === '/trace') {
      // Không có id thì liệt kê các trace đang giữ; có id thì trả waterfall.
      const id = url.searchParams.get('id');
      if (!id) {
        return json(res, 200, {
          instance: INSTANCE,
          soTraceDangGiu: traces.size,
          traceBiBo: tracesDropped,
          ids: [...traces.keys()].slice(-10),
        });
      }
      const spans = traces.get(id) || [];
      return json(res, 200, {
        correlationId: id,
        soChang: spans.length,
        // Waterfall: chặng nào ăn hết thời gian hiện ra ngay, không phải đoán.
        spans,
        tongMs: Number(spans.reduce((a, b) => a + b.ms, 0).toFixed(3)),
      });
    }

    if (p === '/trace-all') {
      // Span nằm rải trong bộ nhớ của TỪNG service — không chỗ nào tự nhiên nhìn thấy
      // toàn bộ. Vì thế mọi hệ tracing thật đều cần một bộ THU GOM. Ở đây instance này
      // đóng vai thu gom bằng cách hỏi từng peer rồi ghép lại theo thứ tự thời gian.
      const id = url.searchParams.get('id');
      const all = [];
      for (const peer of PEERS) {
        const r = await fetchPeerJson(peer, `/trace?id=${encodeURIComponent(id)}`);
        for (const s of (r && r.spans) || []) all.push({ ...s, peer });
      }
      all.sort((a, b) => b.ms - a.ms);
      const tong = all.reduce((a, b) => a + b.ms, 0);
      return json(res, 200, {
        correlationId: id,
        soChang: all.length,
        // Sắp theo thời gian giảm dần: chặng đầu tiên trong danh sách chính là thủ phạm.
        spans: all.map((s) => ({ ...s, phanTram: tong ? Number(((s.ms / tong) * 100).toFixed(1)) : 0 })),
        tongMs: Number(tong.toFixed(3)),
      });
    }

    if (p === '/incident') {
      // Endpoint tái tạo một sự cố THẬT có hình dạng điển hình: đại đa số request
      // nhanh, một tỉ lệ nhỏ rất chậm. Đây là hình dạng mà trung bình che đi hoàn toàn.
      const rate = Number(url.searchParams.get('p') || 0.01);
      const slowMs = Number(url.searchParams.get('ms') || 300);
      if (Math.random() < rate) {
        await sleep(slowMs);
        return json(res, 200, { ok: true, slow: true, instance: INSTANCE });
      }
      return json(res, 200, { ok: true, slow: false, instance: INSTANCE });
    }

    if (p === '/traced-chain') {
      // Như /chain mode=micro nhưng CÓ truyền correlation ID sang từng chặng, nên
      // /trace?id=... dựng lại được toàn bộ waterfall. Đặt ?propagate=0 để thấy trace
      // đứt đúng tại chặng đầu tiên — mục 16.3.
      const hops = Math.max(1, Math.min(6, Number(url.searchParams.get('hops') || 3)));
      const slowHop = Number(url.searchParams.get('slowHop') || 0);
      const propagate = url.searchParams.get('propagate') !== '0';
      for (let i = 0; i < hops; i++) {
        const peer = PEERS[i % PEERS.length];
        const ms = i + 1 === slowHop ? Number(url.searchParams.get('slowMs') || 200) : 5;
        await callPeer(peer, `/slow-async?ms=${ms}`, propagate ? corrId : null);
      }
      return json(res, 200, { ok: true, correlationId: corrId, hops, propagate });
    }

    // -----------------------------------------------------------------------
    // Bài 15 — cùng một use case, hai kiến trúc
    // -----------------------------------------------------------------------
    if (p === '/step') {
      // Một "service" lá: làm đúng `w` đơn vị việc rồi trả lời. Đây là đơn vị công việc
      // dùng chung cho CẢ HAI kiến trúc, nên chênh lệch đo được KHÔNG đến từ việc một
      // bên làm nhiều việc hơn — nó chỉ đến từ chỗ việc đó được gọi như thế nào.
      const w = Number(url.searchParams.get('w') || 0);
      const fail = Number(url.searchParams.get('fail') || 0);
      const out = doUnitOfWork(w);
      if (fail > 0 && Math.random() < fail) {
        stepFailures++;
        return json(res, 500, { ok: false, instance: INSTANCE, loi: 'step_failed' });
      }
      return json(res, 200, { ok: true, instance: INSTANCE, out });
    }

    if (p === '/chain') {
      // ?mode=mono   N bước chạy TRONG tiến trình này — không hop mạng nào
      // ?mode=micro  N bước là N request HTTP tới các instance khác
      //
      // Cùng số bước, cùng lượng việc mỗi bước. Hiệu số p99 giữa hai chế độ chính là
      // cái giá của việc tách service, và `fail` cho thấy độ khả dụng nhân dồn: chuỗi
      // N bước mỗi bước hỏng với xác suất p thì thành công với xác suất (1-p)^N.
      const hops = Math.max(1, Math.min(8, Number(url.searchParams.get('hops') || 4)));
      const w = Number(url.searchParams.get('w') || 200);
      const fail = Number(url.searchParams.get('fail') || 0);
      const mode = url.searchParams.get('mode') === 'micro' ? 'micro' : 'mono';
      const t0 = process.hrtime.bigint();

      if (mode === 'mono') {
        for (let i = 0; i < hops; i++) {
          doUnitOfWork(w);
          if (fail > 0 && Math.random() < fail) {
            return json(res, 500, { ok: false, mode, hops, buocHong: i + 1, totalMs: Number(msSince(t0).toFixed(3)) });
          }
        }
        return json(res, 200, { ok: true, mode, hops, instance: INSTANCE, totalMs: Number(msSince(t0).toFixed(3)) });
      }

      for (let i = 0; i < hops; i++) {
        const peer = PEERS[i % PEERS.length];
        const r = await callPeer(peer, `/step?w=${w}&fail=${fail}`);
        if (!r.ok) {
          return json(res, 500, {
            ok: false,
            mode,
            hops,
            buocHong: i + 1,
            peer,
            totalMs: Number(msSince(t0).toFixed(3)),
          });
        }
      }
      return json(res, 200, { ok: true, mode, hops, instance: INSTANCE, totalMs: Number(msSince(t0).toFixed(3)) });
    }

    if (p === '/saga-step') {
      // Mỗi instance đóng vai MỘT service và chỉ giữ trạng thái của riêng nó — đúng
      // nguyên tắc "mỗi service sở hữu dữ liệu của mình" (mục 15.4).
      const svc = url.searchParams.get('svc') || 'order';
      const op = url.searchParams.get('op') || 'do';
      if (!(svc in sagaState)) return json(res, 400, { loi: 'svc khong hop le' });
      if (url.searchParams.get('fail') === '1') return json(res, 500, { ok: false, svc, loi: 'buoc that bai' });
      sagaState[svc] += op === 'undo' ? -1 : 1;
      if (op === 'undo') sagaCompensations++;
      return json(res, 200, { ok: true, svc, op, giaTri: sagaState[svc], instance: INSTANCE });
    }

    if (p === '/saga') {
      // Saga ba bước qua ba service THẬT: order (app1) → payment (app2) → inventory (app3).
      // ?failAt=3       bước thứ mấy thất bại (0 = không bước nào)
      // ?compensate=1   có chạy hành động bù cho các bước ĐÃ THÀNH CÔNG hay không
      //
      // Không có 2PC ở đây, và đó là điểm mấu chốt: vượt qua ranh giới service là mất
      // ACID, nên "rollback" phải do chính ứng dụng viết ra dưới dạng hành động bù.
      const failAt = Number(url.searchParams.get('failAt') || 0);
      const compensate = url.searchParams.get('compensate') !== '0';
      const steps = [
        { svc: 'order', peer: PEERS_SAGA[0] },
        { svc: 'payment', peer: PEERS_SAGA[1] },
        { svc: 'inventory', peer: PEERS_SAGA[2] },
      ];
      const done = [];
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        const willFail = failAt === i + 1 ? '&fail=1' : '';
        const r = await callPeer(s.peer, `/saga-step?svc=${s.svc}&op=do${willFail}`);
        if (!r.ok) {
          sagaFailed++;
          const buLai = [];
          if (compensate) {
            // Hành động bù chạy NGƯỢC thứ tự — bước sau được gỡ trước.
            for (const d of done.reverse()) {
              await callPeer(d.peer, `/saga-step?svc=${d.svc}&op=undo`);
              buLai.push(d.svc);
            }
          }
          return json(res, 200, {
            ok: false,
            hongTaiBuoc: i + 1,
            svcHong: s.svc,
            daBu: compensate,
            buLai,
            // Khi compensate=0, các bước đã thành công KHÔNG được gỡ — đó chính là chỗ
            // dữ liệu bắt đầu lệch, và nó lệch một cách hoàn toàn im lặng.
            canhBao: compensate ? null : 'cac buoc da thanh cong bi bo lai — du lieu lech',
          });
        }
        done.push(s);
      }
      sagaCompleted++;
      return json(res, 200, { ok: true, hoanTat: steps.map((s) => s.svc) });
    }

    if (p === '/saga-reset') {
      sagaState.order = 0;
      sagaState.payment = 0;
      sagaState.inventory = 0;
      sagaCompleted = 0;
      sagaFailed = 0;
      sagaCompensations = 0;
      stepFailures = 0;
      return json(res, 200, { ok: true, instance: INSTANCE });
    }

    if (p === '/limited') {
      // Bài 13 — cùng một việc như /fast, nhưng đi qua rate limiter trước.
      //
      // So p99 của /limited với p99 của /fast là ra ngay chi phí mà limiter cộng vào
      // MỌI request. Đặt RATE_LIMIT thật cao thì không request nào bị chặn, nên hiệu
      // số là chi phí thuần; hạ RATE_LIMIT xuống thì thấy 429 và cách trả lời đúng.
      if (!redis || !RATE_LIMIT_ON) return json(res, 200, { ok: true, limiter: 'off', instance: INSTANCE });
      const who = url.searchParams.get('user') || req.socket.remoteAddress || 'anon';
      const verdict = await rateLimit(who);
      const headers = {
        // Ba header này là hợp đồng với client: còn bao nhiêu, khi nào bộ đếm mở lại.
        // Thiếu chúng thì client chỉ còn cách đoán, và cách đoán phổ biến nhất là
        // thử lại ngay lập tức — đúng thứ ta đang cố ngăn.
        'X-RateLimit-Limit': String(RATE_LIMIT),
        'X-RateLimit-Remaining': String(verdict.remaining),
        'X-RateLimit-Reset': String(Math.ceil(verdict.retryAfterMs / 1000)),
      };
      if (!verdict.allowed) {
        rateLimited++;
        const body = JSON.stringify({ error: 'rate_limited', retryAfterMs: verdict.retryAfterMs });
        // 429 chứ KHÔNG phải 500/503: client coi 5xx là lỗi tạm thời của server và
        // thử lại ngay, còn 429 kèm Retry-After nói rõ "lỗi ở phía bạn, chờ N giây".
        res.writeHead(429, {
          ...headers,
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
          'Retry-After': String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))),
          'X-Instance': INSTANCE,
        });
        return res.end(body);
      }
      rateAllowed++;
      const body = JSON.stringify({ ok: true, instance: INSTANCE, remaining: verdict.remaining });
      res.writeHead(200, {
        ...headers,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'X-Instance': INSTANCE,
      });
      return res.end(body);
    }

    if (p === '/slow-async') {
      const ms = Number(url.searchParams.get('ms') || 50);
      await sleep(ms); // yields the event loop => other requests still get served
      return json(res, 200, { ok: true, mode: 'async', ms, instance: INSTANCE });
    }

    if (p === '/slow-sync') {
      const ms = Number(url.searchParams.get('ms') || 50);
      blockFor(ms); // BLOCKS the event loop => every other request waits
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
      rwwTotal = 0;
      rwwStale = 0;
      rwwPinned = 0;
      shardHits.fill(0);
      chargeCreated = 0;
      chargeReplays = 0;
      dbWaitTotalMs = 0;
      dbMaxQueueDepth = 0;
      rateAllowed = 0;
      rateLimited = 0;
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
    // Ghi metric + span cho MỌI request, kể cả request lỗi. Bỏ sót nhánh lỗi là lỗi
    // đo lường phổ biến nhất: dashboard trông hoàn hảo vì nó chỉ đếm những gì thành công.
    const took = msSince(reqT0);
    observe(
      {
        route: p,
        status: clientGone ? 'abandoned' : String(res.statusCode),
        user: url.searchParams.get('user') || 'anon',
      },
      took
    );
    addSpan(corrId, { name: `${INSTANCE}${p}`, ms: Number(took.toFixed(3)), status: res.statusCode });
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
