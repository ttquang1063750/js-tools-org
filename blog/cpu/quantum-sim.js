// quantum-sim.js — "QuantumJS": mô phỏng mạch lượng tử tối giản cho Bài 12
// (Kiến Trúc Máy Tính Lượng Tử). Đây là MODULE RIÊNG BIỆT, KHÔNG mở rộng
// cpu-core.js — vì tính toán lượng tử dùng mô hình toán học HOÀN TOÀN khác
// (vector trạng thái phức, ma trận unita) so với logic nhị phân cổ điển
// xuyên suốt Bài 1-11. Cùng kỷ luật "verify bằng số thật trước khi viết bài
// học" như cpu-core.js — self-test ở cuối file, chạy bằng `node quantum-sim.js`.

// ---------------------------------------------------------------------------
// Số phức tối giản: {re, im}. Biên độ lượng tử (amplitude) LUÔN là số phức
// — ngay cả với mạch 1-2 qubit đơn giản, cổng Pauli-Y đã cần phần ảo.
// ---------------------------------------------------------------------------
function cx(re, im = 0) {
  return { re, im };
}
function cAdd(a, b) {
  return cx(a.re + b.re, a.im + b.im);
}
function cMul(a, b) {
  return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}
// Bình phương độ lớn (magnitude squared) — CHÍNH LÀ xác suất đo được trạng
// thái đó (định đề đo lường Born rule): $P = |\alpha|^2 = \alpha \cdot \alpha^*$.
function cAbs2(a) {
  return a.re * a.re + a.im * a.im;
}

// ---------------------------------------------------------------------------
// Vector trạng thái N-qubit: mảng $2^N$ biên độ phức, chỉ số nhị phân của
// mảng ứng với trạng thái cơ sở (basis state) — vd với 2 qubit: index 0=|00⟩,
// 1=|01⟩, 2=|10⟩, 3=|11⟩. Khởi tạo luôn ở |00...0⟩ (biên độ 1 tại index 0).
// ---------------------------------------------------------------------------
function makeZeroState(numQubits) {
  const size = Math.pow(2, numQubits);
  const state = new Array(size).fill(null).map(() => cx(0, 0));
  state[0] = cx(1, 0);
  return state;
}

// Áp dụng MỘT cổng lượng tử 1-qubit (ma trận unita 2×2 số phức) lên qubit
// `qubitIndex` của hệ `numQubits` qubit. Mỗi cặp trạng thái cơ sở CHỈ khác
// nhau ở đúng 1 bit (qubit đang tác động) được biến đổi tuyến tính CÙNG
// nhau theo ma trận — đây chính là "song song lượng tử" hoạt động trên toàn
// bộ vector trạng thái CÙNG một lúc.
function applySingleQubitGate(state, matrix, qubitIndex, numQubits) {
  const size = state.length;
  const newState = new Array(size).fill(null).map(() => cx(0, 0));
  const bitPos = numQubits - 1 - qubitIndex;
  const mask = 1 << bitPos;
  for (let i = 0; i < size; i++) {
    const bit = i & mask ? 1 : 0;
    if (bit === 0) {
      const partner = i ^ mask;
      const [[a, b], [c, d]] = matrix;
      newState[i] = cAdd(newState[i], cAdd(cMul(a, state[i]), cMul(b, state[partner])));
      newState[partner] = cAdd(newState[partner], cAdd(cMul(c, state[i]), cMul(d, state[partner])));
    }
  }
  return newState;
}

// Cổng CNOT (Controlled-NOT, Mục 12.2): nếu qubit điều khiển (`controlIndex`)
// = |1⟩ thì LẬT (X) qubit đích (`targetIndex`), ngược lại giữ nguyên. Đây là
// cổng 2-qubit TẠO RA vướng víu lượng tử (entanglement) khi kết hợp với
// Hadamard (Mục 12.5 — mạch Bell kinh điển).
function applyCNOT(state, controlIndex, targetIndex, numQubits) {
  const size = state.length;
  const newState = state.slice();
  const controlBit = numQubits - 1 - controlIndex;
  const targetBit = numQubits - 1 - targetIndex;
  for (let i = 0; i < size; i++) {
    const cBit = (i >> controlBit) & 1;
    if (cBit === 1) {
      const flipped = i ^ (1 << targetBit);
      if (i < flipped) {
        const tmp = newState[i];
        newState[i] = newState[flipped];
        newState[flipped] = tmp;
      }
    }
  }
  return newState;
}

// Xác suất đo được MỖI trạng thái cơ sở (Born rule, Mục 12.4): $P_k =
// |\alpha_k|^2$. Hành động "đo" (measurement) làm SỤP ĐỔ (collapse) trạng
// thái chồng chập về MỘT trong các trạng thái cơ sở, với xác suất đúng
// bằng $P_k$ — sau khi đo, mọi thông tin chồng chập trước đó biến mất
// (Mục 12.4, pitfall trung tâm của cơ học lượng tử).
function measureProbabilities(state) {
  return state.map(cAbs2);
}

// ---------------------------------------------------------------------------
// Thư viện cổng lượng tử chuẩn (Mục 12.2): Hadamard (tạo chồng chập đều),
// Pauli X/Y/Z (tương tự phép quay 180° quanh 3 trục của quả cầu Bloch).
// ---------------------------------------------------------------------------
const SQRT1_2 = 1 / Math.sqrt(2);

// Hadamard: biến |0⟩ thành CHỒNG CHẬP đều (|0⟩+|1⟩)/√2 — nền tảng của MỌI
// thuật toán lượng tử cần khai thác song song (Shor, Grover, Mục 12.3).
const GATE_H = [
  [cx(SQRT1_2), cx(SQRT1_2)],
  [cx(SQRT1_2), cx(-SQRT1_2)],
];
// Pauli-X: "NOT lượng tử" — lật |0⟩↔|1⟩.
const GATE_X = [
  [cx(0), cx(1)],
  [cx(1), cx(0)],
];
// Pauli-Y: lật CẢ trạng thái LẪN pha (phần ảo) — hiếm dùng trực tiếp trong
// mạch cơ bản nhưng là 1 trong 3 phép quay Bloch chuẩn.
const GATE_Y = [
  [cx(0), cx(0, -1)],
  [cx(0, 1), cx(0)],
];
// Pauli-Z: giữ nguyên |0⟩, đảo PHA (không đảo xác suất) của |1⟩ thành -|1⟩.
const GATE_Z = [
  [cx(1), cx(0)],
  [cx(0), cx(-1)],
];

export {
  cx,
  cAdd,
  cMul,
  cAbs2,
  makeZeroState,
  applySingleQubitGate,
  applyCNOT,
  measureProbabilities,
  GATE_H,
  GATE_X,
  GATE_Y,
  GATE_Z,
};

// ---------------------------------------------------------------------------
// Self-test — chạy bằng `node quantum-sim.js`.
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
  function checkClose(name, got, exp, tol = 1e-9) {
    checkTrue(name + ' (got=' + got + ', ky vong=' + exp + ')', Math.abs(got - exp) < tol);
  }

  // --- Trạng thái ban đầu |0⟩: xac suat do duoc 0 = 100%, 1 = 0% ---
  {
    const s = makeZeroState(1);
    const probs = measureProbabilities(s);
    checkClose('Trang thai |0> ban dau: P(0) = 1', probs[0], 1);
    checkClose('Trang thai |0> ban dau: P(1) = 0', probs[1], 0);
  }

  // --- Hadamard tren |0>: chong chap DEU, P(0)=P(1)=0,5 ---
  {
    let s = makeZeroState(1);
    s = applySingleQubitGate(s, GATE_H, 0, 1);
    const probs = measureProbabilities(s);
    checkClose('H|0>: P(0) = 0,5 (chong chap deu)', probs[0], 0.5);
    checkClose('H|0>: P(1) = 0,5 (chong chap deu)', probs[1], 0.5);
    checkClose('H|0>: tong xac suat = 1 (dinh luat bao toan, |alpha|^2+|beta|^2=1)', probs[0] + probs[1], 1);
  }

  // --- Pauli-X tren |0>: lat hoan toan thanh |1>, P(1)=1 ---
  {
    let s = makeZeroState(1);
    s = applySingleQubitGate(s, GATE_X, 0, 1);
    const probs = measureProbabilities(s);
    checkClose('X|0>: P(0) = 0 (lat hoan toan)', probs[0], 0);
    checkClose('X|0>: P(1) = 1 (lat hoan toan)', probs[1], 1);
  }

  // --- Pauli-Z tren |1> (= X|0>): giu nguyen xac suat nhung dao PHA ---
  {
    let s = makeZeroState(1);
    s = applySingleQubitGate(s, GATE_X, 0, 1); // -> |1>
    s = applySingleQubitGate(s, GATE_Z, 0, 1); // -> -|1>
    checkClose('Z(X|0>): bien do cua |1> = -1 (dao pha, KHONG doi xac suat)', s[1].re, -1);
    checkClose('Z(X|0>): P(1) van = 1 (Z khong lam doi xac suat do)', measureProbabilities(s)[1], 1);
  }

  // --- Mach Bell kinh dien: H tren qubit 0, roi CNOT(0,1) tren |00> ---
  // Day la vi du VUONG VIU LUONG TU chuan (Mục 12.2, 12.5): 2 qubit sau
  // mach nay KHONG THE mo ta doc lap tung qubit rieng le nua.
  {
    let s = makeZeroState(2);
    s = applySingleQubitGate(s, GATE_H, 0, 2);
    s = applyCNOT(s, 0, 1, 2);
    const probs = measureProbabilities(s); // [P(00), P(01), P(10), P(11)]
    checkClose('Bell state: P(00) = 0,5', probs[0], 0.5);
    checkClose('Bell state: P(01) = 0 (khong bao gio do duoc trang thai nay)', probs[1], 0);
    checkClose('Bell state: P(10) = 0 (khong bao gio do duoc trang thai nay)', probs[2], 0);
    checkClose('Bell state: P(11) = 0,5', probs[3], 0.5);
    checkClose(
      'Bell state: tong xac suat = 1',
      probs.reduce((a, b) => a + b, 0),
      1
    );
    checkTrue(
      'Vuong viu luong tu: chi 2 trong 4 trang thai co the xay ra (00 hoac 11) - do 2 qubit lien ket voi nhau',
      probs[1] === 0 && probs[2] === 0
    );
  }

  // --- Mach Bell voi qubit dieu khien la qubit 1 (dao vai tro) - van cho ket qua tuong tu ---
  {
    let s = makeZeroState(2);
    s = applySingleQubitGate(s, GATE_H, 1, 2); // H tren qubit 1 thay vi qubit 0
    s = applyCNOT(s, 1, 0, 2); // dieu khien=1, dich=0
    const probs = measureProbabilities(s);
    checkClose('Bell state (dao vai tro qubit): P(00) = 0,5', probs[0], 0.5);
    checkClose('Bell state (dao vai tro qubit): P(11) = 0,5', probs[3], 0.5);
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
