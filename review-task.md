# review-task.md — NestJS Media Platform

## Rà soát bằng cách LÀM THEO — Part 1 (16/08/2026, review-build-series)

**Đây KHÔNG phải rà soát tĩnh.** Dự án được dựng lại từ con số 0 bằng đúng các
lệnh và đúng các khối code bài đưa, theo thứ tự bài đưa, không thay thế công cụ.

- Project: `~/Projects/Scratchpad/media-forge/` (bản do các phiên trước dựng đã
  đổi tên thành `media-forge.truoc-review-16-08`, không xoá)
- Đã đi hết: Part 1 §1 → §8.2. **Chưa làm**: Part 1 §8.3 trở đi, và toàn bộ
  Part 2, 3, 4. Chưa dựng frontend.
- Môi trường: Node v24.18.0, Docker Compose v5.3.1, Postgres 17-alpine

### Bài chạy đúng như hứa (đã thấy tận mắt)

| Mục | Bài hứa | Thực tế |
|---|---|---|
| §4 | `nest new` rồi `Hello World!` | đúng |
| §4.4 | thiếu biến môi trường thì app dừng ngay, thông báo rõ | đúng — `DATABASE_URL: Invalid input: expected string, received undefined` |
| §4.5 | Postgres healthy qua healthcheck | đúng, `Up (healthy)` |
| §5 | 4 mã lỗi `TS2322 / TS2375 / TS4114 / TS4111` | **khớp tuyệt đối, kể cả số dòng** (3,7 / 9,7 / 16,3 / 21,17) |
| §5 | bật cờ xong `src/main.ts` sẽ vỡ ở `process.env.PORT` | đúng — `src/main.ts(6,32): TS4111` |
| §7.4 | migration sinh ra rồi `\dt` ra 6 bảng | đúng, đủ 6 bảng |
| §8 | bản naive không an toàn dưới tải đồng thời | **đúng** — số dư xuống `-40` sau 9 lần trừ (xem dòng 1) |

### Phát hiện

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 1 | Part 1 §8.2, khối `Terminal` chứa `seq 1 10 \| xargs -P 10` | Đứt mạch | **Demo trung tâm của Part 1 không chạy được như viết.** Body của `curl` chỉ có `userId` và `amount`, thiếu `reason`. Nhưng `ChargeDto` (§8.4) khai `reason!: CreditReason` kèm `@IsIn([...])`, controller truyền `dto.reason`, và cột `reason` trong `credit-entry.entity.ts` là `NOT NULL`. Kết quả chạy thật: **10/10 request trả 500**, `null value in column "reason" violates not-null constraint`, số dư đứng nguyên 50, không trừ đồng nào. Người đọc làm đúng theo bài sẽ không bao giờ thấy được lỗi double-spend mà cả mục 8 dựng lên để dạy. Thêm `"reason":"transcode"` vào body thì ra đúng kết quả bài mô tả (9×201, 1×400, số dư `-40`) | chưa xử lý |
| 2 | Part 1 §5 ("Quy ước còn lại") đối chiếu Part 2 §1 | Đứt mạch | Part 1 viết *"Dữ liệu vào từ bên ngoài luôn phải qua DTO + validation"*, cài `class-validator` và dùng `ChargeDto` — nhưng `app.useGlobalPipes(new ValidationPipe())` chỉ xuất hiện ở **Part 2 §1**. Suốt cả Part 1, mọi DTO là trang trí: đo thật thì thiếu trường bắt buộc không bị chặn ở 400 mà lọt xuống Postgres rồi bật ra 500 (xem phát hiện 1). Không phải "thiếu hẳn" — là **đặt sai thứ tự**, và Part 1 tự nhận có thứ mà nó chưa dựng | chưa xử lý |
| 3 | Part 1 §5, khối `Kết quả chạy thật: npx tsc --noEmit` | Mơ hồ | Bài liệt kê đúng 4 lỗi. Chạy thật với chính `tsconfig.json` bài đưa ra **8 lỗi** — thêm 4 lỗi `TS6133`/`TS6196` (biến khai mà không dùng) do `noUnusedLocals`/`noUnusedParameters` cũng nằm trong khối cấu hình đó. Không sai, nhưng output đã được lọc mà không nói là lọc; người đọc thấy 8 dòng sẽ tưởng mình làm sai | chưa xử lý |
| 4 | Part 1 §5, khối vá `src/main.ts` (2 dòng) | Thiếu code | Đoạn vá dùng `ConfigService` và `AppConfig` nhưng không kèm hai dòng `import`. Gõ đúng như bài: `TS2304: Cannot find name 'ConfigService'` và `TS2304: Cannot find name 'AppConfig'`. (Cú pháp `app.get(ConfigService<AppConfig, true>)` thì **hợp lệ** — instantiation expression của TS 5 — không phải lỗi) | chưa xử lý |
| 5 | Part 1 §4.1, khối `npm i ...` | Mơ hồ | Không ghim phiên bản nào. Chạy hôm nay nhận `typeorm@1.1.0` và `zod@4.4.3` — đều là major mới hơn thời điểm viết bài. Lần này cả hai vẫn chạy đúng (đã kiểm), nhưng bài dựa vào API của TypeORM 0.3 (`DataSource`, `typeorm-ts-node-commonjs`) nên rủi ro vỡ theo thời gian là thật. Cần xác nhận: có nên ghim phiên bản trong lệnh `npm i` không | chưa xử lý |
| 6 | Part 4, một khối code không có `<span class="code-filename">` | Mơ hồ | `extract-parts.py` cảnh báo: Part 4 có 32 khối code nhưng chỉ 31 khối có tên file. Khối còn lại vô hình với mọi công cụ đối chiếu. Chưa đọc tới Part 4 nên chưa biết nó là gì | chưa xử lý |

## Part 1 §8.3 — ĐÃ LÀM, bài đúng hoàn toàn

Áp `billing.service.ts` bản đã vá (`FOR UPDATE` trên dòng `users`), reset sổ cái,
chạy lại đúng lệnh §8.2: **5×201, 5×400, số dư dừng ở 0** — khớp từng con số
bài hứa. Part 1 kết thúc ở đây, không còn phát hiện mới.

## Part 2 — mục 8 (giao diện), đã dựng thật

Project: `~/Projects/Scratchpad/media-forge-web/`, dựng bằng đúng 3 lệnh bài đưa
(`npm create vite@latest ... --template react-ts`, `npm i`, `npm i -D tailwindcss
@tailwindcss/vite`), rồi ghi đúng 3 file bài đưa. `tsc --noEmit` sạch, `npm run
dev` lên ở cổng 5173.

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 7 | Part 2 §8.1 "Mốc #1 — đăng nhập và tự làm mới token" | Đứt mạch | **Mốc này không tạo ra màn đăng nhập nào.** Bài nói *"Phần đáng nói không phải cái form"* rồi chỉ đưa `src/lib/api.ts`. Không có component form, không có `App.tsx`, không sửa `main.tsx`, không có gì gọi `api()` với email/mật khẩu. Làm đúng theo bài xong mở trình duyệt: **hiện nguyên trang mẫu Vite** ("Edit src/App.tsx and save to test HMR"). Mốc mang tên "đăng nhập" nhưng người đọc không đăng nhập được | chưa xử lý |
| 8 | Part 2 §8, cả ba file `api.ts` / `upload.ts` / `VideoPlayer.tsx` | Đứt mạch | Cả ba là file mồ côi — không file nào import file nào, và không có cây component nào gắn chúng vào trang. `VideoPlayer` cần prop `assetId` nhưng không chỗ nào trong bài truyền nó vào. Biên dịch sạch chính vì chưa ai dùng tới | chưa xử lý |
| 9 | Part 2 §8, đối chiếu Part 1 §3 (cây thư mục) | Mơ hồ | Part 1 ghi `web/` là "giao diện React, thêm ở Part 2" — nằm **trong** `media-forge/`. Part 2 lại bảo `npm create vite@latest media-forge-web` thành một dự án **anh em** ở ngoài. Hai chỗ mô tả hai vị trí khác nhau, không chỗ nào nhắc chỗ kia | chưa xử lý |

## Part 2 §1–§2 (auth) — đã làm, dừng giữa chừng ở `auth.service.ts`

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 10 | Part 2 §1, khối `src/main.ts — bật validate toàn cục` | Thiếu code | Dùng `NestFactory.create<NestExpressApplication>(...)` nhưng không kèm `import type { NestExpressApplication } from '@nestjs/platform-express'`. Gõ đúng như bài: `TS2304: Cannot find name 'NestExpressApplication'`. Cùng họ với phát hiện 4 | chưa xử lý |
| 11 | Part 2 §2, khối `src/config/configuration.ts — thêm biến cho auth` | Mơ hồ | Header là đường dẫn file đầy đủ nhưng nội dung chỉ có `const configSchema` — mất `import { z }`, mất `export type AppConfig`, mất `validateEnv`. Người đọc hiểu header theo nghĩa "đây là file" và thay cả file thì lập tức vỡ: `TS2305: Module has no exported member 'AppConfig'` ở 4 file khác nhau. Chữ "— thêm biến cho auth" là gợi ý duy nhất rằng đây là mảnh, và nó nằm ở tiêu đề chứ không phải trong văn bản | chưa xử lý |
| 12 | Part 2, `src/auth/auth.service.ts` — 7 khối rời (block 5, 17, 18, 19, 20, 21, 22) | Đứt mạch | Một file được đưa thành **7 mảnh** mà không có bản hoàn chỉnh nào. Tệ hơn: **`async refresh()` xuất hiện HAI lần** (block 18 "xoay vòng", rồi block 20 "tách tín hiệu ra khỏi transaction") — bản sau thay bản trước nhưng bài không nói rõ là thay. Block 19 (`const GRACE_MS = 30_000;` + một khối `if`) không phải file cũng không phải method, phải chèn vào giữa `refresh()`, không nói chèn ở đâu. Block 22 là "constructor đầy đủ", tức constructor ở block 5 đã lỗi thời. Ghép lại đúng chỉ có thể bằng cách đoán | chưa xử lý |

## Đã sửa vào bài (16/08/2026)

| # | Đã sửa gì | Xác nhận bằng chạy? |
|---|---|---|
| 1 | Part 1 §8.2 — thêm `"reason":"transcode"` vào body `curl` | ✅ **đã xác nhận bằng chạy** — 5×201, 5×400, số dư 0 |
| 4 | Part 1 §5 — thêm 2 dòng `import` vào đoạn vá `main.ts` | ✅ biên dịch sạch |
| 10 | Part 2 §1 — thêm `import type { NestExpressApplication }` | ✅ biên dịch sạch |
| 11 | Part 2 §2 — đổi tiêu đề khối thành "CHỈ thay khối configSchema, giữ nguyên phần còn lại của file" | ✅ ghép đúng thì biên dịch sạch |
| 12 | Part 2 — sửa 7 tiêu đề khối `auth.service.ts` để nói rõ quan hệ: khối nào THAY khối nào, khối nào là đoạn chèn chứ không phải file, constructor nào lỗi thời | chưa ghép lại để chạy |

`check-lesson.js` 11/11 cho cả part-1 và part-2 sau khi sửa.

**#1 đã khép:** lần chạy đầu cho 10×400 không phải do project ở trạng thái lai như
tôi đoán, mà do **phát hiện #14** dưới đây. Sau khi vá cả ba (#1, #2, #14), chạy
lại đúng lệnh trong bài: 5×201, 5×400, số dư dừng ở 0 — khớp bài.

## Phát hiện mới trong lúc sửa

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 13 | Part 2 §2, khối `configuration.ts` đối chiếu Part 1 §4.4 (`.env.example`) | Thiếu code | Schema thêm `JWT_SECRET: z.string().min(32)` **bắt buộc** (cùng `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL_DAYS`, `REDIS_URL`) nhưng **không mục nào bảo thêm chúng vào `.env` / `.env.example`**. Làm đúng theo bài xong chạy `npm run start:dev`: app từ chối khởi động — `JWT_SECRET: Invalid input: expected string, received undefined`. Chặn hoàn toàn phần còn lại của Part 2 | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm một đoạn văn nói rõ 3/4 biến có `.default()` nên chỉ `JWT_SECRET` là bắt buộc, kèm khối Terminal sinh khoá bằng `openssl rand -hex 32` và bổ sung `.env.example`. Chạy lại đúng lệnh đó: khoá dài 64 ký tự, app khởi động bình thường |

## Đợt sửa thứ hai (16/08/2026)

| # | Sửa gì | Xác nhận bằng chạy? |
|---|---|---|
| 2 | Part 1 §8.4 — thêm bước đăng ký `ValidationPipe` ngay sau khi giới thiệu `ChargeDto`, kèm callout nói rõ quên nó thì DTO thành đồ trang trí (500 từ Postgres thay vì 400 từ validation) | ✅ thiếu `reason` giờ ra `400` kèm đúng tên trường |
| 3 | Part 1 §5 — tiêu đề khối ghi rõ "đã lược các lỗi biến-không-dùng", thêm đoạn nói chạy thật ra **8** dòng chứ không phải 4 | ✅ đối chiếu với `tsc` thật |
| 5 | Part 1 §4.1 — thêm chú thích phiên bản đã dùng để viết bài (`typeorm@0.3`, `zod@3`, …) | — |
| 6 | **Không phải lỗi của bài.** Là lỗi `extract-parts.py`: prettier ngắt dòng thẻ `<span class="code-filename">` nên regex trượt. Đã sửa regex; cũng sửa một tiêu đề tôi lỡ nhét `<code>` vào khi vá #12 | ✅ extractor không còn cảnh báo |
| 9 | Part 1 §3 — nói rõ giao diện là dự án **riêng nằm cạnh** `media-forge/`, tên `media-forge-web/` | — |
| 14 | **Mới.** UUID mẫu `11111111-1111-1111-1111-111111111111` dùng suốt §8 **không hợp lệ với `@IsUUID()`** — nibble variant sai RFC 4122. Sau khi #2 bật `ValidationPipe`, chính lệnh curl của bài trả `400 userId must be a UUID`, demo không bao giờ chạy. Đã đổi cả 4 chỗ sang `11111111-1111-4111-8111-111111111111` | ✅ 5×201, 5×400, số dư 0 |

## Đợt sửa thứ ba — #7, #8 (16/08/2026)

Part 2 §8.1 được viết bổ sung, không phải vá chữ:

- `src/lib/api.ts` — thêm `login(email, password)` và `isLoggedIn()`. Trước đó
  `accessToken` là biến private mà **chỉ `refreshOnce()` mới ghi được** — không
  có đường nào đặt token sau khi đăng nhập, nên mốc #1 không thể hoàn thành kể
  cả khi người đọc tự viết form
- `src/components/LoginForm.tsx` — form thật, có trạng thái `busy`, hiện lỗi,
  và `event.preventDefault()`. Bắt lỗi bằng `err instanceof Error` để nối lại
  với cờ `useUnknownInCatchVariables` đã dạy ở Part 1 §5
- `src/App.tsx` — chỗ ráp, thay trọn file Vite sinh sẵn. Đây là mảnh thiếu khiến
  cả ba file trước đó nằm im trên đĩa (#8)
- Một callout "Chạy thử ngay" kèm cấu hình `server.proxy` trong `vite.config.ts`
  — thiếu nó thì trình duyệt chặn vì khác origin, và bài trước đây không hề nhắc

| # | Xác nhận bằng chạy? |
|---|---|
| 7 | ✅ **đầy đủ** — xem "Đợt sửa thứ tư": đăng nhập thật trong trình duyệt, màn hình đổi sang "Đã đăng nhập." |
| 8 | ✅ `App.tsx` gọi `LoginForm`, `LoginForm` gọi `login()` trong `api.ts` — không còn file mồ côi. `tsc --noEmit` sạch |

Trang mẫu Vite đã biến mất — đó là mốc mà lượt rà soát trước không đạt được.

## Đợt sửa thứ tư — ghép `auth.service.ts` và chạy đăng nhập thật (16/08/2026)

Đã ghép 7 mảnh theo đúng tiêu đề vừa sửa ở #12 (bản CUỐI thay bản 1, constructor
đầy đủ thay constructor khung, đoạn ân hạn đã nằm sẵn trong bản cuối). Ghép ra
150 dòng và **biên dịch chỉ còn đúng một lỗi** — tức tiêu đề đã đủ để lần theo.

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 15 | Part 2 §3.3, khối `auth.service.ts — BẢN CUỐI` | Đứt mạch | Bản cuối của `refresh()` **dùng `GRACE_MS` nhưng không khai báo nó**. `const GRACE_MS = 30_000` chỉ nằm trong khối "đoạn thay cho nhánh..." — mà khối đó đã bị bản cuối thay thế. Ghép theo đúng chỉ dẫn: `TS2304: Cannot find name 'GRACE_MS'` | chưa xử lý |
| 16 | Part 2 §3.1, đoạn nói về cột `replaced_by_hash` | Đứt mạch | Bài có nhắc `npm run migration:generate -- AddReplacedByHash` nhưng **lệnh thiếu đường dẫn** (Part 1 §7.4 dùng `-- src/database/migrations/InitSchema`) và **không hề nhắc `npm run migration:run`**. Làm đúng theo bài thì entity có cột còn bảng thì chưa, và `/auth/login` trả **500**: `column "replaced_by_hash" of relation "refresh_tokens" does not exist` — lỗi hiện ở chỗ khác hẳn chỗ vừa sửa | ✅ **đã sửa, đã xác nhận** — thay bằng khối Terminal hai lệnh đầy đủ + callout cảnh báo |

### Đăng nhập đã chạy thật

Sau khi vá #16 và tự thêm `const GRACE_MS` (#15 chưa vá vào bài):

- `POST /auth/login` trả **201**
- Trong trình duyệt: nhập mật khẩu → màn hình đổi sang **"Đã đăng nhập."**
- Nhập sai → thông báo đỏ đúng như thiết kế

**#7 giờ khép lại: đường thành công đã xác nhận bằng trình duyệt thật.**

## Đợt sửa thứ năm — #15 và Part 2 §3 (16/08/2026)

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 15 | Part 2 §3.3, khối `auth.service.ts — BẢN CUỐI` | Đứt mạch | Bản cuối dùng `GRACE_MS` nhưng không khai báo — `const GRACE_MS = 30_000` chỉ nằm trong khối đã bị chính nó thay thế | ✅ **đã sửa** — đưa dòng khai báo vào đầu khối BẢN CUỐI kèm chú thích vì sao nó phải có mặt ở đây |
| 17 | Part 2 §3.3, sau đoạn giải thích khoảng ân hạn | Mơ hồ | §3.3 dựng lên lời hứa trung tâm của cả mục — "dùng lại token cũ thì thu hồi cả family" — nhưng **không cho người đọc cách nào nhìn thấy nó**, khác hẳn Part 1 §8.2 vốn đưa hẳn lệnh. Tệ hơn: thử ngay lập tức sẽ nhận **201** (do khoảng ân hạn 30 giây), trông y như cơ chế phát hiện tái sử dụng bị hỏng. Bài không hề nhắc phải chờ hết ân hạn | ✅ **đã sửa** — thêm khối Terminal 5 bước có `sleep 33`, kèm đoạn giải thích vì sao bước chờ là bước dễ bỏ nhất |

### §3 đã chạy thật, đúng như bài mô tả

- Đăng nhập → xoay vòng một lần → dùng lại token cũ **trong** 30 giây: `201` + access token (đường ân hạn, đúng thiết kế)
- Sau `sleep 33`, dùng lại token cũ: `401 "Phien dang nhap da bi thu hoi"`
- Token **mới** cùng family cũng chết theo: `401 "Refresh token khong hop le"` — đúng nghĩa "thu hồi cả family"

## Đợt sáu — Part 2 §4 (nginx), 16/08/2026

Làm theo bài: tạo `nginx/media-forge.conf` đúng nội dung bài đưa, áp đoạn vá
`src/main.ts` (`app.set('trust proxy', 1)`). `tsc --noEmit` sạch.

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 18 | Part 2 §4, khối `nginx/media-forge.conf` | Đứt mạch | **nginx không bao giờ được dựng lên, ở bất kỳ part nào.** Bài đưa một file cấu hình hoàn chỉnh rồi dừng: không có dịch vụ `nginx` trong `docker-compose.yml`, không có dịch vụ `app` (mà `upstream app { server app:3000; }` trỏ tới — hiện NestJS chạy `npm run start:dev` trên host, chỉ Postgres ở trong Docker), không có bước sinh chứng chỉ cho `ssl_certificate /etc/nginx/certs/fullchain.pem`, không có `nginx -t`, không có một lệnh nào để thấy nó chạy. Đối chiếu Part 3: §5.1 và §6.1 tiếp tục *mở rộng* chính file này (`upstream`, khối WebSocket) mà vẫn không part nào dựng nó. Hệ quả dây chuyền: §4.2 (`trust proxy`), §5 (`limit_req`), §7.1 (`X-Accel-Redirect`, `internal` + `alias /var/media/`) đều là những thứ **chỉ có tác dụng khi có nginx thật** — người đọc không có cách nào nhìn thấy bất kỳ cái nào trong số đó hoạt động | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm khối `openssl` sinh chứng chỉ tự ký, khối `docker-compose.yml` thêm dịch vụ nginx (cổng 8080/8443, mount conf + certs, `extra_hosts: app:host-gateway` để hostname `app` trỏ về tiến trình Node trên host — nhờ vậy **không phải sửa một chữ nào** trong `media-forge.conf`), và khối Terminal 3 lệnh kiểm chứng. Chạy lại từ đầu đúng các lệnh đó: `301` sang HTTPS, đăng nhập thật xuyên qua nginx trả `accessToken`, `http=2` |
| 19 | Part 2 §4.2, khối `src/main.ts` | Mơ hồ | Khối chỉ có 2 dòng (`NestFactory.create` + `app.set`) dưới header đường dẫn file đầy đủ — cùng họ với phát hiện #11 đã sửa. Ở đây hậu quả nhẹ hơn (người đọc khó hiểu nhầm là cả file vì thiếu cả `bootstrap()`), nhưng vẫn không nói rõ là đoạn chèn. Không chặn: gõ vào đúng chỗ thì biên dịch sạch | ✅ **đã sửa** — đổi tiêu đề thành "CHÈN một dòng ngay sau dòng tạo app, giữ nguyên phần còn lại của file". `tsc --noEmit` sạch |

## Đợt bảy — Part 2 §5 (rate limit), 16/08/2026

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 20 | Part 2 §5, khối `nginx — chặn theo IP, ở tầng ngoài cùng` | Đứt mạch | Khối trộn phẳng hai ngữ cảnh nginx khác nhau mà không nói: `limit_req_zone` phải nằm ở ngữ cảnh `http`, còn `location` phải nằm **trong** `server`. Gõ đúng như bài (nối vào cuối `media-forge.conf`): `nginx: [emerg] "location" directive is not allowed here in /etc/nginx/conf.d/default.conf:46`, nginx không nạp được cấu hình. Tệ hơn nữa: hai khối `location` này **thay** khối `location /` đã có ở §4 nhưng đánh rơi cả `proxy_http_version 1.1` lẫn **cả bốn dòng `proxy_set_header`** — tức là đánh rơi đúng `X-Forwarded-For` mà §4.2 vừa dành nguyên một mục để giải thích. Người đọc ghép ngây thơ sẽ vô hiệu hoá `trust proxy` vừa đặt xong ở mục trước | ✅ **đã sửa, đã xác nhận bằng chạy** — thay bằng **bản đầy đủ** của `media-forge.conf` (đẩy 4 dòng `proxy_set_header` + `proxy_http_version` lên mức `server` để cả hai `location` cùng thừa kế), callout giải thích hai ngữ cảnh và cái bẫy location anh em không thừa kế nhau, khối Terminal `nginx -t && nginx -s reload` + vòng 8 request. Chạy thật: `nginx -t` OK, kết quả `400 400 400 400 503 503 503 503`. Thêm một đoạn giải thích vì sao là **503** chứ không phải 429 (mặc định `limit_req`, khác mã 429 của tầng ứng dụng ở §5.1) — trước đây bài không hề đưa output nên con số này chưa từng được nói tới |
| 21 | Part 2 §5.1, khối `src/redis/redis.service.ts` | Thiếu code | **`ioredis` không bao giờ được cài, ở bất kỳ part nào.** Toàn bộ các dòng `npm i` của Part 1 và Part 2 (`@nestjs/config zod`, `dotenv`, `@nestjs/typeorm typeorm pg`, `class-validator class-transformer`, `argon2 @nestjs/jwt`, `@types/express`, `cookie-parser`) không có nó. Gõ đúng như bài: `TS2307: Cannot find module 'ioredis'`, kéo theo `TS2339` ở `defineCommand` và `disconnect` vì lớp cha không phân giải được. Chặn hoàn toàn §5.1 trở đi | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm khối Terminal `npm i ioredis` kèm ghi chú phiên bản (`ioredis@5`). Sau khi cài: `tsc --noEmit` sạch |
| 22 | Part 2 §5.1, đối chiếu Part 1 §4.5 (`docker-compose.yml`) | Thiếu code | **Không part nào thêm dịch vụ Redis vào Compose.** Compose ở Part 1 chỉ có `postgres`; Part 3 có nhắc `redis` nhưng chỉ ở `depends_on` của dịch vụ worker, không có định nghĩa dịch vụ. `REDIS_URL` mặc định `redis://localhost:6379` nên app khởi động được rồi mới chết lúc guard chạy — chứ không dừng sớm như biến thiếu | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm khối `docker-compose.yml` cho dịch vụ `redis` (7-alpine, healthcheck) + khối Terminal `up -d redis` và `redis-cli ping`. Chạy thật: `PONG`. Thêm một đoạn nói rõ mặt trái của `.default()`: thiếu Redis thì app vẫn khởi động rồi mới chết lúc chạy request |
| 23 | Part 2 §5.1 + §6, `RedisService` / `RateLimitGuard` | Thiếu code | Cả Part 2 chỉ có **đúng một** khối `@Module` (mục 2, module auth). Không có `src/redis/redis.module.ts` ở bất kỳ đâu trong loạt bài — nhưng Part 3 §4.3 `import { RedisModule } from '../redis/redis.module'`. Hệ quả trực tiếp ở §6: `@UseGuards(JwtAuthGuard, RateLimitGuard)` không thể phân giải `RedisService` vì không provider nào cung cấp nó. Có thể là boilerplate cố ý lược, nhưng ở đây thì không — đây là mảnh duy nhất nối guard vào ứng dụng | ✅ **đã sửa, đã xác nhận bằng chạy** — viết hẳn khối `src/redis/redis.module.ts` (`@Global`, providers + exports) kèm câu dặn thêm vào `imports` của `AppModule`. Khởi động lại: `[InstanceLoader] RedisModule dependencies initialized`. Guard chạy thật thì xác nhận ở §6 (nơi bài mới gắn nó vào route) |

## Đợt tám — Part 2 §5.2 (ngân sách thời gian), 16/08/2026

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 24 | Part 2 §5.2, khối `Ngân sách thời gian, tính từ trong ra ngoài` | Thiếu code | Bài đưa bốn con số như một cấu hình đã chốt (`statement_timeout` 5s, interceptor 10s, `proxy_read_timeout` 15s, client 20s) và một nguyên tắc rất rõ. Nhưng **ba trong bốn tầng không bao giờ được cài đặt ở bất kỳ part nào**: `statement_timeout` không xuất hiện trong `typeorm.options.ts` hay chuỗi `DATABASE_URL`; không có interceptor timeout nào trong cả loạt bài (grep cả 4 part: chỉ Part 4 có `correlation.interceptor.ts`, việc khác hẳn); `fetch` ở §8 không có `AbortController` nào (hai `AbortController` ở Part 3 là để giết tiến trình ffmpeg, không liên quan). Chỉ `proxy_read_timeout 15s` là thật, vì nó nằm trong file nginx. Người đọc muốn dựng đúng cái ngân sách này không có chỗ nào để bắt đầu | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm đoạn nói rõ chỉ 1/4 con số là thật, rồi đưa `extra: { statement_timeout: 5_000 }` vào `typeorm.options.ts`, viết hẳn `src/common/timeout/timeout.interceptor.ts` + dòng `useGlobalInterceptors`, và callout chỉ cách tự kiểm. Chạy thật: `SHOW statement_timeout` → `5s`, `SELECT pg_sleep(7)` → `canceling statement due to statement timeout`; app vẫn khởi động và phục vụ qua nginx. Tầng thứ tư (`AbortController`) chuyển sang §8 vì thuộc giao diện |

## Đợt chín — Part 2 §6 (upload), 16/08/2026

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 25 | Part 2 §6, `src/media/upload.controller.ts` + `media.service.ts` | Thiếu code | **Không có `MediaModule` ở bất kỳ đâu trong loạt bài.** Gõ đủ cả hai file, `tsc --noEmit` sạch, khởi động lại: NestJS map đúng 5 route cũ (`/auth/*`, `/billing/charge`) và **không có `/media/upload`**. Controller nằm im trên đĩa y hệt ba file frontend ở #8. Ngoài `@Module` ra còn thiếu cả `TypeOrmModule.forFeature([Video])` — không có nó thì `@InjectRepository(Video)` cũng không phân giải được. Cùng họ với #23 nhưng nặng hơn: đây là điểm vào của toàn bộ mục 6 và mục 7 | ✅ **đã sửa, đã xác nhận bằng chạy** — viết hẳn khối `src/media/media.module.ts`. Sau khi thêm: `Mapped {/media/upload, POST} route` |
| 26 | Part 2 §6, `UPLOAD_DIR: z.string().default('./uploads')` | Thiếu code | Không mục nào bảo tạo thư mục đó, và không code nào tự tạo. `createWriteStream(join(uploadDir, ...))` gặp thư mục không tồn tại thì ném `ENOENT` — nhưng vì lỗi xảy ra **giữa chừng một `pipeline` đang đọc body**, người đọc nhận được lỗi 500 ở giữa lúc upload chứ không phải một thông báo cấu hình rõ ràng. `TEMP_UPLOAD_DIR` khai ra nhưng ngoài `this.tempDir = ...` thì cả loạt bài không dùng tới nó ở đâu | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm đoạn giải thích vì sao `createWriteStream` không tự tạo thư mục (và vì sao lỗi nổ ra giữa chừng chứ không phải lúc khởi động) kèm khối `mkdir -p uploads/tmp`. `TEMP_UPLOAD_DIR` chưa dùng tới: để nguyên, Part 3 mới dùng |

| 27 | Part 2 §6, `upload.controller.ts` dòng `@UseGuards(JwtAuthGuard, RateLimitGuard)` | Đứt mạch | **Mới, chỉ lộ ra khi chạy.** Sau khi thêm `MediaModule`, app vẫn không khởi động nổi: `Nest can't resolve dependencies of the JwtAuthGuard (?). Please make sure that the argument JwtService at index [0] is available in the MediaModule module`. Guard được phân giải trong module **dùng** nó chứ không phải module **khai** nó, nên `MediaModule` phải `imports: [AuthModule]`. Bài không nhắc một chữ nào — và thông báo lỗi lại chỉ vào `MediaModule` trong khi `JwtAuthGuard` nằm ở thư mục `auth/`, đủ để người đọc đi sai hướng khá lâu | ✅ **đã sửa, đã xác nhận bằng chạy** — `AuthModule` đưa vào `imports` của `MediaModule` (kèm callout giải thích thông báo lỗi gây hiểu lầm). Khởi động sạch |

### §6 đã chạy thật

- Upload **50 MB** qua nginx → `201` + `{"videoId":"..."}`, file nằm đúng `uploads/<uuid>.bin`
- Upload **800 MB** → `201`, RSS tiến trình **212 MB → đỉnh 262 MB** (tăng ~50 MB, không phải 800) — đúng luận điểm trung tâm của mục 6
- Header trả về có `x-ratelimit-remaining: 19` → **xác nhận #21/#22/#23 bằng chạy**: `RateLimitGuard` gọi script Lua qua Redis thật

## Đợt mười — Part 2 §6.2 (upload nối tiếp), 16/08/2026

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 28 | Part 2 §6.2, hai khối `upload.controller.ts — nhận từng mảnh` và `— ghép mảnh` | Thiếu code | Hai khối rất cẩn thận liệt kê các import `node:fs` mà chúng cần (`mkdir, readdir`, `createReadStream`, `rm`) — nhưng **quên hẳn `Param` và `Get` từ `@nestjs/common`**, vốn không có trong dòng import của khối §6 (`Controller, Post, Req, UseGuards, BadRequestException`). Gõ đúng như bài: 5 lỗi `TS2304: Cannot find name 'Param'` / `'Get'`. Cùng họ với #4, #10 — nhưng ở đây khó thấy hơn vì khối *có* phần import, chỉ là import không đủ | ✅ **đã sửa, đã xác nhận bằng chạy** — thêm dòng chú thích nêu rõ phải bổ sung `Get, Param` vào dòng import `@nestjs/common` đã có, và đổi hai tiêu đề khối thành "THÊM method vào class đã có ở mục 6". Sau khi sửa: `tsc` sạch, cả 3 route `/media/upload/:uploadId/*` được map |
| 29 | Part 2 §6.2, `uploadId` lấy thẳng từ `@Param` | Mơ hồ | `join(this.media.tempDir, uploadId)` với `uploadId` là chuỗi tuỳ ý từ URL. `join` chuẩn hoá `..`, nên `uploadId = '../../etc'` ghi ra ngoài `tempDir`. Ngoài ra không endpoint nào trong ba endpoint kiểm `uploadId` có thuộc về người gọi hay không — người dùng B đoán/biết `uploadId` của A thì gọi `complete` được và video về tài khoản B. Bài không nói gì về cả hai điểm; có thể là cố ý lược cho gọn, nhưng mục 6 vốn đã rất kỹ về chuyện "làm đúng" nên chỗ im lặng này lệch tông | ✅ **đã sửa** — thêm callout "Hai lỗ hổng cố tình để trống ở đây" nói thẳng cả hai (traversal qua `join`, và không kiểm chủ sở hữu `uploadId`) kèm hướng chữa (`ParseUUIDPipe`, lưu chủ sở hữu từ mảnh đầu). Giữ nguyên code — bài chọn không cài, giờ thì nói ra chứ không im lặng |

### §6.2 đã chạy thật, đúng kịch bản bài dựng lên

File 25 MB chia 5 mảnh: gửi 3 mảnh → `status` trả `{"received":[0,1,2]}` → gửi
tiếp mảnh 3,4 → `complete` → `{"videoId":"..."}`. **SHA-256 của file ghép lại
giống hệt file gốc**, và `uploads/tmp/<uploadId>` đã tự dọn. Logic §6.2 đúng
hoàn toàn — chỉ thiếu đúng hai import.

## Việc còn lại của lượt rà soát này

- [ ] Sửa nhóm không chặn: #2, #3, #5, #6, #9
- [ ] Quyết #7/#8 (giao diện Part 2 không có màn đăng nhập)
- [ ] Part 2 §4 → §7 (nginx, rate limit, streaming) — **chưa làm** (§3 đã xong)
- [ ] Part 2 §8.2 (upload + player chạy thật trong trình duyệt) — **chưa làm**
- [ ] Part 3 — worker, ffmpeg, WebSocket — **chưa làm**
- [ ] Part 4 — microservice, gRPC — **chưa làm**
