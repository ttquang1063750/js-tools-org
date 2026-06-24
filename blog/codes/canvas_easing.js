// ============================================
// Bài 7: Easing & Tween Animation
// ============================================
// Các hàm easing, lớp Tween, spring animation
// (định luật Hooke), animation theo đường Bezier

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// --- 1. Các hàm Easing ---
// Nhận t từ 0 -> 1, trả về giá trị đã biến đổi
const Easing = {
    // Tuyến tính - không có easing
    linear: t => t,

    // Bắt đầu chậm, tăng tốc
    easeInQuad: t => t * t,

    // Bắt đầu nhanh, giảm tốc
    easeOutQuad: t => t * (2 - t),

    // Chậm -> nhanh -> chậm (mượt)
    easeInOutCubic: t => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2,

    // Nảy đàn hồi ở cuối
    easeOutElastic: t => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    },

    // Nảy như bóng rơi
    easeOutBounce: t => {
        const n1 = 7.5625, d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },

    // Lùi lại trước khi tiến (overshooting)
    easeInBack: t => {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
};

// --- 2. Lớp Tween ---
class Tween {
    constructor(from, to, duration, easingFn = Easing.linear) {
        this.from = from;       // Giá trị bắt đầu
        this.to = to;           // Giá trị kết thúc
        this.duration = duration; // Thời gian (giây)
        this.easingFn = easingFn;
        this.elapsed = 0;       // Thời gian đã trôi
        this.done = false;
    }

    update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.elapsed = this.duration;
            this.done = true;
        }
    }

    // Lấy giá trị hiện tại
    value() {
        const t = this.elapsed / this.duration;
        const easedT = this.easingFn(t);
        return this.from + (this.to - this.from) * easedT;
    }

    // Reset tween
    reset() {
        this.elapsed = 0;
        this.done = false;
    }
}

// --- 3. Spring Animation (Định luật Hooke) ---
class Spring {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = 0;
        this.vy = 0;
        this.stiffness = 120;   // Độ cứng lò xo (k)
        this.damping = 8;       // Hệ số giảm chấn
    }

    update(dt) {
        // F = -k * displacement (Định luật Hooke)
        const dx = this.x - this.targetX;
        const dy = this.y - this.targetY;

        // Gia tốc = lực lò xo - lực giảm chấn
        const ax = -this.stiffness * dx - this.damping * this.vx;
        const ay = -this.stiffness * dy - this.damping * this.vy;

        this.vx += ax * dt;
        this.vy += ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }
}

// --- 4. Bezier Curve Path Animation ---
// Cubic Bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
function cubicBezier(t, p0, p1, p2, p3) {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

// --- Khởi tạo demo ---
// Tween demo cho từng hàm easing
const easingNames = Object.keys(Easing);
const tweens = easingNames.map(name =>
    new Tween(0, 1, 2, Easing[name])
);

// Spring demo
const spring = new Spring(650, 480, 650, 480);
canvas.addEventListener('click', () => {
    // Click để đặt lại spring về vị trí ngẫu nhiên
    spring.x = 550 + Math.random() * 200;
    spring.y = 400 + Math.random() * 150;
    // Reset tweens
    tweens.forEach(tw => tw.reset());
    bezierT = 0;
});

// Bezier path
const bezierPath = {
    p0x: 480, p0y: 330, p1x: 550, p1y: 220,
    p2x: 700, p2y: 220, p3x: 770, p3y: 330
};
let bezierT = 0;

let lastTime = 0;

function animate(timestamp) {
    const dt = lastTime ? (timestamp - lastTime) / 1000 : 0;
    lastTime = timestamp;

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Tiêu đề ---
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Bài 7: Easing & Tween (click để reset)', 20, 25);

    // --- Vẽ đồ thị easing ---
    const graphW = 50, graphH = 50, gapX = 8, gapY = 15;
    const startX = 20, startY = 50;
    const cols = 7;

    easingNames.forEach((name, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const gx = startX + col * (graphW + gapX);
        const gy = startY + row * (graphH + gapY + 15);

        // Nhãn
        ctx.fillStyle = '#555';
        ctx.font = '10px monospace';
        ctx.fillText(name, gx, gy - 3);

        // Nền đồ thị
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(gx, gy, graphW, graphH);

        // Đường cong easing
        ctx.beginPath();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1.5;
        for (let j = 0; j <= graphW; j++) {
            const t = j / graphW;
            const v = Easing[name](t);
            const px = gx + j;
            const py = gy + graphH - v * graphH;
            j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Tween - điểm di chuyển
        tweens[i].update(dt);
        const val = tweens[i].value();
        // Thanh ngang hiển thị tween
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(gx, gy + graphH + 2, val * graphW, 4);
    });

    // --- Spring Animation ---
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Spring (Hooke\'s Law)', 550, 385);

    spring.update(dt);

    // Vẽ đường lò xo (zigzag)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sx = spring.targetX, sy = spring.targetY;
    ctx.moveTo(sx, sy);
    const segments = 12;
    for (let i = 1; i <= segments; i++) {
        const ratio = i / segments;
        const px = sx + (spring.x - sx) * ratio;
        const py = sy + (spring.y - sy) * ratio;
        const offset = (i % 2 === 0 ? 8 : -8) * (1 - ratio);
        const perpX = -(spring.y - sy);
        const perpY = spring.x - sx;
        const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
        ctx.lineTo(px + offset * perpX / len, py + offset * perpY / len);
    }
    ctx.stroke();

    // Điểm neo
    ctx.beginPath();
    ctx.arc(spring.targetX, spring.targetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#95a5a6';
    ctx.fill();

    // Vật thể spring
    ctx.beginPath();
    ctx.arc(spring.x, spring.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // --- Bezier Path Animation ---
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Bezier Path', 480, 210);

    const bp = bezierPath;
    // Vẽ đường Bezier
    ctx.beginPath();
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.moveTo(bp.p0x, bp.p0y);
    ctx.bezierCurveTo(bp.p1x, bp.p1y, bp.p2x, bp.p2y, bp.p3x, bp.p3y);
    ctx.stroke();

    // Điểm điều khiển
    [bp.p0x, bp.p1x, bp.p2x, bp.p3x].forEach((px, idx) => {
        const py = [bp.p0y, bp.p1y, bp.p2y, bp.p3y][idx];
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#95a5a6';
        ctx.fill();
    });

    // Vật thể di chuyển trên đường Bezier
    bezierT = (bezierT + dt * 0.3) % 1;
    const bx = cubicBezier(bezierT, bp.p0x, bp.p1x, bp.p2x, bp.p3x);
    const by = cubicBezier(bezierT, bp.p0y, bp.p1y, bp.p2y, bp.p3y);
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

console.log('Bài 7: Easing & Tween - click để reset animation!');
