/* Unit 02 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 twowhys:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="20" cy="24" r="12" stroke="${c}" stroke-width="3"/>
  <circle cx="44" cy="24" r="12" stroke="${c}" stroke-width="3" opacity=".38"/>
  <path d="M16 20c0-3 2-4.5 4-4.5s4 1.5 4 4.5-4 3-4 6" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="33" r="1.9" fill="${c}"/>
  <path d="M40 20c0-3 2-4.5 4-4.5s4 1.5 4 4.5-4 3-4 6" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>
  <circle cx="44" cy="33" r="1.9" fill="${c}" opacity=".55"/>
  <path d="M14 47h36" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 hunger:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M30 10c-8 0-12 5-12 9-5 1-7 5-7 8 0 4 3 6 5 7-1 5 3 10 8 10h6z" fill="${c}" opacity=".28"/>
  <path d="M34 10c8 0 12 5 12 9 5 1 7 5 7 8 0 4-3 6-5 7 1 5-3 10-8 10h-6z" fill="${c}"/>
  <path d="M32 10v34" stroke="${c}" stroke-width="2.6"/>
  <path d="M23 30l4-6 4 10 4-8 3 4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 52h24" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 spheres:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="23" stroke="${c}" stroke-width="3" opacity=".4"/>
  <path d="M9 32h46" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 4"/>
  <circle cx="32" cy="20" r="5" fill="${c}"/>
  <path d="M18 14l1.6 3.4L23 19l-3.4 1.6L18 24l-1.6-3.4L13 19l3.4-1.6z" fill="${c}"/>
  <path d="M47 24l1.3 2.7L51 28l-2.7 1.3L47 32l-1.3-2.7L43 28l2.7-1.3z" fill="${c}"/>
  <path d="M16 44c4-7 9-8 13-3 3 4 7 3 9-2 2-4 5-5 9-2" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
 zipper:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M25 6v22M39 6v22" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M25 10h-6M25 17h-6M25 24h-6M39 10h6M39 17h6M39 24h6" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>
  <rect x="24" y="28" width="16" height="11" rx="3.5" fill="${c}"/>
  <path d="M32 39v11" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="32" cy="52" r="3.6" stroke="${c}" stroke-width="2.6"/></svg>`,
 doubt:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 10v34M18 48h28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M10 20h44" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M3 33a7 7 0 0 0 14 0z" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M47 33a7 7 0 0 0 14 0z" fill="${c}"/>
  <path d="M10 20l-3 13M54 20l3 13" stroke="${c}" stroke-width="2" opacity=".6"/>
  <circle cx="32" cy="14" r="3.4" fill="${c}"/></svg>`,
};

const scenes = {
 /* 06 — 같은 장면, 다른 질문 */
 twowhys:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:236,y:66,w:168,h:132,c:d,fill:"#fff",label:"같은 장면"})}
  <g transform="translate(320 150)">
   <path d="M-26-26l-6-22 20 11zM26-26l6-22-20 11z" fill="${c}"/>
   <ellipse cx="0" cy="0" rx="30" ry="26" fill="${c}"/>
   <circle cx="-11" cy="-5" r="4" fill="#fff"/><circle cx="11" cy="-5" r="4" fill="#fff"/>
   <path d="M0 6l-6 5 6 4 6-4z" fill="#fff"/>
   <path d="M-14 10h-22M-14 16h-20M14 10h22M14 16h20" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
   <path d="M30 14c16 3 24 13 24 28" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <path d="M266 196h40l-4 12h-32z" fill="${d}" opacity=".45"/>
  ${person({x:84,y:236,s:.92,c,pose:"point",hair:"bob",face:"smile",brow:"up"})}
  ${bubble({x:24,y:22,w:154,h:52,lines:["어떤 신경이","이 소리를 나르지?"],c:d,tail:"bl",size:11.5})}
  ${label({x:84,y:258,text:"생물학자 — 기제",c:d,size:11.5})}
  ${person({x:558,y:236,s:.92,c,pose:"point",hair:"short",face:"smile",brow:"up",flip:1})}
  ${bubble({x:460,y:22,w:154,h:52,lines:["저 고양이는","무엇을 기대하지?"],c:d,tail:"br",size:11.5})}
  ${label({x:558,y:258,text:"심리학자 — 의미",c:d,size:11.5})}
  ${arrow({x1:150,y1:132,x2:228,y2:132,c:d,w:4,dash:"9 7"})}
  ${arrow({x1:490,y1:132,x2:412,y2:132,c:d,w:4,dash:"9 7"})}
  ${label({x:320,y:272,text:"두 질문 · 하나의 행동",c,size:12.5})}</svg>`,
 /* 07 — 굶은 뇌와 외로운 뇌 */
 hunger:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:20,w:262,h:206,c:d,fill:"#fff",n:1,label:"열 시간 굶은 뒤"})}
  ${person({x:92,y:214,s:1,c,pose:"hold",hair:"short",face:"worry",brow:"down"})}
  ${prop.cup(108,126,1.25,c)}
  ${bubble({x:150,y:44,w:118,h:40,lines:["배고파…"],c:d,tail:"bl",size:12.5})}
  ${panel({x:356,y:20,w:262,h:206,c:d,fill:"#fff",n:2,label:"열 시간 혼자 지낸 뒤"})}
  ${person({x:426,y:214,s:1,c,pose:"hold",hair:"bob",face:"worry",brow:"down"})}
  ${prop.phone(442,126,1.1,c)}
  ${bubble({x:484,y:44,w:118,h:40,lines:["누구든 좀…"],c:d,tail:"bl",size:12.5})}
  <g><circle cx="320" cy="122" r="34" fill="${c}" opacity=".18"/>
   <circle cx="320" cy="122" r="19" fill="${c}"/>
   ${label({x:320,y:178,text:"같은 자리가",c:d,size:11.5})}
   ${label({x:320,y:194,text:"밝아졌다",c:d,size:11.5})}</g>
  ${arrow({x1:290,y1:122,x2:280,y2:122,c:d,w:3.6,dash:"6 5"})}
  ${arrow({x1:350,y1:122,x2:360,y2:122,c:d,w:3.6,dash:"6 5"})}
  ${label({x:320,y:268,text:"밝은 점은 자리일 뿐, 감정 그 자체는 아니다",c,size:12.5})}</svg>`,
 /* 08 — 달을 경계로 나뉜 두 세계 */
 spheres:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <path d="M20 128h600" stroke="${d}" stroke-width="3.4" stroke-dasharray="11 8" opacity=".7"/>
  ${label({x:612,y:120,text:"달 — 경계",c:d,size:11,anchor:"end",op:.8})}
  <circle cx="320" cy="128" r="26" fill="#fff" stroke="${d}" stroke-width="3.4"/>
  <circle cx="312" cy="120" r="5" fill="${d}" opacity=".35"/><circle cx="328" cy="134" r="7" fill="${d}" opacity=".25"/>
  ${label({x:56,y:38,text:"천상계 — 변하지 않는다",c:d,size:12,anchor:"start"})}
  ${[[96,62],[196,44],[452,52],[556,74],[262,40],[392,84]].map(([x,y],i)=>`<path d="M${x} ${y}l3.4 7.4 7.4 3.4-7.4 3.4L${x} ${y+22}l-3.4-7.4L${x-11} ${y+11}l7.4-3.4z" fill="${c}" opacity="${i<3?1:.55}"/>`).join("")}
  <g><circle cx="196" cy="55" r="20" fill="${c}" opacity=".18"/>
   ${callout({x:196,y:55,tx:196,ty:104,text:"1572년, 없던 별",c:d})}</g>
  ${label({x:56,y:172,text:"지상계 — 변한다",c:d,size:12,anchor:"start"})}
  ${person({x:120,y:244,s:.85,c,pose:"up",hair:"cap",face:"oh",brow:"up"})}
  ${person({x:520,y:244,s:.85,c,pose:"point",hair:"short",face:"glad",brow:"up",flip:1})}
  <g transform="translate(470 216) rotate(-28)">
   <rect x="0" y="-7" width="56" height="14" rx="6" fill="#fff" stroke="${d}" stroke-width="2.4"/>
   <rect x="52" y="-10" width="16" height="20" rx="4" fill="${c}" stroke="${d}" stroke-width="2.4"/></g>
  ${label({x:520,y:270,text:"망원경이 본 거친 표면",c:d,size:11,op:.75})}
  ${ground({x1:40,y1:0,x2:600,y:252,c:d,w:3.4})}</svg>`,
 /* 09 — 안다고 믿는 지퍼 */
 zipper:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:274,h:208,c:d,fill:"#fff",n:1,label:"물어보기 전"})}
  ${person({x:92,y:216,s:1,c,pose:"open",hair:"curly",face:"glad",brow:"up"})}
  ${bubble({x:146,y:46,w:134,h:44,lines:["당연히 알지!"],c:d,tail:"bl",size:13})}
  ${panel({x:346,y:20,w:274,h:208,c:d,fill:"#fff",n:2,label:"설명해 보라고 하면"})}
  ${person({x:418,y:216,s:1,c,pose:"think",hair:"curly",face:"oh",brow:"up"})}
  ${thought({x:470,y:44,w:140,h:48,lines:["어… 이빨이","맞물려서…"],c:d,size:11.5,side:"l"})}
  ${arrow({x1:300,y1:124,x2:340,y2:124,c:d,w:5})}
  <g transform="translate(320 186)">
   <path d="M-9-28v22M9-28v22" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
   <path d="M-9-24h-6M-9-17h-5M-9-10h-6M9-24h6M9-17h5M9-10h6" stroke="${d}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>
   <rect x="-8" y="-6" width="16" height="11" rx="3" fill="${c}"/></g>
  ${label({x:320,y:268,text:"익숙한 것과 아는 것은 다르다",c,size:12.5})}</svg>`,
 /* 10 — 주장과 증거의 저울 */
 doubt:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:320,y:246,s:1,c,pose:"open",hair:"short",face:"smile"})}
  ${bubble({x:236,y:14,w:170,h:44,lines:["무엇이 이걸 결판내지?"],c:d,tail:"bl",size:12})}
  <g><path d="M112 96h416" stroke="${d}" stroke-width="6" stroke-linecap="round" transform="rotate(-7 320 96)"/>
   <path d="M320 96v46" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
   <circle cx="320" cy="94" r="7" fill="${d}"/></g>
  <g><path d="M86 122l24-3" stroke="${d}" stroke-width="2.4"/>
   <path d="M48 122a38 38 0 0 0 76 0z" fill="#fff" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
   ${prop.paper(86,104,.85,c)}
   ${label({x:86,y:176,text:"평범한 주장",c:d,size:11.5})}
   ${label({x:86,y:192,text:"시간표 한 장",c:d,size:10.5,op:.7})}</g>
  <g><path d="M554 70l-24 3" stroke="${d}" stroke-width="2.4"/>
   <path d="M516 70a38 38 0 0 0 76 0z" fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
   <rect x="530" y="18" width="48" height="34" rx="5" fill="${c}" stroke="${d}" stroke-width="2.6"/>
   <rect x="540" y="-2" width="34" height="22" rx="5" fill="${c}" opacity=".6" stroke="${d}" stroke-width="2.4"/>
   ${label({x:554,y:124,text:"비범한 주장",c:d,size:11.5})}
   ${label({x:554,y:140,text:"훨씬 무거운 증거",c:d,size:10.5,op:.7})}</g>
  ${label({x:320,y:272,text:"의심은 질문을 닫는 것이 아니라 무엇이 답이 될지를 묻는 일",c,size:12})}</svg>`,
};

const STRIP = {
 "06":["pair","gear","brain","nope","handshake"],
 "07":["alone","brain","heartbeat","warn","sprout"],
 "08":["moonface","eye","nova","scope","ruler"],
 "09":["zipper","tag","dome","shield","warn"],
 "10":["nope","ask","balance","spark","cable"]
};

const VIG = {
 "06":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:52,y:144,s:.7,c,pose:"point",hair:"bob",face:"smile"})}
  ${person({x:190,y:144,s:.7,c,pose:"point",hair:"short",face:"smile",flip:1})}
  <g transform="translate(120 88) scale(.8)">
   <path d="M-24-24l-6-20 19 10zM24-24l6-20-19 10z" fill="${c}"/>
   <ellipse rx="28" ry="24" fill="${c}"/>
   <circle cx="-10" cy="-4" r="3.6" fill="#fff"/><circle cx="10" cy="-4" r="3.6" fill="#fff"/></g>
  ${label({x:120,y:26,text:"같은 장면, 다른 질문",c:d,size:11})}</svg>`,
 "07":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M74 24c-30 0-46 18-46 36 0 7 3 12 7 16-4 15 9 30 26 30h13V24z" fill="#fff" stroke="${d}" stroke-width="3"/>
  <path d="M80 24c30 0 46 18 46 36 0 7-3 12-7 16 4 15-9 30-26 30H80z" fill="${c}" opacity=".18" stroke="${d}" stroke-width="3"/>
  <circle cx="77" cy="66" r="15" fill="${c}"/>
  ${label({x:77,y:132,text:"두 경우 같은 자리",c:d,size:11})}
  ${prop.cup(178,52,.9,c)}${prop.phone(178,110,.85,c)}</svg>`,
 "08":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M10 84h220" stroke="${d}" stroke-width="3" stroke-dasharray="8 6" opacity=".65"/>
  <circle cx="120" cy="84" r="20" fill="#fff" stroke="${d}" stroke-width="3"/>
  <circle cx="114" cy="78" r="4" fill="${d}" opacity=".35"/>
  ${[[40,32],[192,26],[92,40]].map(([x,y])=>`<path d="M${x} ${y}l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="${c}"/>`).join("")}
  <circle cx="192" cy="33" r="14" fill="${c}" opacity=".2"/>
  ${label({x:192,y:16,text:"1572",c:d,size:10})}
  ${person({x:56,y:144,s:.6,c,pose:"up",hair:"cap",face:"oh",brow:"up"})}</svg>`,
 "09":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:56,y:144,s:.7,c,pose:"think",hair:"curly",face:"oh",brow:"up"})}
  <g transform="translate(170 78)">
   <circle r="34" fill="none" stroke="${d}" stroke-width="3"/>
   <circle cx="-12" cy="-6" r="12" fill="none" stroke="${d}" stroke-width="3"/>
   <circle cx="14" cy="-6" r="12" fill="none" stroke="${d}" stroke-width="3"/>
   <path d="M-12-6h26l-6-14" stroke="${d}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
   <path d="M-4-14c8 6 14 6 20 0" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 4" fill="none"/></g>
  ${thought({x:88,y:14,w:120,h:32,lines:["체인이… 어디에?"],c:d,size:10.5,side:"l"})}</svg>`,
 "10":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M120 34v72M84 106h72" stroke="${d}" stroke-width="4" stroke-linecap="round"/>
  <path d="M30 46h180" stroke="${d}" stroke-width="4.4" stroke-linecap="round" transform="rotate(-8 120 46)"/>
  <path d="M14 64a28 28 0 0 0 56 0z" fill="#fff" stroke="${d}" stroke-width="3"/>
  <path d="M170 40a28 28 0 0 0 56 0z" fill="${c}" stroke="${d}" stroke-width="3"/>
  <rect x="182" y="10" width="32" height="18" rx="4" fill="${c}" opacity=".6" stroke="${d}" stroke-width="2.2"/>
  ${label({x:42,y:96,text:"평범",c:d,size:10.5,op:.75})}
  ${label({x:198,y:74,text:"비범",c:d,size:10.5,op:.75})}
  ${label({x:120,y:140,text:"주장의 크기 = 증거의 무게",c:d,size:11})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
