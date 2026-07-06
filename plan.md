# Kế Hoạch & Lộ Trình Phát Triển Các Series Bài Học Mới — js-tools.org

Tài liệu này cung cấp **định hướng chi tiết, ngăn xếp công nghệ (tech stack), thiết kế giao diện demo tương tác và nội dung học thuật chuyên sâu** cho từng bài học trong 5 series mới để phục vụ thẩm định trước khi triển khai thực tế.

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
| Series 10                        | Điện Tử & Mô Phỏng Vi Mạch              | 7/16           | 16       | 44%         |
| Series 11                        | Thiết Kế Vi Mạch Số & FPGA (VLSI)       | 0/14           | 14       | 0%          |

### DSA Series Lessons

| Bài | Tên                           | Status  | Link                                         |
| --- | ----------------------------- | ------- | -------------------------------------------- |
| 1   | Xoay Cây AVL & Red-Black      | ✅ Done | `/blog/algo/algo-avl-redblack-tree`          |
| 2   | Pathfinding Dijkstra & A\*    | ✅ Done | `/blog/algo/algo-pathfinding-dijkstra-astar` |
| 3   | Sorting Algorithms Visualizer | ✅ Done | `/blog/algo/algo-sorting-visualizer`         |
| 4   | Trie (Cấu trúc từ điển)       | ✅ Done | `/blog/algo/algo-trie-prefix-tree`           |
| 5   | Union-Find / Disjoint Set     | ✅ Done | `/blog/algo/algo-union-find`                 |
| 6   | Segment Tree / Fenwick Tree   | ✅ Done | `/blog/algo/algo-segment-tree`               |
| 7   | Quy Hoạch Động Trực Quan      | ✅ Done | `/blog/algo/algo-dynamic-programming`        |
| 8   | B-Tree Database Index         | ✅ Done | `/blog/algo/algo-btree-database-index`       |
| 9   | Memory Allocator Visualizer   | ✅ Done | `/blog/algo/algo-memory-allocator`           |
| 10  | Hash Table & Va Chạm          | ✅ Done | `/blog/algo/algo-hash-table-collision`       |
| 11  | Huffman Data Compression      | ✅ Done | `/blog/algo/algo-huffman-compression`        |
| 12  | Dự án: Algorithm Playground   | ✅ Done | `/blog/algo/algo-playground-project`         |

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

- **Engine:** `sql.js` (SQLite biên dịch sang WebAssembly) — commit sẵn artifact `.wasm`, không build runtime. Bài 15 giới thiệu thêm official SQLite WASM (OPFS) ở mức khái niệm/so sánh.
- **Lưu trữ:** IndexedDB/`localStorage` để persist DB giữa các phiên; import/export file `.sqlite`.
- **Giao diện:** Vanilla JS + bảng HTML render kết quả, tái dùng pattern IDE console sẵn có.
- **Lab tại nhà (hybrid):** Bài 2 hướng dẫn setup Docker PostgreSQL + `psql` + `sqlite3` CLI một lần. Các bài đánh dấu 🐳 (9, 11, 15, 16) có mục "Thực hành với Docker" chuyên sâu cho những khái niệm browser không demo nổi: isolation level đa kết nối, lock contention, disk I/O/fsync, WAL reader-writer đồng thời, so sánh optimizer PostgreSQL. Demo browser vẫn là xương sống tương tác của mọi bài.
- **Định hướng đối tượng:** nửa đầu nền tảng có chiều sâu; nửa sau chuyên sâu cho người có kinh nghiệm — optimizer, internals, virtual table, FTS5, performance, WAL/OPFS.

### 1b. Chuẩn biên tập BẮT BUỘC cho series này (khác các series trước)

> Yêu cầu trực tiếp từ chủ blog (2026-07-04). Mọi phiên làm việc viết bài SQL phải tuân theo, KHÔNG áp dụng template ngắn ~1.000 từ của các series Web Audio/Git/DSA trước đây.

- **Độ học thuật như sách chuyên nghiệp:** không ràng buộc số lượng câu chữ. Viết đủ sâu như một chương sách — cơ chế bên trong, edge case, trade-off — không dừng ở mức giới thiệu khái niệm.
- **Mỗi tính năng phải xuất hiện trong NHIỀU tình huống khác nhau** (tối thiểu 3-4 ngữ cảnh/tính năng, không phải 1 ví dụ duy nhất như trước). Ví dụ dạy `HAVING`: lọc doanh thu theo nhóm khách + tìm sản phẩm trùng lặp + phát hiện dữ liệu bất thường + kết hợp window function — người học thấy cùng một công cụ giải nhiều bài toán khác nhau.
- **Lặp lại có chủ đích qua các ngữ cảnh khác nhau:** tính năng đã dạy ở bài trước phải được dùng lại tự nhiên trong các bài sau (spaced repetition) để người học nắm sâu và thấy tầm quan trọng thực tế của nó.
- **Nhiều sân chơi tương tác/bài** khi nội dung cần (không giới hạn 1 demo/bài), quiz nhiều hơn 3 câu khi lượng kiến thức xứng đáng.
- **Mỗi tình huống ví dụ phải là bài toán thật** (doanh thu, log, phân quyền, tồn kho...) chứ không phải bảng foo/bar trừu tượng.

### 2. Thiết kế Demo tương tác cốt lõi (Core Visualizer Demo)

- **Tên: "In-Browser SQL Workbench"**
- **Mô tả giao diện:**
  - Trên: Editor SQL (gõ query, Ctrl+Enter chạy), nút nạp dataset mẫu (Chinook/Northwind rút gọn).
  - Giữa: Bảng kết quả phân trang + thời gian thực thi (ms) + số dòng.
  - Dưới: Trình xem sơ đồ quan hệ (ERD) các bảng và — với câu SELECT — hiển thị `EXPLAIN QUERY PLAN` để thấy index có được dùng hay không.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                                    | Nội dung chuyên sâu                                                           | Dự án/Demo đi kèm                                                                                                 |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | **Mô hình quan hệ & SELECT**                   | Bảng/hàng/cột, `WHERE`, `ORDER BY`, `LIMIT`, kiểu dữ liệu SQLite.             | Chạy query đầu tiên trên dataset mẫu trong browser.                                                               |
| 2   | **Môi trường thực hành kép: Browser + Docker** | Docker PostgreSQL + `psql`, `sqlite3` CLI, bản đồ dialect SQLite↔PostgreSQL.  | Setup 1 lần dùng cả series: workbench browser + lab Docker tại nhà.                                               |
| 3   | **JOIN toàn tập**                              | INNER/LEFT/RIGHT/FULL/CROSS, khoá ngoại, lỗi tích Descartes.                  | Visualizer Venn minh hoạ từng loại JOIN trên dữ liệu thật.                                                        |
| 4   | **Aggregate & GROUP BY**                       | `COUNT/SUM/AVG`, `GROUP BY`, `HAVING` vs `WHERE`.                             | Bảng tổng hợp doanh thu + biểu đồ cột từ kết quả query.                                                           |
| 5   | **Subquery & CTE**                             | Subquery tương quan, `WITH`, đệ quy CTE (cây phả hệ).                         | Demo CTE đệ quy duyệt cây danh mục lồng nhau.                                                                     |
| 6   | **Graph Queries bằng CTE Đệ Quy**              | Transitive closure, đường đi ngắn nhất, phát hiện chu trình thuần SQL.        | Đồ thị mạng lưới chuyến bay: tìm đường bay rẻ nhất bằng 1 câu SQL.                                                |
| 7   | **Window Functions**                           | `ROW_NUMBER`, `RANK`, `LAG/LEAD`, `OVER(PARTITION BY)`.                       | Bảng xếp hạng & running total trực quan.                                                                          |
| 8   | **Index & Query Plan**                         | B-Tree index, `EXPLAIN QUERY PLAN`, full scan vs index seek.                  | So sánh thời gian query trước/sau khi tạo index.                                                                  |
| 9   | **Query Optimizer Sâu** 🐳                     | `ANALYZE` & statistics, thứ tự join, partial/expression index, bytecode VDBE. | Bytecode viewer + Docker lab: so sánh `EXPLAIN ANALYZE` của PostgreSQL.                                           |
| 10  | **SQLite Internals: B-Tree & File Format**     | Cấu trúc page, varint, record format, overflow page, freelist.                | Page viewer đọc hex thật của file `.sqlite` ngay trong browser.                                                   |
| 11  | **Transaction & ACID** 🐳                      | `BEGIN/COMMIT/ROLLBACK`, isolation level, ràng buộc toàn vẹn.                 | Demo rollback browser + Docker lab: 2 terminal `psql` tranh chấp lock, non-repeatable read, isolation level thật. |
| 12  | **Trigger, View & Virtual Table**              | Trigger audit log, view như lớp trừu tượng, cơ chế virtual table.             | Audit log tự động ghi mọi thay đổi + FTS3 tìm kiếm toàn văn + hàm SQL tuỳ biến đăng ký từ JavaScript.             |
| 13  | **JSON & Generated Columns**                   | Hàm JSON, `json_each`/`json_tree`, generated columns, index trên expression.  | Kho document JSON có index — truy vấn semi-structured nhanh như cột.                                              |
| 14  | **FTS5 Full-Text Search**                      | Inverted index, tokenizer, BM25 ranking, `highlight()`/`snippet()`.           | Search engine mini: tìm kiếm toàn văn tức thì trên nghìn bài viết.                                                |
| 15  | **Performance Engineering** 🐳                 | Prepared statements, batch insert, PRAGMA tuning, đo lường đúng cách.         | Benchmark 1 triệu dòng browser + Docker lab: disk I/O, fsync, page cache thật.                                    |
| 16  | **WAL & Persistence trong Browser** 🐳         | WAL mode, OPFS + Worker, sql.js vs wa-sqlite vs official WASM, COOP/COEP.     | So sánh chiến lược persist + Docker lab: reader/writer đồng thời trên WAL thật.                                   |
| 17  | **Dự án: Mini Analytics Dashboard**            | Ghép query + render chart, lưu DB vào IndexedDB/OPFS, export `.sqlite`.       | Dashboard phân tích dữ liệu chạy 100% offline trong browser.                                                      |

> 🐳 = bài có mục "Thực hành với Docker" chuyên sâu (bài tập trên PostgreSQL/sqlite3 CLI thật, những gì browser không demo nổi). Các bài còn lại thuần browser, zero-setup.

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
  - Ô nhập lệnh giả lập: `commit`, `branch`, `checkout`, `merge`, `rebase`, `cherry-pick`, `reset`, `bisect`, `tag` — vẽ lại graph tương ứng.
  - Panel phụ: trạng thái 3 cây (Working Dir / Staging / HEAD) và con trỏ refs (HEAD, branch tips) di chuyển trực quan.

### 3. Đề cương chi tiết từng bài học (Detailed Syllabus)

| Bài | Tên bài học                       | Nội dung chuyên sâu                                                                        | Dự án/Demo đi kèm                                                         |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 1   | **Mô hình đối tượng Git**         | Blob/Tree/Commit, content-addressable SHA-1/256, vì sao Git là snapshot không phải diff.   | Trình xem cấu trúc `.git/objects` của một commit mẫu.                     |
| 2   | **Three Trees & Staging**         | Working Directory, Index (staging), HEAD; vòng đời `add`/`commit`.                         | Visualizer file di chuyển qua 3 cây khi add/commit.                       |
| 3   | **Branch & HEAD**                 | Branch chỉ là con trỏ, HEAD tách rời (detached), fast-forward.                             | Graph tạo nhánh, di chuyển HEAD trực quan.                                |
| 4   | **Merge & Conflict**              | Three-way merge, merge base, cơ chế phát sinh & giải xung đột.                             | Demo merge tạo commit hợp nhất + tô vùng conflict.                        |
| 5   | **Rebase & History viết lại**     | Rebase vs merge, `--onto`, interactive rebase (squash/fixup/reorder).                      | So sánh graph trước/sau rebase cùng kịch bản.                             |
| 6   | **Cherry-pick — Chọn Lọc Commit** | Nhặt 1 commit cụ thể sang nhánh khác, cơ chế tạo commit MỚI cùng diff nhưng khác SHA.      | Đồ thị 2 nhánh, "nhặt" 1 commit từ nhánh B sang nhánh A, xem SHA đổi.     |
| 7   | **Undo & Phục hồi**               | `reset --soft/mixed/hard`, `revert`, `reflog` cứu commit mất, `stash`.                     | Demo "làm hỏng rồi cứu" bằng reflog.                                      |
| 8   | **Git Bisect — Tìm Commit Lỗi**   | Tìm kiếm nhị phân trên lịch sử commit (good/bad), `bisect run` tự động hoá.                | Danh sách commit giả lập giấu 1 "commit lỗi", hội tụ tìm thủ phạm.        |
| 9   | **Remote & Collaboration**        | `fetch`/`pull`/`push`, tracking branch, mô hình PR, rebase vs merge khi team work.         | Mô phỏng 2 remote đồng bộ, minh hoạ diverge & sync.                       |
| 10  | **Subtree & Submodule**           | Nhúng 1 repo trong repo khác: submodule (con trỏ commit) vs subtree (nhúng lịch sử).       | Mô phỏng repo chính + thư viện, so sánh trực quan 2 cách nhúng.           |
| 11  | **Hooks & Worktree**              | Git hooks tự động hoá (pre-commit/pre-push), `worktree` làm việc song song nhiều nhánh.    | Demo pre-commit hook chặn commit lỗi + visualizer 2 worktree song song.   |
| 12  | **Tags & Aliases Nâng Cao**       | Lightweight vs annotated tag, Semantic Versioning, `git alias`/`config` tuỳ biến workflow. | Bảng so sánh tag trực quan + "alias builder" ghép lệnh dài thành alias.   |
| 13  | **Dự án: Git Kata Trainer**       | Bộ thử thách: cho trạng thái graph đích, người học gõ lệnh để đạt được.                    | Trò chơi luyện Git chấm điểm tự động theo graph kết quả, tổng hợp 12 bài. |

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

| Bài | Tên bài học                                          | Nội dung chuyên sâu                                                                                                                                                                                                                                                                                          | Dự án/Demo đi kèm                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Đọc trị số linh kiện & Đo kiểm bằng VOM**          | Cách đọc mã màu điện trở (4/5 vòng màu), mã số tụ điện (104, 224), thông số cuộn cảm. Cách xác định các chân linh kiện bán dẫn (đi-ốt Anode/Cathode; BJT Emitter/Base/Collector; MOSFET Gate/Drain/Source). Cách dùng vạn năng kế VOM đo thế, dòng, trở, thông mạch và kiểm tra linh kiện hỏng.              | **Trình giả lập đồng hồ vạn năng ảo (Multimeter Simulator):** Người dùng cắm hai đầu que đo (đỏ/đen) vào các chân của linh kiện ngẫu nhiên trên testboard, xoay núm vạn năng kế đo thông số để tìm ra chân và xác định linh kiện tốt hay hỏng.         |
| 2   | **Định luật Ohm & Mạch cầu phân áp**                 | Khái niệm cơ bản $V, I, R$. Định luật Ohm $V = I \cdot R$. Công thức sụt thế và cầu phân áp (voltage divider). Chứng minh sự bảo toàn năng lượng trong mạch đơn giản.                                                                                                                                        | **Mạch chỉnh độ sáng đèn LED:** Dùng chiết áp (potentiometer) làm cầu phân thế chỉnh áp ngõ ra LED. Có công thức tính dòng $I_{LED} = \frac{V_{in} - V_{LED}}{R}$.                                                                                     |
| 3   | **Định luật Kirchhoff & Giải thuật mạng điện MNA**   | Định luật KCL (dòng nút) và KVL (áp vòng). Giới thiệu phương pháp thế nút Modified Nodal Analysis (MNA) giải hệ phương trình tuyến tính $A \cdot x = B$. Chứng minh định lý Kirchhoff bằng toán ma trận.                                                                                                     | **Sân chơi giải mạch tự động:** Người dùng thiết kế mạch điện bất kỳ, xem ma trận $A$ và vector $B$ được dựng động và giải bằng khử Gauss để tìm điện áp tại mọi nút.                                                                                  |
| 4   | **Linh kiện tích lũy & Hằng số thời gian RC/RL**     | Điện dung ($C$), Độ tự cảm ($L$). Viết phương trình vi phân mô tả tụ/cuộn cảm. Chứng minh công thức phóng nạp $v_C(t) = V_0(1 - e^{-t/RC})$. Hằng số thời gian $\tau = RC$ và $\tau = L/R$.                                                                                                                  | **Mạch trễ bật nguồn (Delay Timer):** Sử dụng nút bấm sạc tụ điện để trì hoãn đóng mở transistor kích đèn LED sáng/tắt. Biểu đồ nạp xả vẽ theo thời gian thực.                                                                                         |
| 5   | **Dòng điện xoay chiều AC & Trở kháng phức**         | Dạng sóng AC hình sin, tần số ($f$), điện áp RMS. Khái niệm số phức $j$ ứng dụng trong trở kháng phức ($Z_C = \frac{1}{j\omega C}$, $Z_L = j\omega L$). Chứng minh pha của tụ điện trễ pha $90^\circ$ so với áp.                                                                                             | **Mạch kiểm chứng độ lệch pha AC:** Đo điện áp và dòng điện trên mạch xoay chiều RC/RL bằng máy hiện sóng, vẽ giản đồ vector pha (Phasor diagram) xoay động trực quan.                                                                                 |
| 6   | **Cảm ứng điện từ & Máy biến áp (Transformer)**      | Định luật cảm ứng Faraday, hiện tượng tự cảm và hỗ cảm. Cấu trúc máy biến áp. Công thức tỉ số vòng dây $\frac{V_1}{V_2} = \frac{N_1}{N_2} = \frac{I_2}{I_1}$. Chứng minh bảo toàn công suất $P_{in} \approx P_{out}$.                                                                                        | **Mạch hạ thế AC:** Mô phỏng máy biến áp hạ dòng AC hình sin 220V xuống 12V AC. Cho phép kéo chỉnh số vòng dây cuộn sơ cấp/thứ cấp để quan sát dạng sóng ngõ ra lệch biên độ.                                                                          |
| 7   | **Đi-ốt & Mạch chỉnh lưu nguồn DC Linear**           | Tiếp giáp P-N, sụt áp thuận đi-ốt ($0.7\text{V}$). Chỉnh lưu nửa chu kỳ, toàn chu kỳ (Cầu đi-ốt) và công thức tính dung tích tụ lọc san phẳng gợn sóng điện áp: $C = \frac{I_{load}}{f \cdot V_{ripple}}$.                                                                                                   | **Bộ nguồn DC Linear 12V thực tế:** Chuyển đổi dòng 12V AC (từ Bài 6) thành nguồn 12V DC phẳng bằng cầu đi-ốt và tụ hóa lớn. Quan sát mức độ gợn sóng biến đổi theo điện trở tải, sau đó thêm tầng ổn áp Zener/7805 để so sánh ngõ ra phẳng hoàn toàn. |
| 8   | **Mạch lọc tần số (Filters) & Ứng dụng âm thanh**    | Bộ lọc thông thấp (Low-pass) và thông cao (High-pass) bậc 1 và 2. Công thức tần số cắt $f_c = \frac{1}{2\pi RC}$. Chứng minh hàm truyền đạt (transfer function) $H(f)$ bằng số phức, vẽ giản đồ Bode plot.                                                                                                   | **Mạch phân tần loa (Audio Crossover):** Mô phỏng bộ phân tần chia tín hiệu âm thanh hỗn hợp thành tần số thấp (cho loa Bass) và tần số cao (cho loa Treble), đo giản đồ Bode.                                                                         |
| 9   | **Transistor (BJT & MOSFET) & Mạch khuếch đại**      | Đặc tính linh kiện bán dẫn. Trạng thái ngắt, bão hòa và tuyến tính. Cấu hình khuếch đại cực phát chung (Common Emitter). Công thức tính độ lợi điện áp $A_v = -g_m \cdot R_C$. Chứng minh độ lệch pha $180^\circ$.                                                                                           | **Mạch khuếch đại micro:** Người dùng cấp tín hiệu hình sin biên độ nhỏ từ micro ($10\text{mV}$), quan sát transistor khuếch đại thành tín hiệu hình sin lớn ($1.5\text{V}$) ngược pha.                                                                |
| 10  | **Op-Amp & Comparator (Khuếch đại thuật toán)**      | Cấu trúc khuếch đại vi sai và độ lợi vòng hở $A_{OL}$. Hồi tiếp âm và hai "quy tắc vàng" (golden rules). Mạch khuếch đại đảo/không đảo, công thức độ lợi $A_v = 1 + \frac{R_f}{R_1}$. Bộ so sánh (Comparator) và mạch trễ Schmitt Trigger — nền tảng để hiểu khối so sánh bên trong IC 555 (Bài 14).         | **Mạch tiền khuếch đại & Comparator ánh sáng:** Kéo thanh trượt $R_f/R_1$ quan sát độ lợi thay đổi trên oscilloscope; ghép comparator với quang trở để tự động bật LED khi trời tối, chỉnh ngưỡng bằng cầu phân áp (Bài 2).                            |
| 11  | **Ăng-ten & Mạch thu phát vô tuyến (RF)**            | Sóng điện từ và nguyên lý bức xạ. Cấu trúc ăng-ten dipole/monopole. Công thức tính độ dài ăng-ten tối ưu $\lambda/2$ và $\lambda/4$ ($\lambda = c/f$). Hiện tượng cộng hưởng LC và công thức Thompson $f_0 = \frac{1}{2\pi\sqrt{LC}}$. Phối hợp trở kháng (impedance matching) ăng-ten để truyền tải tối đa. | **Mạch thu sóng Radio AM đơn giản:** Mô phỏng ăng-ten nhận sóng AM, xoay tụ biến dung $C$ để mạch cộng hưởng khớp tần số đài phát, thực hiện tách sóng bằng đi-ốt lấy lại tín hiệu âm thanh ban đầu.                                                   |
| 12  | **Cổng Logic & Mạch tổ hợp (Combinational)**         | Mức điện áp logic nhị phân. Thiết kế cổng NOT, AND, OR, XOR bằng CMOS thực tế. Đại số Boolean tính toán ngõ ra và giản đồ Karnaugh tối giản mạch logic. Ghép nối tạo bộ cộng bán phần/toàn phần (Half/Full Adder).                                                                                           | **Bộ cộng nhị phân 1-bit (Full Adder):** Lắp ghép các cổng logic ở mức transistor, cấp ngõ vào $A, B, C_{in}$ để kiểm chứng ngõ ra Tổng ($S$) và Số nhớ ($C_{out}$).                                                                                   |
| 13  | **Mạch tuần tự & Thiết kế bộ nhớ lưu trữ**           | Latch RS, D Flip-Flop. Hệ thống đồng bộ (xung clock). Thiết kế thanh ghi dịch (Shift Register), bộ đếm nhị phân (Counter). Ghép nối Flip-Flop tạo ô nhớ RAM tĩnh (SRAM cell - 6T SRAM). Công thức thời gian trễ và setup/hold time.                                                                          | **Thiết kế mạch ô nhớ SRAM:** Tạo mạch nhớ SRAM từ các cổng logic, điều khiển chân Write/Read, đổi chân Data để ghi nhớ và lưu trữ ổn định 1 bit dữ liệu.                                                                                              |
| 14  | **IC định thời 555 & Mạch tạo xung điều rộng (PWM)** | Nguyên lý hoạt động bên trong IC 555 (bộ so sánh comparator — đã học ở Bài 10, flip-flop, transistor xả). Chế độ dao động phi ổn định (Astable). Công thức tần số $f = \frac{1.44}{(R_1 + 2R_2)C}$ và chu kỳ nhiệm vụ (duty cycle).                                                                          | **Mạch điều khiển độ sáng bằng xung PWM:** IC 555 phát xung vuông điều khiển đóng cắt MOSFET để tăng giảm độ sáng đèn LED công suất lớn cực kỳ hiệu quả mà không tỏa nhiệt trên transistor.                                                            |
| 15  | **Kiến trúc vi điều khiển (MCU) & Giao tiếp GPIO**   | Cấu trúc MCU (CPU, SRAM, Flash, bus hệ thống). Memory-mapped I/O: thanh ghi cấu hình hướng (DDR) và xuất/nhập dữ liệu (PORT/PIN). Kỹ thuật đọc–sửa–ghi thanh ghi bằng phép toán bitwise. _Tiên quyết: Series C (Con trỏ & Bộ nhớ), biểu diễn nhị phân._                                                      | **Trình giả lập MCU viết code C/Assembly (phần 1):** Viết mã nhấp nháy LED (blink), cấu hình DDR/PORT, quan sát từng lệnh làm giá trị thanh ghi và trạng thái chân vật lý thay đổi trên MCU ảo.                                                        |
| 16  | **Ngắt, Timer & Dự án tổng hợp cuối series**         | Nguyên lý ngắt phần cứng: vector ngắt, trình phục vụ ISR, cờ ngắt và chống dội phím (debounce). Bộ đếm Timer, prescaler và cơ chế tạo xung PWM bằng phần cứng. Tổng ôn kiến thức toàn series qua một hệ hoàn chỉnh.                                                                                          | **Dự án tổng hợp — Trạm điều khiển LED thông minh:** MCU ảo xuất PWM (Bài 14) đóng ngắt MOSFET (Bài 9) chỉnh độ sáng LED hạn dòng (Bài 2), nguồn cấp từ mạch chỉnh lưu–ổn áp (Bài 7), nút nhấn kích ngắt đổi chế độ sáng.                              |

### 4. Tiêu chuẩn chất lượng & Bản đồ liên kết chéo (Quality Contract & Cross-links)

Mọi bài học trong Series 10 phải tuân thủ nghiêm ngặt tiêu chuẩn chất lượng tại `.agents/skills/design-new-series/references/quality-contract.md` với các yêu cầu đặc thù sau:

- **Độ dài và Chất lượng Học thuật:** Tối thiểu 1.500 từ tiếng Việt cho mỗi bài viết. Nội dung phải đi sâu vào bản chất vật lý, toán học và thiết kế kỹ thuật, tuyệt đối không viết sơ sài hay dùng văn phong mang tính chất giới thiệu chung chung.
- **Sơ đồ nguyên lý & Sơ đồ cấu tạo bán dẫn/vi vi mạch:** Mỗi bài học bắt buộc phải thiết kế ít nhất 1 sơ đồ nguyên lý mạch điện (schematic) bằng định dạng đồ họa vector SVG hoặc Canvas động để người đọc dễ hình dung. Đối với các bài về đi-ốt, transistor, cổng logic, ô nhớ SRAM hay vi mạch 555, bắt buộc phải vẽ sơ đồ cấu trúc bên trong (mặt cắt tiếp giáp P-N, sơ đồ cấu tạo transistor CMOS, sơ đồ khối mạch so sánh/latch 555, cấu trúc 6T SRAM).
- **Ví dụ tính toán số học & Chứng minh chi tiết (Step-by-step Calculations):** Mỗi bài phải bao gồm ít nhất 1 bài toán thực tế đi kèm các bước giải chi tiết bằng công thức toán học KaTeX. Ví dụ: Tính dòng điện hạn dòng cho LED ngõ ra; lập hệ phương trình ma trận MNA cho một mạch điện cụ thể; tính điện dung tụ lọc nguồn để giữ điện áp gợn sóng dưới mức cho phép; tính chiều dài vật lý của ăng-ten monopole cho tần số sóng vô tuyến; tính giá trị trở kháng phân tần loa; hay tính thời gian trễ của cổng logic.
- **Ví dụ code và Anti-patterns:** Tối thiểu 4 khối `.code-window` chạy được cho mỗi bài học, cấu trúc tăng dần độ khó kèm sơ đồ đấu nối anti-pattern (❌ Đấu sai/Không chạy được vs ✅ Đấu đúng/Chạy tốt) để người học tự rà lỗi thực tế (như cắm ngược cực đi-ốt, đấu thiếu Ground, quá dòng cháy transistor, thiếu điện trở kéo lên GPIO).
- **Chú thích & Callout:** Tối thiểu 3 callout (ít nhất 1 `--pitfall` về lỗi thường gặp như đấu sai chân, quên nối Ground, quá tải dòng điện).
- **Công thức:** Sử dụng KaTeX cục bộ, mỗi công thức phải có 1 câu giải thích rõ ràng ý nghĩa của các đại lượng ($V, I, R, C, L, f, \omega, Z$).
- **Bản đồ liên kết chéo (Cross-link Map):**
  - **Bài 2, 3** (Ohm, Kirchhoff, MNA) chéo với **DSA (B-Tree/Hash)** để so sánh cấu trúc đồ thị ma trận và hiệu năng thuật toán giải tuyến tính.
  - **Bài 4, 5, 7, 8** (RC, AC, Diode, Filters) chéo với **Web Audio API (FFT/Oscilloscope)** và **Canvas (Data Visualization)** để trực quan hóa tín hiệu, biên độ và tần số sóng âm AC.
  - **Bài 15, 16** (MCU/Registers/GPIO/Interrupt) chéo với **C/C++ (Pointers & Memory)** để giải thích cách con trỏ trỏ trực tiếp đến địa chỉ thanh ghi phần cứng và thực thi mã máy ảo.

### 5. Quy tắc thiết kế rút ra từ 2 vòng review Bài 1 (2026-07-05) — áp cho bài 2–16 & mọi series mới

> Bài 1 đã review 2 vòng và sửa xong (chi tiết trong lịch sử git: `3c0f4ea` → `334dae4` → `07441ba` → `860946c`). Lộ trình đã tái cấu trúc thành 16 bài như bảng §3 (đổi thứ tự khối analog vì lỗi phụ thuộc kiến thức: AC phải học trước biến áp/chỉnh lưu; RF chuyển sau transistor; thêm bài Op-Amp lấp lỗ hổng comparator cho bài 555; tách MCU thành 2 bài; bài 16 là capstone). Dưới đây là các quy tắc còn hiệu lực cho agent viết bài mới:

1. **KHÔNG dùng `<blockquote>[!NOTE]` kiểu GitHub-alert** — HTML tĩnh không render; dùng component `.callout--*` và CHỈ 5 class có thật trong `blog.css` (`--note/tip/warning/pitfall/deep`).
2. **Danh sách bước = `<ol>`/`<ul>` thật** — cấm dồn "1. … 2. …" hay "\* …" vào một `<p>` bằng `<br />`.
3. **Grep tự rà trước commit:** `data-lang-content`, `[!NOTE]`, `**` thô, class callout không tồn tại — tất cả phải = 0 trong `.article-body`. Lưu ý màu: trang bài nền TRẮNG (`.article-body strong` màu đen) — component có panel nền tối phải tự override màu `strong`/`code` bên trong (bài 1 từng dính, fix `860946c`).
4. **Tự đếm rubric TRƯỚC khi báo xong:** ≥4 `.code-window` chạy được + anti-pattern ❌/✅, ≥3 callout (≥1 pitfall), ≥3 `.article-refs`, ≥3 cross-link nội bộ, ≥1 schematic SVG (sơ đồ nguyên lý/timing/trạng thái — pinout KHÔNG tính). Đối chiếu đề cương từng ý nhỏ (N.1–N.4) trước khi viết dàn bài.
5. **Kiểm tra phụ thuộc kiến thức:** bài chỉ dùng khái niệm của bài số nhỏ hơn; nếu buộc dùng trước thì đóng khung "ví dụ nếm trước" + callout "sẽ học/chứng minh ở Bài N" (mẫu chuẩn: §4 Bài 1). **Lưu ý riêng Bài 4:** demo Delay Timer dùng transistor (Bài 9) → trình bày dạng "công tắc điện tử hộp đen" kèm callout forward-ref, hoặc đổi demo quan sát trực tiếp đường nạp tụ.
6. **Bài nặng toán scaffold cụ thể → trừu tượng:** Bài 3 giải tay mạch 2 nút bằng KCL/KVL trước rồi mới ma trận hoá MNA; Bài 5 ví dụ pha trễ cụ thể trước khi đưa số phức $j$.
7. **An toàn điện:** bài mô phỏng điện lưới 220V (Bài 6) hoặc đo áp cao bằng VOM phải có `.callout--warning` an toàn (mô phỏng ≠ thực hành).
8. **Simulator:** demo chỉ dùng linh kiện đã học tính đến bài đó; trạng thái đọc "0/OL hợp lệ" phải có chú thích ngay trên UI để người học không tưởng demo hỏng; mọi chế độ/nút có trên UI mà không mô phỏng được thì ghi chú giới hạn rõ ràng.
9. **Không thực hành code lập trình trong series điện tử:** Series này tập trung vào vật lý và mô phỏng mạch điện, không dạy lập trình phần mềm. Vì vậy, KHÔNG viết các bài thực hành code (ví dụ viết thuật toán giải ma trận bằng JS/C/C++). JavaScript chỉ được dùng dưới dạng engine chạy ngầm cho các demo tương tác và giả lập mạch điện (nếu có), không đưa vào làm nội dung thực hành lập trình.

---

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

**Điều kiện chặn bổ sung cho Series 11** (cộng với 7 điều kiện chặn chung Phần II):

8. Khối "📚 Điều kiện tiên quyết" hiện diện đầu MỌI bài, link đúng slug không đuôi `.html`.
9. Mọi ví dụ SV chạy được trên VeriLite hoặc ghi rõ "ngoài subset"; grep `data-lang-content` trong article-body = 0.
10. Sơ đồ đúng loại bài (§4) — netlist/timing/trạng thái/kiến trúc; pinout không tính.

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
- [ ] **Electronics** → `circuit-scope-lab.html`: canvas vẽ lưới mạch điện (nguồn DC/AC, trở, tụ, cuộn cảm, đi-ốt, transistor, cổng logic, LED) kéo thả + electron chạy trên dây dẫn + máy hiện sóng oscilloscope hiển thị dạng sóng điện áp/dòng điện thời gian thực.

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
- **Bài 2 — Môi trường thực hành kép: Browser + Docker:** 2.1 Vì sao cần cả 2 môi trường · 2.2 Docker PostgreSQL + `psql` từng bước · 2.3 `sqlite3` CLI & file `.sqlite` · 2.4 Bản đồ dialect SQLite↔PostgreSQL (kiểu dữ liệu, `RETURNING`, hàm ngày giờ).
- **Bài 3 — JOIN toàn tập:** 3.1 Khoá chính/ngoại · 3.2 INNER/LEFT/RIGHT/FULL · 3.3 CROSS JOIN & tích Descartes · 3.4 Self-join & alias.
- **Bài 4 — Aggregate & GROUP BY:** 4.1 `COUNT/SUM/AVG/MIN/MAX` · 4.2 `GROUP BY` nhóm dữ liệu · 4.3 `HAVING` vs `WHERE` · 4.4 Biểu đồ từ kết quả.
- **Bài 5 — Subquery & CTE:** 5.1 Subquery vô hướng/tương quan · 5.2 `IN`/`EXISTS` · 5.3 `WITH` (CTE) · 5.4 CTE đệ quy (cây danh mục).
- **Bài 6 — Graph Queries bằng CTE Đệ Quy:** 6.1 Mô hình đồ thị trong bảng quan hệ (edge list) · 6.2 Transitive closure · 6.3 Đường đi ngắn nhất & tránh chu trình vô hạn · 6.4 Demo mạng chuyến bay tìm đường rẻ nhất.
- **Bài 7 — Window Functions:** 7.1 `OVER(PARTITION BY)` · 7.2 `ROW_NUMBER/RANK/DENSE_RANK` · 7.3 `LAG/LEAD` · 7.4 Running total/moving average.
- **Bài 8 — Index & Query Plan:** 8.1 B-Tree index hoạt động · 8.2 `EXPLAIN QUERY PLAN` · 8.3 Full scan vs index seek · 8.4 Composite & covering index.
- **Bài 9 — Query Optimizer Sâu 🐳:** 9.1 `ANALYZE` & sqlite_stat1 · 9.2 Thứ tự join & selectivity · 9.3 Partial/expression index · 9.4 Đọc bytecode VDBE qua `EXPLAIN` đầy đủ · 9.5 Docker lab: `EXPLAIN ANALYZE` PostgreSQL & so sánh 2 optimizer.
- **Bài 10 — SQLite Internals: B-Tree & File Format:** 10.1 Header 100 byte & page size · 10.2 B-Tree interior/leaf page · 10.3 Record format & varint · 10.4 Overflow page & freelist — page viewer đọc hex thật.
- **Bài 11 — Transaction & ACID 🐳:** 11.1 `BEGIN/COMMIT/ROLLBACK` · 11.2 Tính nguyên tử & isolation level · 11.3 Ràng buộc (UNIQUE/FK/CHECK) · 11.4 Demo rollback khi vi phạm · 11.5 Docker lab: 2 terminal `psql` — lock contention, non-repeatable read, READ COMMITTED vs SERIALIZABLE thật.
- **Bài 12 — Trigger, View & Virtual Table:** 12.1 Trigger BEFORE/AFTER & audit log · 12.2 View như lớp trừu tượng, INSTEAD OF trigger cho updatable view · 12.3 Cơ chế virtual table (module xtable), demo FTS3 (bản sql.js chưa có FTS5 — xem Bài 14) · 12.4 Đăng ký hàm SQL tuỳ biến bằng JavaScript (`create_function`).
- **Bài 13 — JSON & Generated Columns:** 13.1 Hàm JSON (`json_extract`, `->`/`->>`) · 13.2 `json_each`/`json_tree` lateral · 13.3 Generated columns (VIRTUAL/STORED) · 13.4 Index trên expression cho document store.
- **Bài 14 — FTS5 Full-Text Search:** 14.1 Inverted index hoạt động · 14.2 Tokenizer (unicode61, trigram) · 14.3 BM25 ranking · 14.4 `highlight()`/`snippet()` — search engine mini.
- **Bài 15 — Performance Engineering 🐳:** 15.1 Prepared statement & bind · 15.2 Batch insert trong 1 transaction · 15.3 PRAGMA tuning (journal_mode, synchronous, cache_size) · 15.4 Benchmark 1 triệu dòng đúng phương pháp · 15.5 Docker lab: disk I/O & fsync thật — những gì browser không đo được.
- **Bài 16 — WAL & Persistence trong Browser 🐳:** 16.1 Rollback journal vs WAL · 16.2 OPFS + Worker & official SQLite WASM · 16.3 sql.js vs wa-sqlite vs official · 16.4 COOP/COEP & SharedArrayBuffer · 16.5 Docker lab: reader/writer đồng thời trên WAL, xem file `-wal`/`-shm` thật.
- **Bài 17 — Dự án: Mini Analytics Dashboard:** 17.1 Lưu DB vào IndexedDB/OPFS · 17.2 Query→chart pipeline · 17.3 Import/export `.sqlite` · 17.4 Chạy 100% offline.

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
- **Bài 6 — Cherry-pick — Chọn Lọc Commit:** 6.1 Vì sao cần cherry-pick (áp 1 fix mà không merge cả nhánh) · 6.2 Cơ chế tạo commit mới cùng diff, khác SHA · 6.3 Xử lý conflict khi pick · 6.4 Cờ `-x` ghi nguồn & rủi ro double-apply khi merge sau.
- **Bài 7 — Undo & Phục hồi:** 7.1 `reset --soft/mixed/hard` · 7.2 `revert` · 7.3 `reflog` cứu commit · 7.4 `stash`.
- **Bài 8 — Git Bisect — Tìm Commit Lỗi:** 8.1 Bài toán dò lỗi giữa hàng trăm commit · 8.2 Tìm kiếm nhị phân áp vào lịch sử (good/bad) · 8.3 `bisect start/good/bad`, tự động hoá bằng `bisect run` · 8.4 So sánh O(log n) vs dò tuần tự O(n).
- **Bài 9 — Remote & Collaboration:** 9.1 `fetch`/`pull`/`push` · 9.2 Tracking branch & upstream · 9.3 Diverge & sync · 9.4 Mô hình PR & merge vs rebase khi team.
- **Bài 10 — Subtree & Submodule:** 10.1 Bài toán nhúng repo trong repo (thư viện dùng chung) · 10.2 Submodule: con trỏ commit & `.gitmodules` · 10.3 Subtree: nhúng thẳng lịch sử vào cây thư mục · 10.4 So sánh ưu/nhược 2 hướng.
- **Bài 11 — Hooks & Worktree:** 11.1 Git hooks tự động hoá (pre-commit/pre-push/commit-msg) · 11.2 Use case chặn commit lỗi lint/test · 11.3 `worktree` checkout song song nhiều nhánh không cần clone lại · 11.4 So sánh worktree vs chuyển nhánh thông thường.
- **Bài 12 — Tags & Aliases Nâng Cao:** 12.1 Lightweight vs annotated tag (metadata, GPG sign) · 12.2 Semantic Versioning & quy ước tag release · 12.3 `git alias` rút gọn lệnh dài · 12.4 `git config` tuỳ biến hành vi (core.editor, pull.rebase...).
- **Bài 13 — Dự án: Git Kata Trainer:** 13.1 Định nghĩa graph đích · 13.2 Parser lệnh giả lập · 13.3 Chấm điểm theo graph kết quả · 13.4 Bộ thử thách tăng dần, tổng hợp 12 bài trước.

## Series 10 — Điện Tử & Mô Phỏng Vi Mạch

- **Bài 1 — Đọc trị số linh kiện & Đo kiểm bằng VOM:** 1.1 Đọc vòng màu điện trở và mã số tụ điện/cuộn cảm · 1.2 Nhận diện chân linh kiện bán dẫn (Diode, BJT, MOSFET, IC) · 1.3 Sử dụng đồng hồ vạn năng VOM đo dòng/áp/trở kháng · 1.4 Thực hành đo thông mạch kiểm tra linh kiện hỏng.
- **Bài 2 — Định luật Ohm & Mạch cầu phân áp:** 2.1 Khái niệm cơ bản dòng điện ($I$), điện áp ($V$), điện trở ($R$) · 2.2 Định luật Ohm $V = I \cdot R$ & Chứng minh sự bảo toàn năng lượng · 2.3 Mạch cầu phân áp (Voltage Divider) & Công thức sụt áp · 2.4 Thực hành mạch phân thế chỉnh độ sáng đèn LED bằng chiết áp.
- **Bài 3 — Định luật Kirchhoff & Giải thuật mạng điện MNA:** 3.1 Định luật dòng nút KCL & áp vòng KVL · 3.2 Phương pháp thế nút Modified Nodal Analysis (MNA) & toán ma trận $A \cdot x = B$ · 3.3 Giải ma trận ngầm bằng giải thuật khử Gauss trong JavaScript · 3.4 Thực hành thiết kế và tự động giải điện áp nút mạng điện.
- **Bài 4 — Linh kiện tích lũy & Hằng số thời gian RC/RL:** 4.1 Điện dung ($C$), Độ tự cảm ($L$) và phương trình vi phân mô tả · 4.2 Hằng số thời gian $\tau = RC$ & $\tau = L/R$ · 4.3 Chứng minh công thức phóng nạp $v_C(t) = V_0(1 - e^{-t/RC})$ · 4.4 Thực hành mạch trễ bật nguồn Delay Timer điều khiển bóng đèn.
- **Bài 5 — Dòng điện xoay chiều AC & Trở kháng phức:** 5.1 Dạng sóng AC, điện áp cực đại $V_{peak}$ và điện áp hiệu dụng $V_{RMS}$ · 5.2 Định nghĩa số phức $j$ và ứng dụng biểu diễn trở kháng phức $Z_C, Z_L$ · 5.3 Chứng minh lệch pha dòng áp $\phi = \pm 90^\circ$ qua tụ/cuộn cảm · 5.4 Thực hành mạch đo lệch pha AC và vẽ giản đồ vector pha (Phasor diagram).
- **Bài 6 — Cảm ứng điện từ & Máy biến áp (Transformer):** 6.1 Định luật cảm ứng Faraday & Hiện tượng tự cảm/hỗ cảm · 6.2 Cấu tạo biến áp & Công thức tỷ số vòng dây $\frac{V_1}{V_2} = \frac{N_1}{N_2}$ · 6.3 Chứng minh bảo toàn công suất $P_{in} \approx P_{out}$ & tổn hao lõi sắt · 6.4 Thực hành mô phỏng máy hạ áp AC 220V xuống 12V xoay chiều.
- **Bài 7 — Đi-ốt & Mạch chỉnh lưu nguồn DC Linear:** 7.1 Tiếp giáp bán dẫn P-N & sụt áp thuận của đi-ốt ($0.7\text{V}$) · 7.2 Mạch chỉnh lưu nửa chu kỳ vs toàn chu kỳ (Cầu đi-ốt) · 7.3 Công thức tính tụ lọc khử gợn sóng điện áp $C = \frac{I_{load}}{f \cdot V_{ripple}}$ · 7.4 Ổn áp tuyến tính: đi-ốt Zener ghim áp tham chiếu & IC ổn áp 3 chân 7805 · 7.5 Thực hành mạch nguồn DC Linear 12V ổn định từ 12V AC.
- **Bài 8 — Mạch lọc tần số (Filters) & Ứng dụng âm thanh:** 8.1 Bộ lọc RC thông thấp (Low-pass) & thông cao (High-pass) bậc 1 và 2 · 8.2 Công thức tính tần số cắt $f_c = \frac{1}{2\pi RC}$ · 8.3 Chứng minh hàm truyền đạt $H(f)$ bằng số phức & vẽ giản đồ đáp ứng tần số Bode plot · 8.4 Thực hành thiết kế mạch phân tần loa Crossover (Bass/Treble).
- **Bài 9 — Transistor (BJT & MOSFET) & Mạch khuếch đại:** 9.1 Cấu trúc bán dẫn và chế độ hoạt động BJT/MOSFET · 9.2 Thiết kế mạch đóng ngắt tải (Switching) bóng đèn 12V · 9.3 Mạch khuếch đại cực phát chung (Common Emitter) khuếch đại tín hiệu micro · 9.4 Công thức tính độ lợi áp $A_v = -g_m \cdot R_C$ và chứng minh lệch pha $180^\circ$ ngõ vào/ra.
- **Bài 10 — Op-Amp & Comparator (Khuếch đại thuật toán):** 10.1 Cấu trúc khuếch đại vi sai & độ lợi vòng hở $A_{OL}$ · 10.2 Hồi tiếp âm, hai "quy tắc vàng" & mạch khuếch đại đảo/không đảo $A_v = 1 + \frac{R_f}{R_1}$ · 10.3 Bộ so sánh (Comparator) & mạch trễ Schmitt Trigger · 10.4 Thực hành mạch tiền khuếch đại micro và comparator quang trở tự bật LED khi trời tối.
- **Bài 11 — Ăng-ten & Mạch thu phát vô tuyến (RF):** 11.1 Sóng điện từ và nguyên lý bức xạ ăng-ten dipole/monopole · 11.2 Công thức tính độ dài ăng-ten tối ưu $\lambda/2$ và $\lambda/4$ ($\lambda = c/f$) · 11.3 Hiện tượng cộng hưởng LC và công thức Thompson $f_0 = \frac{1}{2\pi\sqrt{LC}}$ · 11.4 Thực hành mạch thu sóng Radio AM tách sóng và phối hợp trở kháng ăng-ten.
- **Bài 12 — Cổng Logic & Mạch tổ hợp (Combinational Logic):** 12.1 Khái niệm mức logic nhị phân · 12.2 Sơ đồ thiết kế cổng NOT, AND, OR, XOR từ CMOS thực tế · 12.3 Đại số Boolean và giản đồ Karnaugh để tối giản hóa mạch logic · 12.4 Thực hành mạch cộng nhị phân 1-bit (Full Adder) cấp transistor.
- **Bài 13 — Mạch tuần tự & Thiết kế bộ nhớ lưu trữ:** 13.1 Latch RS và D Flip-Flop đồng bộ theo xung clock · 13.2 Thiết kế thanh ghi dịch (Shift Register) và bộ đếm (Counter) · 13.3 Ghép nối Flip-Flop tạo ô nhớ RAM tĩnh (SRAM cell - 6T SRAM) · 13.4 Công thức thời gian trễ propagation delay và setup/hold time.
- **Bài 14 — IC định thời 555 & Mạch tạo xung điều rộng (PWM):** 14.1 Cấu trúc khối chức năng bên trong IC 555 · 14.2 Chế độ dao động phi ổn định Astable tạo xung vuông liên tục · 14.3 Công thức tính chu kỳ và tần số $f = \frac{1.44}{(R_1 + 2R_2)C}$ · 14.4 Thực hành mạch điều rộng xung (PWM) đóng ngắt MOSFET chỉnh độ sáng LED.
- **Bài 15 — Kiến trúc vi điều khiển (MCU) & Giao tiếp GPIO:** 15.1 Kiến trúc MCU (CPU, SRAM, Flash, bus hệ thống) · 15.2 Memory-mapped I/O & thanh ghi DDRx/PORTx/PINx · 15.3 Đọc–sửa–ghi thanh ghi bằng bitwise (tiên quyết: Series C — Con trỏ & Bộ nhớ) · 15.4 Thực hành viết C/Assembly nhấp nháy LED trên MCU ảo.
- **Bài 16 — Ngắt, Timer & Dự án tổng hợp cuối series:** 16.1 Ngắt phần cứng: vector ngắt, ISR, cờ ngắt & chống dội phím (debounce) · 16.2 Timer/prescaler & tạo xung PWM bằng phần cứng · 16.3 Ghép hệ hoàn chỉnh: nguồn chỉnh lưu–ổn áp (Bài 7) cấp MCU điều khiển MOSFET (Bài 9) + LED hạn dòng (Bài 2) · 16.4 Dự án tổng hợp cuối series: trạm điều khiển LED thông minh, nút nhấn kích ngắt đổi chế độ PWM.

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

- [ ] Đạt **toàn bộ** rubric §2.
- [ ] Mỗi mục H2 trả lời đủ 4 câu hỏi §1.
- [ ] Có `.article-refs` ≥3 link ngoài hợp lệ (mở tab mới).
- [ ] Có ≥3 cross-link nội bộ theo bản đồ §4.
- [ ] Có ≥3 callout, glossary/`<abbr>` cho thuật ngữ mới.
- [ ] Đối chiếu lại độ sâu với 1 bài chuẩn của series cũ (vd `c-data-structures`, `cpp-move-semantics`) — không được nông hơn.
