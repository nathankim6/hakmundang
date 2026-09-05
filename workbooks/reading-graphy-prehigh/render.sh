#!/usr/bin/env bash
# 유닛 하나를 학생용·교사용으로 빌드해 PDF 까지 뽑는다.   ./render.sh 7   → u07.pdf u07_t.pdf
set -e
N=$1; P=$(printf "%02d" "$N")
node build.js --unit=$N >/dev/null && node build.js --unit=$N --teacher >/dev/null
for f in u$P u${P}_t; do
  /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu --no-sandbox \
    --no-pdf-header-footer --virtual-time-budget=20000 --print-to-pdf=$f.pdf $f.html 2>/dev/null
done
python3 -c "import pymupdf;print('u$P.pdf', pymupdf.open('u$P.pdf').page_count, '면 / u${P}_t.pdf', pymupdf.open('u${P}_t.pdf').page_count, '면')"
