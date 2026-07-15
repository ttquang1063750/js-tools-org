/**
 * linear-power-diagnostics.js
 * Logic chẩn đoán khối nguồn tuyến tính (Biến áp -> Cầu Diode -> Tụ lọc -> IC ổn áp 78xx/79xx)
 * Mô phỏng hiện tượng sóng gợn AC (ripple) rò qua IC ổn áp khi tụ lọc bị khô
 * và cách phát hiện IC ổn áp bị chập/đứt bằng phép đo Vin-Vout.
 */

class LinearPowerDiagnosticEngine {
  // 5.1/5.2: Tụ lọc khô làm ripple input tăng vọt, có thể vượt biên độ dự trữ (dropout) của IC ổn áp
  analyzeRippleThroughRegulator(vinAvg, vinRippleVpp, dropoutV, voutTarget) {
    const vinValley = vinAvg - vinRippleVpp / 2;
    const requiredMin = voutTarget + dropoutV;
    const regulationHolds = vinValley >= requiredMin;
    const estimatedOutputRippleV = regulationHolds ? 0.015 : Number((requiredMin - vinValley).toFixed(3));

    return {
      vinValley,
      requiredMin,
      regulationHolds,
      estimatedOutputRippleV,
      verdict: regulationHolds
        ? `Đáy sóng gợn Vin=${vinValley}V vẫn cao hơn ngưỡng tối thiểu ${requiredMin}V — IC ổn áp giữ được điều áp, ripple ngõ ra chỉ còn ${estimatedOutputRippleV * 1000}mV.`
        : `Đáy sóng gợn Vin chỉ còn ${vinValley}V, THẤP HƠN ngưỡng tối thiểu ${requiredMin}V — IC ổn áp mất điều áp tức thời tại mỗi đáy sóng, làm rò ripple ${(estimatedOutputRippleV * 1000).toFixed(0)}mV ra ngõ ra dù áp DC trung bình đo được vẫn gần đúng danh định.`,
    };
  }

  // 5.3: Kiểm tra IC ổn áp 78xx/79xx bằng phép đo Vin - Vout
  checkRegulatorIC(vin, vout, voutTarget, tolerancePercent = 5) {
    const minOk = voutTarget * (1 - tolerancePercent / 100);
    const maxOk = voutTarget * (1 + tolerancePercent / 100);

    if (Math.abs(vout - vin) < 0.5) {
      return {
        status: 'SHORTED',
        verdict: `Vout=${vout}V gần bằng Vin=${vin}V — IC ổn áp bị CHẬP thông áp trực tiếp, nguy hiểm cho toàn bộ tải phía sau vì áp vào chưa ổn định đi thẳng ra tải.`,
      };
    }
    if (vout < 0.2) {
      return {
        status: 'OPEN',
        verdict: `Vout chỉ ${vout}V dù Vin=${vin}V — IC ổn áp bị ĐỨT, không còn xuất áp ra tải.`,
      };
    }
    if (vout >= minOk && vout <= maxOk) {
      return {
        status: 'GOOD',
        verdict: `Vout=${vout}V nằm trong dải cho phép (${minOk.toFixed(2)}V - ${maxOk.toFixed(2)}V) — IC ổn áp hoạt động bình thường.`,
      };
    }
    return {
      status: 'DRIFTED',
      verdict: `Vout=${vout}V lệch khỏi dải cho phép, nghi ngờ IC ổn áp suy giảm hoặc quá tải.`,
    };
  }
}

// Thử nghiệm chẩn đoán thực tế
const inspector = new LinearPowerDiagnosticEngine();

console.log('=== NGUỒN 12VDC — TỤ LỌC CÒN TỐT ===');
const goodRipple = inspector.analyzeRippleThroughRegulator(18, 1.5, 2, 12);
console.log(goodRipple.verdict);

console.log('\n=== NGUỒN 12VDC — TỤ LỌC KHÔ (RIPPLE RÒ QUA IC ỔN ÁP) ===');
const badRipple = inspector.analyzeRippleThroughRegulator(14, 6, 2, 12);
console.log(badRipple.verdict);

console.log('\n=== KIỂM TRA IC ỔN ÁP 7812 CHẬP THÔNG ÁP ===');
const shortedIC = inspector.checkRegulatorIC(18, 17.9, 12);
console.log(`${shortedIC.status} -> ${shortedIC.verdict}`);
