/* Bài 11: Transaction & ACID — SQL Workbench (sql.js) trên TechMart + bảng bonus bank_accounts (chuyển khoản ngân hàng) */
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

  const CREATE_BANK_ACCOUNTS = `CREATE TABLE branches (
  branch_id INTEGER PRIMARY KEY,
  branch_name TEXT NOT NULL
);

INSERT INTO branches VALUES (1, 'Chi nhánh Quận 1'), (2, 'Chi nhánh Quận 3');

CREATE TABLE bank_accounts (
  account_id INTEGER PRIMARY KEY,
  owner_name TEXT NOT NULL,
  email TEXT UNIQUE,
  balance REAL NOT NULL CHECK (balance >= 0),
  branch_id INTEGER REFERENCES branches(branch_id)
);

INSERT INTO bank_accounts (account_id, owner_name, email, balance, branch_id) VALUES
  (1, 'Hoàng Gia Bảo', 'baohg@gmail.com', 1000, 1),
  (2, 'Đỗ Thị Kim Ngân', 'ngandtk@gmail.com', 500, 1);`;

  const VIEW_BALANCES = 'SELECT account_id, owner_name, balance FROM bank_accounts ORDER BY account_id;';

  const EXAMPLES = [
    { label: '1️⃣ Tạo branches + bank_accounts (2 tài khoản mẫu)', sql: CREATE_BANK_ACCOUNTS },
    { label: '1️⃣a Xem số dư ban đầu', sql: VIEW_BALANCES },
    {
      label: '2️⃣ BEGIN + chuyển 300đ từ TK1 sang TK2 (CHƯA commit)',
      sql:
        'BEGIN;\n' +
        'UPDATE bank_accounts SET balance = balance - 300 WHERE account_id = 1;\n' +
        'UPDATE bank_accounts SET balance = balance + 300 WHERE account_id = 2;',
    },
    { label: '2️⃣a Xem số dư TRONG giao dịch (chưa commit)', sql: VIEW_BALANCES },
    { label: '3️⃣ ROLLBACK — huỷ giao dịch vừa rồi', sql: 'ROLLBACK;' },
    { label: '3️⃣a Xem số dư sau ROLLBACK (quay về ban đầu)', sql: VIEW_BALANCES },
    {
      label: '4️⃣ BEGIN + chuyển khoản + SAVEPOINT + đổi ý 1 phần',
      sql:
        'BEGIN;\n' +
        'UPDATE bank_accounts SET balance = balance - 100 WHERE account_id = 1; -- giữ lại\n' +
        'SAVEPOINT sp1;\n' +
        'UPDATE bank_accounts SET balance = balance + 100 WHERE account_id = 2; -- sắp huỷ riêng phần này',
    },
    { label: '4️⃣a ROLLBACK TO sp1 (chỉ huỷ phần SAU savepoint)', sql: 'ROLLBACK TO sp1;' },
    { label: '4️⃣b COMMIT (giữ phần trước savepoint, huỷ phần sau)', sql: 'COMMIT;' },
    { label: '4️⃣c Xem số dư sau (chỉ TK1 bị trừ, TK2 không đổi)', sql: VIEW_BALANCES },
    {
      label: '5️⃣ BEGIN + insert hợp lệ + insert vi phạm UNIQUE (email trùng)',
      sql:
        'BEGIN;\n' +
        "INSERT INTO bank_accounts (account_id, owner_name, email, balance, branch_id) VALUES (3, 'Lê Văn Cường', 'cuonglv@gmail.com', 200, 1); -- hợp lệ\n" +
        "INSERT INTO bank_accounts (account_id, owner_name, email, balance, branch_id) VALUES (4, 'Phạm Thị Dung', 'baohg@gmail.com', 300, 1); -- TRÙNG email TK1!",
    },
    { label: '5️⃣a COMMIT sau lỗi — TK3 còn, TK4 không có', sql: 'COMMIT;' },
    {
      label: '5️⃣b Xem danh sách tài khoản (xác nhận TK3 vẫn còn)',
      sql: 'SELECT account_id, owner_name FROM bank_accounts ORDER BY account_id;',
    },
    {
      label: '6️⃣ BEGIN + rút quá số dư (vi phạm CHECK balance >= 0)',
      sql:
        'BEGIN;\n' +
        'UPDATE bank_accounts SET balance = balance - 100 WHERE account_id = 1; -- hợp lệ\n' +
        'UPDATE bank_accounts SET balance = balance - 9999 WHERE account_id = 2; -- ÂM số dư!',
    },
    { label: '6️⃣a ROLLBACK toàn bộ (cách đúng để đảm bảo atomic thật)', sql: 'ROLLBACK;' },
    { label: '6️⃣b Xem số dư sau (không đổi gì — atomic đúng nghĩa)', sql: VIEW_BALANCES },
    { label: '7️⃣ PRAGMA foreign_keys (mặc định TẮT trong SQLite)', sql: 'PRAGMA foreign_keys;' },
    {
      label: '7️⃣a Tạo TK với branch_id KHÔNG tồn tại (FK tắt → vẫn cho qua)',
      sql: "INSERT INTO bank_accounts (account_id, owner_name, balance, branch_id) VALUES (9001, 'Tài khoản ma', 50, 99999);",
    },
    { label: '7️⃣b Bật FOREIGN KEY rồi thử lại (bị chặn đúng)', sql: 'PRAGMA foreign_keys = ON;' },
    {
      label: '7️⃣c Tạo TK với branch_id KHÔNG tồn tại (FK bật → bị chặn)',
      sql: "INSERT INTO bank_accounts (account_id, owner_name, balance, branch_id) VALUES (9002, 'Tài khoản ma 2', 50, 88888);",
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
        '(không có bảng kết quả — lệnh đã chạy thành công nhưng không phải SELECT/PRAGMA, hoặc trả về 0 dòng)';
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
      const missingTable = /no such table|no such column|no such index|no such savepoint/i.test(err.message);
      const constraintViolation = /constraint failed/i.test(err.message);
      let message = 'Lỗi SQL: ' + err.message;
      if (alreadyExists) {
        message +=
          ' — Bảng/index này đã được tạo ở bước trước rồi. Bấm "Reset dữ liệu" nếu muốn làm lại từ đầu, hoặc bỏ qua và tiếp tục các bước sau.';
      } else if (missingTable) {
        message +=
          ' — Bảng/cột/savepoint này chưa tồn tại. Hãy bấm lần lượt các bước theo đúng thứ tự (1️⃣ 2️⃣ 3️⃣...) từ đầu trước khi thử bước này.';
      } else if (constraintViolation) {
        message +=
          ' — Đây là lỗi VI PHẠM RÀNG BUỘC dữ liệu, đúng như bài học minh hoạ (không phải lỗi cần sửa) — đọc tiếp phần giải thích bên dưới hoặc bấm bước tiếp theo.';
      }
      empty.textContent = message;
      resultsEl.appendChild(empty);
      if (alreadyExists) {
        setStatus('Không cần chạy lại bước này — bảng/index đã có sẵn từ trước.', false);
      } else if (missingTable) {
        setStatus('Thiếu bước trước đó — hãy chạy lần lượt theo đúng thứ tự từ 1️⃣.', true);
      } else if (constraintViolation) {
        setStatus('Vi phạm ràng buộc dữ liệu (đúng như minh hoạ) — bấm bước tiếp theo.', false);
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
      editor.value = EXAMPLES[0].sql;
      setStatus('Sẵn sàng — dataset TechMart đã nạp. Bấm lần lượt 1️⃣ → 7️⃣c theo thứ tự để đi hết bài.', false);
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
      resultsEl.innerHTML = '<div class="sql-results-empty">Đã reset — dataset TechMart nạp lại từ đầu.</div>';
      setStatus('Đã reset dữ liệu về trạng thái ban đầu (chỉ có TechMart, chưa có bank_accounts).', false);
    });
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 11: TRANSACTION & ACID */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n\n' +
      "db.run('BEGIN;');\n" +
      "db.run('UPDATE bank_accounts SET balance = balance - 300 WHERE account_id = 1;');\n" +
      "db.run('UPDATE bank_accounts SET balance = balance + 300 WHERE account_id = 2;');\n" +
      '// Số dư đã đổi trong bộ nhớ, nhưng CHƯA commit — vẫn có thể ROLLBACK\n\n' +
      "db.run('ROLLBACK;'); // huỷ toàn bộ, số dư quay về ban đầu\n\n" +
      '// Vi phạm ràng buộc (UNIQUE/CHECK/NOT NULL) KHÔNG tự rollback cả transaction —\n' +
      '// chỉ câu lệnh gây lỗi bị huỷ, các câu TRƯỚC ĐÓ vẫn còn khi COMMIT.\n' +
      '// Muốn atomic thật (tất cả-hoặc-không-gì), phải tự bắt lỗi rồi gọi ROLLBACK:\n' +
      'try {\n' +
      "  db.run('BEGIN; ...; ...;');\n" +
      "  db.run('COMMIT;');\n" +
      '} catch (err) {\n' +
      "  db.run('ROLLBACK;');\n" +
      '}';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
