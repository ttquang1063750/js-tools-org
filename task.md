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

**Tien do: 15/18 bai da co ban EN.** Checker dang **xanh**.

## Viec o cap toan site (khong thuoc series nao)

> Ghi tay vao `.claude/skills/beginner-proof-series/open-work.md`.
> `make-task.py` chen nguyen phan nay vao `task.md`, nen no khong bi mat khi sinh lai.
> Xong viec nao thi xoa muc do khoi file nay.

### 1. ~~Chan doan loi chuyen ngon ngu~~ — DA SUA

Nguyen nhan: `applyLang()` GHI localStorage ngay ca o lan ve dau tien luc tai
trang. Tren trang co ban dich thi `lang = contentLang`, nen chi can MO mot trang
tieng Viet la lua chon "English" cua nguoi dung bi ghi de thanh "vi" — ho doi
ngon ngu xong, sang trang khac la mat.
Da sua: `applyLang(l, persist = true)`, lan ve dau goi voi `persist = false`.
Chi ghi khi nguoi dung THUC SU bam nut.
Da them 4 khang dinh vao `i18n-locale-selftest.mjs` va negative-test: khoi phuc
hanh vi cu thi truot dung khang dinh do.

### 2. Tao trang stub tieng Anh — CAN XEM LAI CO CON CAN KHONG

So lieu da dem duoc: **350 trang tieng Viet, chi 35 co ban EN**, va chung chi
thuoc 2 series — `aie` (21) va `sysdesign` (14). Con **315 trang chua co**, trai
khap 12+ series (ai, webgl, canvas, electronics, sql, embedded, cpp, vlsi, dsp,
cpu, js, aisys...).

Muc 1 da sua xong loi chuyen ngon ngu, va no KHONG can trang stub — nut doi ngon
ngu gio hoat dong hai chieu tren ca 390 trang co header. Nen truoc khi sinh 315
trang, hay xac dinh lai con van de gi that su chua giai quyet.

Y dinh ban dau: sinh san trang EN co header/footer that, body ghi "coming soon".

**Hai chot chan bat buoc phai co NGAY tu khi sinh** — 315 trang gan giong het
nhau la thin content, khong phai vo hai:

- `<meta name="robots" content="noindex">` tren moi stub. Go ra khi co noi dung that.
- **KHONG dua stub vao `sitemap.xml`.** Sitemap la loi moi lap chi muc.

Van nen co `hreflang` (do chinh la thu lam nut hoat dong hai chieu), nhung di kem
`noindex` de khong tu nhan "day la ban tieng Anh day du".

Khi lam: dung script sinh hang loat, va chay `check-lesson.js` tren toan bo dau ra
truoc khi commit. Nho bat bien da co: **so lieu truoc/sau phai so theo LOAI loi va
so luong, khong so nguyen van** — `check-lesson.js` bao loi kem `[Dong N]`, ma them
bot dong se lam lech het so dong.

### 3. Them kiem tra "chuyen ngon ngu hai chieu" vao verify-series.py

Sau khi sua xong muc 1, ma hoa no thanh mot check de loi khong quay lai.

Y tuong: voi moi cap trang VI/EN, xac nhan `hreflang` cua ban nay tro dung ban kia
VA nguoc lai (hien tai check `hreflang` chi kiem bo ba co du, chua kiem tinh doi
xung hai chieu giua hai file).

**Bat buoc negative-test** truoc khi tin: tiem mot `hreflang` tro sai roi xac nhan
check bao do. Mot checker chi biet bao "dat" thi te hon la khong co.

## Cac bai con lai

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
- [x] Bai 10: Distributed Lock
- [x] Bai 11: Idempotency & Retry An Toàn
- [x] Bai 12: Message Queue & Xử Lý Bất Đồng Bộ
- [x] Bai 13: Rate Limiting & Backpressure
- [x] Bai 14: Event Sourcing & CQRS
- [x] Bai 15: Monolith vs Microservices

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
