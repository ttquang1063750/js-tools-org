// mlp_xor.js — Neuron & MLP từ số 0: XOR, backward viết TAY (chưa autograd)
// Bài 6: Neuron & mạng MLP
// js-tools.org/blog/ai/ai-mlp-neural-network
//
// Forward pass dùng NeuroJS (import từ ai-neuro.js, Bài 5) — matmul/add đã
// có sẵn, không viết lại. Backward pass tính TAY bằng chain rule (Bài 7 sẽ
// thay bằng autograd tổng quát — đây là lần cuối phải tự đạo hàm).
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node mlp_xor.js
// Kỳ vọng in ra: "SELF-TEST PASS (22 checks)" — đối chiếu tính tay, chứng
// minh XOR không tách tuyến tính được, và cả 2 seed minh hoạ cạm bẫy Mục 3.

import { Tensor, matmul, add } from './ai-neuro.js';

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}
function tanhFn(z) {
  return Math.tanh(z);
}
function relu(z) {
  return Math.max(0, z);
}
function reluDeriv(z) {
  return z > 0 ? 1 : 0;
}

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

const XOR_X = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
const XOR_Y = [0, 1, 1, 0];

// ---------------------------------------------------------------------------
// Mục 1: logistic regression thuần (không hidden layer) trên XOR — CHỨNG
// MINH bằng số XOR không tách tuyến tính được: hội tụ về w=0, b=0, loss
// đúng bằng ln(2) (đoán ngẫu nhiên), accuracy 2/4 — bất kể learning rate hay
// khởi tạo (do tính đối xứng hoàn hảo của bài toán XOR).
// ---------------------------------------------------------------------------
function trainLogisticOnXOR(w0, lr, epochs) {
  let [w1, w2, b] = w0;
  for (let e = 0; e < epochs; e++) {
    let g1 = 0,
      g2 = 0,
      gb = 0;
    for (let i = 0; i < 4; i++) {
      const err = sigmoid(w1 * XOR_X[i][0] + w2 * XOR_X[i][1] + b) - XOR_Y[i];
      g1 += (err * XOR_X[i][0]) / 4;
      g2 += (err * XOR_X[i][1]) / 4;
      gb += err / 4;
    }
    w1 -= lr * g1;
    w2 -= lr * g2;
    b -= lr * gb;
  }
  let loss = 0,
    correct = 0;
  for (let i = 0; i < 4; i++) {
    const p = sigmoid(w1 * XOR_X[i][0] + w2 * XOR_X[i][1] + b);
    const pc = Math.min(Math.max(p, 1e-9), 1 - 1e-9);
    loss += -(XOR_Y[i] * Math.log(pc) + (1 - XOR_Y[i]) * Math.log(1 - pc)) / 4;
    if ((p >= 0.5 ? 1 : 0) === XOR_Y[i]) correct++;
  }
  return { w1, w2, b, loss, correct };
}

// ---------------------------------------------------------------------------
// Mục 3/5: MLP 2 → H → 1 (hidden dùng tanh hoặc relu, output sigmoid).
// Forward pass dùng NeuroJS (matmul/add) đúng yêu cầu bài viết; backward
// TÍNH TAY bằng chain rule (không dùng autograd — Bài 7 mới có).
// ---------------------------------------------------------------------------
function initParams(seed, H) {
  const rng = mulberry32(seed);
  const r = () => (rng() - 0.5) * 1.6; // uniform trong [-0.8, 0.8]
  return {
    W1: Array.from({ length: 2 }, () => Array.from({ length: H }, () => r())),
    b1: new Array(H).fill(0),
    W2: Array.from({ length: H }, () => [r()]),
    b2: [0],
    H,
  };
}

// Forward: dùng NeuroJS cho phần MA TRẬN (matmul + add) — không viết lại
// vòng lặp nhân ma trận, đúng tinh thần "engine dùng chung" của Bài 5.
function forward(params, X, actName) {
  const act = actName === 'relu' ? relu : tanhFn;
  const Xt = Tensor.fromNested(X);
  const W1t = Tensor.fromNested(params.W1);
  const b1t = Tensor.fromNested(params.b1);
  const z1t = add(matmul(Xt, W1t), b1t);
  const z1 = z1t.toNested();
  const a1 = z1.map((row) => row.map(act));
  const a1t = Tensor.fromNested(a1);
  const W2t = Tensor.fromNested(params.W2);
  const b2t = Tensor.fromNested(params.b2);
  const z2t = add(matmul(a1t, W2t), b2t);
  const z2 = z2t.toNested().map((row) => row[0]);
  const yhat = z2.map(sigmoid);
  return { z1, a1, yhat };
}

// Backward: CHAIN RULE tính tay (xem Mục 5 bài viết cho từng bước suy ra).
// dL/dz2 = yhat - y (kết quả đẹp giống hệt Bài 3, không đổi khi thêm hidden layer).
function trainStep(params, X, y, lr, actName) {
  const N = X.length,
    H = params.H;
  const actDeriv = actName === 'relu' ? reluDeriv : (z) => 1 - Math.tanh(z) ** 2;
  const { z1, a1, yhat } = forward(params, X, actName);

  const dz2 = yhat.map((p, i) => p - y[i]);
  const dW2 = Array.from({ length: H }, () => [0]);
  let db2 = 0;
  for (let i = 0; i < N; i++) {
    for (let h = 0; h < H; h++) dW2[h][0] += (a1[i][h] * dz2[i]) / N;
    db2 += dz2[i] / N;
  }
  const da1 = a1.map((row, i) => row.map((_, h) => dz2[i] * params.W2[h][0]));
  const dz1 = z1.map((row, i) => row.map((z, h) => da1[i][h] * actDeriv(z)));
  const dW1 = Array.from({ length: 2 }, () => new Array(H).fill(0));
  const db1 = new Array(H).fill(0);
  for (let i = 0; i < N; i++) {
    for (let h = 0; h < H; h++) {
      dW1[0][h] += (X[i][0] * dz1[i][h]) / N;
      dW1[1][h] += (X[i][1] * dz1[i][h]) / N;
      db1[h] += dz1[i][h] / N;
    }
  }
  for (let h = 0; h < H; h++) params.W2[h][0] -= lr * dW2[h][0];
  params.b2[0] -= lr * db2;
  for (let h = 0; h < H; h++) {
    params.W1[0][h] -= lr * dW1[0][h];
    params.W1[1][h] -= lr * dW1[1][h];
    params.b1[h] -= lr * db1[h];
  }
  let loss = 0;
  for (let i = 0; i < N; i++) {
    const p = Math.min(Math.max(yhat[i], 1e-9), 1 - 1e-9);
    loss += -(y[i] * Math.log(p) + (1 - y[i]) * Math.log(1 - p)) / N;
  }
  return loss;
}

function trainOnXOR(seed, H, actName, epochs, lr) {
  const params = initParams(seed, H);
  let loss;
  for (let e = 0; e < epochs; e++) loss = trainStep(params, XOR_X, XOR_Y, lr, actName);
  const { z1, yhat } = forward(params, XOR_X, actName);
  let correct = 0;
  XOR_X.forEach((x, i) => {
    if ((yhat[i] >= 0.5 ? 1 : 0) === XOR_Y[i]) correct++;
  });
  const deadNeurons =
    actName === 'relu' ? Array.from({ length: H }, (_, h) => h).filter((h) => z1.every((row) => row[h] <= 0)) : [];
  return { params, loss, correct, deadNeurons };
}

export { initParams, forward, trainStep, trainOnXOR, sigmoid, tanhFn, relu, reluDeriv };

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
  function checkDeepEqual(name, got, exp) {
    checks++;
    if (JSON.stringify(got) !== JSON.stringify(exp)) {
      console.log('LOI', name, 'got=' + JSON.stringify(got), 'ky vong=' + JSON.stringify(exp));
      errors++;
    }
  }

  // --- Mục 2: chứng minh 2 lớp tuyến tính chồng nhau vẫn là tuyến tính ---
  function matVec(A, x) {
    return A.map((row) => row.reduce((s, a, i) => s + a * x[i], 0));
  }
  function matMul(A, B) {
    const m = A.length,
      k = A[0].length,
      n = B[0].length;
    const C = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) for (let p = 0; p < k; p++) C[i][j] += A[i][p] * B[p][j];
    return C;
  }
  const W1ex = [
    [1, 2],
    [3, 4],
    [5, 6],
  ];
  const W2ex = [
    [1, 0, 1],
    [2, 1, 0],
  ];
  const xex = [1, 2];
  checkDeepEqual('W2(W1 x) == (W2 W1) x', matVec(W2ex, matVec(W1ex, xex)), matVec(matMul(W2ex, W1ex), xex));

  // --- Mục 2: bảng đạo hàm activation (điểm kiểm tra) ---
  check('sigmoid(1)', sigmoid(1), 0.7311, 1e-3);
  check("sigmoid'(1) = sigmoid(1-sigmoid)", sigmoid(1) * (1 - sigmoid(1)), 0.1966, 1e-3);
  check('tanh(1)', tanhFn(1), 0.7616, 1e-3);
  check("tanh'(1) = 1-tanh^2", 1 - tanhFn(1) ** 2, 0.42, 1e-2);
  check('relu(-1)', relu(-1), 0);
  check("relu'(-1)", reluDeriv(-1), 0);
  check("relu'(1)", reluDeriv(1), 1);

  // --- Mục 2: dying ReLU — trạng thái "chết" là điểm bất động tuyệt đối ---
  const deadW = 0.1,
    deadB = -5;
  const xs5 = [-2, -1, 0, 1, 2];
  checkTrue(
    'dying ReLU: z<0 tren MOI diem du lieu',
    xs5.every((x) => deadW * x + deadB < 0)
  );
  // gradient tai trang thai chet (dL/dw, dL/db) phai dung 0 vi relu'(z<0)=0
  let gwDead = 0,
    gbDead = 0;
  for (const x of xs5) {
    const z = deadW * x + deadB;
    const a = relu(z);
    const err = a - (2 * x + 1);
    const dz = err * reluDeriv(z);
    gwDead += dz * x;
    gbDead += dz;
  }
  check('dying ReLU: gradient dW = 0', gwDead, 0, 1e-9);
  check('dying ReLU: gradient dB = 0', gbDead, 0, 1e-9);

  // --- Mục 4: XOR không tách tuyến tính được — logistic regression thuần ---
  const logisticResult = trainLogisticOnXOR([0.1, -0.05, 0.02], 0.5, 3000);
  check('XOR logistic: hoi tu w1 -> 0', logisticResult.w1, 0, 1e-3);
  check('XOR logistic: loss hoi tu ve ln(2)', logisticResult.loss, Math.log(2), 1e-3);
  check('XOR logistic: accuracy 2/4', logisticResult.correct, 2);

  // --- Mục 4: 1 hidden layer (tanh) giải XOR gọn — seed=42 ---
  const tanhGood = trainOnXOR(42, 2, 'tanh', 3000, 0.5);
  checkTrue('XOR MLP tanh seed=42: loss < 0.01', tanhGood.loss < 0.01);
  check('XOR MLP tanh seed=42: accuracy', tanhGood.correct, 4);

  // --- Mục 4 (pitfall): universal approximation KHÔNG đảm bảo GD tìm ra —
  // CÙNG kiến trúc, 2 seed cho 2 kết cục khác hẳn nhau ---
  const tanhStuck = trainOnXOR(1, 2, 'tanh', 3000, 0.5);
  checkTrue('XOR MLP tanh seed=1: mac ket o local optimum', tanhStuck.correct < 4 && tanhStuck.loss > 0.1);
  const tanhSolved = trainOnXOR(2, 2, 'tanh', 3000, 0.5);
  checkTrue('XOR MLP tanh seed=2: giai dung hoan toan', tanhSolved.correct === 4 && tanhSolved.loss < 0.01);

  // --- Mục 2 (pitfall thực chiến): ReLU trên kiến trúc y het de "chet" hon tanh ---
  const reluDeadCase = trainOnXOR(13, 2, 'relu', 3000, 0.5);
  checkTrue('XOR MLP relu seed=13: ca 2 neuron chet', reluDeadCase.deadNeurons.length === 2);
  check('XOR MLP relu seed=13: loss = ln(2) (sup sup ve hang so)', reluDeadCase.loss, Math.log(2), 1e-3);

  // --- Mục 5: đếm tham số ---
  check('dem tham so kien truc 2->2->1', 2 * 2 + 2 + (2 * 1 + 1), 9, 0);
  check('dem tham so kien truc 2->4->1', 2 * 4 + 4 + (4 * 1 + 1), 17, 0);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
