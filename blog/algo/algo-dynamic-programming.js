/* Bài 7: Edit Distance Visualizer — bảng DP + truy vết thao tác */
(function () {
  const canvas = document.getElementById('dp-canvas');
  if (!canvas) return; // page without the sandbox

  const stringAInput = document.getElementById('dp-string-a');
  const stringBInput = document.getElementById('dp-string-b');
  const computeBtn = document.getElementById('dp-compute-btn');
  const logEl = document.getElementById('dp-log');
  const statDistance = document.getElementById('dp-stat-distance');
  const statCells = document.getElementById('dp-stat-cells');
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

  let a = '';
  let b = '';
  let dp = [];
  let pathSet = new Set(); // "i,j" cells on the traceback path

  function key(i, j) {
    return i + ',' + j;
  }

  function editDistance(strA, strB) {
    const m = strA.length;
    const n = strB.length;
    const table = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) table[i][0] = i;
    for (let j = 0; j <= n; j++) table[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (strA[i - 1] === strB[j - 1]) {
          table[i][j] = table[i - 1][j - 1];
        } else {
          table[i][j] = 1 + Math.min(table[i - 1][j], table[i][j - 1], table[i - 1][j - 1]);
        }
      }
    }
    return table;
  }

  function traceback(strA, strB, table) {
    let i = strA.length;
    let j = strB.length;
    const path = new Set();
    const ops = [];
    path.add(key(i, j));
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && strA[i - 1] === strB[j - 1] && table[i][j] === table[i - 1][j - 1]) {
        ops.push('Giữ nguyên "' + strA[i - 1] + '" (khớp)');
        i--;
        j--;
      } else if (i > 0 && j > 0 && table[i][j] === table[i - 1][j - 1] + 1) {
        ops.push('Thay thế "' + strA[i - 1] + '" → "' + strB[j - 1] + '"');
        i--;
        j--;
      } else if (i > 0 && table[i][j] === table[i - 1][j] + 1) {
        ops.push('Xoá "' + strA[i - 1] + '"');
        i--;
      } else {
        ops.push('Thêm "' + strB[j - 1] + '"');
        j--;
      }
      path.add(key(i, j));
    }
    ops.reverse();
    return { path, ops };
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    if (!dp.length) return;

    const m = a.length;
    const n = b.length;
    const marginLeft = 40;
    const marginTop = 40;
    const cellW = Math.min(56, (CSS_W - marginLeft - 10) / (n + 1));
    const cellH = Math.min(40, (CSS_H - marginTop - 10) / (m + 1));

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Column headers (string B chars), row headers (string A chars)
    ctx.fillStyle = '#a6adc8';
    for (let j = 0; j <= n; j++) {
      const label = j === 0 ? 'ε' : b[j - 1];
      ctx.fillText(label, marginLeft + (j + 0.5) * cellW, marginTop - 14);
    }
    for (let i = 0; i <= m; i++) {
      const label = i === 0 ? 'ε' : a[i - 1];
      ctx.fillText(label, marginLeft - 16, marginTop + (i + 0.5) * cellH);
    }

    // Cells
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        const x = marginLeft + j * cellW;
        const y = marginTop + i * cellH;
        const onPath = pathSet.has(key(i, j));

        ctx.fillStyle = onPath ? '#f59e0b' : '#181825';
        ctx.strokeStyle = '#45475a';
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, cellW, cellH);
        ctx.strokeRect(x, y, cellW, cellH);

        ctx.fillStyle = onPath ? '#1e1e2e' : '#cdd6f4';
        ctx.font = onPath ? 'bold 12px monospace' : '11px monospace';
        ctx.fillText(String(dp[i][j]), x + cellW / 2, y + cellH / 2);
      }
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

  function updateJsCodeDisplay() {
    const code =
      '/* 📝 BÀI 7: EDIT DISTANCE — "' +
      a +
      '" → "' +
      b +
      '" */\n\n' +
      'function editDistance(a, b) {\n' +
      '  const dp = Array.from({length: a.length+1}, () => new Array(b.length+1).fill(0));\n' +
      '  for (let i = 0; i <= a.length; i++) dp[i][0] = i;\n' +
      '  for (let j = 0; j <= b.length; j++) dp[0][j] = j;\n\n' +
      '  for (let i = 1; i <= a.length; i++) {\n' +
      '    for (let j = 1; j <= b.length; j++) {\n' +
      '      if (a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1];\n' +
      '      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n\n' +
      '// Kết quả: editDistance("' +
      a +
      '", "' +
      b +
      '") = ' +
      (dp.length ? dp[a.length][b.length] : '?');

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function compute() {
    a = stringAInput.value.trim();
    b = stringBInput.value.trim();
    if (!a || !b) return;
    clearLog();
    dp = editDistance(a, b);
    const { path, ops } = traceback(a, b, dp);
    pathSet = path;

    statDistance.textContent = String(dp[a.length][b.length]);
    statCells.textContent = String((a.length + 1) * (b.length + 1));

    log('Edit Distance("' + a + '", "' + b + '") = ' + dp[a.length][b.length]);
    ops.forEach((op) => log(op));

    draw();
    updateJsCodeDisplay();
  }

  computeBtn.addEventListener('click', compute);

  compute(); // seed with default "kitten" -> "sitting"
})();
