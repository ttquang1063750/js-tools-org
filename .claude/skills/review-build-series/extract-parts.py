#!/usr/bin/env python3
"""
Trich van ban thuan tuy + danh sach khoi code tu cac file part-N.html cua mot
series "code thuc chien" (blog/build/<du-an>/), de doc toan van va doi chieu
ky hieu ma khong phai tu tay strip HTML moi lan.

    python3 .claude/skills/review-build-series/extract-parts.py \
        blog/build/nestjs-media-platform out/

Sinh trong thu muc dich, cho MOI part-N.html:
    partN.txt           van ban thuan tuy (bo the HTML/SVG), doc de nhu doc bao
    partN-blocks.json    [{filename, lang, code}, ...] theo dung thu tu xuat hien

Va mot file gop:
    all-symbols.json    voi moi khoi code: ten file/tieu de, part nao, co phai
                         DINH NGHIA day du khong (doan co "export class/function/
                         interface" hay chi la doan roi/fragment), va danh sach
                         cac ten duoc "export" trong khoi do (de doi chieu xem
                         co bao gio dinh nghia o dau khac khong).

Day chi la buoc TRICH XUAT co hoc. Doc va phan doan "thieu code / mo ho / dut
mach" van la viec cua nguoi (hoac agent) lam theo SKILL.md — script nay khong
tu ket luan gi ca.
"""
import glob
import html
import json
import os
import re
import sys

if len(sys.argv) != 3:
    raise SystemExit('dung: extract-parts.py <thu-muc-series> <thu-muc-dich>')

SERIES_DIR, OUT_DIR = sys.argv[1].rstrip('/'), sys.argv[2].rstrip('/')
os.makedirs(OUT_DIR, exist_ok=True)

CODE_BLOCK_RE = re.compile(
    r'<span class="code-filename">([^<]+)</span>.*?<code class="language-(\w+)">(.*?)</code></pre>',
    re.S,
)
# "export class Foo", "export function foo(", "export interface Foo",
# "export const FOO", "export type Foo" -- moi dang khai bao co the la
# "dinh nghia day du" cho mot ten.
EXPORT_RE = re.compile(
    r'export\s+(?:default\s+)?(?:abstract\s+)?(?:class|function|interface|const|type|enum)\s+([A-Za-z_$][\w$]*)'
)


def to_plain_text(html_src):
    """HTML -> van ban tho, giu nguyen thu tu doc. Bo script/style/svg rieng vi
    hay lam nhieu (toa do SVG trong ra nhu so, entity trong <script> lam vo cau)."""
    i = html_src.find('<main')
    j = html_src.find('</main>')
    body = html_src[i:j] if i >= 0 and j >= 0 else html_src
    body = re.sub(r'<(script|style|svg)\b.*?</\1>', ' [SVG omitted] ', body, flags=re.S)
    text = re.sub(r'<[^>]+>', ' ', body)
    text = html.unescape(text)
    # gon dong trong nhung giu xuong dong doan de van doc duoc nhu bai that
    lines = [' '.join(l.split()) for l in text.split('\n')]
    return '\n'.join(l for l in lines if l)


def extract_blocks(html_src):
    out = []
    for m in CODE_BLOCK_RE.finditer(html_src):
        filename, lang, raw_code = m.group(1).strip(), m.group(2), m.group(3)
        code = html.unescape(raw_code)
        out.append({'filename': filename, 'lang': lang, 'code': code})
    return out


all_symbols = []
part_paths = sorted(
    glob.glob(f'{SERIES_DIR}/part-*.html'),
    key=lambda p: int(re.search(r'part-(\d+)', p).group(1)),
)
if not part_paths:
    raise SystemExit(f'khong thay part-*.html nao trong {SERIES_DIR}')

for path in part_paths:
    part_num = re.search(r'part-(\d+)', path).group(1)
    src = open(path, encoding='utf-8').read()

    text = to_plain_text(src)
    open(f'{OUT_DIR}/part{part_num}.txt', 'w', encoding='utf-8').write(text)

    blocks = extract_blocks(src)
    open(f'{OUT_DIR}/part{part_num}-blocks.json', 'w', encoding='utf-8').write(
        json.dumps(blocks, ensure_ascii=False, indent=2)
    )

    for b in blocks:
        exported = EXPORT_RE.findall(b['code'])
        all_symbols.append({
            'part': int(part_num),
            'filename': b['filename'],
            'lang': b['lang'],
            'exports': exported,
            'is_typescript_like': b['lang'] in ('typescript', 'ts', 'tsx'),
        })

open(f'{OUT_DIR}/all-symbols.json', 'w', encoding='utf-8').write(
    json.dumps(all_symbols, ensure_ascii=False, indent=2)
)

print(f'Da trich {len(part_paths)} part vao {OUT_DIR}/')
print(f'Tong {len(all_symbols)} khoi code, {sum(len(s["exports"]) for s in all_symbols)} luot export ten.')
print('Buoc tiep theo la DOC (khong phai chay them script) -- xem SKILL.md.')
