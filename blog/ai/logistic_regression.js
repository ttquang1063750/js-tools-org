// logistic_regression.js — Phân loại nhị phân từ số 0: sigmoid + cross-entropy + GD
// Bài 3: Phân loại & hồi quy logistic
// js-tools.org/blog/ai/ai-logistic-classification
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node logistic_regression.js
// Kỳ vọng in ra: "SELF-TEST PASS (23 checks)" — các con số khớp đúng bảng
// tính tay, ví dụ outlier, và demo 2D trong bài viết.

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

// ---------------------------------------------------------------------------
// Mục 1: hồi quy tuyến tính + ngưỡng 0,5 — tái dùng nghiệm giải tích Bài 1.
// Thêm 1 điểm CÓ THẬT (không mislabel) ở x rất xa vẫn đủ kéo lệch đường fit
// và làm SAI lệch ngưỡng cắt, dù nhãn của chính điểm đó vẫn đúng.
// ---------------------------------------------------------------------------
function fitLeastSquares(points) {
  const n = points.length;
  let sumX = 0,
    sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const mx = sumX / n,
    my = sumY / n;
  let sxy = 0,
    sxx = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) * (p.x - mx);
  }
  return { w: sxy / sxx, b: my - (sxy / sxx) * mx };
}
function classifyByThreshold(points, w, b) {
  return points.map((p) => ({ ...p, pred: w * p.x + b, cls: w * p.x + b >= 0.5 ? 1 : 0 }));
}

// ---------------------------------------------------------------------------
// Mục 2: cross-entropy vs MSE — gradient theo z (trước sigmoid).
//   MSE:           dL/dz = 2(sigmoid(z) - y) * sigmoid'(z)   (có thể TIÊU BIẾN)
//   Cross-entropy: dL/dz = sigmoid(z) - y                     (KHÔNG BAO GIỜ tiêu biến)
// ---------------------------------------------------------------------------
function sigmoidPrime(z) {
  const s = sigmoid(z);
  return s * (1 - s);
}
function mseLoss(z, y) {
  return (sigmoid(z) - y) ** 2;
}
function mseGrad(z, y) {
  return 2 * (sigmoid(z) - y) * sigmoidPrime(z);
}
function ceLossNoClip(z, y) {
  const p = sigmoid(z);
  return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
}
function ceLoss(z, y, eps = 1e-12) {
  const p = Math.min(Math.max(sigmoid(z), eps), 1 - eps);
  return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
}
function ceGrad(z, y) {
  return sigmoid(z) - y; // đẹp: chính là "lỗi dự đoán" — không qua sigmoid'(z)
}

// ---------------------------------------------------------------------------
// Mục 3: softmax đa lớp (nếm trước — dùng thật ở Bài 10 MNIST).
// ---------------------------------------------------------------------------
function softmax(logits) {
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}

// ---------------------------------------------------------------------------
// Mục 4: confusion matrix + precision/recall/F1.
// ---------------------------------------------------------------------------
function confusion(preds, labels) {
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0;
  for (let i = 0; i < preds.length; i++) {
    if (preds[i] === 1 && labels[i] === 1) tp++;
    else if (preds[i] === 0 && labels[i] === 0) tn++;
    else if (preds[i] === 1 && labels[i] === 0) fp++;
    else fn++;
  }
  const acc = (tp + tn) / preds.length;
  const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
  return { tp, tn, fp, fn, acc, prec, rec, f1 };
}

// ---------------------------------------------------------------------------
// Mục 5: logistic regression 2D — GD full-batch trên cross-entropy.
// Gradient dùng đúng công thức "đẹp" ceGrad = sigmoid(z) - y (Mục 2), KHÔNG
// tự đạo hàm lại sigmoid'(z) — đúng lý do cross-entropy được chọn thay MSE.
// Demo trên trang gọi ĐÚNG hàm này (fixed lr/epochs, không random).
// ---------------------------------------------------------------------------
function trainLogistic(points, lr, epochs) {
  let w1 = 0,
    w2 = 0,
    b = 0;
  const n = points.length;
  for (let e = 0; e < epochs; e++) {
    let g1 = 0,
      g2 = 0,
      gb = 0;
    for (const p of points) {
      const err = sigmoid(w1 * p.x + w2 * p.y + b) - p.label;
      g1 += err * p.x;
      g2 += err * p.y;
      gb += err;
    }
    w1 -= (lr * g1) / n;
    w2 -= (lr * g2) / n;
    b -= (lr * gb) / n;
  }
  return { w1, w2, b };
}
function predict2D(model, p) {
  return sigmoid(model.w1 * p.x + model.w2 * p.y + model.b);
}

// ---------------------------------------------------------------------------
// Self-test — đối chiếu mọi con số trích dẫn trong bài viết.
// ---------------------------------------------------------------------------
let errors = 0;
let checks = 0;
function check(name, got, exp, tol = 1e-6) {
  checks++;
  if (got === null || Number.isNaN(got) !== Number.isNaN(exp) || Math.abs(got - exp) > tol) {
    console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
    errors++;
  }
}

// Mục 1: dataset sạch (7 điểm) phân loại đúng 100% bằng ngưỡng 0,5
const clean = [
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 6, y: 1 },
  { x: 7, y: 1 },
  { x: 8, y: 1 },
  { x: 9, y: 1 },
];
const fitClean = fitLeastSquares(clean);
const resClean = classifyByThreshold(clean, fitClean.w, fitClean.b);
check('clean: so diem sai', resClean.filter((p) => p.cls !== p.y).length, 0);

// Thêm 1 điểm THẬT (x=50, y=1) — không mislabel, chỉ ở xa — vẫn làm x=3 (y=0) bị đoán nhầm thành 1
const withOutlier = [...clean, { x: 50, y: 1 }];
const fitOut = fitLeastSquares(withOutlier);
const resOut = classifyByThreshold(withOutlier, fitOut.w, fitOut.b);
const wrongOut = resOut.filter((p) => p.cls !== p.y);
check('outlier: so diem sai', wrongOut.length, 1);
check('outlier: diem sai la x=3', wrongOut[0] && wrongOut[0].x, 3);

// Mục 2: gradient theo z tại z=-6, y=1 (confident-wrong) — CE lớn hơn MSE ~200 lần
check('MSE grad z=-6 y=1', mseGrad(-6, 1), -0.0049211073);
check('CE grad z=-6 y=1', ceGrad(-6, 1), -0.9975273768);
checks++;
if (!(Math.abs(ceGrad(-6, 1)) / Math.abs(mseGrad(-6, 1)) > 100)) {
  console.log('LOI: CE grad phai lon hon MSE grad tren 100 lan tai vung bao hoa');
  errors++;
}
// finite-difference đối chiếu công thức đóng (không đoán bằng mắt)
function fd(f, z, y, h = 1e-6) {
  return (f(z + h, y) - f(z - h, y)) / (2 * h);
}
check('CE grad khop finite-difference', ceGrad(2, 1), fd(ceLoss, 2, 1), 1e-4);
check('MSE grad khop finite-difference', mseGrad(2, 1), fd(mseLoss, 2, 1), 1e-4);

// log(0): 2 kieu hong khac nhau khi KHONG clip xac suat
// (a) z=-750,y=1 (du doan gan chac chan SAI): p tron ve dung 0.0 -> -log(0) = Infinity
checks++;
if (ceLossNoClip(-750, 1) !== Infinity) {
  console.log('LOI: ce loss KHONG clip tai z=-750,y=1 phai la Infinity (-log(0))');
  errors++;
}
check('ce loss CO clip tai z=-750,y=1', ceLoss(-750, 1), 27.631021, 1e-3);
// (b) z=40,y=1 (du doan gan chac chan DUNG): p tron ve dung 1.0, so hang thua
// (1-y)*log(1-p) = 0 * log(0) = 0 * (-Infinity) = NaN trong so hoc dau phay dong,
// dung du du doan hoan toan chinh xac.
checks++;
if (!Number.isNaN(ceLossNoClip(40, 1))) {
  console.log('LOI: ce loss KHONG clip tai z=40,y=1 phai la NaN (0 * log(0)) du du doan dung');
  errors++;
}
check('ce loss CO clip tai z=40,y=1', ceLoss(40, 1), 9.999778782803785e-13, 1e-9);

// Mục 3: softmax 3 lớp — tổng = 1, argmax đúng lớp có logit lớn nhất
const probs = softmax([2.0, 1.0, 0.1]);
check(
  'softmax tong = 1',
  probs.reduce((a, b) => a + b, 0),
  1
);
check('softmax lop 0', probs[0], 0.6590012, 1e-6);
check('softmax argmax', probs.indexOf(Math.max(...probs)), 0);

// Mục 4: accuracy danh lua tren du lieu lech 99 am / 1 duong
const labels99 = [...Array(99).fill(0), 1];
const predsAllNeg = new Array(100).fill(0);
const c99 = confusion(predsAllNeg, labels99);
check('99/1: accuracy', c99.acc, 0.99);
check('99/1: recall', c99.rec, 0);

// Trade-off theo nguong: precision tang, recall giam khi nguong tang
const scores = [0.05, 0.1, 0.2, 0.3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 0.95];
const trueLabels = [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1];
const c03 = confusion(
  scores.map((s) => (s >= 0.3 ? 1 : 0)),
  trueLabels
);
const c05 = confusion(
  scores.map((s) => (s >= 0.5 ? 1 : 0)),
  trueLabels
);
const c07 = confusion(
  scores.map((s) => (s >= 0.7 ? 1 : 0)),
  trueLabels
);
check('nguong 0.3: precision', c03.prec, 0.7, 1e-3);
check('nguong 0.3: recall', c03.rec, 1.0, 1e-3);
check('nguong 0.5: f1', c05.f1, 0.857142, 1e-3);
check('nguong 0.7: precision', c07.prec, 1.0, 1e-3);
check('nguong 0.7: recall', c07.rec, 0.571428, 1e-3);

// Mục 5: demo 2D — 12 điểm 2 cụm, GD hội tụ phân loại đúng 100% (đúng số liệu Demo)
const pts2d = [
  { x: 2, y: 2, label: 0 },
  { x: 2, y: 4, label: 0 },
  { x: 3, y: 3, label: 0 },
  { x: 4, y: 2, label: 0 },
  { x: 3, y: 5, label: 0 },
  { x: 4, y: 6, label: 0 },
  { x: 7, y: 6, label: 1 },
  { x: 8, y: 7, label: 1 },
  { x: 6, y: 8, label: 1 },
  { x: 8, y: 5, label: 1 },
  { x: 7, y: 8, label: 1 },
  { x: 9, y: 6, label: 1 },
];
const model = trainLogistic(pts2d, 0.15, 400);
let correct2d = 0;
for (const p of pts2d) {
  const cls = predict2D(model, p) >= 0.5 ? 1 : 0;
  if (cls === p.label) correct2d++;
}
check('demo 2D: do chinh xac', correct2d, 12);

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
