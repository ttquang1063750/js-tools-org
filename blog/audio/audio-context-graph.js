/* Bài 1: AudioContext & Đồ Thị Âm Thanh — phát tone thật bằng OscillatorNode → GainNode → destination */
(function () {
  const canvas = document.getElementById('audio-canvas');
  if (!canvas) return;

  const playBtn = document.getElementById('audio-play-btn');
  const stopBtn = document.getElementById('audio-stop-btn');
  const resetBtn = document.getElementById('audio-reset-btn');
  const waveformSelect = document.getElementById('audio-waveform-select');
  const freqRange = document.getElementById('audio-freq-range');
  const freqValueEl = document.getElementById('audio-freq-value');
  const gainRange = document.getElementById('audio-gain-range');
  const gainValueEl = document.getElementById('audio-gain-value');
  const logEl = document.getElementById('audio-log');
  const statusLineEl = document.getElementById('audio-status-line');
  const jsCodeDisplay = document.getElementById('audio-js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 560;
  const CSS_H = 220;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let audioContext = null;
  let oscillator = null;
  let gainNode = null;
  let pulsePhase = 0;

  function log(message) {
    const line = document.createElement('div');
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
  function logOk(message) {
    const line = document.createElement('div');
    line.className = 'ok-line';
    line.textContent = message;
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
      log(
        'Tạo AudioContext mới (bên trong user gesture) — state: "' +
          audioContext.state +
          '", sampleRate: ' +
          audioContext.sampleRate +
          ' Hz.'
      );
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        logOk('resume() thành công → state: "running".');
      });
    }
  }

  function doPlay() {
    ensureContext();
    if (oscillator) {
      log('Đã đang phát — chỉnh dạng sóng/tần số/âm lượng bên dưới để nghe thay đổi trực tiếp (không cần node mới).');
      return;
    }
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    oscillator.type = waveformSelect.value;
    oscillator.frequency.setValueAtTime(Number(freqRange.value), audioContext.currentTime);
    gainNode.gain.setValueAtTime(Number(gainRange.value), audioContext.currentTime);
    oscillator.connect(gainNode).connect(audioContext.destination);
    oscillator.start();
    logOk(
      'Tạo OscillatorNode (' +
        waveformSelect.value +
        ', ' +
        freqRange.value +
        'Hz) + GainNode (' +
        Number(gainRange.value).toFixed(2) +
        ') → connect() → destination → start() lúc currentTime=' +
        audioContext.currentTime.toFixed(2) +
        's.'
    );
  }

  function doStop() {
    if (!oscillator) {
      log('Chưa có gì đang phát.');
      return;
    }
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    oscillator = null;
    gainNode = null;
    logOk(
      'stop() lúc currentTime=' +
        audioContext.currentTime.toFixed(2) +
        's. Node này KHÔNG THỂ start() lại — lần "Phát" tiếp theo sẽ tạo OscillatorNode hoàn toàn mới.'
    );
  }

  function doReset() {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      gainNode.disconnect();
      oscillator = null;
      gainNode = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    clearLog();
    log('Đã reset. AudioContext tiếp theo sẽ được tạo mới (state: suspended) khi bấm "Phát".');
  }

  playBtn.addEventListener('click', doPlay);
  stopBtn.addEventListener('click', doStop);
  resetBtn.addEventListener('click', doReset);

  waveformSelect.addEventListener('change', () => {
    if (oscillator) {
      oscillator.type = waveformSelect.value;
      log('Đổi dạng sóng đang phát → "' + waveformSelect.value + '" (không cần tạo node mới).');
    }
  });

  freqRange.addEventListener('input', () => {
    const value = Number(freqRange.value);
    freqValueEl.textContent = value + ' Hz';
    if (oscillator && audioContext) {
      oscillator.frequency.setValueAtTime(value, audioContext.currentTime);
    }
  });
  freqRange.addEventListener('change', () => {
    if (oscillator) {
      log(
        'AudioParam frequency.setValueAtTime(' +
          freqRange.value +
          ', currentTime) — cập nhật tức thì trên node đang chạy.'
      );
    }
  });

  gainRange.addEventListener('input', () => {
    const value = Number(gainRange.value);
    gainValueEl.textContent = value.toFixed(2);
    if (gainNode && audioContext) {
      gainNode.gain.setValueAtTime(value, audioContext.currentTime);
    }
  });
  gainRange.addEventListener('change', () => {
    if (gainNode) {
      log(
        'AudioParam gain.setValueAtTime(' + Number(gainRange.value).toFixed(2) + ', currentTime) — cập nhật tức thì.'
      );
    }
  });

  function drawBox(x, y, w, h, label, sub, active) {
    ctx.fillStyle = active ? '#a855f7' : '#45475a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = active ? '#c084fc' : '#1e1e2e';
    ctx.lineWidth = active ? 2 : 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 - 7);
    ctx.font = '9px monospace';
    ctx.fillText(sub, x + w / 2, y + h / 2 + 9);
    ctx.textBaseline = 'alphabetic';
  }

  function drawConnection(x1, y1, x2, y2, active) {
    ctx.strokeStyle = active ? '#a855f7' : '#45475a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (active) {
      const t = (Math.sin(pulsePhase) + 1) / 2;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f9e2af';
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const isPlaying = !!oscillator;
    const boxW = 150;
    const boxH = 60;
    const y = 50;
    const x1 = 20;
    const x2 = 205;
    const x3 = 390;

    drawConnection(x1 + boxW, y + boxH / 2, x2, y + boxH / 2, isPlaying);
    drawConnection(x2 + boxW, y + boxH / 2, x3, y + boxH / 2, isPlaying);

    drawBox(
      x1,
      y,
      boxW,
      boxH,
      'OscillatorNode',
      isPlaying ? waveformSelect.value + ' ' + freqRange.value + 'Hz' : '(chưa tạo)',
      isPlaying
    );
    drawBox(
      x2,
      y,
      boxW,
      boxH,
      'GainNode',
      isPlaying ? 'gain ' + Number(gainRange.value).toFixed(2) : '(chưa tạo)',
      isPlaying
    );
    drawBox(x3, y, boxW, boxH, 'Destination 🔊', 'loa thiết bị', isPlaying);

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🟪 node đang kết nối & chạy   ⬛ chưa tạo/đã dừng', 10, CSS_H - 8);
  }

  function updateStatusLine() {
    if (!audioContext) {
      statusLineEl.textContent = 'AudioContext: (chưa tạo)';
      return;
    }
    statusLineEl.textContent =
      'AudioContext: ' +
      audioContext.state +
      '  |  sampleRate: ' +
      audioContext.sampleRate +
      ' Hz  |  currentTime: ' +
      audioContext.currentTime.toFixed(2) +
      's';
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🔊 BÀI 1: AUDIOCONTEXT & ĐỒ THỊ ÂM THANH */\n\n' +
      'const ctx = new AudioContext(); // state: suspended\n' +
      'await ctx.resume(); // bên trong user gesture → running\n\n' +
      'const osc = ctx.createOscillator();\n' +
      'const gain = ctx.createGain();\n' +
      'osc.type = "' +
      waveformSelect.value +
      '";\n' +
      'osc.frequency.setValueAtTime(' +
      freqRange.value +
      ', ctx.currentTime);\n' +
      'gain.gain.setValueAtTime(' +
      Number(gainRange.value).toFixed(2) +
      ', ctx.currentTime);\n\n' +
      'osc.connect(gain).connect(ctx.destination);\n' +
      'osc.start(); // chỉ gọi được 1 lần trong đời node này\n\n' +
      '// Trạng thái hiện tại:\n' +
      '// AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      '\n' +
      '// Đang phát: ' +
      (oscillator ? 'có' : 'không');
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function loop() {
    pulsePhase += 0.08;
    draw();
    updateStatusLine();
    updateJsCodeDisplay();
    requestAnimationFrame(loop);
  }

  freqValueEl.textContent = freqRange.value + ' Hz';
  gainValueEl.textContent = Number(gainRange.value).toFixed(2);
  log('Sẵn sàng. Bấm "Phát" để tạo AudioContext (bên trong cử chỉ người dùng) và nghe 1 tone thật.');
  loop();
})();
