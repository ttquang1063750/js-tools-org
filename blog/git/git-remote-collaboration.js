/* Bài 9: Remote & Collaboration Simulator — fetch/pull/push giữa local và remote (origin) */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return; // page without the sandbox

  const cmdInput = document.getElementById('graph-cmd-input');
  const runBtn = document.getElementById('graph-run-btn');
  const teammateBtn = document.getElementById('graph-teammate-btn');
  const resetBtn = document.getElementById('graph-reset-btn');
  const logEl = document.getElementById('graph-log');
  const statusLineEl = document.getElementById('graph-status-line');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 650;
  const CSS_H = 300;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let commits, laneOf, laneContinued, nextLane, commitCounter;
  let remoteMainId, localMainId, localOriginMainId, knownByLocal, teammateSeq;

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

  function createCommit(parentId, message) {
    const id = 'C' + commitCounter;
    const hash = fakeHash(commitCounter);
    commitCounter++;
    const parents = parentId ? [parentId] : [];
    commits.push({ id, hash, parents, message, order: commits.length });
    assignLane(id, parentId);
    return id;
  }

  function doCommit(message) {
    const id = createCommit(localMainId, message || 'Commit không tiêu đề');
    localMainId = id;
    knownByLocal.add(id);
    log('Tạo commit ' + id + ' trên local main.');
  }

  function doFetch() {
    localOriginMainId = remoteMainId;
    reachable(remoteMainId).forEach((id) => knownByLocal.add(id));
    log('git fetch: origin/main (cache cục bộ) → ' + remoteMainId + '. main cục bộ KHÔNG đổi.');
  }

  function doPush() {
    if (remoteMainId === localMainId) {
      log('Everything up-to-date — remote đã khớp local.');
      return;
    }
    if (isAncestorOrSelf(remoteMainId, localMainId)) {
      remoteMainId = localMainId;
      localOriginMainId = localMainId;
      logOk('git push: fast-forward thành công — remote main → ' + localMainId + '.');
    } else {
      logErr(
        'push bị TỪ CHỐI (non-fast-forward)! Remote đang ở ' +
          remoteMainId +
          ' — có commit bạn chưa có. Chạy "git fetch" rồi "git pull"/"git pull --rebase" trước.'
      );
    }
  }

  function doPull(rebaseFlag) {
    doFetch();
    if (isAncestorOrSelf(localOriginMainId, localMainId)) {
      log('Already up to date — local đã chứa mọi commit của origin/main.');
      return;
    }
    if (isAncestorOrSelf(localMainId, localOriginMainId)) {
      localMainId = localOriginMainId;
      logOk('git pull: fast-forward — main cục bộ → ' + localMainId + '.');
      return;
    }
    if (rebaseFlag) {
      const localOnly = [...reachable(localMainId)].filter((id) => !reachable(localOriginMainId).has(id));
      const oldCommits = localOnly.map((id) => findCommit(id)).sort((a, b) => a.order - b.order);
      let base = localOriginMainId;
      oldCommits.forEach((oc) => {
        base = createCommit(base, oc.message);
        knownByLocal.add(base);
      });
      localMainId = base;
      logOk('git pull --rebase: phát lại ' + oldCommits.length + ' commit cục bộ lên trên origin/main → ' + base + '.');
    } else {
      const mergeId = 'C' + commitCounter;
      const hash = fakeHash(commitCounter);
      commitCounter++;
      commits.push({
        id: mergeId,
        hash,
        parents: [localMainId, localOriginMainId],
        message: "Merge branch 'main' của origin/main",
        order: commits.length,
      });
      assignLane(mergeId, localMainId);
      knownByLocal.add(mergeId);
      localMainId = mergeId;
      logOk('git pull: đã phân kỳ → tạo merge commit ' + mergeId + ' (2 cha).');
    }
  }

  function doTeammatePush() {
    teammateSeq++;
    const id = createCommit(remoteMainId, 'Đồng nghiệp: thay đổi #' + teammateSeq);
    remoteMainId = id;
    log('👥 Đồng nghiệp vừa push commit ' + id + ' thẳng lên remote (bạn chưa fetch nên chưa biết).');
  }

  function doLog() {
    const lines = [];
    let cur = localMainId;
    const seen = new Set();
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      const c = findCommit(cur);
      if (!c) break;
      lines.push(c.id + ' ' + c.hash + ' — ' + c.message);
      cur = c.parents[0];
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
    } else if (sub === 'fetch') {
      doFetch();
    } else if (sub === 'pull') {
      doPull(rest.includes('--rebase'));
    } else if (sub === 'push') {
      doPush();
    } else if (sub === 'log') {
      doLog();
    } else {
      logErr('Lệnh "git ' + sub + '" chưa được hỗ trợ trong sandbox này.');
    }
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
    const spacingX = 80;
    const baseX = 50;
    const laneHeight = 60;
    const baseY = 60;

    function pos(id) {
      const c = findCommit(id);
      return { x: baseX + c.order * spacingX, y: baseY + laneOf[id] * laneHeight };
    }

    commits.forEach((c) => {
      c.parents.forEach((parentId) => {
        const p1 = pos(parentId);
        const p2 = pos(c.id);
        const ghost = !knownByLocal.has(c.id) || !knownByLocal.has(parentId);
        ctx.strokeStyle = ghost ? '#313244' : '#45475a';
        ctx.setLineDash(ghost ? [3, 2] : []);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    commits.forEach((c) => {
      const { x, y } = pos(c.id);
      const known = knownByLocal.has(c.id);
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = known ? '#64748b' : '#313244';
      ctx.fill();
      ctx.setLineDash(known ? [] : [3, 2]);
      ctx.strokeStyle = known ? '#1e1e2e' : '#f38ba8';
      ctx.lineWidth = known ? 1 : 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(known ? c.id : '?', x, y);
      ctx.textBaseline = 'alphabetic';
      if (known) {
        ctx.fillStyle = '#a6adc8';
        ctx.font = '8px monospace';
        ctx.fillText(c.hash, x, y + 28);
      }
    });

    const stackCount = {};
    function stackPill(id, text, color, textColor) {
      const { x, y } = pos(id);
      const n = stackCount[id] || 0;
      stackCount[id] = n + 1;
      drawPill(x, y - 22 - n * 22, text, color, textColor);
    }

    stackPill(localOriginMainId, 'origin/main (cache)', '#9d7cd8');
    stackPill(localMainId, 'main', '#3b82f6');
    stackPill(remoteMainId, '☁ remote HEAD', '#22b8cf', '#1e1e2e');

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⬜ đã biết (local có object)   🕳️ nét đứt hồng "?" = chưa fetch, chưa biết tới', 10, CSS_H - 8);
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'main (local) → ' +
      localMainId +
      '  |  origin/main (cache) → ' +
      localOriginMainId +
      '  |  ☁ remote thực tế → ' +
      remoteMainId +
      (knownByLocal.has(remoteMainId) ? '' : ' (local chưa biết!)');
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🌐 BÀI 9: REMOTE & COLLABORATION */\n\n' +
      'function push() {\n' +
      '  if (isAncestorOrSelf(remoteMain, localMain)) remoteMain = localMain; // fast-forward\n' +
      '  else reject("non-fast-forward — fetch/pull trước");\n}\n\n' +
      'function pull(rebase) {\n' +
      '  fetch(); // originMain = remoteMain\n' +
      '  if (isAncestorOrSelf(originMain, localMain)) return; // up to date\n' +
      '  if (isAncestorOrSelf(localMain, originMain)) { localMain = originMain; return; } // fast-forward\n' +
      '  rebase ? replayLocalOnly(onto: originMain) : mergeCommit(localMain, originMain);\n}\n\n' +
      '// Trạng thái hiện tại:\n' +
      '// main (local):        ' +
      localMainId +
      '\n' +
      '// origin/main (cache): ' +
      localOriginMainId +
      '\n' +
      '// remote HEAD (thật):  ' +
      remoteMainId +
      (knownByLocal.has(remoteMainId) ? '' : '  // local CHƯA fetch commit này!');

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
    laneOf = {};
    laneContinued = new Set();
    nextLane = 1;
    commitCounter = 1;
    knownByLocal = new Set();
    teammateSeq = 0;

    commits.push({ id: 'C0', hash: fakeHash(0), parents: [], message: 'Initial commit', order: 0 });
    laneOf['C0'] = 0;
    knownByLocal.add('C0');

    // Kịch bản khởi đầu: local đã commit 1 thay đổi, ĐỒNG THỜI đồng nghiệp đã push 1 commit khác lên remote
    // mà local chưa hề fetch — 2 nhánh đã phân kỳ ngay từ đầu, y hệt "va chạm" thực tế.
    const localId = createCommit('C0', 'Thêm tính năng tìm kiếm');
    knownByLocal.add(localId);
    localMainId = localId;

    const remoteId = createCommit('C0', 'Đồng nghiệp: sửa lỗi bảo mật');
    remoteMainId = remoteId; // KHÔNG add vào knownByLocal — local chưa fetch nên chưa biết

    localOriginMainId = 'C0';
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

  teammateBtn.addEventListener('click', () => {
    doTeammatePush();
    refresh();
  });

  resetBtn.addEventListener('click', () => {
    init();
    clearLog();
    log('Đã reset demo. Local đã commit "Thêm tính năng tìm kiếm", đồng nghiệp đã âm thầm push 1 commit khác.');
    refresh();
  });

  init();
  log(
    'Sẵn sàng. Thử "git push" ngay xem điều gì xảy ra (remote đã có commit bạn chưa fetch), rồi "git fetch" và so sánh "git pull" với "git pull --rebase".'
  );
  refresh();
})();
