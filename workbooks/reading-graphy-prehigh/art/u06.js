/* Unit 06 삽화 — 만화 + 인포그래픽
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 always:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="12" y="8" width="40" height="48" rx="6" stroke="${c}" stroke-width="3"/>
  <rect x="19" y="17" width="26" height="8" rx="3" fill="${c}"/>
  <rect x="19" y="30" width="26" height="8" rx="3" fill="${c}" opacity=".6"/>
  <rect x="19" y="43" width="18" height="8" rx="3" fill="${c}" opacity=".35"/>
  <circle cx="50" cy="12" r="8" fill="${c}"/>
  <path d="M50 8v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="50" cy="16.5" r="1.5" fill="#fff"/></svg>`,
 virtual:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 24h48a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-9l-6-6H23l-6 6H8a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="19" cy="33" r="5" fill="${c}"/><circle cx="45" cy="33" r="5" fill="${c}"/>
  <path d="M20 18c4-6 20-6 24 0" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".5"/></svg>`,
 wellbeing:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="10" y="10" width="44" height="34" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M24 54h16" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 44v10" stroke="${c}" stroke-width="3.2"/>
  <path d="M17 34c5-3 7-10 9-10s3 8 6 8 5-10 8-10 4 8 7 10" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="47" cy="20" r="3.4" fill="${c}"/></svg>`,
 aiwinter:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 8v48M12 20l40 24M52 20L12 44" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 14l-5 6h10zM32 50l-5-6h10z" fill="${c}"/>
  <circle cx="32" cy="32" r="7" fill="${c}" opacity=".25"/>
  <circle cx="32" cy="32" r="3.4" fill="${c}"/>
  <circle cx="12" cy="20" r="3" fill="${c}"/><circle cx="52" cy="20" r="3" fill="${c}"/>
  <circle cx="12" cy="44" r="3" fill="${c}"/><circle cx="52" cy="44" r="3" fill="${c}"/></svg>`,
 unsaid:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 12h44a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H26L14 50V40h-4a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 22h26M16 30h14" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="40" cy="30" r="2" fill="${c}"/><circle cx="47" cy="30" r="2" fill="${c}"/>
  <circle cx="54" cy="30" r="2" fill="${c}"/></svg>`,
};

const scenes = {
 /* 26 — 쪼개진 아침 */
 always:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:88,y:214,s:.95,c,pose:"hold",hair:"short",face:"worry",brow:"down"})}
  ${prop.screen(104,132,1.15,c)}
  ${label({x:88,y:238,text:"일하는 사람",c:d,size:11})}
  ${label({x:184,y:44,text:"어느 아침",c:d,size:12,anchor:"start"})}
  <rect x="184" y="60" width="420" height="30" rx="9" fill="${c}" opacity=".16"/>
  ${[224,268,304,364,408,442,506,548,586].map(x=>`<g><path d="M${x} 54v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="${x}" cy="50" r="4.5" fill="${c}"/></g>`).join("")}
  ${label({x:184,y:114,text:"점 하나가 10초짜리 메시지",c:d,size:10.5,anchor:"start",op:.72})}
  <rect x="184" y="140" width="420" height="30" rx="9" fill="${c}" opacity=".16"/>
  ${[[224,34],[268,26],[304,44],[364,32],[408,24],[442,42],[506,26],[548,38],[586,30]].map(([x,w])=>`<rect x="${x}" y="140" width="${w}" height="30" rx="9" fill="${c}" opacity=".5"/><path d="M${x} 134v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`).join("")}
  ${label({x:184,y:194,text:"꼬리가 남는 몫 — 주의 잔여물",c:d,size:10.5,anchor:"start",op:.72})}
  ${label({x:320,y:264,text:"10초짜리 메시지가 10초를 쓰게 하는 것은 아니다",c,size:12.5})}</svg>`,
 /* 27 — 실패해도 아무도 다치지 않는 방 */
 virtual:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <rect x="24" y="26" width="592" height="188" rx="16" fill="#fff" stroke="${d}" stroke-width="3.4" stroke-dasharray="13 10"/>
  ${label({x:320,y:18,text:"실패해도 아무도 다치지 않는 방",c:d,size:12})}
  ${[["드문 수술",96],["안 지어진 건물",232],["안전한 공포",368],["겪어 본 적 없는 날씨",504]].map(([txt,x],i)=>`
   ${panel({x:x-58,y:52,w:116,h:96,c:d,fill:"#fff"})}
   ${label({x,y:174,text:txt,c:d,size:11})}`).join("")}
  <path d="M64 130c14-22 26-24 34-8 5 10 12 8 17-2l17 26z" fill="${c}" opacity=".4"/>
  <circle cx="76" cy="80" r="9" fill="${c}"/>
  <path d="M204 132V96h56v36z" stroke="${d}" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <path d="M204 96l28-18 28 18" stroke="${d}" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <path d="M340 132h56M356 132V98h24v34" stroke="${d}" stroke-width="3" fill="none"/>
  <circle cx="368" cy="86" r="9" fill="${c}"/>
  <path d="M472 128l18-30 16 22 13-15 15 23z" fill="${c}" opacity=".38"/>
  <path d="M468 132h72M486 84h32" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  ${person({x:320,y:244,s:.6,c,pose:"hold",hair:"cap",face:"smile"})}
  ${label({x:320,y:276,text:"달리 해 보기엔 대가가 너무 큰 일을 미리 겪는다",c,size:11.5})}</svg>`,
 /* 28 — 같은 두 시간 */
 wellbeing:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:22,w:270,h:190,c:d,fill:"#fff",n:1,label:"친구와 이야기한 두 시간"})}
  ${person({x:104,y:196,s:.86,c,pose:"open",hair:"bob",face:"glad",brow:"up"})}
  ${person({x:212,y:196,s:.86,c,pose:"open",hair:"short",face:"glad",brow:"up",flip:1})}
  ${bubble({x:98,y:48,w:120,h:34,lines:["ㅎㅎ"],c:d,tail:"bl",size:12})}
  ${panel({x:348,y:22,w:270,h:190,c:d,fill:"#fff",n:2,label:"낯선 글을 넘긴 두 시간"})}
  ${person({x:432,y:196,s:.86,c,pose:"hold",hair:"short",face:"flat"})}
  ${prop.phone(448,118,1.1,c)}
  ${[[510,60],[510,88],[510,116],[510,144]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="86" height="20" rx="6" fill="${c}" opacity="${[.7,.5,.35,.22][i]}"/>`).join("")}
  ${prop.clock(320,84,1.3,c)}
  ${label({x:320,y:122,text:"같은 2시간",c:d,size:11.5})}
  ${label({x:320,y:246,text:"얼마나 오래가 아니라, 무엇 대신에",c:d,size:11.5})}
  ${label({x:320,y:270,text:"맥락 없는 숫자는 거의 아무것도 설명하지 못한다",c,size:12.5})}</svg>`,
 /* 29 — 쉬워 보인 일과 어려웠던 일 */
 aiwinter:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:24,w:270,h:186,c:d,fill:"#fff",n:1,label:"기계에게 쉬웠던 것"})}
  ${label({x:157,y:82,text:"체스 · 논리 · 대수",c:d,size:13})}
  <g transform="translate(157 140)">
   <rect x="-46" y="-24" width="92" height="48" rx="4" fill="#fff" stroke="${d}" stroke-width="2.6"/>
   ${[0,1,2,3].map(i=>[0,1].map(j=>`<rect x="${-46+i*23+(j%2)*0}" y="${-24+j*24}" width="23" height="24" fill="${(i+j)%2?c:"#fff"}" opacity=".55"/>`).join("")).join("")}</g>
  ${panel({x:348,y:24,w:270,h:186,c:d,fill:"#fff",n:2,label:"기계에게 어려웠던 것"})}
  ${label({x:483,y:82,text:"얼굴 알아보기 · 방 건너기",c:d,size:12})}
  ${person({x:440,y:186,s:.72,c,pose:"point",hair:"short",face:"smile"})}
  ${person({x:534,y:186,s:.72,c,pose:"down",hair:"bob",face:"smile",flip:1})}
  ${arrow({x1:298,y1:118,x2:342,y2:118,c:d,w:5})}
  ${label({x:320,y:244,text:"아이가 알아채지도 못하고 하는 일이 가장 어려웠다",c:d,size:11.5})}
  ${label({x:320,y:270,text:"우리는 무엇이 어려운지 판단하는 데 서투르다",c,size:12.5})}</svg>`,
 /* 30 — 말하지 않은 말 */
 unsaid:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:92,y:244,s:.95,c,pose:"open",hair:"short",face:"flat"})}
  ${bubble({x:140,y:36,w:250,h:46,lines:["“좌석이 편하더라.”"],c:d,fill:c,tail:"bl",size:14})}
  ${arrow({x1:262,y1:112,x2:262,y2:150,c:d,w:3.4,dash:"6 6"})}
  ${bubble({x:140,y:158,w:250,h:44,lines:["“영화는 별로였어.”"],c:d,fill:"#fff",tail:"none",size:13.5})}
  ${label({x:265,y:224,text:"말하지 않은 쪽이 뜻을 나른다",c:d,size:11.5})}
  ${panel({x:420,y:36,w:196,h:166,c:d,fill:"#fff",label:"함께 쓰는 규칙"})}
  ${[["충분히 말하라",84],["참인 것을 말하라",118],["관련된 것을 말하라",152]].map(([txt,y])=>`<circle cx="446" cy="${y}" r="7" fill="${c}"/>${label({x:462,y:y+5,text:txt,c:d,size:12,anchor:"start"})}`).join("")}
  ${label({x:320,y:272,text:"의미는 한 번도 문장 안에만 살았던 적이 없다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "26":["hourglass","warn","loop","alone","shield"],
 "27":["frame","spark","heartbeat","dome","warn"],
 "28":["ruler","pair","frame","ask","balance"],
 "29":["spark","gear","wilt","sunrise","ruler"],
 "30":["quote","chat","swap","globe","ask"]
};

const VIG = {
 "26":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="14" y="40" width="212" height="24" rx="7" fill="${c}" opacity=".16"/>
  ${[[46,20],[86,16],[122,26],[168,18],[198,22]].map(([x,w])=>`<rect x="${x}" y="40" width="${w}" height="24" rx="7" fill="${c}" opacity=".5"/><path d="M${x} 34v36" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`).join("")}
  ${label({x:120,y:92,text:"꼬리가 남는 몫",c:d,size:11})}
  ${person({x:120,y:146,s:.44,c,pose:"think",hair:"short",face:"worry",brow:"down"})}</svg>`,
 "27":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${panel({x:14,y:22,w:96,h:80,c:d,fill:"#fff"})}
  <path d="M30 88c12-20 24-22 32-8l20 22z" fill="${c}" opacity=".4"/>
  <circle cx="42" cy="50" r="9" fill="${c}"/>
  ${arrow({x1:124,y1:62,x2:152,y2:62,c:d,w:4})}
  ${person({x:196,y:132,s:.62,c,pose:"hold",hair:"cap",face:"smile"})}
  ${label({x:120,y:142,text:"안전하게 실패하는 방",c:d,size:10.5})}</svg>`,
 "28":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:44,y:126,s:.6,c,pose:"open",hair:"bob",face:"glad"})}
  ${person({x:104,y:126,s:.6,c,pose:"open",hair:"short",face:"glad",flip:1})}
  <path d="M150 20v112" stroke="${d}" stroke-width="3" stroke-dasharray="7 6" opacity=".55"/>
  ${person({x:196,y:126,s:.6,c,pose:"hold",hair:"short",face:"flat"})}
  ${prop.phone(206,84,.75,c)}
  ${label({x:120,y:146,text:"같은 2시간, 다른 일",c:d,size:10.5})}</svg>`,
 "29":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M14 112V22M14 112h212" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M26 96c22-46 54-56 76-18 16 28 4 52-12 62" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
  <path d="M104 104c32-38 68-38 92-6" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
  <rect x="84" y="22" width="22" height="90" fill="${c}" opacity=".12"/>
  <rect x="186" y="22" width="22" height="90" fill="${c}" opacity=".12"/>
  ${label({x:95,y:18,text:"겨울",c:d,size:9.5,op:.7})}${label({x:197,y:18,text:"겨울",c:d,size:9.5,op:.7})}
  ${label({x:120,y:140,text:"약속과 겨울, 그리고 느린 오르막",c:d,size:10})}</svg>`,
 "30":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${bubble({x:14,y:18,w:150,h:36,lines:["“좌석이 편하더라”"],c:d,fill:c,tail:"bl",size:11})}
  ${arrow({x1:76,y1:76,x2:76,y2:96,c:d,w:3,dash:"5 5"})}
  ${bubble({x:14,y:102,w:150,h:32,lines:["“별로였어”"],c:d,fill:"#fff",tail:"none",size:11})}
  ${person({x:206,y:140,s:.56,c,pose:"think",hair:"bob",face:"smile"})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
