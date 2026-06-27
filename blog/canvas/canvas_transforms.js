// ============================================
// Bài 3: Biến đổi (Transforms) trên Canvas
// ============================================
// save/restore, translate+rotate (cối xay gió quay),
// scale, setTransform matrix

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let angle = 0; // Góc quay hiện tại của cối xay gió

// --- 1. save() và restore() ---
// save: lưu trạng thái hiện tại (màu, biến đổi, clip...)
// restore: khôi phục trạng thái đã lưu trước đó
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 18px Arial';
ctx.fillText('1. save/restore', 20, 30);

ctx.save(); // Lưu trạng thái gốc
ctx.fillStyle = '#e74c3c';
ctx.globalAlpha = 0.5;
ctx.fillRect(20, 40, 100, 50);
ctx.restore(); // Khôi phục -> fillStyle lại là #2c3e50, alpha = 1

ctx.fillRect(130, 40, 100, 50); // Vẽ với trạng thái gốc

// --- 2. translate + rotate: Vẽ hình xoay ---
ctx.font = 'bold 18px Arial';
ctx.fillText('2. translate + rotate', 300, 30);

// Vẽ nhiều hình chữ nhật xoay quanh một điểm
const cx = 400,
  cy = 120;
for (let i = 0; i < 8; i++) {
  ctx.save();
  ctx.translate(cx, cy); // Di chuyển gốc toạ độ đến tâm
  ctx.rotate((i / 8) * Math.PI * 2); // Xoay theo góc
  ctx.fillStyle = `hsl(${i * 45}, 70%, 50%)`;
  ctx.fillRect(0, -8, 60, 16); // Vẽ hình chữ nhật từ tâm
  ctx.restore(); // Khôi phục gốc toạ độ
}

// --- 3. scale: Co giãn ---
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 18px Arial';
ctx.fillText('3. scale', 600, 30);

// Vẽ cùng một ngôi sao ở các kích thước khác nhau
function drawStar(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

const scales = [0.5, 1.0, 1.5];
scales.forEach((s, i) => {
  ctx.save();
  ctx.translate(640 + i * 55, 90);
  ctx.scale(s, s); // Co giãn theo tỷ lệ s
  ctx.fillStyle = '#f39c12';
  drawStar(0, 0, 20); // Vẽ ngôi sao cùng kích thước, nhưng bị scale
  ctx.restore();
});

// --- 4. setTransform: Ma trận biến đổi trực tiếp ---
// setTransform(a, b, c, d, e, f) tương ứng ma trận:
// | a  c  e |
// | b  d  f |
// | 0  0  1 |
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 18px Arial';
ctx.fillText('4. setTransform (ma trận)', 20, 210);

ctx.save();
// Ma trận nghiêng (shear/skew)
// a=1, b=0.3 (nghiêng Y), c=0, d=1, e=20, f=230
ctx.setTransform(1, 0.3, 0, 1, 20, 230);
ctx.fillStyle = '#9b59b6';
ctx.fillRect(0, 0, 120, 50);
ctx.fillStyle = '#fff';
ctx.font = '14px Arial';
ctx.fillText('Skew Y', 30, 30);
ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset về identity
ctx.restore();

ctx.save();
// Nghiêng theo X
ctx.setTransform(1, 0, 0.4, 1, 180, 230);
ctx.fillStyle = '#1abc9c';
ctx.fillRect(0, 0, 120, 50);
ctx.fillStyle = '#fff';
ctx.font = '14px Arial';
ctx.fillText('Skew X', 30, 30);
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.restore();

// --- 5. Cối xay gió quay (Windmill Animation) ---
// Kết hợp translate + rotate + requestAnimationFrame
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 18px Arial';
ctx.fillText('5. Cối xay gió quay', 450, 210);

const windmillX = 570,
  windmillY = 380;

function drawWindmill(time) {
  // Xoá vùng cối xay gió
  ctx.clearRect(400, 225, 400, 275);

  // Thân cối xay gió
  ctx.fillStyle = '#795548';
  ctx.fillRect(windmillX - 10, windmillY - 80, 20, 120);

  // Đế
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(windmillX - 30, windmillY + 40);
  ctx.lineTo(windmillX + 30, windmillY + 40);
  ctx.lineTo(windmillX + 15, windmillY);
  ctx.lineTo(windmillX - 15, windmillY);
  ctx.closePath();
  ctx.fill();

  // Cánh quạt (4 cánh xoay)
  const bladeCount = 4;
  const bladeLen = 70;
  const hubY = windmillY - 80;

  for (let i = 0; i < bladeCount; i++) {
    ctx.save();
    ctx.translate(windmillX, hubY);
    ctx.rotate(angle + (i * Math.PI * 2) / bladeCount);

    // Mỗi cánh là một hình thang dài
    ctx.fillStyle = '#ECEFF1';
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(bladeLen, -2);
    ctx.lineTo(bladeLen, 2);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Tâm trục
  ctx.beginPath();
  ctx.arc(windmillX, hubY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#455A64';
  ctx.fill();

  // Tăng góc quay
  angle += 0.02;

  requestAnimationFrame(drawWindmill);
}

drawWindmill(0);

console.log('Bài 3: Biến đổi trên Canvas - đang chạy animation cối xay gió!');
