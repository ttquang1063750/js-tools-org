/* Bài 7: Window Functions — SQL Workbench thật chạy SQLite-WASM (sql.js) trên dataset TechMart */
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
    {
      label: 'RANK khách theo chi tiêu trong từng quốc gia',
      sql: 'WITH customer_spend AS (\n  SELECT c.customer_id, c.full_name, c.country, COALESCE(SUM(o.total_amount), 0) AS total_spent\n  FROM customers c\n  LEFT JOIN orders o ON c.customer_id = o.customer_id\n  GROUP BY c.customer_id, c.full_name, c.country\n)\nSELECT full_name, country, total_spent,\n       RANK() OVER (PARTITION BY country ORDER BY total_spent DESC) AS rank_in_country\nFROM customer_spend\nORDER BY country, rank_in_country;',
    },
    {
      label: 'RANK sản phẩm theo doanh thu trong từng danh mục',
      sql: 'WITH product_rev AS (\n  SELECT p.product_id, p.product_name, p.category, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  INNER JOIN products p ON oi.product_id = p.product_id\n  GROUP BY p.product_id, p.product_name, p.category\n)\nSELECT product_name, category, revenue,\n       RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_in_category\nFROM product_rev\nORDER BY category, rank_in_category;',
    },
    {
      label: 'ROW_NUMBER vs RANK vs DENSE_RANK (có đồng hạng)',
      sql: 'SELECT order_id, total_amount,\n       ROW_NUMBER() OVER (ORDER BY total_amount DESC) AS rn,\n       RANK()       OVER (ORDER BY total_amount DESC) AS rnk,\n       DENSE_RANK() OVER (ORDER BY total_amount DESC) AS drnk\nFROM orders\nORDER BY total_amount DESC\nLIMIT 8;',
    },
    {
      label: 'LAG: khoảng cách giữa 2 đơn liên tiếp mỗi khách',
      sql: 'SELECT customer_id, order_id, order_date,\n       LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order_date,\n       julianday(order_date) - julianday(\n         LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)\n       ) AS days_since_prev\nFROM orders\nWHERE customer_id IS NOT NULL\nORDER BY customer_id, order_date;',
    },
    {
      label: 'LEAD: ngày đơn tiếp theo mỗi khách',
      sql: 'SELECT customer_id, order_id, order_date,\n       LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS next_order_date\nFROM orders\nWHERE customer_id IS NOT NULL\nORDER BY customer_id, order_date;',
    },
    {
      label: 'Running total doanh thu theo ngày',
      sql: 'SELECT order_id, order_date, total_amount,\n       SUM(total_amount) OVER (\n         ORDER BY order_date, order_id\n         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ) AS running_total\nFROM orders\nORDER BY order_date, order_id;',
    },
    {
      label: 'Moving average 3 đơn gần nhất',
      sql: 'SELECT order_id, order_date, total_amount,\n       ROUND(AVG(total_amount) OVER (\n         ORDER BY order_date, order_id\n         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n       ), 2) AS moving_avg_3\nFROM orders\nORDER BY order_date, order_id;',
    },
    {
      label: 'Lọc window function: bọc trong CTE rồi WHERE',
      sql: 'WITH ranked AS (\n  SELECT full_name, country, total_amount,\n         RANK() OVER (PARTITION BY country ORDER BY total_amount DESC) AS rnk\n  FROM orders o\n  INNER JOIN customers c ON o.customer_id = c.customer_id\n)\nSELECT * FROM ranked WHERE rnk <= 2;',
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
    // Đóng panel cấu trúc bảng lại — tránh đẩy bảng kết quả khuất tầm nhìn
    // (xem ghi chú tương tự ở Bài 1/3/4/5).
    schemaPanel.classList.remove('is-visible');
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
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const elapsed = performance.now() - start;
    renderResults(result, elapsed);
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
      seedSql = await seedResponse.text();
      if (seedDisplay) {
        seedDisplay.textContent = seedSql;
        if (window.Prism) window.Prism.highlightElement(seedDisplay);
      }
      db = new SQL.Database();
      db.run(seedSql);
      editor.value = EXAMPLES[2].sql;
      setStatus('Sẵn sàng — dataset TechMart đã nạp (customers, products, orders, order_items).', false);
      runQuery(EXAMPLES[2].sql);
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
      '/* 🗄️ BÀI 7: WINDOW FUNCTIONS */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n' +
      'db.run(seedSql);\n\n' +
      '// Giữ nguyên số hàng gốc — khác GROUP BY:\n' +
      'db.exec("SELECT *, RANK() OVER (PARTITION BY country ORDER BY total_spent DESC) FROM customer_spend");\n\n' +
      '// LAG/LEAD — truy cập hàng trước/sau trong cùng partition:\n' +
      'db.exec("SELECT *, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) FROM orders");\n\n' +
      '// Running total qua ROWS BETWEEN:\n' +
      'db.exec("SELECT *, SUM(total_amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders");';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
