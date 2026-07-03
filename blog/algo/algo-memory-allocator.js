/* Bài 9: Memory Allocator Visualizer — First/Best/Worst-Fit + coalescing */
(function () {
  const canvas = document.getElementById('mem-canvas');
  if (!canvas) return; // page without the sandbox

  const sizeInput = document.getElementById('mem-size-input');
  const strategySelect = document.getElementById('mem-strategy-select');
  const allocBtn = document.getElementById('mem-alloc-btn');
  const randomBtn = document.getElementById('mem-random-btn');
  const resetBtn = document.getElementById('mem-reset-btn');
  const logEl = document.getElementById('mem-log');
  const statFree = document.getElementById('mem-stat-free');
  const statLargest = document.getElementById('mem-stat-largest');
  const statFrag = document.getElementById('mem-stat-frag');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 600;
  const CSS_H = 360;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  const HEAP_SIZE = 200;
  const MARGIN = 10;
  const BAR_W = CSS_W - 2 * MARGIN;
  const BAR_Y = 40;
  const BAR_H = 100;
  const PX_PER_UNIT = BAR_W / HEAP_SIZE;

  const COLORS = [
    '#d946ef',
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#a855f7',
    '#eab308',
    '#f43f5e',
    '#14b8a6',
  ];

  let freeList = [{ start: 0, size: HEAP_SIZE }];
  let allocated = []; // { id, start, size, color }
  let nextId = 1;

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  function coalesce() {
    freeList.sort((a, b) => a.start - b.start);
    for (let i = 0; i < freeList.length - 1; i++) {
      const cur = freeList[i];
      const next = freeList[i + 1];
      if (cur.start + cur.size === next.start) {
        cur.size += next.size;
        freeList.splice(i + 1, 1);
        i--;
      }
    }
  }

  function findBlock(size, strategy) {
    let candidate = null;
    for (const block of freeList) {
      if (block.size < size) continue;
      if (strategy === 'first') {
        return block;
      } else if (strategy === 'best') {
        if (!candidate || block.size < candidate.size) candidate = block;
      } else if (strategy === 'worst') {
        if (!candidate || block.size > candidate.size) candidate = block;
      }
    }
    return candidate;
  }

  function allocate(size, strategy) {
    const block = findBlock(size, strategy);
    if (!block) {
      log('Cấp phát ' + size + ' byte THẤT BẠI — không có khối trống đủ lớn (' + strategy + ').');
      return false;
    }
    const id = nextId++;
    const color = COLORS[(id - 1) % COLORS.length];
    const allocStart = block.start; // chụp lại địa chỉ TRƯỚC khi block bị mutate
    allocated.push({ id, start: allocStart, size, color });

    if (block.size === size) {
      freeList = freeList.filter((b) => b !== block);
    } else {
      block.start += size;
      block.size -= size;
    }
    log('Cấp phát #' + id + ': ' + size + ' byte tại địa chỉ ' + allocStart + ' (' + strategy + '-fit).');
    return true;
  }

  function freeBlock(id) {
    const idx = allocated.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const block = allocated[idx];
    allocated.splice(idx, 1);
    freeList.push({ start: block.start, size: block.size });
    coalesce();
    log('Giải phóng #' + id + ' (' + block.size + ' byte) — đã gộp khối liền kề nếu có.');
  }

  function stats() {
    const totalFree = freeList.reduce((s, b) => s + b.size, 0);
    const largest = freeList.reduce((m, b) => Math.max(m, b.size), 0);
    const frag = totalFree > 0 ? (1 - largest / totalFree) * 100 : 0;
    return { totalFree, largest, frag };
  }

  function updateStats() {
    const s = stats();
    statFree.textContent = String(s.totalFree);
    statLargest.textContent = String(s.largest);
    statFrag.textContent = s.frag.toFixed(0) + '%';
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    // Draw base (all free, dark)
    ctx.fillStyle = '#0f0f1b';
    ctx.fillRect(MARGIN, BAR_Y, BAR_W, BAR_H);

    // Draw allocated blocks
    allocated.forEach((a) => {
      const x = MARGIN + a.start * PX_PER_UNIT;
      const w = a.size * PX_PER_UNIT;
      ctx.fillStyle = a.color;
      ctx.fillRect(x, BAR_Y, w, BAR_H);
      ctx.strokeStyle = '#1e1e2e';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, BAR_Y, w, BAR_H);
      if (w > 20) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#' + a.id, x + w / 2, BAR_Y + BAR_H / 2 - 6);
        ctx.font = '9px monospace';
        ctx.fillText(a.size + 'B', x + w / 2, BAR_Y + BAR_H / 2 + 8);
      }
    });

    // Draw free block borders (for visual separation)
    freeList.forEach((b) => {
      const x = MARGIN + b.start * PX_PER_UNIT;
      const w = b.size * PX_PER_UNIT;
      ctx.strokeStyle = '#45475a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, BAR_Y, w, BAR_H);
      if (w > 24) {
        ctx.fillStyle = '#6c7086';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.size + 'B trống', x + w / 2, BAR_Y + BAR_H / 2);
      }
    });

    // Legend / free list summary below the bar
    ctx.fillStyle = '#a6adc8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      'Free list: ' + freeList.map((b) => '[' + b.start + '-' + (b.start + b.size) + ')').join(' '),
      MARGIN,
      BAR_Y + BAR_H + 30
    );
  }

  function updateJsCodeDisplay(action) {
    const s = stats();
    const code =
      '/* 💾 BÀI 9: MEMORY ALLOCATOR — ' +
      (action || 'INIT').toUpperCase() +
      ' */\n\n' +
      'function allocate(size, strategy) {\n' +
      '  const block = findBlock(freeList, size, strategy); // first/best/worst\n' +
      '  if (!block) return null; // hết bộ nhớ liền kề đủ lớn\n' +
      '  // ... tách khối, cập nhật freeList ...\n' +
      '}\n\n' +
      'function free(id) {\n' +
      '  // ... đưa khối về freeList ...\n' +
      '  coalesce(freeList); // GỘP khối liền kề ngay lập tức\n' +
      '}\n\n' +
      '// Heap 200 byte — Tổng trống: ' +
      s.totalFree +
      'B, khối lớn nhất: ' +
      s.largest +
      'B\n' +
      '// Phân mảnh ngoài: ' +
      s.frag.toFixed(1) +
      '%';

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  canvas.addEventListener('click', (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    if (y < BAR_Y || y > BAR_Y + BAR_H) return;
    const addr = (x - MARGIN) / PX_PER_UNIT;
    const hit = allocated.find((a) => addr >= a.start && addr < a.start + a.size);
    if (hit) {
      clearLog();
      freeBlock(hit.id);
      draw();
      updateStats();
      updateJsCodeDisplay('free #' + hit.id);
    }
  });

  allocBtn.addEventListener('click', () => {
    const size = parseInt(sizeInput.value, 10);
    if (isNaN(size) || size <= 0) return;
    clearLog();
    allocate(size, strategySelect.value);
    draw();
    updateStats();
    updateJsCodeDisplay('allocate ' + size);
  });

  randomBtn.addEventListener('click', () => {
    clearLog();
    freeList = [{ start: 0, size: HEAP_SIZE }];
    allocated = [];
    nextId = 1;
    const strategy = strategySelect.value;
    const ids = [];
    for (let i = 0; i < 8; i++) {
      const size = 10 + Math.floor(Math.random() * 25);
      const before = allocated.length;
      allocate(size, strategy);
      if (allocated.length > before) ids.push(allocated[allocated.length - 1].id);
    }
    // Free every other block to create fragmentation
    ids.forEach((id, i) => {
      if (i % 2 === 1) freeBlock(id);
    });
    draw();
    updateStats();
    updateJsCodeDisplay('random stress');
  });

  resetBtn.addEventListener('click', () => {
    freeList = [{ start: 0, size: HEAP_SIZE }];
    allocated = [];
    nextId = 1;
    clearLog();
    log('Đã reset heap về 200 byte trống.');
    draw();
    updateStats();
    updateJsCodeDisplay('reset');
  });

  log('Sẵn sàng. Heap 200 byte, hoàn toàn trống.');
  draw();
  updateStats();
  updateJsCodeDisplay('init');
})();
