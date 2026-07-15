/**
 * multimeter-simulator.js
 * Engine tính toán đo đạc cho đồng hồ vạn năng ảo (VOM/DMM Engine)
 * Giúp mô phỏng hoạt động đo nóng (VDC/VAC) và đo nguội (Resistance/Diode)
 * dựa trên sơ đồ cầu phân áp nối tiếp và song song.
 */

class MultimeterSimulator {
  constructor(voltageSource = 12.0) {
    this.voltageSource = voltageSource;
    // Cầu phân áp nối tiếp: R1 = 10k, R2 = 20k
    this.r1 = 10000; // 10k Ohm
    this.r2 = 20000; // 20k Ohm
    this.fuseBlown = false;
  }

  // Đo điện áp DC (Đo nóng)
  measureVDC(probeRed, probeBlack) {
    if (this.fuseBlown) return 0.0;

    // GND làm COM (-)
    if (probeBlack === 'GND') {
      if (probeRed === 'VCC') return this.voltageSource;
      if (probeRed === 'TP1') {
        // Cầu phân áp: V_out = V_in * R2 / (R1 + R2)
        return (this.voltageSource * this.r2) / (this.r1 + this.r2);
      }
      if (probeRed === 'GND') return 0.0;
    }

    if (probeBlack === 'TP1' && probeRed === 'VCC') {
      // Đo sụt áp trên R1: V_R1 = V_in - V_out
      return this.voltageSource - (this.voltageSource * this.r2) / (this.r1 + this.r2);
    }

    return 0.0;
  }

  // Đo trở kháng (Đo nguội) - Mạch phải tắt nguồn!
  measureResistance(probeRed, probeBlack, isPowerOn = false) {
    if (isPowerOn) {
      // Pitfall kinh điển: Đo trở khi mạch đang cấp nguồn gây hỏng đồng hồ
      this.fuseBlown = true;
      return 'FUSE_BLOWN';
    }

    if (probeBlack === 'GND' && probeRed === 'TP1') {
      // Đo song song qua R2 (giả sử tách biệt)
      return this.r2;
    }

    if (probeBlack === 'TP1' && probeRed === 'VCC') {
      return this.r1;
    }

    if (probeBlack === 'GND' && probeRed === 'VCC') {
      // Trở kháng toàn mạch nối tiếp R1 + R2
      return this.r1 + this.r2;
    }

    return 'O.L';
  }

  // Đo Diode (Đo nguội)
  measureDiode(probeRed, probeBlack, diodeDirection = 'forward') {
    if (diodeDirection === 'forward') {
      // Sụt áp thuận Silicon khoảng 0.6V - 0.7V
      return 0.65;
    } else {
      // Phân cực ngược chặn hoàn toàn
      return 'O.L';
    }
  }
}

// Chạy thử nghiệm kịch bản
const dmm = new MultimeterSimulator(12.0);

console.log('=== THỰC NGHIỆM ĐO NÓNG (VDC) ===');
console.log(`Đo áp nguồn VCC (Que đen -> GND, Que đỏ -> VCC): ${dmm.measureVDC('VCC', 'GND')} V`);
console.log(
  `Đo áp trung điểm TP1 (Que đen -> GND, Que đỏ -> TP1): ${dmm.measureVDC('TP1', 'GND').toFixed(2)} V (Lý thuyết: 8.00V)`
);
console.log(
  `Đo sụt áp trên trở R1 (Que đen -> TP1, Que đỏ -> VCC): ${dmm.measureVDC('VCC', 'TP1').toFixed(2)} V (Lý thuyết: 4.00V)`
);

console.log('\n=== THỰC NGHIỆM ĐO NGUỘI (RESISTANCE) ===');
console.log(`Đo trở kháng toàn mạch (Nguồn OFF): ${dmm.measureResistance('VCC', 'GND', false)} Ω`);
console.log(`Đo trở kháng (Nguồn ON - lỗi cấm!): ${dmm.measureResistance('VCC', 'GND', true)}`);
console.log(`Trạng thái đo sau khi cháy cầu chì đồng hồ: ${dmm.measureVDC('VCC', 'GND')} V`);
