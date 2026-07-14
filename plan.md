# Kế Hoạch & Lộ Trình Phát Triển Các Series Bài Học Mới — js-tools.org

Tài liệu này cung cấp **định hướng chi tiết, ngăn xếp công nghệ (tech stack), thiết kế giao diện demo tương tác và nội dung học thuật chuyên sâu** cho từng bài học trong 5 series mới để phục vụ thẩm định trước khi triển khai thực tế.

> ⚠️ **Quy tắc kỹ thuật/QA (Điều kiện chặn, Definition of Done, checklist trước khi báo "xong")
> đã chuyển sang [`check-lesson.md`](check-lesson.md)** — đọc file đó TRƯỚC KHI viết bài và
> chạy lại TRƯỚC KHI báo hoàn thành. File này (`plan.md`) chỉ còn giữ **thiết kế nội dung**
> (đề cương, tech stack, đề bài) và các quyết định **đặc thù riêng từng series**.

---

## 📈 Progress & Status (Cập nhật 2026-07-03)

| Series                               | Tên                                     | Bài hoàn thành | Tổng bài | %           |
| ------------------------------------ | --------------------------------------- | -------------- | -------- | ----------- |
| 🎉 **Series 2: WebGPU**              | **Đồ họa 3D & Compute Shader**          | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 6: CSS & Animation**     | **Hiệu ứng & Bố cục Web hiện đại**      | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 3: DSA Trực Quan**       | **Cấu Trúc Dữ Liệu & Giải Thuật**       | **12/12**      | **12**   | **100%** ✅ |
| Series 1                             | WebAssembly & Rust                      | 0/10           | 10       | 0%          |
| Series 4                             | WebRTC & WebSocket                      | 0/8            | 8        | 0%          |
| Series 5                             | Toy JS Engine (Trình thông dịch JS)     | 0/?            | TBD      | 0%          |
| 🎉 **Series 7: SQL**                 | **SQL trong Trình duyệt (SQLite-WASM)** | **17/17**      | **17**   | **100%** ✅ |
| 🎉 **Series 8: Web Audio**           | **Âm Thanh & Visualizer**               | **8/8**        | **8**    | **100%** ✅ |
| 🎉 **Series 9: Git**                 | **Mô Hình & Quy Trình Làm Việc**        | **13/13**      | **13**   | **100%** ✅ |
| 🎉 **Series 10: Điện Tử**            | **Điện Tử & Mô Phỏng Vi Mạch**          | **16/16**      | **16**   | **100%** ✅ |
| 🎉 **Series 11: VLSI**               | **Thiết Kế Vi Mạch Số & FPGA (VLSI)**   | **14/14**      | **14**   | **100%** ✅ |
| 🎉 **Series 12: AI**                 | **Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM** | **19/19**      | **19**   | **100%** ✅ |
| Series 13                            | Hệ Thống Nhúng: Từ Thanh Ghi Đến RTOS   | 16/16          | 16       | 100%        |
| Series 14                            | Xử Lý Tín Hiệu Số: Từ Mẫu Đến Phổ       | 15/15          | 15       | 100%        |
| 🎉 **Series 15: Kiến Trúc Máy Tính** | **Từ Logic Đến Lượng Tử**               | **12/12**      | **12**   | **100%** ✅ |
| Series 16                            | Kỹ Sư AI Thực Chiến                     | 7/20           | 20       | 35%         |

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
>
> **2026-07-13:** Đã gỡ tương tự phần thiết kế chi tiết của **Series 14 (Xử Lý Tín Hiệu Số)** sau khi
> hoàn thành 15/15 (100%) — mục "Quality contract & Checklist triển khai" vốn dùng chung với Series 13
> vẫn giữ lại (Series 13 chưa gỡ), đã lược bớt phần riêng của DSP; bản đầy đủ vẫn còn trong lịch sử
> git trước commit này nếu cần tham chiếu lại.
>
> **2026-07-24:** Đã gỡ tương tự phần thiết kế chi tiết của **Series 15 (Kiến Trúc Máy Tính)** sau khi
> hoàn thành 12/12 (100%) — bản đầy đủ vẫn còn trong lịch sử git trước commit này nếu cần tham chiếu lại.

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

### 4. Quality contract & Checklist triển khai

> Mục này ban đầu dùng chung Series 13 & 14 — phần riêng của **Series 14 (DSP)** đã gỡ
> khỏi file này sau khi hoàn thành 15/15 (100%, 2026-07-13); bản đầy đủ vẫn còn trong
> lịch sử git trước commit này nếu cần tham chiếu lại. Nội dung dưới đây nay chỉ còn
> phục vụ Series 13.

**Chất lượng:** mọi bài phải đạt trọn rubric PHẦN IV + quy trình `check-lesson.md`
(đọc trước khi viết, chạy lại trước khi báo xong).

- Mở rộng bản đồ cross-link (PHẦN IV §4): Nhúng·GPIO/ADC ↔ Điện Tử·điện trở kéo/điện áp.
- KaTeX: Nhúng chỉ nạp ở bài có công thức (4, 6, 9, 10); mọi công thức kèm 1 câu giải
  nghĩa ký hiệu; `\text{}` chỉ chứa ASCII (bug diacritics đã biết).
- Âm thanh: mọi demo tạo `AudioContext` SAU cử chỉ người dùng (autoplay policy); demo mic
  luôn có fallback nguồn file/oscillator; auto-mute khi filter mất ổn định.

**Hạ tầng dùng chung (làm MỘT lần):**

- [ ] `blog/blog.css`: thêm `.blog-card__tag--embedded` + `.article-hero__tag--embedded`
      (`#14b8a6`).
- [ ] Prism: KHÔNG cần thêm grammar (c/javascript/python đã có; asm dùng block thường).
- [ ] Engine, có self-test Node + con số verified (kỷ luật series AI):
      `blog/embedded/vmcu.js`.

**Hạng mục dựng NẶNG NHẤT (ước lượng, giảm dần):** 1) VMCU engine + Bảng Mạch Ảo
(timeline ngắt là phần khó nhất); 2) mini-RTOS mô phỏng (Bài 13–15); 3) các demo lẻ
còn lại đều nhẹ nhờ tái dùng engine.

**Tích hợp toàn cục (sau khi xong series — theo `page-anatomy.md` của skill):**

- [ ] `blog/index.html`: thêm `a.blog-card` cho hub (tag màu mới).
- [ ] **ROOT `index.html`** (file gốc repo, KHÔNG phải blog/index.html — đã sót 2 lần):
      thêm `a.learn-card`; verify số learn-card khớp số blog-card series.
- [ ] `sitemap.xml`: hub (priority 0.8) + từng bài (0.7) — Series 13: 17 URL.
- [ ] `blog/search-index.json`: 1 object/bài đúng schema hiện hành.
- [ ] `README.md` + `AGENTS.md`: cây thư mục, số series/bài, "Last Updated".
- [ ] Bảng Progress đầu file này: cập nhật sau MỖI bài (không đợi hết series).

**Thứ tự build đề xuất:** hub + engine + flagship trước → 2 bài mẫu duyệt văn phong →
nhân ra các bài còn lại theo lô, mỗi bài 1 commit như quy trình series AI.

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
| 15  | Kiến Trúc Máy Tính         | `blog/cpu/`         | `cpu-programming-series.html`         | `--cpu`         | 12     |

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
- **Bài 16 — Capstone: Trạm đo nhiệt độ hoàn chỉnh** (`embedded-capstone-datalogger.html`): 16.1 Đề bài & kiến trúc: cảm biến nhiệt (ADC) → lọc → hiển thị mức LED + cảnh báo buzzer + giao diện nút + báo cáo/điều khiển qua UART; sơ đồ task & luồng dữ liệu qua queue; ngân sách tài nguyên: RAM, stack từng task (dựa watermark Bài 12) · 16.2 Tầng thu thập: ADC + DMA ping-pong (Bài 10–11), task xử lý nhận khối qua queue (Bài 15); lọc trung bình trượt; hiệu chuẩn raw → °C với hệ số thật · 16.3 Tầng ứng dụng: FSM UI — nút nhấn chuyển chế độ xem/đặt ngưỡng, long-press từ Bài 5; vượt ngưỡng → buzzer 2 tông từ Bài 6; giao thức UART đọc log/đặt tham số từ Bài 9 · 16.4 Độ bền & đo đạc: CPU load bằng idle-task counter; stack watermark từng task; watchdog — outlook 1 đoạn có callout; low-power: WFI khi idle + đồng hồ năng lượng mô phỏng thấy pin "dài ra" · 16.5 Thực hành: toàn hệ chạy trên Bảng Mạch Ảo — người đọc thao tác như thiết bị thật (xoay biến trở giả nhiệt độ, đặt ngưỡng, xem log UART); checklist tự đánh giá + phụ lục "port sang board STM32 thật khác gì" từng bước.

## Series 16 — Kỹ Sư AI Thực Chiến: Lộ Trình Cho Lập Trình Viên Web

### 1. Thông tin định danh Series (Step 1)

| Trường thông tin        | Thông số định danh                                   |
| :---------------------- | :--------------------------------------------------- |
| Tên Series (Tiếng Việt) | Kỹ Sư AI Thực Chiến: Lộ Trình Cho Lập Trình Viên Web |
| Folder slug             | `aie/`                                               |
| Hub file                | `aie-programming-series.html`                        |
| Lesson slug pattern     | `aie-<topic>.html`                                   |
| Tag class               | `--aie`                                              |
| Accent color            | `#eab308`                                            |
| Prism language(s)       | `python`, `javascript`                               |

### 2. Ngăn xếp công nghệ & Các mô phỏng tương tác cốt lõi (Step 2)

#### Ngăn xếp công nghệ (Tech Stack)

Để tự học hoàn toàn từ A-Z một cách thực chiến, series này chia bộ công cụ thành hai phần độc lập:

1. **Môi trường Lập trình & Huấn luyện (Phía Python - Tiêu chuẩn ngành):**
   - **Ngôn ngữ:** Python v3.10+ (sử dụng môi trường ảo `venv` hoặc `conda`).
   - **Học sâu:** `PyTorch` (quản lý Tensor, Autograd để hiểu cơ chế gradient, xây dựng mạng nơ-ron).
   - **Mô hình nền tảng:** `transformers` (Hugging Face), `peft` (LoRA/QLoRA), `trl` (SFT/DPO).
   - **Ứng dụng & Đại lý (Agent):** `LangChain` và `LangGraph` (lập trình tác vụ dạng đồ thị có trạng thái), `FastAPI` (thiết kế API phục vụ mô hình).
   - **Lưu trữ dữ liệu:** `Chroma` (Vector DB nhúng, dễ sử dụng) và `LanceDB` (Vector DB dạng file hiệu năng cao).
   - **Đánh giá & Quan sát (MLOps):** `ragas` (đánh giá chất lượng RAG), `phoenix` / `LangSmith` (tracing luồng suy luận của LLM).
   - **Hạ tầng cục bộ:** `Ollama` (chạy các mô hình cục bộ như Llama 3 hoặc Mistral để lập trình không tốn chi phí API).

2. **Môi trường Trực quan hóa & Tương tác (Phía Frontend - Vanilla JS/HTML/CSS):**
   - Chạy 100% tại máy khách (Client-side), không sử dụng framework (React/Angular) để đảm bảo tốc độ tải trang tối đa và không có bước build phức tạp.
   - **Đồ họa:** HTML5 Canvas / Vanilla CSS để vẽ đồ thị mạng nơ-ron, bản đồ không gian vector, và luồng chạy của Agent.
   - **Toán học:** `KaTeX` tích hợp cục bộ để hiển thị các công thức tính khoảng cách Cosine, cơ chế Self-attention, thuật toán lan truyền lỗi.
   - **Code tabs:** Linh hoạt chuyển đổi giữa mã nguồn Python thực thi trên máy và mã nguồn JavaScript mô phỏng trong trình duyệt.

#### Thiết kế các bộ mô phỏng cốt lõi (Core Visualizers)

Để bài học mang tính tự thân (self-contained) và trực quan tối đa, chúng ta sẽ xây dựng hai bộ giả lập lớn:

##### Bộ giả lập 1: RAG & Vector Space Lab (Phòng thí nghiệm RAG & Không gian Vector)

- **Mục tiêu học thuật:** Giúp người học trực quan hóa được cách văn bản thô biến thành dữ liệu số (embeddings) và được truy xuất qua toán học khoảng cách như thế nào.
- **Giao diện:**
  - **Khung 1 (Cắt đoạn & Vector hóa):** Người dùng nhập một đoạn văn bản dài, cấu hình kích thước đoạn (`chunk size`) và độ gối đầu (`overlap`). Hệ thống hiển thị trực quan các đoạn cắt. Nhấp vào mỗi đoạn để xem mảng Vector tương ứng.
  - **Khung 2 (Không gian Vector 3D):** Một đồ thị không gian 3D tương tác (vẽ bằng Canvas/WebGL) hiển thị các đoạn văn bản dưới dạng các điểm nút. Khi người dùng nhập một câu hỏi truy vấn, hệ thống sẽ vẽ vector truy vấn đó và quét góc đo **Cosine Similarity** (Độ tương đồng Cosine) thời gian thực, tô màu xanh các điểm nút có độ tương đồng cao nhất được chọn để đưa vào Prompt gửi cho LLM.

##### Bộ giả lập 2: Agentic ReAct & Graph State Simulator (Trực quan hóa Đại lý & Đồ thị Trạng thái)

- **Mục tiêu học thuật:** Giúp người học làm chủ tư duy Agentic AI (đại lý tự ra quyết định và gọi công cụ) mà không cần phụ thuộc vào việc gọi API mất phí liên tục.
- **Giao diện:**
  - **Khung đồ thị luồng (State Graph):** Vẽ sơ đồ các bước xử lý của đại lý (`agent` -> `should_continue` -> `tools` -> `agent` -> `end`) dựa trên mô hình LangGraph.
  - **Khung chạy từng bước (Step-by-step debugger):** Người dùng đưa ra yêu cầu (vd: "Kiểm tra giá cổ phiếu Apple và gửi email cảnh báo nếu lớn hơn $200"). Khi bấm "Bước tiếp theo", hệ thống sẽ tô sáng nút trạng thái đang chạy trên sơ đồ, đồng thời hiển thị nội dung prompt sinh ra, phản hồi giả lập của LLM dạng JSON, hành động gọi công cụ (tool call), kết quả trả về của công cụ (observation), và cách Agent cập nhật biến trạng thái (`state`) để đi tiếp.

### 3. Đề cương chi tiết từng bài học (Step 3)

#### Triết lý thiết kế dành cho người bắt đầu từ số 0 (Zero-to-Hero Principles)

Để đảm bảo người học có nền tảng JavaScript thuần túy và hoàn toàn chưa có chuyên môn về AI có thể học và làm chủ 100% kiến thức từ blog mà không cần tìm nguồn tài liệu khác, series tuân thủ nghiêm ngặt các nguyên tắc sau:

1. **Bắc cầu ngôn ngữ (Language Bridge):** Không nhảy thẳng vào Python nâng cao. Mọi dòng lệnh Python mới đều được giải thích, so sánh đối chiếu tương đương với cú pháp JavaScript (ví dụ: `pip` tương đương với `npm`, `venv` tương đương với `node_modules` cục bộ, `async/await` của Python tương đương với JS).
2. **Hình ảnh hóa Toán học (Math Visualization):** Tránh các công thức giải tích hay đại số tuyến tính khô khan. Mọi phép toán ma trận hay đạo hàm đều được minh họa bằng các đoạn code ngắn (vòng lặp `for` lồng nhau) hoặc hình ảnh/bản đồ tọa độ để người học hiểu bản chất hình học của toán trước khi viết code tối ưu.
3. **Tuần tự tuyệt đối (No Forward Dependencies):** Bài học trước bắt buộc phải chuẩn bị đầy đủ kiến thức cho bài học sau. Không được sử dụng các thuật ngữ nâng cao (như Embedding, Vector DB, RAG) ở các bài đầu mà chưa có bài giải nghĩa chi tiết từ gốc.
4. **Local First (Hạ tầng miễn phí):** Mọi bài học thực hành đều có thể chạy 100% miễn phí trên máy tính cá nhân bằng cách sử dụng các mô hình local (qua Ollama) và Vector DB dạng file nhúng (ChromaDB), không yêu cầu thẻ tín dụng hay đăng ký API mất phí.

#### Bảng lộ trình học tổng quan (Step 3A — Syllabus Overview Table)

| Bài | Tên bài học                                  | Nội dung CS chuyên sâu                                                                                                      | Dự án/Demo trực quan đi kèm                                         | Kiến thức cần có trước       |
| :-- | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ | :--------------------------- |
| 1   | **Chuyển dịch tư duy: Từ JS sang Python**    | Cú pháp Python thô, cấu trúc dữ liệu cơ bản, quản lý thư viện (pip vs npm), môi trường ảo (venv vs node_modules).           | Viết tập lệnh Python đầu tiên để đọc/ghi tệp dữ liệu.               | Lập trình JavaScript căn bản |
| 2   | **Đại số Tuyến tính & Đạo hàm qua Code**     | Bản chất hình học của Vector, Ma trận, phép nhân ma trận, và khái niệm Đạo hàm (Derivatives) làm mịn sai số.                | Bộ tính đạo hàm tự động bằng Python thuần (không thư viện).         | Bài 1                        |
| 3   | **Làm việc với Dữ liệu lớn: NumPy & Pandas** | Nguyên lý Vectorization (xử lý song song trên CPU), tối ưu bộ nhớ cache, thao tác mảng n-chiều và bảng dữ liệu.             | Ứng dụng phân tích dữ liệu hiệu năng cao với NumPy.                 | Bài 2                        |
| 4   | **PyTorch Cơ Bản: Tensor & Autograd**        | Cấu trúc dữ liệu Tensor (GPU-accelerated), cơ chế đồ thị tính toán (Computation Graph) và tính đạo hàm tự động.             | Bộ tính Gradient của các hàm số phức tạp bằng Autograd.             | Bài 3                        |
| 5   | **Mạng Nơ-ron Đơn Giản (Perceptron & MLP)**  | Kiến trúc một nơ-ron sinh học sang nơ-ron nhân tạo, hàm kích hoạt (Activation: ReLU, Sigmoid), cấu trúc mạng MLP đa lớp.    | Bộ giả lập mạng nơ-ron phân loại dữ liệu (PyTorch).                 | Bài 4                        |
| 6   | **Huấn luyện mạng: Loss & Backpropagation**  | Khái niệm hàm mất mát (Loss Function), cơ chế truyền ngược dòng lỗi để cập nhật trọng số (Backpropagation).                 | Vòng lặp huấn luyện (Training Loop) hoàn chỉnh đầu tiên.            | Bài 5                        |
| 7   | **Thị giác Máy tính: Mạng tích chập CNN**    | Khái niệm tích chập (Convolution), bộ lọc ảnh (Kernels), lớp Pooling (giảm chiều) và nhận diện đặc trưng không gian.        | Huấn luyện mạng CNN nhận diện chữ số viết tay (MNIST subset).       | Bài 6                        |
| 8   | **Xử lý Văn bản & Word Embeddings**          | Tokenization (mã hóa chữ), vector hóa từ vựng, không gian ngữ nghĩa, mô hình Word2Vec (Skip-gram).                          | Trình tìm từ đồng nghĩa dựa trên khoảng cách Cosine.                | Bài 6                        |
| 9   | **Mạng tuần hoàn (RNN) & Attention**         | Cơ chế nhớ chuỗi thời gian, hạn chế của RNN (tiêu biến gradient), ý tưởng cốt lõi của cơ chế Chú ý (Attention).             | Mô hình dịch máy mini (Seq2Seq có Attention).                       | Bài 8                        |
| 10  | **Kiến trúc Transformer Dưới Kính Hiển Vi**  | Giải phẫu Self-Attention, Multi-Head Attention, cơ chế Encoder-Decoder của GPT/Gemini.                                      | Lắp ráp thủ công các khối Transformer bằng PyTorch.                 | Bài 9                        |
| 11  | **Lập trình Prompt & Làm chủ API LLM**       | Cấu hình tham số mô hình (temperature, top-p), thiết kế prompt hệ thống (System Prompt), quản lý hội thoại.                 | Ứng dụng Chatbot ghi nhớ ngữ cảnh hội thoại.                        | Bài 10                       |
| 12  | **Structured Outputs & Function Calling**    | JSON Mode (ép LLM trả về JSON chuẩn schema) và cơ chế gọi hàm (Function Calling) giúp AI tương tác thế giới ngoài.          | Trình phân loại email và tự động lưu vào Database.                  | Bài 11                       |
| 13  | **Cục bộ hóa AI với Ollama**                 | Chạy mô hình ngôn ngữ lớn cục bộ (Llama 3/Mistral), quản lý tài nguyên RAM/VRAM, API cục bộ.                                | Ứng dụng AI Chat chạy 100% offline trên máy khách.                  | Bài 12                       |
| 14  | **Hệ thống RAG Cơ Bản: Hỏi đáp tài liệu**    | Kiến trúc RAG cơ bản: Nạp tài liệu -> Embedding -> Lưu Vector DB -> Truy xuất ngữ nghĩa -> Trả lời.                         | Trình hỏi đáp thông minh trên tệp PDF cục bộ.                       | Bài 8, Bài 13                |
| 15  | **Chiến thuật Chunking & Vector DB**         | Các kiểu cắt đoạn (Fixed-size, Recursive, Semantic), cơ chế chỉ mục tìm kiếm nhanh (HNSW, IVF) của Vector DB.               | Bộ so sánh hiệu năng truy xuất giữa các kiểu chunking.              | Bài 14                       |
| 16  | **RAG Nâng Cao: Query Rewrite & Rerank**     | Kỹ thuật viết lại câu hỏi (Query Translation), nén văn bản retrieved, sắp xếp lại kết quả bằng Cross-Encoder (Reranking).   | Nâng cấp hệ thống RAG xử lý các câu hỏi phức tạp.                   | Bài 15                       |
| 17  | **AI Agents & Vòng lặp ReAct**               | Khái niệm Agent, mô hình ReAct (Thought -> Action -> Observation), cách thiết kế đại lý tự sửa lỗi.                         | Đại lý tự dùng máy tính và Google Search giải bài toán.             | Bài 12, Bài 13               |
| 18  | **Đại lý có trạng thái với LangGraph**       | Xây dựng Agentic Workflows dạng đồ thị có hướng (DAG), quản lý state, cơ chế duyệt duyệt bởi con người (Human-in-the-loop). | Quy trình tự động lập trình và sửa lỗi code có kiểm duyệt.          | Bài 17                       |
| 19  | **Tinh chỉnh mô hình (Fine-tuning LLM)**     | Kỹ thuật LoRA/QLoRA để huấn luyện tiết kiệm VRAM, chuẩn bị tập dữ liệu SFT, lượng tử hóa mô hình (GGUF/AWQ).                | Tinh chỉnh mô hình Llama thành chuyên gia tư vấn kỹ thuật.          | Bài 6, Bài 13                |
| 20  | **MLOps: Deploy, Tracing & Đánh giá**        | Triển khai mô hình hiệu năng cao với vLLM/FastAPI, giám sát cuộc gọi (LangSmith/Phoenix), đánh giá RAG với Ragas.           | Bản build hoàn chỉnh hệ thống AI Agent chạy Production có đánh giá. | Bài 18, Bài 19               |

#### Chi tiết H2 các Bài học (Step 3B — Đợt 1: Bài 1 - Bài 3)

##### **Bài 1 — Chuyển dịch tư duy: Từ JS sang Python** (`aie-js-to-python.html`)

- **1.1 Môi trường runtime: Python Interpreter vs Node.js**
  - _Cái gì (What):_ So sánh cách trình thông dịch Python chạy code (bytecode -> VM) với cách V8 engine của Node.js biên dịch JIT. Tìm hiểu sự tương đương giữa `pip` và `npm`, và cách `venv` cô lập môi trường cục bộ để thay thế cho thư mục `node_modules`.
  - _Tại sao (Why):_ Ngăn ngừa tình trạng rò rỉ phiên bản thư viện cục bộ ra môi trường toàn cục của máy tính (global packages pollution) — nguyên nhân số một gây lỗi "chạy được trên máy tôi nhưng lỗi trên máy khác".
  - _Khi nào (When):_ Sử dụng `venv` cho mọi dự án Python riêng biệt ngay khi bắt đầu. Đóng băng thư viện bằng `requirements.txt`.
  - _Cạm bẫy (Pitfall):_ Quên kích hoạt môi trường ảo (`source venv/bin/activate`) dẫn đến cài đặt nhầm gói vào Python hệ thống và gặp lỗi `ModuleNotFoundError` khi chạy script.
- **1.2 Kiểu dữ liệu & Cơ chế tham chiếu qua lăng kính JS**
  - _Cái gì (What):_ So sánh các kiểu dữ liệu tương đương: List vs Array, Dict vs Object. Phân biệt kiểu dữ liệu thay đổi được (Mutable: List, Dict, Set) và không thay đổi được (Immutable: Tuple, String, Number).
  - _Tại sao (Why):_ Python tối ưu hóa bộ nhớ cho các kiểu dữ liệu Immutable, đồng thời ngăn chặn các lỗi chỉnh sửa dữ liệu ngầm từ các hàm con.
  - _Khi nào (When):_ Sử dụng Tuple thay vì List khi cấu hình các tham số cố định (như kích thước ảnh, hằng số mô hình) để tăng tốc độ truy cập bộ nhớ.
  - _Cạm bẫy (Pitfall):_ Gán danh sách kiểu `list_b = list_a` thực chất chỉ copy tham chiếu (pointer). Chỉnh sửa `list_b` sẽ làm thay đổi cả `list_a`. Cần dùng `list_a.copy()` hoặc `copy.deepcopy()` để nhân bản dữ liệu thật sự.
- **1.3 Lập trình bất đồng bộ: Asyncio vs Event Loop**
  - _Cái gì (What):_ Lập trình Async/Await trong Python với thư viện chuẩn `asyncio`. So sánh cơ chế đơn luồng không chặn (non-blocking Single-thread) của asyncio với Event Loop của Node.js.
  - _Tại sao (Why):_ Giúp tối ưu hóa tài nguyên mạng khi gọi nhiều API LLM song song, tránh việc CPU phải chờ phản hồi tuần tự từ server.
  - _Khi nào (When):_ Sử dụng asyncio khi viết các API gateway (như FastAPI) hoặc khi xây dựng các pipeline gom dữ liệu RAG từ nhiều nguồn.
  - _Cạm bẫy (Pitfall):_ Gọi một hàm đồng bộ nặng về tính toán (như tính toán ma trận lớn hoặc đọc file đồng bộ) bên trong một hàm `async` sẽ chặn (block) toàn bộ Event Loop, làm tê liệt cả ứng dụng. Cần đẩy các tác vụ này sang ThreadPoolExecutor.
- **1.4 Dự án thực hành bài 1: Công cụ thu thập và chuẩn hóa dữ liệu văn bản thô**
  - _Yêu cầu:_ Viết script Python hoàn chỉnh thiết lập môi trường `venv`, kết nối đến một API public để tải các bài báo, loại bỏ các ký tự đặc biệt, định dạng lại JSON và lưu kết quả sạch dưới dạng file CSV để chuẩn bị làm dữ liệu cho mô hình AI.

##### **Bài 2 — Đại số Tuyến tính & Đạo hàm qua Code** (`aie-math-code.html`)

- **2.1 Bản chất hình học của Vector & Ma trận**
  - _Cái gì (What):_ Định nghĩa Vector dưới góc nhìn lập trình (mảng 1 chiều chứa các tọa độ điểm) và Ma trận (mảng 2 chiều đại diện cho phép biến đổi không gian - Linear Transformation).
  - _Tại sao (Why):_ Mọi dữ liệu đầu vào của AI (ảnh, văn bản, âm thanh) đều phải số hóa thành các Vector và Ma trận để CPU/GPU có thể xử lý toán học.
  - _Khi nào (When):_ Biểu diễn dữ liệu dưới dạng ma trận bất cứ khi nào cần áp dụng cùng một phép toán lên nhiều mẫu dữ liệu đồng thời (Batching).
  - _Cạm bẫy (Pitfall):_ Coi ma trận chỉ là các bảng lưu dữ liệu tĩnh (giống bảng Excel) mà không hiểu rằng việc nhân một vector với ma trận chính là hành động xoay, kéo dãn vector đó trong không gian đa chiều (đầu vào biến thành đầu ra của nơ-ron).
- **2.2 Giải mã phép nhân ma trận (Matrix Multiplication)**
  - _Cái gì (What):_ Quy tắc nhân ma trận toán học (dòng nhân cột). Tự lập trình thuật toán nhân ma trận 2D bằng các vòng lặp `for` lồng nhau trong Python thuần.
  - _Tại sao (Why):_ Phép nhân ma trận là hạt nhân tính toán cơ bản nhất, chiếm tới 90% thời gian xử lý khi huấn luyện hoặc suy luận mô hình AI.
  - _Khi nào (When):_ Nhân ma trận luôn yêu cầu chiều rộng của ma trận thứ nhất phải bằng chiều cao của ma trận thứ hai.
  - _Cạm bẫy (Pitfall):_ Nhầm lẫn giữa phép nhân ma trận toán học (Dot Product / Matrix Product - ký hiệu `@` trong Python) với phép nhân từng phần tử tương ứng ở cùng tọa độ (Element-wise Multiplication - ký hiệu `*`).
- **2.3 Đạo hàm (Derivatives) — La bàn chỉ hướng giảm sai số**
  - _Cái gì (What):_ Đạo hàm là tốc độ thay đổi của một hàm số tại một điểm cụ thể. Học cách tính xấp xỉ đạo hàm bằng code lập trình thông qua công thức sai phân hữu hạn `(f(x + h) - f(x)) / h`.
  - _Tại sao (Why):_ Đạo hàm cho biết ta cần tăng hay giảm giá trị đầu vào (trọng số của AI) một lượng bao nhiêu để làm cho sai số đầu ra nhỏ nhất có thể.
  - _Khi nào (When):_ Đạo hàm là nền tảng của mọi thuật toán tối ưu học máy, được tính toán liên tục trong suốt quá trình huấn luyện.
  - _Cạm bẫy (Pitfall):_ Chọn bước dịch chuyển `h` quá lớn sẽ tính sai đạo hàm; chọn `h` quá nhỏ (nhỏ hơn giới hạn float64 của máy tính) sẽ gây lỗi làm tròn và mất dữ liệu (underflow).
- **2.4 Dự án thực hành bài 2: Tự viết thuật toán tìm cực tiểu (Gradient Descent từ con số 0)**
  - _Yêu cầu:_ Viết script Python định nghĩa một hàm số lỗi (ví dụ: $f(x) = x^2 - 4x + 4$), tự viết vòng lặp tính đạo hàm tại vị trí hiện tại và cập nhật $x$ theo hướng ngược lại của đạo hàm để tìm ra điểm cực tiểu $x=2$ mà không dùng bất kỳ thư viện toán học nâng cao nào.

##### **Bài 3 — Làm việc với Dữ liệu lớn: NumPy & Pandas** (`aie-numpy-pandas.html`)

- **3.1 Vì sao vòng lặp For trong Python rất chậm?**
  - _Cái gì (What):_ Phân tích cơ chế hoạt động của CPU khi chạy vòng lặp Python (kiểm tra kiểu dữ liệu động từng dòng, boxing/unboxing giá trị) so với bộ nhớ liên tục (Contiguous Memory Layout) chạy bằng mã C đã biên dịch của NumPy.
  - _Tại sao (Why):_ Việc duyệt hàng triệu phần tử bằng vòng lặp `for` của Python thô sẽ khiến chương trình AI chạy chậm gấp hàng trăm lần so với các ngôn ngữ biên dịch.
  - _Khi nào (When):_ Luôn chuyển đổi dữ liệu dạng danh sách (List) sang mảng NumPy (`np.ndarray`) khi dữ liệu có kích thước từ vài nghìn phần tử trở lên.
  - _Cạm bẫy (Pitfall):_ Dùng vòng lặp `for` chạy qua các phần tử của một mảng NumPy. Việc này làm mất hoàn toàn tính tối ưu của NumPy, biến nó thành một cấu trúc chậm chạp giống List thông thường.
- **3.2 Nguyên lý Vectorization (Vector hóa câu lệnh)**
  - _Cái gì (What):_ Kỹ thuật lập trình áp dụng các phép toán trực tiếp lên toàn bộ mảng dữ liệu cùng lúc. Bộ vi xử lý sẽ sử dụng các tập lệnh song song cấp phần cứng (SIMD - Single Instruction Multiple Data) để thực thi.
  - _Tại sao (Why):_ Loại bỏ hoàn toàn vòng lặp ở tầng Python, đẩy việc lặp xuống tầng C hiệu năng cao của NumPy.
  - _Khi nào (When):_ Áp dụng cho mọi phép toán cộng, trừ, nhân, chia, tính hàm mũ trên toàn bộ tập dữ liệu.
  - _Cạm bẫy (Pitfall):_ Tạo ra quá nhiều mảng phụ trung gian trong quá trình tính toán vector hóa, làm bộ nhớ RAM bị phình to đột biến (OOM - Out of Memory). Cần sử dụng các phép toán tại chỗ (in-place operations như `+=`, `*=`).
- **3.3 Phép phát thanh (Broadcasting) trong NumPy**
  - _Cái gì (What):_ Cơ chế NumPy tự động căn chỉnh và mở rộng ảo kích thước của các mảng có chiều không khớp nhau để thực hiện phép toán mà không cần sao chép thêm dữ liệu trong RAM.
  - _Tại sao (Why):_ Tiết kiệm bộ nhớ tối đa khi cộng một hằng số hoặc một vector độ lệch (bias) vào một ma trận dữ liệu lớn.
  - _Khi nào (When):_ Hai mảng có thể broadcast được với nhau nếu chiều của chúng tương thích từ phải qua trái (bằng nhau hoặc có một chiều bằng 1).
  - _Cạm bẫy (Pitfall):_ Không hiểu quy tắc khớp chiều dẫn đến lỗi `ValueError: operands could not be broadcast together`. Cần sử dụng `np.newaxis` hoặc `reshape` để thêm chiều ảo một cách chủ động.
- **3.4 Dự án thực hành bài 3: Tiền xử lý và chuẩn hóa tập dữ liệu ảnh động**
  - _Yêu cầu:_ Sử dụng NumPy để tải một danh sách ảnh số hóa (mảng 3D: Batch x Height x Width), thực hiện tính toán vector hóa để tìm giá trị trung bình (Mean) và độ lệch chuẩn (Std) của toàn bộ tập dữ liệu, sau đó áp dụng phép toán Min-Max Scaling để chuẩn hóa toàn bộ điểm ảnh về khoảng giá trị $[0, 1]$ mà không dùng bất kỳ vòng lặp `for` nào.

- **3.4 Dự án thực hành bài 3: Tiền xử lý và chuẩn hóa tập dữ liệu ảnh động**
  - _Yêu cầu:_ Sử dụng NumPy để tải một danh sách ảnh số hóa (mảng 3D: Batch x Height x Width), thực hiện tính toán vector hóa để tìm giá trị trung bình (Mean) và độ lệch chuẩn (Std) của toàn bộ tập dữ liệu, sau đó áp dụng phép toán Min-Max Scaling để chuẩn hóa toàn bộ điểm ảnh về khoảng giá trị $[0, 1]$ mà không dùng bất kỳ vòng lặp `for` nào.

##### **Bài 4 — PyTorch Cơ Bản: Tensor & Autograd** (`aie-pytorch-autograd.html`)

- **4.1 Tensor là gì? Khác gì mảng NumPy?**
  - _Cái gì (What):_ Định nghĩa Tensor là mảng đa chiều chuyên dụng cho học máy. Sự khác biệt cốt lõi so với mảng NumPy là khả năng tự động theo dõi đạo hàm và khả năng chuyển đổi tính toán linh hoạt giữa CPU và GPU (CUDA/MPS).
  - _Tại sao (Why):_ Huấn luyện mạng nơ-ron lớn đòi hỏi hàng tỷ phép tính ma trận; chỉ có sức mạnh tính toán song song của GPU mới đáp ứng được hiệu năng này.
  - _Khi nào (When):_ Luôn chuyển đổi dữ liệu NumPy sang PyTorch Tensor ngay trước khi đưa vào mô hình học sâu.
  - _Cạm bẫy (Pitfall):_ Thực hiện phép toán giữa các Tensor không cùng nằm trên một thiết bị phần cứng, dẫn đến lỗi `RuntimeError: Expected all tensors to be on the same device`. Cần gọi `.to(device)` một cách chủ động.
- **4.2 Biến đổi hình dạng (Tensor Reshaping & View)**
  - _Cái gì (What):_ Các phương thức thay đổi cấu trúc chiều của Tensor như `.view()`, `.reshape()`, `.transpose()`, `.squeeze()`, và `.unsqueeze()`. Phân biệt cơ chế chia sẻ vùng nhớ gốc của `.view()` so với việc nhân bản của `.reshape()`.
  - _Tại sao (Why):_ Các lớp nơ-ron khác nhau yêu cầu định dạng chiều đầu vào khác nhau (ví dụ: tầng tích chập cần mảng 4D, tầng tuyến tính cần mảng 2D).
  - _Khi nào (When):_ Sử dụng `.view()` để thay đổi chiều khi muốn tối ưu hiệu năng bộ nhớ; dùng `.reshape()` khi tensor gốc không liên tục trong RAM.
  - _Cạm bẫy (Pitfall):_ Gọi `.view()` trên một tensor không liên tục (non-contiguous) sẽ gây crash chương trình. Cần gọi `.contiguous().view()` hoặc dùng `.reshape()` thay thế.
- **4.3 Cơ chế tự động tính đạo hàm (Autograd & Đồ thị tính toán)**
  - _Cái gì (What):_ Khái niệm đồ thị tính toán động (Dynamic Computation Graph) do PyTorch xây dựng tự động trong quá trình lan truyền xuôi (Forward pass) để lưu vết các phép toán. Cách gọi `.backward()` để tự động tính đạo hàm theo quy tắc Chain Rule.
  - _Tại sao (Why):_ Loại bỏ hoàn toàn việc phải tự giải toán vi phân và code tay các công thức đạo hàm phức tạp cho hàng triệu trọng số.
  - _Khi nào (When):_ Kích hoạt `requires_grad=True` cho các tham số cần học (weights, biases) và tắt đi bằng `with torch.no_grad()` khi chạy suy luận hoặc đánh giá mô hình để tiết kiệm RAM.
  - _Cạm bẫy (Pitfall):_ Quên rằng PyTorch tự động cộng dồn đạo hàm vào thuộc tính `.grad` sau mỗi lần gọi `.backward()`. Phải giải phóng bộ đệm bằng `.zero_grad()` hoặc `.zero_()` trước mỗi vòng lặp mới.
- **4.4 Dự án thực hành bài 4: Xấp xỉ hàm số đa thức bằng Autograd**
  - _Yêu cầu:_ Khởi tạo một đa thức bậc 3 ngẫu nhiên (y = w1*x + w2*x^2 + w3\*x^3 + b), sinh tập dữ liệu nhiễu mô phỏng đường hình Sin, sử dụng Autograd của PyTorch để tự động tính toán gradient của các trọng số và tối ưu hóa thủ công để vẽ đường đa thức ôm khít đường hình Sin.

##### **Bài 5 — Mạng Nơ-ron Đơn Giản (Perceptron & MLP)** (`aie-mlp-neural-network.html`)

- **5.1 Tế bào nơ-ron nhân tạo: Từ hàm tuyến tính đến phi tuyến**
  - _Cái gì (What):_ Công thức toán học của nơ-ron: tổng chập trọng số $W \cdot X + b$ đi qua hàm kích hoạt phi tuyến (Activation Functions: Sigmoid, Tanh, ReLU). Bản chất của hàm kích hoạt.
  - _Tại sao (Why):_ Các bài toán thực tế luôn có ranh giới phân lớp phi tuyến phức tạp (như bài toán XOR). Nếu không có hàm kích hoạt phi tuyến, mạng nơ-ron dù xếp chồng hàng nghìn lớp cũng chỉ tương đương với một phép nhân ma trận đơn lẻ (tuyến tính).
  - _Khi nào (When):_ Sử dụng hàm `ReLU` làm mặc định cho các lớp ẩn (hidden layers) để tránh triệt tiêu gradient; dùng `Sigmoid` cho lớp đầu ra của phân loại nhị phân và `Softmax` cho phân loại đa lớp.
  - _Cạm bẫy (Pitfall):_ Sử dụng hàm kích hoạt Sigmoid ở các mạng quá sâu dẫn đến hiện tượng triệt tiêu gradient (Vanishing Gradient), khiến mô hình bị "đơ" và không thể học thêm.
- **5.2 Lắp ráp mạng MLP (Multi-Layer Perceptron) với PyTorch**
  - _Cái gì (What):_ Khái niệm lớp liên kết toàn phần (Fully Connected / Linear Layer) và cách kết nối chúng thành một mạng MLP hoàn chỉnh sử dụng class `torch.nn.Module` kết hợp với `nn.Sequential`.
  - _Tại sao (Why):_ Xếp chồng nhiều lớp nơ-ron giúp mạng học được các biểu diễn đặc trưng có tính phân cấp từ thô đến tinh.
  - _Khi nào (When):_ Sử dụng mạng MLP cho các dữ liệu dạng bảng (tabular data) hoặc làm các lớp phân lớp quyết định cuối cùng trong các mạng CNN/Transformer.
  - _Cạm bẫy (Pitfall):_ Quên gọi lệnh khởi tạo lớp cha `super().__init__()` trong hàm khởi tạo của mô hình tùy biến, dẫn đến lỗi PyTorch không thể đăng ký các tham số trọng số.
- **5.3 Khởi tạo trọng số (Weight Initialization)**
  - _Cái gì (What):_ Tầm quan trọng của việc gán giá trị ban đầu cho các ma trận trọng số $W$ (phương pháp He/Kaiming và Xavier initialization).
  - _Tại sao (Why):_ Nếu khởi tạo tất cả trọng số bằng 0 hoặc bằng nhau, các nơ-ron ở lớp ẩn sẽ nhận tín hiệu giống hệt nhau và cập nhật giống nhau (sự đối xứng không bị phá vỡ), làm mất đi sức mạnh của mạng đa lớp.
  - _Khi nào (When):_ Sử dụng khởi tạo Kaiming Normal/Uniform khi dùng hàm kích hoạt ReLU; sử dụng Xavier/Glorot khi dùng Tanh/Sigmoid.
  - _Cạm bẫy (Pitfall):_ Khởi tạo trọng số ngẫu nhiên quá lớn gây ra hiện tượng bùng nổ kích hoạt (Exploding Activation) hoặc quá nhỏ gây chết nơ-ron.
- **5.4 Dự án thực hành bài 5: Bộ phân loại dữ liệu phi tuyến tính (Hai vòng tròn đồng tâm)**
  - _Yêu cầu:_ Sinh tập dữ liệu phi tuyến tính bằng hàm `make_circles` của scikit-learn, định nghĩa mạng MLP 3 lớp ẩn bằng PyTorch, thực hiện lan truyền xuôi để xuất ra dự đoán thô ban đầu (chưa huấn luyện).

##### **Bài 6 — Huấn luyện mạng: Loss & Backpropagation** (`aie-training-backprop.html`)

- **6.1 Hàm mất mát (Loss Function) — Thước đo độ sai lệch**
  - _Cái gì (What):_ Khái niệm hàm mất mát (Loss Function/Cost Function). Cách tính toán sai số bằng Mean Squared Error (MSE Loss) cho bài toán hồi quy và Cross-Entropy Loss cho bài toán phân loại.
  - _Tại sao (Why):_ Cung cấp một chỉ số định lượng duy nhất cho biết mô hình đang dự đoán lệch bao nhiêu so với thực tế, làm mục tiêu cho thuật toán tối ưu hóa.
  - _Khi nào (When):_ Chọn đúng hàm Loss tương thích với định dạng nhãn dữ liệu (ví dụ: Cross-Entropy trong PyTorch yêu cầu đầu ra mô hình là logits chưa đi qua Softmax).
  - _Cạm bẫy (Pitfall):_ Áp dụng thêm một tầng Softmax thủ công ở cuối mô hình khi sử dụng `nn.CrossEntropyLoss` của PyTorch, gây ra việc tính toán Softmax hai lần, làm giảm độ chính xác số học và làm chậm tốc độ hội tụ.
- **6.2 Lan truyền ngược (Backpropagation) & Tối ưu hóa Gradient Descent**
  - _Cái gì (What):_ Cơ chế đạo hàm hàm hợp (Chain Rule) để truyền ngược lỗi từ đầu ra về lại từng trọng số ở các lớp ẩn sâu. Cách bộ tối ưu hóa (Optimizer) cập nhật trọng số theo hướng ngược chiều Gradient với tốc độ học (Learning Rate - $\alpha$).
  - _Tại sao (Why):_ Đây là cơ chế duy nhất giúp máy tính tự động tìm ra cách sửa đổi hàng triệu trọng số sao cho tổng sai số (Loss) giảm dần.
  - _Khi nào (When):_ Chạy lan truyền ngược sau mỗi lô dữ liệu (Batch) trong vòng huấn luyện.
  - _Cạm bẫy (Pitfall):_ Quên xóa gradient cũ của các bước trước bằng `optimizer.zero_grad()`, dẫn đến việc đạo hàm bị cộng dồn tích lũy và làm mô hình bị phân kỳ (Loss tăng vô hạn).
- **6.3 Các bộ tối ưu cải tiến: Adam & Tốc độ học (Learning Rate)**
  - _Cái gì (What):_ Sự khác biệt giữa Stochastic Gradient Descent (SGD) cơ bản và bộ tối ưu Adam (tự động điều chỉnh Learning Rate riêng cho từng trọng số dựa trên moment động lượng).
  - _Tại sao (Why):_ Adam giúp mô hình vượt qua các vùng phẳng (saddle points) và hội tụ nhanh gấp nhiều lần so với SGD thô.
  - _Khi nào (When):_ Sử dụng Adam làm lựa chọn mặc định khi bắt đầu huấn luyện hầu hết các mô hình học sâu hiện đại.
  - _Cạm bẫy (Pitfall):_ Đặt Learning Rate quá lớn khiến hàm Loss nhảy loạn xạ và phân kỳ; đặt quá nhỏ khiến mô hình bị kẹt ở các điểm cực tiểu cục bộ và ngừng học.
- **6.4 Dự án thực hành bài 6: Huấn luyện bộ phân loại phi tuyến hoàn chỉnh**
  - _Yêu cầu:_ Lắp ráp mô hình MLP từ Bài 5, viết vòng lặp huấn luyện (Training Loop) hoàn chỉnh sử dụng `nn.BCELoss` (Binary Cross-Entropy), bộ tối ưu Adam, huấn luyện qua 500 epochs và vẽ đồ thị biểu diễn đường Loss đi xuống tiệm cận 0.

##### **Bài 7 — Thị giác Máy tính: Mạng tích chập CNN** (`aie-cnn-convolution.html`)

- **7.1 Bản chất của phép tích chập (Convolution)**
  - _Cái gì (What):_ Cơ chế hoạt động của bộ lọc (Kernel/Filter) trượt qua ảnh 2D để trích xuất các đặc trưng không gian. Khái niệm độ đệm viền (Padding) để giữ kích thước ảnh và bước nhảy (Stride).
  - _Tại sao (Why):_ Giúp mạng nơ-ron nhận diện được các đặc điểm (như cạnh, góc) bất kể chúng nằm ở vị trí nào trong bức ảnh (Translation Invariance), đồng thời giảm hàng triệu lần số lượng tham số so với việc dùng mạng MLP kéo phẳng ảnh.
  - _Khi nào (When):_ Dùng lớp `nn.Conv2d` ở các tầng đầu tiên khi xử lý dữ liệu có cấu trúc lưới 2D/3D (như ảnh, video, dữ liệu phổ âm thanh).
  - _Cạm bẫy (Pitfall):_ Chọn kích thước Kernel quá lớn (như 11x11 hoặc 7x7) ở các tầng sâu, làm mất đi các chi tiết cục bộ mịn của ảnh và tốn tài nguyên tính toán.
- **7.2 Lớp Pooling & Trích xuất đặc trưng phân cấp**
  - _Cái gì (What):_ Lớp Max Pooling và Average Pooling thực hiện phép lấy giá trị lớn nhất hoặc trung bình trong một ô cửa sổ trượt để giảm kích thước ảnh.
  - _Tại sao (Why):_ Giảm khối lượng tính toán cho các tầng sau, tăng trường thụ cảm (Receptive Field) của nơ-ron và giúp mô hình tập trung vào sự hiện diện của đặc trưng thay vì vị trí chính xác của nó (chống overfitting).
  - _Khi nào (When):_ Đặt ngay sau lớp tích chập Conv2D và hàm kích hoạt ReLU.
  - _Cạm bẫy (Pitfall):_ Lạm dụng Pooling quá mức hoặc dùng cửa sổ pooling quá lớn làm mất đi thông tin không gian quan trọng, khiến mạng không thể phân biệt các vật thể nhỏ.
- **7.3 Giải phẫu và thiết kế mạng CNN hoàn chỉnh**
  - _Cái gì (What):_ Cách kết hợp tuần tự các khối tích chập: `Conv2d` -> `ReLU` -> `MaxPool2d` -> `Flatten` -> `Linear` (Fully Connected) -> `Softmax`.
  - _Tại sao (Why):_ Các tầng tích chập ban đầu trích xuất đặc trưng thô, tầng làm phẳng biến chúng thành vector đặc trưng cao cấp, và các tầng tuyến tính cuối cùng thực hiện phân loại nhãn.
  - _Khi nào (When):_ Thiết kế kiến trúc CNN cho các tác vụ nhận diện ảnh, phân loại vật thể, hoặc xử lý thị giác máy tính.
  - _Cạm bẫy (Pitfall):_ Tính toán sai số lượng kênh (channels) hoặc kích thước pixel đầu ra của lớp tích chập cuối cùng trước khi đưa vào lớp `Linear`, gây lỗi biên dịch `RuntimeError`.
- **7.4 Dự án thực hành bài 7: Huấn luyện mạng CNN nhận diện chữ số viết tay (MNIST subset)**
  - _Yêu cầu:_ Sử dụng tập dữ liệu MNIST, tự thiết kế một mạng CNN 3 tầng tích chập và 1 tầng tuyến tính phân loại bằng PyTorch, viết vòng lặp huấn luyện, đo lường độ chính xác (Accuracy %) trên tập validation và chạy kiểm thử suy luận trên một ảnh chữ số bất kỳ.

##### **Bài 8 — Xử lý Văn bản & Word Embeddings** (`aie-text-embeddings.html`)

- **8.1 Từ Chữ viết sang Con số: Tokenization**
  - _Cái gì (What):_ Cơ chế phân rã văn bản thô thành danh sách các mã số (tokens). So sánh 3 cấp độ: Character-level, Word-level và Subword-level Tokenization (BPE, WordPiece).
  - _Tại sao (Why):_ Máy tính chỉ hiểu toán học số; mọi văn bản đầu vào đều bắt buộc phải chuyển dịch thành danh sách số nguyên tra cứu (Token IDs) đại diện cho từ vựng.
  - _Khi nào (When):_ Luôn chạy Tokenizer là bước đầu tiên trước khi đưa văn bản vào bất kỳ mô hình ngôn ngữ nào.
  - _Cạm bẫy (Pitfall):_ Gặp hiện tượng từ lạ ngoài từ điển (Out-of-Vocabulary - OOV) biến thành token rác `[UNK]` nếu dùng Word-level Tokenizer. Sử dụng Subword Tokenizer để tự động chẻ từ lạ thành các phần nhỏ (tiền tố, hậu tố) có nghĩa để loại bỏ lỗi này.
- **8.2 Bản đồ ngữ nghĩa: Khái niệm Word Embeddings**
  - _Cái gì (What):_ Khái niệm Word Embeddings biểu diễn mỗi từ thành một Vector số thực dày đặc (Dense Vector) trong không gian đa chiều (ví dụ: 300 hoặc 768 chiều), sao cho mối quan hệ khoảng cách giữa các vector thể hiện mối quan hệ ngữ nghĩa của từ.
  - _Tại sao (Why):_ Giải quyết điểm yếu chí mạng của One-Hot Encoding (tạo ra các ma trận thưa thớt khổng lồ và coi các từ hoàn toàn độc lập, ví dụ: "mèo" và "chó" có khoảng cách giống "mèo" và "bàn").
  - _Khi nào (When):_ Sử dụng lớp `nn.Embedding` của PyTorch làm lớp đầu vào cho mọi mô hình học máy xử lý văn bản.
  - _Cạm bẫy (Pitfall):_ Hiểu lầm rằng khoảng cách vector chỉ đo sự đồng nghĩa thuần túy, trong khi nó thực tế đo tần suất xuất hiện cùng nhau trong ngữ cảnh (ví dụ: "cà phê" và "cốc" nằm rất gần nhau dù không đồng nghĩa).
- **8.3 Đo lường khoảng cách ngữ nghĩa: Cosine Similarity**
  - _Cái gì (What):_ Công thức toán học đo góc giữa hai vector trong không gian đa chiều: $\text{Cosine Similarity} = \frac{A \cdot B}{\|A\|\|B\|}$. Trực quan hóa góc vector so với độ dài vector.
  - _Tại sao (Why):_ Giúp xác định mức độ tương đồng ngữ nghĩa giữa hai văn bản bất kể độ dài ngắn của chúng khác nhau nhiều.
  - _Khi nào (When):_ Sử dụng Cosine Similarity làm mặc định cho các tác vụ tìm kiếm thông tin ngữ nghĩa (Semantic Search), hệ thống gợi ý và RAG.
  - _Cạm bẫy (Pitfall):_ Sử dụng khoảng cách Euclid (L2 Distance) trên các vector chưa được chuẩn hóa, dẫn đến việc các câu dài bị đánh giá lệch khoảng cách so với câu ngắn mặc dù cùng chủ đề.
- **8.4 Dự án thực hành bài 8: Trình tìm từ đồng nghĩa (Word2Vec) với PyTorch**
  - _Yêu cầu:_ Khởi tạo ma trận `nn.Embedding` với trọng số đã huấn luyện (Word2Vec), viết script Python nhận vào một từ khóa tiếng Việt, tính Cosine Similarity với toàn bộ từ điển và in ra top 5 từ có điểm số tương đồng cao nhất.

##### **Bài 9 — Mạng tuần hoàn (RNN) & Attention** (`aie-rnn-attention.html`)

- **9.1 Cơ chế nhớ chuỗi thời gian của Recurrent Neural Network (RNN)**
  - _Cái gì (What):_ Kiến trúc mạng RNN xử lý dữ liệu tuần tự bằng cách duy trì một trạng thái ẩn (Hidden State $h_t$) truyền dọc theo chiều thời gian để lưu vết thông tin từ quá khứ.
  - _Tại sao (Why):_ Văn bản là dữ liệu chuỗi có tính thứ tự trước sau; mạng MLP thông thường không thể xử lý tốt dữ liệu chuỗi có độ dài thay đổi liên tục.
  - _Khi nào (When):_ Sử dụng `nn.RNN` khi xử lý các chuỗi ngắn hoặc dữ liệu dạng chuỗi thời gian đơn giản (Time-series).
  - _Cạm bẫy (Pitfall):_ Hiện tượng tiêu biến gradient (Vanishing Gradient) trên chuỗi dài khiến RNN quên mất thông tin ở đầu câu khi xử lý đến cuối câu.
- **9.2 Lưới chọn lọc thông tin: Bộ nhớ dài-ngắn hạn LSTM & GRU**
  - _Cái gì (What):_ Kiến trúc LSTM (Long Short-Term Memory) giới thiệu các cổng kiểm soát thông tin (Forget gate, Input gate, Output gate) để quản lý luồng dữ liệu truyền đi.
  - _Tại sao (Why):_ Cho phép mô hình chủ động lựa chọn thông tin nào cần nhớ lâu dài và thông tin nào cần quên đi ngay lập tức, giải quyết triệt để vấn đề vanishing gradient trên câu dài.
  - _Khi nào (When):_ Sử dụng `nn.LSTM` thay thế hoàn toàn cho RNN thô khi dịch thuật hoặc phân tích cảm xúc câu dài.
  - _Cạm bẫy (Pitfall):_ Tốc độ huấn luyện và suy luận của LSTM cực kỳ chậm do tính toán bắt buộc phải chạy tuần tự từng bước thời gian (Sequential bottleneck), không thể tính toán song song hóa trên GPU.
- **9.3 Khái niệm Attention: Cơ chế chú ý tập trung**
  - _Cái gì (What):_ Ý tưởng cốt lõi của Attention: Thay vì nén toàn bộ câu đầu vào thành một vector ẩn duy nhất ở cuối (bottleneck), mô hình cho phép bộ giải mã (Decoder) "nhìn lại" và tập trung trọng số vào các từ quan trọng nhất ở câu đầu vào (Encoder) tại mỗi bước dịch.
  - _Tại sao (Why):_ Phá vỡ giới hạn truyền tải thông tin của mô hình Seq2Seq cổ điển, giúp dịch chính xác các câu cực dài mà không bị mất ngữ nghĩa.
  - _Khi nào (When):_ Tích hợp cơ chế Attention vào các mạng tuần hoàn để tăng hiệu năng dịch thuật hoặc tóm tắt.
  - _Cạm bẫy (Pitfall):_ Hiểu nhầm Attention là một kiến trúc độc lập ở thời kỳ này, trong khi ban đầu nó chỉ là một lớp bổ trợ gắn trên đỉnh mạng RNN/LSTM.
- **9.4 Dự án thực hành bài 9: Mô hình dịch máy Seq2Seq có Attention**
  - _Yêu cầu:_ Xây dựng mô hình Encoder-Decoder sử dụng LSTM, tích hợp lớp Attention tính toán điểm tương đồng giữa trạng thái ẩn của encoder và decoder, chạy huấn luyện dịch các câu tiếng Anh ngắn sang tiếng Việt.

##### **Bài 10 — Kiến trúc Transformer Dưới Kính Hiển Vi** (`aie-transformer-details.html`)

- **10.1 Cuộc cách mạng song song hóa: Cơ chế Self-Attention**
  - _Cái gì (What):_ Phép toán tự chú ý (Self-Attention) sử dụng ba ma trận: Query (Q), Key (K), và Value (V). Công thức tính toán: $\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$.
  - _Tại sao (Why):_ Loại bỏ hoàn toàn vòng lặp tuần tự của RNN. Giúp mô hình tính toán mối liên hệ giữa TẤT CẢ các từ trong câu đồng thời (song song hóa 100% trên GPU), đồng thời bắt được sự phụ thuộc xa giữa các từ cực kỳ tốt.
  - _Khi nào (When):_ Dùng Self-Attention làm khối xây dựng cốt lõi cho mọi mô hình ngôn ngữ lớn (LLM) hiện đại.
  - _Cạm bẫy (Pitfall):_ Độ phức tạp tính toán của Self-Attention là $O(N^2)$ với $N$ là chiều dài câu, khiến chi phí bộ nhớ VRAM tăng bình phương khi xử lý văn bản cực dài.
- **10.2 Học đa chiều: Multi-Head Attention & Mã hóa vị trí Positional Encoding**
  - _Cái gì (What):_ Cơ chế chạy nhiều luồng tự chú ý song song (Multi-Head) để học các mối quan hệ ngữ pháp khác nhau cùng lúc. Khái niệm mã hóa vị trí (Positional Encoding) cộng vào vector từ để mô hình biết từ nào đứng trước, từ nào đứng sau.
  - _Tại sao (Why):_ Vì Transformer xử lý song song toàn bộ từ cùng lúc nên nếu không có Positional Encoding, mô hình sẽ coi câu là một túi từ không có thứ tự (Bag of words - xáo trộn từ vẫn ra kết quả giống nhau).
  - _Khi nào (When):_ Sử dụng mã hóa vị trí dạng hình Sin hoặc RoPE (Rotary Position Embedding) được tích hợp trực tiếp trước khối Self-Attention.
  - _Cạm bẫy (Pitfall):_ Quên cộng Positional Encoding trước khi đưa vào khối Attention khiến mô hình mất hoàn toàn tư duy ngữ pháp trật tự từ.
- **10.3 Kiến trúc Encoder-Decoder và mô hình GPT (Decoder-only)**
  - _Cái gì (What):_ Cách kết hợp khối Self-Attention, lớp chuẩn hóa (Layer Normalization), và mạng FeedForward thành khối Transformer hoàn chỉnh. Sự chuyển dịch từ Encoder-Decoder (như BERT/T5) sang kiến trúc chỉ sử dụng Decoder (Decoder-only như GPT, Llama, Gemini).
  - _Tại sao (Why):_ Mô hình Decoder-only tỏ ra cực kỳ hiệu quả trong việc tự hồi quy (Autoregressive) đoán từ tiếp theo để sinh văn bản sáng tạo.
  - _Khi nào (When):_ Thiết kế mô hình sinh chữ (Text Generation) hoặc xây dựng chatbot thông minh.
  - _Cạm bẫy (Pitfall):_ Không dùng mặt nạ nhân quả (Causal Mask / Look-ahead mask) trong khối Decoder, khiến mô hình bị "ăn gian" nhìn thấy các từ ở tương lai trong quá trình huấn luyện.
- **10.4 Dự án thực hành bài 10: Xây dựng khối Transformer Block hoàn chỉnh bằng PyTorch**
  - _Yêu cầu:_ Viết code lớp `MultiHeadAttention` từ đầu, kết hợp với `LayerNorm` và `nn.Linear` để đóng gói thành một lớp `TransformerBlock` hoạt động hoàn chỉnh có thể truyền dữ liệu qua lại và kiểm tra số chiều đầu ra.

- **10.4 Dự án thực hành bài 10: Xây dựng khối Transformer Block hoàn chỉnh bằng PyTorch**
  - _Yêu cầu:_ Viết code lớp `MultiHeadAttention` từ đầu, kết hợp với `LayerNorm` và `nn.Linear` để đóng gói thành một lớp `TransformerBlock` hoạt động hoàn chỉnh có thể truyền dữ liệu qua lại và kiểm tra số chiều đầu ra.

##### **Bài 11 — Lập trình Prompt & Làm chủ API LLM** (`aie-llm-api-prompting.html`)

- **11.1 Cấu trúc hội thoại LLM: System, User, và Assistant Roles**
  - _Cái gì (What):_ Sự khác biệt và vai trò của các nhãn vai trò trong API hội thoại: `System` (định hình tính cách, thiết lập quy tắc hành vi và ranh giới cho AI), `User` (câu lệnh yêu cầu của người dùng), và `Assistant` (lịch sử phản hồi trước đó của LLM).
  - _Tại sao (Why):_ Định hình hành vi và lưu trữ ngữ cảnh hội thoại một cách có cấu trúc, giúp LLM hiểu rõ vị trí của nó trong cuộc hội thoại thay vì gửi một chuỗi văn bản tự do nối đuôi nhau.
  - _Khi nào (When):_ Luôn thiết lập vai trò này khi xây dựng chatbot hoặc các ứng dụng tương tác đa lượt với LLM.
  - _Cạm bẫy (Pitfall):_ Gửi toàn bộ lịch sử chat dưới dạng text thô nối đuôi nhau khiến mô hình dễ nhầm lẫn vai trò và "ảo tưởng" (hallucinate) tự viết tiếp câu của người dùng.
- **11.2 Làm chủ các tham số điều khiển: Temperature & Top-P**
  - _Cái gì (What):_ Ý nghĩa toán học và vật lý của `Temperature` (độ ngẫu nhiên của xác suất phân phối từ tiếp theo) và `Top-P` (chọn từ trong nhóm tích lũy xác suất hàng đầu).
  - _Tại sao (Why):_ Cho phép kiểm soát mức độ sáng tạo hoặc tính chính xác, nhất quán của câu trả lời từ mô hình.
  - _Khi nào (When):_ Đặt `temperature = 0` (hoặc rất thấp) cho các tác vụ cần tính chính xác cao (code, trích xuất dữ liệu, RAG); đặt `temperature = 0.7 - 1.0` cho các tác vụ sáng tạo (viết văn, tạo ý tưởng).
  - _Cạm bẫy (Pitfall):_ Đặt `temperature` quá cao (ví dụ: 1.5 - 2.0) khiến mô hình sinh ra các chuỗi ký tự vô nghĩa hoặc lặp từ không kiểm soát.
- **11.3 Quản lý ngữ cảnh và Token Context Window**
  - _Cái gì (What):_ Khái niệm giới hạn cửa sổ ngữ cảnh (`Context Window`) và cơ chế tính phí theo số lượng token đầu vào (Input Tokens) và đầu ra (Output Tokens).
  - _Tại sao (Why):_ Tránh việc ứng dụng bị crash do vượt quá giới hạn token khi hội thoại quá dài, đồng thời tối ưu hóa chi phí API.
  - _Khi nào (When):_ Áp dụng các chiến thuật cắt tỉa lịch sử chat (như giữ lại N tin nhắn gần nhất hoặc tóm tắt hội thoại cũ - Sliding Window) khi xây dựng chatbot chạy dài hạn.
  - _Cạm bẫy (Pitfall):_ Gửi lại toàn bộ lịch sử trò chuyện khổng lồ sau mỗi lượt chat mà không cắt tỉa, làm tăng chi phí API theo cấp số cộng và cuối cùng làm mô hình bị quên các thông tin mới do tràn cửa sổ ngữ cảnh.
- **11.4 Dự án thực hành bài 11: Chatbot ghi nhớ ngữ cảnh thông minh**
  - _Yêu cầu:_ Viết ứng dụng Python/JS gọi API Gemini hoặc OpenAI, quản lý mảng lịch sử chat, tự động cắt tỉa các tin nhắn cũ hơn giới hạn 10 tin nhắn gần nhất để giữ cho prompt gọn gàng.

##### **Bài 12 — Structured Outputs & Function Calling** (`aie-structured-output-tools.html`)

- **12.1 Ép LLM trả về dữ liệu có cấu trúc: JSON Mode**
  - _Cái gì (What):_ Cách cấu hình mô hình để bắt buộc đầu ra phải tuân thủ định dạng JSON theo một Schema định sẵn (ví dụ: Pydantic trong Python hoặc JSON Schema).
  - _Tại sao (Why):_ LLM mặc định trả về văn bản tự do kèm lời dẫn (ví dụ: "Đây là kết quả của bạn: {...}"). Các chương trình phần mềm không thể parse lời tự do này một cách ổn định, bắt buộc phải có JSON chuẩn để đưa vào database hoặc API khác.
  - _Khi nào (When):_ Sử dụng JSON Mode hoặc Structured Outputs bất cứ khi nào LLM đóng vai trò là một module xử lý trung gian trong hệ thống phần mềm (vd: phân tích sắc thái, trích xuất thông tin thực thể).
  - _Cạm bẫy (Pitfall):_ Chỉ ghi trong Prompt "Hãy trả về JSON" mà không bật cấu hình hệ thống (JSON Mode / Structured Outputs), dẫn đến việc thỉnh thoảng LLM vẫn trả về text tự do hoặc markdown block (```json) làm hỏng hàm `JSON.parse()`.
- **12.2 Cầu nối với thế giới ngoài: Cơ chế Function Calling**
  - _Cái gì (What):_ Cơ chế LLM tự động nhận diện câu hỏi của người dùng cần đến công cụ hỗ trợ, sau đó tự sinh ra một yêu cầu gọi hàm (Tool Call) chứa tên hàm và các đối số (arguments) dạng JSON thay vì trả lời trực tiếp.
  - _Tại sao (Why):_ LLM không có thông tin thời gian thực và không thể tự thực hiện hành động (như đặt phòng, tra database, gửi mail). Function Calling giúp LLM "mượn" tay phần mềm để thực hiện các tác vụ này.
  - _Khi nào (When):_ Sử dụng khi muốn AI tự động quyết định khi nào cần gọi cơ sở dữ liệu, chạy máy tính hoặc gọi API bên thứ ba.
  - _Cạm bẫy (Pitfall):_ Hiểu lầm rằng LLM sẽ tự chạy hàm đó. LLM chỉ trả về tên hàm và tham số; việc chạy hàm và trả kết quả ngược lại cho LLM hoàn toàn là do code của nhà phát triển thực hiện.
- **12.3 Chu trình Tool Call hoàn chỉnh (Loop)**
  - _Cái gì (What):_ Quy trình 4 bước: (1) Gửi câu hỏi + danh sách công cụ -> (2) LLM trả về yêu cầu gọi hàm -> (3) Code hệ thống chạy hàm cục bộ và lấy kết quả -> (4) Gửi kết quả lại cho LLM để sinh câu trả lời cuối cùng.
  - _Tại sao (Why):_ Đảm bảo LLM tích hợp được kết quả thực tế vào câu trả lời thuyết phục người dùng.
  - _Khi nào (When):_ Áp dụng khi xây dựng các ứng dụng như tra cứu thời tiết, đặt vé, hoặc truy vấn báo cáo tài chính mới nhất.
  - _Cạm bẫy (Pitfall):_ Không bắt các lỗi ngoại lệ (exception) khi chạy hàm cục bộ, làm crash toàn bộ chu trình hoặc gửi lỗi thô của hệ thống cho LLM khiến nó trả lời ngớ ngẩn.
- **12.4 Dự án thực hành bài 12: Trình phân loại email và tự động lưu Database**
  - _Yêu cầu:_ Viết ứng dụng nhận vào nội dung email thô, yêu cầu LLM trích xuất các trường: `sender`, `urgency` (high/medium/low), và `summary` dưới dạng JSON chuẩn bằng Pydantic. Nếu độ khẩn cấp là `high`, hệ thống tự động gọi hàm gửi email cảnh báo thông qua Function Calling.

##### **Bài 13 — Cục bộ hóa AI với Ollama** (`aie-local-llm-ollama.html`)

- **13.1 Vì sao cần chạy LLM cục bộ (Local LLM)?**
  - _Cái gì (What):_ Khái niệm chạy các mô hình ngôn ngữ lớn mã nguồn mở (như Llama 3, Mistral, Gemma) trực tiếp trên CPU/GPU của máy tính cá nhân thay vì gọi API đám mây.
  - _Tại sao (Why):_ Bảo mật tuyệt đối dữ liệu nhạy cảm (không gửi dữ liệu nội bộ lên server OpenAI/Google), có thể chạy offline hoàn toàn miễn phí không giới hạn và tự do tùy biến.
  - _Khi nào (When):_ Sử dụng trong quá trình phát triển (development), chạy thử nghiệm thử các prompt mà không sợ tốn tiền, hoặc khi xây dựng các giải pháp bảo mật cho doanh nghiệp.
  - _Cạm bẫy (Pitfall):_ Kỳ vọng mô hình local nhỏ (như 7B, 8B tham số) có khả năng suy luận logic xuất sắc tương đương các siêu mô hình đám mây như GPT-4o hay Gemini Pro.
- **13.2 Giới thiệu Ollama & Quản lý mô hình**
  - _Cái gì (What):_ Ollama là công cụ đóng gói mô hình AI chạy local gọn nhẹ nhất. Các lệnh cơ bản: `ollama run`, `ollama pull`, và cách Ollama tự động tối ưu hóa phần cứng (sử dụng GPU MPS trên Mac, CUDA trên Windows).
  - _Tại sao (Why):_ Giúp cài đặt và chạy LLM chỉ bằng 1 dòng lệnh mà không cần cài đặt cấu hình thư viện PyTorch/CUDA phức tạp bằng tay.
  - _Khi nào (When):_ Sử dụng Ollama làm backend cục bộ cho toàn bộ dự án thử nghiệm AI trong suốt lộ trình học.
  - _Cạm bẫy (Pitfall):_ Cố tải các mô hình quá lớn so với bộ nhớ VRAM của GPU/RAM của máy dẫn đến mô hình chạy cực kỳ chậm (chỉ đạt 1-2 tokens/s do tràn sang RAM thường). Quy tắc: Mô hình 8B cần tối thiểu 8GB RAM trống; mô hình 70B cần tối thiểu 48GB RAM.
- **13.3 Tích hợp API Ollama vào ứng dụng Python & JS**
  - _Cái gì (What):_ Ollama cung cấp một REST API chạy ở cổng `localhost:11434` tương thích ngược với định dạng API của OpenAI.
  - _Tại sao (Why):_ Giúp nhà phát triển dễ dàng viết code kết nối và hoán đổi mô hình từ đám mây (OpenAI) sang cục bộ (Ollama) chỉ bằng cách đổi URL của endpoint (`baseURL`).
  - _Khi nào (When):_ Áp dụng khi viết ứng dụng AI có thể linh hoạt chạy cả offline lẫn online.
  - _Cạm bẫy (Pitfall):_ Quên xử lý hiện tượng rớt kết nối mạng nội bộ hoặc dịch vụ Ollama chưa khởi động trên máy người dùng.
- **13.4 Dự án thực hành bài 13: Ứng dụng AI Chat offline chạy 100% trên máy khách**
  - _Yêu cầu:_ Viết ứng dụng giao diện web (HTML/JS) kết nối trực tiếp đến Ollama API chạy ở localhost để tạo giao diện chat offline mượt mà, hỗ trợ stream chữ thời gian thực (Server-Sent Events).

- **13.4 Dự án thực hành bài 13: Ứng dụng AI Chat offline chạy 100% trên máy khách**
  - _Yêu cầu:_ Viết ứng dụng giao diện web (HTML/JS) kết nối trực tiếp đến Ollama API chạy ở localhost để tạo giao diện chat offline mượt mà, hỗ trợ stream chữ thời gian thực (Server-Sent Events).

##### **Bài 14 — Hệ thống RAG Cơ Bản: Hỏi đáp tài liệu** (`aie-rag-basics.html`)

- **14.1 Vì sao LLM cần RAG? Giải quyết ảo tưởng (Hallucination)**
  - _Cái gì (What):_ Khái niệm RAG (Retrieval-Augmented Generation) - cơ chế cung cấp thêm tài liệu tham khảo chính xác vào prompt của LLM để nó trả lời câu hỏi dựa trên đó.
  - _Tại sao (Why):_ LLM có tri thức tĩnh (được đóng băng tại thời điểm huấn luyện) và thường xuyên tự bịa ra thông tin (hallucinate) khi gặp câu hỏi về kiến thức mới hoặc thông tin bảo mật nội bộ. RAG giúp LLM cập nhật tri thức động mà không cần tốn chi phí tái huấn luyện mô hình.
  - _Khi nào (When):_ Luôn sử dụng RAG khi cần xây dựng ứng dụng chatbot hỗ trợ khách hàng, tra cứu tài liệu nội bộ, hoặc phân tích báo cáo doanh nghiệp.
  - _Cạm bẫy (Pitfall):_ Trộn quá nhiều tài liệu không liên quan vào prompt, làm loãng ngữ cảnh ngữ nghĩa (Lost in the middle) và làm tăng chi phí token vô ích.
- **14.2 Bản đồ quy trình RAG chuẩn (RAG Pipeline)**
  - _Cái gì (What):_ Sơ đồ luồng dữ liệu gồm 5 giai đoạn: Ingestion (đọc file PDF/Word) -> Chunking (cắt nhỏ) -> Embedding (hóa vector) -> Retrieval (tìm kiếm tương đồng ngữ nghĩa) -> Generation (LLM đọc ngữ cảnh và trả lời).
  - _Tại sao (Why):_ Đảm bảo tính mô-đun hóa của hệ thống, giúp nhà phát triển dễ dàng tối ưu hóa và gỡ lỗi độc lập tại từng khâu.
  - _Khi nào (When):_ Áp dụng khi bắt đầu thiết kế hệ thống RAG từ đơn giản đến phức tạp.
  - _Cạm bẫy (Pitfall):_ Coi nhẹ khâu làm sạch dữ liệu thô (Ingestion). Nếu nạp các file PDF chứa bảng biểu bị vỡ font hoặc chứa nhiều mã HTML rác, mô hình sẽ trả về kết quả cực kỳ kém.
- **14.3 Tích hợp Vector Database cục bộ: ChromaDB**
  - _Cái gì (What):_ Cách sử dụng ChromaDB làm Vector Database nhúng cục bộ trong Python để lưu trữ và truy vấn nhanh các vector nhúng ngữ nghĩa của văn bản.
  - _Tại sao (Why):_ ChromaDB siêu nhẹ, tự động hóa toàn bộ việc quản lý bộ lưu trữ vector cục bộ và tìm kiếm Cosine Similarity chỉ trong vài dòng code mà không cần cấu hình server phức tạp.
  - _Khi nào (When):_ Dùng ChromaDB làm giải pháp lưu trữ vector mặc định cho các dự án từ nhỏ đến vừa trong giai đoạn phát triển cục bộ.
  - _Cạm bẫy (Pitfall):_ Không thiết lập phương thức lưu trữ bền vững (persistent directory), dẫn đến việc cơ sở dữ liệu vector bị xóa hoàn toàn khỏi bộ nhớ RAM mỗi khi tắt ứng dụng.
- **14.4 Dự án thực hành bài 14: Hệ thống Chat hỏi đáp trên tài liệu PDF cá nhân**
  - _Yêu cầu:_ Viết ứng dụng Python đọc tệp PDF hướng dẫn sử dụng sản phẩm, cắt đoạn đơn giản, hóa vector bằng mô hình cục bộ của Hugging Face, lưu vào ChromaDB, nhận câu hỏi từ người dùng, tìm kiếm top 3 đoạn liên quan nhất và nhồi vào prompt để LLM Ollama trả lời chính xác.

##### **Bài 15 — Chiến thuật Chunking & Vector DB** (`aie-chunking-vector-db.html`)

- **15.1 Các kiểu cắt đoạn văn bản (Chunking Strategies)**
  - _Cái gì (What):_ So sánh các phương pháp cắt văn bản: Character-based (cắt theo ký tự cố định), Recursive Character-based (cắt lùi thông minh theo dấu xuống dòng, dấu chấm, dấu phẩy để giữ tính nguyên vẹn của câu), và Semantic Chunking (tự động cắt khi độ tương đồng vector giữa các câu liên tiếp giảm đột ngột).
  - _Tại sao (Why):_ Kích thước đoạn (Chunk size) quá lớn sẽ làm loãng thông tin; quá nhỏ sẽ làm mất ngữ cảnh liền trước và liền sau của thông tin quan trọng.
  - _Khi nào (When):_ Sử dụng Recursive Character làm mặc định cho đa số tài liệu; dùng Semantic Chunking khi tài liệu có cấu trúc ngữ nghĩa thay đổi liên tục.
  - _Cạm bẫy (Pitfall):_ Cắt đoạn thô thiển ở giữa câu, làm đôi nửa của một thông tin quan trọng (như số điện thoại, điều khoản hợp đồng) bị rơi vào hai chunk khác nhau, khiến không chunk nào đủ nghĩa khi truy xuất. Giải pháp: Sử dụng tham số gối đầu `overlap` thích hợp (10% - 20% kích thước chunk).
- **15.2 Cấu trúc bên trong của Vector Database: HNSW Indexing**
  - _Cái gì (What):_ Cơ chế tìm kiếm láng giềng gần nhất xấp xỉ (Approximate Nearest Neighbors - ANN) và thuật toán đồ thị phân tầng HNSW (Hierarchical Navigable Small World).
  - _Tại sao (Why):_ Tìm kiếm tuyến tính quét qua hàng triệu vector (Exact Search) sẽ cực kỳ chậm và làm đơ CPU. HNSW giúp tìm kiếm vector có độ tương đồng cao nhất trong thời gian mili-giây với độ phức tạp $O(\log N)$.
  - _Khi nào (When):_ Sử dụng chỉ mục HNSW khi dữ liệu tăng trưởng lên hàng chục nghìn đoạn văn bản trở lên.
  - _Trade-off:_ HNSW tăng tốc độ tìm kiếm cực nhanh nhưng đòi hỏi chi phí RAM cao để lưu trữ đồ thị liên kết và thời gian xây dựng chỉ mục (indexing time) lâu hơn.
  - _Cạm bẫy (Pitfall):_ Không hiểu bản chất xấp xỉ của ANN, dẫn đến việc thỉnh thoảng hệ thống bỏ sót các vector tương đồng nhất tuyệt đối (Recall rate < 100%).
- **15.3 Hybrid Search: Kết hợp ngữ nghĩa và từ khóa**
  - _Cái gì (What):_ Kỹ thuật kết hợp công cụ tìm kiếm ngữ nghĩa (Dense Retrieval bằng Embeddings) với tìm kiếm từ khóa cổ điển (Sparse Retrieval bằng thuật toán BM25).
  - _Tại sao (Why):_ Tìm kiếm ngữ nghĩa đôi khi bỏ sót các thuật ngữ chuyên ngành viết tắt, số model sản phẩm chính xác hoặc mã lỗi phần cứng. Hybrid Search tận dụng ưu điểm của cả hai thế giới.
  - _Khi nào (When):_ Sử dụng khi tài liệu chứa nhiều từ khóa chuyên môn, mã số sản phẩm, tên người, hoặc các lỗi hệ thống đặc thù.
  - _Cạm bẫy (Pitfall):_ Cộng trực tiếp điểm số của BM25 và Cosine Similarity (vì thang điểm của chúng hoàn toàn khác nhau, BM25 không giới hạn còn Cosine chỉ từ -1 đến 1). Cần sử dụng thuật toán chuẩn hóa như RRF (Reciprocal Rank Fusion) để ghép thứ hạng một cách chính xác.
- **15.4 Dự án thực hành bài 15: So sánh và đánh giá trực tiếp hiệu quả Chunking**
  - _Yêu cầu:_ Viết ứng dụng cắt cùng một cuốn sách bằng 3 chiến thuật khác nhau, lưu vào các collection ChromaDB riêng biệt, thực hiện cùng 1 câu hỏi truy vấn và in bảng so sánh độ khớp thông tin (Retrieval Recall) để thấy rõ sự khác biệt của cấu trúc chunk.

##### **Bài 16 — RAG Nâng Cao: Query Rewrite & Rerank** (`aie-advanced-rag.html`)

- **16.1 Tối ưu hóa câu hỏi: Kỹ thuật Query Rewriting**
  - _Cái gì (What):_ Kỹ thuật dùng một mô hình ngôn ngữ nhỏ làm nhiệm vụ phân tích và viết lại câu hỏi thô của người dùng thành các câu hỏi rõ nghĩa, sửa lỗi chính tả, hoặc chẻ thành nhiều câu truy vấn nhỏ (Sub-queries).
  - _Tại sao (Why):_ Người dùng thường đặt câu hỏi ngắn, tối nghĩa hoặc sai ngữ pháp (vd: "lỗi này sửa sao?"), khiến hệ thống tìm kiếm vector trả về các đoạn tài liệu hoàn toàn sai lệch.
  - _Khi nào (When):_ Áp dụng làm bước đệm đầu tiên ngay khi nhận câu hỏi từ người dùng trước khi gọi Vector DB.
  - _Cạm bẫy (Pitfall):_ LLM viết lại làm thay đổi hoàn toàn ý định ban đầu của người dùng, dẫn đến truy xuất sai lệch. Cần cấu hình prompt viết lại cực kỳ chặt chẽ kèm ví dụ mẫu (Few-shot prompting).
- **16.2 Bộ sắp xếp lại kết quả: Reranking với Cross-Encoder**
  - _Cái gì (What):_ Cơ chế Rerank sử dụng một mô hình Cross-Encoder (như BGE-Reranker) để tính toán điểm tương đồng chi tiết giữa câu hỏi và danh sách các đoạn tài liệu đã được tìm thấy ở bước 1 (Bi-Encoder).
  - _Tại sao (Why):_ Bi-Encoder (Vector DB) tìm kiếm rất nhanh nhưng đánh giá độ tương quan ngữ nghĩa ở mức tổng quát. Cross-Encoder tính toán sâu sắc hơn mối liên hệ từ-với-từ giữa câu hỏi và câu trả lời, giúp đưa tài liệu chính xác nhất lên vị trí số 1.
  - _Khi nào (When):_ Sử dụng khi RAG cơ bản thường xuyên lấy ra tài liệu đúng nhưng bị chôn vùi ở các thứ hạng thấp (Top 5-10) và LLM bỏ qua không đọc.
  - _Trade-off:_ Reranker giúp tăng chất lượng truy xuất cực cao nhưng tăng thêm khoảng 50-100ms độ trễ (latency) cho mỗi yêu cầu.
  - _Cạm bẫy (Pitfall):_ Rerank toàn bộ hàng nghìn chunk trong database. Việc này cực kỳ chậm và tốn tài nguyên. Quy trình chuẩn: Dùng Vector DB lấy nhanh Top 25, sau đó chỉ dùng Reranker lọc lấy Top 3 tốt nhất.
- **16.3 Parent-Child Indexing & Sentence-Window Retrieval**
  - _Cái gì (What):_ Kỹ thuật tách biệt dữ liệu tìm kiếm và dữ liệu đọc: (1) Parent-Child: Tìm kiếm trên các đoạn nhỏ (Child chunks) nhưng khi trả về cho LLM đọc thì lấy đoạn lớn bao quanh chứa nó (Parent chunk). (2) Sentence-Window: Tìm kiếm trên 1 câu đơn lẻ, nhưng khi LLM đọc thì lấy câu đó kèm 3 câu trước và 3 câu sau.
  - _Tại sao (Why):_ Các đoạn văn nhỏ hóa vector chính xác hơn vì thông tin tập trung, nhưng LLM cần ngữ cảnh lớn xung quanh để có câu trả lời đầy đủ, mạch lạc.
  - _Khi nào (When):_ Áp dụng khi tài liệu có mật độ thông tin dày đặc và các điều khoản phụ thuộc lẫn nhau trong cùng một phân đoạn lớn.
  - _Cạm bẫy (Pitfall):_ Quản lý id liên kết giữa parent và child bị sai lệch khiến hệ thống lấy nhầm đoạn ngữ cảnh lớn của tài liệu khác.
- **16.4 Dự án thực hành bài 16: Nâng cấp hệ thống RAG lên chuẩn doanh nghiệp**
  - _Yêu cầu:_ Xây dựng pipeline RAG tích hợp Query Rewriter -> Vector Search -> Reranker (sử dụng một local rerank model mini từ Hugging Face) để xuất ra câu trả lời cuối cùng có chất lượng vượt trội so với phiên bản Bài 14.

##### **Bài 17 — AI Agents & Vòng lặp ReAct** (`aie-agents-react.html`)

- **17.1 Định nghĩa AI Agent: Khác gì LLM thô?**
  - _Cái gì (What):_ Khái niệm AI Agent (đại lý trí tuệ nhân tạo) - hệ thống sử dụng LLM làm bộ não lập luận, kết hợp với bộ nhớ (Memory), các công cụ (Tools) và cơ chế tự ra quyết định/lập kế hoạch để thực hiện tác vụ tự động mà không cần kịch bản cứng.
  - _Tại sao (Why):_ LLM thô chỉ trả lời câu hỏi tĩnh; Agent có thể tự động chia nhỏ công việc phức tạp, tự gọi các công cụ liên tục để tự giải quyết vấn đề.
  - _Khi nào (When):_ Sử dụng Agent cho các tác vụ cần tính chủ động cao như tự động viết báo cáo nghiên cứu từ internet, tự động rà quét và sửa lỗi code.
  - _Cạm bẫy (Pitfall):_ Lạm dụng Agent cho các luồng xử lý đơn giản có thể giải quyết bằng code deterministic thông thường, làm tăng chi phí API và gây chậm trễ.
- **17.2 Vòng lặp tư duy ReAct (Reasoning + Acting)**
  - _Cái gì (What):_ Khung tư duy ReAct kết hợp suy luận logic và hành động trong một vòng lặp: Thought (Tôi cần làm gì?) -> Action (Tôi sẽ gọi công cụ nào?) -> Observation (Kết quả trả về của công cụ là gì?) -> lặp lại cho đến khi đạt được kết quả cuối cùng.
  - _Tại sao (Why):_ Giúp mô hình tự sửa sai; nếu kết quả từ công cụ bị lỗi (Observation là lỗi), mô hình sẽ tự động suy nghĩ lại ở bước tiếp theo để chọn công cụ khác hoặc thay đổi tham số.
  - _Khi nào (When):_ Áp dụng khi Agent cần tương tác với các công cụ không tất định như tìm kiếm mạng hoặc chạy code.
  - _Cạm bẫy (Pitfall):_ Agent rơi vào vòng lặp vô hạn (Infinite Loop) khi LLM liên tục gọi cùng một công cụ lỗi mà không thoát được. Cần đặt giới hạn số bước chạy tối đa (Max Iterations).
- **17.3 Tích hợp và thiết kế Custom Tools**
  - _Cái gì (What):_ Cách viết và khai báo các công cụ tùy biến (Custom Tools) dưới dạng hàm Python/JS kèm docstring mô tả chi tiết công năng để LLM đọc và chọn.
  - _Tại sao (Why):_ Docstring và định nghĩa kiểu dữ liệu chính là giao diện (API) để LLM giao tiếp; mô tả công cụ kém khiến LLM truyền sai tham số.
  - _Khi nào (When):_ Thiết kế công cụ bất cứ khi nào Agent cần tương tác với cơ sở dữ liệu nội bộ, hệ thống tệp tin hoặc gọi API chuyên dụng.
  - _Cạm bẫy (Pitfall):_ Mô tả công cụ quá ngắn hoặc quá mơ hồ làm LLM chọn nhầm công cụ hoặc truyền sai định dạng đối số.
- **17.4 Dự án thực hành bài 17: Tự viết Đại lý giải toán và tra cứu thông tin thời gian thực**
  - _Yêu cầu:_ Viết Agent bằng Python sử dụng Ollama/Gemini, thiết lập 2 công cụ cục bộ: (1) Máy tính (chạy eval toán học an toàn) và (2) Google Search mini (gọi API tìm kiếm web). Viết vòng lặp ReAct thô bằng code để quan sát cách Agent suy nghĩ, gọi công cụ, lấy kết quả và tổng hợp câu trả lời.

##### **Bài 18 — Đại lý có trạng thái với LangGraph** (`aie-langgraph-stateful-agents.html`)

- **18.1 Vì sao các framework cũ (LangChain) bị giới hạn? Sự ra đời của Graph-based Agent**
  - _Cái gì (What):_ Hạn chế của luồng xử lý tuyến tính (Chains) trong việc thiết kế các Agent phức tạp có vòng lặp rẽ nhánh phi tuyến tính. Khái niệm lập trình Agent dưới dạng đồ thị trạng thái có hướng (DAG) sử dụng thư viện LangGraph.
  - _Tại sao (Why):_ LangGraph cho phép biểu diễn các luồng làm việc phức tạp của AI dưới dạng các Nút (Nodes - hành động của Agent hoặc Tools) và các Cạnh (Edges - luồng chuyển trạng thái và rẽ nhánh dựa trên điều kiện).
  - _Khi nào (When):_ Sử dụng LangGraph khi xây dựng các hệ thống AI Agent quy mô lớn, có sự tương tác giữa nhiều Agent khác nhau (Multi-agent) hoặc có vòng lặp kiểm thử/sửa lỗi.
  - _Cạm bẫy (Pitfall):_ Thiết kế đồ thị quá phức tạp khiến luồng đi bị rối và khó gỡ lỗi (spaghetti graph).
- **18.2 Quản lý Trạng thái chung (State Management)**
  - _Cái gì (What):_ Khái niệm biến trạng thái (`State`) chia sẻ giữa các nút trong đồ thị. Cách các nút đọc thông tin từ state, cập nhật state (ví dụ: append tin nhắn mới vào lịch sử) và truyền tiếp đi.
  - _Tại sao (Why):_ Đảm bảo tính nhất quán của thông tin trong suốt chu trình chạy phức tạp của Agent mà không bị mất dấu ngữ cảnh.
  - _Khi nào (When):_ Cấu hình state bằng TypedDict hoặc Pydantic trong LangGraph khi khởi tạo đồ thị.
  - _Cạm bẫy (Pitfall):_ Ghi đè (overwrite) nhầm các thông tin quan trọng trong state thay vì cập nhật tích lũy (append/reducer), dẫn đến việc mất lịch sử hội thoại của Agent.
- **18.3 Cơ chế Con người phê duyệt (Human-in-the-loop)**
  - _Cái gì (What):_ Kỹ thuật cấu hình đồ thị tạm dừng (Interrupt) trước khi thực hiện một hành động nhạy cảm (như gửi email, thanh toán, sửa DB) để chờ sự phê duyệt hoặc chỉnh sửa từ con người.
  - _Tại sao (Why):_ LLM không đáng tin cậy 100%; cơ chế Human-in-the-loop là bắt buộc để đảm bảo an toàn hệ thống trong các ứng dụng thực tế của doanh nghiệp.
  - _Khi nào (When):_ Áp dụng trước các nút thực thi ghi dữ liệu (Write operations) hoặc gọi các API tốn phí lớn.
  - _Cạm bẫy (Pitfall):_ Cấu hình ngắt không đúng khiến đồ thị bị kẹt trạng thái vô hạn mà không phản hồi cho người dùng phê duyệt.
- **18.4 Dự án thực hành bài 18: Quy trình tự động lập trình, tự chạy kiểm thử và sửa lỗi code có kiểm duyệt**
  - _Yêu cầu:_ Xây dựng đồ thị LangGraph gồm: Node `coder` (LLM viết code Python giải bài toán) -> Node `tester` (Chạy thử file test) -> rẽ nhánh điều kiện: nếu test đạt -> dừng và trả kết quả; nếu test lỗi -> chuyển tiếp về Node `coder` kèm log lỗi để sửa lại (tối đa 3 lần). Tích hợp ngắt duyệt của người dùng trước khi xuất file code cuối cùng.

##### **Bài 19 — Tinh chỉnh mô hình (Fine-tuning LLM)** (`aie-fine-tuning-lora.html`)

- **19.1 Khi nào nên Fine-tune? Phân biệt với RAG**
  - _Cái gì (What):_ Khái niệm tinh chỉnh (Fine-tuning) mô hình là huấn luyện tiếp mô hình pre-trained trên tập dữ liệu chuyên biệt để thay đổi trọng số của nó. So sánh 2 chiều chi tiết RAG (cung cấp kiến thức ngoài tạm thời) vs Fine-tuning (dạy kỹ năng mới, định hình văn phong, cấu trúc đầu ra dài hạn).
  - _Tại sao (Why):_ RAG không giúp thay đổi giọng điệu của AI và bị giới hạn bởi cửa sổ ngữ cảnh. Fine-tuning giúp mô hình học sâu cấu trúc chuyên môn và giảm thiểu số lượng token hướng dẫn cần gửi kèm trong prompt.
  - _Khi nào (When):_ Fine-tune khi cần dạy mô hình tuân thủ tuyệt đối một định dạng output đặc thù, nói chuyện theo giọng điệu thương hiệu, hoặc khi cần mô hình nhỏ (7B) học kỹ năng lập luận chuyên ngành của mô hình lớn (knowledge distillation).
  - _Cạm bẫy (Pitfall):_ Fine-tune mô hình chỉ để nạp kiến thức tĩnh (ví dụ: cập nhật danh sách sản phẩm mới). Việc này rất kém hiệu quả và nhanh chóng bị lỗi thời; RAG là giải pháp đúng cho bài toán nạp kiến thức tĩnh.
- **19.2 Cứu cánh tài nguyên: Kỹ thuật LoRA và QLoRA**
  - _Cái gì (What):_ Bản chất toán học của LoRA (Low-Rank Adaptation - đóng băng trọng số gốc, chỉ huấn luyện 2 ma trận nhỏ bổ trợ có rank thấp) và QLoRA (lượng tử hóa mô hình gốc về 4-bit trước khi áp dụng LoRA).
  - _Tại sao (Why):_ Huấn luyện toàn bộ trọng số (Full Fine-tuning) một mô hình 7B cần hàng trăm GB VRAM (yêu cầu siêu máy tính GPU A100). LoRA/QLoRA giúp tinh chỉnh mô hình 7B chỉ trên 1 card GPU tiêu dùng (như RTX 3090/4090 hoặc thậm chí Colab miễn phí).
  - _Khi nào (When):_ Sử dụng thư viện `peft` và `trl` để cấu hình huấn luyện LoRA/QLoRA cho các dự án thực tế.
  - _Cạm bẫy (Pitfall):_ Chọn chỉ số Rank ($r$) quá cao làm phình to số tham số cần học và mất tính tối ưu bộ nhớ; chọn quá thấp khiến mô hình không học được kỹ năng mới. (Khuyên dùng $r=8$ hoặc $16$).
- **19.3 Chuẩn bị dữ liệu huấn luyện (SFT Dataset)**
  - _Cái gì (What):_ Định dạng dữ liệu SFT (Supervised Fine-Tuning) dạng hội thoại (ShareGPT hoặc định dạng ChatML). Cách xây dựng tập dữ liệu sạch gồm các cặp `Instruction` -> `Response`.
  - _Tại sao (Why):_ Chất lượng dữ liệu quyết định 90% sự thành bại của fine-tuning ("Garbage in, garbage out"). Tập dữ liệu nhỏ nhưng siêu sạch (vd: 1000 mẫu chất lượng cao) tốt hơn nhiều triệu mẫu nhiễu.
  - _Khi nào (When):_ Thu thập và chuẩn hóa dữ liệu trước khi bắt đầu huấn luyện.
  - _Cạm bẫy (Pitfall):_ Dữ liệu huấn luyện chứa các câu trả lời sai hoặc không nhất quán định dạng, làm mô hình sau huấn luyện bị mất khả năng suy luận cơ bản (catastrophic forgetting).
- **19.4 Dự án thực hành bài 19: Tinh chỉnh mô hình Llama 3 thành chuyên gia hỗ trợ kỹ thuật**
  - _Yêu cầu:_ Viết script Python sử dụng thư viện `transformers` và `trl` (SFTTrainer), nạp tập dữ liệu 500 dòng hội thoại hỗ trợ kỹ thuật, thực hiện huấn luyện QLoRA mô hình Llama 3 8B, lưu file LoRA weights, và ghép (merge) vào mô hình gốc để sử dụng.

##### **Bài 20 — MLOps: Deploy, Tracing & Đánh giá** (`aie-mlops-eval.html`)

- **20.1 Serving mô hình hiệu năng cao với vLLM**
  - _Cái gì (What):_ Cơ chế hoạt động của vLLM và kỹ thuật quản lý bộ nhớ đệm `PagedAttention` (lấy cảm hứng từ Virtual Memory của hệ điều hành).
  - _Tại sao (Why):_ Serving LLM bằng mã nguồn thô của Hugging Face cực kỳ chậm và tốn VRAM. vLLM giúp tăng tốc độ suy luận (throughput) lên gấp 10-20 lần, phục vụ hàng trăm kết nối đồng thời trên cùng một GPU.
  - _Khi nào (When):_ Sử dụng vLLM khi deploy mô hình local lên server Production phục vụ người dùng thật.
  - _Cạm bẫy (Pitfall):_ Chạy vLLM mà không giới hạn tỷ lệ sử dụng bộ nhớ đệm GPU (`gpu_memory_utilization`), làm hệ thống dễ bị lỗi crash OOM đột ngột khi lượng request tăng cao.
- **20.2 Đánh giá hệ thống RAG tự động bằng Ragas**
  - _Cái gì (What):_ Khái niệm đánh giá không cần con người bằng framework Ragas sử dụng các chỉ số: `faithfulness` (độ trung thực của câu trả lời so với tài liệu được tìm thấy), `answer relevance` (câu trả lời có đúng trọng tâm câu hỏi), và `context recall` (tài liệu tìm thấy có đủ thông tin).
  - _Tại sao (Why):_ Việc đọc và đánh giá thủ công hàng nghìn câu trả lời RAG của người dùng là bất khả thi. Ragas tự động hóa khâu kiểm tra chất lượng hệ thống sau mỗi lần thay đổi prompt hoặc cách cắt đoạn.
  - _Khi nào (When):_ Chạy đánh giá Ragas định kỳ hoặc tích hợp vào pipeline CI/CD trước khi cập nhật phiên bản ứng dụng AI.
  - _Cạm bẫy (Pitfall):_ Tin tưởng tuyệt đối vào điểm số Ragas mà không chạy thử mẫu thực tế (sanity check) để phát hiện các trường hợp LLM chấm điểm sai lệch.
- **20.3 Tracing & Giám sát luồng suy luận (Tracing with Phoenix/LangSmith)**
  - _Cái gì (What):_ Khái niệm Tracing (theo dấu) từng bước xử lý của LLM trong ứng dụng phức tạp. Cách tích hợp thư viện Phoenix để ghi nhận mọi cuộc gọi API, thời gian trễ (latency), số lượng token sử dụng, và nội dung prompt thô.
  - _Tại sao (Why):_ Khi Agent hoặc RAG trả lời sai, rất khó biết lỗi do khâu nào nếu không nhìn được cụ thể dữ liệu truyền qua lại giữa các nút. Tracing cung cấp một "hộp đen máy bay" ghi lại toàn bộ lịch sử chạy của AI.
  - _Khi nào (When):_ Bật Tracing cho cả môi trường Development để gỡ lỗi và Production để giám sát chất lượng.
  - _Cạm bẫy (Pitfall):_ Ghi nhận dữ liệu nhạy cảm (như mật khẩu hoặc thông tin cá nhân của người dùng) vào hệ thống Tracing công cộng, gây vi phạm bảo mật dữ liệu.
- **20.4 Dự án thực hành bài 20: Bản build hoàn chỉnh hệ thống AI Agent chạy Production**
  - _Yêu cầu:_ Đóng gói hệ thống Agent lập trình tự động từ Bài 18 vào container Docker, viết API FastAPI phục vụ vLLM, cấu hình hệ thống ghi log tracing bằng Phoenix, chạy thử nghiệm 50 câu hỏi test và chạy đánh giá tự động bằng Ragas để xuất ra file báo cáo chất lượng hệ thống (RAG Eval Report).

#### 4. Cam kết chất lượng học thuật (Step 4 — Content Quality Contract)

Series "Kỹ Sư AI Thực Chiến" phải tuân thủ nghiêm ngặt các tiêu chuẩn chất lượng học thuật sau đây:

1. **Chỉ dùng Tiếng Việt (Vietnamese Only):** Theo quy định mới từ ngày 2026-07-03, toàn bộ nội dung bài học, tiêu đề bài viết, phần meta hero, và các liên kết liên quan sẽ viết trực tiếp bằng tiếng Việt, không chia tách thuộc tính `data-lang-content="en"|"vi"`. Phần thanh điều hướng (header) và chân trang (footer) dùng chung hệ thống `data-i18n` của website để đồng bộ toàn trang.
2. **Độ dài bài học:** Tối thiểu 1.200 từ tiếng Việt cho mỗi bài viết chuyên sâu. Nội dung tập trung giải thích bản chất cơ chế hoạt động, tránh viết hời hợt hoặc chỉ dán code mà không giải thích.
3. **Ví dụ code chạy được:** Tối thiểu 4 khối `.code-window` cho mỗi bài học, sắp xếp tăng dần từ đơn giản (minimal) -> thực tế (realistic) -> tối ưu (optimized).
4. **Công thức toán học:** Sử dụng thư viện KaTeX cục bộ (`blog/katex.min.js` và `blog/katex.min.css`) để kết xuất công thức dạng `$…$` (inline) hoặc `$$…$$` (block). Mỗi công thức toán đều phải kèm theo một câu giải thích rõ ràng ý nghĩa của từng ký hiệu.
5. **Chú thích Callout:** Tối thiểu 3 callout cho mỗi bài học (sử dụng `.callout` với các biến thể `--note`, `--tip`, `--warning`, `--pitfall`, `--deep` trong tệp `blog.css`). Bắt buộc có ít nhất 1 cạm bẫy học thuật (`--pitfall`).
6. **Liên kết chéo nội bộ (Cross-linking Map):** Tối thiểu 3 liên kết chéo. Bản đồ liên kết chéo gợi ý cho Series 16:
   - Bài 10 (Transformer) -> liên kết đến Bài 10 của Series 12 (Trí tuệ nhân tạo) để tham khảo cơ chế Attention thô bằng JS.
   - Bài 7 (CNN) -> liên kết đến Bài 8 của Series 12 (CNN thô bằng JS).
   - Bài 18 (LangGraph) -> liên kết đến Series 3 (DSA) về cấu trúc đồ thị và thuật toán duyệt đồ thị.
   - Bài 15 (Vector DB/HNSW) -> liên kết đến Series 3 (DSA - Cấu trúc dữ liệu cây và đồ thị) và Series 7 (SQL - Đánh chỉ mục Index).
7. **Tài liệu tham khảo ngoài:** Tối thiểu 3 liên kết ngoài chất lượng cao đặt trong khối `.article-refs` (đến tài liệu PyTorch, Ollama, LangGraph chính thức hoặc bài báo học thuật gốc), mở trong tab mới (`target="_blank" rel="noopener noreferrer"`).
8. **Quiz ôn tập:** Tối thiểu 3 câu hỏi trắc nghiệm tương tác ở cuối bài học thông qua hệ thống `ide.js`/`ide.css` kèm giải thích chi tiết đáp án khi người học bấm kiểm tra.

#### 5. Danh mục tích hợp & Triển khai (Step 5 — Integration Checklist)

Ngay sau khi viết xong nội dung, việc tích hợp series mới vào hệ thống tĩnh của js-tools.org phải hoàn thành đầy đủ các đầu việc sau:

1. **Khởi tạo thư mục và tệp tin:**
   - Tạo thư mục `blog/aie/` lưu trữ toàn bộ mã nguồn của các bài học.
   - Tạo trang Hub trung tâm: `blog/aie/aie-programming-series.html` (sử dụng cấu trúc `.lessons-list` và bảng Thuật ngữ Glossary).
   - Tạo các tệp bài học tương ứng dạng `blog/aie/aie-js-to-python.html`, `blog/aie/aie-math-code.html`, etc. (loại bỏ đuôi `.html` trong các liên kết nội bộ).
2. **Cấu hình dùng chung:**
   - Đăng ký màu sắc nhãn thẻ trong `blog/blog.css`: lớp `.blog-card__tag--aie` với màu chủ đạo Emerald/Teal nhạt để phân biệt với các thẻ khác.
   - Kiểm tra và đóng gói các thư viện NumPy, PyTorch, Ollama syntax highlighter trong `blog/prism.js`.
3. **Tích hợp trang chủ và trang Blog:**
   - **Tải lên trang Hub blog (`blog/index.html`):** Thêm thẻ `a.blog-card` có nhãn tag `aie` và liên kết dẫn đến trang Hub Series 16.
   - **Tải lên trang chủ gốc (`index.html` ở thư mục gốc):** Thêm một thẻ `a.learn-card` vào khu vực "Khóa học Lập trình" (Programming Courses) với tiêu đề "Kỹ Sư AI Thực Chiến". Đảm bảo số lượng `.learn-card` ở trang chủ khớp 100% với số lượng `.blog-card` ở `blog/index.html`.
4. **Cấu hình SEO & Tìm kiếm:**
   - Đăng ký tất cả các đường dẫn mới (trang Hub + 20 trang bài viết) vào tệp sitemap tĩnh `sitemap.xml` với thứ tự ưu tiên `priority="0.7"` cho bài viết và `0.8` cho trang Hub.
   - Cập nhật chỉ mục tìm kiếm khách hàng `blog/search-index.json`: thêm đầy đủ 21 đối tượng chứa từ khóa tiêu đề (EN/VI) và danh sách H2 để công cụ tìm kiếm trên trang Blog có thể quét trúng bài viết.
5. **Cập nhật tài liệu nội bộ:**
   - Cập nhật sơ đồ thư mục và số lượng bài học trong `README.md` và `AGENTS.md`.
6. **Kiểm tra QA trước khi bàn giao (QA Gate):**
   - Chạy môi trường local: `npx serve -l 5500 .`.
   - Kiểm tra hiển thị responsive trên các thiết bị Mobile (<600px), Tablet (<880px) và Desktop.
   - Quét qua toàn bộ nội dung HTML để đảm bảo không còn sót bất kỳ cú pháp markdown thô nào như `**` hay `` ` `` chưa được dịch sang thẻ HTML tương ứng.

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
