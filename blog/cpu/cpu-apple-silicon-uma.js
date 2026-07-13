// cpu-apple-silicon-uma.js — demo cho Bài 9 (Apple Silicon & UMA): so sánh
// trực tiếp thời gian truyền một khung hình qua PCIe (sao chép CPU->GPU) vs
// truy cập trực tiếp trên UMA, dùng engine THẬT (từ cpu-core.js).
import { frameBytes, compareTransferMethods } from './cpu-core.js';

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
      <div>Dung lượng khung hình: <strong>${formatBytes(bytes)}</strong></div>
      <div>PCIe Gen ${pcieGBps} GB/s: <strong>${cmp.pcieTimeMs.toFixed(4)} ms</strong></div>
      <div>UMA ${umaGBps} GB/s: <strong>${cmp.umaTimeMs.toFixed(4)} ms</strong></div>
      <div>UMA nhanh hơn: <strong>${cmp.speedupFactor.toFixed(2)}x</strong></div>
    `;

    const maxMs = Math.max(cmp.pcieTimeMs, cmp.umaTimeMs);
    barPcie.style.width = `${(cmp.pcieTimeMs / maxMs) * 100}%`;
    barUma.style.width = `${(cmp.umaTimeMs / maxMs) * 100}%`;
  }

  [widthInput, heightInput, bppInput, pcieInput, umaInput].forEach((el) => el.addEventListener('input', run));
  run();
}

initBandwidthDemo();
