#!/usr/bin/env python3
"""
Dung ban tieng Anh cua trang HUB series AIE.

Hub khac bai hoc: khong co <div class="article-body">, co mot khoi <style>,
mot so do SVG lon, va mot <script> noi tuyen ~210 dong chua 73 chuoi noi dung.

Nguyen tac giu nguyen:
  - khoi <style>            : nguyen van
  - so do SVG              : nguyen van (nhan da la tieng Anh san)
  - LOGIC cua <script>     : nguyen van; chi thay cac chuoi noi dung theo
                             bang dich, va BAO LOI DUNG neu con sot chuoi
                             tieng Viet nao trong script.

Cac the bai duoc sinh lai: tro toi ban EN neu co, nguoc lai tro ve ban VI
kem nhan "(in Vietnamese)" — vi noi dung DA TON TAI, chi chua dich, nen khoa
lai se an mat 17 bai thay vi chi doi ngon ngu.
"""
import json
import os
import re
import sys

# Dung: build-hub-en.py <thu-muc-series>
#   vi du: build-hub-en.py .claude/skills/beginner-proof-series/series/aie
# Thu muc series phai co: hub-body-en.html, hub-script-map.json, hub-lessons-en.json
# va mot file config.json ghi duong dan hub VI/EN.
SERIES = sys.argv[1].rstrip('/')
cfg = json.load(open(f'{SERIES}/config.json', encoding='utf-8'))
VI, EN = cfg['hubVi'], cfg['hubEn']
LESSON_DIR = cfg['lessonDirEn']          # vi du blog/aie/en
BODY = f'{SERIES}/hub-body-en.html'

VN = r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵĐđ]'

vi = open(VI, encoding='utf-8').read()
script_map = json.load(open(f'{SERIES}/hub-script-map.json', encoding='utf-8'))
lessons = json.load(open(f'{SERIES}/hub-lessons-en.json', encoding='utf-8'))


def deepen(t):
    """File EN nam sau mot cap thu muc."""
    t = t.replace('href="../../', 'href="../../../').replace('src="../../', 'src="../../../')
    t = t.replace('href="../', 'href="../../').replace('src="../', 'src="../../')
    return t.replace('../../../../', '../../../')


# ---------------------------------------------------------------- 1. style
i = vi.index('<style>')
style = vi[i : vi.index('</style>', i) + len('</style>')]

# ---------------------------------------------------------------- 2. svg so do
m = re.search(r'<div class="ai-roadmap-visual">\s*<svg.*?</svg>\s*</div>', vi, re.S)
assert m, 'khong tim thay so do roadmap'
svg = m.group(0)
assert not re.search(VN, svg, re.I), 'so do co chu tieng Viet — can bang dich nhan'

# ---------------------------------------------------------------- 3. script
i = vi.index('<script>\n              document.addEventListener')
j = vi.index('</script>', i) + len('</script>')
script_vi = vi[i:j]
script = script_vi
for k, v in sorted(script_map.items(), key=lambda kv: -len(kv[0])):
    script = script.replace(k, v)

STR = r"'(?:[^'\\]|\\.)*'"
n_vi, n_en = len(re.findall(STR, script_vi, re.S)), len(re.findall(STR, script, re.S))
if n_vi != n_en:
    # Gan nhu chac chan la mot ban dich co dau nhay don chua escape (so huu cach
    # tieng Anh: Meta's, customer's) lam DUT chuoi JS -> script hong im lang.
    raise SystemExit(
        f'SO CHUOI JS LECH: nguon {n_vi}, ban dich {n_en}. '
        "Kiem cac ban dich co dau ' chua escape thanh \\'."
    )

# Logic phai giong het: thay moi chuoi bang mot placeholder roi so sanh.
norm = lambda s: ' '.join(re.sub(STR, "'S'", s, flags=re.S).split())
if norm(script_vi) != norm(script):
    raise SystemExit('LOGIC script bi doi — chi duoc thay chuoi, khong duoc doi code')

left = [
    ' '.join(s.split())
    for s in re.findall(r"'((?:[^'\\]|\\.)*)'", script, re.S)
    if re.search(VN, s, re.I)
]
if left:
    raise SystemExit('CON SOT chuoi tieng Viet trong script:\n  - ' + '\n  - '.join(left))
print(f'  script: {n_en} chuoi, logic giong het nguon, khong sot tieng Viet')

# ---------------------------------------------------------------- 4. the bai hoc
cards = []
for n, L in enumerate(lessons, 1):
    en_path = f'{LESSON_DIR}/{L["slug"]}.html'
    if os.path.exists(en_path):
        href, note = L['slug'], ''
    else:
        # ban EN chua co -> tro ve ban VI, noi ro bang tieng Anh
        href = f'../{L["slug"]}'
        note = ' <em style="opacity: 0.7">(in Vietnamese)</em>'
    cards.append(
        f'''              <a href="{href}" class="lesson-item">
                <div class="lesson-number">{n:02d}</div>
                <div class="lesson-content">
                  <h3 class="lesson-title">{L["title"]}{note}</h3>
                  <p class="lesson-desc">{L["desc"]}</p>
                </div>
                <div class="lesson-arrow">➔</div>
              </a>'''
    )
n_en = sum(1 for L in lessons if os.path.exists(f'{LESSON_DIR}/{L["slug"]}.html'))

# Tieu de tren hub phai khop tieu de THUC cua trang EN. Trang la nguon dung;
# hub lech la doc gia bam vao mot cai ten roi den mot trang ten khac.
for L in lessons:
    fp = f'{LESSON_DIR}/{L["slug"]}.html'
    if not os.path.exists(fp):
        continue
    page = open(fp, encoding='utf-8').read()
    h1 = ' '.join(
        re.sub(r'<[^>]+>', '', re.search(r'<h1 class="article-hero__title"[^>]*>(.*?)</h1>', page, re.S).group(1)).split()
    )
    if h1 != L['title']:
        raise SystemExit(f'TIEU DE LECH cho {L["slug"]}:\n  hub  : {L["title"]}\n  trang: {h1}')
lesson_list = '<div class="lessons-list">\n' + '\n\n'.join(cards) + '\n            </div>'

# ---------------------------------------------------------------- 5. head
head = deepen(vi[: vi.index('</head>') + len('</head>')])
head = head.replace('<html lang="vi">', '<html lang="en">')
TITLE = cfg['hubTitleEn']
DESC = cfg['hubDescEn']
head = re.sub(r'<title>.*?</title>', f'<title>{TITLE}</title>', head, flags=re.S)
for attr, val in [
    ('name="description"', DESC),
    ('property="og:title"', TITLE),
    ('property="og:description"', DESC),
    ('name="twitter:title"', TITLE),
    ('name="twitter:description"', DESC),
]:
    head = re.sub(
        r'(<meta\s+' + re.escape(attr) + r'\s+content=")[^"]*(")',
        lambda mm: mm.group(1) + val + mm.group(2),
        head,
        flags=re.S,
    )
VI_URL, EN_URL = cfg['urlVi'], cfg['urlEn']
head = head.replace(f'"{VI_URL}"', f'"{EN_URL}"')
if 'hreflang' not in head:
    head = head.replace(
        f'<link rel="canonical" href="{EN_URL}" />',
        f'<link rel="canonical" href="{EN_URL}" />\n'
        f'    <link rel="alternate" hreflang="en" href="{EN_URL}" />\n'
        f'    <link rel="alternate" hreflang="vi" href="{VI_URL}" />\n'
        f'    <link rel="alternate" hreflang="x-default" href="{VI_URL}" />',
    )
head = head.replace('"inLanguage": "vi"', '"inLanguage": "en"')
head = re.sub(r'"headline": "[^"]*"', '"headline": "' + cfg['hubHeadlineEn'] + '"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC + '"', head)

# ---------------------------------------------------------------- 6. chrome (header + hero)
k = vi.index('<div class="container">\n        <div class="article-wrap">')
chrome = deepen(vi[vi.index('</head>') + len('</head>') : k])
for a, b in [
    (
        '<a href="/blog/" class="article-hero__back">← Quay lại Trang Chủ Blog</a>',
        '<a href="/blog/" class="article-hero__back">← Back to the blog</a>',
    ),
    ('Kỹ Sư AI Thực Chiến\n          </div>', 'Practical AI Engineer\n          </div>'),
    (
        'Kỹ Sư AI Thực Chiến — Lộ Trình Cho Lập Trình Viên Web',
        'Practical AI Engineer — A Roadmap for Web Developers',
    ),
    # Ban VI co link "Read in English" tro toi en/... — tu trong /en/ no se thanh
    # en/en/... nen phai THAY, khong duoc de thua huong.
    (
        '14 tháng 7, 2026 · Lộ trình 20 bài học · Thực hành chuyên sâu ·\n            '
        '<a href="en/aie-programming-series" style="color: #eab308">Read in English</a>',
        '14 July 2026 · A 20-lesson roadmap · Hands-on throughout ·\n            '
        '<a href="../aie-programming-series" style="color: #eab308">Đọc bản tiếng Việt</a>',
    ),
]:
    if a not in chrome:
        raise SystemExit('CHROME khong tim thay: ' + a[:60])
    chrome = chrome.replace(a, b, 1)

# Khong duoc con link nao tro vao en/ tu ben trong /en/
assert 'href="en/' not in chrome, 'chrome con link tro vao en/ — se thanh en/en/'

# ---------------------------------------------------------------- 7. tail (comments + footer)
t = vi.index('<div class="article-comments"')
tail = deepen(vi[t:]).replace('<h2>Bình luận</h2>', '<h2>Comments</h2>')

# ---------------------------------------------------------------- 8. than bai
body = open(BODY, encoding='utf-8').read()
for token, value in [('{{SVG}}', svg), ('{{SCRIPT}}', script), ('{{LESSONS}}', lesson_list)]:
    if token not in body:
        raise SystemExit('than bai thieu placeholder ' + token)
    body = body.replace(token, value, 1)

out = head + chrome + body + '\n            ' + tail

# ---------------------------------------------------------------- 9. doi chieu cau truc
# Bay loi "bo sot mot khoi noi dung": dem cac khoi cau truc o hai ban. Dich thi so
# tu se khac, nhung SO KHOI phai bang nhau — thieu mot callout la thieu that.
def shape(s):
    b = s[s.index('<div class="article-wrap">') : s.index('<div class="article-comments"')]
    b = re.sub(r'<script.*?</script>', '', b, flags=re.S)
    b = re.sub(r'<svg.*?</svg>', '', b, flags=re.S)
    return {
        'h2': len(re.findall(r'<h2>', b)),
        'h3': len(re.findall(r'<h3', b)),
        'callout': len(re.findall(r'class="callout callout--', b)),
        'table': len(re.findall(r'<table', b)),
        'tr': len(re.findall(r'<tr>', b)),
        'lesson-item': len(re.findall(r'class="lesson-item"', b)),
    }


sv, se = shape(vi), shape(out)
diff = {k: (sv[k], se[k]) for k in sv if sv[k] != se[k]}
# Bang thuat ngu ban EN bo cot "Dich nghia" nen so <tr> giong nhau, so <th> thi khac.
if diff:
    print(f'  !! CAU TRUC LECH (VI, EN): {diff}')
    print('     Neu day khong phai thay doi co y, ban EN dang thieu noi dung.')
else:
    print(f'  cau truc khop ban VI: {sv}')

open(EN, 'w', encoding='utf-8').write(out)

leftover = sorted(set(' '.join(x.split()) for x in re.findall(r'[^\s<>]*' + VN + r'[^\s<>]*', out, re.I)))
print(f'  da ghi {EN} — {len(out.splitlines())} dong')
print(f'  the bai: {len(cards)} | co ban EN: {n_en} | tro ve ban VI: {len(cards) - n_en}')
print(f'  tu tieng Viet con lai (mong doi chi co link locale): {leftover}')
