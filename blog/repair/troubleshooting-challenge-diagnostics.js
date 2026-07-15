/**
 * troubleshooting-challenge-diagnostics.js
 * Dự án tổng hợp: mô phỏng quy trình chẩn đoán 5 bước áp dụng cho 2 thiết bị thực tế —
 * Quạt điều khiển từ xa mất nguồn (tụ hạ áp khô) và Bộ sạc pin thông minh sạc không vào
 * (diode chỉnh lưu thứ cấp đứt). Bao gồm cơ chế "Thay thế linh kiện" có phạt chi phí
 * nếu đoán mò thay nhầm linh kiện còn tốt.
 */

class TroubleshootingChallengeEngine {
  constructor() {
    this.devices = {
      FAN: {
        name: 'Quạt điều khiển từ xa mất nguồn',
        testPoints: {
          TP1: {
            label: 'Sau tụ hạ áp (đo AC, trước cầu diode nhỏ)',
            expected: '12-15VAC',
            measured: '2.1VAC',
            fault: true,
          },
          TP2: {
            label: 'Sau cầu diode + tụ lọc nhỏ (đo DC)',
            expected: '15-18VDC',
            measured: '2.8VDC',
            fault: true,
          },
          TP3: {
            label: 'Ngõ ra ổn áp Zener nuôi vi điều khiển (đo DC)',
            expected: '5.0VDC',
            measured: '0.8VDC',
            fault: true,
          },
        },
        correctComponent: 'DROPPER_CAP',
        components: {
          DROPPER_CAP: { name: 'Tụ hạ áp X2 (dropper capacitor)', cost: 15000 },
          BRIDGE_DIODE: { name: 'Cầu diode nhỏ', cost: 5000 },
          ZENER_IC: { name: 'IC ổn áp Zener 5V', cost: 8000 },
          MCU: { name: 'Vi điều khiển thu tín hiệu', cost: 45000 },
        },
      },
      CHARGER: {
        name: 'Bộ sạc pin thông minh sạc không vào',
        testPoints: {
          TP1: {
            label: 'Ngõ ra SMPS trước điện trở shunt (đo DC tĩnh, không tải)',
            expected: '~5.0VDC',
            measured: '5.02VDC',
            fault: false,
          },
          TP2: {
            label: 'Sụt áp trên điện trở shunt đo dòng (đã cắm pin tải)',
            expected: '~100mV (ứng với 1A sạc)',
            measured: '0mV',
            fault: true,
          },
          TP3: {
            label: 'Đo thang Diode trên diode chỉnh lưu thứ cấp',
            expected: 'Vf~0.3-0.5V thuận, O.L ngược',
            measured: 'O.L cả hai chiều',
            fault: true,
          },
        },
        correctComponent: 'RECT_DIODE',
        components: {
          RECT_DIODE: { name: 'Diode chỉnh lưu thứ cấp', cost: 5000 },
          SHUNT_RESISTOR: { name: 'Điện trở shunt đo dòng', cost: 3000 },
          CHARGE_IC: { name: 'IC điều khiển sạc', cost: 35000 },
        },
      },
    };
  }

  // Bước "Đo linh kiện" trong quy trình 5 bước
  inspectTestPoint(deviceId, tpId) {
    const tp = this.devices[deviceId].testPoints[tpId];
    return { ...tp, verdict: tp.fault ? 'BẤT THƯỜNG' : 'BÌNH THƯỜNG' };
  }

  // Bước "Thay thế & Đo lại" — phạt chi phí nếu đoán mò sai
  attemptReplace(deviceId, componentId) {
    const device = this.devices[deviceId];
    const part = device.components[componentId];
    const isCorrect = componentId === device.correctComponent;
    return {
      success: isCorrect,
      cost: part.cost,
      message: isCorrect
        ? `Thay ${part.name} (${part.cost.toLocaleString('vi-VN')}đ) — SỬA THÀNH CÔNG! Thiết bị hoạt động trở lại bình thường.`
        : `Thay ${part.name} (${part.cost.toLocaleString('vi-VN')}đ) — KHÔNG PHẢI nguyên nhân, linh kiện tốt bị tháo oan, lãng phí chi phí và thời gian. Đo lại các Test Point để xác định đúng linh kiện lỗi.`,
    };
  }
}

// Thử nghiệm chẩn đoán thực tế
const engine = new TroubleshootingChallengeEngine();

console.log('=== THIẾT BỊ 1: Quạt điều khiển từ xa mất nguồn ===');
for (const tp of ['TP1', 'TP2', 'TP3']) {
  const r = engine.inspectTestPoint('FAN', tp);
  console.log(`${tp}: ${r.label} -> Đo được ${r.measured} (Kỳ vọng ${r.expected}) => ${r.verdict}`);
}
const fanFix = engine.attemptReplace('FAN', 'DROPPER_CAP');
console.log(`Sửa chữa: ${fanFix.message}`);

console.log('\n=== THIẾT BỊ 2: Bộ sạc pin thông minh sạc không vào ===');
for (const tp of ['TP1', 'TP2', 'TP3']) {
  const r = engine.inspectTestPoint('CHARGER', tp);
  console.log(`${tp}: ${r.label} -> Đo được ${r.measured} (Kỳ vọng ${r.expected}) => ${r.verdict}`);
}
const chargerFix = engine.attemptReplace('CHARGER', 'RECT_DIODE');
console.log(`Sửa chữa: ${chargerFix.message}`);
