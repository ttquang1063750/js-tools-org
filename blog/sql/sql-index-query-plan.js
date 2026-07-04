/* Bài 8: Index & Query Plan — SQL Workbench thật (sql.js) trên bảng big_orders 100.000 dòng tự sinh trong phiên làm việc */
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
  const jsCodeDisplay = document.getElementById('sql-js-code-display');

  const CREATE_BIG_ORDERS = `CREATE TABLE big_orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT,
  status TEXT,
  total_amount REAL
);

WITH RECURSIVE seq(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM seq WHERE x < 100000
)
INSERT INTO big_orders (order_id, customer_id, order_date, status, total_amount)
SELECT
  x,
  1 + (abs(random()) % 5000),
  date('2024-01-01', '+' || (abs(random()) % 700) || ' days'),
  CASE abs(random()) % 5
    WHEN 0 THEN 'delivered' WHEN 1 THEN 'shipped' WHEN 2 THEN 'cancelled'
    WHEN 3 THEN 'refunded' ELSE 'pending' END,
  ROUND(10 + (abs(random()) % 40000) / 100.0, 2)
FROM seq;`;

  const EXAMPLES = [
    { label: '1️⃣ Tạo bảng 100k dòng (chạy trước)', sql: CREATE_BIG_ORDERS },
    {
      label: '2️⃣ EXPLAIN QUERY PLAN (chưa có index)',
      sql: 'EXPLAIN QUERY PLAN\nSELECT * FROM big_orders WHERE customer_id = 2500;',
    },
    {
      label: '3️⃣ Đo thời gian: SELECT chưa có index',
      sql: 'SELECT * FROM big_orders WHERE customer_id = 2500;',
    },
    {
      label: '4️⃣ Tạo index trên customer_id',
      sql: 'CREATE INDEX idx_customer ON big_orders(customer_id);',
    },
    {
      label: '5️⃣ EXPLAIN QUERY PLAN (đã có index)',
      sql: 'EXPLAIN QUERY PLAN\nSELECT * FROM big_orders WHERE customer_id = 2500;',
    },
    {
      label: '6️⃣ Đo thời gian: SELECT đã có index (so sánh với bước 3)',
      sql: 'SELECT * FROM big_orders WHERE customer_id = 2500;',
    },
    {
      label: '7️⃣ Composite index (status, order_date)',
      sql: 'CREATE INDEX idx_status_date ON big_orders(status, order_date);',
    },
    {
      label: '7️⃣a Lọc status + order_date (left-prefix — dùng được index)',
      sql: "EXPLAIN QUERY PLAN\nSELECT * FROM big_orders WHERE status = 'delivered' AND order_date > '2024-06-01';",
    },
    {
      label: '7️⃣b Chỉ lọc order_date (KHÔNG dùng được index)',
      sql: "EXPLAIN QUERY PLAN\nSELECT * FROM big_orders WHERE order_date > '2024-06-01';",
    },
    {
      label: '8️⃣a Chưa phải covering (vẫn cần đọc bảng gốc)',
      sql: "EXPLAIN QUERY PLAN\nSELECT customer_id, order_date FROM big_orders WHERE status = 'delivered';",
    },
    {
      label: '8️⃣b Tạo covering index',
      sql: 'CREATE INDEX idx_covering ON big_orders(status, customer_id, order_date);',
    },
    {
      label: '8️⃣c EXPLAIN sau covering index (chú ý từ COVERING)',
      sql: "EXPLAIN QUERY PLAN\nSELECT customer_id, order_date FROM big_orders WHERE status = 'delivered';",
    },
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
    // Giới hạn hiển thị 50 hàng đầu — bảng 100k dòng render hết ra DOM sẽ rất chậm,
    // trong khi mục đích của bài là ĐO THỜI GIAN THỰC THI (đã có ở status line),
    // không phải xem toàn bộ dữ liệu.
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
      const alreadyExists = /already exists/i.test(err.message);
      const missingTable = /no such table|no such column|no such index/i.test(err.message);
      let message = 'Lỗi SQL: ' + err.message;
      if (alreadyExists) {
        message +=
          ' — Bảng/index này đã được tạo ở bước trước rồi. Bấm "Reset dữ liệu" nếu muốn làm lại từ đầu, hoặc bỏ qua và tiếp tục các bước sau.';
      } else if (missingTable) {
        message +=
          ' — Bảng/cột này chưa được tạo. Hãy bấm lần lượt các bước theo đúng thứ tự (1️⃣ 2️⃣ 3️⃣...) từ đầu trước khi thử bước này.';
      }
      empty.textContent = message;
      resultsEl.appendChild(empty);
      if (alreadyExists) {
        setStatus('Không cần chạy lại bước này — bảng/index đã có sẵn từ trước.', false);
      } else if (missingTable) {
        setStatus('Thiếu bước trước đó — hãy chạy lần lượt theo đúng thứ tự từ 1️⃣.', true);
      } else {
        setStatus('Lỗi khi thực thi.', true);
      }
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
      db = new SQL.Database();
      editor.value = EXAMPLES[0].sql;
      setStatus(
        'Sẵn sàng — DB rỗng. Bấm nút "1️⃣ Tạo bảng 100k dòng" rồi "▶ Chạy" để bắt đầu (mất khoảng vài trăm ms).',
        false
      );
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
    if (!db) return;
    db.close();
    initSqlJs({ locateFile: (file) => 'vendor/' + file }).then((SQL) => {
      db = new SQL.Database();
      resultsEl.innerHTML = '<div class="sql-results-empty">Bấm "Tạo bảng 100k dòng" bên dưới để bắt đầu...</div>';
      setStatus('Đã reset — DB rỗng trở lại. Bấm "1️⃣ Tạo bảng 100k dòng" để bắt đầu lại.', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 8: INDEX & QUERY PLAN */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n\n' +
      '// Sinh 100.000 dòng bằng CTE đệ quy — nhanh hơn nhiều so với vòng lặp JS:\n' +
      'db.run(createBigOrdersSQL);\n\n' +
      '// Xem kế hoạch thực thi TRƯỚC khi chạy thật:\n' +
      'db.exec("EXPLAIN QUERY PLAN SELECT * FROM big_orders WHERE customer_id = 2500");\n' +
      '// → "SCAN big_orders" (chưa có index)\n\n' +
      'db.run("CREATE INDEX idx_customer ON big_orders(customer_id)");\n' +
      '// → "SEARCH big_orders USING INDEX idx_customer (customer_id=?)"';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
