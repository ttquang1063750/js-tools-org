// The 4-bit ALU demo for Lesson 1 — this file is only "DOM glue": every
// arithmetic result and status flag is delegated to the shared cpu-core.js engine
// (one single source of truth, verified by `node cpu-core.js`). This file does NOT
// recompute the ALU itself, so it cannot drift away from the engine.
//
// This file is shared by BOTH locales, so the few strings it writes into the DOM
// have to follow the page language. Without this, the English page showed the
// simulator labels in Vietnamese at runtime.
import { aluExecute, toSigned, toBinString, ALU_OPS } from './cpu-core.js';

const STRINGS = {
  vi: { decimal: 'Thập phân', signed: 'Có dấu' },
  en: { decimal: 'Decimal', signed: 'signed' },
};
// <html lang> is set per locale by the page itself, so it is the reliable source.
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];

function initAluDemo() {
  // State
  let valA = 5; // 0101
  let valB = 3; // 0011
  let opIndex = 0; // 0: ADD, 1: SUB, 2: AND, 3: OR, 4: XOR (matches ALU_OPS)

  // DOM
  const switchesA = document.querySelectorAll('#switches-a .bit-switch-btn');
  const switchesB = document.querySelectorAll('#switches-b .bit-switch-btn');
  const selectOp = document.getElementById('sim-opcode');
  if (!switchesA.length || !selectOp) return; // page has no demo -> nothing to do

  const labelDecA = document.getElementById('label-dec-a');
  const labelDecB = document.getElementById('label-dec-b');
  const dispBinA = document.getElementById('disp-bin-a');
  const dispBinB = document.getElementById('disp-bin-b');
  const dispBinRes = document.getElementById('disp-bin-res');
  const dispSignedRes = document.getElementById('disp-signed-res');
  const flagZ = document.getElementById('flag-z');
  const flagS = document.getElementById('flag-s');
  const flagC = document.getElementById('flag-c');
  const flagV = document.getElementById('flag-v');

  // SVG paths
  const lineInputA = document.getElementById('line-input-a');
  const lineInputB = document.getElementById('line-input-b');
  const lineAToLogical = document.getElementById('line-a-to-logical');
  const lineBToLogical = document.getElementById('line-b-to-logical');
  const blockArith = document.getElementById('block-arith');
  const blockLogic = document.getElementById('block-logic');
  const lineArithOut = document.getElementById('line-arith-out');
  const lineLogicOut = document.getElementById('line-logic-out');
  const lineCtrl = document.getElementById('line-ctrl');
  const lineOut = document.getElementById('line-out');
  const lineFlagTap = document.getElementById('line-flag-tap');

  function updateSwitches() {
    switchesA.forEach((btn) => {
      const bit = parseInt(btn.getAttribute('data-bit'));
      const isSet = (valA & (1 << bit)) !== 0;
      btn.textContent = isSet ? '1' : '0';
      btn.classList.toggle('active', isSet);
    });
    switchesB.forEach((btn) => {
      const bit = parseInt(btn.getAttribute('data-bit'));
      const isSet = (valB & (1 << bit)) !== 0;
      btn.textContent = isSet ? '1' : '0';
      btn.classList.toggle('active', isSet);
    });
  }

  function updateALU() {
    labelDecA.innerHTML = `${T.decimal}: <strong>${valA}</strong> (${T.signed}: <strong>${toSigned(valA, 4)}</strong>)`;
    labelDecB.innerHTML = `${T.decimal}: <strong>${valB}</strong> (${T.signed}: <strong>${toSigned(valB, 4)}</strong>)`;
    dispBinA.textContent = toBinString(valA, 4);
    dispBinB.textContent = toBinString(valB, 4);

    // -- Every computed value and flag comes from the cpu-core.js engine --
    const op = ALU_OPS[opIndex];
    const { result, flags } = aluExecute(valA, valB, op, 4);

    dispBinRes.innerHTML = `<strong>${toBinString(result, 4)}</strong> (${result})`;
    dispSignedRes.innerHTML = `<strong>${toSigned(result, 4)}</strong>`;

    flagZ.className = 'flag-indicator' + (flags.z ? ' active' : '');
    flagS.className = 'flag-indicator' + (flags.s ? ' active' : '');
    flagC.className = 'flag-indicator c-flag' + (flags.c ? ' active' : '');
    flagV.className = 'flag-indicator' + (flags.v ? ' active' : '');

    // Highlight the active path in the block diagram for this kind of operation.
    const isArith = op === 'ADD' || op === 'SUB';
    const isLogic = op === 'AND' || op === 'OR' || op === 'XOR';

    blockArith.classList.toggle('active', isArith);
    lineInputA.classList.toggle('active', isArith);
    lineInputB.classList.toggle('active', isArith);
    lineArithOut.classList.toggle('active', isArith);

    blockLogic.classList.toggle('active', isLogic);
    lineAToLogical.classList.toggle('active', isLogic);
    lineBToLogical.classList.toggle('active', isLogic);
    lineLogicOut.classList.toggle('active', isLogic);

    lineCtrl.classList.add('active');
    lineOut.classList.add('active');
    lineFlagTap.classList.add('active');
  }

  switchesA.forEach((btn) => {
    btn.addEventListener('click', () => {
      valA ^= 1 << parseInt(btn.getAttribute('data-bit'));
      updateSwitches();
      updateALU();
    });
  });
  switchesB.forEach((btn) => {
    btn.addEventListener('click', () => {
      valB ^= 1 << parseInt(btn.getAttribute('data-bit'));
      updateSwitches();
      updateALU();
    });
  });
  selectOp.addEventListener('change', (e) => {
    opIndex = parseInt(e.target.value);
    updateALU();
  });

  updateSwitches();
  updateALU();
}

// Module scripts are always deferred, so the DOM is parsed by now. The
// DOMContentLoaded branch is kept in case the module is ever loaded early.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAluDemo);
} else {
  initAluDemo();
}
