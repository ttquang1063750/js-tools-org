document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-rf-mode');

  const groupTuning = document.getElementById('group-tuning-controls');
  const groupDemod = document.getElementById('group-demod-controls');
  const legendBox = document.getElementById('rf-legend-box');

  const sliderInductance = document.getElementById('slider-inductance');
  const sliderCapacitance = document.getElementById('slider-capacitance');
  const sliderFstation = document.getElementById('slider-fstation');

  const selectChannel = document.getElementById('select-channel');
  const sliderCfilter = document.getElementById('slider-cfilter');

  const labelInductance = document.getElementById('label-inductance');
  const labelCapacitance = document.getElementById('label-capacitance');
  const labelFstation = document.getElementById('label-fstation');
  const labelCfilter = document.getElementById('label-cfilter');

  const valF0 = document.getElementById('val-f0');
  const valTuneStatus = document.getElementById('val-tune-status');
  const valAudioQuality = document.getElementById('val-audio-quality');

  const svgComponents = document.getElementById('rf-svg-components');

  const canvasScope = document.getElementById('rf-scope');
  const ctxScope = canvasScope.getContext('2d');

  // State
  let mode = selectMode.value;
  let L = parseFloat(sliderInductance.value); // uH
  let C = parseFloat(sliderCapacitance.value); // pF
  let fStation = parseFloat(sliderFstation.value); // kHz

  let fc = parseFloat(selectChannel.value); // kHz
  let Cfilter = parseFloat(sliderCfilter.value); // nF

  let time = 0;

  function resizeCanvas() {
    canvasScope.width = canvasScope.parentElement.clientWidth;
    canvasScope.height = 140;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Draw dynamic SVG Circuit
  function updateSVG() {
    let html = '';

    if (mode === 'tuning') {
      // 1. Tuning Mode SVG: Antenna -> LC Resonator -> Speaker
      html += '<line x1="30" y1="140" x2="330" y2="140" stroke="#585b70" stroke-width="2" />';

      // Antenna on left
      html += '<line x1="40" y1="80" x2="40" y2="50" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="30" y1="50" x2="50" y2="50" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="40" y1="50" x2="30" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="40" y1="50" x2="50" y2="40" stroke="#fab387" stroke-width="2" />';

      // Wire to LC tank (x=120 to 180, y=80)
      html += '<line x1="40" y1="80" x2="100" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="100" y1="80" x2="100" y2="50" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="100" y1="80" x2="100" y2="110" stroke="#cdd6f4" stroke-width="2" />';

      // Inductor L (top branch)
      html += '<line x1="100" y1="50" x2="110" y2="50" stroke="#cdd6f4" stroke-width="2" />';
      // Loop coils
      html +=
        '<path d="M 110 50 Q 115 40, 120 50 Q 125 40, 130 50 Q 135 40, 140 50 Q 145 40, 150 50" fill="none" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="150" y1="50" x2="160" y2="50" stroke="#cdd6f4" stroke-width="2" />';
      html += '<text x="130" y="32" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">L</text>';

      // Variable Capacitor C (bottom branch)
      html += '<line x1="100" y1="110" x2="122" y2="110" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="122" y1="102" x2="122" y2="118" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="128" y1="102" x2="128" y2="118" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="128" y1="110" x2="160" y2="110" stroke="#cdd6f4" stroke-width="2" />';
      // Variable capacitor arrow
      html += '<path d="M 116 122 L 134 98" fill="none" stroke="#f38ba8" stroke-width="1.5" />';
      html += '<polygon points="134,98 131,102 129,99" fill="#f38ba8" />';
      html += '<text x="125" y="132" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">C</text>';

      // Tank output node
      html += '<line x1="160" y1="50" x2="160" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="160" y1="110" x2="160" y2="80" stroke="#cdd6f4" stroke-width="2" />';

      // Ground connection of tank
      html += '<line x1="160" y1="110" x2="160" y2="140" stroke="#585b70" stroke-width="2" />';

      // Speaker on right (x=250, y=80)
      html += '<line x1="160" y1="80" x2="250" y2="80" stroke="#cdd6f4" stroke-width="2" />';

      // Speaker shell
      html += '<rect x="250" y="70" width="10" height="20" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" />';
      html += '<polygon points="260,70 275,60 275,100 260,90" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" />';

      // Sound waves if tuned
      const isTuned =
        Math.abs(L * C - (159155 * 159155) / (fStation * fStation)) < 3000 ||
        valTuneStatus.textContent.includes('cộng hưởng');
      if (valTuneStatus.textContent.includes('cộng hưởng')) {
        html += '<path d="M 285 73 Q 290 80, 285 87" fill="none" stroke="#f9e2af" stroke-width="1.5" />';
        html += '<path d="M 292 68 Q 299 80, 292 92" fill="none" stroke="#f9e2af" stroke-width="1.5" />';
      }

      html +=
        '<text x="130" y="160" fill="#a6e3a1" font-size="11" text-anchor="middle">LC Resonator (Chọn sóng)</text>';
    } else {
      // 2. Demodulator Mode: Antenna -> LC selector -> Diode -> RC filter -> Loa
      html += '<line x1="30" y1="140" x2="330" y2="140" stroke="#585b70" stroke-width="2" />';

      // Antenna
      html += '<line x1="30" y1="80" x2="30" y2="50" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="20" y1="50" x2="40" y2="50" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="30" y1="50" x2="20" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="30" y1="50" x2="40" y2="40" stroke="#fab387" stroke-width="2" />';

      // Selector block (Tuner)
      html += '<rect x="50" y="65" width="40" height="30" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<text x="70" y="83" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">LC</text>';
      html += '<line x1="30" y1="80" x2="50" y2="80" stroke="#cdd6f4" stroke-width="2" />';

      // Diode
      html += '<line x1="90" y1="80" x2="120" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      html += '<polygon points="120,74 120,86 132,80" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="132" y1="74" x2="132" y2="86" stroke="#a6e3a1" stroke-width="3" />';
      html += '<text x="126" y="65" fill="#a6e3a1" font-size="9" text-anchor="middle" font-weight="bold">D</text>';

      // RC filter (Resistor series, Capacitor parallel to ground)
      html += '<line x1="132" y1="80" x2="160" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      // Resistor R
      html += '<rect x="160" y="75" width="30" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<text x="175" y="68" fill="#89b4fa" font-size="8" text-anchor="middle">R</text>';
      html += '<line x1="190" y1="80" x2="220" y2="80" stroke="#cdd6f4" stroke-width="2" />';

      // Capacitor C_filter (parallel to ground at node x=210)
      html += '<line x1="210" y1="80" x2="210" y2="100" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="202" y1="100" x2="218" y2="100" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="202" y1="106" x2="218" y2="106" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="210" y1="106" x2="210" y2="140" stroke="#585b70" stroke-width="2" />';
      html += '<text x="228" y="107" fill="#89b4fa" font-size="8">Cf</text>';

      // Output to Speaker
      html += '<line x1="220" y1="80" x2="270" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      html += '<rect x="270" y="70" width="10" height="20" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" />';
      html += '<polygon points="280,70 295,60 295,100 280,90" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" />';

      // Sound waves depending on audio quality
      const qual = valAudioQuality.textContent;
      if (qual.includes('Trong trẻo')) {
        html += '<path d="M 305 73 Q 310 80, 305 87" fill="none" stroke="#a6e3a1" stroke-width="1.5" />';
        html += '<path d="M 312 68 Q 319 80, 312 92" fill="none" stroke="#a6e3a1" stroke-width="1.5" />';
      } else if (qual.includes('Nhiễu rít')) {
        html +=
          '<path d="M 305 70 L 310 75 L 305 80 L 310 85 L 305 90" fill="none" stroke="#f9e2af" stroke-width="1" />';
      }

      html +=
        '<text x="185" y="155" fill="#a6e3a1" font-size="11" text-anchor="middle">AM Detector & Filter (Tách sóng & Lọc)</text>';
    }

    svgComponents.innerHTML = html;
  }

  // Update calculations and display values
  function update() {
    mode = selectMode.value;

    if (mode === 'tuning') {
      groupTuning.style.display = 'block';
      groupDemod.style.display = 'none';

      L = parseFloat(sliderInductance.value);
      C = parseFloat(sliderCapacitance.value);
      fStation = parseFloat(sliderFstation.value);

      labelInductance.textContent = `${L} μH`;
      labelCapacitance.textContent = `${C} pF`;
      labelFstation.textContent = `${fStation} kHz`;

      // Resonance formula: f0 = 1 / (2*pi*sqrt(L*C))
      // L in uH, C in pF. f0 in kHz = 159155 / sqrt(L * C)
      const f0_khz = 159154.94 / Math.sqrt(L * C);
      valF0.textContent = `${f0_khz.toFixed(0)} kHz`;

      // Check resonance matching
      const dev = Math.abs(f0_khz - fStation);
      if (dev <= 15) {
        valTuneStatus.textContent = 'Đã cộng hưởng! 🎉';
        valTuneStatus.style.color = '#a6e3a1';
      } else if (dev <= 50) {
        valTuneStatus.textContent = 'Tín hiệu yếu (Lệch kênh nhẹ)';
        valTuneStatus.style.color = '#f9e2af';
      } else {
        valTuneStatus.textContent = 'Không có sóng (Lệch kênh)';
        valTuneStatus.style.color = '#f38ba8';
      }

      // Legend
      legendBox.innerHTML = `
        <span><span style="color: #89b4fa;">■</span> Đường đáp ứng LC</span>
        <span><span style="color: #fab387;">■</span> Tần số đài phát</span>
      `;
    } else {
      groupTuning.style.display = 'none';
      groupDemod.style.display = 'block';

      fc = parseFloat(selectChannel.value);
      Cfilter = parseFloat(sliderCfilter.value);

      labelCfilter.textContent = `${Cfilter} nF`;

      // Hằng số thời gian tau = R * C. R = 10k ohms. C in nF.
      // tau = 10k * C_nf = C_nf * 10 us.
      // Standard carrier periods:
      // at 1000kHz, Tc = 1 us.
      // Audio frequency fa = 1kHz, Ta = 1000 us.
      // Ideal Cfilter around 3nF to 12nF
      if (Cfilter < 3) {
        valAudioQuality.textContent = 'Nhiễu rít (Lọc thiếu, rò sóng mang)';
        valAudioQuality.style.color = '#f9e2af';
      } else if (Cfilter <= 15) {
        valAudioQuality.textContent = 'Trong trẻo (Bộ lọc hoàn hảo)';
        valAudioQuality.style.color = '#a6e3a1';
      } else {
        valAudioQuality.textContent = 'Nghẹt tiếng (Lọc quá mức)';
        valAudioQuality.style.color = '#f38ba8';
      }

      // Legend
      legendBox.innerHTML = `
        <span><span style="color: #fab387;">■</span> Sóng mang AM</span>
        <span><span style="color: #f9e2af;">■</span> Sau Đi-ốt</span>
        <span><span style="color: #89b4fa;">■</span> Âm thanh loa</span>
      `;
    }

    updateSVG();
  }

  // Draw scope waveforms
  function drawScope() {
    ctxScope.clearRect(0, 0, canvasScope.width, canvasScope.height);
    const w = canvasScope.width;
    const h = canvasScope.height;
    const midY = h / 2;

    if (mode === 'tuning') {
      // Draw Spectrum plot (Amplitude vs Frequency)
      ctxScope.strokeStyle = '#313244';
      ctxScope.lineWidth = 1;
      ctxScope.beginPath();
      ctxScope.moveTo(10, h - 10);
      ctxScope.lineTo(w - 10, h - 10); // horizontal axis
      ctxScope.moveTo(10, 10);
      ctxScope.lineTo(10, h - 10); // vertical axis
      ctxScope.stroke();

      // Calculate f0 of LC tank
      const f0_khz = 159154.94 / Math.sqrt(L * C);

      // Plot resonance curve
      // bell curve: A(f) = 1 / sqrt(1 + Q^2 * (f/f0 - f0/f)^2)
      const Q = 15; // Quality factor

      ctxScope.strokeStyle = '#89b4fa';
      ctxScope.lineWidth = 2;
      ctxScope.beginPath();
      for (let x = 10; x < w - 10; x++) {
        // Map x to frequency from 400kHz to 1800kHz
        const f = 400 + ((x - 10) / (w - 20)) * 1300;

        // Bell shape
        const ratio = f / f0_khz;
        const denom = Math.sqrt(1 + Q * Q * Math.pow(ratio - 1 / ratio, 2));
        const amp = (h - 30) / denom;

        const y = h - 10 - amp;
        if (x === 10) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();

      // Draw vertical line for fStation
      const xStation = 10 + ((fStation - 400) / 1300) * (w - 20);
      ctxScope.strokeStyle = '#fab387';
      ctxScope.lineWidth = 1.5;
      ctxScope.setLineDash([3, 3]);
      ctxScope.beginPath();
      ctxScope.moveTo(xStation, 10);
      ctxScope.lineTo(xStation, h - 10);
      ctxScope.stroke();
      ctxScope.setLineDash([]);

      // Draw labels
      ctxScope.fillStyle = '#fab387';
      ctxScope.font = '8px monospace';
      ctxScope.fillText(`Đài:${fStation}kHz`, xStation - 20, 20);
      ctxScope.fillStyle = '#89b4fa';
      ctxScope.fillText(`LC:${f0_khz.toFixed(0)}kHz`, 10 + ((f0_khz - 400) / 1300) * (w - 20) - 20, h - 15);
    } else {
      // AM Demodulator waveforms
      // We will plot:
      // 1. Modulated AM (Orange): high frequency carrier wave modulated by 1kHz audio
      // 2. Rectified (Yellow): positive part only
      // 3. Audio out (Blue): filtered signal

      const scaleY = h / 3.5;

      // Carrier frequency on screen (scaled for visualization)
      const f_carrier = fc / 30; // 600kHz -> 20, 1000kHz -> 33, 1400kHz -> 46
      const f_audio = 0.5; // Audio frequency on screen (1kHz)

      // 1. Plot Modulated AM Carrier
      ctxScope.strokeStyle = '#fab387'; // Orange
      ctxScope.lineWidth = 1;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const omega_c = (Math.PI * 2 * f_carrier) / w;
        const omega_a = (Math.PI * 2 * f_audio) / w;

        // Modulating wave: envelope
        const envelope = 1 + 0.65 * Math.sin(omega_a * x - time);
        // Carrier wave
        const carrier = Math.sin(omega_c * x - time * 12);

        const val = envelope * carrier;
        const y = midY - val * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();

      // 2. Plot Rectified AM (Yellow)
      ctxScope.strokeStyle = '#f9e2af'; // Yellow
      ctxScope.lineWidth = 1.2;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const omega_c = (Math.PI * 2 * f_carrier) / w;
        const omega_a = (Math.PI * 2 * f_audio) / w;

        const envelope = 1 + 0.65 * Math.sin(omega_a * x - time);
        const carrier = Math.sin(omega_c * x - time * 12);

        const val = Math.max(0, envelope * carrier); // Half-wave rectification
        const y = midY - val * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();

      // 3. Plot Filtered Audio Output (Blue)
      ctxScope.strokeStyle = '#89b4fa'; // Blue
      ctxScope.lineWidth = 2.5;
      ctxScope.beginPath();

      // Demodulation filter modeling:
      // If Cfilter is small: output follows envelope but with carrier ripples
      // If Cfilter is ideal: output is smooth envelope (offset subtracted, center aligned)
      // If Cfilter is large: output is flat line (DC average)
      for (let x = 0; x < w; x++) {
        const omega_a = (Math.PI * 2 * f_audio) / w;
        const omega_c = (Math.PI * 2 * f_carrier) / w;

        const envelope = 1 + 0.65 * Math.sin(omega_a * x - time);

        let audioOut = 0;

        if (Cfilter < 3) {
          // Low capacitance: carrier ripple leaks
          // We add sawtooth-like ripple
          const ripple = 0.15 * Math.sin(omega_c * x - time * 12);
          audioOut = envelope - 1 + ripple;
        } else if (Cfilter <= 15) {
          // Ideal filter: smooth audio wave
          audioOut = envelope - 1;
        } else {
          // Large capacitance: flatline
          // Attenuated audio wave + heavy DC offset flattened
          const att = Math.max(0.01, 1 - (Cfilter - 15) / 85);
          audioOut = (envelope - 1) * att;
        }

        const y = midY - audioOut * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();

      time += 0.04;
    }

    requestAnimationFrame(drawScope);
  }

  // Event Listeners
  selectMode.addEventListener('change', update);
  sliderInductance.addEventListener('input', update);
  sliderCapacitance.addEventListener('input', update);
  sliderFstation.addEventListener('input', update);

  selectChannel.addEventListener('change', update);
  sliderCfilter.addEventListener('input', update);

  // Init
  update();
  drawScope();
});
