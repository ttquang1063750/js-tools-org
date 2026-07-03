/* Bài 3: Sorting Race Visualizer — Quick/Merge/Heap/Radix chạy song song bằng generator */
(function () {
  const raceBtn = document.getElementById('sort-race-btn');
  if (!raceBtn) return; // page without the sandbox

  const randomBtn = document.getElementById('sort-random-btn');
  const speedInput = document.getElementById('sort-speed');
  const rankingEl = document.getElementById('sort-ranking');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const N = 30;
  const MAX_VAL = 99;

  const panels = {
    quick: { canvas: document.getElementById('sort-canvas-quick') },
    merge: { canvas: document.getElementById('sort-canvas-merge') },
    heap: { canvas: document.getElementById('sort-canvas-heap') },
    radix: { canvas: document.getElementById('sort-canvas-radix') },
  };

  Object.keys(panels).forEach((key) => {
    const p = panels[key];
    p.ctx = p.canvas.getContext('2d');
    p.comparisonsEl = document.getElementById(key + '-comparisons');
    p.swapsEl = document.getElementById(key + '-swaps');
  });

  let baseArray = randomArray();
  let animTimer = null;
  let raceFinishOrder = [];

  function randomArray() {
    const arr = [];
    for (let i = 0; i < N; i++) arr.push(1 + Math.floor(Math.random() * MAX_VAL));
    return arr;
  }

  function drawBars(panel, arr, active, done) {
    const ctx = panel.ctx;
    const w = panel.canvas.width;
    const h = panel.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const barW = w / arr.length;
    for (let i = 0; i < arr.length; i++) {
      const barH = (arr[i] / MAX_VAL) * (h - 6);
      let color = '#6366f1';
      if (done) color = '#22c55e';
      else if (active && active.includes(i)) color = '#f59e0b';
      ctx.fillStyle = color;
      ctx.fillRect(i * barW + 1, h - barH, barW - 2, barH);
    }
  }

  // ---- Generator-based sort algorithms: yield {arr, active, stats} at each visual step ----

  function* quickSortGen(arr) {
    const stats = { comparisons: 0, swaps: 0 };
    function* qs(lo, hi) {
      if (lo >= hi) return;
      const pivot = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        stats.comparisons++;
        yield { active: [j, hi], stats };
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          stats.swaps++;
          yield { active: [i, j], stats };
        }
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      stats.swaps++;
      yield { active: [i + 1, hi], stats };
      yield* qs(lo, i);
      yield* qs(i + 2, hi);
    }
    yield* qs(0, arr.length - 1);
  }

  function* mergeSortGen(arr) {
    const stats = { comparisons: 0, swaps: 0 };
    function* sort(lo, hi) {
      if (hi - lo <= 1) return;
      const mid = Math.floor((lo + hi) / 2);
      yield* sort(lo, mid);
      yield* sort(mid, hi);

      const left = arr.slice(lo, mid);
      const right = arr.slice(mid, hi);
      let i = 0,
        j = 0,
        k = lo;
      while (i < left.length && j < right.length) {
        stats.comparisons++;
        yield { active: [k], stats };
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
        stats.swaps++;
      }
      while (i < left.length) {
        arr[k++] = left[i++];
        stats.swaps++;
        yield { active: [k - 1], stats };
      }
      while (j < right.length) {
        arr[k++] = right[j++];
        stats.swaps++;
        yield { active: [k - 1], stats };
      }
    }
    yield* sort(0, arr.length);
  }

  function* heapSortGen(arr) {
    const stats = { comparisons: 0, swaps: 0 };
    function* heapify(size, root) {
      let largest = root;
      const left = 2 * root + 1,
        right = 2 * root + 2;
      if (left < size) {
        stats.comparisons++;
        if (arr[left] > arr[largest]) largest = left;
      }
      if (right < size) {
        stats.comparisons++;
        if (arr[right] > arr[largest]) largest = right;
      }
      if (largest !== root) {
        [arr[root], arr[largest]] = [arr[largest], arr[root]];
        stats.swaps++;
        yield { active: [root, largest], stats };
        yield* heapify(size, largest);
      }
    }
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* heapify(n, i);
    for (let end = n - 1; end > 0; end--) {
      [arr[0], arr[end]] = [arr[end], arr[0]];
      stats.swaps++;
      yield { active: [0, end], stats };
      yield* heapify(end, 0);
    }
  }

  function* radixSortGen(arr) {
    const stats = { comparisons: 0, swaps: 0 };
    const max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      stats.comparisons++; // count each digit-pass as one "scan"
      const n = arr.length;
      const output = new Array(n);
      const count = new Array(10).fill(0);
      for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;
      for (let i = 1; i < 10; i++) count[i] += count[i - 1];
      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
      }
      for (let i = 0; i < n; i++) {
        arr[i] = output[i];
        stats.swaps++;
      }
      yield { active: [], stats };
    }
  }

  const generatorFactories = {
    quick: quickSortGen,
    merge: mergeSortGen,
    heap: heapSortGen,
    radix: radixSortGen,
  };

  let runners = null;

  function setupRunners() {
    runners = {};
    Object.keys(generatorFactories).forEach((key) => {
      const arr = baseArray.slice();
      runners[key] = {
        arr,
        gen: generatorFactories[key](arr),
        done: false,
        active: [],
        stats: { comparisons: 0, swaps: 0 },
      };
    });
    raceFinishOrder = [];
  }

  function drawAll() {
    Object.keys(panels).forEach((key) => {
      const r = runners[key];
      const p = panels[key];
      drawBars(p, r.arr, r.active, r.done);
      p.comparisonsEl.textContent = String(r.stats.comparisons);
      p.swapsEl.textContent = String(r.stats.swaps);
    });
  }

  function updateRanking() {
    rankingEl.innerHTML = '';
    if (raceFinishOrder.length === 0) {
      rankingEl.textContent = 'Chưa có kết quả.';
      return;
    }
    const names = { quick: 'Quick Sort', merge: 'Merge Sort', heap: 'Heap Sort', radix: 'Radix Sort' };
    raceFinishOrder.forEach((key, i) => {
      const line = document.createElement('div');
      line.textContent = i + 1 + '. ' + names[key] + ' (' + runners[key].stats.comparisons + ' so sánh/lượt)';
      rankingEl.appendChild(line);
    });
  }

  function stopAnimation() {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }
  }

  function tick() {
    const stepsPerTick = parseInt(speedInput.value, 10) || 3;
    let allDone = true;
    Object.keys(runners).forEach((key) => {
      const r = runners[key];
      if (r.done) return;
      allDone = false;
      for (let s = 0; s < stepsPerTick && !r.done; s++) {
        const next = r.gen.next();
        if (next.done) {
          r.done = true;
          r.active = [];
          raceFinishOrder.push(key);
        } else {
          r.active = next.value.active;
          r.stats = next.value.stats;
        }
      }
    });
    drawAll();
    updateRanking();
    if (allDone) stopAnimation();
  }

  function runRace() {
    stopAnimation();
    setupRunners();
    drawAll();
    updateRanking();
    animTimer = setInterval(tick, 40);
  }

  function drawIdle() {
    Object.keys(panels).forEach((key) => {
      drawBars(panels[key], baseArray, [], false);
    });
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🏁 BÀI 3: SORTING RACE — mảng ' +
      N +
      ' phần tử */\n\n' +
      'function* quickSortGen(arr) {\n' +
      '  function* qs(lo, hi) {\n' +
      '    if (lo >= hi) return;\n' +
      '    const pivot = arr[hi];\n' +
      '    let i = lo - 1;\n' +
      '    for (let j = lo; j < hi; j++) {\n' +
      '      yield { active: [j, hi] }; // BƯỚC so sánh\n' +
      '      if (arr[j] < pivot) {\n' +
      '        i++; [arr[i], arr[j]] = [arr[j], arr[i]];\n' +
      '        yield { active: [i, j] }; // BƯỚC hoán đổi\n' +
      '      }\n' +
      '    }\n' +
      '    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];\n' +
      '    yield* qs(lo, i);\n' +
      '    yield* qs(i + 2, hi);\n' +
      '  }\n' +
      '  yield* qs(0, arr.length - 1);\n' +
      '}\n\n' +
      '// Driver: advance mọi generator N bước mỗi 40ms, vẽ lại canvas\n' +
      'setInterval(() => {\n' +
      '  for (const algo of [quick, merge, heap, radix]) {\n' +
      '    if (!algo.done) { const step = algo.gen.next(); /* ...vẽ bar chart... */ }\n' +
      '  }\n' +
      '}, 40);';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  raceBtn.addEventListener('click', runRace);
  randomBtn.addEventListener('click', () => {
    stopAnimation();
    baseArray = randomArray();
    drawIdle();
    rankingEl.textContent = 'Đã tạo mảng ngẫu nhiên mới.';
    Object.keys(panels).forEach((key) => {
      panels[key].comparisonsEl.textContent = '0';
      panels[key].swapsEl.textContent = '0';
    });
  });

  drawIdle();
  rankingEl.textContent = 'Sẵn sàng. Bấm "Chạy đua" để bắt đầu.';
  updateJsCodeDisplay();
})();
