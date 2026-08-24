/* UNIT 08 — 티백은 실수로 태어났다 (Level 3) · 축약 유닛(5면)
   축약 유닛 = 풀 유닛의 1~4면(독해·구문·한 줄 해석·STEP 1) + 워크북면(R1·R2) 5면 구성.
   STEP 2~5·Knowledge Bank·R3~R7은 싣지 않는다. 해설은 2면.
   새 축약 유닛 작성법: 이 파일을 unitNN.js로 복사한 뒤 [DATA] 블록만 교체한다.
   레이아웃 코드는 건드리지 않는다. 풀 유닛(10면)은 unit01.js를 복사한다. */
const L = require("../scripts/lib");
const { fs, path, WORK, ASSETS,
  Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, VerticalAlign, BorderStyle, WidthType, ShadingType, TabStopType, LineRuleType,
  F, FD, FO, INK, SUB, FAINT, CHAR, NAVY, NAVY2, GOLD, YEL, AMB, TEAL, NAVYD, NAVYL,
  PAPER, COOL, GREY, FIELD, FLINE, HAIR, CLINE, WISP, W, GUT, BODY, NOB, noB,
  bd, t, p, cel, T, chipCellG, chipPairG, sp, brk, tab, thead, ask, ch, box, fieldRow, field, writeField, tagline, R, RM,
} = L;

module.exports = {
  no: "08",
  title: "티백은 실수로 태어났다",
  level: "3",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 08  티백은 실수로 태어났다",
  banner: ["08", "티백은 실수로 태어났다", "3"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "Thomas Sullivan was a famous tea trader in New York.",
  "One of the keys to his success was sending his customers new tea samples.",
  "However, he faced a problem: The tins that he used to send samples became too expensive.",
  "He needed a cheaper solution.",
  "Thomas didn’t want to disappoint his customers by not sending the samples anymore.",
  "Then, he had a great idea!",
  "In 1908, he decided to use silk bags for tea samples, instead of tins.",
  "These bags were cheaper, and also looked fancy.",
  "Interestingly, what happened next accidentally led to the invention of tea bags!",
  "Thomas thought people would take the tea leaves out of the silk bags and make tea with an infuser.",
  "But instead, some customers put the whole silk bag in boiling water.",
  "They found this more convenient, and the tea still tasted great.",
  "Soon, these tea bags became very popular.",
];
const num = (i) => t(String(i), { size: 13, bold: true, color: GOLD, sup: true });
function passageRuns(mark) {
  const out = [];
  SENT.forEach((s, i) => {
    out.push(num(i + 1), t(" ", { size: 19 }));
    const m = mark && mark[i + 1];
    if (m) m.forEach(r => out.push(r)); else out.push(t(s + "  ", { size: 19 }));
  });
  return out;
}
/* 지문 축약 재수록 (훈련·해설용) */
function reprint(mark) {
  return T([W], [new TableRow({ children: [
    cel(p(passageRuns(mark).map(r => r), { line: 244, after: 0, align: AlignmentType.JUSTIFIED }),
      { w: W, shade: COOL, m: { top: 105, bottom: 105, left: 230, right: 230 },
        b: { top: NOB, bottom: NOB, right: NOB, left: bd(10, NAVY) } }),
  ] })]);
}
/* ═══════════ [DATA] 1-3 지시어 표시용 마크 ═══════════ */
const DEIXIS = {
  4: [RM("He"), R(" needed a cheaper solution.  ")],
  8: [RM("These bags"), R(" were cheaper, and also looked fancy.  ")],
  12: [RM("They"), R(" found "), RM("this"), R(" more convenient, and the tea still tasted great.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u08.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  12: [t("They found ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("this", { size: 19, bold: true, underline: {} }),
      t(" more convenient, and the tea still tasted great.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A Happy Accident: How Tea Bags Were Born", "② The Best Tea Shops in New York",
 "③ How to Make an Infuser at Home", "④ Why Silk Is Better Than Cotton",
 "⑤ The Price of Tins in 1908"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Thomas Sullivan was a tea trader in New York.",
 "② The tins for tea samples became too expensive.",
 "③ In 1908, Thomas decided to use paper bags for tea samples.",
 "④ The silk bags were cheaper and also looked fancy.",
 "⑤ Some customers put the whole silk bag in boiling water."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) this가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① putting the whole silk bag in boiling water",
 "② taking the tea leaves out of the bag",
 "③ sending tea samples in expensive tins",
 "④ making tea with an infuser",
 "⑤ buying tea at a shop in New York"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그는 더 싼 해결책이 필요했다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 5단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("solution / a / needed / he / cheaper", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 7", { size: 14, bold: true, color: AMB }), t("   decide + to부정사 (~하기로 정하다)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("he ", { size: 18 }), t("decided", { size: 18, bold: true, color: NAVY }), t(" to use silk bags", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("decide, want, need 뒤에는 to+동사원형이 옵니다. '실크 주머니를 쓰기로 정했다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 2", { size: 14, bold: true, color: AMB }), t("   동명사(~ing) '~하는 것'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("One of the keys was ", { size: 18 }), t("sending", { size: 18, bold: true, color: NAVY }), t(" new tea samples", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사+ing가 '~하는 것'이라는 뜻의 명사가 됩니다. was 뒤에서 '~하는 것이었다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 7 구문", [t("I ", { size: 19 }), t("decided", { size: 19, bold: true, color: NAVY }), t(" to walk to school every morning", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 2 구문", [t("My favorite hobby is ", { size: 19 }), t("reading", { size: 19, bold: true, color: NAVY }), t(" comic books", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("Her dream is ", { size: 19 }), t("traveling", { size: 19, bold: true, color: NAVY }), t(" abroad", { size: 19, underline: {} }), t(", so she ", { size: 19 }), t("decided", { size: 19, bold: true, color: NAVY }), t(" to save money", { size: 19, underline: {} }), t(".", { size: 19 })]],
].forEach(([tag, runs], i) => {
  K.push(p([t("(" + (i + 1) + ") ", { size: 17, bold: true, color: AMB }), t("[" + tag + "]  ", { size: 14, bold: true, color: FAINT }), ...runs], { after: 45, line: 250 }));
  K.push(writeField(1, 320));
  K.push(spF(2, 52, 0.05));
});

K.push(sp(30));
K.push(...tab("구문분석", "", CHAR, "V"));
K.push(sp(120));

/* RUNE FLOW 바 */
K.push(T([W], [new TableRow({ children: [cel(
  p([t("ORUN FLOW   ", { f: FD, size: 13, color: YEL, ls: 14 }),
     t("1 주어 밑줄+S  \u2192  2 본동사 \u25b3+V  \u2192  3 접속사 [네모]  \u2192  4 종속절 S\u2032\u00b7V\u2032  \u2192  5 수식어(구) 밑줄+M", { size: 15, bold: true, color: "FFFFFF" })],
    { after: 0, align: AlignmentType.CENTER, line: 240 }),
  { w: W, shade: NAVY, b: { top: NOB, bottom: bd(6, YEL), left: NOB, right: NOB }, m: { top: 46, bottom: 46, left: 120, right: 120 } })] })]));
K.push(sp(60));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("분석 Tip   ", { size: 14, bold: true, color: GOLD }),
     t("조동사+동사", { size: 15, bold: true, color: NAVY }),
     t(" · ", { size: 15, color: FAINT }),
     t("have(has, had)+p.p", { size: 15, bold: true, color: NAVY }),
     t(" · ", { size: 15, color: FAINT }),
     t("be+p.p", { size: 15, bold: true, color: NAVY }), t("(수동태)", { size: 14, color: SUB }),
     t(" · ", { size: 15, color: FAINT }),
     t("be+~ing", { size: 15, bold: true, color: NAVY }), t("(진행형)", { size: 14, color: SUB }),
     t("  \u2192  한 덩어리의 동사로 표시! \u25b3", { size: 15, bold: true })],
    { after: 0, align: AlignmentType.CENTER, line: 235 }),
  { w: W, shade: COOL, b: { top: bd(3, CLINE), bottom: bd(3, CLINE), left: NOB, right: NOB }, m: { top: 38, bottom: 38, left: 120, right: 120 } })] })]));
K.push(spF(2, 75, 0.07));

K.push(sp(40));

/* [DATA] 먼저 보기 — 다 표시된 문장 (문장 11) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || "\u00A0", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 11을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([750, 1200, 2100, 700, 2400, 1780], [new TableRow({ children: [
    exSeg([t("But", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 750),
    exSeg([t("instead,", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어", MRED, 1200),
    exSeg([t("some customers", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 2100),
    exSeg([t("put", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 700, "△"),
    exSeg([t("the whole silk bag", { size: 18 })], "", FAINT, 2400),
    exSeg([t("in boiling water", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1780),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[5, "Thomas didn’t want to disappoint his customers by not sending the samples anymore."],
 [10, "Thomas thought people would take the tea leaves out of the silk bags."],
 [12, "They found this more convenient, and the tea still tasted great."]].forEach(([n, c]) => {
  K.push(p([t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + c, { size: 20 }),
    t("      \u2192 문장에 직접 표시!", { size: 13, color: FAINT })], { after: 58, line: 520 }));
  K.push(writeField(1, 410));
  K.push(spF(2, 150, 0.08));
});

/* ═══════════ 3면 [DATA] 한 줄 해석 ═══════════ */
K.push(brk());
K.push(T([1050, W - 1050], [new TableRow({ children: [
  cel(new Paragraph({ children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(ASSETS, "icons", "steps.png")), transformation: { width: 34, height: 34 } })],
    alignment: AlignmentType.CENTER, spacing: { before: 130, after: 0, line: 460 } }),
    { w: 1050, shade: NAVY, va: VerticalAlign.CENTER, m: { top: 175, bottom: 175, left: 0, right: 0 }, b: { top: NOB, right: NOB, left: bd(26, YEL), bottom: bd(6, YEL) } }),
  cel([
  new Paragraph({ children: [t("READ RIGHT", { f: FO, size: 22, color: "FFFFFF", ls: 10 })], tabStops: [{ type: TabStopType.RIGHT, position: 8300 }], spacing: { after: 55, line: 350 } }),
  new Paragraph({ children: [t("Warming Up! ", { size: 16, bold: true, color: "C3CDD6" }), t("한 줄 해석 · 소재와 핵심어 찾기 · 지시어 이해하기", { size: 16, color: "C3CDD6" })], spacing: { after: 0, line: 230 } }),
], { w: W - 1050, shade: NAVY, va: VerticalAlign.CENTER, m: { top: 175, bottom: 175, left: 60, right: 250 }, b: { top: NOB, right: NOB, left: NOB, bottom: bd(6, YEL) } }),
] })]));
K.push(spF(3, 140, 0.10));
K.push(p([t("한 줄 해석", { size: 19, bold: true, color: NAVY }),
  t("   한 문장씩 끊어, 우리말 한 줄로 해석해 보세요. 밑줄 친 지시어는 무엇을 가리키는지 생각하며!", { size: 15, color: SUB })], { after: 90, line: 245 }));
SENT.forEach((s, i) => {
  const n = i + 1;
  K.push(p([t(String(n).padStart(2, "0") + "  ", { f: FD, size: 14, color: NAVY2 })].concat(
      DEIXIS[n] ? DEIXIS[n] : [t(s, { size: 17 })]
    ), { after: 34, line: 250, indent: { left: 0 } }));
  K.push(writeField(1, 300));
  K.push(spF(3, 52, 0.055));
});

/* ═══════════ 4면 [DATA] STEP 1 소재·핵심어·지시어 ═══════════ */
K.push(brk());

function stepHead(n, kr, ds) {
  return T([GUT, BODY], [new TableRow({ children: [
    cel([
      new Paragraph({ children: [t("READ RIGHT", { f: FO, size: 7, bold: true, color: YEL, ls: 8 })],
        alignment: AlignmentType.CENTER, spacing: { after: 8, line: 140 } }),
      new Paragraph({ children: [t(n, { f: FD, size: 24, color: "FFFFFF" })],
        alignment: AlignmentType.CENTER, spacing: { after: 0, line: 270 } }),
    ], { w: GUT, shade: NAVY, va: VerticalAlign.CENTER, m: { top: 40, bottom: 46, left: 0, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(14, YEL) } }),
    cel([
      new Paragraph({ children: [t(kr, { f: FD, size: 20, color: NAVY })], spacing: { after: 28, line: 260 } }),
      new Paragraph({ children: [t(ds, { size: 17, color: SUB })], spacing: { after: 0, line: 230 } }),
    ], { w: BODY, va: VerticalAlign.CENTER, m: { top: 30, bottom: 50, left: 190, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(8, YEL) } }),
  ] })]);
}

K.push(stepHead("1", "소재와 핵심어 찾기", "무엇에 관한 글인지 잡으면 절반은 읽은 것입니다."));
K.push(spF(4, 120, 0.08));
K.push(reprint(DEIXIS));
K.push(spF(4, 300, 0.10));

K.push(p([t("1-1  ", { size: 18, bold: true, color: GOLD }), t("소재 찾기", { size: 19, bold: true }),
  t("      이 글은 무엇에 관한 글인가요? 하나만 고르세요.", { size: 16, color: SUB })], { after: 90, line: 250 }));
["① 뉴욕의 유명한 홍차 가게들", "② 우연히 태어난 티백 이야기", "③ 실크로 옷을 만드는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["silk", "실크"], ["accidentally", "우연히"], ["invention", "발명"], ["tins", "양철통"], ["customers", "고객들"], ["New York", "뉴욕"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 토마스가 새로 쓴 재료  ② 그 일이 일어난 방식  ③ 그 결과 생긴 것 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · this 같은 지시어는 앞에 나온 말을 대신합니다. 사람도, 물건도, 명칭도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2350, 6950];
const ahd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(aw, [
  thead(["문장", "지시어", "무엇을 가리키는가 \u2014 하나에 \u25cb표"], aw),
  ...(() => {
    const chipC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16 })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 225 } }),
      { w, shade: "FFFFFF", va: VerticalAlign.CENTER, m: { top: 68, bottom: 68, left: 60, right: 60 },
        b: { top: bd(5, CLINE), bottom: bd(5, CLINE), left: bd(5, CLINE), right: bd(5, CLINE) } });
    const labC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 40 } });
    const gapC = (w) => cel(p(t(""), { after: 0 }), { w, m: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    const chips4 = (l1, a1, b1, l2, a2, b2, lw, cw) => T([lw, cw, 150, cw, 260, lw, cw, 150, cw], [new TableRow({ children: [
      labC(l1, lw), chipC(a1, cw), gapC(150), chipC(b1, cw), gapC(260),
      labC(l2, lw), chipC(a2, cw), gapC(150), chipC(b2, cw),
    ] })]);
    return [
    ["4", "He", [t("Thomas Sullivan (토마스 설리번)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["8", "These bags", chips2("실크 주머니", "양철통", 1900), false],
    ["12", "They", chips2("일부 고객들", "토마스", 1900), false],
    ["12", "this", chips2("통째로 넣기", "찻잎 꺼내기", 2100), false],
  ]; })().map(([sn, exp, runs, isEx]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(sn, { size: 18, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: aw[0], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(exp, { size: 18, bold: true, color: NAVY })], spacing: { after: 0 } }),
      { w: aw[1], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 150, right: 80 } }),
    cel(Array.isArray(runs) ? new Paragraph({ children: runs, spacing: { after: 0 } }) : [runs],
      { w: aw[2], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: Array.isArray(runs) ? 265 : 175, bottom: Array.isArray(runs) ? 265 : 175, left: 150, right: 80 } }),
  ] })),
]));

/* ═══════════ 5면 [DATA] RE:RIGHT 워크북 R1·R2 ═══════════ */
function wbAsk(n, ty, stem, pts) {
  return T([GUT, BODY], [new TableRow({ children: [
    cel([
      new Paragraph({ children: [t("RE:RIGHT", { f: FO, size: 7, bold: true, color: YEL, ls: 8 })],
        alignment: AlignmentType.CENTER, spacing: { after: 8, line: 140 } }),
      new Paragraph({ children: [t(n.replace("R", ""), { f: FD, size: 24, color: "FFFFFF" })],
        alignment: AlignmentType.CENTER, spacing: { after: 0, line: 270 } }),
    ], { w: GUT, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 40, bottom: 46, left: 0, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(14, YEL) } }),
    cel([
      new Paragraph({ children: [t(ty, { f: FD, size: 20, color: TEAL })], spacing: { after: 28, line: 260 } }),
      new Paragraph({ children: [t(stem, { size: 17, color: SUB }), ...(pts ? [t("  [" + pts + "]", { size: 15, color: FAINT })] : [])], spacing: { after: 0, line: 235 } }),
    ], { w: BODY, va: VerticalAlign.CENTER, m: { top: 30, bottom: 50, left: 190, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(8, YEL) } }),
  ] })]);
}

K.push(brk());
K.push(T([1050, W - 1050], [new TableRow({ children: [
  cel(new Paragraph({ children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(ASSETS, "icons", "reright.png")), transformation: { width: 34, height: 34 } })],
    alignment: AlignmentType.CENTER, spacing: { before: 130, after: 0, line: 460 } }),
    { w: 1050, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 160, bottom: 150, left: 0, right: 0 }, b: { top: NOB, right: NOB, left: bd(26, YEL), bottom: bd(6, YEL) } }),
  cel([
  new Paragraph({ children: [t("RE:RIGHT", { f: FO, size: 22, color: "FFFFFF", ls: 10 })], tabStops: [{ type: TabStopType.RIGHT, position: 8300 }], spacing: { after: 55, line: 350 } }),
  new Paragraph({ children: [t("Step Up! ", { size: 16, bold: true, color: "C3E0DA" }), t("같은 지문을 두 가지 방법으로 다시 만납니다 \u2014 정독(True/False)과 흐름(사건 순서).", { size: 16, color: "C3E0DA" })], spacing: { after: 0, line: 230 } }),
], { w: W - 1050, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 160, bottom: 150, left: 60, right: 250 }, b: { top: NOB, right: NOB, left: NOB, bottom: bd(6, YEL) } }),
] })]));
K.push(spF(5, 140, 0.14));
K.push(reprint());
K.push(spF(5, 240, 0.24));

/* ── [DATA] R1 True / False ── */
K.push(wbAsk("R1", "True / False · 정독 훈련", "본문의 내용과 맞으면 T, 다르면 F에 표시하세요. (근거 문장 번호를 함께 적어 보세요.)"));
K.push(sp(120));
const tfw = [700, 7000, 2300];
const tfb = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(tfw, [
  thead(["", "문장", "T / F"], tfw, TEAL),
  ...[
    "Thomas Sullivan was a famous tea trader in New York.",
    "He sent his customers new tea samples.",
    "The tins that he used to send samples became too cheap.",
    "In 1908, he decided to use silk bags instead of tins.",
    "The silk bags were more expensive than the tins.",
    "Thomas planned to invent tea bags from the beginning.",
    "Some customers put the whole silk bag in boiling water.",
    "The customers found the silk bag less convenient.",
  ].map((s, i) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(String(i + 1), { size: 17, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[0], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(s, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: tfw[1], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 150, right: 100 } }),
    cel(new Paragraph({ children: [t("\u25A1 T      \u25A1 F", { size: 17, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[2], shade: FIELD, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 100, right: 100 } }),
  ] })),
]));
K.push(spF(5, 240, 0.34));

/* ── [DATA] R2 사건 순서 잡기 ── */
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "이야기 속 사건과 축제의 모습 ⓐ~ⓓ를 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Thomas started sending tea samples in silk bags.",
      "ⓑ The tins for tea samples became too expensive.",
      "ⓒ Tea bags became very popular.",
      "ⓓ Some customers put the whole bag in boiling water."]
    .map((s, i, a) => p([t(s, { size: 18 })], { after: i === a.length - 1 ? 0 : 150, line: 280 })),
], { shade: PAPER }));
K.push(sp(140));
K.push(field([p([
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }),
], { after: 0, line: 400, align: AlignmentType.CENTER })]));

/* ═══════════ 판면 ═══════════ */
  },

  renderExplain(ctx) {
    const { K, spF, FT } = ctx;
const H = (s) => K.push(T([W], [new TableRow({ children: [
  cel(new Paragraph({ children: [t(s, { size: 18, bold: true, color: NAVY })], spacing: { after: 0, line: 250 } }),
    { w: W, m: { top: 25, bottom: 25, left: 150, right: 0 }, b: { top: NOB, bottom: NOB, right: NOB, left: bd(12, YEL) } }),
] })]));
const B = (s, last) => K.push(p([t(s, { size: 17, color: SUB })], { after: last ? 200 : 38, line: 258, indent: { left: 0 } }));
const Hs = (s) => { K.push(sp(82)); H(s); K.push(sp(46)); };

K.push(...tab("정답 및 해설", "UNIT 08  티백은 실수로 태어났다", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("He needed a cheaper solution.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("Thomas(S)·didn’t want(△V)·by not sending the samples(M)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("Thomas(S)·thought(△V)·people(S′)·would take(△V′)", { size: 17, bold: true })], { after: 22 }),
  p([t("문12 ", { size: 17, bold: true, color: NAVY2 }), t("They(S)·found(△V)·and[네모]·the tea(S′)·tasted(△V′)·great", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 매일 아침 학교까지 걸어가기로 정했다  (2) 내가 가장 좋아하는 취미는 만화책을 읽는 것이다  (3) 그녀의 꿈은 해외를 여행하는 것이어서, 돈을 모으기로 정했다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 silk · accidentally · invention   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4T · 5F · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓓ → ⓒ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 값싼 대안으로 고른 실크 주머니가 뜻밖에 티백의 발명으로 이어진 과정(문장 7–13)을 들려준다. 소재와 '우연'이라는 특징을 함께 담은 ①이 적절하다. ④·⑤는 실크·양철통만 건드린 지엽적 오답, ②·③은 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 7에서 1908년에 쓰기로 한 것은 종이 봉지가 아니라 실크 주머니(silk bags)다. ①은 문장 1, ②는 문장 3, ④는 문장 8, ⑤는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) this는 바로 앞 문장 11의 행동, 곧 '실크 주머니를 통째로 끓는 물에 넣는 것'을 가리킨다. 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   He needed a cheaper solution.");
B("문장 4를 그대로 복원한다. ① 첫 글자는 대문자 He.   ② needed 뒤에 목적어가 온다.   ③ a cheaper solution — 관사 a를 빠뜨리지 않는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 silk · accidentally · invention     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 실크 주머니가 우연히 티백이 된 이야기다. ① 가게 소개도, ③ 실크로 옷을 만드는 이야기도 아니다.");
B("1-2   ○표 할 세 단어: silk(힌트① 새로 쓴 재료) · accidentally(힌트② 일어난 방식) · invention(힌트③ 그 결과). 나머지 셋(tins · customers · New York)은 배경일 뿐이다.");
B("1-3   문장 8 — These bags는 실크 주머니에 ○ (문장 7의 그 주머니).   문장 12 — They는 일부 고객들에 ○, this는 통째로 넣기에 ○.");
B("[학습 포인트]   문장 12에서 They(사람)와 this(행동)가 서로 다른 것을 가리킨다. 한 문장 안에서도 지시어마다 짝이 다르다는 점을 확인하자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 T · 5 F · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 T — 문장 2.   3 F — 문장 3: 너무 싸진(cheap) 것이 아니라 너무 비싸졌다(expensive).   4 T — 문장 7.   5 F — 문장 8: 더 비싼 것이 아니라 더 쌌다(cheaper).   6 F — 문장 9: 처음부터 계획한 것이 아니라 우연히(accidentally) 일어났다.   7 T — 문장 11.   8 F — 문장 12: 덜 편한 것이 아니라 더 편하다고(more convenient) 느꼈다.  거짓 문장은 모두 한 요소(cheap, more expensive, planned, less)만 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓐ → ⓓ → ⓒ");
B("ⓑ 양철통 값이 너무 비싸진다(문장 3) → ⓐ 실크 주머니로 샘플을 보내기 시작한다(문장 7) → ⓓ 일부 고객이 주머니째 끓는 물에 넣는다(문장 11) → ⓒ 티백이 큰 인기를 얻는다(문장 13). 문장 9는 '다음에 일어난 일'을 미리 알려 주는 예고 문장이어서, 서술 순서와 사건 순서가 한 번 어긋난다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("토마스 설리번은 뉴욕의 유명한 차 상인이었다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그의 성공 비결 중 하나는 고객들에게 새로운 차 샘플을 보내는 것이었다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런데 그는 문제에 부딪혔다. 샘플을 보낼 때 쓰던 양철통이 너무 비싸진 것이다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 더 싼 해결책이 필요했다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("토마스는 샘플을 더 이상 보내지 않아 고객들을 실망시키고 싶지 않았다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그때, 그에게 멋진 생각이 떠올랐다!  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("1908년, 그는 양철통 대신 차 샘플용으로 실크 주머니를 쓰기로 정했다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 주머니는 더 쌌고, 게다가 고급스러워 보이기까지 했다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("흥미롭게도, 그다음에 일어난 일이 우연히 티백의 발명으로 이어졌다!  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("토마스는 사람들이 실크 주머니에서 찻잎을 꺼내 인퓨저로 차를 우릴 것이라고 생각했다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런데 그 대신, 일부 고객들은 실크 주머니를 통째로 끓는 물에 넣었다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 이것이 더 편하다고 느꼈고, 차 맛도 여전히 훌륭했다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("머지않아, 이 티백은 아주 인기를 끌게 되었다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
