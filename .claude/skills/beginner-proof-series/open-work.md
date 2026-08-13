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
