/* Bài 6: Segment Tree Visualizer — cập nhật/truy vấn đoạn con trực quan */
(function () {
  const canvas = document.getElementById('seg-canvas');
  if (!canvas) return; // page without the sandbox

  const updateIdxInput = document.getElementById('seg-update-idx');
  const updateValInput = document.getElementById('seg-update-val');
  const updateBtn = document.getElementById('seg-update-btn');
  const queryLInput = document.getElementById('seg-query-l');
  const queryRInput = document.getElementById('seg-query-r');
  const queryBtn = document.getElementById('seg-query-btn');
  const logEl = document.getElementById('seg-log');
  const statResult = document.getElementById('seg-stat-result');
  const statVisited = document.getElementById('seg-stat-visited');
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

  const N = 8;
  let arr = [3, 7, 2, 9, 4, 6, 1, 8];
  let tree = new Array(4 * N).fill(0);
  const nodeMeta = new Map(); // node -> {l, r}

  let highlightPath = new Set(); // nodes to highlight (update path)
  let highlightQuery = new Set(); // nodes to highlight (fully-matched query nodes)

  function build(node, l, r) {
    nodeMeta.set(node, { l, r });
    if (l === r) {
      tree[node] = arr[l];
      return;
    }
    const mid = Math.floor((l + r) / 2);
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }

  function update(node, l, r, idx, val, path) {
    path.add(node);
    if (l === r) {
      arr[idx] = val;
      tree[node] = val;
      return;
    }
    const mid = Math.floor((l + r) / 2);
    if (idx <= mid) update(2 * node, l, mid, idx, val, path);
    else update(2 * node + 1, mid + 1, r, idx, val, path);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }

  function query(node, l, r, ql, qr, visited, matched) {
    visited.add(node);
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) {
      matched.add(node);
      return tree[node];
    }
    const mid = Math.floor((l + r) / 2);
    return (
      query(2 * node, l, mid, ql, qr, visited, matched) + query(2 * node + 1, mid + 1, r, ql, qr, visited, matched)
    );
  }

  // ---- Layout: recursive, leaves get sequential x, internal = avg of children ----
  function computeLayout(node, l, r, positions, counter, depth) {
    if (l === r) {
      const x = 45 + counter.i * 68;
      counter.i++;
      positions.set(node, { x, y: 30 + depth * 70 });
      return x;
    }
    const mid = Math.floor((l + r) / 2);
    const xLeft = computeLayout(2 * node, l, mid, positions, counter, depth + 1);
    const xRight = computeLayout(2 * node + 1, mid + 1, r, positions, counter, depth + 1);
    const x = (xLeft + xRight) / 2;
    positions.set(node, { x, y: 30 + depth * 70 });
    return x;
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const positions = new Map();
    computeLayout(1, 0, N - 1, positions, { i: 0 }, 0);

    // Edges
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.3)';
    ctx.lineWidth = 1.5;
    nodeMeta.forEach((meta, node) => {
      if (meta.l === meta.r) return;
      const p = positions.get(node);
      [2 * node, 2 * node + 1].forEach((child) => {
        const c = positions.get(child);
        if (!c) return;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
      });
    });

    // Nodes
    nodeMeta.forEach((meta, node) => {
      const p = positions.get(node);
      if (!p) return;
      const isPath = highlightPath.has(node);
      const isQuery = highlightQuery.has(node);

      let fill = '#181825';
      let stroke = '#45475a';
      if (isQuery) {
        fill = '#22c55e';
        stroke = '#16a34a';
      } else if (isPath) {
        fill = '#f59e0b';
        stroke = '#d97706';
      }

      const w = meta.l === meta.r ? 40 : 52;
      const h = 32;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      roundRect(ctx, p.x - w / 2, p.y - h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isQuery || isPath ? '#fff' : '#cdd6f4';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[' + meta.l + ',' + meta.r + ']', p.x, p.y - 7);
      ctx.font = 'bold 11px monospace';
      ctx.fillText(String(tree[node]), p.x, p.y + 7);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
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

  function updateJsCodeDisplay(action) {
    const code =
      '/* 🌳 BÀI 6: SEGMENT TREE — ' +
      (action || 'BUILD').toUpperCase() +
      ' */\n\n' +
      'function query(node, l, r, ql, qr) {\n' +
      '  if (qr < l || r < ql) return 0;           // không chồng lấn\n' +
      '  if (ql <= l && r <= qr) return tree[node]; // chồng lấn hoàn toàn\n' +
      '  const mid = Math.floor((l + r) / 2);\n' +
      '  return query(2*node, l, mid, ql, qr)\n' +
      '       + query(2*node+1, mid+1, r, ql, qr);\n' +
      '}\n\n' +
      '// Mảng hiện tại: [' +
      arr.join(', ') +
      ']\n' +
      '// tree[1] (tổng toàn mảng) = ' +
      tree[1];

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateBtn.addEventListener('click', () => {
    const idx = parseInt(updateIdxInput.value, 10);
    const val = parseInt(updateValInput.value, 10);
    if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= N) return;
    clearLog();
    highlightQuery = new Set();
    highlightPath = new Set();
    update(1, 0, N - 1, idx, val, highlightPath);
    log('Cập nhật arr[' + idx + '] = ' + val + '. Đường đi lá→gốc: ' + highlightPath.size + ' node đã cập nhật.');
    statVisited.textContent = String(highlightPath.size);
    draw();
    updateJsCodeDisplay('update');
  });

  queryBtn.addEventListener('click', () => {
    const l = parseInt(queryLInput.value, 10);
    const r = parseInt(queryRInput.value, 10);
    if (isNaN(l) || isNaN(r) || l < 0 || r >= N || l > r) return;
    clearLog();
    highlightPath = new Set();
    const visited = new Set();
    const matched = new Set();
    const result = query(1, 0, N - 1, l, r, visited, matched);
    highlightQuery = matched;
    statResult.textContent = String(result);
    statVisited.textContent = String(visited.size);
    log(
      'Truy vấn tổng [' +
        l +
        ',' +
        r +
        '] = ' +
        result +
        '. Thăm ' +
        visited.size +
        ' node, dùng trực tiếp ' +
        matched.size +
        ' node (không cần quét cả ' +
        N +
        ' phần tử).'
    );
    draw();
    updateJsCodeDisplay('query');
  });

  build(1, 0, N - 1);
  draw();
  log('Sẵn sàng. Mảng ban đầu: [' + arr.join(', ') + ']');
  updateJsCodeDisplay('build');
})();
