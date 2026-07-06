document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-digi-mode');

  const groupGates = document.getElementById('group-gates-controls');
  const groupDecoder = document.getElementById('group-decoder-controls');
  const tableBox = document.getElementById('table-box');

  const selectGateType = document.getElementById('select-gate-type');
  const btnInputA = document.getElementById('btn-input-a');
  const btnInputB = document.getElementById('btn-input-b');
  const boxInputB = document.getElementById('box-input-b');

  const valGateEquation = document.getElementById('val-gate-equation');
  const valGateOutput = document.getElementById('val-gate-output');

  const btnsBcd = document.querySelectorAll('.btn-bcd');
  const valDecNum = document.getElementById('val-dec-num');
  const valSegmentsState = document.getElementById('val-segments-state');

  const svgComponents = document.getElementById('digi-svg-components');
  const tableTruth = document.getElementById('truth-table');

  // State
  let mode = selectMode.value;
  let inputA = 0;
  let inputB = 0;
  let bcd = [0, 0, 0, 0]; // [D, C, B, A] where bcd[3] is D, bcd[0] is A

  // Truth table definitions
  const gateEquations = {
    AND: 'Y = A · B',
    OR: 'Y = A + B',
    NOT: 'Y = A̅',
    NAND: 'Y = A · B̅',
    NOR: 'Y = A + B̅',
    XOR: 'Y = A ⊕ B',
    XNOR: 'Y = A ⊕ B̅',
  };

  // Evaluate gate output
  function evaluateGate(gate, a, b) {
    switch (gate) {
      case 'AND':
        return a && b ? 1 : 0;
      case 'OR':
        return a || b ? 1 : 0;
      case 'NOT':
        return a ? 0 : 1;
      case 'NAND':
        return !(a && b) ? 1 : 0;
      case 'NOR':
        return !(a || b) ? 1 : 0;
      case 'XOR':
        return a !== b ? 1 : 0;
      case 'XNOR':
        return a === b ? 1 : 0;
      default:
        return 0;
    }
  }

  // 7-segment decoder mapping (active HIGH: 1 = ON, 0 = OFF)
  // Segments ordered: a, b, c, d, e, f, g
  const segmentMap = {
    0: [1, 1, 1, 1, 1, 1, 0],
    1: [0, 1, 1, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1],
    4: [0, 1, 1, 0, 0, 1, 1],
    5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1],
    7: [1, 1, 1, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1],
    10: [1, 1, 1, 0, 1, 1, 1], // A
    11: [0, 0, 1, 1, 1, 1, 1], // b
    12: [1, 0, 0, 1, 1, 1, 0], // C
    13: [0, 1, 1, 1, 1, 0, 1], // d
    14: [1, 0, 0, 1, 1, 1, 1], // E
    15: [1, 0, 0, 0, 1, 1, 1], // F
  };

  // Toggle input button styling
  function updateInputButton(btn, value) {
    if (value === 1) {
      btn.textContent = 'HIGH (1)';
      btn.style.background = '#f38ba8'; // Pink-red for HIGH
      btn.style.color = '#11111b';
    } else {
      btn.textContent = 'LOW (0)';
      btn.style.background = '#313244'; // Dark gray for LOW
      btn.style.color = '#f38ba8';
    }
  }

  // Draw Logic Gate SVG
  function drawGateSVG(gate, a, b, y) {
    let s = '';

    // Inputs paths
    const colorA = a ? '#f38ba8' : '#313244';
    const colorB = b ? '#f38ba8' : '#313244';
    const colorY = y ? '#f38ba8' : '#313244';

    if (gate === 'NOT') {
      // 1-input NOT Gate
      s += `<line x1="40" y1="90" x2="140" y2="90" stroke="${colorA}" stroke-width="3" />`;
      s += `<text x="50" y="80" fill="${colorA}" font-size="10" font-weight="bold">A = ${a}</text>`;

      // Triangle NOT symbol (x=140 to 180)
      s += '<polygon points="140,70 140,110 175,90" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      s += '<circle cx="180" cy="90" r="5" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';

      // Output
      s += `<line x1="185" y1="90" x2="300" y2="90" stroke="${colorY}" stroke-width="3" />`;
      s += `<text x="270" y="80" fill="${colorY}" font-size="10" font-weight="bold">Y = ${y}</text>`;
    } else {
      // 2-input Gates
      s += `<line x1="40" y1="60" x2="130" y2="60" stroke="${colorA}" stroke-width="3" />`;
      s += `<line x1="40" y1="120" x2="130" y2="120" stroke="${colorB}" stroke-width="3" />`;
      s += `<text x="50" y="50" fill="${colorA}" font-size="10" font-weight="bold">A = ${a}</text>`;
      s += `<text x="50" y="140" fill="${colorB}" font-size="10" font-weight="bold">B = ${b}</text>`;

      let gatePath = '';
      let bubble = false;

      switch (gate) {
        case 'AND':
          // Straight back, round front
          gatePath = 'M 120,50 L 145,50 A 40 40 0 0 1 185,90 A 40 40 0 0 1 145,130 L 120,130 Z';
          break;
        case 'NAND':
          gatePath = 'M 120,50 L 145,50 A 40 40 0 0 1 185,90 A 40 40 0 0 1 145,130 L 120,130 Z';
          bubble = true;
          break;
        case 'OR':
          // Curved back, pointed front
          gatePath = 'M 115,50 Q 135,90 115,130 Q 155,130 185,90 Q 155,50 115,50 Z';
          break;
        case 'NOR':
          gatePath = 'M 115,50 Q 135,90 115,130 Q 155,130 185,90 Q 155,50 115,50 Z';
          bubble = true;
          break;
        case 'XOR':
          // XOR has double curved back
          s += '<path d="M 107,50 Q 127,90 107,130" fill="none" stroke="#89b4fa" stroke-width="2.5" />';
          gatePath = 'M 115,50 Q 135,90 115,130 Q 155,130 185,90 Q 155,50 115,50 Z';
          break;
        case 'XNOR':
          s += '<path d="M 107,50 Q 127,90 107,130" fill="none" stroke="#89b4fa" stroke-width="2.5" />';
          gatePath = 'M 115,50 Q 135,90 115,130 Q 155,130 185,90 Q 155,50 115,50 Z';
          bubble = true;
          break;
      }

      // Draw gate body
      s += `<path d="${gatePath}" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />`;

      let outX = 185;
      if (bubble) {
        s += '<circle cx="190" cy="90" r="5" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
        outX = 195;
      }

      // Output line
      s += `<line x1="${outX}" y1="90" x2="300" y2="90" stroke="${colorY}" stroke-width="3" />`;
      s += `<text x="270" y="80" fill="${colorY}" font-size="10" font-weight="bold">Y = ${y}</text>`;

      // Gate text label inside
      s += `<text x="145" y="94" fill="#a6e3a1" font-size="9" font-family="monospace">${gate}</text>`;
    }

    return s;
  }

  // Draw 7-Segment display SVG
  function draw7SegSVG(val) {
    let s = '';
    const segments = segmentMap[val] || [0, 0, 0, 0, 0, 0, 0];

    // Draw segments (a, b, c, d, e, f, g)
    // a: top horiz (x=160, y=25)
    // b: top-right vert (x=205, y=30)
    // c: bottom-right vert (x=205, y=85)
    // d: bottom horiz (x=160, y=135)
    // e: bottom-left vert (x=150, y=85)
    // f: top-left vert (x=150, y=30)
    // g: middle horiz (x=160, y=80)

    const fillStyle = (bit) => (bit ? '#f38ba8' : '#313244');
    const filterGlow = (bit) => (bit ? 'filter="url(#glow)"' : '');

    // Add glow filter definition to SVG
    s += `
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    `;

    // a
    s += `<rect x="157" y="25" width="46" height="8" rx="3" fill="${fillStyle(segments[0])}" ${filterGlow(segments[0])} />`;
    // b
    s += `<rect x="199" y="31" width="8" height="50" rx="3" fill="${fillStyle(segments[1])}" ${filterGlow(segments[1])} />`;
    // c
    s += `<rect x="199" y="85" width="8" height="50" rx="3" fill="${fillStyle(segments[2])}" ${filterGlow(segments[2])} />`;
    // d
    s += `<rect x="157" y="131" width="46" height="8" rx="3" fill="${fillStyle(segments[3])}" ${filterGlow(segments[3])} />`;
    // e
    s += `<rect x="151" y="85" width="8" height="50" rx="3" fill="${fillStyle(segments[4])}" ${filterGlow(segments[4])} />`;
    // f
    s += `<rect x="151" y="31" width="8" height="50" rx="3" fill="${fillStyle(segments[5])}" ${filterGlow(segments[5])} />`;
    // g
    s += `<rect x="157" y="78" width="46" height="8" rx="3" fill="${fillStyle(segments[6])}" ${filterGlow(segments[6])} />`;

    // Draw segment label annotations (small faint text)
    s += '<text x="180" y="20" fill="#585b70" font-size="7" text-anchor="middle">a</text>';
    s += '<text x="214" y="55" fill="#585b70" font-size="7">b</text>';
    s += '<text x="214" y="110" fill="#585b70" font-size="7">c</text>';
    s += '<text x="180" y="148" fill="#585b70" font-size="7" text-anchor="middle">d</text>';
    s += '<text x="142" y="110" fill="#585b70" font-size="7">e</text>';
    s += '<text x="142" y="55" fill="#585b70" font-size="7">f</text>';
    s += '<text x="180" y="75" fill="#585b70" font-size="7" text-anchor="middle">g</text>';

    return s;
  }

  // Update truth table view
  function updateTruthTable() {
    let html = '';

    if (mode === 'gates') {
      const gate = selectGateType.value;
      if (gate === 'NOT') {
        // 1-input NOT truth table
        html += `
          <tr style="border-bottom: 2px solid var(--border); font-weight: bold; color: #fab387;">
            <th style="padding: 6px;">Ngõ vào (A)</th>
            <th style="padding: 6px;">Ngõ ra (Y)</th>
          </tr>
        `;

        for (let a = 0; a <= 1; a++) {
          const y = evaluateGate(gate, a, 0);
          const isActive = a === inputA;
          const activeStyle = isActive ? 'background: #45475a; color: #a6e3a1; font-weight: bold;' : 'color: #cdd6f4;';

          html += `
            <tr style="${activeStyle} border-bottom: 1px solid #313244;">
              <td style="padding: 6px;">${a}</td>
              <td style="padding: 6px;">${y}</td>
            </tr>
          `;
        }
      } else {
        // 2-input gate truth table
        html += `
          <tr style="border-bottom: 2px solid var(--border); font-weight: bold; color: #fab387;">
            <th style="padding: 6px;">Ngõ vào A</th>
            <th style="padding: 6px;">Ngõ vào B</th>
            <th style="padding: 6px;">Ngõ ra Y</th>
          </tr>
        `;

        for (let a = 0; a <= 1; a++) {
          for (let b = 0; b <= 1; b++) {
            const y = evaluateGate(gate, a, b);
            const isActive = a === inputA && b === inputB;
            const activeStyle = isActive
              ? 'background: #45475a; color: #a6e3a1; font-weight: bold;'
              : 'color: #cdd6f4;';

            html += `
              <tr style="${activeStyle} border-bottom: 1px solid #313244;">
                <td style="padding: 6px;">${a}</td>
                <td style="padding: 6px;">${b}</td>
                <td style="padding: 6px;">${y}</td>
              </tr>
            `;
          }
        }
      }
    } else {
      // 7-segment decoder truth table
      html += `
        <tr style="border-bottom: 2px solid var(--border); font-weight: bold; color: #fab387; position: sticky; top: 0; background: #11111b;">
          <th style="padding: 4px;">D</th>
          <th style="padding: 4px;">C</th>
          <th style="padding: 4px;">B</th>
          <th style="padding: 4px;">A</th>
          <th style="padding: 4px; border-right: 1px solid #313244; color: #a6e3a1;">Số</th>
          <th style="padding: 4px;">a</th>
          <th style="padding: 4px;">b</th>
          <th style="padding: 4px;">c</th>
          <th style="padding: 4px;">d</th>
          <th style="padding: 4px;">e</th>
          <th style="padding: 4px;">f</th>
          <th style="padding: 4px;">g</th>
        </tr>
      `;

      const currentVal = bcd[3] * 8 + bcd[2] * 4 + bcd[1] * 2 + bcd[0] * 1;

      for (let i = 0; i < 16; i++) {
        const d = i & 8 ? 1 : 0;
        const c = i & 4 ? 1 : 0;
        const b = i & 2 ? 1 : 0;
        const a = i & 1 ? 1 : 0;
        const segs = segmentMap[i];

        const isActive = i === currentVal;
        const activeStyle = isActive ? 'background: #45475a; color: #a6e3a1; font-weight: bold;' : 'color: #cdd6f4;';

        let label = String(i);
        if (i === 10) label = 'A';
        if (i === 11) label = 'b';
        if (i === 12) label = 'C';
        if (i === 13) label = 'd';
        if (i === 14) label = 'E';
        if (i === 15) label = 'F';

        html += `
          <tr style="${activeStyle} border-bottom: 1px solid #313244;">
            <td style="padding: 4px;">${d}</td>
            <td style="padding: 4px;">${c}</td>
            <td style="padding: 4px;">${b}</td>
            <td style="padding: 4px;">${a}</td>
            <td style="padding: 4px; border-right: 1px solid #313244; font-weight: bold; color: #a6e3a1;">${label}</td>
            <td style="padding: 4px; opacity: ${segs[0] ? 1 : 0.3}">${segs[0]}</td>
            <td style="padding: 4px; opacity: ${segs[1] ? 1 : 0.3}">${segs[1]}</td>
            <td style="padding: 4px; opacity: ${segs[2] ? 1 : 0.3}">${segs[2]}</td>
            <td style="padding: 4px; opacity: ${segs[3] ? 1 : 0.3}">${segs[3]}</td>
            <td style="padding: 4px; opacity: ${segs[4] ? 1 : 0.3}">${segs[4]}</td>
            <td style="padding: 4px; opacity: ${segs[5] ? 1 : 0.3}">${segs[5]}</td>
            <td style="padding: 4px; opacity: ${segs[6] ? 1 : 0.3}">${segs[6]}</td>
          </tr>
        `;
      }
    }

    tableTruth.innerHTML = html;
  }

  // Update simulator state and visuals
  function update() {
    mode = selectMode.value;

    if (mode === 'gates') {
      groupGates.style.display = 'block';
      groupDecoder.style.display = 'none';
      tableBox.style.maxHeight = '160px';

      const gate = selectGateType.value;
      if (gate === 'NOT') {
        boxInputB.style.display = 'none';
      } else {
        boxInputB.style.display = 'block';
      }

      const outY = evaluateGate(gate, inputA, inputB);

      valGateEquation.textContent = gateEquations[gate];
      valGateOutput.textContent = `${outY} (${outY ? 'HIGH' : 'LOW'})`;
      valGateOutput.style.color = outY ? '#f38ba8' : '#89b4fa';

      svgComponents.innerHTML = drawGateSVG(gate, inputA, inputB, outY);
    } else {
      groupGates.style.display = 'none';
      groupDecoder.style.display = 'block';
      tableBox.style.maxHeight = '220px';

      const decVal = bcd[3] * 8 + bcd[2] * 4 + bcd[1] * 2 + bcd[0] * 1;

      let label = String(decVal);
      if (decVal === 10) label = 'A';
      if (decVal === 11) label = 'b';
      if (decVal === 12) label = 'C';
      if (decVal === 13) label = 'd';
      if (decVal === 14) label = 'E';
      if (decVal === 15) label = 'F';

      valDecNum.textContent = label;
      valSegmentsState.textContent = segmentMap[decVal].join(',');

      svgComponents.innerHTML = draw7SegSVG(decVal);
    }

    updateTruthTable();
  }

  // Event Listeners for Logic Sandbox Inputs
  btnInputA.addEventListener('click', () => {
    inputA = inputA ? 0 : 1;
    updateInputButton(btnInputA, inputA);
    update();
  });

  btnInputB.addEventListener('click', () => {
    inputB = inputB ? 0 : 1;
    updateInputButton(btnInputB, inputB);
    update();
  });

  selectGateType.addEventListener('change', update);
  selectMode.addEventListener('change', update);

  // Event Listeners for 7-Seg BCD Switches
  btnsBcd.forEach((btn) => {
    btn.addEventListener('click', () => {
      const bit = parseInt(btn.getAttribute('data-bit'));
      bcd[bit] = bcd[bit] ? 0 : 1;

      // Update BCD button style
      if (bcd[bit] === 1) {
        btn.textContent = '1';
        btn.style.background = '#f38ba8';
        btn.style.color = '#11111b';
      } else {
        btn.textContent = '0';
        btn.style.background = '#313244';
        btn.style.color = '#f38ba8';
      }

      update();
    });
  });

  // Initialize
  updateInputButton(btnInputA, inputA);
  updateInputButton(btnInputB, inputB);
  update();
});
