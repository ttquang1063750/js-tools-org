// cpu-apple-silicon-uma.js — Lesson 9's demo (Apple Silicon & UMA): compares the
// time to move one frame over PCIe (a CPU->GPU copy) against accessing it directly
// under UMA, using the REAL engine from cpu-core.js.
//
// One file serves both locales, so every visible string goes through STRINGS and
// is picked by <html lang>, which the page itself sets per locale.
import { frameBytes, compareTransferMethods } from './cpu-core.js';

const IS_EN = document.documentElement.lang === 'en';
const STRINGS = {
  vi: {
    frameSize: 'Dung lượng khung hình',
    pcie: (gbps) => `PCIe Gen ${gbps} GB/s`,
    uma: (gbps) => `UMA ${gbps} GB/s`,
    speedup: 'UMA nhanh hơn',
  },
  en: {
    frameSize: 'Frame size',
    pcie: (gbps) => `PCIe at ${gbps} GB/s`,
    uma: (gbps) => `UMA at ${gbps} GB/s`,
    speedup: 'UMA is faster by',
  },
};
const T = STRINGS[IS_EN ? 'en' : 'vi'];

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MiB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KiB';
  return bytes + ' B';
}

function initBandwidthDemo() {
  const widthInput = document.getElementById('uma-width-input');
  const heightInput = document.getElementById('uma-height-input');
  const bppInput = document.getElementById('uma-bpp-input');
  const pcieInput = document.getElementById('uma-pcie-input');
  const umaInput = document.getElementById('uma-bandwidth-input');
  const output = document.getElementById('uma-output');
  const barPcie = document.getElementById('uma-bar-pcie');
  const barUma = document.getElementById('uma-bar-uma');
  if (!widthInput || !output) return;

  function run() {
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);
    const bpp = parseInt(bppInput.value, 10);
    const pcieGBps = parseFloat(pcieInput.value);
    const umaGBps = parseFloat(umaInput.value);

    const bytes = frameBytes(width, height, bpp);
    const cmp = compareTransferMethods(bytes, pcieGBps, umaGBps);

    output.innerHTML = `
      <div>${T.frameSize}: <strong>${formatBytes(bytes)}</strong></div>
      <div>${T.pcie(pcieGBps)}: <strong>${cmp.pcieTimeMs.toFixed(4)} ms</strong></div>
      <div>${T.uma(umaGBps)}: <strong>${cmp.umaTimeMs.toFixed(4)} ms</strong></div>
      <div>${T.speedup}: <strong>${cmp.speedupFactor.toFixed(2)}x</strong></div>
    `;

    const maxMs = Math.max(cmp.pcieTimeMs, cmp.umaTimeMs);
    barPcie.style.width = `${(cmp.pcieTimeMs / maxMs) * 100}%`;
    barUma.style.width = `${(cmp.umaTimeMs / maxMs) * 100}%`;
  }

  [widthInput, heightInput, bppInput, pcieInput, umaInput].forEach((el) => el.addEventListener('input', run));
  run();
}

initBandwidthDemo();
