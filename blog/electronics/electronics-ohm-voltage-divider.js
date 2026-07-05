/**
 * electronics-ohm-voltage-divider.js
 * Thư viện các hàm tính toán Định luật Ohm và mạch phân áp.
 * File này được đính kèm làm tài liệu thực hành cho Bài 2: Định luật Ohm & Mạch cầu phân áp.
 */

/**
 * Giải định luật Ohm khi biết 2 trong 3 đại lượng (V, I, R).
 * @param {object} known - Object chứa các giá trị đã biết (ví dụ: { V: 9, I: 0.03 })
 * @returns {object} Trả về cả 3 giá trị V (Volt), I (Ampere), R (Ohm)
 */
function giaiOhm({ V, I, R }) {
  if (V === undefined && I !== undefined && R !== undefined) {
    return { V: I * R, I, R };
  }
  if (I === undefined && V !== undefined && R !== undefined) {
    return { V, I: V / R, R };
  }
  if (R === undefined && V !== undefined && I !== undefined) {
    return { V, I, R: V / I };
  }
  throw new Error('Cần cung cấp chính xác 2 trong 3 tham số V, I, R!');
}

/**
 * Tính điện áp ngõ ra của mạch phân áp không tải.
 * @param {number} vIn - Điện áp nguồn ngõ vào (V)
 * @param {number} r1 - Điện trở nhánh trên (Ohm)
 * @param {number} r2 - Điện trở nhánh dưới (Ohm)
 * @returns {number} Điện áp ngõ ra Vout (V)
 */
function cauPhanAp(vIn, r1, r2) {
  if (r1 + r2 === 0) return 0;
  return (vIn * r2) / (r1 + r2);
}

/**
 * Tính điện áp ngõ ra của mạch phân áp khi có tải mắc song song với R2 (Loading Effect).
 * @param {number} vIn - Điện áp nguồn ngõ vào (V)
 * @param {number} r1 - Điện trở nhánh trên (Ohm)
 * @param {number} r2 - Điện trở nhánh dưới (Ohm)
 * @param {number} rTai - Điện trở của tải mắc song song với R2 (Ohm)
 * @returns {number} Điện áp ngõ ra Vout thực tế (V)
 */
function cauPhanApCoTai(vIn, r1, r2, rTai) {
  const r2SongSong = (r2 * rTai) / (r2 + rTai);
  return (vIn * r2SongSong) / (r1 + r2SongSong);
}

/**
 * Tính dòng điện chạy qua LED trong mạch phân thế có chiết áp điều chỉnh độ sáng.
 * Mạch gồm: Nguồn -> Trở bảo vệ -> LED -> Chiết áp -> GND.
 * @param {number} vIn - Điện áp nguồn (V)
 * @param {number} vLed - Sụt áp thuận của LED (V)
 * @param {number} rBaoVe - Điện trở bảo vệ nối tiếp (Ohm)
 * @param {number} rPot - Điện trở hiện tại của chiết áp (Ohm)
 * @returns {number} Dòng điện chạy qua mạch (A)
 */
function dongQuaLed(vIn, vLed, rBaoVe, rPot) {
  const rTong = rBaoVe + rPot;
  if (rTong <= 0) return Infinity;
  if (vIn <= vLed) return 0;
  return (vIn - vLed) / rTong;
}
