# -*- coding: utf-8 -*-
"""bank/parts/{id}_p1~3.json 을 합쳐 bank/{id}.json 을 만들고 검증한다.
   사용: python3 merge_bank.py m1-01   (성공 시 OK, 실패 시 이유 출력·종료코드 1)"""
import json,sys,re,os
cid=sys.argv[1]
H=os.path.dirname(os.path.abspath(__file__))
tax={t['id']:t for t in json.load(open(H+'/bank/taxonomy.json',encoding='utf-8'))}
if cid not in tax: print('없는 항목 id:',cid); sys.exit(1)
qs=[]
for p in (1,2,3):
    f='%s/bank/parts/%s_p%d.json'%(H,cid,p)
    if not os.path.exists(f): print('부분 파일 없음:',f); sys.exit(1)
    try: part=json.load(open(f,encoding='utf-8'))
    except Exception as e: print('JSON 파싱 실패:',f,e); sys.exit(1)
    if not isinstance(part,list): print('배열이 아님:',f); sys.exit(1)
    qs+=part
errs=[]
if len(qs)!=100: errs.append('문항 수 %d (100이어야)'%len(qs))
lv={'하':0,'중':0,'상':0}; ty={'mc':0,'short':0}; stems=set()
for i,q in enumerate(qs):
    q['no']=i+1
    if q.get('level') not in lv: errs.append('#%d level "%s"'%(i+1,q.get('level'))); continue
    lv[q['level']]+=1
    t=q.get('type')
    if t not in ty: errs.append('#%d type "%s"'%(i+1,t)); continue
    ty[t]+=1
    s=(q.get('stem') or '').strip()
    if not s: errs.append('#%d stem 비어 있음'%(i+1))
    key=re.sub(r'\s+',' ',s)
    if key in stems: errs.append('#%d stem 중복'%(i+1))
    stems.add(key)
    if not (q.get('why') or '').strip(): errs.append('#%d why 없음'%(i+1))
    if t=='mc':
        c=q.get('choices')
        if not isinstance(c,list) or len(c)!=5: errs.append('#%d 선지 %s개'%(i+1,len(c) if isinstance(c,list) else 0))
        elif len(set(map(str,c)))!=5: errs.append('#%d 선지 중복'%(i+1))
        a=q.get('answer')
        if not (isinstance(a,int) and 1<=a<=5): errs.append('#%d answer는 1~5 정수여야 (%r)'%(i+1,a))
    else:
        a=q.get('answer')
        if not (isinstance(a,str) and a.strip()): errs.append('#%d 주관식 answer 비어 있음'%(i+1))
        if 'alt' in q and not isinstance(q['alt'],list): errs.append('#%d alt는 배열'%(i+1))
if lv!={'하':34,'중':33,'상':33}: errs.append('수준 배분 %s (하34/중33/상33이어야)'%lv)
if ty!={'mc':70,'short':30}: errs.append('유형 배분 %s (mc70/short30이어야)'%ty)
if errs:
    print('검증 실패 %d건:'%len(errs)); [print(' -',e) for e in errs[:20]]; sys.exit(1)
t=tax[cid]
out=dict(id=cid,grade=t['grade'],name=t['name'],points=t['points'],questions=qs)
json.dump(out,open('%s/bank/%s.json'%(H,cid),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('OK',cid,len(qs),'문항  하%d/중%d/상%d  mc%d/short%d'%(lv['하'],lv['중'],lv['상'],ty['mc'],ty['short']))
