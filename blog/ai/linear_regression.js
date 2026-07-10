// linear_regression.js — Hồi quy tuyến tính 1 biến từ số 0 (nghiệm giải tích)
// Bài 1: Học máy là gì? Hồi quy tuyến tính từ số 0
// js-tools.org/blog/ai/ai-linear-regression
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node linear_regression.js
// Kỳ vọng in ra: "SELF-TEST PASS (10 checks)" — các con số kiểm chứng
// khớp đúng ví dụ tính tay từng bước trong bài viết.

// ---------------------------------------------------------------------------
// Nghiệm giải tích least squares cho y = w*x + b:
//   w = Σ(x - meanX)(y - meanY) / Σ(x - meanX)²
//   b = meanY - w * meanX
// Trả về null khi không fit được (dưới 2 điểm, hoặc mọi điểm cùng hoành độ
// — đường "fit" khi đó thẳng đứng, không viết được dạng y = wx + b).
// ---------------------------------------------------------------------------
function fitLeastSquares(points) {
  const n = points.length;
  if (n < 2) return null;
  let sumX = 0,
    sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / n,
    meanY = sumY / n;
  let sxy = 0,
    sxx = 0;
  for (const p of points) {
    sxy += (p.x - meanX) * (p.y - meanY);
    sxx += (p.x - meanX) * (p.x - meanX);
  }
  if (sxx === 0) return null;
  const w = sxy / sxx;
  return { w, b: meanY - w * meanX };
}

// MSE — trung bình bình phương sai số giữa dự đoán w*x+b và đáp án y.
function mse(points, w, b) {
  let s = 0;
  for (const p of points) {
    const err = w * p.x + b - p.y;
    s += err * err;
  }
  return s / points.length;
}

// R² — tỉ lệ phương sai của y mà model giải thích được (1 = hoàn hảo,
// 0 = không hơn gì đường ngang y = meanY).
function rSquared(points, w, b) {
  const n = points.length;
  let meanY = 0;
  for (const p of points) meanY += p.y;
  meanY /= n;
  let ssRes = 0,
    ssTot = 0;
  for (const p of points) {
    const pred = w * p.x + b;
    ssRes += (p.y - pred) * (p.y - pred);
    ssTot += (p.y - meanY) * (p.y - meanY);
  }
  if (ssTot === 0) return 1;
  return 1 - ssRes / ssTot;
}

// ---------------------------------------------------------------------------
// Self-test — đối chiếu với ví dụ TÍNH TAY trong bài viết (Mục 3):
// 4 điểm (1,2) (2,3) (3,5) (4,6) → w = 1.4, b = 0.5, MSE = 0.05, R² = 0.98
// ---------------------------------------------------------------------------
let errors = 0;
let checks = 0;
function check(name, got, exp, tol = 1e-9) {
  checks++;
  if (got === null || Math.abs(got - exp) > tol) {
    console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
    errors++;
  }
}

// 3 điểm thẳng hàng hoàn hảo y = 2x + 1 — fit phải trả lại đúng đường gốc
const perfect = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 5 },
];
const f1 = fitLeastSquares(perfect);
check('thang hang w', f1.w, 2);
check('thang hang b', f1.b, 1);
check('thang hang MSE', mse(perfect, f1.w, f1.b), 0);
check('thang hang R2', rSquared(perfect, f1.w, f1.b), 1);

// Ví dụ tính tay của bài
const example = [
  { x: 1, y: 2 },
  { x: 2, y: 3 },
  { x: 3, y: 5 },
  { x: 4, y: 6 },
];
const f2 = fitLeastSquares(example);
check('vi du w', f2.w, 1.4);
check('vi du b', f2.b, 0.5);
check('vi du MSE', mse(example, f2.w, f2.b), 0.05);
check('vi du R2', rSquared(example, f2.w, f2.b), 0.98);

// Outlier (4, 60) — 1 điểm nhập sai kéo lệch cả đường (pitfall Mục 2)
const dirty = [...example, { x: 4, y: 60 }];
const f3 = fitLeastSquares(dirty);
checks++;
if (!(f3.w > f2.w * 2)) {
  console.log('LOI: outlier phai keo w tang manh, got', f3.w);
  errors++;
}

// Suy biến: mọi điểm cùng hoành độ → null, không NaN
checks++;
if (
  fitLeastSquares([
    { x: 2, y: 1 },
    { x: 2, y: 9 },
  ]) !== null
) {
  console.log('LOI: x trung nhau phai tra null');
  errors++;
}

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
