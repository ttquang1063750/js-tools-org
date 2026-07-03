# Kế Hoạch & Lộ Trình Phát Triển Các Series Bài Học Mới — js-tools.org

Tài liệu này cung cấp **định hướng chi tiết, ngăn xếp công nghệ (tech stack), thiết kế giao diện demo tương tác và nội dung học thuật chuyên sâu** cho từng bài học trong 5 series mới để phục vụ thẩm định trước khi triển khai thực tế.

---

## 📈 Progress & Status (Cập nhật 2026-07-03)

| Series                           | Tên                                   | Bài hoàn thành | Tổng bài | %           |
| -------------------------------- | ------------------------------------- | -------------- | -------- | ----------- |
| 🎉 **Series 2: WebGPU**          | **Đồ họa 3D & Compute Shader**        | **10/10**      | **10**   | **100%** ✅ |
| 🎉 **Series 6: CSS & Animation** | **Hiệu ứng & Bố cục Web hiện đại**    | **10/10**      | **10**   | **100%** ✅ |
| 🚧 **Series 3: DSA Trực Quan**   | **Cấu Trúc Dữ Liệu & Giải Thuật**     | **5/12**       | **12**   | **42%**     |
| Series 1                         | WebAssembly & Rust                    | 0/10           | 10       | 0%          |
| Series 4                         | WebRTC & WebSocket                    | 0/8            | 8        | 0%          |
| Series 5                         | Toy JS Engine (Trình thông dịch JS)   | 0/?            | TBD      | 0%          |
| Series 7                         | SQL trong Trình duyệt (SQLite-WASM)   | 0/?            | TBD      | 0%          |
| Series 8                         | Web Audio API (Âm thanh & Visualizer) | 0/?            | TBD      | 0%          |
| Series 9                         | Git (Mô hình & Visualizer)            | 0/?            | TBD      | 0%          |

### DSA Series Lessons

| Bài | Tên                           | Status     | Link                                         |
| --- | ----------------------------- | ---------- | -------------------------------------------- |
| 1   | Xoay Cây AVL & Red-Black      | ✅ Done    | `/blog/algo/algo-avl-redblack-tree`          |
| 2   | Pathfinding Dijkstra & A\*    | ✅ Done    | `/blog/algo/algo-pathfinding-dijkstra-astar` |
| 3   | Sorting Algorithms Visualizer | ✅ Done    | `/blog/algo/algo-sorting-visualizer`         |
| 4   | Trie (Cấu trúc từ điển)       | ✅ Done    | `/blog/algo/algo-trie-prefix-tree`           |
| 5   | Union-Find / Disjoint Set     | ✅ Done    | `/blog/algo/algo-union-find`                 |
| 6   | Segment Tree / Fenwick Tree   | 🔲 Pending | -                                            |
| 7   | Quy Hoạch Động Trực Quan      | 🔲 Pending | -                                            |
| 8   | B-Tree Database Index         | 🔲 Pending | -                                            |
| 9   | Memory Allocator Visualizer   | 🔲 Pending | -                                            |
| 10  | Hash Table & Va Chạm          | 🔲 Pending | -                                            |
| 11  | Huffman Data Compression      | 🔲 Pending | -                                            |
| 12  | Dự án: Algorithm Playground   | 🔲 Pending | -                                            |

### WebGPU Series Lessons — HOÀN THÀNH 100%

| Bài | Tên                            | Status  | Link                                    |
| --- | ------------------------------ | ------- | --------------------------------------- |
| 1   | Kiến trúc GPU & WebGPU Setup   | ✅ Done | `/blog/webgpu/webgpu-basics-setup`      |
| 2   | Lập trình Shader với WGSL      | ✅ Done | `/blog/webgpu/webgpu-shaders-wgsl`      |
| 3   | Uniform & Storage Buffers      | ✅ Done | `/blog/webgpu/webgpu-buffers-bindgroup` |
| 4   | Pipeline State & Depth testing | ✅ Done | `/blog/webgpu/webgpu-pipeline-depth`    |
| 5   | Phong Lighting & Shadow Maps   | ✅ Done | `/blog/webgpu/webgpu-lighting-shadow`   |
| 6   | Compute Shader & Threading     | ✅ Done | `/blog/webgpu/webgpu-compute-matrix`    |
| 7   | Mô phỏng 100k Hạt trên GPU     | ✅ Done | `/blog/webgpu/webgpu-gpu-particles`     |
| 8   | SPH Fluid Simulation           | ✅ Done | `/blog/webgpu/webgpu-fluid-simulation`  |
| 9   | GLTF 3D Model Loading          | ✅ Done | `/blog/webgpu/webgpu-gltf-loading`      |
| 10  | Dự án: ColorQuarium 3D         | ✅ Done | `/blog/webgpu/webgpu-coloraquarium-3d`  |

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

## 🚀 Series 2: WebGPU (Đồ họa 3D & Compute Shader thế hệ mới)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **API Trình duyệt:** WebGPU API (`navigator.gpu`).
- **Ngôn ngữ Shader:** WGSL (WebGPU Shading Language).
- **Thư viện bổ trợ:** `gl-matrix` (phép tính ma trận 3D), `gltf-loader` (tự viết thủ công không dùng Three.js).

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "GPU Fluid Simulation & Particle Lab"**
- **Mô tả giao diện:**
  - Khung chính: Canvas hiển thị hàng vạn hạt nước hoặc chất lỏng chuyển động mềm mại va chạm với nhau và với thành hộp.
  - Bộ điều khiển:
    - Thay đổi số lượng hạt (từ 10,000 đến 200,000 hạt).
    - Thay đổi giải thuật liên kết (trọng lực, độ nhớt của nước, lực hút từ con trỏ chuột).
    - Chế độ hiển thị: Dạng hạt, dạng trường véc tơ lực, hoặc dạng bề mặt chất lỏng mượt (Metaballs).
  - Chỉ số hiệu năng: Biểu đồ FPS thời gian thực và thời gian xử lý của Compute Shader (GPU Time) tính bằng micro-giây.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                        | Nội dung CS chuyên sâu                                                                                          | Dự án/Demo đi kèm                                                          |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | **Kiến trúc GPU & WebGPU Setup**   | Luồng xử lý lệnh đồ họa đồ sộ (Massively Parallel Processing). Thiết lập GPUDevice và swap chain.               | Vẽ hình tam giác cơ bản bằng WebGPU Render Pipeline.                       |
| 2   | **Lập trình Shader với WGSL**      | Cú pháp WGSL, luồng dữ liệu giữa Vertex và Fragment shaders thông qua Location bindings.                        | Bộ shader tô màu gradient chuyển động theo thời gian thực.                 |
| 3   | **Uniform & Storage Buffers**      | Quản lý bộ nhớ GPU, quy tắc đóng gói dữ liệu (Struct alignment) và binding resources qua BindGroups.            | Mô hình 3D biến đổi vị trí bằng phép nhân ma trận trên GPU.                |
| 4   | **Pipeline State & Depth testing** | Cách hoạt động của Rasterizer, bộ đệm chiều sâu (Depth buffer) và phép lọc khử răng cưa MSAA.                   | Khối Rubik 3D xoay trong không gian 3 chiều với chiều sâu chuẩn xác.       |
| 5   | **Phong Lighting & Shadow Maps**   | Mô hình chiếu sáng toán học Phong, tính toán véc-tơ pháp tuyến và bóng đổ bằng Shadow Map FBO.                  | Mô hình 3D có bóng đổ thời gian thực dựa trên vị trí nguồn sáng di chuyển. |
| 6   | **Compute Shader & Threading**     | Cách phân chia luồng tính toán song song trên GPU (Workgroups, Local invocation IDs, Global invocation IDs).    | Bộ nhân ma trận song song siêu tốc độ vượt trội so với CPU.                |
| 7   | **Mô phỏng 100k Hạt trên GPU**     | Lưu trữ và cập nhật trạng thái hạt trong Storage Buffer trên GPU. Bỏ qua bước truyền dữ liệu thừa qua bus PCIe. | Demo tương tác 100.000 hạt bay theo lực gió và trọng lực.                  |
| 8   | **SPH Fluid Simulation**           | Thuật toán mô phỏng hạt chất lỏng Smooth Particle Hydrodynamics (SPH), tính toán mật độ và áp suất hạt.         | Mô phỏng chất lỏng tương tác động khi người dùng di chuột tạo lực sóng.    |
| 9   | **GLTF 3D Model Loading**          | Cách đọc cấu trúc file nhị phân glTF (buffers, accessors) và đưa trực tiếp vào GPU Buffer.                      | Trình duyệt mô hình nhân vật 3D đơn giản hỗ trợ phóng to xoay chiều.       |
| 10  | **Dự án: ColorQuarium 3D**         | Tích hợp Instanced Rendering để vẽ hàng triệu đối tượng cùng lưới (Mesh) bằng một lệnh vẽ duy nhất.             | Bể cá 3D sinh động chạy bằng WebGPU hiệu năng cực cao.                     |

---

## 📊 Series 3: Cấu Trúc Dữ Liệu & Giải Thuật Trực Quan (Visualized Algorithms)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Thư viện:** Vanilla JS (ES6), HTML5 Canvas 2D.
- **Kỹ thuật hoạt ảnh:** `requestAnimationFrame` kết hợp với `async/await` và `Promise` để kiểm soát nhịp độ thực thi thuật toán (giúp thuật toán dừng lại `sleep` cho người xem quan sát).

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Interactive Data Structures Sandbox"**
- **Mô tả giao diện:**
  - Nửa trên: Màn hình Canvas vẽ cấu trúc dữ liệu dưới dạng đồ thị (Nodes và Edges).
  - Nửa dưới: Khung điều khiển cho phép:
    - Chọn loại cấu trúc dữ liệu (AVL Tree, Red-Black Tree, B-Tree, Heap).
    - Nhập giá trị để thêm (Insert), xóa (Delete), hoặc tìm kiếm (Search).
    - Điều chỉnh tốc độ chạy hoạt ảnh (từ 0.1x đến 2x).
  - Bên cạnh: Hộp log giải thích từng bước đang thực hiện (ví dụ: _"Độ cao nút trái là 3, nút phải là 1 -> Mất cân bằng trái-trái -> Thực hiện xoay phải tại nút X"_).

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                       | Nội dung CS chuyên sâu                                                                                                      | Dự án/Demo đi kèm                                                                            |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | **Xoay cây AVL & Red-Black**      | Phân tích toán học đằng sau cây tìm kiếm tự cân bằng, điều kiện xoay đơn/xoay kép, luật tô màu nút.                         | Hoạt ảnh trực quan hóa các bước xoay cây tự động khi chèn nút.                               |
| 2   | **Pathfinding Dijkstra & A\***    | Giải thuật tìm kiếm trên đồ thị, hàm Heuristic đánh giá khoảng cách Manhattan và Euclid.                                    | Bản đồ mê cung tương tác cho phép xem thuật toán lan rộng vùng tìm kiếm.                     |
| 3   | **Sorting Algorithms Visualizer** | So sánh song song Quick/Merge/Heap/Radix Sort: độ phức tạp thời gian/bộ nhớ, tính ổn định (stability), trường hợp xấu nhất. | Bảng đua trực quan 4 thuật toán sắp xếp cùng một mảng ngẫu nhiên, đếm phép so sánh/hoán đổi. |
| 4   | **Trie (Cấu trúc từ điển)**       | Cây tiền tố (prefix tree) cho tìm kiếm chuỗi theo từng ký tự, ứng dụng autocomplete và kiểm tra chính tả.                   | Trực quan hóa từng bước chèn/tìm từ vào Trie, gợi ý autocomplete trực tiếp khi gõ.           |
| 5   | **Union-Find / Disjoint Set**     | Path compression và union by rank, ứng dụng phát hiện chu trình và thuật toán Kruskal tìm cây khung nhỏ nhất (MST).         | Trực quan hóa thao tác union/find trên tập hợp rời rạc và quá trình xây MST bằng Kruskal.    |
| 6   | **Segment Tree / Fenwick Tree**   | Truy vấn tổng/min/max trên đoạn con và cập nhật giá trị trong O(log n), cấu trúc chủ lực competitive programming.           | Trực quan hóa cây Segment Tree phân đoạn và cách truy vấn/cập nhật lan truyền qua node cha.  |
| 7   | **Quy Hoạch Động Trực Quan**      | Phương pháp tối ưu hóa bài toán con trùng nhau, bảng lưu vết trạng thái (State Space).                                      | Ma trận động tính toán khoảng cách chỉnh sửa chuỗi (Edit Distance) hoặc Knapsack.            |
| 8   | **B-Tree Database Index**         | Cơ chế phân nhánh bậc cao của B-Tree nhằm tối ưu hóa việc đọc ghi ổ đĩa cho cơ sở dữ liệu.                                  | Trình mô phỏng chèn/xóa nút B-Tree kèm hiệu ứng tách/gộp trang.                              |
| 9   | **Memory Allocator Visualizer**   | Sự phân mảnh của bộ nhớ (Internal/External Fragmentation), thuật toán quản lý Heap tự do.                                   | Demo mô phỏng phân bổ RAM của lệnh `malloc`/`free` trực quan.                                |
| 10  | **Hash Table & Va chạm**          | Phép băm bảo mật/không bảo mật. Các kỹ thuật Linear Probing, Quadratic Probing và Chaining.                                 | Bộ trực quan hóa phân bổ khóa vào Hash Table và các bước nhảy dò tìm khi va chạm.            |
| 11  | **Huffman Data Compression**      | Nén dữ liệu không mất mát, mã hóa tiền tố, tối ưu hóa độ dài bit dựa trên tần suất ký tự.                                   | Trình nén chuỗi ký tự hiển thị cây Huffman động được xây dựng từng bước.                     |
| 12  | **Dự án: Algorithm Playground**   | Thiết kế bộ khung (Framework) chuẩn để lập trình và vẽ hoạt ảnh cho bất kỳ thuật toán nào.                                  | Trang web tổng hợp tất cả các thuật toán trực quan hóa tương tác mượt mà.                    |

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

## 🎨 Series 6: CSS & Animation (Hiệu ứng & Bố cục Web hiện đại)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** HTML5, CSS3 thuần (không SASS/Tailwind để giữ tinh thần no-build), một ít JS để điều khiển demo.
- **API/Tính năng:** Flexbox, CSS Grid, Custom Properties, `transform`/`transition`/`@keyframes`, `clip-path`, Scroll-Driven Animations (`animation-timeline`), View Transitions API, `@container` queries, `prefers-reduced-motion`.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "CSS Playground & Animation Inspector"**
- **Mô tả giao diện:**
  - Bên trái: Trình soạn CSS trực tiếp (textarea) áp lên một khung HTML mẫu (thẻ card, nút, layout grid).
  - Bên phải: Khung preview cập nhật real-time + lớp phủ trực quan hoá Box Model (margin/border/padding/content) và đường Flex/Grid line.
  - Phía dưới: Timeline hoạt ảnh kéo-thả keyframe, slider easing (bezier editor), nút Play/Pause/Scrub để soi từng frame.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                              | Nội dung chuyên sâu                                                                          | Dự án/Demo đi kèm                                            |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | **Box Model & Cơ chế dàn trang**         | Block/inline, margin collapsing, `box-sizing`, stacking context và `z-index`.                | Inspector trực quan hoá Box Model + margin collapse động.    |
| 2   | **Flexbox toàn tập**                     | Trục chính/phụ, `flex-grow/shrink/basis`, `align`/`justify`, thứ tự và wrap.                 | Playground kéo slider thuộc tính Flex, hiển thị đường trục.  |
| 3   | **CSS Grid 2 chiều**                     | `grid-template`, `fr`, `minmax`, auto-placement, named lines & areas.                        | Trình dựng layout Grid kéo-thả, xem `grid-line` overlay.     |
| 4   | **Transition & Easing**                  | Hàm timing, `cubic-bezier`, reflow vs compositor, thuộc tính animate rẻ (transform/opacity). | Bezier editor tương tác so sánh đường cong easing.           |
| 5   | **Keyframes & Hoạt ảnh phức**            | `@keyframes`, chaining, `animation-fill-mode`, steps() cho sprite.                           | Timeline scrub từng keyframe của một loader phức tạp.        |
| 6   | **Transform 2D/3D & Perspective**        | `translate/rotate/scale`, `transform-style: preserve-3d`, `perspective`, backface.           | Card lật 3D + khối lập phương xoay thuần CSS.                |
| 7   | **Scroll-Driven Animation**              | `animation-timeline: scroll()/view()`, parallax không cần JS, hiệu năng.                     | Trang landing parallax cuộn mượt 60fps thuần CSS.            |
| 8   | **View Transitions & Container Queries** | `view-transition-name`, morph giữa trạng thái, `@container` cho component responsive.        | Gallery chuyển ảnh morph mượt + card tự thích ứng container. |
| 9   | **Hiệu năng & Accessibility**            | Compositor layers, `will-change`, tránh layout thrashing, `prefers-reduced-motion`.          | Bảng đo lại/repaint, demo tôn trọng reduce-motion.           |
| 10  | **Dự án: CSS Loader Lab**                | Tổng hợp keyframe, transform, clip-path tạo bộ loader/illustration thuần CSS.                | Bộ sưu tập spinner/skeleton + nút copy CSS từng cái.         |

---

## 🗄 Series 7: SQL trong trình duyệt (SQLite-WASM, chạy hoàn toàn client-side)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Engine:** `sql.js` (SQLite biên dịch sang WebAssembly) — commit sẵn artifact `.wasm`, không build runtime.
- **Lưu trữ:** IndexedDB/`localStorage` để persist DB giữa các phiên; import/export file `.sqlite`.
- **Giao diện:** Vanilla JS + bảng HTML render kết quả, tái dùng pattern IDE console sẵn có.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "In-Browser SQL Workbench"**
- **Mô tả giao diện:**
  - Trên: Editor SQL (gõ query, Ctrl+Enter chạy), nút nạp dataset mẫu (Chinook/Northwind rút gọn).
  - Giữa: Bảng kết quả phân trang + thời gian thực thi (ms) + số dòng.
  - Dưới: Trình xem sơ đồ quan hệ (ERD) các bảng và — với câu SELECT — hiển thị `EXPLAIN QUERY PLAN` để thấy index có được dùng hay không.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                         | Nội dung chuyên sâu                                                | Dự án/Demo đi kèm                                            |
| --- | ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| 1   | **Mô hình quan hệ & SELECT**        | Bảng/hàng/cột, `WHERE`, `ORDER BY`, `LIMIT`, kiểu dữ liệu SQLite.  | Chạy query đầu tiên trên dataset mẫu trong browser.          |
| 2   | **JOIN toàn tập**                   | INNER/LEFT/RIGHT/FULL/CROSS, khoá ngoại, lỗi tích Descartes.       | Visualizer Venn minh hoạ từng loại JOIN trên dữ liệu thật.   |
| 3   | **Aggregate & GROUP BY**            | `COUNT/SUM/AVG`, `GROUP BY`, `HAVING` vs `WHERE`.                  | Bảng tổng hợp doanh thu + biểu đồ cột từ kết quả query.      |
| 4   | **Subquery & CTE**                  | Subquery tương quan, `WITH`, đệ quy CTE (cây phả hệ).              | Demo CTE đệ quy duyệt cây danh mục lồng nhau.                |
| 5   | **Index & Query Plan**              | B-Tree index, `EXPLAIN QUERY PLAN`, full scan vs index seek.       | So sánh thời gian query trước/sau khi tạo index.             |
| 6   | **Window Functions**                | `ROW_NUMBER`, `RANK`, `LAG/LEAD`, `OVER(PARTITION BY)`.            | Bảng xếp hạng & running total trực quan.                     |
| 7   | **Transaction & ACID**              | `BEGIN/COMMIT/ROLLBACK`, tính nguyên tử, ràng buộc toàn vẹn.       | Demo mô phỏng rollback khi vi phạm ràng buộc.                |
| 8   | **Dự án: Mini Analytics Dashboard** | Ghép query + render chart, lưu DB vào IndexedDB, export `.sqlite`. | Dashboard phân tích dữ liệu chạy 100% offline trong browser. |

---

## 🔊 Series 8: Web Audio API (Âm thanh & Trực quan hoá thời gian thực)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **API:** Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `AnalyserNode`, `AudioWorklet`), `getUserMedia` (mic).
- **Hiển thị:** HTML5 Canvas 2D (tái dùng kiến thức series Canvas, đặc biệt `canvas_audio.js`).

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Web Audio Synth & Spectrum Lab"**
- **Mô tả giao diện:**
  - Bảng node-graph kéo-thả: Oscillator → Filter → Gain → Destination, chỉnh tham số từng node.
  - Canvas trực quan: dạng sóng (waveform) + phổ tần số (FFT bars) chạy real-time.
  - Nguồn đầu vào chọn được: synth nội bộ, file nhạc upload, hoặc micro (`getUserMedia`).

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                        | Nội dung chuyên sâu                                                        | Dự án/Demo đi kèm                                     |
| --- | ---------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | **AudioContext & Đồ thị âm thanh** | Mô hình node graph, lifecycle context, autoplay policy & user gesture.     | Phát một tone bằng OscillatorNode khi bấm nút.        |
| 2   | **Oscillator & Synthesis**         | Sóng sine/square/saw/triangle, tần số, detune, ADSR envelope qua GainNode. | Mini synth chơi được bằng bàn phím máy tính.          |
| 3   | **Gain, Filter & Hiệu ứng**        | BiquadFilter (lowpass/highpass), `DelayNode`, `ConvolverNode` (reverb).    | Bàn trộn hiệu ứng kéo slider nghe thay đổi tức thì.   |
| 4   | **AnalyserNode & FFT**             | Biến đổi Fourier, `getByteFrequencyData`, `getByteTimeDomainData`.         | Spectrum analyzer + waveform vẽ trên Canvas.          |
| 5   | **Phát & xử lý file/Mic**          | `decodeAudioData`, `MediaElementSource`, `getUserMedia` input mic.         | Visualizer nhạc upload + đo âm lượng từ micro.        |
| 6   | **Spatial & Stereo Audio**         | `PannerNode`, `StereoPannerNode`, âm thanh không gian 3D cơ bản.           | Demo nguồn âm di chuyển quanh người nghe.             |
| 7   | **AudioWorklet & DSP tuỳ biến**    | Xử lý mẫu âm trên luồng audio riêng, viết processor tuỳ biến.              | Bộ tạo nhiễu/bitcrusher chạy bằng AudioWorklet.       |
| 8   | **Dự án: Music Visualizer**        | Ghép FFT + Canvas particle tạo visualizer phản ứng theo nhạc.              | Trình visualizer nhạc đầy màu sắc reactive theo beat. |

---

## 🌿 Series 9: Git (Mô hình dữ liệu & Quy trình làm việc, có Visualizer)

### 1. Ngăn xếp công nghệ & Công cụ (Tech Stack)

- **Ngôn ngữ:** Vanilla JS mô phỏng đồ thị commit (DAG) trên Canvas/SVG — chạy hoàn toàn trong browser, không cần cài Git.
- **Khái niệm:** Đối tượng Git (blob/tree/commit), DAG, refs, index/staging, three-tree model.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "Interactive Git Graph Simulator"**
- **Mô tả giao diện:**
  - Khung chính: đồ thị commit (các node tròn + nhánh màu) cập nhật khi gõ lệnh.
  - Ô nhập lệnh giả lập: `commit`, `branch`, `checkout`, `merge`, `rebase`, `cherry-pick`, `reset` — vẽ lại graph tương ứng.
  - Panel phụ: trạng thái 3 cây (Working Dir / Staging / HEAD) và con trỏ refs (HEAD, branch tips) di chuyển trực quan.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                   | Nội dung chuyên sâu                                                                      | Dự án/Demo đi kèm                                        |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | **Mô hình đối tượng Git**     | Blob/Tree/Commit, content-addressable SHA-1/256, vì sao Git là snapshot không phải diff. | Trình xem cấu trúc `.git/objects` của một commit mẫu.    |
| 2   | **Three Trees & Staging**     | Working Directory, Index (staging), HEAD; vòng đời `add`/`commit`.                       | Visualizer file di chuyển qua 3 cây khi add/commit.      |
| 3   | **Branch & HEAD**             | Branch chỉ là con trỏ, HEAD tách rời (detached), fast-forward.                           | Graph tạo nhánh, di chuyển HEAD trực quan.               |
| 4   | **Merge & Conflict**          | Three-way merge, merge base, cơ chế phát sinh & giải xung đột.                           | Demo merge tạo commit hợp nhất + tô vùng conflict.       |
| 5   | **Rebase & History viết lại** | Rebase vs merge, `--onto`, interactive rebase (squash/fixup/reorder).                    | So sánh graph trước/sau rebase cùng kịch bản.            |
| 6   | **Undo & Phục hồi**           | `reset --soft/mixed/hard`, `revert`, `reflog` cứu commit mất.                            | Demo "làm hỏng rồi cứu" bằng reflog.                     |
| 7   | **Remote & Collaboration**    | `fetch`/`pull`/`push`, tracking branch, mô hình PR, rebase vs merge khi team work.       | Mô phỏng 2 remote đồng bộ, minh hoạ diverge & sync.      |
| 8   | **Dự án: Git Kata Trainer**   | Bộ thử thách: cho trạng thái graph đích, người học gõ lệnh để đạt được.                  | Trò chơi luyện Git chấm điểm tự động theo graph kết quả. |

---

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

Đây là các lỗi đã lặp lại nhiều lần ở series trước (WebGPU, CSS). Tự kiểm tra đủ 7 mục dưới đây cho **từng bài** trước khi báo hoàn thành, không đợi người dùng phát hiện lại:

1. **Header/Footer đồng nhất.** Copy nguyên văn header (hamburger nav) và footer (full nav + AdSense slot) từ file mẫu chuẩn của series gần nhất đã hoàn thành (hiện tại: `webgl-shaders-glsl.html` hoặc bài WebGPU/CSS mới nhất). Không tự viết lại, không thiếu mục nav nào.
2. **Liên kết giữa các trang đúng & đủ.** Hub → từng bài (đúng thứ tự, đúng slug không đuôi `.html`); mỗi bài có link bài trước/bài sau + về hub (`.article-related`); danh sách bài trên hub (`.lessons-list`) khớp 100% với các file thực tế đã tạo — không link tới bài chưa tồn tại, không sót bài đã tạo.
3. **Công thức toán học phải highlight qua KaTeX.** Mọi công thức (`$…$` inline, `$$…$$` block) phải render qua `katex.min.js` + `auto-render.min.js` (local, không CDN). Test thực tế trên trình duyệt — không được để công thức hiện dạng text thô `$...$`.
4. **Code demo bắt buộc có tab hiển thị code.** Dùng component `.code-tabs` (chuẩn từ WebGPU/CSS series): tối thiểu 3 tab **Xem trước (Preview) | <ngôn ngữ chính: WGSL/CSS/…> | JavaScript**, mỗi tab có Prism syntax highlight đúng `language-*`. KHÔNG dùng lại pattern cũ "chỉ 1 nút ⟨⟩ Xem Code" cho bài mới — đó là pattern lỗi thời trước WebGPU.
5. **Không còn markdown thô chưa convert.** Quét toàn bộ nội dung bài để chắc chắn không còn `**text**` (phải là `<strong>text</strong>`) hay `` `code` `` (phải là `<code>code</code>`) hiển thị dưới dạng ký tự thô. Grep từng file mới để tự rà trước khi commit.
6. **Thêm vào ROOT `index.html` (không phải `blog/index.html`).** Sau khi 1 series có bài đầu tiên hoàn thành, thêm 1 `a.learn-card` vào section "Programming Courses" của **`index.html` ở thư mục gốc** (khác với `blog/index.html` — dễ nhầm lẫn, đã từng bị bỏ sót). Card gồm `.learn-card__tag`, `h3.learn-card__title`, `p.learn-card__desc` (dùng `data-i18n`, không phải `data-lang-content`). Đối chiếu số lượng `learn-card` ở root `index.html` phải luôn khớp số lượng `blog-card` series ở `blog/index.html`.
7. **⚠️ CHỈ TIẾNG VIỆT cho series mới, không song ngữ EN/VI (áp dụng từ series DSA, 2026-07-03).** Nội dung bài (`.article-hero` title/meta/back-link, `.article-body`, `.article-related`) viết 1 khối tiếng Việt duy nhất, KHÔNG dùng cặp `data-lang-content="en"`/`"vi"` và KHÔNG cần nút toggle ngôn ngữ cho nội dung bài. Header/footer/nav vẫn giữ `data-i18n` (chrome dùng chung toàn site, không đổi). Các series cũ (C, C++, JS, Canvas, WebGL, Bash, WebGPU, CSS) đã lỡ làm song ngữ/VI-stub thì giữ nguyên, KHÔNG cần viết lại — quy tắc này chỉ áp dụng cho nội dung viết mới từ đây trở đi.

## 0. Quy ước slug thư mục & ID series

| #   | Series                    | Thư mục          | File hub                           | Tag class CSS | Số bài |
| --- | ------------------------- | ---------------- | ---------------------------------- | ------------- | ------ |
| 1   | WebAssembly & Rust        | `blog/wasm/`     | `wasm-programming-series.html`     | `--wasm`      | 10     |
| 2   | WebGPU                    | `blog/webgpu/`   | `webgpu-programming-series.html`   | `--webgpu`    | 10     |
| 3   | DS & Giải Thuật Trực Quan | `blog/algo/`     | `algo-programming-series.html`     | `--algo`      | 12     |
| 4   | WebRTC & WebSocket        | `blog/realtime/` | `realtime-programming-series.html` | `--rtc`       | 8      |
| 5   | Toy JS Engine             | `blog/toyjs/`    | `toyjs-programming-series.html`    | `--toyjs`     | 8      |
| 6   | CSS & Animation           | `blog/css/`      | `css-programming-series.html`      | `--css`       | 10     |
| 7   | SQL (SQLite-WASM)         | `blog/sql/`      | `sql-programming-series.html`      | `--sql`       | 8      |
| 8   | Web Audio API             | `blog/audio/`    | `audio-programming-series.html`    | `--audio`     | 8      |
| 9   | Git                       | `blog/git/`      | `git-programming-series.html`      | `--git`       | 8      |

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

## 2. Checklist cho MỖI series (lặp lại 9 lần)

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

Mỗi file `<series>-<topic>.html` phải có đủ:

- [ ] **`<head>`**: `<title>Bài N: … — js-tools</title>`, `<meta name="description">`, `<link rel="canonical" href="https://js-tools.org/blog/<series>/<file>" />` (không `.html`), OG/Twitter tags, JSON-LD `Article`/`TechArticle`, link CSS: `../blog.css`, `../ide.css`, `../prism.css`.
- [ ] **Header** hamburger nav + **Footer** full nav: copy nguyên văn từ file chuẩn (kèm `data-i18n` nav, AdSense slot).
- [ ] **`.article-hero`**: back-link về hub (song ngữ), `h1.article-hero__title` (2 bản EN/VI), `.article-hero__meta` (ngày + "X phút đọc", song ngữ).
- [ ] **`.article-body`**: 2 khối song song `div[data-lang-content="en"]` và `div[data-lang-content="vi"]` chứa toàn bộ nội dung CS chuyên sâu theo đề cương Phần I. Code block bọc Prism (`<pre><code class="language-…">`).
- [ ] **Demo tương tác**: nhúng visualizer (`<canvas>`/`<svg>` + script inline, hoặc iframe tới file demo) **bọc trong component `.code-tabs`** với tab **Xem trước (Preview) | <ngôn ngữ chính> | JavaScript** — pattern chuẩn từ WebGPU/CSS series (KHÔNG dùng lại nút `⟨⟩ Xem Code` đơn lẻ kiểu series cũ). Xem chi tiết ở "🚫 Điều kiện chặn" #4.
- [ ] **`js-playground`** (nếu hợp): textarea nhập code + ô log console output (chỉ với bài chạy được JS thuần).
- [ ] **Quiz**: 2–3 câu trắc nghiệm dùng `ide.js`/`ide.css` (pattern "Trắc nghiệm N").
- [ ] **Link tải code**: "Tải file code thực hành" trỏ tới file co-located.
- [ ] **`.article-related`**: link bài trước/sau + về hub (song ngữ).
- [ ] **`.article-discuss`** + widget **giscus** (map đúng repo/category).
- [ ] Chạy Prettier (`npx prettier --write`) trước khi commit.

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

> ⚠️ Ràng buộc "no build step": với Rust/Wasm phải **commit sẵn artifact `.wasm`** (build offline), trang chỉ `fetch()` + `instantiate`. Không thêm toolchain vào CI/Cloudflare.

## 5. Tích hợp toàn cục (sau khi xong mỗi series)

- [ ] **`blog/index.html`**: thêm 1 `a.blog-card` trỏ tới `<series>/<series>-programming-series` với `span.blog-card__tag--<x>`, tiêu đề + excerpt song ngữ (`data-lang-content`), `.blog-card__meta`, "Start learning → / Bắt đầu học →". Đặt cùng nhóm các series lập trình.
- [ ] **⚠️ ROOT `index.html`** (thư mục gốc, KHÁC `blog/index.html`): thêm 1 `a.learn-card` vào section "Programming Courses" — xem chi tiết & lý do ở mục "🚫 Điều kiện chặn" #6 phía trên. Bước này đã bị bỏ sót ở WebGPU/CSS series trước đây, luôn kiểm tra lại số lượng card khớp giữa 2 file.
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

- [ ] Mở `npx serve -l 5500 .`, duyệt hub → từng bài → visualizer, không lỗi console.
- [ ] Toggle ngôn ngữ EN/VI: mọi khối hiển thị đúng, không sót khối nào.
- [ ] Responsive: mobile <600px, hamburger <880px, desktop.
- [ ] Nút "⟨⟩ Xem Code" fetch & highlight đúng; quiz chấm đúng; link tải code trả 200.
- [ ] Tìm kiếm trên `blog/index.html` ra được bài mới (đã có trong search-index).
- [x] **giscus** load đúng (không lỗi console), không còn request `facebook.net` (ĐÃ HOÀN THÀNH); sitemap không trùng/sai URL.
- [ ] Prettier sạch toàn bộ file mới.

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

## Series 2 — WebGPU

- [x] **Bài 1 — Kiến trúc GPU & WebGPU Setup:** 1.1 Massively Parallel Processing & SIMT · 1.2 `navigator.gpu`, adapter, `GPUDevice` · 1.3 Swap chain & canvas context · 1.4 Vẽ tam giác đầu tiên (render pipeline).
- [x] **Bài 2 — Lập trình Shader với WGSL:** 2.1 Cú pháp WGSL & kiểu dữ liệu · 2.2 Vertex→Fragment qua location bindings · 2.3 Built-in `@builtin` & interpolation · 2.4 Gradient động theo `uniform time`.
- [x] **Bài 3 — Uniform & Storage Buffers:** 3.1 Tạo & ghi GPUBuffer · 3.2 Quy tắc alignment (std140-like) của struct · 3.3 BindGroup & BindGroupLayout · 3.4 Biến đổi model bằng ma trận trên GPU.
- [x] **Bài 4 — Pipeline State & Depth Testing:** 4.1 Rasterizer & primitive topology · 4.2 Depth buffer & z-fighting · 4.3 Khử răng cưa MSAA · 4.4 Khối Rubik 3D với depth chuẩn.
- [x] **Bài 5 — Phong Lighting & Shadow Maps:** 5.1 Mô hình Phong (ambient/diffuse/specular) · 5.2 Pháp tuyến & không gian thế giới · 5.3 Shadow Map qua FBO depth pass · 5.4 Bóng đổ real-time theo nguồn sáng.
- [x] **Bài 6 — Compute Shader & Threading:** 6.1 Workgroups & local/global invocation ID · 6.2 Storage buffer read/write trong compute · 6.3 Barrier & shared memory · 6.4 Nhân ma trận song song vs CPU.
- [x] **Bài 7 — Mô phỏng 100k Hạt trên GPU:** 7.1 Lưu trạng thái hạt trong Storage Buffer · 7.2 Cập nhật vị trí/vận tốc bằng compute · 7.3 Tránh round-trip qua PCIe/CPU · 7.4 Instanced render hàng vạn hạt.
- [x] **Bài 8 — SPH Fluid Simulation:** 8.1 Smoothed Particle Hydrodynamics tổng quan · 8.2 Tính mật độ & áp suất hạt · 8.3 Spatial hashing tìm lân cận · 8.4 Lực tương tác chuột tạo sóng.
- [x] **Bài 9 — glTF 3D Model Loading:** 9.1 Cấu trúc nhị phân glTF/GLB (buffers/accessors) · 9.2 Nạp thẳng vào GPU Buffer · 9.3 Vật liệu & texture cơ bản · 9.4 Xoay/zoom mô hình.
- [x] **Bài 10 — Dự án: ColorQuarium 3D:** 10.1 Instanced rendering 1 lệnh vẽ nhiều mesh · 10.2 Animation đàn cá bằng compute · 10.3 Ánh sáng & nền chất lỏng · 10.4 Tối ưu FPS cuối.

## Series 3 — DS & Giải Thuật Trực Quan

- **Bài 1 — Xoay cây AVL & Red-Black:** 1.1 BST & bài toán mất cân bằng · 1.2 Hệ số cân bằng & xoay đơn/kép · 1.3 Luật tô màu & xoay của Red-Black · 1.4 Hoạt ảnh xoay từng bước.
- **Bài 2 — Pathfinding Dijkstra & A\*:** 2.1 Biểu diễn đồ thị & priority queue · 2.2 Dijkstra lan vùng theo trọng số · 2.3 Heuristic Manhattan/Euclid của A\* · 2.4 So sánh số ô duyệt trên mê cung.
- **Bài 3 — Quy Hoạch Động Trực Quan:** 3.1 Bài toán con trùng & memoization · 3.2 Bottom-up & bảng trạng thái · 3.3 Truy vết nghiệm (backtracking path) · 3.4 Edit Distance / Knapsack động.
- **Bài 4 — B-Tree Database Index:** 4.1 Vì sao DB dùng B-Tree (đọc/ghi đĩa) · 4.2 Bậc cây & quy tắc khoá/con · 4.3 Tách (split) & gộp (merge) node · 4.4 Hoạt ảnh chèn/xoá theo trang.
- **Bài 5 — Memory Allocator Visualizer:** 5.1 Heap & free list · 5.2 First-fit/Best-fit · 5.3 Phân mảnh trong/ngoài · 5.4 Mô phỏng `malloc`/`free` trực quan.
- **Bài 6 — Hash Table & Va chạm:** 6.1 Hàm băm & phân phối · 6.2 Linear/Quadratic Probing · 6.3 Chaining & load factor/rehash · 6.4 Trực quan bước nhảy dò tìm.
- **Bài 7 — Huffman Data Compression:** 7.1 Tần suất ký tự & cây tham lam · 7.2 Mã hoá tiền tố (prefix-free) · 7.3 Encode/Decode bitstream · 7.4 Dựng cây Huffman động.
- **Bài 8 — Dự án: Algorithm Playground:** 8.1 Framework điều khiển bước (step/sleep) · 8.2 Lớp vẽ node/edge tái dùng · 8.3 Log giải thích đồng bộ hoạt ảnh · 8.4 Gộp tất cả thuật toán vào 1 trang.

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

## Series 6 — CSS & Animation

- [x] **Bài 1 — Box Model & Cơ chế dàn trang:** 1.1 content/padding/border/margin & `box-sizing` · 1.2 Margin collapsing · 1.3 Block/inline/inline-block flow · 1.4 Stacking context & `z-index`.
- [x] **Bài 2 — Flexbox toàn tập:** 2.1 Trục chính/phụ & `flex-direction` · 2.2 `grow/shrink/basis` · 2.3 `justify`/`align`/`gap` · 2.4 `wrap` & `order`.
- [x] **Bài 3 — CSS Grid 2 chiều:** 3.1 `grid-template-rows/cols` & `fr` · 3.2 `minmax`/`repeat`/`auto-fit` · 3.3 Named lines & areas · 3.4 Auto-placement & dense.
- [x] **Bài 4 — Transition & Easing:** 4.1 Thuộc tính transition & timing · 4.2 `cubic-bezier` & steps · 4.3 Reflow vs compositor-only props · 4.4 Trigger & `transition-delay`.
- [x] **Bài 5 — Keyframes & Hoạt ảnh phức:** 5.1 `@keyframes` & phần trăm · 5.2 `animation-*` shorthand & `fill-mode` · 5.3 Chaining/delay nhiều animation · 5.4 `steps()` cho sprite.
- [x] **Bài 6 — Transform 2D/3D & Perspective:** 6.1 translate/rotate/scale/skew · 6.2 `transform-origin` & order · 6.3 `perspective` & `preserve-3d` · 6.4 `backface-visibility` (card lật).
- [x] **Bài 7 — Scroll-Driven Animation:** 7.1 `animation-timeline: scroll()` · 7.2 `view()` & ranges · 7.3 Parallax không JS · 7.4 Hiệu năng & fallback.
- [x] **Bài 8 — View Transitions & Container Queries:** 8.1 `view-transition-name` & morph · 8.2 `::view-transition` pseudo · 8.3 `@container` & container-type · 8.4 Component tự thích ứng.
- [x] **Bài 9 — Hiệu năng & Accessibility:** 9.1 Compositor layers & `will-change` · 9.2 Tránh layout thrashing · 9.3 Repaint/reflow đo bằng DevTools · 9.4 `prefers-reduced-motion`.
- [x] **Bài 10 — Dự án: CSS Loader Lab:** 10.1 Spinner bằng keyframe+transform · 10.2 Skeleton bằng gradient động · 10.3 `clip-path` illustration · 10.4 Nút copy CSS từng mẫu.

## Series 7 — SQL (SQLite-WASM)

- **Bài 1 — Mô hình quan hệ & SELECT:** 1.1 Bảng/hàng/cột & kiểu SQLite · 1.2 `WHERE` & toán tử · 1.3 `ORDER BY`/`LIMIT`/`OFFSET` · 1.4 Nạp dataset & chạy query.
- **Bài 2 — JOIN toàn tập:** 2.1 Khoá chính/ngoại · 2.2 INNER/LEFT/RIGHT/FULL · 2.3 CROSS JOIN & tích Descartes · 2.4 Self-join & alias.
- **Bài 3 — Aggregate & GROUP BY:** 3.1 `COUNT/SUM/AVG/MIN/MAX` · 3.2 `GROUP BY` nhóm dữ liệu · 3.3 `HAVING` vs `WHERE` · 3.4 Biểu đồ từ kết quả.
- **Bài 4 — Subquery & CTE:** 4.1 Subquery vô hướng/tương quan · 4.2 `IN`/`EXISTS` · 4.3 `WITH` (CTE) · 4.4 CTE đệ quy (cây danh mục).
- **Bài 5 — Index & Query Plan:** 5.1 B-Tree index hoạt động · 5.2 `EXPLAIN QUERY PLAN` · 5.3 Full scan vs index seek · 5.4 Composite & covering index.
- **Bài 6 — Window Functions:** 6.1 `OVER(PARTITION BY)` · 6.2 `ROW_NUMBER/RANK/DENSE_RANK` · 6.3 `LAG/LEAD` · 6.4 Running total/moving average.
- **Bài 7 — Transaction & ACID:** 7.1 `BEGIN/COMMIT/ROLLBACK` · 7.2 Tính nguyên tử & isolation · 7.3 Ràng buộc (UNIQUE/FK/CHECK) · 7.4 Demo rollback khi vi phạm.
- **Bài 8 — Dự án: Mini Analytics Dashboard:** 8.1 Lưu DB vào IndexedDB · 8.2 Query→chart pipeline · 8.3 Import/export `.sqlite` · 8.4 Chạy 100% offline.

## Series 8 — Web Audio API

- **Bài 1 — AudioContext & Đồ thị âm thanh:** 1.1 Node graph & routing · 1.2 Lifecycle & autoplay policy · 1.3 `AudioParam` & thời gian · 1.4 Phát tone bằng Oscillator.
- **Bài 2 — Oscillator & Synthesis:** 2.1 Dạng sóng sine/square/saw/triangle · 2.2 Tần số & detune · 2.3 ADSR envelope qua GainNode · 2.4 Mini synth bàn phím.
- **Bài 3 — Gain, Filter & Hiệu ứng:** 3.1 GainNode & mixing · 3.2 BiquadFilter (low/high/band-pass) · 3.3 `DelayNode` echo · 3.4 `ConvolverNode` reverb.
- **Bài 4 — AnalyserNode & FFT:** 4.1 Biến đổi Fourier tổng quan · 4.2 `getByteFrequencyData` · 4.3 `getByteTimeDomainData` · 4.4 Vẽ spectrum/waveform trên Canvas.
- **Bài 5 — Phát & xử lý file/Mic:** 5.1 `decodeAudioData` & buffer source · 5.2 `MediaElementSource` · 5.3 `getUserMedia` mic input · 5.4 Đo âm lượng (RMS).
- **Bài 6 — Spatial & Stereo Audio:** 6.1 `StereoPannerNode` · 6.2 `PannerNode` & mô hình HRTF · 6.3 Vị trí/hướng nguồn & listener · 6.4 Demo nguồn âm di chuyển.
- **Bài 7 — AudioWorklet & DSP tuỳ biến:** 7.1 Luồng audio render riêng · 7.2 Viết `AudioWorkletProcessor` · 7.3 Truyền tham số qua port · 7.4 Bitcrusher/noise generator.
- **Bài 8 — Dự án: Music Visualizer:** 8.1 Pipeline FFT→particle · 8.2 Beat detection cơ bản · 8.3 Ánh xạ tần số→màu/hình · 8.4 Reactive theo nhạc.

## Series 9 — Git

- **Bài 1 — Mô hình đối tượng Git:** 1.1 Blob/Tree/Commit · 1.2 Content-addressable & SHA · 1.3 Snapshot vs diff · 1.4 Xem cấu trúc `.git/objects`.
- **Bài 2 — Three Trees & Staging:** 2.1 Working Dir/Index/HEAD · 2.2 `add` đưa vào staging · 2.3 `commit` tạo snapshot · 2.4 `status`/`diff` đọc trạng thái.
- **Bài 3 — Branch & HEAD:** 3.1 Branch là con trỏ · 3.2 HEAD & detached HEAD · 3.3 `checkout`/`switch` · 3.4 Fast-forward.
- **Bài 4 — Merge & Conflict:** 4.1 Merge base & three-way merge · 4.2 Fast-forward vs merge commit · 4.3 Phát sinh xung đột · 4.4 Giải & đánh dấu conflict.
- **Bài 5 — Rebase & History viết lại:** 5.1 Rebase vs merge · 5.2 `--onto` · 5.3 Interactive (squash/fixup/reorder) · 5.4 Golden rule (không rebase nhánh public).
- **Bài 6 — Undo & Phục hồi:** 6.1 `reset --soft/mixed/hard` · 6.2 `revert` · 6.3 `reflog` cứu commit · 6.4 `stash`.
- **Bài 7 — Remote & Collaboration:** 7.1 `fetch`/`pull`/`push` · 7.2 Tracking branch & upstream · 7.3 Diverge & sync · 7.4 Mô hình PR & merge vs rebase khi team.
- **Bài 8 — Dự án: Git Kata Trainer:** 8.1 Định nghĩa graph đích · 8.2 Parser lệnh giả lập · 8.3 Chấm điểm theo graph kết quả · 8.4 Bộ thử thách tăng dần.

---

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

| Từ series               | Liên kết tới                                    | Vì khái niệm chung        |
| ----------------------- | ----------------------------------------------- | ------------------------- |
| WebGPU · Compute Shader | WASM · Đa luồng; DSA · Pathfinding              | Song song hoá / GPGPU     |
| WASM · SIMD/Threading   | Canvas · Pixel; WebGL · Performance             | Tối ưu pixel/vector       |
| Toy JS Engine           | JS · Engine & Execution; JS · Scope             | Call stack, closure, AST  |
| DSA · Hash/B-Tree       | SQL · Index & Query Plan; C · Data Structures   | B-Tree, hashing           |
| Web Audio · FFT         | Canvas · Data Visualization; WebGPU · Particles | Vẽ phổ, reactive          |
| CSS · Transform 3D      | WebGL · Coordinate & Math                       | Ma trận biến đổi          |
| Git · Object Model      | C · Pointers; DSA · Huffman                     | DAG, content-address, nén |

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

- [ ] Đạt **toàn bộ** rubric §2.
- [ ] Mỗi mục H2 trả lời đủ 4 câu hỏi §1.
- [ ] Có `.article-refs` ≥3 link ngoài hợp lệ (mở tab mới).
- [ ] Có ≥3 cross-link nội bộ theo bản đồ §4.
- [ ] Có ≥3 callout, glossary/`<abbr>` cho thuật ngữ mới.
- [ ] Đối chiếu lại độ sâu với 1 bài chuẩn của series cũ (vd `c-data-structures`, `cpp-move-semantics`) — không được nông hơn.
