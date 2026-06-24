// ============================================
// Bài 2: Văn bản và Hình ảnh trên Canvas
// ============================================
// Vẽ chữ với nhiều font, căn lề, đo kích thước,
// hàm word-wrap, và drawImage (vẽ/scale/crop)

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// --- 1. Vẽ văn bản cơ bản ---
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 28px Arial';
ctx.fillText('Canvas Text Demo', 20, 40);

// Chữ với stroke (viền)
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 1;
ctx.font = 'italic 24px Georgia';
ctx.strokeText('Chữ có viền (stroke)', 20, 75);

// --- 2. Căn lề văn bản (textAlign) ---
const centerX = 400;
ctx.strokeStyle = '#ccc';
ctx.beginPath();
ctx.moveTo(centerX, 100);
ctx.lineTo(centerX, 200);
ctx.stroke(); // Đường thẳng đánh dấu tâm

ctx.font = '16px monospace';
ctx.fillStyle = '#333';

// Các kiểu căn lề: start, center, end, left, right
const aligns = ['left', 'center', 'right'];
aligns.forEach((align, i) => {
    ctx.textAlign = align;
    ctx.fillText(`textAlign = "${align}"`, centerX, 125 + i * 25);
});
ctx.textAlign = 'left'; // Reset

// --- 3. Căn dọc (textBaseline) ---
const baseY = 240;
ctx.strokeStyle = '#aaa';
ctx.beginPath();
ctx.moveTo(20, baseY);
ctx.lineTo(780, baseY);
ctx.stroke(); // Đường cơ sở

ctx.font = '16px Arial';
const baselines = ['top', 'middle', 'alphabetic', 'bottom'];
baselines.forEach((bl, i) => {
    ctx.textBaseline = bl;
    ctx.fillText(bl, 20 + i * 180, baseY);
});
ctx.textBaseline = 'alphabetic'; // Reset

// --- 4. Đo kích thước văn bản (measureText) ---
ctx.font = 'bold 20px Arial';
const text = 'Đo kích thước văn bản';
const metrics = ctx.measureText(text);
ctx.fillStyle = '#ecf0f1';
ctx.fillRect(20, 270, metrics.width, 30); // Nền có chiều rộng bằng chữ
ctx.fillStyle = '#2c3e50';
ctx.fillText(text, 20, 293);
ctx.font = '12px Arial';
ctx.fillStyle = '#e74c3c';
ctx.fillText(`Chiều rộng: ${metrics.width.toFixed(1)}px`, 20, 320);

// --- 5. Hàm Word Wrap (xuống dòng tự động) ---
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && line !== '') {
            ctx.fillText(line.trim(), x, currentY);
            line = word + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY); // Dòng cuối
    return currentY; // Trả về vị trí Y cuối cùng
}

ctx.font = '15px Arial';
ctx.fillStyle = '#34495e';
const longText = 'Canvas cho phép bạn vẽ văn bản với nhiều tùy chỉnh. Tuy nhiên nó không tự động xuống dòng nên ta cần viết hàm word wrap để chia văn bản dài thành nhiều dòng phù hợp với chiều rộng cho phép.';
// Vẽ khung
ctx.strokeStyle = '#3498db';
ctx.strokeRect(20, 340, 350, 100);
wrapText(ctx, longText, 25, 358, 340, 20);

// --- 6. drawImage - Vẽ hình ảnh ---
// Tạo hình ảnh mẫu từ canvas nhỏ (thay vì tải file ngoài)
const srcCanvas = document.createElement('canvas');
srcCanvas.width = 100;
srcCanvas.height = 100;
const srcCtx = srcCanvas.getContext('2d');
// Vẽ mẫu ô vuông đầy màu sắc
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
        srcCtx.fillStyle = colors[r * 2 + c];
        srcCtx.fillRect(c * 50, r * 50, 50, 50);
    }
}
srcCtx.fillStyle = '#fff';
srcCtx.font = 'bold 14px Arial';
srcCtx.textAlign = 'center';
srcCtx.fillText('SRC', 50, 55);

// 6a. Vẽ nguyên gốc
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 14px Arial';
ctx.fillText('Nguyên gốc:', 420, 355);
ctx.drawImage(srcCanvas, 420, 360);

// 6b. Vẽ co giãn (scale)
ctx.fillText('Thu nhỏ 50%:', 540, 355);
ctx.drawImage(srcCanvas, 540, 360, 50, 50); // dx, dy, dw, dh

// 6c. Vẽ cắt vùng (crop)
ctx.fillText('Cắt góc trái-trên:', 620, 355);
// drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh)
ctx.drawImage(srcCanvas, 0, 0, 50, 50, 620, 360, 80, 80); // Cắt 50x50 -> vẽ 80x80

console.log('Bài 2: Văn bản và Hình ảnh - đã vẽ xong!');
