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

## Việc còn lại của lượt rà soát này

- [ ] Part 2 §1 → §7 (auth, nginx, rate limit, streaming) — **chưa làm**
- [ ] Part 2 §8.2 (upload + player chạy thật trong trình duyệt) — **chưa làm**
- [ ] Part 3 — worker, ffmpeg, WebSocket — **chưa làm**
- [ ] Part 4 — microservice, gRPC — **chưa làm**
