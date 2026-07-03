/* Bài 7: Undo & Recovery Simulator — extends the graph engine with reset, revert, reflog, stash */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return; // page without the sandbox

  const cmdInput = document.getElementById('graph-cmd-input');
  const runBtn = document.getElementById('graph-run-btn');
  const fileInput = document.getElementById('graph-file-input');
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

  let commits, branches, head, laneOf, laneContinued, nextLane, commitCounter, fileContentAt, reflogEvents, stash;

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
    if (name === 'HEAD') return currentCommitId();
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

  function pushReflog(desc) {
    reflogEvents.push({ commitId: currentCommitId(), desc });
  }

  function doCommit(message) {
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
    } else {
      head = { type: 'detached', commitId: id };
    }
    log('Tạo commit ' + id + ' (' + hash + ').');
    pushReflog('commit: ' + message);
  }

  function doBranch(name, ref) {
    if (branches[name]) {
      logErr('Branch "' + name + '" đã tồn tại.');
      return;
    }
    const target = ref ? resolveRef(ref) : currentCommitId();
    if (!target) {
      logErr('Không tìm thấy "' + ref + '".');
      return;
    }
    branches[name] = target;
    log('Tạo branch "' + name + '" trỏ tới ' + target + '.');
  }

  function doCheckout(target) {
    if (branches[target]) {
      head = { type: 'branch', name: target };
      log('HEAD giờ trỏ tới branch "' + target + '" (commit ' + branches[target] + ').');
      pushReflog('checkout: sang branch ' + target);
      return;
    }
    const commit = findCommit(target);
    if (commit) {
      head = { type: 'detached', commitId: commit.id };
      log('HEAD detached, trỏ thẳng vào commit ' + commit.id + '.');
      pushReflog('checkout: sang commit ' + commit.id);
      return;
    }
    logErr('Không tìm thấy branch hoặc commit nào tên "' + target + '".');
  }

  function doReset(mode, ref) {
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để reset.');
      return;
    }
    const targetId = resolveRef(ref);
    if (!targetId) {
      logErr('Không tìm thấy "' + ref + '".');
      return;
    }
    const branchName = head.name;
    branches[branchName] = targetId;
    if (mode === 'hard') {
      fileInput.value = fileContentAt[targetId];
      log(
        'reset --hard: branch "' +
          branchName +
          '" → ' +
          targetId +
          '. Working Directory bị GHI ĐÈ về "' +
          fileContentAt[targetId] +
          '" — thay đổi chưa commit đã MẤT VĨNH VIỄN.'
      );
    } else {
      log(
        'reset --' +
          mode +
          ': branch "' +
          branchName +
          '" → ' +
          targetId +
          '. Working Directory KHÔNG đổi (vẫn giữ "' +
          fileInput.value +
          '").'
      );
    }
    pushReflog('reset --' + mode + ' tới ' + targetId);
  }

  function doRevert(ref) {
    const targetId = resolveRef(ref);
    if (!targetId) {
      logErr('Không tìm thấy "' + ref + '".');
      return;
    }
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để revert.');
      return;
    }
    const c = findCommit(targetId);
    const parentContent = c.parents[0] ? fileContentAt[c.parents[0]] : 'version = 1';
    const parentId = currentCommitId();
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    commits.push({
      id,
      hash,
      parents: parentId ? [parentId] : [],
      message: 'Revert "' + c.message + '"',
      order: commits.length,
    });
    assignLane(id, parentId);
    fileContentAt[id] = parentContent;
    fileInput.value = parentContent;
    branches[head.name] = id;
    log(
      'git revert ' +
        targetId +
        ' → tạo commit MỚI ' +
        id +
        ' (nội dung trở về "' +
        parentContent +
        '"). Commit ' +
        targetId +
        ' vẫn còn nguyên trong lịch sử.'
    );
    pushReflog('revert: ' + targetId + ' → commit mới ' + id);
  }

  function doReflog() {
    const n = reflogEvents.length;
    if (!n) {
      log('(reflog trống)');
      return;
    }
    for (let i = n - 1; i >= 0; i--) {
      const e = reflogEvents[i];
      log('HEAD@{' + (n - 1 - i) + '} ' + e.commitId + ' — ' + e.desc);
    }
  }

  function doStash() {
    const label = 'stash@{' + stash.length + '}';
    stash.push({ content: fileInput.value, label });
    fileInput.value = fileContentAt[currentCommitId()];
    log('git stash: cất "' + stash[stash.length - 1].content + '" vào ' + label + ', Working Directory sạch trở lại.');
  }

  function doStashPop() {
    if (!stash.length) {
      logErr('Không có gì trong stash.');
      return;
    }
    const item = stash.pop();
    fileInput.value = item.content;
    log('git stash pop: khôi phục "' + item.content + '" từ ' + item.label + '.');
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
        logErr('Cần tên branch: git branch <tên> [ref]');
        return;
      }
      doBranch(rest[0], rest[1]);
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
    } else if (sub === 'reset') {
      let mode = 'mixed';
      let refArg = rest[0];
      if (rest[0] === '--soft' || rest[0] === '--mixed' || rest[0] === '--hard') {
        mode = rest[0].slice(2);
        refArg = rest[1];
      }
      if (!refArg) {
        logErr('Cần ref: git reset [--soft|--mixed|--hard] <ref>');
        return;
      }
      doReset(mode, refArg);
    } else if (sub === 'revert') {
      if (!rest[0]) {
        logErr('Cần ref: git revert <ref>');
        return;
      }
      doRevert(rest[0]);
    } else if (sub === 'reflog') {
      doReflog();
    } else if (sub === 'stash') {
      if (rest[0] === 'pop') doStashPop();
      else doStash();
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
    ctx.fillText('⬜ commit bình thường   🕳️ nét đứt hồng = mồ côi (dùng reflog để cứu)', 10, CSS_H - 8);
  }

  function updateStatusLine() {
    const base =
      head.type === 'branch'
        ? 'HEAD -> ' + head.name + ' (commit ' + branches[head.name] + ')'
        : 'HEAD (detached) -> ' + head.commitId;
    const content = fileInput.value;
    statusLineEl.textContent =
      base + ' — Working Directory: "' + content + '"' + (stash.length ? ' — stash: ' + stash.length : '');
  }

  function updateJsCodeDisplay() {
    const branchList = Object.entries(branches)
      .map(([name, id]) => '  ' + name + ': ' + id)
      .join('\n');
    const code =
      '/* 🧯 BÀI 7: UNDO & PHỤC HỒI */\n\n' +
      'function reset(mode, target) {\n' +
      '  currentBranch.pointer = target;\n' +
      '  if (mode === "hard") workingDirectory = contentAt(target); // MẤT thay đổi chưa commit\n' +
      '  // soft/mixed: Working Directory KHÔNG đổi\n}\n\n' +
      '// reflog (chỉ tồn tại cục bộ, không đồng bộ remote):\n' +
      reflogEvents
        .slice(-3)
        .reverse()
        .map((e) => '// ' + e.commitId + ' — ' + e.desc)
        .join('\n') +
      '\n\n// .git/refs/heads/*:\n' +
      branchList +
      '\n\n// Tổng số commit: ' +
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
    commitCounter = 2;
    fileContentAt = {};
    reflogEvents = [];
    stash = [];
    commits.push({ id: 'C1', hash: fakeHash(1), parents: [], message: 'Initial commit', order: 0 });
    laneOf['C1'] = 0;
    fileContentAt['C1'] = 'version = 1';
    branches['main'] = 'C1';
    head = { type: 'branch', name: 'main' };
    fileInput.value = 'version = 1';
    pushReflog('commit (initial): Initial commit');
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
    log('Đã reset demo. 1 commit ban đầu trên branch "main".');
    refresh();
  });

  init();
  log('Sẵn sàng. Commit vài lần, rồi thử "git reset --hard" theo sau bởi "git reflog" để tự cứu.');
  refresh();
})();
