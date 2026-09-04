const fs=require("fs");
const CSS=require("./css.js");
const {icons,scenes}=require("./art.js");
const {S:PIC,STRIP,VIG}=require("./pics.js");
const SYN=require("./syn.js");
const SYND=require("./syndrill.js");
const T=require("./content1.js").concat(require("./content2.js"));
const FL=require("./flow.js");
const EX=require("./extra.js");
T.forEach(t=>{t.fl=FL[t.no]; const e=EX[t.no]; t.flow=e.flow; t.flowBogi=e.flowBogi;
  t.why=e.why; t.src=e.src; t.kb=e.kb; t.syn=SYN[t.no]; t.synd=SYND[t.no];});
const CIR="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳".split("");
const AL="abcdef".split("");
const esc=s=>String(s).replace(/&(?![a-z#])/g,"&amp;");
const ROLE={"s":"S","s2":"S′","v":"V","v2":"V′","m":"M"};
const tok=(x,r)=>`<span class="tk ${r||""}"><em>${(r==="v"||r==="v2")?"△":"&nbsp;"}</em><b>${esc(x)}</b><i>${ROLE[r]||"&nbsp;"}</i></span>`;

const P=[]; // pages
let pn=0;

const vars=t=>`--ac:${t.accent};--tint:${t.tint};--deep:${t.deep}`;
const head=(t,right)=>`<div class="rh"><span>READING GRAPHY · PRE-HIGH · UNIT 1</span><span class="r">${right}</span></div>`;
const tab=(t)=>t&&t.no?`<div class="tab">LESSON ${t.no}</div>`:"";
const foot=(t,label)=>`<div class="rf"><span>${label}</span><b>${++pn}</b><span>옳은영어 ORUN ENGLISH</span></div>`;

/* ═══ 유닛 4면 ═══ */
T.forEach(t=>{
 const V=vars(t), L=`Unit 1 · Lesson ${t.no}`;
 /* 면 A — READING */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · ${t.en}`)}
  <div class="lh">
   <div class="ic">${icons[t.key](t.accent)}</div>
   <div><div class="eyebrow">Lesson ${t.no}</div><h1>${esc(t.en)}</h1>
    <div class="kor">${t.ko}</div><div class="goal"><b>Goal</b> &nbsp;${t.goal}</div></div>
  </div>
  <div class="rule"></div>
  <div class="read">
   <div class="psg"><span class="dc">${t.sent[0][0]}<i>①</i></span>${t.sent.map((s,i)=>
     `${i===0?"":`<sup>${CIR[i]}</sup>`}${esc(i===0?s.slice(1):s)}`).join(" ")}</div>
   <div class="side">
    <div class="card bank"><h4>Word Bank</h4><table class="bank">
     ${t.bank.map(b=>`<tr><td class="w">${b[0]}</td><td class="n">${b[1]}</td><td class="k">${b[2]}</td></tr>`).join("")}
    </table></div>
    <div class="tip"><span class="bulb"></span>${t.tip}</div>
   </div>
  </div>
  <figure><div class="art">${scenes[t.key](t.accent,t.tint,t.deep)}</div>
   <figcaption><b>${t.fig.split("  ")[0]}</b> &nbsp;${t.fig.split("  ").slice(1).join(" ")}</figcaption></figure>
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 B — WORD MATCH + ORUN FLOW 먼저 보기 */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Words & ORUN FLOW`)}
  <div class="sect">
   <div class="task"><div class="no">1</div><h3>영영풀이 매칭<span class="sub">영어 정의를 읽고 알맞은 낱말의 기호를 쓰시오.</span></h3><div class="line"></div></div>
   <div class="match">
    <div class="mcol"><h5>Word</h5>
     ${t.defs.map((d,i)=>`<div class="mrow"><div class="lab">${AL[i]}</div><div class="w">${d[0]}</div></div>`).join("")}
    </div>
    <div class="mcol"><h5>Definition</h5>
     ${t.defOrder.map((oi,i)=>`<div class="mrow"><div class="lab">${i+1}</div><div class="d">${t.defs[oi][1]}</div><div class="blank"></div></div>`).join("")}
    </div>
   </div>
  </div>
  <div class="sect">
   <div class="task"><div class="no">2</div><h3>구문분석<span class="sub">지문에 쓰인 핵심 구문 두 개를 익히고, 같은 눈으로 세 문장을 해석한다.</span></h3><div class="line"></div></div>
   ${t.syn.map(x=>`<div class="syn">
     <div class="hd"><div class="n">문장 ${x.n}</div><b>${x.name}</b></div>
     <div class="bd">
      <div class="q">${esc(x.q).replace(/«([^»]*)»/g,(m,p)=>`<u>${p}</u>`)}</div>
      <div class="d">${x.d}</div>
      <div class="k">이 문장을 우리말로 옮기시오.</div>
      <div class="aline"></div>
     </div></div>`).join("")}
   <div class="mini" style="margin:4.5mm 0 3px">위 두 구문이 쓰인 문장이다. 어떤 구문인지 확인하고 한 줄로 해석하시오.</div>
   ${t.synd.map((d,i)=>`<div class="sline">
     <div class="t"><div class="n">${i+1}</div><p>${esc(d.en)}</p><div class="use">${d.u}</div></div>
     <div class="aline"></div></div>`).join("")}
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 C — READ RIGHT */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · READ RIGHT`)}
  <div class="task"><div class="no">2</div><h3>READ RIGHT<span class="sub">지문의 모든 문장을 ORUN FLOW 로 분석하고 한 줄로 해석한다.</span></h3><div class="line"></div></div>
  <div class="oflow"><b>ORUN FLOW</b>1 주어 밑줄+S &nbsp;→&nbsp; 2 본동사 △+V &nbsp;→&nbsp; 3 접속사 [네모]
   &nbsp;→&nbsp; 4 종속절 S′·V′ &nbsp;→&nbsp; 5 수식어(구) 밑줄+M</div>
  <div class="otip"><b>분석 Tip</b> &nbsp;<b>조동사+동사</b> · <b>have(has, had)+p.p</b> ·
   <b>be+p.p</b>(수동태) · <b>be+~ing</b>(진행형) &nbsp;→&nbsp; <b>한 덩어리의 동사로 표시!</b> △</div>
  <div class="model">
   <div class="cap"><span style="color:var(--gold)">먼저 보기</span>
    <span>다 표시된 문장 ${t.fl.model.n} 을 먼저 구경하세요. 기호는 단어 바로 위·아래에!</span></div>
   <div class="mk">${t.fl.model.toks.map(x=>tok(x[0],x[1])).join("")}</div>
   <div class="ko"><b>뼈대 해석</b>${t.fl.model.ko}</div>
  </div>
  <div class="rrh" style="margin-top:4.5mm">한 문장씩 분석하기<span>문장 위에 직접 기호를 표시하고, 아래 한 줄에 우리말로 옮겨 보세요.</span></div>
  ${t.sent.map((s,i)=>`<div class="rrq">
    <div class="t"><div class="n">${String(i+1).padStart(2,"0")}</div><p>${esc(s)}</p></div>
    <div class="aline"></div></div>`).join("")}
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 D — FLOW CHART + PARAPHRASE */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Flow & Paraphrase`)}
  <div class="sect">
   <div class="task"><div class="no">3</div><h3>플로차트 완성<span class="sub">Fill in the blanks with the words in the box.</span></h3><div class="line"></div></div>
   <div class="strip">${t.flow.map((r,i)=>
     `${i?`<div class="ar">›</div>`:""}<div class="st"><div class="ci">
       <svg viewBox="0 0 48 48" fill="none">${PIC[STRIP[t.no][i]](t.accent,t.tint)}</svg></div>
       <b>${r[0]}</b></div>`).join("")}</div>
   <table class="flow"><tr><th style="width:26%">Stage</th><th>What the writer does</th></tr>
    ${t.flow.map(r=>{const body=r[2]?r[1].replace(/\(\s*[①-⑳]\s*\)/,m=>`<u>${m}</u>`):r[1];
      return `<tr class="${r[2]?"":"given"}"><td class="step">${r[0]}</td><td class="body">${body}</td></tr>`;}).join("")}
   </table>
   <div class="bogi"><b>보기</b>${t.flowBogi}</div>
  </div>
  <div class="sect">
   <div class="task"><div class="no">4</div><h3>패러프레이즈<span class="sub">원문의 표현을 다른 말로 바꾼 문장이다. 보기에서 골라 빈칸을 채우시오.</span></h3><div class="line"></div></div>
   <table class="para"><tr><th>원문 표현</th><th>같은 뜻으로 바꾸어 쓰기</th></tr>
    ${t.para.map(p=>{const m=p[0].match(/^([①-⑳])\s([\s\S]*)$/);
      return `<tr><td class="src"><span>${m[1]}</span>${esc(m[2])}</td><td class="dst">${esc(p[1]).replace("______","<u></u>")}</td></tr>`;}).join("")}
   </table>
   <div class="bogi"><b>보기</b>${t.paraBogi}</div>
   <div class="mini" style="margin:5.5mm 0 3px">위 플로차트의 ① ~ ④ 를 이어, 이 글을 <b>영어 한 문장</b>으로 요약하시오.</div>
   <div class="aline"></div>
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 E — CHECK UP + KNOWLEDGE BANK */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Check Up`)}
  <div class="sect">
   <div class="task"><div class="no">5</div><h3>Check Up<span class="sub">고르고 끝내지 말고, 왜 아닌지까지 쓴다.</span></h3><div class="line"></div></div>
   <div class="q"><div class="stem"><div class="n">1</div><div>${t.check[0].q}
     <span style="font-weight:400;color:var(--sub)">정답에 ○, 나머지는 제목이 될 수 없는 이유를 한 줄로 쓰시오.</span></div></div>
    <table class="cu"><tr><th>선지</th><th>○ 또는 오답인 이유</th></tr>
     ${t.check[0].ch.map((c,i)=>`<tr><td class="op"><b>${CIR[i]}</b>${esc(c)}</td><td class="rs"></td></tr>`).join("")}
    </table></div>
   <div class="q"><div class="stem"><div class="n">2</div><div>${t.check[1].q}
     <span style="font-weight:400;color:var(--sub)">일치하면 근거 문장 번호를, 어긋나면 그 이유를 쓰시오.</span></div></div>
    <table class="cu"><tr><th>선지</th><th>근거 문장 번호 · 어긋나는 이유</th></tr>
     ${t.check[1].ch.map((c,i)=>`<tr><td class="op"><b>${CIR[i]}</b>${esc(c)}</td><td class="rs"></td></tr>`).join("")}
    </table></div>
   <div class="q" style="margin-bottom:0"><div class="stem"><div class="n">3</div><div>${t.check[2].q}</div></div>
    <div class="aline" style="margin-left:28px"></div></div>
  </div>
  <div class="kb">
   <div class="hd"><b>${t.kb.title}</b><em>${t.kb.lead}</em><span class="tag">KNOWLEDGE BANK</span></div>
   <div class="bd">
    <div class="row">
     <div class="txt">
      ${t.kb.items.map((it,i)=>`<div class="it"><div class="num">${i+1}</div>
        <div><h5>${it[0]}</h5><p>${it[1]}</p></div></div>`).join("")}
     </div>
     <div class="vig"><svg viewBox="0 0 240 140" fill="none">${VIG[t.no](t.accent,t.tint,t.deep)}</svg>
      <div class="cap">${t.kb.title}</div></div>
    </div>
    <div class="ask"><span>생각해 볼 것</span>${t.kb.ask}</div>
   </div>
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);
});

/* ═══ ANSWERS ═══ */
const AC={accent:"#13345C",tint:"#E8EDF3",deep:"#0E2542"};
T.forEach((t,ti)=>{
 P.push(`<div class="page" style="${vars(AC)}">
  ${head(AC,"Answers & Full Translation")}
  ${ti===0?`<h2 class="sechd">정답과 해설</h2><p>Lesson 01–05 &nbsp;|&nbsp; 지문 전문 해석 포함</p>`:""}
  <div class="akey" style="--ac:${t.accent}">
   <div class="hd">Lesson ${t.no} &nbsp;${esc(t.en)}<em>${t.ko}</em></div>
   <table>
    <tr><td class="k">TASK 1</td><td>${t.defOrder.map((oi,i)=>`${i+1}–${AL[oi]}`).join(" &nbsp; ")}
       &nbsp;<span style="color:#98A0A8">(${t.defs.map((d,i)=>`${AL[i]} ${d[0]}`).join(" · ")})</span></td></tr>
    <tr><td class="k">TASK 2<br><span style="font-weight:400;color:#98A0A8">구문분석</span></td><td>
      ${t.syn.map((x,i)=>`<b style="color:${t.accent}">구문 ${i+1} · ${x.n} ${x.name}</b><br>${x.k}`).join("<br>")}
      <br>${t.synd.map((d,i)=>`<b style="color:${t.accent}">훈련 ${i+1}</b> <span style="color:#98A0A8">(${d.u})</span> ${d.k}`).join("<br>")}</td></tr>
    <tr><td class="k">TASK 2<br><span style="font-weight:400;color:#98A0A8">READ RIGHT</span></td><td>
      <b style="color:${t.accent}">먼저 보기 ${t.fl.model.n}</b> ${t.fl.model.ko}<br>
      ${t.fl.drill.map(d=>`<b style="color:${t.accent}">${d.n}</b> ${esc(d.ans)}`).join("<br>")}<br>
      <span style="color:#98A0A8">그 밖의 문장 해석은 아래 전문 해석 참조</span></td></tr>
    <tr><td class="k">TASK 3</td><td>${t.flow.filter(r=>r[2]).map((r,i)=>`${CIR[i]} ${r[2]}`).join(" &nbsp; ")}</td></tr>
    <tr><td class="k">TASK 4</td><td>${t.para.map((p,i)=>`(${i+1}) ${p[2]}`).join(" &nbsp; ")}</td></tr>
    <tr><td class="k">TASK 5-1</td><td><b style="color:${t.accent}">정답 ${CIR[t.check[0].ans-1]}</b><br>
      ${t.why.map((w,i)=>`${CIR[i]} ${w[0]}`).join(" &nbsp;/&nbsp; ")}</td></tr>
    <tr><td class="k">TASK 5-2</td><td><b style="color:${t.accent}">정답 ${CIR[t.check[1].ans-1]}</b><br>
      ${t.src.map((w,i)=>`${CIR[i]} ${w[0]}`).join(" &nbsp;/&nbsp; ")}</td></tr>
    <tr><td class="k">TASK 5-3</td><td>${t.check[2].ans}</td></tr>
   </table>
  </div>
  <div class="trans">${t.kor.map((k,i)=>`<sup>${CIR[i]}</sup>${k}`).join(" ")}</div>
  ${ti===4?`
  <div class="how" style="grid-template-columns:1fr 1fr;margin-top:5mm">
   <div class="box"><div class="n">유닛 마무리 체크</div><h4>스스로 점검하기</h4>
    <p>□ 다섯 지문을 소리 내어 끝까지 읽었다<br>□ WORD BANK 30개를 영영풀이로 설명할 수 있다<br>
       □ ORUN FLOW 5단계를 보지 않고 표시할 수 있다<br>□ 각 지문의 흐름을 표 없이 말로 설명할 수 있다<br>
       □ Check Up의 오답 이유를 모두 적었다</p></div>
   <div class="box" style="border-color:#13345C"><div class="n">NEXT UNIT</div><h4>Unit 2 · Seeing Numbers</h4>
    <p>같은 여섯 걸음으로 진행합니다. Unit 1이 ‘표현과 실재’를 다루었다면, Unit 2는 자료와 해석 사이의 거리를 읽습니다.
       지문 5편 · 180–210 words.</p></div>
  </div>`:""}
  ${foot(AC,"Answers")}
 </div>`);
});

const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>READING GRAPHY · PRE-HIGH · Unit 1</title><style>${CSS}</style></head>
<body>${P.join("\n")}</body></html>`;
fs.writeFileSync("book.html",html);
console.log("pages:",P.length,"bytes:",html.length);
