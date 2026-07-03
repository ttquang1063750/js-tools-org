/* Bài 3: Interactive Git Graph Simulator — commit(), branch(), checkout()/switch(), detached HEAD */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return; // page without the sandbox

  const cmdInput = document.getElementById('graph-cmd-input');
  const runBtn = document.getElementById('graph-run-btn');
  const resetBtn = document.getElementById('graph-reset-btn');
  const logEl = document.getElementById('graph-log');
  const statusLineEl = document.getElementById('graph-status-line');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 600;
  const CSS_H = 300;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let commits, branches, head, laneOf, laneContinued, nextLane, commitCounter;

  function fakeHash(seed) {
    let h = (seed * 2654435761) % 4294967296;
    if (h < 0) h += 4294967296;
    return h.toString(16).padStart(8, '0').slice(0, 7);
  }

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function logCmd(cmd) {
    const line = document.createElement('div');
    line.className = 'cmd-line';
    line.textContent = '$ ' + cmd;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function logErr(message) {
    const line = document.createElement('div');
    line.className = 'err-line';
    line.textContent = 'Lỗi: ' + message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  function currentCommitId() {
    return head.type === 'branch' ? branches[head.name] : head.commitId;
  }

  function findCommit(idOrHash) {
    return commits.find((c) => c.id === idOrHash || c.hash === idOrHash);
  }

  function assignLane(id, parentId) {
    if (parentId === null) {
      laneOf[id] = 0;
      return;
    }
    if (!laneContinued.has(parentId)) {
      laneOf[id] = laneOf[parentId];
      laneContinued.add(parentId);
    } else {
      laneOf[id] = nextLane++;
    }
  }

  function doCommit(message) {
    const parentId = currentCommitId();
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    commits.push({ id, hash, parent: parentId, message, order: commits.length });
    assignLane(id, parentId);
    if (head.type === 'branch') {
      branches[head.name] = id;
      log('Tạo commit ' + id + ' (' + hash + ') trên branch "' + head.name + '".');
    } else {
      head = { type: 'detached', commitId: id };
      log('Tạo commit ' + id + ' (' + hash + ') — HEAD detached, KHÔNG branch nào trỏ tới commit này.');
    }
  }

  function doBranch(name) {
    if (branches[name]) {
      logErr('Branch "' + name + '" đã tồn tại.');
      return;
    }
    const cur = currentCommitId();
    branches[name] = cur;
    log('Tạo branch "' + name + '" trỏ tới ' + cur + ' (chỉ là 1 file ref mới — HEAD không đổi).');
  }

  function doCheckout(target, allowDetach) {
    if (branches[target]) {
      head = { type: 'branch', name: target };
      log('HEAD giờ trỏ tới branch "' + target + '" (commit ' + branches[target] + ').');
      return;
    }
    if (!allowDetach) {
      logErr('git switch chỉ chuyển sang branch đã tồn tại. Dùng git checkout để detach vào 1 commit.');
      return;
    }
    const commit = findCommit(target);
    if (commit) {
      head = { type: 'detached', commitId: commit.id };
      log('HEAD detached, trỏ thẳng vào commit ' + commit.id + ' (' + commit.hash + ').');
      return;
    }
    logErr('Không tìm thấy branch hoặc commit nào tên "' + target + '".');
  }

  function doLog() {
    const lines = [];
    let cur = currentCommitId();
    while (cur) {
      const c = findCommit(cur);
      if (!c) break;
      lines.push(c.id + ' ' + c.hash + ' — ' + c.message);
      cur = c.parent;
    }
    if (!lines.length) {
      log('(không có commit nào)');
      return;
    }
    lines.forEach((line) => log(line));
  }

  function parseAndRun(cmdStr) {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;
    logCmd(trimmed);
    const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (parts[0] !== 'git') {
      logErr('Lệnh phải bắt đầu bằng "git".');
      return;
    }
    const sub = parts[1];
    const rest = parts.slice(2);

    if (sub === 'commit') {
      let message = 'Commit không tiêu đề';
      const mIdx = rest.indexOf('-m');
      if (mIdx !== -1 && rest[mIdx + 1]) {
        message = rest
          .slice(mIdx + 1)
          .join(' ')
          .replace(/^"|"$/g, '');
      }
      doCommit(message);
    } else if (sub === 'branch') {
      if (!rest[0]) {
        logErr('Cần tên branch: git branch <tên>');
        return;
      }
      doBranch(rest[0]);
    } else if (sub === 'checkout') {
      if (rest[0] === '-b') {
        if (!rest[1]) {
          logErr('Cần tên branch: git checkout -b <tên>');
          return;
        }
        doBranch(rest[1]);
        doCheckout(rest[1], true);
      } else if (rest[0]) {
        doCheckout(rest[0], true);
      } else {
        logErr('Cần tên branch hoặc hash: git checkout <tên|hash>');
      }
    } else if (sub === 'switch') {
      if (rest[0] === '-c') {
        if (!rest[1]) {
          logErr('Cần tên branch: git switch -c <tên>');
          return;
        }
        doBranch(rest[1]);
        doCheckout(rest[1], true);
      } else if (rest[0]) {
        doCheckout(rest[0], false);
      } else {
        logErr('Cần tên branch: git switch <tên>');
      }
    } else if (sub === 'log') {
      doLog();
    } else {
      logErr('Lệnh "git ' + sub + '" chưa được hỗ trợ trong sandbox này.');
    }
  }

  function reachableFromBranches() {
    const seen = new Set();
    Object.values(branches).forEach((startId) => {
      let cur = startId;
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        const c = findCommit(cur);
        cur = c ? c.parent : null;
      }
    });
    return seen;
  }

  function drawPill(x, y, text, color, textColor) {
    ctx.font = 'bold 10px monospace';
    const w = ctx.measureText(text).width + 14;
    const h = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 4);
    ctx.fill();
    ctx.fillStyle = textColor || '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - h / 2);
    ctx.textBaseline = 'alphabetic';
    return h;
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const reachable = reachableFromBranches();
    const spacingX = 80;
    const baseX = 50;
    const laneHeight = 70;
    const baseY = 60;

    function pos(id) {
      const c = findCommit(id);
      return { x: baseX + c.order * spacingX, y: baseY + laneOf[id] * laneHeight };
    }

    // Edges
    commits.forEach((c) => {
      if (!c.parent) return;
      const p1 = pos(c.parent);
      const p2 = pos(c.id);
      ctx.strokeStyle = '#45475a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Commit nodes
    commits.forEach((c) => {
      const { x, y } = pos(c.id);
      const orphaned = !reachable.has(c.id);
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = orphaned ? '#313244' : '#64748b';
      ctx.fill();
      ctx.setLineDash(orphaned ? [3, 2] : []);
      ctx.strokeStyle = orphaned ? '#f38ba8' : '#1e1e2e';
      ctx.lineWidth = orphaned ? 1.5 : 1;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.id, x, y);
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#a6adc8';
      ctx.font = '8px monospace';
      ctx.fillText(c.hash, x, y + 28);
    });

    // Branch tags (stacked if multiple point to the same commit)
    const stackCount = {};
    Object.entries(branches).forEach(([name, commitId]) => {
      const { x, y } = pos(commitId);
      const n = stackCount[commitId] || 0;
      stackCount[commitId] = n + 1;
      drawPill(x, y - 22 - n * 22, name, '#3b82f6');
    });

    // HEAD tag
    if (head.type === 'branch') {
      const commitId = branches[head.name];
      const { x, y } = pos(commitId);
      const n = stackCount[commitId] || 0;
      drawPill(x, y - 22 - n * 22, 'HEAD', '#f9e2af', '#1e1e2e');
    } else {
      const { x, y } = pos(head.commitId);
      drawPill(x, y - 22, 'HEAD (detached)', '#f38ba8', '#1e1e2e');
    }
  }

  function updateStatusLine() {
    if (head.type === 'branch') {
      statusLineEl.textContent = 'HEAD -> ' + head.name + ' (commit ' + branches[head.name] + ')';
    } else {
      statusLineEl.textContent = 'HEAD (detached) -> ' + head.commitId;
    }
  }

  function updateJsCodeDisplay() {
    const branchList = Object.entries(branches)
      .map(([name, id]) => '  ' + name + ': ' + id)
      .join('\n');
    const code =
      '/* 🌿 BÀI 3: BRANCH & HEAD */\n\n' +
      '// .git/HEAD hiện tại:\n' +
      (head.type === 'branch'
        ? '// ref: refs/heads/' + head.name + '\n'
        : '// ' + head.commitId + '  (detached — hash trực tiếp, không qua tên branch)\n') +
      '\n// .git/refs/heads/*:\n' +
      branchList +
      '\n\n// Tổng số commit đã tạo: ' +
      commits.length;

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function refresh() {
    draw();
    updateStatusLine();
    updateJsCodeDisplay();
  }

  function init() {
    commits = [];
    branches = {};
    laneOf = {};
    laneContinued = new Set();
    nextLane = 1;
    commitCounter = 1;
    commits.push({ id: 'C1', hash: fakeHash(1), parent: null, message: 'Initial commit', order: 0 });
    laneOf['C1'] = 0;
    commitCounter = 2;
    branches['main'] = 'C1';
    head = { type: 'branch', name: 'main' };
  }

  runBtn.addEventListener('click', () => {
    parseAndRun(cmdInput.value);
    cmdInput.value = '';
    refresh();
  });

  cmdInput.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      parseAndRun(cmdInput.value);
      cmdInput.value = '';
      refresh();
    }
  });

  resetBtn.addEventListener('click', () => {
    init();
    clearLog();
    log('Đã reset. 1 commit ban đầu trên branch "main", HEAD đang trỏ tới đó.');
    refresh();
  });

  init();
  log('Sẵn sàng. Gõ lệnh Git giả lập ở trên rồi bấm "Chạy" (hoặc Enter).');
  refresh();
})();
