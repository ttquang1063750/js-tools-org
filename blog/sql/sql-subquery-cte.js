/* Bài 5: Subquery & CTE — SQL Workbench thật chạy SQLite-WASM (sql.js) trên dataset TechMart */
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

  const CATEGORY_TREE_SETUP =
    "CREATE TABLE category_tree (\n  category_id INTEGER PRIMARY KEY,\n  category_name TEXT NOT NULL,\n  parent_id INTEGER\n);\nINSERT INTO category_tree VALUES\n  (1, 'Electronics', NULL), (2, 'Computers', 1), (3, 'Laptops', 2),\n  (4, 'Desktops', 2), (5, 'Audio', 1), (6, 'Headphones', 5),\n  (7, 'Office', NULL), (8, 'Furniture', 7), (9, 'Chairs', 8);";

  const EXAMPLES = [
    {
      label: 'Scalar: đơn trên trung bình',
      sql: 'SELECT order_id, total_amount\nFROM orders\nWHERE total_amount > (SELECT AVG(total_amount) FROM orders)\nORDER BY total_amount DESC;',
    },
    {
      label: 'Scalar trong SELECT: % tổng doanh thu',
      sql: 'SELECT order_id, total_amount,\n       ROUND(total_amount * 100.0 / (SELECT SUM(total_amount) FROM orders), 2) AS pct_of_total\nFROM orders\nORDER BY total_amount DESC\nLIMIT 5;',
    },
    {
      label: 'IN: khách đã mua Electronics',
      sql: "SELECT DISTINCT full_name\nFROM customers\nWHERE customer_id IN (\n  SELECT o.customer_id\n  FROM orders o\n  INNER JOIN order_items oi ON o.order_id = oi.order_id\n  INNER JOIN products p ON oi.product_id = p.product_id\n  WHERE p.category = 'Electronics'\n);",
    },
    {
      label: 'Cạm bẫy: NOT IN (chèn khách test để thấy bug)',
      sql: "INSERT INTO customers (customer_id, full_name, email, country, signup_date, is_active)\nVALUES (99, 'Khách Test Chưa Mua', 'test@example.com', 'Vietnam', '2026-04-01', 1);\n\nSELECT full_name FROM customers c\nWHERE c.customer_id NOT IN (SELECT customer_id FROM orders);",
    },
    {
      label: 'Sửa đúng: NOT EXISTS (chạy sau ví dụ trên)',
      sql: 'SELECT full_name FROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);',
    },
    {
      label: 'Tương quan: đơn gần nhất mỗi khách',
      sql: 'SELECT c.full_name,\n       (SELECT MAX(o.order_date) FROM orders o WHERE o.customer_id = c.customer_id) AS last_order_date\nFROM customers c\nORDER BY last_order_date DESC;',
    },
    {
      label: 'CTE: % doanh thu sản phẩm trong danh mục',
      sql: 'WITH product_revenue AS (\n  SELECT product_id, SUM(quantity * unit_price) AS revenue\n  FROM order_items\n  GROUP BY product_id\n),\ncategory_revenue AS (\n  SELECT p.category, SUM(pr.revenue) AS total_revenue\n  FROM product_revenue pr\n  INNER JOIN products p ON pr.product_id = p.product_id\n  GROUP BY p.category\n)\nSELECT p.product_name, p.category, pr.revenue,\n       ROUND(pr.revenue * 100.0 / cr.total_revenue, 2) AS pct_of_category\nFROM product_revenue pr\nINNER JOIN products p ON pr.product_id = p.product_id\nINNER JOIN category_revenue cr ON p.category = cr.category\nORDER BY p.category, pct_of_category DESC;',
    },
    {
      label: 'Đệ quy 1/2: Tạo bảng category_tree',
      sql: CATEGORY_TREE_SETUP,
    },
    {
      label: 'Đệ quy 2/2: Duyệt cây danh mục',
      sql: "WITH RECURSIVE category_path(category_id, category_name, depth, path) AS (\n  SELECT category_id, category_name, 0, category_name\n  FROM category_tree\n  WHERE parent_id IS NULL\n\n  UNION ALL\n\n  SELECT ct.category_id, ct.category_name, cp.depth + 1, cp.path || ' > ' || ct.category_name\n  FROM category_tree ct\n  INNER JOIN category_path cp ON ct.parent_id = cp.category_id\n)\nSELECT category_id, category_name, depth, path\nFROM category_path\nORDER BY path;",
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
    // (xem ghi chú tương tự ở Bài 1/3/4).
    schemaPanel.classList.remove('is-visible');
    const start = performance.now();
    let result;
    try {
      // db.exec() hỗ trợ nhiều câu lệnh phân tách bằng ';' trong 1 lần gọi —
      // cần thiết cho ví dụ "CREATE TABLE + INSERT" và "INSERT rồi SELECT" ở trên.
      // Chỉ hiển thị kết quả của câu lệnh SELECT cuối cùng (nếu có).
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
      editor.value = EXAMPLES[0].sql;
      setStatus('Sẵn sàng — dataset TechMart đã nạp (customers, products, orders, order_items).', false);
      runQuery(EXAMPLES[0].sql);
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
      setStatus('Đã reset dữ liệu về trạng thái ban đầu (kể cả category_tree nếu đã tạo).', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 5: SUBQUERY & CTE */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n' +
      'db.run(seedSql);\n\n' +
      '// Subquery vô hướng — chạy 1 lần, dùng lại cho mọi hàng:\n' +
      'db.exec("... WHERE total_amount > (SELECT AVG(total_amount) FROM orders)");\n\n' +
      '// Subquery tương quan — chạy lại cho TỪNG hàng ngoài:\n' +
      'db.exec("SELECT c.*, (SELECT MAX(order_date) FROM orders WHERE customer_id = c.customer_id) FROM customers c");\n\n' +
      '// CTE đệ quy — duyệt cây phân cấp không giới hạn độ sâu:\n' +
      'db.exec("WITH RECURSIVE path(id, depth) AS (SELECT id, 0 FROM t WHERE parent_id IS NULL UNION ALL SELECT t.id, p.depth+1 FROM t JOIN path p ON t.parent_id = p.id) SELECT * FROM path");';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
