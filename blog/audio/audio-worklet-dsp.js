/* Bài 7: AudioWorklet & DSP — Bitcrusher thật chạy trên luồng audio riêng qua AudioWorkletNode */
(function () {
  const canvas = document.getElementById('bc-canvas');
  if (!canvas) return;

  const bitsRange = document.getElementById('bc-bits-range');
  const bitsValueEl = document.getElementById('bc-bits-value');
  const reductionRange = document.getElementById('bc-reduction-range');
  const reductionValueEl = document.getElementById('bc-reduction-value');
  const playBtn = document.getElementById('bc-play-btn');
  const stopBtn = document.getElementById('bc-stop-btn');
  const burstBtn = document.getElementById('bc-burst-btn');
  const resetBtn = document.getElementById('bc-reset-btn');
  const logEl = document.getElementById('bc-log');
  const statusLineEl = document.getElementById('bc-status-line');
  const jsCodeDisplay = document.getElementById('bc-js-code-display');

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
  let workletReady = false;
  let oscillator = null;
  let gainNode = null;
  let workletNode = null;
  let analyser = null;
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

  async function ensureWorklet() {
    ensureContext();
    if (!audioContext.audioWorklet) {
      throw new Error('Trình duyệt này không hỗ trợ AudioWorklet.');
    }
    if (!workletReady) {
      await audioContext.audioWorklet.addModule('audio-worklet-dsp-processor.js');
      workletReady = true;
      logOk('audioWorklet.addModule() xong — processor "bitcrusher-processor" đã đăng ký.');
    }
  }

  async function doPlay() {
    if (oscillator) {
      log('Đã đang phát — kéo slider để nghe/nhìn thay đổi trực tiếp.');
      return;
    }
    try {
      await ensureWorklet();
    } catch (err) {
      logErr(err.message);
      return;
    }
    const now = audioContext.currentTime;

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, now);

    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.25, now);

    workletNode = new AudioWorkletNode(audioContext, 'bitcrusher-processor');
    workletNode.parameters.get('bits').setValueAtTime(Number(bitsRange.value), now);
    workletNode.parameters.get('reduction').setValueAtTime(Number(reductionRange.value), now);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    timeData = new Uint8Array(analyser.fftSize);

    oscillator.connect(gainNode).connect(workletNode).connect(analyser).connect(audioContext.destination);
    oscillator.start();
    logOk('connect(): Oscillator(sawtooth) → Gain → AudioWorkletNode(bitcrusher) → Analyser → destination. start().');
  }

  function doStop() {
    if (!oscillator) {
      log('Chưa có gì đang phát.');
      return;
    }
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    workletNode.disconnect();
    analyser.disconnect();
    oscillator = null;
    gainNode = null;
    workletNode = null;
    analyser = null;
    logOk('Đã dừng — oscillator.stop(), mọi node disconnect().');
  }

  function doBurst() {
    if (!workletNode) {
      log('Cần bấm "Phát" trước.');
      return;
    }
    workletNode.port.postMessage({ type: 'burst', samples: 4410 });
    logOk('port.postMessage({type: "burst"}) → processor phát 0.1s nhiễu trắng, xử lý rời rạc bên trong luồng audio.');
  }

  function doReset() {
    doStop();
    clearLog();
    bitsRange.value = 8;
    reductionRange.value = 1;
    bitsValueEl.textContent = '8';
    reductionValueEl.textContent = '1';
    log('Đã reset demo. Bấm "Phát" để bắt đầu.');
  }

  playBtn.addEventListener('click', doPlay);
  stopBtn.addEventListener('click', doStop);
  burstBtn.addEventListener('click', doBurst);
  resetBtn.addEventListener('click', doReset);

  bitsRange.addEventListener('input', () => {
    const v = Number(bitsRange.value);
    bitsValueEl.textContent = String(v);
    if (workletNode && audioContext) workletNode.parameters.get('bits').setValueAtTime(v, audioContext.currentTime);
  });
  reductionRange.addEventListener('input', () => {
    const v = Number(reductionRange.value);
    reductionValueEl.textContent = String(v);
    if (workletNode && audioContext)
      workletNode.parameters.get('reduction').setValueAtTime(v, audioContext.currentTime);
  });

  function drawWaveform() {
    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Waveform sau bitcrusher (getByteTimeDomainData)', 8, 14);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (timeData && analyser) {
      analyser.getByteTimeDomainData(timeData);
      const sliceWidth = CSS_W / timeData.length;
      let x = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128 - 1;
        const y = CSS_H / 2 + (v * (CSS_H - 40)) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
    } else {
      ctx.moveTo(0, CSS_H / 2);
      ctx.lineTo(CSS_W, CSS_H / 2);
    }
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    drawWaveform();
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      '  |  worklet: ' +
      (workletReady ? 'đã đăng ký' : 'chưa nạp') +
      '  |  ' +
      (oscillator ? 'đang phát' : 'im lặng');
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🔧 BÀI 7: AUDIOWORKLET & DSP TUỲ BIẾN */\n\n' +
      "await ctx.audioWorklet.addModule('bitcrusher-processor.js');\n" +
      "const node = new AudioWorkletNode(ctx, 'bitcrusher-processor');\n\n" +
      "node.parameters.get('bits').setValueAtTime(" +
      bitsRange.value +
      ', ctx.currentTime); // AudioParam — liên tục\n' +
      "node.parameters.get('reduction').setValueAtTime(" +
      reductionRange.value +
      ', ctx.currentTime);\n\n' +
      "node.port.postMessage({ type: 'burst', samples: 4410 }); // rời rạc, 1 lần\n\n" +
      '// Trạng thái: ' +
      (workletReady ? 'processor đã đăng ký' : 'chưa nạp processor') +
      ', ' +
      (oscillator ? 'đang phát' : 'im lặng');

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

  log('Sẵn sàng. Bấm "Phát" để nạp AudioWorklet và nghe bitcrusher thật.');
  loop();
})();
