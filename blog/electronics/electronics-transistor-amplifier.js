document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-trans-mode');

  const groupSwitch = document.getElementById('group-switch');
  const groupAmp = document.getElementById('group-amp');
  const scopeBox = document.getElementById('scope-box');

  const sliderVg = document.getElementById('slider-vg');
  const sliderVin = document.getElementById('slider-vin');
  const sliderRc = document.getElementById('slider-rc');
  const sliderVbias = document.getElementById('slider-vbias');

  const labelVg = document.getElementById('label-vg');
  const labelVin = document.getElementById('label-vin');
  const labelRc = document.getElementById('label-rc');
  const labelVbias = document.getElementById('label-vbias');

  const valMosState = document.getElementById('val-mos-state');
  const valGain = document.getElementById('val-gain');
  const valClippingState = document.getElementById('val-clipping-state');
  const valVout = document.getElementById('val-vout');

  const svgComponents = document.getElementById('trans-svg-components');

  const canvasScope = document.getElementById('trans-scope');
  const ctxScope = canvasScope.getContext('2d');

  // State variables
  let mode = selectMode.value;
  let Vg = parseFloat(sliderVg.value);
  let vinAmp = parseFloat(sliderVin.value) / 1000; // V
  let Rc = parseFloat(sliderRc.value); // ohms
  let Vbias = parseFloat(sliderVbias.value); // V
  let time = 0;

  function resizeCanvas() {
    canvasScope.width = canvasScope.parentElement.clientWidth;
    canvasScope.height = 140;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Draw dynamic SVGs
  function updateSVG() {
    let html = '';

    if (mode === 'switch') {
      // 1. Switching Mode SVG: MCU -> N-Ch MOSFET -> Lightbulb -> 12V
      // Ground line
      html += '<line x1="30" y1="140" x2="330" y2="140" stroke="#585b70" stroke-width="2" />';

      // Control input (Gate Voltage)
      html += '<line x1="30" y1="80" x2="100" y2="80" stroke="#fab387" stroke-width="2" />';
      html += '<circle cx="30" cy="80" r="10" fill="#1e1e2e" stroke="#fab387" stroke-width="2" />';
      html += `<text x="30" y="83" fill="#fab387" font-size="8" text-anchor="middle" font-weight="bold">${Vg.toFixed(1)}V</text>`;
      html += '<text x="30" y="62" fill="#fab387" font-size="10" text-anchor="middle">MCU</text>';

      // MOSFET Symbol in middle (x=150, y=80)
      // Gate plate
      html += '<line x1="100" y1="70" x2="100" y2="90" stroke="#a6e3a1" stroke-width="3" />';
      // Channel plates
      html += '<line x1="108" y1="65" x2="108" y2="95" stroke="#a6e3a1" stroke-width="2" />';
      // Connections
      html += '<line x1="108" y1="70" x2="150" y2="70" stroke="#a6e3a1" stroke-width="2" />'; // Drain line
      html += '<line x1="108" y1="90" x2="150" y2="90" stroke="#585b70" stroke-width="2" />'; // Source line
      html += '<line x1="150" y1="90" x2="150" y2="140" stroke="#585b70" stroke-width="2" />'; // Source to ground

      // Arrow pointing inward on body (N-Channel)
      html += '<polygon points="108,80 120,77 120,83" fill="#a6e3a1" />';
      html += '<line x1="108" y1="80" x2="150" y2="80" stroke="#a6e3a1" stroke-width="1.5" />';
      html += '<line x1="150" y1="80" x2="150" y2="90" stroke="#a6e3a1" stroke-width="1.5" />';

      // Load (Lightbulb) at x=150, y=30 to 60
      // Wire from Drain (150,70) to bulb
      html += '<line x1="150" y1="70" x2="150" y2="55" stroke="#a6e3a1" stroke-width="2" />';

      // Glow effect if MOSFET is ON
      const isOn = Vg >= 2.0;
      const bulbColor = isOn ? '#f9e2af' : 'none';
      const glowOpacity = isOn ? (Vg - 2.0) / 3.0 : 0;

      if (isOn) {
        html += `<circle cx="150" cy="40" r="22" fill="#f9e2af" opacity="${0.2 + 0.4 * glowOpacity}" />`;
        // Glow rays
        html += `<path d="M 150 12 L 150 2 M 150 68 L 150 78 M 122 40 L 112 40 M 178 40 L 188 40 M 130 20 L 122 12 M 170 20 L 178 12 M 130 60 L 122 68 M 170 60 L 178 68" stroke="#f9e2af" stroke-width="2" opacity="${glowOpacity}" />`;
      }

      // Bulb circle
      html += `<circle cx="150" cy="40" r="15" fill="${bulbColor}" stroke="#cdd6f4" stroke-width="2" />`;
      // Filament
      html +=
        '<path d="M 143 45 L 147 35 Q 150 30, 153 35 L 157 45" fill="none" stroke="#cdd6f4" stroke-width="1.5" />';

      // Wire to 12V
      html += '<line x1="150" y1="25" x2="150" y2="15" stroke="#fab387" stroke-width="2" />';
      html += '<line x1="150" y1="15" x2="280" y2="15" stroke="#fab387" stroke-width="2" />';
      html += '<circle cx="280" cy="15" r="3" fill="#fab387" />';
      html += '<text x="290" y="18" fill="#fab387" font-size="10" font-family="monospace">12V DC</text>';

      html += '<text x="150" y="115" fill="#a6e3a1" font-size="11" text-anchor="middle">MOSFET (N-Ch)</text>';
    } else {
      // 2. Amplifier Mode CE Circuit
      // Power Rails
      html += '<line x1="160" y1="20" x2="160" y2="10" stroke="#fab387" stroke-width="2" />';
      html += '<text x="160" y="8" fill="#fab387" font-size="9" text-anchor="middle">VCC = 12V</text>';

      // Ground Line
      html += '<line x1="30" y1="150" x2="330" y2="150" stroke="#585b70" stroke-width="2" />';

      // Bias Resistors Bridge R1 & R2
      // R1 (from VCC to Base node x=110, y=70)
      html += '<line x1="160" y1="20" x2="110" y2="20" stroke="#fab387" stroke-width="1.5" />';
      html += '<line x1="110" y1="20" x2="110" y2="35" stroke="#fab387" stroke-width="1.5" />';
      html += '<rect x="105" y="35" width="10" height="20" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="98" y="47" fill="#89b4fa" font-size="8" text-anchor="end">R1</text>';
      html += '<line x1="110" y1="55" x2="110" y2="70" stroke="#cdd6f4" stroke-width="1.5" />';

      // R2 (from Base node x=110, y=70 to Ground)
      html += '<line x1="110" y1="70" x2="110" y2="95" stroke="#cdd6f4" stroke-width="1.5" />';
      html += '<rect x="105" y="95" width="10" height="20" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="98" y="107" fill="#89b4fa" font-size="8" text-anchor="end">R2</text>';
      html += '<line x1="110" y1="115" x2="110" y2="150" stroke="#585b70" stroke-width="1.5" />';

      // Coupling Cap Cin on input
      html += '<line x1="30" y1="70" x2="65" y2="70" stroke="#fab387" stroke-width="1.5" />';
      html += '<line x1="65" y1="63" x2="65" y2="77" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="72" y1="63" x2="72" y2="77" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="72" y1="70" x2="110" y2="70" stroke="#cdd6f4" stroke-width="1.5" />';
      html += '<text x="68" y="55" fill="#a6e3a1" font-size="8" text-anchor="middle">Cin</text>';

      // AC Source on left (micro input)
      html += '<circle cx="30" cy="85" r="7" fill="#1e1e2e" stroke="#fab387" stroke-width="1.5" />';
      html += '<path d="M 26 85 Q 28 81, 30 85 T 34 85" fill="none" stroke="#fab387" stroke-width="1" />';
      html += '<line x1="30" y1="92" x2="30" y2="150" stroke="#585b70" stroke-width="1.5" />';
      html += '<text x="30" y="108" fill="#fab387" font-size="8" text-anchor="middle">Micro</text>';

      // BJT NPN (Base at x=110, y=70. Collector at x=160, y=50. Emitter at x=160, y=90)
      html += '<line x1="140" y1="70" x2="110" y2="70" stroke="#cdd6f4" stroke-width="1.5" />'; // connection to Base
      html += '<line x1="140" y1="55" x2="140" y2="85" stroke="#a6e3a1" stroke-width="2.5" />'; // Base plate
      html += '<path d="M 140 60 L 160 50 M 140 80 L 160 90" fill="none" stroke="#a6e3a1" stroke-width="1.5" />'; // Col & Emit branches
      // Emitter Arrow
      html += '<polygon points="152,86 156,88 149,90" fill="#a6e3a1" />';
      html += '<text x="134" y="65" fill="#a6e3a1" font-size="8" text-anchor="end">B</text>';
      html += '<text x="165" y="47" fill="#a6e3a1" font-size="8">C</text>';
      html += '<text x="165" y="93" fill="#a6e3a1" font-size="8">E</text>';

      // RC (Collector resistor, from VCC to Collector)
      html += '<line x1="160" y1="20" x2="160" y2="30" stroke="#fab387" stroke-width="1.5" />';
      html += '<rect x="155" y="30" width="10" height="20" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="170" y="42" fill="#89b4fa" font-size="8">RC</text>';
      html += '<line x1="160" y1="50" x2="160" y2="50" stroke="#cdd6f4" stroke-width="1.5" />';

      // RE (Emitter resistor, from Emitter to Ground)
      html += '<line x1="160" y1="90" x2="160" y2="105" stroke="#cdd6f4" stroke-width="1.5" />';
      html += '<rect x="155" y="105" width="10" height="20" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="170" y="117" fill="#89b4fa" font-size="8">RE</text>';
      html += '<line x1="160" y1="125" x2="160" y2="150" stroke="#585b70" stroke-width="1.5" />';

      // Bypass Capacitor CE (parallel to RE)
      html += '<line x1="160" y1="100" x2="210" y2="100" stroke="#cdd6f4" stroke-width="1.5" />';
      html += '<line x1="210" y1="100" x2="210" y2="110" stroke="#cdd6f4" stroke-width="1.5" />';
      html += '<line x1="200" y1="110" x2="220" y2="110" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="200" y1="118" x2="220" y2="118" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="210" y1="118" x2="210" y2="150" stroke="#585b70" stroke-width="1.5" />';
      html += '<text x="228" y="119" fill="#a6e3a1" font-size="8">CE</text>';

      // Coupling Cap Cout on output (from Collector)
      html += '<line x1="160" y1="50" x2="245" y2="50" stroke="#cdd6f4" stroke-width="1.5" />';
      html += '<line x1="245" y1="43" x2="245" y2="57" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="252" y1="43" x2="252" y2="57" stroke="#a6e3a1" stroke-width="2" />';
      html += '<line x1="252" y1="50" x2="290" y2="50" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<text x="248" y="35" fill="#a6e3a1" font-size="8" text-anchor="middle">Cout</text>';

      // Load Resistor RL
      html += '<rect x="285" y="65" width="10" height="20" fill="#1e1e2e" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<line x1="290" y1="50" x2="290" y2="65" stroke="#89b4fa" stroke-width="1.5" />';
      html += '<line x1="290" y1="85" x2="290" y2="150" stroke="#585b70" stroke-width="1.5" />';
      html += '<text x="302" y="77" fill="#89b4fa" font-size="8">Load</text>';
    }

    svgComponents.innerHTML = html;
  }

  // Update controls and calculations
  function update() {
    mode = selectMode.value;

    if (mode === 'switch') {
      groupSwitch.style.display = 'block';
      groupAmp.style.display = 'none';
      scopeBox.style.display = 'none';

      Vg = parseFloat(sliderVg.value);
      labelVg.textContent = `${Vg.toFixed(1)} V`;

      if (Vg < 2.0) {
        valMosState.textContent = 'TẮT (Cut-off)';
        valMosState.style.color = '#f38ba8';
      } else {
        valMosState.textContent = 'BẬT (Dẫn bão hoà)';
        valMosState.style.color = '#a6e3a1';
      }
    } else {
      groupSwitch.style.display = 'none';
      groupAmp.style.display = 'block';
      scopeBox.style.display = 'block';

      vinAmp = parseFloat(sliderVin.value) / 1000;
      Rc = parseFloat(sliderRc.value);
      Vbias = parseFloat(sliderVbias.value);

      labelVin.textContent = `${sliderVin.value} mV`;
      labelRc.textContent = `${(Rc / 1000).toFixed(1)} kΩ`;
      labelVbias.textContent = `${Vbias.toFixed(2)} V`;

      // Calculations for CE amplifier
      // RE is fixed to 1k in model
      const RE = 1000;
      // Static Collector Current (Bias)
      const IC_bias = Math.max(0, (Vbias - 0.7) / RE); // Amps
      const V_E = Math.max(0, Vbias - 0.7);

      // Dynamic transconductance: gm = Ic / Vt. (Vt ~ 25mV)
      const gm = IC_bias / 0.025; // S
      const gain = -gm * Rc;
      valGain.textContent = `${gain.toFixed(0)}`;

      // DC output voltage
      const VC_bias = 12.0 - IC_bias * Rc;

      // Check for clipping
      // Output ranges from VC_bias + (gain * vinAmp) to VC_bias - (gain * vinAmp)
      // Boundaries: max 12.0V (cutoff), min V_E + 0.2V (saturation)
      const maxOutAllowed = 12.0;
      const minOutAllowed = V_E + 0.2;

      const peakOutTheoretical = Math.abs(gain * vinAmp);
      const topPeak = VC_bias + peakOutTheoretical;
      const bottomPeak = VC_bias - peakOutTheoretical;

      let isClippedTop = topPeak > maxOutAllowed;
      let isClippedBottom = bottomPeak < minOutAllowed;

      if (isClippedTop && isClippedBottom) {
        valClippingState.textContent = 'Méo hoàn toàn (Cắt trên + dưới)';
        valClippingState.style.color = '#f38ba8';
      } else if (isClippedTop) {
        valClippingState.textContent = 'Méo ngắt (Cắt đỉnh trên)';
        valClippingState.style.color = '#f9e2af';
      } else if (isClippedBottom) {
        valClippingState.textContent = 'Méo bão hoà (Cắt đáy dưới)';
        valClippingState.style.color = '#f9e2af';
      } else {
        valClippingState.textContent = 'Sạch (Bình thường)';
        valClippingState.style.color = '#a6e3a1';
      }

      // Calculate actual Peak-to-Peak output voltage (considering clipping)
      const realTop = Math.min(maxOutAllowed, topPeak);
      const realBottom = Math.max(minOutAllowed, bottomPeak);
      const realVoutPP = realTop - realBottom;

      valVout.textContent = `${realVoutPP.toFixed(2)} V`;
    }

    updateSVG();
  }

  // Draw scope waves (AC signals in Amplifier Mode)
  function drawScope() {
    ctxScope.clearRect(0, 0, canvasScope.width, canvasScope.height);

    if (mode === 'amp') {
      const w = canvasScope.width;
      const h = canvasScope.height;
      const midY = h / 2;

      // Draw grid
      ctxScope.strokeStyle = '#313244';
      ctxScope.lineWidth = 1;
      ctxScope.beginPath();
      ctxScope.moveTo(0, midY);
      ctxScope.lineTo(w, midY);
      ctxScope.stroke();

      // Theoretical values
      const RE = 1000;
      const IC_bias = Math.max(0, (Vbias - 0.7) / RE);
      const V_E = Math.max(0, Vbias - 0.7);
      const VC_bias = 12.0 - IC_bias * Rc;
      const gm = IC_bias / 0.025;
      const gain = -gm * Rc;

      const maxOutAllowed = 12.0;
      const minOutAllowed = V_E + 0.2;

      // Scaling factor: lets fit -6V to +6V signal around VC_bias (or midY)
      // Height is 140. Let's scale 1V to 10 pixels
      const scaleY = 15; // px/V

      // 1. Draw input signal v_in [scaled x100 for visibility]
      ctxScope.strokeStyle = '#fab387'; // Orange
      ctxScope.lineWidth = 1.5;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const omega = (Math.PI * 4) / w;
        // Input is micro signal, e.g. vinAmp * sin(omega*x - time)
        // Scaled up by 100 on screen: vinAmp * 100
        const val = vinAmp * 100 * Math.sin(omega * x - time);
        const y = midY - val * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();

      // 2. Draw output signal v_out (Inverted, clipped)
      ctxScope.strokeStyle = '#89b4fa'; // Blue
      ctxScope.lineWidth = 2.5;
      ctxScope.beginPath();
      for (let x = 0; x < w; x++) {
        const omega = (Math.PI * 4) / w;
        const sinVal = Math.sin(omega * x - time);

        // Output AC signal: gain * (vinAmp * sin)
        // Since gain is negative, this naturally flips the sine wave (inverted phase)
        const voutAC = gain * (vinAmp * sinVal);

        // Total voltage at collector
        let vCollector = VC_bias + voutAC;

        // Clip limits
        if (vCollector > maxOutAllowed) vCollector = maxOutAllowed;
        if (vCollector < minOutAllowed) vCollector = minOutAllowed;

        // We only plot the AC component of output (remove DC bias offset on scope)
        const voutPlot = vCollector - VC_bias;

        const y = midY - voutPlot * scaleY;
        if (x === 0) ctxScope.moveTo(x, y);
        else ctxScope.lineTo(x, y);
      }
      ctxScope.stroke();
    }

    time += 0.05;
    requestAnimationFrame(drawScope);
  }

  // Event Listeners
  selectMode.addEventListener('change', update);
  sliderVg.addEventListener('input', update);
  sliderVin.addEventListener('input', update);
  sliderRc.addEventListener('input', update);
  sliderVbias.addEventListener('input', update);

  // Init
  update();
  drawScope();
});
