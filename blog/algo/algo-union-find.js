/* Bài 5: Kruskal MST Visualizer — Union-Find với path compression + union by rank */
(function () {
  const canvas = document.getElementById('uf-canvas');
  if (!canvas) return; // page without the sandbox

  const runBtn = document.getElementById('uf-run-btn');
  const resetBtn = document.getElementById('uf-reset-btn');
  const logEl = document.getElementById('uf-log');
  const statAccepted = document.getElementById('uf-stat-accepted');
  const statRejected = document.getElementById('uf-stat-rejected');
  const statWeight = document.getElementById('uf-stat-weight');
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

  const NODE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const EDGES = [
    { u: 0, v: 1, w: 4 }, // A-B
    { u: 0, v: 2, w: 7 }, // A-C
    { u: 1, v: 2, w: 2 }, // B-C
    { u: 1, v: 3, w: 5 }, // B-D
    { u: 2, v: 3, w: 8 }, // C-D
    { u: 2, v: 4, w: 3 }, // C-E
    { u: 3, v: 4, w: 6 }, // D-E
    { u: 3, v: 5, w: 9 }, // D-F
    { u: 4, v: 5, w: 1 }, // E-F
    { u: 4, v: 6, w: 10 }, // E-G
    { u: 5, v: 6, w: 4 }, // F-G
    { u: 5, v: 7, w: 2 }, // F-H
    { u: 6, v: 7, w: 5 }, // G-H
  ];

  const COLORS = ['#d946ef', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#a855f7', '#eab308'];

  // ---- Node positions on a circle ----
  const center = { x: CSS_W / 2, y: CSS_H / 2 };
  const radius = 130;
  const positions = NODE_LABELS.map((_, i) => {
    const angle = (i / NODE_LABELS.length) * Math.PI * 2 - Math.PI / 2;
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });

  // ---- Union-Find with path compression + union by rank ----
  class UnionFind {
    constructor(n) {
      this.parent = Array.from({ length: n }, (_, i) => i);
      this.rank = new Array(n).fill(0);
    }
    find(x) {
      if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
      return this.parent[x];
    }
    union(x, y) {
      const rootX = this.find(x);
      const rootY = this.find(y);
      if (rootX === rootY) return false;
      if (this.rank[rootX] < this.rank[rootY]) this.parent[rootX] = rootY;
      else if (this.rank[rootX] > this.rank[rootY]) this.parent[rootY] = rootX;
      else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
      return true;
    }
  }

  let steps = []; // { edge, accepted, componentOf: array }
  let revealed = 0;
  let animTimer = null;

  function runKruskal() {
    const sorted = EDGES.slice().sort((a, b) => a.w - b.w);
    const dsu = new UnionFind(NODE_LABELS.length);
    steps = [];
    for (const edge of sorted) {
      const accepted = dsu.union(edge.u, edge.v);
      const componentOf = NODE_LABELS.map((_, i) => dsu.find(i));
      steps.push({ edge, accepted, componentOf });
    }
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

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    // Determine current component coloring (from last revealed step, or all-separate initially)
    const componentOf = revealed > 0 ? steps[revealed - 1].componentOf : NODE_LABELS.map((_, i) => i);
    const rootColorIndex = new Map();
    let nextColor = 0;

    // Draw all edges (gray by default)
    EDGES.forEach((edge) => {
      const p1 = positions[edge.u];
      const p2 = positions[edge.v];
      const stepIndex = steps.findIndex((s) => s.edge === edge);
      const isRevealed = stepIndex >= 0 && stepIndex < revealed;
      const isCurrent = stepIndex === revealed - 1;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      if (isRevealed && steps[stepIndex].accepted) {
        ctx.strokeStyle = isCurrent ? '#facc15' : '#22c55e';
        ctx.lineWidth = 3;
      } else if (isRevealed && !steps[stepIndex].accepted) {
        ctx.strokeStyle = isCurrent ? '#ef4444' : 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = isCurrent ? 2.5 : 1.5;
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // Weight label at midpoint
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.fillStyle = '#a6adc8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(edge.w), midX, midY);
    });

    // Draw nodes, colored by component
    NODE_LABELS.forEach((label, i) => {
      const root = componentOf[i];
      if (!rootColorIndex.has(root)) {
        rootColorIndex.set(root, COLORS[nextColor % COLORS.length]);
        nextColor++;
      }
      const p = positions[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = rootColorIndex.get(root);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e1e2e';
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, p.x, p.y);
    });
  }

  function updateStats() {
    let accepted = 0,
      rejected = 0,
      weight = 0;
    for (let i = 0; i < revealed; i++) {
      if (steps[i].accepted) {
        accepted++;
        weight += steps[i].edge.w;
      } else {
        rejected++;
      }
    }
    statAccepted.textContent = String(accepted);
    statRejected.textContent = String(rejected);
    statWeight.textContent = String(weight);
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🌲 BÀI 5: KRUSKAL MST — Union-Find */\n\n' +
      'const sorted = edges.slice().sort((a, b) => a.w - b.w);\n' +
      'const dsu = new UnionFind(numNodes);\n' +
      'const mst = [];\n\n' +
      'for (const edge of sorted) {\n' +
      '  if (dsu.union(edge.u, edge.v)) {\n' +
      '    mst.push(edge); // NHẬN: 2 đầu cạnh khác nhóm\n' +
      '  } else {\n' +
      '    // TỪ CHỐI: 2 đầu cạnh đã cùng nhóm -> sẽ tạo chu trình\n' +
      '  }\n' +
      '}\n\n' +
      '// Bước hiện tại: ' +
      revealed +
      '/' +
      steps.length +
      '\n' +
      '// Cạnh đã nhận: ' +
      statAccepted.textContent +
      ', tổng trọng số MST: ' +
      statWeight.textContent;

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function stopAnimation() {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }
  }

  function tick() {
    if (revealed >= steps.length) {
      stopAnimation();
      log('Hoàn tất! MST có ' + statAccepted.textContent + ' cạnh, tổng trọng số ' + statWeight.textContent + '.');
      return;
    }
    const step = steps[revealed];
    const uLabel = NODE_LABELS[step.edge.u];
    const vLabel = NODE_LABELS[step.edge.v];
    if (step.accepted) {
      log('Cạnh (' + uLabel + ',' + vLabel + ') trọng số ' + step.edge.w + ': khác nhóm → NHẬN, union.');
    } else {
      log('Cạnh (' + uLabel + ',' + vLabel + ') trọng số ' + step.edge.w + ': CÙNG NHÓM → TỪ CHỐI (tạo chu trình).');
    }
    revealed++;
    draw();
    updateStats();
    updateJsCodeDisplay();
  }

  function runVisual() {
    stopAnimation();
    clearLog();
    runKruskal();
    revealed = 0;
    draw();
    updateStats();
    updateJsCodeDisplay();
    log('Bắt đầu Kruskal: xét ' + steps.length + ' cạnh theo trọng số tăng dần...');
    animTimer = setInterval(tick, 700);
  }

  function reset() {
    stopAnimation();
    steps = [];
    revealed = 0;
    clearLog();
    log('Đã reset. Bấm "Chạy Kruskal" để bắt đầu.');
    draw();
    updateStats();
    updateJsCodeDisplay();
  }

  runBtn.addEventListener('click', runVisual);
  resetBtn.addEventListener('click', reset);

  reset();
})();
