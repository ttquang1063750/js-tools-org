// dsp-core.js — "DSPJS": thư viện xử lý tín hiệu số tối giản, tự viết hoàn
// toàn (không dùng AnalyserNode làm hộp đen — xem plan.md Series 14 §1), xây
// dần qua từng bài của Series 14 (Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ). Cùng kỷ
// luật "verify bằng số thật trước khi viết bài học" như vmcu.js (Series 13)
// và ai-neuro.js (Series 12) — mọi hàm dưới đây đều có self-test ở cuối file.
//
// Bài 1 — Tín hiệu là gì: từ liên tục đến số. Build-out: bộ sinh tín hiệu cơ
// bản (xung đơn vị, bậc thang, sine, sóng vuông, chirp, nhiễu trắng), năng
// lượng/công suất, và chu kỳ của sine rời rạc.

// ---------------------------------------------------------------------------
// Tín hiệu cơ bản — mọi hàm nhận chỉ số MẪU nguyên n (miền rời rạc x[n]),
// KHÔNG có "thời gian liên tục" thật trong JS — đây chính là bài học Mục 1:
// x(t) là khái niệm toán học lý tưởng, x[n] là thứ máy tính thực sự lưu trữ
// và xử lý được, lấy mẫu tại tần số sampleRateHz.
// ---------------------------------------------------------------------------

// Xung đơn vị (unit impulse) δ[n - n0]: đúng 1 tại n=n0, còn lại 0 — tín hiệu
// "nguyên tử" của DSP, đặc trưng hoá trọn vẹn một hệ LTI qua đáp ứng xung
// (sẽ khai thác đầy đủ ở Bài 4).
function unitImpulse(n, n0 = 0) {
  return n === n0 ? 1 : 0;
}

// Bậc thang đơn vị (unit step) u[n - n0]: 0 khi n<n0, 1 khi n>=n0.
function unitStep(n, n0 = 0) {
  return n >= n0 ? 1 : 0;
}

// Sóng sine rời rạc: x[n] = A*sin(2π·f/fs·n + phase) — "sinusoid" là tín
// hiệu cơ bản nhất của miền tần số (Bài 5 trở đi phân tích MỌI tín hiệu
// thành tổng các sinusoid như thế này).
function sine(n, freqHz, sampleRateHz, amplitude = 1, phase = 0) {
  return amplitude * Math.sin((2 * Math.PI * freqHz * n) / sampleRateHz + phase);
}

// Sóng vuông rời rạc: lấy đúng dấu của sine cùng tần số, biên độ ±amplitude.
function square(n, freqHz, sampleRateHz, amplitude = 1, phase = 0) {
  return amplitude * Math.sign(Math.sin((2 * Math.PI * freqHz * n) / sampleRateHz + phase));
}

// Chirp tuyến tính: tần số tức thời trượt ĐỀU từ f0Hz đến f1Hz trong đúng
// durationSamples mẫu — dùng để "quét" toàn dải tần trong 1 tín hiệu, khai
// thác ở Bài 2 (Aliasing Stroboscope) khi tần số trượt qua ngưỡng Nyquist.
function chirp(n, f0Hz, f1Hz, durationSamples, sampleRateHz, amplitude = 1) {
  const t = n / sampleRateHz;
  const durationSec = durationSamples / sampleRateHz;
  const k = (f1Hz - f0Hz) / durationSec; // toc do truot tan so (Hz/giay)
  const phase = 2 * Math.PI * (f0Hz * t + (k * t * t) / 2);
  return amplitude * Math.sin(phase);
}

// Nhiễu trắng TẤT ĐỊNH (deterministic) — dùng hàm băm sin quen thuộc, KHÔNG
// dùng Math.random() để tái hiện được y hệt giữa các lần chạy (Node lúc
// self-test và trình duyệt lúc demo phải cho CÙNG một chuỗi số).
function whiteNoise(n, amplitude = 1, seed = 1) {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  const frac = x - Math.floor(x); // luôn trong [0, 1)
  return (frac * 2 - 1) * amplitude; // trải đều ra [-amplitude, +amplitude]
}

// Sinh N mẫu của 1 loại tín hiệu theo tham số — dùng chung cho demo Signal
// Generator Playground (Mục 5), cho phép chọn/ghép nhiều loại tín hiệu.
function generateSignal(type, numSamples, params = {}) {
  const out = new Array(numSamples);
  for (let n = 0; n < numSamples; n++) {
    switch (type) {
      case 'impulse':
        out[n] = unitImpulse(n, params.n0 ?? 0);
        break;
      case 'step':
        out[n] = unitStep(n, params.n0 ?? 0);
        break;
      case 'sine':
        out[n] = sine(n, params.freqHz, params.sampleRateHz, params.amplitude ?? 1, params.phase ?? 0);
        break;
      case 'square':
        out[n] = square(n, params.freqHz, params.sampleRateHz, params.amplitude ?? 1, params.phase ?? 0);
        break;
      case 'chirp':
        out[n] = chirp(n, params.f0Hz, params.f1Hz, numSamples, params.sampleRateHz, params.amplitude ?? 1);
        break;
      case 'noise':
        out[n] = whiteNoise(n, params.amplitude ?? 1, params.seed ?? 1);
        break;
      default:
        throw new Error('Loại tín hiệu không hợp lệ: ' + type);
    }
  }
  return out;
}

// Năng lượng (energy) — tổng bình phương biên độ, dùng cho tín hiệu NĂNG
// LƯỢNG HỮU HẠN (vd một xung tắt dần) — công thức $E = \sum_n |x[n]|^2$.
function signalEnergy(x) {
  return x.reduce((sum, v) => sum + v * v, 0);
}

// Công suất (power) — trung bình bình phương biên độ, dùng cho tín hiệu
// TUẦN HOÀN/vô hạn (vd sine kéo dài mãi, năng lượng cộng dồn sẽ ra vô cực
// nên phải đo công suất thay vì năng lượng) — $P = \tfrac{1}{N}\sum_n |x[n]|^2$.
function signalPower(x) {
  return signalEnergy(x) / x.length;
}

// Ước số chung lớn nhất — dùng cho discreteSinePeriod bên dưới.
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Chu kỳ rời rạc của 1 sine: x[n] = sin(2π·f/fs·n) chỉ tuần hoàn (có chu kỳ
// hữu hạn theo n) KHI f/fs là số hữu tỷ — với f, fs nguyên (luôn hữu tỷ), chu
// kỳ N (số mẫu) = fs / gcd(f, fs), số mẫu nhỏ nhất để pha lặp lại đúng.
function discreteSinePeriod(freqHz, sampleRateHz) {
  if (freqHz === 0) return 1;
  return sampleRateHz / gcd(freqHz, sampleRateHz);
}

export {
  unitImpulse,
  unitStep,
  sine,
  square,
  chirp,
  whiteNoise,
  generateSignal,
  signalEnergy,
  signalPower,
  discreteSinePeriod,
};

// ---------------------------------------------------------------------------
// Self-test — chạy bằng `node dsp-core.js`. Dùng đúng cùng cơ chế phát hiện
// import.meta.url; kiểm tra `typeof process` trước vì `process` không tồn
// tại trong trình duyệt — thiếu bước này làm ReferenceError ngay khi trang
// import module (tiền lệ ai-neuro.js Series 12, vmcu.js Series 13).
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  let errors = 0;
  let checks = 0;
  function check(name, got, exp) {
    checks++;
    if (got !== exp) {
      console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
      errors++;
    }
  }
  function checkTrue(name, cond) {
    checks++;
    if (!cond) {
      console.log('LOI', name);
      errors++;
    }
  }

  // --- Xung đơn vị & bậc thang ---
  check('unitImpulse(0) = 1 (đúng tại n0 mặc định)', unitImpulse(0), 1);
  check('unitImpulse(5) = 0 (khác n0)', unitImpulse(5), 0);
  check('unitImpulse(3, 3) = 1 (n0 tuỳ chỉnh)', unitImpulse(3, 3), 1);
  check('unitStep(-1) = 0 (trước n0)', unitStep(-1), 0);
  check('unitStep(0) = 1 (đúng tại n0)', unitStep(0), 1);
  check('unitStep(100) = 1 (sau n0 rất xa)', unitStep(100), 1);

  // --- Chu kỳ rời rạc verified: cùng 1 chu kỳ 8 mẫu cho 2 tần số khác nhau
  // (1000Hz và 3000Hz trên 8000Hz) — hé lộ hiện tượng gập phổ (Bài 2) ---
  check('Chu kỳ rời rạc 1000Hz @ 8000Hz = 8 mẫu', discreteSinePeriod(1000, 8000), 8);
  check('Chu kỳ rời rạc 3000Hz @ 8000Hz CŨNG = 8 mẫu (hé lộ gập phổ Bài 2)', discreteSinePeriod(3000, 8000), 8);
  check('Chu kỳ rời rạc 2500Hz @ 8000Hz = 16 mẫu', discreteSinePeriod(2500, 8000), 16);

  // --- Sine đúng 1 chu kỳ trọn vẹn: 8 mẫu tại 1000Hz/8000Hz ---
  {
    const N = discreteSinePeriod(1000, 8000);
    const samples = [];
    for (let n = 0; n < N; n++) samples.push(sine(n, 1000, 8000, 1, 0));
    checkTrue('sine(0) = 0 (bắt đầu từ pha 0)', Math.abs(samples[0]) < 1e-9);
    checkTrue('sine(2) = 1 (đỉnh dương đúng 1/4 chu kỳ)', Math.abs(samples[2] - 1) < 1e-9);
    checkTrue('sine(6) = -1 (đỉnh âm đúng 3/4 chu kỳ)', Math.abs(samples[6] + 1) < 1e-9);
    checkTrue(
      'Công suất trung bình đúng 1 chu kỳ trọn vẹn = 0,5 (verified $P = A^2/2$ với A=1)',
      Math.abs(signalPower(samples) - 0.5) < 1e-9
    );
  }

  // --- Năng lượng xung: đúng 1 xung biên độ 1 giữa các số 0 → energy = 1 ---
  {
    const imp = [0, 0, 1, 0, 0].map((_, i) => unitImpulse(i, 2));
    check('Năng lượng chuỗi 1 xung đơn vị = 1 (Σx[n]² chỉ có đúng 1 số hạng khác 0)', signalEnergy(imp), 1);
  }

  // --- Chirp: bắt đầu đúng pha 0 (sin(0)=0), tất định (không đổi giữa 2 lần gọi) ---
  {
    const c0 = chirp(0, 200, 2000, 800, 8000);
    checkTrue('chirp(0, ...) = 0 (pha ban đầu luôn = 0, sin(0)=0)', Math.abs(c0) < 1e-9);
    checkTrue(
      'chirp tất định: gọi 2 lần cùng tham số cho CÙNG kết quả (không dùng Math.random)',
      chirp(50, 200, 2000, 800, 8000) === chirp(50, 200, 2000, 800, 8000)
    );
  }

  // --- Nhiễu trắng: tất định, luôn nằm trong [-amplitude, +amplitude] ---
  {
    checkTrue(
      'whiteNoise tất định: gọi 2 lần cùng (n, seed) cho CÙNG kết quả',
      whiteNoise(0, 1, 1) === whiteNoise(0, 1, 1)
    );
    const samples = Array.from({ length: 200 }, (_, i) => whiteNoise(i, 1, 1));
    checkTrue(
      'whiteNoise luôn nằm trong [-1, 1] qua 200 mẫu',
      samples.every((v) => v >= -1 && v <= 1)
    );
    checkTrue(
      'whiteNoise KHÔNG hằng số (thực sự "nhiễu" chứ không phải 1 giá trị lặp lại)',
      new Set(samples.map((v) => v.toFixed(6))).size > 100
    );
  }

  // --- generateSignal: đúng số mẫu, đúng loại tín hiệu ---
  {
    const sig = generateSignal('sine', 8, { freqHz: 1000, sampleRateHz: 8000 });
    check('generateSignal trả về đúng số mẫu yêu cầu', sig.length, 8);
    checkTrue(
      'generateSignal(sine) khớp y hệt gọi sine() trực tiếp từng mẫu',
      sig.every((v, n) => v === sine(n, 1000, 8000, 1, 0))
    );
    const step = generateSignal('step', 5, { n0: 2 });
    check('generateSignal(step, n0=2) đúng dãy 0,0,1,1,1', step.join(','), '0,0,1,1,1');
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
