// cnn_demo.js — file tải về của Bài 11 (CNN — mạng tích chập). Dùng đúng
// NeuroJS (Tensor/conv2d/maxPool2d/flatten Bài 11, Adam Bài 9, softmax-CE
// Bài 10) — KHÔNG dùng framework ngoài. Train 1 CNN nhỏ trên ĐÚNG subset
// MNIST của Bài 10 (mnist-subset.bin), verify bằng số: ít tham số hơn HẲN
// MLP Bài 10 nhưng accuracy tương đương/nhỉnh hơn và overfit ít hơn RÕ RỆT.

import { Tensor, add, matmul, relu, Adam, softmaxCrossEntropy, conv2d, maxPool2d, flatten } from './ai-neuro.js';

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

// --- Định dạng mnist-subset.bin: giống hệt Bài 10 (mnist_project_demo.js) ---
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
    for (let p = 0; p < rows * cols; p++) pixels[p] = buf[base + 1 + p] / 255;
    samples.push({ label, pixels });
  }
  return { samples, rows, cols };
}

// --- Kiến trúc: conv(1->4,3x3) -> ReLU -> pool(2x2) -> conv(4->8,3x3) ->
// ReLU -> pool(2x2) -> flatten -> fc(200->10). 28x28 -> 26x26 -> 13x13 ->
// 11x11 -> 5x5 (8 kenh) -> flatten 200 -> 10 lop. He init cho moi lop
// (Bai 9), fan_in = Cin*KH*KW cho conv (dung dinh nghia fan-in cua conv).
function initCNN(seed) {
  const rng = mulberry32(seed);
  const K1 = new Tensor(
    Array.from({ length: 4 * 1 * 3 * 3 }, () => gaussian(rng) * Math.sqrt(2 / (1 * 3 * 3))),
    [4, 1, 3, 3]
  );
  const B1 = Tensor.zeros([4]);
  const K2 = new Tensor(
    Array.from({ length: 8 * 4 * 3 * 3 }, () => gaussian(rng) * Math.sqrt(2 / (4 * 3 * 3))),
    [8, 4, 3, 3]
  );
  const B2 = Tensor.zeros([8]);
  const Wfc = new Tensor(
    Array.from({ length: 200 * 10 }, () => gaussian(rng) * Math.sqrt(2 / 200)),
    [200, 10]
  );
  const Bfc = Tensor.zeros([10]);
  return { K1, B1, K2, B2, Wfc, Bfc };
}
function paramList(params) {
  return [params.K1, params.B1, params.K2, params.B2, params.Wfc, params.Bfc];
}
function countParams(params) {
  return paramList(params).reduce((s, p) => s + p.size, 0);
}

// forwardCNN: nhan 1 ANH DUY NHAT (khong co chieu batch — ly do don gian +
// hieu nang, xem Bai 11 Muc 5), tra ve logits shape (1,10).
function forwardCNN(params, pixels) {
  const img = new Tensor(pixels, [1, 28, 28]);
  const c1 = conv2d(img, params.K1, params.B1, 1, 0);
  const r1 = relu(c1);
  const p1 = maxPool2d(r1, 2, 2);
  const c2 = conv2d(p1, params.K2, params.B2, 1, 0);
  const r2 = relu(c2);
  const p2 = maxPool2d(r2, 2, 2);
  const f = flatten(p2);
  return add(matmul(f, params.Wfc), params.Bfc);
}

// evalAccuracyCNN: danh gia tren tap arr, tra ve accuracy + confusion matrix
function evalAccuracyCNN(params, arr) {
  let correct = 0;
  const confusion = Array.from({ length: 10 }, () => new Array(10).fill(0));
  for (const s of arr) {
    const logits = forwardCNN(params, s.pixels);
    let best = 0,
      bestVal = -Infinity;
    for (let c = 0; c < 10; c++)
      if (logits.data[c] > bestVal) {
        bestVal = logits.data[c];
        best = c;
      }
    if (best === s.label) correct++;
    confusion[s.label][best]++;
  }
  return { acc: correct / arr.length, confusion };
}

// trainCNN: batch KHONG dung 1 Tensor gop (khac Bai 10 MLP) — moi anh forward
// + backward RIENG (gradient cong don qua nhieu lan backward(), dung cach
// Bai 7 day), roi CHIA DEU cho batchSize truoc khi optimizer.step() de dung
// dinh nghia "gradient trung binh tren batch". Don gian hoa nay tranh phai
// them 1 op "stack N anh" moi vao engine chi de dung 1 lan.
function trainCNN({ params, trainSet, epochs, batchSize, lr, seed }) {
  const opt = new Adam(paramList(params), lr);
  const rng = mulberry32(seed);
  let order = trainSet.map((_, i) => i);
  const valHistory = [];
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let b = 0; b < order.length; b += batchSize) {
      const idxs = order.slice(b, b + batchSize);
      paramList(params).forEach((p) => p.zeroGrad());
      for (const idx of idxs) {
        const s = trainSet[idx];
        const logits = forwardCNN(params, s.pixels);
        const y = new Tensor(new Float32Array(10), [1, 10]);
        y.data[s.label] = 1;
        const L = softmaxCrossEntropy(logits, y);
        L.backward();
      }
      paramList(params).forEach((p) => {
        for (let i = 0; i < p.size; i++) p.grad[i] /= idxs.length;
      });
      opt.step();
    }
  }
  return valHistory;
}

export { parseMnistBin, initCNN, paramList, countParams, forwardCNN, evalAccuracyCNN, trainCNN };

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
  const { samples } = parseMnistBin(buf);
  const TRAIN = samples.slice(0, 1600);
  const VAL = samples.slice(1600, 2000);

  const params = initCNN(1);
  check('CNN: tong tham so = 2346 (43x it hon MLP Bai 10: 101.770)', countParams(params), 2346, 0);

  console.log('Dang train CNN (8 epoch, ~10-15s)...');
  trainCNN({ params, trainSet: TRAIN, epochs: 8, batchSize: 32, lr: 0.001, seed: 7 });
  const val = evalAccuracyCNN(params, VAL);
  const train = evalAccuracyCNN(params, TRAIN);
  check('CNN: train accuracy', train.acc, 0.9194, 1e-3);
  check('CNN: val accuracy', val.acc, 0.9, 1e-3);
  checkTrue('CNN: val accuracy >= MLP Bai 10 (0,895) du it hon 43x tham so', val.acc >= 0.895);
  checkTrue('CNN: khoang cach train-val NHO HON HAN MLP Bai 10 (10,5 diem %)', train.acc - val.acc < 0.05);
  checkTrue('CNN: digit 6 khong loi nao (giong MLP Bai 10)', val.confusion[6][6] === 35);
  const diagSum = val.confusion.reduce((s, row, i) => s + row[i], 0);
  checkTrue('confusion matrix: tong duong cheo khop accuracy', Math.abs(diagSum / 400 - val.acc) < 1e-9);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
