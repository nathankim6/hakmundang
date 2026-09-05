/* Unit 04 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 clock:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="34" r="22" stroke="${c}" stroke-width="3.2"/>
  <path d="M32 20v14l10 6" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 6v6M14 12l4 5M50 12l-4 5" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="34" r="3" fill="${c}"/></svg>`,
 surgery:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M42 10l12 12-26 26-12-12z" fill="${c}" opacity=".25"/>
  <path d="M46 8c6 2 10 6 12 12L26 52l-6-2-2-6z" stroke="${c}" stroke-width="3" stroke-linejoin="round" fill="none"/>
  <path d="M12 56l8-8" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M20 20h14M27 13v14" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></svg>`,
 virus:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="15" fill="${c}" opacity=".2"/>
  <circle cx="32" cy="32" r="15" stroke="${c}" stroke-width="3"/>
  <path d="M32 8v9M32 47v9M8 32h9M47 32h9M15 15l7 7M42 42l7 7M49 15l-7 7M22 42l-7 7" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="6" r="3" fill="${c}"/><circle cx="32" cy="58" r="3" fill="${c}"/>
  <circle cx="6" cy="32" r="3" fill="${c}"/><circle cx="58" cy="32" r="3" fill="${c}"/>
  <path d="M26 30c3-3 6-1 6 2s3 5 6 2" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
 wall:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M20 26h24v26H20z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M14 26h36" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M26 26V16a6 6 0 0 1 12 0v10" stroke="${c}" stroke-width="3" fill="none"/>
  <path d="M26 38h12M26 45h12" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
  <path d="M8 56h48" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M10 56V44M54 56V44" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>`,
 burnout:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="10" y="14" width="44" height="36" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M10 26h44" stroke="${c}" stroke-width="3"/>
  <path d="M20 10v8M44 10v8" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="17" y="32" width="10" height="6" rx="2" fill="${c}" opacity=".35"/>
  <rect x="31" y="32" width="16" height="6" rx="2" fill="${c}"/>
  <rect x="17" y="41" width="20" height="6" rx="2" fill="${c}" opacity=".6"/>
  <path d="M40 44l4 4 8-9" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const scenes = {
 /* 16 — 손목시계와 몸속 시계 */
 clock:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:266,h:200,c:d,fill:"#fff",n:1,label:"손목시계 — 1초면 끝"})}
  ${person({x:96,y:210,s:.98,c,pose:"point",hair:"short",face:"glad",brow:"up"})}
  ${prop.clock(206,110,2.1,c)}
  ${panel({x:354,y:20,w:266,h:200,c:d,fill:"#fff",n:2,label:"몸속 시계 — 하루 한 시간"})}
  ${person({x:430,y:210,s:.98,c,pose:"think",hair:"bob",face:"worry",brow:"down"})}
  <g transform="translate(540 110)">
   <circle r="34" fill="#fff" stroke="${d}" stroke-width="3.4" stroke-dasharray="9 7"/>
   <path d="M0-22v24l16 8" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   ${arrow({x1:26,y1:-26,x2:38,y2:-14,c:d,w:3})}</g>
  ${arrow({x1:294,y1:118,x2:346,y2:118,c:d,w:5})}
  ${prop.bulb(320,60,1.2,c)}
  ${label({x:320,y:244,text:"아침 빛이 시계를 앞으로 당긴다",c:d,size:11.5})}
  ${label({x:320,y:270,text:"신호를 한 방향으로 맞추는 것이 전부다",c,size:12.5})}</svg>`,
 /* 17 — 빠른 손과 느린 손 */
 surgery:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:270,h:196,c:d,fill:"#fff",n:1,label:"마취 이전 — 속도"})}
  ${person({x:96,y:206,s:.95,c,pose:"point",hair:"cap",face:"oh",brow:"down"})}
  ${prop.clock(224,86,1.5,c)}
  <rect x="150" y="150" width="120" height="14" rx="6" fill="${c}" opacity=".2"/>
  <rect x="150" y="150" width="26" height="14" rx="6" fill="${c}"/>
  ${label({x:210,y:182,text:"1분 안에",c:d,size:11,op:.75})}
  ${panel({x:350,y:20,w:270,h:196,c:d,fill:"#fff",n:2,label:"마취 이후 — 정확함"})}
  ${person({x:426,y:206,s:.95,c,pose:"hold",hair:"cap",face:"flat"})}
  ${prop.paper(442,120,1.1,c)}
  <rect x="480" y="150" width="120" height="14" rx="6" fill="${c}" opacity=".2"/>
  <rect x="480" y="150" width="104" height="14" rx="6" fill="${c}"/>
  ${label({x:540,y:182,text:"필요한 만큼",c:d,size:11,op:.75})}
  ${arrow({x1:298,y1:116,x2:342,y2:116,c:d,w:5})}
  ${label({x:320,y:246,text:"가장 큰 변화는 기술이 아니라 오래 가르치는 제도였다",c:d,size:11.5})}
  ${label({x:320,y:270,text:"외과의는 타고나지 않고 천천히 만들어진다",c,size:12.5})}</svg>`,
 /* 18 — 껍질과 설명서, 빌린 공장 */
 virus:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <g transform="translate(116 132)">
   <circle r="44" fill="#fff" stroke="${d}" stroke-width="3.4"/>
   ${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,x=Math.cos(a)*56,y=Math.sin(a)*56;return `<path d="M0 0L${x} ${y}" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`}).join("")}
   <path d="M-16-2c10-10 20-2 20 8s10 12 18 4" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
  ${label({x:116,y:216,text:"껍질에 싸인 설명서",c:d,size:11.5})}
  ${arrow({x1:184,y1:132,x2:252,y2:132,c:d,w:5,dash:"10 8"})}
  <g><ellipse cx="440" cy="134" rx="132" ry="84" fill="#fff" stroke="${d}" stroke-width="3.4"/>
   <circle cx="404" cy="112" r="28" fill="${c}" opacity=".2" stroke="${d}" stroke-width="3"/>
   ${[[478,150],[512,128],[478,92]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="28" height="36" rx="6" fill="${c}" opacity="${[.6,.45,.3][i]}"/>`).join("")}
   ${label({x:440,y:236,text:"세포 — 빌려 쓰는 공장",c:d,size:11.5})}</g>
  ${tag({x:218,y:100,text:"설계도만",c})}
  ${label({x:320,y:270,text:"기계는 빌린 것이고, 바이러스의 것은 설계도뿐이다",c,size:12.5})}</svg>`,
 /* 19 — 존 스노의 지도와 빈 지도 */
 wall:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:272,h:198,c:d,fill:"#fff",n:1,label:"1854 · 브로드가"})}
  <path d="M20 120h272M156 20v198" stroke="${d}" stroke-width="2.4" opacity=".28"/>
  ${[[142,108],[168,116],[150,136],[170,100],[134,128],[162,140],[178,128],[146,94],[106,78],[216,156],[94,164],[224,84]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i<8?4.5:3.5}" fill="${c}" opacity=".8"/>`).join("")}
  <g><rect x="150" y="108" width="15" height="24" rx="4" fill="${d}"/>
   <path d="M157 108V96" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
   <circle cx="157" cy="120" r="26" fill="none" stroke="${d}" stroke-width="2.6" stroke-dasharray="5 5"/></g>
  ${person({x:60,y:200,s:.7,c,pose:"point",hair:"cap",face:"flat"})}
  ${panel({x:348,y:20,w:272,h:198,c:d,fill:"#fff",label:"손잡이를 뗀 뒤"})}
  <path d="M348 120h272M484 20v198" stroke="${d}" stroke-width="2.4" opacity=".14"/>
  ${label({x:484,y:126,text:"아무 일도 없음",c:d,size:14,op:.4})}
  ${arrow({x1:300,y1:118,x2:340,y2:118,c:d,w:5})}
  ${label({x:320,y:246,text:"막아 낸 일은 그래프에 남지 않는다",c:d,size:11.5})}
  ${label({x:320,y:270,text:"공중보건은 성공이 아무 일도 없는 것처럼 보이는 분야다",c,size:12})}</svg>`,
 /* 20 — 17시간을 넘어가는 실수 곡선 */
 burnout:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <path d="M76 208V44M76 208h520" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M92 190l88-6 88 4 88 24 88 44 74 26" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M336 44v164" stroke="${d}" stroke-width="3" stroke-dasharray="7 6" opacity=".7"/>
  ${label({x:336,y:36,text:"깨어 있은 지 17시간",c:d,size:11.5})}
  ${label({x:60,y:52,text:"많음",c:d,size:10.5,anchor:"end"})}
  ${label({x:60,y:212,text:"적음",c:d,size:10.5,anchor:"end"})}
  ${label({x:36,y:130,text:"실수",c:d,size:11,anchor:"middle"})}
  ${person({x:170,y:262,s:.62,c,pose:"down",hair:"short",face:"smile"})}
  ${person({x:498,y:262,s:.62,c,pose:"think",hair:"short",face:"worry",brow:"down"})}
  ${bubble({x:388,y:56,w:186,h:38,lines:["가벼운 취기 수준"],c:d,tail:"bl",size:11.5})}
  ${label({x:320,y:276,text:"아무도 지치지 않는다는 전제 위에 세운 체계는 잘못 지어진 것이다",c,size:11.5})}</svg>`,
};

const STRIP = {
 "16":["hourglass","loop","sunrise","takeoff","balance"],
 "17":["hourglass","gear","wrench","shield","pair"],
 "18":["spark","nope","loop","ask","shield"],
 "19":["map","eye","dome","warn","nope"],
 "20":["alone","ruler","hourglass","swap","gear"]
};

const VIG = {
 "16":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.clock(54,64,2.1,c)}
  <circle cx="176" cy="64" r="32" fill="#fff" stroke="${d}" stroke-width="3.2" stroke-dasharray="8 6"/>
  <path d="M176 44v22l14 8" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${arrow({x1:98,y1:64,x2:134,y2:64,c:d,w:4,dash:"6 5"})}
  ${label({x:54,y:120,text:"손목",c:d,size:11})}${label({x:176,y:120,text:"몸속",c:d,size:11})}</svg>`,
 "17":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:56,y:142,s:.72,c,pose:"hold",hair:"cap",face:"flat"})}
  ${prop.paper(70,72,1,c)}
  <g transform="translate(172 66)">
   <rect x="-26" y="-30" width="52" height="60" rx="8" fill="#fff" stroke="${d}" stroke-width="3"/>
   <path d="M-14-30v-8M0-32v-10M14-30v-8" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
   ${label({x:0,y:14,text:"1889",c:d,size:12})}</g></svg>`,
 "18":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g transform="translate(58 70)"><circle r="26" fill="#fff" stroke="${d}" stroke-width="3"/>
   ${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,x=Math.cos(a)*34,y=Math.sin(a)*34;return `<path d="M0 0L${x} ${y}" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`}).join("")}</g>
  <ellipse cx="170" cy="74" rx="58" ry="40" fill="#fff" stroke="${d}" stroke-width="3"/>
  <circle cx="154" cy="64" r="14" fill="${c}" opacity=".25" stroke="${d}" stroke-width="2.6"/>
  <rect x="184" y="80" width="18" height="22" rx="4" fill="${c}" opacity=".5"/>
  ${label({x:120,y:138,text:"빌려 쓰는 공장",c:d,size:11})}</svg>`,
 "19":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${panel({x:12,y:18,w:100,h:100,c:d,fill:"#fff"})}
  ${[[56,58],[72,66],[60,84],[74,50],[46,74],[68,90],[80,74],[58,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}" opacity=".8"/>`).join("")}
  <rect x="56" y="58" width="12" height="20" rx="3" fill="${d}"/>
  ${arrow({x1:126,y1:68,x2:154,y2:68,c:d,w:4})}
  ${panel({x:166,y:18,w:62,h:100,c:d,fill:"#fff"})}
  ${label({x:197,y:74,text:"—",c:d,size:16,op:.4})}
  ${label({x:120,y:140,text:"성공은 그림을 남기지 않는다",c:d,size:10.5})}</svg>`,
 "20":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M26 116V22M26 116h198" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M38 104l38-3 38 2 38 12 38 26" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M124 22v94" stroke="${d}" stroke-width="3" stroke-dasharray="6 5" opacity=".7"/>
  ${label({x:124,y:16,text:"17시간",c:d,size:10.5})}
  ${label({x:120,y:140,text:"버티라는 말로는 풀리지 않는다",c:d,size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
