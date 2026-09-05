/* Unit 12 삽화 — 만화 + 인포그래픽 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

/* 이 유닛에서만 쓰는 소품 */
const robot = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-20" y="-10" width="40" height="11" rx="5" fill="${c}"/>
  <path d="M0 -10V-44l28-14" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 -58l11 3M28 -58l1 11" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-44" r="6.5" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  <circle cx="0" cy="-10" r="6" fill="#fff" stroke="${d}" stroke-width="2.6"/></g>`;
const skin = (x, y, w, h, c, t, d) => `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${t}" stroke="${d}" stroke-width="2.6"/>
  <path d="M${x + w / 2} ${y + 14}v${h - 28}" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/></g>`;

const icons = {
 blizzard:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M25 6v36M8 15l34 19M42 15L8 34" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 12l5 5 5-5M20 36l5 5 5-5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M51 58V32m0 0l-6 6m6-6l6 6" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 healing:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M22 8c-6 15-6 33 0 48M42 8c6 15 6 33 0 48" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M18 20h28M18 32h28M18 44h28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="3.4" fill="${c}" opacity=".0"/></svg>`,
 nation:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 5l22 8v20c0 14-10 22-22 26C20 55 10 47 10 33V13z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 5v54" stroke="${c}" stroke-width="2.2" stroke-dasharray="4 4"/>
  <path d="M17 24h11M17 32h11M17 40h9" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="44" cy="22" r="3.6" fill="${c}"/><circle cx="38" cy="38" r="3.6" fill="${c}"/><circle cx="50" cy="38" r="3.6" fill="${c}"/>
  <path d="M44 26v5M39 34l4-3M49 34l-4-3" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
 cobot:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="24" y="27" width="18" height="17" rx="3" fill="${c}" opacity=".28" stroke="${c}" stroke-width="2.8"/>
  <path d="M7 55V36l10-10 8 10" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="7" cy="36" r="3.6" fill="${c}"/><circle cx="17" cy="26" r="3.6" fill="${c}"/>
  <rect x="1" y="55" width="14" height="5" rx="2.5" fill="${c}"/>
  <path d="M58 56V41c0-3-2-5-5-5h-9" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="36" r="4" fill="${c}"/></svg>`,
 needs:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M14 22h36l-4 34H18z" fill="${c}" opacity=".2" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M24 22v-4a8 8 0 0 1 16 0v4" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M28 34c0-3.4 2.4-6 6-6s6 2.6 6 6-4.6 4.4-4.6 7.6" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="35.4" cy="49" r="2.5" fill="${c}"/></svg>`,
};

const scenes = {
 blizzard:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:190,h:190,c:d,fill:"#fff",n:1,label:"공기가 머금는 물"})}
  <rect x="44" y="72" width="60" height="66" rx="8" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  <rect x="126" y="72" width="60" height="66" rx="8" fill="${t}" stroke="${d}" stroke-width="2.6"/>
  ${[[59,95],[89,95],[74,118]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.5" ry="6" fill="${c}"/>`).join("")}
  ${[[139,90],[154,90],[169,90],[139,110],[154,110],[169,110],[139,130],[154,130]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.5" ry="6" fill="${c}"/>`).join("")}
  ${label({x:74,y:158,text:"찬 공기",c:d,size:10.5})}
  ${label({x:156,y:158,text:"따뜻한 공기",c:d,size:10.5})}
  ${panel({x:225,y:18,w:190,h:190,c:d,fill:"#fff",n:2,label:"눈 오는 날 수"})}
  ${bar({x:282,base:160,h:88,c,op:.5,cap:"예전",capc:d,w:34})}
  ${bar({x:360,base:160,h:52,c,cap:"지금",capc:d,w:34})}
  ${ground({x1:252,x2:392,y:160,c:d,w:3})}
  ${arrow({x1:304,y1:56,x2:346,y2:96,c:d,w:3.4})}
  ${panel({x:430,y:18,w:190,h:190,c:d,fill:"#fff",n:3,label:"한 번에 오는 눈"})}
  ${bar({x:487,base:160,h:48,c,op:.5,cap:"예전",capc:d,w:34})}
  ${bar({x:565,base:160,h:92,c,cap:"지금",capc:d,w:34})}
  ${ground({x1:457,x2:597,y:160,c:d,w:3})}
  ${arrow({x1:509,y1:98,x2:551,y2:54,c:d,w:3.4})}
  ${label({x:320,y:270,text:"눈 오는 날은 줄고, 한 번에 오는 눈은 많아진다",c,size:12.5})}</svg>`,
 healing:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:190,h:190,c:d,fill:"#fff",n:1,label:"붙이는 것은 몸이다"})}
  ${skin(48,64,114,92,c,t,d)}
  ${arrow({x1:70,y1:110,x2:96,y2:110,c:d,w:3.4})}
  ${arrow({x1:140,y1:110,x2:114,y2:110,c:d,w:3.4})}
  ${label({x:105,y:180,text:"세포가 안쪽으로",c:d,size:10.5})}
  ${panel({x:225,y:18,w:190,h:190,c:d,fill:"#fff",n:2,label:"의학은 곁에서 돕는다"})}
  ${person({x:272,y:186,s:.78,c,pose:"open",hair:"cap",face:"smile"})}
  ${skin(330,72,72,74,c,t,d)}
  <path d="M354 92h24M354 109h24M354 126h24" stroke="${d}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
  ${label({x:320,y:180,text:"가장자리를 맞대 준다",c:d,size:10})}
  ${panel({x:430,y:18,w:190,h:190,c:d,fill:"#fff",n:3,label:"두 가지 목표"})}
  ${tag({x:482,y:70,text:"완치",c})}
  ${label({x:558,y:74,text:"병을 없앤다",c:d,size:9.5,op:.85})}
  ${tag({x:482,y:118,text:"치유",c,fill:"#fff"})}
  ${label({x:558,y:122,text:"삶을 되돌린다",c:d,size:9.5,op:.85})}
  ${label({x:525,y:176,text:"둘 다 의학의 질문이다",c:d,size:10.5})}
  ${label({x:320,y:270,text:"몸이 붙이고, 의학은 그 일이 되게 돕는다",c,size:12.5})}</svg>`,
 nation:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"법을 받아들이면 들어온다"})}
  ${prop.paper(96,110,1.7,c)}
  ${arrow({x1:140,y1:110,x2:180,y2:110,c:d,w:3.6})}
  ${person({x:214,y:190,s:.8,c,pose:"open",hair:"bob",face:"glad",brow:"up"})}
  ${person({x:262,y:190,s:.8,c,pose:"down",hair:"cap",face:"smile",flip:1})}
  ${tag({x:157,y:52,text:"시민적",c})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"혈통으로 정하면 남는 사람"})}
  <path d="M552 70v122" stroke="${d}" stroke-width="3" stroke-dasharray="7 5"/>
  ${label({x:552,y:62,text:"국경",c:d,size:10,op:.85})}
  ${person({x:440,y:190,s:.66,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:494,y:190,s:.66,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:588,y:190,s:.66,c,pose:"down",hair:"short",face:"worry",brow:"down"})}
  ${tag({x:456,y:52,text:"종족적",c,fill:"#fff"})}
  ${label({x:320,y:270,text:"어떤 국경도 사람들을 깔끔하게 나누지 못한다",c,size:12.5})}</svg>`,
 cobot:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"옛 이야기"})}
  ${robot(112,188,1,c,d)}
  ${person({x:204,y:190,s:.78,c,pose:"down",hair:"short",face:"flat",brow:"down"})}
  ${arrow({x1:238,y1:118,x2:278,y2:118,c:d,w:3.4})}
  ${label({x:258,y:104,text:"떠난다",c:d,size:10,op:.85})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"지금 벌어지는 일"})}
  <rect x="378" y="184" width="212" height="10" rx="5" fill="${c}" opacity=".28"/>
  ${robot(432,184,.88,c,d)}
  ${person({x:552,y:184,s:.8,c,pose:"point",hair:"bob",face:"smile",flip:1})}
  <rect x="456" y="104" width="46" height="36" rx="5" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  ${label({x:432,y:204,text:"힘 · 반복",c:d,size:10})}
  ${label({x:552,y:204,text:"판단",c:d,size:10})}
  ${label({x:320,y:270,text:"기계가 절반을 맡으면, 남은 절반은 누가 정하는가",c,size:12.5})}</svg>`,
 needs:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${ground({x1:64,x2:576,y:136,c:d,w:3.4})}
  ${step({x:110,y:136,n:"1",c:d,r:16,label:"1900",below:1})}
  ${step({x:320,y:136,n:"2",c:d,r:16,label:"1920년대",below:1})}
  ${step({x:530,y:136,n:"3",c:d,r:16,label:"오늘",below:1})}
  ${bubble({x:74,y:38,w:150,h:36,lines:["문제가 아니었다"],c:d,tail:"bl",size:11})}
  ${bubble({x:284,y:38,w:150,h:36,lines:["이름이 붙는다"],c:d,tail:"bl",size:11})}
  ${bubble({x:416,y:38,w:150,h:36,lines:["필요가 된다"],c:d,tail:"br",size:11})}
  ${stat({x:320,y:212,big:"×80",small:"7년 만에 늘어난 매출",c,size:27})}
  ${label({x:320,y:270,text:"어떤 필요에는 생일이 있다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "56":["globe","dome","ruler","warn","loop"],
 "57":["heartbeat","sprout","balance","hourglass","pair"],
 "58":["map","pair","alone","balance","zipper"],
 "59":["gear","cable","pair","wrench","warn"],
 "60":["tag","coin","spark","eye","ask"]
};

const VIG = {
 "56":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${bar({x:56,base:104,h:74,c,op:.5,cap:"예전",capc:d,w:28})}
  ${bar({x:104,base:104,h:44,c,cap:"지금",capc:d,w:28})}
  ${bar({x:164,base:104,h:38,c,op:.5,cap:"예전",capc:d,w:28})}
  ${bar({x:212,base:104,h:74,c,cap:"지금",capc:d,w:28})}
  <path d="M40 104h84M148 104h84" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/>
  ${label({x:82,y:140,text:"눈 오는 날",c:d,size:10})}
  ${label({x:190,y:140,text:"한 번의 눈",c:d,size:10})}</svg>`,
 "57":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${skin(64,30,112,80,c,t,d)}
  ${arrow({x1:82,y1:70,x2:108,y2:70,c:d,w:3.2})}
  ${arrow({x1:158,y1:70,x2:132,y2:70,c:d,w:3.2})}
  ${label({x:120,y:136,text:"닫는 것은 몸이다",c:d,size:10.5})}</svg>`,
 "58":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M170 22v92" stroke="${d}" stroke-width="3" stroke-dasharray="6 5"/>
  ${label({x:170,y:16,text:"국경",c:d,size:10,op:.85})}
  ${person({x:66,y:112,s:.52,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:118,y:112,s:.52,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:204,y:112,s:.52,c,pose:"down",hair:"short",face:"worry",brow:"down"})}
  ${label({x:120,y:140,text:"같은 사람들, 다른 쪽",c:d,size:10.5})}</svg>`,
 "59":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="30" y="110" width="180" height="9" rx="4.5" fill="${c}" opacity=".28"/>
  ${robot(72,110,.72,c,d)}
  ${person({x:168,y:110,s:.58,c,pose:"point",hair:"bob",face:"smile"})}
  <rect x="106" y="52" width="34" height="26" rx="4" fill="#fff" stroke="${d}" stroke-width="2.4"/>
  ${label({x:120,y:140,text:"나란히 선다",c:d,size:10.5})}</svg>`,
 "60":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${ground({x1:34,x2:206,y:80,c:d,w:3})}
  ${step({x:52,y:80,n:"1",c:d,r:12,label:"1900",below:1})}
  ${step({x:120,y:80,n:"2",c:d,r:12,label:"1920s",below:1})}
  ${step({x:188,y:80,n:"3",c:d,r:12,label:"오늘",below:1})}
  ${label({x:120,y:36,text:"필요가 생긴 자리",c:d,size:11})}
  ${label({x:120,y:140,text:"어떤 필요에는 생일이 있다",c:d,size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
