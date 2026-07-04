/* Bài 2: Three Trees Visualizer — Working Directory / Staging Index / HEAD */
(function () {
  const canvas = document.getElementById('tree3-canvas');
  if (!canvas) return; // page without the sandbox

  const file1Input = document.getElementById('tree3-file1');
  const file2Input = document.getElementById('tree3-file2');
  const add1Btn = document.getElementById('tree3-add1-btn');
  const add2Btn = document.getElementById('tree3-add2-btn');
  const msgInput = document.getElementById('tree3-commit-msg');
  const commitBtn = document.getElementById('tree3-commit-btn');
  const resetBtn = document.getElementById('tree3-reset-btn');
  const logEl = document.getElementById('tree3-log');
  const statusTableEl = document.getElementById('tree3-status-table');
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

  const FILE_NAMES = ['README.md', 'app.js'];
  const DEFAULTS = { 'README.md': 'Xin chào Git!', 'app.js': 'console.log("hello");' };

  let staging = { ...DEFAULTS };
  let head = { ...DEFAULTS };

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  function truncateText(s, n) {
    const oneLine = s.replace(/\n/g, ' ');
    return oneLine.length > n ? oneLine.slice(0, n) + '…' : oneLine;
  }

  function getWD() {
    return { 'README.md': file1Input.value, 'app.js': file2Input.value };
  }

  function fileStatus(name) {
    const wd = getWD();
    const stagedChange = staging[name] !== head[name];
    const unstagedChange = wd[name] !== staging[name];
    if (!stagedChange && !unstagedChange) return 'clean';
    if (stagedChange && !unstagedChange) return 'staged';
    if (!stagedChange && unstagedChange) return 'unstaged';
    return 'both';
  }

  function statusLabel(status) {
    switch (status) {
      case 'clean':
        return 'Sạch — không có thay đổi';
      case 'staged':
        return 'Đã add, sẵn sàng commit (staged)';
      case 'unstaged':
        return 'Đã sửa, CHƯA add (not staged)';
      case 'both':
        return 'ĐÃ add nhưng sửa thêm sau đó (staged + unstaged)';
      default:
        return '';
    }
  }

  function addFile(name) {
    const wd = getWD();
    if (wd[name] === staging[name]) {
      log('git add "' + name + '" — không có gì thay đổi so với staging hiện tại.');
      return;
    }
    staging[name] = wd[name];
    log('git add "' + name + '" → staging cập nhật snapshot mới của file này.');
  }

  function commitAll() {
    const changed = FILE_NAMES.filter((name) => staging[name] !== head[name]);
    if (changed.length === 0) {
      log('git commit → "nothing to commit, working tree clean" (staging đã khớp HEAD).');
      return;
    }
    head = { ...staging };
    log(
      'git commit -m "' +
        (msgInput.value || 'Commit không tiêu đề') +
        '" → HEAD cập nhật cho: ' +
        changed.join(', ') +
        '.'
    );
  }

  function renderStatusTable() {
    let html = '<tr><th>File</th><th>Trạng thái</th></tr>';
    FILE_NAMES.forEach((name) => {
      html += '<tr><td>' + name + '</td><td>' + statusLabel(fileStatus(name)) + '</td></tr>';
    });
    statusTableEl.innerHTML = html;
  }

  function drawColumn(x, label, data, colorFn) {
    ctx.fillStyle = '#a6adc8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, 20);

    FILE_NAMES.forEach((name, i) => {
      const y = 50 + i * 90;
      const w = 150;
      const h = 66;
      ctx.fillStyle = colorFn(name);
      ctx.fillRect(x - w / 2, y, w, h);
      ctx.strokeStyle = '#1e1e2e';
      ctx.strokeRect(x - w / 2, y, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(name, x, y + 18);
      ctx.font = '9px monospace';
      const content = truncateText(data[name], 20);
      ctx.fillText('"' + content + '"', x, y + 38);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const wd = getWD();

    drawColumn(100, 'WORKING DIRECTORY', wd, (name) => (wd[name] !== staging[name] ? '#f59e0b' : '#22c55e'));
    drawColumn(300, 'STAGING INDEX', staging, (name) => (staging[name] !== head[name] ? '#3b82f6' : '#22c55e'));
    drawColumn(500, 'HEAD', head, () => '#64748b');

    // Arrows + labels between columns
    ctx.strokeStyle = '#45475a';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    ctx.beginPath();
    ctx.moveTo(175, 83);
    ctx.lineTo(225, 83);
    ctx.stroke();
    ctx.fillText('git add', 200, 75);

    ctx.beginPath();
    ctx.moveTo(375, 83);
    ctx.lineTo(425, 83);
    ctx.stroke();
    ctx.fillText('git commit', 400, 75);

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🟧 chưa add   🟦 đã add, chưa commit   🟩 khớp cây kế tiếp', 10, CSS_H - 8);
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🌳 BÀI 2: THREE TREES & STAGING */\n\n' +
      'function fileStatus(name) {\n' +
      '  const stagedChange = staging[name] !== head[name];\n' +
      '  const unstagedChange = workingDir[name] !== staging[name];\n' +
      '  if (!stagedChange && !unstagedChange) return "clean";\n' +
      '  if (stagedChange && !unstagedChange) return "staged";\n' +
      '  if (!stagedChange && unstagedChange) return "unstaged";\n' +
      '  return "both"; // đã add NHƯNG sửa thêm sau đó\n}\n\n' +
      '// Trạng thái hiện tại:\n' +
      FILE_NAMES.map((n) => '// ' + n + ': ' + fileStatus(n)).join('\n');

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function refresh() {
    draw();
    renderStatusTable();
    updateJsCodeDisplay();
  }

  [file1Input, file2Input].forEach((input) => {
    input.addEventListener('input', refresh);
  });

  add1Btn.addEventListener('click', () => {
    addFile('README.md');
    refresh();
  });
  add2Btn.addEventListener('click', () => {
    addFile('app.js');
    refresh();
  });

  commitBtn.addEventListener('click', () => {
    commitAll();
    refresh();
  });

  resetBtn.addEventListener('click', () => {
    file1Input.value = DEFAULTS['README.md'];
    file2Input.value = DEFAULTS['app.js'];
    staging = { ...DEFAULTS };
    head = { ...DEFAULTS };
    clearLog();
    log('Đã reset. Cả 3 cây đều khớp nhau (sạch).');
    refresh();
  });

  log('Sẵn sàng. Cả 3 cây đang khớp nhau (sạch) sau 1 commit ban đầu.');
  refresh();
})();
