// Demo Toy CPU của Bài 2 — chỉ là "lớp keo DOM": mọi bước fetch-decode-execute
// được ủy thác cho engine dùng chung cpu-core.js (một nguồn sự thật duy nhất,
// đã verify bằng `node cpu-core.js`). File này KHÔNG tự chạy lại CPU để tránh
// phân kỳ với engine.
import { createCpuState, cpuStep } from './cpu-core.js';

const PROGRAM = [
  { op: 'LOADI', rd: 0, imm: 5 }, // 0: R0 = counter = 5
  { op: 'LOADI', rd: 1, imm: 0 }, // 1: R1 = sum = 0
  { op: 'LOADI', rd: 2, imm: 0 }, // 2: R2 = 0 (hằng số điều kiện dừng)
  { op: 'LOADI', rd: 3, imm: 1 }, // 3: R3 = 1 (hằng số trừ)
  { op: 'BEQ', rs1: 0, rs2: 2, addr: 8 }, // 4: counter==0 -> thoát vòng lặp
  { op: 'ADD', rd: 1, rs1: 1, rs2: 0 }, // 5: sum += counter
  { op: 'SUB', rd: 0, rs1: 0, rs2: 3 }, // 6: counter -= 1
  { op: 'JMP', addr: 4 }, // 7: quay lại kiểm tra điều kiện
  { op: 'HALT' }, // 8
];

function formatInstr(instr) {
  switch (instr.op) {
    case 'LOADI':
      return `LOADI R${instr.rd}, ${instr.imm}`;
    case 'ADD':
      return `ADD R${instr.rd}, R${instr.rs1}, R${instr.rs2}`;
    case 'SUB':
      return `SUB R${instr.rd}, R${instr.rs1}, R${instr.rs2}`;
    case 'STORE':
      return `STORE R${instr.rs}, [${instr.addr}]`;
    case 'LOAD':
      return `LOAD R${instr.rd}, [${instr.addr}]`;
    case 'JMP':
      return `JMP ${instr.addr}`;
    case 'BEQ':
      return `BEQ R${instr.rs1}, R${instr.rs2}, ${instr.addr}`;
    case 'HALT':
      return 'HALT';
    default:
      return '???';
  }
}

function initToyCpuDemo() {
  const ramList = document.getElementById('toycpu-ram');
  const regsDisplay = document.getElementById('toycpu-regs');
  const irDisplay = document.getElementById('toycpu-ir');
  const pcDisplay = document.getElementById('toycpu-pc');
  const stepBtn = document.getElementById('toycpu-step-btn');
  const runBtn = document.getElementById('toycpu-run-btn');
  const resetBtn = document.getElementById('toycpu-reset-btn');
  const statusDisplay = document.getElementById('toycpu-status');
  if (!ramList || !stepBtn) return; // trang không có demo -> bỏ qua

  let state = createCpuState(PROGRAM);
  let stepCount = 0;

  function render() {
    ramList.innerHTML = '';
    state.ram.forEach((instr, addr) => {
      const li = document.createElement('li');
      li.className = 'toycpu-ram-row';
      if (addr === state.pc && !state.halted) li.classList.add('is-current');
      const isInstr = instr && typeof instr === 'object' && typeof instr.op === 'string';
      li.textContent = `${addr}: ${isInstr ? formatInstr(instr) : '(dữ liệu) ' + instr}`;
      ramList.appendChild(li);
    });
    regsDisplay.textContent = state.regs.map((v, i) => `R${i}=${v}`).join('  ');
    irDisplay.textContent = state.ir ? formatInstr(state.ir) : '—';
    pcDisplay.textContent = state.halted ? state.pc + ' (đã HALT)' : String(state.pc);
    statusDisplay.textContent = state.halted
      ? `Đã dừng sau ${stepCount} chu kỳ fetch-decode-execute.`
      : `Sẵn sàng — đã chạy ${stepCount} chu kỳ.`;
  }

  stepBtn.addEventListener('click', () => {
    if (state.halted) return;
    try {
      cpuStep(state);
      stepCount++;
    } catch (err) {
      statusDisplay.textContent = 'Lỗi: ' + err.message;
    }
    render();
  });

  runBtn.addEventListener('click', () => {
    let guard = 0;
    try {
      while (!state.halted && guard < 100) {
        cpuStep(state);
        stepCount++;
        guard++;
      }
    } catch (err) {
      statusDisplay.textContent = 'Lỗi: ' + err.message;
    }
    render();
  });

  resetBtn.addEventListener('click', () => {
    state = createCpuState(PROGRAM);
    stepCount = 0;
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', initToyCpuDemo);
