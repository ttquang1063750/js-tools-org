// overfitting_demo.js — Huấn luyện thực tế: overfitting, L2, dropout, early stopping
// Bài 8: Huấn luyện thực tế: Overfitting
// js-tools.org/blog/ai/ai-overfitting-regularization
//
// Forward pass + autograd dùng NeuroJS thật (import từ ai-neuro.js, Bài 5+7) —
// không viết lại matmul/backward. Bài này chỉ GHÉP các phép đã có (add/mul/
// matmul/relu/sigmoid) để tạo loss L2 và dropout, không cần mở rộng engine.
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node overfitting_demo.js
// Kỳ vọng in ra: "SELF-TEST PASS (18 checks)" — đối chiếu đúng mọi con số
// trích dẫn trong bài viết (quỹ đạo overfit theo epoch, quét L2, cạm bẫy
// dropout quên eval mode, minh hoạ rò rỉ dữ liệu qua 25 seed).

import { Tensor, add, mul, matmul, relu, sigmoid, sum } from './ai-neuro.js';

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

// Dữ liệu "2 trăng" (moons) — 2 nửa vòng cung lồng nhau, không tách tuyến tính
// được (giống tinh thần XOR Bài 6 nhưng liên tục). flipFrac mô phỏng NHIỄU
// NHÃN thật (một tỉ lệ nhãn bị gán sai) — nguồn overfitting chính của bài.
function makeMoons(n, noiseStd, flipFrac, seed) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI * rng();
    let label = i % 2;
    let x, y;
    if (label === 0) {
      x = Math.cos(t) + gaussian(rng) * noiseStd;
      y = Math.sin(t) + gaussian(rng) * noiseStd;
    } else {
      x = 1 - Math.cos(t) + gaussian(rng) * noiseStd;
      y = 1 - Math.sin(t) - 0.5 + gaussian(rng) * noiseStd;
    }
    if (rng() < flipFrac) label = 1 - label;
    pts.push({ x, y, label });
  }
  return pts;
}

function initParams(seed, H) {
  const rng = mulberry32(seed);
  const r = () => (rng() - 0.5) * 1.2;
  return {
    W1: Tensor.fromNested(Array.from({ length: 2 }, () => Array.from({ length: H }, () => r()))),
    b1: Tensor.fromNested(new Array(H).fill(0)),
    W2: Tensor.fromNested(Array.from({ length: H }, () => [r()])),
    b2: Tensor.fromNested([0]),
  };
}

// Forward THUẦN (không dropout) — dùng để train khi không cần dropout, và
// LUÔN dùng lúc eval/inference đúng cách (Mục 4 — dropout phải TẮT lúc này).
function forward(params, X) {
  const z1 = add(matmul(X, params.W1), params.b1);
  const a1 = relu(z1);
  const z2 = add(matmul(a1, params.W2), params.b2);
  return sigmoid(z2);
}

// Dropout "inverted": khi TRAIN, tắt ngẫu nhiên mỗi neuron với xác suất p,
// còn lại NHÂN BÙ 1/(1-p) để giữ nguyên kỳ vọng tổng — đúng cách PyTorch
// nn.Dropout làm. Cài bằng ĐÚNG phép mul() đã có, không cần op mới.
function dropoutMask(n, H, p, rng) {
  const keepScale = 1 / (1 - p);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let h = 0; h < H; h++) row.push(rng() < p ? 0 : keepScale);
    rows.push(row);
  }
  return Tensor.fromNested(rows);
}
function forwardWithDropout(params, X, p, rng) {
  const z1 = add(matmul(X, params.W1), params.b1);
  const a1 = relu(z1);
  const mask = dropoutMask(X.shape[0], params.W1.shape[1], p, rng);
  const a1d = mul(a1, mask);
  const z2 = add(matmul(a1d, params.W2), params.b2);
  return sigmoid(z2);
}

function mseLoss(yhat, yTensor, n) {
  const negY = mul(yTensor, Tensor.fromNested([-1]));
  const diff = add(yhat, negY);
  const sq = mul(diff, diff);
  return mul(sum(sq), Tensor.fromNested([1 / n]));
}
function zeroGradAll(params) {
  for (const k in params) params[k].zeroGrad();
}
// weight decay (L2): cộng thêm lambda*w vào gradient trước khi cập nhật —
// tương đương thêm (lambda/2)*sum(w^2) vào loss, nhưng rẻ hơn (không cần đi
// qua computation graph, chỉ 1 phép cộng trên .grad đã tính sẵn).
function sgdStep(params, lr, l2) {
  for (const k in params) {
    const p = params[k];
    for (let i = 0; i < p.size; i++) {
      const g = p.grad[i] + l2 * p.data[i];
      p.data[i] -= lr * g;
    }
  }
}
function toXY(arr) {
  return { X: Tensor.fromNested(arr.map((p) => [p.x, p.y])), y: Tensor.fromNested(arr.map((p) => [p.label])) };
}
function evalSet(params, d) {
  const yhat = forward(params, d.X);
  let correct = 0,
    lossSum = 0;
  for (let i = 0; i < d.y.size; i++) {
    const p = yhat.data[i],
      y = d.y.data[i];
    if ((p >= 0.5 ? 1 : 0) === y) correct++;
    lossSum += (p - y) * (p - y);
  }
  return { acc: correct / d.y.size, loss: lossSum / d.y.size };
}
function trainSteps(params, trD, epochs, lr, l2) {
  for (let e = 0; e < epochs; e++) {
    zeroGradAll(params);
    const yhat = forward(params, trD.X);
    const L = mseLoss(yhat, trD.y, trD.y.size);
    L.backward();
    sgdStep(params, lr, l2);
  }
}

export { makeMoons, initParams, forward, forwardWithDropout, mseLoss, zeroGradAll, sgdStep, toXY, evalSet, trainSteps };

// ---------------------------------------------------------------------------
// Self-test
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
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

  // Dataset cố định dùng cho Mục 2 (bias-variance) & Mục 3 (L2): 60 điểm,
  // seed=11, chia 20 train / 20 val / 20 test.
  const all60 = makeMoons(60, 0.3, 0.15, 11);
  const trD = toXY(all60.slice(0, 20));
  const valD = toXY(all60.slice(20, 40));

  // --- Mục 2: underfit (H=1) — cả train lẫn val plateau ở mức CAO, gần nhau ---
  const underfit = initParams(42, 1);
  trainSteps(underfit, trD, 1800, 0.3, 0);
  const uTr = evalSet(underfit, trD),
    uVa = evalSet(underfit, valD);
  check('underfit H=1: train loss plateau cao', uTr.loss, 0.1182, 0.01);
  check('underfit H=1: val loss plateau cao', uVa.loss, 0.2914, 0.02);
  checkTrue('underfit: train KHONG giam duoc nhieu (con cao)', uTr.loss > 0.1);

  // --- Mục 2/5: quỹ đạo overfit (H=64) theo epoch — val có ĐÁY roi TANG tro lai ---
  function trajectoryPoint(H, epochs, seed) {
    const params = initParams(seed, H);
    trainSteps(params, trD, epochs, 0.3, 0);
    return { train: evalSet(params, trD), val: evalSet(params, valD) };
  }
  const early = trajectoryPoint(64, 10, 42);
  check('overfit H=64 @epoch10 (gan day val): val loss', early.val.loss, 0.2272, 0.01);
  const late = trajectoryPoint(64, 5800, 42);
  check('overfit H=64 @epoch5800: train loss rat thap', late.train.loss, 0.0411, 0.01);
  check('overfit H=64 @epoch5800: val loss TE HON epoch10 (da tang tro lai)', late.val.loss, 0.4808, 0.02);
  checkTrue('overfit: val @5800 TE HON val @10 (dung huong tang)', late.val.loss > early.val.loss);
  checkTrue('overfit: train @5800 TOT HON train @10 (dung huong giam)', late.train.loss < early.train.loss);

  // --- Mục 3: quét L2 — quá 0 thì overfit nặng, vừa đủ thì cân bằng, quá nhiều thì underfit ---
  function l2Point(l2) {
    const params = initParams(42, 64);
    trainSteps(params, trD, 5800, 0.3, l2);
    return { train: evalSet(params, trD), val: evalSet(params, valD) };
  }
  const l2_0 = l2Point(0);
  check('L2=0: train acc cao (memorize)', l2_0.train.acc, 0.95, 0.05);
  check('L2=0: val acc rat te (overfit nang)', l2_0.val.acc, 0.4, 0.05);
  const l2_05 = l2Point(0.05);
  checkTrue('L2=0.05: val acc TOT HON L2=0 (regularization giup)', l2_05.val.acc > l2_0.val.acc);
  const l2_1 = l2Point(0.1);
  checkTrue('L2=0.1 (qua nhieu): train acc SUP GIAM manh (underfit)', l2_1.train.acc < l2_0.train.acc - 0.2);

  // --- Mục 4: cạm bẫy dropout — quên tắt lúc eval làm dự đoán DAO ĐỘNG ---
  const dpParams = initParams(3, 32);
  const dpTrain = toXY(makeMoons(60, 0.25, 0.1, 5).slice(0, 40));
  const dpTest = toXY(makeMoons(60, 0.25, 0.1, 5).slice(40, 60));
  const trainRng = mulberry32(99);
  for (let e = 0; e < 1500; e++) {
    zeroGradAll(dpParams);
    const yhat = forwardWithDropout(dpParams, dpTrain.X, 0.5, trainRng);
    const L = mseLoss(yhat, dpTrain.y, dpTrain.y.size);
    L.backward();
    sgdStep(dpParams, 0.3, 0);
  }
  // Eval ĐÚNG cách (dropout tắt): phải cho kết quả GIỐNG HỆT NHAU mọi lần gọi.
  const evalA = forward(dpParams, dpTest.X).data.slice();
  const evalB = forward(dpParams, dpTest.X).data.slice();
  checkTrue(
    'dropout: eval DUNG cach on dinh tuyet doi qua 2 lan goi',
    Array.from(evalA).every((v, i) => v === evalB[i])
  );
  // Eval SAI cách (quên tắt dropout): 2 lần gọi phải cho kết quả KHÁC NHAU rõ rệt.
  const buggyRng1 = mulberry32(777);
  const buggyRng2 = mulberry32(778);
  const buggyA = forwardWithDropout(dpParams, dpTest.X, 0.5, buggyRng1).data;
  const buggyB = forwardWithDropout(dpParams, dpTest.X, 0.5, buggyRng2).data;
  let maxDiff = 0;
  for (let i = 0; i < buggyA.length; i++) maxDiff = Math.max(maxDiff, Math.abs(buggyA[i] - buggyB[i]));
  checkTrue('dropout: eval SAI cach (quen tat) dao dong ro ret giua 2 lan goi', maxDiff > 0.05);

  // --- Mục 1: minh hoạ rò rỉ dữ liệu — chọn theo test trực tiếp thổi phồng điểm ---
  const leakAll = makeMoons(80, 0.3, 0.15, 21);
  const leakTr = toXY(leakAll.slice(0, 30)),
    leakVal = toXY(leakAll.slice(30, 55)),
    leakTest = toXY(leakAll.slice(55, 80));
  const seedResults = [];
  for (let seed = 1; seed <= 25; seed++) {
    const params = initParams(seed, 16);
    trainSteps(params, leakTr, 600, 0.3, 0);
    seedResults.push({ seed, valAcc: evalSet(params, leakVal).acc, testAcc: evalSet(params, leakTest).acc });
  }
  const bestByVal = seedResults.reduce((a, b) => (b.valAcc > a.valAcc ? b : a));
  const bestByTestLeak = seedResults.reduce((a, b) => (b.testAcc > a.testAcc ? b : a));
  const avgTest = seedResults.reduce((s, r) => s + r.testAcc, 0) / seedResults.length;
  check('ro ri: seed tot nhat theo VAL', bestByVal.seed, 12, 0);
  check('ro ri: test acc dung quy trinh (chon theo val)', bestByVal.testAcc, 0.84, 0.001);
  check('ro ri: test acc "dep nhat" neu chon truc tiep theo test (RO RI)', bestByTestLeak.testAcc, 0.92, 0.001);
  checkTrue('ro ri: diem "dep" do chon theo test CAO HON trung binh that su', bestByTestLeak.testAcc > avgTest + 0.05);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
