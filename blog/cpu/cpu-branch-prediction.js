// cpu-branch-prediction.js — Lesson 5's demo (branch prediction & Spectre): runs
// the REAL 1-bit and 2-bit predictors (from cpu-core.js) over a branch sequence
// the reader picks, showing the hit rate plus the FSM state trace; and a
// effective-CPI calculator using effectiveCPI() itself.
//
// One file serves both locales, so every visible string goes through STRINGS and
// is picked by <html lang>, which the page itself sets per locale.
import { makeBranchPredictor1Bit, makeBranchPredictor2Bit, runPredictor, effectiveCPI } from './cpu-core.js';

const IS_EN = document.documentElement.lang === 'en';
const STRINGS = {
  vi: {
    nested: 'Vòng lặp lồng nhau (4×T rồi 1×N, lặp 3 lần)',
    always: 'Vòng lặp đơn (luôn nhảy — 8×T)',
    alternating: 'Xen kẽ tuyệt đối (T,N,T,N,... — nhánh KHÔNG THỂ đoán đúng)',
    correct: 'Đúng',
  },
  en: {
    nested: 'Nested loops (4×T then 1×N, repeated 3 times)',
    always: 'Single loop (always taken — 8×T)',
    alternating: 'Perfectly alternating (T,N,T,N,... — an UNPREDICTABLE branch)',
    correct: 'Correct',
  },
};
const T_STR = STRINGS[IS_EN ? 'en' : 'vi'];

const SEQUENCES = {
  nestedLoop: {
    label: T_STR.nested,
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
    label: T_STR.always,
    build() {
      return new Array(8).fill('T');
    },
  },
  alternating: {
    label: T_STR.alternating,
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
    <div class="bp-stat">${T_STR.correct}: <strong>${result.correct}/${result.total}</strong> (${(result.rate * 100).toFixed(1)}%)</div>
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
