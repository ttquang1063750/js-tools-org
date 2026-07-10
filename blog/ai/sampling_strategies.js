// sampling_strategies.js — Model bigram từ Truyện Kiều + 4 chiến lược sinh
// văn bản: greedy, temperature, top-k, top-p (nucleus), và beam search.
// Bài 18: Sinh văn bản, Sampling & Alignment
// js-tools.org/blog/ai/ai-sampling-alignment
//
// Cách chạy self-test (cần Node.js, đọc corpus-kieu.txt cùng thư mục):
//   node sampling_strategies.js
// Kỳ vọng in ra: "SELF-TEST PASS (N checks)"

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ---------------------------------------------------------------------------
// Bigram mức TỪ: đếm P(từ_kế_tiếp | từ_hiện_tại) trực tiếp từ tần suất xuất
// hiện trong corpus — mô hình ngôn ngữ đơn giản nhất có thể, đủ để minh hoạ
// cả 4 chiến lược sampling mà không cần Transformer đầy đủ.
// ---------------------------------------------------------------------------
function buildBigram(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const counts = new Map(); // từ -> Map(từ_kế_tiếp -> tần suất)
  for (let i = 0; i < words.length - 1; i++) {
    const w = words[i],
      nw = words[i + 1];
    if (!counts.has(w)) counts.set(w, new Map());
    const m = counts.get(w);
    m.set(nw, (m.get(nw) || 0) + 1);
  }
  return counts;
}

function nextCandidates(bigram, word) {
  const m = bigram.get(word);
  if (!m || m.size === 0) return null;
  return [...m.entries()].sort((a, b) => b[1] - a[1]); // giảm dần theo tần suất
}

// Seeded PRNG — mọi kết quả sampling trong bài tái lập được.
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

// ---- Chiến lược 1: Greedy — luôn chọn ứng viên tần suất cao nhất ----
function greedyGenerate(bigram, seed, steps) {
  const seq = [seed];
  let cur = seed;
  for (let i = 0; i < steps; i++) {
    const cands = nextCandidates(bigram, cur);
    if (!cands) break;
    cur = cands[0][0];
    seq.push(cur);
  }
  return seq;
}

// ---- Chiến lược 2: Temperature — chia logit cho T trước softmax ----
function softmaxWithTemp(cands, T) {
  const logits = cands.map(([, c]) => Math.log(c) / T);
  const maxL = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxL));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
function sampleFrom(probs, rng) {
  const r = rng();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (r < cum) return i;
  }
  return probs.length - 1;
}

// ---- Chiến lược 3: Top-k / Top-p (nucleus) — cắt đuôi phân bố ----
function topK(cands, k) {
  const kept = cands.slice(0, k);
  const total = kept.reduce((s, [, c]) => s + c, 0);
  return kept.map(([w, c]) => [w, c / total]);
}
function topP(cands, p) {
  const total = cands.reduce((s, [, c]) => s + c, 0);
  const probs = cands.map(([w, c]) => [w, c / total]);
  let cum = 0;
  const kept = [];
  for (const [w, prob] of probs) {
    kept.push([w, prob]);
    cum += prob;
    if (cum >= p) break;
  }
  const keptTotal = kept.reduce((s, [, pr]) => s + pr, 0);
  return kept.map(([w, pr]) => [w, pr / keptTotal]);
}

// ---- Chiến lược 4: Beam search — giữ k chuỗi log-prob cao nhất mỗi bước ----
function logProbOfSequence(bigram, seq) {
  let lp = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    const cands = bigram.get(seq[i]);
    if (!cands || !cands.has(seq[i + 1])) return -Infinity;
    const total = [...cands.values()].reduce((a, b) => a + b, 0);
    lp += Math.log(cands.get(seq[i + 1]) / total);
  }
  return lp;
}
function beamSearch(bigram, seed, steps, beamWidth) {
  let beams = [{ seq: [seed], lp: 0 }];
  for (let t = 0; t < steps; t++) {
    const next = [];
    for (const b of beams) {
      const cur = b.seq[b.seq.length - 1];
      const cands = nextCandidates(bigram, cur);
      if (!cands) continue;
      const total = cands.reduce((s, [, c]) => s + c, 0);
      for (const [w, c] of cands.slice(0, beamWidth)) {
        next.push({ seq: [...b.seq, w], lp: b.lp + Math.log(c / total) });
      }
    }
    if (next.length === 0) break;
    next.sort((a, b) => b.lp - a.lp);
    beams = next.slice(0, beamWidth);
  }
  return beams[0];
}

// ---------------------------------------------------------------------------
// Self-test — train trên corpus-kieu.txt thật, verify cả 4 chiến lược
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const corpus = readFileSync(join(__dirname, 'corpus-kieu.txt'), 'utf8');
const bigram = buildBigram(corpus);

let errors = 0;
let checks = 0;
function check(name, cond, detail) {
  checks++;
  if (!cond) {
    console.log('LOI', name, detail !== undefined ? detail : '');
    errors++;
  }
}

// Greedy degeneration: NHIỀU seed khác nhau đều rơi vào ĐÚNG 1 chu kỳ lặp
{
  const seeds = ['Trăm', 'người', 'này', 'chàng', 'nàng'];
  const CYCLE = 'một vài bông hoa. Thanh minh vốn người ta, Chữ tài sắc thiên bạc mệnh';
  for (const seed of seeds) {
    const seq = greedyGenerate(bigram, seed, 40).join(' ');
    check(`greedy tu "${seed}" roi vao chu ky lap`, seq.includes(CYCLE), seq);
  }
}

// Temperature: T thấp hội tụ về greedy; T cao tăng đa dạng (đo thật)
{
  const cands = nextCandidates(bigram, 'Nàng');
  const rngLow = mulberry32(1);
  let matches = 0;
  const trials = 300;
  for (let i = 0; i < trials; i++) {
    if (sampleFrom(softmaxWithTemp(cands, 0.1), rngLow) === 0) matches++;
  }
  check('T=0.1 hoi tu ve greedy (>90%)', matches / trials > 0.9, matches + '/' + trials);

  const diversities = [0.5, 1.0, 2.0].map((T) => {
    const rng = mulberry32(7);
    const chosen = new Set();
    for (let i = 0; i < trials; i++) chosen.add(sampleFrom(softmaxWithTemp(cands, T), rng));
    return chosen.size;
  });
  check('T cang cao da dang cang tang', diversities[2] >= diversities[0], diversities.join(','));
}

// Top-k / top-p: cắt đúng số lượng + renormalize tổng = 1
{
  const cands = nextCandidates(bigram, 'người');
  const k5 = topK(cands, 5);
  check('top-k=5 giu dung 5', k5.length === 5, k5.length);
  check(
    'top-k renormalize = 1',
    Math.abs(k5.reduce((s, [, p]) => s + p, 0) - 1) < 1e-9
  );
  const p80 = topP(cands, 0.8);
  check('top-p cat duoi that (< tong so ung vien)', p80.length < cands.length, p80.length + '/' + cands.length);
  check(
    'top-p renormalize = 1',
    Math.abs(p80.reduce((s, [, p]) => s + p, 0) - 1) < 1e-9
  );
}

// Beam search: verify log-prob >= greedy (không tệ hơn)
{
  const seed = 'người';
  const g = greedyGenerate(bigram, seed, 6);
  const glp = logProbOfSequence(bigram, g);
  const b = beamSearch(bigram, seed, 6, 3);
  check('beam search logprob >= greedy', b.lp >= glp - 1e-9, `beam=${b.lp} greedy=${glp}`);
}

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');

export { buildBigram, nextCandidates, greedyGenerate, softmaxWithTemp, sampleFrom, topK, topP, beamSearch, mulberry32 };
