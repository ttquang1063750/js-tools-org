// rnn_attention_demo.js — file tải về của Bài 13 (Chuỗi: RNN → Attention).
// Dùng đúng NeuroJS (Tensor/tanh/softmax Bài 13, embeddingLookup/
// sigmoidCrossEntropy Bài 12, Adam Bài 9) — KHÔNG dùng framework ngoài.
// 3 thực nghiệm verify bằng số thật:
//   1. RNN vs Attention trên bài toán "nhớ xa" (marker) — RNN sập về mức
//      đoán bừa khi chuỗi dài, Attention không hề suy giảm.
//   2. Gradient bùng nổ qua chuỗi dài + gradient clipping.
//   3. Attention thật trên câu Truyện Kiều — tìm từ "hoa".

import { Tensor, add, matmul, tanh, softmax, flatten, sigmoidCrossEntropy, embeddingLookup, Adam } from './ai-neuro.js';

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

// ===========================================================================
// Thực nghiệm 1: bài toán "nhớ xa" (long-range recall) — vocab tí hon 4 ký
// hiệu: 0/1 la nhieu (filler ngau nhien, khong mang thong tin), MARKER0/
// MARKER1 la 1 TIN HIEU DUY NHAT xuat hien o VI TRI NGAU NHIEN trong chuoi —
// nhan = danh tinh cua marker do (0 hay 1). Model phai "tim" marker giua
// nhieu filler roi doc DUNG danh tinh cua no, bat ke no nam o dau.
// ===========================================================================
const MARKER0 = 2,
  MARKER1 = 3,
  RECALL_VOCAB = 4;

function makeRecallWindows(T, count, rng) {
  const windows = [];
  for (let i = 0; i < count; i++) {
    const window = [];
    for (let t = 0; t < T; t++) window.push(Math.floor(rng() * 2));
    const markerPos = Math.floor(rng() * T);
    const label = Math.floor(rng() * 2);
    window[markerPos] = label === 0 ? MARKER0 : MARKER1;
    windows.push({ window, label });
  }
  return windows;
}

function initRNN(seed, vocab, D, H) {
  const rng = mulberry32(seed);
  return {
    emb: new Tensor(
      Array.from({ length: vocab * D }, () => gaussian(rng) * 0.3),
      [vocab, D]
    ),
    Wxh: new Tensor(
      Array.from({ length: D * H }, () => gaussian(rng) * Math.sqrt(1 / D)),
      [D, H]
    ),
    Whh: new Tensor(
      Array.from({ length: H * H }, () => gaussian(rng) * Math.sqrt(1 / H)),
      [H, H]
    ),
    bh: Tensor.zeros([H]),
    Wo: new Tensor(
      Array.from({ length: H }, () => gaussian(rng) * Math.sqrt(1 / H)),
      [H, 1]
    ),
    bo: Tensor.zeros([1]),
  };
}
function forwardRNN(p, window) {
  const H = p.bh.shape[0];
  let h = new Tensor(new Float32Array(H), [1, H]);
  for (const idx of window) {
    const x = embeddingLookup(p.emb, [idx]);
    const z = add(add(matmul(x, p.Wxh), matmul(h, p.Whh)), p.bh);
    h = tanh(z);
  }
  return add(matmul(h, p.Wo), p.bo);
}
function paramsRNN(p) {
  return [p.emb, p.Wxh, p.Whh, p.bh, p.Wo, p.bo];
}

function initAttn(seed, vocab, D) {
  const rng = mulberry32(seed);
  return {
    emb: new Tensor(
      Array.from({ length: vocab * D }, () => gaussian(rng) * 0.3),
      [vocab, D]
    ),
    q: new Tensor(
      Array.from({ length: D }, () => gaussian(rng) * Math.sqrt(1 / D)),
      [D, 1]
    ),
    Wo: new Tensor(
      Array.from({ length: D }, () => gaussian(rng) * Math.sqrt(1 / D)),
      [D, 1]
    ),
    bo: Tensor.zeros([1]),
  };
}
// forwardAttn: score = key_i . q (matmul), softmax hoa qua flatten() (Bai 11)
// de doi (T,1) -> (1,T), roi context = trong so . keys (matmul lai) — TOAN
// BO chi dung op da co san, khong can them primitive moi cho attention co ban.
function forwardAttn(p, idx) {
  const keys = embeddingLookup(p.emb, idx); // (T,D)
  const scores2d = matmul(keys, p.q); // (T,1)
  const scoresRow = flatten(scores2d); // (1,T)
  const weights = softmax(scoresRow); // (1,T)
  const context = matmul(weights, keys); // (1,D)
  return { logit: add(matmul(context, p.Wo), p.bo), weights };
}
function paramsAttn(p) {
  return [p.emb, p.q, p.Wo, p.bo];
}

function trainAndEvalRecall(kind, T, seed, epochs, trainN, valN, lr) {
  const D = 8,
    H = 16;
  const rngData = mulberry32(1000 + T);
  const trainSet = makeRecallWindows(T, trainN, rngData);
  const valSet = makeRecallWindows(T, valN, rngData);
  const p = kind === 'rnn' ? initRNN(seed, RECALL_VOCAB, D, H) : initAttn(seed, RECALL_VOCAB, D);
  const params = kind === 'rnn' ? paramsRNN(p) : paramsAttn(p);
  const opt = new Adam(params, lr);
  const rngShuffle = mulberry32(seed + 500);
  let order = trainSet.map((_, i) => i);
  const BATCH = 16;
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rngShuffle() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let b = 0; b < order.length; b += BATCH) {
      const idxs = order.slice(b, b + BATCH);
      params.forEach((pp) => pp.zeroGrad());
      for (const idx of idxs) {
        const ex = trainSet[idx];
        const logit = kind === 'rnn' ? forwardRNN(p, ex.window) : forwardAttn(p, ex.window).logit;
        const L = sigmoidCrossEntropy(logit, new Tensor([ex.label], [1]));
        L.backward();
      }
      params.forEach((pp) => {
        for (let i = 0; i < pp.size; i++) pp.grad[i] /= idxs.length;
      });
      opt.step();
    }
  }
  function acc(set) {
    let correct = 0;
    for (const ex of set) {
      const logit = kind === 'rnn' ? forwardRNN(p, ex.window) : forwardAttn(p, ex.window).logit;
      if ((logit.data[0] > 0 ? 1 : 0) === ex.label) correct++;
    }
    return correct / set.length;
  }
  return { train: acc(trainSet), val: acc(valSet) };
}

// ===========================================================================
// Thực nghiệm 2: gradient bùng nổ qua chuỗi dài + gradient clipping. Đo
// chuẩn (norm) gradient tại h_0 khi lan truyền ngược qua T bước
// h_t = tanh(Whh @ h_{t-1}), Whh khởi tạo LỚN (std=2,0 — vùng exploding).
// ===========================================================================
function mulSelf(t) {
  const out = t.data.map((x) => x * x);
  const outT = new Tensor(out, t.shape);
  outT._prev = [t];
  outT._backward = () => {
    t._ensureGrad();
    for (let i = 0; i < t.size; i++) t.grad[i] += 2 * t.data[i] * outT.grad[i];
  };
  return outT;
}
function gradNormAtStep0(T, whhScale, H, seed) {
  const rng = mulberry32(seed);
  const Whh = new Tensor(
    Array.from({ length: H * H }, () => gaussian(rng) * whhScale),
    [H, H]
  );
  let h = new Tensor(
    Array.from({ length: H }, () => gaussian(rng) * 0.5),
    [1, H]
  );
  const h0 = h;
  for (let t = 0; t < T; t++) h = tanh(matmul(h, Whh));
  const L = mulSelf(h);
  L.backward(); // L shape (1,H) khong phai scalar - backward() seed MOI phan tu
  // grad=1 nen tuong duong lan truyen nguoc tu sum(L) = ||h_T||^2 (dung y muon)
  h0._ensureGrad();
  let norm = 0;
  for (let i = 0; i < h0.grad.length; i++) norm += h0.grad[i] * h0.grad[i];
  return { norm: Math.sqrt(norm), grad: Array.from(h0.grad) };
}
function clipGradNorm(grad, maxNorm) {
  const norm = Math.sqrt(grad.reduce((s, x) => s + x * x, 0));
  const scale = Math.min(1, maxNorm / norm);
  return { clipped: grad.map((g) => g * scale), scale, normBefore: norm };
}

// ===========================================================================
// Thực nghiệm 3: attention THẬT trên câu Truyện Kiều — tìm từ "hoa". Nhãn =
// câu có chứa "hoa" hay không; verify attention TỰ tập trung vào đúng vị
// trí "hoa" bất kể nó nằm ở đâu trong câu.
// ===========================================================================
function buildSentenceDataset(text, vocabSize, targetWord, seed) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const allTokens = text.toLowerCase().match(/[\p{L}]+/gu) || [];
  const freq = {};
  allTokens.forEach((t) => (freq[t] = (freq[t] || 0) + 1));
  const vocabList = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, vocabSize)
    .map(([w]) => w);
  const word2idx = {};
  vocabList.forEach((w, i) => (word2idx[w] = i));
  const UNK = vocabSize;
  function tokenize(line) {
    const words = line.toLowerCase().match(/[\p{L}]+/gu) || [];
    return { words, idx: words.map((w) => (word2idx[w] !== undefined ? word2idx[w] : UNK)) };
  }
  const positives = [],
    negatives = [];
  for (const line of lines) {
    const { words, idx } = tokenize(line);
    if (words.length < 5) continue;
    const has = words.includes(targetWord);
    (has ? positives : negatives).push({ line, words, idx, label: has ? 1 : 0 });
  }
  const rng = mulberry32(seed);
  const shuffledNeg = negatives.slice();
  for (let i = shuffledNeg.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledNeg[i], shuffledNeg[j]] = [shuffledNeg[j], shuffledNeg[i]];
  }
  const negSample = shuffledNeg.slice(0, positives.length);
  const dataset = positives.concat(negSample);
  for (let i = dataset.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
  }
  const nVal = Math.floor(dataset.length * 0.2);
  return {
    valSet: dataset.slice(0, nVal),
    trainSet: dataset.slice(nVal),
    positives,
    negSample,
    vocabTotal: vocabSize + 1,
  };
}
function trainSentenceAttention({ trainSet, vocabTotal, dim, epochs, batchSize, lr, seed }) {
  const p = initAttn(seed, vocabTotal, dim);
  const params = paramsAttn(p);
  const opt = new Adam(params, lr);
  const rngShuffle = mulberry32(seed + 500);
  let order = trainSet.map((_, i) => i);
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rngShuffle() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let b = 0; b < order.length; b += batchSize) {
      const idxs = order.slice(b, b + batchSize);
      params.forEach((pp) => pp.zeroGrad());
      for (const idx of idxs) {
        const ex = trainSet[idx];
        const logit = forwardAttn(p, ex.idx).logit;
        const L = sigmoidCrossEntropy(logit, new Tensor([ex.label], [1]));
        L.backward();
      }
      params.forEach((pp) => {
        for (let i = 0; i < pp.size; i++) pp.grad[i] /= idxs.length;
      });
      opt.step();
    }
  }
  return p;
}
function evalSentenceAccuracy(p, set) {
  let correct = 0;
  for (const ex of set) {
    const logit = forwardAttn(p, ex.idx).logit;
    if ((logit.data[0] > 0 ? 1 : 0) === ex.label) correct++;
  }
  return correct / set.length;
}

export {
  makeRecallWindows,
  initRNN,
  forwardRNN,
  paramsRNN,
  initAttn,
  forwardAttn,
  paramsAttn,
  trainAndEvalRecall,
  gradNormAtStep0,
  clipGradNorm,
  buildSentenceDataset,
  trainSentenceAttention,
  evalSentenceAccuracy,
};

// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs');
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

  console.log('--- Thuc nghiem 1: RNN vs Attention tren bai toan nho xa ---');
  const recallResults = {};
  for (const T of [5, 10, 20, 40, 80]) {
    const rnn = trainAndEvalRecall('rnn', T, 7, 15, 400, 150, 0.02);
    const attn = trainAndEvalRecall('attn', T, 7, 15, 400, 150, 0.02);
    recallResults[T] = { rnn, attn };
    console.log(
      'T=' + T,
      'RNN train=' + rnn.train.toFixed(3) + ' val=' + rnn.val.toFixed(3),
      'Attn train=' + attn.train.toFixed(3) + ' val=' + attn.val.toFixed(3)
    );
  }
  check('T=20: RNN van hoc tot (val)', recallResults[20].rnn.val, 1.0, 1e-6);
  checkTrue('T=40: RNN SAP ve muc doan bua (val < 0.6)', recallResults[40].rnn.val < 0.6);
  checkTrue('T=80: RNN SAP ve muc doan bua (val < 0.6)', recallResults[80].rnn.val < 0.6);
  check('T=40: Attention VAN hoc hoan hao', recallResults[40].attn.val, 1.0, 1e-6);
  check('T=80: Attention VAN hoc hoan hao', recallResults[80].attn.val, 1.0, 1e-6);

  console.log('--- Thuc nghiem 2: exploding gradient + clipping ---');
  const H = 16;
  const explodeExpected = { 1: 11.9, 5: 19.81, 10: 599.2, 20: 249300, 40: 75450000 };
  const norms = {};
  for (const T of [1, 5, 10, 20, 40]) {
    const r = gradNormAtStep0(T, 2.0, H, 7);
    norms[T] = r;
    console.log('T=' + T, 'grad norm =', r.norm.toExponential(3));
  }
  checkTrue(
    'exploding: grad norm TANG DON DIEU theo T',
    norms[1].norm < norms[5].norm &&
      norms[5].norm < norms[10].norm &&
      norms[10].norm < norms[20].norm &&
      norms[20].norm < norms[40].norm
  );
  check('T=40: grad norm ~75,45 trieu (exploding ro ret)', norms[40].norm / 1e6, 75.45, 2);
  const clip = clipGradNorm(norms[40].grad, 5.0);
  check(
    'clipping: norm SAU khi clip = dung maxNorm=5',
    Math.sqrt(clip.clipped.reduce((s, x) => s + x * x, 0)),
    5.0,
    1e-6
  );
  checkTrue(
    'clipping: huong gradient GIU NGUYEN (ti le deu)',
    Math.abs(clip.clipped[0] / norms[40].grad[0] - clip.scale) < 1e-9
  );

  console.log('--- Thuc nghiem 3: attention that tren cau Truyen Kieu ("hoa") ---');
  const text = fs.readFileSync(new URL('./corpus-kieu.txt', import.meta.url), 'utf8');
  const { trainSet, valSet, positives, vocabTotal } = buildSentenceDataset(text, 300, 'hoa', 3);
  check('so cau chua "hoa"', positives.length, 130, 0);
  check('train set size (can bang 1:1)', trainSet.length, 208, 0);
  check('val set size', valSet.length, 52, 0);
  const pSentence = trainSentenceAttention({
    trainSet,
    vocabTotal,
    dim: 16,
    epochs: 25,
    batchSize: 16,
    lr: 0.02,
    seed: 7,
  });
  const trainAcc = evalSentenceAccuracy(pSentence, trainSet);
  const valAcc = evalSentenceAccuracy(pSentence, valSet);
  check('attention "hoa": train accuracy', trainAcc, 1.0, 1e-6);
  check('attention "hoa": val accuracy', valAcc, 1.0, 1e-6);
  const exampleWithHoa = positives.find((p) => p.words.includes('hoa'));
  const hoaPos = exampleWithHoa.words.indexOf('hoa');
  const { weights } = forwardAttn(pSentence, exampleWithHoa.idx);
  checkTrue('attention weight tai vi tri "hoa" > 0.9 (tap trung gan het)', weights.data[hoaPos] > 0.9);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
