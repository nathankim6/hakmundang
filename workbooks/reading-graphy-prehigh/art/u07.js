/* Unit 07 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 coach:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M14 20h22a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H24l-10 8V40a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" fill="${c}" opacity=".25"/>
  <circle cx="46" cy="18" r="8" fill="${c}"/>
  <path d="M34 52c0-9 6-15 12-15s12 6 12 15" fill="${c}" opacity=".55"/>
  <path d="M18 28h14M18 34h9" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 esports:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M18 20h28c7 0 11 6 12 14s-2 12-8 12c-4 0-6-3-9-6H31c-3 3-5 6-9 6-6 0-9-4-8-12s5-14 12-14z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 34h10M25 29v10" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="42" cy="32" r="3" fill="${c}"/><circle cx="49" cy="37" r="3" fill="${c}"/>
  <path d="M10 12h6M48 12h6M20 8h24" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".4"/></svg>`,
 synth:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="16" width="48" height="32" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M8 32h24" stroke="${c}" stroke-width="3"/>
  <path d="M32 16v32" stroke="${c}" stroke-width="3" stroke-dasharray="5 4"/>
  <circle cx="20" cy="25" r="4" fill="${c}"/>
  <path d="M12 44c4-8 10-9 14-3" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="25" r="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 3"/>
  <path d="M36 44c4-8 10-9 14-3" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="4 4"/></svg>`,
 longtail:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 50V16M8 50h48" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <rect x="13" y="18" width="7" height="32" rx="2" fill="${c}"/>
  <rect x="23" y="34" width="7" height="16" rx="2" fill="${c}" opacity=".6"/>
  <rect x="33" y="42" width="7" height="8" rx="2" fill="${c}" opacity=".4"/>
  <rect x="43" y="45" width="6" height="5" rx="2" fill="${c}" opacity=".3"/>
  <rect x="52" y="46" width="5" height="4" rx="2" fill="${c}" opacity=".22"/></svg>`,
 boxoffice:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 22h48v26a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M10 22l8-10h32l-8 10z" fill="${c}" opacity=".28"/>
  <path d="M22 12l-8 10M34 12l-8 10M46 12l-8 10" stroke="${c}" stroke-width="2.6"/>
  <circle cx="32" cy="38" r="8" stroke="${c}" stroke-width="3"/>
  <path d="M32 33v10M29 36h6M29 41h6" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
};

const scenes = {
 /* 31 — 말하는 코치와 기다리는 코치 */
 coach:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:274,h:196,c:d,fill:"#fff",n:1,label:"계속 알려 주는 코치"})}
  ${person({x:84,y:204,s:.88,c,pose:"point",hair:"cap",face:"oh",brow:"down"})}
  ${person({x:236,y:204,s:.88,c,pose:"down",hair:"short",face:"flat",flip:1})}
  ${[[136,44],[136,68],[136,92]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="${[120,96,132][i]}" height="18" rx="7" fill="${c}" opacity="${[.85,.65,.5][i]}"/>`).join("")}
  ${label({x:157,y:238,text:"판단이 바깥에 머문다",c:d,size:11,op:.75})}
  ${panel({x:346,y:20,w:274,h:196,c:d,fill:"#fff",n:2,label:"기다리는 코치"})}
  ${person({x:410,y:204,s:.88,c,pose:"down",hair:"cap",face:"smile"})}
  ${person({x:562,y:204,s:.88,c,pose:"think",hair:"short",face:"oh",brow:"up",flip:1})}
  ${thought({x:452,y:44,w:150,h:44,lines:["방금 뭐가 달랐지?"],c:d,size:11,side:"r"})}
  ${label({x:483,y:238,text:"판단이 안에서 자란다",c:d,size:11,op:.75})}
  ${label({x:320,y:270,text:"무엇을 말할지만이 아니라 언제 말할지를 고른다",c,size:12.5})}</svg>`,
 /* 32 — 경기장 하나, 화면 수백만 */
 esports:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:236,y:74,w:168,h:104,c:d,fill:"#fff",label:"한 경기"})}
  ${person({x:278,y:162,s:.6,c,pose:"hold",hair:"short",face:"flat"})}
  ${person({x:362,y:162,s:.6,c,pose:"hold",hair:"bob",face:"flat",flip:1})}
  ${[[24,30],[24,88],[24,146],[104,30],[104,88],[104,146],[452,30],[452,88],[452,146],[532,30],[532,88],[532,146]].map(([x,y],i)=>`<g><rect x="${x}" y="${y}" width="64" height="42" rx="6" fill="#fff" stroke="${d}" stroke-width="2.2"/><rect x="${x+5}" y="${y+5}" width="54" height="32" rx="3" fill="${c}" opacity="${.75-(i%3)*.16}"/></g>`).join("")}
  ${arrow({x1:200,y1:126,x2:228,y2:126,c:d,w:3.6,dash:"6 5"})}
  ${arrow({x1:440,y1:126,x2:412,y2:126,c:d,w:3.6,dash:"6 5"})}
  ${label({x:320,y:212,text:"방 없이도 커진 구경꾼의 원",c:d,size:11.5})}
  ${label({x:320,y:258,text:"더 쓸모 있는 질문 — 그 게임을 누가 소유하는가",c:d,size:11.5})}
  ${label({x:320,y:276,text:"축구 리그는 발명자의 허락이 필요 없다",c,size:12})}</svg>`,
 /* 33 — 찍힌 것과 채워 넣은 것 */
 synth:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <rect x="24" y="30" width="592" height="176" rx="14" fill="#fff" stroke="${d}" stroke-width="3.2"/>
  <path d="M320 30v176" stroke="${d}" stroke-width="3.2" stroke-dasharray="10 8"/>
  ${label({x:172,y:22,text:"실제로 찍은 사람",c:d,size:12})}
  ${label({x:468,y:22,text:"채워 넣은 사람",c:d,size:12})}
  ${[86,150,214,278].map((x,i)=>person({x,y:190,s:.62,c,pose:"down",hair:["short","bob","curly","cap"][i],face:"smile"})).join("")}
  <g opacity=".34">${[364,420,476,532,588].map((x,i)=>person({x,y:190,s:.62,c:"#9aa0a6",pose:"down",hair:["short","long","curly","short","bob"][i],face:"flat"})).join("")}</g>
  ${ground({x1:44,x2:600,y:192,c:d,w:3})}
  ${bubble({x:394,y:44,w:196,h:40,lines:["동의를 받았는가?"],c:d,tail:"bl",size:12})}
  ${label({x:320,y:238,text:"결정이 현장에서 나중의 방으로 옮겨 갔다",c:d,size:11.5})}
  ${label({x:320,y:268,text:"자기 작업을 감추는 도구일수록 규칙이 더 중요해진다",c,size:12})}</svg>`,
 /* 34 — 긴 꼬리와 좁은 문 */
 longtail:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <path d="M62 212V44M62 212h530" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  ${Array.from({length:22},(_,i)=>{const h=[150,96,64,46,36,29,25,22,20,18,16,15,14,13,12,12,11,11,10,10,9,9][i];
   return bar({x:74+i*24,base:212,h,w:18,c,op:(1-i*0.035).toFixed(2)})}).join("")}
  ${person({x:96,y:44,s:.34,c,pose:"up",hair:"short",face:"glad"})}
  ${callout({x:74,y:70,tx:180,ty:56,text:"머리가 재생의 대부분을 가져간다",c:d,anchor:"start"})}
  ${label({x:420,y:246,text:"꼬리는 누구 상상보다 길다",c:d,size:11.5})}
  ${bubble({x:400,y:96,w:210,h:44,lines:["올리기는 쉽고, 발견되기는 어렵다"],c:d,tail:"none",size:11.5})}
  ${label({x:320,y:274,text:"접근과 기회는 서로 다른 것이었다",c,size:12.5})}</svg>`,
 /* 35 — 소수가 나머지를 먹여 살린다 */
 boxoffice:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${ground({x1:56,x2:600,y:216,c:d,w:3.4})}
  <path d="M56 140h544" stroke="${d}" stroke-width="2.6" stroke-dasharray="8 7" opacity=".6"/>
  ${label({x:596,y:132,text:"손익분기",c:d,size:10.5,anchor:"end",op:.75})}
  ${[[92,24],[136,32],[180,18],[224,34],[268,150],[312,26],[356,30],[400,20],[444,110],[488,28],[532,22],[576,34]].map(([x,h],i)=>{
   const big=h>100; return bar({x,base:big?216:216,h:big?h+62:h,w:32,c,op:big?1:.3})}).join("")}
  ${[268,444].map(x=>`<path d="M${x-16} 140h32" stroke="${d}" stroke-width="2" opacity=".4"/>`).join("")}
  ${person({x:268,y:216-214,s:.3,c,pose:"up",hair:"short",face:"glad"})}
  ${label({x:320,y:248,text:"몇 편이 나머지 모두를 감당한다",c:d,size:11.5})}
  ${bubble({x:64,y:24,w:180,h:40,lines:["아무도 모른다"],c:d,tail:"none",size:12})}
  ${label({x:320,y:274,text:"반복은 상상력의 실패라기보다 구조에 대한 반응이다",c,size:12})}</svg>`,
};

const STRIP = {
 "31":["quote","hourglass","pair","nope","sprout"],
 "32":["pair","frame","globe","balance","tag"],
 "33":["camera","swap","spark","shield","ask"],
 "34":["books","ruler","eye","tag","balance"],
 "35":["frame","balance","hourglass","spark","nope"]
};

const VIG = {
 "31":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:48,y:130,s:.58,c,pose:"down",hair:"cap",face:"smile"})}
  ${person({x:192,y:130,s:.58,c,pose:"think",hair:"short",face:"oh",brow:"up",flip:1})}
  ${thought({x:76,y:16,w:110,h:34,lines:["뭐가 달랐지?"],c:d,size:10.5,side:"r"})}
  ${label({x:120,y:146,text:"침묵이 만드는 자리",c:d,size:10.5})}</svg>`,
 "32":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${panel({x:82,y:44,w:76,h:52,c:d,fill:"#fff"})}
  ${person({x:120,y:90,s:.36,c,pose:"down",hair:"short",face:"flat"})}
  ${[[10,24],[10,66],[10,108],[186,24],[186,66],[186,108]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="44" height="28" rx="5" fill="${c}" opacity="${.75-(i%3)*.18}"/>`).join("")}
  ${label({x:120,y:132,text:"규칙은 누가 바꾸나",c:d,size:10.5})}</svg>`,
 "33":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M120 16v112" stroke="${d}" stroke-width="3" stroke-dasharray="7 6"/>
  ${[40,84].map((x,i)=>person({x,y:118,s:.5,c,pose:"down",hair:["short","bob"][i],face:"smile"})).join("")}
  <g opacity=".34">${[154,198].map((x,i)=>person({x,y:118,s:.5,c:"#9aa0a6",pose:"down",hair:["curly","short"][i],face:"flat"})).join("")}</g>
  ${ground({x1:16,x2:224,y:120,c:d,w:2.6})}
  ${label({x:60,y:140,text:"찍힌 사람",c:d,size:10})}${label({x:178,y:140,text:"채워진 사람",c:d,size:10,op:.7})}</svg>`,
 "34":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M20 122V20M20 122h206" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  ${Array.from({length:14},(_,i)=>{const h=[92,56,36,26,20,16,14,12,11,10,9,9,8,8][i];
   return bar({x:32+i*14,base:122,h,w:11,c,op:(1-i*.05).toFixed(2)})}).join("")}
  ${label({x:120,y:142,text:"긴 꼬리, 가파른 머리",c:d,size:10.5})}</svg>`,
 "35":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${ground({x1:14,x2:226,y:118,c:d,w:3})}
  <path d="M14 82h212" stroke="${d}" stroke-width="2.4" stroke-dasharray="6 5" opacity=".5"/>
  ${[[30,16],[58,22],[86,12],[114,86],[142,18],[170,14],[198,62]].map(([x,h])=>bar({x,base:118,h,w:20,c,op:h>50?1:.3})).join("")}
  ${label({x:120,y:140,text:"소수가 전부를 감당한다",c:d,size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
