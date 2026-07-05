(function () {
  // State variables
  let currentComponent = 'resistor'; // 'resistor', 'diode', 'led', 'shorted', 'open'
  let rotaryState = 'OFF'; // 'OFF', 'V_DC', 'V_AC', 'OHM', 'DIODE'
  let redProbePos = 'left'; // 'left', 'right'
  let blackProbePos = 'right'; // 'left', 'right'

  // Audio Context for Beep
  let audioCtx = null;
  let beepInterval = null;

  // DOM Elements
  const vomLcd = document.getElementById('vomLcd');
  const vomValue = document.getElementById('vomValue');
  const vomUnit = document.getElementById('vomUnit');
  const vomIndicator = document.getElementById('vomIndicator');
  const vomKnob = document.getElementById('vomKnob');
  const canvas = document.getElementById('vomCanvas');
  const ctx = canvas.getContext('2d');
  const compInfo = document.getElementById('compInfo');

  // Probe Placement Buttons
  const btnRedLeft = document.getElementById('btnRedLeft');
  const btnRedRight = document.getElementById('btnRedRight');
  const btnBlackLeft = document.getElementById('btnBlackLeft');
  const btnBlackRight = document.getElementById('btnBlackRight');

  // Component description data
  const compDetails = {
    resistor: {
      title: 'Điện trở hạn dòng 1kΩ',
      desc: 'Điện trở 4 vòng màu: Nâu (1) - Đen (0) - Đỏ (x10^2) - Nhũ Vàng (±5%). Tổng trị số R = 1,000 Ω = 1kΩ. Hãy chỉnh núm xoay về nấc <strong>Ω</strong> để đo kiểm.',
      color: '#d8a657',
    },
    diode: {
      title: 'Đi-ốt Silicon 1N4007',
      desc: 'Vạch màu bạc ở đầu linh kiện biểu thị cực âm Cathode (Phải), đầu còn lại là cực dương Anode (Trái). Hãy chuyển VOM sang nấc <strong>Đo Đi-ốt (➔|⫽)</strong> để đo phân cực thuận (~0.7V) và ngược (OL).',
      color: '#a6adc8',
    },
    led: {
      title: 'Đèn LED Đỏ',
      desc: 'Cực Anode (Trái) và Cathode (Phải). Đèn LED đỏ sẽ sáng lên khi đo ở thang <strong>Đi-ốt (➔|⫽)</strong> nếu cắm đúng que Đỏ vào Anode (+) và que Đen vào Cathode (-). Sụt áp thuận của LED đỏ vào khoảng 1.8V.',
      color: '#f38ba8',
    },
    battery: {
      title: 'Pin 9V một chiều (DC Source)',
      desc: 'Nguồn cấp điện áp một chiều 9V. Hãy chỉnh núm xoay về nấc <strong>V ⎓ (V DC)</strong> để đo điện áp một chiều của pin. Chú ý đảo ngược vị trí que đo để thấy giá trị điện thế âm.',
      color: '#f9e2af',
    },
    shorted: {
      title: 'Linh kiện lỗi (Chập mạch - Shorted)',
      desc: 'Đây là một linh kiện bị chập điện hoàn toàn (điện trở gần như bằng 0). Khi đo ở thang <strong>Thông mạch (➔|⫽)</strong>, đồng hồ sẽ phát tiếng kêu bíp liên tục cảnh báo ngắn mạch.',
      color: '#f9e2af',
    },
    open: {
      title: 'Linh kiện lỗi (Đứt mạch - Open)',
      desc: 'Một linh kiện bị đứt gãy lõi bên trong. Ở mọi thang đo (trở, đi-ốt), VOM sẽ luôn báo <strong>OL (Over Limit)</strong> do dòng điện không thể đi qua.',
      color: '#7f8c8d',
    },
  };

  // Sound generator using Web Audio API
  function startBeep() {
    if (beepInterval) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const playBeepTone = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, audioCtx.currentTime); // 900 Hz clear tone
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      };

      playBeepTone();
      beepInterval = setInterval(playBeepTone, 300);
    } catch (e) {
      console.warn('AudioContext not supported or blocked by user action.', e);
    }
  }

  function stopBeep() {
    if (beepInterval) {
      clearInterval(beepInterval);
      beepInterval = null;
    }
  }

  // Update Multimeter measurement display
  function updateMeasurement() {
    stopBeep();

    if (rotaryState === 'OFF') {
      vomLcd.style.background = '#313244';
      vomValue.textContent = ' ';
      vomValue.style.color = '#45475a';
      vomUnit.textContent = '';
      vomIndicator.textContent = 'OFF';
      return;
    }

    vomLcd.style.background = '#a6e3a1'; // Backlight ON
    vomValue.style.color = '#11111b';
    vomIndicator.textContent = rotaryState;

    const probesConnected = redProbePos !== blackProbePos;

    if (!probesConnected) {
      // Both probes connected to the same pin -> short circuit across test probes
      if (rotaryState === 'OHM') {
        vomValue.textContent = '0.0';
        vomUnit.textContent = 'Ω';
      } else if (rotaryState === 'DIODE') {
        vomValue.textContent = '0.000';
        vomUnit.textContent = 'V';
        startBeep(); // Beeps in continuity mode for short circuit
      } else {
        vomValue.textContent = '0.00';
        vomUnit.textContent = 'V';
      }
      return;
    }

    // Probes connected to Left (A) and Right (B) respectively
    // Red on Left, Black on Right is Forward polar direction
    const isForward = redProbePos === 'left' && blackProbePos === 'right';

    switch (rotaryState) {
      case 'V_DC':
        if (currentComponent === 'battery') {
          vomValue.textContent = isForward ? '9.00' : '-9.00';
        } else {
          vomValue.textContent = '0.00';
        }
        vomUnit.textContent = 'V';
        break;
      case 'V_AC':
        vomValue.textContent = '0.00';
        vomUnit.textContent = 'V';
        break;
      case 'OHM':
        if (currentComponent === 'resistor') {
          vomValue.textContent = '1.002';
          vomUnit.textContent = 'kΩ';
        } else if (currentComponent === 'shorted') {
          vomValue.textContent = '0.1';
          vomUnit.textContent = 'Ω';
        } else {
          vomValue.textContent = 'O.L';
          vomUnit.textContent = '';
        }
        break;
      case 'DIODE':
        if (currentComponent === 'diode') {
          if (isForward) {
            vomValue.textContent = '0.702';
            vomUnit.textContent = 'V';
          } else {
            vomValue.textContent = 'O.L';
            vomUnit.textContent = '';
          }
        } else if (currentComponent === 'led') {
          if (isForward) {
            vomValue.textContent = '1.852';
            vomUnit.textContent = 'V';
          } else {
            vomValue.textContent = 'O.L';
            vomUnit.textContent = '';
          }
        } else if (currentComponent === 'shorted') {
          vomValue.textContent = '0.001';
          vomUnit.textContent = 'V';
          startBeep(); // Beeps for short/continuity
        } else {
          vomValue.textContent = 'O.L';
          vomUnit.textContent = '';
        }
        break;
    }
  }

  // Draw the Experiment Board on HTML5 Canvas
  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Breadboard base
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw test terminal pins A and B
    const pinAX = 140;
    const pinBX = 340;
    const pinY = 120;

    // Pin Labels
    ctx.fillStyle = '#a6adc8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Chân A (Trái)', pinAX - 36, pinY - 40);
    ctx.fillText('Chân B (Phải)', pinBX - 36, pinY - 40);

    // Terminal Holes
    ctx.fillStyle = '#11111b';
    ctx.strokeStyle = '#45475a';
    ctx.lineWidth = 2;

    // Left Terminal Socket
    ctx.beginPath();
    ctx.arc(pinAX, pinY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Terminal Socket
    ctx.beginPath();
    ctx.arc(pinBX, pinY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw connecting wires from holes to component leads
    ctx.strokeStyle = '#585b70';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pinAX, pinY);
    ctx.lineTo(pinAX + 40, pinY);
    ctx.moveTo(pinBX, pinY);
    ctx.lineTo(pinBX - 40, pinY);
    ctx.stroke();

    // Draw the component body in the center
    const compLeft = pinAX + 40;
    const compRight = pinBX - 40;
    const compWidth = compRight - compLeft;
    const compCenterY = pinY;

    if (currentComponent === 'resistor') {
      // Body
      ctx.fillStyle = '#eed49f'; // Light tan body
      ctx.beginPath();
      ctx.roundRect(compLeft + 20, compCenterY - 10, compWidth - 40, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#eed49f';
      ctx.stroke();

      // Connecting leads
      ctx.strokeStyle = '#b4befe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(compLeft, compCenterY);
      ctx.lineTo(compLeft + 20, compCenterY);
      ctx.moveTo(compRight, compCenterY);
      ctx.lineTo(compRight - 20, compCenterY);
      ctx.stroke();

      // Resistor Color Bands: Nâu, Đen, Đỏ, Nhũ Vàng
      const bandWidth = 8;
      const startX = compLeft + 28;
      const step = (compWidth - 56) / 3;

      // Band 1: Nâu
      ctx.fillStyle = '#a67c52';
      ctx.fillRect(startX, compCenterY - 10, bandWidth, 20);
      // Band 2: Đen
      ctx.fillStyle = '#000000';
      ctx.fillRect(startX + step, compCenterY - 10, bandWidth, 20);
      // Band 3: Đỏ
      ctx.fillStyle = '#f38ba8';
      ctx.fillRect(startX + step * 2, compCenterY - 10, bandWidth, 20);
      // Band 4: Nhũ Vàng
      ctx.fillStyle = '#f9e2af';
      ctx.fillRect(compRight - 36, compCenterY - 10, bandWidth, 20);
    } else if (currentComponent === 'diode') {
      // Leads
      ctx.strokeStyle = '#b4befe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(compLeft, compCenterY);
      ctx.lineTo(compLeft + 15, compCenterY);
      ctx.moveTo(compRight, compCenterY);
      ctx.lineTo(compRight - 15, compCenterY);
      ctx.stroke();

      // Body (Black cylinder)
      ctx.fillStyle = '#313244';
      ctx.beginPath();
      ctx.roundRect(compLeft + 15, compCenterY - 12, compWidth - 30, 24, 2);
      ctx.fill();

      // Silver Stripe (Cathode side - right)
      ctx.fillStyle = '#bac2de';
      ctx.fillRect(compRight - 28, compCenterY - 12, 10, 24);
    } else if (currentComponent === 'led') {
      // Leads
      ctx.strokeStyle = '#b4befe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(compLeft, compCenterY);
      ctx.lineTo(compLeft + 35, compCenterY);
      ctx.moveTo(compRight, compCenterY);
      ctx.lineTo(compRight - 35, compCenterY);
      ctx.stroke();

      // Glow effect if LED is powered by correct forward diode measurement
      const isGlowing = rotaryState === 'DIODE' && redProbePos === 'left' && blackProbePos === 'right';
      if (isGlowing) {
        ctx.shadowColor = '#f38ba8';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(243, 139, 168, 0.4)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, compCenterY, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }

      // Bulb body
      ctx.fillStyle = isGlowing ? '#f38ba8' : '#742a3a';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, compCenterY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f38ba8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Flat cathode side marker (Right)
      ctx.fillStyle = isGlowing ? '#f5c2e7' : '#585b70';
      ctx.fillRect(canvas.width / 2 + 12, compCenterY - 10, 4, 20);
    } else if (currentComponent === 'shorted') {
      // Looks like a copper jumper bridge (Short circuit)
      ctx.strokeStyle = '#d8a657';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(compLeft, compCenterY);
      ctx.lineTo(compRight, compCenterY);
      ctx.stroke();

      // Draw solder joints
      ctx.fillStyle = '#bac2de';
      ctx.beginPath();
      ctx.arc(compLeft, compCenterY, 6, 0, Math.PI * 2);
      ctx.arc(compRight, compCenterY, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentComponent === 'open') {
      // Cracked / broken resistor
      ctx.strokeStyle = '#b4befe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(compLeft, compCenterY);
      ctx.lineTo(compLeft + 20, compCenterY);
      ctx.moveTo(compRight, compCenterY);
      ctx.lineTo(compRight - 20, compCenterY);
      ctx.stroke();

      // Tan left block
      ctx.fillStyle = '#eed49f';
      ctx.beginPath();
      ctx.moveTo(compLeft + 20, compCenterY - 10);
      ctx.lineTo(compLeft + 45, compCenterY - 10);
      ctx.lineTo(compLeft + 40, compCenterY + 10);
      ctx.lineTo(compLeft + 20, compCenterY + 10);
      ctx.closePath();
      ctx.fill();

      // Tan right block
      ctx.beginPath();
      ctx.moveTo(compRight - 20, compCenterY - 10);
      ctx.lineTo(compRight - 45, compCenterY - 10);
      ctx.lineTo(compRight - 42, compCenterY + 10);
      ctx.lineTo(compRight - 20, compCenterY + 10);
      ctx.closePath();
      ctx.fill();

      // Gap indicator
      ctx.fillStyle = '#f38ba8';
      ctx.font = '10px sans-serif';
      ctx.fillText('ĐỨT MẠCH', canvas.width / 2 - 26, compCenterY + 28);
    } else if (currentComponent === 'battery') {
      // Connecting leads to breadboard
      ctx.strokeStyle = '#b4befe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(compLeft, compCenterY);
      ctx.lineTo(compLeft + 20, compCenterY);
      ctx.moveTo(compRight, compCenterY);
      ctx.lineTo(compRight - 20, compCenterY);
      ctx.stroke();

      // Battery body (sleek dark block)
      ctx.fillStyle = '#2d3139';
      ctx.beginPath();
      ctx.roundRect(compLeft + 20, compCenterY - 18, compWidth - 40, 36, 4);
      ctx.fill();
      ctx.strokeStyle = '#f9e2af';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gold band at the top/side representing a premium battery label
      ctx.fillStyle = '#f9e2af';
      ctx.fillRect(compLeft + 21, compCenterY - 17, 24, 34);

      // Label text on the battery
      ctx.fillStyle = '#1e1e2e';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('9V', compLeft + 25, compCenterY + 4);

      ctx.fillStyle = '#a6adc8';
      ctx.font = '10px sans-serif';
      ctx.fillText('DC Source', compLeft + 52, compCenterY + 4);

      // Positive (+) and Negative (-) terminals on the body
      ctx.fillStyle = '#f38ba8'; // Red plus
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('+', compLeft + 8, compCenterY - 4);
      ctx.fillStyle = '#a6adc8'; // Negative sign
      ctx.fillText('-', compRight - 14, compCenterY - 4);
    }

    // Draw the Red Probe tip
    ctx.lineWidth = 4;
    const redX = redProbePos === 'left' ? pinAX : pinBX;
    ctx.strokeStyle = '#f38ba8'; // Red wire
    ctx.beginPath();
    ctx.moveTo(redX - 40, 240);
    ctx.bezierCurveTo(redX - 20, 200, redX - 10, 160, redX, pinY);
    ctx.stroke();

    // Probe pen tip body
    ctx.fillStyle = '#f38ba8';
    ctx.beginPath();
    ctx.arc(redX, pinY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw the Black Probe tip
    const blackX = blackProbePos === 'left' ? pinAX : pinBX;
    ctx.strokeStyle = '#a6adc8'; // Gray/Black wire
    ctx.beginPath();
    ctx.moveTo(blackX + 40, 240);
    ctx.bezierCurveTo(blackX + 20, 200, blackX + 10, 160, blackX, pinY);
    ctx.stroke();

    // Probe pen tip body
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(blackX, pinY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Handle Rotary Dial Rotations
  const rotationAngles = {
    OFF: 0,
    V_DC: 72,
    V_AC: 144,
    OHM: 216,
    DIODE: 288,
  };

  function setRotaryState(state) {
    rotaryState = state;
    const angle = rotationAngles[state];
    vomKnob.style.transform = `rotate(${angle}deg)`;
    updateMeasurement();
  }

  // Add click listener to Rotary Dial ticks
  const dialTicks = [
    { className: 'tick-off', state: 'OFF' },
    { className: 'tick-vdc', state: 'V_DC' },
    { className: 'tick-vac', state: 'V_AC' },
    { className: 'tick-ohm', state: 'OHM' },
    { className: 'tick-diode', state: 'DIODE' },
  ];

  dialTicks.forEach((tick) => {
    const el = document.querySelector('.' + tick.className);
    if (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => setRotaryState(tick.state));
    }
  });

  // Toggle knob clockwise on click
  vomKnob.addEventListener('click', () => {
    const order = ['OFF', 'V_DC', 'V_AC', 'OHM', 'DIODE'];
    const nextIdx = (order.indexOf(rotaryState) + 1) % order.length;
    setRotaryState(order[nextIdx]);
  });

  // Handle Component Buttons click
  const compButtons = document.querySelectorAll('.comp-btn');
  compButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      compButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      currentComponent = btn.getAttribute('data-comp');

      // Update info text
      const detail = compDetails[currentComponent];
      compInfo.innerHTML = `Linh kiện đang đo: <strong>${detail.title}</strong>. ${detail.desc}`;

      updateMeasurement();
      drawBoard();
    });
  });

  // Handle Probe positions
  btnRedLeft.addEventListener('click', () => {
    redProbePos = 'left';
    btnRedLeft.classList.add('is-selected-red');
    btnRedRight.classList.remove('is-selected-red');
    updateMeasurement();
    drawBoard();
  });

  btnRedRight.addEventListener('click', () => {
    redProbePos = 'right';
    btnRedRight.classList.add('is-selected-red');
    btnRedLeft.classList.remove('is-selected-red');
    updateMeasurement();
    drawBoard();
  });

  btnBlackLeft.addEventListener('click', () => {
    blackProbePos = 'left';
    btnBlackLeft.classList.add('is-selected-black');
    btnBlackRight.classList.remove('is-selected-black');
    updateMeasurement();
    drawBoard();
  });

  btnBlackRight.addEventListener('click', () => {
    blackProbePos = 'right';
    btnBlackRight.classList.add('is-selected-black');
    btnBlackLeft.classList.remove('is-selected-black');
    updateMeasurement();
    drawBoard();
  });

  // Initial draw & values
  setRotaryState('OFF');
  drawBoard();
})();
