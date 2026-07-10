// mnist_project_demo.js — file tải về của Bài 10 (Dự án 1: Nhận dạng chữ số
// MNIST). Dùng đúng NeuroJS (Tensor/matmul/relu/softmaxCrossEntropy Bài 5-10,
// Adam/SGD Bài 9) — KHÔNG dùng framework ngoài. Load subset MNIST vendored
// (mnist-subset.bin, 2000 mẫu 200/chữ số, xem make-mnist-subset.js), train
// MLP 784→128→10 thật, verify pipeline shuffle + domain shift bằng số đo được.

import { Tensor, add, matmul, relu, Adam, SGD, softmaxCrossEntropy } from './ai-neuro.js';

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

// --- Định dạng mnist-subset.bin: xem make-mnist-subset.js Mục đầu file ---
function parseMnistBin(buf) {
  if (buf[0] !== 0x4d || buf[1] !== 0x4e || buf[2] !== 0x53 || buf[3] !== 0x31) throw new Error('magic MNS1 sai');
  const count = buf[4] | (buf[5] << 8);
  const rows = buf[6],
    cols = buf[7];
  const sampleBytes = 1 + rows * cols;
  const samples = [];
  for (let k = 0; k < count; k++) {
    const base = 8 + k * sampleBytes;
    const label = buf[base];
    const pixels = new Float32Array(rows * cols);
    for (let p = 0; p < rows * cols; p++) pixels[p] = buf[base + 1 + p] / 255; // chuan hoa [0,1]
    samples.push({ label, pixels });
  }
  return { samples, rows, cols };
}

// --- MLP 784->H->10, He init (Bài 9) ---
function initParams(seed, inDim, H, outDim) {
  const rng = mulberry32(seed);
  const heStd1 = Math.sqrt(2 / inDim),
    heStd2 = Math.sqrt(2 / H);
  const W1 = new Float32Array(inDim * H);
  for (let i = 0; i < W1.length; i++) W1[i] = gaussian(rng) * heStd1;
  const W2 = new Float32Array(H * outDim);
  for (let i = 0; i < W2.length; i++) W2[i] = gaussian(rng) * heStd2;
  return {
    W1: new Tensor(W1, [inDim, H]),
    b1: Tensor.zeros([H]),
    W2: new Tensor(W2, [H, outDim]),
    b2: Tensor.zeros([outDim]),
  };
}
function forward(params, X) {
  const z1 = add(matmul(X, params.W1), params.b1);
  const a1 = relu(z1);
  return add(matmul(a1, params.W2), params.b2); // logits (softmax ap dung trong loss/predict)
}
function toBatch(samplesArr, idxs, rows, cols) {
  const N = idxs.length,
    D = rows * cols,
    C = 10;
  const X = new Float32Array(N * D),
    Y = new Float32Array(N * C);
  idxs.forEach((idx, i) => {
    const s = samplesArr[idx];
    X.set(s.pixels, i * D);
    Y[i * C + s.label] = 1;
  });
  return { X: new Tensor(X, [N, D]), Y: new Tensor(Y, [N, C]), labels: idxs.map((idx) => samplesArr[idx].label) };
}

// --- Vong lap train mini-batch: shuffleEachEpoch=false + sortByLabel=true
// tai hien DUNG cam bay Muc 2 bai viet (du lieu xep tuan tu theo nhan pha
// nat SGD).
function trainRun({ trainSet, rows, cols, shuffleEachEpoch, sortByLabel, epochs, batchSize, optimizerFactory, seed }) {
  let order = trainSet.map((_, i) => i);
  if (sortByLabel) order.sort((a, b) => trainSet[a].label - trainSet[b].label);
  const params = initParams(1, rows * cols, 128, 10);
  const opt = optimizerFactory(Object.values(params));
  const rng = mulberry32(seed);
  const history = [];
  let step = 0;
  for (let epoch = 0; epoch < epochs; epoch++) {
    if (shuffleEachEpoch) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    for (let b = 0; b < order.length; b += batchSize) {
      const idxs = order.slice(b, b + batchSize);
      const batch = toBatch(trainSet, idxs, rows, cols);
      Object.values(params).forEach((p) => p.zeroGrad());
      const logits = forward(params, batch.X);
      const L = softmaxCrossEntropy(logits, batch.Y);
      L.backward();
      opt.step();
      step++;
      history.push({ step, loss: L.data[0] });
    }
  }
  return { params, history };
}

function evalAccuracy(params, arr, rows, cols) {
  const idxs = arr.map((_, i) => i);
  const batch = toBatch(arr, idxs, rows, cols);
  const logits = forward(params, batch.X);
  const N = arr.length,
    C = 10;
  let correct = 0;
  const confusion = Array.from({ length: 10 }, () => new Array(10).fill(0));
  for (let i = 0; i < N; i++) {
    let best = 0,
      bestVal = -Infinity;
    for (let c = 0; c < C; c++) {
      const v = logits.data[i * C + c];
      if (v > bestVal) {
        bestVal = v;
        best = c;
      }
    }
    if (best === batch.labels[i]) correct++;
    confusion[batch.labels[i]][best]++;
  }
  return { acc: correct / N, confusion };
}

// predict(): du doan tren 1 anh don, tra ca xac suat 10 lop (softmax logits)
function predict(params, pixels, rows, cols) {
  const X = new Tensor(pixels, [1, rows * cols]);
  const logits = forward(params, X);
  const C = 10;
  let maxLogit = -Infinity;
  for (let c = 0; c < C; c++) maxLogit = Math.max(maxLogit, logits.data[c]);
  const probs = new Array(C);
  let sumExp = 0;
  for (let c = 0; c < C; c++) {
    probs[c] = Math.exp(logits.data[c] - maxLogit);
    sumExp += probs[c];
  }
  for (let c = 0; c < C; c++) probs[c] /= sumExp;
  let best = 0,
    bestProb = -1;
  for (let c = 0; c < C; c++)
    if (probs[c] > bestProb) {
      bestProb = probs[c];
      best = c;
    }
  return { pred: best, prob: bestProb, probs };
}

// --- Domain shift: dich anh (dx,dy) pixel, dem lai bang trong tam (center of
// mass) - dung Muc 5 bai viet (net ve chuot lech tam so voi anh MNIST goc).
function shiftImage(pixels, dx, dy, rows, cols) {
  const out = new Float32Array(rows * cols);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const sx = x - dx,
        sy = y - dy;
      if (sx >= 0 && sx < cols && sy >= 0 && sy < rows) out[y * cols + x] = pixels[sy * cols + sx];
    }
  return out;
}
function centroid(pixels, rows, cols) {
  let sumX = 0,
    sumY = 0,
    sumW = 0;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const w = pixels[y * cols + x];
      sumX += w * x;
      sumY += w * y;
      sumW += w;
    }
  return { cx: sumX / sumW, cy: sumY / sumW };
}
function recenter(pixels, rows, cols) {
  const { cx, cy } = centroid(pixels, rows, cols);
  const dx = Math.round(cols / 2 - cx),
    dy = Math.round(rows / 2 - cy);
  return shiftImage(pixels, dx, dy, rows, cols);
}

export { parseMnistBin, initParams, forward, toBatch, trainRun, evalAccuracy, predict, shiftImage, centroid, recenter };

// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs');
  let errors = 0;
  let checks = 0;
  function check(name, got, exp, tol = 1e-4) {
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

  const buf = fs.readFileSync(new URL('./mnist-subset.bin', import.meta.url));
  const { samples, rows, cols } = parseMnistBin(buf);
  checkTrue('load mnist-subset.bin: dung 2000 mau', samples.length === 2000);
  checkTrue('load mnist-subset.bin: 28x28', rows === 28 && cols === 28);
  const dist = new Array(10).fill(0);
  samples.forEach((s) => dist[s.label]++);
  checkTrue(
    'phan bo nhan can bang 200/chu so',
    dist.every((d) => d === 200)
  );

  const TRAIN = samples.slice(0, 1600);
  const VAL = samples.slice(1600, 2000);

  console.log('Dang train MLP chinh (Adam, 15 epoch)...');
  const main = trainRun({
    trainSet: TRAIN,
    rows,
    cols,
    shuffleEachEpoch: true,
    sortByLabel: false,
    epochs: 15,
    batchSize: 32,
    optimizerFactory: (params) => new Adam(params, 0.001),
    seed: 7,
  });
  const mainVal = evalAccuracy(main.params, VAL, rows, cols);
  const mainTrain = evalAccuracy(main.params, TRAIN, rows, cols);
  check('MLP chinh: train accuracy', mainTrain.acc, 1.0, 1e-6);
  check('MLP chinh: val accuracy', mainVal.acc, 0.895, 1e-6);
  const diagSum = mainVal.confusion.reduce((s, row, i) => s + row[i], 0);
  checkTrue('confusion matrix: tong duong cheo khop accuracy', Math.abs(diagSum / 400 - mainVal.acc) < 1e-9);
  checkTrue('confusion matrix: chu so 6 khong loi nao (val)', mainVal.confusion[6][6] === 35);

  console.log('Dang chay so sanh shuffle vs khong shuffle (SGD+momentum, 15 epoch)...');
  const shuffledRun = trainRun({
    trainSet: TRAIN,
    rows,
    cols,
    shuffleEachEpoch: true,
    sortByLabel: false,
    epochs: 15,
    batchSize: 32,
    optimizerFactory: (params) => new SGD(params, 0.1, 0.9),
    seed: 7,
  });
  const noShuffleRun = trainRun({
    trainSet: TRAIN,
    rows,
    cols,
    shuffleEachEpoch: false,
    sortByLabel: true,
    epochs: 15,
    batchSize: 32,
    optimizerFactory: (params) => new SGD(params, 0.1, 0.9),
    seed: 7,
  });
  const shuffledVal = evalAccuracy(shuffledRun.params, VAL, rows, cols);
  const noShuffleVal = evalAccuracy(noShuffleRun.params, VAL, rows, cols);
  check('shuffle MOI epoch: val accuracy cao', shuffledVal.acc, 0.91, 1e-6);
  check('KHONG shuffle (sap theo nhan): val accuracy gan nhu ngau nhien', noShuffleVal.acc, 0.1575, 1e-6);
  function stddev(arr) {
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length);
  }
  const stdShuffled = stddev(shuffledRun.history.slice(0, 50).map((h) => h.loss));
  const stdNoShuffle = stddev(noShuffleRun.history.slice(0, 50).map((h) => h.loss));
  checkTrue('KHONG shuffle: do bien thien loss trong epoch 1 cao hon HAN (rang cua)', stdNoShuffle > stdShuffled * 5);
  console.log('stddev loss epoch 1 -- shuffle:', stdShuffled.toFixed(3), '| khong shuffle:', stdNoShuffle.toFixed(3));

  console.log('Dang kiem tra domain shift (dich anh + recenter)...');
  let n = 0,
    correctShift = 0,
    correctRecenter = 0;
  for (const s of VAL) {
    if (n >= 50) break;
    const base = predict(main.params, s.pixels, rows, cols);
    if (base.pred !== s.label) continue;
    n++;
    const shifted = shiftImage(s.pixels, 5, 5, rows, cols);
    const shiftedResult = predict(main.params, shifted, rows, cols);
    const recentered = recenter(shifted, rows, cols);
    const recenteredResult = predict(main.params, recentered, rows, cols);
    if (shiftedResult.pred === s.label) correctShift++;
    if (recenteredResult.pred === s.label) correctRecenter++;
  }
  check('domain shift: dich (5,5)px lam accuracy sup xuong con 2%', correctShift / n, 0.02, 1e-6);
  check('domain shift: recenter (center-of-mass) phuc hoi len 82%', correctRecenter / n, 0.82, 1e-6);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
