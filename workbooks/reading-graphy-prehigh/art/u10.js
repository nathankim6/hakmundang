/* Unit 10 삽화 — 만화 + 인포그래픽 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 gini:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 54V8M10 54h46" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M10 54L52 12" stroke="${c}" stroke-width="2.4" stroke-dasharray="5 4"/>
  <path d="M10 54L52 12C40 44 30 52 10 54z" fill="${c}" opacity=".22"/>
  <path d="M10 54c20-2 30-10 42-42" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`,
 conflict:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="25" stroke="${c}" stroke-width="3"/>
  <path d="M11 32h11M53 32H42" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M25 32l-8-5v10z" fill="${c}"/><path d="M39 32l8-5v10z" fill="${c}"/>
  <path d="M32 15l4 8-3 3 3 3-4 8-4-8 3-3-3-3z" fill="${c}" opacity=".85"/></svg>`,
 gig:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="14" width="48" height="42" rx="5" stroke="${c}" stroke-width="3"/>
  <path d="M8 27h48" stroke="${c}" stroke-width="3"/>
  <path d="M21 8v11M43 8v11" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="15" y="33" width="9" height="8" rx="2" fill="${c}"/>
  <rect x="40" y="33" width="9" height="8" rx="2" fill="${c}"/>
  <rect x="27.5" y="45" width="9" height="8" rx="2" fill="${c}"/>
  <rect x="27.5" y="33" width="9" height="8" rx="2" fill="${c}" opacity=".2"/>
  <rect x="15" y="45" width="9" height="8" rx="2" fill="${c}" opacity=".2"/>
  <rect x="40" y="45" width="9" height="8" rx="2" fill="${c}" opacity=".2"/></svg>`,
 store:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="7" y="10" width="50" height="46" rx="5" stroke="${c}" stroke-width="3"/>
  <rect x="14" y="20" width="16" height="5" rx="2.5" fill="${c}" opacity=".45"/>
  <rect x="34" y="20" width="16" height="5" rx="2.5" fill="${c}" opacity=".45"/>
  <rect x="14" y="34" width="16" height="5" rx="2.5" fill="${c}" opacity=".45"/>
  <rect x="34" y="34" width="16" height="5" rx="2.5" fill="${c}" opacity=".45"/>
  <path d="M32 52v-6H18V29h28V16h-14" stroke="${c}" stroke-width="3" stroke-dasharray="5 4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="16" r="4" fill="${c}"/></svg>`,
 veblen:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M25 7H12a4 4 0 0 0-4 4v13a4 4 0 0 0 1.2 2.8l17 17a4 4 0 0 0 5.6 0l13-13a4 4 0 0 0 0-5.6l-17-17A4 4 0 0 0 25 7z" stroke="${c}" stroke-width="3" stroke-linejoin="round" fill="${c}" fill-opacity=".16"/>
  <circle cx="17.5" cy="17.5" r="4.2" fill="${c}"/>
  <path d="M14 57h36M20 51l11-11 8 8 12-15" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M43 33h9v9" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const scenes = {
 gini:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"위가 크게 버는 나라"})}
  ${bar({x:74,base:184,h:20,c,op:.34})}${bar({x:114,base:184,h:28,c,op:.46})}${bar({x:154,base:184,h:36,c,op:.6})}${bar({x:194,base:184,h:46,c,op:.76})}${bar({x:238,base:184,h:118,c})}
  ${ground({x1:56,x2:266,y:184,c:d,w:3})}
  ${label({x:157,y:200,text:"하위 →  상위",c:d,size:10.5,op:.75})}
  ${tag({x:120,y:48,text:"Gini 0.42",c})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"아래가 거의 못 버는 나라"})}
  ${bar({x:400,base:184,h:5,c,op:.34})}${bar({x:440,base:184,h:9,c,op:.46})}${bar({x:480,base:184,h:62,c,op:.6})}${bar({x:520,base:184,h:74,c,op:.76})}${bar({x:564,base:184,h:88,c})}
  ${ground({x1:382,x2:592,y:184,c:d,w:3})}
  ${label({x:483,y:200,text:"하위 →  상위",c:d,size:10.5,op:.75})}
  ${tag({x:446,y:48,text:"Gini 0.42",c})}
  ${label({x:320,y:270,text:"같은 계수, 다른 사회 — 숫자는 어느 쪽인지 말해 주지 않는다",c,size:12.5})}</svg>`,
 conflict:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"이야기 속 인물"})}
  ${person({x:157,y:196,s:.9,c,pose:"think",hair:"bob",face:"worry",brow:"down"})}
  ${bubble({x:36,y:36,w:100,h:32,lines:["가고 싶다"],c:d,tail:"br",size:11})}
  ${bubble({x:178,y:36,w:100,h:32,lines:["가면 안 돼"],c:d,tail:"bl",size:11})}
  ${arrow({x1:302,y1:112,x2:340,y2:112,c:d,w:5})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"광고가 빌려 온 틀"})}
  ${person({x:428,y:196,s:.88,c,pose:"open",hair:"short",face:"smile"})}
  ${prop.screen(548,116,1.5,c)}
  ${bubble({x:410,y:36,w:190,h:34,lines:["주장이 없으니 반박도 없다"],c:d,tail:"bl",size:11})}
  ${label({x:320,y:270,text:"같은 뼈대가 소설에도 광고에도 쓰인다",c,size:12.5})}</svg>`,
 gig:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"예전 — 회사가 진다"})}
  <rect x="148" y="84" width="114" height="96" rx="6" fill="${t}" stroke="${d}" stroke-width="2.8"/>
  <path d="M166 106h26M166 128h26M220 106h26M220 128h26M166 152h80" stroke="${d}" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
  ${tag({x:205,y:66,text:"위험",c})}
  ${person({x:82,y:190,s:.84,c,pose:"down",hair:"short",face:"smile"})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"지금 — 개인이 진다"})}
  <rect x="372" y="98" width="92" height="82" rx="6" fill="${t}" stroke="${d}" stroke-width="2.8" opacity=".55"/>
  <path d="M388 118h20M388 138h20M428 118h20M428 138h20" stroke="${d}" stroke-width="2.4" stroke-linecap="round" opacity=".32"/>
  ${arrow({x1:476,y1:126,x2:518,y2:118,c:d,w:4})}
  ${person({x:556,y:190,s:.84,c,pose:"hold",hair:"bob",face:"worry",brow:"down"})}
  ${tag({x:566,y:110,text:"위험",c})}
  ${label({x:320,y:270,text:"자유는 늘었고, 비어 있는 오후의 손해도 함께 옮겨 왔다",c,size:12.5})}</svg>`,
 store:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:322,h:190,c:d,fill:"#fff",n:1,label:"설계된 동선"})}
  <rect x="44" y="40" width="278" height="146" rx="8" fill="${t}" opacity=".55"/>
  <rect x="62" y="92" width="100" height="13" rx="6" fill="${c}" opacity=".34"/>
  <rect x="204" y="92" width="100" height="13" rx="6" fill="${c}" opacity=".34"/>
  <rect x="62" y="132" width="100" height="13" rx="6" fill="${c}" opacity=".34"/>
  <rect x="204" y="132" width="100" height="13" rx="6" fill="${c}" opacity=".34"/>
  <path d="M183 180V160H74V118h218V78h-109" stroke="${d}" stroke-width="3" stroke-dasharray="7 5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${tag({x:183,y:62,text:"우유 · 빵",c})}
  ${label({x:183,y:196,text:"입구",c:d,size:10.5,op:.8})}
  ${panel({x:364,y:18,w:254,h:190,c:d,fill:"#fff",n:2,label:"선반 높이와 매출"})}
  ${bar({x:424,base:170,h:100,c,cap:"눈높이",capc:d})}
  ${bar({x:492,base:170,h:56,c,op:.5,cap:"중간",capc:d})}
  ${bar({x:560,base:170,h:26,c,op:.28,cap:"바닥 쪽",capc:d})}
  ${ground({x1:396,x2:592,y:170,c:d,w:3})}
  ${label({x:492,y:62,text:"같은 물건, 다른 매출",c:d,size:11})}
  ${label({x:320,y:270,text:"길과 높이가 백 개의 작은 결정을 한쪽으로 기울인다",c,size:12.5})}</svg>`,
 veblen:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:190,h:190,c:d,fill:"#fff",n:1,label:"보통 상품"})}
  <path d="M52 176V52M52 176h140" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  <path d="M64 64C98 128 128 152 184 162" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${label({x:42,y:78,text:"값",c:d,size:11,op:.85})}
  ${label({x:186,y:194,text:"수요",c:d,size:10.5,op:.8})}
  ${panel({x:225,y:18,w:190,h:190,c:d,fill:"#fff",n:2,label:"신호가 되는 상품"})}
  <path d="M257 176V52M257 176h140" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  <path d="M269 162C302 150 330 112 356 82" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${arrow({x1:356,y1:82,x2:390,y2:60,c,w:4})}
  ${label({x:247,y:78,text:"값",c:d,size:11,op:.85})}
  ${label({x:391,y:194,text:"수요",c:d,size:10.5,op:.8})}
  ${panel({x:430,y:18,w:190,h:190,c:d,fill:"#fff",n:3,label:"이유 — 보는 사람"})}
  ${person({x:480,y:186,s:.8,c,pose:"hold",hair:"short",face:"glad",brow:"up"})}
  ${tag({x:487,y:122,text:"비싸다",c})}
  ${person({x:556,y:186,s:.56,c,pose:"down",hair:"bob",face:"smile",flip:1})}
  ${person({x:598,y:186,s:.56,c,pose:"down",hair:"curly",face:"oh",flip:1})}
  ${label({x:577,y:202,text:"관객",c:d,size:10,op:.75})}
  ${label({x:320,y:270,text:"값 자체가 메시지일 때, 규칙은 뒤집힌다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "46":["ruler","balance","globe","scope","warn"],
 "47":["brain","swap","quote","frame","zipper"],
 "48":["hourglass","swap","shield","alone","warn"],
 "49":["map","eye","tag","loop","nope"],
 "50":["tag","coin","gift","eye","balance"]
};

const VIG = {
 "46":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M28 116V26M28 116h182" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  <path d="M28 116L200 30" stroke="${d}" stroke-width="2.4" stroke-dasharray="5 4"/>
  <path d="M28 116L200 30C150 88 104 112 28 116z" fill="${c}" opacity=".2"/>
  <path d="M28 116C104 112 150 88 200 30" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  ${label({x:120,y:142,text:"면적이 곧 계수",c:d,size:10.5})}</svg>`,
 "47":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:120,y:134,s:.62,c,pose:"think",hair:"bob",face:"worry",brow:"down"})}
  ${bubble({x:6,y:12,w:88,h:30,lines:["원한다"],c:d,tail:"br",size:10.5})}
  ${bubble({x:146,y:12,w:88,h:30,lines:["안 된다"],c:d,tail:"bl",size:10.5})}
  ${label({x:120,y:148,text:"안쪽의 갈등",c:d,size:10.5})}</svg>`,
 "48":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="16" y="50" width="66" height="64" rx="5" fill="${t}" stroke="${d}" stroke-width="2.6"/>
  <path d="M28 68h18M28 86h18M58 68h14M58 86h14" stroke="${d}" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>
  ${arrow({x1:92,y1:80,x2:132,y2:80,c:d,w:4})}
  ${person({x:186,y:128,s:.62,c,pose:"hold",hair:"short",face:"worry",brow:"down"})}
  ${tag({x:192,y:76,text:"위험",c})}
  ${label({x:120,y:146,text:"위험이 옮겨 간다",c:d,size:10.5})}</svg>`,
 "49":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="16" y="16" width="208" height="104" rx="8" fill="${t}" opacity=".55" stroke="${d}" stroke-width="2.6"/>
  <rect x="34" y="56" width="72" height="11" rx="5" fill="${c}" opacity=".36"/>
  <rect x="134" y="56" width="72" height="11" rx="5" fill="${c}" opacity=".36"/>
  <rect x="34" y="86" width="72" height="11" rx="5" fill="${c}" opacity=".36"/>
  <rect x="134" y="86" width="72" height="11" rx="5" fill="${c}" opacity=".36"/>
  <path d="M120 114V100H40V72h160V44h-80" stroke="${d}" stroke-width="3" stroke-dasharray="6 5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${tag({x:120,y:32,text:"우유 · 빵",c})}
  ${label({x:120,y:142,text:"가장 먼 곳에 둔다",c:d,size:10.5})}</svg>`,
 "50":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M34 114V28M34 114h174" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
  <path d="M46 106C80 96 112 78 150 56" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${arrow({x1:150,y1:56,x2:194,y2:32,c,w:4})}
  ${label({x:24,y:26,text:"값",c:d,size:10.5,op:.8})}
  ${label({x:206,y:128,text:"수요",c:d,size:10.5,op:.8})}
  ${label({x:120,y:146,text:"둘이 함께 오른다",c:d,size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
