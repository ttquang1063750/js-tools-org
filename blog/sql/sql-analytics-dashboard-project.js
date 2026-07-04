/* Bài 17: Dự Án Mini Analytics Dashboard — SQL Workbench & Charts (sql.js) */
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

  const fileInput = document.getElementById('db-file-input');
  const exportBtn = document.getElementById('db-export-btn');
  const storageStatusEl = document.getElementById('db-storage-status');

  const chartBarSvg = document.getElementById('chart-bar');
  const chartLineSvg = document.getElementById('chart-line');

  // IndexedDB Config
  const DB_NAME = 'TechMartDashboardDB';
  const STORE_NAME = 'db_store';
  const DB_KEY = 'current_sqlite_db';

  const QUERY_MONTHLY_REVENUE = `-- 1. Tổng doanh thu theo tháng (Monthly Revenue)
SELECT strftime('%Y-%m', order_date) AS month_period,
       ROUND(SUM(total_amount), 2) AS revenue
FROM orders
WHERE status != 'cancelled'
GROUP BY month_period
ORDER BY month_period ASC;`;

  const QUERY_TOP_PRODUCTS = `-- 2. Top 5 sản phẩm bán chạy nhất (Top 5 Best Sellers)
SELECT p.product_name,
       SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY p.product_id
ORDER BY total_sold DESC
LIMIT 5;`;

  const QUERY_REVENUE_SHARE = `-- 3. Tỷ lệ doanh thu theo danh mục sản phẩm (Revenue Share by Category)
SELECT p.category,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS category_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status != 'cancelled'
GROUP BY p.category
ORDER BY category_revenue DESC;`;

  const EXAMPLES = [
    { label: '📊 Doanh Thu Theo Tháng', sql: QUERY_MONTHLY_REVENUE },
    { label: '🏆 Top 5 Sản Phẩm Bán Chạy', sql: QUERY_TOP_PRODUCTS },
    { label: '💼 Doanh Thu Theo Danh Mục', sql: QUERY_REVENUE_SHARE },
  ];

  let db = null;
  let idb = null;

  // Initialize IndexedDB
  function initIndexedDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const dbInstance = e.target.result;
        if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
          dbInstance.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => {
        idb = e.target.result;
        storageStatusEl.textContent = 'IndexedDB: Sẵn sàng 🟢';
        resolve();
      };
      request.onerror = () => {
        storageStatusEl.textContent = 'IndexedDB: Bị lỗi hoặc không được cấp quyền 🔴';
        resolve();
      };
    });
  }

  function saveDatabaseToStorage() {
    if (!idb || !db) return;
    try {
      const transaction = idb.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const binaryData = db.export();
      store.put(binaryData, DB_KEY);
      storageStatusEl.textContent = 'IndexedDB: Đã lưu tự động (Autosaved) 🟢';
    } catch (err) {
      storageStatusEl.textContent = 'IndexedDB: Lỗi lưu tự động — ' + err.message + ' 🔴';
    }
  }

  function loadDatabaseFromStorage() {
    return new Promise((resolve) => {
      if (!idb) {
        resolve(null);
        return;
      }
      const transaction = idb.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(DB_KEY);
      request.onsuccess = (e) => {
        resolve(e.target.result || null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  // Draw SVG Charts
  function updateCharts(labels, values) {
    if (!labels.length || !values.length) {
      drawEmptyCharts();
      return;
    }

    const maxVal = Math.max(...values, 1);

    // 1. Draw Bar Chart
    chartBarSvg.innerHTML = '';
    const barWidth = 40;
    const gap = 20;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const chartHeight = 200;

    // Draw Y Axis grid & labels
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal * i) / 4;
      const yPos = chartHeight - paddingBottom - (yVal / maxVal) * (chartHeight - paddingTop - paddingBottom);

      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', paddingLeft);
      gridLine.setAttribute('y1', yPos);
      gridLine.setAttribute('x2', 400 - paddingRight);
      gridLine.setAttribute('y2', yPos);
      gridLine.setAttribute('stroke', '#313244');
      gridLine.setAttribute('stroke-dasharray', '4 4');
      chartBarSvg.appendChild(gridLine);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', paddingLeft - 8);
      label.setAttribute('y', yPos + 4);
      label.setAttribute('fill', '#a6adc8');
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '10');
      label.textContent = yVal >= 1000 ? (yVal / 1000).toFixed(1) + 'k' : yVal.toFixed(0);
      chartBarSvg.appendChild(label);
    }

    labels.forEach((lbl, idx) => {
      const val = values[idx];
      const barH = (val / maxVal) * (chartHeight - paddingTop - paddingBottom);
      const x = paddingLeft + idx * (barWidth + gap);
      const y = chartHeight - paddingBottom - barH;

      // Draw Bar Rect
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barH);
      rect.setAttribute('fill', '#10b981');
      rect.setAttribute('rx', '4');
      chartBarSvg.appendChild(rect);

      // Draw X axis Label
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', x + barWidth / 2);
      txt.setAttribute('y', chartHeight - paddingBottom + 16);
      txt.setAttribute('fill', '#a6adc8');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '9');
      // Truncate labels if too long
      const displayLabel = lbl.length > 8 ? lbl.substring(0, 7) + '..' : lbl;
      txt.textContent = displayLabel;
      chartBarSvg.appendChild(txt);

      // Draw value tooltip label on top of bar
      const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valTxt.setAttribute('x', x + barWidth / 2);
      valTxt.setAttribute('y', y - 4);
      valTxt.setAttribute('fill', '#fff');
      valTxt.setAttribute('text-anchor', 'middle');
      valTxt.setAttribute('font-size', '9');
      valTxt.textContent = val.toFixed(0);
      chartBarSvg.appendChild(valTxt);
    });

    // 2. Draw Line Chart
    chartLineSvg.innerHTML = '';
    const points = [];
    const stepX = (400 - paddingLeft - paddingRight) / Math.max(labels.length - 1, 1);

    // Draw Y Axis grid & labels
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal * i) / 4;
      const yPos = chartHeight - paddingBottom - (yVal / maxVal) * (chartHeight - paddingTop - paddingBottom);

      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', paddingLeft);
      gridLine.setAttribute('y1', yPos);
      gridLine.setAttribute('x2', 400 - paddingRight);
      gridLine.setAttribute('y2', yPos);
      gridLine.setAttribute('stroke', '#313244');
      gridLine.setAttribute('stroke-dasharray', '4 4');
      chartLineSvg.appendChild(gridLine);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', paddingLeft - 8);
      label.setAttribute('y', yPos + 4);
      label.setAttribute('fill', '#a6adc8');
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '10');
      label.textContent = yVal >= 1000 ? (yVal / 1000).toFixed(1) + 'k' : yVal.toFixed(0);
      chartLineSvg.appendChild(label);
    }

    labels.forEach((lbl, idx) => {
      const val = values[idx];
      const h = (val / maxVal) * (chartHeight - paddingTop - paddingBottom);
      const x = paddingLeft + idx * stepX;
      const y = chartHeight - paddingBottom - h;
      points.push(`${x},${y}`);

      // Draw dot
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#f5e0dc');
      chartLineSvg.appendChild(circle);

      // Draw value tooltip label
      const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valTxt.setAttribute('x', x);
      valTxt.setAttribute('y', y - 8);
      valTxt.setAttribute('fill', '#fff');
      valTxt.setAttribute('text-anchor', 'middle');
      valTxt.setAttribute('font-size', '9');
      valTxt.textContent = val.toFixed(0);
      chartLineSvg.appendChild(valTxt);

      // Draw X axis Label
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', x);
      txt.setAttribute('y', chartHeight - paddingBottom + 16);
      txt.setAttribute('fill', '#a6adc8');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '9');
      txt.textContent = lbl.length > 8 ? lbl.substring(0, 7) + '..' : lbl;
      chartLineSvg.appendChild(txt);
    });

    // Draw connecting line path
    if (points.length > 1) {
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('fill', 'none');
      polyline.setAttribute('stroke', '#f38ba8');
      polyline.setAttribute('stroke-width', '3');
      polyline.setAttribute('points', points.join(' '));
      chartLineSvg.insertBefore(polyline, chartLineSvg.firstChild);
    }
  }

  function drawEmptyCharts() {
    chartBarSvg.innerHTML =
      '<text x="200" y="100" fill="#6c7086" text-anchor="middle" font-size="12">Vui lòng chạy truy vấn phân tích để hiển thị biểu đồ...</text>';
    chartLineSvg.innerHTML =
      '<text x="200" y="100" fill="#6c7086" text-anchor="middle" font-size="12">Vui lòng chạy truy vấn phân tích để hiển thị biểu đồ...</text>';
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
      drawEmptyCharts();
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

    // Auto-parse numeric columns for SVG charts mapping
    if (values.length > 0) {
      const labels = [];
      const chartValues = [];
      values.forEach((row) => {
        labels.push(String(row[0]));
        chartValues.push(Number(row[1]) || 0);
      });
      updateCharts(labels.slice(0, 6), chartValues.slice(0, 6)); // Limit chart data to top 6 elements for neat styling
    } else {
      drawEmptyCharts();
    }
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
      empty.textContent = 'Lỗi cú pháp SQL: ' + err.message;
      resultsEl.appendChild(empty);
      setStatus('Lỗi thực thi SQL.', true);
      drawEmptyCharts();
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const elapsed = performance.now() - start;
    renderResults(result, elapsed);
    renderSchema();

    // Autosave DB to IndexedDB if it was a modification query (not beginning with SELECT, PRAGMA or EXPLAIN)
    const isModification = !/^(select|pragma|explain)/i.test(trimmed);
    if (isModification) {
      saveDatabaseToStorage();
    }

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
        runQuery(ex.sql);
      });
      examplesEl.appendChild(btn);
    });
  }

  // Handle Export File
  exportBtn.addEventListener('click', () => {
    if (!db) return;
    try {
      const binaryData = db.export();
      const blob = new Blob([binaryData], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'techmart_analytics.sqlite';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Đã xuất file database techmart_analytics.sqlite về máy.', false);
    } catch (err) {
      setStatus('Lỗi xuất file: ' + err.message, true);
    }
  });

  // Handle Import File
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const SQL = await initSqlJs({ locateFile: (file) => 'vendor/' + file });
        db = new SQL.Database(new Uint8Array(reader.result));
        resultsEl.innerHTML = '<div class="sql-results-empty">Đã nạp file cơ sở dữ liệu mới tải lên thành công!</div>';
        renderSchema();
        saveDatabaseToStorage();
        setStatus('Đã nạp file cơ sở dữ liệu từ máy thành công.', false);
        drawEmptyCharts();
      } catch (err) {
        setStatus('Lỗi nạp file database nhị phân: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  });

  async function init() {
    buildExampleButtons();
    setStatus('Đang khởi chạy IndexedDB...', false);
    await initIndexedDB();

    setStatus('Đang tải SQLite-WASM engine...', false);
    try {
      const SQL = await initSqlJs({ locateFile: (file) => 'vendor/' + file });

      // Try loading previous state from IndexedDB first
      const storedData = await loadDatabaseFromStorage();
      if (storedData) {
        db = new SQL.Database(new Uint8Array(storedData));
        setStatus('Đã phục hồi trạng thái database lưu trữ từ IndexedDB.', false);
      } else {
        const seedResponse = await fetch('sql-techmart-seed.sql');
        const seedSql = await seedResponse.text();
        db = new SQL.Database();
        db.run(seedSql);
        setStatus('Khởi tạo database TechMart mẫu mặc định.', false);
      }

      editor.value = EXAMPLES[0].sql;
      renderSchema();
      runQuery(EXAMPLES[0].sql); // Run the first analytics dashboard query by default
    } catch (err) {
      setStatus('Không khởi tạo được engine: ' + err.message, true);
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
      resultsEl.innerHTML = '<div class="sql-results-empty">Đã reset — phục hồi dữ liệu ban đầu.</div>';
      renderSchema();
      saveDatabaseToStorage();
      setStatus('Đã khôi phục dữ liệu TechMart mẫu mặc định và đồng bộ IndexedDB.', false);
      runQuery(EXAMPLES[0].sql);
    });
  });

  init();
})();
