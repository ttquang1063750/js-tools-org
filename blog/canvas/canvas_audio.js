/**
 * Canvas Audio Visualizer Demo
 * File: canvas_audio.js
 *
 * Mã nguồn minh họa thiết kế hiệu ứng sóng âm nhạc (Audio Wave Visualizer) bằng HTML5 Canvas.
 * Chạy bằng trình duyệt: Link file này vào file HTML và mở trên Browser.
 */

(function () {
  const canvas = document.getElementById('visualizerCanvas') || document.createElement('canvas');
  if (!canvas.parentNode) {
    // Tạo canvas tạm thời nếu chạy offline/Node.js để tránh crash
    canvas.width = 800;
    canvas.height = 400;
    console.log('[Audio Visualizer] Đã khởi tạo canvas giả lập.');
  }

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let time = 0;

  // Cấu hình thanh sóng âm
  const barWidth = 6;
  const barGap = 4;
  const numBars = Math.floor(canvas.width / (barWidth + barGap));
  const heights = new Array(numBars).fill(10);

  function draw() {
    // Tạo nền gradient tối sang trọng
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#070b19');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.05;

    // Vẽ từng thanh sóng âm nhạc mô phỏng
    for (let i = 0; i < numBars; i++) {
      // Sử dụng các hàm lượng giác sin, cos lồng nhau để tạo sóng ngẫu nhiên mượt mà như nhạc thực tế
      const noise = Math.sin(i * 0.15 + time) * Math.cos(i * 0.05 - time * 0.5);
      const amplitude = Math.abs(noise) * (canvas.height * 0.7);

      // Nội suy mượt (lerp) chiều cao để tránh sóng bị giật hình
      heights[i] = heights[i] + (amplitude - heights[i]) * 0.2;

      const x = i * (barWidth + barGap);
      const y = canvas.height / 2 - heights[i] / 2; // Vẽ đối xứng từ giữa màn hình

      // Tạo màu sắc chuyển màu (gradient) neon cho sóng âm
      const barGradient = ctx.createLinearGradient(x, y, x, y + heights[i]);
      barGradient.addColorStop(0, '#38bdf8'); // Sky Blue
      barGradient.addColorStop(0.5, '#a855f7'); // Purple
      barGradient.addColorStop(1, '#ec4899'); // Pink

      ctx.fillStyle = barGradient;

      // Vẽ góc bo tròn nhẹ cho thanh sóng (Rounded Rect)
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barWidth, heights[i], 3);
      } else {
        ctx.rect(x, y, barWidth, heights[i]);
      }
      ctx.fill();
    }

    // Vẽ hiệu ứng hạt sáng lấp lánh (Glow Effect) ở đỉnh sóng
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#a855f7';

    // Yêu cầu vẽ frame tiếp theo của vòng lặp animation
    animationFrameId = requestAnimationFrame(draw);
  }

  // Bắt đầu chạy hiệu ứng nếu đang chạy trên trình duyệt
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    draw();
  }
})();
