/* Unit 05 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 ritual:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="16" cy="20" r="5.5" fill="${c}" opacity=".95"/><path d="M8 44c0-6 4-10 8-10s8 4 8 10z" fill="${c}" opacity=".95"/><circle cx="32" cy="17" r="6.5" fill="${c}" opacity="1"/><path d="M22 44c0-6 4-10 10-10s10 4 10 10z" fill="${c}" opacity="1"/><circle cx="48" cy="20" r="5.5" fill="${c}" opacity=".95"/><path d="M40 44c0-6 4-10 8-10s8 4 8 10z" fill="${c}" opacity=".95"/>
  <path d="M10 52h44" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></svg>`,
 twoq:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 32h48" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="6 5"/>
  <path d="M20 22c0-4 3-7 6-7s6 3 6 7-6 4-6 8" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="26" cy="26" r="2.4" fill="${c}"/>
  <path d="M36 44h16M44 36v16" stroke="${c}" stroke-width="3.4" stroke-linecap="round" opacity=".55"/>
  <text x="16" y="52" font-size="13" font-weight="800" fill="${c}">is</text></svg>`,
 sophist:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 46V20" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 20L14 8M32 20l18-12" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="14" cy="8" r="4.5" fill="${c}"/>
  <circle cx="50" cy="8" r="4.5" fill="${c}" opacity=".35"/>
  <path d="M18 46h28l-4 10H22z" fill="${c}" opacity=".22" stroke="${c}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M24 33h16" stroke="${c}" stroke-width="2.8" stroke-linecap="round" opacity=".5"/></svg>`,
 stoic:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="14" width="48" height="36" rx="5" stroke="${c}" stroke-width="3"/>
  <path d="M32 14v36" stroke="${c}" stroke-width="3.2"/>
  <circle cx="20" cy="26" r="4" fill="${c}"/><circle cx="20" cy="38" r="4" fill="${c}"/>
  <circle cx="44" cy="26" r="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 3"/>
  <circle cx="44" cy="38" r="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 3"/>
  <path d="M14 56h12M38 56h12" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg>`,
 wanting:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="20" stroke="${c}" stroke-width="3.2" fill="none" stroke-dasharray="7 6"/>
  <path d="M32 12l6 8-12 0z" fill="${c}"/>
  <circle cx="32" cy="32" r="8" fill="${c}" opacity=".28"/>
  <circle cx="32" cy="32" r="3.4" fill="${c}"/>
  <path d="M50 44c4 4 6 8 6 12" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".45"/></svg>`,
};

const scenes = {
 /* 21 — 같은 시각에 같은 동작 */
 ritual:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${[92,196,300,404,508].map((x,i)=>person({x,y:224,s:.92,c,pose:"up",hair:["short","bob","curly","long","cap"][i],face:"smile"})).join("")}
  ${ground({x1:40,x2:600,y:226,c:d,w:3.4})}
  ${prop.clock(568,66,1.5,c)}
  ${label({x:568,y:112,text:"같은 시각",c:d,size:11})}
  ${bubble({x:150,y:24,w:300,h:40,lines:["같은 구절을, 같은 순간에"],c:d,tail:"bl",size:12.5})}
  ${label({x:320,y:254,text:"마음이 동의하기 전에 몸이 먼저 배운다",c:d,size:11.5})}
  ${label({x:320,y:274,text:"믿음이 참인지가 아니라, 그 믿음이 무엇을 하는지를 묻는다",c,size:12})}</svg>`,
 /* 22 — is 와 ought */
 twoq:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:150,y:94,w:340,h:56,c:d,fill:"#fff",label:""})}
  ${label({x:320,y:130,text:"같은 사실",c:d,size:16})}
  ${person({x:86,y:250,s:.9,c,pose:"point",hair:"short",face:"smile"})}
  ${bubble({x:14,y:16,w:196,h:52,lines:["이것은 어떻게","생겨났는가?"],c:d,tail:"bl",size:12})}
  ${person({x:556,y:250,s:.9,c,pose:"point",hair:"bob",face:"smile",flip:1})}
  ${bubble({x:432,y:16,w:196,h:52,lines:["우리는 어떻게","살아야 하는가?"],c:d,tail:"br",size:12})}
  ${arrow({x1:142,y1:122,x2:144,y2:122,c:d,w:1})}
  ${arrow({x1:120,y1:150,x2:186,y2:126,c:d,w:4,dash:"8 6"})}
  ${arrow({x1:520,y1:150,x2:454,y2:126,c:d,w:4,dash:"8 6"})}
  ${tag({x:236,y:190,text:"is",c})}
  ${tag({x:404,y:190,text:"ought",c,fill:"#fff"})}
  <path d="M262 190h114" stroke="${d}" stroke-width="3" stroke-dasharray="7 6"/>
  ${callout({x:320,y:190,tx:320,ty:224,text:"따로 설명이 필요한 한 걸음",c:d})}
  ${label({x:320,y:272,text:"사실의 목록만으로 의무가 생기지는 않는다",c,size:12.5})}</svg>`,
 /* 23 — 이기는 길과 맞는 길 */
 sophist:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:96,y:240,s:.95,c,pose:"open",hair:"short",face:"glad",brow:"up"})}
  ${label({x:96,y:262,text:"말하는 사람",c:d,size:11})}
  <path d="M150 128h108" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
  <path d="M258 128c62-46 130-52 200-52" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M258 136c62 44 130 50 200 50" stroke="${d}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="12 9" opacity=".45"/>
  ${bubble({x:462,y:56,w:154,h:42,lines:["이기는 길"],c:d,fill:c,tail:"none",size:13,bold:1})}
  ${bubble({x:462,y:164,w:154,h:42,lines:["맞는 길"],c:d,fill:"#fff",tail:"none",size:13})}
  ${callout({x:258,y:132,tx:262,ty:212,text:"갈라지는 지점",c:d})}
  ${label({x:320,y:272,text:"이기는 것만 겨눈 기술에는 진실 앞에서 멈출 이유가 없다",c,size:12})}</svg>`,
 /* 24 — 통제할 수 있는 것과 없는 것 */
 stoic:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <path d="M320 26v206" stroke="${d}" stroke-width="4" stroke-dasharray="11 8"/>
  ${panel({x:24,y:26,w:274,h:180,c:d,fill:"#fff",label:"내가 어쩔 수 있는 것"})}
  ${[["내 판단",76],["내 노력",116]].map(([txt,y],i)=>`<circle cx="66" cy="${y}" r="9" fill="${c}"/>${label({x:88,y:y+5,text:txt,c:d,size:13,anchor:"start"})}`).join("")}
  ${person({x:236,y:190,s:.72,c,pose:"open",hair:"short",face:"smile"})}
  ${panel({x:342,y:26,w:274,h:180,c:d,fill:"#fff",label:"내가 어쩔 수 없는 것"})}
  ${[["평판",70],["건강",106],["날씨",142]].map(([txt,y])=>`<circle cx="388" cy="${y}" r="9" fill="none" stroke="${d}" stroke-width="3" stroke-dasharray="3.5 3.5"/>${label({x:410,y:y+5,text:txt,c:d,size:13,anchor:"start",op:.75})}`).join("")}
  ${label({x:320,y:248,text:"덜 원하라는 말이 아니라, 원함을 작동할 자리에 놓으라는 말",c:d,size:11.5})}
  ${label({x:320,y:272,text:"노력은 부르면 대답하는 쪽의 몫이다",c,size:12.5})}</svg>`,
 /* 25 — 채워도 다시 멀어지는 지평선 */
 wanting:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${[[110,206,44],[212,206,72],[314,206,100],[416,206,130],[518,206,160]].map(([x,base,h],i)=>bar({x,base,h,w:66,c,op:[.28,.42,.58,.76,.95][i]})).join("")}
  ${[110,212,314,416,518].map((x,i)=>person({x,y:206-[44,72,100,130,160][i],s:.42,c,pose:"up",hair:"short",face:"glad"})).join("")}
  ${ground({x1:60,x2:590,y:208,c:d,w:4})}
  <path d="M92 150c86-64 200-84 320-72s158 32 208 58" stroke="${d}" stroke-width="3.4" fill="none" stroke-dasharray="10 8" opacity=".45" stroke-linecap="round"/>
  ${arrow({x1:556,y1:126,x2:590,y2:140,c:d,w:3.4,dash:0})}
  ${label({x:300,y:34,text:"지평선도 함께 물러난다",c:d,size:12})}
  ${label({x:320,y:250,text:"채워진 바람은 빈자리를 남기고, 새 바람이 들어온다",c:d,size:11.5})}
  ${label({x:320,y:272,text:"예술과 연민만이 잠시 그 원 밖에 서게 한다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "21":["pair","loop","hourglass","quote","dome"],
 "22":["ask","gear","balance","nope","swap"],
 "23":["quote","pair","swap","balance","nope"],
 "24":["balance","shield","globe","nope","sprout"],
 "25":["loop","heartbeat","palette","pair","hourglass"]
};

const VIG = {
 "21":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${[42,102,162].map((x,i)=>person({x,y:120,s:.62,c,pose:"up",hair:["short","bob","curly"][i],face:"smile"})).join("")}
  ${ground({x1:16,x2:224,y:122,c:d,w:3})}
  ${prop.clock(212,44,.85,c)}
  ${label({x:110,y:142,text:"집합적 열광",c:d,size:11})}</svg>`,
 "22":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({x:64,y:52,text:"is",c})}
  ${tag({x:172,y:52,text:"ought",c,fill:"#fff"})}
  <path d="M96 52h48" stroke="${d}" stroke-width="3.4" stroke-dasharray="5 5"/>
  ${callout({x:120,y:52,tx:120,ty:96,text:"빠져 있는 한 걸음",c:d})}
  ${person({x:190,y:142,s:.5,c,pose:"think",hair:"short",face:"flat"})}</svg>`,
 "23":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:44,y:132,s:.6,c,pose:"open",hair:"short",face:"glad"})}
  <path d="M76 76h44" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
  <path d="M120 76c30-24 62-28 100-28" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M120 82c30 24 62 28 100 28" stroke="${d}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="9 7" opacity=".45"/>
  ${label({x:216,y:42,text:"이김",c:d,size:11,anchor:"end"})}
  ${label({x:216,y:126,text:"맞음",c:d,size:11,anchor:"end",op:.7})}</svg>`,
 "24":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M120 12v120" stroke="${d}" stroke-width="3.4" stroke-dasharray="8 6"/>
  ${[[46,44],[46,84]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`).join("")}
  ${[[172,38],[172,72],[172,106]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${d}" stroke-width="2.8" stroke-dasharray="3 3"/>`).join("")}
  ${label({x:60,y:132,text:"내 몫",c:d,size:11})}
  ${label({x:180,y:132,text:"내 몫 아님",c:d,size:11,op:.7})}</svg>`,
 "25":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${[[36,118,26],[86,118,46],[136,118,70],[186,118,96]].map(([x,base,h],i)=>bar({x,base,h,w:34,c,op:[.3,.48,.7,.95][i]})).join("")}
  ${ground({x1:14,x2:226,y:120,c:d,w:3.4})}
  <path d="M28 82c46-32 118-44 186-14" stroke="${d}" stroke-width="3" fill="none" stroke-dasharray="7 6" opacity=".45" stroke-linecap="round"/>
  ${label({x:120,y:142,text:"쾌락의 쳇바퀴",c:d,size:11})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
