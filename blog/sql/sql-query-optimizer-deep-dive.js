/* Bài 9: Query Optimizer Sâu — SQL Workbench thật (sql.js) trên big_orders (100k, +channel) và big_customers (5k) tự sinh trong phiên làm việc */
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
  total_amount REAL,
  channel TEXT
);

WITH RECURSIVE seq(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM seq WHERE x < 100000
)
INSERT INTO big_orders (order_id, customer_id, order_date, status, total_amount, channel)
SELECT
  x,
  1 + (abs(random()) % 5000),
  date('2024-01-01', '+' || (abs(random()) % 700) || ' days'),
  CASE abs(random()) % 5
    WHEN 0 THEN 'delivered' WHEN 1 THEN 'shipped' WHEN 2 THEN 'cancelled'
    WHEN 3 THEN 'refunded' ELSE 'pending' END,
  ROUND(10 + (abs(random()) % 40000) / 100.0, 2),
  CASE WHEN x % 20 = 0 THEN 'mobile_app' ELSE 'web' END   -- 5% mobile_app, 95% web
FROM seq;`;

  const CREATE_BIG_CUSTOMERS = `CREATE TABLE big_customers (
  customer_id INTEGER PRIMARY KEY,
  country TEXT,
  email TEXT
);

WITH RECURSIVE seq(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM seq WHERE x < 5000
)
INSERT INTO big_customers (customer_id, country, email)
SELECT
  x,
  CASE
    WHEN x % 10 < 7 THEN 'Vietnam'          -- 70%
    WHEN x % 10 = 7 THEN 'Singapore'        -- 10%
    WHEN x % 10 = 8 THEN 'United States'    -- 10%
    ELSE 'South Korea'                      -- 10%
  END,
  'customer' || x || CASE WHEN x % 2 = 0 THEN '@gmail.com' ELSE '@GMAIL.COM' END
FROM seq;`;

  const CHANNEL_FILTER_SQL = "EXPLAIN QUERY PLAN\nSELECT total_amount FROM big_orders WHERE channel = 'web';";
  const JOIN_COUNTRY_SQL =
    'EXPLAIN QUERY PLAN\n' +
    'SELECT bo.order_id, bo.total_amount, bc.country\n' +
    'FROM big_orders bo\n' +
    'JOIN big_customers bc ON bo.customer_id = bc.customer_id\n' +
    "WHERE bc.country = 'Singapore';";
  const PENDING_FILTER_SQL =
    'EXPLAIN QUERY PLAN\n' + "SELECT * FROM big_orders WHERE status = 'pending' AND order_date > '2024-06-01';";
  const EMAIL_FILTER_SQL =
    'EXPLAIN QUERY PLAN\n' + "SELECT * FROM big_customers WHERE LOWER(email) = 'customer2500@gmail.com';";

  const EXAMPLES = [
    { label: '1️⃣ Tạo bảng big_orders (100k, +channel, giống Bài 8)', sql: CREATE_BIG_ORDERS },
    { label: '2️⃣ Tạo bảng big_customers (5k, quốc gia lệch)', sql: CREATE_BIG_CUSTOMERS },
    { label: '3️⃣ Lọc channel — TRƯỚC khi có index', sql: CHANNEL_FILTER_SQL },
    { label: '3️⃣a Tạo index trên channel', sql: 'CREATE INDEX idx_channel ON big_orders(channel);' },
    { label: '3️⃣b Lọc channel — có index, CHƯA ANALYZE', sql: CHANNEL_FILTER_SQL },
    { label: '3️⃣c Chạy ANALYZE', sql: 'ANALYZE;' },
    { label: '3️⃣d Xem sqlite_stat1', sql: 'SELECT * FROM sqlite_stat1;' },
    { label: '3️⃣e Lọc channel — SAU ANALYZE (so cost với 3️⃣b)', sql: CHANNEL_FILTER_SQL },
    { label: '4️⃣ JOIN theo quốc gia — chưa có index nào (baseline)', sql: JOIN_COUNTRY_SQL },
    {
      label: '4️⃣a Tạo index phục vụ JOIN (customer_id + country)',
      sql: 'CREATE INDEX idx_bo_customer ON big_orders(customer_id);\nCREATE INDEX idx_bc_country ON big_customers(country);',
    },
    { label: '4️⃣b JOIN sau khi có index (chưa ANALYZE lại)', sql: JOIN_COUNTRY_SQL },
    { label: '4️⃣c ANALYZE lại rồi xem JOIN plan (so cost với 4️⃣b)', sql: 'ANALYZE;\n' + JOIN_COUNTRY_SQL },
    { label: '5️⃣ Đơn pending gần đây — TRƯỚC khi có partial index', sql: PENDING_FILTER_SQL },
    {
      label: '5️⃣a Tạo partial index (chỉ index đơn pending)',
      sql: "CREATE INDEX idx_pending ON big_orders(order_date) WHERE status = 'pending';",
    },
    { label: '5️⃣b Đơn pending gần đây — SAU khi có partial index', sql: PENDING_FILTER_SQL },
    { label: '6️⃣ Tra email không phân biệt hoa/thường — TRƯỚC index', sql: EMAIL_FILTER_SQL },
    {
      label: '6️⃣a Tạo expression index trên LOWER(email)',
      sql: 'CREATE INDEX idx_email_lower ON big_customers(LOWER(email));',
    },
    { label: '6️⃣b Tra email — SAU khi có expression index (chú ý <expr>)', sql: EMAIL_FILTER_SQL },
    {
      label: '7️⃣ EXPLAIN đầy đủ — bytecode VDBE',
      sql: 'EXPLAIN\nSELECT customer_id, total_amount FROM big_orders WHERE customer_id = 2500;',
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
        '(không có bảng kết quả — lệnh đã chạy thành công nhưng không phải SELECT/EXPLAIN, hoặc trả về 0 dòng)';
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
    // Giới hạn 50 hàng đầu — big_orders có 100k dòng, render hết ra DOM sẽ rất chậm
    // và không cần thiết cho mục đích bài học (đọc kế hoạch/bytecode/thống kê).
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
      let message = 'Lỗi SQL: ' + err.message;
      if (alreadyExists) {
        message +=
          ' — Bảng/index này đã được tạo ở bước trước rồi. Bấm "Reset dữ liệu" nếu muốn làm lại từ đầu, hoặc bỏ qua và tiếp tục các bước sau.';
      }
      empty.textContent = message;
      resultsEl.appendChild(empty);
      if (alreadyExists) {
        setStatus('Không cần chạy lại bước này — bảng/index đã có sẵn từ trước.', false);
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
        'Sẵn sàng — DB rỗng. Bấm lần lượt các nút 1️⃣ → 7️⃣ theo thứ tự để đi hết bài (mất khoảng vài trăm ms/bước).',
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
      resultsEl.innerHTML = '<div class="sql-results-empty">Bấm lần lượt 1️⃣ 2️⃣... bên dưới để bắt đầu lại...</div>';
      setStatus('Đã reset — DB rỗng trở lại. Bấm "1️⃣" để bắt đầu lại.', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 9: QUERY OPTIMIZER SÂU */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n\n' +
      '// Trước ANALYZE: engine đoán mặc định, tin index luôn rẻ\n' +
      'db.run(createBigOrdersSQL);\n' +
      'db.run("CREATE INDEX idx_channel ON big_orders(channel)");\n' +
      'db.exec("EXPLAIN QUERY PLAN SELECT total_amount FROM big_orders WHERE channel=\'web\'");\n' +
      "// → SEARCH ... USING INDEX idx_channel — dù 'web' chiếm 95% dòng!\n\n" +
      '// Sau ANALYZE: engine có thống kê thật (sqlite_stat1)\n' +
      'db.run("ANALYZE");\n' +
      'db.exec("SELECT * FROM sqlite_stat1");\n' +
      '// → chi phí ước lượng tăng vọt (62 → 180) dù quyết định có thể không đổi\n' +
      '// vì sqlite_stat1 chỉ lưu 1 số TRUNG BÌNH cho mỗi index, không phải\n' +
      '// biểu đồ phân phối riêng cho từng giá trị cụ thể.';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
