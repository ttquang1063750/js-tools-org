// kmeans_pca.js — Học không giám sát từ số 0: K-means + PCA (power iteration)
// Bài 4: Học không giám sát: K-means & PCA
// js-tools.org/blog/ai/ai-kmeans-pca
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node kmeans_pca.js
// Kỳ vọng in ra: "SELF-TEST PASS (24 checks)" — các con số khớp đúng bảng
// tính tay, ví dụ thất bại, và cả 2 demo trong bài viết.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rng) {
  const u1 = rng(),
    u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ---------------------------------------------------------------------------
// Mục 2: K-means — vòng lặp assign (gán điểm về centroid gần nhất) rồi
// update (centroid mới = trung bình các điểm được gán). Trả về LỊCH SỬ
// inertia sau mỗi bước assign — dùng để kiểm chứng nó không bao giờ tăng.
// ---------------------------------------------------------------------------
function dist2(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
function kmeans(points, initCentroids, maxIter = 50) {
  let centroids = initCentroids.map((c) => ({ ...c }));
  let assign = new Array(points.length).fill(-1);
  const inertiaHist = [];
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < points.length; i++) {
      let best = -1,
        bd = Infinity;
      for (let k = 0; k < centroids.length; k++) {
        const d = dist2(points[i], centroids[k]);
        if (d < bd) {
          bd = d;
          best = k;
        }
      }
      if (best !== assign[i]) changed = true;
      assign[i] = best;
    }
    let inertia = 0;
    for (let i = 0; i < points.length; i++) inertia += dist2(points[i], centroids[assign[i]]);
    inertiaHist.push(inertia);
    const sums = centroids.map(() => ({ x: 0, y: 0, n: 0 }));
    for (let i = 0; i < points.length; i++) {
      sums[assign[i]].x += points[i].x;
      sums[assign[i]].y += points[i].y;
      sums[assign[i]].n++;
    }
    let moved = false;
    for (let k = 0; k < centroids.length; k++) {
      if (sums[k].n === 0) continue;
      const nx = sums[k].x / sums[k].n,
        ny = sums[k].y / sums[k].n;
      if (Math.abs(nx - centroids[k].x) > 1e-9 || Math.abs(ny - centroids[k].y) > 1e-9) moved = true;
      centroids[k] = { x: nx, y: ny };
    }
    if (!changed && !moved) break;
  }
  let finalInertia = 0;
  for (let i = 0; i < points.length; i++) finalInertia += dist2(points[i], centroids[assign[i]]);
  return { centroids, assign, inertiaHist, finalInertia };
}

// 3 cụm Gaussian cố định (seed=7) — 8 điểm/cụm quanh (2,2) (8,2) (5,8)
function genBlobs(seed) {
  const rng = mulberry32(seed);
  const centers = [
    { x: 2, y: 2 },
    { x: 8, y: 2 },
    { x: 5, y: 8 },
  ];
  const pts = [];
  for (const c of centers) {
    for (let i = 0; i < 8; i++) {
      pts.push({ x: c.x + gaussian(rng) * 0.7, y: c.y + gaussian(rng) * 0.7 });
    }
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Mục 4: PCA qua power iteration — v_{t+1} = normalize(A v_t) hội tụ về
// eigenvector ứng với eigenvalue LỚN NHẤT của ma trận đối xứng A.
// ---------------------------------------------------------------------------
function matVec2(c, v) {
  return [c.cxx * v[0] + c.cxy * v[1], c.cxy * v[0] + c.cyy * v[1]];
}
function norm2(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}
function normalize2(v) {
  const n = norm2(v);
  return [v[0] / n, v[1] / n];
}
function powerIteration2(c, iters = 20, v0 = [1, 0]) {
  let v = v0;
  for (let i = 0; i < iters; i++) v = normalize2(matVec2(c, v));
  const Av = matVec2(c, v);
  const eigval = v[0] * Av[0] + v[1] * Av[1];
  return { v, eigval };
}
function meanCols(xs, ys) {
  return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length };
}
function covMatrix(xs, ys) {
  const m = meanCols(xs, ys);
  let sxx = 0,
    sxy = 0,
    syy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - m.x,
      dy = ys[i] - m.y;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const n = xs.length;
  return { cxx: sxx / n, cxy: sxy / n, cyy: syy / n };
}
function variance(arr) {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
}
function std(arr) {
  return Math.sqrt(variance(arr));
}

// PCA 3D (dùng ở demo 3D→2D): ma trận 3x3 + power iteration + deflation để
// lấy lần lượt PC1 (eigenvalue lớn nhất) rồi PC2 (lớn nhì trên phần dư).
function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function norm3(v) {
  return Math.sqrt(dot3(v, v));
}
function normalize3(v) {
  const n = norm3(v);
  return [v[0] / n, v[1] / n, v[2] / n];
}
function matVec3(A, v) {
  return [
    A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
    A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
    A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2],
  ];
}
function powerIteration3(A, iters, v0) {
  let v = normalize3(v0);
  for (let i = 0; i < iters; i++) v = normalize3(matVec3(A, v));
  const Av = matVec3(A, v);
  return { v, eigval: dot3(v, Av) };
}
function deflate3(A, v, eigval) {
  const M = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] = A[i][j] - eigval * v[i] * v[j];
  return M;
}
function pca3(points3d) {
  const n = points3d.length;
  const mean = { x: 0, y: 0, z: 0 };
  for (const p of points3d) {
    mean.x += p.x;
    mean.y += p.y;
    mean.z += p.z;
  }
  mean.x /= n;
  mean.y /= n;
  mean.z /= n;
  const C = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (const p of points3d) {
    const d = [p.x - mean.x, p.y - mean.y, p.z - mean.z];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j];
  }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] /= n;
  const pc1 = powerIteration3(C, 40, [1, 0.3, 0.2]);
  const deflated1 = deflate3(C, pc1.v, pc1.eigval);
  const pc2 = powerIteration3(deflated1, 40, [0.2, 1, 0.3]);
  const deflated2 = deflate3(deflated1, pc2.v, pc2.eigval);
  const pc3 = powerIteration3(deflated2, 40, [0.1, 0.2, 1]);
  return { mean, pc1, pc2, pc3 };
}

// ---------------------------------------------------------------------------
// Self-test — đối chiếu mọi con số trích dẫn trong bài viết.
// ---------------------------------------------------------------------------
let errors = 0;
let checks = 0;
function check(name, got, exp, tol = 1e-3) {
  checks++;
  if (got === null || Number.isNaN(got) || Math.abs(got - exp) > tol) {
    console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
    errors++;
  }
}
function checkTrue(name, cond) {
  checks++;
  if (!cond) {
    console.log('LOI', name);
    errors++;
  }
}

// Mục 2: init TỐT hội tụ nhanh (2 bước) về inertia toàn cục 25.170
const blobs = genBlobs(7);
const goodInit = [
  { x: 1, y: 1 },
  { x: 9, y: 1 },
  { x: 5, y: 9 },
];
const rGood = kmeans(blobs, goodInit);
check('init tot: inertia cuoi', rGood.finalInertia, 25.17, 0.01);
checkTrue('init tot: 2 buoc', rGood.inertiaHist.length === 2);

// Init XẤU (3 điểm dữ liệu cùng phía) mắc kẹt ở optimum tệ hơn 7,6 lần
const badInit = [{ ...blobs[12] }, { ...blobs[13] }, { ...blobs[0] }];
const rBad = kmeans(blobs, badInit);
check('init xau: inertia cuoi', rBad.finalInertia, 191.537, 0.01);
checkTrue('init xau: te hon 5 lan', rBad.finalInertia / rGood.finalInertia > 5);

// Inertia KHÔNG BAO GIỜ tăng qua các bước — kiểm cho cả 2 lịch sử
function isMonotonicNonIncreasing(hist) {
  for (let i = 1; i < hist.length; i++) if (hist[i] > hist[i - 1] + 1e-9) return false;
  return true;
}
checkTrue('inertia tot khong tang', isMonotonicNonIncreasing(rGood.inertiaHist));
checkTrue('inertia xau khong tang', isMonotonicNonIncreasing(rBad.inertiaHist));

// Elbow: k=1..6 (best trong 10 lần restart mỗi k) — khớp bảng trong bài
function kmeansMultiRestart(points, k, seedBase, restarts = 10) {
  let best = null;
  for (let r = 0; r < restarts; r++) {
    const rng = mulberry32(seedBase + r * 77);
    const idx = [];
    while (idx.length < k) {
      const i = Math.floor(rng() * points.length);
      if (!idx.includes(i)) idx.push(i);
    }
    const init = idx.map((i) => ({ ...points[i] }));
    const res = kmeans(points, init);
    if (!best || res.finalInertia < best.finalInertia) best = res;
  }
  return best;
}
const elbowExpected = [338.354, 169.016, 25.17, 18.26, 16.094, 12.497];
for (let k = 1; k <= 6; k++) {
  const r = kmeansMultiRestart(blobs, k, k * 1000);
  check('elbow k=' + k, r.finalInertia, elbowExpected[k - 1], 0.01);
}

// Mục 3: 2 vòng tròn đồng tâm — k=2 THẤT BẠI, chia theo nửa mặt phẳng thay
// vì theo bán kính (purity 50/50 trong mỗi cụm, không phải 100%)
const rngRing = mulberry32(21);
const ringPts = [];
const ringLabel = [];
for (let i = 0; i < 20; i++) {
  const a = (i / 20) * 2 * Math.PI;
  const r = 1 + (rngRing() - 0.5) * 0.2;
  ringPts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
  ringLabel.push(0);
}
for (let i = 0; i < 20; i++) {
  const a = (i / 20) * 2 * Math.PI;
  const r = 4 + (rngRing() - 0.5) * 0.3;
  ringPts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
  ringLabel.push(1);
}
const rRing = kmeans(ringPts, [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
]);
for (let k = 0; k < 2; k++) {
  const members = rRing.assign.map((a, i) => (a === k ? ringLabel[i] : null)).filter((x) => x !== null);
  const nInner = members.filter((x) => x === 0).length;
  checkTrue('vong tron cum ' + k + ': lan 50/50 (that bai)', nInner >= 8 && nInner <= 12);
}

// Mục 4: power iteration tren ma tran doc de tinh tay A=[[2,1],[1,2]]
const toy = { cxx: 2, cxy: 1, cyy: 2 };
const pwToy = powerIteration2(toy, 6, [1, 0]);
check('toy power iteration v.x', pwToy.v[0], 0.7071, 0.001);
check('toy power iteration v.y', pwToy.v[1], 0.7071, 0.001);
check('toy power iteration eigval', pwToy.eigval, 3, 0.001);

// PCA trên dữ liệu 2D tương quan thật — power iteration phải khớp closed-form
function gen2D(seed, n) {
  const rng = mulberry32(seed);
  const pts = [];
  const angle = Math.PI / 6;
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  for (let i = 0; i < n; i++) {
    const along = gaussian(rng) * 3;
    const across = gaussian(rng) * 0.6;
    pts.push({ x: along * cos - across * sin, y: along * sin + across * cos });
  }
  return pts;
}
const data2d = gen2D(11, 40);
const c2d = covMatrix(
  data2d.map((p) => p.x),
  data2d.map((p) => p.y)
);
const pwData = powerIteration2(c2d, 20, [1, 0]);
check('PCA thuc: eigval PC1', pwData.eigval, 7.4104, 0.001);
const varianceExplained = pwData.eigval / (c2d.cxx + c2d.cyy);
checkTrue('PCA thuc: PC1 giai thich > 90%', varianceExplained > 0.9);

// Cạm bẫy chuẩn hoá: PC1 KHÔNG chuẩn hoá bị lương (VND thô) nuốt chửng tuổi
const age = [24, 29, 35, 41, 48, 55];
const salaryVND = [12_000_000, 18_000_000, 25_000_000, 40_000_000, 60_000_000, 95_000_000];
const cRaw = covMatrix(age, salaryVND);
const pwRaw = powerIteration2(cRaw, 30, [1, 0]);
checkTrue('khong chuan hoa: PC1 gan nhu chi la luong', Math.abs(pwRaw.v[1]) > 0.99);

const ageZ = age.map((a) => (a - age.reduce((s, x) => s + x, 0) / age.length) / std(age));
const salZ = salaryVND.map((s) => (s - salaryVND.reduce((a, b) => a + b, 0) / salaryVND.length) / std(salaryVND));
const cZ = covMatrix(ageZ, salZ);
const pwZ = powerIteration2(cZ, 30, [1, 0]);
check('co chuan hoa: PC1.x', Math.abs(pwZ.v[0]), 0.7071, 0.01);
check('co chuan hoa: PC1.y', Math.abs(pwZ.v[1]), 0.7071, 0.01);

// Mục 5: PCA 3D→2D demo — PC1+PC2 phải giữ lại hầu hết phương sai (dữ liệu
// gần như phẳng), PC3 (bỏ đi) phải gần trùng phương pháp tuyến đã tiêm nhiễu.
function normalize3Raw(v) {
  const n = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  return [v[0] / n, v[1] / n, v[2] / n];
}
function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
const b3 = normalize3Raw([0.3, 0.5, 0.8]);
const b1 = normalize3Raw(cross3(b3, [0, 0, 1]));
const b2 = normalize3Raw(cross3(b3, b1));
const rng3d = mulberry32(31);
const pts3d = [];
for (let i = 0; i < 60; i++) {
  const u = gaussian(rng3d) * 3.0,
    v = gaussian(rng3d) * 1.2,
    w = gaussian(rng3d) * 0.3;
  pts3d.push({
    x: b1[0] * u + b2[0] * v + b3[0] * w,
    y: b1[1] * u + b2[1] * v + b3[1] * w,
    z: b1[2] * u + b2[2] * v + b3[2] * w,
  });
}
const pca = pca3(pts3d);
const totalVar3 = pca.pc1.eigval + pca.pc2.eigval + pca.pc3.eigval;
check('3D->2D: PC1+PC2 giu > 95% phuong sai', (pca.pc1.eigval + pca.pc2.eigval) / totalVar3, 0.9842, 0.01);
checkTrue('3D->2D: PC3 (bo di) gan trung phap tuyen nhieu da tiem', Math.abs(dot3(pca.pc3.v, b3)) > 0.99);

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
