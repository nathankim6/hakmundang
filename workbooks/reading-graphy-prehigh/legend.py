# -*- coding: utf-8 -*-
"""Check Up 범례가 한 줄에 들어가고 본문 폭을 넘지 않는지 검사한다."""
import sys, pymupdf
RIGHT = 552.0          # 본문 우측 한계(pt)
doc = pymupdf.open(sys.argv[1] if len(sys.argv) > 1 else "u01.pdf")
bad = 0
for pi in range(doc.page_count):
    pg = doc[pi]
    if not pg.search_for("유형 고르기"): continue
    for anchor, tag in (("선지마다 유형 하나에 ○", "문항 1"), ("유형에 ○ · 근거 번호 쓰기", "문항 2")):
        h = pg.search_for(anchor)
        if not h:
            print(f"p{pi+1:>2} {tag} 범례 못 찾음"); bad += 1; continue
        y0 = h[0].y0
        # 오른쪽 세로 LESSON 탭은 본문이 아니므로 제외한다
        band = pymupdf.Rect(0, y0 - 2, RIGHT + 6, y0 + 13)
        ys, xr = set(), []
        for b in pg.get_text("dict", clip=band)["blocks"]:
            for ln in b.get("lines", []):
                for sp in ln["spans"]:
                    if sp["text"].strip():
                        ys.add(round(sp["bbox"][3], 1)); xr.append(sp["bbox"][2])
        rows = []
        for v in sorted(ys):
            if rows and v - rows[-1] < 5: continue
            rows.append(v)
        right = max(xr) if xr else 0
        if len(rows) > 1 or right > RIGHT:
            bad += 1
            print(f"p{pi+1:>2} {tag}: {len(rows)}줄, 우측 끝 {right:.0f}pt (한계 {RIGHT:.0f})")
print("── Check Up 범례 전부 한 줄" if not bad else f"── 문제 {bad}건")
sys.exit(1 if bad else 0)
