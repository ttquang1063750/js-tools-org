document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectMode = document.getElementById('select-555-mode');
  
  const groupAstable = document.getElementById('group-astable-controls');
  const groupPwm = document.getElementById('group-pwm-controls');
  
  const sliderR1 = document.getElementById('slider-r1');
  const sliderR2 = document.getElementById('slider-r2');
  const sliderPot = document.getElementById('slider-pot');
  const sliderC = document.getElementById('slider-c');
  
  const labelR1 = document.getElementById('val-r1');
  const labelR2 = document.getElementById('val-r2');
  const labelPot = document.getElementById('val-pot');
  const labelC = document.getElementById('val-c');
  
  const outThigh = document.getElementById('out-thigh');
  const outTlow = document.getElementById('out-tlow');
  const outFreq = document.getElementById('out-freq');
  const outDuty = document.getElementById('out-duty');
  
  const canvas = document.getElementById('canvas-waves');
  const ctx = canvas.getContext('2d');
  
  const visualLed = document.getElementById('visual-led');
  const motorBlades = document.getElementById('motor-blades');
  
  // State
  let mode = selectMode.value;
  let rotationAngle = 0;
  let animationFrameId = null;
  let currentDuty = 50; // percentage
  
  // Quiz
  const quizContainer = document.querySelector('.quiz-container');
  const quizSubmit = document.querySelector('.quiz-submit');
  
  // Set slider labels
  function updateSliderLabels() {
    labelR1.textContent = `${parseFloat(sliderR1.value).toFixed(1)} kΩ`;
    labelR2.textContent = `${parseFloat(sliderR2.value).toFixed(1)} kΩ`;
    labelPot.textContent = `${sliderPot.value}%`;
    labelC.textContent = `${parseFloat(sliderC.value).toFixed(1)} μF`;
  }

  // Formatting helper
  function formatTime(t) {
    if (t < 0.001) {
      return `${(t * 1000000).toFixed(2)} μs`;
    } else if (t < 1) {
      return `${(t * 1000).toFixed(2)} ms`;
    } else {
      return `${t.toFixed(2)} s`;
    }
  }

  function formatFreq(f) {
    if (f >= 1000) {
      return `${(f / 1000).toFixed(2)} kHz`;
    } else {
      return `${f.toFixed(2)} Hz`;
    }
  }

  // Calculate parameters & draw
  function draw() {
    mode = selectMode.value;
    updateSliderLabels();
    
    let R1, R2, C, tHigh, tLow, T, f, duty;
    
    if (mode === 'astable') {
      groupAstable.style.display = 'block';
      groupPwm.style.display = 'none';
      
      R1 = parseFloat(sliderR1.value) * 1000;
      R2 = parseFloat(sliderR2.value) * 1000;
      C = parseFloat(sliderC.value) * 0.000001;
      
      tHigh = 0.693 * (R1 + R2) * C;
      tLow = 0.693 * R2 * C;
    } else {
      groupAstable.style.display = 'none';
      groupPwm.style.display = 'block';
      
      const potPct = parseFloat(sliderPot.value) / 100;
      const Rpot = 50000; // 50k Potentiometer
      R1 = 1000; // Fixed 1k resistor for protection
      
      // Charging through R1 and pot fraction
      const Rcharge = R1 + potPct * Rpot;
      // Discharging through remaining pot fraction
      const Rdischarge = (1 - potPct) * Rpot;
      C = parseFloat(sliderC.value) * 0.000001;
      
      tHigh = 0.693 * Rcharge * C;
      tLow = 0.693 * Rdischarge * C;
    }
    
    T = tHigh + tLow;
    f = 1 / T;
    duty = (tHigh / T) * 100;
    currentDuty = duty;
    
    // Update labels
    outThigh.textContent = formatTime(tHigh);
    outTlow.textContent = formatTime(tLow);
    outFreq.textContent = formatFreq(f);
    outDuty.textContent = `${duty.toFixed(1)}%`;
    
    // Draw on canvas
    drawWaves(tHigh, tLow, T);
  }

  function drawWaves(th, tl, T) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    // Draw Grid
    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Draw horizontal split line
    ctx.strokeStyle = '#45475a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(w, 75);
    ctx.stroke();
    
    // Wave plot boundaries
    // Top wave (Vout): y goes from 15 (HIGH) to 60 (LOW)
    // Bottom wave (Vc): y goes from 95 (2/3 Vcc) to 135 (1/3 Vcc)
    
    const cycleWidth = w / 3; // Plot exactly 3 cycles
    const highRatio = th / T;
    
    ctx.lineWidth = 2.5;
    
    // Plot Channel 1: Vout (Green/Emerald)
    ctx.strokeStyle = '#a6e3a1';
    ctx.beginPath();
    let currentX = 0;
    for (let i = 0; i < 3; i++) {
      const xStart = i * cycleWidth;
      const xHighEnd = xStart + cycleWidth * highRatio;
      const xEnd = (i + 1) * cycleWidth;
      
      if (i === 0) {
        ctx.moveTo(xStart, 15);
      } else {
        ctx.lineTo(xStart, 15);
      }
      ctx.lineTo(xHighEnd, 15);
      ctx.lineTo(xHighEnd, 60);
      ctx.lineTo(xEnd, 60);
      if (i < 2) {
        ctx.lineTo(xEnd, 15);
      }
    }
    ctx.stroke();
    
    // Plot Channel 2: Vc (Faint Blue/Sapphire)
    ctx.strokeStyle = '#b4befe';
    ctx.beginPath();
    
    for (let i = 0; i < 3; i++) {
      const xStart = i * cycleWidth;
      const xHighEnd = xStart + cycleWidth * highRatio;
      const xEnd = (i + 1) * cycleWidth;
      
      if (i === 0) {
        ctx.moveTo(xStart, 135); // Start at 1/3 Vcc
      }
      
      // Charging curve (exponential xấp xỉ)
      // V(t) = V_low + (V_high - V_low) * (1 - e^-t)
      const chargeSteps = 20;
      for (let j = 0; j <= chargeSteps; j++) {
        const stepX = xStart + (j / chargeSteps) * (xHighEnd - xStart);
        const tFraction = j / chargeSteps;
        // Exponential charging curvature
        const voltFraction = 1 - Math.exp(-tFraction * 2.2); // scaling factor to reach approx 90% curve
        const stepY = 135 - voltFraction * 40; // 135 down to 95
        ctx.lineTo(stepX, stepY);
      }
      
      // Discharging curve
      const dischargeSteps = 20;
      for (let j = 0; j <= dischargeSteps; j++) {
        const stepX = xHighEnd + (j / dischargeSteps) * (xEnd - xHighEnd);
        const tFraction = j / dischargeSteps;
        // Exponential discharging curvature
        const voltFraction = Math.exp(-tFraction * 2.2);
        const stepY = 135 + voltFraction * 40; // 95 down to 135 (inverted because y=0 is top)
        ctx.lineTo(stepX, stepY);
      }
    }
    ctx.stroke();
  }

  // Rotate motor and pulse LED
  function animate() {
    // 1. Rotate motor blades
    // Speed is proportional to duty cycle
    const motorSpeed = (currentDuty / 100) * 15; // degrees per frame
    rotationAngle += motorSpeed;
    if (rotationAngle >= 360) {
      rotationAngle -= 360;
    }
    motorBlades.setAttribute('transform', `rotate(${rotationAngle} 20 20)`);
    
    // 2. Pulse LED brightness
    // Duty cycle controls the brightness
    const ledIntensity = currentDuty / 100;
    visualLed.style.backgroundColor = `rgba(243, 139, 168, ${0.15 + ledIntensity * 0.85})`;
    visualLed.style.boxShadow = ledIntensity > 0.05 
      ? `0 0 ${10 + ledIntensity * 20}px rgba(243, 139, 168, ${0.4 + ledIntensity * 0.6})` 
      : 'none';
      
    animationFrameId = requestAnimationFrame(animate);
  }

  // Quiz verification
  if (quizSubmit) {
    quizSubmit.addEventListener('click', () => {
      const questions = quizContainer.querySelectorAll('.quiz-question');
      let score = 0;
      
      questions.forEach((q, idx) => {
        const answer = q.getAttribute('data-answer');
        const selected = q.querySelector('input[type="radio"]:checked');
        const explanation = q.querySelector('.quiz-explanation');
        
        if (selected) {
          if (selected.value === answer) {
            score++;
            q.style.borderLeft = '4px solid #a6e3a1'; // Green
            if (explanation) explanation.style.display = 'block';
          } else {
            q.style.borderLeft = '4px solid #f38ba8'; // Red
            if (explanation) explanation.style.display = 'block';
          }
        } else {
          q.style.borderLeft = '4px solid #f9e2af'; // Yellow
          if (explanation) explanation.style.display = 'block';
        }
      });
      
      alert(`Bạn trả lời đúng ${score}/${questions.length} câu.`);
    });
  }

  // Listeners
  selectMode.addEventListener('change', draw);
  sliderR1.addEventListener('input', draw);
  sliderR2.addEventListener('input', draw);
  sliderPot.addEventListener('input', draw);
  sliderC.addEventListener('input', draw);
  
  // Init
  draw();
  animate();
});
