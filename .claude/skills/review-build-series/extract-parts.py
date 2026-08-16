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

Va hai file gop:
    all-symbols.json    voi moi khoi code: ten file/tieu de, part nao, co phai
                        DINH NGHIA day du khong (co "export class/function/..."
                        hay chi la doan roi), va danh sach ten duoc export.
    references.json     NGUOC LAI: moi ten duoc DUNG (import noi bo, goi
                        this.x.method(), kieu tham so constructor) kem noi dung,
                        va co tim thay dinh nghia o dau trong series khong.

Day chi la buoc TRICH XUAT co hoc. Doc va phan doan "thieu code / mo ho / dut
mach" van la viec cua nguoi (hoac agent) lam theo SKILL.md — script nay khong
tu ket luan gi ca. Cu the: mot ten nam trong danh sach "khong tim thay dinh
nghia" CHUA CHAC la loi — co the la boilerplate co y bo qua, co the la file
sinh tu codegen. Script chi thu hep vung phai doc, khong thay viec doc.
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

# Prettier ngat dong the mo khi dong qua dai:
#     <span\n  class="code-filename"\n  >Ten file</span\n>
# nen KHONG duoc gia dinh '<span class="code-filename">' lien mach. Thieu cho nay
# thi khoi bi gan nham cho ten file phia tren va bao "thieu ten file" oan cho bai.
CODE_BLOCK_RE = re.compile(
    r'<span\s[^>]*?class="code-filename"[^>]*?>\s*([^<]+?)\s*</span'
    r'.*?<code class="language-(\w+)">(.*?)</code></pre>',
    re.S,
)
# Dem tong so khoi code that su co trong trang, de canh bao khi co khoi bi bo qua.
ANY_CODE_RE = re.compile(r'<pre><code class="language-')

# "export class Foo", "export function foo(", "export async function foo(",
# "export interface Foo", "export const FOO", "export type Foo" -- moi dang
# khai bao co the la "dinh nghia day du" cho mot ten. Thieu "async" o day tung
# lam sot ca `api()` (Part 2) lan `bootstrap()`/`transcode()` (Part 3) -- ca
# ba deu la "export async function", regex cu chi biet "export function".
EXPORT_RE = re.compile(
    r'export\s+(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:class|function|interface|const|type|enum)\s+([A-Za-z_$][\w$]*)'
)
# Khai bao khong co "export" van la dinh nghia -- doan trich trong bai hay luoc
# chu export di cho gon.
LOCAL_DECL_RE = re.compile(
    r'(?:^|\n)\s*(?:abstract\s+)?(?:async\s+)?(?:class|function|interface|const|type|enum)\s+([A-Za-z_$][\w$]*)'
)

# ---- ben DUNG ----------------------------------------------------------------
# CHI lay import co nguon la duong dan tuong doi (./ ../) hoac alias noi bo
# (@app/, @/, src/). Import tu node_modules (@nestjs/common, typeorm, node:crypto)
# khong bao gio duoc dinh nghia trong bai, nen dua vao chi tao nhieu:
# tren series NestJS that, khong loc = 104 ung vien, co loc = 8.
INTERNAL_IMPORT_RE = re.compile(
    r"import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['\"]((?:\.{1,2}/|@app/|@/|src/)[^'\"]*)['\"]"
)
# MOI import, ke ca tu node_modules — dung de biet kieu nao la CUA THU VIEN.
# Khong co buoc nay thi Repository, JwtService, Worker deu bi bao la "thieu
# dinh nghia", va tin hieu that chim trong nhieu.
ANY_IMPORT_RE = re.compile(r"import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]")
# this.media.findPlayable(...) -> ('media', 'findPlayable')
THIS_CALL_RE = re.compile(r'this\.([a-z][\w$]*)\.([a-zA-Z][\w$]*)\s*\(')
# this.dispatch(msg) — tu goi phuong thuc cua chinh minh. Dang nay tung lam sot
# `dispatch` va `processOne` khi chua bat.
THIS_SELF_CALL_RE = re.compile(r'this\.([a-z][\w$]*)\s*\((?!\s*\))')
# class RedisService extends Redis — neu lop cha den tu node_modules thi moi
# phuong thuc ke thua deu hop le, khong duoc bao thieu.
EXTENDS_RE = re.compile(r'class\s+([A-Z][\w$]*)\s+extends\s+([A-Z][\w$]*)')
# Vua bat tham so constructor vua bat thuoc tinh cua class, lay CA ten CA kieu:
#   private readonly media: MediaService     -> ('media', 'MediaService')
#   private readonly idle: Worker[] = []     -> ('idle',  'Worker')
#   @WebSocketServer() private readonly s!: Server  -> ('s', 'Server')
TYPED_MEMBER_RE = re.compile(
    r'(?:private|public|protected)\s+(?:readonly\s+)?([\w$]+)\s*!?\s*:\s*([A-Z][\w$]*)'
)
# Dinh nghia phuong thuc trong mot class: thut le, co the co async/private...,
# ten, ngoac, roi than ham. Dung de biet findPlayable() co bao gio duoc viet ra.
# Thut le co the la 0: cac khoi trong bai thuong la DOAN ROI cua mot class,
# viet sat le trai. Bat buoc thut le >= 2 tung lam ca chargeForJob, pushDelayed,
# logoutEverywhere bi bao thieu trong khi chung deu co than ham.
CONTROL_KW = r'(?!(?:if|for|while|switch|catch|return|typeof|await|new|do|else)\b)'
METHOD_DEF_RE = re.compile(
    r'(?:^|\n)[ \t]*(?:(?:private|public|protected|static|async|readonly)\s+)*'
    + CONTROL_KW +
    r'([a-z][\w$]*)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::[^{;=]+)?\{'
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
defined = set()        # moi ten co dinh nghia o dau do trong series
defined_methods = set()
uses = {}              # ten -> [{part, filename, kind, detail}]
# Kieu san co cua TypeScript/JS — khong phai thu bai phai viet ra.
BUILTIN_TYPES = {
    'Promise', 'Array', 'Map', 'Set', 'Record', 'Partial', 'Readonly', 'Date',
    'Error', 'Buffer', 'String', 'Number', 'Boolean', 'Object', 'RegExp',
}
external_types = set(BUILTIN_TYPES)  # ten den tu node_modules hoac san co
pending_calls = []      # loc sau, khi da biet het external_types ca series
inherits_from = {}      # lop -> lop cha, de bo qua phuong thuc ke thua tu thu vien
pending_injects = []
skipped_total = 0

part_paths = sorted(
    glob.glob(f'{SERIES_DIR}/part-*.html'),
    key=lambda p: int(re.search(r'part-(\d+)', p).group(1)),
)
if not part_paths:
    raise SystemExit(f'khong thay part-*.html nao trong {SERIES_DIR}')

for path in part_paths:
    part_num = int(re.search(r'part-(\d+)', path).group(1))
    src = open(path, encoding='utf-8').read()

    text = to_plain_text(src)
    open(f'{OUT_DIR}/part{part_num}.txt', 'w', encoding='utf-8').write(text)

    blocks = extract_blocks(src)
    open(f'{OUT_DIR}/part{part_num}-blocks.json', 'w', encoding='utf-8').write(
        json.dumps(blocks, ensure_ascii=False, indent=2)
    )

    # Khoi code khong co <span class="code-filename"> se bi regex bo qua HOAN
    # TOAN, khong bao loi. Phai noi ra, neu khong nguoi doc tuong minh da doc het.
    total_in_page = len(ANY_CODE_RE.findall(src))
    if total_in_page != len(blocks):
        skipped_total += total_in_page - len(blocks)
        print(
            f'  !! part {part_num}: trang co {total_in_page} khoi code nhung chi '
            f'trich duoc {len(blocks)} — {total_in_page - len(blocks)} khoi KHONG co '
            f'<span class="code-filename">, phai doc thang trong HTML.',
            file=sys.stderr,
        )

    for b in blocks:
        exported = EXPORT_RE.findall(b['code'])
        local = [n for n in LOCAL_DECL_RE.findall(b['code']) if n not in exported]
        defined.update(exported)
        defined.update(local)
        defined_methods.update(METHOD_DEF_RE.findall(b['code']))

        all_symbols.append({
            'part': part_num,
            'filename': b['filename'],
            'lang': b['lang'],
            'exports': exported,
            'local_declarations': local,
            # Khoi nay tu no dung duoc, hay chi la manh cua mot class o cho khac?
            'is_full_definition': bool(exported or local),
        })

        where = {'part': part_num, 'filename': b['filename']}

        # Kieu nao den tu node_modules -> khong bao gio ky vong bai tu viet ra.
        for m in ANY_IMPORT_RE.finditer(b['code']):
            if not re.match(r'\.{1,2}/|@app/|@/|src/', m.group(2)):
                for name in m.group(1).split(','):
                    name = name.strip().removeprefix('type ').split(' as ')[0].strip()
                    if name:
                        external_types.add(name)

        for m in INTERNAL_IMPORT_RE.finditer(b['code']):
            for name in m.group(1).split(','):
                name = name.strip().removeprefix('type ').split(' as ')[0].strip()
                if name:
                    uses.setdefault(name, []).append({**where, 'kind': 'import', 'detail': m.group(2)})

        # prop -> kieu, de biet this.<prop>.<method>() goi vao thu vien hay vao
        # code cua chinh bai.
        member_types = dict(TYPED_MEMBER_RE.findall(b['code']))
        for cls, base in EXTENDS_RE.findall(b['code']):
            inherits_from[cls] = base

        for prop, method in THIS_CALL_RE.findall(b['code']):
            owner = member_types.get(prop)
            pending_calls.append({**where, 'prop': prop, 'method': method, 'owner': owner})

        for method in THIS_SELF_CALL_RE.findall(b['code']):
            pending_calls.append({**where, 'prop': None, 'method': method, 'owner': '__self__'})

        for prop, cls in TYPED_MEMBER_RE.findall(b['code']):
            pending_injects.append({**where, 'type': cls})

# Chi bay gio moi loc duoc: mot kieu co the duoc import tu node_modules o part 3
# nhung dung o part 1 trong khoi khong co dong import nao.
def inherits_external(cls, seen=()):
    base = inherits_from.get(cls)
    if base is None or cls in seen:
        return False
    return base in external_types or inherits_external(base, seen + (cls,))


for c in pending_calls:
    if c['owner'] in external_types:
        continue  # this.jwt.signAsync() — jwt la JwtService cua @nestjs/jwt
    if c['owner'] and inherits_external(c['owner']):
        continue  # this.redis.xadd() — RedisService extends Redis cua ioredis
    if c['method'] in defined_methods:
        continue
    if c['owner'] == '__self__':
        kind, detail = 'self', f"this.{c['method']}() — tu goi, khong thay than ham"
        uses.setdefault(c['method'], []).append(
            {'part': c['part'], 'filename': c['filename'], 'kind': kind, 'detail': detail}
        )
        continue
    kind = 'method' if c['owner'] else 'method?'  # '?' = khong ro chu so huu
    detail = f"this.{c['prop']}.{c['method']}()"
    if c['owner']:
        detail += f" — {c['prop']}: {c['owner']}"
    uses.setdefault(c['method'], []).append(
        {'part': c['part'], 'filename': c['filename'], 'kind': kind, 'detail': detail}
    )

for i in pending_injects:
    if i['type'] in external_types:
        continue
    uses.setdefault(i['type'], []).append(
        {'part': i['part'], 'filename': i['filename'], 'kind': 'inject', 'detail': 'kieu cua thanh vien class'}
    )

references = []
for name, places in sorted(uses.items()):
    found = name in defined or name in defined_methods
    references.append({
        'name': name,
        'defined_somewhere': found,
        'used_at': places,
    })

open(f'{OUT_DIR}/all-symbols.json', 'w', encoding='utf-8').write(
    json.dumps(all_symbols, ensure_ascii=False, indent=2)
)
open(f'{OUT_DIR}/references.json', 'w', encoding='utf-8').write(
    json.dumps(references, ensure_ascii=False, indent=2)
)

dangling = [r for r in references if not r['defined_somewhere']]

print(f'Da trich {len(part_paths)} part vao {OUT_DIR}/')
print(f'Tong {len(all_symbols)} khoi code, {len(defined)} ten co dinh nghia, '
      f'{len(defined_methods)} phuong thuc co than ham.')
if skipped_total:
    print(f'CANH BAO: {skipped_total} khoi code bi bo qua vi khong co ten file — xem stderr.')
print(f'{len(uses)} ten duoc DUNG (import noi bo / this.x.y() / inject), '
      f'trong do {len(dangling)} chua thay dinh nghia o dau:')
for r in dangling[:40]:
    first = r['used_at'][0]
    print(f"  {r['name']:26s} part {first['part']}  {first['filename'][:44]}  [{first['kind']}]")
if len(dangling) > 40:
    print(f'  ... con {len(dangling) - 40} ten nua, xem references.json')
print()
print('Danh sach tren la VUNG CAN DOC, khong phai danh sach loi. Boilerplate bo qua')
print('co y va file sinh tu codegen deu roi vao day. Buoc tiep theo la DOC -- xem SKILL.md.')
