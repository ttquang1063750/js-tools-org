# task.md — Thiết Kế Hệ Thống / System Design

> File nay do `make-task.py` sinh ra tu hien trang repo. **Dung tich tay cac o
> trong muc "May kiem duoc"** — chay lai script la chung tu dong dong bo:
>
> ```bash
> D=.claude/skills/beginner-proof-series
> python3 $D/make-task.py .claude/skills/beginner-proof-series/series/sysdesign
> ```

## Bat dau tu day

Doc `.claude/skills/beginner-proof-series/SKILL.md` truoc — no giai thich
_cach_ lam. File nay chi noi _con lai nhung gi_.

Hai lenh cho biet trang thai bat ky luc nao:

```bash
D=.claude/skills/beginner-proof-series
python3 $D/next-lesson.py blog/sysdesign/sysdesign-programming-series.html
python3 $D/verify-series.py .claude/skills/beginner-proof-series/series/sysdesign
```

**Tien do: 9/18 bai da co ban EN.** Checker dang **xanh**.

## Cac bai con lai

### Bai 10: Distributed Lock

- VI: `blog/sysdesign/sysdesign-distributed-lock.html`
- EN can tao: `blog/sysdesign/en/sysdesign-distributed-lock.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-distributed-lock.html`)
- [ ] co template de dung lai (`sysdesign-distributed-lock.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 11: Idempotency & Retry An Toàn

- VI: `blog/sysdesign/sysdesign-idempotency.html`
- EN can tao: `blog/sysdesign/en/sysdesign-idempotency.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-idempotency.html`)
- [ ] co template de dung lai (`sysdesign-idempotency.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 12: Message Queue & Xử Lý Bất Đồng Bộ

- VI: `blog/sysdesign/sysdesign-message-queue.html`
- EN can tao: `blog/sysdesign/en/sysdesign-message-queue.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-message-queue.html`)
- [ ] co template de dung lai (`sysdesign-message-queue.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 13: Rate Limiting & Backpressure

- VI: `blog/sysdesign/sysdesign-rate-limiting.html`
- EN can tao: `blog/sysdesign/en/sysdesign-rate-limiting.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-rate-limiting.html`)
- [ ] co template de dung lai (`sysdesign-rate-limiting.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 14: Event Sourcing & CQRS

- VI: `blog/sysdesign/sysdesign-event-sourcing.html`
- EN can tao: `blog/sysdesign/en/sysdesign-event-sourcing.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-event-sourcing.html`)
- [ ] co template de dung lai (`sysdesign-event-sourcing.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 15: Monolith vs Microservices

- VI: `blog/sysdesign/sysdesign-monolith-microservices.html`
- EN can tao: `blog/sysdesign/en/sysdesign-monolith-microservices.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-monolith-microservices.html`)
- [ ] co template de dung lai (`sysdesign-monolith-microservices.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 16: Observability: Metrics, Logs & Tracing

- VI: `blog/sysdesign/sysdesign-observability.html`
- EN can tao: `blog/sysdesign/en/sysdesign-observability.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-observability.html`)
- [ ] co template de dung lai (`sysdesign-observability.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 17: Chế Độ Lỗi & Khả Năng Chống Chịu

- VI: `blog/sysdesign/sysdesign-resilience.html`
- EN can tao: `blog/sysdesign/en/sysdesign-resilience.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-resilience.html`)
- [ ] co template de dung lai (`sysdesign-resilience.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 18: Capstone: Thiết Kế & Chạy Thật Một Hệ Thống

- VI: `blog/sysdesign/sysdesign-capstone.html`
- EN can tao: `blog/sysdesign/en/sysdesign-capstone.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai (`blog/sysdesign/en/sysdesign-capstone.html`)
- [ ] co template de dung lai (`sysdesign-capstone.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

## Cac bai da xong

Khong can doc lai nhung bai nay — `verify-series.py` giu chung dung.

- [x] Bai 1: Latency, Throughput & Lý Thuyết Hàng Đợi
- [x] Bai 2: Dựng Lab & Đo Giới Hạn Một Server
- [x] Bai 3: Scale Ngang & Load Balancing
- [x] Bai 4: Reverse Proxy & API Gateway
- [x] Bai 5: Caching: Cache-Aside, TTL & Vô Hiệu Hoá
- [x] Bai 6: CDN & Edge Caching
- [x] Bai 7: Replication & Scale Tầng Đọc
- [x] Bai 8: Sharding & Consistent Hashing
- [x] Bai 9: CAP & Các Mô Hình Nhất Quán

## Viec o cap series (lam mot lan)

- [x] Hub co ban tieng Anh (`blog/sysdesign/en/sysdesign-programming-series.html`)
- [x] Hub tieng Viet co `hreflang` va link locale hien thi
- [ ] Chrome thong nhat giua cac bai EN (checker ep theo `config.json`)

## Khi xong het

```bash
python3 .claude/skills/beginner-proof-series/make-task.py .claude/skills/beginner-proof-series/series/sysdesign --finish
```

Lenh nay chi chay khi moi bai da co ban EN **va** checker xanh. No don noi
dung file, giu lai file cho lan lam viec sau.
