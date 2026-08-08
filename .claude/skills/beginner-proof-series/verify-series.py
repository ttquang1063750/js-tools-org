#!/usr/bin/env python3
"""
Kiem TOAN BO cac bat bien cua mot series song ngu, trong mot lenh.

    python3 verify-series.py <thu-muc-series>            # kiem
    python3 verify-series.py <thu-muc-series> --quiet    # chi in dong khong dat

Muc dich: nguoi/phien tiep theo KHONG phai kiem lai tung thu bang tay. Chay
lenh nay, thay xanh thi tin trang thai va lam bai tiep; thay do thi da co san
dia chi cua cai sai.

Moi kiem tra o day tuong ung voi mot loi DA TUNG xay ra that trong series nay,
chu khong phai gia dinh:

  validator      check-lesson.js dat o ca hai ban
  code-same      khoi code giong het giua hai locale (code trung lap ngon ngu)
  code-en        khong con tieng Viet trong code, tru cac file duoc mien tru
  svg-geom       hinh hoc so do giong het (bo <text> va aria-label)
  svg-en         nhan so do ban EN khong con tieng Viet
  hreflang       ca hai trang co du bo ba, tro dung phia
  urls           canonical/og:url dung locale cua minh
  links          moi link tuong doi giai duoc; link "next" khoa DUNG khi thieu
  registered     co trong sitemap.xml va blog/search-index.json
  hub            the tren hub tro sang EN khi co EN, va tieu de khop <h1>
  rebuildable    co template + meta de dung lai duoc
  chrome         tag/ngay/tac gia thong nhat giua cac bai EN
  dollar         so dau $ trong van xuoi EN phai chan (le = co $ lac, KaTeX se an chu)

Ma thoat khac 0 neu co bat ky kiem tra nao khong dat.
"""
import json
import os
import re
import subprocess
import sys

VN = r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵĐđ]'
# So do co hai kieu boc trong repo: <div style=...> (AIE) va <figure> (sysdesign).
# Bo sot kieu thu hai nghia la bat bien svg-geom KHONG che chung — hinh hoc lech
# giua hai locale ma khong ai bao.
SVG_RE = (r'<div style="margin: 20px 0; text-align: center">\s*<svg.*?</svg>\s*</div>'
          r'|<figure[^>]*>\s*<svg.*?</svg>\s*(?:<figcaption[^>]*>.*?</figcaption>\s*)?</figure>')
CODE_RE = r'<span class="code-filename">([^<]*)</span>.*?<pre><code[^>]*>(.*?)</code></pre>'

if not 2 <= len(sys.argv) <= 3:
    raise SystemExit('dung: verify-series.py <thu-muc-series> [--quiet]')
SERIES = sys.argv[1].rstrip('/')
QUIET = '--quiet' in sys.argv
cfg = json.load(open(f'{SERIES}/config.json', encoding='utf-8'))
LDIR, VDIR, EDIR = f'{SERIES}/lessons', cfg['lessonDirVi'], cfg['lessonDirEn']
EXEMPT = set(cfg.get('codeDataExemptions', {}))
STD = cfg.get('chromeStandardEn', {})
base_url = cfg['urlVi'].rsplit('/', 1)[0]

sitemap = open('sitemap.xml', encoding='utf-8').read()
index = {x['url'] for x in json.load(open('blog/search-index.json', encoding='utf-8'))}
hub_en = open(cfg['hubEn'], encoding='utf-8').read() if os.path.exists(cfg['hubEn']) else ''
hub_vi = open(cfg['hubVi'], encoding='utf-8').read()

# Thu tu bai lay tu hub, giong next-lesson.py
order = []
for m in re.finditer(r'<(?:a|span)\s+[^>]*?(?:href="\.?/?([a-z0-9-]+)")?[^>]*?class="[^"]*lesson-item', hub_vi):
    slug = m.group(1)
    win = hub_vi[m.end() : m.end() + 400]
    num = re.search(r'class="lesson-number"[^>]*>\s*(\d+)', win) or re.search(r'Bài\s+(\d+)\s*:', win)
    if slug and num:
        order.append((int(num.group(1)), slug))
order.sort()

failures = []


def fail(slug, check, detail):
    failures.append((slug, check, detail))


def strip(s, drop_text=True):
    """Bo moi thu LA VAN BAN, giu lai hinh hoc — de svg-geom so dung cai can so.

    <figcaption> cung phai bo: no la van xuoi that va DUOC dich, nen giu lai se
    lam moi so do co figcaption bi bao lech hinh hoc sai su that.
    """
    s = re.sub(r'<text[^>]*>.*?</text>', '', s, flags=re.S) if drop_text else s
    s = re.sub(r'<figcaption[^>]*>.*?</figcaption>', '', s, flags=re.S)
    return ' '.join(re.sub(r'aria-label="[^"]*"', '', s).split())


def prose(path):
    """Van xuoi, da bo code block, so do VA ca <code> inline.

    Bo <code> la co y: trong do dau $ la van ban that (vi du `${name}` cua
    template literal), khong phai dau phan cach KaTeX. Phan con lai chi nen
    chua $ theo CAP cua KaTeX, nen so luong le nghia la co mot dau $ lac —
    va mot dau $ lac se lam KaTeX an mat doan van giua no va dau $ ke tiep.
    """
    t = open(path, encoding='utf-8').read()
    if 'class="article-body"' not in t:
        return ''
    b = t[t.index('class="article-body"') : t.index('</main>')]
    for pat in (r'<pre>.*?</pre>', r'<svg.*?</svg>', r'<code[^>]*>.*?</code>'):
        b = re.sub(pat, '', b, flags=re.S)
    return re.sub(r'<[^>]+>', ' ', b)


chrome_seen = {}

for num, slug in order:
    vi_p, en_p = f'{VDIR}/{slug}.html', f'{EDIR}/{slug}.html'
    if not os.path.exists(en_p):
        continue  # chua dich — khong phai loi, next-lesson.py se bao
    vi, en = open(vi_p, encoding='utf-8').read(), open(en_p, encoding='utf-8').read()
    checks = []

    # --- validator
    bad = [
        p
        for p in (vi_p, en_p)
        if subprocess.run(['node', 'check-lesson.js', p], capture_output=True).returncode != 0
    ]
    checks.append(('validator', not bad, ', '.join(bad)))

    # --- code giong het + khong con tieng Viet
    cv, ce = re.findall(CODE_RE, vi, re.S), re.findall(CODE_RE, en, re.S)
    diff_idx = [i for i, (a, b) in enumerate(zip(cv, ce)) if a[1] != b[1]]
    checks.append(
        ('code-same', len(cv) == len(ce) and not diff_idx, f'{len(cv)}/{len(ce)} khoi, lech tai {diff_idx}')
    )
    # Mien tru co the la ten khoi ("data_cleaner.py") hoac dinh danh theo bai
    # ("aie-rnn-attention:Terminal") — dang thu hai de mien trung MOT khoi cua MOT
    # bai, thay vi mien trung moi khoi cung ten o moi bai (se che loi that).
    leaked = sorted(
        {n for n, c in cv + ce if re.search(VN, c, re.I) and n not in EXEMPT and f'{slug}:{n}' not in EXEMPT}
    )
    checks.append(('code-en', not leaked, ', '.join(leaked)))

    # --- so do
    gv = [strip(b) for b in re.findall(SVG_RE, vi, re.S)]
    ge = [strip(b) for b in re.findall(SVG_RE, en, re.S)]
    checks.append(('svg-geom', gv == ge, f'{len(gv)} vs {len(ge)} so do'))
    svg_vn = [
        ' '.join(t.split())
        for b in re.findall(SVG_RE, en, re.S)
        for t in re.findall(r'<text[^>]*>(.*?)</text>', b, re.S)
        if re.search(VN, t, re.I)
    ]
    checks.append(('svg-en', not svg_vn, '; '.join(svg_vn)[:70]))

    # --- hreflang / urls
    want = {('vi', f'{base_url}/{slug}'), ('en', f'{base_url}/en/{slug}'), ('x-default', f'{base_url}/{slug}')}
    # Prettier ngat thẻ <link> dai thanh nhieu dong, nen KHONG duoc doi hreflang va
    # href nam sat nhau tren cung mot dong — truoc day slug dai hon la check nay do.
    hl_re = r'hreflang="([^"]+)"\s+href="([^"]+)"|href="([^"]+)"\s+hreflang="([^"]+)"'
    def hreflangs(doc):
        out = set()
        for a, b, c, d in re.findall(hl_re, doc):
            out.add((a, b) if a else (d, c))
        return out
    ok_hl = all(hreflangs(s) == want for s in (vi, en))
    checks.append(('hreflang', ok_hl, 'bo ba thieu hoac tro sai'))
    urls_ok = True
    for s, expect in ((vi, f'{base_url}/{slug}'), (en, f'{base_url}/en/{slug}')):
        for pat in (r'<link rel="canonical" href="([^"]+)"', r'<meta property="og:url" content="([^"]+)"'):
            m = re.search(pat, s)
            if not m or m.group(1) != expect:
                urls_ok = False
    checks.append(('urls', urls_ok, 'canonical/og:url sai locale'))

    # --- links tuong doi + link next khoa dung
    # Bai cuoi cung cua series (khong co bai N+1 nao ca) co hai kieu hop le da
    # thay trong repo: mot span khoa an mung "hoan thanh lo trinh" (sysdesign)
    # hoac don gian la bo han khoi --next (aie). Ca hai deu dung vi ca hai deu
    # KHONG phai mot <a href> song tro toi trang khong ton tai — do moi la thu
    # bat bien nay thuc su can bat, khong phai su co mat/vang cua class
    # --locked. Vi vay kiem tra bang TAG cua --next (a hay span/khong co), chu
    # khong kiem tra substring "--locked" co mat trong ca file hay khong.
    bad_links = []
    for m in re.finditer(r'href="(?!https?:|#|/|mailto:)([^"#?]+)"', en):
        p = os.path.normpath(os.path.join(EDIR, m.group(1)))
        if not (os.path.exists(p) or os.path.exists(p + '.html')):
            bad_links.append(m.group(1))
    nxt = next((s for n, s in order if n == num + 1), None)
    next_exists = bool(nxt) and os.path.exists(f'{EDIR}/{nxt}.html')
    m_next = re.search(r'<(a|span)\b[^>]*\bclass="[^"]*article-related__link--next[^"]*"', en)
    next_tag = m_next.group(1) if m_next else None
    # next_exists=True  -> --next PHAI la <a> song (bai da co ban EN, phai mo khoa)
    # next_exists=False -> --next KHONG duoc la <a> (bai chua co EN, hoac day la
    #                      bai cuoi series nen khong co bai N+1 nao ca)
    next_ok = (next_tag == 'a') if next_exists else (next_tag != 'a')
    checks.append(('links', not bad_links and next_ok,
                   f'chet={sorted(set(bad_links))} next_tag={next_tag} next_da_co_EN={next_exists}'))

    # --- dang ky
    reg = f'{base_url.replace("https://js-tools.org", "")}/en/{slug}'.lstrip('/')
    in_sm = f'/en/{slug}</loc>' in sitemap
    in_ix = any(u.endswith(f'en/{slug}') for u in index)
    checks.append(('registered', in_sm and in_ix, f'sitemap={in_sm} index={in_ix}'))

    # --- hub
    card = re.search(r'<a href="([^"]+)" class="lesson-item">\s*<div class="lesson-number">%02d</div>.*?<h3 class="lesson-title">(.*?)</h3>' % num, hub_en, re.S)
    if not card:
        checks.append(('hub', False, 'khong tim thay the bai tren hub EN'))
    else:
        href, title = card.group(1), ' '.join(re.sub(r'<em.*?</em>', '', card.group(2), flags=re.S).split())
        h1 = ' '.join(re.sub(r'<[^>]+>', '', re.search(r'<h1 class="article-hero__title"[^>]*>(.*?)</h1>', en, re.S).group(1)).split())
        # Series dat so bai o badge lesson-number thi the hub khong lap "Lesson N:"
        # trong khi <h1> cua trang van co. Chap nhan dung tien to do, khong hon.
        title_ok = title == h1 or title == re.sub(r'^Lesson \d+:\s*', '', h1)
        checks.append(('hub', href == slug and title_ok, f'href={href} tieu_de_khop={title_ok}'))

    # --- dung lai duoc
    have = [os.path.exists(f'{LDIR}/{slug}.{x}') for x in ('body-en.html', 'meta-en.json')]
    checks.append(('rebuildable', all(have), f'body={have[0]} meta={have[1]}'))

    # --- chrome thong nhat
    # Mot so series them lop rieng: class="article-hero__tag article-hero__tag--sysdesign".
    m_tag = re.search(r'<div class="article-hero__tag[^"]*"[^>]*>(.*?)</div>', en, re.S)
    if not m_tag:
        fail(slug, 'chrome', 'khong tim thay article-hero__tag tren trang EN')
        continue
    tag = ' '.join(m_tag.group(1).split())
    meta_txt = ' '.join(re.search(r'<div class="article-hero__meta"[^>]*>(.*?)</div>', en, re.S).group(1).split())
    # `date` chap nhan mot chuoi HOAC mot danh sach: mot series xuat ban nhieu ngay
    # la chuyen binh thuong (sysdesign: Bai 1-12 ngay 3, Bai 13-18 ngay 4). Ep mot
    # ngay duy nhat se bat oan dung trang, va cach "sua" duy nhat la sua sai ngay.
    dates = STD.get('date', '')
    if isinstance(dates, str):
        dates = [dates]
    ok_date = any(d in meta_txt for d in dates)
    ok_chrome = (
        re.match(STD.get('tagPattern', '.*'), tag)
        and ok_date
        and STD.get('byline', '') in meta_txt
    )
    chrome_seen[slug] = (tag, meta_txt[:40])
    checks.append(('chrome', bool(ok_chrome), f'tag="{tag}" meta="{meta_txt[:34]}"'))

    # --- dau $ le trong van xuoi EN
    n_dollar = prose(en_p).count('$')
    checks.append(('dollar', n_dollar % 2 == 0, f'{n_dollar} dau $ (le = co $ lac)'))

    line = f'  Bai {num:2} {slug:26}'
    for name, ok, detail in checks:
        if not ok:
            fail(slug, name, detail)
    if QUIET and all(ok for _, ok, _ in checks):
        continue
    print(line + ' '.join(f'{name}:{"OK" if ok else "X"}' for name, ok, _ in checks))

print()
if failures:
    print(f'{len(failures)} KIEM TRA KHONG DAT:\n')
    for slug, check, detail in failures:
        print(f'  {slug}  [{check}]  {detail}')
    print('\nSua roi chay lai. Neu la trang EN thi SUA TEMPLATE roi dung lai,')
    print('dung sua truc tiep HTML — lan dung sau se ghi de len.')
    sys.exit(1)
print(f'TAT CA DAT — {len([s for _, s in order if os.path.exists(f"{EDIR}/{s}.html")])} bai da dich, khong co bat bien nao bi vi pham.')
print('Co the tin trang thai nay va lam bai tiep.')
