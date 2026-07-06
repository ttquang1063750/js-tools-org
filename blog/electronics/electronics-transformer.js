document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sliderNp = document.getElementById('slider-np');
  const sliderNs = document.getElementById('slider-ns');
  const sliderVp = document.getElementById('slider-vp');

  const labelNp = document.getElementById('label-np');
  const labelNs = document.getElementById('label-ns');
  const labelVp = document.getElementById('label-vp');

  const labelRatio = document.getElementById('label-ratio');
  const labelType = document.getElementById('label-type');
  const labelVs = document.getElementById('label-vs');

  const coilPrimary = document.getElementById('coil-primary');
  const coilSecondary = document.getElementById('coil-secondary');

  const canvasWave = document.getElementById('transformer-wave');
  const ctxWave = canvasWave.getContext('2d');

  // State
  let Np = parseInt(sliderNp.value);
  let Ns = parseInt(sliderNs.value);
  let Vp = parseFloat(sliderVp.value);
  let time = 0;

  // Set canvas size
  function resizeCanvas() {
    canvasWave.width = canvasWave.parentElement.clientWidth;
    canvasWave.height = 120;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Draw coils in SVG based on number of turns
  function drawCoils() {
    // Primary coil (left side of core)
    // Core left x is between 50 and 86 (stroke width 36) -> center is roughly 68
    let htmlPrimary = '';
    const startY = 40;
    const spacingP = 120 / Np;
    for (let i = 0; i < Np; i++) {
      const y = startY + i * spacingP;
      // Draw an ellipse-like path wrapping around the left core leg
      htmlPrimary += `<path d="M 30 ${y} Q 68 ${y - 10}, 106 ${y} Q 68 ${y + 10}, 30 ${y}" fill="none" stroke="#fab387" stroke-width="2" />`;
    }
    // Wire connections for primary
    htmlPrimary += `<line x1="30" y1="${startY}" x2="30" y2="160" stroke="#fab387" stroke-width="2" />`;
    htmlPrimary += `<line x1="106" y1="${startY + (Np - 1) * spacingP}" x2="106" y2="190" stroke="#fab387" stroke-width="2" />`;
    htmlPrimary += `<line x1="106" y1="190" x2="42" y2="190" stroke="#fab387" stroke-width="2" />`;
    htmlPrimary += `<line x1="42" y1="190" x2="42" y2="180" stroke="#fab387" stroke-width="2" />`;

    coilPrimary.innerHTML = htmlPrimary;

    // Secondary coil (right side of core)
    // Core right x is between 214 and 250 -> center is roughly 232
    let htmlSecondary = '';
    const spacingS = 120 / Ns;
    for (let i = 0; i < Ns; i++) {
      const y = startY + i * spacingS;
      // Draw an ellipse-like path wrapping around the right core leg
      htmlSecondary += `<path d="M 194 ${y} Q 232 ${y - 10}, 270 ${y} Q 232 ${y + 10}, 194 ${y}" fill="none" stroke="#89b4fa" stroke-width="2" />`;
    }
    // Wire connections for secondary
    htmlSecondary += `<line x1="270" y1="${startY}" x2="270" y2="160" stroke="#89b4fa" stroke-width="2" />`;
    htmlSecondary += `<line x1="194" y1="${startY + (Ns - 1) * spacingS}" x2="194" y2="190" stroke="#89b4fa" stroke-width="2" />`;
    htmlSecondary += `<line x1="194" y1="190" x2="270" y2="190" stroke="#89b4fa" stroke-width="2" />`;

    coilSecondary.innerHTML = htmlSecondary;
  }

  // Update logic
  function update() {
    Np = parseInt(sliderNp.value);
    Ns = parseInt(sliderNs.value);
    Vp = parseFloat(sliderVp.value);

    labelNp.textContent = `${Np} vòng`;
    labelNs.textContent = `${Ns} vòng`;
    labelVp.textContent = `${Vp} V`;

    const ratio = Ns / Np;
    labelRatio.textContent = ratio.toFixed(2);

    let Vs = Vp * ratio;
    labelVs.textContent = `${Vs.toFixed(0)} V`;

    if (ratio > 1) {
      labelType.textContent = 'Tăng áp (Step-up)';
      labelType.style.color = '#f38ba8'; // Red
    } else if (ratio < 1) {
      labelType.textContent = 'Hạ áp (Step-down)';
      labelType.style.color = '#a6e3a1'; // Green
    } else {
      labelType.textContent = 'Cách ly (Isolation)';
      labelType.style.color = '#f9e2af'; // Yellow
    }

    drawCoils();
  }

  // Draw loop
  function drawLoop() {
    ctxWave.clearRect(0, 0, canvasWave.width, canvasWave.height);

    const width = canvasWave.width;
    const height = canvasWave.height;
    const midY = height / 2;

    const ratio = Ns / Np;
    const Vs = Vp * ratio;

    // Auto scale to fit both waves nicely. Max voltage is max(Vp, Vs)
    const maxV = Math.max(Vp, Vs, 100);
    const scaleY = (height / 2 - 10) / maxV;

    // Draw Vp wave (orange)
    ctxWave.beginPath();
    ctxWave.strokeStyle = '#fab387';
    ctxWave.lineWidth = 2;
    for (let x = 0; x < width; x++) {
      // Angular freq omega. Let's make it such that 1 screen width = 2 cycles.
      const omega = (Math.PI * 4) / width;
      // Adding time for animation
      const valY = Vp * Math.sin(omega * x - time * 5);
      const y = midY - valY * scaleY;
      if (x === 0) ctxWave.moveTo(x, y);
      else ctxWave.lineTo(x, y);
    }
    ctxWave.stroke();

    // Draw Vs wave (blue). Secondary voltage is either in phase or 180 out of phase, but let's draw it in phase for simplicity.
    ctxWave.beginPath();
    ctxWave.strokeStyle = '#89b4fa';
    ctxWave.lineWidth = 2;
    for (let x = 0; x < width; x++) {
      const omega = (Math.PI * 4) / width;
      const valY = Vs * Math.sin(omega * x - time * 5);
      const y = midY - valY * scaleY;
      if (x === 0) ctxWave.moveTo(x, y);
      else ctxWave.lineTo(x, y);
    }
    ctxWave.stroke();

    // Draw center line
    ctxWave.beginPath();
    ctxWave.strokeStyle = '#45475a';
    ctxWave.lineWidth = 1;
    ctxWave.setLineDash([5, 5]);
    ctxWave.moveTo(0, midY);
    ctxWave.lineTo(width, midY);
    ctxWave.stroke();
    ctxWave.setLineDash([]);

    time += 0.02;
    requestAnimationFrame(drawLoop);
  }

  // Event listeners
  sliderNp.addEventListener('input', update);
  sliderNs.addEventListener('input', update);
  sliderVp.addEventListener('input', update);

  // Initialize
  update();
  drawLoop();
});
