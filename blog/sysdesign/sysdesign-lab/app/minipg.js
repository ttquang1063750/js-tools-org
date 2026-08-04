/**
 * minipg.js — client PostgreSQL tối giản, KHÔNG dependency (Bài 7, Bài 8).
 *
 * Vì sao viết tay thay vì dùng `pg`? Cùng lý do như `MiniRedis` trong app.js và như bộ
 * đo tải: nếu tầng truy cập database là một hộp đen thì bạn không thấy được chỗ nào có
 * hàng đợi, chỗ nào có round-trip, và không kiểm chứng được rằng lệnh đọc thật sự đi tới
 * replica. Toàn bộ file này khoảng 150 dòng và cài đúng phần giao thức mà lab cần.
 *
 * Phạm vi có chủ ý:
 *   - Chỉ dùng "simple query protocol" (thông điệp 'Q'): một lệnh, một chuỗi SQL.
 *     KHÔNG có prepared statement, nghĩa là KHÔNG có tham số hoá.
 *   - Chỉ hỗ trợ xác thực `trust` (AuthenticationOk ngay lập tức). Lab đặt
 *     POSTGRES_HOST_AUTH_METHOD=trust nên không cần cài SCRAM-SHA-256.
 *
 * ⚠️ ĐỪNG dùng file này ngoài lab. Không có tham số hoá nghĩa là mọi giá trị phải tự
 * escape, và đó chính là con đường dẫn tới SQL injection. Trong lab, mọi giá trị truyền
 * vào đều là số nguyên đã qua Number() nên an toàn — nhưng đó là điều kiện của lab,
 * không phải tính chất của thư viện.
 */

'use strict';

const net = require('net');

// ---------------------------------------------------------------------------
// Đọc/ghi thông điệp
// ---------------------------------------------------------------------------

/** Thông điệp startup: KHÔNG có byte kiểu ở đầu — đây là ngoại lệ duy nhất. */
function startupMessage(user, database) {
  const params = `user\0${user}\0database\0${database}\0client_encoding\0UTF8\0\0`;
  const len = 4 + 4 + Buffer.byteLength(params);
  const buf = Buffer.alloc(len);
  buf.writeInt32BE(len, 0);
  buf.writeInt32BE(196608, 4); // phiên bản giao thức 3.0 = 3 << 16
  buf.write(params, 8, 'utf8');
  return buf;
}

/** Mọi thông điệp khác: 1 byte kiểu + 4 byte độ dài (tính cả 4 byte đó) + nội dung. */
function taggedMessage(tag, payload) {
  const body = Buffer.from(payload, 'utf8');
  const buf = Buffer.alloc(1 + 4 + body.length + 1);
  buf.write(tag, 0, 'ascii');
  buf.writeInt32BE(4 + body.length + 1, 1);
  body.copy(buf, 5);
  buf[buf.length - 1] = 0; // chuỗi trong giao thức luôn kết thúc bằng byte 0
  return buf;
}

class MiniPg {
  constructor({ host, port = 5432, user = 'lab', database = 'lab' }) {
    this.opts = { host, port, user, database };
    this.sock = null;
    this.buf = Buffer.alloc(0);
    this.queue = []; // các query đang chờ, theo đúng thứ tự gửi
    this.ready = null;
  }

  connect() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const sock = net.createConnection({ host: this.opts.host, port: this.opts.port });
      sock.setNoDelay(true);
      this.sock = sock;
      let authed = false;

      sock.on('connect', () => sock.write(startupMessage(this.opts.user, this.opts.database)));
      sock.on('data', (chunk) => {
        this.buf = Buffer.concat([this.buf, chunk]);
        for (const msg of this._drain()) {
          // 'R' = Authentication. Chỉ chấp nhận mã 0 (AuthenticationOk).
          if (msg.tag === 'R') {
            const code = msg.body.readInt32BE(0);
            if (code !== 0) {
              reject(new Error(`minipg chỉ hỗ trợ trust auth, primary yêu cầu mã ${code}`));
              sock.destroy();
              return;
            }
          } else if (msg.tag === 'E') {
            this._failCurrent(new Error('postgres: ' + parseError(msg.body)));
          } else if (msg.tag === 'Z') {
            // ReadyForQuery: kết thúc một chu kỳ. Lần đầu tiên nghĩa là đã kết nối xong.
            if (!authed) {
              authed = true;
              resolve(this);
            } else {
              this._finishCurrent();
            }
          } else if (msg.tag === 'T') {
            this._current().fields = parseRowDescription(msg.body);
          } else if (msg.tag === 'D') {
            const cur = this._current();
            cur.rows.push(parseDataRow(msg.body, cur.fields));
          }
          // Các thông điệp khác (S ParameterStatus, K BackendKeyData, C CommandComplete,
          // N NoticeResponse) không cần xử lý cho mục đích của lab.
        }
      });
      sock.on('error', (e) => {
        reject(e);
        this._failAll(e);
      });
      sock.on('close', () => this._failAll(new Error('kết nối postgres đã đóng')));
    });
    return this.ready;
  }

  /** Tách các thông điệp hoàn chỉnh ra khỏi buffer. Phần dở dang được giữ lại. */
  *_drain() {
    while (this.buf.length >= 5) {
      const len = this.buf.readInt32BE(1);
      if (this.buf.length < 1 + len) return; // chưa nhận đủ, chờ chunk sau
      const tag = String.fromCharCode(this.buf[0]);
      const body = this.buf.subarray(5, 1 + len);
      this.buf = this.buf.subarray(1 + len);
      yield { tag, body };
    }
  }

  _current() {
    return this.queue[0] || { rows: [], fields: [] };
  }
  _finishCurrent() {
    const q = this.queue.shift();
    if (!q) return;
    // ErrorResponse toi TRUOC ReadyForQuery, nen loi da duoc ghi vao q.error o day.
    if (q.error) q.reject(q.error);
    else q.resolve(q.rows);
  }
  _failCurrent(err) {
    const q = this.queue[0];
    if (q) q.error = err;
  }
  _failAll(err) {
    while (this.queue.length) {
      const q = this.queue.shift();
      q.reject(err);
    }
    this.ready = null;
  }

  /**
   * Chạy một câu SQL, trả về mảng các dòng dạng object.
   *
   * Lưu ý về thứ tự: PostgreSQL trả lời các query trên MỘT kết nối theo đúng thứ tự
   * nhận được, nên hàng đợi FIFO ở đây là đủ. Nhưng cũng vì thế một kết nối chỉ xử lý
   * được một query tại một thời điểm — đó là lý do phải có pool (xem `PgPool` dưới).
   */
  query(sql) {
    return this.connect().then(
      () =>
        new Promise((resolve, reject) => {
          this.queue.push({ rows: [], fields: [], error: null, resolve, reject });
          this.sock.write(taggedMessage('Q', sql));
        })
    );
  }

  close() {
    if (this.sock) this.sock.destroy();
    this.ready = null;
  }
}

function parseError(body) {
  // ErrorResponse là chuỗi các cặp (mã 1 byte, giá trị kết thúc bằng 0). 'M' là message.
  let i = 0;
  const out = {};
  while (i < body.length && body[i] !== 0) {
    const code = String.fromCharCode(body[i]);
    const end = body.indexOf(0, i + 1);
    out[code] = body.toString('utf8', i + 1, end);
    i = end + 1;
  }
  return out.M || 'lỗi không rõ';
}

function parseRowDescription(body) {
  const count = body.readInt16BE(0);
  const fields = [];
  let i = 2;
  for (let n = 0; n < count; n++) {
    const end = body.indexOf(0, i);
    fields.push(body.toString('utf8', i, end));
    i = end + 1 + 18; // 18 byte metadata mỗi cột (table oid, type oid, ...) — không cần
  }
  return fields;
}

function parseDataRow(body, fields) {
  const count = body.readInt16BE(0);
  const row = {};
  let i = 2;
  for (let n = 0; n < count; n++) {
    const len = body.readInt32BE(i);
    i += 4;
    if (len === -1) {
      row[fields[n] || n] = null; // -1 nghĩa là NULL, KHÁC với chuỗi rỗng
    } else {
      row[fields[n] || n] = body.toString('utf8', i, i + len);
      i += len;
    }
  }
  return row;
}

/**
 * Pool kết nối tối giản.
 *
 * Vì sao cần: một kết nối PostgreSQL xử lý một query tại một thời điểm. Không có pool
 * thì mọi request của app xếp hàng trên một kết nối duy nhất, và bạn sẽ đo ra "database
 * chậm" trong khi thật ra database đang rảnh — đúng loại nhầm lẫn mà Bài 2 nói tới.
 */
class PgPool {
  constructor(opts, size = 6) {
    this.conns = Array.from({ length: size }, () => new MiniPg(opts));
    this.next = 0;
    this.busy = new Map();
  }

  /** Chọn kết nối rảnh; nếu tất cả đang bận thì xếp hàng lên kết nối ít việc nhất. */
  query(sql) {
    let best = this.conns[0];
    let bestLoad = Infinity;
    for (const c of this.conns) {
      const load = c.queue.length;
      if (load === 0) {
        best = c;
        break;
      }
      if (load < bestLoad) {
        bestLoad = load;
        best = c;
      }
    }
    return best.query(sql);
  }

  close() {
    for (const c of this.conns) c.close();
  }
}

module.exports = { MiniPg, PgPool };
