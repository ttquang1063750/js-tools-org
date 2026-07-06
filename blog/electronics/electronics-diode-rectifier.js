document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-mode');
  const sliderVin = document.getElementById('slider-vin');
  const sliderCap = document.getElementById('slider-cap');
  const sliderIload = document.getElementById('slider-iload');
  
  const labelVin = document.getElementById('label-vin');
  const labelCap = document.getElementById('label-cap');
  const labelIload = document.getElementById('label-iload');
  
  const valVpeak = document.getElementById('val-vpeak');
  const valVripple = document.getElementById('val-vripple');
  const valTemp = document.getElementById('val-temp');
  const valVout = document.getElementById('val-vout');
  
  const groupCap = document.getElementById('group-cap');
  const rowRipple = document.getElementById('row-ripple');
  const rowTemp = document.getElementById('row-temp');
  const legendVrect = document.getElementById('legend-vrect');
  
  const svgComponents = document.getElementById('svg-components');
  const canvasWave = document.getElementById('rectifier-wave');
  const ctxWave = canvasWave.getContext('2d');
  
  // State
  let mode = selectMode.value;
  let VinRMS = parseFloat(sliderVin.value);
  let Cap = parseFloat(sliderCap.value); // uF
  let Iload = parseFloat(sliderIload.value) / 1000; // A
  let time = 0;
  
  function resizeCanvas() {
    canvasWave.width = canvasWave.parentElement.clientWidth;
    canvasWave.height = 140;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Draw SVG Components dynamically
  function updateSVG() {
    let html = '';
    
    // Mode-specific components
    if (mode === 'halfwave') {
      // 1 Diode in series (x: 100 to 140)
      // Wire from AC source (30,40) to diode input
      html += '<line x1="30" y1="40" x2="130" y2="40" stroke="#fab387" stroke-width="2" />';
      // Diode triangle
      html += '<polygon points="130,30 130,50 150,40" fill="#a6e3a1" />';
      // Diode line (cathode)
      html += '<line x1="150" y1="30" x2="150" y2="50" stroke="#a6e3a1" stroke-width="3" />';
      // Wire from diode to load
      html += '<line x1="150" y1="40" x2="330" y2="40" stroke="#89b4fa" stroke-width="2" />';
      // Label
      html += '<text x="140" y="20" fill="#a6e3a1" font-size="11" text-anchor="middle">D1</text>';
    } 
    else if (mode === 'bridge') {
      // Bridge Rectifier (4 diodes)
      // AC wires to bridge
      html += '<line x1="30" y1="40" x2="100" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="30" y1="140" x2="100" y2="100" stroke="#585b70" stroke-width="2" />';
      // Bridge body (diamond)
      // Points: Top (130, 40), Bottom (130, 100), Left (100, 70), Right (160, 70)
      html += '<rect x="95" y="35" width="70" height="70" fill="none" stroke="#585b70" stroke-width="1.5" rx="5" />';
      
      // D1 (top-left to top)
      html += '<polygon points="105,65 125,45 110,45" fill="#a6e3a1" opacity="0.8" />';
      // D2 (bottom-left to bottom)
      html += '<polygon points="105,75 125,95 110,95" fill="#a6e3a1" opacity="0.8" />';
      // D3 (top to top-right)
      html += '<polygon points="135,45 155,65 150,45" fill="#a6e3a1" opacity="0.8" />';
      // D4 (bottom to bottom-right)
      html += '<polygon points="135,95 155,75 150,95" fill="#a6e3a1" opacity="0.8" />';
      
      // Output wire from bridge right (160, 70) to load
      html += '<line x1="160" y1="70" x2="330" y2="40" stroke="#89b4fa" stroke-width="2" />';
      // Ground connection from bottom (130, 100) to ground
      html += '<line x1="130" y1="100" x2="130" y2="140" stroke="#585b70" stroke-width="2" />';
      
      html += '<text x="130" y="25" fill="#a6e3a1" font-size="11" text-anchor="middle">Bridge</text>';
    }
    else if (mode === 'filter') {
      // Bridge + Capacitor in parallel
      // AC wires to bridge
      html += '<line x1="30" y1="40" x2="100" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="30" y1="140" x2="100" y2="100" stroke="#585b70" stroke-width="2" />';
      // Bridge (100,70 to 160,70)
      html += '<rect x="95" y="35" width="70" height="70" fill="none" stroke="#585b70" stroke-width="1.5" rx="5" />';
      html += '<text x="130" y="25" fill="#a6e3a1" font-size="11" text-anchor="middle">Bridge</text>';
      
      // Main output line
      html += '<line x1="160" y1="70" x2="330" y2="40" stroke="#89b4fa" stroke-width="2" />';
      
      // Capacitor (x = 230)
      // Positive plate (top)
      html += '<line x1="230" y1="40" x2="230" y2="75" stroke="#a6e3a1" stroke-width="2" />';
      html += '<rect x="220" y="75" width="20" height="4" fill="#a6e3a1" />';
      // Negative plate (bottom)
      html += '<rect x="220" y="85" width="20" height="4" fill="#cdd6f4" />';
      html += '<line x1="230" y1="89" x2="230" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Labels
      html += '<text x="250" y="75" fill="#a6e3a1" font-size="12" font-weight="bold">+</text>';
      html += '<text x="250" y="95" fill="#cdd6f4" font-size="12">-</text>';
      html += '<text x="230" y="60" fill="#a6e3a1" font-size="11" text-anchor="middle">C</text>';
    }
    else if (mode === 'regulator') {
      // Bridge + Capacitor + 7805 IC
      // AC wires to bridge
      html += '<line x1="30" y1="40" x2="100" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="30" y1="140" x2="100" y2="100" stroke="#585b70" stroke-width="2" />';
      // Bridge
      html += '<rect x="95" y="35" width="70" height="70" fill="none" stroke="#585b70" stroke-width="1.5" rx="5" />';
      
      // Capacitor C (x = 180)
      html += '<line x1="180" y1="40" x2="180" y2="75" stroke="#a6e3a1" stroke-width="2" />';
      html += '<rect x="170" y="75" width="20" height="4" fill="#a6e3a1" />';
      html += '<rect x="170" y="85" width="20" height="4" fill="#cdd6f4" />';
      html += '<line x1="180" y1="89" x2="180" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Wire from bridge to Cap, and Cap to 7805 Vin
      html += '<line x1="160" y1="70" x2="180" y2="40" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="180" y1="40" x2="230" y2="40" stroke="#fab387" stroke-width="2" />';
      
      // 7805 IC (x = 230 to 270, y = 30 to 60)
      html += '<rect x="230" y="25" width="40" height="30" fill="#313244" stroke="#cdd6f4" stroke-width="1.5" rx="3" />';
      html += '<text x="250" y="44" fill="#cdd6f4" font-size="10" text-anchor="middle" font-weight="bold">7805</text>';
      
      // GND connection (pin 2)
      html += '<line x1="250" y1="55" x2="250" y2="140" stroke="#585b70" stroke-width="2" />';
      
      // Output wire from pin 3 (Vout) to Load
      html += '<line x1="270" y1="40" x2="330" y2="40" stroke="#89b4fa" stroke-width="2" />';
    }

    svgComponents.innerHTML = html;
  }

  // Update controls and calculations
  function update() {
    mode = selectMode.value;
    VinRMS = parseFloat(sliderVin.value);
    Cap = parseFloat(sliderCap.value);
    Iload = parseFloat(sliderIload.value) / 1000;
    
    labelVin.textContent = `${VinRMS} V`;
    labelCap.textContent = `${Cap} uF`;
    labelIload.textContent = `${sliderIload.value} mA`;
    
    const Vpeak = VinRMS * Math.sqrt(2);
    valVpeak.textContent = `${Vpeak.toFixed(1)} V`;
    
    // Show/hide controls based on mode
    if (mode === 'halfwave' || mode === 'bridge') {
      groupCap.style.display = 'none';
      rowRipple.style.display = 'none';
      rowTemp.style.display = 'none';
      legendVrect.style.display = 'none';
    } else {
      groupCap.style.display = 'block';
      rowRipple.style.display = 'flex';
      legendVrect.style.display = 'inline';
      if (mode === 'regulator') {
        rowTemp.style.display = 'flex';
      } else {
        rowTemp.style.display = 'none';
      }
    }
    
    // Calculations for Vout and Ripple
    let VrectPeak = 0;
    let Vripple = 0;
    let VoutAvg = 0;
    
    if (mode === 'halfwave') {
      VrectPeak = Math.max(0, Vpeak - 0.7);
      VoutAvg = VrectPeak / Math.PI;
      valVout.textContent = `~${VoutAvg.toFixed(1)} V (xung)`;
    } 
    else if (mode === 'bridge') {
      VrectPeak = Math.max(0, Vpeak - 1.4);
      VoutAvg = (2 * VrectPeak) / Math.PI;
      valVout.textContent = `~${VoutAvg.toFixed(1)} V (xung)`;
    } 
    else if (mode === 'filter') {
      VrectPeak = Math.max(0, Vpeak - 1.4);
      // Frequency of ripple is 100Hz for full-wave
      Vripple = Iload / (100 * (Cap * 1e-6));
      Vripple = Math.min(Vripple, VrectPeak); // Cap ripple cannot exceed peak
      
      const Vmin = Math.max(0, VrectPeak - Vripple);
      VoutAvg = VrectPeak - Vripple / 2;
      valVripple.textContent = `${Vripple.toFixed(2)} V`;
      valVout.textContent = `~${VoutAvg.toFixed(1)} V DC`;
    } 
    else if (mode === 'regulator') {
      VrectPeak = Math.max(0, Vpeak - 1.4);
      Vripple = Iload / (100 * (Cap * 1e-6));
      Vripple = Math.min(Vripple, VrectPeak);
      valVripple.textContent = `${Vripple.toFixed(2)} V`;
      
      const Vmin = Math.max(0, VrectPeak - Vripple);
      const VinAvg = VrectPeak - Vripple / 2;
      
      // Heat Calculation
      // Ploss = (VinAvg - Vout) * Iload
      let voutTemp = 5.0;
      let isOverheat = false;
      
      if (Vmin < 7.0) {
        // Dropout
        voutTemp = Math.max(0, Vmin - 2.0);
      }
      
      const Ploss = Math.max(0, (VinAvg - voutTemp) * Iload);
      const tempJunction = 25 + Ploss * 65; // TO-220 Rthja is 65 C/W
      
      if (tempJunction >= 125) {
        isOverheat = true;
        valTemp.textContent = `${tempJunction.toFixed(0)}°C (QUÁ NHIỆT - TẮT NGUỒN!)`;
        valTemp.style.color = '#f38ba8';
        valVout.textContent = '0.0 V (Shutdown)';
        valVout.style.color = '#f38ba8';
      } else {
        if (tempJunction < 50) {
          valTemp.textContent = `${tempJunction.toFixed(0)}°C (Mát)`;
          valTemp.style.color = '#a6e3a1';
        } else if (tempJunction < 85) {
          valTemp.textContent = `${tempJunction.toFixed(0)}°C (Ấm)`;
          valTemp.style.color = '#f9e2af';
        } else {
          valTemp.textContent = `${tempJunction.toFixed(0)}°C (Nóng - Cần tản nhiệt)`;
          valTemp.style.color = '#fab387';
        }
        
        if (Vmin < 7.0) {
          valVout.textContent = `~${voutTemp.toFixed(1)} V (Sụt nguồn)`;
          valVout.style.color = '#f9e2af';
        } else {
          valVout.textContent = '5.0 V DC';
          valVout.style.color = '#89b4fa';
        }
      }
    }
    
    updateSVG();
  }

  // Draw loop
  function drawLoop() {
    ctxWave.clearRect(0, 0, canvasWave.width, canvasWave.height);
    
    const width = canvasWave.width;
    const height = canvasWave.height;
    const midY = height / 2;
    
    const Vpeak = VinRMS * Math.sqrt(2);
    // Scale Y such that max voltage (e.g. 35V) fits
    const scaleY = (height / 2 - 15) / 35;
    
    // Draw grid lines
    ctxWave.strokeStyle = '#313244';
    ctxWave.lineWidth = 1;
    ctxWave.beginPath();
    ctxWave.moveTo(0, midY); ctxWave.lineTo(width, midY); // center
    ctxWave.stroke();

    // 1. Draw Vin (Orange)
    ctxWave.strokeStyle = '#fab387';
    ctxWave.lineWidth = 1.5;
    ctxWave.beginPath();
    for (let x = 0; x < width; x++) {
      // 1 screen width = 3 cycles
      const omega = (Math.PI * 6) / width;
      const val = Vpeak * Math.sin(omega * x - time);
      const y = midY - val * scaleY;
      if (x === 0) ctxWave.moveTo(x, y);
      else ctxWave.lineTo(x, y);
    }
    ctxWave.stroke();

    // 2. Draw Rectified/Capacitor Voltage (Yellow/Green)
    const VrectPeak = (mode === 'halfwave') ? Math.max(0, Vpeak - 0.7) : Math.max(0, Vpeak - 1.4);
    
    if (mode === 'halfwave') {
      ctxWave.strokeStyle = '#f9e2af';
      ctxWave.lineWidth = 2;
      ctxWave.beginPath();
      for (let x = 0; x < width; x++) {
        const omega = (Math.PI * 6) / width;
        const sinVal = Math.sin(omega * x - time);
        let val = 0;
        if (sinVal > 0) {
          val = Math.max(0, Vpeak * sinVal - 0.7);
        }
        const y = midY - val * scaleY;
        if (x === 0) ctxWave.moveTo(x, y);
        else ctxWave.lineTo(x, y);
      }
      ctxWave.stroke();
    }
    else if (mode === 'bridge') {
      ctxWave.strokeStyle = '#f9e2af';
      ctxWave.lineWidth = 2;
      ctxWave.beginPath();
      for (let x = 0; x < width; x++) {
        const omega = (Math.PI * 6) / width;
        const sinVal = Math.sin(omega * x - time);
        const val = Math.max(0, Vpeak * Math.abs(sinVal) - 1.4);
        const y = midY - val * scaleY;
        if (x === 0) ctxWave.moveTo(x, y);
        else ctxWave.lineTo(x, y);
      }
      ctxWave.stroke();
    }
    else if (mode === 'filter' || mode === 'regulator') {
      // Capacitor charging and discharging exponential curve
      // For drawing, we can simulate the capacitor voltage.
      // Every half-period of AC (pi / omega), the voltage peaks.
      // We calculate the peak points and exponential discharge.
      ctxWave.strokeStyle = '#a6e3a1';
      ctxWave.lineWidth = 2;
      ctxWave.beginPath();
      
      const omega = (Math.PI * 6) / width;
      const ripple = Iload / (100 * (Cap * 1e-6));
      
      let lastCapY = 0;
      for (let x = 0; x < width; x++) {
        // Find phase in rectified wave (ranges from 0 to Pi)
        const phase = (omega * x - time) % Math.PI;
        const normalPhase = phase < 0 ? phase + Math.PI : phase;
        
        // Rectified voltage at this point
        const vRect = Math.max(0, Vpeak * Math.sin(normalPhase) - 1.4);
        
        // Approximate capacitor voltage:
        // Cap charges instantly when vRect > vCap
        // Otherwise it decays with RC constant (simulated here by linear/exponential decay)
        // Decays from VrectPeak down by 'ripple' voltage towards the end of half-cycle (normalPhase = Pi)
        const decayTimeFraction = normalPhase / Math.PI; // 0 to 1
        const vCap = Math.max(vRect, VrectPeak - ripple * decayTimeFraction);
        
        const y = midY - vCap * scaleY;
        if (x === 0) ctxWave.moveTo(x, y);
        else ctxWave.lineTo(x, y);
      }
      ctxWave.stroke();
    }

    // 3. Draw Output DC (Blue)
    ctxWave.strokeStyle = '#89b4fa';
    ctxWave.lineWidth = 2.5;
    ctxWave.beginPath();
    
    const ripple = Iload / (100 * (Cap * 1e-6));
    const Vmin = Math.max(0, VrectPeak - ripple);
    const VinAvg = VrectPeak - ripple / 2;
    
    // Thermal check
    const Ploss = Math.max(0, (VinAvg - 5.0) * Iload);
    const tempJunction = 25 + Ploss * 65;
    const isOverheat = (tempJunction >= 125);
    
    if (mode === 'halfwave') {
      // Same as rectified for halfwave
      for (let x = 0; x < width; x++) {
        const omega = (Math.PI * 6) / width;
        const sinVal = Math.sin(omega * x - time);
        let val = 0;
        if (sinVal > 0) {
          val = Math.max(0, Vpeak * sinVal - 0.7);
        }
        const y = midY - val * scaleY;
        if (x === 0) ctxWave.moveTo(x, y);
        else ctxWave.lineTo(x, y);
      }
    }
    else if (mode === 'bridge') {
      for (let x = 0; x < width; x++) {
        const omega = (Math.PI * 6) / width;
        const sinVal = Math.sin(omega * x - time);
        const val = Math.max(0, Vpeak * Math.abs(sinVal) - 1.4);
        const y = midY - val * scaleY;
        if (x === 0) ctxWave.moveTo(x, y);
        else ctxWave.lineTo(x, y);
      }
    }
    else if (mode === 'filter') {
      // Same as capacitor voltage
      for (let x = 0; x < width; x++) {
        const omega = (Math.PI * 6) / width;
        const phase = (omega * x - time) % Math.PI;
        const normalPhase = phase < 0 ? phase + Math.PI : phase;
        const vRect = Math.max(0, Vpeak * Math.sin(normalPhase) - 1.4);
        const decayTimeFraction = normalPhase / Math.PI;
        const vCap = Math.max(vRect, VrectPeak - ripple * decayTimeFraction);
        const y = midY - vCap * scaleY;
        if (x === 0) ctxWave.moveTo(x, y);
        else ctxWave.lineTo(x, y);
      }
    }
    else if (mode === 'regulator') {
      if (isOverheat) {
        // Shutdown (0V)
        ctxWave.moveTo(0, midY);
        ctxWave.lineTo(width, midY);
      } else {
        // 7805 regulated 5V
        for (let x = 0; x < width; x++) {
          const omega = (Math.PI * 6) / width;
          const phase = (omega * x - time) % Math.PI;
          const normalPhase = phase < 0 ? phase + Math.PI : phase;
          const vRect = Math.max(0, Vpeak * Math.sin(normalPhase) - 1.4);
          const decayTimeFraction = normalPhase / Math.PI;
          const vCap = Math.max(vRect, VrectPeak - ripple * decayTimeFraction);
          
          let vout = 5.0;
          if (vCap < 7.0) {
            vout = Math.max(0, vCap - 2.0); // Dropout tracking capacitor ripple minus 2V
          }
          
          const y = midY - vout * scaleY;
          if (x === 0) ctxWave.moveTo(x, y);
          else ctxWave.lineTo(x, y);
        }
      }
    }
    ctxWave.stroke();
    
    time += 0.03;
    requestAnimationFrame(drawLoop);
  }

  // Event Listeners
  selectMode.addEventListener('change', update);
  sliderVin.addEventListener('input', update);
  sliderCap.addEventListener('input', update);
  sliderIload.addEventListener('input', update);
  
  // Initialize
  update();
  drawLoop();
});
