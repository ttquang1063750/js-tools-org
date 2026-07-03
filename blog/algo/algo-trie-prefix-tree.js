/* Bài 4: Trie Autocomplete Visualizer — chèn/xoá từ + gợi ý trực tiếp */
(function () {
  const canvas = document.getElementById('trie-canvas');
  if (!canvas) return; // page without the sandbox

  const wordInput = document.getElementById('trie-word-input');
  const addBtn = document.getElementById('trie-add-btn');
  const deleteBtn = document.getElementById('trie-delete-btn');
  const seedBtn = document.getElementById('trie-seed-btn');
  const resetBtn = document.getElementById('trie-reset-btn');
  const prefixInput = document.getElementById('trie-prefix-input');
  const suggestionsEl = document.getElementById('trie-suggestions');
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

  // ---- Core Trie logic ----
  class TrieNode {
    constructor(char) {
      this.char = char;
      this.children = new Map();
      this.isEndOfWord = false;
    }
  }

  class Trie {
    constructor() {
      this.root = new TrieNode('');
    }
    insert(word) {
      let node = this.root;
      for (const ch of word) {
        if (!node.children.has(ch)) node.children.set(ch, new TrieNode(ch));
        node = node.children.get(ch);
      }
      node.isEndOfWord = true;
    }
    delete(word) {
      let node = this.root;
      for (const ch of word) {
        if (!node.children.has(ch)) return false;
        node = node.children.get(ch);
      }
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      return true;
    }
    autocomplete(prefix) {
      let node = this.root;
      for (const ch of prefix) {
        if (!node.children.has(ch)) return [];
        node = node.children.get(ch);
      }
      const results = [];
      (function dfs(n, path) {
        if (n.isEndOfWord) results.push(prefix + path);
        const keys = Array.from(n.children.keys()).sort();
        for (const ch of keys) dfs(n.children.get(ch), path + ch);
      })(node, '');
      return results;
    }
  }

  const trie = new Trie();
  let currentPrefixPath = []; // array of chars currently highlighted

  function seedDictionary() {
    ['cat', 'car', 'care', 'careful', 'dog', 'do', 'dodge', 'doll', 'data', 'date'].forEach((w) => trie.insert(w));
  }

  // ---- Layout: n-ary tree, leaf x = counter, internal x = avg of children ----
  function computeLayout(node, positions, counter, depth) {
    const keys = Array.from(node.children.keys()).sort();
    if (keys.length === 0) {
      const x = 30 + counter.i * 40;
      counter.i++;
      positions.set(node, { x, y: 30 + depth * 50 });
      return x;
    }
    const childXs = keys.map((ch) => computeLayout(node.children.get(ch), positions, counter, depth + 1));
    const x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    positions.set(node, { x, y: 30 + depth * 50 });
    return x;
  }

  function nodePathHighlighted(pathIndex) {
    return pathIndex < currentPrefixPath.length;
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const positions = new Map();
    computeLayout(trie.root, positions, { i: 0 }, 0);

    // Center horizontally
    let minX = Infinity,
      maxX = -Infinity;
    positions.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
    });
    const width = maxX - minX;
    const offsetX = Math.max(20, (CSS_W - width) / 2 - minX);
    positions.forEach((p) => (p.x += offsetX));

    // Track which nodes are on the currently-typed prefix path
    const highlightedNodes = new Set();
    let cur = trie.root;
    highlightedNodes.add(cur);
    for (const ch of currentPrefixPath) {
      if (!cur.children.has(ch)) break;
      cur = cur.children.get(ch);
      highlightedNodes.add(cur);
    }

    // Draw edges
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.35)';
    ctx.lineWidth = 1.5;
    (function drawEdges(node) {
      const p = positions.get(node);
      node.children.forEach((child) => {
        const c = positions.get(child);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        drawEdges(child);
      });
    })(trie.root);

    // Draw nodes
    (function drawNodes(node) {
      const p = positions.get(node);
      const isHighlighted = highlightedNodes.has(node);
      const isRoot = node === trie.root;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = isHighlighted ? '#f59e0b' : node.isEndOfWord ? '#22c55e' : '#6366f1';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e1e2e';
      ctx.stroke();

      if (!isRoot) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.char, p.x, p.y);
      } else {
        ctx.fillStyle = '#a6adc8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('root', p.x, p.y + 24);
      }

      node.children.forEach((child) => drawNodes(child));
    })(trie.root);
  }

  function updateSuggestions() {
    const prefix = prefixInput.value.trim().toLowerCase();
    currentPrefixPath = prefix.split('');
    suggestionsEl.innerHTML = '';
    if (!prefix) {
      suggestionsEl.textContent = 'Gõ tiền tố để xem gợi ý...';
      draw();
      return;
    }
    const results = trie.autocomplete(prefix);
    if (results.length === 0) {
      suggestionsEl.textContent = 'Không có từ nào khớp "' + prefix + '".';
    } else {
      results.forEach((word) => {
        const line = document.createElement('div');
        line.textContent = word;
        suggestionsEl.appendChild(line);
      });
    }
    draw();
  }

  function updateJsCodeDisplay(action, word) {
    const allWords = trie.autocomplete('');
    const code =
      '/* 🔤 BÀI 4: TRIE — ' +
      (action || 'INIT').toUpperCase() +
      (word ? ' "' + word + '"' : '') +
      ' */\n\n' +
      'trie.insert(word);       // O(L) — L = độ dài từ\n' +
      'trie.search(word);       // O(L), kiểm tra isEndOfWord\n' +
      'trie.autocomplete(prefix); // O(L + k), k = tổng ký tự kết quả\n\n' +
      '// Từ điển hiện tại (' +
      allWords.length +
      ' từ):\n' +
      '// ' +
      allWords.join(', ');

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  addBtn.addEventListener('click', () => {
    const word = wordInput.value.trim().toLowerCase();
    if (!word) return;
    trie.insert(word);
    wordInput.value = '';
    draw();
    updateJsCodeDisplay('insert', word);
    updateSuggestions();
  });

  deleteBtn.addEventListener('click', () => {
    const word = wordInput.value.trim().toLowerCase();
    if (!word) return;
    trie.delete(word);
    wordInput.value = '';
    draw();
    updateJsCodeDisplay('delete', word);
    updateSuggestions();
  });

  seedBtn.addEventListener('click', () => {
    seedDictionary();
    draw();
    updateJsCodeDisplay('seed');
    updateSuggestions();
  });

  resetBtn.addEventListener('click', () => {
    trie.root = new TrieNode('');
    currentPrefixPath = [];
    prefixInput.value = '';
    draw();
    updateJsCodeDisplay('reset');
    updateSuggestions();
  });

  prefixInput.addEventListener('input', updateSuggestions);

  seedDictionary();
  updateSuggestions();
  updateJsCodeDisplay('seed');
})();
