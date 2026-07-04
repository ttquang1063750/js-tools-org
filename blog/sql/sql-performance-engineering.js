/* Bài 15: Performance Engineering — SQL Workbench (sql.js) */
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

  const SETUP_BENCH_TABLE = `CREATE TABLE temp_bench (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  val TEXT
);`;

  const CHECK_PRAGMAS = `-- Kiểm tra cấu hình PRAGMA hiện tại
PRAGMA journal_mode;
PRAGMA synchronous;
PRAGMA cache_size;`;

  const OPTIMIZE_PRAGMAS = `-- Cấu hình tối ưu ghi hàng loạt
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -10000; -- ~10MB Page Cache`;

  const RUN_BENCHMARK_SQL = `-- Bấm nút "🚀 Chạy Thực Nghiệm Ghi 500 Dòng" bên dưới để kích hoạt benchmark tự động.
-- Tiến trình JS sẽ chạy 3 phương pháp chèn dữ liệu và lập bảng so sánh thời gian thực.
-- Hãy đảm bảo bảng temp_bench đã được khởi tạo (Bước 1️⃣).`;

  const EXAMPLES = [
    { label: '1️⃣ Tạo bảng temp_bench', sql: SETUP_BENCH_TABLE },
    { label: '2️⃣ Kiểm tra các PRAGMA hiện tại', sql: CHECK_PRAGMAS },
    { label: '3️⃣ Tối ưu các biến PRAGMA', sql: OPTIMIZE_PRAGMAS },
    { label: '🚀 Chạy Thực Nghiệm Ghi 500 Dòng', sql: RUN_BENCHMARK_SQL, isBenchmark: true },
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

  function runBenchmark() {
    if (!db) {
      setStatus('Engine chưa sẵn sàng.', true);
      return;
    }
    // Check if table temp_bench exists, if not create it automatically
    try {
      db.exec('SELECT 1 FROM temp_bench LIMIT 1;');
    } catch (e) {
      try {
        db.run('CREATE TABLE temp_bench (id INTEGER PRIMARY KEY AUTOINCREMENT, val TEXT);');
        renderSchema();
      } catch (err) {
        resultsEl.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'sql-results-empty';
        empty.textContent = 'Lỗi không thể tự động tạo bảng benchmark: ' + err.message;
        resultsEl.appendChild(empty);
        setStatus('Lỗi tạo bảng benchmark.', true);
        return;
      }
    }

    setStatus('Đang chạy thực nghiệm benchmark...', false);
    resultsEl.innerHTML = '<div class="sql-results-empty">Đang chạy benchmark chèn 500 dòng... vui lòng đợi...</div>';

    setTimeout(() => {
      // Clean temp_bench first
      db.exec('DELETE FROM temp_bench;');

      // 1. Autocommit
      const startA = performance.now();
      for (let i = 0; i < 500; i++) {
        db.run("INSERT INTO temp_bench (val) VALUES ('bench_data');");
      }
      const elapsedA = performance.now() - startA;

      // Clean
      db.exec('DELETE FROM temp_bench;');

      // 2. Transaction
      const startB = performance.now();
      db.run('BEGIN TRANSACTION;');
      for (let i = 0; i < 500; i++) {
        db.run("INSERT INTO temp_bench (val) VALUES ('bench_data');");
      }
      db.run('COMMIT;');
      const elapsedB = performance.now() - startB;

      // Clean
      db.exec('DELETE FROM temp_bench;');

      // 3. Transaction + Prepared Statement
      const startC = performance.now();
      db.run('BEGIN TRANSACTION;');
      const stmt = db.prepare('INSERT INTO temp_bench (val) VALUES (?);');
      for (let i = 0; i < 500; i++) {
        stmt.run([`bench_data_${i}`]);
      }
      stmt.free();
      db.run('COMMIT;');
      const elapsedC = performance.now() - startC;

      // Render custom result table
      const columns = ['Phương pháp ghi (500 dòng)', 'Thời gian (ms)', 'Tốc độ (rows/sec)', 'Hiệu năng'];
      const values = [
        [
          '1. Từng dòng (Autocommit)',
          elapsedA.toFixed(2) + ' ms',
          (500000 / elapsedA).toFixed(0) + ' dòng/s',
          'Chậm nhất (Mặc định)',
        ],
        [
          '2. Gom nhóm (Transaction)',
          elapsedB.toFixed(2) + ' ms',
          (500000 / elapsedB).toFixed(0) + ' dòng/s',
          'Nhanh gấp ~' + (elapsedA / elapsedB).toFixed(1) + ' lần 🚀',
        ],
        [
          '3. Gom nhóm + Prepared Statement',
          elapsedC.toFixed(2) + ' ms',
          (500000 / elapsedC).toFixed(0) + ' dòng/s',
          'Tối ưu nhất (Nhanh gấp ~' + (elapsedA / elapsedC).toFixed(1) + ' lần) ⚡',
        ],
      ];

      renderResults([{ columns, values }], elapsedC);
      setStatus('Đã hoàn thành thực nghiệm đo lường hiệu năng ghi 500 dòng!', false);
    }, 100);
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

    // Check if it's the custom benchmark placeholder
    if (trimmed.includes(RUN_BENCHMARK_SQL.trim())) {
      runBenchmark();
      return;
    }

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
        message += ' — Bảng hoặc cột chưa được định nghĩa. Hãy chạy bước 1️⃣ trước.';
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
      if (ex.isBenchmark) {
        btn.style.backgroundColor = '#10b981';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#fff';
        btn.style.fontWeight = '600';
      }
      btn.addEventListener('click', () => {
        editor.value = ex.sql;
        editor.focus();
        if (ex.isBenchmark) {
          runBenchmark();
        }
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
      setStatus('Sẵn sàng — dataset TechMart đã nạp. Bấm lần lượt 1️⃣ → 🚀 để chạy benchmark.', false);
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
