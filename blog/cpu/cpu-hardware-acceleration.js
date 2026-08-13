// cpu-hardware-acceleration.js - Lesson 10 demo (GPU/NPU/AMX): compares the
// time of an NxN matrix multiply across 3 architectures (scalar/SIMD/GPU)
// using the REAL engine from cpu-core.js, including the small-matrix GPU
// overhead pitfall.
import { matrixMultiplyFlops, compareComputeMethods } from './cpu-core.js';

// The page exists in both locales; every string this file injects into the DOM
// has to follow the page, not the author. Without this the English page would
// show Vietnamese labels and vi-VN digit grouping in the middle of the demo.
const STRINGS = {
  vi: {
    totalFlops: 'Tổng FLOPs',
    overhead: 'overhead',
    tooSmall: '⚠️ Ma trận quá nhỏ — overhead GPU khiến nó CHẬM HƠN scalar!',
    locale: 'vi-VN',
  },
  en: {
    totalFlops: 'Total FLOPs',
    overhead: 'overhead',
    tooSmall: '⚠️ Matrix too small — GPU overhead makes it SLOWER than scalar!',
    locale: 'en-US',
  },
};
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];

function formatTime(seconds) {
  if (seconds >= 1) return seconds.toFixed(4) + ' s';
  if (seconds >= 0.001) return (seconds * 1000).toFixed(4) + ' ms';
  return (seconds * 1e6).toFixed(4) + ' µs';
}

function initComputeDemo() {
  const nInput = document.getElementById('hw-n-input');
  const scalarInput = document.getElementById('hw-scalar-input');
  const simdInput = document.getElementById('hw-simd-input');
  const gpuInput = document.getElementById('hw-gpu-input');
  const overheadInput = document.getElementById('hw-overhead-input');
  const output = document.getElementById('hw-output');
  const barScalar = document.getElementById('hw-bar-scalar');
  const barSimd = document.getElementById('hw-bar-simd');
  const barGpu = document.getElementById('hw-bar-gpu');
  if (!nInput || !output) return;

  function run() {
    const n = parseInt(nInput.value, 10);
    const scalarGFLOPS = parseFloat(scalarInput.value);
    const simdGFLOPS = parseFloat(simdInput.value);
    const gpuTFLOPS = parseFloat(gpuInput.value);
    const overheadMs = parseFloat(overheadInput.value);

    const flops = matrixMultiplyFlops(n);
    const cmp = compareComputeMethods(n, scalarGFLOPS, simdGFLOPS, gpuTFLOPS, overheadMs / 1000);

    output.innerHTML = `
      <div>${T.totalFlops}: <strong>${flops.toLocaleString(T.locale)}</strong></div>
      <div>Scalar (${scalarGFLOPS} GFLOPS): <strong>${formatTime(cmp.scalarTimeSeconds)}</strong></div>
      <div>SIMD (${simdGFLOPS} GFLOPS): <strong>${formatTime(cmp.simdTimeSeconds)}</strong></div>
      <div>GPU/AMX (${gpuTFLOPS} TFLOPS + ${overheadMs}ms ${T.overhead}): <strong>${formatTime(cmp.gpuTimeSeconds)}</strong></div>
      ${cmp.gpuTimeSeconds > cmp.scalarTimeSeconds ? `<div style="color:#f87171">${T.tooSmall}</div>` : ''}
    `;

    const maxTime = Math.max(cmp.scalarTimeSeconds, cmp.simdTimeSeconds, cmp.gpuTimeSeconds);
    barScalar.style.width = `${(cmp.scalarTimeSeconds / maxTime) * 100}%`;
    barSimd.style.width = `${(cmp.simdTimeSeconds / maxTime) * 100}%`;
    barGpu.style.width = `${(cmp.gpuTimeSeconds / maxTime) * 100}%`;
  }

  [nInput, scalarInput, simdInput, gpuInput, overheadInput].forEach((el) => el.addEventListener('input', run));
  run();
}

initComputeDemo();
