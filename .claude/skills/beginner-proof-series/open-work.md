## Viec o cap toan site (khong thuoc series nao)

> Ghi tay vao `.claude/skills/beginner-proof-series/open-work.md`.
> `make-task.py` chen nguyen phan nay vao `task.md`, nen no khong bi mat khi sinh lai.
> Xong viec nao thi xoa muc do khoi file nay.

### 1. Chan doan loi chuyen ngon ngu KHONG quay lai duoc

**Lam viec nay TRUOC**, vi ket qua quyet dinh muc 2 co can lam hay khong — hai
kha nang chenh nhau tu "sua vai dong" den "sinh 315 trang".

Trieu chung nguoi dung bao: dang o trang tieng Viet, bam nut doi ngon ngu thi
sang tieng Anh, nhung bam de quay lai tieng Viet thi khong duoc.

Chua xac dinh duoc nguyen nhan. **Dung doan** — mo trinh duyet va lam that:

```bash
D=.claude/skills/beginner-proof-series
# trang CO ban EN (nut se DIEU HUONG):        blog/aie/aie-math-code.html
# trang KHONG co ban EN (nut chi doi chu):    blog/canvas/canvas-basics-and-drawing.html
```

Voi moi truong hop, bam nut HAI LAN va ghi lai sau moi lan: `location.pathname`,
`document.documentElement.lang`, `localStorage.getItem('lang')`, va chu tren nut.

Luu y ve cach do (da mac loi nay mot lan trong phien truoc): `hreflang` dung URL
TUYET DOI, nen bam nut tren localhost se nhay sang js-tools.org that — noi chua
co ban sua. Kiem tra tren production roi ket luan ve code local la sai.

Hai nghi van dang co, chua cai nao duoc xac nhan:
- `i18n.js` ghi `localStorage.lang` khi bam, nhung trang co `hreflang` lai lay
  `lang` tu `contentLang` chu khong tu localStorage. Chuyen qua lai giua trang co
  va khong co ban dich co the tao ra trang thai mau thuan.
- Trang khong co ban EN thi khong co gi de quay ve, nen "khong quay lai duoc" co
  the la dung nhu thiet ke chu khong phai loi.

### 2. Tao trang stub tieng Anh (CHI khi muc 1 ket luan la can)

So lieu da dem duoc: **350 trang tieng Viet, chi 35 co ban EN**, va chung chi
thuoc 2 series — `aie` (21) va `sysdesign` (14). Con **315 trang chua co**, trai
khap 12+ series (ai, webgl, canvas, electronics, sql, embedded, cpp, vlsi, dsp,
cpu, js, aisys...).

Y dinh: sinh san trang EN co header/footer that, body chi ghi "coming soon", de
nut doi ngon ngu hoat dong hai chieu o moi trang.

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
