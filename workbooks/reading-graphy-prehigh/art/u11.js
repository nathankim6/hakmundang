/* Unit 11 삽화 — 만화 + 인포그래픽 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

/* 이 유닛에서만 쓰는 소품 */
const boat = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-16 0h32l-7 11h-18z" fill="${c}"/>
  <path d="M1 -2v-20l13 10z" fill="${c}" opacity=".55"/>
  <path d="M0 0v-21" stroke="${d}" stroke-width="2.2" stroke-linecap="round"/></g>`;
const mouse = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M22 -4q12 2 11 -13" stroke="${d}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="2" cy="-12" rx="21" ry="13" fill="#fff" stroke="${d}" stroke-width="2.4"/>
  <circle cx="-16" cy="-25" r="8" fill="${c}" opacity=".4" stroke="${d}" stroke-width="2.2"/>
  <ellipse cx="-21" cy="-12" rx="10" ry="8" fill="#fff" stroke="${d}" stroke-width="2.4"/>
  <circle cx="-24" cy="-15" r="1.8" fill="${d}"/>
  <circle cx="-31" cy="-10" r="1.9" fill="${d}"/>
  <path d="M-29 -6l-7 3M-29 -9l-8 -1" stroke="${d}" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="-7" cy="0" rx="5.5" ry="3.2" fill="#fff" stroke="${d}" stroke-width="2"/>
  <ellipse cx="13" cy="0" rx="5.5" ry="3.2" fill="#fff" stroke="${d}" stroke-width="2"/></g>`;
const heart = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 24c-13-10-19-15-19-22 0-6 4-10 10-10 4 0 7 2 9 5 2-3 5-5 9-5 6 0 10 4 10 10 0 7-6 12-19 22z" fill="${c}" opacity=".85"/></g>`;

const icons = {
 commons:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 24v28M20 24v28M32 24v28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M4 32h32M4 42h32" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M44 30c8-6 16-3 17 8-1 11-9 14-17 8z" fill="${c}" opacity=".28" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M44 30l-7-6v20l7-6z" fill="${c}"/>
  <circle cx="54" cy="35" r="1.8" fill="${c}"/></svg>`,
 lake:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M14 10v12M32 8v14M50 10v12" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M14 27l-5-7h10zM32 27l-5-7h10zM50 27l-5-7h10z" fill="${c}"/>
  <ellipse cx="32" cy="44" rx="25" ry="13" fill="${c}" opacity=".24" stroke="${c}" stroke-width="3"/>
  <path d="M18 44q7-5 14 0t14 0" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
 mars:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="34" r="25" stroke="${c}" stroke-width="2.2" stroke-dasharray="5 5"/>
  <circle cx="32" cy="34" r="17" fill="${c}" opacity=".22" stroke="${c}" stroke-width="3"/>
  <path d="M22 21a17 17 0 0 1 20 0q-10 5-20 0z" fill="${c}" opacity=".55"/>
  <path d="M22 47a17 17 0 0 0 20 0q-10-5-20 0z" fill="${c}" opacity=".55"/>
  <path d="M25 34h14" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/></svg>`,
 painres:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="13" r="8" fill="${c}"/>
  <path d="M32 21v11M32 32L16 43M32 32l16 11" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="5" y="45" width="21" height="14" rx="4" stroke="${c}" stroke-width="2.8"/>
  <rect x="38" y="45" width="21" height="14" rx="4" fill="${c}" opacity=".28" stroke="${c}" stroke-width="2.8"/></svg>`,
 empathy:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="24" stroke="${c}" stroke-width="3"/>
  <path d="M32 8a24 24 0 0 1 0 48z" fill="${c}" opacity=".22"/>
  <path d="M32 8v48" stroke="${c}" stroke-width="2.4" stroke-dasharray="5 4"/>
  <path d="M32 44c-11-8-16-13-16-19 0-5 4-8 8-8 3 0 6 2 8 4 2-2 5-4 8-4 4 0 8 3 8 8 0 6-5 11-16 19z" fill="${c}" opacity=".9"/></svg>`,
};

const scenes = {
 commons:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:190,h:190,c:d,fill:"#fff",n:1,label:"울타리가 있는 밭"})}
  <rect x="38" y="94" width="108" height="52" rx="4" fill="${t}" stroke="${d}" stroke-width="2.6"/>
  <path d="M50 106h84M50 118h84M50 130h84" stroke="${d}" stroke-width="2" stroke-linecap="round" opacity=".38"/>
  <path d="M34 142v28M62 142v28M90 142v28M118 142v28M146 142v28" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M28 150h124M28 162h124" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/>
  ${person({x:182,y:184,s:.56,c,pose:"down",hair:"short",face:"smile"})}
  ${tag({x:104,y:64,text:"주인 있음",c})}
  ${label({x:90,y:192,text:"손해 보는 사람이 있다",c:d,size:9.5,op:.8})}
  ${panel({x:225,y:18,w:190,h:190,c:d,fill:"#fff",n:2,label:"울타리가 없는 바다"})}
  <path d="M243 138q22-10 44 0t44 0t44 0" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M243 158q22-10 44 0t44 0t44 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>
  ${boat(280,132,.8,c,d)}${boat(322,132,.8,c,d)}${boat(364,132,.8,c,d)}
  ${tag({x:320,y:66,text:"주인 없음",c})}
  ${label({x:320,y:186,text:"모두가 한 마리 더",c:d,size:10,op:.8})}
  ${panel({x:430,y:18,w:190,h:190,c:d,fill:"#fff",n:3,label:"쓰는 사람이 만든 규칙"})}
  ${prop.paper(525,74,1.15,c)}
  ${person({x:474,y:184,s:.6,c,pose:"open",hair:"short",face:"smile"})}
  ${person({x:525,y:184,s:.6,c,pose:"point",hair:"bob",face:"glad"})}
  ${person({x:576,y:184,s:.6,c,pose:"open",hair:"curly",face:"smile",flip:1})}
  ${label({x:525,y:198,text:"서로가 서로를 본다",c:d,size:10,op:.8})}
  ${label({x:320,y:270,text:"울타리가 없을 때, 규칙이 그 자리를 대신할 수 있다",c,size:12.5})}</svg>`,
 lake:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:322,h:190,c:d,fill:"#fff",n:1,label:"원인은 거리에서 온다"})}
  <path d="M46 74h274" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>
  ${label({x:100,y:64,text:"잔디 비료",c:d,size:10,op:.85})}
  ${label({x:183,y:64,text:"도로 먼지",c:d,size:10,op:.85})}
  ${label({x:266,y:64,text:"개 배설물",c:d,size:10,op:.85})}
  ${arrow({x1:100,y1:82,x2:146,y2:118,c:d,w:3.2})}
  ${arrow({x1:183,y1:82,x2:183,y2:118,c:d,w:3.2})}
  ${arrow({x1:266,y1:82,x2:220,y2:118,c:d,w:3.2})}
  <path d="M64 132q119-14 238 0q8 40-119 44q-127-4-119-44z" fill="${c}" opacity=".34" stroke="${d}" stroke-width="2.8"/>
  <path d="M112 152q14-7 28 0t28 0t28 0t28 0" stroke="${d}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>
  ${label({x:183,y:194,text:"호수는 마지막에 받는다",c:d,size:10.5})}
  ${panel({x:364,y:18,w:254,h:190,c:d,fill:"#fff",n:2,label:"맑은 상태가 이어진 기간"})}
  ${bar({x:434,base:172,h:34,c,op:.45,cap:"준설",capc:d,w:34})}
  ${bar({x:534,base:172,h:112,c,cap:"거리 처방",capc:d,w:34})}
  ${ground({x1:396,x2:592,y:172,c:d,w:3})}
  ${label({x:492,y:60,text:"보이지 않는 쪽이 오래갔다",c:d,size:11})}
  ${label({x:320,y:270,text:"물을 고치는 대신 물이 오는 길을 고쳤다",c,size:12.5})}</svg>`,
 mars:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"언 이산화탄소를 되돌린다"})}
  <circle cx="157" cy="118" r="72" stroke="${d}" stroke-width="2.4" stroke-dasharray="6 6"/>
  <circle cx="157" cy="118" r="50" fill="${t}" stroke="${d}" stroke-width="3"/>
  <path d="M115 92a50 50 0 0 1 84 0q-42 14-84 0z" fill="${c}" opacity=".45"/>
  <path d="M115 144a50 50 0 0 0 84 0q-42-14-84 0z" fill="${c}" opacity=".45"/>
  ${arrow({x1:157,y1:70,x2:157,y2:44,c:d,w:3.4})}
  ${arrow({x1:157,y1:166,x2:157,y2:192,c:d,w:3.4})}
  ${tag({x:157,y:118,text:"CO₂",c})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"기압은 어디까지 오르나"})}
  ${bar({x:400,base:176,h:4,c,op:.45,cap:"지금 0.6%",capc:d,w:32})}
  ${bar({x:483,base:176,h:13,c,op:.7,cap:"최대 7%",capc:d,w:32})}
  ${bar({x:566,base:176,h:116,c,cap:"숨쉬기 100%",capc:d,w:32})}
  ${ground({x1:372,x2:596,y:176,c:d,w:3})}
  ${label({x:483,y:56,text:"모두 방출해도 이만큼",c:d,size:11})}
  ${label({x:320,y:270,text:"더 두꺼운 공기와 숨 쉴 수 있는 공기는 다른 문제다",c,size:12.5})}</svg>`,
 painres:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${tag({x:320,y:44,text:"신경계가 우리와 닮았다",c,size:12})}
  ${arrow({x1:284,y1:60,x2:190,y2:104,c:d,w:3.6})}
  ${arrow({x1:356,y1:60,x2:450,y2:104,c:d,w:3.6})}
  ${panel({x:52,y:110,w:224,h:96,c:d,fill:"#fff",n:1,label:"연구에 쓸모가 있다"})}
  ${mouse(132,182,1.1,c,d)}
  ${prop.paper(226,150,.95,c)}
  ${panel({x:364,y:110,w:224,h:96,c:d,fill:"#fff",n:2,label:"고통을 느낀다"})}
  ${mouse(444,182,1.1,c,d)}
  <path d="M524 132h14l-9 16h13l-22 30 7-22h-11z" fill="${c}"/>
  ${label({x:320,y:270,text:"쓸모와 책임이 같은 사실에서 나온다",c,size:12.5})}</svg>`,
 empathy:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"기억되는 절반"})}
  ${person({x:106,y:196,s:.88,c,pose:"point",hair:"short",face:"flat",brow:"down"})}
  ${person({x:214,y:196,s:.88,c,pose:"point",hair:"cap",face:"flat",brow:"down",flip:1})}
  ${tag({x:157,y:52,text:"경쟁",c})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"함께 쓰인 절반"})}
  ${person({x:430,y:196,s:.88,c,pose:"open",hair:"bob",face:"smile"})}
  ${person({x:540,y:196,s:.88,c,pose:"down",hair:"curly",face:"glad",brow:"up",flip:1})}
  ${heart(485,96,1.1,c)}
  ${tag({x:483,y:52,text:"공감",c,fill:"#fff"})}
  ${label({x:320,y:270,text:"다윈은 두 절반을 함께 썼다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "51":["balance","handshake","warn","map","shield"],
 "52":["pipe","wilt","loop","sprout","eye"],
 "53":["globe","dome","hourglass","scope","nope"],
 "54":["heartbeat","balance","shield","ask","warn"],
 "55":["pair","heartbeat","books","swap","sprout"]
};

const VIG = {
 "51":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="18" y="72" width="88" height="42" rx="4" fill="${t}" stroke="${d}" stroke-width="2.6"/>
  <path d="M18 64v18M46 64v18M74 64v18M102 64v18" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M14 68h96M14 76h96" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M128 96q18-9 36 0t36 0" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M128 112q18-9 36 0t36 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>
  ${boat(154,92,.72,c,d)}${boat(198,92,.72,c,d)}
  ${label({x:62,y:136,text:"울타리 있음",c:d,size:10.5})}
  ${label({x:176,y:136,text:"없음",c:d,size:10.5})}</svg>`,
 "52":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M24 36h192" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  ${label({x:120,y:26,text:"거리",c:d,size:10.5,op:.85})}
  ${arrow({x1:70,y1:44,x2:98,y2:72,c:d,w:3.2})}
  ${arrow({x1:120,y1:44,x2:120,y2:72,c:d,w:3.2})}
  ${arrow({x1:170,y1:44,x2:142,y2:72,c:d,w:3.2})}
  <path d="M46 86q74-12 148 0q6 30-74 32q-80-2-74-32z" fill="${c}" opacity=".34" stroke="${d}" stroke-width="2.6"/>
  <path d="M78 102q10-6 20 0t20 0t20 0" stroke="${d}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>
  ${label({x:120,y:142,text:"호수는 마지막에 받는다",c:d,size:10.5})}</svg>`,
 "53":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${bar({x:52,base:110,h:4,c,op:.45,cap:"0.6%",capc:d,w:26})}
  ${bar({x:120,base:110,h:12,c,op:.7,cap:"7%",capc:d,w:26})}
  ${bar({x:188,base:110,h:84,c,cap:"100%",capc:d,w:26})}
  <path d="M28 110h188" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  ${label({x:120,y:142,text:"두꺼워져도 모자란다",c:d,size:10.5})}</svg>`,
 "54":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({x:120,y:30,text:"닮았다",c})}
  ${arrow({x1:98,y1:48,x2:64,y2:80,c:d,w:3.2})}
  ${arrow({x1:142,y1:48,x2:176,y2:80,c:d,w:3.2})}
  ${tag({x:56,y:100,text:"쓸모",c,fill:"#fff"})}
  ${tag({x:184,y:100,text:"고통",c,fill:"#fff"})}
  ${label({x:120,y:140,text:"한 사실에서 둘이 나온다",c:d,size:10.5})}</svg>`,
 "55":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <circle cx="120" cy="64" r="44" stroke="${d}" stroke-width="3"/>
  <path d="M120 20a44 44 0 0 1 0 88z" fill="${c}" opacity=".24"/>
  <path d="M120 20v88" stroke="${d}" stroke-width="2.6" stroke-dasharray="5 4"/>
  ${label({x:94,y:68,text:"경쟁",c:d,size:11})}
  ${label({x:148,y:68,text:"공감",c:d,size:11})}
  ${label({x:120,y:140,text:"절반만 읽어 왔다",c:d,size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
