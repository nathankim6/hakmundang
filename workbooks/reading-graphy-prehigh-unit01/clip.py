# -*- coding: utf-8 -*-
"""HTML 원본과 PDF 추출 텍스트를 대조해 잘려 나간 내용을 찾는다."""
import re, sys, html, pymupdf

src = open("book.html", encoding="utf-8").read()
src = re.sub(r"<style[\s\S]*?</style>", "", src)
src = re.sub(r"<svg[\s\S]*?</svg>", " ", src)

# .page 단위로 분리
parts = [x[x.index(">")+1:] for x in src.split('<div class="page')[1:]]
def plain(h):
    h = re.sub(r"<[^>]+>", " ", h)
    h = html.unescape(h)
    return re.sub(r"\s+", " ", h).strip()

doc = pymupdf.open("book.pdf")
assert len(parts) == doc.page_count, f"page mismatch {len(parts)} vs {doc.page_count}"

bad = 0
for i, p in enumerate(parts):
    want = plain(p)
    got  = re.sub(r"\s+", "", doc[i].get_text()).lower()
    toks = [t for t in re.split(r"\s+", want) if len(re.sub(r"[^\w가-힣]", "", t)) >= 2]
    miss = [t for t in toks if re.sub(r"\s+", "", t).lower() not in got]
    if miss:
        bad += 1
        print(f"p{i+1:>2}  잘림 {len(miss)}/{len(toks)} 토큰 누락")
        print("      " + " ".join(miss[:14]) + (" …" if len(miss) > 14 else ""))
print("── 잘린 면 없음" if not bad else f"── 잘린 면 {bad}개")
sys.exit(1 if bad else 0)
