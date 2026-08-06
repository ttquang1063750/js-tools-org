#!/usr/bin/env python3
"""
Xac dinh bai ke tiep can beginner-proof, suy ra tu HIEN TRANG REPO.

    python3 .claude/skills/beginner-proof-series/next-lesson.py blog/aie/aie-programming-series.html

Tin hieu hoan thanh: mot vong lam viec chi ket thuc khi bai co CA hai locale, nen
"ban EN da ton tai" == "bai da xong". Suy tu file tren dia dang tin hon mot file
trang thai rieng, vi file trang thai se lech ngay khi co ai sua tay ngoai skill.

Thu tu bai lay tu HUB, khong lay tu ten file — thu tu alphabet cua slug khong
lien quan gi den thu tu syllabus.
"""
import os
import re
import sys


def lessons_from_hub(hub_path):
    """Tra ve [(so_bai, slug)] theo thu tu syllabus."""
    src = open(hub_path, encoding='utf-8').read()
    out, seen = [], set()
    # Bai da mo khoa la <a href>; bai chua viet co the la <span> hoac <div> bi khoa.
    # Bat ca hai, roi tim nhan "Bai N:" trong cua so ngay sau the mo.
    for m in re.finditer(r'<(?:a|span|div)\s+[^>]*?(?:href="\.?/?([a-z0-9-]+)")?[^>]*?class="[^"]*lesson-item', src):
        slug = m.group(1)
        win = src[m.end() : m.end() + 400]
        # Hai kieu danh so gap trong repo nay, thu tu uu tien:
        #   1. <div class="lesson-number">01</div>  — dung o sysdesign
        #   2. <h3 ...>Bai 1: ...</h3>              — dung o aie
        num = re.search(r'class="lesson-number"[^>]*>\s*(\d+)', win) or re.search(r'Bài\s+(\d+)\s*:', win)
        if not num:
            continue
        n = int(num.group(1))
        # Bai bi khoa khong co href — van dem vao syllabus de tong so dung.
        key = slug or f'#locked-{n}'
        if key in seen:
            continue
        seen.add(key)
        out.append((n, slug))
    out.sort(key=lambda p: p[0])
    return out


def main():
    if len(sys.argv) != 2:
        raise SystemExit('dung: next-lesson.py <duong-dan-hub.html>')
    hub = sys.argv[1]
    base = os.path.dirname(hub)
    order = lessons_from_hub(hub)
    if not order:
        raise SystemExit(
            'khong doc duoc bai nao tu hub. Kiem tra hub co dung class="lesson-item" '
            'va nhan "Bai N:" khong — neu series nay dung markup khac thi lay thu tu '
            'bang tay tu plan.md thay vi tin vao script nay.'
        )

    nxt = None
    done = 0
    broken = []   # hub tro toi file VI khong ton tai
    locked = 0    # bai chua viet, con bi khoa tren hub
    print(f'{len(order)} bai trong syllabus (thu tu lay tu {hub})\n')
    for n, slug in order:
        if slug is None:
            locked += 1
            print(f'  Bai {n:2}  (chua viet — bi khoa tren hub)')
            continue
        vi = os.path.join(base, slug + '.html')
        en = os.path.join(base, 'en', slug + '.html')
        if not os.path.exists(vi):
            broken.append((n, vi))
            print(f'  Bai {n:2}  {slug:35} THIEU ban VI — hub tro toi file khong ton tai')
            continue
        if os.path.exists(en):
            done += 1
            print(f'  Bai {n:2}  {slug:35} xong (co ca VI va EN)')
        else:
            if nxt is None:
                nxt = (n, vi, en)
            print(f'  Bai {n:2}  {slug:35} chua co EN')

    print(f'\nda xong {done}/{len(order)}' + (f' ({locked} bai chua viet)' if locked else ''))
    if nxt:
        print(f'==> bai ke tiep: Bai {nxt[0]}')
        print(f'    VI: {nxt[1]}')
        print(f'    EN can tao: {nxt[2]}')
    elif broken:
        # Khong duoc bao "xong" khi hub dang tro toi file khong ton tai — do la
        # link chet doc gia se bam vao, phai bao cao thay vi im lang.
        print('==> KHONG ket luan duoc: hub tro toi ' + str(len(broken)) + ' file VI khong ton tai:')
        for n, p in broken:
            print(f'    Bai {n}: {p}')
        raise SystemExit(1)
    else:
        print('==> moi bai da viet deu co du hai locale')


if __name__ == '__main__':
    main()
