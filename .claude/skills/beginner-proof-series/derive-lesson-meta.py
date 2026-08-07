#!/usr/bin/env python3
"""
Sinh <slug>.meta-en.json tu mot cap trang VI/EN DA TON TAI.

    python3 derive-lesson-meta.py <thu-muc-series> <slug>

Dung khi mot bai da co ban EN nhung chua co file meta — no doc ca hai trang,
ghep tung cap chuoi tuong ung o phan chrome/tail, va ghi ra file meta de
build-lesson-en.py dung lai duoc.

Sinh xong PHAI kiem: chay build-lesson-en.py roi so sanh voi ban da ship. Neu
khong giong het thi file meta con thieu mot cap chuoi nao do.
"""
import json
import os
import re
import sys

if len(sys.argv) != 3:
    raise SystemExit('dung: derive-lesson-meta.py <thu-muc-series> <slug>')
SERIES, SLUG = sys.argv[1].rstrip('/'), sys.argv[2]
cfg = json.load(open(f'{SERIES}/config.json', encoding='utf-8'))
vi = open(f'{cfg["lessonDirVi"]}/{SLUG}.html', encoding='utf-8').read()
en = open(f'{cfg["lessonDirEn"]}/{SLUG}.html', encoding='utf-8').read()

g = lambda s, p: re.search(p, s, re.S).group(1)


def pair(pattern, label):
    """Lay cung mot khoi o hai ban. Bo qua neu hai ban giong nhau."""
    a = re.search(pattern, vi, re.S)
    b = re.search(pattern, en, re.S)
    if not a and not b:
        # Vang o CA HAI ban la binh thuong: bai dau khong co link "truoc", bai
        # cuoi khong co link "sau". Chi lech mot ben moi la loi.
        return None
    if not a or not b:
        raise SystemExit(f'{label}: co o ban {"VI" if a else "EN"} nhung KHONG co o ban kia')
    if a.group(0) == b.group(0):
        return None
    return [a.group(0), b.group(0)]


chrome_pats = [
    (r'<a href="[\w-]+-programming-series" class="article-hero__back">.*?</a>', 'hero back-link'),
    (r'<div class="article-hero__tag"[^>]*>\s*.*?\s*</div>', 'hero tag'),
    (r'<h1 class="article-hero__title"[^>]*>\s*.*?\s*</h1>', 'hero title'),
    (r'<div class="article-hero__meta"[^>]*>\s*.*?\s*</div>', 'hero meta'),
]
# Cac pattern phai neo theo CAU TRUC THE, khong theo van ban — van ban o ban EN
# da duoc dich nen tim chuoi tieng Viet trong do se truot.
tail_pats = [
    (r'(?<=<div class="article-related">)\s*<h2>.*?</h2>', 'related heading'),
    (r'<a href="[a-z0-9-]+" class="article-related__link article-related__link--prev">\s*.*?\s*</a>', 'prev link'),
    (
        r'<(?:a|span)[^>]*class="article-related__link article-related__link--next[^"]*"[^>]*>\s*.*?\s*</(?:a|span)>',
        'next link',
    ),
    (r'<a href="[\w-]+-programming-series" class="article-related__link">\s*.*?\s*</a>', 'hub link'),
    (r'(?<=<div class=\"article-comments\" style=\"margin-top: 60px\">)\s*<h2>.*?</h2>', 'comments heading'),
]

meta = {
    'title': g(en, r'<title>(.*?)</title>').strip(),
    'desc': g(en, r'<meta\s+name="description"\s+content="([^"]*)"'),
    'descPlain': g(en, r'"description": "([^"]*)"'),
    'headline': g(en, r'"headline": "([^"]*)"'),
    'chromeSubs': [p for p in (pair(pat, lbl) for pat, lbl in chrome_pats) if p],
    'tailSubs': [p for p in (pair(pat, lbl) for pat, lbl in tail_pats) if p],
}

out = f'{SERIES}/lessons/{SLUG}.meta-en.json'
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(meta, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'da ghi {out}')
print(f'  chromeSubs: {len(meta["chromeSubs"])} cap · tailSubs: {len(meta["tailSubs"])} cap')
print('  GIO PHAI KIEM: chay build-lesson-en.py roi diff voi ban da ship.')
