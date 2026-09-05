"""학생용 PDF에 문항별 정답을 붉게 얹어 교사용 PDF를 만든다.

판면은 건드리지 않는다 — 완성된 PDF 위에 오버레이만 합성하므로 면수·조판이 그대로다.
정답은 각 면 하단(바닥글 위 여백)에 얹는다.
"""
import os, re, sys, io
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLFont
from reportlab.lib.colors import Color
from pypdf import PdfReader, PdfWriter
from extract_answers import parse

S = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(S, 'rg2', 'assets', 'fonts')
pdfmetrics.registerFont(RLFont('KR', os.path.join(FONTS, 'NotoSansKR-400.ttf')))
pdfmetrics.registerFont(RLFont('KRB', os.path.join(FONTS, 'NotoSansKR-700.ttf')))

A4 = (595.276, 841.890)
RED = Color(0.78, 0.13, 0.13)
RED_BG = Color(0.99, 0.95, 0.94)

# 번들 폰트에 없는 기호는 읽을 수 있는 형태로 바꾼다
SUBST = {**{chr(0x2460 + i): f'({i+1})' for i in range(10)},
         **{chr(0x24D0 + i): f'({chr(97+i)})' for i in range(26)},
         '→': '>', '△': '^', '○': 'O', '□': '[]', '✓': 'v', '✕': 'x',
         '⇒': '>', '–': '-', '‘': "'", '’': "'", '“': '"', '”': '"'}
_CMAP = None
def safe(s):
    global _CMAP
    if _CMAP is None:
        from fontTools.ttLib import TTFont as FT
        _CMAP = set(FT(os.path.join(FONTS, 'NotoSansKR-400.ttf')).getBestCmap())
    out = []
    for ch in s:
        ch = SUBST.get(ch, ch)
        out.append(ch if all(ord(c) in _CMAP for c in ch) else ' ')
    return ''.join(out)

def wrap(text, font, size, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width:
            cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def stamp(lines, width=A4[0]):
    """면 하단에 붉은 정답 띠를 그린 1면짜리 오버레이 PDF를 만든다."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    pad, size, lead = 34, 6.6, 8.2
    inner = A4[0] - 2 * pad - 56
    body = []
    for ln in lines:
        body += wrap(safe(ln), 'KR', size, inner)
    body = body[:4]                                    # 4줄까지만
    h = 10 + lead * len(body)
    y0 = 52                                            # 바닥글 위
    c.setFillColor(RED_BG); c.setStrokeColor(RED); c.setLineWidth(0.6)
    c.roundRect(pad, y0, A4[0] - 2 * pad, h, 3, stroke=1, fill=1)
    c.setFillColor(RED); c.setFont('KRB', size)
    c.drawString(pad + 8, y0 + h - 9, safe('교사용 정답'))
    c.setFont('KR', size)
    for i, ln in enumerate(body):
        c.drawString(pad + 56, y0 + h - 9 - i * lead, ln)
    c.save(); buf.seek(0)
    return PdfReader(buf).pages[0]

def build(book, out_path):
    units = sorted(f for f in os.listdir(f'{S}/{book}/units') if re.fullmatch(r'unit\d+\.js', f))
    reader = PdfReader(f'{S}/{book}/work/book.pdf')
    writer = PdfWriter()
    # 절대 면번호 → 정답 줄
    page_ans, abs_pg = {}, 0
    for f in units:
        info = parse(f'{S}/{book}/units/{f}')
        span = 5 if info['short'] else 10
        for pg, lines in info['pages'].items():
            page_ans[abs_pg + pg] = lines
        abs_pg += span
    for i, page in enumerate(reader.pages, start=1):
        if i in page_ans:
            page.merge_page(stamp(page_ans[i]))
        writer.add_page(page)
    with open(out_path, 'wb') as fp:
        writer.write(fp)
    return len(reader.pages), len(page_ans)

if __name__ == '__main__':
    for book, n in [('rg1', 1), ('rg2', 2), ('rg3', 3), ('rg4', 4)]:
        out = f'{S}/out/옳은독해_READING_GRAPHY_{n}권_교사용.pdf'
        pages, stamped = build(book, out)
        print(f'{n}권: {pages}면, 정답 표시 {stamped}면 → {os.path.basename(out)}')
