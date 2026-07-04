/* Bài 4: AnalyserNode & FFT — spectrum analyzer + waveform thật qua Web Audio API */
(function () {
  const canvas = document.getElementById('fft-canvas');
  if (!canvas) return;

  const playBtn = document.getElementById('fft-play-btn');
  const stopBtn = document.getElementById('fft-stop-btn');
  const resetBtn = document.getElementById('fft-reset-btn');
  const waveformSelect = document.getElementById('fft-waveform-select');
  const freqRange = document.getElementById('fft-freq-range');
  const freqValueEl = document.getElementById('fft-freq-value');
  const fftSizeSelect = document.getElementById('fft-size-select');
  const smoothingRange = document.getElementById('fft-smoothing-range');
  const smoothingValueEl = document.getElementById('fft-smoothing-value');
  const logEl = document.getElementById('fft-log');
  const statusLineEl = document.getElementById('fft-status-line');
  const jsCodeDisplay = document.getElementById('fft-js-code-display');

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
  let analyser = null;
  let freqData = null;
  let timeData = null;

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

  function doPlay() {
    ensureContext();
    if (oscillator) {
      log('Đã đang phát — kéo slider để nghe/nhìn thay đổi trực tiếp.');
      return;
    }
    const now = audioContext.currentTime;

    oscillator = audioContext.createOscillator();
    oscillator.type = waveformSelect.value;
    oscillator.frequency.setValueAtTime(Number(freqRange.value), now);

    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.3, now);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = Number(fftSizeSelect.value);
    analyser.smoothingTimeConstant = Number(smoothingRange.value);
    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);

    oscillator.connect(gainNode).connect(analyser).connect(audioContext.destination);
    oscillator.start();
    logOk(
      'connect(): Oscillator → Gain → Analyser(fftSize=' +
        analyser.fftSize +
        ', bins=' +
        analyser.frequencyBinCount +
        ') → destination. start() lúc ' +
        now.toFixed(2) +
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
    analyser.disconnect();
    oscillator = null;
    gainNode = null;
    analyser = null;
    logOk('Đã dừng — oscillator.stop(), mọi node disconnect().');
  }

  function doReset() {
    doStop();
    clearLog();
    log('Đã reset demo. Bấm "Phát" để bắt đầu.');
  }

  playBtn.addEventListener('click', doPlay);
  stopBtn.addEventListener('click', doStop);
  resetBtn.addEventListener('click', doReset);

  waveformSelect.addEventListener('change', () => {
    if (oscillator) oscillator.type = waveformSelect.value;
  });
  freqRange.addEventListener('input', () => {
    const value = Number(freqRange.value);
    freqValueEl.textContent = value + ' Hz';
    if (oscillator && audioContext) oscillator.frequency.setValueAtTime(value, audioContext.currentTime);
  });
  fftSizeSelect.addEventListener('change', () => {
    if (analyser) {
      analyser.fftSize = Number(fftSizeSelect.value);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);
      log('Đổi fftSize → ' + analyser.fftSize + ' (bins=' + analyser.frequencyBinCount + ').');
    }
  });
  smoothingRange.addEventListener('input', () => {
    const value = Number(smoothingRange.value);
    smoothingValueEl.textContent = value.toFixed(2);
    if (analyser) analyser.smoothingTimeConstant = value;
  });

  function drawWaveform(top, height) {
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (timeData && analyser) {
      analyser.getByteTimeDomainData(timeData);
      const sliceWidth = CSS_W / timeData.length;
      let x = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128 - 1;
        const y = top + height / 2 + (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
    } else {
      ctx.moveTo(0, top + height / 2);
      ctx.lineTo(CSS_W, top + height / 2);
    }
    ctx.stroke();
    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Waveform (getByteTimeDomainData)', 8, top + 12);
  }

  function drawSpectrum(top, height) {
    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Spectrum (getByteFrequencyData)', 8, top + 12);
    if (!freqData || !analyser) return;
    analyser.getByteFrequencyData(freqData);
    const barCount = Math.min(freqData.length, 128);
    const barWidth = CSS_W / barCount;
    for (let i = 0; i < barCount; i++) {
      const v = freqData[i] / 255;
      const barHeight = v * (height - 20);
      const x = i * barWidth;
      const y = top + height - barHeight;
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const half = CSS_H / 2;
    drawWaveform(0, half);
    drawSpectrum(half, half);
    ctx.strokeStyle = '#313244';
    ctx.beginPath();
    ctx.moveTo(0, half);
    ctx.lineTo(CSS_W, half);
    ctx.stroke();
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      (oscillator ? '  |  đang phát' : '  |  im lặng');
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 📊 BÀI 4: ANALYSERNODE & FFT */\n\n' +
      'const analyser = ctx.createAnalyser();\n' +
      'analyser.fftSize = ' +
      (analyser ? analyser.fftSize : Number(fftSizeSelect.value)) +
      ';\n' +
      'analyser.smoothingTimeConstant = ' +
      Number(smoothingRange.value).toFixed(2) +
      ';\n' +
      'osc.connect(gain).connect(analyser).connect(ctx.destination);\n\n' +
      'function draw() {\n' +
      '  const freqData = new Uint8Array(analyser.frequencyBinCount);\n' +
      '  analyser.getByteFrequencyData(freqData); // spectrum\n' +
      '  const timeData = new Uint8Array(analyser.fftSize);\n' +
      '  analyser.getByteTimeDomainData(timeData); // waveform\n' +
      '  requestAnimationFrame(draw);\n}\n\n' +
      '// frequencyBinCount: ' +
      (analyser ? analyser.frequencyBinCount : Number(fftSizeSelect.value) / 2) +
      '\n' +
      '// đang phát: ' +
      (oscillator ? 'có' : 'không');
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function loop() {
    draw();
    updateStatusLine();
    updateJsCodeDisplay();
    requestAnimationFrame(loop);
  }

  freqValueEl.textContent = freqRange.value + ' Hz';
  smoothingValueEl.textContent = Number(smoothingRange.value).toFixed(2);
  log('Sẵn sàng. Bấm "Phát" rồi kéo tần số/dạng sóng để thấy waveform và spectrum phản ứng trực tiếp.');
  loop();
})();
