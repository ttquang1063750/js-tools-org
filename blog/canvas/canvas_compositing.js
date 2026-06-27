/**
 * Canvas Compositing & Clipping Demo
 * File: canvas_compositing.js
 *
 * Mã nguồn minh họa các chế độ trộn ảnh (globalCompositeOperation) và cắt mặt nạ (clipping path) trong Canvas.
 */

(function () {
  const canvas = document.getElementById('compositingCanvas') || document.createElement('canvas');
  if (!canvas.parentNode) {
    canvas.width = 600;
    canvas.height = 400;
  }
  const ctx = canvas.getContext('2d');

  function drawCompositingDemo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vẽ hình tròn gốc (Destination Image) màu Đỏ
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.fill();

    // 2. Thiết lập chế độ trộn ảnh (Compositing Mode)
    // Các chế độ phổ biến: 'source-over', 'source-in', 'destination-out', 'lighter', 'xor'
    ctx.globalCompositeOperation = 'source-atop'; // Chỉ vẽ đè phần chồng lấn

    // 3. Vẽ hình vuông mới (Source Image) màu Xanh dương
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(150, 150, 200, 200);

    // Trả lại chế độ vẽ đè mặc định
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawClippingDemo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // Lưu trạng thái canvas ban đầu

    // 1. Thiết lập vùng mặt nạ cắt hình tam giác (Clipping Path)
    ctx.beginPath();
    ctx.moveTo(300, 50);
    ctx.lineTo(100, 350);
    ctx.lineTo(500, 350);
    ctx.closePath();
    ctx.clip(); // Biến tam giác thành mặt nạ cắt

    // 2. Vẽ một hình tròn chuyển động bên trong tam giác đó
    // (Chỉ phần nằm trong tam giác mới được hiển thị!)
    ctx.fillStyle = '#10b981'; // Xanh lá
    ctx.beginPath();
    ctx.arc(300, 200, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Khôi phục lại trạng thái không cắt để vẽ các hình khác tiếp theo
  }

  // Chạy thử nghiệm các demo trên trình duyệt
  if (typeof window !== 'undefined') {
    drawCompositingDemo();
    // Hoặc: drawClippingDemo();
  }
})();
