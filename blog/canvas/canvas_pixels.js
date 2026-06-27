// ============================================
// Bài 4: Thao tác Pixel trên Canvas
// ============================================
// Tạo gradient đầy màu sắc, áp dụng bộ lọc:
// grayscale, sepia, invert, blur (3x3 box)
// Sử dụng getImageData / putImageData

const canvas = document.getElementById('canvas') || document.createElement('canvas');
canvas.width = 800;
canvas.height = 550;
if (!canvas.parentElement) document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const W = 180,
  H = 130; // Kích thước mỗi ô ảnh

// --- 1. Tạo ảnh gốc đầy màu sắc ---
// Vẽ gradient nhiều màu + hình tròn
function drawOriginal(x, y) {
  ctx.save();
  // Gradient ngang: đỏ -> xanh dương
  const grad1 = ctx.createLinearGradient(x, y, x + W, y);
  grad1.addColorStop(0, '#e74c3c');
  grad1.addColorStop(0.33, '#f1c40f');
  grad1.addColorStop(0.66, '#2ecc71');
  grad1.addColorStop(1, '#3498db');
  ctx.fillStyle = grad1;
  ctx.fillRect(x, y, W, H);

  // Gradient dọc mờ
  const grad2 = ctx.createLinearGradient(x, y, x, y + H);
  grad2.addColorStop(0, 'rgba(0,0,0,0)');
  grad2.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = grad2;
  ctx.fillRect(x, y, W, H);

  // Hình tròn trắng
  ctx.beginPath();
  ctx.arc(x + W / 2, y + H / 2, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();

  // Hình tròn nhỏ màu
  ctx.beginPath();
  ctx.arc(x + 40, y + 35, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#9b59b6';
  ctx.fill();
  ctx.restore();
}

// --- Hàm tiện ích: nhân bản pixel data ---
function cloneImageData(imageData) {
  return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

// --- 2. Bộ lọc Grayscale (chuyển xám theo độ sáng) ---
// Công thức luminance: 0.299*R + 0.587*G + 0.114*B
function filterGrayscale(imageData) {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = gray;
  }
  return imageData;
}

// --- 3. Bộ lọc Sepia (tông nâu cổ điển) ---
function filterSepia(imageData) {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // R
    d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // G
    d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // B
  }
  return imageData;
}

// --- 4. Bộ lọc Invert (đảo ngược màu) ---
function filterInvert(imageData) {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i]; // R
    d[i + 1] = 255 - d[i + 1]; // G
    d[i + 2] = 255 - d[i + 2]; // B
    // Alpha giữ nguyên
  }
  return imageData;
}

// --- 5. Bộ lọc Blur (làm mờ - box blur 3x3) ---
// Lấy trung bình 9 pixel lân cận
function filterBlur(imageData) {
  const src = new Uint8ClampedArray(imageData.data); // Bản sao gốc
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        // Chỉ xử lý R, G, B
        let sum = 0;
        // Duyệt 9 pixel trong vùng 3x3
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += src[((y + dy) * w + (x + dx)) * 4 + c];
          }
        }
        d[(y * w + x) * 4 + c] = sum / 9; // Trung bình
      }
    }
  }
  return imageData;
}

// --- Vẽ và áp dụng bộ lọc ---
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 20px Arial';
ctx.fillText('Thao tác Pixel - Bộ lọc ảnh', 20, 30);

const filters = [
  { name: 'Ảnh gốc', fn: null },
  { name: 'Grayscale', fn: filterGrayscale },
  { name: 'Sepia', fn: filterSepia },
  { name: 'Invert', fn: filterInvert },
  { name: 'Blur (3x3)', fn: filterBlur },
  {
    name: 'Blur x3',
    fn: (d) => {
      filterBlur(d);
      filterBlur(d);
      return filterBlur(d);
    },
  },
];

const cols = 3;
filters.forEach((filter, i) => {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = 20 + col * (W + 20);
  const y = 60 + row * (H + 40);

  // Vẽ ảnh gốc lên canvas tạm
  drawOriginal(x, y);

  if (filter.fn) {
    // Lấy dữ liệu pixel
    const imageData = ctx.getImageData(x, y, W, H);
    // Áp dụng bộ lọc
    filter.fn(imageData);
    // Đặt dữ liệu pixel đã xử lý trở lại
    ctx.putImageData(imageData, x, y);
  }

  // Nhãn
  ctx.fillStyle = '#2c3e50';
  ctx.font = '14px Arial';
  ctx.fillText(filter.name, x, y + H + 18);
});

// --- Thông tin thêm: hiển thị giá trị pixel ---
ctx.fillStyle = '#2c3e50';
ctx.font = 'bold 16px Arial';
ctx.fillText('Click vào ảnh để xem giá trị pixel (mở Console)', 20, 480);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
  const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  console.log(`Pixel tại (${x}, ${y}): R=${pixel[0]} G=${pixel[1]} B=${pixel[2]} A=${pixel[3]}`);
});

console.log('Bài 4: Thao tác Pixel - đã áp dụng các bộ lọc!');
