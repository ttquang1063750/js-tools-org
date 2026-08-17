#!/usr/bin/env python3
"""
Quet thu tu thu HAI: file duoc `import` truoc khi bai viet ra no.

Khac voi scan-call-order.py (doi chieu loi goi HTTP vs cho dinh nghia route),
script nay bat mot loai loi khac han va scanner kia khong the thay:

    Part 2 muc 2 dua ra auth.module.ts co `import { AuthController } from
    './auth.controller'` — nhung file auth.controller.ts mai muc 3.5 moi duoc
    viet, cach do 43.000 ky tu. Nguoi doc lam dung thu tu se co mot file tro
    toi file khong ton tai.

Ban than viec import truoc KHONG phai loi: gioi thieu module roi moi den tung
manh la loi viet hop le. No chi thanh loi khi giua hai moc do bai BAO NGUOI DOC
CHAY thu gi day — luc ay chuong trinh gay that.

Nen script bao hai muc: danh sach import-truoc (de tham khao), va rieng nhung
truong hop CO lenh chay ke giua (phai sua).

Dung:
    python3 .claude/skills/review-build-series/scan-import-order.py blog/build/<du-an>
"""
import html
import re

# CHU Y: phai chiu duoc <span class="code-filename"\n  > — prettier ngat dong the
# nay o nhung khoi co ten dai. Regex cung tung bo sot 14/83 khoi cua Part 2.
import sys
from pathlib import Path

DIR = Path(sys.argv[1] if len(sys.argv) > 1 else 'blog/build/nestjs-media-platform')
PARTS = sorted(int(p.stem.split('-')[1]) for p in DIR.glob('part-*.html'))

# Chi tinh lenh chay THAT trong khoi Terminal. Cung mot chuoi "npm run start:dev"
# nam trong noi dung package.json hay docker-compose.yml la KHAI BAO, khong phai
# lenh bai bao go — dem ca hai se cho toan bao dong gia.
# CHI tinh lenh khoi dong ung dung Nest hoac bien dich ca cay. `migration:run`
# KHONG tinh: no chay qua data-source.ts doc lap, khong nap module nao cua app —
# tinh no vao sinh ra bao dong gia (da gap that o Part 2).
RUN = r'(npm run start:dev|npm run start:worker|node dist/|npm run build|npx tsc)'

defined, blocks, src = {}, [], {}
for p in PARTS:
    src[p] = (DIR / f'part-{p}.html').read_text(encoding='utf-8')
    for m in re.finditer(
        r'<span class="code-filename"\s*>([^<]*)</span\s*>.*?<pre><code[^>]*>(.*?)</code></pre>',
        src[p], re.S,
    ):
        raw_name = m.group(1)
        fn = raw_name.split(' —')[0].strip()
        blocks.append((p, m.start(), fn, html.unescape(m.group(2))))
        # Mot khoi ghi "src/worker/job.runner.ts — trich doan processOne()" KHONG
        # phai la file day du. Coi no la dinh nghia thi bo do dung cai loi can bat:
        # worker.module.ts khai providers: [JobRunner] roi bai bao chay, trong khi
        # class day du mai muc sau moi co.
        partial = re.search(r'trích đoạn|trích|thêm vào|phần |bản đầu tiên|— trích', raw_name)
        if '/' in fn and fn.endswith(('.ts', '.js')) and not partial:
            defined.setdefault(fn, (p, m.start()))

forward, dangerous = [], []
for p, pos, fn, code in blocks:
    if '/' not in fn:
        continue
    base = '/'.join(fn.split('/')[:-1])
    for im in re.finditer(r"from '(\./[^']+)'", code):
        cand = f'{base}/{im.group(1)[2:]}.ts'
        if cand not in defined or defined[cand] <= (p, pos):
            continue
        dp, dpos = defined[cand]
        runs = [
            m2.start() + pos
            for m2 in re.finditer(RUN, src[p][pos:dpos])
            if 'code-filename">Terminal' in src[p][max(0, m2.start() + pos - 1500) : m2.start() + pos]
        ]
        row = (p, pos, fn, cand, dp, dpos, len(runs))
        (dangerous if runs else forward).append(row)

print(f'{len(blocks)} khoi code, {len(defined)} file duoc viet ra\n')
print('=' * 78)
print(f'PHAI SUA — import truoc, VA co lenh chay ke giua: {len(dangerous)}')
print('=' * 78)
for p, pos, fn, cand, dp, dpos, n in sorted(dangerous):
    print(f'  Part {p} @{pos:6} {fn}')
    print(f'      import "{cand}" — mai Part {dp} @{dpos} moi co, ma co {n} lenh chay ke giua')
if not dangerous:
    print('  (khong co)')

print()
print(f'Chi de tham khao — import truoc nhung khong ai bao chay giua chung: {len(forward)}')
for p, pos, fn, cand, dp, dpos, _ in sorted(forward):
    print(f'  Part {p} {fn} -> {cand} (cach {dpos - pos:,} ky tu)')
