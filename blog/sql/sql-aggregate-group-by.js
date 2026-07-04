/* Bài 4: Aggregate & GROUP BY — SQL Workbench thật (sql.js) + biểu đồ cột tự động từ kết quả 2 cột trên dataset TechMart */
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
  const chartEl = document.getElementById('sql-chart');
  const chartBarsEl = document.getElementById('sql-chart-bars');

  const EXAMPLES = [
    {
      label: 'Doanh thu theo danh mục',
      sql: 'SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue\nFROM order_items oi\nINNER JOIN products p ON oi.product_id = p.product_id\nGROUP BY p.category\nORDER BY revenue DESC;',
    },
    {
      label: '3 cách viết COUNT',
      sql: 'SELECT\n  COUNT(*) AS total_orders,\n  COUNT(customer_id) AS with_customer,\n  COUNT(DISTINCT customer_id) AS unique_customers\nFROM orders;',
    },
    {
      label: 'AVG toàn bộ vs chỉ delivered',
      sql: "SELECT AVG(total_amount) AS avg_delivered_value\nFROM orders\nWHERE status = 'delivered';",
    },
    {
      label: 'Đếm khách đang hoạt động',
      sql: 'SELECT\n  COUNT(*) AS total_customers,\n  SUM(is_active) AS active_customers\nFROM customers;',
    },
    {
      label: 'Số đơn & doanh thu theo trạng thái',
      sql: 'SELECT status, COUNT(*) AS num_orders, SUM(total_amount) AS total_revenue\nFROM orders\nGROUP BY status\nORDER BY num_orders DESC;',
    },
    {
      label: 'GROUP BY nhiều cột: quốc gia × trạng thái',
      sql: 'SELECT c.country, o.status, COUNT(*) AS cnt\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.customer_id\nGROUP BY c.country, o.status\nORDER BY c.country, o.status;',
    },
    {
      label: 'Cạm bẫy: cột không nhóm không tổng hợp',
      sql: 'SELECT category, product_name, COUNT(*) AS num_products\nFROM products\nGROUP BY category;',
    },
    {
      label: 'HAVING: danh mục doanh thu > 300',
      sql: 'SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue\nFROM order_items oi\nINNER JOIN products p ON oi.product_id = p.product_id\nGROUP BY p.category\nHAVING revenue > 300\nORDER BY revenue DESC;',
    },
    {
      label: 'HAVING: danh mục ≥ 5 khách khác nhau',
      sql: 'SELECT p.category, COUNT(DISTINCT o.customer_id) AS num_customers\nFROM order_items oi\nINNER JOIN products p ON oi.product_id = p.product_id\nINNER JOIN orders o ON oi.order_id = o.order_id\nGROUP BY p.category\nHAVING num_customers >= 5\nORDER BY num_customers DESC;',
    },
    {
      label: 'WHERE + HAVING kết hợp',
      sql: "SELECT customer_id, SUM(total_amount) AS total_spent\nFROM orders\nWHERE status = 'delivered'\nGROUP BY customer_id\nHAVING total_spent > 200\nORDER BY total_spent DESC;",
    },
  ];

  let db = null;
  let seedSql = '';

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  function renderChart(columns, values) {
    chartBarsEl.innerHTML = '';
    const isChartable = columns.length === 2 && values.length > 0 && values.every((row) => typeof row[1] === 'number');
    if (!isChartable) {
      chartEl.classList.add('hidden');
      return;
    }
    chartEl.classList.remove('hidden');
    const maxVal = Math.max(...values.map((row) => row[1]), 0);
    values.forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'chart-bar-row';

      const labelEl = document.createElement('div');
      labelEl.className = 'chart-bar-label';
      labelEl.textContent = String(label);

      const track = document.createElement('div');
      track.className = 'chart-bar-track';
      const fill = document.createElement('div');
      fill.className = 'chart-bar-fill';
      fill.style.width = (maxVal > 0 ? (value / maxVal) * 100 : 0) + '%';
      track.appendChild(fill);

      const valueEl = document.createElement('div');
      valueEl.className = 'chart-bar-value';
      valueEl.textContent = Number.isInteger(value) ? String(value) : value.toFixed(2);

      row.appendChild(labelEl);
      row.appendChild(track);
      row.appendChild(valueEl);
      chartBarsEl.appendChild(row);
    });
  }

  function renderResults(execResult, elapsedMs) {
    resultsEl.innerHTML = '';
    if (!execResult || !execResult.length) {
      const empty = document.createElement('div');
      empty.className = 'sql-results-empty';
      empty.textContent =
        '(không có bảng kết quả — lệnh đã chạy thành công nhưng không phải SELECT, hoặc trả về 0 dòng)';
      resultsEl.appendChild(empty);
      chartEl.classList.add('hidden');
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
    renderChart(columns, values);
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
    // (xem ghi chú tương tự ở Bài 1/3).
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
      chartEl.classList.add('hidden');
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
      chartEl.classList.add('hidden');
      setStatus('Đã reset dữ liệu về trạng thái ban đầu.', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 4: AGGREGATE & GROUP BY */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n' +
      'db.run(seedSql); // tạo bảng + nạp dữ liệu TechMart\n\n' +
      '// Hàm tổng hợp bỏ qua NULL (trừ COUNT(*)):\n' +
      'db.exec("SELECT COUNT(*), COUNT(customer_id) FROM orders"); // 28, 24\n\n' +
      '// GROUP BY tạo 1 hàng/nhóm, HAVING lọc SAU khi tổng hợp:\n' +
      'db.exec("... GROUP BY category HAVING SUM(revenue) > 300");\n\n' +
      '// Kết quả đúng 2 cột (nhãn + số) sẽ tự vẽ thêm biểu đồ cột:\n' +
      'if (columns.length === 2 && values.every(r => typeof r[1] === "number")) {\n' +
      '  renderChart(columns, values);\n' +
      '}';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
