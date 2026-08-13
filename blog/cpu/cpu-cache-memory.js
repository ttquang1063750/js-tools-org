// cpu-cache-memory.js — the demo for Lesson 7 (caches & the memory hierarchy):
// splits an address into tag/index/offset directly, and runs sample address
// traces through REAL direct-mapped / set-associative caches (from cpu-core.js)
// to show the hits and misses.
//
// This file is shared by BOTH locales, so every string it writes into the DOM has
// to follow the page language — otherwise the English page shows the scenario
// list and the results in Vietnamese at runtime.
const STRINGS = {
  vi: {
    miss: 'Miss',
    rate: 'tỷ lệ',
    address: 'Địa chỉ',
    rowMajor: 'Duyệt mảng 8×8 theo HÀNG (row-major, spatial locality tốt) — Direct-Mapped',
    colMajor: 'Duyệt mảng 8×8 theo CỘT (column-major, spatial locality mất) — Direct-Mapped',
    conflict: 'Conflict Miss: 2 địa chỉ trùng index, khác tag — Direct-Mapped (đá nhau liên tục)',
    conflict2w: 'CÙNG 2 địa chỉ đó — Set-Associative 2-way (giữ được cả hai)',
  },
  en: {
    miss: 'Miss',
    rate: 'rate',
    address: 'Address',
    rowMajor: 'Walking the 8×8 array BY ROW (row-major, good spatial locality) — direct-mapped',
    colMajor: 'Walking the 8×8 array BY COLUMN (column-major, locality lost) — direct-mapped',
    conflict: 'Conflict miss: 2 addresses, same index, different tags — direct-mapped (evicting each other)',
    conflict2w: 'The SAME 2 addresses — 2-way set-associative (both fit)',
  },
};
// <html lang> is set per locale by the page itself, so it is the reliable source.
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];
import { splitAddress, makeDirectMappedCache, makeSetAssociativeCache, runCacheTrace } from './cpu-core.js';

const R = 8;
const C = 8;
const ELEM = 4;
function addrOf(row, col) {
  return (row * C + col) * ELEM;
}
const rowMajorAddrs = [];
for (let row = 0; row < R; row++) for (let col = 0; col < C; col++) rowMajorAddrs.push(addrOf(row, col));
const colMajorAddrs = [];
for (let col = 0; col < C; col++) for (let row = 0; row < R; row++) colMajorAddrs.push(addrOf(row, col));

const OFFSET_BITS = 4;
const NUM_SETS = 4;
const LINE_SIZE = 16;
const conflictAddrs = [];
for (let i = 0; i < 10; i++) {
  conflictAddrs.push(0);
  conflictAddrs.push(NUM_SETS * LINE_SIZE);
}

const SCENARIOS = {
  rowMajor: {
    label: T.rowMajor,
    build: () => makeDirectMappedCache(NUM_SETS, OFFSET_BITS),
    addrs: rowMajorAddrs,
  },
  colMajor: {
    label: T.colMajor,
    build: () => makeDirectMappedCache(NUM_SETS, OFFSET_BITS),
    addrs: colMajorAddrs,
  },
  conflictDM: {
    label: T.conflict,
    build: () => makeDirectMappedCache(NUM_SETS, OFFSET_BITS),
    addrs: conflictAddrs,
  },
  conflict2Way: {
    label: T.conflict2w,
    build: () => makeSetAssociativeCache(NUM_SETS, 2, OFFSET_BITS),
    addrs: conflictAddrs,
  },
};

function renderTrace(result) {
  const cells = result.trace
    .map(
      (r) =>
        `<span class="cache-cell ${r === 'HIT' ? 'cache-cell--hit' : 'cache-cell--miss'}">${r === 'HIT' ? 'H' : 'M'}</span>`
    )
    .join('');
  return `
    <div class="cache-trace">${cells}</div>
    <div class="cache-stat">${T.miss}: <strong>${result.misses}/${result.total}</strong> (${T.rate} ${(result.missRate * 100).toFixed(1)}%)</div>
  `;
}

function initCacheTraceDemo() {
  const select = document.getElementById('cache-scenario-select');
  const output = document.getElementById('cache-trace-output');
  if (!select || !output) return;

  function run() {
    const scenario = SCENARIOS[select.value];
    const cache = scenario.build();
    const result = runCacheTrace(cache, scenario.addrs);
    output.innerHTML = renderTrace(result);
  }

  select.addEventListener('change', run);
  run();
}

function initAddressSplitter() {
  const addrInput = document.getElementById('cache-addr-input');
  const offsetBitsInput = document.getElementById('cache-offset-bits-input');
  const indexBitsInput = document.getElementById('cache-index-bits-input');
  const output = document.getElementById('cache-split-output');
  if (!addrInput || !output) return;

  function run() {
    const address = parseInt(addrInput.value, 16) || 0;
    const offsetBits = parseInt(offsetBitsInput.value, 10);
    const indexBits = parseInt(indexBitsInput.value, 10);
    const { tag, index, offset } = splitAddress(address, offsetBits, indexBits);
    output.textContent = `${T.address} 0x${address.toString(16)} -> Tag=0x${tag.toString(16)} · Index=0x${index.toString(16)} · Offset=0x${offset.toString(16)}`;
  }

  [addrInput, offsetBitsInput, indexBitsInput].forEach((el) => el.addEventListener('input', run));
  run();
}

initCacheTraceDemo();
initAddressSplitter();
