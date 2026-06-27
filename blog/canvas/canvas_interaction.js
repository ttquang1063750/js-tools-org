// ============================================
// Bài 9: Canvas Interaction Events
// ============================================
// Mouse coordinate mapping, hit detection (rect/circle),
// drag & drop, and hover states.

const canvas = document.getElementById('canvas') || document.createElement('canvas');
if (!canvas.parentElement) document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 400;
canvas.style.border = '1px solid #ccc';
canvas.style.background = '#fafafa';
canvas.style.display = 'block';
const ctx = canvas.getContext('2d');

// --- 1. Đối tượng hình học tương tác ---
const shapes = [
  { type: 'rect', x: 100, y: 150, w: 100, h: 80, color: '#3498db', hoverColor: '#2980b9', isDragging: false },
  { type: 'circle', x: 400, y: 190, r: 50, color: '#e74c3c', hoverColor: '#c0392b', isDragging: false },
];

let dragOffset = { x: 0, y: 0 };
let hoveredShape = null;

// --- 2. Hàm tọa độ cục bộ (Coordinate Mapping) ---
// Chuyển đổi tọa độ từ chuột (client space) sang tọa độ Canvas local space
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// --- 3. Thuật toán Va chạm/Kiểm tra điểm chạm (Hit Detection) ---
// Point-in-Rectangle
function isPointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// Point-in-Circle
function isPointInCircle(px, py, cx, cy, cr) {
  const dx = px - cx;
  const dy = py - cy;
  // Euclidean distance square <= radius square
  return dx * dx + dy * dy <= cr * cr;
}

// Kiểm tra xem chuột có nằm trên shape nào không
function getShapeAtPosition(x, y) {
  // Duyệt ngược từ cuối lên đầu để chọn shape hiển thị ở trên cùng
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    if (s.type === 'rect') {
      if (isPointInRect(x, y, s.x, s.y, s.w, s.h)) return s;
    } else if (s.type === 'circle') {
      if (isPointInCircle(x, y, s.x, s.y, s.r)) return s;
    }
  }
  return null;
}

// --- 4. Xử lý Sự kiện (Event Handlers) ---

// Mouse Move: Cập nhật hover state, xử lý kéo (drag)
canvas.addEventListener('mousemove', (e) => {
  const mouse = getMousePos(e);

  // Xử lý kéo thả (Drag)
  const activeDragShape = shapes.find((s) => s.isDragging);
  if (activeDragShape) {
    activeDragShape.x = mouse.x - dragOffset.x;
    activeDragShape.y = mouse.y - dragOffset.y;

    // Hạn chế trong biên Canvas
    if (activeDragShape.type === 'rect') {
      activeDragShape.x = Math.max(0, Math.min(canvas.width - activeDragShape.w, activeDragShape.x));
      activeDragShape.y = Math.max(0, Math.min(canvas.height - activeDragShape.h, activeDragShape.y));
    } else if (activeDragShape.type === 'circle') {
      activeDragShape.x = Math.max(activeDragShape.r, Math.min(canvas.width - activeDragShape.r, activeDragShape.x));
      activeDragShape.y = Math.max(activeDragShape.r, Math.min(canvas.height - activeDragShape.r, activeDragShape.y));
    }

    draw();
    return;
  }

  // Xử lý Hover
  const shape = getShapeAtPosition(mouse.x, mouse.y);
  if (shape !== hoveredShape) {
    hoveredShape = shape;
    // Đổi con trỏ chuột sang dạng pointer nếu hover trên shape
    canvas.style.cursor = hoveredShape ? 'pointer' : 'default';
    draw();
  }
});

// Mouse Down: Bắt đầu kéo
canvas.addEventListener('mousedown', (e) => {
  const mouse = getMousePos(e);
  const shape = getShapeAtPosition(mouse.x, mouse.y);

  if (shape) {
    shape.isDragging = true;
    // Tính toán khoảng lệch từ góc/tâm của shape đến chuột để kéo mượt mà
    if (shape.type === 'rect') {
      dragOffset.x = mouse.x - shape.x;
      dragOffset.y = mouse.y - shape.y;
    } else if (shape.type === 'circle') {
      dragOffset.x = mouse.x - shape.x;
      dragOffset.y = mouse.y - shape.y;
    }

    // Đưa shape đang kéo lên trên cùng của danh sách vẽ
    const idx = shapes.indexOf(shape);
    shapes.splice(idx, 1);
    shapes.push(shape);

    draw();
  }
});

// Mouse Up: Dừng kéo
canvas.addEventListener('mouseup', () => {
  shapes.forEach((s) => (s.isDragging = false));
  draw();
});

// Mouse Leave: Reset trạng thái khi rời chuột khỏi canvas
canvas.addEventListener('mouseleave', () => {
  shapes.forEach((s) => (s.isDragging = false));
  hoveredShape = null;
  canvas.style.cursor = 'default';
  draw();
});

// --- 5. Hàm Vẽ (Drawing System) ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Vẽ lưới tọa độ background
  ctx.strokeStyle = '#eef0f2';
  ctx.lineWidth = 1;
  for (let x = 50; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 50; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Vẽ tiêu đề hướng dẫn
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Bài 9: Canvas Interaction Events', 20, 30);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#7f8c8d';
  ctx.fillText('Rê chuột lên hình (Hover) & Kéo thả (Drag & Drop) để thử tương tác', 20, 50);

  // Vẽ các hình
  shapes.forEach((s) => {
    const isHovered = s === hoveredShape || s.isDragging;
    ctx.fillStyle = isHovered ? s.hoverColor : s.color;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = s.isDragging ? 3 : 1;

    if (s.type === 'rect') {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    } else if (s.type === 'circle') {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  });
}

// Lần đầu vẽ
draw();
