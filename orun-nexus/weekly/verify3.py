# -*- coding: utf-8 -*-
"""정답지 ↔ 해설집 ↔ 본문 삼중 대조."""
import json, io, re
D = json.load(io.open('weekly.json', encoding='utf-8'))
G = json.load(io.open('guide.json', encoding='utf-8'))
W = {w['no']: w for w in D['weeks']}
A = {int(k): v for k, v in D['answers'].items()}

def norm(s):
    s = (s or '').replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
    s = s.replace('–','-').replace('—','-').replace('―','-').replace('→','->')
    return re.sub(r'[^0-9a-z가-힣\'\- ]', ' ', re.sub(r'\s+', ' ', s).strip().lower()).strip()

miss_no, ok_pair, bad_pair, no_guide, half = [], [], [], 0, []
for wn in sorted(W):
    g = G.get(str(wn), {})
    have = {int(k) for k in g}
    if g: miss_no.append((wn, [i for i in range(1, max(have) + 1) if i not in have]))
    for no, ans in A[wn]:
        local = no - (wn - 1) * 100
        r = g.get(str(local))
        if not r: no_guide += 1; continue
        if not r['right']: half.append((wn, local, r['wrong'][:40])); continue
        m = re.match(r'^(.*?)\s*->\s*(.*)$', ans)
        src, dst = norm(m.group(1)), norm(m.group(2))
        gw, gr = norm(r['wrong']), norm(r['right'])
        hit = (src and (src in gw or gw in src)) and (dst and (dst in gr or gr in src + ' ' + gr))
        (ok_pair if hit else bad_pair).append((wn, local, ans, r['wrong'], r['right']))

n = len(ok_pair) + len(bad_pair)
print('해설이 있는 문항         : %d' % n)
print('정답지와 해설이 일치     : %d  (%.1f%%)' % (len(ok_pair), len(ok_pair) / max(1, n) * 100))
print('불일치                   : %d' % len(bad_pair))
print('해설에 바른 형태가 없음  : %d' % len(half))
print('해설 없는 문항           : %d' % no_guide)
print()
print('--- 주차별 빠진 해설 번호 ---')
for wn, ms in miss_no:
    if ms: print('  W%-2d : %s' % (wn, ms))
print()
print('--- 불일치 (앞 25) ---')
for wn, no, ans, gw, gr in bad_pair[:25]:
    print('  W%-2d #%-3d 정답지 %-46s' % (wn, no, ans[:46]))
    print('            해설   %s  →  %s' % (gw[:52], gr[:52]))
