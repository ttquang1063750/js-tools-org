/* Bài 12: Trigger, View & Virtual Table — SQL Workbench (sql.js) trên TechMart + bank_accounts (tiếp nối Bài 11) */
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

  const SETUP_TRIGGER_1 = `CREATE TABLE bank_accounts (
  account_id INTEGER PRIMARY KEY,
  owner_name TEXT NOT NULL,
  balance REAL NOT NULL CHECK (balance >= 0)
);

INSERT INTO bank_accounts VALUES
  (1, 'Hoàng Gia Bảo', 1000),
  (2, 'Đỗ Thị Kim Ngân', 500);

CREATE TABLE balance_audit_log (
  log_id INTEGER PRIMARY KEY,
  account_id INTEGER,
  old_balance REAL,
  new_balance REAL,
  changed_at TEXT
);

CREATE TRIGGER trg_audit_balance
AFTER UPDATE OF balance ON bank_accounts
FOR EACH ROW
BEGIN
  INSERT INTO balance_audit_log (account_id, old_balance, new_balance, changed_at)
  VALUES (OLD.account_id, OLD.balance, NEW.balance, datetime('now'));
END;`;

  const SETUP_TRIGGER_2 = `CREATE TRIGGER trg_reject_blank_name
BEFORE INSERT ON bank_accounts
FOR EACH ROW
BEGIN
  SELECT RAISE(ABORT, 'owner_name không được để trống')
  WHERE length(trim(NEW.owner_name)) = 0;
END;`;

  const SETUP_TRIGGER_3 = `CREATE TABLE deleted_accounts_log (
  account_id INTEGER,
  owner_name TEXT,
  deleted_at TEXT
);

CREATE TRIGGER trg_log_delete
AFTER DELETE ON bank_accounts
FOR EACH ROW
BEGIN
  INSERT INTO deleted_accounts_log VALUES (OLD.account_id, OLD.owner_name, datetime('now'));
END;`;

  const SETUP_VIEW = `CREATE VIEW account_summary AS
SELECT account_id, owner_name, balance FROM bank_accounts;`;

  const SETUP_INSTEAD_OF = `CREATE TRIGGER trg_update_via_view
INSTEAD OF UPDATE ON account_summary
FOR EACH ROW
BEGIN
  UPDATE bank_accounts SET balance = NEW.balance WHERE account_id = NEW.account_id;
END;`;

  const SETUP_FTS3 = `CREATE VIRTUAL TABLE product_search USING fts3(product_name, category);

INSERT INTO product_search (product_name, category)
SELECT product_name, category FROM products;`;

  const EXAMPLES = [
    { label: '1️⃣ Tạo bank_accounts + audit log + trigger AFTER UPDATE', sql: SETUP_TRIGGER_1 },
    {
      label: '1️⃣a UPDATE balance (kích hoạt trigger tự động)',
      sql: 'UPDATE bank_accounts SET balance = balance - 300 WHERE account_id = 1;',
    },
    {
      label: '1️⃣b Xem balance_audit_log (đã ghi tự động)',
      sql: 'SELECT account_id, old_balance, new_balance, changed_at FROM balance_audit_log;',
    },
    { label: '2️⃣ Tạo trigger BEFORE INSERT chặn tên rỗng', sql: SETUP_TRIGGER_2 },
    {
      label: '2️⃣a Thử insert tên toàn khoảng trắng (bị chặn)',
      sql: "INSERT INTO bank_accounts VALUES (3, '   ', 200);",
    },
    {
      label: '2️⃣b Insert hợp lệ (qua được bình thường)',
      sql: "INSERT INTO bank_accounts VALUES (3, 'Lê Văn Cường', 200);",
    },
    { label: '3️⃣ Tạo trigger AFTER DELETE ghi log trước khi mất', sql: SETUP_TRIGGER_3 },
    { label: '3️⃣a DELETE 1 tài khoản (kích hoạt trigger)', sql: 'DELETE FROM bank_accounts WHERE account_id = 3;' },
    {
      label: '3️⃣b Xem deleted_accounts_log (dữ liệu đã mất vẫn còn đây)',
      sql: 'SELECT account_id, owner_name, deleted_at FROM deleted_accounts_log;',
    },
    { label: '4️⃣ Tạo view account_summary', sql: SETUP_VIEW },
    {
      label: '4️⃣a UPDATE trực tiếp qua view (bị chặn — view read-only)',
      sql: 'UPDATE account_summary SET balance = 5000 WHERE account_id = 2;',
    },
    { label: '4️⃣b Tạo INSTEAD OF trigger cho view', sql: SETUP_INSTEAD_OF },
    {
      label: '4️⃣c UPDATE lại qua view (giờ chạy được, ghi xuống bảng gốc)',
      sql: 'UPDATE account_summary SET balance = 5000 WHERE account_id = 2;',
    },
    { label: '5️⃣ Tạo FTS3 virtual table product_search (từ TechMart)', sql: SETUP_FTS3 },
    {
      label: '5️⃣a Tìm kiếm full-text bằng MATCH',
      sql: "SELECT * FROM product_search WHERE product_search MATCH 'wireless';",
    },
    {
      label: '6️⃣ Dùng hàm JS tuỳ biến format_vnd() trong SELECT',
      sql: 'SELECT order_id, total_amount, format_vnd(total_amount) FROM orders LIMIT 5;',
    },
  ];

  let db = null;

  function registerCustomFunctions(database) {
    database.create_function('format_vnd', (amount) => {
      if (amount === null) return null;
      return Number(amount).toLocaleString('vi-VN') + ' đ';
    });
  }

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
      const missingTable = /no such table|no such column|no such index|no such module/i.test(err.message);
      const constraintOrTriggerBlock = /constraint failed|cannot modify|owner_name không được để trống/i.test(
        err.message
      );
      let message = 'Lỗi SQL: ' + err.message;
      if (alreadyExists) {
        message +=
          ' — Bảng/index/trigger/view này đã được tạo ở bước trước rồi. Bấm "Reset dữ liệu" nếu muốn làm lại từ đầu, hoặc bỏ qua và tiếp tục các bước sau.';
      } else if (missingTable) {
        message +=
          ' — Bảng/view/trigger này chưa tồn tại. Hãy bấm lần lượt các bước theo đúng thứ tự (1️⃣ 2️⃣ 3️⃣...) từ đầu trước khi thử bước này.';
      } else if (constraintOrTriggerBlock) {
        message +=
          ' — Đây là hành vi CHẶN ĐÚNG NHƯ MINH HOẠ (ràng buộc hoặc trigger đang bảo vệ dữ liệu), không phải lỗi cần sửa — đọc tiếp phần giải thích hoặc bấm bước tiếp theo.';
      }
      empty.textContent = message;
      resultsEl.appendChild(empty);
      if (alreadyExists) {
        setStatus('Không cần chạy lại bước này — đã có sẵn từ trước.', false);
      } else if (missingTable) {
        setStatus('Thiếu bước trước đó — hãy chạy lần lượt theo đúng thứ tự từ 1️⃣.', true);
      } else if (constraintOrTriggerBlock) {
        setStatus('Bị chặn đúng như minh hoạ — bấm bước tiếp theo.', false);
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
      const seedResponse = await fetch('sql-techmart-seed.sql');
      const seedSql = await seedResponse.text();
      db = new SQL.Database();
      db.run(seedSql);
      registerCustomFunctions(db);
      editor.value = EXAMPLES[0].sql;
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
  });
  resetBtn.addEventListener('click', () => {
    if (!db) return;
    db.close();
    initSqlJs({ locateFile: (file) => 'vendor/' + file }).then(async (SQL) => {
      const seedSql = await (await fetch('sql-techmart-seed.sql')).text();
      db = new SQL.Database();
      db.run(seedSql);
      registerCustomFunctions(db);
      resultsEl.innerHTML = '<div class="sql-results-empty">Đã reset — dataset TechMart nạp lại từ đầu.</div>';
      setStatus('Đã reset dữ liệu về trạng thái ban đầu (chỉ có TechMart).', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 12: TRIGGER, VIEW & VIRTUAL TABLE */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n\n' +
      "db.run('CREATE TRIGGER trg_audit_balance AFTER UPDATE OF balance ON bank_accounts ...');\n" +
      '// Mọi UPDATE balance sau đó TỰ ĐỘNG ghi vào balance_audit_log — không cần\n' +
      '// app code gọi thêm bất kỳ câu lệnh nào khác.\n\n' +
      '// Đăng ký hàm SQL tuỳ biến ngay từ JavaScript — gọi được như hàm built-in:\n' +
      "db.create_function('format_vnd', (amount) => {\n" +
      "  return Number(amount).toLocaleString('vi-VN') + ' đ';\n" +
      '});\n' +
      "db.exec('SELECT format_vnd(total_amount) FROM orders'); // → '249.99 đ' kiểu VN";
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
