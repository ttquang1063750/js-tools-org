/**
 * sysdesign-quorum.js — mô phỏng quorum đọc/ghi và cách last-write-wins làm mất dữ liệu.
 * Dùng cho Bài 9 (CAP & Các Mô Hình Nhất Quán) của Series 20.
 *
 * KHÔNG phụ thuộc DOM, chạy trực tiếp bằng `node sysdesign-quorum.js` để in ra toàn bộ số
 * liệu dùng trong bài. Mọi con số trong Bài 9 mục 9.4 và 9.5 đến từ file này.
 *
 * Ba thứ file này chứng minh bằng số:
 *   1. Vì sao R + W > N là điều kiện ĐỦ để tập đọc và tập ghi giao nhau.
 *   2. Read-repair làm gì: nó không giảm tỉ lệ đọc cũ ngay, mà làm sự phân kỳ HỘI TỤ.
 *   3. Vì sao last-write-wins mất dữ liệu khi đồng hồ hai máy lệch nhau.
 */

'use strict';

// ---------------------------------------------------------------------------
// Rng tất định: cùng seed cho cùng kết quả, để số trong bài lặp lại được.
// ---------------------------------------------------------------------------
function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// 1. Quorum: tập đọc và tập ghi có giao nhau hay không
// ---------------------------------------------------------------------------

/**
 * Chọn ngẫu nhiên `k` node trong `n` node (không trùng).
 *
 * Đây là điểm quan trọng dễ bị bỏ qua: client KHÔNG chọn được node nào chứa dữ liệu mới.
 * Nó chỉ chọn `k` node bất kỳ và hy vọng ít nhất một node trong đó đã có bản mới.
 */
function pickNodes(n, k, rng) {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k);
}

/**
 * Mô phỏng: mỗi vòng ghi vào W node rồi đọc ngay từ R node, đếm số lần đọc KHÔNG thấy
 * bản mới nhất. Đây là phép đo cho bất đẳng thức R + W > N.
 *
 * Lưu ý về `readRepair` ở hàm này: nó KHÔNG cải thiện được gì, và điều đó đúng chứ không
 * phải lỗi. Vì mỗi vòng đều có một lệnh ghi mới, việc sửa các node về bản cũ hơn không
 * giúp gì cho vòng sau. Tác dụng thật của read-repair nằm ở `simulateConvergence` dưới.
 */
function simulateQuorum({ n, w, r, rounds = 100000, seed = 42, readRepair = false }) {
  const rng = makeRng(seed);
  // version[i] = version mới nhất mà node i đang giữ.
  const version = new Array(n).fill(0);
  let staleReads = 0;

  for (let round = 1; round <= rounds; round++) {
    // GHI: chọn W node và đặt version = round.
    for (const i of pickNodes(n, w, rng)) version[i] = round;

    // ĐỌC: chọn R node, lấy version LỚN NHẤT trong số đó (đây là cách quorum read
    // giải quyết xung đột: bản có version cao hơn thắng).
    const readSet = pickNodes(n, r, rng);
    let best = -1;
    for (const i of readSet) best = Math.max(best, version[i]);

    if (best < round) staleReads++;
    if (readRepair) for (const i of readSet) version[i] = Math.max(version[i], best);
  }

  return {
    n,
    w,
    r,
    condition: `R + W = ${r + w} ${r + w > n ? '>' : '<='} N = ${n}`,
    guaranteesOverlap: r + w > n,
    staleReads,
    staleRatio: staleReads / rounds,
  };
}

/**
 * Ghi MỘT lần vào W node, rồi đọc liên tiếp `reads` lần. Trả về tỉ lệ đọc ra bản cũ theo
 * từng nhóm đọc, để thấy nó có GIẢM DẦN hay không.
 *
 * Đây mới là chỗ read-repair thể hiện tác dụng: mỗi lần đọc thấy có node đang giữ bản mới,
 * nó ghi bản đó sang các node cũ trong cùng tập đọc. Sau đủ số lần đọc, mọi node đều mới.
 * KHÔNG có read-repair, tỉ lệ đọc cũ giữ nguyên mãi mãi — đó là nghĩa của việc một hệ
 * "eventual consistency" mà không bao giờ eventual.
 */
function simulateConvergence({ n, w, r, reads = 40, trials = 20000, seed = 7, readRepair = false }) {
  const rng = makeRng(seed);
  const buckets = new Array(reads).fill(0);
  for (let t = 0; t < trials; t++) {
    const version = new Array(n).fill(0);
    for (const i of pickNodes(n, w, rng)) version[i] = 1; // đúng MỘT lệnh ghi
    for (let k = 0; k < reads; k++) {
      const readSet = pickNodes(n, r, rng);
      let best = 0;
      for (const i of readSet) best = Math.max(best, version[i]);
      if (best < 1) buckets[k]++;
      if (readRepair) for (const i of readSet) version[i] = Math.max(version[i], best);
    }
  }
  return buckets.map((c) => c / trials);
}

// ---------------------------------------------------------------------------
// 2. Last-write-wins mất dữ liệu khi đồng hồ lệch
// ---------------------------------------------------------------------------

/**
 * Hai client ghi vào cùng một key, gần như cùng lúc, vào hai node khác nhau.
 * Node quyết định "ai thắng" bằng dấu thời gian mà CLIENT gửi lên (đó là LWW).
 *
 * Vấn đề: đồng hồ tường của hai máy không bao giờ khớp tuyệt đối. Nếu client B ghi SAU
 * client A nhưng đồng hồ của B chậm hơn, thì dấu thời gian của B nhỏ hơn — và lệnh ghi
 * của B bị âm thầm bỏ đi. Không có lỗi, không có log, không ai biết.
 */
function lastWriteWins({ clockSkewMs }) {
  // Thời điểm THẬT (theo một đồng hồ tưởng tượng hoàn hảo), tính bằng ms.
  const realTimeA = 1000;
  const realTimeB = 1050; // B ghi SAU A đúng 50 ms

  // Nhưng mỗi client đóng dấu bằng đồng hồ CỦA NÓ.
  const stampA = realTimeA + 0;
  const stampB = realTimeB + clockSkewMs; // đồng hồ B lệch

  const writes = [
    { client: 'A', value: 'so-du = 100', realTime: realTimeA, stamp: stampA },
    { client: 'B', value: 'so-du = 150', realTime: realTimeB, stamp: stampB },
  ];

  // LWW: bản có dấu thời gian LỚN NHẤT thắng.
  const winner = writes.reduce((a, b) => (b.stamp > a.stamp ? b : a));
  // Đúng nghĩa nhân quả: bản xảy ra SAU theo thời gian thật mới nên thắng.
  const shouldWin = writes.reduce((a, b) => (b.realTime > a.realTime ? b : a));

  return {
    clockSkewMs,
    stampA,
    stampB,
    lwwWinner: winner.client,
    correctWinner: shouldWin.client,
    lostWrite: winner.client !== shouldWin.client,
    lostValue: winner.client !== shouldWin.client ? shouldWin.value : null,
  };
}

// ---------------------------------------------------------------------------
// Chạy trực tiếp: in toàn bộ số liệu dùng trong Bài 9
// ---------------------------------------------------------------------------
function main() {
  console.log('=== 9.4 · Quorum R + W > N, N = 3, 100.000 vòng ===');
  console.log('N  W  R  điều kiện           đọc ra bản cũ');
  const configs = [
    { n: 3, w: 1, r: 1 },
    { n: 3, w: 1, r: 2 },
    { n: 3, w: 2, r: 1 },
    { n: 3, w: 2, r: 2 },
    { n: 3, w: 3, r: 1 },
    { n: 3, w: 1, r: 3 },
    { n: 5, w: 2, r: 2 },
    { n: 5, w: 3, r: 3 },
  ];
  for (const c of configs) {
    const res = simulateQuorum(c);
    console.log(
      `${res.n}  ${res.w}  ${res.r}  ${res.condition.padEnd(18)} ${String(res.staleReads).padStart(7)}` +
        `  (${(res.staleRatio * 100).toFixed(2)}%)`
    );
  }

  console.log();
  console.log('=== 9.4 · Read-repair lam gi: N=3, W=1, R=2, ghi MOT lan roi doc 40 lan ===');
  console.log('    (R phai >= 2 moi co tac dung: mot tap doc chi gom 1 node thi khong co gi de sua)');
  console.log('    (ti le doc ra ban cu o lan doc thu 1, 2, 5, 10, 20, 40)');
  for (const rr of [false, true]) {
    const b = simulateConvergence({ n: 3, w: 1, r: 2, reads: 40, readRepair: rr });
    const at = [0, 1, 4, 9, 19, 39].map((i) => (b[i] * 100).toFixed(1) + '%');
    console.log(`  read-repair ${rr ? 'BAT ' : 'TAT '}: ${at.join('  ')}`);
  }

  console.log();
  console.log('=== 9.5 · Last-write-wins voi dong ho lech ===');
  console.log('lech (ms)  stampA  stampB  LWW chon  dung ra phai chon  mat du lieu?');
  for (const skew of [0, -20, -50, -80, -200]) {
    const r = lastWriteWins({ clockSkewMs: skew });
    console.log(
      String(r.clockSkewMs).padStart(9),
      String(r.stampA).padStart(7),
      String(r.stampB).padStart(7),
      r.lwwWinner.padStart(9),
      r.correctWinner.padStart(18),
      '  ' + (r.lostWrite ? 'CO — mat "' + r.lostValue + '"' : 'khong')
    );
  }
}

// Chạy main khi gọi trực tiếp bằng node, nhưng không chạy khi được import vào trang web.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  main();
}

if (typeof module !== 'undefined') {
  module.exports = { simulateQuorum, lastWriteWins, pickNodes, makeRng };
}
