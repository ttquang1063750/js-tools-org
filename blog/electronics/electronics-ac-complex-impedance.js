document.addEventListener('DOMContentLoaded', () => {
  const canvasPhasor = document.getElementById('canvas-phasor');
  const canvasWave = document.getElementById('canvas-wave');
  const ctxPhasor = canvasPhasor.getContext('2d');
  const ctxWave = canvasWave.getContext('2d');
  const statusEl = document.getElementById('sim-status');

  const btnR = document.getElementById('btn-load-r');
  const btnC = document.getElementById('btn-load-c');
  const btnL = document.getElementById('btn-load-l');

  let mode = 'R'; // R, C, or L
  let time = 0;
  let animationId;

  // Parameters
  const omega = 0.05; // angular velocity for animation
  const Vm = 80; // Voltage amplitude
  let Im = 60; // Current amplitude
  let phaseShift = 0; // phase of Current relative to Voltage (in radians)

  // Waveform history
  const waveHistory = [];

  function updateMode() {
    btnR.style.background = mode === 'R' ? 'rgba(79, 142, 247, 0.3)' : 'var(--border)';
    btnC.style.background = mode === 'C' ? 'rgba(79, 142, 247, 0.3)' : 'var(--border)';
    btnL.style.background = mode === 'L' ? 'rgba(79, 142, 247, 0.3)' : 'var(--border)';

    const svgR = document.getElementById('svg-load-r');
    const svgC = document.getElementById('svg-load-c');
    const svgL = document.getElementById('svg-load-l');
    if (svgR) svgR.style.display = mode === 'R' ? 'block' : 'none';
    if (svgC) svgC.style.display = mode === 'C' ? 'block' : 'none';
    if (svgL) svgL.style.display = mode === 'L' ? 'block' : 'none';

    if (mode === 'R') {
      phaseShift = 0;
      statusEl.textContent = 'Đồng pha (In Phase) - Dòng điện và Điện áp cùng đỉnh';
    } else if (mode === 'C') {
      phaseShift = Math.PI / 2;
      statusEl.textContent = 'Dòng điện I dẫn trước Điện áp V 90° (ICE)';
    } else if (mode === 'L') {
      phaseShift = -Math.PI / 2;
      statusEl.textContent = 'Điện áp V dẫn trước Dòng điện I 90° (ELI)';
    }
  }

  btnR.addEventListener('click', () => { mode = 'R'; updateMode(); });
  btnC.addEventListener('click', () => { mode = 'C'; updateMode(); });
  btnL.addEventListener('click', () => { mode = 'L'; updateMode(); });

  function drawArrow(ctx, fromX, fromY, toX, toY, color) {
    const headlen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fill();
  }

  function resizeCanvases() {
    const pRect = canvasPhasor.parentElement.getBoundingClientRect();
    canvasPhasor.width = pRect.width - 32;
    canvasPhasor.height = pRect.width - 32;

    const wRect = canvasWave.parentElement.getBoundingClientRect();
    canvasWave.width = wRect.width;
    canvasWave.height = wRect.height || 220;
  }

  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  function animate() {
    time += omega;

    // --- Draw Phasor ---
    ctxPhasor.clearRect(0, 0, canvasPhasor.width, canvasPhasor.height);
    const cx = canvasPhasor.width / 2;
    const cy = canvasPhasor.height / 2;

    // Axes
    ctxPhasor.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctxPhasor.lineWidth = 1;
    ctxPhasor.beginPath();
    ctxPhasor.moveTo(0, cy); ctxPhasor.lineTo(canvasPhasor.width, cy);
    ctxPhasor.moveTo(cx, 0); ctxPhasor.lineTo(cx, canvasPhasor.height);
    ctxPhasor.stroke();
    ctxPhasor.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctxPhasor.font = '12px monospace';
    ctxPhasor.fillText('Re', canvasPhasor.width - 20, cy - 5);
    ctxPhasor.fillText('Im', cx + 5, 15);

    // V Phasor
    const vx = cx + Vm * Math.cos(time);
    const vy = cy - Vm * Math.sin(time); // y is inverted in canvas
    drawArrow(ctxPhasor, cx, cy, vx, vy, '#fab387');

    // I Phasor
    const ix = cx + Im * Math.cos(time + phaseShift);
    const iy = cy - Im * Math.sin(time + phaseShift);
    drawArrow(ctxPhasor, cx, cy, ix, iy, '#89b4fa');

    // --- Draw Waveform ---
    ctxWave.clearRect(0, 0, canvasWave.width, canvasWave.height);
    const wy = canvasWave.height / 2;

    // Center line
    ctxWave.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctxWave.lineWidth = 1;
    ctxWave.beginPath();
    ctxWave.moveTo(0, wy); ctxWave.lineTo(canvasWave.width, wy);
    ctxWave.stroke();

    // Record history
    waveHistory.push({
      v: -Vm * Math.sin(time),
      i: -Im * Math.sin(time + phaseShift)
    });
    if (waveHistory.length > canvasWave.width) {
      waveHistory.shift();
    }

    // Draw V wave
    ctxWave.strokeStyle = '#fab387';
    ctxWave.lineWidth = 2;
    ctxWave.beginPath();
    for (let j = 0; j < waveHistory.length; j++) {
      const x = canvasWave.width - waveHistory.length + j;
      const y = wy + waveHistory[j].v;
      if (j === 0) ctxWave.moveTo(x, y);
      else ctxWave.lineTo(x, y);
    }
    ctxWave.stroke();

    // Draw I wave
    ctxWave.strokeStyle = '#89b4fa';
    ctxWave.beginPath();
    for (let j = 0; j < waveHistory.length; j++) {
      const x = canvasWave.width - waveHistory.length + j;
      const y = wy + waveHistory[j].i;
      if (j === 0) ctxWave.moveTo(x, y);
      else ctxWave.lineTo(x, y);
    }
    ctxWave.stroke();

    animationId = requestAnimationFrame(animate);
  }

  updateMode();
  animate();
});
