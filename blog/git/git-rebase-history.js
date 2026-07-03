/* Bài 5: Rebase Simulator — extends the graph engine with rebase, rebase -i, rebase --onto */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return; // page without the sandbox

  const cmdInput = document.getElementById('graph-cmd-input');
  const runBtn = document.getElementById('graph-run-btn');
  const fileInput = document.getElementById('graph-file-input');
  const resetBtn = document.getElementById('graph-reset-btn');
  const logEl = document.getElementById('graph-log');
  const statusLineEl = document.getElementById('graph-status-line');
  const planPanel = document.getElementById('rebase-plan-panel');
  const planRowsEl = document.getElementById('rebase-plan-rows');
  const executeBtn = document.getElementById('rebase-execute-btn');
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

  let commits, branches, head, laneOf, laneContinued, nextLane, commitCounter, fileContentAt, pendingRebasePlan;

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

  function blockedByPendingRebase() {
    if (pendingRebasePlan) {
      logErr(
        'Đang có 1 kế hoạch interactive rebase chưa thực thi — bấm "Thực thi" hoặc chạy "git rebase --abort" trước.'
      );
      return true;
    }
    return false;
  }

  function doCommit(message) {
    if (blockedByPendingRebase()) return;
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
    if (blockedByPendingRebase()) return;
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

  function commitsUniqueTo(headId, baseId) {
    const chain = [];
    let cur = headId;
    while (cur && cur !== baseId) {
      const c = findCommit(cur);
      if (!c) break;
      chain.unshift(c);
      cur = c.parents[0];
    }
    return chain;
  }

  function replayPlan(items, newBaseId, branchName) {
    let parent = newBaseId;
    const newIds = [];
    items.forEach((item) => {
      const id = 'C' + commitCounter;
      const hash = fakeHash(commitCounter);
      commitCounter++;
      commits.push({ id, hash, parents: parent ? [parent] : [], message: item.message, order: commits.length });
      assignLane(id, parent);
      fileContentAt[id] = item.content;
      parent = id;
      newIds.push(id);
    });
    branches[branchName] = parent;
    return newIds;
  }

  function doRebase(targetRef) {
    if (blockedByPendingRebase()) return;
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để rebase (không thể rebase khi HEAD detached).');
      return;
    }
    const targetId = resolveRef(targetRef);
    if (!targetId) {
      logErr('Không tìm thấy branch hoặc commit nào tên "' + targetRef + '".');
      return;
    }
    const currentId = branches[head.name];
    if (currentId === targetId) {
      log('Đã ở đúng vị trí — không cần rebase.');
      return;
    }
    const base = mergeBase(currentId, targetId);
    if (base === targetId) {
      log('"' + head.name + '" đã dựa trên "' + targetRef + '" rồi — không cần rebase.');
      return;
    }
    const toReplay = commitsUniqueTo(currentId, base);
    if (!toReplay.length) {
      branches[head.name] = targetId;
      log('"' + head.name + '" không có commit riêng — di chuyển thẳng tới ' + targetId + '.');
      return;
    }
    const items = toReplay.map((c) => ({ message: c.message, content: fileContentAt[c.id] }));
    const oldIds = toReplay.map((c) => c.id);
    const newIds = replayPlan(items, targetId, head.name);
    log(
      'Rebase: replay ' +
        newIds.length +
        ' commit (' +
        oldIds.join(', ') +
        ') lên trên ' +
        targetId +
        ' → commit mới: ' +
        newIds.join(', ') +
        '. Commit cũ giờ mồ côi.'
    );
  }

  function doRebaseOnto(newBaseRef, upstreamRef) {
    if (blockedByPendingRebase()) return;
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để rebase --onto.');
      return;
    }
    const newBaseId = resolveRef(newBaseRef);
    const upstreamId = resolveRef(upstreamRef);
    if (!newBaseId) {
      logErr('Không tìm thấy "' + newBaseRef + '".');
      return;
    }
    if (!upstreamId) {
      logErr('Không tìm thấy "' + upstreamRef + '".');
      return;
    }
    const currentId = branches[head.name];
    const toReplay = commitsUniqueTo(currentId, upstreamId);
    if (!toReplay.length) {
      log('Không có commit nào giữa "' + upstreamRef + '" và HEAD để replay.');
      return;
    }
    const items = toReplay.map((c) => ({ message: c.message, content: fileContentAt[c.id] }));
    const oldIds = toReplay.map((c) => c.id);
    const newIds = replayPlan(items, newBaseId, head.name);
    log(
      'Rebase --onto: replay ' +
        newIds.length +
        ' commit (' +
        oldIds.join(', ') +
        ') từ sau "' +
        upstreamRef +
        '" lên trên "' +
        newBaseRef +
        '" → commit mới: ' +
        newIds.join(', ') +
        '.'
    );
  }

  function renderRebasePlanUI() {
    planRowsEl.innerHTML = '';
    pendingRebasePlan.rows.forEach((row, i) => {
      const div = document.createElement('div');
      div.className = 'rebase-plan-row';

      const select = document.createElement('select');
      ['pick', 'squash', 'drop'].forEach((action) => {
        const opt = document.createElement('option');
        opt.value = action;
        opt.textContent = action;
        if (action === row.action) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => {
        row.action = select.value;
      });

      const label = document.createElement('span');
      label.textContent = row.commitId;
      label.style.color = '#a6adc8';

      const msg = document.createElement('span');
      msg.className = 'rebase-plan-msg';
      msg.textContent = row.message;

      const upBtn = document.createElement('button');
      upBtn.textContent = '↑';
      upBtn.disabled = i === 0;
      upBtn.addEventListener('click', () => {
        if (i === 0) return;
        const tmp = pendingRebasePlan.rows[i - 1];
        pendingRebasePlan.rows[i - 1] = pendingRebasePlan.rows[i];
        pendingRebasePlan.rows[i] = tmp;
        renderRebasePlanUI();
      });

      const downBtn = document.createElement('button');
      downBtn.textContent = '↓';
      downBtn.disabled = i === pendingRebasePlan.rows.length - 1;
      downBtn.addEventListener('click', () => {
        if (i === pendingRebasePlan.rows.length - 1) return;
        const tmp = pendingRebasePlan.rows[i + 1];
        pendingRebasePlan.rows[i + 1] = pendingRebasePlan.rows[i];
        pendingRebasePlan.rows[i] = tmp;
        renderRebasePlanUI();
      });

      div.appendChild(label);
      div.appendChild(msg);
      div.appendChild(select);
      div.appendChild(upBtn);
      div.appendChild(downBtn);
      planRowsEl.appendChild(div);
    });
  }

  function doRebaseInteractive(targetRef) {
    if (blockedByPendingRebase()) return;
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để rebase.');
      return;
    }
    const targetId = resolveRef(targetRef);
    if (!targetId) {
      logErr('Không tìm thấy branch hoặc commit nào tên "' + targetRef + '".');
      return;
    }
    const currentId = branches[head.name];
    const base = mergeBase(currentId, targetId);
    const toReplay = commitsUniqueTo(currentId, base);
    if (!toReplay.length) {
      log('Không có commit riêng nào để lập kế hoạch rebase.');
      return;
    }
    pendingRebasePlan = {
      targetId,
      branchName: head.name,
      rows: toReplay.map((c) => ({ commitId: c.id, message: c.message, action: 'pick' })),
    };
    renderRebasePlanUI();
    planPanel.classList.add('is-visible');
    log('Đã mở kế hoạch interactive rebase cho ' + toReplay.length + ' commit — chọn hành động rồi bấm "Thực thi".');
  }

  function executeRebasePlan() {
    if (!pendingRebasePlan) return;
    const items = [];
    pendingRebasePlan.rows.forEach((row) => {
      if (row.action === 'drop') return;
      const c = findCommit(row.commitId);
      if (row.action === 'squash' && items.length > 0) {
        const prev = items[items.length - 1];
        prev.message = prev.message + ' + ' + c.message;
        prev.content = fileContentAt[c.id];
      } else {
        items.push({ message: c.message, content: fileContentAt[c.id] });
      }
    });
    const oldIds = pendingRebasePlan.rows.map((r) => r.commitId);
    const targetId = pendingRebasePlan.targetId;
    const branchName = pendingRebasePlan.branchName;
    const newIds = replayPlan(items, targetId, branchName);
    log(
      'Interactive rebase hoàn tất: ' +
        oldIds.length +
        ' commit cũ (' +
        oldIds.join(', ') +
        ') → ' +
        newIds.length +
        ' commit mới (' +
        newIds.join(', ') +
        ').'
    );
    pendingRebasePlan = null;
    planPanel.classList.remove('is-visible');
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
    } else if (sub === 'rebase') {
      if (rest[0] === '--abort') {
        if (pendingRebasePlan) {
          pendingRebasePlan = null;
          planPanel.classList.remove('is-visible');
          log('Đã huỷ kế hoạch rebase.');
        } else {
          logErr('Không có rebase nào đang diễn ra để huỷ.');
        }
      } else if (rest[0] === '-i') {
        if (!rest[1]) {
          logErr('Cần tên branch: git rebase -i <tên>');
          return;
        }
        doRebaseInteractive(rest[1]);
      } else if (rest[0] === '--onto') {
        if (!rest[1] || !rest[2]) {
          logErr('Cú pháp: git rebase --onto <new-base> <upstream>');
          return;
        }
        doRebaseOnto(rest[1], rest[2]);
      } else if (rest[0]) {
        doRebase(rest[0]);
      } else {
        logErr('Cần tên branch: git rebase <tên>');
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
    ctx.fillText('⬜ commit bình thường   🕳️ nét đứt hồng = mồ côi (sau rebase)', 10, CSS_H - 8);
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
      '/* 📏 BÀI 5: REBASE & VIẾT LẠI LỊCH SỬ */\n\n' +
      'function rebase(currentBranch, target) {\n' +
      '  const base = mergeBase(currentBranch, target);\n' +
      '  const toReplay = commitsUniqueTo(currentBranch, base);\n' +
      '  let parent = target;\n' +
      '  for (const c of toReplay) {\n' +
      '    parent = createNewCommit(c.diff, parent); // hash MỚI, cha khác\n' +
      '  }\n' +
      '  currentBranch.pointer = parent; // commit cũ giờ mồ côi\n}\n\n' +
      '// .git/refs/heads/*:\n' +
      branchList +
      '\n\n// Tổng số commit: ' +
      commits.length +
      (pendingRebasePlan ? '\n// 📋 Đang có 1 kế hoạch interactive rebase CHƯA thực thi' : '');

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
    pendingRebasePlan = null;
    planPanel.classList.remove('is-visible');
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

  executeBtn.addEventListener('click', () => {
    executeRebasePlan();
    refresh();
  });

  resetBtn.addEventListener('click', () => {
    init();
    clearLog();
    log('Đã reset. 1 commit ban đầu trên branch "main".');
    refresh();
  });

  init();
  log('Sẵn sàng. Tạo branch, commit vài lần trên mỗi nhánh, rồi thử "git rebase".');
  refresh();
})();
