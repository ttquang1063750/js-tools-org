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
  const mask = (1 << bits) - 1;
  const signBit = 1 << (bits - 1);
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

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
