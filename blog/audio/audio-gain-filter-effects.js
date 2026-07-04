/* Bài 3: Gain, Filter & Hiệu Ứng — bàn trộn filter/delay/reverb thật qua Web Audio API */
(function () {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;

  const playBtn = document.getElementById('fx-play-btn');
  const stopBtn = document.getElementById('fx-stop-btn');
  const resetBtn = document.getElementById('fx-reset-btn');
  const filterTypeSelect = document.getElementById('fx-filter-type-select');
  const cutoffRange = document.getElementById('fx-cutoff-range');
  const cutoffValueEl = document.getElementById('fx-cutoff-value');
  const qRange = document.getElementById('fx-q-range');
  const qValueEl = document.getElementById('fx-q-value');
  const delayTimeRange = document.getElementById('fx-delaytime-range');
  const delayTimeValueEl = document.getElementById('fx-delaytime-value');
  const feedbackRange = document.getElementById('fx-feedback-range');
  const feedbackValueEl = document.getElementById('fx-feedback-value');
  const delayMixRange = document.getElementById('fx-delaymix-range');
  const delayMixValueEl = document.getElementById('fx-delaymix-value');
  const reverbMixRange = document.getElementById('fx-reverbmix-range');
  const reverbMixValueEl = document.getElementById('fx-reverbmix-value');
  const dryMixRange = document.getElementById('fx-drymix-range');
  const dryMixValueEl = document.getElementById('fx-drymix-value');
  const logEl = document.getElementById('fx-log');
  const statusLineEl = document.getElementById('fx-status-line');
  const jsCodeDisplay = document.getElementById('fx-js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 560;
  const CSS_H = 240;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let audioContext = null;
  let oscillator = null;
  let filterNode = null;
  let dryGain = null;
  let delayNode = null;
  let delayFeedbackGain = null;
  let delayWetGain = null;
  let convolverNode = null;
  let reverbWetGain = null;

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

  function createImpulseResponse(context, duration, decay) {
    const rate = context.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = context.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
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
      log('Đã đang phát — kéo slider bên dưới để nghe thay đổi trực tiếp.');
      return;
    }
    const now = audioContext.currentTime;

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, now);

    filterNode = audioContext.createBiquadFilter();
    filterNode.type = filterTypeSelect.value;
    filterNode.frequency.setValueAtTime(Number(cutoffRange.value), now);
    filterNode.Q.setValueAtTime(Number(qRange.value), now);

    dryGain = audioContext.createGain();
    dryGain.gain.setValueAtTime(Number(dryMixRange.value), now);

    delayNode = audioContext.createDelay(1.0);
    delayNode.delayTime.setValueAtTime(Number(delayTimeRange.value), now);
    delayFeedbackGain = audioContext.createGain();
    delayFeedbackGain.gain.setValueAtTime(Number(feedbackRange.value), now);
    delayWetGain = audioContext.createGain();
    delayWetGain.gain.setValueAtTime(Number(delayMixRange.value), now);

    convolverNode = audioContext.createConvolver();
    convolverNode.buffer = createImpulseResponse(audioContext, 2, 3);
    reverbWetGain = audioContext.createGain();
    reverbWetGain.gain.setValueAtTime(Number(reverbMixRange.value), now);

    oscillator.connect(filterNode);
    filterNode.connect(dryGain).connect(audioContext.destination);
    filterNode.connect(delayNode);
    delayNode.connect(delayFeedbackGain).connect(delayNode);
    delayNode.connect(delayWetGain).connect(audioContext.destination);
    filterNode.connect(convolverNode).connect(reverbWetGain).connect(audioContext.destination);

    oscillator.start();
    logOk(
      'Đồ thị: Oscillator → Filter → [Dry | Delay(feedback loop) | Convolver] → destination. start() lúc ' +
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
    [oscillator, filterNode, dryGain, delayNode, delayFeedbackGain, delayWetGain, convolverNode, reverbWetGain].forEach(
      (node) => node && node.disconnect()
    );
    oscillator = null;
    filterNode = null;
    dryGain = null;
    delayNode = null;
    delayFeedbackGain = null;
    delayWetGain = null;
    convolverNode = null;
    reverbWetGain = null;
    logOk('Đã dừng — mọi node bị disconnect(), oscillator đã stop().');
  }

  function doReset() {
    doStop();
    clearLog();
    log('Đã reset demo. Bấm "Phát" để bắt đầu.');
  }

  playBtn.addEventListener('click', doPlay);
  stopBtn.addEventListener('click', doStop);
  resetBtn.addEventListener('click', doReset);

  filterTypeSelect.addEventListener('change', () => {
    if (filterNode) filterNode.type = filterTypeSelect.value;
  });
  cutoffRange.addEventListener('input', () => {
    const value = Number(cutoffRange.value);
    cutoffValueEl.textContent = value + ' Hz';
    if (filterNode && audioContext) filterNode.frequency.setValueAtTime(value, audioContext.currentTime);
  });
  qRange.addEventListener('input', () => {
    const value = Number(qRange.value);
    qValueEl.textContent = value.toFixed(1);
    if (filterNode && audioContext) filterNode.Q.setValueAtTime(value, audioContext.currentTime);
  });
  delayTimeRange.addEventListener('input', () => {
    const value = Number(delayTimeRange.value);
    delayTimeValueEl.textContent = value.toFixed(2) + 's';
    if (delayNode && audioContext) delayNode.delayTime.setValueAtTime(value, audioContext.currentTime);
  });
  feedbackRange.addEventListener('input', () => {
    const value = Number(feedbackRange.value);
    feedbackValueEl.textContent = value.toFixed(2);
    if (delayFeedbackGain && audioContext) delayFeedbackGain.gain.setValueAtTime(value, audioContext.currentTime);
  });
  delayMixRange.addEventListener('input', () => {
    const value = Number(delayMixRange.value);
    delayMixValueEl.textContent = value.toFixed(2);
    if (delayWetGain && audioContext) delayWetGain.gain.setValueAtTime(value, audioContext.currentTime);
  });
  reverbMixRange.addEventListener('input', () => {
    const value = Number(reverbMixRange.value);
    reverbMixValueEl.textContent = value.toFixed(2);
    if (reverbWetGain && audioContext) reverbWetGain.gain.setValueAtTime(value, audioContext.currentTime);
  });
  dryMixRange.addEventListener('input', () => {
    const value = Number(dryMixRange.value);
    dryMixValueEl.textContent = value.toFixed(2);
    if (dryGain && audioContext) dryGain.gain.setValueAtTime(value, audioContext.currentTime);
  });

  function drawBox(x, y, w, h, label, active) {
    ctx.fillStyle = active ? '#a855f7' : '#45475a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = active ? '#c084fc' : '#1e1e2e';
    ctx.lineWidth = active ? 2 : 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.textBaseline = 'alphabetic';
  }
  function drawLine(x1, y1, x2, y2, active) {
    ctx.strokeStyle = active ? '#a855f7' : '#45475a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const playing = !!oscillator;
    const dryOn = playing && Number(dryMixRange.value) > 0;
    const delayOn = playing && Number(delayMixRange.value) > 0;
    const reverbOn = playing && Number(reverbMixRange.value) > 0;

    const oscX = 20;
    const filterX = 150;
    const branchX = 300;
    const destX = 470;
    const boxW = 100;
    const boxH = 36;
    const rowDry = 30;
    const rowDelay = 90;
    const rowReverb = 150;
    const midY = 90;

    drawLine(oscX + boxW, midY + boxH / 2, filterX, midY + boxH / 2, playing);
    drawBox(oscX, midY, boxW, boxH, 'Oscillator', playing);
    drawBox(filterX, midY, boxW, boxH, 'Filter', playing);

    drawLine(filterX + boxW, midY + boxH / 2, branchX, rowDry + boxH / 2, dryOn);
    drawLine(filterX + boxW, midY + boxH / 2, branchX, rowDelay + boxH / 2, delayOn);
    drawLine(filterX + boxW, midY + boxH / 2, branchX, rowReverb + boxH / 2, reverbOn);

    drawBox(branchX, rowDry, boxW, boxH, 'Dry', dryOn);
    drawBox(branchX, rowDelay, boxW, boxH, 'Delay', delayOn);
    drawBox(branchX, rowReverb, boxW, boxH, 'Convolver', reverbOn);

    drawLine(branchX + boxW, rowDry + boxH / 2, destX, midY + boxH / 2, dryOn);
    drawLine(branchX + boxW, rowDelay + boxH / 2, destX, midY + boxH / 2, delayOn);
    drawLine(branchX + boxW, rowReverb + boxH / 2, destX, midY + boxH / 2, reverbOn);
    drawBox(destX, midY, 70, boxH, '🔊', playing);

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🟪 nhánh đang góp âm lượng > 0   ⬛ tắt/mix = 0', 10, CSS_H - 10);
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      (oscillator ? '  |  đang phát' : '  |  im lặng');
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🎛️ BÀI 3: GAIN, FILTER & HIỆU ỨNG */\n\n' +
      'osc.connect(filter);\n' +
      'filter.connect(dryGain).connect(ctx.destination);\n\n' +
      'filter.connect(delay);\n' +
      'delay.connect(feedbackGain).connect(delay); // vòng lặp echo\n' +
      'delay.connect(delayWetGain).connect(ctx.destination);\n\n' +
      'filter.connect(convolver).connect(reverbWetGain).connect(ctx.destination);\n\n' +
      '// Trạng thái hiện tại:\n' +
      '// filter: ' +
      filterTypeSelect.value +
      ' @ ' +
      cutoffRange.value +
      'Hz, Q=' +
      Number(qRange.value).toFixed(1) +
      '\n' +
      '// delay: ' +
      Number(delayTimeRange.value).toFixed(2) +
      's, feedback=' +
      Number(feedbackRange.value).toFixed(2) +
      ', mix=' +
      Number(delayMixRange.value).toFixed(2) +
      '\n' +
      '// reverb mix: ' +
      Number(reverbMixRange.value).toFixed(2) +
      ' | dry mix: ' +
      Number(dryMixRange.value).toFixed(2) +
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

  log('Sẵn sàng. Bấm "Phát" rồi kéo slider filter/delay/reverb để nghe hiệu ứng thay đổi trực tiếp.');
  loop();
})();
