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

**Tien do: 12/12 bai da co ban EN.** Checker dang **DO** — xem muc "Viec phai sua ngay" ben duoi.

## Viec phai sua ngay (checker dang do)

Chua nen viet bai moi khi phan nay chua sach:

```
dung sua truc tiep HTML — lan dung sau se ghi de len.
```

Chay `verify-series.py` de xem day du.

## Cac bai con lai

Khong con bai nao. Neu checker xanh, chay `make-task.py --finish` de don file nay.

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
- [x] Bai 11: Lập trình đa tệp, Preprocessor & Công cụ Build
- [x] Bai 12: Trực quan hoá Cấu trúc dữ liệu tương tác trong trình duyệt

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
