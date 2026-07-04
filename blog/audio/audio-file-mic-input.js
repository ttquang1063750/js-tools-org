/* Bài 5: File/Mic Input — decodeAudioData + getUserMedia thật, dùng chung 1 Analyser để vẽ waveform + đo RMS */
(function () {
  const canvas = document.getElementById('fm-canvas');
  if (!canvas) return;

  const fileInput = document.getElementById('fm-file-input');
  const playFileBtn = document.getElementById('fm-play-file-btn');
  const stopFileBtn = document.getElementById('fm-stop-file-btn');
  const micBtn = document.getElementById('fm-mic-btn');
  const resetBtn = document.getElementById('fm-reset-btn');
  const logEl = document.getElementById('fm-log');
  const statusLineEl = document.getElementById('fm-status-line');
  const jsCodeDisplay = document.getElementById('fm-js-code-display');

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
  let analyser = null;
  let timeData = null;
  let fileSource = null; // AudioBufferSourceNode hiện đang phát (nếu có)
  let micStream = null; // MediaStream từ getUserMedia
  let micSource = null; // MediaStreamAudioSourceNode
  let mode = null; // 'file' | 'mic' | null

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

  function ensureAnalyser() {
    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      timeData = new Uint8Array(analyser.fftSize);
    }
  }

  function stopFileSource(silent) {
    if (fileSource) {
      try {
        fileSource.stop();
      } catch (e) {
        /* đã dừng rồi thì bỏ qua */
      }
      fileSource.disconnect();
      fileSource = null;
      if (!silent) log('Đã dừng phát file.');
    }
    if (mode === 'file') mode = null;
  }

  function stopMic(silent) {
    if (micSource) {
      micSource.disconnect();
      micSource = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      micStream = null;
      if (!silent) log('Đã tắt mic — track.stop() giải phóng thiết bị.');
    }
    micBtn.textContent = '🎤 Bật mic';
    micBtn.classList.remove('is-active');
    if (mode === 'mic') mode = null;
  }

  async function doPlayFile() {
    const file = fileInput.files[0];
    if (!file) {
      log('Chưa chọn file âm thanh nào.');
      return;
    }
    ensureContext();
    stopMic(true);
    stopFileSource(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      ensureAnalyser();
      fileSource = audioContext.createBufferSource();
      fileSource.buffer = audioBuffer;
      fileSource.connect(analyser).connect(audioContext.destination);
      fileSource.onended = () => {
        if (fileSource) {
          logOk('File phát xong.');
          fileSource = null;
          if (mode === 'file') mode = null;
        }
      };
      fileSource.start();
      mode = 'file';
      logOk(
        'decodeAudioData xong (' +
          audioBuffer.duration.toFixed(2) +
          's, ' +
          audioBuffer.numberOfChannels +
          ' kênh) → BufferSource → Analyser → destination. start().'
      );
    } catch (err) {
      logErr('Không giải mã được file: ' + err.message);
    }
  }

  async function doToggleMic() {
    if (micStream) {
      stopMic();
      return;
    }
    ensureContext();
    stopFileSource(true);
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      logErr('Không truy cập được mic: ' + err.message);
      return;
    }
    ensureAnalyser();
    micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(analyser); // CHỦ Ý không nối destination — tránh vòng lặp hú (xem callout pitfall)
    mode = 'mic';
    micBtn.textContent = '⏹ Tắt mic';
    micBtn.classList.add('is-active');
    logOk('getUserMedia OK → MediaStreamSource → Analyser (KHÔNG nối destination, tránh hú). Đang phân tích mic.');
  }

  function doReset() {
    stopFileSource(true);
    stopMic(true);
    clearLog();
    log('Đã reset demo. Chọn file hoặc bật mic để bắt đầu.');
  }

  playFileBtn.addEventListener('click', doPlayFile);
  stopFileBtn.addEventListener('click', () => stopFileSource());
  micBtn.addEventListener('click', doToggleMic);
  resetBtn.addEventListener('click', doReset);

  function computeRMS() {
    if (!analyser || !timeData) return 0;
    analyser.getByteTimeDomainData(timeData);
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sumSquares += v * v;
    }
    return Math.sqrt(sumSquares / timeData.length);
  }

  function drawWaveform(top, height) {
    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Waveform (getByteTimeDomainData)', 8, top + 12);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (timeData && analyser) {
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
  }

  function drawRmsMeter(top, height, rms) {
    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RMS: ' + rms.toFixed(3), 8, top + 12);

    const barY = top + 24;
    const barH = height - 32;
    const maxW = CSS_W - 16;
    ctx.strokeStyle = '#313244';
    ctx.strokeRect(8, barY, maxW, barH);

    const w = Math.min(maxW, rms * maxW * 2.2);
    let color = '#22c55e';
    if (rms > 0.35) color = '#f38ba8';
    else if (rms > 0.15) color = '#f9e2af';
    ctx.fillStyle = color;
    ctx.fillRect(8, barY, w, barH);
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const rms = computeRMS();
    drawWaveform(0, CSS_H - 70);
    drawRmsMeter(CSS_H - 70, 70, rms);
  }

  function updateStatusLine() {
    const ctxState = audioContext ? audioContext.state : '(chưa tạo)';
    const modeLabel = mode === 'file' ? 'đang phát file' : mode === 'mic' ? 'đang nghe mic' : 'im lặng';
    statusLineEl.textContent = 'AudioContext: ' + ctxState + '  |  ' + modeLabel;
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🎙️ BÀI 5: FILE & MIC INPUT */\n\n' +
      '// Phát file:\n' +
      'const buf = await ctx.decodeAudioData(arrayBuffer);\n' +
      'const src = ctx.createBufferSource();\n' +
      'src.buffer = buf;\n' +
      'src.connect(analyser).connect(ctx.destination);\n' +
      'src.start();\n\n' +
      '// Mic (KHÔNG nối destination — tránh hú):\n' +
      'const stream = await navigator.mediaDevices.getUserMedia({ audio: true });\n' +
      'ctx.createMediaStreamSource(stream).connect(analyser);\n\n' +
      'function rms(timeData) {\n' +
      '  let sum = 0;\n' +
      '  for (const b of timeData) { const v = (b - 128) / 128; sum += v * v; }\n' +
      '  return Math.sqrt(sum / timeData.length);\n}\n\n' +
      '// Trạng thái: ' +
      (mode ? mode : 'im lặng') +
      ', RMS hiện tại: ' +
      computeRMS().toFixed(3);
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

  log('Sẵn sàng. Chọn 1 file âm thanh rồi bấm "Phát file", hoặc bật mic để xem waveform + RMS trực tiếp.');
  loop();
})();
