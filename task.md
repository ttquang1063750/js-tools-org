# task.md — Loạt bài "Code thực chiến": NestJS Media Platform

> ⚠️ **File này viết TAY, không phải do `make-task.py` sinh ra.**
> `make-task.py` của skill `beginner-proof-series` sẽ **ghi đè toàn bộ** file này
> nếu ai đó chạy nó cho một series khác. Cần chạy script đó thì copy nội dung
> dưới đây đi chỗ khác trước, rồi khôi phục lại sau.

## Đang làm gì

Viết loạt bài **code thực chiến** dạng bài dài liên tục (KHÔNG phải bài học):
xây một nền tảng media bằng NestJS từ con số 0 — upload video → transcode bằng
`ffmpeg` → phát lại có tua được, kèm tài khoản, hạn mức, credit, hàng đợi và
nhiều tiến trình song song.

Nguồn cảm hứng định dạng: bài Viblo "NestJS Microservices với gRPC, API Gateway
và Authentication" do chủ dự án đưa. Muốn **đúng kiểu đó**: chữ + khối code +
tên file + đường dẫn thư mục. Liên tục, không cắt thành bài học.

**Vị trí:** `blog/build/nestjs-media-platform/part-{1,2,3,4}.html`
**Thể loại mới:** `blog/build/<tên-dự-án>/part-N` — tương lai thêm đề tài khác
chỉ cần thêm thư mục dưới `build/`.

## Các quyết định ĐÃ CHỐT (đừng mở lại)

| Quyết định | Nội dung                                              | Vì sao                                                                                                                                                                                                                                                                                                             |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sản phẩm   | Nền tảng upload → transcode → phát lại                | Là dự án DUY NHẤT khiến `child_process` (ffmpeg) và streaming trở thành _lý do tồn tại_, không phải minh hoạ gắn thêm. Đã cân nhắc và loại: ETL/crawler (realtime + streaming mỏng hơn, vướng pháp lý khi ví dụ thật) và e-commerce (ACID/cache đã trùng series `sql` + `sysdesign`)                               |
| Hình thức  | **Một trang liên tục mỗi part**, không chia bài       | Yêu cầu trực tiếp của chủ dự án                                                                                                                                                                                                                                                                                    |
| KHÔNG có   | quiz, điều hướng bài trước/sau, `data-lang-content`   | Đây là bài thực chiến, không phải bài học                                                                                                                                                                                                                                                                          |
| Ngôn ngữ   | Tiếng Việt                                            |                                                                                                                                                                                                                                                                                                                    |
| Frontend   | React + TypeScript + Tailwind, rải làm **3 mốc**      | Dồn hết vào cuối thì phần lớn bài không thấy sản phẩm                                                                                                                                                                                                                                                              |
| ORM        | **TypeORM** (không phải Prisma)                       | Viết SQL thô tự nhiên hơn khi dạy `SELECT FOR UPDATE` ở phần ACID                                                                                                                                                                                                                                                  |
| Auth       | JWT + **refresh token có rotation + reuse detection** | Yêu cầu trực tiếp. Kéo theo: `RefreshToken` phải vào ERD ngay từ phần thiết kế CSDL, không chắp vá sau                                                                                                                                                                                                             |
| Code       | **KHÔNG dựng project thật**                           | Chủ dự án đã bác bỏ rõ ràng: bài chỉ cần chữ + code listing + tên file. Từng thử tạo `~/Projects/nestjs-media-forge` và đã xoá                                                                                                                                                                                     |
| nginx      | Xuất hiện **3 lần** đúng chỗ cần                      | Không dồn thành một mục lý thuyết                                                                                                                                                                                                                                                                                  |
| Kiến trúc  | **Monolith trước, tách microservice ở Part 4**        | Dựng microservice từ ngày đầu buộc gỡ lỗi phân tán trước khi gỡ lỗi tại chỗ. Ranh giới module NestJS vạch đúng từ đầu thì tách chỉ là đổi cách gọi (inject → gRPC client). Quan trọng nhất: nó tạo mạch ACID (Part 1, một DB, đảm bảo chắc) → vỡ khi qua ranh giới service (Part 4) → outbox pattern có nghĩa thật |
| Số part    | 4, **được phép tách thêm Part 5** nếu quá dài         | Chủ dự án đồng ý. Chỗ cắt tự nhiên: sau phần realtime (hết Part 3) sản phẩm đã chạy trọn vòng upload → transcode → xem tiến độ                                                                                                                                                                                     |

## Ràng buộc vận hành — QUAN TRỌNG

- **CHỈ commit local. KHÔNG push.** Chủ dự án sẽ tự push sau vài tuần.
- **CHƯA** thêm vào `sitemap.xml`, `blog/search-index.json`, hay card ở
  `blog/index.html`. Lý do: site mới ~2,5 tháng tuổi (repo init 29/5/2026) và
  đang cần **giảm nhịp xuất bản** — 315 trang trong 10 tuần là mẫu hình rủi ro
  theo chính sách scaled content của Google. Chờ chủ dự án quyết định thời điểm.
- Chạy `node check-lesson.js <file>` trước khi coi là xong.
- Chạy `npx prettier --write` sau mỗi lần sửa HTML/CSS.

## Đã xong

- [x] Chốt sản phẩm + kiến trúc + cách chia 4 part
- [x] Thêm thể loại `--build` vào `blog/blog.css` (3 rule, màu `#0f766e`, đã
      kiểm không trùng 31 tag hiện có)
- [x] `part-1.html` — mục 1 **Sản phẩm & kiến trúc** (sơ đồ SVG đầy đủ luồng,
      kèm pitfall "để việc nặng chạy trong request")
- [x] `part-1.html` — mục 2 **Cấu trúc thư mục** (monorepo, 3 ranh giới dễ sai)
- [x] `part-1.html` — mục 3 **Chuẩn code & strict type** (4 cờ không nằm trong
      `"strict"`, kèm output `tsc` THẬT)
- [x] Kiểm trên trình duyệt: 0 asset 404, CSS nạp đúng ở độ sâu 3 cấp, SVG không
      tràn/không chồng nhãn, `check-lesson.js` xanh
- [x] Thêm callout "Sơ đồ trên là ĐÍCH ĐẾN, không phải điểm xuất phát" ngay dưới
      sơ đồ kiến trúc — giải thích monolith trước / tách sau, và báo trước mạch
      ACID → vỡ khi tách → outbox

Commit: `2745e04`

## Việc tiếp theo, theo đúng thứ tự

### Part 1 — còn 3 mục

- [ ] **Mục 4 — Thiết kế cơ sở dữ liệu.** Đây là phần chủ dự án chỉ ra còn
      thiếu, và nó **quyết định chất lượng mục ACID ngay sau đó**. Phải có:
  - Rút thực thể từ luồng nghiệp vụ: `User`, `RefreshToken`, `Video`,
    `MediaAsset`, `Job`, `CreditLedger`, `ApiKey`
  - **Sơ đồ ERD** (SVG inline) — quan hệ, khoá ngoại, lực lượng
  - Quyết định đắt nhất: **ví credit là sổ cái append-only, KHÔNG phải cột
    `balance`** — vì sao cộng dồn giao dịch an toàn hơn cập nhật một con số, và
    cái giá phải trả (đọc chậm hơn, cần snapshot). Chính lựa chọn này làm mục
    ACID có sức nặng
  - `Job` có vòng đời trạng thái → mô hình hoá transition sao cho không rơi vào
    trạng thái không hợp lệ
  - Kiểu dữ liệu: `uuid` vs `bigint`, `timestamptz`, enum vs check constraint
  - Index đặt theo **truy vấn thật sẽ chạy**, không rải bừa
  - Ràng buộc ở tầng DB vs tầng ứng dụng — cái nào nên nằm đâu
- [ ] **Mục 5 — TypeORM & migration.** Dịch thiết kế trên thành entity,
      migration, seed. Code listing đầy đủ, có kiểu, không `any`.
- [ ] **Mục 6 — ACID trong thực tế.** Tái hiện **double-spend**: hai request
      đồng thời cùng trừ credit → số dư âm. Rồi vá bằng `SELECT FOR UPDATE`, so
      sánh các isolation level, optimistic vs pessimistic. Phần này chỉ đắt được
      vì mục 4 đã chọn mô hình sổ cái.

### Part 2 — Cổng vào, nginx & streaming

- [ ] Auth: JWT, guard, RBAC → **FE mốc #1: form đăng nhập**
- [ ] Refresh token: rotation, reuse detection (thu hồi cả family), lưu hash chứ
      không lưu plaintext, `httpOnly` cookie vs body, đăng xuất 1 thiết bị vs
      tất cả, **race condition hai tab cùng refresh**
- [ ] API Gateway, timeout budget
- [ ] Rate limit: token bucket Redis, **so với `limit_req` của nginx** — cái nào
      đặt ở đâu
- [ ] nginx: reverse proxy, TLS termination, forwarded header,
      `client_max_body_size`
- [ ] Streaming upload: resumable, backpressure, không phình RAM
- [ ] Streaming download: Range/`206`, signed URL, **`X-Accel-Redirect`** (vì sao
      đẩy file cho nginx thay vì stream từ Node) → **FE mốc #2: upload progress +
      player**

### Part 3 — Process model & realtime

- [ ] `child_process`: spawn ffmpeg, stdio, kill/timeout, zombie, exit code
- [ ] `worker_threads`: hash ảnh, thumbnail, pool, transferable.
      **Bảng so sánh: khi nào `child_process`, khi nào `worker_threads`**
- [ ] `cluster` + **nginx load balancing** nhiều instance gateway
- [ ] Queue: tách job khỏi request, retry, DLQ, idempotency
- [ ] Realtime: WebSocket, room theo user, worker → gateway qua Redis pub/sub,
      **nginx proxy WS** (`Upgrade`/`Connection`, timeout), reconnect/backfill
      → **FE mốc #3: bảng tiến độ realtime**

### Part 4 — Tách microservice & vận hành

- [ ] Tách `auth-svc` / `media-svc` khỏi monolith — nhấn mạnh: ranh giới module
      KHÔNG đổi, chỉ đường truyền đổi
- [ ] gRPC: proto, codegen, unary + server streaming, deadline, error model
- [ ] **Transaction vỡ khi qua ranh giới service** — nối thẳng về phần ACID ở
      Part 1: cùng một nghiệp vụ, giờ không còn transaction nào ôm được cả hai
      thao tác
- [ ] **Outbox pattern** — đảm bảo "ghi DB xong thì message chắc chắn được gửi"
- [ ] Idempotency khi retry qua mạng
- [ ] Cái giá phải trả: correlation ID, tracing, debug khó hơn hẳn
- [ ] Cache-aside, chống stampede
- [ ] Observability, graceful shutdown toàn hệ, đo tải

**CỐ Ý KHÔNG đưa vào:** service discovery, circuit breaker, service mesh. Với 3
service trong một `docker-compose`, chúng là giải pháp cho vấn đề chưa tồn tại —
sẽ thành lý thuyết suông, đúng thứ loạt bài này đang tránh.

### Part 5 — chỉ tạo NẾU cần

Được phép tách nếu Part 3 hoặc Part 4 phình quá dài. Chỗ cắt tự nhiên đã chọn:
sau phần realtime (hết Part 3), vì lúc đó sản phẩm đã chạy trọn vòng
upload → transcode → xem tiến độ. Nếu tách, dời phần cache + vận hành sang
Part 5 và để Part 4 thuần về tách service.

## Gotcha đã gặp — đừng vấp lại

1. **Trang nằm sâu 3 cấp** (`blog/build/<dự-án>/`) chứ không phải 2 như các
   series khác. Mọi đường dẫn tài nguyên phải lùi thêm một mức:
   `../../../assets/` chứ không phải `../../assets/`. Lấy chrome từ bài có sẵn
   thì nhớ deepen.
2. **Khi copy chrome từ bài mẫu, phải sửa CẢ hero lẫn phần liên quan**, không
   chỉ `<head>`. Lần đầu chỉ sửa `<head>` nên trang vẫn hiện tiêu đề
   "Bài 5: Caching" của sysdesign — chỉ phát hiện khi **chụp màn hình**, đọc code
   không thấy.
3. **Chèn khối vào trang: dùng mốc chính xác.** `rfind('<section')` từng bắt
   trúng `article-hero` làm khối rơi lên trên cả hero. Mốc đúng thường là thẻ
   ngay trước nội dung, ví dụ `<div class="lessons-list">`.
4. **Dấu nháy đơn trong chuỗi JS.** `"two's complement"` trong chuỗi nháy đơn
   làm vỡ cú pháp file. Tương tự bẫy `\"` trong `onclick="..."` của HTML — dùng
   `&quot;` hoặc diễn đạt lại.
5. **Số liệu phải chạy ra, không được bịa.** 4 mã lỗi TS trong part-1
   (`TS2322`, `TS2375`, `TS18046`, `TS4111`) là output thật của `tsc` trên file
   cố ý viết sai. Giữ kỷ luật này cho phần ACID: con số double-spend phải từ một
   lần chạy thật, hoặc nói rõ là minh hoạ.

## Bối cảnh SEO (nếu ai đó hỏi vì sao chưa đăng)

Trong cùng phiên này đã sửa xong và **đã push** một loạt lỗi SEO của site:
soft 404 toàn site (68 redirect 301 + `404.html`), 6 canonical trỏ tên miền
không tồn tại `js-tools-org`, cả series `repair` thiếu trong sitemap, và
`search-index.json` lẫn 2 schema làm **tìm kiếm blog chết hoàn toàn**.
Repo `angular-image-optimizer` cũng đã sửa tương tự và đã push.

Chủ dự án đang chờ bấm START NEW VALIDATION trong GSC. Trong lúc đó **không nên
đăng thêm trang mới** — đó là lý do loạt bài này chỉ commit local.
