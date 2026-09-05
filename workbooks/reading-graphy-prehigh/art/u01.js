/* Unit 1 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

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
 /* 01 — 같은 시를 읽는 두 독자 */
 translation:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:274,h:214,c:d,fill:"#fff",n:1,label:"원작을 읽는 사람"})}
  ${person({x:96,y:224,s:1.12,c,pose:"hold",hair:"short",face:"glad",brow:"up"})}
  ${prop.book(110,132,1.35,c)}
  ${bubble({x:150,y:44,w:130,h:56,lines:["이 한 줄이","환하게 들려!"],c:d,tail:"bl",size:13})}
  ${panel({x:344,y:18,w:274,h:214,c:d,fill:"#fff",n:2,label:"번역본을 읽는 사람"})}
  ${person({x:418,y:224,s:1.12,c,pose:"hold",hair:"bob",face:"flat"})}
  ${prop.book(432,132,1.35,c)}
  ${bubble({x:472,y:44,w:130,h:56,lines:["뜻은 알겠는데…","뭔가 밋밋해."],c:d,tail:"bl",size:13})}
  ${arrow({x1:302,y1:124,x2:338,y2:124,c:d,w:5})}
  ${tag({x:320,y:158,text:"번역",c})}
  ${label({x:320,y:270,text:"옮겨진 것 옆에, 남겨진 것이 있다",c,size:12.5})}</svg>`,
 /* 02 — 누군가 고른 각도 */
 image:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:86,y:234,s:1.05,c,pose:"hold",hair:"cap",face:"smile"})}
  ${prop.screen(100,146,1.1,c)}
  ${label({x:88,y:256,text:"찍는 사람",c:d,size:12})}
  ${arrow({x1:150,y1:150,x2:224,y2:150,c:d,w:5,dash:"11 8"})}
  ${panel({x:238,y:56,w:196,h:140,c:d,fill:"#fff",label:"화면에 남은 것"})}
  <path d="M256 178c22-40 42-44 58-16 10 18 24 14 32-4l32 46z" fill="${c}" opacity=".42"/>
  <circle cx="278" cy="94" r="13" fill="${c}"/>
  ${callout({x:278,y:94,tx:280,ty:40,text:"고른 빛",c:d})}
  ${callout({x:394,y:172,tx:404,ty:224,text:"고른 순간",c:d})}
  <g opacity=".3"><path d="M456 78h158v122H456z" stroke="${d}" stroke-width="3" stroke-dasharray="9 7" fill="none"/>
   ${label({x:535,y:144,text:"잘려 나간 바깥",c:d,size:12.5})}</g>
  ${arrow({x1:444,y1:126,x2:488,y2:126,c:d,w:4,dash:"7 6"})}
  ${label({x:320,y:272,text:"이미지는 누군가가 고른 한 조각이다",c,size:12.5})}</svg>`,
 /* 03 — 연습실과 무대 */
 practice:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:16,w:286,h:208,c:d,fill:"#fff",n:1,label:"연습실 — 엔지니어처럼"})}
  ${person({x:92,y:216,s:1.05,c,pose:"hold",hair:"short",face:"flat"})}
  ${prop.paper(106,128,1.1,c)}
  <rect x="146" y="168" width="140" height="16" rx="4" fill="${d}" opacity=".16"/>
  ${[152,168,184,200,216,232,248,264].map(x=>`<rect x="${x}" y="168" width="8" height="16" rx="2" fill="${d}" opacity=".55"/>`).join("")}
  ${thought({x:140,y:44,w:152,h:54,lines:["여기 한 마디만","스무 번 더"],c:d,size:12,side:"l"})}
  ${panel({x:334,y:16,w:286,h:208,c:d,fill:"#fff",n:2,label:"무대 — 조종사처럼"})}
  ${person({x:406,y:214,s:1,c,pose:"up",hair:"short",face:"glad",brow:"up"})}
  <rect x="470" y="168" width="140" height="16" rx="4" fill="${c}" opacity=".3"/>
  ${bubble({x:456,y:44,w:152,h:54,lines:["지금 눈앞의","이 소리로"],c:d,tail:"bl",size:12})}
  ${arrow({x1:312,y1:120,x2:330,y2:120,c:d,w:5})}
  ${label({x:320,y:256,text:"볼트를 조이는 시간이 있어야 날아오를 수 있다",c,size:12.5})}
  ${label({x:320,y:272,text:"PRACTICE  →  PERFORMANCE",c:d,size:10,op:.55})}</svg>`,
 /* 04 — 치워 준 위험과 마주한 위험 */
 shelter:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:280,h:212,c:d,fill:"#fff",n:1,label:"모든 위험을 치운 성"})}
  ${person({x:84,y:220,s:.98,c,pose:"down",hair:"long",face:"worry",brow:"down"})}
  <g opacity=".32">${[172,220,268].map(x=>`<g transform="translate(${x} 150)"><circle r="17" fill="none" stroke="${d}" stroke-width="3.6" stroke-dasharray="5 5"/><path d="M-12-12 12 12" stroke="${d}" stroke-width="3.6"/></g>`).join("")}</g>
  ${label({x:220,y:190,text:"치워진 물레들",c:d,size:11.5,op:.7})}
  ${panel({x:340,y:18,w:280,h:212,c:d,fill:"#fff",n:2,label:"성 밖으로 나온 뒤"})}
  ${person({x:410,y:220,s:.98,c,pose:"point",hair:"long",face:"glad",brow:"up"})}
  ${bubble({x:486,y:46,w:120,h:44,lines:["내가 정한다"],c:d,tail:"bl",size:13})}
  ${[506,540,574].map(x=>`<path d="M${x} 176l12-24 12 24z" fill="${c}" opacity=".45"/>`).join("")}
  ${label({x:540,y:194,text:"실제 위험",c:d,size:11.5,op:.7})}
  ${arrow({x1:306,y1:124,x2:334,y2:124,c:d,w:5})}
  ${label({x:320,y:266,text:"시험받지 못한 안전은 사람을 자라게 하지 못한다",c,size:12.5})}</svg>`,
 /* 05 — 혼자 읽기에서 말하기로 */
 talk:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${step({x:92,y:34,n:1,c,label:"혼자 읽는다"})}
  ${person({x:92,y:248,s:1.05,c,pose:"hold",hair:"short",face:"flat"})}
  ${prop.book(106,160,1.3,c)}
  ${step({x:320,y:34,n:2,c,label:"말로 꺼낸다"})}
  ${person({x:278,y:246,s:1,c,pose:"open",hair:"bun",face:"oh",brow:"up",look:3})}
  ${person({x:372,y:246,s:1,c,pose:"down",hair:"curly",face:"smile",look:-4,flip:1})}
  ${bubble({x:246,y:78,w:150,h:42,lines:["나는 이렇게 읽었어"],c:d,tail:"bl",size:11.5})}
  ${step({x:548,y:34,n:3,c,label:"이해가 자란다"})}
  ${person({x:548,y:246,s:1,c,pose:"up",hair:"short",face:"glad",brow:"up"})}
  ${prop.bulb(548,86,1.5,c)}
  ${arrow({x1:146,y1:170,x2:206,y2:170,c:d,w:4.5,dash:"10 8"})}
  ${arrow({x1:434,y1:170,x2:494,y2:170,c:d,w:4.5,dash:"10 8"})}
  ${label({x:320,y:272,text:"문학은 하나의 긴 대화이고, 말할 때 비로소 참여하게 된다",c,size:12.5})}</svg>`,
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
  ${person({x:56,y:142,s:.72,c,pose:"point",hair:"short",face:"oh",brow:"up"})}
  ${prop.book(176,96,1.7,c)}
  ${bubble({x:104,y:14,w:126,h:38,lines:["canali → canals"],c:d,tail:"bl",size:12})}</svg>`,
 "02":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${panel({x:10,y:16,w:96,h:76,c:d,fill:"#fff"})}
  <path d="M24 80c14-26 26-28 36-10l22 22z" fill="${c}" opacity=".45"/>
  <circle cx="38" cy="42" r="9" fill="${c}"/>
  ${person({x:186,y:146,s:.72,c,pose:"think",hair:"cap",face:"flat"})}
  ${thought({x:96,y:96,w:130,h:32,lines:["이건 파이프가 아니다"],c:d,size:10.5,side:"l"})}</svg>`,
 "03":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:54,y:140,s:.74,c,pose:"hold",hair:"short",face:"flat"})}
  ${person({x:182,y:140,s:.74,c,pose:"up",hair:"short",face:"glad",brow:"up"})}
  ${arrow({x1:98,y1:78,x2:138,y2:78,c:d,w:4})}
  ${prop.clock(118,32,.85,c)}</svg>`,
 "04":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:58,y:140,s:.72,c,pose:"down",hair:"long",face:"worry",brow:"down"})}
  ${person({x:182,y:140,s:.72,c,pose:"point",hair:"long",face:"glad",brow:"up"})}
  ${arrow({x1:100,y1:76,x2:134,y2:76,c:d,w:4})}
  <g opacity=".35"><circle cx="58" cy="30" r="13" fill="none" stroke="${d}" stroke-width="3" stroke-dasharray="4 4"/>
   <path d="M49 21l18 18" stroke="${d}" stroke-width="3"/></g>
  ${prop.leaf(212,44,.85,c)}</svg>`,
 "05":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:52,y:146,s:.7,c,pose:"open",hair:"bun",face:"smile"})}
  ${person({x:130,y:146,s:.7,c,pose:"down",hair:"short",face:"oh",brow:"up",look:-3})}
  ${person({x:204,y:146,s:.7,c,pose:"down",hair:"curly",face:"glad",flip:1})}
  ${bubble({x:52,y:12,w:132,h:34,lines:["소리 내어 설명하기"],c:d,tail:"bl",size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
