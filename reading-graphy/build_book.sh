#!/bin/bash
# usage: build_book.sh <bookdir> [iterations]
# 렌더 → PDF → 면수 확인 → 오토핏 측정을 반복한다.
# 오토핏이 과하게 늘어나 면수가 어긋나면 직전 상태로 되돌리고 정상 판본으로 마감한다.
set -e
BOOK=$(realpath "$1")
ITER=${2:-3}
W=$BOOK/work
cd "$W"

expected_pages() {
  python3 - "$W/units_pages.txt" <<'EOF'
import sys
tot=0
for line in open(sys.argv[1]):
    no, pg = line.split()
    tot += 13 if pg == "10" else 7
print(tot)
EOF
}

render() {   # 현재 autofit.json으로 docx+pdf 생성, 면수를 echo
  ORUN_WORK=$W ORUN_OUT=$W/book.docx node "$BOOK/scripts/generate_book.js" >/dev/null
  python3 "$BOOK/scripts/fix_fontkeys.py" "$W/book.docx" >/dev/null
  rm -f "$W/book.pdf"
  soffice --headless --convert-to pdf --outdir "$W" "$W/book.docx" >/dev/null 2>&1
  pdfinfo "$W/book.pdf" | awk '/^Pages/{print $2}'
}

rm -f "$W/autofit.json" "$W/autofit.prev.json"
PAGES=$(render)
EXP=$(expected_pages)
echo "baseline pages=$PAGES expected=$EXP"
if [ "$PAGES" != "$EXP" ]; then echo "BASELINE MISMATCH — 유닛 콘텐츠를 줄여야 함."; exit 2; fi

for i in $(seq 1 "$ITER"); do
  cp -f "$W/autofit.json" "$W/autofit.prev.json" 2>/dev/null || rm -f "$W/autofit.prev.json"
  python3 "$BOOK/scripts/autofit.py" "$W/book.pdf" "$W" >/dev/null
  PAGES=$(render)
  echo "iteration $i: pages=$PAGES"
  if [ "$PAGES" != "$EXP" ]; then
    echo "  → 오토핏 과다. 직전 값으로 되돌린다."
    if [ -f "$W/autofit.prev.json" ]; then cp -f "$W/autofit.prev.json" "$W/autofit.json";
    else rm -f "$W/autofit.json"; fi
    PAGES=$(render)
    echo "  → 롤백 후 pages=$PAGES"
    break
  fi
done
[ "$PAGES" == "$EXP" ] || exit 2
echo "BUILD OK: $W/book.docx / book.pdf ($PAGES pages)"
