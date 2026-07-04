/* Bài 11: Hooks & Worktree Simulator — pre-commit/pre-push hook demo + worktree visualizer */
(function () {
  /* ---------- Sandbox A: Hooks ---------- */
  (function () {
    const cmdInput = document.getElementById('hook-cmd-input');
    const runBtn = document.getElementById('hook-run-btn');
    const resetBtn = document.getElementById('hook-reset-btn');
    const precommitOnBtn = document.getElementById('hook-precommit-on-btn');
    const precommitOffBtn = document.getElementById('hook-precommit-off-btn');
    const codeCleanBtn = document.getElementById('hook-code-clean-btn');
    const codeDirtyBtn = document.getElementById('hook-code-dirty-btn');
    const prepushOnBtn = document.getElementById('hook-prepush-on-btn');
    const prepushOffBtn = document.getElementById('hook-prepush-off-btn');
    const testPassBtn = document.getElementById('hook-test-pass-btn');
    const testFailBtn = document.getElementById('hook-test-fail-btn');
    const logEl = document.getElementById('hook-log');
    const statusLineEl = document.getElementById('hook-status-line');
    const jsCodeDisplay = document.getElementById('hook-js-code-display');
    const canvas = document.getElementById('hook-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const CSS_W = 560;
    const CSS_H = 200;
    canvas.width = CSS_W * dpr;
    canvas.height = CSS_H * dpr;
    canvas.style.width = CSS_W + 'px';
    canvas.style.height = CSS_H + 'px';
    ctx.scale(dpr, dpr);

    let precommitEnabled, codeClean, prepushEnabled, testsPass, commitCount, pushCount;

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
      line.textContent = message;
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

    function doCommit(noVerify) {
      if (precommitEnabled && !noVerify) {
        log('🔍 Chạy .git/hooks/pre-commit (ESLint)...');
        if (!codeClean) {
          logErr('ESLint: 3 lỗi tìm thấy. Hook thoát với exit code 1 → ❌ COMMIT BỊ CHẶN.');
          return;
        }
        log('ESLint: 0 lỗi. Hook thoát với exit code 0.');
      } else if (noVerify) {
        log('--no-verify: bỏ qua mọi hook, không chạy pre-commit.');
      }
      commitCount++;
      logOk('✅ Commit thành công (#' + commitCount + ').');
    }

    function doPush(noVerify) {
      if (prepushEnabled && !noVerify) {
        log('🔍 Chạy .git/hooks/pre-push (test suite)...');
        if (!testsPass) {
          logErr('Test suite: FAIL. Hook thoát với exit code 1 → ❌ PUSH BỊ CHẶN.');
          return;
        }
        log('Test suite: PASS. Hook thoát với exit code 0.');
      } else if (noVerify) {
        log('--no-verify: bỏ qua mọi hook, không chạy pre-push.');
      }
      pushCount++;
      logOk('✅ Push thành công (#' + pushCount + ').');
    }

    function parseAndRun(cmdStr) {
      const trimmed = cmdStr.trim();
      if (!trimmed) return;
      logCmd(trimmed);
      const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      if (parts[0] !== 'git') {
        logErr('Lỗi: Lệnh phải bắt đầu bằng "git".');
        return;
      }
      const sub = parts[1];
      const rest = parts.slice(2);
      const noVerify = rest.includes('--no-verify');
      if (sub === 'commit') {
        doCommit(noVerify);
      } else if (sub === 'push') {
        doPush(noVerify);
      } else {
        logErr('Lỗi: Lệnh "git ' + sub + '" chưa được hỗ trợ trong sandbox này.');
      }
    }

    function drawToggleBox(x, y, w, h, label, enabled, color) {
      ctx.fillStyle = enabled ? color : '#313244';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h / 2);
      ctx.textBaseline = 'alphabetic';
    }

    function draw() {
      ctx.clearRect(0, 0, CSS_W, CSS_H);
      drawToggleBox(20, 20, 240, 40, 'pre-commit: ' + (precommitEnabled ? 'BẬT' : 'TẮT'), precommitEnabled, '#3b82f6');
      drawToggleBox(
        20,
        70,
        240,
        40,
        'code: ' + (codeClean ? 'SẠCH ✅' : 'LỖI LINT ❌'),
        true,
        codeClean ? '#2e7d4f' : '#a13a4c'
      );
      drawToggleBox(300, 20, 240, 40, 'pre-push: ' + (prepushEnabled ? 'BẬT' : 'TẮT'), prepushEnabled, '#3b82f6');
      drawToggleBox(
        300,
        70,
        240,
        40,
        'test: ' + (testsPass ? 'PASS ✅' : 'FAIL ❌'),
        true,
        testsPass ? '#2e7d4f' : '#a13a4c'
      );
      ctx.fillStyle = '#6c7086';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Commit thành công: ' + commitCount + '   Push thành công: ' + pushCount, 20, 140);
      ctx.fillText('Thử "git commit -m ..." rồi "git push" ở trên.', 20, 160);
    }

    function updateStatusLine() {
      statusLineEl.textContent =
        'pre-commit: ' +
        (precommitEnabled ? 'bật' : 'tắt') +
        ' (code ' +
        (codeClean ? 'sạch' : 'lỗi') +
        ')  |  pre-push: ' +
        (prepushEnabled ? 'bật' : 'tắt') +
        ' (test ' +
        (testsPass ? 'pass' : 'fail') +
        ')';
    }

    function updateJsCodeDisplay() {
      const code =
        '/* 🪝 BÀI 11: GIT HOOKS */\n\n' +
        'function preCommitHook() {\n' +
        '  if (!lintPasses()) process.exit(1); // chặn commit\n' +
        '  process.exit(0); // cho phép commit\n}\n\n' +
        'function prePushHook() {\n' +
        '  if (!testsPass()) process.exit(1); // chặn push\n' +
        '  process.exit(0); // cho phép push\n}\n\n' +
        '// Trạng thái hiện tại:\n' +
        '// pre-commit: ' +
        (precommitEnabled ? 'bật' : 'tắt') +
        ' | code: ' +
        (codeClean ? 'sạch' : 'lỗi lint') +
        '\n' +
        '// pre-push:   ' +
        (prepushEnabled ? 'bật' : 'tắt') +
        ' | test: ' +
        (testsPass ? 'pass' : 'fail') +
        '\n' +
        '// commit thành công: ' +
        commitCount +
        ' | push thành công: ' +
        pushCount;
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
      precommitEnabled = true;
      codeClean = true;
      prepushEnabled = true;
      testsPass = true;
      commitCount = 0;
      pushCount = 0;
      precommitOnBtn.classList.add('is-active');
      precommitOffBtn.classList.remove('is-active');
      codeCleanBtn.classList.add('is-active');
      codeDirtyBtn.classList.remove('is-active-bad');
      prepushOnBtn.classList.add('is-active');
      prepushOffBtn.classList.remove('is-active');
      testPassBtn.classList.add('is-active');
      testFailBtn.classList.remove('is-active-bad');
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
    precommitOnBtn.addEventListener('click', () => {
      precommitEnabled = true;
      precommitOnBtn.classList.add('is-active');
      precommitOffBtn.classList.remove('is-active');
      log('Bật hook pre-commit.');
      refresh();
    });
    precommitOffBtn.addEventListener('click', () => {
      precommitEnabled = false;
      precommitOffBtn.classList.add('is-active');
      precommitOnBtn.classList.remove('is-active');
      log('Tắt hook pre-commit.');
      refresh();
    });
    codeCleanBtn.addEventListener('click', () => {
      codeClean = true;
      codeCleanBtn.classList.add('is-active');
      codeDirtyBtn.classList.remove('is-active-bad');
      log('Code hiện tại: sạch (pass lint).');
      refresh();
    });
    codeDirtyBtn.addEventListener('click', () => {
      codeClean = false;
      codeDirtyBtn.classList.add('is-active-bad');
      codeCleanBtn.classList.remove('is-active');
      log('Code hiện tại: có lỗi lint.');
      refresh();
    });
    prepushOnBtn.addEventListener('click', () => {
      prepushEnabled = true;
      prepushOnBtn.classList.add('is-active');
      prepushOffBtn.classList.remove('is-active');
      log('Bật hook pre-push.');
      refresh();
    });
    prepushOffBtn.addEventListener('click', () => {
      prepushEnabled = false;
      prepushOffBtn.classList.add('is-active');
      prepushOnBtn.classList.remove('is-active');
      log('Tắt hook pre-push.');
      refresh();
    });
    testPassBtn.addEventListener('click', () => {
      testsPass = true;
      testPassBtn.classList.add('is-active');
      testFailBtn.classList.remove('is-active-bad');
      log('Test suite hiện tại: pass.');
      refresh();
    });
    testFailBtn.addEventListener('click', () => {
      testsPass = false;
      testFailBtn.classList.add('is-active-bad');
      testPassBtn.classList.remove('is-active');
      log('Test suite hiện tại: fail.');
      refresh();
    });
    resetBtn.addEventListener('click', () => {
      init();
      clearLog();
      log('Đã reset demo. pre-commit/pre-push đều bật, code sạch, test pass.');
      refresh();
    });

    init();
    log('Sẵn sàng. Thử đổi code sang "❌ Lỗi lint" rồi "git commit -m ..." để xem hook chặn lại.');
    refresh();
  })();

  /* ---------- Sandbox B: Worktree ---------- */
  (function () {
    const cmdInput = document.getElementById('wt-cmd-input');
    const runBtn = document.getElementById('wt-run-btn');
    const resetBtn = document.getElementById('wt-reset-btn');
    const logEl = document.getElementById('wt-log');
    const statusLineEl = document.getElementById('wt-status-line');
    const jsCodeDisplay = document.getElementById('wt-js-code-display');
    const canvas = document.getElementById('wt-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const CSS_W = 560;
    const CSS_H = 220;
    canvas.width = CSS_W * dpr;
    canvas.height = CSS_H * dpr;
    canvas.style.width = CSS_W + 'px';
    canvas.style.height = CSS_H + 'px';
    ctx.scale(dpr, dpr);

    const BRANCHES = ['main', 'hotfix', 'feature-x'];
    let worktrees; // [{path, branch}]

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

    function branchInUse(branch) {
      return worktrees.find((w) => w.branch === branch);
    }

    function doWorktreeAdd(path, branch) {
      if (!path || !branch) {
        logErr('Cú pháp: git worktree add <path> <branch>.');
        return;
      }
      if (worktrees.find((w) => w.path === path)) {
        logErr('Đường dẫn "' + path + '" đã được dùng bởi 1 worktree khác.');
        return;
      }
      if (!BRANCHES.includes(branch)) {
        logErr('Branch "' + branch + '" không tồn tại trong demo này (chỉ có: ' + BRANCHES.join(', ') + ').');
        return;
      }
      const existing = branchInUse(branch);
      if (existing) {
        logErr("branch '" + branch + "' is already checked out at '" + existing.path + "' — không thể checkout lần 2.");
        return;
      }
      worktrees.push({ path, branch });
      logOk('Đã tạo worktree mới tại "' + path + '", checkout branch "' + branch + '".');
    }

    function doWorktreeList() {
      worktrees.forEach((w) => log(w.path + '  [' + w.branch + ']'));
    }

    function doWorktreeRemove(path) {
      const idx = worktrees.findIndex((w) => w.path === path);
      if (idx === -1) {
        logErr('Không tìm thấy worktree tại "' + path + '".');
        return;
      }
      if (worktrees[idx].path === '.') {
        logErr('Không thể xoá worktree gốc (chính repo bạn đang đứng).');
        return;
      }
      const removed = worktrees.splice(idx, 1)[0];
      logOk(
        'Đã gỡ worktree "' + removed.path + '" — branch "' + removed.branch + '" giờ có thể checkout lại nơi khác.'
      );
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
      if (parts[1] !== 'worktree') {
        logErr('Sandbox này chỉ hỗ trợ "git worktree ...".');
        return;
      }
      const action = parts[2];
      const rest = parts.slice(3);
      if (action === 'add') {
        doWorktreeAdd(rest[0], rest[1]);
      } else if (action === 'list') {
        doWorktreeList();
      } else if (action === 'remove') {
        doWorktreeRemove(rest[0]);
      } else {
        logErr('Lệnh "git worktree ' + (action || '') + '" chưa được hỗ trợ trong sandbox này.');
      }
    }

    function draw() {
      ctx.clearRect(0, 0, CSS_W, CSS_H);
      const boxW = 160;
      const boxH = 70;
      const gap = 16;
      worktrees.forEach((w, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 16 + col * (boxW + gap);
        const y = 16 + row * (boxH + gap);
        ctx.fillStyle = w.path === '.' ? '#3b82f6' : '#64748b';
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, boxH, 8);
        ctx.fill();
        ctx.strokeStyle = '#1e1e2e';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📁 ' + w.path, x + boxW / 2, y + 26);
        ctx.font = '10px monospace';
        ctx.fillText('branch: ' + w.branch, x + boxW / 2, y + 46);
      });
      ctx.fillStyle = '#6c7086';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Mỗi ô = 1 working directory riêng, dùng chung 1 object database.', 10, CSS_H - 8);
    }

    function updateStatusLine() {
      statusLineEl.textContent =
        'Worktree đang hoạt động: ' + worktrees.map((w) => w.path + '(' + w.branch + ')').join(', ');
    }

    function updateJsCodeDisplay() {
      const code =
        '/* 🌲 BÀI 11: GIT WORKTREE */\n\n' +
        'function worktreeAdd(path, branch) {\n' +
        '  if (isCheckedOutSomewhereElse(branch)) throw "already checked out";\n' +
        '  worktrees.push({ path, branch }); // dùng chung .git/ gốc\n}\n\n' +
        '// Worktree hiện tại:\n' +
        worktrees.map((w) => '// ' + w.path + ' -> ' + w.branch).join('\n');
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
      worktrees = [{ path: '.', branch: 'main' }];
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
      log('Đã reset demo. Chỉ còn worktree gốc (".") checkout branch "main".');
      refresh();
    });

    init();
    log(
      'Sẵn sàng. Thử "git worktree add ../hotfix-wt hotfix", rồi thử add lần 2 cùng branch "main" xem Git chặn thế nào.'
    );
    refresh();
  })();
})();
