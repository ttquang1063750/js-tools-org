// ============================================
// Bài 13: Data Visualization - Charts from scratch
// ============================================
// Drawing Bar, Line, Pie, and Radar charts using Canvas API.

const canvas = document.getElementById('canvas') || document.createElement('canvas');
if (!canvas.parentElement) document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 400;
canvas.style.border = '1px solid #ccc';
canvas.style.background = '#fafafa';
canvas.style.display = 'block';
const ctx = canvas.getContext('2d');

// --- Dữ liệu mẫu (Data sets) ---
const chartData = [
  { label: 'Tháng 1', value: 45, color: '#ef4444' },
  { label: 'Tháng 2', value: 75, color: '#3b82f6' },
  { label: 'Tháng 3', value: 55, color: '#10b981' },
  { label: 'Tháng 4', value: 90, color: '#f59e0b' },
  { label: 'Tháng 5', value: 65, color: '#8b5cf6' },
];

const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
const maxValue = Math.max(...chartData.map((item) => item.value));

// --- 1. Biểu đồ Cột (Bar Chart) ---
function drawBarChart(x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // Vẽ Trục X và Y
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(40, h - 30);
  ctx.lineTo(w, h - 30);
  ctx.stroke();

  const chartW = w - 60;
  const chartH = h - 50;
  const barSpacing = chartW / chartData.length;
  const barWidth = barSpacing * 0.6;

  chartData.forEach((d, i) => {
    // Tỷ lệ hóa độ cao cột
    const barHeight = (d.value / maxValue) * chartH;
    const barX = 50 + i * barSpacing;
    const barY = h - 30 - barHeight;

    // Vẽ Cột
    ctx.fillStyle = d.color;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Vẽ giá trị số đầu cột
    ctx.fillStyle = '#1e293b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.value, barX + barWidth / 2, barY - 5);

    // Vẽ nhãn (label) nhãn bên dưới trục X
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText(d.label, barX + barWidth / 2, h - 15);
  });

  ctx.restore();
}

// --- 2. Biểu đồ Đường (Line Chart) ---
function drawLineChart(x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // Vẽ Trục
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(40, h - 30);
  ctx.lineTo(w, h - 30);
  ctx.stroke();

  const chartW = w - 60;
  const chartH = h - 50;
  const spacing = chartW / (chartData.length - 1);

  // Bắt đầu vẽ đường biểu diễn
  ctx.beginPath();
  chartData.forEach((d, i) => {
    const pointX = 50 + i * spacing;
    const pointY = h - 30 - (d.value / maxValue) * chartH;
    if (i === 0) ctx.moveTo(pointX, pointY);
    else ctx.lineTo(pointX, pointY);
  });
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Vẽ điểm nút tròn và ghi số
  chartData.forEach((d, i) => {
    const pointX = 50 + i * spacing;
    const pointY = h - 30 - (d.value / maxValue) * chartH;

    ctx.beginPath();
    ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.value, pointX, pointY - 10);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText(d.label, pointX, h - 15);
  });

  ctx.restore();
}

// --- 3. Biểu đồ Tròn (Pie Chart) ---
function drawPieChart(cx, cy, radius) {
  let startAngle = 0;

  chartData.forEach((d, i) => {
    // Tỷ lệ góc radian tương ứng
    const sliceAngle = (d.value / totalValue) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();

    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ghi chú tỉ lệ % ở giữa lát cắt
    const middleAngle = startAngle + sliceAngle / 2;
    const labelX = cx + Math.cos(middleAngle) * (radius * 0.65);
    const labelY = cy + Math.sin(middleAngle) * (radius * 0.65);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const percent = Math.round((d.value / totalValue) * 100);
    ctx.fillText(`${percent}%`, labelX, labelY);

    // Cập nhật góc tiếp theo
    startAngle += sliceAngle;
  });

  // Vẽ chú giải (Legend) bên phải
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  chartData.forEach((d, i) => {
    const lx = cx + radius + 30;
    const ly = cy - radius + i * 24 + 10;

    ctx.fillStyle = d.color;
    ctx.fillRect(lx, ly, 15, 15);

    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${d.label}: ${d.value}`, lx + 24, ly + 12);
  });
}

// --- 4. Vẽ Toàn bộ Canvas ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Bài 13: Data Visualization Charts từ Scratch', 20, 30);

  // Biểu đồ Cột (Top-Left)
  ctx.fillStyle = '#475569';
  ctx.font = '12px sans-serif';
  ctx.fillText('1. Biểu đồ Cột (Bar)', 20, 60);
  drawBarChart(10, 70, 270, 150);

  // Biểu đồ Đường (Top-Right)
  ctx.fillStyle = '#475569';
  ctx.fillText('2. Biểu đồ Đường (Line)', 310, 60);
  drawLineChart(300, 70, 270, 150);

  // Biểu đồ Tròn (Bottom-Center)
  ctx.fillStyle = '#475569';
  ctx.fillText('3. Biểu đồ Tròn (Pie & Legend)', 160, 240);
  drawPieChart(180, 320, 60);
}

draw();
