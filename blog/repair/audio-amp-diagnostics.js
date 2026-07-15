/**
 * audio-amp-diagnostics.js
 * Logic chẩn đoán khối khuếch đại âm thanh (Push-Pull Class AB)
 * Kiểm tra điểm trung điểm DC ngõ ra loa và hiện tượng rò rỉ dòng một chiều
 * qua tụ liên lạc gây rè xè xè hoặc lệch phân cực tầng sau.
 */

class AudioAmpDiagnosticEngine {
  // 7.2: Điểm trung điểm DC (Midpoint) — lệch áp bơm dòng DC phá hỏng loa
  checkMidpointVoltage(measuredV, supplyType, supplyVoltage, speakerImpedance, thresholdV = 0.3) {
    const expected = supplyType === 'single' ? supplyVoltage / 2 : 0;
    const offset = Number((measuredV - expected).toFixed(2));

    if (Math.abs(offset) > thresholdV) {
      const dcCurrentA = Number((Math.abs(offset) / speakerImpedance).toFixed(3));
      return {
        status: 'DC_OFFSET_FAULT',
        offset,
        dcCurrentA,
        verdict: `Trung điểm lệch ${offset}V so với kỳ vọng ${expected}V — bơm dòng DC liên tục ${dcCurrentA}A qua cuộn dây loa (${speakerImpedance}Ω), gây cháy loa và hút lệch màng loa về một phía. TUYỆT ĐỐI không cắm loa thật khi chưa sửa xong.`,
      };
    }
    return {
      status: 'GOOD',
      offset,
      verdict: `Trung điểm ${measuredV}V rất gần kỳ vọng ${expected}V (lệch chỉ ${offset}V) — tầng công suất cân bằng tốt, an toàn cho loa.`,
    };
  }

  // 7.3: Tụ liên lạc rò rỉ dòng một chiều làm lệch phân cực tầng sau
  checkCouplingCapacitor(dcLeakageV, thresholdV = 0.05) {
    if (dcLeakageV > thresholdV) {
      return {
        status: 'LEAKY',
        verdict: `Rò rỉ ${dcLeakageV}V một chiều qua tụ liên lạc (lý thuyết phải gần 0V vì tụ chặn DC hoàn toàn) — làm dịch điểm phân cực tầng sau, gây rè xè xè hoặc méo tiếng nhẹ.`,
      };
    }
    return {
      status: 'GOOD',
      verdict: `Rò rỉ chỉ ${(dcLeakageV * 1000).toFixed(0)}mV — tụ liên lạc chặn DC tốt, không ảnh hưởng phân cực tầng sau.`,
    };
  }
}

// Thử nghiệm chẩn đoán thực tế
const inspector = new AudioAmpDiagnosticEngine();

console.log('=== KIỂM TRA TRUNG ĐIỂM DC (Amply nguồn đơn 24V) — TỐT ===');
const goodMid = inspector.checkMidpointVoltage(12.03, 'single', 24, 8);
console.log(`${goodMid.status} -> ${goodMid.verdict}`);

console.log('\n=== KIỂM TRA TRUNG ĐIỂM DC (Amply nguồn đơn 24V) — LỆCH ÁP NGUY HIỂM ===');
const badMid = inspector.checkMidpointVoltage(15.2, 'single', 24, 8);
console.log(`${badMid.status} -> ${badMid.verdict}`);

console.log('\n=== KIỂM TRA TỤ LIÊN LẠC — RÒ RỈ DC ===');
const leaky = inspector.checkCouplingCapacitor(0.78);
console.log(`${leaky.status} -> ${leaky.verdict}`);
