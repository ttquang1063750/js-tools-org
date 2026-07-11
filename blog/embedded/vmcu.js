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
  {
    name: 'System (lõi ARM)',
    kind: 'system',
    base: 0xe000e000,
    size: 0x00001000, // 4KB — dung luong that cua System Control Space tren Cortex-M
    desc: 'Vùng địa chỉ CỐ ĐỊNH (giống hệt trên MỌI chip Cortex-M, không đổi theo hãng) chứa các thanh ghi điều khiển lõi CPU — SysTick (Bài 4), NVIC (Bài 7). Khác với Peripheral (đặc thù từng hãng chip), vùng này là một phần của kiến trúc ARM.',
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

// ---------------------------------------------------------------------------
// SysTick (Bài 4) — bộ đếm giờ tích hợp SẴN trong MỌI lõi ARM Cortex-M (khác
// GPIOA — SysTick là 1 phần kiến trúc ARM, không phải ngoại vi riêng của hãng
// chip). Địa chỉ SYST_CSR lấy ĐÚNG offset thật trên mọi Cortex-M. VMCU chỉ mô
// hình hoá đúng phần cần cho bài này: bật/tắt (SYST_CSR bit 0) — KHÔNG mô
// phỏng thanh ghi đếm ngược 24-bit (SYST_RVR/SYST_CVR) của phần cứng thật, vì
// bài này chỉ cần "có tick hay không", chưa cần tự tính chu kỳ tick từ clock.
// Một bộ đếm "mốc thời gian hệ thống" tăng dần mỗi tick — trên phần cứng
// thật, con số này KHÔNG phải một thanh ghi, mà là 1 biến `volatile` toàn cục
// (thường gọi millis()) được chính firmware tăng lên trong ISR của SysTick
// (NVIC/ngắt chưa xuất hiện tới Bài 7, nên ở đây VMCU tự "làm hộ" việc tăng
// biến đó qua hàm tick() — xem Mục 3 bài viết).
// ---------------------------------------------------------------------------
const SYST_CSR_ADDR = 0xe000e010;
const SYST_CSR_ENABLE_BIT = 0; // bit 0: 1 = SysTick dang chay, 0 = dung (mac dinh reset)

// ---------------------------------------------------------------------------
// TIM1 + PWM (Bài 6) — ngoại vi ĐẶC THÙ HÃNG CHIP (khác SysTick), nằm trong
// vùng Peripheral. Địa chỉ base và offset từng thanh ghi lấy ĐÚNG số thật của
// TIM1 trên STM32F103 (APB2). VMCU chỉ mô hình hoá đúng phần cần cho PWM 1
// kênh: CR1 (bit 0 CEN = bật/tắt bộ đếm), PSC (prescaler), ARR (auto-reload
// — đặt chu kỳ), CCR1 (compare kênh 1 — đặt độ rộng xung cao). KHÔNG mô
// phỏng CNT sống theo thời gian thực (không cần cho bài này — chỉ cần TÍNH
// tần số/duty từ 4 thanh ghi, không cần chạy đồng hồ đến từng tick như
// SysTick). f_clk lấy đúng xung nhịp APB2 timer thật của STM32F103 chạy tối
// đa (72MHz) khi HCLK=72MHz (APB2 prescaler=1, timer clock = APB2 clock).
// ---------------------------------------------------------------------------
const TIM1_BASE = 0x40012c00;
const TIM1_CR1_OFFSET = 0x00;
const TIM1_PSC_OFFSET = 0x28;
const TIM1_ARR_OFFSET = 0x2c;
const TIM1_CCR1_OFFSET = 0x34;
const TIM1_CR1_ADDR = TIM1_BASE + TIM1_CR1_OFFSET;
const TIM1_PSC_ADDR = TIM1_BASE + TIM1_PSC_OFFSET;
const TIM1_ARR_ADDR = TIM1_BASE + TIM1_ARR_OFFSET;
const TIM1_CCR1_ADDR = TIM1_BASE + TIM1_CCR1_OFFSET;
const TIM1_CR1_CEN_BIT = 0; // bit 0 cua CR1: 1 = bo dem dang chay, 0 = dung
const TIM1_CLK_HZ = 72000000; // 72MHz - xung nhip APB2 timer tren STM32F103

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
    // SysTick (Bài 4): CSR=0 (dừng) đúng trạng thái reset thật — firmware
    // PHẢI tự bật SysTick, không có sẵn. millis = "biến toàn cục" firmware
    // dùng làm mốc thời gian, KHÔNG phải thanh ghi thật (xem ghi chú ở trên).
    this.systCsr = 0;
    this.millis = 0;
    // TIM1 (Bài 6): reset về 0 đúng hành vi thật — CR1=0 (bộ đếm dừng), PSC=0
    // ARR=0 CCR1=0 (chưa cấu hình gì, PWM chưa chạy).
    this.tim1Cr1 = 0;
    this.tim1Psc = 0;
    this.tim1Arr = 0;
    this.tim1Ccr1 = 0;
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
    if (region.kind === 'system') return this._systemRead8(addr);
    return this._peripheralRead8(addr);
  }

  write8(addr, value) {
    const region = findRegion(addr);
    if (!region) throw new HardFaultError(addr);
    if (region.kind === 'flash') throw new FlashProtectedError(addr);
    const v = value & 0xff;
    if (region.kind === 'ram') this.sram[addr - region.base] = v;
    else if (region.kind === 'system') this._systemWrite8(addr, v);
    else this._peripheralWrite8(addr, v);
    return v;
  }

  // Dispatch vùng System (lõi ARM) — hiện tại chỉ SYST_CSR (Bài 4). Địa chỉ
  // system khác vẫn đọc 0/ghi vô tác dụng (NVIC sẽ lấp ở Bài 7).
  _systemRead8(addr) {
    if (addr >= SYST_CSR_ADDR && addr < SYST_CSR_ADDR + 4) {
      return this._readRegByte(this.systCsr, addr - SYST_CSR_ADDR);
    }
    return 0;
  }
  _systemWrite8(addr, v) {
    if (addr >= SYST_CSR_ADDR && addr < SYST_CSR_ADDR + 4) {
      this.systCsr = this._writeRegByte(this.systCsr, addr - SYST_CSR_ADDR, v);
      return;
    }
    // dia chi system khac chua noi
  }

  // SysTick co dang chay hay khong (bit ENABLE cua SYST_CSR).
  systickEnabled() {
    return ((this.systCsr >>> SYST_CSR_ENABLE_BIT) & 1) === 1;
  }

  // Mo phong 1 khoang thoi gian THAT troi qua (ms) — dung "thay" cho ISR
  // SysTick that (chua co NVIC den Bai 7): neu SysTick dang BAT, tang bien
  // millis len dung so ms da troi qua, CUON VONG (wrap) qua 2^32 dung nhu
  // mot bien uint32_t that tren phan cung — day chinh la nguon goc "bug 49
  // ngay" cua Mục 4 bài viết. Neu SysTick TAT, khong lam gi ca (dung thiet ke
  // that: khong bat SysTick thi khong ai tang millis ca).
  tick(ms = 1) {
    if (this.systickEnabled()) {
      this.millis = (this.millis + ms) >>> 0;
    }
  }

  // Doc "mốc thời gian hệ thống" hien tai — tren phan cung that day la doc
  // truc tiep bien volatile toan cuc do ISR SysTick duy tri, khong phai doc
  // qua bus dia chi (khong co lenh read32(dia_chi) nao cho no ca).
  getMillis() {
    return this.millis;
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
    if (addr >= TIM1_CR1_ADDR && addr < TIM1_CR1_ADDR + 4) {
      return this._readRegByte(this.tim1Cr1, addr - TIM1_CR1_ADDR);
    }
    if (addr >= TIM1_PSC_ADDR && addr < TIM1_PSC_ADDR + 4) {
      return this._readRegByte(this.tim1Psc, addr - TIM1_PSC_ADDR);
    }
    if (addr >= TIM1_ARR_ADDR && addr < TIM1_ARR_ADDR + 4) {
      return this._readRegByte(this.tim1Arr, addr - TIM1_ARR_ADDR);
    }
    if (addr >= TIM1_CCR1_ADDR && addr < TIM1_CCR1_ADDR + 4) {
      return this._readRegByte(this.tim1Ccr1, addr - TIM1_CCR1_ADDR);
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
    if (addr >= TIM1_CR1_ADDR && addr < TIM1_CR1_ADDR + 4) {
      this.tim1Cr1 = this._writeRegByte(this.tim1Cr1, addr - TIM1_CR1_ADDR, v);
      return;
    }
    if (addr >= TIM1_PSC_ADDR && addr < TIM1_PSC_ADDR + 4) {
      this.tim1Psc = this._writeRegByte(this.tim1Psc, addr - TIM1_PSC_ADDR, v);
      return;
    }
    if (addr >= TIM1_ARR_ADDR && addr < TIM1_ARR_ADDR + 4) {
      this.tim1Arr = this._writeRegByte(this.tim1Arr, addr - TIM1_ARR_ADDR, v);
      return;
    }
    if (addr >= TIM1_CCR1_ADDR && addr < TIM1_CCR1_ADDR + 4) {
      this.tim1Ccr1 = this._writeRegByte(this.tim1Ccr1, addr - TIM1_CCR1_ADDR, v);
      return;
    }
    // peripheral khác chưa nối — ghi không có tác dụng gì
  }

  // TIM1 co dang chay hay khong (bit CEN cua CR1).
  tim1Enabled() {
    return ((this.tim1Cr1 >>> TIM1_CR1_CEN_BIT) & 1) === 1;
  }

  // Tan so cap nhat (update event) cua TIM1 - dung DUNG cong thuc that co "+1":
  // PSC/ARR la gia tri THANH GHI (0-based), nhung bo dem THAT su chia cho
  // (PSC+1) va dem tu 0 den ARR (tuc ARR+1 buoc dem) - quen "+1" o ca 2 cho
  // la cam bay kinh dien cua Muc 2 bai viet.
  tim1Frequency() {
    return TIM1_CLK_HZ / ((this.tim1Psc + 1) * (this.tim1Arr + 1));
  }

  // Duty cycle (ty le xung cao) - dung DUNG cong thuc don gian cua bai:
  // duty = CCR/ARR. ARR=0 khong co y nghia PWM that (chi 1 muc), tra ve 0.
  tim1DutyCycle() {
    if (this.tim1Arr === 0) return 0;
    return this.tim1Ccr1 / this.tim1Arr;
  }

  // So buoc do phan giai duty co the co - dung de minh hoa danh doi PSC lon
  // (tan so thap) thi ARR phai nho (it buoc do sang) neu muon giu tan so cu.
  tim1DutyResolutionSteps() {
    return this.tim1Arr + 1;
  }

  // Thoi gian 1 tick bo dem (micro-giay) - dung cho ung dung servo Muc 4:
  // voi PSC chon sao cho tick = 1us, CCR tinh truc tiep ra so micro-giay xung
  // cao (khong can quy doi them).
  tim1TickMicroseconds() {
    return (1e6 * (this.tim1Psc + 1)) / TIM1_CLK_HZ;
  }

  // Do rong xung cao hien tai (micro-giay), tinh tu CCR1 va tick hien tai.
  tim1PulseWidthUs() {
    return this.tim1Ccr1 * this.tim1TickMicroseconds();
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

// ---------------------------------------------------------------------------
// Chống dội (debounce) & Máy trạng thái hữu hạn (Bài 5) — KHÔNG cần thêm
// ngoại vi mới (tận dụng GPIOA của Bài 2-3 + tick của Bài 4). Đây là logic
// FIRMWARE chạy TRÊN NỀN VMCU, không phải một thanh ghi phần cứng, nên sống
// bên ngoài class VMCU, đúng như code C thật sống bên ngoài bản thân con chip.
// ---------------------------------------------------------------------------

const BTN_STATE_RELEASED = 0;
const BTN_STATE_MAYBE_PRESSED = 1;
const BTN_STATE_PRESSED = 2;
const BTN_STATE_MAYBE_RELEASED = 3;

// Máy trạng thái hữu hạn chống dội chuẩn firmware: enum state + switch, tách
// SỰ KIỆN (cạnh đã lọc sạch) khỏi HÀNH ĐỘNG (người gọi tự quyết định làm gì
// với sự kiện). Gọi sample() đúng 1 lần mỗi tick lấy mẫu (vd. mỗi 5ms) với
// mức logic thô đọc từ IDR — có thể còn dội hoặc chưa. Chỉ công nhận trạng
// thái mới sau khi thấy stableSamplesNeeded mẫu liên tiếp CÙNG một mức logic.
class ButtonFSM {
  constructor(stableSamplesNeeded = 5) {
    this.stableSamplesNeeded = stableSamplesNeeded;
    this.state = BTN_STATE_RELEASED;
    this.counter = 0;
  }

  // rawPressed: true/false — mẫu thô 1 tick (đã bao gồm dội nếu có).
  // Trả về: 'pressed' | 'released' | null (chưa có sự kiện sạch nào ở tick này).
  sample(rawPressed) {
    switch (this.state) {
      case BTN_STATE_RELEASED:
        if (rawPressed) {
          this.state = BTN_STATE_MAYBE_PRESSED;
          this.counter = 1;
        }
        return null;

      case BTN_STATE_MAYBE_PRESSED:
        if (!rawPressed) {
          // Dội: mẫu chưa kịp ổn định đã quay lại mức cũ - huỷ ứng viên.
          this.state = BTN_STATE_RELEASED;
          this.counter = 0;
          return null;
        }
        this.counter++;
        if (this.counter >= this.stableSamplesNeeded) {
          this.state = BTN_STATE_PRESSED;
          this.counter = 0;
          return 'pressed';
        }
        return null;

      case BTN_STATE_PRESSED:
        if (!rawPressed) {
          this.state = BTN_STATE_MAYBE_RELEASED;
          this.counter = 1;
        }
        return null;

      case BTN_STATE_MAYBE_RELEASED:
        if (rawPressed) {
          this.state = BTN_STATE_PRESSED;
          this.counter = 0;
          return null;
        }
        this.counter++;
        if (this.counter >= this.stableSamplesNeeded) {
          this.state = BTN_STATE_RELEASED;
          this.counter = 0;
          return 'released';
        }
        return null;

      default:
        return null;
    }
  }
}

// MÔ PHỎNG vật lý bounce cho MỤC ĐÍCH DEMO/SELF-TEST — không có trên phần
// cứng thật (lá kim loại thật nảy theo vật lý hỗn loạn, không theo mã có sẵn
// này). Trả về mảng mẫu thô xen kẽ đúng/sai `numBounces` lần trước khi ổn
// định hẳn ở finalPressed, mô phỏng dạng sóng nảy nhìn thấy trên oscilloscope.
function simulateBouncedPress(finalPressed, numBounces = 3, settleSamples = 10) {
  const samples = [];
  let current = !finalPressed;
  for (let i = 0; i < numBounces; i++) {
    samples.push(current);
    current = !current;
  }
  for (let i = 0; i < settleSamples; i++) samples.push(finalPressed);
  return samples;
}

// Bộ đếm THÔ ngây thơ — đếm mọi cạnh lên (0->1) trong chuỗi mẫu thô, KHÔNG
// lọc dội gì cả. Dùng để tái hiện đúng cạm bẫy "một nhấn đếm thành bảy" đã
// hẹn từ Bài 3: input y hệt, nhưng đếm sai vì không debounce.
function countRawRisingEdges(rawSamples) {
  let count = 0;
  let prev = false;
  for (const s of rawSamples) {
    if (s && !prev) count++;
    prev = s;
  }
  return count;
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
  SYST_CSR_ADDR,
  SYST_CSR_ENABLE_BIT,
  BTN_STATE_RELEASED,
  BTN_STATE_MAYBE_PRESSED,
  BTN_STATE_PRESSED,
  BTN_STATE_MAYBE_RELEASED,
  ButtonFSM,
  simulateBouncedPress,
  countRawRisingEdges,
  TIM1_CR1_ADDR,
  TIM1_PSC_ADDR,
  TIM1_ARR_ADDR,
  TIM1_CCR1_ADDR,
  TIM1_CR1_CEN_BIT,
  TIM1_CLK_HZ,
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

  // --- VMCU: SysTick — bật/tắt, đếm tick, và tràn số (Bài 4) ---
  {
    const cpu4 = new VMCU();
    check('Reset: SysTick TẮT (SYST_CSR = 0)', cpu4.read32(SYST_CSR_ADDR), 0);
    checkTrue('Reset: systickEnabled() = false', cpu4.systickEnabled() === false);
    check('Reset: millis() = 0', cpu4.getMillis(), 0);

    // Tick khi CHUA bat SysTick: millis KHONG duoc tang (dung thiet ke that)
    for (let i = 0; i < 50; i++) cpu4.tick(1);
    check('Tick 50 lần khi SysTick TẮT: millis() vẫn = 0', cpu4.getMillis(), 0);

    // Bat SysTick (RMW dung ky thuat cac bai truoc)
    cpu4.write32(SYST_CSR_ADDR, cpu4.read32(SYST_CSR_ADDR) | (1 << SYST_CSR_ENABLE_BIT));
    checkTrue('Sau khi bật: systickEnabled() = true', cpu4.systickEnabled() === true);

    for (let i = 0; i < 100; i++) cpu4.tick(1);
    check('Tick 100 lần (1ms/lần) khi SysTick BẬT: millis() = 100', cpu4.getMillis(), 100);

    // Tat SysTick giua chung: millis phai DUNG LAI, khong tang tiep
    cpu4.write32(SYST_CSR_ADDR, 0);
    for (let i = 0; i < 30; i++) cpu4.tick(1);
    check('Tắt SysTick giữa chừng: millis() không tăng tiếp (vẫn = 100)', cpu4.getMillis(), 100);

    // --- Cạm bẫy tràn số (Bài 4 Mục 4): dat millis gan diem cuon vong ---
    cpu4.write32(SYST_CSR_ADDR, 1); // bat lai
    cpu4.millis = 0xfffffff0; // 4294967280 - chi con 16 don vi la cuon vong ve 0
    const startMillis = cpu4.getMillis();
    for (let i = 0; i < 25; i++) cpu4.tick(1); // troi qua 25ms - VUOT QUA diem cuon vong
    const afterMillis = cpu4.getMillis();
    check('Sau khi cuộn vòng (tràn số 32-bit): millis() = 9 (đúng số học modular)', afterMillis, 9);

    // Cong thuc DUNG: tru KHONG DAU (>>> 0) van cho ra dung so ms da troi qua
    const elapsedCorrect = (afterMillis - startMillis) >>> 0;
    check('Công thức ĐÚNG (elapsed = (current - start) >>> 0) vẫn ra đúng 25ms dù đã tràn số', elapsedCorrect, 25);
    checkTrue('=> elapsed(25) >= interval(20): phát hiện ĐÚNG là đã đủ thời gian', elapsedCorrect >= 20);

    // Cong thuc SAI (loi kinh dien): so sanh truc tiep "current >= start + interval"
    // khong xu ly tran so - se ket luan SAI la "chua du thoi gian" ngay sau khi tran.
    const naiveWrongResult = afterMillis >= startMillis + 20;
    checkTrue(
      'Công thức SAI (current >= start + interval) kết luận SAI ngay sau khi tràn số',
      naiveWrongResult === false
    );
  }

  // --- Chống dội & FSM (Bài 5) ---
  {
    // Chuỗi thô mô phỏng 1 lần nhấn thật: 3 lần dội trước khi ổn định ở
    // pressed=true, giữ ổn định, rồi 3 lần dội khi thả trước khi ổn định lại.
    const pressBounce = simulateBouncedPress(true, 3, 10);
    const releaseBounce = simulateBouncedPress(false, 3, 10);
    const oneFullPress = [...pressBounce, ...releaseBounce];

    // Bộ đếm THÔ ngây thơ: đúng cạm bẫy "một nhấn đếm thành bảy" hẹn từ Bài 3.
    const rawEdgeCount = countRawRisingEdges(oneFullPress);
    checkTrue('Đếm thô (không debounce): dội tạo ra NHIỀU cạnh lên giả cho 1 nhấn thật', rawEdgeCount > 1);
    check('Đếm thô cụ thể: dội cả lúc nhấn lẫn lúc thả -> đếm ra 3 cạnh lên giả cho 1 nhấn thật', rawEdgeCount, 3);

    // FSM debounce: đúng 1 sự kiện 'pressed' và đúng 1 sự kiện 'released'
    // dù đưa vào ĐÚNG chuỗi thô có dội y hệt bộ đếm ngây thơ ở trên.
    const fsm = new ButtonFSM(5);
    let pressedEvents = 0;
    let releasedEvents = 0;
    for (const raw of oneFullPress) {
      const ev = fsm.sample(raw);
      if (ev === 'pressed') pressedEvents++;
      if (ev === 'released') releasedEvents++;
    }
    check('FSM debounce: đúng 1 sự kiện "pressed" dù input có dội', pressedEvents, 1);
    check('FSM debounce: đúng 1 sự kiện "released" dù input có dội', releasedEvents, 1);

    // Trạng thái ban đầu và chuyển tiếp đúng thứ tự (kiểm tra từng bước, không
    // chỉ đếm sự kiện cuối cùng - xác nhận đúng cơ chế enum+switch của FSM).
    const fsm2 = new ButtonFSM(3);
    check('Reset: state = RELEASED', fsm2.state, BTN_STATE_RELEASED);
    fsm2.sample(true);
    check('Sau 1 mẫu pressed: state = MAYBE_PRESSED (chưa đủ ổn định)', fsm2.state, BTN_STATE_MAYBE_PRESSED);
    fsm2.sample(false); // doi ngay lap tuc - huy ung vien
    check('Dội ngay khi đang MAYBE_PRESSED: quay lại RELEASED, không có sự kiện', fsm2.state, BTN_STATE_RELEASED);

    // Dội KHÔNG BAO GIỜ đủ N mẫu liên tiếp ổn định: không được phát sinh sự
    // kiện nào cả (N=5 nhưng bounce chỉ giữ tối đa 1 mẫu mỗi mức trước khi đảo).
    const fsmNeverStable = new ButtonFSM(5);
    let neverStableEvents = 0;
    const neverSettles = [true, false, true, false, true, false, true, false, true, false];
    for (const raw of neverSettles) {
      if (fsmNeverStable.sample(raw) !== null) neverStableEvents++;
    }
    check('Dội liên tục không bao giờ đủ N mẫu ổn định: không sự kiện nào cả', neverStableEvents, 0);

    // Long-press: mở rộng chỉ bằng cách thêm 1 trạng thái - kiểm tra rằng ở
    // trạng thái PRESSED ổn định, chân giữ nguyên pressed=true không tạo thêm
    // sự kiện 'pressed' nào nữa (chỉ đúng 1 lần tại thời điểm chuyển trạng thái).
    const fsm3 = new ButtonFSM(2);
    fsm3.sample(true);
    fsm3.sample(true); // chuyen sang PRESSED, phat sinh 'pressed'
    let extraPressedEvents = 0;
    for (let i = 0; i < 50; i++) {
      if (fsm3.sample(true) !== null) extraPressedEvents++;
    }
    checkTrue('Giữ nút PRESSED lâu (mô phỏng long-press): không lặp lại sự kiện "pressed"', extraPressedEvents === 0);
  }

  // --- VMCU: TIM1 + PWM (Bài 6) ---
  {
    const cpu5 = new VMCU();
    check('Reset: TIM1 CR1 = 0 (bộ đếm dừng)', cpu5.read32(TIM1_CR1_ADDR), 0);
    checkTrue('Reset: tim1Enabled() = false', cpu5.tim1Enabled() === false);

    cpu5.write32(TIM1_CR1_ADDR, cpu5.read32(TIM1_CR1_ADDR) | (1 << TIM1_CR1_CEN_BIT));
    checkTrue('Sau khi bật CEN: tim1Enabled() = true', cpu5.tim1Enabled() === true);

    // --- Cong thuc tan so: 1Hz, 1kHz (2 cach khac nhau), 20kHz ---
    cpu5.write32(TIM1_PSC_ADDR, 7199);
    cpu5.write32(TIM1_ARR_ADDR, 9999);
    check('PSC=7199, ARR=9999 -> tần số = 1Hz (72MHz/(7200*10000))', cpu5.tim1Frequency(), 1);

    cpu5.write32(TIM1_PSC_ADDR, 71);
    cpu5.write32(TIM1_ARR_ADDR, 999);
    check('PSC=71, ARR=999 -> tần số = 1000Hz (độ phân giải duty CAO: 1000 bậc)', cpu5.tim1Frequency(), 1000);
    check('Độ phân giải duty (PSC nhỏ, ARR lớn) = ARR+1 = 1000 bậc', cpu5.tim1DutyResolutionSteps(), 1000);

    cpu5.write32(TIM1_PSC_ADDR, 7199);
    cpu5.write32(TIM1_ARR_ADDR, 9);
    check('PSC=7199, ARR=9 -> CÙNG tần số 1000Hz (72MHz/(7200*10))', cpu5.tim1Frequency(), 1000);
    check(
      'Nhưng độ phân giải duty (PSC lớn, ARR nhỏ) chỉ còn = ARR+1 = 10 bậc - đúng đánh đổi Mục 2',
      cpu5.tim1DutyResolutionSteps(),
      10
    );

    cpu5.write32(TIM1_PSC_ADDR, 0);
    cpu5.write32(TIM1_ARR_ADDR, 3599);
    check('PSC=0, ARR=3599 -> tần số = 20000Hz (72MHz/(1*3600))', cpu5.tim1Frequency(), 20000);

    // --- Cam bay "quen +1": PSC=0 dung nghia la chia cho 1, KHONG phai chia cho 0 ---
    const naiveFreq = TIM1_CLK_HZ / (cpu5.tim1Psc * cpu5.tim1Arr); // SAI: quen +1 o ca 2 thanh phan
    checkTrue('Công thức SAI (quên +1, PSC=0 dùng thẳng làm mẫu số) -> chia cho 0 -> Infinity', naiveFreq === Infinity);
    check('Công thức ĐÚNG (có +1) vẫn ra 20000Hz dù PSC=0 (không chia cho 0)', cpu5.tim1Frequency(), 20000);

    // --- Duty cycle: CCR/ARR ---
    cpu5.write32(TIM1_PSC_ADDR, 71);
    cpu5.write32(TIM1_ARR_ADDR, 1000);
    cpu5.write32(TIM1_CCR1_ADDR, 250);
    check('CCR1=250, ARR=1000 -> duty = 0.25 (25%)', cpu5.tim1DutyCycle(), 0.25);
    cpu5.write32(TIM1_CCR1_ADDR, 1000);
    check('CCR1=1000=ARR -> duty = 1 (100% - luôn cao)', cpu5.tim1DutyCycle(), 1);
    cpu5.write32(TIM1_CCR1_ADDR, 0);
    check('CCR1=0 -> duty = 0 (0% - luôn thấp, LED tắt hẳn)', cpu5.tim1DutyCycle(), 0);

    // --- Ung dung servo: 50Hz, tick=1us, CCR truc tiep ra micro-giay xung ---
    cpu5.write32(TIM1_PSC_ADDR, 71); // tick = 1us (72MHz / 72 = 1MHz)
    cpu5.write32(TIM1_ARR_ADDR, 19999); // chu ky = 20000 tick = 20000us = 20ms = 50Hz
    check('Servo: PSC=71, ARR=19999 -> tần số khung = 50Hz', cpu5.tim1Frequency(), 50);
    check('Servo: 1 tick = 1 micro-giây (PSC=71 tại 72MHz)', cpu5.tim1TickMicroseconds(), 1);

    cpu5.write32(TIM1_CCR1_ADDR, 1000);
    check('Servo: CCR1=1000 -> độ rộng xung = 1000us = 1ms (góc servo min)', cpu5.tim1PulseWidthUs(), 1000);
    cpu5.write32(TIM1_CCR1_ADDR, 2000);
    check('Servo: CCR1=2000 -> độ rộng xung = 2000us = 2ms (góc servo max)', cpu5.tim1PulseWidthUs(), 2000);
  }

  // --- VMCU: địa chỉ ngoài mọi vùng -> HardFault ---
  checkThrows('read8 địa chỉ không hợp lệ -> HardFault', () => cpu.read8(0x00001000), HardFaultError);
  checkThrows('write8 địa chỉ không hợp lệ -> HardFault', () => cpu.write8(0x90000000, 1), HardFaultError);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
