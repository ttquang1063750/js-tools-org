// dsp-core.js — "DSPJS": thư viện xử lý tín hiệu số tối giản, tự viết hoàn
// toàn (không dùng AnalyserNode làm hộp đen — xem plan.md Series 14 §1), xây
// dần qua từng bài của Series 14 (Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ). Cùng kỷ
// luật "verify bằng số thật trước khi viết bài học" như vmcu.js (Series 13)
// và ai-neuro.js (Series 12) — mọi hàm dưới đây đều có self-test ở cuối file.
//
// Bài 1 — Tín hiệu là gì: từ liên tục đến số. Build-out: bộ sinh tín hiệu cơ
// bản (xung đơn vị, bậc thang, sine, sóng vuông, chirp, nhiễu trắng), năng
// lượng/công suất, và chu kỳ của sine rời rạc.
//
// Bài 5 — DFT: cửa sổ nhìn sang miền tần số. Build-out: dft() trực tiếp
// (O(N²), so khớp với sinusoid dò từng bin) + complex helpers (biên độ/pha)
// + binFrequency/frequencyResolution.

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

// Lấy mẫu một hàm liên tục thời gian continuousFn(t) tại numSamples mẫu, tần
// số lấy mẫu sampleRateHz — cầu nối trực tiếp x(t) → x[n] = x(nT) của Bài 1,
// dùng để minh hoạ Mục 2.1 (Bài 2): nhiều đường cong x(t) khác nhau có thể đi
// qua ĐÚNG cùng một tập điểm mẫu x[n] — đó chính là gốc rễ của aliasing.
function sampleContinuous(continuousFn, numSamples, sampleRateHz) {
  const out = new Array(numSamples);
  for (let n = 0; n < numSamples; n++) out[n] = continuousFn(n / sampleRateHz);
  return out;
}

// Tần số gập (alias) CÓ DẤU khi lấy mẫu 1 sine tần số freqHz ở tốc độ
// sampleRateHz: dương = tín hiệu "nhìn thấy" quay/dao động THUẬN chiều đúng
// tần số đó; âm = quay NGƯỢC chiều (hiệu ứng "bánh xe quay ngược" kinh điển,
// Mục 2.3) — biên độ tuyệt đối luôn nằm trong [0, fs/2]. Toán: coi f/fs là
// một số chu kỳ/mẫu, gập số đó về khoảng (-0.5, 0.5] chu kỳ/mẫu rồi nhân lại
// với fs.
function aliasFrequencySigned(freqHz, sampleRateHz) {
  let cycles = (freqHz / sampleRateHz) % 1;
  if (cycles > 0.5) cycles -= 1;
  else if (cycles <= -0.5) cycles += 1;
  return cycles * sampleRateHz;
}

// Tần số gập (alias) dùng khi chỉ cần TRỊ TUYỆT ĐỐI (vd tai người nghe thấy
// "một cao độ", không phân biệt chiều quay) — luôn nằm trong [0, fs/2].
function aliasFrequency(freqHz, sampleRateHz) {
  return Math.abs(aliasFrequencySigned(freqHz, sampleRateHz));
}

// ---------------------------------------------------------------------------
// Bài 3 — Lượng tử hoá & dải động. Mô phỏng lượng tử hoá kiểu PCM có dấu
// B-bit: tín hiệu float trong [-fullScale, fullScale] bị làm tròn về 1 trong
// 2^(B-1) mức nguyên — đúng cách một ADC/DAC thật lượng tử hoá (nối Series
// 13 Bài 10).
// ---------------------------------------------------------------------------

// Lượng tử hoá 1 mẫu về đúng B bit (mid-tread, có dấu): levels = 2^(B-1) mức
// dương tối đa — vd 16-bit cho 32768 mức, khớp PCM 16-bit thật.
function quantize(x, bits, fullScale = 1) {
  const levels = Math.pow(2, bits - 1);
  const clamped = Math.max(-fullScale, Math.min(fullScale, x));
  const scaled = clamped * levels;
  const rounded = Math.round(scaled);
  return rounded / levels;
}

// SQNR lý thuyết (dB) theo quy tắc ~6dB/bit: mỗi bit thêm vào giảm sàn nhiễu
// lượng tử đúng một nửa (biên độ), tương đương +6,02dB tỷ số tín hiệu/nhiễu.
function sqnrDbTheoretical(bits) {
  return 6.02 * bits + 1.76;
}

// SQNR ĐO THẬT trên 1 tín hiệu cụ thể — so sánh trực tiếp với công thức lý
// thuyết ở trên (Mục 3.5: "đo thật đối chiếu công thức").
function measuredSqnrDb(signal, bits, fullScale = 1) {
  const quantized = signal.map((x) => quantize(x, bits, fullScale));
  const noise = signal.map((x, i) => quantized[i] - x);
  return 10 * Math.log10(signalPower(signal) / signalPower(noise));
}

// Lượng tử hoá CÓ DITHER (Mục 3.4): cộng thêm 1 chút nhiễu tất định biên độ
// ±1/2 LSB TRƯỚC khi làm tròn — phá vỡ tương quan giữa sai số lượng tử và
// tín hiệu gốc (nguồn gốc méo hài khó chịu ở mức tín hiệu nhỏ), đổi lấy một
// sàn nhiễu đều dễ chịu hơn tai người.
function quantizeWithDither(x, bits, fullScale, n, seed = 1) {
  const levels = Math.pow(2, bits - 1);
  const lsb = fullScale / levels;
  const ditherNoise = whiteNoise(n, lsb / 2, seed);
  return quantize(x + ditherNoise, bits, fullScale);
}

// Đổi biên độ tuyến tính sang thang dBFS (decibel Full Scale, Mục 3.3) —
// fullScale (biên độ 1.0) tương ứng ĐÚNG 0dBFS, mọi giá trị nhỏ hơn cho ra số
// âm. Verify: 0,5 → -6,02dBFS, khớp đúng quy tắc 6dB/lần giảm biên độ một nửa
// đã gặp ở SQNR.
function amplitudeToDbfs(amplitude, fullScale = 1) {
  return 20 * Math.log10(Math.abs(amplitude) / fullScale);
}

// Clipping cứng (hard clip, Mục 3.3): cắt phẳng mọi giá trị vượt fullScale —
// mô phỏng đúng lỗi tràn thang xảy ra khi thiếu headroom, tạo méo dạng sóng
// (khác hẳn — và tệ hơn nhiều tai người nghe — so với sàn nhiễu lượng tử).
function hardClip(x, fullScale = 1) {
  return Math.max(-fullScale, Math.min(fullScale, x));
}

// ---------------------------------------------------------------------------
// Bài 4 — Hệ LTI, tích chập & đáp ứng xung.
// ---------------------------------------------------------------------------

// Tích chập trực tiếp y[n] = Σ_k x[k]·h[n-k] — thuật toán "lật-dịch-nhân-
// cộng" O(N·M): với mỗi mẫu x[n], cộng dồn MỘT BẢN SAO của h đã scale theo
// x[n] vào đúng vị trí bắt đầu từ n (tương đương lật h rồi trượt qua x, cách
// hiểu kinh điển). Độ dài kết quả LUÔN là N+M-1 (Mục 4.4) — cấp thiếu mảng
// là cắt cụt đuôi tín hiệu (vd mất đuôi reverb).
function convolve(x, h) {
  const N = x.length;
  const M = h.length;
  const y = new Array(N + M - 1).fill(0);
  for (let n = 0; n < N; n++) {
    for (let k = 0; k < M; k++) {
      y[n + k] += x[n] * h[k];
    }
  }
  return y;
}

// Tổng hợp một đáp ứng xung "phòng" TẤT ĐỊNH (deterministic) — nhiễu trắng
// tắt dần theo hàm mũ, mô phỏng tiếng vang dội lại yếu dần theo thời gian
// của một căn phòng thật (không dùng file ghi âm thật để giữ demo tự chứa,
// không cần asset ngoài — bản chất vật lý của một IR phòng thật CŨNG LÀ
// nhiễu tắt dần theo hàm mũ, chỉ khác ở chi tiết phổ tần theo vật liệu).
function synthesizeRoomIR(durationSec, sampleRateHz, decayTau = 0.3, seed = 1) {
  const numSamples = Math.round(durationSec * sampleRateHz);
  const ir = new Array(numSamples);
  for (let n = 0; n < numSamples; n++) {
    const t = n / sampleRateHz;
    ir[n] = whiteNoise(n, 1, seed) * Math.exp(-t / decayTau);
  }
  return ir;
}

// ---------------------------------------------------------------------------
// Bài 5 — DFT: cửa sổ nhìn sang miền tần số.
// ---------------------------------------------------------------------------

// DFT trực tiếp (định nghĩa, O(N²) — cliffhanger sang FFT ở Bài 6): với mỗi
// bin tần số k, "so khớp" (correlation) tín hiệu với sinusoid dò tần số
// k·fs/N bằng công thức $X[k] = \sum_n x[n] e^{-j2\pi kn/N}$. Trả về mảng N
// số phức {re, im} — biên độ VÀ pha đều đóng gói trong 1 số phức mỗi bin.
function dft(x) {
  const N = x.length;
  const X = new Array(N);
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N;
      re += x[n] * Math.cos(angle);
      im += x[n] * Math.sin(angle);
    }
    X[k] = { re, im };
  }
  return X;
}

// Biên độ của 1 số phức {re, im} — $|X[k]| = \sqrt{re^2+im^2}$.
function complexMagnitude(c) {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

// Pha của 1 số phức {re, im}, tính bằng radian — $\angle X[k] = \mathrm{atan2}(im, re)$.
// Pitfall Mục 5.4: vứt pha đi (chỉ giữ biên độ) là MẤT dạng sóng gốc.
function complexPhase(c) {
  return Math.atan2(c.im, c.re);
}

// Phổ biên độ trọn vẹn (Mục 5.4) — áp complexMagnitude() lên từng bin của
// kết quả dft().
function dftMagnitude(X) {
  return X.map(complexMagnitude);
}

// Phổ pha trọn vẹn — áp complexPhase() lên từng bin của kết quả dft().
function dftPhase(X) {
  return X.map(complexPhase);
}

// Tần số thật (Hz) mà bin thứ k đại diện — $f_k = k \cdot f_s / N$ (Mục 5.2).
function binFrequency(k, numSamples, sampleRateHz) {
  return (k * sampleRateHz) / numSamples;
}

// IDFT trực tiếp (nghịch đảo dft(), không thuộc build-out gốc của Bài 5 theo
// plan.md nhưng cần thiết để tự verify idft(dft(x)) = x VÀ dựng thí nghiệm
// tráo pha Mục 5.4 (đóng lại phổ biên độ+pha thành tín hiệu thật để nghe) —
// $x[n] = \tfrac{1}{N}\sum_k X[k] e^{+j2\pi kn/N}$, chỉ lấy phần thực vì tín
// hiệu gốc luôn là số thực.
function idft(X) {
  const N = X.length;
  const x = new Array(N);
  for (let n = 0; n < N; n++) {
    let sum = 0;
    for (let k = 0; k < N; k++) {
      const angle = (2 * Math.PI * k * n) / N;
      sum += X[k].re * Math.cos(angle) - X[k].im * Math.sin(angle);
    }
    x[n] = sum / N;
  }
  return x;
}

// Độ phân giải tần số (Hz/bin, Mục 5.3) — khoảng cách tần số giữa 2 bin liền
// kề, $\Delta f = f_s/N$: muốn phân biệt 2 tone cách nhau 1Hz phải quan sát
// (lấy N mẫu) trong ít nhất 1 giây ở BẤT KỲ fs nào — không có bữa trưa miễn phí.
function frequencyResolution(sampleRateHz, numSamples) {
  return sampleRateHz / numSamples;
}

// ---------------------------------------------------------------------------
// Bài 6 — FFT: thuật toán thay đổi thế giới. Build-out: fft()/ifft() radix-2
// decimation-in-time CÀI ĐẶT LẶP (iterative in-place — đúng tinh thần Mục
// 6.3 "từ đệ quy sang 3 vòng lặp"), bit-reversal, và các hàm đếm phép nhân
// dùng để MINH HOẠ tốc độ O(N log N) so O(N²) bằng số thật (Mục 6.1/6.4).
// ---------------------------------------------------------------------------

// Đảo bit của n trong đúng numBits bit — nền tảng của bước sắp xếp lại đầu
// vào trước khi chạy 3 vòng lặp butterfly (Mục 6.2): đây KHÔNG phải phép
// thuật, mà là hệ quả trực tiếp của việc đệ quy tách chẵn/lẻ liên tục — mỗi
// lần tách là 1 bit quyết định "đi trái hay phải", làm log2(N) lần liên tiếp
// từ bit thấp nhất tạo ra đúng thứ tự đảo bit.
function bitReverse(n, numBits) {
  let result = 0;
  let value = n;
  for (let i = 0; i < numBits; i++) {
    result = (result << 1) | (value & 1);
    value >>= 1;
  }
  return result;
}

// FFT radix-2 decimation-in-time, cài đặt LẶP tại chỗ (in-place): bước 1 sắp
// xếp lại mảng vào theo bit-reversal, bước 2 chạy đúng 3 vòng lặp lồng nhau
// (stage → nhóm butterfly → twiddle factor) thay cho đệ quy — cùng kết quả
// nhưng không tốn ngăn xếp gọi hàm đệ quy. Nhận vào mảng số thực HOẶC số
// phức {re,im}; N BẮT BUỘC là luỹ thừa của 2 (pitfall Mục 6.3 — dùng
// zeroPad() nếu tín hiệu thật không tự nhiên có độ dài luỹ thừa 2).
function fft(x) {
  const N = x.length;
  if (N === 0 || (N & (N - 1)) !== 0) {
    throw new Error('FFT radix-2 yeu cau N la luy thua cua 2, N=' + N);
  }
  const numBits = Math.log2(N);
  const re = new Array(N);
  const im = new Array(N);
  for (let i = 0; i < N; i++) {
    const j = bitReverse(i, numBits);
    const sample = x[i];
    re[j] = typeof sample === 'number' ? sample : sample.re;
    im[j] = typeof sample === 'number' ? 0 : sample.im;
  }
  for (let stage = 1; stage <= numBits; stage++) {
    const m = 1 << stage; // kich thuoc nhom butterfly o stage nay
    const halfM = m >> 1;
    const angleStep = (-2 * Math.PI) / m;
    for (let start = 0; start < N; start += m) {
      for (let k = 0; k < halfM; k++) {
        const angle = angleStep * k; // goc xoay cua twiddle factor
        const wRe = Math.cos(angle);
        const wIm = Math.sin(angle);
        const idxEven = start + k;
        const idxOdd = start + k + halfM;
        const oddRe = re[idxOdd] * wRe - im[idxOdd] * wIm;
        const oddIm = re[idxOdd] * wIm + im[idxOdd] * wRe;
        const evenRe = re[idxEven];
        const evenIm = im[idxEven];
        re[idxEven] = evenRe + oddRe;
        im[idxEven] = evenIm + oddIm;
        re[idxOdd] = evenRe - oddRe;
        im[idxOdd] = evenIm - oddIm;
      }
    }
  }
  const X = new Array(N);
  for (let i = 0; i < N; i++) X[i] = { re: re[i], im: im[i] };
  return X;
}

// IFFT — dùng đúng mẹo kinh điển "liên hợp phức 2 lần": conj(fft(conj(X)))/N
// cho đúng biến đổi ngược mà không cần viết lại thuật toán butterfly riêng.
function ifft(X) {
  const N = X.length;
  const conjInput = X.map((c) => ({ re: c.re, im: -c.im }));
  const Y = fft(conjInput);
  return Y.map((c) => ({ re: c.re / N, im: -c.im / N }));
}

// Thêm số 0 vào cuối tín hiệu cho đủ targetLength (BẮT BUỘC là luỹ thừa 2 để
// dùng với fft()) — Mục 6.3 pitfall: nội suy phổ MƯỢT hơn (nhiều bin hơn)
// nhưng KHÔNG thêm bất kỳ thông tin tần số mới nào, vì không có mẫu thật mới.
function zeroPad(x, targetLength) {
  const padded = new Array(targetLength).fill(0);
  for (let i = 0; i < x.length; i++) padded[i] = x[i];
  return padded;
}

// Số phép nhân phức của DFT trực tiếp: N bin, mỗi bin N phép nhân — O(N²).
function dftMultiplyCount(N) {
  return N * N;
}

// Số phép nhân phức của FFT radix-2: log2(N) stage, mỗi stage N/2 phép nhân
// twiddle (butterfly cộng/trừ không tốn phép nhân nào thêm) — O(N log N).
function fftMultiplyCount(N) {
  return (N / 2) * Math.log2(N);
}

// Tỷ lệ tăng tốc xấp xỉ giữa O(N²) và O(N log N) — chính là N/log2(N), dùng
// để minh hoạ con số "N=1024: khoảng 100 lần nhanh hơn" ở Mục 6.1/6.4.
function complexityRatio(N) {
  return N / Math.log2(N);
}

// ---------------------------------------------------------------------------
// Bài 7 — Rò rỉ phổ & hàm cửa sổ. Build-out: 4 cửa sổ chuẩn (rect/Hann/
// Hamming/Blackman), coherent gain (Mục 7.4 — cửa sổ "ăn" mất năng lượng,
// phải bù lại), và đo main-lobe/side-lobe bằng chính FFT của cửa sổ (Mục 7.3).
// ---------------------------------------------------------------------------

// Cửa sổ chữ nhật (rect) — KHÔNG sửa gì cả (nhân với 1 mọi nơi), chính là
// "cửa sổ" DFT/FFT trực tiếp NGẦM áp dụng khi cắt 1 khung hữu hạn (Mục 7.2:
// cắt khung = nhân với rect = chập phổ với sinc, nguồn gốc TOÀN BỘ leakage).
function rectWindow(N) {
  return new Array(N).fill(1);
}

// Cửa sổ Hann — main lobe rộng vừa phải, side lobe thấp, lựa chọn "đa dụng
// hằng ngày" (Mục 7.3).
function hannWindow(N) {
  return Array.from({ length: N }, (_, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1)));
}

// Cửa sổ Hamming — main lobe hẹp hơn Hann (tách 2 tone gần nhau tốt hơn)
// nhưng side lobe đầu tiên cao hơn — đánh đổi ngược lại Hann.
function hammingWindow(N) {
  return Array.from({ length: N }, (_, n) => 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1)));
}

// Cửa sổ Blackman — side lobe thấp nhất trong 4 loại (tốt nhất để tìm tone
// yếu cạnh tone mạnh) nhưng main lobe rộng nhất (phân giải tần số kém nhất).
function blackmanWindow(N) {
  return Array.from(
    { length: N },
    (_, n) => 0.42 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1)) + 0.08 * Math.cos((4 * Math.PI * n) / (N - 1))
  );
}

// Áp 1 cửa sổ lên tín hiệu — nhân từng mẫu, đúng phép toán Mục 7.2.
function applyWindow(x, window) {
  return x.map((v, i) => v * window[i]);
}

// Coherent gain — giá trị TRUNG BÌNH của cửa sổ, đo "cửa sổ ăn mất bao nhiêu
// năng lượng trung bình" (Mục 7.4): rect=1,0 (không ăn gì), Hann≈0,5,
// Hamming≈0,54, Blackman≈0,42 — số càng nhỏ, cửa sổ càng "cắt" mạnh.
function coherentGain(window) {
  return window.reduce((sum, w) => sum + w, 0) / window.length;
}

// Biên độ đã bù coherent gain (Mục 7.4 pitfall): quên bù → MỌI phép đo biên
// độ qua cửa sổ khác rect đều sai một hằng số hệ thống (thấp hơn thực tế).
function compensatedMagnitude(magnitude, window) {
  const cg = coherentGain(window);
  return magnitude.map((m) => m / cg);
}

// Đo mức side lobe cao nhất (dB, so với đỉnh main lobe) của chính 1 cửa sổ,
// bằng cách FFT cửa sổ đó (zero-pad để có độ phân giải mượt) rồi quét: main
// lobe là đoạn biên độ giảm dần liên tục từ đỉnh k=0, side lobe đầu tiên là
// đỉnh cục bộ CAO NHẤT ngay sau khi main lobe kết thúc giảm (Mục 7.3).
function sideLobeLevelDb(window, paddedLength = 4096) {
  const padded = zeroPad(window, paddedLength);
  const spectrum = dftMagnitude(fft(padded));
  const half = spectrum.slice(0, paddedLength / 2);
  const peak = half[0];
  let i = 1;
  while (i < half.length - 1 && half[i] >= half[i + 1]) i++;
  let sideLobePeak = 0;
  for (; i < half.length; i++) sideLobePeak = Math.max(sideLobePeak, half[i]);
  return 20 * Math.log10(sideLobePeak / peak);
}

// ---------------------------------------------------------------------------
// Bài 8 — STFT & Spectrogram. Build-out: stft() (cắt khung chồng lấp, áp cửa
// sổ, FFT từng khung — đúng ý tưởng "cắt lát thời gian" Mục 8.1), chuyển phổ
// biên độ sang dB (Mục 8.4 pitfall: quên đổi dB nhìn "toàn đen"), và colormap
// đơn giản để vẽ ảnh nhiệt spectrogram lên canvas.
// ---------------------------------------------------------------------------

// STFT: cắt tín hiệu thành các khung chồng lấp (hopSize < frameSize để không
// rơi tín hiệu ở mép, Mục 8.3), áp cửa sổ từng khung, FFT từng khung, xếp
// thành mảng các cột phổ theo thời gian. frameSize BẮT BUỘC luỹ thừa 2 (dùng
// chung pitfall fft() đã biết từ Bài 6).
function stft(x, windowFn, frameSize, hopSize) {
  const win = windowFn(frameSize);
  const numFrames = Math.floor((x.length - frameSize) / hopSize) + 1;
  const frames = [];
  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    const frame = x.slice(start, start + frameSize);
    frames.push(fft(applyWindow(frame, win)));
  }
  return frames;
}

// Chuyển 1 khung phổ phức (kết quả fft) sang biên độ dB, CHẶN SÀN ở floorDb
// (Mục 8.4 pitfall: không chặn sàn, log10(0) = -Infinity làm hỏng cả colormap
// lẫn hiển thị — mọi giá trị quá nhỏ bị "ép" về đúng floorDb).
function magnitudeToDb(magnitude, floorDb = -100) {
  return magnitude.map((m) => Math.max(20 * Math.log10(m + 1e-12), floorDb));
}

// Toàn bộ spectrogram ở dạng dB — áp dftMagnitude + magnitudeToDb lên MỖI cột
// (khung) trả về từ stft().
function stftMagnitudeDb(frames, floorDb = -100) {
  return frames.map((frame) => magnitudeToDb(dftMagnitude(frame), floorDb));
}

// Colormap tối giản (dB -> [r,g,b]) dùng để vẽ ảnh nhiệt spectrogram: tối
// (gần đen) ở sàn floorDb, sáng dần lên vàng/trắng ở đỉnh 0dB — clamp cả 2
// đầu để giá trị ngoài khoảng [minDb, maxDb] không tràn ra màu vô nghĩa.
function dbToColor(db, minDb = -100, maxDb = 0) {
  const t = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));
  const r = Math.round(255 * Math.min(1, t * 2));
  const g = Math.round(255 * Math.max(0, Math.min(1, (t - 0.3) * 1.4)));
  const b = Math.round(255 * Math.max(0, 1 - t * 2));
  return [r, g, b];
}

// ---------------------------------------------------------------------------
// Bài 9 — Filter FIR: từ trung bình trượt đến windowed-sinc. Build-out:
// firDesign (lowpass/highpass/bandpass windowed-sinc — tái sử dụng TRỰC TIẾP
// hàm cửa sổ của Bài 7, không viết lại), và firGroupDelay/firFrequencyResponse
// hỗ trợ minh hoạ linear phase (Mục 9.3) trên chính bộ lọc vừa thiết kế.
// ---------------------------------------------------------------------------

// Hàm sinc chuẩn hoá: sinc(x) = sin(πx)/(πx), sinc(0) = 1 (giới hạn, tránh
// chia 0). Đây là biến đổi Fourier ngược của một xung chữ nhật lý tưởng
// trong miền tần số — chính là đáp ứng xung của low-pass "trong mơ" Mục 9.2.
function sinc(x) {
  if (x === 0) return 1;
  return Math.sin(Math.PI * x) / (Math.PI * x);
}

// Thiết kế FIR low-pass windowed-sinc: numTaps hệ số, cutoffNorm là tần số
// cắt CHUẨN HOÁ theo fs (0..0.5 — vd 0.1 nghĩa là cắt tại 0.1×fs Hz). Đáp
// ứng xung LÝ TƯỞNG (sinc vô hạn 2 chiều, KHÔNG nhân quả) bị CẮT NGẮN + DỊCH
// về giữa (M = (numTaps-1)/2, để nhân quả) + NHÂN VỚI CỬA SỔ (Bài 7, chống
// "gãy" đột ngột khi cắt — đúng windowed-sinc Mục 9.2).
function firLowpassDesign(numTaps, cutoffNorm, windowFn) {
  const M = (numTaps - 1) / 2;
  const win = windowFn(numTaps);
  const h = new Array(numTaps);
  for (let n = 0; n < numTaps; n++) {
    const k = n - M;
    const ideal = 2 * cutoffNorm * sinc(2 * cutoffNorm * k);
    h[n] = ideal * win[n];
  }
  return h;
}

// High-pass qua "spectral inversion" (Mục 9.4): đảo phổ của low-pass CÙNG
// cutoff — trừ xung đơn vị (đặt đúng tại tâm M, để bù trễ nhóm) cho đi
// low-pass. Trực giác: "tất cả" (xung đơn vị = phổ phẳng toàn dải) trừ đi
// "phần thấp" = phần cao còn lại.
function firHighpassDesign(numTaps, cutoffNorm, windowFn) {
  const M = (numTaps - 1) / 2;
  const lp = firLowpassDesign(numTaps, cutoffNorm, windowFn);
  return lp.map((v, n) => (n === M ? 1 - v : -v));
}

// Band-pass qua DỊCH TẦN (Mục 9.4): thiết kế 1 low-pass với băng thông bằng
// bandwidthNorm, rồi NHÂN với cosin tại tần số trung tâm centerNorm — dịch
// phổ low-pass (đang quanh 0Hz) lên quanh centerNorm (điều chế biên độ).
function firBandpassDesign(numTaps, centerNorm, bandwidthNorm, windowFn) {
  const M = (numTaps - 1) / 2;
  const lp = firLowpassDesign(numTaps, bandwidthNorm / 2, windowFn);
  return lp.map((v, n) => v * 2 * Math.cos(2 * Math.PI * centerNorm * (n - M)));
}

// Trễ nhóm (group delay, tính bằng SỐ MẪU) của 1 FIR đối xứng — HẰNG SỐ với
// MỌI tần số (Mục 9.3: "món quà" của đối xứng — mọi tần số bị trễ ĐỀU nhau,
// dạng sóng không méo, chỉ trễ). Với FIR đối xứng chẵn/lẻ tap, luôn đúng
// bằng (numTaps-1)/2 mẫu.
function firGroupDelay(numTaps) {
  return (numTaps - 1) / 2;
}

// Đáp ứng tần số của 1 FIR h[n]: zero-pad cho đủ fftSize (độ phân giải mượt
// hơn, Bài 6) rồi FFT — trả về mảng số phức, dùng dftMagnitude()/dftPhase()
// để đọc biên độ/pha tại từng bin.
function firFrequencyResponse(h, fftSize) {
  return fft(zeroPad(h, fftSize));
}

// ---------------------------------------------------------------------------
// Bài 10 — Z-transform & mặt phẳng z. Build-out: 4 hàm số phức cơ bản (cộng/
// trừ/nhân/chia — DFT/FFT trước giờ chỉ cần cộng/trừ/nhân, giờ Mục 10.3 cần
// CHIA để tính H(z)=B(z)/A(z)), polyFromRoots (nghiệm → đa thức, "tên gọi
// thành hình ảnh" của pole/zero), freqRespFromPZ (đọc đáp ứng tần số bằng
// HÌNH HỌC — khoảng cách tới pole/zero, đúng tinh thần Mục 10.3), và
// iirFilterDirect (chạy phương trình sai phân trực tiếp — minh hoạ ổn định/
// mất ổn định/oscillator ở Mục 10.4, CHƯA phải dạng tối ưu DF2T của Bài 11).
// ---------------------------------------------------------------------------

function complexAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}
function complexSub(a, b) {
  return { re: a.re - b.re, im: a.im - b.im };
}
function complexMul(a, b) {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function complexDiv(a, b) {
  const denom = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / denom, im: (a.im * b.re - a.re * b.im) / denom };
}

// Khai triển đa thức từ danh sách NGHIỆM (roots, mỗi nghiệm 1 số phức {re,im})
// — tích các thừa số $(1 - r_k z^{-1})$, trả về mảng hệ số $[c_0, c_1, ...]$
// (luôn $c_0=1$). Đây chính là "tên gọi thành hình ảnh" của Mục 10.2: cho
// TRƯỚC vị trí pole/zero trên mặt phẳng z, ra NGAY hệ số $b$/$a$ của phương
// trình sai phân — không cần giải ngược lại từ đầu.
function polyFromRoots(roots) {
  let coeffs = [{ re: 1, im: 0 }];
  for (const r of roots) {
    const next = new Array(coeffs.length + 1).fill(null).map(() => ({ re: 0, im: 0 }));
    for (let i = 0; i < coeffs.length; i++) {
      next[i] = complexAdd(next[i], coeffs[i]);
      next[i + 1] = complexSub(next[i + 1], complexMul(coeffs[i], r));
    }
    coeffs = next;
  }
  return coeffs;
}

// Đáp ứng tần số $H(e^{j\omega})$ tính bằng HÌNH HỌC thuần tuý (Mục 10.3,
// KHÔNG cần khai triển đa thức trước): $|H(e^{j\omega})|$ = tích khoảng
// cách từ điểm $e^{j\omega}$ (đi bộ quanh vòng tròn đơn vị) tới từng zero,
// chia cho tích khoảng cách tới từng pole. Trả về mảng {omega, magnitude,
// phase} cho $\omega$ chạy từ 0 tới $\pi$ (Nyquist).
function freqRespFromPZ(zeros, poles, gain, numPoints) {
  const result = new Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const omega = (Math.PI * i) / (numPoints - 1);
    const point = { re: Math.cos(omega), im: Math.sin(omega) };
    let num = { re: gain, im: 0 };
    for (const z of zeros) num = complexMul(num, complexSub(point, z));
    let den = { re: 1, im: 0 };
    for (const p of poles) den = complexMul(den, complexSub(point, p));
    const H = complexDiv(num, den);
    result[i] = { omega, magnitude: complexMagnitude(H), phase: complexPhase(H) };
  }
  return result;
}

// Ổn định (Mục 10.4): MỌI pole phải nằm TRONG vòng tròn đơn vị (|pole| < 1).
function polesStable(poles) {
  return poles.every((p) => complexMagnitude(p) < 1);
}

// Chạy TRỰC TIẾP phương trình sai phân $y[n] = \frac{1}{a_0}\left(\sum_k b_k x[n-k] - \sum_{k \geq 1} a_k y[n-k]\right)$
// — CHƯA tối ưu (đó là Direct Form II Transposed, Bài 11), nhưng đủ để minh
// hoạ TRỰC TIẾP hành vi thật của hệ thống theo vị trí pole: ổn định (decay),
// mất ổn định (tăng trưởng mũ), hay dao động tự duy trì (pole đúng trên
// vòng tròn — Mục 10.4 "chế oscillator số").
function iirFilterDirect(x, bCoeffs, aCoeffs) {
  const y = new Array(x.length).fill(0);
  for (let n = 0; n < x.length; n++) {
    let acc = 0;
    for (let k = 0; k < bCoeffs.length; k++) if (n - k >= 0) acc += bCoeffs[k] * x[n - k];
    for (let k = 1; k < aCoeffs.length; k++) if (n - k >= 0) acc -= aCoeffs[k] * y[n - k];
    y[n] = acc / aCoeffs[0];
  }
  return y;
}

// ---------------------------------------------------------------------------
// Bài 11 — Filter IIR & Biquad. Build-out: biquadCoeffsRBJ (RBJ Audio EQ
// Cookbook — 7 loại filter từ bộ ba (f0, Q, gainDb), CHUẨN CÔNG NGHIỆP dùng
// khắp nơi từ plugin âm thanh tới CMSIS-DSP), biquadDF2T (Direct Form II
// Transposed — dạng TỐI ƯU thay cho iirFilterDirect thô của Bài 10, chỉ cần
// giữ 2 biến trạng thái z1/z2 thay vì toàn bộ lịch sử x/y), và quadraticRoots
// (tìm pole/zero của 1 biquad — tái dùng cho Mục 11.4 minh hoạ lượng tử hệ số
// đẩy pole trượt ra ngoài vòng tròn đơn vị).
// ---------------------------------------------------------------------------

// Giải nghiệm bậc 2 $az^2+bz+c=0$ — dùng để tìm pole (từ $1+a_1z^{-1}+a_2z^{-2}$,
// nhân cả 2 vế với $z^2$ ra $z^2+a_1z+a_2$) hoặc zero (từ $b_0+b_1z^{-1}+b_2z^{-2}$).
function quadraticRoots(a, b, c) {
  const disc = b * b - 4 * a * c;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return [
      { re: (-b + s) / (2 * a), im: 0 },
      { re: (-b - s) / (2 * a), im: 0 },
    ];
  }
  const s = Math.sqrt(-disc);
  return [
    { re: -b / (2 * a), im: s / (2 * a) },
    { re: -b / (2 * a), im: -s / (2 * a) },
  ];
}

// Pole của 1 biquad đã chuẩn hoá ($a_0=1$) — nghiệm của $z^2+a_1z+a_2=0$.
function biquadPoles(coeffs) {
  return quadraticRoots(1, coeffs.a1, coeffs.a2);
}

// Zero của 1 biquad — nghiệm của $b_0z^2+b_1z+b_2=0$.
function biquadZeros(coeffs) {
  return quadraticRoots(coeffs.b0, coeffs.b1, coeffs.b2);
}

// RBJ Audio EQ Cookbook (Robert Bristow-Johnson) — công thức CHUẨN CÔNG
// NGHIỆP biến bộ ba dễ hiểu bằng tai $(f_0, Q, gainDb)$ thành hệ số biquad
// $(b_0,b_1,b_2,a_0,a_1,a_2)$, đã áp sẵn bilinear transform (Mục 11.3 chỉ
// nhắc khái niệm, không tự tay suy ra). Hệ số trả về ĐÃ CHUẨN HOÁ theo $a_0$
// ($a_0=1$ ẩn đi) để dùng thẳng cho biquadDF2T.
function biquadCoeffsRBJ(type, f0, fs, Q, gainDb = 0) {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * f0) / fs;
  const cosw0 = Math.cos(w0);
  const sinw0 = Math.sin(w0);
  const alpha = sinw0 / (2 * Q);
  const sqrtA = Math.sqrt(A);
  let b0, b1, b2, a0, a1, a2;
  switch (type) {
    case 'lowpass':
      b0 = (1 - cosw0) / 2;
      b1 = 1 - cosw0;
      b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'highpass':
      b0 = (1 + cosw0) / 2;
      b1 = -(1 + cosw0);
      b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'bandpass':
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'notch':
      b0 = 1;
      b1 = -2 * cosw0;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'peaking':
      b0 = 1 + alpha * A;
      b1 = -2 * cosw0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosw0;
      a2 = 1 - alpha / A;
      break;
    case 'lowshelf':
      b0 = A * (A + 1 - (A - 1) * cosw0 + 2 * sqrtA * alpha);
      b1 = 2 * A * (A - 1 - (A + 1) * cosw0);
      b2 = A * (A + 1 - (A - 1) * cosw0 - 2 * sqrtA * alpha);
      a0 = A + 1 + (A - 1) * cosw0 + 2 * sqrtA * alpha;
      a1 = -2 * (A - 1 + (A + 1) * cosw0);
      a2 = A + 1 + (A - 1) * cosw0 - 2 * sqrtA * alpha;
      break;
    case 'highshelf':
      b0 = A * (A + 1 + (A - 1) * cosw0 + 2 * sqrtA * alpha);
      b1 = -2 * A * (A - 1 + (A + 1) * cosw0);
      b2 = A * (A + 1 + (A - 1) * cosw0 - 2 * sqrtA * alpha);
      a0 = A + 1 - (A - 1) * cosw0 + 2 * sqrtA * alpha;
      a1 = 2 * (A - 1 - (A + 1) * cosw0);
      a2 = A + 1 - (A - 1) * cosw0 - 2 * sqrtA * alpha;
      break;
    default:
      throw new Error('Loại biquad không hỗ trợ: ' + type);
  }
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

// Direct Form II Transposed — thắng Direct Form I/II ở dấu phẩy động vì chỉ
// giữ ĐÚNG 2 biến trạng thái $z_1,z_2$ (thay vì lưu riêng lịch sử x[] và y[]),
// nên tích luỹ SAI SỐ LÀM TRÒN ít nhất qua mỗi mẫu — đây là dạng mọi thư viện
// audio thực chiến (CMSIS-DSP, JUCE, Web Audio BiquadFilterNode) đều dùng.
// Hệ số coeffs đã chuẩn hoá ($a_0=1$, như biquadCoeffsRBJ trả về).
function biquadDF2T(x, coeffs) {
  const { b0, b1, b2, a1, a2 } = coeffs;
  let z1 = 0;
  let z2 = 0;
  const y = new Array(x.length);
  for (let n = 0; n < x.length; n++) {
    const xn = x[n];
    const yn = b0 * xn + z1;
    z1 = b1 * xn - a1 * yn + z2;
    z2 = b2 * xn - a2 * yn;
    y[n] = yn;
  }
  return y;
}

// ---------------------------------------------------------------------------
// Bài 12 — Resampling & xử lý đa tốc độ. Build-out: upsampleZeroStuff/
// downsampleNaive (2 khối "ngây thơ" — chèn 0/bỏ mẫu thô, dùng để CHỨNG MINH
// vì sao cách ngây thơ gây aliasing), decimate/interpolate (LỌC TRƯỚC/SAU
// đúng cách — tái dùng TRỰC TIẾP firLowpassDesign của Bài 9), và
// resampleRational (tỉ lệ L/M hữu tỉ bất kỳ — 44,1kHz↔48kHz chính là
// 147/160, xem gcdInt).
// ---------------------------------------------------------------------------

// Ước chung lớn nhất — dùng để rút gọn tỉ lệ đổi sample rate về dạng L/M tối
// giản (vd 48000/44100 → gcd=300 → 160/147).
function gcdInt(a, b) {
  return b === 0 ? a : gcdInt(b, a % b);
}

// Chèn L-1 số 0 giữa mỗi mẫu (Mục 12.2 "Interpolation ↑L bước 1") — tạo ra
// ảnh phổ (spectral images) lặp lại quanh bội số của fs gốc, CHƯA lọc sạch.
function upsampleZeroStuff(x, L) {
  const y = new Array(x.length * L).fill(0);
  for (let i = 0; i < x.length; i++) y[i * L] = x[i];
  return y;
}

// Cách "ngây thơ" nhất để đổi rate: bỏ mẫu cách quãng, KHÔNG lọc trước —
// verified gây aliasing y hệt Bài 2 khi tần số vượt quá Nyquist MỚI.
function downsampleNaive(x, M) {
  const y = [];
  for (let i = 0; i < x.length; i += M) y.push(x[i]);
  return y;
}

// Decimation ĐÚNG cách (Mục 12.2): LỌC TRƯỚC bằng low-pass windowed-sinc cắt
// tại Nyquist MỚI ($f_s/(2M)$, chuẩn hoá theo $f_s$ gốc là $1/(2M)$ — tái
// dùng TRỰC TIẾP firLowpassDesign của Bài 9), RỒI mới bỏ mẫu — chặn hết nội
// dung sẽ gập phổ trước khi nó có cơ hội gập.
function decimate(x, M, numTaps, windowFn) {
  const h = firLowpassDesign(numTaps, 1 / (2 * M), windowFn);
  const filtered = convolve(x, h);
  return downsampleNaive(filtered, M);
}

// Interpolation ĐÚNG cách (Mục 12.2): chèn 0 (upsampleZeroStuff) RỒI lọc
// sạch ảnh phổ bằng low-pass cắt tại $1/(2L)$ — nhân bù hệ số $L$ vì chèn 0
// làm giảm năng lượng trung bình đi đúng $L$ lần.
function interpolate(x, L, numTaps, windowFn) {
  const zeroStuffed = upsampleZeroStuff(x, L);
  const h = firLowpassDesign(numTaps, 1 / (2 * L), windowFn).map((v) => v * L);
  return convolve(zeroStuffed, h);
}

// Đổi sample rate theo tỉ lệ hữu tỉ L/M BẤT KỲ (Mục 12.2): lên trước (chèn 0
// L lần) → MỘT filter chung cắt tại Nyquist NHỎ HƠN trong 2 Nyquist (đảm bảo
// vừa chặn ảnh phổ của bước lên, vừa chống alias cho bước xuống) → xuống sau
// (bỏ mẫu M lần). 44,1kHz↔48kHz chính là L/M = 160/147 hoặc 147/160
// (gcdInt(48000,44100)=300).
function resampleRational(x, L, M, numTaps, windowFn) {
  const zeroStuffed = upsampleZeroStuff(x, L);
  const cutoffNorm = Math.min(1 / (2 * L), 1 / (2 * M));
  const h = firLowpassDesign(numTaps, cutoffNorm, windowFn).map((v) => v * L);
  const filtered = convolve(zeroStuffed, h);
  return downsampleNaive(filtered, M);
}

// ---------------------------------------------------------------------------
// Bài 13 — Phát hiện cao độ: autocorrelation & tuner. Build-out: autocorrFFT
// (tự tương quan qua định lý Wiener-Khinchin — FFT trả cổ tức lần 2, Bài 6),
// yinDifference/yinCMND/yinPickTau (thuật toán YIN — bản vá cho nhạc thật:
// difference function thay tích, chuẩn hoá trung bình tích luỹ dìm đỉnh giả,
// ngưỡng tuyệt đối chọn đỉnh ĐẦU TIÊN đủ tốt thay vì đỉnh to nhất), và
// parabolicRefine/centsFromFreq/freqToNote (độ chính xác dưới-mẫu + đổi
// sang nốt nhạc, Mục 13.4).
// ---------------------------------------------------------------------------

function nextPowerOfTwo(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Tự tương quan (autocorrelation) qua định lý Wiener-Khinchin: FFT rồi nhân
// với LIÊN HỢP của chính nó ($|X|^2$, tương đương tích chập của x với chính
// x đảo ngược) rồi IFFT — nhanh hơn tính trực tiếp $O(N^2)$ rất nhiều, đúng
// tinh thần "họ hàng tích chập" của Mục 13.2. Zero-pad gấp đôi TRƯỚC khi FFT
// để tránh autocorrelation "vòng" (circular) làm sai kết quả ở lag lớn.
function autocorrFFT(x) {
  const N = x.length;
  const paddedLen = nextPowerOfTwo(2 * N);
  const X = fft(zeroPad(x, paddedLen));
  const power = X.map((c) => ({ re: c.re * c.re + c.im * c.im, im: 0 }));
  const r = ifft(power);
  return r.slice(0, N).map((c) => c.re);
}

// YIN Mục 13.3, bước 1: difference function $d(\tau) = \sum_j (x[j]-x[j+\tau])^2$
// — DÙNG HIỆU thay vì TÍCH của autocorrelation, để đỉnh tại đúng chu kỳ trở
// thành một CỰC TIỂU rõ ràng (thay vì một cực đại lẫn giữa nhiều cực đại phụ).
function yinDifference(x, maxTau) {
  const N = x.length;
  const d = new Array(maxTau).fill(0);
  for (let tau = 1; tau < maxTau; tau++) {
    let sum = 0;
    for (let j = 0; j < N - maxTau; j++) {
      const diff = x[j] - x[j + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  return d;
}

// YIN bước 2: chuẩn hoá trung bình tích luỹ (Cumulative Mean Normalized
// Difference — CMND) — chia $d(\tau)$ cho trung bình CỘNG DỒN của chính nó
// từ $1$ tới $\tau$, dìm các đỉnh giả ở $\tau$ nhỏ xuống gần 1, để một
// ngưỡng TUYỆT ĐỐI duy nhất (vd 0,1) hoạt động ổn định cho mọi cao độ.
function yinCMND(d) {
  const maxTau = d.length;
  const dp = new Array(maxTau).fill(1);
  let runningSum = 0;
  for (let tau = 1; tau < maxTau; tau++) {
    runningSum += d[tau];
    dp[tau] = d[tau] / (runningSum / tau);
  }
  return dp;
}

// YIN bước 3: chọn $\tau$ — ngưỡng TUYỆT ĐỐI, lấy đỉnh (chỗ trũng) ĐẦU TIÊN
// đủ tốt (dưới ngưỡng) rồi trượt tới đáy cục bộ, THAY VÌ tìm cực tiểu TOÀN
// CỤC. Đây chính là "bản vá" chống lỗi lệch quãng tám (octave error) của
// Mục 13.2/13.3 — cực tiểu toàn cục đôi khi rơi vào bội số của chu kỳ thật.
function yinPickTau(dp, threshold, minTau, maxTau) {
  for (let tau = minTau; tau < maxTau - 1; tau++) {
    if (dp[tau] < threshold) {
      while (tau + 1 < maxTau && dp[tau + 1] < dp[tau]) tau++;
      return tau;
    }
  }
  let best = minTau;
  let bestVal = Infinity;
  for (let tau = minTau; tau < maxTau; tau++) {
    if (dp[tau] < bestVal) {
      bestVal = dp[tau];
      best = tau;
    }
  }
  return best;
}

// Nội suy parabol quanh 1 chỉ số nguyên (Mục 13.4): khớp 1 parabol qua 3
// điểm liền kề $(tau-1, tau, tau+1)$, trả về vị trí đáy THỰC (không nguyên)
// — độ chính xác VƯỢT lưới mẫu rời rạc mà không cần tăng tần số lấy mẫu.
function parabolicRefine(arr, index) {
  if (index <= 0 || index >= arr.length - 1) return index;
  const s0 = arr[index - 1];
  const s1 = arr[index];
  const s2 = arr[index + 1];
  const denom = s0 - 2 * s1 + s2;
  if (denom === 0) return index;
  return index + (0.5 * (s0 - s2)) / denom;
}

// Ghép trọn quy trình YIN (Mục 13.3-13.4): difference → CMND → chọn tau bằng
// ngưỡng → nội suy parabol tinh chỉnh → đổi tau (mẫu) sang tần số (Hz).
function yinPitch(x, fs, options = {}) {
  const maxTau = options.maxTau ?? Math.floor(x.length / 2);
  const minTau = options.minTau ?? 2;
  const threshold = options.threshold ?? 0.1;
  const d = yinDifference(x, maxTau);
  const dp = yinCMND(d);
  const tau = yinPickTau(dp, threshold, minTau, maxTau);
  const refinedTau = parabolicRefine(dp, tau);
  return { tau, refinedTau, frequency: fs / refinedTau, clarity: 1 - dp[tau] };
}

// Cent — đơn vị đo cao độ theo LOG, đúng cách tai người cảm nhận quãng
// (Mục 13.4): $1200 \log_2(f/f_{ref})$ — 1 quãng tám (tần số gấp đôi) LUÔN
// bằng đúng 1200 cent bất kể vị trí trên bàn phím, khác hẳn thang Hz tuyến
// tính (1 quãng tám ở âm trầm là vài Hz, ở âm cao là hàng trăm Hz).
function centsFromFreq(f, fRef) {
  return 1200 * Math.log2(f / fRef);
}

// Đổi tần số Hz sang nốt nhạc gần nhất (chuẩn 12-TET, A4=440Hz=MIDI 69) +
// độ lệch cent so với đúng tâm nốt — chính là "kim chỉ nốt" của tuner Mục 13.5.
function freqToNote(f, fRef = 440, refMidi = 69) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = refMidi + 12 * Math.log2(f / fRef);
  const rounded = Math.round(midi);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  const cents = (midi - rounded) * 100;
  return { note: names[noteIndex], octave, cents, midi };
}

// ---------------------------------------------------------------------------
// Bài 14 — DSP thời gian thực & trên phần cứng nhúng. Build-out: mô phỏng
// Q15 (số nguyên 16-bit với dấu phẩy TƯỞNG TƯỢNG sau bit dấu — MCU không FPU
// nhân float bằng phần mềm chậm gấp chục lần, xem Mục 14.3), firQ15 (áp
// dụng Q15 lên FIR — demo nghe/đo SNR Mục 14.5), và biquadDF2TBlock (biquad
// GIỮ trạng thái $z_1,z_2$ qua ranh giới block — đối chứng trực tiếp với
// biquadDF2T() của Bài 11 vốn LUÔN reset trạng thái mỗi lần gọi, chính là
// pitfall "click chu kỳ đều đặn" của Mục 14.2 khi dùng sai trong xử lý
// theo khối).
// ---------------------------------------------------------------------------

const Q15_ONE = 32768;
const Q15_MAX_FLOAT = 0.999969482421875; // (32767/32768) - so gan +1 lon nhat Q15 bieu dien duoc

// Đổi số thực (giả định trong [-1,1)) sang Q15 — số nguyên 16-bit, CẮT NGẮN
// (clamp) nếu vượt phạm vi biểu diễn được (Mục 14.3: "cái giá là nhiễu lượng
// tử HỆ SỐ" — chính là quantize() của Bài 3 áp cho đúng phạm vi Q15).
function floatToQ15(x) {
  const clamped = Math.max(-1, Math.min(Q15_MAX_FLOAT, x));
  return Math.round(clamped * Q15_ONE);
}

// Đổi ngược Q15 sang số thực.
function q15ToFloat(q) {
  return q / Q15_ONE;
}

// Bão hoà (saturate) về đúng phạm vi int16 — MCU thật KHÔNG cho tràn số âm
// thầm quấn vòng (wrap-around) như số nguyên C thường, mà giữ nguyên tại
// biên (saturating arithmetic), tránh tiếng "nổ" digital khi vượt phạm vi.
function satQ15(x) {
  return Math.max(-32768, Math.min(32767, x));
}

// Nhân 2 số Q15: tích của 2 số Q15 ra Q30 (gấp đôi số bit thập phân) — phải
// dịch phải 15 bit ($\div 2^{15}$) để đưa VỀ LẠI Q15, rồi bão hoà. Đây chính
// là `(a*b)>>15` nhắc trong Mục 14.3, viết bằng phép chia làm tròn (JS
// không có toán tử dịch bit cho số lớn hơn 32-bit an toàn tuyệt đối).
function q15Mul(a, b) {
  return satQ15(Math.round((a * b) / Q15_ONE));
}

// Cộng 2 số Q15 kèm bão hoà.
function q15Add(a, b) {
  return satQ15(a + b);
}

// FIR chạy bằng số học Q15 mô phỏng (Mục 14.3/14.5): lượng tử hoá TAP về
// Q15 một lần, lượng tử hoá TỪNG MẪU đầu vào, nhân-cộng-dồn (accumulate)
// trong phạm vi số nguyên rộng (đúng tinh thần thanh ghi tích luỹ 32-bit
// trên MCU thật), rồi bão hoà + đưa về Q15 ở cuối mỗi mẫu ra.
function firQ15(x, hFloat) {
  const hQ15 = hFloat.map(floatToQ15);
  const y = new Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let acc = 0;
    for (let k = 0; k < hQ15.length; k++) {
      if (n - k >= 0) acc += hQ15[k] * floatToQ15(x[n - k]);
    }
    y[n] = q15ToFloat(satQ15(Math.round(acc / Q15_ONE)));
  }
  return y;
}

// Biquad DF2T GIỮ trạng thái $z_1,z_2$ QUA ranh giới lời gọi (Mục 14.2):
// nhận vào 1 object `state` (được SỬA TRỰC TIẾP — mang trạng thái sang lần
// gọi kế), khác hẳn biquadDF2T() của Bài 11 vốn khởi tạo $z_1=z_2=0$ MỖI
// LẦN gọi. Xử lý 1 tín hiệu dài theo TỪNG BLOCK bằng biquadDF2T() (SAI —
// reset trạng thái mỗi block) tạo ra "click" tại mọi ranh giới block; dùng
// đúng hàm này (state sống xuyên block) mới khớp TUYỆT ĐỐI với xử lý 1 lần
// nguyên khối — verified bằng self-test Mục 14.2.
function biquadDF2TBlock(x, coeffs, state) {
  const { b0, b1, b2, a1, a2 } = coeffs;
  let z1 = state.z1;
  let z2 = state.z2;
  const y = new Array(x.length);
  for (let n = 0; n < x.length; n++) {
    const xn = x[n];
    const yn = b0 * xn + z1;
    z1 = b1 * xn - a1 * yn + z2;
    z2 = b2 * xn - a2 * yn;
    y[n] = yn;
  }
  state.z1 = z1;
  state.z2 = z2;
  return y;
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
  sampleContinuous,
  aliasFrequencySigned,
  aliasFrequency,
  quantize,
  sqnrDbTheoretical,
  measuredSqnrDb,
  quantizeWithDither,
  amplitudeToDbfs,
  hardClip,
  convolve,
  synthesizeRoomIR,
  dft,
  complexMagnitude,
  complexPhase,
  dftMagnitude,
  dftPhase,
  binFrequency,
  frequencyResolution,
  idft,
  bitReverse,
  fft,
  ifft,
  zeroPad,
  dftMultiplyCount,
  fftMultiplyCount,
  complexityRatio,
  rectWindow,
  hannWindow,
  hammingWindow,
  blackmanWindow,
  applyWindow,
  coherentGain,
  compensatedMagnitude,
  sideLobeLevelDb,
  stft,
  magnitudeToDb,
  stftMagnitudeDb,
  dbToColor,
  sinc,
  firLowpassDesign,
  firHighpassDesign,
  firBandpassDesign,
  firGroupDelay,
  firFrequencyResponse,
  complexAdd,
  complexSub,
  complexMul,
  complexDiv,
  polyFromRoots,
  freqRespFromPZ,
  polesStable,
  iirFilterDirect,
  quadraticRoots,
  biquadPoles,
  biquadZeros,
  biquadCoeffsRBJ,
  biquadDF2T,
  gcdInt,
  upsampleZeroStuff,
  downsampleNaive,
  decimate,
  interpolate,
  resampleRational,
  autocorrFFT,
  yinDifference,
  yinCMND,
  yinPickTau,
  parabolicRefine,
  yinPitch,
  centsFromFreq,
  freqToNote,
  floatToQ15,
  q15ToFloat,
  satQ15,
  q15Mul,
  q15Add,
  firQ15,
  biquadDF2TBlock,
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

  // --- Bài 2: sampleContinuous, aliasFrequency (có dấu & trị tuyệt đối) ---
  {
    const sampled = sampleContinuous((t) => Math.sin(2 * Math.PI * 1000 * t), 8, 8000);
    checkTrue(
      'sampleContinuous khớp đúng công thức x[n] = x(nT) của Bài 1',
      sampled.every((v, n) => Math.abs(v - sine(n, 1000, 8000)) < 1e-9)
    );

    check('alias(6000Hz @ 8000Hz) trị tuyệt đối = 2000Hz (gập qua Nyquist 4000Hz)', aliasFrequency(6000, 8000), 2000);
    check('alias(6000Hz @ 8000Hz) CÓ DẤU = -2000 (quay/dao động NGƯỢC chiều)', aliasFrequencySigned(6000, 8000), -2000);
    check('alias(9000Hz @ 8000Hz) = 1000Hz (không cần gập, chỉ cuộn vòng)', aliasFrequency(9000, 8000), 1000);
    check('alias(9000Hz @ 8000Hz) CÓ DẤU = +1000 (vẫn THUẬN chiều)', aliasFrequencySigned(9000, 8000), 1000);
    check('alias(3000Hz @ 8000Hz) = 3000Hz (dưới Nyquist, không đổi)', aliasFrequency(3000, 8000), 3000);

    // Verify pitfall Mục 2.3: tan so GAP (khong phan xa qua Nyquist) cho mau
    // KHOP TUYET DOI voi tan so goc thap hon - khong dao pha.
    checkTrue(
      'Trường hợp cuộn vòng (không phản xạ): mẫu 9000Hz KHỚP TUYỆT ĐỐI mẫu 1000Hz (không đảo pha)',
      [1, 2, 3, 5].every((n) => Math.abs(sine(n, 9000, 8000) - sine(n, 1000, 8000)) < 1e-9)
    );
    // Verify truong hop PHAN XA qua Nyquist: mau BI DAO PHA (dau am) so voi
    // tan so gap - dung mach "banh xe quay nguoc".
    checkTrue(
      'Trường hợp phản xạ qua Nyquist: mẫu 6000Hz = ÂM của mẫu 2000Hz (đảo pha — gốc "bánh xe quay ngược")',
      [1, 2, 3, 5].every((n) => Math.abs(sine(n, 6000, 8000) - -sine(n, 2000, 8000)) < 1e-9)
    );
  }

  // --- Bài 3: quantize, SQNR lý thuyết vs đo thật, dither ---
  {
    check('quantize(0.5, 16-bit) = 0.5 (bội số chẵn của LSB, không sai số)', quantize(0.5, 16), 0.5);
    check('quantize(0.3, 4-bit) = 0.25 (levels=8, 0.3*8=2.4 → làm tròn 2 → 2/8)', quantize(0.3, 4), 0.25);
    check('quantize(0.3, 2-bit) = 0.5 (levels=2, 0.3*2=0.6 → làm tròn 1 → 1/2)', quantize(0.3, 2), 0.5);
    check('quantize(1.5, 8-bit) bị kẹp về 1 (vượt fullScale=1 mặc định)', quantize(1.5, 8), 1);

    checkTrue('dBFS(1.0) = 0dBFS (full scale luôn là mốc 0dB tham chiếu)', Math.abs(amplitudeToDbfs(1) - 0) < 1e-9);
    checkTrue(
      'dBFS(0.5) = -6,02dBFS (đúng quy tắc 6dB/lần giảm biên độ một nửa)',
      Math.abs(amplitudeToDbfs(0.5) - -6.02) < 0.01
    );
    checkTrue('dBFS(0.25) = -12,04dBFS (giảm thêm 6dB nữa)', Math.abs(amplitudeToDbfs(0.25) - -12.04) < 0.01);
    check('hardClip(1.5) bị cắt phẳng về 1 (tràn thang dương)', hardClip(1.5), 1);
    check('hardClip(-1.5) bị cắt phẳng về -1 (tràn thang âm)', hardClip(-1.5), -1);
    check('hardClip(0.5) giữ nguyên (chưa vượt ngưỡng)', hardClip(0.5), 0.5);

    checkTrue('SQNR lý thuyết 16-bit ≈ 98,08dB (quy tắc 6,02B+1,76)', Math.abs(sqnrDbTheoretical(16) - 98.08) < 0.01);
    checkTrue('SQNR lý thuyết 8-bit ≈ 49,92dB', Math.abs(sqnrDbTheoretical(8) - 49.92) < 0.01);
    checkTrue('SQNR lý thuyết 4-bit ≈ 25,84dB', Math.abs(sqnrDbTheoretical(4) - 25.84) < 0.01);

    // Do that tren tin hieu sine 440Hz bien do 0.9 (44100Hz, 4410 mau = 0.1s)
    // - phai kham sat rat gan cong thuc ly thuyet cho ca 3 muc bit.
    const testSignal = [];
    for (let n = 0; n < 4410; n++) testSignal.push(sine(n, 440, 44100, 0.9));
    checkTrue(
      'SQNR đo thật 16-bit khớp lý thuyết trong sai số 1dB (verified: ~97,4dB vs ~98,1dB)',
      Math.abs(measuredSqnrDb(testSignal, 16) - sqnrDbTheoretical(16)) < 1
    );
    checkTrue(
      'SQNR đo thật 8-bit khớp lý thuyết trong sai số 1dB',
      Math.abs(measuredSqnrDb(testSignal, 8) - sqnrDbTheoretical(8)) < 1
    );
    checkTrue(
      'SQNR đo thật 4-bit khớp lý thuyết trong sai số 1dB — quy tắc 6dB/bit ĐÚNG với số liệu thật',
      Math.abs(measuredSqnrDb(testSignal, 4) - sqnrDbTheoretical(4)) < 1
    );

    checkTrue(
      'quantizeWithDither nằm trong đúng dải lượng tử hợp lệ [-1, 1]',
      Array.from({ length: 50 }, (_, n) => quantizeWithDither(0.3, 4, 1, n)).every((v) => v >= -1 && v <= 1)
    );
    checkTrue(
      'Dither làm sai số lượng tử THAY ĐỔI theo từng mẫu (phá tương quan) thay vì lặp lại y hệt như không dither',
      new Set(Array.from({ length: 50 }, (_, n) => quantizeWithDither(0.3, 4, 1, n).toFixed(6))).size > 1
    );

    // Verify loi ich THAT cua dither: mot gia tri DC dung o giua 2 muc luong
    // tu (4-bit, buoc=0.125, x=0.1875 = 1 buoc + nua buoc - truong hop TE
    // NHAT cho quantize thuong). Khong dither: luon ra CUNG 1 muc co dinh,
    // sai so co dinh = nua buoc. Co dither: trung binh qua nhieu mau xap xi
    // gia tri that GAN HON HAN nho "trai deu" giua 2 muc ke nhau.
    {
      const worstCaseX = 0.1875;
      const plainError = Math.abs(quantize(worstCaseX, 4) - worstCaseX);
      const ditherSamples = Array.from({ length: 200 }, (_, n) => quantizeWithDither(worstCaseX, 4, 1, n));
      const ditherAvg = ditherSamples.reduce((a, b) => a + b, 0) / ditherSamples.length;
      const ditherAvgError = Math.abs(ditherAvg - worstCaseX);
      checkTrue(
        'Verified lợi ích dither: KHÔNG dither luôn cho đúng 1 mức cố định (sai số cố định = nửa LSB = 0,0625)',
        Math.abs(plainError - 0.0625) < 1e-9
      );
      checkTrue(
        'Verified lợi ích dither: trung bình 200 mẫu CÓ dither xấp xỉ giá trị thật gần hơn HẲN (sai số giảm >10 lần)',
        ditherAvgError < plainError / 10
      );
    }
  }

  // --- Bài 4: convolve, tính chất hệ LTI ---
  {
    check(
      'convolve([1,2,3],[1,1]) = [1,3,5,3] (lật-dịch-nhân-cộng làm tay)',
      convolve([1, 2, 3], [1, 1]).join(','),
      '1,3,5,3'
    );
    checkTrue(
      'Tích chập GIAO HOÁN: convolve(x,h) = convolve(h,x)',
      convolve([1, 2, 3], [1, 1]).join(',') === convolve([1, 1], [1, 2, 3]).join(',')
    );
    check('Độ dài kết quả tích chập = N+M-1 (3 mẫu * 2 mẫu = 4 mẫu)', convolve([1, 2, 3], [1, 1]).length, 4);

    // Chap voi xung don vi = phep dong nhat (dich theo vi tri xung) - Muc 4.2
    const x4 = [4, 7, 2, 9];
    const delta = [0, 1, 0, 0, 0].map((_, i) => unitImpulse(i, 1));
    check(
      'Tích chập với xung đơn vị dịch (δ[n-1]) = tín hiệu gốc dịch đúng 1 mẫu',
      convolve(x4, delta).join(','),
      '0,4,7,2,9,0,0,0'
    );

    // Tinh ket hop (associativity) - dung cho tinh chat ghep noi tiep Muc 4.4:
    // chap 2 tang loc = chap voi TICH CHAP cua 2 dap ung xung.
    const h1 = [0.5, 0.3, 0.1];
    const h2 = [1, -0.2];
    const testSig2 = Array.from({ length: 20 }, (_, i) => whiteNoise(i, 1, 7));
    const seriesStepByStep = convolve(convolve(testSig2, h1), h2);
    const seriesCombinedH = convolve(testSig2, convolve(h1, h2));
    checkTrue(
      'Ghép nối tiếp 2 bộ lọc = chập với TÍCH CHẬP của 2 đáp ứng xung (tính kết hợp, Mục 4.4)',
      seriesStepByStep.every((v, i) => Math.abs(v - seriesCombinedH[i]) < 1e-9)
    );

    // Tong hop dap ung xung phong - dung cho demo reverb Muc 4.5
    const roomIR = synthesizeRoomIR(0.05, 8000, 0.02, 3);
    check('synthesizeRoomIR trả về đúng số mẫu (0,05s @ 8000Hz = 400 mẫu)', roomIR.length, 400);
    checkTrue(
      'Đáp ứng xung phòng TẮT DẦN theo thời gian (biên độ trung bình nửa sau nhỏ hơn hẳn nửa đầu)',
      signalPower(roomIR.slice(0, 200)) > signalPower(roomIR.slice(200))
    );
  }

  // --- Bài 5: dft, complex helpers, binFrequency, frequencyResolution ---
  {
    // Sine 1000Hz @ 8000Hz, N=8 mau (dung 1 chu ky tron ven, k=1 -> 1000Hz).
    const N = 8;
    const fs = 8000;
    const sig = Array.from({ length: N }, (_, n) => sine(n, 1000, fs));
    const X = dft(sig);

    check('dft() tra ve dung so bin = do dai tin hieu (N=8)', X.length, N);
    checkTrue(
      'Bin k=1 (1000Hz) co bien do dinh = N/2 = 4 (dung ly thuyet cho sine bien do 1)',
      Math.abs(complexMagnitude(X[1]) - 4) < 1e-9
    );
    checkTrue(
      'Bin k=7 (bin doi xung lien hop, N-1) CUNG co bien do = 4 (doi xung lien hop cua tin hieu thuc)',
      Math.abs(complexMagnitude(X[7]) - 4) < 1e-9
    );
    checkTrue(
      'Cac bin con lai (k=0,2,3,4,5,6) gan bang 0 (khong nang luong ngoai dung tan so 1000Hz)',
      [0, 2, 3, 4, 5, 6].every((k) => complexMagnitude(X[k]) < 1e-9)
    );
    checkTrue(
      'Pha bin k=1 = -pi/2 (dung cho sine thuan, pha ban dau = 0)',
      Math.abs(complexPhase(X[1]) - -Math.PI / 2) < 1e-9
    );
    checkTrue(
      'Pha bin k=7 = +pi/2 (doi dau so voi k=1 - doi xung lien hop)',
      Math.abs(complexPhase(X[7]) - Math.PI / 2) < 1e-9
    );

    // Tin hieu DC (hang so) - X[0] phai dung bang tong tat ca mau = N * DC.
    const dc = Array.from({ length: N }, () => 2);
    const Xdc = dft(dc);
    checkTrue('DFT tin hieu DC=2: X[0] = N*DC = 16 (dung tong Sigma x[n])', Math.abs(Xdc[0].re - 16) < 1e-9);
    check('DFT tin hieu DC: phan ao X[0] = 0 (tin hieu thuc, doi xung)', Math.round(Xdc[0].im), 0);

    // binFrequency & frequencyResolution - dung cong thuc f_k = k*fs/N.
    check('binFrequency(1, 8, 8000) = 1000Hz (khop dung bin dinh o tren)', binFrequency(1, N, fs), 1000);
    check('binFrequency(0, 8, 8000) = 0Hz (bin DC)', binFrequency(0, N, fs), 0);
    check('frequencyResolution(8000, 8) = 1000Hz/bin (fs/N)', frequencyResolution(fs, N), 1000);
    checkTrue(
      'Muon do phan giai 1Hz phai lay N=fs mau (vd fs=8000 -> N=8000 mau, dung Muc 5.3)',
      frequencyResolution(8000, 8000) === 1
    );

    // dftMagnitude/dftPhase phai khop tung phan tu voi goi complexMagnitude/complexPhase truc tiep.
    checkTrue(
      'dftMagnitude() khop tung bin voi complexMagnitude() goi truc tiep',
      dftMagnitude(X).every((m, k) => m === complexMagnitude(X[k]))
    );
    checkTrue(
      'dftPhase() khop tung bin voi complexPhase() goi truc tiep',
      dftPhase(X).every((p, k) => p === complexPhase(X[k]))
    );

    // idft(dft(x)) phai khop lai dung tin hieu goc (verify nghich dao).
    const N2 = 16;
    const fs2 = 16;
    const sig2 = Array.from({ length: N2 }, (_, n) => sine(n, 3, fs2, 0.7) + sine(n, 5, fs2, 0.3));
    const reconstructed = idft(dft(sig2));
    checkTrue(
      'idft(dft(x)) khop lai dung tin hieu goc, sai so < 1e-9 (verify nghich dao dung)',
      reconstructed.every((v, n) => Math.abs(v - sig2[n]) < 1e-9)
    );

    // Thi nghiem trao pha (Muc 5.4 pitfall): 2 chirp bang thong rong quet
    // nguoc chieu nhau - ghep BIEN DO cua A voi PHA cua B, dung lai tin hieu
    // GIONG HET tin hieu PHA (B), gan nhu KHONG lien quan tin hieu BIEN DO (A)
    // - verify bang so that pha moi la thu mang "dang song"/cau truc, khong
    // phai bien do.
    {
      const N3 = 400;
      const fs3 = 400;
      const sigA = Array.from({ length: N3 }, (_, n) => chirp(n, 10, 150, N3, fs3, 0.9));
      const sigB = Array.from({ length: N3 }, (_, n) => chirp(n, 150, 10, N3, fs3, 0.9));
      const XA = dft(sigA);
      const XB = dft(sigB);
      const magA = dftMagnitude(XA);
      const phaseB = dftPhase(XB);
      const hybrid = magA.map((m, k) => ({ re: m * Math.cos(phaseB[k]), im: m * Math.sin(phaseB[k]) }));
      const hybridSignal = idft(hybrid);

      function correlate(a, b) {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
          dot += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        return dot / Math.sqrt(normA * normB);
      }

      checkTrue(
        'Trao pha: hybrid (bien do A + pha B) trung KHOP GAN TUYET DOI voi tin hieu CHO PHA (B), tuong quan > 0,999',
        correlate(hybridSignal, sigB) > 0.999
      );
      checkTrue(
        'Trao pha: hybrid GAN NHU KHONG lien quan tin hieu CHO BIEN DO (A), tuong quan < 0,1 — pha moi la thu mang cau truc/dang song, khong phai bien do',
        Math.abs(correlate(hybridSignal, sigA)) < 0.1
      );
    }
  }

  // --- Bài 6: FFT radix-2 (iterative in-place) ---
  {
    // bitReverse: N=8 (numBits=3) — vai gia tri kiem chung tay
    check('bitReverse(0,3) = 0', bitReverse(0, 3), 0);
    check('bitReverse(1,3) = 4 (001 -> 100)', bitReverse(1, 3), 4);
    check('bitReverse(3,3) = 6 (011 -> 110)', bitReverse(3, 3), 6);
    check('bitReverse(7,3) = 7 (111 -> 111, doi xung)', bitReverse(7, 3), 7);

    // VERIFY bat buoc cua bai: FFT === DFT tung con so, sai so < 1e-10
    function maxComplexDiff(A, B) {
      let maxDiff = 0;
      for (let i = 0; i < A.length; i++) {
        const dRe = Math.abs(A[i].re - B[i].re);
        const dIm = Math.abs(A[i].im - B[i].im);
        maxDiff = Math.max(maxDiff, dRe, dIm);
      }
      return maxDiff;
    }

    const sigN8 = [1, 2, 3, 4, 5, 6, 7, 8];
    const dftN8 = dft(sigN8);
    const fftN8 = fft(sigN8);
    checkTrue('FFT === DFT tung con so voi N=8 (sai so < 1e-10)', maxComplexDiff(dftN8, fftN8) < 1e-10);

    const sigN16 = Array.from({ length: 16 }, (_, n) => sine(n, 2000, 16000));
    const dftN16 = dft(sigN16);
    const fftN16 = fft(sigN16);
    checkTrue(
      'FFT === DFT tung con so voi N=16, tin hieu sine that (sai so < 1e-10)',
      maxComplexDiff(dftN16, fftN16) < 1e-10
    );

    checkTrue(
      'FFT nem loi khi N khong phai luy thua 2 (N=6)',
      (() => {
        try {
          fft([1, 2, 3, 4, 5, 6]);
          return false;
        } catch (e) {
          return true;
        }
      })()
    );

    // IFFT: khu hoi dung tin hieu goc
    const roundTrip = ifft(fft(sigN8));
    checkTrue(
      'ifft(fft(x)) khu hoi dung x ban dau (sai so < 1e-9)',
      roundTrip.every((c, i) => Math.abs(c.re - sigN8[i]) < 1e-9 && Math.abs(c.im) < 1e-9)
    );

    // Dem phep nhan: N=1024, DFT ~1 trieu, FFT ~5 nghin, ty le ~100 lan
    check('dftMultiplyCount(1024) = 1.048.576 (1024^2)', dftMultiplyCount(1024), 1048576);
    check('fftMultiplyCount(1024) = 5120 ((1024/2)*log2(1024))', fftMultiplyCount(1024), 5120);
    checkTrue(
      'complexityRatio(1024) = 102,4 (~100 lan, dung so lam tron cua bai)',
      Math.abs(complexityRatio(1024) - 102.4) < 1e-9
    );

    // zeroPad: noi suy pho muot hon, KHONG them thong tin
    const padded = zeroPad([1, 2, 3, 4], 8);
    check('zeroPad giu dung do dai targetLength', padded.length, 8);
    checkTrue(
      'zeroPad giu nguyen 4 mau dau, 4 mau sau la 0',
      padded[0] === 1 && padded[1] === 2 && padded[2] === 3 && padded[3] === 4 && padded[4] === 0 && padded[7] === 0
    );
  }

  // --- Bài 7: Rò rỉ phổ & hàm cửa sổ ---
  {
    const N = 64;
    const rw = rectWindow(N);
    const hw = hannWindow(N);
    const hmw = hammingWindow(N);
    const bw = blackmanWindow(N);

    // Hinh dang co ban: rect toan 1; Hann/Blackman = 0 tai 2 dau mut
    checkTrue(
      'rectWindow: toàn bộ đều = 1 (không sửa gì)',
      rw.every((v) => v === 1)
    );
    checkTrue('hannWindow: 2 đầu mút = 0 (mượt về 0)', Math.abs(hw[0]) < 1e-9 && Math.abs(hw[N - 1]) < 1e-9);
    checkTrue('blackmanWindow: 2 đầu mút ≈ 0', Math.abs(bw[0]) < 1e-6 && Math.abs(bw[N - 1]) < 1e-6);
    checkTrue(
      'hammingWindow: 2 đầu mút ≈ 0,08 (KHÔNG về 0 hẳn - khác Hann)',
      Math.abs(hmw[0] - 0.08) < 1e-9 && Math.abs(hmw[N - 1] - 0.08) < 1e-9
    );

    // Coherent gain (Muc 7.4) - so voi so lieu kinh dien cua tung loai cua so
    checkTrue('coherentGain(rect) = 1,0 (không ăn gì)', Math.abs(coherentGain(rw) - 1.0) < 1e-9);
    checkTrue('coherentGain(hann) ≈ 0,5 (verified thật)', Math.abs(coherentGain(hw) - 0.5) < 0.02);
    checkTrue('coherentGain(hamming) ≈ 0,53-0,54 (verified thật)', Math.abs(coherentGain(hmw) - 0.53) < 0.02);
    checkTrue('coherentGain(blackman) ≈ 0,41-0,42 (verified thật)', Math.abs(coherentGain(bw) - 0.42) < 0.02);

    // Side lobe level (dB, Muc 7.3) - do bang chinh FFT cua cua so, so sanh
    // dung thu tu kinh dien: rect > Hann > Hamming > Blackman (cang am cang tot)
    const sideLobeRect = sideLobeLevelDb(rw);
    const sideLobeHann = sideLobeLevelDb(hw);
    const sideLobeHamming = sideLobeLevelDb(hmw);
    const sideLobeBlackman = sideLobeLevelDb(bw);
    checkTrue('Side lobe rect ≈ -13dB (verified thật)', Math.abs(sideLobeRect - -13.3) < 1);
    checkTrue('Side lobe Hann ≈ -31dB (verified thật, thấp hơn hẳn rect)', Math.abs(sideLobeHann - -31.5) < 1);
    checkTrue('Side lobe Hamming ≈ -42dB (verified thật)', Math.abs(sideLobeHamming - -42) < 1.5);
    checkTrue('Side lobe Blackman ≈ -58dB (thấp NHẤT trong 4 loại)', Math.abs(sideLobeBlackman - -58) < 1.5);
    checkTrue(
      'Đúng thứ tự kinh điển: rect > Hann > Hamming > Blackman (số càng âm càng ít rò rỉ)',
      sideLobeRect > sideLobeHann && sideLobeHann > sideLobeHamming && sideLobeHamming > sideLobeBlackman
    );

    // Leakage that: sine KHONG roi dung vao 1 bin (10.5 chu ky trong N mau)
    // - do nang luong "ro ri" toi 1 bin XA, chung minh Hann ro ri IT HON rect
    const N2 = 256;
    const leakySignal = Array.from({ length: N2 }, (_, n) => Math.sin((2 * Math.PI * 10.5 * n) / N2));
    const rectMag = dftMagnitude(dft(applyWindow(leakySignal, rectWindow(N2))));
    const hannMag = dftMagnitude(dft(applyWindow(leakySignal, hannWindow(N2))));
    const farBin = 40; // xa hon nhieu so voi vi tri tin hieu (bin ~10-11)
    checkTrue(
      'Rò rỉ tại bin XA (bin 40, tín hiệu ở bin ~10.5): cửa sổ Hann rò rỉ ÍT HƠN cửa sổ rect',
      hannMag[farBin] < rectMag[farBin]
    );

    // compensatedMagnitude: bu dung coherent gain, khoi phuc bien do gan dung
    // gia tri KHONG cua so (rect) cho tin hieu sine RƠI ĐÚNG VÀO 1 bin.
    const N3 = 64;
    const binAlignedSignal = Array.from({ length: N3 }, (_, n) => Math.sin((2 * Math.PI * 4 * n) / N3));
    const rectPeak = dftMagnitude(dft(applyWindow(binAlignedSignal, rectWindow(N3))))[4];
    const hannWin = hannWindow(N3);
    const hannRawPeak = dftMagnitude(dft(applyWindow(binAlignedSignal, hannWin)))[4];
    const hannCompensatedPeak = compensatedMagnitude([hannRawPeak], hannWin)[0];
    checkTrue(
      'compensatedMagnitude: sau khi bù coherent gain, đỉnh Hann gần với đỉnh rect hơn RẤT NHIỀU so với trước khi bù',
      Math.abs(hannCompensatedPeak - rectPeak) < Math.abs(hannRawPeak - rectPeak)
    );
  }

  // --- Bài 8: STFT & Spectrogram ---
  {
    const frameSize = 64;
    const hopSize = 32;
    const totalLen = 256;
    const testSignal = Array.from({ length: totalLen }, (_, n) => sine(n, 1000, 8000));

    const frames = stft(testSignal, hannWindow, frameSize, hopSize);
    const expectedNumFrames = Math.floor((totalLen - frameSize) / hopSize) + 1;
    check('stft: số khung đúng công thức floor((len-frameSize)/hopSize)+1', frames.length, expectedNumFrames);
    check('stft: mỗi khung có đúng frameSize bin phổ', frames[0].length, frameSize);

    // Xac nhan tung khung DUNG BANG fft(applyWindow(...)) tinh thu cong -
    // stft() khong duoc "bay dat" logic rieng khac voi cac ham da verify
    const win = hannWindow(frameSize);
    const manualFrame1 = fft(applyWindow(testSignal.slice(0, frameSize), win));
    checkTrue(
      'stft: khung đầu tiên khớp CHÍNH XÁC với fft(applyWindow(...)) tính thủ công',
      manualFrame1.every((c, i) => Math.abs(c.re - frames[0][i].re) < 1e-9 && Math.abs(c.im - frames[0][i].im) < 1e-9)
    );
    const frameIdx2 = 2;
    const manualFrame3 = fft(applyWindow(testSignal.slice(frameIdx2 * hopSize, frameIdx2 * hopSize + frameSize), win));
    checkTrue(
      'stft: khung thứ 3 (chồng lấp) cũng khớp chính xác — xác nhận hopSize dùng đúng',
      manualFrame3.every(
        (c, i) => Math.abs(c.re - frames[frameIdx2][i].re) < 1e-9 && Math.abs(c.im - frames[frameIdx2][i].im) < 1e-9
      )
    );

    // magnitudeToDb: chan san dung floorDb, khong bao gio ra -Infinity
    const dbZero = magnitudeToDb([0, 1], -100);
    check('magnitudeToDb(0) bị chặn sàn đúng floorDb=-100 (KHÔNG ra -Infinity)', dbZero[0], -100);
    checkTrue('magnitudeToDb(1) = 20*log10(1) ≈ 0dB', Math.abs(dbZero[1] - 0) < 1e-6);

    // stftMagnitudeDb: so cot = so khung, so hang = frameSize (chua cat nua pho)
    const spectrogramDb = stftMagnitudeDb(frames);
    check('stftMagnitudeDb: số cột = số khung', spectrogramDb.length, frames.length);
    check('stftMagnitudeDb: số hàng mỗi cột = frameSize', spectrogramDb[0].length, frameSize);

    // dbToColor: clamp dung 2 dau, khong tran ra ngoai [0,255]
    checkTrue('dbToColor(sàn hoặc thấp hơn) toàn màu tối (r=0)', dbToColor(-100, -100, 0)[0] === 0);
    checkTrue('dbToColor(dưới sàn xa) vẫn clamp về giống hệt sàn, không âm', dbToColor(-999, -100, 0)[0] === 0);
    const peakColor = dbToColor(0, -100, 0);
    checkTrue('dbToColor(đỉnh 0dB) cho màu sáng nhất (r và g đều cao)', peakColor[0] >= 250 && peakColor[1] >= 250);
  }

  // --- Bài 9: Filter FIR windowed-sinc ---
  {
    check('sinc(0) = 1 (giới hạn, không chia 0)', sinc(0), 1);
    checkTrue('sinc(1) ≈ 0 (điểm không đầu tiên của sinc)', Math.abs(sinc(1)) < 1e-9);
    checkTrue('sinc(0.5) = 2/π ≈ 0,6366', Math.abs(sinc(0.5) - 2 / Math.PI) < 1e-9);

    const numTaps = 51;
    const cutoff = 0.1;
    const lp = firLowpassDesign(numTaps, cutoff, hannWindow);
    check('firLowpassDesign: đúng số tap yêu cầu', lp.length, numTaps);

    // Doi xung (linear phase, Muc 9.3) - CHINH LA dieu kien toan hoc dam bao
    // group delay hang so voi MOI tan so, khong chi mot tuyen bo suong.
    let maxAsymmetry = 0;
    for (let i = 0; i < numTaps; i++) maxAsymmetry = Math.max(maxAsymmetry, Math.abs(lp[i] - lp[numTaps - 1 - i]));
    checkTrue(
      'firLowpassDesign: đối xứng hoàn hảo h[i] = h[N-1-i] (sai số < 1e-9) — đảm bảo linear phase',
      maxAsymmetry < 1e-9
    );

    check('firGroupDelay(51) = 25 mẫu ((51-1)/2)', firGroupDelay(51), 25);

    // Dap ung tan so that: DC ~1 (thong dai), cutoff ~0.5 (diem -6dB kinh
    // dien cua windowed-sinc), stopband gan 0 (chan tot)
    const H = firFrequencyResponse(lp, 4096);
    const mag = dftMagnitude(H);
    const binAt = (f) => Math.round(f * 4096);
    checkTrue('Lowpass: đáp ứng tại DC ≈ 1 (dải thông không suy hao)', Math.abs(mag[0] - 1) < 0.01);
    checkTrue('Lowpass: đáp ứng tại tần số cắt ≈ 0,5 (điểm -6dB kinh điển)', Math.abs(mag[binAt(0.1)] - 0.5) < 0.02);
    checkTrue('Lowpass: đáp ứng ở dải chặn (f=0,2, xa cutoff) rất nhỏ (<0,001 — chặn tốt)', mag[binAt(0.2)] < 0.001);
    checkTrue('Lowpass: đáp ứng gần Nyquist (f=0,4) gần như triệt tiêu (<0,0001)', mag[binAt(0.4)] < 0.0001);

    // Highpass qua spectral inversion: DC ~0 (chan), gan Nyquist ~1 (thong)
    const hp = firHighpassDesign(numTaps, cutoff, hannWindow);
    checkTrue(
      'firHighpassDesign: cũng đối xứng hoàn hảo (spectral inversion không phá vỡ linear phase)',
      (() => {
        let m = 0;
        for (let i = 0; i < numTaps; i++) m = Math.max(m, Math.abs(hp[i] - hp[numTaps - 1 - i]));
        return m < 1e-9;
      })()
    );
    const Hhp = firFrequencyResponse(hp, 4096);
    const maghp = dftMagnitude(Hhp);
    checkTrue('Highpass: đáp ứng tại DC ≈ 0 (chặn tần số thấp)', maghp[0] < 0.01);
    checkTrue('Highpass: đáp ứng gần Nyquist (f=0,45) ≈ 1 (thông tần số cao)', Math.abs(maghp[binAt(0.45)] - 1) < 0.01);

    // Bandpass qua dich tan: thong o tan so trung tam, chan ca 2 dau
    const bp = firBandpassDesign(numTaps, 0.25, 0.1, hannWindow);
    const Hbp = firFrequencyResponse(bp, 4096);
    const magbp = dftMagnitude(Hbp);
    checkTrue('Bandpass: đáp ứng tại DC nhỏ (chặn)', magbp[0] < 0.01);
    checkTrue('Bandpass: đáp ứng tại tần số trung tâm (f=0,25) ≈ 1 (thông)', Math.abs(magbp[binAt(0.25)] - 1) < 0.02);
    checkTrue('Bandpass: đáp ứng gần Nyquist (f=0,45) nhỏ (chặn)', magbp[binAt(0.45)] < 0.001);

    // Ket noi Muc 9.1: trung binh truot (moving average) la 1 truong hop FIR
    // dac biet - lam min tin hieu nhieu, giam phuong sai ro ret
    function variance(x) {
      const mean = x.reduce((a, b) => a + b, 0) / x.length;
      return x.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / x.length;
    }
    const noisy = Array.from({ length: 200 }, (_, n) => whiteNoise(n, 1, 7));
    const movingAvgH = new Array(8).fill(1 / 8);
    const smoothed = convolve(noisy, movingAvgH);
    checkTrue(
      'Trung bình trượt (FIR đặc biệt): làm GIẢM phương sai rõ rệt so với tín hiệu nhiễu gốc',
      variance(smoothed) < variance(noisy)
    );
  }

  // --- Bài 10: Z-transform & mặt phẳng z ---
  {
    // Da thuc tu nghiem: 1 nghiem thuc
    const c1 = polyFromRoots([{ re: 0.5, im: 0 }]);
    check('polyFromRoots([0.5]): c0 = 1', c1[0].re, 1);
    checkTrue('polyFromRoots([0.5]): c1 = -0.5', Math.abs(c1[1].re - -0.5) < 1e-9);

    // Da thuc tu nghiem: 1 cap lien hop phuc (r=0.7, theta=pi/3) - he so
    // KET QUA phai la SO THUC (phan ao ~0), dung cong thuc kinh dien
    // c1 = -2r*cos(theta), c2 = r^2
    const r = 0.7;
    const theta = Math.PI / 3;
    const pPair = [
      { re: r * Math.cos(theta), im: r * Math.sin(theta) },
      { re: r * Math.cos(theta), im: -r * Math.sin(theta) },
    ];
    const c2 = polyFromRoots(pPair);
    checkTrue(
      'polyFromRoots(cặp liên hợp): phần ảo của MỌI hệ số ≈ 0 (kết quả là số thực)',
      c2.every((c) => Math.abs(c.im) < 1e-9)
    );
    checkTrue('polyFromRoots(cặp liên hợp): c1 = -2r·cos(θ)', Math.abs(c2[1].re - -2 * r * Math.cos(theta)) < 1e-9);
    checkTrue('polyFromRoots(cặp liên hợp): c2 = r²', Math.abs(c2[2].re - r * r) < 1e-9);

    // Dap ung tan so bang HINH HOC (Muc 10.3) - doi chieu voi cong thuc dai
    // so truc tiep cua he 1-pole don gian H(z) = 1/(1 - 0.5 z^-1)
    const resp = freqRespFromPZ([], [{ re: 0.5, im: 0 }], 1, 5);
    checkTrue('freqRespFromPZ: tại ω=0, |H|=1/(1-0,5)=2 (verified)', Math.abs(resp[0].magnitude - 2) < 1e-9);
    checkTrue('freqRespFromPZ: tại ω=π, |H|=1/(1+0,5)=0,6667 (verified)', Math.abs(resp[4].magnitude - 2 / 3) < 1e-9);

    // On dinh (Muc 10.4): pole TRONG vong tron => on dinh
    checkTrue('polesStable: pole |0,9| < 1 → ổn định', polesStable([{ re: 0.9, im: 0 }]) === true);
    checkTrue('polesStable: pole |1,1| > 1 → KHÔNG ổn định', polesStable([{ re: 1.1, im: 0 }]) === false);
    checkTrue(
      'polesStable: pole đúng trên vòng tròn |1,0| → coi là KHÔNG ổn định nghiêm ngặt',
      polesStable([{ re: 1, im: 0 }]) === false
    );

    // Dap ung xung THAT (Muc 10.4): pole trong/ngoai/tren vong tron
    const impulse = [1, ...new Array(99).fill(0)];
    const yStable = iirFilterDirect(impulse, [1], [1, -0.9]);
    checkTrue('Pole r=0,9 (TRONG vòng tròn): đáp ứng xung TẮT DẦN về gần 0 sau 100 mẫu', Math.abs(yStable[99]) < 0.001);

    const yUnstable = iirFilterDirect(impulse, [1], [1, -1.1]);
    checkTrue('Pole r=1,1 (NGOÀI vòng tròn): đáp ứng xung TĂNG TRƯỞNG MŨ, filter "nổ"', Math.abs(yUnstable[99]) > 1000);

    const yMarginal = iirFilterDirect(impulse, [1], [1, -1.0]);
    checkTrue(
      'Pole r=1,0 (ĐÚNG trên vòng tròn, θ=0): đáp ứng xung ổn định KHÔNG đổi (không tắt, không nổ) = 1',
      Math.abs(yMarginal[99] - 1) < 1e-9
    );

    // Oscillator so (Muc 10.5): cap pole DUNG tren vong tron, theta=pi/4
    // (chu ky dung 8 mau) - dap ung xung dao dong khong tat dan, khong no
    const thetaOsc = Math.PI / 4;
    const poleOscPair = [
      { re: Math.cos(thetaOsc), im: Math.sin(thetaOsc) },
      { re: Math.cos(thetaOsc), im: -Math.sin(thetaOsc) },
    ];
    const aOsc = polyFromRoots(poleOscPair).map((c) => c.re);
    checkTrue(
      'Oscillator: cặp pole trên vòng tròn cho hệ số a THỰC (phần ảo ≈ 0)',
      polyFromRoots(poleOscPair).every((c) => Math.abs(c.im) < 1e-9)
    );
    const yOsc = iirFilterDirect(impulse, [1], aOsc);
    checkTrue(
      'Oscillator: đáp ứng xung có CHU KỲ đúng 8 mẫu (θ=π/4 → chu kỳ 2π/θ=8) — y[8] = y[16]',
      Math.abs(yOsc[8] - yOsc[16]) < 1e-6
    );
    checkTrue(
      'Oscillator: biên độ KHÔNG tắt dần theo thời gian (y[80] gần bằng y[8] về độ lớn)',
      Math.abs(Math.abs(yOsc[80]) - Math.abs(yOsc[8])) < 1e-4
    );
  }

  // --- Bài 11: RBJ cookbook — mag tại tần số cụ thể qua đa thức H(e^jw) ---
  {
    function magAt(c, w) {
      const cw = Math.cos(w);
      const c2w = Math.cos(2 * w);
      const sw = Math.sin(w);
      const s2w = Math.sin(2 * w);
      const nre = c.b0 + c.b1 * cw + c.b2 * c2w;
      const nim = -c.b1 * sw - c.b2 * s2w;
      const dre = 1 + c.a1 * cw + c.a2 * c2w;
      const dim = -c.a1 * sw - c.a2 * s2w;
      return Math.hypot(nre, nim) / Math.hypot(dre, dim);
    }
    const fs = 48000;
    const f0 = 1000;
    const w0 = (2 * Math.PI * f0) / fs;

    const lp = biquadCoeffsRBJ('lowpass', f0, fs, 0.707, 0);
    checkTrue('RBJ lowpass: khuếch đại 1 (0dB) tại DC (ω=0)', Math.abs(magAt(lp, 0) - 1) < 1e-9);
    checkTrue('RBJ lowpass: khuếch đại 0 tại Nyquist (chặn hoàn toàn)', magAt(lp, Math.PI) < 1e-9);

    const hp = biquadCoeffsRBJ('highpass', f0, fs, 0.707, 0);
    checkTrue('RBJ highpass: khuếch đại 0 tại DC (chặn hoàn toàn)', magAt(hp, 0) < 1e-9);
    checkTrue('RBJ highpass: khuếch đại 1 (0dB) tại Nyquist', Math.abs(magAt(hp, Math.PI) - 1) < 1e-9);

    const notch = biquadCoeffsRBJ('notch', f0, fs, 4, 0);
    checkTrue('RBJ notch: khuếch đại ≈0 ĐÚNG tại f0 (khoét sâu tần số mục tiêu)', magAt(notch, w0) < 1e-9);

    const peakBoost = biquadCoeffsRBJ('peaking', f0, fs, 1, 6);
    checkTrue(
      'RBJ peaking +6dB: khuếch đại tại f0 đúng +6dB',
      Math.abs(20 * Math.log10(magAt(peakBoost, w0)) - 6) < 1e-6
    );
    const peakCut = biquadCoeffsRBJ('peaking', f0, fs, 1, -6);
    checkTrue(
      'RBJ peaking -6dB: khuếch đại tại f0 đúng -6dB',
      Math.abs(20 * Math.log10(magAt(peakCut, w0)) + 6) < 1e-6
    );

    const lowshelf = biquadCoeffsRBJ('lowshelf', f0, fs, 1, 12);
    checkTrue(
      'RBJ lowshelf +12dB: DC đạt đúng +12dB (dải thấp được nâng)',
      Math.abs(20 * Math.log10(magAt(lowshelf, 0)) - 12) < 1e-6
    );
    checkTrue(
      'RBJ lowshelf +12dB: Nyquist giữ nguyên 0dB (dải cao không đổi)',
      Math.abs(20 * Math.log10(magAt(lowshelf, Math.PI))) < 1e-6
    );

    const highshelf = biquadCoeffsRBJ('highshelf', f0, fs, 1, 12);
    checkTrue(
      'RBJ highshelf +12dB: Nyquist đạt đúng +12dB (dải cao được nâng)',
      Math.abs(20 * Math.log10(magAt(highshelf, Math.PI)) - 12) < 1e-6
    );
    checkTrue(
      'RBJ highshelf +12dB: DC giữ nguyên 0dB (dải thấp không đổi)',
      Math.abs(20 * Math.log10(magAt(highshelf, 0))) < 1e-6
    );

    // --- DF2T ≡ Direct Form: 2 dạng khác nhau, CÙNG kết quả toán học ---
    const impulse11 = [1, ...new Array(49).fill(0)];
    const yDF2T = biquadDF2T(impulse11, lp);
    const yDirect = iirFilterDirect(impulse11, [lp.b0, lp.b1, lp.b2], [1, lp.a1, lp.a2]);
    let maxDiff = 0;
    for (let i = 0; i < impulse11.length; i++) maxDiff = Math.max(maxDiff, Math.abs(yDF2T[i] - yDirect[i]));
    checkTrue('biquadDF2T khớp TUYỆT ĐỐI với iirFilterDirect (2 dạng, cùng kết quả)', maxDiff < 1e-12);

    // --- Cascade: 2 biquad nối tiếp chặn dải sâu gấp đôi (dB cộng dồn) ---
    const stopW = (2 * Math.PI * 8000) / fs;
    const singleDb = 20 * Math.log10(magAt(lp, stopW));
    const cascadeDb = singleDb * 2;
    checkTrue(
      'Cascade 2 biquad lowpass: độ chặn ở dải chặn GẤP ĐÔI (dB cộng dồn theo tầng)',
      Math.abs(cascadeDb - 2 * singleDb) < 1e-9
    );
    checkTrue('Cascade 2 biquad: độ chặn thực sự sâu hơn 1 biquad đơn (bậc cao hơn = dốc hơn)', cascadeDb < singleDb);

    // --- Pitfall Mục 11.4: lượng tử hệ số đẩy pole Q cao SÁT vòng tròn TRƯỢT RA NGOÀI ---
    const highQ = biquadCoeffsRBJ('peaking', 20500, fs, 30, 12);
    const polesFull = biquadPoles(highQ);
    checkTrue(
      'Pole filter Q cao (full precision) ổn định: |pole| < 1',
      polesFull.every((p) => Math.hypot(p.re, p.im) < 1)
    );
    const round = (v, dp) => Math.round(v * 10 ** dp) / 10 ** dp;
    const quantized1dp = { ...highQ, a1: round(highQ.a1, 1), a2: round(highQ.a2, 1) };
    const polesQuantized = biquadPoles(quantized1dp);
    checkTrue(
      'Pitfall lượng tử: làm tròn a1/a2 xuống 1 chữ số thập phân đẩy pole TRƯỢT RA NGOÀI vòng tròn (|pole| ≥ 1, filter Q cao "nổ")',
      polesQuantized.some((p) => Math.hypot(p.re, p.im) >= 1)
    );
  }

  // --- Bài 12: resampling — tỉ lệ hữu tỉ, naive aliasing vs decimate/interpolate đúng ---
  {
    checkTrue('gcdInt(48000, 44100) = 300 (rút gọn về tỉ lệ L/M tối giản)', gcdInt(48000, 44100) === 300);
    checkTrue(
      '44,1kHz↔48kHz rút gọn ĐÚNG bằng 160/147',
      48000 / gcdInt(48000, 44100) === 160 && 44100 / gcdInt(48000, 44100) === 147
    );

    function rms(arr) {
      return Math.sqrt(arr.reduce((s, v) => s + v * v, 0) / arr.length);
    }
    const fs12 = 48000;
    const M12 = 4;
    const N12 = 2000;

    // Naive downsample KHONG loc truoc: 10kHz (tren Nyquist MOI 6kHz sau /4)
    // gap pho ve tan so khac, bien do KHONG suy giam - chinh la aliasing.
    const highTone = Array.from({ length: N12 }, (_, n) => sine(n, 10000, fs12, 1, 0));
    const naiveDown = downsampleNaive(highTone, M12);
    checkTrue(
      'downsampleNaive KHÔNG lọc trước: biên độ tần số 10kHz (trên Nyquist mới) KHÔNG suy giảm — aliasing y hệt Bài 2',
      Math.abs(rms(naiveDown.slice(20)) - Math.SQRT1_2) < 0.01
    );
    checkTrue(
      'Tần số alias của 10kHz tại rate mới 12kHz đúng bằng aliasFrequency() của Bài 2',
      Math.abs(aliasFrequency(10000, fs12 / M12) - 2000) < 1e-6
    );

    // Decimate DUNG cach: loc truoc chan het 10kHz (tren Nyquist moi) TRUOC
    // khi bo mau - nang luong bi trieu tieu manh, KHONG con aliasing.
    const properDown = decimate(highTone, M12, 81, hannWindow);
    checkTrue(
      'decimate() lọc trước ĐÚNG cách: biên độ 10kHz (trên Nyquist mới) bị TRIỆT TIÊU mạnh (RMS < 0,05, so với naive ~0,707)',
      rms(properDown.slice(60)) < 0.05
    );

    // Decimate giu nguyen ven tin hieu TRONG dai (500Hz, duoi Nyquist moi 6kHz)
    const inBandTone = Array.from({ length: N12 }, (_, n) => sine(n, 500, fs12, 1, 0));
    const properInBand = decimate(inBandTone, M12, 81, hannWindow);
    checkTrue(
      'decimate() GIỮ NGUYÊN biên độ tín hiệu trong dải (500Hz, dưới Nyquist mới) — RMS gần đúng 1/√2',
      Math.abs(rms(properInBand.slice(60, 400)) - Math.SQRT1_2) < 0.02
    );

    // Interpolate: tin hieu upsample L=2 khop voi hinh sin LY TUONG tai rate moi
    // (bu tre nhom filter = (numTaps-1)/2 mau tai rate MOI)
    const L12 = 2;
    const numTaps12 = 81;
    const groupDelay12 = (numTaps12 - 1) / 2;
    const loFreq12 = 300;
    const N3 = 200;
    const loTone = Array.from({ length: N3 }, (_, n) => sine(n, loFreq12, fs12, 1, 0));
    const interp = interpolate(loTone, L12, numTaps12, hannWindow);
    let maxErr = 0;
    for (let n = 100; n < 300; n++) {
      const idealT = (n - groupDelay12) / L12;
      const ideal = Math.sin((2 * Math.PI * loFreq12 * idealT) / fs12);
      maxErr = Math.max(maxErr, Math.abs(interp[n] - ideal));
    }
    checkTrue(
      'interpolate() L=2: khớp đường sin lý tưởng tại rate mới, sai số tối đa < 0,001 (đã bù trễ nhóm filter)',
      maxErr < 0.001
    );
  }

  // --- Bài 13: pitch detection — missing fundamental, YIN, octave error, cent/note ---
  {
    const fs13 = 8000;
    const f013 = 150;
    const period13 = fs13 / f013; // ~53,33 mau

    // Missing fundamental (Muc 13.1): CHI hai bac 2,3,4 - KHONG co bac 1 -
    // autocorrelation qua FFT van phuc hoi DUNG chu ky cua tan so co ban.
    const N13 = 2000;
    const xMissing = Array.from(
      { length: N13 },
      (_, n) =>
        0.3 * sine(n, 2 * f013, fs13, 1, 0) + 0.5 * sine(n, 3 * f013, fs13, 1, 0) + 0.2 * sine(n, 4 * f013, fs13, 1, 0)
    );
    const ac = autocorrFFT(xMissing.slice(0, 1024));
    let bestTau = 20;
    let bestVal = -Infinity;
    for (let tau = 20; tau < 200; tau++) {
      if (ac[tau] > bestVal) {
        bestVal = ac[tau];
        bestTau = tau;
      }
    }
    checkTrue(
      'Missing fundamental: autocorrFFT() trên tín hiệu CHỈ có hài bậc 2,3,4 (KHÔNG có bậc 1) vẫn phục hồi ĐÚNG chu kỳ cơ bản (tau=53, khớp period=53,33)',
      Math.abs(bestTau - period13) < 1
    );

    // YIN tren tin hieu day du (co ca f0) - verify tim dung tau va sau khi
    // parabolic refine, sai so tan so duoi 1 cent (khong nghe ra duoc).
    const xFull13 = Array.from(
      { length: N13 },
      (_, n) => sine(n, f013, fs13, 1, 0) + 0.6 * sine(n, 2 * f013, fs13, 1, 0) + 0.4 * sine(n, 3 * f013, fs13, 1, 0)
    );
    const yinResult = yinPitch(xFull13.slice(0, 800), fs13, { maxTau: 200, minTau: 20, threshold: 0.1 });
    checkTrue('yinPitch(): phát hiện tau=53 trên tín hiệu đầy đủ hài (khớp period=53,33)', yinResult.tau === 53);
    checkTrue(
      'yinPitch() sau nội suy parabol: sai số tần số dưới 1 cent so với f0 THẬT (150Hz) — tai người KHÔNG nghe ra được',
      Math.abs(centsFromFreq(yinResult.frequency, f013)) < 1
    );

    // Octave error (pitfall Muc 13.2): tin hieu "gai" (hai bac 2 manh hon
    // ca f0) khien cuc tieu TOAN CUC cua CMND roi vao BOI SO cua chu ky that
    // - trong khi YIN (nguong tuyet doi, chon DIEM TRUNG DAU TIEN) van dung.
    const xTricky13 = Array.from(
      { length: N13 },
      (_, n) =>
        0.5 * sine(n, f013, fs13, 1, 0) + 0.9 * sine(n, 2 * f013, fs13, 1, 0.3) + 0.3 * sine(n, 4 * f013, fs13, 1, 0.1)
    );
    const d13 = yinDifference(xTricky13.slice(0, 800), 200);
    const dp13 = yinCMND(d13);
    let globalMinTau = 20;
    let globalMinVal = Infinity;
    for (let tau = 20; tau < 200; tau++) {
      if (dp13[tau] < globalMinVal) {
        globalMinVal = dp13[tau];
        globalMinTau = tau;
      }
    }
    const yinTauTricky = yinPickTau(dp13, 0.1, 20, 200);
    checkTrue(
      'Pitfall octave error: chọn CỰC TIỂU TOÀN CỤC của CMND (cách NGÂY THƠ) rơi vào tau=160 (SAI, ứng f≈50Hz thay vì 150Hz)',
      globalMinTau === 160
    );
    checkTrue(
      'YIN (ngưỡng tuyệt đối, chọn điểm trũng ĐẦU TIÊN đủ tốt) tránh được octave error: tau=53 ĐÚNG (khớp period=53,33)',
      yinTauTricky === 53
    );

    // Nội suy parabol + cent + note name - verify voi so THAT
    checkTrue('centsFromFreq(440,440) = 0 (đúng tâm nốt A4)', Math.abs(centsFromFreq(440, 440)) < 1e-9);
    checkTrue(
      'centsFromFreq(880,440) = 1200 (đúng 1 quãng tám, cao gấp đôi)',
      Math.abs(centsFromFreq(880, 440) - 1200) < 1e-9
    );
    const noteA4 = freqToNote(440);
    checkTrue(
      'freqToNote(440) = A4, cents ≈ 0',
      noteA4.note === 'A' && noteA4.octave === 4 && Math.abs(noteA4.cents) < 1e-6
    );
    const noteC4 = freqToNote(261.6255653);
    checkTrue('freqToNote(261,63Hz) = C4 (đúng nốt Đô giữa)', noteC4.note === 'C' && noteC4.octave === 4);
  }

  // --- Bài 14: Q15 fixed-point, block-processing state pitfall ---
  {
    checkTrue('floatToQ15(1,0) bão hoà về 32767 (Q15 KHÔNG biểu diễn được đúng +1)', floatToQ15(1.0) === 32767);
    checkTrue('floatToQ15(-1,0) = -32768 (biên âm biểu diễn CHÍNH XÁC)', floatToQ15(-1.0) === -32768);
    checkTrue('q15Mul(32767,32767) bão hoà đúng 32766 (KHÔNG tràn số/quấn vòng âm)', q15Mul(32767, 32767) === 32766);
    checkTrue('q15Add(32767, 100) bão hoà về đúng 32767 (không tràn thành số âm)', q15Add(32767, 100) === 32767);

    // Q15 FIR: SNR that so voi float, tren filter windowed-sinc (tap << 1, khong can lo doi Q15)
    const fs14 = 48000;
    const h14 = firLowpassDesign(41, 1000 / (fs14 / 2), hannWindow);
    checkTrue(
      'Tap FIR windowed-sinc luôn nhỏ hơn 1 (an toàn cho Q15, không cần lo tràn phạm vi)',
      Math.max(...h14.map(Math.abs)) < 1
    );
    const N14 = 2000;
    const xFir14 = Array.from({ length: N14 }, (_, n) => 0.5 * sine(n, 300, fs14, 1, 0));
    const yFloatFir = convolve(xFir14, h14).slice(0, N14);
    const yQ15Fir = firQ15(xFir14, h14);
    let sp14 = 0;
    let np14 = 0;
    for (let i = 200; i < N14; i++) {
      sp14 += yFloatFir[i] * yFloatFir[i];
      const err = yFloatFir[i] - yQ15Fir[i];
      np14 += err * err;
    }
    const snrDb14 = 10 * Math.log10(sp14 / np14);
    checkTrue('Q15 FIR: SNR so với float trên 84dB (nhiễu lượng tử rất nhỏ, tai gần như không nghe ra)', snrDb14 > 80);

    // Pitfall Muc 14.2: xu ly theo BLOCK dung ham GIU trang thai (biquadDF2TBlock)
    // phai khop TUYET DOI voi xu ly nguyen khoi mot lan; dung SAI ham reset
    // trang thai (biquadDF2T) moi block tao "click" tai RANH GIOI block.
    const coeffs14 = biquadCoeffsRBJ('lowpass', 1000, fs14, 0.707, 0);
    const xBlock14 = Array.from({ length: N14 }, (_, n) => 0.5 * sine(n, 300, fs14, 1, 0));
    const yFull14 = biquadDF2TBlock(xBlock14, coeffs14, { z1: 0, z2: 0 });

    const blockSize14 = 128;
    const stateCorrect14 = { z1: 0, z2: 0 };
    let yBlockCorrect14 = [];
    for (let i = 0; i < N14; i += blockSize14) {
      yBlockCorrect14 = yBlockCorrect14.concat(
        biquadDF2TBlock(xBlock14.slice(i, i + blockSize14), coeffs14, stateCorrect14)
      );
    }
    let maxDiffCorrect14 = 0;
    for (let i = 0; i < N14; i++)
      maxDiffCorrect14 = Math.max(maxDiffCorrect14, Math.abs(yFull14[i] - yBlockCorrect14[i]));
    checkTrue(
      'biquadDF2TBlock() với state GIỮ qua block: khớp TUYỆT ĐỐI xử lý nguyên khối 1 lần (diff = 0)',
      maxDiffCorrect14 < 1e-12
    );

    let yBlockBuggy14 = [];
    for (let i = 0; i < N14; i += blockSize14) {
      yBlockBuggy14 = yBlockBuggy14.concat(biquadDF2T(xBlock14.slice(i, i + blockSize14), coeffs14));
    }
    let maxBoundaryJumpBuggy = 0;
    for (let i = blockSize14; i < N14; i += blockSize14) {
      maxBoundaryJumpBuggy = Math.max(maxBoundaryJumpBuggy, Math.abs(yBlockBuggy14[i] - yBlockBuggy14[i - 1]));
    }
    let maxInteriorJumpCorrect = 0;
    for (let i = 1; i < N14; i++) {
      if (i % blockSize14 !== 0)
        maxInteriorJumpCorrect = Math.max(
          maxInteriorJumpCorrect,
          Math.abs(yBlockCorrect14[i] - yBlockCorrect14[i - 1])
        );
    }
    checkTrue(
      'Pitfall: dùng SAI biquadDF2T() (reset state) mỗi block tạo bước nhảy tại ranh giới LỚN HƠN NHIỀU so với bước nhảy bình thường (click nghe được)',
      maxBoundaryJumpBuggy > 10 * maxInteriorJumpCorrect
    );
  }

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
