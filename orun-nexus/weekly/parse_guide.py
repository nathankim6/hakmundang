# -*- coding: utf-8 -*-
"""ORUN GUIDE(해설집) 지면 → 문장별 오류 수정·오답 분석·구문 분석 (guide.json).

지면은 두 칸이다. 왼쪽은 ERROR CORRECTION(틀린 형태 → 바른 형태) →
ANALYSIS(오답 분석) → PARAPHRASE(빈칸), 오른쪽은 STRUCTURE(①②③… 구문 조각).
글자 크기는 지면마다 줄어들기도 해서 크기로 가르지 않고 x 자리로 가른다.
줄바꿈으로 갈라진 글줄은 wrapjoin 이 원래 글자 그대로 다시 잇는다.
"""
import json, io, os, re, collections
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wrapjoin import wrapjoin, learn

RAW_PATH = os.environ.get('WEEKLY_RAW', 'weekly_raw4.json')
RAW = json.load(io.open(RAW_PATH, encoding='utf-8'))
# 한 줄 안에 온전히 찍힌 낱말들을 먼저 모은다 — 줄바꿈 판별의 사전이 된다.
for _pg in RAW: learn(l['t'] for l in _pg['lines'])
OUTDIR = os.environ.get('WEEKLY_OUT', '.')

CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮'
def f3(pg): return re.sub(r'\s+', '', ' '.join(l['t'] for l in pg['lines'][:3]))

guides = collections.defaultdict(dict)
cur = None
for pg in RAW:
    a = f3(pg)
    m = re.search(r'WEEK(\d+)', a)
    if m: cur = int(m.group(1))
    if 'ORUNGUIDE옳은영어주간지해설집' not in a or not cur: continue

    # 세 칸(문장 본문 / 왼쪽 해설 / 오른쪽 구문)의 오른쪽 여백선
    enR = max([(l['rr'] if l.get('rr') is not None else l.get('lr')) or 0
               for l in pg['lines'] if l['x'] < 46 and l['h'] < 11] or [None])
    anaR = max([l['lr'] or 0 for l in pg['lines']
                if l.get('lr') and 46 <= l['x'] < 300] or [None])
    stR = max([l['rr'] or 0 for l in pg['lines'] if l.get('rr')] or [None])

    heads = [l for l in pg['lines']
             if l['x'] < 32 and l['h'] < 11 and re.match(r'^\d{1,3}\s+\S', l['t'])]
    heads.sort(key=lambda l: -l['y'])
    for hi, hd in enumerate(heads):
        ybot = heads[hi + 1]['y'] + 1 if hi + 1 < len(heads) else -1
        rows = sorted([l for l in pg['lines'] if ybot < l['y'] <= hd['y'] + 1],
                      key=lambda l: -l['y'])
        no = int(re.match(r'^(\d{1,3})\s', hd['t']).group(1))
        en, ana, fix, st = [], [], [], []
        HS, AH, SH = hd['h'], 8.2, 8.2
        mode, prev_y = 'en', None
        for l in rows:
            h, x = l['h'], l['x']
            if h >= 11 or l['y'] < 42: continue      # 머리글·꼬리글 띠
            RR = l['rr'] if l.get('rr') is not None else l.get('lr')
            if x < 32 or (35 <= x < 46 and abs(h - HS) < 0.6):        # 문장 본문
                t = l['t'] if (l is hd or x < 32) else (l['L'] or l['t'])
                if l is hd: t = re.sub(r'^\d{1,3}\s+', '', t)
                en.append((t, RR)); continue
            lt, rt = l['L'].strip(), l['R'].strip()
            if lt.startswith('ERROR CORRECTION'): mode = 'fix'; prev_y = None
            elif lt.startswith('ANALYSIS'):       mode = 'ana'
            elif lt.startswith('PARAPHRASE'):     mode = 'para'
            elif lt:
                if mode == 'fix':
                    # 틀린 형태와 바른 형태 사이에는 줄 간격이 한 번 크게 벌어진다
                    if prev_y is not None and (prev_y - l['y']) > HS * 1.6: fix.append([])
                    if not fix: fix.append([])
                    fix[-1].append((lt, l['lr'])); prev_y = l['y']
                elif mode == 'ana':
                    AH = h; ana.append((lt, l['lr']))
            if rt and not rt.startswith('STRUCTURE') and 'ORUN' not in rt and '옳은영어' not in rt:
                SH = h
                if rt[0] in CIRC: st.append([(rt, l['rr'])])
                elif st: st[-1].append((rt, l['rr']))
        guides[cur][no] = {
            'en': wrapjoin(en, HS, enR),
            'wrong': wrapjoin(fix[0], HS, anaR) if fix else '',
            'right': wrapjoin(fix[1], HS, anaR) if len(fix) > 1 else '',
            'analysis': wrapjoin(ana, AH, anaR),
            'structure': [wrapjoin(s, SH, stR) for s in st],
        }

json.dump({str(w): {str(n): r for n, r in v.items()} for w, v in guides.items()},
          io.open(OUTDIR + '/guide.json', 'w', encoding='utf-8'), ensure_ascii=False)

print('%-6s %6s %8s %8s %10s %8s' % ('WEEK', '해설', '오류수정', '오답분석', '구문조각평균', '문장번호'))
tot = 0
for w in sorted(guides):
    v = guides[w]; tot += len(v)
    fixn = sum(1 for r in v.values() if r['wrong'] and r['right'])
    anan = sum(1 for r in v.values() if len(r['analysis']) > 30)
    stn = sum(len(r['structure']) for r in v.values()) / max(1, len(v))
    ns = sorted(v)
    print('%-6d %6d %8d %8d %10.1f   %d–%d' % (w, len(v), fixn, anan, stn, ns[0], ns[-1]))
print('총 해설 문장:', tot)
