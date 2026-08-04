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

| Bài | Lệnh                                     | Có gì trong stack                                      |
| --- | ---------------------------------------- | ------------------------------------------------------ |
| 2   | `docker compose --profile base up -d`    | 1 app server (cổng 3001)                               |
| 3   | `docker compose --profile lb up -d`      | nginx làm load balancer (cổng 8080) + 3 app replica    |
| 4   | `docker compose --profile gw up -d`      | nginx làm API gateway (HTTP 8081 + HTTPS 8443) + 3 app |
| 6   | `docker compose --profile edge up -d`    | tầng edge có proxy_cache (cổng 8082) + 3 app           |
| 5   | `docker compose --profile cache up -d`   | thêm Redis (cổng 6379)                                 |
| 7   | `docker compose --profile db up -d`      | thêm PostgreSQL (cổng 5432)                            |
| 7   | `docker compose --profile replica up -d` | PostgreSQL primary (5432) + read replica (5433)        |
| 8   | `docker compose --profile shard up -d`   | hai shard PostgreSQL độc lập (5432, 5434) + router     |
| 10  | `docker compose --profile lock up -d`    | Redis + hai worker tranh một lock (chạy qua `tools/`)  |
| 12  | `docker compose --profile queue up -d`   | Redis Streams + producer/consumer (chạy qua `tools/`)  |

### Bài 4 cần một bước chuẩn bị: chứng chỉ tự ký

Profile `gw` mở cổng HTTPS nên phải có chứng chỉ trước, nếu không nginx sẽ không khởi động
được. Chứng chỉ này chỉ dùng trong lab và đã được `.gitignore` loại ra:

```bash
mkdir -p nginx/certs
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout nginx/certs/lab.key -out nginx/certs/lab.crt \
  -subj "/CN=localhost"

docker compose --profile gw up -d
curl -s  http://localhost:8081/gw-health      # -> gateway ok
curl -sk https://localhost:8443/gw-health     # -> gateway ok  (-k: bỏ qua chứng chỉ tự ký)
```

Hai cổng 8081 (HTTP) và 8443 (HTTPS) **include cùng một file route**
(`nginx/gw-routes.conf`), nên chênh lệch đo được giữa chúng chỉ đến từ TLS chứ không lẫn khác
biệt cấu hình. Đó là lý do cổng HTTP tồn tại — chỉ để làm mốc đo, production không nên mở.

Dừng và xoá sạch:

```bash
docker compose --profile base --profile lb --profile gw --profile edge --profile cache --profile db --profile replica --profile shard --profile lock --profile queue down
```

> `replica` dựng **streaming replication thật**: replica tự chạy `pg_basebackup` từ primary
> trong entrypoint, không cần Dockerfile. Đo lag bằng `./tools/pg-lag.sh`.
>
> **Lưu ý về image:** compose dùng `postgres:18` (bản Debian) chứ không phải `postgres:16-alpine`.
> Hai khác biệt quan trọng nếu bạn đổi tag: `PGDATA` của PostgreSQL 18 bản Debian là
> `/var/lib/postgresql/18/docker`, không phải `/var/lib/postgresql/data`; và bản Alpine
> **không có** `bash`, nên entrypoint của replica được viết bằng POSIX `sh`.
>
> Sau thí nghiệm split-brain (Bài 7 mục 7.4), replica đã thành primary trên timeline mới và
> không quay lại làm standby được. Dựng lại bằng `docker compose --profile replica down -v`
> rồi `up -d` — cờ `-v` **xoá dữ liệu** của cả primary, schema sẽ được nạp lại từ
> `postgres/init/`.
>
> **Bài 8** dùng `postgres` làm shard 1 và thêm `postgres-shard2` — hai database **độc lập
> hoàn toàn**, không replication. Mỗi shard bị giới hạn `cpus: '1.0'` **có chủ ý**: bỏ giới
> hạn đó thì lab đo ra kết quả **ngược hẳn**, vì hai shard chia nhau CPU của cùng một máy —
> đúng cái giới hạn mà sharding sinh ra để vượt qua (xem Bài 8 mục 8.2).
>
> Còn thiếu: **worker cho message queue** (Bài 12).

## Các endpoint của app

| Endpoint            | Dùng để làm gì                                                              |
| ------------------- | --------------------------------------------------------------------------- |
| `/health`           | Health check. `?fail=1` để cố ý báo hỏng, xem LB rút node ra (Bài 3)        |
| `/whoami`           | Cho biết replica nào phục vụ — dùng để thấy LB phân phối (Bài 3)            |
| `/stats`            | Số request, số đang xử lý, hit/miss của cache                               |
| `/fast`             | Trả lời ngay, dùng làm mốc so sánh                                          |
| `/slow-async?ms=50` | Chậm nhưng **không** chặn event loop                                        |
| `/slow-sync?ms=50`  | Chậm và **chặn** event loop — thủ phạm ở Bài 2                              |
| `/cached?key=abc`   | Cache-aside thật với Redis (Bài 5)                                          |
| `/cached?key=abc`   | Tham số: `ttl`, `flight=single`, `jitter=0.2` — bật/tắt từng cơ chế (Bài 5) |
| `/uncached?key=abc` | Luôn đi xuống database — mốc so sánh của Bài 5                              |
| `/reset-stats`      | Xoá bộ đếm, để mỗi phép đo bắt đầu từ 0 (Bài 5)                             |
| `/client-ip`        | Phơi bày lỗ hổng `X-Forwarded-For` — đọc từ trái vs từ phải (Bài 4)         |
| `/aggregate`        | Gộp nhiều nhánh; `?branches=50,120,200&mode=parallel\|sequential` (Bài 4)   |

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

# Đo chi phí TLS trên cùng một route (Bài 4)
docker compose run --rm loadgen loadgen.js --url http://gw:8081/api/fast  -c 8 -d 8 -w 3 --json
docker compose run --rm loadgen loadgen.js --url https://gw:8443/api/fast -c 8 -d 8 -w 3 --json

# Bai 5: khong gian key co kiem soat (hit ratio phu thuoc truc tiep vao no)
docker compose run --rm loadgen loadgen.js --url "http://lb:8080/cached?ttl=300" -c 32 -d 10 -w 3 --key-space 1000 --json

# Cùng phép đo nhưng MỖI REQUEST MỘT KẾT NỐI MỚI — đây mới là chi phí BẮT TAY.
# Chênh lệch giữa hai cách chạy này lớn hơn nhiều so với chênh lệch HTTP/HTTPS ở trên.
docker compose run --rm loadgen loadgen.js --url https://gw:8443/api/fast -c 8 -d 8 -w 3 --no-keepalive --json
```

> `--no-keepalive` buộc mở kết nối mới cho từng request. Với HTTPS, throughput đo được trên máy
> tham chiếu tụt **5,6 lần** so với khi có keep-alive — vì chi phí TLS nằm ở mỗi **kết nối**,
> không phải mỗi request. Bộ đo tải bỏ qua kiểm tra chứng chỉ (`rejectUnauthorized: false`) để
> chạy được với chứng chỉ tự ký; đừng bao giờ dùng cách đó ngoài lab.

**Ba giới hạn phải biết trước khi đọc số** (chi tiết trong phần đầu `loadgen.js`):

1. Đây là đo **kiểu đóng** (closed-loop): mỗi kết nối chờ có phản hồi rồi mới gửi tiếp. Nên
   số kết nối chính là số request đồng thời tối đa, và khi server chậm thì tải gửi vào **tự
   động giảm** — không tái tạo được cảnh người dùng thật vẫn ập vào lúc server đang chết.
2. `loadgen` chạy Node một luồng. Ở tải rất cao, **chính nó** có thể là nút cổ chai. Kiểm tra
   bằng `docker stats`: nếu container loadgen chạm 100% CPU thì số đo đã vô nghĩa.
3. Đừng để loadgen và app tranh cùng lõi CPU rồi kết luận. Trong `docker-compose.yml` mỗi app
   bị giới hạn 1 CPU và loadgen được 2 CPU chính là vì lý do này.

## Bài 10: hai worker tranh một lock

```bash
docker compose --profile lock up -d redis
# ./tools/lock-test.sh <LOCK> <FENCE> <PAUSE_MS> <TTL> <ROUNDS> <WORK_MS>
./tools/lock-test.sh off 0 0    1000 40 300   # khong lock            -> 41/80 xung dot
./tools/lock-test.sh on  0 0    1000 40 300   # lock dung             ->  0/80
./tools/lock-test.sh on  0 0     200 40 300   # TTL < thoi gian xu ly -> 79/80
./tools/lock-test.sh on  0 1200 1000 40 300   # GC pause > TTL        -> 31/80
./tools/lock-test.sh on  1 1200 1000 40 300   # + fencing -> 15 lenh ghi BI TU CHOI
```

> **Về thiết kế thí nghiệm — hai lỗi đã mắc phải khi dựng lab này:**
>
> 1. `WORK_MS` phải đủ dài so với `PAUSE_MS`. Nếu không, worker kia đã ra khỏi vùng tới hạn
>    trước khi "zombie" tỉnh lại, và bạn đo ra 0 xung đột dù lock đã thật sự hỏng.
> 2. Mỗi worker phải hoàn thành đủ số vòng **thành công**. Bản đầu để worker thua `continue`
>    và bỏ luôn vòng đó, nên nó chạy hết 40 vòng trong vài trăm ms rồi thoát — phần lớn thời
>    gian chỉ còn một worker, và "0 xung đột" trở nên vô nghĩa.

## Bài 12: hàng đợi Redis Streams

```bash
docker compose --profile queue up -d redis
# ./tools/queue-test.sh COUNT N_CONSUMER [WORK_MS] [POISON_EVERY] [MAX_ATTEMPTS] [IDEMPOTENT] [ACK_MODE] [DUR] [BATCH]
./tools/queue-test.sh 20000 1 0 0 0 0 after 15000   # msActive 1764ms · 11.338/s
./tools/queue-test.sh 20000 2 0 0 0 0 after 15000   # msActive ~1201ms · tong 16.652/s
./tools/queue-test.sh 20000 4 0 0 0 0 after 15000   # msActive  ~658ms · tong 30.375/s  (chi 2,68x)
./tools/queue-test.sh 5000  1 0 500 0 0 after 15000 # poison: pending=10 ton dong
./tools/queue-test.sh 5000  1 0 500 1 0 after 15000 # co DLQ: dlq=10, pending=0
```

> **Chỉ đọc `msActive`, đừng đọc `rate`.** `rate` chia cho toàn bộ `DURATION_MS` kể cả thời
> gian ngồi chờ stream rỗng, nên nó phản ánh tham số chứ không phản ánh năng lực tiêu thụ.
>
> **Ack sai thời điểm** — kill consumer giữa lô để đo thiệt hại:
>
> ```bash
> docker compose exec -T redis redis-cli DEL lab:jobs
> docker compose run --rm --no-deps -e ROLE=producer -e COUNT=3000 queueworker queue.js
> docker compose run --rm --name qkill --no-deps -e ROLE=consumer -e WORK_MS=5 -e BATCH=500 \
>   -e ACK_MODE=on-receive -e DURATION_MS=30000 queueworker queue.js &
> sleep 1.2 && docker kill qkill
> docker compose exec -T redis redis-cli XPENDING lab:jobs g1 | head -1   # 0   -> mat 352 job
> # doi ACK_MODE=after roi lap lai                                        # 352 -> khoi phuc het
> ```

## Số liệu cache: phải gộp cả ba replica

Mỗi replica đếm **riêng** trong bộ nhớ của nó, nên đọc `/stats` của một replica chỉ cho bạn một
phần ba sự thật. Script dưới đây gộp lại:

```bash
./tools/cache-stats.sh reset    # xoá bộ đếm trên cả 3 replica
./tools/cache-stats.sh          # in tổng: hit ratio, dbQueries, độ sâu hàng đợi DB
```

Hai số liệu quan trọng nhất của Bài 5 là **hit ratio** và **số truy vấn database trên mỗi
request** — không phải "có nhanh hơn không".

### DB_MAX_CONCURRENCY: vì sao con số này quyết định bài học

`app.js` giới hạn số truy vấn database **đồng thời** (mặc định 10/replica), mô phỏng connection
pool có thật. Nếu không có giới hạn này, thundering herd chỉ làm **tăng số truy vấn** mà không
làm chậm gì cả — và mục 5.4 của Bài 5 mất hẳn phần quan trọng nhất. Để tái tạo đúng số liệu
trong bài, hãy thu xuống `'2'` rồi tạo lại container:

```bash
# sửa DB_MAX_CONCURRENCY thành '2' trong docker-compose.yml, rồi:
docker compose --profile cache up -d --force-recreate app1 app2 app3
```

`restart` **không** đọc lại biến môi trường — phải `--force-recreate`.

## Xem load balancer phân phối như thế nào

```bash
docker compose logs --no-log-prefix lb | grep -o 'to=[0-9.:]*' | sort | uniq -c
```

## Vì sao mỗi app chỉ được 1 CPU?

Có chủ ý. Node chỉ có **một luồng JS**, và cả series muốn bạn thấy đúng hiện tượng nghẽn ở
tầng ứng dụng: khi một handler đồng bộ chiếm luồng đó thì **mọi** request khác phải xếp hàng
(Bài 2, mục 2.2). Giới hạn tài nguyên cũng làm kết quả đo bớt phụ thuộc vào việc máy bạn mạnh
cỡ nào, nên số của bạn và số trong bài học so sánh được với nhau.
