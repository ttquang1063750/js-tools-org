// gan_diffusion_demo.js — file tải về của Bài 15 (Sinh ảnh: GAN & Diffusion).
// Dùng đúng NeuroJS (Tensor/matmul/relu/sigmoidCrossEntropy/Adam — không
// cần op mới, engine đã đủ từ Bài 5-14) — KHÔNG dùng framework ngoài.
// 3 thực nghiệm verify bằng số thật:
//   1. GAN mode collapse: Discriminator quá mạnh (5 bước D / 1 bước G) làm
//      Generator chỉ học in ra 1 trong 2 mode của phân bố mục tiêu.
//   2. GAN dao động đối kháng: loss D và G tương quan ÂM (khi 1 bên thắng,
//      bên kia thua) — khác hẳn hồi quy 1 chiều ổn định của diffusion.
//   3. Diffusion 2D: train denoiser trên hình xoắn ốc, sinh mẫu từ nhiễu
//      thuần qua reverse process, verify mẫu sinh ra GẦN hình gốc hơn hẳn
//      so với điểm nhiễu ngẫu nhiên.

import { Tensor, add, matmul, relu, sigmoidCrossEntropy, Adam } from './ai-neuro.js';

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
// GAN 1D: phan bo muc tieu la hon hop 2 Gauss (mean=-2 va +2, std=0,3) — de
// TRỰC QUAN thay mode collapse: G "trốn" vao dung 1 mode se de nhan ra ngay.
// ===========================================================================
function sampleReal(rng) {
  const mode = rng() < 0.5 ? -2 : 2;
  return mode + gaussian(rng) * 0.3;
}
const GAN_H = 16;
function initGanNet(seed, inDim) {
  const rng = mulberry32(seed);
  const r = (fanIn) => gaussian(rng) * Math.sqrt(2 / fanIn);
  return {
    W1: new Tensor(
      Array.from({ length: inDim * GAN_H }, () => r(inDim)),
      [inDim, GAN_H]
    ),
    b1: Tensor.zeros([GAN_H]),
    W2: new Tensor(
      Array.from({ length: GAN_H * GAN_H }, () => r(GAN_H)),
      [GAN_H, GAN_H]
    ),
    b2: Tensor.zeros([GAN_H]),
    W3: new Tensor(
      Array.from({ length: GAN_H * 1 }, () => r(GAN_H)),
      [GAN_H, 1]
    ),
    b3: Tensor.zeros([1]),
  };
}
function ganParamList(p) {
  return [p.W1, p.b1, p.W2, p.b2, p.W3, p.b3];
}
// forwardGanNet: dung CHUNG cho ca Generator lan Discriminator — nhan THANG
// 1 Tensor input (khong cat qua .data) de G va D noi lien graph autograd,
// gradient chay tu D nguoc ve tan G khi train Generator.
function forwardGanNet(p, inputTensor) {
  const h1 = relu(add(matmul(inputTensor, p.W1), p.b1));
  const h2 = relu(add(matmul(h1, p.W2), p.b2));
  return add(matmul(h2, p.W3), p.b3);
}

function trainGAN({ seed, epochs, dSteps, gSteps, lrD, lrG, batch }) {
  const G = initGanNet(seed, 1);
  const D = initGanNet(seed + 1, 1);
  const optG = new Adam(ganParamList(G), lrG);
  const optD = new Adam(ganParamList(D), lrD);
  const rng = mulberry32(seed + 100);
  const dEpochHist = [],
    gEpochHist = [];
  for (let epoch = 0; epoch < epochs; epoch++) {
    let dSum = 0,
      dCount = 0;
    for (let ds = 0; ds < dSteps; ds++) {
      ganParamList(D).forEach((p) => p.zeroGrad());
      for (let i = 0; i < batch; i++) {
        const xReal = new Tensor([sampleReal(rng)], [1, 1]);
        const lReal = sigmoidCrossEntropy(forwardGanNet(D, xReal), new Tensor([1], [1]));
        lReal.backward();
        dSum += lReal.data[0];
        dCount++;
        const z = new Tensor([gaussian(rng)], [1, 1]);
        const xFake = forwardGanNet(G, z);
        const lFake = sigmoidCrossEntropy(forwardGanNet(D, xFake), new Tensor([0], [1]));
        lFake.backward();
        dSum += lFake.data[0];
        dCount++;
      }
      ganParamList(D).forEach((p) => {
        for (let i = 0; i < p.size; i++) p.grad[i] /= batch * 2;
      });
      optD.step();
    }
    let gSum = 0,
      gCount = 0;
    for (let gs = 0; gs < gSteps; gs++) {
      ganParamList(G).forEach((p) => p.zeroGrad());
      for (let i = 0; i < batch; i++) {
        const z = new Tensor([gaussian(rng)], [1, 1]);
        const xFake = forwardGanNet(G, z);
        // non-saturating: G muon D(fake) -> nhan 1 (danh lua duoc D)
        const lG = sigmoidCrossEntropy(forwardGanNet(D, xFake), new Tensor([1], [1]));
        lG.backward();
        gSum += lG.data[0];
        gCount++;
      }
      ganParamList(G).forEach((p) => {
        for (let i = 0; i < p.size; i++) p.grad[i] /= batch;
      });
      optG.step();
    }
    dEpochHist.push(dSum / dCount);
    gEpochHist.push(gSum / gCount);
  }
  return { G, D, dEpochHist, gEpochHist };
}
function generateGanSamples(G, count, seed) {
  const rng = mulberry32(seed);
  const samples = [];
  for (let i = 0; i < count; i++) {
    const z = new Tensor([gaussian(rng)], [1, 1]);
    samples.push(forwardGanNet(G, z).data[0]);
  }
  return samples;
}
function modeCoverage(samples) {
  let near1 = 0,
    near2 = 0,
    other = 0;
  for (const s of samples) {
    if (Math.abs(s - -2) < 1) near1++;
    else if (Math.abs(s - 2) < 1) near2++;
    else other++;
  }
  return { near1, near2, other };
}
function correlation(a, b) {
  const ma = a.reduce((x, y) => x + y, 0) / a.length,
    mb = b.reduce((x, y) => x + y, 0) / b.length;
  let cov = 0,
    va = 0,
    vb = 0;
  for (let i = 0; i < a.length; i++) {
    cov += (a[i] - ma) * (b[i] - mb);
    va += (a[i] - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  }
  return cov / Math.sqrt(va * vb);
}

// ===========================================================================
// Diffusion 2D: hinh xoan oc, DDPM chuan (linear beta schedule, du de
// alphaBar cuoi ~0 — chuoi thanh nhieu THUAN sau dung T buoc).
// ===========================================================================
function makeSpiral(n, noiseStd, seed) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 4 * Math.PI;
    const r = 0.15 + 0.8 * (t / (4 * Math.PI));
    pts.push({ x: r * Math.cos(t) + gaussian(rng) * noiseStd, y: r * Math.sin(t) + gaussian(rng) * noiseStd });
  }
  return pts;
}
function buildNoiseSchedule(T, betaStart, betaEnd) {
  const betas = Array.from({ length: T }, (_, i) => betaStart + ((betaEnd - betaStart) * i) / (T - 1));
  const alphas = betas.map((b) => 1 - b);
  const alphaBars = [];
  let prod = 1;
  for (const a of alphas) {
    prod *= a;
    alphaBars.push(prod);
  }
  return { betas, alphas, alphaBars };
}
function forwardDiffuse(schedule, x0, t, rng) {
  const ab = schedule.alphaBars[t];
  const epsX = gaussian(rng),
    epsY = gaussian(rng);
  return {
    x: Math.sqrt(ab) * x0.x + Math.sqrt(1 - ab) * epsX,
    y: Math.sqrt(ab) * x0.y + Math.sqrt(1 - ab) * epsY,
    epsX,
    epsY,
  };
}
const DENOISE_H = 64;
function initDenoiser(seed) {
  const rng = mulberry32(seed);
  const r = (fanIn) => gaussian(rng) * Math.sqrt(2 / fanIn);
  return {
    W1: new Tensor(
      Array.from({ length: 3 * DENOISE_H }, () => r(3)),
      [3, DENOISE_H]
    ),
    b1: Tensor.zeros([DENOISE_H]),
    W2: new Tensor(
      Array.from({ length: DENOISE_H * DENOISE_H }, () => r(DENOISE_H)),
      [DENOISE_H, DENOISE_H]
    ),
    b2: Tensor.zeros([DENOISE_H]),
    W3: new Tensor(
      Array.from({ length: DENOISE_H * 2 }, () => r(DENOISE_H)),
      [DENOISE_H, 2]
    ),
    b3: Tensor.zeros([2]),
  };
}
function denoiserParamList(p) {
  return [p.W1, p.b1, p.W2, p.b2, p.W3, p.b3];
}
function forwardDenoiser(p, xt, yt, tNorm) {
  const inp = new Tensor([xt, yt, tNorm], [1, 3]);
  const h1 = relu(add(matmul(inp, p.W1), p.b1));
  const h2 = relu(add(matmul(h1, p.W2), p.b2));
  return add(matmul(h2, p.W3), p.b3);
}
function mseLoss2D(pred, epsX, epsY) {
  const dx = pred.data[0] - epsX,
    dy = pred.data[1] - epsY;
  const out = new Tensor([dx * dx + dy * dy], [1]);
  out._prev = [pred];
  out._backward = () => {
    pred._ensureGrad();
    pred.grad[0] += 2 * dx * out.grad[0];
    pred.grad[1] += 2 * dy * out.grad[0];
  };
  return out;
}
function trainDenoiser({ denoiser, data, schedule, T, epochs, batchSize, lr, seed }) {
  const opt = new Adam(denoiserParamList(denoiser), lr);
  const rngTrain = mulberry32(seed);
  let order = data.map((_, i) => i);
  const lossHist = [];
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rngTrain() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let epochLoss = 0,
      cnt = 0;
    for (let b = 0; b < order.length; b += batchSize) {
      const idxs = order.slice(b, b + batchSize);
      denoiserParamList(denoiser).forEach((pp) => pp.zeroGrad());
      let batchLoss = 0;
      for (const idx of idxs) {
        const x0 = data[idx];
        const t = Math.floor(rngTrain() * T);
        const { x: xt, y: yt, epsX, epsY } = forwardDiffuse(schedule, x0, t, rngTrain);
        const pred = forwardDenoiser(denoiser, xt, yt, t / T);
        const L = mseLoss2D(pred, epsX, epsY);
        L.backward();
        batchLoss += L.data[0];
      }
      denoiserParamList(denoiser).forEach((pp) => {
        for (let i = 0; i < pp.size; i++) pp.grad[i] /= idxs.length;
      });
      opt.step();
      epochLoss += batchLoss;
      cnt += idxs.length;
    }
    lossHist.push(epochLoss / cnt);
  }
  return lossHist;
}
// reverseSample: bat dau tu nhieu THUAN (x_T~N(0,1)), lap nguoc T buoc denoise
function reverseSample(denoiser, schedule, T, seed) {
  const rng = mulberry32(seed);
  let x = gaussian(rng),
    y = gaussian(rng);
  for (let t = T - 1; t >= 0; t--) {
    const pred = forwardDenoiser(denoiser, x, y, t / T);
    const epsX = pred.data[0],
      epsY = pred.data[1];
    const alpha = schedule.alphas[t],
      alphaBar = schedule.alphaBars[t],
      beta = schedule.betas[t];
    const coef = beta / Math.sqrt(1 - alphaBar);
    let nx = (x - coef * epsX) / Math.sqrt(alpha);
    let ny = (y - coef * epsY) / Math.sqrt(alpha);
    if (t > 0) {
      const sigma = Math.sqrt(beta);
      nx += sigma * gaussian(rng);
      ny += sigma * gaussian(rng);
    }
    x = nx;
    y = ny;
  }
  return { x, y };
}
function nearestDist(p, dataset) {
  let best = Infinity;
  for (const d of dataset) {
    const dist = Math.hypot(p.x - d.x, p.y - d.y);
    if (dist < best) best = dist;
  }
  return best;
}

export {
  sampleReal,
  initGanNet,
  ganParamList,
  forwardGanNet,
  trainGAN,
  generateGanSamples,
  modeCoverage,
  correlation,
  makeSpiral,
  buildNoiseSchedule,
  forwardDiffuse,
  initDenoiser,
  forwardDenoiser,
  trainDenoiser,
  reverseSample,
  nearestDist,
};

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

  console.log('--- Thi nghiem 1: GAN mode collapse (D qua manh, 5 buoc D / 1 buoc G) ---');
  const collapsed = trainGAN({ seed: 7, epochs: 60, dSteps: 5, gSteps: 1, lrD: 0.01, lrG: 0.01, batch: 16 });
  const collapsedSamples = generateGanSamples(collapsed.G, 200, 999);
  const coverage = modeCoverage(collapsedSamples);
  console.log('coverage (200 mau):', coverage);
  check('mode collapse: gan het mau roi vao 1 mode (near1)', coverage.near1, 170, 5);
  check('mode collapse: mode con lai gan nhu trong rong (near2)', coverage.near2, 0, 3);
  checkTrue('mode collapse: near1 >> near2 (lech hoan toan ve 1 phia)', coverage.near1 > coverage.near2 * 10);

  console.log('--- Thi nghiem 2: GAN dao dong doi khang (can bang 1 buoc D / 1 buoc G) ---');
  const balanced = trainGAN({ seed: 7, epochs: 80, dSteps: 1, gSteps: 1, lrD: 0.01, lrG: 0.01, batch: 16 });
  const corrDG = correlation(balanced.dEpochHist, balanced.gEpochHist);
  check('tuong quan loss D va loss G (AM - dac trung doi khang)', corrDG, -0.307, 0.05);
  checkTrue('tuong quan ro ret AM (< -0.2)', corrDG < -0.2);

  console.log('--- Thi nghiem 3: Diffusion 2D tren hinh xoan oc ---');
  const spiralData = makeSpiral(300, 0.02, 7);
  const T = 50;
  const schedule = buildNoiseSchedule(T, 1e-4, 0.2);
  check('alphaBar buoc dau (~1, gan nhu chua nhieu)', schedule.alphaBars[0], 0.9999, 1e-3);
  checkTrue('alphaBar buoc cuoi (~0, gan nhu nhieu THUAN)', schedule.alphaBars[T - 1] < 0.01);

  const denoiser = initDenoiser(1);
  const lossHist = trainDenoiser({
    denoiser,
    data: spiralData,
    schedule,
    T,
    epochs: 60,
    batchSize: 32,
    lr: 0.001,
    seed: 42,
  });
  checkTrue('diffusion loss giam ro ret so voi epoch dau', lossHist[lossHist.length - 1] < lossHist[0] * 0.3);

  const generated = [];
  for (let i = 0; i < 100; i++) generated.push(reverseSample(denoiser, schedule, T, 1000 + i));
  const avgDistGen = generated.reduce((s, p) => s + nearestDist(p, spiralData), 0) / generated.length;
  const rngBaseline = mulberry32(999);
  const randomPoints = Array.from({ length: 100 }, () => ({ x: gaussian(rngBaseline), y: gaussian(rngBaseline) }));
  const avgDistRandom = randomPoints.reduce((s, p) => s + nearestDist(p, spiralData), 0) / randomPoints.length;
  check('khoang cach trung binh mau SINH RA toi diem that gan nhat', avgDistGen, 0.1127, 0.03);
  check('khoang cach trung binh diem NHIEU NGAU NHIEN toi diem that gan nhat', avgDistRandom, 0.656, 0.05);
  checkTrue('diffusion sinh mau GAN hinh that hon han nhieu ngau nhien (>3 lan)', avgDistRandom / avgDistGen > 3);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
