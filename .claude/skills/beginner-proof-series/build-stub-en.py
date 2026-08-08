#!/usr/bin/env python3
"""
Sinh trang stub tieng Anh cho cac bai CHUA co ban dich.

Muc dich duy nhat: nut doi ngon ngu hoat dong HAI CHIEU tren moi trang. Truoc
day trang tieng Viet khong co URL tieng Anh nao de tro toi, nen nut chi doi chu
cua nav/footer — doc gia bam xong van dung o than bai tieng Viet.

Stub CO: head that, header that, footer that, hreflang tro dung ca hai chieu.
Stub KHONG CO: noi dung. Than bai chi la mot callout noi ro chua dich xong va
tro nguoc ve ban tieng Viet day du.

Hai chot chan BAT BUOC, khong duoc bo:
  1. <meta name="robots" content="noindex"> tren moi stub.
     298 trang gan giong het nhau la thin content. Go ra khi co noi dung that.
  2. KHONG dua stub vao sitemap.xml. Sitemap la loi moi lap chi muc.

Dung:
  build-stub-en.py --dry-run     # in ra se lam gi, khong ghi gi
  build-stub-en.py               # ghi that
  build-stub-en.py blog/git      # chi mot series
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../../..'
os.chdir(ROOT)

DRY = '--dry-run' in sys.argv
# --vi-only: chi sua <head> cua ban tieng Viet (lang + hreflang), khong ghi stub.
# Dung khi can ap lai phan sua VI ma khong dung tay vao thu muc en/.
VI_ONLY = '--vi-only' in sys.argv
SCOPE = [a for a in sys.argv[1:] if not a.startswith('--')]

SITE = 'https://js-tools.org'


def deepen(t):
    """File EN nam sau mot cap thu muc so voi ban VI."""
    t = t.replace('href="../../', 'href="../../../').replace('src="../../', 'src="../../../')
    t = t.replace('href="../', 'href="../../').replace('src="../', 'src="../../')
    return t.replace('../../../../', '../../../')


def block(s, tag):
    """Lay tron mot khoi <tag ...>...</tag> dau tien. None neu khong co."""
    m = re.search(rf'<{tag}[^>]*>', s)
    if not m:
        return None
    end = s.index(f'</{tag}>', m.end()) + len(f'</{tag}>')
    return s[m.start() : end]


def build(vi_path):
    series = vi_path.split('/')[1]
    slug = os.path.basename(vi_path)[:-5]
    en_path = f'blog/{series}/en/{slug}.html'
    vi = open(vi_path, encoding='utf-8').read()

    vi_url = f'{SITE}/blog/{series}/{slug}'
    en_url = f'{SITE}/blog/{series}/en/{slug}'

    # ---------------------------------------------------------------- head
    head = deepen(vi[: vi.index('</head>') + len('</head>')])
    # Ban VI cua 91 trang dang khai lang="en" — sua o ham fix_vi(), nen o day
    # chi can khop ca hai kha nang.
    head = re.sub(r'<html\s+lang="(?:vi|en)"', '<html lang="en"', head, count=1)

    # CHI doi canonical va og:url. KHONG dung replace chung cho moi lan xuat hien
    # cua vi_url: hreflang="vi" va x-default phai GIU URL tieng Viet. Chinh phep
    # replace chung nay da lam hong 2 trang hub truoc day, va khong co gi bao loi.
    head = head.replace(
        f'<link rel="canonical" href="{vi_url}" />', f'<link rel="canonical" href="{en_url}" />'
    ).replace(
        f'<meta property="og:url" content="{vi_url}" />',
        f'<meta property="og:url" content="{en_url}" />',
    )

    title_vi = ''
    m = re.search(r'<title>(.*?)</title>', head, re.S)
    if m:
        title_vi = ' '.join(m.group(1).split())
    # Tieu de phai noi that trang nay la gi. Giu ten bai (do la danh tinh cua bai)
    # va noi ro chua dich, thay vi gia vo day la mot bai tieng Anh hoan chinh.
    # Tieu de VI da co duoi " — js-tools". Noi thang vao cuoi thi thanh
    # "... — js-tools — English translation coming soon" (duoi site nam giua cau).
    # Chen TRUOC duoi site.
    msuf = re.search(r'(\s*[—|–-]\s*js-tools[^<]*)$', title_vi)
    base, suf = (title_vi[: msuf.start()], msuf.group(1)) if msuf else (title_vi, '')
    t_new = f'{base} — English translation coming soon{suf}'
    d_new = (
        'The English translation of this lesson is not ready yet. '
        'The complete Vietnamese version is available now.'
    )
    head = re.sub(r'<title>.*?</title>', f'<title>{t_new}</title>', head, flags=re.S)
    for attr, val in [
        ('name="description"', d_new),
        ('property="og:title"', t_new),
        ('property="og:description"', d_new),
        ('name="twitter:title"', t_new),
        ('name="twitter:description"', d_new),
    ]:
        head = re.sub(
            r'(<meta\s+' + re.escape(attr) + r'\s+content=")[^"]*(")',
            lambda mm: mm.group(1) + val.replace('\\', '\\\\') + mm.group(2),
            head,
            flags=re.S,
        )

    # Mot so series (electronics) nap script rieng cua bai ngay trong <head>.
    # Head duoc copy nguyen van, ma deepen() khong sua duong dan tuong doi cung
    # thu muc, nen chung se tro vao en/ va tra ve 404. Stub khong co demo nao
    # de chung dieu khien -> bo han, giong cach xu ly o cuoi trang.
    head = re.sub(
        r'\s*<script[^>]*src="(?!\.\./|/|https?:|//)[^"]*"[^>]*></script>', '', head
    )

    # JSON-LD cua ban VI khai mot BlogPosting tieng Viet. Giu nguyen tren stub la
    # noi voi Google rang ton tai mot bai tieng Anh day du — nen bo han. Trang
    # khong co noi dung thi khong co gi de khai bao.
    head = re.sub(
        r'\s*<script type="application/ld\+json">.*?</script>', '', head, flags=re.S
    )

    # noindex + hreflang. Dat ngay truoc </head> de de doc va de go sau nay.
    head = head.replace('</head>', '')
    head = re.sub(r'\s*<link rel="alternate"[^>]*>', '', head, flags=re.S)
    head = re.sub(r'\s*<meta name="robots"[^>]*>', '', head, flags=re.S)
    head = head.rstrip() + f'''

    <!-- Trang stub: chua co noi dung tieng Anh. noindex de 298 trang gan giong
         het nhau khong bi coi la thin content. GO DONG NAY khi dich xong. -->
    <meta name="robots" content="noindex, follow" />
    <link rel="alternate" hreflang="vi" href="{vi_url}" />
    <link rel="alternate" hreflang="en" href="{en_url}" />
    <link rel="alternate" hreflang="x-default" href="{vi_url}" />
  </head>'''

    # ---------------------------------------------------------------- chrome
    header = block(vi, 'header')
    footer = block(vi, 'footer')
    if not header or not footer:
        raise SystemExit(f'{vi_path}: thieu <header> hoac <footer>')
    header, footer = deepen(header), deepen(footer)

    # ---------------------------------------------------------------- hero
    hero = block(vi, 'section')
    hero_html = ''
    if hero and 'article-hero' in hero:
        # Bo dong meta (ngay + thoi gian doc): so lieu do thuoc ban tieng Viet.
        hero = re.sub(r'\s*<div class="article-hero__meta">.*?</div>', '', hero, flags=re.S)
        # Link "quay lai" phai tro ve hub — ban EN neu co, nguoc lai ban VI.
        def fix_back(mm):
            target = mm.group(1)
            if os.path.exists(f'blog/{series}/en/{target}.html'):
                return f'<a href="{target}" class="article-hero__back">Back to the roadmap</a>'
            return f'<a href="../{target}" class="article-hero__back">Back to the roadmap</a>'

        hero = re.sub(
            r'<a href="([^"/]+)" class="article-hero__back">.*?</a>', fix_back, hero, flags=re.S
        )
        hero_html = hero

    # ---------------------------------------------------------------- than bai
    body = f'''<div class="article-body">
              <div class="callout callout--note">
                <div class="callout__title">🚧 English translation coming soon</div>
                <div class="callout__content">
                  This lesson has not been translated into English yet — the page
                  you are on is a placeholder, so that switching language never
                  leaves you stranded.
                  <br /><br />
                  The <strong>Vietnamese version is complete</strong> and has the
                  full explanation, code and exercises:
                  <br /><br />
                  <a href="../{slug}">Read this lesson in Vietnamese</a>
                </div>
              </div>
            </div>'''

    main = f'''<main>
      {hero_html}

      <div class="container">
        <div class="article-wrap">
          <article>
            {body}
          </article>
        </div>
      </div>
    </main>'''

    # ---------------------------------------------------------------- scripts
    # Cac the <script src> sau </footer> (i18n.js, blog.js...) phai giu, neu khong
    # nut doi ngon ngu tren chinh stub se khong chay — dung thu ta dang di sua.
    tail = vi[vi.index('</footer>') + len('</footer>') :]
    keep = []
    for tag in re.findall(r'<script[^>]*src="[^"]*"[^>]*></script>', tail):
        src = re.search(r'src="([^"]*)"', tag).group(1)
        # Chi giu script DUNG CHUNG (i18n.js, blog.js, prism.js...) — chung nam
        # ngoai thu muc series nen duong dan co '../' hoac la URL tuyet doi.
        # BO script rieng cua bai (src="<slug>.js", "vendor/sql-wasm.js"): stub
        # khong co demo nao de chung dieu khien, va vi deepen() khong sua duong
        # dan tuong doi cung thu muc, chung se tro vao en/ va tra ve 404.
        if src.startswith(('../', '/', 'http://', 'https://', '//')):
            keep.append(tag)
    scripts = '\n    '.join(deepen(t) for t in keep)

    out = f'''{head}
  <body>
    {header}

    {main}

    {footer}

    {scripts}
  </body>
</html>
'''
    return en_path, out


def fix_vi(vi_path):
    """Ban VI phai khai lang="vi" va phai co hreflang tro sang ban EN.

    91 trang dang khai lang="en" du noi dung la tieng Viet. i18n.js doc chinh
    thuoc tinh nay lam `contentLang`, nen neu de nguyen thi sau khi them hreflang
    chung se hien chrome tieng Anh, va bam "sang tieng Viet" lai nhay sang stub.
    """
    series = vi_path.split('/')[1]
    slug = os.path.basename(vi_path)[:-5]
    vi_url, en_url = f'{SITE}/blog/{series}/{slug}', f'{SITE}/blog/{series}/en/{slug}'
    s = open(vi_path, encoding='utf-8').read()
    orig = s
    s = re.sub(r'<html\s+lang="en"', '<html lang="vi"', s, count=1)
    s = re.sub(r'\s*<link rel="alternate"[^>]*>', '', s[: s.index('</head>')], flags=re.S) + s[
        s.index('</head>') :
    ]
    # Khop CA phan thut le cua the dong, neu khong se de lai mot dong chi co
    # khoang trang (prettier va git deu coi do la rac).
    s = s.replace(
        '\n  </head>',
        f'''
    <link rel="alternate" hreflang="vi" href="{vi_url}" />
    <link rel="alternate" hreflang="en" href="{en_url}" />
    <link rel="alternate" hreflang="x-default" href="{vi_url}" />
  </head>''',
        1,
    )
    return s if s != orig else None


targets = json.load(open('.claude/skills/beginner-proof-series/stub-targets.json'))
if SCOPE:
    targets = [t for t in targets if any(t.startswith(p) for p in SCOPE)]

n_en = n_vi = 0
for vi_path in targets:
    en_path, out = (None, None) if VI_ONLY else build(vi_path)
    fixed = fix_vi(vi_path)
    if DRY:
        print(f'  se ghi {en_path}' + ('  + sua ban VI' if fixed else ''))
    else:
        if not VI_ONLY:
            os.makedirs(os.path.dirname(en_path), exist_ok=True)
            open(en_path, 'w', encoding='utf-8').write(out)
        if fixed:
            open(vi_path, 'w', encoding='utf-8').write(fixed)
    n_en += 0 if VI_ONLY else 1
    n_vi += 1 if fixed else 0

print(f'{"[dry-run] " if DRY else ""}stub EN: {n_en} | ban VI duoc sua: {n_vi}')
