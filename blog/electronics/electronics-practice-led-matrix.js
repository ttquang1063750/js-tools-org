document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const textInput = document.getElementById('matrix-text-input');
  const codeContainer = document.getElementById('matrix-code-container');
  const canvas = document.getElementById('canvas-led-matrix');
  const ctx = canvas.getContext('2d');

  // Font 5x7 table (Common Cathode column values, LSB = top row, MSB = bottom row)
  const FONT = {
    A: [0x7e, 0x11, 0x11, 0x11, 0x7e],
    B: [0x7f, 0x49, 0x49, 0x49, 0x36],
    C: [0x3e, 0x41, 0x41, 0x41, 0x22],
    D: [0x7f, 0x41, 0x41, 0x22, 0x1c],
    E: [0x7f, 0x49, 0x49, 0x49, 0x41],
    F: [0x7f, 0x09, 0x09, 0x09, 0x01],
    G: [0x3e, 0x41, 0x49, 0x49, 0x7a],
    H: [0x7f, 0x08, 0x08, 0x08, 0x7f],
    I: [0x00, 0x41, 0x7f, 0x41, 0x00],
    J: [0x02, 0x01, 0x21, 0x1e, 0x00],
    K: [0x7f, 0x08, 0x14, 0x22, 0x41],
    L: [0x7f, 0x01, 0x01, 0x01, 0x01],
    M: [0x7f, 0x02, 0x0c, 0x02, 0x7f],
    N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
    O: [0x3e, 0x41, 0x41, 0x41, 0x3e],
    P: [0x7f, 0x09, 0x09, 0x09, 0x06],
    Q: [0x3e, 0x41, 0x51, 0x21, 0x5e],
    R: [0x7f, 0x09, 0x19, 0x29, 0x46],
    S: [0x46, 0x49, 0x49, 0x49, 0x31],
    T: [0x01, 0x01, 0x7f, 0x01, 0x01],
    U: [0x3f, 0x40, 0x40, 0x40, 0x3f],
    V: [0x1f, 0x20, 0x40, 0x20, 0x1f],
    W: [0x7f, 0x20, 0x18, 0x20, 0x7f],
    X: [0x63, 0x14, 0x08, 0x14, 0x63],
    Y: [0x07, 0x08, 0x70, 0x08, 0x07],
    Z: [0x61, 0x51, 0x49, 0x45, 0x43],
    ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
    '-': [0x08, 0x08, 0x08, 0x08, 0x08],
    '.': [0x00, 0x60, 0x60, 0x00, 0x00],
    '!': [0x00, 0x00, 0x5f, 0x00, 0x00],
    0: [0x3e, 0x51, 0x49, 0x45, 0x3e],
    1: [0x00, 0x42, 0x7f, 0x40, 0x00],
    2: [0x42, 0x61, 0x51, 0x49, 0x46],
    3: [0x21, 0x41, 0x45, 0x4b, 0x31],
    4: [0x18, 0x14, 0x12, 0x7f, 0x10],
    5: [0x27, 0x45, 0x45, 0x45, 0x39],
    6: [0x3c, 0x4a, 0x49, 0x49, 0x30],
    7: [0x01, 0x71, 0x09, 0x05, 0x03],
    8: [0x36, 0x49, 0x49, 0x49, 0x36],
    9: [0x06, 0x49, 0x49, 0x29, 0x1e],
  };

  let scrollBuffer = [];
  let scrollOffset = 0;
  let animationInterval = null;

  // Build columns buffer from text
  function buildScrollBuffer(text) {
    const cleanText = text.toUpperCase();
    let buffer = [];

    // Add starting padding (8 empty columns)
    for (let i = 0; i < 8; i++) {
      buffer.push(0x00);
    }

    // Add letters from text
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const charData = FONT[char] || FONT[' '];
      // Push character columns
      buffer.push(...charData);
      // Push 1 empty column separator
      buffer.push(0x00);
    }

    // Add ending padding (8 empty columns)
    for (let i = 0; i < 8; i++) {
      buffer.push(0x00);
    }

    scrollBuffer = buffer;
    scrollOffset = 0;
  }

  // Generate C code text representation
  function generateCCode(text) {
    if (!codeContainer) return;

    const cleanText = text.toUpperCase();
    let codeStr = `// Mảng font chữ chạy động cho chữ "${cleanText}"\n`;
    codeStr += `const uint8_t scroll_data[] = {\n`;
    codeStr += `    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Đệm đầu\n`;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const charData = FONT[char] || FONT[' '];
      const hexList = charData.map((val) => `0x${val.toString(16).toUpperCase().padStart(2, '0')}`).join(', ');

      let comment = `Chữ ${char}`;
      if (char === ' ') comment = 'Khoảng trắng';
      else if (char === '-') comment = 'Dấu gạch ngang';

      codeStr += `    ${hexList}, 0x00, // ${comment}\n`;
    }

    codeStr += `    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // Đệm đuôi\n`;
    codeStr += `};\n`;

    codeContainer.textContent = codeStr;
  }

  // Render LED Matrix on Canvas
  function drawLEDMatrix() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid settings
    const cols = 8;
    const rows = 8;
    const cellW = w / cols;
    const cellH = h / rows;

    // Get active 8 columns
    let activeCols = [];
    for (let i = 0; i < 8; i++) {
      const idx = scrollOffset + i;
      activeCols.push(scrollBuffer[idx] || 0x00);
    }

    // Draw background grid
    for (let c = 0; c < cols; c++) {
      const colByte = activeCols[c];
      for (let r = 0; r < rows; r++) {
        // LSB is at row 0 (top), MSB is at row 7 (bottom)
        const isLit = (colByte & (1 << r)) !== 0;

        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;
        const radius = cellW * 0.38;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);

        if (isLit) {
          // Led on (Bright Red with glow)
          ctx.fillStyle = '#f38ba8';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#f38ba8';
          ctx.fill();

          // Small glare inside
          ctx.beginPath();
          ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = '#f5e0dc';
          ctx.shadowBlur = 0;
          ctx.fill();
        } else {
          // Led off (Dim Red/Gray)
          ctx.fillStyle = '#313244';
          ctx.shadowBlur = 0;
          ctx.fill();

          // Subtle border
          ctx.strokeStyle = '#181825';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function startAnimation() {
    if (animationInterval) clearInterval(animationInterval);

    animationInterval = setInterval(() => {
      if (scrollBuffer.length <= 8) return;

      scrollOffset++;
      if (scrollOffset >= scrollBuffer.length - 8) {
        scrollOffset = 0; // Loop back
      }
      drawLEDMatrix();
    }, 120);
  }

  // Update logic on input change
  function updateSimulator() {
    const text = textInput.value || ' ';
    buildScrollBuffer(text);
    generateCCode(text);
    drawLEDMatrix();
  }

  textInput.addEventListener('input', updateSimulator);

  // Init
  updateSimulator();
  startAnimation();
});
