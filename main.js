// ── Year ──────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Hero particle canvas ───────────────────────────────
(function () {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(H * 0.2, H),
      r: randomBetween(1, 3),
      speed: randomBetween(0.3, 1.1),
      drift: randomBetween(-0.3, 0.3),
      opacity: randomBetween(0.2, 0.7),
      color: Math.random() > 0.5 ? '79,142,247' : '167,139,250',
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 90 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();
      p.y -= p.speed;
      p.x += p.drift;
      p.opacity -= 0.001;
      if (p.y < -10 || p.opacity <= 0) {
        Object.assign(p, createParticle(), { y: H + 10, opacity: randomBetween(0.2, 0.7) });
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();
