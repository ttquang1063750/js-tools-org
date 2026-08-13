// Lesson 4's demo is only "DOM glue": every timing/CPI computation and every
// hazard detection is delegated to the shared cpu-core.js engine (a single source
// of truth, verified by running `node cpu-core.js`). This file never recomputes a
// formula itself, so it cannot drift away from the engine.
//
// One file serves both locales, so every visible string goes through STRINGS and
// is picked by <html lang>, which the page itself sets per locale. NUM_LOCALE
// matters too: number grouping differs (500.002 in vi-VN vs 500,002 in en-US), so
// hardcoding one locale prints the wrong format on the other page.
import { assembleRV32I, decodeRV32I, pipelineTime, pipelineCPI, detectHazards } from './cpu-core.js';

const IS_EN = document.documentElement.lang === 'en';
const NUM_LOCALE = IS_EN ? 'en-US' : 'vi-VN';

const STRINGS = {
  vi: {
    hazardLine: (i, kind, n) => `Lệnh #${i}: hazard ${kind} → ${n} stall`,
    noHazard: '(không có hazard nào)',
    totalStalls: (n) => `Tổng số stall: ${n}`,
  },
  en: {
    hazardLine: (i, kind, n) => `Instruction #${i}: ${kind} hazard → ${n} stall(s)`,
    noHazard: '(no hazards at all)',
    totalStalls: (n) => `Total stalls: ${n}`,
  },
};
const T_STR = STRINGS[IS_EN ? 'en' : 'vi'];

const SEQUENCES = {
  raw: {
    label: 'RAW: ADDI x1,x0,20 / ADD x2,x1,x1 / SUB x3,x2,x1',
    build: () => [
      assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 20 }),
      assembleRV32I('ADD', { rd: 2, rs1: 1, rs2: 1 }),
      assembleRV32I('SUB', { rd: 3, rs1: 2, rs2: 1 }),
    ],
  },
  loadUse: {
    label: 'Load-use: LW x1,0(x2) / ADD x3,x1,x1',
    build: () => [assembleRV32I('LW', { rd: 1, rs1: 2, imm: 0 }), assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 1 })],
  },
};

function initTimingCalculator() {
  const numInput = document.getElementById('pipe-num-instr');
  const stallInput = document.getElementById('pipe-stall-cycles');
  const clockInput = document.getElementById('pipe-clock-period');
  const output = document.getElementById('pipe-timing-output');
  if (!numInput || !output) return;

  function update() {
    const n = Math.max(1, parseInt(numInput.value, 10) || 1);
    const stalls = Math.max(0, parseInt(stallInput.value, 10) || 0);
    const tclk = Math.max(0.01, parseFloat(clockInput.value) || 0.5);
    const t = pipelineTime(n, 5, stalls, tclk);
    const cpi = pipelineCPI(n, stalls);
    output.innerHTML = `T = (${n} + 5 - 1 + ${stalls}) × ${tclk}ns = <strong>${t.toLocaleString(NUM_LOCALE)}ns</strong> &nbsp;·&nbsp; CPI = <strong>${cpi.toFixed(4)}</strong>`;
  }

  [numInput, stallInput, clockInput].forEach((el) => el.addEventListener('input', update));
  update();
}

function initHazardDemo() {
  const seqSelect = document.getElementById('pipe-seq-select');
  const fwdCheckbox = document.getElementById('pipe-forwarding-checkbox');
  const output = document.getElementById('pipe-hazard-output');
  if (!seqSelect || !output) return;

  function update() {
    const seq = SEQUENCES[seqSelect.value];
    const instrs = seq.build().map(decodeRV32I);
    const result = detectHazards(instrs, fwdCheckbox.checked);
    const hazardLines = result.hazards.length
      ? result.hazards
          .map((h) => T_STR.hazardLine(h.index, h.type === 'LOAD_USE' ? 'LOAD-USE' : 'RAW', h.stalls))
          .join('<br>')
      : T_STR.noHazard;
    output.innerHTML = `${hazardLines}<br><strong>${T_STR.totalStalls(result.totalStalls)}</strong>`;
  }

  seqSelect.addEventListener('change', update);
  fwdCheckbox.addEventListener('change', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initTimingCalculator();
  initHazardDemo();
});
