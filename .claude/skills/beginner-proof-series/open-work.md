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

### 3. ~~Nut doi ngon ngu la LINK, khong phai nut JS~~ — DA SUA

Loi that su nguoi dung gap KHONG phai localStorage, ma la `build-hub-en.py` dung
`head.replace(f'"{VI_URL}"', f'"{EN_URL}"')` — mot phep thay CHUNG, nen no ghi de
luon `hreflang="vi"` thanh URL tieng Anh. Ket qua: `hreflang` vi va en tro CUNG
mot URL, bam doi ngon ngu thi dieu huong ve chinh trang dang xem.
`build-lesson-en.py` da sua loi nay tu truoc — hub bi bo sot.
Bi anh huong: 2 trang hub (aie, sysdesign). Da sua bo dung + dung lai. 40/40 dung.

Da doi nut thanh `<a href>` that (y kien cua nguoi dung): tren trang CO ban dich,
`i18n.js` thay `<button>` bang `<a href>` lay tu `hreflang`. Link thi khong the
"bam ma khong di dau", chay duoc khi tat JS, va cong cu tim kiem doc duoc.
Trang CHUA co ban dich van dung nut JS — o do khong ton tai URL nao de tro toi.
`.btn-lang` phai co `display: inline-block` + `text-decoration: none` cho the `<a>`.
`i18n-locale-selftest.mjs`: 11 khang dinh, da negative-test (tro href sai locale
thi truot dung 3 khang dinh).

### 4. Con thieu: check hreflang doi xung o CAP FILE

Muc 3 kiem phia JavaScript. Chua ai kiem cap file VI/EN co tro dung nhau khong —
va do chinh la cho loi vua roi phat sinh. Bo kiem tam thoi da dung:

```python
alts = {h: u for h, u in (
    (re.search(r'hreflang="([^"]+)"', t).group(1), re.search(r'href="([^"]+)"', t).group(1))
    for t in re.findall(r'<link\s+rel="alternate"[^>]*>', s, re.S))}
# SAI neu: thieu vi/en, hoac alts['vi'] == alts['en'], hoac '/en/' in alts['vi']
```

Luu y da tra gia mot lan: regex `hreflang="..." href="..."` tren MOT dong la sai —
prettier ngat the `<link>` thanh nhieu dong, nen phai khop `<link ...>` voi `re.S`
roi moi tach thuoc tinh. Ban dau toi bao oan mot trang thu ba "loi" chinh vi vay.
Dua vao `verify-series.py`, kem negative-test.
