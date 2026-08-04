/**
 * lock-worker.js — worker tranh một distributed lock trong Redis (Bài 10).
 *
 * Hai (hoặc nhiều) container chạy CÙNG file này và cùng cố xử lý một "tài nguyên" duy
 * nhất. Mục tiêu của lab là đếm bằng số thật xem có bao nhiêu lần HAI worker cùng xử lý
 * một job — thứ mà lock được dựng lên để ngăn.
 *
 * Biến môi trường:
 *   REDIS_URL     bắt buộc
 *   WORKER        tên worker, để phân biệt trong log
 *   LOCK          'off' | 'on'        có dùng lock hay không
 *   FENCE         '0' | '1'           có dùng fencing token hay không
 *   LOCK_TTL_MS   TTL của lock (mặc định 400)
 *   PAUSE_MS      độ dài "GC pause" giả lập, chèn SAU khi lấy lock và TRƯỚC khi ghi.
 *                 Đặt lớn hơn LOCK_TTL_MS để tự tay tạo ra tình huống hai worker cùng
 *                 tin mình đang giữ lock (Bài 10, mục 10.3).
 *   PAUSE_EVERY   cứ bao nhiêu vòng thì pause một lần (mặc định 7)
 *   ROUNDS        số vòng mỗi worker chạy
 *
 * KHÔNG dependency: dùng lại client Redis tối giản của app.
 */

'use strict';

const net = require('net');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const WORKER = process.env.WORKER || 'w?';
const USE_LOCK = (process.env.LOCK || 'off') === 'on';
const USE_FENCE = (process.env.FENCE || '0') === '1';
const LOCK_TTL_MS = Number(process.env.LOCK_TTL_MS || 200);
const PAUSE_MS = Number(process.env.PAUSE_MS || 0);
const PAUSE_EVERY = Number(process.env.PAUSE_EVERY || 5);
const ROUNDS = Number(process.env.ROUNDS || 60);
// WORK_MS phải ĐỦ DÀI so với PAUSE_MS, nếu không worker kia đã ra khỏi vùng tới hạn
// trước khi "zombie" tỉnh lại, và bạn sẽ đo ra 0 xung đột dù lock đã thật sự hỏng.
// Đây là cạm bẫy thiết kế thí nghiệm, không phải cạm bẫy của lock (xem Bài 10 mục 10.3).
const WORK_MS = Number(process.env.WORK_MS || 300);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Client Redis tối giản (RESP), đủ cho SET/GET/EVAL/INCR/DEL
// ---------------------------------------------------------------------------
class MiniRedis {
  constructor(url) {
    const u = new URL(url);
    this.host = u.hostname;
    this.port = Number(u.port || 6379);
    this.sock = null;
    this.buf = '';
    this.queue = [];
  }
  connect() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const s = net.createConnection({ host: this.host, port: this.port }, () => resolve(this));
      s.setNoDelay(true);
      s.setEncoding('utf8');
      s.on('data', (d) => {
        this.buf += d;
        this._drain();
      });
      s.on('error', reject);
      this.sock = s;
    });
    return this.ready;
  }
  _drain() {
    // Chỉ cần xử lý các kiểu RESP mà lab dùng: +simple, -error, :integer, $bulk, *array.
    for (;;) {
      const i = this.buf.indexOf('\r\n');
      if (i < 0) return;
      const line = this.buf.slice(0, i);
      const t = line[0];
      if (t === '$') {
        const len = Number(line.slice(1));
        if (len === -1) {
          this.buf = this.buf.slice(i + 2);
          this._resolve(null);
          continue;
        }
        if (this.buf.length < i + 2 + len + 2) return; // chưa nhận đủ
        const val = this.buf.substr(i + 2, len);
        this.buf = this.buf.slice(i + 2 + len + 2);
        this._resolve(val);
        continue;
      }
      this.buf = this.buf.slice(i + 2);
      if (t === '+') this._resolve(line.slice(1));
      else if (t === ':') this._resolve(Number(line.slice(1)));
      else if (t === '-') this._resolve(new Error(line.slice(1)));
      else this._resolve(line);
    }
  }
  _resolve(v) {
    const q = this.queue.shift();
    if (!q) return;
    if (v instanceof Error) q.reject(v);
    else q.resolve(v);
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
// Lock
// ---------------------------------------------------------------------------

/**
 * Ba điều BẮT BUỘC của một Redis lock đúng (Bài 10, mục 10.2):
 *   NX      chỉ đặt khi key chưa tồn tại — đó là phần "giành lock"
 *   PX ttl  BẮT BUỘC có TTL, nếu không thì holder chết là deadlock vĩnh viễn
 *   token   giá trị ngẫu nhiên, để CHỈ chủ sở hữu mới xoá được (xem release)
 */
async function acquire(key, token, ttlMs) {
  const res = await redis.cmd('SET', key, token, 'NX', 'PX', String(ttlMs));
  return res === 'OK';
}

/**
 * Giải phóng lock PHẢI atomic: kiểm token rồi mới DEL, trong cùng một lệnh.
 *
 * Vì sao không được `DEL` thẳng: lock của bạn có thể đã HẾT HẠN và người khác đã giành
 * được nó. `DEL` thẳng sẽ xoá lock CỦA HỌ, và từ đó trở đi mọi thứ hỏng theo dây chuyền.
 */
const RELEASE_LUA = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0
end`;

async function release(key, token) {
  return redis.cmd('EVAL', RELEASE_LUA, '1', key, token);
}

/**
 * Ghi vào "tài nguyên" có kiểm fencing token (Bài 10, mục 10.4).
 *
 * Đây là mấu chốt: tài nguyên đích tự từ chối token NHỎ HƠN token lớn nhất nó đã thấy.
 * Nhờ vậy một worker "zombie" quay lại sau GC pause — vẫn tin mình giữ lock — bị chặn ở
 * TẦNG TÀI NGUYÊN, chứ không phải nhờ lock. Nếu tài nguyên không kiểm thì fencing token
 * chỉ là một con số trang trí.
 */
const FENCED_WRITE_LUA = `
local seen = tonumber(redis.call('GET', KEYS[1]) or '0')
local tok  = tonumber(ARGV[1])
if tok < seen then
  redis.call('INCR', KEYS[3])          -- dem so lan bi TU CHOI
  return 0
end
redis.call('SET', KEYS[1], tok)
redis.call('INCR', KEYS[2])            -- dem so lan duoc CHAP NHAN
return 1`;

async function fencedWrite(token) {
  return redis.cmd(
    'EVAL',
    FENCED_WRITE_LUA,
    '3',
    'lab:res:seen',
    'lab:res:accepted',
    'lab:res:rejected',
    String(token)
  );
}

/**
 * Ghi KHÔNG kiểm fencing. Dùng để đo thiệt hại khi chỉ có lock mà không có fencing.
 *
 * `inCritical` là bộ đếm số worker đang ở trong vùng tới hạn TẠI CÙNG MỘT THỜI ĐIỂM.
 * Nếu nó lên tới 2, nghĩa là lock đã KHÔNG bảo vệ được — và đây là con số quan trọng
 * nhất của cả bài.
 */
const PLAIN_WRITE_LUA = `
local n = redis.call('INCR', KEYS[1])   -- vao vung toi han
if n > 1 then
  redis.call('INCR', KEYS[2])           -- CO tu 2 worker cung luc => xung dot
end
redis.call('INCR', KEYS[3])             -- dem tong so lan ghi
return n`;

async function enterCritical() {
  return redis.cmd('EVAL', PLAIN_WRITE_LUA, '3', 'lab:crit:inside', 'lab:crit:conflicts', 'lab:res:writes');
}
async function leaveCritical() {
  return redis.cmd('DECR', 'lab:crit:inside');
}

// ---------------------------------------------------------------------------
// Vòng chạy
// ---------------------------------------------------------------------------
async function main() {
  await redis.connect();
  const LOCK_KEY = 'lab:lock:job';
  let acquired = 0;
  let missed = 0;
  let pauses = 0;

  // Đếm số vòng THÀNH CÔNG, không phải số lần thử.
  //
  // Cạm bẫy đã mắc phải khi viết lab này: bản đầu tiên dùng `for (round = 1..ROUNDS)` và
  // `continue` khi giành lock thất bại. Hậu quả là worker thua chạy hết ROUNDS vòng trong
  // vài trăm ms rồi THOÁT — nên phần lớn thời gian chỉ có MỘT worker chạy, và phép đo cho
  // 0 xung đột một cách vô nghĩa. Muốn đo tranh chấp thì cả hai worker phải còn sống trong
  // suốt phép đo.
  let round = 0;
  const maxAttempts = ROUNDS * 200;
  for (let attempt = 0; acquired < ROUNDS && attempt < maxAttempts; attempt++) {
    round++;
    const token = `${WORKER}-${round}-${Math.random().toString(36).slice(2)}`;
    let have = true;

    if (USE_LOCK) {
      have = await acquire(LOCK_KEY, token, LOCK_TTL_MS);
      if (!have) {
        missed++;
        await sleep(5);
        continue; // thử LẠI vòng này, không tính là đã xong
      }
    }
    acquired++;

    // Fencing token: một số TĂNG ĐƠN ĐIỆU, do Redis cấp bằng INCR (atomic).
    // Lấy SAU khi có lock để thứ tự token khớp với thứ tự giành được lock.
    const fence = USE_FENCE ? Number(await redis.cmd('INCR', 'lab:fence:seq')) : 0;

    // "GC pause": worker bị dừng lâu hơn TTL của lock. Trong lúc này lock hết hạn,
    // worker khác giành được, và khi worker này tỉnh lại nó VẪN TIN mình đang giữ lock.
    if (PAUSE_MS > 0 && round % PAUSE_EVERY === 0) {
      pauses++;
      await sleep(PAUSE_MS);
    }

    // Vùng tới hạn: đây là chỗ "chỉ được một worker tại một thời điểm".
    // enterCritical đếm xem có bao nhiêu worker cùng ở đây — đó là thước đo lock.
    await enterCritical();

    // Fencing được kiểm TẠI TÀI NGUYÊN, sau khi đã vào vùng tới hạn. Thứ tự này có chủ ý:
    // fencing KHÔNG ngăn hai worker cùng vào (chỉ lock làm được việc đó) — nó ngăn
    // THIỆT HẠI, bằng cách từ chối lệnh ghi của worker có token cũ.
    let accepted = true;
    if (USE_FENCE) accepted = (await fencedWrite(fence)) === 1;

    if (accepted) await sleep(WORK_MS);
    await leaveCritical();

    if (USE_LOCK) await release(LOCK_KEY, token);
  }

  console.log(
    JSON.stringify({
      worker: WORKER,
      lock: USE_LOCK,
      fence: USE_FENCE,
      ttlMs: LOCK_TTL_MS,
      pauseMs: PAUSE_MS,
      acquired,
      missed,
      pauses,
    })
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(WORKER, 'loi:', e.message);
  process.exit(1);
});
