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
| 2 | Part 1 §5 ("Quy ước còn lại") đối chiếu `src/main.ts` | Thiếu code | Bài viết *"Dữ liệu vào từ bên ngoài luôn phải qua DTO + validation"* và cài `class-validator`, nhưng **không mục nào đăng ký `app.useGlobalPipes(new ValidationPipe())`**. Hệ quả đo được ở phát hiện 1: thiếu một trường bắt buộc của DTO không bị chặn ở tầng validation (400) mà lọt xuống tận Postgres rồi bật ra 500. Toàn bộ `class-validator` trong Part 1 hiện không có tác dụng | chưa xử lý |
| 3 | Part 1 §5, khối `Kết quả chạy thật: npx tsc --noEmit` | Mơ hồ | Bài liệt kê đúng 4 lỗi. Chạy thật với chính `tsconfig.json` bài đưa ra **8 lỗi** — thêm 4 lỗi `TS6133`/`TS6196` (biến khai mà không dùng) do `noUnusedLocals`/`noUnusedParameters` cũng nằm trong khối cấu hình đó. Không sai, nhưng output đã được lọc mà không nói là lọc; người đọc thấy 8 dòng sẽ tưởng mình làm sai | chưa xử lý |
| 4 | Part 1 §5, khối vá `src/main.ts` (2 dòng) | Thiếu code | Đoạn vá dùng `ConfigService` và `AppConfig` nhưng không kèm hai dòng `import`. Gõ đúng như bài: `TS2304: Cannot find name 'ConfigService'` và `TS2304: Cannot find name 'AppConfig'`. (Cú pháp `app.get(ConfigService<AppConfig, true>)` thì **hợp lệ** — instantiation expression của TS 5 — không phải lỗi) | chưa xử lý |
| 5 | Part 1 §4.1, khối `npm i ...` | Mơ hồ | Không ghim phiên bản nào. Chạy hôm nay nhận `typeorm@1.1.0` và `zod@4.4.3` — đều là major mới hơn thời điểm viết bài. Lần này cả hai vẫn chạy đúng (đã kiểm), nhưng bài dựa vào API của TypeORM 0.3 (`DataSource`, `typeorm-ts-node-commonjs`) nên rủi ro vỡ theo thời gian là thật. Cần xác nhận: có nên ghim phiên bản trong lệnh `npm i` không | chưa xử lý |
| 6 | Part 4, một khối code không có `<span class="code-filename">` | Mơ hồ | `extract-parts.py` cảnh báo: Part 4 có 32 khối code nhưng chỉ 31 khối có tên file. Khối còn lại vô hình với mọi công cụ đối chiếu. Chưa đọc tới Part 4 nên chưa biết nó là gì | chưa xử lý |

### Việc còn lại của lượt rà soát này

- [ ] Part 1 §8.3 → hết part (bản đã vá `FOR UPDATE`, bảng so sánh 3 cách)
- [ ] Part 2 — kèm **dựng frontend React thật** ở `~/Projects/Scratchpad/media-forge-web/`, mở trình duyệt, không thay bằng `curl`
- [ ] Part 3 — worker, ffmpeg, WebSocket
- [ ] Part 4 — microservice, gRPC
