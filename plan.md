# Kế Hoạch & Lộ Trình Phát Triển Các Series Bài Học Mới — js-tools.org

Tài liệu này cung cấp **định hướng chi tiết, ngăn xếp công nghệ (tech stack), thiết kế giao diện demo tương tác và nội dung học thuật chuyên sâu** cho từng bài học trong 5 series mới để phục vụ thẩm định trước khi triển khai thực tế.

> ⚠️ **Quy tắc kỹ thuật/QA (Điều kiện chặn, Definition of Done, checklist trước khi báo "xong")
> đã chuyển sang [`check-lesson.md`](check-lesson.md)** — đọc file đó TRƯỚC KHI viết bài và
> chạy lại TRƯỚC KHI báo hoàn thành. File này (`plan.md`) chỉ còn giữ **thiết kế nội dung**
> (đề cương, tech stack, đề bài) và các quyết định **đặc thù riêng từng series**.

---

## 📈 Progress & Status (Cập nhật 2026-07-03)

| Series                           | Tên                                     | Bài hoàn thành | Tổng bài | %           |
| -------------------------------- | --------------------------------------- | -------------- | -------- | ----------- |
| 🎉 **Series 2: WebGPU**          | **Đồ họa 3D & Compute Shader**          | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 6: CSS & Animation** | **Hiệu ứng & Bố cục Web hiện đại**      | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 3: DSA Trực Quan**   | **Cấu Trúc Dữ Liệu & Giải Thuật**       | **12/12**      | **12**   | **100%** ✅ |
| Series 1                         | WebAssembly & Rust                      | 0/10           | 10       | 0%          |
| Series 4                         | WebRTC & WebSocket                      | 0/8            | 8        | 0%          |
| Series 5                         | Toy JS Engine (Trình thông dịch JS)     | 0/?            | TBD      | 0%          |
| 🎉 **Series 7: SQL**             | **SQL trong Trình duyệt (SQLite-WASM)** | **17/17**      | **17**   | **100%** ✅ |
| 🎉 **Series 8: Web Audio**       | **Âm Thanh & Visualizer**               | **8/8**        | **8**    | **100%** ✅ |
| 🎉 **Series 9: Git**             | **Mô Hình & Quy Trình Làm Việc**        | **13/13**      | **13**   | **100%** ✅ |
| 🎉 **Series 10: Điện Tử**        | **Điện Tử & Mô Phỏng Vi Mạch**          | **16/16**      | **16**   | **100%** ✅ |
| 🎉 **Series 11: VLSI**           | **Thiết Kế Vi Mạch Số & FPGA (VLSI)**   | **14/14**      | **14**   | **100%** ✅ |
| 🎉 **Series 12: AI**             | **Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM** | **19/19**      | **19**   | **100%** ✅ |
| Series 13                        | Hệ Thống Nhúng: Từ Thanh Ghi Đến RTOS   | 16/16          | 16       | 100%        |
| Series 14                        | Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ       | 4/15           | 15       | 27%         |

> **2026-07-06:** Đã gỡ phần thiết kế chi tiết (tech stack, đề cương, syllabus H2) của các
> series **100% hoàn thành** (2 WebGPU, 3 DSA, 6 CSS, 7 SQL, 8 Web Audio, 9 Git, 10 Điện Tử) khỏi file
> này để giảm context — nội dung đã publish rồi thì trang hub/bài viết thật (`blog/<series>/`)
> mới là nguồn chính xác, không phải bản thiết kế. Bản đầy đủ vẫn còn nguyên trong lịch sử
> git (`git log -- plan.md`, commit trước 2026-07-06) nếu cần tham chiếu lại.
>
> **2026-07-09:** Đã gỡ tương tự phần thiết kế chi tiết của **Series 11 (VLSI)** sau khi hoàn thành
> 14/14 (100%) — bản đầy đủ vẫn còn trong lịch sử git trước commit này nếu cần tham chiếu lại.
>
> **2026-07-15:** Đã gỡ tương tự phần thiết kế chi tiết của **Series 12 (Trí Tuệ Nhân Tạo)** sau khi
> hoàn thành 19/19 (100%) — bản đầy đủ vẫn còn trong lịch sử git trước commit này nếu cần tham chiếu lại.

---

## 🛠 Series 1: WebAssembly & Rust (Hiệu năng Native trong Trình duyệt)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** Rust (phiên bản ổn định mới nhất), JavaScript (ES6+).
- **Công cụ biên dịch:** `wasm-pack` (biên dịch Rust sang Wasm và sinh các binding glue code JS), `wasm-opt` (tối ưu hóa nhị phân).
- **API Trình duyệt:** Web Assembly System Interface (WASI), `SharedArrayBuffer` (chia sẻ bộ nhớ), `Web Workers` (xử lý đa luồng), `ImageData` (Canvas 2D).

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Wasm Image Processing & SIMD Lab"**
- **Mô tả giao diện:**
  - Nửa bên trái: Khung tải ảnh lên (Drag & Drop) và thanh trượt cấu hình bộ lọc (độ mờ Gauss, ngưỡng lọc cạnh, độ tương phản).
  - Nửa bên phải: Canvas hiển thị ảnh kết quả.
  - Phía dưới: Bảng thông số **Benchmark thời gian thực** so sánh tốc độ xử lý:
    1. JavaScript thuần (Vòng lặp Canvas Pixel đơn luồng).
    2. Wasm thuần (Rust biên dịch không tối ưu).
    3. Wasm SIMD (Sử dụng chỉ lệnh vector song song).
    4. Wasm Multi-threaded (Sử dụng 4 Web Workers làm việc song song qua bộ nhớ chia sẻ).
  - Biểu đồ cột động so sánh thời gian thực thi tính bằng mili-giây (ms).

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                              | Nội dung CS chuyên sâu                                                                                                                        | Dự án/Demo đi kèm                                                                 |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **Biên dịch AOT & Stack Machine**        | Phân tích cấu trúc file `.wasm`, cách Wasm Stack Machine thực thi lệnh so với thanh ghi (Registers).                                          | Hello World Wasm, hiển thị cấu trúc file `.wasm` dưới dạng văn bản (WAT).         |
| 2   | **Linear Memory & Zero-Copy**            | Quản lý bộ nhớ thủ công trong Rust, cách chuyển con trỏ qua lại thông qua `ArrayBuffer` để tránh overhead sao chép dữ liệu.                   | Bộ chia sẻ mảng số thực lớn giữa JS và Rust Wasm.                                 |
| 3   | **Tối ưu Pixel Manipulation**            | Flatten mảng 2D ảnh RGBA, tối ưu Cache Locality khi duyệt điểm ảnh.                                                                           | Bộ lọc màu ảnh (Sepia, Grayscale, Invert) chạy bằng Rust.                         |
| 4   | **Wasm SIMD 128-bit Vector**             | Chỉ lệnh vector hóa, cách xử lý song song 4 kênh màu RGBA của điểm ảnh trong 1 chu kỳ CPU.                                                    | Bộ lọc mờ Gaussian Blur tối ưu hóa bằng SIMD, đo FPS thực tế.                     |
| 5   | **Đa luồng trên Trình duyệt**            | Khái niệm điều phối đa luồng, loại trừ tranh chấp (Race Condition) bằng `Atomics.wait` và `Atomics.notify`.                                   | Trình vẽ Mandelbrot Fractal đa luồng sử dụng `wasm-bindgen-rayon`.                |
| 6   | **C/C++ Static Linking & Emscripten**    | Biên dịch chéo (Cross-compilation) thư viện C/C++, gọi API C qua ccall/cwrap.                                                                 | Tích hợp bộ giải mã ảnh JPEG gốc (libjpeg) để nén ảnh trực tiếp.                  |
| 7   | **WasmGC & Garbage Collected Languages** | Phân biệt Linear Memory và Managed Objects, cách trình duyệt hỗ trợ thu hồi rác trực tiếp cho Wasm.                                           | Demo hiệu năng so sánh bundle size và RAM sử dụng giữa Rust và Go (TinyGo).       |
| 8   | **Sandboxing & Memory Safety**           | Mô hình thực thi cô lập của Wasm, cách bảo vệ chống tràn bộ đệm (Buffer Overflow) nhưng vẫn tồn tại nguy cơ rò rỉ dữ liệu trong bộ nhớ phẳng. | Demo mô phỏng tấn công thay đổi biến bộ nhớ phẳng và cách viết code Rust an toàn. |
| 9   | **Tối ưu hóa dung lượng Wasm**           | Kỹ thuật `wasm-opt`, loại bỏ panic formatting để giảm thiểu bundle từ MB xuống dưới 100KB.                                                    | Bảng đo lường dung lượng tải và thời gian parse của trình duyệt.                  |
| 10  | **Dự án: Wasm Image Optimizer**          | Tích hợp tổng thể các kỹ thuật đa luồng, SIMD và các bộ codec nén ảnh bằng Rust.                                                              | Công cụ tối ưu ảnh tốc độ cực cao, xuất định dạng WebP/JPEG ngay trên client.     |

---

## 🌐 Series 4: WebRTC & WebSocket (Giao thức mạng & Real-Time Web)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Phía Client:** WebRTC API (`RTCPeerConnection`, `RTCDataChannel`), WebSockets API.
- **Phía Server:** Node.js / Deno, thư viện kết nối thô để giảng dạy, máy chủ STUN/TURN công cộng của Google/Xirsys.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "P2P Network & Real-Time Sync Dashboard"**
- **Mô tả giao diện:**
  - Phần 1: Bảng điều khiển kết nối P2P hiển thị trạng thái bắt tay (Signaling state): Offer -> Answer -> ICE Gathering -> Connected.
  - Phần 2: Khung chat và vẽ bảng trắng (Whiteboard) tương tác. Khi người dùng vẽ ở tab A, nét vẽ lập tức xuất hiện ở tab B qua WebRTC Data Channel.
  - Phần 3: Biểu đồ giám sát trễ mạng (Ping/Latency) và băng thông thực tế (throughput) so sánh giữa việc gửi qua Server trung gian (WebSocket) và gửi trực tiếp (WebRTC).

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                      | Nội dung CS chuyên sâu                                                                                 | Dự án/Demo đi kèm                                                          |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1   | **Bản chất WebSocket Giao thức** | Cấu trúc khung truyền dữ liệu WebSocket (Opcode, Masking, Payload Length), duy trì kết nối TCP.        | Máy chủ WebSocket Node.js viết chay không dùng thư viện ngoài.             |
| 2   | **WebRTC Handshake & SDP**       | Giao thức mô tả phiên SDP, quy trình trao đổi Offer/Answer, thu thập ICE Candidates.                   | Demo bắt tay kết nối WebRTC thủ công qua copy-paste chuỗi ký tự.           |
| 3   | **STUN/TURN & NAT Traversal**    | Các loại NAT khác nhau (Symmetric, Cone NAT) ảnh hưởng như thế nào đến khả năng kết nối P2P trực tiếp. | Thiết lập kết nối vượt tường lửa sử dụng cấu hình STUN/TURN.               |
| 4   | **RTC Media Streams**            | Codec nén video/audio, điều chỉnh tốc độ bit thích ứng (Adaptive Bitrate) theo băng thông mạng.        | Ứng dụng gọi điện video nhóm nhỏ trực tiếp trên trình duyệt.               |
| 5   | **RTC Data Channel P2P**         | Giao thức SCTP chạy trên UDP. Cấu hình gửi tin cậy/không tin cậy để tối ưu tốc độ.                     | Công cụ chuyển tệp tin ngang hàng dung lượng lớn (P2P File Share).         |
| 6   | **Multiplayer State Sync**       | Kỹ thuật bù trễ mạng: Client-Side Prediction, Server Reconciliation, Interpolation.                    | Game bắn bóng 2D real-time chơi nhiều người trơn tru bất chấp độ trễ mạng. |
| 7   | **High Performance Server**      | Quản lý vòng đời kết nối, quản lý luồng dữ liệu truyền phát (Broadcasting) hiệu năng cao.              | Viết Signaling Server bằng Go/Rust chịu tải hàng vạn kết nối đồng thời.    |
| 8   | **Dự án: WebRTC ColorQuarium**   | Kết hợp điều khiển Data Channel P2P để biến điện thoại thành tay cầm chơi game phản hồi dưới 10ms.     | Phiên bản ColorQuarium siêu phản hồi không có độ trễ qua WebRTC.           |

---

## ⚙️ Series 5: Toy JS Engine (Tự viết Trình thông dịch JavaScript đơn giản)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** Pure JavaScript (ES6) để người học có thể chạy trực tiếp trên trình duyệt mà không cần cài đặt node_modules.
- **Giao diện:** HTML5 Canvas để vẽ sơ đồ bộ nhớ Heap/Stack.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "JS Engine Visualizer & Memory Inspector"**
- **Mô tả giao diện:**
  - Bên trái: Trình soạn thảo mã nguồn JavaScript đơn giản (hỗ trợ khai báo biến, hàm, vòng lặp, closure).
  - Bên phải: Mô phỏng Runtime của Engine:
    - **Call Stack:** Hiển thị danh sách các Execution Context chồng lên nhau. Khi gọi hàm sẽ đẩy context mới lên, khi kết thúc hàm sẽ pop ra ngoài.
    - **Scope Chain:** Hiển thị các biến khả dụng trong context hiện tại và mối liên kết lên Global scope.
    - **Heap Memory:** Hiển thị danh sách các ô nhớ đối tượng.
  - Phía dưới: Nút điều khiển thực thi từng bước (Step Into, Step Over) kèm bảng mô tả tác vụ hiện tại (ví dụ: _"Đang phân tích token 'let' -> tạo biến X trong Scope hiện tại"_).

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                      | Nội dung CS chuyên sâu                                                                                    | Dự án/Demo đi kèm                                                           |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | **Lexical Analysis & Tokenizer** | Máy trạng thái hữu hạn (FSM) phân tích chuỗi văn bản mã nguồn thành danh sách các Tokens phân loại.       | Trình tách từ vựng viết bằng JS phân tích mã nguồn thời gian thực.          |
| 2   | **Abstract Syntax Tree Parser**  | Ngữ pháp phi ngữ cảnh (CFG), xây dựng cây cú pháp trừu tượng AST biểu diễn cấu trúc mã nguồn.             | Trình chuyển đổi mã nguồn thành cây AST trực quan bằng JSON.                |
| 3   | **Interpreter Environment**      | Cơ chế định giá (Evaluate) các nút AST, quản lý bộ lưu trữ giá trị biến (Environment Record).             | Bộ thông dịch chạy được các phép tính toán và khai báo biến cơ bản.         |
| 4   | **Control Flow Branches**        | Cách bẻ hướng thực thi của Interpreter dựa trên kết quả biểu thức logic (If-Else, While).                 | Bộ thông dịch chạy được các vòng lặp tính toán thuật toán cơ bản.           |
| 5   | **Functions & Call Stack**       | Thiết kế Call Stack, khởi tạo Activation Record / Execution Context khi hàm được gọi.                     | Bộ thông dịch hỗ trợ khai báo hàm và gọi đệ quy hàm.                        |
| 6   | **Scope Chain & Closures**       | Liên kết môi trường tĩnh (Lexical Environment), cơ chế giữ lại biến môi trường cha của hàm con (Closure). | Thực thi thành công cơ chế Closure và in ra giá trị biến được đóng gói.     |
| 7   | **Call Stack & Heap Visualizer** | Trực quan hóa cấu trúc dữ liệu Stack (ngăn xếp) và Heap (bộ nhớ phân bổ tự do) của JS Runtime.            | Trình gỡ lỗi (Debugger) chạy từng bước dòng code và vẽ bộ nhớ động.         |
| 8   | **Dự án: Garbage Collector**     | Thuật toán Mark-and-Sweep: tìm kiếm các tham chiếu chết từ Global root và thu hồi ô nhớ Heap.             | Trình vẽ bộ nhớ Heap hiển thị cơ chế dọn rác dọn dẹp các ô nhớ rác tự động. |

---

## 🔌 Series 13: Hệ Thống Nhúng (Embedded Systems — Từ Thanh Ghi Đến RTOS)

> Nội dung 100% tiếng Việt (chuẩn từ series DSA trở đi). Thiết kế theo skill
> `design-new-series`, duyệt từng bước — cập nhật 2026-07-11.

### 0. Danh tính series

| Trường           | Giá trị                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Tên series       | Hệ Thống Nhúng: Từ Thanh Ghi Đến RTOS                                                              |
| Folder slug      | `embedded/`                                                                                        |
| Trang hub        | `embedded-programming-series.html`                                                                 |
| Slug bài học     | `embedded-<topic>.html`                                                                            |
| Tag class        | `--embedded` (thêm `.blog-card__tag--embedded` + `.article-hero__tag--embedded`)                   |
| Màu accent       | `#14b8a6` (teal)                                                                                   |
| Prism            | `c` (có sẵn). Assembly ARM: dùng code block thường, KHÔNG thêm grammar mới                         |
| Tiên quyết ngoài | Series C (con trỏ, bộ nhớ, struct), Series 10 Điện Tử (GPIO, logic số, thanh ghi MCU mức nhập môn) |

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ giảng dạy chính: C** (Prism `c`) — mọi khái niệm firmware trình bày bằng C
  chuẩn bare-metal (truy cập thanh ghi qua con trỏ `volatile`, CMSIS-style). Demo tương
  tác chạy bằng **JavaScript thuần** trên "MCU ảo" (xem VMCU bên dưới) — người học ĐỌC C
  thật, BẤM demo JS; mỗi demo có tab `.code-tabs` đối chiếu C ↔ JS 1-1 (đúng tiền lệ
  AI series: NeuroJS chạy trong trang + snippet PyTorch đối chiếu).
- **VMCU — MCU ảo tự xây xuyên suốt series** (`blog/embedded/vmcu.js`, vanilla JS, có
  self-test chạy bằng `node vmcu.js` đúng tiền lệ `ai-neuro.js`): mô hình hoá một
  Cortex-M0 giản lược ở mức **thanh ghi ngoại vi** (không mô phỏng ISA từng lệnh):
  memory map (Flash/SRAM/Peripheral), GPIO 2 port, SysTick, 1 timer đa năng (prescaler,
  auto-reload, PWM), UART (TX/RX ring buffer), ADC 10-bit, NVIC giản lược (priority,
  pending, preemption), và từ nửa sau series: bộ lập lịch mini-RTOS (context switch mô
  phỏng, task states). Mỗi bài chỉ MỞ RỘNG VMCU đúng phần bài đó dạy — có bảng "VMCU
  build-out theo bài" trong đề cương.
- **Hiển thị:** HTML5 Canvas (bảng mạch ảo, timing diagram, sơ đồ ngắt), KaTeX local
  (công thức prescaler, baud rate, quantization ADC — chỉ nạp ở bài có công thức),
  Web Audio API (buzzer PWM phát tiếng thật ở demo timer — điểm "cảm nhận được").
- **Không cần thêm ngôn ngữ Prism** — `c` đã có; vài đoạn assembly ARM (bài boot/ngắt
  nâng cao) hiển thị bằng code block thường không tô màu.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Bảng Mạch Ảo — VMCU Playground"** (hạng mục dựng NẶNG NHẤT của series)
- **Insight cần "cảm nhận được":** memory-mapped I/O — ghi 1 bit vào một ô nhớ và thấy
  LED sáng NGAY trên bảng mạch; và ngắt (interrupt) — dòng thời gian cho thấy ISR chen
  ngang main loop, lồng nhau theo priority, đúng thứ tự pending → active → return.
- **Bố cục giao diện:**
  - **Trái — bảng mạch ảo (Canvas):** 8 LED nối port A, 2 nút nhấn (một nút có mạch
    chống dội, một nút KHÔNG — để dạy debounce), biến trở nối ADC, buzzer nối kênh PWM,
    màn hình UART terminal nhỏ. Linh kiện sáng/tắt/kêu theo trạng thái thanh ghi thật.
  - **Phải trên — Register Inspector:** bảng thanh ghi ngoại vi (GPIOA_ODR, TIM1_PSC,
    TIM1_ARR, UART_DR, NVIC_ISER…) hiển thị hex + nhị phân từng bit, bit nào vừa đổi
    thì nhấp nháy; người học có thể GÕ TAY giá trị hex vào thanh ghi để bật LED — trước
    cả khi học vòng lặp firmware.
  - **Phải dưới — Timeline ngắt:** dải thời gian cuộn ngang vẽ main loop / ISR nào đang
    chạy, đánh dấu thời điểm pending, preemption giữa 2 mức priority.
  - **Dưới — điều khiển:** Run / Pause / Step-tick (chạy từng tick SysTick), thanh kéo
    tốc độ mô phỏng, nút nạp firmware mẫu của từng bài.
- **Tái sử dụng theo bài:** playground nhúng lại trong từng bài học ở dạng thu gọn
  (chỉ bật phần ngoại vi bài đó dạy), cùng một engine `vmcu.js` — không fork code.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus — 16 bài)

**Chặng 1 — Nền tảng bare-metal (Bài 1–5):**

| Bài | Tên bài học                                        | Nội dung CS chuyên sâu                                                                                                                                                | Dự án/Demo đi kèm · VMCU build-out                                                                                      |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | **Hệ nhúng là gì & giải phẫu một MCU**             | MCU vs MPU vs SoC; Von Neumann vs Harvard; memory map Flash/SRAM/ngoại vi; toolchain thật (cross-compile, linker, flash) ở mức khái niệm; ràng buộc RAM/pin/realtime. | Tour Bảng Mạch Ảo + Memory Map Explorer (click từng vùng nhớ xem vai trò). VMCU: khung memory map + bus đọc/ghi.        |
| 2   | **Thanh ghi & Memory-Mapped I/O**                  | Con trỏ `volatile`, vì sao compiler tối ưu phá code thiếu volatile; đọc-sửa-ghi (RMW); bit masking set/clear/toggle; pitfall: RMW không nguyên tử.                    | Gõ hex vào Register Inspector → LED sáng tức thì; bit-field playground. VMCU: GPIO output (ODR/MODER).                  |
| 3   | **GPIO input: pull-up/down & đọc nút nhấn**        | Chế độ input, điện trở kéo (nối Series 10), active-low vs active-high, polling; pitfall: chân floating đọc giá trị ngẫu nhiên.                                        | Nút nhấn bảng ảo — tắt pull-up thấy giá trị nhiễu loạn thật; bảng ❌/✅ cấu hình. VMCU: GPIO input + pull config.       |
| 4   | **SysTick & thời gian: thoát khỏi delay blocking** | Busy-wait delay tại sao xấu; SysTick, tick counter, `millis()`; pattern non-blocking "kiểm tra elapsed"; pitfall: tràn tick counter (bug 49 ngày có thật).            | 2 LED nhấp nháy chu kỳ khác nhau không blocking; thí nghiệm delay làm hụt sự kiện nút. VMCU: SysTick.                   |
| 5   | **Chống dội phím & Máy trạng thái (FSM)**          | Bounce vật lý (nhìn dạng sóng); debounce delay (xấu) vs sampling theo tick vs FSM; thiết kế FSM firmware chuẩn (enum state + switch); event vs polling.               | Đếm nhấn nút có/không debounce chạy song song; oscilloscope view của bounce; FSM diagram động. VMCU: (dùng phần đã có). |

**Chặng 2 — Ngoại vi (Bài 6–11):**

| Bài | Tên bài học                                             | Nội dung CS chuyên sâu                                                                                                                                                                      | Dự án/Demo đi kèm · VMCU build-out                                                                                           |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 6   | **Timer đa năng & PWM**                                 | Prescaler/auto-reload, công thức tần số $f = f_{clk}/((PSC+1)(ARR+1))$; duty cycle; PWM điều khiển độ sáng & âm thanh; pitfall: chọn PSC/ARR gây tràn hoặc mất độ phân giải.                | Kéo PSC/ARR nghe buzzer đổi cao độ THẬT (Web Audio), LED mờ dần theo duty; công thức KaTeX cập nhật số live. VMCU: TIM1+PWM. |
| 7   | **Ngắt (Interrupt) & NVIC**                             | Polling vs interrupt; vector table; ISR; NVIC priority, pending, preemption; quy tắc "ISR càng ngắn càng tốt"; pitfall: quên clear pending flag → ISR lặp vô hạn.                           | Timeline ngắt: EXTI nút nhấn chen main loop; thí nghiệm polling hụt sự kiện vs ngắt không hụt. VMCU: NVIC + EXTI.            |
| 8   | **Chia sẻ dữ liệu ISR ↔ main: race & critical section** | Race condition thật khi ISR và main cùng sửa biến; volatile KHÔNG đủ cho RMW; critical section (tắt ngắt ngắn); ring buffer SPSC không cần khoá; pitfall: đọc cặp biến liên quan bị xé đôi. | Demo race: counter sai số thấy được, bật critical section → đúng; ring buffer visualizer. VMCU: (dùng NVIC đã có).           |
| 9   | **UART & giao tiếp nối tiếp**                           | Khung UART (start/data/parity/stop), công thức baud rate & sai số %; TX/RX bằng ngắt + ring buffer (áp dụng Bài 8); giao thức dòng lệnh đơn giản; pitfall: baud lệch >2%.                   | UART terminal trên bảng ảo — gõ lệnh bật/tắt LED; waveform explorer từng bit của khung truyền. VMCU: UART.                   |
| 10  | **ADC & thế giới tương tự**                             | Sample & hold; độ phân giải, LSB, công thức lượng tử hoá (mở cửa sang Series 14); oversampling & trung bình trượt; pitfall: đọc ADC trong ISR dài, nguồn nhiễu.                             | Xoay biến trở → đồ thị ADC thô vs trung bình trượt; chỉnh số bit thấy bậc thang lượng tử. VMCU: ADC 10-bit.                  |
| 11  | **DMA: chuyển dữ liệu không cần CPU**                   | DMA controller là gì; UART/ADC + DMA; ping-pong (double) buffer; pitfall: đọc buffer đang được DMA ghi dở.                                                                                  | Đồng hồ CPU-load ảo so sánh ADC polling vs ngắt vs DMA; ping-pong buffer visualizer. VMCU: DMA giản lược.                    |

**Chặng 3 — Hệ thống & RTOS (Bài 12–16):**

| Bài | Tên bài học                                                    | Nội dung CS chuyên sâu                                                                                                                                                                                         | Dự án/Demo đi kèm · VMCU build-out                                                                                |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 12  | **Boot & bản đồ bộ nhớ chương trình**                          | Điều gì xảy ra trước `main()`: vector table → reset handler → copy `.data`, zero `.bss`; `.text/.rodata/.data/.bss/stack/heap`; vì sao firmware ngại `malloc`; pitfall: stack overflow ăn mòn dữ liệu âm thầm. | Memory layout visualizer: khai báo biến các kiểu xem rơi vào section nào; mô phỏng stack overflow đâm vào `.bss`. |
| 13  | **Super-loop vs Cooperative Scheduler**                        | Giới hạn của super-loop + FSM khi task nhiều; cooperative scheduler (task tự nhường CPU); jitter; pitfall: một task "tham" block toàn hệ.                                                                      | Mini scheduler 3 task; một task tham lam làm LED khựng thấy rõ trên timeline. VMCU: scheduler hợp tác.            |
| 14  | **RTOS preemptive: context switch & task states**              | Context switch lưu/khôi phục thanh ghi + stack RIÊNG từng task (cần Bài 12); Ready/Running/Blocked; preemption theo priority; time slice; pitfall: starvation task ưu tiên thấp.                               | Visualizer task states + stack từng task; kéo priority thấy preemption tức thì trên timeline. VMCU: mini-RTOS.    |
| 15  | **Đồng bộ RTOS: mutex, semaphore, queue & priority inversion** | Semaphore vs mutex; queue ISR→task; deadlock 4 điều kiện; **priority inversion & câu chuyện Mars Pathfinder** + priority inheritance.                                                                          | Tái hiện sự cố Mars Pathfinder bằng 3 task; bật priority inheritance để "cứu tàu". VMCU: mutex/semaphore/queue.   |
| 16  | **Capstone: Trạm đo nhiệt độ hoàn chỉnh**                      | Ghép toàn bộ: ADC+DMA đọc cảm biến, lọc trung bình, FSM giao diện nút nhấn, UART báo cáo, PWM cảnh báo — chạy trên mini-RTOS; đo CPU load; khái niệm low-power idle.                                           | Hệ thống hoàn chỉnh chạy trên Bảng Mạch Ảo — dự án tổng kết toàn series.                                          |

---

## 📡 Series 14: Xử Lý Tín Hiệu Số (DSP — Từ Mẫu Đến Phổ)

> Nội dung 100% tiếng Việt. Thiết kế theo skill `design-new-series`, duyệt từng bước —
> cập nhật 2026-07-11.

### 0. Danh tính series

| Trường           | Giá trị                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tên series       | Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ                                                                                                                                               |
| Folder slug      | `dsp/`                                                                                                                                                                          |
| Trang hub        | `dsp-programming-series.html`                                                                                                                                                   |
| Slug bài học     | `dsp-<topic>.html`                                                                                                                                                              |
| Tag class        | `--dsp` (thêm `.blog-card__tag--dsp` + `.article-hero__tag--dsp`)                                                                                                               |
| Màu accent       | `#0ea5e9` (sky blue)                                                                                                                                                            |
| Prism            | `javascript`, `python`, `c` — TẤT CẢ đã có sẵn, không cần thêm                                                                                                                  |
| Tiên quyết ngoài | Series 8 Web Audio (AudioContext, nghe/đo thực hành), Series 10 Điện Tử (mạch lọc analog RC — đối chiếu analog↔digital), Series 13 Nhúng (chỉ bài cuối — chạy filter trên VMCU) |

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** JavaScript thuần (mọi thuật toán DSP TỰ VIẾT — không dùng
  `AnalyserNode` làm hộp đen; AnalyserNode chỉ xuất hiện 1 lần để đối chiếu kết quả
  FFT tự viết). Snippet đối chiếu công nghiệp mỗi bài: **Python/NumPy/SciPy**
  (`scipy.signal`) và ở các bài filter: **C/CMSIS-DSP** (nối sang series Nhúng).
- **DSPJS — thư viện mini tự xây xuyên suốt** (`blog/dsp/dsp-core.js`, có self-test
  Node với các con số verified — đúng kỷ luật "verify trước khi viết prose" của series
  AI): bộ sinh tín hiệu (sine/square/chirp/noise), tích chập, DFT ngây thơ → FFT
  radix-2 (đối chiếu kết quả 2 cái phải trùng), cửa sổ (rect/Hann/Hamming/Blackman),
  thiết kế FIR windowed-sinc, IIR biquad (Direct Form II Transposed), tiện ích
  z-plane (pole/zero → đáp ứng tần số), STFT/spectrogram, resampling.
- **Âm thanh thật:** Web Audio API — nguồn (oscillator, file mẫu vendored, micro nếu
  người dùng cho phép — luôn có fallback không cần mic), **AudioWorklet** cho filter
  chạy realtime (file module JS tĩnh riêng, không cần build — đã kiểm chứng chạy được
  trên static hosting). Mọi demo có nút A/B bypass để NGHE trước/sau xử lý.
- **Hiển thị:** Canvas 2D (waveform, phổ biên độ/pha, spectrogram cuộn, mặt phẳng z,
  sơ đồ butterfly FFT). KaTeX local — series này nặng công thức nhất sau AI, nạp ở
  hầu hết các bài; giữ quy tắc `\text{}` chỉ chứa ASCII (bug diacritics đã biết).

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Pole–Zero Filter Lab — thiết kế filter bằng tay, nghe bằng tai"**
  (hạng mục dựng NẶNG NHẤT của series)
- **Insight cần "cảm nhận được":** vị trí pole/zero trên mặt phẳng z KHÔNG phải toán
  trừu tượng — kéo một pole lại gần vòng tròn đơn vị và NGHE tiếng cộng hưởng rít lên
  trên nhạc thật; kéo zero lên vòng tròn đơn vị và NGHE đúng một tần số bị khoét mất
  (notch). Toán ↔ đồ thị ↔ âm thanh cập nhật đồng thời dưới 16ms.
- **Bố cục giao diện:**
  - **Trái — mặt phẳng z (Canvas):** vòng tròn đơn vị, kéo-thả pole (×) và zero (○),
    tự động thêm liên hợp phức đối xứng; cảnh báo đỏ khi pole ra ngoài vòng tròn
    (mất ổn định — cho phép làm thử để NGHE filter nổ, kèm auto-mute bảo vệ tai).
  - **Phải trên — đáp ứng tần số:** đồ thị |H(e^jω)| dB + pha, trục tần số Hz thật
    theo sample rate; đường dọc đánh dấu tần số pole/zero đang kéo.
  - **Phải dưới — đáp ứng xung h[n]:** stem plot cập nhật realtime.
  - **Dưới — dàn âm thanh:** chọn nguồn (nhạc mẫu vendored / oscillator quét / mic),
    nút A/B bypass, spectrogram cuộn của đầu ra, xuất hệ số b/a để dùng lại trong bài.
- **Tái sử dụng theo bài:** engine z-plane + đáp ứng tần số dùng lại ở các bài FIR,
  IIR, biquad; các bài đầu series dùng các demo nhỏ riêng (aliasing stroboscope,
  convolution từng bước, FFT butterfly) — tất cả cùng import `dsp-core.js`.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus — 15 bài)

**Chặng 1 — Tín hiệu & nền tảng (Bài 1–4):**

| Bài | Tên bài học                            | Nội dung CS chuyên sâu                                                                                                                                                                         | Dự án/Demo đi kèm · DSPJS build-out                                                                                             |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Tín hiệu là gì: từ liên tục đến số** | Phân loại tín hiệu; $x(t)$ vs $x[n]$; các tín hiệu cơ bản (xung đơn vị, bậc thang, sine, chirp, nhiễu trắng); năng lượng vs công suất; chu kỳ trong miền rời rạc.                              | Signal Generator Playground: chọn/ghép tín hiệu, vẽ + NGHE ngay. DSPJS: bộ sinh tín hiệu.                                       |
| 2   | **Lấy mẫu, Nyquist & Aliasing**        | Định lý lấy mẫu Nyquist–Shannon (trực giác + toán vừa đủ); phổ gương, tần số gập (folding); aliasing đời thực (bánh xe quay ngược, moiré); anti-alias filter analog trước ADC (nối Series 10). | Aliasing Stroboscope: kéo tần số qua Nyquist THẤY + NGHE alias gập xuống; ảnh moiré khi downsample thiếu filter.                |
| 3   | **Lượng tử hoá & dải động**            | Bit depth, LSB, sai số lượng tử; quy tắc ~6 dB/bit; SNR; dithering (khái niệm); nối bài ADC Series 13.                                                                                         | Kéo bit depth 16→8→4→2 nghe nhạc vỡ dần; histogram sai số + SNR đo thật so công thức. DSPJS: quantize.                          |
| 4   | **Hệ LTI, tích chập & đáp ứng xung**   | Tuyến tính + bất biến thời gian; tích chập $y[n]=x[n]*h[n]$; đáp ứng xung đặc trưng hoá trọn vẹn hệ LTI; ghép nối tiếp/song song.                                                              | Convolution từng bước (lật-dịch-nhân-cộng animation); reverb bằng tích chập đáp ứng xung phòng thật lên giọng nói. DSPJS: conv. |

**Chặng 2 — Miền tần số (Bài 5–8):**

| Bài | Tên bài học                           | Nội dung CS chuyên sâu                                                                                                                                      | Dự án/Demo đi kèm · DSPJS build-out                                                                               |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 5   | **DFT: cửa sổ nhìn sang miền tần số** | DFT như phép "so khớp" với từng sinusoid; công thức, bins, độ phân giải $f_s/N$; phổ biên độ & pha; đối xứng liên hợp của tín hiệu thực; tự viết DFT O(N²). | DFT Explorer: vẽ tín hiệu tuỳ ý → phổ; click 1 bin thấy đúng sinusoid nó đại diện. DSPJS: dft.                    |
| 6   | **FFT: thuật toán thay đổi thế giới** | Radix-2 decimation-in-time; butterfly; bit-reversal; O(N log N); verify FFT ≡ DFT từng số; benchmark tốc độ thật trên máy người đọc.                        | Butterfly diagram tương tác từng stage; đồng hồ benchmark DFT vs FFT khi N tăng. DSPJS: fft (radix-2).            |
| 7   | **Rò rỉ phổ & hàm cửa sổ**            | Vì sao chu kỳ không nguyên trong khung gây leakage; cửa sổ rect/Hann/Hamming/Blackman; trade-off main-lobe vs side-lobe; chọn cửa sổ theo bài toán.         | Hai tone sát nhau: đổi cửa sổ thấy tách được/không; bảng so sánh cửa sổ tương tác. DSPJS: windows.                |
| 8   | **STFT & Spectrogram**                | Đánh đổi thời gian–tần số (nguyên lý bất định); khung chồng lấp, hop size; vẽ spectrogram; đọc-hiểu vệt phổ giọng nói/nhạc cụ.                              | Spectrogram realtime từ mic/file — huýt sáo thấy vệt của chính mình; kéo window size thấy trade-off. DSPJS: stft. |

**Chặng 3 — Filter & đa tốc độ (Bài 9–12):**

| Bài | Tên bài học                                           | Nội dung CS chuyên sâu                                                                                                                                                                                          | Dự án/Demo đi kèm · DSPJS build-out                                                                                |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 9   | **Filter FIR: từ trung bình trượt đến windowed-sinc** | FIR = tích chập với h[n] hữu hạn; moving average là low-pass "tồi"; sinc lý tưởng → cắt bằng cửa sổ (Bài 7); linear phase — món quà của FIR đối xứng; chọn số tap.                                              | FIR Designer: kéo cutoff & số tap, thấy h[n] + đáp ứng tần số + NGHE trên nhạc. DSPJS: thiết kế FIR windowed-sinc. |
| 10  | **Z-transform & mặt phẳng z**                         | Z-transform khái quát hoá DTFT; hàm truyền $H(z)$; pole/zero; ổn định ⟺ pole trong vòng tròn đơn vị; đọc đáp ứng tần số từ hình học pole/zero.                                                                  | **Ra mắt flagship: Pole–Zero Filter Lab** — kéo pole/zero, nghe filter đổi tính cách tức thì. DSPJS: zplane utils. |
| 11  | **Filter IIR & Biquad**                               | IIR đệ quy — hiệu quả gấp bội FIR nhưng mất linear phase; biquad Direct Form II Transposed; RBJ cookbook (lowpass/highpass/peak/notch/shelf); bilinear transform (khái niệm); pitfall: nổ số học khi hệ số sai. | Biquad Cookbook Playground: kéo $f_0$/Q/gain nghe realtime qua AudioWorklet; bảng FIR vs IIR. DSPJS: biquad DF2T.  |
| 12  | **Resampling & xử lý đa tốc độ**                      | Decimation (PHẢI lọc trước — nối Bài 2), interpolation (zero-stuffing + lọc), đổi 48k↔44.1k tỉ lệ hữu tỉ, polyphase (khái niệm tiết kiệm phép nhân).                                                            | Resampler A/B: nghe artifacts khi bỏ filter chống alias vs đúng chuẩn; sơ đồ polyphase. DSPJS: resample.           |

**Chặng 4 — Thực chiến & capstone (Bài 13–15):**

| Bài | Tên bài học                                   | Nội dung CS chuyên sâu                                                                                                                                                | Dự án/Demo đi kèm · DSPJS build-out                                                                               |
| --- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 13  | **Phát hiện cao độ: autocorrelation & tuner** | Vì sao "đỉnh FFT to nhất" KHÔNG phải pitch (họa âm); autocorrelation; ý tưởng YIN; tinh chỉnh dưới-bin bằng nội suy parabol; giới hạn thời gian thực.                 | **Guitar/Voice Tuner chạy bằng mic thật** — hát/gảy đàn thấy nốt + cent lệch. DSPJS: autocorr + parabolic refine. |
| 14  | **DSP thời gian thực & trên phần cứng nhúng** | Block processing vs từng mẫu; latency budget; số học fixed-point Q15 (mô phỏng) vs float; CMSIS-DSP đối chiếu; chạy biquad trên VMCU Series 13 (cross-over 2 series). | Biquad Q15 vs float: nghe + đo sai số; đồng hồ "CPU cycles" ảo trên VMCU. DSPJS: q15 sim.                         |
| 15  | **Capstone: Trạm Âm Thanh DSP hoàn chỉnh**    | Ghép toàn bộ: EQ 5 băng (biquad cascade) + spectrogram + tuner + noise gate, chạy AudioWorklet realtime; kiến trúc code, gain staging, chống clipping.                | **DSP Station** — bàn xử lý âm thanh hoàn chỉnh chạy trên nhạc/mic thật, dự án tổng kết.                          |

### 4. Quality contract & Checklist triển khai (chung Series 13 & 14)

**Chất lượng:** mọi bài phải đạt trọn rubric PHẦN IV + quy trình `check-lesson.md`
(đọc trước khi viết, chạy lại trước khi báo xong). Nhắc riêng cho 2 series này:

- Mở rộng bản đồ cross-link (PHẦN IV §4): Nhúng·GPIO/ADC ↔ Điện Tử·điện trở kéo/điện áp
  · Nhúng·ADC ↔ DSP·lượng tử hoá · Nhúng·DMA ping-pong ↔ DSP·realtime · DSP·aliasing ↔
  Điện Tử·mạch lọc RC · DSP·FFT ↔ Web Audio·FFT & AI·spectrogram-CNN · DSP·resampling ↔
  Image Optimizer (Lanczos) · DSP·Q15 ↔ Nhúng·VMCU (bài cross-over 14).
- KaTeX: Nhúng chỉ nạp ở bài có công thức (4, 6, 9, 10); DSP nạp gần như mọi bài; mọi
  công thức kèm 1 câu giải nghĩa ký hiệu; `\text{}` chỉ chứa ASCII (bug diacritics đã biết).
- Âm thanh: mọi demo tạo `AudioContext` SAU cử chỉ người dùng (autoplay policy); demo mic
  luôn có fallback nguồn file/oscillator; auto-mute khi filter mất ổn định.
- Asset vendored (license CC0/tự tạo, ghi rõ nguồn): 1 file nhạc mẫu ngắn, 1 file giọng
  nói mẫu, 1 impulse response phòng (Bài 4 DSP); tất cả nằm trong `blog/dsp/assets/`.

**Hạ tầng dùng chung (làm MỘT lần):**

- [ ] `blog/blog.css`: thêm `.blog-card__tag--embedded` + `.article-hero__tag--embedded`
      (`#14b8a6`) và cặp tương ứng `--dsp` (`#0ea5e9`).
- [ ] Prism: KHÔNG cần thêm grammar (c/javascript/python đã có; asm dùng block thường).
- [ ] Engine 2 file, có self-test Node + con số verified (kỷ luật series AI):
      `blog/embedded/vmcu.js` và `blog/dsp/dsp-core.js` (+ `blog/dsp/worklets/*.js`
      cho AudioWorklet — file module tĩnh riêng).

**Hạng mục dựng NẶNG NHẤT (ước lượng, giảm dần):** 1) VMCU engine + Bảng Mạch Ảo
(timeline ngắt là phần khó nhất); 2) Pole–Zero Filter Lab (kéo-thả + AudioWorklet
realtime); 3) mini-RTOS mô phỏng (Bài 13–15 Nhúng); 4) Spectrogram realtime + Tuner
(Bài 8, 13 DSP); 5) các demo lẻ còn lại đều nhẹ nhờ tái dùng engine.

**Tích hợp toàn cục (sau mỗi series — theo `page-anatomy.md` của skill):**

- [ ] `blog/index.html`: thêm `a.blog-card` cho hub (tag màu mới).
- [ ] **ROOT `index.html`** (file gốc repo, KHÔNG phải blog/index.html — đã sót 2 lần):
      thêm `a.learn-card`; verify số learn-card khớp số blog-card series.
- [ ] `sitemap.xml`: hub (priority 0.8) + từng bài (0.7) — Series 13: 17 URL, Series 14: 16 URL.
- [ ] `blog/search-index.json`: 1 object/bài đúng schema hiện hành.
- [ ] `README.md` + `AGENTS.md`: cây thư mục, số series/bài, "Last Updated".
- [ ] Bảng Progress đầu file này: cập nhật sau MỖI bài (không đợi hết series).

**Thứ tự build đề xuất:** Series 13 trước (độc lập; DSP Bài 14 cần VMCU); trong mỗi
series: hub + engine + flagship trước → 2 bài mẫu duyệt văn phong → nhân ra các bài
còn lại theo lô, mỗi bài 1 commit như quy trình series AI.

---

# 🧱 PHẦN II — CÔNG VIỆC TRIỂN KHAI (Implementation Tasks)

> Tài liệu bàn giao cho người/agent thực thi. Phần I ở trên là **thiết kế nội dung**; phần II này là **danh sách công việc kỹ thuật** bám đúng khung (template) thật của dự án. Đọc kèm `AGENTS.md`.
>
> **Nguyên tắc bất di bất dịch:** Pure HTML + CSS + vanilla JS, **không framework, không build step**. Song ngữ EN/VI. Header + Footer phải **giống hệt** mọi trang blog hiện có (copy từ một file `webgl/*.html` làm chuẩn). Mọi link nội bộ dùng URL **không có đuôi `.html`** (Cloudflare Pages tự rewrite).

## ⚙️ Cách thi công (BẮT BUỘC đọc trước khi làm)

Khối lượng cả dự án rất lớn. Để không cạn hạn mức trong một lượt và không chặn các agent khác, thi công theo nhịp **nhỏ — có điểm dừng — hỏi xác nhận**:

- **KHÔNG spawn subagent.** Làm trực tiếp trong luồng chính, tuần tự. Mỗi đơn vị việc (1 bài, hoặc 1 hạng mục hạ tầng) đủ nhỏ để làm thẳng.
- **Một việc nhỏ mỗi lượt.** Đơn vị nhỏ nhất nên là **1 trang bài học** (hoặc 1 mục hạ tầng ở §1, hoặc 1 visualizer). Đừng làm nhiều bài trong một lượt.
- **Checkpoint sau mỗi đơn vị.** Xong thì hiện checklist `- [x]`/`- [ ]` (việc vừa xong + việc còn lại), rồi **dừng hỏi người duyệt** mới đi tiếp.
- **Ghi/commit ngay.** Lưu file sau mỗi đơn vị để nếu bị cắt ngang chỉ mất tối đa một việc nhỏ.
- **Thứ tự đề xuất:** hạ tầng §1 (mỗi mục một lượt) → 1 series hoàn chỉnh mẫu (hub → visualizer → 1–2 bài) để chủ dự án duyệt văn phong → nhân các bài còn lại, **mỗi lượt 1 bài**, kèm tích hợp toàn cục (§5) cho bài đó.
- Đối chiếu chất lượng từng bài với **Phần IV** trước khi tick "xong".

## 🚫 Điều kiện chặn — BẮT BUỘC đúng trước khi coi 1 bài là "xong"

> Đã chuyển toàn bộ sang [`check-lesson.md`](check-lesson.md) PHẦN B + PHẦN C (kèm lệnh
> grep/prettier chạy được, không còn chỉ mô tả suông). Đọc file đó, không đọc mục này nữa.

## 0. Quy ước slug thư mục & ID series

| #   | Series                     | Thư mục             | File hub                              | Tag class CSS   | Số bài |
| --- | -------------------------- | ------------------- | ------------------------------------- | --------------- | ------ |
| 1   | WebAssembly & Rust         | `blog/wasm/`        | `wasm-programming-series.html`        | `--wasm`        | 10     |
| 2   | WebGPU                     | `blog/webgpu/`      | `webgpu-programming-series.html`      | `--webgpu`      | 10     |
| 3   | DS & Giải Thuật Trực Quan  | `blog/algo/`        | `algo-programming-series.html`        | `--algo`        | 12     |
| 4   | WebRTC & WebSocket         | `blog/realtime/`    | `realtime-programming-series.html`    | `--rtc`         | 8      |
| 5   | Toy JS Engine              | `blog/toyjs/`       | `toyjs-programming-series.html`       | `--toyjs`       | 8      |
| 6   | CSS & Animation            | `blog/css/`         | `css-programming-series.html`         | `--css`         | 10     |
| 7   | SQL (SQLite-WASM)          | `blog/sql/`         | `sql-programming-series.html`         | `--sql`         | 17     |
| 8   | Web Audio API              | `blog/audio/`       | `audio-programming-series.html`       | `--audio`       | 8      |
| 9   | Git                        | `blog/git/`         | `git-programming-series.html`         | `--git`         | 13     |
| 10  | Điện Tử & Mô Phỏng Vi Mạch | `blog/electronics/` | `electronics-programming-series.html` | `--electronics` | 16     |
| 11  | Thiết Kế Vi Mạch Số & FPGA | `blog/vlsi/`        | `vlsi-programming-series.html`        | `--vlsi`        | 14     |

> Slug từng bài đặt theo mẫu sẵn có: `<series>-<chu-de>.html` (vd `wasm-linear-memory.html`, `webgpu-compute-shaders.html`). Đặt tên kebab-case, không dấu.

## 1. Công việc hạ tầng dùng chung (làm MỘT lần, trước khi viết bài)

- [ ] **Prism — hỗ trợ ngôn ngữ mới.** Kiểm tra `blog/prism.js` đã có grammar cho: `rust`, `wgsl`, `sql`, `css` (đã có sẵn `c`,`cpp`,`js`,`bash`; CSS thường có sẵn trong Prism core). Nếu thiếu → bổ sung component Prism tương ứng vào `prism.js` (giữ bản local, không CDN). WGSL có thể fallback sang `clike`/`glsl`. Git dùng `bash` cho lệnh CLI nên không cần grammar mới. Test highlight thực tế trên 1 file mẫu.
- [ ] **Tag màu cho từng series.** Trong `blog/blog.css` thêm 9 class `.blog-card__tag--{wasm,webgpu,algo,rtc,toyjs,css,sql,audio,git}` (màu accent riêng, theo pattern `--sc/--io/--qr/--c/--cpp/--js/--canvas/--webgl/--bash` đã có). Thêm biến màu accent series cho hero nếu cần.
- [ ] **i18n nav.** Các chuỗi nav/footer đã có sẵn (`data-i18n="nav.*"`); KHÔNG cần thêm key mới cho nội dung bài (nội dung bài dùng `data-lang-content="en|vi"`, không qua i18n.js). Chỉ thêm key i18n nếu xuất hiện text chrome mới.
- [ ] **Chuẩn hoá "khung mẫu".** Chọn file chuẩn để nhân bản: `blog/webgl/webgl-shaders-glsl.html` (bài) và `blog/webgl/webgl-programming-series.html` (hub). Mọi bài mới copy từ đây rồi thay nội dung — đảm bảo header/footer/AdSense đồng nhất.
- [ ] **⭐ Component chú thích MỚI (chưa có trong `blog.css`).** Thêm hệ thống callout: `.callout` + biến thể `.callout--note` (ℹ️ Lưu ý), `.callout--tip` (💡 Mẹo), `.callout--warning` (⚠️ Cảnh báo), `.callout--pitfall` (🕳️ Cạm bẫy thường gặp), `.callout--deep` (🔬 Đào sâu/nâng cao). Mỗi callout có icon + tiêu đề + nội dung song ngữ. Đây là yếu tố "đủ chú thích" — series cũ chưa có, nên là nâng cấp chuẩn chung.
- [ ] **⭐ Component "Tài liệu tham khảo" MỚI.** Cuối mỗi bài thêm khối `.article-refs` (📖 Tài liệu tham khảo / References) liệt kê link ngoài (MDN, W3C/WHATWG spec, caniuse, paper gốc). Link ngoài BẮT BUỘC `target="_blank" rel="noopener noreferrer"`. Series cũ không có link ngoài → đây là nâng cấp "đủ liên kết".
- [ ] **⭐ Glossary thuật ngữ MỚI.** Mỗi trang hub có khối `.glossary` (Bảng thuật ngữ EN–VI) định nghĩa ngắn gọn các thuật ngữ chuyên ngành của series; trong bài dùng `<abbr title="…">` cho lần xuất hiện đầu. Phục vụ "đủ chú thích" cho người đọc Việt.
- [ ] **✅ Math rendering = KaTeX local (ĐÃ CHỐT).** Thêm `katex.min.css` + `katex.min.js` + `auto-render.min.js` vào `blog/` (bản tĩnh, **không CDN, không build**). Mọi công thức toán dùng KaTeX (`$…$` inline, `$$…$$` block) qua auto-render khi `DOMContentLoaded`. Áp cho mọi bài có công thức (đặc biệt WebGPU, WASM SIMD, DSA); chỉ nạp script ở trang có công thức để khỏi nặng trang khác. Test render trên 1 bài mẫu.
- [x] **✅ Widget bình luận = chỉ giscus (ĐÃ HOÀN THÀNH).** Đã gỡ bỏ hoàn toàn Facebook comments/SDK và chuyển đổi sang Giscus trên toàn bộ trang bài viết.

## 2. Checklist cho MỖI series (lặp lại 10 lần)

- [ ] Tạo thư mục `blog/<series>/`.
- [ ] **Trang hub** `<series>-programming-series.html`:
  - Copy từ `webgl-programming-series.html`.
  - `<title>`, `<meta description>`, `<link rel="canonical">` (URL không `.html`), OG tags, JSON-LD (kiểu `Course`/`ItemList`).
  - Danh sách bài dùng `.lessons-list > a.lesson-item` gồm `.lesson-number` (01, 02…), `.lesson-content > h2.lesson-title` + `p.lesson-desc`, `.lesson-arrow ➔`. `href` trỏ tới slug bài **không đuôi**.
  - Phần intro song ngữ (`data-lang-content`).
- [ ] **Trang demo visualizer cốt lõi** (theo "Core Visualizer Demo" của series ở Phần I) — xem mục 4.
- [ ] **N trang bài học** — xem checklist mục 3 (áp dụng cho từng bài).
- [ ] **File code thực hành co-located** cho mỗi bài (`.rs`/`.wgsl`/`.js`/`.html`…) đặt cùng thư mục, dùng cho nút "⟨⟩ Xem Code" (lazy-fetch) và link "Tải file code thực hành".
- [ ] **Tích hợp toàn cục** (mục 5): thêm card vào `blog/index.html`, thêm `<url>` vào `sitemap.xml`, thêm entry vào `search-index.json`.

## 3. Definition of Done cho MỖI trang bài học

> Đã chuyển sang [`check-lesson.md`](check-lesson.md) PHẦN B (anatomy trang bài học) + PHẦN C
> (checklist chạy thật trước khi báo xong, gồm cả lệnh kiểm tra `.code-tabs`, canonical, quiz).
> Lưu ý: mục "2 khối song song EN/VI" trong bản cũ chỉ áp cho series **cũ hơn** DSA
> (2026-07-03) — series mới viết 1 khối tiếng Việt duy nhất, xem quy tắc ngôn ngữ trong
> `check-lesson.md` PHẦN B.

## 4. Visualizer cốt lõi cần dựng (1 demo/series — phần nặng nhất)

Mỗi cái là 1 file HTML độc lập trong thư mục series, nhúng vào bài qua iframe + có nút Xem Code:

- [ ] **WASM/Rust** → `wasm-image-lab.html`: upload ảnh + slider filter + bảng benchmark JS vs Wasm vs SIMD vs Multi-thread + biểu đồ cột. (Cần bundle `.wasm` build sẵn từ Rust/`wasm-pack`, commit binary vào repo — không build runtime.)
- [ ] **WebGPU** → `webgpu-fluid-lab.html`: mô phỏng hạt/chất lỏng compute shader, slider số hạt, FPS/GPU-time. Cần feature-detect `navigator.gpu` + thông báo fallback nếu trình duyệt không hỗ trợ.
- [ ] **Algo** → `algo-sandbox.html`: canvas vẽ cây/đồ thị + điều khiển insert/delete/search + slider tốc độ + log từng bước (async/await + sleep).
- [ ] **Realtime** → `realtime-dashboard.html`: bảng trạng thái signaling + whiteboard/chat P2P + biểu đồ latency. (Phần signaling server chỉ minh hoạ; demo P2P có thể dùng 2 tab + copy-paste SDP để không cần backend.)
- [ ] **Toy JS Engine** → `toyjs-visualizer.html`: editor trái + Call Stack/Scope/Heap phải + nút Step Into/Over + log bước thực thi.
- [ ] **CSS & Animation** → `css-playground.html`: editor CSS real-time + overlay Box Model/Grid line + bezier editor + timeline scrub keyframe.
- [ ] **SQL** → `sql-workbench.html`: editor SQL + bảng kết quả + thời gian thực thi + `EXPLAIN QUERY PLAN` + ERD. Cần commit sẵn artifact `sql-wasm.wasm` của `sql.js` (không build runtime).
- [ ] **Web Audio** → `audio-synth-lab.html`: node-graph kéo-thả + Canvas waveform/FFT + nguồn synth/file/mic. Tôn trọng autoplay policy (chỉ khởi tạo `AudioContext` sau user gesture).
- [ ] **Git** → `git-graph-sim.html`: canvas/SVG vẽ DAG commit + ô nhập lệnh giả lập + panel 3 cây & refs di chuyển trực quan.
- [ ] **Electronics** → `circuit-scope-lab.html`: canvas vẽ lưới mạch điện (nguồn DC/AC, trở, tụ, cuộn cảm, đi-ốt, transistor, cổng logic, LED) kéo thả + electron chạy trên dây dẫn + máy hiện sóng oscilloscope hiển thị dạng sóng điện áp/dòng điện thời gian thực.

> ⚠️ Ràng buộc "no build step": với Rust/Wasm phải **commit sẵn artifact `.wasm`** (build offline), trang chỉ `fetch()` + `instantiate`. Không thêm toolchain vào CI/Cloudflare.

## 5. Tích hợp toàn cục (sau khi xong mỗi series)

- [ ] **`blog/index.html`**: thêm 1 `a.blog-card` trỏ tới `<series>/<series>-programming-series` với `span.blog-card__tag--<x>`, tiêu đề + excerpt song ngữ (`data-lang-content`), `.blog-card__meta`, "Start learning → / Bắt đầu học →". Đặt cùng nhóm các series lập trình.
- [ ] **⚠️ ROOT `index.html`** (thư mục gốc, KHÁC `blog/index.html`): thêm 1 `a.learn-card` vào section "Programming Courses" — xem lý do & lịch sử bỏ sót trong [`check-lesson.md`](check-lesson.md). Luôn kiểm tra lại số lượng card khớp giữa 2 file.
- [ ] **`sitemap.xml`**: thêm 1 block `<url>` cho hub + mỗi bài + mỗi visualizer. Mẫu:
  ```xml
  <url>
    <loc>https://js-tools.org/blog/<series>/<file></loc>
    <lastmod>2026-06-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ```
  (Hub để `priority` 0.8.)
- [ ] **`blog/search-index.json`**: thêm 1 object/bài: `url` (không `.html`), `parentSeries`, `titleEn`, `titleVi`, `desc`, `headingsEn`, `headingsVi` (ghép các heading H2 theo thứ tự, cả 2 ngôn ngữ — search đã diacritics-insensitive).
- [ ] **`README.md` + `AGENTS.md`**: cập nhật bảng/cây thư mục + số lượng series/bài + dòng "Last Updated".

## 6. QA trước khi bàn giao mỗi series

> Đã chuyển sang [`check-lesson.md`](check-lesson.md) PHẦN C (C1 lệnh tự động, C2 kiểm tra thủ
> công trên trình duyệt, C3 tích hợp chéo file).

## 7. Thứ tự ưu tiên đề xuất

1. **CSS & Animation** — đối tượng đọc rộng nhất, demo nhìn-thấy-ngay, thuần CSS không toolchain → ra nhanh, dễ lan toả.
2. **WebGPU** — nối momentum từ WebGL, khoảng trống nội dung tiếng Việt lớn, code demo tái dùng nhiều từ series WebGL.
3. **Algo Visualizer** — chỉ vanilla JS + Canvas, không cần toolchain, rủi ro kỹ thuật thấp.
4. **Git** — đối tượng rộng, visualizer DAG độc đáo, thuần JS.
5. **SQL (SQLite-WASM)** — interactive cao, chỉ cần commit sẵn `sql-wasm.wasm`.
6. **Web Audio API** — tái dùng kiến thức Canvas, demo bắt mắt.
7. **Toy JS Engine** — thuần JS, độc đáo, SEO tốt.
8. **WASM & Rust** — giá trị cao nhưng cần build artifact offline → setup nặng hơn.
9. **WebRTC & WebSocket** — cần xử lý signaling/NAT, demo phức tạp nhất → làm cuối.

> Gợi ý cho agent thực thi: làm **trọn 1 series hoàn chỉnh (hub + visualizer + 1–2 bài mẫu)** trước, để chủ dự án duyệt khung & văn phong, rồi mới nhân ra các bài còn lại.

---

# 📚 PHẦN III — ĐỀ CƯƠNG CHI TIẾT MỤC H2 TỪNG BÀI

> Bung mỗi bài thành **3–5 mục H2 con** đúng chuẩn các series đã xuất bản (vd `cpp-move-semantics`: 6 mục, `c-data-structures`: 10 mục). Đây là khung nội dung tối thiểu cho `.article-body` của mỗi trang bài học. **Mỗi bài luôn kết thúc bằng 1 mục "Câu hỏi trắc nghiệm ôn tập" (2–3 câu, dùng `ide.js`)** — không lặp lại bên dưới cho gọn. Agent có thể thêm mục nhưng không được ít hơn số mục liệt kê.

## Series 1 — WebAssembly & Rust

- **Bài 1 — Biên dịch AOT & Stack Machine:** 1.1 Vì sao cần Wasm: JS JIT vs AOT · 1.2 Cấu trúc file `.wasm` & định dạng WAT · 1.3 Stack Machine thực thi lệnh vs Register Machine · 1.4 `wasm-pack` toolchain & glue code.
- **Bài 2 — Linear Memory & Zero-Copy:** 2.1 Mô hình Linear Memory (`WebAssembly.Memory`, ArrayBuffer) · 2.2 Quản lý bộ nhớ thủ công trong Rust · 2.3 Truyền con trỏ/độ dài qua biên JS↔Wasm · 2.4 Zero-copy: chia sẻ buffer thay vì sao chép.
- **Bài 3 — Tối ưu Pixel Manipulation:** 3.1 Bố cục RGBA & flatten mảng 2D · 3.2 Cache locality khi duyệt điểm ảnh · 3.3 Bộ lọc Sepia/Grayscale/Invert bằng Rust · 3.4 Đo overhead biên JS↔Wasm.
- **Bài 4 — Wasm SIMD 128-bit:** 4.1 Vector hoá & mô hình SoA vs AoS · 4.2 Kiểu `v128` và intrinsics · 4.3 Xử lý song song 4 kênh RGBA/chu kỳ · 4.4 Gaussian blur tối ưu SIMD · 4.5 Đo FPS & cạm bẫy alignment.
- **Bài 5 — Đa luồng trên trình duyệt:** 5.1 Web Workers & `SharedArrayBuffer` (COOP/COEP headers) · 5.2 `Atomics.wait`/`notify` & Race Condition · 5.3 `wasm-bindgen-rayon` chia việc · 5.4 Demo Mandelbrot đa luồng.
- **Bài 6 — C/C++ Static Linking & Emscripten:** 6.1 Cross-compilation libc/libjpeg · 6.2 `ccall`/`cwrap` gọi hàm C · 6.3 Virtual filesystem của Emscripten · 6.4 Tích hợp codec JPEG gốc.
- **Bài 7 — WasmGC & Managed Languages:** 7.1 Linear Memory vs Managed Objects · 7.2 Đề xuất WasmGC & reference types · 7.3 So sánh Rust vs Go (TinyGo): bundle size & RAM · 7.4 Khi nào chọn ngôn ngữ GC.
- **Bài 8 — Sandboxing & Memory Safety:** 8.1 Mô hình thực thi cô lập của Wasm · 8.2 Chống Buffer Overflow nhờ bounds-check · 8.3 Rủi ro rò rỉ trong Linear Memory phẳng · 8.4 Viết Rust an toàn (ownership/borrow).
- **Bài 9 — Tối ưu dung lượng Wasm:** 9.1 `wasm-opt` & dead-code elimination · 9.2 Loại bỏ panic formatting/`std` fmt · 9.3 `wee_alloc` & tinh chỉnh allocator · 9.4 Đo thời gian tải & parse trình duyệt.
- **Bài 10 — Dự án: Wasm Image Optimizer:** 10.1 Kiến trúc pipeline (decode→filter→encode) · 10.2 Tích hợp SIMD + đa luồng · 10.3 Codec WebP/JPEG bằng Rust · 10.4 Benchmark tổng thể vs JS thuần.

## Series 4 — WebRTC & WebSocket

- **Bài 1 — Bản chất WebSocket:** 1.1 Handshake nâng cấp HTTP→WS · 1.2 Khung dữ liệu (opcode/mask/payload) · 1.3 Ping/pong & giữ kết nối TCP · 1.4 Server Node.js viết chay.
- **Bài 2 — WebRTC Handshake & SDP:** 2.1 `RTCPeerConnection` lifecycle · 2.2 Offer/Answer & cấu trúc SDP · 2.3 ICE candidate gathering · 2.4 Bắt tay thủ công qua copy-paste.
- **Bài 3 — STUN/TURN & NAT Traversal:** 3.1 Các loại NAT (Cone/Symmetric) · 3.2 STUN khám phá địa chỉ công cộng · 3.3 TURN relay khi P2P thất bại · 3.4 Cấu hình `iceServers`.
- **Bài 4 — RTC Media Streams:** 4.1 `getUserMedia` & MediaStream · 4.2 Codec & adaptive bitrate · 4.3 Track/transceiver & renegotiation · 4.4 App gọi video nhóm nhỏ.
- **Bài 5 — RTC Data Channel P2P:** 5.1 SCTP trên UDP · 5.2 Reliable vs unreliable/ordered · 5.3 Backpressure & chunk file lớn · 5.4 Công cụ P2P File Share.
- **Bài 6 — Multiplayer State Sync:** 6.1 Client-Side Prediction · 6.2 Server Reconciliation · 6.3 Entity Interpolation/lag comp · 6.4 Game bóng 2D real-time.
- **Bài 7 — High Performance Server:** 7.1 Vòng đời & quản lý kết nối · 7.2 Broadcasting & room/pub-sub · 7.3 Backpressure & giới hạn tài nguyên · 7.4 Signaling server Go/Rust chịu tải.
- **Bài 8 — Dự án: WebRTC ColorQuarium:** 8.1 Điện thoại làm tay cầm qua Data Channel · 8.2 Giao thức input độ trễ thấp · 8.3 Đồng bộ trạng thái <10ms · 8.4 So sánh WebSocket vs WebRTC.

## Series 5 — Toy JS Engine

- **Bài 1 — Lexical Analysis & Tokenizer:** 1.1 FSM quét ký tự · 1.2 Phân loại token (keyword/ident/literal/op) · 1.3 Bỏ qua whitespace/comment · 1.4 Tokenizer real-time.
- **Bài 2 — Abstract Syntax Tree Parser:** 2.1 Grammar phi ngữ cảnh (CFG) · 2.2 Recursive descent & precedence climbing · 2.3 Node AST (Program/Decl/Expr) · 2.4 Xuất AST dạng JSON trực quan.
- **Bài 3 — Interpreter Environment:** 3.1 Tree-walking evaluate · 3.2 Environment Record & binding biến · 3.3 Toán tử & ép kiểu cơ bản · 3.4 Chạy biểu thức & khai báo.
- **Bài 4 — Control Flow Branches:** 4.1 Đánh giá biểu thức logic · 4.2 `if/else` rẽ nhánh · 4.3 Vòng lặp `while/for` · 4.4 Chạy thuật toán cơ bản.
- **Bài 5 — Functions & Call Stack:** 5.1 Thiết kế Call Stack · 5.2 Activation Record/Execution Context · 5.3 Tham số & giá trị trả về · 5.4 Đệ quy & stack overflow.
- **Bài 6 — Scope Chain & Closures:** 6.1 Lexical Environment tĩnh · 6.2 Scope chain tra cứu biến · 6.3 Cơ chế giữ biến cha (Closure) · 6.4 Demo counter closure.
- **Bài 7 — Call Stack & Heap Visualizer:** 7.1 Phân biệt Stack vs Heap runtime · 7.2 Tham chiếu đối tượng trên Heap · 7.3 Debugger step-into/over · 7.4 Vẽ bộ nhớ động từng bước.
- **Bài 8 — Dự án: Garbage Collector:** 8.1 Vì sao cần GC · 8.2 Tìm root set (global/stack) · 8.3 Thuật toán Mark-and-Sweep · 8.4 Trực quan thu hồi ô nhớ rác.

## Series 13 — Hệ Thống Nhúng: Từ Thanh Ghi Đến RTOS

> Format theo chuẩn series AI (12): mỗi mục H2 kèm what/why/pitfall; mỗi bài kết thúc
> bằng "Trắc nghiệm ôn tập"; mỗi bài có snippet C bare-metal thật đối chiếu demo VMCU.
> Trạng thái: **HOÀN CHỈNH 16/16 bài** (2026-07-11).

- **Bài 1 — Hệ nhúng là gì & giải phẫu một MCU** (`embedded-mcu-anatomy.html`): 1.1 Hệ nhúng quanh ta: máy tính chuyên dụng "giấu mặt" trong thiết bị — ràng buộc đặc thù RAM tính bằng KB, pin tính bằng năm, deadline tính bằng µs; bảng so sánh MCU vs MPU vs SoC (why: chọn sai nền tảng là chết dự án từ ngày đầu; when: MCU khi cần realtime + rẻ + tiết kiệm điện, MPU/Linux khi cần filesystem/network stack đầy đủ) · 1.2 Giải phẫu một MCU: CPU core + Flash + SRAM + ngoại vi trên MỘT die; Von Neumann vs Harvard (why: 2 bus riêng cho lệnh/dữ liệu → fetch song song); clock tree ở mức khái niệm — mọi ngoại vi "thở" theo nhịp clock · 1.3 Memory map — "mọi thứ là một địa chỉ": Flash, SRAM, thanh ghi ngoại vi cùng nằm trên một không gian địa chỉ 32-bit; pitfall: truy cập địa chỉ không hợp lệ → HardFault lạnh lùng, không có segfault + stack trace thân thiện như trên PC · 1.4 Toolchain thật sự trông thế nào: cross-compiler (`arm-none-eabi-gcc`), linker script, nạp firmware qua debug probe (ST-Link/J-Link), vòng lặp build→flash→debug; đối chiếu minh bạch: series này chạy VMCU ngay trong trang để KHÔNG cần mua phần cứng, nhưng mọi bài đều show lệnh/C thật để chuyển sang board thật không bỡ ngỡ · 1.5 Thực hành: tour Bảng Mạch Ảo + Memory Map Explorer — click từng vùng nhớ xem vai trò, thực hiện thao tác đọc/ghi ô nhớ đầu tiên bằng tay. _Tiên quyết: Series C (con trỏ, kiểu số nguyên); Series 10 Điện Tử (nhận biết LED/điện trở/nút nhấn)._
- **Bài 2 — Thanh ghi & Memory-Mapped I/O** (`embedded-registers-mmio.html`): 2.1 MMIO: ngoại vi chính là ô nhớ — ghi vào địa chỉ `0x4800 0014` nghĩa là ra lệnh cho phần cứng; con trỏ C `*(volatile uint32_t*)` tới địa chỉ cố định; why: đây là tầng đáy mà MỌI HAL/SDK/Arduino đều quy về — hiểu nó thì không còn "hàm ma thuật" · 2.2 `volatile` — vì sao thiếu nó code chết: compiler thấy vòng lặp đọc biến "không đổi" → tối ưu thành đọc 1 lần → vòng chờ flag thành vòng lặp vô hạn; cặp ❌/✅ trước–sau khi thêm volatile; when: volatile dành cho MMIO và biến chia sẻ với ISR — KHÔNG phải công cụ đồng bộ vạn năng (đặt gạch cho Bài 8) · 2.3 Đại số bit trên thanh ghi: set `\|=`, clear `&= ~`, toggle `^=`, test `&`; ghi field nhiều bit bằng mask + shift; pitfall kinh điển: dùng `=` thay `\|=` xoá trắng cấu hình của mọi chân khác trên cùng port · 2.4 Read-Modify-Write không nguyên tử: chuỗi đọc→sửa→ghi có thể bị ngắt chen giữa và mất cập nhật (gieo mầm Bài 8); giải pháp phần cứng: thanh ghi set/clear riêng biệt kiểu BSRR (ghi 1 bit là set, không cần đọc) · 2.5 Thực hành: gõ giá trị hex thẳng vào Register Inspector bật 8 LED theo ý muốn TRƯỚC khi viết dòng firmware nào; sau đó viết firmware nháy LED đầu tiên (JS trên VMCU, tab đối chiếu C thật từng dòng). _Tiên quyết: Bài 1; Series C (con trỏ, toán tử bit)._
- **Bài 3 — GPIO input: pull-up/down & đọc nút nhấn** (`embedded-gpio-input.html`): 3.1 Một chân, nhiều vai: mode input/output/alternate/analog và thanh ghi MODER; đọc trạng thái chân qua IDR; why: chân MCU là tài nguyên đắt nhất — datasheet bán MCU theo số chân · 3.2 Chân floating — chiếc ăng-ten bất đắc dĩ: input hở không nối đâu cả thì đọc ra giá trị NGẪU NHIÊN theo nhiễu môi trường; pitfall phổ biến nhất của người mới: quên pull cho nút nhấn rồi đổ lỗi "MCU chập chờn" · 3.3 Pull-up/pull-down nội & quy ước active-low: mạch điện thật của điện trở kéo (cross-link Series 10 bài điện trở), vì sao cấu hình "nút nối GND + pull-up nội, nhấn = 0" phổ biến áp đảo (an toàn nhiễu, tiết kiệm linh kiện); bảng ❌/✅ các cấu hình nút sai/đúng · 3.4 Polling và phát hiện cạnh: vòng lặp đọc IDR; phân biệt mức (level) vs cạnh (edge); phát hiện cạnh xuống bằng so sánh trạng thái trước/sau; when: polling hoàn toàn đủ khi vòng lặp quét nhanh — giới hạn của nó (bỏ lỡ sự kiện khi bận) mở đường sang ngắt ở Bài 7 · 3.5 Thực hành: tắt pull-up trên bảng ảo và NHÌN giá trị nút nhảy loạn thật; firmware nút bấm đảo trạng thái LED (mỗi lần nhấn đổi 1 lần — sẽ thấy nó "đổi mấy lần một nhấn" → cliffhanger dẫn sang bài debounce). _Tiên quyết: Bài 2; Series 10 Điện Tử (điện trở kéo)._
- **Bài 4 — SysTick & thời gian: thoát khỏi delay blocking** (`embedded-systick-timing.html`): 4.1 Busy-wait delay và cái giá thật: vòng lặp đếm rỗng đốt 100% CPU, thời gian trôi phụ thuộc clock và mức tối ưu compiler; pitfall chí mạng: trong lúc `delay(500)`, MỌI sự kiện (nhấn nút, byte UART tới) trôi qua không ai nhìn — "firmware kiểu Arduino delay" là thói quen đầu tiên phải bỏ · 4.2 SysTick — nhịp tim của firmware: timer 24-bit đếm lùi ngay trong core; thanh ghi LOAD/VAL/CTRL; cấu hình tick 1ms với $LOAD = f_{clk}/1000 - 1$; `SysTick_Handler` tăng biến đếm tick — black-box đúng quy tắc: "hàm này được phần cứng tự gọi mỗi 1ms, cơ chế ngắt sẽ học chi tiết ở Bài 7" (callout forward-reference rõ ràng) · 4.3 `millis()` và lịch không chặn: pattern `if (now - last >= period)`; vì sao PHÉP TRỪ unsigned là dạng đúng duy nhất; chạy 3-4 việc chu kỳ khác nhau "song song" mà không cần đa luồng — nền của mọi firmware super-loop tử tế · 4.4 Tràn bộ đếm — bug 49,7 ngày có thật: `uint32` đếm ms tràn sau $2^{32}$ms ≈ 49,7 ngày; viết đúng dạng `now - last` thì qua điểm tràn vẫn đúng nhờ số học modulo, viết `now >= last + period` là hẹn giờ nổ chậm; case thật: Windows 95 treo sau 49,7 ngày uptime, Boeing 787 phải reboot mỗi 248 ngày · 4.5 Thực hành: 2 LED nhấp nháy chu kỳ 300ms/700ms + quét nút — tất cả không chặn; thí nghiệm đối chứng chạy song song: phiên bản dùng delay bỏ lỡ nhấn nút ngay trước mắt. VMCU build-out: SysTick. _Tiên quyết: Bài 2 (thanh ghi), Bài 3 (nút cho thí nghiệm đối chứng)._
- **Bài 5 — Chống dội phím & Máy trạng thái (FSM)** (`embedded-debounce-fsm.html`): 5.1 Bounce — sự thật vật lý của tiếp điểm: lá kim loại nảy hàng chục lần trong 1–10ms trước khi yên; xem dạng sóng bounce phóng to (oscilloscope view trên bảng ảo); why: giải đáp cliffhanger Bài 3 "một nhấn đếm thành bảy" · 5.2 Debounce bằng delay — dễ mà dở: chờ 50ms sau cạnh đầu tiên; pitfall kép: quay lại blocking (phản bội toàn bộ Bài 4) và hằng số 50ms chọn mù — nút khác, thời gian bounce khác · 5.3 Debounce bằng lấy mẫu định kỳ: đọc nút mỗi tick, chỉ công nhận trạng thái mới sau N mẫu ổn định liên tiếp (bộ đếm hoặc shift-register 8-bit); tham số N×T và cách chọn theo datasheet nút; when: đây là chuẩn firmware thương mại — không blocking, không phụ thuộc may rủi · 5.4 Máy trạng thái hữu hạn — xương sống của firmware không-RTOS: enum state + `switch`; bảng chuyển trạng thái; FSM nút nhấn 4 trạng thái `RELEASED → MAYBE_PRESSED → PRESSED → MAYBE_RELEASED`; tách sự kiện (edge đã sạch) khỏi hành động (toggle LED); pitfall: `if` lồng nhau + cờ boolean rải rác thay vì FSM → spaghetti không vẽ được, không test được · 5.5 Thực hành: hai bộ đếm chạy song song — nút thô đếm loạn vs FSM debounce đếm chuẩn từng nhấn; sơ đồ FSM động tô sáng trạng thái đang đứng; mở rộng: phát hiện nhấn-giữ (long-press) chỉ bằng cách thêm 1 trạng thái — thấy FSM "nở" đẹp thế nào. _Tiên quyết: Bài 3 (nút, cạnh), Bài 4 (tick để lấy mẫu định kỳ)._
- **Bài 6 — Timer đa năng & PWM** (`embedded-timer-pwm.html`): 6.1 Timer đa năng khác gì SysTick: bộ đếm lên/xuống với prescaler chia clock đầu vào, auto-reload (ARR) đặt chu kỳ, các kênh compare (CCR); why: SysTick giữ "giờ hệ thống", TIM sinh dạng sóng và đo đạc thế giới ngoài — hai vai không đổi chỗ được · 6.2 Toán prescaler/ARR: $f_{update} = \dfrac{f_{clk}}{(PSC+1)(ARR+1)}$ — bảng ví dụ số thật từ 1Hz đến 20kHz; trade-off: PSC lớn → ARR nhỏ → độ phân giải duty thô; pitfall kép: quên "+1" trong công thức (sai tần số ~ngay lập tức) và chọn PSC to quá làm PWM chỉ còn vài bậc sáng · 6.3 PWM — giả lập analog bằng digital thuần: duty cycle = CCR/ARR; LED mờ dần vì mắt người tích phân, buzzer đổi cao độ vì tai nghe tần số; when: PWM đủ tốt cho LED/động cơ/buzzer — KHÔNG thay được DAC cho audio chất lượng (vì sao → cửa sổ nhìn sang Series 14 bài lượng tử hoá & lọc) · 6.4 Ứng dụng kinh điển — servo RC: khung 50Hz, độ rộng xung 1–2ms mã hoá góc quay; tính PSC/ARR/CCR cho servo từ đầu đến cuối; outlook 1 đoạn: chiều ngược lại (đo độ rộng xung bằng input capture) tồn tại — không đi sâu · 6.5 Thực hành: kéo 3 thanh trượt PSC/ARR/CCR — công thức KaTeX cập nhật SỐ THẬT theo tay kéo, buzzer đổi cao độ nghe được (Web Audio), LED đổi độ sáng; bài tập: còi báo động 2 tông luân phiên bằng 2 cấu hình timer + tick từ Bài 4. VMCU build-out: TIM1 + PWM ra LED/buzzer. _Tiên quyết: Bài 2 (thanh ghi), Bài 4 (khái niệm clock/tick)._

- **Bài 7 — Ngắt (Interrupt) & NVIC** (`embedded-interrupts-nvic.html`): 7.1 Polling vs interrupt: polling là liên tục hỏi "xong chưa?", ngắt là phần cứng gõ vai đúng lúc có việc; why: vừa tiết kiệm CPU vừa không bỏ lỡ sự kiện, và là nền của chế độ tiết kiệm điện (CPU ngủ chờ ngắt); when: polling vẫn thắng khi sự kiện dày đặc hoặc cần jitter cực thấp — bảng trade-off hai cột · 7.2 Mở hộp đen từ Bài 4 — điều gì thật sự xảy ra khi ngắt nổ: vector table là mảng con trỏ hàm nằm đầu Flash; phần cứng TỰ lưu ngữ cảnh (xPSR, PC, LR, R0–R3, R12) lên stack, nạp PC từ vector; trả về bằng giá trị `EXC_RETURN` đặc biệt; giải mã "phép thuật" đặt tên `TIM1_IRQHandler` là chạy — linker nối tên hàm vào đúng ô vector · 7.3 NVIC — tổng đài ngắt: enable (ISER), pending (ISPR), priority; preemption: ngắt ưu tiên cao chen ngắt thấp (nested interrupt); pitfall ngược trực giác: số priority NHỎ hơn = ưu tiên CAO hơn · 7.4 EXTI — ngắt từ chân GPIO: chọn cạnh lên/xuống/cả hai; pitfall chí mạng nhất chương ngắt: quên clear pending flag trong ISR → ISR bị gọi lại vô hạn, main "đóng băng" — dạy nhận diện triệu chứng này · 7.5 Quy tắc vàng "ISR càng ngắn càng tốt": ISR dài chặn mọi ngắt cùng/thấp priority → latency tích luỹ; pattern chuẩn: ISR chỉ ghi cờ hoặc đẩy dữ liệu vào buffer, main xử lý phần nặng (gieo mầm ring buffer Bài 8); ❌/✅: ISR gọi hàm in chuỗi vs ISR set flag · 7.6 Thực hành: Timeline ngắt trên VMCU — nhấn nút EXTI thấy ISR chen ngang main loop đúng thời điểm; thí nghiệm đối chứng: main bận busy-loop, polling hụt cú nhấn còn ngắt bắt được; nested interrupt 2 mức priority nhìn thấy chen nhau trên timeline. VMCU build-out: NVIC + EXTI. _Tiên quyết: Bài 3 (nút), Bài 4 (đã dùng SysTick ISR dạng black-box), Bài 6 (timer làm nguồn ngắt thứ hai)._
- **Bài 8 — Chia sẻ dữ liệu ISR ↔ main: race condition & critical section** (`embedded-isr-race-critical-section.html`): 8.1 Race condition đầu tiên của bạn: `counter++` trong main là BA lệnh máy (LDR/ADD/STR), ISR chen giữa LDR và STR cũng sửa `counter` → một cập nhật biến mất; nối thẳng RMW Bài 2.4 nhưng giờ có thủ phạm thật; why đáng sợ: không tái hiện ổn định — "chạy ba ngày mới sai một lần", loại bug đắt nhất firmware · 8.2 `volatile` KHÔNG phải khoá: volatile chỉ ép compiler đọc/ghi bộ nhớ thật, không làm chuỗi RMW nguyên tử; cặp ❌/✅: code đầy volatile vẫn race vs critical section đúng; pitfall: "thêm volatile là hết race" — hiểu nhầm số một trong phỏng vấn nhúng · 8.3 Critical section — tắt ngắt có kỷ luật: PRIMASK / `__disable_irq()`/`__enable_irq()`; quy tắc NGẮN nhất có thể và đo cái giá: mọi ngắt bị trễ đúng bằng độ dài critical section (đo được trên timeline); when: mọi RMW hoặc truy cập struct nhiều trường chia sẻ với ISR · 8.4 Đọc "xé đôi" (torn read): cặp dữ liệu liên quan (con trỏ + độ dài, giờ + phút) bị ISR cập nhật giữa hai lần đọc → main thấy tổ hợp CHƯA BAO GIỜ tồn tại; giải pháp: critical section, hoặc đọc-lặp-đến-nhất-quán (seqlock mini ở mức khái niệm) · 8.5 Ring buffer SPSC — chia sẻ mà không cần khoá: một producer (ISR) một consumer (main), mỗi bên chỉ ghi chỉ số CỦA MÌNH (head/tail) → đúng đắn không cần tắt ngắt; điều kiện nền: ghi chỉ số là nguyên tử (biến aligned ≤ độ rộng từ máy); đây là cấu trúc dữ liệu quan trọng nhất toàn series — Bài 9 dùng ngay · 8.6 Thực hành: demo race trên VMCU — bấm "chạy 10.000 vòng" thấy số đếm sai lệch thật, bật critical section → sai số về 0; ring buffer visualizer hai con trỏ head/tail đuổi nhau, thử làm đầy/làm rỗng. _Tiên quyết: Bài 7 (ISR), Bài 2 (RMW)._
- **Bài 9 — UART & giao tiếp nối tiếp** (`embedded-uart.html`): 9.1 Vì sao truyền nối tiếp thắng song song: tốn 2 chân thay vì 8+ (nối Bài 3 "chân là tài nguyên đắt"); UART không cần dây clock chung — hai bên TỰ thoả thuận tốc độ trước; khung 8N1 mổ xẻ từng bit: start (kéo xuống 0), 8 bit data LSB-first, parity tuỳ chọn, stop (thả về 1) · 9.2 Baud rate & ngân sách sai số: công thức chia clock $BRR = f_{clk}/baud$; vì sao hai bên lệch nhau ~±2% là vỡ khung — sai số tích luỹ qua 10 bit, bit cuối lấy mẫu lệch nửa bit là hỏng; pitfall: chạy clock RC nội ±1% + baud không chia hết → lỗi chập chờn theo nhiệt độ, loại bug "ma ám" kinh điển · 9.3 TX/RX bằng ngắt + ring buffer: gửi không chặn (main đẩy vào TX buffer, ISR TXE rút dần từng byte), nhận không mất (ISR RXNE đẩy vào RX buffer, main thong thả rút) — áp dụng nguyên xi SPSC Bài 8; pitfall tội lỗi kinh điển: `printf` blocking bên trong ISR · 9.4 Giao thức dòng lệnh mini: stream byte KHÔNG có ranh giới — phải tự framing (newline làm dấu kết thúc lệnh); parser tách lệnh `LED ON` / `LED OFF` / `BLINK 500`; outlook một đoạn: checksum/CRC tồn tại cho đường truyền nhiễu — không đi sâu · 9.5 Thực hành: UART terminal trên bảng ảo — gõ lệnh điều khiển LED thật sự; waveform explorer soi từng bit của khung truyền chữ `'A'` (0x41) có chú thích; thí nghiệm phá hoại: chỉnh baud lệch 5% xem ký tự vỡ thành rác như thế nào. VMCU build-out: UART + ngắt TXE/RXNE. _Tiên quyết: Bài 7 (ngắt), Bài 8 (ring buffer)._

- **Bài 10 — ADC & thế giới tương tự** (`embedded-adc.html`): 10.1 Cầu nối analog→digital: nguyên lý SAR ADC — "cân nhị phân" so sánh dần từng bit; mạch sample & hold giữ điện áp đứng yên trong lúc cân; why: thế giới là analog liên tục, MCU chỉ nói chuyện bằng số · 10.2 Độ phân giải & LSB: 10-bit = 1024 mức; $V_{LSB} = V_{ref}/2^N$; công thức đổi mã ADC → volt; sai số lượng tử ±½LSB — cửa sổ mở sang Series 14 Bài 3 nơi lượng tử hoá được mổ xẻ đến nơi đến chốn · 10.3 Đọc ADC đúng cách: chờ cờ EOC bằng polling vs ngắt (vs DMA — Bài 11 ngay sau); thời gian lấy mẫu & trở kháng nguồn — tụ S&H cần thời gian nạp; pitfall: nguồn trở kháng cao/thời gian lấy mẫu ngắn → giá trị "mềm" trôi nổi khó hiểu · 10.4 Làm mượt tín hiệu: trung bình trượt & oversampling; trade-off độ trễ vs độ mượt; gọi đúng tên: moving average chính là FIR filter đơn giản nhất — sẽ học đàng hoàng ở Series 14 Bài 9 (cross-link 2 chiều) · 10.5 Thực hành: xoay biến trở trên bảng ảo — hai đồ thị raw vs moving-average chạy cạnh nhau; bật "nhiễu môi trường" mô phỏng thấy trung bình cứu thế nào; kéo số bit ADC xuống thấy bậc thang lượng tử. VMCU build-out: ADC 10-bit + nguồn nhiễu mô phỏng. _Tiên quyết: Bài 7 (ngắt EOC), Bài 2 (thanh ghi); Series 10 Điện Tử (điện áp, biến trở)._
- **Bài 11 — DMA: chuyển dữ liệu không cần CPU** (`embedded-dma.html`): 11.1 Bài toán: dòng dữ liệu ADC/UART tốc độ cao — CPU làm "cửu vạn" từng byte qua ISR, mỗi byte trả phí vào/ra ngắt (~12+12 cycle); đếm chi phí thật: ở tốc độ cao CPU chỉ còn đi khuân vác · 11.2 DMA controller — người khuân vác chuyên nghiệp: kênh, địa chỉ nguồn/đích, chế độ tăng địa chỉ, kích thước phần tử; ngoại vi "gõ cửa" DMA mỗi khi có dữ liệu (request); CPU chỉ nhận MỘT ngắt khi cả khối hoàn tất; when: dòng dữ liệu đều đặn tốc độ cao — không đáng cho vài byte lẻ tẻ · 11.3 Ping-pong (double buffering): DMA ghi buffer A trong khi CPU xử lý buffer B, hết khối thì hoán vai — xử lý streaming không rớt mẫu; why quan trọng: đây là kiến trúc chuẩn của audio/DSP thời gian thực (nối thẳng Series 14 Bài 14) · 11.4 Pitfall: đọc buffer đang được DMA ghi dở = torn data quy mô lớn (Bài 8.4 phiên bản khối); cache coherency trên MCU lớn — black-box 1 đoạn "MCU có cache cần invalidate trước khi đọc vùng DMA, ngoài phạm vi series" · 11.5 Thực hành: đồng hồ CPU-load ảo — cùng dòng ADC, so polling vs ngắt-từng-mẫu vs DMA ra con số % thật trên VMCU; ping-pong visualizer hai buffer đổi màu theo vai trò. VMCU build-out: DMA 1 kênh ADC→RAM + bộ đếm CPU-load. _Tiên quyết: Bài 10 (ADC làm nguồn dữ liệu), Bài 8 (torn read), Bài 9 (UART — nhắc DMA TX một đoạn)._
- **Bài 12 — Boot & bản đồ bộ nhớ chương trình** (`embedded-boot-memory-layout.html`): 12.1 Trước `main()` là gì: CPU reset → đọc 2 ô đầu vector table (SP khởi đầu + địa chỉ `Reset_Handler`) → copy `.data` từ Flash sang RAM → zero `.bss` → gọi `main()`; why: trả lời câu "biến toàn cục có giá trị đầu từ đâu ra khi RAM mất điện là trắng?" · 12.2 Các section — nhà của từng loại biến: `.text` (code, Flash), `.rodata` (hằng, Flash), `.data` (biến khởi tạo ≠ 0: giá trị chép từ Flash, sống ở RAM), `.bss` (biến = 0/chưa khởi tạo: chỉ chiếm RAM); bảng "khai báo nào rơi vào đâu"; pitfall: bảng tra cứu lớn quên `const` → nằm `.data` ngốn RAM thay vì nằm Flash · 12.3 Linker script — bản thiết kế bộ nhớ ở mức đọc-hiểu: khối MEMORY (ORIGIN/LENGTH) và SECTIONS; địa chỉ nạp (LMA) vs địa chỉ chạy (VMA) — chính là lý do tồn tại bước copy `.data` · 12.4 Stack & heap trong nhúng: stack mọc xuống từ đỉnh RAM, heap mọc lên sau `.bss`; vì sao firmware nghiêm túc né `malloc` (phân mảnh, thời gian không tất định, hết heap lúc 3 giờ sáng); pitfall chí mạng: KHÔNG có MMU — stack tràn ăn mòn `.bss` âm thầm, hệ "chạy tiếp mà dữ liệu sai"; kỹ thuật canary & watermark đo mực nước stack · 12.5 Thực hành: Memory Layout Visualizer — gõ từng kiểu khai báo xem nó rơi vào section nào (tô màu vùng nhớ); mô phỏng đệ quy sâu: nhìn stack tràn đâm vào `.bss` và biến toàn cục "tự nhiên" đổi giá trị; đọc stack watermark. VMCU build-out: bảng section + stack watermark. _Tiên quyết: Bài 1 (memory map), Bài 7 (vector table); Series C (phạm vi biến, con trỏ)._
- **Bài 13 — Super-loop vs Cooperative Scheduler** (`embedded-cooperative-scheduler.html`): 13.1 Trần của super-loop: 5–6 FSM cùng chạy + một việc nặng dần → chu kỳ quét phình, jitter tăng — định nghĩa & đo jitter; when quan trọng: super-loop vẫn là kiến trúc ĐÚNG cho đa số sản phẩm nhỏ — đừng vác RTOS đi giết ruồi (bảng tiêu chí khi nào cần nâng cấp) · 13.2 Cooperative scheduler: task = hàm chạy-đến-hết-lượt (run-to-completion), tự nhường CPU khi xong; bảng task {hàm, chu kỳ, hạn kế}; chữ "hợp tác" nghĩa là TIN mọi task không tham · 13.3 Viết scheduler 30 dòng: mảng struct `{fn, period, last}` + vòng lặp gọi task đến hạn — xây thẳng trên `millis()` Bài 4; đây là "hệ điều hành" đầu tiên bạn tự viết, và nhiều sản phẩm thương mại dừng ở đúng đây · 13.4 Pitfall trung tâm: một task tham (vòng lặp dài, delay ẩn) kéo trễ TẤT CẢ task khác; giải pháp không cần RTOS: chẻ việc dài thành FSM nhiều bước (Bài 5 trả cổ tức); đo worst-case execution time từng task · 13.5 Thực hành: 3 task (LED nhanh, LED chậm, quét nút) trên scheduler 30 dòng; bật "task tham" → LED khựng nhìn thấy + jitter vẽ trên timeline; chẻ task tham thành FSM → mượt trở lại. VMCU build-out: cooperative scheduler + đo jitter. _Tiên quyết: Bài 4 (millis), Bài 5 (FSM)._
- **Bài 14 — RTOS preemptive: context switch & task states** (`embedded-rtos-preemptive.html`): 14.1 Vì sao cần preemption: task hợp tác không nhường kịp cho deadline khẩn cấp; preemptive = scheduler CƯỚP CPU bất kỳ lúc nào; trade-off thẳng thắn: sức mạnh đổi bằng phức tạp — race condition quay lại, giờ giữa task với task (Bài 8 tái vũ trang) · 14.2 Context switch mổ xẻ: mỗi task một stack RIÊNG (Bài 12 trả nợ đúng hạn) + TCB lưu con trỏ stack; switch = lưu thanh ghi vào stack task cũ → đổi SP → khôi phục thanh ghi từ stack task mới; trên Cortex-M thật việc này chạy trong ngắt PendSV — black-box mức khái niệm có callout · 14.3 Task states: Ready / Running / Blocked (+ Suspended); điểm mấu chốt: Blocked KHÔNG tốn CPU — task "ngủ chờ sự kiện" khác hẳn busy-wait delay Bài 4; hàng đợi ready xếp theo priority · 14.4 Chính sách lập lịch: priority preemptive (chuẩn RTOS nhúng) + round-robin trong cùng mức; starvation — task thấp chết đói khi task cao không bao giờ ngủ; pitfall: đặt mọi task priority cao "cho chắc ăn" = tự tay biến hệ về round-robin, vô hiệu toàn bộ thiết kế · 14.5 Thực hành: mini-RTOS chạy trên VMCU — visualizer task states + stack từng task tô mực nước; KÉO priority ngay lúc chạy thấy preemption đổi hình trên timeline; thí nghiệm starvation và cách chữa (task cao phải ngủ). VMCU build-out: mini-RTOS preemptive (TCB, context switch mô phỏng). _Tiên quyết: Bài 12 (stack), Bài 13 (khái niệm task/scheduler), Bài 8 (race)._
- **Bài 15 — Đồng bộ RTOS: mutex, semaphore, queue & priority inversion** (`embedded-rtos-sync.html`): 15.1 Race trở lại, to hơn: hai task + preemption = RMW vỡ ở bất kỳ dòng nào; tắt ngắt kiểu Bài 8 giờ quá thô bạo — giết luôn cả lập lịch; cần công cụ mịn theo từng tài nguyên · 15.2 Semaphore: bộ đếm tài nguyên & còi báo sự kiện; pattern đẹp nhất: ISR give — task blocked take, thức dậy ĐÚNG LÚC không cần poll (thay thế cờ volatile Bài 8 bằng cơ chế chuẩn); binary vs counting · 15.3 Mutex: quyền SỞ HỮU — chỉ kẻ khoá được mở; khác semaphore ở ownership và priority inheritance; pitfall: lấy semaphore làm mutex — không có inheritance, mở toang cửa cho inversion · 15.4 Queue: gửi DỮ LIỆU chứ không chỉ tín hiệu; producer–consumer chuẩn RTOS; so với ring buffer Bài 8: queue = ring buffer + blocking + an toàn đa task — bảng khi nào dùng gì · 15.5 Priority inversion & Mars Pathfinder 1997: task thấp giữ mutex → task cao chờ → task TRUNG chen vào chạy dài → task cao trễ vô hạn, watchdog reset tàu trên sao Hoả thật; priority inheritance cứu thế nào (task thấp "mượn" priority cao tạm thời); deadlock: 4 điều kiện + quy tắc khoá theo thứ tự cố định · 15.6 Thực hành: DỰNG LẠI sự cố Mars Pathfinder trên VMCU — 3 task đúng kịch bản, nhìn inversion hiện nguyên hình trên timeline, bật priority inheritance → hết trễ, "cứu được tàu"; demo bonus: deadlock 2 mutex khoá chéo và cách phá. VMCU build-out: mutex (có inheritance bật/tắt được), semaphore, queue. _Tiên quyết: Bài 14 (task/preemption), Bài 8 (race/critical section)._
- **Bài 16 — Capstone: Trạm đo nhiệt độ hoàn chỉnh** (`embedded-capstone-datalogger.html`): 16.1 Đề bài & kiến trúc: cảm biến nhiệt (ADC) → lọc → hiển thị mức LED + cảnh báo buzzer + giao diện nút + báo cáo/điều khiển qua UART; sơ đồ task & luồng dữ liệu qua queue; ngân sách tài nguyên: RAM, stack từng task (dựa watermark Bài 12) · 16.2 Tầng thu thập: ADC + DMA ping-pong (Bài 10–11), task xử lý nhận khối qua queue (Bài 15); lọc trung bình trượt; hiệu chuẩn raw → °C với hệ số thật · 16.3 Tầng ứng dụng: FSM UI — nút nhấn chuyển chế độ xem/đặt ngưỡng, long-press từ Bài 5; vượt ngưỡng → buzzer 2 tông từ Bài 6; giao thức UART đọc log/đặt tham số từ Bài 9 · 16.4 Độ bền & đo đạc: CPU load bằng idle-task counter; stack watermark từng task; watchdog — outlook 1 đoạn có callout; low-power: WFI khi idle + đồng hồ năng lượng mô phỏng thấy pin "dài ra" · 16.5 Thực hành: toàn hệ chạy trên Bảng Mạch Ảo — người đọc thao tác như thiết bị thật (xoay biến trở giả nhiệt độ, đặt ngưỡng, xem log UART); checklist tự đánh giá + phụ lục "port sang board STM32 thật khác gì" từng bước. _Tiên quyết: tổng hợp Bài 1–15; dùng đậm nhất: 5, 6, 9, 10, 11, 14, 15._

## Series 14 — Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ

> Format theo chuẩn series AI (12). Mỗi bài kết thúc bằng "Trắc nghiệm ôn tập"; mỗi bài
> có snippet NumPy/SciPy đối chiếu (bài filter thêm CMSIS-DSP). Công thức KaTeX giữ quy
> tắc `\text{}` chỉ ASCII. Trạng thái: **HOÀN CHỈNH 15/15 bài** (2026-07-11).

- **Bài 1 — Tín hiệu là gì: từ liên tục đến số** (`dsp-signals.html`): 1.1 Tín hiệu = hàm mang thông tin: âm thanh là áp suất theo thời gian, ảnh là độ sáng theo toạ độ, cảm biến là điện áp theo thời gian; ba nấc: liên tục $x(t)$ → rời rạc $x[n]$ (rời thời gian) → số (rời cả biên độ); why: gọi đúng tên loại tín hiệu là bước đầu của mọi pipeline · 1.2 Dàn nhân vật chính: xung đơn vị $\delta[n]$ — "viên gạch" sẽ mở khoá mọi hệ LTI ở Bài 4 (gieo mầm rõ ràng), bậc thang $u[n]$, sin/cos rời rạc, chirp, nhiễu trắng; pitfall ngược trực giác: sin rời rạc KHÔNG phải lúc nào cũng tuần hoàn — chỉ khi $\omega/2\pi$ hữu tỉ · 1.3 Năng lượng vs công suất; thang decibel — vì sao log (tai người cảm nhận theo tỉ lệ + dải động 120dB); quy ước chuẩn hoá biên độ $[-1, 1]$ trong audio số · 1.4 Tín hiệu số sống trong máy thế nào: `Float32Array`; sample rate chỉ là NHÃN gắn kèm mảng — cùng mảng số, đổi nhãn fs là đổi cao độ (thí nghiệm nghe chipmunk effect ngay) · 1.5 Thực hành: Signal Generator Playground — ghép sine + nhiễu + chirp, VẼ và NGHE tức thì; đổi nhãn fs nghe giọng sóc chuột. DSPJS build-out: generators (sine/square/chirp/noise) + player Web Audio. _Tiên quyết: Series JS (mảng, hàm); Series 8 Web Audio (AudioContext mức sử dụng)._
- **Bài 2 — Lấy mẫu, Nyquist & Aliasing** (`dsp-sampling-aliasing.html`): 2.1 Lấy mẫu: $x[n] = x(nT)$, chu kỳ mẫu $T = 1/f_s$; trực giác "chụp ảnh liên tiếp"; câu hỏi trung tâm của cả chương: chụp thưa đến đâu thì bắt đầu MẤT thông tin? · 2.2 Định lý Nyquist–Shannon: $f_s > 2 f_{max}$; xây trực giác bằng bánh xe stroboscope trước, toán sau (tối thiểu 2 mẫu/chu kỳ); tần số Nyquist $f_s/2$ là "bức tường" của thế giới số · 2.3 Aliasing — kẻ mạo danh: tần số vượt tường gập xuống thành tần số thấp giả; phổ gương & công thức tần số alias; đời thực: cánh quạt quay ngược trong phim, vân moiré khi chụp màn hình, tiếng rít lạ khi resample ẩu; pitfall: "đúng bằng 2× là đủ" — tại biên mất biên độ/pha, thực tế cần guard band (44.1kHz cho tai 20kHz là có lý do) · 2.4 Anti-aliasing: PHẢI lọc analog TRƯỚC khi lấy mẫu — một khi đã alias là trộn vĩnh viễn, không phần mềm nào gỡ được; nối Series 10 (mạch lọc RC) và Series 13 Bài 10 (ADC); oversampling nới lỏng yêu cầu filter analog (khái niệm) · 2.5 Thực hành: Aliasing Stroboscope — kéo tần số nguồn qua Nyquist, THẤY chấm quay đảo chiều và NGHE sweep gập xuống; demo phụ: downsample ảnh không lọc thấy moiré nở ra. DSPJS build-out: sampler + alias frequency calculator. _Tiên quyết: Bài 1._
- **Bài 3 — Lượng tử hoá & dải động** (`dsp-quantization.html`): 3.1 Trục thứ hai bị rời rạc: biên độ về $2^B$ mức, làm tròn về mức gần nhất; sai số $e[n] \in [-\tfrac{1}{2}LSB, +\tfrac{1}{2}LSB]$; nối trực tiếp Series 13 Bài 10 — ADC chính là kẻ lượng tử hoá · 3.2 Nhiễu lượng tử & quy tắc 6dB/bit: mô hình sai số như nhiễu trắng phân bố đều; $SQNR \approx 6.02B + 1.76\,dB$ — giải nghĩa từng hằng số chứ không thả công thức; 16-bit CD ≈ 98dB — đủ cho tai ở phòng yên · 3.3 Dải động & headroom: thang dBFS; clipping — pitfall: méo cứng do tràn thang nghe TỆ HƠN nhiều so với sàn nhiễu lượng tử, ưu tiên chừa headroom; gain staging nhập môn · 3.4 Dithering — cố tình thêm nhiễu để bớt méo: ở mức tín hiệu nhỏ, sai số lượng tử tương quan với tín hiệu thành méo hài khó chịu; dither phá tương quan đổi méo lấy nhiễu đều dễ chịu; when: CHỈ khi giảm bit depth (master 24→16) · 3.5 Thực hành: kéo bit depth 16→8→4→2 NGHE nhạc vỡ dần; histogram sai số + SQNR đo thật đối chiếu công thức từng mức bit; bật/tắt dither ở 4-bit nghe khác biệt rõ. DSPJS build-out: quantize + dither. _Tiên quyết: Bài 1–2; Series 13 Bài 10 (đọc thêm)._
- **Bài 4 — Hệ LTI, tích chập & đáp ứng xung** (`dsp-lti-convolution.html`): 4.1 Hệ (system) & hai tính chất vàng: tuyến tính (scale và cộng đi qua được) + bất biến thời gian (hôm nay xử lý giống hôm qua); bài kiểm tra nhanh: echo có LTI không (có), distortion guitar (không — phi tuyến), AGC (không — biến thời gian); why: LTI là lớp hệ duy nhất ta phân tích TRỌN VẸN được bằng một công cụ · 4.2 Đáp ứng xung $h[n]$: đưa viên gạch $\delta[n]$ (Bài 1 trả cổ tức) vào xem hệ trả lời gì; định lý trung tâm: $h[n]$ đặc trưng trọn vẹn hệ LTI — biết h là biết tất cả · 4.3 Tích chập $y[n] = \sum_k x[k]\,h[n-k]$: XÂY từ nguyên lý xếp chồng — mỗi mẫu vào là một bản sao h được scale + dịch, cộng dồn lại; thuật toán lật-dịch-nhân-cộng làm tay trên ví dụ 4 mẫu TRƯỚC khi tổng quát (quy tắc concrete→abstract); độ phức tạp O(N·M) — gieo mầm fast convolution Bài 6 · 4.4 Tính chất & hệ quả kiến trúc: giao hoán/kết hợp/phân phối → ghép nối tiếp = chập các h, song song = cộng h; pitfall: độ dài kết quả là $N+M-1$ — cấp phát thiếu là cắt cụt đuôi reverb · 4.5 Thực hành: Convolution Stepper — bấm từng n xem lật-dịch-nhân-cộng sống động; convolution reverb: chập giọng nói với đáp ứng xung phòng hoà nhạc thật (file IR vendored) — NGHE giọng mình "bước vào nhà thờ". DSPJS build-out: conv trực tiếp. _Tiên quyết: Bài 1._
- **Bài 5 — DFT: cửa sổ nhìn sang miền tần số** (`dsp-dft.html`): 5.1 Câu hỏi "trong tín hiệu có những tần số nào?": ý tưởng SO KHỚP — nhân tín hiệu với từng sinusoid dò rồi cộng (correlation); DFT chính là N phép so khớp xếp thành bảng · 5.2 Công thức $X[k] = \sum_n x[n] e^{-j2\pi kn/N}$: giải phẫu từng ký hiệu một; số phức nhập môn đúng liều — một số gói cả biên độ lẫn pha (không yêu cầu background, dạy đủ dùng); bin k ứng tần số $k \cdot f_s/N$ · 5.3 Độ phân giải tần số $f_s/N$: muốn phân biệt 2 tone cách nhau 1Hz phải quan sát ≥1 giây — không có bữa trưa miễn phí; trade-off dài–mịn (gieo mầm STFT Bài 8) · 5.4 Phổ của tín hiệu thực: đối xứng liên hợp — chỉ N/2 bin mang tin mới; phổ biên độ vs phổ pha; pitfall: vứt pha đi là mất dạng sóng — thí nghiệm tráo pha 2 tín hiệu nghe "ma quái" · 5.5 Tự viết DFT 15 dòng + verify: chạy trên sine biết trước phải ra đúng bin; ĐO thời gian N=4096 → "chậm không chấp nhận được" — cliffhanger sang FFT · 5.6 Thực hành: DFT Explorer — VẼ tín hiệu tự do bằng chuột thấy phổ tức thì; click một bin thấy sinusoid nó đại diện overlay lên tín hiệu gốc. DSPJS build-out: dft + complex helpers. _Tiên quyết: Bài 1, 2 (fs), 4 (correlation cùng họ tích chập)._
- **Bài 6 — FFT: thuật toán thay đổi thế giới** (`dsp-fft.html`): 6.1 Chia để trị: DFT N điểm tách thành 2 DFT N/2 (mẫu chẵn/lẻ) + N phép "vá" bằng twiddle factor; đệ quy đến đáy → $O(N \log N)$; bảng đếm phép nhân N=1024: một triệu vs mười nghìn — một trăm lần · 6.2 Butterfly & bit-reversal: cấu trúc cánh bướm 2-vào-2-ra; sơ đồ đầy đủ N=8 vẽ từng stage; vì sao input phải xáo trộn theo bit đảo — không phải phép thuật mà là hệ quả của đệ quy chẵn/lẻ · 6.3 Cài đặt radix-2 in-place: từ đệ quy sang 3 vòng lặp; VERIFY bắt buộc: FFT ≡ DFT từng con số (sai số < 1e-10, in ra bảng đối chiếu — kỷ luật verified của series AI); pitfall: N phải là luỹ thừa 2; zero-padding — nội suy phổ mượt hơn nhưng KHÔNG thêm thông tin mới · 6.4 FFT nhanh đến đâu trên máy BẠN: benchmark sống theo N; bản đồ phủ sóng: MP3, JPEG, OFDM/5G, MRI — "thuật toán quan trọng nhất thế kỷ 20" không phải nói quá; outlook: fast convolution — chập dài bằng FFT→nhân→iFFT (trả lời gieo mầm Bài 4) · 6.5 Thực hành: Butterfly Diagram tương tác — bấm từng stage nhìn dữ liệu chảy và twiddle xoay; đồng hồ benchmark DFT vs FFT chạy trên máy người đọc. DSPJS build-out: fft/ifft radix-2 (verified vs dft). _Tiên quyết: Bài 5._
- **Bài 7 — Rò rỉ phổ & hàm cửa sổ** (`dsp-windowing.html`): 7.1 Hiện tượng lạ: sine 1000.5Hz (rơi GIỮA hai bin) → năng lượng "loang" ra khắp phổ; truy nguyên: DFT ngầm coi khung là tuần hoàn — mép nối bị gãy tạo năng lượng giả · 7.2 Nhìn qua lăng kính toán: cắt khung hữu hạn = nhân với cửa sổ chữ nhật = CHẬP phổ với sinc (main lobe + side lobes) — leakage giải thích trọn bằng một hình · 7.3 Bộ sưu tập cửa sổ: rect / Hann / Hamming / Blackman — bảng so main-lobe width vs side-lobe level; trade-off phân giải ↔ dải động; when chọn gì: tách 2 tone gần nhau (cửa sổ hẹp lobe), tìm tone yếu cạnh tone mạnh (side-lobe thấp — Blackman), đa dụng hằng ngày (Hann) · 7.4 Pitfall đo lường: cửa sổ "ăn" mất năng lượng — phải bù hệ số (coherent gain); quên bù → mọi phép đo biên độ sai hệ thống một hằng số · 7.5 Thực hành: hai tone 1000Hz & 1003Hz chênh 40dB — đổi cửa sổ thấy tone yếu HIỆN ra rồi LẶN mất; bảng cửa sổ tương tác vẽ shape + phổ từng loại. DSPJS build-out: windows (rect/hann/hamming/blackman) + gain compensation. _Tiên quyết: Bài 5, 6._
- **Bài 8 — STFT & Spectrogram** (`dsp-stft-spectrogram.html`): 8.1 Phổ của bản nhạc thay đổi theo thời gian — DFT cả bài trộn mọi nốt thành một đống; giải pháp tự nhiên: cắt khung ngắn, FFT từng khung, xếp cột theo thời gian = STFT; spectrogram = ảnh nhiệt |STFT| · 8.2 Nguyên lý bất định thời gian–tần số: khung dài mịn tần số nhưng mù thời gian, khung ngắn ngược lại; $\Delta t \cdot \Delta f \geq const$ — cùng họ với nguyên lý Heisenberg; không có cửa sổ hoàn hảo, chỉ có phù hợp bài toán · 8.3 Khung chồng lấp & hop size: cửa sổ Hann giết mép khung — overlap 50–75% để không rơi tín hiệu (điều kiện COLA ở mức khái niệm); hop nhỏ = mượt trục thời gian, trả giá bằng tính toán · 8.4 Đọc spectrogram như đọc chữ: formant nguyên âm, dãy hài nhạc cụ, vệt dọc percussive vs vệt ngang tonal; pitfall: quên đổi sang dB — spectrogram tuyến tính nhìn "toàn đen" tưởng demo hỏng (quy tắc simulator: giải thích trạng thái boring) · 8.5 Thực hành: Spectrogram realtime từ mic — huýt sáo VẼ CHỮ lên màn hình bằng cao độ; kéo window size thấy trade-off sống; mini-game nhận diện nguyên âm a/i/u qua formant. DSPJS build-out: stft + colormap dB. _Tiên quyết: Bài 6, 7._
- **Bài 9 — Filter FIR: từ trung bình trượt đến windowed-sinc** (`dsp-fir-filters.html`): 9.1 Filter = hệ LTI có chủ đích; FIR: $h[n]$ hữu hạn, $y = x * h$ — Bài 4 trả cổ tức nguyên vẹn; filter đầu tiên của mọi người: moving average — mượt thật nhưng đáp ứng tần số hình sinc lởm chởm, chặn dải kém (nối Series 13 Bài 10 đã dùng nó!) · 9.2 Thiết kế từ mơ ước: low-pass LÝ TƯỞNG = gạch chữ nhật trong miền tần số → nghịch đảo là sinc vô hạn hai chiều, không nhân quả; đường ra thực dụng: cắt + dịch + CỬA SỔ (Bài 7 tái xuất đúng vai) = windowed-sinc; số tap ↔ độ dốc dải chuyển tiếp · 9.3 Linear phase — món quà của đối xứng: h đối xứng → mọi tần số trễ ĐỀU nhau (group delay hằng $(N-1)/2$); why quý giá: dạng sóng không méo, chỉ trễ; when FIR thắng IIR: mastering audio, đo lường, filter bank — nơi pha là vàng · 9.4 Biến hình từ low-pass: high-pass bằng spectral inversion, band-pass bằng dịch tần (nhân cos); pitfall: filter càng "gắt" càng dài → trễ càng lớn — realtime khó chịu, gieo mầm IIR Bài 11 · 9.5 Thực hành: FIR Designer — kéo cutoff & số tap, thấy $h[n]$ + $|H|$ đổi theo và NGHE trên nhạc; thí nghiệm chứng minh linear phase: sóng vuông qua FIR đối xứng giữ nguyên dạng (đối chứng với IIR ở Bài 11). DSPJS build-out: firDesign (lowpass/highpass/bandpass windowed-sinc). _Tiên quyết: Bài 4 (tích chập), 5 (đáp ứng tần số), 7 (cửa sổ)._
- **Bài 10 — Z-transform & mặt phẳng z** (`dsp-z-transform.html`): 10.1 Vì sao cần công cụ mới: FIR xong xuôi bằng DTFT, nhưng hệ ĐỆ QUY (feedback — đầu ra quay lại đầu vào) cần khung tổng quát hơn; $X(z) = \sum x[n] z^{-n}$; ký hiệu $z^{-1}$ = "trễ 1 mẫu" trong sơ đồ khối — ngôn ngữ chung của mọi datasheet DSP · 10.2 Hàm truyền $H(z) = B(z)/A(z)$: từ phương trình sai phân sang H(z) trong 3 bước cơ học; zero = nghiệm tử số, pole = nghiệm mẫu số — tên gọi thành hình ảnh · 10.3 Hình học kể chuyện: $|H(e^{j\omega})|$ = tích khoảng cách tới các zero ÷ tích khoảng cách tới các pole; quét tần số = đi bộ quanh vòng tròn đơn vị; zero TRÊN vòng tròn = notch khoét tần số, pole GẦN vòng tròn = cộng hưởng vống lên — đọc đáp ứng tần số bằng MẮT không cần tính · 10.4 Ổn định: mọi pole trong vòng tròn đơn vị; pole ngoài = tăng trưởng mũ (filter "nổ"); pole ĐÚNG TRÊN vòng = dao động tự duy trì — chính là cách làm oscillator số; ROC nhắc một đoạn khái niệm, không sa lầy · 10.5 Thực hành: RA MẮT FLAGSHIP Pole–Zero Filter Lab — kéo pole/zero NGHE nhạc đổi tính cách tức thì; chế oscillator bằng cặp pole đặt trên vòng tròn; thí nghiệm nghịch: kéo pole ra ngoài nghe filter nổ (auto-mute bảo vệ tai). DSPJS build-out: zplane (freqRespFromPZ, polyFromRoots). _Tiên quyết: Bài 5 (phổ, số phức), 9 (khái niệm filter)._
- **Bài 11 — Filter IIR & Biquad** (`dsp-iir-biquad.html`): 11.1 IIR — sức mạnh của feedback: đáp ứng xung vô hạn từ vài hệ số; 2 pole làm việc mà FIR cần cả trăm tap; cái giá sòng phẳng: pha phi tuyến + rủi ro mất ổn định; bảng FIR vs IIR — chọn phe theo bài toán · 11.2 Biquad — viên gạch chuẩn công nghiệp: bậc 2 (2 pole, 2 zero); Direct Form I vs II vs II-Transposed — vì sao DF2T thắng trên dấu phẩy động (nhiễu số học thấp); phương trình sai phân + sơ đồ khối từng dạng · 11.3 RBJ Audio EQ Cookbook: công thức lowpass/highpass/bandpass/notch/peaking/shelf từ bộ ba $(f_0, Q, gain)$; Q là gì bằng tai (độ nhọn cộng hưởng); bilinear transform 1 đoạn khái niệm — cây cầu analog→digital, có frequency warping (callout black-box) · 11.4 Filter bậc cao = cascade biquad: Butterworth bậc 4 = 2 biquad nối tiếp; vì sao KHÔNG dùng một đa thức bậc cao (hệ số nhạy kinh khủng); pitfall: lượng tử hệ số đẩy pole sát vòng tròn trượt ra ngoài — filter Q cao "nổ" trên số học kém chính xác (nối sang Bài 14 Q15) · 11.5 Thực hành: Biquad Cookbook Playground — chọn loại filter, kéo $f_0$/Q/gain NGHE realtime qua AudioWorklet, pole/zero di chuyển live trên z-plane (tái dùng flagship); thí nghiệm đối chứng Bài 9: sóng vuông qua IIR méo dạng thấy rõ. DSPJS build-out: biquad DF2T + RBJ cookbook. _Tiên quyết: Bài 10 (pole/zero), 9 (FIR làm đối chứng)._
- **Bài 12 — Resampling & xử lý đa tốc độ** (`dsp-resampling.html`): 12.1 Bài toán đổi sample rate: 48k↔44.1k (video↔CD), 96k→16k (ASR/ML — nối Series 12 AI); cách "ngây thơ" bỏ mẫu cách quãng = lấy mẫu lại thưa hơn → aliasing tức thì (Bài 2 quay lại đòi nợ) · 12.2 Decimation ↓M: LỌC TRƯỚC cắt sau — low-pass chặn trên $f_s/(2M)$ rồi mới giữ 1 mẫu mỗi M; Interpolation ↑L: chèn L−1 số 0 (ảnh phổ lặp lại) rồi lọc sạch ảnh; tỉ lệ hữu tỉ L/M: lên trước xuống sau, một filter chung — 44.1↔48 chính là 147/160 · 12.3 Polyphase — đừng nhân với số 0: phần lớn phép nhân rơi vào mẫu-sắp-vứt hoặc số-0-vừa-chèn; tách filter thành các nhánh pha chỉ tính thứ cần; bảng đếm phép nhân tiết kiệm; trình bày mức sơ đồ + trực giác, không code đầy đủ (callout giới hạn phạm vi) · 12.4 Resampling quanh ta: ảnh cũng y hệt — Lanczos chính là windowed-sinc 2 chiều (cross-link Image Optimizer + series Canvas); nghe artifacts của resampler rẻ tiền trên sweep · 12.5 Thực hành: Resampler A/B — cùng đoạn nhạc đi đường "ngây thơ" vs "chuẩn", nghe và soi phổ trước/sau; sơ đồ polyphase động minh hoạ mẫu nào thật sự được tính. DSPJS build-out: resample (rational L/M). _Tiên quyết: Bài 2 (aliasing), 9 (FIR)._
- **Bài 13 — Phát hiện cao độ: autocorrelation & tuner** (`dsp-pitch-detection.html`): 13.1 Pitch KHÔNG phải đỉnh FFT to nhất: nhạc cụ thật là chồng hài — đỉnh to nhất có thể là hài bậc 2, 3; hiện tượng missing fundamental (tai vẫn nghe nốt trầm dù tần số cơ bản vắng mặt); pitch = chu kỳ lặp của dạng sóng, đo trong miền THỜI GIAN · 13.2 Autocorrelation: tín hiệu tự so với chính nó trễ đi $\tau$; đỉnh tại $\tau$ = đúng một chu kỳ; họ hàng tích chập → tính nhanh bằng FFT (Bài 6 trả cổ tức lần hai); pitfall: đỉnh bội — nhầm chu kỳ gấp đôi thành lỗi lệch quãng tám (octave error) · 13.3 YIN — bản vá cho nhạc thật: difference function thay vì tích, chuẩn hoá trung bình tích luỹ (CMND) dìm đỉnh giả, ngưỡng tuyệt đối chọn đỉnh ĐẦU TIÊN đủ tốt thay vì đỉnh to nhất; trình bày trực giác + công thức, không sa lầy chứng minh · 13.4 Chính xác dưới-mẫu & đổi sang nốt: nội suy parabol quanh đỉnh cho độ phân giải vượt lưới mẫu; công thức cent: $1200 \log_2(f/f_{ref})$ — vì sao tai chia quãng tám thành 1200 phần đều theo log · 13.5 Thực hành: Guitar/Voice Tuner chạy MIC THẬT — kim chỉ nốt + độ lệch cent realtime; chế độ "soi nội tạng": xem difference function và vị trí ngưỡng cắt ngay khi đang hát. DSPJS build-out: autocorr (qua FFT) + yinDiff + parabolic refine. _Tiên quyết: Bài 4 (correlation), 6 (FFT), 8 (xử lý theo khung realtime)._
- **Bài 14 — DSP thời gian thực & trên phần cứng nhúng** (`dsp-realtime-embedded.html`): 14.1 Ngân sách thời gian thực: block 128 mẫu @ 48kHz = 2.67ms phải xử lý XONG, không thương lượng; trễ tổng = trễ block + trễ filter; miss deadline = click/dropout — NGHE thử tiếng miss deadline cố ý; trade-off block to (hiệu quả) vs block nhỏ (trễ thấp) · 14.2 Sample-by-sample vs block processing: cấu trúc process(block) và STATE của biquad phải sống qua ranh giới block; pitfall kinh điển: reset state mỗi block → click chu kỳ đều đặn (demo nghe được, người mới dính 100%) · 14.3 Fixed-point Q15: MCU không FPU nhân float bằng phần mềm chậm gấp chục lần; Q15 = int16 với dấu phẩy tưởng tượng — nhân là `(a*b)>>15`, phải saturate; cái giá: nhiễu lượng tử HỆ SỐ + nguy cơ tràn — nối pitfall pole-trượt Bài 11 · 14.4 Thế giới thật: đối chiếu `arm_biquad_cascade_df1_q15` của CMSIS-DSP với code tự viết từng tham số; CROSS-OVER: chạy biquad trên VMCU của Series 13 với đồng hồ cycle ảo — đếm ngân sách cycle cho 1 mẫu, thấy vì sao Q15 tồn tại · 14.5 Thực hành: A/B float vs Q15 cùng một filter — nghe + đo SNR chênh lệch; kéo block size nhìn latency đổi trên đồng hồ; VMCU chạy filter 1 kênh với cycle counter sống. DSPJS build-out: q15 sim (mul/sat). _Tiên quyết: Bài 11 (biquad); Series 13 (khuyến khích — demo VMCU tự chạy, không bắt buộc hiểu firmware)._
- **Bài 15 — Capstone: Trạm Âm Thanh DSP hoàn chỉnh** (`dsp-capstone-station.html`): 15.1 Kiến trúc DSP Station: đồ thị xử lý nguồn → noise gate → EQ 5 băng → soft-limiter → ra loa, kèm spectrogram + tuner chạy song song nhánh phân tích; kiến trúc code: mỗi khối một class có `process(block)` — bài học kiến trúc phần mềm DSP thật · 15.2 EQ 5 băng từ biquad cascade: low-shelf, 3 peaking, high-shelf (Bài 11 tổng động viên); vẽ đáp ứng TỔNG bằng nhân các $H(z)$ (Bài 10); preset bass-boost/vocal/hall và vì sao chúng có hình dạng đó · 15.3 Noise gate: envelope follower (attack/release), ngưỡng mở/đóng có hysteresis — chính là FSM (chào Series 13 Bài 5!); pitfall: attack chậm nuốt phụ âm đầu, release nhanh gây "thở" · 15.4 Gain staging & chống clip xuyên chuỗi: theo dõi headroom qua từng khối; soft-clip vs hard-clip — nghe khác nhau thế nào; meter peak/RMS đúng chuẩn · 15.5 Thực hành: DSP Station hoàn chỉnh — mic/nhạc thật đi qua toàn chuỗi realtime (AudioWorklet), mọi khối bật/tắt A/B riêng; checklist tự đánh giá; bản đồ học tiếp: adaptive filter, wavelet, audio ML (nối Series 12 AI — spectrogram làm input CNN). _Tiên quyết: tổng hợp Bài 1–14; dùng đậm nhất: 8, 10, 11, 13._

# 🏅 PHẦN IV — TIÊU CHUẨN CHẤT LƯỢNG NỘI DUNG (Content Quality Contract)

> **Ưu tiên chất lượng hơn số lượng bài.** Một bài chỉ được coi là "xong" khi đạt **toàn bộ** rubric dưới đây. Thà ít bài mà mỗi bài sâu — đủ thông tin, đủ ví dụ, đủ liên kết, đủ chú thích — còn hơn nhiều bài hời hợt. Tiêu chuẩn này áp cho cả 9 series.

## 1. Triết lý mỗi mục H2: trả lời đủ 4 câu hỏi

Mỗi mục H2 KHÔNG chỉ mô tả "cái gì". Phải bao trùm:

1. **Cái gì (What)** — định nghĩa chính xác, đặt trong ngữ cảnh.
2. **Tại sao (Why)** — vì sao tồn tại / vì sao quan trọng / vấn đề nó giải quyết.
3. **Khi nào (When)** — khi nào dùng, khi nào KHÔNG nên dùng, đánh đổi (trade-off).
4. **Cạm bẫy (Pitfall)** — lỗi thường gặp, hiểu nhầm phổ biến, edge case → đưa vào `.callout--pitfall`.

## 2. Rubric định lượng tối thiểu / 1 bài học

| Hạng mục                     | Mức tối thiểu                                     | Ghi chú                                      |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------- |
| Mục H2 chuyên sâu            | **≥ 4** (bài nền tảng), **≥ 5** (bài chính/dự án) | Theo đề cương Phần III; được phép nhiều hơn. |
| Độ dài nội dung/bài          | **≥ 1.200 từ mỗi ngôn ngữ** (EN & VI tương đương) | Không nhồi chữ — sâu thật.                   |
| Ví dụ code chạy được         | **≥ 4 `.code-window`**                            | Mỗi mục cốt lõi ≥1 ví dụ; xem §3.            |
| Visualizer / sơ đồ           | **≥ 1** demo tương tác **hoặc** sơ đồ SVG/canvas  | Bài dự án bắt buộc demo tương tác.           |
| Callout chú thích            | **≥ 3** (tối thiểu 1 `--pitfall`)                 | Xem §5.                                      |
| Bảng so sánh                 | **≥ 1** khi có khái niệm đối lập                  | vd merge vs rebase, Euler vs Verlet.         |
| Liên kết nội bộ (cross-link) | **≥ 3** inline + prev/next + related              | Xem §4.                                      |
| Tài liệu tham khảo ngoài     | **≥ 3** link (MDN/spec/caniuse/paper)             | Khối `.article-refs`.                        |
| Thuật ngữ glossary           | Mọi thuật ngữ mới có `<abbr>` lần đầu             | Định nghĩa đầy đủ ở hub.                     |
| Quiz                         | **≥ 3 câu** (`ide.js`) + giải thích đáp án        | Có feedback đúng/sai.                        |
| File code tải về             | **≥ 1** file co-located                           | Link "Tải file code thực hành".              |

## 3. "Đủ ví dụ" — quy tắc ví dụ

- Mỗi khái niệm trừu tượng → **≥ 1 ví dụ cụ thể, tối giản, chạy được** trong `.code-window` (có `.code-filename`, nút copy, Prism highlight).
- Khái niệm dễ sai → kèm **phản-ví-dụ (anti-pattern)** đánh dấu rõ "❌ Sai" và "✅ Đúng" cạnh nhau.
- Ví dụ **tăng dần độ phức tạp**: tối giản → thực tế → tối ưu (đừng nhảy thẳng vào bản phức tạp).
- Với bài chạy được JS thuần: thêm **`js-playground`** để người đọc tự sửa & chạy.
- Code phải **tự giải thích được khi đọc rời** (xem §5 — chú thích trong code).

## 4. "Đủ liên kết" — chiến lược liên kết

**Nội bộ (bắt buộc):**

- `prev`/`next` + khối `.article-related` (đã có sẵn).
- **Cross-link inline** tới bài liên quan trong **cùng** và **khác** series, ngay tại đoạn nhắc khái niệm. Bản đồ liên kết chéo gợi ý:

| Từ series               | Liên kết tới                                    | Vì khái niệm chung                              |
| ----------------------- | ----------------------------------------------- | ----------------------------------------------- |
| WebGPU · Compute Shader | WASM · Đa luồng; DSA · Pathfinding              | Song song hoá / GPGPU                           |
| WASM · SIMD/Threading   | Canvas · Pixel; WebGL · Performance             | Tối ưu pixel/vector                             |
| Toy JS Engine           | JS · Engine & Execution; JS · Scope             | Call stack, closure, AST                        |
| DSA · Hash/B-Tree       | SQL · Index & Query Plan; C · Data Structures   | B-Tree, hashing                                 |
| Web Audio · FFT         | Canvas · Data Visualization; WebGPU · Particles | Vẽ phổ, reactive                                |
| CSS · Transform 3D      | WebGL · Coordinate & Math                       | Ma trận biến đổi                                |
| Git · Object Model      | C · Pointers; DSA · Huffman                     | DAG, content-address, nén                       |
| Điện tử · Logic/MCU     | VLSI · RTL/FPGA; C · Pointers                   | Cổng logic mức vật lý vs RTL, memory-mapped I/O |
| VLSI · VeriLite engine  | DSA · Graph                                     | Event scheduler, critical path                  |
| AI · Tensor engine      | WebGPU · Compute Shader; WASM · SIMD            | Matmul, vectorization, GPU                      |
| AI · Backprop/autograd  | DSA · Graph (topo sort); Toy JS Engine · AST    | Computation graph, duyệt đồ thị                 |
| AI · MNIST/CNN          | Canvas · Pixel & ImageData                      | Đọc/vẽ pixel, tiền xử lý ảnh                    |
| AI · Embedding/PCA      | DSA · Độ phức tạp; SQL · FTS5 (BM25)            | Vector hoá, đo tương đồng, tìm kiếm ngữ nghĩa   |

**Ngoài (nâng cấp mới):** khối `.article-refs` cuối bài, **≥ 3** nguồn uy tín (MDN, WHATWG/W3C spec, caniuse, paper gốc như SPH/Huffman). Bắt buộc `target="_blank" rel="noopener noreferrer"`; ghi rõ tên nguồn, không dán URL trần.

## 5. "Đủ chú thích" — các lớp annotation

1. **Chú thích trong code:** comment song ngữ cho dòng quan trọng; con trỏ/biến/bước thuật toán phải được giải thích. Không để code "câm".
2. **Callout boxes** (`.callout--note/tip/warning/pitfall/deep`): tách lưu ý, mẹo, cảnh báo, cạm bẫy, và phần đào sâu nâng cao ra khỏi luồng chính.
3. **`<abbr title="…">`** cho thuật ngữ viết tắt/chuyên ngành ở lần đầu xuất hiện.
4. **Glossary** EN–VI ở trang hub series.
5. **Chú thích công thức:** mỗi công thức toán kèm 1 câu giải nghĩa từng ký hiệu. **Render bằng KaTeX local (đã chốt — Phần II §1):** `$…$` cho inline, `$$…$$` cho block. Áp cho mọi series có công thức, đặc biệt WebGPU, WASM SIMD, DSA.

## 6. Micro-template cho MỖI mục H2

```
<h2> N. Tiêu đề mục </h2>
  → Đoạn dẫn: What + Why (2–4 câu)
  → ≥1 .code-window ví dụ (kèm comment) HOẶC sơ đồ
  → Giải thích When + trade-off
  → .callout (pitfall/tip) nếu hợp
  → Cross-link inline tới bài liên quan
```

## 7. Độ phủ rộng (Breadth) — không bỏ sót

- Mỗi series phải phủ **từ nền tảng → nâng cao → một dự án tổng hợp** (đã phản ánh ở Phần III).
- Trong mỗi bài, phủ đủ: **lý thuyết + ví dụ + cạm bẫy + hiệu năng/đánh đổi + ứng dụng thực tế**.
- Ưu tiên **đào sâu một khái niệm đến tận cơ chế** (như series cũ: cache locality, RVO/NRVO, TDZ) hơn là liệt kê nông nhiều khái niệm.

## 8. Definition of Done bổ sung (gộp vào checklist Phần II §3)

> Đã chuyển vào [`check-lesson.md`](check-lesson.md) PHẦN C1 (mục "Đếm rubric tối thiểu").
> Rubric định lượng đầy đủ vẫn ở §2 phía trên (bảng số liệu — giữ nguyên tại đây vì là nội
> dung thiết kế, không phải quy tắc QA thuần).
