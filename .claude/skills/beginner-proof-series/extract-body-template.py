#!/usr/bin/env python3
"""
Trich <slug>.body-en.html tu mot trang EN DA SHIP.

    python3 extract-body-template.py <thu-muc-series> <slug>

Dung cho bai da co ban EN nhung khong con template — no lay than bai cua trang
EN roi thay:
    moi <div class="code-window">   -> {{CODE:<ten-file>}}   (trung ten thi #2, #3...)
    moi khoi so do SVG              -> {{SVG:<n>}}

Neu so do co nhan <text> thi cung ghi ra <slug>.svg-labels.json, ghep nhan cua
ban VI voi nhan cua ban EN theo dung thu tu xuat hien.

Trich xong PHAI kiem: chay build-lesson-en.py roi diff voi ban da ship. Giong
het tung byte thi template moi dung.
"""
import json
import os
import re
import sys

if len(sys.argv) != 3:
    raise SystemExit('dung: extract-body-template.py <thu-muc-series> <slug>')
SERIES, SLUG = sys.argv[1].rstrip('/'), sys.argv[2]
cfg = json.load(open(f'{SERIES}/config.json', encoding='utf-8'))
LDIR = f'{SERIES}/lessons'
os.makedirs(LDIR, exist_ok=True)

vi = open(f'{cfg["lessonDirVi"]}/{SLUG}.html', encoding='utf-8').read()
en = open(f'{cfg["lessonDirEn"]}/{SLUG}.html', encoding='utf-8').read()

CODE_RE = (
    r'<div class="code-window">\s*<div class="code-header">.*?'
    r'<span class="code-filename">([^<]*)</span>.*?</div>\s*'
    r'<pre><code[^>]*>.*?</code></pre>\s*</div>'
)
SVG_RE = r'<div style="margin: 20px 0; text-align: center">\s*<svg.*?</svg>\s*</div>'

body = en[en.index('<div class="article-body">') + len('<div class="article-body">') : en.index('<div class="article-related">')]

# ------------------------------------------------------------------ khoi code
seen = {}


def to_placeholder(m):
    name = m.group(1).strip()
    seen[name] = seen.get(name, 0) + 1
    key = name if seen[name] == 1 else f'{name}#{seen[name]}'
    return '{{CODE:' + key + '}}'


body = re.sub(CODE_RE, to_placeholder, body, flags=re.S)
n_code = sum(seen.values())

# ------------------------------------------------------------------ so do
svg_en = re.findall(SVG_RE, body, re.S)
svg_vi = re.findall(SVG_RE, vi, re.S)
if len(svg_en) != len(svg_vi):
    raise SystemExit(f'so do lech: ban VI {len(svg_vi)}, ban EN {len(svg_en)}')

labels = {}
for bvi, ben in zip(svg_vi, svg_en):
    tvi = [' '.join(x.split()) for x in re.findall(r'<text\b[^>]*>(.*?)</text>', bvi, re.S)]
    ten = [' '.join(x.split()) for x in re.findall(r'<text\b[^>]*>(.*?)</text>', ben, re.S)]
    if len(tvi) != len(ten):
        raise SystemExit('so nhan <text> lech giua hai ban — khong ghep duoc tu dong')
    for a, b in zip(tvi, ten):
        if a:
            labels[a] = b
    avi = re.search(r'aria-label="([^"]*)"', bvi)
    aen = re.search(r'aria-label="([^"]*)"', ben)
    if avi and aen:
        labels[avi.group(1)] = aen.group(1)

counter = iter(range(1, len(svg_en) + 1))
body = re.sub(SVG_RE, lambda m: '{{SVG:' + str(next(counter)) + '}}', body, flags=re.S)

# ------------------------------------------------------------------ ghi ra
out = f'{LDIR}/{SLUG}.body-en.html'
open(out, 'w', encoding='utf-8').write(body.strip('\n') + '\n')
print(f'da ghi {out}')
print(f'  {n_code} placeholder code, {len(svg_en)} placeholder so do')
if labels:
    lp = f'{LDIR}/{SLUG}.svg-labels.json'
    json.dump(labels, open(lp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'da ghi {lp} — {len(labels)} nhan')
print('  GIO PHAI KIEM: chay build-lesson-en.py roi diff voi ban da ship.')
