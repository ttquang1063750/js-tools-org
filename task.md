# task.md — Loạt bài "Code thực chiến": NestJS Media Platform

> ⚠️ **File này viết TAY, không phải do `make-task.py` sinh ra.**
> `make-task.py` của skill `beginner-proof-series` sẽ **ghi đè toàn bộ** file này
> nếu ai đó chạy nó cho một series khác. Cần chạy script đó thì copy nội dung
> dưới đây đi chỗ khác trước, rồi khôi phục lại sau.

## ⚠️ Việc còn mở (đọc mục này trước, đừng đi mò lại từ đầu)

**Bối cảnh:** loạt bài 4 part đã viết xong từ trước (xem lịch sử bên dưới), rồi
sau đó có hai phiên rà lỗi runtime riêng, cả hai đều **đã commit**:

1. **15/08/2026, phiên 1** — đóng vai người đọc làm theo cả 4 part, tập trung
   100% vào backend. Sửa 21 lỗi (A–U). Chi tiết ở mục "## Đã kiểm runtime & vá
   lỗi (15/08/2026)" bên dưới.
2. **15/08/2026, phiên 2** — liệt kê cấu trúc frontend (Part 2 §8, Part 3 §7),
   phát hiện 5 lỗi tích hợp frontend↔backend (V–Z) qua đọc chéo, rồi **dựng
   thật project NestJS trong `~/Projects/Scratchpad/media-forge`** để sửa và
   kiểm — phát hiện thêm 9 lỗi backend nữa trong lúc đó (AA–AE và vài lỗi phụ
   trợ). Tổng cộng phiên này sửa **11 lỗi** (V, W, X, Y, Z, AA, AB, AC, AD,
   AE, cộng một lỗi robustness nhỏ ở `SignedUrlService.verify()`). Chi tiết ở
   mục "## Đã sửa lỗi tích hợp frontend↔backend (phiên 2, 15/08/2026)" bên
   dưới — đọc mục đó để biết CHÍNH XÁC cái gì đã được đo, tránh lặp lại việc
   đã làm.
3. **15/08/2026, phiên 3** — chạy skill `review-build-series` (mới viết cùng
   phiên) trên cả 4 part bằng workflow đa-agent, **CHỈ đọc, chưa sửa gì**.
   Tìm ra **31 phát hiện mới** dù 2 phiên trước đã sửa 32 lỗi runtime —
   nghĩa là vẫn còn khoảng hở dù đã dựng và chạy thật một phần lớn dự án
   (lý do: 2 phiên trước test qua script gọi thẳng service, không phải qua
   đúng HTTP endpoint như bài mô tả, nên một số route/wiring không bao giờ
   bị chạm tới). Đã xác minh nhanh bằng `grep` thật 4/31 phát hiện quan
   trọng nhất — cả 4 đều có thật, kể cả một lỗi do chính phiên 2 vô tình gây
   ra (callout cảnh báo cũ về `WatchJobRequest` chưa xoá sau khi đã sửa).
   Toàn bộ phát hiện ở mục "## Rà soát tĩnh — NestJS Media Platform
   (15/08/2026, review-build-series, chưa sửa)" bên dưới — **CHƯA sửa vào
   HTML**, đây là việc mở lớn nhất hiện tại.
4. **15/08/2026, phiên 4** — vá chính skill `review-build-series` (script
   `extract-parts.py` cũ chỉ trích ĐỊNH NGHĨA, không trích THAM CHIẾU), rồi
   dùng bản vá **đối chiếu ngược lại bảng 31 dòng của phiên 3**. Kết quả:
   nhóm "thiếu code" của phiên 3 gần như không sót gì, và phiên 3 còn bắt
   được 6 lỗi mà script không thể bắt kể cả sau khi vá. Script tìm thêm
   **1 phát hiện mới → tổng 32**. Chi tiết ở mục con "### Đối chiếu lại bảng
   trên bằng công cụ". **Không sửa file HTML nào trong phiên này.**
5. **15/08/2026, phiên 5** — xử lý toàn bộ 32 phát hiện: xác minh lại từng
   dòng bằng đọc file thật (4 agent song song, một agent một part), áp fix
   trực tiếp vào 4 file HTML, rồi **dựng lại project thật** trong
   `~/Projects/Scratchpad/media-forge` để đo Part 1-3, và kiểm tĩnh bằng
   `protoc`/`tsc` thật cho Part 4 (Part 4 vẫn CHƯA dựng thành 3 microservice
   chạy gRPC thật — xem việc mở riêng bên dưới). Kết quả: 31/32 sửa thật, 1
   dòng (#21) xác nhận là bỏ boilerplate có chủ đích, không sửa. Trong lúc rà
   diff, tự phát hiện thêm 1 lỗi (constructor thiếu của `OutboxRelay`) và
   sửa luôn. Trong lúc build thật, phát hiện thêm **2 lỗi hoàn toàn mới**,
   nghiêm trọng hơn cả 32 dòng gốc, và đã sửa cả hai:
   - **Không có `ValidationPipe` toàn cục nào được đăng ký ở đâu trong cả
     loạt bài** — nghĩa là mọi DTO dùng `class-validator` (`ChargeDto`,
     `LoginDto`, `RefreshDto`...) từ Part 1 tới Part 4 chưa từng thực sự chạy
     validate lúc runtime, dù bài liên tục khẳng định "kiểm dữ liệu vào bằng
     class-validator". Đo thật: gọi `/billing/charge` thiếu `amount` trước
     khi vá → `500` với lỗi Postgres thô `22P02 invalid input syntax for
     integer`, không phải `400` như logic DTO ngụ ý. Đã thêm
     `app.useGlobalPipes(new ValidationPipe(...))` vào Part 2 (ngay sau
     `LoginDto`, nơi DTO có validate đầu tiên xuất hiện).
   - **Lệnh `npx protoc` ở Part 4 thiếu `--proto_path=./proto`** — làm file
     sinh ra nằm ở `libs/proto-types/proto/*.ts` thay vì
     `libs/proto-types/*.ts`, phá mọi `import ... from '@app/proto-types/...'`
     trong phần còn lại của Part 4. Tái hiện được với 2 bản `protoc` khác
     nhau. Đã thêm cờ còn thiếu + một callout giải thích tại sao.
   Chi tiết đầy đủ (bảng 32 dòng đã điền cột Trạng thái, phương pháp build
   thật, và 2 lỗi mới) ở mục "## Phiên 5 — xử lý 32 phát hiện + build thật
   (15/08/2026)" bên dưới.

**Việc CHƯA làm, còn mở cho phiên sau:**

- [x] ~~Xử lý 32 phát hiện của `review-build-series`~~ — xong ở phiên 5, xem
      mục "## Phiên 5" bên dưới để biết chi tiết từng dòng.
- [ ] **Chưa xác nhận: `EventEmitter2` (Part 4, `MediaGrpcController`) có
      thực sự nhận được sự kiện tiến độ từ Redis pub/sub (Part 3) hay
      không** — phát hiện mới ở phiên 5 (đọc, chưa build để xác nhận chắc
      trăm phần trăm): Part 3 phát tiến độ qua Redis pub/sub
      (`this.redis.publish('progress', ...)`), nhưng `MediaGrpcController`
      của Part 4 lắng nghe qua `EventEmitter2` nội bộ tiến trình
      (`this.progress.on('progress', handler)`) — không đoạn nào trong bài
      bắc cầu hai cơ chế này lại với nhau. Có thể là thiếu code thật (cần
      thêm một subscriber Redis → re-emit qua `EventEmitter2`, giống hệt vai
      trò `ProgressSubscriber` của Part 3 nhưng đặt trong media-svc), hoặc
      có thể là chi tiết cố ý bỏ qua vì Part 4 vốn là phần mở rộng lý thuyết.
      Chưa sửa — cần đọc kỹ hơn hoặc dựng chạy thật mới quyết được, và việc
      đó gắn liền với việc dựng 3 microservice thật ngay dưới đây.
- [ ] **Dựng thật hệ 3 microservice của Part 4** (`apps/billing-svc`,
      `apps/media-svc`, `apps/auth-svc` + gateway) và chạy gRPC thật giữa
      chúng. Cả hai phiên rà lỗi CHỈ kiểm được `media.proto`/`billing.proto`
      bằng `protoc` thật (cú pháp đúng) và đối chiếu logic để `chargeForJob()`
      khớp chữ ký giữa Part 3 và Part 4 — **không** có một hệ microservice
      thật nào từng chạy gRPC end-to-end. Nếu làm, nhớ: Part 4 vốn không có
      project code hoàn chỉnh để scaffold (nó là phần mở rộng lý thuyết từ
      monolith Part 1–3), nên cần tự viết `apps/*` từ đầu dựa theo các đoạn
      code đã cho trong bài.
- [ ] Quyết định có muốn giữ nguyên quyết định cũ **"Code: KHÔNG dựng project
      thật"** (xem bảng quyết định đã chốt bên dưới) hay không, vì cả hai
      phiên rà lỗi đều đã dựng project thật **trong scratchpad tạm** (không
      phải trong repo, không commit) chỉ để kiểm chứng — bài viết (4 file
      HTML) vẫn giữ nguyên hình thức "chữ + code listing + tên file" như
      quyết định gốc, chỉ khác là giờ nội dung code trong đó đã được xác nhận
      **thật sự ráp lại chạy được**, không còn là listing chưa kiểm.
- [ ] **Frontend (React) vẫn CHƯA được dựng thật để chạy** — phiên 2 chỉ mô
      phỏng đúng các lời gọi HTTP/WebSocket mà 5 file frontend
      (`api.ts`/`upload.ts`/`VideoPlayer.tsx`/`useJobProgress.ts`/`JobList.tsx`)
      thực hiện, bằng `curl` và `socket.io-client` trực tiếp — không chạy
      `npm create vite@latest` và mở trình duyệt thật để xác nhận UI hiển thị
      đúng (thanh tiến độ, chuyển trạng thái, video phát được). Backend phía
      sau các lời gọi đó đã sửa và kiểm xong (xem mục "## Đã sửa lỗi tích hợp
      frontend↔backend" bên dưới).

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

- **CHỈ commit local. KHÔNG push.** Chủ dự án sẽ tự push sau vài tuần. (Đã
  ahead ~31 commit so với `origin/main` tính tới phiên 5 — kiểm `git log
  origin/main..HEAD` nếu cần biết con số mới nhất, đừng giả định lại từ đầu.)
- **ĐÃ** thêm vào `sitemap.xml`, `blog/search-index.json`, và card ở
  `blog/index.html`/`index.html` gốc — xem mục "## Đã xuất bản ra ngoài
  (15/08/2026)" bên dưới. Ghi chú này từng nói "CHƯA" khi loạt bài còn chờ
  chủ dự án duyệt; chủ dự án đã quyết định đưa ra hub, chỉ còn thiếu bước
  `git push` (site mới ~2,5 tháng tuổi, vẫn đang giảm nhịp xuất bản theo
  chính sách scaled content — xem "## Bối cảnh SEO" cuối file).
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
- [x] **Thêm mục 4 "Khởi tạo dự án"** — chủ dự án chỉ ra bài thiếu hẳn phần
      quan trọng nhất của thể loại này: NGƯỜI ĐỌC GÕ GÌ ĐỂ BẮT ĐẦU. Trước đó bài
      chỉ mô tả, không làm theo được. Đã bổ sung 5 mục con: `nest new`, cài gói
      (kèm vai trò từng gói), dọn file mặc định, tạo cây thư mục, biến môi trường + kiểm bằng zod, dựng Postgres bằng Docker có healthcheck.
      **Bài học rút ra cho các mục còn lại: mỗi mục phải là MỘT HÀNH ĐỘNG
      (gõ lệnh → tạo file → viết gì trong đó → chạy thấy gì), không phải một mô
      tả.**
- [x] Đổi chỗ "Cấu trúc thư mục" lên trước "Khởi tạo dự án" — ban đầu mục 3.3
      bảo tạo thư mục nhưng lại dẫn tới mục giải thích nằm PHÍA SAU. Đã kiểm:
      cả 3 tham chiếu "mục N" giờ đều trỏ về phía trước.
- [x] **Viết lại Part 1 theo hướng monolith thuần** sau khi rà soát phát hiện mâu
      thuẫn: callout nói "một app" nhưng cây thư mục lại vẽ 5 app tách rời +
      `libs/proto`. Đã sửa triệt để: - Sơ đồ kiến trúc vẽ ĐÚNG monolith (1 app NestJS + 1 worker), không vẽ
      đích đến microservice nữa — tránh làm người đọc hoang mang - Cây thư mục là `src/{auth,media,job,billing}` chia theo MIỀN NGHIỆP VỤ,
      không còn `apps/*` hay `libs/proto`. Ghi rõ thư mục nào thêm ở part nào - Bỏ hết từ "monorepo" kể cả trong meta description - Thêm mục **1. Yêu cầu tiên quyết** (Node 22+, Docker; Postgres/Redis/
      ffmpeg chạy trong container — lý do: Part 3 cần khoá phiên bản ffmpeg) - Thêm callout **"Hết Part 1 bạn sẽ có gì"** — lời hứa cụ thể - Sửa "sơ đồ trên" → đúng đối tượng (trước đó nói "sơ đồ" khi ý là cây
      thư mục) - Callout mới: chia theo miền nghiệp vụ để "module hôm nay là đường cắt
      của ngày mai" — dẫn sang Part 4 nhẹ nhàng thay vì gieo mầm dày đặc

Commit: `2745e04`, `07062f5`, và bản viết lại monolith

## Việc tiếp theo, theo đúng thứ tự

### Part 1 — còn 3 mục

- [x] **Mục 5 — Thiết kế cơ sở dữ liệu** (đã viết, đánh số 5 vì có thêm mục
      "Yêu cầu tiên quyết" ở đầu). Gồm 4 mục con: - 5.1 Đi từ luồng nghiệp vụ tới thực thể — gạch chân danh từ trong câu
      chuyện người dùng, ra đúng 6 bảng, kèm **ERD SVG** (đã kiểm 0 nhãn
      tràn/chồng) - 5.2 Vì sao credit là sổ cái append-only, không phải cột `balance` — 3 câu
      hỏi mà cột số không trả lời được; hệ quả bất ngờ: hoàn tiền không cần
      logic riêng, chỉ là thêm một dòng ngược dấu; cái giá (`SUM` chậm dần) và
      đường ra (snapshot) — nói rõ loạt bài KHÔNG làm snapshot vì là tối ưu sớm - 5.3 Vòng đời job — máy trạng thái, chuyển hợp lệ/không hợp lệ, và cạm bẫy
      job kẹt `processing` vĩnh viễn (lý do `started_at` phải có từ thiết kế) - 5.4 Kiểu dữ liệu & ràng buộc — uuid vs số tự tăng, `timestamptz`, số
      nguyên cho tiền, enum Postgres; callout "ràng buộc ở DB hay app" kết bằng
      câu dẫn thẳng sang ACID: hai request đồng thời cùng lọt qua kiểm tra
- [x] **Mục 7 — TypeORM & migration** (đã viết). 4 mục con: DataSource dùng
      chung cho CLI + app, entity (`CreditEntry` và `Job` viết đầy đủ, 4 entity
      còn lại nói theo khuôn), nối vào `app.module`, sinh/chạy/kiểm migration.
      Pitfall: `synchronize: true` xoá dữ liệu khi đổi tên cột; migration phải
      commit và không được sửa cái đã chạy. Tip: `as const` cho `JOB_STATUSES`
      làm một nguồn sự thật cho cả enum Postgres lẫn kiểu TS.
- [x] **Mục 8 — ACID trong thực tế** (đã viết). Cấu trúc: viết bản `charge()`
      tự nhiên (đọc → kiểm tra → ghi) → tái hiện lỗi bằng `xargs -P 10` bắn 10
      request đồng thời → số dư ÂM → sơ đồ timeline cửa sổ nguy hiểm → callout
      "bọc transaction cũng chưa đủ" (vấn đề ở chữ I chứ không phải A) → vá bằng
      `SELECT ... FOR UPDATE` trên dòng `users` (giải thích vì sao khoá `users`
      chứ không khoá `credit_entries`: FOR UPDATE khoá dòng ĐANG có, mà vấn đề
      là dòng SẮP thêm) → bảng so sánh 3 cách (bi quan / SERIALIZABLE / lạc quan)
      và lý do chọn.

- [x] **joi → zod** — chủ dự án hỏi cái nào mạnh hơn; tôi chỉ ra bài đang tự
      mâu thuẫn: callout `as const` ở mục 7.2 dạy "một nguồn sự thật", nhưng mục 4
      lại có schema joi và `interface AppConfig` viết tay chạy song song — đúng thứ
      nó vừa phê phán. Đổi sang zod: `AppConfig = z.infer<typeof configSchema>`,
      xoá interface viết tay và mọi `as string`. Dùng `validate:` chứ không
      `validationSchema:` (tuỳ chọn đó đòi schema hình dạng joi có `.validate()`).
      Khoá cấu hình theo đó thành CHỮ HOA (`config.get('PORT')`), đã sửa luôn
      `forRootAsync` ở mục 7. Callout `abortEarly: false` thay bằng callout
      `safeParse` gom hết lỗi. Nối chéo hai chỗ lại ở callout `as const`.

- [x] **Sửa mâu thuẫn ConfigModule vs `process.env`** — chủ dự án chỉ ra: dựng
      `AppConfigModule` có zod ở mục 4 nhưng mục 7 lại đọc thẳng `process.env`,
      vậy validate để làm gì. Đã sửa cả hai phía: - Thêm `src/config/configuration.ts` — schema zod, `AppConfig = z.infer<...>`,
      nạp bằng `validate:`; dùng `ConfigService<AppConfig, true>` (chế độ
      WasValidated → `get()` trả `number` chứ không `number | undefined`) - Tách `typeorm.options.ts` (phần dùng chung, `satisfies`) khỏi
      `data-source.ts` (chỉ cho CLI) - `app.module.ts` chuyển sang `TypeOrmModule.forRootAsync` + `useFactory`
      inject `ConfigService` - **Nói rõ ràng buộc thật thay vì giấu:** TypeORM CLI chạy ngoài container
      DI của Nest nên KHÔNG dùng được `ConfigService`. `data-source.ts` là nơi
      DUY NHẤT còn đọc `process.env` trực tiếp, và bài nói rõ vì sao.

**PART 1 ĐÃ VIẾT XONG.** 10 mục H2, 18 mục H3, 4.173 từ (không kể code), 36 khối code, 3 sơ đồ SVG. Đo trên trình duyệt: typescript 1.092 token, 0 nhãn
SVG tràn/chồng, 0 lỗi console, không tràn ngang, check-lesson.js xanh.

Việc còn lại trước khi đăng: chủ dự án đọc duyệt, rồi mới thêm vào 4 chỗ
(`blog/index.html`, `index.html` gốc, `sitemap.xml`, `blog/search-index.json`).

### Part 2 — Cổng vào, nginx & streaming ✅ ĐÃ VIẾT XONG

`blog/build/nestjs-media-platform/part-2.html` — 5.151 từ (chưa tính code),
36 khối code, 2 sơ đồ SVG, 8 mục H2. `check-lesson.js` xanh 11/11.

- [x] Mật khẩu: argon2id, tham số nằm trong chuỗi hash, `needsRehash`, một thông
      báo lỗi duy nhất + `DUMMY_HASH` chống đo chênh lệch thời gian
- [x] Access token JWT: `JwtAuthGuard` tự viết (không qua passport), decorator
      `@CurrentUser`, `RolesGuard`. Vá lỗ `userId` do client gửi từ Part 1
- [x] Refresh token: rotation, reuse detection → xoá cả `family_id`, lưu SHA-256
      (giải thích vì sao KHÔNG argon2 ở đây), `httpOnly` cookie vs body,
      logout 1 thiết bị vs tất cả
- [x] **Đua hai tab**: `setLock('pessimistic_write')` + khoảng ân hạn 30s +
      cột mới `replaced_by_hash` (kèm lệnh sinh migration)
- [x] nginx: TLS termination, `client_max_body_size 2g`, forwarded headers,
      bẫy `trust proxy: true`
- [x] Rate limit **hai tầng**: `limit_req` của nginx theo IP (chặn lưu lượng) vs
      token bucket Lua trên Redis theo người dùng (chặn hạn mức)
- [x] Ngân sách thời gian: tầng ngoài luôn dài hơn tầng trong
- [x] Upload stream: `pipeline` vs `FileInterceptor`, backpressure, cách đo RSS
      để tự kiểm chứng, upload theo mảnh có `status` để tiếp tục sau khi đứt
- [x] Download: `Range`/`206`/`416` viết tay, rồi thay bằng `X-Accel-Redirect`
      + `internal`, signed URL HMAC với `timingSafeEqual`
- [x] FE mốc #1 (biến `refreshing` gộp mọi refresh vào một promise) và
      mốc #2 (`XMLHttpRequest` vì `fetch` không báo tiến trình upload)

Mạch xuyên suốt đã chốt ở callout cuối: cả 4 vấn đề khó của Part 2 đều là **một
biến thể của double-spend ở Part 1**, và lời giải luôn thuộc 3 loại — khoá lại /
làm nguyên tử / gộp thành một lời gọi. Part 3 nên nối tiếp mạch này.

### Part 3 — Process model & realtime ✅ ĐÃ VIẾT XONG

`blog/build/nestjs-media-platform/part-3.html` — 3.280 từ (chưa tính code),
26 khối code, 1 sơ đồ SVG, 8 mục H2. `check-lesson.js` xanh 11/11.

- [x] Mở đầu: thử nghiệm `/block` + `/ping` 10 dòng cho thấy event loop một luồng
- [x] `child_process`: bảng 4 hàm (`exec`/`execFile`/`fork`/`spawn`) và vì sao
      chỉ `spawn` đúng; `exec` chuỗi ghép = lỗ hổng chèn lệnh; đọc tiến độ bằng
      `-progress pipe:2` + `readline` (KHÔNG bắt `'data'` vì chunk cắt giữa dòng);
      chặn ở 99% vì mã thoát mới là sự thật; `AbortSignal` + SIGTERM→SIGKILL hai
      bước; tiến trình mồ côi và `init: true`
- [x] `worker_threads`: hash worker, `WorkerPool` với `availableParallelism()`
      (không phải `os.cpus().length` — sai trong container), bảng so sánh với
      `child_process`, transfer list chuyển quyền sở hữu thay vì sao chép
- [x] Hàng đợi Redis Streams (`XACK` giữ job khi worker chết, khác `LPOP`),
      `202 Accepted`, retry lùi dần 2/4/8s, DLQ không phải thùng rác
- [x] **Idempotency**: unique index trên `job_id` + `ON CONFLICT DO NOTHING` —
      nối thẳng về sổ cái append-only của Part 1
- [x] **Worker chạy thế nào** (mục 4.3–4.4, bổ sung sau khi rà lại): 
      `createApplicationContext` chứ không `create()`, script trong package.json,
      dịch vụ trong docker-compose, `OnApplicationShutdown` làm nốt job đang dở,
      `stop_grace_period` vs mặc định 10s của Docker
- [x] `cluster`: `availableParallelism`, không fork lại khi thoát do SIGTERM,
      3 thứ vỡ khi chuyển 1→N tiến trình; `cluster` vs nhiều container
- [x] nginx `least_conn` (vì thời gian xử lý rất lệch) + `max_fails`
- [x] Realtime: xác thực ngay lúc bắt tay, room `user:<id>`, worker chỉ
      `publish` ra Redis — không biết gì về WebSocket; kết nối subscribe riêng;
      nginx `Upgrade`/`Connection` + `proxy_read_timeout 3600s`; sticky session
      hoặc `transports: ['websocket']`
- [x] Reconnect/backfill: coi realtime là thứ tăng tốc, nguồn sự thật là bảng
      `jobs` — mỗi lần `connect` gọi `/jobs/active` một phát
- [x] FE mốc #3: `useJobProgress`, `JobList`, `transition-[width]`

Callout đóng bài nối 4 công cụ về một câu hỏi duy nhất: *việc này chạy ở đâu để
không chặn event loop*.

### Part 4 — Tách microservice & vận hành ✅ ĐÃ VIẾT XONG — LOẠT BÀI HOÀN TẤT

`blog/build/nestjs-media-platform/part-4.html` — 2.704 từ (chưa tính code),
20 khối code, 2 sơ đồ SVG, 8 mục H2. `check-lesson.js` xanh 11/11.

- [x] Mục 1 mở bằng **khi nào KHÔNG tách**: lý do thật duy nhất của dự án này là
      hai loại việc cần cách nhân bản khác nhau; kèm callout liệt kê thẳng cái giá
- [x] Ranh giới module không đổi, chỉ đường truyền đổi (SVG trước/sau)
- [x] gRPC: `.proto` là hợp đồng viết ra được; số thứ tự trường quan trọng hơn
      tên; `reserved`; ts-proto sinh kiểu cho cả hai đầu; server streaming cho
      tiến độ; deadline phải TRỪ ĐI thời gian đã tiêu rồi truyền tiếp
- [x] **Transaction vỡ** — 3 kiểu hỏng cụ thể, đảo thứ tự không cứu được; vì sao
      KHÔNG dùng 2PC; outbox pattern + `skip_locked` cho nhiều relay song song
- [x] Outbox chỉ đảm bảo "ít nhất một lần" → bắt buộc đi cặp với idempotency của
      Part 3 (unique index trên `job_id`)
- [x] Cache-aside + dồn toa: `inFlight` (giống `refreshing` của Part 2) + TTL
      ngẫu nhiên; cảnh báo phải xoá cache khi số dư đổi
- [x] Correlation ID qua `AsyncLocalStorage` + gRPC metadata; 3 thứ nên đo
      (phân vị chứ không trung bình, độ sâu hàng đợi, tỷ lệ lỗi từng lời gọi)
- [x] Mục 7 "cố ý không làm": service discovery, circuit breaker, service mesh,
      event sourcing — mỗi cái kèm lý do
- [x] Mục 8 tổng kết: **cùng một bài toán quay lại 5 lần** qua cả 4 part, 3 loại
      lời giải (khoá lại / làm nguyên tử / gộp thành một); 3 hướng đi tiếp

## Đã kiểm runtime & vá lỗi (15/08/2026) — đọc trước khi rà soát lại

Phiên này **không viết nội dung mới** — đóng vai người đọc thật, gõ theo đúng
từng bước 4 part, dựng project thật trong scratchpad (Postgres + Redis +
ffmpeg + protoc thật, KHÔNG phải trong repo này), để trả lời câu hỏi: code
trong bài có thật sự ráp lại và chạy được không.

**Phương pháp:** mọi khẳng định dưới đây đều đo bằng công cụ thật — không có
khẳng định nào chỉ dựa vào đọc code. Vòng kiểm cuối cùng: trích code trực
tiếp từ 4 file HTML **sau khi đã sửa xong**, ráp thành project mới hoàn toàn
tách biệt, chạy `tsc --noEmit` — sạch, 0 lỗi. Bắt được thêm 2 lỗi transcription
(thiếu import, thiếu ép kiểu) chỉ nhờ vòng này và đã vá luôn.

**21 lỗi đã tìm thấy và sửa trực tiếp trong 4 file HTML** (không cần sửa lại,
nếu nghi ngờ thì kiểm bằng cách chạy lại, đừng đọc code rồi đoán):

| # | File | Lỗi | Cách kiểm đã dùng |
|---|------|-----|---------------------|
| A | part-1 | `typeorm-naming-strategies` bỏ hoang từ 2022, không tương thích TypeORM hiện tại → ERESOLVE | `npm install` thật, đối chiếu npm registry |
| B | part-1 | `User`/`Video` entity được dùng khắp nơi nhưng chưa từng có code | viết đủ, `tsc` sạch |
| C | part-1 | `main.ts` mặc định của Nest CLI vỡ dưới `noPropertyAccessFromIndexSignature` | `tsc` thật |
| D | part-1 | Demo nạp credit vi phạm khoá ngoại (chưa từng `INSERT INTO users`) | chạy SQL thật trên Postgres |
| F | part-1 | ERD `users` thiếu cột `role` mà Part 2 RBAC cần | `tsc` báo lỗi thật |
| G | part-2 | `billing.controller.ts` gọi `spend()` — method không tồn tại trên `BillingService` | đối chiếu chữ ký |
| H | part-3 | `chargeForJob()` khai `void` nhưng Part 4 lấy `{charged, balance}` | đối chiếu chữ ký + chạy thật |
| J | part-2 | `replacedByHash` thiếu `type: 'varchar'` → `DataTypeNotSupportedError` | `migration:generate` thật |
| K, L | part-2 | `reissueFrom`/`issuePair` được gọi nhưng sai chữ ký / chưa định nghĩa | `tsc` + kịch bản đua 2-tab thật |
| M | part-2 | Nhánh "đốt family" nằm trong transaction bị rollback khi `throw` → **không bao giờ xoá được gì** | kịch bản đua thật trên Postgres, đếm số dòng trước/sau |
| N | part-3 | `processOne` viết như free function nhưng dùng `this` | đối chiếu cú pháp |
| O | part-1 | Thiếu unique index trên `job_id` → `ON CONFLICT DO NOTHING` không có gì để khớp | gọi `chargeForJob` 2 lần thật, đếm số dòng |
| P | part-3 | Thiếu `ScheduleModule.forRoot()` → `@Interval` không bao giờ chạy, im lặng | app boot thật |
| Q | part-3 | `ProgressGateway` nhận tham số `redis` không dùng → vỡ dưới `noUnusedLocals` | `tsc` thật |
| R | part-2 | `AuthedRequest extends Request` thiếu import → ngầm dùng `Request` của Fetch API thay vì Express | `tsc` thật, lỗi lan khắp nơi dùng |
| T | part-2/3/4 | 10 chỗ dùng nhầm class CSS `callout--warn` thay vì `callout--warning` (không tồn tại trong `blog.css`) | `grep` đối chiếu `blog.css` |
| U | part-2 | Constructor đầy đủ của `AuthService` (6 tham số) chưa từng được gộp một chỗ | đối chiếu 5 mảnh rời rạc |
| E | part-2/3 | **Mảng thiếu lớn nhất**: `RedisService`, `MediaService`, `AuthController`, `JobService`, `JobController`, `JobQueue` (bản đầy đủ), `JobRunner` (constructor + `runTranscode`), `DelayedJobPromoter`, `WorkerModule`, `ProgressSubscriber` — chưa từng tồn tại dưới bất kỳ dạng nào | viết đủ, chạy **toàn trình thật**: enqueue → ffmpeg thật transcode → publish tiến độ qua Redis pub/sub thật → trừ tiền → hoàn tất; nhánh lỗi → retry backoff 2/4/8s → hàng đợi chết, tất cả đo bằng `verify/pipeline-e2e.ts` và `verify/retry-dead-letter.ts` |
| I | part-4 | `media.proto` thiếu `message WatchJobRequest` | `protoc` thật: trước `"WatchJobRequest" is not defined`, sau exit 0 |

**Đã xác nhận app thật khởi động và chạy** (không chỉ biên dịch): `nest build`
sạch, `node dist/src/main.js` boot đủ mọi module, `POST /auth/login` trả về
`201` kèm access token JWT hợp lệ + cookie `refresh_token` đúng cấu hình
(`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/auth/refresh`).

**Commit:** `29b80d2` — `fix(blog): NestJS series — vá 21 lỗi runtime tìm được
khi làm theo bài như người đọc thật`. Chỉ commit local, chưa push (đúng ràng
buộc vận hành ở trên).

## Cấu trúc frontend

Khác với backend (`src/{auth,media,job,billing}` — có hẳn mục "2. Cấu trúc
thư mục" riêng ở Part 1), **frontend không có mục cấu trúc thư mục riêng
trong bài** — chỉ có lệnh khởi tạo (`npm create vite@latest media-forge-web
-- --template react-ts`) và 5 file rải rác qua Part 2 mục 8 + Part 3 mục 7.
Ráp lại, cây thư mục frontend là:

```
media-forge-web/            # du an Vite rieng, KHONG chung repo voi backend
└── src/
    ├── lib/
    │   ├── api.ts           # Part 2 §8.1 — wrapper fetch() + gop refresh vao 1 promise
    │   └── upload.ts        # Part 2 §8.2 — uploadWithProgress() qua XMLHttpRequest
    ├── components/
    │   ├── VideoPlayer.tsx  # Part 2 §8.2 — phat video qua signed URL
    │   └── JobList.tsx      # Part 3 §7   — danh sach tien do, dung useJobProgress
    └── hooks/
        └── useJobProgress.ts # Part 3 §7  — socket.io-client + reconnect-backfill
```

Ban đầu chỉ đọc chéo frontend với backend để lập cây trên (không dựng project
React thật) — việc đọc chéo đó tự nó lộ ra 5 lỗi tích hợp frontend↔backend
thật (V–Z). Toàn bộ đã **sửa và kiểm xong** ở phiên 2 (15/08/2026) — xem mục
ngay dưới đây.

## Đã sửa lỗi tích hợp frontend↔backend (phiên 2, 15/08/2026)

**Phương pháp:** dựng lại project NestJS thật trong
`~/Projects/Scratchpad/media-forge` (KHÔNG phải thư mục scratchpad tạm của
phiên — dùng `~/Projects/Scratchpad` để có thể quay lại sau nếu cần), cùng
Postgres + Redis thật qua Docker, ffmpeg thật. Sau khi sửa, mô phỏng đúng các
lời gọi mà 5 file frontend thực hiện bằng `curl` (HTTP) và `socket.io-client`
(WebSocket) — không chạy `npm create vite@latest` thật. Mọi khẳng định dưới
đây đều đo bằng cách này, không suy đoán từ đọc code.

**5 lỗi tích hợp frontend↔backend tìm thấy khi đọc chéo, đã sửa:**

| # | Chỗ phát hiện | Lỗi | Cách kiểm |
|---|---|---|---|
| V | Part 2 §7.1 vs §7.2 | `/media/:id/play` bắt buộc `JwtAuthGuard` — mâu thuẫn với chính lý do signed-URL tồn tại (thẻ `<video>` không gửi được header). Sửa: bỏ guard, đọc `u`/`e`/`s` từ query, gọi `SignedUrlService.verify()`. | `curl` không kèm `Authorization` → trước: 401, sau: 200 kèm `X-Accel-Redirect` |
| W | Part 2 §7.2 | Thiếu route `GET /media/:id/signed-url` cho `SignedUrlService.sign()`. Đã thêm, có `JwtAuthGuard` (đúng, vì đây là lời gọi `fetch` từ SPA, gửi header được). | `curl` kèm Bearer token → nhận `{ url }` đúng dạng `/media/:id/play?u=...&e=...&s=...` |
| X | Part 3 §7 | Backend chỉ phát `'job:progress'`, `useJobProgress.ts` cần `'job:done'` riêng để chuyển `status` sang `completed`. Đã thêm kênh Redis `job:done` + `ProgressGateway.emitDone()`. | `socket.io-client` thật, enqueue transcode thật qua ffmpeg, nhận đúng `job:done` sau `job:progress` |
| Y | Part 3 §6-7 | Thiếu route `GET /jobs/active`. Đã thêm `JobService.findActiveForUser()` + `JobController.active()`. | `curl` sau khi job hoàn tất → trả đúng `status: 'completed'` |
| Z | Part 3 §7 | `JobState.videoTitle` không có cột nào tương ứng. Đã thêm cột `Video.originalName`, `UploadController` đọc từ header `X-Filename` (upload gửi bytes thô, không phải multipart, nên không có `file.name` tự nhiên). | Upload thật kèm `X-Filename: my%20cool%20video.mp4` → `/jobs/active` trả đúng `videoTitle` |

**9 lỗi backend mới phát hiện trong lúc dựng lại để sửa V–Z** (không liên
quan trực tiếp tới frontend, nhưng lộ ra khi build/chạy thật lại từ đầu):

| # | Lỗi | Cách kiểm |
|---|---|---|
| AA | `stream.controller.ts` gọi `this.media.findPlayable(...)` — method chưa từng được viết, và tên trường trả về (`path`/`sizeBytes`/`storageKey`) không khớp cột thật của `Video` (`originalKey`/`size`). Đã viết, ánh xạ đúng tên cột. | `tsc` + gọi `/media/:id/play` thật |
| AB | `upload.controller.ts` thiếu import (`JwtAuthGuard`, `RateLimitGuard`, `CurrentUser`, `JwtPayload`, `AuthedRequest`, `MediaService`) — lọt qua vòng kiểm phiên 1 vì phiên đó không ghi đè bản HTML vào scratchpad cho đúng file này. | `tsc` |
| AC | `rate-limit.guard.ts` (2 cấp sâu: `src/common/rate-limit/`) import `RedisService` qua `'../redis/redis.service'` — thiếu một cấp `../`, đúng ra phải `'../../redis/redis.service'`. | `tsc` |
| AD | `AuthModule` chỉ export `[AuthService]`, không export `JwtModule` — `ProgressGateway` (ở module khác) tiêm `JwtService` trực tiếp nên không resolve được. | Boot app thật: `UnknownDependenciesException` trước, sạch sau |
| AE | `WorkerModule` có `TypeOrmModule.forFeature([Video])` nhưng thiếu `Job` — `JobRunner` tiêm thẳng `Repository<Job>`. | Boot tiến trình worker thật: lỗi trước, sạch sau |
| — | `nest-cli.json`'s `assets[].outDir` cho file `.lua` (Bug A phiên 1) hoá ra phụ thuộc vào cách TypeScript suy `rootDir` của từng dự án (`dist/` hay `dist/src/`) — không phải một giá trị cố định đúng cho mọi setup. Đã sửa callout thành hướng dẫn tự kiểm (`find dist -iname main.js`) thay vì khẳng định một giá trị. | So sánh 2 lần dựng project ở 2 phiên, ra 2 layout `dist/` khác nhau |
| — | `SignedUrlService.verify()` ném lỗi 500 (thay vì 401) khi thiếu hẳn query param (`Buffer.from(undefined)`) — vá bằng kiểm `undefined` tường minh trong `play()` trước khi gọi `verify()`. | `curl` không kèm query nào → trước: 500, sau: 401 |

**Đã xác nhận chạy thật toàn trình** (không chỉ biên dịch): tạo user →
login → upload video thật (kèm `X-Filename`) → xin signed URL → phát video
**không kèm** header `Authorization` → enqueue transcode → nhận đúng
`job:progress` rồi `job:done` qua WebSocket thật → `GET /jobs/active` phản
ánh đúng `status: 'completed'` và `videoTitle` đúng tên file gốc.

Vòng kiểm cuối: trích lại code từ 4 file HTML **sau khi sửa xong**, đối chiếu
với bản đã chạy được trong scratchpad — khớp hoàn toàn (chỉ khác câu chữ
comment).

**Commit:** `d8cdc2d` — `fix(blog): NestJS series — vá lỗi tích hợp
frontend↔backend + 9 lỗi backend mới`. Chỉ commit local, chưa push.

## Rà soát tĩnh — NestJS Media Platform (15/08/2026, review-build-series)

**TRẠNG THÁI: đã xử lý toàn bộ ở phiên 5 (xem mục "## Phiên 5" bên dưới cho
phương pháp + build thật + 2 lỗi mới phát hiện thêm).** Bảng dưới đây giữ
nguyên làm hồ sơ gốc của phiên 3 (4 dòng xác minh bằng grep thật, còn lại
"can-xac-nhan") — cột **Ghi chú** đã được điền lại theo kết quả xử lý thật ở
phiên 5, đừng đọc cột này như còn là "chưa sửa" nữa.

Đáng chú ý: dù phiên 1-2 đã dựng và chạy thật phần lớn dự án, review này vẫn
tìm ra 31 điều mới — vì phiên 1-2 kiểm qua script gọi thẳng service
(`verify/charge-v1.ts` kiểu vậy), không phải qua đúng HTTP endpoint như bài
mô tả, nên một số route/wiring không bao giờ bị chạm tới trong lúc kiểm.

| # | Part | Vị trí | Loại | Mô tả | Ghi chú |
|---|------|--------|------|-------|---------|
| 1 | 1 | Mục 8.2 (curl `/billing/charge`) đối chiếu mục 7.3 (`app.module.ts`) | Mơ hồ | `app.module.ts` cuối cùng của Part 1 không import `BillingController`/`BillingModule` nào — route `/billing/charge` không tồn tại, 10 lệnh curl trong demo chỉ nhận 404 | ✅ đã sửa + đo thật (phiên 5): thêm `ChargeDto`+`BillingController`+`BillingModule`, đăng ký vào `AppModule`. Build thật: `curl POST /billing/charge` → `201`/`400`, không còn `404` |
| 2 | 1 | `src/billing/billing.service.ts` — "bản đầu tiên" vs "bản đã vá" | Đứt mạch | "Bản đầu tiên" chỉ constructor-inject `entries`; "bản đã vá" dùng `this.dataSource.transaction(...)` nhưng không đoạn nào thêm `dataSource: DataSource` vào constructor | ✅ đã sửa (phiên 5): constructor "bản đã vá" giờ inject cả `entries` lẫn `dataSource`. Build thật: scratchpad vốn đã có constructor đúng từ phiên 1 — chỉ cần đồng bộ bài viết khớp lại |
| 3 | 1 | Mục 7.4 (`\dt`) đối chiếu mục 7.2 (entity đã viết) | Mơ hồ | Kết quả `\dt` liệt kê `media_assets`, `refresh_tokens` nhưng chỉ 4 entity (CreditEntry/Job/User/Video) có code thật; `media_assets` không có entity nào cả | ✅ đã sửa (phiên 5): viết ra `RefreshToken` entity tường minh, xoá dòng `media_assets` khỏi `\dt`. Scratchpad đã có entity này khớp sẵn (cần cho rotation ở phiên 1) |
| 4 | 1 | Mục 3 (cây thư mục) đối chiếu mục 4.5 (`docker-compose.yml`) | Mơ hồ | Comment trong cây thư mục ngụ ý Redis có ngay ở Part 1, nhưng `docker-compose.yml` mục 4.5 chỉ có service `postgres` | ✅ đã sửa (phiên 5) — chỉ văn bản, không ảnh hưởng runtime |
| 5 | 1 | `src/database/data-source.ts` đối chiếu mục 4.1 (danh sách npm install) | Mơ hồ | Import gói `dotenv` nhưng không có lệnh cài đặt nào cho nó — chạy được nhờ dependency bắc cầu của `@nestjs/config`, bài không giải thích | ✅ đã sửa (phiên 5) — chỉ văn bản, không ảnh hưởng runtime |
| 6 | 1 | Mục 3 (cây thư mục) — dòng `docker/Dockerfile` | Mơ hồ | Liệt kê như đã tồn tại nhưng không bước nào tạo nội dung file này | ✅ đã sửa (phiên 5) — chỉ văn bản, không ảnh hưởng runtime |
| 7 | 2 | Mục 4 (`proxy_read_timeout 60s`) đối chiếu mục 5.2 (bảng ngân sách thời gian nói 15s) | Mơ hồ | Hai giá trị mâu thuẫn cho cùng một tham số, không được đối chiếu lại | ✅ đã sửa (phiên 5) — chỉ văn bản/config nginx, không cần dựng nginx thật để đo |
| 8 | 2 | `src/billing/billing.controller.ts` — khung đầy đủ, `ChargeDto` | Thiếu code | `ChargeDto` được import và dùng (`dto.amount`, `dto.reason`) nhưng không có `export class ChargeDto` nào trong cả 4 part | ✅ đã sửa + đo thật (phiên 5): `ChargeDto` bản Part 2 KHÔNG có `userId` (đến từ JWT). Build thật xác nhận route hoạt động đúng |
| 9 | 2 | `src/media/upload.controller.ts` — "nhận từng mảnh", `this.media.tempDir` | Thiếu code | `MediaService` chỉ có `uploadDir`, không có `tempDir`, không có config key nào cho thư mục tạm | ✅ đã sửa + đo thật (phiên 5): thêm `TEMP_UPLOAD_DIR`+`tempDir`+`mkdir`. Build thật: upload 4 mảnh thật, `md5sum` khớp file gốc byte-for-byte |
| 10 | 2 | `upload.controller.ts` (chú thích header `x-filename`) đối chiếu `src/lib/upload.ts` (`uploadWithProgress`) | Mơ hồ | Chú thích hứa header được đặt ở `uploadWithProgress()`, nhưng hàm đó chỉ set `Authorization`/`Content-Type` — không set `x-filename` | ✅ đã sửa + đo thật (phiên 5): thêm `X-Filename` header ở client. Phía server đã đọc/decode đúng từ trước (đo bằng `curl` mô phỏng, tên file có dấu round-trip đúng) |
| 11 | 2 | Mục 6.2 — "ghép các mảnh lại" | Mơ hồ | Không có code/route nào cho bước ghép chunk thành file hoàn chỉnh | ✅ đã sửa + đo thật (phiên 5): route `POST /upload/:uploadId/complete` mới hoàn toàn. Build thật: ghép 4 mảnh, `md5sum` khớp, thư mục tạm bị xoá sau khi xong |
| 12 | 2 | Mục 2.2 (`RolesGuard`, `@Roles()`) | Mơ hồ | Được định nghĩa đầy đủ nhưng không route nào trong Part 2 thực sự dùng `@Roles(...)` để minh hoạ | ✅ đã sửa + đo thật (phiên 5): thêm `GET /billing/:userId/balance` admin-only. Build thật: user thường → `403`, admin thật (tạo trong DB) → `200` |
| 13 | 2 | Mục 8 (cài Tailwind) đối chiếu `VideoPlayer.tsx` | Mơ hồ | Không có bước đăng ký plugin Tailwind trong `vite.config.ts`, nhưng component dùng thẳng class Tailwind | ✅ đã sửa (phiên 5) — thêm `vite.config.ts`+`src/index.css`; chỉ config, KHÔNG chạy frontend thật (React vẫn chưa dựng, xem việc mở riêng) |
| 14 | 3 | `src/worker/job.runner.ts` mục 4.4 (`loop()`) | Đứt mạch | Gọi `this.processOne(job)` nhưng method này chỉ có ở một đoạn RIÊNG mục 4.1 với tên file khác hẳn (`src/job/job.worker.ts`), không được ghép vào class "đầy đủ" | ✅ đã sửa (phiên 5, chỉ bài viết): `processOne` ghép vào class `JobRunner` ở mục 4.4. Code thật trong scratchpad vốn đã đúng từ phiên 1 (worker đã chạy full E2E) — chỉ đồng bộ lại bài |
| 15 | 3 | `src/lib/progress.ts` + `useJobProgress.ts` (hàm `api()`) | Thiếu code | Gọi `api('/jobs/active')` nhưng không import, không có định nghĩa `api` ở đâu | ✅ đã sửa (phiên 5, chỉ import/bài viết) — không cần đổi code thật vì đây là frontend, chưa dựng thật |
| 16 | 3 | `src/cluster.ts` (`void bootstrap()`) | Thiếu code | Gọi `bootstrap()` không import; `bootstrap` duy nhất có trong bài nằm ở `worker/main.ts`, dùng cho tiến trình worker không HTTP — không phải bản API có cổng lắng nghe mà `cluster.ts` cần | ✅ đã sửa + đo thật (phiên 5): `main.ts` bọc `export async function bootstrap()` + guard `require.main === module`. Build thật: `node dist/cluster.js` fork 10 tiến trình thật, mỗi tiến trình boot Nest đầy đủ, `curl` login qua cổng chung thành công |
| 17 | 3 | Mục 4.1, chú thích "Xem class JobRunner đầy đủ ở mục 4.3" | Mơ hồ | Class JobRunner đầy đủ thực ra ở mục 4.4, không phải 4.3 — con trỏ sai | ✅ đã sửa (phiên 5, gộp chung sửa với #14) — chỉ văn bản |
| 18 | 3 | Mục 1, tiêu đề "Thử nghiệm 20 giây" | Mơ hồ | Code chặn đúng 5000ms, văn bản ngay dưới cũng nói "năm giây" — tiêu đề không khớp | ✅ đã sửa (phiên 5) — chỉ văn bản |
| 19 | 3 | Mục 6.1 (đề xuất `ip_hash` riêng cho `/ws`) | Mơ hồ | Thuật toán cân tải là thuộc tính của cả khối `upstream`, không thể khác nhau theo từng `location` dùng chung upstream với `least_conn` đã đặt ở mục 5.1 | ✅ đã sửa (phiên 5) — chỉ văn bản/config nginx, tách khối `upstream app_ws` riêng |
| 20 | 3 | Mục 4.4 (`stop_grace_period: 10m`) | Mơ hồ | Nói "phải nâng hạn" nhưng `docker-compose.yml` đã "chốt" ở mục 4.3 không có trường này | ✅ đã sửa (phiên 5) — thêm code-window minh hoạ dòng cần bổ sung, chỉ văn bản/config |
| 21 | 3 | `src/worker/worker.module.ts` (import RedisModule/BillingModule/JobModule) | Thiếu code | Nội dung 3 module này không xuất hiện trong danh sách export — có thể là boilerplate lược bỏ có chủ đích | **cố ý, không sửa** (phiên 5) — xác nhận đúng là bỏ boilerplate có chủ đích, khớp quy ước chung của cả bài (chỉ hiện `exports:` khi có gotcha thật) |
| 22 | 4 | Mục 3.1, `media.proto` + callout "WatchJobRequest chưa từng được khai báo" | Mơ hồ | **Mâu thuẫn trực tiếp**: code hiển thị NGAY TRÊN đã có `message WatchJobRequest {...}` (đây là bản đã sửa ở phiên 1), nhưng callout cảnh báo cũ bên dưới vẫn nói nó chưa được khai báo — sót lại từ lúc sửa, chưa xoá | ✅ đã sửa (phiên 5): xoá callout lỗi thời |
| 23 | 4 | Mục 5, `balance.cache.ts` (`this.billingClient.getBalance(userId)`) | Thiếu code | `BillingClient` (định nghĩa đầy đủ ở mục 3) chỉ có `charge()`, không có `getBalance()`; phía server cũng chỉ implement `@GrpcMethod` cho `Charge`, không có cho `GetBalance` dù đã khai báo trong `.proto` | ✅ đã sửa + xác minh tĩnh (phiên 5): thêm `getBalance()` cả hai phía. `protoc`+`tsc` thật sạch, kể cả test âm (đổi field sai tên → tsc bắt đúng lỗi) |
| 24 | 4 | Mục 6, `correlation.interceptor.ts` | Đứt mạch | Chỉ 3 dòng lệnh trần, không có function/class/decorator bao quanh — cú pháp không hợp lệ nếu copy y nguyên | ✅ đã sửa + xác minh tĩnh (phiên 5): bọc thành `CorrelationInterceptor implements NestInterceptor`, `tsc --noEmit` sạch |
| 25 | 4 | Mục 3.1, `media.controller.ts` (`ProgressEvent`) | Thiếu code | Kiểu `ProgressEvent` dùng làm type tham số nhưng không được định nghĩa ở đâu, và không khớp `ProgressEvent` có sẵn của DOM | ✅ đã sửa + xác minh tĩnh (phiên 5): interface riêng `JobProgressEvent`, `tsc` sạch (gộp cùng khối với #28) |
| 26 | 4 | Mục 3, lệnh `npx protoc ...` | Mơ hồ | Giả định có sẵn binary `protoc` nhưng danh sách cài đặt phía trên không cài nó | ✅ đã sửa, rồi sửa TIẾP (phiên 5): thêm bước cài `protoc` qua brew/apt — nhưng lý do nhân-quả ban đầu ("thiếu thì `npx protoc` sẽ hỏng") SAI, đã đo thật bằng cách giả lập PATH không có `protoc`: `npx protoc` vẫn chạy được vì tự tải một gói npm tên `protoc` thay thế. Đã sửa lại câu giải thích thành lý do đúng (kiểm soát nguồn gốc/phiên bản binary, không phải "nếu không cài thì hỏng") |
| 27 | 4 | Mục 4.1, `outbox.relay.ts` (`this.dispatch(message)`) | Thiếu code | Method `dispatch` — bước quan trọng nhất của outbox pattern — không có thân hàm ở đâu | ✅ đã sửa + xác minh tĩnh (phiên 5): thêm `dispatch()`. **Trong lúc rà diff, tự phát hiện thêm 1 lỗi ngoài phạm vi dòng này**: `OutboxRelay` không hề có constructor (dùng `this.dataSource` từ trước, giờ thêm cả `this.billingClient`, cả hai chưa từng được inject) — đã thêm constructor tiêm `DataSource`+`BillingClient`, `tsc` sạch |
| 28 | 4 | Mục 3.1, `media.controller.ts` (`watchJob`, `this.progress.on/off`) | Đứt mạch | Method không có class/constructor bao quanh, không rõ `progress` được inject ra sao | ✅ đã sửa + xác minh tĩnh (phiên 5): bọc `MediaGrpcController`, tiêm `EventEmitter2`. `tsc` sạch — nhưng xem việc mở mới "EventEmitter2 vs Redis pub/sub" ở đầu file, chưa rõ ai bắc cầu hai cơ chế |
| 29 | 4 | Mục 5, `balance.cache.ts` | Mơ hồ | Lớp cache in-flight-promise không có `export class .../@Injectable()` bao quanh, không rõ tên lớp | ✅ đã sửa + xác minh tĩnh (phiên 5): bọc `BalanceCache`, tiêm `RedisService`+`BillingClient`, `tsc` sạch |
| 30 | 4 | Mục 4.1, `@Interval(1000)` trong `outbox.relay.ts` | Mơ hồ | Cần `ScheduleModule.forRoot()` (đã biết là Bug P ở phiên 1, nhưng đó là fix cho `WorkerModule`/monolith — Part 4 là project microservice riêng, chưa chắc đã đăng ký lại) | ✅ đã sửa (phiên 5) — thêm callout giải thích, xác nhận bằng đọc/grep (đúng hành vi NestJS đã biết chắc), không dựng media-svc thật để đo |
| 31 | — | `src/lib/upload.ts` (`uploadWithProgress`) đối chiếu `UploadController`/`Video` entity | Đứt mạch | `uploadWithProgress()` ép kiểu trả về `{ videoId: string }` và đọc `result.videoId`, nhưng backend trả nguyên `Video` entity — cột là `id`, không phải `videoId`. `result.videoId` sẽ luôn `undefined` phía client | ✅ đã sửa + đo thật (phiên 5): sửa PHÍA BACKEND (`UploadController.upload()` trả `{ videoId }`), không sửa client. Build thật: scratchpad vẫn trả `Video` thô trước khi sửa (bug thật, đã xác nhận) — sau khi sửa, response chỉ có `{"videoId":"..."}` |

### Đối chiếu lại bảng trên bằng công cụ (15/08/2026, sau khi vá `extract-parts.py`)

`review-build-series` lúc chạy bảng 31 dòng ở trên vẫn dùng bản script cũ —
bản đó chỉ trích ĐỊNH NGHĨA, không trích THAM CHIẾU, nên toàn bộ nhóm "code
được dùng mà không có định nghĩa" là do đọc tay mà ra. Script nay đã được vá
(commit `4817cff` + bản vá tiếp theo) để đối chiếu hai chiều, lọc node_modules,
theo được `class X extends <lớp thư viện>`, và bắt cả `this.method()` tự gọi.

Chạy lại bản đã vá trên đúng 4 file HTML đó: **62 tên được dùng, 27 tên chưa
thấy định nghĩa.** Bỏ đi các tên thuộc thư viện, còn 9 tên đáng đọc:

| Tên | Bảng 31 dòng có bắt không |
| --- | --- |
| `ChargeDto`, `RedisModule`, `BillingModule`, `JobModule`, `transcode`, `dispatch` | ✅ có (dòng 8, 21, 27) |
| `BillingServiceClient`, `ChargeReply`, `ChargeRequest` | ❌ không — xem dòng 32 dưới đây |

Kết luận: **bảng 31 dòng gần như không sót gì ở nhóm "thiếu code"**, và còn bắt
được 6 lỗi mà script *không thể* bắt kể cả sau khi vá — `getBalance` (bị che vì
`BalanceCache` cũng có method trùng tên), `ProgressEvent` (chỉ xuất hiện làm
kiểu tham số), `api()`/`bootstrap()` (gọi trần, không qua `this.`), và
`correlation.interceptor.ts` (không phải file thiếu code mà là khối không có
class/hàm bao quanh). Đọc tay vẫn hơn script ở nhóm này — đừng thay thế.

Một dòng mới, script tìm ra mà bảng cũ chưa có:

| # | Part | Vị trí | Loại | Mô tả | Trạng thái |
|---|------|--------|------|-------|------------|
| 32 | 4 | Mục 3, lệnh `npx protoc` đối chiếu mọi `import ... from '@app/proto-types/...'` | Mơ hồ | Codegen ghi ra `./libs/proto-types` nhưng mọi import lại dùng alias `@app/proto-types/...`, và Part 4 không có chỗ nào khai báo `paths` trong `tsconfig.json` — làm theo đúng bài thì TypeScript không phân giải được alias này | ✅ đã sửa + xác minh tĩnh (phiên 5): thêm `tsconfig.json` với `baseUrl`+`paths`. `tsc` thật xác nhận resolve được (test âm: xoá `paths` → đúng lỗi `TS2307`). **Xác minh tĩnh còn lộ thêm 1 lỗi khác** liên quan trực tiếp tới dòng này — xem "## Phiên 5" |

Ba tên `BillingServiceClient` / `ChargeReply` / `ChargeRequest` bản thân chúng
là file sinh tự động, **không phải lỗi thiếu code** — nhưng chính vì đi qua
alias chưa khai báo mà chúng nổi lên. Xử lý dòng 32 là xử lý luôn cả ba.

## Phiên 5 — xử lý 32 phát hiện + build thật (15/08/2026)

**Phương pháp:** 4 agent song song (1 agent/part) đọc lại TỪNG dòng trong 32
dòng ở trên trực tiếp từ file HTML hiện tại (không tin mô tả có sẵn), xác
nhận lại bằng chứng, rồi đề xuất fix chính xác (file, vị trí, nội dung). Sau
đó 4 agent khác (1 agent/part, chỉ sửa file của part mình — không đụng nhau)
áp fix trực tiếp vào HTML, chạy `check-lesson.js`+`prettier` ngay sau khi
sửa. Tôi tự đọc lại toàn bộ diff của cả 4 file trước khi tin — đây là bước
bắt được lỗi đầu tiên (xem "Lỗi tự phát hiện thêm" bên dưới). Cuối cùng,
**build thật để đo**, đúng kỷ luật đã có từ phiên 1-2:

- **Part 1-3 (monolith)**: dựng lại trong `~/Projects/Scratchpad/media-forge`
  (project đã có từ phiên 2, khởi động lại Postgres+Redis qua Docker vì
  container cũ đã bị xoá sau phiên 2). Với mỗi fix, trước tiên xác nhận code
  THẬT trong scratchpad đã khớp bài viết mới chưa (nhiều fix chỉ sửa văn bản
  bài, code thật vốn đã đúng từ phiên 1-2 vì worker/auth đã chạy full E2E) —
  chỉ những chỗ THẬT SỰ thiếu (BillingController+Module+DTO, chunked-upload
  tempDir+route `/complete`, admin balance endpoint, `UploadController` đổi
  return type, `cluster.ts`+`main.ts` bọc `bootstrap()`) mới cần viết mới và
  đo bằng `curl`/build thật.
- **Part 4 (3 microservice gRPC)**: KHÔNG dựng 3 service thật (việc đó tách
  riêng, xem việc mở đầu file) — xác minh bằng `protoc` thật trên các khối
  `.proto` trích ra, và `tsc --noEmit` thật trên các khối TypeScript trích ra
  (kèm stub tối giản cho type sinh từ proto, dựng trong một thư mục scratch
  npm riêng, không đụng project chính). Có làm test âm (cố ý gõ sai một field
  hoặc xoá một khai báo) để chắc phép thử có ý nghĩa, không phải false-positive.

**Kết quả: 31/32 sửa vào HTML, 1 dòng (#21) xác nhận cố ý không sửa.** Chi
tiết từng dòng đã điền vào cột Ghi chú của bảng 32 dòng ở trên — đọc bảng đó
để biết CHÍNH XÁC dòng nào đo bằng gì, đừng lặp lại việc đã làm.

### Lỗi tự phát hiện thêm (ngoài 32 dòng gốc)

Ba lỗi dưới đây KHÔNG nằm trong 32 phát hiện gốc — phát hiện trong lúc rà
diff hoặc build thật ở chính phiên này. Đúng với mẫu hình đã lặp lại xuyên
suốt cả 5 phiên: mỗi vòng kiểm sâu hơn lại lộ thêm một lớp mới.

1. **`OutboxRelay` (Part 4) không có constructor nào cả** — `this.dataSource`
   đã được dùng từ trước (fix #27 chỉ hỏi thêm `dispatch()`), và giờ
   `this.billingClient` cũng vậy, nhưng class chưa từng khai báo constructor
   tiêm hai thứ đó. Phát hiện khi tôi tự đọc lại diff Part 4 (không phải từ
   verify-agent). Đã thêm `constructor(private readonly dataSource:
   DataSource, private readonly billingClient: BillingClient) {}` + import.
   `tsc` xác nhận sạch.
2. **Không có `ValidationPipe` toàn cục nào được đăng ký ở đâu trong cả loạt
   bài** — phát hiện khi build thật monolith Part 1-3. Mọi DTO dùng
   `class-validator` (`ChargeDto`, `LoginDto`, `RefreshDto`) chưa từng thực
   sự chạy validate lúc runtime, dù Part 1 mục 4.1 khẳng định thẳng
   "class-validator... kiểm tra dữ liệu vào ở lúc chạy" — lời hứa đó chưa
   từng được giữ ở bất kỳ đâu trong 4 part. Đo thật: gọi
   `POST /billing/charge` thiếu `amount` → **`500`** với lỗi Postgres thô
   `22P02 invalid input syntax for integer: "NaN"`, không phải `400` sạch sẽ.
   Đã thêm `app.useGlobalPipes(new ValidationPipe({ whitelist: true,
   forbidNonWhitelisted: true, transform: true }))` vào Part 2, ngay sau khi
   `LoginDto` xuất hiện lần đầu (chỗ tự nhiên nhất — DTO có validate đầu tiên
   của cả bài) — kèm callout dùng đúng con số `500`/`22P02` vừa đo được làm
   ví dụ thật, không bịa.
3. **Lệnh `npx protoc` ở Part 4 thiếu `--proto_path=./proto`** — phát hiện
   khi xác minh tĩnh Part 4. `protoc` phản chiếu đường dẫn tương đối của
   input vào cây output: thiếu cờ này, file sinh ra nằm ở
   `libs/proto-types/proto/billing.ts` thay vì `libs/proto-types/billing.ts`
   — phá MỌI `import ... from '@app/proto-types/...'` trong phần còn lại của
   Part 4 (`Cannot find module`), dù lệnh sinh kiểu tự nó chạy exit 0 không
   báo lỗi gì. Tái hiện được với 2 bản `protoc` khác nhau (hệ thống lẫn
   `npx` tự tải). Đã thêm cờ còn thiếu + một callout giải thích cơ chế.

Một điều chỉnh nhỏ khác (không phải bug mới, mà là sửa một câu giải thích
sai trong chính fix #26): bài nói cần cài `protoc` qua brew/apt vì "không có
nó thì lệnh `npx protoc` sẽ hỏng" — đo thật bằng cách giả lập PATH không có
`protoc` hệ thống: lệnh **vẫn chạy được**, vì `npx` tự tải một gói npm tên
`protoc` thay thế. Việc cài qua brew/apt vẫn là thực hành tốt (kiểm soát
đúng nguồn gốc/phiên bản binary), chỉ là lý do nhân-quả ban đầu không đúng —
đã viết lại câu giải thích cho khớp với hành vi thật.

### Việc mở mới, chưa sửa (ghi vào đầu file rồi, nhắc lại ở đây cho đủ mạch)

**`EventEmitter2` (Part 4, `MediaGrpcController`) và Redis pub/sub (Part 3)
là hai cơ chế tiến độ khác nhau, không thấy đoạn nào bắc cầu chúng lại** —
phát hiện trong lúc xác minh tĩnh Part 4, nhưng CHƯA xác nhận chắc chắn là
lỗi thật hay chi tiết cố ý bỏ qua (Part 4 vốn là phần mở rộng lý thuyết,
chưa từng dựng 3 service thật). Xem chi tiết ở mục "⚠️ Việc còn mở" đầu file.

**Cleanup:** container Docker (`forge-postgres`/`forge-redis`) đã dừng+xoá
sau khi đo xong; thư mục project trong scratchpad còn nguyên (không xoá),
chỉ những file thật sự cần sửa mới bị đổi. Không commit gì trong scratchpad
(không phải git repo). Chưa commit gì vào repo chính ở thời điểm viết mục
này — xem "## Đã xong" phía trên/commit log cho commit thật của phiên này.

## Đã xuất bản ra ngoài (15/08/2026)

Chủ dự án quyết định đưa loạt bài ra hub. Đã làm đủ **4 chỗ**:

1. `blog/index.html` — nhóm mới **"Code thực chiến" / "Real-World Builds"** đặt
   ngay dưới "Programming Courses", 4 mục part-1..4, tag `--build`.
   Nhân tiện đổi **cả ba khối** ("Programming Courses", "Code thực chiến",
   "Tool Guides") từ thẻ vuông sang **dạng danh sách** (`.blog-grid--list`
   trong `blog/blog.css`) — chiều cao trang 6891 → 4489px ở 1280px, giảm 35%.
   Không đổi markup `.blog-card` nào, bỏ một class là quay lại được dạng cũ.
   Cột nhãn cố định 164px: mỗi `.blog-card` là một grid riêng nên phải cố định
   mới thẳng hàng giữa các dòng, và 164px là bề rộng nhỏ nhất giữ được nhãn trên
   một dòng (đo thật: 132px → 10/37 nhãn bị bẻ đôi, 150px → 5, 164px → 1).
   Khối `#searchResultsGrid` vẫn để dạng thẻ — nó không bao giờ hiện cùng lúc
   với ba khối trên, đổi hay không là tuỳ ý.
2. `index.html` (gốc) — learn-card thứ 24 trỏ tới part-1, khoá
   `learn.build.title`/`learn.build.desc` ở cả hai ngôn ngữ trong `i18n.js`.
3. `sitemap.xml` — 4 URL, `priority 0.8`, `lastmod 2026-08-15`.
4. `blog/search-index.json` — 4 entry, `parentSeries: ""` (đây là **bài viết**
   chứ không phải bài học, nên thẻ hiện "Bài viết" chứ không phải "Trong khóa
   học"). `headings*` trích thẳng từ H2/H3 thật của từng part (26/26/18/10 tiêu
   đề), `desc` lấy từ chính thẻ `<meta name="description">`.

Hai bẫy đã gặp và đã vá, ghi lại kẻo lần sau vấp lại:

- **`blog/blog.js` gán nhãn theo `indexOf`, và `'js-'` khớp với `"nestjs-media"`.**
  Không thêm nhánh `build/` **trước** nhánh `js-` thì mọi kết quả tìm kiếm của
  loạt bài này bị gắn nhãn JavaScript. Đã thêm nhánh, kèm chú thích ngay tại chỗ.
- **`-webkit-line-clamp` vô hiệu trên con trực tiếp của grid** (bị blockify,
  `display: -webkit-box` thành `flow-root`). Dùng `max-height` thay thế.

Kiểm thật trên `localhost:5500`: 4 link trả 200; ô tìm kiếm ra đúng bài với
"outbox", "refresh token", "worker_threads", "ffmpeg", "X-Accel-Redirect", và
"xay nen tang media" (không dấu) ra đủ 4 part; sitemap parse XML hợp lệ, 0 URL
trùng; search-index vẫn 1 biến thể schema duy nhất, 0 url trùng.


## Giọng văn — lỗi đã mắc, đừng lặp lại

Chủ dự án bắt được một tật lặp đi lặp lại: **giải thích lý do biên tập cho người
đọc** thay vì viết như một blog thật. Ví dụ nguyên văn bị chê:

> "Chỉ cài thứ dùng ngay trong bài này. Gói cho auth, hàng đợi, WebSocket để các
> part sau cài, tránh một danh sách dài mà chưa biết dùng làm gì"

Nghe như đang biện minh với người ra đề, không phải viết cho người đọc. Các biến
thể cùng tật đã sửa: "để không cài theo quán tính", "Không thêm bảng nào chỉ vì
chắc sau này cần", "Loạt bài này KHÔNG làm snapshot", "Phần này thường bị bỏ qua
trong bài hướng dẫn", "Nhắc lại từ mục 1", "Sở dĩ chọn đúng sản phẩm này".

**Quy tắc:** nói về HỆ THỐNG và CODE, không nói về cách bài viết được lắp ráp.

- ❌ "Chỉ cài thứ dùng trong bài này, tránh danh sách dài"
- ✅ "Part 1 cần ba nhóm gói:"
- ❌ "Loạt bài này không làm snapshot vì đó là tối ưu hoá sớm"
- ✅ "Ở quy mô đang xây thì chưa cần tới snapshot"

Được phép giữ: câu chỉ đường thật sự cần thiết ("Part 2 sẽ dùng cái này"), vì đó
là thông tin cho người đọc chứ không phải lời tự bào chữa.

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
6. **Prism không có sẵn TypeScript.** `blog/prism.js` chỉ vendor: bash, shell,
   sql, json, yaml, python, wgsl, cpp, javascript, c, markup. Khối
   `language-typescript` sẽ hiện ra KHÔNG MÀU mà không báo lỗi gì — chỉ phát
   hiện khi nhìn bằng mắt. Đã thêm component TypeScript chính thức của Prism vào
   cuối `blog/prism.js` (mở rộng từ grammar javascript có sẵn, kèm `decorator`
   cho `@Module()` và alias `ts`). Đã kiểm hồi quy: cpu-cache-memory (js 273
   token) và sql-window-functions (sql 1.458 token) vẫn tô bình thường, 0 lỗi
   console.
   **Còn thiếu cho các part sau:** `protobuf` (Part 4, file .proto) và
   `nginx` (Part 2). Kiểm trước khi dùng `language-<tên>` mới.

## Bối cảnh SEO (nếu ai đó hỏi vì sao chưa đăng)

Trong cùng phiên này đã sửa xong và **đã push** một loạt lỗi SEO của site:
soft 404 toàn site (68 redirect 301 + `404.html`), 6 canonical trỏ tên miền
không tồn tại `js-tools-org`, cả series `repair` thiếu trong sitemap, và
`search-index.json` lẫn 2 schema làm **tìm kiếm blog chết hoàn toàn**.
Repo `angular-image-optimizer` cũng đã sửa tương tự và đã push.

Chủ dự án đang chờ bấm START NEW VALIDATION trong GSC. Trong lúc đó **không nên
đăng thêm trang mới** — đó là lý do loạt bài này chỉ commit local.
