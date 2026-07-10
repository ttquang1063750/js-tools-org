// optimizer_race_demo.js — file tải về của Bài 9 (Tối ưu hoá nâng cao).
// SGD/Momentum/RMSProp/Adam đã sống trong ai-neuro.js (self-test riêng ở đó
// verify công thức + đua trên loss ravine). File này verify 2 mảnh còn lại
// của bài: (1) zero-init làm mạng "chết" hoàn toàn (gradient = 0 từ bước đầu
// tiên, không phải chỉ đối xứng), (2) Xavier/He giữ phương sai tín hiệu qua
// nhiều layer trong khi std quá nhỏ/quá lớn làm nó vanish/explode — CHỈ qua
// FORWARD pass, chưa cần đụng tới backward.

import { Tensor, add, mul, matmul, relu, sigmoid, sum, SGD } from './ai-neuro.js';

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

// --- Zero-init: MLP 2->H->1, MỌI trọng số khởi tạo bằng 0 (bias cũng 0) ---
// dL/dW2 = a1^T @ dL/dz2 = 0 (vi a1=relu(0)=0 MOI hidden unit) nen W2 KHONG
// BAO GIO doi khoi 0; dL/da1 = dL/dz2 @ W2^T = 0 (vi W2=0) nen dL/dz1 = 0 nen
// dL/dW1 = X^T @ dL/dz1 = 0 - CA W1 VA W2 dong bang vinh vien o 0, bat ke train
// bao lau. CHI b2 (bias dau ra) con nhan gradient (dL/db2 = dL/dz2, khong nhan
// voi a1 nen khong bi trieu tieu) - mang thoai hoa thanh "hoc dung 1 hang so",
// HOAN TOAN PHOT LO input: du doan tren 2 input RAT KHAC NHAU van y het nhau.
function zeroInitDeadGradient(H, steps) {
  const W1 = Tensor.zeros([2, H]);
  const b1 = Tensor.zeros([H]);
  const W2 = Tensor.zeros([H, 1]);
  const b2 = Tensor.zeros([1]);
  const params = [W1, b1, W2, b2];
  const opt = new SGD(params, 0.5);
  const X = Tensor.fromNested([[1, 2]]);
  const y = Tensor.fromNested([[1]]);
  function forward(Xin) {
    const z1 = add(matmul(Xin, W1), b1);
    const a1 = relu(z1);
    const z2 = add(matmul(a1, W2), b2);
    return sigmoid(z2);
  }
  for (let step = 0; step < steps; step++) {
    params.forEach((p) => p.zeroGrad());
    const yhat = forward(X);
    const negY = mul(y, Tensor.fromNested([-1]));
    const diff = add(yhat, negY);
    const L = sum(mul(diff, diff));
    L.backward();
    opt.step();
  }
  const w1AllZero = W1.data.every((v) => v === 0);
  const w2AllZero = W2.data.every((v) => v === 0);
  const predTrained = forward(X).data[0]; // input da train, X=[1,2]
  const predOther = forward(Tensor.fromNested([[50, -30]])).data[0]; // input RAT khac
  return { w1AllZero, w2AllZero, predTrained, predOther };
}

// --- Variance qua forward pass N layer Linear(fanIn,fanIn)+ReLU khong bias,
// trong so ~ N(0, std^2). Do phuong sai activation tai moi layer.
function forwardVariance(std, numLayers, fanIn, seed) {
  const rng = mulberry32(seed);
  let x = new Float32Array(fanIn);
  for (let i = 0; i < fanIn; i++) x[i] = gaussian(rng);
  function variance(arr) {
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length;
  }
  const variances = [variance(Array.from(x))];
  for (let layer = 0; layer < numLayers; layer++) {
    const z = new Float32Array(fanIn);
    for (let j = 0; j < fanIn; j++) {
      let s = 0;
      for (let i = 0; i < fanIn; i++) s += x[i] * (gaussian(rng) * std);
      z[j] = Math.max(0, s);
    }
    x = z;
    variances.push(variance(Array.from(x)));
  }
  return variances;
}

export { zeroInitDeadGradient, forwardVariance };

// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  let errors = 0;
  let checks = 0;
  function checkTrue(name, cond) {
    checks++;
    if (!cond) {
      console.log('LOI', name);
      errors++;
    }
  }

  // --- Zero-init: W1/W2 dong bang vinh vien o 0, mang thoai hoa thanh 1 hang so ---
  const zi = zeroInitDeadGradient(4, 30);
  checkTrue('zero-init: W1 van con 0 sau 30 buoc (khong bao gio thoat doi xung)', zi.w1AllZero);
  checkTrue('zero-init: W2 van con 0 sau 30 buoc', zi.w2AllZero);
  checkTrue(
    'zero-init: du doan tren 2 input RAT KHAC NHAU van GIONG HET nhau (mang phot lo input hoan toan)',
    Math.abs(zi.predTrained - zi.predOther) < 1e-9
  );
  console.log('zero-init du doan X=[1,2] va X=[50,-30] sau 30 buoc:', zi.predTrained, 'vs', zi.predOther);

  // --- Variance forward 20 layer: qua nho/qua lon vanish/explode, He on dinh ---
  const fanIn = 64,
    numLayers = 20,
    seed = 7;
  const vTooSmall = forwardVariance(0.01, numLayers, fanIn, seed);
  const vTooBig = forwardVariance(1.0, numLayers, fanIn, seed);
  const vXavier = forwardVariance(1 / Math.sqrt(fanIn), numLayers, fanIn, seed);
  const vHe = forwardVariance(Math.sqrt(2 / fanIn), numLayers, fanIn, seed);
  checkTrue('std qua nho (0,01): variance vanish gan ve 0 sau 20 layer', vTooSmall[20] < 1e-30);
  checkTrue('std qua lon (1,0): variance explode sau 20 layer', vTooBig[20] > 1e20);
  checkTrue(
    'Xavier: van suy giam ro ret qua 20 layer ReLU (thiet ke cho tanh, khong bu du he so ReLU)',
    vXavier[20] < 1e-5
  );
  checkTrue(
    'He: on dinh trong khoang hop ly qua 20 layer (khong vanish, khong explode)',
    vHe[20] > 1e-2 && vHe[20] < 10
  );
  console.log(
    'Variance layer 20 -- qua nho:',
    vTooSmall[20].toExponential(2),
    '| qua lon:',
    vTooBig[20].toExponential(2),
    '| Xavier:',
    vXavier[20].toExponential(2),
    '| He:',
    vHe[20].toExponential(2)
  );

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
