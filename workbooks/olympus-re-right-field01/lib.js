/* ══════════════════════════════════════════════════════════════
   옳은영어 RE:RIGHT WORKBOOK — 조판 라이브러리
   올림포스 고급영어독해 「영미 비문학 읽기」 연계 워크북
   ══════════════════════════════════════════════════════════════ */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  WidthType, AlignmentType, BorderStyle, ShadingType, LineRuleType,
  Header, Footer, PageNumber, TabStopType, VerticalAlign
} = require("docx");

/* ── 색 토큰 (옳은영어 로고 3색 체계) ── */
const INK="2B2A28", CHAR="3A3936", NAVY="06618C", NAVY2="2E93C4";
const COOL="F3F4F5", CLINE="D8DBDE", FIELD="FFFCF0", FLINE="EEDCA4";
const YEL="FDD100", GOLD="9A7400", SUB="5A6068", FAINT="97A0A8";
const PAPER="F6FAFC", AMB="C98A1E", TEAL="2E8B7F", NAVYD="13345C", NAVYL="BFD4E4";
const HAIR="CBD8E0", WISP="E4EDF3", MINT="E5F1EF", SKY="E4EFF5", SAND="F8F0DE";

const F="Noto Sans KR", FD="Noto Sans KR Black", FO="Orbitron";
const NOB={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const noB={top:NOB,bottom:NOB,left:NOB,right:NOB};
const W=10000, GUT=760, BODY=W-GUT;

const bd=(s,c)=>({style:BorderStyle.SINGLE,size:s,color:c});
const t=(x,o={})=>new TextRun({text:x,font:o.f||F,size:o.size||19,bold:!!o.bold,
  italics:!!o.it,color:o.color||INK,underline:o.underline,characterSpacing:o.ls,
  superScript:o.sup,highlight:o.hl});
const p=(c,o={})=>new Paragraph({children:Array.isArray(c)?c:[c],
  spacing:{before:o.before??0,after:o.after??60,line:o.line??266,
    lineRule:o.exact?LineRuleType.EXACT:undefined},
  alignment:o.align,indent:o.indent,border:o.border,tabStops:o.tabs});
const cel=(c,o={})=>new TableCell({children:Array.isArray(c)?c:[c],
  width:{size:o.w,type:WidthType.DXA},
  shading:o.shade?{type:ShadingType.CLEAR,fill:o.shade}:undefined,
  borders:o.b||noB,margins:o.m||{top:50,bottom:50,left:110,right:110},
  verticalAlign:o.va||VerticalAlign.TOP,columnSpan:o.span});
const T=(ws,rows)=>new Table({columnWidths:ws,
  width:{size:ws.reduce((a,b)=>a+b,0),type:WidthType.DXA},rows});
const sp=(h)=>new Paragraph({children:[],spacing:{after:h||90,line:30,lineRule:LineRuleType.EXACT}});
const brk=()=>new Paragraph({pageBreakBefore:true,children:[new TextRun({text:"",size:2})],
  spacing:{after:0,line:20,lineRule:LineRuleType.EXACT}});

/* ── 섹션 탭 : 아웃라인 라벨 + 전폭 괘선 ── */
function tab(kr,sub,col,sym){
  const C=col||NAVY;
  return [
    T([2340,190,W-2530],[new TableRow({children:[
      cel(new Paragraph({children:[
        t(sym||"",{size:16,color:C}), t("   ",{size:16}),
        t(kr,{f:FD,size:20,color:INK}),
      ],alignment:AlignmentType.CENTER,spacing:{after:0,line:250}}),
        {w:2340,shade:"FFFFFF",va:VerticalAlign.CENTER,
         b:{top:bd(6,C),bottom:bd(6,C),left:bd(6,C),right:bd(6,C)},
         m:{top:72,bottom:76,left:110,right:110}}),
      cel(p(t(""),{after:0}),{w:190,m:{top:0,bottom:0,left:0,right:0}}),
      cel(new Paragraph({children:[t(sub||"",{size:15,color:SUB})],spacing:{after:0,line:230}}),
        {w:W-2530,va:VerticalAlign.BOTTOM,
         b:{top:NOB,left:NOB,right:NOB,bottom:bd(6,C)},
         m:{top:72,bottom:62,left:56,right:0}}),
    ]})]),
    sp(130),
  ];
}

/* ── R-스텝 헤더 : 코드칩 + 제목 + 우측 러닝라인 ── */
function rHead(code,kr,sub,col){
  const C=col||NAVY;
  return [T([980,150,W-1130],[new TableRow({children:[
    cel(new Paragraph({children:[t(code,{f:FO,size:17,bold:true,color:"FFFFFF"})],
      alignment:AlignmentType.CENTER,spacing:{after:0,line:230},
      border:{bottom:bd(8,YEL)}}),
      {w:980,shade:C,va:VerticalAlign.CENTER,m:{top:62,bottom:56,left:0,right:0}}),
    cel(p(t(""),{after:0}),{w:150,m:{top:0,bottom:0,left:0,right:0}}),
    cel(new Paragraph({children:[
        t(kr,{f:FD,size:18,color:INK}),
        t("   "+(sub||""),{size:14,color:SUB}),
      ],spacing:{after:0,line:240}}),
      {w:W-1130,va:VerticalAlign.CENTER,
       b:{top:NOB,left:NOB,right:NOB,bottom:bd(5,C)},
       m:{top:60,bottom:56,left:0,right:0}}),
  ]})]),sp(105)];
}

/* ── 지문/보기 박스 : 회색 = 읽는 곳 ── */
function box(paras,o={}){
  return T([W],[new TableRow({children:[cel(paras,{w:W,shade:o.shade||COOL,
    b:{top:bd(12,o.top||NAVY),bottom:bd(4,GOLD),left:NOB,right:NOB},
    m:o.m||{top:140,bottom:140,left:230,right:230}})]})]);
}
/* ── 작업 영역 : 크림 = 쓰는 곳 ── */
const LB=bd(18,YEL);
function fieldRow(paras,o={}){
  return new TableRow({cantSplit:true,children:[cel(paras,{w:o.w||W,shade:o.shade||FIELD,
    b:{top:NOB,bottom:o.line?bd(4,FLINE):NOB,left:LB,right:NOB},
    m:o.m||{top:110,bottom:110,left:210,right:210}})]});
}
function field(paras,o={}){ return T([o.w||W],[fieldRow(paras,o)]); }
function writeField(n,h,headParas){
  const rows=[];
  if(headParas) rows.push(fieldRow(headParas,{m:{top:110,bottom:50,left:210,right:210}}));
  for(let i=0;i<n;i++)
    rows.push(fieldRow(p(t("",{size:2}),{after:0,line:30,exact:true}),
      {line:true,m:{top:Math.round((h||320)/2),bottom:Math.round((h||320)/2),left:210,right:210}}));
  return T([W],rows);
}
/* ── 문항 머리 ── */
function ask(n,stem,pts,col){
  const C=col||NAVY;
  return T([GUT,BODY],[new TableRow({children:[
    cel(new Paragraph({children:[t(n,{f:FD,size:23,color:C})],
      alignment:AlignmentType.CENTER,spacing:{after:0,line:280},
      border:{bottom:bd(6,YEL)}}),
      {w:GUT,va:VerticalAlign.CENTER,m:{top:20,bottom:20,left:0,right:130}}),
    cel(new Paragraph({children:[t(stem,{size:18,bold:true}),
      ...(pts?[t("   ["+pts+"]",{size:14,color:FAINT})]:[])],
      spacing:{after:0,line:262}}),{w:BODY,m:{top:26,bottom:26,left:0,right:0}}),
  ]})]);
}
const ch=(x,o={})=>p([t(x,{size:o.size||18})],{after:o.after??8,
  indent:{left:400,hanging:180},line:o.line||240});
const note=(x)=>p([t(x,{size:14,color:SUB})],{after:60,indent:{left:400},line:220});
const tagline=(x,after)=>p([t(x,{size:15,bold:true,color:NAVY2})],{after:after??70,line:215});

/* ── 보기 띠 ── */
function bogi(items,label){
  return T([W],[new TableRow({children:[cel(
    p([t((label||"보기")+"   ",{size:15,bold:true,color:NAVY2}),
       t(items,{size:17})],{after:0,align:AlignmentType.CENTER,line:250}),
    {w:W,shade:PAPER,b:{top:bd(4,HAIR),bottom:bd(4,HAIR),left:NOB,right:NOB},
     m:{top:85,bottom:85,left:170,right:170}})]})]);
}

/* ── 지문 렌더 : ‹...› = 밑줄강조,  «...» = 굵게 ── */
function segRuns(s,size){
  const out=[]; let buf=""; let i=0;
  const flush=(o)=>{ if(buf){ out.push(t(buf,Object.assign({size},o))); buf=""; } };
  while(i<s.length){
    const c=s[i];
    if(c==="‹"){ flush(); const j=s.indexOf("›",i);
      out.push(t(s.slice(i+1,j),{size,underline:{}})); i=j+1; continue; }
    if(c==="«"){ flush(); const j=s.indexOf("»",i);
      out.push(t(s.slice(i+1,j),{size,bold:true,it:true})); i=j+1; continue; }
    buf+=c; i++;
  }
  flush(); return out;
}
function passageRuns(SENT,size){
  const z=size||18, out=[];
  SENT.forEach((s,i)=>{
    out.push(t(String(i+1),{size:Math.round(z*0.7),bold:true,color:GOLD,sup:true}));
    out.push(t(" ",{size:z}));
    segRuns(s,z).forEach(r=>out.push(r));
    out.push(t("  ",{size:z}));
  });
  return out;
}
/* 축약 재수록 (라벨 + 회색 지문) */
function reprint(SENT,size,label){
  return T([GUT,BODY],[new TableRow({children:[
    cel(new Paragraph({children:[t(label||"본문",{size:14,bold:true,color:"FFFFFF"})],
      alignment:AlignmentType.CENTER,spacing:{after:0,line:195}}),
      {w:GUT,shade:CHAR,m:{top:42,bottom:42,left:0,right:0}}),
    cel(p(passageRuns(SENT,size||15),{line:230,after:0,align:AlignmentType.JUSTIFIED}),
      {w:BODY,shade:COOL,m:{top:95,bottom:95,left:165,right:175}}),
  ]})]);
}

/* ── 표 헤더 ── */
function thead(labels,ws,col,center){
  const C=col||NAVY;
  return new TableRow({children:labels.map((h,i)=>cel(
    new Paragraph({children:[t(h,{size:15,bold:true,color:C})],
      alignment:(center&&center.includes(i))||i===0?AlignmentType.CENTER:AlignmentType.LEFT,
      spacing:{after:0,line:210}}),
    {w:ws[i],m:{top:50,bottom:54,left:i===0?0:130,right:70},
     b:{top:bd(12,C),bottom:bd(4,HAIR),left:NOB,right:NOB}}))});
}
function trow(cells,ws,o={}){
  return new TableRow({cantSplit:true,children:cells.map((c,i)=>cel(
    Array.isArray(c)?c:new Paragraph({children:Array.isArray(c)?c:[c],
      alignment:(o.center&&o.center.includes(i))||i===0&&!o.leftFirst?AlignmentType.CENTER:AlignmentType.LEFT,
      spacing:{after:0,line:o.line||236}}),
    {w:ws[i],shade:o.shade&&o.shade[i],va:VerticalAlign.CENTER,
     m:{top:o.pad||62,bottom:o.pad||62,left:i===0?0:130,right:70},
     b:{top:NOB,bottom:bd(3,o.rule||WISP),left:NOB,right:NOB}}))});
}
/* 크림 답란 셀 (표 안) */
const blankCell=(w,pad)=>cel(p(t("",{size:2}),{after:0,line:30,exact:true}),
  {w,shade:FIELD,va:VerticalAlign.CENTER,m:{top:pad||95,bottom:pad||95,left:130,right:70},
   b:{top:NOB,bottom:bd(3,FLINE),left:bd(10,YEL),right:NOB}});

/* ── 화살표 플로차트 ── */
function flow(cards){
  const n=cards.length;
  const ARW=340;
  const cw=Math.floor((W-ARW*(n-1))/n);
  const ws=[]; const cells=[];
  cards.forEach((c,i)=>{
    if(i){ ws.push(ARW); cells.push(cel(
      new Paragraph({children:[t("›",{f:FD,size:30,color:MIDG(i)})],
        alignment:AlignmentType.CENTER,spacing:{after:0,line:300}}),
      {w:ARW,va:VerticalAlign.CENTER,m:{top:0,bottom:0,left:0,right:0}})); }
    ws.push(cw);
    const head=new Paragraph({children:[t(c.tag,{size:14,bold:true,color:"FFFFFF"})],
      alignment:AlignmentType.CENTER,spacing:{after:70,line:200}});
    cells.push(cel([
      T([cw-460],[new TableRow({children:[cel(head,{w:cw-460,shade:c.tagCol||NAVY,
        m:{top:34,bottom:36,left:0,right:0}})]})]),
      sp(60),
      ...c.lines.map(L=>p(L,{after:26,line:238,align:AlignmentType.LEFT})),
    ],{w:cw,shade:c.shade||SKY,va:VerticalAlign.TOP,
       b:{top:bd(4,c.line||HAIR),bottom:bd(4,c.line||HAIR),left:bd(4,c.line||HAIR),right:bd(4,c.line||HAIR)},
       m:{top:120,bottom:130,left:170,right:170}}));
  });
  return T(ws,[new TableRow({children:cells})]);
}
const MIDG=()=>"8FB8CE";

/* ── 정보 카드 (Insight) ── */
function card(title,paras,col,shade){
  const C=col||TEAL;
  return T([W],[new TableRow({children:[cel([
    new Paragraph({children:[t(title,{f:FD,size:16,color:C})],spacing:{after:75,line:230}}),
    ...paras,
  ],{w:W,shade:shade||"FFFFFF",
     b:{top:bd(6,C),bottom:bd(6,C),left:bd(6,C),right:bd(6,C)},
     m:{top:130,bottom:130,left:220,right:220}})]})]);
}

module.exports={Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,ImageRun,
  WidthType,AlignmentType,BorderStyle,ShadingType,LineRuleType,Header,Footer,PageNumber,
  TabStopType,VerticalAlign,fs,path,
  INK,CHAR,NAVY,NAVY2,COOL,CLINE,FIELD,FLINE,YEL,GOLD,SUB,FAINT,PAPER,AMB,TEAL,NAVYD,NAVYL,
  HAIR,WISP,MINT,SKY,SAND,F,FD,FO,NOB,noB,W,GUT,BODY,
  bd,t,p,cel,T,sp,brk,tab,rHead,box,field,fieldRow,writeField,ask,ch,note,tagline,bogi,
  segRuns,passageRuns,reprint,thead,trow,blankCell,flow,card};
