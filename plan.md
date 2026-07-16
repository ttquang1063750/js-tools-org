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
> **2026-07-16 (quyết định bổ sung, retroactive):** Chủ dự án yêu cầu **bỏ hẳn mục quiz khỏi Series
> 16 (Kỹ Sư AI Thực Chiến)**, dù series này đã 100% hoàn thành từ trước theo chuẩn CÓ quiz — thay
> vào đó dành không gian cho nội dung/ví dụ sâu hơn, cùng tinh thần ngoại lệ đã áp cho Series 18 (xem
> Phần I). Khác với Series 18 (ngoại lệ áp dụng NGAY từ đầu), đây là thay đổi HỒI TỐ trên nội dung đã
> publish — đang làm theo lô nhỏ để kiểm chứng nhịp độ trước khi làm hết 20 bài:
> - **Bài 1–3** (2026-07-16): `aie-js-to-python`, `aie-math-code`, `aie-numpy-pandas`.
> - **Bài 4–6** (2026-07-16): `aie-pytorch-autograd`, `aie-mlp-neural-network`, `aie-training-backprop`.
>
> Cách làm mỗi bài: xoá khối `.quiz-container`, rồi bù lại bằng nội dung/ví dụ MỚI thật sự (không
> phải chỉ diễn giải lại đáp án quiz cũ) chèn đúng vào mục H2 liên quan — ví dụ Bài 1 thêm cạm bẫy
> "mutable default argument" + code fix `asyncio.to_thread`; Bài 2 thêm debug lỗi shape NumPy thật +
> bảng trace tay gradient descent; Bài 3 thêm phân biệt broadcasting theo dòng vs theo cột
> (reshape/`np.newaxis`); Bài 4 thêm cạm bẫy Tensor/NumPy chia sẻ vùng nhớ + lỗi `.backward()` trên
> tensor không phải scalar; Bài 5 thêm ví dụ số cụ thể cho vanishing gradient của Sigmoid + code
> chứng minh symmetry breaking khi khởi tạo trọng số bằng hằng số; Bài 6 thêm so sánh gradient MSE
> vs Cross-Entropy bằng con số thật + tự viết Adam từng bước so sánh có/không bias correction.
>
> **Quan trọng — trong lúc đọc lại nội dung cũ đã phát hiện và sửa thêm 3 lỗi coherence có sẵn
> KHÔNG liên quan đến quiz** (chứng tỏ giá trị của việc đọc kỹ thay vì chỉ xoá-thêm cơ học):
> 1. Bài 4 (`aie-pytorch-autograd`): 1 callout tham chiếu "dòng 52-55" — số dòng mồ côi từ bản nháp
>    cũ, không khớp code thật hiển thị ngay phía trên. Đã sửa thành tham chiếu trực tiếp đúng dòng
>    code liên quan.
> 2. Bài 6 (`aie-training-backprop`): 1 câu văn lẫn tiếng Anh "If bạn tự chèn thêm..." giữa đoạn
>    tiếng Việt. Đã sửa thành "Nếu bạn...".
> 3. **Tự phát hiện lỗi do chính mình viết** khi thêm nội dung mới cho Bài 6: đoạn diễn giải ban đầu
>    về việc bias correction của Adam "giúp bước đầu không rón rén" hoá ra SAI khi chạy thử code thật
>    (số liệu cho thấy điều ngược lại — thiếu bias correction làm bước đi LỚN HƠN và tiếp tục phình
>    to, không phải nhỏ hơn). Đã chạy Python xác minh số liệu thật trước khi sửa lại diễn giải cho
>    khớp — bài học: mọi khẳng định "chứng minh bằng số" phải chạy thử thật, không suy luận rồi viết
>    thẳng ra, kể cả khi tự tay viết nội dung mới.
>
> Đã cập nhật `headingsVi`/`headingsEn` tương ứng trong `blog/search-index.json` (bỏ "Trắc nghiệm ôn
> tập"/"Quizzes") cho cả 6 bài.
>
> - **Bài 7–9** (2026-07-16): `aie-cnn-convolution`, `aie-text-embeddings`, `aie-rnn-attention`. Nội
>   dung mới thêm: Bài 7 thêm callout giải thích vì sao demo huấn luyện CNN trên MNIST giả lập chỉ đạt
>   accuracy ~10% (mock data ngẫu nhiên không có tín hiệu học được) + code đếm tham số so sánh CNN vs
>   MLP tương đương (4.800 vs 100.480 tham số, đã tính tay và chạy Python xác minh); Bài 8 thêm ví dụ
>   thuật toán BPE chạy tay từng bước (đã chạy Python xác minh 4 bước gộp cặp ký tự) + khối kết quả in
>   ra thật của script `word_similarity.py` (đã chạy xác minh, gắn với công thức đại số ngữ nghĩa Vua −
>   Nam + Nữ ≈ Hoàng hậu ở mục 8.2 và cạm bẫy Cosine bỏ qua độ dài ở mục 8.3); Bài 9 thêm bảng con số
>   thật cho tốc độ tiêu biến $(0.9)^N$ qua N bước (đã tính xác minh: 0.59 → 0.35 → 0.12 → 0.0052 →
>   0.0000266) + ví dụ tính tay Dot-product Attention đầy đủ 3 bước (score → softmax → context vector,
>   đã chạy Python xác minh toàn bộ số liệu).
>
> **Quan trọng — Bài 7 phát hiện thêm 1 lỗi coherence nghiêm trọng hơn 2 lỗi trước** (không chỉ sai
> câu chữ mà sai về mặt logic của cả một demo): code huấn luyện CNN trên MNIST dùng `mock_images`
> hoàn toàn ngẫu nhiên VÀ `mock_labels` độc lập ngẫu nhiên — tức KHÔNG có tín hiệu để học — nhưng dòng
> `print()` kết luận "Mô hình đã học thành công cấu trúc trích xuất đặc trưng ảnh thô", một khẳng định
> sai sự thật. Đã sửa câu print để chỉ khẳng định đúng những gì demo thật sự chứng minh (pipeline chạy
> không lỗi), và thêm callout giải thích rõ vì sao accuracy ~10% (mức ngẫu nhiên của bài toán 10 lớp)
> là kết quả BÌNH THƯỜNG chứ không phải lỗi. Bài 8 và Bài 9 không phát hiện thêm lỗi coherence mới khi
> đọc lại toàn bộ nội dung.
>
> Đã cập nhật `headingsVi`/`headingsEn` trong `blog/search-index.json` cho cả 3 bài (Bài 7 hoá ra vẫn
> còn sót "Quizzes"/"Trắc nghiệm ôn tập" từ lần cập nhật trước — đã sửa luôn trong lần này). Tổng cộng
> đã hoàn thành 9/20 bài của Series 16.
>
> - **Bài 10–12** (2026-07-16): `aie-transformer-mechanism`, `aie-llm-api-prompting`,
>   `aie-structured-output-tools`. Nội dung mới thêm (mọi con số đều chạy Python xác minh trước khi
>   viết): Bài 10 thêm mô phỏng thống kê chứng minh vì sao chia $QK^T$ cho $\sqrt{d_k}$ ổn định phương
>   sai về ~1.0 bất kể $d_k$ = 8/64/512 + callout sửa ngộ nhận phổ biến rằng Multi-Head Attention tốn
>   thêm tham số (thực tế vẫn đúng 16.640 tham số dù 1 hay 8 Head, vì chia luồng chỉ là reshape); Bài
>   11 thêm bảng Softmax thật ở 3 mức Temperature (T=0.1/1.0/5.0) trên cùng một vector logits + ví dụ
>   tính tay Top-p dùng chính phân phối T=1.0 đó (cắt tại từ thứ 3 khi tích lũy vượt ngưỡng 0.9); Bài
>   12 thêm ví dụ chạy Python chứng minh JSON Mode "hợp lệ cú pháp" (`json.loads()` thành công) nhưng
>   vẫn có thể thiếu trường bắt buộc theo Schema, + ví dụ JSON Schema thật của tham số `tools` gửi lên
>   API (trước đó bài học chỉ mô tả bằng lời, chưa có ví dụ cụ thể).
>
> Không phát hiện thêm lỗi coherence nào ở cả 3 bài khi đọc lại toàn bộ nội dung (bao gồm chạy thử demo
> `chatbot_context.py` của Bài 11 để xác nhận cơ chế Sliding Window Context Buffer hoạt động đúng như
> mô tả). Đã cập nhật `headingsVi`/`headingsEn` trong `blog/search-index.json` cho cả 3 bài. Tổng cộng
> đã hoàn thành 12/20 bài của Series 16.
>
> - **Bài 13–15** (2026-07-16): `aie-local-llm-ollama`, `aie-rag-basics`, `aie-chunking-vector-db`. Nội
>   dung mới thêm (mọi con số chạy Python xác minh trước khi viết): Bài 13 thêm công thức + bảng tính
>   dung lượng mô hình theo mức lượng tử hóa (8B tham số: FP32 32GB → FP16 16GB → INT8 8GB → INT4 4GB,
>   khớp sát mức 4.7GB thực tế của Ollama) + ví dụ ghép các chunk JSON stream thành câu trả lời hoàn
>   chỉnh; Bài 14 thêm ví dụ tính tay TF-IDF trên kho 3 tài liệu nhỏ (từ "nghỉ" bị IDF triệt tiêu về 0
>   vì quá phổ biến, trong khi từ "phép" cùng TF nhưng IDF≈0.405 vẫn giữ được điểm); Bài 15 thêm mô
>   phỏng $O(N)$ so với $O(\log N)$ cho 1 triệu vector (HNSW nhanh hơn ~50.000 lần).
>
> **Quan trọng — Bài 14 và Bài 15 phát hiện thêm 2 lỗi coherence bằng cách CHẠY THỬ THẬT code demo**
> (không chỉ đọc chữ):
> 1. Bài 14 (`aie-rag-basics`): chạy thử `simple_rag.py` với đúng 2 câu hỏi trong code cho thấy câu hỏi
>    NGOÀI tài liệu ("công ty thành lập năm nào?") lại đạt độ khớp Cosine ($0.2501$) CAO HƠN câu hỏi
>    ĐÚNG chủ đề ($0.2414$), vì hàm truy xuất không có ngưỡng tối thiểu nào — nó luôn trả về "tốt nhất
>    trong số hiện có" bất kể điểm cao hay thấp. Đã thêm callout giải thích đây là giới hạn thật của
>    TF-IDF trên kho tài liệu nhỏ/đồng chủ đề, và vì sao pha Generation (lời dặn LLM tự nhận "không tìm
>    thấy") mới là tuyến phòng thủ cuối cùng chứ không phải Retrieval.
> 2. Bài 15 (`aie-chunking-vector-db`): phát hiện hàm `get_bow_vector` là code CHẾT (không được gọi ở
>    đâu) và có lỗi thật nếu gọi (list không có `.get()`, dùng string làm index) — đã xoá hẳn. Đồng
>    thời chạy thử 3 chiến thuật chunking trên văn bản NDA mẫu cho thấy Semantic Chunking và Recursive
>    Chunking cho ra kết quả GIỐNG HỆT NHAU trên văn bản này (không minh hoạ được ưu thế như bài học ngụ
>    ý) — đã thêm callout giải thích trung thực: ranh giới câu của văn bản mẫu này đã quá rõ ràng nên
>    Recursive vô tình trùng khớp Semantic; ưu thế thật của Semantic Chunking chỉ lộ rõ trên văn bản có
>    cấu trúc lộn xộn hơn.
>
> Đã cập nhật `headingsVi`/`headingsEn` trong `blog/search-index.json` cho cả 3 bài. Tổng cộng đã hoàn
> thành 15/20 bài của Series 16.
>
> - **Bài 16–18** (2026-07-16): `aie-advanced-rag`, `aie-agents-react`, `aie-langgraph-stateful-agents`.
>   Nội dung mới thêm (mọi con số chạy Python xác minh trước khi viết): Bài 16 thêm con số thật đo lợi
>   ích của Query Rewriting (câu hỏi thô sai chính tả đạt Cosine $0.0714$, sau viết lại đạt $0.4677$ —
>   gấp ~6.5 lần) + ví dụ tính tay chỉ số Jaccard dùng làm proxy Cross-Encoder (3/14 ≈ 0.2143); Bài 17
>   thêm callout bảo mật giải thích vì sao `eval()` cần làm sạch input trước khi tính toán (đã thử
>   chèn `__import__('os').system(...)` và xác minh bị lọc sạch thành chuỗi vô nghĩa) + vết chạy đầy đủ
>   3 vòng ReAct với dữ liệu giả lập (tra giá AAPL → tính 15×185.50 = 2782.5 → Final Answer); Bài 18
>   thêm ví dụ tính tay Reducer `operator.add` chứng minh khác biệt giữa cộng dồn lịch sử chat và ghi đè
>   mất dữ liệu.
>
> **Quan trọng — Bài 18 phát hiện 1 lỗi coherence nghiêm trọng bằng cách CHẠY THỬ THẬT code demo**: hàm
> `coder_node` trong `langgraph_agent.py` gọi `re.search(...)` nhưng phần import ở đầu file thiếu hẳn
> `import re`. Khi Ollama không chạy, lỗi kết nối xảy ra trước khi chạm dòng `re.search` nên bug bị che
> khuất hoàn toàn (nhìn như vẫn hoạt động nhờ fallback). Nhưng khi Ollama chạy thành công, `re.search` sẽ
> ném `NameError`, bị khối `except Exception` nuốt lặng lẽ và âm thầm thay code thật của LLM bằng hàm
> giả cố tình lỗi — khiến Agent LUÔN thất bại sau đúng 3 lần thử bất kể LLM viết đúng hay sai, vì code
> thật không bao giờ được dùng tới. Đã thêm `import re` vào đầu file để khắc phục triệt để, và thêm
> callout giải thích hiện tượng này như một bài học về việc khối `except Exception` quá rộng có thể che
> giấu cả lỗi lập trình cơ bản nhất. Bài 16 và Bài 17 không phát hiện thêm lỗi coherence nào khi đọc lại
> và chạy thử toàn bộ nội dung.
>
> Đã cập nhật `headingsVi`/`headingsEn` trong `blog/search-index.json` cho cả 3 bài. Tổng cộng đã hoàn
> thành 18/20 bài của Series 16.
>
> - **Bài 19–20** (2026-07-16, lô cuối cùng): `aie-fine-tuning-lora`, `aie-mlops-eval`. Nội dung mới
>   thêm (mọi con số chạy Python xác minh trước khi viết): Bài 19 thêm callout giải thích vì sao demo
>   NumPy dùng kích thước ma trận nhỏ ($d=8, r=2$) chỉ giảm được 2 lần tham số thay vì 250 lần như quy
>   mô thật ($d=4096$) — vì tiết kiệm tăng theo cấp số nhân với kích thước ma trận gốc — cùng vết chạy
>   thật của vòng lặp huấn luyện (Loss giảm từ 1.740512 → 0.001004 qua 100 epochs, ~1735 lần); Bài 20
>   thêm kết quả chạy thật xác nhận bộ 3 chỉ số Ragas mô phỏng bắt đúng câu trả lời ảo tưởng (Faithfulness
>   giảm từ 75.00% xuống 17.65% khi câu trả lời sai hoàn toàn, trong khi Context Recall vẫn cao 69.57% vì
>   lỗi nằm ở Generation chứ không phải Retrieval).
>
> **Quan trọng — Bài 20 phát hiện 1 giới hạn đáng chú ý bằng cách chạy thử thật code demo**: chỉ số
> Answer Relevance kiểu Jaccard chấm một câu trả lời HOÀN TOÀN ĐÚNG chỉ $8.00\%$ — trông như lạc đề —
> vì câu trả lời tốt thường diễn đạt lại ý bằng từ ngữ khác hẳn câu hỏi nên đếm từ trùng lặp thô thất
> bại. Đã thêm callout giải thích đây chính là lý do Ragas thật dùng phương pháp phức tạp hơn (LLM tự
> sinh câu hỏi ngược rồi so Cosine Similarity ngữ nghĩa) thay vì đếm từ khóa, và cảnh báo rằng một phép
> đo giả lập đơn giản hóa để dễ dạy có thể cho ra con số gây hiểu lầm nếu đem so với ngưỡng thực tế. Bài
> 19 không phát hiện thêm lỗi coherence nào khi đọc lại và chạy thử toàn bộ nội dung.
>
> Đã cập nhật `headingsVi`/`headingsEn` trong `blog/search-index.json` cho cả 2 bài.
>
> **✅ HOÀN THÀNH TOÀN BỘ 20/20 bài của Series 16** — dự án bỏ quiz và thay bằng nội dung/ví dụ sâu hơn
> (khởi động 2026-07-16, hoàn thành cùng ngày qua 7 lô nhỏ: 1–3, 4–6, 7–9, 10–12, 13–15, 16–18, 19–20).
> Tổng kết các lỗi coherence có sẵn phát hiện được trong quá trình đọc lại + chạy thử toàn bộ 20 bài
> (không liên quan trực tiếp đến việc xoá quiz, nhưng được sửa nhân tiện theo yêu cầu kiểm tra tính mạch
> lạc của chủ dự án): số dòng mồ côi (Bài 4), câu văn lẫn tiếng Anh (Bài 6), khẳng định sai về hướng
> bias correction của Adam (Bài 6, tự phát hiện), demo CNN tuyên bố "học thành công" trên dữ liệu ngẫu
> nhiên vô nghĩa (Bài 7), retrieval RAG không có ngưỡng khiến câu hỏi ngoài chủ đề khớp cao hơn câu đúng
> (Bài 14), hàm code chết kèm lỗi thật `get_bow_vector` (Bài 15), thiếu `import re` khiến Agent LangGraph
> luôn thất bại âm thầm (Bài 18). Bài học chung: đọc lại kỹ + **chạy thử thật** mọi demo code (không chỉ
> đọc chữ) là kỹ thuật hiệu quả nhất để phát hiện lỗi tồn tại từ trước, vượt xa việc chỉ rà soát văn bản.

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

> **Ngoại lệ Series 18:** dòng "Quiz" ở trên **không áp dụng** cho Series 18 (Kỹ Thuật Hệ Thống AI) — series này bỏ hẳn mục quiz để dành không gian cho nội dung sâu hơn (chốt cùng chủ dự án 2026-07-16, xem định danh series ở Phần I). Mọi dòng rubric khác trong bảng vẫn áp dụng đầy đủ, không được nới lỏng thêm.

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

| Từ series                                          | Liên kết tới                                    | Vì khái niệm chung                                                      |
| -------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| WebGPU · Compute Shader                            | WASM · Đa luồng; DSA · Pathfinding              | Song song hoá / GPGPU                                                   |
| WASM · SIMD/Threading                              | Canvas · Pixel; WebGL · Performance             | Tối ưu pixel/vector                                                     |
| Toy JS Engine                                      | JS · Engine & Execution; JS · Scope             | Call stack, closure, AST                                                |
| DSA · Hash/B-Tree                                  | SQL · Index & Query Plan; C · Data Structures   | B-Tree, hashing                                                         |
| Web Audio · FFT                                    | Canvas · Data Visualization; WebGPU · Particles | Vẽ phổ, reactive                                                        |
| CSS · Transform 3D                                 | WebGL · Coordinate & Math                       | Ma trận biến đổi                                                        |
| Git · Object Model                                 | C · Pointers; DSA · Huffman                     | DAG, content-address, nén                                               |
| Điện tử · Logic/MCU                                | VLSI · RTL/FPGA; C · Pointers                   | Cổng logic mức vật lý vs RTL, memory-mapped I/O                         |
| VLSI · VeriLite engine                             | DSA · Graph                                     | Event scheduler, critical path                                          |
| AI · Tensor engine                                 | WebGPU · Compute Shader; WASM · SIMD            | Matmul, vectorization, GPU                                              |
| AI · Backprop/autograd                             | DSA · Graph (topo sort); Toy JS Engine · AST    | Computation graph, duyệt đồ thị                                         |
| AI · MNIST/CNN                                     | Canvas · Pixel & ImageData                      | Đọc/vẽ pixel, tiền xử lý ảnh                                            |
| AI · Embedding/PCA                                 | DSA · Độ phức tạp; SQL · FTS5 (BM25)            | Vector hoá, đo tương đồng, tìm kiếm ngữ nghĩa                           |
| AI Hệ Thống · Data Pipeline (Series 18)            | AI · Từ Neuron Đến LLM (Series 12)              | Model training thật vs mô phỏng khái niệm                               |
| AI Hệ Thống · Memory/Tool-calling (Series 18)      | Kỹ Sư AI Thực Chiến · RAG/Agents (Series 16)    | Vector recall rút gọn vs embedding thật, ReAct đơn agent vs multi-agent |
| AI Hệ Thống · Blackboard/Orchestration (Series 18) | VLSI · Event scheduler; DSA · Graph             | Shared state, điều phối nhiều tiến trình song song                      |
| AI Hệ Thống · Huấn luyện phân tán (Series 18)      | WebGPU · Compute Shader; WASM · Đa luồng        | Song song hoá, đồng bộ giữa các worker                                  |

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
