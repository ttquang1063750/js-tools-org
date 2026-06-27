// ============================================
// Bài 6: Animation trên Canvas
// ============================================
// requestAnimationFrame, delta time, FPS counter,
// bóng nảy, sprite frame cycling (mô phỏng bằng hình chữ nhật)

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// --- 1. Delta Time & FPS Counter ---
let lastTime = 0;
let fps = 0;
let fpsFrames = 0;
let fpsLastUpdate = 0;

// --- 2. Bóng nảy (Bouncing Balls) ---
class Ball {
  constructor(x, y, r, color, vx, vy) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.vx = vx; // Vận tốc ngang (pixel/giây)
    this.vy = vy; // Vận tốc dọc (pixel/giây)
  }

  update(dt) {
    // Di chuyển theo vận tốc * delta time
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Nảy khi chạm tường
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -1;
    }
    if (this.x + this.r > canvas.width) {
      this.x = canvas.width - this.r;
      this.vx *= -1;
    }
    if (this.y - this.r < 60) {
      this.y = 60 + this.r;
      this.vy *= -1;
    }
    if (this.y + this.r > 320) {
      this.y = 320 - this.r;
      this.vy *= -1;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Bóng đổ nhẹ
    ctx.beginPath();
    ctx.arc(this.x + 2, this.y + 2, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
  }
}

// Tạo nhiều bóng với thuộc tính ngẫu nhiên
const balls = [];
const ballColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c'];
for (let i = 0; i < 7; i++) {
  balls.push(
    new Ball(
      100 + Math.random() * 600, // x
      100 + Math.random() * 180, // y
      10 + Math.random() * 20, // bán kính
      ballColors[i],
      (100 + Math.random() * 200) * (Math.random() > 0.5 ? 1 : -1), // vx
      (80 + Math.random() * 150) * (Math.random() > 0.5 ? 1 : -1) // vy
    )
  );
}

// --- 3. Sprite Frame Cycling (mô phỏng) ---
// Không dùng ảnh thật - mô phỏng bằng hình chữ nhật màu khác nhau
class SpriteAnim {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDuration = 0.15; // Giây giữa mỗi frame
    this.frameCount = 6;
    this.frameW = 40;
    this.frameH = 50;
    this.direction = 1; // 1 = phải, -1 = trái
    this.speed = 80; // pixel/giây
  }

  update(dt) {
    // Cập nhật frame animation
    this.frameTimer += dt;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
    }

    // Di chuyển
    this.x += this.speed * this.direction * dt;
    if (this.x > canvas.width - this.frameW) {
      this.direction = -1;
    } else if (this.x < 0) {
      this.direction = 1;
    }
  }

  draw(ctx) {
    ctx.save();

    // Lật nếu đi trái
    if (this.direction === -1) {
      ctx.translate(this.x + this.frameW, this.y);
      ctx.scale(-1, 1);
      ctx.translate(0, 0);
    } else {
      ctx.translate(this.x, this.y);
    }

    // Vẽ "sprite" - mỗi frame là hình dáng khác nhau
    const f = this.frameIndex;

    // Thân
    ctx.fillStyle = '#3498db';
    ctx.fillRect(10, 10, 20, 25);

    // Đầu
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(20, 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Chân (thay đổi theo frame để tạo hiệu ứng đi bộ)
    ctx.fillStyle = '#2c3e50';
    const legOffset = Math.sin((f * Math.PI) / 3) * 8;
    ctx.fillRect(12, 35, 5, 12 + legOffset); // Chân trái
    ctx.fillRect(23, 35, 5, 12 - legOffset); // Chân phải

    // Tay
    ctx.fillRect(5, 15, 5, 3 + Math.abs(legOffset)); // Tay trái
    ctx.fillRect(30, 15, 5, 3 + Math.abs(legOffset)); // Tay phải

    ctx.restore();
  }
}

const sprites = [new SpriteAnim(50, 360), new SpriteAnim(300, 380), new SpriteAnim(550, 350)];
// Tốc độ khác nhau
sprites[1].speed = 120;
sprites[2].speed = 60;
sprites[2].frameDuration = 0.25;

// --- Vòng lặp Animation chính ---
function gameLoop(timestamp) {
  // Tính delta time (giây)
  const dt = lastTime ? (timestamp - lastTime) / 1000 : 0;
  lastTime = timestamp;

  // Cập nhật FPS mỗi 0.5 giây
  fpsFrames++;
  if (timestamp - fpsLastUpdate >= 500) {
    fps = Math.round(fpsFrames / ((timestamp - fpsLastUpdate) / 1000));
    fpsFrames = 0;
    fpsLastUpdate = timestamp;
  }

  // --- Xoá màn hình ---
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Tiêu đề ---
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Bài 6: Animation - requestAnimationFrame + Delta Time', 20, 30);

  // --- FPS Counter ---
  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`FPS: ${fps}  |  dt: ${(dt * 1000).toFixed(1)}ms`, 600, 30);

  // --- Vùng bóng nảy ---
  ctx.strokeStyle = '#bdc3c7';
  ctx.strokeRect(0, 60, canvas.width, 260);
  ctx.fillStyle = '#999';
  ctx.font = '12px Arial';
  ctx.fillText('Vùng bóng nảy (Bouncing Balls)', 10, 55);

  // Cập nhật và vẽ bóng
  for (const ball of balls) {
    ball.update(dt);
    ball.draw(ctx);
  }

  // --- Vùng sprite ---
  ctx.fillStyle = '#999';
  ctx.font = '12px Arial';
  ctx.fillText('Sprite animation (mô phỏng đi bộ)', 10, 345);

  for (const sprite of sprites) {
    sprite.update(dt);
    sprite.draw(ctx);
  }

  // --- Frame info ---
  ctx.fillStyle = '#7f8c8d';
  ctx.font = '12px monospace';
  ctx.fillText(`Sprite frame: ${sprites[0].frameIndex}/${sprites[0].frameCount}`, 10, 480);

  // Tiếp tục vòng lặp
  requestAnimationFrame(gameLoop);
}

// Bắt đầu vòng lặp
requestAnimationFrame(gameLoop);

console.log('Bài 6: Animation - đang chạy!');
