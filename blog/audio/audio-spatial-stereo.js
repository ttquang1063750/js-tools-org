/* Bài 6: Spatial & Stereo Audio — StereoPannerNode và PannerNode+HRTF thật qua Web Audio API */
(function () {
  const canvas = document.getElementById('sp-canvas');
  if (!canvas) return;

  const modeSelect = document.getElementById('sp-mode-select');
  const stereoControls = document.getElementById('sp-stereo-controls');
  const pannerControls = document.getElementById('sp-panner-controls');
  const panRange = document.getElementById('sp-pan-range');
  const panValueEl = document.getElementById('sp-pan-value');
  const xRange = document.getElementById('sp-x-range');
  const xValueEl = document.getElementById('sp-x-value');
  const zRange = document.getElementById('sp-z-range');
  const zValueEl = document.getElementById('sp-z-value');
  const playBtn = document.getElementById('sp-play-btn');
  const stopBtn = document.getElementById('sp-stop-btn');
  const orbitBtn = document.getElementById('sp-orbit-btn');
  const resetBtn = document.getElementById('sp-reset-btn');
  const logEl = document.getElementById('sp-log');
  const statusLineEl = document.getElementById('sp-status-line');
  const jsCodeDisplay = document.getElementById('sp-js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 560;
  const CSS_H = 260;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let audioContext = null;
  let oscillator = null;
  let gainNode = null;
  let stereoPanner = null;
  let panner = null;
  let mode = 'stereo';
  let orbiting = false;
  let orbitAngle = 0;

  function log(message) {
    const line = document.createElement('div');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function logOk(message) {
    const line = document.createElement('div');
    line.className = 'ok-line';
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function logErr(message) {
    const line = document.createElement('div');
    line.className = 'err-line';
    line.textContent = 'Lỗi: ' + message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function clearLog() {
    logEl.innerHTML = '';
  }

  function ensureContext() {
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioContext = new AC();
      log('Tạo AudioContext mới — sampleRate: ' + audioContext.sampleRate + ' Hz.');
    }
    if (audioContext.state === 'suspended') audioContext.resume();
  }

  function updateModeUI() {
    if (mode === 'stereo') {
      stereoControls.classList.remove('sp-hide');
      pannerControls.classList.add('sp-hide');
    } else {
      stereoControls.classList.add('sp-hide');
      pannerControls.classList.remove('sp-hide');
    }
  }

  function doPlay() {
    ensureContext();
    if (oscillator) {
      log('Đã đang phát — đổi slider để nghe thay đổi trực tiếp.');
      return;
    }
    const now = audioContext.currentTime;
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, now);
    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.25, now);

    if (mode === 'stereo') {
      stereoPanner = audioContext.createStereoPanner();
      stereoPanner.pan.setValueAtTime(Number(panRange.value), now);
      oscillator.connect(gainNode).connect(stereoPanner).connect(audioContext.destination);
      logOk(
        'connect(): Oscillator → Gain → StereoPanner(pan=' + Number(panRange.value).toFixed(2) + ') → destination.'
      );
    } else {
      panner = audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.positionX.setValueAtTime(Number(xRange.value), now);
      panner.positionY.setValueAtTime(0, now);
      panner.positionZ.setValueAtTime(Number(zRange.value), now);
      oscillator.connect(gainNode).connect(panner).connect(audioContext.destination);
      logOk(
        'connect(): Oscillator → Gain → PannerNode(HRTF, x=' +
          Number(xRange.value).toFixed(1) +
          ', z=' +
          Number(zRange.value).toFixed(1) +
          ') → destination.'
      );
    }
    oscillator.start();
  }

  function doStop() {
    if (!oscillator) {
      log('Chưa có gì đang phát.');
      return;
    }
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    if (stereoPanner) {
      stereoPanner.disconnect();
      stereoPanner = null;
    }
    if (panner) {
      panner.disconnect();
      panner = null;
    }
    oscillator = null;
    logOk('Đã dừng — oscillator.stop(), mọi node disconnect().');
  }

  function stopOrbit() {
    orbiting = false;
    orbitBtn.textContent = '🔄 Tự động xoay';
    orbitBtn.classList.remove('is-active');
  }

  function doReset() {
    doStop();
    stopOrbit();
    clearLog();
    panRange.value = 0;
    xRange.value = 0;
    zRange.value = 0;
    log('Đã reset demo. Chọn kiểu định vị rồi bấm "Phát".');
  }

  modeSelect.addEventListener('change', () => {
    doStop();
    stopOrbit();
    mode = modeSelect.value;
    updateModeUI();
    log('Đổi kiểu định vị sang "' + modeSelect.options[modeSelect.selectedIndex].text + '".');
  });

  playBtn.addEventListener('click', doPlay);
  stopBtn.addEventListener('click', doStop);
  resetBtn.addEventListener('click', doReset);

  panRange.addEventListener('input', () => {
    const v = Number(panRange.value);
    panValueEl.textContent = v.toFixed(2);
    if (stereoPanner && audioContext) stereoPanner.pan.setValueAtTime(v, audioContext.currentTime);
  });
  xRange.addEventListener('input', () => {
    const v = Number(xRange.value);
    xValueEl.textContent = v.toFixed(1);
    if (panner && audioContext) panner.positionX.setValueAtTime(v, audioContext.currentTime);
  });
  zRange.addEventListener('input', () => {
    const v = Number(zRange.value);
    zValueEl.textContent = v.toFixed(1);
    if (panner && audioContext) panner.positionZ.setValueAtTime(v, audioContext.currentTime);
  });

  orbitBtn.addEventListener('click', () => {
    orbiting = !orbiting;
    orbitBtn.textContent = orbiting ? '⏹ Dừng xoay' : '🔄 Tự động xoay';
    orbitBtn.classList.toggle('is-active', orbiting);
    if (orbiting) log('Bắt đầu tự động xoay nguồn âm quanh người nghe.');
  });

  function tickOrbit() {
    if (!orbiting) return;
    orbitAngle += 0.02;
    if (mode === 'stereo') {
      const v = Math.sin(orbitAngle);
      panRange.value = v.toFixed(2);
      panValueEl.textContent = v.toFixed(2);
      if (stereoPanner && audioContext) stereoPanner.pan.setValueAtTime(v, audioContext.currentTime);
    } else {
      const radius = 3;
      const x = Math.cos(orbitAngle) * radius;
      const z = Math.sin(orbitAngle) * radius;
      xRange.value = x.toFixed(1);
      zRange.value = z.toFixed(1);
      xValueEl.textContent = x.toFixed(1);
      zValueEl.textContent = z.toFixed(1);
      if (panner && audioContext) {
        panner.positionX.setValueAtTime(x, audioContext.currentTime);
        panner.positionZ.setValueAtTime(z, audioContext.currentTime);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const centerX = CSS_W / 2;
    const centerY = CSS_H / 2;

    // Listener icon (center)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#a6adc8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🎧 Người nghe', centerX, centerY + 28);

    let sx, sy, label;
    if (mode === 'stereo') {
      const pan = stereoPanner ? stereoPanner.pan.value : Number(panRange.value);
      sx = centerX + pan * (CSS_W / 2 - 40);
      sy = centerY - 70;
      label = 'pan=' + pan.toFixed(2);
      ctx.strokeStyle = '#313244';
      ctx.beginPath();
      ctx.moveTo(40, sy);
      ctx.lineTo(CSS_W - 40, sy);
      ctx.stroke();
    } else {
      const x = panner ? panner.positionX.value : Number(xRange.value);
      const z = panner ? panner.positionZ.value : Number(zRange.value);
      const scale = 30;
      sx = centerX + x * scale;
      sy = centerY + z * scale;
      label = 'x=' + x.toFixed(1) + ', z=' + z.toFixed(1);
      // reference circle
      ctx.strokeStyle = '#313244';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#45475a';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 9, 0, Math.PI * 2);
    ctx.fillStyle = oscillator ? '#a855f7' : '#45475a';
    ctx.fill();
    ctx.fillStyle = '#a6adc8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🔊 ' + label, sx, sy - 16);
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      '  |  ' +
      (oscillator ? 'đang phát (' + mode + ')' : 'im lặng') +
      (orbiting ? '  |  đang tự động xoay' : '');
  }

  function updateJsCodeDisplay() {
    let code = '/* 🎧 BÀI 6: SPATIAL & STEREO AUDIO */\n\n';
    if (mode === 'stereo') {
      code +=
        'const panner = ctx.createStereoPanner();\n' +
        'panner.pan.setValueAtTime(' +
        Number(panRange.value).toFixed(2) +
        ', ctx.currentTime);\n' +
        'osc.connect(gain).connect(panner).connect(ctx.destination);';
    } else {
      code +=
        'const panner = ctx.createPanner();\n' +
        "panner.panningModel = 'HRTF';\n" +
        'panner.positionX.setValueAtTime(' +
        Number(xRange.value).toFixed(1) +
        ', ctx.currentTime);\n' +
        'panner.positionZ.setValueAtTime(' +
        Number(zRange.value).toFixed(1) +
        ', ctx.currentTime);\n' +
        'osc.connect(gain).connect(panner).connect(ctx.destination);';
    }
    code += '\n\n// Trạng thái: ' + (oscillator ? 'đang phát' : 'im lặng') + (orbiting ? ', đang tự động xoay' : '');

    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function loop() {
    tickOrbit();
    draw();
    updateStatusLine();
    updateJsCodeDisplay();
    requestAnimationFrame(loop);
  }

  updateModeUI();
  log('Sẵn sàng. Chọn kiểu định vị, bấm "Phát", rồi kéo slider hoặc bấm "Tự động xoay".');
  loop();
})();
