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
 *   GET /rww?id=&pin=  → ghi primary rồi đọc ngay replica: tái tạo bug read-your-writes,
 *                        và bật/tắt cơ chế ghim-về-primary để kiểm chứng bản vá (Bài 7)
 *
 * Biến môi trường: PORT, INSTANCE, REDIS_URL, DB_DELAY_MS, DB_MAX_CONCURRENCY, GRACEFUL,
 *                  TRUST_PROXY_HOPS, PG_PRIMARY, PG_REPLICA, READ_PIN_MS, PG_SHARDS
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
      // Tai tao dung mot bug: nguoi dung doi anh dai dien (GHI vao primary) roi tai lai
      // trang (DOC tu replica) va thay anh CU. Day la vi pham read-your-writes.
      //
      // ?id=N     dong du lieu de ghi/doc (mac dinh ngau nhien trong 1..1000)
      // ?pin=1    dung co che ghim-ve-primary neu READ_PIN_MS > 0
      if (!pgPrimary || !pgReplica) {
        return json(res, 503, { error: 'chua dat PG_PRIMARY / PG_REPLICA' });
      }
      const id = Number(url.searchParams.get('id') || 1 + Math.floor(Math.random() * 1000));
      const usePin = url.searchParams.get('pin') !== '0';
      const now = Date.now();

      // 1) GHI vao primary. RETURNING cho biet chinh xac version vua ghi.
      const wrote = await pgPrimary.query(
        `UPDATE profiles SET avatar = 'avatar-v' || (version + 1) || '.png',
                             version = version + 1, updated_at = now()
         WHERE id = ${id} RETURNING version`
      );
      const wroteVersion = Number(wrote[0] && wrote[0].version);
      if (usePin && READ_PIN_MS > 0) readPin.set(id, Date.now() + READ_PIN_MS);

      // 2) DOC NGAY LAP TUC. Day la thoi diem quyet dinh: chua chac replica da kip.
      const pinned = usePin && shouldReadPrimary(id, Date.now());
      if (pinned) rwwPinned++;
      const target = pinned ? pgPrimary : pgReplica;
      const read = await target.query(`SELECT version, avatar FROM profiles WHERE id = ${id}`);
      const readVersion = Number(read[0] && read[0].version);

      rwwTotal++;
      // "Cu" la mot dieu DO DUOC, khong phai cam nhan: doc ra version NHO HON version
      // vua ghi thi khong the tranh cai.
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
        shards: PG_SHARDS,
        shardHits,
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
      rwwTotal = 0;
      rwwStale = 0;
      rwwPinned = 0;
      shardHits.fill(0);
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
