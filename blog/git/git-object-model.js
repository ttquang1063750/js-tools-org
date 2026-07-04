/* Bài 1: Git Object Explorer — Blob/Tree/Commit với SHA-1 thật qua Web Crypto API */
(function () {
  const canvas = document.getElementById('obj-canvas');
  if (!canvas) return; // page without the sandbox

  const file1Input = document.getElementById('obj-file1-content');
  const file2Input = document.getElementById('obj-file2-content');
  const msgInput = document.getElementById('obj-commit-msg');
  const commitBtn = document.getElementById('obj-commit-btn');
  const resetBtn = document.getElementById('obj-reset-btn');
  const statCommits = document.getElementById('obj-stat-commits');
  const statObjects = document.getElementById('obj-stat-objects');
  const logEl = document.getElementById('obj-log');
  const storeTableEl = document.getElementById('obj-store-table');
  const jsCodeDisplay = document.getElementById('js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 600;
  const CSS_H = 230;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  const FILE_NAMES = ['README.md', 'app.js'];

  let objectStore = new Map(); // hash -> { type: 'blob'|'tree'|'commit', summary }
  let commits = []; // { hash, treeHash, parentHash, message, fileHashes: {name: hash} }
  let seq = 0;
  let selectedIndex = -1;

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = '';
  }

  function short(hash) {
    return hash.slice(0, 7);
  }

  function truncateText(s, n) {
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  async function sha1Hex(str) {
    const bytes = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-1', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Real Git format: "<type> <byte-length>\0<content>" is what actually gets hashed
  async function hashBlob(content) {
    const byteLen = new TextEncoder().encode(content).length;
    return sha1Hex('blob ' + byteLen + '\0' + content);
  }

  async function hashTree(entries) {
    const body = entries.map((e) => e.name + ' ' + e.hash).join('\n');
    return sha1Hex('tree ' + body.length + '\0' + body);
  }

  async function hashCommit(treeHash, parentHash, message, sequence) {
    const body =
      'tree ' +
      treeHash +
      (parentHash ? '\nparent ' + parentHash : '') +
      '\nauthor Demo <demo@js-tools.org> ' +
      sequence +
      '\n\n' +
      message;
    return sha1Hex('commit ' + body.length + '\0' + body);
  }

  function getFiles() {
    return { 'README.md': file1Input.value, 'app.js': file2Input.value };
  }

  async function commitSnapshot() {
    const files = getFiles();
    const entries = [];
    const fileHashes = {};

    for (const name of FILE_NAMES) {
      const content = files[name];
      const hash = await hashBlob(content);
      fileHashes[name] = hash;
      if (objectStore.has(hash)) {
        log('Blob "' + name + '" không đổi → tái sử dụng ' + short(hash));
      } else {
        objectStore.set(hash, { type: 'blob', summary: name + ': "' + truncateText(content, 24) + '"' });
        log('Blob "' + name + '" thay đổi/mới → tạo object mới ' + short(hash));
      }
      entries.push({ name, hash });
    }

    const treeHash = await hashTree(entries);
    if (objectStore.has(treeHash)) {
      log('Tree gốc giống hệt 1 tree đã có (không blob nào đổi) → tái sử dụng ' + short(treeHash));
    } else {
      objectStore.set(treeHash, {
        type: 'tree',
        summary: entries.map((e) => e.name + ' → ' + short(e.hash)).join(', '),
      });
      log('Tree gốc → tạo object mới ' + short(treeHash) + ' (vì tập blob con thay đổi)');
    }

    const parentHash = commits.length ? commits[commits.length - 1].hash : null;
    seq++;
    const commitHash = await hashCommit(treeHash, parentHash, msgInput.value || 'Commit không tiêu đề', seq);
    objectStore.set(commitHash, { type: 'commit', summary: msgInput.value || 'Commit không tiêu đề' });
    log(
      'Commit mới ' +
        short(commitHash) +
        ' → trỏ tree ' +
        short(treeHash) +
        (parentHash ? ' và cha ' + short(parentHash) : ' (commit đầu tiên, không cha)')
    );

    commits.push({ hash: commitHash, treeHash, parentHash, message: msgInput.value, fileHashes });
    selectedIndex = commits.length - 1;
  }

  function isBlobReused(commitIndex, filename, hash) {
    if (commitIndex <= 0) return false;
    return commits[commitIndex - 1].fileHashes[filename] === hash;
  }

  function updateStats() {
    statCommits.textContent = String(commits.length);
    statObjects.textContent = String(objectStore.size);
  }

  function renderObjectStoreTable() {
    let html = '<tr><th>Loại</th><th>Hash</th><th>Nội dung</th></tr>';
    // newest first
    const rows = [...objectStore.entries()].reverse();
    rows.forEach(([hash, obj]) => {
      html +=
        '<tr><td><span class="obj-badge obj-badge--' +
        obj.type +
        '">' +
        obj.type +
        '</span></td><td>' +
        short(hash) +
        '</td><td>' +
        escapeHtml(obj.summary) +
        '</td></tr>';
    });
    storeTableEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    if (!commits.length) return;

    // Commit chain row
    const chainY = 30;
    const n = commits.length;
    const spacing = Math.min(90, (CSS_W - 40) / n);
    const boxW = Math.min(70, spacing - 14);
    const boxH = 34;

    commits.forEach((c, i) => {
      const x = 20 + i * spacing;
      if (i > 0) {
        ctx.strokeStyle = '#45475a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(20 + (i - 1) * spacing + boxW, chainY + boxH / 2);
        ctx.lineTo(x, chainY + boxH / 2);
        ctx.stroke();
      }
      ctx.fillStyle = i === selectedIndex ? '#64748b' : '#313244';
      ctx.fillRect(x, chainY, boxW, boxH);
      ctx.strokeStyle = '#1e1e2e';
      ctx.strokeRect(x, chainY, boxW, boxH);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C' + (i + 1), x + boxW / 2, chainY + 12);
      ctx.font = '9px monospace';
      ctx.fillText(short(c.hash), x + boxW / 2, chainY + 24);
      ctx.textBaseline = 'alphabetic';
    });

    if (selectedIndex < 0) return;
    const selected = commits[selectedIndex];

    // Tree node
    const treeY = 105;
    const treeX = CSS_W / 2;
    ctx.beginPath();
    ctx.arc(treeX, treeY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#1e1e2e';
    ctx.stroke();
    ctx.fillStyle = '#1e1e2e';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('tree', treeX, treeY - 4);
    ctx.font = '8px monospace';
    ctx.fillText(short(selected.treeHash), treeX, treeY + 8);
    ctx.textBaseline = 'alphabetic';

    // Blob nodes
    const blobY = 185;
    const blobSpacing = CSS_W / (FILE_NAMES.length + 1);
    FILE_NAMES.forEach((name, i) => {
      const x = blobSpacing * (i + 1);
      const hash = selected.fileHashes[name];
      const reused = isBlobReused(selectedIndex, name, hash);

      ctx.strokeStyle = '#45475a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(treeX, treeY + 20);
      ctx.lineTo(x, blobY - 16);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, blobY, 18, 0, Math.PI * 2);
      ctx.fillStyle = reused ? '#22c55e' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#1e1e2e';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, x, blobY - 4);
      ctx.font = '8px monospace';
      ctx.fillText(short(hash), x, blobY + 8);
      ctx.textBaseline = 'alphabetic';
    });

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🟦 blob mới   🟩 blob tái sử dụng từ commit cha   🟧 tree', 10, CSS_H - 8);
  }

  function updateJsCodeDisplay() {
    const n = commits.length;
    const code =
      '/* 🗂️ BÀI 1: GIT OBJECT MODEL */\n\n' +
      "async function hashBlob(content) {\n  const header = 'blob ' + byteLength(content) + '\\0';\n" +
      '  return sha1(header + content); // content-addressable\n}\n\n' +
      'async function commitSnapshot(files, message, parentHash) {\n' +
      '  const entries = await Promise.all(files.map(hashEachFile));\n' +
      '  const treeHash = await hashTree(entries); // đổi nếu BẤT KỲ blob con nào đổi\n' +
      '  return hashCommit(treeHash, parentHash, message);\n}\n\n' +
      '// Trạng thái hiện tại: ' +
      n +
      ' commit, ' +
      objectStore.size +
      ' object trong .git/objects';

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function refreshAll() {
    draw();
    updateStats();
    renderObjectStoreTable();
    updateJsCodeDisplay();
  }

  canvas.addEventListener('click', (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    if (y < 30 || y > 64 || !commits.length) return;
    const n = commits.length;
    const spacing = Math.min(90, (CSS_W - 40) / n);
    const boxW = Math.min(70, spacing - 14);
    const i = Math.floor((x - 20) / spacing);
    if (i < 0 || i >= n) return;
    const boxStart = 20 + i * spacing;
    if (x < boxStart || x > boxStart + boxW) return;
    selectedIndex = i;
    draw();
  });

  commitBtn.addEventListener('click', async () => {
    clearLog();
    commitBtn.disabled = true;
    try {
      await commitSnapshot();
      refreshAll();
    } finally {
      commitBtn.disabled = false;
    }
  });

  resetBtn.addEventListener('click', async () => {
    objectStore = new Map();
    commits = [];
    seq = 0;
    selectedIndex = -1;
    file1Input.value = 'Xin chào Git!';
    file2Input.value = 'console.log("hello");';
    msgInput.value = 'Initial commit';
    clearLog();
    log('Đã reset. Working directory về trạng thái ban đầu.');
    await commitSnapshot();
    log('Đã tạo commit đầu tiên tự động để bắt đầu.');
    refreshAll();
  });

  (async function init() {
    log('Đang tạo commit đầu tiên (SHA-1 thật qua Web Crypto API)...');
    await commitSnapshot();
    refreshAll();
  })();
})();
