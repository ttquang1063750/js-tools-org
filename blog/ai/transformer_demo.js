// transformer_demo.js — file tải về của Bài 14 (Transformer). Dùng đúng
// NeuroJS (Tensor/transposeGrad/layerNorm Bài 14, tanh/softmax Bài 13,
// embeddingLookup Bài 12) — KHÔNG dùng framework ngoài. Ghép multi-head
// self-attention + residual + layer norm + FFN thành 1 transformer block
// decoder-only hoàn chỉnh, verify bằng số thật:
//   1. Tính tay attention trên ma trận 3×3 (cụ thể trước khi tổng quát).
//   2. Vì sao cần scale 1/sqrt(d_k) — phương sai QK^T và gradient softmax.
//   3. Không có positional encoding => self-attention permutation-equivariant.
//   4. Residual + layer norm giữ gradient ổn định qua nhiều lớp (residual
//      một mình vẫn có thể bùng nổ — chỉ Add&Norm mới thực sự ổn định).
//   5. Đếm tham số đầy đủ 1 block.

import { Tensor, add, mul, matmul, relu, softmax, transposeGrad, layerNorm, embeddingLookup } from './ai-neuro.js';

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

// --- Causal mask: (T,T), 0 o duoi/tren duong cheo (duoc nhin), -1e9 o
// tren duong cheo (TUONG LAI - decoder KHONG duoc nhin). Cong truc tiep
// vao scores truoc softmax bang add() da co san — mask la HANG SO, khong
// hoc, khong can gradient.
function buildCausalMask(T) {
  const data = new Float32Array(T * T);
  for (let i = 0; i < T; i++) for (let j = 0; j < T; j++) data[i * T + j] = j > i ? -1e9 : 0;
  return new Tensor(data, [T, T]);
}

// --- Khoi tao 1 transformer block: numHeads dau, moi dau co Wq/Wk/Wv rieng
// (dModel,dk) + Wo rieng (dk,dModel) — KHONG can concat: tong CAC PHEP CHIEU
// output rieng cua tung dau tuong duong concat-roi-nhan-1-Wo-chung (dai so
// ma tran phan phoi qua concat), tranh phai them 1 op "ghep cot" moi.
function initTransformerBlock(seed, dModel, numHeads, dff) {
  const rng = mulberry32(seed);
  const dk = dModel / numHeads;
  const heads = [];
  for (let h = 0; h < numHeads; h++) {
    heads.push({
      Wq: new Tensor(
        Array.from({ length: dModel * dk }, () => gaussian(rng) * Math.sqrt(1 / dModel)),
        [dModel, dk]
      ),
      Wk: new Tensor(
        Array.from({ length: dModel * dk }, () => gaussian(rng) * Math.sqrt(1 / dModel)),
        [dModel, dk]
      ),
      Wv: new Tensor(
        Array.from({ length: dModel * dk }, () => gaussian(rng) * Math.sqrt(1 / dModel)),
        [dModel, dk]
      ),
      Wo: new Tensor(
        Array.from({ length: dk * dModel }, () => gaussian(rng) * Math.sqrt(1 / dk)),
        [dk, dModel]
      ),
    });
  }
  return {
    heads,
    dk,
    ln1: { gamma: new Tensor(new Array(dModel).fill(1), [dModel]), beta: Tensor.zeros([dModel]) },
    ln2: { gamma: new Tensor(new Array(dModel).fill(1), [dModel]), beta: Tensor.zeros([dModel]) },
    W1: new Tensor(
      Array.from({ length: dModel * dff }, () => gaussian(rng) * Math.sqrt(1 / dModel)),
      [dModel, dff]
    ),
    b1: Tensor.zeros([dff]),
    W2: new Tensor(
      Array.from({ length: dff * dModel }, () => gaussian(rng) * Math.sqrt(1 / dff)),
      [dff, dModel]
    ),
    b2: Tensor.zeros([dModel]),
  };
}
function paramList(p) {
  const list = [];
  for (const h of p.heads) list.push(h.Wq, h.Wk, h.Wv, h.Wo);
  list.push(p.ln1.gamma, p.ln1.beta, p.ln2.gamma, p.ln2.beta, p.W1, p.b1, p.W2, p.b2);
  return list;
}
function countParams(p) {
  return paramList(p).reduce((s, t) => s + t.size, 0);
}

// --- Multi-head self-attention: moi dau tinh Q/K/V/scale/mask/softmax/context
// RIENG, roi projection Wo rieng cua dau do, cong don qua add() -- xem ghi
// chu tren initTransformerBlock() ve vi sao KHONG can concat.
function multiHeadAttention(X, p, mask, returnAttn) {
  let out = null;
  let firstHeadWeights = null;
  for (const h of p.heads) {
    const Q = matmul(X, h.Wq),
      K = matmul(X, h.Wk),
      V = matmul(X, h.Wv);
    const rawScores = matmul(Q, transposeGrad(K)); // (T,T)
    const scaleFactor = 1 / Math.sqrt(p.dk);
    const scaled = mul(rawScores, new Tensor(new Array(rawScores.size).fill(scaleFactor), rawScores.shape));
    const masked = mask ? add(scaled, mask) : scaled;
    const weights = softmax(masked);
    if (!firstHeadWeights) firstHeadWeights = weights;
    const context = matmul(weights, V); // (T,dk)
    const headOut = matmul(context, h.Wo); // (T,dModel)
    out = out ? add(out, headOut) : headOut;
  }
  return returnAttn ? { out, weights: firstHeadWeights } : out;
}

// --- 1 block hoan chinh: self-attn -> Add&Norm -> FFN -> Add&Norm ---
function transformerBlock(X, p, mask) {
  const attnOut = multiHeadAttention(X, p, mask, false);
  const X2 = layerNorm(add(X, attnOut), p.ln1.gamma, p.ln1.beta);
  const hidden = relu(add(matmul(X2, p.W1), p.b1));
  const ffnOut = add(matmul(hidden, p.W2), p.b2);
  return layerNorm(add(X2, ffnOut), p.ln2.gamma, p.ln2.beta);
}

export { buildCausalMask, initTransformerBlock, paramList, countParams, multiHeadAttention, transformerBlock };

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

  // ===========================================================================
  // 1. Tinh tay attention tren ma tran 3x3 (T=3 vi tri, d_k=3), 1 dau, KHONG
  // mask, KHONG scale (de so sanh don gian truoc, scale kiem tra rieng o Muc 2).
  // ===========================================================================
  {
    const Q = Tensor.fromNested([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    const K = Tensor.fromNested([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    const V = Tensor.fromNested([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    // Q=K=identity -> QK^T = identity -> softmax(identity) moi hang tap trung
    // gan het vao dung vi tri cheo (logit 1 o dung vi tri, 0 o 2 vi tri con lai)
    const scores = matmul(Q, transposeGrad(K));
    checkDeepEqual3x3('QK^T = identity (Q=K=I)', scores.toNested(), [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    const weights = softmax(scores);
    // hang 0: softmax([1,0,0]) = [e/(e+1+1), 1/(e+1+1), 1/(e+1+1)]
    const e = Math.exp(1);
    const denom = e + 1 + 1;
    check('softmax hang 0, cot 0 (logit=1)', weights.data[0], e / denom, 1e-5);
    check('softmax hang 0, cot 1 (logit=0)', weights.data[1], 1 / denom, 1e-5);
    const context = matmul(weights, V);
    // hang 0 cua context = trong so . V (weighted-average cua 3 hang V, thien ve hang 0)
    const expectedRow0 = (e / denom) * 1 + (1 / denom) * 4 + (1 / denom) * 7;
    check('context hang 0, cot 0 (thien ve V hang 0 vi Q0.K0 lon nhat)', context.data[0], expectedRow0, 1e-3);
    function checkDeepEqual3x3(name, got, exp) {
      checks++;
      if (JSON.stringify(got) !== JSON.stringify(exp)) {
        console.log('LOI', name, 'got=' + JSON.stringify(got), 'ky vong=' + JSON.stringify(exp));
        errors++;
      }
    }
  }

  // ===========================================================================
  // 2. Vi sao can scale 1/sqrt(d_k): phuong sai QK^T tang THEO d_k; khong scale
  // -> softmax bao hoa -> gradient chet.
  // ===========================================================================
  {
    function dotVariance(dk, trials, seed) {
      const rng = mulberry32(seed);
      const dots = [];
      for (let t = 0; t < trials; t++) {
        let dot = 0;
        for (let i = 0; i < dk; i++) dot += gaussian(rng) * gaussian(rng);
        dots.push(dot);
      }
      const mean = dots.reduce((a, b) => a + b, 0) / dots.length;
      return dots.reduce((s, x) => s + (x - mean) ** 2, 0) / dots.length;
    }
    for (const dk of [8, 32, 64]) {
      check('phuong sai QK^T ~ d_k=' + dk, dotVariance(dk, 20000, 7), dk, dk * 0.15);
    }

    function softmaxSaturation(dk, scaled) {
      const { sum, mul: mulOp } = { sum: (t) => t.data.reduce((a, b) => a + b, 0), mul: null };
      const rng = mulberry32(7);
      const T = 5;
      const std = scaled ? 1 : Math.sqrt(dk);
      const scores = Array.from({ length: T }, () => gaussian(rng) * std);
      const logits = new Tensor(scores, [1, T]);
      const out = softmax(logits);
      const maxProb = Math.max(...out.data);
      const oneHot = new Array(T).fill(0);
      oneHot[0] = 1;
      const L = mul(out, new Tensor(oneHot, [1, T]));
      let lossSum = 0;
      for (let i = 0; i < T; i++) lossSum += L.data[i];
      const Ltotal = new Tensor([lossSum], [1]);
      Ltotal._prev = [L];
      Ltotal._backward = () => {
        L._ensureGrad();
        for (let i = 0; i < T; i++) L.grad[i] += Ltotal.grad[0];
      };
      Ltotal.backward();
      logits._ensureGrad();
      let gradNorm = 0;
      for (let i = 0; i < T; i++) gradNorm += logits.grad[i] ** 2;
      return { maxProb, gradNorm: Math.sqrt(gradNorm) };
    }
    const noScale64 = softmaxSaturation(64, false);
    const withScale64 = softmaxSaturation(64, true);
    checkTrue('KHONG scale (d_k=64): softmax gan nhu bao hoa hoan toan (maxProb>0.999)', noScale64.maxProb > 0.999);
    checkTrue('KHONG scale (d_k=64): gradient qua softmax gan nhu CHET (<1e-6)', noScale64.gradNorm < 1e-6);
    checkTrue('CO scale (d_k=64): softmax KHONG bao hoa (maxProb<0.9)', withScale64.maxProb < 0.9);
    checkTrue('CO scale (d_k=64): gradient VAN khoe (>0.1)', withScale64.gradNorm > 0.1);
  }

  // ===========================================================================
  // 3. Khong co positional encoding => self-attention PERMUTATION-EQUIVARIANT:
  // hoan vi 2 token dau vao, output cua tung token hoan vi Y HET theo, nghia
  // la model KHONG biet "vi tri", chi biet "noi dung tuong doi".
  // ===========================================================================
  {
    const dModel = 8,
      dk = 8;
    const rng = mulberry32(3);
    const Wq = new Tensor(
      Array.from({ length: dModel * dk }, () => gaussian(rng) * 0.3),
      [dModel, dk]
    );
    const Wk = new Tensor(
      Array.from({ length: dModel * dk }, () => gaussian(rng) * 0.3),
      [dModel, dk]
    );
    const Wv = new Tensor(
      Array.from({ length: dModel * dk }, () => gaussian(rng) * 0.3),
      [dModel, dk]
    );
    function selfAttnNoPE(X) {
      const Q = matmul(X, Wq),
        K = matmul(X, Wk),
        V = matmul(X, Wv);
      const scores = matmul(Q, transposeGrad(K));
      const scaled = mul(scores, new Tensor(new Array(scores.size).fill(1 / Math.sqrt(dk)), scores.shape));
      const weights = softmax(scaled);
      return matmul(weights, V);
    }
    const x1 = Array.from({ length: dModel }, () => gaussian(rng));
    const x2 = Array.from({ length: dModel }, () => gaussian(rng));
    const x3 = Array.from({ length: dModel }, () => gaussian(rng));
    const outOriginal = selfAttnNoPE(new Tensor([...x1, ...x2, ...x3], [3, dModel]));
    const outSwapped = selfAttnNoPE(new Tensor([...x2, ...x1, ...x3], [3, dModel]));
    let maxDiff = 0;
    for (let i = 0; i < dModel; i++)
      maxDiff = Math.max(maxDiff, Math.abs(outOriginal.data[i] - outSwapped.data[dModel + i]));
    checkTrue('KHONG PE: doi vi tri x1<->x2, output cua x1 KHONG DOI (permutation-equivariant)', maxDiff < 1e-5);
  }

  // ===========================================================================
  // 4. Residual + layer norm giu gradient on dinh qua nhieu lop; residual
  // MOT MINH (khong norm) van co the bung no; khong residual thi tieu bien.
  // ===========================================================================
  {
    function stackDepth(N, mode, seed) {
      const D = 16;
      const rng = mulberry32(seed);
      let x = new Tensor(
        Array.from({ length: D }, () => gaussian(rng) * 0.5),
        [1, D]
      );
      const x0 = x;
      const gamma = new Tensor(new Array(D).fill(1), [D]);
      const beta = Tensor.zeros([D]);
      for (let n = 0; n < N; n++) {
        const W = new Tensor(
          Array.from({ length: D * D }, () => gaussian(rng) * Math.sqrt(1 / D)),
          [D, D]
        );
        const f = relu(matmul(x, W));
        if (mode === 'none') x = f;
        else if (mode === 'residual') x = add(x, f);
        else if (mode === 'residual_norm') x = layerNorm(add(x, f), gamma, beta);
      }
      const L = mul(x, x);
      L.backward();
      x0._ensureGrad();
      let norm = 0;
      for (let i = 0; i < x0.grad.length; i++) norm += x0.grad[i] * x0.grad[i];
      return Math.sqrt(norm);
    }
    const noRes40 = stackDepth(40, 'none', 7);
    const resOnly40 = stackDepth(40, 'residual', 7);
    const resNorm1 = stackDepth(1, 'residual_norm', 7);
    const resNorm40 = stackDepth(40, 'residual_norm', 7);
    const resNorm80 = stackDepth(80, 'residual_norm', 7);
    checkTrue('KHONG residual: gradient tieu bien gan het sau 40 lop (<1e-10)', noRes40 < 1e-10);
    checkTrue('Residual MOT MINH (khong norm): van co the bung no sau 40 lop (>1e6)', resOnly40 > 1e6);
    checkTrue(
      'Residual + LayerNorm (Add&Norm that): grad on dinh, KHONG tieu bien/bung no qua 80 lop',
      resNorm80 / resNorm1 > 0.01 && resNorm80 / resNorm1 < 100
    );
    console.log(
      'Grad norm tai input: khong-residual(N=40)=' + noRes40.toExponential(2),
      '| residual-thuan(N=40)=' + resOnly40.toExponential(2),
      '| Add&Norm(N=1)=' + resNorm1.toExponential(2),
      '(N=40)=' + resNorm40.toExponential(2),
      '(N=80)=' + resNorm80.toExponential(2)
    );
  }

  // ===========================================================================
  // 5. Dem tham so day du 1 block (dModel=32, numHeads=4, dff=64).
  // ===========================================================================
  {
    const p = initTransformerBlock(1, 32, 4, 64);
    check('tong tham so 1 block (dModel=32,heads=4,dff=64)', countParams(p), 8416, 0);
  }

  // ===========================================================================
  // 6. Gradient checking end-to-end: embeddingLookup -> transformerBlock (co
  // mask) -> loss, tren chuoi T=4 ngau nhien nho (xac nhan toan bo day noi
  // dung khong sai wiring nao).
  // ===========================================================================
  {
    const dModel = 8,
      numHeads = 2,
      dff = 16,
      T = 4,
      V = 6;
    const p = initTransformerBlock(11, dModel, numHeads, dff);
    const mask = buildCausalMask(T);
    const embTable = new Tensor(new Float32Array(V * dModel), [V, dModel]);
    const rngEmb = mulberry32(21);
    for (let i = 0; i < embTable.size; i++) embTable.data[i] = gaussian(rngEmb) * 0.3;
    const tokens = [1, 3, 0, 2];
    const X = embeddingLookup(embTable, tokens);
    const out = transformerBlock(X, p, mask);
    const weights = new Tensor(
      Array.from({ length: out.size }, (_, i) => Math.cos(i * 0.7)),
      out.shape
    );
    const L = mul(out, weights);
    let lossVal = 0;
    for (let i = 0; i < L.size; i++) lossVal += L.data[i];
    const Ltotal = new Tensor([lossVal], [1]);
    Ltotal._prev = [L];
    Ltotal._backward = () => {
      L._ensureGrad();
      for (let i = 0; i < L.size; i++) L.grad[i] += Ltotal.grad[0];
    };
    Ltotal.backward();
    embTable._ensureGrad();
    function lossDouble(embArr) {
      // forward THUAN bang double, doc lap voi engine, chi dung cong thuc toan hoc
      function getVec(idx) {
        return embArr.slice(idx * dModel, idx * dModel + dModel);
      }
      const Xd = tokens.map(getVec); // T x dModel
      function matmulD(A, B, m, k, n) {
        const out = new Array(m * n).fill(0);
        for (let i = 0; i < m; i++)
          for (let kk = 0; kk < k; kk++) for (let j = 0; j < n; j++) out[i * n + j] += A[i * k + kk] * B[kk * n + j];
        return out;
      }
      const Xflat = Xd.flat();
      let ctxSum = new Array(T * dModel).fill(0);
      const dk = dModel / numHeads;
      for (const h of p.heads) {
        const Q = matmulD(Xflat, h.Wq.data, T, dModel, dk);
        const K = matmulD(Xflat, h.Wk.data, T, dModel, dk);
        const Vv = matmulD(Xflat, h.Wv.data, T, dModel, dk);
        const scores = new Array(T * T).fill(0);
        for (let i = 0; i < T; i++)
          for (let j = 0; j < T; j++) {
            let s = 0;
            for (let d = 0; d < dk; d++) s += Q[i * dk + d] * K[j * dk + d];
            scores[i * T + j] = s / Math.sqrt(dk) + (j > i ? -1e9 : 0);
          }
        const weightsA = new Array(T * T);
        for (let i = 0; i < T; i++) {
          let m = -Infinity;
          for (let j = 0; j < T; j++) m = Math.max(m, scores[i * T + j]);
          let se = 0;
          const row = [];
          for (let j = 0; j < T; j++) {
            row[j] = Math.exp(scores[i * T + j] - m);
            se += row[j];
          }
          for (let j = 0; j < T; j++) weightsA[i * T + j] = row[j] / se;
        }
        const context = matmulD(weightsA, Vv, T, T, dk);
        const headOut = matmulD(context, h.Wo.data, T, dk, dModel);
        for (let i = 0; i < T * dModel; i++) ctxSum[i] += headOut[i];
      }
      const X2 = new Array(T * dModel);
      for (let i = 0; i < T; i++) {
        const row = [];
        for (let d = 0; d < dModel; d++) row.push(Xflat[i * dModel + d] + ctxSum[i * dModel + d]);
        const mean = row.reduce((a, b) => a + b, 0) / dModel;
        const variance = row.reduce((s, x) => s + (x - mean) ** 2, 0) / dModel;
        const std = Math.sqrt(variance + 1e-5);
        for (let d = 0; d < dModel; d++)
          X2[i * dModel + d] = ((row[d] - mean) / std) * p.ln1.gamma.data[d] + p.ln1.beta.data[d];
      }
      const hidden = matmulD(X2, p.W1.data, T, dModel, dff);
      for (let i = 0; i < T * dff; i++) hidden[i] = Math.max(0, hidden[i] + p.b1.data[i % dff]);
      const ffnOut = matmulD(hidden, p.W2.data, T, dff, dModel);
      for (let i = 0; i < T * dModel; i++) ffnOut[i] += p.b2.data[i % dModel];
      const X3 = new Array(T * dModel);
      for (let i = 0; i < T; i++) {
        const row = [];
        for (let d = 0; d < dModel; d++) row.push(X2[i * dModel + d] + ffnOut[i * dModel + d]);
        const mean = row.reduce((a, b) => a + b, 0) / dModel;
        const variance = row.reduce((s, x) => s + (x - mean) ** 2, 0) / dModel;
        const std = Math.sqrt(variance + 1e-5);
        for (let d = 0; d < dModel; d++)
          X3[i * dModel + d] = ((row[d] - mean) / std) * p.ln2.gamma.data[d] + p.ln2.beta.data[d];
      }
      let total = 0;
      for (let i = 0; i < T * dModel; i++) total += X3[i] * weights.data[i];
      return total;
    }
    const eps = 1e-3;
    let maxDiff = 0;
    const embFlat = Array.from(embTable.data);
    for (let idx = 0; idx < Math.min(embFlat.length, 12); idx++) {
      const pArr = embFlat.slice(),
        mArr = embFlat.slice();
      pArr[idx] += eps;
      mArr[idx] -= eps;
      const fd = (lossDouble(pArr) - lossDouble(mArr)) / (2 * eps);
      maxDiff = Math.max(maxDiff, Math.abs(fd - embTable.grad[idx]));
    }
    checkTrue('gradient checking end-to-end (embedding->transformerBlock, 12 phan tu dau)', maxDiff < 1e-1);
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
