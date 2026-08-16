#!/usr/bin/env python3
"""Ra nhanh mot bai hoc truoc khi beginner-proof.

In ra dung nhung thu can quyet dinh:
  - cau truc H2/H3 + vi tri cac khoi code
  - khoi code nao THIEU dan de / ha canh (loi so 2 va 3 trong skill)
  - dong code con tieng Viet (pham quy tac code dung chung locale)
  - so tu + thoi gian doc thuc te so voi con so ghi trong hero
  - so div con mo trong than bai (can cho template EN)

dung: audit-lesson.py blog/c/c-control-flow.html
"""
import html
import re
import sys

VN = (r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợ'
      r'ùúủũụưừứửữựỳýỷỹỵđ]')
path = sys.argv[1]
s = open(path, encoding='utf-8').read()
body = s[s.index('<div class="article-body">'):s.index('<div class="article-related">')]

print(f'=== {path} ===')

# --- cau truc -------------------------------------------------------------
marks = []
for m in re.finditer(r'<h2[^>]*>(.*?)</h2>|<h3[^>]*>(.*?)</h3>'
                     r'|<span class="code-filename"\s*>([^<]*)</span\s*>'
                     r'|<div class="callout callout--([a-z]+)"'
                     r'|<table', body, re.S):
    if m.group(1):
        marks.append(('H2', ' '.join(html.unescape(re.sub(r'<[^>]+>', '', m.group(1))).split())))
    elif m.group(2):
        marks.append(('H3', ' '.join(html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).split())))
    elif m.group(3):
        marks.append(('CODE', m.group(3).strip()))
    elif m.group(4):
        marks.append(('CALLOUT', m.group(4)))
    else:
        marks.append(('TABLE', ''))
for kind, txt in marks:
    print(f'  {kind:8} {txt[:70]}')

# --- dan de / ha canh -----------------------------------------------------
print('\n--- khoi code thieu dan de / ha canh ---')
BLOCK = (r'<div class="code-window">\s*<div class="code-header">'
         r'(?:(?!</div>\s*<pre>).)*?<span class="code-filename"\s*>([^<]*)</span\s*>'
         r'.*?</code></pre>\s*</div>')
for m in re.finditer(BLOCK, body, re.S):
    name = m.group(1).strip()
    before = html.unescape(re.sub(r'<[^>]+>', ' ', body[max(0, m.start() - 500):m.start()]))
    after = html.unescape(re.sub(r'<[^>]+>', ' ', body[m.end():m.end() + 350]))
    before, after = ' '.join(before.split()), ' '.join(after.split())
    # ha canh la "thieu" neu ngay sau khoi la mot tieu de / quiz / het bai
    landed = after and not re.match(r'^(\d+\.|[A-D]\.|📝|Bài viết)', after)
    lead_ok = before.endswith((':', '…')) or len(before) > 40
    flags = []
    if not lead_ok:
        flags.append('THIEU-DAN-DE')
    if not landed:
        flags.append('THIEU-HA-CANH')
    print(f'  {name:26} {" ".join(flags) if flags else "ok"}')
    if flags:
        print(f'      truoc: ...{before[-70:]}')
        print(f'      sau  : {after[:70]}...')

# --- tieng Viet trong code ------------------------------------------------
print('\n--- dong code con tieng Viet ---')
n = 0
for m in re.finditer(r'<pre><code[^>]*>(.*?)</code></pre>', body, re.S):
    for ln in html.unescape(re.sub(r'<[^>]+>', '', m.group(1))).splitlines():
        if re.search(VN, ln, re.I):
            print('  ' + ln.strip()[:96])
            n += 1
print(f'  => {n} dong')

# --- so tu / thoi gian doc / div -----------------------------------------
b = re.sub(r'<pre>.*?</pre>', '', body, flags=re.S)
b = re.sub(r'<svg.*?</svg>', '', b, flags=re.S)
w = len(html.unescape(re.sub(r'<[^>]+>', ' ', b)).split())
hero = re.search(r'(\d+)\s*phút đọc', s)
opened = len(re.findall(r'<div\b', body)) - body.count('</div>')
print(f'\nso tu {w} · nen ghi {round(w / 170)} phut · hero dang ghi '
      f'{hero.group(1) if hero else "?"} phut · div con mo trong body: {opened}')
