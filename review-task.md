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
| 7 | ✅ một phần — form hiện ra, Tailwind ăn, nhập sai hiện đúng thông báo đỏ. **Đường thành công CHƯA xác nhận** vì `/auth/login` chưa tồn tại: `auth.service.ts` vẫn là 7 mảnh chưa ghép (#12) |
| 8 | ✅ `App.tsx` gọi `LoginForm`, `LoginForm` gọi `login()` trong `api.ts` — không còn file mồ côi. `tsc --noEmit` sạch |

Trang mẫu Vite đã biến mất — đó là mốc mà lượt rà soát trước không đạt được.

## Việc còn lại của lượt rà soát này

- [ ] Sửa nhóm không chặn: #2, #3, #5, #6, #9
- [ ] Quyết #7/#8 (giao diện Part 2 không có màn đăng nhập)
- [ ] Ghép xong `auth.service.ts` rồi chạy thật luồng đăng nhập / refresh — **chưa làm**
- [ ] Part 2 §3 → §7 (nginx, rate limit, streaming) — **chưa làm**
- [ ] Part 2 §8.2 (upload + player chạy thật trong trình duyệt) — **chưa làm**
- [ ] Part 3 — worker, ffmpeg, WebSocket — **chưa làm**
- [ ] Part 4 — microservice, gRPC — **chưa làm**
