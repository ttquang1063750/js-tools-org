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
| Series 11                        | Thiết Kế Vi Mạch Số & FPGA (VLSI)       | 0/14           | 14       | 0%          |

> **2026-07-06:** Đã gỡ phần thiết kế chi tiết (tech stack, đề cương, syllabus H2) của các
> series **100% hoàn thành** (2 WebGPU, 3 DSA, 6 CSS, 7 SQL, 8 Web Audio, 9 Git, 10 Điện Tử) khỏi file
> này để giảm context — nội dung đã publish rồi thì trang hub/bài viết thật (`blog/<series>/`)
> mới là nguồn chính xác, không phải bản thiết kế. Bản đầy đủ vẫn còn nguyên trong lịch sử
> git (`git log -- plan.md`, commit trước 2026-07-06) nếu cần tham chiếu lại.

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

## ⚡ Series 10: Điện Tử & Mô Phỏng Vi Mạch (Electronics & Circuit Simulation)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Engine:** Trình tính toán và giải lập mạch điện Modified Nodal Analysis (MNA) viết bằng vanilla JavaScript — tự động hóa việc tính điện áp nút và dòng điện nhánh bằng phương pháp giải hệ phương trình tuyến tính $A \cdot x = B$. _Lưu ý thiết kế: Đối với các bài học có mạch điện phi tuyến phức tạp (như transistor, mạch thu phát RF, ô nhớ SRAM), thay vì cố gắng xây dựng một engine CAD vạn năng cực kỳ phức tạp và dễ lỗi, dự án sẽ thiết kế các bộ giả lập chuyên dụng (Dedicated Simulators) được tối ưu hóa riêng cho sơ đồ mạch cụ thể của bài đó. Điều này giúp đảm bảo hiệu năng tối đa, chạy mượt mà trên trình duyệt và hiển thị chính xác các giản đồ sóng toán học để người đọc đối chiếu._
- **Hiển thị:** HTML5 Canvas 2D vẽ đồ họa linh kiện tĩnh, nối dây và hạt electron di chuyển thể hiện chiều dòng điện. Biểu đồ máy hiện sóng (Oscilloscope) vẽ bằng đồ họa vector SVG hoặc Canvas động.
- **Tương tác:** Kéo thả linh kiện trên grid lưới (với các bài mạch cơ bản), hoặc tương tác trực tiếp với các núm chỉnh/thanh trượt thông số trên sơ đồ mạch có sẵn (với các bài mạch phức tạp), tắt mở công tắc và thay đổi các giá trị linh kiện.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Interactive Circuit Builder & Waveform Scope"**
- **Mô tả giao diện:**
  - **Khung chính (Grid):** Khu vực lưới tương tác linh kiện (Nguồn DC/AC, Điện trở, Tụ điện, Cuộn cảm, Đi-ốt, Transistor, Đèn LED, Cổng logic). Người dùng có thể nhấp chuột để vẽ nối dây hoặc thay đổi thông số. Khi mạch hoạt động, các chấm tròn electron sẽ di chuyển dọc theo dây dẫn. Tốc độ di chuyển tỉ lệ thuận với cường độ dòng điện $I$, chiều di chuyển chỉ hướng của dòng điện.
  - **Bên phải (Oscilloscope & Control):** Máy hiện sóng hiển thị giản đồ điện áp $V(t)$ và dòng điện $I(t)$ của linh kiện đang được chọn dạng đồ thị hình sin/xung vuông động. Bộ điều chỉnh tham số (như thanh trượt đổi giá trị điện trở $R$, điện áp nguồn $V$).

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                                        | Nội dung chuyên sâu                                                                                                                                                                                                                                                                                          | Dự án/Demo đi kèm                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Đọc trị số linh kiện & Đo kiểm bằng VOM**        | Cách đọc mã màu điện trở (4/5 vòng màu), mã số tụ điện (104, 224), thông số cuộn cảm. Cách xác định các chân linh kiện bán dẫn (đi-ốt Anode/Cathode; BJT Emitter/Base/Collector; MOSFET Gate/Drain/Source). Cách dùng vạn năng kế VOM đo thế, dòng, trở, thông mạch và kiểm tra linh kiện hỏng.              | **Trình giả lập đồng hồ vạn năng ảo (Multimeter Simulator):** Người dùng cắm hai đầu que đo (đỏ/đen) vào các chân của linh kiện ngẫu nhiên trên testboard, xoay núm vạn năng kế đo thông số để tìm ra chân và xác định linh kiện tốt hay hỏng.         |
| 2   | **Định luật Ohm & Mạch cầu phân áp**               | Khái niệm cơ bản $V, I, R$. Định luật Ohm $V = I \cdot R$. Công thức sụt thế và cầu phân áp (voltage divider). Chứng minh sự bảo toàn năng lượng trong mạch đơn giản.                                                                                                                                        | **Mạch chỉnh độ sáng đèn LED:** Dùng chiết áp (potentiometer) làm cầu phân thế chỉnh áp ngõ ra LED. Có công thức tính dòng $I_{LED} = \frac{V_{in} - V_{LED}}{R}$.                                                                                     |
| 3   | **Định luật Kirchhoff & Giải thuật mạng điện MNA** | Định luật KCL (dòng nút) và KVL (áp vòng). Giới thiệu phương pháp thế nút Modified Nodal Analysis (MNA) giải hệ phương trình tuyến tính $A \cdot x = B$. Chứng minh định lý Kirchhoff bằng toán ma trận.                                                                                                     | **Sân chơi giải mạch tự động:** Người dùng thiết kế mạch điện bất kỳ, xem ma trận $A$ và vector $B$ được dựng động và giải bằng khử Gauss để tìm điện áp tại mọi nút.                                                                                  |
| 4   | **Linh kiện tích lũy & Hằng số thời gian RC/RL**   | Điện dung ($C$), Độ tự cảm ($L$). Viết phương trình vi phân mô tả tụ/cuộn cảm. Chứng minh công thức phóng nạp $v_C(t) = V_0(1 - e^{-t/RC})$. Hằng số thời gian $\tau = RC$ và $\tau = L/R$.                                                                                                                  | **Mạch trễ bật nguồn (Delay Timer):** Sử dụng nút bấm sạc tụ điện để trì hoãn đóng mở transistor kích đèn LED sáng/tắt. Biểu đồ nạp xả vẽ theo thời gian thực.                                                                                         |
| 5   | **Dòng điện xoay chiều AC & Trở kháng phức**       | Dạng sóng AC hình sin, tần số ($f$), điện áp RMS. Khái niệm số phức $j$ ứng dụng trong trở kháng phức ($Z_C = \frac{1}{j\omega C}$, $Z_L = j\omega L$). Chứng minh pha của tụ điện trễ pha $90^\circ$ so với áp.                                                                                             | **Mạch kiểm chứng độ lệch pha AC:** Đo điện áp và dòng điện trên mạch xoay chiều RC/RL bằng máy hiện sóng, vẽ giản đồ vector pha (Phasor diagram) xoay động trực quan.                                                                                 |
| 6   | **Cảm ứng điện từ & Máy biến áp (Transformer)**    | Định luật cảm ứng Faraday, hiện tượng tự cảm và hỗ cảm. Cấu trúc máy biến áp. Công thức tỉ số vòng dây $\frac{V_1}{V_2} = \frac{N_1}{N_2} = \frac{I_2}{I_1}$. Chứng minh bảo toàn công suất $P_{in} \approx P_{out}$.                                                                                        | **Mạch hạ thế AC:** Mô phỏng máy biến áp hạ dòng AC hình sin 220V xuống 12V AC. Cho phép kéo chỉnh số vòng dây cuộn sơ cấp/thứ cấp để quan sát dạng sóng ngõ ra lệch biên độ.                                                                          |
| 7   | **Đi-ốt & Mạch chỉnh lưu nguồn DC Linear**         | Tiếp giáp P-N, sụt áp thuận đi-ốt ($0.7\text{V}$). Chỉnh lưu nửa chu kỳ, toàn chu kỳ (Cầu đi-ốt) và công thức tính dung tích tụ lọc san phẳng gợn sóng điện áp: $C = \frac{I_{load}}{f \cdot V_{ripple}}$.                                                                                                   | **Bộ nguồn DC Linear 12V thực tế:** Chuyển đổi dòng 12V AC (từ Bài 6) thành nguồn 12V DC phẳng bằng cầu đi-ốt và tụ hóa lớn. Quan sát mức độ gợn sóng biến đổi theo điện trở tải, sau đó thêm tầng ổn áp Zener/7805 để so sánh ngõ ra phẳng hoàn toàn. |
| 8   | **Mạch lọc tần số (Filters) & Ứng dụng âm thanh**  | Bộ lọc thông thấp (Low-pass) và thông cao (High-pass) bậc 1 và 2. Công thức tần số cắt $f_c = \frac{1}{2\pi RC}$. Chứng minh hàm truyền đạt (transfer function) $H(f)$ bằng số phức, vẽ giản đồ Bode plot.                                                                                                   | **Mạch phân tần loa (Audio Crossover):** Mô phỏng bộ phân tần chia tín hiệu âm thanh hỗn hợp thành tần số thấp (cho loa Bass) và tần số cao (cho loa Treble), đo giản đồ Bode.                                                                         |
| 9   | **Transistor (BJT & MOSFET) & Mạch khuếch đại**    | Đặc tính linh kiện bán dẫn. Trạng thái ngắt, bão hòa và tuyến tính. Cấu hình khuếch đại cực phát chung (Common Emitter). Công thức tính độ lợi điện áp $A_v = -g_m \cdot R_C$. Chứng minh độ lệch pha $180^\circ$.                                                                                           | **Mạch khuếch đại micro:** Người dùng cấp tín hiệu hình sin biên độ nhỏ từ micro ($10\text{mV}$), quan sát transistor khuếch đại thành tín hiệu hình sin lớn ($1.5\text{V}$) ngược pha.                                                                |
| 10  | **Op-Amp & Comparator (Khuếch đại thuật toán)**    | Cấu trúc khuếch đại vi sai và độ lợi vòng hở $A_{OL}$. Hồi tiếp âm và hai "quy tắc vàng" (golden rules). Mạch khuếch đại đảo/không đảo, công thức độ lợi $A_v = 1 + \frac{R_f}{R_1}$. Bộ so sánh (Comparator) và mạch trễ Schmitt Trigger — nền tảng để hiểu khối so sánh bên trong IC 555 (Bài 14).         | **Mạch tiền khuếch đại & Comparator ánh sáng:** Kéo thanh trượt $R_f/R_1$ quan sát độ lợi thay đổi trên oscilloscope; ghép comparator với quang trở để tự động bật LED khi trời tối, chỉnh ngưỡng bằng cầu phân áp (Bài 2).                            |
| 11  | **Ăng-ten & Mạch thu phát vô tuyến (RF)**          | Sóng điện từ và nguyên lý bức xạ. Cấu trúc ăng-ten dipole/monopole. Công thức tính độ dài ăng-ten tối ưu $\lambda/2$ và $\lambda/4$ ($\lambda = c/f$). Hiện tượng cộng hưởng LC và công thức Thompson $f_0 = \frac{1}{2\pi\sqrt{LC}}$. Phối hợp trở kháng (impedance matching) ăng-ten để truyền tải tối đa. | **Mạch thu sóng Radio AM đơn giản:** Mô phỏng ăng-ten nhận sóng AM, xoay tụ biến dung $C$ để mạch cộng hưởng khớp tần số đài phát, thực hiện tách sóng bằng đi-ốt lấy lại tín hiệu âm thanh ban đầu.                                                   |
| 12  | **Cổng Logic & Mạch tổ hợp (Combinational)**       | Mức điện áp logic nhị phân. Thiết kế cổng NOT, AND, OR, XOR bằng CMOS thực tế. Đại số Boolean tính toán ngõ ra và giản đồ Karnaugh tối giản mạch logic. Ghép nối tạo bộ cộng bán phần/toàn phần (Half/Full Adder).                                                                                           | **Bộ cộng nhị phân 1-bit (Full Adder):** Lắp ghép các cổng logic ở mức transistor, cấp ngõ vào $A, B, C_{in}$ để kiểm chứng ngõ ra Tổng ($S$) và Số nhớ ($C_{out}$).                                                                                   |
| 13  | **Mạch tuần tự & Thiết kế bộ nhớ lưu trữ**         | Latch RS, D Flip-Flop. Hệ thống đồng bộ (xung clock). Thiết kế thanh ghi dịch (Shift Register), bộ đếm nhị phân (Counter). Ghép nối Flip-Flop tạo ô nhớ RAM tĩnh (SRAM cell - 6T SRAM). Công thức thời gian trễ và setup/hold time.                                                                          | **Thiết kế mạch ô nhớ SRAM:** Tạo mạch nhớ SRAM từ các cổng logic, điều khiển chân Write/Read, đổi chân Data để ghi nhớ và lưu trữ ổn định 1 bit dữ liệu.                                                                                              |

## 🧩 Series 11: Thiết Kế Vi Mạch Số & FPGA — RTL to Silicon (Digital IC Design)

> Track nối tiếp Series 10, đưa người học từ cổng logic (Series 10 bài 12–14) lên level kỹ sư thiết kế vi mạch số: tư duy RTL → SystemVerilog → verification → FPGA → SystemC → ASIC flow mã nguồn mở → capstone CPU RISC-V. Nội dung bài viết **chỉ tiếng Việt** (quy tắc #7). **Điểm khác biệt bắt buộc của series này:** mỗi bài mở đầu bằng khối **"Điều kiện tiên quyết"** (component `.callout--note` tiêu đề "📚 Điều kiện tiên quyết") liệt kê link nội bộ (Series 10 bài liên quan, Series C — Con trỏ & Bộ nhớ, Toy JS Engine) và tài nguyên ngoài uy tín (HDLBits, ChipVerify, EDA Playground, tài liệu Yosys/Verilator) để người học tự kiểm tra đầu vào trước khi đọc.

### 0. Danh tính series (đã chốt 2026-07-05)

| Trường       | Giá trị                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tên series   | Thiết Kế Vi Mạch Số & FPGA — RTL to Silicon (Digital IC Design)                                                                                                                                        |
| Thư mục      | `blog/vlsi/`                                                                                                                                                                                           |
| File hub     | `vlsi-programming-series.html`                                                                                                                                                                         |
| Slug bài học | `vlsi-<topic>.html` (vd `vlsi-verilog-combinational.html`)                                                                                                                                             |
| Tag class    | `--vlsi` (thêm `.blog-card__tag--vlsi`, `.article-hero--vlsi` vào `blog.css`)                                                                                                                          |
| Màu accent   | `#84cc16` (lime — chưa series nào dùng)                                                                                                                                                                |
| Ngôn ngữ dạy | **SystemVerilog (design subset, IEEE 1800)** — chuẩn công nghiệp hiện hành, superset của Verilog; mỗi cú pháp mới kèm ghi chú "Verilog cũ tương đương" để đọc được code legacy (quyết định 2026-07-05) |
| Prism        | `verilog` ⚠️ **chưa có trong `blog/prism.js`, phải bổ sung grammar local** (grammar `verilog` của Prism đã gồm keyword SystemVerilog); SystemC dùng `cpp` sẵn có; kèm `c`, `js`                        |

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Engine:** Trình mô phỏng RTL SystemVerilog design-subset **"VeriLite"** viết bằng vanilla JavaScript, pipeline: lexer → parser sinh AST → elaborate thành netlist (cổng logic, D-FF, dây nối) → mô phỏng event-driven theo delta-cycle. Tập con hỗ trợ đủ để dạy: `module`/port, `logic` (kèm `wire`/`reg` legacy), `assign`, `always_comb` và `always_ff @(posedge clk)` (chấp nhận cả `always @(*)`/`always @(posedge clk)` cũ), `if`/`case`, `typedef enum` cho FSM, toán tử số học & bitwise, vector `[N:0]`, instance module con. Kỹ thuật viết lexer/parser/interpreter cross-link trực tiếp với series **Toy JS Engine** (cùng cấu trúc AST + evaluator). _Lưu ý thiết kế (kế thừa bài học Series 10): KHÔNG cố xây trình mô phỏng vạn năng chuẩn IEEE-1364. Các bài về STA, place & route, ASIC flow dùng bộ giả lập chuyên dụng (Dedicated Simulators) tối ưu cho đúng khái niệm của bài — ví dụ sa bàn P&R trên grid nhỏ, bảng STA tính critical path trên netlist mẫu cố định._
- **Hiển thị:** SVG vẽ sơ đồ netlist (cổng AND/OR/XOR/MUX, flip-flop, ranh giới module, tô sáng đường tín hiệu active); Canvas 2D vẽ **waveform viewer** (tín hiệu số theo thời gian, giá trị bus dạng hex, zoom/pan); bảng timing report HTML. Công thức timing ($t_{setup}$, $t_{hold}$, $f_{max}$) render bằng KaTeX local.
- **Tương tác:** editor code (textarea + overlay Prism highlight, pattern từ CSS Playground), nút ▶ Run / ⏭ Step clock / ⏹ Reset, click tên tín hiệu để ghim vào waveform, slider tốc độ mô phỏng, preset mạch mẫu.
- **File engine tái sử dụng toàn series** (đặt trong `blog/vlsi/`, không build step): `vlsi-verilite.js` (lexer/parser/simulator), `vlsi-netlist-svg.js` (elaborate → vẽ sơ đồ), `vlsi-waveform.js` (đồ thị sóng). Ba mô-đun này viết một lần ở bài đầu có demo, các bài sau chỉ ghép cấu hình.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "RTL Playground — Verilog Editor · Netlist · Waveform"** (`vlsi-rtl-playground.html`)
- **Mô tả giao diện (layout 3 khung):**
  - **Trái — Editor:** soạn SystemVerilog-subset, báo lỗi cú pháp từng dòng; dropdown preset (mux 2-1, full adder, counter 4-bit, FSM đèn giao thông, thanh ghi dịch).
  - **Giữa — Netlist SVG:** sơ đồ cổng được elaborate tự động từ code; sửa 1 dòng `assign` là hình đổi ngay lập tức; mỗi cạnh clock tô sáng các đường tín hiệu đang đổi giá trị.
  - **Phải — Waveform + điều khiển:** đồ thị sóng clock và các tín hiệu được ghim, giá trị bus hex; ▶ Run / ⏭ Step / ⏹ Reset, slider tần số.
- **Insight cốt lõi:** người học _thấy_ SystemVerilog không phải "chương trình chạy tuần tự từ trên xuống" mà là **mô tả phần cứng song song** — mọi cổng "chạy" đồng thời tại mỗi cạnh clock. Đây là hiểu nhầm số 1 của lập trình viên phần mềm chuyển sang HDL, và là lý do visualizer này tồn tại.
- ⚠️ **Hạng mục xây nặng nhất series** (độ khó ~ sql.js workbench + toyjs visualizer cộng lại) — phải làm sớm ngay sau hub vì mọi bài SystemVerilog đều nhúng lại nó ở cấu hình nhỏ hơn.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus — 14 bài)

| Bài | Tên bài học                                            | Nội dung chuyên sâu                                                                                                                                                                                                                                                                                                                                                                                                 | Dự án/Demo đi kèm                                                                                                                                                                |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Từ cổng logic đến RTL: Tư duy mô tả phần cứng**      | Các mức trừu tượng thiết kế (transistor → gate → RTL → behavioral). HDL khác ngôn ngữ lập trình thế nào: song song vs tuần tự, mô tả cấu trúc vs mô tả hành vi. Design flow tổng quan RTL→GDSII. Bản đồ HDL: Verilog → SystemVerilog (chuẩn công nghiệp, superset), VHDL, Chisel/Amaranth (sinh ra Verilog) và HLS — vì sao series dạy SystemVerilog. _Tiên quyết: Series 10 bài 12–13 (cổng logic, mạch tuần tự)._ | **Tour RTL Playground:** cùng một mạch mux 2-1 viết 3 kiểu (structural / dataflow / behavioral), elaborate ra cùng một netlist — chứng minh "code là phần cứng".                 |
| 2   | **SystemVerilog tổ hợp (Combinational)**               | `module`/port, kiểu `logic` (vs `wire`/`reg` legacy), `assign`, toán tử số học & bitwise, vector `[N:0]`, số có dấu/không dấu. `always_comb` với `if`/`case`: cạm bẫy **latch inference** khi thiếu else/default — `always_comb` giúp tool bắt lỗi ngay, khác `always @(*)` cũ.                                                                                                                                     | **ALU 4-bit mini:** viết ALU 8 phép toán trên RTL Playground, xem netlist sinh ra và kiểm thử từng opcode bằng waveform.                                                         |
| 3   | **SystemVerilog tuần tự (Sequential) & Thanh ghi**     | `always_ff @(posedge clk)` (vs `always @(posedge clk)` cũ) — khai báo rõ ý định flip-flop. Khác biệt **blocking `=` vs non-blocking `<=`** (cạm bẫy số 1 của HDL). Reset đồng bộ vs bất đồng bộ. Counter, thanh ghi dịch, clock divider.                                                                                                                                                                            | **Counter 4-bit + bộ tạo PWM số:** quan sát waveform từng cạnh clock; cross-link Series 10 bài 14 (PWM analog bằng 555) so với PWM số bằng counter.                              |
| 4   | **Máy trạng thái hữu hạn (FSM)**                       | Moore vs Mealy. Sơ đồ trạng thái → mã SystemVerilog: `typedef enum` đặt tên trạng thái (thay parameter magic-number kiểu Verilog cũ), template 2-process/3-process. Mã hoá trạng thái binary vs one-hot và đánh đổi diện tích/tốc độ. Trạng thái treo (unreachable/illegal state) và recovery.                                                                                                                      | **FSM đèn giao thông + bộ phát hiện chuỗi bit `1011`:** vẽ sơ đồ trạng thái động, tô sáng trạng thái hiện hành đồng bộ với waveform.                                             |
| 5   | **Testbench & Verification cơ bản**                    | Tư duy "thiết kế đúng phải chứng minh được": stimulus, `$display`/`$monitor`, self-checking testbench, golden model, SVA (SystemVerilog Assertions) cơ bản — điểm mạnh riêng của SV, khái niệm coverage. Quy trình debug bằng waveform.                                                                                                                                                                             | **Săn bug bằng testbench:** adder cố tình cài 2 bug, người học viết testbench tự phát hiện; đếm coverage các case đã kích hoạt.                                                  |
| 6   | **Số học phần cứng (Hardware Arithmetic)**             | Ripple-carry vs carry-lookahead adder: chứng minh độ trễ $O(n)$ vs $O(\log n)$. Nhân cứng (shift-add, array multiplier). Biểu diễn fixed-point, bão hoà và tràn số. Đánh đổi diện tích ↔ tốc độ ↔ công suất (PPA).                                                                                                                                                                                                  | **Đua adder:** RCA vs CLA cùng netlist trên bảng STA mini — kéo bit-width tăng dần, xem critical path và $f_{max}$ phân hoá.                                                     |
| 7   | **Bộ nhớ, FIFO & Clock Domain Crossing**               | RAM/ROM inference, register file 2-port. FIFO đồng bộ: con trỏ đọc/ghi, cờ full/empty. Vượt miền xung nhịp (CDC): metastability, 2-FF synchronizer, Gray code cho con trỏ FIFO bất đồng bộ.                                                                                                                                                                                                                         | **FIFO visualizer:** producer/consumer chạy hai tốc độ khác nhau, quan sát mức đầy, cờ full/empty và sự kiện metastability mô phỏng khi bỏ synchronizer.                         |
| 8   | **Timing & Phân tích thời gian tĩnh (STA)**            | $t_{setup}$, $t_{hold}$, $t_{clk \to q}$, propagation delay. Critical path và công thức $f_{max} = 1/(t_{clk \to q} + t_{comb} + t_{setup})$. Slack dương/âm. Pipeline: cắt critical path đổi lấy latency. _Tiên quyết: Series 10 bài 13 (setup/hold time của Flip-Flop)._                                                                                                                                          | **STA Workbench:** netlist mẫu với slider độ trễ từng cổng — critical path tô đỏ tự động, bảng slack, thêm 1 tầng pipeline thấy $f_{max}$ tăng.                                  |
| 9   | **Kiến trúc FPGA: LUT, CLB, BRAM, DSP**                | FPGA hiện thực "mọi mạch" bằng LUT-k như thế nào (LUT = bảng chân lý trong SRAM). Cấu trúc CLB/slice, carry chain, BRAM, DSP slice, routing fabric, IO block. So sánh FPGA vs ASIC vs MCU (Series 10 bài 15): khi nào chọn gì.                                                                                                                                                                                      | **LUT Explorer:** nhập bảng chân lý 4 đầu vào → nội dung LUT sinh ra; map thử mạch full adder vào lưới CLB 4×4 thấy carry chain.                                                 |
| 10  | **FPGA Flow: Synthesis → Place & Route → Bitstream**   | Synthesis (RTL → netlist LUT) và technology mapping. Placement, routing và congestion. Ràng buộc timing (SDC), đọc timing report. Toolchain mã nguồn mở Yosys + nextpnr (đọc SystemVerilog qua slang plugin/sv2v). Vì sao cùng code mà $f_{max}$ khác nhau giữa các lần P&R.                                                                                                                                        | **Sa bàn Place & Route:** grid CLB nhỏ, tự đặt/kéo khối bằng tay rồi so với auto-place; xem tắc nghẽn routing và timing trước/sau tối ưu.                                        |
| 11  | **SystemC & Mô hình hoá mức hệ thống (TLM)**           | Vì sao cần mô hình trước khi viết RTL: tốc độ mô phỏng vs độ chính xác chu kỳ. SystemC: `SC_MODULE`, `SC_METHOD`/`SC_THREAD`, kênh & port. Transaction-Level Modeling (TLM) và virtual prototyping trong công nghiệp. _Tiên quyết: Series C/C++ (class, template cơ bản)._                                                                                                                                          | **Producer–Consumer hai tầng mô hình:** cùng hệ thống chạy ở mức TLM (JS mô phỏng API SystemC) và mức RTL — đo số "sự kiện mô phỏng" chênh lệch hàng trăm lần để thấy trade-off. |
| 12  | **ASIC Flow mã nguồn mở: Standard Cell → GDSII**       | Thư viện standard cell, liberty timing. Flow vật lý: synthesis → floorplan → placement → CTS (clock tree) → routing → DRC/LVS → GDSII. PPA và corner. Hệ mở OpenLane + SkyWater PDK 130nm; con đường tape-out thật cho người tự học qua **TinyTapeout**.                                                                                                                                                            | **Die Viewer ảo:** theo từng bước flow, die nhỏ hiện dần các lớp (standard cell rows → clock tree → routing); toggle lớp, zoom xem một cell NAND thật ở mức layout.              |
| 13  | **Dự án CPU RISC-V RV32I — Phần 1: Datapath**          | ISA RV32I subset (arithmetic, logic, branch, load/store). Datapath single-cycle: PC, instruction memory, register file, immediate generator, ALU, control unit. Decode từng định dạng lệnh R/I/S/B. _Tiên quyết: bài 2–5 series này; Series C (biểu diễn số, con trỏ)._                                                                                                                                             | **Datapath Visualizer:** nhập lệnh `addi`/`add`/`beq` dạng assembly, xem từng đường dữ liệu tô sáng qua datapath theo từng lệnh.                                                 |
| 14  | **Dự án CPU RISC-V RV32I — Phần 2: Chạy chương trình** | Control unit hoàn chỉnh, load/store với data memory, memory-mapped output. Nạp và chạy chương trình thật (Fibonacci, đảo chuỗi). Debug bằng waveform khi CPU chạy sai. Hướng mở rộng: pipeline 5 tầng, hazard. Tổng kết lộ trình nghề (RTL design, verification, FPGA engineer) + bản đồ tài nguyên học tiếp.                                                                                                       | **Capstone tổng hợp:** CPU RISC-V mini chạy file hex trên RTL Playground đầy đủ (editor + netlist + waveform + màn hình memory-mapped) — gom toàn bộ kiến thức 13 bài trước.     |

### 4. Tiêu chuẩn chất lượng & Bản đồ liên kết chéo (Quality Contract & Cross-links)

Mọi bài học Series 11 tuân thủ toàn bộ rubric chung tại `.agents/skills/design-new-series/references/quality-contract.md` (≥4 H2 sâu, ≥4 `.code-window` chạy được, ≥3 callout với ≥1 `--pitfall`, ≥3 cross-link nội bộ, ≥3 link ngoài `.article-refs`, ≥3 câu quiz, ≥1 file code tải về, `<abbr>` + glossary hub, mỗi công thức KaTeX 1 câu giải nghĩa) **cộng các yêu cầu đặc thù sau:**

- **Độ dài:** tối thiểu 1.500 từ tiếng Việt/bài (đồng bộ chuẩn Series 10) — đi sâu bản chất, không văn giới thiệu chung chung.
- **Khối "📚 Điều kiện tiên quyết" BẮT BUỘC** ngay sau đoạn mở đầu mỗi bài (`.callout--note`): liệt kê link nội bộ (bài Series 10/11 liên quan, Series C, Toy JS Engine) + link ngoài (HDLBits, ChipVerify, EDA Playground, tài liệu Yosys/Verilator) theo ghi chú _Tiên quyết_ ở Phần III. Đây là đặc điểm nhận diện của series, không được bỏ.
- **Code SystemVerilog chạy được trên RTL Playground:** mọi ví dụ SV trong `.code-window` phải chạy được trên VeriLite (subset đã định nghĩa §1) hoặc ghi chú rõ "chỉ minh hoạ, ngoài subset". Cú pháp SV-only (`logic`, `always_comb`, `always_ff`, `typedef enum`) lần đầu xuất hiện trong bài phải kèm 1 dòng ghi chú "Verilog cũ tương đương".
- **Anti-pattern ❌/✅ bắt buộc** ở các bài có cạm bẫy tổng hợp: bài 2 (latch inference), bài 3 (blocking vs non-blocking), bài 4 (thiếu default recovery), bài 7 (thiếu synchronizer), bài 10 (thiếu SDC constraint), bài 12 (code FPGA-clean nhưng bẩn cho ASIC) — mỗi cặp kèm ảnh/sơ đồ netlist hoặc waveform trước–sau.
- **Sơ đồ bắt buộc:** mỗi bài ≥1 sơ đồ SVG/Canvas đúng loại: netlist (bài 1–4), timing diagram (bài 3, 8), sơ đồ trạng thái (bài 4), kiến trúc khối (bài 7, 9, 11–14). Sơ đồ chân/pinout không tính (bài học từ review Series 10).
- **Demo:** mỗi bài nhúng lại RTL Playground ở cấu hình thu gọn hoặc dedicated simulator của bài (STA Workbench, LUT Explorer, sa bàn P&R, Die Viewer, Datapath Visualizer); bọc trong `.code-tabs` (Preview | SystemVerilog | JavaScript).
- **File tải về:** mỗi bài ≥1 file `.sv` co-located (thiết kế + testbench) chạy được trên VeriLite và trên Verilator/EDA Playground thật (ghi chú lệnh chạy trong comment đầu file).
- **Bản đồ liên kết chéo (bổ sung vào map chung Phần IV §4):**
  - **Bài 1–4, 9** ↔ **Series 10 bài 12–14** (cổng logic, flip-flop, CMOS, 555/PWM) — cùng khái niệm ở mức vật lý vs mức RTL.
  - **Bài 5, 13–14** ↔ **Series C (biểu diễn số, con trỏ & bộ nhớ)** và **Series 10 bài 15–16 (MCU)** — memory-mapped I/O nhìn từ hai phía phần cứng/phần mềm.
  - **Engine VeriLite (bài 1, 11)** ↔ **Toy JS Engine** (lexer/parser/AST, event scheduler) — cùng kỹ thuật viết interpreter.
  - **Bài 6, 8** ↔ **DSA** (độ phức tạp $O(n)$/$O(\log n)$, đồ thị critical path).

### 5. Checklist thi công & tích hợp (Implementation & Integration)

> Bám sát khung chung Phần II (§1–6) và `references/page-anatomy.md`. Dưới đây chỉ liệt kê phần ĐẶC THÙ của Series 11 + thứ tự thi công đề xuất. Vẫn áp dụng nhịp "một việc nhỏ mỗi lượt, checkpoint, hỏi duyệt".

**Hạ tầng riêng (làm MỘT lần, trước bài đầu):**

- [ ] **Prism `verilog`**: thêm grammar verilog (đã gồm keyword SystemVerilog) vào `blog/prism.js` — bản local, không CDN; test highlight `logic`/`always_ff`/`typedef enum` trên 1 file mẫu.
- [ ] **Tag & accent**: thêm `.blog-card__tag--vlsi`, `.article-hero__tag--vlsi`, `.article-hero--vlsi` (accent `#84cc16`) vào `blog/blog.css`.
- [ ] Callout/`.article-refs`/glossary/KaTeX/giscus: **đã có sẵn** từ các series trước — tái dùng, không tạo mới.

**Engine & visualizer (nặng nhất — làm ngay sau hub, TRƯỚC bài 1):**

- [ ] `vlsi-verilite.js` — lexer → parser/AST → elaborate netlist → event-driven sim (subset §1). Viết kèm bộ self-test JS thuần (chạy trong console) vì mọi bài phụ thuộc engine này.
- [ ] `vlsi-netlist-svg.js` — netlist → sơ đồ SVG (cổng, FF, dây, tô sáng active).
- [ ] `vlsi-waveform.js` — Canvas waveform viewer (zoom/pan, bus hex).
- [ ] `vlsi-rtl-playground.html` — ghép 3 mô-đun thành core visualizer (bọc `.code-tabs`), preset: mux, full adder, counter 4-bit, FSM đèn giao thông, thanh ghi dịch.

**Dedicated simulators theo bài (mỗi cái 1 file HTML độc lập trong `blog/vlsi/`):**

- [ ] Bài 7: FIFO visualizer · Bài 8: STA Workbench · Bài 9: LUT Explorer · Bài 10: Sa bàn P&R · Bài 11: TLM vs RTL sim · Bài 12: Die Viewer · Bài 13–14: Datapath Visualizer + assembler mini (dùng chung).

**Thứ tự thi công đề xuất:** hạ tầng → hub (`vlsi-programming-series.html`, kèm glossary EN–VI: RTL, netlist, LUT, STA, slack, PPA, tape-out…) → engine VeriLite + RTL Playground → bài 1 → duyệt văn phong → các bài còn lại mỗi lượt 1 bài kèm tích hợp toàn cục cho bài đó.

**Tích hợp toàn cục (theo Phần II §5, lưu ý riêng):**

- [ ] `blog/index.html`: thêm `a.blog-card` với tag `--vlsi`; ROOT `index.html`: thêm `a.learn-card` + **cặp key i18n mới `learn.vlsi.title`/`learn.vlsi.desc` vào `i18n.js`** (learn-card dùng `data-i18n` — khác blog-card); sau đó `grep -c` đối chiếu số learn-card = số blog-card series.
- [ ] `sitemap.xml` (hub 0.8, bài + visualizer 0.7) · `blog/search-index.json` (headings VI) · `README.md`/`AGENTS.md` (cây thư mục, số series/bài, Last Updated).
- [ ] Mỗi file `.sv` co-located ghi comment đầu file lệnh chạy thật: `verilator --lint-only` / link EDA Playground.

**Điều kiện chặn bổ sung cho Series 11** (cộng với checklist chung trong [`check-lesson.md`](check-lesson.md)):

1. Khối "📚 Điều kiện tiên quyết" hiện diện đầu MỌI bài, link đúng slug không đuôi `.html`.
2. Mọi ví dụ SV chạy được trên VeriLite hoặc ghi rõ "ngoài subset".
3. Sơ đồ đúng loại bài (§4) — netlist/timing/trạng thái/kiến trúc; pinout không tính.

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

## Series 11 — Thiết Kế Vi Mạch Số & FPGA (RTL to Silicon)

> Mỗi bài mở đầu bằng khối "📚 Điều kiện tiên quyết" (callout--note) như ghi ở Phần I §0. Ghi chú _Tiên quyết_ cuối mỗi dòng dưới đây là nội dung tối thiểu của khối đó.

- **Bài 1 — Từ cổng logic đến RTL: Tư duy mô tả phần cứng:** 1.1 Bốn mức trừu tượng thiết kế vi mạch (transistor → gate → RTL → behavioral/system) — vì sao công nghiệp làm việc chủ yếu ở mức RTL · 1.2 HDL ≠ ngôn ngữ lập trình: mọi phát biểu "chạy" song song, code là mô tả cấu trúc vật lý — hiểu nhầm số 1 của lập trình viên phần mềm (pitfall) · 1.3 Toàn cảnh design flow RTL → simulation → synthesis → P&R → GDSII và bản đồ nghề nghiệp (RTL designer, verification, physical design) · 1.4 Bản đồ HDL: Verilog → SystemVerilog (chuẩn công nghiệp, superset của Verilog) vs VHDL vs Chisel/Amaranth (HDL thế hệ mới, sinh ra Verilog) vs HLS — vì sao series dạy SystemVerilog design-subset, kèm ghi chú cú pháp Verilog cũ tương đương xuyên suốt · 1.5 Thực hành: mux 2-1 viết 3 kiểu structural/dataflow/behavioral trên RTL Playground, elaborate ra cùng một netlist. _Tiên quyết: Series 10 bài 12–13 (cổng logic, mạch tuần tự); ôn biểu diễn nhị phân._
- **Bài 2 — SystemVerilog tổ hợp (Combinational Logic):** 2.1 `module`/port, kiểu `logic` (một kiểu thay cặp `wire`/`reg` khó hiểu của Verilog cũ) và gán liên tục `assign` — mô hình "dây nối" thuần túy · 2.2 Vector `[N:0]`, ghép nối `{}`, replication, số có dấu `signed` vs không dấu và mở rộng dấu (pitfall so sánh lẫn loại) · 2.3 `always_comb` với `if`/`case`: khi nào tổng hợp ra mux, khi nào vô tình sinh **latch** vì thiếu `else`/`default` — `always_comb` giúp tool báo lỗi ngay còn `always @(*)` cũ im lặng cho qua (pitfall kinh điển — kèm anti-pattern ❌/✅ soi netlist trước–sau) · 2.4 Coding style tổ hợp an toàn: gán default đầu khối, phủ đủ nhánh case, một tín hiệu chỉ gán trong một khối always · 2.5 Thực hành: ALU 4-bit 8 phép toán, kiểm chứng từng opcode trên waveform. _Tiên quyết: bài 1 series này._
- **Bài 3 — SystemVerilog tuần tự (Sequential) & Thanh ghi:** 3.1 `always_ff @(posedge clk)` — flip-flop được suy ra (infer) từ code như thế nào, vì sao `always_ff` khai báo ý định rõ hơn `always @(posedge clk)` cũ, đối chiếu ngược D-FF của Series 10 bài 13 · 3.2 Blocking `=` vs non-blocking `<=`: mô phỏng sai lệch ra sao, quy tắc vàng "tổ hợp dùng `=`, tuần tự dùng `<=`" — chứng minh bằng phản ví dụ thanh ghi dịch viết sai chỉ còn 1 tầng (pitfall số 1 của HDL, anti-pattern ❌/✅ bắt buộc) · 3.3 Reset đồng bộ vs bất đồng bộ: đánh đổi timing/diện tích, quy ước chọn theo công nghệ · 3.4 Mạch tuần tự kinh điển: counter, clock divider, thanh ghi dịch, PWM số bằng counter+comparator (cross-link Series 10 bài 14 — PWM analog bằng IC 555) · 3.5 Thực hành: counter 4-bit + PWM duty tùy chỉnh, soi waveform từng cạnh clock trên RTL Playground. _Tiên quyết: bài 2 series này; Series 10 bài 13 (flip-flop, setup/hold)._
- **Bài 4 — Máy trạng thái hữu hạn (FSM):** 4.1 Moore vs Mealy: ngõ ra phụ thuộc gì, độ trễ chênh 1 chu kỳ — bảng so sánh khi nào chọn loại nào · 4.2 `typedef enum` đặt tên trạng thái + template 2-process (thanh ghi trạng thái `always_ff`, logic chuyển tiếp `always_comb`) vs 3-process — đánh đổi độ dễ đọc/dễ debug · 4.3 Mã hoá trạng thái binary vs one-hot: đánh đổi diện tích ↔ tốc độ, vì sao FPGA ưa one-hot · 4.4 Trạng thái treo (illegal/unreachable state) khi nhiễu lật bit: nhánh `default` recovery và reset an toàn (pitfall) · 4.5 Thực hành: FSM đèn giao thông + bộ phát hiện chuỗi `1011` có chồng lấp (overlap), sơ đồ trạng thái động tô sáng đồng bộ với waveform. _Tiên quyết: bài 3 series này; Series 10 bài 13 (Flip-Flop & clock)._
- **Bài 5 — Testbench & Verification cơ bản:** 5.1 Vì sao verification chiếm ~70% công sức dự án chip: chi phí bug theo giai đoạn — sửa ở RTL gần như miễn phí, sửa sau tape-out là respin hàng triệu đô · 5.2 Cấu trúc testbench: instance DUT, sinh clock/reset, stimulus trong khối `initial`, quan sát bằng `$display`/`$monitor` · 5.3 Self-checking testbench & golden model: máy chấm tự động thay cho "nhìn waveform bằng mắt thấy đẹp là xong" (pitfall kinh điển của người mới) · 5.4 SVA (SystemVerilog Assertions) cơ bản: immediate vs concurrent `assert property` — viết "hợp đồng hành vi" ngay trong thiết kế · 5.5 Coverage: code coverage vs functional coverage — trả lời câu hỏi "test bao nhiêu là đủ" · 5.6 Thực hành: săn 2 bug cài sẵn trong adder bằng testbench tự viết, đo coverage các case đã chạm. _Tiên quyết: bài 2–4 series này; luyện thêm: HDLBits, ChipVerify (link ngoài)._
- **Bài 6 — Số học phần cứng (Hardware Arithmetic):** 6.1 Ripple-carry adder: chuỗi lan truyền carry và độ trễ $O(n)$ — vì sao phép cộng 64-bit lại "chậm" ở phần cứng · 6.2 Carry-lookahead: tín hiệu generate/propagate $G_i, P_i$ và chứng minh độ trễ $O(\log n)$ (KaTeX từng bước) · 6.3 Nhân phần cứng: shift-add tuần tự (nhiều chu kỳ, ít diện tích) vs array multiplier tổ hợp (1 chu kỳ, tốn diện tích) — và vì sao FPGA làm sẵn DSP slice (forward-ref bài 9) · 6.4 Fixed-point Qm.n: bão hoà (saturate) vs wrap-around khi tràn số — pitfall tràn âm thầm trong xử lý tín hiệu (cross-link series Web Audio) · 6.5 Thực hành: đua RCA vs CLA trên bảng STA mini, kéo bit-width tăng dần xem critical path và $f_{max}$ phân hoá. _Tiên quyết: bài 2 series này; Series 10 bài 12 (Full Adder); DSA (ký hiệu độ phức tạp $O(n)$)._
- **Bài 7 — Bộ nhớ, FIFO & Clock Domain Crossing (CDC):** 7.1 RAM/ROM inference: mảng `logic [7:0] mem [0:255]`, đọc/ghi đồng bộ — khi nào tool map vào BRAM, khi nào thành LUT-RAM (forward-ref bài 9) · 7.2 Register file 2 port đọc + 1 port ghi — trái tim của CPU sau này (forward-ref bài 13) · 7.3 FIFO đồng bộ: con trỏ đọc/ghi, bộ đếm mức đầy, cờ full/empty và pitfall off-by-one khi phân biệt "đầy" với "rỗng" · 7.4 Vượt miền xung nhịp: metastability sinh ra từ vi phạm cửa sổ setup/hold (nối thẳng Series 10 bài 13), bộ đồng bộ 2-FF và khái niệm MTBF · 7.5 FIFO bất đồng bộ: vì sao con trỏ nhị phân "chết" khi vượt miền clock và Gray code cứu thế nào (mỗi bước chỉ đổi 1 bit) · 7.6 Thực hành FIFO visualizer: producer/consumer hai tốc độ, quan sát full/empty; tắt synchronizer để thấy sự kiện metastability mô phỏng. _Tiên quyết: bài 3 series này; Series 10 bài 13._
- **Bài 8 — Timing & Phân tích thời gian tĩnh (STA):** 8.1 Bộ tham số timing của đường dữ liệu giữa hai flip-flop: $t_{clk \to q}$, $t_{comb}$, $t_{setup}$, $t_{hold}$ — vẽ timing diagram từng đại lượng · 8.2 Chứng minh công thức $T_{min} = t_{clk \to q} + t_{comb,max} + t_{setup}$ → $f_{max} = 1/T_{min}$, kèm ví dụ tính số cụ thể bằng KaTeX · 8.3 Critical path và slack dương/âm: STA quét mọi đường như thế nào mà không cần mô phỏng · 8.4 Hold violation: vì sao **giảm tần số không cứu được hold** (pitfall — hold không phụ thuộc chu kỳ), fix bằng chèn delay/buffer · 8.5 Pipeline: cắt critical path đổi lấy latency — ví dụ pipeline hoá adder của bài 6, bảng so sánh trước/sau ($f_{max}$, latency, throughput) · 8.6 Thực hành STA Workbench: kéo slider độ trễ cổng, critical path tô đỏ tự động, thêm 1 tầng pipeline thấy $f_{max}$ tăng. _Tiên quyết: bài 6 series này; Series 10 bài 13 (setup/hold time)._
- **Bài 9 — Kiến trúc FPGA: LUT, CLB, BRAM, DSP:** 9.1 Ý tưởng gốc của FPGA: mọi hàm logic $k$ đầu vào = một bảng chân lý = một LUT-$k$ lưu trong SRAM — "phần cứng lập trình lại được" · 9.2 CLB/slice: LUT + flip-flop + carry chain, vì sao carry chain làm adder trên FPGA nhanh vượt logic thường (nối bài 6) · 9.3 BRAM và DSP slice: tài nguyên "cứng hoá" sẵn — code thế nào để inference dùng đúng chúng (nối bài 6–7), pitfall: viết RAM có reset đồng loạt khiến tool không map được BRAM · 9.4 Routing fabric, switch matrix và IO block: vì sao dây nối chiếm phần lớn diện tích và độ trễ; clock tree/global buffer · 9.5 Bảng so sánh FPGA vs ASIC vs MCU (NRE, tốc độ, công suất, tính linh hoạt, vòng đời sản phẩm — cross-link Series 10 bài 15) · 9.6 Thực hành LUT Explorer: nhập bảng chân lý 4 đầu vào xem nội dung LUT sinh ra; map thử full adder vào lưới CLB 4×4 có carry chain. _Tiên quyết: bài 2 & 6 series này; Series 10 bài 12 (cổng logic)._
- **Bài 10 — FPGA Flow: Synthesis → Place & Route → Bitstream:** 10.1 Synthesis: RTL → netlist generic → technology mapping vào LUT-$k$; các phép tối ưu logic tool tự làm (constant propagation, tối giản Boolean — nối Series 10 bài 12 Karnaugh) · 10.2 Ràng buộc timing SDC (`create_clock`, input/output delay): vì sao thiếu constraint thì báo cáo "timing met" hoàn toàn vô nghĩa (pitfall người mới hay dính nhất) · 10.3 Placement & routing: bài toán tối ưu NP-hard, congestion — vì sao cùng một code, hai lần chạy P&R cho $f_{max}$ khác nhau (seed ngẫu nhiên) · 10.4 Đọc timing report: WNS/TNS, lần theo failing path đầu tiên để biết sửa RTL hay sửa constraint · 10.5 Toolchain mã nguồn mở end-to-end: Yosys (đọc SystemVerilog qua slang/sv2v) → nextpnr → openFPGALoader, nạp bitstream board thật (iCE40/ECP5 giá rẻ) — link tài nguyên ngoài cho người muốn mua board · 10.6 Thực hành Sa bàn Place & Route: tự đặt khối bằng tay so với auto-place, xem congestion routing và timing trước/sau tối ưu. _Tiên quyết: bài 8–9 series này._
- **Bài 11 — SystemC & Mô hình hoá mức hệ thống (TLM):** 11.1 Khoảng trống giữa ý tưởng kiến trúc và RTL: cần mô hình chạy nhanh gấp trăm–nghìn lần để khám phá thiết kế và cho team software viết driver sớm (shift-left) · 11.2 SystemC = thư viện C++: `SC_MODULE`, `SC_METHOD`/`SC_THREAD`, `sc_signal`, delta-cycle — đối chiếu 1-1 với chính engine VeriLite của series (scheduler sự kiện, cross-link Toy JS Engine) · 11.3 TLM-2.0: giao dịch (transaction) thay cho tín hiệu từng bit, loosely-timed vs approximately-timed, virtual platform trong công nghiệp · 11.4 Bảng so sánh các mức mô hình: untimed → TLM-LT → TLM-AT → RTL → gate-level (tốc độ mô phỏng ↔ độ chính xác chu kỳ) — khi nào dùng mức nào · 11.5 Thực hành: cùng hệ producer–consumer chạy hai tầng TLM (JS mô phỏng API SystemC) và RTL, đếm số sự kiện mô phỏng chênh lệch hàng trăm lần. _Tiên quyết: Series C/C++ (class, template cơ bản); bài 7 series này (FIFO)._
- **Bài 12 — ASIC Flow mã nguồn mở: Standard Cell → GDSII:** 12.1 Standard cell library: các cell NAND/NOR/DFF vẽ sẵn ở mức transistor (nối Series 10 bài 12 — CMOS), file `.lib` timing/power và `.lef` hình học — bộ "LEGO" của ASIC · 12.2 Flow vật lý từng bước: synthesis → floorplan (utilization, IO ring) → placement → CTS cây clock (skew — nối bài 8) → routing → signoff DRC/LVS → xuất GDSII · 12.3 PPA và corner PVT (process/voltage/temperature): vì sao setup kiểm ở corner chậm còn hold kiểm ở corner nhanh · 12.4 Hệ sinh thái mở: OpenLane/OpenROAD + SkyWater PDK 130nm, và con đường tape-out thật cho người tự học qua TinyTapeout (link ngoài kèm chi phí thực tế) · 12.5 Pitfall: "code chạy được trên FPGA ≠ sạch cho ASIC" — latch vô tình, clock gating tự chế, reset style lẫn lộn · 12.6 Thực hành Die Viewer ảo: bấm qua từng bước flow thấy die hiện dần các lớp (hàng standard cell → clock tree → routing), zoom xem layout một cell NAND thật. _Tiên quyết: bài 8–10 series này; Series 10 bài 12 (CMOS)._
- **Bài 13 — Dự án CPU RISC-V RV32I — Phần 1: Datapath:** 13.1 Vì sao chọn RISC-V để học thiết kế CPU: ISA mở, miễn phí bản quyền, format lệnh đều đặn dễ decode — bảng 6 định dạng lệnh R/I/S/B/U/J · 13.2 Tập lệnh RV32I subset của dự án (~15 lệnh): nhóm số học/logic (`add`, `sub`, `and`, `or`, `addi`…), nạp/cất (`lw`/`sw`), rẽ nhánh (`beq`/`bne`), nhảy (`jal`) · 13.3 Các khối datapath single-cycle: PC + instruction memory, register file 32×32-bit (tái dùng thiết kế bài 7), immediate generator (sign-extend theo từng format — nối Series C biểu diễn số bù 2), ALU (nâng cấp từ bài 2) · 13.4 Ghép datapath tăng dần theo nhóm lệnh: R-type → I-type → load/store → branch, mỗi bước vẽ lại sơ đồ đường dữ liệu · 13.5 Control unit sơ khởi: bảng tín hiệu điều khiển (RegWrite, ALUSrc, MemRead, Branch…) theo opcode · 13.6 Thực hành Datapath Visualizer: nhập lệnh assembly `addi`/`add`/`beq`, chạy từng lệnh và xem đường dữ liệu tô sáng qua datapath. _Tiên quyết: bài 2–5 & 7 series này; Series C (biểu diễn số bù 2, con trỏ & bộ nhớ)._
- **Bài 14 — Dự án CPU RISC-V RV32I — Phần 2: Chạy chương trình thật:** 14.1 Hoàn thiện control unit: decode toàn bộ subset, bảng chân lý điều khiển đầy đủ và cách kiểm chứng bằng testbench (tái dùng kỹ thuật bài 5) · 14.2 Load/store với data memory và **memory-mapped I/O**: màn hình output ảo gắn vào địa chỉ nhớ — nối vòng về Series 10 bài 15 (GPIO cũng chính là memory-mapped I/O, giờ người học tự xây phía bên kia của thanh ghi) · 14.3 Assembler mini bằng JS: dịch assembly → mã máy hex, nạp và chạy chương trình thật (Fibonacci, đảo chuỗi) trên CPU tự thiết kế · 14.4 Debug CPU bằng waveform: cài sẵn bug lệch branch offset kinh điển, hướng dẫn lần ngược tín hiệu qua datapath để tìm — tổng ôn kỹ năng đọc sóng cả series · 14.5 Hướng mở rộng: pipeline 5 tầng (IF/ID/EX/MEM/WB), hazard & forwarding ở mức khái niệm; so sánh $f_{max}$ single-cycle vs pipeline bằng STA Workbench (nối bài 8) · 14.6 Tổng kết lộ trình nghề & bản đồ tài nguyên học tiếp: RTL design, verification (UVM), FPGA engineer, physical design; sách Harris & Harris "Digital Design and Computer Architecture RISC-V Edition", HDLBits, ChipVerify, TinyTapeout — và checklist "bạn đã đi được bao xa" đối chiếu lại từ Series 10 bài 1. _Tiên quyết: bài 13 (đọc liền mạch); đây là bài tổng hợp toàn bộ Series 10 + 11._

---

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

| Từ series               | Liên kết tới                                    | Vì khái niệm chung                               |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------ |
| WebGPU · Compute Shader | WASM · Đa luồng; DSA · Pathfinding              | Song song hoá / GPGPU                            |
| WASM · SIMD/Threading   | Canvas · Pixel; WebGL · Performance             | Tối ưu pixel/vector                              |
| Toy JS Engine           | JS · Engine & Execution; JS · Scope             | Call stack, closure, AST                         |
| DSA · Hash/B-Tree       | SQL · Index & Query Plan; C · Data Structures   | B-Tree, hashing                                  |
| Web Audio · FFT         | Canvas · Data Visualization; WebGPU · Particles | Vẽ phổ, reactive                                 |
| CSS · Transform 3D      | WebGL · Coordinate & Math                       | Ma trận biến đổi                                 |
| Git · Object Model      | C · Pointers; DSA · Huffman                     | DAG, content-address, nén                        |
| Điện tử · Logic/MCU     | VLSI · RTL/FPGA; C · Pointers                   | Cổng logic mức vật lý vs RTL, memory-mapped I/O  |
| VLSI · VeriLite engine  | Toy JS Engine; DSA · Graph                      | Lexer/parser/AST, event scheduler, critical path |

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
