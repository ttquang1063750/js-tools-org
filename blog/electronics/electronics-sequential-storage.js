document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-digi-mode');

  const groupDff = document.getElementById('group-dff-controls');
  const groupSram = document.getElementById('group-sram-controls');
  const tableBox = document.getElementById('table-box');

  const btnDffD = document.getElementById('btn-dff-d');
  const btnDffClk = document.getElementById('btn-dff-clk');
  const valDffClkState = document.getElementById('val-dff-clk-state');
  const valDffQ = document.getElementById('val-dff-q-output');

  const btnSramModeWrite = document.getElementById('btn-sram-mode-write');
  const btnSramModeRead = document.getElementById('btn-sram-mode-read');
  const btnSramWl = document.getElementById('btn-sram-wl');
  const btnSramBl = document.getElementById('btn-sram-bl');
  const btnSramBlb = document.getElementById('btn-sram-blb');

  const valSramQ = document.getElementById('val-sram-q');
  const valSramReadOut = document.getElementById('val-sram-read-output');

  const svgComponents = document.getElementById('digi-svg-components');
  const tableTruth = document.getElementById('truth-table');

  // State
  let mode = selectMode.value;

  // DFF state
  let dffD = 0;
  let dffClk = 0;
  let dffQ = 0;
  let dffQprev = 0;

  // SRAM state
  let sramMode = 'write'; // 'write' or 'read'
  let sramWl = 0;
  let sramBl = 0;
  let sramQ = 0;

  // Toggle DFF Input D styling
  function updateDffDButton(btn, value) {
    if (value === 1) {
      btn.textContent = 'HIGH (1)';
      btn.style.background = '#fab387'; // Orange/yellow for HIGH
      btn.style.color = '#11111b';
    } else {
      btn.textContent = 'LOW (0)';
      btn.style.background = '#313244'; // Dark gray for LOW
      btn.style.color = '#fab387';
    }
  }

  // Toggle SRAM WL styling
  function updateSramWlButton(btn, value) {
    if (value === 1) {
      btn.textContent = 'HIGH (1 - Mở)';
      btn.style.background = '#fab387';
      btn.style.color = '#11111b';
    } else {
      btn.textContent = 'LOW (0 - Khóa)';
      btn.style.background = '#313244';
      btn.style.color = '#fab387';
    }
  }

  // Toggle SRAM BL styling
  function updateSramBlButton(btn, value) {
    if (value === 1) {
      btn.textContent = '1';
      btn.style.background = '#89b4fa';
      btn.style.color = '#11111b';
      btnSramBlb.textContent = '0';
      btnSramBlb.style.background = '#313244';
      btnSramBlb.style.color = '#89b4fa';
    } else {
      btn.textContent = '0';
      btn.style.background = '#313244';
      btn.style.color = '#89b4fa';
      btnSramBlb.textContent = '1';
      btnSramBlb.style.background = '#89b4fa';
      btnSramBlb.style.color = '#11111b';
    }
  }

  // Update SRAM Mode buttons
  function updateSramModeButtons() {
    if (sramMode === 'write') {
      btnSramModeWrite.style.background = '#a6e3a1';
      btnSramModeWrite.style.color = '#11111b';
      btnSramModeRead.style.background = '#313244';
      btnSramModeRead.style.color = '#89b4fa';
      btnSramBl.disabled = false;
    } else {
      btnSramModeWrite.style.background = '#313244';
      btnSramModeWrite.style.color = '#a6e3a1';
      btnSramModeRead.style.background = '#89b4fa';
      btnSramModeRead.style.color = '#11111b';
      btnSramBl.disabled = true; // In Read Mode, BL floats based on cell
    }
  }

  // Draw DFF SVG
  function drawDffSVG(d, clk, q) {
    let s = '';

    const colorD = d ? '#f38ba8' : '#313244';
    const colorClk = clk ? '#fab387' : '#313244';
    const colorQ = q ? '#a6e3a1' : '#313244';
    const colorQbar = q ? '#313244' : '#a6e3a1';

    // Draw D-FF Frame (x=140, y=30, w=80, h=100)
    s += '<rect x="140" y="30" width="80" height="100" rx="4" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
    s += '<text x="180" y="85" fill="#89b4fa" font-size="12" font-family="monospace" text-anchor="middle">D-FF</text>';

    // Input wire D (x=40 to 140, y=55)
    s += `<line x1="40" y1="55" x2="140" y2="55" stroke="${colorD}" stroke-width="3" />`;
    s += `<text x="50" y="47" fill="${colorD}" font-size="9" font-weight="bold">D = ${d}</text>`;
    s += '<text x="146" y="60" fill="#cdd6f4" font-size="9">D</text>';

    // Clock wire CLK (x=40 to 140, y=105)
    s += `<line x1="40" y1="105" x2="140" y2="105" stroke="${colorClk}" stroke-width="3" />`;
    s += `<text x="50" y="97" fill="${colorClk}" font-size="9" font-weight="bold">CLK = ${clk}</text>`;

    // Triangle clock indicator inside
    s += '<polygon points="140,97 152,105 140,113" fill="none" stroke="#89b4fa" stroke-width="1.5" />';

    // Output wire Q (x=220 to 320, y=55)
    s += `<line x1="220" y1="55" x2="320" y2="55" stroke="${colorQ}" stroke-width="3" />`;
    s += `<text x="290" y="47" fill="${colorQ}" font-size="9" font-weight="bold">Q = ${q}</text>`;
    s += '<text x="212" y="60" fill="#cdd6f4" font-size="9">Q</text>';

    // Output wire /Q (x=220 to 320, y=105)
    s += `<line x1="220" y1="105" x2="320" y2="105" stroke="${colorQbar}" stroke-width="2" />`;
    s += `<text x="290" y="97" fill="${colorQbar}" font-size="9" font-weight="bold">/Q = ${q ? 0 : 1}</text>`;
    s += '<text x="210" y="110" fill="#cdd6f4" font-size="9">/Q</text>';

    return s;
  }

  // Draw 6T SRAM Cell SVG
  function drawSramSVG(wl, bl, q, mode) {
    let s = '';

    const qbar = q ? 0 : 1;

    // Colors based on state
    const colorWl = wl ? '#fab387' : '#313244';
    const colorQ = q ? '#f38ba8' : '#313244';
    const colorQbar = qbar ? '#f38ba8' : '#313244';

    let colorBl = bl ? '#89b4fa' : '#313244';
    let colorBlb = bl ? '#313244' : '#89b4fa';

    if (mode === 'read' && wl === 1) {
      // In read mode, BL and BLB follow cell state Q and Qbar
      colorBl = q ? '#89b4fa' : '#313244';
      colorBlb = qbar ? '#89b4fa' : '#313244';
    }

    // Add glow filter definition to SVG
    s += `
      <defs>
        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    `;

    // 1. Draw Inverter 1 (Left) & Inverter 2 (Right)
    s += '<rect x="100" y="35" width="40" height="40" rx="3" fill="#11111b" stroke="#89b4fa" stroke-width="1.5" />';
    s += '<text x="120" y="58" fill="#89b4fa" font-size="8" text-anchor="middle" font-family="monospace">INV 1</text>';

    s += '<rect x="180" y="35" width="40" height="40" rx="3" fill="#11111b" stroke="#89b4fa" stroke-width="1.5" />';
    s += '<text x="200" y="58" fill="#89b4fa" font-size="8" text-anchor="middle" font-family="monospace">INV 2</text>';

    // Cross-coupled connections (visualized as wires)
    // Q (INV1 output, connects to INV2 input)
    s += `<path d="M 140 45 L 160 45 L 160 65 L 180 65" fill="none" stroke="${colorQ}" stroke-width="2" />`;
    s += `<circle cx="150" cy="45" r="3" fill="${colorQ}" />`;
    s += `<text x="150" y="38" fill="${colorQ}" font-size="8" font-weight="bold">Q = ${q}</text>`;

    // Qbar (INV2 output, connects to INV1 input)
    s += `<path d="M 220 45 L 240 45 L 240 25 L 80 25 L 80 45 L 100 45" fill="none" stroke="${colorQbar}" stroke-width="1.5" />`;
    s += `<circle cx="230" cy="45" r="3" fill="${colorQbar}" />`;
    s += `<text x="230" y="38" fill="${colorQbar}" font-size="8" font-weight="bold">/Q = ${qbar}</text>`;

    // 2. Draw Word Line (WL) - horizontal at bottom (y=120)
    s += `<line x1="20" y1="120" x2="300" y2="120" stroke="${colorWl}" stroke-width="3" />`;
    s += `<text x="30" y="112" fill="${colorWl}" font-size="8" font-weight="bold">Word Line (WL) = ${wl}</text>`;

    // 3. Draw Bit Lines (BL & BLB) - vertical at sides (x=45 & x=275)
    s += `<line x1="45" y1="10" x2="45" y2="140" stroke="${colorBl}" stroke-width="2.5" />`;
    s += `<text x="40" y="20" fill="${colorBl}" font-size="8" text-anchor="end" font-weight="bold">BL</text>`;

    s += `<line x1="275" y1="10" x2="275" y2="140" stroke="${colorBlb}" stroke-width="2.5" />`;
    s += `<text x="280" y="20" fill="${colorBlb}" font-size="8" font-weight="bold">BLB</text>`;

    // 4. Pass Transistors M5 & M6
    // M5 (connecting BL at x=45 to Q node at x=100)
    // M6 (connecting BLB at x=275 to Qbar node at x=220)
    const colorM5 = wl ? '#a6e3a1' : '#f38ba8';

    // Switch representations
    if (wl === 1) {
      // Closed switches
      s += `<line x1="45" y1="55" x2="100" y2="55" stroke="${colorBl}" stroke-width="2" />`;
      s += `<line x1="220" y1="55" x2="275" y2="55" stroke="${colorBlb}" stroke-width="2" />`;

      // Pass gates M5/M6 glowing green
      s += `<rect x="65" y="47" width="16" height="16" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="1.5" />`;
      s += `<text x="73" y="57" fill="#a6e3a1" font-size="7" text-anchor="middle" font-weight="bold">M5</text>`;

      s += `<rect x="238" y="47" width="16" height="16" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="1.5" />`;
      s += `<text x="246" y="57" fill="#a6e3a1" font-size="7" text-anchor="middle" font-weight="bold">M6</text>`;

      // Connection to Word Line
      s += `<line x1="73" y1="63" x2="73" y2="120" stroke="#a6e3a1" stroke-width="1" stroke-dasharray="2,2" />`;
      s += `<line x1="246" y1="63" x2="246" y2="120" stroke="#a6e3a1" stroke-width="1" stroke-dasharray="2,2" />`;

      // Flow indicators
      if (mode === 'write') {
        // Write: BL/BLB force state into Q/Qbar
        s += `<path d="M 50 55 L 60 55" stroke="#fab387" stroke-width="1.5" marker-end="url(#arrow)" />`;
        s += `<path d="M 270 55 L 260 55" stroke="#fab387" stroke-width="1.5" marker-end="url(#arrow)" />`;
        s += '<text x="160" y="15" fill="#fab387" font-size="8" text-anchor="middle">Đang Ghi (Write)...</text>';
      } else {
        // Read: Q/Qbar drive BL/BLB
        s += `<path d="M 90 55 L 80 55" stroke="#a6e3a1" stroke-width="1.5" marker-end="url(#arrow)" />`;
        s += `<path d="M 230 55 L 240 55" stroke="#a6e3a1" stroke-width="1.5" marker-end="url(#arrow)" />`;
        s += '<text x="160" y="15" fill="#a6e3a1" font-size="8" text-anchor="middle">Đang Đọc (Read)...</text>';
      }
    } else {
      // Open switches (unconnected lines)
      s += `<line x1="45" y1="55" x2="60" y2="55" stroke="${colorBl}" stroke-width="2" />`;
      s += `<line x1="85" y1="55" x2="100" y2="55" stroke="${colorQ}" stroke-width="2" />`;

      s += `<line x1="220" y1="55" x2="235" y2="55" stroke="${colorQbar}" stroke-width="2" />`;
      s += `<line x1="260" y1="55" x2="275" y2="55" stroke="${colorBlb}" stroke-width="2" />`;

      // Pass gates M5/M6 red (closed/locked)
      s += `<rect x="65" y="47" width="16" height="16" fill="#1e1e2e" stroke="#f38ba8" stroke-width="1.5" />`;
      s += `<text x="73" y="57" fill="#f38ba8" font-size="7" text-anchor="middle">M5</text>`;
      s += `<line x1="60" y1="55" x2="70" y2="43" stroke="#f38ba8" stroke-width="1.5" />`; // Open switch line

      s += `<rect x="238" y="47" width="16" height="16" fill="#1e1e2e" stroke="#f38ba8" stroke-width="1.5" />`;
      s += `<text x="246" y="57" fill="#f38ba8" font-size="7" text-anchor="middle">M6</text>`;
      s += `<line x1="260" y1="55" x2="270" y2="43" stroke="#f38ba8" stroke-width="1.5" />`; // Open switch line

      s += `<line x1="73" y1="63" x2="73" y2="120" stroke="#f38ba8" stroke-width="1" stroke-dasharray="2,2" />`;
      s += `<line x1="246" y1="63" x2="246" y2="120" stroke="#f38ba8" stroke-width="1" stroke-dasharray="2,2" />`;

      s += '<text x="160" y="15" fill="#585b70" font-size="8" text-anchor="middle">Khóa / Chờ (Standby)</text>';
    }

    // Add arrow markers to SVG if not present
    s += `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fab387" />
        </marker>
      </defs>
    `;

    return s;
  }

  // Update truth table view
  function updateTruthTable() {
    let html = '';

    if (mode === 'dff') {
      html += `
        <tr style="border-bottom: 2px solid var(--border); font-weight: bold; color: #fab387;">
          <th style="padding: 6px;">CLK (Xung nhịp)</th>
          <th style="padding: 6px;">Ngõ vào D</th>
          <th style="padding: 6px;">Q (Trước sườn clock)</th>
          <th style="padding: 6px; color: #a6e3a1;">Q (Ngõ ra hiện tại)</th>
        </tr>
      `;

      // Let's list some key states
      const states = [
        { clk: '0', d: '0', q_prev: '0', q: '0', active: dffClk === 0 && dffD === 0 && dffQ === 0 },
        { clk: '0', d: '1', q_prev: '0', q: '0', active: dffClk === 0 && dffD === 1 && dffQ === 0 },
        { clk: '↑', d: '0', q_prev: 'Q_prev', q: '0', active: dffClk === 1 && dffD === 0 },
        { clk: '↑', d: '1', q_prev: 'Q_prev', q: '1', active: dffClk === 1 && dffD === 1 },
      ];

      states.forEach((s) => {
        const activeStyle = s.active ? 'background: #45475a; color: #a6e3a1; font-weight: bold;' : 'color: #cdd6f4;';
        html += `
          <tr style="${activeStyle} border-bottom: 1px solid #313244;">
            <td style="padding: 6px;">${s.clk}</td>
            <td style="padding: 6px;">${s.d}</td>
            <td style="padding: 6px;">${s.q_prev}</td>
            <td style="padding: 6px;">${s.q}</td>
          </tr>
        `;
      });
    } else {
      // SRAM truth table
      html += `
        <tr style="border-bottom: 2px solid var(--border); font-weight: bold; color: #fab387;">
          <th style="padding: 6px;">WL (Chọn dòng)</th>
          <th style="padding: 6px;">Chế độ</th>
          <th style="padding: 6px;">BL</th>
          <th style="padding: 6px;">BLB</th>
          <th style="padding: 6px; color: #a6e3a1;">Q (Lưu trữ)</th>
        </tr>
      `;

      const states = [
        { wl: '0 (Khóa)', mode: 'Chờ', bl: 'x', blb: 'x', q: String(sramQ), active: sramWl === 0 },
        {
          wl: '1 (Mở)',
          mode: 'Ghi',
          bl: '0',
          blb: '1',
          q: '0',
          active: sramWl === 1 && sramMode === 'write' && sramBl === 0,
        },
        {
          wl: '1 (Mở)',
          mode: 'Ghi',
          bl: '1',
          blb: '0',
          q: '1',
          active: sramWl === 1 && sramMode === 'write' && sramBl === 1,
        },
        {
          wl: '1 (Mở)',
          mode: 'Đọc',
          bl: 'Q (Đọc)',
          blb: '/Q',
          q: String(sramQ),
          active: sramWl === 1 && sramMode === 'read',
        },
      ];

      states.forEach((s) => {
        const activeStyle = s.active ? 'background: #45475a; color: #a6e3a1; font-weight: bold;' : 'color: #cdd6f4;';
        html += `
          <tr style="${activeStyle} border-bottom: 1px solid #313244;">
            <td style="padding: 6px;">${s.wl}</td>
            <td style="padding: 6px;">${s.mode}</td>
            <td style="padding: 6px;">${s.bl}</td>
            <td style="padding: 6px;">${s.blb}</td>
            <td style="padding: 6px;">${s.q}</td>
          </tr>
        `;
      });
    }

    tableTruth.innerHTML = html;
  }

  // Update simulator state and visuals
  function update() {
    mode = selectMode.value;

    if (mode === 'dff') {
      groupDff.style.display = 'block';
      groupSram.style.display = 'none';
      tableBox.style.maxHeight = '160px';

      valDffClkState.textContent = String(dffClk);
      valDffQ.textContent = `${dffQ} (${dffQ ? 'HIGH' : 'LOW'})`;
      valDffQ.style.color = dffQ ? '#a6e3a1' : '#f38ba8';

      svgComponents.innerHTML = drawDffSVG(dffD, dffClk, dffQ);
    } else {
      groupDff.style.display = 'none';
      groupSram.style.display = 'block';
      tableBox.style.maxHeight = '220px';

      // Core SRAM logic
      if (sramWl === 1) {
        if (sramMode === 'write') {
          sramQ = sramBl; // Write forces Q
          valSramReadOut.textContent = '0 (Ghi)';
          valSramReadOut.style.color = '#fab387';
        } else {
          // Read drives sense amplifier
          valSramReadOut.textContent = String(sramQ);
          valSramReadOut.style.color = sramQ ? '#a6e3a1' : '#f38ba8';
        }
      } else {
        // WL = 0 means standby, read amplifier has no signal (0)
        valSramReadOut.textContent = '0 (Chờ)';
        valSramReadOut.style.color = '#585b70';
      }

      valSramQ.textContent = String(sramQ);
      valSramQ.style.color = sramQ ? '#a6e3a1' : '#f38ba8';

      svgComponents.innerHTML = drawSramSVG(sramWl, sramBl, sramQ, sramMode);
    }

    updateTruthTable();
  }

  // DFF Listeners
  btnDffD.addEventListener('click', () => {
    dffD = dffD ? 0 : 1;
    updateDffDButton(btnDffD, dffD);
    update();
  });

  btnDffClk.addEventListener('click', () => {
    // Manual Rising Edge Trigger
    dffClk = 1;
    dffQprev = dffQ;
    dffQ = dffD; // DFF captures D on rising edge
    update();

    // Automatically transition CLK back to 0 (falling edge) after 300ms
    setTimeout(() => {
      dffClk = 0;
      update();
    }, 300);
  });

  // SRAM Listeners
  btnSramModeWrite.addEventListener('click', () => {
    sramMode = 'write';
    updateSramModeButtons();
    update();
  });

  btnSramModeRead.addEventListener('click', () => {
    sramMode = 'read';
    updateSramModeButtons();
    update();
  });

  btnSramWl.addEventListener('click', () => {
    sramWl = sramWl ? 0 : 1;
    updateSramWlButton(btnSramWl, sramWl);
    update();
  });

  btnSramBl.addEventListener('click', () => {
    sramBl = sramBl ? 0 : 1;
    updateSramBlButton(btnSramBl, sramBl);
    update();
  });

  selectMode.addEventListener('change', update);

  // Initialize
  updateDffDButton(btnDffD, dffD);
  updateSramWlButton(btnSramWl, sramWl);
  updateSramBlButton(btnSramBl, sramBl);
  updateSramModeButtons();
  update();
});
