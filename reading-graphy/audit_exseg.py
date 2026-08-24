import sys, os
from exseg_lib import parse, hard_need, soft_need
bad = 0
for f in sorted(sys.argv[1:]):
    p = parse(open(f).read())
    tag = f'{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}'
    if not p: print(f'{tag}: 파싱 실패'); bad += 1; continue
    _, widths, cells = p
    for c in cells:
        h = hard_need(c['text'], c['bold'], c['bordered'])
        if c['w'] < h:
            print(f"{tag}: \"{c['text']}\" ({c['label']}) 폭 {c['w']} < 단어잘림한계 {h}")
            bad += 1
print('단어가 잘리는 칸:', bad)
