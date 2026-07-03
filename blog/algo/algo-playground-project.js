/* Bài 12: Algorithm Playground — 1 step engine dùng chung cho Bubble Sort & BFS */
(function () {
  const canvas = document.getElementById('pg-canvas');
  if (!canvas) return; // page without the sandbox

  const algoSelect = document.getElementById('pg-algo-select');
  const speedInput = document.getElementById('pg-speed-input');
  const resetBtn = document.getElementById('pg-reset-btn');
  const prevBtn = document.getElementById('pg-prev-btn');
  const playBtn = document.getElementById('pg-play-btn');
  const nextBtn = document.getElementById('pg-next-btn');
  const progressEl = document.getElementById('pg-progress');
  const logEl = document.getElementById('pg-log');
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

  const BUBBLE_INPUT = [5, 3, 8, 1, 9, 2];

  const GRAPH_NODES = {
    A: { x: 300, y: 40 },
    B: { x: 140, y: 140 },
    C: { x: 460, y: 140 },
    D: { x: 140, y: 260 },
    E: { x: 460, y: 260 },
    F: { x: 300, y: 330 },
  };
  const GRAPH_ADJ = {
    A: ['B', 'C'],
    B: ['A', 'D'],
    C: ['A', 'E'],
    D: ['B', 'F'],
    E: ['C', 'F'],
    F: ['D', 'E'],
  };

  // ---- Reusable draw primitives (Section 3 of the lesson) ----
  function drawNode(x, y, label, color) {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#1e1e2e';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
    ctx.textBaseline = 'alphabetic';
  }

  function drawEdge(x1, y1, x2, y2) {
    ctx.strokeStyle = '#45475a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawBar(x, y, w, h, label, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#1e1e2e';
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + 16);
  }

  // ---- Step generators (Section 2 of the lesson) ----
  function* bubbleSortSteps(input) {
    const arr = input.slice();
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        const left = arr[j];
        const right = arr[j + 1];
        yield {
          mode: 'bubble',
          array: arr.slice(),
          compare: [j, j + 1],
          swap: null,
          desc: 'So sánh a[' + j + ']=' + left + ' và a[' + (j + 1) + ']=' + right,
        };
        if (left > right) {
          arr[j] = right;
          arr[j + 1] = left;
          yield {
            mode: 'bubble',
            array: arr.slice(),
            compare: null,
            swap: [j, j + 1],
            desc: 'Hoán đổi vì ' + left + ' > ' + right,
          };
        }
      }
    }
    yield {
      mode: 'bubble',
      array: arr.slice(),
      compare: null,
      swap: null,
      done: true,
      desc: 'Hoàn tất sắp xếp: [' + arr.join(', ') + ']',
    };
  }

  function* bfsSteps(adj, start) {
    const visited = new Set([start]);
    const queue = [start];
    yield {
      mode: 'bfs',
      visited: [...visited],
      queue: [...queue],
      current: null,
      desc: 'Bắt đầu BFS từ đỉnh ' + start + ', đưa vào hàng đợi.',
    };
    while (queue.length) {
      const cur = queue.shift();
      yield { mode: 'bfs', visited: [...visited], queue: [...queue], current: cur, desc: 'Thăm đỉnh ' + cur + '.' };
      for (const nb of adj[cur]) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
          yield {
            mode: 'bfs',
            visited: [...visited],
            queue: [...queue],
            current: cur,
            desc: 'Phát hiện ' + nb + ' chưa thăm từ ' + cur + ' → đưa vào hàng đợi.',
          };
        }
      }
    }
    yield {
      mode: 'bfs',
      visited: [...visited],
      queue: [],
      current: null,
      desc: 'BFS hoàn tất — đã thăm toàn bộ đỉnh liên thông với ' + start + '.',
    };
  }

  // ---- Draw dispatch per algorithm ----
  function drawBubble(step) {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const arr = step.array;
    const n = arr.length;
    const slotW = (CSS_W - 40) / n;
    const barW = slotW - 10;
    const maxVal = Math.max(...arr);
    arr.forEach((val, i) => {
      const barH = (val / maxVal) * 220;
      const x = 20 + i * slotW + 5;
      const y = 300 - barH;
      let color = '#3b82f6';
      if (step.compare && step.compare.includes(i)) color = '#eab308';
      if (step.swap && step.swap.includes(i)) color = '#ef4444';
      drawBar(x, y, barW, barH, String(val), color);
    });
    if (step.done) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓ Đã sắp xếp xong!', CSS_W / 2, 330);
    }
  }

  function drawBfs(step) {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    Object.entries(GRAPH_ADJ).forEach(([node, neighbors]) => {
      const a = GRAPH_NODES[node];
      neighbors.forEach((nb) => {
        const b = GRAPH_NODES[nb];
        drawEdge(a.x, a.y, b.x, b.y);
      });
    });
    Object.entries(GRAPH_NODES).forEach(([name, pos]) => {
      let color = '#313244';
      if (step.visited.includes(name)) color = '#22c55e';
      if (step.current === name) color = '#f59e0b';
      drawNode(pos.x, pos.y, name, color);
    });
    ctx.fillStyle = '#a6adc8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Hàng đợi: [' + step.queue.join(', ') + ']', 16, CSS_H - 16);
  }

  function draw(step) {
    if (step.mode === 'bubble') drawBubble(step);
    else drawBfs(step);
  }

  // ---- Step engine (Section 2 & 4 of the lesson): single source of truth ----
  let mode = 'bubble';
  let steps = [];
  let currentIndex = 0;
  let playing = false;
  let playTimer = null;

  function buildSteps() {
    pause();
    steps = mode === 'bubble' ? [...bubbleSortSteps(BUBBLE_INPUT)] : [...bfsSteps(GRAPH_ADJ, 'A')];
    renderStep(0);
  }

  function renderLog() {
    logEl.innerHTML = '';
    for (let i = 0; i <= currentIndex; i++) {
      const div = document.createElement('div');
      div.textContent = i + 1 + '. ' + steps[i].desc;
      if (i === currentIndex) div.classList.add('is-current');
      logEl.appendChild(div);
    }
    logEl.scrollTop = logEl.scrollHeight;
  }

  function updateJsCodeDisplay(step) {
    const code =
      '/* 🎮 BÀI 12: ALGORITHM PLAYGROUND — ' +
      mode.toUpperCase() +
      ' */\n\n' +
      'function renderStep(index) {\n' +
      '  currentIndex = index;\n' +
      '  draw(steps[index]);          // vẽ canvas theo ĐÚNG step này\n' +
      '  logEl.textContent = steps[index].desc; // log ĐỒNG BỘ, cùng nguồn dữ liệu\n' +
      '}\n\n' +
      '// Bước hiện tại (' +
      (currentIndex + 1) +
      '/' +
      steps.length +
      '):\n' +
      '// ' +
      step.desc;

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function renderStep(index) {
    currentIndex = Math.max(0, Math.min(index, steps.length - 1));
    const step = steps[currentIndex];
    draw(step);
    renderLog();
    progressEl.textContent = 'Bước ' + (currentIndex + 1) + ' / ' + steps.length;
    updateJsCodeDisplay(step);
  }

  function pause() {
    playing = false;
    playBtn.textContent = '▶️';
    clearTimeout(playTimer);
    playTimer = null;
  }

  function tick() {
    if (!playing) return;
    if (currentIndex >= steps.length - 1) {
      pause();
      return;
    }
    renderStep(currentIndex + 1);
    playTimer = setTimeout(tick, Number(speedInput.value));
  }

  function play() {
    if (currentIndex >= steps.length - 1) renderStep(0);
    playing = true;
    playBtn.textContent = '⏸';
    tick();
  }

  playBtn.addEventListener('click', () => {
    if (playing) pause();
    else play();
  });
  prevBtn.addEventListener('click', () => {
    pause();
    renderStep(currentIndex - 1);
  });
  nextBtn.addEventListener('click', () => {
    pause();
    renderStep(currentIndex + 1);
  });
  resetBtn.addEventListener('click', () => {
    buildSteps();
  });
  algoSelect.addEventListener('change', () => {
    mode = algoSelect.value;
    buildSteps();
  });

  buildSteps();
})();
