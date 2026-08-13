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

### 2. ~~Tao trang stub tieng Anh~~ — DA XONG

298 stub duoi `blog/<series>/en/`, sinh boi
`.claude/skills/beginner-proof-series/build-stub-en.py` (co `--dry-run`,
`--vi-only`, va nhan duong dan de gioi han pham vi mot series).

Tieu chi chon trang la MAY MOC, khong theo ten file: trang nao co `#langToggle`
thi can ban EN. 12 trang app nhung (sandbox, visualizer, playground) khong co nut
nen khong can — dung ten file de doan thi da phan loai sai `canvas-physics-simulation`
va `vectordb-similarity-metrics`, hai bai hoc that.

Phat hien them, va la loi that: **91 trang tieng Viet dang khai `<html lang="en">`**
(tron cac series bash, c, canvas, cpp, js, webgl). `i18n.js` doc chinh thuoc tinh
do lam `contentLang`, nen neu de nguyen thi sau khi them hreflang chung se hien
chrome tieng Anh va bam "sang tieng Viet" lai nhay sang stub. Da sua het.

Hai chot chan da co: `noindex, follow` tren ca 298 stub; `sitemap.xml` khong doi
mot dong. `check-lesson.js` duoc day them ngoai le: trang `noindex` KHONG duoc khai
JSON-LD (khai `BlogPosting` o trang chua co noi dung la noi voi Google rang da ton
tai ban tieng Anh day du). Ngoai le nhan dien bang chinh the `noindex`, khong dua
vao duong dan `/en/` — vi `/en/` con chua ca 40 ban dich THAT.

Hai bai hoc phai tra gia trong lan nay:
- `deepen()` chi sua duong dan co `../`. Script cung thu muc (`src="<slug>.js"`,
  `vendor/sql-wasm.js`) bi giu nguyen nen tro vao `en/` va 404 — o CA `<head>` lan
  cuoi trang. Stub khong co demo nao de chung dieu khien nen bo han la dung.
- Dung chay `prettier --write` tren 298 trang VI. Lan dau toi lam vay, diff phong
  len va lan sang toan bo than bai. So theo LOAI loi voi `git show HEAD:<file>` cho
  thay khac biet duy nhat la lo Prettier — moi loi noi dung deu co san tu truoc.
  Da hoan nguyen; diff cuoi cung chi con `lang` + 3 dong hreflang moi file.

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

### 5. Comment tieng Viet trong cac file .js dung chung cua series cpu

Quy tac cua skill: comment trong code LUON tieng Anh, ke ca o bai tieng Viet, vi
mot khoi code phuc vu ca hai locale. Series cpu dang vi pham o cac file .js dat
canh bai hoc (dung chung, khong nhan doi theo locale):

    cpu-core.js                  281 dong  (thu vien dung chung ca 12 bai)
    quantum-sim.js                38 dong
    cpu-riscv-datapath.js          8 dong
    cpu-branch-prediction.js       5 dong
    cpu-pipeline-hazards.js        4 dong
    ... 7 file con lai, 2-3 dong moi file

Da sua trong Bai 2: toan bo thong bao loi `throw new Error(...)` cua cpu-core.js
(5 cho) chuyen sang tieng Anh, va cpu-von-neumann-isa.js duoc them bang STRINGS
{vi,en} chon theo `<html lang>` giong cach cpu-logic-alu.js da lam — truoc do
demo tren trang tieng Anh hien nguyen chu Viet.

CON LAI la 281 dong comment cua cpu-core.js: co tinh de lai, vi no thuoc ca 12
bai chu khong rieng bai nao, va sua trong mot commit "Bai 2" se lam diff mat
trong tam. Nen lam thanh MOT commit rieng cho toan series.

Luu y: `verify-series.py` KHONG bat duoc loi nay — check `code-en` chi doc cac
khoi code trong HTML, khong doc file .js dat canh. Va no dua vao DAU TIENG VIET,
nen tieng Viet BO DAU (`// mot mang bo nho DUY NHAT`) van lot qua. Bai 2 co 4
khoi code kieu do, da sua tay.

