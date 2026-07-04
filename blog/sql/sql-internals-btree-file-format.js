/* Bài 10: SQLite Internals — SQL Workbench (sql.js) + Page/Byte Explorer đọc thật bytes của file .sqlite export ra từ trình duyệt */
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

  const pageInput = document.getElementById('page-explorer-input');
  const analyzeBtn = document.getElementById('page-explorer-btn');
  const explorerOutput = document.getElementById('page-explorer-output');

  const CREATE_DEMO_ORDERS = `CREATE TABLE demo_orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT,
  status TEXT,
  total_amount REAL
);

WITH RECURSIVE seq(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM seq WHERE x < 2000
)
INSERT INTO demo_orders
SELECT
  x,
  1 + (abs(random()) % 500),
  date('2024-01-01', '+' || (abs(random()) % 700) || ' days'),
  CASE abs(random()) % 5
    WHEN 0 THEN 'delivered' WHEN 1 THEN 'shipped' WHEN 2 THEN 'cancelled'
    WHEN 3 THEN 'refunded' ELSE 'pending' END,
  ROUND(10 + (abs(random()) % 40000) / 100.0, 2)
FROM seq;`;

  const CREATE_DEMO_OVERFLOW =
    'CREATE TABLE demo_overflow (id INTEGER PRIMARY KEY, content TEXT);\n' +
    'INSERT INTO demo_overflow VALUES (1, hex(randomblob(3000))); -- chuỗi TEXT dài 6.000 ký tự';

  const EXAMPLES = [
    { label: '1️⃣ Xem rootpage của từng bảng (sqlite_master)', sql: 'SELECT name, type, rootpage FROM sqlite_master;' },
    { label: '2️⃣ PRAGMA page_count (số trang hiện có)', sql: 'PRAGMA page_count;' },
    { label: '3️⃣ Tạo demo_orders (2.000 dòng, ép sinh interior page)', sql: CREATE_DEMO_ORDERS },
    {
      label: '3️⃣a Xem rootpage + page_count sau khi tạo',
      sql: "SELECT name, rootpage FROM sqlite_master WHERE name = 'demo_orders';",
    },
    { label: '4️⃣ Tạo demo_overflow + chèn giá trị 6.000 ký tự (ép overflow)', sql: CREATE_DEMO_OVERFLOW },
    { label: '4️⃣a Xem page_count sau khi chèn overflow', sql: 'PRAGMA page_count;' },
    { label: '5️⃣ Xoá demo_orders (ép sinh freelist)', sql: 'DROP TABLE demo_orders;' },
    { label: '5️⃣a Xem freelist_count (số trang đã xoá còn tái dùng được)', sql: 'PRAGMA freelist_count;' },
    { label: '5️⃣b Xem page_count (KHÔNG giảm dù đã DROP)', sql: 'PRAGMA page_count;' },
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

  /* ---------- Page / Byte Explorer: đọc thật bytes từ db.export() ---------- */

  function readVarint(bytes, offset) {
    let result = 0n;
    let length = 0;
    for (let i = 0; i < 9; i++) {
      const b = bytes[offset + i];
      length++;
      if (i === 8) {
        result = (result << 8n) | BigInt(b);
        break;
      }
      result = (result << 7n) | BigInt(b & 0x7f);
      if ((b & 0x80) === 0) break;
    }
    return { value: result, length };
  }

  function decodeSerialValue(bytes, dv, serialType, pos) {
    if (serialType === 0) return { value: null, len: 0 };
    if (serialType === 1) return { value: dv.getInt8(pos), len: 1 };
    if (serialType === 2) return { value: dv.getInt16(pos), len: 2 };
    if (serialType === 3) {
      const b0 = bytes[pos],
        b1 = bytes[pos + 1],
        b2 = bytes[pos + 2];
      let v = (b0 << 16) | (b1 << 8) | b2;
      if (b0 & 0x80) v -= 0x1000000;
      return { value: v, len: 3 };
    }
    if (serialType === 4) return { value: dv.getInt32(pos), len: 4 };
    if (serialType === 5) {
      const hi = dv.getInt16(pos),
        lo = dv.getUint32(pos + 2);
      return { value: hi * 2 ** 32 + lo, len: 6 };
    }
    if (serialType === 6) return { value: Number(dv.getBigInt64(pos)), len: 8 };
    if (serialType === 7) return { value: dv.getFloat64(pos), len: 8 };
    if (serialType === 8) return { value: 0, len: 0 };
    if (serialType === 9) return { value: 1, len: 0 };
    if (serialType >= 12 && serialType % 2 === 0) {
      const len = (serialType - 12) / 2;
      return { value: 'BLOB(' + len + ' bytes)', len };
    }
    if (serialType >= 13 && serialType % 2 === 1) {
      const len = (serialType - 13) / 2;
      return { value: new TextDecoder().decode(bytes.slice(pos, pos + len)), len };
    }
    return { value: '(serial type ' + serialType + ' không xử lý)', len: 0 };
  }

  function parseHeader(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const magic = new TextDecoder().decode(bytes.slice(0, 15));
    let pageSize = dv.getUint16(16);
    if (pageSize === 1) pageSize = 65536;
    return {
      pageSize,
      fields: [
        ['0-15', 'Magic string', magic],
        ['16-17', 'Page size (byte)', String(pageSize)],
        ['18', 'File format write version', String(bytes[18])],
        ['19', 'File format read version', String(bytes[19])],
        ['20', 'Reserved space cuối mỗi trang', String(bytes[20]) + ' byte'],
        ['21-23', 'Max/min/leaf payload fraction', bytes[21] + ' / ' + bytes[22] + ' / ' + bytes[23]],
        ['24-27', 'File change counter', String(dv.getUint32(24))],
        ['28-31', 'Kích thước DB (số trang)', String(dv.getUint32(28))],
        [
          '32-35',
          'Trang freelist-trunk đầu tiên',
          String(dv.getUint32(32)) + (dv.getUint32(32) === 0 ? ' (chưa có trang free nào)' : ''),
        ],
        ['36-39', 'Tổng số trang trong freelist', String(dv.getUint32(36))],
        ['40-43', 'Schema cookie', String(dv.getUint32(40))],
        ['44-47', 'Schema format number', String(dv.getUint32(44))],
        [
          '56-59',
          'Text encoding',
          { 1: 'UTF-8', 2: 'UTF-16LE', 3: 'UTF-16BE' }[dv.getUint32(56)] || String(dv.getUint32(56)),
        ],
        [
          '96-99',
          'SQLite version number',
          String(dv.getUint32(96)) + ' (= ' + formatSqliteVersion(dv.getUint32(96)) + ')',
        ],
      ],
    };
  }

  function formatSqliteVersion(n) {
    const z = n % 1000;
    const y = Math.floor(n / 1000) % 1000;
    const x = Math.floor(n / 1000000);
    return x + '.' + y + '.' + z;
  }

  function hexDump(bytes, start, length) {
    const lines = [];
    for (let row = 0; row < length; row += 16) {
      const offset = start + row;
      let hex = '';
      let ascii = '';
      for (let col = 0; col < 16; col++) {
        if (row + col >= length) {
          hex += '   ';
          continue;
        }
        const b = bytes[offset + col];
        hex += b.toString(16).padStart(2, '0') + ' ';
        ascii += b >= 32 && b < 127 ? String.fromCharCode(b) : '.';
      }
      lines.push(offset.toString().padStart(6, '0') + '  ' + hex + ' ' + ascii);
    }
    return lines.join('\n');
  }

  function parsePage(bytes, pageNum, pageSize) {
    const pageStart = (pageNum - 1) * pageSize;
    const isPage1 = pageNum === 1;
    const btreeHeaderStart = pageStart + (isPage1 ? 100 : 0);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const type = bytes[btreeHeaderStart];
    const typeNames = {
      0x02: 'Interior index b-tree',
      0x05: 'Interior table b-tree',
      0x0a: 'Leaf index b-tree',
      0x0d: 'Leaf table b-tree',
    };
    const firstFreeblock = dv.getUint16(btreeHeaderStart + 1);
    const numCells = dv.getUint16(btreeHeaderStart + 3);
    let cellContentStart = dv.getUint16(btreeHeaderStart + 5);
    if (cellContentStart === 0) cellContentStart = 65536;
    const fragmentedFreeBytes = bytes[btreeHeaderStart + 7];
    const isInterior = type === 0x02 || type === 0x05;
    const headerSize = isInterior ? 12 : 8;
    const rightMostPointer = isInterior ? dv.getUint32(btreeHeaderStart + 8) : null;

    const cellPointers = [];
    for (let i = 0; i < numCells; i++) {
      const ptrOffset = btreeHeaderStart + headerSize + i * 2;
      cellPointers.push(dv.getUint16(ptrOffset));
    }

    let firstRecord = null;
    if (type === 0x0d && numCells > 0) {
      let pos = pageStart + cellPointers[0];
      const payloadLen = readVarint(bytes, pos);
      pos += payloadLen.length;
      const rowid = readVarint(bytes, pos);
      pos += rowid.length;
      const recordStart = pos;
      const hdrLen = readVarint(bytes, pos);
      const headerLenValue = Number(hdrLen.value);
      let hpos = pos + hdrLen.length;
      const serialTypes = [];
      while (hpos < recordStart + headerLenValue) {
        const st = readVarint(bytes, hpos);
        serialTypes.push(Number(st.value));
        hpos += st.length;
      }
      let bodyPos = recordStart + headerLenValue;
      const values = [];
      for (const st of serialTypes) {
        const decoded = decodeSerialValue(bytes, dv, st, bodyPos);
        values.push({ serialType: st, value: decoded.value });
        bodyPos += decoded.len;
      }
      firstRecord = {
        payloadLen: Number(payloadLen.value),
        rowid: Number(rowid.value),
        headerLenValue,
        serialTypes,
        values,
      };
    }

    let firstInteriorCells = null;
    if (isInterior && numCells > 0) {
      firstInteriorCells = [];
      for (let i = 0; i < Math.min(5, numCells); i++) {
        const cellOffset = pageStart + cellPointers[i];
        const leftChild = dv.getUint32(cellOffset);
        const key = readVarint(bytes, cellOffset + 4);
        firstInteriorCells.push({ leftChildPage: leftChild, key: Number(key.value) });
      }
    }

    return {
      pageNum,
      type,
      typeName: typeNames[type] || 'Không rõ (0x' + type.toString(16) + ')',
      firstFreeblock,
      numCells,
      cellContentStart,
      fragmentedFreeBytes,
      rightMostPointer,
      cellPointers,
      firstRecord,
      firstInteriorCells,
    };
  }

  function renderExplorer(pageNum) {
    if (!db) {
      explorerOutput.innerHTML = '<div class="sql-results-empty">Engine chưa sẵn sàng.</div>';
      return;
    }
    const bytes = db.export();
    const pageSize = parseHeader(bytes).pageSize;
    const totalPages = Math.floor(bytes.length / pageSize);
    if (pageNum < 1 || pageNum > totalPages) {
      explorerOutput.innerHTML =
        '<div class="sql-results-empty">Trang không hợp lệ — file hiện có ' +
        totalPages +
        ' trang (1-' +
        totalPages +
        ').</div>';
      return;
    }

    const page = parsePage(bytes, pageNum, pageSize);
    let html = '';

    if (pageNum === 1) {
      const header = parseHeader(bytes);
      html +=
        '<h4>📋 Header 100 byte (đầu file)</h4><table class="comparison-table"><thead><tr><th>Offset</th><th>Trường</th><th>Giá trị</th></tr></thead><tbody>';
      header.fields.forEach((f) => {
        html += '<tr><td>' + f[0] + '</td><td>' + f[1] + '</td><td>' + f[2] + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    html +=
      '<h4>🗂️ Trang ' +
      pageNum +
      ' — B-Tree Page Header' +
      (pageNum === 1 ? ' (bắt đầu ngay sau 100 byte header ở trên)' : '') +
      '</h4>';
    html += '<table class="comparison-table"><tbody>';
    html +=
      '<tr><td>Loại trang</td><td>0x' + page.type.toString(16).padStart(2, '0') + ' — ' + page.typeName + '</td></tr>';
    html += '<tr><td>Số cell (số hàng/con trỏ)</td><td>' + page.numCells + '</td></tr>';
    html += '<tr><td>Vị trí bắt đầu vùng nội dung cell</td><td>' + page.cellContentStart + '</td></tr>';
    html += '<tr><td>Byte phân mảnh chưa dùng</td><td>' + page.fragmentedFreeBytes + '</td></tr>';
    if (page.rightMostPointer !== null) {
      html += '<tr><td>Con trỏ phải cùng (right-most pointer)</td><td>Trang ' + page.rightMostPointer + '</td></tr>';
    }
    html += '</tbody></table>';

    if (page.firstInteriorCells) {
      html +=
        '<p style="font-size:13px;color:#a6adc8">5 cell đầu (mỗi cell = con trỏ trang con trái + khoá rowid lớn nhất trong nhánh đó):</p>';
      html +=
        '<table class="comparison-table"><thead><tr><th>Khoá (rowid)</th><th>Trang con trái</th></tr></thead><tbody>';
      page.firstInteriorCells.forEach((c) => {
        html += '<tr><td>≤ ' + c.key + '</td><td>Trang ' + c.leftChildPage + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    if (page.firstRecord) {
      html += '<h4>🔬 Record đầu tiên (rowid = ' + page.firstRecord.rowid + ') — giải mã varint thật</h4>';
      html +=
        '<p style="font-size:13px;color:#a6adc8">Payload dài ' +
        page.firstRecord.payloadLen +
        ' byte, header record dài ' +
        page.firstRecord.headerLenValue +
        ' byte, ' +
        page.firstRecord.serialTypes.length +
        ' serial type:</p>';
      html +=
        '<table class="comparison-table"><thead><tr><th>Serial type</th><th>Giá trị giải mã</th></tr></thead><tbody>';
      page.firstRecord.values.forEach((v) => {
        html +=
          '<tr><td>' +
          v.serialType +
          '</td><td>' +
          (v.value === null ? '<em>NULL</em>' : String(v.value)) +
          '</td></tr>';
      });
      html += '</tbody></table>';
    }

    const dumpStart = pageNum === 1 ? 0 : (pageNum - 1) * pageSize;
    html += '<h4>🔢 Hex dump (128 byte đầu trang)</h4>';
    html += '<pre class="hex-dump">' + hexDump(bytes, dumpStart, Math.min(128, pageSize)) + '</pre>';

    explorerOutput.innerHTML = html;
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
      setStatus('Sẵn sàng — dataset TechMart đã nạp. Dùng ô "Phân tích trang" bên dưới để xem bytes thật.', false);
      renderExplorer(1);
    } catch (err) {
      setStatus('Không tải được engine: ' + err.message, true);
    }
  }

  runBtn.addEventListener('click', () => {
    runQuery(editor.value);
  });
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
      setStatus('Đã reset dữ liệu về trạng thái ban đầu (chỉ có TechMart).', false);
      renderExplorer(1);
    });
  });
  analyzeBtn.addEventListener('click', () => {
    const n = parseInt(pageInput.value, 10) || 1;
    renderExplorer(n);
  });

  function updateJsCodeDisplay() {
    const code =
      '/* 🗄️ BÀI 10: SQLITE INTERNALS — PAGE/BYTE EXPLORER */\n\n' +
      'const bytes = db.export(); // Uint8Array — đúng bytes thật của file .sqlite\n' +
      'const dv = new DataView(bytes.buffer);\n\n' +
      '// Header 100 byte đầu file:\n' +
      "const magic = new TextDecoder().decode(bytes.slice(0, 15)); // 'SQLite format 3'\n" +
      'const pageSize = dv.getUint16(16); // thường là 4096\n\n' +
      '// B-Tree page header (page 1: offset +100, các trang khác: offset +0):\n' +
      'const pageType = bytes[pageStart]; // 0x0d = leaf table, 0x05 = interior table\n' +
      'const numCells = dv.getUint16(pageStart + 3);\n\n' +
      '// Giải mã varint (7 bit/byte, bit cao = còn tiếp):\n' +
      'function readVarint(bytes, offset) { /* ... */ }';
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  updateJsCodeDisplay();
  init();
})();
