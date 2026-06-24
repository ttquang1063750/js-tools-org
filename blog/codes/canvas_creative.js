// ============================================
// Bài 14: Creative Coding & Performance Optimization
// ============================================
// Math/trig noise flowfields, Offscreen Canvas cache, and exporting.

const canvas = document.getElementById('canvas') || document.createElement('canvas');
if (!canvas.parentElement) document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 400;
canvas.style.border = '1px solid #ccc';
canvas.style.background = '#090d16'; // Nền tối cho nghệ thuật số phát sáng
canvas.style.display = 'block';
const ctx = canvas.getContext('2d');

// --- 1. Tạo Offscreen Canvas tối ưu hóa ---
// Chúng ta sẽ vẽ trước (pre-render) hình ngôi sao sáng lên Offscreen Canvas
// để tránh phải tính toán cung tròn/phức tạp trong mỗi frame vẽ hạt.
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 20;
offscreenCanvas.height = 20;
const octx = offscreenCanvas.getContext('2d');

// Vẽ một ngôi sao phát sáng lên buffer ảo
const grad = octx.createRadialGradient(10, 10, 1, 10, 10, 8);
grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)'); // Màu xanh cyan sáng
grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
octx.fillStyle = grad;
octx.beginPath();
octx.arc(10, 10, 10, 0, Math.PI * 2);
octx.fill();

// --- 2. Mô phỏng Flowfield (Trường dòng chảy) ---
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 100 + Math.random() * 150;
        this.speed = 1.5 + Math.random() * 2;
    }

    update() {
        // Thuật toán "Vector Field" dựa trên hàm sin/cos của toạ độ
        // Tạo ra các đường uốn lượn mềm mại như sóng nước/gió thổi
        const scale = 0.005;
        const angle = Math.sin(this.x * scale) * Math.PI * 2 + Math.cos(this.y * scale) * Math.PI * 2;
        
        // Cập nhật vận tốc hướng theo góc dòng chảy
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        // Reset nếu đi ra ngoài biên hoặc chết
        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height || 
            this.life > this.maxLife) {
            this.reset();
        }
    }

    draw(ctx) {
        // TỐI ƯU HIỆU NĂNG: Thay vì dùng arc() vẽ vector tốn kém,
        // ta copy hình đã vẽ sẵn từ offscreen canvas bằng drawImage (bitmap blitting)
        ctx.drawImage(offscreenCanvas, this.x - 10, this.y - 10);
    }
}

// Khởi tạo cụm 300 hạt bay theo trường lực
const particles = Array.from({ length: 300 }, () => new Particle());

// --- 3. Xuất hình ảnh PNG (Canvas Export) ---
function exportPNG() {
    // Tạo thẻ download ảo và click tự động
    const link = document.createElement('a');
    link.download = 'flowfield-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Nút bấm tải ảnh về máy
const btnRect = { x: 10, y: 355, w: 100, h: 30 };
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx >= btnRect.x && mx <= btnRect.x + btnRect.w &&
        my >= btnRect.y && my <= btnRect.y + btnRect.h) {
        exportPNG();
    }
});

// Game Loop
let frameCount = 0;
function loop() {
    // Không vẽ nền đen đè hoàn toàn để lại vệt sáng đuôi (trail effect)
    ctx.fillStyle = 'rgba(9, 13, 22, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cập nhật & Vẽ các hạt
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    // Vẽ nút Export trên màn hình
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(btnRect.x, btnRect.y, btnRect.w, btnRect.h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(btnRect.x, btnRect.y, btnRect.w, btnRect.h);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Xuất PNG', btnRect.x + 50, btnRect.y + 18);
    ctx.textAlign = 'left';

    // Vẽ Tiêu đề hướng dẫn
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Bài 14: Generative Flowfield & Offscreen Optimization', 20, 30);

    // Đo FPS
    frameCount++;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('Offscreen Buffer: Hoạt động', 20, 50);

    requestAnimationFrame(loop);
}

loop();
