// cpu-core.js — "CPUJS": thư viện kiến trúc máy tính tối giản, tự viết hoàn
// toàn, xây dần qua từng bài của Series 15 (Kiến Trúc Máy Tính: Từ Logic Đến
// Lượng Tử). Cùng kỷ luật "verify bằng số thật trước khi viết bài học" như
// dsp-core.js (Series 14), vmcu.js (Series 13) và ai-neuro.js (Series 12) —
// mọi hàm dưới đây đều có self-test ở cuối file, chạy bằng `node cpu-core.js`.
//
// Nguyên tắc: MỌI con số xuất hiện trong bài học (kết quả ALU, cờ trạng thái,
// độ trễ pipeline, AMAT, xác suất lượng tử...) phải được sinh ra và kiểm chứng
// bởi engine này TRƯỚC, rồi mới chép vào prose/quiz — không bịa số bằng tay.
//
// Bài 1 — Cổng logic đến ALU. Build-out: half/full adder, ripple-carry adder,
// ALU 4-bit (ADD/SUB/AND/OR/XOR) + 4 cờ trạng thái Zero/Sign/Carry/Overflow.

// ---------------------------------------------------------------------------
// Tiện ích biểu diễn số nhị phân N-bit (mặc định 4-bit cho demo Bài 1).
// ---------------------------------------------------------------------------

// Chuỗi nhị phân N-bit của một giá trị (lấy đúng N bit thấp) — vd
// toBinString(5, 4) === "0101".
function toBinString(value, bits = 4) {
  return (value & ((1 << bits) - 1)).toString(2).padStart(bits, '0');
}

// Diễn giải N-bit theo số bù 2 (two's complement): bit cao nhất là bit dấu.
// vd toSigned(0b1001, 4) === -7 (không phải 9).
function toSigned(value, bits = 4) {
  const half = 1 << (bits - 1);
  const masked = value & ((1 << bits) - 1);
  return masked >= half ? masked - (1 << bits) : masked;
}

// ---------------------------------------------------------------------------
// Cổng cộng — viên gạch số học của mọi CPU (Bài 1 Mục 2).
// ---------------------------------------------------------------------------

// Mạch cộng bán phần: 2 bit vào, cho tổng (XOR) và bit nhớ (AND). KHÔNG có
// carry-in nên không ghép chuỗi được — chỉ dùng cho bit thấp nhất.
function halfAdder(a, b) {
  return { sum: a ^ b, carry: a & b };
}

// Mạch cộng toàn phần: 3 bit vào (a, b, carry-in), cho tổng và carry-out.
// Ghép nối tiếp N bộ này thành bộ cộng N-bit (ripple carry).
function fullAdder(a, b, cin) {
  const sum = a ^ b ^ cin;
  const cout = (a & b) | (cin & (a ^ b));
  return { sum, cout };
}

// Bộ cộng ripple-carry N-bit: ghép N full adder, bit nhớ truyền từ thấp lên
// cao. Trả về kết quả N-bit (đã cắt) và carry-out cuối cùng (tràn không dấu).
function rippleCarryAdd(a, b, cin = 0, bits = 4) {
  let carry = cin;
  let result = 0;
  for (let i = 0; i < bits; i++) {
    const ai = (a >> i) & 1;
    const bi = (b >> i) & 1;
    const { sum, cout } = fullAdder(ai, bi, carry);
    result |= sum << i;
    carry = cout;
  }
  return { result, cout: carry };
}

// ---------------------------------------------------------------------------
// ALU N-bit (Bài 1 Mục 3) — nhận 2 toán hạng + mã phép toán, trả kết quả và 4
// cờ trạng thái. Đây là khối "ra quyết định" mà mọi lệnh rẽ nhánh dựa vào.
// ---------------------------------------------------------------------------

const ALU_OPS = ['ADD', 'SUB', 'AND', 'OR', 'XOR'];

// Thực thi một phép ALU trên số N-bit (mặc định 4-bit). Cờ:
//   Z (Zero)     : kết quả = 0.
//   S (Sign)     : bit cao nhất của kết quả = 1 (âm trong hệ bù 2).
//   C (Carry)    : tràn KHÔNG dấu — ADD sinh carry-out, SUB sinh mượn (borrow).
//   V (Overflow) : tràn CÓ dấu (bù 2) — kết quả sai dấu lý thuyết.
// Với AND/OR/XOR (phép luận lý) thì C và V luôn = false.
function aluExecute(a, b, op, bits = 4) {
  // Luu y: "1 << 32" trong JS KHONG cho 2^32 - toan tu dich bit chi dung 32-bit
  // va so bit dich duoc lay MOD 32, nen "1 << 32" === "1 << 0" === 1 (bug that
  // neu viet mask = (1<<bits)-1 truc tiep cho bits=32). Tach truong hop bits=32.
  const mask = bits >= 32 ? 0xffffffff : (1 << bits) - 1;
  const signBit = bits >= 32 ? 0x80000000 : 1 << (bits - 1);
  const aM = a & mask;
  const bM = b & mask;
  let result = 0;
  let carry = false;
  let overflow = false;

  if (op === 'ADD') {
    const rc = rippleCarryAdd(aM, bM, 0, bits);
    result = rc.result;
    carry = rc.cout === 1; // carry-out = tràn không dấu
    const sA = aM & signBit;
    const sB = bM & signBit;
    const sR = result & signBit;
    overflow = sA === sB && sA !== sR; // cùng dấu vào, khác dấu ra
  } else if (op === 'SUB') {
    // A - B = A + (~B + 1) trong hệ bù 2.
    const negB = (~bM + 1) & mask;
    const rc = rippleCarryAdd(aM, negB, 0, bits);
    result = rc.result;
    carry = aM < bM; // mượn: A nhỏ hơn B (theo không dấu)
    const sA = aM & signBit;
    const sB = bM & signBit;
    const sR = result & signBit;
    overflow = sA !== sB && sA !== sR; // khác dấu vào, kết quả khác dấu A
  } else if (op === 'AND') {
    result = aM & bM;
  } else if (op === 'OR') {
    result = aM | bM;
  } else if (op === 'XOR') {
    result = aM ^ bM;
  } else {
    throw new Error('ALU op khong hop le: ' + op);
  }

  return {
    result,
    flags: {
      z: result === 0,
      s: (result & signBit) !== 0,
      c: carry,
      v: overflow,
    },
  };
}

// ---------------------------------------------------------------------------
// Bài 2 — Kiến trúc Von Neumann & Tập lệnh ISA. Toy CPU: chu kỳ Fetch-Decode-
// Execute chạy trên MỘT bộ nhớ RAM chung (`ram`) chứa CẢ lệnh lẫn dữ liệu —
// đúng tinh thần Von Neumann Mục 2.1 (đối lập Harvard là 2 bus/2 bộ nhớ tách
// biệt). ALU (Bài 1) được TÁI DÙNG trực tiếp cho ADD/SUB, không viết lại.
// ---------------------------------------------------------------------------

// Khởi tạo trạng thái CPU: RAM là bản sao của `program` (mảng lệnh — địa chỉ
// thấp), 4 thanh ghi đa dụng R0-R3, thanh ghi đếm chương trình PC (Program
// Counter) và thanh ghi lệnh IR (Instruction Register — lệnh vừa fetch).
function createCpuState(program) {
  return { ram: [...program], regs: [0, 0, 0, 0], pc: 0, ir: null, halted: false, flags: null };
}

// Chạy ĐÚNG một chu kỳ Fetch-Decode-Execute (Mục 2.2):
//   FETCH   : đọc lệnh tại RAM[PC] vào IR.
//   (PC tăng lên 1 NGAY SAU fetch — TRƯỚC KHI lệnh được decode/execute; đây
//    chính là pitfall Mục 2.2: với lệnh JMP/BEQ, PC vừa tăng bị GHI ĐÈ ở
//    bước execute, nếu quên thứ tự này sẽ tính sai địa chỉ đích nhảy.)
//   DECODE  : switch theo `op` để biết cần thanh ghi/địa chỉ nào.
//   EXECUTE : cập nhật thanh ghi/RAM/PC tương ứng.
function cpuStep(state) {
  const instr = state.ram[state.pc];
  if (!instr || typeof instr.op !== 'string') {
    throw new Error('Lenh khong hop le: ' + (instr && instr.op));
  }
  state.ir = instr;
  state.pc = state.pc + 1;
  switch (instr.op) {
    case 'LOADI':
      state.regs[instr.rd] = instr.imm;
      break;
    case 'ADD': {
      const r = aluExecute(state.regs[instr.rs1], state.regs[instr.rs2], 'ADD', 8);
      state.regs[instr.rd] = r.result;
      state.flags = r.flags;
      break;
    }
    case 'SUB': {
      const r = aluExecute(state.regs[instr.rs1], state.regs[instr.rs2], 'SUB', 8);
      state.regs[instr.rd] = r.result;
      state.flags = r.flags;
      break;
    }
    case 'STORE':
      state.ram[instr.addr] = state.regs[instr.rs];
      break;
    case 'LOAD':
      state.regs[instr.rd] = state.ram[instr.addr];
      break;
    case 'JMP':
      state.pc = instr.addr; // GHI ĐÈ PC vừa tăng ở bước fetch — nhảy TUYỆT ĐỐI
      break;
    case 'BEQ':
      if (state.regs[instr.rs1] === state.regs[instr.rs2]) state.pc = instr.addr;
      break;
    case 'HALT':
      state.halted = true;
      break;
    default:
      throw new Error('Lenh khong hop le: ' + instr.op);
  }
  return state;
}

// Chạy trọn 1 chương trình tới khi HALT (hoặc chạm maxSteps — chống vòng lặp
// vô hạn khi chương trình lỗi). Trả về trạng thái cuối + số chu kỳ đã chạy.
function runProgram(program, maxSteps = 1000) {
  const state = createCpuState(program);
  let steps = 0;
  while (!state.halted && steps < maxSteps) {
    cpuStep(state);
    steps++;
  }
  return { state, steps };
}

// ---------------------------------------------------------------------------
// Bài 3 — Hợp ngữ RISC-V (RV32I) & Đường đi dữ liệu đơn chu kỳ. Toy CPU của
// Bài 2 dùng tập lệnh MINI tự bịa (object {op,...}) — bài này thay bằng tập
// lệnh THẬT (RV32I), mã hoá đúng chuẩn thành số 32-bit, y hệt mọi chip RISC-V
// thật ngoài đời (Mục 3.1-3.2). Bộ thực thi (Mục 3.3) TÁI DÙNG trực tiếp
// aluExecute() của Bài 1 cho mọi phép ADD/SUB/AND/OR/XOR.
// ---------------------------------------------------------------------------

// 4 opcode 7-bit chuẩn RV32I dùng trong bài (giá trị THẬT theo đặc tả RISC-V,
// không phải tự đặt): R-type (ADD/SUB/AND/OR/XOR), I-type ALU (ADDI/ANDI/
// ORI/XORI), I-type LOAD (LW), S-type (SW).
const RV32I_OPCODE = { R: 0b0110011, I_ALU: 0b0010011, I_LOAD: 0b0000011, S: 0b0100011 };

// Bảng tra mnemonic -> {type, funct3, funct7} — funct3/funct7 là "mã phụ"
// phân biệt các lệnh CÙNG opcode (vd ADD và SUB cùng opcode R nhưng khác
// funct7: 0000000 vs 0100000 — bit thứ 30 của funct7 chính là "cờ trừ").
const RV32I_MNEMONIC = {
  ADD: { type: 'R', funct3: 0b000, funct7: 0b0000000 },
  SUB: { type: 'R', funct3: 0b000, funct7: 0b0100000 },
  AND: { type: 'R', funct3: 0b111, funct7: 0b0000000 },
  OR: { type: 'R', funct3: 0b110, funct7: 0b0000000 },
  XOR: { type: 'R', funct3: 0b100, funct7: 0b0000000 },
  ADDI: { type: 'I', funct3: 0b000 },
  ANDI: { type: 'I', funct3: 0b111 },
  ORI: { type: 'I', funct3: 0b110 },
  XORI: { type: 'I', funct3: 0b100 },
  LW: { type: 'ILOAD', funct3: 0b010 },
  SW: { type: 'S', funct3: 0b010 },
};

// Mnemonic ALU tương ứng gọi vào aluExecute() (Bài 1) — ADDI/ANDI/ORI/XORI chỉ
// là ADD/AND/OR/XOR với toán hạng thứ 2 là HẰNG SỐ (immediate) thay vì thanh ghi.
const RV32I_ALU_OP = {
  ADD: 'ADD',
  SUB: 'SUB',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  ADDI: 'ADD',
  ANDI: 'AND',
  ORI: 'OR',
  XORI: 'XOR',
};

// Dịch (assemble) MỘT lệnh Assembly sang số máy 32-bit (Mục 3.2). `args` tuỳ
// theo dạng: R-type {rd,rs1,rs2}; I-type ALU {rd,rs1,imm}; LW {rd,rs1,imm}
// (rs1=thanh ghi gốc, imm=độ lệch); SW {rs1,rs2,imm} (rs1=gốc, rs2=thanh ghi
// nguồn cần lưu — đúng cú pháp thật `sw rs2, imm(rs1)`).
function assembleRV32I(mnemonic, args) {
  const info = RV32I_MNEMONIC[mnemonic];
  if (!info) throw new Error('Mnemonic RV32I khong ho tro: ' + mnemonic);
  if (info.type === 'R') {
    return (
      (((info.funct7 & 0x7f) << 25) |
        ((args.rs2 & 0x1f) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        ((args.rd & 0x1f) << 7) |
        RV32I_OPCODE.R) >>>
      0
    );
  }
  if (info.type === 'I') {
    return (
      (((args.imm & 0xfff) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        ((args.rd & 0x1f) << 7) |
        RV32I_OPCODE.I_ALU) >>>
      0
    );
  }
  if (info.type === 'ILOAD') {
    return (
      (((args.imm & 0xfff) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        ((args.rd & 0x1f) << 7) |
        RV32I_OPCODE.I_LOAD) >>>
      0
    );
  }
  if (info.type === 'S') {
    const imm11_5 = (args.imm >> 5) & 0x7f;
    const imm4_0 = args.imm & 0x1f;
    return (
      ((imm11_5 << 25) |
        ((args.rs2 & 0x1f) << 20) |
        ((args.rs1 & 0x1f) << 15) |
        ((info.funct3 & 0x7) << 12) |
        (imm4_0 << 7) |
        RV32I_OPCODE.S) >>>
      0
    );
  }
  throw new Error('Dang lenh khong ho tro: ' + info.type);
}

// Giải mã (decode) một số máy 32-bit ngược lại thành mnemonic + toán hạng
// (Mục 3.2, chiều ngược của assembleRV32I — "khứ hồi": assemble rồi decode
// phải cho lại ĐÚNG input ban đầu).
function decodeRV32I(word) {
  const opcode = word & 0x7f;
  const rd = (word >>> 7) & 0x1f;
  const funct3 = (word >>> 12) & 0x7;
  const rs1 = (word >>> 15) & 0x1f;
  const rs2 = (word >>> 20) & 0x1f;
  const funct7 = (word >>> 25) & 0x7f;

  if (opcode === RV32I_OPCODE.R) {
    const mnemonic = Object.keys(RV32I_MNEMONIC).find(
      (m) =>
        RV32I_MNEMONIC[m].type === 'R' && RV32I_MNEMONIC[m].funct3 === funct3 && RV32I_MNEMONIC[m].funct7 === funct7
    );
    return { mnemonic, type: 'R', rd, rs1, rs2 };
  }
  if (opcode === RV32I_OPCODE.I_ALU) {
    const mnemonic = Object.keys(RV32I_MNEMONIC).find(
      (m) => RV32I_MNEMONIC[m].type === 'I' && RV32I_MNEMONIC[m].funct3 === funct3
    );
    return { mnemonic, type: 'I', rd, rs1, imm: word >> 20 };
  }
  if (opcode === RV32I_OPCODE.I_LOAD) {
    return { mnemonic: 'LW', type: 'ILOAD', rd, rs1, imm: word >> 20 };
  }
  if (opcode === RV32I_OPCODE.S) {
    let imm = ((word >> 25) << 5) | ((word >>> 7) & 0x1f);
    if (imm & 0x800) imm |= 0xfffff000; // mo rong dau (sign-extend) 12-bit
    return { mnemonic: 'SW', type: 'S', rs1, rs2, imm };
  }
  throw new Error('Opcode khong hop le: 0x' + opcode.toString(16));
}

// Bộ thực thi đơn chu kỳ (Mục 3.3): decode MỘT lệnh 32-bit rồi thực thi ngay
// trong CÙNG một chu kỳ xung nhịp — TÁI DÙNG aluExecute() của Bài 1 cho mọi
// phép ADD/SUB/AND/OR/XOR (kể cả dạng immediate). x0 LUÔN đọc là 0 (thanh ghi
// cứng, mọi lệnh ghi vào x0 đều bị bỏ qua — quy ước RISC-V thật).
function executeRV32I(word, regs, mem) {
  const d = decodeRV32I(word);
  if (d.type === 'R') {
    const r = aluExecute(regs[d.rs1], regs[d.rs2], RV32I_ALU_OP[d.mnemonic], 32);
    if (d.rd !== 0) regs[d.rd] = r.result;
  } else if (d.type === 'I') {
    const r = aluExecute(regs[d.rs1], d.imm, RV32I_ALU_OP[d.mnemonic], 32);
    if (d.rd !== 0) regs[d.rd] = r.result;
  } else if (d.type === 'ILOAD') {
    if (d.rd !== 0) regs[d.rd] = mem[regs[d.rs1] + d.imm] || 0;
  } else if (d.type === 'S') {
    mem[regs[d.rs1] + d.imm] = regs[d.rs2];
  }
  regs[0] = 0;
  return d;
}

// Chạy trọn một chương trình RV32I THẲNG (chưa có lệnh nhảy — datapath đơn
// chu kỳ Mục 3.3 chỉ xử lý luồng tuần tự) trên 32 thanh ghi x0-x31 + bộ nhớ
// dữ liệu dạng object thưa (địa chỉ -> giá trị).
function runRV32IProgram(words) {
  const regs = new Array(32).fill(0);
  const mem = {};
  const trace = [];
  for (const word of words) trace.push(executeRV32I(word, regs, mem));
  return { regs, mem, trace };
}

// ---------------------------------------------------------------------------
// Bài 4 — Pipeline CPU & Xung đột dữ liệu (Data Hazards). Datapath đơn chu kỳ
// của Bài 3 ép MỌI lệnh chạy trong 1 chu kỳ dài bằng lệnh CHẬM NHẤT (LW) —
// pipeline 5 giai đoạn (IF-ID-EX-MEM-WB) sửa điều này bằng cách CHỒNG LẤP
// nhiều lệnh, đổi lại phải xử lý xung đột dữ liệu giữa các lệnh đang chồng
// lấp (Mục 4.3). Build-out: công thức thời gian/CPI (Mục 4.2) + bộ phát hiện
// hazard RAW/load-use TÁI DÙNG decodeRV32I() của Bài 3 (Mục 4.3-4.4).
// ---------------------------------------------------------------------------

// Thời gian chạy $N$ lệnh trên pipeline $S$ giai đoạn, có $stallCycles$ chu kỳ
// "bong bóng" (bubble) chèn thêm do hazard (Mục 4.2):
// $T = (N + S - 1 + \text{stallCycles}) \times t_{clk}$ — số hạng $(S-1)$ là
// độ trễ "làm đầy" pipeline lúc khởi động (những lệnh đầu tiên chưa kịp
// chồng lấp hết các giai đoạn).
function pipelineTime(numInstructions, numStages, stallCycles, clockPeriodNs) {
  return (numInstructions + numStages - 1 + stallCycles) * clockPeriodNs;
}

// CPI (Cycles Per Instruction) hiệu dụng khi có stall: pipeline lý tưởng
// (không stall) có CPI = 1 (đúng NGHĨA của pipeline — thông lượng 1 lệnh/chu
// kỳ ở trạng thái ổn định); mỗi stall cộng thêm ĐÚNG 1 chu kỳ "lãng phí"
// không hoàn thành lệnh nào, nên CPI = (N + stallCycles) / N.
function pipelineCPI(numInstructions, stallCycles) {
  return (numInstructions + stallCycles) / numInstructions;
}

// Phát hiện xung đột dữ liệu RAW (Read-After-Write) giữa các lệnh LIỀN KỀ
// trong 1 dãy đã decode (tái dùng decodeRV32I() của Bài 3) — đúng khoảng cách
// mà pipeline 5 giai đoạn CHỒNG LẤP (lệnh sau bắt đầu ID ngay khi lệnh trước
// đang ở EX). Trả về tổng số stall cần chèn + danh sách từng hazard:
//   - RAW thường (ALU→ALU): forwarding (chuyển thẳng kết quả EX sang EX kế
//     tiếp) giải quyết HOÀN TOÀN, 0 stall; KHÔNG forwarding cần đúng 2 stall
//     (chờ tới khi WB xong mới đọc được thanh ghi).
//   - Load-use (LW→dùng ngay): dữ liệu LW chỉ sẵn sàng ở giai đoạn MEM (chậm
//     hơn ALU 1 giai đoạn) — forwarding vẫn KHÔNG kịp, luôn cần ĐÚNG 1 stall
//     dù bật hay tắt forwarding (Mục 4.3, pitfall chính của bài).
function detectHazards(instrs, forwardingEnabled) {
  let totalStalls = 0;
  const hazards = [];
  for (let i = 1; i < instrs.length; i++) {
    const prev = instrs[i - 1];
    const curr = instrs[i];
    const prevWritesReg = (prev.type === 'R' || prev.type === 'I' || prev.type === 'ILOAD') && prev.rd !== 0;
    if (!prevWritesReg) continue;
    const readsRs1 = curr.rs1 !== undefined && curr.rs1 === prev.rd;
    const readsRs2 = curr.rs2 !== undefined && curr.rs2 === prev.rd;
    if (!readsRs1 && !readsRs2) continue;
    if (prev.type === 'ILOAD') {
      totalStalls += 1;
      hazards.push({ index: i, type: 'LOAD_USE', stalls: 1 });
    } else if (!forwardingEnabled) {
      totalStalls += 2;
      hazards.push({ index: i, type: 'RAW', stalls: 2 });
    } else {
      hazards.push({ index: i, type: 'RAW', stalls: 0 });
    }
  }
  return { totalStalls, hazards };
}

// ---------------------------------------------------------------------------
// Bài 5 — Dự đoán nhánh (Branch Prediction) & Spectre. Pipeline của Bài 4 nạp
// lệnh TIẾP THEO trước khi biết lệnh rẽ nhánh (BEQ/BNE) đi hướng nào — CPU
// phải ĐOÁN (Mục 5.1). Build-out: bộ dự đoán 1-bit (Mục 5.2, minh hoạ pitfall
// dao động ở vòng lặp lồng nhau) và 2-bit bão hoà (saturating counter FSM +
// BHT — Branch History Table) chính xác hơn hẳn, cùng công thức CPI hiệu dụng
// (Mục 5.3).
// ---------------------------------------------------------------------------

// Bộ dự đoán nhánh 1-bit: chỉ nhớ kết quả LẦN GẦN NHẤT, đoán y hệt lần đó.
// State: 0 = đoán Không-nhảy (N), 1 = đoán Nhảy (T). Pitfall Mục 5.2: ở vòng
// lặp lồng nhau (vd 4 lần T rồi 1 lần N lặp lại), bộ nhớ 1-bit "quên" ngay
// sau lần N đầu tiên -> đoán sai NGAY lần T kế tiếp -> 2 lần đoán sai liên
// tiếp mỗi vòng lặp ngoài (thoát vòng trong + quay lại vòng trong).
function makeBranchPredictor1Bit() {
  let state = 0; // khoi tao: doan Khong-nhay
  return {
    predict() {
      return state === 1 ? 'T' : 'N';
    },
    update(actual) {
      state = actual === 'T' ? 1 : 0;
    },
    getState() {
      return state;
    },
  };
}

// Bộ dự đoán nhánh 2-bit bão hoà (saturating counter FSM, Mục 5.2): 4 trạng
// thái 0=Rất-không-nhảy(SNT) 1=Hơi-không-nhảy(WNT) 2=Hơi-nhảy(WT)
// 3=Rất-nhảy(ST). Đoán "Nhảy" khi state>=2. Khác 1-bit: một lần đoán sai đơn
// lẻ (T xen giữa chuỗi N, hoặc ngược lại) chỉ đẩy state qua MỘT nấc bão hoà
// liền kề chứ KHÔNG lật ngay dự đoán — chống dao động ở vòng lặp lồng nhau.
function makeBranchPredictor2Bit() {
  let state = 0; // khoi tao: Rat-khong-nhay
  return {
    predict() {
      return state >= 2 ? 'T' : 'N';
    },
    update(actual) {
      state = actual === 'T' ? Math.min(3, state + 1) : Math.max(0, state - 1);
    },
    getState() {
      return state;
    },
  };
}

// Bảng lịch sử nhánh BHT (Branch History Table, Mục 5.2): mỗi ĐỊA CHỈ lệnh
// rẽ nhánh có một bộ dự đoán 2-bit RIÊNG (lập chỉ mục theo `pc`), vì các
// nhánh khác nhau trong cùng chương trình có xu hướng khác nhau hoàn toàn —
// gộp chung một bộ dự đoán duy nhất sẽ trộn lẫn lịch sử của các nhánh không
// liên quan.
function makeBranchHistoryTable() {
  const table = new Map();
  function entryFor(pc) {
    let e = table.get(pc);
    if (!e) {
      e = makeBranchPredictor2Bit();
      table.set(pc, e);
    }
    return e;
  }
  return {
    predict(pc) {
      return entryFor(pc).predict();
    },
    update(pc, actual) {
      entryFor(pc).update(actual);
    },
    size() {
      return table.size;
    },
  };
}

// Chạy MỘT bộ dự đoán qua chuỗi kết quả nhánh thực tế `seq` (mảng 'T'/'N'),
// trả về số lần đoán đúng/tổng/tỷ lệ + vết chạy chi tiết từng bước (dùng cho
// demo trực quan hoá).
function runPredictor(predictor, seq) {
  let correct = 0;
  const trace = [];
  for (const actual of seq) {
    const predicted = predictor.predict();
    const hit = predicted === actual;
    if (hit) correct++;
    trace.push({ predicted, actual, hit });
    predictor.update(actual);
  }
  return { correct, total: seq.length, rate: seq.length === 0 ? 0 : correct / seq.length, trace };
}

// CPI hiệu dụng (Mục 5.3) khi có xung đột điều khiển:
// $CPI_{eff} = CPI_{ideal} + \text{BranchFreq} \times \text{MispredictRate} \times \text{PenaltyCycles}$
// — mỗi lần đoán sai buộc pipeline phải XẢ (flush) các lệnh đã nạp nhầm và
// nạp lại đúng hướng, tốn `penaltyCycles` chu kỳ lãng phí; tần suất xảy ra
// điều này là (tỷ lệ lệnh rẽ nhánh) × (tỷ lệ đoán sai của chính bộ dự đoán).
function effectiveCPI(cpiIdeal, branchFrequency, mispredictionRate, penaltyCycles) {
  return cpiIdeal + branchFrequency * mispredictionRate * penaltyCycles;
}

// ---------------------------------------------------------------------------
// Bài 6 — Song song cấp lệnh (ILP) & Thực thi ngoài thứ tự (Out-of-Order,
// Tomasulo). Pipeline vô hướng (Bài 4-5) phát đúng 1 lệnh/chu kỳ theo ĐÚNG
// thứ tự chương trình — CPU superscalar hiện đại phát NHIỀU lệnh, và cho
// phép lệnh SAU chạy xong TRƯỚC lệnh trước nếu không phụ thuộc dữ liệu THẬT
// (Mục 6.1). Cái giá: xuất hiện phụ thuộc dữ liệu GIẢ (WAR/WAW) do số thanh
// ghi kiến trúc hữu hạn bị tái sử dụng — giải quyết bằng ĐỔI TÊN THANH GHI
// (register renaming, Mục 6.2) trong thuật toán Tomasulo (Mục 6.3): trạm đặt
// chỗ (Reservation Station) + bus dữ liệu chung (CDB) + bộ đệm sắp xếp lại
// (ROB) cam kết kết quả ĐÚNG thứ tự chương trình dù thực thi ngoài thứ tự.
// ---------------------------------------------------------------------------

// Mô phỏng CHU KỲ-CHÍNH-XÁC thuật toán Tomasulo trên một đoạn chương trình
// ngắn (mảng {op:'ADD'|'SUB'|'MUL', dest, src1, src2} — chỉ số thanh ghi).
// Mỗi chu kỳ thực hiện đúng thứ tự sau (mô phỏng đúng ràng buộc phần cứng):
//   1. COMMIT   : đầu ROB (in-order) nếu đã sẵn kết quả -> ghi vào regFile.
//   2. WRITE-RESULT (CDB): CHỈ 1 broadcast/chu kỳ (bus dùng chung là tài
//      nguyên hữu hạn) — nếu nhiều RS xong cùng lúc, RS có robIndex NHỎ HƠN
//      (lệnh CŨ hơn trong chương trình) được ưu tiên; RS thua phải đợi thêm.
//   3. Giảm `remaining` của các RS đang thực thi.
//   4. Chuyển RS từ WAITING sang EXECUTING nếu cả 2 toán hạng đã sẵn sàng.
//   5. ISSUE 1 lệnh mới (nếu còn RS + ROB trống): tra RAT (Register Alias
//      Table) để lấy giá trị toán hạng NGAY (nếu đã có trong regFile) hoặc
//      gắn thẻ ROB cần đợi — rồi ĐỔI TÊN đích (RAT[dest] = robIndex MỚI),
//      đây chính là bước loại bỏ WAR/WAW: lệnh sau ghi vào "phiên bản mới"
//      của thanh ghi, không đụng tới phiên bản CŨ mà lệnh trước đang dùng.
function runTomasulo(instructions, opts = {}) {
  const {
    numAddRS = 3,
    numMulRS = 2,
    addLatency = 2,
    mulLatency = 4,
    numRegs = 8,
    initialRegs = new Array(numRegs).fill(0),
  } = opts;

  const regFile = [...initialRegs];
  const RAT = new Array(numRegs).fill(null); // null = gia tri dung trong regFile; nguoc lai = chi so ROB se san xuat gia tri
  const n = instructions.length;
  const ROB = new Array(n)
    .fill(null)
    .map(() => ({ busy: false, dest: null, value: null, ready: false, instrIdx: null }));
  let robHead = 0;
  let robCount = 0;

  function makeRS(kind) {
    return {
      kind,
      busy: false,
      op: null,
      Vj: null,
      Vk: null,
      Qj: null,
      Qk: null,
      robIndex: null,
      state: null,
      remaining: 0,
    };
  }
  const addRS = new Array(numAddRS).fill(null).map(() => makeRS('ADD'));
  const mulRS = new Array(numMulRS).fill(null).map(() => makeRS('MUL'));
  const allRS = [...addRS, ...mulRS];

  const trace = instructions.map(() => ({ issue: null, execStart: null, writeback: null, commit: null }));
  let nextIssue = 0;
  let cycle = 0;
  let committed = 0;

  function computeVal(op, a, b) {
    if (op === 'ADD') return a + b;
    if (op === 'SUB') return a - b;
    if (op === 'MUL') return a * b;
    throw new Error('Toan tu Tomasulo khong hop le: ' + op);
  }

  while (committed < n) {
    cycle++;
    if (cycle > 10000) throw new Error('Mo phong Tomasulo chay qua lau - co the bi treo');

    // 1. Commit (dung thu tu chuong trinh - lay tu DAU ROB)
    if (robCount > 0) {
      const head = ROB[robHead];
      if (head.busy && head.ready) {
        regFile[head.dest] = head.value;
        if (RAT[head.dest] === robHead) RAT[head.dest] = null;
        trace[head.instrIdx].commit = cycle;
        head.busy = false;
        robHead = (robHead + 1) % n;
        robCount--;
        committed++;
      }
    }

    // 2. Write-result: CHI 1 broadcast/chu ky (CDB la tai nguyen dung chung)
    let broadcaster = null;
    for (const rs of allRS) {
      if (rs.busy && rs.state === 'EXECUTING' && rs.remaining === 0) {
        if (broadcaster === null || rs.robIndex < broadcaster.robIndex) broadcaster = rs;
      }
    }
    if (broadcaster) {
      const val = computeVal(broadcaster.op, broadcaster.Vj, broadcaster.Vk);
      ROB[broadcaster.robIndex].value = val;
      ROB[broadcaster.robIndex].ready = true;
      trace[ROB[broadcaster.robIndex].instrIdx].writeback = cycle;
      for (const rs of allRS) {
        if (rs.busy && rs.Qj === broadcaster.robIndex) {
          rs.Vj = val;
          rs.Qj = null;
        }
        if (rs.busy && rs.Qk === broadcaster.robIndex) {
          rs.Vk = val;
          rs.Qk = null;
        }
      }
      broadcaster.busy = false;
      broadcaster.state = null;
    }

    // 3. Giam remaining cua cac RS dang EXECUTING
    for (const rs of allRS) {
      if (rs.busy && rs.state === 'EXECUTING' && rs.remaining > 0) rs.remaining--;
    }

    // 4. WAITING -> EXECUTING khi ca 2 toan hang da san sang
    for (const rs of allRS) {
      if (rs.busy && rs.state === 'WAITING' && rs.Qj === null && rs.Qk === null) {
        rs.state = 'EXECUTING';
        rs.remaining = (rs.kind === 'MUL' ? mulLatency : addLatency) - 1;
        trace[ROB[rs.robIndex].instrIdx].execStart = cycle;
      }
    }

    // 5. Issue 1 lenh moi (dung thu tu chuong trinh) neu con RS + ROB trong
    if (nextIssue < n && robCount < n) {
      const instr = instructions[nextIssue];
      const pool = instr.op === 'MUL' ? mulRS : addRS;
      const freeRS = pool.find((rs) => !rs.busy);
      if (freeRS) {
        const robIndex = (robHead + robCount) % n;
        const rob = ROB[robIndex];
        rob.busy = true;
        rob.dest = instr.dest;
        rob.value = null;
        rob.ready = false;
        rob.instrIdx = nextIssue;
        robCount++;

        freeRS.busy = true;
        freeRS.op = instr.op;
        freeRS.robIndex = robIndex;
        if (RAT[instr.src1] === null) {
          freeRS.Vj = regFile[instr.src1];
          freeRS.Qj = null;
        } else {
          const srcRob = ROB[RAT[instr.src1]];
          if (srcRob.ready) {
            freeRS.Vj = srcRob.value;
            freeRS.Qj = null;
          } else {
            freeRS.Qj = RAT[instr.src1];
          }
        }
        if (RAT[instr.src2] === null) {
          freeRS.Vk = regFile[instr.src2];
          freeRS.Qk = null;
        } else {
          const srcRob = ROB[RAT[instr.src2]];
          if (srcRob.ready) {
            freeRS.Vk = srcRob.value;
            freeRS.Qk = null;
          } else {
            freeRS.Qk = RAT[instr.src2];
          }
        }
        freeRS.state = 'WAITING';
        RAT[instr.dest] = robIndex; // DOI TEN - day chinh la buoc loai bo WAR/WAW
        trace[nextIssue].issue = cycle;
        nextIssue++;
      }
    }
  }

  return { regFile, trace, totalCycles: cycle, ipc: n / cycle };
}

// ---------------------------------------------------------------------------
// Bài 7 — Phân cấp bộ nhớ & Kiến trúc Cache. CPU OOO của Bài 6 vẫn phải CHỜ
// dữ liệu từ bộ nhớ chính (DRAM) — khoảng cách tốc độ CPU vs DRAM (Memory
// Wall) được che giấu bằng bộ nhớ đệm SRAM cực nhanh (Cache), dựa trên
// nguyên lý cục bộ THỜI GIAN (temporal locality — vừa dùng sẽ dùng lại) và
// KHÔNG GIAN (spatial locality — dùng địa chỉ X thì địa chỉ GẦN X cũng sắp
// được dùng). Build-out: tách địa chỉ tag/index/offset (Mục 7.2), cache
// direct-mapped & set-associative (LRU, Mục 7.2), và AMAT nhiều cấp (Mục 7.3).
// ---------------------------------------------------------------------------

// Tách một địa chỉ 32-bit thành (tag, index, offset) theo đúng cấu trúc phần
// cứng thật: offset (bit thấp nhất) chọn byte TRONG dòng cache, index chọn
// DÒNG (set) trong cache, tag là phần còn lại dùng để SO KHỚP xem dòng đó có
// đúng là dữ liệu đang cần hay không (Mục 7.2).
function splitAddress(address, offsetBits, indexBits) {
  const offset = address & ((1 << offsetBits) - 1);
  const index = (address >>> offsetBits) & ((1 << indexBits) - 1);
  const tag = address >>> (offsetBits + indexBits);
  return { tag, index, offset };
}

// Cache Direct-Mapped: mỗi địa chỉ CHỈ ánh xạ vào ĐÚNG 1 dòng cache (theo
// index) — đơn giản, nhanh, nhưng dễ bị Conflict Miss: 2 địa chỉ khác tag
// nhưng CÙNG index sẽ liên tục "đá" nhau ra khỏi dòng duy nhất đó dù cache
// còn thừa chỗ ở dòng khác (Mục 7.2, pitfall Set-Associative giải quyết).
function makeDirectMappedCache(numSets, offsetBits) {
  const indexBits = Math.log2(numSets);
  if (!Number.isInteger(indexBits)) throw new Error('numSets phai la luy thua cua 2');
  const lines = new Array(numSets).fill(null).map(() => ({ valid: false, tag: null }));
  return {
    access(address) {
      const { tag, index } = splitAddress(address, offsetBits, indexBits);
      const line = lines[index];
      if (line.valid && line.tag === tag) return 'HIT';
      line.valid = true;
      line.tag = tag;
      return 'MISS';
    },
  };
}

// Cache Set-Associative N-way + LRU (Least Recently Used, Mục 7.2): mỗi
// index ứng với một TẬP (set) chứa `ways` dòng — địa chỉ trùng index nhưng
// khác tag KHÔNG còn phải tranh 1 dòng duy nhất, giảm hẳn Conflict Miss so
// với Direct-Mapped (đổi lại: phần cứng phức tạp hơn, tốn năng lượng hơn để
// so khớp `ways` tag song song mỗi lần truy cập — pitfall Mục 7.2).
function makeSetAssociativeCache(numSets, ways, offsetBits) {
  const indexBits = Math.log2(numSets);
  if (!Number.isInteger(indexBits)) throw new Error('numSets phai la luy thua cua 2');
  const sets = new Array(numSets).fill(null).map(() => []);
  let clock = 0;
  return {
    access(address) {
      const { tag, index } = splitAddress(address, offsetBits, indexBits);
      const set = sets[index];
      const entry = set.find((e) => e.tag === tag);
      clock++;
      if (entry) {
        entry.lastUsed = clock;
        return 'HIT';
      }
      if (set.length < ways) {
        set.push({ tag, lastUsed: clock });
      } else {
        let lruIdx = 0;
        for (let i = 1; i < set.length; i++) if (set[i].lastUsed < set[lruIdx].lastUsed) lruIdx = i;
        set[lruIdx] = { tag, lastUsed: clock };
      }
      return 'MISS';
    },
  };
}

// Chạy một chuỗi địa chỉ qua MỘT cache, trả về số Hit/Miss + vết chi tiết
// từng truy cập (dùng cho demo trực quan hoá Hit/Miss).
function runCacheTrace(cache, addresses) {
  let hits = 0;
  let misses = 0;
  const trace = [];
  for (const addr of addresses) {
    const r = cache.access(addr);
    trace.push(r);
    if (r === 'HIT') hits++;
    else misses++;
  }
  return { hits, misses, total: addresses.length, missRate: misses / addresses.length, trace };
}

// AMAT (Average Memory Access Time) 1 cấp cache (Mục 7.3):
// $AMAT = T_{Hit} + \text{MissRate} \times T_{MissPenalty}$
function amat(hitTime, missRate, missPenalty) {
  return hitTime + missRate * missPenalty;
}

// AMAT 2 cấp cache L1+L2 (Mục 7.3): `missRateL2Local` là tỷ lệ miss CỤC BỘ
// của L2 — CHỈ tính trên số lần L1 đã miss (không phải trên tổng số truy
// cập chương trình) — pitfall Mục 7.3: nhầm miss rate cục bộ (local, đúng
// công thức này) với miss rate toàn cục (global = missRateL1 × missRateL2Local,
// tức tỷ lệ trên TỔNG số truy cập chương trình, một con số khác hẳn).
function amatTwoLevel(hitTimeL1, missRateL1, hitTimeL2, missRateL2Local, missPenaltyMem) {
  return hitTimeL1 + missRateL1 * (hitTimeL2 + missRateL2Local * missPenaltyMem);
}

// ---------------------------------------------------------------------------
// Bài 8 — Bộ nhớ ảo (Virtual Memory) & Khối TLB. Cache (Bài 7) tăng tốc truy
// cập bộ nhớ VẬT LÝ — bài này thêm một tầng gián tiếp NGAY TRƯỚC đó: mỗi
// tiến trình thấy một không gian địa chỉ ẢO riêng, được dịch sang địa chỉ
// VẬT LÝ qua Page Table (Mục 8.1). Vì Page Table cũng nằm trong RAM (tra
// cứu nó cũng tốn 1 lần truy cập bộ nhớ!), TLB (Translation Lookaside
// Buffer, Mục 8.3) đóng vai trò CACHE cho chính Page Table.
// ---------------------------------------------------------------------------

// Tách địa chỉ ẢO thành VPN (Virtual Page Number) + offset trong trang
// (Mục 8.1) — cấu trúc y hệt splitAddress() của Bài 7 nhưng không có "index"
// riêng vì Page Table tra cứu bằng TOÀN BỘ VPN (không chia set như cache).
function splitVirtualAddress(virtualAddress, pageOffsetBits) {
  const offset = virtualAddress & ((1 << pageOffsetBits) - 1);
  const vpn = virtualAddress >>> pageOffsetBits;
  return { vpn, offset };
}

// TLB (Translation Lookaside Buffer, Mục 8.3): bảng nhỏ, đầy đủ liên kết
// (fully-associative) + LRU, lưu các cặp (VPN -> PFN) đã dịch GẦN ĐÂY nhất —
// đúng vai trò MỘT CACHE cho Page Table, giúp tránh phải truy cập RAM lần
// thứ 2 (đọc Page Table) chỉ để biết địa chỉ vật lý của lần truy cập THỨ NHẤT.
function makeTLB(capacity) {
  const entries = []; // {vpn, pfn, lastUsed}
  let clock = 0;
  return {
    lookup(vpn) {
      const e = entries.find((x) => x.vpn === vpn);
      clock++;
      if (e) {
        e.lastUsed = clock;
        return e.pfn;
      }
      return null;
    },
    insert(vpn, pfn) {
      clock++;
      if (entries.length < capacity) {
        entries.push({ vpn, pfn, lastUsed: clock });
        return;
      }
      let lruIdx = 0;
      for (let i = 1; i < entries.length; i++) if (entries[i].lastUsed < entries[lruIdx].lastUsed) lruIdx = i;
      entries[lruIdx] = { vpn, pfn, lastUsed: clock };
    },
    size() {
      return entries.length;
    },
  };
}

// Dịch một địa chỉ ảo sang địa chỉ vật lý (Mục 8.1 + 8.3): thử TLB TRƯỚC
// (nhanh); nếu TLB miss thì tra Page Table (chậm hơn — mô phỏng 1 lần truy
// cập RAM phụ); nếu VPN không có trong Page Table => Page Fault (trang chưa
// được ánh xạ/chưa nạp — Mục 8.1).
function translateAddress(virtualAddress, pageOffsetBits, tlb, pageTable) {
  const { vpn, offset } = splitVirtualAddress(virtualAddress, pageOffsetBits);
  let pfn = tlb.lookup(vpn);
  if (pfn !== null) {
    return { physicalAddress: (pfn << pageOffsetBits) | offset, tlbHit: true, pageFault: false };
  }
  if (pageTable.has(vpn)) {
    pfn = pageTable.get(vpn);
    tlb.insert(vpn, pfn);
    return { physicalAddress: (pfn << pageOffsetBits) | offset, tlbHit: false, pageFault: false };
  }
  return { physicalAddress: null, tlbHit: false, pageFault: true };
}

// Số trang ẢO tối đa trong không gian địa chỉ `addressBits`-bit với trang
// `pageOffsetBits`-bit (Mục 8.2): $2^{addressBits - pageOffsetBits}$.
function pageTableEntryCount(addressBits, pageOffsetBits) {
  return Math.pow(2, addressBits - pageOffsetBits);
}

// Dung lượng Page Table ĐƠN CẤP (Mục 8.2): một mảng PHẲNG có ĐỦ chỗ cho MỌI
// trang ảo CÓ THỂ có, kể cả những trang KHÔNG BAO GIỜ được dùng — đây chính
// là pitfall Mục 8.2 (lãng phí RAM khổng lồ với không gian địa chỉ 64-bit).
function singleLevelPageTableSizeBytes(addressBits, pageOffsetBits, entryBytes) {
  return pageTableEntryCount(addressBits, pageOffsetBits) * entryBytes;
}

// Dung lượng Page Table 2 CẤP (Mục 8.2, kiểu x86 32-bit 10-10-12): bảng cấp
// 1 LUÔN được cấp phát đủ (nhỏ, cố định); bảng cấp 2 chỉ cấp phát cho những
// VÙNG THẬT SỰ có trang đang dùng — tiết kiệm RAM cực lớn so với đơn cấp khi
// chương trình chỉ dùng một phần nhỏ không gian địa chỉ (thực tế phổ biến).
function twoLevelPageTableSizeBytes(numUsedPages, entriesPerTable, entryBytes) {
  const firstLevelBytes = entriesPerTable * entryBytes;
  const numSecondLevelTables = Math.ceil(numUsedPages / entriesPerTable);
  const tableBytes = entriesPerTable * entryBytes;
  return firstLevelBytes + numSecondLevelTables * tableBytes;
}

export {
  toBinString,
  toSigned,
  halfAdder,
  fullAdder,
  rippleCarryAdd,
  aluExecute,
  ALU_OPS,
  createCpuState,
  cpuStep,
  runProgram,
  RV32I_OPCODE,
  RV32I_MNEMONIC,
  assembleRV32I,
  decodeRV32I,
  executeRV32I,
  runRV32IProgram,
  pipelineTime,
  pipelineCPI,
  detectHazards,
  makeBranchPredictor1Bit,
  makeBranchPredictor2Bit,
  makeBranchHistoryTable,
  runPredictor,
  effectiveCPI,
  runTomasulo,
  splitAddress,
  makeDirectMappedCache,
  makeSetAssociativeCache,
  runCacheTrace,
  amat,
  amatTwoLevel,
  splitVirtualAddress,
  makeTLB,
  translateAddress,
  pageTableEntryCount,
  singleLevelPageTableSizeBytes,
  twoLevelPageTableSizeBytes,
};

// ---------------------------------------------------------------------------
// Self-test — chạy bằng `node cpu-core.js`. Kiểm tra `typeof process` trước vì
// `process` không tồn tại trong trình duyệt (thiếu bước này gây ReferenceError
// ngay khi trang import module) — tiền lệ dsp-core.js/vmcu.js/ai-neuro.js.
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  let errors = 0;
  let checks = 0;
  function check(name, got, exp) {
    checks++;
    if (got !== exp) {
      console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
      errors++;
    }
  }
  function checkTrue(name, cond) {
    checks++;
    if (!cond) {
      console.log('LOI', name);
      errors++;
    }
  }

  // --- Tiện ích biểu diễn số ---
  check('toBinString(5, 4) = 0101', toBinString(5, 4), '0101');
  check('toBinString(9, 4) = 1001', toBinString(9, 4), '1001');
  check('toSigned(9, 4) = -7 (bu 2: 1001)', toSigned(9, 4), -7);
  check('toSigned(7, 4) = 7 (bit dau = 0)', toSigned(7, 4), 7);
  check('toSigned(8, 4) = -8 (so am nho nhat 4-bit)', toSigned(8, 4), -8);

  // --- Half adder: đúng bảng chân trị (2^2 = 4 tổ hợp) ---
  check('halfAdder(0,0) sum', halfAdder(0, 0).sum, 0);
  check('halfAdder(0,0) carry', halfAdder(0, 0).carry, 0);
  check('halfAdder(1,0) sum', halfAdder(1, 0).sum, 1);
  check('halfAdder(1,0) carry', halfAdder(1, 0).carry, 0);
  check('halfAdder(1,1) sum = 0 (1+1 = 10, tong bit = 0)', halfAdder(1, 1).sum, 0);
  check('halfAdder(1,1) carry = 1 (co nho)', halfAdder(1, 1).carry, 1);

  // --- Full adder: đúng cả 8 tổ hợp so với phép cộng số học thật ---
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      for (let cin = 0; cin < 2; cin++) {
        const { sum, cout } = fullAdder(a, b, cin);
        const total = a + b + cin;
        check(`fullAdder(${a},${b},${cin}) sum khop bit thap cua ${total}`, sum, total & 1);
        check(`fullAdder(${a},${b},${cin}) cout khop bit nho cua ${total}`, cout, total >> 1);
      }
    }
  }

  // --- Ripple-carry adder 4-bit: khớp phép cộng JS trên toàn bộ 256 tổ hợp ---
  {
    let ok = true;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const { result, cout } = rippleCarryAdd(a, b, 0, 4);
        if (result !== ((a + b) & 0xf)) ok = false;
        if (cout !== (a + b > 15 ? 1 : 0)) ok = false;
      }
    }
    checkTrue('rippleCarryAdd 4-bit khop (a+b)&0xF va carry tren ca 256 to hop', ok);
  }

  // --- ALU: verify SỐ THẬT dùng cho quiz Câu 1 (5 + 4 tren 4-bit) ---
  {
    const r = aluExecute(5, 4, 'ADD');
    check('ALU 5+4: ket qua = 9 (1001)', r.result, 9);
    check('ALU 5+4: chuoi nhi phan = 1001', toBinString(r.result), '1001');
    checkTrue('ALU 5+4: Z = 0 (ket qua khac 0)', r.flags.z === false);
    checkTrue('ALU 5+4: S = 1 (bit cao nhat = 1)', r.flags.s === true);
    checkTrue('ALU 5+4: C = 0 (9 <= 15, khong tran khong dau)', r.flags.c === false);
    checkTrue('ALU 5+4: V = 1 (+5 + +4 = +9 vuot [-8,7], tran co dau)', r.flags.v === true);
  }

  // --- ALU ADD: cờ Carry vs Overflow khớp định nghĩa tham chiếu trên 256 tổ hợp ---
  {
    let ok = true;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const r = aluExecute(a, b, 'ADD');
        // Tham chieu: carry = tran khong dau; overflow = tong CO DAU ngoai [-8,7].
        const refCarry = a + b > 15;
        const signedSum = toSigned(a, 4) + toSigned(b, 4);
        const refOverflow = signedSum > 7 || signedSum < -8;
        if (r.flags.c !== refCarry) ok = false;
        if (r.flags.v !== refOverflow) ok = false;
        if (r.result !== ((a + b) & 0xf)) ok = false;
      }
    }
    checkTrue('ALU ADD: co C/V va ket qua khop dinh nghia tham chieu (256 to hop)', ok);
  }

  // --- ALU SUB: kết quả + cờ khớp tham chiếu bù 2 trên 256 tổ hợp ---
  {
    let ok = true;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const r = aluExecute(a, b, 'SUB');
        if (r.result !== ((a - b) & 0xf)) ok = false;
        const refBorrow = a < b; // muon (borrow) theo khong dau
        const signedDiff = toSigned(a, 4) - toSigned(b, 4);
        const refOverflow = signedDiff > 7 || signedDiff < -8;
        if (r.flags.c !== refBorrow) ok = false;
        if (r.flags.v !== refOverflow) ok = false;
      }
    }
    checkTrue('ALU SUB: ket qua bu 2, co muon (C) va tran co dau (V) khop tham chieu (256 to hop)', ok);
  }

  // --- ALU phép luận lý AND/OR/XOR: đúng bitwise, C và V luôn = false ---
  {
    const rAnd = aluExecute(0b1100, 0b1010, 'AND');
    check('ALU AND 1100 & 1010 = 1000', rAnd.result, 0b1000);
    const rOr = aluExecute(0b1100, 0b1010, 'OR');
    check('ALU OR 1100 | 1010 = 1110', rOr.result, 0b1110);
    const rXor = aluExecute(0b1100, 0b1010, 'XOR');
    check('ALU XOR 1100 ^ 1010 = 0110', rXor.result, 0b0110);
    checkTrue(
      'ALU phep luan ly: C va V luon = false',
      !rAnd.flags.c && !rAnd.flags.v && !rOr.flags.c && !rOr.flags.v && !rXor.flags.c && !rXor.flags.v
    );
    checkTrue('ALU XOR cua 2 gia tri bang nhau => co Zero bat', aluExecute(0b1010, 0b1010, 'XOR').flags.z === true);
  }

  // --- Bài 2: Toy CPU fetch-decode-execute (Von Neumann: RAM chung cho lệnh & dữ liệu) ---
  {
    // Chuong trinh tuyen tinh: 5+3, luu ket qua vao RAM[10] (dung ALU cua Bai 1)
    const prog1 = [
      { op: 'LOADI', rd: 0, imm: 5 },
      { op: 'LOADI', rd: 1, imm: 3 },
      { op: 'ADD', rd: 2, rs1: 0, rs2: 1 },
      { op: 'STORE', rs: 2, addr: 10 },
      { op: 'HALT' },
    ];
    const { state: s1, steps: steps1 } = runProgram(prog1);
    check('Toy CPU: chuong trinh 5+3 -> R2 = 8', s1.regs[2], 8);
    check('Toy CPU: STORE ghi dung gia tri 8 vao RAM[10]', s1.ram[10], 8);
    check('Toy CPU: chay dung 5 chu ky fetch-decode-execute (5 lenh, khong nhay)', steps1, 5);
    check('Toy CPU: PC dung o 5 sau HALT (da fetch het 5 lenh, tang moi lan fetch)', s1.pc, 5);

    // Vong lap tinh tong 1+2+3+4+5 bang BEQ+JMP (kiem tra dung thu tu PC tang
    // TRUOC roi JMP/BEQ GHI DE PC o buoc execute - pitfall Muc 2.2)
    const prog2 = [
      { op: 'LOADI', rd: 0, imm: 5 }, // 0: R0 = counter = 5
      { op: 'LOADI', rd: 1, imm: 0 }, // 1: R1 = sum = 0
      { op: 'LOADI', rd: 2, imm: 0 }, // 2: R2 = 0 (hang so dieu kien dung)
      { op: 'LOADI', rd: 3, imm: 1 }, // 3: R3 = 1 (hang so tru)
      { op: 'BEQ', rs1: 0, rs2: 2, addr: 8 }, // 4: counter==0 -> thoat vong lap
      { op: 'ADD', rd: 1, rs1: 1, rs2: 0 }, // 5: sum += counter
      { op: 'SUB', rd: 0, rs1: 0, rs2: 3 }, // 6: counter -= 1
      { op: 'JMP', addr: 4 }, // 7: quay lai kiem tra dieu kien
      { op: 'HALT' }, // 8
    ];
    const { state: s2, steps: steps2 } = runProgram(prog2);
    check('Toy CPU: vong lap BEQ/JMP tinh dung tong 1+2+3+4+5 = 15', s2.regs[1], 15);
    check('Toy CPU: counter (R0) ve dung 0 sau vong lap', s2.regs[0], 0);
    check('Toy CPU: tong so chu ky fetch-decode-execute (verified, khong bia)', steps2, 26);

    // Pitfall Muc 2.1: self-modifying code — STORE vo tinh ghi de dung dia chi
    // dang la 1 lenh trong CHINH chuong trinh (Von Neumann: RAM chung, khong
    // co ranh gioi phan biet vung lenh/vung du lieu) — fetch ke tiep tai dia
    // chi do se doc phai RAC (khong con la lenh hop le) va nem loi.
    const progSelfModify = [
      { op: 'LOADI', rd: 0, imm: 99 },
      { op: 'STORE', rs: 0, addr: 2 }, // ghi de RAM[2] - dung vi tri lenh ke tiep!
      { op: 'LOADI', rd: 1, imm: 7 }, // se bi ghi de thanh so 99 truoc khi kip fetch
      { op: 'HALT' },
    ];
    let selfModifyThrew = false;
    try {
      runProgram(progSelfModify, 10);
    } catch (e) {
      selfModifyThrew = true;
    }
    checkTrue(
      'Pitfall self-modifying code: STORE ghi de len vung LỆNH khiến fetch kế tiếp đọc phải rác, ném lỗi (verified thật, không phải suy diễn)',
      selfModifyThrew
    );
  }

  // --- Bài 3: RV32I assembler/decoder + đường đi dữ liệu đơn chu kỳ ---
  {
    // Khop CHINH XAC voi ma may that (verified bang tinh tay theo dac ta RISC-V)
    check(
      'assembleRV32I ADD x3,x1,x2 = 0x2081b3 (dung dac ta RV32I)',
      assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 2 }),
      0x2081b3
    );
    check(
      'assembleRV32I SUB x3,x1,x2 = 0x402081b3 (funct7 bit dau phan biet SUB voi ADD)',
      assembleRV32I('SUB', { rd: 3, rs1: 1, rs2: 2 }),
      0x402081b3
    );
    check('assembleRV32I ADDI x1,x0,5 = 0x500093', assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 5 }), 0x500093);
    check('assembleRV32I LW x5,8(x2) = 0x812283', assembleRV32I('LW', { rd: 5, rs1: 2, imm: 8 }), 0x812283);
    check('assembleRV32I SW x5,8(x2) = 0x512423', assembleRV32I('SW', { rs1: 2, rs2: 5, imm: 8 }), 0x512423);

    // Khu hoi: assemble roi decode phai cho DUNG lai input ban dau
    for (const [mnemonic, args] of [
      ['ADD', { rd: 3, rs1: 1, rs2: 2 }],
      ['SUB', { rd: 7, rs1: 4, rs2: 5 }],
      ['AND', { rd: 1, rs1: 2, rs2: 3 }],
      ['OR', { rd: 1, rs1: 2, rs2: 3 }],
      ['XOR', { rd: 1, rs1: 2, rs2: 3 }],
      ['ADDI', { rd: 1, rs1: 0, imm: 5 }],
      ['LW', { rd: 5, rs1: 2, imm: 8 }],
      ['SW', { rs1: 2, rs2: 5, imm: 8 }],
    ]) {
      const word = assembleRV32I(mnemonic, args);
      const decoded = decodeRV32I(word);
      checkTrue(`RV32I khứ hồi ${mnemonic}: decode(assemble(...)) khớp mnemonic`, decoded.mnemonic === mnemonic);
    }

    // Datapath don chu ky: chuong trinh THAT (5+3)-2, luu vao mem[100], doc lai
    const program = [
      assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 5 }),
      assembleRV32I('ADDI', { rd: 2, rs1: 0, imm: 3 }),
      assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 2 }),
      assembleRV32I('ADDI', { rd: 4, rs1: 0, imm: 2 }),
      assembleRV32I('SUB', { rd: 5, rs1: 3, rs2: 4 }),
      assembleRV32I('SW', { rs1: 0, rs2: 5, imm: 100 }),
      assembleRV32I('LW', { rd: 6, rs1: 0, imm: 100 }),
    ];
    const { regs, mem } = runRV32IProgram(program);
    check('RV32I datapath: x3 = 5+3 = 8 (dung aluExecute cua Bai 1)', regs[3], 8);
    check('RV32I datapath: x5 = (5+3)-2 = 6', regs[5], 6);
    check('RV32I datapath: SW ghi dung mem[100] = 6', mem[100], 6);
    check('RV32I datapath: LW doc lai dung x6 = 6', regs[6], 6);

    // x0 la thanh ghi cung, MOI lenh ghi vao x0 deu bi bo qua
    const programX0 = [assembleRV32I('ADDI', { rd: 0, rs1: 0, imm: 42 })];
    const { regs: regsX0 } = runRV32IProgram(programX0);
    check('RV32I x0 la hang so cung: ghi 42 vao x0 van doc ra 0', regsX0[0], 0);
  }

  // --- Bài 4: Pipeline 5 giai đoạn — thời gian/CPI + hazard RAW/load-use ---
  {
    // Muc 4.2: 1 trieu lenh, pipeline 5 giai doan, xung nhip 2GHz (0,5ns/chu ky)
    check(
      'pipelineTime: 1 trieu lenh, 5 giai doan, KHONG stall, 2GHz -> 500.002 ns',
      pipelineTime(1_000_000, 5, 0, 0.5),
      500002
    );
    check(
      'pipelineTime: CUNG chuong trinh nhung co 200.000 stall -> 600.002 ns',
      pipelineTime(1_000_000, 5, 200_000, 0.5),
      600002
    );
    check(
      'pipelineCPI: khong stall = 1 (dung NGHIA cua pipeline - 1 lenh/chu ky o trang thai on dinh)',
      pipelineCPI(1_000_000, 0),
      1
    );
    checkTrue(
      'pipelineCPI: 200.000 stall tren 1 trieu lenh = 1,2 (CPI hieu dung tang dung ty le stall)',
      Math.abs(pipelineCPI(1_000_000, 200_000) - 1.2) < 1e-9
    );

    // Muc 4.3/4.4: day lenh THAT (tai dung decodeRV32I cua Bai 3) co 2 RAW hazard lien tiep
    // ADDI x1,x0,20 / ADD x2,x1,x1 (doc x1) / SUB x3,x2,x1 (doc x2 VA x1)
    const seqRAW = [
      decodeRV32I(assembleRV32I('ADDI', { rd: 1, rs1: 0, imm: 20 })),
      decodeRV32I(assembleRV32I('ADD', { rd: 2, rs1: 1, rs2: 1 })),
      decodeRV32I(assembleRV32I('SUB', { rd: 3, rs1: 2, rs2: 1 })),
    ];
    const withFwd = detectHazards(seqRAW, true);
    const noFwd = detectHazards(seqRAW, false);
    check(
      'detectHazards CO forwarding: 2 hazard RAW nhung 0 stall (forwarding giai quyet HOAN TOAN)',
      withFwd.totalStalls,
      0
    );
    check(
      'detectHazards KHONG forwarding: CUNG 2 hazard nhung ton dung 4 stall (2 stall/hazard, cho toi WB)',
      noFwd.totalStalls,
      4
    );

    // Load-use hazard: LW x1,0(x2) roi dung NGAY x1 - forwarding KHONG cuu duoc
    const seqLoadUse = [
      decodeRV32I(assembleRV32I('LW', { rd: 1, rs1: 2, imm: 0 })),
      decodeRV32I(assembleRV32I('ADD', { rd: 3, rs1: 1, rs2: 1 })),
    ];
    const loadUseResult = detectHazards(seqLoadUse, true);
    check(
      'Pitfall load-use: LW roi dung NGAY ket qua - forwarding VAN can dung 1 stall (khong the ve 0)',
      loadUseResult.totalStalls,
      1
    );
    checkTrue(
      'Pitfall load-use: hazard duoc gan dung nhan LOAD_USE (khac RAW thuong)',
      loadUseResult.hazards[0].type === 'LOAD_USE'
    );
  }

  // --- Bài 5: Bộ dự đoán nhánh 1-bit/2-bit + BHT + CPI hiệu dụng ---
  {
    // Chuoi vong lap long nhau: vong ngoai 3 lan, vong trong 4 lan T roi 1 N
    // (TTTTN lap lai 3 lan) - dung de minh hoa pitfall dao dong cua bo 1-bit
    const nestedLoop = [];
    for (let outer = 0; outer < 3; outer++) {
      for (let inner = 0; inner < 4; inner++) nestedLoop.push('T');
      nestedLoop.push('N');
    }
    check('Chuoi vong lap long nhau co dung 15 nhanh (3x5)', nestedLoop.length, 15);

    const r1 = runPredictor(makeBranchPredictor1Bit(), nestedLoop);
    check('Bo du doan 1-bit tren vong lap long nhau: 9/15 dung (60%)', r1.correct, 9);
    checkTrue('Bo du doan 1-bit: ty le dung = 0.6', Math.abs(r1.rate - 0.6) < 1e-9);

    const r2 = runPredictor(makeBranchPredictor2Bit(), nestedLoop);
    check('Bo du doan 2-bit tren CUNG chuoi: 10/15 dung (66,7% - tot hon 1-bit)', r2.correct, 10);
    checkTrue('Bo du doan 2-bit: ty le dung = 2/3', Math.abs(r2.rate - 2 / 3) < 1e-9);

    // Pitfall Muc 5.2: 1-bit doan sai NGAY tai moi diem chuyen N->T va T->N
    // (dao dong lien tuc), con 2-bit CHIU DUNG 1 lan sai don le nho bao hoa
    checkTrue(
      'Pitfall: bo 1-bit doan sai o CA hai bien cua moi vong lap trong (N->T va T->N)',
      !r1.trace[0].hit && !r1.trace[4].hit && !r1.trace[5].hit
    );
    checkTrue(
      '2-bit: sau khi bao hoa Rat-nhay (state=3), 1 lan N don le CHUA lam doi du doan ke tiep',
      r2.trace[5].predicted === 'T' // dung ngay sau N dau tien, van doan T (khac 1-bit)
    );

    // BHT: 2 dia chi nhanh KHAC NHAU phai co lich su rieng, khong tron lan
    {
      const bht = makeBranchHistoryTable();
      const seqA = ['T', 'T', 'T', 'T']; // dia chi 100: luon nhay
      const seqB = ['N', 'N', 'N', 'N']; // dia chi 200: khong bao gio nhay
      let correctA = 0;
      let correctB = 0;
      for (const actual of seqA) {
        if (bht.predict(100) === actual) correctA++;
        bht.update(100, actual);
      }
      for (const actual of seqB) {
        if (bht.predict(200) === actual) correctB++;
        bht.update(200, actual);
      }
      // Dia chi 100 khoi dong tu state 0 (doan N) nen 2 lan dau sai truoc khi
      // hoc du de vuot nguong state>=2 - dung 2/4; dia chi 200 khop ngay tu
      // dau (state 0 da doan N) nen dung ca 4/4.
      check('BHT: dia chi 100 (luon nhay) hoc dan, dung 2/4 (2 lan dau sai luc khoi dong)', correctA, 2);
      check('BHT: dia chi 200 (khong bao gio nhay) khop ngay tu dau, dung 4/4', correctB, 4);
      check('BHT: lan doan CUOI cua dia chi 100 da dung (T) sau khi hoc', bht.predict(100), 'T');
      check('BHT: co dung 2 entry rieng biet cho 2 dia chi khac nhau', bht.size(), 2);
    }

    // Muc 5.3: CPI hieu dung - bai toan thuc te 20% lenh re nhanh, 10% doan
    // sai, penalty 3 chu ky, CPI ly tuong = 1 -> 1 + 0.2*0.1*3 = 1.06
    checkTrue(
      'effectiveCPI(1, 0.2, 0.1, 3) = 1,06 (20% nhanh x 10% doan sai x 3 chu ky phat)',
      Math.abs(effectiveCPI(1, 0.2, 0.1, 3) - 1.06) < 1e-9
    );
    checkTrue('effectiveCPI khong co nhanh nao (branchFreq=0) = dung CPI ly tuong', effectiveCPI(1, 0, 0.1, 3) === 1);
  }

  // --- Bài 6: Tomasulo OOO — dang RS/CDB/ROB, doi ten thanh ghi loai bo WAR/WAW ---
  {
    // Vi du kinh dien: instr1 MUL ghi R1 (do lau), instr2 ADD ghi R2 (WAR -
    // doc R2 ma instr1 KHONG doc, chi la trung dich voi mot lenh SAU doc R2...
    // that ra day la WAR that: instr1 la nguoi tieu thu R2 CU truoc khi bi
    // ghi de) - RAT phai doi ten de instr2 khong can doi instr1; instr3 SUB
    // ghi LAI R1 (WAW voi instr1) - RAT doi ten de instr3 khong can doi
    // instr1 hoan tat, va COMMIT dung thu tu chuong trinh dam bao R1 cuoi
    // cung la gia tri CUA INSTR3 (ghi sau trong chuong trinh) chu khong phai
    // instr1 (WAW dung nghia: "nguoi ghi sau thang").
    const initialRegs = [0, 10, 3, 4, 5, 6, 20, 2];
    const program = [
      { op: 'MUL', dest: 1, src1: 2, src2: 3 }, // R1 = R2*R3 = 3*4 = 12 (do lau, mulLatency)
      { op: 'ADD', dest: 2, src1: 4, src2: 5 }, // R2 = R4+R5 = 5+6 = 11 (WAR tren R2 voi instr1)
      { op: 'SUB', dest: 1, src1: 6, src2: 7 }, // R1 = R6-R7 = 20-2 = 18 (WAW tren R1 voi instr1)
    ];
    const result = runTomasulo(program, { initialRegs });

    check(
      'Tomasulo: R1 cuoi cung = 18 (tu instr3 SUB, DUNG thu tu chuong trinh nho in-order commit)',
      result.regFile[1],
      18
    );
    check('Tomasulo: R2 cuoi cung = 11 (tu instr2 ADD)', result.regFile[2], 11);
    check('Tomasulo: tong so chu ky (verified thuc te, khong bia)', result.totalCycles, 9);
    checkTrue('Tomasulo: IPC = 3/9 = 0,333...', Math.abs(result.ipc - 3 / 9) < 1e-9);

    checkTrue(
      'Pitfall WAR: instr2 (ghi R2) bat dau THUC THI (cycle 3) truoc ca khi instr1 (MUL doc R2) hoan tat writeback (cycle 6) - doi ten loai bo hoan toan WAR stall',
      result.trace[1].execStart < result.trace[0].writeback
    );
    checkTrue(
      'Out-of-order completion: instr2 writeback (cycle 5) XONG TRUOC instr1 (cycle 6) - hoan thanh tinh toan KHONG theo thu tu chuong trinh',
      result.trace[1].writeback < result.trace[0].writeback
    );
    checkTrue(
      'Nhung in-order commit: instr1 cam ket TRUOC instr2, instr2 TRUOC instr3 - dung thu tu chuong trinh du hoan thanh ngoai thu tu',
      result.trace[0].commit < result.trace[1].commit && result.trace[1].commit < result.trace[2].commit
    );

    // Doi chung: cung chuong trinh nhung KHONG co WAR/WAW (dest khac nhau
    // hoan toan) - tong chu ky phai <= truong hop co WAW/WAR o tren (khong
    // te hon), chung minh renaming khong lam cham di so voi truong hop
    // khong co xung dot gia
    const programNoConflict = [
      { op: 'MUL', dest: 1, src1: 2, src2: 3 },
      { op: 'ADD', dest: 4, src1: 4, src2: 5 }, // dest khac (R4 thay vi R2)
      { op: 'SUB', dest: 5, src1: 6, src2: 7 }, // dest khac (R5 thay vi R1)
    ];
    const resultNoConflict = runTomasulo(programNoConflict, { initialRegs });
    check(
      'Tomasulo doi chung (khong WAR/WAW): tong chu ky bang HET truong hop co WAR/WAW (renaming da lam cho ca 2 truong hop giong nhau ve toc do)',
      resultNoConflict.totalCycles,
      result.totalCycles
    );
  }

  // --- Bài 7: Cache tag/index/offset, direct-mapped/set-assoc, AMAT ---
  {
    // splitAddress: dia chi 0x1234 (4660) voi offsetBits=4, indexBits=2
    // -> offset = 4 bit thap = 0x4, index = 2 bit tiep = binary cua (4660>>4)&0b11
    check('splitAddress(0x1234, 4, 2).offset = 0x4', splitAddress(0x1234, 4, 2).offset, 0x4);
    checkTrue(
      'splitAddress khu hoi: ghep lai tag<<(offset+index) | index<<offset | offset = dung dia chi goc',
      (() => {
        const { tag, index, offset } = splitAddress(0x1234, 4, 2);
        return ((tag << 6) | (index << 4) | offset) === 0x1234;
      })()
    );

    // Pitfall 7.1 Locality: mang 8x8 phan tu 4-byte, duyet theo HANG (spatial
    // locality tot) vs duyet theo COT (spatial locality te - nhay xa moi lan)
    // - CUNG mot cache 4 dong x 16 byte/dong (64 byte tong)
    const R = 8,
      C = 8,
      ELEM = 4;
    const addrOf = (row, col) => (row * C + col) * ELEM;
    const rowMajorAddrs = [];
    for (let row = 0; row < R; row++) for (let col = 0; col < C; col++) rowMajorAddrs.push(addrOf(row, col));
    const colMajorAddrs = [];
    for (let col = 0; col < C; col++) for (let row = 0; row < R; row++) colMajorAddrs.push(addrOf(row, col));

    const offsetBits = 4; // 16 byte/dong = 4 phan tu/dong
    const numSets = 4;

    const rowResult = runCacheTrace(makeDirectMappedCache(numSets, offsetBits), rowMajorAddrs);
    check('Duyet theo HANG (spatial locality tot): 16/64 miss (25% - dung 1 lan/dong 4 phan tu)', rowResult.misses, 16);
    checkTrue('Duyet theo HANG: missRate = 0,25', Math.abs(rowResult.missRate - 0.25) < 1e-9);

    const colResult = runCacheTrace(makeDirectMappedCache(numSets, offsetBits), colMajorAddrs);
    check(
      'Pitfall Locality: duyet theo COT (spatial locality mat hoan toan) - MISS 100% (64/64), gap 4 lan te hon duyet hang',
      colResult.misses,
      64
    );

    // Conflict miss: 2 dia chi CUNG index nhung KHAC tag lam Direct-Mapped
    // "da nhau" lien tuc; Set-Associative 2-way giu duoc CA HAI cung luc
    const lineSize = 16;
    const addrA = 0; // index 0, tag 0
    const addrB = numSets * lineSize; // index 0 (trung voi A), tag 1
    const conflictAddrs = [];
    for (let i = 0; i < 10; i++) {
      conflictAddrs.push(addrA);
      conflictAddrs.push(addrB);
    }
    const dmResult = runCacheTrace(makeDirectMappedCache(numSets, offsetBits), conflictAddrs);
    check(
      'Pitfall Conflict Miss: Direct-Mapped voi 2 dia chi trung index khac tag - MISS 100% (20/20), da nhau lien tuc',
      dmResult.misses,
      20
    );
    const saResult = runCacheTrace(makeSetAssociativeCache(numSets, 2, offsetBits), conflictAddrs);
    check(
      'Set-Associative 2-way giai quyet HOAN TOAN conflict miss tren: chi 2/20 miss (2 lan dau, compulsory miss)',
      saResult.misses,
      2
    );

    // AMAT 1 cap va 2 cap - vi du kinh dien (P&H): 2% mien L1, L2 hit=10,
    // 25% mien L2 CUC BO, phat DRAM=200 chu ky -> AMAT = 2,2 chu ky
    checkTrue('amat(1, 0.05, 100) = 6 chu ky (1 + 0,05*100)', Math.abs(amat(1, 0.05, 100) - 6) < 1e-9);
    checkTrue(
      'amatTwoLevel(1, 0.02, 10, 0.25, 200) = 2,2 chu ky (vi du kinh dien Patterson&Hennessy)',
      Math.abs(amatTwoLevel(1, 0.02, 10, 0.25, 200) - 2.2) < 1e-9
    );
    checkTrue(
      'Pitfall Local vs Global miss rate: global L2 miss rate (tren TONG truy cap) = missRateL1*missRateL2Local = 0,02*0,25 = 0,005 - KHAC han 0,25 cuc bo',
      Math.abs(0.02 * 0.25 - 0.005) < 1e-9
    );
  }

  // --- Bài 8: Bộ nhớ ảo - dịch dia chi qua TLB + Page Table, dung luong Page Table ---
  {
    const pageOffsetBits = 12; // trang 4KB
    const pageTable = new Map([
      [5, 100],
      [6, 200],
    ]); // VPN 5 -> PFN 100, VPN 6 -> PFN 200

    // Khu hoi VPN/offset
    checkTrue(
      'splitVirtualAddress khu hoi dung dia chi goc',
      (() => {
        const va = (5 << pageOffsetBits) | 0x123;
        const { vpn, offset } = splitVirtualAddress(va, pageOffsetBits);
        return ((vpn << pageOffsetBits) | offset) === va;
      })()
    );

    const tlb = makeTLB(4);
    const va1 = (5 << pageOffsetBits) | 0x123;
    const r1 = translateAddress(va1, pageOffsetBits, tlb, pageTable);
    check(
      'Lan dau truy cap VPN5: TLB MISS nhung Page Table HIT, dich dung PA',
      r1.physicalAddress,
      (100 << pageOffsetBits) | 0x123
    );
    checkTrue('Lan dau truy cap VPN5: tlbHit=false (chua co trong TLB)', r1.tlbHit === false);
    checkTrue('Lan dau truy cap VPN5: khong Page Fault (VPN co trong Page Table)', r1.pageFault === false);

    const r2 = translateAddress(va1, pageOffsetBits, tlb, pageTable);
    checkTrue(
      'Lan HAI truy cap CUNG VPN5: TLB HIT (da luu tu lan truoc) - tranh duoc 1 lan tra Page Table',
      r2.tlbHit === true
    );
    check('Lan hai van dich dung PA nhu lan dau', r2.physicalAddress, r1.physicalAddress);

    const va4 = (7 << pageOffsetBits) | 0; // VPN 7 khong co trong Page Table
    const r4 = translateAddress(va4, pageOffsetBits, tlb, pageTable);
    checkTrue('Pitfall: truy cap VPN chua duoc anh xa (VPN 7) -> Page Fault = true', r4.pageFault === true);
    check('Page Fault: physicalAddress = null (khong dich duoc)', r4.physicalAddress, null);

    // Dung luong Page Table don cap: 32-bit, trang 4KB, PTE 4-byte -> 4MB
    check('pageTableEntryCount(32, 12) = 2^20 trang ao co the co', pageTableEntryCount(32, 12), Math.pow(2, 20));
    check(
      'singleLevelPageTableSizeBytes(32, 12, 4) = 4.194.304 byte (dung 4MB) - kich thuoc THAT cua Page Table 32-bit don cap',
      singleLevelPageTableSizeBytes(32, 12, 4),
      4 * 1024 * 1024
    );
    checkTrue(
      'Pitfall Muc 8.2: khong gian dia chi 48-bit (64-bit thuc te) voi Page Table DON CAP nhu tren se can 256GB - hoan toan bat kha thi',
      Math.abs(singleLevelPageTableSizeBytes(48, 12, 4) / (1024 * 1024 * 1024) - 256) < 1e-6
    );

    // Dung luong Page Table 2 cap (kieu x86 10-10-12): 512 trang dang dung
    // (2MB) tren khong gian 32-bit -> chi 8KB, RE HON HANG TRAM LAN so voi
    // don cap (4MB) vi bang cap 2 CHI cap phat cho vung THAT SU dang dung.
    check(
      '2 cap: 512 trang dang dung (2MB), entriesPerTable=1024, entryBytes=4 -> 8192 byte (8KB)',
      twoLevelPageTableSizeBytes(512, 1024, 4),
      8192
    );
    checkTrue(
      'Page Table 2 cap TIET KIEM hon 2 cap don RAT NHIEU khi chi dung 1 phan nho khong gian dia chi (8KB vs 4MB = re hon 512 lan)',
      singleLevelPageTableSizeBytes(32, 12, 4) / twoLevelPageTableSizeBytes(512, 1024, 4) === 512
    );
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
