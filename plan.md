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
