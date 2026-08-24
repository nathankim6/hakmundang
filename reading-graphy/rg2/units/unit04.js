/* UNIT 04 — 아침 식사에서 시작되었어요 (Level 2)
   풀 유닛(10면). unit01.js 정본 템플릿에서 [DATA] 블록만 교체했다. */
const L = require("../scripts/lib");
const { fs, path, WORK, ASSETS,
  Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, VerticalAlign, BorderStyle, WidthType, ShadingType, TabStopType, LineRuleType,
  F, FD, FO, INK, SUB, FAINT, CHAR, NAVY, NAVY2, GOLD, YEL, AMB, TEAL, NAVYD, NAVYL,
  PAPER, COOL, GREY, FIELD, FLINE, HAIR, CLINE, WISP, W, GUT, BODY, NOB, noB,
  bd, t, p, cel, T, chipCellG, chipPairG, sp, brk, tab, thead, ask, ch, box, fieldRow, field, writeField, tagline, R, RM,
} = L;

module.exports = {
  no: "04",
  title: "아침 식사에서 시작되었어요",
  level: "2",
  foot: "UNIT 04  아침 식사에서 시작되었어요",
  banner: ["04", "아침 식사에서 시작되었어요", "2"],
  timeline: ["1964|작은 시작|빌과 필이 신발 회사를\\n함께 세우다",
             "1971|와플 아이디어|아침 식탁의 와플 기계에서\\n밑창 아이디어를 얻다",
             "1974|와플 트레이너|와플 밑창 운동화가\\n큰 인기를 얻다",
             "오늘|이어지는 디자인|많은 운동화가 이 디자인을\\n계속 사용하다"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "Bill Bowerman was a running coach at a college in the U.S.",
  "He always wanted to make better shoes for running.",
  "So he used to take apart shoes and make small changes to improve them.",
  "He often tested his new shoe ideas with his friend, Phil Knight.",
  "Phil wasn’t a fast runner.",
  "So if any shoes could help him run faster, they were considered good ones.",
  "One day, while Bill was having breakfast, he noticed his wife’s waffle iron.",
  "The iron had a special pattern.",
  "It gave him a great idea!",
  "He decided to make a shoe bottom that looked like a waffle.",
  "At first, it didn’t work well, but he kept trying and finally succeeded.",
  "The new waffle shoes made runners much faster.",
  "Even today, many shoes use this design.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–6 [C]7–9 [D]10–11 [E]12–13 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 7: "C", 10: "D", 12: "E" };
function segPassage() {
  const out = [];
  SENT.forEach((x, i) => {
    const n = i + 1;
    if (SEGOF[n]) {
      if (n !== 1) out.push(t("  ", { size: 17 }));
      out.push(t("[" + SEGOF[n] + "]", { size: 15, bold: true, color: SEGCOL[SEGOF[n]] }), t(" ", { size: 17 }));
    }
    out.push(t(String(n), { size: 12, bold: true, color: GOLD, sup: true }), t(" ", { size: 17 }));
    out.push(t(x + "  ", { size: 17, color: SUB }));
  });
  return out;
}
/* ═══════════ [DATA] 1-3 지시어 표시용 마크 ═══════════ */
const R = (x) => t(x, { size: 17, color: SUB });
const RM = (x) => t(x, { size: 17, bold: true, color: NAVY, underline: {} });
const DEIXIS = {
  3: [R("So he used to take apart shoes and make small changes to improve "), RM("them"), R(".  ")],
  6: [R("So if any shoes could help "), RM("him"), R(" run faster, "), RM("they"), R(" were considered good ones.  ")],
  9: [RM("It"), R(" gave him a great idea!  ")],
  13: [R("Even today, many shoes use "), RM("this design"), R(".  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u04.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  9: [t("(A) ", { size: 19, bold: true }), t("It", { size: 19, bold: true, underline: {} }),
      t(" gave him a great idea!  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A Great Shoe Idea from a Waffle Iron", "② How to Cook Waffles for Breakfast",
 "③ The Life of a Fast Runner, Phil Knight", "④ Popular Sports at U.S. Colleges",
 "⑤ Why Breakfast Is the Most Important Meal"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Bill Bowerman was a running coach at a U.S. college.",
 "② Bill tested his new shoe ideas with Phil Knight.",
 "③ Phil Knight was a very fast runner.",
 "④ Bill got a great idea from a waffle iron.",
 "⑤ Many shoes still use the waffle design today."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) It이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the special pattern of the waffle iron",
 "② Bill’s breakfast on the table",
 "③ Phil Knight’s fast running",
 "④ the college in the U.S.",
 "⑤ Bill’s new running shoes"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그 틀에는 특별한 무늬가 있었다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 6단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("iron / had / special / the / a / pattern", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   used to + 동사원형 ‘~하곤 했다’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("he ", { size: 18 }), t("used to", { size: 18, bold: true, color: NAVY }), t(" take apart shoes", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("used to+동사원형은 과거의 습관을 나타냅니다. ‘신발을 분해하곤 했다’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 7", { size: 14, bold: true, color: AMB }), t("   while + 과거진행형 ‘~하는 동안’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("while", { size: 18, bold: true, color: NAVY }), t(" Bill ", { size: 18 }), t("was having", { size: 18, bold: true, color: NAVY, underline: {} }), t(" breakfast", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("while 뒤에 be+~ing(진행형)이 오면 ‘~하고 있는 동안’이라는 뜻이 됩니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 3 구문", [t("I ", { size: 19 }), t("used to", { size: 19, bold: true, color: NAVY }), t(" swim every summer", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 7 구문", [t("While", { size: 19, bold: true, color: NAVY }), t(" she ", { size: 19 }), t("was cooking", { size: 19, bold: true, color: NAVY, underline: {} }), t(", the phone rang.", { size: 19 })]],
 ["둘 다!", [t("He ", { size: 19 }), t("used to", { size: 19, bold: true, color: NAVY }), t(" sing", { size: 19, underline: {} }), t(" ", { size: 19 }), t("while", { size: 19, bold: true, color: NAVY }), t(" he ", { size: 19 }), t("was taking", { size: 19, bold: true, color: NAVY, underline: {} }), t(" a shower.", { size: 19 })]],
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
     t("1 주어 밑줄+S  →  2 본동사 △+V  →  3 접속사 [네모]  →  4 종속절 S′·V′  →  5 수식어(구) 밑줄+M", { size: 15, bold: true, color: "FFFFFF" })],
    { after: 0, align: AlignmentType.CENTER, line: 240 }),
  { w: W, shade: NAVY, b: { top: NOB, bottom: bd(6, YEL), left: NOB, right: NOB }, m: { top: 46, bottom: 46, left: 120, right: 120 } })] })]));
K.push(sp(60));
/* 분석 Tip — 한 덩어리 동사 원칙 */
K.push(T([W], [new TableRow({ children: [cel(
  p([t("분석 Tip   ", { size: 14, bold: true, color: GOLD }),
     t("조동사+동사", { size: 15, bold: true, color: NAVY }),
     t(" · ", { size: 15, color: FAINT }),
     t("have(has, had)+p.p", { size: 15, bold: true, color: NAVY }),
     t(" · ", { size: 15, color: FAINT }),
     t("be+p.p", { size: 15, bold: true, color: NAVY }), t("(수동태)", { size: 14, color: SUB }),
     t(" · ", { size: 15, color: FAINT }),
     t("be+~ing", { size: 15, bold: true, color: NAVY }), t("(진행형)", { size: 14, color: SUB }),
     t("  →  한 덩어리의 동사로 표시! △", { size: 15, bold: true })],
    { after: 0, align: AlignmentType.CENTER, line: 235 }),
  { w: W, shade: COOL, b: { top: bd(3, CLINE), bottom: bd(3, CLINE), left: NOB, right: NOB }, m: { top: 38, bottom: 38, left: 120, right: 120 } })] })]));
K.push(spF(2, 75, 0.07));

K.push(sp(40));

/* [DATA] 먼저 보기 — 다 표시된 문장 (문장 7: 문두 M + 접속사 + 진행형 덩어리) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || " ", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 7을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([898, 976, 605, 1427, 1229, 544, 1031, 2220], [new TableRow({ children: [
    exSeg([t("One day,", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 898),
    exSeg([t("while", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 976),
    exSeg([t("Bill", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 605),
    exSeg([t("was having", { size: 18, bold: true, color: NAVY })], "V′ 한 덩어리", NAVY, 1427, "△"),
    exSeg([t("breakfast,", { size: 18 })], "", FAINT, 1229),
    exSeg([t("he", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 544),
    exSeg([t("noticed", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1031, "△"),
    exSeg([t("his wife’s waffle iron", { size: 18 })], "", FAINT, 2220),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[1, "Bill Bowerman was a running coach at a college in the U.S."],
 [6, "So if any shoes could help him run faster, they were considered good ones."],
 [11, "At first, it didn’t work well, but he kept trying and finally succeeded."]].forEach(([n, c]) => {
  K.push(p([t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + c, { size: 20 }),
    t("      → 문장에 직접 표시!", { size: 13, color: FAINT })], { after: 58, line: 520 }));
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
  new Paragraph({ children: [t("Warming Up! ", { size: 16, bold: true, color: "C3CDD6" }), t("키워드 찾기 · 플로차트 · 주제문 작성 · 요약문 완성 · 패러프레이징", { size: 16, color: "C3CDD6" })], spacing: { after: 0, line: 230 } }),
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

/* ═══════════ 4면 [DATA] STEP 1 ═══════════ */
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
["① 와플을 맛있게 굽는 방법", "② 와플 기계에서 시작된 운동화 발명", "③ 미국 대학의 달리기 수업"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["waffle shoes", "와플 신발"], ["kept trying", "계속 시도함"], ["faster", "더 빠른"], ["breakfast", "아침 식사"], ["coach", "코치"], ["iron", "(와플) 틀"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 발명된 것  ② 발명가의 태도  ③ 신발이 만든 변화 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · them 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서 서로 다른 것을 가리킬 수도 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2050, 7250];
const ahd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(aw, [
  thead(["문장", "지시어", "무엇을 가리키는가 — 하나에 ○표"], aw),
  ...(() => {
    const chipC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16 })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 225 } }),
      { w, shade: "FFFFFF", va: VerticalAlign.CENTER, m: { top: 68, bottom: 68, left: 60, right: 60 },
        b: { top: bd(5, CLINE), bottom: bd(5, CLINE), left: bd(5, CLINE), right: bd(5, CLINE) } });
    const labC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 40 } });
    const gapC = (w) => cel(p(t(""), { after: 0 }), { w, m: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    const chips8 = () => T([760, 1150, 170, 1150, 300, 900, 1150, 170, 1150], [new TableRow({ children: [
      labC("him =", 760), chipC("필", 1150), gapC(170), chipC("빌", 1150), gapC(300),
      labC("they =", 900), chipC("신발들", 1150), gapC(170), chipC("러너들", 1150),
    ] })]);
    return [
    ["3", "them", [t("shoes (신발들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["6", "him · they", chips8(), false],
    ["9", "It", chips2("특별한 무늬", "아침 식사", 1900), false],
    ["13", "this design", chips2("와플 모양 밑창", "대학의 로고", 1900), false],
  ]; })().map(([sn, exp, runs, isEx]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(sn, { size: 18, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: aw[0], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(exp, { size: 18, bold: true, color: NAVY })], spacing: { after: 0 } }),
      { w: aw[1], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 150, right: 80 } }),
    cel(Array.isArray(runs) ? new Paragraph({ children: runs, spacing: { after: 0 } }) : [runs],
      { w: aw[2], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: Array.isArray(runs) ? 265 : 175, bottom: Array.isArray(runs) ? 265 : 175, left: 150, right: 80 } }),
  ] })),
]));

/* ═══════════ 5면 [DATA] STEP 2 글의 흐름 잡기 ═══════════ */
K.push(brk());
K.push(stepHead("2", "글의 흐름 잡기", "연결어를 따라가면 글의 길이 보입니다."));
K.push(spF(5, 130, 0.18));

K.push(p([t("2-1  ", { size: 18, bold: true, color: GOLD }), t("연결어 찾기", { size: 19, bold: true }),
  t("      밑줄 친 연결어가 어떤 일을 하는지, 괄호 안에서 골라 ○표 하세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
const gw = [900, 6100, 3000];
const ghd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(gw, [
  thead(["문장", "본문 문장 (연결어 밑줄)", "하는 일"], gw),
  ...[
    ["3", [t("So", { size: 17, bold: true, color: NAVY, underline: {} }), t(" he used to take apart shoes and make small changes.", { size: 17 })], ["결과", "이유"]],
    ["6", [t("So ", { size: 17 }), t("if", { size: 17, bold: true, color: NAVY, underline: {} }), t(" any shoes could help him run faster, they were good ones.", { size: 17 })], ["조건", "순서"]],
    ["7", [t("One day, ", { size: 17 }), t("while", { size: 17, bold: true, color: NAVY, underline: {} }), t(" Bill was having breakfast, he noticed the waffle iron.", { size: 17 })], ["~하는 동안", "~때문에"]],
    ["11", [t("At first, it didn’t work well, ", { size: 17 }), t("but", { size: 17, bold: true, color: NAVY, underline: {} }), t(" he kept trying.", { size: 17 })], ["반전", "결과"]],
  ].map(([sn, runs, pick]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(sn, { size: 18, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: gw[0], shade: GREY, b: ghd, va: VerticalAlign.CENTER, m: { top: 190, bottom: 190, left: 0, right: 0 } }),
    cel(new Paragraph({ children: runs, spacing: { after: 0, line: 252 } }),
      { w: gw[1], shade: GREY, b: ghd, va: VerticalAlign.CENTER, m: { top: 190, bottom: 190, left: 150, right: 100 } }),
    cel([chipPairG(pick[0], pick[1], 1150, 180)],
      { w: gw[2], shade: FIELD, b: ghd, va: VerticalAlign.CENTER, m: { top: 130, bottom: 130, left: 170, right: 80 } }),
  ] })),
]));
K.push(spF(5, 340, 0.34));

K.push(p([t("2-2  ", { size: 18, bold: true, color: GOLD }), t("흐름 지도(Flow Chart) 완성하기", { size: 19, bold: true }),
  t("      본문은 [A]–[E] 다섯 구간으로 나뉩니다. 흐름 지도의 빈칸에 알맞은 역할을 <보기>에서 골라 쓰세요.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [
  cel(p(segPassage(), { line: 258, after: 0, align: AlignmentType.JUSTIFIED }),
    { w: W, shade: COOL, m: { top: 120, bottom: 120, left: 230, right: 230 },
      b: { top: NOB, bottom: NOB, right: NOB, left: bd(10, NAVY) } }),
] })]));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  T([700, 1400, 220, 1400, 220, 1400], [new TableRow({ children: [
    cel(new Paragraph({ children: [t("보기", { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w: 700, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 60 } }),
    chipCellG("계기", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("오늘날", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("요리법", 1400),
  ] })]),
  { w: W, shade: GREY, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 90, bottom: 90, left: 2450, right: 120 } })] })]));
K.push(sp(115));
function flowCell(seg, top, body, blank) {
  return cel([
    new Paragraph({ children: [t("[" + seg + "]", { size: 14, bold: true, color: SEGCOL[seg] })], alignment: AlignmentType.CENTER, spacing: { after: 32, line: 180 } }),
    blank
      ? new Paragraph({ children: [new TextRun({ text: "          ", size: 16, font: F, underline: {} })], alignment: AlignmentType.CENTER, spacing: { after: 55, line: 260 } })
      : new Paragraph({ children: [t(top, { size: 15, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 42, line: 200 } }),
    new Paragraph({ children: [t(body, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 212 } }),
  ], { w: 1830, shade: blank ? FIELD : GREY, va: VerticalAlign.CENTER, m: { top: 215, bottom: 215, left: 70, right: 70 },
      b: { top: bd(4, blank ? FLINE : CLINE), bottom: bd(4, blank ? FLINE : CLINE), left: bd(4, blank ? FLINE : CLINE), right: bd(4, blank ? FLINE : CLINE) } });
}
const arrowCell = () => cel(new Paragraph({ children: [t("→", { size: 18, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
  { w: 212, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 0 } });
K.push(T([1830, 212, 1830, 212, 1830, 212, 1830, 212, 1830], [new TableRow({ children: [
  flowCell("A", "소개", "문장 1–2", false),
  arrowCell(),
  flowCell("B", "노력", "문장 3–6", false),
  arrowCell(),
  flowCell("C", null, "문장 7–9", true),
  arrowCell(),
  flowCell("D", "성공", "문장 10–11", false),
  arrowCell(),
  flowCell("E", null, "문장 12–13", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 한 발명의 이야기를 들려주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일을 기록한 일기",
 "④ 친구에게 안부를 전하는 편지",
 "⑤ 자신의 의견을 내세우는 주장 글"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

/* ═══════════ 6면 [DATA] STEP 3 주제문 만들기 ═══════════ */
K.push(brk());
K.push(stepHead("3", "주제문 만들기", "본문에서 재료를 찾아, 이 글의 주제문을 영어로 만듭니다."));
K.push(spF(6, 130, 0.09));

K.push(p([t("3-1  ", { size: 18, bold: true, color: GOLD }), t("재료 찾기", { size: 19, bold: true }), t("      주제문의 재료는 모두 본문 안에 있습니다. 문장 번호를 따라가, 괄호 안에서 골라 ○표 하세요.", { size: 16, color: SUB })], { after: 90, line: 250 }));

const cw = [4550, 2650, 2800];
const RX5 = Math.round((FT(6) || 0) * 0.052);
const chd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
function matRow(bn, sn, q, ans, role, isEx) {
  return new TableRow({ children: [
    cel([
      new Paragraph({ children: [t("(" + bn + ")", { size: 15, bold: true, color: NAVY }), t("   문장 " + sn, { size: 14, bold: true, color: GOLD })], spacing: { after: 40, line: 200 } }),
      new Paragraph({ children: [t(q, { size: 18 })], spacing: { after: 0, line: 250 } }),
    ], { w: cw[0], shade: isEx ? GREY : FIELD, b: chd, m: { top: 265 + RX5, bottom: 265 + RX5, left: 150, right: 80 } }),
    cel(isEx ? new Paragraph({ children: [t(ans, { size: 19, bold: true, color: GOLD }), t("  예시", { size: 14, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }) : [chipPairG(ans[0], ans[1], 1020, 150)],
      { w: cw[1], shade: isEx ? GREY : FIELD, b: chd, va: VerticalAlign.CENTER, m: { top: 265 + RX5, bottom: 265 + RX5, left: 150, right: 80 } }),
    cel(new Paragraph({ children: [t(role, { size: 17, color: SUB })], spacing: { after: 0, line: 245 } }),
      { w: cw[2], shade: isEx ? GREY : FIELD, b: chd, va: VerticalAlign.CENTER, m: { top: 265 + RX5, bottom: 265 + RX5, left: 150, right: 80 } }),
  ] });
}
K.push(T(cw, [
  thead(["질문", "본문에서 찾아 쓰기", "주제문 자리"], cw),
  matRow("1", "11", "빌이 포기하지 않았음을 나타낸 두 단어는?", "kept trying", "Bill 뒤 자리 (태도)", true),
  matRow("2", "12", "새 신발의 이름에 든 말은?", ["waffle", "breakfast"], "shoes 앞 자리 (이름)", false),
  matRow("3", "12", "러너들이 어떻게 되었나요?", ["faster", "slower"], "much 뒤 자리 (변화)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("Bill  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t(" , and the new  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  shoes made runners much  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ much faster.     ⓑ and the new waffle shoes     ⓒ Bill kept trying,     ⓓ made runners", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓒ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      (c)가 맨 앞 — 주인공 Bill이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("faster        iron        shoes        trying", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Bill wanted to make better (1) ____________ for running. One day, his wife’s waffle (2) ____________ gave him a great idea. He kept (3) ____________ and finally made new shoes, and they made runners much (4) ____________.", { size: 19 })], { line: 425, after: 0 })]));
K.push(spF(7, 180, 0.18));
K.push(stepHead("5", "같은 뜻 찾기", "같은 뜻, 다른 표현. 시험은 늘 바꿔서 묻습니다."));
K.push(sp(110));
K.push(p([t("본문 표현과 뜻이 다른 선지에 어떤 오답인지 유형을 표시하세요. 뜻이 같은 선지에는 아무 표시도 하지 않습니다.", { size: 18, bold: true })], { after: 60, line: 240 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("오답 유형   ", { size: 15, bold: true, color: NAVY2 }),
     t("뜻이 반대", { size: 16, bold: true, color: NAVY }), t("  본문과 반대 방향으로 말함          ", { size: 15, color: SUB }),
     t("본문과 무관", { size: 16, bold: true, color: NAVY }), t("  지문에 근거가 없음", { size: 15, color: SUB })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: GREY, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 62, bottom: 62, left: 150, right: 150 } })] })]));
K.push(sp(70));

/* STEP5 — 2문제/행 × 2행 그리드 */
const HW = [3260, 1590, 320, 3260, 1590];   /* 선지A · 체크A · 간격 · 선지B · 체크B */
const RXG = Math.min(120, Math.round((FT(7) || 0) * 0.03));
function pairGrid(A, B) {
  const head = (s) => cel(new Paragraph({ children: [
      t("문장 " + s.sn + "   ", { size: 13, bold: true, color: YEL }),
      t(s.main, { size: 15, bold: true, color: "FFFFFF" }),
    ], spacing: { after: 0, line: 225 } }),
    { w: HW[0] + HW[1], span: 2, shade: NAVY2, va: VerticalAlign.CENTER, m: { top: 40, bottom: 40, left: 150, right: 90 } });
  const gapCell = () => cel(p(t(""), { after: 0 }), { w: HW[2], b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } });
  const optCell = (o) => cel(new Paragraph({ children: [t(o, { size: 16 })], spacing: { after: 0, line: 224 } }),
    { w: HW[0], va: VerticalAlign.CENTER, m: { top: 56 + RXG, bottom: 56 + RXG, left: 130, right: 60 },
      b: { top: NOB, bottom: bd(3, WISP), left: NOB, right: NOB } });
  const chkCell = () => cel(new Paragraph({ children: [t("□ 반대   □ 무관", { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 200 } }),
    { w: HW[1], shade: FIELD, va: VerticalAlign.CENTER, m: { top: 56 + RXG, bottom: 56 + RXG, left: 40, right: 40 },
      b: { top: NOB, bottom: bd(4, "FFFFFF"), left: bd(8, YEL), right: NOB } });
  const rows = [new TableRow({ children: [head(A), gapCell(), head(B)] })];
  for (let j = 0; j < 3; j++) {
    rows.push(new TableRow({ children: [optCell(A.opts[j]), chkCell(), gapCell(), optCell(B.opts[j]), chkCell()] }));
  }
  K.push(T(HW, rows));
}
pairGrid(
  { sn: 3, main: "take apart shoes",
    opts: ["① separate shoes into pieces", "② put shoes together", "③ buy many new shoes"] },
  { sn: 5, main: "wasn’t a fast runner",
    opts: ["① ran very fast", "② did not run fast", "③ didn’t like breakfast"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 7, main: "noticed his wife’s waffle iron",
    opts: ["① saw the waffle iron", "② did not see it at all", "③ cooked many waffles"] },
  { sn: 11, main: "kept trying and finally succeeded",
    opts: ["① gave up in the end", "② did not stop and made it", "③ took a long rest"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 와플 트레이너와 나이키(Nike)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("빌 보워먼과 필 나이트는 1964년, 차 트렁크에 신발을 싣고 다니며 팔던 작은 회사를 함께 세웠다. 이 회사가 바로 오늘날의 나이키(Nike)다. 보워먼이 아침 식탁의 와플 기계에서 얻은 아이디어로 만든 운동화 ‘와플 트레이너’는 1974년에 나와 큰 인기를 끌었고, 나이키가 세계적인 회사로 자라는 발판이 되었다. 위대한 발명은 실험실이 아니라 아침 식탁처럼 평범한 곳에서 시작되기도 한다. 주변을 관찰하는 눈과 끝까지 시도하는 끈기가 만나면, 와플 한 판도 세상을 바꾸는 아이디어가 된다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u04.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
    alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
], { w: W, shade: "FFFFFF", b: { top: bd(10, TEAL), bottom: bd(4, TEAL), left: bd(4, TEAL), right: bd(4, TEAL) },
    m: { top: 145 + Math.round((FT(7) || 0) * 0.045), bottom: 150 + Math.round((FT(7) || 0) * 0.045), left: 280, right: 280 } })] })]));

/* ═══════════ 8~10면 [DATA] RE:RIGHT 워크북 R1–R7 ═══════════ */
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
  new Paragraph({ children: [t("Step Up! ", { size: 16, bold: true, color: "C3E0DA" }), t("같은 지문으로 고교 내신에 직결되는 7가지 역량을 체계적으로 훈련합니다.", { size: 16, color: "C3E0DA" })], spacing: { after: 0, line: 230 } }),
], { w: W - 1050, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 160, bottom: 150, left: 60, right: 250 }, b: { top: NOB, right: NOB, left: NOB, bottom: bd(6, YEL) } }),
] })]));
K.push(spF(8, 140, 0.14));
K.push(reprint());
K.push(spF(8, 240, 0.24));

/* ── R1 True / False ── */
K.push(wbAsk("R1", "True / False · 정독 훈련", "본문의 내용과 맞으면 T, 다르면 F에 표시하세요. (근거 문장 번호를 함께 적어 보세요.)"));
K.push(sp(120));
const tfw = [700, 7000, 2300];
const tfb = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(tfw, [
  thead(["", "문장", "T / F"], tfw, TEAL),
  ...[
    "Bill Bowerman was a running coach at a college in the U.S.",
    "Bill made big changes to improve the shoes.",
    "Bill often tested his new shoe ideas with Phil Knight.",
    "Phil Knight was a very fast runner.",
    "Bill noticed his wife’s waffle iron at breakfast.",
    "The waffle shoe bottom worked well from the start.",
    "The new waffle shoes made runners much faster.",
    "Today, no shoes use the waffle design.",
  ].map((s, i) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(String(i + 1), { size: 17, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[0], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(s, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: tfw[1], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 150, right: 100 } }),
    cel(new Paragraph({ children: [t("□ T      □ F", { size: 17, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[2], shade: FIELD, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 100, right: 100 } }),
  ] })),
]));
K.push(spF(8, 240, 0.34));

/* ── R2 사건 순서 잡기 ── */
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "빌에게 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Bill made a waffle shoe bottom and finally succeeded.",
      "ⓑ Bill tested his shoe ideas with Phil Knight.",
      "ⓒ Bill noticed his wife’s waffle iron at breakfast.",
      "ⓓ The new waffle shoes made runners much faster."]
    .map((s, i, a) => p([t(s, { size: 18 })], { after: i === a.length - 1 ? 0 : 150, line: 280 })),
], { shade: PAPER }));
K.push(sp(140));
K.push(field([p([
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }),
], { after: 0, line: 400, align: AlignmentType.CENTER })]));

/* ── 9면 : R3 영영풀이 매칭 · R4 어법 기초 ── */
K.push(brk());
K.push(wbAsk("R3", "영영풀이 매칭 · 어휘 훈련", "왼쪽 어휘의 뜻을 영어로 설명한 것을 ⓐ~ⓕ에서 골라 괄호에 쓰세요."));
K.push(sp(130));
const mw3 = [2650, 1250, 6100];
const RX9 = Math.round((FT(9) || 0) * 0.046);
const m3b = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(mw3, [
  thead(["어휘", "답", "영영풀이"], mw3, TEAL),
  ...[
    ["1  coach", "ⓐ to make something better"],
    ["2  take apart", "ⓑ a person who trains people in a sport"],
    ["3  improve", "ⓒ to do well and get what you wanted"],
    ["4  notice", "ⓓ to see and pay attention to something"],
    ["5  pattern", "ⓔ to separate something into pieces"],
    ["6  succeed", "ⓕ a design of lines and shapes"],
  ].map(([wd, df]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(wd, { size: 18, bold: true, color: NAVY })], spacing: { after: 0 } }),
      { w: mw3[0], shade: GREY, b: m3b, va: VerticalAlign.CENTER, m: { top: 158 + RX9, bottom: 158 + RX9, left: 150, right: 80 } }),
    cel(new Paragraph({ children: [t("(        )", { size: 18, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: mw3[1], shade: FIELD, b: m3b, va: VerticalAlign.CENTER, m: { top: 158 + RX9, bottom: 158 + RX9, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(df, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: mw3[2], shade: GREY, b: m3b, va: VerticalAlign.CENTER, m: { top: 158 + RX9, bottom: 158 + RX9, left: 150, right: 80 } }),
  ] })),
]));
K.push(spF(9, 380, 0.12));

K.push(wbAsk("R4", "어법 기초 · 문장 감각", "본문의 문장입니다. 괄호 안에서 알맞은 것을 고르세요."));
K.push(sp(130));
[["문장 1", [t("Bill Bowerman ", { size: 19 }), t("( was  /  were )", { size: 19, bold: true, color: NAVY }), t(" a running coach at a college.", { size: 19 })], "주어가 한 명(단수)일 때, 과거의 be동사는?"],
 ["문장 2", [t("He always wanted ", { size: 19 }), t("( to make  /  making )", { size: 19, bold: true, color: NAVY }), t(" better shoes for running.", { size: 19 })], "want 뒤에는 to+동사원형이 와요."],
 ["문장 7", [t("While Bill ", { size: 19 }), t("( was having  /  having )", { size: 19, bold: true, color: NAVY }), t(" breakfast, he noticed the waffle iron.", { size: 19 })], "진행형은 be+~ing — 한 덩어리의 동사예요."],
 ["문장 13", [t("Even today, many shoes ", { size: 19 }), t("( use  /  uses )", { size: 19, bold: true, color: NAVY }), t(" this design.", { size: 19 })], "주어 many shoes(복수)에 맞는 동사 형태는?"],
].forEach(([n, runs, hint], i) => {
  K.push(T([GUT, BODY], [new TableRow({ children: [
    cel(new Paragraph({ children: [t("(" + (i + 1) + ")", { size: 16, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 210 } }),
      { w: GUT, shade: TEAL, m: { top: 55, bottom: 55, left: 0, right: 0 } }),
    cel([
      new Paragraph({ children: [t(n + "   ", { size: 14, bold: true, color: GOLD })].concat(runs), spacing: { after: 42, line: 258 } }),
      new Paragraph({ children: [t("힌트  ", { size: 14, bold: true, color: NAVY2 }), t(hint, { size: 16, color: SUB })], spacing: { after: 0, line: 235 } }),
    ], { w: BODY, shade: PAPER, m: { top: 110, bottom: 110, left: 190, right: 190 } }),
  ] })]));
  K.push(spF(9, 150, 0.075));
});

/* ── 10면 : R5 빈칸 클로즈 · R6 해석 쓰기 ── */
K.push(brk());
K.push(wbAsk("R5", "빈칸 클로즈 · 재구성 훈련", "지문을 다시 만났습니다. <보기>의 단어를 알맞은 빈칸에 넣어 글을 완성하세요."));
K.push(sp(90));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("pattern  /  coach  /  faster  /  succeeded  /  improve  /  noticed  /  bottom  /  tested", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Bill Bowerman was a running", { size: 19 }), ...BL(1), t("at a college in the U.S.  ", { size: 19 }),
  num(2), t(" He always wanted to make better shoes for running.  ", { size: 19 }),
  num(3), t(" So he used to take apart shoes and make small changes to", { size: 19 }), ...BL(2), t("them.  ", { size: 19 }),
  num(4), t(" He often", { size: 19 }), ...BL(3), t("his new shoe ideas with his friend, Phil Knight.  ", { size: 19 }),
  num(5), t(" Phil wasn’t a fast runner.  ", { size: 19 }),
  num(6), t(" So if any shoes could help him run faster, they were considered good ones.  ", { size: 19 }),
  num(7), t(" One day, while Bill was having breakfast, he", { size: 19 }), ...BL(4), t("his wife’s waffle iron.  ", { size: 19 }),
  num(8), t(" The iron had a special", { size: 19 }), ...BL(5), t(".  ", { size: 19 }),
  num(9), t(" It gave him a great idea!  ", { size: 19 }),
  num(10), t(" He decided to make a shoe", { size: 19 }), ...BL(6), t("that looked like a waffle.  ", { size: 19 }),
  num(11), t(" At first, it didn’t work well, but he kept trying and finally", { size: 19 }), ...BL(7), t(".  ", { size: 19 }),
  num(12), t(" The new waffle shoes made runners much", { size: 19 }), ...BL(8), t(".  ", { size: 19 }),
  num(13), t(" Even today, many shoes use this design.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[7, "One day, while Bill was having breakfast, he noticed his wife’s waffle iron."],
 [11, "At first, it didn’t work well, but he kept trying and finally succeeded."]].forEach(([n, s], i) => {
  K.push(p([t("(" + (i + 1) + ")  ", { size: 18, bold: true, color: TEAL }), t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + s, { size: 19 })], { after: 45 }));
  K.push(writeField(1, 400));
  K.push(spF(10, 150, 0.11));
});

/* ── R7 조건 영작 2문항 ── */
K.push(spF(10, 60, 0.10));
K.push(wbAsk("R7", "조건 영작 · 쓰기 훈련", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(120));
function w7block(no, ko, cond, bogi) {
  K.push(p([t("(" + no + ")  ", { size: 18, bold: true, color: TEAL }), t(ko, { size: 19, bold: true })], { indent: { left: 250 }, after: 55 }));
  K.push(T([W], [new TableRow({ children: [cel([
    p([t("조건   ", { size: 16, bold: true, color: NAVY2 }), t(cond, { size: 17, color: SUB })], { after: 42 }),
    p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t(bogi, { size: 19 })], { after: 0 }),
  ], { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 110, bottom: 110, left: 230, right: 230 } })] })]));
  K.push(spF(10, 130, 0.05));
  K.push(writeField(1, 400));
  K.push(spF(10, 230, 0.05));
}
w7block("1", "그는 항상 달리기를 위한 더 나은 신발을 만들고 싶어 했다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 9단어)",
  "always / make / he / better / wanted / shoes / to / for / running");
w7block("2", "새 와플 신발은 러너들을 훨씬 더 빠르게 만들었다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 8단어)",
  "waffle / made / the / runners / new / shoes / much / faster");

/* ═══════════ 해설 ═══════════ */
  },

  renderExplain(ctx) {
    const { K, spF, FT } = ctx;
const H = (s) => K.push(T([W], [new TableRow({ children: [
  cel(new Paragraph({ children: [t(s, { size: 18, bold: true, color: NAVY })], spacing: { after: 0, line: 250 } }),
    { w: W, m: { top: 25, bottom: 25, left: 150, right: 0 }, b: { top: NOB, bottom: NOB, right: NOB, left: bd(12, YEL) } }),
] })]));
const B = (s, last) => K.push(p([t(s, { size: 17, color: SUB })], { after: last ? 200 : 38, line: 258, indent: { left: 0 } }));
const Hs = (s) => { K.push(sp(82)); H(s); K.push(sp(46)); };

K.push(...tab("정답 및 해설", "UNIT 04  아침 식사에서 시작되었어요", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("The iron had a special pattern.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문1 ", { size: 17, bold: true, color: NAVY2 }), t("Bill Bowerman(S)·was(△V)·at a college in the U.S.(M)   ", { size: 17, bold: true }),
     t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("if[네모]·any shoes(S′)·could help(△V′)·they(S)·were considered(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문11 ", { size: 17, bold: true, color: NAVY2 }), t("At first(M)·it(S)·didn’t work(△V)·but[네모]·he(S)·kept trying·succeeded(△V)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 여름마다 수영을 하곤 했다  (2) 그녀가 요리하고 있는 동안, 전화가 울렸다  (3) 그는 샤워를 하는 동안 노래를 부르곤 했다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 waffle shoes · kept trying · faster        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 결과 · 조건 · ~하는 동안 · 반전   2-2 [C] 계기 · [E] 오늘날   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 (c) → (b) → (d) → (a)  ·  Bill kept trying, and the new waffle shoes made runners much faster.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) shoes  (2) iron  (3) trying  (4) faster        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 ①  문장 5 ②  문장 7 ①  문장 11 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("(b) → (c) → (a) → (d)", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1(b) · 2(e) · 3(a) · 4(d) · 5(f) · 6(c)        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) was  (2) to make  (3) was having  (4) use", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) coach (2) improve (3) tested (4) noticed (5) pattern (6) bottom (7) succeeded (8) faster", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) He always wanted to make better shoes for running.  (2) The new waffle shoes made runners much faster.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 코치 빌 보워먼이 와플 기계에서 아이디어를 얻어(문장 7–9) 와플 밑창 운동화를 만든 이야기다(문장 10–12). 소재와 특징을 모두 담은 ①이 제목으로 적절하다. ②·⑤는 와플·아침 식사만 건드린 지엽적 오답, ③은 문장 5와 어긋나고 ④는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 5에서 필은 빠른 러너가 아니었다(wasn’t a fast runner)고 했으므로, 매우 빠른 러너였다는 ③은 본문과 반대된다. ①은 문장 1, ②는 문장 4, ④는 문장 7–9, ⑤는 문장 13에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) It은 바로 앞 문장 8의 특별한 무늬(를 가진 와플 틀)를 가리킨다. 무늬를 본 순간 와플 모양 밑창이라는 아이디어가 떠올랐다(문장 10). ⑤ 새 운동화는 이 아이디어의 결과이지, 아이디어를 준 것이 아니다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   The iron had a special pattern.");
B("문장 8을 그대로 복원하는 문제다. ① 첫 글자는 대문자 The.   ② had — 과거의 일이므로 have가 아니라 had.   ③ a special pattern — 관사 a를 빠뜨리지 않는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 waffle shoes · kept trying · faster     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 와플 기계에서 시작된 운동화 발명 이야기다. ① 와플 요리법은 나오지 않고, ③ 달리기 수업은 배경(코치)일 뿐이다.");
B("1-2   ○표 할 세 말: waffle shoes(힌트① 발명된 것) · kept trying(힌트② 발명가의 태도) · faster(힌트③ 신발이 만든 변화). 나머지 셋(breakfast · coach · iron)은 배경과 계기일 뿐, 주제문에는 들어가지 않는다.");
B("1-3   문장 6 — him은 필에 ○ (새 신발을 신고 달려 본 사람), they는 신발들에 ○ (좋다고 여겨진 것).   문장 9 — It은 특별한 무늬에 ○ (문장 8의 무늬가 아이디어를 주었다).   문장 13 — this design은 와플 모양 밑창에 ○ (문장 10에서 만든 그 디자인).");
B("[학습 포인트]   문장 6에서 him(단수)은 사람 필을, they(복수)는 신발들을 가리킨다 — 수 일치가 첫 번째 단서다. 이 습관이 고등 독해의 지칭 추론으로 그대로 이어진다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 결과 / 조건 / ~하는 동안 / 반전     2-2 [C] 계기 · [E] 오늘날     2-3 ①");
B("2-1   문장 3 So — 더 나은 신발을 원했기 때문에 일어난 ‘결과’.   문장 6 if — 더 빨리 달리게 해 준다면이라는 ‘조건’.   문장 7 while — 아침을 먹고 있던 ‘~하는 동안’.   문장 11 but — 잘 안 됐지만 계속 시도했다는 ‘반전’.");
B("2-2   [C] 계기(문장 7–9: 와플 기계의 무늬에서 아이디어를 얻는다), [E] 오늘날(문장 12–13: 러너들이 빨라졌고 지금도 쓰인다). 보기의 ‘요리법’은 이 글에 없는 역할이다. [A] 소개 → [B] 노력 → [C] 계기 → [D] 성공 → [E] 오늘날 — 발명 이야기의 전형적인 흐름이다.");
B("2-3   정답 ①. 실존 인물의 발명 이야기를 사실대로 들려주는 설명문이다. ② 사라는 말·가격이 없으니 광고가 아니고, ③ I·Today로 시작하는 하루 기록이 아니며, ④ 받는 사람이 없고, ⑤ should·I think 같은 주장의 신호도 없다.");
B("[학습 포인트]   연결어만 표시해도 글의 지도가 그려진다. So(결과), if(조건), while(동안), but(반전). 특히 발명·성공 이야기에서 But 뒤에는 ‘실패를 이겨 낸 이야기’가 온다 — 반전 뒤의 문장이 글의 핵심 재료다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 waffle · faster     3-3 (c) → (b) → (d) → (a)");
B("3-1  재료 찾기 — (2) 문장 12에서 waffle에 ○: 새 신발의 이름은 waffle shoes다. breakfast는 계기가 된 시간일 뿐이다. (3) 문장 12에서 faster에 ○: 신발이 러너들을 더 빠르게 만들었다. slower는 반대말이다. 주제문의 재료는 언제나 본문 안에 있다.");
B("3-2  뼈대 채우기 — (1) kept trying  (2) waffle  (3) faster.  넣으면 Bill kept trying, and the new waffle shoes made runners much faster.가 완성된다.");
B("3-3  정답 순서 — ⓒ Bill kept trying, → ⓑ and the new waffle shoes → ⓓ made runners → ⓐ much faster.  완성 문장: Bill kept trying, and the new waffle shoes made runners much faster.");
B("[채점 포인트]  주인공 Bill이 든 덩어리(ⓒ)가 맨 앞, 마침표가 붙은 덩어리(ⓐ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) shoes  (2) iron  (3) trying  (4) faster");
B("(1)은 문장 2의 shoes, (2)는 문장 7의 iron, (3)은 문장 11의 trying, (4)는 문장 12의 faster에서 가져온다. 요약문이 곧 이 글의 흐름이다: 목표(1) → 계기(2) → 끈기(3) → 변화(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 ①   문장 5 ②   문장 7 ①   문장 11 ②  (정답 선지는 무표시)");
B("문장 3 take apart shoes   ① ○ 신발을 조각조각 분리하다.   ② ✕ [반대] 신발을 조립하다 — 정반대.   ③ ✕ [무관] 새 신발을 많이 산다는 말은 지문에 없다.");
B("문장 5 wasn’t a fast runner   ① ✕ [반대] 매우 빨리 달렸다 — 정반대.   ② ○ did not run fast = 빨리 달리지 못했다.   ③ ✕ [무관] 아침 식사를 싫어했다는 말은 지문에 없다.");
B("문장 7 noticed his wife’s waffle iron   ① ○ saw the waffle iron = 와플 틀을 보았다.   ② ✕ [반대] 전혀 보지 못했다 — 정반대.   ③ ✕ [무관] 와플을 많이 구웠다는 말은 지문에 없다.");
B("문장 11 kept trying and finally succeeded   ① ✕ [반대] 결국 포기했다 — 정반대.   ② ○ did not stop and made it = 멈추지 않고 해냈다.   ③ ✕ [무관] 오래 쉬었다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. 지문을 읽을 때마다 ‘이 표현을 다른 말로 하면?’을 스스로 물어보자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 3: 큰 변화가 아니라 작은(small) 변화를 주었다.   3 T — 문장 4.   4 F — 문장 5: 필은 빠른 러너가 아니었다.   5 T — 문장 7.   6 F — 문장 11: 처음에는 잘되지 않았다.   7 T — 문장 12.   8 F — 문장 13: 오늘날에도 많은(many) 신발이 이 디자인을 쓴다.  거짓 문장은 모두 본문에서 딱 한 요소(big, very fast, from the start, no)를 비튼 것이다 — 그 한 단어를 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   (b) → (c) → (a) → (d)");
B("ⓑ 필과 함께 신발 아이디어를 시험한다(문장 4) → ⓒ 아침 식사 중 와플 기계를 발견한다(문장 7) → ⓐ 와플 밑창을 만들어 마침내 성공한다(문장 10–11) → ⓓ 새 와플 신발이 러너들을 훨씬 빠르게 만든다(문장 12). 이 글은 사건이 일어난 순서 그대로 서술된 이야기이므로, 문장 번호를 따라가면 순서가 보인다.", true);
Hs("R3   영영풀이   ·   1 (b) · 2 (e) · 3 (a) · 4 (d) · 5 (f) · 6 (c)");
B("coach = a person who trains people in a sport(운동을 가르치는 사람) · take apart = 조각조각 분리하다 · improve = 더 좋게 만들다 · notice = 보고 관심을 기울이다, 알아차리다 · pattern = 선과 모양으로 된 무늬 · succeed = 잘 해내어 원하던 것을 얻다.", true);
Hs("R4   어법 기초   ·   (1) was  (2) to make  (3) was having  (4) use");
B("(1) 주어 Bill Bowerman은 단수 — 과거 be동사는 was.   (2) want는 to+동사원형을 목적어로 쓴다 — wanted to make.   (3) 진행형은 be+~ing가 한 덩어리의 동사다 — was having. 2면 분석 Tip의 그 원칙이다.   (4) 주어 many shoes는 복수 — use.", true);
Hs("R5   빈칸 클로즈   ·   (1) coach (2) improve (3) tested (4) noticed (5) pattern (6) bottom (7) succeeded (8) faster");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: running ___ ← 빌의 직업, to ___ them ← 개조의 목적, a special ___ ← 아이디어의 출발점, finally ___ ← 끈기의 결말. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 어느 날, 빌이 아침을 먹고 있는 동안, 그는 아내의 와플 틀(기계)을 눈여겨보았다.  — while+진행형을 ‘~하고 있는 동안’으로 옮기는 것이 핵심이다.");
B("(2) 처음에는 잘되지 않았지만, 그는 계속 시도했고 마침내 성공했다.  — At first(처음에는)와 but(하지만)의 반전을 살려 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) He always wanted to make better shoes for running.  (2) The new waffle shoes made runners much faster.");
B("(1) 문장 2의 복원. ㄱ 첫 글자 대문자 He  ㄴ 빈도부사 always는 wanted 앞  ㄷ wanted to make — R4-(2)의 그 형태다.");
B("(2) 문장 12의 복원. ㄱ 첫 글자 대문자 The  ㄴ made runners much faster — ‘훨씬’은 비교급 faster 앞의 much. 3-3에서 배열한 주제문의 뒷부분이 여기서 다시 나온다 — 워크북은 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("빌 보워먼은 미국의 한 대학에서 달리기 코치였다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 항상 달리기를 위한 더 나은 신발을 만들고 싶어 했다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 그는 신발을 분해해서, 그것을 개선하기 위해 작은 변화를 주곤 했다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 종종 친구인 필 나이트와 함께 새 신발 아이디어를 시험했다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("필은 빠른 러너가 아니었다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 어떤 신발이든 그가 더 빨리 달리게 도와줄 수 있다면, 그 신발은 좋은 신발로 여겨졌다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("어느 날, 빌이 아침을 먹고 있는 동안, 그는 아내의 와플 틀을 눈여겨보았다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 틀에는 특별한 무늬가 있었다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 그에게 멋진 아이디어를 주었다!  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 와플처럼 생긴 신발 밑창을 만들기로 결심했다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("처음에는 잘되지 않았지만, 그는 계속 시도했고 마침내 성공했다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("새 와플 신발은 러너들을 훨씬 더 빠르게 만들었다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("오늘날에도 많은 신발이 이 디자인을 사용한다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
