# -*- coding: utf-8 -*-
"""패러프레이즈 표의 각 칸이 한 줄에 들어가는지 검사한다.
칸마다 서로 다른 baseline 이 두 개 이상이면 줄바꿈이 일어난 것."""
import sys, pymupdf
doc = pymupdf.open(sys.argv[1] if len(sys.argv) > 1 else "book.pdf")
bad = 0
for pi in range(doc.page_count):
    pg = doc[pi]
    hits = pg.search_for("같은 뜻으로 바꾸어 쓰기")
    if not hits: continue
    top, mid = hits[0].y1, hits[0].x0 - 6
    bot = min([b.y0 for b in pg.search_for("보기") if b.y0 > top] or [pg.rect.height])
    clip = pymupdf.Rect(0, top, pg.rect.width, bot)
    cols = {"원문": [], "바꾸어 쓰기": []}
    for blk in pg.get_text("dict", clip=clip)["blocks"]:
        for ln in blk.get("lines", []):
            for sp in ln["spans"]:
                if not sp["text"].strip(): continue
                cols["원문" if sp["bbox"][0] < mid else "바꾸어 쓰기"].append(
                    (round(sp["bbox"][3], 1), sp["bbox"][0], sp["text"]))
    for name, spans in cols.items():
        ys = sorted({y for y, _, _ in spans})
        # baseline 이 1pt 이내면 같은 줄
        rows = []
        for y in ys:
            if rows and y - rows[-1] < 6: continue
            rows.append(y)
        if len(rows) > 5:
            bad += 1
            extra = len(rows) - 5
            print(f"p{pi+1:>2}  {name} 칸이 {extra}줄 넘침 (줄 {len(rows)} / 문항 5)")
            for y in rows:
                line = " ".join(t for yy, x, t in sorted(spans, key=lambda s: s[1]) if abs(yy - y) < 6)
                print(f"        {line[:84]}")
print("── 패러프레이즈 전 칸 한 줄" if not bad else f"── 넘치는 칸 {bad}개")
sys.exit(1 if bad else 0)
