/* Bài 3: JOIN Toàn Tập — SQL Workbench + Venn Diagram tương tác chạy SQLite-WASM (sql.js) trên dataset TechMart */
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

  const vennCaption = document.getElementById('venn-caption');
  const vennRegionA = document.getElementById('venn-region-a-only');
  const vennRegionB = document.getElementById('venn-region-b-only');
  const vennRegionI = document.getElementById('venn-region-intersection');
  const vennButtons = document.querySelectorAll('.venn-btn');

  const VENN_CONFIG = {
    inner: {
      aOpacity: 0.05,
      bOpacity: 0.05,
      iOpacity: 0.85,
      caption: '<strong>INNER JOIN:</strong> chỉ vùng giao nhau (tím) được giữ — đơn hàng có khách hàng khớp.',
      sql: 'SELECT o.order_id, c.full_name, o.order_date\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.customer_id\nORDER BY o.order_date;',
    },
    left: {
      aOpacity: 0.75,
      bOpacity: 0.05,
      iOpacity: 0.75,
      caption:
        '<strong>LEFT JOIN:</strong> toàn bộ vòng tròn trái (orders) được giữ, kể cả phần không giao — 4 đơn khách vãng lai vẫn xuất hiện với tên khách là NULL.',
      sql: 'SELECT o.order_id, c.full_name, o.order_date\nFROM orders o\nLEFT JOIN customers c ON o.customer_id = c.customer_id\nORDER BY o.order_date;',
    },
    right: {
      aOpacity: 0.05,
      bOpacity: 0.75,
      iOpacity: 0.75,
      caption:
        '<strong>RIGHT JOIN:</strong> toàn bộ vòng tròn phải (customers) được giữ. Với dataset này, mọi khách hàng đều có đơn hàng nên kết quả trùng với phần giao + phải.',
      sql: 'SELECT o.order_id, c.full_name, o.order_date\nFROM customers c\nRIGHT JOIN orders o ON c.customer_id = o.customer_id\nORDER BY o.order_date;',
    },
    full: {
      aOpacity: 0.75,
      bOpacity: 0.75,
      iOpacity: 0.75,
      caption:
        '<strong>FULL OUTER JOIN:</strong> toàn bộ cả 2 vòng tròn được giữ — không bỏ sót bất thường ở bất kỳ hướng nào.',
      sql: 'SELECT c.full_name, o.order_id, o.order_date\nFROM customers c\nFULL OUTER JOIN orders o ON c.customer_id = o.customer_id\nORDER BY c.customer_id;',
    },
    cross: {
      aOpacity: 0.35,
      bOpacity: 0.35,
      iOpacity: 0.35,
      caption:
        '<strong>CROSS JOIN:</strong> không dựa vào vùng giao — mọi hàng bên trái ghép với mọi hàng bên phải (M × N), Venn diagram không áp dụng đúng nghĩa ở đây.',
      sql: 'SELECT DISTINCT p.category, o.status\nFROM (SELECT DISTINCT category FROM products) p\nCROSS JOIN (SELECT DISTINCT status FROM orders) o\nORDER BY p.category, o.status;',
    },
  };

  const EXAMPLES = [
    {
      label: 'INNER: đơn hàng kèm tên khách',
      sql: 'SELECT o.order_id, c.full_name, o.order_date, o.total_amount\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.customer_id\nORDER BY o.order_date;',
    },
    {
      label: 'INNER 3 bảng: hoá đơn chi tiết',
      sql: 'SELECT o.order_id, p.product_name, oi.quantity, oi.unit_price,\n       oi.quantity * oi.unit_price AS line_total\nFROM orders o\nINNER JOIN order_items oi ON o.order_id = oi.order_id\nINNER JOIN products p ON oi.product_id = p.product_id\nWHERE o.order_id = 12\nORDER BY p.product_name;',
    },
    {
      label: 'INNER + GROUP BY: doanh thu theo danh mục',
      sql: 'SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue\nFROM order_items oi\nINNER JOIN products p ON oi.product_id = p.product_id\nGROUP BY p.category\nORDER BY revenue DESC;',
    },
    {
      label: 'LEFT: mọi khách kèm tổng chi tiêu',
      sql: 'SELECT c.full_name, COALESCE(SUM(o.total_amount), 0) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name\nORDER BY total_spent DESC;',
    },
    {
      label: 'LEFT: sản phẩm bán chạy vs ế',
      sql: 'SELECT p.product_name, p.category, COALESCE(SUM(oi.quantity), 0) AS units_sold\nFROM products p\nLEFT JOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.product_name, p.category\nORDER BY units_sold ASC;',
    },
    {
      label: 'CROSS: khung báo cáo category × status',
      sql: 'SELECT DISTINCT p.category, o.status\nFROM (SELECT DISTINCT category FROM products) p\nCROSS JOIN (SELECT DISTINCT status FROM orders) o\nORDER BY p.category, o.status;',
    },
    {
      label: 'CROSS: tai nạn quên ON (952 hàng)',
      sql: 'SELECT o.order_id, oi.product_id\nFROM orders o, order_items oi;',
    },
    {
      label: 'Self-join: khách cùng quốc gia',
      sql: 'SELECT c1.full_name AS khach_1, c2.full_name AS khach_2, c1.country\nFROM customers c1\nINNER JOIN customers c2\n  ON c1.country = c2.country AND c1.customer_id < c2.customer_id\nORDER BY c1.country;',
    },
    {
      label: 'Self-join: khoảng cách giữa 2 đơn liên tiếp',
      sql: 'SELECT o1.customer_id, o1.order_id AS don_truoc, o2.order_id AS don_sau,\n       julianday(o2.order_date) - julianday(o1.order_date) AS so_ngay_cach\nFROM orders o1\nINNER JOIN orders o2\n  ON o1.customer_id = o2.customer_id\n  AND o1.order_id < o2.order_id\nWHERE o1.customer_id IS NOT NULL\nORDER BY o1.customer_id, so_ngay_cach;',
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
    // (xem ghi chú tương tự ở Bài 1).
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

  function applyVennJoin(joinKey) {
    const config = VENN_CONFIG[joinKey];
    if (!config) return;
    vennRegionA.setAttribute('fill-opacity', config.aOpacity);
    vennRegionB.setAttribute('fill-opacity', config.bOpacity);
    vennRegionI.setAttribute('fill-opacity', config.iOpacity);
    vennCaption.innerHTML = config.caption;
    vennButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.join === joinKey);
    });
    editor.value = config.sql;
    if (db) runQuery(config.sql);
  }

  function buildVennButtons() {
    vennButtons.forEach((btn) => {
      btn.addEventListener('click', () => applyVennJoin(btn.dataset.join));
    });
  }

  async function init() {
    buildExampleButtons();
    buildVennButtons();
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
      editor.value = VENN_CONFIG.inner.sql;
      setStatus('Sẵn sàng — dataset TechMart đã nạp (customers, products, orders, order_items).', false);
      runQuery(VENN_CONFIG.inner.sql);
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
      '/* 🗄️ BÀI 3: JOIN TOÀN TẬP */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n' +
      'db.run(seedSql); // tạo bảng + nạp dữ liệu TechMart\n\n' +
      '// 5 loại JOIN, cùng cú pháp cốt lõi "FROM a JOIN b ON điều_kiện":\n' +
      'db.exec("... FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id");\n' +
      'db.exec("... FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id");\n' +
      'db.exec("... FROM customers c RIGHT JOIN orders o ON c.customer_id = o.customer_id");\n' +
      'db.exec("... FROM customers c FULL OUTER JOIN orders o ON c.customer_id = o.customer_id");\n' +
      'db.exec("... FROM a CROSS JOIN b"); // không có ON — mọi hàng ghép mọi hàng';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
