/* Bài 11: Huffman Tree Builder — greedy tree build, code table, encode */
(function () {
  const canvas = document.getElementById('huff-canvas');
  if (!canvas) return; // page without the sandbox

  const textInput = document.getElementById('huff-text-input');
  const buildBtn = document.getElementById('huff-build-btn');
  const randomBtn = document.getElementById('huff-random-btn');
  const resetBtn = document.getElementById('huff-reset-btn');
  const logEl = document.getElementById('huff-log');
  const statChars = document.getElementById('huff-stat-chars');
  const statOriginal = document.getElementById('huff-stat-original');
  const statCompressed = document.getElementById('huff-stat-compressed');
  const statRatio = document.getElementById('huff-stat-ratio');
  const codeTableEl = document.getElementById('huff-code-table');
  const bitstreamEl = document.getElementById('huff-bitstream');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 600;
  const CSS_H = 260;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

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

  const PRESETS = ['abracadabra', 'mississippi', 'the quick brown fox', 'huffman coding rocks', 'aaaaaaaabbbbcccd'];

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  function displayChar(ch) {
    if (ch === ' ') return '␣';
    if (ch === '\n') return '⏎';
    return ch;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function colorFor(ch) {
    return COLORS[ch.charCodeAt(0) % COLORS.length];
  }

  function buildFreqMap(text) {
    const freq = {};
    for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
    return freq;
  }

  function buildHuffmanTree(freqMap) {
    let order = 0;
    let nodes = Object.entries(freqMap).map(([char, freq]) => ({
      char,
      freq,
      left: null,
      right: null,
      order: order++,
    }));

    if (nodes.length === 1) {
      log('Chỉ có 1 ký tự duy nhất — gán trực tiếp mã "0", không cần gộp node.');
      return nodes[0];
    }

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq || a.order - b.order);
      const a = nodes.shift();
      const b = nodes.shift();
      const merged = { char: null, freq: a.freq + b.freq, left: a, right: b, order: order++ };
      log(
        'Gộp "' +
          displayChar(a.char || '') +
          (a.char === null ? '(node)' : '') +
          '" (' +
          a.freq +
          ') và "' +
          displayChar(b.char || '') +
          (b.char === null ? '(node)' : '') +
          '" (' +
          b.freq +
          ') → node freq ' +
          merged.freq
      );
      nodes.push(merged);
    }
    return nodes[0];
  }

  function generateCodes(node, prefix, codes) {
    prefix = prefix || '';
    codes = codes || {};
    if (!node.left && !node.right) {
      codes[node.char] = prefix || '0';
      return codes;
    }
    if (node.left) generateCodes(node.left, prefix + '0', codes);
    if (node.right) generateCodes(node.right, prefix + '1', codes);
    return codes;
  }

  function encode(text, codes) {
    return text
      .split('')
      .map((ch) => codes[ch])
      .join('');
  }

  function countLeaves(node) {
    if (!node.left && !node.right) return 1;
    return countLeaves(node.left) + countLeaves(node.right);
  }

  function depthOf(node) {
    if (!node.left && !node.right) return 0;
    return 1 + Math.max(depthOf(node.left), depthOf(node.right));
  }

  function layoutTree(root) {
    const totalLeaves = countLeaves(root);
    const spacing = Math.max(28, Math.min(70, (CSS_W - 40) / totalLeaves));
    const maxDepth = Math.max(1, depthOf(root));
    const yStep = Math.max(36, Math.min(70, (CSS_H - 60) / maxDepth));
    const counter = { i: 0 };

    function assign(node, depth) {
      if (!node.left && !node.right) {
        node._x = 20 + counter.i * spacing + spacing / 2;
        counter.i++;
        node._y = 24 + depth * yStep;
        return;
      }
      assign(node.left, depth + 1);
      assign(node.right, depth + 1);
      node._x = (node.left._x + node.right._x) / 2;
      node._y = 24 + depth * yStep;
    }
    assign(root, 0);
  }

  function drawTree(root) {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    function drawEdges(node) {
      if (node.left) {
        ctx.strokeStyle = '#45475a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node._x, node._y);
        ctx.lineTo(node.left._x, node.left._y);
        ctx.stroke();
        ctx.fillStyle = '#6c7086';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('0', (node._x + node.left._x) / 2 - 8, (node._y + node.left._y) / 2);
        drawEdges(node.left);
      }
      if (node.right) {
        ctx.strokeStyle = '#45475a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node._x, node._y);
        ctx.lineTo(node.right._x, node.right._y);
        ctx.stroke();
        ctx.fillStyle = '#6c7086';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1', (node._x + node.right._x) / 2 + 8, (node._y + node.right._y) / 2);
        drawEdges(node.right);
      }
    }

    function drawNodes(node) {
      const isLeaf = !node.left && !node.right;
      const r = isLeaf ? 15 : 12;
      ctx.beginPath();
      ctx.arc(node._x, node._y, r, 0, Math.PI * 2);
      ctx.fillStyle = isLeaf ? colorFor(node.char) : '#313244';
      ctx.fill();
      ctx.strokeStyle = '#1e1e2e';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isLeaf) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(displayChar(node.char), node._x, node._y - 3);
        ctx.font = '8px monospace';
        ctx.fillText(String(node.freq), node._x, node._y + 8);
      } else {
        ctx.fillStyle = '#cdd6f4';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(String(node.freq), node._x, node._y);
      }
      ctx.textBaseline = 'alphabetic';
      if (node.left) drawNodes(node.left);
      if (node.right) drawNodes(node.right);
    }

    drawEdges(root);
    drawNodes(root);
  }

  function renderCodeTable(codes, freqMap) {
    const entries = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
    let html = '<tr><th>Ký tự</th><th>Tần suất</th><th>Mã</th></tr>';
    entries.forEach(([ch, freq]) => {
      html += '<tr><td>' + escapeHtml(displayChar(ch)) + '</td><td>' + freq + '</td><td>' + codes[ch] + '</td></tr>';
    });
    codeTableEl.innerHTML = html;
  }

  function updateJsCodeDisplay(freqMap, codes, encoded, originalBits) {
    const entries = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, freq]) => '  "' + displayChar(ch) + '": freq ' + freq + ' → mã "' + codes[ch] + '"')
      .join('\n');
    const code =
      '/* 🌲 BÀI 11: HUFFMAN CODING */\n\n' +
      'const freqMap = countFrequencies(text);\n' +
      'const tree = buildHuffmanTree(freqMap); // gộp 2 node nhỏ nhất, lặp lại\n' +
      'const codes = generateCodes(tree);\n\n' +
      '// Bảng mã (sắp theo tần suất giảm dần):\n' +
      entries +
      '\n\n' +
      '// Kích thước nén: ' +
      encoded.length +
      ' bit (so với ' +
      originalBits +
      ' bit mã cố định 8-bit/ký tự)';

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function build(text) {
    clearLog();
    if (!text) {
      log('Vui lòng nhập ít nhất 1 ký tự.');
      return;
    }
    const freqMap = buildFreqMap(text);
    const tree = buildHuffmanTree(freqMap);
    const codes = generateCodes(tree);
    const encoded = encode(text, codes);

    layoutTree(tree);
    drawTree(tree);
    renderCodeTable(codes, freqMap);
    bitstreamEl.textContent = encoded;

    const originalBits = text.length * 8;
    const compressedBits = encoded.length;
    const ratio = originalBits > 0 ? (1 - compressedBits / originalBits) * 100 : 0;
    statChars.textContent = String(Object.keys(freqMap).length);
    statOriginal.textContent = originalBits + ' bit';
    statCompressed.textContent = compressedBits + ' bit';
    statRatio.textContent = ratio.toFixed(0) + '%';

    updateJsCodeDisplay(freqMap, codes, encoded, originalBits);
  }

  buildBtn.addEventListener('click', () => {
    build(textInput.value);
  });

  randomBtn.addEventListener('click', () => {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    textInput.value = preset;
    build(preset);
  });

  resetBtn.addEventListener('click', () => {
    textInput.value = 'abracadabra';
    clearLog();
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    codeTableEl.innerHTML = '';
    bitstreamEl.textContent = '';
    statChars.textContent = '0';
    statOriginal.textContent = '0 bit';
    statCompressed.textContent = '0 bit';
    statRatio.textContent = '0%';
    log('Đã reset. Nhập văn bản rồi bấm "Xây cây Huffman".');
  });

  build(textInput.value);
})();
