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
| Series 12                        | Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM     | 13/19          | 19       | 68%         |

> **2026-07-06:** Đã gỡ phần thiết kế chi tiết (tech stack, đề cương, syllabus H2) của các
> series **100% hoàn thành** (2 WebGPU, 3 DSA, 6 CSS, 7 SQL, 8 Web Audio, 9 Git, 10 Điện Tử) khỏi file
> này để giảm context — nội dung đã publish rồi thì trang hub/bài viết thật (`blog/<series>/`)
> mới là nguồn chính xác, không phải bản thiết kế. Bản đầy đủ vẫn còn nguyên trong lịch sử
> git (`git log -- plan.md`, commit trước 2026-07-06) nếu cần tham chiếu lại.
>
> **2026-07-09:** Đã gỡ tương tự phần thiết kế chi tiết của **Series 11 (VLSI)** sau khi hoàn thành
> 14/14 (100%) — bản đầy đủ vẫn còn trong lịch sử git trước commit này nếu cần tham chiếu lại.

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

## 🧠 Series 12: Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM (AI from Zero to Master)

> Lộ trình "zero → master" theo trục TỰ XÂY, không gọi API: hồi quy tuyến tính → gradient descent → tensor engine + autograd tự viết → MLP/CNN → Transformer → GPT-mini tiếng Việt train ngay trong browser. Nội dung bài viết **chỉ tiếng Việt** (quy tắc series mới). Mỗi khái niệm kèm snippet **"đối chiếu PyTorch tương đương"** (khối code phụ, đánh dấu rõ "chạy ngoài browser") để nối với công cụ công nghiệp — người học xong series đọc được source micrograd/nanoGPT.

### 0. Danh tính series (đã chốt 2026-07-09)

| Trường       | Giá trị                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tên series   | Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM (EN metadata: AI from Zero to Master: Neural Networks to LLMs)                                                       |
| Thư mục      | `blog/ai/`                                                                                                                                               |
| File hub     | `ai-programming-series.html`                                                                                                                             |
| Slug bài học | `ai-<topic>.html` (vd `ai-gradient-descent.html`)                                                                                                        |
| Tag class    | `--ai` (thêm `.blog-card__tag--ai`, `.article-hero__tag--ai`, `.article-hero--ai` vào `blog.css`)                                                        |
| Màu accent   | `#ef4444` (đỏ red-500 — chưa series nào dùng; gần nhất là canvas rose `#e11d48`, đã đối chiếu phân biệt được)                                            |
| Ngôn ngữ dạy | **Vanilla JavaScript** — mọi model tự xây, train và chạy 100% trong browser; snippet PyTorch đối chiếu ở mỗi bài                                         |
| Prism        | `js` sẵn có; ⚠️ **`python` chưa có trong `blog/prism.js`, phải bổ sung grammar local** (tiền lệ: Series 11 bổ sung `verilog`); KaTeX local cho công thức |

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Engine dùng chung toàn series: "NeuroJS"** (`blog/ai/ai-neuro.js`) — thư viện mini vanilla JS viết MỘT lần, các bài sau import (tiền lệ VeriLite của Series 11): tensor (broadcasting, matmul), autograd (computation graph, backward), layer (Linear/Conv2D/Embedding/LayerNorm/Attention), optimizer (SGD/Momentum/Adam), loss (MSE/cross-entropy). Xây DẦN theo bài: Bài 5 tạo tensor, Bài 7 thêm autograd, Bài 9 thêm optimizer, Bài 11 thêm conv, Bài 14 thêm attention — mỗi lần mở rộng PHẢI kèm self-test Node (`node --input-type=module -e "..."`) đối chiếu số liệu với công thức giải tích, không đoán bằng mắt (bài học D#10/#14-17 của check-lesson.md).
- **Dữ liệu vendored tĩnh** (không fetch ngoài): subset MNIST ~2.000 mẫu nén base64/binary (~vài trăm KB, tạo 1 lần bằng script Node, commit sẵn), dataset 2D sinh bằng code (XOR, vòng tròn, xoắn ốc), corpus tiếng Việt nhỏ public-domain cho GPT-mini (vd trích Truyện Kiều).
- **Hiển thị:** Canvas 2D (loss landscape, decision boundary, feature map, loss curve), SVG (computation graph, sơ đồ kiến trúc mạng, attention heatmap), KaTeX local cho mọi công thức (mỗi công thức 1 câu giải nghĩa tiếng Việt; trong `\text{}` chỉ ASCII).
- **Lưu ý hiệu năng:** train trong browser giới hạn ở model tí hon (MLP vài nghìn tham số, GPT-mini ~50-200k tham số) — mỗi demo train phải có nút ⏸ dừng + giới hạn epoch, không được khoá main thread quá ~50ms/khung (chia nhỏ theo `requestAnimationFrame`).

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Neural Playground — xem mạng neural uốn không gian"** (`ai-neural-playground.html`, nhúng lại cấu hình thu gọn ở Bài 6)
- **Mô tả giao diện (layout 3 khung):**
  - **Trái — Dữ liệu & kiến trúc:** chọn dataset 2D (XOR / vòng tròn / xoắn ốc / gauss), thêm bớt hidden layer và neuron từng layer, chọn activation (ReLU/tanh/sigmoid), learning rate, ▶ Train / ⏸ Dừng / ⏹ Reset.
  - **Giữa — Decision boundary:** canvas tô màu vùng quyết định của mạng, cập nhật LIVE theo từng bước train; điểm dữ liệu vẽ đè lên.
  - **Phải — Loss curve + trọng số:** đồ thị loss theo epoch; độ dày/màu cạnh nối neuron thể hiện trọng số đang đổi.
- **Insight cốt lõi:** mạng neural không phải hộp đen ma thuật — nó là chuỗi phép uốn/gập không gian đầu vào cho tới khi 2 lớp điểm tách được bằng 1 đường thẳng. Người học NHÌN THẤY boundary cong dần theo từng epoch, thấy mạng nông thất bại với xoắn ốc còn mạng sâu thì không — trực giác mà không cuốn sách tĩnh nào truyền được.
- ⚠️ **Hạng mục xây nặng nhất series** (ngang RTL Playground của Series 11) — phụ thuộc NeuroJS đủ tensor + autograd + optimizer, tức chỉ dựng được sau Bài 7; Bài 6 dùng bản "chưa autograd" (backward viết tay cho MLP 2 layer) rồi Bài 7 thay ruột.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus — 19 bài, 4 chặng)

**Chặng 1 — Nền tảng học máy (Bài 1–5):**

| Bài | Tên bài học                                   | Nội dung chuyên sâu                                                                                                     | Dự án/Demo đi kèm                                                              |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | **Học máy là gì? Hồi quy tuyến tính từ số 0** | Quy tắc viết tay vs học từ dữ liệu; bộ ba model–loss–data; MSE; nghiệm giải tích vs phương pháp lặp.                    | Kéo thả điểm dữ liệu trên canvas, đường thẳng tự fit, loss hiện live.          |
| 2   | **Gradient Descent & đạo hàm**                | Đạo hàm/chain rule trực giác hình học; learning rate; hội tụ/phân kỳ/zigzag; batch vs mini-batch vs SGD.                | Loss landscape 2D/3D tương tác — kéo learning rate xem "hòn bi" lăn hoặc văng. |
| 3   | **Phân loại & hồi quy logistic**              | Sigmoid, cross-entropy (vì sao không dùng MSE cho phân loại), decision boundary; confusion matrix, precision/recall/F1. | Bộ phân loại 2D — kéo điểm dữ liệu xem boundary và metrics đổi tức thì.        |
| 4   | **Học không giám sát: K-means & PCA**         | 3 nhánh học máy; k-means từng bước và bẫy khởi tạo; phương sai & phép chiếu, power iteration ở mức trực giác.           | K-means animation từng vòng lặp + PCA chiếu dữ liệu 3D→2D tương tác.           |
| 5   | **Tensor engine mini**                        | Xây tensor JS: shape/stride, broadcasting, matmul; vì sao vectorization nhanh (cache, không boxing); khởi đầu NeuroJS.  | Benchmark loop-thuần vs vectorized ngay trên trang (cross-link Series WebGPU). |

**Chặng 2 — Neural network cốt lõi (Bài 6–10):**

| Bài | Tên bài học                         | Nội dung chuyên sâu                                                                                             | Dự án/Demo đi kèm                                                          |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 6   | **Neuron & mạng MLP**               | Perceptron → MLP; activation (sigmoid/tanh/ReLU) và vì sao cần phi tuyến; trực giác universal approximation.    | **Neural Playground** (visualizer cốt lõi) — cấu hình đầy đủ.              |
| 7   | **Backpropagation & autograd**      | Chain rule trên computation graph; xây autograd engine kiểu micrograd; gradient checking bằng sai phân hữu hạn. | Computation graph SVG — bấm backward xem gradient chảy ngược từng nút.     |
| 8   | **Huấn luyện thực tế: Overfitting** | Train/val/test; bias–variance; L2, dropout, early stopping, data augmentation concept.                          | Kéo slider độ phức tạp model xem boundary overfit "ôm" từng điểm nhiễu.    |
| 9   | **Tối ưu hoá nâng cao**             | Momentum, RMSProp, Adam (viết đủ công thức); LR schedule/warmup; khởi tạo Xavier/He; batch norm concept.        | Đua 4 optimizer trên cùng loss landscape — 4 vệt màu xuất phát cùng điểm.  |
| 10  | **Dự án 1: Nhận dạng chữ số MNIST** | Data pipeline (chuẩn hoá, shuffle, mini-batch), vòng lặp train/eval, ma trận nhầm lẫn trên tập test thật.       | Vẽ chữ số bằng chuột → mạng TỰ TRAIN trong browser đoán live kèm xác suất. |

**Chặng 3 — Kiến trúc chuyên biệt (Bài 11–15):**

| Bài | Tên bài học                   | Nội dung chuyên sâu                                                                                                            | Dự án/Demo đi kèm                                                               |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 11  | **CNN — mạng tích chập**      | Kernel/stride/padding/pooling; chia sẻ trọng số & bất biến tịnh tiến; feature map theo chiều sâu; đếm tham số CNN vs MLP.      | Kéo kernel trượt trên ảnh xem feature map; so tham số CNN vs MLP cùng bài toán. |
| 12  | **Embedding & word2vec**      | Biểu diễn phân tán vs one-hot; skip-gram/negative sampling ở mức cơ chế; cosine similarity; vua − đàn ông + đàn bà = nữ hoàng. | Không gian embedding 2D tương tác — gõ từ, xem hàng xóm gần nhất.               |
| 13  | **Chuỗi: RNN → Attention**    | RNN unroll theo thời gian; vanishing gradient (nối Bài 7); LSTM cổng ở mức concept; attention là lời giải truy cập trực tiếp.  | Heatmap attention trên câu thật — rê chuột từng từ xem nó "nhìn" từ nào.        |
| 14  | **Transformer**               | Self-attention Q/K/V từng phép nhân ma trận; multi-head; positional encoding; residual + layernorm; đếm tham số 1 block.       | Transformer block chạy từng bước trên chuỗi ngắn — xem ma trận attention thật.  |
| 15  | **Sinh ảnh: GAN & Diffusion** | Minimax game G vs D, mode collapse; diffusion: quá trình nhiễu tiến/lùi, denoise từng bước; vì sao diffusion soán ngôi GAN.    | Diffusion trên phân bố điểm 2D — xem hình dạng "mọc" ra từ nhiễu thuần.         |

**Chặng 4 — LLM & master (Bài 16–19):**

| Bài | Tên bài học                                     | Nội dung chuyên sâu                                                                                                         | Dự án/Demo đi kèm                                                            |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 16  | **Tokenizer & pretraining LLM**                 | BPE tự xây từng bước merge; next-token prediction = cross-entropy trên vocab; context window; scaling law ở mức khái niệm.  | BPE tokenizer live — gõ tiếng Việt xem token tách, so vocab 100 vs 1.000.    |
| 17  | **Học tăng cường: Q-learning**                  | Agent/environment/reward; phương trình Bellman; bảng Q; exploration vs exploitation (ε-greedy); nền móng cho RLHF.          | Gridworld — agent tự học đường đi tối ưu, xem bảng Q cập nhật live.          |
| 18  | **Sinh văn bản, Sampling & Alignment**          | Temperature/top-k/top-p từ phân bố xác suất thật; greedy vs beam; RLHF từ cơ chế (nối Bài 17); prompt nhìn từ xác suất.     | Chỉnh temperature/top-p xem phân bố token và văn bản sinh ra đổi tức thì.    |
| 19  | **Capstone: GPT-mini tiếng Việt trong browser** | Ghép tokenizer + Transformer + sampling; train corpus nhỏ NGAY TRÊN TRANG; giới hạn thật của model tí hon; bản đồ học tiếp. | GPT tí hon (~100k tham số) train live trên trích đoạn Truyện Kiều, sinh chữ. |

**Kiểm tra phụ thuộc (dependency chain):** 1→2 (loss từ Bài 1) → 3 (GD từ 2) → 4 (chỉ cần khoảng cách Euclid, độc lập GD) → 5 → 6 (dùng tensor) → 7 (autograd thay backward tay của 6) → 8, 9 (dùng vòng train của 7) → 10 (tổng hợp 5–9) → 11 (conv trên NeuroJS) → 12 (train embedding bằng 7) → 13 (cần 7 vanishing gradient, 12 embedding) → 14 (cần 12, 13) → 15 (cần 6–9, độc lập 12–14) → 16 (cần 14) → 17 (độc lập, chỉ cần 2) → 18 (cần 16 + 17) → 19 (capstone: 14, 16, 18). Không có tham chiếu xuôi nào ngoài kế hoạch.

### 4. Tiêu chuẩn chất lượng & liên kết chéo

Mọi bài tuân thủ rubric PHẦN IV (quality contract) + `check-lesson.md`, cộng đặc thù:

- **Snippet "đối chiếu PyTorch"** ở mỗi bài có code train/model: khối `.code-window` ngôn ngữ `python`, ghi rõ "chạy ngoài browser — cài PyTorch theo pytorch.org"; KHÔNG phải code trang trí, phải là bản 1-1 với code JS của bài.
- **Số liệu phải kiểm chứng bằng self-test Node trước khi viết prose** (gradient checking, loss sau N epoch với seed cố định...) — model train có yếu tố ngẫu nhiên thì demo phải cố định seed để tái lập được.
- **Scaffold toán "cụ thể trước, tổng quát sau"** (quy tắc §5 quality contract, series này nặng toán nhất site): mỗi công thức tổng quát phải có 1 phiên bản TÍ HON giải tay trước — GD trên 1 tham số trước dạng vector (Bài 2), backward trên graph 3 nút tính tay trước autograd tổng quát (Bài 7), attention trên ma trận 3×3 trước công thức Q/K/V (Bài 14). Không mở màn bằng ma trận.
- **Demo train phải giải thích "trạng thái nhàm chán"** ngay trên UI: loss đứng im/NaN kèm gợi ý nguyên nhân (LR quá lớn — nối Bài 2), model đoán sai chữ người dùng vẽ (domain shift — Bài 10), GPT-mini sinh chữ vô nghĩa ở scale nhỏ (Bài 19) — mọi trạng thái "trông như hỏng" đều có chú thích đó là hành vi đúng.
- **Cross-link** (đã nối vào bản đồ chung PHẦN IV §4): Bài 5 ↔ WebGPU (matmul GPU) & WASM (SIMD); Bài 7 ↔ DSA (topo sort) & Toy JS Engine (duyệt cây); Bài 10–11 ↔ Canvas (ImageData); Bài 12 ↔ SQL FTS5 (tìm kiếm ngữ nghĩa vs từ khoá); Bài 19 ↔ Toy JS Engine (triết lý "tự xây để hiểu").
- **Glossary hub (EN–VI)** tối thiểu: model, loss, gradient, learning rate, epoch, batch, overfitting, regularization, activation, backpropagation, embedding, attention, transformer, token, temperature, reward, policy, alignment.
- **`js-playground` khuyến khích** cho demo thuần logic không cần vòng train (tokenizer BPE Bài 16, sampling Bài 18) — người đọc sửa code chạy ngay; demo có vòng train dùng nút ▶/⏸/⏹ + seed cố định thay vì playground tự do.

**Điều kiện chặn bổ sung cho Series 12** (cộng với `check-lesson.md`):

1. Mỗi công thức KaTeX có đúng 1 câu giải nghĩa mọi ký hiệu; trong `\text{}` chỉ ASCII.
2. Mọi mở rộng NeuroJS (`ai-neuro.js`) kèm self-test Node chạy sạch TRƯỚC khi bài dùng nó được viết; gradient mọi op mới phải qua gradient checking (Bài 7 §7.4).
3. Demo train không khoá main thread quá ~50ms/khung; luôn có nút dừng; seed cố định.
4. Snippet PyTorch/sklearn là bản 1-1 với JS của bài, không phải code sưu tầm.

### 5. Checklist thi công & tích hợp (Implementation & Integration)

> Bám khung chung PHẦN II + `check-lesson.md`. Callout/`.article-refs`/glossary/KaTeX/giscus/`.code-tabs` **đã có sẵn** từ 11 series trước — tái dùng, không tạo mới. Dưới đây là phần ĐẶC THÙ Series 12 + thứ tự thi công. Vẫn theo nhịp "một việc nhỏ mỗi lượt, checkpoint, hỏi duyệt"; chrome (header/footer) copy nguyên khối từ bài mới nhất cùng series, không gõ tay.

**Hạ tầng riêng (làm MỘT lần, trước bài đầu):**

- [x] **Prism `python`**: bổ sung grammar python local vào `blog/prism.js` (tiền lệ `verilog` Series 11); test highlight 1 snippet PyTorch mẫu.
- [x] **Tag & accent**: thêm `.blog-card__tag--ai`, `.article-hero__tag--ai`, `.article-hero--ai` (accent `#ef4444`) vào `blog/blog.css`.
- [x] **Dữ liệu vendored**: `blog/ai/mnist-subset.bin` (2.000 mẫu cân bằng 200/chữ số, format MNS1, seed mulberry32(42), script `make-mnist-subset.js`) + `blog/ai/corpus-kieu.txt` (toàn văn 3254 câu, nguồn Wikisource public domain, script `make-corpus-kieu.js` tái tạo byte-giống-hệt); commit sẵn, không fetch ngoài.

**Engine dùng chung (xây DẦN theo bài — khác VeriLite làm 1 lần):**

- [x] `blog/ai/ai-neuro.js` khởi sinh ở Bài 5 (tensor: Tensor/shape/stride/transpose/contiguous/reshape, broadcasting, matmul — 22-check self-test); mở rộng ở Bài 7 (autograd: `.grad`/`._backward`/`._prev`, topo sort, backward cho add/mul/matmul/relu/sigmoid, gradient checking double-precision — 43-check self-test, 22 regression Bài 5 + 21 mới, mlp_xor.js Bài 6 regression-tested lại vẫn 22/22); mở rộng ở Bài 9 (optimizer: class SGD/Momentum/RMSProp/Adam, verify công thức tính tay + đua trên loss ravine — 56-check self-test, 43 regression Bài 5+7 + 13 mới); mở rộng ở Bài 10 (softmaxCrossEntropy gộp 1 op, gradient rút gọn (softmax-y)/N, gradient checking + train MLP MNIST thật — 61-check self-test, 56 regression Bài 5+7+9 + 5 mới); mở rộng ở Bài 11 (conv2d/maxPool2d/flatten, tính tay + gradient checking — 76-check self-test, 61 regression Bài 5+7+9+10 + 15 mới; CNN 2.346 tham số đạt val 90,0% vs MLP 101.770 tham số val 89,5%); mở rộng ở Bài 12 (embeddingLookup + sigmoidCrossEntropy, tính tay + gradient checking end-to-end skip-gram — 84-check self-test, 76 regression Bài 5+7+9+10+11 + 8 mới; skip-gram train trên Truyện Kiều verify "hoa"~"gió/trăng/cành"); mở rộng ở Bài 13 (tanh + softmax thuần, tính tay + gradient checking — 94-check self-test, 84 regression Bài 5+7+9+10+11+12 + 10 mới; verify RNN sập ~50% ở T=40/80 trong khi attention giữ 100%, gradient bùng nổ 11,9→75,45 triệu + clipping, attention "hoa" trên Truyện Kiều 100% accuracy) → còn 14 (multi-head attention đầy đủ). MỖI lần mở rộng: self-test Node + gradient checking chạy sạch trước, regression test các bài trước còn đúng (bài học VeriLite D#14–17).
- [ ] `blog/ai/ai-viz.js` (nếu cần) — helper vẽ chung: loss curve, decision boundary, heatmap; quyết định tách file hay inline khi làm Bài 6 (đừng trừu tượng hoá sớm).

**Visualizer cốt lõi (nặng nhất — sau Bài 7, trước khi viết Bài 6 phiên bản cuối):**

- [ ] `ai-neural-playground.html` — trang riêng: dataset 2D + kiến trúc tuỳ chỉnh + boundary live + loss curve (đặc tả §2). Bài 6 nhúng cấu hình thu gọn.

**Dedicated demo theo bài (inline trong trang bài, theo tiền lệ Series 11 — không tách file HTML riêng trừ playground):** Bài 2 loss landscape · Bài 4 k-means/PCA · Bài 7 computation graph SVG · Bài 9 đua optimizer · Bài 10 vẽ số MNIST · Bài 11 conv kernel · Bài 12 embedding 2D · Bài 13 attention heatmap · Bài 14 transformer từng bước · Bài 15 diffusion 2D · Bài 16 BPE live · Bài 17 gridworld Q-learning · Bài 18 sampling slider · Bài 19 GPT-mini hoàn chỉnh.

**Thứ tự thi công đề xuất:** hạ tầng (Prism python, tag CSS, dữ liệu) → hub (`ai-programming-series.html`, 19 entry khoá + glossary EN–VI §4) → Bài 1 → duyệt văn phong → Bài 2–5 (mỗi lượt 1 bài, Bài 5 khởi sinh NeuroJS + self-test) → Bài 6 + 7 → Neural Playground → Bài 8–19 tuần tự (mỗi bài kèm tích hợp toàn cục riêng: unlock hub + badge "Mới", link prev/next, sitemap, search-index, plan.md X/19).

**Tích hợp toàn cục (khi có bài đầu tiên):**

- [ ] `blog/index.html`: thêm `a.blog-card` tag `--ai`; **ROOT `index.html`**: thêm `a.learn-card` + cặp key i18n `learn.ai.title`/`learn.ai.desc` vào `i18n.js`; `grep -c` đối chiếu số learn-card = số blog-card series.
- [ ] `sitemap.xml` (hub 0.8, bài + playground 0.7) · `blog/search-index.json` (headingsVi không dấu) · `README.md`/`AGENTS.md` (cây thư mục, số series/bài).
- [ ] Mỗi file `.js` co-located tải về được ghi comment đầu file cách chạy self-test Node.

**Hạng mục nặng nhất (ước lượng):** 1) NeuroJS autograd + gradient checking (Bài 5+7 — nền của mọi thứ sau); 2) Neural Playground; 3) Bài 10 MNIST (data pipeline + train UI không khoá thread); 4) Bài 19 GPT-mini (ghép toàn bộ + train live). Bài 15 diffusion và Bài 14 transformer ở mức trung bình nhờ demo giới hạn trên dữ liệu tí hon.

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

## Series 12 — Trí Tuệ Nhân Tạo: Từ Neuron Đến LLM

> Đề cương H2 chi tiết — ĐỦ 19/19 bài ✅. Mỗi bài kết thúc bằng "Trắc nghiệm ôn tập"; mỗi bài có snippet PyTorch/sklearn đối chiếu đánh dấu "chạy ngoài browser".

- **Bài 1 — Học máy là gì? Hồi quy tuyến tính từ số 0** (`ai-linear-regression.html`): 1.1 Từ quy tắc viết tay đến học từ dữ liệu — lập trình truyền thống (người viết rule) vs ML (máy học ánh xạ từ ví dụ); vì sao rule không viết nổi cho nhận diện ảnh/ngôn ngữ; pitfall: dùng ML cho bài toán mà 3 dòng if-else giải được (bản đồ nhanh 3 nhánh học máy — chi tiết ở Bài 4, 17) · 1.2 Bộ ba model–loss–data: giả thuyết $\hat{y} = wx + b$, tham số học được, MSE — vì sao bình phương (phạt mạnh lỗi lớn, khả vi mọi nơi); pitfall: MSE nhạy outlier, 1 điểm dữ liệu nhập sai kéo lệch cả đường fit · 1.3 Nghiệm giải tích (least squares 1 biến): cho đạo hàm = 0, công thức đóng cho $w, b$; đánh đổi: đẹp nhưng không mở rộng được cho model phi tuyến/triệu tham số → cần phương pháp lặp (nếm trước Bài 2, callout "sẽ học ở Bài 2") · 1.4 Đánh giá model: $R^2$, dự đoán trên dữ liệu CHƯA THẤY vs dữ liệu train (nếm trước overfitting — Bài 8) · 1.5 Thực hành: kéo thả điểm dữ liệu trên canvas, đường fit + loss cập nhật live; snippet PyTorch (`nn.Linear` + `MSELoss`) đối chiếu 1-1. _Tiên quyết: đại số phổ thông; không cần kiến thức lập trình ngoài JS cơ bản._
- **Bài 2 — Gradient Descent & đạo hàm** (`ai-gradient-descent.html`): 2.1 Đạo hàm là "độ dốc tại một điểm" — định nghĩa hình học không epsilon-delta; gradient nhiều biến = vector chỉ hướng TĂNG nhanh nhất → đi ngược để giảm loss; vì sao chỉ cần hướng dốc, không cần giải phương trình · 2.2 Thuật toán GD: quy tắc cập nhật $w \leftarrow w - \eta \nabla L$ (giải nghĩa từng ký hiệu); learning rate quá nhỏ (bò), quá lớn (văng), zigzag; pitfall kinh điển: "loss tăng dần" gần như luôn là LR quá lớn, không phải code sai — cách chẩn đoán · 2.3 Batch vs mini-batch vs SGD: đánh đổi nhiễu gradient ↔ tốc độ ↔ bộ nhớ; vì sao nhiễu của mini-batch đôi khi là ĐIỀU TỐT (thoát điểm yên ngựa); khi nào dùng batch size nào · 2.4 Địa hình loss: local minimum, saddle point, plateau — vì sao trong không gian triệu chiều, saddle point phổ biến hơn và local minimum ít đáng sợ hơn trực giác 2D gợi ý · 2.5 Thực hành: loss landscape 2D/3D tương tác, kéo LR xem hội tụ/phân kỳ, chọn điểm xuất phát; PyTorch đối chiếu (`loss.backward()` + `optimizer.step()` — chưa giải thích autograd, hứa ở Bài 7). _Tiên quyết: Bài 1._
- **Bài 3 — Phân loại & hồi quy logistic** (`ai-logistic-classification.html`): 3.1 Từ hồi quy sang phân loại: vì sao fit đường thẳng rồi lấy ngưỡng 0,5 thất bại (outlier kéo ngưỡng trôi); sigmoid nén $(-\infty, +\infty)$ về $(0, 1)$ — đầu ra đọc được như xác suất · 3.2 Cross-entropy: công thức + giải nghĩa "phạt theo độ tự tin sai"; vì sao KHÔNG dùng MSE cho phân loại (gradient tiêu biến khi sigmoid bão hoà, mặt loss không lồi); pitfall: $\log(0)$ = NaN — epsilon/clipping trong thực tế · 3.3 Decision boundary tuyến tính là đường thẳng ở đâu trong công thức; đa lớp: softmax + argmax (nếm trước — dùng thật ở Bài 10 MNIST) · 3.4 Metrics: accuracy đánh lừa với dữ liệu lệch (99% âm tính → model "toàn đoán âm tính" đạt 99%); confusion matrix, precision/recall/F1, trade-off theo ngưỡng quyết định; pitfall: chọn accuracy cho bài toán tầm soát bệnh — recall mới là mạng sống · 3.5 Thực hành: bộ phân loại 2D tương tác, kéo điểm xem boundary + confusion matrix đổi live; PyTorch đối chiếu (`BCEWithLogitsLoss` — vì sao gộp sigmoid vào loss cho ổn định số học). _Tiên quyết: Bài 1–2._
- **Bài 4 — Học không giám sát: K-means & PCA** (`ai-kmeans-pca.html`): 4.1 Ba nhánh học máy nhìn từ DỮ LIỆU: có nhãn (Bài 1–3), không nhãn (bài này), reward thưa (Bài 17) — bảng so sánh khi nào gặp loại nào trong thực tế; why: phần lớn dữ liệu doanh nghiệp KHÔNG có nhãn · 4.2 K-means từng bước: vòng lặp assign–update, hàm mục tiêu inertia giảm đơn điệu → chắc chắn dừng (nhưng không chắc tối ưu toàn cục); pitfall: khởi tạo xấu cho nghiệm tệ — trực giác k-means++; chọn k bằng elbow method và giới hạn của nó · 4.3 K-means thất bại khi nào: cụm không hình cầu, mật độ/kích thước chênh lệch — cặp ❌/✅ trên hình thật; when: k-means là baseline nhanh, không phải đáp án vạn năng · 4.4 PCA: hướng phương sai lớn nhất = hướng giữ nhiều thông tin nhất; phép chiếu và mất mát; tìm eigenvector bằng power iteration ở mức trực giác (nhân lặp ma trận — không đòi đại số tuyến tính hình thức, nếm trước tensor Bài 5); pitfall: quên chuẩn hoá đơn vị trước PCA — cột "lương" (hàng triệu) nuốt cột "tuổi" (hàng chục) · 4.5 Thực hành: k-means animation từng vòng lặp (bấm Step), PCA chiếu dữ liệu 3D→2D kéo xoay được; đối chiếu sklearn (`KMeans`, `PCA` — ghi chú: hệ sinh thái Python cho ML cổ điển là sklearn, PyTorch cho deep learning từ Bài 6). _Tiên quyết: Bài 1 (khoảng cách Euclid); độc lập với Bài 2–3._
- **Bài 5 — Tensor engine mini** (`ai-tensor-engine.html`): 5.1 Vì sao mọi thứ là tensor: vô hướng → vector → ma trận → tensor bậc cao; shape là "ngôn ngữ chung" của toàn bộ ML — model chỉ là chuỗi phép toán trên tensor; why: hiểu shape = debug được 80% lỗi deep learning · 5.2 Xây tensor JS trên `Float32Array` phẳng + shape/stride: indexing row-major, vì sao stride cho phép transpose/view KHÔNG copy dữ liệu; pitfall: sau transpose dữ liệu không còn liền mạch (non-contiguous) — phép nào cần materialize lại · 5.3 Broadcasting: quy tắc căn phải, chiều 1 tự nhân bản (cộng bias vào cả batch chỉ 1 dòng); pitfall nguy hiểm nhất chương: broadcast ÂM THẦM che lỗi shape — cộng (3,1) với (1,3) ra (3,3) không hề báo lỗi, loss vẫn giảm nhưng model học sai thứ · 5.4 Matmul: công thức, $O(n^3)$; vì sao bản vectorized nhanh hơn loop thuần hàng chục lần trên cùng CPU (cache locality, JIT, không boxing) — benchmark sống ngay trên trang; cross-link Series WebGPU (matmul trên compute shader — nhanh hơn nữa) · 5.5 Khởi sinh NeuroJS (`ai-neuro.js`): API `tensor/add/mul/matmul/transpose`; **self-test Node bắt buộc** đối chiếu từng phép với kết quả tính tay + numpy; đối chiếu PyTorch (`torch.tensor`, toán tử `@`, quy tắc broadcasting giống hệt). _Tiên quyết: Bài 1; JS căn bản (mảng, vòng lặp)._
- **Bài 6 — Neuron & mạng MLP** (`ai-mlp-neural-network.html`): 6.1 Từ hồi quy logistic đến neuron: 1 neuron = linear + activation = đúng cái đã học ở Bài 3; 1 neuron chỉ vẽ được 1 boundary thẳng — why: xếp chồng để uốn cong · 6.2 Vì sao BẮT BUỘC phi tuyến: chồng 2 layer tuyến tính vẫn là tuyến tính (chứng minh 1 dòng: $W_2(W_1 x) = (W_2 W_1) x$); so sánh sigmoid/tanh/ReLU (bảng đạo hàm + vùng bão hoà); pitfall: dying ReLU — neuron "chết" khi rơi hẳn về miền âm · 6.3 Kiến trúc MLP: width vs depth, forward pass thuần ma trận (dùng NeuroJS Bài 5), đếm tham số từng layer; universal approximation ở mức trực giác — và cạm bẫy đọc nhầm nó: "tồn tại mạng xấp xỉ được" ≠ "gradient descent tìm ra được" · 6.4 XOR — bài toán làm đóng băng cả ngành: perceptron 1 lớp bất lực (Minsky 1969), 1 hidden layer giải gọn; mini-story AI winter làm khung lịch sử · 6.5 Thực hành **Neural Playground** (visualizer cốt lõi, trang riêng `ai-neural-playground.html` + nhúng cấu hình gọn trong bài): dataset xoắn ốc đòi hỏi depth, xem boundary uốn theo từng epoch; backward tạm viết TAY cho MLP 2 layer (callout: "Bài 7 thay bằng autograd tổng quát — đây là lần cuối phải tự tính đạo hàm"); đối chiếu PyTorch `nn.Sequential(nn.Linear, nn.ReLU, ...)`. _Tiên quyết: Bài 2, 3, 5._
- **Bài 7 — Backpropagation & autograd** (`ai-backprop-autograd.html`): 7.1 Bài toán: cần $\partial L / \partial w$ cho TỪNG tham số trong hàm hợp sâu hàng nghìn bước; đạo hàm số (sai phân hữu hạn) tốn 1 lần forward MỖI tham số → chết với triệu tham số; why backprop = chain rule được tổ chức để đi 1 lượt ngược là xong tất cả · 7.2 Computation graph: mỗi phép toán 1 nút, forward LƯU giá trị trung gian, backward đi ngược thứ tự topo; công thức lõi: gradient tại nút = local gradient × upstream gradient (giải nghĩa bằng ví dụ 3 nút tính tay) · 7.3 Xây autograd engine kiểu micrograd vào NeuroJS: mỗi tensor mang `.grad` + `._backward` closure + topo sort; cài `+`, `*`, `matmul`, `ReLU`, `sigmoid`; pitfall số 1 của mọi người mới: gradient CỘNG DỒN qua các lần backward — vì sao nó PHẢI cộng dồn (1 nút được dùng ở 2 nhánh) và vì sao do đó phải `zero_grad` mỗi vòng lặp · 7.4 Gradient checking: đối chiếu autograd với sai phân hữu hạn — chính là self-test Node của bài; pitfall: epsilon quá nhỏ thì lỗi làm tròn float nuốt tín hiệu, quá lớn thì xấp xỉ sai — vùng vàng $10^{-4}$–$10^{-6}$ · 7.5 Nếm trước vanishing/exploding: tích chuỗi đạo hàm < 1 tiêu biến, > 1 bùng nổ (chi tiết + lời giải ở Bài 13); demo: computation graph SVG — bấm Backward xem gradient chảy ngược tô sáng từng nút kèm giá trị; đối chiếu PyTorch (`requires_grad`, `loss.backward()`, `optimizer.zero_grad()` — giờ hiểu tại sao 3 dòng thần chú này tồn tại). _Tiên quyết: Bài 2 (chain rule), 5, 6._
- **Bài 8 — Huấn luyện thực tế: Overfitting & Regularization** (`ai-overfitting-regularization.html`): 8.1 Học thuộc lòng vs học khái quát: chia train/val/test — vai trò TỪNG tập; pitfall chết người nhất nghề ML: tinh chỉnh hyperparameter theo test set = rò rỉ dữ liệu (data leakage), điểm số đẹp trên giấy sập ngoài đời · 8.2 Bias–variance: underfit (model quá đơn giản) vs overfit (quá phức tạp) chẩn đoán qua CẶP loss curve train/val — 4 hình dạng kinh điển và cách đọc từng hình · 8.3 Regularization L2 / weight decay: phạt trọng số lớn trong loss, công thức + trực giác "ép boundary mượt"; vì sao L2 gần như mặc định bật trong mọi model thật · 8.4 Dropout: tắt neuron ngẫu nhiên khi train = ensemble ngầm của $2^n$ mạng con; pitfall: quên tắt dropout lúc inference (hoặc quên scale) — model "say rượu" khi phục vụ thật; early stopping — regularization miễn phí chỉ bằng cách... dừng sớm · 8.5 Thực hành: slider capacity + noise xem boundary từ mượt sang "ôm từng điểm nhiễu", cặp loss curve tách nhau live đúng lúc overfit bắt đầu; đối chiếu PyTorch (`nn.Dropout`, `weight_decay=`, và cặp `model.train()`/`model.eval()` — pitfall quên eval mode lặp lại đúng bẫy dropout ở trên). _Tiên quyết: Bài 6–7._
- **Bài 9 — Tối ưu hoá nâng cao** (`ai-optimizers.html`): 9.1 Vì sao SGD thuần chưa đủ: khe hẹp (ravine) gây zigzag lãng phí; 1 learning rate chung cho MỌI tham số là giả định sai — tham số cập nhật thưa cần bước lớn, tham số dày cần bước nhỏ · 9.2 Momentum: tích luỹ vận tốc $v \leftarrow \beta v + \nabla L$, trực giác hòn bi có đà lăn xuyên qua gồ ghề nhỏ; vì sao β=0,9 gần như phổ quát; Nesterov ở mức ghi chú · 9.3 RMSProp & Adam: chia learning rate theo căn trung bình bình phương gradient TỪNG THAM SỐ; Adam = momentum + RMSProp + bias correction (đủ 3 dòng công thức, giải nghĩa từng dòng); pitfall: Adam không phải luôn thắng — SGD+momentum thường khái quát tốt hơn ở vision, và L2 trong Adam không còn là weight decay đúng nghĩa (AdamW sinh ra để sửa) · 9.4 Khởi tạo trọng số: init toàn 0 giết mạng (mọi neuron đối xứng, học y hệt nhau — chứng minh ngắn); Xavier/He giữ phương sai tín hiệu qua từng layer theo fan-in; pitfall: init quá lớn/nhỏ → explode/vanish ngay từ FORWARD, chưa cần tới backward · 9.5 LR schedule & warmup (vì sao LLM cần warmup — nếm trước Bài 16); batch norm ở mức concept: chuẩn hoá activation giữa layer giúp train sâu ổn định (không cài đầy đủ — ghi rõ giới hạn) · 9.6 Thực hành: đua 4 optimizer (SGD/Momentum/RMSProp/Adam) cùng xuất phát trên cùng landscape — 4 vệt màu, bảng số vòng tới đích; cài Momentum + Adam vào NeuroJS kèm self-test; đối chiếu PyTorch (`optim.SGD(momentum=)`, `optim.AdamW`). _Tiên quyết: Bài 2, 7, 8._
- **Bài 10 — Dự án 1: Nhận dạng chữ số MNIST** (`ai-mnist-project.html`): 10.1 Dữ liệu thật khác dữ liệu đồ chơi: subset MNIST 2.000 mẫu vendored (mô tả cách file được tạo + nén); NHÌN dữ liệu trước khi train — lưới ảnh mẫu, phân bố nhãn; pitfall: nhảy vào train mà chưa nhìn dữ liệu, không phát hiện nhãn lệch/ảnh hỏng · 10.2 Pipeline: chuẩn hoá pixel về [0,1], flatten 28×28 → 784, shuffle, mini-batch; vì sao PHẢI shuffle (dữ liệu xếp theo nhãn tuần tự phá nát SGD — demo tắt shuffle xem loss răng cưa) · 10.3 Train MLP 784→128→10 với softmax + cross-entropy trên NeuroJS: vòng lặp train/eval chuẩn, theo dõi accuracy validation theo epoch, **seed cố định để tái lập đúng từng con số trong bài** · 10.4 Đánh giá sâu hơn accuracy: confusion matrix 10×10 — cặp chữ số hay nhầm nhau (4↔9, 3↔5) và VÌ SAO nhìn ảnh sai hiểu ngay; pitfall: chỉ báo cáo accuracy tổng, giấu sạch chỗ model yếu · 10.5 Demo đinh: vẽ chữ số bằng chuột → model TỰ TRAIN trong browser đoán live kèm bar xác suất 10 lớp; pitfall thực chiến: nét chuột khác phân bố nét bút MNIST (domain shift) — vì sao model 95% accuracy vẫn đoán sai chữ BẠN vẽ, và cách giảm (căn giữa, làm dày nét như chuẩn hoá của MNIST gốc); đối chiếu PyTorch (`DataLoader` + vòng train đầy đủ — bản 1-1 với JS). _Tiên quyết: Bài 5–9 (tổng hợp cả chặng 2)._
- **Bài 11 — CNN: mạng tích chập** (`ai-cnn-convolution.html`): 11.1 Vì sao MLP đuối với ảnh: flatten PHÁ cấu trúc không gian 2D (pixel cạnh nhau thành xa lạ); tham số bùng nổ (ảnh 224×224 RGB → hơn 150 triệu tham số cho MỖI layer đầu); không bất biến tịnh tiến — số 7 dịch 3 pixel là "ảnh hoàn toàn mới" · 11.2 Phép tích chập: kernel trượt, stride/padding, công thức kích thước output (KaTeX + 1 câu giải nghĩa); kernel = bộ dò đặc trưng — demo kernel Sobel dò cạnh trên ảnh thật TRƯỚC khi nói tới học; pitfall: quên padding, ảnh teo dần qua từng layer · 11.3 Chia sẻ trọng số & bất biến tịnh tiến: cùng 1 kernel quét mọi vị trí → dò được đặc trưng ở bất cứ đâu, tham số giảm hàng nghìn lần — bảng đếm tham số CNN vs MLP cho cùng bài toán MNIST · 11.4 Pooling & xếp tầng kiến trúc: max pool giảm chiều giữ đặc trưng mạnh nhất; chuỗi conv→pool→conv→pool học đặc trưng phân cấp cạnh → góc → hình → chữ số; đọc feature map theo depth · 11.5 Thực hành: kéo kernel trượt trên ảnh xem feature map dựng live, chỉnh 9 ô kernel bằng tay; cài `Conv2D` vào NeuroJS (self-test đối chiếu tích chập tính tay 3×3); đối chiếu PyTorch (`nn.Conv2d`, `nn.MaxPool2d`). _Tiên quyết: Bài 5, 7, 10._
- **Bài 12 — Embedding & word2vec** (`ai-embeddings-word2vec.html`): 12.1 Máy không hiểu chữ: one-hot và 2 cái chết — chiều bằng cả vocab, và mọi cặp từ đều "cách đều nhau" (tích vô hướng = 0, không mang ngữ nghĩa nào); why embedding: vector dày, ngắn, HỌC ĐƯỢC · 12.2 Giả thuyết phân bố — "từ được hiểu qua bạn bè của nó": skip-gram đoán từ hàng xóm từ từ trung tâm; negative sampling ở mức cơ chế (vì sao không thể softmax cả vocab trăm nghìn từ mỗi bước) · 12.3 Không gian ngữ nghĩa: cosine similarity (công thức + giải nghĩa); phép toán vector kinh điển vua − đàn ông + đàn bà ≈ nữ hoàng — vì sao quan hệ ngữ nghĩa thành quan hệ TUYẾN TÍNH; pitfall: cosine cao ≠ đồng nghĩa — từ TRÁI nghĩa cũng đứng gần nhau (chung ngữ cảnh), embedding còn nuốt cả thiên kiến trong dữ liệu · 12.4 Embedding là 1 layer: bảng tra = ma trận $V \times d$, học bằng backprop như mọi tham số khác (nối Bài 7); không chỉ cho từ — user, sản phẩm, mọi thứ rời rạc (nền của recommendation system); là cửa ngõ vào Transformer (Bài 14) · 12.5 Thực hành: train skip-gram mini trên corpus tiếng Việt nhỏ ngay trong browser; không gian embedding chiếu 2D bằng PCA (dùng lại đúng Bài 4!) — gõ từ, xem hàng xóm gần nhất; đối chiếu PyTorch (`nn.Embedding`). _Tiên quyết: Bài 4 (PCA), 7._
- **Bài 13 — Chuỗi: RNN → Attention** (`ai-rnn-attention.html`): 13.1 Dữ liệu chuỗi khác gì: thứ tự MANG nghĩa ("chó cắn người" ≠ "người cắn chó"), độ dài biến thiên — MLP/CNN nhận input cố định nên bó tay; why: cần kiến trúc có "bộ nhớ" · 13.2 RNN: unroll theo thời gian, hidden state là bộ nhớ nén; CÙNG 1 bộ trọng số dùng lại mỗi bước — chia sẻ trọng số theo THỜI GIAN, đối xứng đẹp với CNN chia sẻ theo KHÔNG GIAN (Bài 11); backprop through time = backprop trên graph đã unroll (Bài 7 áp thẳng) · 13.3 Vanishing/exploding trên chuỗi dài: tích hàng trăm đạo hàm < 1 → RNN "quên" đầu câu (trả đúng món nợ nếm trước ở 7.5); gradient clipping cho exploding; LSTM/GRU ở mức concept cổng quên/nhớ — ghi rõ "không cài đầy đủ, chỉ concept" (honesty pattern) · 13.4 Attention — bước ngoặt: thay vì NÉN cả quá khứ vào 1 vector, cho phép nhìn thẳng MỌI vị trí với trọng số học được; công thức score cơ bản + giải nghĩa; 2 hệ quả lịch sử: không còn quên, và song song hoá được (mở đường Bài 14) · 13.5 Thực hành: heatmap attention trên câu tiếng Việt thật — rê chuột từng từ xem nó "chú ý" từ nào; demo đối chứng RNN hidden state bị nén dần vs attention truy cập trực tiếp; đối chiếu PyTorch (`nn.RNN`, `nn.LSTM` — ghi chú vì sao thời nay hiếm dùng). _Tiên quyết: Bài 7 (mục 7.5), 12._
- **Bài 14 — Transformer** (`ai-transformer.html`): 14.1 "Attention Is All You Need": bỏ hẳn recurrence — 2 lý do (train song song toàn chuỗi trên GPU, đường gradient ngắn không xuyên thời gian); bản đồ encoder/decoder/encoder-decoder — series tập trung DECODER-ONLY (GPT-style) vì đích là Bài 16–19 · 14.2 Self-attention Q/K/V từng phép nhân một: $QK^T$ (ai giống ai), scale $1/\sqrt{d_k}$ (pitfall: bỏ scale → softmax bão hoà, gradient chết — giải thích bằng phương sai tích vô hướng), softmax, nhân $V$; causal mask cho decoder — không được nhìn tương lai (tam giác −∞) · 14.3 Multi-head: nhiều "góc nhìn" song song trong các không gian con; concat + projection; đếm tham số đầy đủ của 1 block (bảng — người học tự đếm được tham số GPT-2 từ đây) · 14.4 Phần còn lại của block: positional encoding — attention vốn KHÔNG có khái niệm thứ tự, phải tiêm vị trí vào (pitfall: quên PE → model xem câu như túi từ); residual connection = đường cao tốc gradient (nối Bài 9 init); layer norm; FFN từng vị trí · 14.5 Thực hành: transformer block chạy TỪNG BƯỚC trên chuỗi ngắn — xem ma trận $QK^T$ thật, mask che, softmax, output mỗi giai đoạn; cài attention vào NeuroJS (self-test đối chiếu tính tay trên ma trận 3×3); đối chiếu PyTorch (`nn.MultiheadAttention` và vì sao thực tế người ta tự viết như nanoGPT). _Tiên quyết: Bài 12, 13._
- **Bài 15 — Sinh ảnh: GAN & Diffusion** (`ai-gan-diffusion.html`): 15.1 Bài toán sinh (generative): học PHÂN BỐ dữ liệu để lấy mẫu mới, khác hẳn học ánh xạ vào nhãn — bảng discriminative vs generative; why: đây là nửa còn lại của AI hiện đại (ảnh, nhạc, video) · 15.2 GAN — trò chơi minimax: Generator (làm giả) vs Discriminator (bắt giả), công thức trò chơi đối kháng + giải nghĩa; pitfall kép làm GAN nổi tiếng khó train: mode collapse (G phát hiện 1 mẫu qua mặt được D và in mãi nó) và mất cân bằng D quá mạnh/quá yếu · 15.3 Diffusion: quá trình TIẾN thêm nhiễu Gauss từng bước cho tới nhiễu thuần, quá trình NGƯỢC học denoise từng bước; vì sao train ổn định hơn GAN hẳn (loss hồi quy đơn giản, không đối kháng); giá phải trả: sinh chậm — hàng chục/trăm bước denoise · 15.4 Vì sao diffusion soán ngôi (chất lượng + đa dạng + ổn định) và GAN còn đất sống ở đâu (real-time, siêu phân giải); conditional generation & text-to-image ở mức khái niệm (Stable Diffusion) — cửa sổ nhìn ra hệ sinh thái, kèm link đọc tiếp · 15.5 Thực hành: diffusion trên PHÂN BỐ ĐIỂM 2D — bấm từng bước denoise xem hình xoắn ốc "mọc" ra từ đám nhiễu thuần (train denoiser MLP nhỏ bằng NeuroJS, seed cố định); animation minimax GAN 1D phụ hoạ; đối chiếu PyTorch (vòng train diffusion tối giản ~40 dòng). _Tiên quyết: Bài 6–9; độc lập với 12–14._
- **Bài 16 — Tokenizer & pretraining LLM** (`ai-tokenizer-llm-pretraining.html`): 16.1 Từ chữ tới số — 3 mức tách: ký tự (chuỗi quá dài), nguyên từ (vocab nổ + từ mới OOV), subword là điểm cân bằng; tiếng Việt có gì riêng (âm tiết, dấu thanh — cùng 1 chữ khác dấu ra token khác) · 16.2 BPE tự xây từng bước: đếm cặp kề phổ biến nhất → merge → lặp; trade-off vocab size (100 vs 1.000 vs 50.000) trên chính corpus demo; pitfall nổi tiếng: LLM đếm sai chữ "r" trong "strawberry" và yếu số học VÌ model nhìn TOKEN chứ không nhìn ký tự — lỗi nằm ở tokenizer, không phải "model ngu" · 16.3 Pretraining = next-token prediction: cross-entropy trên vocab (đúng công thức Bài 3, giờ vocab là lớp!); teacher forcing; perplexity đọc thế nào; vì sao "chỉ đoán từ tiếp theo" ép model phải hiểu (nén tốt = hiểu — ở mức trực giác, có dẫn nguồn tranh luận) · 16.4 Context window & scaling law: chi phí attention $O(n^2)$ theo độ dài (nối Bài 14); tam giác tham số–dữ liệu–compute, đường cong scaling và Chinchilla ở mức khái niệm; emergent abilities và tranh cãi quanh nó — trình bày cả 2 phía · 16.5 Thực hành: BPE tokenizer live — gõ tiếng Việt xem token tách theo từng mức vocab, bảng so số token; đối chiếu tiktoken/PyTorch (`tiktoken` đếm token GPT thật — vì sao cùng câu tiếng Việt tốn token gấp đôi tiếng Anh, hệ quả chi phí API). _Tiên quyết: Bài 3 (cross-entropy), 14._
- **Bài 17 — Học tăng cường: Q-learning** (`ai-q-learning.html`): 17.1 Nhánh thứ ba của học máy: không nhãn, không cụm — chỉ có REWARD thưa và đến trễ; vòng lặp agent–environment–state–action–reward; khác supervised ở chỗ nào (không ai bảo "đáng lẽ phải làm gì", chỉ chấm "làm thế được mấy điểm" — credit assignment problem); when: game, robot, và RLHF ở Bài 18 · 17.2 Phương trình Bellman: giá trị 1 hành động = reward tức thời + $\gamma \times$ giá trị tương lai tốt nhất; quy tắc cập nhật Q-learning đầy đủ + giải nghĩa từng ký hiệu ($\gamma$ discount — vì sao tương lai đáng giá ít hơn hiện tại; $\alpha$ chính là learning rate quen từ Bài 2) · 17.3 Bảng Q & vòng lặp học trên gridworld: tabular Q-learning; exploration vs exploitation — $\varepsilon$-greedy và decay; pitfall: $\varepsilon = 0$ ngay từ đầu → agent kẹt vĩnh viễn ở đường mòn ĐẦU TIÊN tìm được, không bao giờ biết có đường tốt hơn · 17.4 Giới hạn tabular → deep RL ở mức concept: state space nổ (cờ vây $10^{170}$) → thay bảng Q bằng mạng neural (DQN — nối Bài 6, ghi rõ "concept, không cài"); pitfall đắt giá nhất RL: reward hacking — agent tối ưu đúng cái được chấm chứ không phải cái ta MUỐN (ca kinh điển: thuyền đua CoastRunners quay vòng ăn điểm thay vì đua) · 17.5 Thực hành: gridworld có bẫy — agent tự học đường tối ưu, bảng Q hiện trên từng ô dạng mũi tên policy cập nhật live, slider $\varepsilon/\gamma/\alpha$; self-test Node: với seed cố định sau N episode, policy hội tụ đúng đường ngắn nhất; đối chiếu: pseudo-code chuẩn Sutton &amp; Barto (bài này thuần JS, không cần PyTorch). _Tiên quyết: Bài 2 (quy tắc cập nhật cùng họ GD); độc lập với Bài 12–16._
- **Bài 18 — Sinh văn bản, Sampling & Alignment** (`ai-sampling-alignment.html`): 18.1 Từ logits đến chữ: model chỉ cho ra PHÂN BỐ xác suất trên vocab (softmax — Bài 3/10), sinh văn bản = lấy mẫu rồi lặp; greedy decoding và pitfall degeneration — văn bản lặp vô hạn "tôi nghĩ rằng tôi nghĩ rằng..." (vì sao vòng lặp tự củng cố) · 18.2 Temperature: chia logits trước softmax — công thức + giải nghĩa; $T \to 0$ = greedy, $T$ cao = hỗn loạn; when: sinh code cần $T$ thấp, sáng tác cần $T$ cao — bảng cùng 1 prompt ở 4 mức nhiệt độ · 18.3 Top-k & top-p (nucleus): cắt đuôi phân bố — đuôi dài hàng chục nghìn token xác suất tí hon chính là nguồn "từ ngẫu nhiên vô nghĩa"; so 3 chiến lược trên CÙNG một phân bố vẽ ra; beam search và vì sao ít dùng cho sáng tác (an toàn nhưng nhàm) · 18.4 Alignment & RLHF: model pretrain chỉ biết "hoàn thành văn bản", chưa biết "làm trợ lý" — 3 tầng: SFT (instruction tuning) → reward model học từ so sánh cặp của người chấm → RL (PPO ở mức concept) tối ưu theo reward model — nối THẲNG Bài 17 (reward, policy, và reward hacking tái xuất dưới tên sycophancy: model học nịnh người chấm thay vì đúng) · 18.5 Prompt engineering nhìn từ xác suất: prompt = điều kiện hoá phân bố; few-shot là gì về cơ chế; giới hạn thật (không bù được kiến thức model không có). Demo: chỉnh temperature/top-k/top-p trên phân bố token THẬT (model bigram từ corpus + preview model Bài 19), biểu đồ phân bố bị cắt/nắn live + văn bản sinh đổi tức thì; đối chiếu PyTorch/HF (`generate(temperature=, top_p=)`). _Tiên quyết: Bài 16, 17._
- **Bài 19 — Capstone: GPT-mini tiếng Việt trong browser** (`ai-gpt-mini-capstone.html`): 19.1 Ghép tất cả lại: kiến trúc GPT-mini ~100k tham số — embedding (Bài 12) + positional encoding (Bài 14) + N transformer block (Bài 14) + head softmax (Bài 3/16); sơ đồ khối toàn hệ, bảng đếm tham số TỪNG phần và mỗi con số truy ngược về đúng bài đã học · 19.2 Dữ liệu: corpus trích đoạn Truyện Kiều (public domain, vendored) + BPE vocab nhỏ (Bài 16); chia train/val (Bài 8) — trên corpus tí hon, chứng kiến overfit đến NHANH cỡ nào và val loss quay đầu (điểm giáo dục có chủ đích: nhìn model "thuộc lòng" thơ) · 19.3 Train live trong browser: vòng lặp Bài 10 + Adam Bài 9 + gradient clipping Bài 13; chia nhỏ theo `requestAnimationFrame` để không khoá UI (quy tắc §1); loss curve + văn bản mẫu sinh mỗi N bước — nhìn model tiến hoá từ nhiễu → âm tiết → cụm từ có vần lục bát; seed cố định, mọi con số trong bài tái lập được · 19.4 Giới hạn thật & vì sao GPT thật cần triệu đô: đối chiếu 100k tham số/vài phút CPU vs GPT-3 175B/nghìn GPU-tháng; cái gì scale y nguyên (KIẾN TRÚC — bạn vừa xây đúng nó) và cái gì không (dữ liệu, compute, alignment — nối Bài 16 scaling law, Bài 18 RLHF); pitfall nhận thức: "model nhỏ sinh chữ vô nghĩa nghĩa là code sai" — không, đó là đúng hành vi ở scale này · 19.5 Tổng kết lộ trình nghề & bản đồ học tiếp: 3 hướng (ML engineer / research / ứng dụng LLM); tài nguyên chọn lọc (Karpathy zero-to-hero & nanoGPT, fast.ai, d2l.ai, docs PyTorch); những gì series CỐ TÌNH bỏ (huấn luyện phân tán, RLHF thật, multimodal, diffusion ảnh thật) và đọc gì để lấp từng lỗ. Demo capstone: trang GPT-mini hoàn chỉnh — nút ▶ Train (seed cố định) / ⏸ / ⏹, loss curve, khung sinh văn bản với đủ slider sampling của Bài 18. _Tiên quyết: Bài 9, 10, 14, 16, 18 — tổng hợp toàn series._

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
