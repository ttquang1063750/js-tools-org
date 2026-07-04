/* Bài 13: JSON & Generated Columns — SQL Workbench (sql.js) */
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

  const SETUP_PRODUCTS = `CREATE TABLE techmart_products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  specs TEXT
);

INSERT INTO techmart_products (product_id, product_name, specs) VALUES
  (1, 'Wireless Mouse X1', '{"category_type": "Accessories", "color": "black", "dpi": 1600, "weight_kg": 0.085}'),
  (2, 'Mechanical Keyboard K3', '{"category_type": "Accessories", "switch": "blue", "backlight": "RGB", "weight_kg": 0.82}'),
  (3, 'Pro Monitor 27', '{"category_type": "Electronics", "resolution": "4K", "panel": "IPS", "refresh_rate": 144, "weight_kg": 5.4}'),
  (4, 'ZenBook Slim 14', '{"category_type": "Laptop", "RAM": "16GB", "CPU": "Ryzen 7", "storage": "512GB SSD", "weight_kg": 1.25}'),
  (5, 'MacBook Air M2', '{"category_type": "Laptop", "RAM": "8GB", "CPU": "M2", "storage": "256GB SSD", "weight_kg": 1.24}'),
  (6, 'Office Chair Ergonomic', '{"category_type": "Office", "materials": "Mesh", "max_load_kg": 120, "weight_kg": 15.2}');`;

  const QUERY_EXTRACT = `SELECT product_name, 
       specs -> '$.RAM' AS ram_json,     -- Trả về '"16GB"' (chuỗi JSON có nháy kép)
       specs ->> '$.RAM' AS ram_raw,     -- Trả về '16GB' (chuỗi SQL thô)
       specs ->> '$.weight_kg' AS weight -- Trả về số thực 1.25
FROM techmart_products
WHERE specs ->> '$.category_type' = 'Laptop';`;

  const UPDATE_JSON = `UPDATE techmart_products
SET specs = json_set(specs, '$.color', 'white', '$.bluetooth', 1)
WHERE product_id = 1;

-- Xem kết quả cập nhật của sản phẩm 1
SELECT product_name, specs FROM techmart_products WHERE product_id = 1;`;

  const SETUP_LOGS = `CREATE TABLE api_logs (
  log_id INTEGER PRIMARY KEY,
  payload TEXT
);

INSERT INTO api_logs (log_id, payload) VALUES
  (101, '{"request_id": 9901, "status": "failed", "errors": [{"code": "ERR_STOCK", "msg": "Wireless Mouse X1 hết hàng"}, {"code": "ERR_PRICE", "msg": "Sai lệch giá bán"}]}'),
  (102, '{"request_id": 9902, "status": "success", "errors": []}'),
  (103, '{"request_id": 9903, "status": "failed", "errors": [{"code": "ERR_AUTH", "msg": "Token expired"}]}');`;

  const FLATTEN_JSON = `SELECT log_id,
       payload ->> '$.request_id' AS request_id,
       value ->> '$.code' AS error_code,
       value ->> '$.msg' AS error_msg
FROM api_logs, json_each(api_logs.payload, '$.errors');`;

  const SETUP_GENERATED_COLUMNS = `CREATE TABLE products_v2 (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  specs TEXT,
  -- Cột ảo VIRTUAL: Không tốn dung lượng ổ đĩa, tính toán mỗi khi đọc
  device_ram TEXT GENERATED ALWAYS AS (specs ->> '$.RAM') VIRTUAL,
  -- Cột lưu trữ STORED: Tính sẵn một lần khi ghi, tốn dung lượng đĩa nhưng đọc nhanh
  shipping_weight REAL GENERATED ALWAYS AS (CAST(specs ->> '$.weight_kg' AS REAL)) STORED
);

INSERT INTO products_v2 (product_id, product_name, specs)
SELECT product_id, product_name, specs FROM techmart_products;

SELECT product_name, device_ram, shipping_weight FROM products_v2;`;

  const INDEX_EXPRESSION = `CREATE INDEX idx_products_weight ON techmart_products(specs ->> '$.weight_kg');

EXPLAIN QUERY PLAN
SELECT product_name, specs ->> '$.weight_kg'
FROM techmart_products
WHERE specs ->> '$.weight_kg' > 1.0;`;

  const EXAMPLES = [
    { label: '1️⃣ Tạo bảng techmart_products + nạp specs JSON', sql: SETUP_PRODUCTS },
    { label: '2️⃣ Trích xuất JSON bằng toán tử -> và ->>', sql: QUERY_EXTRACT },
    { label: '3️⃣ Cập nhật key trong specs bằng json_set', sql: UPDATE_JSON },
    { label: '4️⃣ Tạo bảng api_logs với JSON arrays', sql: SETUP_LOGS },
    { label: '4️⃣a Làm phẳng mảng bằng json_each', sql: FLATTEN_JSON },
    { label: '5️⃣ Tạo Generated Columns (Virtual/Stored)', sql: SETUP_GENERATED_COLUMNS },
    { label: '6️⃣ Tạo index trên biểu thức + EXPLAIN', sql: INDEX_EXPRESSION },
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
            // colRow structure: [cid, name, type, notnull, dflt_value, pk]
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
        message +=
          ' — Bảng hoặc cột này chưa được định nghĩa. Vui lòng bấm chạy các bước 1️⃣, 4️⃣ hoặc 5️⃣ trước để khởi tạo.';
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
      setStatus('Sẵn sàng — dataset TechMart đã nạp. Bấm lần lượt 1️⃣ → 6️⃣ theo thứ tự để đi hết bài.', false);
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
