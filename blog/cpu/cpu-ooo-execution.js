// cpu-ooo-execution.js — the demo for Lesson 6 (OOO & Tomasulo): runs the REAL
// Tomasulo simulator (from cpu-core.js) over a few sample programs and shows the
// Issue/Execute/Writeback/Commit schedule table plus the final register state.
//
// This file is shared by BOTH locales, so every string it writes into the DOM has
// to follow the page language. Without this, the English page rendered the whole
// schedule table with Vietnamese headers at runtime.
import { runTomasulo } from './cpu-core.js';

const STRINGS = {
  vi: {
    instruction: 'Lệnh',
    totalCycles: 'Tổng chu kỳ',
    warWaw: 'WAR/WAW: MUL R1 / ADD R2 / SUB R1 (đổi tên loại bỏ phụ thuộc giả)',
    rawChain: 'RAW thật: MUL R1 / ADD R2,R1 / SUB R3,R2 (phụ thuộc dây chuyền, KHÔNG thể loại bỏ)',
    noConflict: 'Không xung đột: MUL R1 / ADD R4 / SUB R5 (độc lập hoàn toàn)',
  },
  en: {
    instruction: 'Instruction',
    totalCycles: 'Total cycles',
    warWaw: 'WAR/WAW: MUL R1 / ADD R2 / SUB R1 (renaming removes the false dependencies)',
    rawChain: 'Real RAW: MUL R1 / ADD R2,R1 / SUB R3,R2 (a dependency chain that CANNOT be removed)',
    noConflict: 'No conflict: MUL R1 / ADD R4 / SUB R5 (fully independent)',
  },
};
// <html lang> is set per locale by the page itself, so it is the reliable source.
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];

const INITIAL_REGS = [0, 10, 3, 4, 5, 6, 20, 2];

const PROGRAMS = {
  warWaw: {
    label: T.warWaw,
    instrs: [
      { op: 'MUL', dest: 1, src1: 2, src2: 3, text: 'MUL R1, R2, R3' },
      { op: 'ADD', dest: 2, src1: 4, src2: 5, text: 'ADD R2, R4, R5' },
      { op: 'SUB', dest: 1, src1: 6, src2: 7, text: 'SUB R1, R6, R7' },
    ],
  },
  rawChain: {
    label: T.rawChain,
    instrs: [
      { op: 'MUL', dest: 1, src1: 2, src2: 3, text: 'MUL R1, R2, R3' },
      { op: 'ADD', dest: 2, src1: 1, src2: 5, text: 'ADD R2, R1, R5' },
      { op: 'SUB', dest: 3, src1: 2, src2: 7, text: 'SUB R3, R2, R7' },
    ],
  },
  noConflict: {
    label: T.noConflict,
    instrs: [
      { op: 'MUL', dest: 1, src1: 2, src2: 3, text: 'MUL R1, R2, R3' },
      { op: 'ADD', dest: 4, src1: 4, src2: 5, text: 'ADD R4, R4, R5' },
      { op: 'SUB', dest: 5, src1: 6, src2: 7, text: 'SUB R5, R6, R7' },
    ],
  },
};

function renderSchedule(result, instrs) {
  const rows = instrs
    .map((instr, i) => {
      const t = result.trace[i];
      return `<tr><td>${instr.text}</td><td>${t.issue}</td><td>${t.execStart}</td><td>${t.writeback}</td><td>${t.commit}</td></tr>`;
    })
    .join('');
  return `
    <table class="tomasulo-table">
      <thead><tr><th>${T.instruction}</th><th>Issue</th><th>Exec Start</th><th>Writeback</th><th>Commit</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="tomasulo-stat">${T.totalCycles}: <strong>${result.totalCycles}</strong> · IPC: <strong>${result.ipc.toFixed(4)}</strong></div>
  `;
}

function initTomasuloDemo() {
  const select = document.getElementById('ooo-program-select');
  const output = document.getElementById('ooo-schedule-output');
  if (!select || !output) return;

  function run() {
    const program = PROGRAMS[select.value];
    const result = runTomasulo(program.instrs, { initialRegs: INITIAL_REGS });
    output.innerHTML = renderSchedule(result, program.instrs);
  }

  select.addEventListener('change', run);
  run();
}

initTomasuloDemo();
