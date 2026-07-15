/**
 * semiconductor-diagnostics.js
 * Logic chẩn đoán linh kiện bán dẫn (Diode, Zener, BJT, MOSFET/IGBT)
 * Mô phỏng phép đo thang Diode, kiểm tra hai tiếp giáp P-N chung cực Base
 * của Transistor BJT và kỹ thuật kích/xả Gate ảo trên MOSFET công suất.
 */

class SemiconductorDiagnosticEngine {
  // 4.1 Kiểm tra Diode chỉnh lưu / Diode Zener
  checkDiode(vfForward, isReverseConducting, testMode = 'diode') {
    // Thang đo trở kháng (testMode 'resistance') có điện áp hở mạch thấp,
    // không đủ để phân cực thuận tiếp giáp P-N -> luôn hiện OL kể cả diode tốt.
    if (testMode === 'resistance') {
      return {
        status: 'FALSE_OPEN_PITFALL',
        verdict:
          'Đo bằng thang trở kháng thông thường khiến tiếp giáp tốt cũng hiện O.L ở cả hai chiều — dễ kết luận nhầm là đứt. Phải chuyển sang thang đo Diode để có điện áp đủ mở tiếp giáp.',
      };
    }

    if (vfForward === null && !isReverseConducting) {
      return { status: 'OPEN', verdict: 'Diode bị ĐỨT hoàn toàn (O.L cả hai chiều đo).' };
    }

    if (vfForward !== null && vfForward < 0.15 && isReverseConducting) {
      return {
        status: 'SHORTED',
        verdict: `Diode bị CHẬP hoàn toàn (dẫn thông cả hai chiều, Vf đo được chỉ ${vfForward}V).`,
      };
    }

    if (vfForward !== null && vfForward >= 0.3 && vfForward <= 0.9 && !isReverseConducting) {
      return {
        status: 'GOOD',
        verdict: `Diode tốt: chiều thuận sụt áp Vf=${vfForward}V, chiều ngược chặn hoàn toàn (O.L).`,
      };
    }

    return { status: 'UNKNOWN', verdict: 'Số liệu đo không khớp mẫu hình hỏng hóc đã biết.' };
  }

  // 4.2 Kiểm tra Transistor BJT — hai tiếp giáp P-N chung cực Base
  checkBJT(vfBaseEmitter, vfBaseCollector, resistanceCE, inCircuitShuntOhms = null) {
    const junctionBE =
      vfBaseEmitter !== null && vfBaseEmitter >= 0.3 && vfBaseEmitter <= 0.9
        ? { status: 'GOOD', vf: vfBaseEmitter }
        : { status: vfBaseEmitter === null ? 'OPEN' : 'SHORTED', vf: vfBaseEmitter };

    const junctionBC =
      vfBaseCollector !== null && vfBaseCollector >= 0.3 && vfBaseCollector <= 0.9
        ? { status: 'GOOD', vf: vfBaseCollector }
        : { status: vfBaseCollector === null ? 'OPEN' : 'SHORTED', vf: vfBaseCollector };

    const channel =
      resistanceCE < 100
        ? {
            status: 'SHORTED_CE',
            verdict: `C-E dẫn thông với trở kháng chỉ ${resistanceCE}Ω (lý thuyết phải O.L cả hai chiều) — BJT bị chập tiếp giáp C-E do quá nhiệt.`,
          }
        : { status: 'GOOD', verdict: 'C-E cách điện hoàn toàn (O.L) ở cả hai chiều đo — không chập lớp giữa.' };

    const result = { junctionBE, junctionBC, channel };

    if (inCircuitShuntOhms !== null) {
      result.pitfall = {
        status: 'FALSE_SHORT_PITFALL',
        verdict: `Đo trực tiếp trên bo mạch: điện trở phân cực ${inCircuitShuntOhms}Ω mắc song song với tiếp giáp B-E tạo đường dẫn phụ, khiến đồng hồ đọc một trị số điện trở nhỏ thay vì O.L khi đo ngược — dễ kết luận nhầm là chập B-E. Phải nhấc ít nhất 1 chân (B, E hoặc C) khỏi mạch trước khi kết luận.`,
      };
    }

    return result;
  }

  // 4.3 Kiểm tra MOSFET/IGBT — kích mở kênh dẫn bằng cách nạp điện tích Gate ảo
  checkMosfetGateCharge(rdsBeforeCharge, rdsAfterGateTouch, rdsAfterDischarge) {
    const beforeOk = rdsBeforeCharge > 100000;
    const opensAfterTouch = rdsAfterGateTouch < 200;
    const resetsAfterDischarge = rdsAfterDischarge > 100000;

    const steps = [
      {
        step: 'Trước khi kích Gate',
        rds: rdsBeforeCharge,
        note: beforeOk
          ? 'Kênh D-S đang KHOÁ (O.L) — đúng trạng thái ban đầu.'
          : 'Bất thường: kênh đã dẫn dù chưa kích Gate (nghi ngờ còn tồn dư điện tích từ lần đo trước).',
      },
      {
        step: 'Sau khi chạm que đo (+) vào Gate để nạp điện tích',
        rds: rdsAfterGateTouch,
        note: opensAfterTouch
          ? 'Kênh D-S đã MỞ dẫn — Gate kích hoạt bình thường, MOSFET còn tốt.'
          : 'Kênh vẫn KHOÁ dù đã kích Gate — nghi ngờ đứt Gate hoặc hỏng kênh dẫn.',
      },
      {
        step: 'Sau khi xả Gate (chập tạm G-S)',
        rds: rdsAfterDischarge,
        note: resetsAfterDischarge
          ? 'Kênh D-S trở lại KHOÁ (O.L) — xác nhận MOSFET tốt, Gate không bị chập rò.'
          : 'Kênh VẪN dẫn sau khi xả Gate — nghi ngờ chập thật D-S/rò Gate, không phải do tồn dư điện tích.',
      },
    ];

    return {
      status: beforeOk && opensAfterTouch && resetsAfterDischarge ? 'GOOD' : 'SUSPECT',
      steps,
      pitfallNote:
        'Nếu bỏ qua bước xả Gate rồi đo lại ngay, kênh D-S vẫn dẫn do điện tích Gate còn tồn dư — dễ kết luận nhầm là MOSFET bị chập liên tục dù thực chất còn tốt.',
    };
  }
}

// Thử nghiệm chẩn đoán thực tế
const inspector = new SemiconductorDiagnosticEngine();

console.log('=== KIỂM TRA DIODE CHỈNH LƯU D1 (1N4007) ===');
const goodDiode = inspector.checkDiode(0.612, false);
console.log(`Trạng thái: ${goodDiode.status} -> ${goodDiode.verdict}`);

console.log('\n=== KIỂM TRA DIODE ZENER ZD1 (5V1) BẰNG SAI THANG ĐO ===');
const zenerPitfall = inspector.checkDiode(null, false, 'resistance');
console.log(`Trạng thái: ${zenerPitfall.status} -> ${zenerPitfall.verdict}`);

console.log('\n=== KIỂM TRA TRANSISTOR BJT Q1 (Chập tiếp giáp C-E) ===');
const badBJT = inspector.checkBJT(0.648, 0.66, 12);
console.log(`Tiếp giáp B-E: ${badBJT.junctionBE.status}, B-C: ${badBJT.junctionBC.status}`);
console.log(`Kênh C-E: ${badBJT.channel.status} -> ${badBJT.channel.verdict}`);

console.log('\n=== KIỂM TRA MOSFET Q2 (Quy trình kích/xả Gate đúng) ===');
const goodMosfet = inspector.checkMosfetGateCharge(2500000, 45, 2500000);
console.log(`Trạng thái: ${goodMosfet.status}`);
goodMosfet.steps.forEach((s) => console.log(`  [${s.step}] rDS=${s.rds}Ω -> ${s.note}`));
