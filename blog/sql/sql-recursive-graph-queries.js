/* Bài 6: Graph Queries Bằng CTE Đệ Quy — SQL Workbench thật (sql.js) trên mạng lưới chuyến bay tự tạo trong phiên làm việc */
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

  const FLIGHT_SEED = `-- Mạng lưới chuyến bay: 9 sân bay, 21 chuyến bay 1 chiều (edge list có hướng, có trọng số).
-- Bảng bonus riêng cho bài này, tạo ngay trong phiên làm việc — không phải 1 phần của dataset TechMart.
CREATE TABLE airports (
  airport_code TEXT PRIMARY KEY,
  airport_name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE routes (
  route_id INTEGER PRIMARY KEY,
  origin_code TEXT,
  dest_code TEXT,
  airline TEXT,
  price REAL,
  duration_min INTEGER
);

INSERT INTO airports (airport_code, airport_name, city) VALUES
  ('SGN', 'Tan Son Nhat', 'TP.HCM'),
  ('HAN', 'Noi Bai', 'Ha Noi'),
  ('DAD', 'Da Nang', 'Da Nang'),
  ('CXR', 'Cam Ranh', 'Nha Trang'),
  ('PQC', 'Phu Quoc', 'Phu Quoc'),
  ('HPH', 'Cat Bi', 'Hai Phong'),
  ('BKK', 'Suvarnabhumi', 'Bangkok'),
  ('SIN', 'Changi', 'Singapore'),
  ('DXB', 'Dubai Intl', 'Dubai');

INSERT INTO routes (origin_code, dest_code, airline, price, duration_min) VALUES
  ('SGN', 'HAN', 'VietnamAirlines', 80, 120), ('HAN', 'SGN', 'VietnamAirlines', 80, 120),
  ('SGN', 'DAD', 'Vietjet', 50, 70), ('DAD', 'SGN', 'Vietjet', 50, 70),
  ('SGN', 'CXR', 'Vietjet', 40, 60), ('CXR', 'SGN', 'Vietjet', 40, 60),
  ('HAN', 'DAD', 'Bamboo', 45, 65), ('DAD', 'HAN', 'Bamboo', 45, 65),
  ('DAD', 'CXR', 'Vietjet', 35, 50), ('CXR', 'DAD', 'Vietjet', 35, 50),
  ('SGN', 'PQC', 'VietnamAirlines', 45, 55), ('PQC', 'SGN', 'VietnamAirlines', 45, 55),
  ('HAN', 'HPH', 'Bamboo', 30, 40), ('HPH', 'HAN', 'Bamboo', 30, 40),
  ('SGN', 'BKK', 'ThaiAirways', 90, 130), ('BKK', 'SGN', 'ThaiAirways', 90, 130),
  ('BKK', 'SIN', 'SingaporeAir', 70, 100), ('SIN', 'BKK', 'SingaporeAir', 70, 100),
  ('SGN', 'SIN', 'SingaporeAir', 100, 140),
  ('HAN', 'BKK', 'ThaiAirways', 110, 150),
  ('SGN', 'DXB', 'Emirates', 300, 480);
`;

  const EXAMPLES = [
    {
      label: 'Xem toàn bộ chuyến bay',
      sql: 'SELECT * FROM routes;',
    },
    {
      label: 'Transitive closure từ CXR',
      sql: "WITH RECURSIVE reachable(start_code, current_code, path, hops) AS (\n  SELECT origin_code, dest_code, origin_code || '->' || dest_code, 1\n  FROM routes WHERE origin_code = 'CXR'\n\n  UNION ALL\n\n  SELECT re.start_code, r.dest_code, re.path || '->' || r.dest_code, re.hops + 1\n  FROM routes r\n  INNER JOIN reachable re ON r.origin_code = re.current_code\n  WHERE instr(re.path, r.dest_code) = 0\n)\nSELECT current_code, MIN(hops) AS min_hops\nFROM reachable\nGROUP BY current_code\nORDER BY min_hops;",
    },
    {
      label: 'DXB không tới được đâu (0 hàng)',
      sql: "WITH RECURSIVE reachable(start_code, current_code, path, hops) AS (\n  SELECT origin_code, dest_code, origin_code || '->' || dest_code, 1\n  FROM routes WHERE origin_code = 'DXB'\n\n  UNION ALL\n\n  SELECT re.start_code, r.dest_code, re.path || '->' || r.dest_code, re.hops + 1\n  FROM routes r\n  INNER JOIN reachable re ON r.origin_code = re.current_code\n  WHERE instr(re.path, r.dest_code) = 0\n)\nSELECT current_code, MIN(hops) AS min_hops FROM reachable GROUP BY current_code ORDER BY min_hops;",
    },
    {
      label: 'Đường rẻ nhất SGN → SIN',
      sql: "WITH RECURSIVE route_search(current_code, path, total_price, hops) AS (\n  SELECT dest_code, origin_code || ' -> ' || dest_code, price, 1\n  FROM routes WHERE origin_code = 'SGN'\n\n  UNION ALL\n\n  SELECT r.dest_code, rs.path || ' -> ' || r.dest_code, rs.total_price + r.price, rs.hops + 1\n  FROM routes r\n  INNER JOIN route_search rs ON r.origin_code = rs.current_code\n  WHERE instr(rs.path, r.dest_code) = 0 AND rs.hops < 4\n)\nSELECT path, total_price, hops\nFROM route_search\nWHERE current_code = 'SIN'\nORDER BY total_price\nLIMIT 5;",
    },
    {
      label: 'Phát hiện chu trình (≤ 3 chặng)',
      sql: "WITH RECURSIVE cycle_search(start_code, current_code, path, total_price, hops) AS (\n  SELECT origin_code, dest_code, origin_code || '->' || dest_code, price, 1\n  FROM routes\n\n  UNION ALL\n\n  SELECT cs.start_code, r.dest_code, cs.path || '->' || r.dest_code, cs.total_price + r.price, cs.hops + 1\n  FROM routes r\n  INNER JOIN cycle_search cs ON r.origin_code = cs.current_code\n  WHERE cs.hops < 6 AND cs.current_code != cs.start_code\n)\nSELECT DISTINCT start_code, path, total_price, hops\nFROM cycle_search\nWHERE current_code = start_code AND hops = 3\nORDER BY start_code\nLIMIT 10;",
    },
    {
      label: '⚠️ Cạm bẫy: bỏ điều kiện chặn (KHÔNG chạy — sẽ treo trình duyệt)',
      sql: "-- CẢNH BÁO: đừng thật sự chạy câu này — thiếu điều kiện chặn quay lại\n-- (instr(path, dest_code) = 0) khiến CTE đệ quy chạy VÔ HẠN vì đồ thị\n-- có chu trình (SGN->DAD->HAN->SGN...). Đây chỉ để đọc, không để chạy.\n--\n-- WITH RECURSIVE reachable(current_code, hops) AS (\n--   SELECT dest_code, 1 FROM routes WHERE origin_code = 'CXR'\n--   UNION ALL\n--   SELECT r.dest_code, re.hops + 1\n--   FROM routes r JOIN reachable re ON r.origin_code = re.current_code\n--   -- THIẾU điều kiện chặn ở đây!\n-- )\n-- SELECT * FROM reachable;",
    },
  ];

  let db = null;
  let SQL = null;

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
      SQL = await initSqlJs({ locateFile: (file) => 'vendor/' + file });
      if (seedDisplay) {
        seedDisplay.textContent = FLIGHT_SEED;
        if (window.Prism) window.Prism.highlightElement(seedDisplay);
      }
      db = new SQL.Database();
      db.run(FLIGHT_SEED);
      editor.value = EXAMPLES[1].sql;
      setStatus('Sẵn sàng — mạng lưới chuyến bay đã nạp (9 sân bay, 21 chuyến bay).', false);
      runQuery(EXAMPLES[1].sql);
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
    if (!db || !SQL) return;
    db.close();
    db = new SQL.Database();
    db.run(FLIGHT_SEED);
    resultsEl.innerHTML = '<div class="sql-results-empty">Kết quả sẽ hiện ở đây sau khi chạy query...</div>';
    setStatus('Đã reset dữ liệu về trạng thái ban đầu.', false);
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 6: GRAPH QUERIES BẰNG CTE ĐỆ QUY */\n\n' +
      "const SQL = await initSqlJs({ locateFile: (f) => 'vendor/' + f });\n" +
      'const db = new SQL.Database();\n' +
      'db.run(flightNetworkSeed); // 9 sân bay, 21 chuyến bay có hướng\n\n' +
      '// An toàn trên đồ thị CÓ CHU TRÌNH — bắt buộc chặn quay lại:\n' +
      'db.exec(`\n' +
      '  WITH RECURSIVE reachable(current_code, path, hops) AS (\n' +
      "    SELECT dest_code, origin_code || '->' || dest_code, 1\n" +
      "    FROM routes WHERE origin_code = 'CXR'\n" +
      '    UNION ALL\n' +
      "    SELECT r.dest_code, re.path || '->' || r.dest_code, re.hops + 1\n" +
      '    FROM routes r JOIN reachable re ON r.origin_code = re.current_code\n' +
      '    WHERE instr(re.path, r.dest_code) = 0  -- KHÔNG được bỏ dòng này\n' +
      '  ) SELECT * FROM reachable;\n' +
      '`);';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
