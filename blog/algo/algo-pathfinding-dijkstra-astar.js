/* Bài 2: Pathfinding Visualizer — Dijkstra & A* trên lưới ô vuông */
(function () {
  const canvas = document.getElementById('path-canvas');
  if (!canvas) return; // page without the sandbox

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const COLS = 25;
  const ROWS = 15;
  const CELL = 24;
  const CSS_W = COLS * CELL;
  const CSS_H = ROWS * CELL;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  const modeButtons = {
    wall: document.getElementById('path-mode-wall'),
    start: document.getElementById('path-mode-start'),
    end: document.getElementById('path-mode-end'),
  };
  const runDijkstraBtn = document.getElementById('path-run-dijkstra');
  const runAstarBtn = document.getElementById('path-run-astar');
  const randomMazeBtn = document.getElementById('path-random-maze');
  const clearBtn = document.getElementById('path-clear');
  const logEl = document.getElementById('path-log');
  const statVisited = document.getElementById('path-stat-visited');
  const statLength = document.getElementById('path-stat-length');
  const statTime = document.getElementById('path-stat-time');
  const jsCodeDisplay = document.getElementById('js-code-display');

  let mode = 'wall';
  let walls = new Set(); // "row,col"
  let start = { row: 7, col: 2 };
  let end = { row: 7, col: 22 };
  let visitedCells = []; // animated reveal, in order
  let pathCells = [];
  let revealedVisited = 0;
  let revealedPath = 0;
  let animTimer = null;

  function key(row, col) {
    return row + ',' + col;
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

  function setMode(newMode) {
    mode = newMode;
    Object.keys(modeButtons).forEach((m) => {
      modeButtons[m].classList.toggle('is-active', m === newMode);
    });
  }

  function neighbors(row, col) {
    const deltas = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const result = [];
    for (const [dr, dc] of deltas) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !walls.has(key(r, c))) {
        result.push({ row: r, col: c });
      }
    }
    return result;
  }

  function manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  function reconstructPath(prev, endKey) {
    const path = [];
    let cur = endKey;
    while (cur !== undefined) {
      path.unshift(cur);
      cur = prev[cur];
    }
    return path;
  }

  function runSearch(useHeuristic) {
    const startKey = key(start.row, start.col);
    const endKey = key(end.row, end.col);
    const dist = { [startKey]: 0 };
    const prev = {};
    const visited = new Set();
    const visitOrder = [];
    // Simplified priority queue: array + linear-scan extract-min.
    // Production code should use a binary heap for O((V+E) log V).
    const queue = [{ k: startKey, row: start.row, col: start.col, priority: 0 }];

    while (queue.length > 0) {
      queue.sort((a, b) => a.priority - b.priority);
      const current = queue.shift();
      if (visited.has(current.k)) continue;
      visited.add(current.k);
      visitOrder.push(current.k);

      if (current.k === endKey) break;

      for (const n of neighbors(current.row, current.col)) {
        const nk = key(n.row, n.col);
        const newDist = dist[current.k] + 1;
        if (dist[nk] === undefined || newDist < dist[nk]) {
          dist[nk] = newDist;
          prev[nk] = current.k;
          const h = useHeuristic ? manhattan(n, end) : 0;
          queue.push({ k: nk, row: n.row, col: n.col, priority: newDist + h });
        }
      }
    }

    const found = dist[endKey] !== undefined;
    const path = found ? reconstructPath(prev, endKey) : [];
    return { visitOrder, path, found, distance: dist[endKey] };
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, CSS_H);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(CSS_W, r * CELL);
      ctx.stroke();
    }

    // Visited cells (revealed so far)
    ctx.fillStyle = 'rgba(96, 165, 250, 0.35)';
    for (let i = 0; i < revealedVisited; i++) {
      const [r, c] = visitedCells[i].split(',').map(Number);
      ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
    }

    // Path cells (revealed so far)
    ctx.fillStyle = '#facc15';
    for (let i = 0; i < revealedPath; i++) {
      const [r, c] = pathCells[i].split(',').map(Number);
      ctx.fillRect(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6);
    }

    // Walls
    ctx.fillStyle = '#45475a';
    walls.forEach((k) => {
      const [r, c] = k.split(',').map(Number);
      ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
    });

    // Start / End
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(start.col * CELL + 2, start.row * CELL + 2, CELL - 4, CELL - 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(end.col * CELL + 2, end.row * CELL + 2, CELL - 4, CELL - 4);
  }

  function stopAnimation() {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }
  }

  function animateReveal(result, algoName, elapsedMs) {
    stopAnimation();
    visitedCells = result.visitOrder;
    pathCells = result.path;
    revealedVisited = 0;
    revealedPath = 0;
    statVisited.textContent = '0';
    statLength.textContent = '-';
    statTime.textContent = elapsedMs.toFixed(2) + ' ms';

    const STEP = 6; // cells revealed per tick
    animTimer = setInterval(() => {
      if (revealedVisited < visitedCells.length) {
        revealedVisited = Math.min(visitedCells.length, revealedVisited + STEP);
        statVisited.textContent = String(revealedVisited);
        draw();
      } else if (revealedPath < pathCells.length) {
        revealedPath = Math.min(pathCells.length, revealedPath + 1);
        draw();
      } else {
        stopAnimation();
        if (result.found) {
          statLength.textContent = String(pathCells.length - 1) + ' bước';
          log(
            algoName +
              ': tìm thấy đường đi dài ' +
              (pathCells.length - 1) +
              ' bước, khám phá ' +
              visitedCells.length +
              ' node.'
          );
        } else {
          statLength.textContent = 'Không có đường';
          log(algoName + ': KHÔNG tìm thấy đường đi (bị tường chặn hoàn toàn).');
        }
      }
    }, 16);
  }

  function runAlgorithm(useHeuristic, algoName) {
    clearLog();
    log('Đang chạy ' + algoName + '...');
    const t0 = performance.now();
    const result = runSearch(useHeuristic);
    const t1 = performance.now();
    animateReveal(result, algoName, t1 - t0);
    updateJsCodeDisplay(algoName);
  }

  function updateJsCodeDisplay(lastRun) {
    let code =
      '/* 🗺️ BÀI 2: PATHFINDING — ' +
      (lastRun || 'Dijkstra/A*').toUpperCase() +
      ' */\n\n' +
      'function runSearch(useHeuristic) {\n' +
      '  const dist = { [startKey]: 0 };\n' +
      '  const queue = [{ k: startKey, priority: 0 }];\n\n' +
      '  while (queue.length > 0) {\n' +
      '    queue.sort((a, b) => a.priority - b.priority);\n' +
      '    const current = queue.shift();\n' +
      '    if (visited.has(current.k)) continue;\n' +
      '    visited.add(current.k);\n' +
      '    if (current.k === endKey) break;\n\n' +
      '    for (const n of neighbors(current)) {\n' +
      '      const newDist = dist[current.k] + 1;\n' +
      '      if (dist[n.k] === undefined || newDist < dist[n.k]) {\n' +
      '        dist[n.k] = newDist;\n' +
      '        // useHeuristic=false -> Dijkstra, true -> A*\n' +
      '        const h = useHeuristic ? manhattan(n, end) : 0;\n' +
      '        queue.push({ k: n.k, priority: newDist + h });\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '}\n\n' +
      '// Tường hiện tại: ' +
      walls.size +
      ' ô\n' +
      '// Start: (' +
      start.row +
      ',' +
      start.col +
      ')  End: (' +
      end.row +
      ',' +
      end.col +
      ')';

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function resetVisualState() {
    stopAnimation();
    visitedCells = [];
    pathCells = [];
    revealedVisited = 0;
    revealedPath = 0;
    statVisited.textContent = '0';
    statLength.textContent = '-';
    statTime.textContent = '-';
  }

  function cellFromEvent(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const col = Math.floor((x / rect.width) * COLS);
    const row = Math.floor((y / rect.height) * ROWS);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
    return { row, col };
  }

  let isPainting = false;
  let paintValue = true; // true = add wall, false = remove wall

  function applyModeAt(cell) {
    const isStartOrEnd =
      (cell.row === start.row && cell.col === start.col) || (cell.row === end.row && cell.col === end.col);
    if (mode === 'wall') {
      if (isStartOrEnd) return;
      const k = key(cell.row, cell.col);
      if (paintValue) walls.add(k);
      else walls.delete(k);
    } else if (mode === 'start') {
      if (cell.row === end.row && cell.col === end.col) return;
      start = cell;
      walls.delete(key(cell.row, cell.col));
    } else if (mode === 'end') {
      if (cell.row === start.row && cell.col === start.col) return;
      end = cell;
      walls.delete(key(cell.row, cell.col));
    }
    resetVisualState();
    draw();
  }

  canvas.addEventListener('mousedown', (evt) => {
    const cell = cellFromEvent(evt);
    if (!cell) return;
    if (mode === 'wall') {
      paintValue = !walls.has(key(cell.row, cell.col));
      isPainting = true;
    }
    applyModeAt(cell);
  });
  canvas.addEventListener('mousemove', (evt) => {
    if (!isPainting) return;
    const cell = cellFromEvent(evt);
    if (!cell) return;
    applyModeAt(cell);
  });
  window.addEventListener('mouseup', () => {
    isPainting = false;
  });

  Object.keys(modeButtons).forEach((m) => {
    modeButtons[m].addEventListener('click', () => setMode(m));
  });

  runDijkstraBtn.addEventListener('click', () => runAlgorithm(false, 'Dijkstra'));
  runAstarBtn.addEventListener('click', () => runAlgorithm(true, 'A*'));

  randomMazeBtn.addEventListener('click', () => {
    walls = new Set();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const isStartOrEnd = (r === start.row && c === start.col) || (r === end.row && c === end.col);
        if (!isStartOrEnd && Math.random() < 0.22) {
          walls.add(key(r, c));
        }
      }
    }
    resetVisualState();
    clearLog();
    log('Đã tạo mê cung ngẫu nhiên: ' + walls.size + ' ô tường.');
    draw();
  });

  clearBtn.addEventListener('click', () => {
    walls = new Set();
    resetVisualState();
    clearLog();
    log('Đã xoá toàn bộ tường.');
    draw();
  });

  log('Sẵn sàng. Vẽ tường hoặc bấm Dijkstra/A* để tìm đường đi mẫu.');
  updateJsCodeDisplay();
  draw();
})();
