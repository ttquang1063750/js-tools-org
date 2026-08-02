# Traffic Lab — môi trường chạy thật cho Series 20 (Thiết Kế Hệ Thống)

Một stack Docker duy nhất dùng cho **cả 18 bài**, mở rộng dần bằng `profiles`. Bạn không phải
dựng môi trường mới ở mỗi bài — chỉ bật thêm profile khi bài học yêu cầu.

Không có Dockerfile, không cần `npm install`: code được bind-mount thẳng vào image `node`
chính thức, nên bạn sửa file là chạy lại thấy ngay và đọc được toàn bộ mã nguồn.

## Yêu cầu

- Docker + Docker Compose v2 (`docker compose version`)
- Khoảng 1.5 GB dung lượng cho các image (`node:22-alpine`, `nginx:1.27-alpine`,
  `redis:7-alpine`, `postgres:16-alpine`)

## ⚠️ Bước tiền kiểm BẮT BUỘC: kiến trúc CPU

Đây không phải thủ tục hình thức — bỏ qua bước này thì **mọi số đo về sau đều vô nghĩa**.

Nếu image bạn đang có là `linux/amd64` nhưng máy bạn là Apple Silicon (`arm64`), container sẽ
chạy qua **tầng giả lập** (emulation): chậm hơn nhiều lần và độ trễ nhiễu nặng. Docker chỉ in
một dòng cảnh báo mờ nhạt rồi vẫn chạy, nên rất dễ lọt.

```bash
# 1) Kiến trúc máy bạn
uname -m                     # arm64 (Apple Silicon) hoặc x86_64 (Intel/AMD)

# 2) Kiến trúc image đang có trong máy
docker image inspect node:22-alpine --format '{{.Os}}/{{.Architecture}}'
```

Hai kết quả phải khớp nhau (`arm64` ↔ `arm64`, `x86_64` ↔ `amd64`). Nếu lệch, kéo lại đúng bản:

```bash
# Apple Silicon
docker pull --platform linux/arm64 node:22-alpine
# Intel / AMD
docker pull --platform linux/amd64 node:22-alpine
```

Kiểm tra lại từ bên trong container — đây mới là bằng chứng cuối cùng:

```bash
docker compose --profile base up -d
docker compose exec app1 node -e "console.log(process.arch)"   # phải khớp uname -m
```

## Các profile theo từng bài

| Bài  | Lệnh                                   | Có gì trong stack                 |
| ---- | -------------------------------------- | --------------------------------- |
| 2    | `docker compose --profile base up -d`  | 1 app server (cổng 3001)          |
| 3, 4 | `docker compose --profile lb up -d`    | nginx (cổng 8080) + 3 app replica |
| 5    | `docker compose --profile cache up -d` | thêm Redis (cổng 6379)            |
| 7    | `docker compose --profile db up -d`    | thêm PostgreSQL (cổng 5432)       |

Dừng và xoá sạch:

```bash
docker compose --profile base --profile lb --profile cache --profile db down
```

> Cấu hình **replica primary/standby** của PostgreSQL và **worker cho message queue** sẽ được
> bổ sung vào chính file `docker-compose.yml` này khi tới Bài 7 và Bài 12. Hiện `db` chỉ dựng
> một node PostgreSQL.

## Các endpoint của app

| Endpoint            | Dùng để làm gì                                                       |
| ------------------- | -------------------------------------------------------------------- |
| `/health`           | Health check. `?fail=1` để cố ý báo hỏng, xem LB rút node ra (Bài 3) |
| `/whoami`           | Cho biết replica nào phục vụ — dùng để thấy LB phân phối (Bài 3)     |
| `/stats`            | Số request, số đang xử lý, hit/miss của cache                        |
| `/fast`             | Trả lời ngay, dùng làm mốc so sánh                                   |
| `/slow-async?ms=50` | Chậm nhưng **không** chặn event loop                                 |
| `/slow-sync?ms=50`  | Chậm và **chặn** event loop — thủ phạm ở Bài 2                       |
| `/cached?key=abc`   | Cache-aside thật với Redis (Bài 5)                                   |

## Đo tải

Bộ đo tải là `loadgen/loadgen.js` — tự viết bằng Node, **không dùng `wrk`**. Lý do: Bài 2 dạy
"đo cho đúng", nếu công cụ đo là hộp đen thì mất luôn bài học đó. Bạn đọc được chính xác nó
bỏ warm-up bao nhiêu, dùng bao nhiêu kết nối và tính percentile theo phương pháp nào.

```bash
# Đo trực tiếp app1 (Bài 2)
docker compose run --rm loadgen loadgen.js --url http://app1:3000/fast -c 20 -d 15 -w 3

# Đo qua load balancer (Bài 3)
docker compose run --rm loadgen loadgen.js --url http://lb:8080/fast -c 50 -d 15 -w 3

# Xuất JSON để tự ghi vào bảng số liệu
docker compose run --rm loadgen loadgen.js --url http://lb:8080/fast -c 50 -d 15 --json
```

**Ba giới hạn phải biết trước khi đọc số** (chi tiết trong phần đầu `loadgen.js`):

1. Đây là đo **kiểu đóng** (closed-loop): mỗi kết nối chờ có phản hồi rồi mới gửi tiếp. Nên
   số kết nối chính là số request đồng thời tối đa, và khi server chậm thì tải gửi vào **tự
   động giảm** — không tái tạo được cảnh người dùng thật vẫn ập vào lúc server đang chết.
2. `loadgen` chạy Node một luồng. Ở tải rất cao, **chính nó** có thể là nút cổ chai. Kiểm tra
   bằng `docker stats`: nếu container loadgen chạm 100% CPU thì số đo đã vô nghĩa.
3. Đừng để loadgen và app tranh cùng lõi CPU rồi kết luận. Trong `docker-compose.yml` mỗi app
   bị giới hạn 1 CPU và loadgen được 2 CPU chính là vì lý do này.

## Xem load balancer phân phối như thế nào

```bash
docker compose logs --no-log-prefix lb | grep -o 'to=[0-9.:]*' | sort | uniq -c
```

## Vì sao mỗi app chỉ được 1 CPU?

Có chủ ý. Node chỉ có **một luồng JS**, và cả series muốn bạn thấy đúng hiện tượng nghẽn ở
tầng ứng dụng: khi một handler đồng bộ chiếm luồng đó thì **mọi** request khác phải xếp hàng
(Bài 2, mục 2.2). Giới hạn tài nguyên cũng làm kết quả đo bớt phụ thuộc vào việc máy bạn mạnh
cỡ nào, nên số của bạn và số trong bài học so sánh được với nhau.
