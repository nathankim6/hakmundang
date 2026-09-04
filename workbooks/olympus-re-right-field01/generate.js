const L = require("./lib.js");
const { THEMES } = require("./data.js");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  WidthType, AlignmentType, BorderStyle, ShadingType, LineRuleType,
  Header, Footer, PageNumber, TabStopType, VerticalAlign, fs, path,
  INK, CHAR, NAVY, NAVY2, COOL, CLINE, FIELD, FLINE, YEL, GOLD, SUB, FAINT,
  PAPER, AMB, TEAL, NAVYD, NAVYL, HAIR, WISP, MINT, SKY, SAND, F, FD, FO,
  NOB, noB, W, GUT, BODY, bd, t, p, cel, T, sp, brk, tab, rHead, box, field,
  fieldRow, writeField, ask, ch, note, tagline, bogi, segRuns, passageRuns,
  reprint, thead, trow, blankCell, flow, card
} = L;

const ROOT = __dirname;
const ASSETS = path.join(ROOT, "assets");
const OUT = process.env.WB_OUT || path.join(ROOT, "out.docx");
const K = [];

/* ═══════════════════ 공통 파츠 ═══════════════════ */
function unitBanner(){
  return T([1020,220,1420,4900,2440],[new TableRow({children:[
    cel(new Paragraph({children:[new ImageRun({type:"png",
      data:fs.readFileSync(path.join(ASSETS,"logos","orun_mark.png")),
      transformation:{width:42,height:36}})],
      alignment:AlignmentType.CENTER,spacing:{after:0}}),
      {w:1020,shade:"FFFFFF",va:VerticalAlign.CENTER,m:{top:60,bottom:60,left:80,right:80}}),
    cel(p(t(""),{after:0}),{w:220,shade:NAVYD,m:{top:0,bottom:0,left:0,right:0}}),
    cel([new Paragraph({children:[t("FIELD",{f:FO,size:11,bold:true,color:YEL,ls:26})],spacing:{after:10,line:160}}),
        new Paragraph({children:[t("01",{f:FO,size:34,bold:true,color:"FFFFFF"})],spacing:{after:0,line:400}})],
      {w:1420,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:100,bottom:105,left:0,right:0}}),
    cel([new Paragraph({children:[t("Art & Literature",{f:FD,size:26,color:"FFFFFF"})],spacing:{after:14,line:330}}),
        new Paragraph({children:[t("예술 · 문학   |   Theme 01–05 + Field Review",{size:14,color:NAVYL})],spacing:{after:0,line:210}})],
      {w:4900,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:100,bottom:105,left:0,right:80}}),
    cel([new Paragraph({children:[t("RE:RIGHT WORKBOOK",{f:FO,size:10,bold:true,color:YEL,ls:14})],
          alignment:AlignmentType.RIGHT,spacing:{after:24,line:170}}),
        new Paragraph({children:[t("올림포스 고급영어독해",{size:14,bold:true,color:"FFFFFF"})],
          alignment:AlignmentType.RIGHT,spacing:{after:6,line:200}}),
        new Paragraph({children:[t("영미 비문학 읽기 연계",{size:12,color:NAVYL})],
          alignment:AlignmentType.RIGHT,spacing:{after:0,line:190}})],
      {w:2440,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:100,bottom:105,left:80,right:210}}),
  ]})]);
}
function themeBar(th){
  return T([1180,5620,3200],[new TableRow({children:[
    cel([new Paragraph({children:[t("THEME",{f:FO,size:10,bold:true,color:YEL,ls:20})],
          alignment:AlignmentType.CENTER,spacing:{after:8,line:150}}),
        new Paragraph({children:[t(th.no,{f:FO,size:26,bold:true,color:"FFFFFF"})],
          alignment:AlignmentType.CENTER,spacing:{after:0,line:320}})],
      {w:1180,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:72,bottom:78,left:0,right:0}}),
    cel([new Paragraph({children:[t(th.en,{f:FD,size:19,color:"FFFFFF"})],spacing:{after:10,line:250}}),
        new Paragraph({children:[t(th.ko,{size:13,color:NAVYL})],spacing:{after:0,line:200}})],
      {w:5620,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:72,bottom:78,left:200,right:80}}),
    cel([new Paragraph({children:[t("Words  "+th.words,{f:FO,size:11,bold:true,color:YEL})],
          alignment:AlignmentType.RIGHT,spacing:{after:10,line:180}}),
        new Paragraph({children:[t(th.src,{size:12,color:NAVYL})],
          alignment:AlignmentType.RIGHT,spacing:{after:0,line:190}})],
      {w:3200,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:72,bottom:78,left:60,right:200}}),
  ]})]);
}
/* 매핑 칩 : 원서 요소 → 워크북 활동 */
function mapChip(from){
  return p([t("원서 ",{size:13,bold:true,color:GOLD}),
            t(from,{size:13,color:SUB}),
            t("   →   ",{size:13,color:YEL,bold:true}),
            t("워크북 활동으로 전환",{size:13,color:SUB})],{after:80,line:210});
}

/* ═══════════════════ 1면 · UNIT OPENER ═══════════════════ */
K.push(unitBanner());
K.push(sp(170));

K.push(...tab("이 워크북의 설계","원서의 모든 구성 요소를 학생이 ‘손으로 다시 만드는’ 활동으로 바꾼다.",NAVY,"◎"));
const mw=[3980,760,5260];
K.push(T(mw,[
  thead(["올림포스 고급영어독해 (원서)","","RE:RIGHT 워크북 (본 교재)"],mw,NAVY,[1]),
  ...[["Words & Phrases  어휘 정리","R1","어휘 재장착 — 영·한 양방향 인출"],
      ["Sentence Structure & Translation","R2","직독직해 — 의미 단위로 끊어 옮기기"],
      ["Key Sentence Analysis  구문 분석","R3","핵심 구문 해부 — 괄호 구조 스스로 복원"],
      ["Flow Chart  전개 구조","R4","흐름 복원 — 도입·전개·마무리 빈칸 채우기"],
      ["지문 전체","R5","요약문 완성 — 한 문장으로 압축"],
      ["Solution Guide  정답 근거","R6","조건 영작 — 주제문을 스스로 쓰기"],
      ["수능형 · 내신형 문항","R7","내신 실전 — 서술형으로 다시 묻기"]].map(r=>
    trow([t(r[0],{size:16}),
          t(r[1],{f:FO,size:15,bold:true,color:"FFFFFF"}),
          t(r[2],{size:16,bold:true,color:NAVY})],mw,
      {leftFirst:true,center:[1],shade:[null,NAVY,null],pad:70}))
]));
K.push(sp(200));

K.push(...tab("Field 1 을 관통하는 한 문장","다섯 지문은 모두 ‘표현’과 ‘실재’ 사이의 거리를 다룬다.",TEAL,"◈"));
const gw=[1140,3060,5800];
K.push(T(gw,[
  thead(["Theme","무엇과 무엇 사이인가","글이 내리는 결론"],gw,TEAL),
  ...[["01","번역본 ≠ 원작","원작의 가치·흐름·지역색은 옮겨지지 않는다 — 번역은 결국 ‘양보’다."],
      ["02","이미지 ≠ 사물","직접 전달되는 듯한 이미지조차 사물 그 자체가 아니라 ‘표현’일 뿐이다."],
      ["03","연습 ≠ 공연","정확성(엔지니어)은 예술적 자유(조종사)의 조건이지 목적이 아니다."],
      ["04","보호된 세계 ≠ 실제 세계","위험을 모두 없앤 세계는 사람을 지켜 주지 못하고 나약하게 만든다."],
      ["05","혼자 읽은 이해 ≠ 대화로 얻은 이해","명확한 이해는 번개처럼 오지 않고 대화라는 과정에서 나타난다."]].map(r=>
    trow([t(r[0],{f:FO,size:16,bold:true,color:TEAL}),
          t(r[1],{size:16,bold:true}),
          t(r[2],{size:15})],gw,{pad:78,rule:MINT}))
]));
K.push(sp(150));
K.push(field([p([t("한 걸음 더  ",{size:14,bold:true,color:GOLD}),
  t("다섯 지문을 다 푼 뒤 18면의 ",{size:15}),
  t("FIELD INSIGHT",{size:15,bold:true,color:NAVY}),
  t(" 논술 문항으로 돌아온다. 위 표의 오른쪽 칸이 그대로 답의 재료가 된다.",{size:15})],
  {after:0,line:245})]));
K.push(sp(190));

K.push(...tab("학습 기록","한 Theme = 3면. 하루 한 Theme씩, 5일이면 한 Field가 끝난다.",AMB,"▤"));
const sw=[1140,3560,1500,1500,2300];
K.push(T(sw,[
  thead(["Theme","제목","학습일","R1–R7","다시 볼 곳"],sw,AMB,[2,3]),
  ...THEMES.map(th=>new TableRow({cantSplit:true,children:[
    cel(p(t(th.no,{f:FO,size:16,bold:true,color:AMB}),{after:0,align:AlignmentType.CENTER,line:230}),
      {w:1140,va:VerticalAlign.CENTER,m:{top:88,bottom:88,left:0,right:60},b:{bottom:bd(3,SAND),top:NOB,left:NOB,right:NOB}}),
    cel(p(t(th.en,{size:15}),{after:0,line:230}),
      {w:3560,va:VerticalAlign.CENTER,m:{top:88,bottom:88,left:120,right:60},b:{bottom:bd(3,SAND),top:NOB,left:NOB,right:NOB}}),
    blankCell(1500,88),
    cel(p([t("     /  7",{size:15,color:FAINT})],{after:0,align:AlignmentType.CENTER,line:230}),
      {w:1500,shade:FIELD,va:VerticalAlign.CENTER,m:{top:88,bottom:88,left:60,right:60},b:{bottom:bd(3,FLINE),top:NOB,left:bd(10,YEL),right:NOB}}),
    blankCell(2300,88),
  ]})),
]));

/* ═══════════════════ Theme 면 ═══════════════════ */
THEMES.forEach((th)=>{
  /* ── 면 1 : 지문 + R1 ── */
  K.push(brk());
  K.push(themeBar(th));
  K.push(sp(150));
  K.push(...tab("지문 다시 읽기","문장 어깨번호를 확인하며 읽는다. 이후 모든 활동이 이 번호로 문장을 지목한다.",NAVY,"≡"));
  K.push(box([p(passageRuns(th.sent,18),{line:322,after:0,align:AlignmentType.JUSTIFIED})],
    {m:{top:185,bottom:185,left:230,right:230}}));
  K.push(sp(200));
  K.push(...rHead("R1","어휘 재장착","원서 Words & Phrases → 영어에서 우리말로, 우리말에서 영어로 인출한다.",TEAL));
  const vw=[500,2180,2320,500,2180,2320];
  K.push(T(vw,[
    thead(["","영어 표현","우리말 뜻을 쓰시오","","우리말 뜻","영어 표현을 쓰시오"],vw,TEAL),
    ...[0,1,2,3,4,5].map(i=>new TableRow({cantSplit:true,children:[
      cel(p(t(String(i+1),{size:14,bold:true,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:215}),
        {w:500,va:VerticalAlign.CENTER,m:{top:132,bottom:132,left:0,right:0},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
      cel(p(t(th.r1L[i][0],{size:17,bold:true,color:NAVY}),{after:0,line:225}),
        {w:2180,va:VerticalAlign.CENTER,m:{top:132,bottom:132,left:110,right:50},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
      blankCell(2320,132),
      cel(p(t(String(i+7),{size:14,bold:true,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:215}),
        {w:500,va:VerticalAlign.CENTER,m:{top:132,bottom:132,left:0,right:0},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
      cel(p(t(th.r1R[i][0],{size:16}),{after:0,line:225}),
        {w:2180,va:VerticalAlign.CENTER,m:{top:132,bottom:132,left:110,right:50},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
      blankCell(2320,132),
    ]})),
  ]));
  K.push(sp(190));
  K.push(...rHead("R1+","본문에서 확인하기","위 어휘가 실제로 쓰인 문장을 지문에서 되짚는다.",TEAL));
  const pnum=th.r1p.map(wd=>th.sent.findIndex(x=>x.toLowerCase().includes(wd.toLowerCase()))+1);
  const pw2=[2200,300,2200,300,2200,300,2200,300];
  K.push(T(pw2,[
    new TableRow({cantSplit:true,children:th.r1p.flatMap((wd,i)=>[
      cel(p(t(wd,{size:16,bold:true,color:NAVY}),{after:0,align:AlignmentType.CENTER,line:220}),
        {w:2200,shade:COOL,va:VerticalAlign.CENTER,m:{top:80,bottom:80,left:40,right:40},
         b:{top:bd(6,TEAL),bottom:bd(3,CLINE),left:NOB,right:NOB}}),
      cel(p(t("",{size:2}),{after:0,line:20,exact:true}),{w:300,m:{top:0,bottom:0,left:0,right:0}}),
    ])}),
    new TableRow({cantSplit:true,children:th.r1p.flatMap((wd,i)=>[
      cel(p(t("문장 번호",{size:13,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:230}),
        {w:2200,shade:FIELD,va:VerticalAlign.CENTER,m:{top:120,bottom:120,left:40,right:40},
         b:{top:NOB,bottom:bd(3,FLINE),left:bd(10,YEL),right:NOB}}),
      cel(p(t("",{size:2}),{after:0,line:20,exact:true}),{w:300,m:{top:0,bottom:0,left:0,right:0}}),
    ])}),
  ]));

  /* ── 면 2 : R2 + R3 + R4 ── */
  K.push(brk());
  K.push(...rHead("R2","직독직해","원서 Sentence Structure & Translation → 끊어진 의미 단위를 우리말로 옮긴다.",AMB));
  th.r2.forEach((c,i)=>{
    K.push(T([700,W-700],[new TableRow({children:[
      cel(p(t("문장 "+c.n,{size:13,bold:true,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:190}),
        {w:700,shade:AMB,va:VerticalAlign.CENTER,m:{top:60,bottom:60,left:0,right:0}}),
      cel(p(segRuns(c.en,16),{after:0,line:256}),
        {w:W-700,shade:COOL,m:{top:120,bottom:120,left:150,right:150}}),
    ]})]));
    K.push(writeField(2,540));
    if(i<th.r2.length-1) K.push(sp(150));
  });
  K.push(sp(190));
  K.push(...rHead("R3","핵심 구문 해부","원서 Key Sentence Analysis → 괄호 구조를 스스로 복원한다.",NAVY));
  K.push(T([760,W-760],[new TableRow({children:[
    cel(p(t(th.r3.line,{f:FO,size:13,bold:true,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:190}),
      {w:760,shade:NAVY,va:VerticalAlign.CENTER,m:{top:60,bottom:60,left:0,right:0}}),
    cel(p(t(th.r3.quote,{size:16}),{after:0,line:258}),
      {w:W-760,shade:COOL,m:{top:118,bottom:118,left:150,right:150}}),
  ]})]));
  K.push(sp(130));
  const qw=[560,4740,4700];
  K.push(T(qw,[
    thead(["","묻는 것","답을 쓰시오"],qw,NAVY),
    ...th.r3.q.map((q,i)=>new TableRow({cantSplit:true,children:[
      cel(p(t("("+(i+1)+")",{size:14,bold:true,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:215}),
        {w:560,va:VerticalAlign.CENTER,m:{top:132,bottom:132,left:0,right:0},b:{bottom:bd(3,WISP),top:NOB,left:NOB,right:NOB}}),
      cel(p(t(q[0],{size:16}),{after:0,line:230}),
        {w:4740,va:VerticalAlign.CENTER,m:{top:132,bottom:132,left:110,right:60},b:{bottom:bd(3,WISP),top:NOB,left:NOB,right:NOB}}),
      blankCell(4700,132),
    ]})),
  ]));
  K.push(sp(130));
  K.push(writeField(2,540,[p([t("위 문장을 우리말로 옮기시오.",{size:15,bold:true,color:NAVY2})],{after:0,line:220})]));
  K.push(sp(190));
  K.push(...rHead("R4","흐름 복원","원서 Flow Chart → 지문의 전개를 세 단계로 되살린다.",NAVY));
  K.push(flow(th.r4.cards.map(c=>({tag:c.tag,tagCol:c.hot?TEAL:NAVY,
    shade:c.hot?MINT:SKY,line:c.hot?"9CC8C0":HAIR,
    lines:[c.lines.map(x=>t(x,{size:14}))].map((r,i)=>r).length?c.lines.map(x=>[t(x,{size:14})]):[]}))));
  K.push(sp(140));
  K.push(bogi(th.r4.bogi));
  K.push(sp(140));
  K.push(writeField(2,470,[p([t("① → ② → ③ 을 잇는 한 문장으로 이 글의 흐름을 요약하시오.",
    {size:15,bold:true,color:NAVY2})],{after:0,line:220})]));

  /* ── 면 3 : R5 + R6 + R7 + KEY POINT ── */
  K.push(brk());
  K.push(...rHead("R5","요약문 완성","지문 전체 → 한 문장으로 압축한다.",TEAL));
  K.push(bogi(th.r5.bogi));
  K.push(sp(120));
  const sumRuns=[]; const LETTERS=["(A)","(B)","(C)","(D)"];
  th.r5.text.forEach((seg,i)=>{ sumRuns.push(t(seg[0],{size:17}));
    if(i<th.r5.text.length-1) sumRuns.push(t("                    ",{size:17,underline:{}})); });
  K.push(field([p(sumRuns,{after:0,line:392,align:AlignmentType.JUSTIFIED})],
    {m:{top:195,bottom:195,left:230,right:230}}));
  K.push(sp(190));
  K.push(...rHead("R6","조건 영작","Solution Guide의 근거 문장 → 스스로 다시 쓴다.",AMB));
  K.push(p([t(th.r6.ko,{size:17,bold:true})],{indent:{left:230},after:55,line:250}));
  K.push(p([t("조건  ",{size:14,bold:true,color:NAVY2}),t(th.r6.cond,{size:14,color:SUB})],
    {indent:{left:230},after:80,line:220}));
  K.push(bogi(th.r6.bogi));
  K.push(sp(110));
  K.push(writeField(2,540));
  K.push(sp(190));
  K.push(...rHead("R7","내신 실전","원서 수능형·내신형 문항 → 서술형으로 다시 묻는다.",NAVY));
  th.r7.forEach((q,i)=>{
    K.push(ask("0"+(i+1),q.stem,q.pts));
    K.push(sp(70));
    K.push(writeField(q.lines+1,510));
    if(i<th.r7.length-1) K.push(sp(150));
  });
  K.push(sp(170));
  K.push(card("KEY POINT",[p(segRuns(th.kpt,15),{after:0,line:250,align:AlignmentType.JUSTIFIED})],GOLD,FIELD));
});

/* ═══════════════════ FIELD REVIEW PLUS · 17면 ═══════════════════ */
K.push(brk());
K.push(T([2600,7400],[new TableRow({children:[
  cel([new Paragraph({children:[t("FIELD",{f:FO,size:10,bold:true,color:YEL,ls:22})],
        alignment:AlignmentType.CENTER,spacing:{after:8,line:150}}),
      new Paragraph({children:[t("REVIEW",{f:FO,size:19,bold:true,color:"FFFFFF"})],
        alignment:AlignmentType.CENTER,spacing:{after:0,line:250}})],
    {w:2600,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:86,bottom:90,left:0,right:0}}),
  cel([new Paragraph({children:[t("PLUS — 다섯 지문을 한 번에 되짚는다",{f:FD,size:19,color:"FFFFFF"})],spacing:{after:10,line:250}}),
      new Paragraph({children:[t("원서 Review Test의 어휘·어법 유형을 Field 1 전체 범위로 확장했다.",{size:13,color:NAVYL})],spacing:{after:0,line:200}})],
    {w:7400,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:86,bottom:90,left:220,right:200}}),
]})]));
K.push(sp(180));
K.push(...tab("A. 어휘 통합","보기에서 알맞은 말을 골라 빈칸에 쓰시오. (각 1회씩 사용)",TEAL,"A"));
K.push(bogi("concession · contrived · disciplines · endurance · epiphany · guise · manifestation · sheltered · terminology"));
K.push(sp(130));
const VQ=[
 ["Literature is the ______ of the author's emotions and inspirations.","T01"],
 ["A deliberate representation is a ______ after all.","T01"],
 ["At the moment of emotional intensity or ______, the work naturally flows under the author's hand.","T01"],
 ["Words are put together in a ______ grammar that everyone in a culture uses.","T02"],
 ["The very act of playing the piano is physical: it involves reflex and ______.","T03"],
 ["Maleficent appears in her negative ______ as the Queen of the Underworld.","T04"],
 ["Aurora is no longer just a ______ figure but someone ready to take charge.","T04"],
 ["Literary study, like all ______, has developed its own ______ and techniques.","T05"],
];
const vqw=[560,6800,2640];
K.push(T(vqw,[
  thead(["","문장","답을 쓰시오"],vqw,TEAL),
  ...VQ.map((q,i)=>new TableRow({cantSplit:true,children:[
    cel(p(t("("+(i+1)+")",{size:14,bold:true,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:215}),
      {w:560,va:VerticalAlign.CENTER,m:{top:168,bottom:168,left:0,right:0},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
    cel(p([t(q[0],{size:16}),t("   "+q[1],{size:12,color:FAINT})],{after:0,line:238}),
      {w:6800,va:VerticalAlign.CENTER,m:{top:168,bottom:168,left:110,right:60},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
    blankCell(2640,168),
  ]})),
]));
K.push(sp(190));
K.push(...tab("B. 어법 통합","네모 안에서 어법상 알맞은 표현을 고르시오.",NAVY,"[ ]"));
const GQ=[
 ["It is true  ⟦ that / what ⟧  scholars and even common readers can use translations, but how  ⟦ faithful / faithfully ⟧  is a translation to the original?","Theme 01"],
 ["Somehow a thing  ⟦ seen / seeing ⟧  directly — or through a visual representation —  ⟦ makes / to make ⟧  us feel closer to some actual reality.","Theme 02"],
 ["A pianist has little time to spare, so it's important that those spare hours  ⟦ be / are ⟧  used well.","Theme 03"],
 ["They continue with their strategy of  ⟦ introducing / removing ⟧  all dangerous things, but in doing so they leave their daughter weak.","Theme 04"],
 ["Literature itself is a vast conversation  ⟦ which / in which ⟧  we most fully  ⟦ interfere / participate ⟧  when we enter into actual conversation.","Theme 05"],
];
const gqw=[560,6800,2640];
K.push(T(gqw,[
  thead(["","문장","고른 표현을 쓰시오"],gqw,NAVY),
  ...GQ.map((q,i)=>new TableRow({cantSplit:true,children:[
    cel(p(t("("+(i+1)+")",{size:14,bold:true,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:215}),
      {w:560,va:VerticalAlign.CENTER,m:{top:158,bottom:158,left:0,right:0},b:{bottom:bd(3,WISP),top:NOB,left:NOB,right:NOB}}),
    cel(p([t(q[0],{size:16}),t("   "+q[1].replace("Theme ","T"),{size:12,color:FAINT})],{after:0,line:242}),
      {w:6800,va:VerticalAlign.CENTER,m:{top:158,bottom:158,left:110,right:60},b:{bottom:bd(3,WISP),top:NOB,left:NOB,right:NOB}}),
    blankCell(2640,158),
  ]})),
]));

/* ── 18면 ── */
K.push(brk());
K.push(...tab("C. 주제문 매칭","다음 영어 문장은 각각 어느 Theme의 주제문인가? 번호를 쓰시오.",AMB,"≡"));
const MQ=[
 ["An image, whether photographed, painted, or digitized, is not the thing itself.","02"],
 ["The value and enjoyment of the original may be lost through translation.","01"],
 ["Literature itself is a vast, ongoing, ever-evolving conversation in which we most fully participate.","05"],
 ["Prepare assiduously at home, but when onstage accept the situation at hand.","03"],
 ["Removing all dangerous things leaves their daughter naive, immature and weak.","04"],
];
const mqw=[560,7440,2000];
K.push(T(mqw,[
  thead(["","주제문","Theme"],mqw,AMB,[2]),
  ...MQ.map((q,i)=>new TableRow({cantSplit:true,children:[
    cel(p(t("("+(i+1)+")",{size:14,bold:true,color:FAINT}),{after:0,align:AlignmentType.CENTER,line:215}),
      {w:560,va:VerticalAlign.CENTER,m:{top:176,bottom:176,left:0,right:0},b:{bottom:bd(3,SAND),top:NOB,left:NOB,right:NOB}}),
    cel(p(t(q[0],{size:16}),{after:0,line:238}),
      {w:7440,va:VerticalAlign.CENTER,m:{top:176,bottom:176,left:110,right:60},b:{bottom:bd(3,SAND),top:NOB,left:NOB,right:NOB}}),
    blankCell(2000,176),
  ]})),
]));
K.push(sp(200));
K.push(...tab("D. FIELD INSIGHT","Field 1을 관통하는 하나의 질문에 답한다. 1면의 표를 재료로 쓴다.",NAVY,"◈"));
K.push(box([p([t("Field 1의 다섯 지문은 모두 ",{size:17}),
  t("‘표현(representation)’과 ‘실재(the original)’ 사이의 거리",{size:17,bold:true,color:NAVY}),
  t("를 다룬다. 번역·이미지·연습·보호·대화라는 서로 다른 소재가 어떻게 같은 문제를 말하고 있는지, 아래 조건에 맞추어 서술하시오.",{size:17})],
  {after:0,line:290,align:AlignmentType.JUSTIFIED})],{top:NAVY}));
K.push(sp(150));
K.push(ask("01","Theme 01과 Theme 02를 근거로, ‘표현은 왜 원본을 대신할 수 없는가’를 각 지문의 표현을 인용하여 우리말 120자 내외로 서술하시오.","8점"));
K.push(sp(70));
K.push(writeField(4,600));
K.push(sp(160));
K.push(ask("02","Theme 03·04·05 중 두 편을 골라, ‘거리를 좁히기 위해 필자가 제안하는 방법’을 비교하여 우리말 120자 내외로 서술하시오.","8점"));
K.push(sp(70));
K.push(writeField(4,600));

/* ═══════════════════ 정답과 해설 ═══════════════════ */
K.push(brk());
K.push(T([2600,7400],[new TableRow({children:[
  cel([new Paragraph({children:[t("ANSWERS",{f:FO,size:10,bold:true,color:YEL,ls:16})],
        alignment:AlignmentType.CENTER,spacing:{after:8,line:150}}),
      new Paragraph({children:[t("정답과 해설",{f:FD,size:19,color:"FFFFFF"})],
        alignment:AlignmentType.CENTER,spacing:{after:0,line:260}})],
    {w:2600,shade:CHAR,va:VerticalAlign.CENTER,m:{top:86,bottom:90,left:0,right:0}}),
  cel([new Paragraph({children:[t("Field 1  Art & Literature",{f:FD,size:19,color:"FFFFFF"})],spacing:{after:10,line:250}}),
      new Paragraph({children:[t("R1–R7 · Field Review PLUS · 지문 전문 해석",{size:13,color:"C9C6C1"})],spacing:{after:0,line:200}})],
    {w:7400,shade:CHAR,va:VerticalAlign.CENTER,m:{top:86,bottom:90,left:220,right:200}}),
]})]));
K.push(sp(170));

function ansBlock(th){
  const rows=[];
  const aw=[900,9100];
  const line=(lab,txt,col)=>new TableRow({cantSplit:true,children:[
    cel(p(t(lab,{f:FO,size:14,bold:true,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:200}),
      {w:900,shade:col||NAVY,va:VerticalAlign.CENTER,m:{top:52,bottom:52,left:0,right:0}}),
    cel(p(segRuns(txt,15),{after:0,line:235}),
      {w:9100,m:{top:52,bottom:54,left:150,right:60},b:{bottom:bd(3,WISP),top:NOB,left:NOB,right:NOB}}),
  ]});
  rows.push(line("R1",th.r1L.map((x,i)=>(i+1)+". "+x[1]).join("  /  ")+"   ‖   "+
    th.r1R.map((x,i)=>(i+6)+". "+x[1]).join("  /  "),TEAL));
  rows.push(line("R2",th.r2.map(c=>"문장 "+c.n+" "+c.ko).join("   ‖   "),AMB));
  rows.push(line("R3",th.r3.q.map((q,i)=>"("+(i+1)+") "+q[1]).join("  /  ")+"   ‖   해석: "+th.r3.trans,NAVY));
  rows.push(line("R4",th.r4.ans,NAVY));
  rows.push(line("R5",th.r5.ans,TEAL));
  rows.push(line("R6",th.r6.ans,AMB));
  th.r7.forEach((q,i)=>rows.push(line("R7-"+(i+1),q.ans,NAVY)));
  return [
    T([1200,8800],[new TableRow({children:[
      cel(p(t("Theme "+th.no,{f:FD,size:15,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:215}),
        {w:1200,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:52,bottom:54,left:0,right:0}}),
      cel(p([t(th.en,{size:15,bold:true,color:NAVY}),t("   "+th.ko,{size:13,color:SUB})],{after:0,line:215}),
        {w:8800,va:VerticalAlign.CENTER,m:{top:52,bottom:54,left:150,right:0},b:{bottom:bd(5,NAVYD),top:NOB,left:NOB,right:NOB}}),
    ]})]),
    T([900,9100],rows),
    sp(150),
  ];
}
THEMES.slice(0,3).forEach(th=>K.push(...ansBlock(th)));
K.push(brk());
K.push(...tab("정답과 해설","Theme 04 – 05 · Field Review PLUS",CHAR,"✓"));
THEMES.slice(3).forEach(th=>K.push(...ansBlock(th)));
K.push(sp(60));
K.push(T([1200,8800],[new TableRow({children:[
  cel(p(t("REVIEW",{f:FO,size:13,bold:true,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:215}),
    {w:1200,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:52,bottom:54,left:0,right:0}}),
  cel(p([t("FIELD REVIEW PLUS",{size:15,bold:true,color:NAVY})],{after:0,line:215}),
    {w:8800,va:VerticalAlign.CENTER,m:{top:52,bottom:54,left:150,right:0},b:{bottom:bd(5,NAVYD),top:NOB,left:NOB,right:NOB}}),
]})]));
const rvw=[900,9100];
K.push(T(rvw,[
  ...[["A","(1) manifestation  (2) concession  (3) epiphany  (4) contrived  (5) endurance  (6) guise  (7) sheltered  (8) disciplines, terminology",TEAL],
      ["B","(1) that, faithful  (2) seen, makes  (3) be  (4) removing  (5) in which, participate",NAVY],
      ["C","(1) Theme 02  (2) Theme 01  (3) Theme 05  (4) Theme 03  (5) Theme 04",AMB],
      ["D-1","번역본은 원작의 흐름과 지역색을 옮기지 못해 ‘신중한 표현은 결국 양보’이며(Theme 01), 이미지도 직접 전달되는 듯 보이지만 결국 사물의 ‘표현’일 뿐이다(Theme 02). 두 글 모두 매개된 표현이 원본의 고유성을 잃는다는 점을 말한다.",NAVY],
      ["D-2","[예시 답안] Theme 03은 무대 밖의 근면한 연습이 무대 위의 자유를 가능케 한다고 보고, Theme 05는 타인과의 실제 대화가 명확한 이해를 만든다고 본다. 둘 다 거리를 없애는 것이 아니라 ‘과정’을 통해 좁힌다고 제안한다.",NAVY]].map(r=>
    new TableRow({cantSplit:true,children:[
      cel(p(t(r[0],{f:FO,size:14,bold:true,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:200}),
        {w:900,shade:r[2],va:VerticalAlign.CENTER,m:{top:56,bottom:56,left:0,right:0}}),
      cel(p(t(r[1],{size:15}),{after:0,line:238}),
        {w:9100,m:{top:56,bottom:58,left:150,right:60},b:{bottom:bd(3,WISP),top:NOB,left:NOB,right:NOB}}),
    ]})),
]));

/* ── 전문 해석 ── */
K.push(brk());
K.push(...tab("지문 전문 해석","문장 번호는 본문 어깨번호와 같다.",CHAR,"¶"));
THEMES.forEach((th,ti)=>{
  if(ti===3){ K.push(brk()); K.push(...tab("지문 전문 해석","Theme 04 – 05",CHAR,"¶")); }
  K.push(T([1200,8800],[new TableRow({children:[
    cel(p(t("Theme "+th.no,{f:FD,size:14,color:"FFFFFF"}),{after:0,align:AlignmentType.CENTER,line:210}),
      {w:1200,shade:NAVYD,va:VerticalAlign.CENTER,m:{top:46,bottom:48,left:0,right:0}}),
    cel(p([t(th.ko,{size:14,bold:true,color:NAVY})],{after:0,line:210}),
      {w:8800,va:VerticalAlign.CENTER,m:{top:46,bottom:48,left:150,right:0},b:{bottom:bd(5,NAVYD),top:NOB,left:NOB,right:NOB}}),
  ]})]));
  K.push(sp(70));
  const runs=[];
  th.kor.forEach((s,i)=>{ runs.push(t(String(i+1),{size:12,bold:true,color:GOLD,sup:true}));
    runs.push(t(" "+s+"  ",{size:16})); });
  K.push(box([p(runs,{after:0,line:290,align:AlignmentType.JUSTIFIED})],
    {m:{top:130,bottom:130,left:210,right:210}}));
  K.push(sp(160));
});
K.push(sp(80));
K.push(...tab("Field 1 마무리","다음 Field로 넘어가기 전에 스스로 점검한다.",TEAL,"✓"));
const ckw=[620,6180,3200];
K.push(T(ckw,[
  thead(["","점검 항목","확인"],ckw,TEAL),
  ...[["다섯 지문의 주제문을 영어로 한 문장씩 말할 수 있다."],
      ["R1 어휘 60개를 우리말·영어 양방향으로 인출할 수 있다."],
      ["Key Sentence 5개의 괄호 구조를 스스로 다시 그릴 수 있다."],
      ["Flow Chart를 보지 않고 도입–전개–마무리를 복원할 수 있다."],
      ["FIELD INSIGHT 논술 두 문항을 근거를 들어 답했다."]].map((r,i)=>
    new TableRow({cantSplit:true,children:[
      cel(p(t("□",{size:17,color:TEAL}),{after:0,align:AlignmentType.CENTER,line:220}),
        {w:620,va:VerticalAlign.CENTER,m:{top:118,bottom:118,left:0,right:0},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
      cel(p(t(r[0],{size:16}),{after:0,line:232}),
        {w:6180,va:VerticalAlign.CENTER,m:{top:118,bottom:118,left:110,right:60},b:{bottom:bd(3,MINT),top:NOB,left:NOB,right:NOB}}),
      blankCell(3200,118),
    ]})),
]));
K.push(sp(160));
K.push(card("NEXT",[p([t("Field 2  Science & Technology",{size:16,bold:true,color:NAVY}),
  t("  (본문 pp.019~030)  Theme 06–10 + Review Test",{size:15}),
  t("\n같은 R1–R7 순서로 진행한다. Field 1에서 익힌 ‘표현과 실재의 거리’라는 축은, Field 2에서 ‘관찰과 해석의 거리’로 이어진다.",{size:15})],
  {after:0,line:250})],GOLD,FIELD));

/* ═══════════════════ 문서 ═══════════════════ */
const HEAD = new Header({children:[
  new Paragraph({children:[
    t("옳은영어 ",{size:14,bold:true,color:NAVY}),
    t("ORUN ENGLISH",{f:FO,size:11,bold:true,color:GOLD,ls:14}),
    t("\t",{size:14}),
    t("RE:RIGHT WORKBOOK",{f:FO,size:10,bold:true,color:NAVY,ls:12}),
    t("   |   올림포스 고급영어독해 ",{size:12,color:SUB}),
    t("영미 비문학 읽기",{size:12,bold:true,color:INK}),
  ],tabStops:[{type:TabStopType.RIGHT,position:W}],
    spacing:{after:40,line:220},border:{bottom:bd(10,NAVYD)}}),
  sp(60),
]});
const FOOT = new Footer({children:[
  new Paragraph({children:[
    t("Field 1  Art & Literature",{size:12,color:SUB}),
    t("\t",{size:12}),
    t("",{size:12}), new TextRun({children:[PageNumber.CURRENT],font:FO,size:15,bold:true,color:NAVY}),
    t("\t",{size:12}),
    t("옳은영어 ORUN ENGLISH",{size:11,color:FAINT}),
  ],tabStops:[{type:TabStopType.CENTER,position:Math.round(W/2)},{type:TabStopType.RIGHT,position:W}],
    spacing:{before:70,after:0,line:220},border:{top:bd(4,HAIR)}}),
]});

const doc = new Document({
  styles:{default:{document:{run:{font:F,size:19,color:INK},
    paragraph:{spacing:{line:266}}}}},
  sections:[{
    properties:{page:{margin:{top:900,bottom:760,left:953,right:953},
      size:{width:11906,height:16838}}},
    headers:{default:HEAD}, footers:{default:FOOT}, children:K,
  }],
});
Packer.toBuffer(doc).then(b=>{ fs.writeFileSync(OUT,b);
  console.log("WROTE", OUT, (b.length/1024).toFixed(0)+"KB"); });
