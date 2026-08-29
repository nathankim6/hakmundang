# -*- coding: utf-8 -*-
"""정답지 ↔ 본문 전수 대조."""
import json, io, re, collections
D = json.load(io.open('weekly.json', encoding='utf-8'))
W = {w['no']: w for w in D['weeks']}
A = {int(k): v for k, v in D['answers'].items()}

def norm(s):
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    s = s.replace('–', '-').replace('—', '-').replace('―', '-')
    return re.sub(r'\s+', ' ', s).strip()

bad, nodash, empty, ok = [], [], [], 0
lens = []
for wn in sorted(W):
    sents = {s['no']: s for s in W[wn]['sentences']}
    for no, ans in A[wn]:
        local = no - (wn - 1) * 100
        s = sents.get(local)
        if s is None:
            bad.append((wn, no, 'NO SENTENCE', ans)); continue
        en = norm(s['en'])
        if not ans:
            empty.append((wn, no)); continue
        m = re.match(r'^(.*?)\s*->\s*(.*)$', ans)
        if not m:
            nodash.append((wn, no, ans)); continue
        src = norm(m.group(1))
        # '삭제' 류나 구두점만 남은 지시는 검사에서 제외
        if src and src.lower() in en.lower(): ok += 1
        else: bad.append((wn, no, src, en[:110]))
    for s in W[wn]['sentences']:
        lens.append((wn, s['no'], len(s['en']), len(s['ko'])))

tot = sum(len(v) for v in A.values())
print('정답 총계        : %d' % tot)
print('원문에서 확인됨  : %d  (%.2f%%)' % (ok, ok / tot * 100))
print('화살표 없는 항목 : %d' % len(nodash))
print('빈 항목          : %d' % len(empty))
print('문장에서 못 찾음 : %d' % len([b for b in bad if b[2] != 'NO SENTENCE']))
print('문장 자체 없음   : %d' % len([b for b in bad if b[2] == 'NO SENTENCE']))
print()
print('--- 화살표 없는 항목 (앞 12) ---')
for x in nodash[:12]: print('  W%-2d #%-4d %r' % x)
print()
print('--- 원문에서 못 찾은 항목 (앞 20) ---')
for x in bad[:20]:
    if x[2] == 'NO SENTENCE': continue
    print('  W%-2d #%-4d  찾는말=%r' % (x[0], x[1], x[2]))
    print('              문장=%s' % x[3])
print()
short_en = [l for l in lens if l[2] < 30]
short_ko = [l for l in lens if l[3] < 10]
print('영문 30자 미만 : %d  %s' % (len(short_en), short_en[:6]))
print('국문 10자 미만 : %d  %s' % (len(short_ko), short_ko[:6]))
print('영문 최장 %d자 / 국문 최장 %d자' % (max(l[2] for l in lens), max(l[3] for l in lens)))
