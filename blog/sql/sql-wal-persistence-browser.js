/* Bài 16: WAL & Persistence Trong Browser — SQL Workbench (sql.js) */
(function () {
  const editor = document.getElementById('sql-editor');
  if (!editor) return;

  const runBtn = document.getElementById('sql-run-btn');
  const resetBtn = document.getElementById('sql-reset-btn');
  const schemaToggle = document.getElementById('sql-schema-toggle');
  const schemaPanel = document.getElementById('sql-schema-panel');
  const resultsEl = document.getElementById('sql-results');
  const statusEl = document.getElementById('sql-status-line');
  const examplesEl = document.getElementById('sql-examples');

  const SETUP_LOG_TABLE = `CREATE TABLE IF NOT EXISTS techmart_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT,
  created_at TEXT
);`;

  const CHECK_JOURNAL_MODE = `-- Kiểm tra chế độ lưu nhật ký giao dịch hiện tại
PRAGMA journal_mode;`;

  const SET_WAL_MODE = `-- Kích hoạt chế độ Write-Ahead Log (WAL)
PRAGMA journal_mode = WAL;`;

  const INSERT_LOGS_ACCUMULATE = `INSERT INTO techmart_logs (message, created_at) VALUES 
  ('User login: admin', datetime('now')),
  ('Product update: Wireless Mouse X1', datetime('now')),
  ('Order checkout: #1024', datetime('now'));

-- Kiểm chứng dữ liệu đã được ghi nhận
SELECT * FROM techmart_logs;`;

  const CHECKPOINT_PASSIVE = `-- Thực hiện Checkpoint thụ động (không chặn các đọc ghi khác)
PRAGMA wal_checkpoint(PASSIVE);`;

  const CHECKPOINT_TRUNCATE = `-- Đồng bộ triệt để, thu gọn file WAL về kích thước 0
PRAGMA wal_checkpoint(TRUNCATE);`;

  const EXAMPLES = [
    { label: '1️⃣ Tạo bảng techmart_logs', sql: SETUP_LOG_TABLE },
    { label: '2️⃣ Kiểm tra chế độ journal_mode', sql: CHECK_JOURNAL_MODE },
    { label: '3️⃣ Thiết lập journal_mode = WAL', sql: SET_WAL_MODE },
    { label: '4️⃣ Ghi log tích tụ trong file WAL', sql: INSERT_LOGS_ACCUMULATE },
    { label: '5️⃣ Chạy checkpoint thụ động (PASSIVE)', sql: CHECKPOINT_PASSIVE },
    { label: '6️⃣ Chạy checkpoint triệt để (TRUNCATE)', sql: CHECKPOINT_TRUNCATE },
  ];

  let db = null;

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  function renderResults(execResult, elapsedMs) {
    resultsEl.innerHTML = '';
    if (!execResult || !execResult.length) {
      const empty = document.createElement('div');
      empty.className = 'sql-results-empty';
      empty.textContent =
        '(không có bảng kết quả — lệnh đã chạy thành công nhưng không phải SELECT, hoặc trả về 0 dòng)';
      resultsEl.appendChild(empty);
      setStatus('Thực thi xong trong ' + elapsedMs.toFixed(2) + 'ms — không có dòng nào.', false);
      return;
    }
    const { columns, values } = execResult[execResult.length - 1];
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach((col) => {
      const th = document.createElement('th');
      th.textContent = col;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    values.slice(0, 50).forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        if (cell === null) {
          td.textContent = 'NULL';
          td.className = 'is-null';
        } else {
          td.textContent = String(cell);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultsEl.appendChild(table);
    const truncatedNote = values.length > 50 ? ' (chỉ hiện 50/' + values.length + ' hàng đầu)' : '';
    setStatus(
      'Thực thi xong trong ' + elapsedMs.toFixed(2) + 'ms — ' + values.length + ' dòng' + truncatedNote + '.',
      false
    );
  }

  function renderSchema() {
    if (!db) return;
    const schemaContentEl = document.getElementById('sql-schema-content');
    if (!schemaContentEl) return;

    schemaContentEl.innerHTML = '';
    try {
      const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      if (!tablesResult || !tablesResult.length) {
        schemaContentEl.innerHTML = '<p style="color: #6c7086;">Chưa có bảng nào được tạo.</p>';
        return;
      }

      const tableNames = tablesResult[0].values.map((v) => v[0]);
      tableNames.forEach((tbl) => {
        const title = document.createElement('h4');
        title.textContent = tbl;
        schemaContentEl.appendChild(title);

        const info = db.exec(`PRAGMA table_info(${tbl});`);
        if (info && info.length) {
          const { columns, values } = info[0];
          const table = document.createElement('table');
          const thead = document.createElement('thead');
          const trHead = document.createElement('tr');
          ['Tên cột', 'Kiểu dữ liệu', 'Ràng buộc'].forEach((txt) => {
            const th = document.createElement('th');
            th.textContent = txt;
            trHead.appendChild(th);
          });
          thead.appendChild(trHead);
          table.appendChild(thead);

          const tbody = document.createElement('tbody');
          values.forEach((colRow) => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            nameTd.textContent = colRow[1];
            tr.appendChild(nameTd);

            const typeTd = document.createElement('td');
            typeTd.textContent = colRow[2] || 'ANY';
            tr.appendChild(typeTd);

            const constTd = document.createElement('td');
            const constraints = [];
            if (colRow[5] > 0) constraints.push('PRIMARY KEY');
            if (colRow[3] > 0) constraints.push('NOT NULL');
            constTd.textContent = constraints.join(', ') || '—';
            tr.appendChild(constTd);

            tbody.appendChild(tr);
          });
          table.appendChild(tbody);
          schemaContentEl.appendChild(table);
        }
      });
    } catch (err) {
      schemaContentEl.innerHTML = '<p style="color: #f38ba8;">Lỗi tải schema: ' + err.message + '</p>';
    }
  }

  function runQuery(sql) {
    if (!db) {
      setStatus('Engine chưa sẵn sàng, vui lòng đợi vài giây rồi thử lại.', true);
      return;
    }
    const trimmed = sql.trim();
    if (!trimmed) return;

    schemaPanel.classList.remove('is-visible');
    const start = performance.now();
    let result;
    try {
      result = db.exec(trimmed);
    } catch (err) {
      resultsEl.innerHTML = '';
      const empty = document.createElement('div');
      empty.className = 'sql-results-empty';
      let message = 'Lỗi cú pháp SQL: ' + err.message;
      const missingTable = /no such table|no such column/i.test(err.message);
      if (missingTable) {
        message += ' — Bảng chưa tồn tại. Hãy chạy bước 1️⃣ trước.';
      }
      empty.textContent = message;
      resultsEl.appendChild(empty);
      setStatus(missingTable ? 'Thiếu bảng khởi tạo.' : 'Lỗi thực thi SQL.', true);
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const elapsed = performance.now() - start;
    renderResults(result, elapsed);
    renderSchema();
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function buildExampleButtons() {
    examplesEl.innerHTML = '';
    EXAMPLES.forEach((ex) => {
      const btn = document.createElement('button');
      btn.className = 'sql-example-btn';
      btn.textContent = ex.label;
      btn.addEventListener('click', () => {
        editor.value = ex.sql;
        editor.focus();
      });
      examplesEl.appendChild(btn);
    });
  }

  async function init() {
    buildExampleButtons();
    setStatus('Đang tải SQLite-WASM engine...', false);
    try {
      const SQL = await initSqlJs({ locateFile: (file) => 'vendor/' + file });
      const seedResponse = await fetch('sql-techmart-seed.sql');
      const seedSql = await seedResponse.text();
      db = new SQL.Database();
      db.run(seedSql);
      editor.value = EXAMPLES[0].sql;
      renderSchema();
      setStatus('Sẵn sàng — dataset TechMart đã nạp. Bấm lần lượt 1️⃣ → 6️⃣ để đi hết bài.', false);
    } catch (err) {
      setStatus('Không tải được engine: ' + err.message, true);
    }
  }

  runBtn.addEventListener('click', () => runQuery(editor.value));
  editor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery(editor.value);
    }
  });
  schemaToggle.addEventListener('click', () => {
    schemaPanel.classList.toggle('is-visible');
    if (schemaPanel.classList.contains('is-visible')) {
      renderSchema();
    }
  });
  resetBtn.addEventListener('click', () => {
    if (!db) return;
    db.close();
    initSqlJs({ locateFile: (file) => 'vendor/' + file }).then(async (SQL) => {
      const seedSql = await (await fetch('sql-techmart-seed.sql')).text();
      db = new SQL.Database();
      db.run(seedSql);
      resultsEl.innerHTML = '<div class="sql-results-empty">Đã reset — dataset TechMart nạp lại từ đầu.</div>';
      renderSchema();
      setStatus('Đã reset dữ liệu về trạng thái ban đầu (chỉ có TechMart).', false);
    });
  });

  init();
})();
