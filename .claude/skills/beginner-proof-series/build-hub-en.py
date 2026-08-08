#!/usr/bin/env python3
"""
Dung ban tieng Anh cua trang HUB mot series.

Hub khac bai hoc: khong co <div class="article-body">. Tuy series, no CO THE co
mot khoi <style>, mot so do SVG lon, va mot <script> noi tuyen chua chuoi noi
dung. Ca ba deu TUY CHON — chi xu ly khi than bai EN co placeholder tuong ung.

Nguyen tac giu nguyen:
  - khoi <style>            : nguyen van
  - so do SVG              : nguyen van (nhan phai da la tieng Anh san)
  - LOGIC cua <script>     : nguyen van; chi thay cac chuoi noi dung theo
                             bang dich, va BAO LOI DUNG neu con sot chuoi
                             tieng Viet nao trong script.

Cac chuoi chrome (header + hero) khac nhau tung series nen nam trong
config.json duoi khoa "hubChromeSubs", giong cach lam cua tung bai hoc.

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
# Tuy chon: chi series nao co khoi <style> rieng tren hub moi dung toi.
if '<style>' in vi:
    i = vi.index('<style>')
    style = vi[i : vi.index('</style>', i) + len('</style>')]
else:
    style = ''

# ---------------------------------------------------------------- 2. svg so do
# Tuy chon. Mau khop lay tu config de moi series dat ten lop rieng duoc.
SVG_PATTERN = cfg.get('hubSvgPattern', r'<div class="ai-roadmap-visual">\s*<svg.*?</svg>\s*</div>')
m = re.search(SVG_PATTERN, vi, re.S)
svg = m.group(0) if m else ''
if svg:
    assert not re.search(VN, svg, re.I), 'so do co chu tieng Viet — can bang dich nhan'

# ---------------------------------------------------------------- 3. script
# Tuy chon: nhieu hub khong co <script> noi tuyen chua noi dung nao ca.
SCRIPT_MARKER = cfg.get('hubScriptMarker', '<script>\n              document.addEventListener')
if SCRIPT_MARKER in vi:
    i = vi.index(SCRIPT_MARKER)
    j = vi.index('</script>', i) + len('</script>')
    script_vi = vi[i:j]
else:
    script_vi = ''
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
if script_vi:
    print(f'  script: {n_en} chuoi, logic giong het nguon, khong sot tieng Viet')

# ---------------------------------------------------------------- 4. the bai hoc
# Mot so hub chia lo trinh thanh "chang" bang <div class="lessons-stage">. Neu
# bo qua, ban EN mat het cac dai do — va shape() khong bat duoc vi chung la <div>
# chu khong phai h2/h3/callout. Cho phep hub-lessons-en.json xen cac muc dang
# {"stage": "...", "styleVi": "..."} giua cac bai; chung khong duoc danh so.
cards = []
n = 0
for L in lessons:
    if 'stage' in L:
        style = L.get('style', '')
        attr = f' style="{style}"' if style else ''
        cards.append(f'              <div class="lessons-stage"{attr}>{L["stage"]}</div>')
        continue
    n += 1
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
n_en = sum(1 for L in lessons if 'slug' in L and os.path.exists(f'{LESSON_DIR}/{L["slug"]}.html'))

# Tieu de tren hub phai khop tieu de THUC cua trang EN. Trang la nguon dung;
# hub lech la doc gia bam vao mot cai ten roi den mot trang ten khac.
for L in lessons:
    if 'slug' not in L:
        continue
    fp = f'{LESSON_DIR}/{L["slug"]}.html'
    if not os.path.exists(fp):
        continue
    page = open(fp, encoding='utf-8').read()
    h1 = ' '.join(
        re.sub(r'<[^>]+>', '', re.search(r'<h1 class="article-hero__title"[^>]*>(.*?)</h1>', page, re.S).group(1)).split()
    )
    # Mot so series dat so bai o badge <div class="lesson-number"> nen the hub
    # KHONG lap lai "Lesson N:" trong khi <h1> cua trang van co. Cho phep dung
    # tien to do — nhung chi tien to, phan con lai van phai trung khop tuyet doi.
    if h1 != L['title'] and re.sub(r'^Lesson \d+:\s*', '', h1) != L['title']:
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
# CHI doi canonical va og:url. Truoc day dung replace chung cho moi lan xuat hien
# cua VI_URL, nen no ghi de luon ca hreflang="vi" va x-default thanh URL tieng Anh.
# Hau qua: hreflang vi va en tro CUNG mot URL, nut doi ngon ngu dieu huong ve chinh
# trang dang xem, va nguoi dung thay "bam khong doi gi". build-lesson-en.py da sua
# loi nay tu truoc — day la cho bi bo sot.
head = head.replace(
    f'<link rel="canonical" href="{VI_URL}" />', f'<link rel="canonical" href="{EN_URL}" />'
).replace(f'<meta property="og:url" content="{VI_URL}" />', f'<meta property="og:url" content="{EN_URL}" />')
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
# Cac chuoi chrome khac nhau tung series, nen chung nam trong config.json chu
# khong gan cung o day. Thieu mot cap la BAO LOI DUNG, giong build-lesson-en.py.
for a, b in cfg['hubChromeSubs']:
    if a not in chrome:
        raise SystemExit('CHROME khong tim thay: ' + a[:70])
    chrome = chrome.replace(a, b, 1)

# Khong duoc con link nao tro vao en/ tu ben trong /en/
assert 'href="en/' not in chrome, 'chrome con link tro vao en/ — se thanh en/en/'

# ---------------------------------------------------------------- 7. tail (comments + footer)
t = vi.index('<div class="article-comments"')
tail = deepen(vi[t:]).replace('<h2>Bình luận</h2>', '<h2>Comments</h2>')

# ---------------------------------------------------------------- 8. than bai
body = open(BODY, encoding='utf-8').read()
# {{LESSONS}} luon bat buoc. {{SVG}} va {{SCRIPT}} chi bat buoc khi ban VI THUC SU
# co phan do — series khong co so do hay script noi tuyen thi bo qua, nhung neu
# ban VI co ma than bai EN quen cham thi van bao loi (mat noi dung im lang).
for token, value, required in [
    ('{{LESSONS}}', lesson_list, True),
    ('{{SVG}}', svg, bool(svg)),
    ('{{SCRIPT}}', script, bool(script_vi)),
]:
    if token not in body:
        if required:
            raise SystemExit('than bai thieu placeholder ' + token)
        continue
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
n_cards = sum(1 for L in lessons if 'slug' in L)
print(f'  the bai: {n_cards} | co ban EN: {n_en} | tro ve ban VI: {n_cards - n_en}')
print(f'  tu tieng Viet con lai (mong doi chi co link locale): {leftover}')
