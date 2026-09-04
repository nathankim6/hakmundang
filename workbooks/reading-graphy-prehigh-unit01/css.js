module.exports = `
@page { size: A4; margin: 0; }
*{box-sizing:border-box;margin:0;padding:0}
:root{
 --ink:#232220; --sub:#5D646C; --faint:#98A0A8; --hair:#E3E1DC;
 --navy:#13345C; --blue:#06618C; --yel:#FDD100; --gold:#9A7400;
 --paper:#FFFDF9; --cool:#F4F5F6; --cream:#FFFBEF;
}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Noto Sans KR',sans-serif;color:var(--ink);background:#fff;font-size:10pt;line-height:1.5}
.page{width:210mm;height:297mm;padding:14mm 15mm 12mm;position:relative;
 page-break-after:always;background:var(--paper);overflow:hidden;display:flex;flex-direction:column}
.page:last-child{page-break-after:auto}
/* ── 러닝 헤더/푸터 ── */
.rh{display:flex;justify-content:space-between;align-items:baseline;font-size:7.2pt;letter-spacing:.14em;
 font-weight:700;color:var(--faint);text-transform:uppercase;padding-bottom:5px;border-bottom:1px solid var(--hair);margin-bottom:9mm}
.rh .r{color:var(--ac,var(--blue))}
.rf{position:absolute;left:15mm;right:15mm;bottom:7mm;display:flex;justify-content:space-between;
 align-items:center;font-size:7.5pt;color:var(--faint);border-top:1px solid var(--hair);padding-top:4px}
.rf b{color:var(--ac,var(--blue));font-size:9.5pt}
/* ── 레슨 헤더 ── */
.lh{display:flex;gap:14px;align-items:flex-start;margin-bottom:7mm}
.lh .ic{width:62px;height:62px;flex:0 0 62px;border-radius:50%;background:var(--tint);display:flex;align-items:center;justify-content:center}
.lh .ic svg{width:38px;height:38px}
.eyebrow{font-size:7.4pt;font-weight:800;letter-spacing:.2em;color:var(--ac);text-transform:uppercase;margin-bottom:2px}
.lh h1{font-size:20.5pt;font-weight:800;letter-spacing:-.015em;line-height:1.15;margin-bottom:3px}
.lh .kor{font-size:9.6pt;font-weight:700;color:var(--sub);margin-bottom:4px}
.lh .goal{font-size:8.6pt;color:var(--sub)}
.lh .goal b{color:var(--ac);font-weight:800}
.rule{height:2.5px;background:var(--ac);border-radius:2px;margin-bottom:6mm}
/* ── 읽기 2단 ── */
.read{display:grid;grid-template-columns:1.6fr 1fr;gap:7mm;margin-bottom:6mm}
.psg{font-family:'Noto Serif CJK KR',serif;font-size:10.3pt;line-height:1.78;text-align:justify;hyphens:auto}
.psg sup{font-family:'Noto Sans KR';font-size:6.6pt;font-weight:800;color:var(--ac);vertical-align:super;margin-right:1px}
.psg .dc{float:left;position:relative;font-size:33pt;line-height:.8;font-weight:800;color:var(--ac);margin:6px 8px 0 0;font-family:'Noto Sans KR'}
.psg .dc i{position:absolute;top:-3px;right:-11px;font-style:normal;font-size:7pt;font-weight:800;color:var(--ac)}
.side{display:flex;flex-direction:column;gap:4mm}
.card{border-radius:11px;padding:11px 13px}
.card.bank{background:var(--tint)}
.card h4{font-size:7.4pt;font-weight:800;letter-spacing:.17em;color:var(--deep);text-transform:uppercase;margin-bottom:7px}
table.bank{width:100%;border-collapse:collapse;font-size:8.1pt}
table.bank td{padding:3.6px 0;vertical-align:top;border-bottom:1px dotted #D8D4CC}
table.bank tr:last-child td{border-bottom:0}
table.bank .w{font-weight:800;width:41%}
table.bank .n{width:13%;color:var(--ac);font-weight:800;font-size:7.4pt;text-align:center}
table.bank .k{color:var(--sub)}
.card.stat{border:1.5px solid var(--hair);background:#fff}
.card.stat .row{display:flex;justify-content:space-between;font-size:8.4pt;padding:4.5px 0;border-bottom:1px dotted #E5E3DE}
.card.stat .row:last-of-type{border-bottom:0}
.card.stat .row b{color:var(--sub);font-weight:700}
.card.stat .row span{font-weight:800;color:var(--deep)}
.card.stat .reps{display:flex;gap:7px;margin-top:8px;padding-top:8px;border-top:1.5px solid var(--tint)}
.card.stat .reps i{flex:1;font-style:normal;font-size:7.6pt;font-weight:700;color:var(--faint);text-align:center;
 border:1.4px solid var(--hair);border-radius:6px;padding:5px 0}
.tip{background:#F1F2F6;border-radius:11px;padding:11px 13px;font-size:8.2pt;color:var(--sub);line-height:1.58}
.tip b{color:var(--ink)}
.tip .bulb{display:inline-block;width:15px;height:15px;border-radius:50%;background:var(--yel);margin-right:5px;vertical-align:-3px}
/* ── 삽화 ── */
figure{margin-top:auto;margin-bottom:2mm;flex:0 0 auto}
figure .art{height:46mm;border-radius:14px;background:var(--tint);display:flex;align-items:center;justify-content:center;padding:7px 12px}
figure .art svg{height:100%;width:100%}

figcaption{font-size:7.9pt;color:var(--sub);margin-top:6px}
figcaption b{color:var(--ac);font-weight:800}
/* ── 과제 헤더 ── */
.task{display:flex;align-items:center;gap:9px;margin:0 0 4.5mm}
.task .no{flex:0 0 auto;min-width:26px;height:23px;border-radius:7px;background:var(--ac);color:#fff;
 font-size:9pt;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 7px}
.task h3{font-size:12.4pt;font-weight:800;letter-spacing:-.01em}
.task .sub{font-size:8.3pt;color:var(--sub);font-weight:400;margin-left:2px}
.task .line{flex:1;height:1.5px;background:var(--hair);margin-left:4px}
.sect{margin-bottom:5.5mm}
.sect:last-child{margin-bottom:0}
/* ── 영영풀이 매칭 ── */
.match{display:grid;grid-template-columns:1fr 1.55fr;gap:6mm}
.mcol h5{font-size:7.3pt;font-weight:800;letter-spacing:.15em;color:var(--faint);text-transform:uppercase;margin-bottom:6px}
.mrow{display:flex;align-items:center;gap:9px;padding:2.5px 0;border-bottom:1px dotted var(--hair)}
.mrow .lab{flex:0 0 20px;height:20px;border-radius:6px;background:var(--tint);color:var(--deep);
 font-size:8pt;font-weight:800;display:flex;align-items:center;justify-content:center}
.mrow .w{font-weight:800;font-size:9.6pt;flex:1}
.mrow .blank{flex:0 0 44px;height:20px;border-bottom:1.6px solid var(--ac);opacity:.55}
.mrow .d{font-size:8.9pt;color:var(--ink);flex:1;line-height:1.42}
/* ── 한 줄 답란 ── */
.aline{height:9.5mm;border-bottom:1.5px dotted #C7CBD1;background:var(--cream);border-left:3px solid var(--yel);
 border-radius:0 5px 5px 0}
/* ── 직독직해 ── */
.chunk{border-radius:10px;overflow:hidden;margin-bottom:5.2mm;border:1px solid var(--hair)}
.chunk .en{display:flex;gap:9px;background:var(--cool);padding:10px 12px}
.chunk .n{flex:0 0 auto;font-size:7.6pt;font-weight:800;color:#fff;background:var(--ac);border-radius:5px;padding:2px 6px;height:fit-content}
.chunk .t{font-size:9.5pt;line-height:1.5}
.chunk .t i{color:var(--ac);font-style:normal;font-weight:800;padding:0 1px}
/* ── 기호 표시 ── */
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;background:var(--tint);border-radius:9px;padding:11px 14px;
 font-size:8.3pt;color:var(--deep);margin-bottom:4mm}
.legend b{font-weight:800}
.markbox{border:1.4px solid var(--hair);border-radius:10px;padding:11px 14px 5px;margin-bottom:3.4mm;background:#fff}
.markbox .h{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.markbox .n{font-size:7.6pt;font-weight:800;color:#fff;background:var(--ac);border-radius:5px;padding:2px 6px}
.markbox .h span{font-size:7.6pt;color:var(--faint);font-weight:700;letter-spacing:.1em}
.markbox p{font-family:'Noto Serif CJK KR',serif;font-size:11pt;line-height:2.75;letter-spacing:.01em;margin-bottom:7px}
.markbox .mini{font-size:7.6pt;color:var(--faint);font-weight:700;letter-spacing:.05em;margin-bottom:4px}
/* ── 플로차트 표 ── */
table.flow{width:100%;border-collapse:separate;border-spacing:0 6px;font-size:9.5pt}
table.flow th{font-size:7.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);
 text-align:left;padding:0 10px 4px;font-weight:800}
table.flow td{padding:15px 12px;background:var(--cool);vertical-align:middle}
table.flow td.step{width:24%;font-weight:800;color:var(--deep);background:var(--tint);
 border-radius:8px 0 0 8px;font-size:9pt}
table.flow td.body{border-radius:0 8px 8px 0;line-height:1.45}
table.flow td.body u{text-decoration:none;border-bottom:1.6px solid var(--ac);padding:0 12px;color:transparent}
table.flow tr.given td.body{color:var(--sub)}
.bogi{background:#fff;border:1.5px dashed var(--ac);border-radius:9px;padding:8px 12px;font-size:9pt;
 text-align:center;margin-top:3mm}
.bogi b{font-size:7.4pt;letter-spacing:.14em;color:var(--ac);font-weight:800;margin-right:8px}
/* ── 패러프레이즈 ── */
table.para{width:100%;border-collapse:collapse;font-size:9.2pt}
table.para th{font-size:7.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);
 text-align:left;padding:0 0 6px;font-weight:800;border-bottom:2px solid var(--ac)}
table.para td{padding:18px 12px 18px 0;border-bottom:1px dotted var(--hair);vertical-align:top;line-height:1.45}
table.para td.src{width:47%;font-family:'Noto Serif CJK KR',serif}
table.para td.src span{font-size:7.6pt;font-weight:800;color:var(--ac);font-family:'Noto Sans KR';margin-right:5px}
table.para td.dst u{text-decoration:none;border-bottom:1.6px solid var(--ac);padding:0 24px}
/* ── Check Up ── */
.q{margin-bottom:6.5mm}
.q .stem{display:flex;gap:9px;font-size:9.9pt;font-weight:700;line-height:1.45;margin-bottom:8px}
.q .stem .n{flex:0 0 auto;font-size:8.4pt;font-weight:800;color:#fff;background:var(--ac);
 border-radius:50%;width:19px;height:19px;display:flex;align-items:center;justify-content:center}
.q ol{list-style:none;padding-left:28px;font-size:9.3pt}
.q ol li{padding:4.6px 0;line-height:1.42}
.q ol li b{color:var(--ac);font-weight:700;margin-right:5px}
/* ── 표지 ── */
.cover{background:linear-gradient(160deg,#13345C 0%,#1B4A79 55%,#20618F 100%);color:#fff;justify-content:space-between}
.cover .top{font-size:8pt;letter-spacing:.28em;font-weight:800;color:var(--yel)}
.cover h1{font-size:52pt;font-weight:800;line-height:.98;letter-spacing:-.03em;margin:6mm 0 4mm}
.cover h1 em{font-style:normal;color:var(--yel);display:block}
.cover .tagline{font-size:12pt;font-weight:300;opacity:.9;line-height:1.55;max-width:120mm}
.cover .kotag{font-size:10pt;opacity:.72;margin-top:3mm}
.cover .meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:7mm}
.cover .chip{border:1.4px solid rgba(255,255,255,.42);border-radius:999px;padding:5px 13px;font-size:8.4pt;font-weight:700}
.cover .chip.solid{background:var(--yel);color:#13345C;border-color:var(--yel)}
.cover .hero{display:flex;align-items:center;justify-content:space-between;margin:auto 0;position:relative;padding:0 4mm}
.cover .hero .hline{position:absolute;left:12mm;right:12mm;top:44px;height:2px;background:rgba(255,255,255,.15);z-index:0}
.cover .hb{position:relative;z-index:1;text-align:center}
.cover .hb .c{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;
 box-shadow:0 0 0 7px rgba(255,255,255,.06)}
.cover .hb .c svg{width:50px;height:50px}
.cover .hb b{display:block;margin-top:11px;font-size:11pt;font-weight:800;color:var(--yel);letter-spacing:.04em}
.cover .themes{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:auto}
.cover .themes div{background:rgba(255,255,255,.09);border-radius:10px;padding:11px 10px;font-size:8pt;line-height:1.4}
.cover .themes b{display:block;font-size:13pt;margin-bottom:5px;color:var(--yel);font-weight:800}
.cover .foot{margin-top:6mm;font-size:8pt;opacity:.62;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.2);padding-top:4mm}
/* ── 구성 안내 ── */
.how{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-bottom:5mm}
.how .box{border:1.5px solid var(--hair);border-radius:12px;padding:11px 13px}
.how .box .n{font-size:8pt;font-weight:800;color:var(--blue);letter-spacing:.14em;margin-bottom:6px}
.how .box h4{font-size:10.2pt;font-weight:800;margin-bottom:4px}
.how .box p{font-size:8.1pt;color:var(--sub);line-height:1.46}
.lane{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:5mm}
.lane div{border-radius:10px;padding:8px 8px;font-size:7.6pt;line-height:1.38;color:#fff}
.lane b{display:block;font-size:8.8pt;margin-bottom:3px;font-weight:800}
/* ── 해설 ── */
.akey{border:1.5px solid var(--hair);border-radius:12px;overflow:hidden;margin-bottom:5mm}
.akey .hd{background:var(--ac);color:#fff;padding:7px 13px;font-size:9.6pt;font-weight:800;display:flex;gap:9px;align-items:baseline}
.akey .hd em{font-style:normal;font-size:8pt;opacity:.82;font-weight:400}
.akey table{width:100%;border-collapse:collapse;font-size:8.6pt}
.akey td{padding:9px 13px;border-bottom:1px solid #EEECE8;vertical-align:top;line-height:1.62}
.akey tr:last-child td{border-bottom:0}
.akey td.k{width:74px;font-weight:800;color:var(--ac);font-size:7.8pt;letter-spacing:.04em}
.trans{background:var(--cool);border-radius:10px;padding:14px 16px;font-size:9.1pt;line-height:1.82;text-align:justify}
.trans sup{font-size:6.4pt;font-weight:800;color:var(--gold);margin-right:1px}
h2.sechd{font-size:15pt;font-weight:800;margin-bottom:1.5mm}
h2.sechd + p{font-size:8.6pt;color:var(--sub);margin-bottom:3.5mm}

table.flow.plan td{padding:7px 12px}
table.flow td.body u{padding:0 16px}
.lane div{min-height:0}

/* ═══ ORUN FLOW ═══ */
.fbar{display:flex;border-radius:9px;overflow:hidden;margin-bottom:4.5mm}
.fbar div{flex:1;background:var(--navy);color:#fff;padding:9px 10px;font-size:8.1pt;line-height:1.4}
.fbar div+div{border-left:1px solid rgba(255,255,255,.2)}
.fbar b{display:block;font-size:7pt;letter-spacing:.12em;color:var(--yel);margin-bottom:4px;font-weight:800}
.model{border:1.8px solid var(--gold);background:var(--cream);border-radius:11px;padding:9px 14px 4px}
.model .cap{font-size:7.4pt;font-weight:800;letter-spacing:.16em;color:var(--gold);margin-bottom:11px;
 display:flex;justify-content:space-between}
.model .cap span{color:var(--faint);letter-spacing:.04em}
.mk{font-family:'Noto Serif CJK KR',serif;font-size:10.4pt;line-height:1.35}
.tk{display:inline-block;position:relative;text-align:center;vertical-align:top;
 padding-top:9px;padding-bottom:15px;margin:0 3px}
.tk em{position:absolute;top:0;left:50%;transform:translateX(-50%);font-style:normal;
 font-size:9pt;line-height:1;color:var(--deep);font-weight:800;pointer-events:none}
.tk b{display:block;line-height:1.24}
.tk i{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-style:normal;
 font-size:7.6pt;font-weight:800;line-height:1;white-space:nowrap}
.tk.s b{border-bottom:2.4px solid #2E8B7F}
.tk.s i,.tk.s2 i{color:#217A6E}
.tk.s2 b{border-bottom:2.4px dashed #2E8B7F}
.tk.v b,.tk.v2 b{color:var(--deep);font-weight:800}
.tk.v i,.tk.v2 i{color:var(--deep)}
.tk.c b{border:1.7px solid var(--gold);border-radius:5px;padding:0 6px;color:#8A5D10;font-weight:800}
.tk.m b{border-bottom:2.2px solid #B9BEC4}
.tk.m i{color:#C0392B}
.model .ko{border-top:1px dashed #E0D8BE;margin-top:2px;padding-top:8px;font-size:8.6pt;color:var(--sub)}
.model .ko b{color:var(--gold);font-weight:800;margin-right:6px}
.ftip{background:#EFF1F4;border-radius:8px;padding:9px 13px;font-size:8.1pt;color:var(--sub);margin-top:3.5mm;line-height:1.55}
.ftip b{color:var(--navy);font-weight:800}
.drill{border:1.4px solid var(--hair);border-radius:10px;padding:11px 14px 5px;margin-bottom:4mm;background:#fff}
.drill .h{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
.drill .n{font-size:7.6pt;font-weight:800;color:#fff;background:var(--ac);border-radius:5px;padding:2px 6px}
.drill .go{font-size:7.3pt;font-weight:800;color:var(--gold);letter-spacing:.03em}
.drill p{font-family:'Noto Serif CJK KR',serif;font-size:11.1pt;line-height:2.95;margin-bottom:6px}
/* ═══ Check Up 오답 이유 ═══ */
table.cu{width:100%;border-collapse:separate;border-spacing:0 4px;font-size:9.2pt;margin-bottom:2mm}
table.cu th{font-size:7.3pt;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);
 text-align:left;padding:0 10px 4px;font-weight:800}
table.cu td{padding:8px 11px;vertical-align:middle;line-height:1.4}
table.cu td.op{width:53%;background:var(--cool);border-radius:8px 0 0 8px}
table.cu td.op b{color:var(--ac);font-weight:700;margin-right:5px}
table.cu td.rs{background:var(--cream);border-left:3px solid var(--yel);border-radius:0 8px 8px 0}
/* ═══ Knowledge Bank ═══ */
.kb{border:1.8px solid var(--ac);border-radius:12px;overflow:hidden}
.kb .hd{background:var(--ac);color:#fff;padding:8px 15px;display:flex;gap:11px;align-items:baseline}
.kb .hd b{font-size:11.2pt;font-weight:800}
.kb .hd em{font-style:normal;font-size:8.2pt;opacity:.86}
.kb .hd .tag{margin-left:auto;font-size:7pt;letter-spacing:.16em;font-weight:800;color:var(--yel)}
.kb .bd{background:var(--tint)}
.kb .it{display:flex;gap:10px;margin-bottom:7px}
.kb .it:last-of-type{margin-bottom:0}
.kb .it .num{flex:0 0 19px;height:19px;border-radius:50%;background:var(--ac);color:#fff;
 font-size:7.6pt;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}
.kb .it h5{font-size:9.4pt;font-weight:800;color:var(--deep);margin-bottom:3px}
.kb .it p{font-size:8.2pt;line-height:1.55}
.kb .ask{background:#fff;border-radius:8px;padding:8px 13px;font-size:8.5pt;font-weight:700;
 color:var(--deep);margin-top:9px;display:flex;gap:8px}
.kb .ask span{color:var(--ac)}

table.slot{width:100%;border-collapse:separate;border-spacing:4px 0}
table.slot th{font-size:7.6pt;font-weight:700;color:var(--sub);text-align:left;padding:0 0 5px 3px;letter-spacing:.02em}
table.slot th b{color:var(--navy);font-weight:800;font-size:8.4pt}
table.slot td{height:11mm;background:var(--cream);border:1.3px solid #EEDCA4;border-top:0;
 border-radius:0 0 7px 7px;box-shadow:inset 0 3px 0 var(--yel)}
table.slot.bone td{height:9.5mm}
table.slot.bone td.lab{background:var(--tint);border-color:var(--hair);box-shadow:none;border-radius:7px;
 text-align:center;font-weight:800;color:var(--deep);font-size:9pt;vertical-align:middle}

/* ═══ 구문분석 (리딩그라피 지면) ═══ */
.task.ss .ico{flex:0 0 auto;width:36px;height:30px;background:#2B2A28;color:#fff;border-radius:4px;
 display:flex;align-items:center;justify-content:center;font-size:12pt;border-bottom:3.5px solid var(--yel)}
.task.ss h3 .en{font-size:7.2pt;letter-spacing:.22em;color:var(--faint);font-weight:800;margin-left:10px}
.oflow{background:var(--ac);color:#fff;border-bottom:3px solid var(--yel);border-radius:4px 4px 0 0;
 padding:7px 12px;text-align:center;font-size:8.4pt;font-weight:700;letter-spacing:.01em}
.oflow b{color:var(--yel);letter-spacing:.14em;margin-right:16px;font-weight:800}
.otip{background:var(--tint);padding:6px 12px;text-align:center;font-size:8pt;color:var(--sub);
 border-radius:0 0 4px 4px;margin-bottom:3.5mm}
.otip b{color:var(--deep);font-weight:800}
.sline{margin-bottom:1.9mm}
.sline .t{display:flex;align-items:baseline;gap:10px}
.sline .t .n{font-size:8.6pt;font-weight:800;color:var(--ac);white-space:nowrap}
.sline .t p{flex:1;font-family:'Noto Serif CJK KR',serif;font-size:11pt;line-height:2.15}
.sline .t .go{font-size:7.4pt;color:var(--faint);font-weight:700;white-space:nowrap}
/* ═══ READ RIGHT ═══ */
.rr{background:var(--ac);color:#fff;border-left:7px solid var(--yel);border-radius:4px;
 padding:9px 17px;margin-bottom:4mm}
.rr b{font-size:15pt;font-weight:800;letter-spacing:.03em;display:block}
.rr span{font-size:8.2pt;opacity:.85;display:block;margin-top:4px}
.rrh{font-size:10.6pt;font-weight:800;color:var(--deep);margin-bottom:3mm}
.rrh span{font-size:8.2pt;font-weight:400;color:var(--sub);margin-left:8px}
.rrq{margin-bottom:0.9mm}
.rrq .t{display:flex;gap:9px;align-items:baseline;margin-bottom:2px}
.rrq .t .n{font-size:7.8pt;font-weight:800;color:var(--ac);min-width:15px}
.rrq .t p{flex:1;font-size:9.2pt;line-height:1.38}
.rrq .t u{font-weight:800;color:var(--deep);text-decoration-thickness:1.6px}
.rrq .aline{height:5.6mm}

/* ═══ 플로차트 픽토그램 스트립 ═══ */
.strip{display:flex;align-items:stretch;gap:0;margin-bottom:4.5mm}
.strip .st{flex:1;text-align:center;padding:0 4px}
.strip .st .ci{width:52px;height:52px;margin:0 auto 6px;border-radius:50%;background:var(--tint);
 display:flex;align-items:center;justify-content:center}
.strip .st .ci svg{width:31px;height:31px}
.strip .st b{display:block;font-size:7.4pt;font-weight:800;color:var(--deep);line-height:1.3}
.strip .ar{flex:0 0 20px;display:flex;align-items:flex-start;justify-content:center;padding-top:20px;
 font-size:13pt;color:var(--ac);opacity:.5;font-weight:800}
/* ═══ Knowledge Bank 코너 삽화 ═══ */
.kb .bd{padding:11px 14px 12px}
.kb .row{display:flex;gap:13px;align-items:center}
.kb .bd .txt{flex:1;min-width:0}
.kb .vig{flex:0 0 43mm;background:#fff;border-radius:10px;padding:9px 8px 6px}
.kb .vig svg{width:100%;display:block}
.kb .vig .cap{font-size:7pt;font-weight:800;letter-spacing:.13em;color:var(--ac);text-align:center;margin-top:5px}
/* ═══ 책 색인 탭 ═══ */
.tab{position:absolute;right:0;top:44mm;width:9mm;padding:7mm 0;background:var(--ac);
 border-radius:5px 0 0 5px;color:#fff;text-align:center;writing-mode:vertical-rl;
 font-size:7.4pt;font-weight:800;letter-spacing:.18em}
/* ═══ 표지 보강 ═══ */
.cover .hb .c svg{width:50px;height:50px}
.cover .ornament{position:absolute;right:-40mm;top:-30mm;width:150mm;height:150mm;opacity:.07}
.cover .ornament svg{width:100%;height:100%}

.syn{border:1.5px solid var(--hair);border-radius:11px;overflow:hidden;margin-bottom:2.6mm}
.syn .hd{background:var(--tint);padding:7px 13px;display:flex;gap:10px;align-items:baseline}
.syn .hd .n{font-size:7.6pt;font-weight:800;color:#fff;background:var(--ac);border-radius:5px;padding:2px 7px}
.syn .hd b{font-size:10pt;font-weight:800;color:var(--deep)}
.syn .bd{padding:9px 14px 9px}
.syn .q{font-family:'Noto Serif CJK KR',serif;font-size:10.2pt;line-height:1.5;margin-bottom:6px}
.syn .q u{text-decoration:none;border-bottom:2.2px solid var(--ac);font-weight:700;color:var(--deep);padding-bottom:1px}
.syn .d{font-size:8.2pt;color:var(--sub);line-height:1.5;background:#FBFBFA;border-left:3px solid var(--ac);
 border-radius:0 6px 6px 0;padding:6px 11px}
.syn .d b{color:var(--deep);font-weight:800}
.syn .k{font-size:7.4pt;font-weight:800;color:var(--faint);letter-spacing:.04em;margin:6px 0 2px}

.syn .aline{height:7.6mm}
.sline .aline{height:7.7mm}
`;
