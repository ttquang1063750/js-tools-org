// vmcu.js — "VMCU": MCU ảo mức thanh ghi dùng chung cho Series 13 (Hệ Thống
// Nhúng). Khởi sinh ở Bài 1 (memory map + bus đọc/ghi thuần — CHƯA có ngoại
// vi nào được nối). Bài 2 sẽ thêm GPIO (MODER/IDR/ODR) vào vùng Peripheral;
// Bài 4 thêm SysTick; Bài 6 thêm Timer/PWM; Bài 7 thêm NVIC/EXTI; Bài 9 thêm
// UART; Bài 10 thêm ADC; Bài 11 thêm DMA; Bài 14-15 thêm mini-RTOS. Import
// trực tiếp từ các bài sau, KHÔNG copy-paste lại logic (tiền lệ
// vlsi-verilite.js Series 11 / ai-neuro.js Series 12).
//
// Cách chạy self-test (không cần cài gì ngoài Node.js):
//   node vmcu.js
// Kỳ vọng in ra: "SELF-TEST PASS (N checks)"

// ---------------------------------------------------------------------------
// Memory map: mô phỏng đúng 3 vùng của một MCU Cortex-M thường gặp (kiểu
// STM32F1 dòng phổ biến) — địa chỉ base/size lấy sát số thật để người đọc
// chuyển sang board thật không bỡ ngỡ.
//   - Flash: nơi chứa mã máy đã biên dịch (firmware) — chỉ ĐỌC được qua bus
//     thường; ghi lại cần trình tự lập trình lại chuyên biệt, ngoài phạm vi
//     VMCU (xem Bài 1 Mục 3).
//   - SRAM: bộ nhớ đọc/ghi tự do — nơi biến toàn cục/stack/heap sống lúc
//     chạy; mất nội dung khi mất điện.
//   - Peripheral: không gian địa chỉ dành cho thanh ghi ngoại vi (GPIO,
//     timer, UART, ADC...). Bài 1 CHƯA nối gì vào đây — đọc luôn ra 0, ghi
//     không có tác dụng gì. Sẽ lấp dần từng ngoại vi từ Bài 2 trở đi.
// ---------------------------------------------------------------------------
const MEMORY_MAP = [
  {
    name: 'Flash (chương trình)',
    kind: 'flash',
    base: 0x08000000,
    size: 0x00020000, // 128KB
    desc: 'Nơi chứa mã máy đã biên dịch (firmware) — chỉ đọc được qua bus thường; ghi lại cần trình tự lập trình lại chuyên biệt (ngoài phạm vi VMCU).',
  },
  {
    name: 'SRAM',
    kind: 'ram',
    base: 0x20000000,
    size: 0x00005000, // 20KB
    desc: 'Bộ nhớ đọc/ghi tự do — nơi biến toàn cục, stack và heap của chương trình sống trong lúc chạy. Mất nội dung khi mất điện.',
  },
  {
    name: 'Peripheral (ngoại vi)',
    kind: 'peripheral',
    base: 0x40000000,
    size: 0x00020000, // 128KB
    desc: 'Không gian địa chỉ dành cho thanh ghi điều khiển phần cứng (GPIO, timer, UART, ADC...). Bài 1 chưa nối ngoại vi nào vào đây — sẽ lấp dần từ Bài 2 trở đi.',
  },
];

class HardFaultError extends Error {
  constructor(addr) {
    super('HardFault: dia chi 0x' + addr.toString(16).toUpperCase() + ' khong thuoc bat ky vung nho nao da anh xa');
    this.name = 'HardFaultError';
    this.addr = addr;
  }
}

class FlashProtectedError extends Error {
  constructor(addr) {
    super('Ghi bi tu choi: dia chi 0x' + addr.toString(16).toUpperCase() + ' nam trong vung Flash chi doc');
    this.name = 'FlashProtectedError';
    this.addr = addr;
  }
}

// Tìm vùng nhớ chứa 1 địa chỉ — trả về null nếu địa chỉ không thuộc vùng nào
// (chính là điều kiện kích hoạt HardFault).
function findRegion(addr) {
  for (const r of MEMORY_MAP) {
    if (addr >= r.base && addr < r.base + r.size) return r;
  }
  return null;
}

class VMCU {
  constructor() {
    const flashRegion = MEMORY_MAP.find((r) => r.kind === 'flash');
    const sramRegion = MEMORY_MAP.find((r) => r.kind === 'ram');
    // Flash trống = toàn 0xFF — đúng hành vi Flash thật chưa được lập trình.
    this.flash = new Uint8Array(flashRegion.size).fill(0xff);
    // SRAM: quy ước khởi động = 0 cho demo dễ theo dõi (thật ra là rác).
    this.sram = new Uint8Array(sramRegion.size);
  }

  read8(addr) {
    const region = findRegion(addr);
    if (!region) throw new HardFaultError(addr);
    const offset = addr - region.base;
    if (region.kind === 'flash') return this.flash[offset];
    if (region.kind === 'ram') return this.sram[offset];
    return 0; // peripheral: chưa nối thanh ghi nào ở Bài 1 — đọc ra 0
  }

  write8(addr, value) {
    const region = findRegion(addr);
    if (!region) throw new HardFaultError(addr);
    if (region.kind === 'flash') throw new FlashProtectedError(addr);
    const v = value & 0xff;
    if (region.kind === 'ram') this.sram[addr - region.base] = v;
    // peripheral: Bài 1 chưa nối gì — ghi không có tác dụng gì (sẽ đổi từ Bài 2)
    return v;
  }

  read32(addr) {
    let v = 0;
    for (let i = 0; i < 4; i++) v |= this.read8(addr + i) << (i * 8);
    return v >>> 0;
  }

  write32(addr, value) {
    for (let i = 0; i < 4; i++) this.write8(addr + i, (value >>> (i * 8)) & 0xff);
  }
}

export { MEMORY_MAP, HardFaultError, FlashProtectedError, findRegion, VMCU };

// ---------------------------------------------------------------------------
// Self-test — chạy bằng `node vmcu.js`. Dùng đúng cùng cơ chế phát hiện
// import.meta.url; kiểm tra `typeof process` trước vì `process` không tồn
// tại trong trình duyệt — thiếu bước này làm ReferenceError ngay khi trang
// import module, hỏng toàn bộ demo (tiền lệ ai-neuro.js Series 12).
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  let errors = 0;
  let checks = 0;
  function check(name, got, exp) {
    checks++;
    if (got !== exp) {
      console.log('LOI', name, 'got=' + got, 'ky vong=' + exp);
      errors++;
    }
  }
  function checkTrue(name, cond) {
    checks++;
    if (!cond) {
      console.log('LOI', name);
      errors++;
    }
  }
  function checkThrows(name, fn, errType) {
    checks++;
    try {
      fn();
      console.log('LOI', name, '(khong nem loi nao)');
      errors++;
    } catch (e) {
      if (!(e instanceof errType)) {
        console.log('LOI', name, 'nem sai loai loi:', e.name);
        errors++;
      }
    }
  }

  // --- findRegion: 3 vùng hợp lệ + các khoảng trống giữa chúng ---
  check('findRegion(Flash base).name', findRegion(0x08000000)?.name, 'Flash (chương trình)');
  check('findRegion(Flash giữa vùng).kind', findRegion(0x08010000)?.kind, 'flash');
  check('findRegion(Flash cuối vùng - 1).kind', findRegion(0x0801ffff)?.kind, 'flash');
  checkTrue('findRegion(Flash base+size) ngoài vùng', findRegion(0x08020000) === null);
  check('findRegion(SRAM base).kind', findRegion(0x20000000)?.kind, 'ram');
  check('findRegion(Peripheral base).kind', findRegion(0x40000000)?.kind, 'peripheral');
  checkTrue('findRegion(0x00000000) không thuộc vùng nào', findRegion(0x00000000) === null);
  checkTrue('findRegion(0x90000000) không thuộc vùng nào', findRegion(0x90000000) === null);
  checkTrue('findRegion(khoảng trống giữa Flash và SRAM) null', findRegion(0x10000000) === null);

  // --- VMCU: SRAM đọc/ghi round-trip ---
  const cpu = new VMCU();
  check('SRAM write8+read8 round-trip', (cpu.write8(0x20000010, 0x42), cpu.read8(0x20000010)), 0x42);
  check('SRAM write8 mask > 0xFF', (cpu.write8(0x20000011, 0x1ff), cpu.read8(0x20000011)), 0xff);
  checkTrue(
    'SRAM write32+read32 round-trip',
    (cpu.write32(0x20000020, 0xdeadbeef), cpu.read32(0x20000020) === 0xdeadbeef)
  );
  check('SRAM địa chỉ chưa ghi mặc định 0', cpu.read8(0x20000fff), 0);

  // --- VMCU: Flash chỉ đọc, khởi tạo 0xFF ---
  check('Flash mới = 0xFF (đã "xoá")', cpu.read8(0x08000000), 0xff);
  checkThrows('Flash write8 ném FlashProtectedError', () => cpu.write8(0x08000100, 0x99), FlashProtectedError);
  check('Flash vẫn 0xFF sau khi write bị chặn', cpu.read8(0x08000100), 0xff);

  // --- VMCU: Peripheral chưa nối gì ở Bài 1 ---
  check('Peripheral đọc ra 0 (chưa nối)', cpu.read8(0x40000000), 0);
  check('Peripheral ghi không có tác dụng', (cpu.write8(0x40000000, 0x55), cpu.read8(0x40000000)), 0);

  // --- VMCU: địa chỉ ngoài mọi vùng -> HardFault ---
  checkThrows('read8 địa chỉ không hợp lệ -> HardFault', () => cpu.read8(0x00001000), HardFaultError);
  checkThrows('write8 địa chỉ không hợp lệ -> HardFault', () => cpu.write8(0x90000000, 1), HardFaultError);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
