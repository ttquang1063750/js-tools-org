document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectDebounce = document.getElementById('select-debounce');
  const btnTrigger = document.getElementById('btn-trigger');
  const canvas = document.getElementById('canvas-oscilloscope');
  const ctx = canvas.getContext('2d');

  const statusMode = document.getElementById('status-mode');
  const statusDuty = document.getElementById('status-duty');
  const ledLight = document.getElementById('mcu-led-light');

  const regTcnt0 = document.getElementById('reg-tcnt0');
  const regOcr0a = document.getElementById('reg-ocr0a');
  const regEifr = document.getElementById('reg-eifr');

  // State variables
  let debounceMode = selectDebounce.value;
  let mcuMode = 0; // 0: Off, 1: 25% PWM, 2: 75% PWM, 3: 1Hz Blink
  let tcnt0 = 0;
  let ocr0a = 0;
  let eifr = 0;

  let isInsideISR = false;
  let isrFrameCount = 0;
  let currentCodeLine = 2; // default at while(1)

  // Oscilloscope buffers (450 points to match canvas width)
  const bufLength = canvas.width;
  const yellowBuffer = new Array(bufLength).fill(0); // input switch
  const greenBuffer = new Array(bufLength).fill(0); // PWM output

  // Debounce simulation physics
  let switchTarget = 0; // 0: unpressed, 1: pressed
  let switchVoltage = 0; // current analog voltage (0V to 5V)
  let bounceTimer = 0;
  let lastTriggerTime = 0;
  let blinkState = false;
  let blinkTimer = 0;

  // Initialize Register Bits Display
  function updateRegisterBits(element, value) {
    element.innerHTML = '';
    for (let i = 7; i >= 0; i--) {
      const bit = (value >> i) & 1;
      const bitSpan = document.createElement('span');
      bitSpan.className = `mcu-bit${bit ? ' is-set' : ''}`;
      // Highlight PB5 or similar if needed, else normal
      bitSpan.textContent = bit;
      element.appendChild(bitSpan);
    }
  }

  function updateRegistersUI() {
    updateRegisterBits(regTcnt0, tcnt0);
    updateRegisterBits(regOcr0a, ocr0a);
    updateRegisterBits(regEifr, eifr);

    document.getElementById('hex-tcnt0').textContent = `0x${tcnt0.toString(16).toUpperCase().padStart(2, '0')}`;
    document.getElementById('hex-ocr0a').textContent = `0x${ocr0a.toString(16).toUpperCase().padStart(2, '0')}`;
    document.getElementById('hex-eifr').textContent = `0x${eifr.toString(16).toUpperCase().padStart(2, '0')}`;
  }

  // Code highlighter
  function highlightCodeLine(lineNum) {
    for (let i = 1; i <= 7; i++) {
      const el = document.getElementById(`code-line-${i}`);
      if (el) {
        if (i === lineNum) {
          el.classList.add('is-current');
        } else {
          el.classList.remove('is-current');
        }
      }
    }
  }

  // Trigger click logic
  function triggerInterrupt() {
    const now = Date.now();
    debounceMode = selectDebounce.value;

    // Simulate contact bounce / dội phím
    if (debounceMode === 'none') {
      // Multiple random triggers within 20ms
      let delays = [0, 2, 5, 8, 12, 18];
      delays.forEach((d) => {
        setTimeout(() => {
          // Toggle voltage state randomly to simulate bounce
          switchVoltage = Math.random() > 0.5 ? 5 : 0;

          // Trigger interrupt on falling/change edges
          if (switchVoltage === 5) {
            eifr = 1;
          }
        }, d);
      });
    } else if (debounceMode === 'hardware') {
      // Clean analog charge curve, no bounce spikes
      // We will let the animation loop handle the smooth charge/discharge transition
      switchTarget = 1;
    } else if (debounceMode === 'software') {
      // Bounce spikes happen, but software ignores them after the first trigger
      let delays = [0, 2, 5, 8, 12, 18];
      delays.forEach((d) => {
        setTimeout(() => {
          switchVoltage = Math.random() > 0.5 ? 5 : 0;
        }, d);
      });

      // Software debounce checks timing
      if (now - lastTriggerTime > 200) {
        eifr = 1;
        lastTriggerTime = now;
      }
    }
  }

  btnTrigger.addEventListener('click', triggerInterrupt);

  // Listen for Spacebar key
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      triggerInterrupt();
    }
  });

  selectDebounce.addEventListener('change', () => {
    debounceMode = selectDebounce.value;
  });

  // Quiz logic
  const quizContainer = document.querySelector('.quiz-container');
  const quizSubmit = document.querySelector('.quiz-submit');

  if (quizSubmit) {
    quizSubmit.addEventListener('click', () => {
      const questions = quizContainer.querySelectorAll('.quiz-question');
      let score = 0;

      questions.forEach((q) => {
        const answer = q.getAttribute('data-answer');
        const selected = q.querySelector('input[type="radio"]:checked');
        const explanation = q.querySelector('.quiz-explanation');

        if (selected) {
          if (selected.value === answer) {
            score++;
            q.style.borderLeft = '4px solid #a6e3a1';
            if (explanation) explanation.style.display = 'block';
          } else {
            q.style.borderLeft = '4px solid #f38ba8';
            if (explanation) explanation.style.display = 'block';
          }
        } else {
          q.style.borderLeft = '4px solid #f9e2af';
          if (explanation) explanation.style.display = 'block';
        }
      });

      alert(`Bạn trả lời đúng ${score}/${questions.length} câu.`);
    });
  }

  // Animation / Simulation Loop
  function loop() {
    // 1. TCNT0 timer count increments
    tcnt0 = (tcnt0 + 4) % 256;

    // 2. Handle analog voltage smoothing (Hardware filter simulation)
    if (debounceMode === 'hardware') {
      // Simulate RC charge towards target (smooth charging curve)
      if (switchTarget === 1) {
        switchVoltage += (5 - switchVoltage) * 0.1;
        if (switchVoltage > 4.5 && switchTarget === 1) {
          eifr = 1;
          switchTarget = 0; // Reset trigger target to avoid continuous triggers
        }
      } else {
        switchVoltage += (0 - switchVoltage) * 0.1;
      }
    } else {
      // Reset switchVoltage to 0 after some time for non-hardware modes
      if (switchVoltage > 0 && debounceMode !== 'hardware') {
        switchVoltage -= 0.5;
        if (switchVoltage < 0) switchVoltage = 0;
      }
    }

    // 3. Process Interrupt Flag (EIFR)
    if (eifr === 1 && !isInsideISR) {
      isInsideISR = true;
      isrFrameCount = 0;
      eifr = 0; // Clear interrupt flag

      // Shift mode
      mcuMode = (mcuMode + 1) % 4;

      // Update OCR0A register value according to mode
      if (mcuMode === 0) {
        ocr0a = 0;
      } else if (mcuMode === 1) {
        ocr0a = 64; // 25% Duty
      } else if (mcuMode === 2) {
        ocr0a = 191; // 75% Duty
      } else if (mcuMode === 3) {
        ocr0a = 255; // 1Hz blink mode starting state
        blinkState = true;
      }
    }

    // 4. Handle Mode 3 (Blinking via simulated timer interrupt)
    if (mcuMode === 3) {
      blinkTimer++;
      if (blinkTimer >= 30) {
        // Toggle every 30 frames (approx 500ms)
        blinkState = !blinkState;
        ocr0a = blinkState ? 255 : 0;
        blinkTimer = 0;
      }
    }

    // 5. Handle code line highlighting jump to ISR
    if (isInsideISR) {
      currentCodeLine = 5; // highlight line 5 inside ISR
      isrFrameCount++;
      if (isrFrameCount > 20) {
        // stay inside ISR for 20 frames
        isInsideISR = false;
        currentCodeLine = 2; // return to while(1) loop
      }
    } else {
      currentCodeLine = 2;
    }
    highlightCodeLine(currentCodeLine);

    // 6. Update visual loads (LED intensity)
    let dutyPct = 0;
    let modeText = 'TẮT';
    if (mcuMode === 0) {
      dutyPct = 0;
      modeText = 'TẮT (OCR0A = 0)';
    } else if (mcuMode === 1) {
      dutyPct = 25;
      modeText = 'MODE 1: PWM 25%';
    } else if (mcuMode === 2) {
      dutyPct = 75;
      modeText = 'MODE 2: PWM 75%';
    } else if (mcuMode === 3) {
      dutyPct = blinkState ? 100 : 0;
      modeText = 'MODE 3: Nhấp nháy 1Hz';
    }

    statusMode.textContent = modeText;
    statusDuty.textContent = `Duty: ${dutyPct}%`;

    // LED Brightness pulsing
    const intensity = dutyPct / 100;
    ledLight.style.backgroundColor = `rgba(249, 226, 175, ${0.15 + intensity * 0.85})`;
    ledLight.style.boxShadow =
      intensity > 0.05 ? `0 0 ${10 + intensity * 20}px rgba(249, 226, 175, ${0.4 + intensity * 0.6})` : 'none';

    // 7. Push data to Oscilloscope buffers
    yellowBuffer.shift();
    yellowBuffer.push(switchVoltage); // Yellow: input voltage

    greenBuffer.shift();
    // Green: PWM pin output (HIGH if TCNT0 < OCR0A)
    const pwmHigh = tcnt0 < ocr0a ? 5 : 0;
    greenBuffer.push(pwmHigh);

    // 8. Render Oscilloscope Screen
    drawScope();
    updateRegistersUI();

    requestAnimationFrame(loop);
  }

  function drawScope() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw Grid lines
    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw channel splits
    ctx.strokeStyle = '#45475a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 65);
    ctx.lineTo(w, 65);
    ctx.stroke();

    // Draw Yellow signal (Ch1 - switch input, top channel)
    // Scale: 0V -> y=55, 5V -> y=15
    ctx.strokeStyle = '#f9e2af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < w; i++) {
      const val = yellowBuffer[i];
      const y = 55 - (val / 5) * 40;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Draw Green signal (Ch2 - PWM output, bottom channel)
    // Scale: 0V -> y=120, 5V -> y=80
    ctx.strokeStyle = '#a6e3a1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < w; i++) {
      const val = greenBuffer[i];
      const y = 120 - (val / 5) * 40;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
  }

  // Init
  updateRegistersUI();
  loop();
});
