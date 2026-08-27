/* ============================================================
   1. DATA  — 우주: 세 은하(문법·독해·보카)의 커리큘럼 격자
   ============================================================ */
function readData(id){ return JSON.parse(document.getElementById(id).textContent); }

/* ── 우주 구도 ────────────────────────────────────────────────────────
   세 은하를 눈대중 좌표로 흩어 두었더니 크기도 높이도 제각각이었다 —
   앞으로 나온 은하는 원근 때문에 혼자 커지고, 한쪽으로 쏠려 기울어 보였다.

   이제는 카메라를 기준으로 배치한다.
   · 우주 모드의 요(U_YAW)를 0으로 고정하면 세계의 X축이 화면의 가로축과
     그대로 겹친다 — 좌우를 ±U_SX 로 두는 것만으로 화면에서 정확히 대칭이 된다.
   · 세 은하를 카메라에서 같은 깊이(U_DEPTH)에 두면 원근 배율이 같아
     원반 크기가 셋 다 똑같아진다. 높이를 바꾸면 깊이가 따라 변하므로,
     uPlace() 가 그만큼 z 를 되돌려 깊이를 일정하게 지킨다.
   구도는 가운데가 낮고 양옆이 올라간 좌우 대칭 삼각형 — 가장 무거운
   문법 은하가 한가운데 아래에 앉아 전체를 받친다. */
const U_YAW=0, U_PITCH=0.46, U_PUSH=1250;
const U_DEPTH=1320;          /* 카메라에서 세 은하까지의 공통 깊이 */
const U_SX=1180;             /* 좌우 은하의 가로 간격             */
const U_UP=-390, U_DOWN=450; /* 양옆은 올리고 가운데는 내린다      */
/* 이름판이 앉는 높이. 원반의 위쪽 테두리는 중심에서 253 남짓 올라오므로
   그보다 넉넉히 위여야 글자가 별밭에 묻히지 않는다. */
const NP_Y=-430;
function uPlace(sx,wy){
  const sp=Math.sin(U_PITCH), cp=Math.cos(U_PITCH);
  /* 화면 깊이 z2 = wy·sin(pitch) + wz·cos(pitch) 가 U_DEPTH 로 일정하도록 wz 를 푼다 */
  return {x:sx, y:wy, z:(U_DEPTH-wy*sp)/cp - U_PUSH};
}

/* 우주 배치. pos 는 uPlace 가 계산한 우주 좌표(x 가로 · y 높이(-가 위) · z 깊이). orient 는 은하마다
   다른 원반 기울기 — 실제 심우주 사진처럼 제각각 기울어 떠 있다가, 한 은하로
   파고들면 그 은하만 수평으로 돌아온다(oAmt). 기울기는 작게만 준다: 카메라
   피치(0.46)와 은하 자체 기울기(0.20) 위에 음수 rx 를 얹으면 원반이 옆에서
   본 각도로 눌려 이름표가 서로 겹친 줄무늬가 된다 — 독해 은하가 그랬다. accent 는 은하의 고유 전류색,
   silver 는 전체 전개(은하 모드)에서 격자가 입는 은은한 금속색이다. */
/* 왼쪽부터 보카 · 문법 · 독해 — 화면 순서가 곧 학습 순서(어휘 → 문법 → 독해)이고,
   머리띠의 은하 단추와 왼쪽 패널의 카드도 같은 차례로 선다.
   기울기도 좌우가 서로의 거울이다(rz 부호만 반대). */
const GALAXIES=[
  { id:'vocab', name:'VOCAB', kr:'보카 은하', tagline:'옳은보카 VOL.0 – ULTIMATE',
    dataId:'nexus-data-vocab', fullDepth:2,
    pos:uPlace(-U_SX,U_UP),  orient:{rx:0.20,rz:0.16},
    accent:[74,223,158],  silver:{base:[146,200,172],hot:[226,255,240]} },
  { id:'grammar', name:'GRAMMAR', kr:'문법 은하', tagline:'중등 문법 커리큘럼',
    dataId:'nexus-data-grammar', fullDepth:2,
    pos:uPlace(0,U_DOWN),    orient:{rx:0.26,rz:0},
    accent:[41,168,255],  silver:{base:[152,176,208],hot:[240,248,255]} },
  { id:'reading', name:'READING', kr:'독해 은하', tagline:'READING GRAPHY · 옳은 독해',
    dataId:'nexus-data-reading', fullDepth:3,
    pos:uPlace(U_SX,U_UP),   orient:{rx:0.20,rz:-0.16},
    accent:[255,138,80],  silver:{base:[216,172,142],hot:[255,238,222]} },
];

/* ── 활성 은하의 상태는 이 전역들로 풀려 들어온다(bindGalaxy) ──
   엔진의 나머지 전부가 이 이름들을 읽으므로, 은하 전환은 곧 전역 교체다. */
let DATA, BOOK, ITEM, CHAP, STRAND, TOPIC, TOPICMETA, GRADE, TR, UW, MB_NAME,
    ROOT, focus, live, rot, spin, expandAll, gradeFilter, galaxyAmt, jumpBook,
    totalItems, totalSheets, SILVER, ACCENT, FULL_DEPTH, GDUST;
let ACTIVE=null, CURG=null;

/* 우주 모드: 셋이 한 하늘에 떠 있다. 은하 하나로 파고들면 세계의 중심(WC)이
   그 은하 자리로 미끄러져, 활성 은하는 언제나 원점에 온다 — 원점을 가정하고
   짜인 기존 배치·프레이밍 코드가 그대로 성립하는 이유다. */
let universeMode=true, uAmt=1;
const WC={x:0,y:0,z:0}, WCT={x:0,y:0,z:0};
const GOFF={x:0,y:0,z:0};              /* 지금 그리는 은하의 세계 오프셋 */
let GOR={rx:0,rz:0}, GORA=0;           /* 그 은하의 원반 기울기와 강도   */
let GDIM=1;                            /* 배경 은하 감쇠                 */

function buildGalaxyState(gal){
  const dat=readData(gal.dataId);
  const S={ DATA:dat, BOOK:{}, ITEM:{}, CHAP:{}, STRAND:{}, TOPIC:{}, TOPICMETA:{}, GRADE:{} };
  dat.books.forEach(b=>{
    S.BOOK[b.id]=b;
    b.chapters.forEach(c=>{
      c.bookId=b.id; S.CHAP[b.id+'/'+c.no]=c;
      c.items.forEach(i=>{ i.bookId=b.id; i.chapNo=c.no; S.ITEM[i.id]=i; });
    });
  });
  S.totalItems=Object.keys(S.ITEM).length;
  S.totalSheets=Object.keys(dat.worksheets||{}).length;
  (dat.topics||[]).forEach(t=>{
    S.TOPIC[t.id]=[];
    t.chapters.forEach(([bid,no])=>{
      const b=S.BOOK[bid], c=S.CHAP[bid+'/'+no];
      if(!b||!c) return;
      S.TOPIC[t.id].push({book:b,chap:c});
      const k=bid+'/'+no;
      (S.STRAND[k]=S.STRAND[k]||[]).push(t.id);
    });
    S.TOPICMETA[t.id]=t;
  });
  dat.books.forEach(b=>{
    const c=b.current||{base:[110,140,200],hot:[190,210,240],rank:0,of:1};
    S.GRADE[b.id]={base:c.base,hot:c.hot,rank:c.rank,of:c.of,label:b.short||b.id,chip:b.chip||b.short};
  });
  S.TR=Object.assign(
    { recall:'REVIEW TEST', check:'GRAMMAR CHECK',
      vol:'ORUN METABOOK', volTitle:['ORUN','METABOOK'],
      recallF:'ReviewTest', checkF:'GrammarCheck' },
    (dat.meta&&dat.meta.track)||{});
  S.UW=S.TR.unit||'UNIT';
  S.MB_NAME=S.TR.vol;
  const root=mk('core',gal.name,gal.kr);
  dat.books.forEach(b=>{
    const kn = mk('book',b.short||b.title,b.band,b);
    kn.parent=root; root.children.push(kn);
    b.chapters.forEach(c=>{
      const cn = mk('chap','CH '+c.no+'. '+c.title,c.titleEn||'',c);
      cn.parent=kn; kn.children.push(cn);
      c.items.forEach(it=>{
        const inode = mk('item',it.title,'',it);
        inode.parent=cn; cn.children.push(inode);
      });
    });
  });
  (function depth(n,d,bk){
    n.ring=d; n.bk=bk;
    n.children.forEach(c=>depth(c,d+1, n.kind==='book'? n.payload.id : bk));
  })(root,0,null);
  S.ROOT=root;
  S.focus=[root]; S.live=[]; S.rot=0; S.spin=Math.random()*360;
  S.expandAll=true; S.gradeFilter=null; S.galaxyAmt=1; S.jumpBook=null;
  S.SILVER={base:gal.silver.base,hot:gal.silver.hot,rank:0,of:1,label:''};
  S.ACCENT=gal.accent;
  S.FULL_DEPTH=gal.fullDepth||2;
  /* 은하마다 제 먼지 벨트를 갖는다 — 같은 배열을 셋이 나눠 쓰면 세 은하가
     같은 무늬로 반짝여 복제품처럼 보인다. */
  S.GDUST=[];
  for(let i=0;i<300;i++){
    const a=Math.random()*Math.PI*2;
    const r=205*0.55+Math.pow(Math.random(),0.62)*(596*1.12-205*0.55);
    S.GDUST.push({a:a,r:r,y:(Math.random()-.5)*90*(1-r/(596*1.2)),
                  b:Math.pow(Math.random(),1.7),s:(Math.random()*.10+.02)*(Math.random()<.5?-1:1)});
  }
  /* 등대 회로선 팔레트 — 은하의 전류색으로 물든다 */
  const AC=gal.accent;
  const mxc=(a,b,t)=>[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];
  const pale=mxc(AC,[255,255,255],.55), lite=mxc(AC,[255,255,255],.75);
  gal.tw={
    ribF:RGBA(pale,.62), ribB:RGBA(AC,.16),
    ringF:RGBA(pale,.72), ringB:RGBA(AC,.20), ringBrand:RGBA(mxc(AC,[255,255,255],.42),.95),
    pad:RGBA(lite,.9),
    bookFill:RGBA(mxc(AC,[30,120,190],.5),.10), bookLine:RGBA(pale,.60), bookRule:RGBA(AC,.34),
  };
  gal.dustCol=mxc(AC,[255,255,255],.80);
  gal.S=S; gal.oAmt=1;
  return S;
}

function stashGalaxy(){
  if(!ACTIVE) return;
  const S=ACTIVE.S;
  S.focus=focus; S.live=live; S.rot=rot; S.spin=spin;
  S.expandAll=expandAll; S.gradeFilter=gradeFilter; S.galaxyAmt=galaxyAmt;
  S.jumpBook=jumpBook;
}
/* 우주 돌리 — 우주 모드에서는 하늘 전체를 카메라에서 밀어낸다.
   은하들이 FOV(1500)와 맞먹는 깊이에 떠 있으면 앞쪽 원반 가장자리가
   카메라를 스치며 투영이 폭주해 프레임이 터진다. 뒤로 물리면 원근도
   심우주답게 순해진다. 은하로 파고들면(uAmt→0) 밀림도 0으로 돌아와
   활성 은하는 예전 그대로의 자리에서 그려진다. */
function uPush(){ return U_PUSH*uAmt; }
function setGOFF(g){
  GOFF.x=g.pos.x-WC.x; GOFF.y=g.pos.y-WC.y; GOFF.z=g.pos.z-WC.z+uPush();
}
function setGalaxyFrame(g){
  CURG=g;
  setGOFF(g);
  GOR=g.orient; GORA=g.oAmt==null?1:g.oAmt;
}
function bindGalaxy(g){
  if(ACTIVE!==g){ stashGalaxy(); ACTIVE=g; }
  const S=g.S;
  DATA=S.DATA; BOOK=S.BOOK; ITEM=S.ITEM; CHAP=S.CHAP;
  STRAND=S.STRAND; TOPIC=S.TOPIC; TOPICMETA=S.TOPICMETA; GRADE=S.GRADE;
  TR=S.TR; UW=S.UW; MB_NAME=S.MB_NAME;
  ROOT=S.ROOT; focus=S.focus; live=S.live; rot=S.rot; spin=S.spin;
  expandAll=S.expandAll; gradeFilter=S.gradeFilter; galaxyAmt=S.galaxyAmt;
  jumpBook=S.jumpBook; totalItems=S.totalItems; totalSheets=S.totalSheets;
  SILVER=S.SILVER; ACCENT=S.ACCENT; FULL_DEPTH=S.FULL_DEPTH; GDUST=S.GDUST;
  setGalaxyFrame(g);
}
/* 잠깐 다른 은하를 손에 들고 일한다 — 시뮬레이션·배경 렌더용.
   활성 은하의 전역은 끝나면 제자리로 돌아온다. */
function withGalaxy(g,fn){
  if(g===ACTIVE){ setGalaxyFrame(g); fn(); stashGalaxy(); return; }
  const prev=ACTIVE;
  bindGalaxy(g);
  try{ fn(); } finally{ bindGalaxy(prev); }
}

GALAXIES.forEach(buildGalaxyState);
ACTIVE=GALAXIES[0]; bindGalaxy(ACTIVE);

const U_UNITS = GALAXIES.reduce((s,g)=>s+g.S.totalItems,0);
const U_SHEETS = GALAXIES.reduce((s,g)=>s+g.S.totalSheets,0);
const U_BOOKS = GALAXIES.reduce((s,g)=>s+g.S.DATA.books.length,0);

function buildLegend(){
  /* The legend IS the difficulty axis: one ramp, a tick per textbook we hold. */
  const el=document.getElementById('legend');
  const total=DATA.rankTotal||DATA.books.length;
  const shown=b=>!gradeFilter||(b.grades||[]).indexOf(gradeFilter)>=0;
  const stops=DATA.books
    .map(b=>({b:b,g:GRADE[b.id],on:shown(b)}))
    .filter(x=>x.g&&x.g.rank)
    .sort((a,b)=>a.g.rank-b.g.rank);
  if(!stops.length){ el.innerHTML=''; return; }
  const grad=stops.map(x=>CSS(x.g.base)+' '+(((x.g.rank-.5)/total)*100).toFixed(1)+'%').join(',');
  el.innerHTML=
    '<span class="cap">기초</span>'
    +'<span class="bar" style="background:linear-gradient(90deg,'+grad+')">'
    + stops.map(x=>'<button data-b="'+x.b.id+'" style="left:'+(((x.g.rank-.5)/total)*100).toFixed(1)+'%'
        +(x.on?'':';opacity:.25')+'"'
        +' title="'+esc(x.b.title)+' — '+esc(x.b.gradeTag||'')+'"><i></i></button>').join('')
    +'</span><span class="cap">수능</span>';
  el.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
    const n=ROOT.children.find(c=>c.payload&&c.payload.id===btn.dataset.b);
    if(n){ expandAll=false; syncAllBtn(); activate(n); }
  });
}
function strandsOf(chap){ return STRAND[chap.bookId+'/'+chap.no]||[]; }

/* ============================================================
   3. TREE  (core → band → book → chapter → item)
   — 트리는 buildGalaxyState 가 은하마다 하나씩 세운다.
   ============================================================ */
function mk(kind,label,sub,payload){
  /* 카운터를 함수에 붙인다 — 이 함수는 은하 상태를 세우는 초기 실행보다
     늦게 선언되므로, 바깥 let 카운터는 TDZ 에 걸린다. */
  mk.N=(mk.N||0)+1;
  return {uid:mk.N,kind,label,sub:sub||'',payload:payload||null,
          children:[],parent:null,a:0,r:0,x:0,y:0,tx:0,ty:0,vis:0,tvis:0,ring:0};
}

/* ============================================================
   4. LAYOUT — concentric orbital rings, one focus path
   ============================================================ */
/* 교재 고리를 205 에서 넓혔다 — 표지 열 권이 고르게 서려면 둘레가 그만큼
   필요하다. 챕터 고리(424)와는 여전히 넉넉히 떨어져 있다. */
const RADII=[0,258,424,596];
/* A fan sized to its child count. A fixed wedge strands 3 units across the
   same arc it gives 12 chapters, so they read as orphans rather than a branch. */
const PERCHILD=[0,9.5,11];
const MAXWEDGE=[0,112,40];
/* focus/live 는 은하 상태 — bindGalaxy 가 채운다 */

function isOnPath(n){ return focus.indexOf(n)>=0; }

/* rot·expandAll·gradeFilter 도 은하 상태다 */
function bookShown(n){
  if(!gradeFilter) return true;
  const g=n&&n.payload&&n.payload.grades;
  return !g || g.indexOf(gradeFilter)>=0;
}
/* only ring 1 is filtered; everything below inherits its book's visibility */
function kidsOf(n){ return n===ROOT ? n.children.filter(bookShown) : n.children; }

/* 전체 전개는 CHAPTER 까지만 편다 — UNIT 까지 펼치면 454개가 한 화면에
   깔려 아무것도 읽히지 않는다. UNIT 은 교재를 골라 들어가면 나온다. */
/* FULL_DEPTH 는 은하 상태 — 문법·보카 2(CHAPTER 까지), 독해 3(UNIT 까지) */
/* 다만 그건 그 은하를 보고 있을 때 이야기다. 우주 화면과 배경으로 물러난
   은하는 어느 것이든 CHAPTER 까지만 편다 — 독해 은하만 UNIT 168개까지
   펼치면 원반이 혼자 1.4배로 커져 옆 은하를 밀어내고, 그 크기에서 지문
   제목은 어차피 읽히지 않는다. 들어가면 그때 UNIT 까지 펼쳐진다. */
function fullDepth(){
  return (CURG===ACTIVE && !universeMode) ? FULL_DEPTH : Math.min(2,FULL_DEPTH);
}
/* Angle is shared out by leaf count, not by sibling count, so every chapter
   ends up the same width no matter how lopsided the books are. */
function leaves(n,d){
  d=d||0;
  const k=(d>=fullDepth())?[]:kidsOf(n);
  if(!k.length) return 1;
  return k.reduce((s,c)=>s+leaves(c,d+1),0);
}
function layoutFull(){
  live=[ROOT];
  ROOT.a=ROOT.baseA=0; ROOT.r=0;
  const seen=new Set([ROOT]);
  rot=0;
  const FD=fullDepth();
  const RSTEP=[0,0,64,86];
  (function place(node,start,span,depth){
    if(depth>FD) return;
    let a=start;
    const kids=kidsOf(node);
    /* 교재가 원을 똑같이 나눠 가지면, 챕터가 많은 교재는 좁은 몫에 몰린다
       (옳은보카 Ultimate 는 29 파트가 36° 안에 든다). 각으로 못 벌린 만큼
       반지름으로 벌린다 — 아홉 개마다 한 겹씩, 최대 네 겹. */
    const rings = depth>=2 ? Math.max(2,Math.min(4,Math.ceil(kids.length/9)))
                : depth===1 ? 2 : 1;
    const spread= depth===2 ? 150 : 180;
    const step  = depth>=2 ? (rings>2 ? spread/(rings-1) : RSTEP[depth])
                : depth===1 ? 76 : 0;
    kids.forEach((k,i)=>{
      /* 교재(ring 1)는 담은 단원 수와 상관없이 원을 똑같이 나눠 갖는다.
         예전에는 단원 수에 비례해 나눠서, 29파트짜리 옳은보카 Ultimate 혼자
         원의 3분의 1을 차지하고 작은 교재들의 표지는 서로 포개졌다.
         표지가 고르게 놓여야 지도가 대칭으로 읽힌다 — 세 은하 모두 같다.
         그 아래 챕터는 제 교재가 받은 몫 안에서 다시 고르게 나뉜다. */
      const w = depth===1 ? span/kids.length
                          : span*leaves(k,depth)/leaves(node,depth-1);
      k.baseA=a+w/2; k.a=k.baseA;
      /* 같은 겹의 이웃까지 벌어진 각 — 이름표를 낼 자리가 있는지 재는 데 쓴다 */
      k.arcW = w*rings;
      /* 이웃한 것끼리 같은 고리에 서지 않도록 한 칸씩 밖으로 물린다.
         표지도 마찬가지다 — 원반은 기울어 있어서 고리의 좌우 끝에서는
         이웃 표지가 원근에 눌려 달라붙는다. 두 겹으로 엇갈리게 놓으면
         그 자리에서도 반지름 차이만큼 간격이 생긴다. */
      k.r=RADII[depth]+(i%rings)*step;
      live.push(k); seen.add(k);
      place(k,a,w,depth+1);
      a+=w;
    });
  })(ROOT,-90,360,1);
  live.forEach(n=>{ n.dim=1; });
  finishLayout(seen);
}
/* The books drift clockwise around the lighthouse whenever nothing is open.
   Angles are the stored form (n.a) and the cartesian target is derived, so a
   single global offset turns the whole lattice rigidly — fans included. */
/* spin 도 은하 상태다.
   초당 각도다. 프레임당으로 세면 느린 기계에서 더 느리게 돌아 같은 화면이
   아니게 된다. 은하는 한 바퀴 ~2분, 파고든 화면은 ~2.9분. */
const SPIN_GAL=3.0, SPIN_FOCUS=2.1;
/* 화면의 움직임 전부를 쥔 스위치 — 회전, 연결선을 지나는 전류, 별의 반짝임.
   예전에는 이것들이 OS 의 '동작 줄이기'에 묶여 있어서, 그 설정을 켜 둔
   기계에서는 판이 통째로 얼어붙은 채 이유도 보이지 않았다. 접근성 설정이
   덜어내고 싶은 것은 갑작스러운 움직임이지 이 흐름이 아니다. 눈에 보이는
   버튼으로 내주고, 기본은 켜 둔다. */
let motionOn=true;
try{ motionOn = localStorage.getItem('orun.spin')!=='0'; }catch(e){}
function orbit(dt){
  /* 파고든 화면에서는 이름표를 읽으라고 커서가 노드에 얹히면 멈춘다.
     은하는 노드가 611개라 커서가 거의 항상 뭔가에 걸리고, 그러면 판이
     통째로 얼어붙는다 — 여기서는 끌고 있을 때만 멈춘다. */
  const calm = expandAll ? !drag : (focus.length<=1 && !hover && !drag);
  /* prefers-reduced-motion 에 묶어 두었더니, OS 에서 '동작 줄이기'를 켠
     기계에서는 판이 통째로 멈춘 채 이유도 보이지 않았다. 접근성 설정이
     끄고 싶은 것은 반짝임·떨림이지 이 느린 회전이 아니다. 회전은 눈에
     보이는 버튼으로 내주고, RM 은 첫 진입 연출에만 남긴다. */
  if(motionOn && calm) spin -= (expandAll? SPIN_GAL : SPIN_FOCUS)*dt;
  const gx=galaxyAmt;
  const RIM=RADII[RADII.length-1]||600;
  live.forEach(n=>{
    if(n===ROOT||n.a==null) return;
    const ang=n.a+spin, rad=ang*Math.PI/180;
    /* the disc widens as it becomes a galaxy — more spread, more perspective */
    const rr=n.r*(1+0.17*gx);
    n.tx=Math.cos(rad)*rr; n.ty=Math.sin(rad)*rr;
    /* a swell riding around the ring — two crests per turn, drifting slowly
       against the rotation, so the ring breathes instead of every node
       bobbing on its own clock. Deeper rings move less or the fans shear. */
    const amp = n.ring<=1 ? 9 : n.ring===2 ? 5 : 3;
    n.bob = Math.sin(rad*2 + spin*.035) * amp;
    /* Galaxy mode gives the lattice a third dimension: the plane is sheared
       into a tilted disc, warped along one axis the way real discs are, and
       given thickness that swells toward the core. Flat rings read as a
       diagram; this reads as something you are looking into. */
    if(gx>0.004){
      const tR=Math.min(1.35,rr/RIM);
      const warp = Math.sin(rad*1.0+0.55)*54*Math.pow(tR,1.7);
      const puff = 16+62*Math.exp(-tR*tR*2.4);
      const scat = (hash01(n.uid*0.7311)-0.5)*2*puff;
      n.gy = (warp+scat)*gx;
    } else n.gy=0;
  });
}
function finishLayout(seen){
  live.forEach(n=>{
    const rad=n.a*Math.PI/180;
    n.tx=Math.cos(rad)*n.r;
    n.ty=Math.sin(rad)*n.r;
    n.tvis=1;
    if(!n.px){ n.x=n.tx*0.35; n.y=n.ty*0.35; n.px=1; }
  });
  ROOT.tx=ROOT.ty=0;
  allNodes(ROOT,n=>{ if(!seen.has(n)) n.tvis=0; });
}

function layout(){
  if(expandAll){ layoutFull(); return; }
  live=[ROOT];
  ROOT.a=0; ROOT.r=0;
  const seen=new Set([ROOT]);

  // ring 1 — every textbook the grade filter admits
  const books=kidsOf(ROOT);
  if(!books.length){ finishLayout(new Set([ROOT])); return; }
  /* 90 is straight behind the tower, 270 straight in front, 0/180 the sides.
     A full ring only reads once there are enough books to fill it — with four
     or fewer, one always parks behind the lighthouse where it can't be seen,
     so those fan across the front arc (side → front → side) instead. */
  const FRONT = books.length<5;
  books.forEach((n,i)=>{
    n.baseA = FRONT
      ? 190 + 160*(books.length>1 ? i/(books.length-1) : .5)
      : -90 + (360/books.length)*i;
    n.r = RADII[1];
    live.push(n); seen.add(n);
  });

  /* Aim the focused book at 180°: the open fan then always sweeps the same
     side, the core holds centre, and the dormant books park opposite.
     Take the short way round so the spin never doubles back. */
  const want = (focus.length>=2 && focus[1].baseA!=null) ? 180-focus[1].baseA : 0;
  rot += ((want-rot)%360+540)%360-180;
  books.forEach(n=>{ n.a = n.baseA + rot; });

  // expand along focus path
  for(let d=1; d<focus.length; d++){
    const p=focus[d];
    const kids=p.children;
    if(!kids.length) break;
    const span = kids.length>1
      ? Math.min(MAXWEDGE[d]||40, kids.length*(PERCHILD[d]||10))
      : 0;
    const start = p.a - span/2;
    const step = kids.length>1 ? span/(kids.length-1) : 0;
    kids.forEach((n,i)=>{
      n.a = start + step*i;
      n.baseA = n.a - rot;
      n.r = RADII[d+1];
      live.push(n); seen.add(n);
    });
  }

  /* Siblings of the focused branch stay on screen but recede, so the open
     path reads as the subject rather than one strand among many. */
  const tail=focus[focus.length-1];
  live.forEach(n=>{
    n.dim = (isOnPath(n) || n.parent===tail || n.kind==='book' || n.kind==='core')
      ? 1
      : (n.parent && isOnPath(n.parent) ? .55 : .62);
  });

  finishLayout(seen);
}
function allNodes(n,fn){ fn(n); n.children.forEach(c=>allNodes(c,fn)); }

/* ============================================================
   5. CAMERA — the lattice lives on a tilted plane in perspective.
   Nodes carry (x,z) from the radial layout; each ring lifts on Y, so
   the structure reads as a shallow bowl rather than a flat dial.
   ============================================================ */
let W=0,H=0,DPR=1;
const cv=document.getElementById('map');
let ctx=cv.getContext('2d');
const LIFT=[0,38,94,158];
const FOV=1500;
/* 두 모드는 보는 각이 다르다. 은하는 낮게 깔아야 원반이 원반으로 보이고
   등대가 그 한가운데 선 것처럼 읽힌다. 한 교재로 파고든 화면은 그 각으로
   보면 배치가 한쪽으로 쏠려서, 내려다보는 각으로 되돌린다.
   사용자가 직접 기울인 뒤에는(pitchUser) 건드리지 않는다. */
const PITCH_GALAXY=0.38, PITCH_FOCUS=0.80, PITCH_UNIVERSE=U_PITCH;
/* 우주 화면의 요는 0 이어야 좌우 대칭이 성립한다(세계의 X축 = 화면의 가로축).
   은하로 파고들면 등대를 비스듬히 보는 예전 각으로 돌아간다. */
const YAW_UNIVERSE=U_YAW, YAW_FOCUS=-0.42;
let yawUser=false;
let pitchUser=false;
const cam={
  yaw:-0.42,  tyaw:-0.42,
  pitch:PITCH_GALAXY, tpitch:PITCH_GALAXY,
  zoom:1,     tzoom:1,
  px:0, py:0, tpx:0, tpy:0,
  idle:0,
};
/* 하한을 0.30 에서 올렸다 — 그보다 눕히면 원반이 한 줄 실선으로 눌려
   이름표가 서로 겹쳐 읽히지 않는다. 기울일 자유는 두되, 판이 읽히는
   각도 안에서만 움직이게 한다. */
const PITCH_MIN=0.44, PITCH_MAX=1.30;
/* 화면을 아직 자동으로 잡아도 되는가. 사용자가 카메라에 손을 대면 꺼지고,
   화면 맞춤·전개 전환처럼 다시 잡아 달라는 신호가 오면 켜진다. */
let autoFrame=true, framePend=false;
function modePose(){
  if(!pitchUser)
    cam.tpitch = universeMode? PITCH_UNIVERSE : (expandAll? PITCH_GALAXY : PITCH_FOCUS);
  if(!yawUser)
    cam.tyaw = universeMode? YAW_UNIVERSE : YAW_FOCUS;
}

function resize(){
  const r=cv.getBoundingClientRect();
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=r.width; H=r.height;
  cv.width=Math.max(1,Math.round(W*DPR));
  cv.height=Math.max(1,Math.round(H*DPR));
}
/* ---- baked backdrop: nebula and stars, nothing else -------------------
   The grid and the circuit traces are gone; a lattice drawn over a star
   field fights it. Baked on resize so the per-frame cost is one blit.  */
let BG=null;
function buildBackdrop(){
  if(W<2||H<2) return;
  BG=document.createElement('canvas');
  BG.width=Math.round(W*DPR); BG.height=Math.round(H*DPR);
  const g=BG.getContext('2d'); g.setTransform(DPR,0,0,DPR,0,0);
  /* One soft pool of light behind the tower. No stars, no lattice, no
     traces — the covers and the lighthouse are the subject; anything else
     back here just competes with them. */
  const g0=g.createRadialGradient(W*.5,H*.46,0,W*.5,H*.46,Math.max(W,H)*.62);
  g0.addColorStop(0,'rgba(28,74,124,.42)');
  g0.addColorStop(.45,'rgba(14,42,76,.22)');
  g0.addColorStop(1,'rgba(6,16,32,0)');
  g.fillStyle=g0; g.fillRect(0,0,W,H);
  const g1=g.createLinearGradient(0,H*.55,0,H);
  g1.addColorStop(0,'rgba(2,7,16,0)');
  g1.addColorStop(1,'rgba(1,4,11,.55)');
  g.fillStyle=g1; g.fillRect(0,H*.55,W,H*.45);
  /* 심우주 — 세 은하가 한 하늘에 떠 있으니, 바탕도 하늘이어야 한다.
     아주 옅은 별밭과 세 은하 전류색의 성운 기운 한 겹씩. 구울 때만 그린다. */
  for(let i=0;i<190;i++){
    const x=Math.random()*W, y=Math.random()*H, r=Math.random();
    g.fillStyle='rgba(208,228,250,'+(0.04+r*0.20).toFixed(3)+')';
    const s2=r<.86?1:1.6;
    g.fillRect(x,y,s2,s2);
  }
  [[0.16,0.30,[41,168,255]],[0.84,0.24,[255,138,80]],[0.46,0.80,[74,223,158]]].forEach(v=>{
    const c=v[2];
    const gg=g.createRadialGradient(W*v[0],H*v[1],0,W*v[0],H*v[1],Math.max(W,H)*.30);
    gg.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+',.05)');
    gg.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
    g.fillStyle=gg; g.fillRect(0,0,W,H);
  });
}
function drawBackdrop(){
  if(!BG) buildBackdrop();
  if(BG) ctx.drawImage(BG,0,0,W,H);
}

/* ---- static layers ---------------------------------------------------
   The tower and the floor rings only change when the camera does. Redrawing
   500 facets every frame to show the same pixels is the single biggest
   waste in the loop, so each is baked and blitted until the camera moves. */
function layerKey(){
  /* 우주 오프셋·원반 기울기·은하 전개량도 키에 들어간다 — 세계가 미끄러지는
     전환 동안 구운 층이 낡은 자리에 눌러앉지 않도록. */
  return [cam.yaw.toFixed(4),cam.pitch.toFixed(4),cam.zoom.toFixed(4),
          Math.round(cam.px),Math.round(cam.py),W|0,H|0,
          GOFF.x.toFixed(1),GOFF.y.toFixed(1),GOFF.z.toFixed(1),
          GORA.toFixed(3),galaxyAmt.toFixed(3)].join('|');
}
const LAYER={};
function cached(name,render){
  const L=LAYER[name] || (LAYER[name]={c:null,x:null,key:''});
  const k=layerKey();
  const wpx=Math.max(1,Math.round(W*DPR)), hpx=Math.max(1,Math.round(H*DPR));
  if(!L.c || L.c.width!==wpx || L.c.height!==hpx){
    L.c=document.createElement('canvas'); L.c.width=wpx; L.c.height=hpx;
    L.x=L.c.getContext('2d'); L.key='';
  }
  if(L.key!==k){
    L.key=k;
    L.x.setTransform(DPR,0,0,DPR,0,0);
    L.x.clearRect(0,0,W,H);
    const prev=ctx; ctx=L.x;
    try{ render(); } finally { ctx=prev; }
  }
  ctx.drawImage(L.c,0,0,W,H);
}

/* ---- bloom -----------------------------------------------------------
   Half-res copy of the frame, blurred, added back. On a dark scene only
   the emissive parts survive the add, which is exactly what we want:
   light that spills instead of light that stops at its own edge.      */
/* Bloom is the one effect that can outrun a weak GPU, so the loop watches
   its own frame time and steps quality down rather than dropping frames.
   Measured in software rendering it is expensive; on a real GPU the
   canvas-to-canvas blit it depends on is nearly free — hence adaptive. */
let QUALITY=2, ftAvg=16, ftLast=0;
function governor(now){
  if(ftLast){
    const dt=now-ftLast;
    if(dt<250) ftAvg=ftAvg*0.90+dt*0.10;
  }
  ftLast=now;
  if(ftAvg>27 && QUALITY>0){ QUALITY--; ftAvg=16; }
  else if(ftAvg<15.5 && QUALITY<2){ QUALITY++; ftAvg=16; }
}
let SC=null,SCx=null,bloomTick=0;
function bloom(){
  if(W<4||H<4||QUALITY===0) return;
  /* A quarter-scale copy IS the blur — bilinear upscaling smooths it back
     out for free, which costs a fraction of a real blur filter. The buffer
     refreshes every other frame; a soft glow one frame stale is invisible. */
  const w=Math.max(1,Math.round(W/4)), h=Math.max(1,Math.round(H/4));
  if(!SC||SC.width!==w||SC.height!==h){
    SC=document.createElement('canvas'); SC.width=w; SC.height=h;
    SCx=SC.getContext('2d'); bloomTick=0;
  }
  const every=QUALITY===2?2:4;
  if((bloomTick++ % every)===0){
    SCx.clearRect(0,0,w,h);
    SCx.drawImage(cv,0,0,w,h);
  }
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=.40; ctx.drawImage(SC,0,0,W,H);
  ctx.globalAlpha=.24; ctx.drawImage(SC,-W*.045,-H*.045,W*1.09,H*1.09);
  ctx.restore();
}

new ResizeObserver(()=>{ resize(); buildBackdrop(); if(autoFrame) framePend=true; })
  .observe(document.getElementById('stage'));
resize();

/* world → camera-relative screen offset (before zoom/pan) */
/* 은하 모드는 세계를 X축으로 눕혀 원반이 원반으로 보이게 한다. 등대까지
   같이 누우면 기울어진 탑이 되어, 판의 중심이라는 인상이 사라진다.
   등대를 그리는 동안만 이 깃발을 세워 그 회전에서 빼 준다 — 밑동은
   원점이라 회전해도 제자리이므로, 빼도 판 한가운데 그대로 선다. */
let towerUpright=false;
function project(wx,wy,wz){
  if(galaxyAmt>0.004 && !towerUpright){
    const th=0.20*galaxyAmt, ct=Math.cos(th), st=Math.sin(th);
    const y0=wy*ct - wz*st, z0=wy*st + wz*ct;
    wy=y0; wz=z0;
  }
  /* 은하마다 다른 원반 기울기 — 심우주 사진의 문법이다. 롤(rz) 다음 틸트(rx).
     등대와 이름판(towerUpright)은 이 기울기에서도 빠져 꼿꼿이 선다. */
  if(GORA>0.004 && !towerUpright){
    const rz=GOR.rz*GORA, cz=Math.cos(rz), szn=Math.sin(rz);
    const x0=wx*cz - wy*szn, y1=wx*szn + wy*cz;
    wx=x0; wy=y1;
    const rx=GOR.rx*GORA, cx=Math.cos(rx), sx2=Math.sin(rx);
    const y2b=wy*cx - wz*sx2, z1b=wy*sx2 + wz*cx;
    wy=y2b; wz=z1b;
  }
  /* 우주 오프셋 — 지금 그리는 은하가 하늘 어디에 떠 있는가 */
  wx+=GOFF.x; wy+=GOFF.y; wz+=GOFF.z;
  const cy=Math.cos(cam.yaw), sy=Math.sin(cam.yaw);
  const x1 =  wx*cy - wz*sy;
  const z1 =  wx*sy + wz*cy;
  const cp=Math.cos(cam.pitch), sp=Math.sin(cam.pitch);
  const y2 =  wy*cp - z1*sp;
  const z2 =  wy*sp + z1*cp;
  const k  =  FOV/Math.max(160,FOV+z2);
  return {sx:x1*k, sy:y2*k, k:k, z:z2};
}
function pt(wx,wy,wz){
  const p=project(wx,wy,wz);
  return [W/2+p.sx*cam.zoom+cam.px, H/2+p.sy*cam.zoom+cam.py, p.k, p.z];
}
const LANTERN=206;                       /* the lamp height — the map's true origin */
function lift(n){ return (n.kind==='core' ? -LANTERN : -(LIFT[n.ring]||0)) + (n.bob||0) + (n.gy||0); }
function toScreen(n){ return pt(n.x,lift(n),n.y); }

/* 노드가 화면에서 차지하는 자리는 점이 아니라 '점 + 바깥으로 뻗은 이름표'다.
   예전에는 이름표 몫을 넉넉한 상수(152px 따위)로 잡았는데, '관두부록 문장의
   구성' 같은 긴 이름은 그 상수를 넘겨서 창이 좁으면 글자가 화면 밖으로
   잘렸다. 글자 폭을 실제로 재서 그 끝까지 화면 안에 넣는다.
   이름표 크기는 zoom 에 딸려 움직이므로 배율을 두 번 굴려 수렴시킨다. */
/* ── 화면 맞춤 ────────────────────────────────────────────────────────
   판이 찌그러져 보이던 이유는 두 가지였다.

   (1) 은하 모드의 판은 쉬지 않고 돈다. 이름표는 노드에서 바깥으로 뻗으므로
       '지금 이 순간의 노드 자리'로 외곽을 재면, 판이 도는 동안 외곽선이
       계속 달라진다. 그걸 매 프레임 다시 재니 배율이 숨을 쉬듯 오르내렸다.
       회전과 무관한 것 — 원반의 반지름과 이름표가 뻗는 길이 — 으로 재면
       어느 각도에서도 같은 프레임이 나온다.

   (2) 전환(은하 진입·우주 복귀·전개 토글)이 흐르는 도중의 포즈로 재면
       카메라가 움직이는 표적을 쫓느라 끝내 자리를 잡지 못한다. 잴 때는
       전환이 끝난 뒤의 포즈로 재고(poseSettled), 한 번만 정한 뒤
       카메라가 그 자리로 미끄러지게 둔다. */

/* 재는 동안만 카메라·세계의 애니메이션 변수를 목표값으로 스냅한다. */
function poseSettled(fn){
  const k={ wx:WC.x, wy:WC.y, wz:WC.z, u:uAmt, p:cam.pitch, y:cam.yaw,
            ga:galaxyAmt, gora:GORA, ox:GOFF.x, oy:GOFF.y, oz:GOFF.z };
  WC.x=WCT.x; WC.y=WCT.y; WC.z=WCT.z;
  uAmt = universeMode?1:0;
  cam.pitch=cam.tpitch; cam.yaw=cam.tyaw;
  galaxyAmt = expandAll?1:0;
  if(CURG){ GORA=(CURG===ACTIVE&&!universeMode)?0:1; setGOFF(CURG); }
  try{ return fn(); }
  finally{
    WC.x=k.wx; WC.y=k.wy; WC.z=k.wz; uAmt=k.u;
    cam.pitch=k.p; cam.yaw=k.y; galaxyAmt=k.ga; GORA=k.gora;
    GOFF.x=k.ox; GOFF.y=k.oy; GOFF.z=k.oz;
  }
}

/* 이름표가 노드 바깥으로 뻗는 최대 길이(화면 px).
   글자 수로 '가장 긴 이름'을 고르면 틀린다 — 'The Post Office on th…' 보다
   글자 수는 적어도 더 넓게 그려지는 이름이 있다. 실제 폭을 재고, 같은
   문자열은 한 번만 재도록 캐시한다. */
const REACH_CACHE={};
function labelReach(z){
  const zk=z.toFixed(2);
  let best=0;
  live.forEach(n=>{
    if(n.kind==='core'||n.kind==='book') return;
    const cap = n.kind==='item'?22:20;
    let t=n.label||'';
    if(t.length>cap) t=t.slice(0,cap-1)+'…';
    const key=n.kind+'|'+zk+'|'+t;
    let w=REACH_CACHE[key];
    if(w==null) w=REACH_CACHE[key]=mw(t, labelFont(n, 1, z));
    if(w>best) best=w;
  });
  return best ? 13 + 10 + best + 8 : 0;
}

function frameAt(z){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const add=(sx,sy,pad,padY)=>{
    x0=Math.min(x0,sx-pad); x1=Math.max(x1,sx+pad);
    y0=Math.min(y0,sy-padY); y1=Math.max(y1,sy+padY);
  };
  const inv=1/Math.max(.05,z);                 /* 화면 px → project 단위 */

  if(expandAll){
    /* 회전 불변 외곽 — 가장 바깥 링을 한 바퀴 훑는다. 판이 어느 각도로
       돌아 있든 같은 값이 나오므로 배율이 흔들리지 않는다. */
    let Rm=0; live.forEach(n=>{ if(n.r>Rm) Rm=n.r; });
    if(!Rm) Rm=RADII[1];
    const RIM=RADII[RADII.length-1]||600;
    const rr=Rm*1.17;
    const tR=Math.min(1.35,rr/RIM);
    const puff=16+62*Math.exp(-tR*tR*2.4)+14;   /* 원반 두께 + 흔들림 여유 */
    const reach=labelReach(z)*inv;
    for(let i=0;i<48;i++){
      const a=i/48*Math.PI*2;
      const warp=Math.sin(a+0.55)*54*Math.pow(tR,1.7);
      const wx=Math.cos(a)*rr, wz=Math.sin(a)*rr;
      for(let sgn=-1;sgn<=1;sgn+=2){
        const q=project(wx, warp+puff*sgn, wz);
        const dl=Math.hypot(q.sx,q.sy)||1;
        add(q.sx+q.sx/dl*reach, q.sy+q.sy/dl*reach, 4, 9*inv);
        add(q.sx,q.sy,6,6);
      }
    }
    /* 등대와 그 머리 위의 이름판 */
    const tip=project(0,NP_Y-46,0), foot=project(0,14,0);
    add(tip.sx,tip.sy,130*inv,22*inv);
    add(foot.sx,foot.sy,60*inv,16*inv);
  } else {
    /* 파고든 화면은 판이 멈춰 있다 — 노드 자리를 그대로 재도 흔들리지 않는다. */
    const tip=project(0,NP_Y-46,0), foot=project(0,0,0);
    add(tip.sx,tip.sy,120*inv,22*inv); add(foot.sx,foot.sy,86,40);
    live.forEach(n=>{
      const q=project(n.tx,lift(n),n.ty);
      const pad = n.kind==='item'?176: n.kind==='chap'?152: 104;
      add(q.sx,q.sy,pad*q.k,42*q.k);
    });
  }
  const w=Math.max(1,x1-x0), h=Math.max(1,y1-y0);
  return {z:Math.max(.22,Math.min(2.1,Math.min(W/w,H/h)*0.92)), cx:(x0+x1)/2, cy:(y0+y1)/2};
}

/* 마지막으로 '딱 맞는' 배율과 그때의 중심. 손으로 확대·축소하거나 끌 때
   이 값을 기준으로 범위를 묶어, 판이 점이 되거나 화면 밖으로 나가지 않게 한다. */
let fitZoom=1, fitPx=0, fitPy=0;
function applyFrame(z,cx,cy){
  fitZoom=z; cam.tzoom=z;
  fitPx=-cx*z; fitPy=-cy*z;
  cam.tpx=fitPx; cam.tpy=fitPy;
}
/* 손으로 만진 배율·위치를 읽을 수 있는 범위 안에 묶는다 */
function zoomLo(){ return Math.max(.12, fitZoom*0.55); }
function zoomHi(){ return Math.min(3.2, fitZoom*4.2); }
function clampPan(){
  const mx=W*0.85, my=H*0.85;
  cam.tpx=Math.max(fitPx-mx,Math.min(fitPx+mx,cam.tpx));
  cam.tpy=Math.max(fitPy-my,Math.min(fitPy+my,cam.tpy));
}

function fit(){
  if(!live.length) return;
  poseSettled(()=>{
    /* 배율 → 이름표 크기 → 차지하는 자리 → 배율. 서로 물려 있어 한 번에
       안 떨어진다. 몇 번 굴려 수렴시키고, 마지막은 작은 쪽을 택해 잘림보다
       여백 쪽으로 틀리게 한다. */
    let f=frameAt(fitZoom||1), z=f.z;
    for(let i=0;i<4;i++){ const g=frameAt(z); z=Math.min(z,g.z); f=g; }
    f=frameAt(z);
    applyFrame(z,f.cx,f.cy);
  });
}

/* 우주 프레임: 세 은하의 원반과 이름판이 모두 들어오게 잡는다. 원반은
   회전 불변한 반지름으로 재므로 세 은하가 각자 도는 동안에도 흔들리지 않는다. */
function universeFit(){
  poseSettled(()=>{
    const kx=GOFF.x, ky=GOFF.y, kz=GOFF.z;
    const solve=z=>{
      let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      const add=(sx,sy,pad)=>{
        x0=Math.min(x0,sx-pad); x1=Math.max(x1,sx+pad);
        y0=Math.min(y0,sy-pad); y1=Math.max(y1,sy+pad);
      };
      const inv=1/Math.max(.05,z);
      GALAXIES.forEach(g=>{
        setGOFF(g);
        towerUpright=true;
        /* 고정 반지름으로 재던 것이 독해 은하를 잘라 먹었다 — 은하마다
           제 노드가 실제로 뻗은 데까지 잰다. */
        const L=(g===ACTIVE)?live:(g.S.live||[]);
        let Rm=0; L.forEach(n=>{ if(n.r>Rm) Rm=n.r; });
        if(!Rm) Rm=RADII[2];
        const R=Rm*1.17, reach=70*inv;
        for(let i=0;i<28;i++){
          const a=i/28*Math.PI*2;
          const wx=Math.cos(a)*R, wz=Math.sin(a)*R;
          let q=project(wx,-84,wz); add(q.sx,q.sy,reach);
          q=project(wx, 84,wz);     add(q.sx,q.sy,reach);
        }
        const tip=project(0,NP_Y-46,0);   /* 등대 머리 위 이름판 */
        add(tip.sx,tip.sy,155*inv);
        towerUpright=false;
      });
      GOFF.x=kx; GOFF.y=ky; GOFF.z=kz;
      const w=Math.max(1,x1-x0), h=Math.max(1,y1-y0);
      return {z:Math.max(.10,Math.min(1.1,Math.min(W/w,H/h)*0.93)), cx:(x0+x1)/2, cy:(y0+y1)/2};
    };
    let f=solve(fitZoom||.5), z=f.z;
    for(let i=0;i<4;i++){ const g=solve(z); z=Math.min(z,g.z); f=g; }
    f=solve(z);
    applyFrame(z,f.cx,f.cy);
  });
}

/* 지금 모드에 맞는 화면 맞춤 */
function refit(){ (universeMode?universeFit:fit)(); }

/* ============================================================
   6. AMBIENT — dust shells + the scanning sweep
   ============================================================ */
const dust=[];
for(let i=0;i<170;i++){
  const a=Math.random()*Math.PI*2, r=120+Math.random()*900;
  dust.push({a:a,r:r,y:(Math.random()-.5)*260,s:(Math.random()*.16+.03)*(Math.random()<.5?-1:1),b:Math.random()*.7+.3});
}

/* ============================================================
   7. RENDER
   ============================================================ */
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
let T=0, hover=null, ready=false;

const YEL=[255,209,0];
function nodeStyle(n){
  const on=isOnPath(n), g=gradeOf(n);
  if(n.kind==='core') return {rad:32,rgb:[79,216,255],glow:34,w:2};
  if(n.kind==='book') return {rad:on?10.5:8,rgb:on?YEL:g.base,glow:on?18:10,w:on?1.9:1.3};
  if(n.kind==='chap') return {rad:on?12:9.5,rgb:on?YEL:g.base,glow:on?19:9,w:on?1.9:1.25};
  return {rad:8,rgb:g.hot,glow:11,w:1.3};
}
function hexA(h,a){
  const m=h.replace('#','');
  return 'rgba('+parseInt(m.slice(0,2),16)+','+parseInt(m.slice(2,4),16)+','+parseInt(m.slice(4,6),16)+','+a+')';
}
/* far things wash out — cheap atmospheric depth */
function fog(z){ return Math.max(.50,Math.min(1,1-(z/1250)*0.46)); }

let lastTs=0;
function draw(ts){
  const now=ts||performance.now();
  /* 첫 프레임과, 탭이 백그라운드였다 돌아온 뒤의 큰 간격은 잘라낸다 —
     그대로 쓰면 판이 한 번에 훌쩍 돈다. */
  let dt=(now-lastTs)/1000; lastTs=now;
  if(!(dt>0) || dt>0.25) dt=1/60;
  governor(now);
  keyNav();
  /* T 는 화면의 모든 흐름이 참조하는 시계다. 프레임 수를 세면 느린 기계에서
     강물도 리본도 같이 느려진다. 60fps 환산으로 올려 기존 튜닝은 그대로 두되
     기계와 무관하게 같은 속도로 흐르게 한다. */
  if(motionOn){ T+=dt*60; cam.idle++; }
  cam.yaw   += (cam.tyaw  -cam.yaw  )*.08;
  cam.pitch += (cam.tpitch-cam.pitch)*.10;
  cam.zoom  += (cam.tzoom -cam.zoom )*.09;
  cam.px    += (cam.tpx   -cam.px   )*.09;
  cam.py    += (cam.tpy   -cam.py   )*.09;

  /* 세계의 중심이 목표 은하로 미끄러진다 — 카메라가 나는 게 아니라
     우주가 흐른다. 활성 은하는 언제나 원점에 도착한다. */
  WC.x+=(WCT.x-WC.x)*.075; WC.y+=(WCT.y-WC.y)*.075; WC.z+=(WCT.z-WC.z)*.075;
  uAmt+=((universeMode?1:0)-uAmt)*.06;

  /* 은하마다 제 궤도 시뮬레이션을 돈다 — 배경 은하도 계속 살아 돈다 */
  GALAXIES.forEach(g=>{
    const inFocus=(g===ACTIVE&&!universeMode);
    g.oAmt=(g.oAmt==null?1:g.oAmt)+((inFocus?0:1)-g.oAmt)*.055;
    withGalaxy(g,()=>{
      galaxyAmt+=((expandAll?1:0)-galaxyAmt)*.055;
      orbit(dt);
      allNodes(ROOT,n=>{
        n.x+=(n.tx-n.x)*.13; n.y+=(n.ty-n.y)*.13; n.vis+=(n.tvis-n.vis)*.13;
      });
    });
  });
  bindGalaxy(ACTIVE);

  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);

  drawBackdrop();

  /* 은하는 1~2초에 걸쳐 열리고, 열리면서 판이 커진다. 세계가 미끄러지는
     동안에도 따라가며 다시 잡고, 멈추면 손을 뗀다. */
  /* 화면 맞춤은 전환이 시작될 때 '끝난 뒤의 모습'으로 한 번만 정한다.
     흐르는 동안 매 프레임 다시 재면 카메라가 움직이는 표적을 쫓느라
     판이 커졌다 작아졌다 하며 찌그러져 보였다. */
  if(autoFrame && framePend){ framePend=false; refit(); }

  /* 먼 은하부터 — 가까운 은하가 그 위를 덮는다 */
  const gOrder=GALAXIES.map(g=>{
    towerUpright=true;
    const q=project(g.pos.x-WC.x-GOFF.x, g.pos.y-WC.y-GOFF.y, g.pos.z-WC.z-GOFF.z);
    towerUpright=false;
    return {g:g,z:q.z};
  }).sort((a,b)=>b.z-a.z);
  gOrder.forEach(o=>{
    const g=o.g, inFocus=(g===ACTIVE&&!universeMode);
    const back=(!inFocus&&!universeMode);          /* 파고든 화면의 배경 은하 */
    withGalaxy(g,()=>{
      /* 파고든 화면의 배경 은하는 '먼 하늘'이어야 한다. 예전에는 이름표를
         그대로 달아서, 옆 은하의 지문 제목이 지금 보는 은하의 이름표 위로
         겹쳐 흘렀다 — 화면이 어지러워 보이던 진짜 이유다. 배경에서는
         별빛과 등대만 남기고 글자는 전부 거둔다. */
      GDIM=back?0.20:1;
      drawPlane();
      drawGround();
      drawGalaxy();
      if(!back) drawLinks();                       /* 배경 은하는 별빛만 남긴다 */
      drawLighthouse();
      labelQ.length=0;
      drawNodes();
      /* 우주 화면에서는 어느 은하도 노드 이름표를 달지 않는다. 그 배율에서
         단원 이름은 어차피 읽히지 않고, 은하를 고르는 화면의 이름은
         등대 위 이름판 하나면 된다. (노드가 적은 독해 은하만 가시성
         문턱을 넘어 저 혼자 이름표를 달고 있었다.) */
      g._labels = (back||universeMode) ? [] : labelQ.slice();
      labelQ.length=0;
      GDIM=1;
    });
  });
  bindGalaxy(ACTIVE);
  bloom();
  /* Covers sit outside the bloom pass: an additive glow over a white cover
     blows it out to paper. Drawn after it, then the cached towers are blitted
     back on top so each lighthouse still occludes them. */
  if(!universeMode) drawCovers();
  gOrder.forEach(o=>{
    const L=LAYER['tower:'+o.g.id];
    if(!L||!L.c) return;
    ctx.save(); ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=.3*(o.g===ACTIVE||universeMode?1:0.34);
    ctx.drawImage(L.c,0,0,W,H); ctx.restore();
  });
  /* 이름표는 은하마다 제 문맥(색·중심)으로 그린다 — 블룸 뒤라 글자가 번지지 않는다 */
  gOrder.forEach(o=>{
    if(!o.g._labels||!o.g._labels.length) return;
    withGalaxy(o.g,()=>{ o.g._labels.forEach(a=>drawLabel(a[0],a[1],a[2],a[3],a[4],a[5],a[6])); });
  });
  bindGalaxy(ACTIVE);
  drawNameplates();

  requestAnimationFrame(draw);
}

/* --- the orbital plane: ellipse rings, spokes, sweep --- */
function ring(r,steps){
  const p=[];
  for(let i=0;i<=steps;i++){
    const a=i/steps*Math.PI*2;
    p.push(pt(Math.cos(a)*r,0,Math.sin(a)*r));
  }
  return p;
}
function poly(p,style,lw,close){
  ctx.beginPath();
  p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
  if(close) ctx.closePath();
  ctx.strokeStyle=style; ctx.lineWidth=lw; ctx.stroke();
}
function drawPlane(){
  cached('plane:'+CURG.id,drawPlaneStatic);
  drawPlaneLive();
}
function drawPlaneStatic(){
  ctx.save();
  RADII.slice(1).forEach((r,i)=>{
    poly(ring(r,96),'rgba(120,205,255,'+(0.042-i*0.010)+')',1,true);
  });
  ctx.restore();
}
function drawPlaneLive(){
  /* the tick collar and the radar sweep were the busiest thing on screen
     for the least information — gone. */
}
function drawDust(){
  ctx.save(); ctx.globalCompositeOperation='lighter';
  dust.forEach(d=>{
    if(motionOn) d.a+=d.s*0.0021;
    const q=pt(Math.cos(d.a)*d.r,d.y,Math.sin(d.a)*d.r);
    const sz=Math.max(.6,1.5*q[2]*cam.zoom);
    ctx.fillStyle='rgba(41,168,255,'+(0.05+d.b*0.13)*fog(q[3])+')';
    ctx.fillRect(q[0],q[1],sz,sz);
  });
  ctx.restore();
}
/* deterministic per-link noise — no Math.random, so a link's arc is the same
   shape every frame for a given phase instead of boiling */
function hash01(x){ const s=Math.sin(x*12.9898)*43758.5453; return s-Math.floor(s); }

function linkPath(A,B){
  const seg=live.length>60?12:20, p=[];
  for(let i=0;i<=seg;i++){
    const t=i/seg;
    const x=A.x+(B.x-A.x)*t, z=A.y+(B.y-A.y)*t;
    const la=lift(A), lb=lift(B);
    const y=la+(lb-la)*t - Math.sin(t*Math.PI)*30;   /* bow out of the plane */
    p.push(pt(x,y,z));
  }
  return p;
}

/* 빛의 강
   선을 지우고 흐름만 남긴다. 경로는 알파 .06 의 실선 한 겹으로만 암시하고,
   그 위를 발광 입자 무리가 부모에서 자식으로 천천히 흘러간다. 꺾임도, 꿈틀
   거림도 없다 — 움직이는 것은 오직 입자의 위치와, 아주 느린 강폭의 숨결. */

const river_sprites = Object.create(null);

/* 입자 한 알의 모습을 미리 구워 둔다. 매 프레임 createRadialGradient 를 수백
   번 부르면 흐름이 끊긴다. 흰 코어 → 학년색 후광 → 투명. */
function river_sprite(c){
  const key = c[0]+'|'+c[1]+'|'+c[2];
  const hit = river_sprites[key];
  if(hit) return hit;
  const S = 64, cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const g2 = cv.getContext('2d');
  const rg = g2.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  const col = (a)=> 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
  rg.addColorStop(0.00,'rgba(255,255,255,1)');
  rg.addColorStop(0.11,'rgba(255,255,255,0.88)');
  rg.addColorStop(0.24, col(0.62));
  rg.addColorStop(0.48, col(0.20));
  rg.addColorStop(0.74, col(0.06));
  rg.addColorStop(1.00, col(0));
  g2.fillStyle = rg;
  g2.fillRect(0,0,S,S);
  river_sprites[key] = cv;
  return cv;
}

function river_smooth(e0,e1,x){
  const d = (e1-e0) || 1;
  const t = Math.max(0, Math.min(1, (x-e0)/d));
  return t*t*(3-2*t);
}

/* 표본점을 그대로 잇지 않고 중점 이차곡선으로 흘려 보낸다 —
   폴리라인의 미세한 꺾임(징그러움의 근원)이 완전히 사라진다. */
function river_curve(p){
  const L = p.length-1;
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  if(L < 2){ ctx.lineTo(p[L][0], p[L][1]); return; }
  for(let i=1;i<L;i++){
    const mx = (p[i][0]+p[i+1][0])*0.5, my = (p[i][1]+p[i+1][1])*0.5;
    ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
  }
  ctx.lineTo(p[L][0], p[L][1]);
}

function river_bed(p, style, lw){
  river_curve(p);
  ctx.strokeStyle = style;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/* t(0=부모, 1=자식) 위치와 그 지점의 법선. 입자를 경로에서 옆으로
   흩어 강물의 폭을 만드는 데 쓴다. */
function river_at(p,t){
  const L = p.length-1;
  const idx = Math.max(0, Math.min(1, t))*L;
  let i0 = Math.floor(idx);
  if(i0 >= L) i0 = L-1;
  if(i0 < 0) i0 = 0;
  const A = p[i0], B = p[i0+1], fr = idx-i0;
  let dx = B[0]-A[0], dy = B[1]-A[1];
  const len = Math.hypot(dx,dy) || 1;
  return [ A[0]+dx*fr, A[1]+dy*fr,
           A[2]+(B[2]-A[2])*fr, A[3]+(B[3]-A[3])*fr,
           -dy/len, dx/len ];
}

function river_blob(sp, x, y, r, alpha){
  if(alpha <= 0.004 || r <= 0.15) return;
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  ctx.drawImage(sp, x-r, y-r, r*2, r*2);
}

function drawLinks_river(){
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const order = live.slice().sort((m,n)=>toScreen(n)[3]-toScreen(m)[3]);
  const dense = live.length > 60;

  /* 1단 — 강바닥. 경로를 암시하는 아주 옅은 실선 한 겹뿐. */
  order.forEach(n=>{
    if(!n.parent || n.vis < .02) return;
    const p = linkPath(n.parent, n);
    if(!p || p.length < 2) return;
    const mid = p[p.length>>1];
    const a = n.vis*(n.dim==null?1:n.dim)*fog(mid[3]);
    if(a <= .01) return;
    const hot = isOnPath(n), on = isOnPath(n.parent);
    const g = gradeOf(n);
    const k = mid[2]*cam.zoom;
    river_bed(p,
      hot ? RGBA(YEL, .13*a) : RGBA(g.base, (on?.09:.06)*a),
      Math.max(.5, (hot?1.15:.8)*k));
  });

  /* 2단 — 흐르는 빛. 먼 것부터 쌓아 올린다. */
  ctx.globalCompositeOperation = 'lighter';
  order.forEach(n=>{
    if(!n.parent || n.vis < .02) return;
    const p = linkPath(n.parent, n);
    if(!p || p.length < 2) return;
    const base = n.vis*(n.dim==null?1:n.dim);
    if(base <= .02) return;

    const hot = isOnPath(n), on = isOnPath(n.parent);
    const g = gradeOf(n);
    const col = hot ? YEL : g.hot;
    const sp  = river_sprite(col);

    let NP;
    if(QUALITY === 0)      NP = hot ? 12 : 8;
    else if(QUALITY === 1) NP = hot ? 20 : (dense ? 12 : 15);
    else                   NP = hot ? 26 : (dense ? 16 : 20);

    const spd  = hot ? 0.0042 : 0.0031;          /* 한 번 흘러가는 데 4~5초 */
    const uid  = n.uid;
    const tail = QUALITY > 0;

    for(let i=0;i<NP;i++){
      const h1 = hash01(uid*0.613 + i*1.317);    /* 위상   */
      const h2 = hash01(uid*0.271 + i*2.711);    /* 속도   */
      const h3 = hash01(uid*0.917 + i*3.529);    /* 옆폭   */
      const h4 = hash01(uid*0.443 + i*4.133);    /* 크기   */
      const h5 = hash01(uid*0.769 + i*5.077);    /* 밝기   */

      const t = !motionOn ? (i + h1)/NP
                   : (T*spd*(0.82 + h2*0.40) + h1) % 1;

      /* 부모에서 태어나 자식에게 흡수된다 — 이 비대칭이 위계를 만든다 */
      const born   = river_smooth(0, .12, t);
      const gone   = 1 - river_smooth(.90, 1, t);
      const env    = born*gone;
      if(env <= .01) continue;
      const absorb = river_smooth(.55, .98, t);  /* 노드에 다가갈수록 밝게 */

      const q  = river_at(p, t);
      const k  = q[2]*cam.zoom;
      const a  = base*fog(q[3]);
      if(a <= .01) continue;

      /* 경로에서 ±2px — 한 가닥 실이 아니라 폭을 가진 강이 된다.
         숨결은 아주 느리게, 프레임당 0.005rad 이하. */
      const breath = !motionOn ? 1 : (0.72 + 0.28*Math.sin(T*0.0042 + h3*6.283 + uid));
      const off = (h3*2-1)*2.0*breath*Math.max(.5, k);
      const x = q[0] + q[4]*off, y = q[1] + q[5]*off;

      const shrink = 1 - 0.42*river_smooth(.62, 1, t);
      const r = Math.max(.9, (hot?7.2:5.4)*k*(0.55 + h4*0.75)*shrink);
      const A = a*env*(0.30 + h5*0.34)*(1 + absorb*1.25)*(hot?1.5:1);

      if(tail){
        const q1 = river_at(p, t-0.016), q2 = river_at(p, t-0.034);
        if(t > 0.016) river_blob(sp, q1[0]+q1[4]*off, q1[1]+q1[5]*off, r*0.80, A*0.34);
        if(t > 0.034 && QUALITY > 1)
          river_blob(sp, q2[0]+q2[4]*off, q2[1]+q2[5]*off, r*0.62, A*0.15);
      }
      river_blob(sp, x, y, r, A);
    }

    /* 자식 노드 입구의 잔광 — 입자가 삼켜지는 자리 */
    if(QUALITY > 0 && (hot || on || !dense)){
      const e = river_at(p, 1);
      const ea = base*fog(e[3])*(hot?.34:.16);
      river_blob(sp, e[0], e[1], Math.max(1.4, (hot?13:9)*e[2]*cam.zoom), ea);
    }
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}


/* ── 연결선 테마: silk ───────────────────────────────── */
/* 실크 리본
   지그재그를 전부 걷어내고, 부모에서 자식으로 흐르는 매끄러운 띠 하나만 남긴다.
   경로는 Catmull-Rom 으로 다시 표본화해 꺾임을 없애고(꿈틀거림의 근원),
   구간마다 lineWidth 를 보간해 부모 3.5k → 자식 0.6k 로 가늘어지는 테이퍼를 만든다.
   색은 createLinearGradient 로 부모색 → 자식색으로 흐르고,
   바깥에는 아주 넓고 옅은 헤일로 한 겹,
   그 위로 경로를 따라 10초에 한 번 지나가는 부드러운 하이라이트 한 줄뿐이다. */

const silk_pool = [];   /* 슬롯 재사용 — 프레임마다 배열을 새로 만들지 않는다 */
const silk_list = [];   /* 이번 프레임에 그릴 슬롯들(깊이 정렬용) */

function silk_slot(i){
  let s = silk_pool[i];
  if(!s){
    s = silk_pool[i] = {
      x:[], y:[], w:[], np:0, z:0,
      hot:false, uid:0, a0:0, a1:0, hi:0,
      c0:[110,140,200], c1:[110,140,200], cm:[110,140,200]
    };
  }
  return s;
}

function silk_ease(e0,e1,v){
  const t = Math.max(0, Math.min(1, (v-e0)/((e1-e0)||1)));
  return t*t*(3-2*t);
}

function silk_mix(a,b,f){
  return [ a[0]+(b[0]-a[0])*f | 0, a[1]+(b[1]-a[1])*f | 0, a[2]+(b[2]-a[2])*f | 0 ];
}

/* 부모는 차분한 base, 잎은 밝은 hot — 띠를 따라 색이 한 방향으로 익어간다 */
function silk_tint(n){
  if(!n) return [110,140,200];
  if(n.kind === 'core') return [79,216,255];
  const g = gradeOf(n);
  return (n.kind === 'book' || n.kind === 'chap') ? g.base : g.hot;
}

function silk_cr(a,b,c,d,f,f2,f3){
  return 0.5*((2*b) + (-a+c)*f + (2*a-5*b+4*c-d)*f2 + (-a+3*b-3*c+d)*f3);
}

/* linkPath 표본을 Catmull-Rom 으로 다시 뽑는다. 폴리라인의 미세한 각이
   사라져 어떤 확대에서도 곡선으로 읽힌다. 동시에 각 점의 리본 굵기도 굽는다. */
function silk_build(s, n, N, mul){
  const p = linkPath(n.parent, n);
  if(!p || p.length < 2) return false;
  const L = p.length - 1;

  const hot = isOnPath(n), on = isOnPath(n.parent);
  const zoom = cam.zoom;
  const wide = hot ? 1.35 : 1;

  for(let i=0;i<N;i++){
    const t = i/(N-1);
    const u = t*L;
    let i0 = Math.floor(u);
    if(i0 > L-1) i0 = L-1;
    if(i0 < 0) i0 = 0;
    const f = u-i0, f2 = f*f, f3 = f2*f;
    const P0 = p[i0>0?i0-1:0], P1 = p[i0], P2 = p[i0+1], P3 = p[(i0+2)<=L?(i0+2):L];

    const k  = silk_cr(P0[2],P1[2],P2[2],P3[2],f,f2,f3);
    const kk = Math.max(0.05, k)*zoom;

    s.x[i] = silk_cr(P0[0],P1[0],P2[0],P3[0],f,f2,f3);
    s.y[i] = silk_cr(P0[1],P1[1],P2[1],P3[1],f,f2,f3);
    /* 3.5k → 0.6k, 부모 쪽에 무게가 실리도록 완만하게 */
    s.w[i] = Math.max(0.35, Math.min(26, (0.6 + 2.9*Math.pow(1-t,1.3))*kk*wide));
  }
  s.np = N;

  const zm   = p[p.length>>1][3];
  const base = n.vis*(n.dim==null?1:n.dim);
  const f0   = fog(p[0][3]), f1 = fog(p[L][3]), fm = fog(zm);

  s.z   = zm;
  s.hot = hot;
  s.uid = n.uid || 0;
  s.a0  = base*f0*(hot ? .80 : (on ? .46 : .38))*mul;
  s.a1  = base*f1*(hot ? .44 : (on ? .25 : .21))*mul;
  s.hi  = base*fm*(hot ? .52 : .28)*mul;

  s.c0 = hot ? YEL : silk_tint(n.parent);
  s.c1 = hot ? YEL : silk_tint(n);
  s.cm = silk_mix(s.c0, s.c1, .5);

  return (s.a0 > .008 || s.a1 > .008);
}

/* 리본을 구간으로 쪼개 굵기를 보간하며 잇는다.
   butt 캡 — 겹침이 없어야 이음매에 구슬 같은 알파 얼룩이 생기지 않는다. */
function silk_ribbon(s, style, scale, step){
  const np = s.np;
  ctx.strokeStyle = style;
  for(let i=0;i<np-1;i+=step){
    let j = i+step;
    if(j > np-1) j = np-1;
    const w = (s.w[i]+s.w[j])*0.5*scale;
    if(w < 0.14) continue;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(s.x[i], s.y[i]);
    for(let m=i+1;m<=j;m++) ctx.lineTo(s.x[m], s.y[m]);
    ctx.stroke();
  }
}

/* 두 끝점이 겹치면 createLinearGradient 가 아무것도 칠하지 않는다 */
function silk_grad(x0,y0,x1,y1){
  if(Math.abs(x1-x0) < .4 && Math.abs(y1-y0) < .4) return null;
  return ctx.createLinearGradient(x0,y0,x1,y1);
}

function drawLinks_silk(){
  if(typeof live === 'undefined' || !live || !live.length) return;

  const dense = live.length > 60;
  const mul   = dense ? .82 : 1;
  const N     = QUALITY === 2 ? 30 : (QUALITY === 1 ? 22 : 14);

  silk_list.length = 0;
  let used = 0;
  for(let i=0;i<live.length;i++){
    const n = live[i];
    if(!n.parent || n.vis < .02) continue;
    const s = silk_slot(used);
    if(silk_build(s, n, N, mul)){ silk_list.push(s); used++; }
  }
  if(!silk_list.length) return;

  /* 먼 것부터 — 가까운 리본이 그 위를 덮는다 */
  silk_list.sort((a,b)=> b.z - a.z);

  ctx.save();
  ctx.lineJoin = 'round';

  /* 1겹 — 헤일로. 아주 넓고 아주 옅게, 딱 한 번. */
  if(QUALITY > 0){
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for(let i=0;i<silk_list.length;i++){
      const s = silk_list[i];
      const g = silk_grad(s.x[0], s.y[0], s.x[s.np-1], s.y[s.np-1]);
      const h0 = s.a0*.16, h1 = s.a1*.12;
      if(h0 < .004 && h1 < .004) continue;
      let style;
      if(g){
        g.addColorStop(0,   RGBA(s.c0, h0*.5));
        g.addColorStop(.18, RGBA(s.c0, h0));
        g.addColorStop(.60, RGBA(s.cm, (h0+h1)*.5));
        g.addColorStop(1,   RGBA(s.c1, h1*.4));
        style = g;
      } else style = RGBA(s.cm, h0);
      silk_ribbon(s, style, 3.9, QUALITY === 2 ? 3 : 4);
    }
  }

  /* 2겹 — 리본 본체. 부모색 → 자식색, 굵기 3.5k → 0.6k. */
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
  for(let i=0;i<silk_list.length;i++){
    const s = silk_list[i];
    const g = silk_grad(s.x[0], s.y[0], s.x[s.np-1], s.y[s.np-1]);
    let style;
    if(g){
      g.addColorStop(0,   RGBA(s.c0, s.a0*.55));   /* 부모 노드에서 스며 나온다 */
      g.addColorStop(.14, RGBA(s.c0, s.a0));
      g.addColorStop(.55, RGBA(s.cm, (s.a0+s.a1)*.5));
      g.addColorStop(.92, RGBA(s.c1, s.a1));
      g.addColorStop(1,   RGBA(s.c1, s.a1*.35));   /* 자식 앞에서 조용히 사라진다 */
      style = g;
    } else style = RGBA(s.cm, (s.a0+s.a1)*.5);
    silk_ribbon(s, style, 1, 1);
  }

  /* 3겹 — 하이라이트 한 줄. 경로를 따라 10초에 한 번, 연속적으로 흐른다. */
  if(QUALITY > 0){
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for(let i=0;i<silk_list.length;i++){
      const s = silk_list[i];
      if(QUALITY === 1 && !s.hot && dense) continue;
      if(s.hi < .02) continue;

      /* 광택 한 줄기가 10초 넘게 걸어가면 리본은 멈춰 있는 천으로 보인다.
         빠르게, 그리고 한 리본에 둘씩 — 어느 순간에 봐도 빛을 받고 있다. */
      const spd = s.hot ? .0046 : .0034;
      const SH = (QUALITY===0) ? 1 : 2;
      for(let u=0;u<SH;u++){
      const h = !motionOn ? (.26 + .48*hash01(s.uid*1.913 + 7.7 + u))
                   : ((T*spd + hash01(s.uid*0.531) + u/SH) % 1);
      const env = silk_ease(0,.16,h)*(1-silk_ease(.80,1,h));
      if(env < .03) continue;

      const np = s.np, last = np-1, half = .13;
      let i0 = Math.floor((h-half)*last), i1 = Math.ceil((h+half)*last);
      if(i0 < 0) i0 = 0;
      if(i1 > last) i1 = last;
      if(i1-i0 < 1) continue;

      const g = silk_grad(s.x[i0], s.y[i0], s.x[i1], s.y[i1]);
      if(!g) continue;
      const pk = Math.min(.85, s.hi*env);
      const wi = Math.max(.5, s.w[(i0+i1)>>1]*.5);
      g.addColorStop(0,   'rgba(255,255,255,0)');
      g.addColorStop(.28, RGBA(s.cm, pk*.35));
      g.addColorStop(.5,  'rgba(255,255,255,'+pk+')');
      g.addColorStop(.72, RGBA(s.cm, pk*.35));
      g.addColorStop(1,   'rgba(255,255,255,0)');

      ctx.strokeStyle = g;
      ctx.lineWidth = wi;
      ctx.beginPath();
      ctx.moveTo(s.x[i0], s.y[i0]);
      for(let m=i0+1;m<=i1;m++) ctx.lineTo(s.x[m], s.y[m]);
      ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
  ctx.restore();
}

/* ── 연결선 테마: aurora ───────────────────────────────── */
/* 오로라
   연결선을 "선"이 아니라 "빛의 띠"로 그린다. 같은 경로를 넓고 옅은 겹부터
   가늘고 밝은 겹까지 3~4겹 포개고, 겹마다 법선 방향으로 ±1.5px 만 사인파로
   어긋나게 해서 오로라의 결을 만든다. 표본점은 중점 이차곡선으로 이어 붙여
   폴리라인의 미세한 꺾임(징그러움의 근원)을 완전히 없앤다. 움직이는 것은
   경로를 따라 부모→자식으로 아주 느리게 흘러가는 밝기 파동뿐이다. */

const aurora_TAU = Math.PI*2;

/* 겹 정의 — 굵기 / 알파 / base→hot 색 보간 / 결의 진폭·위상 / 밝기 파동 여부.
   넓은 겹은 평평한 알파로(비용 절감), 안쪽 두 겹만 그라디언트로 파동을 태운다. */
const aurora_LAYERS = [
  {w:14, a:0.05, mix:0.00, amp:1.5, ph:0.00, grad:false},
  {w: 8, a:0.09, mix:0.34, amp:1.2, ph:1.05, grad:false},
  {w: 3, a:0.16, mix:0.68, amp:0.85, ph:2.10, grad:true },
  {w: 1, a:0.50, mix:1.00, amp:0.50, ph:3.15, grad:true }
];
/* QUALITY 가 0 이어도 반드시 그린다 — 겹 수만 줄인다(넓은 베일 + 심지). */
const aurora_SETS = [[0,3],[0,2,3],[0,1,2,3]];

/* 스크래치 버퍼 — 매 프레임 배열을 새로 만들지 않는다. */
const aurora_x = [], aurora_y = [], aurora_nx = [], aurora_ny = [];
const aurora_sprites = Object.create(null);

function aurora_clamp01(v){ return v<0?0:(v>1?1:v); }
function aurora_smooth(e0,e1,x){
  const t = aurora_clamp01((x-e0)/((e1-e0)||1));
  return t*t*(3-2*t);
}
function aurora_mix(c0,c1,t){
  return [ (c0[0]+(c1[0]-c0[0])*t)|0,
           (c0[1]+(c1[1]-c0[1])*t)|0,
           (c0[2]+(c1[2]-c0[2])*t)|0 ];
}

/* 자식 노드 입구의 잔광. 매 프레임 createRadialGradient 를 부르지 않도록
   색마다 한 번만 구워 캐시한다. */
function aurora_sprite(c){
  const key = c[0]+'|'+c[1]+'|'+c[2];
  const hit = aurora_sprites[key];
  if(hit) return hit;
  const S = 64, cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const g2 = cv.getContext('2d');
  const rg = g2.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  const col = a => 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
  rg.addColorStop(0.00,'rgba(255,255,255,0.55)');
  rg.addColorStop(0.16, col(0.42));
  rg.addColorStop(0.44, col(0.15));
  rg.addColorStop(0.74, col(0.04));
  rg.addColorStop(1.00, col(0));
  g2.fillStyle = rg;
  g2.fillRect(0,0,S,S);
  aurora_sprites[key] = cv;
  return cv;
}

/* 경로 각 표본점의 화면 법선. 중앙차분이라 방향이 튀지 않는다. */
function aurora_normals(p){
  const L = p.length-1;
  for(let i=0;i<=L;i++){
    const a = p[i>0?i-1:0], b = p[i<L?i+1:L];
    let dx = b[0]-a[0], dy = b[1]-a[1];
    const len = Math.hypot(dx,dy) || 1;
    aurora_nx[i] = -dy/len;
    aurora_ny[i] =  dx/len;
  }
}

/* 겹 하나를 법선 방향으로 살짝 밀어 둔다. 양 끝은 sin(t·π) 로 0 에 수렴해
   부모·자식 노드에 정확히 붙는다 — 끝이 갈라지지 않는다. */
function aurora_bend(p, amp, phase){
  const L = p.length-1;
  for(let i=0;i<=L;i++){
    const t = i/L;
    const o = Math.sin(t*Math.PI*1.35 + phase)*Math.sin(t*Math.PI)*amp;
    aurora_x[i] = p[i][0] + aurora_nx[i]*o;
    aurora_y[i] = p[i][1] + aurora_ny[i]*o;
  }
}

/* 표본점을 중점 이차곡선으로 흘려 보낸다. 날카로운 모서리가 남지 않는다. */
function aurora_curve(n){
  const L = n-1;
  ctx.beginPath();
  ctx.moveTo(aurora_x[0], aurora_y[0]);
  if(L < 2){ ctx.lineTo(aurora_x[L], aurora_y[L]); return; }
  for(let i=1;i<L;i++){
    ctx.quadraticCurveTo(aurora_x[i], aurora_y[i],
      (aurora_x[i]+aurora_x[i+1])*0.5, (aurora_y[i]+aurora_y[i+1])*0.5);
  }
  ctx.lineTo(aurora_x[L], aurora_y[L]);
}

/* 경로를 따라 흐르는 밝기. 위상이 T 와 함께 커지므로 마루가 부모에서
   자식 쪽으로 이동한다 — 위계의 방향감. 한 바퀴에 10초 남짓. */
function aurora_wave(t, phase){
  return 0.58 + 0.42*Math.sin(t*aurora_TAU - phase);
}

/* 밝기 파동을 태운 세로 그라디언트. 끝점이 겹치면 평면 색으로 물러난다. */
function aurora_grad(p, col, a, phase, stops){
  const L = p.length-1;
  const x0 = p[0][0], y0 = p[0][1], x1 = p[L][0], y1 = p[L][1];
  if(Math.abs(x1-x0)+Math.abs(y1-y0) < 1.2) return RGBA(col, aurora_clamp01(a*0.8));
  const g = ctx.createLinearGradient(x0,y0,x1,y1);
  for(let i=0;i<=stops;i++){
    const t = i/stops;
    /* 부모에서 부드럽게 태어나 자식으로 갈수록 조금 밝아진다 */
    const env = aurora_smooth(0,0.10,t)*(0.72+0.34*t);
    g.addColorStop(t, RGBA(col, aurora_clamp01(a*aurora_wave(t,phase)*env)));
  }
  return g;
}

function drawLinks_aurora(){
  if(!live || !live.length) return;

  const TT = !motionOn ? 0 : T;
  const dense = live.length > 60;
  const set   = aurora_SETS[QUALITY|0] || aurora_SETS[2];
  const stops = QUALITY > 1 ? 8 : 5;

  /* 경로는 한 번만 계산하고, 먼 것부터(z 내림차순) 쌓는다. */
  const jobs = [];
  for(let i=0;i<live.length;i++){
    const n = live[i];
    if(!n || !n.parent || n.vis < .02) continue;
    const base = n.vis*(n.dim==null?1:n.dim);
    if(base <= .02) continue;
    const p = linkPath(n.parent, n);
    if(!p || p.length < 2) continue;
    const mid = p[p.length>>1];
    jobs.push({n:n, p:p, base:base, z:mid[3], k:mid[2]*cam.zoom});
  }
  if(!jobs.length) return;
  jobs.sort((a,b)=>b.z-a.z);

  ctx.save();
  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'lighter';

  for(let j=0;j<jobs.length;j++){
    const job = jobs[j], n = job.n, p = job.p, L = p.length;
    const a = job.base*fog(job.z);
    if(a <= .01) continue;

    const hot = isOnPath(n), on = isOnPath(n.parent);
    const g   = gradeOf(n);
    const c0  = hot ? YEL : g.base;
    const c1  = hot ? [255,246,214] : g.hot;

    const k  = Math.max(0.30, job.k);
    /* 링크마다 고정된 씨앗 — Math.random 없이 결과 위상만 흩는다 */
    const seed = hash01(n.uid*0.613)*aurora_TAU;
    /* 결이 흐르는 속도. 프레임당 0.004rad 안쪽 — 눈에 띄게 느리다. */
    const drift = seed + TT*0.0056;
    /* 밝기 파동. 링크마다 위상이 달라 전체가 동시에 번쩍이지 않는다. */
    const wph  = seed*1.7 + TT*0.0152;

    const boost = (hot ? 1.55 : (on ? 1.18 : 1)) * (dense ? 0.92 : 1);
    const wide  = hot ? 1.15 : 1;

    aurora_normals(p);

    for(let s=0;s<set.length;s++){
      const ly = aurora_LAYERS[set[s]];
      const al = a*ly.a*boost;
      if(al <= .004) continue;
      const lw = Math.max(0.6, ly.w*k*wide);
      const col = aurora_mix(c0, c1, ly.mix);

      aurora_bend(p, ly.amp*Math.min(1.6, Math.max(0.45, k)), ly.ph + drift);
      aurora_curve(L);
      ctx.strokeStyle = (ly.grad && QUALITY > 0)
        ? aurora_grad(p, col, al, wph, stops)
        : RGBA(col, aurora_clamp01(al*aurora_wave(0.62, wph)*0.9));
      ctx.lineWidth = lw;
      ctx.stroke();
    }

    /* 띠가 자식 노드로 스며드는 자리의 잔광 */
    if(QUALITY > 0 && (hot || on || !dense)){
      const e = p[L-1];
      const ea = aurora_clamp01(a*(hot?.30:.14)*aurora_wave(1, wph));
      const r  = Math.max(1.4, (hot?13:9)*Math.max(.25, e[2]*cam.zoom));
      if(ea > .006){
        ctx.globalAlpha = ea;
        ctx.drawImage(aurora_sprite(c1), e[0]-r, e[1]-r, r*2, r*2);
        ctx.globalAlpha = 1;
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/* ── 연결선 테마: fiber ───────────────────────────────── */
/* 유리 광섬유
   연결선은 흔들리지 않는다. 완벽하게 매끄러운 유리 한 가닥(0.7k)이 부모에서
   자식으로 걸려 있고, 그 안을 밝은 빛 한 덩이가 아주 느리게 지나간다.
   빛은 가우시안이라 양 끝이 뚝 끊기지 않고, 지나온 쪽으로만 옅은 잔광을
   남긴다. 분기도, 꿈틀거림도, 번쩍임도 없다. */

/* ── 펄스 모양 ───────────────────────────────────────────────
   중심에서 앞뒤로 σ=0.030 인 가우시안 코어 + 뒤로만 길게 끌리는 잔광.
   잔광 항은 앞뒤 양쪽에 다 있으므로(앞은 σ가 작아 코어에 묻힌다) 중심에서
   값도, 기울기도 끊기지 않는다 — 어디를 잘라 봐도 매끈하다.
   밝기가 0.1 을 넘는 '밝은 구간'은 경로의 약 12%. */
const fiber_sig   = 0.030;   /* 코어 반폭            */
const fiber_wisp  = 0.090;   /* 뒤쪽 잔광 반폭        */
const fiber_wispF = 0.028;   /* 앞쪽(연속성용) 반폭   */
const fiber_wispA = 0.22;    /* 잔광 세기            */
const fiber_peak  = 1 + fiber_wispA;
const fiber_ahead = 0.070;   /* 중심 앞으로 그리는 길이 */
const fiber_back  = 0.175;   /* 중심 뒤로 그리는 길이   */

function fiber_profile(d){
  const u = d / fiber_sig;
  const v = d / (d >= 0 ? fiber_wispF : fiber_wisp);
  return (Math.exp(-u * u) + fiber_wispA * Math.exp(-v * v)) / fiber_peak;
}

/* ── 곡선 ────────────────────────────────────────────────────
   linkPath 의 표본점을 그대로 이으면 미세한 꺾임이 남는다. Catmull-Rom 으로
   촘촘하게 다시 뽑아 두면 어떤 배율에서도 각이 서지 않는다. 버퍼는 한 벌만
   두고 링크마다 덮어쓴다 — 프레임마다 배열을 새로 만들지 않는다. */
const FIBER_MAXM = 48;
const fiber_buf = new Float64Array(4 * (FIBER_MAXM + 1));
const fiber_tmp = [0, 0, 0, 0];

function fiber_cr(a, b, c, d, t){
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}

function fiber_build(p, M){
  const L = p.length - 1;
  for(let s = 0; s <= M; s++){
    const u = s / M * L;
    let i = Math.floor(u);
    if(i > L - 1) i = L - 1;
    if(i < 0) i = 0;
    const f = u - i;
    const a = p[i > 0 ? i - 1 : 0], b = p[i], c = p[i + 1], d = p[i + 2 <= L ? i + 2 : L];
    const o = s * 4;
    fiber_buf[o    ] = fiber_cr(a[0], b[0], c[0], d[0], f);
    fiber_buf[o + 1] = fiber_cr(a[1], b[1], c[1], d[1], f);
    fiber_buf[o + 2] = fiber_cr(a[2], b[2], c[2], d[2], f);
    fiber_buf[o + 3] = fiber_cr(a[3], b[3], c[3], d[3], f);
  }
}

/* t(0=부모, 1=자식) 지점의 [x,y,k,z]. 반환 배열은 재사용되니 값을 바로 꺼내라. */
function fiber_at(M, t){
  const idx = (t < 0 ? 0 : t > 1 ? 1 : t) * M;
  let i = Math.floor(idx);
  if(i > M - 1) i = M - 1;
  if(i < 0) i = 0;
  const f = idx - i, o = i * 4, o2 = o + 4;
  fiber_tmp[0] = fiber_buf[o    ] + (fiber_buf[o2    ] - fiber_buf[o    ]) * f;
  fiber_tmp[1] = fiber_buf[o + 1] + (fiber_buf[o2 + 1] - fiber_buf[o + 1]) * f;
  fiber_tmp[2] = fiber_buf[o + 2] + (fiber_buf[o2 + 2] - fiber_buf[o + 2]) * f;
  fiber_tmp[3] = fiber_buf[o + 3] + (fiber_buf[o2 + 3] - fiber_buf[o + 3]) * f;
  return fiber_tmp;
}

/* 구간 [t0,t1] 을 단 한 번의 stroke 로 긋는다. 조각내서 겹쳐 칠하면 이음매마다
   밝기가 뭉쳐 구슬처럼 보이므로, 밝기 변화는 전부 그라디언트에 맡긴다. */
function fiber_stroke(M, t0, t1, style, lw){
  if(!(t1 > t0) || !style) return;
  const A = fiber_at(M, t0), ax = A[0], ay = A[1];
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  const i0 = Math.ceil(t0 * M), i1 = Math.floor(t1 * M);
  for(let i = i0; i <= i1; i++) ctx.lineTo(fiber_buf[i * 4], fiber_buf[i * 4 + 1]);
  const B = fiber_at(M, t1);
  ctx.lineTo(B[0], B[1]);
  ctx.strokeStyle = style;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/* 펄스 구간을 따라 밝기가 fiber_profile 인 선형 그라디언트. 구간이 12% 남짓
   이라 거의 직선이고, 현(弦)에 투영해도 오차가 눈에 띄지 않는다. */
function fiber_ramp(M, t0, t1, col, c, peak, N){
  const A = fiber_at(M, t0), ax = A[0], ay = A[1];
  const B = fiber_at(M, t1), bx = B[0], by = B[1];
  const dx = bx - ax, dy = by - ay;
  const pre = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',';
  if(dx * dx + dy * dy < 1){           /* 화면상 한 점 — 그라디언트가 성립 안 한다 */
    let a = peak * fiber_profile((t0 + t1) * 0.5 - c);
    if(!(a > 0.004)) return null;
    return pre + (a > 1 ? 1 : Math.round(a * 1000) / 1000) + ')';
  }
  const g = ctx.createLinearGradient(ax, ay, bx, by);
  const span = t1 - t0;
  for(let i = 0; i <= N; i++){
    const s = i / N;
    let a = peak * fiber_profile(t0 + span * s - c);
    if(!(a > 0.0008)) a = 0; else if(a > 1) a = 1; else a = Math.round(a * 1000) / 1000;
    g.addColorStop(s, pre + a + ')');
  }
  return g;
}

/* 코어는 유리 안의 흰빛에 가깝다 — 학년색을 흰쪽으로 끌어올린 값을 캐시한다. */
const fiber_pale = Object.create(null);
function fiber_white(c){
  const key = c[0] + '|' + c[1] + '|' + c[2];
  const hit = fiber_pale[key];
  if(hit) return hit;
  const w = [Math.round(c[0] + (255 - c[0]) * 0.62),
             Math.round(c[1] + (255 - c[1]) * 0.62),
             Math.round(c[2] + (255 - c[2]) * 0.62)];
  fiber_pale[key] = w;
  return w;
}

/* A branch shouldn't be a wire of constant width. This draws it as a drawn
   stroke: heavy where it leaves the parent, hair-fine as it reaches the
   child, and shifting from the grade's deep tone into its bright one along
   the way, over one wide breath of colour that gives it body. */
function fiber_mixc(A,B,t){
  return [A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t, A[2]+(B[2]-A[2])*t];
}
function fiber_glass(M,gr,hot,a,k){
  const SEG = QUALITY===0 ? 7 : QUALITY===1 ? 11 : 16;
  const WARM=[255,246,214];
  /* body: one wide, very faint pass — presence without a blur */
  fiber_stroke(M,0,1, hot?RGBA(YEL,.075*a):RGBA(gr.base,.060*a), Math.max(1.2,3.8*k));
  const over=1/(M*1.4);
  for(let i=0;i<SEG;i++){
    const t0=i/SEG, t1=(i+1)/SEG, tm=(t0+t1)*.5;
    const w=Math.max(.40,(hot?2.5:1.95)*k*(1-tm*0.76));
    const col=hot? fiber_mixc(YEL,WARM,tm) : fiber_mixc(gr.base,gr.hot,tm);
    const al=(hot?.46:.32)*a*(0.72+0.48*tm);
    fiber_stroke(M,t0,Math.min(1,t1+over),RGBA(col,al),w);
  }
}

function drawLinks_fiber(){
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  /* 먼 것부터 — 가까운 유리가 먼 유리를 덮는다 */
  const order = live.slice().sort((m, n) => toScreen(n)[3] - toScreen(m)[3]);
  const dense = live.length > 60;

  const M  = QUALITY === 0 ? 20 : QUALITY === 1 ? (dense ? 26 : 32) : (dense ? 36 : 44);
  const NC = QUALITY === 0 ? 9  : QUALITY === 1 ? 13 : 16;   /* 코어 그라디언트 분해능 */
  const NG = QUALITY === 0 ? 7  : QUALITY === 1 ? 9  : 11;   /* 후광은 넓고 옅어 성기어도 된다 */

  for(let s = 0; s < order.length; s++){
    const n = order[s];
    if(!n.parent || n.vis < .02) continue;
    const p = linkPath(n.parent, n);
    if(!p || p.length < 2) continue;
    fiber_build(p, M);

    const hot = isOnPath(n);
    const gr  = gradeOf(n);
    const dim = n.dim == null ? 1 : n.dim;

    /* 1) 유리 그 자체 — 알파 .28 의 아주 가는 선 한 가닥. 여기까지는 완전 정적. */
    const mid  = fiber_at(M, .5);
    const kmid = mid[2] * cam.zoom;
    const amid = n.vis * dim * fog(mid[3]);
    if(amid > .006) fiber_glass(M, gr, hot, amid, kmid);

    /* 2) 안을 지나가는 전류. 예전에는 한 가닥에 펄스가 하나뿐이고 주기가
          7~9초여서, 대부분의 시간 동안 아무것도 지나가지 않는 죽은 유리로
          보였다. 주기를 절반 아래로 줄이고 한 가닥에 두 개를 서로 반대편에
          띄워, 어느 순간에 봐도 뭔가가 흐르고 있게 한다. */
    const uid = n.uid;
    const ph0 = hash01(uid * 0.613 + 1.703);
    const spd = (hot ? 0.0062 : 0.0049) * (0.86 + hash01(uid * 0.271 + 3.109) * 0.30);
    const col = hot ? YEL : gr.hot;
    const PULSES = QUALITY === 0 ? 1 : 2;

    for(let u = 0; u < PULSES; u++){
      const ph = (ph0 + u / PULSES) % 1;
      const c  = !motionOn ? (0.24 + 0.52 * ph)
                           : (-0.35 + (((T * spd + ph) % 1) + 1) % 1 * 1.70);

      let r0 = c - fiber_back, r1 = c + fiber_ahead;
      if(r0 < 0) r0 = 0;
      if(r1 > 1) r1 = 1;
      if(!(r1 - r0 > 0.004)) continue;        /* 이 펄스는 아직 밖 */

      const q  = fiber_at(M, c < 0 ? 0 : c > 1 ? 1 : c);
      const kp = q[2] * cam.zoom;
      const ap = n.vis * dim * fog(q[3]);
      if(ap <= .01) continue;

      ctx.globalCompositeOperation = 'lighter';
      if(QUALITY > 0){
        fiber_stroke(M, r0, r1,
          fiber_ramp(M, r0, r1, col, c, ap * (hot ? .30 : .20), NG),
          Math.max(1.5, (hot ? 4.6 : 3.5) * kp));
      }
      fiber_stroke(M, r0, r1,
        fiber_ramp(M, r0, r1, fiber_white(col), c, ap * (hot ? .92 : .68), NC),
        Math.max(.55, (hot ? 1.15 : .88) * kp));
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/* ── link themes ───────────────────────────────────────────────────────
   Four renderers, one switch. They share linkPath/hash01 and differ only
   in how they paint a link, so swapping is free — no relayout, no reload. */
const LINKFX=[
  {id:'river', label:'빛의 강',      fn:()=>drawLinks_river()},
  {id:'silk',  label:'실크 리본',    fn:()=>drawLinks_silk()},
  {id:'aurora',label:'오로라',       fn:()=>drawLinks_aurora()},
  {id:'fiber', label:'유리 광섬유',  fn:()=>drawLinks_fiber()},
];
let linkFx='river';
try{ const v=localStorage.getItem('orun.linkfx'); if(v&&LINKFX.some(f=>f.id===v)) linkFx=v; }catch(e){}
/* Full expand is a different picture from the focused one: 129 chapters at
   once. Grade colour stops being useful there — nothing is being compared —
   so the whole lattice goes silver and reads as one galaxy. */
/* SILVER·galaxyAmt·GDUST 는 은하 상태 — buildGalaxyState 가 만든다 */
function drawGalaxy(){
  if(galaxyAmt<=.01) return;
  const A=galaxyAmt*GDIM;
  const AC=ACCENT||[41,168,255];
  const mixw=t=>[Math.round(206+(AC[0]-206)*t),Math.round(226+(AC[1]-226)*t),Math.round(255+(AC[2]-255)*t)];
  ctx.save(); ctx.globalCompositeOperation='lighter';
  /* the halo the arms sit in — 은하의 전류색으로 살짝 물든다 */
  const c=pt(0,-40,0), k=c[2]*cam.zoom, sq=Math.max(.18,Math.cos(cam.pitch));
  const R=RADII[3]*1.25*k;
  const hg=ctx.createRadialGradient(c[0],c[1],0,c[0],c[1],R);
  hg.addColorStop(0,RGBA(mixw(.22),0.11*A));
  hg.addColorStop(.30,RGBA(mixw(.38),0.055*A));
  hg.addColorStop(.68,RGBA(mixw(.5),0.022*A));
  hg.addColorStop(1,'rgba(70,100,160,0)');
  ctx.fillStyle=hg;
  ctx.beginPath(); ctx.ellipse(c[0],c[1],R,R*sq,0,0,Math.PI*2); ctx.fill();
  /* dust in the plane of the lattice */
  const RIM2=RADII[RADII.length-1]||600;
  const dc=(CURG&&CURG.dustCol)||[228,240,255];
  GDUST.forEach(d=>{
    if(motionOn) d.a+=d.s*0.00035;
    const rr=d.r*(1+0.17*galaxyAmt), zx=Math.sin(d.a)*rr, tR=Math.min(1.35,rr/RIM2);
    const yy=(Math.sin(d.a*1.0+0.55)*54*Math.pow(tR,1.7)
              + d.y*(1+2.2*Math.exp(-tR*tR*2.4)))*galaxyAmt;
    const q=pt(Math.cos(d.a)*rr,yy,zx);
    const kk=q[2]*cam.zoom, sz=Math.max(.35,(0.5+d.b*1.35)*kk);
    ctx.fillStyle=RGBA(dc,(0.10+d.b*0.62)*fog(q[3])*A);
    ctx.beginPath(); ctx.arc(q[0],q[1],sz,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}
function drawLinks(){
  const f=LINKFX.find(x=>x.id===linkFx)||LINKFX[0];
  if(galaxyAmt>.5){
    const orig=gradeOf;
    gradeOf=function(n){ const g=orig(n); return {base:SILVER.base,hot:SILVER.hot,rank:g.rank,of:g.of,label:g.label,chip:g.chip}; };
    try{ f.fn(); } finally { gradeOf=orig; }
  } else f.fn();
}
function setLinkFx(id){
  if(!LINKFX.some(f=>f.id===id)) return;
  linkFx=id;
  try{ localStorage.setItem('orun.linkfx',id); }catch(e){}
  const sel=document.getElementById('fx-pick'); if(sel) sel.value=id;
  cam.idle=0;
}

/* Each textbook carries its own current colour, so a glance at the lattice
   tells you which grade track a branch belongs to. Cyan climbs to magenta. */
/* GRADE 는 은하 상태 — buildGalaxyState 가 만든다 */
const GDEF={base:[110,140,200],hot:[190,210,240],rank:0,of:1,label:''};
function CSS(c){ return 'rgb('+c[0]+','+c[1]+','+c[2]+')'; }
function RGBA(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }
function gradeOf(n){ return GRADE[n&&n.bk] || GDEF; }

const LH_N=26;                             /* radial facets around the lathe */
const LH_BANDS=[
  {r0:40,h0:-8, r1:35,h1:6,  m:'dark' },   /* plinth */
  {r0:35,h0:6,  r1:20,h1:152,m:'tower'},   /* the shaft — 7:1, reads as a tower */
  {r0:20,h0:152,r1:33,h1:158,m:'dark' },
  {r0:33,h0:158,r1:33,h1:168,m:'blue'  },  /* lower gallery */
  {r0:33,h0:168,r1:23,h1:173,m:'dark' },
  {r0:23,h0:173,r1:23,h1:180,m:'tower'},   /* neck */
  {r0:23,h0:180,r1:30,h1:185,m:'dark' },
  {r0:30,h0:185,r1:30,h1:195,m:'blue'  },  /* upper gallery */
  {r0:30,h0:195,r1:21,h1:200,m:'dark' },
  {r0:21,h0:200,r1:16,h1:212,m:'blue'  },  /* lantern room */
  {r0:16,h0:212,r1:8, h1:222,m:'blue'  },  /* dome */
  {r0:8, h0:222,r1:3, h1:229,m:'dark' },
  {r0:3, h0:229,r1:3, h1:239,m:'dark' },   /* finial */
];
const LH_MAT={ tower:[248,198,22], blue:[30,150,214], dark:[52,52,50] };
function lightDir(){                        /* key light rides the camera, up and to the left */
  const a=-Math.PI/2-cam.yaw-0.66;
  const h=0.66;
  const v=[Math.cos(a)*h, -0.75, Math.sin(a)*h];
  const l=Math.hypot(v[0],v[1],v[2]);
  return [v[0]/l,v[1]/l,v[2]/l];
}

/* Shading model, kept deliberately small but physical enough to read:
   lambert from a fixed key light, a specular stripe that tracks the
   camera, warm spill from the lamp overhead, a cool rim on the
   silhouette, and contact darkening under each overhang.            */
function shade(c,lam,spec,spill,rim,ao){
  let r=c[0]*lam*ao, g=c[1]*lam*ao, b=c[2]*lam*ao;
  r+=255*spec; g+=250*spec; b+=235*spec;              /* key highlight   */
  r+=255*spill; g+=198*spill; b+=86*spill;            /* lamp spill      */
  r+=46*rim;   g+=142*rim;   b+=255*rim;              /* cool sky rim    */
  return 'rgb('+Math.min(255,r|0)+','+Math.min(255,g|0)+','+Math.min(255,b|0)+')';
}
function drawLighthouse(){
  towerUpright=true;
  try{
    if(GDIM<1){ ctx.save(); ctx.globalAlpha=GDIM; cached('tower:'+CURG.id,drawTowerSolid); ctx.restore(); }
    else cached('tower:'+CURG.id,drawTowerSolid);
    drawLamp();
  }
  finally{ towerUpright=false; }
}
function drawTowerSolid(){
  /* Circuit line-art: the tower is described by its own contour rather than
     shaded mass — profile rings crossed by vertical ribs, with a pad at every
     intersection. Back-facing spans stay dim so the form reads as glass. */
  drawBookWire();
  const RIBS=18;
  const prof=[];
  LH_BANDS.forEach(b=>{
    if(!prof.length||prof[prof.length-1][1]!==b.h0||prof[prof.length-1][0]!==b.r0) prof.push([b.r0,b.h0]);
    prof.push([b.r1,b.h1]);
  });
  const camA=-Math.PI/2-cam.yaw;
  const front=a=>Math.cos(a-camA)>0;          /* facing the viewer */

  ctx.save();
  ctx.lineCap='round'; ctx.lineJoin='round';

  /* ribs */
  for(let i=0;i<RIBS;i++){
    const ang=i/RIBS*Math.PI*2;
    const f=front(ang);
    const pts=prof.map(rh=>pt(Math.cos(ang)*rh[0],-rh[1],Math.sin(ang)*rh[0]));
    ctx.beginPath(); pts.forEach((q,k)=>k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
    const TW=(CURG&&CURG.tw)||{};
    ctx.strokeStyle = f? (TW.ribF||'rgba(150,228,255,.62)') : (TW.ribB||'rgba(41,168,255,.16)');
    ctx.lineWidth   = f? 1.1 : .8;
    ctx.stroke();
  }

  /* rings, split into the arc that faces us and the arc that does not */
  prof.forEach((rh,pi)=>{
    const brand = LH_BANDS.some(b=>(b.m==='blue')&&(b.h0===rh[1]||b.h1===rh[1]));
    const TW2=(CURG&&CURG.tw)||{};
    [[true,brand?(TW2.ringBrand||'rgba(120,226,255,.95)'):(TW2.ringF||'rgba(150,228,255,.72)'),1.5],
     [false,(TW2.ringB||'rgba(41,168,255,.20)'),.9]].forEach(([wantFront,col,lw])=>{
      ctx.strokeStyle=col; ctx.lineWidth=lw;
      let run=false;
      for(let i=0;i<=64;i++){
        const ang=i/64*Math.PI*2, q=pt(Math.cos(ang)*rh[0],-rh[1],Math.sin(ang)*rh[0]);
        if(front(ang)===wantFront){
          if(!run){ run=true; ctx.beginPath(); ctx.moveTo(q[0],q[1]); } else ctx.lineTo(q[0],q[1]);
        } else if(run){ ctx.stroke(); run=false; }
      }
      if(run) ctx.stroke();
    });
    /* pads where a rib meets a ring — the circuit-board tell */
    if(pi%2===0){
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let i=0;i<RIBS;i+=2){
        const ang=i/RIBS*Math.PI*2; if(!front(ang)) continue;
        const q=pt(Math.cos(ang)*rh[0],-rh[1],Math.sin(ang)*rh[0]);
        const r=Math.max(.9,1.9*q[2]*cam.zoom);
        ctx.fillStyle=((CURG&&CURG.tw)||{}).pad||'rgba(190,240,255,.9)';
        ctx.beginPath(); ctx.arc(q[0],q[1],r,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  });

  /* the shaft still carries the logo's window, now as an outline */
  const wa=-Math.PI/2-cam.yaw, h0=74,h1=104,r=27.6,w=0.10;
  const q=[pt(Math.cos(wa-w)*r,-h0,Math.sin(wa-w)*r),pt(Math.cos(wa+w)*r,-h0,Math.sin(wa+w)*r),
           pt(Math.cos(wa+w)*r,-h1,Math.sin(wa+w)*r),pt(Math.cos(wa-w)*r,-h1,Math.sin(wa-w)*r)];
  ctx.beginPath(); q.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
  ctx.fillStyle='rgba(255,226,120,.20)'; ctx.fill();
  ctx.strokeStyle='rgba(255,226,120,.85)'; ctx.lineWidth=1.3; ctx.stroke();

  ctx.restore();
}

/* the open book, reduced to its outline so it speaks the same language */
function drawBookWire(){
  const camA=-Math.PI/2-cam.yaw;
  const sx=Math.cos(camA), sz=Math.sin(camA);
  const px=Math.cos(camA+Math.PI/2), pz=Math.sin(camA+Math.PI/2);
  const D=30, WIN=34, WMAX=78;
  const P=(d,w,side,y)=>pt(sx*d+px*side*w, y, sz*d+pz*side*w);
  ctx.save(); ctx.lineJoin='round';
  [-1,1].forEach(side=>{
    const q=[P(-D,WIN,side,3),P(D,WIN,side,3),P(D*1.4,WMAX,side,-15),P(-D*1.4,WMAX,side,-15)];
    ctx.beginPath(); q.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
    const TW3=(CURG&&CURG.tw)||{};
    ctx.fillStyle=TW3.bookFill||'rgba(30,120,190,.10)'; ctx.fill();
    ctx.strokeStyle=TW3.bookLine||'rgba(150,228,255,.60)'; ctx.lineWidth=1.2; ctx.stroke();
    [0.4,0.7].forEach(f=>{
      const w=WIN+(WMAX-WIN)*f, y=3-18*Math.pow(f,1.5), d=D*(1+0.5*f);
      const p0=P(-d*.85,w,side,y), p1=P(d*.85,w,side,y);
      ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]);
      ctx.strokeStyle=(((CURG&&CURG.tw)||{}).bookRule)||'rgba(41,168,255,.34)'; ctx.lineWidth=.9; ctx.stroke();
    });
  });
  ctx.restore();
}

/* contact shadow + the pool of light the lamp throws on the floor */
function drawGround(){
  const c=pt(0,0,0), k=c[2]*cam.zoom, sq=Math.cos(cam.pitch);
  const AC=ACCENT||[41,168,255];
  const lite=[Math.round(AC[0]+(255-AC[0])*.25),Math.round(AC[1]+(255-AC[1])*.25),Math.round(AC[2]+(255-AC[2])*.25)];
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  let g=ctx.createRadialGradient(c[0],c[1],0,c[0],c[1],300*k);
  g.addColorStop(0,RGBA(lite,.16*GDIM));
  g.addColorStop(.42,RGBA(AC,.05*GDIM));
  g.addColorStop(1,RGBA(AC,0));
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.ellipse(c[0],c[1],300*k,300*k*sq,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

/* faint masonry courses — a smooth cone reads as plastic */
function drawCourses(){
  const b=LH_BANDS[1];
  ctx.save(); ctx.strokeStyle='rgba(120,88,10,.20)'; ctx.lineWidth=1;
  for(let c=1;c<9;c++){
    const t=c/9, h=b.h0+(b.h1-b.h0)*t, r=b.r0+(b.r1-b.r0)*t;
    const zc=pt(0,-h,0)[3];
    let run=null;
    for(let i=0;i<=LH_N;i++){
      const a=i/LH_N*Math.PI*2, q=pt(Math.cos(a)*r,-h,Math.sin(a)*r);
      if(q[3]<zc){ if(!run){run=true;ctx.beginPath();ctx.moveTo(q[0],q[1]);} else ctx.lineTo(q[0],q[1]); }
      else if(run){ ctx.stroke(); run=null; }
    }
    if(run) ctx.stroke();
  }
  ctx.restore();
}

/* the shaft window — kept facing the camera as the lattice spins */
function drawWindow(){
  const a=-Math.PI/2-cam.yaw, h0=74, h1=104, r=27.6, w=0.10;
  const q=[
    pt(Math.cos(a-w)*r,-h0,Math.sin(a-w)*r),
    pt(Math.cos(a+w)*r,-h0,Math.sin(a+w)*r),
    pt(Math.cos(a+w)*r,-h1,Math.sin(a+w)*r),
    pt(Math.cos(a-w)*r,-h1,Math.sin(a-w)*r),
  ];
  ctx.save();
  ctx.beginPath(); q.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
  const wg=ctx.createLinearGradient(q[0][0],q[0][1],q[3][0],q[3][1]);
  wg.addColorStop(0,'rgba(255,236,168,.96)');
  wg.addColorStop(1,'rgba(255,206,96,.92)');
  ctx.fillStyle=wg; ctx.fill();
  ctx.strokeStyle='rgba(26,26,24,.95)'; ctx.lineWidth=2; ctx.stroke();
  ctx.restore();
}

/* the lamp: bloom + the logo's fixed rays */
function drawLamp(){
  /* The lantern only needs to read as lit. The starburst, the anamorphic
     streak and the wide amber wash were all glare, and glare is what made
     the top of the screen yellow. */
  const c=pt(0,-LANTERN,0), k=c[2]*cam.zoom, R=26*k;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(c[0],c[1],0,c[0],c[1],R);
  /* 배경으로 물러난 은하는 램프도 같이 물러나야 한다 — 탑만 흐리게 하고
     램프는 그대로 두었더니, 먼 은하의 등불만 또렷이 떠 있었다. */
  const lm=(!motionOn?.30:.26+Math.sin(T*0.05)*0.03)*GDIM;
  g.addColorStop(0,'rgba(226,246,255,'+lm+')');
  g.addColorStop(.4,'rgba(140,214,255,'+(.10*GDIM)+')');
  g.addColorStop(1,'rgba(120,200,255,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(c[0],c[1],R,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

/* the open book the tower stands in */
function drawBook(){
  /* Spine points away from the viewer so the pages always splay left and
     right on screen — an icon has to stay legible as the lattice turns.
     Thickness is what makes a book read as a book, so the page block and
     the cover below it are drawn as separate surfaces.                  */
  const camA=-Math.PI/2-cam.yaw;
  const sx=Math.cos(camA), sz=Math.sin(camA);
  const px=Math.cos(camA+Math.PI/2), pz=Math.sin(camA+Math.PI/2);
  const D=30, WMAX=78, WIN=34, STR=4, THK=9;   /* WIN clears the tower base */
  const P=(d,w,side,y)=>pt(sx*d+px*side*w, y, sz*d+pz*side*w);
  ctx.save();
  [-1,1].forEach(side=>{
    /* cover: the same footprint dropped by the block thickness */
    const c=[P(-D,WIN,side,3+THK),P(D,WIN,side,3+THK),P(D*1.4,WMAX,side,-15+THK),P(-D*1.4,WMAX,side,-15+THK)];
    ctx.beginPath(); c.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
    ctx.fillStyle='rgb(24,26,30)'; ctx.fill();
    ctx.strokeStyle='rgb(24,26,30)'; ctx.lineWidth=1; ctx.stroke();

    /* outer edge of the page block, catching the lamp */
    const e=[P(-D*1.4,WMAX,side,-15),P(D*1.4,WMAX,side,-15),P(D*1.4,WMAX,side,-15+THK),P(-D*1.4,WMAX,side,-15+THK)];
    ctx.beginPath(); e.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
    ctx.fillStyle='rgb(214,198,168)'; ctx.fill();
    ctx.strokeStyle='rgb(214,198,168)'; ctx.lineWidth=1; ctx.stroke();

    /* the page surface, curving up toward the fore-edge */
    for(let k=0;k<STR;k++){
      const w0=WIN+(WMAX-WIN)*(k/STR), w1=WIN+(WMAX-WIN)*((k+1)/STR);
      const y0=3-18*Math.pow(k/STR,1.5), y1=3-18*Math.pow((k+1)/STR,1.5);
      const d0=D*(1+0.13*k), d1=D*(1+0.13*(k+1));
      const q=[P(-d0,w0,side,y0),P(d0,w0,side,y0),P(d1,w1,side,y1),P(-d1,w1,side,y1)];
      const t=k/STR;
      ctx.beginPath(); q.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1])); ctx.closePath();
      const sh=0.70+0.30*t;                       /* the crease sits in shadow */
      ctx.fillStyle='rgb('+(238*sh|0)+','+(230*sh|0)+','+(210*sh|0)+')';
      ctx.fill(); ctx.strokeStyle=ctx.fillStyle; ctx.lineWidth=1; ctx.stroke();
    }
    /* a couple of ruled lines so it reads as a page, not a ramp */
    ctx.strokeStyle='rgba(120,124,130,.34)'; ctx.lineWidth=1;
    [0.42,0.62,0.82].forEach(f=>{
      const y=3-18*Math.pow(f,1.5), d=D*(1+0.13*f*STR);
      const p0=P(-d*0.8,WIN+(WMAX-WIN)*f,side,y), p1=P(d*0.8,WIN+(WMAX-WIN)*f,side,y);
      ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.stroke();
    });
  });
  ctx.restore();
}

/* two opposed beams sweeping the lattice */
function drawBeams(){
  if(!motionOn) return;
  const a0=T*0.0068;
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
  for(let b=0;b<2;b++){
    const base=a0+b*Math.PI;
    for(let i=0;i<30;i++){
      const off=(i/29-0.5)*0.21;
      const fade=Math.max(0,1-Math.abs(off)/0.105);
      if(fade<=0.02) continue;
      const a=base+off;
      const reach=520+Math.sin(i*2.7+T*0.01)*70;
      const p0=pt(Math.cos(a)*24,-LANTERN,Math.sin(a)*24);
      const p1=pt(Math.cos(a)*reach,-LANTERN*0.66,Math.sin(a)*reach);
      const g=ctx.createLinearGradient(p0[0],p0[1],p1[0],p1[1]);
      g.addColorStop(0,'rgba(255,230,150,'+(0.19*fade*fade)+')');
      g.addColorStop(.45,'rgba(255,206,72,'+(0.07*fade)+')');
      g.addColorStop(1,'rgba(255,196,40,0)');
      ctx.strokeStyle=g; ctx.lineWidth=1+fade*2.6;
      ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.stroke();
    }
  }
  ctx.restore();
}

/* Labels are queued here and painted after the bloom composite. Type that
   goes through an additive blur reads as smeared, and no amount of glow is
   worth an unreadable unit name. */
let labelQ=[];
function drawLabels(){ labelQ.forEach(a=>drawLabel(a[0],a[1],a[2],a[3],a[4],a[5],a[6])); labelQ.length=0; }

/* ── 은하 이름판 ─────────────────────────────────────────────
   각 은하 중심의 등대 머리 위, ORBITRON 으로 GRAMMAR · READING · VOCAB.
   등대처럼 원반 기울기에서 빠져 꼿꼿이 서고, 블룸 뒤에 그려 번지지 않는다.
   이름판 자체가 그 은하로 들어가는 문 — 클릭 표적(plateRect)이 된다. */
let plateHover=null;
function npAnchor(g){
  const kx=GOFF.x, ky=GOFF.y, kz=GOFF.z;
  setGOFF(g);
  towerUpright=true;
  const q=pt(0,NP_Y,0);
  towerUpright=false;
  GOFF.x=kx; GOFF.y=ky; GOFF.z=kz;
  return q;
}
function drawNameplates(){
  /* 파고든 화면에서는 지금 보는 은하의 이름판만 남긴다. 배경 은하의 이름판은
     제 은하가 화면 밖이나 왼쪽 패널 뒤에 있어도 그려져서, 커다란 활자가
     '…AR' '…AB' 같은 조각으로 잘려 보였다. 다른 은하로 가는 문은 머리띠의
     UNIVERSE·GRAMMAR·READING·VOCAB 가 이미 맡고 있다. */
  const shown=GALAXIES.filter(g=>universeMode||g===ACTIVE);
  GALAXIES.forEach(g=>{ if(shown.indexOf(g)<0) g.plateRect=null; });
  const list=shown.map(g=>({g:g,q:npAnchor(g)})).sort((a,b)=>b.q[3]-a.q[3]);
  list.forEach(o=>{
    const g=o.g, x=o.q[0], y=o.q[1], k=o.q[2], z=o.q[3];
    const zz=k*cam.zoom, AC=g.accent;
    const active=(g===ACTIVE&&!universeMode);
    const hov=(plateHover===g);
    const px=Math.max(12.5,Math.min(34,(universeMode?60:46)*zz));
    const a=(active?0.98: universeMode?0.94:0.55)*(hov?1.06:0.94)*fog(z);
    if(a<=0.03) { g.plateRect=null; return; }
    const pale=[Math.round(AC[0]+(255-AC[0])*.68),Math.round(AC[1]+(255-AC[1])*.68),Math.round(AC[2]+(255-AC[2])*.68)];
    ctx.save();
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    const f='700 '+px.toFixed(1)+"px 'Orbitron','Noto Sans KR',sans-serif";
    ctx.font=f;
    try{ ctx.letterSpacing=(px*0.20).toFixed(1)+'px'; }catch(e){}
    const t=g.name;
    const w=ctx.measureText(t).width;
    /* 이름은 두 번 — 은하색 후광 한 번, 흰 심 한 번 */
    ctx.globalAlpha=Math.min(1,a);
    ctx.shadowColor=RGBA(AC,.9); ctx.shadowBlur=Math.max(9,px*0.85);
    ctx.fillStyle=RGBA(pale,.96);
    ctx.fillText(t,x,y);
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,.90)';
    ctx.fillText(t,x,y);
    /* 이름 아래 가는 규칙선 하나와 한글 꼬리표 */
    const ry=y+px*0.42;
    ctx.strokeStyle=RGBA(AC,.55); ctx.lineWidth=Math.max(.7,px*0.045);
    ctx.beginPath(); ctx.moveTo(x-w/2,ry); ctx.lineTo(x+w/2,ry); ctx.stroke();
    try{ ctx.letterSpacing='1px'; }catch(e){}
    ctx.font='500 '+Math.max(8,px*0.33).toFixed(1)+"px 'Noto Sans KR','Noto Sans',sans-serif";
    ctx.fillStyle='rgba(202,226,242,.88)';
    ctx.fillText(g.kr+' · '+g.tagline, x, ry+px*0.52);
    /* 등대 꼭대기로 내려가는 실 한 가닥 — 이름과 탑을 잇는다 */
    const tipK=GOFF, kx=GOFF.x,ky=GOFF.y,kz=GOFF.z;
    setGOFF(g);
    towerUpright=true; const tip=pt(0,-252,0); towerUpright=false;
    GOFF.x=kx; GOFF.y=ky; GOFF.z=kz;
    ctx.strokeStyle=RGBA(AC,.30); ctx.lineWidth=.8;
    ctx.beginPath(); ctx.moveTo(x,ry+px*0.72); ctx.lineTo(tip[0],tip[1]); ctx.stroke();
    ctx.restore();
    try{ ctx.letterSpacing='0px'; }catch(e){}
    g.plateRect={x:x-w/2-20, y:y-px-14, w:w+40, h:px+px*0.95+30};
  });
}
function drawNodes(){
  labelQ.length=0;
  const list=live.filter(n=>n.kind!=='core'&&n.vis>=.02)
                 .map(n=>({n:n,s:toScreen(n)}))
                 .sort((a,b)=>b.s[3]-a.s[3]);          /* far first */
  list.forEach(o=>{
    const n=o.n, [x,y,k,z]=o.s, st=nodeStyle(n);
    const f=fog(z), dm=(n.dim==null?1:n.dim);
    const R=st.rad*k*cam.zoom*(hover===n?1.3:1);
    const A=n.vis*dm*f*GDIM;
    /* a textbook draws as its cover — a disc under it only collided with
       the neighbouring covers and hid the class name */
    if(n.kind==='book') return;

    /* A node is a star, not a bead: a white core inside its own colour,
       a soft halo, and a diffraction cross. Nothing is outlined — rings and
       bezels are what made these look like buttons. */
    const on2=isOnPath(n), gg=gradeOf(n);
    const gx=galaxyAmt, mixS=(c)=>[
      Math.round(c[0]+(SILVER.hot[0]-c[0])*gx*.72),
      Math.round(c[1]+(SILVER.hot[1]-c[1])*gx*.72),
      Math.round(c[2]+(SILVER.hot[2]-c[2])*gx*.72)];
    const col = on2 ? YEL : mixS(gg.hot);

    /* how brightly this one burns */
    let mag = 1;
    if(n.kind==='item') mag = (n.payload&&DATA.worksheets[n.payload.id]) ? 1 : .42;
    else if(!n.children.length) mag = .6;
    if(on2) mag = 1.35;
    if(hover===n) mag *= 1.3;
    /* a slow, per-node twinkle so a field of them is never static */
    if(motionOn) mag *= 0.90+0.10*Math.sin(T*0.021+n.uid*1.7);

    const S=R*(on2?1.25:1), aa=A*Math.min(1,mag);
    ctx.save();
    ctx.globalCompositeOperation='lighter';

    /* halo */
    const h1=ctx.createRadialGradient(x,y,0,x,y,S*3.0);
    h1.addColorStop(0,RGBA(col,.30*mag));
    h1.addColorStop(.32,RGBA(col,.10*mag));
    h1.addColorStop(1,RGBA(col,0));
    ctx.globalAlpha=aa; ctx.fillStyle=h1;
    ctx.beginPath(); ctx.arc(x,y,S*3.0,0,Math.PI*2); ctx.fill();

    /* the burning body */
    const h2=ctx.createRadialGradient(x,y,0,x,y,S*1.05);
    h2.addColorStop(0,'rgba(255,255,255,'+(0.98*Math.min(1,mag))+')');
    h2.addColorStop(.28,RGBA(col,.92*Math.min(1,mag)));
    h2.addColorStop(.62,RGBA(col,.34*mag));
    h2.addColorStop(1,RGBA(col,0));
    ctx.fillStyle=h2;
    ctx.beginPath(); ctx.arc(x,y,S*1.05,0,Math.PI*2); ctx.fill();

    /* diffraction cross — what makes a point of light read as a star */
    if(mag>.5){
      const L=S*(on2?4.6:3.4)*Math.min(1.4,mag), lw=Math.max(.6,S*.11);
      const arms=on2?[0,Math.PI/2,Math.PI/4,-Math.PI/4]:[0,Math.PI/2];
      ctx.lineCap='round';
      arms.forEach((an,i)=>{
        const l=i<2?L:L*.52;
        const dx=Math.cos(an)*l, dy=Math.sin(an)*l;
        const lg=ctx.createLinearGradient(x-dx,y-dy,x+dx,y+dy);
        lg.addColorStop(0,RGBA(col,0));
        lg.addColorStop(.5,'rgba(255,255,255,'+(0.42*Math.min(1,mag))+')');
        lg.addColorStop(1,RGBA(col,0));
        ctx.strokeStyle=lg; ctx.lineWidth=i<2?lw:lw*.62;
        ctx.beginPath(); ctx.moveTo(x-dx,y-dy); ctx.lineTo(x+dx,y+dy); ctx.stroke();
      });
    }
    ctx.restore();
    labelQ.push([n,x,y,R,st,A,k]);
  });
}
/* ============================================================
   7b. COVER PLATES
   No cover scans exist for these ten books, so each one gets a drawn plate:
   the series wordmark set in that book's own difficulty colour over a motif
   its series shares. Painted once into an offscreen canvas at 2x and blitted
   thereafter, so ten plates cost ten drawImage calls a frame.
   ============================================================ */
const PLATE={}, COVIMG={}, PW=132, PH=180, PSS=2;
/* Real cover scans ride in DATA as data URIs. Until one decodes the drawn
   plate stands in, then the cache is dropped so the photo takes over. */
function coverImg(b){
  if(!b.cover||!b.cover.img) return null;
  let im=COVIMG[b.id];
  if(!im){
    im=COVIMG[b.id]=new Image();
    im.onload=()=>{ delete PLATE[b.id]; };
    im.src=b.cover.img;
  }
  return (im.complete&&im.naturalWidth)?im:null;
}
function rrect(g,x,y,w,h,r){
  if(g.roundRect){ g.beginPath(); g.roundRect(x,y,w,h,r); return; }
  g.beginPath();
  g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath();
}
function fitText(g,t,max,weight,start,floor){
  let px=start;
  for(;px>floor;px-=0.5){
    g.font=weight+' '+px+"px 'Noto Sans KR','Noto Sans',sans-serif";
    if(g.measureText(t).width<=max) break;
  }
  return px;
}
function finishPlate(g,cv2,b,A){
  g.restore();
  g.globalAlpha=.5; g.fillStyle=RGBA(A,.07);
  for(let y=0;y<PH;y+=3) g.fillRect(0,y,PW,1);
  g.globalAlpha=1;
  let sh=g.createLinearGradient(0,PH,PW,0);
  sh.addColorStop(0,'rgba(255,255,255,0)');
  sh.addColorStop(.46,'rgba(255,255,255,.28)');
  sh.addColorStop(.54,'rgba(255,255,255,0)');
  g.fillStyle=sh; g.fillRect(0,0,PW,PH);
  rrect(g,.75,.75,PW-1.5,PH-1.5,7);
  g.strokeStyle=RGBA(A,.75); g.lineWidth=1.5; g.stroke();
  PLATE[b.id]=cv2;
  return cv2;
}
function coverPlate(b){
  if(PLATE[b.id]) return PLATE[b.id];
  const cv2=document.createElement('canvas');
  cv2.width=PW*PSS; cv2.height=PH*PSS;
  const g=cv2.getContext('2d');
  g.scale(PSS,PSS);
  const gr=GRADE[b.id]||GDEF, A=gr.base, HOT=gr.hot;
  const cov=b.cover||{motif:'bar',lines:[b.short||b.title],vol:''};
  const INK='#0d1f33';
  const photo=coverImg(b);
  if(photo){
    g.save(); rrect(g,0,0,PW,PH,7); g.clip();
    g.drawImage(photo,0,0,PW,PH);
    /* the same holographic pass the drawn plates get, but lighter — the
       cover has to stay readable as a cover */
    g.globalAlpha=.34; g.fillStyle=RGBA(A,.09);
    for(let y=0;y<PH;y+=3) g.fillRect(0,y,PW,1);
    g.globalAlpha=1;
    let ph=g.createLinearGradient(0,PH,PW,0);
    ph.addColorStop(0,'rgba(255,255,255,0)');
    ph.addColorStop(.47,'rgba(255,255,255,.08)');
    ph.addColorStop(.55,'rgba(255,255,255,0)');
    g.fillStyle=ph; g.fillRect(0,0,PW,PH);
    /* the scene is dark; an unshaded cover floats. A corner falloff and a
       deep top edge give it a light source and sit it in the frame. */
    let vg=g.createRadialGradient(PW*.42,PH*.36,PH*.18,PW*.5,PH*.5,PH*.78);
    vg.addColorStop(0,'rgba(4,14,26,0)');
    vg.addColorStop(1,'rgba(4,14,26,.34)');
    g.fillStyle=vg; g.fillRect(0,0,PW,PH);
    let tg=g.createLinearGradient(0,0,0,PH*.3);
    tg.addColorStop(0,'rgba(4,14,26,.22)'); tg.addColorStop(1,'rgba(4,14,26,0)');
    g.fillStyle=tg; g.fillRect(0,0,PW,PH*.3);
    g.restore();
    rrect(g,.75,.75,PW-1.5,PH-1.5,7);
    g.strokeStyle=RGBA(A,.8); g.lineWidth=1.5; g.stroke();
    PLATE[b.id]=cv2;
    return cv2;
  }

  /* paper */
  let pg=g.createLinearGradient(0,0,PW*.6,PH);
  pg.addColorStop(0,'#fdfeff'); pg.addColorStop(.55,'#eef4fb'); pg.addColorStop(1,'#d9e6f4');
  rrect(g,0,0,PW,PH,7); g.fillStyle=pg; g.fill();

  g.save(); rrect(g,0,0,PW,PH,7); g.clip();

  /* spine */
  let sg=g.createLinearGradient(0,0,9,0);
  sg.addColorStop(0,RGBA(A,1)); sg.addColorStop(1,RGBA(HOT,.85));
  g.fillStyle=sg; g.fillRect(0,0,9,PH);
  g.fillStyle='rgba(255,255,255,.4)'; g.fillRect(9,0,1.2,PH);

  /* motif field */
  const mx=20, mw=PW-mx-14, my=20, mh=88;
  if(cov.motif==='orb'){
    const cx=mx+mw*.5, cy=my+mh*.48, r=Math.min(mw,mh)*.52;
    let og=g.createRadialGradient(cx-r*.28,cy-r*.32,r*.08,cx,cy,r);
    og.addColorStop(0,RGBA(HOT,1)); og.addColorStop(.55,RGBA(A,.95)); og.addColorStop(1,RGBA(A,.18));
    g.fillStyle=og; g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.fill();
    g.strokeStyle=RGBA(A,.5); g.lineWidth=1;
    [r*1.28,r*1.5].forEach(rr=>{ g.beginPath(); g.arc(cx,cy,rr,0,Math.PI*2); g.stroke(); });
    g.fillStyle='rgba(255,255,255,.55)';
    g.beginPath(); g.ellipse(cx-r*.3,cy-r*.42,r*.3,r*.17,-0.5,0,Math.PI*2); g.fill();
  } else if(cov.motif==='grid'){
    const cols=6, rows=4, gap=3.4, cw=(mw-gap*(cols-1))/cols, chh=(mh-14-gap*(rows-1))/rows;
    for(let r0=0;r0<rows;r0++) for(let c0=0;c0<cols;c0++){
      const t=(r0*cols+c0)/(rows*cols);
      g.fillStyle=RGBA(t<.45?A:HOT, .18+.72*(1-t));
      rrect(g,mx+c0*(cw+gap),my+r0*(chh+gap),cw,chh,1.6); g.fill();
    }
    g.fillStyle=RGBA(A,.95); rrect(g,mx,my+mh-8,mw,4,2); g.fill();
  } else if(cov.motif==='numeral'){
    g.save();
    g.beginPath(); g.moveTo(mx+mw,my-6); g.lineTo(mx+mw,my+mh*.62); g.lineTo(mx+mw*.42,my-6); g.closePath();
    g.fillStyle=RGBA(A,.14); g.fill();
    g.restore();
    g.font="800 78px 'Noto Sans','Noto Sans KR',sans-serif";
    g.textAlign='center'; g.textBaseline='middle';
    let ng=g.createLinearGradient(mx,my,mx+mw,my+mh);
    ng.addColorStop(0,RGBA(A,.95)); ng.addColorStop(1,RGBA(HOT,.9));
    g.fillStyle=ng; g.fillText(cov.big||'1',mx+mw*.5,my+mh*.5);
    g.strokeStyle=RGBA(A,.5); g.lineWidth=1.4;
    g.beginPath(); g.moveTo(mx,my+mh+2); g.lineTo(mx+mw*.5,my+mh+2); g.stroke();
  } else if(cov.motif==='wedge'){
    let wg=g.createLinearGradient(mx,my,mx+mw,my+mh);
    wg.addColorStop(0,RGBA(A,1)); wg.addColorStop(1,RGBA(HOT,.6));
    g.fillStyle=wg; rrect(g,mx,my,mw,mh,3); g.fill();
    g.save(); rrect(g,mx,my,mw,mh,3); g.clip();
    g.fillStyle='rgba(255,255,255,.28)';
    g.beginPath(); g.moveTo(mx+mw*.52,my); g.lineTo(mx+mw,my); g.lineTo(mx+mw*.2,my+mh); g.closePath(); g.fill();
    g.strokeStyle='rgba(255,255,255,.5)'; g.lineWidth=1.4;
    g.beginPath(); g.moveTo(mx+8,my+mh-13); g.lineTo(mx+mw-8,my+mh-13); g.stroke();
    g.restore();
  } else if(cov.motif==='pt'){
    /* the real cover: pale sheet up top, solid colour band below, big 필통 */
    const BD=cov.band||A, GL=cov.glyph||[255,255,255], split=Math.round(PH*.46);
    g.fillStyle='#f1f1ee'; g.fillRect(0,0,PW,split);
    g.save();
    g.translate(PW*.44,split*.5); g.rotate(-.14);
    g.fillStyle='rgba(0,0,0,.13)'; rrect(g,-30,-26,62,58,2); g.fill();
    g.fillStyle='#ffffff';         rrect(g,-33,-29,62,58,2); g.fill();
    g.restore();
    g.font="800 8px 'Noto Sans',sans-serif"; g.textAlign='right'; g.textBaseline='top';
    g.fillStyle='#222'; g.fillText('NE',PW-12,10);
    g.fillStyle=RGBA(BD,1); g.fillRect(0,split,PW,PH-split);
    g.fillStyle=RGBA(GL,.16);
    g.beginPath(); g.arc(PW*.72,split+16,30,0,Math.PI*2); g.fill();
    g.font="800 40px 'Noto Sans KR',sans-serif";
    g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle=RGBA(GL,1);
    g.fillText('필',PW*.34,split+46); g.fillText('통',PW*.66,split+46);
    g.font="700 9px 'Noto Sans KR',sans-serif";
    g.fillText('{ '+(cov.vol||'')+' }',PW*.28,PH-24);
    g.font="600 8px 'Noto Sans KR',sans-serif";
    g.fillText('하는 고등 영문법',PW*.66,PH-24);
    return finishPlate(g,cv2,b,A);
  } else if(cov.motif==='voca'){
    /* 옳은보카 실물 표지의 문법: 시리즈색 프레임, 크림 시트,
       ORUN 검정 + VOCA 시리즈색, 권 번호 검정 사각 배지. */
    g.fillStyle=RGBA(A,1); rrect(g,0,0,PW,PH,7); g.fill();
    const grd=g.createLinearGradient(0,0,0,PH);
    grd.addColorStop(0,'rgba(255,255,255,.16)'); grd.addColorStop(.5,'rgba(255,255,255,0)');
    grd.addColorStop(1,'rgba(0,0,0,.14)');
    g.fillStyle=grd; rrect(g,0,0,PW,PH,7); g.fill();
    const ix=9, iy=11, iw=PW-18, ih=PH-46;
    g.fillStyle='#f5efe0'; rrect(g,ix,iy,iw,ih,2.5); g.fill();
    /* 머리: 연구소 표기 + 개정판 칩 */
    g.textAlign='left'; g.textBaseline='alphabetic';
    g.font="600 5.2px 'Noto Sans KR','Noto Sans',sans-serif";
    g.fillStyle='#8b8474';
    g.fillText('ORUN ENGLISH 어학연구소', ix+7, iy+12);
    g.fillStyle='#191919'; rrect(g,ix+iw-33,iy+6,27,9,1); g.fill();
    g.font="600 4.8px 'Noto Sans KR',sans-serif"; g.fillStyle='#f5efe0';
    g.fillText('전면 개정판', ix+iw-30, iy+12.4);
    g.strokeStyle='rgba(60,54,40,.28)'; g.lineWidth=.6;
    g.beginPath(); g.moveTo(ix+7,iy+20); g.lineTo(ix+iw-7,iy+20); g.stroke();
    /* 워드마크 */
    g.font="800 25px 'Noto Sans',sans-serif";
    g.fillStyle='#191919'; g.fillText('ORUN', ix+7, iy+52);
    g.fillStyle=RGBA(A,1); g.fillText('VOCA', ix+7, iy+79);
    /* 권 번호 배지 */
    const bigS=String(cov.big||'');
    g.fillStyle='#191919'; rrect(g,ix+iw-29,iy+60,22,22,2.5); g.fill();
    g.font="800 13px 'Noto Sans',sans-serif";
    g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle='#ffffff'; g.fillText(bigS, ix+iw-18, iy+71.6);
    g.textAlign='left'; g.textBaseline='alphabetic';
    g.strokeStyle='rgba(60,54,40,.28)';
    g.beginPath(); g.moveTo(ix+7,iy+92); g.lineTo(ix+iw-7,iy+92); g.stroke();
    /* 책 이름과 부제 */
    const nm=(cov.lines&&cov.lines[0])||'옳은보카';
    const sub2=(cov.lines&&cov.lines[1])||'';
    g.font="800 12px 'Noto Sans KR',sans-serif"; g.fillStyle='#191919';
    g.fillText(nm+(bigS?' '+bigS:''), ix+7, iy+109);
    if(sub2){
      const fs2=fitText(g,sub2,iw-14,'600',8.5,6);
      g.fillStyle='#6f6a5c';
      g.fillText(sub2, ix+7, iy+109+fs2+5);
    }
    /* 프레임 하단 밴드: 프로그램 표기 */
    g.font="700 6.5px 'Noto Sans',sans-serif"; g.fillStyle='rgba(255,255,255,.92)';
    g.fillText('ORUN ENGLISH', ix, PH-19);
    if(cov.tag){
      g.textAlign='right';
      g.font="700 6.5px 'Noto Sans','Noto Sans KR',sans-serif";
      g.fillText(cov.tag, PW-ix, PH-19);
      g.textAlign='left';
    }
    if(cov.vol){
      g.font="600 5.4px 'Noto Sans',sans-serif"; g.fillStyle='rgba(255,255,255,.62)';
      g.fillText(cov.vol, ix, PH-9);
    }
    return finishPlate(g,cv2,b,A);
  } else if(cov.motif==='rg'){
    /* READING GRAPHY: 시험지와 같은 네이비 판, 금색 규칙선,
       READING 흰색 · GRAPHY 금색, 레벨 숫자는 유령 활자로. */
    const grd=g.createLinearGradient(0,0,PW*.4,PH);
    grd.addColorStop(0,'#155e8a'); grd.addColorStop(.6,'#0d4266'); grd.addColorStop(1,'#0a3454');
    rrect(g,0,0,PW,PH,7); g.fillStyle=grd; g.fill();
    /* 유령 레벨 숫자 */
    const bigS=String(cov.big||'');
    if(bigS){
      g.font="800 118px 'Noto Sans',sans-serif";
      g.textAlign='right'; g.textBaseline='alphabetic';
      g.fillStyle='rgba(255,255,255,.07)';
      g.fillText(bigS, PW+6, PH-26);
      g.textAlign='left';
    }
    g.font="600 5.4px 'Noto Sans','Noto Sans KR',sans-serif";
    g.fillStyle='rgba(255,255,255,.55)';
    g.fillText('ORUN ENGLISH 어학연구소', 12, 18);
    g.fillStyle='#f5c518'; g.fillRect(12,28,26,2.4);
    g.font="800 19.5px 'Noto Sans',sans-serif";
    g.fillStyle='#ffffff'; g.fillText('READING', 12, 62);
    g.fillStyle='#f5c518'; g.fillText('GRAPHY', 12, 85);
    g.font="500 6.4px 'Noto Sans KR',sans-serif";
    g.fillStyle='rgba(255,255,255,.72)';
    g.fillText('중등 독해 시리즈 · 5단계 READ RIGHT', 12, 102);
    g.fillText('RE:RIGHT 워크북 수록', 12, 113);
    /* 레벨 칩 */
    if(cov.vol){
      g.font="800 8.5px 'Noto Sans',sans-serif";
      const wv=g.measureText(cov.vol).width+16;
      g.fillStyle='#f5c518'; rrect(g,12,PH-42,wv,16,2); g.fill();
      g.fillStyle='#0c4064'; g.textBaseline='middle';
      g.fillText(cov.vol, 20, PH-33.4);
      g.textBaseline='alphabetic';
    }
    g.font="700 6px 'Noto Sans',sans-serif";
    g.fillStyle='rgba(255,255,255,.6)';
    g.fillText('ORUN ENGLISH', 12, PH-12);
    return finishPlate(g,cv2,b,A);
  } else {                                   /* bar */
    let bg=g.createLinearGradient(mx,my,mx+mw,my+mh);
    bg.addColorStop(0,RGBA(A,1)); bg.addColorStop(1,RGBA(HOT,.75));
    g.fillStyle=bg; rrect(g,mx,my,mw,mh,3); g.fill();
    g.save(); rrect(g,mx,my,mw,mh,3); g.clip();
    g.fillStyle='rgba(255,255,255,.3)';
    g.beginPath(); g.moveTo(mx-6,my+mh); g.lineTo(mx+mw*.46,my-4); g.lineTo(mx+mw*.7,my-4); g.lineTo(mx+mw*.24,my+mh); g.closePath(); g.fill();
    g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=1.2;
    [mh*.22,mh*.78].forEach(yy=>{ g.beginPath(); g.moveTo(mx+9,my+yy); g.lineTo(mx+mw-9,my+yy); g.stroke(); });
    g.restore();
  }

  /* wordmark */
  const lines=cov.lines||[b.short||b.title];
  let ty=my+mh+24;
  g.textAlign='left'; g.textBaseline='alphabetic';
  lines.forEach((t,i)=>{
    const lead=(i===lines.length-1&&lines.length>1);
    const px=fitText(g,t,PW-mx-12,lead?'800':'600',lead?17:13.5,7);
    g.fillStyle=lead?INK:'rgba(38,66,96,.9)';
    g.fillText(t,mx,ty);
    ty+=px+5;
  });

  /* volume badge */
  if(cov.vol){
    g.font="700 9px 'Noto Sans KR','Noto Sans',sans-serif";
    const w=g.measureText(cov.vol).width+13;
    g.fillStyle=RGBA(A,.95); rrect(g,PW-14-w,PH-30,w,15,7.5); g.fill();
    g.fillStyle='#fff'; g.textAlign='center'; g.textBaseline='middle';
    g.fillText(cov.vol,PW-14-w/2,PH-22.2);
  }
  /* imprint */
  g.font="500 8px 'Noto Sans KR','Noto Sans',sans-serif";
  g.textAlign='left'; g.textBaseline='middle';
  g.fillStyle='rgba(70,102,132,.9)';
  g.fillText(b.publisher||'',mx,PH-22);

  /* holographic pass — thin scanlines and a diagonal sheen */
  g.globalAlpha=.5;
  g.fillStyle=RGBA(A,.07);
  for(let y=0;y<PH;y+=3) g.fillRect(0,y,PW,1);
  g.globalAlpha=1;
  let sh=g.createLinearGradient(0,PH,PW,0);
  sh.addColorStop(0,'rgba(255,255,255,0)');
  sh.addColorStop(.46,'rgba(255,255,255,.34)');
  sh.addColorStop(.54,'rgba(255,255,255,0)');
  g.fillStyle=sh; g.fillRect(0,0,PW,PH);
  g.restore();

  /* edge */
  rrect(g,.75,.75,PW-1.5,PH-1.5,7);
  g.strokeStyle=RGBA(A,.75); g.lineWidth=1.5; g.stroke();
  PLATE[b.id]=cv2;
  return cv2;
}

function drawCovers(){
  /* ten blits a frame — cheap enough to survive the quality governor */
  live.forEach(n=>{ if(n.kind==='book') n.plate=null; });
  const list=live.filter(n=>n.kind==='book'&&n.vis>=.06&&n.payload)
                 .map(n=>({n:n,s:toScreen(n)}))
                 /* far first, but the chosen book always lands on top */
                 .sort((a,b)=>{
                   const sa=isOnPath(a.n)?1:0, sb=isOnPath(b.n)?1:0;
                   return sa!==sb ? sa-sb : b.s[3]-a.s[3];
                 });
  const crowd=live.length>90?.62:1;
  const anySel=live.some(n=>n.kind==='book'&&isOnPath(n));
  /* 표지끼리 겹치지 않게, 가장 가까운 이웃 표지까지의 화면 거리를 재서
     그 안에 들어오도록 폭을 깎는다. 교재가 몇 권이든 어느 은하든 저절로
     맞으므로, 권수마다 크기를 손으로 정해 줄 필요가 없다. */
  list.forEach(o=>{
    /* 표지는 화면 밖으로 나가지 않게 세로 위치가 눌린다 — 그 눌린 자리로
       재야 실제로 겹치는지 알 수 있다. */
    const sel0=isOnPath(o.n), zz0=o.s[2]*cam.zoom;
    const hN=Math.min(sel0?188:126,(sel0?112:75)*zz0);
    o.cy=Math.max(hN/2+10,Math.min(H-hN/2-10,o.s[1]));
  });
  list.forEach((o,i)=>{
    let d=1e9;
    list.forEach((q,j)=>{
      if(i===j) return;
      /* 직사각형 둘은 가로로 떨어져 있거나 세로로 떨어져 있으면 안 겹친다.
         가운데 거리(hypot)로 폭만 깎으면, 위아래로 포개진 짝은 그대로
         겹친 채 남는다 — 두 축을 각각 보고 더 넉넉한 쪽을 기준으로 삼는다. */
      const dx=Math.abs(o.s[0]-q.s[0]), dy=Math.abs(o.cy-q.cy);
      d=Math.min(d, Math.max(dx, dy*PW/PH));
    });
    o.cap = d<1e8 ? d*0.94 : 1e9;
  });
  /* 표지 크기를 하나로 맞춘다. 원근대로 제각각 두면 고리 뒤쪽 표지만
     작아져서, 각도는 고르게 놓였는데도 줄이 흐트러져 보인다. 고른 간격은
     고른 크기와 같이 가야 눈에 고르게 읽힌다. 고른 뒤에도 최소 34px 는
     지켜 표지가 알아볼 수 없이 작아지지는 않게 한다. */
  let uniW=1e9;
  list.forEach(o=>{
    const zz0=o.s[2]*cam.zoom;
    uniW=Math.min(uniW, Math.min(126*PW/PH, 75*zz0*PW/PH), o.cap);
  });
  uniW=Math.max(34,uniW);
  list.forEach(o=>{
    const n=o.n, [x,y,k,z]=o.s;
    const zz=k*cam.zoom;
    if(zz<.3) return;
    const st=nodeStyle(n), R=st.rad*k*cam.zoom;
    const gr=GRADE[n.payload.id]||GDEF;
    const sel=isOnPath(n);
    /* the chosen book steps forward: larger, at full strength, while the
       rest fall back — otherwise ten covers all shout at once */
    const A=n.vis*(n.dim==null?1:n.dim)*fog(z)*crowd
            *Math.min(1,(zz-.3)/.22)
            *(sel?1 : hover===n?.95 : anySel?.5 : .9);
    if(A<=.02) return;
    /* 고른 크기를 쓰되, 고른 것과 커서가 얹힌 것만 앞으로 한 걸음 나온다 */
    let w=uniW*(sel?1.5:hover===n?1.14:1);
    let h=w*PH/PW;
    /* 간격을 잴 때 쓴 바로 그 세로 위치를 그대로 쓴다 — 재는 자리와 그리는
       자리가 어긋나면 그 차이만큼 표지가 다시 겹친다. */
    const cy=o.cy;
    const plate=coverPlate(n.payload);
    ctx.save();
    ctx.globalAlpha=A;

    /* halo, so the plate sits in the light rather than on top of it */
    const hg=ctx.createRadialGradient(x,cy,0,x,cy,w*(sel?1.35:1.15));
    hg.addColorStop(0,sel?RGBA(YEL,.34):RGBA(gr.base,hover===n?.3:.16));
    hg.addColorStop(1,sel?RGBA(YEL,0):RGBA(gr.base,0));
    ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(x,cy,w*(sel?1.35:1.15),0,Math.PI*2); ctx.fill();

    /* contact shadow */
    ctx.globalAlpha=A*.4; ctx.fillStyle='rgba(0,8,18,.85)';
    ctx.beginPath(); ctx.ellipse(x,cy+h/2+3,w*.42,h*.045,0,0,Math.PI*2); ctx.fill();

    ctx.globalAlpha=A;
    ctx.shadowColor=sel?RGBA(YEL,.6):RGBA(gr.base,.45);
    ctx.shadowBlur=sel?26:(hover===n?18:8);
    n.plate={x:x-w/2,y:cy-h/2,w:w,h:h};      /* the cover is a click target */
    ctx.drawImage(plate,x-w/2,cy-h/2,w,h);
    ctx.shadowBlur=0;
    /* class / band strip along the foot of the cover */
    if(n.sub){
      const bh2=Math.max(10,h*.125), by=cy+h/2-bh2;
      ctx.save();
      ctx.fillStyle='rgba(5,14,26,.80)';
      ctx.fillRect(x-w/2,by,w,bh2);
      ctx.fillStyle=RGBA(sel?YEL:gr.hot,.9);
      ctx.fillRect(x-w/2,by,w,1.1);
      let fs=bh2*.62;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      for(;fs>4;fs-=.5){
        ctx.font='600 '+fs.toFixed(1)+'px "Noto Sans Mono",monospace';
        if(ctx.measureText(n.sub).width<=w-10) break;
      }
      const sgd=ctx.createLinearGradient(x,by,x,by+bh2);
      sgd.addColorStop(0,'rgba(248,252,255,.99)');
      sgd.addColorStop(1,'rgba(176,196,220,.95)');
      ctx.fillStyle=sgd;
      ctx.fillText(n.sub,x,by+bh2/2+.5);
      ctx.restore();
    }
    if(sel){                                  /* a gold frame marks the choice */
      ctx.strokeStyle=RGBA(YEL,.9); ctx.lineWidth=2;
      rrect(ctx,x-w/2-3,cy-h/2-3,w+6,h+6,9); ctx.stroke();
      ctx.strokeStyle=RGBA(YEL,.28); ctx.lineWidth=1;
      rrect(ctx,x-w/2-7,cy-h/2-7,w+14,h+14,12); ctx.stroke();
    }
    ctx.restore();
  });
}

/* Orbitron carries the Latin and the numerals; Hangul falls through to Noto
   in the same stack, so 'CH 8.' is technical and 관계사 stays readable. */
const NODEF="'Orbitron','Noto Sans KR',sans-serif";
function labelFont(n,k,zoom){
  /* zoom 을 넘기면 그 배율에서의 크기를 답한다 — fit() 이 아직 정하지 않은
     배율로 이름표 폭을 미리 재야 하기 때문이다. */
  const z=Math.max(.72,Math.min(1.32,k*(zoom==null?cam.zoom:zoom)));
  if(n.kind==='book') return '600 '+(11*z).toFixed(1)+'px '+NODEF;
  if(n.kind==='chap') return '500 '+(9.6*z).toFixed(1)+'px '+NODEF;
  return '500 '+(9.2*z).toFixed(1)+'px '+NODEF;
}
function drawLabel(n,x,y,R,st,A,k){
  const zz=k*cam.zoom;
  if(n.kind==='item'&&zz<(live.length>60?.72:.5)&&hover!==n) return;
  if(n.kind==='chap'&&live.length>60&&zz<.46&&hover!==n&&!isOnPath(n)) return;
  if(n.kind==='chap'&&zz<.4) return;
  /* 이웃과 겹칠 만큼 촘촘하면 아예 내지 않는다. 교재가 원을 똑같이 나눠 갖는
     이상, 챕터가 많은 교재(옳은보카 Ultimate 29파트)는 좁은 몫에 몰릴 수밖에
     없다 — 뭉개진 글자 덩어리는 아무것도 알려 주지 않으므로, 자리가 날 만큼
     확대했을 때 비로소 내준다. 커서를 얹거나 고른 것은 언제나 보인다. */
  if(expandAll && n.arcW && hover!==n && !isOnPath(n)){
    if(n.r*(n.arcW*Math.PI/180)*zz < 30) return;
  }
  const c=pt(0,0,0);
  const dx=x-c[0], dy=y-c[1], dl=Math.hypot(dx,dy)||1;
  const left=dx<0, off=R+10;
  const lx=x+dx/dl*off, ly=y+dy/dl*off;
  const on=isOnPath(n);
  /* the cover plate already carries the title — don't set it twice */
  const plated = n.kind==='book' && zz>=.3;
  ctx.save();
  ctx.globalAlpha=A*(hover===n?1:.94);
  ctx.font=labelFont(n,k);
  ctx.textAlign=left?'right':'left'; ctx.textBaseline='middle';
  ctx.fillStyle= on?'#ffe566' : hover===n?CSS(gradeOf(n).hot) : 'rgba(188,216,238,.94)';
  let t=n.label;
  const cap=n.kind==='item'?22:n.kind==='chap'?20:24;
  if(t.length>cap) t=t.slice(0,cap-1)+'…';
  /* no shadowBlur on type — it is what made the labels look smeared */
  if(live.length>60 && n.kind!=='book'){
    /* radial labels: adjacent ones diverge instead of stacking */
    const ang=Math.atan2(dy,dx);
    ctx.translate(lx,ly);
    if(left){ ctx.rotate(ang+Math.PI); ctx.textAlign='right'; }
    else     { ctx.rotate(ang);        ctx.textAlign='left';  }
    ctx.fillText(t,0,0);
  } else if(!plated){
    ctx.fillText(t,lx,ly);
  }
  ctx.shadowBlur=0;
  if(false){
    /* the band code names the class that uses this book — silver so it
       reads as a plate on the map rather than another dim label */
    const fs=(11*Math.max(.85,Math.min(1.25,zz))).toFixed(1);
    ctx.font='600 '+fs+'px "Noto Sans Mono",monospace';
    /* hung straight below the node: the cover occupies the space above, and
       a radial offset walks the class name into the neighbour's cover */
    const by=y+R+15;
    const sg=ctx.createLinearGradient(x,by-7,x,by+7);
    sg.addColorStop(0,'rgba(246,250,255,.98)');
    sg.addColorStop(.5,'rgba(198,214,232,.95)');
    sg.addColorStop(1,'rgba(150,172,198,.92)');
    ctx.fillStyle=sg; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(n.sub,x,by);
    ctx.shadowBlur=0;
  }
  ctx.restore();
}

/* ============================================================
   8. INTERACTION — drag orbits the lattice, wheel dollies in
   ============================================================ */
function hit(mx,my){
  /* Covers are the biggest thing on screen and the obvious thing to aim at,
     so they are hit-tested first — and nearest-centre wins where two overlap. */
  let bp=null,bpd=1e9;
  live.forEach(n=>{
    const r=n.plate;
    if(!r||n.vis<.4) return;
    if(mx<r.x||mx>r.x+r.w||my<r.y||my>r.y+r.h) return;
    const d=Math.hypot(mx-(r.x+r.w/2),my-(r.y+r.h/2));
    if(d<bpd){bpd=d;bp=n;}
  });
  if(bp) return bp;
  let best=null,bd=1e9;
  live.forEach(n=>{
    if(n.vis<.4||n.kind==='core') return;
    const [x,y,k]=toScreen(n);
    const R=nodeStyle(n).rad*k*cam.zoom+10;
    const d=Math.hypot(mx-x,my-y);
    if(d<R&&d<bd){best=n;bd=d;}
  });
  return best;
}
/* 이름판 히트 — 어느 모드에서든 이름판 클릭은 그 은하로 들어가는 문이다 */
function plateAt(mx,my){
  let best=null,bd=1e9;
  GALAXIES.forEach(g=>{
    const r=g.plateRect;
    if(!r) return;
    if(mx<r.x||mx>r.x+r.w||my<r.y||my>r.y+r.h) return;
    const d=Math.hypot(mx-(r.x+r.w/2),my-(r.y+r.h/2));
    if(d<bd){bd=d;best=g;}
  });
  return best;
}
/* 우주 모드에서 은하 원반 아무 데나 클릭해도 들어간다 */
function galaxyAt(mx,my){
  let best=null,bd=1e9;
  const kx=GOFF.x,ky=GOFF.y,kz=GOFF.z;
  GALAXIES.forEach(g=>{
    setGOFF(g);
    towerUpright=true;
    const c=pt(0,-40,0);
    towerUpright=false;
    const R=RADII[3]*1.12*c[2]*cam.zoom;
    const d=Math.hypot(mx-c[0],my-c[1]);
    if(d<R&&d<bd){bd=d;best=g;}
  });
  GOFF.x=kx; GOFF.y=ky; GOFF.z=kz;
  return best;
}
let drag=null;
cv.addEventListener('pointerdown',e=>{
  cv.setPointerCapture(e.pointerId);
  drag={x:e.clientX,y:e.clientY,yaw:cam.tyaw,pitch:cam.tpitch,px:cam.tpx,py:cam.tpy,moved:0,pan:e.shiftKey||e.button===1};
  autoFrame=false;
  cam.idle=0; cv.classList.add('drag');
});
cv.addEventListener('pointermove',e=>{
  const r=cv.getBoundingClientRect();
  if(drag){
    const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
    drag.moved=Math.max(drag.moved,Math.hypot(dx,dy));
    cam.idle=0;
    if(drag.pan){ cam.tpx=drag.px+dx; cam.tpy=drag.py+dy; clampPan(); cam.px=cam.tpx; cam.py=cam.tpy; }
    else{
      cam.tyaw=drag.yaw+dx*0.006;
      cam.tpitch=Math.max(PITCH_MIN,Math.min(PITCH_MAX,drag.pitch+dy*0.005));
      if(Math.abs(dy)>2) pitchUser=true;
      if(Math.abs(dx)>2) yawUser=true;
    }
    return;
  }
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  const gp=plateAt(mx,my);
  if(gp!==plateHover){ plateHover=gp; }
  const h=(universeMode||gp)?null:hit(mx,my);
  if(h!==hover){ hover=h; }
  const ug=universeMode&&!gp ? galaxyAt(mx,my) : null;
  cv.style.cursor=(h||gp||ug)?'pointer':'grab';
});
cv.addEventListener('pointerup',e=>{
  cv.classList.remove('drag');
  const moved=drag&&drag.moved>5; drag=null;
  if(moved) return;
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  const gp=plateAt(mx,my);
  if(gp){ enterGalaxy(gp); return; }
  if(universeMode){
    const ug=galaxyAt(mx,my);
    if(ug) enterGalaxy(ug);
    return;
  }
  const n=hit(mx,my);
  if(n){ activate(n); return; }
  const lp=pt(0,-LANTERN/2,0);                 /* the tower is the way home */
  if(Math.hypot(mx-lp[0],my-lp[1]) < 92*lp[2]*cam.zoom) activate(ROOT);
});
cv.addEventListener('pointercancel',()=>{drag=null;cv.classList.remove('drag')});
cv.addEventListener('wheel',e=>{
  e.preventDefault(); cam.idle=0;
  /* 손으로 배율을 잡는 순간 자동 맞춤은 물러난다 — 안 그러면 다음 전환이
     사용자의 배율을 덮어쓴다. 대신 '딱 맞는 배율'을 기준으로 위아래를
     묶어, 점이 되도록 줄이거나 화면 밖으로 터지도록 키울 수 없게 한다. */
  autoFrame=false;
  cam.tzoom=Math.max(zoomLo(),Math.min(zoomHi(),cam.tzoom*Math.exp(-e.deltaY*0.0012)));
},{passive:false});

function activate(n){
  cam.idle=0;
  if(expandAll && n.kind!=='core'){ expandAll=false; syncAllBtn(); }
  if(n.kind==='core'){ focus=[ROOT]; sync(); return; }
  if(n.kind==='item'){
    /* selecting a unit no longer flings the sheet open — it fills the panel,
       and the panel's button publishes. Clicking a unit and losing the map
       under a modal was the wrong default. */
    const p=[]; let c=n; while(c){p.unshift(c);c=c.parent;}
    focus=p; sync(false); return;
  }
  const p=[]; let c=n; while(c){p.unshift(c);c=c.parent;}
  focus=(focus.length===p.length&&focus[focus.length-1]===n)? p.slice(0,-1) : p;
  if(!focus.length) focus=[ROOT];
  sync();
}
function sync(doFit){
  layout(); modePose();
  if(doFit!==false){ autoFrame=true; framePend=true; }
  renderRails();
  renderCrumb();
}

/* ── 은하 진입 / 우주 귀환 ─────────────────────────────────── */
/* 전개 깊이가 모드에 따라 달라지므로(fullDepth), 모드가 바뀌면 세 은하를
   모두 다시 편다. 안 그러면 배경 은하가 낡은 배치로 남아 크기가 어긋난다. */
function relayoutAll(){
  GALAXIES.forEach(g=>withGalaxy(g,()=>{ layout(); }));
  bindGalaxy(ACTIVE);
}
function enterGalaxy(g){
  cam.idle=0;
  /* 떠나는 은하는 은하 모습(전체 전개)으로 되돌려 두고 간다 — 배경에서
     파고든 흔적(펼쳐진 부채)이 아니라 온전한 나선으로 떠 있어야 한다. */
  if(ACTIVE&&ACTIVE!==g&&!universeMode){ expandAll=true; focus=[ROOT]; layout(); }
  bindGalaxy(g);
  universeMode=false;
  WCT.x=g.pos.x; WCT.y=g.pos.y; WCT.z=g.pos.z;
  expandAll=true; focus=[ROOT];
  pitchUser=false; yawUser=false; autoFrame=true; framePend=true;
  hover=null; plateHover=null;
  syncGalaxyChrome();
  relayoutAll();
  sync();
}
function toUniverse(){
  cam.idle=0;
  /* 파고들었던 은하는 은하 모습으로 되돌려 두고 나간다 */
  expandAll=true; focus=[ROOT]; layout();
  universeMode=true;
  WCT.x=0; WCT.y=0; WCT.z=0;
  pitchUser=false; yawUser=false; autoFrame=true; framePend=true;
  hover=null;
  relayoutAll();
  modePose();
  syncGalaxyChrome();
  renderRails(); renderCrumb();
}

/* ============================================================
   9. RAILS
   ============================================================ */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function renderCrumb(){
  const el=document.getElementById('crumb');
  if(universeMode){
    el.innerHTML='<span class="crumb tail">UNIVERSE · 3 GALAXIES · '+U_BOOKS+'권 · '+U_UNITS+' NODES</span>';
    document.getElementById('rd-path').textContent='UNIVERSE // GRAMMAR · READING · VOCAB';
    return;
  }
  const uni='<button class="crumb" data-uni="1">UNIVERSE</button><span class="crumb-sep">/</span>';
  const parts=focus.map((n,i)=>{
    const label = n.kind==='core'?ACTIVE.name:n.label;
    const tail = i===focus.length-1?' tail':'';
    return '<button class="crumb'+tail+'" data-i="'+i+'">'+esc(label)+'</button>';
  });
  el.innerHTML=uni+parts.join('<span class="crumb-sep">/</span>');
  if(expandAll){
    const shown=DATA.books.filter(b=>!gradeFilter||(b.grades||[]).indexOf(gradeFilter)>=0);
    el.innerHTML=uni+'<span class="crumb tail">'+esc(ACTIVE.name)+' 전체 전개 · '+shown.length+'권 / '
      +shown.reduce((s,b)=>s+b.chapters.length,0)+' CHAPTER</span>';
  }
  el.querySelectorAll('.crumb[data-i]').forEach(b=>b.onclick=()=>{
    focus=focus.slice(0,+b.dataset.i+1); sync();
  });
  el.querySelectorAll('.crumb[data-uni]').forEach(b=>b.onclick=()=>toUniverse());
  const path=(expandAll?ACTIVE.name+' // FULL LATTICE'
    : ACTIVE.name+' // '+focus.map(n=>n.kind==='core'?'CORE':n.label).join(' // '));
  document.getElementById('rd-path').textContent=path;
}

function renderUniverseRails(){
  const L=document.getElementById('sec-chain');
  const R=document.getElementById('sec-grade');
  const J=document.getElementById('sec-jump');
  L.innerHTML=GALAXIES.map(g=>{
    const S=g.S, m=S.DATA.meta||{};
    const AC='rgb('+g.accent[0]+','+g.accent[1]+','+g.accent[2]+')';
    return '<div class="slab gcard" data-enter="'+g.id+'">'
      +'<h3 style="color:'+AC+'"><span class="gdot" style="background:'+AC+'"></span>'+esc(g.name)+'</h3>'
      +'<p class="gkr">'+esc(g.kr)+' — '+esc(g.tagline)+'</p>'
      +'<dl class="kv" style="margin-top:9px">'
      +'<dt>교재</dt><dd class="num">'+S.DATA.books.length+'권</dd>'
      +'<dt>'+esc(S.TR.unit||'UNIT')+'</dt><dd class="num">'+S.totalItems+'</dd>'
      +'<dt>시험지</dt><dd class="num">'+S.totalSheets+' / '+S.totalItems+'</dd>'
      +'</dl>'
      +'<button class="act gold" style="width:100%;margin-top:10px" data-enter-btn="'+g.id+'">'+esc(g.name)+' 은하 진입</button>'
      +'</div>';
  }).join('');
  L.querySelectorAll('[data-enter-btn]').forEach(b=>b.onclick=()=>{
    const g=GALAXIES.find(x=>x.id===b.dataset.enterBtn);
    if(g) enterGalaxy(g);
  });
  R.innerHTML='<div class="slab"><h3>ORUN UNIVERSE</h3>'
    +'<p>세 은하가 한 하늘에 떠 있습니다. 각 은하의 중심에는 옳은영어의 등대가 서고, '
    +'등대 머리 위의 이름을 클릭하면 그 은하로 들어갑니다.</p>'
    +'<dl class="kv" style="margin-top:10px">'
    +'<dt>은하</dt><dd class="num">3</dd>'
    +'<dt>교재</dt><dd class="num">'+U_BOOKS+'권</dd>'
    +'<dt>단원 노드</dt><dd class="num">'+U_UNITS+'</dd>'
    +'<dt>시험지</dt><dd class="num">'+U_SHEETS+'</dd>'
    +'</dl></div>'
    +'<div class="slab"><h3>항법</h3>'
    +'<p style="font-size:12px;color:var(--text-dim)">은하 클릭 · 이름판 클릭 → 진입<br>'
    +'ESC 또는 [우주로] → 이 화면으로 복귀<br>드래그 회전 · 휠 확대</p></div>';
  J.innerHTML=GALAXIES.map(g=>{
    const AC='rgb('+g.accent[0]+','+g.accent[1]+','+g.accent[2]+')';
    return '<div class="chlist"><button data-enter-btn2="'+g.id+'">'
      +'<span class="no" style="color:'+AC+'">◈</span>'
      +'<span class="nm">'+esc(g.name)+' · '+esc(g.kr)+'</span>'
      +'<span class="cnt">'+g.S.DATA.books.length+'권</span></button></div>';
  }).join('');
  J.querySelectorAll('[data-enter-btn2]').forEach(b=>b.onclick=()=>{
    const g=GALAXIES.find(x=>x.id===b.dataset.enterBtn2);
    if(g) enterGalaxy(g);
  });
}

function pubName(it){
  const t=String(it.title||'');
  return new RegExp('^'+UW+'\\s*\\d','i').test(t) ? t : UW+' '+(it.unitNo||'—')+' · '+t;
}
function renderRails(){
  if(universeMode){ renderUniverseRails(); return; }
  const tail=focus[focus.length-1];
  const L=document.getElementById('sec-chain');
  const R=document.getElementById('sec-grade');

  /* ── LEFT: 큰개념 → 맵핑 → 세부설명 (+ 페이지·학습목표) ── */
  const tiers=[
    {t:'교재 / Textbook',      n:focus[1]},
    {t:'큰개념 / Chapter',     n:focus[2]},
    {t:'세부설명 / Unit Node', n:focus[3]},
  ];
  let html='<div class="chain">';
  tiers.forEach(x=>{
    const on = x.n && x.n===tail;
    html+='<div class="link'+(on?' on':'')+'"><span class="tier">'+esc(x.t)+'</span>'
        + '<span class="val">'+(x.n?esc(x.n.label):'<span style="color:var(--text-faint)">—</span>')+'</span></div>';
  });
  html+='</div>';

  const chapN=focus[2], bookN=focus[1], itemN=focus[3];
  if(bookN){
    const b=bookN.payload;
    html+='<div class="slab"><h3>교재 정보</h3><dl class="kv">'
      +'<dt>정식명</dt><dd>'+esc(b.title)+'</dd>'
      +(b.publisher?'<dt>출판</dt><dd>'+esc(b.publisher)+'</dd>':'')
      +'<dt>적용반</dt><dd>'+esc(b.band||'—')+'</dd>'
      +'<dt>단원수</dt><dd class="num">'+b.chapters.length+'</dd>'
      +'</dl>'
      +(b.confidence&&b.confidence!=='high'?'<div style="margin-top:9px"><span class="prov">목차 잠정안</span></div>':'')
      +(b.basis?'<p style="margin-top:8px;font-size:11.5px;color:var(--text-dim)">'+esc(b.basis)+'</p>':'')
      +'</div>';

    /* 발행 버튼은 교재 정보 바로 아래 — 단원을 고르기 전에도 자리를 지켜서
       어디를 눌러야 시험지가 나오는지 헤매지 않게 한다. */
    const it=itemN&&itemN.payload, has=it&&!!DATA.worksheets[it.id];
    html+='<div class="slab pub"><h3>시험지 발행</h3>';
    if(has){
      html+='<p class="pub-unit">'+esc(pubName(it))+'</p>'
          + '<button class="act gold" style="width:100%" data-open="'+esc(it.id)+'">'+TR.recall+' · '+TR.check+' 발행</button>'
          + '<p class="pub-hint">Word · PDF · 인쇄</p>';
    } else if(it){
      html+='<p class="pub-unit">'+esc(pubName(it))+'</p>'
          + '<button class="act gold" style="width:100%" disabled>시험지 없음</button>'
          + '<p class="pub-hint">이 단원은 아직 시험지가 연결되지 않았습니다.</p>';
    } else {
      html+='<button class="act gold" style="width:100%" disabled>단원을 선택하십시오</button>'
          + '<p class="pub-hint">지도에서 최종 노드를 클릭하거나, 아래 DIRECT ACCESS에서 단원을 고르십시오.</p>';
    }
    html+='</div>';

    /* 낱장 발행 바로 아래에 한 권 발행 — 오늘 쓸 종이와 학기 내내 쓸 책.
       지금은 화면에서만 감춰 두었다(MB_UI). 조판·Word·인쇄 경로는 그대로
       살아 있으므로 MB_UI 를 true 로 되돌리면 카드가 곧바로 돌아온다. */
    if(MB_UI){
      const mbN=mbUnits(b).length;
      html+='<div class="slab mb"><h3>ORUN GRAMMAR 발행</h3>';
      if(mbN){
        html+='<p class="pub-unit">'+esc(b.short||b.title)+' 전권</p>'
            + '<p class="mb-spec">UNIT '+mbN+' · 시험지 '+(mbN*2)+'장 · 해설 권말</p>'
            + '<button class="act gold" style="width:100%" data-mb="'+esc(b.id)+'">한 권으로 묶기</button>'
            + '<p class="pub-hint">유닛마다 '+TR.recall+' + '+TR.check+' 가 한 세트로 이어지고, 정답과 해설은 전부 맨 뒤에 모입니다.</p>';
      } else {
        html+='<button class="act gold" style="width:100%" disabled>시험지 없음</button>'
            + '<p class="pub-hint">이 교재는 아직 문항이 생성되지 않았습니다.</p>';
      }
      html+='</div>';
    }
  }
  if(chapN){
    const c=chapN.payload;
    html+='<div class="slab"><h3>학습목표</h3><p>'
      +(c.objective? esc(c.objective)
        : '<span style="color:var(--text-faint)">교재 이론 분석 대기 중입니다. 단원명과 페이지는 실제 교재 목차에서 확정된 값입니다.</span>')+'</p>'
      +'<dl class="kv" style="margin-top:10px">'
      +'<dt>단원</dt><dd class="num">'+esc((TR.chWord||'CHAPTER')+' '+c.no)+'</dd>'
      +'<dt>교재 페이지</dt><dd class="num">p.'+esc(String(c.page||'—'))+'</dd>'
      +'<dt>세부항목</dt><dd class="num">'+c.items.length+' UNITS</dd>'
      +'</dl>'
      +(c.bigIdea?'<p style="margin-top:10px;padding-top:9px;border-top:1px solid var(--edge);font-size:12px;color:var(--holo-soft)">'+esc(c.bigIdea)+'</p>':'')
      +(c.pending?'<div style="margin-top:9px"><span class="prov">생성 대기</span></div>':'')
      +'</div>';
  }
  if(itemN){
    const it=itemN.payload;
    html+='<div class="slab"><h3>세부설명</h3><p>'
      +(it.summary? esc(it.summary)
        : '<span style="color:var(--text-faint)">교재 이론에서 추출 대기 중</span>')+'</p>'
      +'<dl class="kv" style="margin-top:10px"><dt>UNIT</dt><dd class="num">'+esc(String(it.unitNo||'—'))+'</dd>'
      +'<dt>교재 페이지</dt><dd class="num">p.'+esc(String(it.page||'—'))+'</dd></dl></div>';
    if(it.keyPoints&&it.keyPoints.length){
      html+='<div class="slab"><h3>암기 포인트</h3><ul class="pts">'
        + it.keyPoints.map(k=>'<li>'+esc(k)+'</li>').join('')+'</ul></div>';
    }
  }
  if(!focus[1]){
    html='<div class="void-note">코어에서 교재를<br>선택하십시오</div>';
  }
  L.innerHTML=html;
  L.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openSheet(ITEM[b.dataset.open]));
  L.querySelectorAll('[data-mb]').forEach(b=>b.onclick=()=>openVolume(b.dataset.mb));

  /* ── RIGHT: 학년별 차등개념 ── */
  let rh='';
  const anchorChap = chapN? chapN.payload : null;
  if(anchorChap){
    const ids=strandsOf(anchorChap);
    if(ids.length){
      ids.forEach(sid=>{
        const meta=TOPICMETA[sid];
        const rows=TOPIC[sid];
        const maxN=Math.max.apply(null,rows.map(r=>r.chap.items.length));
        rh+='<div class="slab" style="border-color:rgba(255,209,0,.3)"><h3>추적 주제</h3>'
          +'<p style="color:var(--gold-soft);font-weight:500">'+esc(meta.label)+'</p>'
          +'<p style="margin-top:6px;font-size:11.5px;color:var(--text-dim)">'
          + (rows.length>1
              ? '이 주제는 '+rows.length+'개 교재에 걸쳐 심화됩니다. 아래는 학년별 차등 구성입니다.'
              : '이 주제는 해당 교재에서만 단독으로 다룹니다.')
          +'</p></div>';
        rows.forEach(r=>{
          const on = r.book.id===anchorChap.bookId && r.chap.no===anchorChap.no;
          const pct=Math.round(r.chap.items.length/maxN*100);
          rh+='<div class="rung'+(on?' on':'')+'" '+(on?'':'data-jump="'+r.book.id+'/'+r.chap.no+'"')+'>'
            +'<div class="lv">'+esc(r.book.band||r.book.short||'')+' <em>'+esc(r.book.gradeTag||'')+'</em></div>'
            +'<div class="bk">'+esc(r.book.short||r.book.title)+' · CH '+r.chap.no+' '+esc(r.chap.title)+'</div>'
            +'<div class="tp">'+esc(r.chap.objective||r.chap.title)+'</div>'
            +'<div class="depth"><i style="width:'+pct+'%"></i></div>'
            +'<div style="margin-top:4px;font-family:var(--f-mono);font-size:9px;color:var(--text-faint);letter-spacing:.1em">'
            + r.chap.items.length+' UNITS · 교재 p.'+esc(String(r.chap.page||'—'))+'</div>'
            +'</div>';
        });
      });
    } else {
      rh='<div class="void-note">이 주제는 선택한 교재에만<br>단독으로 등장합니다</div>';
    }
  } else {
    const bn=focus[1];
    if(bn){
      const b=bn.payload;
      const nodes=b.chapters.reduce((s,c)=>s+c.items.length,0);
      rh+='<div class="slab"><h3>'+esc(b.short||b.title)+'</h3><p>'+esc(b.desc||'')+'</p>'
        +'<dl class="kv" style="margin-top:10px">'
        +'<dt>적용반</dt><dd>'+esc(b.band||'—')+'</dd>'
        +'<dt>구성</dt><dd class="num">'+b.chapters.length+' CH · '+nodes+' UNITS</dd></dl></div>';
      rh+='<div class="slab"><h3>교재를 가로지르는 주제</h3><p style="font-size:11.5px;color:var(--text-dim)">'
        +'단원을 선택하면 같은 주제가 다른 학년 교재에서 어떻게 심화되는지 나란히 비교됩니다.</p></div>';
      DATA.topics.filter(t=>t.chapters.length>1&&t.chapters.some(c=>c[0]===b.id)).forEach(t=>{
        rh+='<div class="rung" data-jump="'+t.chapters.filter(c=>c[0]===b.id)[0].join('/')+'">'
          +'<div class="lv">'+esc(t.label)+'</div>'
          +'<div class="tp" style="font-size:11.5px;color:var(--text-dim)">'
          + t.chapters.map(c=>(BOOK[c[0]]?BOOK[c[0]].short:c[0])+' CH'+c[1]).join('  →  ')+'</div></div>';
      });
    } else {
      rh='<div class="void-note">교재를 선택하면<br>차등 커리큘럼이 표시됩니다</div>';
    }
  }
  R.innerHTML=rh;
  renderJump();
  /* jump the lattice to the same strand in another textbook */
  R.querySelectorAll('[data-jump]').forEach(el=>{
    el.style.cursor='pointer';
    el.title='이 교재의 해당 단원으로 이동';
    el.onclick=()=>{
      const [bid,no]=el.dataset.jump.split('/');
      const target=findChapNode(bid,+no);
      if(target){ const p=[]; let c=target; while(c){p.unshift(c);c=c.parent;} focus=p; sync(); }
    };
  });
}
/* A fast path that does not require flying the lattice: choose the book,
   pick the chapter, and drop straight onto a unit's worksheet.
   jumpBook 은 은하 상태다 — bindGalaxy 가 채운다. */
function renderJump(){
  const el=document.getElementById('sec-jump');
  const shown=DATA.books.filter(b=>!gradeFilter||(b.grades||[]).indexOf(gradeFilter)>=0);
  if(!shown.length){ el.innerHTML='<div class="void-note">이 학년에 배정된<br>교재가 없습니다</div>'; return; }

  if(focus[1]&&focus[1].payload) jumpBook=focus[1].payload.id;
  if(!shown.some(b=>b.id===jumpBook)) jumpBook=shown[0].id;
  const book=BOOK[jumpBook];
  const curCh=focus[2]&&focus[2].payload? focus[2].payload.no : null;
  const curU =focus[3]&&focus[3].payload? focus[3].payload.id : null;

  let h='<select class="pick" id="jump-book" aria-label="교재 선택">'
    + shown.map(b=>'<option value="'+b.id+'"'+(b.id===jumpBook?' selected':'')+'>'
        +esc(b.short||b.id)+'  ·  '+esc(b.band||'')+'</option>').join('')
    + '</select>';

  const unitWord=book.unitWord||'UNIT';
  h+='<div class="chlist">'+book.chapters.map(c=>{
      const done=c.items.filter(i=>DATA.worksheets[i.id]).length;
      return '<button data-ch="'+c.no+'" aria-current="'+(c.no===curCh)+'">'
        +'<span class="no">CH '+c.no+'</span>'
        +'<span class="nm">'+esc(c.title)+'</span>'
        +'<span class="cnt">'+(done?done+'/':'')+c.items.length+'</span></button>'
        + (c.no===curCh
            ? '<div class="ulist">'+c.items.map(i=>{
                const has=!!DATA.worksheets[i.id];
                const on=(curU===i.id);
                return '<button data-u="'+esc(i.id)+'"'
                  +(has?' class="has'+(on?' on':'')+'"':' disabled')
                  +' aria-current="'+on+'"'
                  +' title="'+(has?'선택 · 좌측 버튼으로 시험지 발행':'시험지 미생성')+'">'
                  +'<i></i><span>'+unitWord+' '+esc(String(i.unitNo||''))+'. '+esc(i.title)+'</span></button>';
              }).join('')+'</div>'
            : '');
    }).join('')+'</div>';
  el.innerHTML=h;

  document.getElementById('jump-book').onchange=e=>{
    e.target.blur();                  /* hand the arrow keys back to the map */
    jumpBook=e.target.value;
    const n=ROOT.children.find(c=>c.payload&&c.payload.id===jumpBook);
    if(n){ expandAll=false; syncAllBtn(); activate(n); }
  };
  el.querySelectorAll('[data-ch]').forEach(btn=>btn.onclick=()=>{
    const n=findChapNode(jumpBook,+btn.dataset.ch);
    if(n){ expandAll=false; syncAllBtn(); activate(n); }
  });
  el.querySelectorAll('[data-u]').forEach(btn=>btn.onclick=()=>{
    const n=findItemNode(btn.dataset.u);
    if(n){ expandAll=false; syncAllBtn(); activate(n); }
  });
}
function findItemNode(id){
  let hit=null;
  allNodes(ROOT,n=>{ if(!hit&&n.kind==='item'&&n.payload&&n.payload.id===id) hit=n; });
  return hit;
}
function findChapNode(bookId,no){
  let hit=null;
  allNodes(ROOT,n=>{
    if(!hit&&n.kind==='chap'&&n.payload&&n.payload.bookId===bookId&&n.payload.no===no) hit=n;
  });
  return hit;
}

/* ============================================================
   10. WORKSHEET LAYOUT ENGINE — one pass → three renderers
       A4 = 595 x 842 pt. Emits absolute draw-ops.
   ============================================================ */
const A4W=595, A4H=842;
const KRF="'Noto Sans KR',sans-serif";   /* single quotes: a double quote here closes style="" */
const measCv=document.createElement('canvas'), meas=measCv.getContext('2d');
function mw(txt,font){ meas.font=font; return meas.measureText(txt).width; }

/* strip inline <u> markers for measuring; returns segments */
function segs(s){
  /* 생성기 일부가 강조를 <u> 대신 마크다운 **로 흘려서, 지면에 별표가
     그대로 찍혔다(문마중 L1 CHAPTER 4, 40행). 한 곳에서 <u>로 정규화하면
     화면·PDF·Word 세 갈래가 같이 고쳐진다. */
  s=String(s==null?'':s).replace(/\*\*([^*]+)\*\*/g,'<u>$1</u>');
  const out=[]; const re=/<u>(.*?)<\/u>/g; let last=0,m;
  while((m=re.exec(s))){
    if(m.index>last) out.push({t:s.slice(last,m.index),u:false});
    out.push({t:m[1],u:true}); last=re.lastIndex;
  }
  if(last<s.length) out.push({t:s.slice(last),u:false});
  return out.length?out:[{t:s,u:false}];
}
function wrapSegs(s,font,maxw){
  /* agents emit <br> for a forced break; treat it as one, don't print it */
  const parts=String(s==null?'':s).split(/<br\s*\/?>|\n/i);
  if(parts.length>1){
    let out=[];
    parts.forEach(v=>{ out=out.concat(wrapOne(v,font,maxw)); });
    return out.length?out:[[{t:'',u:false}]];
  }
  return wrapOne(s,font,maxw);
}
function wrapOne(s,font,maxw){
  const lines=[]; let cur=[],cw=0;
  segs(s).forEach(sg=>{
    // split keeping spaces so English wraps at words, Korean per char
    const toks=sg.t.match(/\S+\s*|\s+/g)||[];
    toks.forEach(tok=>{
      let w=mw(tok,font);
      if(cw+w>maxw && cur.length){ lines.push(cur); cur=[]; cw=0; tok=tok.replace(/^\s+/,''); w=mw(tok,font); }
      while(w>maxw && tok.length>1){
        // hard break long token
        let cut=tok.length;
        while(cut>1 && mw(tok.slice(0,cut),font)>maxw) cut--;
        cur.push({t:tok.slice(0,cut),u:sg.u}); lines.push(cur); cur=[]; cw=0;
        tok=tok.slice(cut); w=mw(tok,font);
      }
      if(tok){ cur.push({t:tok,u:sg.u}); cw+=w; }
    });
  });
  if(cur.length) lines.push(cur);
  return lines.length?lines:[[{t:'',u:false}]];
}

function Ops(){
  return {
    pages:[[]], p:0,
    add(o){ this.pages[this.p].push(o); },
    newPage(){ this.pages.push([]); this.p++; },
  };
}

/* ---- sheet chrome: masthead, logo, footer ---------------------------
   Laid out like a publisher's worksheet — brand block up top, a solid
   type band naming the sheet, ruled name fields, and a footer that
   carries the source so a loose page can always be traced back.       */
const M={l:40,r:40,t:30,b:44};
const CX0=M.l, CX1=A4W-M.r, CW=CX1-CX0;
const BODY_TOP=128, BODY_BOT=A4H-M.b-32;
/* the masthead only prints on page 1; later pages reclaim its band */
const CONT_TOP=M.t+26;
const GUT=30;
const COLW=(CW-GUT)/2;
const COLX=[CX0, CX0+COLW+GUT];
const DIVX=CX0+COLW+GUT/2;

/* ORUN house sheet palette — navy plates, a yellow accent that only ever
   marks, cream where the student writes. Matches the READING GRAPHY series. */
const NAVY='#12557d', NAVY_D='#0c4064', NAVY_L='#2a719b';
const INK='#1a2733', INK2='#55636e', INK3='#93a1ad';
const RULE='#ccd6de', TINT='#eef3f7';
const CREAM='#fdfaef', CREAM_E='#ead9a4';
const ORUN_Y='#f5c518', ORUN_B='#1795d3', ORUN_D='#333331';

/* the lighthouse mark, drawn small enough to sit in a masthead */
function logoOps(x,y,S){
  const P=(px,py)=>[x+px*S, y+py*S];
  const lwT=Math.max(.6,S*0.052);
  return [
    {t:'line',x1:P(.5,.00)[0],y1:P(.5,.00)[1],x2:P(.5,.09)[0],y2:P(.5,.09)[1],lw:lwT,color:ORUN_Y,cap:'round'},
    {t:'line',x1:P(.24,.07)[0],y1:P(.24,.07)[1],x2:P(.33,.15)[0],y2:P(.33,.15)[1],lw:lwT,color:ORUN_Y,cap:'round'},
    {t:'line',x1:P(.76,.07)[0],y1:P(.76,.07)[1],x2:P(.67,.15)[0],y2:P(.67,.15)[1],lw:lwT,color:ORUN_Y,cap:'round'},
    {t:'line',x1:P(.12,.25)[0],y1:P(.12,.25)[1],x2:P(.25,.25)[0],y2:P(.25,.25)[1],lw:lwT,color:ORUN_Y,cap:'round'},
    {t:'line',x1:P(.88,.25)[0],y1:P(.88,.25)[1],x2:P(.75,.25)[0],y2:P(.75,.25)[1],lw:lwT,color:ORUN_Y,cap:'round'},
    {t:'poly',pts:[P(.50,.13),P(.64,.28),P(.36,.28)],fill:ORUN_B,stroke:ORUN_D,lw:lwT},
    {t:'poly',pts:[P(.32,.29),P(.68,.29),P(.63,.38),P(.37,.38)],fill:ORUN_B,stroke:ORUN_D,lw:lwT},
    {t:'poly',pts:[P(.26,.39),P(.74,.39),P(.67,.48),P(.33,.48)],fill:ORUN_B,stroke:ORUN_D,lw:lwT},
    {t:'poly',pts:[P(.385,.49),P(.615,.49),P(.575,.82),P(.425,.82)],fill:ORUN_Y,stroke:ORUN_D,lw:lwT},
    {t:'rect',x:P(.468,.58)[0],y:P(.468,.58)[1],w:S*.064,h:S*.10,lw:lwT*.8,color:ORUN_D,fill:'#ffffff'},
    {t:'poly',pts:[P(.50,.80),P(.05,.71),P(.05,.93),P(.50,1.0)],fill:'#ffffff',stroke:ORUN_D,lw:lwT},
    {t:'poly',pts:[P(.50,.80),P(.95,.71),P(.95,.93),P(.50,1.0)],fill:'#ffffff',stroke:ORUN_D,lw:lwT},
  ];
}

function stripBr(s){ return String(s==null?'':s).replace(/<br\s*\/?>/ig,' '); }
function ellipsize(s,font,maxw){
  s=stripBr(s);
  if(mw(s,font)<=maxw) return s;
  let t=s;
  while(t.length>1 && mw(t+'…',font)>maxw) t=t.slice(0,-1);
  return t+'…';
}
/* 자간(ls)은 HTML 렌더러에서 글자마다 붙는다 — 폭을 잴 때 빼먹으면 그만큼
   옆 요소를 밀어 겹친다. */
function mwls(s,font,ls){ return mw(stripBr(s),font)+(ls||0)*String(s==null?'':s).length; }
/* 자리에 안 들어간다고 "…"로 잘라 버리면 학생이 들고 가는 종이에서 단원
   이름이 반 토막 난다. 폭에 맞을 때까지 글자를 줄이고, 바닥까지 줄여도
   넘칠 때만 자른다. */
function fitFont(s,weight,px,minPx,maxw,ls){
  let p=px;
  while(p>minPx && mwls(s,weight+' '+p+'px '+KRF,ls)>maxw) p-=.25;
  return weight+' '+(Math.round(p*4)/4)+'px '+KRF;
}
/* 공백 단위 그리디 줄바꿈 — 한 단어가 통째로 폭보다 길면 그 줄은 넘긴 채 둔다 */
function wrapN(s,font,maxw){
  const out=[]; let cur='';
  stripBr(s).split(/\s+/).filter(Boolean).forEach(w=>{
    const t=cur?cur+' '+w:w;
    if(!cur||mw(t,font)<=maxw) cur=t; else { out.push(cur); cur=w; }
  });
  if(cur) out.push(cur);
  return out.length?out:[''];
}
/* Split the "CHAPTER 8 관계사 · UNIT 19 관계대명사 that, what" line the
   generators write back into the parts the masthead sets separately. */
function sheetMeta(opt,chapterStr){
  /* "CHAPTER 4 to부정사 · 동명사 · 분사" 처럼 챕터 제목 자체에 가운뎃점이 든
     경우가 있다. 첫 점에서 무턱대고 자르면 'to부정사'만 챕터로 남고 나머지가
     단원명으로 떨어져 나간다 — 뒤가 UNIT/POINT 일 때만 가른다. */
  const s=String(chapterStr||'');
  const m0=s.match(/^([\s\S]*?)\s*·\s*((?:UNIT|POINT|DAY|Testing\s*Point)\b[\s\S]*)$/i);
  const chap=(m0? m0[1] : s).trim();
  let unit=(m0? m0[2] : '').trim(), no=(opt&&opt.unitNo)||null;
  if(!unit) unit=chap;   /* 초등 시트는 챕터 한 토막으로만 온다 */
  /* 초등 시트는 "CHAPTER 9 현재시제 be동사" 한 토막으로 오는데, 그대로 두면
     왼쪽 CHAPTER 09 배지 옆에 'CHAPTER 9'가 한 번 더 찍힌다. 번호는 배지가
     맡고 제목만 남긴다 — 아래 챕터 줄에는 전체 문구가 그대로 간다. */
  const m=unit.match(/^(UNIT|POINT|DAY|CHAPTER|Testing\s*Point)\s*(\d+)\s*[.·]?\s*(.*)$/i);
  if(m){ no=no||m[2]; unit=(m[3]||'').trim()||unit; }
  /* 초등 판은 모든 단위를 CHAPTER 로 부른다 — 원문이 UNIT 인 교재(바로 푸는
     문법)는 배지와 챕터 줄의 이름이 서로 달라 보였다. */
  const chap2=(UW==='CHAPTER')? chap.replace(/^UNIT(\s+\d+)/i,'CHAPTER$1') : chap;
  return {chap:chap2, no:no, unit:unit||chap2,
          book:(opt&&opt.book)||'', page:(opt&&opt.page)};
}

/* The plate every page sits inside: a light outer rule with a navy hairline
   just inside it. Cheap, and it makes a loose print look bound. */
function pageFrame(page){
  page.push({t:'rect',x:13,y:13,w:A4W-26,h:A4H-26,lw:1,color:'#b3c2ce',r:4});
  page.push({t:'rect',x:19,y:19,w:A4W-38,h:A4H-38,lw:.6,color:'rgba(18,85,125,.35)',r:2});
}

/* Page one wears the full title bar; every page after gets this running
   band so a sheet that comes apart can still be put back together. */
function runHeader(page,meta,kind){
  const y=M.t-4, h=17;
  page.push({t:'rect',x:CX0,y:y,w:CW,h:h,lw:0,fill:TINT});
  page.push({t:'rect',x:CX0,y:y,w:3,h:h,lw:0,fill:ORUN_Y});
  logoOps(CX0+9,y+3.4,11).forEach(o=>page.push(o));
  const fB='700 8px '+KRF;
  page.push({t:'text',x:CX0+23,y:y+5,s:'옳은영어',font:fB,color:NAVY});
  page.push({t:'text',x:CX0+23+mw('옳은영어',fB)+5,y:y+5.4,s:'ORUN ENGLISH',
             font:'600 7.5px '+KRF,color:INK3,ls:.9});
  const right=kind+(meta.no?'   '+meta.no:'');
  page.push({t:'text',x:CX1-9,y:y+5,s:right,font:'700 8px '+KRF,color:NAVY_L,align:'right',ls:.6});
  page.push({t:'line',x1:CX0,y1:y+h,x2:CX1,y2:y+h,lw:.9,color:NAVY});
}

function masthead(ops,kind,chapter,scored,page){
  const meta=sheetMeta(ops.__opt,chapter);
  const BAR=48, y0=M.t;

  /* the navy plate */
  ops.add({t:'rect',x:CX0,y:y0,w:CW,h:BAR,lw:0,fill:NAVY,r:3});
  ops.add({t:'rect',x:CX0,y:y0+BAR,w:CW,h:3.6,lw:0,fill:ORUN_Y});

  /* logo badge */
  const bcx=CX0+27, bcy=y0+BAR/2;
  ops.add({t:'rect',x:bcx-16,y:bcy-16,w:32,h:32,lw:0,fill:'#ffffff',r:16});
  ops.add({t:'rect',x:bcx-16,y:bcy-16,w:32,h:32,lw:1.2,color:ORUN_Y,r:16});
  logoOps(bcx-11,bcy-11,22).forEach(o=>ops.add(o));

  /* UNIT n */
  let x=CX0+50;
  const fU='700 7.5px '+KRF, fN='800 19px '+KRF;
  ops.add({t:'text',x:x,y:y0+11,s:UW,font:fU,color:'rgba(255,255,255,.66)',ls:1.6});
  const nS=meta.no?String(meta.no).padStart(2,'0'):'—';
  ops.add({t:'text',x:x,y:y0+20,s:nS,font:fN,color:'#ffffff',ls:.5});
  /* 라벨이 'CHAPTER'로 길어지면 숫자 폭만 재던 옛 계산으로는 금색 구분선이
     라벨 글자 위로 올라탄다 — 라벨과 숫자 중 넓은 쪽을 기준으로 민다. */
  x+=Math.max(26,mwls(nS,fN,.5),mwls(UW,fU,1.6))+13;
  ops.add({t:'rect',x:x,y:y0+11,w:2.4,h:BAR-22,lw:0,fill:ORUN_Y});
  x+=13;

  /* the right block is set first so the title knows how much room it has */
  const fK='800 10.5px '+KRF;
  const kindW=mwls(kind,fK,1.5);
  /* 교재 쪽수는 시험지에서 뺀다 — 학생이 들고 가는 종이에 교재 어디를 펴라는
     정보는 필요 없고, 교재를 덮고 푸는 시험지라 오히려 방해가 된다. */
  const sub=[meta.book].filter(Boolean).join('  ·  ');
  /* 교재명이 길면 오른쪽 덩어리가 제목 자리를 먹는다 — 오른쪽을 지면의 38%
     안으로 눌러 제목이 잘리는 일을 먼저 막는다. */
  const fS=fitFont(sub,'500',7.6,6.4,CW*0.38);
  ops.add({t:'text',x:CX1-14,y:y0+12.5,s:kind,font:fK,color:ORUN_Y,align:'right',ls:1.5});
  if(sub) ops.add({t:'text',x:CX1-14,y:y0+28.5,s:sub,font:fS,color:'rgba(255,255,255,.80)',align:'right'});
  const rightW=Math.max(kindW,mw(sub,fS))+28;

  const room=(CX1-rightW)-x-8;
  const T=stripBr(meta.unit);
  let fT=fitFont(T,'700',15,11.5,room), lines=[T];
  if(mw(T,fT)>room){
    /* 전치사 나열처럼 긴 단원명은 11.5px까지 줄여도 한 줄에 안 들어간다.
       "…"로 잘라 단원 이름을 반 토막 내느니 바 안에서 두 줄로 접는다. */
    let px=11.5;
    for(; px>8.5 && wrapN(T,'700 '+px+'px '+KRF,room).length>2; px-=.5);
    fT='700 '+px+'px '+KRF;
    lines=wrapN(T,fT,room);
    if(lines.length>2) lines=[lines[0], ellipsize(lines.slice(1).join(' '),fT,room)];
  }
  const tPx=parseFloat(fT.match(/([\d.]+)px/)[1]);
  if(lines.length<2){
    ops.add({t:'text',x:x,y:y0+24-tPx*.62,s:lines[0],font:fT,color:'#ffffff'});
  }else{
    const lh=tPx*1.22, t1=y0+24-lh/2-tPx*.62;
    lines.forEach((ln,i)=>ops.add({t:'text',x:x,y:t1+i*lh,s:ln,font:fT,color:'#ffffff'}));
  }

  /* the information strip under the bar: chapter left, fields right */
  const iy=y0+BAR+11;
  ops.add({t:'text',x:CX0+2,y:iy,s:meta.chap,font:'600 9.5px '+KRF,color:NAVY});
  let rx=CX1;
  const fF='600 9px '+KRF;
  if(scored){
    ops.add({t:'text',x:rx,y:iy,s:scored,font:'700 9px '+KRF,color:NAVY,align:'right'});
    rx-=mw(scored,fF)+22;
  }
  const fld=(label,w)=>{
    ops.add({t:'line',x1:rx-w,y1:iy+11,x2:rx,y2:iy+11,lw:.9,color:'#a9b6c1'});
    ops.add({t:'text',x:rx-w-6,y:iy,s:label,font:fF,color:INK2,align:'right'});
    rx-=w+mw(label,fF)+18;
  };
  fld('이름',68); fld('반',52);
}
/* page numbers are only knowable once every page exists */
function stampFooter(ops,source){
  const n=ops.pages.length, opt=ops.__opt||{}, meta=sheetMeta(opt,ops.__chapter);
  ops.pages.forEach((page,i)=>{
    pageFrame(page);
    if(i>0) runHeader(page,meta,ops.__kind||'');
    const y=A4H-M.b+4;
    page.push({t:'line',x1:CX0,y1:y-8,x2:CX1,y2:y-8,lw:1,color:NAVY});
    /* 낱장이면 1부터, 한 권으로 묶였으면 그 권의 통쪽수 */
    const pg=String((opt.volBase!=null?opt.volBase:0)+i+1);
    /* 묶음책 쪽에는 그 권의 이름이 박힌다 — 중등 ORUN METABOOK, 초등 옳은문법.
       낱장은 학원 이름만 달고 나간다. */
    const brand=(opt.volBase!=null)?TR.vol:'ORUN ENGLISH';
    const fPg='800 9.5px '+KRF, fBr='700 8px '+KRF, fS='400 7.5px '+KRF;
    page.push({t:'text',x:CX1,y:y-1,s:pg,font:fPg,color:NAVY,align:'right'});
    const bx=CX1-mw(pg,fPg)-13;
    page.push({t:'text',x:bx,y:y,s:brand,font:'600 7.5px '+KRF,color:INK3,ls:1,align:'right'});
    const bx2=bx-mw(brand,'600 7.5px '+KRF)-brand.length-5;
    page.push({t:'text',x:bx2,y:y,s:'옳은영어',font:fBr,color:INK2,align:'right'});
    logoOps(bx2-mw('옳은영어',fBr)-16,y-2,11).forEach(o=>page.push(o));
    if(source){
      const room=bx2-mw('옳은영어',fBr)-24-CX0;
      /* 출처 줄은 남긴다 — 어느 교재 어느 단원의 시험지인지는 종이에 있어야
         한다. 다만 끝의 (p.12) 같은 교재 쪽수만 턴다. */
      const src=String(source).replace(/\s*\(\s*p\.?\s*[\d\-~,\s]+\)\s*$/i,'').trim();
      page.push({t:'text',x:CX0,y:y,s:ellipsize(src,fS,room),font:fS,color:INK3});
    }
  });
}
function shiftOps(list,dx,dy){
  return list.map(o=>{
    const n=Object.assign({},o);
    if(n.t==='line'){ n.x1+=dx; n.y1+=dy; n.x2+=dx; n.y2+=dy; }
    else if(n.t==='poly'){ n.pts=n.pts.map(q=>[q[0]+dx,q[1]+dy]); }
    else { n.x+=dx; n.y+=dy; }
    return n;
  });
}

/* ---- GRAMMAR CHECK (구 Pop Quiz) -------------------------------------------------------
   Each question is laid out at origin and measured before placement, so
   it can move to the next column or page whole rather than being sliced. */
const QF={
  grp:'700 10.5px '+KRF, num:'800 12.5px '+KRF, body:'400 11.5px '+KRF,
  ch:'400 10.5px '+KRF, bank:'600 10px '+KRF, key:'600 10px '+KRF,
};
/* Grammar Check 도 Pop Quiz 처럼 밀도를 갖는다. 예전에는 간격이 고정이라
   문항 한둘이 넘치면 그것만 이고 둘째 장이 새로 열렸다 — 348장이 그렇게
   거의 빈 종이로 나갔다. 여백부터 조금씩 조여 장수를 줄인다. */
function qDensity(s){
  const f=Math.max(.88,Math.min(1,s));      /* 글자는 마지막에, 조금만 */
  return {
    s:s, f:f,
    F:{ grp :'700 '+(10.5*f).toFixed(1)+'px '+KRF,
        num :'800 '+(12.5*f).toFixed(1)+'px '+KRF,
        body:'400 '+(11.5*f).toFixed(1)+'px '+KRF,
        ch  :'400 '+(10.5*f).toFixed(1)+'px '+KRF,
        bank:'600 '+(10*f).toFixed(1)+'px '+KRF,
        key :'600 '+(10*f).toFixed(1)+'px '+KRF },
    gap : Math.max(7, 14*s),                /* 문항과 문항 사이   */
    body: Math.max(12.5, 15*f),             /* 지문 줄 높이       */
    ch  : Math.max(11.5, 14*f),             /* 선택지 줄 높이     */
    grp : Math.max(11.5, 14*f),             /* 지시문 줄 높이     */
    grpG: Math.max(4, 9*s),                 /* 지시문 아래 여백   */
    bank: Math.max(11.5, 14*f),             /* 보기 줄 높이       */
    bankG:Math.max(4, 9*s),
    pad : Math.max(3, 5*s),                 /* 지문 아래 여백     */
    ans : Math.max(14, 20*s),               /* 서술형 답 쓰는 자리 */
    boxG: Math.max(4, 8*s),
    key : Math.max(11, 13*f),
  };
}
const QD1=qDensity(1);
/* 우리말 뒤에 영어 문장이 곧바로 이어 붙으면 어디서 물음이 끝나고 읽을
   문장이 시작하는지 눈이 못 따라간다 — 영어는 줄을 바꿔 시작한다.
   '→' 는 우리말→영어 옮겨쓰기의 표지라 새 줄 앞머리에 그대로 데려간다. */
function splitKoEn(v,depth){
  let s=String(v==null?'':v).trim();
  const HAN=/[가-힣]/, D=(depth||0);
  if(!s) return [s];
  const rec=(a,b)=> D>3 ? [a,b] : splitKoEn(a,D+1).concat([b]);
  /* 원문이 <br> 로 줄을 지어 둔 자리는 그 뜻대로 줄을 바꾼다 */
  if(/<br\s*\/?>/i.test(s)){
    const ps=s.split(/<br\s*\/?>/i).map(x=>x.trim()).filter(Boolean);
    if(ps.length>1){ const out=[]; ps.forEach(x=>splitKoEn(x,D+1).forEach(y=>out.push(y))); return out; }
    s=ps[0]||s;
  }
  /* A: … B: … 대화는 말하는 사람마다 줄을 가른다 — 앞에 발문이 붙어 있어도 */
  if(/\bA\s*[:：]/.test(s)&&/\bB\s*[:：]/.test(s)){
    const ps=s.split(/\s+(?=[AB]\s*[:：])/).map(x=>x.trim()).filter(Boolean);
    if(ps.length>1) return ps;
  }
  /* 'X → Y' 짝은 화살표를 데리고 줄을 바꾼다(영어끼리도) */
  let a=s.match(/^([\s\S]{4,}?)\s+([→⇒][\s\S]*)$/);
  if(a&&!/[→⇒]/.test(a[1])) return rec(a[1].trim(), a[2].trim());
  /* 이음표는 버린다 */
  let m=s.match(/^([\s\S]{4,}?)\s*[—–]\s*([\s\S]+)$/);
  if(m&&HAN.test(m[1])&&/[A-Za-z가-힣]/.test(m[2])) return rec(m[1].trim(), m[2].trim());
  if(!HAN.test(s)) return [s];
  /* 우리말 토막이 끝나고 영어가 시작하는 첫 자리에서 가른다. 발문 안에
     'It', 'be동사' 처럼 영문이 섞여 있어도 걸리도록 앞부분은 열어 둔다. */
  m=s.match(/^([\s\S]*?[.?!。？])\s+((?:<u>)?[A-Z(][\s\S]*)$/);
  if(m&&HAN.test(m[1])&&/[A-Za-z][\s\S]*\s[\s\S]*[A-Za-z(]/.test(m[2]))
    return [m[1].trim(), m[2].trim()];
  return [s];
}
/* 답을 쓰는 밑줄이 칸보다 길면 두 줄로 꺾여 짧은 토막이 따라 내려온다.
   밑줄은 자리를 뜻하는 것이지 길이가 뜻을 갖는 게 아니므로, 남은 폭에 맞춰
   길이를 줄여 한 줄로 앉힌다. */
function fitRule(v,font,maxw){
  const s=String(v==null?'':v);
  if(mw(s,font)<=maxw||!/_{12,}/.test(s)) return s;
  const m=s.match(/^([\s\S]*?)(_{12,})([\s\S]*)$/);
  if(!m) return s;
  const uw=mw('_',font)||5;
  const room=maxw-mw(m[1]+m[3],font)-1;
  const n=Math.max(8,Math.floor(room/uw));
  return n>=m[2].length? s : m[1]+'_'.repeat(n)+m[3];
}
function qBlock(qq,W,key,D){
  D=D||QD1; const F=D.F;
  const O=[]; let y=0;
  if(qq.groupHeader){
    const lines=wrapSegs(qq.groupHeader,F.grp,W-14);
    O.push({t:'rect',x:0,y:y-1,w:W,h:lines.length*D.grp+4,lw:0,fill:TINT,r:2});
    O.push({t:'rect',x:0,y:y-1,w:3,h:lines.length*D.grp+4,lw:0,fill:NAVY});
    lines.forEach(ln=>{ O.push({t:'rt',x:10,y:y+1,line:ln,font:F.grp,color:NAVY}); y+=D.grp; });
    y+=D.grpG;
  }
  /* the question number is a navy plate with a yellow rule under it — the
     single most-scanned element on the sheet. 자리는 블록 맨 위가 아니라
     학생이 실제로 읽기 시작하는 첫 줄이다 — <보기> 상자가 앞에 오면 번호만
     상자 옆에 떠서 어느 문장의 번호인지 알 수 없었다. */
  const numS=String(qq.no).padStart(2,'0'), numW=Math.max(20,mw(numS,F.num)+11);
  const IW=W-numW;
  let cy=y;

  if(qq.bank&&qq.bank.length){
    /* 보기는 한 줄에 몰아 찍고 있었다. 'was very kind of him' 같은 긴 항목이
       섞이면 그대로 지면 밖으로 걸어 나가고, 인쇄할 때 크롬이 그 폭에 맞춰
       문서 전체를 줄여 버린다. 칸을 넘기면 줄을 바꾼다. */
    const RIGHT=numW+IW-9;
    const lx=numW+9, ix=lx+mw('보기',F.bank)+14;
    let bx=ix, by=0, rows=1;
    const put=[];
    qq.bank.forEach(v=>{
      const w=mw(v,F.ch);
      if(bx>ix && bx+w>RIGHT){ bx=ix; by+=D.bank; rows++; }
      put.push({x:bx,y:by,s:v});
      bx+=w+19;
    });
    const bh=Math.max(20*D.f,rows*D.bank+6);
    O.push({t:'rect',x:numW,y:cy,w:IW,h:bh,lw:0,fill:TINT,r:2});
    O.push({t:'rect',x:numW,y:cy,w:2.4,h:bh,lw:0,fill:ORUN_Y});
    O.push({t:'text',x:lx,y:cy+5.5*D.f,s:'보기',font:F.bank,color:NAVY});
    put.forEach(q=>O.push({t:'text',x:q.x,y:cy+5*D.f+q.y,s:q.s,font:F.ch,color:INK}));
    cy+=bh+D.bankG;
  }

  const numY=cy;                 /* 번호가 앉을 줄 — <보기> 상자 다음이다 */
  /* 지문 자리가 통째로 '<보기> …' 인 문항이 있다 — 발문은 머리글에 있으니
     이건 읽을 예문이다. 본문이 아니라 <보기> 상자로 보낸다. */
  if(!qq.example && !(qq.bullets&&qq.bullets.length)){
    const bm=String(qq.stem||'').trim().match(/^<\s*보기\s*>\s*(\S[\s\S]*)$/);
    if(bm){ qq=Object.assign({},qq,{example:bm[1].trim(),stem:''}); }
  }
  const isB=!!(qq.bullets&&qq.bullets.length);
  const src=[];
  (isB? qq.bullets : [qq.stem||'']).forEach(v=>
    splitKoEn(v).forEach((x,i)=>src.push(isB&&i===0? '• '+x : x)));
  const boxed=!!qq.boxed;
  const hasBody=src.join(' ').replace(/[\s•]/g,'')!=='';
  const tx=boxed? numW+8 : numW, tw=boxed? IW-16 : IW;
  let lines=[]; src.forEach(v=>{ lines=lines.concat(wrapSegs(fitRule(v,F.body,tw),F.body,tw)); });
  if(!hasBody){                  /* 발문이 묶음 지시문에 있는 문항 — 빈 줄을 넣지 않는다 */
  } else if(boxed){
    const bh=lines.length*D.body+12;
    O.push({t:'rect',x:numW,y:cy,w:IW,h:bh,lw:.9,color:'#9fb0bd',fill:'#ffffff',r:2});
    lines.forEach((ln,i)=>O.push({t:'rt',x:tx,y:cy+6+i*D.body,line:ln,font:F.body,color:INK}));
    cy+=bh+D.boxG;
  } else {
    lines.forEach((ln,i)=>O.push({t:'rt',x:tx,y:cy+i*D.body,line:ln,font:F.body,color:INK}));
    cy+=lines.length*D.body+D.pad;
  }

  /* 발문 뒤에 <보기> 예문이 그대로 이어 붙으면 어디까지가 물음이고 어디부터가
     읽을 문장인지 뭉개진다 — 줄을 바꿔 <보기> 상자로 따로 앉힌다. */
  if(qq.example&&String(qq.example).trim()){
    const lx=numW+9, ix=lx+mw('보기',F.bank)+14;
    const ls=wrapSegs(String(qq.example).trim(),F.ch,numW+IW-9-ix);
    const bh=Math.max(20*D.f, ls.length*D.bank+6);
    O.push({t:'rect',x:numW,y:cy,w:IW,h:bh,lw:0,fill:TINT,r:2});
    O.push({t:'rect',x:numW,y:cy,w:2.4,h:bh,lw:0,fill:ORUN_Y});
    O.push({t:'text',x:lx,y:cy+5.5*D.f,s:'보기',font:F.bank,color:NAVY});
    ls.forEach((ln,i)=>O.push({t:'rt',x:ix,y:cy+5*D.f+i*D.bank,line:ln,font:F.ch,color:INK}));
    cy+=bh+D.bankG;
  }

  if(qq.choices&&qq.choices.length){
    const marks=['①','②','③','④','⑤'];
    /* pick the widest column count the longest choice actually fits in */
    const chunked=qq.choices.map(c=>splitKoEn(c));
    const longest=Math.max.apply(null,chunked.map(cs=>Math.max.apply(null,cs.map(c=>mw(c,F.ch)))));
    let per=3;
    if(longest>IW/3-20) per=2;
    if(longest>IW/2-20) per=1;
    const cellW=IW/per;
    for(let r=0;r*per<qq.choices.length;r++){
      let tall=1;
      for(let k=0;k<per;k++){
        const i=r*per+k; if(i>=qq.choices.length) break;
        const mk=marks[i]+' ', mkw=mw(mk,F.ch), cx0=numW+cellW*k;
        O.push({t:'text',x:cx0,y:cy,s:mk,font:F.ch,color:NAVY_L});
        let ls=[]; chunked[i].forEach(c=>{ ls=ls.concat(wrapSegs(c,F.ch,cellW-mkw-8)); });
        ls.forEach((ln,j)=>O.push({t:'rt',x:cx0+mkw,y:cy+j*D.ch,line:ln,font:F.ch,color:INK}));
        tall=Math.max(tall,ls.length);
      }
      cy+=tall*D.ch+3;
    }
    cy+=3;
  }
  /* 서술형은 답을 쓸 자리가 곧 문항의 일부다 — 배열·영작처럼 한 문장을
     통째로 써야 하는 문항은 두 배로 잡는다. 해설지에는 필요 없다. */
  if(!key && !(qq.choices&&qq.choices.length)){
    const ask=String(qq.stem||'')+' '+String(qq.groupHeader||'');
    cy += /영작|배열|완성하|다시 쓰|고쳐 쓰|바꿔 쓰/.test(ask) ? D.ans*2 : D.ans;
  }

  if(key){
    const txt='정답 '+key.answer+(key.why?'   '+key.why:'');
    const ls=wrapSegs(txt,F.key,IW-14);
    O.push({t:'rect',x:numW,y:cy-1,w:2.5,h:ls.length*D.key+4,lw:0,fill:'#c0392b'});
    O.push({t:'rect',x:numW+2.5,y:cy-1,w:IW-2.5,h:ls.length*D.key+4,lw:0,fill:'#fdf3f1'});
    ls.forEach((ln,i)=>O.push({t:'rt',x:numW+8,y:cy+i*D.key,line:ln,font:F.key,color:'#b8341f'}));
    cy+=ls.length*D.key+4;
  }
  O.push({t:'text',x:0,y:numY-1,s:numS,font:F.num,color:NAVY,ls:.4});
  O.push({t:'rect',x:0,y:numY+13*D.f,w:Math.max(13,mw(numS,F.num)),h:1.8,lw:0,fill:ORUN_Y});
  if(qq.__pts) O.push({t:'text',x:0,y:numY+17*D.f,s:qq.__pts+'점',
                       font:'600 '+(7*D.f).toFixed(1)+'px '+KRF,color:INK3});
  /* 번호 배지가 마지막 줄보다 아래로 삐져나오지 않게 블록 키를 잡아 둔다 */
  return {ops:O,h:Math.max(cy, numY+(qq.__pts?25:18)*D.f)};
}
/* Grammar Check running order and marks.
   Written answers come first — a student meets the hard, productive work
   while fresh — then the choice questions. Marks are dealt out so the paper
   is out of exactly 100, with written items carrying more weight. The
   largest-remainder method absorbs the rounding so the total is never 99. */
const PQ_TOTAL=100, PQ_W_WRITE=1.35, PQ_W_PICK=1.0;
function pqPlan(q){
  const src=(q.questions||[]).map((x,i)=>({q:x,i:i}));
  /* A group instruction covers exactly the range its own [n-m] declares —
     carrying it to every later question put the wrong instruction over
     standalone items. Where no range is given, it covers only its own. */
  let cur='', lo=0, hi=-1;
  src.forEach(o=>{
    const raw=String(o.q.groupHeader||'').trim();
    if(raw){
      const m=raw.match(/[\[［]\s*(\d+)\s*(?:[-~–]\s*(\d+))?\s*[\]］]/);
      /* some chapters wrote the whole question into groupHeader, number and
         all — strip a bare leading number so it is not printed twice */
      cur=raw.replace(/^\s*[\[［][^\]］]*[\]］]\s*/,'').replace(/^\s*\d+\s*[.)]?\s+/,'');
      lo = m? +m[1] : (o.q.no!=null? o.q.no : o.i+1);
      hi = m? (m[2]? +m[2] : lo) : lo;
    }
    const own = o.q.no!=null? o.q.no : o.i+1;
    o.instr = (cur && own>=lo && own<=hi) ? cur : '';
  });
  const written=o=>!(o.q.choices&&o.q.choices.length);
  const list=src.filter(written).concat(src.filter(o=>!written(o)));
  list.forEach((o,k)=>{ o.no=k+1; o.write=written(o); });

  /* marks: weight, floor, then hand the remainder to the biggest fractions */
  const W=list.reduce((s,o)=>s+(o.write?PQ_W_WRITE:PQ_W_PICK),0)||1;
  let used=0;
  list.forEach(o=>{
    o._raw=PQ_TOTAL*(o.write?PQ_W_WRITE:PQ_W_PICK)/W;
    o.pts=Math.max(1,Math.floor(o._raw));
    used+=o.pts;
  });
  let left=PQ_TOTAL-used;
  list.slice().sort((a,b)=>(b._raw-b.pts)-(a._raw-a.pts)).forEach(o=>{
    if(left>0){ o.pts++; left--; }
  });
  while(left<0){                       /* only if flooring overshot */
    const o=list.slice().sort((a,b)=>a.pts-b.pts).find(x=>x.pts>1);
    if(!o) break; o.pts--; left++;
  }
  /* re-emit [n-m] headers for the runs that survive the reordering */
  let k=0;
  while(k<list.length){
    let j=k;
    while(j+1<list.length && list[k].instr && list[j+1].instr===list[k].instr
          && list[j+1].write===list[k].write) j++;
    const ins=list[k].instr;
    for(let m=k;m<=j;m++) list[m].head='';
    if(ins){
      if(j>k) list[k].head='['+list[k].no+'-'+list[j].no+'] '+ins;
      else if(!String(list[k].q.stem||'').trim()) list[k].stemAs=ins;   /* it IS the question */
      else list[k].head=ins;                                            /* one-off instruction */
    }
    k=j+1;
  }
  return list;
}
function layoutPopQuizAt(q,opt,D,balance){
  const ops=Ops(), showKey=!!(opt&&opt.key);
  ops.__opt=opt; ops.__chapter=q.chapter; ops.__kind=TR.check;
  const keyOf=n=>showKey?(q.answerKey||[]).find(a=>a.no===n):null;
  const plan=pqPlan(q);
  /* the column rule runs on every page, the masthead only on the first */
  const rule=top=>ops.add({t:'line',x1:DIVX,y1:top-6,x2:DIVX,y2:BODY_BOT+8,lw:.7,color:'#c9d1da'});
  masthead(ops,TR.check,q.chapter,'점수        / '+PQ_TOTAL,opt&&opt.page);
  let top=BODY_TOP;
  rule(top);
  /* 블록은 자리와 무관하게 높이가 정해지므로 미리 다 재 둔다 */
  let prevSig='';
  const blocks=plan.map(o=>{
    /* 불릿 두 줄짜리 문항은 발문이 stem 에 들어 있는데 qBlock 은 불릿만 그린다.
       그러면 '다음 빈칸에 공통으로 들어갈 말은?' 이 통째로 사라져, 앞 묶음
       지시문에 딸린 문항처럼 보인다 — 제 발문을 제 머리글로 세운다. */
    const ownAsk=(!o.head && !o.stemAs && o.q.bullets && o.q.bullets.length
                  && String(o.q.stem||'').trim()) ? String(o.q.stem).trim() : '';
    /* 같은 지시문·같은 <보기>가 문항마다 되풀이되면 지면만 먹는다 — 묶음의
       첫 문항에만 남긴다. 데이터가 문항마다 보기를 달아 둔 챕터가 있다. */
    const sig=(o.instr||'')+'|'+((o.q.bank||[]).join('\u0001'));
    const dupBank=!!(o.q.bank&&o.q.bank.length)&&sig===prevSig;
    prevSig=sig;
    const qq=Object.assign({},o.q,{no:o.no,groupHeader:o.head||ownAsk,__pts:o.pts},
                           dupBank?{bank:[]}:{}, o.stemAs?{stem:o.stemAs}:{});
    return qBlock(qq,COLW,keyOf(o.q.no),D);
  });
  /* 칸을 끝까지 채우고 넘기면 마지막 칸에 한둘만 남는다. 몇 칸이 필요한지
     먼저 계산해 그 칸 수로 고르게 나눈다 — 종이는 그대로인데 밀도가 고른다. */
  const totalH=blocks.reduce((a,b)=>a+b.h+D.gap,0)-D.gap;
  const colH=BODY_BOT-BODY_TOP, colH2=BODY_BOT-CONT_TOP;
  let need=1, acc=0;
  blocks.forEach(b=>{ const lim=need<=2?colH:colH2;
    if(acc+b.h>lim && acc>0){ need++; acc=0; } acc+=b.h+D.gap; });
  const target=balance? Math.max(120, totalH/need*1.02) : 1e9;
  let col=0, y=top, used=0;
  blocks.forEach((blk,i)=>{
    const last = i===blocks.length-1;
    const hard = y+blk.h>BODY_BOT;
    const even = !last && used>0 && used+blk.h>target;
    if((hard||even) && y>top){
      col++;
      if(col>1){ ops.newPage(); top=CONT_TOP; rule(top); col=0; }
      y=top; used=0;
    }
    shiftOps(blk.ops,COLX[col],y).forEach(o=>ops.add(o));
    y+=blk.h+D.gap; used+=blk.h+D.gap;
  });
  stampFooter(ops,opt&&opt.source);
  return ops;
}
/* 넘치는 문항 한둘 때문에 거의 빈 둘째 장이 열리는 일이 없도록, 장수를
   줄일 수 있으면 여백을 조인다. 다만 무조건 조이지는 않는다 — 같은 장수를
   내는 가장 느슨한 밀도를 골라, 붙일 이유가 없으면 그대로 둔다. */
const PQ_SQUEEZE=[1,.95,.90,.85,.80,.76,.72];
const PQ_FIT={};
function layoutPopQuiz(q,opt){
  const showKey=!!(opt&&opt.key);
  const ck=((opt&&opt.source)||q.chapter||'')+'|'+showKey;
  const hit=PQ_FIT[ck];
  if(hit) return layoutPopQuizAt(q,opt,qDensity(hit.s),hit.b);
  let bestN=1e9; const made={};
  PQ_SQUEEZE.forEach(sq=>{
    const ops=layoutPopQuizAt(q,opt,qDensity(sq),false);
    made[sq]=ops;
    if(ops.pages.length<bestN) bestN=ops.pages.length;
  });
  /* 최소 장수를 내는 것들 중 가장 느슨한 밀도 */
  let pick=PQ_SQUEEZE[PQ_SQUEEZE.length-1];
  for(let i=0;i<PQ_SQUEEZE.length;i++){
    if(made[PQ_SQUEEZE[i]].pages.length===bestN){ pick=PQ_SQUEEZE[i]; break; }
  }
  /* 장수가 정해진 다음에야 고르게 나눈다. 나누다가 장수가 늘면 그건
     고른 게 아니라 낭비다 — 그때는 원래대로 채운다. */
  let ops=made[pick], bal=false;
  if(ops.pages.length>1){
    const even=layoutPopQuizAt(q,opt,qDensity(pick),true);
    if(even.pages.length<=ops.pages.length){ ops=even; bal=true; }
  }
  PQ_FIT[ck]={s:pick,b:bal};
  return ops;
}
/* ---- POP QUIZ (구 Meta Check · 구 백지테스트) ------------------------------------------------------ */
/* Three steps, not six. The generators still write the full six-section
   recall set; the sheet publishes the three that carry the load, picked by
   `kind` rather than position — a third of the chapters number them
   differently, so counting sections would grab the wrong ones. */
const BJ_STEPS=[
  {kind:'skeleton-fill',    en:'BUILD RIGHT', kr:'개념 세우기'},
  {kind:'compare-contrast', en:'SPOT RIGHT',  kr:'혼동 포인트 구별'},
  {kind:'error-explain',    en:'FIX RIGHT',   kr:'오류 수정'},
];
/* 초등 POP QUIZ 는 개념 회상(STEP 1)만 싣는다 — 트랙이 steps 로 고른다.
   중등 REVIEW TEST 는 세 단계 전부. TR 이 아래에서 선언되므로 지연 계산. */
function bjActive(){
  /* 트랙이 제 단계 이름표를 갖고 오면 그대로 쓴다 — 보카는 WORD RIGHT,
     독해는 READ RIGHT 로 같은 3단 회상 틀을 제 언어로 부른다. */
  if(typeof TR!=='undefined'&&TR.bj&&TR.bj.length)
    return TR.bj.map(st=>({kind:st.kind,en:st.en,kr:st.kr}));
  return (typeof TR!=='undefined'&&TR.steps&&TR.steps.length)
    ? BJ_STEPS.filter(st=>TR.steps.indexOf(st.kind)>=0)
    : BJ_STEPS;
}
function bjSections(b){
  const src=(b.sections||[]).filter(Boolean);
  const used=new Set(), out=[];
  bjActive().forEach((step,i)=>{
    let s=src.find(x=>x.kind===step.kind&&!used.has(x));
    /* nothing of that kind in this chapter — fall back to the last unclaimed
       section rather than publishing a sheet with a step missing */
    if(!s) for(let j=src.length-1;j>=0;j--) if(!used.has(src[j])){ s=src[j]; break; }
    if(!s) return;
    used.add(s);
    out.push(Object.assign({},s,{no:i+1,en:step.en,kr:step.kr}));
  });
  return out;
}
/* Density-driven: the sheet must land in two pages, so the layout is a
   function of a squeeze factor and we try progressively tighter ones until
   it fits. Writing space goes first, then leading, then type size — the
   student still needs a legible prompt, but four ruled lines are a luxury. */
function bjFonts(D){
  return {
    sec:'700 '+(12*D.f).toFixed(1)+'px '+KRF,
    krsec:'500 '+(10*D.f).toFixed(1)+'px '+KRF,
    ins:'400 '+(10*D.f).toFixed(1)+'px '+KRF,
    q:'400 '+(11.5*D.f).toFixed(1)+'px '+KRF,
    a:'600 '+(10*D.f).toFixed(1)+'px '+KRF,
    why:'400 '+(9*D.f).toFixed(1)+'px '+KRF,
    bank:'600 '+(10.2*D.f).toFixed(1)+'px '+KRF,
    bankL:'700 '+(9*D.f).toFixed(1)+'px '+KRF,
  };
}
function bjDensity(s){
  const f=Math.max(.84,Math.min(1,s));          /* type shrinks last, and little */
  return {
    s:s, f:f, F:null,
    qLH:  Math.max(13, 16*f),                   /* prompt line height   */
    rule: Math.max(12, 19*s),                   /* ruled-line pitch     */
    maxL: s>=.94?4 : s>=.84?3 : s>=.72?2 : 1,   /* ruled lines per row  */
    gapQ: Math.max(2, 5*s),                     /* prompt → first rule  */
    gapR: Math.max(3, 9*s),                     /* row bottom padding   */
    insLH:Math.max(11, 14*f),
    secH: Math.max(18, 22*f),
    secG: Math.max(5, 12*s),
    band: Math.max(18, 24*f),
    bandG:Math.max(24, 38*s),
    keyLH:Math.max(11, 13*f),
    whyLH:Math.max(10, 11.6*f),
  };
}
function rowBlock(row,idx,W,showKey,D,cap){
  const BF=D.F, O=[]; let y=0;
  const nl=wrapSegs((idx+1)+'.  '+row.prompt,BF.q,W-16);
  nl.forEach((ln,i)=>O.push({t:'rt',x:8,y:y+i*D.qLH,line:ln,font:BF.q,color:INK}));
  O.push({t:'text',x:2,y:y,s:'',font:BF.q,color:NAVY});
  y+=nl.length*D.qLH+D.gapQ;
  const n=Math.max(1,Math.min(cap==null?D.maxL:cap,row.lines||1));
  /* open space, no rule. The room is reserved by advancing y; a line across
     it only competed with the student's own handwriting. */
  y+=n*D.rule;
  if(showKey && row.answer){
    /* 정답만으로는 혼자 채점할 수 없다 — 근거가 되는 규칙을 같이 준다 */
    const al=wrapSegs('정답  '+row.answer,BF.a,W-26);
    const wl=row.why? wrapSegs(String(row.why),BF.why,W-26) : [];
    const bh=al.length*D.keyLH+wl.length*D.whyLH+(wl.length?3:0)+4;
    O.push({t:'rect',x:16,y:y-2,w:2.5,h:bh,lw:0,fill:'#c0392b'});
    O.push({t:'rect',x:18.5,y:y-2,w:W-24.5,h:bh,lw:0,fill:'#fdf3f1'});
    al.forEach((ln,i)=>O.push({t:'rt',x:24,y:y+i*D.keyLH,line:ln,font:BF.a,color:'#b8341f'}));
    let wy=y+al.length*D.keyLH+(wl.length?3:0);
    wl.forEach((ln,i)=>O.push({t:'rt',x:24,y:wy+i*D.whyLH,line:ln,font:BF.why,color:'#8a5b52'}));
    y+=bh;
  }
  return {ops:O,h:y+D.gapR};
}
function layoutBaekjiAt(b,opt,D){
  D.F=bjFonts(D);
  const BF=D.F;
  const ops=Ops(), showKey=!!(opt&&opt.key);
  ops.__opt=opt; ops.__chapter=b.chapter; ops.__kind=TR.recall;
  masthead(ops,TR.recall,b.chapter,'',opt&&opt.page);
  let y=BODY_TOP;
  const nextPage=()=>{ ops.newPage(); y=CONT_TOP; };

  ops.add({t:'rect',x:CX0,y:y,w:CW,h:D.band,lw:0,fill:TINT,r:2});
  ops.add({t:'rect',x:CX0,y:y,w:3,h:D.band,lw:0,fill:NAVY});
  ops.add({t:'text',x:CX0+13,y:y+D.band*.29,s:(TR.hint||'지난 수업에서 배웠던 내용을 떠올리며 빈칸을 채워보세요.'),font:BF.ins,color:NAVY});
  y+=D.bandG;

  bjSections(b).forEach((sec,si)=>{
    /* the opening step is usually the long one; later steps get whatever
       ruled space the fit left over */
    const cap=si===0? D.maxL : Math.max(D.maxL,D.tailL||D.maxL);
    /* 지시문 끝에 붙은 '<보기> give lend …' 는 안내문이 아니라 학생이 골라 쓸
       낱말 목록이다. 같은 크기 회색 글씨로 흘려 두면 묻혀 버려서, 문제지의
       보기 상자와 같은 모양으로 따로 앉힌다. */
    const insRaw=String(sec.instruction||'');
    const bi=insRaw.indexOf('<보기>');
    const insTxt=(bi<0?insRaw:insRaw.slice(0,bi)).trim();
    const bank=(bi<0?'':insRaw.slice(bi+4)).replace(/\s+/g,'  ').trim();
    const insL=insTxt? wrapSegs(insTxt,BF.ins,CW-14):[];
    const bankL=bank? wrapSegs(bank,BF.bank,CW-mw('보기',BF.bankL)-40):[];
    const bankH=bankL.length? bankL.length*D.insLH+11 : 0;
    const headH=Math.max(30,D.secH*1.62)+6+insL.length*D.insLH+bankH+7;
    const first=(sec.rows&&sec.rows[0])? rowBlock(sec.rows[0],0,CW,showKey,D,cap).h : 0;
    if(y+headH+first>BODY_BOT) nextPage();

    /* a plate with its own number panel, the way the reading series marks
       its steps — the numeral is the thing a student navigates by */
    const bh=Math.max(30,D.secH*1.62), PW0=34;
    ops.add({t:'rect',x:CX0,y:y,w:CW,h:bh,lw:0,fill:NAVY,r:2.5});
    ops.add({t:'rect',x:CX0,y:y,w:4.5,h:bh,lw:0,fill:ORUN_Y});
    ops.add({t:'rect',x:CX0+4.5,y:y,w:PW0,h:bh,lw:0,fill:NAVY_D});
    const pcx=CX0+4.5+PW0/2;
    ops.add({t:'text',x:pcx,y:y+bh*.15,s:'STEP',font:'700 5.4px '+KRF,
             color:'rgba(255,255,255,.55)',align:'center',ls:.8});
    ops.add({t:'text',x:pcx,y:y+bh*.34,s:String(sec.no),
             font:'800 '+(bh*.44).toFixed(1)+'px '+KRF,color:'#ffffff',align:'center'});
    const tx0=CX0+4.5+PW0+13;
    ops.add({t:'text',x:tx0,y:y+bh*.17,s:sec.en,font:BF.sec,color:'#ffffff',ls:1.6});
    ops.add({t:'text',x:tx0,y:y+bh*.60,s:sec.kr,font:BF.krsec,color:'rgba(255,255,255,.72)'});
    y+=bh+6;
    insL.forEach(ln=>{ ops.add({t:'rt',x:CX0+4,y:y,line:ln,font:BF.ins,color:INK2}); y+=D.insLH; });
    if(bankL.length){
      const bh2=bankL.length*D.insLH+9;
      ops.add({t:'rect',x:CX0,y:y,w:CW,h:bh2,lw:0,fill:TINT,r:2});
      ops.add({t:'rect',x:CX0,y:y,w:2.6,h:bh2,lw:0,fill:ORUN_Y});
      ops.add({t:'text',x:CX0+10,y:y+4.5,s:'보기',font:BF.bankL,color:NAVY});
      const bx0=CX0+10+mw('보기',BF.bankL)+14;
      bankL.forEach((ln,i)=>ops.add({t:'rt',x:bx0,y:y+4+i*D.insLH,line:ln,font:BF.bank,color:INK}));
      y+=bh2+2;
    }
    y+=7;

    (sec.rows||[]).forEach((row,i)=>{
      const blk=rowBlock(row,i,CW,showKey,D,cap);
      if(y+blk.h>BODY_BOT) nextPage();
      shiftOps(blk.ops,CX0,y).forEach(o=>ops.add(o));
      y+=blk.h;
    });
    y+=D.secG;
  });
  stampFooter(ops,opt&&opt.source);
  return ops;
}
/* Two pages, always — and no more squeezed than it has to be.
   Pass 1 finds the loosest density that fits. Pass 2 spends whatever room is
   left on the last page back on ruled writing lines, which is the thing a
   recall sheet actually needs. Search results are cached per sheet: the
   preview relays out on every resize and this is text measurement. */
const BJ_SQUEEZE=[1,.94,.88,.82,.76,.70,.64,.58,.52,.47,.42,.38];
const BJ_FIT={};
/* 3단계짜리 회상지는 두 장이 기본이지만, 초등처럼 STEP 하나만 실리는 판에서
   두 장을 목표로 잡으면 둘째 장이 머리글·꼬릿말만 인쇄된 백지로 나온다.
   실린 단계 수에 맞춰 목표 장수를 정한다. */
function bjPages(){
  return (typeof TR!=='undefined'&&TR.steps&&TR.steps.length<=1)?1:2;
}
function layoutBaekji(b,opt){
  const showKey=!!(opt&&opt.key);
  /* key on the unit's own source line: two books can carry the same chapter
     and point title, and sharing one fit between them hands the tighter
     sheet the looser sheet's density */
  const ck=((opt&&opt.source)||b.chapter||'')+'|'+showKey;
  const hit=BJ_FIT[ck];
  if(hit){ const D=bjDensity(hit.s); D.maxL=hit.maxL; D.tailL=hit.tailL; D.rule=hit.rule; return layoutBaekjiAt(b,opt,D); }
  /* 목표 장수 안에 안 들어가면 한 장 늘려 다시 찾는다. 최소 밀도로 눌러 담아
     한 줄만 다음 장에 흘리느니, 두 장에 여유 있게 나눠 앉히는 게 낫다.
     — 초등 해설(정답 상자가 붙어 키가 커진다) 두 시트가 여기 걸렸다. */
  return bjFit(b,opt,ck,bjPages()) || bjFit(b,opt,ck,bjPages()+1) || bjFloor(b,opt,ck);
}
function bjFloor(b,opt,ck){          /* nothing fits — hand back the tightest */
  const s=BJ_SQUEEZE[BJ_SQUEEZE.length-1], D=bjDensity(s);
  BJ_FIT[ck]={s:s,maxL:D.maxL,rule:D.rule};
  return layoutBaekjiAt(b,opt,D);
}
function bjFit(b,opt,ck,PG){
  let bi=-1, base=null;
  for(let i=0;i<BJ_SQUEEZE.length;i++){
    const ops=layoutBaekjiAt(b,opt,bjDensity(BJ_SQUEEZE[i]));
    if(ops.pages.length<=PG){ bi=i; base=ops; break; }
  }
  if(bi<0) return null;
  const s=BJ_SQUEEZE[bi], D0=bjDensity(s);
  const attempt=(L,T,pitch)=>{
    const D=bjDensity(s); D.maxL=L; D.tailL=T; D.rule=Math.max(D0.rule,pitch);
    const ops=layoutBaekjiAt(b,opt,D);
    return ops.pages.length<=PG ? {ops:ops,D:D} : null;
  };
  /* every step lifted together first, then only the later steps */
  for(let L=4;L>=D0.maxL;L--){
    for(let k=0;k<4;k++){
      const pitch=[19,17,15,13][k];
      if(L===D0.maxL && pitch<=D0.rule) continue;
      const r=attempt(L,L,pitch);
      if(r){ BJ_FIT[ck]={s:s,maxL:r.D.maxL,tailL:r.D.tailL,rule:r.D.rule}; return r.ops; }
    }
  }
  for(let T=4;T>D0.maxL;T--){
    const r=attempt(D0.maxL,T,D0.rule);
    if(r){ BJ_FIT[ck]={s:s,maxL:r.D.maxL,tailL:r.D.tailL,rule:r.D.rule}; return r.ops; }
  }
  BJ_FIT[ck]={s:s,maxL:D0.maxL,tailL:D0.maxL,rule:D0.rule};
  return base;
}

/* ============================================================
   10b. ORUN GRAMMAR — 교재 한 권을 한 권의 문제집으로
   ============================================================
   낱장 시험지는 수업 당일용이고, 이건 학기용이다. 한 유닛의
   POP QUIZ + GRAMMAR CHECK 가 한 세트로 붙어 있고 세트가 유닛 순서대로
   이어진다. 정답과 해설은 학생이 미리 넘겨보지 못하도록 전부 맨 뒤에
   모아 둔다.  표지 → 목차 → 본문 → 정답과 해설.                  */
/* 트랙 이름표 TR·UW·MB_NAME 은 은하 상태다 — 문법/독해/보카가 여기서 갈라진다.
   recall: 회상 시험지 · check: 문제 시험지 · vol: 묶음책 이름.
   buildGalaxyState 가 meta.track 에서 만들고 bindGalaxy 가 풀어 넣는다. */
/* 좌측 패널의 ORUN GRAMMAR 발행 카드 노출 여부. false 면 카드만 사라지고
   조판·Word·인쇄 경로는 전부 그대로 남는다 — openVolume('n1') 은 여전히 돈다. */
const MB_UI=false;

function mbUnits(book){
  const out=[];
  (book.chapters||[]).forEach(c=>{
    (c.items||[]).forEach(it=>{
      const ws=DATA.worksheets[it.id];
      if(ws) out.push({it:it,ws:ws,chap:c});
    });
  });
  return out;
}

/* 본문 시험지는 stampFooter 가 쪽수를 찍지만 표지·목차·해설은 제 손으로 찍는다 */
function mbFoot(page,num,left){
  pageFrame(page);
  const y=A4H-M.b+4;
  page.push({t:'line',x1:CX0,y1:y-8,x2:CX1,y2:y-8,lw:1,color:NAVY});
  const pg=String(num), fPg='800 9.5px '+KRF, fBr='700 8px '+KRF, fS='400 7.5px '+KRF;
  page.push({t:'text',x:CX1,y:y-1,s:pg,font:fPg,color:NAVY,align:'right'});
  const bx=CX1-mw(pg,fPg)-13;
  /* ls 는 mw() 가 모르는 폭이다 — 빼 주지 않으면 브랜드가 겹쳐 찍힌다 */
  const bw=mw(MB_NAME,'600 7.5px '+KRF)+MB_NAME.length;
  page.push({t:'text',x:bx,y:y,s:MB_NAME,font:'600 7.5px '+KRF,color:INK3,ls:1,align:'right'});
  const bx2=bx-bw-5;
  page.push({t:'text',x:bx2,y:y,s:'옳은영어',font:fBr,color:INK2,align:'right'});
  logoOps(bx2-mw('옳은영어',fBr)-16,y-2,11).forEach(o=>page.push(o));
  if(left){
    const room=bx2-mw('옳은영어',fBr)-24-CX0;
    page.push({t:'text',x:CX0,y:y,s:ellipsize(left,fS,room),font:fS,color:INK3});
  }
}

/* ---- 표지 -----------------------------------------------------------
   레퍼런스와 같은 문법: 짙은 색면 하나, 노란 규칙선 하나, 큰 활자 하나.
   교재 실물 표지를 얹어 어느 책의 문제집인지 표지에서 끝낸다.        */
function mbCover(book,st,im){
  const P=[];
  const BG='#0a3050', BG2='#0d4067', GOLD=ORUN_Y;
  P.push({t:'rect',x:0,y:0,w:A4W,h:A4H,lw:0,fill:BG});
  /* 아래쪽 색면을 한 겹 올려 평평한 남색이 두 개의 면으로 읽히게 한다 */
  P.push({t:'poly',pts:[[0,398],[A4W,336],[A4W,A4H],[0,A4H]],fill:BG2});
  P.push({t:'poly',pts:[[0,398],[A4W,336],[A4W,341],[0,403]],fill:'rgba(245,197,24,.55)'});

  /* 브랜드 블록 */
  P.push({t:'rect',x:M.l,y:52,w:34,h:34,lw:0,fill:'#ffffff',r:17});
  P.push({t:'rect',x:M.l,y:52,w:34,h:34,lw:1.3,color:GOLD,r:17});
  logoOps(M.l+6,58,22).forEach(o=>P.push(o));
  P.push({t:'text',x:M.l+45,y:57,s:'옳은영어',font:'700 12px '+KRF,color:'#ffffff'});
  P.push({t:'text',x:M.l+45,y:74,s:'ORUN ENGLISH',font:'600 8px '+KRF,color:'rgba(255,255,255,.60)',ls:2.4});
  /* 오른쪽 위는 시리즈 이름 한 줄. 왼쪽이 이미 '옳은영어 / ORUN ENGLISH' 를
     달고 있어 여기에 같은 말을 또 넣으면 한 장에 브랜드가 두 번 찍힌다. */
  P.push({t:'text',x:CX1,y:68,s:TR.vol,font:'700 8px '+KRF,color:GOLD,align:'right',ls:2.6});

  /* 제호 */
  let y=150;
  P.push({t:'text',x:M.l,y:y,s:TR.volTitle[0],font:'800 52px '+KRF,color:'#ffffff',ls:3.5});
  y+=58;
  P.push({t:'text',x:M.l,y:y,s:TR.volTitle[1],font:'800 52px '+KRF,color:GOLD,ls:3.5});
  y+=68;
  P.push({t:'rect',x:M.l,y:y,w:104,h:5,lw:0,fill:GOLD});
  y+=20;
  P.push({t:'text',x:M.l,y:y,s:TR.recall+'  ·  '+TR.check+'  ·  정답과 해설',
          font:'600 10px '+KRF,color:'rgba(255,255,255,.72)',ls:1.2});

  /* 어느 교재의 문제집인가 */
  y=452;
  P.push({t:'rect',x:M.l,y:y,w:3.5,h:60,lw:0,fill:GOLD});
  const fBk='700 21px '+KRF;
  P.push({t:'text',x:M.l+15,y:y+1,s:ellipsize(book.short||book.title,fBk,300),font:fBk,color:'#ffffff'});
  P.push({t:'text',x:M.l+15,y:y+30,s:ellipsize(book.title,'400 10.5px '+KRF,300),
          font:'400 10.5px '+KRF,color:'rgba(255,255,255,.66)'});
  P.push({t:'text',x:M.l+15,y:y+46,s:[book.publisher,book.gradeTag].filter(Boolean).join('  ·  '),
          font:'600 9px '+KRF,color:GOLD});

  /* 적용반 칩 */
  if(book.band){
    /* 'BC B' 같은 반 코드는 홀로 두면 무슨 말인지 알 수 없다 */
    const fL='600 8px '+KRF, fC='700 9px '+KRF;
    const cw=mw('적용반',fL)+mw(book.band,fC)+30;
    P.push({t:'rect',x:M.l,y:534,w:cw,h:21,lw:1,color:'rgba(245,197,24,.5)',r:10.5});
    P.push({t:'text',x:M.l+11,y:540,s:'적용반',font:fL,color:'rgba(255,255,255,.60)'});
    P.push({t:'text',x:M.l+11+mw('적용반',fL)+8,y:539,s:book.band,font:fC,color:GOLD});
  }

  /* 구성 */
  y=590;
  P.push({t:'text',x:M.l,y:y,s:'구성',font:'700 8.5px '+KRF,color:'rgba(255,255,255,.48)',ls:.8});
  y+=15;
  /* 초등은 챕터가 곧 시험지 단위라 CHAPTER 줄이 겹친다 — 한 줄만 남긴다 */
  const spec=[];
  if(UW!=='CHAPTER') spec.push(['CHAPTER', st.chapters+'개']);
  spec.push([UW, st.units+'개']);
  spec.push(...[

    ['시험지',  (st.units*2)+'장 ('+(TR.per||'유닛')+'당 '+TR.recall+' + '+TR.check+')'],
    ['정답과 해설', '권말 일괄'],
  ]);
  spec.forEach(r=>{
    P.push({t:'text',x:M.l,y:y,s:r[0],font:'600 9px '+KRF,color:'rgba(255,255,255,.52)'});
    P.push({t:'text',x:M.l+74,y:y,s:r[1],font:'600 9.5px '+KRF,color:'#ffffff'});
    y+=17;
  });

  /* 실물 표지 — 오른쪽 아래, 종이 한 장이 얹힌 것처럼 */
  if(im&&im.naturalWidth){
    const bw=176, bh=Math.round(bw*im.naturalHeight/im.naturalWidth);
    const bx=CX1-bw-4, by=Math.min(A4H-M.b-34-bh, 468);
    P.push({t:'rect',x:bx+7,y:by+8,w:bw,h:bh,lw:0,fill:'rgba(0,0,0,.34)',r:2});
    P.push({t:'img',x:bx,y:by,w:bw,h:bh,src:book.cover.img,im:im});
    P.push({t:'rect',x:bx,y:by,w:bw,h:bh,lw:1.2,color:'rgba(255,255,255,.42)'});
  }

  /* 밑단 */
  P.push({t:'rect',x:0,y:A4H-30,w:A4W,h:30,lw:0,fill:'#07243d'});
  P.push({t:'rect',x:0,y:A4H-30,w:A4W,h:2.4,lw:0,fill:GOLD});
  P.push({t:'text',x:M.l,y:A4H-20,s:'옳은영어  ORUN ENGLISH',font:'700 9.5px '+KRF,color:'#ffffff',ls:1});
  P.push({t:'text',x:CX1,y:A4H-19.5,s:MB_NAME,font:'700 8.5px '+KRF,color:ORUN_Y,align:'right',ls:1.8});
  return P;
}

/* ---- 목차 ----------------------------------------------------------- */
const MB_TOC={ chH:34, uH:16.5, top:120, pad:9 };
function mbToc(book,units,startAt,pageOf,ansAt){
  const pages=[[]]; let pi=0, y=MB_TOC.top;
  const P=()=>pages[pi];
  const brk=need=>{
    if(y+need<=BODY_BOT) return;
    pages.push([]); pi++; y=CONT_TOP+18;
    P().push({t:'text',x:CX0,y:CONT_TOP-2,s:'CONTENTS',font:'700 8px '+KRF,color:NAVY_L,ls:2.2});
    P().push({t:'line',x1:CX0,y1:CONT_TOP+12,x2:CX1,y2:CONT_TOP+12,lw:.8,color:NAVY});
  };

  /* 첫 장에만 제목판 */
  P().push({t:'rect',x:CX0,y:M.t,w:CW,h:40,lw:0,fill:NAVY,r:3});
  P().push({t:'rect',x:CX0,y:M.t+40,w:CW,h:3.4,lw:0,fill:ORUN_Y});
  P().push({t:'text',x:CX0+18,y:M.t+9,s:'CONTENTS',font:'800 15px '+KRF,color:'#ffffff',ls:3});
  P().push({t:'text',x:CX0+18,y:M.t+27,s:'차례',font:'500 8.5px '+KRF,color:'rgba(255,255,255,.62)',ls:1.4});
  P().push({t:'text',x:CX1-16,y:M.t+16,s:ellipsize(book.short||book.title,'700 11px '+KRF,240),
            font:'700 11px '+KRF,color:ORUN_Y,align:'right'});

  let lastCh=null;
  units.forEach(u=>{
    if(u.chap!==lastCh){
      brk(MB_TOC.chH+MB_TOC.uH);
      lastCh=u.chap;
      y+=6;
      P().push({t:'rect',x:CX0,y:y,w:CW,h:19,lw:0,fill:TINT,r:2});
      P().push({t:'rect',x:CX0,y:y,w:3,h:19,lw:0,fill:NAVY});
      P().push({t:'text',x:CX0+11,y:y+5,s:'CHAPTER '+u.chap.no,font:'800 9px '+KRF,color:NAVY,ls:.6});
      P().push({t:'text',x:CX0+78,y:y+5,s:ellipsize(u.chap.title,'600 9.5px '+KRF,CW-160),
                font:'600 9.5px '+KRF,color:INK});
      y+=19+MB_TOC.pad;
    }
    brk(MB_TOC.uH);
    const fU='500 9.5px '+KRF, fN='700 9px '+KRF, fP='700 9px '+KRF;
    const no=UW+' '+String(u.it.unitNo||'').padStart(2,'0');
    const pg=pageOf? String(pageOf(u)) : '000';
    P().push({t:'text',x:CX0+14,y:y,s:no,font:fN,color:NAVY_L});
    const tx=CX0+14+58;
    const room=CX1-tx-mw(pg,fP)-16;
    P().push({t:'text',x:tx,y:y,s:ellipsize(u.it.title,fU,room),font:fU,color:INK});
    /* 점선 안내선 — 눈이 제목에서 쪽수로 건너가는 다리 */
    const tw=mw(ellipsize(u.it.title,fU,room),fU);
    let dx=tx+tw+6; const dEnd=CX1-mw(pg,fP)-7;
    while(dx<dEnd){ P().push({t:'rect',x:dx,y:y+7.5,w:1.4,h:1.4,lw:0,fill:'#b8c4cf'}); dx+=4.6; }
    P().push({t:'text',x:CX1,y:y,s:pg,font:fP,color:NAVY,align:'right'});
    y+=MB_TOC.uH;
  });

  /* 해설이 어디서 시작하는지 차례에 없어서, 채점하려면 뒤를 뒤져야 했다 */
  brk(30);
  y+=8;
  P().push({t:'rect',x:CX0,y:y,w:CW,h:20,lw:0,fill:NAVY,r:2});
  P().push({t:'rect',x:CX0,y:y,w:3,h:20,lw:0,fill:ORUN_Y});
  P().push({t:'text',x:CX0+11,y:y+5.5,s:'ANSWERS & EXPLANATIONS',font:'800 8.5px '+KRF,color:'#ffffff',ls:1.2});
  P().push({t:'text',x:CX0+11+mw('ANSWERS & EXPLANATIONS','800 8.5px '+KRF)+26,y:y+5.6,
            s:'정답과 해설',font:'500 9px '+KRF,color:'rgba(255,255,255,.78)'});
  if(ansAt) P().push({t:'text',x:CX1-10,y:y+5.5,s:String(ansAt),font:'800 9.5px '+KRF,
                      color:ORUN_Y,align:'right'});
  pages.forEach((p,i)=>mbFoot(p,startAt+i,i===0?(book.short||book.title):''));
  return pages;
}

/* ---- 정답과 해설 -----------------------------------------------------
   유닛 하나가 한 칸을 넘기 때문에 유닛 단위가 아니라 행 단위로 흘린다.
   머리글만 남고 내용이 다음 칸으로 넘어가는 일이 없도록 머리글은
   바로 뒤 행까지 자리를 확인한 뒤에 놓는다.                          */
const MBA={
  unit:'800 10px '+KRF, unitS:'500 8.5px '+KRF,
  kind:'800 8.5px '+KRF, step:'700 7.5px '+KRF,
  no:'800 8.5px '+KRF, ans:'700 8.5px '+KRF, why:'400 8px '+KRF,
};
function mbaUnitHead(u,W,qpage){
  const O=[], h=21;
  O.push({t:'rect',x:0,y:0,w:W,h:h,lw:0,fill:NAVY,r:2});
  O.push({t:'rect',x:0,y:0,w:3.4,h:h,lw:0,fill:ORUN_Y});
  const no=UW+' '+String(u.it.unitNo||'').padStart(2,'0');
  O.push({t:'text',x:9,y:6,s:no,font:MBA.unit,color:ORUN_Y});
  const nx=9+mw(no,MBA.unit)+9;
  /* 채점하다 문제로 돌아갈 길이 없었다 — 이 유닛의 문제가 몇 쪽에 있는지
     여기서 바로 알려 준다. 교재 쪽수(p.NN)와 헷갈리지 않게 '문제'를 붙인다. */
  const rt = qpage? '문제 '+qpage+'쪽' : '';
  const rw = rt? mw(rt,'700 8px '+KRF)+10 : 0;
  O.push({t:'text',x:nx,y:6.6,s:ellipsize(u.it.title,MBA.unitS,W-nx-rw-12),font:MBA.unitS,color:'#ffffff'});
  if(rt) O.push({t:'text',x:W-8,y:6.4,s:rt,font:'700 8px '+KRF,color:ORUN_Y,align:'right'});
  return {ops:O,h:h+7};
}
function mbaKind(label,W){
  const O=[];
  O.push({t:'text',x:0,y:0,s:label,font:MBA.kind,color:NAVY,ls:1.4});
  O.push({t:'line',x1:mw(label,MBA.kind)+8,y1:5.5,x2:W,y2:5.5,lw:.7,color:'#cfd9e2'});
  return {ops:O,h:14};
}
function mbaStep(label,W){
  const O=[];
  O.push({t:'rect',x:0,y:0,w:W,h:12,lw:0,fill:TINT,r:1.5});
  O.push({t:'text',x:6,y:2.4,s:label,font:MBA.step,color:NAVY_L,ls:.5});
  return {ops:O,h:16};
}
function mbaRow(no,answer,why,W){
  const O=[]; let y=0;
  const nS=String(no)+'.', nw=Math.max(15,mw(nS,MBA.no)+5);
  O.push({t:'text',x:0,y:y,s:nS,font:MBA.no,color:NAVY_L});
  const al=wrapSegs(String(answer||''),MBA.ans,W-nw);
  al.forEach((ln,i)=>O.push({t:'rt',x:nw,y:y+i*11,line:ln,font:MBA.ans,color:'#b8341f'}));
  y+=al.length*11+1;
  if(why){
    const wl=wrapSegs(String(why),MBA.why,W-nw);
    wl.forEach((ln,i)=>O.push({t:'rt',x:nw,y:y+i*10.4,line:ln,font:MBA.why,color:INK2}));
    y+=wl.length*10.4;
  }
  return {ops:O,h:y+6};
}
function mbAnswers(book,units,startAt,qpageOf){
  const W=COLW;
  /* 원자 목록: 머리글은 뒤따르는 행과 짝을 이뤄야 자리를 잡는다 */
  const atoms=[];
  units.forEach(u=>{
    atoms.push(Object.assign(mbaUnitHead(u,W,qpageOf&&qpageOf(u)),{glue:2}));
    const b=u.ws.baekji, q=u.ws.popquiz;
    if(b&&b.sections){
      atoms.push(Object.assign(mbaKind(TR.recall,W),{glue:2}));
      bjSections(b).forEach(sec=>{
        atoms.push(Object.assign(mbaStep('STEP '+sec.no+'  '+sec.en+'  '+sec.kr,W),{glue:1}));
        (sec.rows||[]).forEach((r,i)=>atoms.push(mbaRow(i+1,r.answer,r.why,W)));
      });
    }
    if(q&&q.questions){
      atoms.push(Object.assign(mbaKind(TR.check,W),{glue:1}));
      const key={}; (q.answerKey||[]).forEach(a=>key[a.no]=a);
      pqPlan(q).forEach(o=>{
        const k=key[o.q.no];
        atoms.push(mbaRow(o.no,k?k.answer:'—',k?k.why:'',W));
      });
    }
    atoms.push({ops:[],h:9});
  });

  const pages=[[]]; let pi=0, col=0, y=0;
  const P=()=>pages[pi];
  /* 첫 장 머리에 부제판 */
  const OPEN=52;
  P().push({t:'rect',x:CX0,y:M.t,w:CW,h:40,lw:0,fill:NAVY,r:3});
  P().push({t:'rect',x:CX0,y:M.t+40,w:CW,h:3.4,lw:0,fill:ORUN_Y});
  P().push({t:'text',x:CX0+18,y:M.t+9,s:'ANSWERS & EXPLANATIONS',font:'800 14px '+KRF,color:'#ffffff',ls:2.2});
  P().push({t:'text',x:CX0+18,y:M.t+27,s:'정답과 해설',font:'500 8.5px '+KRF,color:'rgba(255,255,255,.62)',ls:1.4});
  P().push({t:'text',x:CX1-16,y:M.t+16,s:ellipsize(book.short||book.title,'700 11px '+KRF,240),
            font:'700 11px '+KRF,color:ORUN_Y,align:'right'});
  let top=M.t+58;
  const rule=t=>P().push({t:'line',x1:DIVX,y1:t-4,x2:DIVX,y2:BODY_BOT+8,lw:.7,color:'#d3dbe3'});
  rule(top); y=top;

  const advance=()=>{
    col++;
    if(col>1){ pages.push([]); pi++; col=0; top=CONT_TOP+10; rule(top); }
    y=top;
  };
  for(let i=0;i<atoms.length;i++){
    const a=atoms[i];
    let need=a.h;
    for(let g=1;g<=(a.glue||0)&&i+g<atoms.length;g++) need+=atoms[i+g].h;
    if(y+need>BODY_BOT && y>top) advance();
    if(a.ops.length) shiftOps(a.ops,COLX[col],y).forEach(o=>P().push(o));
    y+=a.h;
  }
  pages.forEach((p,i)=>mbFoot(p,startAt+i,'정답과 해설 · '+(book.short||book.title)));
  return pages;
}

/* ---- 조립 ----------------------------------------------------------- */
function mbLoadCover(book){
  return new Promise(res=>{
    if(!book.cover||!book.cover.img) return res(null);
    const im=new Image();
    im.onload=()=>res(im); im.onerror=()=>res(null);
    im.src=book.cover.img;
    if(im.complete&&im.naturalWidth) res(im);
  });
}
async function buildMetabook(book,onProg){
  const units=mbUnits(book);
  if(!units.length) return null;
  const chapters=new Set(); units.forEach(u=>chapters.add(u.chap));
  const st={units:units.length, chapters:chapters.size};

  /* 목차 분량을 먼저 재야 본문 첫 쪽 번호가 정해진다 */
  const tocDry=mbToc(book,units,2,null);
  const tocN=tocDry.length;
  let n=1+tocN;

  const body=[], startOf=new Map();
  for(let i=0;i<units.length;i++){
    const u=units[i];
    const b0=BOOK[u.it.bookId]||book;
    const opt={key:false, source:u.ws.source||'', page:u.it.page,
               unitNo:u.it.unitNo, book:(b0.short||b0.title), volBase:n};
    startOf.set(u,n+1);
    const mc=layoutBaekji(u.ws.baekji,opt);
    mc.pages.forEach(p=>body.push(p)); n+=mc.pages.length;
    const pq=layoutPopQuiz(u.ws.popquiz,Object.assign({},opt,{volBase:n}));
    pq.pages.forEach(p=>body.push(p)); n+=pq.pages.length;
    if(onProg && (i%4===0)){ onProg(i+1,units.length); await new Promise(r=>setTimeout(r,0)); }
  }

  const ansAt=n+1;
  const toc=mbToc(book,units,2,u=>startOf.get(u),ansAt);
  /* 목차 분량은 행 수만으로 정해지므로 두 번의 조판이 어긋날 수 없다.
     그래도 어긋나면 뒤 쪽번호가 전부 밀리므로, 모자란 만큼 빈 장을 채워
     본문 첫 쪽이 예고한 자리에 그대로 있게 한다. */
  while(toc.length<tocN){ const blank=[]; mbFoot(blank,2+toc.length,''); toc.push(blank); }
  if(toc.length>tocN) toc.length=tocN;

  const answers=mbAnswers(book,units,n+1,u=>startOf.get(u));
  const im=await mbLoadCover(book);
  const cover=mbCover(book,st,im);

  return {book:book, units:units, st:st,
          pages:[cover].concat(toc,body,answers)};
}

/* ---- 한 권 통째로 Word ------------------------------------------------
   벡터 조판을 그대로 옮길 수는 없으니 Word 쪽은 흐름 문서로 다시 짠다.
   선생님이 문항을 고쳐 쓰거나 반별로 덜어내는 판이다.                 */
const MB_BRK='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
function mbDocxUnitHead(u,kind){
  const TAB='<w:tabs><w:tab w:val="right" w:pos="10300"/></w:tabs>';
  return '<w:p><w:pPr><w:shd w:val="clear" w:fill="12557D"/>'+TAB
    +'<w:spacing w:before="0" w:after="160"/><w:ind w:left="80" w:right="80"/></w:pPr>'
    + runs(UW+' '+String(u.it.unitNo||'').padStart(2,'0'),{b:true,sz:24,color:'F5C518'})
    + runs('   '+u.it.title,{sz:21,color:'FFFFFF'})
    + '<w:r><w:tab/></w:r>'
    + runs(kind,{b:true,sz:19,color:'A9B7C4'})
    + '</w:p>';
}
function mbDocx(book,units){
  const bTitle=book.short||book.title;
  let x='';
  /* 표지 */
  x+=para('',{after:600});
  x+='<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr>'+logoDrawingXml(64)+'</w:p>';
  x+=para('옳은영어  ORUN ENGLISH',{b:true,sz:22,color:'56636F',align:'center',after:520});
  x+=para(TR.volTitle[0],{b:true,sz:88,color:'12557D',align:'center',after:0,line:240});
  x+=para(TR.volTitle[1],{b:true,sz:88,color:'C79A0F',align:'center',after:280,line:240});
  x+=para(TR.recall+'  ·  '+TR.check+'  ·  정답과 해설',{b:true,sz:20,color:'56636F',align:'center',after:600});
  x+=para(bTitle,{b:true,sz:36,color:'12557D',align:'center',after:80});
  x+=para(book.title,{sz:20,color:'56636F',align:'center',after:60});
  x+=para([book.publisher,book.gradeTag,book.band].filter(Boolean).join('   ·   '),
          {sz:19,color:'94A2AE',align:'center',after:400});
  x+=para('CHAPTER '+(new Set(units.map(u=>u.chap)).size)+'개   ·   UNIT '+units.length+'개   ·   시험지 '+(units.length*2)+'장',
          {sz:19,color:'56636F',align:'center'});
  x+=MB_BRK;

  /* 차례 */
  x+=para('CONTENTS  차례',{b:true,sz:28,color:'12557D',after:200});
  let lastCh=null;
  units.forEach(u=>{
    if(u.chap!==lastCh){
      lastCh=u.chap;
      x+=para('CHAPTER '+u.chap.no+'   '+u.chap.title,
              {b:true,sz:21,shade:'EEF3F7',color:'12557D',before:160,after:60});
    }
    x+=para(UW+' '+String(u.it.unitNo||'').padStart(2,'0')+'   '+u.it.title,
            {sz:19,ind:300,after:40});
  });
  x+=MB_BRK;

  /* 본문 — 유닛마다 POP QUIZ 다음 GRAMMAR CHECK */
  units.forEach((u,i)=>{
    const b=u.ws.baekji, q=u.ws.popquiz;
    x+=mbDocxUnitHead(u,TR.recall);
    x+=para((TR.hint||'지난 수업에서 배웠던 내용을 떠올리며 빈칸을 채워보세요.'),
            {sz:19,shade:'EEF3F7',color:'12557D',after:200});
    bjSections(b).forEach(sec=>{
      x+=para('STEP '+sec.no+'.  '+sec.en+'      '+sec.kr,
              {b:true,sz:23,shade:'1B2733',color:'FFFFFF',before:200,after:60});
      if(sec.instruction) x+=para(sec.instruction,{sz:19,color:'454B52',after:100});
      (sec.rows||[]).forEach((row,k)=>{
        x+=para((k+1)+'. '+row.prompt,{sz:20,after:40});
        const n=Math.max(1,Math.min(4,row.lines||1));
        for(let j=0;j<n;j++)
          x+='<w:p><w:pPr><w:spacing w:after="60" w:line="300" w:lineRule="auto"/><w:ind w:left="200"/></w:pPr></w:p>';
      });
    });
    x+=MB_BRK;

    x+=mbDocxUnitHead(u,TR.check+'    점수      / '+PQ_TOTAL);
    pqPlan(q).forEach(o=>{
      const qq=Object.assign({},o.q,o.stemAs?{stem:o.stemAs}:{});
      if(o.head) x+=para(o.head,{b:true,sz:20,before:120,after:60});
      if(qq.bank&&qq.bank.length) x+=para('<보기>  '+qq.bank.join('    '),{border:true,sz:19,after:60});
      const body=(qq.bullets&&qq.bullets.length)? qq.bullets.map(v=>'• '+v).join('\n') : qq.stem;
      x+=para(o.no+'. ('+o.pts+'점) '+body,{sz:20,border:!!qq.boxed,after:qq.choices&&qq.choices.length?40:100});
      if(qq.choices&&qq.choices.length)
        x+=para(qq.choices.map((c,k)=>['①','②','③','④','⑤'][k]+' '+c).join('   '),{sz:19,ind:200,after:100});
    });
    if(i<units.length-1) x+=MB_BRK;
  });
  x+=MB_BRK;

  /* 정답과 해설 — 전부 맨 뒤 */
  x+=para('ANSWERS & EXPLANATIONS',{b:true,sz:32,color:'12557D',after:40});
  x+=para('정답과 해설',{sz:21,color:'56636F',after:240});
  units.forEach(u=>{
    x+=mbDocxUnitHead(u,'정답과 해설');
    const b=u.ws.baekji, q=u.ws.popquiz;
    x+=para(TR.recall,{b:true,sz:20,color:'12557D',before:80,after:60});
    bjSections(b).forEach(sec=>{
      x+=para('STEP '+sec.no+'  '+sec.en+'  '+sec.kr,{b:true,sz:18,shade:'EEF3F7',color:'2A719B',after:50});
      (sec.rows||[]).forEach((r,k)=>{
        x+=para((k+1)+'. '+(r.answer||'—'),{b:true,sz:18,color:'B8341F',ind:200,after:20});
        if(r.why) x+=para(r.why,{sz:17,color:'56636F',ind:400,after:60});
      });
    });
    x+=para(TR.check,{b:true,sz:20,color:'12557D',before:120,after:60});
    const key={}; (q.answerKey||[]).forEach(a=>key[a.no]=a);
    pqPlan(q).forEach(o=>{
      const k=key[o.q.no];
      x+=para(o.no+'. '+((k&&k.answer)||'—'),{b:true,sz:18,color:'B8341F',ind:200,after:20});
      if(k&&k.why) x+=para(k.why,{sz:17,color:'56636F',ind:400,after:60});
    });
  });
  x+=docxFooter(bTitle+' · '+MB_NAME);
  return docxWrap(x);
}

/* ---- 한 권 통째로 PDF -------------------------------------------------
   240쪽을 캔버스로 한꺼번에 들고 있으면 1GB가 넘는다. 한 장씩 그리고
   그 자리에서 JPEG 로 굳힌 뒤 캔버스를 버린다.                       */
async function buildPDFPages(pages,sc,q,onProg){
  const enc=new TextEncoder();
  const chunks=[]; let len=0;
  const push=u=>{ chunks.push(u); len+=u.length; };
  const pushS=s=>push(enc.encode(s));
  const N=pages.length, objOff=[];
  pushS('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const put=(n,body,stream)=>{
    objOff[n]=len;
    pushS(n+' 0 obj\n'+body+'\n');
    if(stream){ pushS('stream\n'); push(stream); pushS('\nendstream\n'); }
    pushS('endobj\n');
  };
  const kids=[]; for(let i=0;i<N;i++) kids.push((3+i*3)+' 0 R');
  put(1,'<< /Type /Catalog /Pages 2 0 R >>');
  put(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+N+' >>');
  for(let i=0;i<N;i++){
    const c=opsToCanvas(pages[i],sc);
    const durl=c.toDataURL('image/jpeg',q);
    c.width=c.height=0;                       /* 즉시 반납 */
    const b64=durl.slice(durl.indexOf(',')+1);
    const bin=atob(b64), u=new Uint8Array(bin.length);
    for(let k=0;k<bin.length;k++) u[k]=bin.charCodeAt(k);
    const pn=3+i*3, cn=pn+1, im=pn+2;
    put(pn,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+A4W+' '+A4H+'] '
        +'/Resources << /XObject << /X0 '+im+' 0 R >> >> /Contents '+cn+' 0 R >>');
    const cs=enc.encode('q '+A4W+' 0 0 '+A4H+' 0 0 cm /X0 Do Q');
    put(cn,'<< /Length '+cs.length+' >>',cs);
    put(im,'<< /Type /XObject /Subtype /Image /Width '+Math.round(A4W*sc)
        +' /Height '+Math.round(A4H*sc)+' /ColorSpace /DeviceRGB /BitsPerComponent 8'
        +' /Filter /DCTDecode /Length '+u.length+' >>',u);
    if(onProg && (i%3===0)){ onProg(i+1,N); await new Promise(r=>setTimeout(r,0)); }
  }
  const xref=len;
  const nObj=3+N*3;
  let x='xref\n0 '+nObj+'\n0000000000 65535 f \n';
  for(let i=1;i<nObj;i++) x+=String(objOff[i]||0).padStart(10,'0')+' 00000 n \n';
  x+='trailer\n<< /Size '+nObj+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
  pushS(x);
  const out=new Uint8Array(len); let p=0;
  chunks.forEach(c=>{ out.set(c,p); p+=c.length; });
  return out;
}

/* ============================================================
   11. RENDERER A — ops → HTML (screen preview + print, vector)
   ============================================================ */
/* 1pt 를 CSS px 로 옮기는 배율. @page size:A4 가 잡는 상자와 같은 치수라야
   인쇄에서 한 장이 한 장으로 떨어진다. */
/* 4/3 을 그대로 쓰면 842pt x 4/3 = 1122.67px 로 A4 인쇄 상자(1122.52px)를
   0.15px 넘겨 한 장이 두 장으로 찢어진다. 조금 모자라게 잡는다. */
const PSC=1.333;
function opsToHTML(ops,scale){
  /* Vectors into a single SVG layer, text as divs above it. Splitting the
     two means a filled band can never paint over its own label, and it
     gives us polygons — which the logo needs. */
  return ops.pages.map(page=>{
    const PW=A4W*scale, PH=A4H*scale;
    let svg='<svg class="opsvg" width="'+PW+'" height="'+PH+'" viewBox="0 0 '+A4W+' '+A4H+'" preserveAspectRatio="none" aria-hidden="true">';
    let txt='';
    page.forEach(o=>{
      if(o.t==='rect'){
        svg+='<rect x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h+'"'
           +' fill="'+(o.fill||'none')+'"'
           +(o.lw?' stroke="'+(o.color||'#15191d')+'" stroke-width="'+o.lw+'"':'')
           +(o.r?' rx="'+o.r+'" ry="'+o.r+'"':'')+'/>';
      } else if(o.t==='line'){
        svg+='<line x1="'+o.x1+'" y1="'+o.y1+'" x2="'+o.x2+'" y2="'+o.y2+'"'
           +' stroke="'+(o.color||'#15191d')+'" stroke-width="'+(o.lw||1)+'" stroke-linecap="'+(o.cap||'butt')+'"/>';
      } else if(o.t==='poly'){
        svg+='<polygon points="'+o.pts.map(q=>q[0].toFixed(2)+','+q[1].toFixed(2)).join(' ')+'"'
           +' fill="'+(o.fill||'none')+'"'
           +(o.lw?' stroke="'+(o.stroke||'#333331')+'" stroke-width="'+o.lw+'" stroke-linejoin="round"':'')+'/>';
      } else if(o.t==='img'){
        svg+='<image href="'+o.src+'" x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h
           +'" preserveAspectRatio="none"/>';
      } else if(o.t==='text'||o.t==='rt'){
        const parts = o.t==='rt'? o.line : [{t:o.s,u:false}];
        const body = parts.map(q=>q.u?'<u>'+esc(q.t)+'</u>':esc(q.t)).join('');
        txt+='<div class="op" style="left:'+(o.x*scale)+'px;top:'+(o.y*scale)+'px;'
          +'font:'+o.font.replace(/(\d+(?:\.\d+)?)px/,(m,n)=>(parseFloat(n)*scale)+'px').replace(/"/g,"'")+';'
          +(o.color?'color:'+o.color+';':'')
          +(o.align==='right'?'transform:translateX(-100%);':o.align==='center'?'transform:translateX(-50%);':'')
          +(o.ls?'letter-spacing:'+(o.ls*scale)+'px;':'')
          +'">'+body+'</div>';
      }
    });
    svg+='</svg>';
    return '<div class="page" style="width:'+PW+'px;height:'+PH+'px">'+svg+txt+'</div>';
  }).join('');
}

/* ============================================================
   12. RENDERER B — ops → canvas → PDF
   ============================================================ */
function opsToCanvas(page,sc){
  const c=document.createElement('canvas');
  c.width=Math.round(A4W*sc); c.height=Math.round(A4H*sc);
  const g=c.getContext('2d');
  g.fillStyle='#ffffff'; g.fillRect(0,0,c.width,c.height);
  g.scale(sc,sc);
  g.textBaseline='top';
  /* vectors first, then text — same stacking contract as the HTML renderer */
  const pass=[page.filter(o=>o.t!=='text'&&o.t!=='rt'),page.filter(o=>o.t==='text'||o.t==='rt')];
  pass.forEach(list=>list.forEach(o=>{
    if(o.t==='rect'){
      if(o.r){
        const rr=Math.min(o.r,Math.abs(o.w)/2,Math.abs(o.h)/2);
        g.beginPath();
        if(g.roundRect) g.roundRect(o.x,o.y,o.w,o.h,rr);
        else{
          g.moveTo(o.x+rr,o.y); g.arcTo(o.x+o.w,o.y,o.x+o.w,o.y+o.h,rr);
          g.arcTo(o.x+o.w,o.y+o.h,o.x,o.y+o.h,rr); g.arcTo(o.x,o.y+o.h,o.x,o.y,rr);
          g.arcTo(o.x,o.y,o.x+o.w,o.y,rr); g.closePath();
        }
        if(o.fill){ g.fillStyle=o.fill; g.fill(); }
        if(o.lw){ g.strokeStyle=o.color||'#15191d'; g.lineWidth=o.lw; g.stroke(); }
      } else {
        if(o.fill){ g.fillStyle=o.fill; g.fillRect(o.x,o.y,o.w,o.h); }
        if(o.lw){ g.strokeStyle=o.color||'#15191d'; g.lineWidth=o.lw; g.strokeRect(o.x,o.y,o.w,o.h); }
      }
    } else if(o.t==='poly'){
      g.beginPath(); o.pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath();
      if(o.fill){ g.fillStyle=o.fill; g.fill(); }
      if(o.lw){ g.strokeStyle=o.stroke||'#333331'; g.lineWidth=o.lw; g.lineJoin='round'; g.stroke(); }
    } else if(o.t==='img'){
      if(o.im&&o.im.naturalWidth) g.drawImage(o.im,o.x,o.y,o.w,o.h);
    } else if(o.t==='line'){
      g.strokeStyle=o.color||'#15191d'; g.lineWidth=o.lw||1;
      g.beginPath(); g.moveTo(o.x1,o.y1); g.lineTo(o.x2,o.y2); g.stroke();
    } else if(o.t==='text'||o.t==='rt'){
      g.font=o.font; g.fillStyle=o.color||'#15191d';
      const parts = o.t==='rt'? o.line : [{t:o.s,u:false}];
      let total=0; parts.forEach(p=>{ g.font=o.font; total+=g.measureText(p.t).width; });
      let x=o.x;
      if(o.align==='right') x-=total; else if(o.align==='center') x-=total/2;
      parts.forEach(p=>{
        g.font=o.font;
        g.fillText(p.t,x,o.y);
        const w=g.measureText(p.t).width;
        if(p.u){
          const fs=parseFloat((o.font.match(/(\d+(?:\.\d+)?)px/)||[0,11])[1]);
          g.strokeStyle=o.color||'#15191d'; g.lineWidth=.7;
          g.beginPath(); g.moveTo(x,o.y+fs*1.16); g.lineTo(x+w,o.y+fs*1.16); g.stroke();
        }
        x+=w;
      });
    }
  }));
  return c;
}

/* minimal PDF: one JPEG XObject per page */
function buildPDF(canvases){
  const enc=new TextEncoder();
  const chunks=[]; let len=0;
  const push=u=>{ chunks.push(u); len+=u.length; };
  const pushS=s=>push(enc.encode(s));

  const jpgs=canvases.map(c=>{
    const durl=c.toDataURL('image/jpeg',0.92);
    const b64=durl.slice(durl.indexOf(',')+1);
    const bin=atob(b64); const u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
    return {u,w:c.width,h:c.height};
  });

  const N=canvases.length;
  // object numbering: 1 catalog, 2 pages, then per page: page obj, content obj, image obj
  const objOff=[];
  pushS('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  function obj(n,body,stream){
    objOff[n]=len;
    pushS(n+' 0 obj\n'+body+'\n');
    if(stream){ pushS('stream\n'); push(stream); pushS('\nendstream\n'); }
    pushS('endobj\n');
  }
  const kids=[];
  for(let i=0;i<N;i++) kids.push((3+i*3)+' 0 R');

  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+N+' >>');
  for(let i=0;i<N;i++){
    const pn=3+i*3, cn=pn+1, im=pn+2;
    obj(pn,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+A4W+' '+A4H+'] '
      +'/Resources << /XObject << /Im0 '+im+' 0 R >> >> /Contents '+cn+' 0 R >>');
    const cs=enc.encode('q\n'+A4W+' 0 0 '+A4H+' 0 0 cm\n/Im0 Do\nQ\n');
    obj(cn,'<< /Length '+cs.length+' >>',cs);
    const j=jpgs[i];
    obj(im,'<< /Type /XObject /Subtype /Image /Width '+j.w+' /Height '+j.h
      +' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+j.u.length+' >>',j.u);
  }
  const xref=len;
  const total=2+N*3;
  let x='xref\n0 '+(total+1)+'\n0000000000 65535 f \n';
  for(let n=1;n<=total;n++) x+=String(objOff[n]).padStart(10,'0')+' 00000 n \n';
  pushS(x);
  pushS('trailer\n<< /Size '+(total+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');

  const out=new Uint8Array(len); let p=0;
  chunks.forEach(c=>{ out.set(c,p); p+=c.length; });
  return out;
}

/* ============================================================
   13. RENDERER C — data → DOCX (hand-rolled ZIP, STORE)
   ============================================================ */
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
const DOSDATE=(46<<9)|(1<<5)|1; /* 2026-01-01 — a valid DOS date; day 0 makes Word suspicious */
function zipStore(files){
  const enc=new TextEncoder(); const parts=[]; const central=[]; let off=0;
  files.forEach(f=>{
    const name=enc.encode(f.name);
    const data=typeof f.data==='string'?enc.encode(f.data):f.data;
    const crc=crc32(data);
    const lh=new Uint8Array(30+name.length); const dv=new DataView(lh.buffer);
    dv.setUint32(0,0x04034b50,true); dv.setUint16(4,20,true); dv.setUint16(6,0x0800,true);
    dv.setUint16(8,0,true); dv.setUint16(10,0,true); dv.setUint16(12,DOSDATE,true);
    dv.setUint32(14,crc,true); dv.setUint32(18,data.length,true); dv.setUint32(22,data.length,true);
    dv.setUint16(26,name.length,true); dv.setUint16(28,0,true);
    lh.set(name,30);
    parts.push(lh,data);
    const ch=new Uint8Array(46+name.length); const cv2=new DataView(ch.buffer);
    cv2.setUint32(0,0x02014b50,true); cv2.setUint16(4,20,true); cv2.setUint16(6,20,true);
    cv2.setUint16(8,0x0800,true); cv2.setUint16(10,0,true);
    cv2.setUint16(12,0,true); cv2.setUint16(14,DOSDATE,true);
    cv2.setUint32(16,crc,true); cv2.setUint32(20,data.length,true); cv2.setUint32(24,data.length,true);
    cv2.setUint16(28,name.length,true); cv2.setUint32(42,off,true);
    ch.set(name,46);
    central.push(ch);
    off+=lh.length+data.length;
  });
  const cs=central.reduce((s,c)=>s+c.length,0);
  const eo=new Uint8Array(22); const ev=new DataView(eo.buffer);
  ev.setUint32(0,0x06054b50,true);
  ev.setUint16(8,files.length,true); ev.setUint16(10,files.length,true);
  ev.setUint32(12,cs,true); ev.setUint32(16,off,true);
  const all=parts.concat(central,[eo]);
  const total=all.reduce((s,c)=>s+c.length,0);
  const out=new Uint8Array(total); let p=0;
  all.forEach(c=>{ out.set(c,p); p+=c.length; });
  return out;
}
const xe=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function runs(text,opt){
  opt=opt||{};
  const chunks=String(text==null?'':text).split(/<br\s*\/?>|\n/i);
  if(chunks.length>1){
    return chunks.map((c,i)=>(i?'<w:r><w:br/></w:r>':'')+runs(c,opt)).join('');
  }
  return segs(text).map(sg=>
    '<w:r><w:rPr>'
    +'<w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/>'
    +'<w:sz w:val="'+(opt.sz||20)+'"/>'
    +(opt.b?'<w:b/>':'')+((sg.u||opt.u)?'<w:u w:val="single"/>':'')
    +(opt.color?'<w:color w:val="'+opt.color+'"/>':'')
    +'</w:rPr><w:t xml:space="preserve">'+xe(sg.t)+'</w:t></w:r>').join('');
}
function para(text,opt){
  opt=opt||{};
  return '<w:p><w:pPr>'
    +(opt.align?'<w:jc w:val="'+opt.align+'"/>':'')
    +'<w:spacing w:before="'+(opt.before||0)+'" w:after="'+(opt.after||40)+'" w:line="'+(opt.line||264)+'" w:lineRule="auto"/>'
    +(opt.ind?'<w:ind w:left="'+opt.ind+'"/>':'')
    +(opt.shade?'<w:shd w:val="clear" w:fill="'+opt.shade+'"/>':'')
    +(opt.border?'<w:pBdr><w:top w:val="single" w:sz="6" w:color="333333"/><w:left w:val="single" w:sz="6" w:color="333333"/><w:bottom w:val="single" w:sz="6" w:color="333333"/><w:right w:val="single" w:sz="6" w:color="333333"/></w:pBdr>':'')
    +'</w:pPr>'+runs(text,opt)+'</w:p>';
}
/* Word can't take our vector ops, so the same mark is rasterised once and
   embedded as a picture part — the three outputs then carry one logo. */
let LOGO_PNG=null;
function logoPngBytes(){
  if(LOGO_PNG) return LOGO_PNG;
  const S=44, R=4, c=document.createElement('canvas');
  c.width=S*R; c.height=S*R;
  const g=c.getContext('2d');
  g.scale(R,R);
  logoOps(0,0,S).forEach(op=>{
    if(op.t==='line'){
      g.beginPath(); g.moveTo(op.x1,op.y1); g.lineTo(op.x2,op.y2);
      g.strokeStyle=op.color||'#333331'; g.lineWidth=op.lw||1; g.lineCap=op.cap||'butt'; g.stroke();
    } else if(op.t==='poly'){
      g.beginPath(); op.pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath();
      if(op.fill){ g.fillStyle=op.fill; g.fill(); }
      if(op.lw){ g.strokeStyle=op.stroke||'#333331'; g.lineWidth=op.lw; g.lineJoin='round'; g.stroke(); }
    } else if(op.t==='rect'){
      if(op.fill){ g.fillStyle=op.fill; g.fillRect(op.x,op.y,op.w,op.h); }
      if(op.lw){ g.strokeStyle=op.color||'#333331'; g.lineWidth=op.lw; g.strokeRect(op.x,op.y,op.w,op.h); }
    }
  });
  const b64=c.toDataURL('image/png').split(',')[1];
  const bin=atob(b64), u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
  return (LOGO_PNG=u);
}
const EMU=px=>Math.round(px*12700);           /* 1pt = 12700 EMU */
function logoDrawingXml(pt){
  const cx=EMU(pt), cy=EMU(pt);
  return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">'
    +'<wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:docPr id="1" name="ORUN"/>'
    +'<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
    +'<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
    +'<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
    +'<pic:nvPicPr><pic:cNvPr id="1" name="ORUN"/><pic:cNvPicPr/></pic:nvPicPr>'
    +'<pic:blipFill><a:blip r:embed="rId9"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
    +'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm>'
    +'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
    +'</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
}
function docxWrap(bodyXml){
  const ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    +'<Default Extension="xml" ContentType="application/xml"/>'
    +'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    +'<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    +'<Default Extension="png" ContentType="image/png"/>'
    +'</Types>';
  const rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    +'</Relationships>';
  const drels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    +'<Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>'
    +'</Relationships>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    +'<w:docDefaults><w:rPrDefault><w:rPr>'
    +'<w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/>'
    +'<w:sz w:val="20"/></w:rPr></w:rPrDefault></w:docDefaults>'
    +'<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>'
    +'</w:styles>';
  const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
    +' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
    +' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>'
    +bodyXml
    +'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
    +'<w:pgMar w:top="850" w:right="800" w:bottom="850" w:left="800" w:header="0" w:footer="0" w:gutter="0"/>'
    +'</w:sectPr></w:body></w:document>';
  return zipStore([
    {name:'[Content_Types].xml',data:ct},
    {name:'_rels/.rels',data:rels},
    {name:'word/_rels/document.xml.rels',data:drels},
    {name:'word/styles.xml',data:styles},
    {name:'word/media/logo.png',data:logoPngBytes()},
    {name:'word/document.xml',data:doc},
  ]);
}
function tbl2(cellsA,cellsB){
  return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>'
    +'<w:tblBorders><w:insideV w:val="single" w:sz="4" w:color="666666"/></w:tblBorders>'
    +'<w:tblLayout w:type="fixed"/></w:tblPr>'
    +'<w:tblGrid><w:gridCol w:w="5150"/><w:gridCol w:w="5150"/></w:tblGrid>'
    +'<w:tr>'
    +'<w:tc><w:tcPr><w:tcW w:w="5150" w:type="dxa"/><w:tcMar><w:right w:w="180" w:type="dxa"/></w:tcMar></w:tcPr>'+(cellsA||para(''))+'</w:tc>'
    +'<w:tc><w:tcPr><w:tcW w:w="5150" w:type="dxa"/><w:tcMar><w:left w:w="180" w:type="dxa"/></w:tcMar></w:tcPr>'+(cellsB||para(''))+'</w:tc>'
    +'</w:tr></w:tbl>';
}
/* Word masthead mirrors the printed one: brand block, ruled name fields,
   then a solid type band naming the sheet. */
function docxHeader(kind,chapter,scored,page){
  const TAB='<w:tabs><w:tab w:val="right" w:pos="10300"/></w:tabs>';
  let x='<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="24" w:color="F5C518"/></w:pBdr>'
    +'<w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:p>';
  x+='<w:p><w:pPr>'+TAB+'<w:spacing w:before="60" w:after="40"/></w:pPr>'
    + logoDrawingXml(26)
    + runs('  ORUN ENGLISH',{b:true,sz:24,color:'12557D'})
    + '<w:r><w:tab/></w:r>' + runs('반 ______________    이름 ______________',{sz:19,color:'56636F'})
    + '</w:p>';
  x+='<w:p><w:pPr><w:spacing w:after="160"/></w:pPr>'
    + runs('옳은영어 · '+TR.vol,{sz:16,color:'94A2AE'}) + '</w:p>';
  x+='<w:p><w:pPr><w:shd w:val="clear" w:fill="12557D"/>'+TAB
    +'<w:spacing w:before="0" w:after="200"/><w:ind w:left="80" w:right="80"/></w:pPr>'
    + runs(kind,{b:true,sz:24,color:'FFFFFF'})
    + '<w:r><w:tab/></w:r>'
    + runs(chapter+(scored?'    '+scored:''),{sz:19,color:'A9B7C4'})

    + '</w:p>';
  return x;
}
function docxFooter(source){
  return '<w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:color="D8DEE5"/></w:pBdr>'
    +'<w:spacing w:before="240"/><w:jc w:val="center"/></w:pPr>'
    + runs('옳은영어 ORUN ENGLISH',{b:true,sz:16,color:'56636F'})
    + (source? runs('     '+source,{sz:15,color:'94A2AE'}) : '')
    + '</w:p>';
}
function popquizDocx(q,showKey){
  const plan=pqPlan(q);
  const rows=plan.map(o=>Object.assign({},o.q,{no:o.no,groupHeader:o.head,__pts:o.pts,__key:o.q.no},
                                        o.stemAs?{stem:o.stemAs}:{}));
  const half=Math.ceil(rows.length/2);
  const col=(arr)=>arr.map(qq=>{
    let x='';
    if(qq.groupHeader) x+=para(qq.groupHeader,{b:true,sz:20,before:120,after:60});
    if(qq.bank&&qq.bank.length) x+=para('<보기>  '+qq.bank.join('    '),{border:true,sz:19,after:60});
    const body=(qq.bullets&&qq.bullets.length)? qq.bullets.map(b=>'• '+b).join('\n') : qq.stem;
    x+=para(qq.no+'. ('+qq.__pts+'점) '+body,{sz:20,border:!!qq.boxed,after:qq.choices?40:100});
    if(qq.choices) x+=para(qq.choices.map((c,i)=>['①','②','③','④','⑤'][i]+' '+c).join('   '),{sz:19,ind:200,after:100});
    if(showKey){
      const k=(q.answerKey||[]).find(a=>a.no===(qq.__key!=null?qq.__key:qq.no));
      if(k) x+=para('▶ '+k.answer+(k.why?'  — '+k.why:''),{sz:18,color:'B8341F',ind:200,after:140});
    }
    return x;
  }).join('');
  return docxWrap(
    docxHeader(TR.check,q.chapter,'점수        / '+PQ_TOTAL,q.__page)
    + tbl2(col(rows.slice(0,half)),col(rows.slice(half)))
    + docxFooter(q.__source)
  );
}
function baekjiDocx(b,showKey){
  let x=docxHeader(TR.recall,b.chapter,'',b.__page);
  x+=para((TR.hint||'지난 수업에서 배웠던 내용을 떠올리며 빈칸을 채워보세요.'),{sz:19,shade:'EEF3F7',color:'12557D',after:200});
  bjSections(b).forEach(sec=>{
    x+=para('STEP '+sec.no+'.  '+sec.en+'      '+sec.kr,
            {b:true,sz:23,shade:'1B2733',color:'FFFFFF',before:200,after:60});
    if(sec.instruction) x+=para(sec.instruction,{sz:19,color:'454B52',after:100});
    sec.rows.forEach((row,i)=>{
      x+=para((i+1)+'. '+row.prompt,{sz:20,after:40});
      const lines=Math.max(1,Math.min(4,row.lines||1));
      for(let k=0;k<lines;k++){
        x+='<w:p><w:pPr><w:spacing w:after="60" w:line="300" w:lineRule="auto"/>'
          +'<w:ind w:left="200"/></w:pPr></w:p>';
      }
      if(showKey){
        x+=para('▶ '+row.answer,{sz:18,color:'B8341F',ind:200,after:row.why?20:120});
        if(row.why) x+=para(row.why,{sz:17,color:'7A5750',ind:300,after:120});
      }
    });
  });
  x+=docxFooter(b.__source);
  return docxWrap(x);
}

/* ============================================================
   14. SHEET MODAL
   ============================================================ */
let cur=null, curTab='b', showKey=false;
const modal=document.getElementById('modal');

function openSheet(item){
  if(!item) return;
  const ws=DATA.worksheets[item.id];
  if(!ws){ toast('이 노드는 아직 시험지가 연결되지 않았습니다.',true); return; }
  cur={item,ws};
  modal.classList.remove('vol');
  document.getElementById('btn-print').textContent='인쇄';
  document.getElementById('sheet-eyebrow').textContent =
    (BOOK[item.bookId]?BOOK[item.bookId].short||BOOK[item.bookId].title:'')
    + ' · ' + (TR.chWord||'CHAPTER') + ' ' + item.chapNo;
  document.getElementById('sheet-title').textContent = item.title;
  modal.classList.add('open');
  setTab(curTab);
  document.getElementById('btn-close').focus();
}
function closeSheet(){ modal.classList.remove('open'); modal.classList.remove('vol'); cur=null; }

/* 한 권을 통째로 조판한다. 240쪽이 넘는 판이라 한 번에 도는 대신
   유닛 몇 개마다 화면에 진행을 넘기고 이어 돈다. */
async function openVolume(bookId){
  const b=BOOK[bookId];
  if(!b) return;
  cur=null;
  modal.classList.add('open'); modal.classList.add('vol');
  document.getElementById('sheet-eyebrow').textContent=MB_NAME;
  document.getElementById('sheet-title').textContent=(b.short||b.title)+' 전권';
  document.getElementById('pages').innerHTML='';
  document.getElementById('sheet-note').textContent='조판 준비 중…';
  document.getElementById('btn-close').focus();
  await new Promise(r=>setTimeout(r,40));
  let vol=null;
  try{
    vol=await buildMetabook(b,(i,n)=>{
      document.getElementById('sheet-note').textContent='조판 중  '+i+' / '+n+' UNIT';
    });
  }catch(e){
    toast('조판에 실패했습니다: '+(e&&e.message||e),true); closeSheet(); return;
  }
  if(!vol){ toast('이 교재에는 아직 시험지가 없습니다.',true); closeSheet(); return; }
  if(!modal.classList.contains('open')) return;      /* 그새 닫았으면 버린다 */
  cur={vol:vol};
  document.getElementById('btn-print').textContent='인쇄 · PDF로 저장';
  paint();
}

function curOps(){
  if(!cur) return null;
  if(cur.vol) return {pages:cur.vol.pages};
  const b0=BOOK[cur.item.bookId];
  const opt={key:showKey,source:cur.ws.source||'',page:cur.item.page,
             unitNo:cur.item.unitNo, book:(b0?b0.short||b0.title:'')};
  return curTab==='b' ? layoutBaekji(cur.ws.baekji,opt)
                      : layoutPopQuiz(cur.ws.popquiz,opt);
}
function setTab(t){
  curTab=t;
  document.getElementById('tab-b').setAttribute('aria-selected',t==='b');
  document.getElementById('tab-p').setAttribute('aria-selected',t==='p');
  paint();
}
function paint(){
  if(!cur) return;
  const box=document.getElementById('preview');
  const avail=Math.max(320,box.clientWidth-44);
  if(cur.vol){
    const v=cur.vol, pg=document.getElementById('pages');
    pg.style.setProperty('--pz',Math.min(1,avail/(A4W*PSC)).toFixed(4));
    pg.innerHTML=opsToHTML({pages:v.pages},PSC);
    document.getElementById('sheet-note').textContent =
      MB_NAME+' · '+(v.book.short||v.book.title)+' · A4 '+v.pages.length+'쪽'
      + ' · CHAPTER '+v.st.chapters+' · UNIT '+v.st.units+' · 정답과 해설 권말'
      + '   |   PDF 는 [인쇄 · PDF로 저장] 으로 받으십시오';
    return;
  }
  const ops=curOps();
  const pg=document.getElementById('pages');
  pg.style.setProperty('--pz',Math.min(1.18,avail/(A4W*PSC)).toFixed(4));
  pg.innerHTML=opsToHTML(ops,PSC);
  const n=ops.pages.length;
  document.getElementById('sheet-note').textContent =
    (curTab==='b'?TR.recall:TR.check)+' · A4 '+n+'쪽'+(showKey?' · 정답 포함':'')
    + ' · ' + (cur.ws.source||'');
}
document.getElementById('tab-b').textContent=TR.recall;
document.getElementById('tab-p').textContent=TR.check;
document.getElementById('tab-b').onclick=()=>setTab('b');
document.getElementById('tab-p').onclick=()=>setTab('p');
document.getElementById('btn-close').onclick=closeSheet;
modal.addEventListener('click',e=>{ if(e.target===modal) closeSheet(); });
/* Arrow keys drive the same camera the pointer does — held, not repeated,
   so motion is frame-paced instead of tied to the OS key-repeat rate. */
const HELD=new Set();
const NAV={ArrowLeft:1,ArrowRight:1,ArrowUp:1,ArrowDown:1,'+':1,'=':1,'-':1,'_':1};
function typing(el){
  return !!el && (el.tagName==='INPUT'||el.tagName==='SELECT'||el.tagName==='TEXTAREA'||el.isContentEditable);
}
let shiftDown=false;
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modal.classList.contains('open')){ closeSheet(); return; }
  if(e.key==='Escape'&&!universeMode){ toUniverse(); return; }
  if(modal.classList.contains('open')||typing(e.target)) return;
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  shiftDown=e.shiftKey;
  if(!NAV[e.key]) return;
  HELD.add(e.key); cam.idle=0; autoFrame=false;
  e.preventDefault();                 /* stop the page scrolling under us */
});
addEventListener('keyup',  e=>{ shiftDown=e.shiftKey; HELD.delete(e.key); });
addEventListener('blur',   ()=>{ HELD.clear(); shiftDown=false; });
function keyNav(){
  if(!HELD.size) return;
  const L=HELD.has('ArrowLeft'), R=HELD.has('ArrowRight');
  const U=HELD.has('ArrowUp'),   D=HELD.has('ArrowDown');
  if(shiftDown){                      /* Shift held → slide the view */
    const step=11/Math.max(.35,cam.tzoom);
    if(L) cam.tpx+=step; if(R) cam.tpx-=step;
    if(U) cam.tpy+=step; if(D) cam.tpy-=step;
    clampPan();
  } else {
    if(L||R) yawUser=true;
    if(L) cam.tyaw-=.026; if(R) cam.tyaw+=.026;
    if(U){ cam.tpitch=Math.min(PITCH_MAX,cam.tpitch+.018); pitchUser=true; }
    if(D){ cam.tpitch=Math.max(PITCH_MIN,cam.tpitch-.018); pitchUser=true; }
  }
  if(HELD.has('+')||HELD.has('=')) cam.tzoom=Math.min(zoomHi(),cam.tzoom*1.022);
  if(HELD.has('-')||HELD.has('_')) cam.tzoom=Math.max(zoomLo(),cam.tzoom/1.022);
  if(L||R||U||D||HELD.has('+')||HELD.has('=')||HELD.has('-')||HELD.has('_')) cam.idle=0;
}
document.getElementById('btn-key').onclick=function(){
  showKey=!showKey; this.setAttribute('aria-pressed',showKey);
  this.textContent = showKey?'정답 숨기기':'정답 보기';
  paint();
};
document.getElementById('btn-print').onclick=()=>window.print();

let RO=null;
new ResizeObserver(()=>{ if(cur&&!cur.vol) paint(); }).observe(document.getElementById('preview'));

/* ── downloads ───────────────────────────────────────────── */
/* 저장 경로는 두 가지다. 클로드 아티팩트 안에서는 downloads 기능을 쓰고,
   그 밖(파일로 받아 브라우저에서 연 경우, 학원 서버에 올린 경우)에서는
   Blob + <a download> 으로 떨어뜨린다. 예전에는 후자에서 버튼을 아예
   꺼 버렸는데, 그러면 파일로 배포한 판이 반쪽이 된다. */
let DL=null, dlReady=false;
(async()=>{
  try{ DL = window.claude && claude.use ? await claude.use('downloads') : null; }catch(e){ DL=null; }
  dlReady=true;
})();
function blobSave(filename,data,mime){
  const url=URL.createObjectURL(new Blob([data],{type:mime||'application/octet-stream'}));
  const a=document.createElement('a');
  a.href=url; a.download=filename; a.rel='noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}
const MIME={docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            pdf:'application/pdf'};
function fname(ext){
  if(cur.vol){
    const v=cur.vol.book;
    return (TR.vol+'_'+(v.short||v.title)).replace(/[\\/:*?"<>|]/g,'-')+'.'+ext;
  }
  const b=BOOK[cur.item.bookId];
  const base=(b?b.short||b.title:'ORUN')+'_CH'+cur.item.chapNo+'_'
    +(curTab==='b'?TR.recallF:TR.checkF)+(showKey?'_정답':'');
  return base.replace(/[\\/:*?"<>|]/g,'-')+'.'+ext;
}
async function save(filename,data){
  const mime=MIME[(filename.split('.').pop()||'').toLowerCase()];
  if(!DL){
    try{ blobSave(filename,data,mime); toast(filename+' 저장'); }
    catch(e){ toast('저장하지 못했습니다. 인쇄를 사용하십시오.',true); }
    return;
  }
  try{
    await DL.save({filename,data});
    toast(filename+' 저장 완료');
  }catch(err){
    const c=err&&err.code;
    if(c==='declined') return;
    /* 아티팩트 쪽 저장이 막혀 있을 때도 브라우저 저장은 대개 열려 있다 */
    if(c==='extension_not_enabled'||c==='too_large'){
      try{ blobSave(filename,data,mime); toast(filename+' 저장'); return; }catch(e){}
    }
    if(c==='extension_not_enabled'){ toast('이 형식은 이 계정에서 아직 열려 있지 않습니다. 인쇄를 사용하십시오.',true); return; }
    if(c==='rate_limited'){ toast('저장 요청이 몰렸습니다. 잠시 후 다시 시도하십시오.',true); return; }
    if(c==='too_large'){ toast('파일이 너무 큽니다.',true); return; }
    toast('저장하지 못했습니다: '+(err&&err.message||c||'알 수 없는 오류'),true);
  }
}
document.getElementById('btn-docx').onclick=async()=>{
  if(!cur) return;
  if(cur.vol){
    toast('Word 문서 작성 중…');
    await new Promise(r=>setTimeout(r,20));
    const d=mbDocx(cur.vol.book,cur.vol.units);
    await save(fname('docx'), d.buffer.slice(0));
    return;
  }
  const src=cur.ws.source||'';
  const data = curTab==='b'
    ? baekjiDocx(Object.assign({},cur.ws.baekji,{__source:src,__page:cur.item.page}),showKey)
    : popquizDocx(Object.assign({},cur.ws.popquiz,{__source:src,__page:cur.item.page}),showKey);
  await save(fname('docx'), data.buffer.slice(0));
};
document.getElementById('btn-pdf').onclick=async()=>{
  if(!cur) return;
  toast('PDF 렌더링 중…');
  await new Promise(r=>setTimeout(r,20));
  const ops=curOps();
  const cvs=ops.pages.map(p=>opsToCanvas(p,2.6));
  const pdf=buildPDF(cvs);
  await save(fname('pdf'), pdf.buffer.slice(0));
};

function toast(msg,bad){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.toggle('bad',!!bad); t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3400);
}

/* ============================================================
   15. CHROME
   ============================================================ */
/* ── 은하 선택 세그먼트(헤더) + 모드에 따른 크롬 동기화 ── */
function buildGalPick(){
  const el=document.getElementById('gal-pick');
  if(!el) return;
  el.innerHTML='<button data-g="">UNIVERSE</button>'
    +GALAXIES.map(g=>'<button data-g="'+g.id+'" title="'+esc(g.kr)+'">'+esc(g.name)+'</button>').join('');
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    b.blur();
    if(!b.dataset.g){ toUniverse(); return; }
    const g=GALAXIES.find(x=>x.id===b.dataset.g);
    if(g) enterGalaxy(g);
  });
  syncGalPick();
}
function syncGalPick(){
  document.querySelectorAll('#gal-pick button').forEach(b=>{
    const on=universeMode? !b.dataset.g : (!!b.dataset.g&&b.dataset.g===ACTIVE.id);
    b.setAttribute('aria-pressed',on);
  });
}
function syncGalaxyChrome(){
  document.getElementById('tab-b').textContent=TR.recall;
  document.getElementById('tab-p').textContent=TR.check;
  const bs=document.getElementById('brand-sub');
  if(bs) bs.textContent = universeMode ? '옳은영어 커리큘럼 유니버스' : (ACTIVE.kr+' · '+ACTIVE.tagline);
  const gf=document.getElementById('grade-filter');
  if(gf) gf.style.display = universeMode ? 'none' : 'flex';
  const lg=document.getElementById('legend');
  if(lg) lg.style.visibility = universeMode ? 'hidden' : 'visible';
  ['btn-all','btn-home'].forEach(id=>{
    const b=document.getElementById(id);
    if(b) b.disabled=universeMode;
  });
  const bu=document.getElementById('btn-uni');
  if(bu) bu.disabled=universeMode;
  buildLegend(); buildGradeFilter(); refreshCounts(); syncAllBtn(); syncGalPick();
}

function buildGradeFilter(){
  const el=document.getElementById('grade-filter');
  const list=[{id:null,label:'전체'}].concat(DATA.grades||[]);
  el.innerHTML=list.map(g=>{
    const n=g.id? DATA.books.filter(b=>(b.grades||[]).indexOf(g.id)>=0).length : DATA.books.length;
    return '<button data-g="'+(g.id||'')+'"'+(n?'':' disabled')
      +' title="'+esc(g.label)+' · 교재 '+n+'권">'+esc(g.label)+'</button>';
  }).join('');
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>setGrade(b.dataset.g||null));
  syncGradeBtn();
}
function syncGradeBtn(){
  document.querySelectorAll('#grade-filter button').forEach(b=>
    b.setAttribute('aria-pressed', (b.dataset.g||null)===gradeFilter));
}
function setGrade(g){
  gradeFilter=g;
  syncGradeBtn();
  /* an open branch inside a hidden book has to let go */
  if(focus.length>1 && !bookShown(focus[1])) focus=[ROOT];
  cam.idle=0;
  buildLegend();
  sync();
  refreshCounts();
}
function refreshCounts(){
  if(universeMode){
    const ch=GALAXIES.reduce((t,g)=>t+g.S.DATA.books.reduce((u,b)=>u+b.chapters.length,0),0);
    const done=GALAXIES.reduce((t,g)=>t+g.S.DATA.books.reduce((u,b)=>u+b.chapters.filter(c=>!c.pending).length,0),0);
    document.getElementById('rd-nodes').textContent=String(U_UNITS);
    document.getElementById('rd-sheets').textContent=U_SHEETS+' / '+U_UNITS;
    document.getElementById('rd-ch').textContent=done+' / '+ch;
    return;
  }
  const bs=DATA.books.filter(b=>!gradeFilter||(b.grades||[]).indexOf(gradeFilter)>=0);
  const ch=bs.reduce((s,b)=>s+b.chapters.length,0);
  const un=bs.reduce((s,b)=>s+b.chapters.reduce((t,c)=>t+c.items.length,0),0);
  const sh=bs.reduce((s,b)=>s+b.chapters.reduce((t,c)=>
        t+c.items.filter(i=>DATA.worksheets[i.id]).length,0),0);
  document.getElementById('rd-nodes').textContent=String(un);
  document.getElementById('rd-sheets').textContent=sh+' / '+un;
  document.getElementById('rd-ch').textContent=
    bs.reduce((s,b)=>s+b.chapters.filter(c=>!c.pending).length,0)+' / '+ch;
}
function syncAllBtn(){
  const b=document.getElementById('btn-all');
  b.setAttribute('aria-pressed',expandAll);
  b.textContent=expandAll?'전개 해제':'전체 전개';
}
document.getElementById('btn-all').onclick=()=>{
  if(universeMode) return;
  expandAll=!expandAll;
  if(expandAll) focus=[ROOT];
  syncAllBtn(); sync();
};
document.getElementById('btn-home').onclick=()=>{ if(universeMode) return; expandAll=false; syncAllBtn(); focus=[ROOT]; sync(); };
(function(){
  const b=document.getElementById('btn-uni');
  if(b) b.onclick=()=>toUniverse();
})();
document.getElementById('btn-spin').onclick=function(){
  motionOn=!motionOn;
  this.setAttribute('aria-pressed',motionOn);
  this.textContent = motionOn?'모션 정지':'모션 시작';
  try{ localStorage.setItem('orun.spin',motionOn?'1':'0'); }catch(e){}
};
(function(){
  const b=document.getElementById('btn-spin');
  b.setAttribute('aria-pressed',motionOn);
  b.textContent = motionOn?'모션 정지':'모션 시작';
})();
document.getElementById('btn-fit').onclick=()=>{
  pitchUser=false; yawUser=false; modePose(); autoFrame=true; framePend=true; refit();
};
(function(){
  const sel=document.getElementById('fx-pick');
  sel.innerHTML=LINKFX.map(f=>'<option value="'+f.id+'">'+esc(f.label)+'</option>').join('');
  sel.value=linkFx;
  sel.onchange=e=>{ setLinkFx(e.target.value); e.target.blur(); };
})();
document.getElementById('btn-solo').onclick=function(){
  const on=document.body.classList.toggle('solo');
  this.setAttribute('aria-pressed',on);
  this.textContent=on?'패널 펼치기':'패널 접기';
  setTimeout(()=>{ resize(); autoFrame=true; framePend=true; refit(); },380);
};

/* ============================================================
   16. BOOT
   ============================================================ */
const BOOTLINES=[
  'ORUN NEXUS UNIVERSE',
  'MOUNTING 3 GALAXIES // GRAMMAR · READING · VOCAB',
  'RESOLVING '+U_BOOKS+' TEXTBOOK CORES · '+U_UNITS+' CURRICULUM NODES',
  'SHEET ENGINE // DOCX · PDF READY',
  'UNIVERSE ONLINE',
];
async function boot(){
  const el=document.getElementById('bootin');
  if(RM){ document.getElementById('boot').classList.add('gone'); return; }
  for(let i=0;i<BOOTLINES.length;i++){
    const d=document.createElement('div');
    d.className='bl'; d.style.animationDelay='0s';
    d.textContent=BOOTLINES[i];
    el.appendChild(d);
    await new Promise(r=>setTimeout(r,i===BOOTLINES.length-1?520:255));
  }
  document.getElementById('boot').classList.add('gone');
  setTimeout(()=>document.getElementById('boot').remove(),900);
}

(async function start(){
  try{ if(document.fonts&&document.fonts.ready) await document.fonts.ready; }catch(e){}
  ready=true;
  GALAXIES.forEach(g=>withGalaxy(g,()=>{ layout(); }));
  bindGalaxy(GALAXIES[0]);
  buildGalPick();
  syncGalaxyChrome();
  /* 첫 화면도 우주 모드의 제 각도로 세운다 — 이게 빠져 있어 요가 -0.42 로
     남았고, 세계의 X축이 화면 가로축과 어긋나 좌우 대칭이 성립하지 않았다. */
  modePose();
  cam.yaw=cam.tyaw; cam.pitch=cam.tpitch;
  refit(); renderRails(); renderCrumb();
  requestAnimationFrame(draw);
  boot();
})();
