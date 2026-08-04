/**
 * resilience.js — retry, jitter, circuit breaker và deadline chạy THẬT (Bài 17).
 *
 *   ROLE=jitter    200 client cùng hỏng một lúc rồi thử lại: đo đỉnh lưu lượng mỗi
 *                  cửa sổ 20 ms, có jitter và không jitter
 *   ROLE=breaker   dependency chết 5 giây rồi sống lại: đo số lần gọi vào nó, thời
 *                  gian phí, và thời gian hồi phục — có và không có circuit breaker
 *   ROLE=deadline  timeout ngoài ngắn hơn việc bên trong: đếm công toi
 *
 * Biến môi trường: TARGET, CLIENTS, ATTEMPTS, BASE_MS, DURATION_MS, FAIL_MS
 */

'use strict';

const http = require('http');

const TARGET = process.env.TARGET || 'app1:3000';
const ROLE = process.env.ROLE || 'jitter';
const CLIENTS = Number(process.env.CLIENTS || 200);
const ATTEMPTS = Number(process.env.ATTEMPTS || 4);
const BASE_MS = Number(process.env.BASE_MS || 100);
const DURATION_MS = Number(process.env.DURATION_MS || 10000);
const FAIL_MS = Number(process.env.FAIL_MS || 5000);

const [HOST, PORT] = TARGET.split(':');
const agent = new http.Agent({ keepAlive: true, maxSockets: 256 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Một lời gọi HTTP có timeout. Trả { ok, status, ms, timedOut }. */
function call(path, timeoutMs = 0) {
  const t0 = process.hrtime.bigint();
  return new Promise((resolve) => {
    const done = (o) => resolve({ ...o, ms: Number(process.hrtime.bigint() - t0) / 1e6 });
    const req = http.get({ host: HOST, port: Number(PORT || 3000), path, agent }, (res) => {
      res.resume();
      res.on('end', () => done({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode }));
    });
    req.on('error', () => done({ ok: false, status: 0 }));
    if (timeoutMs > 0) {
      // `setTimeout` của request KHÔNG huỷ việc phía server — server vẫn cày tiếp và
      // vẫn sinh ra phản hồi. Đó chính là công toi mà ROLE=deadline đếm.
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        done({ ok: false, status: 0, timedOut: true });
      });
    }
  });
}

// ---------------------------------------------------------------------------
// ROLE=jitter — vì sao backoff không jitter tạo ra sóng
//
// Kịch bản: CLIENTS client cùng gặp lỗi tại một thời điểm (đúng như khi một service
// vừa sập rồi vừa sống lại). Cả hai chế độ dùng CÙNG một công thức exponential
// backoff; khác biệt duy nhất là có nhân thêm một lượng ngẫu nhiên hay không.
//
// Con số cần nhìn: `heSoDonCuc` — đỉnh cao gấp bao nhiêu lần mức trung bình.
// Đó là thứ server vừa hồi phục phải hứng, và cũng là thứ đánh sập nó lần nữa.
// ---------------------------------------------------------------------------
async function jitter() {
  const out = [];
  for (const mode of ['khong-jitter', 'co-jitter']) {
    const sendTimes = [];
    const t0 = Date.now();
    const tasks = [];
    for (let c = 0; c < CLIENTS; c++) {
      tasks.push(
        (async () => {
          for (let a = 1; a <= ATTEMPTS; a++) {
            // Exponential backoff: 100ms, 200ms, 400ms, 800ms...
            const backoff = BASE_MS * Math.pow(2, a - 1);
            // Full jitter: chờ một khoảng NGẪU NHIÊN trong [0, backoff] thay vì đúng
            // backoff. Kỳ vọng thời gian chờ giảm một nửa, nhưng điều quan trọng hơn
            // là các client không còn thức dậy cùng lúc.
            const wait = mode === 'co-jitter' ? Math.random() * backoff : backoff;
            await sleep(wait);
            sendTimes.push(Date.now() - t0);
            await call('/leaf');
          }
        })()
      );
    }
    await Promise.all(tasks);

    // Đỉnh trong cửa sổ trượt 20 ms. Cửa sổ phải NHỎ hơn nhiều so với bước backoff,
    // nếu không thì một đợt dồn cục và một đợt trải đều trông giống hệt nhau.
    const W = 20;
    sendTimes.sort((a, b) => a - b);
    let peak = 0;
    let i = 0;
    for (let j = 0; j < sendTimes.length; j++) {
      while (sendTimes[j] - sendTimes[i] >= W) i++;
      peak = Math.max(peak, j - i + 1);
    }
    const keoDai = sendTimes[sendTimes.length - 1] || 1;
    const trungBinh = sendTimes.length / (keoDai / W);
    out.push({
      mode,
      tongRequest: sendTimes.length,
      dinhMoi20ms: peak,
      trungBinhMoi20ms: Number(trungBinh.toFixed(1)),
      // Hệ số dồn cục: đỉnh cao gấp bao nhiêu lần mức trung bình. Đây mới là con số
      // quyết định server vừa hồi phục có sống nổi hay không.
      heSoDonCuc: Number((peak / trungBinh).toFixed(1)),
      keoDaiMs: keoDai,
    });
  }
  console.log(JSON.stringify({ role: 'jitter', clients: CLIENTS, attempts: ATTEMPTS, baseMs: BASE_MS, out }, null, 2));
}

// ---------------------------------------------------------------------------
// ROLE=breaker — circuit breaker ba trạng thái
//
// closed    : cho qua bình thường, đếm lỗi
// open      : TỪ CHỐI NGAY không gọi xuống, cho dependency thời gian thở
// half-open : thả một số ít request thăm dò; thành công thì đóng lại, hỏng thì mở tiếp
// ---------------------------------------------------------------------------
class CircuitBreaker {
  constructor({ nguongLoi = 5, mởLạiSauMs = 1000, soThamDo = 2 } = {}) {
    this.state = 'closed';
    this.fails = 0;
    this.nguongLoi = nguongLoi;
    this.moLaiSauMs = mởLạiSauMs;
    this.soThamDo = soThamDo;
    this.probes = 0;
    this.openedAt = 0;
    this.rejected = 0; // số request bị chặn ngay, KHÔNG đi xuống dependency
  }
  canPass() {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt >= this.moLaiSauMs) {
        this.state = 'half-open';
        this.probes = 0;
      } else {
        this.rejected++;
        return false;
      }
    }
    // half-open: chỉ thả đúng `soThamDo` request. Thả cả đàn vào đúng lúc dependency
    // vừa ngóc đầu dậy là cách chắc chắn nhất để giết nó lần nữa.
    if (this.state === 'half-open' && this.probes >= this.soThamDo) {
      this.rejected++;
      return false;
    }
    if (this.state === 'half-open') this.probes++;
    return true;
  }
  onResult(ok) {
    if (ok) {
      // Thăm dò thành công -> đóng mạch lại, quay về hoạt động bình thường.
      this.state = 'closed';
      this.fails = 0;
      return;
    }
    // Thăm dò THẤT BẠI ở half-open -> mở lại NGAY, không chờ đủ ngưỡng lỗi lần nữa.
    // Thiếu nhánh này thì breaker kẹt vĩnh viễn ở half-open sau khi cạn số thăm dò —
    // một bug có thật đã gặp khi viết lab này, và nó im lặng hoàn toàn.
    if (this.state === 'half-open') {
      this.state = 'open';
      this.openedAt = Date.now();
      this.fails = 0;
      return;
    }
    this.fails++;
    if (this.fails >= this.nguongLoi) {
      this.state = 'open';
      this.openedAt = Date.now();
      this.fails = 0;
    }
  }
}

async function breaker() {
  const out = [];
  for (const mode of ['khong-breaker', 'co-breaker']) {
    await call('/leaf-reset');
    const cb = new CircuitBreaker({ nguongLoi: 5, mởLạiSauMs: 1000, soThamDo: 2 });
    const t0 = Date.now();
    let goiXuong = 0;
    let goiXuongLucChet = 0;
    let loi = 0;
    let thanhCong = 0;
    let tongMsCho = 0;
    let msChoLucChet = 0;
    let hoiPhucSauMs = null;

    while (Date.now() - t0 < DURATION_MS) {
      // Dependency "chết" trong FAIL_MS đầu: mỗi lời gọi treo 300 ms rồi trả 503.
      // Treo trước khi lỗi là điểm mấu chốt — thứ giết hệ thống không phải lỗi mà là
      // THỜI GIAN CHỜ trước khi biết là lỗi.
      const dead = Date.now() - t0 < FAIL_MS;
      const path = dead ? '/leaf?ms=300&fail=1' : '/leaf';

      if (mode === 'co-breaker' && !cb.canPass()) {
        // Mạch mở: thất bại tức thì, không tốn một mili giây nào của dependency.
        loi++;
        await sleep(5);
        continue;
      }
      const r = await call(path, 2000);
      goiXuong++;
      tongMsCho += r.ms;
      if (dead) {
        goiXuongLucChet++;
        msChoLucChet += r.ms;
      }
      if (mode === 'co-breaker') cb.onResult(r.ok);
      if (r.ok) {
        thanhCong++;
        if (hoiPhucSauMs === null && Date.now() - t0 >= FAIL_MS) hoiPhucSauMs = Date.now() - t0 - FAIL_MS;
      } else {
        loi++;
      }
    }

    out.push({
      mode,
      // Con số quan trọng nhất: bao nhiêu lời gọi thật sự đập vào dependency ĐANG ỐM.
      goiXuongLucDependencyChet: goiXuongLucChet,
      thoiGianChoLangPhiMs: Math.round(msChoLucChet),
      soLanBiChanNgay: cb.rejected,
      tongGoiXuong: goiXuong,
      thanhCong,
      loi,
      tongThoiGianChoMs: Math.round(tongMsCho),
      // Sau khi dependency sống lại, mất bao lâu để lời gọi đầu tiên thành công.
      hoiPhucSauMs,
    });
  }
  console.log(JSON.stringify({ role: 'breaker', durationMs: DURATION_MS, failMs: FAIL_MS, out }, null, 2));
}

// ---------------------------------------------------------------------------
// ROLE=deadline — timeout ngoài ngắn hơn việc bên trong
//
// Client bỏ cuộc sau 100 ms, nhưng server vẫn cày đủ 500 ms rồi mới sinh phản hồi.
// Phản hồi đó không ai nhận. Nhìn từ dashboard của server thì mọi thứ "bình thường";
// nhìn từ người dùng thì request đã lỗi từ lâu.
// ---------------------------------------------------------------------------
async function deadline() {
  await call('/leaf-reset');
  const N = Number(process.env.N || 100);
  let timedOut = 0;
  for (let i = 0; i < N; i++) {
    const r = await call('/leaf?ms=500', 100);
    if (r.timedOut) timedOut++;
  }
  await sleep(1200); // chờ server làm xong nốt phần việc không ai cần

  const stats = await new Promise((resolve) => {
    http.get({ host: HOST, port: Number(PORT || 3000), path: '/leaf-stats', agent }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve(JSON.parse(b)));
    });
  });

  console.log(
    JSON.stringify(
      {
        role: 'deadline',
        soRequest: N,
        timeoutPhiaClient: timedOut,
        // Server VẪN làm đủ N lần việc 500 ms, dù không ai chờ kết quả.
        serverVanLamViec: stats.leafHits,
        phanHoiKhongAiNhan: stats.abandonedResponses,
        congToiMs: stats.leafHits * 500,
      },
      null,
      2
    )
  );
}

const roles = { jitter, breaker, deadline };
(roles[ROLE] || jitter)()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(ROLE, 'loi:', e.message);
    process.exit(1);
  });
