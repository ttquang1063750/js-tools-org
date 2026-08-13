// Lesson 2's Toy CPU demo is only "DOM glue": every fetch-decode-execute step is
// delegated to the shared cpu-core.js engine (a single source of truth, verified
// by running `node cpu-core.js`). This file never re-implements the CPU, so it
// cannot drift away from the engine.
//
// One file serves both locales, so every visible string goes through STRINGS and
// is picked by <html lang>, which the page itself sets per locale.
import { createCpuState, cpuStep } from './cpu-core.js';

const STRINGS = {
  vi: {
    data: '(dữ liệu) ',
    halted: (n) => `Đã dừng sau ${n} chu kỳ fetch-decode-execute.`,
    ready: (n) => `Sẵn sàng — đã chạy ${n} chu kỳ.`,
    afterHalt: ' (đã HALT)',
    error: 'Lỗi: ',
  },
  en: {
    data: '(data) ',
    halted: (n) => `Halted after ${n} fetch-decode-execute cycles.`,
    ready: (n) => `Ready — ${n} cycles run so far.`,
    afterHalt: ' (halted)',
    error: 'Error: ',
  },
};
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];

const PROGRAM = [
  { op: 'LOADI', rd: 0, imm: 5 }, // 0: R0 = counter = 5
  { op: 'LOADI', rd: 1, imm: 0 }, // 1: R1 = sum = 0
  { op: 'LOADI', rd: 2, imm: 0 }, // 2: R2 = 0 (the constant BEQ compares against)
  { op: 'LOADI', rd: 3, imm: 1 }, // 3: R3 = 1 (the constant we subtract)
  { op: 'BEQ', rs1: 0, rs2: 2, addr: 8 }, // 4: counter == 0 -> leave the loop
  { op: 'ADD', rd: 1, rs1: 1, rs2: 0 }, // 5: sum += counter
  { op: 'SUB', rd: 0, rs1: 0, rs2: 3 }, // 6: counter -= 1
  { op: 'JMP', addr: 4 }, // 7: go back and re-test the condition
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
  if (!ramList || !stepBtn) return; // page has no demo -> nothing to wire up

  let state = createCpuState(PROGRAM);
  let stepCount = 0;

  function render() {
    ramList.innerHTML = '';
    state.ram.forEach((instr, addr) => {
      const li = document.createElement('li');
      li.className = 'toycpu-ram-row';
      if (addr === state.pc && !state.halted) li.classList.add('is-current');
      const isInstr = instr && typeof instr === 'object' && typeof instr.op === 'string';
      li.textContent = `${addr}: ${isInstr ? formatInstr(instr) : T.data + instr}`;
      ramList.appendChild(li);
    });
    regsDisplay.textContent = state.regs.map((v, i) => `R${i}=${v}`).join('  ');
    irDisplay.textContent = state.ir ? formatInstr(state.ir) : '—';
    pcDisplay.textContent = state.halted ? state.pc + T.afterHalt : String(state.pc);
    statusDisplay.textContent = state.halted ? T.halted(stepCount) : T.ready(stepCount);
  }

  stepBtn.addEventListener('click', () => {
    if (state.halted) return;
    try {
      cpuStep(state);
      stepCount++;
    } catch (err) {
      statusDisplay.textContent = T.error + err.message;
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
      statusDisplay.textContent = T.error + err.message;
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
