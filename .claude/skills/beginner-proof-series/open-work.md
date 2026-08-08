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
