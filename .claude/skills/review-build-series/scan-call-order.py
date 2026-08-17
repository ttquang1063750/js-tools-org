#!/usr/bin/env python3
"""
Quet thu tu: moi loi goi HTTP ma bai bao nguoi doc thuc hien, doi chieu voi vi tri
route tuong ung duoc dinh nghia (va vi tri module cua no duoc dang ky).

Y tuong: mot doc gia doc tuan tu Part 1 -> 4, tu tren xuong. Neu loi goi xuat hien
TRUOC cho dinh nghia route thi doc gia chac chan nhan 404.
"""
import html
import re
import sys
from pathlib import Path

DIR = Path(sys.argv[1] if len(sys.argv)>1 else 'blog/build/nestjs-media-platform')
PARTS = [1, 2, 3, 4]

METHODS = 'Get|Post|Put|Patch|Delete|All|Sse'


def blocks(src):
    """(vi_tri, ten_file, noi_dung) cho tung khoi code."""
    out = []
    for m in re.finditer(
        r'<div class="code-window">.*?<span class="code-filename">([^<]*)</span>'
        r'.*?<pre><code[^>]*>(.*?)</code></pre>',
        src, re.S,
    ):
        out.append((m.start(), m.group(1).strip(), html.unescape(m.group(2))))
    # khoi <pre> tran, khong co filename
    for m in re.finditer(r'<pre><code[^>]*>(.*?)</code></pre>', src, re.S):
        if not any(abs(m.start() - p) < 3000 and m.start() >= p for p, _, _ in out):
            out.append((m.start(), '(khong ten)', html.unescape(m.group(1))))
    return sorted(out)


def norm(p):
    p = p.strip().strip('/')
    p = re.sub(r':\w+', ':x', p)          # :id -> :x
    p = re.sub(r'\$\{[^}]*\}', ':x', p)   # ${jobId} -> :x
    p = re.sub(r'\b[0-9a-f]{8}-[0-9a-f-]{20,}\b', ':x', p)  # uuid -> :x
    p = re.sub(r'^\d+$', ':x', p)
    return p


routes = {}   # duong dan -> (part, pos, ten file)
calls = []    # (part, pos, phuong thuc, duong dan, ten file khoi)

for part in PARTS:
    src = (DIR / f'part-{part}.html').read_text(encoding='utf-8')
    for pos, fname, code in blocks(src):
        # ── dinh nghia route
        # @Controller('media') VA @Controller() deu tinh; base='' cho dang thu hai.
        ctrls = [(cm.start(), cm.group(1) or '')
                 for cm in re.finditer(r"@Controller\(\s*(?:'([^']*)')?\s*\)", code)]
        for rm in re.finditer(rf"@({METHODS})\(\s*(?:'([^']*)')?\s*\)", code):
            seg = rm.group(2) or ''
            base = ''
            for cpos, cbase in ctrls:          # @Controller gan nhat phia TREN
                if cpos < rm.start():
                    base = cbase
            full = norm('/'.join(x for x in (base, seg) if x))
            routes.setdefault(full, (part, pos, fname))
        # ── loi goi HTTP
        for um in re.finditer(r'(?:https?://)?(?:localhost|127\.0\.0\.1|media-forge\.local)(?::(\d+))?(/[^\s\'"`\\]*)', code):
            port, path = um.group(1), um.group(2)
            before = code[max(0, um.start() - 200):um.start()]
            mm = re.search(r'-X\s+(GET|POST|PUT|PATCH|DELETE)', before)
            method = mm.group(1) if mm else ('POST' if '-d ' in code[um.start():um.start() + 400] else 'GET')
            calls.append((part, pos, method, norm(path), fname, port))
        # ── frontend: api('/jobs/active') hoac fetch('/api/...')
        for fm in re.finditer(r"""(?:api|fetch)\(\s*[`'"]([^`'"]+)[`'"]""", code):
            p = fm.group(1)
            if p.startswith('/'):
                calls.append((part, pos, 'FE', norm(p), fname, 'fe'))

print(f'Tim thay {len(routes)} route, {len(calls)} loi goi HTTP\n')

def key(part, pos):
    return (part, pos)

bad, ok, unknown = [], [], []
for part, pos, method, path, fname, port in calls:
    # thu khop truc tiep, roi thu bo tien to /api (nginx/gateway)
    cand = [path, re.sub(r'^api/', '', path)]
    hit = next((routes[c] for c in cand if c in routes), None)
    if hit is None:
        unknown.append((part, pos, method, path, fname, port))
    elif key(hit[0], hit[1]) > key(part, pos):
        bad.append((part, pos, method, path, fname, hit))
    else:
        ok.append((part, pos, method, path, fname, hit))

print('=' * 78)
print(f'GOI TRUOC KHI ROUTE DUOC DINH NGHIA: {len(bad)}')
print('=' * 78)
for part, pos, method, path, fname, hit in sorted(bad):
    print(f'  Part {part} @ {pos:6}  {method:5} /{path}   [khoi: {fname}]')
    print(f'      route dinh nghia o Part {hit[0]} @ {hit[1]} ({hit[2]})  <-- SAU')
if not bad:
    print('  (khong co)')

print()
print(f'GOI SAU KHI DA DINH NGHIA (dung thu tu): {len(ok)}')
for part, pos, method, path, fname, hit in sorted(ok):
    print(f'  Part {part} @ {pos:6}  {method:5} /{path}  <- Part {hit[0]} @ {hit[1]}')

print()
print(f'KHONG TIM THAY ROUTE KHOP: {len(unknown)}  (can xem tay)')
for part, pos, method, path, fname, port in sorted(unknown):
    print(f'  Part {part} @ {pos:6}  {method:5} :{port} /{path}   [khoi: {fname}]')

# ─────────────────────────────────────────────────────────────────────────────
# Kiem tra thu hai: route co that KHONG DU. Module chua duoc dang ky vao
# AppModule thi Nest khong khoi tao controller -> van 404. Doi chieu ca hai moc.
# ─────────────────────────────────────────────────────────────────────────────
ctrl_pos, mod_of_ctrl, app_reg = {}, {}, {}
for part in PARTS:
    src = (DIR / f'part-{part}.html').read_text(encoding='utf-8')
    for pos, fname, code in blocks(src):
        for m in re.finditer(r'export class (\w*Controller)\b', code):
            ctrl_pos.setdefault(m.group(1), (part, pos, fname))
        for m in re.finditer(r'controllers:\s*\[([^\]]*)\]', code):
            for c in re.findall(r'\w+Controller', m.group(1)):
                mm = re.search(r'export class (\w*Module)\b', code)
                if mm:
                    mod_of_ctrl.setdefault(c, mm.group(1))
        if 'app.module' in fname.lower():
            im = re.search(r'imports:\s*\[(.*?)\n  \]', code, re.S)
            if im:
                for mn in re.findall(r'\w+Module', im.group(1)):
                    app_reg.setdefault(mn, (part, pos))

print()
print('=' * 78)
print('KIEM TRA 2 — module da duoc dang ky vao AppModule TRUOC loi goi chua?')
print('=' * 78)
problems = 0
for part, pos, method, path, fname, port in sorted(calls):
    hit = next((routes[c] for c in [path, re.sub(r'^api/', '', path)] if c in routes), None)
    if hit is None:
        continue
    # tim controller phuc vu duong dan nay: khop theo base cua path
    base = path.split('/')[0]
    cand = [c for c in ctrl_pos if c.lower().startswith(base.replace('-', '')[:6])]
    for c in cand:
        mod = mod_of_ctrl.get(c)
        if not mod or mod not in app_reg:
            continue
        rp, rpos = app_reg[mod]
        if (rp, rpos) > (part, pos):
            print(f'  Part {part} @ {pos:6} {method:5} /{path}')
            print(f'      {mod} chi duoc dang ky vao AppModule o Part {rp} @ {rpos}  <-- SAU')
            problems += 1
if not problems:
    print('  (khong co)')
print()
print('Module da thay dang ky:', {k: f'P{v[0]}@{v[1]}' for k, v in sorted(app_reg.items())})
