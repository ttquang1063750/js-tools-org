document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-filter-mode');
  const sliderFreq = document.getElementById('slider-freq');
  const sliderRes = document.getElementById('slider-res');
  const sliderCap = document.getElementById('slider-cap');
  
  const labelFreq = document.getElementById('label-freq');
  const labelRes = document.getElementById('label-res');
  const labelCap = document.getElementById('label-cap');
  
  const valFc = document.getElementById('val-fc');
  const valGainLpf = document.getElementById('val-gain-lpf');
  const valGainHpf = document.getElementById('val-gain-hpf');
  const valPhase = document.getElementById('val-phase');
  
  const svgComponents = document.getElementById('filter-svg-components');
  
  const canvasBode = document.getElementById('canvas-bode');
  const ctxBode = canvasBode.getContext('2d');
  
  const canvasScope = document.getElementById('canvas-scope');
  const ctxScope = canvasScope.getContext('2d');
  
  // State
  let mode = selectMode.value;
  let freq = 1000; // Hz
  let R = parseFloat(sliderRes.value); // ohms
  let C = parseFloat(sliderCap.value) * 1e-6; // F
  let time = 0;
  
  function resizeCanvases() {
    canvasBode.width = canvasBode.parentElement.clientWidth;
    canvasBode.height = 120;
    canvasScope.width = canvasScope.parentElement.clientWidth;
    canvasScope.height = 120;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // Logarithmic slider helper
  function sliderToFreq(val) {
    // val goes from 1 to 100. Let's map it to 10Hz to 20kHz
    const minF = Math.log10(10);
    const maxF = Math.log10(20000);
    const scale = minF + (maxF - minF) * (val - 1) / 99;
    return Math.pow(10, scale);
  }
  
  function freqToSlider(f) {
    const minF = Math.log10(10);
    const maxF = Math.log10(20000);
    const val = 1 + 99 * (Math.log10(f) - minF) / (maxF - minF);
    return val;
  }

  // Draw dynamic SVG Circuit
  function updateSVG() {
    let html = '';
    
    if (mode === 'lowpass') {
      // Series Resistor R
      html += '<rect x="100" y="35" width="40" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="30" y1="40" x2="100" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="140" y1="40" x2="220" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<text x="120" y="25" fill="#89b4fa" font-size="11" text-anchor="middle" font-weight="bold">R</text>';
      
      // Parallel Capacitor C
      html += '<line x1="220" y1="40" x2="220" y2="75" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="210" y1="75" x2="230" y2="75" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="210" y1="83" x2="230" y2="83" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="220" y1="83" x2="220" y2="140" stroke="#585b70" stroke-width="2" />';
      html += '<text x="245" y="84" fill="#a6e3a1" font-size="11" font-weight="bold">C</text>';
      
      // Output load connection
      html += '<line x1="220" y1="40" x2="330" y2="40" stroke="#89b4fa" stroke-width="2" />';
    }
    else if (mode === 'highpass') {
      // Series Capacitor C
      html += '<line x1="110" y1="30" x2="110" y2="50" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="118" y1="30" x2="118" y2="50" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="30" y1="40" x2="110" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="118" y1="40" x2="220" y2="40" stroke="#a6e3a1" stroke-width="2" />';
      html += '<text x="114" y="22" fill="#a6e3a1" font-size="11" text-anchor="middle" font-weight="bold">C</text>';
      
      // Parallel Resistor R
      html += '<line x1="220" y1="40" x2="220" y2="70" stroke="#89b4fa" stroke-width="2" />';
      html += '<rect x="215" y="70" width="10" height="20" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<line x1="220" y1="90" x2="220" y2="140" stroke="#585b70" stroke-width="2" />';
      html += '<text x="235" y="85" fill="#89b4fa" font-size="11" font-weight="bold">R</text>';
      
      // Output load connection
      html += '<line x1="220" y1="40" x2="330" y2="40" stroke="#89b4fa" stroke-width="2" />';
    }
    else if (mode === 'crossover') {
      // Input splits at x = 70
      html += '<line x1="30" y1="40" x2="70" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="70" y1="40" x2="70" y2="110" stroke="#fab387" stroke-width="2" />';
      
      // Top path (HPF - Capacitor C in series to Tweeter Loa)
      html += '<line x1="70" y1="40" x2="110" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="110" y1="30" x2="110" y2="50" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="118" y1="30" x2="118" y2="50" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="118" y1="40" x2="180" y2="40" stroke="#a6e3a1" stroke-width="2" />';
      html += '<text x="114" y="22" fill="#a6e3a1" font-size="10" text-anchor="middle">C</text>';
      
      // Tweeter Speaker Box
      html += '<rect x="180" y="25" width="40" height="30" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" rx="3" />';
      html += '<text x="200" y="44" fill="#89b4fa" font-size="10" text-anchor="middle" font-weight="bold">Treble</text>';
      html += '<line x1="220" y1="40" x2="280" y2="40" stroke="#585b70" stroke-width="2" />';
      
      // Bottom path (LPF - Inductor L in series to Woofer Loa)
      html += '<line x1="70" y1="110" x2="100" y2="110" stroke="#fab387" stroke-width="2" />';
      // Inductor coil graphic
      html += '<path d="M 100 110 Q 105 100, 110 110 Q 115 100, 120 110 Q 125 100, 130 110 Q 135 100, 140 110" fill="none" stroke="#f9e2af" stroke-width="2" />';
      html += '<line x1="140" y1="110" x2="180" y2="110" stroke="#f9e2af" stroke-width="2" />';
      html += '<text x="120" y="95" fill="#f9e2af" font-size="10" text-anchor="middle">L</text>';
      
      // Woofer Speaker Box
      html += '<rect x="180" y="95" width="40" height="30" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" rx="3" />';
      html += '<text x="200" y="114" fill="#a6e3a1" font-size="10" text-anchor="middle" font-weight="bold">Bass</text>';
      html += '<line x1="220" y1="110" x2="280" y2="110" stroke="#585b70" stroke-width="2" />';
      
      // Return to ground
      html += '<line x1="280" y1="40" x2="280" y2="140" stroke="#585b70" stroke-width="2" />';
    }
    
    svgComponents.innerHTML = html;
  }

  // Update logic
  function update() {
    mode = selectMode.value;
    freq = sliderToFreq(parseFloat(sliderFreq.value));
    R = parseFloat(sliderRes.value);
    
    // UI Label formatting
    if (freq >= 1000) {
      labelFreq.textContent = `${(freq/1000).toFixed(2)} kHz`;
    } else {
      labelFreq.textContent = `${freq.toFixed(0)} Hz`;
    }
    
    labelRes.textContent = `${R} Ω`;
    
    const fc = 1 / (2 * Math.PI * R * (parseFloat(sliderCap.value) * 1e-6));
    valFc.textContent = fc >= 1000 ? `${(fc/1000).toFixed(2)} kHz` : `${fc.toFixed(0)} Hz`;
    
    if (mode === 'crossover') {
      // In Crossover mode, we design C for HPF and L for LPF at the same cutoff frequency
      // L = R / (2*pi*fc)
      // C = 1 / (2*pi*R*fc)
      // Slider controls C. We sync fc and calculate equivalent L.
      C = parseFloat(sliderCap.value) * 1e-6; // F
      labelCap.textContent = `${sliderCap.value} uF`;
      
      // HPF Gain (Treble)
      const ratioHPF = freq / fc;
      const gainHPF = ratioHPF / Math.sqrt(1 + ratioHPF * ratioHPF);
      const gainDbHPF = 20 * Math.log10(gainHPF);
      valGainHpf.textContent = `${gainDbHPF.toFixed(1)} dB`;
      
      // LPF Gain (Bass)
      const ratioLPF = freq / fc;
      const gainLPF = 1 / Math.sqrt(1 + ratioLPF * ratioLPF);
      const gainDbLPF = 20 * Math.log10(gainLPF);
      valGainLpf.textContent = `${gainDbLPF.toFixed(1)} dB`;
      
      // Phase
      const phaseLPF = -Math.atan(freq / fc) * 180 / Math.PI;
      valPhase.textContent = `${phaseLPF.toFixed(0)}°`;
    } 
    else {
      C = parseFloat(sliderCap.value) * 1e-6;
      labelCap.textContent = `${sliderCap.value} uF`;
      
      const ratio = freq / fc;
      if (mode === 'lowpass') {
        const gain = 1 / Math.sqrt(1 + ratio * ratio);
        const gainDb = 20 * Math.log10(gain);
        valGainLpf.textContent = `${gainDb.toFixed(1)} dB`;
        valGainHpf.textContent = 'N/A';
        const phase = -Math.atan(ratio) * 180 / Math.PI;
        valPhase.textContent = `${phase.toFixed(0)}°`;
      } else {
        const gain = ratio / Math.sqrt(1 + ratio * ratio);
        const gainDb = 20 * Math.log10(gain);
        valGainHpf.textContent = `${gainDb.toFixed(1)} dB`;
        valGainLpf.textContent = 'N/A';
        const phase = (Math.atan(fc / freq)) * 180 / Math.PI;
        valPhase.textContent = `${phase.toFixed(0)}°`;
      }
    }
    
    updateSVG();
    drawBodePlot();
  }

  // Draw Bode Plot
  function drawBodePlot() {
    ctxBode.clearRect(0, 0, canvasBode.width, canvasBode.height);
    const w = canvasBode.width;
    const h = canvasBode.height;
    
    const paddingLeft = 35;
    const paddingTop = 10;
    const paddingRight = 10;
    const paddingBottom = 20;
    
    const plotW = w - paddingLeft - paddingRight;
    const plotH = h - paddingTop - paddingBottom;
    
    // Draw background grid
    ctxBode.strokeStyle = '#313244';
    ctxBode.lineWidth = 1;
    
    // Draw frequency axes log-scale lines
    // Frequencies: 10Hz, 100Hz, 1kHz, 10kHz, 20kHz
    const frequencies = [10, 100, 1000, 10000, 20000];
    const minF = Math.log10(10);
    const maxF = Math.log10(20000);
    
    frequencies.forEach(f => {
      const x = paddingLeft + plotW * (Math.log10(f) - minF) / (maxF - minF);
      ctxBode.beginPath();
      ctxBode.moveTo(x, paddingTop);
      ctxBode.lineTo(x, paddingTop + plotH);
      ctxBode.stroke();
      
      // Text
      ctxBode.fillStyle = '#a6adc8';
      ctxBode.font = '8px monospace';
      ctxBode.textAlign = 'center';
      let label = f >= 1000 ? `${f/1000}k` : f;
      ctxBode.fillText(label, x, h - 5);
    });
    
    // Draw dB Gain horizontal grid lines (0dB to -40dB, step 10dB)
    const dBValues = [0, -10, -20, -30, -40];
    dBValues.forEach(db => {
      const y = paddingTop + plotH * (db / -40);
      ctxBode.beginPath();
      ctxBode.moveTo(paddingLeft, y);
      ctxBode.lineTo(w - paddingRight, y);
      ctxBode.stroke();
      
      // Text
      ctxBode.fillStyle = '#a6adc8';
      ctxBode.font = '8px monospace';
      ctxBode.textAlign = 'right';
      ctxBode.fillText(`${db}dB`, paddingLeft - 5, y + 3);
    });
    
    // Calculate fc
    const fc = 1 / (2 * Math.PI * R * (parseFloat(sliderCap.value) * 1e-6));
    
    // Plot Curves
    if (mode === 'lowpass' || mode === 'crossover') {
      ctxBode.strokeStyle = '#a6e3a1'; // Green for LPF
      ctxBode.lineWidth = 2;
      ctxBode.beginPath();
      for (let px = 0; px <= plotW; px++) {
        const logF = minF + (maxF - minF) * px / plotW;
        const curF = Math.pow(10, logF);
        const r = curF / fc;
        const gain = 1 / Math.sqrt(1 + r * r);
        const db = 20 * Math.log10(gain);
        const py = paddingTop + plotH * (Math.max(-40, db) / -40);
        if (px === 0) ctxBode.moveTo(paddingLeft + px, py);
        else ctxBode.lineTo(paddingLeft + px, py);
      }
      ctxBode.stroke();
    }
    
    if (mode === 'highpass' || mode === 'crossover') {
      ctxBode.strokeStyle = '#89b4fa'; // Blue for HPF
      ctxBode.lineWidth = 2;
      ctxBode.beginPath();
      for (let px = 0; px <= plotW; px++) {
        const logF = minF + (maxF - minF) * px / plotW;
        const curF = Math.pow(10, logF);
        const r = curF / fc;
        const gain = r / Math.sqrt(1 + r * r);
        const db = 20 * Math.log10(gain);
        const py = paddingTop + plotH * (Math.max(-40, db) / -40);
        if (px === 0) ctxBode.moveTo(paddingLeft + px, py);
        else ctxBode.lineTo(paddingLeft + px, py);
      }
      ctxBode.stroke();
    }
    
    // Draw Current Signal Dot (Red)
    const dotX = paddingLeft + plotW * (Math.log10(freq) - minF) / (maxF - minF);
    const r = freq / fc;
    
    if (mode === 'lowpass') {
      const gain = 1 / Math.sqrt(1 + r * r);
      const db = 20 * Math.log10(gain);
      const dotY = paddingTop + plotH * (Math.max(-40, db) / -40);
      ctxBode.fillStyle = '#f38ba8';
      ctxBode.beginPath();
      ctxBode.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctxBode.fill();
    } 
    else if (mode === 'highpass') {
      const gain = r / Math.sqrt(1 + r * r);
      const db = 20 * Math.log10(gain);
      const dotY = paddingTop + plotH * (Math.max(-40, db) / -40);
      ctxBode.fillStyle = '#f38ba8';
      ctxBode.beginPath();
      ctxBode.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctxBode.fill();
    }
    else if (mode === 'crossover') {
      // Draw dots on both curves
      const gainL = 1 / Math.sqrt(1 + r * r);
      const dbL = 20 * Math.log10(gainL);
      const dotYL = paddingTop + plotH * (Math.max(-40, dbL) / -40);
      
      const gainH = r / Math.sqrt(1 + r * r);
      const dbH = 20 * Math.log10(gainH);
      const dotYH = paddingTop + plotH * (Math.max(-40, dbH) / -40);
      
      ctxBode.fillStyle = '#f38ba8';
      ctxBode.beginPath();
      ctxBode.arc(dotX, dotYL, 4, 0, 2 * Math.PI);
      ctxBode.arc(dotX, dotYH, 4, 0, 2 * Math.PI);
      ctxBode.fill();
    }
    
    // Draw cutoff frequency line (dashed yellow)
    const fcX = paddingLeft + plotW * (Math.log10(fc) - minF) / (maxF - minF);
    ctxBode.strokeStyle = '#f9e2af';
    ctxBode.setLineDash([3, 3]);
    ctxBode.beginPath();
    ctxBode.moveTo(fcX, paddingTop);
    ctxBode.lineTo(fcX, paddingTop + plotH);
    ctxBode.stroke();
    ctxBode.setLineDash([]);
  }

  // Draw Waveform Scope
  function drawScope() {
    ctxScope.clearRect(0, 0, canvasScope.width, canvasScope.height);
    const w = canvasScope.width;
    const h = canvasScope.height;
    const midY = h / 2;
    const amp = h / 2 - 10;
    
    const fc = 1 / (2 * Math.PI * R * (parseFloat(sliderCap.value) * 1e-6));
    const r = freq / fc;
    
    // 1. Draw Input wave (Orange)
    ctxScope.strokeStyle = '#fab387';
    ctxScope.lineWidth = 1.5;
    ctxScope.beginPath();
    for (let x = 0; x < w; x++) {
      // Maintain fixed visually appealing wave cycles on screen
      // Slower animation speed
      const val = Math.sin((Math.PI * 4 * x) / w - time);
      const y = midY - val * amp * 0.7;
      if (x === 0) ctxScope.moveTo(x, y);
      else ctxScope.lineTo(x, y);
    }
    ctxScope.stroke();

    // 2. Draw Output waves
    if (mode === 'lowpass') {
      const gain = 1 / Math.sqrt(1 + r * r);
      const phase = -Math.atan(r); // rad
      ctxScope.strokeStyle = '#a6e3a1'; // Green
      ctxScope.lineWidth = 2;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const val = gain * Math.sin((Math.PI * 4 * x) / w - time + phase);
        const y = midY - val * amp * 0.7;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
    } 
    else if (mode === 'highpass') {
      const gain = r / Math.sqrt(1 + r * r);
      const phase = Math.atan(fc / freq); // rad
      ctxScope.strokeStyle = '#89b4fa'; // Blue
      ctxScope.lineWidth = 2;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const val = gain * Math.sin((Math.PI * 4 * x) / w - time + phase);
        const y = midY - val * amp * 0.7;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
    }
    else if (mode === 'crossover') {
      // Draw Bass Output (Green)
      const gainL = 1 / Math.sqrt(1 + r * r);
      const phaseL = -Math.atan(r);
      ctxScope.strokeStyle = '#a6e3a1';
      ctxScope.lineWidth = 1.5;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const val = gainL * Math.sin((Math.PI * 4 * x) / w - time + phaseL);
        const y = midY - val * amp * 0.7;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();

      // Draw Treble Output (Blue)
      const gainH = r / Math.sqrt(1 + r * r);
      const phaseH = Math.atan(fc / freq);
      ctxScope.strokeStyle = '#89b4fa';
      ctxScope.lineWidth = 1.5;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const val = gainH * Math.sin((Math.PI * 4 * x) / w - time + phaseH);
        const y = midY - val * amp * 0.7;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
    }
    
    // Draw center dashed line
    ctxScope.strokeStyle = '#313244';
    ctxScope.setLineDash([5, 5]);
    ctxScope.beginPath();
    ctxScope.moveTo(0, midY); ctxScope.lineTo(w, midY);
    ctxScope.stroke();
    ctxScope.setLineDash([]);
    
    time += 0.05;
    requestAnimationFrame(drawScope);
  }

  // Event Listeners
  selectMode.addEventListener('change', update);
  sliderFreq.addEventListener('input', update);
  sliderRes.addEventListener('input', update);
  sliderCap.addEventListener('input', update);
  
  // Initialize
  update();
  drawScope();
});
