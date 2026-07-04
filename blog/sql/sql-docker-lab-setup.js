/* Bài 2: Môi Trường Thực Hành Kép — Dialect Translator SQLite ↔ PostgreSQL */
(function () {
  const pickerEl = document.getElementById('dialect-picker');
  if (!pickerEl) return;

  const sqliteCodeEl = document.getElementById('dialect-sqlite-code');
  const postgresCodeEl = document.getElementById('dialect-postgres-code');
  const explainEl = document.getElementById('dialect-explain');
  const jsCodeDisplay = document.getElementById('dialect-js-code-display');

  const DIALECT_ITEMS = [
    {
      label: 'Khoá chính tự tăng',
      sqlite: 'CREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  product_name TEXT NOT NULL\n);',
      postgres: 'CREATE TABLE products (\n  product_id SERIAL PRIMARY KEY,\n  product_name TEXT NOT NULL\n);',
      explain:
        'SQLite: INTEGER PRIMARY KEY tự động là alias của rowid nội bộ — tự tăng miễn phí, không tốn thêm object nào. PostgreSQL: SERIAL là "đường tắt cú pháp" tạo riêng 1 SEQUENCE + DEFAULT nextval(...) — xem callout đào sâu bên dưới.',
    },
    {
      label: 'Kiểu Boolean',
      sqlite: '-- SQLite không có BOOLEAN thật, dùng INTEGER 0/1\nSELECT * FROM customers WHERE is_active = 1;',
      postgres: '-- PostgreSQL có kiểu BOOLEAN thật\nSELECT * FROM customers WHERE is_active = TRUE;',
      explain:
        'SQLite lưu is_active dạng INTEGER (0 hoặc 1) vì không có storage class BOOLEAN riêng (xem lại type affinity ở Bài 1). PostgreSQL có kiểu BOOLEAN thật với giá trị TRUE/FALSE — code ứng dụng dùng chung cho cả 2 cần converter ở tầng driver.',
    },
    {
      label: 'Kiểu ngày giờ',
      sqlite:
        "-- Lưu dạng TEXT ISO-8601, dùng hàm date()/strftime()\nSELECT date(order_date, '+30 days')\nFROM orders;",
      postgres: "-- Kiểu DATE thật, dùng toán tử/hàm ngày chuẩn\nSELECT order_date + INTERVAL '30 days'\nFROM orders;",
      explain:
        'SQLite không có storage class DATE — order_date chỉ là TEXT, thao tác ngày qua hàm date()/strftime(). PostgreSQL có kiểu DATE/TIMESTAMP thật, hỗ trợ toán tử + INTERVAL trực tiếp và nhiều hàm chuyên biệt như EXTRACT(), to_char().',
    },
    {
      label: 'Bỏ qua nếu trùng khoá',
      sqlite: "INSERT OR IGNORE INTO customers\n  (customer_id, full_name)\nVALUES (1, 'Nguyễn Minh Anh');",
      postgres:
        "INSERT INTO customers (customer_id, full_name)\nVALUES (1, 'Nguyễn Minh Anh')\nON CONFLICT (customer_id) DO NOTHING;",
      explain:
        'SQLite hỗ trợ cú pháp rút gọn INSERT OR IGNORE (và INSERT OR REPLACE). PostgreSQL yêu cầu cú pháp ON CONFLICT (cột) DO NOTHING/DO UPDATE tường minh hơn — chuẩn SQL mới hơn mà SQLite bản gần đây cũng đã hỗ trợ song song.',
    },
    {
      label: 'Giới hạn độ dài chuỗi',
      sqlite:
        "-- VARCHAR(20) chỉ là gợi ý, KHÔNG kiểm tra độ dài thật\nCREATE TABLE t (code VARCHAR(5));\nINSERT INTO t VALUES ('this-is-way-too-long'); -- vẫn chạy OK",
      postgres:
        "-- VARCHAR(20) enforce đúng giới hạn ký tự\nCREATE TABLE t (code VARCHAR(5));\nINSERT INTO t VALUES ('this-is-way-too-long'); -- lỗi: value too long",
      explain:
        'Vì type affinity, SQLite hoàn toàn bỏ qua độ dài khai báo trong VARCHAR(n) — chỉ dùng nó để suy affinity TEXT, không kiểm tra số ký tự thật. PostgreSQL enforce giới hạn nghiêm ngặt, chèn chuỗi dài hơn sẽ báo lỗi ngay.',
    },
    {
      label: 'Phân trang chuẩn SQL mới',
      sqlite: '-- SQLite CHỈ hỗ trợ LIMIT/OFFSET\nSELECT * FROM products\nORDER BY product_id\nLIMIT 10 OFFSET 20;',
      postgres:
        '-- PostgreSQL hỗ trợ cả LIMIT/OFFSET lẫn cú pháp chuẩn SQL:2008\nSELECT * FROM products\nORDER BY product_id\nOFFSET 20 ROWS FETCH FIRST 10 ROWS ONLY;',
      explain:
        'FETCH FIRST n ROWS ONLY là cú pháp chuẩn SQL:2008 — PostgreSQL hỗ trợ song song với LIMIT/OFFSET quen thuộc. SQLite chỉ hỗ trợ LIMIT/OFFSET, không hiểu cú pháp FETCH FIRST.',
    },
    {
      label: 'Tìm kiếm mẫu nâng cao',
      sqlite:
        "-- GLOB: khớp mẫu kiểu Unix glob, PHÂN BIỆT hoa/thường\nSELECT * FROM products\nWHERE product_name GLOB 'USB*';",
      postgres:
        "-- Toán tử regex POSIX ~ / ~* (không phân biệt hoa/thường)\nSELECT * FROM products\nWHERE product_name ~* '^usb';",
      explain:
        'SQLite có thêm GLOB (cú pháp Unix glob *, ?, phân biệt hoa/thường) bên cạnh LIKE. PostgreSQL đi xa hơn với toán tử regex POSIX đầy đủ (~ phân biệt hoa/thường, ~* không phân biệt) — mạnh hơn nhiều so với GLOB/LIKE.',
    },
  ];

  function render(idx) {
    const item = DIALECT_ITEMS[idx];
    sqliteCodeEl.textContent = item.sqlite;
    postgresCodeEl.textContent = item.postgres;
    explainEl.textContent = item.explain;
    if (window.Prism) {
      Prism.highlightElement(sqliteCodeEl);
      Prism.highlightElement(postgresCodeEl);
    }
    [...pickerEl.children].forEach((btn, i) => btn.classList.toggle('is-active', i === idx));
  }

  function buildPicker() {
    DIALECT_ITEMS.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dialect-picker-btn' + (idx === 0 ? ' is-active' : '');
      btn.textContent = item.label;
      btn.addEventListener('click', () => render(idx));
      pickerEl.appendChild(btn);
    });
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🔄 BÀI 2: DIALECT TRANSLATOR */\n\n' +
      'const DIALECT_ITEMS = [\n' +
      '  { label: "...", sqlite: "...", postgres: "...", explain: "..." },\n' +
      '  // ' +
      DIALECT_ITEMS.length +
      ' mục khác biệt dialect\n' +
      '];\n\n' +
      'function render(idx) {\n' +
      '  sqlitePane.textContent = DIALECT_ITEMS[idx].sqlite;\n' +
      '  postgresPane.textContent = DIALECT_ITEMS[idx].postgres;\n' +
      '  explainPane.textContent = DIALECT_ITEMS[idx].explain;\n' +
      '  Prism.highlightElement(sqlitePane);\n' +
      '  Prism.highlightElement(postgresPane);\n}';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  buildPicker();
  render(0);
  updateJsCodeDisplay();
})();
