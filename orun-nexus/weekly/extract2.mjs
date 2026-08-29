import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
const UP='/root/.claude/uploads/07b3c175-1318-5ea1-94ef-b6ea0fe4a9af/';
const FILES=['54909ef8-1.pdf','34ade610-2.pdf','ab0c2b73-3.pdf','0aa4a9f6-4.pdf',
             '8dadc7a8-5.pdf','14a4738f-6.pdf','75e88ef2-7.pdf','5792db44-8.pdf'];
const out=[];
for(const f of FILES){
  const data=new Uint8Array(fs.readFileSync(UP+f));
  const doc=await pdfjs.getDocument({data, useSystemFonts:false, standardFontDataUrl:null}).promise;
  for(let i=1;i<=doc.numPages;i++){
    const p=await doc.getPage(i);
    const vp=p.getViewport({scale:1});
    const tc=await p.getTextContent();
    // group items into lines by y, keep x of first item and font size
    const rows=[];
    for(const it of tc.items){
      if(!it.str) continue;
      const x=it.transform[4], y=it.transform[5], h=Math.hypot(it.transform[2],it.transform[3]);
      if(h>20) continue;            /* 지면 한복판의 거대한 ORUN WEEKLY 워터마크 */
      const r=rows.find(r=>Math.abs(r.y-y)<3.2);
      const w=it.width||0;
      if(r){ r.parts.push({x,s:it.str,w}); r.h=Math.max(r.h,h); }
      else rows.push({y, h, parts:[{x,s:it.str,w}]});
    }
    rows.sort((a,b)=>b.y-a.y);
    const lines=rows.map(r=>{
      r.parts.sort((a,b)=>a.x-b.x);
      const inseg=(lo,hi)=>r.parts.filter(p=>p.x>=lo&&p.x<hi);
      const seg=(lo,hi)=>inseg(lo,hi).map(p=>p.s).join('').replace(/\s+/g,' ').trim();
      /* 칸의 오른쪽 끝 — 줄이 여백까지 꽉 찼는지 보려면 이 값이 필요하다.
         우리말은 아무 데서나 줄이 바뀌므로, 꽉 찬 줄은 낱말 한복판에서
         잘린 것이고 여유가 남은 줄은 공백에서 잘린 것이다. */
      const right=a=>a.length? Math.max.apply(null,a.map(p=>p.x+p.w)) : null;
      return {y:+r.y.toFixed(1), x:+r.parts[0].x.toFixed(1), h:+r.h.toFixed(1),
              t:r.parts.map(p=>p.s).join('').replace(/\s+/g,' ').trim(),
              L:seg(-1e9,300), R:seg(300,1e9),
              lr:right(inseg(-1e9,300)), rr:right(inseg(300,1e9))};
    }).filter(l=>l.t);
    out.push({file:f, page:i, w:+vp.width.toFixed(0), h:+vp.height.toFixed(0), lines});
  }
  console.error(f, doc.numPages);
}
fs.writeFileSync('weekly_raw4.json', JSON.stringify(out));
console.error('pages', out.length);
