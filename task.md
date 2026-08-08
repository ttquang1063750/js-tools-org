# task.md — Kỹ Sư AI Thực Chiến / Practical AI Engineer

> File nay do `make-task.py` sinh ra tu hien trang repo. **Dung tich tay cac o
> trong muc "May kiem duoc"** — chay lai script la chung tu dong dong bo:
>
> ```bash
> D=.claude/skills/beginner-proof-series
> python3 $D/make-task.py .claude/skills/beginner-proof-series/series/aie
> ```

## Bat dau tu day

Doc `.claude/skills/beginner-proof-series/SKILL.md` truoc — no giai thich
_cach_ lam. File nay chi noi _con lai nhung gi_.

Hai lenh cho biet trang thai bat ky luc nao:

```bash
D=.claude/skills/beginner-proof-series
python3 $D/next-lesson.py blog/aie/aie-programming-series.html
python3 $D/verify-series.py .claude/skills/beginner-proof-series/series/aie
```

**Tien do: 20/20 bai da co ban EN.** Checker dang **xanh**.

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

Khong con bai nao. Neu checker xanh, chay `make-task.py --finish` de don file nay.

## Cac bai da xong

Khong can doc lai nhung bai nay — `verify-series.py` giu chung dung.

- [x] Bai 1: Chuyển dịch tư duy lập trình: Từ JS sang Python cho AI
- [x] Bai 2: Đại số Tuyến tính & Đạo hàm qua dòng lệnh
- [x] Bai 3: Làm việc với Dữ liệu lớn: NumPy & Pandas chuyên sâu
- [x] Bai 4: PyTorch Cơ Bản: Tensor & Autograd chuyên sâu
- [x] Bai 5: Mạng Nơ-ron Đơn Giản (Perceptron & MLP)
- [x] Bai 6: Huấn luyện mạng: Loss & Backpropagation
- [x] Bai 7: Thị giác Máy tính cơ bản: Khám phá mạng tích chập CNN
- [x] Bai 8: Xử lý Văn bản & Word Embeddings
- [x] Bai 9: Mạng tuần hoàn (RNN) và Sự trỗi dậy của Attention
- [x] Bai 10: Kiến trúc Transformer Dưới Kính Hiển Vi
- [x] Bai 11: Lập trình Prompt & Làm chủ API LLM
- [x] Bai 12: Structured Outputs & Function Calling
- [x] Bai 13: Cục bộ hóa AI: Chạy LLM offline với Ollama
- [x] Bai 14: Hệ thống RAG Cơ Bản: Hỏi đáp tài liệu
- [x] Bai 15: Chiến thuật Chunking tối ưu & Vector Databases chuyên sâu
- [x] Bai 16: RAG Nâng Cao: Query Translation & Cross-Encoder Reranking
- [x] Bai 17: AI Agents & Vòng lặp ReAct
- [x] Bai 18: Đại lý có trạng thái phức tạp với LangGraph
- [x] Bai 19: Tinh chỉnh mô hình (Fine-tuning LLM) bằng QLoRA
- [x] Bai 20: MLOps: Serving vLLM, Tracing và Đánh giá tự động

## Viec o cap series (lam mot lan)

- [x] Hub co ban tieng Anh (`blog/aie/en/aie-programming-series.html`)
- [x] Hub tieng Viet co `hreflang` va link locale hien thi
- [ ] Chrome thong nhat giua cac bai EN (checker ep theo `config.json`)

## Khi xong het

```bash
python3 .claude/skills/beginner-proof-series/make-task.py .claude/skills/beginner-proof-series/series/aie --finish
```

Lenh nay chi chay khi moi bai da co ban EN **va** checker xanh. No don noi
dung file, giu lai file cho lan lam viec sau.
