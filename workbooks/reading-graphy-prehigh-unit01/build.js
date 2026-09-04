const fs=require("fs");
const CSS=require("./css.js");
const {icons,scenes}=require("./art.js");
const T=require("./content1.js").concat(require("./content2.js"));
const CIR="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳".split("");
const AL="abcdef".split("");
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
 <p>모든 유닛은 같은 순서로 흐릅니다. 모르는 단어가 있어도 멈추지 말고, WORD BANK와 삽화를 이용해 끝까지 읽으세요. 한 레슨은 4면(READING / WORD·SENTENCE / MARKING·FLOW / PARAPHRASE·CHECK)이라 한 차시에 끝낼 수 있고, 답란은 모두 한 줄이라 판서로 함께 채우기에 좋습니다. 지문 전문 해석과 정답은 책 뒤 <b>ANSWERS</b>에 있습니다.</p>
 <div class="lane">
  ${[["1","READING","지문을 끝까지 읽는다","#13345C"],["2","WORD MATCH","영영풀이로 뜻을 세운다",T[0].accent],
     ["3","SENTENCE","한 문장씩 끊어 해석한다",T[1].accent],["4","MARKING","기호로 구조를 표시한다",T[2].accent],
     ["5","FLOW","글의 흐름을 표로 복원한다",T[3].accent],["6","PARAPHRASE · CHECK","바꿔 쓰고 확인한다",T[4].accent]]
    .map(x=>`<div style="background:${x[3]}"><b>${x[0]} ${x[1]}</b>${x[2]}</div>`).join("")}
 </div>
 <div class="how">
  ${[["TASK 1","영영풀이 매칭","우리말 뜻을 외우는 대신, 영어 정의를 읽고 낱말과 이어 봅니다. 뜻을 ‘세우는’ 훈련입니다."],
    ["TASK 2","한 문장 해석","의미 단위로 끊어 둔 문장을 한 줄에 옮깁니다. 슬래시가 곧 호흡입니다."],
    ["TASK 3","기호 표시 구문분석","S·V·O·C를 적고 ( )와 [ ]로 수식어와 절을 묶습니다. 문장이 눈에 보이게 됩니다."],
    ["TASK 4","플로차트 빈칸","글 전체의 흐름을 표 한 장으로 복원합니다. 어디가 반전이고 어디가 결론인지 드러납니다."],
    ["TASK 5","패러프레이즈","원문의 표현을 다른 말로 바꿔 씁니다. 시험 선지가 바로 이 작업입니다."],
    ["TASK 6","Check Up","제목·내용 일치·서술형으로 오늘 읽은 것을 확인합니다."]]
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
  <tr><th style="width:30%">Lesson</th><th style="width:18%">학습일</th><th>TASK 1 – 6</th></tr>
  ${T.map(t=>`<tr><td class="step" style="--tint:${t.tint};--deep:${t.deep};border-radius:8px 0 0 8px">${t.no} &nbsp;${esc(t.en)}</td>
   <td style="background:#FFFBEF;border-left:3px solid var(--yel)"></td>
   <td class="body" style="letter-spacing:.5em;color:#B4BAC1;font-size:11pt">□□□□□□</td></tr>`).join("")}
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

 /* 면 B — WORD MATCH + SENTENCE */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Words & Sentences`)}
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
   <div class="task"><div class="no">2</div><h3>한 문장 해석<span class="sub">끊어진 의미 단위를 따라 한 줄로 옮기시오.</span></h3><div class="line"></div></div>
   ${t.chunk.map(c=>`<div class="chunk">
     <div class="en"><div class="n">${c.n}</div><div class="t">${esc(c.en).replace(/ \/ /g," <i>/</i> ")}</div></div>
     <div class="aline"></div></div>`).join("")}
  </div>
  ${foot(t,L)}
 </div>`);

 /* 면 C — MARKING + FLOW */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Marking & Flow`)}
  <div class="sect">
   <div class="task"><div class="no">3</div><h3>기호 표시 구문분석<span class="sub">아래 기호로 문장의 구조를 직접 표시하시오.</span></h3><div class="line"></div></div>
   <div class="legend">
    <span><b>S</b> 주어</span><span><b>V</b> 동사</span><span><b>O</b> 목적어</span><span><b>C</b> 보어</span>
    <span><b>( )</b> 전치사구·수식어</span><span><b>[ ]</b> 절 — 관계절·부사절·명사절</span><span><b>/</b> 의미 단위 끊기</span>
   </div>
   ${t.mark.map(m=>`<div class="markbox">
     <div class="h"><div class="n">${m.n}</div><span>MARK THE STRUCTURE</span></div>
     <p>${esc(m.raw)}</p>
     <div class="mini">기호를 표시한 뒤, 한 줄로 해석하시오.</div>
     <div class="aline" style="margin-bottom:8px"></div></div>`).join("")}
  </div>
  <div class="sect">
   <div class="task"><div class="no">4</div><h3>플로차트 완성<span class="sub">보기에서 골라 빈칸을 채우고 글의 흐름을 복원하시오.</span></h3><div class="line"></div></div>
   <table class="flow"><tr><th style="width:24%">단계</th><th>내용</th></tr>
    ${t.flow.map((r,i)=>{
      const body=r[2]?r[1].replace(/\(\s*[①-⑳]\s*\)/,m=>`<u>${m}</u>`):r[1];
      return `<tr class="${r[2]?"":"given"}"><td class="step">${r[0]}</td><td class="body">${body}</td></tr>`;}).join("")}
   </table>
   <div class="bogi"><b>보기</b>${t.flowBogi}</div>
  </div>
  ${foot(t,L)}
 </div>`);

 /* 면 D — PARAPHRASE + CHECK */
 P.push(`<div class="page" style="${V}">
  ${head(t,`Lesson ${t.no} · Paraphrase & Check`)}
  <div class="sect">
   <div class="task"><div class="no">5</div><h3>패러프레이즈<span class="sub">원문의 표현을 다른 말로 바꾼 문장이다. 보기에서 골라 빈칸을 채우시오.</span></h3><div class="line"></div></div>
   <table class="para"><tr><th>원문 표현</th><th>같은 뜻으로 바꾸어 쓰기</th></tr>
    ${t.para.map(p=>{const m=p[0].match(/^([①-⑳])\s([\s\S]*)$/);
      return `<tr><td class="src"><span>${m[1]}</span>${esc(m[2])}</td><td class="dst">${esc(p[1]).replace("______","<u></u>")}</td></tr>`;}).join("")}
   </table>
   <div class="bogi"><b>보기</b>${t.paraBogi}</div>
  </div>
  <div class="sect">
   <div class="task"><div class="no">6</div><h3>Check Up<span class="sub">오늘 읽은 글을 확인한다.</span></h3><div class="line"></div></div>
   ${t.check.map((q,qi)=>`<div class="q">
     <div class="stem"><div class="n">${qi+1}</div><div>${q.q}</div></div>
     ${q.ch?`<ol>${q.ch.map((c,ci)=>`<li><b>${CIR[ci]}</b>${esc(c)}</li>`).join("")}</ol>`:`<div class="aline" style="margin-left:28px"></div>`}
    </div>`).join("")}
  </div>
  ${foot(t,L)}
 </div>`);
});

/* ═══ ANSWERS ═══ */
const AC={accent:"#13345C",tint:"#E8EDF3",deep:"#0E2542"};
const chunks=(arr,n)=>arr.reduce((a,x,i)=>((i%n?a[a.length-1].push(x):a.push([x])),a),[]);
chunks(T,2).forEach((grp,gi)=>{
 P.push(`<div class="page" style="${vars(AC)}">
  ${head(AC,"Answers & Full Translation")}
  ${gi===0?`<h2 class="sechd">정답과 해설</h2><p>Unit 1 · Lesson 01–05 &nbsp;|&nbsp; 지문 전문 해석 포함</p>`:""}
  ${grp.map(t=>`
   <div class="akey" style="--ac:${t.accent}">
    <div class="hd">Lesson ${t.no} &nbsp;${esc(t.en)}<em>${t.ko}</em></div>
    <table>
     <tr><td class="k">TASK 1</td><td>${t.defOrder.map((oi,i)=>`${i+1}–${AL[oi]}`).join(" &nbsp; ")}
        &nbsp;<span style="color:#98A0A8">(${t.defs.map((d,i)=>`${AL[i]} ${d[0]}`).join(" · ")})</span></td></tr>
     <tr><td class="k">TASK 2</td><td>${t.chunk.map(c=>`<b style="color:${t.accent}">${c.n}</b> ${c.ko}`).join("<br>")}</td></tr>
     <tr><td class="k">TASK 3</td><td>${t.mark.map(m=>`<b style="color:${t.accent}">${m.n}</b> ${esc(m.ans)}<br><span style="color:#5D646C">→ ${m.note}</span>`).join("<br>")}</td></tr>
     <tr><td class="k">TASK 4</td><td>${t.flow.filter(r=>r[2]).map((r,i)=>`${CIR[i]} ${r[2]}`).join(" &nbsp; ")}</td></tr>
     <tr><td class="k">TASK 5</td><td>${t.para.map((p,i)=>`(${i+1}) ${p[2]}`).join(" &nbsp; ")}</td></tr>
     <tr><td class="k">TASK 6</td><td>${t.check.map((q,i)=>q.ch?`<b>${i+1}</b> ${CIR[q.ans-1]}`:`<b>${i+1}</b> ${q.ans}`).join(" &nbsp; ")}</td></tr>
    </table>
   </div>
   <div class="trans" style="margin-bottom:6mm">${t.kor.map((k,i)=>`<sup>${CIR[i]}</sup>${k}`).join(" ")}</div>`).join("")}
  ${gi===2?`
  <div class="how" style="grid-template-columns:1fr 1fr;margin-top:4mm">
   <div class="box"><div class="n">유닛 마무리 체크</div><h4>스스로 점검하기</h4>
    <p>□ 다섯 지문을 소리 내어 끝까지 읽었다<br>□ WORD BANK 30개를 영영풀이로 설명할 수 있다<br>
       □ TASK 3의 기호 표시를 보지 않고 다시 그릴 수 있다<br>□ 각 지문의 흐름을 표 없이 말로 설명할 수 있다<br>
       □ 패러프레이즈 15문항을 모두 맞혔다</p></div>
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
