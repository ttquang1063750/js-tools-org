// cpu-branch-prediction.js — demo cho Bài 5 (Dự Đoán Nhánh & Spectre): chạy
// bộ dự đoán 1-bit và 2-bit THẬT (từ cpu-core.js) trên một chuỗi nhánh do
// người dùng chọn, hiển thị tỷ lệ đoán đúng + vết trạng thái FSM; và một máy
// tính CPI hiệu dụng dùng đúng effectiveCPI().
import { makeBranchPredictor1Bit, makeBranchPredictor2Bit, runPredictor, effectiveCPI } from './cpu-core.js';

// Các chuỗi nhánh mẫu (mảng 'T'/'N') minh hoạ các cấu trúc điều khiển thường gặp.
const SEQUENCES = {
  nestedLoop: {
    label: 'Vòng lặp lồng nhau (4×T rồi 1×N, lặp 3 lần)',
    build() {
      const seq = [];
      for (let outer = 0; outer < 3; outer++) {
        for (let inner = 0; inner < 4; inner++) seq.push('T');
        seq.push('N');
      }
      return seq;
    },
  },
  alwaysTaken: {
    label: 'Vòng lặp đơn (luôn nhảy — 8×T)',
    build() {
      return new Array(8).fill('T');
    },
  },
  alternating: {
    label: 'Xen kẽ tuyệt đối (T,N,T,N,... — nhánh KHÔNG THỂ đoán đúng)',
    build() {
      const seq = [];
      for (let i = 0; i < 10; i++) seq.push(i % 2 === 0 ? 'T' : 'N');
      return seq;
    },
  },
};

function renderTrace(containerId, result) {
  const el = document.getElementById(containerId);
  const cells = result.trace
    .map((t) => `<span class="bp-cell ${t.hit ? 'bp-cell--hit' : 'bp-cell--miss'}">${t.actual}</span>`)
    .join('');
  el.innerHTML = `
    <div class="bp-trace">${cells}</div>
    <div class="bp-stat">Đúng: <strong>${result.correct}/${result.total}</strong> (${(result.rate * 100).toFixed(1)}%)</div>
  `;
}

function initPredictorDemo() {
  const seqSelect = document.getElementById('bp-seq-select');
  const runBtn = document.getElementById('bp-run-btn');
  if (!seqSelect || !runBtn) return;

  function run() {
    const seqKey = seqSelect.value;
    const seq = SEQUENCES[seqKey].build();
    const r1 = runPredictor(makeBranchPredictor1Bit(), seq);
    const r2 = runPredictor(makeBranchPredictor2Bit(), seq);
    renderTrace('bp-trace-1bit', r1);
    renderTrace('bp-trace-2bit', r2);
  }

  runBtn.addEventListener('click', run);
  seqSelect.addEventListener('change', run);
  run();
}

function initCpiCalculator() {
  const idealInput = document.getElementById('bp-cpi-ideal');
  const freqInput = document.getElementById('bp-cpi-freq');
  const missInput = document.getElementById('bp-cpi-miss');
  const penaltyInput = document.getElementById('bp-cpi-penalty');
  const output = document.getElementById('bp-cpi-output');
  if (!idealInput || !output) return;

  function compute() {
    const ideal = parseFloat(idealInput.value);
    const freq = parseFloat(freqInput.value);
    const miss = parseFloat(missInput.value);
    const penalty = parseFloat(penaltyInput.value);
    const cpi = effectiveCPI(ideal, freq, miss, penalty);
    output.textContent = `CPI_eff = ${ideal} + ${freq} × ${miss} × ${penalty} = ${cpi.toFixed(4)}`;
  }

  [idealInput, freqInput, missInput, penaltyInput].forEach((input) => input.addEventListener('input', compute));
  compute();
}

initPredictorDemo();
initCpiCalculator();
