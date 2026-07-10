// gradient_descent.js — Gradient Descent từ số 0: 1 tham số + địa hình 2D
// Bài 2: Gradient Descent & đạo hàm
// js-tools.org/blog/ai/ai-gradient-descent
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node gradient_descent.js
// Kỳ vọng in ra: "SELF-TEST PASS (13 checks)" — các con số khớp đúng bảng
// tính tay và các ngưỡng learning rate trong bài viết.

// ---------------------------------------------------------------------------
// GD 1 tham số trên L(w) = (w - 3)²: gradient dL/dw = 2(w - 3).
// Với loss này, mỗi bước có công thức đóng w_{t+1} - 3 = (1 - 2η)(w_t - 3),
// nên hành vi suy chính xác từ hệ số k = 1 - 2η:
//   |k| < 1 → hội tụ (0 < η < 1) ; k < 0 → zigzag (η > 0.5) ; |k| > 1 → văng.
// ---------------------------------------------------------------------------
function gd1d(w0, lr, steps) {
  let w = w0;
  const hist = [w];
  for (let i = 0; i < steps; i++) {
    const grad = 2 * (w - 3);
    w = w - lr * grad; // quy tắc cập nhật: w ← w − η · dL/dw
    hist.push(w);
  }
  return hist;
}

// ---------------------------------------------------------------------------
// Địa hình 2D "hai đáy": f(x, y) = (x² - 1)² + y²
//   ∂f/∂x = 4x(x² - 1) ; ∂f/∂y = 2y
// 2 đáy (cực tiểu toàn cục) tại (±1, 0); điểm yên ngựa (saddle) tại (0, 0).
// noise (nếu truyền) mô phỏng nhiễu gradient của mini-batch/SGD.
// ---------------------------------------------------------------------------
function grad2d(x, y) {
  return { gx: 4 * x * (x * x - 1), gy: 2 * y };
}
function gd2d(x0, y0, lr, steps, noise = null) {
  let x = x0,
    y = y0;
  const path = [{ x, y }];
  for (let i = 0; i < steps; i++) {
    const { gx, gy } = grad2d(x, y);
    let nx = 0,
      ny = 0;
    if (noise) {
      nx = (noise() - 0.5) * 0.6;
      ny = (noise() - 0.5) * 0.6;
    }
    x -= lr * (gx + nx);
    y -= lr * (gy + ny);
    path.push({ x, y });
  }
  return path;
}

// PRNG seeded — nhiễu tái lập được y hệt giữa các lần chạy (seed cố định).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Self-test — đối chiếu với bảng tính tay và các ngưỡng trong bài viết
// ---------------------------------------------------------------------------
let errors = 0;
let checks = 0;
function check(name, got, exp, tol = 1e-9) {
  checks++;
  if (Math.abs(got - exp) > tol) {
    console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
    errors++;
  }
}

// Bảng tính tay trong bài: η = 0.25, w₀ = 0
const hand = gd1d(0, 0.25, 3);
check('buoc 1: w', hand[1], 1.5);
check('buoc 2: w', hand[2], 2.25);
check('buoc 3: w', hand[3], 2.625);
check('buoc 3: loss', (hand[3] - 3) ** 2, 0.140625);

// η = 0.75: zigzag — luân phiên 2 phía đáy nhưng vẫn hội tụ
const zig = gd1d(0, 0.75, 20);
checks++;
if ((zig[1] - 3) * (zig[2] - 3) >= 0) {
  console.log('LOI: η=0.75 phai luan phien 2 phia day');
  errors++;
}
check('η=0.75 van hoi tu', zig[20], 3, 1e-4);

// η = 1.05: văng — khoảng cách tới đáy TĂNG mỗi bước
const div = gd1d(0, 1.05, 8);
checks++;
if (!(Math.abs(div[8] - 3) > Math.abs(div[0] - 3) * 2)) {
  console.log('LOI: η=1.05 phai phan ky');
  errors++;
}

// Snippet PyTorch trong bài: 20 bước η=0.25 → w ≈ 3.0
check('20 buoc η=0.25 → 3.0', gd1d(0, 0.25, 20)[20], 3, 1e-4);

// 2D: xuất phát lệch trái/phải rơi vào đúng đáy tương ứng
const L = gd2d(-0.3, 0.8, 0.05, 300).at(-1);
check('2D trai → day (-1,0)', L.x, -1, 1e-3);
const R = gd2d(0.3, 0.8, 0.05, 300).at(-1);
check('2D phai → day (+1,0)', R.x, 1, 1e-3);

// 2D: xuất phát ĐÚNG sống núi x=0 → kẹt saddle (0,0) vĩnh viễn
const S = gd2d(0, 0.8, 0.05, 300).at(-1);
check('saddle: ket x=0', S.x, 0);
check('saddle: y ve 0', S.y, 0, 1e-3);

// CÙNG điểm xuất phát + nhiễu seed 42 → thoát saddle về 1 trong 2 đáy
const N = gd2d(0, 0.8, 0.05, 300, mulberry32(42)).at(-1);
checks++;
if (!(Math.abs(Math.abs(N.x) - 1) < 0.15)) {
  console.log('LOI: nhieu seed 42 phai giup thoat saddle, got x=' + N.x);
  errors++;
}

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
