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
.sect{margin-bottom:6.8mm}
.sect:last-child{margin-bottom:0}
/* ── 영영풀이 매칭 ── */
.match{display:grid;grid-template-columns:1fr 1.55fr;gap:6mm}
.mcol h5{font-size:7.3pt;font-weight:800;letter-spacing:.15em;color:var(--faint);text-transform:uppercase;margin-bottom:6px}
.mrow{display:flex;align-items:center;gap:9px;padding:11.5px 0;border-bottom:1px dotted var(--hair)}
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
table.flow td{padding:11px 12px;background:var(--cool);vertical-align:middle}
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
table.para td{padding:14px 12px 14px 0;border-bottom:1px dotted var(--hair);vertical-align:top;line-height:1.45}
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
.akey td{padding:6px 12px;border-bottom:1px solid #EEECE8;vertical-align:top;line-height:1.5}
.akey tr:last-child td{border-bottom:0}
.akey td.k{width:74px;font-weight:800;color:var(--ac);font-size:7.8pt;letter-spacing:.04em}
.trans{background:var(--cool);border-radius:10px;padding:11px 13px;font-size:8.7pt;line-height:1.66;text-align:justify}
.trans sup{font-size:6.4pt;font-weight:800;color:var(--gold);margin-right:1px}
h2.sechd{font-size:15pt;font-weight:800;margin-bottom:1.5mm}
h2.sechd + p{font-size:8.6pt;color:var(--sub);margin-bottom:3.5mm}

table.flow.plan td{padding:7px 12px}
.lane div{min-height:0}
`;
