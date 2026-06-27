// ============================================
// Bài 8: Canvas Responsive
// ============================================
// ResizeObserver, DPI scaling (devicePixelRatio),
// fullscreen toggle, xử lý sự kiện touch

const canvas = document.getElementById('canvas') || document.createElement('canvas');
if (!canvas.parentElement) document.body.appendChild(canvas);
canvas.style.width = '100%';
canvas.style.maxWidth = '800px';
canvas.style.display = 'block';
canvas.style.border = '1px solid #ccc';
canvas.style.touchAction = 'none'; // Ngăn scroll khi touch trên canvas
const ctx = canvas.getContext('2d');

// --- 1. DPI Scaling (devicePixelRatio) ---
// Trên màn hình Retina, devicePixelRatio > 1
// Canvas cần được scale lên để hình ảnh không bị mờ
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // Đặt kích thước thực của canvas (pixel) = kích thước hiển thị * dpr
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale context để vẽ với toạ độ CSS (không phải pixel thực)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Trả về kích thước CSS để dùng khi vẽ
  return { width: rect.width, height: rect.height, dpr };
}

// --- 2. ResizeObserver ---
// Tự động gọi lại khi kích thước canvas thay đổi
let canvasSize = resizeCanvas();

const resizeObserver = new ResizeObserver((entries) => {
  canvasSize = resizeCanvas();
  draw(); // Vẽ lại khi resize
});
resizeObserver.observe(canvas);

// --- 3. Fullscreen Toggle ---
let isFullscreen = false;

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Vào fullscreen
    canvas.requestFullscreen?.() || canvas.webkitRequestFullscreen?.(); // Safari
    isFullscreen = true;
  } else {
    document.exitFullscreen?.();
    isFullscreen = false;
  }
}

// Nút fullscreen (vẽ trên canvas)
const btnRect = { x: 10, y: 10, w: 110, h: 30 };

// --- 4. Touch Event Handling ---
const touches = []; // Danh sách điểm chạm hiện tại

function getTouchPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    id: touch.identifier,
  };
}

canvas.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      touches.push(getTouchPos(touch));
    }
    draw();
  },
  { passive: false }
);

canvas.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const idx = touches.findIndex((t) => t.id === touch.identifier);
      if (idx !== -1) touches[idx] = getTouchPos(touch);
    }
    draw();
  },
  { passive: false }
);

canvas.addEventListener('touchend', (e) => {
  for (const touch of e.changedTouches) {
    const idx = touches.findIndex((t) => t.id === touch.identifier);
    if (idx !== -1) touches.splice(idx, 1);
  }
  draw();
});

// Click handler (mouse) cho nút fullscreen
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  if (mx >= btnRect.x && mx <= btnRect.x + btnRect.w && my >= btnRect.y && my <= btnRect.y + btnRect.h) {
    toggleFullscreen();
  }
});

// Mouse tracking
let mousePos = null;
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  draw();
});
canvas.addEventListener('mouseleave', () => {
  mousePos = null;
  draw();
});

// --- 5. Hàm vẽ chính ---
function draw() {
  const { width, height, dpr } = canvasSize;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, width, height);

  // Tiêu đề
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Bài 8: Canvas Responsive', 140, 30);

  // Nút Fullscreen
  ctx.fillStyle = isFullscreen ? '#e74c3c' : '#3498db';
  ctx.fillRect(btnRect.x, btnRect.y, btnRect.w, btnRect.h);
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.fillText(isFullscreen ? 'Exit FS' : 'Fullscreen', btnRect.x + 15, btnRect.y + 20);

  // Thông tin kích thước
  ctx.fillStyle = '#7f8c8d';
  ctx.font = '13px monospace';
  ctx.fillText(`CSS: ${Math.round(width)}×${Math.round(height)}px`, 10, 65);
  ctx.fillText(`Canvas: ${canvas.width}×${canvas.height}px`, 10, 82);
  ctx.fillText(`DPR: ${dpr}`, 10, 99);
  ctx.fillText(`Fullscreen: ${isFullscreen}`, 10, 116);

  // Vẽ lưới responsive (thay đổi theo kích thước)
  const cols = Math.max(2, Math.floor(width / 100));
  const rows = Math.max(2, Math.floor((height - 140) / 80));
  const cellW = (width - 20) / cols;
  const cellH = (height - 140) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = 10 + c * cellW;
      const cy = 130 + r * cellH;
      const hue = ((r * cols + c) / (rows * cols)) * 360;
      ctx.fillStyle = `hsla(${hue}, 60%, 70%, 0.5)`;
      ctx.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
      ctx.strokeStyle = `hsl(${hue}, 60%, 50%)`;
      ctx.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
    }
  }

  // Hiển thị vị trí mouse
  if (mousePos) {
    ctx.fillStyle = '#e74c3c';
    ctx.font = '11px monospace';
    ctx.fillText(`Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, 250, 65);
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hiển thị touch points
  touches.forEach((t, i) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${i * 60}, 80%, 50%, 0.5)`;
    ctx.fill();
    ctx.strokeStyle = `hsl(${i * 60}, 80%, 50%)`;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${i}`, t.x, t.y + 4);
    ctx.textAlign = 'left';
  });
  if (touches.length > 0) {
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px monospace';
    ctx.fillText(`Touches: ${touches.length}`, 250, 82);
  }
}

draw();

console.log('Bài 8: Canvas Responsive - thử resize cửa sổ hoặc touch trên mobile!');
