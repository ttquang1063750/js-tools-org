/* Bài 6: Cherry-pick Simulator — extends graph engine with git cherry-pick + conflict handling */
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

  let commits, branches, head, laneOf, laneContinued, nextLane, commitCounter, fileContentAt, pendingCherryPick;

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

  function resolveRef(name) {
    if (branches[name]) return branches[name];
    const c = findCommit(name);
    return c ? c.id : null;
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

  function blockedByPendingCherryPick() {
    if (pendingCherryPick) {
      logErr('Đang có 1 cherry-pick xung đột chưa giải quyết — xử lý trong ô bên dưới trước.');
      return true;
    }
    return false;
  }

  function doCommit(message) {
    if (blockedByPendingCherryPick()) return;
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
      log('Tạo commit ' + id + ' (' + hash + ') — HEAD detached.');
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
    if (blockedByPendingCherryPick()) return;
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

  function finishCherryPick(parentId, content, source) {
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    commits.push({
      id,
      hash,
      parents: parentId ? [parentId] : [],
      message: source.message + ' (cherry picked from ' + source.id + ')',
      order: commits.length,
    });
    assignLane(id, parentId);
    fileContentAt[id] = content;
    branches[head.name] = id;
    log(
      'Cherry-pick thành công: tạo commit ' +
        id +
        ' (' +
        hash +
        ') — cùng thay đổi như ' +
        source.id +
        ' nhưng cha khác nên hash khác.'
    );
  }

  function doCherryPick(ref) {
    if (blockedByPendingCherryPick()) return;
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để cherry-pick (không thể khi HEAD detached).');
      return;
    }
    const sourceId = resolveRef(ref);
    const source = sourceId ? findCommit(sourceId) : null;
    if (!source) {
      logErr('Không tìm thấy commit nào tên "' + ref + '".');
      return;
    }
    const currentId = branches[head.name];
    if (source.id === currentId) {
      log('Commit này đã là HEAD hiện tại — không có gì để cherry-pick.');
      return;
    }

    const sourceParentId = source.parents[0];
    const sourceParentContent = sourceParentId !== undefined ? fileContentAt[sourceParentId] : '';
    const sourceContent = fileContentAt[source.id];
    const currentContent = fileContentAt[currentId];

    if (currentContent === sourceContent) {
      log('Nội dung hiện tại đã giống hệt thay đổi của ' + source.id + ' — không có gì để áp dụng thêm.');
      return;
    }
    if (currentContent === sourceParentContent) {
      // Clean apply: nothing changed on our side since the source commit's base
      finishCherryPick(currentId, sourceContent, source);
      return;
    }

    // Conflict: current branch diverged from what this commit's diff was based on
    pendingCherryPick = { currentId, source };
    conflictTextarea.value =
      '<<<<<<< HEAD (' +
      head.name +
      ')\n' +
      currentContent +
      '\n=======\n' +
      sourceContent +
      '\n>>>>>>> ' +
      source.id +
      ' (cherry-picked)';
    conflictPanel.classList.add('is-visible');
    log(
      'XUNG ĐỘT khi cherry-pick ' +
        source.id +
        ': "' +
        head.name +
        '" đã thay đổi nội dung khác kể từ điểm phân kỳ. Giải quyết trong ô bên dưới.'
    );
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
    } else if (sub === 'cherry-pick') {
      if (rest[0] === '--continue') {
        log('Không có cherry-pick nào đang tạm dừng để tiếp tục (sandbox tự hoàn tất khi bạn bấm nút "Hoàn tất").');
      } else if (rest[0]) {
        doCherryPick(rest[0]);
      } else {
        logErr('Cần id hoặc hash commit: git cherry-pick <id>');
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

    const stackCount = {};
    Object.entries(branches).forEach(([name, commitId]) => {
      const { x, y } = pos(commitId);
      const n = stackCount[commitId] || 0;
      stackCount[commitId] = n + 1;
      drawPill(x, y - 22 - n * 22, name, '#3b82f6');
    });

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
    ctx.fillText('🍒 cherry-pick giữ nguyên commit nguồn, tạo commit mới ở nhánh đích', 10, CSS_H - 8);
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
      '/* 🍒 BÀI 6: CHERRY-PICK — CHỌN LỌC COMMIT */\n\n' +
      'function cherryPick(sourceCommit, currentHead) {\n' +
      '  const base = sourceCommit.parent;         // nền của commit được pick\n' +
      '  const ours = currentHead;                  // HEAD hiện tại\n' +
      '  const theirs = sourceCommit;                // chính commit được pick\n' +
      '  // Y HỆT three-way merge ở Bài 4, chỉ khác cách chọn 3 điểm này\n' +
      '  if (ours.content === base.content) {\n' +
      '    return createCommit(theirs.content, parent: ours); // áp êm\n' +
      '  }\n' +
      '  return { conflict: true }; // cần giải thủ công\n' +
      '}\n\n' +
      '// .git/refs/heads/*:\n' +
      branchList +
      '\n\n// Tổng số commit: ' +
      commits.length +
      (pendingCherryPick ? '\n// ⚠️ Đang có 1 cherry-pick xung đột CHƯA giải quyết' : '');

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
    pendingCherryPick = null;
    conflictPanel.classList.remove('is-visible');

    // Seed scenario: main advances with "Add feature X" while hotfix
    // (branched earlier from the same point) carries a security fix —
    // 2 diverged branches ready for a cherry-pick demo, matching the syllabus.
    commits.push({ id: 'C1', hash: fakeHash(1), parents: [], message: 'Initial commit', order: 0 });
    laneOf['C1'] = 0;
    fileContentAt['C1'] = 'version = 1';
    branches['main'] = 'C1';
    head = { type: 'branch', name: 'main' };

    branches['hotfix'] = 'C1';
    head = { type: 'branch', name: 'hotfix' };
    commits.push({ id: 'C2', hash: fakeHash(2), parents: ['C1'], message: 'Fix security bug', order: 1 });
    laneOf['C2'] = 1;
    nextLane = 2;
    fileContentAt['C2'] = 'version = 1-fix';
    branches['hotfix'] = 'C2';

    head = { type: 'branch', name: 'main' };
    commitCounter = 3;
    commits.push({ id: 'C3', hash: fakeHash(3), parents: ['C1'], message: 'Add feature X', order: 2 });
    laneOf['C3'] = 0;
    fileContentAt['C3'] = 'version = 1 + featureX';
    branches['main'] = 'C3';
    commitCounter = 4;

    fileInput.value = 'version = 1 + featureX';
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
    if (!pendingCherryPick) return;
    const content = conflictTextarea.value;
    finishCherryPick(pendingCherryPick.currentId, content, pendingCherryPick.source);
    pendingCherryPick = null;
    conflictPanel.classList.remove('is-visible');
    refresh();
  });

  resetBtn.addEventListener('click', () => {
    init();
    clearLog();
    log('Đã reset. Nhánh "main" (C1→C3) và "hotfix" (C1→C2) phân kỳ, sẵn sàng cherry-pick.');
    refresh();
  });

  init();
  log('Sẵn sàng. Đang ở "main" (C3). Thử: git cherry-pick C2 — sẽ gây xung đột vì main đã đổi nội dung khác.');
  refresh();
})();
