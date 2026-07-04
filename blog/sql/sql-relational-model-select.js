/* Bài 1: Mô Hình Quan Hệ & SELECT — SQL Workbench thật chạy SQLite-WASM (sql.js) trên dataset TechMart */
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
  const seedDisplay = document.getElementById('sql-seed-display');
  const jsCodeDisplay = document.getElementById('sql-js-code-display');

  const EXAMPLES = [
    { label: 'Xem toàn bộ sản phẩm', sql: 'SELECT * FROM products;' },
    {
      label: 'Đơn đã giao > 200',
      sql: "SELECT order_id, order_date, total_amount\nFROM orders\nWHERE status = 'delivered' AND total_amount > 200;",
    },
    {
      label: 'Sản phẩm Electronics/Office',
      sql: "SELECT product_name, category, stock_quantity\nFROM products\nWHERE category IN ('Electronics', 'Office');",
    },
    {
      label: 'Khách dùng Gmail',
      sql: "SELECT full_name, email\nFROM customers\nWHERE email LIKE '%@gmail.com';",
    },
    {
      label: 'Đơn khách vãng lai',
      sql: 'SELECT order_id, order_date, total_amount\nFROM orders\nWHERE customer_id IS NULL;',
    },
    {
      label: 'Đơn hàng quý 1/2026',
      sql: "SELECT order_id, order_date, total_amount\nFROM orders\nWHERE order_date BETWEEN '2026-01-01' AND '2026-03-31'\nORDER BY order_date;",
    },
    {
      label: 'Top 5 đơn giá trị nhất',
      sql: 'SELECT order_id, total_amount\nFROM orders\nORDER BY total_amount DESC\nLIMIT 5;',
    },
    {
      label: 'Phân trang sản phẩm (trang 2)',
      sql: 'SELECT product_id, product_name\nFROM products\nORDER BY product_id\nLIMIT 5 OFFSET 5;',
    },
    {
      label: 'Kiểm tra type affinity',
      sql: 'SELECT product_id, typeof(product_id), unit_price, typeof(unit_price)\nFROM products\nLIMIT 3;',
    },
  ];

  let db = null;
  let seedSql = '';

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
      setStatus('Thực thi xong trong ' + elapsedMs.toFixed(1) + 'ms — không có dòng nào.', false);
      return;
    }
    const { columns, values } = execResult[0];
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
    values.forEach((row) => {
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
    setStatus('Thực thi xong trong ' + elapsedMs.toFixed(1) + 'ms — ' + values.length + ' dòng.', false);
  }

  function runQuery(sql) {
    if (!db) {
      setStatus('Engine chưa sẵn sàng, vui lòng đợi vài giây rồi thử lại.', true);
      return;
    }
    const trimmed = sql.trim();
    if (!trimmed) return;
    const start = performance.now();
    let result;
    try {
      result = db.exec(trimmed);
    } catch (err) {
      resultsEl.innerHTML = '';
      const empty = document.createElement('div');
      empty.className = 'sql-results-empty';
      empty.textContent = 'Lỗi SQL: ' + err.message;
      resultsEl.appendChild(empty);
      setStatus('Lỗi khi thực thi.', true);
      return;
    }
    const elapsed = performance.now() - start;
    renderResults(result, elapsed);
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
      seedSql = await seedResponse.text();
      if (seedDisplay) {
        seedDisplay.textContent = seedSql;
        if (window.Prism) window.Prism.highlightElement(seedDisplay);
      }
      db = new SQL.Database();
      db.run(seedSql);
      editor.value = EXAMPLES[0].sql;
      setStatus('Sẵn sàng — dataset TechMart đã nạp (customers, products, orders, order_items).', false);
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
  });
  resetBtn.addEventListener('click', () => {
    if (!db || !seedSql) return;
    db.close();
    initSqlJs({ locateFile: (file) => 'vendor/' + file }).then((SQL) => {
      db = new SQL.Database();
      db.run(seedSql);
      resultsEl.innerHTML = '<div class="sql-results-empty">Kết quả sẽ hiện ở đây sau khi chạy query...</div>';
      setStatus('Đã reset dữ liệu về trạng thái ban đầu.', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 1: MÔ HÌNH QUAN HỆ & SELECT */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      "const seedSql = await (await fetch('sql-techmart-seed.sql')).text();\n" +
      'const db = new SQL.Database();\n' +
      'db.run(seedSql); // tạo bảng + nạp dữ liệu TechMart\n\n' +
      'const result = db.exec(userQuery); // [{ columns, values }]\n' +
      '// columns: tên cột theo đúng thứ tự SELECT\n' +
      '// values:  mảng các hàng, mỗi hàng là mảng giá trị (null = NULL)';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
