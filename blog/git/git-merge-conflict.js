/* Bài 4: Merge & Conflict Simulator — extends Bài 3's graph engine with git merge, merge-base, 3-way merge */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return; // page without the sandbox

  const cmdInput = document.getElementById('graph-cmd-input');
  const runBtn = document.getElementById('graph-run-btn');
  const fileInput = document.getElementById('graph-file-input');
  const resetBtn = document.getElementById('graph-reset-btn');
  const logEl = document.getElementById('graph-log');
  const statusLineEl = document.getElementById('graph-status-line');
  const conflictPanel = document.getElementById('graph-conflict-panel');
  const conflictTextarea = document.getElementById('graph-conflict-textarea');
  const resolveBtn = document.getElementById('graph-resolve-btn');
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

  let commits, branches, head, laneOf, laneContinued, nextLane, commitCounter, fileContentAt, pendingMerge;

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

  function assignLane(id, primaryParentId) {
    if (!primaryParentId) {
      laneOf[id] = 0;
      return;
    }
    if (!laneContinued.has(primaryParentId)) {
      laneOf[id] = laneOf[primaryParentId];
      laneContinued.add(primaryParentId);
    } else {
      laneOf[id] = nextLane++;
    }
  }

  function doCommit(message) {
    if (pendingMerge) {
      logErr('Đang có xung đột merge chưa giải quyết — xử lý trong ô bên dưới trước.');
      return;
    }
    const parentId = currentCommitId();
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    const parents = parentId ? [parentId] : [];
    commits.push({ id, hash, parents, message, order: commits.length });
    assignLane(id, parentId);
    fileContentAt[id] = fileInput.value;
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
    log('Tạo branch "' + name + '" trỏ tới ' + cur + '.');
  }

  function doCheckout(target) {
    if (pendingMerge) {
      logErr('Đang có xung đột merge chưa giải quyết — không thể chuyển nhánh lúc này.');
      return;
    }
    if (branches[target]) {
      head = { type: 'branch', name: target };
      log('HEAD giờ trỏ tới branch "' + target + '" (commit ' + branches[target] + ').');
      return;
    }
    const commit = findCommit(target);
    if (commit) {
      head = { type: 'detached', commitId: commit.id };
      log('HEAD detached, trỏ thẳng vào commit ' + commit.id + '.');
      return;
    }
    logErr('Không tìm thấy branch hoặc commit nào tên "' + target + '".');
  }

  function ancestorsOf(id) {
    const set = new Set();
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || set.has(cur)) continue;
      set.add(cur);
      const c = findCommit(cur);
      if (c) c.parents.forEach((p) => stack.push(p));
    }
    return set;
  }

  function mergeBase(a, b) {
    const ancA = ancestorsOf(a);
    const visited = new Set();
    const queue = [b];
    while (queue.length) {
      const cur = queue.shift();
      if (!cur) continue;
      if (ancA.has(cur)) return cur;
      if (visited.has(cur)) continue;
      visited.add(cur);
      const c = findCommit(cur);
      if (c) c.parents.forEach((p) => queue.push(p));
    }
    return null;
  }

  function finishMerge(parent1, parent2, content, branchName) {
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    commits.push({
      id,
      hash,
      parents: [parent1, parent2],
      message: 'Merge branch "' + branchName + '"',
      order: commits.length,
    });
    assignLane(id, parent1);
    fileContentAt[id] = content;
    branches[head.name] = id;
    log('Tạo merge commit ' + id + ' (' + hash + ') — 2 cha: ' + parent1 + ' và ' + parent2 + '.');
  }

  function doMerge(branchName) {
    if (pendingMerge) {
      logErr('Đang có xung đột merge chưa giải quyết — xử lý trong ô bên dưới trước.');
      return;
    }
    if (!branches[branchName]) {
      logErr('Branch "' + branchName + '" không tồn tại.');
      return;
    }
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để merge (không thể merge khi HEAD detached).');
      return;
    }
    const oursId = branches[head.name];
    const theirsId = branches[branchName];
    if (oursId === theirsId) {
      log('"' + branchName + '" đang ở cùng vị trí với HEAD — không có gì để merge.');
      return;
    }
    const base = mergeBase(oursId, theirsId);
    if (base === theirsId) {
      log('"' + branchName + '" đã là tổ tiên của HEAD — không có gì để merge.');
      return;
    }
    if (base === oursId) {
      branches[head.name] = theirsId;
      log('Fast-forward: "' + head.name + '" di chuyển thẳng tới ' + theirsId + ' (không tạo commit mới).');
      return;
    }

    const baseContent = fileContentAt[base];
    const oursContent = fileContentAt[oursId];
    const theirsContent = fileContentAt[theirsId];

    if (oursContent === theirsContent) {
      finishMerge(oursId, theirsId, oursContent, branchName);
    } else if (oursContent === baseContent) {
      finishMerge(oursId, theirsId, theirsContent, branchName);
      log('Không xung đột: chỉ "' + branchName + '" thay đổi nội dung — lấy bản của "' + branchName + '".');
    } else if (theirsContent === baseContent) {
      finishMerge(oursId, theirsId, oursContent, branchName);
      log('Không xung đột: chỉ "' + head.name + '" thay đổi nội dung — giữ bản hiện tại.');
    } else {
      pendingMerge = { oursId, theirsId, branchName, oursBranchName: head.name };
      conflictTextarea.value =
        '<<<<<<< HEAD (' + head.name + ')\n' + oursContent + '\n=======\n' + theirsContent + '\n>>>>>>> ' + branchName;
      conflictPanel.classList.add('is-visible');
      log(
        'XUNG ĐỘT: cả "' +
          head.name +
          '" và "' +
          branchName +
          '" đều sửa nội dung khác nhau kể từ base (' +
          base +
          '). Giải quyết trong ô bên dưới.'
      );
    }
  }

  function doLog() {
    const lines = [];
    let cur = currentCommitId();
    const seen = new Set();
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      const c = findCommit(cur);
      if (!c) break;
      lines.push(c.id + ' ' + c.hash + ' — ' + c.message);
      cur = c.parents[0];
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
        doCheckout(rest[1]);
      } else if (rest[0]) {
        doCheckout(rest[0]);
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
        doCheckout(rest[1]);
      } else if (rest[0]) {
        doCheckout(rest[0]);
      } else {
        logErr('Cần tên branch: git switch <tên>');
      }
    } else if (sub === 'merge') {
      if (!rest[0]) {
        logErr('Cần tên branch: git merge <tên>');
        return;
      }
      doMerge(rest[0]);
    } else if (sub === 'log') {
      doLog();
    } else {
      logErr('Lệnh "git ' + sub + '" chưa được hỗ trợ trong sandbox này.');
    }
  }

  function reachableFromBranches() {
    const seen = new Set();
    Object.values(branches).forEach((startId) => {
      const stack = [startId];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || seen.has(cur)) continue;
        seen.add(cur);
        const c = findCommit(cur);
        if (c) c.parents.forEach((p) => stack.push(p));
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

    // Edges (support multiple parents for merge commits)
    commits.forEach((c) => {
      c.parents.forEach((parentId) => {
        const p1 = pos(parentId);
        const p2 = pos(c.id);
        ctx.strokeStyle = '#45475a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
    });

    // Commit nodes
    commits.forEach((c) => {
      const { x, y } = pos(c.id);
      const orphaned = !reachable.has(c.id);
      const isMerge = c.parents.length === 2;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = orphaned ? '#313244' : isMerge ? '#a855f7' : '#64748b';
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

    // Branch tags
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

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🟪 merge commit (2 cha)   ⬜ commit thường', 10, CSS_H - 8);
  }

  function updateStatusLine() {
    const base =
      head.type === 'branch'
        ? 'HEAD -> ' + head.name + ' (commit ' + branches[head.name] + ')'
        : 'HEAD (detached) -> ' + head.commitId;
    const content = fileContentAt[currentCommitId()];
    statusLineEl.textContent = base + ' — nội dung: "' + content + '"';
  }

  function updateJsCodeDisplay() {
    const branchList = Object.entries(branches)
      .map(([name, id]) => '  ' + name + ': ' + id)
      .join('\n');
    const code =
      '/* 🔀 BÀI 4: MERGE & CONFLICT */\n\n' +
      'function threeWayMerge(base, ours, theirs) {\n' +
      '  if (ours === theirs) return ours;\n' +
      '  if (ours === base) return theirs;   // chỉ theirs đổi\n' +
      '  if (theirs === base) return ours;   // chỉ ours đổi\n' +
      '  return CONFLICT;                    // cả 2 đổi khác nhau\n}\n\n' +
      '// .git/refs/heads/*:\n' +
      branchList +
      '\n\n// Tổng số commit: ' +
      commits.length +
      (pendingMerge ? '\n// ⚠️ Đang có 1 merge conflict CHƯA giải quyết' : '');

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
    commitCounter = 2;
    fileContentAt = {};
    pendingMerge = null;
    conflictPanel.classList.remove('is-visible');
    commits.push({ id: 'C1', hash: fakeHash(1), parents: [], message: 'Initial commit', order: 0 });
    laneOf['C1'] = 0;
    fileContentAt['C1'] = 'version = 1';
    branches['main'] = 'C1';
    head = { type: 'branch', name: 'main' };
    fileInput.value = 'version = 1';
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

  resolveBtn.addEventListener('click', () => {
    if (!pendingMerge) return;
    const content = conflictTextarea.value;
    finishMerge(pendingMerge.oursId, pendingMerge.theirsId, content, pendingMerge.branchName);
    pendingMerge = null;
    conflictPanel.classList.remove('is-visible');
    refresh();
  });

  resetBtn.addEventListener('click', () => {
    init();
    clearLog();
    log('Đã reset. 1 commit ban đầu trên branch "main".');
    refresh();
  });

  init();
  log('Sẵn sàng. Tạo branch, sửa nội dung file, commit trên mỗi nhánh, rồi thử "git merge".');
  refresh();
})();
