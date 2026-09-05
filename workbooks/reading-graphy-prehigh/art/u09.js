/* Unit 9 삽화 — 만화 + 인포그래픽 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

const icons = {
 wait:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M18 8h28M18 56h28" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M22 8c0 12 10 16 10 24s-10 12-10 24M42 8c0 12-10 16-10 24s10 12 10 24" stroke="${c}" stroke-width="3" fill="none"/>
  <path d="M25 48c3-7 11-7 14 0z" fill="${c}"/><path d="M25 16c3 7 11 7 14 0z" fill="${c}" opacity=".45"/></svg>`,
 blood:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 8c11 15 18 22 18 31a18 18 0 0 1-36 0c0-9 7-16 18-31z" fill="${c}" opacity=".22" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 30c5 6 8 9 8 13a8 8 0 0 1-16 0c0-4 3-7 8-13z" fill="${c}"/></svg>`,
 thou:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 14h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H18l-8 7v-7H8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" fill="${c}"/>
  <path d="M34 26h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4h-4v7l-8-7H34a4 4 0 0 1-4-4V30a4 4 0 0 1 4-4z" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M12 22h12M12 28h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
 screen:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="6" y="12" width="52" height="34" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M27 22l14 7-14 7z" fill="${c}"/>
  <path d="M22 56h20M32 46v10" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 nostalgia:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 50V22M8 50h48" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M14 44c8 0 8-24 16-24s10 24 18 24 8-10 8-10" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <circle cx="30" cy="20" r="4" fill="${c}"/>
  <path d="M46 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${c}" opacity=".6"/></svg>`,
};

const scenes = {
 wait:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:20,w:274,h:196,c:d,fill:"#fff",n:1,label:"약속이 깨졌던 방"})}
  ${person({x:106,y:204,s:.9,c,pose:"hold",hair:"curly",face:"worry",brow:"down"})}
  <circle cx="212" cy="150" r="18" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  ${prop.clock(232,72,1,c)}
  ${label({x:157,y:238,text:"먼저 집는다",c:d,size:11,op:.75})}
  ${panel({x:346,y:20,w:274,h:196,c:d,fill:"#fff",n:2,label:"약속이 지켜졌던 방"})}
  ${person({x:432,y:204,s:.9,c,pose:"think",hair:"curly",face:"smile"})}
  <circle cx="538" cy="150" r="18" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  <circle cx="576" cy="150" r="18" fill="${c}" opacity=".45" stroke="${d}" stroke-width="2.6"/>
  ${thought({x:452,y:44,w:150,h:42,lines:["노래나 불러 볼까"],c:d,size:11,side:"r"})}
  ${label({x:483,y:238,text:"상황을 바꾼다",c:d,size:11,op:.75})}
  ${label({x:320,y:270,text:"기다림은 의지가 아니라 신뢰와 방법의 문제다",c,size:12.5})}</svg>`,
 blood:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:22,w:270,h:190,c:d,fill:"#fff",n:1,label:"대가 없이 줄 때"})}
  ${person({x:104,y:196,s:.86,c,pose:"open",hair:"short",face:"glad",brow:"up"})}
  ${person({x:212,y:196,s:.86,c,pose:"open",hair:"bob",face:"smile",flip:1})}
  ${bubble({x:98,y:46,w:126,h:36,lines:["누군가에게"],c:d,tail:"bl",size:11.5})}
  ${panel({x:348,y:22,w:270,h:190,c:d,fill:"#fff",n:2,label:"값을 치를 때"})}
  ${person({x:430,y:196,s:.86,c,pose:"think",hair:"short",face:"flat"})}
  ${prop.coin(534,120,1.3,c)}
  ${thought({x:452,y:40,w:158,h:44,lines:["이 값이 그만한가?"],c:d,size:11,side:"r"})}
  ${arrow({x1:300,y1:118,x2:340,y2:118,c:d,w:5})}
  ${label({x:320,y:244,text:"값이 붙으면 질문이 바뀐다",c:d,size:11.5})}
  ${label({x:320,y:270,text:"이제는 돈이 아니라 시간과 편의를 두고 경쟁한다",c,size:12.5})}</svg>`,
 thou:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${person({x:130,y:230,s:1,c,pose:"open",hair:"short",face:"smile"})}
  ${person({x:510,y:230,s:1,c,pose:"open",hair:"cap",face:"flat",flip:1})}
  ${bubble({x:206,y:40,w:112,h:40,lines:["thou"],c:d,fill:c,tail:"br",size:15})}
  ${bubble({x:326,y:40,w:112,h:40,lines:["you"],c:d,fill:"#fff",tail:"bl",size:15})}
  ${label({x:262,y:108,text:"가까운 한 사람에게",c:d,size:11,op:.8})}
  ${label({x:382,y:108,text:"격식을 갖출 때",c:d,size:11,op:.8})}
  <path d="M206 140h232" stroke="${d}" stroke-width="3" stroke-dasharray="8 7" opacity=".55"/>
  ${callout({x:322,y:140,tx:322,ty:180,text:"둘 사이의 거리를 고르는 일",c:d})}
  ${arrow({x1:238,y1:214,x2:400,y2:214,c:d,w:4})}
  ${label({x:320,y:250,text:"격식 쪽이 모든 자리를 차지했다",c:d,size:11.5})}
  ${label({x:320,y:272,text:"언어는 화자들이 여전히 해야 하는 구별만 지킨다",c,size:12.5})}</svg>`,
 screen:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:24,w:270,h:184,c:d,fill:"#fff",n:1,label:"옮겨진 절반 — 전달"})}
  ${prop.screen(155,104,2.4,c)}
  ${[[112,164],[155,164],[198,164]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="${c}" opacity=".5"/>`).join("")}
  ${label({x:155,y:190,text:"멈추고 되감는다",c:d,size:11,op:.75})}
  ${panel({x:350,y:24,w:270,h:184,c:d,fill:"#fff",n:2,label:"남은 절반 — 교실 읽기"})}
  ${person({x:420,y:190,s:.82,c,pose:"point",hair:"bob",face:"smile"})}
  ${person({x:512,y:190,s:.82,c,pose:"down",hair:"short",face:"worry",brow:"down"})}
  ${person({x:582,y:190,s:.82,c,pose:"down",hair:"curly",face:"smile"})}
  ${callout({x:512,y:130,tx:520,ty:82,text:"저 학생이 막혔다",c:d})}
  ${arrow({x1:298,y1:116,x2:342,y2:116,c:d,w:5})}
  ${label({x:320,y:240,text:"어려운 절반은 있던 자리에 남았다",c:d,size:11.5})}
  ${label({x:320,y:268,text:"전달과 가르침은 같은 말이 아니다",c,size:12.5})}</svg>`,
 nostalgia:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <path d="M70 206V44M70 206h520" stroke="${d}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M86 194c34 0 44-118 88-118s54 118 88 118 44-8 88-8 54 6 88 6 44 2 66 2" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="126" y="44" width="88" height="162" fill="${c}" opacity=".12"/>
  ${label({x:170,y:36,text:"14 ~ 24세",c:d,size:11.5})}
  ${label({x:44,y:52,text:"많이",c:d,size:10.5,anchor:"end"})}
  ${label({x:44,y:210,text:"적게",c:d,size:10.5,anchor:"end"})}
  ${label({x:330,y:228,text:"나이 →",c:d,size:11})}
  ${person({x:170,y:206,s:.5,c,pose:"up",hair:"curly",face:"glad"})}
  ${person({x:520,y:206,s:.5,c,pose:"think",hair:"short",face:"flat"})}
  ${bubble({x:392,y:52,w:222,h:44,lines:["요즘 음악은 예전만 못해"],c:d,tail:"bl",size:12})}
  ${label({x:320,y:262,text:"그 느낌은 음악이 아니라 내 기억의 무늬를 증명한다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "41":["hourglass","balance","shield","loop","sprout"],
 "42":["heartbeat","coin","pair","balance","nope"],
 "43":["quote","chat","pair","swap","tag"],
 "44":["frame","spark","eye","warn","pair"],
 "45":["ruler","loop","palette","hourglass","heartbeat"]
};

const VIG = {
 "41":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:56,y:132,s:.6,c,pose:"think",hair:"curly",face:"smile"})}
  <circle cx="146" cy="96" r="15" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  <circle cx="184" cy="96" r="15" fill="${c}" opacity=".45" stroke="${d}" stroke-width="2.6"/>
  ${thought({x:84,y:14,w:130,h:32,lines:["다른 데를 보자"],c:d,size:10.5,side:"l"})}</svg>`,
 "42":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:52,y:132,s:.6,c,pose:"open",hair:"short",face:"glad"})}
  ${person({x:118,y:132,s:.6,c,pose:"open",hair:"bob",face:"smile",flip:1})}
  ${prop.coin(198,60,1.1,c)}
  <path d="M170 60h-14" stroke="${d}" stroke-width="3" stroke-dasharray="4 4"/>
  ${label({x:120,y:146,text:"의미가 바뀐다",c:d,size:10.5})}</svg>`,
 "43":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({x:66,y:44,text:"thou",c})}
  ${tag({x:172,y:44,text:"you",c,fill:"#fff"})}
  <path d="M98 44h44" stroke="${d}" stroke-width="3" stroke-dasharray="5 5"/>
  ${arrow({x1:70,y1:88,x2:170,y2:88,c:d,w:3.6})}
  ${label({x:120,y:120,text:"격식 쪽이 남았다",c:d,size:10.5})}</svg>`,
 "44":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.screen(58,60,1.6,c)}
  ${arrow({x1:104,y1:60,x2:134,y2:60,c:d,w:4})}
  ${person({x:166,y:126,s:.56,c,pose:"point",hair:"bob",face:"smile"})}
  ${person({x:214,y:126,s:.56,c,pose:"down",hair:"short",face:"worry",brow:"down"})}
  ${label({x:120,y:144,text:"읽히지 않는 절반",c:d,size:10.5})}</svg>`,
 "45":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M20 116V22M20 116h206" stroke="${d}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 108c16 0 22-70 44-70s28 70 50 70 22-6 44-4 22 2 34 2" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="52" y="22" width="48" height="94" fill="${c}" opacity=".14"/>
  ${label({x:76,y:16,text:"14–24",c:d,size:10})}
  ${label({x:120,y:140,text:"회상 절정",c:d,size:11})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
