// Demo Bài 4 — chỉ là "lớp keo DOM": mọi phép tính thời gian/CPI và phát hiện
// hazard được ủy thác cho engine dùng chung cpu-core.js (một nguồn sự thật
// duy nhất, đã verify bằng `node cpu-core.js`). File này KHÔNG tự tính lại
// công thức để tránh phân kỳ với engine.
import { assembleRV32I, decodeRV32I, pipelineTime, pipelineCPI, detectHazards } from './cpu-core.js';

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
    output.innerHTML = `T = (${n} + 5 - 1 + ${stalls}) × ${tclk}ns = <strong>${t.toLocaleString('vi-VN')}ns</strong> &nbsp;·&nbsp; CPI = <strong>${cpi.toFixed(4)}</strong>`;
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
          .map((h) => `Lệnh #${h.index}: hazard ${h.type === 'LOAD_USE' ? 'LOAD-USE' : 'RAW'} → ${h.stalls} stall`)
          .join('<br>')
      : '(không có hazard nào)';
    output.innerHTML = `${hazardLines}<br><strong>Tổng số stall: ${result.totalStalls}</strong>`;
  }

  seqSelect.addEventListener('change', update);
  fwdCheckbox.addEventListener('change', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initTimingCalculator();
  initHazardDemo();
});
