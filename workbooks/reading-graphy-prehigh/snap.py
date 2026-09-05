#!/usr/bin/env python3
"""면 → PNG.  python3 snap.py u01.pdf 1,2,3 outdir [dpi] [prefix]
   면 번호는 1부터.  'fig' 를 dpi 뒤에 주면 본문 삽화 영역만 잘라낸다.  예) snap.py u01.pdf 1,6,11 pv 150 fig"""
import sys, os, pymupdf
pdf, pages, out = sys.argv[1], sys.argv[2], sys.argv[3]
dpi = int(sys.argv[4]) if len(sys.argv) > 4 else 130
mode = sys.argv[5] if len(sys.argv) > 5 else "page"
os.makedirs(out, exist_ok=True)
d = pymupdf.open(pdf); base = os.path.splitext(os.path.basename(pdf))[0]
for p in pages.split(","):
    i = int(p) - 1
    clip = pymupdf.Rect(40, 650, 560, 835) if mode == "fig" else None
    fn = f"{out}/{base}_p{int(p):02d}{'_fig' if mode=='fig' else ''}.png"
    d[i].get_pixmap(dpi=dpi, clip=clip).save(fn); print(fn)
