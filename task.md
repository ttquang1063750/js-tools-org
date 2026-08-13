# task.md — Kiến Trúc Máy Tính / Computer Architecture

> File nay do `make-task.py` sinh ra tu hien trang repo. **Dung tich tay cac o
> trong muc "May kiem duoc"** — chay lai script la chung tu dong dong bo:
>
> ```bash
> D=.claude/skills/beginner-proof-series
> python3 $D/make-task.py .claude/skills/beginner-proof-series/series/cpu
> ```

## Bat dau tu day

Doc `.claude/skills/beginner-proof-series/SKILL.md` truoc — no giai thich
_cach_ lam. File nay chi noi _con lai nhung gi_.

Hai lenh cho biet trang thai bat ky luc nao:

```bash
D=.claude/skills/beginner-proof-series
python3 $D/next-lesson.py blog/cpu/cpu-programming-series.html
python3 $D/verify-series.py .claude/skills/beginner-proof-series/series/cpu
```

**Tien do: 12/12 bai da co ban EN.** Checker dang **xanh**.

## Viec o cap toan site (khong thuoc series nao)

> Ghi tay vao `.claude/skills/beginner-proof-series/open-work.md`.
> `make-task.py` chen nguyen phan nay vao `task.md`, nen no khong bi mat khi sinh lai.
> Xong viec nao thi xoa muc do khoi file nay.

### 1. Nhan self-test trong cpu-core.js van la tieng Viet khong dau

Quy tac cua skill: khong chi COMMENT ma ca chuoi OUTPUT cua chuong trinh cung phai
tieng Anh. Comment trong `blog/cpu/*.js` da sach hoan toan, nhung ~90 nhan
`check()/checkTrue()/checkClose()` trong `cpu-core.js` van la tieng Viet bo dau:

    checkTrue('Pitfall WAR: instr2 (ghi R2) bat dau THUC THI (cycle 3) truoc ca khi ...')

Chung chi hien ra khi chay `node cpu-core.js`, khong xuat hien tren trang nao, nen
muc do nghiem trong thap hon comment — nhung van la tieng Viet trong mot file dung
chung cho ca hai locale. `quantum-sim.js` cung con vai nhan tuong tu.

Viec can lam: doi ~90 chuoi nhan sang tieng Anh, giu nguyen moi phep kiem tra va
moi con so, roi chay lai `node cpu-core.js` (phai van la 178 checks PASS) va
`node quantum-sim.js` (25 checks PASS).

Luu y: `verify-series.py` KHONG bat duoc loi nay — check `code-en` chi doc cac
khoi code trong HTML, khong doc file .js dat canh. Va no dua vao DAU TIENG VIET,
nen tieng Viet BO DAU van lot qua het.

## Cac bai con lai

Khong con bai nao. Neu checker xanh, chay `make-task.py --finish` de don file nay.

## Cac bai da xong

Khong can doc lai nhung bai nay — `verify-series.py` giu chung dung.

- [x] Bai 1: Cổng Logic đến Đơn Vị ALU
- [x] Bai 2: Kiến Trúc Von Neumann & Tập Lệnh ISA
- [x] Bai 3: Hợp Ngữ RISC-V & Đường Đi Của Dữ Liệu (Datapath)
- [x] Bai 4: Pipeline CPU & Xung Đột Dữ Liệu (Data Hazards)
- [x] Bai 5: Dự Đoán Nhánh & Lỗ Hổng Bảo Mật Spectre
- [x] Bai 6: Song Song Cấp Lệnh & Thực Thi Ngoài Thứ Tự (Tomasulo)
- [x] Bai 7: Phân Cấp Bộ Nhớ & Kiến Trúc Cache
- [x] Bai 8: Bộ Nhớ Ảo & Khối TLB
- [x] Bai 9: Apple Silicon & Kiến Trúc Bộ Nhớ Thống Nhất (UMA)
- [x] Bai 10: Tăng Tốc Phần Cứng: GPU, NPU & AMX
- [x] Bai 11: Điểm Cuối Định Luật Moore & Đóng Gói Chiplet
- [x] Bai 12: Kiến Trúc Máy Tính Lượng Tử (Quantum Computing)

## Viec o cap series (lam mot lan)

- [x] Hub co ban tieng Anh (`blog/cpu/en/cpu-programming-series.html`)
- [x] Hub tieng Viet co `hreflang` va link locale hien thi
- [ ] Chrome thong nhat giua cac bai EN (checker ep theo `config.json`)

## Khi xong het

```bash
python3 .claude/skills/beginner-proof-series/make-task.py .claude/skills/beginner-proof-series/series/cpu --finish
```

Lenh nay chi chay khi moi bai da co ban EN **va** checker xanh. No don noi
dung file, giu lai file cho lan lam viec sau.
