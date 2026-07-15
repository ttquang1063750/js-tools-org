/**
 * smps-diagnostics.js
 * Logic chẩn đoán khối nguồn xung (Switched-Mode Power Supply)
 * Kiểm tra tầng chỉnh lưu sơ cấp 300VDC, MOSFET công suất chập
 * và hiện tượng mất hồi tiếp (feedback loop) qua Optocoupler gây quá áp/hiccup.
 */

class SMPSDiagnosticEngine {
  // 6.2: Điện áp sơ cấp (Hot side) sau cầu diode + tụ lọc 300V
  checkPrimaryRail(measuredVdc, expectedVdc = 300, tolerancePercent = 15) {
    const minOk = expectedVdc * (1 - tolerancePercent / 100);
    if (measuredVdc < 5) {
      return {
        status: 'ZERO',
        verdict: `Đo được ${measuredVdc}V trên tụ lọc sơ cấp — mất hoàn toàn điện áp DC, nghi ngờ cầu chì đứt hoặc cầu diode chỉnh lưu hở mạch.`,
      };
    }
    if (measuredVdc < minOk) {
      return {
        status: 'LOW',
        verdict: `Đo được ${measuredVdc}V, thấp hơn ngưỡng tối thiểu ${minOk.toFixed(0)}V — nghi ngờ 1 trong 4 diode cầu chỉnh lưu bị đứt (mạch chỉ còn chỉnh lưu bán kỳ).`,
      };
    }
    return {
      status: 'GOOD',
      verdict: `Đo được ${measuredVdc}V, nằm trong dải bình thường (~${expectedVdc}V) — tầng chỉnh lưu sơ cấp hoạt động tốt.`,
    };
  }

  // 6.2: MOSFET công suất sơ cấp bị chập (nguyên nhân phổ biến nổ cầu chì)
  checkPrimaryMosfet(rdsOhms) {
    if (rdsOhms < 50) {
      return {
        status: 'SHORTED',
        verdict: `Đo trở kháng D-S nguội chỉ ${rdsOhms}Ω (lý thuyết phải hàng trăm kOhm đến MOhm) — MOSFET công suất sơ cấp bị chập, nguyên nhân phổ biến làm nổ cầu chì lặp lại mỗi lần cấp điện.`,
      };
    }
    return { status: 'GOOD', verdict: `Trở kháng D-S đo nguội ${rdsOhms}Ω (cao) — MOSFET không bị chập.` };
  }

  // 6.3: Mất hồi tiếp qua Optocoupler làm PWM chạy hết công suất -> quá áp -> hiccup
  checkFeedbackLoop(targetVoltage, optoCtrPercent, ovpThreshold) {
    const ctrHealthyMin = 30;
    if (optoCtrPercent < ctrHealthyMin) {
      const attempted = Math.min(targetVoltage * (100 / optoCtrPercent), ovpThreshold + 3);
      return {
        status: 'OVP_HICCUP',
        attemptedVoltage: Number(attempted.toFixed(1)),
        verdict: `Optocoupler suy giảm CTR còn ${optoCtrPercent}% (bình thường ~100%) khiến mạch hồi tiếp báo sai tín hiệu "áp còn thấp", PWM tiếp tục mở xung tối đa đẩy áp ra lên tới ${attempted.toFixed(1)}V trước khi mạch bảo vệ quá áp (ngưỡng OVP ${ovpThreshold}V) cắt và khởi động lại — biểu hiện ra ngoài là đèn nguồn nhấp nháy/tạch tạch liên tục (hiccup mode).`,
      };
    }
    return {
      status: 'GOOD',
      attemptedVoltage: targetVoltage,
      verdict: `Optocoupler CTR ${optoCtrPercent}% bình thường — áp ra ổn định đúng ${targetVoltage}V.`,
    };
  }
}

// Thử nghiệm chẩn đoán thực tế
const inspector = new SMPSDiagnosticEngine();

console.log('=== KIỂM TRA RAIL SƠ CẤP 300VDC (Cầu chì đứt) ===');
const zeroRail = inspector.checkPrimaryRail(0);
console.log(`${zeroRail.status} -> ${zeroRail.verdict}`);

console.log('\n=== KIỂM TRA MOSFET CÔNG SUẤT SƠ CẤP (Chập) ===');
const shortedFet = inspector.checkPrimaryMosfet(8);
console.log(`${shortedFet.status} -> ${shortedFet.verdict}`);

console.log('\n=== KIỂM TRA VÒNG HỒI TIẾP (Optocoupler suy giảm CTR) ===');
const hiccup = inspector.checkFeedbackLoop(19, 15, 26);
console.log(`${hiccup.status} -> ${hiccup.verdict}`);
