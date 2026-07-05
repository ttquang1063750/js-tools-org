document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('osc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const btnCharge = document.getElementById('btn-charge');
  const btnDischarge = document.getElementById('btn-discharge');
  const sliderR = document.getElementById('sim-r');
  const sliderC = document.getElementById('sim-c');
  
  const valR = document.getElementById('val-r');
  const valC = document.getElementById('val-c');
  const valTau = document.getElementById('val-tau');
  const valVc = document.getElementById('val-vc');

  let state = 'discharge'; // 'charge' or 'discharge'
  let R = 10; // kOhm
  let C = 100; // µF
  let tau = R * C / 1000; // in seconds
  
  // Simulation variables
  let t = 0; // Current time in seconds
  let dt = 0.05; // Time step
  let Vc = 0; // Current voltage
  let Vs = 5; // Supply voltage
  let history = []; // Array of {t, v}
  let maxTime = 10; // X-axis max time

  let isRunning = true;
  let lastFrameTime = performance.now();

  function updateValues() {
    R = parseFloat(sliderR.value); // kOhm
    C = parseFloat(sliderC.value); // µF
    
    valR.textContent = `${R} kΩ`;
    valC.textContent = `${C} µF`;
    
    // tau = R (kOhm) * C (uF) = R*1e3 * C*1e-6 = R*C*1e-3 seconds
    tau = (R * C) / 1000;
    valTau.textContent = `${tau.toFixed(2)} s`;
  }

  sliderR.addEventListener('input', updateValues);
  sliderC.addEventListener('input', updateValues);

  btnCharge.addEventListener('click', () => {
    state = 'charge';
    t = 0;
    history = [];
  });

  btnDischarge.addEventListener('click', () => {
    state = 'discharge';
    t = 0;
    history = [];
  });

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Vertical lines (Time)
    for (let i = 0; i <= 10; i++) {
      let x = (i / 10) * canvas.width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    
    // Horizontal lines (Voltage)
    for (let i = 0; i <= 5; i++) {
      let y = canvas.height - (i / 5) * canvas.height;
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw target line at 5V
    ctx.strokeStyle = 'rgba(243, 139, 168, 0.5)'; // accent
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 0); // 5V is at top (y=0)
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function loop(now) {
    if (!isRunning) return;
    
    let deltaTime = (now - lastFrameTime) / 1000; // in real seconds
    lastFrameTime = now;

    // Fast forward simulation a bit so it's not painfully slow
    // 1 real second = 1 simulation second.
    if (t < maxTime) {
      t += deltaTime;
      
      // Calculate exact voltage based on equation to avoid euler integration drift
      if (state === 'charge') {
        // v_c(t) = v_initial + (Vs - v_initial) * (1 - e^(-t/tau))
        // Since we restart history at t=0 when button clicked, we assume initial is current Vc at t=0
        // Wait, if we use the exact equation, we need to track V_initial at the moment of switching.
      }
    }

    // Better approach: numerical integration (Euler method) is fine and simpler for dynamic RC changes
    // i = C * dv/dt => dv = (i/C) * dt
    // Charge: i = (Vs - Vc)/R
    // Discharge: i = -Vc/R
    
    // Convert R to Ohms and C to Farads
    let R_ohms = R * 1000;
    let C_farads = C * 0.000001;

    let steps = 10; // multi-step for stability
    let dt_sim = deltaTime / steps;
    
    for(let i=0; i<steps; i++) {
        let current;
        if (state === 'charge') {
            current = (Vs - Vc) / R_ohms;
        } else {
            current = -Vc / R_ohms;
        }
        let dV = (current / C_farads) * dt_sim;
        Vc += dV;
    }

    // Cap values
    if (Vc > 5) Vc = 5;
    if (Vc < 0) Vc = 0;

    valVc.textContent = `${Vc.toFixed(2)} V`;

    // Only save history if we haven't scrolled past
    // Actually, let's make it a scrolling oscilloscope
    history.push(Vc);
    if (history.length > canvas.width) {
        history.shift();
    }

    drawGrid();

    // Draw signal
    ctx.strokeStyle = '#a6e3a1'; // green
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      let x = i * (canvas.width / canvas.width); // 1 pixel per sample
      let y = canvas.height - (history[i] / 5) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    requestAnimationFrame(loop);
  }

  updateValues();
  requestAnimationFrame(loop);
});
