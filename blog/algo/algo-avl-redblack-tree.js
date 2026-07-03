/* Bài 1: AVL Tree Sandbox — insert/delete với rotation logging trực quan */
(function () {
  const canvas = document.getElementById('avl-canvas');
  const input = document.getElementById('avl-input');
  const insertBtn = document.getElementById('avl-insert-btn');
  const deleteBtn = document.getElementById('avl-delete-btn');
  const randomBtn = document.getElementById('avl-random-btn');
  const resetBtn = document.getElementById('avl-reset-btn');
  const logEl = document.getElementById('avl-log');
  const statCount = document.getElementById('avl-stat-count');
  const statHeight = document.getElementById('avl-stat-height');
  const statRotations = document.getElementById('avl-stat-rotations');
  const jsCodeDisplay = document.getElementById('js-code-display');

  if (!canvas) return; // page without the sandbox

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 600;
  const CSS_H = 360;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let root = null;
  let totalRotations = 0;
  let lastTouchedValue = null;

  // ---- Core AVL logic ----
  function height(node) {
    return node ? node.height : 0;
  }
  function getBalance(node) {
    return node ? height(node.left) - height(node.right) : 0;
  }
  function updateHeight(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
  }
  function makeNode(value) {
    return { value: value, left: null, right: null, height: 1 };
  }

  function rotateRight(y, log) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    updateHeight(y);
    updateHeight(x);
    totalRotations++;
    log('Xoay phải quanh node ' + y.value + ' (node ' + x.value + ' lên làm gốc subtree)');
    return x;
  }

  function rotateLeft(x, log) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    updateHeight(x);
    updateHeight(y);
    totalRotations++;
    log('Xoay trái quanh node ' + x.value + ' (node ' + y.value + ' lên làm gốc subtree)');
    return y;
  }

  function insert(node, value, log) {
    if (!node) {
      log('Chèn node mới: ' + value);
      return makeNode(value);
    }
    if (value < node.value) {
      node.left = insert(node.left, value, log);
    } else if (value > node.value) {
      node.right = insert(node.right, value, log);
    } else {
      log('Giá trị ' + value + ' đã tồn tại, bỏ qua.');
      return node;
    }

    updateHeight(node);
    const balance = getBalance(node);

    if (balance > 1 && value < node.left.value) {
      log('Mất cân bằng LL tại node ' + node.value + ' (BF=' + balance + ')');
      return rotateRight(node, log);
    }
    if (balance < -1 && value > node.right.value) {
      log('Mất cân bằng RR tại node ' + node.value + ' (BF=' + balance + ')');
      return rotateLeft(node, log);
    }
    if (balance > 1 && value > node.left.value) {
      log('Mất cân bằng LR tại node ' + node.value + ' (BF=' + balance + ') — xoay kép');
      node.left = rotateLeft(node.left, log);
      return rotateRight(node, log);
    }
    if (balance < -1 && value < node.right.value) {
      log('Mất cân bằng RL tại node ' + node.value + ' (BF=' + balance + ') — xoay kép');
      node.right = rotateRight(node.right, log);
      return rotateLeft(node, log);
    }
    return node;
  }

  function minValueNode(node) {
    let cur = node;
    while (cur.left) cur = cur.left;
    return cur;
  }

  function deleteNode(node, value, log) {
    if (!node) {
      log('Không tìm thấy giá trị ' + value + ' để xoá.');
      return null;
    }
    if (value < node.value) {
      node.left = deleteNode(node.left, value, log);
    } else if (value > node.value) {
      node.right = deleteNode(node.right, value, log);
    } else {
      log('Xoá node ' + value);
      if (!node.left || !node.right) {
        node = node.left || node.right;
      } else {
        const succ = minValueNode(node.right);
        log('Node có 2 con — thay bằng successor nhỏ nhất bên phải: ' + succ.value);
        node.value = succ.value;
        node.right = deleteNode(node.right, succ.value, log);
      }
    }

    if (!node) return null;

    updateHeight(node);
    const balance = getBalance(node);

    if (balance > 1 && getBalance(node.left) >= 0) {
      log('Mất cân bằng LL sau xoá tại node ' + node.value + ' (BF=' + balance + ')');
      return rotateRight(node, log);
    }
    if (balance > 1 && getBalance(node.left) < 0) {
      log('Mất cân bằng LR sau xoá tại node ' + node.value + ' (BF=' + balance + ') — xoay kép');
      node.left = rotateLeft(node.left, log);
      return rotateRight(node, log);
    }
    if (balance < -1 && getBalance(node.right) <= 0) {
      log('Mất cân bằng RR sau xoá tại node ' + node.value + ' (BF=' + balance + ')');
      return rotateLeft(node, log);
    }
    if (balance < -1 && getBalance(node.right) > 0) {
      log('Mất cân bằng RL sau xoá tại node ' + node.value + ' (BF=' + balance + ') — xoay kép');
      node.right = rotateRight(node.right, log);
      return rotateLeft(node, log);
    }
    return node;
  }

  // ---- Layout (in-order x, depth y) ----
  function computeLayout(node, positions, counter, depth) {
    if (!node) return;
    computeLayout(node.left, positions, counter, depth + 1);
    const x = 40 + counter.i * 46;
    counter.i++;
    positions.set(node, { x: x, y: 36 + depth * 56 });
    computeLayout(node.right, positions, counter, depth + 1);
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    if (!root) {
      statCount.textContent = '0';
      statHeight.textContent = '0';
      return;
    }

    const positions = new Map();
    computeLayout(root, positions, { i: 0 }, 0);

    // Center the tree horizontally
    let minX = Infinity,
      maxX = -Infinity;
    positions.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
    });
    const treeWidth = maxX - minX;
    const offsetX = Math.max(20, (CSS_W - treeWidth) / 2 - minX);
    positions.forEach((p) => (p.x += offsetX));

    // Draw edges first
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.4)';
    ctx.lineWidth = 1.5;
    function drawEdges(node) {
      if (!node) return;
      const p = positions.get(node);
      if (node.left) {
        const c = positions.get(node.left);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        drawEdges(node.left);
      }
      if (node.right) {
        const c = positions.get(node.right);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        drawEdges(node.right);
      }
    }
    drawEdges(root);

    // Draw nodes
    function drawNodes(node) {
      if (!node) return;
      const p = positions.get(node);
      const bf = getBalance(node);
      const isHighlighted = node.value === lastTouchedValue;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 17, 0, Math.PI * 2);
      ctx.fillStyle = isHighlighted ? '#f59e0b' : '#d946ef';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = Math.abs(bf) > 1 ? '#ef4444' : '#1e1e2e';
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(node.value), p.x, p.y);

      ctx.fillStyle = '#a6adc8';
      ctx.font = '9px monospace';
      ctx.fillText('BF ' + (bf > 0 ? '+' + bf : bf), p.x, p.y + 26);

      drawNodes(node.left);
      drawNodes(node.right);
    }
    drawNodes(root);

    let count = 0;
    (function countNodes(n) {
      if (!n) return;
      count++;
      countNodes(n.left);
      countNodes(n.right);
    })(root);

    statCount.textContent = String(count);
    statHeight.textContent = String(height(root));
    statRotations.textContent = String(totalRotations);
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

  function updateJsCodeDisplay(action, value) {
    let code =
      '/* 🌳 BÀI 1: AVL TREE — ' +
      action.toUpperCase() +
      ' ' +
      value +
      ' */\n\n' +
      'function insert(node, value) {\n' +
      '  if (!node) return { value, left: null, right: null, height: 1 };\n' +
      '  if (value < node.value) node.left = insert(node.left, value);\n' +
      '  else if (value > node.value) node.right = insert(node.right, value);\n' +
      '  else return node;\n\n' +
      '  updateHeight(node);\n' +
      '  const balance = getBalance(node);\n\n' +
      '  if (balance > 1 && value < node.left.value) return rotateRight(node); // LL\n' +
      '  if (balance < -1 && value > node.right.value) return rotateLeft(node); // RR\n' +
      '  if (balance > 1 && value > node.left.value) {\n' +
      '    node.left = rotateLeft(node.left); return rotateRight(node); // LR\n' +
      '  }\n' +
      '  if (balance < -1 && value < node.right.value) {\n' +
      '    node.right = rotateRight(node.right); return rotateLeft(node); // RL\n' +
      '  }\n' +
      '  return node;\n' +
      '}\n\n' +
      '// Trạng thái hiện tại: ' +
      (root ? 'root = ' + root.value : 'cây rỗng') +
      '\n' +
      '// Tổng số phép xoay đã thực hiện: ' +
      totalRotations;

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function doInsert() {
    const value = parseInt(input.value, 10);
    if (isNaN(value)) return;
    clearLog();
    root = insert(root, value, log);
    lastTouchedValue = value;
    draw();
    updateJsCodeDisplay('insert', value);
  }

  function doDelete() {
    const value = parseInt(input.value, 10);
    if (isNaN(value)) return;
    clearLog();
    root = deleteNode(root, value, log);
    lastTouchedValue = null;
    draw();
    updateJsCodeDisplay('delete', value);
  }

  function doRandom() {
    clearLog();
    root = null;
    totalRotations = 0;
    const used = new Set();
    while (used.size < 8) {
      used.add(1 + Math.floor(Math.random() * 99));
    }
    used.forEach((v) => {
      root = insert(root, v, log);
      lastTouchedValue = v;
    });
    draw();
    updateJsCodeDisplay('random seed', '(' + Array.from(used).join(', ') + ')');
  }

  function doReset() {
    clearLog();
    root = null;
    totalRotations = 0;
    lastTouchedValue = null;
    log('Đã reset cây về rỗng.');
    draw();
    updateJsCodeDisplay('reset', '');
  }

  insertBtn.addEventListener('click', doInsert);
  deleteBtn.addEventListener('click', doDelete);
  randomBtn.addEventListener('click', doRandom);
  resetBtn.addEventListener('click', doReset);

  // Seed with a starting example on load
  [50, 30, 70, 20, 40, 60, 80].forEach((v) => {
    root = insert(root, v, function () {});
  });
  lastTouchedValue = null;
  log('Sẵn sàng. Cây mẫu ban đầu: 50, 30, 70, 20, 40, 60, 80.');
  draw();
  updateJsCodeDisplay('init', '(50, 30, 70, 20, 40, 60, 80)');
})();
