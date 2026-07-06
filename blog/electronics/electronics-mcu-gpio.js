/**
 * electronics-mcu-gpio.js
 * Bài 15 — Kiến trúc vi điều khiển (MCU) & Giao tiếp GPIO.
 * Trình giả lập MCU ảo: chạy từng lệnh C thao tác thanh ghi DDRB/PORTB/PINB,
 * quan sát giá trị thanh ghi và trạng thái LED vật lý (chân PB5) đổi theo.
 */

(function () {
  const PB5 = 5; // bit điều khiển LED trên cổng B (giống LED tích hợp Arduino Uno)
  const MASK_PB5 = 1 << PB5;

  const canvasEl = document.getElementById('mcuProgramList');
  if (!canvasEl) return; // file được nạp ở trang khác không có simulator

  // Chương trình mẫu: cấu hình PB5 output rồi chớp tắt liên tục.
  // type: 'code' (thực thi thay đổi thanh ghi) hoặc 'comment' (chỉ hiển thị, coi như độ trễ).
  const program = [
    { type: 'code', text: 'DDRB |= (1 << PB5);', isDdrLine: true, run: (s) => (s.ddrb |= MASK_PB5) },
    { type: 'code', text: 'PORTB |= (1 << PB5);', run: (s) => (s.portb |= MASK_PB5) },
    { type: 'comment', text: '// delay(500);  — giả lập trễ 500ms' },
    { type: 'code', text: 'PORTB &= ~(1 << PB5);', run: (s) => (s.portb &= ~MASK_PB5 & 0xff) },
    { type: 'comment', text: '// delay(500);  — giả lập trễ 500ms' },
  ];

  // ---- Trạng thái ----
  let state = { ddrb: 0, portb: 0, pinb: 0 };
  let currentIndex = 0;
  let skipDdr = false;
  let autoTimer = null;

  // ---- DOM ----
  const btnStep = document.getElementById('btnStep');
  const btnAuto = document.getElementById('btnAuto');
  const btnReset = document.getElementById('btnReset');
  const btnSkipDDR = document.getElementById('btnSkipDDR');
  const noteEl = document.getElementById('mcuNote');
  const ledEl = document.getElementById('mcuLed');

  // ---- Tính PINB (mức điện áp THẬT tại chân vật lý) ----
  // Bit output (DDR=1): PIN phản ánh đúng giá trị PORT đang lái ra chân.
  // Bit input (DDR=0): không có tín hiệu ngoài nối vào trong demo này nên chân trôi nổi ở mức thấp —
  // đúng là hậu quả thật của cạm bẫy "quên set DDR": PORT có thể =1 nhưng chân vẫn không được lái ra ngoài.
  function computePinb(s) {
    return s.portb & s.ddrb;
  }

  function renderProgram() {
    canvasEl.innerHTML = '';
    program.forEach((line, i) => {
      const div = document.createElement('div');
      const skippedThisLine = skipDdr && line.isDdrLine;
      div.className =
        'mcu-line' + (i === currentIndex ? ' is-current' : '') + (line.type === 'comment' ? ' is-comment' : '');
      div.textContent = (skippedThisLine ? '// [BỎ QUA] ' : '') + line.text;
      if (skippedThisLine) div.style.textDecoration = 'line-through';
      canvasEl.appendChild(div);
    });
  }

  function renderRegisterBits(containerId, value) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    for (let bit = 7; bit >= 0; bit--) {
      const isSet = (value >> bit) & 1;
      const box = document.createElement('div');
      box.className = 'mcu-bit' + (isSet ? ' is-set' : '') + (bit === PB5 ? ' is-pb5' : '');
      box.textContent = isSet ? '1' : '0';
      box.title = 'Bit ' + bit + (bit === PB5 ? ' (PB5)' : '');
      el.appendChild(box);
    }
  }

  function toHex(v) {
    return '0x' + v.toString(16).padStart(2, '0').toUpperCase();
  }

  function renderRegisters() {
    state.pinb = computePinb(state);
    renderRegisterBits('bitsDDRB', state.ddrb);
    renderRegisterBits('bitsPORTB', state.portb);
    renderRegisterBits('bitsPINB', state.pinb);
    document.getElementById('hexDDRB').textContent = toHex(state.ddrb);
    document.getElementById('hexPORTB').textContent = toHex(state.portb);
    document.getElementById('hexPINB').textContent = toHex(state.pinb);
  }

  function renderLed() {
    const ledOn = (state.pinb & MASK_PB5) !== 0;
    ledEl.setAttribute('fill', ledOn ? '#f38ba8' : '#313244');
    ledEl.style.filter = ledOn ? 'drop-shadow(0 0 6px #f38ba8)' : 'none';
  }

  function renderNote() {
    const portBit5 = (state.portb >> PB5) & 1;
    const ddrBit5 = (state.ddrb >> PB5) & 1;
    if (skipDdr && portBit5 === 1 && ddrBit5 === 0) {
      noteEl.innerHTML =
        '⚠️ <strong>PORTB bit 5 = 1 nhưng LED vẫn tối!</strong> Vì DDRB bit 5 = 0 (chưa cấu hình OUTPUT), bit PORT ' +
        'đó chỉ đang bật pull-up nội bộ chứ không lái dòng ra chân — đúng cạm bẫy ở mục 4. Bấm "Reset" rồi bỏ tick ' +
        'chế độ lỗi để xem LED sáng đúng.';
    } else {
      const line = program[currentIndex];
      noteEl.textContent = line ? 'Dòng lệnh hiện tại: ' + line.text : 'Chương trình đã chạy xong một vòng.';
    }
  }

  function renderAll() {
    renderProgram();
    renderRegisters();
    renderLed();
    renderNote();
  }

  function step() {
    const line = program[currentIndex];
    const isSkippedDdr = skipDdr && line.isDdrLine;
    if (line.type === 'code' && !isSkippedDdr) {
      line.run(state);
    }
    // Sau vòng đầu, lặp lại từ lệnh 1 (bỏ qua lệnh set DDR — chỉ cần cấu hình 1 lần lúc khởi động)
    currentIndex = currentIndex + 1 >= program.length ? 1 : currentIndex + 1;
    renderAll();
  }

  function reset() {
    state = { ddrb: 0, portb: 0, pinb: 0 };
    currentIndex = 0;
    stopAuto();
    renderAll();
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      btnAuto.textContent = '🔁 Tự động chạy';
    }
  }

  function toggleAuto() {
    if (autoTimer) {
      stopAuto();
    } else {
      btnAuto.textContent = '⏸ Dừng lại';
      autoTimer = setInterval(step, 600);
    }
  }

  btnStep.addEventListener('click', step);
  btnAuto.addEventListener('click', toggleAuto);
  btnReset.addEventListener('click', reset);
  btnSkipDDR.addEventListener('click', () => {
    skipDdr = !skipDdr;
    btnSkipDDR.textContent = skipDdr ? '✅ Bật lại bước set DDR' : '❌ Bỏ qua bước set DDR (thử lỗi)';
    reset();
  });

  renderAll();
})();
