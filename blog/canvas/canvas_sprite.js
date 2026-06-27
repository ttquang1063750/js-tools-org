/**
 * Canvas Sprite Animation Demo
 * File: canvas_sprite.js
 *
 * Mã nguồn minh họa kỹ thuật cắt và dựng hoạt ảnh hoạt họa (Sprite Sheet Animation) trong HTML5 Canvas.
 */

(function () {
  const canvas = document.getElementById('spriteCanvas') || document.createElement('canvas');
  if (!canvas.parentNode) {
    canvas.width = 600;
    canvas.height = 300;
    console.log('[Sprite Animation] Đã khởi tạo canvas giả lập.');
  }
  const ctx = canvas.getContext('2d');

  // Khởi tạo đối tượng ảnh Sprite Sheet
  const spriteSheet = new Image();
  // Sử dụng sprite sheet mẫu con cá bơi lội từ dự án
  spriteSheet.src = '../../assets/coloraquarium.png';

  // Thông số kích thước của 1 Frame đơn lẻ trong Sprite Sheet
  const frameWidth = 64; // Chiều rộng 1 frame
  const frameHeight = 64; // Chiều cao 1 frame
  const totalFrames = 8; // Tổng số frame hoạt ảnh bơi
  let currentFrame = 0; // Số hiệu frame hiện tại

  let lastTime = 0;
  const frameInterval = 100; // Thời gian chuyển frame (100ms tương đương 10 FPS)
  let accumulator = 0;

  function update(deltaTime) {
    accumulator += deltaTime;
    if (accumulator >= frameInterval) {
      // Chuyển sang frame tiếp theo và quay lại từ 0 khi chạm giới hạn
      currentFrame = (currentFrame + 1) % totalFrames;
      accumulator -= frameInterval;
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Giả lập vẽ nền nước biển sâu
    ctx.fillStyle = '#071224';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Xác định tọa độ cắt X trên ảnh Sprite Sheet (Giả sử ảnh xếp hàng ngang)
    const sourceX = currentFrame * frameWidth;
    const sourceY = 0; // Hàng đầu tiên trên ảnh

    // Tọa độ vẽ đích trên Canvas (Vẽ ở tâm màn hình)
    const destX = canvas.width / 2 - frameWidth / 2;
    const destY = canvas.height / 2 - frameHeight / 2;

    // Vẽ con cá bơi từ Sprite Sheet cắt ra (Sử dụng 9 đối số của drawImage)
    ctx.drawImage(
      spriteSheet,
      sourceX,
      sourceY, // Vị trí bắt đầu cắt trên Sprite Sheet (Source)
      frameWidth,
      frameHeight, // Chiều rộng & cao vùng cắt
      destX,
      destY, // Vị trí đặt ảnh trên màn hình Canvas (Destination)
      frameWidth * 1.5,
      frameHeight * 1.5 // Phóng to ảnh lên 1.5 lần khi hiển thị
    );
  }

  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
  }

  // Đợi ảnh tải xong mới bắt đầu vòng lặp game loop
  spriteSheet.onload = function () {
    requestAnimationFrame(gameLoop);
  };

  // Trường hợp chạy offline để test cấu trúc
  if (typeof window !== 'undefined') {
    requestAnimationFrame(gameLoop);
  }
})();
