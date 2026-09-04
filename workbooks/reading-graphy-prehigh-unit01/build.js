const fs=require("fs");
const CSS=require("./css.js");
const {icons,scenes}=require("./art.js");
const T=require("./content1.js").concat(require("./content2.js"));
const FL=require("./flow.js");
const EX=require("./extra.js");
T.forEach(t=>{t.fl=FL[t.no]; const e=EX[t.no]; t.flow=e.flow; t.flowBogi=e.flowBogi;
  t.why=e.why; t.src=e.src; t.kb=e.kb;});
const CIR="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳".split("");
const AL="abcdef".split("");
const ROLE={"s": "S 주어", "s2": "S′ 주어", "v": "V 본동사", "v2": "V′ 동사", "c": "접속사", "m": "M 수식어"};
const tok=(x,r)=>`<span class="tk ${r||""}"><em>${r==="v"||r==="v2"?"△":"&nbsp;"}</em><b>${esc(x)}</b><i>${r?ROLE[r]:"&nbsp;"}</i></span>`;
const esc=s=>String(s).replace(/&(?![a-z#])/g,"&amp;");
const P=[]; // pages
let pn=0;

const vars=t=>`--ac:${t.accent};--tint:${t.tint};--deep:${t.deep}`;
const head=(t,right)=>`<div class="rh"><span>READING GRAPHY · PRE-HIGH · UNIT 1</span><span class="r">${right}</span></div>`;
const foot=(t,label)=>`<div class="rf"><span>${label}</span><b>${++pn}</b><span>옳은영어 ORUN ENGLISH</span></div>`;

/* ═══ 1. 표지 ═══ */
P.push(`<div class="page cover">
 <div class="top">ORUN ENGLISH · READING GRAPHY</div>
 <div>
  <h1>Five Ways<em>of Reading</em></h1>
  <div class="tagline">A translation, a picture, a rehearsal, a locked room, a conversation — five short texts about what gets lost, and what gets built, between one thing and its version.</div>
  <div class="kotag">옳은 독해 · 예비고등 독해 워크북 &nbsp;|&nbsp; UNIT 1 &nbsp;예술과 표현</div>
  <div class="meta">
   <span class="chip solid">PRE-HIGH · 예비고1</span><span class="chip">지문 5편 · 170–205 words</span>
   <span class="chip">영영풀이 매칭</span><span class="chip">문장별 구문분석</span>
   <span class="chip">기호 표시</span><span class="chip">플로차트</span><span class="chip">패러프레이즈</span>
  </div>
 </div>
 <div class="hero">
  ${T.map(t=>`<div class="hb"><div class="c" style="background:${t.tint}">${icons[t.key](t.deep)}</div><b>0${t.no.replace(/^0/,"")}</b></div>`).join("")}
  <div class="hline"></div>
 </div>
 <div class="themes">
  ${T.map(t=>`<div><b>0${t.no.replace(/^0/,"")}</b>${t.en}<br><span style="opacity:.6">${t.ko}</span></div>`).join("")}
 </div>
 <div class="foot"><span>All texts and illustrations in this book are original.</span><span>Student Book</span></div>
</div>`);

/* ═══ 2. 이 책의 구성 ═══ */
P.push(`<div class="page" style="${vars(T[0])}">
 ${head(T[0],"이 책의 구성")}
 <h2 class="sechd">여섯 걸음으로 한 편을 끝낸다</h2>
 <p>모든 유닛은 같은 순서로 흐릅니다. 모르는 단어가 있어도 멈추지 말고, WORD BANK와 삽화를 이용해 끝까지 읽으세요. 한 레슨은 5면(READING / WORD·FLOW 먼저 보기 / FLOW 훈련 / CHART·PARAPHRASE / CHECK·KB)이라 한 차시에 끝낼 수 있고, 답란은 모두 한 줄이라 판서로 함께 채우기에 좋습니다. 지문 전문 해석과 정답은 책 뒤 <b>ANSWERS</b>에 있습니다.</p>
 <div class="lane">
  ${[["1","READING","지문을 끝까지 읽는다","#13345C"],["2","WORD MATCH","영영풀이로 뜻을 세운다",T[0].accent],
     ["3","ORUN FLOW","주어·동사부터 표시한다",T[1].accent],["4","FLOW CHART","글의 흐름을 표로 복원한다",T[2].accent],
     ["5","PARAPHRASE","다른 말로 바꿔 쓴다",T[3].accent],["6","CHECK + KB","확인하고 배경지식을 얻는다",T[4].accent]]
    .map(x=>`<div style="background:${x[3]}"><b>${x[0]} ${x[1]}</b>${x[2]}</div>`).join("")}
 </div>
 <div class="how">
  ${[["TASK 1","영영풀이 매칭","우리말 뜻을 외우는 대신, 영어 정의를 읽고 낱말과 이어 봅니다. 뜻을 ‘세우는’ 훈련입니다."],
    ["TASK 2","ORUN FLOW","다 표시된 <b>먼저 보기</b>를 읽고, 같은 방법으로 세 문장에 직접 표시한 뒤 뼈대만 남겨 해석합니다."],
    ["TASK 3","플로차트 완성","글 전체의 흐름을 영어 표 한 장으로 복원합니다. 어디가 반전이고 어디가 결론인지 드러납니다."],
    ["TASK 4","패러프레이즈","원문의 표현을 다른 말로 바꿔 씁니다. 시험 선지가 바로 이 작업입니다."],
    ["TASK 5","Check Up","고르고 끝내지 않습니다. <b>왜 아닌지</b>와 <b>근거 문장 번호</b>까지 적습니다."],
    ["＋","Knowledge Bank","유닛 끝의 배경지식 코너. 지문의 소재를 실제 사건·자료로 넓혀 다음 지문을 쉽게 만듭니다."]]
   .map(x=>`<div class="box"><div class="n">${x[0]}</div><h4>${x[1]}</h4><p>${x[2]}</p></div>`).join("")}
 </div>
 <h2 class="sechd" style="font-size:12.5pt;margin-top:2mm">표기 약속</h2>
 <p style="margin-bottom:4mm">TASK 3에서 쓰는 기호입니다. 다섯 유닛 내내 같은 약속을 씁니다.</p>
 <div class="legend" style="--tint:#EEF0F3;--deep:#13345C;margin-bottom:4.5mm">
  <span><b>S</b> 주어</span><span><b>V</b> 동사</span><span><b>O</b> 목적어</span><span><b>C</b> 보어</span>
  <span><b>( )</b> 전치사구·수식어</span><span><b>[ ]</b> 절 — 관계절·부사절·명사절</span><span><b>/</b> 의미 단위 끊기</span>
 </div>
 <h2 class="sechd" style="font-size:12.5pt">학습 계획표</h2>
 <p style="margin-bottom:4mm">한 차시에 한 레슨. 끝낸 TASK에 표시하세요.</p>
 <table class="flow plan" style="--ac:#13345C">
  <tr><th style="width:30%">Lesson</th><th style="width:18%">학습일</th><th>TASK 1 – 5 &nbsp;+ KB</th></tr>
  ${T.map(t=>`<tr><td class="step" style="--tint:${t.tint};--deep:${t.deep};border-radius:8px 0 0 8px">${t.no} &nbsp;${esc(t.en)}</td>
   <td style="background:#FFFBEF;border-left:3px solid var(--yel)"></td>
   <td class="body" style="letter-spacing:.5em;color:#B4BAC1;font-size:11pt">□□□□□ ＋</td></tr>`).join("")}
 </table>
 ${foot(T[0],"이 책의 구성")}
</div>`);

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
    <div class="card stat"><h4>Read It</h4>
     <div class="row"><b>문장</b><span>${t.sent.length}개</span></div>
     <div class="row"><b>낱말</b><span>${t.sent.join(" ").split(/\s+/).length} words</span></div>
     <div class="row"><b>목표 시간</b><span>3분 이내</span></div>
     <div class="reps"><i>1회독 □</i><i>2회독 □</i><i>3회독 □</i></div>
    </div>
   </div>
  </div>
  <figure><div class="art">${scenes[t.key](t.accent,t.tint,t.deep)}</div>
   <figcaption><b>${t.fig.split("  ")[0]}</b> &nbsp;${t.fig.split("  ").slice(1).join(" ")}</figcaption></figure>
  ${foot(t,L)}
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
   <div class="task"><div class="no">2</div><h3>ORUN FLOW<span class="sub">주어와 본동사를 먼저 찾으면 나머지가 보인다. 먼저 보기부터 읽으시오.</span></h3><div class="line"></div></div>
   <div class="fbar">
    ${[["1","주어 밑줄 + S"],["2","본동사 △ + V"],["3","접속사 [네모]"],["4","종속절 S′ · V′"],["5","수식어(구) 밑줄 + M"]]
      .map(x=>`<div><b>STEP ${x[0]}</b>${x[1]}</div>`).join("")}
   </div>
   <div class="model">
    <div class="cap"><span style="color:var(--gold)">먼저 보기 · 다 표시된 문장</span><span>문장 ${t.fl.model.n}</span></div>
    <div class="mk">${t.fl.model.toks.map(x=>tok(x[0],x[1])).join("")}</div>
    <div class="ko"><b>뼈대 해석</b>${t.fl.model.ko}</div>
   </div>
   <div class="ftip"><b>분석 Tip</b> &nbsp;조동사+동사 · have(has, had)+p.p · be+p.p(수동태) · be+~ing(진행형) →
    <b>한 덩어리의 동사</b>로 묶어 △ 를 올린다. 접속사를 네모로 묶으면 그 뒤가 종속절(S′·V′)이다.</div>
   <div class="mini" style="margin:5mm 0 3px">먼저 보기 문장에서 각 자리에 해당하는 말을 찾아 옮겨 적으시오.</div>
   <table class="slot"><tr>
    ${[["S","주어"],["△V","본동사"],["접속사",""],["S′","종속절 주어"],["△V′","종속절 동사"],["M","수식어"]]
      .map(x=>`<th><b>${x[0]}</b>${x[1]?" "+x[1]:""}</th>`).join("")}
   </tr><tr>${[0,1,2,3,4,5].map(()=>`<td></td>`).join("")}</tr></table>
  </div>
  ${foot(t,L)}
 </div>`);

 /* 면 C — ORUN FLOW 훈련 */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · ORUN FLOW`)}
  <div class="sect">
   <div class="task"><div class="no">2</div><h3>ORUN FLOW 훈련<span class="sub">앞의 먼저 보기와 같은 방법으로 세 문장에 직접 표시하시오.</span></h3><div class="line"></div></div>
   ${t.fl.drill.map(d=>`<div class="drill">
     <div class="h"><div class="n">문장 ${d.n}</div><div class="go">→ 문장 위에 직접 표시!</div></div>
     <p>${esc(d.en)}</p>
     <div class="mini">뼈대만 남겨 한 줄로 해석하시오.</div>
     <div class="aline" style="margin-bottom:8px"></div></div>`).join("")}
   <div class="mini" style="margin:5.5mm 0 4px">세 문장의 <b>주어</b>와 <b>본동사</b>만 모아 다시 쓰시오. 글의 뼈대가 한눈에 보인다.</div>
   <table class="slot bone"><tr><th style="width:16%">문장</th><th style="width:42%"><b>S</b> 주어</th><th><b>△V</b> 본동사</th></tr>
    ${t.fl.drill.map(d=>`<tr><td class="lab">${d.n}</td><td></td><td></td></tr>`).join("")}
   </table>
  </div>
  ${foot(t,L)}
 </div>`);

 /* 면 D — FLOW CHART + PARAPHRASE */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Flow & Paraphrase`)}
  <div class="sect">
   <div class="task"><div class="no">3</div><h3>플로차트 완성<span class="sub">Fill in the blanks with the words in the box.</span></h3><div class="line"></div></div>
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
  ${foot(t,L)}
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
    ${t.kb.items.map((it,i)=>`<div class="it"><div class="num">${i+1}</div>
      <div><h5>${it[0]}</h5><p>${it[1]}</p></div></div>`).join("")}
    <div class="ask"><span>생각해 볼 것</span>${t.kb.ask}</div>
   </div>
  </div>
  ${foot(t,L)}
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
    <tr><td class="k">TASK 2<br><span style="font-weight:400;color:#98A0A8">ORUN FLOW</span></td><td>
      <b style="color:${t.accent}">먼저 보기 ${t.fl.model.n}</b> ${t.fl.model.ko}<br>
      ${t.fl.drill.map(d=>`<b style="color:${t.accent}">${d.n}</b> ${esc(d.ans)}<br><span style="color:#5D646C">→ ${d.ko}</span>`).join("<br>")}</td></tr>
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
