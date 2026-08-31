# -*- coding: utf-8 -*-
"""bank/*.json 을 site.html 에 심어 옳은문법.html 을 만든다."""
import json,glob,os,sys
H=os.path.dirname(os.path.abspath(__file__))
tax=json.load(open(H+'/bank/taxonomy.json',encoding='utf-8'))
order={t['id']:i for i,t in enumerate(tax)}
cats=[]
for f in sorted(glob.glob(H+'/bank/??-??.json')):
    d=json.load(open(f,encoding='utf-8'))
    cats.append(d)
cats.sort(key=lambda c:order.get(c['id'],999))
books=json.load(open(H+'/bank/textbooks.json',encoding='utf-8'))
orun=json.load(open(H+'/bank/orun.json',encoding='utf-8'))
covers=json.load(open(H+'/bank/covers.json',encoding='utf-8'))
blob=json.dumps({'cats':cats,'books':books,'orun':orun,'covers':covers},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
s=open(H+'/site.html',encoding='utf-8').read()
assert '__BANK__' in s
out=s.replace('__BANK__',blob,1)
open(H+'/옳은문법.html','w',encoding='utf-8').write(out)
import collections
print('교재 항목',len(cats),'· 문제',sum(len(c['questions']) for c in cats),
      '·',dict(collections.Counter(c['grade'] for c in cats)),
      '· %.2f MB'%(len(out.encode())/1048576))
