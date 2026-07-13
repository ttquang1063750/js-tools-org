// Demo Datapath RISC-V của Bài 3 — chỉ là "lớp keo DOM": mọi phép dịch/giải
// mã/thực thi được ủy thác cho engine dùng chung cpu-core.js (một nguồn sự
// thật duy nhất, đã verify bằng `node cpu-core.js`). File này KHÔNG tự lắp
// lại phép mã hoá bit để tránh phân kỳ với engine.
import { assembleRV32I, decodeRV32I, executeRV32I } from './cpu-core.js';

function parseReg(token) {
  return parseInt(token.replace(/^x/i, ''), 10);
}

// Chuyển 1 dòng Assembly gõ tay (vd "ADD x3, x1, x2" hoặc "LW x5, 8(x2)")
// thành {mnemonic, args} — bộ phân tích tối giản, chỉ đủ cho 10 mnemonic mà
// engine hỗ trợ.
function parseAsmLine(line) {
  const clean = line.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
  if (!clean) throw new Error('Dòng lệnh rỗng');
  const parts = clean.split(' ');
  const mnemonic = parts[0].toUpperCase();

  if (mnemonic === 'LW') {
    const rd = parseReg(parts[1]);
    const m = parts[2].match(/(-?\d+)\(x(\d+)\)/i);
    if (!m) throw new Error('Cú pháp LW sai — dùng: LW xd, imm(xs1)');
    return { mnemonic, args: { rd, rs1: parseInt(m[2], 10), imm: parseInt(m[1], 10) } };
  }
  if (mnemonic === 'SW') {
    const rs2 = parseReg(parts[1]);
    const m = parts[2].match(/(-?\d+)\(x(\d+)\)/i);
    if (!m) throw new Error('Cú pháp SW sai — dùng: SW xs2, imm(xs1)');
    return { mnemonic, args: { rs2, rs1: parseInt(m[2], 10), imm: parseInt(m[1], 10) } };
  }
  if (['ADD', 'SUB', 'AND', 'OR', 'XOR'].includes(mnemonic)) {
    return { mnemonic, args: { rd: parseReg(parts[1]), rs1: parseReg(parts[2]), rs2: parseReg(parts[3]) } };
  }
  if (['ADDI', 'ANDI', 'ORI', 'XORI'].includes(mnemonic)) {
    return { mnemonic, args: { rd: parseReg(parts[1]), rs1: parseReg(parts[2]), imm: parseInt(parts[3], 10) } };
  }
  throw new Error('Mnemonic không hỗ trợ: ' + mnemonic + ' (chỉ hỗ trợ ADD/SUB/AND/OR/XOR/ADDI/ANDI/ORI/XORI/LW/SW)');
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
  if (!asmInput || !assembleBtn) return; // trang không có demo -> bỏ qua

  let regs = new Array(32).fill(0);
  let mem = {};
  let currentWord = null;

  function renderRegs() {
    const nonZero = regs.map((v, i) => (v !== 0 ? `x${i}=${v}` : null)).filter(Boolean);
    regsDisplay.textContent = nonZero.length ? nonZero.join('  ') : '(mọi thanh ghi đều = 0)';
  }

  function highlightBlocks(decoded) {
    [blockAlu, blockMem, blockRegfile].forEach((b) => b && b.classList.remove('active'));
    if (decoded.type === 'R' || decoded.type === 'I') {
      blockAlu && blockAlu.classList.add('active');
      blockRegfile && blockRegfile.classList.add('active');
    } else if (decoded.type === 'ILOAD' || decoded.type === 'S') {
      blockAlu && blockAlu.classList.add('active'); // tinh dia chi = base + offset
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
      statusDisplay.textContent = `Đã dịch (assemble) thành công — mã máy = 0x${currentWord.toString(16)}. Bấm "Thực thi" để chạy qua datapath.`;
    } catch (err) {
      currentWord = null;
      statusDisplay.textContent = 'Lỗi dịch lệnh: ' + err.message;
    }
  });

  executeBtn.addEventListener('click', () => {
    if (currentWord === null) {
      statusDisplay.textContent = 'Chưa có lệnh nào được dịch — bấm "Dịch (Assemble)" trước.';
      return;
    }
    const decoded = executeRV32I(currentWord, regs, mem);
    highlightBlocks(decoded);
    renderRegs();
    statusDisplay.textContent = `Đã thực thi lệnh ${decoded.mnemonic} qua datapath đơn chu kỳ.`;
  });

  resetBtn.addEventListener('click', () => {
    regs = new Array(32).fill(0);
    mem = {};
    currentWord = null;
    bitsDisplay.innerHTML = '—';
    statusDisplay.textContent = 'Đã reset.';
    [blockAlu, blockMem, blockRegfile].forEach((b) => b && b.classList.remove('active'));
    renderRegs();
  });

  renderRegs();
}

document.addEventListener('DOMContentLoaded', initDatapathDemo);
