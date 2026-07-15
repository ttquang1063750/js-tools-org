/**
 * passive-diagnostics.js
 * Logic chẩn đoán linh kiện thụ động (R, C, Fuse)
 * Phân tích các biểu hiện sai lệch trị số điện trở, sự suy hao điện dung
 * và cơ chế đo dòng rò trong chẩn đoán mạch điện tử thực tế.
 */

class ComponentDiagnosticEngine {
  // Kiểm tra tụ điện hóa
  checkCapacitor(nominalCapacitance, measuredCapacitance, measuredESR) {
    const capRatio = measuredCapacitance / nominalCapacitance;

    // Tụ bị phồng hoặc khô: dung lượng giảm, nội trở ESR tăng vọt
    if (capRatio < 0.8 || measuredESR > 10.0) {
      return {
        status: 'DEGRADED',
        verdict: 'Tụ đã bị khô điện dịch (suy hao dung lượng) hoặc phồng đầu. Cần thay mới.',
        rippleRisk: 'HIGH',
      };
    }

    if (measuredESR < 0.05 && measuredCapacitance < 1e-9) {
      return {
        status: 'SHORTED',
        verdict: 'Tụ bị chập hoàn toàn (trở kháng DC xấp xỉ 0 Ohm). Phải thay mới ngay lập tức.',
        rippleRisk: 'CRITICAL',
      };
    }

    return {
      status: 'GOOD',
      verdict: 'Tụ điện hoạt động tốt, điện dung và nội trở ESR trong phạm vi cho phép.',
      rippleRisk: 'LOW',
    };
  }

  // Kiểm tra điện trở
  checkResistor(nominalValue, measuredValue, tolerancePercent = 5) {
    const minVal = nominalValue * (1 - tolerancePercent / 100);
    const maxVal = nominalValue * (1 + tolerancePercent / 100);

    if (measuredValue > nominalValue * 10) {
      return {
        status: 'OPEN',
        verdict: 'Điện trở đã bị đứt mạch hoàn toàn (trở kháng vô hạn hoặc cực kỳ lớn).',
        damageType: 'Thermal Overload',
      };
    }

    if (measuredValue < minVal || measuredValue > maxVal) {
      return {
        status: 'DRIFTED',
        verdict: `Trị số điện trở bị trôi lệch ra ngoài khoảng sai số cho phép (${minVal}Ω - ${maxVal}Ω).`,
        damageType: 'Aging / Overheating',
      };
    }

    return {
      status: 'GOOD',
      verdict: 'Điện trở hoạt động tốt, trị số nằm trong dải sai số kỹ thuật.',
    };
  }

  // Kiểm tra cầu chì
  checkFuse(ratedCurrent, measuredResistance) {
    if (measuredResistance > 1.0) {
      return {
        status: 'BLOWN',
        verdict: 'Cầu chì đã bị đứt bảo vệ quá dòng (trở kháng hở mạch O.L).',
        replaceRequired: true,
      };
    }
    return {
      status: 'GOOD',
      verdict: 'Cầu chì thông mạch bình thường (trở kháng cực nhỏ < 1 Ohm).',
      replaceRequired: false,
    };
  }
}

// Thử nghiệm chẩn đoán thực tế
const inspector = new ComponentDiagnosticEngine();

console.log('=== CHẨN ĐOÁN TỤ NGUỒN C1 (2200uF) ===');
const badCap = inspector.checkCapacitor(2200e-6, 120e-6, 45.0); // Dung lượng tụt, ESR vọt
console.log(`Trạng thái: ${badCap.status} -> ${badCap.verdict}`);

console.log('\n=== CHẨN ĐOÁN TRỞ PHÂN CỰC R1 (10K) ===');
const burnedRes = inspector.checkResistor(10000, 158000, 5); // Giá trị trôi quá lớn
console.log(`Trạng thái: ${burnedRes.status} -> ${burnedRes.verdict}`);

console.log('\n=== CHẨN ĐOÁN CẦU CHÌ CHÍNH F1 ===');
const deadFuse = inspector.checkFuse(2.0, 999999); // Trở kháng hở mạch
console.log(`Trạng thái: ${deadFuse.status} -> ${deadFuse.verdict}`);
