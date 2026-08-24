"""1-3 지시어 표의 칩 줄이 담기는 칸을 넘는지 검사한다.

칸 안쪽 폭 = aw[2] - (좌 150 + 우 80). 칩 표의 열 폭 합이 이를 넘으면 칩이 잘린다.
"""
import re, sys, os

AW = re.compile(r'const aw = \[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]')
CHIPS = re.compile(r'const (chips\d+) = \([^)]*\) => T\(\[([\d,\s]+)\]')

bad = 0
for f in sorted(sys.argv[1:]):
    src = open(f).read()
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    m = AW.search(src)
    if not m:
        continue
    inner = int(m.group(3)) - 230
    for c in CHIPS.finditer(src):
        widths = [int(x) for x in c.group(2).split(',')]
        if any(w == 0 for w in widths):      # cw 인자 형태는 건너뜀
            continue
        total = sum(widths)
        if total > inner:
            print(f'{tag}: {c.group(1)} 합계 {total} > 칸 안쪽 {inner} (초과 {total - inner})')
            bad += 1
print('넘치는 칩 줄:', bad)
