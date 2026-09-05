#!/usr/bin/env python3
"""여러 PNG 를 세로로 이어 붙인 확인용 시트.  python3 sheet.py out.png a.png b.png …"""
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert("RGB") for f in files]
W = max(i.width for i in ims); H = sum(i.height for i in ims) + 6 * (len(ims) - 1)
sheet = Image.new("RGB", (W, H), "#888"); y = 0
for im in ims: sheet.paste(im, (0, y)); y += im.height + 6
sheet.save(out); print(out, sheet.size)
