/* Bài 8: B-Tree Visualizer — bậc m=4 (T=2), chèn/xoá với tách/gộp trang */
(function () {
  const canvas = document.getElementById('bt-canvas');
  if (!canvas) return; // page without the sandbox

  const input = document.getElementById('bt-input');
  const insertBtn = document.getElementById('bt-insert-btn');
  const deleteBtn = document.getElementById('bt-delete-btn');
  const randomBtn = document.getElementById('bt-random-btn');
  const resetBtn = document.getElementById('bt-reset-btn');
  const logEl = document.getElementById('bt-log');
  const statCount = document.getElementById('bt-stat-count');
  const statHeight = document.getElementById('bt-stat-height');
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

  const T = 2; // min degree -> order m = 2T = 4, max keys = 2T-1 = 3, min keys (non-root) = T-1 = 1

  function makeNode(leaf) {
    return { keys: [], children: [], leaf };
  }

  let root = makeNode(true);
  let logLines = [];

  function log(message) {
    logLines.push(message);
  }

  function flushLog() {
    logEl.innerHTML = '';
    logLines.forEach((m) => {
      const line = document.createElement('div');
      line.textContent = m;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }

  // ---- Insert (proactive split on the way down, standard CLRS) ----
  function splitChild(parent, i) {
    const fullChild = parent.children[i];
    const newChild = makeNode(fullChild.leaf);
    const midKey = fullChild.keys[T - 1];

    newChild.keys = fullChild.keys.slice(T);
    fullChild.keys = fullChild.keys.slice(0, T - 1);
    if (!fullChild.leaf) {
      newChild.children = fullChild.children.slice(T);
      fullChild.children = fullChild.children.slice(0, T);
    }

    parent.children.splice(i + 1, 0, newChild);
    parent.keys.splice(i, 0, midKey);
    log('Tách trang: node đầy tại vị trí ' + i + ' -> đẩy khóa ' + midKey + ' lên node cha.');
  }

  function insertNonFull(node, key) {
    let i = node.keys.length - 1;
    if (node.leaf) {
      node.keys.push(null);
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      node.keys[i + 1] = key;
    } else {
      while (i >= 0 && key < node.keys[i]) i--;
      i++;
      if (node.children[i].keys.length === 2 * T - 1) {
        splitChild(node, i);
        if (key > node.keys[i]) i++;
      }
      insertNonFull(node.children[i], key);
    }
  }

  function insert(key) {
    if (search(root, key)) {
      log('Giá trị ' + key + ' đã tồn tại, bỏ qua.');
      return;
    }
    if (root.keys.length === 2 * T - 1) {
      const newRoot = makeNode(false);
      newRoot.children.push(root);
      splitChild(newRoot, 0);
      root = newRoot;
      log('Node gốc đầy -> tách, cây tăng thêm 1 tầng.');
    }
    insertNonFull(root, key);
    log('Chèn ' + key + ' thành công.');
  }

  function search(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && node.keys[i] === key) return true;
    if (node.leaf) return false;
    return search(node.children[i], key);
  }

  // ---- Delete (borrow/merge, standard CLRS) ----
  function findKeyIndex(node, key) {
    let idx = 0;
    while (idx < node.keys.length && node.keys[idx] < key) idx++;
    return idx;
  }

  function getPredecessor(node, idx) {
    let cur = node.children[idx];
    while (!cur.leaf) cur = cur.children[cur.children.length - 1];
    return cur.keys[cur.keys.length - 1];
  }

  function getSuccessor(node, idx) {
    let cur = node.children[idx + 1];
    while (!cur.leaf) cur = cur.children[0];
    return cur.keys[0];
  }

  function borrowFromPrev(node, idx) {
    const child = node.children[idx];
    const sibling = node.children[idx - 1];
    child.keys.unshift(node.keys[idx - 1]);
    if (!child.leaf) child.children.unshift(sibling.children.pop());
    node.keys[idx - 1] = sibling.keys.pop();
    log('Mượn khóa từ anh em bên trái (borrow).');
  }

  function borrowFromNext(node, idx) {
    const child = node.children[idx];
    const sibling = node.children[idx + 1];
    child.keys.push(node.keys[idx]);
    if (!child.leaf) child.children.push(sibling.children.shift());
    node.keys[idx] = sibling.keys.shift();
    log('Mượn khóa từ anh em bên phải (borrow).');
  }

  function merge(node, idx) {
    const child = node.children[idx];
    const sibling = node.children[idx + 1];
    child.keys.push(node.keys[idx]);
    child.keys = child.keys.concat(sibling.keys);
    if (!child.leaf) child.children = child.children.concat(sibling.children);
    node.keys.splice(idx, 1);
    node.children.splice(idx + 1, 1);
    log('Gộp trang: hợp nhất 2 node anh em + khóa cha ở giữa.');
  }

  function fill(node, idx) {
    if (idx > 0 && node.children[idx - 1].keys.length >= T) {
      borrowFromPrev(node, idx);
    } else if (idx < node.keys.length && node.children[idx + 1].keys.length >= T) {
      borrowFromNext(node, idx);
    } else {
      if (idx < node.keys.length) merge(node, idx);
      else merge(node, idx - 1);
    }
  }

  function removeFromNode(node, key) {
    const idx = findKeyIndex(node, key);
    if (idx < node.keys.length && node.keys[idx] === key) {
      if (node.leaf) {
        node.keys.splice(idx, 1);
      } else {
        if (node.children[idx].keys.length >= T) {
          const pred = getPredecessor(node, idx);
          node.keys[idx] = pred;
          removeFromNode(node.children[idx], pred);
        } else if (node.children[idx + 1].keys.length >= T) {
          const succ = getSuccessor(node, idx);
          node.keys[idx] = succ;
          removeFromNode(node.children[idx + 1], succ);
        } else {
          merge(node, idx);
          removeFromNode(node.children[idx], key);
        }
      }
    } else {
      if (node.leaf) {
        log('Không tìm thấy giá trị ' + key + '.');
        return;
      }
      const flagLastChild = idx === node.keys.length;
      if (node.children[idx].keys.length < T) {
        fill(node, idx);
      }
      if (flagLastChild && idx > node.keys.length) {
        removeFromNode(node.children[idx - 1], key);
      } else {
        removeFromNode(node.children[idx], key);
      }
    }
  }

  function deleteKey(key) {
    if (!search(root, key)) {
      log('Giá trị ' + key + ' không tồn tại trong cây.');
      return;
    }
    removeFromNode(root, key);
    if (root.keys.length === 0 && !root.leaf) {
      root = root.children[0];
      log('Node gốc rỗng sau khi gộp -> cây giảm 1 tầng.');
    }
    log('Xoá ' + key + ' thành công.');
  }

  // ---- Layout: left-to-right recursive, node width = f(key count) ----
  const CELL_W = 32;
  const NODE_H = 28;
  const Y_SPACING = 76;
  const GAP = 16;

  function computeLayout(node, depth, positions, xOffset) {
    const width = Math.max(node.keys.length, 1) * CELL_W;
    if (node.leaf) {
      const x = xOffset + width / 2;
      positions.set(node, { x, y: 24 + depth * Y_SPACING, width });
      return xOffset + width + GAP;
    }
    let cur = xOffset;
    const childCenters = [];
    node.children.forEach((child) => {
      cur = computeLayout(child, depth + 1, positions, cur);
      childCenters.push(positions.get(child).x);
    });
    const x = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    positions.set(node, { x, y: 24 + depth * Y_SPACING, width });
    return cur;
  }

  function treeHeight(node) {
    if (node.leaf) return 1;
    return 1 + treeHeight(node.children[0]);
  }

  function countKeys(node) {
    let total = node.keys.length;
    if (!node.leaf) node.children.forEach((c) => (total += countKeys(c)));
    return total;
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const positions = new Map();
    computeLayout(root, 0, positions, 10);

    // Edges
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.35)';
    ctx.lineWidth = 1.5;
    (function drawEdges(node) {
      if (node.leaf) return;
      const p = positions.get(node);
      const left = p.x - p.width / 2;
      const cellW = p.width / Math.max(node.keys.length, 1);
      node.children.forEach((child, i) => {
        const c = positions.get(child);
        const gapX = left + (i + 0.5) * cellW;
        ctx.beginPath();
        ctx.moveTo(gapX, p.y + NODE_H / 2);
        ctx.lineTo(c.x, c.y - NODE_H / 2);
        ctx.stroke();
        drawEdges(child);
      });
    })(root);

    // Nodes
    (function drawNodes(node) {
      const p = positions.get(node);
      const left = p.x - p.width / 2;
      const cellW = p.width / Math.max(node.keys.length, 1);

      ctx.fillStyle = '#181825';
      ctx.strokeStyle = node === root ? '#d946ef' : '#45475a';
      ctx.lineWidth = node === root ? 2 : 1.5;
      ctx.fillRect(left, p.y - NODE_H / 2, p.width, NODE_H);
      ctx.strokeRect(left, p.y - NODE_H / 2, p.width, NODE_H);

      ctx.fillStyle = '#cdd6f4';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      node.keys.forEach((k, i) => {
        const cx = left + (i + 0.5) * cellW;
        ctx.fillText(String(k), cx, p.y);
        if (i > 0) {
          ctx.strokeStyle = '#313244';
          ctx.beginPath();
          ctx.moveTo(left + i * cellW, p.y - NODE_H / 2);
          ctx.lineTo(left + i * cellW, p.y + NODE_H / 2);
          ctx.stroke();
        }
      });

      if (!node.leaf) node.children.forEach((c) => drawNodes(c));
    })(root);
  }

  function updateStats() {
    statCount.textContent = String(countKeys(root));
    statHeight.textContent = String(treeHeight(root));
  }

  function updateJsCodeDisplay(action, key) {
    const code =
      '/* 🗄️ BÀI 8: B-TREE (m=4) — ' +
      (action || 'INIT').toUpperCase() +
      (key !== undefined ? ' ' + key : '') +
      ' */\n\n' +
      'function insertNonFull(node, key) {\n' +
      '  if (node.leaf) {\n' +
      '    // chèn vào đúng vị trí sắp xếp trong node lá\n' +
      '  } else {\n' +
      '    // tìm con phù hợp; nếu con đó ĐẦY thì splitChild() trước\n' +
      '    if (child.keys.length === 2*T - 1) splitChild(node, i);\n' +
      '    insertNonFull(child, key);\n' +
      '  }\n' +
      '}\n\n' +
      '// Trạng thái hiện tại: ' +
      countKeys(root) +
      ' khóa, chiều cao ' +
      treeHeight(root) +
      ' tầng';

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function doInsert() {
    const value = parseInt(input.value, 10);
    if (isNaN(value)) return;
    logLines = [];
    insert(value);
    flushLog();
    draw();
    updateStats();
    updateJsCodeDisplay('insert', value);
  }

  function doDelete() {
    const value = parseInt(input.value, 10);
    if (isNaN(value)) return;
    logLines = [];
    deleteKey(value);
    flushLog();
    draw();
    updateStats();
    updateJsCodeDisplay('delete', value);
  }

  function doRandom() {
    logLines = [];
    root = makeNode(true);
    const used = new Set();
    while (used.size < 12) used.add(1 + Math.floor(Math.random() * 99));
    used.forEach((v) => insert(v));
    flushLog();
    draw();
    updateStats();
    updateJsCodeDisplay('random seed', '(' + Array.from(used).join(', ') + ')');
  }

  function doReset() {
    root = makeNode(true);
    logLines = [];
    log('Đã reset cây về rỗng.');
    flushLog();
    draw();
    updateStats();
    updateJsCodeDisplay('reset');
  }

  insertBtn.addEventListener('click', doInsert);
  deleteBtn.addEventListener('click', doDelete);
  randomBtn.addEventListener('click', doRandom);
  resetBtn.addEventListener('click', doReset);

  // Seed with a starting example
  [10, 20, 5, 6, 12, 30, 7, 17].forEach((v) => insert(v));
  logLines = ['Sẵn sàng. Cây mẫu ban đầu: 10, 20, 5, 6, 12, 30, 7, 17.'];
  flushLog();
  draw();
  updateStats();
  updateJsCodeDisplay('init', '(10, 20, 5, 6, 12, 30, 7, 17)');
})();
