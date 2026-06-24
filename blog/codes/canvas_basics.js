// ============================================
// Bài 1: Canvas cơ bản - Vẽ hình cơ bản
// ============================================
// Vẽ hình chữ nhật, hình tròn, đường path,
// gradient, pattern và một cảnh đơn giản (nhà + mặt trời)

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// --- 1. Hình chữ nhật (rect) ---
// fillRect: vẽ hình chữ nhật đã tô
ctx.fillStyle = '#3498db';
ctx.fillRect(20, 20, 120, 80);

// strokeRect: vẽ viền hình chữ nhật
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 3;
ctx.strokeRect(160, 20, 120, 80);

// clearRect: xoá một vùng trên canvas
ctx.fillStyle = '#2ecc71';
ctx.fillRect(300, 20, 120, 80);
ctx.clearRect(330, 40, 60, 40); // Xoá phần giữa

// --- 2. Đường path (paths) ---
ctx.beginPath();
ctx.moveTo(460, 20);    // Bắt đầu tại điểm
ctx.lineTo(560, 20);    // Vẽ đường thẳng
ctx.lineTo(510, 100);   // Tiếp tục đường
ctx.closePath();         // Đóng path (nối về điểm đầu)
ctx.fillStyle = '#9b59b6';
ctx.fill();
ctx.strokeStyle = '#8e44ad';
ctx.lineWidth = 2;
ctx.stroke();

// --- 3. Hình tròn và cung (arc) ---
// arc(x, y, bánKính, gócBắtĐầu, gócKếtThúc, ngượcChiềuKimĐồngHồ)
ctx.beginPath();
ctx.arc(640, 60, 40, 0, Math.PI * 2); // Hình tròn đầy đủ
ctx.fillStyle = '#f39c12';
ctx.fill();

// Nửa hình tròn
ctx.beginPath();
ctx.arc(730, 60, 40, 0, Math.PI); // Nửa vòng tròn (0 -> PI)
ctx.fillStyle = '#1abc9c';
ctx.fill();

// --- 4. Gradient (chuyển màu) ---
// Gradient tuyến tính (linear)
const linearGrad = ctx.createLinearGradient(20, 130, 200, 130);
linearGrad.addColorStop(0, '#e74c3c');    // Đỏ ở đầu
linearGrad.addColorStop(0.5, '#f39c12');  // Cam ở giữa
linearGrad.addColorStop(1, '#2ecc71');    // Xanh ở cuối
ctx.fillStyle = linearGrad;
ctx.fillRect(20, 130, 180, 60);

// Gradient hình tròn (radial)
const radialGrad = ctx.createRadialGradient(300, 160, 10, 300, 160, 50);
radialGrad.addColorStop(0, '#fff');
radialGrad.addColorStop(1, '#3498db');
ctx.fillStyle = radialGrad;
ctx.beginPath();
ctx.arc(300, 160, 50, 0, Math.PI * 2);
ctx.fill();

// --- 5. Pattern (mẫu lặp) ---
// Tạo pattern từ canvas nhỏ
const patternCanvas = document.createElement('canvas');
patternCanvas.width = 20;
patternCanvas.height = 20;
const pCtx = patternCanvas.getContext('2d');
pCtx.fillStyle = '#ecf0f1';
pCtx.fillRect(0, 0, 20, 20);
pCtx.fillStyle = '#bdc3c7';
pCtx.fillRect(0, 0, 10, 10);
pCtx.fillRect(10, 10, 10, 10);
const pattern = ctx.createPattern(patternCanvas, 'repeat');
ctx.fillStyle = pattern;
ctx.fillRect(400, 130, 180, 60);

// --- 6. Cảnh đơn giản: Nhà + Mặt trời ---
const sceneY = 250; // Vị trí bắt đầu cảnh

// Bầu trời
const skyGrad = ctx.createLinearGradient(0, sceneY, 0, sceneY + 250);
skyGrad.addColorStop(0, '#87CEEB');
skyGrad.addColorStop(1, '#E0F7FA');
ctx.fillStyle = skyGrad;
ctx.fillRect(0, sceneY, 800, 250);

// Mặt đất
ctx.fillStyle = '#4CAF50';
ctx.fillRect(0, sceneY + 170, 800, 80);

// Mặt trời (với tia sáng)
ctx.fillStyle = '#FFC107';
ctx.beginPath();
ctx.arc(650, sceneY + 50, 40, 0, Math.PI * 2);
ctx.fill();
// Tia sáng
ctx.strokeStyle = '#FFC107';
ctx.lineWidth = 2;
for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(650 + Math.cos(angle) * 48, sceneY + 50 + Math.sin(angle) * 48);
    ctx.lineTo(650 + Math.cos(angle) * 60, sceneY + 50 + Math.sin(angle) * 60);
    ctx.stroke();
}

// Thân nhà
ctx.fillStyle = '#FF8A65';
ctx.fillRect(150, sceneY + 90, 160, 80);

// Mái nhà (tam giác)
ctx.beginPath();
ctx.moveTo(130, sceneY + 90);
ctx.lineTo(230, sceneY + 30);
ctx.lineTo(330, sceneY + 90);
ctx.closePath();
ctx.fillStyle = '#D32F2F';
ctx.fill();

// Cửa sổ
ctx.fillStyle = '#BBDEFB';
ctx.fillRect(175, sceneY + 105, 30, 25);
ctx.fillRect(255, sceneY + 105, 30, 25);

// Cửa chính
ctx.fillStyle = '#5D4037';
ctx.fillRect(210, sceneY + 130, 30, 40);

console.log('Bài 1: Canvas cơ bản - đã vẽ xong!');
