// vmcu.js — "VMCU": MCU ảo mức thanh ghi dùng chung cho Series 13 (Hệ Thống
// Nhúng). Khởi sinh ở Bài 1 (memory map + bus đọc/ghi thuần — CHƯA có ngoại
// vi nào được nối). Bài 2 thêm GPIO OUTPUT (MODER/ODR); Bài 3 thêm GPIO INPUT
// (IDR + cấu hình pull-up/down PUPDR, mô phỏng cả chân floating đọc nhiễu
// ngẫu nhiên) — đúng build-out table của từng bài. Bài 4 thêm SysTick; Bài 6
// thêm Timer/PWM; Bài 7 thêm NVIC/EXTI; Bài 9 thêm UART; Bài 10 thêm ADC; Bài
// 11 thêm DMA; Bài 14-15 thêm mini-RTOS. Import trực tiếp từ các bài sau,
// KHÔNG copy-paste lại logic (tiền lệ vlsi-verilite.js Series 11 / ai-neuro.js
// Series 12).
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

// ---------------------------------------------------------------------------
// GPIOA (Bài 2) — port ngoại vi ĐẦU TIÊN được "nối dây" vào VMCU. Địa chỉ base
// lấy đúng theo STM32F1 thật (bus APB2) để chuyển sang board thật không bỡ
// ngỡ; tên và offset thanh ghi (MODER/ODR) theo họ STM32 hiện đại (F0/F4/L-
// series) vì đơn giản hơn cặp CRL/CRH cổ của F1 — VMCU lấy cảm hứng từ STM32,
// không phải bản sao bit-exact 1 chip cụ thể.
//   - MODER (offset 0x00): 2 bit/chân — 00 = input (giá trị reset mặc định,
//     AN TOÀN vì không vô tình đẩy dòng ra một chân đang nối với thứ khác),
//     01 = output push-pull. Series này chỉ dùng 2 mã đó; 10/11 (alt
//     function/analog) để dành cho các bài sau.
//   - ODR (offset 0x0C): 1 bit/chân — mức logic MUỐN xuất ra. Bit này CHỈ có
//     tác dụng điện thật khi MODER của đúng chân đó đang ở chế độ output —
//     nếu để input, phần cứng vẫn cho ghi/đọc lại bit đó bình thường (không
//     lỗi), chỉ là không có LED/chân vật lý nào phản hồi theo nó.
// ---------------------------------------------------------------------------
const GPIOA_BASE = 0x40010800;
const GPIOA_MODER_OFFSET = 0x00;
const GPIOA_PUPDR_OFFSET = 0x04;
const GPIOA_IDR_OFFSET = 0x08;
const GPIOA_ODR_OFFSET = 0x0c;
const GPIOA_MODER_ADDR = GPIOA_BASE + GPIOA_MODER_OFFSET;
const GPIOA_PUPDR_ADDR = GPIOA_BASE + GPIOA_PUPDR_OFFSET;
const GPIOA_IDR_ADDR = GPIOA_BASE + GPIOA_IDR_OFFSET;
const GPIOA_ODR_ADDR = GPIOA_BASE + GPIOA_ODR_OFFSET;
const GPIO_NUM_PINS = 16;
const GPIO_MODE_INPUT = 0b00;
const GPIO_MODE_OUTPUT = 0b01;
// PUPDR (Bài 3): 2 bit/chân, chỉ dùng khi MODER = input — chọn điện trở kéo
// NỘI (bên trong chip, không cần linh kiện rời) gắn vào chân đó.
const GPIO_PULL_NONE = 0b00; // floating khi khong co gi khac dieu khien dien ap
const GPIO_PULL_UP = 0b01; // keo len VCC -> doc mac dinh la 1
const GPIO_PULL_DOWN = 0b10; // keo xuong GND -> doc mac dinh la 0

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
    // GPIOA (Bài 2): reset về 0 — MODER=0 nghĩa là CẢ 16 chân mặc định INPUT,
    // đúng hành vi an toàn của phần cứng thật lúc mới cấp nguồn.
    this.gpioaModer = 0;
    this.gpioaOdr = 0;
    // GPIOA (Bài 3): PUPDR reset về 0 = KHÔNG có điện trở kéo nào — đúng thiết
    // kế thật, vì bật sẵn pull-up/down cho mọi chân có thể xung đột với mạch
    // ngoài. externalDrive mô phỏng "thứ gì đó bên ngoài đang chủ động đặt
    // điện áp vào chân" (vd nút nhấn đang giữ) — KHÔNG phải thanh ghi thật,
    // chỉ là móc nối cho demo/self-test; null nghĩa là không có gì nối.
    this.gpioaPupdr = 0;
    this.externalDrive = new Array(GPIO_NUM_PINS).fill(null);
  }

  // Đọc 1 byte trong 1 thanh ghi 32-bit lưu dạng số JS thường (little-endian,
  // giống layout thật trên Cortex-M) — dùng chung cho MODER và ODR.
  _readRegByte(regValue, byteIdx) {
    return (regValue >>> (byteIdx * 8)) & 0xff;
  }
  // Ghi ĐÈ đúng 1 byte trong thanh ghi 32-bit, giữ nguyên 3 byte còn lại —
  // bắt buộc phải làm đúng kiểu này, nếu không write8 riêng lẻ (dùng bên
  // trong write32) sẽ xoá mất dữ liệu của các byte khác trong cùng thanh ghi.
  _writeRegByte(regValue, byteIdx, byteVal) {
    const shift = byteIdx * 8;
    const mask = ~(0xff << shift);
    return ((regValue & mask) | (byteVal << shift)) >>> 0;
  }

  read8(addr) {
    const region = findRegion(addr);
    if (!region) throw new HardFaultError(addr);
    const offset = addr - region.base;
    if (region.kind === 'flash') return this.flash[offset];
    if (region.kind === 'ram') return this.sram[offset];
    return this._peripheralRead8(addr);
  }

  write8(addr, value) {
    const region = findRegion(addr);
    if (!region) throw new HardFaultError(addr);
    if (region.kind === 'flash') throw new FlashProtectedError(addr);
    const v = value & 0xff;
    if (region.kind === 'ram') this.sram[addr - region.base] = v;
    else this._peripheralWrite8(addr, v);
    return v;
  }

  // Dispatch truy cập ngoại vi tới đúng thanh ghi đã "nối dây" — hiện tại chỉ
  // GPIOA (MODER/ODR Bài 2, PUPDR/IDR Bài 3). Địa chỉ peripheral khác vẫn đọc
  // 0/ghi vô tác dụng đúng hành vi "chưa nối" của Bài 1.
  _peripheralRead8(addr) {
    if (addr >= GPIOA_MODER_ADDR && addr < GPIOA_MODER_ADDR + 4) {
      return this._readRegByte(this.gpioaModer, addr - GPIOA_MODER_ADDR);
    }
    if (addr >= GPIOA_PUPDR_ADDR && addr < GPIOA_PUPDR_ADDR + 4) {
      return this._readRegByte(this.gpioaPupdr, addr - GPIOA_PUPDR_ADDR);
    }
    if (addr >= GPIOA_IDR_ADDR && addr < GPIOA_IDR_ADDR + 4) {
      return this._readIdrByte(addr - GPIOA_IDR_ADDR);
    }
    if (addr >= GPIOA_ODR_ADDR && addr < GPIOA_ODR_ADDR + 4) {
      return this._readRegByte(this.gpioaOdr, addr - GPIOA_ODR_ADDR);
    }
    return 0;
  }

  _peripheralWrite8(addr, v) {
    if (addr >= GPIOA_MODER_ADDR && addr < GPIOA_MODER_ADDR + 4) {
      this.gpioaModer = this._writeRegByte(this.gpioaModer, addr - GPIOA_MODER_ADDR, v);
      return;
    }
    if (addr >= GPIOA_PUPDR_ADDR && addr < GPIOA_PUPDR_ADDR + 4) {
      this.gpioaPupdr = this._writeRegByte(this.gpioaPupdr, addr - GPIOA_PUPDR_ADDR, v);
      return;
    }
    if (addr >= GPIOA_IDR_ADDR && addr < GPIOA_IDR_ADDR + 4) {
      return; // IDR chi doc (read-only) - ghi vao day khong co tac dung gi tren phan cung that
    }
    if (addr >= GPIOA_ODR_ADDR && addr < GPIOA_ODR_ADDR + 4) {
      this.gpioaOdr = this._writeRegByte(this.gpioaOdr, addr - GPIOA_ODR_ADDR, v);
      return;
    }
    // peripheral khác chưa nối — ghi không có tác dụng gì
  }

  // IDR tính "sống" mỗi lần đọc — không lưu trạng thái cố định như MODER/ODR,
  // vì giá trị của nó phụ thuộc điều gì đang xảy ra ở chân đó NGAY LÚC đọc
  // (đúng bản chất input thật: giá trị điện áp bên ngoài, không phải bộ nhớ).
  _readIdrByte(byteIdx) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      const pin = byteIdx * 8 + b;
      if (pin < GPIO_NUM_PINS && this.gpioaReadPin(pin) === 1) byteVal |= 1 << b;
    }
    return byteVal;
  }

  // Chế độ hiện tại của 1 chân (0=input, 1=output) — đọc 2 bit tại vị trí
  // pin*2 trong MODER.
  gpioaPinMode(pin) {
    return (this.gpioaModer >>> (pin * 2)) & 0b11;
  }

  // Cấu hình điện trở kéo hiện tại của 1 chân (Bài 3) — đọc 2 bit tại vị trí
  // pin*2 trong PUPDR. Chỉ có ý nghĩa khi chân đang ở chế độ INPUT.
  gpioaPinPull(pin) {
    return (this.gpioaPupdr >>> (pin * 2)) & 0b11;
  }

  // Đặt/gỡ một nguồn điện áp NGOÀI đang chủ động ép vào chân (mô phỏng nút
  // nhấn đang giữ, hoặc bất kỳ mạch ngoài nào khác) — level: 0, 1, hoặc null
  // (gỡ bỏ, không còn gì nối ngoài). Đây KHÔNG phải một thanh ghi thật, chỉ
  // là móc nối cho demo/self-test mô phỏng "thế giới vật lý" quanh MCU.
  setExternalDrive(pin, level) {
    this.externalDrive[pin] = level;
  }

  // Mức logic THẬT SỰ tại 1 chân, đúng thứ tự ưu tiên của phần cứng thật:
  //   1. Nếu chân đang OUTPUT: IDR phản ánh đúng giá trị đã xuất ra (ODR).
  //   2. Nếu có mạch ngoài đang chủ động ép điện áp (externalDrive) — mạch
  //      ngoài LUÔN thắng, bất kể cấu hình pull-up/down bên trong chip.
  //   3. Nếu không, điện trở kéo nội quyết định: pull-up -> 1, pull-down -> 0.
  //   4. Không có gì cả (floating) — không ai quyết định mức logic, đọc ra
  //      NHIỄU NGẪU NHIÊN thật (đúng cạm bẫy cốt lõi của bài).
  gpioaReadPin(pin) {
    if (this.gpioaPinMode(pin) === GPIO_MODE_OUTPUT) {
      return (this.gpioaOdr >>> pin) & 1;
    }
    const drive = this.externalDrive[pin];
    if (drive === 0 || drive === 1) return drive;
    const pull = this.gpioaPinPull(pin);
    if (pull === GPIO_PULL_UP) return 1;
    if (pull === GPIO_PULL_DOWN) return 0;
    return Math.random() < 0.5 ? 0 : 1; // floating - nhieu that, khong seed duoc va khong nen seed
  }

  // LED có thực sự SÁNG hay không — cần ĐỦ 2 điều kiện: chân đang ở chế độ
  // OUTPUT (MODER) VÀ bit ODR tương ứng đang là 1. Đây là điểm dễ nhầm nhất
  // của bài: ghi ODR=1 cho một chân đang để INPUT vẫn "thành công" (bit lưu
  // lại được) nhưng không có LED nào sáng cả.
  gpioaLedOn(pin) {
    return this.gpioaPinMode(pin) === GPIO_MODE_OUTPUT && ((this.gpioaOdr >>> pin) & 1) === 1;
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

export {
  MEMORY_MAP,
  HardFaultError,
  FlashProtectedError,
  findRegion,
  VMCU,
  GPIOA_BASE,
  GPIOA_MODER_ADDR,
  GPIOA_PUPDR_ADDR,
  GPIOA_IDR_ADDR,
  GPIOA_ODR_ADDR,
  GPIO_NUM_PINS,
  GPIO_MODE_INPUT,
  GPIO_MODE_OUTPUT,
  GPIO_PULL_NONE,
  GPIO_PULL_UP,
  GPIO_PULL_DOWN,
};

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

  // --- VMCU: Peripheral chưa nối gì ở Bài 1 (địa chỉ KHÔNG thuộc GPIOA) ---
  check('Peripheral đọc ra 0 (chưa nối)', cpu.read8(0x40000000), 0);
  check('Peripheral ghi không có tác dụng', (cpu.write8(0x40000000, 0x55), cpu.read8(0x40000000)), 0);
  check('Địa chỉ peripheral khác GPIOA (nhưng cùng vùng) vẫn "chưa nối"', cpu.read8(GPIOA_BASE + 0x100), 0);

  // --- VMCU: GPIOA MODER/ODR (Bài 2) ---
  {
    const cpu2 = new VMCU();
    check('Reset: MODER = 0 (tất cả chân INPUT)', cpu2.read32(GPIOA_MODER_ADDR), 0);
    check('Reset: pin 0 mặc định INPUT', cpu2.gpioaPinMode(0), GPIO_MODE_INPUT);
    checkTrue('Reset: LED pin 0 tắt (chưa cấu hình gì)', cpu2.gpioaLedOn(0) === false);

    // Cấu hình pin 0 làm OUTPUT: MODER bit[1:0] = 01
    cpu2.write32(GPIOA_MODER_ADDR, 0b01);
    check('MODER sau khi set pin 0 = OUTPUT', cpu2.gpioaPinMode(0), GPIO_MODE_OUTPUT);
    check('Pin 1 KHÔNG bị ảnh hưởng — vẫn INPUT', cpu2.gpioaPinMode(1), GPIO_MODE_INPUT);
    checkTrue('LED pin 0 vẫn TẮT (mới cấu hình mode, chưa set ODR)', cpu2.gpioaLedOn(0) === false);

    // Bật LED pin 0 bằng RMW kiểu C thật: ODR |= (1 << 0)
    cpu2.write32(GPIOA_ODR_ADDR, cpu2.read32(GPIOA_ODR_ADDR) | (1 << 0));
    checkTrue('LED pin 0 SÁNG sau khi set bit ODR (đã ở chế độ OUTPUT)', cpu2.gpioaLedOn(0) === true);

    // Bật ODR bit cho pin 5 (đang INPUT) — bit vẫn ghi được, nhưng LED không sáng
    cpu2.write32(GPIOA_ODR_ADDR, cpu2.read32(GPIOA_ODR_ADDR) | (1 << 5));
    checkTrue('ODR bit pin 5 lưu được dù đang INPUT', ((cpu2.read32(GPIOA_ODR_ADDR) >>> 5) & 1) === 1);
    checkTrue('Nhưng LED pin 5 KHÔNG sáng vì MODER vẫn INPUT (cạm bẫy cốt lõi của bài)', cpu2.gpioaLedOn(5) === false);

    // Tắt LED pin 0 bằng RMW: ODR &= ~(1 << 0)
    cpu2.write32(GPIOA_ODR_ADDR, cpu2.read32(GPIOA_ODR_ADDR) & ~(1 << 0));
    checkTrue('LED pin 0 TẮT sau khi clear bit ODR', cpu2.gpioaLedOn(0) === false);
    checkTrue(
      'ODR bit pin 5 KHÔNG bị ảnh hưởng bởi việc clear bit pin 0',
      ((cpu2.read32(GPIOA_ODR_ADDR) >>> 5) & 1) === 1
    );

    // Toggle 2 lần bằng RMW: ODR ^= (1 << 0) — phải quay lại đúng trạng thái ban đầu
    const before = cpu2.read32(GPIOA_ODR_ADDR);
    cpu2.write32(GPIOA_ODR_ADDR, cpu2.read32(GPIOA_ODR_ADDR) ^ (1 << 0));
    cpu2.write32(GPIOA_ODR_ADDR, cpu2.read32(GPIOA_ODR_ADDR) ^ (1 << 0));
    check('Toggle 2 lần liên tiếp quay lại đúng giá trị ban đầu', cpu2.read32(GPIOA_ODR_ADDR), before);

    // Ghi byte thấp của ODR không được xoá mất byte cao (round-trip 32-bit qua write8)
    cpu2.write32(GPIOA_ODR_ADDR, 0xdead0000);
    cpu2.write8(GPIOA_ODR_ADDR, 0xef); // chỉ sửa byte thấp nhất
    check('write8 vào 1 byte không xoá mất 3 byte còn lại của ODR', cpu2.read32(GPIOA_ODR_ADDR), 0xdead00ef);
  }

  // --- VMCU: GPIOA PUPDR/IDR — pull-up/down & floating (Bài 3) ---
  {
    const cpu3 = new VMCU();
    check('Reset: PUPDR = 0 (không điện trở kéo nào)', cpu3.read32(GPIOA_PUPDR_ADDR), 0);
    check('Reset: pin 1 mặc định PULL_NONE', cpu3.gpioaPinPull(1), GPIO_PULL_NONE);

    // Cau hinh PA1 pull-up: doc phai luon ra 1 khi khong co gi khac tac dong
    cpu3.write32(GPIOA_PUPDR_ADDR, GPIO_PULL_UP << (1 * 2));
    check('PUPDR sau khi set pin 1 = PULL_UP', cpu3.gpioaPinPull(1), GPIO_PULL_UP);
    check('Pin 0 KHÔNG bị ảnh hưởng — vẫn PULL_NONE', cpu3.gpioaPinPull(0), GPIO_PULL_NONE);
    {
      let allOnes = true;
      for (let i = 0; i < 50; i++) if (cpu3.gpioaReadPin(1) !== 1) allOnes = false;
      checkTrue('Pull-up: đọc pin 1 LUÔN ra 1 qua nhiều lần (50 lần)', allOnes);
    }

    // Doi sang pull-down: doc phai luon ra 0
    cpu3.write32(GPIOA_PUPDR_ADDR, GPIO_PULL_DOWN << (1 * 2));
    {
      let allZeros = true;
      for (let i = 0; i < 50; i++) if (cpu3.gpioaReadPin(1) !== 0) allZeros = false;
      checkTrue('Pull-down: đọc pin 1 LUÔN ra 0 qua nhiều lần (50 lần)', allZeros);
    }

    // Nut nhan (externalDrive) THANG the pull-up: giu nut = noi xuong GND (0)
    cpu3.write32(GPIOA_PUPDR_ADDR, GPIO_PULL_UP << (1 * 2)); // pull-up (active-low)
    check('Nhả nút: pull-up thắng, đọc ra 1', cpu3.gpioaReadPin(1), 1);
    cpu3.setExternalDrive(1, 0); // gia lap dang GIU nut nhan active-low
    check('Giữ nút (active-low): externalDrive THẮNG pull-up, đọc ra 0', cpu3.gpioaReadPin(1), 0);
    cpu3.setExternalDrive(1, null); // nha nut
    check('Nhả nút trở lại: quay về đúng giá trị pull-up = 1', cpu3.gpioaReadPin(1), 1);

    // Floating (khong pull, khong external drive): phai la NHIEU that (khong hang dinh)
    cpu3.write32(GPIOA_PUPDR_ADDR, GPIO_PULL_NONE << (1 * 2));
    {
      const seen = new Set();
      for (let i = 0; i < 200; i++) seen.add(cpu3.gpioaReadPin(1));
      checkTrue('Floating: đọc pin 1 nhiều lần KHÔNG cho ra hằng định (thấy cả 0 lẫn 1)', seen.size === 2);
    }

    // Pin dang OUTPUT: IDR phai phan anh dung ODR, bat chap pull/externalDrive
    const moder = cpu3.read32(GPIOA_MODER_ADDR);
    cpu3.write32(GPIOA_MODER_ADDR, (moder & ~(0b11 << (1 * 2))) | (GPIO_MODE_OUTPUT << (1 * 2)));
    cpu3.write32(GPIOA_ODR_ADDR, cpu3.read32(GPIOA_ODR_ADDR) | (1 << 1));
    cpu3.setExternalDrive(1, 0); // dang co "nut nhan" nhung KHONG con y nghia vi pin la output
    check('Pin OUTPUT: IDR phản ánh đúng ODR, bất chấp externalDrive', cpu3.gpioaReadPin(1), 1);

    // IDR chi doc: ghi vao dia chi IDR khong duoc nem loi va khong lam thay doi gi
    cpu3.setExternalDrive(1, null);
    cpu3.write8(GPIOA_IDR_ADDR, 0xff); // khong duoc nem loi, khong co tac dung
    check('Ghi vào IDR (read-only) không ảnh hưởng gì tới ODR/MODER', cpu3.gpioaPinMode(1), GPIO_MODE_OUTPUT);
  }

  // --- VMCU: địa chỉ ngoài mọi vùng -> HardFault ---
  checkThrows('read8 địa chỉ không hợp lệ -> HardFault', () => cpu.read8(0x00001000), HardFaultError);
  checkThrows('write8 địa chỉ không hợp lệ -> HardFault', () => cpu.write8(0x90000000, 1), HardFaultError);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
