# task.md — Tự học lập trình C từ số 0 / Learn C from Scratch

> File nay do `make-task.py` sinh ra tu hien trang repo. **Dung tich tay cac o
> trong muc "May kiem duoc"** — chay lai script la chung tu dong dong bo:
>
> ```bash
> D=.claude/skills/beginner-proof-series
> python3 $D/make-task.py .claude/skills/beginner-proof-series/series/c
> ```

## Bat dau tu day

Doc `.claude/skills/beginner-proof-series/SKILL.md` truoc — no giai thich
_cach_ lam. File nay chi noi _con lai nhung gi_.

Hai lenh cho biet trang thai bat ky luc nao:

```bash
D=.claude/skills/beginner-proof-series
python3 $D/next-lesson.py blog/c/c-programming-series.html
python3 $D/verify-series.py .claude/skills/beginner-proof-series/series/c
```

**Tien do: 10/12 bai da co ban EN.** Checker dang **DO** — xem muc "Viec phai sua ngay" ben duoi.

## Viec phai sua ngay (checker dang do)

Chua nen viet bai moi khi phan nay chua sach:

```
dung sua truc tiep HTML — lan dung sau se ghi de len.
```

Chay `verify-series.py` de xem day du.

## Cac bai con lai

### Bai 11: Lập trình đa tệp, Preprocessor & Công cụ Build

- VI: `blog/c/c-multifile-and-preprocessor.html`
- EN can tao: `blog/c/en/c-multifile-and-preprocessor.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Liet ke 4-5 thuat ngu chu de KHONG THE thieu roi grep dem trong than
      bai. **0 lan la mot lo hong phai VIET, khong phai de bao cao.**
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai va KHONG phai stub (`blog/c/en/c-multifile-and-preprocessor.html`)
- [ ] co template de dung lai (`c-multifile-and-preprocessor.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

### Bai 12: Trực quan hoá Cấu trúc dữ liệu tương tác trong trình duyệt

- VI: `blog/c/c-ds-visualizer-demo.html`
- EN can tao: `blog/c/en/c-ds-visualizer-demo.html`

**Chi con nguoi biet** — tich tay khi that su da lam:

- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan
- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua
- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)
- [ ] Liet ke 4-5 thuat ngu chu de KHONG THE thieu roi grep dem trong than
      bai. **0 lan la mot lo hong phai VIET, khong phai de bao cao.**
- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai
- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung
- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)
- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi

**May kiem duoc** — chay `verify-series.py`, dung tich tay:

- [ ] ban EN ton tai va KHONG phai stub (`blog/c/en/c-ds-visualizer-demo.html`)
- [ ] co template de dung lai (`c-ds-visualizer-demo.body-en.html` + `.meta-en.json`)
- [ ] 13 bat bien deu dat (`verify-series.py` xanh)
- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN
- [ ] Da commit, va da ghi vao commit nhung gi co y de lai

## Cac bai da xong

Khong can doc lai nhung bai nay — `verify-series.py` giu chung dung.

- [x] Bai 1: Cài đặt môi trường, Compiler Flags, Makefile & GDB
- [x] Bai 2: Cú pháp cơ bản, Biến, Kiểu dữ liệu & Nhập xuất
- [x] Bai 3: Toán tử, Thứ tự ưu tiên & Phép toán Bitwise
- [x] Bai 4: Cấu trúc rẽ nhánh & Vòng lặp: Nền tảng thuật toán
- [x] Bai 5: Hàm, Đệ quy & Phạm vi biến
- [x] Bai 6: Mảng, Chuỗi ký tự & Xử lý văn bản
- [x] Bai 7: Cấu trúc Struct, Union, Typedef & Bit-fields
- [x] Bai 8: Làm chủ Con Trỏ (Pointers) từ cơ bản đến nâng cao
- [x] Bai 9: Cấp phát bộ nhớ động, Quản lý bộ nhớ & Debug Tools
- [x] Bai 10: Cấu trúc dữ liệu, Big O & CPU Cache Locality

## Viec o cap series (lam mot lan)

- [ ] Hub co ban tieng Anh (`blog/c/en/c-programming-series.html`)
- [x] Hub tieng Viet co `hreflang` va link locale hien thi
- [ ] Chrome thong nhat giua cac bai EN (checker ep theo `config.json`)

## Khi xong het

```bash
python3 .claude/skills/beginner-proof-series/make-task.py .claude/skills/beginner-proof-series/series/c --finish
```

Lenh nay chi chay khi moi bai da co ban EN **va** checker xanh. No don noi
dung file, giu lai file cho lan lam viec sau.
