"""유닛 소스의 '정답 한눈에' 패널에서 문항별 정답을 뽑아 면별로 묶는다.

패널은 라벨 런(color: NAVY2)과 값 런이 번갈아 나온다. 색으로 구분하면
문자열 패턴에 기대지 않고 정확히 갈라낼 수 있다.
"""
import re, os, json

PANEL = re.compile(r'K\.push\(sp\(150\)\);\s*\n(.*?)\n\s*\], \{ w: W, shade: COOL', re.S)
RUN = re.compile(r't\("((?:[^"\\]|\\.)*)"\s*,\s*\{([^}]*)\}')

def unesc(s):
    s = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)
    return s.replace('\\"', '"').replace('\\\\', '\\')

# 라벨 → 유닛 안 면 번호 (풀 유닛 / 축약 유닛)
PAGE_FULL = {'01': 1, '02': 1, '03': 1, '04': 1,
             '구문 훈련': 2,
             'STEP 1': 4, 'STEP 2': 5, 'STEP 3': 6, 'STEP 4': 7, 'STEP 5': 7,
             'R1': 8, 'R2': 8, 'R3': 9, 'R4': 9, 'R5': 10, 'R6': 10, 'R7': 10}
PAGE_SHORT = {'01': 1, '02': 1, '03': 1, '04': 1, '구문 훈련': 2, 'STEP 1': 4, 'R1': 5, 'R2': 5}

def parse(path):
    src = open(path).read()
    ex = src[src.index('renderExplain'):]
    m = PANEL.search(ex)
    if not m:
        return None
    is_short = re.search(r'^\s*pages:\s*5', src, re.M) is not None
    pagemap = PAGE_SHORT if is_short else PAGE_FULL
    items, label = [], None
    for r in RUN.finditer(m.group(1)):
        txt, opts = unesc(r.group(1)), r.group(2)
        if 'color: NAVY2' in opts:                 # 라벨
            label = txt.strip()
            items.append([label, ''])
        elif 'color: NAVY' in opts or 'f: FO' in opts:
            label = None                            # 구역 제목(독해/구문분석/RE:RIGHT)
        elif label and items:
            items[-1][1] += txt
    pages = {}
    for label, val in items:
        val = ' '.join(val.split())
        if not val:
            continue
        key = label if label in pagemap else ('구문 훈련' if label.startswith('문') else None)
        if key is None:
            key = '구문 훈련' if re.fullmatch(r'문\s*\d+', label) else None
        if key is None:
            continue
        pages.setdefault(pagemap[key], []).append(f'{label} {val}')
    return {'short': is_short, 'pages': pages}

if __name__ == '__main__':
    import sys
    for f in sys.argv[1:]:
        r = parse(f)
        print(os.path.basename(f), '축약' if r and r['short'] else '풀')
        for pg in sorted(r['pages']):
            print(f'  면{pg}:', ' | '.join(r['pages'][pg])[:150])
