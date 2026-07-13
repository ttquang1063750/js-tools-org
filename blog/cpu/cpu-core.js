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

export { toBinString, toSigned, halfAdder, fullAdder, rippleCarryAdd, aluExecute, ALU_OPS };

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

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
