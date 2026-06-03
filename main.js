// ── Year ──────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Hero particle canvas ───────────────────────────────
(function () {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], clouds = [];
  const mouse = { x: -9999, y: -9999 };
  let mouseInside = false; // Track if mouse is over canvas
  const ATTRACT_FORCE  = 0.003; // Very light attraction applied to all particles
  const REPEL_RADIUS   = 30;    // Smaller zone — particles can get closer to mouse
  const REPEL_FORCE    = 0.04;  // Strong repulsion to keep particles OUT

  // ── Color palettes per mode ──
  const PALETTES = {
    dawn:  { bg: '#0e0a04', bgCard: '#1a1008', bgCardHover: '#251808', accent: '#f59e0b', accent2: '#fb923c', border: 'rgba(245,158,11,0.2)',  hero: 'rgba(245,158,11,0.18)' },
    day:   { bg: '#0a0f1e', bgCard: '#111827', bgCardHover: '#1a2235', accent: '#4f8ef7', accent2: '#a78bfa', border: 'rgba(79,142,247,0.18)', hero: 'rgba(79,142,247,0.18)'  },
    dusk:  { bg: '#0e0608', bgCard: '#1a0e10', bgCardHover: '#251418', accent: '#f97316', accent2: '#c026d3', border: 'rgba(249,115,22,0.2)',  hero: 'rgba(249,115,22,0.18)'  },
    rain:  { bg: '#060c14', bgCard: '#0d1520', bgCardHover: '#131e2d', accent: '#60a5fa', accent2: '#93c5fd', border: 'rgba(96,165,250,0.2)',  hero: 'rgba(96,165,250,0.12)'  },
    night: { bg: '#050510', bgCard: '#0c0c1e', bgCardHover: '#13132a', accent: '#a78bfa', accent2: '#818cf8', border: 'rgba(167,139,250,0.2)', hero: 'rgba(167,139,250,0.15)' },
  };

  function applyPalette(m) {
    const p = PALETTES[m];
    const root = document.documentElement.style;
    root.setProperty('--bg',           p.bg);
    root.setProperty('--bg-card',      p.bgCard);
    root.setProperty('--bg-card-hover',p.bgCardHover);
    root.setProperty('--accent',       p.accent);
    root.setProperty('--accent-2',     p.accent2);
    root.setProperty('--border',       p.border);
    // Update hero gradient
    const hero = document.querySelector('.hero');
    if (hero) hero.style.background = `
      radial-gradient(ellipse 60% 50% at 50% 40%, ${p.hero.replace(')', ', 0.12)').replace('rgba(', 'rgba(')} 0%, transparent 65%),
      radial-gradient(ellipse 80% 40% at 50% -10%, ${p.hero} 0%, transparent 70%)
    `;
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === m);
    });
  }

  // ── Detect time of day ──
  const hour = new Date().getHours();
  let mode;
  if      (hour >= 5  && hour < 8)  mode = 'dawn';
  else if (hour >= 8  && hour < 17) mode = 'day';
  else if (hour >= 17 && hour < 20) mode = 'dusk';
  else if (hour >= 20 && hour < 23) mode = 'rain';
  else                               mode = 'night';

  // ── Mode switcher buttons ──
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      applyPalette(mode);
      init();
    });
  });


  // ── Mouse ──
  let canvasRect = canvas.getBoundingClientRect();
  function updateRect() {
    canvasRect = canvas.getBoundingClientRect();
  }
  window.addEventListener('scroll', updateRect, { passive: true });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX - canvasRect.left;
    mouse.y = e.clientY - canvasRect.top;
  }, { passive: true });

  // Track mouse enter/leave to enable/disable attraction
  canvas.addEventListener('mouseenter', () => {
    mouseInside = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseInside = false;
  });

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  // ──────────────────────────────────────────────────────
  // PARTICLE FACTORY per mode
  // ──────────────────────────────────────────────────────
  function createParticle() {
    if (mode === 'night') {
      // Stars + occasional snowflake
      const isStar = Math.random() > 0.25;
      return {
        type: isStar ? 'star' : 'snow',
        x: rand(0, W),
        y: isStar ? rand(0, H) : rand(-20, H * 0.3),
        vx: isStar ? 0 : rand(-0.4, 0.4),
        vy: isStar ? 0 : rand(0.3, 0.9),
        r: isStar ? rand(0.5, 2) : rand(2, 5),
        opacity: isStar ? rand(0.4, 1) : rand(0.5, 0.9),
        twinkle: isStar ? rand(0.005, 0.02) : 0,
        twinkleDir: 1,
      };
    }
    if (mode === 'rain') {
      return {
        type: 'rain',
        x: rand(0, W),
        y: rand(-H, 0),
        vx: rand(-0.5, -0.2),
        vy: rand(8, 14),
        len: rand(12, 24),
        opacity: rand(0.2, 0.5),
      };
    }
    if (mode === 'dawn') {
      return {
        type: 'particle',
        x: rand(0, W),
        y: rand(H * 0.3, H),
        vx: rand(-0.3, 0.3),
        vy: -rand(0.3, 0.8),
        r: rand(2, 5),
        opacity: rand(0.3, 0.8),
        color: Math.random() > 0.5 ? '255,180,80' : '255,120,100',
      };
    }
    if (mode === 'dusk') {
      return {
        type: 'particle',
        x: rand(0, W),
        y: rand(H * 0.2, H),
        vx: rand(-0.3, 0.3),
        vy: -rand(0.2, 0.7),
        r: rand(2, 5),
        opacity: rand(0.3, 0.8),
        color: Math.random() > 0.5 ? '255,120,60' : '180,80,220',
      };
    }
    // day — soft blue/white particles + clouds below
    return {
      type: 'particle',
      x: rand(0, W),
      y: rand(H * 0.2, H),
      vx: rand(-0.2, 0.2),
      vy: -rand(0.2, 0.6),
      r: rand(2, 4),
      opacity: rand(0.15, 0.45),
      color: Math.random() > 0.5 ? '79,142,247' : '200,220,255',
    };
  }

  function createCloud() {
    return {
      x: rand(-200, W + 200),
      y: rand(H * 0.05, H * 0.45),
      w: rand(120, 280),
      h: rand(40, 80),
      speed: rand(0.1, 0.35),
      opacity: rand(0.04, 0.12),
    };
  }

  function init() {
    resize();
    const count = (window.innerWidth < 768)
      ? 35
      : ((mode === 'night') ? 120 : (mode === 'rain') ? 140 : 100);
    particles = Array.from({ length: count }, createParticle);
    if (mode === 'day' || mode === 'dawn' || mode === 'dusk') {
      clouds = Array.from({ length: 5 }, createCloud);
    }
  }

  // ──────────────────────────────────────────────────────
  // DRAW CLOUDS
  // ──────────────────────────────────────────────────────
  function drawClouds() {
    for (const c of clouds) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w * 0.6);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w * 0.6, c.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      c.x += c.speed;
      if (c.x > W + 300) { c.x = -300; c.y = rand(H * 0.05, H * 0.45); }
    }
  }

  // ──────────────────────────────────────────────────────
  // DRAW PARTICLES
  // ──────────────────────────────────────────────────────
  function drawParticles() {
    for (const p of particles) {
      if (p.type === 'rain') {
        p.x += p.vx;
        p.y += p.vy;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + p.len);
        ctx.strokeStyle = `rgba(180,210,255,${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (p.y > H + 30) {
          Object.assign(p, createParticle());
        }
        continue;
      }

      if (p.type === 'star') {
        // Twinkle
        p.opacity += p.twinkle * p.twinkleDir;
        if (p.opacity > 1 || p.opacity < 0.1) p.twinkleDir *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        continue;
      }

      if (p.type === 'snow') {
        // Mouse influence with repulsion boundary (only when mouse is inside canvas)
        const isMouseValid = mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H;
        if (isMouseValid) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_RADIUS) {
            // HARD BOUNDARY: push particle outside the circle
            const pushDist = REPEL_RADIUS + 2; // Push slightly outside
            const ratio = pushDist / Math.max(0.1, dist);
            p.x = mouse.x - (dx * ratio);
            p.y = mouse.y - (dy * ratio);
            // Reset velocity to prevent bouncing/jittering
            p.vx = 0;
            p.vy = 0;
            // Apply repulsion force to smoothly push outward
            const repelForce = REPEL_FORCE;
            p.vx -= (dx / dist) * repelForce;
            p.vy -= (dy / dist) * repelForce;
          } else {
            // Far enough — gentle attraction
            const force = ATTRACT_FORCE / Math.max(1, dist / 200);
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vy += 0.015;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,235,255,${p.opacity})`;
        ctx.fill();

        if (p.y > H + 10 || p.x < -10 || p.x > W + 10) {
          Object.assign(p, createParticle(), { type: 'snow', y: -10, opacity: rand(0.5, 0.9) });
        }
        continue;
      }

      // Generic floating particle (dawn / dusk / day) — mouse influence with repulsion boundary
      const isMouseValid = mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H;
      if (isMouseValid) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS) {
          // HARD BOUNDARY: push particle outside the circle
          const pushDist = REPEL_RADIUS + 2; // Push slightly outside
          const ratio = pushDist / Math.max(0.1, dist);
          p.x = mouse.x - (dx * ratio);
          p.y = mouse.y - (dy * ratio);
          // Reset velocity to prevent bouncing/jittering
          p.vx = 0;
          p.vy = 0;
          // Apply repulsion force to smoothly push outward
          const repelForce = REPEL_FORCE;
          p.vx -= (dx / dist) * repelForce;
          p.vy -= (dy / dist) * repelForce;
        } else {
          // Far enough — gentle attraction
          const force = ATTRACT_FORCE / Math.max(1, dist / 200);
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.vy -= 0.012;

      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= 0.0008;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.opacity)})`;
      ctx.fill();

      if (p.y < -10 || p.x < -10 || p.x > W + 10 || p.opacity <= 0) {
        Object.assign(p, createParticle(), { y: H + 10, opacity: rand(0.3, 0.8) });
      }
    }
  }

  let animFrameId = null;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (clouds.length) drawClouds();
    drawParticles();
    animFrameId = requestAnimationFrame(draw);
  }

  // IntersectionObserver to pause/resume canvas animations when hero is out of view
  if ('IntersectionObserver' in window) {
    const heroSection = document.querySelector('.hero');
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animFrameId) {
            animFrameId = requestAnimationFrame(draw);
          }
        } else {
          if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }
        }
      });
    }, { threshold: 0 });

    if (heroSection) {
      heroObserver.observe(heroSection);
    } else {
      draw();
    }
  } else {
    draw();
  }

  window.addEventListener('resize', () => {
    resize();
    updateRect();
  });
  applyPalette(mode);
  init();
})();

// ── Lazy Load Iframes ──────────────────────────────────────────
(function () {
  const iframes = document.querySelectorAll('.sc-demo iframe');
  if ('IntersectionObserver' in window) {
    const iframeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          const src = iframe.dataset.src;
          if (src) {
            iframe.src = src;
            iframe.removeAttribute('data-src');
          }
          iframeObserver.unobserve(iframe);
        }
      });
    }, { rootMargin: '200px' });

    iframes.forEach(iframe => {
      if (iframe.dataset.src) {
        iframeObserver.observe(iframe);
      }
    });
  } else {
    iframes.forEach(iframe => {
      const src = iframe.dataset.src;
      if (src) {
        iframe.src = src;
        iframe.removeAttribute('data-src');
      }
    });
  }
})();

// ── Dynamic Google AdSense Loader ─────────────────────────────
(function () {
  let adSenseLoaded = false;
  function loadAdSense() {
    if (adSenseLoaded) return;
    adSenseLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3175971990265774";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
    events.forEach(e => window.removeEventListener(e, loadAdSense, { passive: true }));
  }
  const events = ['scroll', 'touchstart', 'mousemove', 'click'];
  events.forEach(e => window.addEventListener(e, loadAdSense, { passive: true, once: true }));
  setTimeout(loadAdSense, 3500);
})();
