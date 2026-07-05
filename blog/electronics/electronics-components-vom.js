/**
 * electronics-components-vom.js
 * Thư viện các hàm tính toán và giải mã linh kiện điện tử cơ bản.
 * File này được đính kèm làm tài liệu thực hành cho Bài 1: Linh kiện điện tử thụ động & bán dẫn.
 */

// ============================================================================
// PHẦN 1: GIẢI MÃ THÔNG SỐ LINH KIỆN
// ============================================================================

/**
 * Giải mã trị số điện trở dựa trên vạch màu.
 * Hỗ trợ điện trở 4 vòng màu và 5 vòng màu.
 * @param {string[]} bands - Mảng chứa tên các màu viết thường không dấu (ví dụ: ['do', 'tim', 'cam'])
 * @returns {string} Giá trị điện trở định dạng dễ đọc (Ω, kΩ, MΩ) hoặc thông báo lỗi.
 */
function parseResistorColorCode(bands) {
  const colorValues = {
    den: 0,
    nau: 1,
    do: 2,
    cam: 3,
    vang: 4,
    xanh_luc: 5,
    xanh_lam: 6,
    tim: 7,
    xam: 8,
    trang: 9,
  };

  const multipliers = {
    den: 1,
    nau: 10,
    do: 100,
    cam: 1000,
    vang: 10000,
    xanh_luc: 100000,
    xanh_lam: 1000000,
    tim: 10000000,
    xam: 100000000,
    trang: 1000000000,
    nhu_vang: 0.1,
    nhu_bac: 0.01,
  };

  const cleanBands = bands.map((b) => b.trim().toLowerCase().replace(' ', '_'));

  if (cleanBands.length === 3 || cleanBands.length === 4) {
    // Điện trở 4 vòng màu (3 vòng đầu quyết định trị số)
    const val1 = colorValues[cleanBands[0]];
    const val2 = colorValues[cleanBands[1]];
    const multiplier = multipliers[cleanBands[2]];

    if (val1 === undefined || val2 === undefined || multiplier === undefined) {
      return 'Màu không hợp lệ';
    }
    const resistance = (val1 * 10 + val2) * multiplier;
    return resistance >= 1000000
      ? `${resistance / 1000000} MΩ`
      : resistance >= 1000
        ? `${resistance / 1000} kΩ`
        : `${resistance} Ω`;
  } else if (cleanBands.length === 5) {
    // Điện trở 5 vòng màu (4 vòng đầu quyết định trị số)
    const val1 = colorValues[cleanBands[0]];
    const val2 = colorValues[cleanBands[1]];
    const val3 = colorValues[cleanBands[2]];
    const multiplier = multipliers[cleanBands[3]];

    if (val1 === undefined || val2 === undefined || val3 === undefined || multiplier === undefined) {
      return 'Màu không hợp lệ';
    }
    const resistance = (val1 * 100 + val2 * 10 + val3) * multiplier;
    return resistance >= 1000000
      ? `${resistance / 1000000} MΩ`
      : resistance >= 1000
        ? `${resistance / 1000} kΩ`
        : `${resistance} Ω`;
  }
  return 'Số vòng màu không hỗ trợ';
}

/**
 * Giải mã trị số tụ điện dựa trên mã số 3 ký tự ghi trên thân.
 * @param {string} code - Mã số tụ điện (ví dụ: '104', '223')
 * @returns {object} Trị số quy đổi ra pF, nF và uF.
 */
function parseCapacitorCode(code) {
  if (!code || code.length !== 3) {
    throw new Error('Mã tụ điện phải gồm đúng 3 chữ số!');
  }
  const d1 = parseInt(code[0], 10);
  const d2 = parseInt(code[1], 10);
  const multiplier = parseInt(code[2], 10);

  if (isNaN(d1) || isNaN(d2) || isNaN(multiplier)) {
    throw new Error('Mã tụ điện không hợp lệ!');
  }

  const pF = (d1 * 10 + d2) * Math.pow(10, multiplier);
  const nF = pF / 1000;
  const uF = nF / 1000;

  return {
    pF: Math.round(pF * 100) / 100,
    nF: Math.round(nF * 100) / 100,
    uF: Math.round(uF * 100000) / 100000,
  };
}

/**
 * Giải mã trị số cuộn cảm dựa trên mã số SMD hoặc mã vòng màu.
 * @param {string} code - Mã số cuộn cảm (ví dụ: '4R7', '221')
 * @returns {string} Trị số quy đổi kèm đơn vị đo µH.
 */
function parseInductorCode(code) {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.includes('R')) {
    const parts = cleanCode.split('R');
    const integerPart = parts[0] || '0';
    const fractionalPart = parts[1] || '0';
    const val = parseFloat(`${integerPart}.${fractionalPart}`);
    return `${val} μH`;
  }
  if (cleanCode.length === 3) {
    const d1 = parseInt(cleanCode[0], 10);
    const d2 = parseInt(cleanCode[1], 10);
    const multiplier = parseInt(cleanCode[2], 10);
    if (!isNaN(d1) && !isNaN(d2) && !isNaN(multiplier)) {
      const val = (d1 * 10 + d2) * Math.pow(10, multiplier);
      return `${val} μH`;
    }
  }
  return 'Mã cuộn cảm không hợp lệ';
}

// ============================================================================
// PHẦN 2: BÀI TOÁN THIẾT KẾ MẠCH THỰC TẾ
// ============================================================================

/**
 * Thiết kế mạch hạn dòng cho LED nối tiếp.
 * @param {number} vIn - Điện áp nguồn cấp (V)
 * @param {number} vLed - Sụt áp thuận trên LED (V)
 * @param {number} iLed - Dòng điện mong muốn qua LED (A)
 * @returns {object} Điện trở tối thiểu (Ohm) và công suất tiêu tán (W)
 */
function calculateLedResistor(vIn, vLed, iLed) {
  if (vIn <= vLed) {
    throw new Error('Điện áp nguồn cấp phải lớn hơn điện áp sụt trên LED!');
  }
  const vResistor = vIn - vLed;
  const resistance = vResistor / iLed;
  const power = Math.pow(iLed, 2) * resistance;
  return {
    requiredOhm: Math.round(resistance * 100) / 100,
    powerWatts: Math.round(power * 10000) / 10000,
  };
}

/**
 * Thiết kế mạch phân áp (Voltage Divider).
 * @param {number} vIn - Điện áp ngõ vào tối đa (V)
 * @param {number} vOutTarget - Điện áp ngõ ra mong muốn (V)
 * @param {number} r2Suggested - Điện trở nối đất gợi ý (Ohm)
 * @returns {object} Điện trở R1 (Ohm) và dòng điện tiêu hao (mA)
 */
function calculateVoltageDivider(vIn, vOutTarget, r2Suggested) {
  if (vOutTarget >= vIn) {
    throw new Error('Điện áp ra mục tiêu phải nhỏ hơn điện áp nguồn vào!');
  }
  const r1 = r2Suggested * (vIn / vOutTarget - 1);
  const totalResistance = r1 + r2Suggested;
  const currentDrawAmps = vIn / totalResistance;
  return {
    requiredR1Ohm: Math.round(r1 * 100) / 100,
    currentDrawMA: Math.round(currentDrawAmps * 1000 * 1000) / 1000,
  };
}

/**
 * Thiết kế điện trở cực Base kích bão hòa cho Transistor BJT NPN hoạt động như công tắc đóng ngắt.
 * @param {number} vIn - Điện áp kích từ chân điều khiển (V)
 * @param {number} iCollector - Dòng điện tải cực Collector (A)
 * @param {number} beta - Hệ số khuếch đại dòng DC tối thiểu (hFE)
 * @param {number} vBe - Sụt áp Base-Emitter khi dẫn bão hòa (V)
 * @param {number} safetyFactor - Hệ số overdrive an toàn (thường chọn 2 - 5)
 * @returns {object} Dòng kích cực Base cần thiết (mA) và điện trở Rb (Ohm)
 */
function calculateBjtBaseResistor(vIn, iCollector, beta, vBe = 0.7, safetyFactor = 3) {
  if (vIn <= vBe) {
    throw new Error('Điện áp kích ngõ vào phải lớn hơn sụt áp tiếp giáp VBE!');
  }
  const iBaseNeeded = (iCollector / beta) * safetyFactor;
  const vResistor = vIn - vBe;
  const resistance = vResistor / iBaseNeeded;
  return {
    iBaseMA: Math.round(iBaseNeeded * 1000 * 100) / 100,
    requiredRbOhm: Math.round(resistance * 100) / 100,
  };
}

/**
 * Thiết kế mạch lọc thông thấp RC (Low-Pass Filter).
 * @param {number} cutoffFreq - Tần số cắt mong muốn (Hz)
 * @param {number} rValue - Giá trị điện trở sử dụng (Ohm)
 * @returns {object} Dung lượng tụ điện C (F, uF, nF)
 */
function calculateRcLowPass(cutoffFreq, rValue) {
  if (cutoffFreq <= 0 || rValue <= 0) {
    throw new Error('Các giá trị đầu vào phải lớn hơn 0!');
  }
  const cFarad = 1 / (2 * Math.PI * rValue * cutoffFreq);
  return {
    cFarad: cFarad,
    cMicroFarad: Math.round(cFarad * 1000000 * 100) / 100,
    cNanoFarad: Math.round(cFarad * 1000000000 * 100) / 100,
  };
}
