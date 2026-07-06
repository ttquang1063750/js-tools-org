document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-opamp-mode');
  
  const groupAmp = document.getElementById('group-amp-controls');
  const groupSchmitt = document.getElementById('group-schmitt-controls');
  const legendBox = document.getElementById('legend-box');
  
  const sliderRf = document.getElementById('slider-rf');
  const sliderR1 = document.getElementById('slider-r1');
  const sliderVin = document.getElementById('slider-vin');
  
  const sliderLdr = document.getElementById('slider-ldr');
  const sliderVref = document.getElementById('slider-vref');
  const sliderHyst = document.getElementById('slider-hyst');
  
  const labelRf = document.getElementById('label-rf');
  const labelR1 = document.getElementById('label-r1');
  const labelVin = document.getElementById('label-vin');
  
  const labelLdr = document.getElementById('label-ldr');
  const labelVref = document.getElementById('label-vref');
  const labelHyst = document.getElementById('label-hyst');
  
  const valGain = document.getElementById('val-gain');
  const valSatState = document.getElementById('val-saturation-state');
  const valVout = document.getElementById('val-vout');
  
  const valVut = document.getElementById('val-vut');
  const valVlt = document.getElementById('val-vlt');
  const valLedState = document.getElementById('val-led-state');
  
  const svgComponents = document.getElementById('opamp-svg-components');
  
  const canvasScope = document.getElementById('opamp-scope');
  const ctxScope = canvasScope.getContext('2d');
  
  // State
  let mode = selectMode.value;
  let Rf = parseFloat(sliderRf.value);
  let R1 = parseFloat(sliderR1.value);
  let vinAC = parseFloat(sliderVin.value);
  
  let Vldr = parseFloat(sliderLdr.value);
  let Vref = parseFloat(sliderVref.value);
  let Vh = parseFloat(sliderHyst.value);
  
  let time = 0;
  let runningData = []; // Store rolling graph data for Schmitt Trigger
  
  function resizeCanvas() {
    canvasScope.width = canvasScope.parentElement.clientWidth;
    canvasScope.height = 140;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Helper to draw standard Op-Amp triangle and pins in SVG
  function drawOpAmpTriangle(x, y) {
    let s = '';
    // Triangle pointing right
    s += `<polygon points="${x},${y-30} ${x},${y+30} ${x+50},${y}" fill="#1e1e2e" stroke="#a6e3a1" stroke-width="2" />`;
    // Minus and Plus signs inside
    s += `<text x="${x+8}" y="${y-12}" fill="#a6e3a1" font-size="12" font-weight="bold" font-family="sans-serif">-</text>`;
    s += `<text x="${x+8}" y="${y+18}" fill="#a6e3a1" font-size="12" font-weight="bold" font-family="sans-serif">+</text>`;
    return s;
  }

  // Draw dynamic SVG Circuit
  function updateSVG() {
    let html = '';
    
    if (mode === 'inverting') {
      // Wires and components for Inverting Amp
      // Ground line
      html += '<line x1="30" y1="140" x2="330" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Vin input (left to R1)
      html += '<line x1="30" y1="60" x2="80" y2="60" stroke="#fab387" stroke-width="2" />';
      html += '<circle cx="30" cy="60" r="10" fill="#1e1e2e" stroke="#fab387" stroke-width="2" />';
      html += `<text x="30" y="63" fill="#fab387" font-size="8" text-anchor="middle" font-weight="bold">AC</text>`;
      
      // Resistor R1
      html += '<rect x="80" y="55" width="40" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<text x="100" y="47" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">R1</text>';
      html += '<line x1="120" y1="60" x2="160" y2="60" stroke="#cdd6f4" stroke-width="2" />';
      
      // Feedback path Rf
      // Wire going up from x=140
      html += '<line x1="140" y1="60" x2="140" y2="30" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="140" y1="30" x2="160" y2="30" stroke="#cdd6f4" stroke-width="2" />';
      // Resistor Rf
      html += '<rect x="160" y="25" width="40" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<text x="180" y="18" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">Rf</text>';
      html += '<line x1="200" y1="30" x2="235" y2="30" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="235" y1="30" x2="235" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      
      // Op-Amp triangle (x=160, y=80. minus pin at 160,70. plus pin at 160,90)
      html += drawOpAmpTriangle(160, 80);
      html += '<line x1="140" y1="60" x2="160" y2="70" stroke="#cdd6f4" stroke-width="2" />'; // Inverting input connection
      
      // Non-inverting input to ground
      html += '<line x1="160" y1="90" x2="140" y2="90" stroke="#585b70" stroke-width="2" />';
      html += '<line x1="140" y1="90" x2="140" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Output connection (x=210, y=80)
      html += '<line x1="210" y1="80" x2="330" y2="80" stroke="#89b4fa" stroke-width="2" />';
      
      // Title
      html += '<text x="185" y="125" fill="#a6e3a1" font-size="11" text-anchor="middle">Inverting Amplifier</text>';
    } 
    else if (mode === 'noninverting') {
      // Non-Inverting Amp SVG
      html += '<line x1="30" y1="140" x2="330" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Vin input (left straight to Non-inverting node x=160, y=90)
      html += '<line x1="30" y1="90" x2="160" y2="90" stroke="#fab387" stroke-width="2" />';
      html += '<circle cx="30" cy="90" r="10" fill="#1e1e2e" stroke="#fab387" stroke-width="2" />';
      html += `<text x="30" y="93" fill="#fab387" font-size="8" text-anchor="middle" font-weight="bold">AC</text>`;
      
      // Op-Amp triangle (x=160, y=80)
      html += drawOpAmpTriangle(160, 80);
      
      // Inverting input network (x=160, y=70)
      // Wire going left and up
      html += '<line x1="160" y1="70" x2="120" y2="70" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="120" y1="70" x2="120" y2="30" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="120" y1="30" x2="150" y2="30" stroke="#cdd6f4" stroke-width="2" />';
      // Rf Resistor
      html += '<rect x="150" y="25" width="40" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<text x="170" y="18" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">Rf</text>';
      html += '<line x1="190" y1="30" x2="235" y2="30" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="235" y1="30" x2="235" y2="80" stroke="#cdd6f4" stroke-width="2" />';
      
      // R1 Resistor to ground
      html += '<line x1="120" y1="70" x2="80" y2="70" stroke="#cdd6f4" stroke-width="2" />';
      html += '<rect x="40" y="65" width="40" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="2" />';
      html += '<text x="60" y="57" fill="#89b4fa" font-size="9" text-anchor="middle" font-weight="bold">R1</text>';
      html += '<line x1="40" y1="70" x2="40" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Output
      html += '<line x1="210" y1="80" x2="330" y2="80" stroke="#89b4fa" stroke-width="2" />';
      
      html += '<text x="185" y="125" fill="#a6e3a1" font-size="11" text-anchor="middle">Non-Inverting Amplifier</text>';
    } 
    else if (mode === 'schmitt') {
      // Schmitt Trigger Circuit (Inverting comparator configuration)
      html += '<line x1="30" y1="140" x2="330" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Sensor Input (LDR) to Inverting node ($-$, x=160, y=70)
      html += '<line x1="30" y1="70" x2="160" y2="70" stroke="#fab387" stroke-width="2" />';
      html += '<circle cx="30" cy="70" r="10" fill="#1e1e2e" stroke="#fab387" stroke-width="2" />';
      html += `<text x="30" y="73" fill="#fab387" font-size="8" text-anchor="middle" font-weight="bold">LDR</text>`;
      
      // Op-Amp
      html += drawOpAmpTriangle(160, 80);
      
      // Positive feedback network to Plus node ($+$, x=160, y=90)
      html += '<line x1="160" y1="90" x2="130" y2="90" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="130" y1="90" x2="130" y2="115" stroke="#cdd6f4" stroke-width="2" />';
      
      // R1 resistor from Vref to Plus Node
      html += '<line x1="130" y1="115" x2="80" y2="115" stroke="#cdd6f4" stroke-width="2" />';
      html += '<rect x="80" y="110" width="30" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="95" y="103" fill="#89b4fa" font-size="8" text-anchor="middle">R1</text>';
      html += '<line x1="80" y1="115" x2="50" y2="115" stroke="#fab387" stroke-width="2" />';
      html += '<circle cx="50" cy="115" r="3" fill="#fab387" />';
      html += '<text x="50" y="130" fill="#fab387" font-size="8" text-anchor="middle">Vref</text>';
      
      // R2 Resistor (Feedback loop) from Output (x=210, y=80) to Plus Node (x=130, y=115)
      html += '<line x1="230" y1="80" x2="230" y2="115" stroke="#cdd6f4" stroke-width="2" />';
      html += '<line x1="230" y1="115" x2="180" y2="115" stroke="#cdd6f4" stroke-width="2" />';
      html += '<rect x="180" y="110" width="30" height="10" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="195" y="103" fill="#89b4fa" font-size="8" text-anchor="middle">R2</text>';
      html += '<line x1="180" y1="115" x2="130" y2="115" stroke="#cdd6f4" stroke-width="2" />';
      
      // Output to LED
      html += '<line x1="210" y1="80" x2="270" y2="80" stroke="#89b4fa" stroke-width="2" />';
      
      // LED Symbol
      const isLedOn = Vldr < (Vref - Vh / 2) || (Vldr < (Vref + Vh / 2) && valLedState.textContent === 'BẬT');
      const ledColor = isLedOn ? '#f9e2af' : '#45475a';
      
      html += `<polygon points="270,72 270,88 285,80" fill="${ledColor}" stroke="${ledColor}" stroke-width="1.5" />`;
      html += `<line x1="285" y1="72" x2="285" y2="88" stroke="${ledColor}" stroke-width="2.5" />`;
      html += '<line x1="285" y1="80" x2="310" y2="80" stroke="#585b70" stroke-width="2" />';
      html += '<line x1="310" y1="80" x2="310" y2="140" stroke="#585b70" stroke-width="2" />'; // LED ground
      
      // Arrows representing light emission from LED
      if (isLedOn) {
        html += '<path d="M 285 68 L 295 58 M 280 65 L 290 55" fill="none" stroke="#f9e2af" stroke-width="1" marker-end="url(#arrow)" />';
        // Yellow glow aura
        html += '<circle cx="278" cy="80" r="18" fill="#f9e2af" opacity="0.25" />';
      }
      
      html += '<text x="278" y="100" fill="#a6e3a1" font-size="10" text-anchor="middle">LED</text>';
      html += '<text x="185" y="150" fill="#a6e3a1" font-size="11" text-anchor="middle">Schmitt Trigger</text>';
    }

    svgComponents.innerHTML = html;
  }

  // Update logic
  function update() {
    mode = selectMode.value;
    
    if (mode === 'inverting' || mode === 'noninverting') {
      groupAmp.style.display = 'block';
      groupSchmitt.style.display = 'none';
      legendBox.style.display = 'flex';
      
      Rf = parseFloat(sliderRf.value);
      R1 = parseFloat(sliderR1.value);
      vinAC = parseFloat(sliderVin.value);
      
      labelRf.textContent = `${(Rf/1000).toFixed(0)} kΩ`;
      labelR1.textContent = `${(R1/1000).toFixed(1)} kΩ`;
      labelVin.textContent = `${vinAC.toFixed(1)} V`;
      
      let gain = 0;
      if (mode === 'inverting') {
        gain = -Rf / R1;
      } else {
        gain = 1 + Rf / R1;
      }
      
      valGain.textContent = gain.toFixed(1);
      
      // Check for saturation (Op-Amp rails at ±12V)
      const voutTheoretical = Math.abs(gain * vinAC);
      if (voutTheoretical >= 12.0) {
        valSatState.textContent = 'BÃO HOÀ (Cắt ngọn)';
        valSatState.style.color = '#f38ba8';
        valVout.textContent = '12.0 V';
      } else {
        valSatState.textContent = 'Tuyến tính (Sạch)';
        valSatState.style.color = '#a6e3a1';
        valVout.textContent = `${voutTheoretical.toFixed(1)} V`;
      }
    } 
    else if (mode === 'schmitt') {
      groupAmp.style.display = 'none';
      groupSchmitt.style.display = 'block';
      legendBox.style.display = 'none';
      
      Vldr = parseFloat(sliderLdr.value);
      Vref = parseFloat(sliderVref.value);
      Vh = parseFloat(sliderHyst.value);
      
      labelLdr.textContent = `${Vldr.toFixed(2)} V`;
      labelVref.textContent = `${Vref.toFixed(2)} V`;
      labelHyst.textContent = `${Vh.toFixed(2)} V`;
      
      // Calculate Upper and Lower thresholds
      const Vut = Vref + Vh / 2;
      const Vlt = Vref - Vh / 2;
      
      valVut.textContent = `${Vut.toFixed(2)} V`;
      valVlt.textContent = `${Vlt.toFixed(2)} V`;
      
      // Update LED state based on hysteresis
      let ledOn = false;
      // Inverting Schmitt Trigger:
      // If Vin > Vut, Vout -> LOW (LED OFF)
      // If Vin < Vlt, Vout -> HIGH (LED ON)
      if (valLedState.textContent === 'BẬT') {
        if (Vldr > Vut) {
          ledOn = false;
        } else {
          ledOn = true;
        }
      } else {
        if (Vldr < Vlt) {
          ledOn = true;
        } else {
          ledOn = false;
        }
      }
      
      valLedState.textContent = ledOn ? 'BẬT' : 'TẮT';
      valLedState.style.color = ledOn ? '#a6e3a1' : '#f38ba8';
    }
    
    updateSVG();
  }

  // Draw loop
  function drawScope() {
    ctxScope.clearRect(0, 0, canvasScope.width, canvasScope.height);
    const w = canvasScope.width;
    const h = canvasScope.height;
    const midY = h / 2;
    
    if (mode === 'inverting' || mode === 'noninverting') {
      // 1. Draw grid for AC waves
      ctxScope.strokeStyle = '#313244';
      ctxScope.lineWidth = 1;
      ctxScope.beginPath();
      ctxScope.moveTo(0, midY); ctxScope.lineTo(w, midY);
      ctxScope.stroke();
      
      // Scales
      const scaleY = (h / 2 - 10) / 15; // 15V maximum fits on screen
      let gain = (mode === 'inverting') ? -Rf / R1 : 1 + Rf / R1;
      
      // Plot Vin (Orange)
      ctxScope.strokeStyle = '#fab387';
      ctxScope.lineWidth = 1.5;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const omega = (Math.PI * 4) / w;
        const val = vinAC * Math.sin(omega * x - time);
        const y = midY - val * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
      
      // Plot Vout (Blue, showing gain and phase, clipping at ±12V)
      ctxScope.strokeStyle = '#89b4fa';
      ctxScope.lineWidth = 2.5;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const omega = (Math.PI * 4) / w;
        let val = gain * vinAC * Math.sin(omega * x - time);
        // Clip
        if (val > 12.0) val = 12.0;
        if (val < -12.0) val = -12.0;
        
        const y = midY - val * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
      
      time += 0.05;
    } 
    else if (mode === 'schmitt') {
      // 2. Schmitt Trigger rolling strip-chart visual
      // Draw grid
      ctxScope.strokeStyle = '#313244';
      ctxScope.lineWidth = 1;
      ctxScope.beginPath();
      for (let i = 1; i <= 4; i++) {
        const y = h - (h / 5) * i;
        ctxScope.moveTo(0, y);
        ctxScope.lineTo(w, y);
      }
      ctxScope.stroke();
      
      // Generate current value with noise
      // LDR voltage slider setting + some random noise
      // If slider is moved, we add random high freq noise
      const Vut = Vref + Vh / 2;
      const Vlt = Vref - Vh / 2;
      
      // Adding simulated sensor noise (răng cưa/gauss)
      const noise = (Math.random() - 0.5) * 0.3; // 0.3V noise
      const currentVin = Vldr + noise;
      
      // Calculate output using hysteresis state
      let currentVout = 0;
      let lastVout = runningData.length > 0 ? runningData[runningData.length - 1].vout : 0;
      
      if (lastVout === 5.0) {
        if (currentVin > Vut) {
          currentVout = 0.0;
        } else {
          currentVout = 5.0;
        }
      } else {
        if (currentVin < Vlt) {
          currentVout = 5.0;
        } else {
          currentVout = 0.0;
        }
      }
      
      // Add to data list, keep max 200 points
      runningData.push({ vin: currentVin, vout: currentVout });
      if (runningData.length > w) {
        runningData.shift();
      }
      
      // Scale: 0V is bottom, 5V is top. 1V = height / 6 pixels
      const scaleY = (h - 20) / 5.5;
      const offsetBottom = h - 10;
      
      // Plot Thresholds
      ctxScope.strokeStyle = '#f9e2af'; // Upper threshold (Yellow)
      ctxScope.setLineDash([4, 4]);
      ctxScope.lineWidth = 1;
      ctxScope.beginPath();
      ctxScope.moveTo(0, offsetBottom - Vut * scaleY);
      ctxScope.lineTo(w, offsetBottom - Vut * scaleY);
      ctxScope.stroke();
      
      ctxScope.strokeStyle = '#a6e3a1'; // Lower threshold (Green)
      ctxScope.beginPath();
      ctxScope.moveTo(0, offsetBottom - Vlt * scaleY);
      ctxScope.lineTo(w, offsetBottom - Vlt * scaleY);
      ctxScope.stroke();
      ctxScope.setLineDash([]);
      
      // Annotate thresholds on right
      ctxScope.fillStyle = '#f9e2af';
      ctxScope.font = '8px monospace';
      ctxScope.fillText(`Vut:${Vut.toFixed(2)}V`, w - 50, offsetBottom - Vut * scaleY - 3);
      ctxScope.fillStyle = '#a6e3a1';
      ctxScope.fillText(`Vlt:${Vlt.toFixed(2)}V`, w - 50, offsetBottom - Vlt * scaleY - 3);
      
      // Plot Vin rolling wave (Orange)
      ctxScope.strokeStyle = '#fab387';
      ctxScope.lineWidth = 1.5;
      ctxScope.beginPath();
      for (let i = 0; i < runningData.length; i++) {
        const x = i;
        const y = offsetBottom - runningData[i].vin * scaleY;
        if (i === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
      
      // Plot Vout rolling square wave (Blue)
      ctxScope.strokeStyle = '#89b4fa';
      ctxScope.lineWidth = 2.5;
      ctxScope.beginPath();
      for (let i = 0; i < runningData.length; i++) {
        const x = i;
        const y = offsetBottom - runningData[i].vout * scaleY;
        if (i === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
    }
    
    requestAnimationFrame(drawScope);
  }

  // Event Listeners
  selectMode.addEventListener('change', () => {
    runningData = []; // Clear data on mode swap
    update();
  });
  sliderRf.addEventListener('input', update);
  sliderR1.addEventListener('input', update);
  sliderVin.addEventListener('input', update);
  sliderLdr.addEventListener('input', update);
  sliderVref.addEventListener('input', update);
  sliderHyst.addEventListener('input', update);
  
  // Init
  update();
  drawScope();
});
