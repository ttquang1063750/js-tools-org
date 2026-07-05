/**
 * electronics-ohm-voltage-divider.js
 * Bài 2 — Định luật Ohm & Mạch cầu phân áp.
 * Phần 1: thư viện hàm tính toán dùng trong các ví dụ của bài viết.
 * Phần 2: trình mô phỏng mạch chỉnh độ sáng LED bằng chiết áp (canvas).
 */

// ============================================================================
// PHẦN 1: THƯ VIỆN HÀM TÍNH TOÁN
// ============================================================================

/**
 * Giải định luật Ohm khi biết 2 trong 3 đại lượng.
 * @param {{V?: number, I?: number, R?: number}} known - object có đúng 2 khóa
 * @returns {{V: number, I: number, R: number}}
 */
function giaiOhm({ V, I, R }) {
  if (V === undefined) return { V: I * R, I: I, R: R };
  if (I === undefined) return { V: V, I: V / R, R: R };
  return { V: V, I: I, R: V / I };
}

/**
 * Điện áp ra của cầu phân áp không tải.
 * @param {number} vIn - điện áp vào (V)
 * @param {number} r1 - điện trở phía nguồn (Ω)
 * @param {number} r2 - điện trở phía GND (Ω)
 */
function cauPhanAp(vIn, r1, r2) {
  return (vIn * r2) / (r1 + r2);
}

/**
 * Điện áp ra của cầu phân áp khi có tải R_L mắc song song R2
 * (minh họa hiệu ứng sụt áp do tải — loading effect).
 */
function cauPhanApCoTai(vIn, r1, r2, rTai) {
  const r2SongSong = (r2 * rTai) / (r2 + rTai);
  return (vIn * r2SongSong) / (r1 + r2SongSong);
}

/**
 * Dòng qua LED trong mạch: nguồn → R bảo vệ → LED → chiết áp (rheostat) → GND.
 * @returns {number} dòng điện (A)
 */
function dongQuaLed(vIn, vLed, rBaoVe, rPot) {
  const rTong = rBaoVe + rPot;
  if (rTong <= 0) return Infinity;
  return (vIn - vLed) / rTong;
}

// ============================================================================
// PHẦN 2: TRÌNH MÔ PHỎNG MẠCH CHỈNH ĐỘ SÁNG LED (mục 6 của bài học)
// ============================================================================

(function () {
  const canvas = document.getElementById('dimCanvas');
  if (!canvas) return; // file được tải như thư viện thuần ở trang khác

  const ctx = canvas.getContext('2d');

  // ---- Thông số mạch ----
  const V_IN = 9.0;
  const V_LED = 2.0;
  const R_BAOVE = 330;
  const R_POT_MAX = 10000;
  const I_CANH_BAO = 0.02; // 20 mA — ngưỡng dòng an toàn của LED
  const I_CHAY = 0.03; // 30 mA — vượt là LED cháy

  // ---- Trạng thái ----
  let pct = 50; // góc vặn chiết áp (%)
  let safetyOn = true; // còn trở bảo vệ 330Ω hay không
  let burned = false; // LED đã cháy chưa
  let offset = 0; // pha di chuyển của hạt điện tích

  // ---- DOM ----
  const slider = document.getElementById('potSlider');
  const potPct = document.getElementById('potPct');
  const potVal = document.getElementById('potVal');
  const readI = document.getElementById('readI');
  const readR = document.getElementById('readR');
  const readVbv = document.getElementById('readVbv');
  const readVpot = document.getElementById('readVpot');
  const readVled = document.getElementById('readVled');
  const readP = document.getElementById('readP');
  const barBv = document.getElementById('barBv');
  const barPot = document.getElementById('barPot');
  const barLed = document.getElementById('barLed');
  const barBvV = document.getElementById('barBvV');
  const barPotV = document.getElementById('barPotV');
  const barLedV = document.getElementById('barLedV');
  const btnSafety = document.getElementById('btnSafety');
  const btnReplace = document.getElementById('btnReplace');
  const note = document.getElementById('dimNote');

  // ---- Hình học mạch trên canvas (vòng kín chữ nhật) ----
  const L = 70; // lề trái (cột nguồn)
  const R_ = 490; // lề phải
  const T = 70; // dây trên
  const B = 260; // dây dưới
  const RBV_X1 = 140,
    RBV_X2 = 230; // vị trí trở bảo vệ trên dây trên
  const LED_X = 340; // tâm LED trên dây trên
  const POT_X1 = 250,
    POT_X2 = 330; // vị trí chiết áp trên dây dưới

  // Đường đi của dòng điện quy ước: (+) → dây trên → phải → dây dưới → (−)
  const path = [
    [L, 148], // cực dương
    [L, T],
    [R_, T],
    [R_, B],
    [L, B],
    [L, 172], // cực âm
  ];
  const segLens = [];
  let pathLen = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    segLens.push(d);
    pathLen += d;
  }
  function pointAt(dist) {
    let d = ((dist % pathLen) + pathLen) % pathLen;
    for (let i = 0; i < segLens.length; i++) {
      if (d <= segLens[i]) {
        const t = d / segLens[i];
        return [path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t];
      }
      d -= segLens[i];
    }
    return path[0];
  }

  // ---- Tính toán trạng thái điện ----
  function tinhMach() {
    const rPot = (pct / 100) * R_POT_MAX;
    const rBv = safetyOn ? R_BAOVE : 0;
    const rTong = rBv + rPot;
    let i = burned ? 0 : dongQuaLed(V_IN, V_LED, rBv, rPot);
    if (!burned && i > I_CHAY) {
      burned = true; // quá dòng → LED nổ
      i = 0;
      btnReplace.style.display = 'block';
    }
    return { rPot, rBv, rTong, i };
  }

  // ---- Cập nhật bảng số liệu ----
  function updateReadouts(m) {
    potPct.textContent = pct;
    potVal.textContent = Math.round(m.rPot);
    if (burned) {
      readI.textContent = '0.00 mA';
      readR.textContent = '∞ (mạch hở)';
      readVbv.textContent = '0.00 V';
      readVpot.textContent = '0.00 V';
      readVled.textContent = '9.00 V';
      readP.textContent = '0 mW';
      setBar(barBv, barBvV, 0);
      setBar(barPot, barPotV, 0);
      setBar(barLed, barLedV, 9);
      note.innerHTML =
        '💥 <strong>LED đã cháy vì quá dòng!</strong> Mạch bị hở nên I = 0 và toàn bộ 9 V rơi trên LED đứt. ' +
        'Đây chính là hậu quả của anti-pattern bỏ trở bảo vệ. Bấm <strong>Thay LED mới</strong> và bật lại trở bảo vệ.';
      return;
    }
    const vBv = m.i * m.rBv;
    const vPot = m.i * m.rPot;
    const iMa = m.i * 1000;
    readI.textContent = iMa.toFixed(2) + ' mA';
    readR.textContent = Math.round(m.rTong) + ' Ω';
    readVbv.textContent = vBv.toFixed(2) + ' V';
    readVpot.textContent = vPot.toFixed(2) + ' V';
    readVled.textContent = V_LED.toFixed(2) + ' V';
    readP.textContent = (V_IN * iMa).toFixed(0) + ' mW';
    setBar(barBv, barBvV, vBv);
    setBar(barPot, barPotV, vPot);
    setBar(barLed, barLedV, V_LED);

    if (!safetyOn && m.i > I_CANH_BAO) {
      note.innerHTML =
        '⚠️ <strong>' +
        iMa.toFixed(1) +
        ' mA — vượt dòng an toàn 20 mA!</strong> Không còn trở bảo vệ, ' +
        'vặn thêm về 0% là LED cháy ngay. Hãy quan sát rồi bật lại trở bảo vệ.';
    } else if (iMa < 1) {
      note.innerHTML =
        'I = ' +
        iMa.toFixed(2) +
        ' mA — LED gần như tắt vì điện trở toàn mạch quá lớn (' +
        Math.round(m.rTong) +
        ' Ω). Đây là kết quả đúng, không phải demo lỗi: vặn ngược lại để tăng dòng.';
    } else {
      note.innerHTML =
        'Tổng ba thanh sụt áp luôn bằng đúng 9 V của nguồn (' +
        (m.i * m.rBv).toFixed(2) +
        ' + ' +
        (m.i * m.rPot).toFixed(2) +
        ' + 2.00 = 9.00 V) — sự bảo toàn năng lượng ở mục 3 hiển thị trực tiếp.';
    }
  }

  function setBar(fill, label, volts) {
    fill.style.width = ((volts / V_IN) * 100).toFixed(1) + '%';
    label.textContent = volts.toFixed(2) + ' V';
  }

  // ---- Vẽ mạch ----
  function drawZigzag(x1, x2, y, color) {
    const n = 6;
    const step = (x2 - x1 - 20) / n;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 + 10, y);
    for (let i = 0; i < n; i++) {
      ctx.lineTo(x1 + 10 + step * (i + 0.5), y + (i % 2 === 0 ? -10 : 10));
    }
    ctx.lineTo(x2 - 10, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  function draw(m) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#11111b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dây dẫn
    ctx.strokeStyle = '#585b70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L, 148);
    ctx.lineTo(L, T);
    ctx.lineTo(RBV_X1, T);
    ctx.moveTo(RBV_X2, T);
    ctx.lineTo(LED_X - 16, T);
    ctx.moveTo(LED_X + 16, T);
    ctx.lineTo(R_, T);
    ctx.lineTo(R_, B);
    ctx.lineTo(POT_X2, B);
    ctx.moveTo(POT_X1, B);
    ctx.lineTo(L, B);
    ctx.lineTo(L, 172);
    ctx.stroke();

    // Nguồn pin 9V
    ctx.strokeStyle = '#cdd6f4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(L - 16, 148);
    ctx.lineTo(L + 16, 148);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(L - 8, 172);
    ctx.lineTo(L + 8, 172);
    ctx.stroke();
    ctx.fillStyle = '#d8a657';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('9V', L - 40, 155);
    ctx.fillStyle = '#a6adc8';
    ctx.font = '11px sans-serif';
    ctx.fillText('+', L + 22, 152);
    ctx.fillText('−', L + 22, 178);

    // Trở bảo vệ (hoặc dây nối tắt khi đã bỏ)
    if (safetyOn) {
      drawZigzag(RBV_X1, RBV_X2, T, '#89b4fa');
      ctx.fillStyle = '#89b4fa';
      ctx.font = '12px sans-serif';
      ctx.fillText('R bảo vệ 330Ω', RBV_X1 + 2, T - 20);
    } else {
      ctx.strokeStyle = '#f38ba8';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(RBV_X1, T);
      ctx.lineTo(RBV_X2, T);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f38ba8';
      ctx.font = '12px sans-serif';
      ctx.fillText('❌ đã nối tắt!', RBV_X1 + 8, T - 20);
    }

    // LED
    const iMa = m.i * 1000;
    const glow = burned ? 0 : Math.min(iMa / 20, 1.2);
    if (glow > 0.02) {
      ctx.shadowColor = '#f38ba8';
      ctx.shadowBlur = 26 * glow;
    }
    ctx.fillStyle = burned ? '#1e1e2e' : 'rgba(243, 139, 168, ' + Math.max(0.12, Math.min(glow, 1)) + ')';
    ctx.strokeStyle = burned ? '#585b70' : '#f38ba8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(LED_X - 14, T - 12);
    ctx.lineTo(LED_X - 14, T + 12);
    ctx.lineTo(LED_X + 10, T);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(LED_X + 10, T - 12);
    ctx.lineTo(LED_X + 10, T + 12);
    ctx.stroke();
    ctx.fillStyle = burned ? '#f38ba8' : '#a6adc8';
    ctx.font = '12px sans-serif';
    ctx.fillText(burned ? '💥 LED cháy' : 'LED đỏ', LED_X - 18, T + 32);

    // Chiết áp trên dây dưới
    ctx.strokeStyle = '#d8a657';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(POT_X1, B - 12, POT_X2 - POT_X1, 24);
    // mũi tên con chạy theo % vặn
    const wx = POT_X1 + (POT_X2 - POT_X1) * (pct / 100);
    ctx.beginPath();
    ctx.moveTo(wx, B - 30);
    ctx.lineTo(wx, B - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx - 5, B - 18);
    ctx.lineTo(wx + 5, B - 18);
    ctx.lineTo(wx, B - 12);
    ctx.closePath();
    ctx.fillStyle = '#d8a657';
    ctx.fill();
    ctx.font = '12px sans-serif';
    ctx.fillText('Chiết áp ' + Math.round(m.rPot) + 'Ω', POT_X1 - 4, B + 30);

    // Hạt điện tích chạy theo chiều dòng điện quy ước
    if (!burned && m.i > 0) {
      const nDots = 26;
      ctx.fillStyle = '#a6e3a1';
      for (let k = 0; k < nDots; k++) {
        const [x, y] = pointAt(offset + (k * pathLen) / nDots);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ---- Vòng lặp animation ----
  function loop() {
    const m = tinhMach();
    // tốc độ hạt tỉ lệ thuận dòng điện (px/frame), chặn trần cho dễ nhìn
    offset += Math.min(m.i * 1000 * 1.1, 26);
    draw(m);
    requestAnimationFrame(loop);
  }

  function refresh() {
    const m = tinhMach();
    updateReadouts(m);
  }

  // ---- Sự kiện ----
  slider.addEventListener('input', function () {
    pct = parseInt(slider.value, 10);
    refresh();
  });

  btnSafety.addEventListener('click', function () {
    safetyOn = !safetyOn;
    btnSafety.textContent = safetyOn ? '❌ Bỏ trở bảo vệ 330 Ω (thử anti-pattern)' : '✅ Lắp lại trở bảo vệ 330 Ω';
    btnSafety.classList.toggle('is-danger', !safetyOn);
    refresh();
  });

  btnReplace.addEventListener('click', function () {
    burned = false;
    btnReplace.style.display = 'none';
    if (!safetyOn && (pct / 100) * R_POT_MAX < 300) {
      // tránh cháy lại ngay lập tức: đẩy chiết áp lên vùng an toàn
      pct = 30;
      slider.value = '30';
    }
    refresh();
  });

  // ---- Khởi động ----
  refresh();
  loop();
})();
