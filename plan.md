# Kế Hoạch & Lộ Trình Phát Triển Các Series Bài Học Mới — js-tools.org

Tài liệu này cung cấp **định hướng chi tiết, ngăn xếp công nghệ (tech stack), thiết kế giao diện demo tương tác và nội dung học thuật chuyên sâu** cho từng bài học trong 5 series mới để phục vụ thẩm định trước khi triển khai thực tế.

> ⚠️ **Quy tắc kỹ thuật/QA (Điều kiện chặn, Definition of Done, checklist trước khi báo "xong")
> đã chuyển sang [`check-lesson.md`](check-lesson.md)** — đọc file đó TRƯỚC KHI viết bài và
> chạy lại TRƯỚC KHI báo hoàn thành. File này (`plan.md`) chỉ còn giữ **thiết kế nội dung**
> (đề cương, tech stack, đề bài) và các quyết định **đặc thù riêng từng series**.

---

## 📈 Progress & Status (Cập nhật 2026-07-03)

| Series                                          | Tên                                     | Bài hoàn thành | Tổng bài | %           |
| ----------------------------------------------- | --------------------------------------- | -------------- | -------- | ----------- |
| 🎉 **Series 2: WebGPU**                         | **Đồ họa 3D & Compute Shader**          | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 6: CSS & Animation**                | **Hiệu ứng & Bố cục Web hiện đại**      | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 3: DSA Trực Quan**                  | **Cấu Trúc Dữ Liệu & Giải Thuật**       | **12/12**      | **12**   | **100%** ✅ |
| Series 1                                        | WebAssembly & Rust                      | 0/10           | 10       | 0%          |
| Series 4                                        | WebRTC & WebSocket                      | 0/8            | 8        | 0%          |
| Series 5                                        | Toy JS Engine (Trình thông dịch JS)     | 0/?            | TBD      | 0%          |
| 🎉 **Series 7: SQL**                            | **SQL trong Trình duyệt (SQLite-WASM)** | **17/17**      | **17**   | **100%** ✅ |
| 🎉 **Series 8: Web Audio**                      | **Âm Thanh & Visualizer**               | **8/8**        | **8**    | **100%** ✅ |
| 🎉 **Series 9: Git**                            | **Mô Hình & Quy Trình Làm Việc**        | **13/13**      | **13**   | **100%** ✅ |
| 🎉 **Series 10: Điện Tử**                       | **Điện Tử & Mô Phỏng Vi Mạch**          | **16/16**      | **16**   | **100%** ✅ |
| 🎉 **Series 11: VLSI**                          | **Thiết Kế Vi Mạch Số & FPGA (VLSI)**   | **14/14**      | **14**   | **100%** ✅ |
| 🎉 **Series 12: AI**                            | **Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM** | **19/19**      | **19**   | **100%** ✅ |
| 🎉 **Series 13: Hệ Thống Nhúng**                | **Từ Thanh Ghi Đến RTOS**               | **16/16**      | **16**   | **100%** ✅ |
| 🎉 **Series 14: Xử Lý Tín Hiệu Số**             | **Từ Mẫu Đến Phổ**                      | **15/15**      | **15**   | **100%** ✅ |
| 🎉 **Series 15: Kiến Trúc Máy Tính**            | **Từ Logic Đến Lượng Tử**               | **12/12**      | **12**   | **100%** ✅ |
| 🎉 **Series 16: Kỹ Sư AI Thực Chiến**           | **Lộ Trình Lập Trình Viên Web**         | **20/20**      | **20**   | **100%** ✅ |
| 🎉 **Series 17: Chẩn Đoán &amp; Sửa Chữa Mạch** | **Từ Đo Kiểm Đến Sửa Chữa Thực Chiến**  | **8/8**        | **8**    | **100%** ✅ |
| 🎉 **Series 18: Kỹ Thuật Hệ Thống AI**          | **Từ Pipeline Đến Đội Ngũ Agent**       | **13/13**      | **13**   | **100%** ✅ |
| 🎉 **Series 19: Cơ Sở Dữ Liệu Vector**          | **Từ Thuật Toán Đến Ứng Dụng RAG**      | **9/9**        | **9**    | **100%** ✅ |
| 🎉 **Series 20**                                | **Thiết Kế Hệ Thống**                   | **18/18**      | 18       | **100% ✅** |

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
>
> **2026-07-15:** Đã gỡ tương tự phần thiết kế chi tiết (tech stack, đề cương, syllabus H2, Quality
> Contract riêng) của **Series 17 (Chẩn Đoán &amp; Sửa Chữa Mạch Điện Tử)** sau khi hoàn thành 8/8
> (100%) — bản đầy đủ vẫn còn trong lịch sử git trước commit này nếu cần tham chiếu lại.
>
> **2026-07-16:** Đã gỡ tương tự phần đề cương chi tiết của **Series 16 (Kỹ Sư AI Thực Chiến)** sau
> khi hoàn thành 20/20 (100%) — bản đầy đủ vẫn còn trong lịch sử git trước commit này nếu cần tham
> chiếu lại.
>
> **2026-07-16:** Đã gỡ nốt phần thiết kế chi tiết của **Series 13 (Hệ Thống Nhúng)** — series này
> đã 16/16 (100%) từ trước nhưng chưa từng được dọn (rà soát phát hiện khi kiểm tra toàn bộ file).
> Mục "Quality contract & Checklist triển khai" vốn dùng chung với Series 14 (xem ghi chú
> 2026-07-13) nay cũng đã gỡ hết vì cả hai series đều xong. Bản đầy đủ vẫn còn trong lịch sử git
> trước commit này nếu cần tham chiếu lại.
>
> **2026-07-16 (retroactive, quyết định bổ sung):** Chủ dự án yêu cầu bỏ hẳn mục quiz khỏi **Series 16
> (Kỹ Sư AI Thực Chiến, 20/20)** và sau đó áp dụng tương tự cho **Series 12 (Trí Tuệ Nhân Tạo, 19/19)**
> — cả hai đã 100% hoàn thành từ trước theo chuẩn CÓ quiz. Xoá khối `.quiz-container` ở toàn bộ 39 bài
> (20 + 19), thay bằng nội dung/ví dụ sâu hơn — mọi con số/khẳng định mới đều chạy Python/Node xác minh
> trước khi viết, không suy luận suông. Làm theo lô nhỏ trong cùng ngày, đọc kỹ để bắt coherence thay vì
> chỉ xoá-thêm cơ học.
>
> Nhân tiện phát hiện và sửa một số lỗi/coherence có sẵn không liên quan trực tiếp đến quiz: số dòng mồ
> côi, câu văn lẫn tiếng Anh, một khẳng định sai về hướng bias correction của Adam, demo CNN tuyên bố
> "học thành công" trên dữ liệu ngẫu nhiên vô nghĩa, retrieval RAG không có ngưỡng, hàm code chết kèm lỗi
> thật, thiếu `import re` khiến 1 Agent LangGraph luôn thất bại âm thầm, vài vị trí ASCII arrow `<-` phá
> vỡ bộ quét HTML của `check-lesson.js`, và vài link nội bộ hỏng (`href="#"` placeholder hoặc trỏ nhầm
> bài). Bài học chung rút ra: đọc lại kỹ + **chạy thử thật** mọi demo code (không chỉ đọc chữ) là kỹ
> thuật hiệu quả nhất để bắt lỗi tồn tại từ trước, vượt xa việc chỉ rà soát văn bản.
>
> Còn 1 vấn đề phát hiện nhưng KHÔNG sửa (ngoài phạm vi bài viết): `check-lesson.js` mục "Related Links
> Arrows" báo false positive với link tới bài "RNN → Attention" (mũi tên là tiêu đề thật, không phải gõ
> tay) — đã tách thành task riêng (`task_108187b2`) để sửa logic scanner thay vì đổi nội dung bài.
>
> Đã cập nhật `headingsVi`/`headingsEn` trong `blog/search-index.json` cho toàn bộ 39 bài. Chi tiết đầy
> đủ từng bài/từng lô/từng số liệu verify vẫn còn nguyên trong lịch sử git (`git log -- plan.md`, commit
> trước commit này) nếu cần tham chiếu lại.

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

## 🤖 Series 18: Kỹ Thuật Hệ Thống AI (Từ Pipeline Đến Đội Ngũ Agent)

> **Định danh series (chốt 2026-07-16):**
>
> | Trường          | Giá trị                                                                                                 |
> | --------------- | ------------------------------------------------------------------------------------------------------- |
> | Tên series (VI) | Kỹ Thuật Hệ Thống AI: Từ Pipeline Đến Đội Ngũ Agent                                                     |
> | Thư mục slug    | `blog/aisys/`                                                                                           |
> | File hub        | `aisys-programming-series.html`                                                                         |
> | Mẫu slug bài    | `aisys-<chu-de>.html` (vd `aisys-data-pipeline.html`)                                                   |
> | Tag class CSS   | `.blog-card__tag--aisys`                                                                                |
> | Màu accent      | `#3b82f6` (xanh dương — chưa trùng 28 tag hiện có)                                                      |
> | Prism ngôn ngữ  | `js` (đã có sẵn) — mọi pseudo-code training/data pipeline mô phỏng bằng JS thuần, không cần grammar mới |
>
> **Phân biệt với 2 series AI đã có (để tránh trùng lặp):**
>
> - **Series 12 (AI: Từ Neuron Đến LLM)** dạy **toán & kiến trúc model** — từ linear regression tới tự viết GPT-mini.
> - **Series 16 (Kỹ Sư AI Thực Chiến)** dạy **ứng dụng đơn agent** — RAG, prompting, fine-tuning LoRA, 1 agent ReAct/LangGraph.
> - **Series 18 (series này)** dạy **hệ thống hoá ở tầm sản phẩm/tổ chức** — không lặp lại toán model hay 1-agent cơ bản, mà đi sâu vào 3 track:
>   1. **Track A — Hậu trường công nghiệp:** quy trình thật tạo ra 1 AI product (data pipeline, distributed training khái niệm, RLHF/alignment, red-teaming, benchmark, model versioning, chi phí hạ tầng).
>   2. **Track B — Kiến trúc multi-agent:** orchestration nhiều agent phối hợp, giao tiếp, phân vai, blackboard pattern, kiến trúc kiểu AutoGen/CrewAI, xử lý xung đột/deadlock.
>   3. **Track C — Tự viết framework agent từ số 0:** góc kỹ sư hệ thống — tự viết abstraction cho tool-calling, memory, prompt template, callback/streaming (thu nhỏ 1 LangChain/LangGraph bằng JS thuần).
> - **Ngoại lệ quality contract riêng của Series 18 (chốt 2026-07-16):** **KHÔNG bắt buộc mục "Câu hỏi trắc nghiệm ôn tập"** ở cuối mỗi bài — bỏ quiz để dành không gian cho nội dung sâu/dài hơn và tiết kiệm context khi triển khai. Đây là ngoại lệ **chỉ áp dụng cho Series 18**, không áp dụng ngược cho series khác đã/đang làm. Mọi rubric định lượng khác (Phần IV §2: số mục H2, độ dài, code window, callout, bảng so sánh, cross-link, tài liệu tham khảo, glossary) vẫn áp dụng đầy đủ như chuẩn chung.
> - **Demo tương tác:** được phép là mô phỏng/visualizer tự viết bằng JS (giống cách Series 12 mô phỏng neural net, Series 11 VLSI mô phỏng RTL) — KHÔNG bắt buộc chạy model/framework AI thật trên trình duyệt, đúng ràng buộc no-build-step của site.

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** Pure JavaScript (ES6+, `type="module"`), không TypeScript, không framework.
- **Engine dùng chung (co-located, tái sử dụng qua nhiều bài — giống pattern VLSI `vlsi-verilite.js`, xem `check-lesson.md` PHẦN A mục 6):**
  - `aisys-mock-llm.js` — một "LLM giả lập" tất định (deterministic): nhận `(systemPrompt, messages, tools[])`, trả lời bằng luật khớp từ khoá + template biên soạn sẵn (không gọi API thật, không cần khoá API, không cần mạng). Đây là "bộ não" đứng sau mọi agent trong toàn series — mô phỏng đủ hành vi thật (chọn gọi tool nào, khi nào dừng, khi nào ảo giác/refuse) để dạy đúng cơ chế mà không cần LLM thật.
  - `aisys-agent-kernel.js` — framework agent tự viết (Track C): `Agent` class (system prompt, memory, tool registry), `Tool` interface (`name`, `schema`, `execute`), `Memory` (short-term buffer + key-value store mô phỏng vector recall bằng so khớp từ khoá), `runReActLoop()` (Thought → Action → Observation → lặp), callback/streaming event emitter (`onToken`, `onToolCall`, `onFinish`).
  - `aisys-orchestrator.js` — điều phối nhiều agent (Track B): hàng đợi message giữa agent, `Blackboard` (shared state store, agent đọc/ghi), `Router` (phân task theo vai trò/khả năng agent), phát hiện & xử lý deadlock (2 agent chờ nhau) và xung đột ghi (2 agent sửa cùng 1 key blackboard).
  - `aisys-pipeline-sim.js` — mô phỏng vòng đời huấn luyện (Track A): các "stage" (thu thập → làm sạch → chia train/val/test → training loop rút gọn → RLHF reward scoring → red-team probe → benchmark eval → deploy/rollback), mỗi stage là hàm thuần chạy trên dữ liệu đồ chơi (mảng số nhỏ), có độ trễ giả lập (không phải training thật) để trực quan hoá thời gian/chi phí tương đối giữa các giai đoạn.
- **Giao diện:** HTML5 Canvas (vẽ đồ thị agent + message bus) + SVG (sơ đồ pipeline dạng timeline, dễ style/animate hơn canvas cho box-and-arrow tĩnh).
- **Không cần:** API key thật, WebGPU/WASM (mock LLM chạy CPU-nhẹ bằng luật, không cần tăng tốc), backend/server.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Agent Orchestra Console" (Bàn Điều Phối Dàn Agent)** — file `aisys-agent-orchestra.html`, dùng xuyên suốt Track B + C (mỗi bài nhúng lại với kịch bản/tool khác nhau qua tham số cấu hình, không viết lại engine).
- **Mô tả giao diện (3 panel):**
  1. **Trái — Canvas đồ thị agent:** mỗi agent là 1 node tròn (tên vai trò: Planner, Researcher, Coder, Critic…), đường nối là message bus; khi agent gửi message, một "hạt" chạy dọc theo cạnh nối kèm tooltip nội dung message; node đổi màu viền theo trạng thái (đang nghĩ / đang gọi tool / đang chờ / lỗi deadlock — viền đỏ nhấp nháy).
  2. **Giữa — Blackboard (shared state) trực tiếp:** bảng key-value hiển thị trạng thái chung mọi agent đọc/ghi (vd `task_status`, `draft_answer`, `budget_remaining`); mỗi lần 1 agent ghi, dòng đó highlight nhấp nháy + ghi chú "ghi bởi Agent X lúc bước N" — trực quan hoá xung đột khi 2 agent ghi cùng key trong cùng bước.
  3. **Phải — Log thực thi từng bước (ReAct trace):** danh sách cuộn `Thought → Action(tool, args) → Observation → ...` theo từng agent, màu theo agent; nút Step/Play/Reset điều khiển tốc độ giống Algo Sandbox (Series 3) đã có.
- **Dưới cùng — Bảng điều khiển kịch bản:** dropdown chọn kịch bản demo (vd "2 agent tranh chấp 1 tài nguyên → deadlock", "Planner–Coder–Critic tự sửa lỗi bằng vòng phản hồi", "Pipeline huấn luyện: 5 stage chạy tuần tự kèm đồng hồ chi phí") + nút "Bơm lỗi" (buộc 1 agent trả lời sai/tool lỗi) để minh hoạ cơ chế retry/fallback.
- **Vì sao đây là visualizer đúng "cốt lõi" của series:** nó là nơi DUY NHẤT mà cả 3 track hội tụ — Track A (pipeline stage timeline) chạy như 1 kịch bản trong cùng console; Track B (blackboard, deadlock) là panel giữa; Track C (ReAct trace, tool schema) là panel phải và chính là code người học tự viết ra rồi cắm vào console để xem chạy thật.

### 3. Đề cương tổng quan (Overview Syllabus)

> Thứ tự: **Track A (bối cảnh — vì sao/thế nào 1 AI product ra đời) → Track C (tự viết nguyên liệu framework) → Track B (dùng nguyên liệu đó điều phối nhiều agent) → Capstone (ghép cả 3)**. Lý do đặt C trước B: Track B (orchestration nhiều agent) cần các khối `Agent`/`Tool`/`Memory` đã tự viết ở Track C làm đơn vị điều phối — không thể dạy "điều phối nhiều agent" trước khi có khái niệm "1 agent" hoàn chỉnh.

| Bài | Track    | Tên bài học                                                  | Nội dung CS chuyên sâu                                                                                                                                                                                                 | Dự án/Demo đi kèm                                                                                                            |
| --- | -------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | A        | **Vòng Đời Một AI Product Thật**                             | Toàn cảnh pipeline công nghiệp (data → train → RLHF → eval → deploy → monitor); ai làm gì ở mỗi giai đoạn; vì sao "train xong" mới là 20% công việc.                                                                   | Timeline SVG tương tác 6 giai đoạn, click từng giai đoạn xem chi phí/thời gian/nhân sự tương đối.                            |
| 2   | A        | **Thu Thập & Làm Sạch Dữ Liệu**                              | Nguồn dữ liệu (web crawl, license, PII), dedup, lọc chất lượng/độc hại, data drift, class imbalance.                                                                                                                   | Demo lọc bộ dữ liệu đồ chơi: kéo thanh trượt ngưỡng chất lượng, xem % dữ liệu bị loại + phân bố trước/sau.                   |
| 3   | A        | **Huấn Luyện Phân Tán (Khái Niệm)**                          | Data parallelism vs model parallelism vs pipeline parallelism, gradient sync, checkpoint, sharding.                                                                                                                    | `aisys-pipeline-sim.js`: mô phỏng N "worker" giả lập chia batch, đồng bộ gradient theo bước, đo overhead sync.               |
| 4   | A        | **RLHF & Alignment**                                         | Reward model, PPO khái niệm, preference dataset, vì sao SFT chưa đủ, chi phí gán nhãn con người.                                                                                                                       | Demo chấm điểm 2 câu trả lời (A/B) xây "reward model" đồ chơi từ preference của người dùng.                                  |
| 5   | A        | **Red-Teaming & Đánh Giá Benchmark**                         | Adversarial prompt, jailbreak class, benchmark suite (đa nhiệm/đa domain), Goodhart's law khi tối ưu benchmark.                                                                                                        | Bảng "tấn công thử" — người học nhập prompt tấn công, mock-LLM phản hồi theo luật + bảng điểm benchmark trước/sau vá.        |
| 6   | A        | **Model Versioning, Rollback & Chi Phí Hạ Tầng**             | Semantic versioning cho model/weight, A/B canary deploy, rollback khi regression, ước lượng chi phí GPU-hour/inference.                                                                                                | Dashboard giả lập "fleet" nhiều phiên bản model, so sánh latency/lỗi, nút rollback tức thời.                                 |
| 7   | C        | **Tool-Calling — Thiết Kế Interface Tool**                   | Function/tool schema (JSON Schema), validate input trước khi thực thi, sandbox hoá side-effect, tool registry pattern.                                                                                                 | Tự viết `Tool` interface + 3 tool đồ chơi (calculator, tra từ điển giả, đọc "file"), agent tự chọn tool đúng.                |
| 8   | C        | **Memory & Prompt Template Engine**                          | Short-term (context window) vs long-term memory, so khớp từ khoá mô phỏng vector recall, template engine (system/few-shot/variable inject).                                                                            | Bảng memory trực quan: hội thoại dài dần, xem context bị "cắt" (truncate) và recall từ long-term memory.                     |
| 9   | C        | **ReAct Loop, Callback & Streaming — Tự Viết Runtime Agent** | Vòng lặp Thought→Action→Observation, event emitter cho streaming token, xử lý lỗi tool (retry/backoff), giới hạn số bước tránh vòng lặp vô hạn.                                                                        | `aisys-agent-kernel.js` hoàn chỉnh: 1 agent tự trả lời câu hỏi nhiều bước bằng tool thật đã viết ở Bài 7–8.                  |
| 10  | B        | **Kiến Trúc Multi-Agent — Vai Trò & Giao Tiếp**              | Phân vai (Planner/Executor/Critic), message passing giữa agent, giao thức điều phối tập trung vs phi tập trung.                                                                                                        | Agent Orchestra Console: kịch bản 3 agent (Planner–Coder–Critic) tự sửa lỗi qua vòng phản hồi.                               |
| 11  | B        | **Blackboard Pattern & Shared State**                        | Kiến trúc blackboard cổ điển (AI symbolic), so sánh với shared-memory kiểu CrewAI, race condition khi nhiều agent ghi cùng lúc.                                                                                        | Panel Blackboard trực tiếp: 2 agent cùng ghi 1 key, trực quan xung đột + chiến lược giải quyết (lock/merge/last-write-wins). |
| 12  | B        | **Orchestration Nâng Cao — Xung Đột & Deadlock**             | Deadlock (2 agent chờ nhau), livelock, timeout/circuit-breaker, kiến trúc kiểu AutoGen (group chat) vs CrewAI (hierarchical crew).                                                                                     | Kịch bản cố ý gây deadlock trong Console, người học chỉnh timeout/priority để giải quyết trực tiếp trên UI.                  |
| 13  | Capstone | **Dự Án: AI Ops Center**                                     | Ghép cả 3 track: pipeline (Bài 1–6) sinh ra "model", framework (Bài 7–9) đóng gói thành agent, orchestration (Bài 10–12) điều phối đội agent giám sát chính pipeline đó (agent tự phát hiện regression → tự rollback). | Phiên bản đầy đủ Agent Orchestra Console: dashboard vận hành mô phỏng 1 tổ chức AI thu nhỏ, từ train tới agent tự vận hành.  |

> **Kiểm tra phụ thuộc kiến thức:** Bài 7–9 (Track C) chỉ dùng khái niệm đã học ở Bài 1 (bối cảnh) — không cần Bài 2–6. Bài 10–12 (Track B) bắt buộc dùng lại `Agent`/`Tool`/`Memory` đã tự viết ở Bài 9 — nếu người đọc bỏ qua Track C sẽ callout `--note` "cần đã hoàn thành Bài 9" ở đầu Bài 10. Bài 13 (Capstone) tham chiếu ngược cả 12 bài — là bài duy nhất được phép dùng toàn bộ khái niệm series.

### 4. Quality contract riêng của Series 18

- Áp dụng **toàn bộ** rubric Phần IV §2 (mục H2 ≥4/≥5, ≥1.200 từ/bài, ≥4 `.code-window`, ≥1 visualizer/sơ đồ, ≥3 callout kèm ≥1 `--pitfall`, ≥1 bảng so sánh khi có khái niệm đối lập, ≥3 cross-link nội bộ, ≥3 tài liệu tham khảo ngoài, glossary đầy đủ, ≥1 file code tải về) **NGOẠI TRỪ dòng Quiz** — đã chốt bỏ hẳn mục "Câu hỏi trắc nghiệm ôn tập" cho cả 13 bài (xem ghi chú ở định danh series và Phần IV §2).
- Vì không có quiz, chỗ trống dành cho quiz phải chuyển thành nội dung sâu hơn thật sự — ưu tiên thêm ví dụ/anti-pattern, mở rộng phần "Cạm bẫy", hoặc thêm 1 case study thực tế — không để bài ngắn hơn các series khác.
- Tài liệu tham khảo ngoài cho Track A nên ưu tiên nguồn kỹ thuật uy tín thật (paper InstructGPT/RLHF gốc, blog kỹ thuật OpenAI/Anthropic/DeepMind, tài liệu MLPerf cho benchmark) thay vì nguồn tổng hợp chung chung.

### 5. Checklist triển khai & tích hợp (Series 18)

- [ ] Tạo thư mục `blog/aisys/`.
- [ ] Hạ tầng dùng chung (nếu chưa có từ series khác): callout/`.article-refs`/glossary/KaTeX/giscus đã có sẵn toàn site — chỉ cần thêm `.blog-card__tag--aisys` (màu `#3b82f6`) vào `blog/blog.css`. Không cần Prism grammar mới (chỉ dùng `js`).
- [ ] 4 file engine dùng chung: `aisys-mock-llm.js`, `aisys-agent-kernel.js`, `aisys-orchestrator.js`, `aisys-pipeline-sim.js` — viết 1 lần, tái dùng qua 13 bài.
- [ ] Core visualizer `aisys-agent-orchestra.html` (3 panel — xem Phần II mục 4).
- [ ] Trang hub `aisys-programming-series.html` (copy từ `webgl-programming-series.html`, `.lessons-list` 13 dòng, glossary EN–VI thuật ngữ series: RLHF, red-team, blackboard, deadlock, ReAct, tool-calling…).
- [ ] 13 trang bài học — mỗi bài: `.article-body` theo đề cương H2 ở Phần III, `.code-tabs` (Preview | JS), `.article-refs`, `.article-related` (prev/next/hub), `.article-comments` (giscus) — **KHÔNG có mục quiz** (ngoại lệ đã chốt).
- [ ] File code co-located mỗi bài (`.js`) cho nút "Tải file code thực hành".
- [ ] Tích hợp toàn cục sau khi xong: `blog/index.html` (`a.blog-card` + `.blog-card__tag--aisys`), ROOT `index.html` (`a.learn-card`, đối chiếu số lượng khớp `blog/index.html`), `sitemap.xml` (hub priority 0.8 + 13 bài + visualizer priority 0.7), `blog/search-index.json` (13 entry, `headingsVi` khớp H2 thật), `README.md`/`AGENTS.md` (cập nhật số series/bài + Last Updated), và cập nhật bảng tiến độ đầu `plan.md` (`X/13`).
- [ ] Chạy đủ `check-lesson.md` PHẦN C cho từng bài trước khi báo "xong" — **bỏ qua duy nhất** lệnh đếm `quiz-container`/`quiz-question` (Phần C1 mục 6) vì series này không có quiz; mọi lệnh C1 khác vẫn chạy đầy đủ.

---

## 🗄️ Series 19: Cơ Sở Dữ Liệu Vector (Từ Thuật Toán Đến Ứng Dụng RAG)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** Pure JavaScript (ES6+), HTML5, CSS3.
- **Thư viện/API:** HTML5 Canvas & SVG (trực quan hóa), KaTeX local (hiển thị công thức toán học).
- **Engine dùng chung (co-located, viết 1 lần dùng chung cho cả series):**
  - `vdb-engine.js` — Thư viện động cơ vector in-browser:
    - Định nghĩa các độ đo khoảng cách: Cosine Similarity, Euclidean Distance (\(L_2\)), Manhattan Distance (\(L_1\)), Dot Product.
    - Flat Index: Tìm kiếm KNN brute-force tuyến tính.
    - IVF (Inverted File Index): Phân cụm k-means để gom nhóm và tạo chỉ mục ngược.
    - HNSW (Hierarchical Navigable Small World) rút gọn: Xây dựng skip list đồ thị trên không gian metric.
    - Product Quantization (PQ): Phân đoạn vector, học codebook qua k-means, nén sang code byte ngắn.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Vector Search & Indexing Lab" (Phòng Thử Nghiệm Chỉ Mục & Tìm Kiếm Vector)** — file `vdb-sandbox.html`
- **Mô tả giao diện (3 panel):**
  1. **Trái — Control Panel (Bảng điều khiển):**
     - Dropdown chọn kiểu chỉ mục: Flat (KNN), IVF, HNSW, PQ.
     - Slider cấu hình tham số: số chiều vector (\(d=2\) hoặc \(d=3\) để vẽ được trực quan), số lượng vector (\(N=100 - 1000\)), số lân cận \(k\), số centroid (cho IVF), số tầng & tỷ lệ kết nối (cho HNSW), số segment & số centroid con (cho PQ).
     - Nút "Tạo ngẫu nhiên dữ liệu", "Bắt đầu tìm kiếm", "Đưa thêm vector mới".
  2. **Giữa — Visualizer Space (Không gian trực quan hóa):**
     - Canvas vẽ không gian 2D (hoặc 3D giả lập xoay được) chứa các điểm vector.
     - Khi chọn **HNSW**: Vẽ các layer đồ thị xếp chồng lên nhau. Khi tìm kiếm, vẽ đường đi (greedy path) bằng một "hạt sáng" di chuyển qua các node từ layer cao nhất xuống layer 0.
     - Khi chọn **IVF**: Vẽ các ô Voronoi bao quanh các centroid. Khi tìm kiếm, highlight ô được kích hoạt.
     - Khi chọn **PQ**: Hiển thị bảng codebook và cách ánh xạ vector gốc thành các code ngắn.
  3. **Phải — Benchmark & Analytics (Báo cáo hiệu năng):**
     - So sánh thời gian thực thi (ms) và số phép tính khoảng cách (Distance calculations) giữa chỉ mục đang chọn và Flat Index (brute-force).
     - Đo lường độ chính xác thực tế (Recall@K).
     - Biểu đồ so sánh động và bảng so sánh Trade-off giữa Speed (Tốc độ) - Memory (Bộ nhớ) - Recall (Độ chính xác).

### 3. Đề cương tổng quan (Overview Syllabus)

| Bài | Tên bài học                                | Nội dung CS chuyên sâu                                                                                                                                              | Dự án/Demo đi kèm                                                                                                                      |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Khái niệm & Vai trò của Vector DB**      | Phân biệt CSDL quan hệ/tài liệu vs CSDL Vector (Metric space vs Relational model); Curse of Dimensionality khi tìm kiếm tương đồng trên số chiều lớn.               | Bộ tạo điểm vector 2D ngẫu nhiên và truy vấn khoảng cách tuyến tính thô hiển thị vòng quét trực quan.                                  |
| 2   | **Pipeline Nhúng Dữ Liệu (Embeddings)**    | Quá trình chuyển đổi dữ liệu phi cấu trúc (text/image/audio) thành dense vector; bản chất toán học của vector không gian biểu diễn (feature spaces).                | Trình mô phỏng Tokenizer và đếm tần suất/từ khóa để chuyển văn bản thô thành vector biểu diễn.                                         |
| 3   | **Độ Đo Khoảng Cách & So Khớp Tương Đồng** | Bản chất hình học và sự đánh đổi của các độ đo: Cosine Similarity, Euclidean Distance (\(L_2\)), Manhattan Distance (\(L_1\)), Dot Product (Inner Product).         | Bàn tính toán khoảng cách tương tác trong không gian 2D/3D, hiển thị các vector và độ đo thay đổi theo vị trí điểm.                    |
| 4   | **Lưu Trữ Hybrid: Vector & Metadata**      | Cách lưu trữ nhị phân cho vector hiệu năng cao kết hợp CSDL Key-Value cho structured metadata để đảm bảo truy vấn độ trễ thấp và lọc nhanh.                         | Database engine đơn giản quản lý cấu trúc bản ghi gồm Vector ID + Embedding Array + Metadata JSON, hỗ trợ thêm/xóa/truy vấn.           |
| 5   | **Chỉ Mục IVF (Inverted File Index)**      | Phân cụm không gian bằng thuật toán K-Means; phân hoạch không gian bằng Voronoi cells; xây dựng Inverted File (danh sách ngược) để thu hẹp tìm kiếm.                | Sơ đồ phân hoạch Voronoi tương tác: kéo thả tâm cụm (centroids) và xem các điểm vector tự động gom cụm trên Canvas.                    |
| 6   | **Chỉ Mục Đồ Thị HNSW**                    | Cấu trúc đồ thị đa tầng (Multi-layer Graph); Small World Network; thuật toán Greedy Search trên đồ thị; skip lists cho không gian metric đa chiều.                  | Trực quan hóa HNSW 3 tầng: Nhập query, xem quá trình greedy search nhảy qua các layer đồ thị xếp chồng đến node gần nhất.              |
| 7   | **Nén Vector Product Quantization (PQ)**   | Kỹ thuật lượng tử hóa (Quantization); phân rã không gian (subspaces); huấn luyện codebook; tính khoảng cách xấp xỉ bằng Asymmetric Distance (ADC) qua lookup table. | Trình nén vector PQ: cấu hình số segment, xem codebook được học và so sánh sai số khoảng cách nén vs dung lượng tiết kiệm.             |
| 8   | **Lọc Metadata (Metadata Filtering)**      | So sánh Pre-filtering (lọc trước), Post-filtering (lọc sau), và Single-stage/Joint filtering (lọc đồng thời trong quá trình duyệt chỉ mục đồ thị).                  | Trình duyệt chỉ mục kết hợp lọc thuộc tính (ví dụ: `price < 100` AND `category == "book"`) và tìm kiếm tương đồng vector trên Canvas.  |
| 9   | **Dự Án Capstone: RAG Search Engine**      | Kiến trúc Retrieval-Augmented Generation (RAG) toàn diện; tích hợp hybrid search; phân tích trade-off và so sánh các giải pháp (Pinecone, Milvus, Qdrant, Chroma).  | Công cụ tìm kiếm ngữ nghĩa (Semantic Search Engine) hoàn chỉnh chạy in-browser dùng `vdb-engine.js` để tìm đoạn tài liệu phù hợp nhất. |

### 4. Quy ước chất lượng (Quality Contract - Series 19)

- **Ngoại lệ bỏ Quiz (giống Series 18):** KHÔNG bắt buộc có mục "Câu hỏi trắc nghiệm ôn tập" ở cuối mỗi bài. Bỏ quiz để dành không gian cho nội dung học thuật sâu và dài hơn. Mọi định mức khác trong `references/quality-contract.md` vẫn áp dụng đầy đủ.
- **Nội dung chuyên sâu:** Mỗi bài học tối thiểu 1200 từ tiếng Việt. Tối thiểu 4 `.code-window` (chứa ví dụ code cài đặt logic hoặc json minh họa).
- **Chú thích & Học thuật:** Tối thiểu 3 callout (bắt buộc ≥1 `--pitfall` cảnh báo các cạm bẫy thiết kế), glossary đầy đủ định nghĩa trên trang hub, KaTeX cục bộ vẽ đầy đủ công thức toán học tính khoảng cách có giải thích ký hiệu đi kèm.
- **Tính thực tiễn:** Có ít nhất 1 bảng so sánh khi xuất hiện các khái niệm đối lập (ví dụ: Relational vs Vector DB, L2 vs Cosine, Pre vs Post Filtering), và có liên kết tải code mẫu tự chạy bằng Node.js độc lập cho mỗi bài.

### 5. Danh sách công việc triển khai & tích hợp (Series 19)

- [ ] **Tạo thư mục & Cấu hình:** Tạo thư mục `blog/vectordb/`. Đăng ký màu tag `.blog-card__tag--vdb` (color: `#4f46e5`, background: `rgba(79, 70, 229, 0.08)`) trong file `blog/blog.css`.
- [ ] **Engine dùng chung:** Phát triển file `vdb-engine.js` co-located trong thư mục series để làm thư viện xử lý vector chung cho cả series.
- [ ] **Trang Visualizer chính:** Thiết kế `vdb-sandbox.html` làm demo cốt lõi nhúng iframe (3 panel điều khiển, trực quan hóa HNSW/Voronoi/PQ, benchmark so sánh).
- [ ] **Trang Hub chương trình:** Thiết kế trang chủ khóa học `vectordb-programming-series.html` (hub curriculum, glossary EN-VI đầy đủ).
- [ ] **9 trang bài học độc lập:** Viết 9 file bài học HTML tương ứng theo đúng đề cương H2 (KHÔNG có phần quiz), cấu trúc `.code-tabs`, references chuẩn, liên kết related, comments Giscus (đầy đủ thẻ H2 Bình luận phía trên).
- [ ] **Tích hợp toàn cục:**
  - Thêm thẻ `a.blog-card` vào `blog/index.html`.
  - Thêm thẻ `a.learn-card` vào ROOT `index.html`.
  - Đăng ký sitemap.xml (9 bài + 1 hub + 1 visualizer).
  - Đăng ký search-index.json (9 entry mới, headingsVi khớp H2 thực tế).
  - Cập nhật tiến độ `plan.md` (`X/9` ở bảng trạng thái đầu file).
  - Cập nhật README.md và AGENTS.md.
- [ ] **Kiểm thử QA tự động:** Chạy `node check-lesson.js` và `npx prettier --check` trên từng file bài viết trước khi báo cáo hoàn thành.

## 🏗️ Series 20: Thiết Kế Hệ Thống (Từ Một Server Đến Triệu Người Dùng)

### 0. Định danh series (Series Identity)

| Trường          | Giá trị                                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tên series (VI) | Thiết Kế Hệ Thống: Từ Một Server Đến Triệu Người Dùng                                                                                                                                                                                           |
| Thư mục         | `blog/sysdesign/`                                                                                                                                                                                                                               |
| File hub        | `sysdesign-programming-series.html`                                                                                                                                                                                                             |
| Mẫu slug bài    | `sysdesign-<chu-de>.html`                                                                                                                                                                                                                       |
| Tag class CSS   | `.blog-card__tag--sysdesign`                                                                                                                                                                                                                    |
| Accent color    | `#38bdf8` (bg `rgba(56, 189, 248, 0.08)`)                                                                                                                                                                                                       |
| Prism languages | `js`, `bash`, `sql`, `yaml` (đã có) + **`json`** (CHƯA có → phải bổ sung grammar hoặc alias sang `javascript`). File cấu hình `nginx.conf` dùng `language-bash` làm fallback (Prism chưa có grammar `nginx`, không thêm mới để giữ bundle nhỏ). |

> **Điểm khác biệt cốt lõi của series này:** đây là series đầu tiên có **hai track thực hành song song** — mô phỏng in-browser (thấy ngay, không cần cài gì) VÀ **lab Docker chạy thật trên máy người học** (đo số liệu thật). Lý do: System Design bản chất là về hành vi hệ phân tán — độ trễ hàng đợi, replication lag, failover, cache hit ratio — những thứ **mô phỏng chỉ gợi ý được, chạy thật mới cảm được**. Tiền lệ đã có trong repo: `blog/sql/sql-docker-lab-setup.html` dựng PostgreSQL bằng Docker cho "những gì browser không demo nổi".

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

**Track A — "Thấy": mô phỏng in-browser** (chạy trên trang, không cài đặt)

- **Ngôn ngữ:** Pure JavaScript (ES6+), HTML5 Canvas & SVG, CSS3. KaTeX local cho công thức (Little's Law, công thức hàng đợi, toán độ khả dụng, xác suất trùng khoá).
- **Engine dùng chung (co-located, viết 1 lần dùng cho cả series):**
  - `sysdesign-sim-engine.js` — **lõi mô phỏng sự kiện rời rạc (discrete-event simulation)**, không phụ thuộc DOM:
    - `Node`: một thành phần hạ tầng (LB / app server / cache / DB / queue) có **capacity** (RPS tối đa), **hàng đợi** (độ dài hữu hạn), **phân phối thời gian phục vụ** (hằng số / exponential / có đuôi dài), và trạng thái sống/chết.
    - `Request`: mang timestamp từng chặng để tính latency phân rã theo từng hop.
    - Bộ thu số liệu: throughput, tỉ lệ drop, latency **p50/p95/p99** (histogram), utilization từng node.
    - Tiêm lỗi (failure injection): giết node, tăng latency đột biến, làm đầy hàng đợi.
  - `sysdesign-topology.js` — **renderer Canvas**: vẽ sơ đồ topology + "gói tin" chạy động giữa các node + panel số liệu trực tiếp. Tách riêng khỏi engine để mỗi bài chỉ cần cấu hình topology khác nhau.
  - `sysdesign-hashring.js` — vòng **consistent hashing** (dùng ở bài sharding & cache): thêm/bớt node và đếm chính xác số key phải di trú.

**Track B — "Chạy thật": lab Docker trên máy người học** (tải về, chạy bằng `docker compose`)

- **Hạ tầng:** Docker + Docker Compose. Toàn bộ nằm trong **một** thư mục tải về `sysdesign-lab/` dùng chung cho cả series, **mở rộng dần qua từng bài bằng Docker Compose profiles** (`docker compose --profile lb up -d`) — không bắt người học dựng lại stack mới mỗi bài.
- **Thành phần:** `nginx` (reverse proxy / load balancer), **app Node.js viết chay bằng module `http` thuần** (không Express — đúng tinh thần no-framework của site, và để người học thấy rõ vòng đời request), `redis` (cache / rate limiter / pub-sub / stream), `postgres` (primary + read replica).
- **Công cụ đo tải:** `wrk` hoặc `autocannon` (chạy trong container phụ để người học không phải cài lên máy) — mọi con số trong bài **phải là số đo thật**, kèm cấu hình máy đo, không được bịa.

> **Ràng buộc giữ nguyên:** trang web vẫn Pure HTML + CSS + vanilla JS, **không build step**. Docker chỉ tồn tại dưới dạng **file tải về** (`docker-compose.yml`, `nginx.conf`, `app.js`) hiển thị trong `.code-window` và link download — giống hệt cách series SQL làm. Không có bước build nào cho chính trang blog.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Traffic Lab" (Phòng Lab Lưu Lượng)** — file `sysdesign-sandbox.html`
- **Vì sao đây là demo cốt lõi:** khái niệm quan trọng nhất mà **mọi sơ đồ tĩnh đều không truyền tải được** là _lý thuyết hàng đợi_ — độ trễ **không** tăng tuyến tính theo tải, mà bùng nổ theo hàm phi tuyến khi utilization tiến tới 100%. Người học phải tự tay kéo thanh RPS và **thấy p99 dựng đứng** mới thực sự hiểu vì sao "server còn 20% CPU rảnh" vẫn có thể đang chết.
- **Mô tả giao diện (3 panel):**
  1. **Trái — Bảng điều khiển:**
     - Chọn topology mẫu: `1 server` → `LB + N app` → `+ cache` → `+ DB replica` → `+ message queue` (khớp đúng lộ trình bài học, mỗi bài "mở khoá" thêm 1 topology).
     - Slider: RPS đến (10 → 10.000), số app replica (1–8), cache hit ratio (0–100%), DB max connections, độ dài hàng đợi tối đa.
     - Chọn thuật toán LB: Round Robin / Least Connections / Random / Consistent Hashing.
     - Nút tiêm lỗi: "Giết 1 app server", "DB chậm 10×", "Cache sập" — xem hệ thống suy thoái (degrade) hay sụp hoàn toàn (cascade failure).
  2. **Giữa — Không gian trực quan hoá (Canvas):**
     - Vẽ topology dạng đồ thị; **mỗi request là một hạt sáng** chạy qua các hop theo đúng thời gian mô phỏng.
     - Mỗi node hiển thị **hàng đợi dạng cột đang dâng lên** + % utilization; node quá tải đổi đỏ, node chết gạch chéo, request bị drop bay ra ngoài.
     - Đường nào là bottleneck được tô sáng tự động.
  3. **Phải — Số liệu & Phân tích:**
     - Histogram latency trực tiếp với vạch p50/p95/p99; throughput thực nhận vs RPS gửi vào; tỉ lệ drop.
     - **Đồ thị "Utilization ↔ Latency"** vẽ dần theo thời gian — chính là hình ảnh trực quan của công thức hàng đợi $W = \frac{1}{\mu - \lambda}$, cho thấy đường tiệm cận đứng khi $\lambda \to \mu$.
     - Bảng đối chiếu "trước/sau" khi bạn thay đổi 1 tham số, để thấy rõ đánh đổi.

### 3. Đề cương tổng quan (Overview Syllabus) — 18 bài

Cột **Cần trước** ghi số bài tiên quyết, dùng để kiểm chuỗi phụ thuộc (bài N chỉ được dùng khái niệm đã dạy ở bài nhỏ hơn N). Cột **Demo (A)** là mô phỏng in-browser, cột **Lab thật (B)** là phần chạy Docker trên máy.

| Bài | Tên bài học                                     | Nội dung CS chuyên sâu                                                                                                                                                                                                                               | Demo (A) — in-browser                                                                                                       | Lab thật (B) — Docker                                                                                                            | Cần trước        |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | **Latency, Throughput & Lý Thuyết Hàng Đợi**    | Phân biệt latency vs throughput; tail latency và vì sao p99 mới là con số thật; Little's Law $L = \lambda W$; utilization → latency phi tuyến $W = 1/(\mu-\lambda)$; bậc độ lớn latency (L1 → RAM → SSD → mạng liên vùng).                           | Traffic Lab tối giản 1 node: kéo RPS, xem hàng đợi dâng và p99 dựng đứng khi utilization → 100%.                            | —                                                                                                                                | —                |
| 2   | **Dựng Lab & Đo Giới Hạn Một Server**           | Vòng đời một HTTP request trong Node.js `http` thuần; event loop vs blocking; cách đo đúng (warm-up, số connection, coordinated omission); tìm điểm bão hoà thực tế.                                                                                 | Sơ đồ SVG vòng đời request qua event loop; so sánh handler blocking vs async.                                               | `docker compose up` 1 app Node; chạy `wrk` tăng dần tải, vẽ bảng RPS ↔ p50/p99 **số đo thật**, tìm knee point.                   | 1                |
| 3   | **Scale Ngang & Load Balancing**                | Vertical vs horizontal scaling; L4 vs L7; thuật toán Round Robin / Least Connections / Random / Weighted; health check chủ động-thụ động; sticky session và cái giá của state cục bộ.                                                                | Traffic Lab: đổi thuật toán LB, thêm/bớt replica, giết node xem health check phản ứng.                                      | Thêm profile `lb`: nginx + 3 app replica; xem log phân phối request; giết 1 container xem failover.                              | 1, 2             |
| 4   | **Reverse Proxy & API Gateway**                 | Phân biệt reverse proxy / LB / API Gateway; TLS termination; định tuyến theo path & header; offload auth; request aggregation; đánh đổi khi gateway thành single point of failure.                                                                   | Sơ đồ tương tác: click từng chặng xem header bị thêm/xoá (`X-Forwarded-For`, `Host`), request đi đường nào.                 | Mở rộng nginx thành gateway: route `/api/*` → app, `/static/*` → nginx, thêm TLS tự ký, đo overhead thật.                        | 3                |
| 5   | **Caching: Cache-Aside, TTL & Vô Hiệu Hoá**     | Các mẫu cache-aside / read-through / write-through / write-behind; TTL vs invalidation tường minh; hit ratio ảnh hưởng p99 thế nào; **thundering herd / cache stampede** và cách chống (lock, jitter TTL, stale-while-revalidate); eviction LRU/LFU. | Traffic Lab + node cache: kéo hit ratio 0→100%, xem p99 và tải DB thay đổi; nút "Cache sập" xem herd đánh sập DB.           | Thêm profile `cache`: Redis; đo p99 trước/sau cache; tự tay tái tạo thundering herd rồi vá bằng lock.                            | 1, 3             |
| 6   | **CDN & Edge Caching**                          | Vì sao khoảng cách vật lý là giới hạn cứng (tốc độ ánh sáng); PoP/edge vs origin; `Cache-Control`, `ETag`, `Last-Modified`, revalidation; cache key & `Vary`; purge vs versioned URL; nội dung động ở edge.                                          | Bản đồ SVG thế giới: chọn vị trí user, xem RTT tới origin vs edge gần nhất; mô phỏng cache HIT/MISS/STALE theo header.      | nginx làm "edge" tầng 2 với `proxy_cache`; so sánh thời gian tải asset lần 1 vs lần 2, đọc header `X-Cache`.                     | 4, 5             |
| 7   | **Replication & Scale Tầng Đọc**                | Primary–replica, WAL/binlog shipping; đồng bộ vs bán đồng bộ vs không đồng bộ; **replication lag** và hệ quả (đọc không thấy dữ liệu mình vừa ghi); read-your-writes; failover & split-brain.                                                        | Trực quan hoá lag: ghi vào primary, xem dữ liệu "chảy" tới replica theo thời gian; đọc từ replica ra dữ liệu cũ.            | Thêm profile `replica`: Postgres primary + 1 read replica; **đo lag thật** bằng `pg_stat_replication`; tự gây lag bằng ghi ồ ạt. | 5                |
| 8   | **Sharding & Consistent Hashing**               | Vertical vs horizontal partitioning; chọn shard key (và cái giá khi chọn sai → hotspot); modulo hashing và thảm hoạ khi thêm node; **consistent hashing + virtual node**; cross-shard query & rebalance.                                             | Vòng hash tương tác: thêm/bớt node và **đếm chính xác số key phải di trú** — so sánh modulo vs consistent hashing.          | Chia dữ liệu ra 2 container Postgres theo shard key; viết router shard bằng Node; đo hotspot khi key lệch.                       | 7                |
| 9   | **CAP & Các Mô Hình Nhất Quán**                 | Định lý CAP đọc cho đúng (P là điều kiện, không phải lựa chọn); PACELC; strong / eventual / causal / read-your-writes; quorum $R + W > N$; linearizability vs serializability.                                                                       | Mô phỏng 3 node có network partition: chọn ưu tiên C hay A, xem đọc/ghi thành công hay lỗi; kéo $R$, $W$, $N$.              | Tạo partition thật bằng `docker network disconnect` giữa app và replica; quan sát hành vi ứng dụng.                              | 7                |
| 10  | **Distributed Lock**                            | Khi nào thực sự cần lock phân tán; `SETNX` + TTL và các cạm bẫy; **vì sao Redlock gây tranh cãi**; lease, clock drift, **fencing token**; lock-free bằng idempotency hoặc atomic op.                                                                 | Mô phỏng 2 worker tranh 1 lock: kéo độ lệch đồng hồ/GC pause để **thấy 2 worker cùng giữ lock** → cần fencing token.        | Redis + 2 worker Node thật cùng xử lý 1 job; chạy không lock (thấy double-processing) → thêm lock → thêm fencing.                | 5, 9             |
| 11  | **Idempotency & Retry An Toàn**                 | Vì sao "exactly-once" là ảo tưởng, chỉ có at-least-once + idempotent; idempotency key & bảng dedup; phân biệt idempotent vs commutative; TTL cho key; idempotency ở tầng HTTP (method semantics).                                                    | Mô phỏng thanh toán: bấm retry khi timeout — không có idempotency key thì trừ tiền 2 lần, có thì 1 lần.                     | API Node thật với endpoint `POST /charge`; dùng `wrk` gửi trùng request; bảng dedup trong Redis/Postgres.                        | 5                |
| 12  | **Message Queue & Xử Lý Bất Đồng Bộ**           | Đồng bộ vs bất đồng bộ, decoupling; at-least-once vs at-most-once; ack/nack, visibility timeout, **DLQ**; consumer group & thứ tự tin nhắn; **backpressure** khi producer nhanh hơn consumer.                                                        | Traffic Lab + queue: kéo tốc độ producer/consumer, xem queue depth dâng vô hạn hay ổn định; bật DLQ xem tin lỗi rơi đâu.    | Redis Streams + N worker Node; bơm 100k job; đo queue depth, thêm worker xem thời gian tiêu thụ giảm; gây lỗi → DLQ.             | 11               |
| 13  | **Rate Limiting & Backpressure**                | Fixed window / sliding window / **token bucket** / leaky bucket; rate limit phân tán bằng counter atomic trên Redis; per-user vs per-IP vs per-endpoint; `429` + `Retry-After`; load shedding có chọn lọc.                                           | Mô phỏng 4 thuật toán cạnh nhau trên cùng chuỗi request: thấy rõ fixed window cho phép burst gấp đôi ở biên cửa sổ.         | Rate limiter thật bằng Redis Lua script (atomic); `wrk` vượt hạn mức xem `429`; đo overhead thêm vào p99.                        | 5, 12            |
| 14  | **Event Sourcing & CQRS**                       | Lưu **chuỗi sự kiện** làm nguồn chân lý thay vì trạng thái hiện tại; append-only log; projection & read model; replay để tái dựng trạng thái; CQRS tách đọc/ghi; nhất quán cuối ở read model; snapshot khi log quá dài.                              | Trục thời gian sự kiện tương tác: thêm/bớt event, bấm "replay" xem trạng thái tái dựng; sửa bug projection rồi replay lại.  | Event log trong Postgres (append-only) + worker dựng projection; xoá read model rồi replay từ log để khôi phục.                  | 12, 9            |
| 15  | **Monolith vs Microservices**                   | Coupling & deploy độc lập; cái giá thật của việc chia nhỏ (network hop, distributed transaction, **saga & compensating action**, khó debug); Conway's law; monolith module hoá; **khi nào KHÔNG nên chia**.                                          | Sơ đồ tương tác: cùng 1 use case, so sánh monolith (1 hop) vs 4 microservice (5 hop) — cộng dồn latency & xác suất lỗi.     | Tách app monolith ở lab thành 2 service gọi nhau qua HTTP; **đo p99 tăng bao nhiêu**; mô phỏng saga rollback.                    | 4, 10, 11, 12, 9 |
| 16  | **Observability: Metrics, Logs & Tracing**      | Ba trụ cột; RED (Rate-Error-Duration) & USE (Utilization-Saturation-Errors); vì sao trung bình che mất sự thật (dùng histogram/percentile); structured log & correlation ID; distributed tracing (trace/span); **SLI/SLO/error budget**.             | Dashboard giả lập: cùng một sự cố xem qua "chỉ có average" vs "có p99 + trace" — thấy rõ average che mất outlier.           | Middleware Node ghi metrics + correlation ID xuyên 2 service; dựng trace thủ công; tính SLO từ số đo thật của lab.               | 15               |
| 17  | **Chế Độ Lỗi & Khả Năng Chống Chịu**            | **Cascade failure** & retry storm; exponential backoff + **jitter**; circuit breaker (closed/open/half-open); bulkhead & timeout budget; graceful degradation; chaos engineering.                                                                    | Traffic Lab chế độ "gây sự cố": bật retry không jitter xem hệ thống tự đánh sập mình; bật circuit breaker xem chặn cascade. | Tiêm lỗi thật vào lab (giết DB, `tc` làm chậm mạng); thêm circuit breaker vào client Node; so sánh có/không.                     | 13, 16           |
| 18  | **Capstone: Thiết Kế & Chạy Thật Một Hệ Thống** | Ghép toàn bộ: nhận yêu cầu → ước lượng tải (back-of-envelope) → chọn kiến trúc → **chạy thật, đo, tìm bottleneck, vá, đo lại**; viết ADR ghi lại quyết định & đánh đổi.                                                                              | Traffic Lab bản đầy đủ: dựng topology tự do, chạy kịch bản tải và sự cố, xuất báo cáo số liệu.                              | Stack Docker hoàn chỉnh (nginx + N app + Redis + Postgres primary/replica + queue + worker); vòng lặp đo-vá-đo.                  | 1–17             |

**Kiểm chuỗi phụ thuộc (đã đối chiếu):** không bài nào dùng khái niệm chưa dạy. Các mắt xích cần giữ đúng thứ tự: caching (5) trước CDN (6) vì TTL/invalidation dạy một lần rồi tái dùng ở edge; replication (7) trước CAP (9) vì cần thấy lag thật trước khi bàn mô hình nhất quán; idempotency (11) **trước** queue (12) vì at-least-once tất yếu sinh trùng lặp; distributed lock (10) sau CAP (9) và Redis (5); microservices (15) đặt muộn có chủ ý — chỉ đánh giá được đánh đổi sau khi đã tự trả giá cho network hop, lock phân tán, idempotency và nhất quán cuối; observability (16) trước resilience (17) vì phải đo được mới phát hiện được cascade.

### 4. Quy ước chất lượng (Quality Contract — Series 20)

Áp dụng đầy đủ `references/quality-contract.md` (Phần IV), **cộng thêm** các điều chỉnh riêng sau:

- **Bỏ Quiz (giống Series 18 & 19):** KHÔNG có mục "Câu hỏi trắc nghiệm ôn tập". Không gian đó dành cho sơ đồ, lab và số đo.
- **⭐ Định mức hình minh hoạ (RIÊNG series này, nghiêm ngặt hơn chuẩn chung):** mỗi bài **tối thiểu 2 sơ đồ SVG inline** + **1 demo canvas tương tác**. Phần "_Hình bắt buộc_" của từng bài ở Phần III đã liệt kê **cụ thể từng hình** — đây là hợp đồng, không phải gợi ý. Lý do đặt ra ràng buộc này: Series 19 (vectordb) từng ship 8/9 bài **không có một hình nào** vì spec cũ chỉ nói chung chung "có demo".
- **⭐ Số đo phải thật:** mọi con số hiệu năng in trong bài (RPS, p50/p99, lag, hit ratio, queue depth) phải đến từ lần chạy lab thật, kèm **ghi rõ cấu hình máy đo** (CPU, RAM, OS, phiên bản Docker) trong một callout `--note` ở cuối mục. **Cấm bịa số** hoặc chép số từ blog khác. Nếu một con số là ước lượng lý thuyết thì phải nói rõ là ước lượng.
- **⭐ Code phải chạy được:** mọi `docker-compose.yml`, `nginx.conf`, `app.js`, script Lua trong bài phải là file **thật đã chạy qua**, không phải pseudo-code. Mỗi bài có link tải file code đi kèm (co-located trong `blog/sysdesign/`).
- **Độ dài & cấu trúc:** tối thiểu 1500 từ tiếng Việt/bài (cao hơn chuẩn 1200 vì series có 2 track), 5 mục H2, mỗi H2 trả lời đủ **What / Why / When / Pitfall**.
- **Callout:** tối thiểu 4 callout/bài, bắt buộc có ≥1 `--pitfall` và ≥1 `--note` ghi cấu hình máy đo. Chỉ dùng biến thể có thật trong `blog.css` (`--note/--tip/--warning/--pitfall/--deep`).
- **Bảng so sánh:** bắt buộc khi bài có khái niệm đối lập (L4 vs L7, 4 thuật toán LB, 4 mẫu cache, async vs sync, monolith vs microservices, 4 thuật toán rate limit...).
- **KaTeX:** chỉ load trên bài thật sự có công thức (1, 6, 9, 15). **Lưu ý bug đã biết:** không đặt tiếng Việt có dấu trong `\text{}` — dấu phụ (ạ, ớ, ử) làm vỡ glyph KaTeX; giữ nội dung `\text{}` bằng ASCII/tiếng Anh.
- **Cross-link:** mỗi bài liên kết ngược tới bài tiên quyết (đã ghi ở cột "Cần trước") và liên kết chéo sang series liên quan — đặc biệt **Series 7 (SQL)** cho phần index/transaction/query plan, **Series 19 (Vector DB)** cho phần chỉ mục & phân cụm, **Series 18 (AI Systems)** cho phần orchestration.

### 5. Danh sách công việc triển khai & tích hợp (Series 20)

> **Tiến độ hạ tầng (cập nhật 2026-08-03):** đã xong toàn bộ phần hạ tầng dùng chung —
> `blog.css` (tag + hero accent), grammar `json` cho Prism, `sysdesign-sim-engine.js`
> (đã đối chiếu M/M/1, sai số < 4%), `sysdesign-topology.js` (3 renderer Canvas),
> `sysdesign-hashring.js`, `sysdesign-engine-selftest.mjs` (42 mục kiểm chứng),
> `sysdesign-sandbox.html` (Traffic Lab), `sysdesign-lab/` (lab Docker đã chạy thật và đo
> thật), trang hub, và tích hợp toàn cục (blog/index.html, ROOT index.html, i18n.js,
> sitemap.xml, search-index.json, AGENTS.md). Còn lại: **18 trang bài học**.

- [x] **Hạ tầng dùng chung (làm trước, 1 lần):**
  - [x] Tạo thư mục `blog/sysdesign/`.
  - [x] Thêm `.blog-card__tag--sysdesign` (color `#38bdf8`, background `rgba(56, 189, 248, 0.08)`) vào `blog/blog.css`; thêm cặp `.article-hero--sysdesign` / `.article-hero__tag--sysdesign` theo đúng pattern các series khác.
  - [x] **Prism:** bổ sung grammar `json` vào `blog/prism.js` (hoặc alias sang `javascript`) — hiện CHƯA có. Kiểm tra `yaml` highlight đúng trên `docker-compose.yml` thật.
- [x] **Engine dùng chung (co-located, viết trước khi viết bài):**
  - [x] `sysdesign-sim-engine.js` — lõi mô phỏng sự kiện rời rạc (node/queue/capacity/phân phối thời gian phục vụ/tiêm lỗi/thu số liệu p50-p95-p99). Không phụ thuộc DOM để test được.
  - [x] `sysdesign-topology.js` — renderer Canvas (topology + gói tin động + panel số liệu).
  - [x] `sysdesign-hashring.js` — consistent hashing có virtual node (dùng ở Bài 8).
  - [x] `sysdesign-quorum.js` — mô phỏng quorum R/W/N + last-write-wins mất dữ liệu (Bài 9).
- [x] **Lab Docker dùng chung:** `sysdesign-lab/` gồm `docker-compose.yml` (profiles thực tế: `base`, `lb`, `gw`, `cache`, `db`, `tools`), `app/app.js` (Node `http` thuần, 0 dependency), `nginx/lb.conf` + `nginx/gw.conf` + `nginx/gw-routes.conf`, và `loadgen/loadgen.js` — **bộ đo tải tự viết thay vì `wrk`**, có chủ ý: Bài 2 cần dạy chính cách đo (closed-loop, coordinated omission) nên bộ đo phải đọc được. **Phải tự chạy thử toàn bộ profiles trước khi viết bài** — mọi số trong bài lấy từ đây. PostgreSQL primary + read replica đã có (Bài 7, profile `replica`, dùng `postgres:18` vì `postgres:16-alpine` không kéo được trong môi trường dựng bài). Đã bổ sung đủ: worker message queue (Bài 12), `worker/ratelimit.js` + profile `ratelimit` (Bài 13), `worker/eventstore.js` + profile `eventstore` (Bài 14), endpoint `/chain` + `/saga` + profile `micro` (Bài 15), metrics/trace/correlation ID trong `app.js` (Bài 16), `worker/resilience.js` + endpoint `/layer` `/leaf` (Bài 17), `app/shortener.js` + profile `capstone` (Bài 18).
- [x] **Trang Visualizer chính:** `sysdesign-sandbox.html` — Traffic Lab 3 panel (điều khiển / canvas topology / số liệu + đồ thị utilization↔latency).
- [x] **Trang Hub:** `sysdesign-programming-series.html` — glossary đầy đủ (latency/throughput/p99/utilization/consistent hashing/quorum/saga/SLO...), bảng lộ trình 18 bài, quảng bá sandbox và hướng dẫn cài Docker cho lab.
- [x] **18 trang bài học (18/18):** Bài 1 ✅ · Bài 2 ✅ · Bài 3 ✅ · Bài 4 ✅ · Bài 5 ✅ · Bài 6 ✅ · Bài 7 ✅ · Bài 8 ✅ · Bài 9 ✅ · Bài 10 ✅ · Bài 11 ✅ · Bài 12 ✅ · Bài 13 ✅ · Bài 14 ✅ · Bài 15 ✅ · Bài 16 ✅ · Bài 17 ✅ · Bài 18 ✅ — viết theo đúng đề cương H2 ở Phần III, KHÔNG quiz, cấu trúc `.code-tabs`, đủ hình bắt buộc, đủ lab, references chuẩn, related links, giscus.
- [x] **Tích hợp toàn cục (kiểm cả HAI file index):**
  - [x] Thêm `a.blog-card` vào `blog/index.html`.
  - [x] Thêm `a.learn-card` vào **ROOT `index.html`** (file riêng, đã bị bỏ sót 2 lần trước).
  - [x] Thêm key i18n `learn.sysdesign.title` / `learn.sysdesign.desc` (EN + VI) vào `i18n.js`.
  - [x] `sitemap.xml`: 18 bài + 1 hub + 1 sandbox — đã đủ.
  - [x] `blog/search-index.json`: 18 entry — đã đủ, `headingsVi` khớp H2 thực tế.
  - [x] Cập nhật bảng tiến độ đầu `plan.md` (`X/18`), `README.md`, `AGENTS.md`.
- [ ] **QA từng bài:** `node check-lesson.js <file>` và `npx prettier --check` phải sạch trước khi tick "xong".

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
| 18  | Kỹ Thuật Hệ Thống AI       | `blog/aisys/`       | `aisys-programming-series.html`       | `--aisys`       | 13     |
| 19  | Cơ Sở Dữ Liệu Vector       | `blog/vectordb/`    | `vectordb-programming-series.html`    | `--vdb`         | 9      |
| 20  | Thiết Kế Hệ Thống          | `blog/sysdesign/`   | `sysdesign-programming-series.html`   | `--sysdesign`   | 18     |

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
- [ ] **AI Hệ Thống (Series 18)** → `aisys-agent-orchestra.html`: 3 panel (Canvas đồ thị agent + message bus, Blackboard key-value trực tiếp, log ReAct trace) + bảng chọn kịch bản (deadlock, Planner–Coder–Critic, pipeline 5 stage) + nút "Bơm lỗi". Dùng chung engine `aisys-mock-llm.js` + `aisys-agent-kernel.js` + `aisys-orchestrator.js` + `aisys-pipeline-sim.js` (co-located trong `blog/aisys/`) tái sử dụng qua tất cả 13 bài — không viết lại engine cho từng bài (xem `check-lesson.md` PHẦN A mục 6, giống pattern VLSI). Không cần API key/GPU thật — toàn bộ "LLM" là luật tất định.

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

## Series 18 — Kỹ Thuật Hệ Thống AI (Từ Pipeline Đến Đội Ngũ Agent)

> **Ngoại lệ áp dụng cho toàn bộ series này:** KHÔNG cần mục "Câu hỏi trắc nghiệm ôn tập" cuối bài (đã chốt ở định danh series, Phần I) — bỏ để dành không gian cho nội dung sâu hơn. Mọi mục H2 dưới đây vẫn phải trả lời đủ 4 câu hỏi What/Why/When/Pitfall (Phần IV §1) như chuẩn chung.

- **Bài 1 — Vòng Đời Một AI Product Thật:** 1.1 Vì sao "train xong" chỉ là ~20% công việc — bản đồ toàn cảnh 6 giai đoạn (data → train → RLHF → eval → deploy → monitor) · 1.2 Ai làm gì ở mỗi giai đoạn (Data Engineer, ML/Research Scientist, MLOps, Trust & Safety) và bàn giao giữa các vai trò · 1.3 Chi phí thật nằm ở đâu — phân bổ tương đối GPU-hour/nhân sự/gán nhãn dữ liệu (đối chiếu số liệu công khai đã biết của các phòng lab lớn) · 1.4 Case study rút gọn: 1 vòng đời phát hành model thật (từ ý tưởng đến bản release) chiếu lên đúng 6 giai đoạn.
- **Bài 2 — Thu Thập & Làm Sạch Dữ Liệu:** 2.1 Nguồn dữ liệu & vấn đề pháp lý (web crawl, license, PII, bản quyền) · 2.2 Dedup & lọc chất lượng (khái niệm near-dup hashing, heuristic filter, classifier filter) · 2.3 Data drift & class imbalance — vì sao "sạch hôm nay" có thể lệch ngày mai · 2.4 Cạm bẫy: lọc quá tay làm mất đa dạng dữ liệu, vòng lọc khuếch đại thiên lệch (bias amplification) sẵn có.
- **Bài 3 — Huấn Luyện Phân Tán (Khái Niệm):** 3.1 Vì sao 1 GPU không đủ — kích thước model vs giới hạn bộ nhớ · 3.2 Data parallelism vs Model parallelism vs Pipeline parallelism, khi nào chọn loại nào · 3.3 Đồng bộ gradient (all-reduce khái niệm) & checkpoint để phục hồi sự cố · 3.4 Sharding & overhead giao tiếp — đánh đổi compute vs communication, đo bằng `aisys-pipeline-sim.js`.
- **Bài 4 — RLHF & Alignment:** 4.1 Vì sao SFT (supervised fine-tune) chưa đủ — khoảng cách giữa "nói đúng cú pháp" và "nói điều con người muốn" · 4.2 Preference dataset & reward model — thu thập so sánh A/B, huấn luyện reward model đồ chơi từ điểm chấm của người dùng · 4.3 PPO khái niệm — policy cập nhật theo reward, KL penalty giữ model không lệch quá xa bản gốc · 4.4 Cạm bẫy reward hacking — model học cách "đánh lừa" reward model thay vì thật sự tốt hơn, và chi phí gán nhãn con người bị đánh giá thấp.
- **Bài 5 — Red-Teaming & Đánh Giá Benchmark:** 5.1 Adversarial prompt & các lớp jailbreak phổ biến (roleplay injection, encoding trick, multi-turn erosion) · 5.2 Quy trình red-team có hệ thống — nội bộ vs bug bounty vs automated red-teaming · 5.3 Benchmark suite đa nhiệm/đa domain — vì sao 1 con số leaderboard duy nhất gây hiểu lầm · 5.4 Cạm bẫy Goodhart's Law — tối ưu quá mức theo benchmark làm giảm chất lượng thật (benchmark overfitting).
- **Bài 6 — Model Versioning, Rollback & Chi Phí Hạ Tầng:** 6.1 Semantic versioning cho model/weight — vì sao không thể chỉ "ghi đè" model cũ · 6.2 Canary/A-B deploy — release dần dần, đo regression trước khi full rollout · 6.3 Rollback khi phát hiện regression — tiêu chí tự động kích hoạt rollback · 6.4 Ước lượng chi phí hạ tầng — GPU-hour training vs inference cost, đánh đổi giữa model lớn/nhỏ.
- **Bài 7 — Tool-Calling: Thiết Kế Interface Tool:** 7.1 Vì sao agent cần "tool" — giới hạn của model thuần sinh văn bản (không tính toán chính xác, không truy cập dữ liệu ngoài) · 7.2 Tool schema (JSON Schema) — mô tả tên/tham số/kiểu dữ liệu để model "hiểu" cách gọi · 7.3 Validate input trước khi thực thi & sandbox hoá side-effect — không tin tưởng mù quáng input do model sinh ra · 7.4 Tool registry pattern — đăng ký/tra cứu tool động, mở rộng tool mới không sửa core.
- **Bài 8 — Memory & Prompt Template Engine:** 8.1 Short-term memory (context window) vs long-term memory — giới hạn token và nhu cầu nhớ lâu dài · 8.2 Mô phỏng "vector recall" bằng so khớp từ khoá — rút gọn ý tưởng embedding/similarity search (nối với RAG ở Series 16) · 8.3 Prompt template engine — system/few-shot/variable injection, escape biến người dùng · 8.4 Cạm bẫy: context truncation cắt mất thông tin quan trọng, prompt/template injection khi không escape biến.
- **Bài 9 — ReAct Loop, Callback & Streaming — Tự Viết Runtime Agent:** 9.1 Vòng lặp Thought → Action → Observation — suy luận từng bước thay vì trả lời ngay · 9.2 Event emitter cho streaming token — kiến trúc callback (`onToken`/`onToolCall`/`onFinish`) · 9.3 Xử lý lỗi tool — retry/backoff, fallback khi tool thất bại · 9.4 Giới hạn số bước & phát hiện vòng lặp vô hạn khi agent không tìm ra lời giải.
- **Bài 10 — Kiến Trúc Multi-Agent: Vai Trò & Giao Tiếp:** 10.1 Vì sao 1 agent không đủ cho task phức tạp — chia vai trò (Planner/Executor/Critic) · 10.2 Message passing giữa agent — cấu trúc message, hàng đợi, thứ tự xử lý · 10.3 Điều phối tập trung (central orchestrator) vs phi tập trung (peer-to-peer negotiation) · 10.4 Cạm bẫy: thêm agent không tương xứng lợi ích — over-engineering multi-agent khi 1 agent đã đủ.
- **Bài 11 — Blackboard Pattern & Shared State:** 11.1 Kiến trúc blackboard cổ điển (AI symbolic thập niên 1980) — "bảng chung" nhiều chuyên gia cùng đọc/ghi · 11.2 So sánh với shared-memory kiểu CrewAI/AutoGen hiện đại · 11.3 Race condition khi nhiều agent ghi cùng lúc — lock, versioning, hay merge? · 11.4 Cạm bẫy: blackboard phình to không kiểm soát, agent đọc phải state cũ (stale read).
- **Bài 12 — Orchestration Nâng Cao: Xung Đột & Deadlock:** 12.1 Deadlock giữa agent (2 agent chờ nhau) — điều kiện xảy ra & cách phát hiện · 12.2 Livelock — vòng lặp "nhường nhau" không tiến triển · 12.3 Timeout/circuit-breaker để phá vỡ deadlock/livelock · 12.4 So sánh kiến trúc AutoGen (group chat) vs CrewAI (hierarchical crew) — khi nào chọn kiểu nào.
- **Bài 13 — Dự án: AI Ops Center:** 13.1 Kiến trúc tổng thể — ghép pipeline (Bài 1–6) + framework (Bài 7–9) + orchestration (Bài 10–12) thành 1 hệ thống · 13.2 Agent giám sát tự động — phát hiện regression từ benchmark (Bài 5–6), tự kích hoạt rollback bằng ReAct loop (Bài 9) & orchestration (Bài 12) · 13.3 Dashboard vận hành — theo dõi sức khoẻ hệ thống thời gian thực, log quyết định từng agent · 13.4 Giới hạn của mô phỏng — những gì hệ thống đồ chơi này CHƯA thể hiện được so với vận hành AI production thật (quy mô, chi phí thật, rủi ro pháp lý).

## Series 19 — Cơ Sở Dữ Liệu Vector

> **Ngoại lệ áp dụng cho toàn bộ series này (tương tự Series 18):** KHÔNG cần mục "Câu hỏi trắc nghiệm ôn tập" cuối bài để dành không gian cho nội dung chuyên sâu và dài hơn, tiết kiệm ngữ cảnh khi triển khai. Mọi mục H2 dưới đây vẫn phải trả lời đủ 4 câu hỏi What/Why/When/Pitfall như chuẩn chung.

- **Bài 1 — Khái niệm & Vai trò của Vector DB:** 1.1 Sự trỗi dậy của Dữ liệu phi cấu trúc và Vector nhúng (Embeddings) — Định nghĩa dữ liệu phi cấu trúc, sự bùng nổ của các mô hình học sâu sinh ra biểu diễn vector dày đặc (dense vector) thay thế cho trích xuất thuộc tính thủ công. 1.2 Phân biệt CSDL truyền thống vs CSDL Vector — Đối chiếu mô hình quan hệ/tài liệu (so khớp chính xác, lập chỉ mục B-Tree) với CSDL không gian metric (so khớp xấp xỉ tương đồng, lập chỉ mục ANN), tại sao SQL truyền thống thất bại khi truy vấn khoảng cách đa chiều. 1.3 Lời nguyền chiều kích (Curse of Dimensionality) — Hiện tượng hình học kỳ lạ trong không gian đa chiều (khoảng cách giữa mọi điểm đều tiến gần nhau, phân bố xác suất thay đổi), và tại sao tìm kiếm vét cạn (brute-force) trở nên bất khả thi khi số chiều vượt quá hàng trăm. 1.4 Giải thuật lân cận gần nhất: KNN thô vs Tìm kiếm xấp xỉ ANN — Khái niệm K-Nearest Neighbors và Approximate Nearest Neighbor (ANN), trade-off giữa độ chính xác (Recall), tốc độ (Latency) và chi phí tài nguyên (Memory/Compute). 1.5 Ứng dụng thực tế: Cách các doanh nghiệp công nghệ lớn ứng dụng Vector DB trong Hệ gợi ý (Recommendation Systems) và Tìm kiếm ngữ nghĩa (Semantic Search).
- **Bài 2 — Pipeline Nhúng Dữ Liệu (Embeddings):** 2.1 Từ dữ liệu thô đến không gian vector: Cơ chế hoạt động của Embedding Model — Cách mà một mô hình học sâu biến đổi chữ, ảnh, âm thanh thành một mảng số thực có độ dài cố định. 2.2 Không gian biểu diễn ngữ nghĩa (Semantic Feature Spaces) & Biểu diễn toán học — Khái niệm về các chiều biểu diễn đặc trưng ẩn (latent features), ý nghĩa của khoảng cách nhỏ giữa 2 vector trên không gian ngữ nghĩa. 2.3 Quá trình Token hóa (Tokenization) và Vector hóa tần suất từ — Cơ chế Tokenization đơn giản và các kỹ thuật thống kê cổ điển như TF-IDF/Bag-of-Words để người học hiểu gốc rễ của vector hóa từ số 0. 2.4 Quản lý và xử lý Batch Embedding — Kỹ thuật ghép lô (batching) khi gọi API/mô hình chạy cục bộ để tối ưu hiệu năng, xử lý hàng đợi (queue) và quản lý tài nguyên bộ nhớ đệm (cache) khi lưu trữ tạm thời embeddings trên client. 2.5 Case study: Xử lý nghẽn cổ chai (bottleneck) hiệu năng khi xử lý Embedding thời gian thực trên các thiết bị Edge/Mobile.
- **Bài 3 — Độ Đo Khoảng Cách & So Khớp Tương Đồng:** 3.1 Khoảng cách Euclidean (L2 Metric) — Định nghĩa toán học của khoảng cách Euclid thẳng trong không gian đa chiều, ứng dụng khi độ dài/độ lớn tuyệt đối của vector mang thông tin quan trọng. 3.2 Tương đồng Cosine (Cosine Similarity) — Bản chất góc giữa hai vector, công thức chuẩn hóa chuẩn L2, lý do vì sao độ đo này tối ưu cho so khớp văn bản bất kể độ dài ngắn khác nhau. 3.3 Tích vô hướng (Dot Product/Inner Product) — Công thức nhân ma trận tương ứng, mối quan hệ với khoảng cách Euclidean và tương đồng Cosine khi các vector đã được chuẩn hóa (normalized vector). 3.4 Khoảng cách Manhattan (L1 Metric) — Định nghĩa khoảng cách di chuyển theo lưới trục tọa độ, trường hợp sử dụng tối ưu trên một số kiểu dữ liệu rời rạc/đặc trưng phân tán cao. 3.5 Phân tích so khớp thực tế: Tại sao Dot Product chuẩn hóa lại nhanh hơn Cosine Similarity truyền thống trên tập dữ liệu lớn.
- **Bài 4 — Lưu Trữ Hybrid: Vector & Metadata:** 4.1 Thách thức của việc lưu trữ Vector đa chiều — Tại sao cấu trúc lưu trữ dạng hàng (row-store) hay dạng cột (column-store) truyền thống không hiệu quả cho các mảng số thực kích thước lớn. 4.2 Kiến trúc lưu trữ Hybrid (Hybrid Storage Architecture) — Cơ chế phân tách vật lý giữa vector nhị phân (flat binary array) phục vụ tính toán và dữ liệu thuộc tính (metadata JSON) phục vụ tra cứu. 4.3 Quản lý ID và liên kết dữ liệu — Thiết kế bảng ánh xạ ánh xạ (mapping table) hai chiều giữa Vector ID và Key-Value store lưu trữ payload. 4.4 Cạm bẫy: Sự phân mảnh dữ liệu (Data fragmentation) và overhead khi truy xuất metadata ngẫu nhiên trong đĩa/bộ nhớ. 4.5 Kiến trúc phân tầng lưu trữ (Multi-tiered storage) trong các hệ thống Vector DB hiện đại để tối ưu hóa chi phí phần cứng.
- **Bài 5 — Chỉ Mục IVF (Inverted File Index):** 5.1 Giải quyết bài toán phân mảnh không gian: Thuật toán K-Means Clustering — Ý nghĩa toán học của việc tìm các tâm cụm (centroids) đại diện để thu hẹp vùng tìm kiếm từ toàn bộ dữ liệu xuống một vài cụm. 5.2 Cấu trúc danh sách ngược (Inverted File) trong không gian vector — Cơ chế xây dựng bảng tra cứu từ Centroid ID sang danh sách các Vector ID thuộc cụm đó (Voronoi Cell). 5.3 Quy trình truy vấn IVF: nprobe parameter — Khái niệm `nprobe` (số lượng cụm lân cận cần duyệt), sự đánh đổi giữa tốc độ tìm kiếm và độ chính xác (Recall vs Latency). 5.4 Cạm bẫy: Cụm không cân bằng (Imbalanced clusters) dẫn đến thời gian tìm kiếm không ổn định và cách giải quyết bằng phân cụm lặp (Iterative clustering). 5.5 Kỹ thuật Warm-up và tối ưu số lượng Centroid linh hoạt theo kích thước dữ liệu thực tế.
- **Bài 6 — Chỉ Mục Đồ Thị HNSW:** 6.1 Khái niệm mạng thế giới nhỏ (Small World Network) và đồ thị điều hướng NSW — Bản chất liên kết cục bộ dày đặc kết hợp vài liên kết xa giúp tìm kiếm đạt độ phức tạp logarit. 6.2 Cấu trúc phân tầng Hierarchical HNSW — Thiết kế đồ thị đa lớp tương tự cấu trúc Skip List, lớp trên thưa thớt định hướng chung, lớp dưới dày đặc định vị chi tiết. 6.3 Thuật toán Greedy Search trên đồ thị đa lớp và tham số efSearch/efConstruction — Cơ chế duyệt đồ thị bằng cách giữ hàng đợi ưu tiên các node gần query nhất. 6.4 Cạm bẫy: Chi phí bộ nhớ RAM cực lớn khi lưu trữ cấu trúc đồ thị đa tầng và thời gian xây dựng chỉ mục (Index building time) tăng phi tuyến tính. 6.5 Tối ưu hóa bộ nhớ HNSW bằng kỹ thuật loại bỏ các liên kết dư thừa (Heuristic-based pruning algorithm).
- **Bài 7 — Nén Vector bằng Product Quantization (PQ):** 7.1 Lượng tử hóa vector (Vector Quantization) — Khái niệm cơ bản về nén dữ liệu có tổn hao (lossy compression) bằng cách gom nhóm đại diện và ánh xạ vector sang số hiệu nhóm. 7.2 Cơ chế Product Quantization: Chia để trị không gian — Cách phân rã vector có số chiều \(d\) lớn thành \(m\) phân đoạn (subspaces), chạy k-means độc lập trên từng subspace để tạo ra codebook con. 7.3 Tính khoảng cách xấp xỉ không đối xứng (Asymmetric Distance Computation - ADC) — Kỹ thuật tính khoảng cách cực nhanh giữa query vector gốc và các vector nén bằng cách tra cứu bảng khoảng cách (lookup table) thay vì thực hiện phép toán số thực dấu phẩy động. 7.4 Cạm bẫy: Sai số lượng tử hóa (Quantization error) làm giảm độ chính xác Recall và cách cân đối tham số nén. 7.5 Tối ưu hóa tính toán lượng tử hóa: Sử dụng kỹ thuật Asymmetric Distance Computation nâng cao với SIMD trên CPU.
- **Bài 8 — Lọc Metadata (Metadata Filtering):** 8.1 Nhu cầu lọc kết hợp trong ứng dụng thực tế — Tại sao việc chỉ tìm kiếm tương đồng vector là chưa đủ mà phải kết hợp lọc điều kiện logic (như thời gian, chuyên mục, quyền truy cập). 8.2 Pre-filtering vs Post-filtering — Đánh giá hai hướng tiếp cận kinh điển: lọc thuộc tính trước (thu hẹp tập điểm rồi tìm KNN) vs lọc thuộc tính sau (tìm KNN rồi loại bỏ điểm không khớp), và tại sao cả hai đều dẫn đến hiện tượng thiếu kết quả (recall collapse) hoặc hiệu năng kém. 8.3 Kỹ thuật lọc đồng thời Single-Stage/Joint Filtering — Cách kết hợp lọc logic trực tiếp trong quá trình duyệt đồ thị HNSW hoặc danh sách IVF để loại bỏ node không thỏa mãn điều kiện ngay lập tức. 8.4 Cạm bẫy: Sự không tương thích giữa độ chọn lọc (selectivity) thuộc tính và cấu trúc liên kết đồ thị (graph connectivity) dẫn đến đứt gãy đường đi tìm kiếm. 8.5 Kiến trúc đồ thị lọc Single-Stage: Thiết kế cấu trúc dữ liệu để vượt qua điểm nghẽn ngắt kết nối đồ thị khi độ chọn lọc (selectivity) thuộc tính cao.
- **Bài 9 — Dự Án Capstone: RAG Search Engine:** 9.1 Kiến trúc Retrieval-Augmented Generation (RAG) toàn diện — Quy trình đồng bộ dữ liệu từ văn bản -> chunks -> embeddings -> Vector DB và quá trình truy vấn ngữ cảnh để trả về cho LLM. 9.2 Thiết kế Engine tìm kiếm hỗn hợp Hybrid Search — Kỹ thuật kết hợp điểm số của tìm kiếm từ khóa (BM25/FTS5) và tìm kiếm ngữ nghĩa (Dense Retrieval) bằng phương pháp Reciprocal Rank Fusion (RRF). 9.3 Đánh giá và so sánh thực tế các CSDL Vector phổ biến — Phân tích ưu và nhược điểm của các giải pháp chuyên dụng (Pinecone, Milvus, Qdrant, Chroma) và các phần mở rộng cho CSDL truyền thống (pgvector trong PostgreSQL). 9.4 Cạm bẫy: Ảo giác ngữ cảnh (Context hallucination) do chất lượng embedding kém, giới hạn kích thước context window của LLM và vấn đề chi phí băng thông API. 9.5 Đánh giá kiến trúc RAG nâng cao: Tối ưu hóa Chunking Strategy và Prompt Context Injection để ngăn chặn triệt để hiện tượng ảo giác (hallucination).

## Series 20 — Thiết Kế Hệ Thống

> **Ngoại lệ áp dụng cho toàn bộ series này (tương tự Series 18 & 19):** KHÔNG có mục "Câu hỏi trắc nghiệm ôn tập". Mọi mục H2 vẫn phải trả lời đủ 4 câu hỏi What/Why/When/Pitfall.
>
> **Định mức RIÊNG của series này (chốt theo yêu cầu chủ dự án):** mỗi bài phải có **tối thiểu 2 sơ đồ SVG inline** (kiến trúc / luồng dữ liệu / thang so sánh) **+ 1 demo canvas tương tác** dùng engine chung, **+ 1 mục lab Docker chạy thật** với **số đo thật** (không được bịa số — phải ghi rõ cấu hình máy đo). Đây là series đầu tiên bắt buộc cả ba, vì lý do nêu ở Phần I §0.

- **Bài 1 — Latency, Throughput & Lý Thuyết Hàng Đợi** (`sysdesign-latency-queueing.html`): **1.1** Latency vs Throughput — hai đại lượng liên tục bị nhầm là một; vì sao tối ưu cái này thường làm hại cái kia (batching/nén tăng throughput nhưng tăng latency từng request); đại lượng nào thuộc SLA nào. _Cạm bẫy:_ suy ra "mỗi request 1ms" từ "server chịu 1000 RPS" — sai vì bỏ qua tính song song. **1.2** Bậc độ lớn của latency — bảng số kinh điển (L1 ~1ns → RAM ~100ns → SSD ~100µs → HDD ~10ms → RTT cùng DC ~0.5ms → RTT liên lục địa ~150ms); vì sao chính bảng này quyết định kiến trúc (cache thắng ở đâu, CDN cần khi nào, vì sao chat cross-region luôn có cảm giác trễ). _Cạm bẫy:_ tối ưu thuật toán CPU trong khi bottleneck là một round-trip mạng — tiết kiệm 1µs trên đường đi mất 150ms. **1.3** Tail latency & vì sao trung bình là con số lừa dối — p50/p95/p99/p99.9; toán fan-out: một trang gọi $n$ service song song thì xác suất gặp ít nhất một service chậm là $1-(1-p)^n$, nên p99 của service trở thành ~p90 của người dùng khi $n=10$; vì sao percentile không cộng được. _Cạm bẫy:_ báo cáo average, và **coordinated omission** khi công cụ đo dừng gửi lúc server chậm (làm p99 đo được đẹp giả tạo). **1.4** Little's Law & hàng đợi — $L = \lambda W$; utilization $\rho = \lambda/\mu$; với M/M/1 thì $W = 1/(\mu-\lambda)$ nên latency có **tiệm cận đứng** khi $\lambda \to \mu$; dùng công thức để ước lượng số worker / kích thước connection pool. _Cạm bẫy:_ "CPU mới 70%, còn thoải mái" — ở $\rho=0.7$ thời gian chờ đã gấp ~3.3 lần so với lúc rảnh; hàng đợi vô hạn chỉ đổi drop thành timeout, không cứu được gì. **1.5** Ước lượng back-of-envelope — quy đổi DAU → RPS trung bình → RPS đỉnh, ước lượng storage/bandwidth; ví dụ tính đầy đủ có số: 10M DAU × 20 request/ngày ≈ 2.300 RPS trung bình, hệ số đỉnh ×3 ≈ 7.000 RPS, tỉ lệ đọc:ghi 100:1 định hình toàn bộ kiến trúc. _Cạm bẫy:_ quên hệ số đỉnh và quên độ lệch đọc/ghi → thiết kế đúng cho con số trung bình nhưng sập vào giờ cao điểm.
  - _Hình bắt buộc:_ (a) SVG thang **log** so sánh bậc độ lớn latency — hình quan trọng nhất bài; (b) SVG đồ thị $\rho \leftrightarrow W$ với tiệm cận đứng tại $\rho=1$; (c) SVG histogram latency có vạch p50/p95/p99 lệch phải để thấy average nằm sai chỗ.
  - _Demo (A):_ Traffic Lab một node — kéo RPS, xem hàng đợi dâng và p99 dựng đứng, đối chiếu trực tiếp với đường lý thuyết $1/(\mu-\lambda)$ vẽ chồng lên.
  - _Code thật:_ hàm tính percentile từ mảng latency (kèm cảnh báo cách nội suy), và mô phỏng M/M/1 bằng JS thuần để đối chiếu số mô phỏng vs số công thức.
  - _Lab (B):_ chưa có (bài lý thuyết) — nhưng phải kết bài bằng một câu hỏi mở dẫn sang Bài 2: "con số $\mu$ của server bạn thực tế là bao nhiêu?"

- **Bài 2 — Dựng Lab & Đo Giới Hạn Một Server** (`sysdesign-single-server-limits.html`): **2.1** Vòng đời một HTTP request trong Node.js `http` thuần — kernel accept queue (`backlog`) → libuv → event loop → callback JS → response; chỉ rõ chỗ nào có hàng đợi ẩn (chính là $\mu$ và hàng đợi ở Bài 1 nhưng bằng thành phần thật). _Cạm bẫy:_ tưởng Node xử lý song song bằng nhiều luồng JS — chỉ có **một** thread JS, phần song song nằm ở I/O. **2.2** Event loop và tội đồ blocking — vì sao một handler đồng bộ nặng (JSON.parse payload lớn, `crypto.pbkdf2Sync`, vòng lặp tính toán) làm **toàn bộ** request khác xếp hàng; đo được bằng cách so p99 của endpoint nhanh khi có/không có endpoint chậm chạy song song. _Cạm bẫy:_ dùng biến thể `*Sync` của crypto/fs trong request handler; nghĩ rằng "chỉ chậm request đó thôi". **2.3** Dựng lab Docker dùng chung cho cả series — `docker-compose.yml` với **profiles** (`base`, `lb`, `cache`, `replica`, `queue`), `app.js` Node `http` thuần có endpoint `/fast`, `/slow-sync`, `/slow-async`, `/health`, và container `loadgen` chứa `wrk` để không phải cài lên máy thật; giải thích từng dòng compose. _Cạm bẫy:_ chạy công cụ đo tải **cùng máy/cùng CPU** với server rồi kết luận — hai bên tranh CPU làm số đo vô nghĩa. **2.4** Đo cho đúng — warm-up (JIT + cache nóng), thời lượng đủ dài, số connection ↔ ý nghĩa $L$ trong Little's Law, phân biệt đo "closed-loop" vs "open-loop", ghi lại cấu hình máy khi báo cáo số. _Cạm bẫy:_ coordinated omission (Bài 1 đã nêu lý thuyết, ở đây tái tạo thật để thấy chênh lệch), và so sánh hai lần đo với tham số khác nhau. **2.5** Tìm knee point (điểm bão hoà) — tăng tải theo bậc, lập bảng RPS gửi ↔ RPS thực nhận ↔ p50/p99, xác định điểm throughput ngừng tăng nhưng latency bùng nổ; đối chiếu ngược với $\rho \to 1$ ở Bài 1. _Cạm bẫy:_ kết luận "server chịu được X RPS" từ **một** lần đo duy nhất ở một mức tải.
  - _Hình bắt buộc:_ (a) SVG vòng đời request xuyên kernel queue → libuv → event loop → handler, đánh dấu rõ các điểm hàng đợi; (b) SVG timeline so sánh event loop khi handler async vs handler blocking (thấy các request khác bị "đóng băng"); (c) đồ thị knee point vẽ từ **số đo thật** của lab.
  - _Demo (A):_ mô phỏng event loop tương tác — bật/tắt handler blocking, xem các request khác dồn lại trong queue.
  - _Code thật:_ `app.js` (Node `http` thuần, 4 endpoint), `docker-compose.yml` có profiles, lệnh `wrk` đầy đủ tham số.
  - _Lab (B):_ `docker compose --profile base up -d` → chạy `wrk` 5 mức tải → điền bảng số thật → tìm knee point của chính máy người học. Đây là bài **thiết lập lab cho cả series**, phải viết kỹ như `sql-docker-lab-setup.html`.

- **Bài 3 — Scale Ngang & Load Balancing** (`sysdesign-load-balancing.html`): **3.1** Scale dọc vs scale ngang — giới hạn cứng của scale up (giá tăng phi tuyến, vẫn là single point of failure, có trần vật lý), điều kiện tiên quyết của scale out là **stateless**; khi nào scale dọc vẫn là lựa chọn đúng (đơn giản, dữ liệu chưa lớn, tránh phức tạp phân tán quá sớm). _Cạm bẫy:_ scale ngang một app còn giữ state trong RAM (session, cache cục bộ, bộ đếm) → sinh bug "chỉ xảy ra thỉnh thoảng" cực khó tái tạo. **3.2** L4 vs L7 load balancing — L4 chuyển tiếp ở tầng TCP không đọc nội dung (nhanh, rẻ, không route được theo path), L7 đọc HTTP nên route theo path/header/cookie và làm TLS termination được nhưng tốn CPU và thành điểm phải scale riêng. _Cạm bẫy:_ chọn L7 cho mọi thứ rồi ngạc nhiên vì LB thành bottleneck CPU do giải mã TLS. **3.3** Thuật toán phân phối — Round Robin, Weighted RR, Least Connections, Random, **Random of two choices** (mẹo rẻ mà hiệu quả gần bằng least-conn), IP/consistent hash; vì sao RR tệ khi cost mỗi request lệch nhau nhiều, vì sao least-conn phù hợp request dài. _Cạm bẫy:_ RR + độ dài request lệch → một node nghẽn trong khi node khác rảnh, mà biểu đồ "RPS mỗi node" vẫn trông hoàn toàn cân bằng. **3.4** Health check & loại node chết an toàn — active (LB chủ động gọi `/health`) vs passive (đếm lỗi thực tế); interval/threshold và nguy cơ **flapping**; `/health` phải kiểm tra được dependency thật chứ không chỉ trả `200`; **graceful shutdown**: rút node khỏi LB → chờ drain connection → mới thoát. _Cạm bẫy:_ health check chỉ ping cổng TCP nên app treo logic vẫn bị coi là "healthy"; thiếu graceful shutdown nên mỗi lần deploy là một đợt lỗi 502 cho người dùng thật. **3.5** Sticky session và cái giá của state cục bộ — cơ chế (cookie hoặc IP hash), vì sao nó phá vỡ cân bằng tải, làm mất session khi node chết và chặn autoscale; giải pháp đúng là đẩy session ra store dùng chung (dẫn sang Bài 5). _Cạm bẫy:_ dùng sticky session như cách **che** lỗi thiết kế state cục bộ — hệ thống chạy được nhưng đã tự khoá khả năng scale về sau.
  - _Hình bắt buộc:_ (a) SVG so sánh tầng L4 vs L7 (chỉ rõ LB "thấy" được gì ở mỗi tầng); (b) SVG 4 thuật toán phân phối cùng một chuỗi request có cost lệch nhau — thấy rõ RR gây lệch tải; (c) SVG timeline graceful shutdown vs kill đột ngột (đợt 502).
  - _Demo (A):_ Traffic Lab — đổi thuật toán LB, thêm/bớt replica, giết node để xem health check phát hiện và LB rút node; bảng utilization từng node phơi ra hiện tượng lệch tải của RR.
  - _Code thật:_ cài đặt **4 thuật toán LB bằng JS thuần** (chạy được, dùng luôn trong demo), `nginx.conf` thật với `upstream`, `least_conn`, health check và `proxy_next_upstream`.
  - _Lab (B):_ `docker compose --profile lb up -d` → nginx + 3 app replica → đọc log thấy phân phối; `docker stop` 1 replica để xem failover và đo bao lâu LB mới loại node; bật/tắt graceful shutdown để **đếm số request lỗi thật** khi deploy.

- **Bài 4 — Reverse Proxy & API Gateway** (`sysdesign-api-gateway.html`): **4.1** Phân biệt ba khái niệm bị dùng lẫn — reverse proxy (đứng trước, nhận request thay backend), load balancer (phân phối), API gateway (thêm logic tầng ứng dụng: auth, rate limit, transform, aggregation); cùng một nginx có thể đóng cả ba vai nên khái niệm bị nhoè. _Cạm bẫy:_ gọi tất cả là "nginx" rồi nhồi mọi logic vào một file config — thành nút thắt tổ chức, mọi team phải xin sửa cùng một chỗ. **4.2** TLS termination & sự thật về header — terminate TLS ở edge rồi đi HTTP nội bộ (đánh đổi bảo mật nội vùng vs CPU); `X-Forwarded-For`, `X-Forwarded-Proto`, `Host` bị thêm/ghi đè qua từng chặng; app phải cấu hình trust proxy đúng số hop mới đọc được IP client thật. _Cạm bẫy:_ **tin `X-Forwarded-For` không kiểm chứng** — client tự đặt header này để giả IP, vượt rate limit và làm sai toàn bộ log/audit. **4.3** Định tuyến & versioning — route theo path/header/subdomain, path rewrite, canary theo header, `/v1` vs `/v2`. _Cạm bẫy:_ rewrite path làm sai relative URL và `Location` của redirect — trang chạy được nhưng link/redirect trỏ lệch. **4.4** Chức năng cross-cutting: auth offload, rate limit tập trung, transform request/response, **aggregation / BFF** — gom logic dùng chung một chỗ, đặc biệt hữu ích cho mobile (1 call thay vì 6); nhưng latency của aggregation = **max** của các nhánh, và mọi nhánh lỗi đều thành lỗi của gateway. _Cạm bẫy:_ để business logic trôi dần vào gateway → "monolith ẩn" nằm trong file config, không test được, không ai dám sửa. **4.5** Gateway là single point of failure — phải scale ngang chính gateway, đặt **timeout budget** giảm dần theo độ sâu, và tránh retry ở nhiều tầng (khuếch đại tải — đào sâu ở Bài 17). _Cạm bẫy:_ timeout ở gateway **ngắn hơn** timeout backend → client đã bỏ đi nhưng backend vẫn cày tiếp, tốn tài nguyên cho công việc không ai nhận.
  - _Hình bắt buộc:_ (a) SVG ba lớp reverse proxy / LB / API gateway, chú thích rõ mỗi lớp "thấy" và "làm" được gì; (b) SVG hành trình một request qua từng chặng, header nào được thêm/ghi đè ở đâu; (c) SVG fan-out aggregation cho thấy latency tổng = max các nhánh (không phải tổng).
  - _Demo (A):_ click từng chặng trên sơ đồ để xem header biến đổi; slider số nhánh aggregation + độ trễ mỗi nhánh, quan sát p99 tổng bị nhánh chậm nhất quyết định.
  - _Code thật:_ `nginx.conf` gateway đầy đủ (upstream, `location` routing, TLS, `proxy_set_header` cho forwarded headers, timeout), và middleware Node đọc IP client **đúng cách** (kiểm số hop tin cậy).
  - _Lab (B):_ `--profile gw` → TLS tự ký, route `/api/*` → app và `/static/*` → nginx phục vụ trực tiếp; đo overhead TLS thật; **tự tay giả mạo `X-Forwarded-For`** để thấy lỗ hổng rồi vá bằng cấu hình trust proxy.

- **Bài 5 — Caching: Cache-Aside, TTL & Vô Hiệu Hoá** (`sysdesign-caching.html`): **5.1** Vì sao cache thắng — nối trực tiếp bảng bậc độ lớn latency ở Bài 1 (RAM ~100ns vs truy vấn DB qua mạng ~1ms = chênh 10.000×); locality theo thời gian và không gian; latency trung bình $T = h \cdot T_{cache} + (1-h) \cdot T_{db}$, và điều phản trực giác: nâng hit ratio từ 90% → 99% **giảm tải DB 10 lần** (chứ không phải 10%). _Cạm bẫy:_ đánh giá cache bằng "có nhanh hơn không" thay vì bằng hit ratio và tải đẩy khỏi DB. **5.2** Các mẫu cache — cache-aside (lazy, phổ biến nhất), read-through, write-through, write-behind, refresh-ahead; bảng so sánh độ phức tạp ↔ nguy cơ mất dữ liệu ↔ độ tươi. _Cạm bẫy:_ write-behind mất dữ liệu khi cache chết trước khi flush — dùng cho counter thì được, cho tiền thì không. **5.3** Vô hiệu hoá cache (phần khó nhất) — TTL vs invalidation tường minh vs **versioned key** (không xoá, đổi key); ghi đồng thời tạo cửa sổ stale; vì sao versioned key thường là lời giải sạch nhất. _Cạm bẫy:_ nhiều key **hết hạn cùng một thời điểm** (do được nạp cùng lúc lúc deploy) → đợt miss đồng loạt đánh vào DB. **5.4** Thundering herd / cache stampede — $N$ request cùng miss một key nóng đúng lúc nó hết hạn → tất cả cùng gọi DB → DB sập → cache không bao giờ được nạp lại → sập vĩnh viễn; cách chống: **single-flight lock** per-key, **jitter TTL**, `stale-while-revalidate` (trả bản cũ trong lúc làm mới), pre-warm. _Cạm bẫy:_ client tự retry khi thấy chậm làm herd nặng thêm theo cấp số — sự cố tự khuếch đại. **5.5** Eviction & thiết kế cache key — LRU/LFU/TTL, `maxmemory-policy` của Redis, hot key làm lệch tải một shard, cache pollution do quét dữ liệu lạnh. _Cạm bẫy:_ cache to hơn cả dataset mà hit ratio vẫn thấp vì **key thiết kế sai** — nhét timestamp, request ID hoặc tham số vô nghĩa (`utm_*`) vào key nên mỗi request là một key mới.
  - _Hình bắt buộc:_ (a) sequence diagram cache-aside ở hai nhánh HIT và MISS; (b) SVG bốn mẫu cache cạnh nhau (ai ghi vào đâu, theo thứ tự nào); (c) đồ thị **hit ratio ↔ tải DB** dạng phi tuyến, đánh dấu rõ 90% và 99% để thấy chênh 10×.
  - _Demo (A):_ Traffic Lab + node cache: kéo hit ratio 0→100% xem p99 và tải DB đổi; nút "Cache sập" tái tạo thundering herd đánh sập DB ngay trên canvas.
  - _Code thật:_ cache-aside bằng Node + Redis (`GET`/`SETEX`), **single-flight lock** chống herd, TTL có jitter, và ví dụ versioned key.
  - _Lab (B):_ `--profile cache` → Redis thật; đo p99 và số query DB trước/sau cache; **tự tay tái tạo thundering herd** (đặt TTL ngắn + bơm tải) rồi vá bằng single-flight và đo lại.

- **Bài 6 — CDN & Edge Caching** (`sysdesign-cdn-edge.html`): **6.1** Giới hạn cứng không code nào vượt được: tốc độ ánh sáng — trong sợi quang tín hiệu đi ~200.000 km/s, nên RTT tối thiểu ≈ 1ms cho mỗi 100km khứ hồi; ví dụ có số: Hà Nội ↔ Singapore ~2.500km ⇒ **~25ms lý thuyết**, thực tế 40–60ms do định tuyến và thiết bị trung gian. Đây là lý do phải đưa dữ liệu **lại gần người dùng**, không phải làm server nhanh hơn. _Cạm bẫy:_ tối ưu backend từ 50ms xuống 20ms trong khi người dùng ở nửa vòng trái đất đang mất 300ms cho 2 round-trip TLS. **6.2** Kiến trúc CDN — PoP/edge vs origin, anycast định tuyến tới PoP gần nhất, cache tier trung gian giảm tải origin, origin shield. _Cạm bẫy:_ tưởng CDN chỉ để phục vụ ảnh — API response, HTML và cả logic ở edge đều cache được. **6.3** Header caching cho đúng — `Cache-Control` (`max-age`, `s-maxage`, `public`/`private`, `immutable`, và khác biệt then chốt `no-store` vs `no-cache`), `ETag`/`Last-Modified` + revalidation trả `304`, `stale-while-revalidate` và `stale-if-error`. _Cạm bẫy:_ nghĩ `no-cache` nghĩa là "không cache" — thực tế nó **vẫn cache** nhưng buộc revalidate; muốn không lưu gì phải dùng `no-store`. **6.4** Cache key & `Vary` — cache key gồm URL + những header khai báo trong `Vary`; `Vary: Accept-Encoding` là hợp lý, `Vary: User-Agent` băm nhỏ cache thành hàng nghìn bản; query param rác (`utm_*`, `fbclid`) làm phân mảnh cache. _Cạm bẫy:_ `Vary: Cookie` trên trang có analytics cookie → **mỗi người dùng một bản cache riêng**, hit ratio về gần 0 mà nhìn config vẫn thấy "đã bật cache". **6.5** Purge vs versioned URL & nội dung động ở edge — purge chậm, không đảm bảo toàn cầu và khó kiểm chứng; chiến lược đúng là **asset immutable + hash trong tên file** (`app.a3f9c1.js`, `max-age=31536000, immutable`) còn HTML thì TTL ngắn/revalidate. _Cạm bẫy:_ deploy asset mới nhưng HTML vẫn được cache lâu ở edge nên vẫn trỏ file cũ đã bị xoá → **trắng trang toàn bộ người dùng**, và purge không kịp cứu.
  - _Hình bắt buộc:_ (a) bản đồ thế giới SVG: cùng một user, so RTT tới origin vs tới edge gần nhất (có số km và ms); (b) sequence diagram bốn nhánh HIT / MISS / STALE / `304 Not Modified`; (c) SVG cache key bị phân mảnh do `Vary` và query param rác.
  - _Demo (A):_ chọn vị trí user trên bản đồ để xem RTT thay đổi; bảng bật/tắt từng header (`max-age`, `Vary`, `ETag`) và quan sát request kế tiếp thành HIT/MISS/STALE/304.
  - _Code thật:_ `nginx.conf` với `proxy_cache`, `proxy_cache_key`, `proxy_cache_use_stale`, header `X-Cache`; bảng cấu hình `Cache-Control` đúng cho từng loại tài nguyên (HTML / JS có hash / ảnh / API).
  - _Lab (B):_ dựng nginx làm tầng "edge" thứ hai trước app; đo thời gian tải asset lần 1 vs lần 2 và đọc header `X-Cache: HIT/MISS`; **cố tình thêm `Vary: Cookie`** để thấy hit ratio sụp, rồi bỏ đi và đo lại.

- **Bài 7 — Replication & Scale Tầng Đọc** (`sysdesign-replication.html`): **7.1** Ba mục đích khác nhau của replica — scale đọc, tính sẵn sàng cao (HA), và bản sao dự phòng; ba mục đích này đòi hỏi cấu hình khác nhau và thường bị gộp làm một; nối tỉ lệ đọc:ghi 100:1 ở Bài 1 để thấy vì sao scale đọc là món quà rẻ nhất. _Cạm bẫy:_ coi replica là backup — replica sao chép cả lệnh `DELETE` sai của bạn trong vài giây, nó không cứu được lỗi logic. **7.2** Cơ chế sao chép — WAL/binlog shipping; **không đồng bộ** (nhanh, có thể mất dữ liệu khi primary chết), **bán đồng bộ** (chờ ≥1 replica nhận), **đồng bộ** (an toàn nhất, chậm nhất); mỗi mức là một điểm trên trục durability ↔ latency ghi. _Cạm bẫy:_ bật đồng bộ với replica ở **region khác** → mọi lệnh ghi cộng thêm một RTT liên vùng (~150ms ở Bài 1), throughput ghi sụp mà nhìn CPU vẫn rảnh. **7.3** Replication lag & hệ quả người dùng thấy được — ví dụ cụ thể: user đổi ảnh đại diện (ghi vào primary) rồi reload (đọc từ replica) và **thấy ảnh cũ**, tưởng hệ thống hỏng; vi phạm **read-your-writes**. Cách vá theo mức độ: ghim đọc về primary trong N giây sau khi ghi, monotonic reads theo session, hoặc truyền LSN/token để đọc replica đã bắt kịp. _Cạm bẫy:_ round-robin đọc trên nhiều replica có lag khác nhau → dữ liệu **nhảy tiến rồi lùi** giữa hai lần refresh, bug này gần như không thể tái tạo theo yêu cầu. **7.4** Failover & split-brain — quy trình promote replica, vì sao **hai primary cùng nhận ghi là thảm hoạ** (dữ liệu phân kỳ, không thể merge tự động), vai trò của fencing và witness/quorum để quyết định ai được làm primary. _Cạm bẫy:_ failover tự động **không có fencing** — primary cũ chỉ bị tách mạng chứ chưa chết, nó quay lại và vẫn nhận ghi. **7.5** Vận hành — đo lag đúng cách, **alert theo lag chứ không theo CPU**, và mâu thuẫn kinh điển: dùng replica cho analytics làm lag phình lên, phá luôn read path của người dùng. _Cạm bẫy:_ chạy báo cáo nặng trên replica đang phục vụ người dùng — cần replica riêng cho analytics.
  - _Hình bắt buộc:_ (a) SVG luồng WAL từ primary sang replica ở ba chế độ async/semi-sync/sync, đánh dấu điểm "ghi được coi là xong"; (b) SVG timeline lag: ghi tại $t_0$, replica nhận tại $t_0+\Delta$, đọc tại $t_0+\varepsilon$ (với $\varepsilon < \Delta$) trả về dữ liệu cũ; (c) SVG split-brain hai primary phân kỳ dữ liệu.
  - _Demo (A):_ mô phỏng lag tương tác — bấm ghi, xem dữ liệu "chảy" dần tới replica; bấm đọc trong lúc chưa kịp để tự tay tái tạo bug read-your-writes; kéo mức lag và số replica.
  - _Code thật:_ router đọc/ghi bằng Node (ghi → primary, đọc → replica) kèm logic **ghim về primary sau khi ghi** để đảm bảo read-your-writes.
  - _Lab (B):_ `--profile replica` → Postgres primary + 1 read replica thật; **đo lag thật bằng `pg_stat_replication`**; gây lag bằng cách bơm ghi ồ ạt rồi tái tạo bug read-your-writes; bật ghim-primary và kiểm chứng bug biến mất.

- **Bài 8 — Sharding & Consistent Hashing** (`sysdesign-sharding.html`): **8.1** Khi nào **buộc** phải shard — replica không giúp gì cho throughput ghi và dung lượng; thứ tự ưu tiên đúng là tối ưu query → cache → replica → **shard là bước cuối** vì đắt nhất về độ phức tạp vĩnh viễn; dấu hiệu thật sự cần shard. _Cạm bẫy:_ shard quá sớm — trả giá bằng cross-shard query, rebalance và mất transaction cho một vấn đề mà thêm một index đã giải quyết được. **8.2** Chọn shard key — cần cardinality cao, phân bố đều, và **khớp với query pattern** (nếu không mọi truy vấn thành scatter-gather toàn bộ shard); composite key; hotspot khi phân bố lệch. _Cạm bẫy:_ shard theo timestamp hoặc ID tăng dần → **toàn bộ ghi mới dồn vào một shard** trong khi các shard cũ nằm không; shard theo tenant khi có một tenant khổng lồ cũng cho kết quả tương tự. **8.3** Modulo hashing và thảm hoạ resharding — `hash(key) % N` đơn giản nhưng khi thêm một node thì **~$(N-1)/N$ số key phải di trú**: từ 4 lên 5 shard là **80% dữ liệu phải chuyển**, kèm theo cache miss toàn cục. **8.4** Consistent hashing + virtual node — vòng hash, chỉ ~$1/N$ key phải di trú khi thêm node; **virtual node** để san phẳng phân bố và xử lý node có dung lượng khác nhau; đây là kỹ thuật đứng sau Dynamo/Cassandra/Memcached client. _Cạm bẫy:_ consistent hashing **không có vnode** vẫn lệch tải đáng kể vì các điểm băm phân bố không đều. **8.5** Hệ quả ở tầng ứng dụng — cross-shard query/JOIN/transaction, global secondary index, phân trang xuyên shard, rebalance online mà không downtime. _Cạm bẫy:_ viết JOIN xuyên shard trong tầng ứng dụng → **kéo toàn bộ dữ liệu về app** rồi join trong RAM, biến DB phân tán thành nút cổ chai mạng.
  - _Hình bắt buộc:_ (a) SVG so sánh trực tiếp modulo vs consistent hashing khi thêm **cùng một node** — tô đỏ toàn bộ key phải di trú ở mỗi bên (80% vs 20%); (b) SVG vòng hash có virtual node, cho thấy một node vật lý chiếm nhiều cung; (c) heatmap tải theo shard với shard key xấu (hotspot) vs tốt.
  - _Demo (A):_ vòng hash tương tác — thêm/bớt node và **đếm chính xác số key phải di trú**, đặt cạnh nhau modulo vs consistent hashing để thấy chênh lệch bằng con số; kéo số vnode xem độ lệch tải giảm.
  - _Code thật:_ `sysdesign-hashring.js` — consistent hashing đầy đủ có virtual node (dùng luôn cho demo), và shard router bằng Node định tuyến query theo shard key.
  - _Lab (B):_ hai container Postgres làm hai shard + router Node; nạp dữ liệu với shard key tốt rồi với shard key lệch, **đo chênh lệch tải và p99 giữa hai shard** để thấy hotspot bằng số thật.

- **Bài 9 — CAP & Các Mô Hình Nhất Quán** (`sysdesign-cap-consistency.html`): **9.1** Đọc CAP cho đúng — **P không phải là lựa chọn**: mạng sẽ chia, đó là thực tế vật lý; lựa chọn thật chỉ xuất hiện **khi** partition đang xảy ra, và là giữa C và A; vì thế khái niệm "hệ CA" là một nhầm lẫn phổ biến. _Cạm bẫy:_ dùng CAP làm cái cớ — "chúng ta là hệ AP nên không cần nhất quán" — cho những phần hệ thống không hề có partition và hoàn toàn có thể nhất quán mạnh. **9.2** PACELC — bổ sung phần CAP bỏ sót và quan trọng hơn trong 99,9% thời gian: **khi KHÔNG có partition (Else), vẫn phải chọn Latency hay Consistency**; đây mới là đánh đổi bạn gặp hằng ngày (đọc replica nhanh mà cũ, hay đọc primary chậm mà mới). **9.3** Phổ các mô hình nhất quán — từ eventual → monotonic reads → read-your-writes → causal → sequential → **linearizable**, kèm hệ quả **người dùng cảm nhận được** cho từng mức (nối trực tiếp bug avatar ở Bài 7). _Cạm bẫy:_ nói "eventual consistency" mà không nói **eventual là bao lâu** — 50ms và 5 phút là hai hệ thống hoàn toàn khác nhau về trải nghiệm. **9.4** Quorum $R + W > N$ — ví dụ cụ thể $N=3$: $W=2, R=2$ (cân bằng), $W=3, R=1$ (ghi chậm/đọc nhanh), $W=1, R=3$ (ngược lại); vì sao bất đẳng thức này đảm bảo tập đọc và tập ghi giao nhau. _Cạm bẫy:_ tin quorum tự động cho linearizability — thiếu read-repair và cơ chế giải quyết xung đột thì vẫn đọc ra giá trị cũ. **9.5** Linearizability vs serializability (hai khái niệm khác nhau thường bị gộp) và nhất quán ở tầng ứng dụng — idempotency (Bài 11), CRDT, và **last-write-wins**. _Cạm bẫy:_ LWW **âm thầm mất dữ liệu** khi hai ghi đồng thời, càng tệ hơn vì "ai sau" được quyết định bằng đồng hồ tường vốn bị lệch giữa các máy — dẫn thẳng sang vấn đề clock ở Bài 10.
  - _Hình bắt buộc:_ (a) SVG ba node bị partition, tách hai nhánh hệ quả: chọn C (từ chối ghi, giữ đúng) vs chọn A (nhận ghi, phân kỳ dữ liệu); (b) SVG thang phổ nhất quán từ eventual đến linearizable, gắn ví dụ trải nghiệm người dùng ở mỗi mức; (c) SVG quorum với ba cấu hình $R$/$W$ khác nhau, tô vùng giao nhau.
  - _Demo (A):_ ba node mô phỏng có nút "tạo partition": chọn ưu tiên C hay A rồi thử đọc/ghi để thấy kết quả khác nhau; kéo $N$, $R$, $W$ và hệ thống báo ngay cấu hình có thoả $R+W>N$ hay không cùng hệ quả.
  - _Code thật:_ mô phỏng quorum read/write bằng JS (có node chậm/chết), và ví dụ chạy được cho thấy **LWW làm mất một lệnh ghi** khi hai client ghi đồng thời với clock lệch.
  - _Lab (B):_ tạo partition **thật** bằng `docker network disconnect` giữa app và replica; quan sát ứng dụng xử sự thế nào (lỗi, treo, hay trả dữ liệu cũ) và đối chiếu với mô hình nhất quán mà bạn tưởng mình đang có.

- **Bài 10 — Distributed Lock** (`sysdesign-distributed-lock.html`): **10.1** Phân biệt hai nhu cầu hoàn toàn khác nhau — lock cho **hiệu quả** (tránh làm việc trùng, hỏng thì chỉ tốn CPU) và lock cho **đúng đắn** (hai worker cùng chạy thì dữ liệu sai/mất tiền); phần lớn tài liệu gộp hai thứ này làm một và đó là nguồn gốc mọi tai nạn. _Cạm bẫy:_ dùng distributed lock để bảo đảm correctness cho nghiệp vụ tiền bạc — lock phân tán **không** cho bạn đảm bảo đó; công cụ đúng là transaction của DB hoặc idempotency (Bài 11). **10.2** `SET NX PX` và các cạm bẫy triển khai — bắt buộc có TTL (không thì holder chết là deadlock vĩnh viễn), bắt buộc có **token ngẫu nhiên** để chỉ chủ sở hữu mới xoá được, và lệnh giải phóng phải **atomic** (script Lua kiểm token rồi mới `DEL`). _Cạm bẫy:_ `DEL` thẳng không kiểm token — lock của bạn đã hết hạn, người khác đã giành được, và bạn **xoá lock của họ**. **10.3** Vì sao Redlock gây tranh cãi — thuật toán giả định đồng hồ các node đủ chính xác và tiến trình không bị dừng lâu; một **GC pause hoặc treo VM dài hơn TTL** khiến hai worker cùng tin mình đang giữ lock, dù Redis hoạt động hoàn toàn đúng; tóm tắt lập luận của Kleppmann và phản biện. _Cạm bẫy:_ tin rằng dùng 5 node Redis thì an toàn hơn 1 — vấn đề nằm ở **giả định về thời gian**, thêm node không sửa được. **10.4** Fencing token — lời giải đúng cho nhóm correctness: lock cấp một số **tăng đơn điệu**, mọi thao tác ghi phải kèm số này, và tài nguyên đích **từ chối** token nhỏ hơn token đã thấy; nhờ vậy worker "zombie" quay lại sau GC pause bị chặn ở tầng tài nguyên. _Cạm bẫy:_ triển khai fencing nhưng tài nguyên không kiểm token — lúc đó token chỉ là số trang trí. **10.5** Tránh lock hoàn toàn (thường là câu trả lời tốt nhất) — thao tác atomic sẵn có (`INCR`, compare-and-swap), idempotency, **phân vùng theo key** để mỗi key chỉ có một worker xử lý (queue partition ở Bài 12), optimistic concurrency bằng cột version. _Cạm bẫy:_ lock quá thô (một lock cho cả bảng) hoặc giữ lock trong lúc gọi mạng — throughput sụp và một dependency chậm làm treo toàn bộ.
  - _Hình bắt buộc:_ (a) SVG timeline hai worker + một GC pause dài hơn TTL, tô rõ **khoảng thời gian cả hai cùng tin mình giữ lock**; (b) SVG fencing token: worker zombie gửi token cũ và bị tài nguyên từ chối; (c) SVG so sánh ba chiến lược lock / atomic op / phân vùng theo key.
  - _Demo (A):_ hai worker mô phỏng tranh một lock — kéo thanh "GC pause" và "clock skew" để **tự tay tạo ra tình huống hai worker cùng giữ lock**, rồi bật fencing token và thấy ghi của worker cũ bị chặn.
  - _Code thật:_ Redis lock đúng chuẩn (`SET key token NX PX`, giải phóng bằng Lua kiểm token), và bản có fencing token tăng đơn điệu.
  - _Lab (B):_ hai worker Node thật cùng nhận một job từ Redis: chạy **không lock** (thấy double-processing bằng số đếm thật) → thêm lock → chủ động tạo pause để lock hỏng → thêm fencing token và kiểm chứng.

- **Bài 11 — Idempotency & Retry An Toàn** (`sysdesign-idempotency.html`): **11.1** Vì sao "exactly-once" là ảo tưởng — bài toán hai vị tướng: khi client nhận timeout, nó **không thể biết** request đã được xử lý hay chưa; mọi thứ khả thi trong thực tế là **at-least-once + xử lý idempotent**, tổ hợp này mới tạo ra _hiệu ứng_ exactly-once. _Cạm bẫy:_ tin quảng cáo "exactly-once delivery" của message broker — thứ họ đảm bảo là exactly-once _processing_ trong phạm vi hẹp, không phải cho side-effect ra thế giới bên ngoài (gọi API thanh toán, gửi email). **11.2** Idempotency key & bảng dedup — client sinh key duy nhất cho **ý định** (không phải cho lần thử), server lưu ánh xạ key → kết quả, gặp lại key thì **trả về kết quả cũ** thay vì xử lý lại; TTL của key phải dài hơn thời gian retry tối đa của client. _Cạm bẫy:_ chỉ lưu một cờ "đã xử lý" mà không lưu kết quả — request retry nhận `200` rỗng, client mất mã đơn hàng và không biết phải làm gì. **11.3** Ghi dedup và xử lý nghiệp vụ phải nằm trong **cùng một transaction** — nếu tách làm hai bước sẽ tồn tại cửa sổ cho hai request song song cùng lọt qua; dùng **unique constraint** làm cơ chế dedup rẻ và chắc chắn nhất. _Cạm bẫy:_ mẫu check-then-act (kiểm tra key tồn tại rồi mới ghi) — kinh điển race condition, hai request đồng thời đều thấy "chưa có". **11.4** Ngữ nghĩa HTTP — `GET`/`PUT`/`DELETE` idempotent theo đặc tả còn `POST` thì không; `PUT` với ID do **client** sinh biến tạo mới thành idempotent tự nhiên; phân biệt idempotent (lặp lại không đổi kết quả) với commutative (đổi thứ tự không đổi kết quả) — hai tính chất độc lập. _Cạm bẫy:_ đặt endpoint tạo đơn là `POST /orders` không kèm idempotency key, rồi mạng chập chờn sinh ra đơn trùng mà không ai phát hiện cho tới khi khách phàn nàn. **11.5** Idempotency ở tầng dữ liệu và cho consumer — `UPSERT`/`INSERT ... ON CONFLICT`, natural key thay vì auto-increment, dedup theo `event_id` cho consumer queue (điều kiện tiên quyết của Bài 12). _Cạm bẫy:_ TTL của bảng dedup **ngắn hơn** chu kỳ retry của queue — job bị redeliver sau khi key đã hết hạn và được xử lý lần thứ hai.
  - _Hình bắt buộc:_ (a) SVG timeline hai vị tướng: server xử lý xong nhưng response bị mất, client không phân biệt được với trường hợp thất bại; (b) sequence diagram hai nhánh retry — có và không có idempotency key; (c) SVG ranh giới transaction bao trọn cả nghiệp vụ lẫn ghi bảng dedup.
  - _Demo (A):_ mô phỏng thanh toán: bấm "gửi" rồi giả lập timeout và bấm "thử lại" — không có key thì số dư bị trừ hai lần, bật key thì chỉ trừ một lần và lần hai trả về đúng kết quả cũ.
  - _Code thật:_ endpoint `POST /charge` bằng Node với bảng dedup Postgres dùng unique constraint, xử lý và ghi dedup trong cùng transaction, trả lại response đã lưu khi trùng key.
  - _Lab (B):_ dùng `wrk` bắn **cùng một idempotency key** hàng nghìn lần đồng thời; đếm số bản ghi tạo ra trong DB (phải đúng bằng 1); tắt idempotency và đếm lại để thấy con số thật của thiệt hại.

- **Bài 12 — Message Queue & Xử Lý Bất Đồng Bộ** (`sysdesign-message-queue.html`): **12.1** Vì sao chuyển sang bất đồng bộ — tách latency người dùng khỏi công việc nặng, decouple producer/consumer, và **hấp thụ burst** (queue làm bộ đệm cho đỉnh tải); cái giá phải trả: eventual consistency, khó debug, thêm hạ tầng phải vận hành. _Cạm bẫy:_ đẩy vào queue những việc mà người dùng **cần kết quả ngay** — họ nhận `202 Accepted` rồi ngồi đoán khi nào xong. **12.2** Ngữ nghĩa gửi nhận & ack — at-most-once vs at-least-once; **ack phải gửi sau khi xử lý xong**, không phải khi vừa nhận; visibility timeout và cơ chế redeliver; vì sao at-least-once **bắt buộc** consumer phải idempotent (Bài 11). _Cạm bẫy:_ ack ngay lúc nhận message cho "gọn" — worker crash giữa chừng là job biến mất vĩnh viễn, không ai biết. **12.3** Retry, poison message & DLQ — giới hạn số lần thử, backoff, và **dead letter queue** cho message không bao giờ xử lý được; DLQ phải có alert và người chịu trách nhiệm xem. _Cạm bẫy:_ retry vô hạn một poison message ở đầu partition → **chặn toàn bộ** message phía sau, một bản ghi hỏng làm đứng cả pipeline; hoặc có DLQ nhưng không ai nhìn nó suốt sáu tháng. **12.4** Thứ tự & consumer group — thứ tự chỉ được đảm bảo **trong phạm vi một partition/stream key**, thêm consumer để scale sẽ phá thứ tự toàn cục; chọn partition key theo entity (ví dụ `order_id`) để giữ đúng thứ tự ở nơi thật sự cần. _Cạm bẫy:_ giả định thứ tự toàn cục — event `OrderCancelled` được xử lý trước `OrderCreated` và hệ thống rơi vào trạng thái vô nghĩa. **12.5** Backpressure & queue depth — **queue depth là chỉ số sức khoẻ số một**; producer nhanh hơn consumer thì depth tăng không giới hạn và theo Little's Law (Bài 1) thời gian chờ cũng tăng không giới hạn; các van xả: scale consumer, giới hạn độ dài queue, load shedding, giảm tốc producer (Bài 13). _Cạm bẫy:_ coi queue là "vô hạn nên an toàn" — nó **biến một sự cố 5 phút thành tồn đọng 6 giờ**, và người dùng nhận kết quả của hành động họ đã quên từ lâu.
  - _Hình bắt buộc:_ (a) SVG cùng một use case ở hai kiểu đồng bộ vs bất đồng bộ, đánh dấu điểm người dùng nhận phản hồi; (b) SVG timeline ack/nack + visibility timeout + redelivery, kèm nhánh worker crash; (c) đồ thị queue depth theo thời gian ở ba kịch bản (consumer đủ / thiếu / scale kịp lúc).
  - _Demo (A):_ Traffic Lab + node queue: kéo tốc độ producer và consumer, xem depth ổn định hay tăng vô hạn; bật DLQ và bơm poison message để xem nó bị tách ra đâu.
  - _Code thật:_ producer/consumer Redis Streams bằng Node (`XADD`, `XREADGROUP`, `XACK`, `XAUTOCLAIM`), consumer idempotent theo `event_id`, và luồng chuyển sang DLQ sau N lần thử.
  - _Lab (B):_ `--profile queue` → bơm 100.000 job, **đo queue depth và thời gian tiêu thụ thật**; tăng số worker và đo lại để thấy quan hệ tuyến tính (hoặc không); chèn poison message để quan sát nó chặn partition rồi vá bằng DLQ.

- **Bài 13 — Rate Limiting & Backpressure** (`sysdesign-rate-limiting.html`): **13.1** Rate limit bảo vệ khỏi ai — không chỉ kẻ tấn công, mà chủ yếu là **chính client của bạn** đang retry điên cuồng (Bài 17) và chính bạn khỏi việc nhận nhiều hơn khả năng xử lý; phân biệt rate limit (kỹ thuật, bảo vệ hệ thống), quota (thương mại, theo gói cước) và throttle (làm chậm thay vì từ chối). _Cạm bẫy:_ chỉ đặt rate limit ở biên cho người ngoài mà không đặt giữa các service nội bộ — nơi cascade thật sự bắt đầu. **13.2** Bốn thuật toán và đánh đổi — **fixed window** (đơn giản nhưng cho phép **burst gấp đôi** ngay biên hai cửa sổ), **sliding window log** (chính xác tuyệt đối, tốn bộ nhớ theo số request), **sliding window counter** (xấp xỉ tốt, rẻ), **token bucket** (cho phép burst có kiểm soát — thường là lựa chọn đúng cho API), leaky bucket (làm phẳng đầu ra). Bảng so sánh độ chính xác ↔ bộ nhớ ↔ khả năng chịu burst. _Cạm bẫy:_ chọn fixed window cho endpoint nhạy cảm rồi bị vượt gấp đôi hạn mức ở đúng thời điểm giao cửa sổ. **13.3** Rate limit trong hệ phân tán — bộ đếm phải **atomic** khi nhiều instance cùng cập nhật; đánh đổi giữa chính xác tuyệt đối (mọi request hỏi Redis, cộng latency) và xấp xỉ (đếm cục bộ, đồng bộ định kỳ); chọn chiều giới hạn cho đúng (per-user / per-IP / per-endpoint / per-tenant). _Cạm bẫy:_ dùng `INCR` rồi `EXPIRE` ở **hai lệnh riêng** — nếu process chết giữa hai lệnh thì key **không bao giờ hết hạn**, user bị khoá vĩnh viễn; phải gộp bằng Lua. Và giới hạn theo IP khi client nằm sau NAT/proxy sẽ khoá nhầm cả một công ty. **13.4** Giao tiếp đúng với client — trả `429 Too Many Requests` kèm `Retry-After` và bộ header `X-RateLimit-Limit/Remaining/Reset` để client biết đường lùi; từ chối nhanh và rõ ràng luôn tốt hơn để client treo tới timeout. _Cạm bẫy:_ trả `500`/`503` khi vượt hạn mức — client coi đó là lỗi tạm thời và **retry ngay lập tức**, đúng thứ bạn đang cố ngăn. **13.5** Load shedding có chọn lọc & admission control — khi thật sự quá tải, chủ động loại bỏ **có ưu tiên**: giữ health check, giữ request của phiên đang thanh toán, bỏ trước những request rẻ hoặc có thể thử lại sau; đây là bước đệm sang graceful degradation ở Bài 17. _Cạm bẫy:_ shed đồng đều tất cả — bạn vẫn sập SLO cho nhóm quan trọng nhất trong khi vẫn phục vụ traffic không đáng.
  - _Hình bắt buộc:_ (a) SVG bốn thuật toán chạy trên **cùng một chuỗi request**, làm nổi bật burst gấp đôi ở biên cửa sổ của fixed window; (b) SVG token bucket với mực nước token đầy/vơi theo thời gian; (c) SVG luồng `429` + `Retry-After` và hành vi client tương ứng.
  - _Demo (A):_ bốn thuật toán chạy song song cạnh nhau trên cùng input, hiển thị request nào được nhận/bị chặn ở mỗi thuật toán tại từng thời điểm.
  - _Code thật:_ **Lua script atomic** cho Redis (token bucket và sliding window counter), middleware Node trả đúng bộ header rate limit.
  - _Lab (B):_ gắn rate limiter thật vào app; dùng `wrk` bắn vượt hạn mức và **đếm tỉ lệ `429` thực tế**; đo phần latency mà rate limiter cộng thêm vào p99 (chi phí của việc bảo vệ).

- **Bài 14 — Event Sourcing & CQRS** (`sysdesign-event-sourcing.html`): **14.1** Trạng thái là kết quả của lịch sử — thay vì lưu `balance = 100`, lưu chuỗi sự kiện `Deposited(+50)`, `Deposited(+70)`, `Withdrawn(-20)`; trạng thái hiện tại luôn tính lại được, còn lịch sử thì **không thể tái tạo** từ trạng thái; lợi ích tự nhiên: audit trail đầy đủ, debug bằng cách tua lại, trả lời được câu hỏi nghiệp vụ chưa từng nghĩ tới lúc thiết kế. _Cạm bẫy:_ áp event sourcing cho CRUD đơn giản — trả giá bằng độ phức tạp lớn để đổi lấy lợi ích không ai cần. **14.2** Event là **fact bất biến** — đặt tên ở thì quá khứ (`OrderPlaced`, không phải `PlaceOrder` vốn là _command_), không bao giờ sửa hay xoá event đã ghi; muốn sửa sai thì ghi thêm **event bù** (compensating event). _Cạm bẫy:_ chạy `UPDATE` lên bảng event để "sửa nhanh một lỗi" — phá vỡ toàn bộ đảm bảo của mô hình, mọi projection dựng lại từ đó đều sai và không ai truy được vì sao. **14.3** Projection & read model — worker đọc log dựng nên các bảng đọc đã tối ưu sẵn cho từng màn hình; **nhiều projection khác nhau từ cùng một log**; khi phát hiện bug trong projection hoặc cần thêm view mới thì chỉ việc **replay lại từ đầu**. _Cạm bẫy:_ projection không idempotent — replay lần hai cộng dồn số liệu thành gấp đôi (đây chính là lý do Bài 11 phải học trước). **14.4** CQRS — tách đường ghi (command: validate, sinh event) khỏi đường đọc (query: đọc read model đã dựng sẵn), cho phép scale và tối ưu hai bên độc lập; nhưng read model **nhất quán cuối**, nên giao diện phải xử lý được độ trễ đó (optimistic update, hoặc chờ đúng version). _Cạm bẫy:_ dùng CQRS nhưng UI vẫn giả định "ghi xong đọc thấy ngay" — tái hiện đúng bug read-your-writes ở Bài 7 nhưng ở tầng kiến trúc, và lần này không vá bằng cách ghim primary được. **14.5** Vận hành thực tế — **snapshot** khi log của một aggregate quá dài (không thể replay 10 triệu event mỗi lần đọc), versioning schema event và upcasting khi định dạng thay đổi, giới hạn (query ad-hoc rất khó, cần công cụ riêng). _Cạm bẫy:_ áp event sourcing cho **toàn bộ** hệ thống thay vì chỉ cho vài aggregate thật sự cần lịch sử — chi phí nhận thức đổ lên mọi lập trình viên, kể cả người chỉ sửa một form.
  - _Hình bắt buộc:_ (a) SVG so sánh state-oriented vs event-oriented trên cùng một tài khoản (một bên chỉ có con số cuối, một bên có cả dòng thời gian); (b) SVG kiến trúc CQRS: command → event log → nhiều projection → nhiều read model; (c) SVG timeline replay tái dựng trạng thái, có đánh dấu điểm snapshot.
  - _Demo (A):_ trục thời gian event tương tác — thêm/bớt/chèn event, bấm "replay" xem trạng thái được tái dựng từng bước; **sửa logic projection rồi replay lại** để thấy read model tự sửa mà log không đổi.
  - _Code thật:_ event store trên Postgres dạng append-only (`UNIQUE(aggregate_id, version)` để chống ghi đồng thời), projection worker Node idempotent, và hàm rebuild từ snapshot.
  - _Lab (B):_ **xoá sạch read model** rồi replay toàn bộ từ event log để khôi phục — chứng minh bằng thao tác thật rằng log mới là nguồn chân lý, còn read model chỉ là bộ nhớ đệm dựng lại được.

- **Bài 15 — Monolith vs Microservices** (`sysdesign-monolith-microservices.html`): **15.1** Vấn đề thật cần giải là gì — microservices giải quyết bài toán **tổ chức** (team deploy độc lập, biên trách nhiệm rõ — Conway's law) và scale riêng phần nóng, chứ không phải bài toán kỹ thuật thuần tuý; **monolith module hoá** đạt được phần lớn lợi ích về ranh giới code mà không phải trả giá phân tán. _Cạm bẫy:_ chọn microservices vì nó "hiện đại" hoặc vì CV — với team 5 người, chi phí vận hành vượt xa mọi lợi ích. **15.2** Cái giá đo được — mỗi hop cộng thêm latency mạng và serialization; **độ khả dụng nhân dồn**: 5 service mỗi cái 99,9% cho chuỗi chỉ còn $0.999^5 \approx 99.5\%$ (từ 43 phút lên ~3,6 giờ downtime/tháng); và fan-out làm p99 xấu đi theo đúng công thức ở Bài 1. Con số này sẽ được **đo thật** ở lab. _Cạm bẫy:_ chỉ nhìn latency trung bình khi tách service mà bỏ qua p99 và xác suất lỗi cộng dồn. **15.3** Distributed transaction & saga — vượt qua ranh giới service là mất ACID; **saga** thay thế bằng chuỗi giao dịch cục bộ + **hành động bù** khi thất bại; điều kiện tiên quyết là idempotency (Bài 11) và thường là event (Bài 14). _Cạm bẫy:_ cố kéo 2PC vào để "giữ ACID" (khoá tài nguyên xuyên service, một service chậm là treo tất cả), hoặc làm saga nhưng **quên viết hành động bù** — dữ liệu lệch âm thầm, phát hiện sau nhiều tháng. **15.4** Chia theo đâu — theo **bounded context** nghiệp vụ, không theo tầng kỹ thuật; mỗi service sở hữu dữ liệu của mình; chấp nhận dữ liệu trùng lặp có chủ đích. _Cạm bẫy:_ chia theo tầng (`user-api`, `user-logic`, `user-db`) nên mọi tính năng đều phải sửa cả ba service và deploy đồng thời — **distributed monolith**, gánh mọi chi phí phân tán mà không được lợi ích nào; và **dùng chung một database** giữa các service, giữ nguyên coupling nhưng mất luôn transaction. **15.5** Đường đi thực tế & khi nào **không** chia — bắt đầu bằng monolith module hoá, chỉ tách khi có tín hiệu rõ ràng (một phần cần scale riêng, hai team chặn nhau khi deploy); dùng **strangler fig** để tách dần thay vì viết lại; luôn tính vào chi phí observability, CI/CD, on-call nhân theo số service. _Cạm bẫy:_ chia khi chưa hiểu boundary nghiệp vụ — vẽ sai đường cắt rồi phải gọi chéo liên tục, và sửa một đường cắt sai đắt hơn nhiều so với tách muộn.
  - _Hình bắt buộc:_ (a) SVG cùng một use case ở hai kiến trúc: monolith 1 hop vs 4 service 5 hop, ghi rõ latency cộng dồn và availability nhân dồn; (b) SVG saga với chuỗi bước và các hành động bù khi bước 3 thất bại; (c) SVG đúng/sai khi vẽ đường cắt — theo bounded context vs theo tầng kỹ thuật.
  - _Demo (A):_ slider số service trong chuỗi phụ thuộc và độ khả dụng mỗi service, hiển thị tức thì availability tổng hợp và p99 ước tính — con số tụt nhanh hơn trực giác rất nhiều.
  - _Code thật:_ tách một endpoint monolith thành hai service HTTP gọi nhau (kèm timeout, retry idempotent), và một saga đơn giản có hành động bù chạy được.
  - _Lab (B):_ tách app trong lab thành hai service, **đo p99 trước và sau bằng cùng một kịch bản `wrk`** để thấy chính xác cái giá của một network hop; chạy saga và chủ động làm bước cuối thất bại để quan sát rollback bằng hành động bù.

- **Bài 16 — Observability: Metrics, Logs & Tracing** (`sysdesign-observability.html`): **16.1** Monitoring vs observability — monitoring trả lời những câu hỏi bạn **đã biết trước** sẽ hỏi (dashboard, alert ngưỡng); observability là khả năng trả lời câu hỏi **chưa từng lường trước** khi sự cố lạ xảy ra; ba trụ cột metrics/logs/traces có vai trò, độ chi tiết và **chi phí** rất khác nhau. _Cạm bẫy:_ "log tất cả cho chắc" — hoá đơn phình theo cấp số, truy vấn chậm tới mức không dùng được lúc khẩn cấp, mà vẫn thiếu đúng trường cần thiết. **16.2** Metrics đúng: RED & USE — **RED** (Rate, Errors, Duration) cho mỗi service, **USE** (Utilization, Saturation, Errors) cho mỗi tài nguyên; dùng **histogram** để tính được percentile, không dùng gauge/average cho latency (đã chứng minh ở Bài 1); cẩn thận **cardinality** — mỗi tổ hợp nhãn là một chuỗi thời gian riêng. _Cạm bẫy:_ đặt `user_id` hoặc `request_id` làm label → hàng triệu chuỗi thời gian, hệ metrics sập trước cả hệ thống bạn đang giám sát. **16.3** Structured log & correlation ID — log dạng JSON có schema thay vì chuỗi tự do; **correlation ID sinh ở gateway** (Bài 4) và truyền xuyên mọi service (Bài 15); sampling để giảm chi phí; dùng log level cho đúng. _Cạm bẫy:_ **mất correlation ID khi đi qua queue** — request tracing đứt đúng tại ranh giới async, tức là đứt ở chỗ khó debug nhất; phải truyền ID trong chính message (Bài 12). **16.4** Distributed tracing — trace/span/parent-span, context propagation, waterfall cho thấy **hop nào** ăn hết thời gian thay vì phải đoán; sampling ở đầu (head-based, rẻ) vs ở cuối (tail-based, giữ được đúng những trace chậm/lỗi). _Cạm bẫy:_ chỉ instrument HTTP mà bỏ qua DB query và job trong queue — waterfall có một khoảng trống lớn đúng chỗ vấn đề nằm. **16.5** SLI/SLO/error budget — chọn SLI từ **góc nhìn người dùng** (tỉ lệ request thành công dưới X ms), SLO là mục tiêu có số, **error budget** biến độ tin cậy thành ngân sách chi tiêu được, điều tiết tốc độ ship tính năng; alert theo **triệu chứng** và theo tốc độ đốt budget, không alert theo nguyên nhân. _Cạm bẫy:_ alert "CPU > 80%" — đánh thức on-call lúc 3 giờ sáng cho một tình trạng người dùng không hề cảm nhận, dẫn tới alert fatigue rồi bỏ qua cả alert thật; và đặt SLO 100% (không còn ngân sách để deploy bất cứ thứ gì).
  - _Hình bắt buộc:_ (a) SVG ba trụ cột kèm câu hỏi mà **chỉ** trụ cột đó trả lời được, và chi phí tương đối; (b) SVG cùng một sự cố nhìn qua hai lăng kính — biểu đồ average phẳng lặng vs biểu đồ p99 dựng đứng; (c) SVG trace waterfall xuyên gateway → 2 service → DB → queue, chỉ rõ span nào chiếm phần lớn thời gian.
  - _Demo (A):_ dashboard giả lập một sự cố: xem bằng "chỉ có average" (không phát hiện được gì bất thường) rồi bật p99 + trace để thấy nguyên nhân hiện ra ngay — bài học trực quan về việc chọn sai chỉ số.
  - _Code thật:_ middleware Node ghi metrics dạng histogram, sinh và truyền correlation ID xuyên hai service **và qua cả queue**, dựng span thủ công thành trace hoàn chỉnh.
  - _Lab (B):_ **tính SLO từ số đo thật của chính lab** (chạy tải, thu số, tính tỉ lệ request đạt ngưỡng); dựng trace waterfall cho một request đi hết chuỗi và chỉ ra bottleneck bằng dữ liệu chứ không bằng phỏng đoán.

- **Bài 17 — Chế Độ Lỗi & Khả Năng Chống Chịu** (`sysdesign-resilience.html`): **17.1** Cascade failure — cơ chế lan truyền: một dependency chậm → caller giữ connection/thread chờ → cạn connection pool → caller cũng chậm → lan ngược lên toàn hệ thống; đặc điểm nguy hiểm nhất là **hệ thống tự đánh sập mình** dù nguyên nhân gốc chỉ là một sự cố nhỏ đã qua. _Cạm bẫy:_ **retry amplification** — retry 3 lần ở mỗi tầng của chuỗi 3 tầng tạo ra **27×** tải lên service tận cùng, đúng lúc nó đang yếu nhất. **17.2** Retry cho đúng — chỉ retry lỗi **tạm thời** và chỉ với thao tác **idempotent** (Bài 11); exponential backoff **kèm jitter**; giới hạn bằng retry budget thay vì số lần cố định; không bao giờ retry lỗi 4xx. _Cạm bẫy:_ backoff **không có jitter** — mọi client cùng chờ đúng 1s, 2s, 4s nên các đợt retry đồng bộ thành từng đợt sóng đập vào server vừa hồi phục, đánh sập lại ngay. **17.3** Timeout & deadline propagation — mọi lời gọi mạng đều phải có timeout (mặc định của nhiều thư viện là **vô hạn**); timeout phải **giảm dần theo độ sâu** của chuỗi và truyền deadline xuống dưới, để không ai làm việc cho một request đã bị bỏ. _Cạm bẫy:_ timeout ở tầng ngoài ngắn hơn tầng trong — client đã bỏ cuộc từ lâu nhưng cả chuỗi backend vẫn cày tiếp, đốt tài nguyên tạo ra kết quả không ai nhận (nối lại Bài 4). **17.4** Circuit breaker & bulkhead — máy trạng thái closed → open → half-open, ngưỡng lỗi và số request thăm dò; **bulkhead** cô lập connection pool theo từng dependency để một dependency chết không hút cạn tài nguyên dùng chung. _Cạm bẫy:_ breaker đặt phạm vi quá rộng (mở cho toàn service khi chỉ một endpoint hỏng), hoặc half-open thả quá nhiều request thăm dò cùng lúc và giết lại service vừa hồi. **17.5** Graceful degradation & chaos engineering — trả kết quả **suy giảm** (dữ liệu cache cũ, ẩn phần không cốt lõi) luôn tốt hơn trang lỗi; xác định trước đường đi quan trọng nhất phải sống bằng mọi giá; **chủ động tiêm lỗi** để kiểm chứng thay vì tin vào giả định. _Cạm bẫy:_ đường fallback lại **gọi chính dependency đang chết**, hoặc cơ chế failover chưa bao giờ được diễn tập nên đúng lúc cần thì nó cũng hỏng.
  - _Hình bắt buộc:_ (a) SVG cascade failure kèm phép nhân retry amplification 3×3×3 = 27; (b) SVG máy trạng thái circuit breaker với điều kiện chuyển trạng thái; (c) SVG so sánh các đợt retry **có** và **không có** jitter (một bên là sóng đồng bộ, một bên trải đều).
  - _Demo (A):_ Traffic Lab chế độ "gây sự cố": bật retry không jitter và xem hệ thống tự đánh sập mình bằng chính lưu lượng retry; bật circuit breaker và quan sát cascade bị chặn lại; kéo timeout để thấy tài nguyên bị giam.
  - _Code thật:_ circuit breaker bằng JS (đủ ba trạng thái), retry có exponential backoff + jitter + budget, và truyền deadline xuyên các lời gọi.
  - _Lab (B):_ tiêm lỗi **thật** vào lab — `docker stop` database, dùng `tc` làm chậm mạng container — rồi **đếm số request lỗi và đo thời gian hồi phục** trong hai trường hợp có và không có circuit breaker.

- **Bài 18 — Capstone: Thiết Kế & Chạy Thật Một Hệ Thống** (`sysdesign-capstone.html`): **18.1** Nhận đề & làm rõ yêu cầu — đề bài cụ thể: **hệ thống rút gọn URL kèm thống kê lượt click** (chọn có chủ đích vì hội đủ ba dạng tải: đọc cực nặng ở đường redirect, ghi vừa phải khi tạo link, và analytics phù hợp xử lý bất đồng bộ); phân biệt yêu cầu chức năng và phi chức năng; danh sách câu hỏi phải hỏi trước khi vẽ bất cứ thứ gì (DAU, RPS đỉnh, tỉ lệ đọc:ghi, kích thước payload, mức nhất quán cần thiết, SLO). _Cạm bẫy:_ nhảy vào vẽ kiến trúc trước khi biết con số — mọi lựa chọn sau đó đều là phỏng đoán. **18.2** Ước lượng & thiết kế v1 — chạy back-of-envelope (Bài 1) ra RPS đỉnh, dung lượng, băng thông; chọn **kiến trúc tối giản chạy được** thay vì kiến trúc đẹp trên giấy; viết **ADR** ghi lại quyết định, lý do, đánh đổi và **các phương án đã loại bỏ cùng lý do**. _Cạm bẫy:_ thiết kế cho quy mô tưởng tượng gấp 100 lần nhu cầu thật — trả chi phí phức tạp ngay hôm nay cho lợi ích có thể không bao giờ đến. **18.3** Dựng thật & đo baseline — chạy full stack, đo trước khi tối ưu, dùng observability (Bài 16) để **xác định** bottleneck. _Cạm bẫy:_ tối ưu theo cảm giác hoặc theo thói quen ("chắc là DB chậm") — số liệu thường chỉ vào chỗ không ai ngờ. **18.4** Vòng lặp đo → vá → đo lại — áp lần lượt cache (Bài 5), read replica (Bài 7), queue cho analytics (Bài 12), rate limit (Bài 13), circuit breaker (Bài 17); **bắt buộc ghi số trước/sau cho từng bước**, nhờ đó thấy rõ bước nào đáng công và bước nào chỉ thêm phức tạp mà không cải thiện gì. Đây là phần giá trị nhất của cả series. **18.5** Tổng kết & giới hạn — bảng tổng hợp toàn bộ đánh đổi đã gặp trong 17 bài; **thành thật về những gì lab không mô phỏng được** (đa vùng địa lý, sự cố hạ tầng thật, chi phí tiền bạc, yếu tố con người khi vận hành lúc 3 giờ sáng); checklist tự đánh giá một bản thiết kế. _Cạm bẫy:_ tin rằng chạy tốt trên một máy laptop với Docker nghĩa là thiết kế đã sẵn sàng cho production.
  - _Hình bắt buộc:_ (a) SVG tiến hoá kiến trúc v1 → v2 → v3 qua từng vòng tối ưu; (b) đồ thị p99 và throughput qua từng lần vá, vẽ từ **số đo thật** của người học; (c) SVG kiến trúc cuối cùng đầy đủ thành phần với chú thích bài học nào đóng góp phần nào.
  - _Demo (A):_ Traffic Lab bản đầy đủ — tự do dựng topology, chạy kịch bản tải và kịch bản sự cố, xuất báo cáo số liệu để đối chiếu với kết quả lab thật.
  - _Code thật:_ toàn bộ mã nguồn hệ thống rút gọn URL (Node `http` thuần, không framework) đủ chạy được với mọi thành phần đã học.
  - _Lab (B):_ stack Docker hoàn chỉnh (nginx + N app + Redis + Postgres primary/replica + queue + worker); thực hiện trọn vòng lặp đo-vá-đo và **điền bảng kết quả cuối cùng bằng số của chính máy mình**.

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

> **Ngoại lệ Series 18 & 19:** dòng "Quiz" ở trên **không áp dụng** cho Series 18 (Kỹ Thuật Hệ Thống AI) và Series 19 (Cơ Sở Dữ Liệu Vector) — các series này bỏ hẳn mục quiz để dành không gian cho nội dung học thuật sâu và dài hơn (chốt 2026-07-20). Mọi dòng rubric khác trong bảng vẫn áp dụng đầy đủ, không được nới lỏng thêm.

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

| Từ series                                          | Liên kết tới                                     | Vì khái niệm chung                                                      |
| -------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| WebGPU · Compute Shader                            | WASM · Đa luồng; DSA · Pathfinding               | Song song hoá / GPGPU                                                   |
| WASM · SIMD/Threading                              | Canvas · Pixel; WebGL · Performance              | Tối ưu pixel/vector                                                     |
| Toy JS Engine                                      | JS · Engine & Execution; JS · Scope              | Call stack, closure, AST                                                |
| DSA · Hash/B-Tree                                  | SQL · Index & Query Plan; C · Data Structures    | B-Tree, hashing                                                         |
| Web Audio · FFT                                    | Canvas · Data Visualization; WebGPU · Particles  | Vẽ phổ, reactive                                                        |
| CSS · Transform 3D                                 | WebGL · Coordinate & Math                        | Ma trận biến đổi                                                        |
| Git · Object Model                                 | C · Pointers; DSA · Huffman                      | DAG, content-address, nén                                               |
| Điện tử · Logic/MCU                                | VLSI · RTL/FPGA; C · Pointers                    | Cổng logic mức vật lý vs RTL, memory-mapped I/O                         |
| VLSI · VeriLite engine                             | DSA · Graph                                      | Event scheduler, critical path                                          |
| AI · Tensor engine                                 | WebGPU · Compute Shader; WASM · SIMD             | Matmul, vectorization, GPU                                              |
| AI · Backprop/autograd                             | DSA · Graph (topo sort); Toy JS Engine · AST     | Computation graph, duyệt đồ thị                                         |
| AI · MNIST/CNN                                     | Canvas · Pixel & ImageData                       | Đọc/vẽ pixel, tiền xử lý ảnh                                            |
| AI · Embedding/PCA                                 | DSA · Độ phức tạp; SQL · FTS5 (BM25)             | Vector hoá, đo tương đồng, tìm kiếm ngữ nghĩa                           |
| AI Hệ Thống · Data Pipeline (Series 18)            | AI · Từ Neuron Đến LLM (Series 12)               | Model training thật vs mô phỏng khái niệm                               |
| AI Hệ Thống · Memory/Tool-calling (Series 18)      | Kỹ Sư AI Thực Chiến · RAG/Agents (Series 16)     | Vector recall rút gọn vs embedding thật, ReAct đơn agent vs multi-agent |
| AI Hệ Thống · Blackboard/Orchestration (Series 18) | VLSI · Event scheduler; DSA · Graph              | Shared state, điều phối nhiều tiến trình song song                      |
| AI Hệ Thống · Huấn luyện phân tán (Series 18)      | WebGPU · Compute Shader; WASM · Đa luồng         | Song song hoá, đồng bộ giữa các worker                                  |
| Vector DB · Độ đo khoảng cách (Series 19)          | AI · Embedding (Series 12)                       | Trực quan hoá biểu diễn toán học của embeddings                         |
| Vector DB · Chỉ mục IVF/HNSW (Series 19)           | DSA · Đồ thị/Phân cụm; SQL · Index (Series 3, 7) | Cấu trúc dữ liệu chỉ mục, Voronoi, và so khớp tối ưu                    |
| Vector DB · RAG Capstone (Series 19)               | Kỹ Sư AI Thực Chiến · RAG (Series 16)            | Tích hợp cơ sở dữ liệu vector vào ứng dụng LLM thực tế                  |

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
