"""1-3 지시어 표의 칩 줄이 칸을 넘지 않도록 폭을 다시 배분한다.

칸 안쪽 폭 = aw[2] - 230. 칩·라벨은 글자가 잘리지 않을 최소 폭을 보장하고,
남는 폭은 간격과 칩에 비례 배분한다. 템플릿에서 물려받은 초과(7190 > 7120)도 함께 고친다.
"""
import re, sys, os
from exseg_lib import text_tw

PT = 8.0                      # size 16 half-points
CHIP_PAD, LAB_PAD = 160, 70   # 셀 여백 + 여유
GAP_MIN, SEP_MIN = 120, 200   # 좁은 간격 / 넓은 구분 간격 최소값

AW = re.compile(r'const aw = \[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]')
BLOCK = re.compile(r'(const chips8 = \([^)]*\) => T\(\[)([\d,\s]+)(\], \[new TableRow\(\{ children: \[)(.*?)(\]\s*\}\)\]\);)', re.S)
CELL = re.compile(r'(labC|chipC)\("((?:[^"\\]|\\.)*)",\s*(\d+)\)|gapC\((\d+)\)')

def fix(path):
    src = open(path).read()
    m = AW.search(src)
    b = BLOCK.search(src)
    if not m or not b:
        return None
    inner = int(m.group(3)) - 230
    cells = []                                  # (kind, text|None, width)
    for c in CELL.finditer(b.group(4)):
        if c.group(1):
            cells.append((c.group(1), c.group(2), int(c.group(3))))
        else:
            cells.append(('gapC', None, int(c.group(4))))
    if sum(w for _, _, w in cells) <= inner:
        return None
    # 최소 폭
    mins = []
    for kind, txt, w in cells:
        if kind == 'chipC':
            mins.append(int(text_tw(txt, False, PT) + CHIP_PAD))
        elif kind == 'labC':
            mins.append(int(text_tw(txt, True, PT) + LAB_PAD))
        else:
            mins.append(SEP_MIN if w >= 250 else GAP_MIN)
    if sum(mins) > inner:
        return ('infeasible', sum(mins), inner)
    new = list(mins)
    leftover = inner - sum(mins)
    base = sum(w for _, _, w in cells)
    for i, (_, _, w) in enumerate(cells):
        new[i] += round(leftover * w / base)
    d = inner - sum(new)                        # 반올림 잔차
    i = max(range(len(new)), key=lambda k: new[k] - mins[k])
    new[i] += d
    assert sum(new) == inner and all(new[k] >= mins[k] for k in range(len(new)))
    # 본문 치환
    body, idx = b.group(4), 0
    out, pos = [], 0
    for c in CELL.finditer(body):
        s, e = (c.span(3) if c.group(1) else c.span(4))
        out.append(body[pos:s]); out.append(str(new[idx])); pos = e; idx += 1
    out.append(body[pos:])
    newbody = ''.join(out)
    head = b.group(1) + ', '.join(str(x) for x in new) + b.group(3)
    src = src[:b.start()] + head + newbody + b.group(5) + src[b.end():]
    open(path, 'w').write(src)
    return ('fixed', sum(w for _, _, w in cells), inner)

n = bad = 0
for f in sorted(sys.argv[1:]):
    r = fix(f)
    if not r: continue
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    if r[0] == 'infeasible':
        print(f'{tag}: 불가 (최소 {r[1]} > 칸 {r[2]})'); bad += 1
    else:
        print(f'{tag}: {r[1]} → {r[2]}'); n += 1
print(f'수정 {n}건, 불가 {bad}건')
