// quantum-sim.js - "QuantumJS": a minimal quantum circuit simulator for
// Lesson 12 (quantum computing architecture). This is a SEPARATE MODULE and
// does NOT extend cpu-core.js, because quantum computation uses a COMPLETELY
// different mathematical model (complex state vectors, unitary matrices) from
// the classical binary logic running through Lessons 1-11. Same discipline as
// self-test at the end of the file runs with `node quantum-sim.js`.

// ---------------------------------------------------------------------------
// Minimal complex number: {re, im}. A quantum amplitude is ALWAYS complex -
// even in a simple 1-2 qubit circuit, the Pauli-Y gate needs the imaginary part.
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
// Magnitude squared - which IS the probability of measuring that state
// (the Born rule): $P = |\alpha|^2 = \alpha \cdot \alpha^*$.
function cAbs2(a) {
  return a.re * a.re + a.im * a.im;
}

// ---------------------------------------------------------------------------
// N-qubit state vector: an array of $2^N$ complex amplitudes, where the
// array index in binary is the basis state - for 2 qubits: index 0=|00>,
// 1=|01>, 2=|10>, 3=|11>. Always initialised to |00...0> (amplitude 1 at index 0).
// ---------------------------------------------------------------------------
function makeZeroState(numQubits) {
  const size = Math.pow(2, numQubits);
  const state = new Array(size).fill(null).map(() => cx(0, 0));
  state[0] = cx(1, 0);
  return state;
}

// Apply ONE 1-qubit gate (a complex 2x2 unitary matrix) to qubit
// `qubitIndex` of a `numQubits` system. Each pair of basis states differing in
// exactly 1 bit (the qubit being acted on) is transformed linearly TOGETHER by
// the matrix - this is "quantum parallelism" operating on the entire state
// vector AT ONCE.
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

// CNOT gate (controlled-NOT, section 12.2): if the control qubit (`controlIndex`)
// is |1> then FLIP (X) the target qubit (`targetIndex`), otherwise leave it. This
// is the 2-qubit gate that CREATES entanglement when combined with
// Hadamard (section 12.5 - the classic Bell circuit).
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

// Probability of measuring EACH basis state (Born rule, section 12.4): $P_k =
// |\alpha_k|^2$. The act of measurement COLLAPSES the superposed state to ONE
// of the basis states, with probability exactly $P_k$ - and afterwards all the
// prior superposition information is gone (section 12.4, the central pitfall of
// quantum mechanics).
function measureProbabilities(state) {
  return state.map(cAbs2);
}

// ---------------------------------------------------------------------------
// The standard gate library (section 12.2): Hadamard (creates an even
// superposition), Pauli X/Y/Z (180 degree rotations about the 3 Bloch axes).
// ---------------------------------------------------------------------------
const SQRT1_2 = 1 / Math.sqrt(2);

// Hadamard: turns |0> into the even SUPERPOSITION (|0>+|1>)/sqrt2 - the basis of
// EVERY quantum algorithm exploiting parallelism (Shor, Grover, section 12.3).
const GATE_H = [
  [cx(SQRT1_2), cx(SQRT1_2)],
  [cx(SQRT1_2), cx(-SQRT1_2)],
];
// Pauli-X: the "quantum NOT" - flips |0> and |1>.
const GATE_X = [
  [cx(0), cx(1)],
  [cx(1), cx(0)],
];
// Pauli-Y: flips BOTH the state AND the phase (imaginary part) - rarely used
// directly in basic circuits but one of the 3 standard Bloch rotations.
const GATE_Y = [
  [cx(0), cx(0, -1)],
  [cx(0, 1), cx(0)],
];
// Pauli-Z: leaves |0> alone and inverts the PHASE (not the probability) of |1>.
const GATE_Z = [
  [cx(1), cx(0)],
  [cx(0), cx(-1)],
];

// Section 12.4 - WHY NISQ cannot run Shor yet. Every quantum gate carries an
// error rate p. A circuit is only correct if EVERY gate is, so the probability
// of a trustworthy result is (1-p)^numGates - falling exponentially, not
// linearly. This is the number that makes a "100-qubit machine" unusable, not
// the qubit count.
function circuitSuccessProbability(gateErrorRate, numGates) {
  return Math.pow(1 - gateErrorRate, numGates);
}

// Error correction trades MANY physical qubits for ONE clean logical qubit. The
// surface code uses a lattice of distance d, needing ~d^2 physical qubits per
// logical qubit, and the logical error rate falls exponentially in d - but ONLY
// once the physical error rate is below threshold (~1%). Above it, adding qubits
function surfaceCodeOverhead(distance) {
  return { distance, physicalPerLogical: distance * distance };
}

// Total PHYSICAL qubits an algorithm needs once error correction is counted.
function physicalQubitsNeeded(logicalQubits, distance) {
  return logicalQubits * surfaceCodeOverhead(distance).physicalPerLogical;
}

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
  circuitSuccessProbability,
  surfaceCodeOverhead,
  physicalQubitsNeeded,
};

// ---------------------------------------------------------------------------
// Self-test - run with `node quantum-sim.js`.
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

  // --- Initial state |0>: P(measure 0) = 100%, P(measure 1) = 0% ---
  {
    const s = makeZeroState(1);
    const probs = measureProbabilities(s);
    checkClose('Initial state |0>: P(0) = 1', probs[0], 1);
    checkClose('Initial state |0>: P(1) = 0', probs[1], 0);
  }

  // --- Hadamard tren |0>: chong chap DEU, P(0)=P(1)=0,5 ---
  {
    let s = makeZeroState(1);
    s = applySingleQubitGate(s, GATE_H, 0, 1);
    const probs = measureProbabilities(s);
    checkClose('H|0>: P(0) = 0.5 (an even superposition)', probs[0], 0.5);
    checkClose('H|0>: P(1) = 0.5 (an even superposition)', probs[1], 0.5);
    checkClose('H|0>: total probability = 1 (conservation, |alpha|^2+|beta|^2=1)', probs[0] + probs[1], 1);
  }

  // --- Pauli-X tren |0>: lat hoan toan thanh |1>, P(1)=1 ---
  {
    let s = makeZeroState(1);
    s = applySingleQubitGate(s, GATE_X, 0, 1);
    const probs = measureProbabilities(s);
    checkClose('X|0>: P(0) = 0 (a complete flip)', probs[0], 0);
    checkClose('X|0>: P(1) = 1 (a complete flip)', probs[1], 1);
  }

  // --- Pauli-Z tren |1> (= X|0>): giu nguyen xac suat nhung dao PHA ---
  {
    let s = makeZeroState(1);
    s = applySingleQubitGate(s, GATE_X, 0, 1); // -> |1>
    s = applySingleQubitGate(s, GATE_Z, 0, 1); // -> -|1>
    checkClose('Z(X|0>): the amplitude of |1> = -1 (a phase flip, NOT a probability change)', s[1].re, -1);
    checkClose('Z(X|0>): P(1) is still 1 (Z does not change measurement probabilities)', measureProbabilities(s)[1], 1);
  }

  // --- Mach Bell kinh dien: H tren qubit 0, roi CNOT(0,1) tren |00> ---
  // This is the standard ENTANGLEMENT example (sections 12.2, 12.5): 2 qubits
  // mach nay KHONG THE mo ta doc lap tung qubit rieng le nua.
  {
    let s = makeZeroState(2);
    s = applySingleQubitGate(s, GATE_H, 0, 2);
    s = applyCNOT(s, 0, 1, 2);
    const probs = measureProbabilities(s); // [P(00), P(01), P(10), P(11)]
    checkClose('Bell state: P(00) = 0,5', probs[0], 0.5);
    checkClose('Bell state: P(01) = 0 (this state can never be measured)', probs[1], 0);
    checkClose('Bell state: P(10) = 0 (this state can never be measured)', probs[2], 0);
    checkClose('Bell state: P(11) = 0,5', probs[3], 0.5);
    checkClose(
      'Bell state: total probability = 1',
      probs.reduce((a, b) => a + b, 0),
      1
    );
    checkTrue(
      'Entanglement: only 2 of the 4 states can occur (00 or 11) - because the 2 qubits are linked',
      probs[1] === 0 && probs[2] === 0
    );
  }

  // --- Mach Bell voi qubit dieu khien la qubit 1 (dao vai tro) - van cho ket qua tuong tu ---
  {
    let s = makeZeroState(2);
    s = applySingleQubitGate(s, GATE_H, 1, 2); // H tren qubit 1 thay vi qubit 0
    s = applyCNOT(s, 1, 0, 2); // dieu khien=1, dich=0
    const probs = measureProbabilities(s);
    checkClose('Bell state (roles reversed): P(00) = 0.5', probs[0], 0.5);
    checkClose('Bell state (roles reversed): P(11) = 0.5', probs[3], 0.5);
  }

  // --- Muc 12.4: vi sao NISQ chua chay noi Shor ---
  {
    // Ty le loi 0,1%/cong la con so TOT cho phan cung hom nay.
    const p = 0.001;
    checkClose(
      'A 100-gate circuit at 0.1% error per gate: 90.48% chance of a correct result',
      circuitSuccessProbability(p, 100),
      0.904792,
      1e-5
    );
    checkClose('A 1,000-gate circuit: down to 36.77%', circuitSuccessProbability(p, 1000), 0.367695, 1e-5);
    checkTrue(
      'A 10,000-gate circuit: 0.0045% - the result is almost certainly noise, on the SAME hardware',
      circuitSuccessProbability(p, 10000) < 0.0001
    );
    checkTrue(
      'The key point: 100 times more gates cuts the success probability by more than 20,000 times - it degrades EXPONENTIALLY, not linearly',
      0.904792 / circuitSuccessProbability(p, 10000) > 20000
    );
    // Muon giu 90% thanh cong o 10.000 cong thi phai ha loi xuong 1e-5,
    // tuc TOT HON 100 LAN so voi phan cung hien tai.
    checkClose(
      'To keep 90% at 10,000 gates the error rate must reach 0.001% - 100 times better',
      circuitSuccessProbability(1e-5, 10000),
      0.904837,
      1e-5
    );

    // Sua loi doi qubit vat ly lay qubit logic.
    check(
      'Surface code at distance 25: 625 physical qubits for ONE logical qubit',
      surfaceCodeOverhead(25).physicalPerLogical,
      625
    );
    check(
      'Breaking RSA-2048 needs ~4,000 logical qubits -> 2,500,000 PHYSICAL qubits (surface code d=25)',
      physicalQubitsNeeded(4000, 25),
      2500000
    );
    checkTrue(
      'For comparison: the best hardware today has around 1,000 physical qubits - a shortfall of more than 3 orders of magnitude',
      physicalQubitsNeeded(4000, 25) / 1000 > 1000
    );
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
