// Trang ton tai o ca hai ngon ngu; moi chuoi file nay bom vao DOM phai theo
// ngon ngu cua TRANG, khong theo tac gia - neu khong ban EN se hien tieng Viet
// ngay giua phan thuc hanh.
const STRINGS = {
  vi: { amplitude: 'biên độ', noGates: '(chưa áp dụng cổng nào)' },
  en: { amplitude: 'amplitude', noGates: '(no gates applied yet)' },
};
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];
// cpu-quantum-computing.js - Lesson 12 demo (quantum computing): an
// interactive 2-qubit quantum circuit, using the REAL engine (quantum-sim.js,
// a separate module - it does NOT use cpu-core.js).
import {
  makeZeroState,
  applySingleQubitGate,
  applyCNOT,
  measureProbabilities,
  GATE_H,
  GATE_X,
  GATE_Y,
  GATE_Z,
} from './quantum-sim.js';

const NUM_QUBITS = 2;
let state = makeZeroState(NUM_QUBITS);
const gateLog = [];

function formatAmplitude(a) {
  const re = a.re.toFixed(3);
  const im = a.im;
  if (Math.abs(im) < 1e-9) return re;
  return `${re}${im >= 0 ? '+' : ''}${im.toFixed(3)}i`;
}

function render() {
  const probs = measureProbabilities(state);
  const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
  const output = document.getElementById('qc-output');
  const barsEl = document.getElementById('qc-bars');
  const logEl = document.getElementById('qc-log');

  output.innerHTML = labels
    .map(
      (l, i) => `<div>${l}: ${T.amplitude} = ${formatAmplitude(state[i])} · P = ${(probs[i] * 100).toFixed(1)}%</div>`
    )
    .join('');

  barsEl.innerHTML = labels
    .map(
      (l, i) => `
    <div class="qc-bar-row">
      <span class="qc-bar-label">${l}</span>
      <div class="qc-bar-track"><div class="qc-bar-fill" style="width:${(probs[i] * 100).toFixed(1)}%"></div></div>
      <span class="qc-bar-pct">${(probs[i] * 100).toFixed(1)}%</span>
    </div>`
    )
    .join('');

  logEl.textContent = gateLog.length ? gateLog.join(' → ') : T.noGates;
}

function applyGate(name, fn) {
  state = fn(state);
  gateLog.push(name);
  render();
}

function initCircuitDemo() {
  const buttons = {
    'qc-h0-btn': () => applyGate('H(q0)', (s) => applySingleQubitGate(s, GATE_H, 0, NUM_QUBITS)),
    'qc-h1-btn': () => applyGate('H(q1)', (s) => applySingleQubitGate(s, GATE_H, 1, NUM_QUBITS)),
    'qc-x0-btn': () => applyGate('X(q0)', (s) => applySingleQubitGate(s, GATE_X, 0, NUM_QUBITS)),
    'qc-x1-btn': () => applyGate('X(q1)', (s) => applySingleQubitGate(s, GATE_X, 1, NUM_QUBITS)),
    'qc-y0-btn': () => applyGate('Y(q0)', (s) => applySingleQubitGate(s, GATE_Y, 0, NUM_QUBITS)),
    'qc-y1-btn': () => applyGate('Y(q1)', (s) => applySingleQubitGate(s, GATE_Y, 1, NUM_QUBITS)),
    'qc-z0-btn': () => applyGate('Z(q0)', (s) => applySingleQubitGate(s, GATE_Z, 0, NUM_QUBITS)),
    'qc-z1-btn': () => applyGate('Z(q1)', (s) => applySingleQubitGate(s, GATE_Z, 1, NUM_QUBITS)),
    'qc-cnot01-btn': () => applyGate('CNOT(q0→q1)', (s) => applyCNOT(s, 0, 1, NUM_QUBITS)),
    'qc-cnot10-btn': () => applyGate('CNOT(q1→q0)', (s) => applyCNOT(s, 1, 0, NUM_QUBITS)),
    'qc-bell-btn': () =>
      applyGate('[Bell: H(q0)→CNOT(q0→q1)]', (s) =>
        applyCNOT(applySingleQubitGate(s, GATE_H, 0, NUM_QUBITS), 0, 1, NUM_QUBITS)
      ),
  };

  Object.entries(buttons).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  });

  const resetBtn = document.getElementById('qc-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state = makeZeroState(NUM_QUBITS);
      gateLog.length = 0;
      render();
    });
  }

  render();
}

initCircuitDemo();
