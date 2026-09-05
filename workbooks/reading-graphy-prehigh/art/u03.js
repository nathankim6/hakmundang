/* Unit 03 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 model:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="7" y="12" width="50" height="40" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M14 44l10-14 8 9 7-11 11 16" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>
  <path d="M14 32h16l6-10h20" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="14" cy="32" r="3.6" fill="${c}"/><circle cx="30" cy="32" r="3.6" fill="${c}"/><circle cx="50" cy="22" r="3.6" fill="${c}"/></svg>`,
 joke:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 12h44a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H26l-12 10V42h-4a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="${c}"/>
  <path d="M22 25c0-3 2-4 4-4M38 25c0-3 2-4 4-4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <path d="M22 32c3 4 6 5 10 5s7-1 10-5" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`,
 data:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 52V14M10 52h44" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="18" y="36" width="8" height="16" rx="2" fill="${c}" opacity=".35"/>
  <rect x="30" y="28" width="8" height="24" rx="2" fill="${c}" opacity=".6"/>
  <rect x="42" y="18" width="8" height="34" rx="2" fill="${c}"/>
  <path d="M16 26h12" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5"/>
  <circle cx="34" cy="14" r="6" stroke="${c}" stroke-width="2.8"/>
  <path d="M32 12c0-1.6 1-2.4 2-2.4s2 .8 2 2.4-2 1.4-2 2.6" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
 neural:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="12" cy="20" r="5" fill="${c}"/><circle cx="12" cy="44" r="5" fill="${c}"/>
  <circle cx="32" cy="14" r="5" fill="${c}" opacity=".55"/><circle cx="32" cy="32" r="5" fill="${c}" opacity=".55"/><circle cx="32" cy="50" r="5" fill="${c}" opacity=".55"/>
  <circle cx="52" cy="32" r="5" fill="${c}"/>
  <path d="M17 20l10-5M17 20l10 11M17 44l10-11M17 44l10 5M37 14l11 15M37 32h10M37 50l11-15" stroke="${c}" stroke-width="2.2" opacity=".55"/></svg>`,
 feed:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="16" y="6" width="32" height="52" rx="5" stroke="${c}" stroke-width="3"/>
  <rect x="21" y="14" width="22" height="9" rx="2.5" fill="${c}"/>
  <rect x="21" y="27" width="22" height="9" rx="2.5" fill="${c}" opacity=".7"/>
  <rect x="21" y="40" width="22" height="9" rx="2.5" fill="${c}" opacity=".4"/>
  <path d="M28 10h8" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
};

const scenes = {
 /* 11 — 노선도와 실제 길 */
 model:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:22,w:272,h:184,c:d,fill:"#fff",n:1,label:"노선도 — 곧은 선"})}
  <path d="M48 148h58l34-42h92" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M48 178h100l30-34h44" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
  ${[[48,148],[106,148],[140,106],[232,106],[148,178],[232,144]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${d}" stroke-width="3.4"/>`).join("")}
  ${panel({x:348,y:22,w:272,h:184,c:d,fill:"#fff",n:2,label:"실제 땅 — 굽은 길"})}
  <path d="M376 172c34-10 24-48 64-52s48 26 86 18" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M376 192c52-8 44-32 92-36s56 20 90 12" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".35"/>
  ${[[376,172],[412,162],[440,120],[500,124],[526,138]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${d}" stroke-width="3"/>`).join("")}
  ${person({x:320,y:262,s:.72,c,pose:"think",hair:"short",face:"smile"})}
  ${tag({x:320,y:120,text:"버린 것",c})}
  ${label({x:320,y:274,text:"지도는 도시가 아니다 — 무엇을 뺐는지 먼저 묻는다",c,size:12})}</svg>`,
 /* 12 — 농담이 갈라지는 지점 */
 joke:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:88,y:238,s:.95,c,pose:"open",hair:"short",face:"glad",brow:"up"})}
  ${bubble({x:126,y:104,w:186,h:44,lines:["… 좌석이 편하더라."],c:d,tail:"bl",size:12.5})}
  ${person({x:556,y:238,s:.95,c,pose:"open",hair:"bob",face:"glad",brow:"up",flip:1})}
  <path d="M330 122c58-42 128-48 196-48" stroke="${d}" stroke-width="4" fill="none" stroke-dasharray="10 8" opacity=".4" stroke-linecap="round"/>
  <path d="M330 134c58 40 128 46 196 46" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
  ${bubble({x:404,y:52,w:150,h:38,lines:["기대한 뜻"],c:d,fill:"#fff",tail:"none",size:11.5})}
  ${bubble({x:404,y:160,w:150,h:38,lines:["도착한 뜻"],c:d,fill:"#fff",tail:"none",size:11.5})}
  <g opacity=".45">${[[420,64],[540,64]].map(([x,y])=>``).join("")}</g>
  ${step({x:322,y:196,n:1,c,label:""})}
  ${label({x:322,y:226,text:"머리가 재빨리 고친다",c:d,size:11})}
  ${label({x:320,y:272,text:"그 수선이 곧 웃음이다",c,size:12.5})}</svg>`,
 /* 13 — 같은 점, 다른 축 */
 data:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:270,h:190,c:d,fill:"#fff",n:1,label:"0에서 시작한 축"})}
  <path d="M62 186V44M62 186h206" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M78 176l40-6 42-9 44-8 42-11" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${[[78,176],[118,170],[160,161],[204,153],[246,142]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`).join("")}
  ${label({x:56,y:52,text:"100",c:d,size:10,anchor:"end"})}${label({x:56,y:190,text:"0",c:d,size:10,anchor:"end"})}
  ${panel({x:350,y:20,w:270,h:190,c:d,fill:"#fff",n:2,label:"90에서 시작한 축"})}
  <path d="M392 186V44M392 186h206" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M408 178l40-26 42-32 44-30 42-38" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${[[408,178],[448,152],[490,120],[534,90],[576,52]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`).join("")}
  ${label({x:386,y:52,text:"100",c:d,size:10,anchor:"end"})}${label({x:386,y:190,text:"90",c:d,size:10,anchor:"end"})}
  ${tag({x:320,y:112,text:"같은 자료",c})}
  ${person({x:320,y:258,s:.66,c,pose:"think",hair:"bun",face:"flat"})}
  ${label({x:320,y:274,text:"숫자는 스스로 말하지 않는다",c,size:12.5})}</svg>`,
 /* 14 — 층을 지나는 신호 */
 neural:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${[[[100,72],[100,140],[100,208]],[[240,52],[240,116],[240,180],[240,240]],[[380,72],[380,140],[380,208]]].map((col,ci)=>col.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="${c}" opacity="${ci===1?.5:.9}"/>`).join("")).join("")}
  ${[[100,72],[100,140],[100,208]].map(([x1,y1])=>[[240,52],[240,116],[240,180],[240,240]].map(([x2,y2])=>`<path d="M${x1+13} ${y1}L${x2-13} ${y2}" stroke="${c}" stroke-width="1.8" opacity=".3"/>`).join("")).join("")}
  ${[[240,52],[240,116],[240,180],[240,240]].map(([x1,y1])=>[[380,72],[380,140],[380,208]].map(([x2,y2])=>`<path d="M${x1+13} ${y1}L${x2-13} ${y2}" stroke="${c}" stroke-width="1.8" opacity=".3"/>`).join("")).join("")}
  ${[[380,72],[380,140],[380,208]].map(([x,y])=>`<path d="M${x+13} ${y}L487 140" stroke="${c}" stroke-width="2.2" opacity=".5"/>`).join("")}
  <circle cx="500" cy="140" r="17" fill="${c}"/>
  ${label({x:100,y:246,text:"화소",c:d,size:11})}
  ${label({x:240,y:270,text:"가장자리",c:d,size:11})}
  ${label({x:380,y:246,text:"귀 · 눈",c:d,size:11})}
  ${bubble({x:520,y:52,w:104,h:40,lines:["고양이!"],c:d,tail:"bl",size:12.5})}
  ${person({x:566,y:250,s:.66,c,pose:"think",hair:"short",face:"flat"})}
  ${thought({x:452,y:186,w:150,h:32,lines:["왜 그렇게 답했지?"],c:d,size:10.5,side:"r"})}
  ${label({x:250,y:24,text:"층을 지날수록 더 큰 무늬를 본다",c:d,size:11.5})}</svg>`,
 /* 15 — 한쪽으로만 넓어지는 방 */
 feed:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:300,y:248,s:1,c,pose:"hold",hair:"short",face:"smile"})}
  ${prop.phone(316,160,1.1,c)}
  ${[[386,40],[412,82],[424,126],[412,170],[386,212]].map(([x,y],i)=>`<g><rect x="${x}" y="${y}" width="118" height="30" rx="8" fill="${c}" opacity="${[.9,.75,.9,.75,.9][i]}"/><path d="M348 132L${x} ${y+15}" stroke="${c}" stroke-width="2.6" opacity=".45"/></g>`).join("")}
  ${label({x:518,y:136,text:"비슷한 것이 더",c:d,size:11.5})}
  <g opacity=".3">${[[142,74],[142,186]].map(([x,y])=>`<rect x="${x}" y="${y}" width="104" height="28" rx="8" fill="none" stroke="${d}" stroke-width="2.6" stroke-dasharray="6 5"/>`).join("")}
   <path d="M256 132L246 88M256 132L246 200" stroke="${d}" stroke-width="2.4" stroke-dasharray="5 6"/></g>
  ${label({x:194,y:146,text:"좀처럼 안 보임",c:d,size:11,op:.55})}
  ${label({x:320,y:272,text:"피드는 창이 아니라 선별이다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "11":["map","gear","hourglass","warn","ask"],
 "12":["quote","swap","spark","pair","nope"],
 "13":["ruler","balance","frame","eye","ask"],
 "14":["letters","spark","loop","warn","tag"],
 "15":["frame","heartbeat","fire","shield","eye"]
};

const VIG = {
 "11":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M20 96h44l26-32h58" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${[[20,96],[64,96],[90,64],[148,64]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${d}" stroke-width="3.2"/>`).join("")}
  ${bubble({x:112,y:96,w:118,h:34,lines:["1933"],c:d,tail:"tl",size:12})}
  ${label({x:120,y:26,text:"거리를 버린 지도",c:d,size:11})}</svg>`,
 "12":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:52,y:142,s:.68,c,pose:"open",hair:"short",face:"glad",brow:"up"})}
  ${person({x:190,y:142,s:.68,c,pose:"open",hair:"curly",face:"glad",brow:"up",flip:1})}
  ${bubble({x:70,y:14,w:100,h:32,lines:["ㅋㅋㅋ"],c:d,tail:"bl",size:12})}
  ${label({x:120,y:132,text:"함께 웃으면 같은 것을 안다는 뜻",c:d,size:10})}</svg>`,
 "13":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M24 118V22M24 118h198" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  ${[[48,104],[80,92],[112,96],[144,68],[176,52]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`).join("")}
  <path d="M42 108l134-56" stroke="${c}" stroke-width="3.4" stroke-dasharray="7 6" opacity=".6"/>
  <path d="M42 96c40 18 92-30 134-46" stroke="${d}" stroke-width="3.4" fill="none" opacity=".4"/>
  ${label({x:200,y:112,text:"같은 점",c:d,size:10.5,anchor:"end",op:.7})}</svg>`,
 "14":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${panel({x:12,y:22,w:96,h:76,c:d,fill:"#fff"})}
  <path d="M22 90c16-26 30-28 40-10l20 20z" fill="${c}" opacity=".4"/>
  <circle cx="40" cy="48" r="9" fill="${c}"/>
  ${label({x:60,y:114,text:"눈밭?",c:d,size:11})}
  ${arrow({x1:124,y1:60,x2:158,y2:60,c:d,w:4})}
  ${bubble({x:164,y:42,w:66,h:36,lines:["늑대"],c:d,tail:"none",size:12,fill:c===d?"#fff":"#fff"})}</svg>`,
 "15":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:64,y:142,s:.68,c,pose:"hold",hair:"short",face:"smile"})}
  ${prop.phone(78,86,.9,c)}
  ${[[118,22],[136,54],[142,86],[128,118]].map(([x,y])=>`<g><rect x="${x}" y="${y}" width="86" height="22" rx="6" fill="${c}" opacity=".8"/><path d="M100 84L${x} ${y+11}" stroke="${c}" stroke-width="2.2" opacity=".4"/></g>`).join("")}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
