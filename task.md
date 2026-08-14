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

## Còn lại — khi chủ dự án quyết định xuất bản

Cả 4 part đã viết xong và commit local. Chưa xuất hiện ở bất kỳ đâu ngoài chính
4 file HTML. Khi muốn công khai, thêm vào **4 chỗ**:

1. `blog/index.html` — card trong lưới, tag class `--build`
2. `index.html` (gốc) — `a.learn-card`
3. `sitemap.xml` — 4 URL
4. `blog/search-index.json` — 4 entry theo schema 7 khoá chuẩn

Lý do hoãn vẫn giữ nguyên: site mới ~2,5 tháng tuổi, đang cần giảm nhịp xuất bản.
Part 5 — chỉ tạo NẾU cần

Được phép tách nếu Part 3 hoặc Part 4 phình quá dài. Chỗ cắt tự nhiên đã chọn:
sau phần realtime (hết Part 3), vì lúc đó sản phẩm đã chạy trọn vòng
upload → transcode → xem tiến độ. Nếu tách, dời phần cache + vận hành sang
Part 5 và để Part 4 thuần về tách service.

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
