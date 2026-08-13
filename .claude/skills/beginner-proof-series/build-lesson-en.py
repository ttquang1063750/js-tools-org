#!/usr/bin/env python3
"""
Dung ban tieng Anh HOAN CHINH cua mot bai hoc, tu ban tieng Viet.

    python3 build-lesson-en.py <thu-muc-series> <slug>

Vi du:
    python3 .claude/skills/beginner-proof-series/build-lesson-en.py \\
            .claude/skills/beginner-proof-series/series/aie aie-math-code

Can trong <thu-muc-series>/lessons/:
    <slug>.body-en.html        than bai tieng Anh, dung placeholder (xem duoi)
    <slug>.meta-en.json        tieu de/mo ta/link truoc-sau, xem vi du trong repo
    <slug>.svg-labels.json     (tuy chon) ban dich nhan <text> trong so do

NGUYEN TAC: nhung gi TRUNG LAP NGON NGU thi lay NGUYEN VAN tu ban tieng Viet,
nen hai ban khong bao gio troi khoi nhau.

    {{CODE:<ten-file>}}   khoi <div class="code-window"> — nguyen van.
                          Nhieu khoi cung ten thi danh so theo thu tu xuat
                          hien: {{CODE:Terminal}}, {{CODE:Terminal#2}}, ...
    {{SVG:<n>}}           so do thu n. Hinh hoc dung chung, chi nhan <text>
                          duoc thay theo <slug>.svg-labels.json — nen toa do
                          khong the lech, ma nhan van la tieng Anh.

Script BAO LOI DUNG (khong ghi file) neu: co placeholder tro toi khoi khong
ton tai, co khoi/so do khong duoc dung, hoac co nhan svg thieu ban dich.
"""
import json
import os
import re
import sys

VN = r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵĐđ]'

if len(sys.argv) != 3:
    raise SystemExit('dung: build-lesson-en.py <thu-muc-series> <slug>')
SERIES, SLUG = sys.argv[1].rstrip('/'), sys.argv[2]
cfg = json.load(open(f'{SERIES}/config.json', encoding='utf-8'))
LDIR = f'{SERIES}/lessons'

VI = f'{cfg["lessonDirVi"]}/{SLUG}.html'
EN = f'{cfg["lessonDirEn"]}/{SLUG}.html'
meta = json.load(open(f'{LDIR}/{SLUG}.meta-en.json', encoding='utf-8'))
labels_path = f'{LDIR}/{SLUG}.svg-labels.json'
LABELS = json.load(open(labels_path, encoding='utf-8')) if os.path.exists(labels_path) else {}

vi = open(VI, encoding='utf-8').read()
base_vi = cfg['urlVi'].rsplit('/', 1)[0]  # .../blog/aie
VI_URL = f'{base_vi}/{SLUG}'
EN_URL = f'{base_vi}/en/{SLUG}'


# ---------------------------------------------------------------- khoi code
def collect_code(src):
    """{ten: khoi}. Ten trung thi them '#2', '#3'... theo thu tu xuat hien."""
    out, seen = {}, {}
    for m in re.finditer(
        r'<div class="code-window">\s*<div class="code-header">.*?'
        r'<span class="code-filename"\s*>([^<]*)</span\s*>.*?</div>\s*'
        r'<pre><code[^>]*>.*?</code></pre>\s*</div>',
        src,
        re.S,
    ):
        name = m.group(1).strip()
        seen[name] = seen.get(name, 0) + 1
        out[name if seen[name] == 1 else f'{name}#{seen[name]}'] = m.group(0)
    return out


code_windows = collect_code(vi)
# Hai kieu boc so do: <div style=...> (AIE) va <figure> (sysdesign).
SVG_RE = (r'<div style="margin: 20px 0; text-align: center">\s*<svg.*?</svg>\s*</div>'
          r'|<figure[^>]*>\s*<svg.*?</svg>\s*(?:<figcaption[^>]*>.*?</figcaption>\s*)?</figure>')
svgs = re.findall(SVG_RE, vi, re.S)
print(f'  nguon: {len(code_windows)} khoi code, {len(svgs)} so do')


def translate_svg(block):
    missing = []
    # Tra cuu theo dang DA CHUAN HOA khoang trang: nhan <text> dai bi prettier
    # ngat thanh nhieu dong, nen so sanh nguyen van se truot dung nhung nhan dai
    # nhat. (Loi nay tung lam bo dung im lang bao thieu ban dich.)
    norm_labels = {' '.join(k.split()): v for k, v in LABELS.items()}

    def sub_text(m):
        inner = ' '.join(m.group(2).split())
        if inner in norm_labels:
            return m.group(1) + norm_labels[inner] + m.group(3)
        if inner:
            missing.append(inner)
        return m.group(0)

    out = re.sub(r'(<text\b[^>]*>)(.*?)(</text>)', sub_text, block, flags=re.S)
    # <figcaption> nam trong <figure> cung so do: la van xuoi that, phai dich.
    # Truoc day khong xu ly nen no o lai tieng Viet trong trang EN.
    out = re.sub(r'(<figcaption\b[^>]*>)(.*?)(</figcaption>)', sub_text, out, flags=re.S)

    def sub_aria(m):
        inner = ' '.join(m.group(1).split())
        if inner in norm_labels:
            return f'aria-label="{norm_labels[inner]}"'
        if re.search(VN, inner, re.I):
            # Truoc day aria-label khong co ban dich thi IM LANG di qua — nguoi
            # dung trinh doc man hinh nhan mo ta tieng Viet tren trang tieng Anh.
            missing.append(inner)
        return m.group(0)

    out = re.sub(r'aria-label="([^"]*)"', sub_aria, out)
    if missing:
        raise SystemExit(f'thieu ban dich nhan svg (them vao {labels_path}):\n  - ' + '\n  - '.join(missing))
    return out


# ---------------------------------------------------------------- than bai
body = open(f'{LDIR}/{SLUG}.body-en.html', encoding='utf-8').read()
used_code, used_svg = set(), set()


# Nhan <span class="code-filename"> co the la ten file thuan ("app.js") hoac mot
# cau mo ta bang tieng Viet ("docker stats — luc /fast bao hoa"). Cai thu hai la
# VAN XUOI, phai dich — va code-same chi so NOI DUNG code nen doi nhan la hop le.
CODE_TITLES = meta.get('codeTitles', {})


def translate_code_title(block):
    def sub(m):
        label = m.group(1)
        if label in CODE_TITLES:
            return m.group(0).replace(label, CODE_TITLES[label])
        if re.search(VN, label, re.I):
            raise SystemExit(
                f'thieu ban dich nhan khoi code (them vao "codeTitles" trong '
                f'{SLUG}.meta-en.json):\n  - {label}'
            )
        return m.group(0)

    return re.sub(r'<span class="code-filename"\s*>([^<]*)</span\s*>', sub, block)


def put_code(m):
    name = m.group(1).strip()
    if name not in code_windows:
        raise SystemExit(f'placeholder tro toi khoi code khong ton tai: {name}')
    used_code.add(name)
    return translate_code_title(code_windows[name])


def put_svg(m):
    n = int(m.group(1))
    if not 1 <= n <= len(svgs):
        raise SystemExit(f'khong co so do so {n}')
    used_svg.add(n)
    return translate_svg(svgs[n - 1])


body = re.sub(r'\{\{CODE:([^}]+)\}\}', put_code, body)
body = re.sub(r'\{\{SVG:(\d+)\}\}', put_svg, body)
for label, missing in [
    ('khoi code', sorted(set(code_windows) - used_code)),
    ('so do', sorted(map(str, set(range(1, len(svgs) + 1)) - used_svg))),
]:
    if missing:
        raise SystemExit(f'{label} chua duoc dung o ban EN: ' + ', '.join(missing))
print(f'  da chen {len(used_code)} khoi code + {len(used_svg)} so do, khong sot cai nao')


# ---------------------------------------------------------------- head/chrome/tail
def deepen(t):
    """File EN nam sau mot cap thu muc."""
    t = t.replace('href="../../', 'href="../../../').replace('src="../../', 'src="../../../')
    t = t.replace('href="../', 'href="../../').replace('src="../', 'src="../../')
    t = t.replace('../../../../', '../../../')

    # Con mot dang KHONG co "../" nen bon dong tren khong cham toi: file dat CANH
    # bai hoc, vi du <script type="module" src="cpu-logic-alu.js">. Tu trong /en/
    # no tro toi /en/cpu-logic-alu.js — 404, va trang mat hoan toan phan demo.
    # Bat duoc nho doc console trinh duyet, khong phai nhin bang mat.
    #
    # Chi deepen gia tri co PHAN MO RONG (co dau cham). Link giua cac bai la slug
    # khong co duoi (href="cpu-programming-series") va PHAI giu nguyen, vi trong
    # /en/ chung tro dung sang ban EN cua bai kia.
    def _bare(m):
        attr, val = m.group(1), m.group(2)
        if val.startswith(('http:', 'https:', '//', '/', '#', 'mailto:', 'data:', '../')):
            return m.group(0)
        if '.' not in val.rsplit('/', 1)[-1]:
            return m.group(0)          # slug bai hoc, khong phai file
        return f'{attr}="../{val}"'

    return re.sub(r'\b(href|src)="([^"]+)"', _bare, t)


i_head = vi.index('</head>') + len('</head>')
i_body = vi.index('<div class="article-body">')
i_rel = vi.index('<div class="article-related">')
head, chrome, tail = deepen(vi[:i_head]), deepen(vi[i_head:i_body]), deepen(vi[i_rel:])

head = head.replace('<html lang="vi">', '<html lang="en">')
head = re.sub(r'<title>.*?</title>', f'<title>{meta["title"]}</title>', head, flags=re.S)
for attr in ['name="description"', 'property="og:description"', 'name="twitter:description"']:
    head = re.sub(
        r'(<meta\s+' + re.escape(attr) + r'\s+content=")[^"]*(")',
        lambda m: m.group(1) + meta['desc'] + m.group(2),
        head,
        flags=re.S,
    )
for attr in ['property="og:title"', 'name="twitter:title"']:
    head = re.sub(
        r'(<meta\s+' + re.escape(attr) + r'\s+content=")[^"]*(")',
        lambda m: m.group(1) + meta['title'] + m.group(2),
        head,
        flags=re.S,
    )
# CHI doi canonical va og:url. KHONG duoc dung replace chung cho moi href, vi
# hreflang="vi" va hreflang="x-default" phai GIU nguyen URL tieng Viet — doi
# chung la khai bao sai ban thay the, va khong co gi bao loi.
head = head.replace(
    f'<link rel="canonical" href="{VI_URL}" />', f'<link rel="canonical" href="{EN_URL}" />'
).replace(f'<meta property="og:url" content="{VI_URL}" />', f'<meta property="og:url" content="{EN_URL}" />')
head = head.replace(f'"url": "{VI_URL}"', f'"url": "{EN_URL}"')
head = head.replace('"inLanguage": "vi"', '"inLanguage": "en"')
head = re.sub(r'"headline": "[^"]*"', '"headline": "' + meta['headline'] + '"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + meta['descPlain'] + '"', head)

for a, b in meta['chromeSubs']:
    if a not in chrome:
        raise SystemExit('CHROME khong tim thay:\n' + a)
    chrome = chrome.replace(a, b, 1)
if 'href="en/' in chrome:
    raise SystemExit('chrome con link tro vao en/ — tu trong /en/ se thanh en/en/')

for a, b in meta['tailSubs']:
    if a not in tail:
        raise SystemExit('TAIL khong tim thay:\n' + a)
    tail = tail.replace(a, b, 1)

out = head + chrome + '<div class="article-body">\n' + body + '\n' + tail
assert out.count('class="article-body"') == 1, 'phai co dung 1 lop boc article-body'
open(EN, 'w', encoding='utf-8').write(out)

leftover = sorted(set(' '.join(x.split()) for x in re.findall(r'[^\s<>]*' + VN + r'[^\s<>]*', out, re.I)))
print(f'  da ghi {EN} — {len(out.splitlines())} dong')
print(f'  tu tieng Viet con lai (mong doi chi co link locale): {leftover}')
