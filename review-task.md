# review-task.md — NestJS Media Platform

> File này do skill `review-build-series` ghi ra. Đây là lần đầu tiên dùng file
> riêng này (trước đó review-build-series và design-build-series dùng chung
> `task.md` với lịch sử đầy đủ của loạt bài — vẫn còn ở đó, xem `task.md` ở
> repo root nếu cần bối cảnh cũ).

## Rà soát tĩnh — NestJS Media Platform (15/08/2026, review-build-series)

**Phạm vi lần này: CHỈ 3 chỗ mới thêm vào Part 4 ở phiên 7** — đoạn
`ProgressBridge` trong mục 3.1, mục 3.2 "Auth-svc: cùng logic, khoác vỏ gRPC",
mục 3.3 "Bắc cầu gRPC streaming sang WebSocket". KHÔNG audit lại Part 1-3 hay
các mục khác của Part 4 (đã làm ở phiên 3-5, xem `task.md`) — phiên trước từng
mở rộng nhầm ra cả 4 part, chủ dự án đã dừng lại và yêu cầu thu hẹp đúng phạm
vi này.

Phương pháp: 1 agent đọc trực tiếp HTML (không chỉ dựa vào bản trích xuất của
`extract-parts.py`), đối chiếu ngược Part 1-3 làm ngữ cảnh tham chiếu (không
audit độc lập). Trong lúc chạy `extract-parts.py` để chuẩn bị, phát hiện thêm
1 lỗi trong chính script (`EXPORT_RE`/`LOCAL_DECL_RE` bỏ sót `export async
function` — đã vá, xem commit `b9dc494`).

Khác với quy ước "chỉ đọc, không sửa" thường lệ của skill này: 4/6 phát hiện
dưới đây **đã được sửa ngay** thay vì để "chưa xử lý" — vì phát hiện #1
nghiêm trọng (mâu thuẫn trực tiếp với chính câu "đo thật" vừa viết ở phiên 7)
và bắt nguồn từ lỗi khi TÔI tổng hợp báo cáo build thành văn bài, không phải
lỗi cần một phiên build riêng mới xác nhận được — đã đối chiếu lại với code
thật trong `~/Projects/Scratchpad/media-forge-services/` để biết chính xác
cách sửa, không suy đoán.

| # | Vị trí | Loại | Mô tả | Trạng thái |
|---|--------|------|-------|------------|
| 1 | Part 4, mục 3.1 (đoạn dẫn `ProgressBridge`) đối chiếu Part 3 mục 4.2 (`Math.min(99, ...)`, `redis.publish('job:done', ...)`) | Đứt mạch | Bài viết khẳng định "worker không đổi khi tách dịch vụ" — SAI. Worker thật của Part 3 báo tiến độ bằng HAI tín hiệu tách biệt (kênh `'progress'` mang `percent` chặn ở 99, kênh `'job:done'` riêng không mang `percent`/`status`), trong khi `rpc WatchJob` cần MỘT luồng `JobProgress` đồng nhất. Nếu thật sự "không đổi", `event.status` luôn `undefined` và `percent` không bao giờ chạm 100 — điều kiện `subscriber.complete()` ở `MediaGrpcController` và `status === 'completed'` ở `ProgressGateway` không bao giờ kích hoạt được, mâu thuẫn với callout "đo thật 0%, 96%, 100%, rồi job:done" ngay bên dưới. Đối chiếu code thật đã build ở phiên 7 (`apps/media-svc/src/worker/transcode-worker.ts`) xác nhận: worker THẬT SỰ đã gộp về một kênh, một hình dạng — bài chỉ quên nói rõ điều đó. | ✅ đã sửa — viết lại đoạn dẫn + thêm code-window "trước/sau" đối chiếu 2 kênh cũ của Part 3 với 1 kênh mới của media-svc |
| 2 | Part 4, mục 3.3 (`ProgressGateway`, sự kiện `'job:subscribe'`) đối chiếu Part 3 mục 7 (`useJobProgress.ts`) | Thiếu code | Thiết kế mới đòi client phải chủ động `socket.emit('job:subscribe', {jobId})` thì gateway mới mở `watchJob(jobId)`. Nhưng `useJobProgress.ts` viết ở Part 3 chỉ lắng nghe thụ động `'job:progress'`/`'job:done'`, không bao giờ emit sự kiện mới này — theo đúng bài, giao diện Part 3 sẽ im lặng không nhận gì sau khi tách dịch vụ. | ✅ đã sửa — thêm đoạn cập nhật `useJobProgress.ts` (emit `job:subscribe` cho từng job đang `queued`/`processing` ngay sau khi nhận `/jobs/active`) |
| 3 | Part 4, mục 3.1 `progress-bridge.ts` (`import { RedisService } from '../redis/redis.service'`) đối chiếu mục 5 `balance.cache.ts` (`import ... from '../../redis/redis.service'`) | Mơ hồ | Hai file cùng nằm ở độ sâu `apps/media-svc/src/<thư-mục-con>/` nhưng import `RedisService` với số cấp `../` khác nhau — một trong hai chắc chắn sai. Đối chiếu code thật đã build ở phiên 6-7 (`apps/media-svc/src/cache/balance.cache.ts`, `apps/media-svc/src/redis/redis.service.ts`): cấu trúc thật là `src/{cache,progress,redis,...}/` — cùng cấp, cả hai chỉ cần `../redis/redis.service`. Vậy dòng của `balance.cache.ts` (`../../redis/...`, viết ở phiên 6) mới là dòng sai, không phải dòng mới viết ở phiên 7. | ✅ đã sửa — `balance.cache.ts` đổi `../../redis/redis.service` thành `../redis/redis.service`, khớp `progress-bridge.ts` và code thật |
| 4 | Part 4, callout mục 3.1 "⚠️ Hạn chót phải truyền tiếp" đối chiếu `AuthClient` mục 3.2 (`timeout(3000)` cố định) | Mơ hồ | Callout giải thích đúng nguyên tắc deadline phải trừ dần qua từng tầng, nhưng không có đoạn code nào trong cả bài — kể cả `AuthClient` mới ngay sau đó — minh hoạ cách làm; mọi client đều dùng `timeout(3000)` cố định. | can-xac-nhan, **cố ý không sửa lần này** — đối chiếu lại thì `BillingClient` (viết từ trước phiên 7, mục 3) đã dùng đúng cùng kiểu `timeout(3000)` cố định này rồi; `AuthClient` chỉ theo đúng khuôn có sẵn, không phải điểm không nhất quán MỚI do phiên 7 gây ra. Để phiên sau quyết định có muốn viết thêm ví dụ deadline lan truyền thật hay không — đó là bổ sung nội dung mới, không phải sửa lỗi |
| 5 | Part 4, mục 3.2 ("đúng ba dòng trong bảng `refresh_tokens`") | Mơ hồ | Con số "ba dòng" không tự suy ra được từ mô tả định tính ở Part 2 mục 3.3 — cần đọc thêm để biết phép đếm | ✅ đã sửa — thêm mệnh đề ngắn liệt kê rõ 3 dòng đó là gì (token gốc đã dùng + 2 token mới sinh từ 2 nhánh của cuộc đua) |
| 6 | Part 4, mục 3 ("Cài và sinh kiểu") đối chiếu `MediaGrpcController`/`ProgressBridge` (cả hai `import ... from '@nestjs/event-emitter'`) | Thiếu code | `@nestjs/event-emitter` chưa từng xuất hiện trong bất kỳ lệnh `npm i` nào. Gốc gác là từ `MediaGrpcController` (viết ở phiên 5, ngoài phạm vi phiên 7), `ProgressBridge` (phiên 7) chỉ kế thừa cùng phụ thuộc | ✅ đã sửa — thêm `@nestjs/event-emitter` vào lệnh `npm i` sẵn có ở mục 3 (tiện thể vì đang sửa mục này, dù gốc gác là gap từ phiên 5) |

**Không phải lỗi — đã kiểm và khớp** (không đưa vào bảng phát hiện chính):
callout "5 dòng đổi" (mục 3.2) đúng khớp diff thật; constructor 6 tham số của
`AuthService` khớp Part 2; cross-reference "Part 2 mục 3.3"/"mục 3.5" đúng số
mục thật; mọi field trong `proto/auth.proto` dùng đúng dạng camelCase sinh từ
ts-proto, không dư không thiếu; callout mở đầu + mục 8 "Nhìn lại cả bốn part"
vẫn khớp ở mức trừu tượng đã chọn, không cần cập nhật. Không nêu thành phát
hiện: thiếu `@Module`/bootstrap cho auth-svc/gateway ở mục 3.2/3.3 — cùng
khuôn mẫu bỏ boilerplate mà cả mục 3 (billing-svc, media-svc) đã dùng từ
trước, nhiều khả năng cố ý.

**Kiểm sau khi sửa:** `node check-lesson.js` xanh 11/11, `npx prettier
--write` sạch.

**Commit:** (điền sau khi commit — xem `task.md` phiên tiếp theo hoặc git log
`blog/build/nestjs-media-platform/part-4.html` nếu file này chưa được cập
nhật kịp).
