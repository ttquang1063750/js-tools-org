/* Bài 13: Git Kata Trainer — dự án tổng hợp: branch/HEAD, merge, rebase, cherry-pick, reset, tag */
(function () {
  const canvas = document.getElementById('kata-canvas');
  if (!canvas) return;

  const cmdInput = document.getElementById('kata-cmd-input');
  const runBtn = document.getElementById('kata-run-btn');
  const checkBtn = document.getElementById('kata-check-btn');
  const resetBtn = document.getElementById('kata-reset-btn');
  const kataListEl = document.getElementById('kata-list');
  const kataDescEl = document.getElementById('kata-desc');
  const logEl = document.getElementById('kata-log');
  const statusLineEl = document.getElementById('kata-status-line');
  const jsCodeDisplay = document.getElementById('kata-js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 640;
  const CSS_H = 320;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let commits, branches, head, tags, laneOf, laneContinued, nextLane, commitCounter;
  let activeKataIdx = 0;
  let passedKatas = new Set();
  let kataCtx = {};

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
  function logOk(message) {
    const line = document.createElement('div');
    line.className = 'ok-line';
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function clearLog() {
    logEl.innerHTML = '';
  }

  function findCommit(id) {
    return commits.find((c) => c.id === id);
  }
  function currentCommitId() {
    return head.type === 'branch' ? branches[head.name] : head.commitId;
  }
  function resolveRef(ref) {
    if (!ref) return currentCommitId();
    const relMatch = ref.match(/^(.+?)([~^])(\d*)$/);
    if (relMatch) {
      const baseId = resolveRef(relMatch[1]);
      const steps = relMatch[3] ? parseInt(relMatch[3], 10) : 1;
      let cur = baseId;
      for (let i = 0; i < steps && cur; i++) {
        const c = findCommit(cur);
        cur = c && c.parents[0] ? c.parents[0] : null;
      }
      return cur;
    }
    if (ref === 'HEAD') return currentCommitId();
    if (branches[ref]) return branches[ref];
    const t = tags.find((tg) => tg.name === ref);
    if (t) return t.commitId;
    const c = findCommit(ref);
    return c ? c.id : null;
  }
  function reachable(startId) {
    const seen = new Set();
    const stack = [startId];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || seen.has(cur)) continue;
      seen.add(cur);
      const c = findCommit(cur);
      if (c) c.parents.forEach((p) => stack.push(p));
    }
    return seen;
  }
  function isAncestorOrSelf(ancestorId, descendantId) {
    return reachable(descendantId).has(ancestorId);
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
  function createCommit(parentId, message, extraParent) {
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    const parents = parentId ? [parentId] : [];
    if (extraParent) parents.push(extraParent);
    commits.push({ id, hash, parents, message, order: commits.length });
    assignLane(id, parentId);
    return id;
  }

  /* ---------- Git command implementations ---------- */
  function doCommit(message) {
    const parentId = currentCommitId();
    const id = createCommit(parentId, message || 'Commit không tiêu đề');
    if (head.type === 'branch') branches[head.name] = id;
    else head = { type: 'detached', commitId: id };
    log('Tạo commit ' + id + '.');
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
  function doCheckout(name, create) {
    if (create) doBranch(name);
    if (branches[name]) {
      head = { type: 'branch', name };
      log('HEAD → branch "' + name + '".');
      return;
    }
    const c = findCommit(name);
    if (c) {
      head = { type: 'detached', commitId: c.id };
      log('HEAD detached tại ' + c.id + '.');
      return;
    }
    logErr('Không tìm thấy branch/commit "' + name + '".');
  }
  function doMerge(otherName) {
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để merge.');
      return;
    }
    const currentId = branches[head.name];
    const otherId = branches[otherName];
    if (!otherId) {
      logErr('Không tìm thấy branch "' + otherName + '".');
      return;
    }
    if (isAncestorOrSelf(otherId, currentId)) {
      log('Already up to date.');
      return;
    }
    if (isAncestorOrSelf(currentId, otherId)) {
      branches[head.name] = otherId;
      logOk('Fast-forward: "' + head.name + '" → ' + otherId + '.');
      return;
    }
    const id = createCommit(currentId, "Merge branch '" + otherName + "'", otherId);
    branches[head.name] = id;
    logOk('Tạo merge commit ' + id + ' (2 cha: ' + currentId + ', ' + otherId + ').');
  }
  function doRebase(ontoName) {
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để rebase.');
      return;
    }
    const ontoId = branches[ontoName];
    if (!ontoId) {
      logErr('Không tìm thấy branch "' + ontoName + '".');
      return;
    }
    const currentId = branches[head.name];
    if (isAncestorOrSelf(ontoId, currentId) && isAncestorOrSelf(currentId, ontoId)) {
      log('Đã cùng 1 điểm, không có gì để rebase.');
      return;
    }
    if (isAncestorOrSelf(ontoId, currentId)) {
      log('"' + head.name + '" đã dựa trên "' + ontoName + '" rồi, không cần rebase.');
      return;
    }
    const ontoReachable = reachable(ontoId);
    const localOnly = [...reachable(currentId)].filter((id) => !ontoReachable.has(id));
    const oldCommits = localOnly.map((id) => findCommit(id)).sort((a, b) => a.order - b.order);
    let base = ontoId;
    oldCommits.forEach((oc) => {
      base = createCommit(base, oc.message);
    });
    branches[head.name] = base;
    logOk('Rebase: phát lại ' + oldCommits.length + ' commit lên trên "' + ontoName + '" → ' + base + '.');
  }
  function doCherryPick(ref) {
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để cherry-pick.');
      return;
    }
    const sourceId = resolveRef(ref);
    const source = sourceId ? findCommit(sourceId) : null;
    if (!source) {
      logErr('Không tìm thấy commit "' + ref + '".');
      return;
    }
    const currentId = branches[head.name];
    const id = createCommit(currentId, source.message + ' (cherry picked from ' + source.id + ')');
    branches[head.name] = id;
    logOk('Cherry-pick ' + source.id + ' → tạo commit mới ' + id + ' trên "' + head.name + '".');
  }
  function doReset(ref) {
    if (head.type !== 'branch') {
      logErr('Phải đang ở 1 branch để reset.');
      return;
    }
    const targetId = resolveRef(ref);
    if (!targetId) {
      logErr('Không tìm thấy "' + ref + '".');
      return;
    }
    branches[head.name] = targetId;
    logOk('reset --hard: "' + head.name + '" → ' + targetId + '.');
  }
  function doTag(name, annotated, message, ref) {
    if (tags.find((t) => t.name === name)) {
      logErr('Tag "' + name + '" đã tồn tại.');
      return;
    }
    const commitId = resolveRef(ref);
    if (!commitId) {
      logErr('Không tìm thấy ref "' + ref + '".');
      return;
    }
    tags.push({
      name,
      type: annotated ? 'annotated' : 'lightweight',
      commitId,
      message: message || '',
      tagger: 'js-tools-user',
    });
    logOk('Tạo ' + (annotated ? 'annotated' : 'lightweight') + ' tag "' + name + '" → ' + commitId + '.');
  }
  function doLog() {
    let cur = currentCommitId();
    const seen = new Set();
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      const c = findCommit(cur);
      if (!c) break;
      log(c.id + ' ' + c.hash + ' — ' + c.message);
      cur = c.parents[0];
    }
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
        logErr('Cần tên branch: git branch <tên> [ref].');
        return;
      }
      doBranch(rest[0], rest[1]);
    } else if (sub === 'checkout' || sub === 'switch') {
      const createFlag = sub === 'checkout' ? '-b' : '-c';
      if (rest[0] === createFlag) {
        if (!rest[1]) {
          logErr('Cần tên branch.');
          return;
        }
        doCheckout(rest[1], true);
      } else if (rest[0]) {
        doCheckout(rest[0], false);
      } else {
        logErr('Cần tên branch/commit.');
      }
    } else if (sub === 'merge') {
      if (!rest[0]) {
        logErr('Cần tên branch: git merge <branch>.');
        return;
      }
      doMerge(rest[0]);
    } else if (sub === 'rebase') {
      if (!rest[0]) {
        logErr('Cần tên branch: git rebase <branch>.');
        return;
      }
      doRebase(rest[0]);
    } else if (sub === 'cherry-pick') {
      if (!rest[0]) {
        logErr('Cần ref: git cherry-pick <ref>.');
        return;
      }
      doCherryPick(rest[0]);
    } else if (sub === 'reset') {
      let refArg = rest[0];
      if (rest[0] === '--hard') refArg = rest[1];
      if (!refArg) {
        logErr('Cần ref: git reset --hard <ref>.');
        return;
      }
      doReset(refArg);
    } else if (sub === 'tag') {
      if (rest[0] === '-d') {
        const idx = tags.findIndex((t) => t.name === rest[1]);
        if (idx === -1) {
          logErr('Không tìm thấy tag "' + rest[1] + '".');
        } else {
          tags.splice(idx, 1);
          logOk('Đã xoá tag "' + rest[1] + '".');
        }
      } else if (rest[0] === '-a') {
        const name = rest[1];
        let message = '';
        const mIdx = rest.indexOf('-m');
        if (mIdx !== -1 && rest[mIdx + 1]) {
          message = rest[mIdx + 1].replace(/^"|"$/g, '');
        }
        const ref = mIdx !== -1 ? rest[mIdx + 2] : rest[2];
        doTag(name, true, message, ref);
      } else if (!rest[0]) {
        if (!tags.length) log('(chưa có tag nào)');
        else tags.forEach((t) => log(t.name + ' [' + t.type + '] → ' + t.commitId));
      } else {
        doTag(rest[0], false, null, rest[1]);
      }
    } else if (sub === 'log') {
      doLog();
    } else {
      logErr('Lệnh "git ' + sub + '" chưa được hỗ trợ trong sandbox này.');
    }
  }

  /* ---------- Drawing ---------- */
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
  function reachableFromBranches() {
    const seen = new Set();
    Object.values(branches).forEach((startId) => reachable(startId).forEach((id) => seen.add(id)));
    return seen;
  }
  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const reachableSet = reachableFromBranches();
    const spacingX = 80;
    const baseX = 50;
    const laneHeight = 62;
    const baseY = 70;

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
      const orphaned = !reachableSet.has(c.id);
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = orphaned ? '#313244' : '#64748b';
      ctx.fill();
      ctx.setLineDash(orphaned ? [3, 2] : []);
      ctx.strokeStyle = orphaned ? '#f38ba8' : '#1e1e2e';
      ctx.lineWidth = orphaned ? 1.5 : 1;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.id, x, y);
      ctx.textBaseline = 'alphabetic';
    });

    const stackCount = {};
    function stackPill(id, text, color, textColor) {
      const { x, y } = pos(id);
      const n = stackCount[id] || 0;
      stackCount[id] = n + 1;
      drawPill(x, y - 22 - n * 22, text, color, textColor);
    }
    Object.entries(branches).forEach(([name, id]) => stackPill(id, name, '#3b82f6'));
    tags.forEach((t) => stackPill(t.commitId, '🏷' + t.name, t.type === 'annotated' ? '#7c3aed' : '#f59e0b', '#fff'));
    if (head.type === 'branch') {
      stackPill(branches[head.name], 'HEAD', '#f9e2af', '#1e1e2e');
    } else {
      stackPill(head.commitId, 'HEAD (detached)', '#f38ba8', '#1e1e2e');
    }

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⬜ commit bình thường   🕳️ nét đứt hồng = mồ côi (không branch nào trỏ tới)', 10, CSS_H - 8);
  }
  function updateStatusLine() {
    const base = head.type === 'branch' ? 'HEAD → ' + head.name + ' (' + branches[head.name] + ')' : 'HEAD (detached)';
    statusLineEl.textContent = base + '  |  Kata đã đạt: ' + passedKatas.size + '/' + KATAS.length;
  }
  function updateJsCodeDisplay() {
    const code =
      '/* 🥋 BÀI 13: GIT KATA TRAINER */\n\n' +
      '// Kata hiện tại: ' +
      (KATAS[activeKataIdx] ? KATAS[activeKataIdx].title : '') +
      '\n' +
      '// branches: ' +
      JSON.stringify(branches) +
      '\n' +
      '// tags: ' +
      tags.map((t) => t.name + '(' + t.type + ')').join(', ') +
      '\n' +
      '// HEAD: ' +
      (head.type === 'branch' ? head.name : 'detached@' + head.commitId) +
      '\n' +
      '// Đã đạt: ' +
      passedKatas.size +
      '/' +
      KATAS.length +
      ' kata';
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

  /* ---------- Kata definitions ---------- */
  function resetEngine() {
    commits = [];
    branches = {};
    tags = [];
    laneOf = {};
    laneContinued = new Set();
    nextLane = 1;
    commitCounter = 1;
    kataCtx = {};
  }

  const KATAS = [
    {
      title: 'Kata 1: Branch & HEAD',
      instructions:
        'Tạo branch "feature" từ commit hiện tại, chuyển sang branch đó, rồi tạo 1 commit mới trên "feature". Branch "main" phải giữ nguyên không đổi.',
      setup() {
        resetEngine();
        const c0 = createCommit(null, 'Initial commit');
        branches.main = c0;
        head = { type: 'branch', name: 'main' };
        kataCtx.mainBefore = c0;
      },
      check() {
        if (!branches.feature) return { pass: false, message: 'Chưa có branch "feature".' };
        if (branches.main !== kataCtx.mainBefore) return { pass: false, message: 'Branch "main" đã bị thay đổi.' };
        if (branches.feature === kataCtx.mainBefore)
          return { pass: false, message: 'Chưa có commit mới nào trên "feature".' };
        if (!(head.type === 'branch' && head.name === 'feature'))
          return { pass: false, message: 'HEAD chưa đứng ở branch "feature".' };
        return { pass: true, message: 'Đạt! branch "feature" đã tách khỏi "main" đúng cách.' };
      },
    },
    {
      title: 'Kata 2: Merge',
      instructions:
        'Đang ở "main". Merge branch "feature" vào "main" để tạo 1 merge commit chứa cả 2 dòng lịch sử (không dùng fast-forward).',
      setup() {
        resetEngine();
        const c0 = createCommit(null, 'Initial commit');
        branches.main = c0;
        branches.feature = c0;
        const c2 = createCommit(c0, 'Thêm tính năng đăng nhập');
        branches.feature = c2;
        const c1 = createCommit(c0, 'Cập nhật README');
        branches.main = c1;
        head = { type: 'branch', name: 'main' };
        kataCtx.mainTip = c1;
        kataCtx.featureTip = c2;
      },
      check() {
        const tip = findCommit(branches.main);
        if (!tip) return { pass: false, message: 'Không tìm thấy commit trên "main".' };
        if (tip.parents.length !== 2)
          return { pass: false, message: 'Commit đầu "main" chưa phải merge commit (cần đúng 2 cha).' };
        const parents = new Set(tip.parents);
        if (!parents.has(kataCtx.mainTip) || !parents.has(kataCtx.featureTip))
          return { pass: false, message: 'Merge commit chưa chứa đúng 2 dòng lịch sử ban đầu.' };
        return { pass: true, message: 'Đạt! Đã tạo merge commit hợp nhất "main" và "feature".' };
      },
    },
    {
      title: 'Kata 3: Rebase',
      instructions:
        'Đang ở "feature" (đã phân kỳ khỏi "main"). Dùng git rebase main để đưa commit của "feature" lên trên đỉnh "main" hiện tại, giữ lịch sử tuyến tính (không tạo merge commit).',
      setup() {
        resetEngine();
        const c0 = createCommit(null, 'Initial commit');
        branches.main = c0;
        branches.feature = c0;
        const c2 = createCommit(c0, 'Sửa lỗi validate form');
        branches.feature = c2;
        const c1 = createCommit(c0, 'Cập nhật cấu hình CI');
        branches.main = c1;
        head = { type: 'branch', name: 'feature' };
        kataCtx.mainTip = c1;
        kataCtx.featureOld = c2;
      },
      check() {
        const tip = findCommit(branches.feature);
        if (!tip) return { pass: false, message: 'Không tìm thấy commit trên "feature".' };
        if (branches.feature === kataCtx.featureOld)
          return { pass: false, message: 'Chưa rebase — "feature" vẫn ở commit cũ.' };
        if (tip.parents.length !== 1 || tip.parents[0] !== kataCtx.mainTip)
          return { pass: false, message: 'Commit đầu "feature" chưa có cha đúng là đỉnh "main".' };
        return { pass: true, message: 'Đạt! "feature" giờ nằm thẳng hàng trên đỉnh "main".' };
      },
    },
    {
      title: 'Kata 4: Cherry-pick',
      instructions:
        'Đang ở "main". Nhặt đúng commit sửa lỗi bảo mật từ nhánh "hotfix" sang "main" bằng cherry-pick — KHÔNG merge cả nhánh "hotfix".',
      setup() {
        resetEngine();
        const c0 = createCommit(null, 'Initial commit');
        branches.main = c0;
        branches.hotfix = c0;
        const c1 = createCommit(c0, 'Thêm trang chủ');
        branches.main = c1;
        const c2 = createCommit(c0, 'Sửa lỗi bảo mật XSS');
        branches.hotfix = c2;
        head = { type: 'branch', name: 'main' };
        kataCtx.mainTip = c1;
        kataCtx.hotfixTip = c2;
        kataCtx.hotfixMessage = 'Sửa lỗi bảo mật XSS';
      },
      check() {
        if (branches.hotfix !== kataCtx.hotfixTip)
          return { pass: false, message: 'Branch "hotfix" đã bị thay đổi — cherry-pick không được đụng tới nguồn.' };
        const tip = findCommit(branches.main);
        if (!tip || tip.id === kataCtx.mainTip) return { pass: false, message: 'Chưa có commit mới nào trên "main".' };
        if (tip.parents[0] !== kataCtx.mainTip)
          return { pass: false, message: 'Commit mới chưa có cha đúng là đỉnh cũ của "main".' };
        if (!tip.message.includes(kataCtx.hotfixMessage))
          return { pass: false, message: 'Nội dung commit mới chưa khớp commit cần cherry-pick từ "hotfix".' };
        return { pass: true, message: 'Đạt! Đã nhặt đúng commit sửa lỗi bảo mật sang "main".' };
      },
    },
    {
      title: 'Kata 5: Reset & Undo',
      instructions:
        '"main" đang có 1 commit thừa gây lỗi ở đầu (mới nhất). Dùng git reset --hard để đưa "main" quay lại đúng commit trước đó.',
      setup() {
        resetEngine();
        const c0 = createCommit(null, 'Initial commit');
        const c1 = createCommit(c0, 'Thêm tính năng thanh toán');
        const c2 = createCommit(c1, 'Debug tạm, quên xoá console.log');
        branches.main = c2;
        head = { type: 'branch', name: 'main' };
        kataCtx.goodTip = c1;
      },
      check() {
        if (branches.main !== kataCtx.goodTip)
          return { pass: false, message: '"main" chưa quay lại đúng commit trước khi có lỗi.' };
        return { pass: true, message: 'Đạt! "main" đã quay lại trạng thái sạch trước commit lỗi.' };
      },
    },
    {
      title: 'Kata 6: Tag Release',
      instructions:
        'Đánh dấu commit hiện tại trên "main" là bản phát hành chính thức bằng annotated tag tên "v1.0", kèm message bất kỳ.',
      setup() {
        resetEngine();
        const c0 = createCommit(null, 'Initial commit');
        const c1 = createCommit(c0, 'Release candidate');
        branches.main = c1;
        head = { type: 'branch', name: 'main' };
        kataCtx.mainTip = c1;
      },
      check() {
        const t = tags.find((tg) => tg.name === 'v1.0');
        if (!t) return { pass: false, message: 'Chưa tạo tag "v1.0".' };
        if (t.type !== 'annotated') return { pass: false, message: 'Tag "v1.0" phải là annotated (dùng -a -m).' };
        if (t.commitId !== branches.main)
          return { pass: false, message: 'Tag "v1.0" chưa trỏ đúng vào commit hiện tại của "main".' };
        return { pass: true, message: 'Đạt! "v1.0" đã đánh dấu đúng bản phát hành.' };
      },
    },
  ];

  function renderKataList() {
    kataListEl.innerHTML = '';
    KATAS.forEach((k, i) => {
      const btn = document.createElement('button');
      btn.className = 'kata-btn' + (i === activeKataIdx ? ' is-active' : '') + (passedKatas.has(i) ? ' is-passed' : '');
      btn.textContent = 'Kata ' + (i + 1);
      btn.addEventListener('click', () => loadKata(i));
      kataListEl.appendChild(btn);
    });
  }
  function loadKata(i) {
    activeKataIdx = i;
    KATAS[i].setup();
    clearLog();
    kataDescEl.textContent = KATAS[i].title + ': ' + KATAS[i].instructions;
    log('Đã tải "' + KATAS[i].title + '". Đọc mục tiêu rồi gõ lệnh, bấm "Kiểm tra" khi xong.');
    renderKataList();
    refresh();
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
  checkBtn.addEventListener('click', () => {
    const result = KATAS[activeKataIdx].check();
    if (result.pass) {
      logOk('✅ ' + result.message);
      passedKatas.add(activeKataIdx);
      renderKataList();
    } else {
      logErr(result.message);
    }
    refresh();
  });
  resetBtn.addEventListener('click', () => {
    loadKata(activeKataIdx);
  });

  loadKata(0);
})();
