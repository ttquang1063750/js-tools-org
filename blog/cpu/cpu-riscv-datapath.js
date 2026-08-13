// Lesson 3's RISC-V datapath demo is only "DOM glue": every assemble, decode and
// execute step is delegated to the shared cpu-core.js engine (a single source of
// truth, verified by running `node cpu-core.js`). This file never re-implements
// the bit encoding, so it cannot drift away from the engine.
//
// One file serves both locales, so every visible string goes through STRINGS and
// is picked by <html lang>, which the page itself sets per locale.
import { assembleRV32I, decodeRV32I, executeRV32I } from './cpu-core.js';

const SUPPORTED = 'ADD/SUB/AND/OR/XOR/ADDI/ANDI/ORI/XORI/LW/SW';

const STRINGS = {
  vi: {
    allZero: '(mọi thanh ghi đều = 0)',
    emptyLine: 'Dòng lệnh rỗng',
    badLw: 'Cú pháp LW sai — dùng: LW xd, imm(xs1)',
    badSw: 'Cú pháp SW sai — dùng: SW xs2, imm(xs1)',
    unsupported: (m) => `Mnemonic không hỗ trợ: ${m} (chỉ hỗ trợ ${SUPPORTED})`,
    assembled: (hex) => `Đã dịch (assemble) thành công — mã máy = 0x${hex}. Bấm "Thực thi" để chạy qua datapath.`,
    assembleError: 'Lỗi dịch lệnh: ',
    nothingAssembled: 'Chưa có lệnh nào được dịch — bấm "Dịch (Assemble)" trước.',
    executed: (m) => `Đã thực thi lệnh ${m} qua datapath đơn chu kỳ.`,
    reset: 'Đã reset.',
  },
  en: {
    allZero: '(every register is 0)',
    emptyLine: 'The instruction line is empty',
    badLw: 'Bad LW syntax — use: LW xd, imm(xs1)',
    badSw: 'Bad SW syntax — use: SW xs2, imm(xs1)',
    unsupported: (m) => `Unsupported mnemonic: ${m} (only ${SUPPORTED} are supported)`,
    assembled: (hex) =>
      `Assembled successfully — machine code = 0x${hex}. Press "Execute" to run it through the datapath.`,
    assembleError: 'Assembly error: ',
    nothingAssembled: 'Nothing assembled yet — press "Assemble" first.',
    executed: (m) => `Executed ${m} through the single-cycle datapath.`,
    reset: 'Reset done.',
  },
};
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];

function parseReg(token) {
  return parseInt(token.replace(/^x/i, ''), 10);
}

// Turn one hand-typed assembly line ("ADD x3, x1, x2" or "LW x5, 8(x2)") into
// {mnemonic, args}. A minimal parser — just enough for the 11 mnemonics the
// engine supports, which is exactly the list in SUPPORTED above.
function parseAsmLine(line) {
  const clean = line.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
  if (!clean) throw new Error(T.emptyLine);
  const parts = clean.split(' ');
  const mnemonic = parts[0].toUpperCase();

  if (mnemonic === 'LW') {
    const rd = parseReg(parts[1]);
    const m = parts[2].match(/(-?\d+)\(x(\d+)\)/i);
    if (!m) throw new Error(T.badLw);
    return { mnemonic, args: { rd, rs1: parseInt(m[2], 10), imm: parseInt(m[1], 10) } };
  }
  if (mnemonic === 'SW') {
    const rs2 = parseReg(parts[1]);
    const m = parts[2].match(/(-?\d+)\(x(\d+)\)/i);
    if (!m) throw new Error(T.badSw);
    return { mnemonic, args: { rs2, rs1: parseInt(m[2], 10), imm: parseInt(m[1], 10) } };
  }
  if (['ADD', 'SUB', 'AND', 'OR', 'XOR'].includes(mnemonic)) {
    return { mnemonic, args: { rd: parseReg(parts[1]), rs1: parseReg(parts[2]), rs2: parseReg(parts[3]) } };
  }
  if (['ADDI', 'ANDI', 'ORI', 'XORI'].includes(mnemonic)) {
    return { mnemonic, args: { rd: parseReg(parts[1]), rs1: parseReg(parts[2]), imm: parseInt(parts[3], 10) } };
  }
  throw new Error(T.unsupported(mnemonic));
}

function toBin32(word) {
  return (word >>> 0).toString(2).padStart(32, '0');
}

function initDatapathDemo() {
  const asmInput = document.getElementById('datapath-asm-input');
  const assembleBtn = document.getElementById('datapath-assemble-btn');
  const executeBtn = document.getElementById('datapath-execute-btn');
  const resetBtn = document.getElementById('datapath-reset-btn');
  const bitsDisplay = document.getElementById('datapath-bits');
  const statusDisplay = document.getElementById('datapath-status');
  const regsDisplay = document.getElementById('datapath-regs');
  const blockAlu = document.getElementById('datapath-block-alu');
  const blockMem = document.getElementById('datapath-block-mem');
  const blockRegfile = document.getElementById('datapath-block-regfile');
  if (!asmInput || !assembleBtn) return; // page has no demo -> nothing to wire up

  let regs = new Array(32).fill(0);
  let mem = {};
  let currentWord = null;

  function renderRegs() {
    const nonZero = regs.map((v, i) => (v !== 0 ? `x${i}=${v}` : null)).filter(Boolean);
    regsDisplay.textContent = nonZero.length ? nonZero.join('  ') : T.allZero;
  }

  function highlightBlocks(decoded) {
    [blockAlu, blockMem, blockRegfile].forEach((b) => b && b.classList.remove('active'));
    if (decoded.type === 'R' || decoded.type === 'I') {
      blockAlu && blockAlu.classList.add('active');
      blockRegfile && blockRegfile.classList.add('active');
    } else if (decoded.type === 'ILOAD' || decoded.type === 'S') {
      blockAlu && blockAlu.classList.add('active'); // address = base + offset
      blockMem && blockMem.classList.add('active');
      if (decoded.type === 'ILOAD') blockRegfile && blockRegfile.classList.add('active');
    }
  }

  function renderBits(word, decoded) {
    const bin = toBin32(word);
    let fieldsHtml = '';
    if (decoded.type === 'R') {
      fieldsHtml = `funct7=${bin.slice(0, 7)} rs2=${bin.slice(7, 12)} rs1=${bin.slice(12, 17)} funct3=${bin.slice(17, 20)} rd=${bin.slice(20, 25)} opcode=${bin.slice(25, 32)}`;
    } else if (decoded.type === 'I' || decoded.type === 'ILOAD') {
      fieldsHtml = `imm[11:0]=${bin.slice(0, 12)} rs1=${bin.slice(12, 17)} funct3=${bin.slice(17, 20)} rd=${bin.slice(20, 25)} opcode=${bin.slice(25, 32)}`;
    } else if (decoded.type === 'S') {
      fieldsHtml = `imm[11:5]=${bin.slice(0, 7)} rs2=${bin.slice(7, 12)} rs1=${bin.slice(12, 17)} funct3=${bin.slice(17, 20)} imm[4:0]=${bin.slice(20, 25)} opcode=${bin.slice(25, 32)}`;
    }
    bitsDisplay.innerHTML = `<div>${bin}</div><div style="margin-top:6px;opacity:0.85">${fieldsHtml}</div>`;
  }

  assembleBtn.addEventListener('click', () => {
    try {
      const { mnemonic, args } = parseAsmLine(asmInput.value);
      currentWord = assembleRV32I(mnemonic, args);
      const decoded = decodeRV32I(currentWord);
      renderBits(currentWord, decoded);
      statusDisplay.textContent = T.assembled(currentWord.toString(16));
    } catch (err) {
      currentWord = null;
      statusDisplay.textContent = T.assembleError + err.message;
    }
  });

  executeBtn.addEventListener('click', () => {
    if (currentWord === null) {
      statusDisplay.textContent = T.nothingAssembled;
      return;
    }
    const decoded = executeRV32I(currentWord, regs, mem);
    highlightBlocks(decoded);
    renderRegs();
    statusDisplay.textContent = T.executed(decoded.mnemonic);
  });

  resetBtn.addEventListener('click', () => {
    regs = new Array(32).fill(0);
    mem = {};
    currentWord = null;
    bitsDisplay.innerHTML = '—';
    statusDisplay.textContent = T.reset;
    [blockAlu, blockMem, blockRegfile].forEach((b) => b && b.classList.remove('active'));
    renderRegs();
  });

  renderRegs();
}

document.addEventListener('DOMContentLoaded', initDatapathDemo);
