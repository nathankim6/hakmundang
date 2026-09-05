/* Unit 1 삽화 — 만화 + 인포그래픽 (kit.js 사용)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop, ink } = K;

const icons = {
 translation:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="7" y="14" width="22" height="34" rx="4" fill="${c}"/>
  <rect x="35" y="14" width="22" height="34" rx="4" fill="${c}" opacity=".3"/>
  <path d="M13 22h10M13 28h7" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M41 22h10M41 28h7" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
  <path d="M29 31h6M32.5 27.5 36 31l-3.5 3.5" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 image:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="13" width="48" height="34" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M14 40c6-11 12-12 17-5 3 4 6 3 8-2l11 12z" fill="${c}" opacity=".45"/>
  <circle cx="21" cy="23" r="4" fill="${c}"/>
  <path d="M22 55h20" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 practice:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="6" y="26" width="52" height="20" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M14 26v20M22 26v20M30 26v20M38 26v20M46 26v20" stroke="${c}" stroke-width="2.4"/>
  <rect x="10" y="26" width="5" height="12" rx="2" fill="${c}"/>
  <rect x="26" y="26" width="5" height="12" rx="2" fill="${c}"/>
  <rect x="42" y="26" width="5" height="12" rx="2" fill="${c}"/>
  <path d="M32 8v12M26 14l6-6 6 6" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 shelter:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 26h44v28H10z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M10 26v-8h6v5h7v-5h6v5h7v-5h6v5h6v8" stroke="${c}" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <path d="M26 54V40a6 6 0 0 1 12 0v14z" fill="${c}"/>
  <circle cx="34" cy="46" r="1.8" fill="#fff"/>
  <path d="M6 54h52" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 talk:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 12h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H20l-8 7v-7H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="${c}"/>
  <path d="M14 20h18M14 27h11" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M26 30h30a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4h-4v6l-7-6H26a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4z" fill="${c}" opacity=".35" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
};

const scenes = {
 /* 01 — 번역: 같은 시를 읽는 두 독자 */
 translation:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:24,y:26,w:266,h:196,c:d,fill:"#fff",n:1,label:"원작을 읽는 사람"})}
  ${person({x:92,y:198,s:1.4,c,face:"glad",arms:"hold",hair:"short"})}
  ${prop.book(92,173,1.5,d)}
  ${bubble({x:148,y:52,w:128,h:56,lines:["이 한 줄이","환하게 들려!"],c:d,tail:"bl",size:13})}
  ${panel({x:350,y:26,w:266,h:196,c:d,fill:"#fff",n:2,label:"번역본을 읽는 사람"})}
  ${person({x:418,y:198,s:1.4,c,face:"flat",arms:"hold",hair:"bun"})}
  ${prop.book(418,173,1.5,d)}
  ${bubble({x:474,y:52,w:128,h:56,lines:["뜻은 알겠는데…","뭔가 밋밋해."],c:d,tail:"bl",size:13})}
  ${arrow({x1:296,y1:120,x2:344,y2:120,c:d,w:5})}
  ${tag({x:320,y:158,text:"번역",c})}
  ${label({x:320,y:262,text:"옮겨진 것 옆에, 남겨진 것이 있다",c,size:12.5})}</svg>`,
 /* 02 — 이미지: 누군가 고른 각도 */
 image:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:112,y:212,s:1.35,c,face:"smile",arms:"hold",hair:"cap"})}
  ${prop.screen(112,188,1.15,d)}
  ${label({x:112,y:242,text:"찍는 사람",c:d,size:12})}
  ${arrow({x1:172,y1:140,x2:250,y2:140,c:d,w:5,dash:"11 8"})}
  ${panel({x:262,y:60,w:190,h:132,c:d,fill:"#fff",label:"화면에 남은 것"})}
  <path d="M282 168c22-38 40-42 56-16 10 16 22 12 30-4l32 44z" fill="${c}" opacity=".45"/>
  <circle cx="300" cy="96" r="12" fill="${c}"/>
  ${callout({x:300,y:96,tx:300,ty:44,text:"고른 빛",c:d})}
  ${callout({x:410,y:170,tx:432,ty:214,text:"고른 순간",c:d,anchor:"middle"})}
  <g opacity=".32">
   <path d="M470 92h150v100H470z" stroke="${d}" stroke-width="3" stroke-dasharray="8 7" fill="none"/>
   ${label({x:545,y:148,text:"잘려 나간 바깥",c:d,size:12})}</g>
  ${arrow({x1:462,y1:130,x2:504,y2:130,c:d,w:4,dash:"7 6"})}
  ${label({x:320,y:268,text:"이미지는 누군가가 고른 한 조각이다",c,size:12.5})}</svg>`,
 /* 03 — 연습: 무대 뒤와 무대 위 */
 practice:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:24,w:280,h:184,c:d,fill:"#fff",n:1,label:"연습실 — 엔지니어처럼"})}
  ${person({x:86,y:186,s:1.3,c,face:"flat",arms:"hold",hair:"short"})}
  <rect x="140" y="140" width="130" height="14" rx="3" fill="${d}" opacity=".25"/>
  ${[146,160,174,188,202,216,230,244,258].map(x=>`<rect x="${x}" y="140" width="7" height="14" rx="2" fill="${d}"/>`).join("")}
  ${thought({x:132,y:52,w:150,h:52,lines:["여기 한 마디만","스무 번 더"],c:d,size:12,side:"l"})}
  ${panel({x:338,y:24,w:280,h:184,c:d,fill:"#fff",n:2,label:"무대 — 조종사처럼"})}
  ${person({x:402,y:186,s:1.3,c,face:"glad",arms:"up",hair:"short"})}
  <rect x="456" y="140" width="130" height="14" rx="3" fill="${c}" opacity=".35"/>
  ${bubble({x:448,y:52,w:150,h:52,lines:["지금 눈앞의","이 소리로"],c:d,tail:"bl",size:12})}
  ${arrow({x1:308,y1:116,x2:332,y2:116,c:d,w:5})}
  ${label({x:320,y:246,text:"볼트를 조이는 시간이 있어야 날아오를 수 있다",c,size:12.5})}
  ${label({x:320,y:266,text:"PRACTICE  →  PERFORMANCE",c:d,size:10.5,op:.6})}</svg>`,
 /* 04 — 위험 없는 세계: 치워 준 물레와 시험받지 못한 아이 */
 shelter:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:26,w:272,h:190,c:d,fill:"#fff",n:1,label:"모든 위험을 치운 성"})}
  ${person({x:80,y:192,s:1.25,c,face:"worry",arms:"open",hair:"long"})}
  <g opacity=".3">${[162,208,254].map(x=>`<g transform="translate(${x} 150)"><circle r="15" fill="none" stroke="${d}" stroke-width="3.4" stroke-dasharray="5 5"/><path d="M-11-11 11 11" stroke="${d}" stroke-width="3.4"/></g>`).join("")}</g>
  ${label({x:208,y:186,text:"치워진 물레들",c:d,size:11,op:.65})}
  ${panel({x:346,y:26,w:272,h:190,c:d,fill:"#fff",n:2,label:"성 밖으로 나온 뒤"})}
  ${person({x:406,y:192,s:1.25,c,face:"glad",arms:"point",hair:"long"})}
  ${bubble({x:468,y:52,w:132,h:50,lines:["내가 정한다"],c:d,tail:"bl",size:13})}
  ${[492,522,552].map(x=>`<path d="M${x} 176l10-20 10 20z" fill="${c}" opacity=".45"/>`).join("")}
  ${label({x:522,y:192,text:"실제 위험",c:d,size:11,op:.65})}
  ${arrow({x1:300,y1:120,x2:340,y2:120,c:d,w:5})}
  ${label({x:320,y:256,text:"시험받지 못한 안전은 사람을 자라게 하지 못한다",c,size:12.5})}</svg>`,
 /* 05 — 읽기는 대화: 혼자 읽기 → 말하기 */
 talk:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${step({x:96,y:44,n:1,c,label:"혼자 읽는다"})}
  ${person({x:96,y:214,s:1.35,c,face:"flat",arms:"hold",hair:"short"})}
  ${prop.book(96,190,1.45,d)}
  ${step({x:320,y:44,n:2,c,label:"말로 꺼낸다"})}
  ${person({x:272,y:214,s:1.3,c,face:"oh",arms:"open",hair:"bun",look:3})}
  ${person({x:376,y:214,s:1.3,c,face:"smile",arms:"open",hair:"curly",look:-4})}
  ${bubble({x:244,y:92,w:158,h:44,lines:["나는 이렇게 읽었어"],c:d,tail:"bl",size:11.5})}
  ${step({x:546,y:44,n:3,c,label:"이해가 자란다"})}
  ${person({x:546,y:214,s:1.35,c,face:"glad",arms:"up",hair:"short"})}
  ${prop.bulb(546,88,1.7,c)}
  ${arrow({x1:150,y1:150,x2:214,y2:150,c:d,w:4.5,dash:"10 8"})}
  ${arrow({x1:428,y1:150,x2:492,y2:150,c:d,w:4.5,dash:"10 8"})}
  ${label({x:320,y:268,text:"문학은 하나의 긴 대화이고, 말할 때 비로소 참여하게 된다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "01":["globe","swap","hourglass","palette","handshake"],
 "02":["eye","letters","frame","camera","pipe"],
 "03":["heartbeat","hourglass","quote","wrench","takeoff"],
 "04":["wand","fire","dome","wilt","sunrise"],
 "05":["books","map","openbook","chat","loop"]
};

const VIG = {
 "01":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:56,y:112,s:.95,c,face:"oh",arms:"point",hair:"short"})}
  <g opacity=".9">${prop.book(150,74,1.7,c)}</g>
  ${bubble({x:96,y:16,w:130,h:38,lines:["canali → canals"],c:d,tail:"bl",size:12})}
  ${label({x:120,y:140,text:"낱말 하나가 만든 오해",c:d,size:11,op:.75})}</svg>`,
 "02":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${panel({x:14,y:20,w:96,h:74,c:d,fill:"#fff"})}
  <path d="M28 82c14-24 26-26 36-10l22 22z" fill="${c}" opacity=".45"/>
  <circle cx="42" cy="44" r="8" fill="${c}"/>
  ${person({x:176,y:120,s:.9,c,face:"think",arms:"think",hair:"cap"})}
  ${thought({x:104,y:100,w:126,h:34,lines:["이건 파이프가 아니다"],c:d,size:10.5,side:"l"})}</svg>`,
 "03":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:60,y:118,s:.95,c,face:"flat",arms:"hold",hair:"short"})}
  ${person({x:180,y:118,s:.95,c,face:"glad",arms:"up",hair:"short"})}
  ${arrow({x1:104,y1:74,x2:136,y2:74,c:d,w:4})}
  ${label({x:60,y:140,text:"엔지니어",c:d,size:11})}
  ${label({x:180,y:140,text:"조종사",c:d,size:11})}
  ${prop.clock(120,34,.9,c)}</svg>`,
 "04":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:64,y:116,s:.95,c,face:"worry",arms:"down",hair:"long"})}
  ${person({x:176,y:116,s:.95,c,face:"glad",arms:"point",hair:"long"})}
  ${arrow({x1:106,y1:70,x2:138,y2:70,c:d,w:4})}
  <g opacity=".35"><circle cx="64" cy="40" r="13" fill="none" stroke="${d}" stroke-width="3" stroke-dasharray="4 4"/>
   <path d="M55 31l18 18" stroke="${d}" stroke-width="3"/></g>
  ${prop.leaf(176,40,.9,c)}
  ${label({x:120,y:142,text:"보호에서 성장으로",c:d,size:11,op:.75})}</svg>`,
 "05":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:52,y:116,s:.9,c,face:"smile",arms:"open",hair:"bun"})}
  ${person({x:120,y:116,s:.9,c,face:"oh",arms:"point",hair:"short",look:-3})}
  ${person({x:188,y:116,s:.9,c,face:"glad",arms:"open",hair:"curly"})}
  ${bubble({x:56,y:14,w:128,h:34,lines:["소리 내어 설명하기"],c:d,tail:"bl",size:10.5})}
  ${label({x:120,y:142,text:"think aloud",c:d,size:11,op:.75})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
