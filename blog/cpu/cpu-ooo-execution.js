// cpu-ooo-execution.js — demo cho Bài 6 (OOO & Tomasulo): chạy bộ mô phỏng
// Tomasulo THẬT (từ cpu-core.js) trên vài chương trình mẫu, hiển thị bảng
// lập lịch Issue/Execute/Writeback/Commit + trạng thái thanh ghi cuối cùng.
import { runTomasulo } from './cpu-core.js';

const INITIAL_REGS = [0, 10, 3, 4, 5, 6, 20, 2];

const PROGRAMS = {
  warWaw: {
    label: 'WAR/WAW: MUL R1 / ADD R2 / SUB R1 (đổi tên loại bỏ phụ thuộc giả)',
    instrs: [
      { op: 'MUL', dest: 1, src1: 2, src2: 3, text: 'MUL R1, R2, R3' },
      { op: 'ADD', dest: 2, src1: 4, src2: 5, text: 'ADD R2, R4, R5' },
      { op: 'SUB', dest: 1, src1: 6, src2: 7, text: 'SUB R1, R6, R7' },
    ],
  },
  rawChain: {
    label: 'RAW thật: MUL R1 / ADD R2,R1 / SUB R3,R2 (phụ thuộc dây chuyền, KHÔNG thể loại bỏ)',
    instrs: [
      { op: 'MUL', dest: 1, src1: 2, src2: 3, text: 'MUL R1, R2, R3' },
      { op: 'ADD', dest: 2, src1: 1, src2: 5, text: 'ADD R2, R1, R5' },
      { op: 'SUB', dest: 3, src1: 2, src2: 7, text: 'SUB R3, R2, R7' },
    ],
  },
  noConflict: {
    label: 'Không xung đột: MUL R1 / ADD R4 / SUB R5 (độc lập hoàn toàn)',
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
      <thead><tr><th>Lệnh</th><th>Issue</th><th>Exec Start</th><th>Writeback</th><th>Commit</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="tomasulo-stat">Tổng chu kỳ: <strong>${result.totalCycles}</strong> · IPC: <strong>${result.ipc.toFixed(4)}</strong></div>
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
