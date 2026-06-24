// ============================================
// Bài 11: Collision Detection & Particle Systems
// ============================================
// AABB collision, Circle-Circle collision, collision response,
// particle emitter, particle lifecycle, forces, and trails.

const canvas = document.getElementById('canvas') || document.createElement('canvas');
if (!canvas.parentElement) document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 400;
canvas.style.border = '1px solid #ccc';
canvas.style.background = '#0f172a'; // Nền tối cho hạt sáng nổi bật
canvas.style.display = 'block';
const ctx = canvas.getContext('2d');

// --- 1. Hàm kiểm tra va chạm (Collision Detection) ---

// Bounding Box (AABB)
function checkAABB(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w &&
           rect1.x + rect1.w > rect2.x &&
           rect1.y < rect2.y + rect2.h &&
           rect1.y + rect1.h > rect2.y;
}

// Circle-Circle Collision
function checkCircleCollision(c1, c2) {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const distance = Math.hypot(dx, dy);
    return distance < c1.r + c2.r;
}

// Phản xạ va chạm hình tròn đàn hồi đơn giản (1D projection)
function resolveCircleCollision(c1, c2) {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist === 0) return; // Tránh chia cho 0
    
    // Vector pháp tuyến va chạm
    const nx = dx / dist;
    const ny = dy / dist;
    
    // Hiệu vận tốc tương đối
    const kx = c1.vx - c2.vx;
    const ky = c1.vy - c2.vy;
    
    // Tích vô hướng vận tốc tương đối trên vector pháp tuyến
    const p = 2 * (nx * kx + ny * ky) / 2; // Giả sử hai vòng tròn có khối lượng m = 1 bằng nhau
    
    // Cập nhật lại vận tốc
    c1.vx -= p * nx;
    c1.vy -= p * ny;
    c2.vx += p * nx;
    c2.vy += p * ny;
    
    // Đẩy hai vật ra để không dính nhau (overlap resolution)
    const overlap = (c1.r + c2.r) - dist;
    c1.x -= overlap * 0.5 * nx;
    c1.y -= overlap * 0.5 * ny;
    c2.x += overlap * 0.5 * nx;
    c2.y += overlap * 0.5 * ny;
}

// --- 2. Hệ thống Hạt (Particle System) ---

class Particle {
    constructor(x, y, vx, vy, color, size, maxLife) {
        this.x = x;
        this.y = y;
        this.vx = vx ?? (Math.random() - 0.5) * 4;
        this.vy = vy ?? (Math.random() - 0.5) * 4;
        this.color = color ?? `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.size = size ?? 3 + Math.random() * 4;
        this.initialSize = this.size;
        this.life = 0;
        this.maxLife = maxLife ?? 40 + Math.random() * 40;
    }

    get alive() {
        return this.life < this.maxLife;
    }

    get progress() {
        return this.life / this.maxLife;
    }

    update(gravity = 0.05, wind = 0) {
        this.vx += wind;
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        // Thu nhỏ kích thước theo thời gian sống
        this.size = this.initialSize * (1 - this.progress);
    }

    draw(ctx) {
        const alpha = 1 - this.progress; // Mờ dần
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleEmitter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
    }

    emit(count = 2) {
        for (let i = 0; i < count; i++) {
            // Hướng hạt phun chủ yếu hướng lên trên
            const vx = (Math.random() - 0.5) * 3;
            const vy = -1.5 - Math.random() * 2;
            const hue = Math.random() * 60 + 10; // Đỏ, cam, vàng của lửa
            const color = `hsl(${hue}, 100%, 60%)`;
            this.particles.push(new Particle(this.x, this.y, vx, vy, color, 6, 50));
        }
    }

    update() {
        this.emit();
        this.particles.forEach(p => p.update(0.04, 0.01)); // Trọng lực nhẹ + gió sang phải nhẹ
        this.particles = this.particles.filter(p => p.alive); // Xóa hạt đã chết
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

// Khởi tạo các vật thể tương tác
const emitter = new ParticleEmitter(150, 320);

// Hai vòng tròn va chạm mẫu
const circles = [
    { id: 1, x: 400, y: 150, r: 40, vx: 1.5, vy: 1, color: '#38bdf8' },
    { id: 2, x: 500, y: 220, r: 35, vx: -1.5, vy: -1, color: '#ec4899' }
];

// Loop
function loop() {
    // ═══ Tạo hiệu ứng vệt (Trail) ═══
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Xóa màn hình với màu đè mờ
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tiêu đề
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Bài 11: Collision & Particle Systems', 20, 30);
    
    // Cập nhật & Vẽ Emitter hạt lửa bên trái
    emitter.update();
    emitter.draw(ctx);

    // Cập nhật & Vẽ va chạm vòng tròn bên phải
    circles.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;

        // Bounce với viền canvas
        if (c.x < 300 + c.r) { c.x = 300 + c.r; c.vx *= -1; }
        if (c.x > canvas.width - c.r) { c.x = canvas.width - c.r; c.vx *= -1; }
        if (c.y < c.r) { c.y = c.r; c.vy *= -1; }
        if (c.y > canvas.height - c.r) { c.y = canvas.height - c.r; c.vy *= -1; }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Check va chạm giữa hai vòng tròn
    if (checkCircleCollision(circles[0], circles[1])) {
        resolveCircleCollision(circles[0], circles[1]);
        
        // Phát ra một cụm tia sáng nhỏ khi va chạm
        for (let i = 0; i < 15; i++) {
            const collisionX = (circles[0].x + circles[1].x) / 2;
            const collisionY = (circles[0].y + circles[1].y) / 2;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            emitter.particles.push(new Particle(
                collisionX, collisionY,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                '#ffffff', 3, 30
            ));
        }
    }

    // Vẽ đường chia đôi
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, canvas.height);
    ctx.stroke();

    requestAnimationFrame(loop);
}

loop();
