// skipgram_demo.js — file tải về của Bài 12 (Embedding & word2vec). Dùng
// đúng NeuroJS (Tensor/embeddingLookup/sigmoidCrossEntropy Bài 12, Adam Bài
// 9) — KHÔNG dùng framework ngoài. Train skip-gram + negative sampling THẬT
// trên corpus Truyện Kiều (corpus-kieu.txt, đã vendor sẵn từ trước), chiếu
// embedding về 2D bằng PCA tổng quát hoá (power iteration — đúng phương
// pháp Bài 4, mở rộng từ ma trận 2×2/3×3 lên d×d bất kỳ).

import { Tensor, sum, mul, Adam, embeddingLookup, sigmoidCrossEntropy } from './ai-neuro.js';

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

// --- Xây vocab + chuỗi token đã lọc + cặp skip-gram (window cố định) ---
function buildVocab(text, vocabSize) {
  const allTokens = text.toLowerCase().match(/[\p{L}]+/gu) || [];
  const freq = {};
  allTokens.forEach((t) => (freq[t] = (freq[t] || 0) + 1));
  const vocabList = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, vocabSize)
    .map(([w]) => w);
  const word2idx = {};
  vocabList.forEach((w, i) => (word2idx[w] = i));
  const covered = allTokens.filter((t) => word2idx[t] !== undefined);
  return { allTokens, vocabList, word2idx, seq: covered.map((t) => word2idx[t]), totalTokens: allTokens.length };
}
function buildSkipGramPairs(seq, window) {
  const pairs = [];
  for (let i = 0; i < seq.length; i++) {
    for (let w = 1; w <= window; w++) {
      if (i - w >= 0) pairs.push([seq[i], seq[i - w]]);
      if (i + w < seq.length) pairs.push([seq[i], seq[i + w]]);
    }
  }
  return pairs;
}
// Negative sampling: phan bo unigram^0,75 (chuan word2vec — lam phang tan
// suat, tu qua pho bien bot bi chon lam negative qua nhieu).
function buildNegativeSampler(seq, vocabSize) {
  const counts = new Array(vocabSize).fill(0);
  seq.forEach((idx) => counts[idx]++);
  const weighted = counts.map((c) => Math.pow(c, 0.75));
  const total = weighted.reduce((a, b) => a + b, 0);
  const cumProbs = [];
  let acc = 0;
  for (const w of weighted) {
    acc += w / total;
    cumProbs.push(acc);
  }
  return function sampleNegative(rng) {
    const r = rng();
    let lo = 0,
      hi = cumProbs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumProbs[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
}

function initEmbeddings(seed, vocabSize, dim) {
  const rng = mulberry32(seed);
  const centerTable = new Tensor(
    Array.from({ length: vocabSize * dim }, () => gaussian(rng) * 0.1),
    [vocabSize, dim]
  );
  const contextTable = new Tensor(
    Array.from({ length: vocabSize * dim }, () => gaussian(rng) * 0.1),
    [vocabSize, dim]
  );
  return { centerTable, contextTable };
}

// trainSkipGram: 1 batch = nhieu cap (center,context) THAT + K negative MOI
// cap — moi vi du forward/backward RIENG (giong cach Bai 11 xu ly batch qua
// conv, xem ly do don gian hoa trong Bai 11), gradient cong don qua nhieu
// lan backward() (Bai 7) roi CHIA DEU truoc optimizer.step().
function trainSkipGram({ centerTable, contextTable, pairs, negativeSampler, epochs, batchSize, K, lr, seed }) {
  const opt = new Adam([centerTable, contextTable], lr);
  const rngTrain = mulberry32(seed);
  const rngShuffle = mulberry32(seed + 1000);
  let order = pairs.map((_, i) => i);
  const lossHistory = [];
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rngShuffle() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let epochLossSum = 0,
      epochLossCount = 0;
    for (let b = 0; b < order.length; b += batchSize) {
      const idxs = order.slice(b, b + batchSize);
      centerTable.zeroGrad();
      contextTable.zeroGrad();
      let cnt = 0;
      for (const pi of idxs) {
        const [centerIdx, contextIdx] = pairs[pi];
        {
          const cv = embeddingLookup(centerTable, [centerIdx]);
          const ov = embeddingLookup(contextTable, [contextIdx]);
          const score = sum(mul(cv, ov));
          const L = sigmoidCrossEntropy(score, new Tensor([1], [1]));
          L.backward();
          epochLossSum += L.data[0];
          cnt++;
        }
        for (let n = 0; n < K; n++) {
          const negIdx = negativeSampler(rngTrain);
          const cv = embeddingLookup(centerTable, [centerIdx]);
          const ov = embeddingLookup(contextTable, [negIdx]);
          const score = sum(mul(cv, ov));
          const L = sigmoidCrossEntropy(score, new Tensor([0], [1]));
          L.backward();
          epochLossSum += L.data[0];
          cnt++;
        }
      }
      [centerTable, contextTable].forEach((t) => {
        for (let i = 0; i < t.size; i++) t.grad[i] /= cnt;
      });
      opt.step();
      epochLossCount += cnt;
    }
    lossHistory.push(epochLossSum / epochLossCount);
  }
  return lossHistory;
}

function cosineSimilarity(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
function getEmbeddingVec(table, dim, idx) {
  return table.data.slice(idx * dim, idx * dim + dim);
}
function nearestNeighbors(table, dim, vocabList, word2idx, word, k = 8) {
  const idx = word2idx[word];
  if (idx === undefined) return null;
  const v = getEmbeddingVec(table, dim, idx);
  const sims = vocabList.map((w, i) => ({
    w,
    sim: i === idx ? -Infinity : cosineSimilarity(v, getEmbeddingVec(table, dim, i)),
  }));
  sims.sort((a, b) => b.sim - a.sim);
  return sims.slice(0, k);
}

// --- PCA TỔNG QUÁT HOÁ d chiều (Bài 4 chỉ làm sẵn 2x2/3x3) — power
// iteration + deflation, cùng phương pháp, mở rộng kích thước ma trận.
function meanVecD(vectors, d) {
  const m = new Array(d).fill(0);
  for (const v of vectors) for (let i = 0; i < d; i++) m[i] += v[i] / vectors.length;
  return m;
}
function covMatrixD(vectors, d) {
  const mean = meanVecD(vectors, d);
  const C = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const v of vectors) {
    const diff = v.map((x, i) => x - mean[i]);
    for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) C[i][j] += (diff[i] * diff[j]) / vectors.length;
  }
  return C;
}
function matVecD(A, v, d) {
  const out = new Array(d).fill(0);
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) out[i] += A[i][j] * v[j];
  return out;
}
function normVecD(v) {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}
function normalizeVecD(v) {
  const n = normVecD(v) || 1;
  return v.map((x) => x / n);
}
function dotD(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
function powerIterationD(A, d, iters, v0) {
  let v = normalizeVecD(v0);
  for (let i = 0; i < iters; i++) v = normalizeVecD(matVecD(A, v, d));
  const Av = matVecD(A, v, d);
  return { v, eigval: dotD(v, Av) };
}
function deflateD(A, v, eigval, d) {
  const M = Array.from({ length: d }, () => new Array(d).fill(0));
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) M[i][j] = A[i][j] - eigval * v[i] * v[j];
  return M;
}
function pcaTo2D(vectors, d) {
  const C = covMatrixD(vectors, d);
  const seed1 = new Array(d).fill(0).map((_, i) => (i === 0 ? 1 : 0.1));
  const pc1 = powerIterationD(C, d, 40, seed1);
  const deflated = deflateD(C, pc1.v, pc1.eigval, d);
  const seed2 = new Array(d).fill(0).map((_, i) => (i === 1 ? 1 : 0.1));
  const pc2 = powerIterationD(deflated, d, 40, seed2);
  const mean = meanVecD(vectors, d);
  const points2d = vectors.map((v) => {
    const diff = v.map((x, i) => x - mean[i]);
    return { x: dotD(diff, pc1.v), y: dotD(diff, pc2.v) };
  });
  return { points2d, eigval1: pc1.eigval, eigval2: pc2.eigval };
}

export {
  buildVocab,
  buildSkipGramPairs,
  buildNegativeSampler,
  initEmbeddings,
  trainSkipGram,
  cosineSimilarity,
  getEmbeddingVec,
  nearestNeighbors,
  pcaTo2D,
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

  const text = fs.readFileSync(new URL('./corpus-kieu.txt', import.meta.url), 'utf8');
  const VOCAB_SIZE = 300,
    DIM = 16,
    WINDOW = 2,
    K = 5;
  const { vocabList, word2idx, seq, totalTokens } = buildVocab(text, VOCAB_SIZE);
  check('tong so token trong corpus', totalTokens, 22778, 0);
  check('do phu vocab 300 tu (%)', (seq.length / totalTokens) * 100, 61.2, 0.1);
  checkTrue(
    'tong so tu duy nhat trong corpus > 300 (can cat bot)',
    new Set(text.toLowerCase().match(/[\p{L}]+/gu)).size > VOCAB_SIZE
  );

  const pairs = buildSkipGramPairs(seq, WINDOW);
  check('tong so cap skip-gram (window=2)', pairs.length, 55726, 0);

  const negativeSampler = buildNegativeSampler(seq, VOCAB_SIZE);
  const { centerTable, contextTable } = initEmbeddings(1, VOCAB_SIZE, DIM);

  console.log('Dang train skip-gram (5 epoch, ~8-10s)...');
  const lossHistory = trainSkipGram({
    centerTable,
    contextTable,
    pairs,
    negativeSampler,
    epochs: 5,
    batchSize: 64,
    K,
    lr: 0.01,
    seed: 7,
  });
  check('loss epoch dau', lossHistory[0], 0.4708, 5e-3);
  check('loss epoch cuoi (giam dan)', lossHistory[lossHistory.length - 1], 0.4288, 5e-3);
  checkTrue('loss giam qua cac epoch', lossHistory[lossHistory.length - 1] < lossHistory[0]);

  const hoaVec = getEmbeddingVec(centerTable, DIM, word2idx['hoa']);
  const gioVec = getEmbeddingVec(centerTable, DIM, word2idx['gió']);
  check('cosine(hoa, gió) — cum ngu nghia hinh anh thien nhien', cosineSimilarity(hoaVec, gioVec), 0.854, 1e-2);
  const xuanVec = getEmbeddingVec(centerTable, DIM, word2idx['xuân']);
  const thuVec = getEmbeddingVec(centerTable, DIM, word2idx['thu']);
  check(
    'cosine(xuân, thu) — 2 mua doi lap nhau la NEIGHBOR SO 1 (pitfall Muc 3)',
    cosineSimilarity(xuanVec, thuVec),
    0.839,
    1e-2
  );
  const nangVec = getEmbeddingVec(centerTable, DIM, word2idx['nàng']);
  const changVec = getEmbeddingVec(centerTable, DIM, word2idx['chàng']);
  check('cosine(nàng, chàng) — cap dai tu doi lap', cosineSimilarity(nangVec, changVec), 0.69, 1e-2);

  const nnHoa = nearestNeighbors(centerTable, DIM, vocabList, word2idx, 'hoa', 3);
  checkTrue('nearest neighbor #1 cua "hoa" la "gió"', nnHoa[0].w === 'gió');
  const nnXuan = nearestNeighbors(centerTable, DIM, vocabList, word2idx, 'xuân', 3);
  checkTrue('nearest neighbor #1 cua "xuân" la "thu" (pitfall)', nnXuan[0].w === 'thu');

  const vectors = vocabList.map((_, i) => Array.from(getEmbeddingVec(centerTable, DIM, i)));
  const { points2d, eigval1, eigval2 } = pcaTo2D(vectors, DIM);
  checkTrue('PCA: eigval1 >= eigval2 (PC1 giu phuong sai nhieu hon)', eigval1 >= eigval2);
  checkTrue(
    'PCA: toa do 2D huu han, khong NaN',
    points2d.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
  );

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
