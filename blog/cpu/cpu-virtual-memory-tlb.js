// cpu-virtual-memory-tlb.js — Lesson 8's demo (virtual memory & the TLB):
// translates a chosen virtual address through the REAL TLB + Page Table (from
// cpu-core.js), plus a single-level vs two-level page table size calculator.
//
// One file serves both locales, so every visible string goes through STRINGS and
// is picked by <html lang>, which the page itself sets per locale.
import {
  splitVirtualAddress,
  makeTLB,
  translateAddress,
  singleLevelPageTableSizeBytes,
  twoLevelPageTableSizeBytes,
} from './cpu-core.js';

const IS_EN = document.documentElement.lang === 'en';
const STRINGS = {
  vi: {
    notMapped: 'VPN chưa được ánh xạ',
    tlbMissWalk: 'TLB MISS, tra Page Table',
    sizes: (one, used, two, ratio) =>
      `Đơn cấp: ${one} · 2 cấp (${used} trang dùng): ${two} · Tỷ lệ tiết kiệm: ${ratio}x`,
  },
  en: {
    notMapped: 'this VPN is not mapped',
    tlbMissWalk: 'TLB MISS, page table walk',
    sizes: (one, used, two, ratio) =>
      `Single-level: ${one} · Two-level (${used} pages in use): ${two} · Saving: ${ratio}x`,
  },
};
const T = STRINGS[IS_EN ? 'en' : 'vi'];

const PAGE_OFFSET_BITS = 12; // trang 4KB
const PAGE_TABLE = new Map([
  [5, 100],
  [6, 200],
  [9, 300],
]);
const tlb = makeTLB(4);
const accessLog = [];

function initTranslateDemo() {
  const addrInput = document.getElementById('vm-addr-input');
  const runBtn = document.getElementById('vm-translate-btn');
  const resetBtn = document.getElementById('vm-reset-tlb-btn');
  const output = document.getElementById('vm-translate-output');
  const logOutput = document.getElementById('vm-access-log');
  if (!addrInput || !runBtn) return;

  function renderLog() {
    logOutput.innerHTML = accessLog
      .map(
        (entry) =>
          `<div class="vm-log-row ${entry.pageFault ? 'vm-log-row--fault' : entry.tlbHit ? 'vm-log-row--hit' : 'vm-log-row--miss'}">${entry.text}</div>`
      )
      .join('');
  }

  function run() {
    const va = parseInt(addrInput.value, 16) || 0;
    const { vpn, offset } = splitVirtualAddress(va, PAGE_OFFSET_BITS);
    const result = translateAddress(va, PAGE_OFFSET_BITS, tlb, PAGE_TABLE);
    if (result.pageFault) {
      output.textContent = `VA 0x${va.toString(16)} -> VPN=${vpn} -> PAGE FAULT (${T.notMapped})`;
      accessLog.push({ pageFault: true, text: `0x${va.toString(16)} (VPN ${vpn}): PAGE FAULT` });
    } else {
      output.textContent = `VA 0x${va.toString(16)} -> VPN=${vpn}, offset=0x${offset.toString(16)} -> PA=0x${result.physicalAddress.toString(16)} (${result.tlbHit ? 'TLB HIT' : T.tlbMissWalk})`;
      accessLog.push({
        tlbHit: result.tlbHit,
        text: `0x${va.toString(16)} (VPN ${vpn}): ${result.tlbHit ? 'TLB HIT' : 'TLB MISS -> Page Table'} -> PA 0x${result.physicalAddress.toString(16)}`,
      });
    }
    renderLog();
  }

  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', () => {
    accessLog.length = 0;
    renderLog();
    output.textContent = '—';
  });
}

function initPageTableSizeCalc() {
  const addressBitsInput = document.getElementById('vm-address-bits-input');
  const pageOffsetInput = document.getElementById('vm-page-offset-input');
  const entryBytesInput = document.getElementById('vm-entry-bytes-input');
  const usedPagesInput = document.getElementById('vm-used-pages-input');
  const output = document.getElementById('vm-size-output');
  if (!addressBitsInput || !output) return;

  function formatBytes(bytes) {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  }

  function run() {
    const addressBits = parseInt(addressBitsInput.value, 10);
    const pageOffsetBits = parseInt(pageOffsetInput.value, 10);
    const entryBytes = parseInt(entryBytesInput.value, 10);
    const usedPages = parseInt(usedPagesInput.value, 10);
    const entriesPerTable = Math.pow(2, 10); // 10-bit index per level, x86 style

    const single = singleLevelPageTableSizeBytes(addressBits, pageOffsetBits, entryBytes);
    const twoLevel = twoLevelPageTableSizeBytes(usedPages, entriesPerTable, entryBytes);

    output.textContent = T.sizes(formatBytes(single), usedPages, formatBytes(twoLevel), (single / twoLevel).toFixed(1));
  }

  [addressBitsInput, pageOffsetInput, entryBytesInput, usedPagesInput].forEach((el) =>
    el.addEventListener('input', run)
  );
  run();
}

initTranslateDemo();
initPageTableSizeCalc();
