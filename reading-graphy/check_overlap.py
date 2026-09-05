"""정답 띠가 놓일 자리에 원본 내용이 이미 있는지 검사한다."""
import os, re, subprocess, tempfile, sys
from PIL import Image
from extract_answers import parse

S = os.path.dirname(os.path.abspath(__file__))
DPI = 72                       # 1pt = 1px
STRIP_BOTTOM, STRIP_TOP = 52, 100      # PDF 좌표(아래에서)

def stamped_pages(book):
    units = sorted(f for f in os.listdir(f'{S}/{book}/units') if re.fullmatch(r'unit\d+\.js', f))
    pages, abs_pg = set(), 0
    for f in units:
        info = parse(f'{S}/{book}/units/{f}')
        for pg in info['pages']:
            pages.add(abs_pg + pg)
        abs_pg += 5 if info['short'] else 10
    return sorted(pages)

def check(book):
    pages = stamped_pages(book)
    pdf = f'{S}/{book}/work/book.pdf'
    hits = []
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['pdftoppm','-r',str(DPI),'-f','1','-l',str(max(pages)),
                        '-gray','-png',pdf,os.path.join(td,'p')], check=True)
        for pg in pages:
            fp = next((q for q in (os.path.join(td, f'p-{pg:0{w}d}.png') for w in (3,2,1)) if os.path.exists(q)), None)
            if not fp: continue
            im = Image.open(fp).convert('L'); w, h = im.size
            px = im.load()
            y_lo, y_hi = h - STRIP_TOP, h - STRIP_BOTTOM      # 이미지 좌표
            ink = 0
            for y in range(max(0, y_lo), min(h, y_hi)):
                for x in range(60, w - 60, 2):                 # 페이지 테두리 제외
                    if px[x, y] < 200: ink += 1
            if ink > 60:
                hits.append((pg, ink))
    return pages, hits

for book in ['rg1','rg2','rg3','rg4']:
    pages, hits = check(book)
    print(f'{book}: 표시 {len(pages)}면, 겹침 의심 {len(hits)}면', hits[:6])
