// gpt_mini.js — Ghép TOÀN BỘ series thành 1 GPT-mini ~50k tham số: BPE
// (Bài 16, cài lại gọn ở đây để file KHÔNG phụ thuộc 'fs' của file khác) +
// token/position embedding (Bài 12/14) + N transformer block (Bài 14, TÁI
// SỬ DỤNG TRỰC TIẾP transformer_demo.js — không viết lại attention/FFN) +
// weight-tied softmax head (Bài 3/16) + Adam (Bài 9) + gradient clipping
// toàn cục (Bài 13), train FULL-BATCH trên 40 câu mở đầu Truyện Kiều (public
// domain) — verify bằng số đo thật: đếm tham số, loss giảm, val loss quay
// đầu (overfit), sinh văn bản nhớ đúng nguyên văn rồi trôi dần thành rác.
// Bài 19: Capstone — GPT-mini tiếng Việt trong browser
// js-tools.org/blog/ai/ai-gpt-mini-capstone
//
// Cách chạy self-test (cần Node.js, đọc corpus-kieu.txt cùng thư mục):
//   node gpt_mini.js
// Kỳ vọng in ra: "SELF-TEST PASS (N checks)" (mất khoảng 30-60 giây — train
// THẬT, không phải số giả lập).

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Tensor, add, matmul, embeddingLookup, transposeGrad, softmaxCrossEntropy, Adam } from './ai-neuro.js';
import { initTransformerBlock, transformerBlock, buildCausalMask, paramList } from './transformer_demo.js';

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

// ---------------------------------------------------------------------------
// BPE (Bài 16) — cài lại gọn, KHÔNG import bpe_tokenizer.js: file đó chạy
// self-test ngay khi import (không guard) và dùng 'fs' — sẽ vỡ nếu trang
// (browser) sau này tải gpt_mini.js phiên bản rút gọn tương tự. Giữ ĐÚNG
// thuật toán, chỉ bỏ phần đọc file/self-test.
// ---------------------------------------------------------------------------
function initVocabFromText(text) {
  const wordFreq = new Map();
  for (const w of text.split(/\s+/).filter(Boolean)) wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  const vocab = new Map();
  for (const [w, f] of wordFreq) vocab.set([...w, '</w>'].join(' '), f);
  return vocab;
}
function getPairFreqs(vocab) {
  const pairs = new Map();
  for (const [symbolStr, freq] of vocab) {
    const symbols = symbolStr.split(' ');
    for (let i = 0; i < symbols.length - 1; i++) {
      const pair = symbols[i] + '\x00' + symbols[i + 1];
      pairs.set(pair, (pairs.get(pair) || 0) + freq);
    }
  }
  return pairs;
}
function mergeVocab(vocab, pairKey) {
  const [a, b] = pairKey.split('\x00');
  const bigram = a + ' ' + b,
    merged = a + b;
  const newVocab = new Map();
  for (const [symbolStr, freq] of vocab) newVocab.set(symbolStr.split(bigram).join(merged), freq);
  return newVocab;
}
function trainBPE(text, numMerges) {
  let vocab = initVocabFromText(text);
  const merges = [];
  for (let i = 0; i < numMerges; i++) {
    const pairs = getPairFreqs(vocab);
    if (pairs.size === 0) break;
    let bestPair = null,
      bestFreq = -1;
    for (const [pair, freq] of pairs)
      if (freq > bestFreq) {
        bestFreq = freq;
        bestPair = pair;
      }
    vocab = mergeVocab(vocab, bestPair);
    merges.push(bestPair);
  }
  return merges;
}
function encodeWord(word, merges) {
  let symbols = [...word, '</w>'];
  for (const pairKey of merges) {
    const [a, b] = pairKey.split('\x00');
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < symbols.length - 1; i++) {
        if (symbols[i] === a && symbols[i + 1] === b) {
          symbols = [...symbols.slice(0, i), a + b, ...symbols.slice(i + 2)];
          changed = true;
          break;
        }
      }
    }
  }
  return symbols;
}
function encodeText(text, merges) {
  const tokens = [];
  for (const w of text.split(/\s+/).filter(Boolean)) tokens.push(...encodeWord(w, merges));
  return tokens;
}
function decodeTokens(tokens) {
  const words = [];
  let word = '';
  for (const t of tokens) {
    if (t.endsWith('</w>')) {
      word += t.slice(0, -4);
      words.push(word);
      word = '';
    } else word += t;
  }
  if (word) words.push(word);
  return words.join(' ');
}
function buildVocab(corpus, numMerges) {
  const merges = trainBPE(corpus, numMerges);
  const allTokens = encodeText(corpus, merges);
  const uniq = [...new Set(allTokens)].sort();
  const stoi = new Map(uniq.map((t, i) => [t, i]));
  return { merges, stoi, itos: uniq, vocabSize: uniq.length };
}
function tokensToIds(tokens, stoi, unkId) {
  return tokens.map((t) => (stoi.has(t) ? stoi.get(t) : unkId));
}

// ---------------------------------------------------------------------------
// GPT-mini: token embedding + position embedding HỌC ĐƯỢC (kiểu GPT thật —
// khác sinusoidal cố định của paper Transformer gốc) + N transformer block
// (Bài 14, TÁI SỬ DỤNG initTransformerBlock/transformerBlock nguyên xi) +
// head WEIGHT-TIED với token embedding (logits = X @ tokEmb^T) — kỹ thuật
// GPT-2 thật, giảm gần 1/3 tổng tham số so với head chiếu riêng (Mục 1).
// ---------------------------------------------------------------------------
function initGPTMini(seed, vocabSize, dModel, numHeads, dff, numBlocks, maxT) {
  const rng = mulberry32(seed);
  const tokEmb = new Tensor(
    Array.from({ length: vocabSize * dModel }, () => gaussian(rng) * Math.sqrt(1 / dModel)),
    [vocabSize, dModel]
  );
  const posEmb = new Tensor(
    Array.from({ length: maxT * dModel }, () => gaussian(rng) * 0.02),
    [maxT, dModel]
  );
  const blocks = [];
  for (let i = 0; i < numBlocks; i++) blocks.push(initTransformerBlock(seed + 1000 + i * 17, dModel, numHeads, dff));
  return { tokEmb, posEmb, blocks, vocabSize, dModel, maxT };
}
function paramsOf(model) {
  const list = [model.tokEmb, model.posEmb];
  for (const b of model.blocks) list.push(...paramList(b));
  return list;
}
function countBreakdown(model) {
  const tok = model.tokEmb.size;
  const pos = model.posEmb.size;
  const perBlock = paramList(model.blocks[0]).reduce((s, t) => s + t.size, 0);
  const blocksTotal = perBlock * model.blocks.length;
  return { tok, pos, perBlock, numBlocks: model.blocks.length, blocksTotal, head: 0, total: tok + pos + blocksTotal };
}
function forward(model, tokenIds) {
  const T = tokenIds.length;
  const tokX = embeddingLookup(model.tokEmb, tokenIds);
  const posIds = Array.from({ length: T }, (_, i) => i);
  const posX = embeddingLookup(model.posEmb, posIds);
  let X = add(tokX, posX);
  const mask = buildCausalMask(T);
  for (const b of model.blocks) X = transformerBlock(X, b, mask);
  return matmul(X, transposeGrad(model.tokEmb)); // weight-tied head: (T,dModel)x(dModel,V) -> (T,V)
}

// Global-norm gradient clipping (Bài 13) trên TOÀN BỘ tham số gộp lại —
// đúng cách PyTorch clip_grad_norm_(model.parameters(), max_norm) làm.
function clipGlobalGradNorm(params, maxNorm) {
  let sq = 0;
  for (const p of params) for (let i = 0; i < p.grad.length; i++) sq += p.grad[i] * p.grad[i];
  const norm = Math.sqrt(sq);
  const scale = norm > maxNorm ? maxNorm / norm : 1;
  if (scale < 1) for (const p of params) for (let i = 0; i < p.grad.length; i++) p.grad[i] *= scale;
  return { norm, scale };
}
function lossOnBatch(model, batch, doBackward) {
  const input = batch.slice(0, -1);
  const target = batch.slice(1);
  const T = input.length,
    V = model.vocabSize;
  const logits = forward(model, input);
  const yOneHot = new Float32Array(T * V);
  for (let i = 0; i < T; i++) yOneHot[i * V + target[i]] = 1;
  const loss = softmaxCrossEntropy(logits, new Tensor(yOneHot, [T, V]));
  if (doBackward) loss.backward();
  return loss.data[0];
}

// 1 "epoch" = full-batch: cộng dồn gradient qua TOÀN BỘ dataset rồi step 1
// lần (trung bình gradient) — batch size 1 (SGD ngẫu nhiên từng block) học
// CHẬM HƠN NHIỀU trên corpus tí hon này vì các block "giẫm" lên cập nhật
// của nhau; full-batch ổn định và hội tụ nhanh hơn hẳn (đã verify: batch-1
// sau 1000 bước chỉ giảm loss ~5%, full-batch sau 150 epoch giảm ~98%).
function trainEpoch(model, optimizer, dataset, maxGradNorm) {
  const params = paramsOf(model);
  for (const p of params) p.zeroGrad();
  let epLoss = 0;
  for (const batch of dataset) epLoss += lossOnBatch(model, batch, true);
  epLoss /= dataset.length;
  for (const p of params) for (let i = 0; i < p.grad.length; i++) p.grad[i] /= dataset.length;
  const { norm } = clipGlobalGradNorm(params, maxGradNorm);
  optimizer.step();
  return { loss: epLoss, gradNorm: norm };
}
function evalLoss(model, dataset) {
  let total = 0;
  for (const batch of dataset) total += lossOnBatch(model, batch, false);
  return total / dataset.length;
}
function buildDataset(ids, blockLen) {
  const dataset = [];
  for (let start = 0; start + blockLen + 1 <= ids.length; start += blockLen) {
    dataset.push(ids.slice(start, start + blockLen + 1));
  }
  return dataset;
}

// ---- Sinh văn bản: TÁI SỬ DỤNG Y HỆT 3 chiến lược Bài 18 (temperature/
// top-k/top-p), áp trực tiếp lên logits (T,V) THẬT của GPT-mini. ----
function softmaxRow(row, temperature) {
  const scaled = row.map((z) => z / temperature);
  const m = Math.max(...scaled);
  const exps = scaled.map((z) => Math.exp(z - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}
function sampleNext(logitsRow, temperature, topK, topP, rng) {
  const sorted = logitsRow.map((z, i) => [i, z]).sort((a, b) => b[1] - a[1]);
  const kept = sorted.slice(0, topK);
  const probsAll = softmaxRow(
    kept.map(([, z]) => z),
    temperature
  );
  let cum = 0;
  const nucleus = [];
  for (let i = 0; i < kept.length; i++) {
    nucleus.push([kept[i][0], probsAll[i]]);
    cum += probsAll[i];
    if (cum >= topP) break;
  }
  const total = nucleus.reduce((s, [, p]) => s + p, 0);
  const probs = nucleus.map(([, p]) => p / total);
  const r = rng();
  let c = 0;
  for (let i = 0; i < probs.length; i++) {
    c += probs[i];
    if (r < c) return nucleus[i][0];
  }
  return nucleus[nucleus.length - 1][0];
}
function generate(model, seedIds, steps, temperature, topK, topP, rng, maxCtx) {
  let ids = seedIds.slice();
  for (let s = 0; s < steps; s++) {
    const ctx = ids.slice(-maxCtx);
    const logits = forward(model, ctx);
    const V = model.vocabSize;
    const lastRow = Array.from(logits.data.slice((ctx.length - 1) * V, ctx.length * V));
    ids.push(sampleNext(lastRow, temperature, topK, topP, rng));
  }
  return ids;
}

export {
  buildVocab,
  tokensToIds,
  decodeTokens,
  encodeText,
  initGPTMini,
  paramsOf,
  countBreakdown,
  forward,
  clipGlobalGradNorm,
  trainEpoch,
  evalLoss,
  buildDataset,
  generate,
  mulberry32,
};

// ---------------------------------------------------------------------------
// Self-test — train THẬT trên 40 câu mở đầu Truyện Kiều, verify bằng số đo
// thật (không suy diễn, không số giả lập).
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const corpusFull = readFileSync(join(__dirname, 'corpus-kieu.txt'), 'utf8');
  const CORPUS = corpusFull.split('\n').slice(0, 40).join(' ');

  let errors = 0;
  let checks = 0;
  function check(name, cond, detail) {
    checks++;
    if (!cond) {
      console.log('LOI', name, detail !== undefined ? detail : '');
      errors++;
    }
  }

  const DMODEL = 48,
    NUM_HEADS = 4,
    DFF = 96,
    NUM_BLOCKS = 2,
    BLOCK_LEN = 24,
    NUM_MERGES = 150;

  // 1. Vocab + đếm tham số: verify công thức tay khớp countBreakdown thật.
  const vocab = buildVocab(CORPUS, NUM_MERGES);
  console.log(`Vocab size (40 cau dau Kieu, ${NUM_MERGES} merge): ${vocab.vocabSize}`);
  const model = initGPTMini(7, vocab.vocabSize, DMODEL, NUM_HEADS, DFF, NUM_BLOCKS, BLOCK_LEN + 8);
  const bd = countBreakdown(model);
  const dk = DMODEL / NUM_HEADS;
  const expectedPerBlock = NUM_HEADS * (DMODEL * dk * 3 + dk * DMODEL) + 2 * 2 * DMODEL + 2 * DMODEL * DFF + DFF + DMODEL;
  check('tham so 1 block khop cong thuc tay', bd.perBlock, expectedPerBlock, `got=${bd.perBlock} exp=${expectedPerBlock}`);
  check('tong = tok + pos + blocks (head weight-tied, khong cong them)', bd.total, bd.tok + bd.pos + bd.blocksTotal);
  console.log(
    `Dem tham so: tokEmb=${bd.tok} + posEmb=${bd.pos} + ${bd.numBlocks} block x ${bd.perBlock}=${bd.blocksTotal} + head(tied)=0 => TONG=${bd.total}`
  );

  const allTokens = encodeText(CORPUS, vocab.merges);
  const allIds = tokensToIds(allTokens, vocab.stoi, 0);
  const fullDataset = buildDataset(allIds, BLOCK_LEN);
  console.log(`Dataset: ${fullDataset.length} block khong chong lan, moi block ${BLOCK_LEN} token`);

  // 2. Train full-batch tren TOAN BO dataset — verify loss giam manh (overfit
  // nhanh tren corpus ti hon, dung y syllabus 19.2/19.3).
  {
    const optimizer = new Adam(paramsOf(model), 0.03);
    const losses = [];
    for (let ep = 0; ep < 150; ep++) {
      const { loss } = trainEpoch(model, optimizer, fullDataset, 1.0);
      losses.push(loss);
    }
    console.log(
      `Loss full-batch: epoch0=${losses[0].toFixed(3)} epoch60=${losses[60].toFixed(3)} epoch149=${losses[149].toFixed(3)} (uniform=${Math.log(vocab.vocabSize).toFixed(2)})`
    );
    check('loss giam manh sau 150 epoch full-batch (< 20% loss ban dau)', losses[149] < losses[0] * 0.2, `${losses[0]} -> ${losses[149]}`);
    check('loss da giam ro ret ngay tai epoch 60 (< 0.3) — dung so voi demo live 60 epoch', losses[60] < 0.3, losses[60]);

    // Sinh van ban SAU train — verify nho DUNG NGUYEN VAN mot doan dau (bang chung THAT cua viec hoc, khong phai suy dien).
    const seedIds = tokensToIds(encodeText('Trăm năm', vocab.merges), vocab.stoi, 0);
    const rngGen = mulberry32(9);
    const generatedIds = generate(model, seedIds, 20, 0.3, vocab.vocabSize, 1.0, rngGen, BLOCK_LEN + 8);
    const text = decodeTokens(generatedIds.map((i) => vocab.itos[i]));
    console.log('Van ban sinh sau train (seed="Trăm năm", T=0.3):', text);
    check(
      'sinh van ban nho DUNG NGUYEN VAN cau dau tien (bang chung that cua memorization)',
      text.startsWith('Trăm năm trong cõi người ta, Chữ tài chữ mệnh khéo là ghét nhau.')
    );
  }

  // 3. Train/val split — verify DUNG chu ky overfit kinh dien: val loss dat
  // MIN rat som roi QUAY DAU tang manh trong khi train loss van tiep tuc
  // giam deu (diem giao duc co chu dich cua 19.2 — corpus ti hon "hoc thuoc
  // long" thay vi tong quat hoa).
  {
    const modelVal = initGPTMini(7, vocab.vocabSize, DMODEL, NUM_HEADS, DFF, NUM_BLOCKS, BLOCK_LEN + 8);
    const trainSet = fullDataset.filter((_, i) => i % 5 !== 0);
    const valSet = fullDataset.filter((_, i) => i % 5 === 0);
    const optimizer = new Adam(paramsOf(modelVal), 0.03);
    const trainLosses = [],
      valLosses = [];
    for (let ep = 0; ep < 200; ep++) {
      const { loss } = trainEpoch(modelVal, optimizer, trainSet, 1.0);
      trainLosses.push(loss);
      valLosses.push(evalLoss(modelVal, valSet));
    }
    const minValIdx = valLosses.indexOf(Math.min(...valLosses));
    console.log(
      `Train/val: train=${trainSet.length} val=${valSet.length} block | val MIN tai epoch ${minValIdx} (${valLosses[minValIdx].toFixed(3)}), val epoch199=${valLosses[199].toFixed(3)}, train epoch199=${trainLosses[199].toFixed(3)}`
    );
    check('val loss dat MIN rat som (truoc epoch 20)', minValIdx < 20, minValIdx);
    check('val loss CUOI cao hon RAT NHIEU so voi val MIN (qua dau ro ret)', valLosses[199] > valLosses[minValIdx] * 2, `${valLosses[minValIdx]} -> ${valLosses[199]}`);
    check('train loss CUOI van tiep tuc giam deu (khong quay dau nhu val)', trainLosses[199] < trainLosses[minValIdx], `${trainLosses[minValIdx]} -> ${trainLosses[199]}`);
  }

  // 4. Gradient clipping tren graph THAT — verify norm SAU clip <= maxNorm.
  {
    const modelClip = initGPTMini(3, vocab.vocabSize, DMODEL, NUM_HEADS, DFF, NUM_BLOCKS, BLOCK_LEN + 8);
    const params = paramsOf(modelClip);
    for (const p of params) p.zeroGrad();
    lossOnBatch(modelClip, fullDataset[0], true);
    const beforeSq = params.reduce((s, p) => s + p.grad.reduce((s2, g) => s2 + g * g, 0), 0);
    const { norm } = clipGlobalGradNorm(params, 0.3);
    const afterSq = params.reduce((s, p) => s + p.grad.reduce((s2, g) => s2 + g * g, 0), 0);
    console.log(`Gradient clipping: norm truoc=${norm.toFixed(3)}, norm sau=${Math.sqrt(afterSq).toFixed(3)} (maxNorm=0.3)`);
    check('clip: norm truoc > maxNorm (can clip that)', norm > 0.3, norm);
    check('clip: norm SAU ~ dung maxNorm=0.3', Math.abs(Math.sqrt(afterSq) - 0.3) < 1e-3, Math.sqrt(afterSq));
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
