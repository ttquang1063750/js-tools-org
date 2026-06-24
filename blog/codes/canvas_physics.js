// ============================================
// Bài 10: Canvas Physics Simulation
// ============================================
// Vector2D class, Euler integration, gravity,
// friction, bounce restitution, and Hooke's Law spring.

// --- 1. Lớp Toán học Vector 2D ---
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    mag() {
        return Math.hypot(this.x, this.y);
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) this.div(m);
        return this;
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }
}

// Setup Canvas
const canvas = document.getElementById('canvas') || document.createElement('canvas');
if (!canvas.parentElement) document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 400;
canvas.style.border = '1px solid #ccc';
canvas.style.background = '#fafafa';
canvas.style.display = 'block';
const ctx = canvas.getContext('2d');

// --- 2. Mô phỏng 1: Bouncing Ball (Trọng lực & Lực cản) ---
class Ball {
    constructor(x, y, radius = 15) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(3, 0);
        this.acc = new Vector2D(0, 0.3); // Trọng lực (gravity)
        this.radius = radius;
        this.restitution = -0.75; // Độ đàn hồi (bounce)
        this.friction = 0.99; // Lực cản không khí
    }

    update() {
        // Euler integration: cộng gia tốc vào vận tốc, vận tốc vào vị trí
        this.vel.add(this.acc);
        this.vel.mult(this.friction); // Áp dụng lực cản
        this.pos.add(this.vel);

        // Va chạm biên dưới
        if (this.pos.y > canvas.height - this.radius) {
            this.pos.y = canvas.height - this.radius;
            this.vel.y *= this.restitution;
        }
        // Va chạm biên trái/phải
        if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.vel.x *= this.restitution;
        } else if (this.pos.x > canvas.width - this.radius) {
            this.pos.x = canvas.width - this.radius;
            this.vel.x *= this.restitution;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// --- 3. Mô phỏng 2: Spring Particle (Mô hình lò xo) ---
class SpringBall {
    constructor(targetX, targetY) {
        this.anchor = new Vector2D(targetX, targetY);
        this.pos = new Vector2D(targetX, targetY + 120);
        this.vel = new Vector2D(0, 0);
        this.k = 0.05; // Stiffness (độ cứng lò xo)
        this.damping = 0.92; // Damping (giảm chấn)
        this.radius = 12;
    }

    update(mousePos) {
        if (mousePos) {
            // Nếu người dùng click/di chuột, ta cập nhật anchor theo chuột
            this.anchor.x = mousePos.x;
            this.anchor.y = mousePos.y;
        }

        // Định luật Hooke: F = -k * x
        // x là độ lệch (displacement vector) = vị trí hiện tại - vị trí cân bằng (anchor)
        const displacement = this.pos.copy().sub(this.anchor);
        const springForce = displacement.mult(-this.k);

        // Euler: lực tạo gia tốc (giả sử khối lượng m = 1)
        this.vel.add(springForce);
        this.vel.mult(this.damping); // Giảm chấn ngăn dao động vô hạn
        this.pos.add(this.vel);
    }

    draw(ctx) {
        // Vẽ dây lò xo
        ctx.beginPath();
        ctx.moveTo(this.anchor.x, this.anchor.y);
        ctx.lineTo(this.pos.x, this.pos.y);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ mốc neo
        ctx.beginPath();
        ctx.arc(this.anchor.x, this.anchor.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();

        // Vẽ bóng lò xo
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.stroke();
    }
}

// Khởi tạo các vật thể
const ball = new Ball(100, 50);
const spring = new SpringBall(450, 100);

let mouse = null;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
canvas.addEventListener('mouseleave', () => { mouse = null; });

// Game Loop
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hướng dẫn
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Bài 10: Vật Lý Simulation trên Canvas', 20, 30);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText('Trái: Trọng lực & nảy (Bouncing) | Phải: Lực lò xo kéo theo chuột (Spring)', 20, 50);

    // Cập nhật & Vẽ Bouncing Ball
    ball.update();
    ball.draw(ctx);

    // Cập nhật & Vẽ Spring Ball
    spring.update(mouse);
    spring.draw(ctx);

    requestAnimationFrame(loop);
}

loop();
