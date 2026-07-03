/* Bài 8: Git Bisect Simulator — tìm kiếm nhị phân trên 1 lịch sử tuyến tính 24 commit */
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
  const CSS_W = 680;
  const CSS_H = 220;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  const MESSAGES = [
    'Khởi tạo dự án',
    'Thêm module routing',
    'Thêm xác thực người dùng',
    'Viết test cho API',
    'Thêm cấu hình CI',
    'Cải thiện logging',
    'Thêm rate limiting',
    'Sửa lỗi encoding UTF-8',
    'Thêm cache Redis',
    'Tối ưu truy vấn DB',
    'Thêm tính năng tìm kiếm',
    'Refactor module thanh toán',
    'Thêm test tích hợp',
    'Cập nhật dependency',
    'Thêm dark mode',
    'Tối ưu bundle size',
    'Thêm i18n tiếng Việt',
    'Đổi chiến lược cache LRU → LFU',
    'Thêm tính năng export PDF',
    'Sửa lỗi timezone',
    'Thêm pagination',
    'Refactor CSS',
    'Thêm analytics',
    'Cập nhật changelog',
  ];
  const N = MESSAGES.length;
  const HIDDEN_BAD_INDEX = 17; // "Đổi chiến lược cache LRU → LFU" — thủ phạm giấu kín

  function fakeHash(seed) {
    let h = (seed * 2654435761) % 4294967296;
    if (h < 0) h += 4294967296;
    return h.toString(16).padStart(8, '0').slice(0, 7);
  }

  let commits, session;

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

  function resolveIndex(ref) {
    if (ref === undefined || ref === null) return null;
    const m = String(ref).match(/^C(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      return idx >= 0 && idx < N ? idx : null;
    }
    return null;
  }

  function ensureSession() {
    if (!session) {
      logErr('Chưa có phiên bisect nào. Chạy "git bisect start" trước.');
      return false;
    }
    return true;
  }

  function doBisectStart() {
    if (session) {
      logErr('Đã có 1 phiên bisect đang chạy. Dùng "git bisect reset" để thoát trước.');
      return;
    }
    session = { lo: null, hi: null, current: null, history: [], done: false };
    log('Bắt đầu phiên bisect. Đánh dấu 1 mốc "bad" (thường là HEAD) và 1 mốc "good" (commit cũ chắc chắn ổn).');
  }

  function markResult(idx, verdict, isSkip) {
    if (isSkip) {
      log('Bỏ qua C' + idx + ' (skip) — không tính là good hay bad.');
      proceedBisect(idx);
      return;
    }
    session.history.push({ idx, verdict });
    if (verdict === 'bad') {
      if (session.hi === null || idx < session.hi) session.hi = idx;
    } else {
      if (session.lo === null || idx > session.lo) session.lo = idx;
    }
    logOk('Đánh dấu C' + idx + ' là ' + (verdict === 'bad' ? 'BAD (lỗi)' : 'GOOD (ổn)') + '.');
    proceedBisect(idx);
  }

  function proceedBisect() {
    if (session.lo === null || session.hi === null) {
      log('Cần cả 1 mốc good và 1 mốc bad để bisect bắt đầu thu hẹp phạm vi.');
      return;
    }
    if (session.hi - session.lo <= 1) {
      session.current = null;
      session.done = true;
      logOk(
        '✅ C' +
          session.hi +
          ' ("' +
          MESSAGES[session.hi] +
          '") là commit lỗi đầu tiên. Tổng số lần test: ' +
          session.history.length +
          ' (so với tối đa ' +
          (N - 1) +
          ' lần nếu dò tuần tự).'
      );
      return;
    }
    const mid = Math.floor((session.lo + session.hi) / 2);
    session.current = mid;
    const remaining = session.hi - session.lo - 1;
    const approxSteps = Math.ceil(Math.log2(Math.max(remaining, 1)));
    log(
      'Bisecting: còn ' +
        remaining +
        ' commit chưa rõ, ước tính ~' +
        approxSteps +
        ' bước nữa. Đang checkout C' +
        mid +
        ' (detached HEAD)...'
    );
  }

  function doBisectBad(ref) {
    if (!ensureSession()) return;
    const explicit = resolveIndex(ref);
    const idx = explicit !== null ? explicit : session.current !== null ? session.current : N - 1;
    markResult(idx, 'bad', false);
  }

  function doBisectGood(ref) {
    if (!ensureSession()) return;
    const explicit = resolveIndex(ref);
    const idx = explicit !== null ? explicit : session.current;
    if (idx === null) {
      logErr('Cần chỉ rõ commit: git bisect good C<n>.');
      return;
    }
    markResult(idx, 'good', false);
  }

  function doBisectSkip() {
    if (!ensureSession()) return;
    if (session.current === null) {
      logErr('Chưa có commit nào đang checkout để skip.');
      return;
    }
    markResult(session.current, null, true);
  }

  function doBisectLog() {
    if (!ensureSession()) return;
    if (!session.history.length) {
      log('(chưa có lần đánh dấu nào)');
      return;
    }
    session.history.forEach((h, i) => {
      log('#' + (i + 1) + ' C' + h.idx + ' — ' + (h.verdict === 'bad' ? 'bad' : 'good'));
    });
  }

  function doBisectRun() {
    if (!ensureSession()) return;
    if (session.lo === null || session.hi === null) {
      logErr('Cần đánh dấu ít nhất 1 good và 1 bad trước khi chạy "git bisect run".');
      return;
    }
    if (session.done) {
      log('Bisect đã hoàn tất.');
      return;
    }
    log('git bisect run: tự động lặp checkout → chạy script test → đọc exit code...');
    let guard = 0;
    while (!session.done && guard < 30) {
      guard++;
      const idx = session.current;
      const exitCode = idx <= HIDDEN_BAD_INDEX ? (idx < HIDDEN_BAD_INDEX ? 0 : 1) : 1;
      log('  script test tại C' + idx + ' → exit code ' + exitCode + ' (' + (exitCode === 0 ? 'good' : 'bad') + ')');
      markResult(idx, exitCode === 0 ? 'good' : 'bad', false);
    }
  }

  function doBisectReset() {
    if (!session) {
      logErr('Không có phiên bisect nào đang chạy.');
      return;
    }
    session = null;
    log('Đã thoát bisect, quay lại HEAD ban đầu (C' + (N - 1) + ').');
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

    if (sub !== 'bisect') {
      logErr('Sandbox này chỉ hỗ trợ "git bisect ...".');
      return;
    }

    const action = rest[0];
    if (action === 'start') {
      doBisectStart();
    } else if (action === 'bad') {
      doBisectBad(rest[1]);
    } else if (action === 'good') {
      doBisectGood(rest[1]);
    } else if (action === 'skip') {
      doBisectSkip();
    } else if (action === 'log') {
      doBisectLog();
    } else if (action === 'run') {
      doBisectRun();
    } else if (action === 'reset') {
      doBisectReset();
    } else {
      logErr('Lệnh "git bisect ' + (action || '') + '" chưa được hỗ trợ trong sandbox này.');
    }
  }

  function drawCommit(x, y, idx, r) {
    const st = commitStatus(idx);
    let fill = '#45475a';
    if (st === 'good') fill = '#2e7d4f';
    else if (st === 'bad') fill = '#a13a4c';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    const isCurrent = session && session.current === idx && !session.done;
    ctx.setLineDash(isCurrent ? [2, 2] : []);
    ctx.strokeStyle = isCurrent ? '#f9e2af' : '#1e1e2e';
    ctx.lineWidth = isCurrent ? 2 : 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#cdd6f4';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('C' + idx, x, y + r + 11);
  }

  function commitStatus(idx) {
    if (!session) return 'unknown';
    if (session.lo !== null && idx <= session.lo) {
      const wasTested = session.history.some((h) => h.idx === idx && h.verdict === 'good');
      return wasTested ? 'good' : 'unknown';
    }
    if (session.hi !== null && idx >= session.hi) {
      const wasTested = session.history.some((h) => h.idx === idx && h.verdict === 'bad');
      return wasTested ? 'bad' : 'unknown';
    }
    return 'unknown';
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const r = 9;
    const spacing = (CSS_W - 40) / (N - 1);
    const y = 60;

    for (let i = 0; i < N - 1; i++) {
      const x1 = 20 + i * spacing;
      const x2 = 20 + (i + 1) * spacing;
      ctx.strokeStyle = '#313244';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    for (let i = 0; i < N; i++) {
      drawCommit(20 + i * spacing, y, i, r);
    }

    // lo/hi range brackets
    if (session && (session.lo !== null || session.hi !== null)) {
      ctx.fillStyle = '#a6adc8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      if (session.lo !== null) {
        ctx.fillText('good ▲', 20 + session.lo * spacing, y - 18);
      }
      if (session.hi !== null) {
        ctx.fillText('bad ▲', 20 + session.hi * spacing, y - 18);
      }
    }

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⬛ chưa rõ   🟩 good   🟥 bad   ▨ viền vàng nét đứt = đang checkout (bisect)', 10, CSS_H - 30);

    // legend of current commit message
    if (session && session.current !== null && !session.done) {
      ctx.fillStyle = '#f9e2af';
      ctx.font = '11px monospace';
      ctx.fillText('Đang xem: C' + session.current + ' — "' + MESSAGES[session.current] + '"', 10, CSS_H - 12);
    } else if (session && session.done) {
      ctx.fillStyle = '#a6e3a1';
      ctx.font = '11px monospace';
      ctx.fillText('Bisect hoàn tất — xem nhật ký để biết thủ phạm.', 10, CSS_H - 12);
    } else {
      ctx.fillStyle = '#6c7086';
      ctx.font = '11px monospace';
      ctx.fillText('HEAD hiện tại: C' + (N - 1) + ' (bad) — chưa bắt đầu bisect.', 10, CSS_H - 12);
    }
  }

  function updateStatusLine() {
    if (!session) {
      statusLineEl.textContent = 'Chưa bisect. HEAD -> C' + (N - 1) + ' (tip).';
      return;
    }
    const lo = session.lo !== null ? 'C' + session.lo : '?';
    const hi = session.hi !== null ? 'C' + session.hi : '?';
    statusLineEl.textContent =
      'Phạm vi: (' + lo + ' good .. ' + hi + ' bad)' + (session.done ? ' — ĐÃ TÌM RA THỦ PHẠM: ' + hi : '');
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🔍 BÀI 8: GIT BISECT */\n\n' +
      'function bisect(lo, hi) {\n' +
      '  if (hi - lo <= 1) return hi; // hi là commit lỗi đầu tiên\n' +
      '  const mid = Math.floor((lo + hi) / 2);\n' +
      '  return test(mid) === "good" ? bisect(mid, hi) : bisect(lo, mid);\n}\n\n' +
      '// Trạng thái hiện tại:\n' +
      '// good boundary: ' +
      (session && session.lo !== null ? 'C' + session.lo : 'chưa có') +
      '\n' +
      '// bad boundary:  ' +
      (session && session.hi !== null ? 'C' + session.hi : 'chưa có') +
      '\n' +
      '// đang checkout: ' +
      (session && session.current !== null ? 'C' + session.current : '(none)') +
      '\n' +
      '// số lần test:   ' +
      (session ? session.history.length : 0) +
      ' / tối đa ' +
      (N - 1) +
      ' nếu dò tuần tự';

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
    commits = MESSAGES.map((message, i) => ({ id: 'C' + i, hash: fakeHash(i), message, index: i }));
    session = null;
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
    log('Đã reset demo. 24 commit, 1 thủ phạm giấu kín. HEAD hiện tại (C' + (N - 1) + ') coi như bad.');
    refresh();
  });

  init();
  log(
    'Sẵn sàng. Thử: "git bisect start", "git bisect bad" (đánh dấu HEAD lỗi), "git bisect good C0" (mốc cũ chắc chắn ổn).'
  );
  refresh();
})();
