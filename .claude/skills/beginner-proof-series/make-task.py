#!/usr/bin/env python3
"""
Sinh (hoac lam moi) task.md — checklist chi tiet cho ca series.

    python3 make-task.py <thu-muc-series>            # sinh / lam moi task.md
    python3 make-task.py <thu-muc-series> --finish   # xong het -> don sach, chi chua stub

Nguoi moi vao viec chi can doc task.md la biet phai lam gi, khong can doc lai
lich su hoi thoai hay tu kiem tra tung bai.

QUAN TRONG — vi sao file nay khong the "noi sai":
Cac o duoc TICH TU DONG deu suy ra tu hien trang repo moi lan chay lai script,
chu khong phai ai do tich tay roi quen cap nhat. Chay lai la dong bo lai.
Nhung co nhung viec may KHONG kiem duoc — nhu "da doc het bai voi tam the
nguoi moi chua" — nen chung nam rieng trong muc "chi con nguoi biet", va o do
tich tay la hop le. Dung tron hai loai vao nhau.
"""
import html
import json
import os
import re
import subprocess
import sys

if not 2 <= len(sys.argv) <= 3:
    raise SystemExit('dung: make-task.py <thu-muc-series> [--finish]')
SERIES = sys.argv[1].rstrip('/')
FINISH = '--finish' in sys.argv
HERE = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(f'{SERIES}/config.json', encoding='utf-8'))
LDIR, VDIR, EDIR = f'{SERIES}/lessons', cfg['lessonDirVi'], cfg['lessonDirEn']
TASK = 'task.md'

STUB = """# task.md

Chua co viec nao dang mo.

File nay la noi liet ke cong viec chi tiet cho mot series dang duoc sua va dich.
Khi bat dau mot series moi, sinh lai bang:

```bash
D=.claude/skills/beginner-proof-series
python3 $D/make-task.py $D/series/<series>
```

Sinh xong, nguoi lam chi can doc file nay tu tren xuong. Xong het thi chay lai
voi `--finish` de don ve trang thai nay.
"""

# ---------------------------------------------------------------- hien trang
hub_vi = open(cfg['hubVi'], encoding='utf-8').read()
order = []
for m in re.finditer(r'<(?:a|span)\s+[^>]*?(?:href="\.?/?([a-z0-9-]+)")?[^>]*?class="[^"]*lesson-item', hub_vi):
    slug = m.group(1)
    win = hub_vi[m.end() : m.end() + 400]
    num = re.search(r'class="lesson-number"[^>]*>\s*(\d+)', win) or re.search(r'Bài\s+(\d+)\s*:', win)
    if slug and num:
        title = re.search(r'<h3 class="lesson-title">(.*?)</h3>', win, re.S)
        if title:
            t = html.unescape(' '.join(re.sub(r'<[^>]+>', '', title.group(1)).split()))
            # Tieu de tren hub da co san tien to "Bai N:" — bo di de khong lap
            t = re.sub(r'^(Bài|Lesson)\s+\d+\s*:\s*', '', t)
        else:
            t = slug
        order.append((int(num.group(1)), slug, t))
order.sort()

# Giong next-lesson.py va build-hub-en.py: mot trang EN co the TON TAI ma van la
# stub "coming soon" (~50 tu). Neu chi hoi os.path.exists() thi task.md bao
# "12/12 xong" trong khi khong bai nao duoc dich — day la thu file nay sinh ra de
# NGUOI KHAC tin, nen no sai thi ca quy trinh ban giao sai theo.
STUB_MAX_WORDS = 150


def is_real_translation(path):
    if not os.path.exists(path):
        return False
    src = open(path, encoding='utf-8').read()
    i, j = src.find('class="article-body"'), src.find('</main>')
    if i < 0 or j < 0:
        return True
    body = re.sub(r'<(script|style|svg|pre)\b.*?</\1>', ' ', src[i:j], flags=re.S)
    return len(re.sub(r'<[^>]+>', ' ', body).split()) > STUB_MAX_WORDS


done = [(n, s, t) for n, s, t in order if is_real_translation(f'{EDIR}/{s}.html')]
todo = [(n, s, t) for n, s, t in order if not is_real_translation(f'{EDIR}/{s}.html')]

verify = subprocess.run(
    [sys.executable, f'{HERE}/verify-series.py', SERIES], capture_output=True, text=True
)
green = verify.returncode == 0

if FINISH:
    if todo:
        raise SystemExit(f'chua xong: con {len(todo)} bai chua co ban EN — khong don duoc')
    if not green:
        raise SystemExit('verify-series.py dang DO — sua cho xanh roi moi don task.md')
    ow = f'{HERE}/open-work.md'
    if os.path.exists(ow) and open(ow, encoding='utf-8').read().strip():
        raise SystemExit(f'con viec o cap site trong {ow} — xu ly hoac xoa het roi moi don duoc')
    open(TASK, 'w', encoding='utf-8').write(STUB)
    print(f'da don {TASK} ve stub ({len(done)} bai hoan tat, checker xanh)')
    sys.exit(0)

tick = lambda ok: '[x]' if ok else '[ ]'


def machine_state(slug):
    """Nhung gi may kiem duoc cho mot bai."""
    en = f'{EDIR}/{slug}.html'
    return [
        (f'ban EN ton tai va KHONG phai stub (`{en}`)', is_real_translation(en)),
        (f'co template de dung lai (`{slug}.body-en.html` + `.meta-en.json`)',
         os.path.exists(f'{LDIR}/{slug}.body-en.html') and os.path.exists(f'{LDIR}/{slug}.meta-en.json')),
    ]


lines = [
    f'# task.md — {cfg["name"]}',
    '',
    '> File nay do `make-task.py` sinh ra tu hien trang repo. **Dung tich tay cac o',
    '> trong muc "May kiem duoc"** — chay lai script la chung tu dong dong bo:',
    '>',
    '> ```bash',
    '> D=.claude/skills/beginner-proof-series',
    f'> python3 $D/make-task.py {SERIES}',
    '> ```',
    '',
    '## Bat dau tu day',
    '',
    'Doc `.claude/skills/beginner-proof-series/SKILL.md` truoc — no giai thich',
    '_cach_ lam. File nay chi noi _con lai nhung gi_.',   # dung _ de dau ra sach theo prettier
    '',
    'Hai lenh cho biet trang thai bat ky luc nao:',
    '',
    '```bash',
    'D=.claude/skills/beginner-proof-series',
    f'python3 $D/next-lesson.py {cfg["hubVi"]}',
    f'python3 $D/verify-series.py {SERIES}',
    '```',
    '',
    f'**Tien do: {len(done)}/{len(order)} bai da co ban EN.** '
    + ('Checker dang **xanh**.' if green else 'Checker dang **DO** — xem muc "Viec phai sua ngay" ben duoi.'),
    '',
]

# Viec o cap toan site, ghi tay trong open-work.md. Chen nguyen van vao day de no
# song sot qua moi lan sinh lai — day la cho duy nhat trong task.md duoc viet tay.
OPEN = f'{HERE}/open-work.md'
if os.path.exists(OPEN):
    body = open(OPEN, encoding='utf-8').read().strip()
    if body:
        lines += [body, '']

if not green:
    lines += [
        '## Viec phai sua ngay (checker dang do)',
        '',
        'Chua nen viet bai moi khi phan nay chua sach:',
        '',
        '```',
        verify.stdout.strip().splitlines()[-1] if verify.stdout.strip() else '(khong co output)',
        '```',
        '',
        'Chay `verify-series.py` de xem day du.',
        '',
    ]

# ---------------------------------------------------------------- bai con lai
lines += ['## Cac bai con lai', '']
if not todo:
    lines += ['Khong con bai nao. Neu checker xanh, chay `make-task.py --finish` de don file nay.', '']
for n, slug, title in todo:
    lines += [
        f'### Bai {n}: {title}',
        '',
        f'- VI: `{VDIR}/{slug}.html`',
        f'- EN can tao: `{EDIR}/{slug}.html`',
        '',
        '**Chi con nguoi biet** — tich tay khi that su da lam:',
        '',
        '- [ ] Doc HET bai tu dau den cuoi, khong nhay, voi tam the nguoi moi hoan toan',
        '- [ ] Ghi ra danh sach phat hien kem vi tri, TRUOC khi sua',
        '- [ ] Doi chieu muc tom tat voi noi dung that (bai co hua gi ma khong giao?)',
        '- [ ] Kiem cac khang dinh chay duoc: chay code, doi chieu output in trong bai',
        '- [ ] Sua ban tieng Viet o do sau da thong nhat voi nguoi dung',
        '- [ ] Dich sang tieng Anh (viet `.body-en.html`, khong sua HTML truc tiep)',
        '- [ ] Bao lai nguoi dung: tim thay gi, sua gi, co y de lai gi',
        '',
        '**May kiem duoc** — chay `verify-series.py`, dung tich tay:',
        '',
    ]
    for label, ok in machine_state(slug):
        lines.append(f'- {tick(ok)} {label}')
    lines += [
        '- [ ] 13 bat bien deu dat (`verify-series.py` xanh)',
        '- [ ] Hub da dung lai (`build-hub-en.py`) — the bai phai tro sang ban EN',
        '- [ ] Da commit, va da ghi vao commit nhung gi co y de lai',
        '',
    ]

# ---------------------------------------------------------------- bai da xong
lines += ['## Cac bai da xong', '']
if done:
    lines.append('Khong can doc lai nhung bai nay — `verify-series.py` giu chung dung.')
    lines.append('')
    for n, slug, title in done:
        lines.append(f'- [x] Bai {n}: {title}')
    lines.append('')

lines += [
    '## Viec o cap series (lam mot lan)',
    '',
    f'- {tick(is_real_translation(cfg["hubEn"]))} Hub co ban tieng Anh (`{cfg["hubEn"]}`)',
    f'- {tick("hreflang" in hub_vi)} Hub tieng Viet co `hreflang` va link locale hien thi',
    '- [ ] Chrome thong nhat giua cac bai EN (checker ep theo `config.json`)',
    '',
    '## Khi xong het',
    '',
    '```bash',
    f'python3 .claude/skills/beginner-proof-series/make-task.py {SERIES} --finish',
    '```',
    '',
    'Lenh nay chi chay khi moi bai da co ban EN **va** checker xanh. No don noi',
    'dung file, giu lai file cho lan lam viec sau.',
    '',
]

open(TASK, 'w', encoding='utf-8').write('\n'.join(lines))
print(f'da ghi {TASK} — {len(done)}/{len(order)} xong, {len(todo)} con lai, checker {"xanh" if green else "DO"}')
