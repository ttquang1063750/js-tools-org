/* Bài 12: Tags & Aliases Simulator — tag comparison visualizer + alias builder */
(function () {
  /* ---------- Sandbox A: Tags ---------- */
  (function () {
    const cmdInput = document.getElementById('tag-cmd-input');
    const runBtn = document.getElementById('tag-run-btn');
    const resetBtn = document.getElementById('tag-reset-btn');
    const logEl = document.getElementById('tag-log');
    const statusLineEl = document.getElementById('tag-status-line');
    const jsCodeDisplay = document.getElementById('tag-js-code-display');
    const canvas = document.getElementById('tag-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const CSS_W = 600;
    const CSS_H = 260;
    canvas.width = CSS_W * dpr;
    canvas.height = CSS_H * dpr;
    canvas.style.width = CSS_W + 'px';
    canvas.style.height = CSS_H + 'px';
    ctx.scale(dpr, dpr);

    let commits, commitCounter, headId, tags; // tags: [{name, type:'lightweight'|'annotated', commitId, message, tagger}]

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

    function resolveRef(ref) {
      if (!ref || ref === 'HEAD') return headId;
      const c = findCommit(ref);
      if (c) return c.id;
      const t = tags.find((tg) => tg.name === ref);
      return t ? t.commitId : null;
    }

    function doCommit(message) {
      const id = 'C' + commitCounter;
      const hash = fakeHash(commitCounter);
      commitCounter++;
      commits.push({ id, hash, message: message || 'Commit không tiêu đề', order: commits.length });
      headId = id;
      log('Tạo commit ' + id + ' (' + hash + ').');
    }

    function doTagLightweight(name, ref) {
      if (tags.find((t) => t.name === name)) {
        logErr('Tag "' + name + '" đã tồn tại.');
        return;
      }
      const commitId = resolveRef(ref);
      if (!commitId) {
        logErr('Không tìm thấy ref "' + ref + '".');
        return;
      }
      tags.push({ name, type: 'lightweight', commitId });
      logOk('Tạo lightweight tag "' + name + '" → trỏ thẳng ' + commitId + '. Không object nào khác được tạo ra.');
    }

    function doTagAnnotated(name, message, ref) {
      if (tags.find((t) => t.name === name)) {
        logErr('Tag "' + name + '" đã tồn tại.');
        return;
      }
      const commitId = resolveRef(ref);
      if (!commitId) {
        logErr('Không tìm thấy ref "' + ref + '".');
        return;
      }
      tags.push({ name, type: 'annotated', commitId, message: message || '(không message)', tagger: 'js-tools-user' });
      logOk('Tạo annotated tag "' + name + '" → 1 tag object MỚI trỏ tới ' + commitId + ', kèm message + tagger.');
    }

    function doTagList() {
      if (!tags.length) {
        log('(chưa có tag nào)');
        return;
      }
      tags.forEach((t) => log(t.name + '  [' + t.type + ']  → ' + t.commitId));
    }

    function doTagDelete(name) {
      const idx = tags.findIndex((t) => t.name === name);
      if (idx === -1) {
        logErr('Không tìm thấy tag "' + name + '".');
        return;
      }
      tags.splice(idx, 1);
      logOk('Đã xoá tag "' + name + '".');
    }

    function doShow(name) {
      const t = tags.find((tg) => tg.name === name);
      if (!t) {
        logErr('Không tìm thấy tag "' + name + '".');
        return;
      }
      if (t.type === 'annotated') {
        log('tag ' + t.name + ' (annotated)');
        log('Tagger: ' + t.tagger);
        log('Message: ' + t.message);
        log('→ commit ' + t.commitId + ' (' + findCommit(t.commitId).message + ')');
      } else {
        log('tag ' + t.name + ' (lightweight, không có metadata riêng)');
        log('→ commit ' + t.commitId + ' (' + findCommit(t.commitId).message + ')');
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
      } else if (sub === 'tag') {
        if (rest[0] === '-d') {
          doTagDelete(rest[1]);
        } else if (rest[0] === '-a') {
          const name = rest[1];
          let message = '';
          const mIdx = rest.indexOf('-m');
          if (mIdx !== -1 && rest[mIdx + 1]) {
            message = rest
              .slice(mIdx + 1)
              .join(' ')
              .replace(/^"|"$/g, '');
          }
          const trailing = rest.slice(2).filter((p) => p !== '-m' && p !== '"' + message + '"' && !p.startsWith('"'));
          const ref = trailing.find((p) => p !== name);
          doTagAnnotated(name, message, ref);
        } else if (!rest[0]) {
          doTagList();
        } else {
          doTagLightweight(rest[0], rest[1]);
        }
      } else if (sub === 'show') {
        doShow(rest[0]);
      } else {
        logErr('Lệnh "git ' + sub + '" chưa được hỗ trợ trong sandbox này.');
      }
    }

    function commitPos(id) {
      const c = findCommit(id);
      return { x: 50 + c.order * 90, y: 160 };
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
      return w;
    }

    function draw() {
      ctx.clearRect(0, 0, CSS_W, CSS_H);

      for (let i = 0; i < commits.length - 1; i++) {
        const p1 = commitPos(commits[i].id);
        const p2 = commitPos(commits[i + 1].id);
        ctx.strokeStyle = '#45475a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      commits.forEach((c) => {
        const { x, y } = commitPos(c.id);
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = c.id === headId ? '#64748b' : '#45475a';
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
        ctx.fillStyle = '#a6adc8';
        ctx.font = '8px monospace';
        ctx.fillText(c.hash, x, y + 26);
      });

      drawPill(commitPos(headId).x, commitPos(headId).y - 20, 'HEAD', '#f9e2af', '#1e1e2e');

      const stackCount = {};
      tags.forEach((t) => {
        const { x, y } = commitPos(t.commitId);
        const n = stackCount[t.commitId] || 0;
        stackCount[t.commitId] = n + 1;
        if (t.type === 'lightweight') {
          drawPill(x, y - 44 - n * 46, t.name, '#f59e0b', '#1e1e2e');
        } else {
          const boxY = y - 44 - n * 46;
          const boxW = 90;
          const boxH = 26;
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath();
          ctx.roundRect(x - boxW / 2, boxY - boxH, boxW, boxH, 5);
          ctx.fill();
          ctx.strokeStyle = '#1e1e2e';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.name + ' (obj)', x, boxY - boxH / 2);
          ctx.textBaseline = 'alphabetic';
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, boxY);
          ctx.lineTo(x, y - 15);
          ctx.stroke();
        }
      });

      ctx.fillStyle = '#6c7086';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('🟧 pill = lightweight (con trỏ thẳng)   🟪 hộp object = annotated (có metadata)', 10, CSS_H - 8);
    }

    function updateStatusLine() {
      statusLineEl.textContent =
        'HEAD → ' + headId + '  |  Tags: ' + (tags.length ? tags.map((t) => t.name).join(', ') : '(chưa có)');
    }

    function updateJsCodeDisplay() {
      const code =
        '/* 🏷️ BÀI 12: TAGS */\n\n' +
        'function tag(name, ref) { refs[name] = resolve(ref); } // lightweight\n' +
        'function tagAnnotated(name, ref, msg) {\n' +
        '  const obj = createTagObject({ tagger, date, message: msg, target: resolve(ref) });\n' +
        '  refs[name] = obj.id; // ref trỏ tới OBJECT, object mới trỏ tới commit\n}\n\n' +
        '// Tags hiện tại:\n' +
        tags.map((t) => '// ' + t.name + ' (' + t.type + ') → ' + t.commitId).join('\n');
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
      commitCounter = 1;
      tags = [];
      commits.push({ id: 'C0', hash: fakeHash(0), message: 'Initial commit', order: 0 });
      headId = 'C0';
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
      log('Đã reset demo. 1 commit ban đầu, chưa có tag nào.');
      refresh();
    });

    init();
    log('Sẵn sàng. Thử "git tag v1.0" (lightweight) rồi "git tag -a v1.1 -m "Release 1.1"" (annotated) để so sánh.');
    refresh();
  })();

  /* ---------- Sandbox B: Aliases ---------- */
  (function () {
    const cmdInput = document.getElementById('alias-cmd-input');
    const runBtn = document.getElementById('alias-run-btn');
    const resetBtn = document.getElementById('alias-reset-btn');
    const logEl = document.getElementById('alias-log');
    const statusLineEl = document.getElementById('alias-status-line');
    const jsCodeDisplay = document.getElementById('alias-js-code-display');
    const gitconfigBox = document.getElementById('gitconfig-box');
    if (!gitconfigBox) return;

    let aliases; // { name: 'full command string' }

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

    const BUILTIN = ['checkout', 'branch', 'status', 'log', 'commit'];

    function runBuiltin(name, args) {
      if (name === 'status') {
        log('Trên nhánh main. Không có gì để commit, working tree sạch.');
      } else if (name === 'branch') {
        log('* main');
      } else if (name === 'checkout') {
        log("Đã chuyển sang nhánh '" + (args[0] || 'main') + "'.");
      } else if (name === 'log') {
        log('a1b2c3d Add feature X');
        log('9f8e7d6 Fix bug Y');
        log('1234abc Initial commit');
      } else if (name === 'commit') {
        log(
          'Đã tạo commit mới: "' +
            args
              .join(' ')
              .replace(/^-m\s*/, '')
              .replace(/^"|"$/g, '') +
            '".'
        );
      }
    }

    function runGitCommand(tokens, depth) {
      const name = tokens[0];
      const args = tokens.slice(1);
      if (BUILTIN.includes(name)) {
        runBuiltin(name, args);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(aliases, name)) {
        if (depth > 5) {
          logErr('Alias lồng quá sâu (có thể tự trỏ vòng lặp).');
          return;
        }
        const expanded = aliases[name] + (args.length ? ' ' + args.join(' ') : '');
        log('↳ alias "' + name + '" mở rộng thành: git ' + expanded);
        runGitCommand(expanded.match(/(?:[^\s"]+|"[^"]*")+/g) || [], depth + 1);
        return;
      }
      logErr('git: "' + name + '" không phải lệnh hay alias nào đã biết.');
    }

    function doConfigAlias(name, commandParts) {
      const command = commandParts.join(' ').replace(/^"|"$/g, '');
      if (!name || !command) {
        logErr('Cú pháp: git config --global alias.<tên> <lệnh gốc>.');
        return;
      }
      aliases[name] = command;
      logOk('Đã đăng ký alias "' + name + '" → "' + command + '". Lưu vào ~/.gitconfig [alias].');
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
      const rest = parts.slice(1);
      if (rest[0] === 'config') {
        const idx = rest.findIndex((p) => p.startsWith('alias.'));
        if (idx === -1) {
          logErr('Sandbox này chỉ hỗ trợ "git config --global alias.<tên> <lệnh>".');
          return;
        }
        const name = rest[idx].slice('alias.'.length);
        const commandParts = rest.slice(idx + 1);
        doConfigAlias(name, commandParts);
        return;
      }
      runGitCommand(rest, 0);
    }

    function updateGitconfigBox() {
      const names = Object.keys(aliases);
      if (!names.length) {
        gitconfigBox.textContent = '# ~/.gitconfig\n\n[alias]\n    (chưa có alias nào)';
        return;
      }
      gitconfigBox.textContent =
        '# ~/.gitconfig\n\n[alias]\n' + names.map((n) => '    ' + n + ' = ' + aliases[n]).join('\n');
    }

    function updateStatusLine() {
      const names = Object.keys(aliases);
      statusLineEl.textContent = names.length ? 'Alias đã tạo: ' + names.join(', ') : 'Chưa có alias nào.';
    }

    function updateJsCodeDisplay() {
      const code =
        '/* ⚙️ BÀI 12: GIT ALIAS */\n\n' +
        'function runGit(name, args) {\n' +
        '  if (isBuiltin(name)) return execute(name, args);\n' +
        '  if (aliases[name]) return runGit(...expand(aliases[name], args));\n' +
        '  throw "unknown command";\n}\n\n' +
        '// ~/.gitconfig [alias]:\n' +
        Object.keys(aliases)
          .map((n) => '// ' + n + ' = ' + aliases[n])
          .join('\n');
      if (jsCodeDisplay) {
        jsCodeDisplay.textContent = code;
        if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
      }
    }

    function refresh() {
      updateGitconfigBox();
      updateStatusLine();
      updateJsCodeDisplay();
    }

    function init() {
      aliases = {};
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
      log('Đã reset demo. Chưa có alias nào.');
      refresh();
    });

    init();
    log('Sẵn sàng. Thử "git config --global alias.co checkout" rồi "git co main" để xem alias mở rộng.');
    refresh();
  })();
})();
