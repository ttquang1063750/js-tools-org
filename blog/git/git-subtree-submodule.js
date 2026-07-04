/* Bài 10: Subtree & Submodule Simulator — nhúng 1 repo thư viện vào repo chính theo 2 cách */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return; // page without the sandbox

  const cmdInput = document.getElementById('graph-cmd-input');
  const runBtn = document.getElementById('graph-run-btn');
  const libUpdateBtn = document.getElementById('graph-lib-update-btn');
  const resetBtn = document.getElementById('graph-reset-btn');
  const modeSubmoduleBtn = document.getElementById('mode-submodule-btn');
  const modeSubtreeBtn = document.getElementById('mode-subtree-btn');
  const logEl = document.getElementById('graph-log');
  const statusLineEl = document.getElementById('graph-status-line');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 650;
  const CSS_H = 280;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let mode; // 'submodule' | 'subtree'
  let libCommits, libCounter, libHeadId;
  let mainCommits, mainCounter, mainHeadId;
  let submodulePinnedLibId, submoduleWorkingLibId;
  let subtreeMergedLibId;

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

  function findLib(id) {
    return libCommits.find((c) => c.id === id);
  }

  function findMain(id) {
    return mainCommits.find((c) => c.id === id);
  }

  function doLibUpdate() {
    const id = 'L' + libCounter;
    const hash = fakeHash(libCounter + 100);
    libCounter++;
    libCommits.push({ id, hash, message: 'Cập nhật thư viện #' + libCounter, order: libCommits.length });
    libHeadId = id;
    log('📦 Thư viện có bản cập nhật mới: ' + id + '.');
  }

  function createMainCommit(message, meta) {
    const id = 'M' + mainCounter;
    const hash = fakeHash(mainCounter);
    mainCounter++;
    mainCommits.push({ id, hash, message, order: mainCommits.length, meta: meta || null });
    mainHeadId = id;
    return id;
  }

  function doMainCommit(message) {
    if (mode === 'submodule' && submoduleWorkingLibId !== null && submoduleWorkingLibId !== submodulePinnedLibId) {
      const libId = submoduleWorkingLibId;
      createMainCommit(message, { type: 'submodule-pin', libId });
      submodulePinnedLibId = libId;
      logOk('Commit ' + mainHeadId + ': ghi lại gitlink libs/lib → ' + libId + '.');
      return;
    }
    createMainCommit(message, null);
    log('Tạo commit ' + mainHeadId + ' (không liên quan tới thư viện).');
  }

  function doSubmoduleAdd() {
    if (mode !== 'submodule') {
      logErr('Lệnh này dành cho chế độ Submodule. Đang ở chế độ Subtree.');
      return;
    }
    if (submodulePinnedLibId !== null || submoduleWorkingLibId !== null) {
      logErr('Submodule libs/lib đã được thêm rồi.');
      return;
    }
    submoduleWorkingLibId = libHeadId;
    log(
      'git submodule add: đã stage .gitmodules + gitlink (trỏ tới ' +
        libHeadId +
        ') tại libs/lib — CẦN "git commit" để lưu lại.'
    );
  }

  function doSubmoduleUpdateRemote() {
    if (mode !== 'submodule') {
      logErr('Lệnh này dành cho chế độ Submodule. Đang ở chế độ Subtree.');
      return;
    }
    if (submodulePinnedLibId === null) {
      logErr('Chưa có submodule nào — chạy "git submodule add lib.git libs/lib" trước.');
      return;
    }
    submoduleWorkingLibId = libHeadId;
    if (submoduleWorkingLibId === submodulePinnedLibId) {
      log('libs/lib đã ở bản mới nhất (' + libHeadId + ').');
    } else {
      log(
        'git submodule update --remote: working copy libs/lib → ' +
          libHeadId +
          '. Repo chính CHƯA commit thay đổi con trỏ này — chạy "git commit" để ghi lại.'
      );
    }
  }

  function doSubtreeAdd(squash) {
    if (mode !== 'subtree') {
      logErr('Lệnh này dành cho chế độ Subtree. Đang ở chế độ Submodule.');
      return;
    }
    if (subtreeMergedLibId !== null) {
      logErr('libs/lib đã được add bằng subtree rồi — dùng "git subtree pull" để cập nhật.');
      return;
    }
    createMainCommit((squash ? 'Squash ' : 'Merge ') + "nội dung 'libs/lib' từ thư viện tại " + libHeadId, {
      type: 'subtree-merge',
      libId: libHeadId,
      squash,
    });
    subtreeMergedLibId = libHeadId;
    logOk(
      'git subtree add: commit ' +
        mainHeadId +
        ' tạo ra ngay lập tức, nhúng thẳng nội dung libs/lib tới ' +
        libHeadId +
        (squash ? ' (đã squash thành 1 commit).' : ' (giữ nguyên lịch sử thư viện).')
    );
  }

  function doSubtreePull(squash) {
    if (mode !== 'subtree') {
      logErr('Lệnh này dành cho chế độ Subtree. Đang ở chế độ Submodule.');
      return;
    }
    if (subtreeMergedLibId === null) {
      logErr('Chưa add subtree — chạy "git subtree add --prefix=libs/lib lib.git main --squash" trước.');
      return;
    }
    if (subtreeMergedLibId === libHeadId) {
      log('libs/lib đã ở bản mới nhất (' + libHeadId + ') — không có gì để pull.');
      return;
    }
    createMainCommit(
      (squash ? 'Squash ' : 'Merge ') + "cập nhật 'libs/lib' từ " + subtreeMergedLibId + ' → ' + libHeadId,
      { type: 'subtree-merge', libId: libHeadId, squash }
    );
    subtreeMergedLibId = libHeadId;
    logOk('git subtree pull: commit ' + mainHeadId + ' nhúng thêm thay đổi thư viện tới ' + libHeadId + '.');
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
      doMainCommit(message);
    } else if (sub === 'submodule') {
      if (rest[0] === 'add') doSubmoduleAdd();
      else if (rest[0] === 'update' && rest.includes('--remote')) doSubmoduleUpdateRemote();
      else logErr('Lệnh "git submodule ' + (rest[0] || '') + '" chưa được hỗ trợ trong sandbox này.');
    } else if (sub === 'subtree') {
      const squash = rest.includes('--squash');
      if (rest[0] === 'add') doSubtreeAdd(squash);
      else if (rest[0] === 'pull') doSubtreePull(squash);
      else logErr('Lệnh "git subtree ' + (rest[0] || '') + '" chưa được hỗ trợ trong sandbox này.');
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

  function libPos(id) {
    const c = findLib(id);
    return { x: 60 + c.order * 70, y: 55 };
  }

  function mainPos(id) {
    const c = findMain(id);
    return { x: 60 + c.order * 70, y: 195 };
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    ctx.fillStyle = '#a6adc8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📦 Thư viện (repo riêng)', 10, 18);
    ctx.fillText('🏠 Repo chính', 10, 158);

    // lib chain
    for (let i = 0; i < libCommits.length - 1; i++) {
      const p1 = libPos(libCommits[i].id);
      const p2 = libPos(libCommits[i + 1].id);
      ctx.strokeStyle = '#45475a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    libCommits.forEach((c) => {
      const { x, y } = libPos(c.id);
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0e7490';
      ctx.fill();
      ctx.strokeStyle = '#1e1e2e';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.id, x, y);
      ctx.textBaseline = 'alphabetic';
    });
    drawPill(libPos(libHeadId).x, libPos(libHeadId).y - 20, 'HEAD', '#22b8cf', '#1e1e2e');

    // main chain
    for (let i = 0; i < mainCommits.length - 1; i++) {
      const p1 = mainPos(mainCommits[i].id);
      const p2 = mainPos(mainCommits[i + 1].id);
      ctx.strokeStyle = '#45475a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    mainCommits.forEach((c) => {
      const { x, y } = mainPos(c.id);
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#1e1e2e';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.id, x, y);
      ctx.textBaseline = 'alphabetic';

      if (c.meta && c.meta.type === 'submodule-pin') {
        ctx.strokeStyle = '#9d7cd8';
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 1.5;
        const lp = libPos(c.meta.libId);
        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(lp.x, lp.y + 14);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#9d7cd8';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔗→' + c.meta.libId, x, y + 26);
      } else if (c.meta && c.meta.type === 'subtree-merge') {
        ctx.strokeStyle = '#2e7d4f';
        ctx.lineWidth = 2.5;
        const lp = libPos(c.meta.libId);
        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(lp.x, lp.y + 14);
        ctx.stroke();
        ctx.fillStyle = '#2e7d4f';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📥' + c.meta.libId, x, y + 26);
      }
    });
    drawPill(mainPos(mainHeadId).x, mainPos(mainHeadId).y - 20, 'main', '#3b82f6');

    if (mode === 'submodule' && submoduleWorkingLibId !== null && submoduleWorkingLibId !== submodulePinnedLibId) {
      const wp = libPos(submoduleWorkingLibId);
      ctx.fillStyle = '#f9e2af';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('working copy (chưa commit)', wp.x, wp.y + 26);
    }

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      '🔗 nét đứt tím = gitlink (chỉ con trỏ)   📥 nét liền xanh = nội dung được nhúng thẳng',
      10,
      CSS_H - 8
    );
  }

  function updateStatusLine() {
    if (mode === 'submodule') {
      const pinned = submodulePinnedLibId === null ? '(chưa add)' : submodulePinnedLibId;
      const working =
        submoduleWorkingLibId === null
          ? ''
          : '  |  working copy: ' +
            submoduleWorkingLibId +
            (submoduleWorkingLibId !== submodulePinnedLibId ? ' (CHƯA commit!)' : '');
      statusLineEl.textContent = 'Chế độ: SUBMODULE  |  libs/lib (đã commit): ' + pinned + working;
    } else {
      const merged = subtreeMergedLibId === null ? '(chưa add)' : subtreeMergedLibId;
      statusLineEl.textContent = 'Chế độ: SUBTREE  |  libs/lib (nội dung đã merge tới): ' + merged;
    }
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 📦 BÀI 10: SUBTREE & SUBMODULE */\n\n' +
      (mode === 'submodule'
        ? 'submodule: repo chính chỉ lưu gitlink (con trỏ SHA)\n' +
          '// libs/lib (pinned):      ' +
          (submodulePinnedLibId || '(chưa add)') +
          '\n' +
          '// libs/lib (working copy): ' +
          (submoduleWorkingLibId || '(chưa add)') +
          (submoduleWorkingLibId !== submodulePinnedLibId ? '  // CHƯA commit!' : '')
        : 'subtree: repo chính nhúng thẳng nội dung thư viện\n' +
          '// libs/lib (nội dung đã merge tới): ' +
          (subtreeMergedLibId || '(chưa add)')) +
      '\n\n// Thư viện (repo riêng), HEAD hiện tại: ' +
      libHeadId +
      '\n// main (repo chính), HEAD hiện tại: ' +
      mainHeadId;

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
    mode = 'submodule';
    modeSubmoduleBtn.classList.add('is-active');
    modeSubtreeBtn.classList.remove('is-active');

    libCommits = [{ id: 'L0', hash: fakeHash(100), message: 'Initial lib commit', order: 0 }];
    libCounter = 1;
    libHeadId = 'L0';

    mainCommits = [{ id: 'M0', hash: fakeHash(0), message: 'Initial commit', order: 0, meta: null }];
    mainCounter = 1;
    mainHeadId = 'M0';

    submodulePinnedLibId = null;
    submoduleWorkingLibId = null;
    subtreeMergedLibId = null;
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

  libUpdateBtn.addEventListener('click', () => {
    doLibUpdate();
    refresh();
  });

  modeSubmoduleBtn.addEventListener('click', () => {
    if (mode === 'submodule') return;
    mode = 'submodule';
    modeSubmoduleBtn.classList.add('is-active');
    modeSubtreeBtn.classList.remove('is-active');
    log('Chuyển sang chế độ SUBMODULE.');
    refresh();
  });

  modeSubtreeBtn.addEventListener('click', () => {
    if (mode === 'subtree') return;
    mode = 'subtree';
    modeSubtreeBtn.classList.add('is-active');
    modeSubmoduleBtn.classList.remove('is-active');
    log('Chuyển sang chế độ SUBTREE.');
    refresh();
  });

  resetBtn.addEventListener('click', () => {
    init();
    clearLog();
    log('Đã reset demo. Chế độ: Submodule. Thư viện và repo chính đều mới có 1 commit ban đầu.');
    refresh();
  });

  init();
  log(
    'Sẵn sàng. Thử "git submodule add lib.git libs/lib" rồi "git commit -m Add-submodule", hoặc chuyển sang chế độ Subtree và thử "git subtree add --prefix=libs/lib lib.git main --squash".'
  );
  refresh();
})();
