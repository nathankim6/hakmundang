/* Unit 08 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 thrift:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="22" stroke="${c}" stroke-width="3" stroke-dasharray="8 6"/>
  <path d="M32 14l6 8H26z" fill="${c}"/>
  <circle cx="32" cy="32" r="10" fill="${c}" opacity=".2"/>
  <path d="M32 26v12M28 30h8M28 35h8" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
 camera:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="6" y="20" width="34" height="24" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M40 30l16-8v24l-16-8z" fill="${c}" opacity=".3" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="20" cy="32" r="6" fill="${c}"/>
  <path d="M14 52h20" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 14c4-4 10-4 14 0" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".5"/></svg>`,
 arthur:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 8l4 30-4 8-4-8z" fill="${c}"/>
  <path d="M20 38h24" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M32 46v10" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M12 56h40" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
  <circle cx="18" cy="18" r="3" fill="${c}" opacity=".5"/>
  <circle cx="48" cy="22" r="3" fill="${c}" opacity=".4"/>
  <circle cx="46" cy="12" r="2.4" fill="${c}" opacity=".3"/></svg>`,
 harvest:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 54V22" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 30c-8 0-11-5-11-11 7 0 11 4 11 11zM32 30c8 0 11-5 11-11-7 0-11 4-11 11z" fill="${c}" opacity=".6"/>
  <path d="M32 44c-8 0-11-5-11-11 7 0 11 4 11 11zM32 44c8 0 11-5 11-11-7 0-11 4-11 11z" fill="${c}"/>
  <path d="M12 58h40" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <rect x="44" y="38" width="14" height="16" rx="3" fill="none" stroke="${c}" stroke-width="2.6"/></svg>`,
 letters:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="18" width="30" height="22" rx="3" stroke="${c}" stroke-width="3"/>
  <path d="M8 21l15 11 15-11" stroke="${c}" stroke-width="2.8" fill="none" stroke-linejoin="round"/>
  <circle cx="50" cy="16" r="4" fill="${c}"/><circle cx="56" cy="34" r="4" fill="${c}" opacity=".6"/>
  <circle cx="46" cy="48" r="4" fill="${c}" opacity=".45"/>
  <path d="M38 26l10-8M38 32l16 2M32 40l12 6" stroke="${c}" stroke-width="2.4" opacity=".5"/></svg>`,
};

const scenes = {
 /* 36 — 모두가 아낄 때 */
 thrift:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <circle cx="320" cy="140" r="86" fill="none" stroke="${d}" stroke-width="4" stroke-dasharray="13 10"/>
  ${[-45,45,135,225].map(a=>{const r=a*Math.PI/180,x=320+86*Math.cos(r),y=140+86*Math.sin(r),t2=r+Math.PI/2;
   return `<path d="M${x+12*Math.cos(t2)} ${y+12*Math.sin(t2)} L${x-8*Math.cos(t2)+8*Math.cos(t2+Math.PI/2)} ${y-8*Math.sin(t2)+8*Math.sin(t2+Math.PI/2)} L${x-8*Math.cos(t2)-8*Math.cos(t2+Math.PI/2)} ${y-8*Math.sin(t2)-8*Math.sin(t2+Math.PI/2)} z" fill="${d}"/>`}).join("")}
  ${bubble({x:228,y:14,w:184,h:38,lines:["한 가정이 덜 쓴다"],c:d,fill:c,tail:"none",size:12.5})}
  ${bubble({x:426,y:120,w:196,h:38,lines:["상점이 덜 판다"],c:d,fill:"#fff",tail:"none",size:12.5})}
  ${bubble({x:228,y:226,w:184,h:38,lines:["사람을 덜 쓴다"],c:d,fill:"#fff",tail:"none",size:12.5})}
  ${bubble({x:18,y:120,w:196,h:38,lines:["소득이 줄어든다"],c:d,fill:"#fff",tail:"none",size:12.5})}
  ${person({x:320,y:196,s:.62,c,pose:"think",hair:"short",face:"worry",brow:"down"})}
  ${prop.coin(348,132,.9,c)}</svg>`,
 /* 37 — 방, 라디오, 카메라 */
 camera:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${[["방",106],["라디오",320],["카메라",534]].map(([txt,x],i)=>`
   ${step({x,y:34,n:i+1,c,label:txt})}`).join("")}
  ${panel({x:44,y:78,w:124,h:96,c:d,fill:"#fff"})}
  ${[[74,110],[106,110],[138,110],[74,146],[106,146],[138,146]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${c}" opacity=".7"/>`).join("")}
  ${label({x:106,y:194,text:"기자 몇 명",c:d,size:11})}
  <g transform="translate(320 126)">
   <rect x="-58" y="-32" width="116" height="64" rx="10" fill="${c}"/>
   <circle cx="-30" cy="0" r="16" fill="#fff" opacity=".9"/>
   <path d="M-2-14h44M-2 0h32M-2 14h44" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/></g>
  ${label({x:320,y:194,text:"부엌마다 곧바로",c:d,size:11})}
  ${[[478,84],[514,84],[550,84],[586,84],[478,118],[514,118],[550,118],[586,118],[478,152],[514,152],[550,152],[586,152]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="30" height="22" rx="4" fill="${c}" opacity="${(.85-i*.055).toFixed(2)}"/>`).join("")}
  ${label({x:534,y:194,text:"수백만 화면",c:d,size:11})}
  ${arrow({x1:180,y1:126,x2:246,y2:126,c:d,w:4.5,dash:"9 7"})}
  ${arrow({x1:394,y1:126,x2:460,y2:126,c:d,w:4.5,dash:"9 7"})}
  ${label({x:320,y:236,text:"거리가 좁아질수록 중간에 서 있던 것이 사라진다",c:d,size:11.5})}
  ${label({x:320,y:266,text:"언론은 느렸지만 뒤이어 캐묻는 질문을 했다",c,size:12.5})}</svg>`,
 /* 38 — 조각들이 한 사람 손에서 하나로 */
 arthur:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <g opacity=".5">${[[30,54,58,24],[38,104,44,22],[112,72,50,20],[36,158,64,22],[116,132,54,20]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="none" stroke="${d}" stroke-width="2.6" stroke-dasharray="5 5"/>`).join("")}</g>
  ${label({x:96,y:200,text:"흩어진 조각들",c:d,size:11.5})}
  ${arrow({x1:196,y1:118,x2:242,y2:118,c:d,w:4.5,dash:"8 7"})}
  ${person({x:300,y:230,s:.92,c,pose:"hold",hair:"long",face:"smile"})}
  ${prop.paper(316,148,1.3,c)}
  ${label({x:300,y:254,text:"몬머스의 제프리 · 1136",c:d,size:11})}
  ${arrow({x1:360,y1:118,x2:406,y2:118,c:d,w:4.5})}
  ${[["프랑스 연애담",56],["성배",100],["맬러리 1485",144]].map(([txt,y],i)=>`
   <rect x="418" y="${y}" width="196" height="30" rx="8" fill="${c}" opacity="${[.85,.6,.4][i]}"/>
   ${label({x:516,y:y+20,text:txt,c:"#fff",size:12})}`).join("")}
  ${label({x:516,y:200,text:"덧붙여진 층들",c:d,size:11.5})}
  ${label({x:320,y:272,text:"전통에는 흔히 저자가 있고, 그 저자는 흔히 잊힌다",c,size:12.5})}</svg>`,
 /* 39 — 늘어난 사람 수와 낮아진 키 */
 harvest:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${ground({x1:40,x2:600,y:214,c:d,w:3.4})}
  <path d="M320 40v174" stroke="${d}" stroke-width="2.8" stroke-dasharray="7 6" opacity=".5"/>
  ${label({x:174,y:34,text:"모으며 살던 때",c:d,size:12})}
  ${label({x:462,y:34,text:"농사짓던 때",c:d,size:12})}
  ${[100,178,256].map((x,i)=>person({x,y:214,s:.86,c,pose:"down",hair:["short","bob","curly"][i],face:"smile"})).join("")}
  ${[356,404,452,500,548,596].map((x,i)=>person({x,y:214,s:.66,c,pose:"down",hair:["short","long","curly","bob","short","cap"][i],face:"flat"})).join("")}
  ${label({x:174,y:240,text:"수는 적고, 키는 크다",c:d,size:11,op:.75})}
  ${label({x:462,y:240,text:"수는 훨씬 많고, 키는 작다",c:d,size:11,op:.75})}
  ${label({x:320,y:270,text:"수와 지속성을 사고, 건강과 자유를 값으로 치렀다",c,size:12.5})}</svg>`,
 /* 40 — 편지가 만든 통로 */
 letters:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${label({x:320,y:26,text:"분노가 오기 전에 만들어 둔 통로",c:d,size:12})}
  ${Array.from({length:12},(_,i)=>{const a=(-90+i*30)*Math.PI/180,x=320+94*Math.cos(a),y=140+72*Math.sin(a);
   return `<path d="M${320+28*Math.cos(a)} ${140+22*Math.sin(a)}L${x} ${y}" stroke="${c}" stroke-width="2.6" opacity=".45"/>
   <g transform="translate(${x} ${y})"><rect x="-13" y="-9" width="26" height="18" rx="3" fill="#fff" stroke="${d}" stroke-width="2.2"/><path d="M-13-7l13 9 13-9" stroke="${d}" stroke-width="2" fill="none"/></g>`}).join("")}
  <circle cx="320" cy="140" r="26" fill="${c}"/>
  ${label({x:320,y:186,text:"보스턴 · 1772",c:d,size:11})}
  ${person({x:96,y:250,s:.66,c,pose:"hold",hair:"cap",face:"flat"})}
  ${prop.paper(108,204,.9,c)}
  ${person({x:552,y:250,s:.66,c,pose:"hold",hair:"short",face:"flat",flip:1})}
  ${prop.paper(540,204,.9,c)}
  ${label({x:320,y:272,text:"통로 없는 분노는 그저 사그라진다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "36":["loop","balance","ruler","warn","pair"],
 "37":["quote","frame","globe","ask","shield"],
 "38":["letters","quote","openbook","swap","tag"],
 "39":["sprout","ruler","dome","balance","nope"],
 "40":["letters","map","pair","loop","spark"]
};

const VIG = {
 "36":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <circle cx="120" cy="72" r="52" fill="none" stroke="${d}" stroke-width="3.6" stroke-dasharray="10 8"/>
  ${[-45,45,135,225].map(a=>{const r=a*Math.PI/180,x=120+52*Math.cos(r),y=72+52*Math.sin(r),t2=r+Math.PI/2;
   return `<path d="M${x+9*Math.cos(t2)} ${y+9*Math.sin(t2)} L${x-6*Math.cos(t2)+6*Math.cos(t2+Math.PI/2)} ${y-6*Math.sin(t2)+6*Math.sin(t2+Math.PI/2)} L${x-6*Math.cos(t2)-6*Math.cos(t2+Math.PI/2)} ${y-6*Math.sin(t2)-6*Math.sin(t2+Math.PI/2)} z" fill="${d}"/>`}).join("")}
  ${prop.coin(120,72,1,c)}
  ${label({x:120,y:142,text:"구성의 오류",c:d,size:11})}</svg>`,
 "37":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${[[26,40],[26,74],[58,40],[58,74]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="${c}" opacity=".7"/>`).join("")}
  <rect x="94" y="42" width="52" height="34" rx="7" fill="${c}"/>
  <path d="M108 52h26M108 62h18" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  ${[[172,32],[200,32],[172,62],[200,62],[172,92],[200,92]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="24" height="18" rx="3" fill="${c}" opacity="${(.8-i*.1).toFixed(2)}"/>`).join("")}
  ${label({x:120,y:132,text:"방 → 라디오 → 카메라",c:d,size:10.5})}</svg>`,
 "38":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g opacity=".45">${[[12,26,36,16],[16,58,28,14],[54,40,32,14],[14,92,40,14]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="${d}" stroke-width="2.4" stroke-dasharray="4 4"/>`).join("")}</g>
  ${person({x:118,y:128,s:.56,c,pose:"hold",hair:"long",face:"smile"})}
  ${prop.paper(128,84,.8,c)}
  ${[[170,32],[170,62],[170,92]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="58" height="20" rx="6" fill="${c}" opacity="${[.8,.55,.35][i]}"/>`).join("")}</svg>`,
 "39":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${ground({x1:12,x2:228,y:118,c:d,w:3})}
  <path d="M120 22v96" stroke="${d}" stroke-width="2.6" stroke-dasharray="6 5" opacity=".5"/>
  ${[42,84].map((x,i)=>person({x,y:118,s:.58,c,pose:"down",hair:["short","bob"][i],face:"smile"})).join("")}
  ${[146,180,214].map((x,i)=>person({x,y:118,s:.44,c,pose:"down",hair:["short","long","curly"][i],face:"flat"})).join("")}
  ${label({x:120,y:142,text:"수는 늘고 키는 줄었다",c:d,size:10.5})}</svg>`,
 "40":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${Array.from({length:9},(_,i)=>{const a=(-90+i*40)*Math.PI/180,x=120+66*Math.cos(a),y=70+46*Math.sin(a);
   return `<path d="M${120+20*Math.cos(a)} ${70+14*Math.sin(a)}L${x} ${y}" stroke="${c}" stroke-width="2.2" opacity=".45"/>
   <g transform="translate(${x} ${y})"><rect x="-10" y="-7" width="20" height="14" rx="2.5" fill="#fff" stroke="${d}" stroke-width="2"/><path d="M-10-5l10 7 10-7" stroke="${d}" stroke-width="1.8" fill="none"/></g>`}).join("")}
  <circle cx="120" cy="70" r="18" fill="${c}"/>
  ${label({x:120,y:140,text:"편지가 만든 통로",c:d,size:11})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
