/* Bài 10: Hash Table Visualizer — Separate Chaining vs Linear/Quadratic Probing */
(function () {
  const canvas = document.getElementById('hash-canvas');
  if (!canvas) return; // page without the sandbox

  const keyInput = document.getElementById('hash-key-input');
  const strategySelect = document.getElementById('hash-strategy-select');
  const insertBtn = document.getElementById('hash-insert-btn');
  const randomBtn = document.getElementById('hash-random-btn');
  const rehashBtn = document.getElementById('hash-rehash-btn');
  const resetBtn = document.getElementById('hash-reset-btn');
  const logEl = document.getElementById('hash-log');
  const statSize = document.getElementById('hash-stat-size');
  const statCount = document.getElementById('hash-stat-count');
  const statLoad = document.getElementById('hash-stat-load');
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

  const MARGIN = 10;
  const BAR_W = CSS_W - 2 * MARGIN;
  const INITIAL_SIZE = 7;

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

  const TOMBSTONE = { tombstone: true };

  let tableSize = INITIAL_SIZE;
  let strategy = 'chaining';
  let buckets = makeBuckets(tableSize);
  let slots = makeSlots(tableSize);

  function makeBuckets(size) {
    return Array.from({ length: size }, () => []);
  }
  function makeSlots(size) {
    return new Array(size).fill(null);
  }

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  function colorFor(key) {
    return COLORS[key % COLORS.length];
  }

  function insertChaining(key) {
    const idx = key % tableSize;
    const bucket = buckets[idx];
    if (bucket.includes(key)) {
      log('h(' + key + ') = ' + idx + ' — khoá đã tồn tại trong bucket, bỏ qua.');
      return;
    }
    if (bucket.length > 0) {
      log('h(' + key + ') = ' + idx + ' — VA CHẠM với ' + bucket.length + ' khoá đã có, nối thêm vào chain.');
    } else {
      log('h(' + key + ') = ' + idx + ' — bucket trống, chèn trực tiếp.');
    }
    bucket.push(key);
  }

  function insertOpenAddressing(key) {
    const start = key % tableSize;
    for (let i = 0; i < tableSize; i++) {
      const idx = strategy === 'quadratic' ? (start + i * i) % tableSize : (start + i) % tableSize;
      const cur = slots[idx];
      if (cur === key) {
        log('h(' + key + ') = ' + start + ', thử vị trí ' + idx + ' (i=' + i + ') — khoá đã tồn tại, bỏ qua.');
        return;
      }
      if (cur === null || cur === TOMBSTONE) {
        if (i === 0) {
          log('h(' + key + ') = ' + idx + ' — vị trí trống, chèn trực tiếp.');
        } else {
          log('h(' + key + ') = ' + start + ', va chạm, thử vị trí ' + idx + ' (i=' + i + ') — trống, chèn tại đây.');
        }
        slots[idx] = key;
        return;
      }
      log('h(' + key + ') = ' + start + ', thử vị trí ' + idx + ' (i=' + i + ') — đã có khoá ' + cur + ', dò tiếp.');
    }
    log(
      'Chèn ' +
        key +
        ' THẤT BẠI — dò hết ' +
        tableSize +
        ' vị trí vẫn không tìm được chỗ trống (bảng đầy hoặc quadratic "đầy giả").'
    );
  }

  function insert(key) {
    if (strategy === 'chaining') insertChaining(key);
    else insertOpenAddressing(key);
  }

  function getAllKeys() {
    return strategy === 'chaining' ? buckets.flat() : slots.filter((v) => typeof v === 'number');
  }

  function removeChainingKey(bucketIdx, key) {
    const bucket = buckets[bucketIdx];
    const i = bucket.indexOf(key);
    if (i !== -1) {
      bucket.splice(i, 1);
      log('Xoá khoá ' + key + ' khỏi bucket ' + bucketIdx + '.');
    }
  }

  function removeSlotKey(idx) {
    const key = slots[idx];
    if (typeof key !== 'number') return;
    slots[idx] = TOMBSTONE;
    log('Xoá khoá ' + key + ' tại vị trí ' + idx + ' — đánh dấu TOMBSTONE (không đặt null) để không gãy chuỗi dò.');
  }

  function resetTable(size) {
    tableSize = size;
    buckets = makeBuckets(size);
    slots = makeSlots(size);
  }

  function stats() {
    const n = getAllKeys().length;
    const load = tableSize > 0 ? (n / tableSize) * 100 : 0;
    return { n, load };
  }

  function updateStats() {
    const s = stats();
    statSize.textContent = String(tableSize);
    statCount.textContent = String(s.n);
    statLoad.textContent = s.load.toFixed(0) + '%';
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    if (strategy === 'chaining') drawChaining();
    else drawOpenAddressing();
  }

  function drawChaining() {
    const colW = BAR_W / tableSize;
    const headerY = 40;
    const headerH = 34;
    for (let i = 0; i < tableSize; i++) {
      const x = MARGIN + i * colW;
      ctx.fillStyle = '#11111b';
      ctx.fillRect(x, headerY, colW - 4, headerH);
      ctx.strokeStyle = '#45475a';
      ctx.strokeRect(x, headerY, colW - 4, headerH);
      ctx.fillStyle = '#a6adc8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(i), x + (colW - 4) / 2, headerY + headerH / 2 + 3);

      const chain = buckets[i];
      let y = headerY + headerH + 6;
      chain.forEach((key) => {
        ctx.fillStyle = colorFor(key);
        ctx.fillRect(x, y, colW - 4, 24);
        ctx.strokeStyle = '#1e1e2e';
        ctx.strokeRect(x, y, colW - 4, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(String(key), x + (colW - 4) / 2, y + 16);
        y += 28;
      });
    }
    ctx.fillStyle = '#6c7086';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      'Separate Chaining — mỗi cột là 1 bucket, các ô xếp chồng là 1 chain (danh sách liên kết).',
      MARGIN,
      CSS_H - 14
    );
  }

  function drawOpenAddressing() {
    const colW = BAR_W / tableSize;
    const y = 60;
    const h = 80;
    for (let i = 0; i < tableSize; i++) {
      const x = MARGIN + i * colW;
      const val = slots[i];
      if (val === null) {
        ctx.fillStyle = '#0f0f1b';
      } else if (val === TOMBSTONE) {
        ctx.fillStyle = '#313244';
      } else {
        ctx.fillStyle = colorFor(val);
      }
      ctx.fillRect(x, y, colW - 4, h);
      ctx.strokeStyle = '#1e1e2e';
      ctx.strokeRect(x, y, colW - 4, h);

      ctx.textAlign = 'center';
      if (val === TOMBSTONE) {
        ctx.fillStyle = '#a6adc8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('X', x + (colW - 4) / 2, y + h / 2 + 4);
      } else if (typeof val === 'number') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(String(val), x + (colW - 4) / 2, y + h / 2 + 4);
      }
      ctx.fillStyle = '#6c7086';
      ctx.font = '9px monospace';
      ctx.fillText(String(i), x + (colW - 4) / 2, y + h + 14);
    }
    ctx.fillStyle = '#6c7086';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      (strategy === 'quadratic' ? 'Quadratic Probing' : 'Linear Probing') +
        ' — ô xám "X" là tombstone (đã xoá), số dưới ô là chỉ số bucket.',
      MARGIN,
      y + h + 40
    );
  }

  function updateJsCodeDisplay(action) {
    const s = stats();
    const code =
      '/* 🔑 BÀI 10: HASH TABLE — ' +
      (action || 'INIT').toUpperCase() +
      ' */\n\n' +
      'const strategy = "' +
      strategy +
      '";\n' +
      'function h(key) { return key % ' +
      tableSize +
      '; } // tableSize hiện tại\n\n' +
      (strategy === 'chaining'
        ? 'function insert(key) {\n  buckets[h(key)].push(key); // O(1) amortized, luôn thành công\n}\n\n'
        : 'function insert(key) {\n  for (let i = 0; i < m; i++) {\n' +
          '    const idx = ' +
          (strategy === 'quadratic' ? '(h(key) + i * i) % m' : '(h(key) + i) % m') +
          ';\n' +
          '    if (slots[idx] === null || slots[idx] === TOMBSTONE) { slots[idx] = key; return; }\n' +
          '  }\n  // bảng đầy (hoặc quadratic "đầy giả")\n}\n\n') +
      '// m = ' +
      tableSize +
      ', n = ' +
      s.n +
      ', hệ số tải α = ' +
      (s.load / 100).toFixed(2);

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  canvas.addEventListener('click', (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const colW = BAR_W / tableSize;
    const i = Math.floor((x - MARGIN) / colW);
    if (i < 0 || i >= tableSize) return;

    if (strategy === 'chaining') {
      if (y < 80) return;
      const chain = buckets[i];
      const itemIndex = Math.floor((y - 80) / 28);
      if (itemIndex < 0 || itemIndex >= chain.length) return;
      clearLog();
      removeChainingKey(i, chain[itemIndex]);
    } else {
      if (y < 60 || y > 140) return;
      if (typeof slots[i] !== 'number') return;
      clearLog();
      removeSlotKey(i);
    }
    draw();
    updateStats();
    updateJsCodeDisplay('delete');
  });

  insertBtn.addEventListener('click', () => {
    const key = parseInt(keyInput.value, 10);
    if (isNaN(key) || key < 0) return;
    clearLog();
    insert(key);
    draw();
    updateStats();
    updateJsCodeDisplay('insert ' + key);
  });

  strategySelect.addEventListener('change', () => {
    strategy = strategySelect.value;
    resetTable(INITIAL_SIZE);
    clearLog();
    log('Đổi chiến lược sang ' + strategySelect.options[strategySelect.selectedIndex].text + ' — đã reset bảng.');
    draw();
    updateStats();
    updateJsCodeDisplay('switch strategy');
  });

  randomBtn.addEventListener('click', () => {
    clearLog();
    resetTable(tableSize);
    for (let i = 0; i < 9; i++) {
      const key = Math.floor(Math.random() * 100);
      insert(key);
    }
    draw();
    updateStats();
    updateJsCodeDisplay('random stress');
  });

  rehashBtn.addEventListener('click', () => {
    const oldKeys = getAllKeys();
    const oldSize = tableSize;
    const newSize = oldSize * 2 + 1;
    resetTable(newSize);
    clearLog();
    log('Rehash: kích thước ' + oldSize + ' → ' + newSize + ', băm lại ' + oldKeys.length + ' khoá.');
    oldKeys.forEach((key) => insert(key));
    draw();
    updateStats();
    updateJsCodeDisplay('rehash');
  });

  resetBtn.addEventListener('click', () => {
    resetTable(INITIAL_SIZE);
    clearLog();
    log('Đã reset bảng ' + INITIAL_SIZE + ' bucket, hoàn toàn trống.');
    draw();
    updateStats();
    updateJsCodeDisplay('reset');
  });

  log('Sẵn sàng. Bảng ' + INITIAL_SIZE + ' bucket, chiến lược Separate Chaining.');
  draw();
  updateStats();
  updateJsCodeDisplay('init');
})();
