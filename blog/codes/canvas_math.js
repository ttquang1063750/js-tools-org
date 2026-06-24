// ============================================
// Bài 5: Toán học cho Canvas
// ============================================
// Lớp Vec2, chuyển động tròn (sin/cos), xoắn ốc,
// đối tượng hướng về chuột (atan2), đường cong hoa hồng

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// --- 1. Lớp Vec2 (Vector 2D) ---
class Vec2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }

    // Cộng hai vector
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }

    // Trừ hai vector
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }

    // Nhân với scalar
    mult(s) { return new Vec2(this.x * s, this.y * s); }

    // Độ dài (magnitude)
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }

    // Chuẩn hoá (normalize) - vector đơn vị
    normalize() {
        const m = this.mag();
        return m > 0 ? new Vec2(this.x / m, this.y / m) : new Vec2(0, 0);
    }

    // Tích vô hướng (dot product)
    dot(v) { return this.x * v.x + this.y * v.y; }

    // Góc so với trục X (radian)
    angle() { return Math.atan2(this.y, this.x); }

    // Xoay vector theo góc (radian)
    rotate(rad) {
        const cos = Math.cos(rad), sin = Math.sin(rad);
        return new Vec2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    // Khoảng cách đến vector khác
    distTo(v) { return this.sub(v).mag(); }

    // Nhân bản
    clone() { return new Vec2(this.x, this.y); }
}

// Vị trí chuột
let mouse = new Vec2(400, 300);
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse = new Vec2(
        (e.clientX - rect.left) * (canvas.width / rect.width),
        (e.clientY - rect.top) * (canvas.height / rect.height)
    );
});

let time = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tiêu đề
    ctx.fillStyle = '#eee';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Bài 5: Toán học cho Canvas', 20, 25);

    // --- 2. Chuyển động tròn (sin/cos) ---
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText('Chuyển động tròn (sin/cos)', 30, 65);

    const orbitCenter = new Vec2(120, 160);
    const orbitR = 60;

    // Vẽ quỹ đạo
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(orbitCenter.x, orbitCenter.y, orbitR, 0, Math.PI * 2);
    ctx.stroke();

    // 3 vật thể quay với tốc độ khác nhau
    for (let i = 0; i < 3; i++) {
        const speed = 1 + i * 0.5;
        const r = orbitR - i * 15;
        const px = orbitCenter.x + Math.cos(time * speed) * r;
        const py = orbitCenter.y + Math.sin(time * speed) * r;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${i * 120}, 80%, 60%)`;
        ctx.fill();
    }

    // --- 3. Xoắn ốc (polar to cartesian) ---
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText('Xoắn ốc (toạ độ cực)', 270, 65);

    const spiralCenter = new Vec2(350, 160);
    ctx.beginPath();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    for (let t = 0; t < 100; t++) {
        // r tăng dần theo góc -> xoắn ốc Archimedes
        const theta = t * 0.15 + time;
        const r = t * 0.6;
        const x = spiralCenter.x + Math.cos(theta) * r;
        const y = spiralCenter.y + Math.sin(theta) * r;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // --- 4. Hướng về chuột (atan2) ---
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText('Hướng về chuột (atan2) - di chuột!', 500, 65);

    const arrowPos = new Vec2(620, 160);
    const toMouse = mouse.sub(arrowPos);
    const angleToMouse = toMouse.angle(); // atan2(dy, dx)

    ctx.save();
    ctx.translate(arrowPos.x, arrowPos.y);
    ctx.rotate(angleToMouse);
    // Vẽ mũi tên
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(-15, -12);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-15, 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Hiển thị góc
    ctx.fillStyle = '#f1c40f';
    ctx.font = '12px monospace';
    ctx.fillText(`Góc: ${(angleToMouse * 180 / Math.PI).toFixed(1)}°`, 580, 220);

    // --- 5. Đường cong hoa hồng (Rose Curve) ---
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText('Đường cong hoa hồng (Rose Curve)', 30, 290);

    // r = cos(k * theta) - với k là số cánh hoa
    const roseCenter = new Vec2(150, 420);
    const roseR = 80;
    const k = 5; // Số cánh (lẻ = k cánh, chẵn = 2k cánh)

    ctx.beginPath();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 2;
    for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        const r = roseR * Math.cos(k * (t + time * 0.3));
        const x = roseCenter.x + r * Math.cos(t);
        const y = roseCenter.y + r * Math.sin(t);
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // --- 6. Demo Vec2: nhiều vector từ tâm ---
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText('Vec2 demo: xoay + normalize', 350, 290);

    const vecCenter = new Vec2(470, 420);
    const baseVec = new Vec2(70, 0);

    for (let i = 0; i < 12; i++) {
        const rotated = baseVec.rotate(time + (i / 12) * Math.PI * 2);
        const norm = rotated.normalize().mult(30 + Math.sin(time * 2 + i) * 20);
        const endPt = vecCenter.add(norm);

        ctx.strokeStyle = `hsl(${i * 30}, 70%, 60%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vecCenter.x, vecCenter.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${i * 30}, 70%, 60%)`;
        ctx.fill();
    }

    // --- 7. Lissajous curve (bonus) ---
    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText('Đường Lissajous', 620, 290);

    const lCenter = new Vec2(700, 420);
    ctx.beginPath();
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 1.5;
    for (let t = 0; t < Math.PI * 2; t += 0.02) {
        const x = lCenter.x + 60 * Math.sin(3 * t + time);
        const y = lCenter.y + 60 * Math.sin(2 * t);
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    time += 0.02;
    requestAnimationFrame(draw);
}

draw();

console.log('Bài 5: Toán học cho Canvas - di chuột để tương tác!');
