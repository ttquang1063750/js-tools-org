// vmcu.js — "VMCU": MCU ảo mức thanh ghi dùng chung cho Series 13 (Hệ Thống
// Nhúng). Khởi sinh ở Bài 1 (memory map + bus đọc/ghi thuần — CHƯA có ngoại
// vi nào được nối). Bài 2 thêm GPIO OUTPUT (MODER/ODR); Bài 3 thêm GPIO INPUT
// (IDR + cấu hình pull-up/down PUPDR, mô phỏng cả chân floating đọc nhiễu
// ngẫu nhiên) — đúng build-out table của từng bài. Bài 4 thêm SysTick; Bài 6
// thêm Timer/PWM; Bài 7 thêm NVIC/EXTI (mở rộng NVIC lên 2 từ 32-bit
// ISER0/ISER1... để bao hết IRQ 0-63, cần cho USART1 = IRQ 37 ở Bài 9); Bài 8
// thêm race condition/critical section/ring buffer SPSC (logic firmware
// thuần, không phải thanh ghi mới); Bài 9 thêm USART1 (SR/DR/BRR/CR1) + công
// thức baud rate + mô phỏng lỗi baud; Bài 10 thêm ADC; Bài 11 thêm DMA; Bài
// 14-15 thêm mini-RTOS. Import trực tiếp từ các bài sau,
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

// ---------------------------------------------------------------------------
// NVIC (Bài 7) — "tổng đài ngắt" của lõi ARM Cortex-M, nằm trong vùng System
// (giống SysTick — kiến trúc ARM chuẩn, không phải ngoại vi riêng hãng chip).
// Địa chỉ ĐÚNG số thật trên mọi Cortex-M. VMCU mô hình 3 khái niệm cốt lõi
// của bài: enable (ISER/ICER — set/clear enable, KHÔNG phải ghi đè thường,
// đúng hành vi thật "write-1-to-set"/"write-1-to-clear"), pending (ISPR/ICPR
// — cùng kiểu write-1-to-set/clear), và priority (IPR — mảng byte, MỖI IRQ
// 1 byte, số CÀNG NHỎ = ưu tiên CÀNG CAO, đúng cạm bẫy ngược trực giác Mục 3).
// ---------------------------------------------------------------------------
const NVIC_ISER0_ADDR = 0xe000e100;
const NVIC_ICER0_ADDR = 0xe000e180;
const NVIC_ISPR0_ADDR = 0xe000e200;
const NVIC_ICPR0_ADDR = 0xe000e280;
const NVIC_IPR_BASE_ADDR = 0xe000e400; // byte-addressable: dia chi + irqNum = priority cua IRQ do
// Bai 7 chi day/dung IRQ 0-31 (1 tu 32-bit la du). Bai 9 them USART1 tai VI TRI
// THAT trong vector table (37) - vuot qua 31, can THEM 1 tu 32-bit nua, dung
// DUNG kien truc that: ISER1/ICER1/ISPR1/ICPR1 nam ngay sau tu dau (+4 byte),
// bao IRQ 32-63. Day KHONG phai gia lap rieng cho USART1 - la mo rong dung
// NVIC that su co, chi la Bai 7 chua can dung toi.
const NVIC_ISER1_ADDR = NVIC_ISER0_ADDR + 4;
const NVIC_ICER1_ADDR = NVIC_ICER0_ADDR + 4;
const NVIC_ISPR1_ADDR = NVIC_ISPR0_ADDR + 4;
const NVIC_ICPR1_ADDR = NVIC_ICPR0_ADDR + 4;

// Số hiệu IRQ lấy ĐÚNG vị trí thật trong vector table STM32F103 (mật độ
// chuẩn/dòng phổ biến) — EXTI1 và TIM1_UP là 2 nguồn ngắt Bài 7 dùng; USART1
// (Bài 9) dùng CHUNG 1 IRQ cho cả TX lẫn RX (đúng thiết kế thật — ISR tự đọc
// SR để biết đang do TXE hay RXNE gây ra).
const IRQ_EXTI1 = 7;
const IRQ_TIM1_UP = 24;
const IRQ_USART1 = 37;

// ---------------------------------------------------------------------------
// EXTI (Bài 7) — ngoại vi ĐẶC THÙ HÃNG CHIP, sinh ngắt từ cạnh tín hiệu trên
// chân GPIO. Địa chỉ base ĐÚNG số thật STM32F103. VMCU mô hình 4 thanh ghi:
// IMR (mask — 1 = đường đó ĐƯỢC PHÉP báo ngắt lên NVIC), RTSR/FTSR (chọn
// cạnh lên/xuống kích hoạt), PR (pending — set khi có cạnh xảy ra, BẤT KỂ
// IMR có mask hay không; ghi 1 để XOÁ — "write-1-to-clear" giống ICPR của
// NVIC). Quên xoá PR trong ISR là cạm bẫy chí mạng nhất của bài — vì PR vẫn
// còn set nghĩa là đường yêu cầu ngắt VẪN CÒN treo, NVIC sẽ pend lại NGAY
// khi ISR vừa thoát, gọi lại ISR vô hạn — mô phỏng chính xác ở _syncExtiToNvic.
// ---------------------------------------------------------------------------
const EXTI_BASE = 0x40010400;
const EXTI_IMR_OFFSET = 0x00;
const EXTI_RTSR_OFFSET = 0x08;
const EXTI_FTSR_OFFSET = 0x0c;
const EXTI_PR_OFFSET = 0x14;
const EXTI_IMR_ADDR = EXTI_BASE + EXTI_IMR_OFFSET;
const EXTI_RTSR_ADDR = EXTI_BASE + EXTI_RTSR_OFFSET;
const EXTI_FTSR_ADDR = EXTI_BASE + EXTI_FTSR_OFFSET;
const EXTI_PR_ADDR = EXTI_BASE + EXTI_PR_OFFSET;
const EXTI_LINE1_BIT = 1; // VI TRI bit (khong phai mask) cua duong EXTI line 1 - giong PA1 cac bai truoc

// ---------------------------------------------------------------------------
// USART1 (Bài 9) — ngoại vi ĐẶC THÙ HÃNG CHIP, địa chỉ base + offset ĐÚNG số
// thật STM32F103 (bus APB2). VMCU mô hình 4 thanh ghi tối giản đủ cho bài:
//   - SR (status): bit TXE (7) = "sẵn sàng nhận byte mới để gửi", bit RXNE
//     (5) = "đã có byte mới nhận được, chưa đọc". VMCU đơn giản hoá: coi mỗi
//     lần TX là tức thời (không có độ trễ dịch bit thật) nên TXE LUÔN = 1
//     ngay sau khi ghi DR — điểm khác duy nhất với phần cứng thật (nơi TXE
//     mất một khoảng thời gian bit mới set lại).
//   - DR (data register): ghi = gửi 1 byte (đẩy vào uartTxLog cho waveform
//     Mục 9.5); đọc = lấy byte RX vừa nhận, tự động xoá RXNE.
//   - BRR (baud rate register): công thức ĐƠN GIẢN của bài (không tính hệ số
//     oversampling 16x + phần thập phân của thanh ghi thật) — đúng cam kết
//     "BRR = f_clk/baud" của Mục 9.2, không phải bản bit-exact phần cứng.
//   - CR1: bit UE (13) bật cả khối, TXEIE (7)/RXNEIE (5) bật ngắt tương ứng.
// ---------------------------------------------------------------------------
const USART1_BASE = 0x40013800;
const USART1_SR_OFFSET = 0x00;
const USART1_DR_OFFSET = 0x04;
const USART1_BRR_OFFSET = 0x08;
const USART1_CR1_OFFSET = 0x0c;
const USART1_SR_ADDR = USART1_BASE + USART1_SR_OFFSET;
const USART1_DR_ADDR = USART1_BASE + USART1_DR_OFFSET;
const USART1_BRR_ADDR = USART1_BASE + USART1_BRR_OFFSET;
const USART1_CR1_ADDR = USART1_BASE + USART1_CR1_OFFSET;
const USART1_SR_TXE_BIT = 7;
const USART1_SR_RXNE_BIT = 5;
const USART1_CR1_UE_BIT = 13;
const USART1_CR1_TXEIE_BIT = 7;
const USART1_CR1_RXNEIE_BIT = 5;
const USART1_CLK_HZ = 72000000; // 72MHz - xung nhip APB2 tren STM32F103 (giong TIM1)

// ---------------------------------------------------------------------------
// ADC1 (Bài 10) — địa chỉ base + offset SR/CR1/CR2/DR lấy đúng theo STM32F103
// thật (bus APB2), giữ đúng cam kết "địa chỉ thật khi khả thi" của series.
// VMCU đơn giản hoá: KHÔNG mô phỏng thời gian chuyển đổi SAR thật (vài
// micro-giây trên chip thật) — ghi bit SWSTART là có kết quả NGAY trong DR,
// đúng Ý NGHĨA tầng thanh ghi (main/ISR đọc thấy gì) dù bỏ qua độ trễ vật lý.
//   - SR: bit EOC (1) báo "chuyển đổi xong, DR có dữ liệu mới" — đọc DR tự
//     động xoá EOC (giống RXNE của USART1 Bài 9).
//   - CR1: bit EOCIE (5) bật ngắt khi EOC set.
//   - CR2: bit ADON (0) bật khối ADC; bit SWSTART (22) — ghi 1 để bắt đầu
//     chuyển đổi, phần cứng thật TỰ xoá bit này ngay khi bắt đầu (VMCU không
//     lưu lại SWSTART, chỉ dùng làm "cạnh kích hoạt" tức thời).
//   - DR: kết quả 10-bit (0-1023), quy đổi từ adcAnalogInputMv qua đúng công
//     thức Mục 10.2: code = round(V_in / V_ref * (2^N - 1)).
// ---------------------------------------------------------------------------
const ADC1_BASE = 0x40012400;
const ADC1_SR_OFFSET = 0x00;
const ADC1_CR1_OFFSET = 0x04;
const ADC1_CR2_OFFSET = 0x08;
const ADC1_DR_OFFSET = 0x4c;
const ADC1_SR_ADDR = ADC1_BASE + ADC1_SR_OFFSET;
const ADC1_CR1_ADDR = ADC1_BASE + ADC1_CR1_OFFSET;
const ADC1_CR2_ADDR = ADC1_BASE + ADC1_CR2_OFFSET;
const ADC1_DR_ADDR = ADC1_BASE + ADC1_DR_OFFSET;
const ADC1_SR_EOC_BIT = 1;
const ADC1_CR1_EOCIE_BIT = 5;
const ADC1_CR2_ADON_BIT = 0;
const ADC1_CR2_SWSTART_BIT = 22;
const ADC_RESOLUTION_BITS = 10; // 10-bit = 1024 mức (0-1023), dung STM32F103 that
const ADC_VREF_MV = 3300; // 3.3V tinh bang mV - Vref pho bien tren board STM32F103
const IRQ_ADC1 = 18; // vi tri vector that cua ADC1_2 tren STM32F103 (nam trong ISER0, <32)

// An toan tu test/demo: gioi han so lan _serviceInterrupts lap lai trong 1
// lan goi de tranh treo that (vong lap vo han khi ISR quen xoa pending) -
// tren phan cung that, mot watchdog timer se cuoi cung reset board; VMCU
// dung gioi han nay de MO PHONG duoc hau qua ma khong lam treo trinh duyet/Node.
const NVIC_SERVICE_SAFETY_LIMIT = 1000;

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
    // NVIC (Bài 7): reset về 0 đúng hành vi thật — mọi IRQ TẮT (ISER=0),
    // KHÔNG có gì đang chờ (ISPR=0), priority mặc định 0 cho mọi IRQ (số nhỏ
    // nhất có thể — vô hại vì chưa IRQ nào bật để so ưu tiên với nhau).
    // nvicIser/nvicIspr bao IRQ 0-31 (đủ cho Bài 7); nvicIser1/nvicIspr1 bao
    // IRQ 32-63 (Bài 9 cần cho USART1 = IRQ 37). nvicIpr mở lên 64 byte để
    // theo kịp.
    this.nvicIser = 0;
    this.nvicIspr = 0;
    this.nvicIser1 = 0;
    this.nvicIspr1 = 0;
    this.nvicIpr = new Uint8Array(64);
    // Danh sách priority của các ISR đang chạy (đỉnh mảng = ISR trong cùng
    // hiện tại) — KHÔNG phải thanh ghi thật, chỉ là móc nối mô phỏng cơ chế
    // preemption/nested interrupt của phần cứng thật cho demo/self-test.
    this.activePriorityStack = [];
    this.irqHandlers = {};
    // Nhật ký thứ tự ISR đã chạy — KHÔNG phải thanh ghi thật, chỉ để
    // demo/self-test xác minh đúng thứ tự phục vụ ngắt (Mục 6, 7).
    this.isrCallLog = [];
    // EXTI (Bài 7): reset về 0 — chưa đường nào được enable (IMR=0), chưa
    // chọn cạnh nào (RTSR=FTSR=0), chưa có gì pending (PR=0).
    this.extiImr = 0;
    this.extiRtsr = 0;
    this.extiFtsr = 0;
    this.extiPr = 0;
    // USART1 (Bài 9): reset đúng thật — CR1=0 (khối tắt), SR có sẵn TXE=1
    // (thanh ghi truyền LUÔN rảnh khi mới bật nguồn, chưa gửi gì), RXNE=0
    // (chưa nhận gì), BRR=0 (chưa cấu hình baud). uartTxLog KHÔNG phải thanh
    // ghi thật — chỉ để demo/self-test xem lại các byte đã "gửi ra" theo thứ
    // tự, giống nối một máy phân tích logic vào chân TX thật.
    this.usart1Cr1 = 0;
    this.usart1Sr = 1 << USART1_SR_TXE_BIT;
    this.usart1Dr = 0;
    this.usart1Brr = 0;
    this.uartTxLog = [];
    // ADC1 (Bài 10): reset đúng thật — SR=0 (chưa có kết quả), CR1=0 (ngắt
    // tắt), CR2=0 (khối tắt, ADON=0), DR=0. adcAnalogInputMv KHÔNG phải thanh
    // ghi thật — mô phỏng điện áp analog thật đang có mặt ở chân vào ADC (vd
    // vị trí biến trở demo Mục 10.5), MCU thật không có cách nào "biết"
    // giá trị này ngoài việc tự đo qua ADC.
    this.adc1Sr = 0;
    this.adc1Cr1 = 0;
    this.adc1Cr2 = 0;
    this.adc1Dr = 0;
    this.adcAnalogInputMv = 0;
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

  // Dispatch vùng System (lõi ARM) — SysTick (Bài 4) + NVIC (Bài 7). Địa chỉ
  // system khác vẫn đọc 0/ghi vô tác dụng.
  _systemRead8(addr) {
    if (addr >= SYST_CSR_ADDR && addr < SYST_CSR_ADDR + 4) {
      return this._readRegByte(this.systCsr, addr - SYST_CSR_ADDR);
    }
    if (addr >= NVIC_ISER0_ADDR && addr < NVIC_ISER0_ADDR + 4) {
      return this._readRegByte(this.nvicIser, addr - NVIC_ISER0_ADDR);
    }
    if (addr >= NVIC_ISER1_ADDR && addr < NVIC_ISER1_ADDR + 4) {
      return this._readRegByte(this.nvicIser1, addr - NVIC_ISER1_ADDR);
    }
    if (addr >= NVIC_ISPR0_ADDR && addr < NVIC_ISPR0_ADDR + 4) {
      return this._readRegByte(this.nvicIspr, addr - NVIC_ISPR0_ADDR);
    }
    if (addr >= NVIC_ISPR1_ADDR && addr < NVIC_ISPR1_ADDR + 4) {
      return this._readRegByte(this.nvicIspr1, addr - NVIC_ISPR1_ADDR);
    }
    if (addr >= NVIC_IPR_BASE_ADDR && addr < NVIC_IPR_BASE_ADDR + 64) {
      return this.nvicIpr[addr - NVIC_IPR_BASE_ADDR];
    }
    return 0;
  }
  _systemWrite8(addr, v) {
    if (addr >= SYST_CSR_ADDR && addr < SYST_CSR_ADDR + 4) {
      this.systCsr = this._writeRegByte(this.systCsr, addr - SYST_CSR_ADDR, v);
      return;
    }
    // ISER: write-1-to-SET (ghi 0 KHÔNG tắt được IRQ nào - phải dùng ICER).
    if (addr >= NVIC_ISER0_ADDR && addr < NVIC_ISER0_ADDR + 4) {
      const byteIdx = addr - NVIC_ISER0_ADDR;
      this.nvicIser = (this.nvicIser | (v << (byteIdx * 8))) >>> 0;
      return;
    }
    if (addr >= NVIC_ISER1_ADDR && addr < NVIC_ISER1_ADDR + 4) {
      const byteIdx = addr - NVIC_ISER1_ADDR;
      this.nvicIser1 = (this.nvicIser1 | (v << (byteIdx * 8))) >>> 0;
      return;
    }
    // ICER: write-1-to-CLEAR enable (thanh ghi riêng, KHÔNG phải ghi đè ISER).
    if (addr >= NVIC_ICER0_ADDR && addr < NVIC_ICER0_ADDR + 4) {
      const byteIdx = addr - NVIC_ICER0_ADDR;
      this.nvicIser = (this.nvicIser & ~(v << (byteIdx * 8))) >>> 0;
      return;
    }
    if (addr >= NVIC_ICER1_ADDR && addr < NVIC_ICER1_ADDR + 4) {
      const byteIdx = addr - NVIC_ICER1_ADDR;
      this.nvicIser1 = (this.nvicIser1 & ~(v << (byteIdx * 8))) >>> 0;
      return;
    }
    // ISPR: write-1-to-SET pending (dùng để test phần mềm kích ngắt thủ công).
    if (addr >= NVIC_ISPR0_ADDR && addr < NVIC_ISPR0_ADDR + 4) {
      const byteIdx = addr - NVIC_ISPR0_ADDR;
      this.nvicIspr = (this.nvicIspr | (v << (byteIdx * 8))) >>> 0;
      this._serviceInterrupts();
      return;
    }
    if (addr >= NVIC_ISPR1_ADDR && addr < NVIC_ISPR1_ADDR + 4) {
      const byteIdx = addr - NVIC_ISPR1_ADDR;
      this.nvicIspr1 = (this.nvicIspr1 | (v << (byteIdx * 8))) >>> 0;
      this._serviceInterrupts();
      return;
    }
    // ICPR: write-1-to-CLEAR pending.
    if (addr >= NVIC_ICPR0_ADDR && addr < NVIC_ICPR0_ADDR + 4) {
      const byteIdx = addr - NVIC_ICPR0_ADDR;
      this.nvicIspr = (this.nvicIspr & ~(v << (byteIdx * 8))) >>> 0;
      return;
    }
    if (addr >= NVIC_ICPR1_ADDR && addr < NVIC_ICPR1_ADDR + 4) {
      const byteIdx = addr - NVIC_ICPR1_ADDR;
      this.nvicIspr1 = (this.nvicIspr1 & ~(v << (byteIdx * 8))) >>> 0;
      return;
    }
    // IPR: mảng priority byte-addressable, ghi đè thường (không phải w1s/w1c).
    if (addr >= NVIC_IPR_BASE_ADDR && addr < NVIC_IPR_BASE_ADDR + 64) {
      this.nvicIpr[addr - NVIC_IPR_BASE_ADDR] = v;
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
    if (addr >= EXTI_IMR_ADDR && addr < EXTI_IMR_ADDR + 4) {
      return this._readRegByte(this.extiImr, addr - EXTI_IMR_ADDR);
    }
    if (addr >= EXTI_RTSR_ADDR && addr < EXTI_RTSR_ADDR + 4) {
      return this._readRegByte(this.extiRtsr, addr - EXTI_RTSR_ADDR);
    }
    if (addr >= EXTI_FTSR_ADDR && addr < EXTI_FTSR_ADDR + 4) {
      return this._readRegByte(this.extiFtsr, addr - EXTI_FTSR_ADDR);
    }
    if (addr >= EXTI_PR_ADDR && addr < EXTI_PR_ADDR + 4) {
      return this._readRegByte(this.extiPr, addr - EXTI_PR_ADDR);
    }
    if (addr >= USART1_SR_ADDR && addr < USART1_SR_ADDR + 4) {
      return this._readRegByte(this.usart1Sr, addr - USART1_SR_ADDR);
    }
    if (addr >= USART1_DR_ADDR && addr < USART1_DR_ADDR + 4) {
      // Đọc DR: lấy byte RX vừa nhận, TỰ ĐỘNG xoá RXNE (đúng hành vi thật —
      // đọc DR chính là cách phần cứng biết "main đã lấy byte, có thể nhận
      // byte kế tiếp"). Chỉ byte thấp nhất (offset 0) có ý nghĩa.
      if (addr - USART1_DR_ADDR === 0) {
        this.usart1Sr = (this.usart1Sr & ~(1 << USART1_SR_RXNE_BIT)) >>> 0;
        return this.usart1Dr;
      }
      return 0;
    }
    if (addr >= USART1_BRR_ADDR && addr < USART1_BRR_ADDR + 4) {
      return this._readRegByte(this.usart1Brr, addr - USART1_BRR_ADDR);
    }
    if (addr >= USART1_CR1_ADDR && addr < USART1_CR1_ADDR + 4) {
      return this._readRegByte(this.usart1Cr1, addr - USART1_CR1_ADDR);
    }
    if (addr >= ADC1_SR_ADDR && addr < ADC1_SR_ADDR + 4) {
      return this._readRegByte(this.adc1Sr, addr - ADC1_SR_ADDR);
    }
    if (addr >= ADC1_CR1_ADDR && addr < ADC1_CR1_ADDR + 4) {
      return this._readRegByte(this.adc1Cr1, addr - ADC1_CR1_ADDR);
    }
    if (addr >= ADC1_CR2_ADDR && addr < ADC1_CR2_ADDR + 4) {
      return this._readRegByte(this.adc1Cr2, addr - ADC1_CR2_ADDR);
    }
    if (addr >= ADC1_DR_ADDR && addr < ADC1_DR_ADDR + 4) {
      // Đọc DR: lấy kết quả 10-bit vừa chuyển đổi, TỰ ĐỘNG xoá EOC (đúng hành
      // vi thật — đọc DR là cách phần cứng biết "main đã lấy kết quả").
      if (addr - ADC1_DR_ADDR === 0) {
        this.adc1Sr = (this.adc1Sr & ~(1 << ADC1_SR_EOC_BIT)) >>> 0;
        return this.adc1Dr & 0xff;
      }
      if (addr - ADC1_DR_ADDR === 1) {
        return (this.adc1Dr >>> 8) & 0xff;
      }
      return 0;
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
    if (addr >= EXTI_IMR_ADDR && addr < EXTI_IMR_ADDR + 4) {
      this.extiImr = this._writeRegByte(this.extiImr, addr - EXTI_IMR_ADDR, v);
      return;
    }
    if (addr >= EXTI_RTSR_ADDR && addr < EXTI_RTSR_ADDR + 4) {
      this.extiRtsr = this._writeRegByte(this.extiRtsr, addr - EXTI_RTSR_ADDR, v);
      return;
    }
    if (addr >= EXTI_FTSR_ADDR && addr < EXTI_FTSR_ADDR + 4) {
      this.extiFtsr = this._writeRegByte(this.extiFtsr, addr - EXTI_FTSR_ADDR, v);
      return;
    }
    // EXTI_PR: write-1-to-CLEAR (giống ICPR của NVIC) - KHÔNG phải ghi đè.
    // Quên gọi write này trong ISR là cạm bẫy chí mạng nhất của Bài 7.
    if (addr >= EXTI_PR_ADDR && addr < EXTI_PR_ADDR + 4) {
      const byteIdx = addr - EXTI_PR_ADDR;
      this.extiPr = (this.extiPr & ~(v << (byteIdx * 8))) >>> 0;
      return;
    }
    if (addr >= USART1_DR_ADDR && addr < USART1_DR_ADDR + 4) {
      // Ghi DR: "gửi" 1 byte. VMCU đơn giản hoá — coi truyền là TỨC THỜI
      // (không có độ trễ dịch bit thật) nên TXE vẫn giữ nguyên = 1 ngay sau
      // khi ghi (khác phần cứng thật — nơi TXE tạm về 0 rồi mới set lại khi
      // dịch xong). uartTxLog ghi lại đúng thứ tự byte đã gửi cho waveform
      // Mục 9.5 và self-test — KHÔNG phải thanh ghi thật.
      if (addr - USART1_DR_ADDR === 0) {
        this.uartTxLog.push(v);
        if (((this.usart1Cr1 >>> USART1_CR1_TXEIE_BIT) & 1) === 1) {
          this.triggerInterrupt(IRQ_USART1);
        }
      }
      return;
    }
    if (addr >= USART1_BRR_ADDR && addr < USART1_BRR_ADDR + 4) {
      this.usart1Brr = this._writeRegByte(this.usart1Brr, addr - USART1_BRR_ADDR, v);
      return;
    }
    if (addr >= USART1_CR1_ADDR && addr < USART1_CR1_ADDR + 4) {
      this.usart1Cr1 = this._writeRegByte(this.usart1Cr1, addr - USART1_CR1_ADDR, v);
      return;
    }
    if (addr >= ADC1_CR1_ADDR && addr < ADC1_CR1_ADDR + 4) {
      this.adc1Cr1 = this._writeRegByte(this.adc1Cr1, addr - ADC1_CR1_ADDR, v);
      return;
    }
    if (addr >= ADC1_CR2_ADDR && addr < ADC1_CR2_ADDR + 4) {
      const before = this.adc1Cr2;
      this.adc1Cr2 = this._writeRegByte(this.adc1Cr2, addr - ADC1_CR2_ADDR, v);
      const swstartNow = ((this.adc1Cr2 >>> ADC1_CR2_SWSTART_BIT) & 1) === 1;
      const swstartBefore = ((before >>> ADC1_CR2_SWSTART_BIT) & 1) === 1;
      if (swstartNow && !swstartBefore) {
        this._adcRunConversion();
        // Phần cứng thật tự xoá SWSTART ngay khi bắt đầu — VMCU không lưu
        // lại bit này để tránh kích hoạt lại một chuyển đổi nữa khi đọc lại.
        this.adc1Cr2 = (this.adc1Cr2 & ~(1 << ADC1_CR2_SWSTART_BIT)) >>> 0;
      }
      return;
    }
    // peripheral khác chưa nối — ghi không có tác dụng gì
  }

  // Thực hiện 1 lần chuyển đổi SAR (Mục 10.1) — VMCU bỏ qua thời gian chuyển
  // đổi thật, chỉ giữ đúng Ý NGHĨA: lượng tử hoá adcAnalogInputMv thành mã
  // 10-bit đúng công thức Mục 10.2, ghi vào DR, bật EOC, báo ngắt nếu EOCIE.
  _adcRunConversion() {
    const code = adcVoltageToCode(this.adcAnalogInputMv, ADC_VREF_MV, ADC_RESOLUTION_BITS);
    this.adc1Dr = code;
    this.adc1Sr = (this.adc1Sr | (1 << ADC1_SR_EOC_BIT)) >>> 0;
    if (((this.adc1Cr1 >>> ADC1_CR1_EOCIE_BIT) & 1) === 1) {
      this.triggerInterrupt(IRQ_ADC1);
    }
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

  // USART1 co dang bat hay khong (bit UE cua CR1).
  usart1Enabled() {
    return ((this.usart1Cr1 >>> USART1_CR1_UE_BIT) & 1) === 1;
  }

  // Mô phỏng 1 byte "từ bên ngoài" bay tới chân RX (vd người gõ phím trong
  // demo Mục 9.5). Trên phần cứng thật đây là kết quả của quá trình dịch bit
  // nối tiếp qua chân vật lý — VMCU bỏ qua tầng bit-serial, coi cả byte tới
  // cùng lúc, giữ đúng Ý NGHĨA tầng thanh ghi: DR nhận giá trị, RXNE bật lên,
  // và nếu RXNEIE đang bật thì báo ngắt NGAY (đúng thiết kế thật).
  uartInjectRxByte(byte) {
    this.usart1Dr = byte & 0xff;
    this.usart1Sr = (this.usart1Sr | (1 << USART1_SR_RXNE_BIT)) >>> 0;
    if (((this.usart1Cr1 >>> USART1_CR1_RXNEIE_BIT) & 1) === 1) {
      this.triggerInterrupt(IRQ_USART1);
    }
  }

  // ADC1 co dang bat hay khong (bit ADON cua CR2).
  adcEnabled() {
    return ((this.adc1Cr2 >>> ADC1_CR2_ADON_BIT) & 1) === 1;
  }

  // Dat dien ap analog mo phong dang co mat o chan vao ADC (mV) - vd vi tri
  // bien tro trong demo Muc 10.5. Gia tri nay KHONG tu dong "chay" vao DR -
  // firmware van phai tu kich hoat mot lan chuyen doi qua SWSTART.
  adcSetAnalogInputMv(mv) {
    this.adcAnalogInputMv = mv;
  }

  // "Vector table" mô phỏng (Bài 7 Mục 2): trên phần cứng thật đây là 1 mảng
  // con trỏ hàm nằm đầu Flash, linker tự nối tên hàm (vd TIM1_UP_IRQHandler)
  // vào đúng ô ứng với số IRQ. VMCU không mô phỏng linker/Flash thật, chỉ
  // giữ đúng Ý NGHĨA: đăng ký 1 hàm JS làm "ISR" cho 1 số IRQ cụ thể.
  installIrqHandler(irqNum, fn) {
    this.irqHandlers[irqNum] = fn;
  }

  nvicIrqEnabled(irqNum) {
    if (irqNum < 32) return ((this.nvicIser >>> irqNum) & 1) === 1;
    return ((this.nvicIser1 >>> (irqNum - 32)) & 1) === 1;
  }

  nvicPriority(irqNum) {
    return this.nvicIpr[irqNum];
  }

  // EXTI request tới NVIC là MỨC (level), không phải chốt 1 lần: đường yêu
  // cầu ngắt của EXTI = (PR & IMR) — hễ PR vẫn còn set (quên xoá trong ISR)
  // VÀ đường đó vẫn được enable qua IMR, yêu cầu ngắt VẪN CÒN, nên NVIC phải
  // pend LẠI ngay khi có dịp kiểm tra tiếp — đây là gốc rễ thật của cạm bẫy
  // "quên xoá PR -> ISR gọi lại vô hạn" (Mục 4), không phải lỗi giả lập.
  _syncExtiToNvic() {
    const requesting = (this.extiPr & this.extiImr & (1 << EXTI_LINE1_BIT)) !== 0;
    if (requesting) this.nvicIspr = (this.nvicIspr | (1 << IRQ_EXTI1)) >>> 0;
  }

  // Mô phỏng 1 cạnh tín hiệu xảy ra trên đường EXTI line 1 (chân nút nhấn,
  // giống PA1 các bài trước). Trên phần cứng thật, PR được phần cứng SET
  // ngay cả khi IMR đang mask đường đó (chỉ IMR quyết định có BÁO lên NVIC
  // hay không, không quyết định PR có set hay không) — VMCU giữ đúng hành
  // vi này để Mục 4 test được cả 2 trường hợp.
  exti1EdgeOccurred() {
    this.extiPr = (this.extiPr | (1 << EXTI_LINE1_BIT)) >>> 0;
    this._syncExtiToNvic();
    this._serviceInterrupts();
  }

  // Phần mềm/ngoại vi khác (vd TIM1 Mục 6/7, USART1 Mục 9.3) xin ngắt trực
  // tiếp qua NVIC, không qua EXTI — dùng cho nguồn ngắt thứ hai trong demo
  // nested interrupt, và cho USART1 (IRQ >= 32, rơi vào từ thứ 2).
  triggerInterrupt(irqNum) {
    if (irqNum < 32) this.nvicIspr = (this.nvicIspr | (1 << irqNum)) >>> 0;
    else this.nvicIspr1 = (this.nvicIspr1 | (1 << (irqNum - 32))) >>> 0;
    this._serviceInterrupts();
  }

  // Trung tâm mô phỏng ngắt: chạy MỌI ISR đang chờ, được BẬT, và có priority
  // CAO HƠN (số nhỏ hơn) priority đang chạy hiện tại — đúng cơ chế
  // preemption/nested interrupt thật. Đệ quy tự nhiên: nếu 1 ISR đang chạy
  // tự kích 1 ngắt ưu tiên cao hơn (triggerInterrupt/exti1EdgeOccurred), lời
  // gọi _serviceInterrupts bên trong sẽ chen ngang chạy NGAY (nested), rồi
  // trả lại đúng chỗ ISR ban đầu đang dở dang — không cần dựng máy trạng
  // thái phức tạp, JS call stack tự làm việc đó.
  _serviceInterrupts() {
    let safety = 0;
    while (safety++ < NVIC_SERVICE_SAFETY_LIMIT) {
      this._syncExtiToNvic(); // EXTI la muc (level) - phai tinh lai moi vong

      const currentPriority =
        this.activePriorityStack.length > 0 ? this.activePriorityStack[this.activePriorityStack.length - 1] : Infinity;

      // Quét CẢ 2 từ 32-bit (IRQ 0-31 và 32-63) — Bài 7 chỉ dùng từ đầu, Bài
      // 9 (USART1 = IRQ 37) mới cần tới từ thứ 2.
      let bestIrq = -1;
      let bestPriority = Infinity;
      for (let irq = 0; irq < 64; irq++) {
        const word = irq < 32 ? this.nvicIspr : this.nvicIspr1;
        const enabledWord = irq < 32 ? this.nvicIser : this.nvicIser1;
        const bit = irq % 32;
        const pending = (word >>> bit) & 1;
        const enabled = (enabledWord >>> bit) & 1;
        if (pending && enabled) {
          const p = this.nvicIpr[irq];
          if (p < bestPriority) {
            bestPriority = p;
            bestIrq = irq;
          }
        }
      }

      if (bestIrq === -1 || bestPriority >= currentPriority) break;

      // Phan cung THAT xoa pending o NVIC ngay khi vao ISR (khac EXTI_PR o
      // muc ngoai vi - cai do PHAI tu tay xoa trong ISR, xem _syncExtiToNvic).
      if (bestIrq < 32) this.nvicIspr = (this.nvicIspr & ~(1 << bestIrq)) >>> 0;
      else this.nvicIspr1 = (this.nvicIspr1 & ~(1 << (bestIrq - 32))) >>> 0;
      this.activePriorityStack.push(bestPriority);
      this.isrCallLog.push(bestIrq);
      const handler = this.irqHandlers[bestIrq];
      if (handler) handler(this);
      this.activePriorityStack.pop();
    }
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

// ---------------------------------------------------------------------------
// Race condition, critical section & ring buffer SPSC (Bài 8) — cũng là logic
// FIRMWARE thuần (như ButtonFSM Bài 5), KHÔNG phải thanh ghi phần cứng, nên
// sống bên ngoài class VMCU.
// ---------------------------------------------------------------------------

// Mô phỏng ĐÚNG 3 bước máy của `counter++` (LDR nạp giá trị cũ vào thanh ghi,
// ADD cộng 1, STR ghi lại) và cách một ISR "chen" vào giữa chuỗi đó làm mất
// cập nhật (lost update) — chính là Mục 8.1-8.2. Để mô phỏng TIẾT ĐỊNH (không
// phải random timing), mỗi "vòng" giả định LUÔN có đúng 1 yêu cầu ngắt muốn
// tăng biến đang chờ; roundNoCriticalSection() cho ISR đó chen vào ĐÚNG giữa
// LDR và STR (kịch bản XẤU NHẤT, tái hiện được ổn định thay vì "thảng hoặc");
// roundWithCriticalSection() hoãn ISR lại tới SAU khi main hoàn tất STR —
// đúng ý nghĩa PRIMASK/`__disable_irq()` của Mục 8.3.
class RacyCounter {
  constructor() {
    this.value = 0;
  }

  // KHÔNG có bảo vệ: ISR chen giữa LDR và STR của main -> cập nhật của ISR bị
  // STR (dùng giá trị LDR cũ) ghi đè mất. Mỗi vòng chỉ net +1 thay vì +2.
  roundNoCriticalSection() {
    const ldr = this.value; // LDR — main đọc giá trị hiện tại vào "thanh ghi"
    this.value = this.value + 1; // ISR chen vào giữa, tăng thật lên bộ nhớ
    const added = ldr + 1; // ADD — main cộng 1 vào giá trị ĐÃ CŨ (không biết ISR vừa đổi)
    this.value = added; // STR — GHI ĐÈ, xoá mất công tăng của ISR
  }

  // Critical section: main hoàn tất TRỌN VẸN LDR-ADD-STR trước, ISR bị hoãn
  // chạy NỐI ĐUÔI sau đó (không chen giữa) -> cả 2 cập nhật đều được giữ.
  roundWithCriticalSection() {
    const ldr = this.value; // LDR
    const added = ldr + 1; // ADD
    this.value = added; // STR — main xong TRỌN VẸN, không ai chen vào được
    this.value = this.value + 1; // ISR chạy SAU, an toàn vì main đã xong
  }
}

// Chạy `iterations` vòng — mỗi vòng có đúng 1 lần main tăng + 1 lần ISR muốn
// tăng. Không bảo vệ: mỗi vòng chỉ net +1 (mất đúng 1 cập nhật/vòng, tổng mất
// = iterations). Có bảo vệ: mỗi vòng net +2 (không mất gì).
function raceDemo(iterations, useCriticalSection) {
  const rc = new RacyCounter();
  for (let i = 0; i < iterations; i++) {
    if (useCriticalSection) rc.roundWithCriticalSection();
    else rc.roundNoCriticalSection();
  }
  const expected = iterations * 2;
  return { finalValue: rc.value, expected, lost: expected - rc.value };
}

// Đọc "xé đôi" (torn read, Mục 8.4): cặp trường liên quan (giờ/phút) bị ISR
// cập nhật GIỮA hai lần đọc riêng lẻ của main -> main thấy tổ hợp CHƯA BAO
// GIỜ tồn tại thật (vd giờ MỚI ghép với phút CŨ). Ví dụ kinh điển: đồng hồ lúc
// 23:59 sang 00:00 — ISR cập nhật cả 2 trường cùng lúc thật (không thể tách).
class TornReadPair {
  constructor(hour, minute) {
    this.hour = hour;
    this.minute = minute;
  }

  // ISR cập nhật CẢ HAI trường "cùng một lúc" (đại diện 1 lần ghi nguyên tử
  // đối với chính ISR — chỉ main đọc xen giữa mới thấy vấn đề).
  isrUpdate(hour, minute) {
    this.hour = hour;
    this.minute = minute;
  }

  // KHÔNG bảo vệ: đọc `hour` xong, NHƯỜNG chỗ cho ISR chen vào cập nhật cả 2
  // trường, rồi mới đọc `minute` — kết quả là tổ hợp {hour cũ, minute mới}.
  mainReadTorn(isrFn) {
    const hour = this.hour;
    if (isrFn) isrFn(this);
    const minute = this.minute;
    return { hour, minute };
  }

  // Critical section: đọc CẢ HAI trường liên tục, ISR chỉ được chạy SAU khi
  // đã đọc xong — luôn thấy đúng 1 trong 2 tổ hợp thật, không bao giờ bị xé.
  mainReadProtected(isrFn) {
    const hour = this.hour;
    const minute = this.minute;
    if (isrFn) isrFn(this);
    return { hour, minute };
  }
}

// Ring buffer SPSC (single-producer single-consumer, Mục 8.5) — cấu trúc dữ
// liệu quan trọng nhất toàn series: ISR (producer) chỉ đụng `head`, main
// (consumer) chỉ đụng `tail` — mỗi bên CHỈ ghi chỉ số CỦA MÌNH nên không cần
// tắt ngắt/khoá gì cả. Dùng đúng 1 ô trống để phân biệt đầy/rỗng (capacity-1
// chỗ dùng được — kỹ thuật chuẩn, tránh nhập nhằng head===tail vừa là "rỗng"
// vừa là "đầy" nếu dùng hết trọn capacity).
class RingBufferSPSC {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Uint8Array(capacity);
    this.head = 0; // vị trí GHI tiếp theo — CHỈ producer (ISR) đụng vào
    this.tail = 0; // vị trí ĐỌC tiếp theo — CHỈ consumer (main) đụng vào
  }

  get count() {
    return (this.head - this.tail + this.capacity) % this.capacity;
  }

  isEmpty() {
    return this.head === this.tail;
  }

  isFull() {
    return this.count === this.capacity - 1;
  }

  // Gọi từ ISR (producer). Trả về false nếu đầy — mất dữ liệu, không throw
  // (ISR không được phép "kẹt" chờ chỗ trống).
  push(byte) {
    if (this.isFull()) return false;
    this.buffer[this.head] = byte & 0xff;
    this.head = (this.head + 1) % this.capacity;
    return true;
  }

  // Gọi từ main (consumer). Trả về null nếu rỗng.
  pop() {
    if (this.isEmpty()) return null;
    const v = this.buffer[this.tail];
    this.tail = (this.tail + 1) % this.capacity;
    return v;
  }
}

// ---------------------------------------------------------------------------
// UART: khung 8N1, baud rate, và mô phỏng lỗi baud (Bài 9) — cũng là hàm
// FIRMWARE/toán học thuần, không phải thanh ghi, nên sống bên ngoài VMCU.
// ---------------------------------------------------------------------------

// Công thức ĐƠN GIẢN của Mục 9.2 (không có hệ số oversampling 16x của thanh
// ghi BRR thật) — BRR = f_clk / baud, làm tròn về số nguyên gần nhất.
function uartBrrForBaud(clockHz, baud) {
  return Math.round(clockHz / baud);
}

// Baud THẬT SỰ đạt được với 1 giá trị BRR cụ thể (do làm tròn ở trên, baud
// thật luôn lệch một chút so với baud mong muốn — chính là "sai số nội tại"
// nhắc tới ở Mục 9.2, TRƯỚC CẢ khi tính tới sai số đồng hồ RC nội).
function uartActualBaud(clockHz, brr) {
  return clockHz / brr;
}

// Khung 8N1: 1 start bit (0) + 8 data bit LSB-first + 1 stop bit (1) — đúng
// thứ tự bit thật sự được dịch ra dây, dùng cho waveform Mục 9.5.
function uartFrameBits(byte) {
  const bits = [0];
  for (let i = 0; i < 8; i++) bits.push((byte >>> i) & 1);
  bits.push(1);
  return bits;
}

// Mô phỏng receiver có đồng hồ LỆCH errorFrac (vd 0.05 = 5%) so với
// transmitter. Transmitter phát mỗi bit trong đúng 1 đơn vị thời gian (chu kỳ
// baud lý tưởng = 1); receiver lấy mẫu tại GIỮA mỗi bit THEO ĐỒNG HỒ CỦA NÓ
// (chu kỳ = 1 - errorFrac). Vì 2 đồng hồ không khớp, điểm lấy mẫu trôi dần xa
// khỏi giữa bit thật qua từng bit — tới một lúc trôi quá nửa chu kỳ (0.5) thì
// đọc NHẦM sang bit kế bên. Trả về bit đã gửi (bits), bit ĐÃ ĐỌC (sampled,
// theo đồng hồ lệch), và có đúng/sai từng vị trí.
function uartSampleWithBaudError(byte, errorFrac) {
  const bits = uartFrameBits(byte); // 10 bit: start + 8 data + stop
  const sampled = [];
  const correctPerBit = [];
  for (let i = 0; i < bits.length; i++) {
    const sampleTime = (i + 0.5) * (1 - errorFrac); // thoi diem lay mau THEO DONG HO RECEIVER
    const actualBitIndex = Math.min(bits.length - 1, Math.max(0, Math.floor(sampleTime)));
    sampled.push(bits[actualBitIndex]);
    correctPerBit.push(actualBitIndex === i);
  }
  return { bits, sampled, correctPerBit, allCorrect: correctPerBit.every(Boolean) };
}

// Công thức Mục 10.2: quy đổi điện áp (mV) sang mã ADC N-bit — làm tròn về
// mức gần nhất, kẹp (clamp) trong khoảng hợp lệ [0, 2^N - 1] nếu điện áp vượt
// ngưỡng (vd nhiễu đẩy dưới 0 hoặc vượt Vref).
function adcVoltageToCode(voltageMv, vrefMv, bits) {
  const maxCode = (1 << bits) - 1;
  const code = Math.round((voltageMv / vrefMv) * maxCode);
  return Math.max(0, Math.min(maxCode, code));
}

// Chiều ngược lại: mã ADC → điện áp (mV) — dùng để "đọc lại" kết quả đã lượng
// tử hoá, minh hoạ sai số lượng tử ±½LSB của Mục 10.2.
function adcCodeToVoltage(code, vrefMv, bits) {
  const maxCode = (1 << bits) - 1;
  return (code / maxCode) * vrefMv;
}

// V_LSB = Vref / 2^N (Mục 10.2) — CHÚ Ý: dùng 2^N (không phải 2^N - 1) vì đây
// là kích thước MỖI bậc lượng tử, khác với maxCode dùng để quy đổi mã.
function adcLsbMv(vrefMv, bits) {
  return vrefMv / Math.pow(2, bits);
}

// Trung bình trượt (Mục 10.4) — cửa sổ kích thước windowSize, tại mỗi điểm i
// lấy trung bình của tối đa windowSize mẫu GẦN NHẤT (ít hơn ở đầu dãy khi
// chưa đủ mẫu) — chính là FIR filter đơn giản nhất (nhắc lại ở Series 14
// Bài 9).
function movingAverage(samples, windowSize) {
  const out = [];
  for (let i = 0; i < samples.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    let sum = 0;
    for (let j = start; j <= i; j++) sum += samples[j];
    out.push(sum / (i - start + 1));
  }
  return out;
}

// Nguồn "nhiễu môi trường" TẤT ĐỊNH (deterministic) cho demo/self-test —
// KHÔNG dùng Math.random() để kết quả lặp lại được giữa các lần chạy. Dùng
// một hàm băm sin quen thuộc (sin(i * hằng số lớn) lấy phần thập phân) để tạo
// chuỗi giả-ngẫu-nhiên ổn định, biên độ ±amplitudeMv quanh 0.
function deterministicNoiseMv(index, amplitudeMv) {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x); // luôn trong [0, 1)
  return (frac * 2 - 1) * amplitudeMv; // trải đều ra [-amplitudeMv, +amplitudeMv]
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
  NVIC_ISER0_ADDR,
  NVIC_ICER0_ADDR,
  NVIC_ISPR0_ADDR,
  NVIC_ICPR0_ADDR,
  NVIC_ISER1_ADDR,
  NVIC_ICER1_ADDR,
  NVIC_ISPR1_ADDR,
  NVIC_ICPR1_ADDR,
  NVIC_IPR_BASE_ADDR,
  IRQ_EXTI1,
  IRQ_TIM1_UP,
  EXTI_IMR_ADDR,
  EXTI_RTSR_ADDR,
  EXTI_FTSR_ADDR,
  EXTI_PR_ADDR,
  EXTI_LINE1_BIT,
  RacyCounter,
  raceDemo,
  TornReadPair,
  RingBufferSPSC,
  USART1_SR_ADDR,
  USART1_DR_ADDR,
  USART1_BRR_ADDR,
  USART1_CR1_ADDR,
  USART1_SR_TXE_BIT,
  USART1_SR_RXNE_BIT,
  USART1_CR1_UE_BIT,
  USART1_CR1_TXEIE_BIT,
  USART1_CR1_RXNEIE_BIT,
  USART1_CLK_HZ,
  IRQ_USART1,
  uartBrrForBaud,
  uartActualBaud,
  uartFrameBits,
  uartSampleWithBaudError,
  ADC1_SR_ADDR,
  ADC1_CR1_ADDR,
  ADC1_CR2_ADDR,
  ADC1_DR_ADDR,
  ADC1_SR_EOC_BIT,
  ADC1_CR1_EOCIE_BIT,
  ADC1_CR2_ADON_BIT,
  ADC1_CR2_SWSTART_BIT,
  ADC_RESOLUTION_BITS,
  ADC_VREF_MV,
  IRQ_ADC1,
  adcVoltageToCode,
  adcCodeToVoltage,
  adcLsbMv,
  movingAverage,
  deterministicNoiseMv,
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

  // --- VMCU: NVIC + EXTI (Bài 7) ---
  {
    const cpu6 = new VMCU();
    check('Reset: NVIC ISER = 0 (mọi IRQ tắt)', cpu6.read32(NVIC_ISER0_ADDR), 0);
    check('Reset: NVIC ISPR = 0 (không gì pending)', cpu6.read32(NVIC_ISPR0_ADDR), 0);
    checkTrue('Reset: IRQ_EXTI1 chưa enable', cpu6.nvicIrqEnabled(IRQ_EXTI1) === false);

    // Bat 1 IRQ qua ISER (write-1-to-set)
    cpu6.write32(NVIC_ISER0_ADDR, 1 << IRQ_EXTI1);
    checkTrue('Sau khi ghi ISER: IRQ_EXTI1 đã enable', cpu6.nvicIrqEnabled(IRQ_EXTI1) === true);
    checkTrue('IRQ khác (TIM1_UP) KHÔNG bị ảnh hưởng — vẫn tắt', cpu6.nvicIrqEnabled(IRQ_TIM1_UP) === false);

    // Tat lai qua ICER (KHONG phai ghi de ISER)
    cpu6.write32(NVIC_ICER0_ADDR, 1 << IRQ_EXTI1);
    checkTrue('Sau khi ghi ICER: IRQ_EXTI1 tắt lại', cpu6.nvicIrqEnabled(IRQ_EXTI1) === false);

    // --- Priority nguoc truc giac: so NHO HON = uu tien CAO HON ---
    cpu6.nvicIpr[IRQ_TIM1_UP] = 0; // uu tien CAO nhat
    cpu6.nvicIpr[IRQ_EXTI1] = 1; // uu tien THAP hon
    cpu6.write32(NVIC_ISER0_ADDR, (1 << IRQ_EXTI1) | (1 << IRQ_TIM1_UP));
    cpu6.installIrqHandler(IRQ_EXTI1, () => {});
    cpu6.installIrqHandler(IRQ_TIM1_UP, () => {});
    // Dat CA 2 pending CUNG LUC (truc tiep, mo phong dung tinh huong "2 ngat
    // cung xin phuc vu" - goi triggerInterrupt() 2 lan rieng le se tu phuc vu
    // ngay lan dau, khong tao duoc tinh huong dong thoi can test o day).
    cpu6.nvicIspr = (1 << IRQ_EXTI1) | (1 << IRQ_TIM1_UP);
    cpu6._serviceInterrupts();
    check(
      'Cùng pending 1 lúc: IRQ ưu tiên SỐ NHỎ HƠN (TIM1_UP=0) chạy TRƯỚC dù EXTI1 đứng trước trong bitmask',
      cpu6.isrCallLog[0],
      IRQ_TIM1_UP
    );
    check('Sau đó mới tới IRQ ưu tiên thấp hơn (EXTI1=1)', cpu6.isrCallLog[1], IRQ_EXTI1);

    // --- Nested interrupt: uu tien CAO HON duoc phep CHEN NGANG (preemption) ---
    const cpu7 = new VMCU();
    const log7 = [];
    cpu7.nvicIpr[IRQ_EXTI1] = 5; // dang chay, uu tien THAP
    cpu7.nvicIpr[IRQ_TIM1_UP] = 1; // uu tien CAO hon EXTI1
    cpu7.write32(NVIC_ISER0_ADDR, (1 << IRQ_EXTI1) | (1 << IRQ_TIM1_UP));
    cpu7.installIrqHandler(IRQ_TIM1_UP, () => log7.push('TIM1_UP running'));
    cpu7.installIrqHandler(IRQ_EXTI1, () => {
      log7.push('EXTI1 start');
      cpu7.triggerInterrupt(IRQ_TIM1_UP); // uu tien cao hon - PHAI chen ngang NGAY
      log7.push('EXTI1 resumed');
    });
    cpu7.triggerInterrupt(IRQ_EXTI1);
    check(
      'Nested: ISR ưu tiên cao chen ngang NGAY LẬP TỨC, rồi trả lại đúng chỗ ISR đang dở dang',
      log7.join(' -> '),
      'EXTI1 start -> TIM1_UP running -> EXTI1 resumed'
    );
    check(
      'isrCallLog ghi đúng cả 2 lần chạy theo thứ tự chen ngang',
      cpu7.isrCallLog.join(','),
      IRQ_EXTI1 + ',' + IRQ_TIM1_UP
    );

    // --- Uu tien THAP HON khong duoc phep chen ngang - phai cho ---
    const cpu8 = new VMCU();
    const log8 = [];
    cpu8.nvicIpr[IRQ_EXTI1] = 1; // dang chay, uu tien CAO
    cpu8.nvicIpr[IRQ_TIM1_UP] = 5; // uu tien THAP hon EXTI1
    cpu8.write32(NVIC_ISER0_ADDR, (1 << IRQ_EXTI1) | (1 << IRQ_TIM1_UP));
    cpu8.installIrqHandler(IRQ_TIM1_UP, () => log8.push('TIM1_UP running'));
    cpu8.installIrqHandler(IRQ_EXTI1, () => {
      log8.push('EXTI1 start');
      cpu8.triggerInterrupt(IRQ_TIM1_UP); // uu tien thap hon - KHONG duoc chen ngang
      log8.push('EXTI1 finish');
    });
    cpu8.triggerInterrupt(IRQ_EXTI1);
    check(
      'Ưu tiên thấp hơn PHẢI chờ ISR đang chạy xong hẳn mới được phục vụ',
      log8.join(' -> '),
      'EXTI1 start -> EXTI1 finish -> TIM1_UP running'
    );

    // --- Cam bay chi mang: quen xoa EXTI_PR trong ISR -> goi lai vo han ---
    const cpu9 = new VMCU();
    cpu9.write32(EXTI_IMR_ADDR, 1 << EXTI_LINE1_BIT); // enable duong line1
    cpu9.write32(NVIC_ISER0_ADDR, 1 << IRQ_EXTI1);
    let goodCount = 0;
    cpu9.installIrqHandler(IRQ_EXTI1, (cpu) => {
      goodCount++;
      cpu.write32(EXTI_PR_ADDR, 1 << EXTI_LINE1_BIT); // XOA pending DUNG cach (write-1-to-clear)
    });
    cpu9.exti1EdgeOccurred();
    check('ISR ĐÚNG (có xoá EXTI_PR): chỉ chạy đúng 1 lần cho 1 cạnh', goodCount, 1);
    check('EXTI_PR đã được xoá về 0 sau khi ISR xoá đúng cách', cpu9.extiPr, 0);

    const cpu10 = new VMCU();
    cpu10.write32(EXTI_IMR_ADDR, 1 << EXTI_LINE1_BIT);
    cpu10.write32(NVIC_ISER0_ADDR, 1 << IRQ_EXTI1);
    let badCount = 0;
    cpu10.installIrqHandler(IRQ_EXTI1, () => {
      badCount++; // QUEN xoa EXTI_PR - dung dung cam bay that
    });
    cpu10.exti1EdgeOccurred();
    checkTrue(
      'ISR SAI (quên xoá EXTI_PR): yêu cầu ngắt vẫn còn treo -> gọi lại LIÊN TỤC tới khi chạm giới hạn an toàn (mô phỏng đúng vòng lặp vô hạn thật, phần cứng thật cần watchdog reset)',
      badCount === NVIC_SERVICE_SAFETY_LIMIT
    );

    // --- IMR mask: PR van set khi co canh, nhung KHONG bao len NVIC neu bi mask ---
    const cpu11 = new VMCU();
    cpu11.write32(NVIC_ISER0_ADDR, 1 << IRQ_EXTI1);
    // KHONG bat EXTI_IMR (extiImr = 0 mac dinh) - duong bi mask
    let maskedCount = 0;
    cpu11.installIrqHandler(IRQ_EXTI1, () => {
      maskedCount++;
    });
    cpu11.exti1EdgeOccurred();
    checkTrue('Đường bị mask (IMR=0): ISR KHÔNG được gọi dù có cạnh xảy ra', maskedCount === 0);
    check(
      'Nhưng EXTI_PR VẪN được set bởi phần cứng (đúng hành vi thật — IMR chỉ chặn báo lên NVIC, không chặn PR)',
      cpu11.extiPr,
      1 << EXTI_LINE1_BIT
    );
  }

  // --- Race condition & critical section (Bài 8) ---
  {
    const noProtect = raceDemo(10000, false);
    check(
      'Không bảo vệ: final value = 10000 (mỗi vòng chỉ net +1, mất đúng 1 update/vòng)',
      noProtect.finalValue,
      10000
    );
    check('Không bảo vệ: kỳ vọng đúng ra phải là 20000 nếu không mất gì', noProtect.expected, 20000);
    check('Không bảo vệ: mất đúng 10000 update (100% lost, kịch bản xấu nhất tái hiện được)', noProtect.lost, 10000);

    const protected_ = raceDemo(10000, true);
    check('Có critical section: final value = 20000 (không mất update nào)', protected_.finalValue, 20000);
    check('Có critical section: lost = 0', protected_.lost, 0);
  }

  // --- Torn read (Bài 8 Mục 8.4) ---
  {
    const pair = new TornReadPair(23, 59);
    const isrMidnight = (p) => p.isrUpdate(0, 0); // ISR: 23:59 -> 00:00 giữa 2 lần đọc

    const torn = pair.mainReadTorn(isrMidnight);
    checkTrue(
      'Đọc không bảo vệ: thấy tổ hợp XÉ ĐÔI {hour cũ=23, minute mới=0} — CHƯA BAO GIỜ tồn tại thật',
      torn.hour === 23 && torn.minute === 0
    );

    const pair2 = new TornReadPair(23, 59);
    const protectedRead = pair2.mainReadProtected(isrMidnight);
    checkTrue(
      'Đọc có bảo vệ: luôn thấy 1 trong 2 tổ hợp THẬT (23:59 trước ISR), không bị xé',
      protectedRead.hour === 23 && protectedRead.minute === 59
    );
  }

  // --- Ring buffer SPSC (Bài 8 Mục 8.5) ---
  {
    const rb = new RingBufferSPSC(4); // 4 o, nhung chi dung duoc 3 (1 o de phan biet day/rong)
    checkTrue('Ring buffer mới: rỗng', rb.isEmpty() === true);
    checkTrue('Ring buffer mới: chưa đầy', rb.isFull() === false);
    check('pop() khi rỗng trả về null', rb.pop(), null);

    checkTrue('push 3 byte đầu tiên: đều thành công', rb.push(0x10) && rb.push(0x20) && rb.push(0x30));
    checkTrue('Sau khi push đủ capacity-1: buffer ĐẦY', rb.isFull() === true);
    checkTrue('push khi đầy: bị từ chối (trả về false), không throw', rb.push(0x40) === false);

    check('pop() đầu tiên: đúng thứ tự FIFO — 0x10 ra trước', rb.pop(), 0x10);
    checkTrue('Sau khi pop 1: không còn đầy nữa', rb.isFull() === false);
    check('pop() thứ hai: 0x20', rb.pop(), 0x20);
    check('pop() thứ ba: 0x30', rb.pop(), 0x30);
    checkTrue('Pop hết: rỗng trở lại', rb.isEmpty() === true);

    // Lấp đầy/rút cạn nhiều vòng (wrap-around head/tail qua lại) — đúng đắn
    // không suy giảm dù con trỏ quay vòng qua vòng nhiều lần.
    let allCorrect = true;
    for (let round = 0; round < 10; round++) {
      rb.push(round);
      rb.push(round + 100);
      const a = rb.pop();
      const b = rb.pop();
      if (a !== round || b !== round + 100) allCorrect = false;
    }
    checkTrue('Push/pop xen kẽ nhiều vòng (head/tail quay vòng qua lại): luôn đúng thứ tự FIFO', allCorrect);
  }

  // --- VMCU: USART1 (Bài 9) ---
  {
    const cpuU = new VMCU();
    check('Reset: CR1 = 0 (UART tắt)', cpuU.read32(USART1_CR1_ADDR), 0);
    checkTrue('Reset: usart1Enabled() = false', cpuU.usart1Enabled() === false);
    checkTrue('Reset: TXE = 1 (sẵn sàng gửi ngay cả khi tắt)', ((cpuU.usart1Sr >>> USART1_SR_TXE_BIT) & 1) === 1);
    checkTrue('Reset: RXNE = 0 (chưa nhận gì)', ((cpuU.usart1Sr >>> USART1_SR_RXNE_BIT) & 1) === 0);

    // Bật UE (RMW quen thuộc từ các bài trước)
    cpuU.write32(USART1_CR1_ADDR, cpuU.read32(USART1_CR1_ADDR) | (1 << USART1_CR1_UE_BIT));
    checkTrue('Sau khi bật UE: usart1Enabled() = true', cpuU.usart1Enabled() === true);

    // --- Ghi DR: "gửi" byte, ghi lại đúng thứ tự vào uartTxLog ---
    cpuU.write32(USART1_DR_ADDR, 0x41); // 'A'
    cpuU.write32(USART1_DR_ADDR, 0x42); // 'B'
    checkTrue('uartTxLog ghi đúng 2 byte theo thứ tự đã gửi', cpuU.uartTxLog.join(',') === '65,66');
    checkTrue('Sau khi gửi: TXE vẫn = 1 (VMCU coi truyền tức thời)', ((cpuU.usart1Sr >>> USART1_SR_TXE_BIT) & 1) === 1);

    // --- Nhận byte (RX) qua uartInjectRxByte: RXNE bật, đọc DR trả đúng byte và tự xoá RXNE ---
    cpuU.uartInjectRxByte(0x4c); // 'L'
    checkTrue('Sau khi nhận: RXNE = 1', ((cpuU.usart1Sr >>> USART1_SR_RXNE_BIT) & 1) === 1);
    check('Đọc DR trả đúng byte vừa nhận', cpuU.read32(USART1_DR_ADDR), 0x4c);
    checkTrue('Đọc DR xong: RXNE tự động về 0', ((cpuU.usart1Sr >>> USART1_SR_RXNE_BIT) & 1) === 0);

    // --- Ngắt TX/RX qua IRQ_USART1 (dùng chung, đúng thiết kế thật) ---
    const cpuU2 = new VMCU();
    cpuU2.write32(NVIC_ISER1_ADDR, 1 << (IRQ_USART1 - 32));
    cpuU2.write32(USART1_CR1_ADDR, (1 << USART1_CR1_TXEIE_BIT) | (1 << USART1_CR1_RXNEIE_BIT));
    const isrLog = [];
    cpuU2.installIrqHandler(IRQ_USART1, () => isrLog.push('fired'));
    cpuU2.write32(USART1_DR_ADDR, 0x58); // ghi DR (TX) voi TXEIE bat -> phai bao ngat
    check('TXEIE bật: ghi DR kích hoạt đúng 1 lần ngắt IRQ_USART1', isrLog.length, 1);
    cpuU2.uartInjectRxByte(0x59); // nhan byte (RX) voi RXNEIE bat -> phai bao ngat
    check('RXNEIE bật: nhận byte kích hoạt thêm 1 lần ngắt IRQ_USART1', isrLog.length, 2);

    const cpuU3 = new VMCU(); // KHONG bat TXEIE/RXNEIE - khong duoc bao ngat
    cpuU3.write32(NVIC_ISER1_ADDR, 1 << (IRQ_USART1 - 32));
    const isrLog2 = [];
    cpuU3.installIrqHandler(IRQ_USART1, () => isrLog2.push('fired'));
    cpuU3.write32(USART1_DR_ADDR, 0x5a);
    cpuU3.uartInjectRxByte(0x5b);
    check('TXEIE/RXNEIE tắt: không ngắt nào được báo dù có gửi/nhận', isrLog2.length, 0);
  }

  // --- UART: baud rate formula (Bài 9 Mục 9.2) ---
  {
    check('BRR cho 9600 baud @ 72MHz = 7500 (chia hết, không sai số)', uartBrrForBaud(USART1_CLK_HZ, 9600), 7500);
    check('Baud thật từ BRR=7500 @ 72MHz = đúng 9600 (khớp lại)', uartActualBaud(USART1_CLK_HZ, 7500), 9600);

    // Clock RC noi 8MHz (khong chia het cho 9600) -> co sai so lam tron nho
    const clkRc = 8000000;
    const brrRc = uartBrrForBaud(clkRc, 9600);
    check('BRR cho 9600 baud @ 8MHz (RC nội) = 833', brrRc, 833);
    const actualRc = uartActualBaud(clkRc, brrRc);
    checkTrue(
      'Baud thật @ 8MHz lệch NHỎ so với 9600 do làm tròn BRR (9603.84, ~0.04% - vẫn an toàn)',
      Math.abs(actualRc - 9603.84) < 0.01
    );
  }

  // --- UART: khung 8N1 & mô phỏng lỗi baud (Bài 9 Mục 9.1, 9.5) ---
  {
    checkTrue(
      "Khung 8N1 của 'A' (0x41): start=0, data LSB-first, stop=1",
      uartFrameBits(0x41).join(',') === [0, 1, 0, 0, 0, 0, 0, 1, 0, 1].join(',')
    );

    // Sai so baud nho (2%, 5%): van nam trong "ngan sach an toan" - doc DUNG het khung
    checkTrue("Lệch baud 2%: khung 'A' vẫn đọc ĐÚNG hết 10 bit", uartSampleWithBaudError(0x41, 0.02).allCorrect);
    checkTrue(
      "Lệch baud 5%: khung 'A' vẫn đọc ĐÚNG hết 10 bit (sát biên an toàn)",
      uartSampleWithBaudError(0x41, 0.05).allCorrect
    );

    // Vuot qua nguong ~5.3%: bit CUOI (stop bit, vi tri 9) la bit dau tien sai
    const r53 = uartSampleWithBaudError(0x41, 0.053);
    checkTrue('Lệch baud 5.3%: BẮT ĐẦU sai — đúng 1 bit sai (bit cuối/stop)', !r53.allCorrect);
    check(
      'Lệch baud 5.3%: chỉ đúng 9/10 bit (bit stop là bit sai đầu tiên)',
      r53.correctPerBit.filter(Boolean).length,
      9
    );

    // Loi baud lon (8%): vo khung ro ret - 4/10 bit sai (gan nua khung)
    const r8 = uartSampleWithBaudError(0x41, 0.08);
    check(
      'Lệch baud 8%: vỡ khung rõ rệt — chỉ còn đúng 6/10 bit (4 bit sai)',
      r8.correctPerBit.filter(Boolean).length,
      6
    );
  }

  // --- ADC1: quy đổi mã & LSB (Bài 10 Mục 10.2) ---
  {
    checkTrue('V_LSB 10-bit @ 3300mV ≈ 3.2226mV', Math.abs(adcLsbMv(3300, 10) - 3.22265625) < 1e-9);
    checkTrue('V_LSB 4-bit @ 3300mV = 206.25mV (bậc lượng tử THÔ hơn 10-bit rất nhiều)', adcLsbMv(3300, 4) === 206.25);
    check('code(0mV, 10-bit) = 0 (đáy thang)', adcVoltageToCode(0, 3300, 10), 0);
    check('code(3300mV, 10-bit) = 1023 (đỉnh thang, 2^10 - 1)', adcVoltageToCode(3300, 3300, 10), 1023);
    check('code(1650mV, 10-bit) = 512 (giữa thang)', adcVoltageToCode(1650, 3300, 10), 512);
    check('code(1650mV, 4-bit) = 8 (chỉ 16 mức — thô hơn nhiều)', adcVoltageToCode(1650, 3300, 4), 8);
    checkTrue(
      'codeToVoltage(512, 10-bit) khớp lại rất sát 1650mV (sai số lượng tử nhỏ)',
      Math.abs(adcCodeToVoltage(512, 3300, 10) - 1650) < 2
    );
    check(
      'codeToVoltage(8, 4-bit) = 1760mV — sai 110mV so với 1650mV gốc (bậc thang quá thô)',
      adcCodeToVoltage(8, 3300, 4),
      1760
    );
    checkTrue('code âm (nhiễu kéo dưới 0) bị kẹp về 0', adcVoltageToCode(-50, 3300, 10) === 0);
    checkTrue('code vượt Vref bị kẹp về mã tối đa', adcVoltageToCode(4000, 3300, 10) === 1023);
  }

  // --- ADC1: thanh ghi SR/CR1/CR2/DR + ngắt EOC (Bài 10 Mục 10.1, 10.3) ---
  {
    const cpuA = new VMCU();
    check('Reset: CR2 = 0 (ADC tắt, ADON=0)', cpuA.read32(ADC1_CR2_ADDR), 0);
    checkTrue('Reset: adcEnabled() = false', cpuA.adcEnabled() === false);
    check('Reset: SR = 0 (chưa có kết quả nào, EOC=0)', cpuA.read32(ADC1_SR_ADDR), 0);

    cpuA.adcSetAnalogInputMv(1650);
    cpuA.write32(ADC1_CR2_ADDR, 1 << ADC1_CR2_ADON_BIT);
    checkTrue('Bật ADON: adcEnabled() = true', cpuA.adcEnabled() === true);
    check('Chưa SWSTART: DR vẫn = 0 (chưa chuyển đổi lần nào)', cpuA.read32(ADC1_DR_ADDR), 0);

    cpuA.write32(ADC1_CR2_ADDR, (1 << ADC1_CR2_ADON_BIT) | (1 << ADC1_CR2_SWSTART_BIT));
    checkTrue(
      'Ghi SWSTART: EOC bật lên 1 NGAY (VMCU bỏ qua độ trễ SAR thật)',
      ((cpuA.read32(ADC1_SR_ADDR) >>> ADC1_SR_EOC_BIT) & 1) === 1
    );
    check('DR sau chuyển đổi = 512 (1650mV → mã 10-bit)', cpuA.read32(ADC1_DR_ADDR), 512);
    checkTrue('Đọc DR xong: EOC tự động xoá về 0', ((cpuA.read32(ADC1_SR_ADDR) >>> ADC1_SR_EOC_BIT) & 1) === 0);
    checkTrue(
      'SWSTART không tự lưu lại (phần cứng thật tự xoá bit này ngay khi bắt đầu)',
      ((cpuA.read32(ADC1_CR2_ADDR) >>> ADC1_CR2_SWSTART_BIT) & 1) === 0
    );

    // Ngat EOC (EOCIE) qua IRQ_ADC1
    const cpuB = new VMCU();
    const isrLogB = [];
    cpuB.write32(NVIC_ISER0_ADDR, 1 << IRQ_ADC1);
    cpuB.installIrqHandler(IRQ_ADC1, () => isrLogB.push('adc-eoc'));
    cpuB.write32(ADC1_CR1_ADDR, 1 << ADC1_CR1_EOCIE_BIT);
    cpuB.adcSetAnalogInputMv(3300);
    cpuB.write32(ADC1_CR2_ADDR, (1 << ADC1_CR2_ADON_BIT) | (1 << ADC1_CR2_SWSTART_BIT));
    check('EOCIE bật: 1 lần SWSTART kích hoạt đúng 1 lần ngắt IRQ_ADC1', isrLogB.length, 1);
    check('DR ở 3300mV (full-scale) = 1023', cpuB.read32(ADC1_DR_ADDR), 1023);

    // EOCIE tat -> khong bao ngat du van chuyen doi binh thuong
    const cpuC = new VMCU();
    const isrLogC = [];
    cpuC.write32(NVIC_ISER0_ADDR, 1 << IRQ_ADC1);
    cpuC.installIrqHandler(IRQ_ADC1, () => isrLogC.push('adc-eoc'));
    cpuC.adcSetAnalogInputMv(1650);
    cpuC.write32(ADC1_CR2_ADDR, (1 << ADC1_CR2_ADON_BIT) | (1 << ADC1_CR2_SWSTART_BIT));
    check('EOCIE tắt: không ngắt nào được báo dù chuyển đổi vẫn chạy', isrLogC.length, 0);
    check('...nhưng DR vẫn cập nhật đúng (polling vẫn đọc được)', cpuC.read32(ADC1_DR_ADDR), 512);
  }

  // --- ADC1: trung bình trượt / oversampling (Bài 10 Mục 10.4) ---
  {
    check(
      'movingAverage([10,20,30,40], window=2) = [10,15,25,35]',
      movingAverage([10, 20, 30, 40], 2).join(','),
      [10, 15, 25, 35].join(',')
    );
    check(
      'movingAverage cửa sổ=1 trả về nguyên mẫu gốc (không lọc gì)',
      movingAverage([5, 9, 2], 1).join(','),
      [5, 9, 2].join(',')
    );

    // Nhieu tat dinh +-50mV quanh 1650mV, 20 mau, cua so 8 -> phuong sai giam manh
    const N = 20;
    const raw = [];
    for (let i = 0; i < N; i++) raw.push(1650 + deterministicNoiseMv(i, 50));
    const smoothed = movingAverage(raw, 8);
    function variance(arr) {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
    }
    const rawVar = variance(raw);
    const smoothedVar = variance(smoothed);
    checkTrue('Nhiễu ±50mV verified: phương sai mẫu thô ≈ 901 (dao động mạnh)', Math.abs(rawVar - 901.48) < 1);
    checkTrue(
      'Sau trung bình trượt cửa sổ=8: phương sai giảm còn ≈ 250 (mượt hơn rõ rệt, ~3,6 lần)',
      Math.abs(smoothedVar - 250.25) < 1
    );
    checkTrue('Trung bình trượt LUÔN giảm phương sai so với tín hiệu thô ở demo này', smoothedVar < rawVar);
  }

  // --- VMCU: địa chỉ ngoài mọi vùng -> HardFault ---
  checkThrows('read8 địa chỉ không hợp lệ -> HardFault', () => cpu.read8(0x00001000), HardFaultError);
  checkThrows('write8 địa chỉ không hợp lệ -> HardFault', () => cpu.write8(0x90000000, 1), HardFaultError);

  console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');
}
