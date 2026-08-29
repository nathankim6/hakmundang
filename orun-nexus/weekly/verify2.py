# -*- coding: utf-8 -*-
import json, io, re
D = json.load(io.open('weekly.json', encoding='utf-8'))
W = {w['no']: w for w in D['weeks']}
A = {int(k): v for k, v in D['answers'].items()}
def norm(s):
    s = s.replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
    s = s.replace('–','-').replace('—','-').replace('―','-')
    return re.sub(r'\s+',' ',s).strip()

exact=loose=0; hard=[]
for wn in sorted(W):
    sents={s['no']:s for s in W[wn]['sentences']}
    for no, ans in A[wn]:
        s=sents[no-(wn-1)*100]; en=norm(s['en']).lower()
        src=norm(re.match(r'^(.*?)\s*->\s*(.*)$', ans).group(1)).lower()
        if src in en: exact+=1; continue
        # 사이에 부사 따위가 끼어 인용이 줄어든 자리 — 낱말이 순서대로 들어 있으면 통과
        ws=[re.escape(w) for w in src.split()]
        if ws and re.search(r'\b'+r'\b(?:\W+\w+){0,3}\W+\b'.join(ws)+r'\b', en):
            loose+=1; continue
        hard.append((wn, no, src, norm(s['en'])))
tot=sum(len(v) for v in A.values())
print('정답 %d건  |  원문 그대로 확인 %d (%.2f%%)  |  사이 낱말 끼인 인용 확인 %d  |  남은 불일치 %d'
      %(tot, exact, exact/tot*100, loose, len(hard)))
print()
for wn,no,src,en in hard:
    print('W%-2d #%-5d 찾는말 %r' % (wn,no,src))
    print('           원문 %s' % en)
    print()
