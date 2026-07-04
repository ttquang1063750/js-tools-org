/* Bài 2: Oscillator & Synthesis — mini synth phím máy tính với ADSR envelope thật qua GainNode */
(function () {
  const canvas = document.getElementById('synth-canvas');
  if (!canvas) return;

  const waveformSelect = document.getElementById('synth-waveform-select');
  const detuneRange = document.getElementById('synth-detune-range');
  const detuneValueEl = document.getElementById('synth-detune-value');
  const attackRange = document.getElementById('synth-attack-range');
  const attackValueEl = document.getElementById('synth-attack-value');
  const decayRange = document.getElementById('synth-decay-range');
  const decayValueEl = document.getElementById('synth-decay-value');
  const sustainRange = document.getElementById('synth-sustain-range');
  const sustainValueEl = document.getElementById('synth-sustain-value');
  const releaseRange = document.getElementById('synth-release-range');
  const releaseValueEl = document.getElementById('synth-release-value');
  const resetBtn = document.getElementById('synth-reset-btn');
  const pianoRowEl = document.getElementById('synth-piano-row');
  const logEl = document.getElementById('synth-log');
  const statusLineEl = document.getElementById('synth-status-line');
  const jsCodeDisplay = document.getElementById('synth-js-code-display');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const CSS_W = 560;
  const CSS_H = 180;
  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  ctx.scale(dpr, dpr);

  const KEY_ORDER = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];
  const NOTE_NAMES = [
    'C4',
    'C#4',
    'D4',
    'D#4',
    'E4',
    'F4',
    'F#4',
    'G4',
    'G#4',
    'A4',
    'A#4',
    'B4',
    'C5',
    'C#5',
    'D5',
    'D#5',
    'E5',
  ];
  const BASE_MIDI = 60; // C4

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  let audioContext = null;
  const activeNotes = new Map(); // key -> { oscillator, gainNode, startTime, releaseTime, keyEl }

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

  function noteOn(key) {
    if (activeNotes.has(key)) return;
    const idx = KEY_ORDER.indexOf(key);
    if (idx === -1) return;
    ensureContext();

    const attack = Number(attackRange.value);
    const decay = Number(decayRange.value);
    const sustain = Number(sustainRange.value);
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = waveformSelect.value;
    oscillator.frequency.setValueAtTime(midiToFreq(BASE_MIDI + idx), now);
    oscillator.detune.setValueAtTime(Number(detuneRange.value), now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    oscillator.connect(gainNode).connect(audioContext.destination);
    oscillator.start();

    const keyEl = pianoRowEl.querySelector('[data-key="' + key + '"]');
    if (keyEl) keyEl.classList.add('is-active');

    activeNotes.set(key, { oscillator, gainNode, startTime: now, releaseTime: null, keyEl });
    log(
      'note-on ' +
        NOTE_NAMES[idx] +
        ' (' +
        waveformSelect.value +
        ') → attack ' +
        attack.toFixed(2) +
        's, decay ' +
        decay.toFixed(2) +
        's tới sustain ' +
        sustain.toFixed(2) +
        '.'
    );
  }

  function noteOff(key) {
    const note = activeNotes.get(key);
    if (!note) return;
    const release = Number(releaseRange.value);
    const now = audioContext.currentTime;
    note.gainNode.gain.cancelScheduledValues(now);
    note.gainNode.gain.setValueAtTime(note.gainNode.gain.value, now);
    note.gainNode.gain.linearRampToValueAtTime(0, now + release);
    note.oscillator.stop(now + release);
    note.releaseTime = now;
    if (note.keyEl) note.keyEl.classList.remove('is-active');
    note.oscillator.onended = () => {
      note.oscillator.disconnect();
      note.gainNode.disconnect();
    };
    activeNotes.delete(key);
    logOk(
      'note-off → release ' + release.toFixed(2) + 's, stop() lúc currentTime=' + (now + release).toFixed(2) + 's.'
    );
  }

  function buildPianoRow() {
    pianoRowEl.innerHTML = '';
    KEY_ORDER.forEach((key, idx) => {
      const btn = document.createElement('div');
      btn.className = 'piano-key';
      btn.dataset.key = key;
      const noteSpan = document.createElement('div');
      noteSpan.className = 'piano-key__note';
      noteSpan.textContent = NOTE_NAMES[idx];
      const keySpan = document.createElement('div');
      keySpan.textContent = key.toUpperCase();
      btn.appendChild(noteSpan);
      btn.appendChild(keySpan);
      btn.addEventListener('mousedown', () => noteOn(key));
      btn.addEventListener('mouseup', () => noteOff(key));
      btn.addEventListener('mouseleave', () => noteOff(key));
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        noteOn(key);
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        noteOff(key);
      });
      pianoRowEl.appendChild(btn);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (KEY_ORDER.includes(key)) noteOn(key);
  });
  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (KEY_ORDER.includes(key)) noteOff(key);
  });

  detuneRange.addEventListener('input', () => {
    const value = Number(detuneRange.value);
    detuneValueEl.textContent = value + '¢';
    activeNotes.forEach((note) => {
      if (audioContext) note.oscillator.detune.setValueAtTime(value, audioContext.currentTime);
    });
  });
  attackRange.addEventListener('input', () => {
    attackValueEl.textContent = Number(attackRange.value).toFixed(2) + 's';
  });
  decayRange.addEventListener('input', () => {
    decayValueEl.textContent = Number(decayRange.value).toFixed(2) + 's';
  });
  sustainRange.addEventListener('input', () => {
    sustainValueEl.textContent = Number(sustainRange.value).toFixed(2);
  });
  releaseRange.addEventListener('input', () => {
    releaseValueEl.textContent = Number(releaseRange.value).toFixed(2) + 's';
  });
  waveformSelect.addEventListener('change', () => {
    activeNotes.forEach((note) => {
      note.oscillator.type = waveformSelect.value;
    });
    log('Đổi dạng sóng → "' + waveformSelect.value + '".');
  });

  resetBtn.addEventListener('click', () => {
    activeNotes.forEach((note, key) => noteOff(key));
    clearLog();
    log('Đã reset demo. Gõ phím hoặc bấm vào đàn phím bên dưới để chơi.');
  });

  function drawEnvelope() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const attack = Number(attackRange.value);
    const decay = Number(decayRange.value);
    const sustain = Number(sustainRange.value);
    const release = Number(releaseRange.value);
    const holdDuration = 0.4; // fixed visual sustain-hold width
    const totalDuration = attack + decay + holdDuration + release;

    const padX = 20;
    const padTop = 20;
    const padBottom = 30;
    const plotW = CSS_W - padX * 2;
    const plotH = CSS_H - padTop - padBottom;
    const baseY = padTop + plotH;

    function xAt(t) {
      return padX + (t / totalDuration) * plotW;
    }
    function yAt(g) {
      return baseY - g * plotH;
    }

    const points = [
      [0, 0],
      [attack, 1],
      [attack + decay, sustain],
      [attack + decay + holdDuration, sustain],
      [attack + decay + holdDuration + release, 0],
    ];

    const anyActive = activeNotes.size > 0;
    ctx.strokeStyle = anyActive ? '#a855f7' : '#45475a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(([t, g], i) => {
      const x = xAt(t);
      const y = yAt(g);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#6c7086';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', xAt(attack / 2), baseY + 14);
    ctx.fillText('D', xAt(attack + decay / 2), baseY + 14);
    ctx.fillText('S', xAt(attack + decay + holdDuration / 2), baseY + 14);
    ctx.fillText('R', xAt(attack + decay + holdDuration + release / 2), baseY + 14);

    // playhead for the most recently pressed/released note
    let marker = null;
    activeNotes.forEach((note) => {
      const elapsed = audioContext ? audioContext.currentTime - note.startTime : 0;
      marker = Math.min(elapsed, attack + decay + holdDuration);
    });
    if (marker !== null) {
      const mx = xAt(marker);
      ctx.beginPath();
      ctx.arc(
        mx,
        yAt(
          marker <= attack
            ? marker / attack
            : marker <= attack + decay
              ? 1 - ((marker - attack) / decay) * (1 - sustain)
              : sustain
        ),
        4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#f9e2af';
      ctx.fill();
    }
  }

  function updateStatusLine() {
    statusLineEl.textContent =
      'AudioContext: ' +
      (audioContext ? audioContext.state : '(chưa tạo)') +
      '  |  Phím đang giữ: ' +
      (activeNotes.size ? [...activeNotes.keys()].map((k) => k.toUpperCase()).join(', ') : '(không)');
  }

  function updateJsCodeDisplay() {
    const code =
      '/* 🎹 BÀI 2: OSCILLATOR & SYNTHESIS */\n\n' +
      'function noteOn(freq) {\n' +
      '  const osc = ctx.createOscillator();\n' +
      '  const gain = ctx.createGain();\n' +
      '  osc.type = "' +
      waveformSelect.value +
      '";\n' +
      '  osc.frequency.value = freq;\n' +
      '  osc.detune.value = ' +
      detuneRange.value +
      '; // cents\n' +
      '  gain.gain.setValueAtTime(0, now);\n' +
      '  gain.gain.linearRampToValueAtTime(1, now + ' +
      Number(attackRange.value).toFixed(2) +
      '); // Attack\n' +
      '  gain.gain.linearRampToValueAtTime(' +
      Number(sustainRange.value).toFixed(2) +
      ', now + attack + ' +
      Number(decayRange.value).toFixed(2) +
      '); // Decay→Sustain\n' +
      '  osc.connect(gain).connect(ctx.destination);\n' +
      '  osc.start();\n}\n\n' +
      'function noteOff(note) {\n' +
      '  note.gain.gain.linearRampToValueAtTime(0, now + ' +
      Number(releaseRange.value).toFixed(2) +
      '); // Release\n' +
      '  note.osc.stop(now + release);\n}\n\n' +
      '// Phím đang giữ: ' +
      (activeNotes.size ? [...activeNotes.keys()].join(', ') : '(không)');
    if (jsCodeDisplay) {
      jsCodeDisplay.textContent = code;
      if (window.Prism) window.Prism.highlightElement(jsCodeDisplay);
    }
  }

  function loop() {
    drawEnvelope();
    updateStatusLine();
    updateJsCodeDisplay();
    requestAnimationFrame(loop);
  }

  buildPianoRow();
  detuneValueEl.textContent = detuneRange.value + '¢';
  attackValueEl.textContent = Number(attackRange.value).toFixed(2) + 's';
  decayValueEl.textContent = Number(decayRange.value).toFixed(2) + 's';
  sustainValueEl.textContent = Number(sustainRange.value).toFixed(2);
  releaseValueEl.textContent = Number(releaseRange.value).toFixed(2) + 's';
  log('Sẵn sàng. Gõ phím A W S E D F T G Y H U J K O L P ; hoặc bấm vào đàn phím bên dưới.');
  loop();
})();
