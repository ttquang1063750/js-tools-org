/* Bài 8: Dự Án — Music Visualizer — trống máy tổng hợp thật + FFT + beat detection + particle system */
(function () {
  const canvas = document.getElementById('mv-canvas');
  if (!canvas) return;

  const sensitivityRange = document.getElementById('mv-sensitivity-range');
  const sensitivityValueEl = document.getElementById('mv-sensitivity-value');
  const playBtn = document.getElementById('mv-play-btn');
  const stopBtn = document.getElementById('mv-stop-btn');
  const resetBtn = document.getElementById('mv-reset-btn');
  const logEl = document.getElementById('mv-log');
  const statusLineEl = document.getElementById('mv-status-line');
  const jsCodeDisplay = document.getElementById('mv-js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 560;
  const CSS_H = 320;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  let audioContext = null;
  let masterGain = null;
  let analyser = null;
  let freqData = null;
  let noiseBuffer = null;
  let isPlaying = false;

  const BPM = 120;
  const STEP_DURATION = 60 / BPM / 4; // nốt 16
  const LOOKAHEAD = 0.1;
  const SCHEDULER_INTERVAL_MS = 25;
  const KICK_STEPS = new Set([0, 4, 8, 12]);
  const HAT_STEPS = new Set([1, 3, 5, 7, 9, 11, 13, 15]);
  const BASS_NOTES = [110.0, 110.0, 146.83, 130.81]; // A2, A2, D3, C3
  const ARP_SCALE = [440, 523.25, 659.25, 523.25]; // A4, C5, E5, C5

  let currentStep = 0;
  let nextStepTime = 0;
  let schedulerTimer = null;

  let bassHistory = [];
  const HISTORY_SIZE = 43;
  let lastBeatTime = -999;
  let beatCount = 0;
  let particles = [];
  let flashAlpha = 0;

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

  function ensureAudioGraph() {
    ensureContext();
    if (!masterGain) {
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.8;
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      masterGain.connect(analyser).connect(audioContext.destination);
      logOk('Tạo master mix bus: masterGain → AnalyserNode(fftSize=512) → destination.');
    }
    if (!noiseBuffer) {
      const bufferSize = Math.floor(audioContext.sampleRate * 0.1);
      noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    }
  }

  function playKick(time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain).connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  function playHat(time) {
    const src = audioContext.createBufferSource();
    src.buffer = noiseBuffer;
    const hp = audioContext.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp).connect(gain).connect(masterGain);
    src.start(time);
    src.stop(time + 0.06);
  }

  function playBass(freq, time, dur) {
    const osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.4, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function playArp(freq, time) {
    const osc = audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.15, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain).connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  function scheduleStep(step, time) {
    const s = step % 16;
    if (KICK_STEPS.has(s)) playKick(time);
    if (HAT_STEPS.has(s)) playHat(time);
    if (step % 4 === 0) playBass(BASS_NOTES[(step / 4) % BASS_NOTES.length], time, STEP_DURATION * 4);
    playArp(ARP_SCALE[step % ARP_SCALE.length], time);
  }

  function scheduler() {
    while (nextStepTime < audioContext.currentTime + LOOKAHEAD) {
      scheduleStep(currentStep, nextStepTime);
      nextStepTime += STEP_DURATION;
      currentStep++;
    }
    schedulerTimer = setTimeout(scheduler, SCHEDULER_INTERVAL_MS);
  }

  function doPlay() {
    if (isPlaying) {
      log('Đã đang phát.');
      return;
    }
    ensureAudioGraph();
    currentStep = 0;
    nextStepTime = audioContext.currentTime + 0.05;
    isPlaying = true;
    scheduler();
    logOk('Bắt đầu scheduler trống máy — BPM 120, look-ahead 100ms, kiểm tra lại mỗi 25ms.');
  }

  function doStop() {
    if (!isPlaying) {
      log('Chưa phát gì.');
      return;
    }
    isPlaying = false;
    clearTimeout(schedulerTimer);
    logOk('Đã dừng scheduler. Nốt đang ngân sẽ tự tắt theo bao bì gain đã lên lịch.');
  }

  function doReset() {
    doStop();
    clearLog();
    particles = [];
    beatCount = 0;
    bassHistory = [];
    flashAlpha = 0;
    sensitivityRange.value = 1.3;
    sensitivityValueEl.textContent = '1.3';
    log('Đã reset demo. Bấm "Phát nhạc demo" để bắt đầu.');
  }

  playBtn.addEventListener('click', doPlay);
  stopBtn.addEventListener('click', doStop);
  resetBtn.addEventListener('click', doReset);
  sensitivityRange.addEventListener('input', () => {
    sensitivityValueEl.textContent = Number(sensitivityRange.value).toFixed(2);
  });

  function detectBeat(bassEnergy, now) {
    bassHistory.push(bassEnergy);
    if (bassHistory.length > HISTORY_SIZE) bassHistory.shift();
    const avg = bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length;
    const sensitivity = Number(sensitivityRange.value);
    const isBeat = bassEnergy > avg * sensitivity && bassEnergy > 0.15 && now - lastBeatTime > 0.2;
    if (isBeat) lastBeatTime = now;
    return isBeat;
  }

  function spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function updateParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 0.02;
    });
    particles = particles.filter((p) => p.life > 0);
  }

  function drawParticles() {
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawFrequencyRing(cx, cy) {
    const bars = 64;
    const binsPerBar = Math.floor(freqData.length / bars);
    const baseRadius = 60;
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < binsPerBar; j++) sum += freqData[i * binsPerBar + j];
      const amplitude = sum / binsPerBar / 255;
      const angle = (i / bars) * Math.PI * 2;
      const r2 = baseRadius + amplitude * 110;
      const hue = (i / bars) * 300;
      ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * baseRadius, cy + Math.sin(angle) * baseRadius);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(15, 15, 27, 0.25)';
    ctx.fillRect(0, 0, CSS_W, CSS_H);

    if (analyser) {
      analyser.getByteFrequencyData(freqData);
      drawFrequencyRing(CSS_W / 2, CSS_H / 2);

      let bassSum = 0;
      for (let i = 0; i < 8; i++) bassSum += freqData[i];
      const bassEnergy = bassSum / 8 / 255;

      if (isPlaying && detectBeat(bassEnergy, audioContext.currentTime)) {
        flashAlpha = 1;
        beatCount++;
        spawnBurst(CSS_W / 2, CSS_H / 2, `hsl(${Math.random() * 360}, 90%, 65%)`, 24);
      }
    } else {
      ctx.fillStyle = '#6c7086';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Bấm "Phát nhạc demo" để bắt đầu', CSS_W / 2, CSS_H / 2);
    }

    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.15})`;
      ctx.fillRect(0, 0, CSS_W, CSS_H);
      flashAlpha -= 0.05;
    }

    updateParticles();
    drawParticles();
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      '  |  ' +
      (isPlaying ? 'đang phát' : 'im lặng') +
      '  |  nhịp đã bắt: ' +
      beatCount;
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🎧 BÀI 8: MUSIC VISUALIZER */\n\n' +
      'analyser.getByteFrequencyData(freqData);\n' +
      'const bassEnergy = avg(freqData.slice(0, 8)) / 255;\n\n' +
      'const isBeat = bassEnergy > avgHistory * ' +
      Number(sensitivityRange.value).toFixed(2) +
      ' && now - lastBeatTime > 0.2;\n' +
      'if (isBeat) spawnBurst(cx, cy, randomColor, 24);\n\n' +
      '// Trạng thái: ' +
      (isPlaying ? 'trống máy đang phát' : 'im lặng') +
      ', nhịp đã bắt: ' +
      beatCount +
      ', particle sống: ' +
      particles.length;

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

  log('Sẵn sàng. Bấm "Phát nhạc demo" để nghe trống máy thật và xem visualizer phản ứng theo nhịp.');
  loop();
})();
