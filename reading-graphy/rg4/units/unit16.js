/* UNIT 16 — 도시들은 왜 슬로건을 만들까? (Level 4)
   풀 유닛(10면). [DATA] 표시된 콘텐츠 블록만 지문에 맞게 교체했다. 레이아웃 코드는 건드리지 않는다. */
const L = require("../scripts/lib");
const { fs, path, WORK, ASSETS,
  Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, VerticalAlign, BorderStyle, WidthType, ShadingType, TabStopType, LineRuleType,
  F, FD, FO, INK, SUB, FAINT, CHAR, NAVY, NAVY2, GOLD, YEL, AMB, TEAL, NAVYD, NAVYL,
  PAPER, COOL, GREY, FIELD, FLINE, HAIR, CLINE, WISP, W, GUT, BODY, NOB, noB,
  bd, t, p, cel, T, chipCellG, chipPairG, sp, brk, tab, thead, ask, ch, box, fieldRow, field, writeField, tagline, R, RM,
} = L;

module.exports = {
  no: "16",
  title: "도시들은 왜 슬로건을 만들까?",
  level: "4",
  foot: "UNIT 16  도시들은 왜 슬로건을 만들까?",
  banner: ["16", "도시들은 왜 슬로건을 만들까?", "4"],
  timeline: ["1970년대|도시 브랜딩의 시작|뉴욕의 ‘I love NY’가\\n도시 홍보의 문을 열다|city",
             "관 주도|관광객을 부르는 말|시청이 만들어\\n간판과 광고에 싣는다|sun",
             "주민 주도|사는 사람의 말|주민이 붙인 별명이\\n더 진짜에 가깝다|leaf",
             "오늘|정체성 + 유머|허쉬와 그래비티처럼\\n웃음이 기억을 남긴다|sparkle_drop"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "Cities use slogans to tell others about who they are.",
  "The best slogans tell a story in a few powerful words.",
  "Some slogans are created by the city to attract tourists, while others are created by residents who noticed something interesting about the city life.",
  "What residents call the city can sometimes tell more about it.",
  "Some cities have used humor for unique features and attractions.",
  "Here are some of the best slogans around the U.S.",
  "The slogan of Hershey, Pennsylvania is “The Sweetest Place On Earth.”",
  "This has been Hershey’s slogan since 1990.",
  "Hershey is home to the Hershey chocolate factory and the whole town smells like chocolate!",
  "People in Gravity, Iowa use the slogan “We’re Down to Earth. If Gravity Goes, We All Go.”",
  "They played on the words “down to earth,” which actually means being practical, and the word “gravity.”",
  "These city slogans show the identities of the people who live there.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–5 [C]6–9 [D]10–11 [E]12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 6: "C", 10: "D", 12: "E" };
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
  1: [R("Cities use slogans to tell others about who "), RM("they"), R(" are.  ")],
  4: [R("What residents call the city can sometimes tell more about "), RM("it"), R(".  ")],
  8: [RM("This"), R(" has been Hershey’s slogan since 1990.  ")],
  12: [RM("These city slogans"), R(" show the identities of the people who live "), RM("there"), R(".  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u16.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  11: [t("(A) ", { size: 19, bold: true }), t("They", { size: 19, bold: true, underline: {} }),
       t(" played on the words “down to earth,” which actually means being practical, and the word “gravity.”  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① City Slogans: A Few Words That Tell Who You Are", "② The History of the Hershey Chocolate Factory",
 "③ How to Attract More Tourists to Small Towns", "④ The Science of Gravity Explained",
 "⑤ The Best Places to Eat Chocolate in the U.S."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① The best slogans tell a story in a few powerful words.",
 "② Some slogans are created by residents of the city.",
 "③ Hershey’s slogan has been “The Sweetest Place On Earth” since 1990.",
 "④ Hershey is home to a large car factory.",
 "⑤ People in Gravity, Iowa played on the words “down to earth.”"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) They가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the people in Gravity, Iowa",
 "② the tourists visiting Hershey",
 "③ the workers at the chocolate factory",
 "④ the cities around the U.S.",
 "⑤ the residents of Pennsylvania"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("최고의 슬로건은 몇 개의 강력한 단어로 이야기를 들려준다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 11단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("a / slogans / The / powerful / tell / best / words. / story / in / a / few", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
/* 구문 2단 카드 */
function synCard(n, ti, ex, ds, wid) {
  return cel([
    new Paragraph({ children: [t(n + "  ", { size: 14, bold: true, color: "FFFFFF" }), t("  " + ti, { size: 17, bold: true })],
      spacing: { after: 55, line: 235 }, shading: undefined }),
    new Paragraph({ children: ex, spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t(ds, { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: wid, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 90, bottom: 90, left: 170, right: 130 } });
}
/* 배지 스타일: 라벨을 앰버 배경 런으로 */
function synBadge(n) { return t(" " + n + " ", { size: 13, bold: true, color: "FFFFFF", border: { style: BorderStyle.SINGLE, size: 1, color: AMB, space: 2 } }); }
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   수동태 be동사+과거분사 ‘~되다’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Some slogans ", { size: 18 }), t("are created", { size: 18, bold: true, color: NAVY, underline: {} }), t(" by the city", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+과거분사는 한 덩어리의 동사입니다. ‘슬로건이 (도시에 의해) 만들어진다’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 8", { size: 14, bold: true, color: AMB }), t("   현재완료 has+과거분사 (계속)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("This ", { size: 18 }), t("has been", { size: 18, bold: true, color: NAVY, underline: {} }), t(" Hershey’s slogan since 1990", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("has+과거분사도 한 덩어리의 동사! since와 함께 ‘1990년부터 지금까지 ~였다’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 3 구문", [t("This picture ", { size: 19 }), t("was drawn", { size: 19, bold: true, color: NAVY, underline: {} }), t(" by my little brother.", { size: 19 })]],
 ["문장 8 구문", [t("I ", { size: 19 }), t("have lived", { size: 19, bold: true, color: NAVY, underline: {} }), t(" in this town since 2019.", { size: 19 })]],
 ["둘 다!", [t("The park ", { size: 19 }), t("has been loved", { size: 19, bold: true, color: NAVY, underline: {} }), t(" by children for many years.", { size: 19 })]],
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
     t("  \u2192  한 덩어리의 동사로 표시! \u25b3", { size: 15, bold: true })],
    { after: 0, align: AlignmentType.CENTER, line: 235 }),
  { w: W, shade: COOL, b: { top: bd(3, CLINE), bottom: bd(3, CLINE), left: NOB, right: NOB }, m: { top: 38, bottom: 38, left: 120, right: 120 } })] })]));
K.push(spF(2, 75, 0.07));

K.push(sp(40));

/* 먼저 보기 — 다 표시된 문장 (문장 2: 모든 표시 등장) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || "\u00A0", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 9를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1100, 600, 3200, 700, 1700, 1630], [new TableRow({ children: [
    exSeg([t("Hershey", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1100),
    exSeg([t("is", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 600, "△"),
    exSeg([t("home to the chocolate factory", { size: 18 })], "", FAINT, 3200),
    exSeg([t("and", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 700),
    exSeg([t("the whole town", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1700),
    exSeg([t("smells like chocolate", { size: 18, bold: true, color: NAVY })], "V′ 본동사", NAVY, 1630, "△"),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[4, "What residents call the city can sometimes tell more about it."],
 [5, "Some cities have used humor for unique features and attractions."],
 [12, "These city slogans show the identities of the people who live there."]].forEach(([n, c]) => {
  K.push(p([t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + c, { size: 20 }),
    t("      \u2192 문장에 직접 표시!", { size: 13, color: FAINT })], { after: 58, line: 520 }));
  K.push(writeField(1, 410));
  K.push(spF(2, 150, 0.08));
});

/* ═══════════ 3면 [DATA] STEP 1 소재·핵심어·지시어 ═══════════ */
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
  const runs = DEIXIS[n]
    ? DEIXIS[n].map(r => r).slice(0, -0)
    : null;
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
["① 초콜릿 공장을 견학하는 방법", "② 도시의 슬로건이 보여 주는 정체성과 창의성", "③ 미국의 유명 관광지 목록"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["slogans", "슬로건"], ["identities", "정체성"], ["creativity", "창의성"], ["chocolate", "초콜릿"], ["tourists", "관광객"], ["factory", "공장"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 슬로건이 보여 주는 것  ③ 사는 사람들의 특징 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · this 같은 지시어는 앞에 나온 말을 대신합니다. 같은 they라도 도시일 수도, 사람일 수도 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 1950, 7350];
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
    const chips8 = () => T([1400, 1100, 150, 1100, 250, 780, 1100, 150, 1100], [new TableRow({ children: [
      labC("These slogans =", 1400), chipC("앞의 슬로건", 1100), gapC(150), chipC("관광 안내판", 1100), gapC(250),
      labC("there =", 780), chipC("그 도시들", 1100), gapC(150), chipC("초콜릿 공장", 1100),
    ] })]);
    return [
    ["1", "they", [t("cities (도시들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "it", chips2("the city (그 도시)", "the resident (주민)", 1900), false],
    ["8", "This", chips2("허쉬의 슬로건", "초콜릿 공장", 1900), false],
    ["12", "These slogans · there", chips8(), false],
  ]; })().map(([sn, exp, runs, isEx]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(sn, { size: 18, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: aw[0], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(exp, { size: 18, bold: true, color: NAVY })], spacing: { after: 0 } }),
      { w: aw[1], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 150, right: 80 } }),
    cel(Array.isArray(runs) ? new Paragraph({ children: runs, spacing: { after: 0 } }) : [runs],
      { w: aw[2], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: Array.isArray(runs) ? 265 : 175, bottom: Array.isArray(runs) ? 265 : 175, left: 150, right: 80 } }),
  ] })),
]));

/* ═══════════ 4면 [DATA] STEP 2 글의 흐름 잡기 ═══════════ */
K.push(brk());
K.push(stepHead("2", "글의 흐름 잡기", "연결어를 따라가면 글의 길이 보입니다."));
K.push(spF(5, 130, 0.18));

K.push(p([t("2-1  ", { size: 18, bold: true, color: GOLD }), t("연결어 찾기", { size: 19, bold: true }),
  t("      밑줄 친 연결어가 어떤 일을 하는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
const gw = [900, 6100, 3000];
const ghd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(gw, [
  thead(["문장", "본문 문장 (연결어 밑줄)", "하는 일"], gw),
  ...[
    ["3", [t("Some slogans are created by the city, ", { size: 17 }), t("while", { size: 17, bold: true, color: NAVY, underline: {} }), t(" others are created by residents.", { size: 17 })], ["대조", "이유"]],
    ["8", [t("This has been Hershey’s slogan ", { size: 17 }), t("since", { size: 17, bold: true, color: NAVY, underline: {} }), t(" 1990.", { size: 17 })], ["~부터", "~때문에"]],
    ["9", [t("Hershey is home to the factory ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" the whole town smells like chocolate!", { size: 17 })], ["덧붙임", "반전"]],
    ["10", [t("“We’re Down to Earth. ", { size: 17 }), t("If", { size: 17, bold: true, color: NAVY, underline: {} }), t(" Gravity Goes, We All Go.”", { size: 17 })], ["조건", "순서"]],
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
    chipCellG("만드는 사람", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("마무리", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("요리법", 1400),
  ] })]),
  { w: W, shade: GREY, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 90, bottom: 90, left: 2450, right: 120 } })] })]));
K.push(sp(115));
function flowCell(seg, top, body, blank) {
  return cel([
    new Paragraph({ children: [t("[" + seg + "]", { size: 14, bold: true, color: SEGCOL[seg] })], alignment: AlignmentType.CENTER, spacing: { after: 32, line: 180 } }),
    blank
      ? new Paragraph({ children: [new TextRun({ text: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0", size: 16, font: F, underline: {} })], alignment: AlignmentType.CENTER, spacing: { after: 55, line: 260 } })
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
  flowCell("B", null, "문장 3–5", true),
  arrowCell(),
  flowCell("C", "예시 1", "문장 6–9", false),
  arrowCell(),
  flowCell("D", "예시 2", "문장 10–11", false),
  arrowCell(),
  flowCell("E", null, "문장 12", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 예를 들어 대상을 소개하는 설명문",
 "② 하루 일을 적은 일기",
 "③ 물건을 팔기 위해 만든 광고",
 "④ 안부를 전하는 편지",
 "⑤ 상상으로 지어낸 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

/* ═══════════ 5면 [DATA] STEP 3 주제문 만들기 ═══════════ */
K.push(brk());
K.push(stepHead("3", "주제문 만들기", "본문에서 재료를 찾아, 이 글의 주제문을 영어로 만듭니다."));
K.push(spF(6, 130, 0.09));

K.push(p([t("3-1  ", { size: 18, bold: true, color: GOLD }), t("재료 찾기", { size: 19, bold: true }), t("      주제문의 재료는 모두 본문 안에 있습니다. 문장 번호를 따라가, 괄호 안에서 골라 \u25cb표 하세요.", { size: 16, color: SUB })], { after: 90, line: 250 }));

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
  matRow("1", "12", "이 글의 주인공을 나타낸 말은? (두 단어)", "City slogans", "문장 맨 앞 자리", true),
  matRow("2", "12", "슬로건이 보여 주는 두 가지는?", ["identities and creativity", "tourists and factories"], "show 뒤 자리 (내용)", false),
  matRow("3", "12", "그것은 누구의 것인가요?", ["the people who live there", "the visitors from other cities"], "of 뒤 자리 (주인)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   show the unique  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________  and  ________", { size: 19, color: NAVY2 }),
  t("   of  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ______________________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ of the people who live there.     ⓑ show the unique identities     ⓒ City slogans     ⓓ and creativity", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓒ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      ⓒ가 맨 앞 — 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("humor        chocolate        identities        creativity", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Cities use slogans to tell people who they are, and some of them use (1) ____________. Hershey calls itself the sweetest place because the whole town smells like (2) ____________, and people in Gravity play with the words “down to earth.” These slogans show the unique (3) ____________ and (4) ____________ of the people who live there.", { size: 19 })], { line: 425, after: 0 })]));
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
  const chkCell = () => cel(new Paragraph({ children: [t("\u25A1 반대   \u25A1 무관", { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 200 } }),
    { w: HW[1], shade: FIELD, va: VerticalAlign.CENTER, m: { top: 56 + RXG, bottom: 56 + RXG, left: 40, right: 40 },
      b: { top: NOB, bottom: bd(4, "FFFFFF"), left: bd(8, YEL), right: NOB } });
  const rows = [new TableRow({ children: [head(A), gapCell(), head(B)] })];
  for (let j = 0; j < 3; j++) {
    rows.push(new TableRow({ children: [optCell(A.opts[j]), chkCell(), gapCell(), optCell(B.opts[j]), chkCell()] }));
  }
  K.push(T(HW, rows));
}
pairGrid(
  { sn: 2, main: "tell a story in a few powerful words",
    opts: ["① tell a story in a few strong words", "② need many long sentences", "③ tell a story only to tourists"] },
  { sn: 5, main: "used humor for unique features",
    opts: ["① hid their strange features", "② used jokes to show what is special", "③ built new museums for visitors"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "has been Hershey’s slogan since 1990",
    opts: ["① was dropped soon after 1990", "② was written by a famous singer", "③ has been used from 1990 until now"] },
  { sn: 12, main: "show the identities of the people",
    opts: ["① show how residents see themselves", "② hide what residents are really like", "③ show how rich each city is"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 도시 슬로건과 도시 브랜딩", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("도시 슬로건은 관광 표어이면서 그 도시의 자기소개다. 1970년대 뉴욕이 ‘I love NY’를 내걸어 침체된 도시 이미지를 바꾼 뒤, 세계의 도시들이 저마다 한 문장을 갖게 되었다. 시청이 만든 슬로건은 관광객을 부르는 말이고, 주민이 붙인 별명은 그 도시에서 사는 기분을 담는다. 짧을수록, 그리고 그 도시에서만 통하는 농담일수록 오래 기억된다. 좋은 슬로건은 광고가 아니라 정체성의 요약이다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u16.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
    alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
], { w: W, shade: "FFFFFF", b: { top: bd(10, TEAL), bottom: bd(4, TEAL), left: bd(4, TEAL), right: bd(4, TEAL) },
    m: { top: 145 + Math.round((FT(7) || 0) * 0.045), bottom: 150 + Math.round((FT(7) || 0) * 0.045), left: 280, right: 280 } })] })]));

/* ═══════════ 8~11면 [DATA] 독해력 UP 워크북 R1–R7 + 자기 점검표 ═══════════ */
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
    "Cities use slogans to tell others about who they are.",
    "Every slogan is created only by the city government.",
    "Cities never use humor in their slogans.",
    "The slogan of Hershey, Pennsylvania is “The Sweetest Place On Earth.”",
    "Hershey has used this slogan since 1890.",
    "The whole town of Hershey smells like chocolate.",
    "People in Gravity, Iowa played on the words “down to earth.”",
    "“Down to earth” actually means being funny.",
  ].map((s, i) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(String(i + 1), { size: 17, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[0], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(s, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: tfw[1], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 150, right: 100 } }),
    cel(new Paragraph({ children: [t("\u25A1 T      \u25A1 F", { size: 17, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[2], shade: FIELD, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 100, right: 100 } }),
  ] })),
]));
K.push(spF(8, 240, 0.34));

/* ── R2 사건 순서 잡기 ── */
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "글쓴이가 생각을 펼쳐 나가는 차례대로 ⓐ~ⓓ를 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ The writer introduces two real slogans from the U.S.",
      "ⓑ The writer explains who creates city slogans and why.",
      "ⓒ The writer says slogans tell others who a city is.",
      "ⓓ The writer concludes that slogans show the people’s identity."]
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
    ["1  slogan", "ⓐ a person who lives in a place"],
    ["2  resident", "ⓑ useful and sensible in real life"],
    ["3  attract", "ⓒ a short phrase that is easy to remember"],
    ["4  unique", "ⓓ to make someone want to come"],
    ["5  celebrate", "ⓔ to do something special for an important thing"],
    ["6  practical", "ⓕ not like anything else"],
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
[["문장 1", [t("Cities ", { size: 19 }), t("( use  /  uses )", { size: 19, bold: true, color: NAVY }), t(" slogans to tell others about who they are.", { size: 19 })], "주어 Cities는 복수예요."],
 ["문장 3", [t("Some slogans ", { size: 19 }), t("( are created  /  create )", { size: 19, bold: true, color: NAVY }), t(" by the city.", { size: 19 })], "슬로건은 만들어지는 쪽 — 수동태!"],
 ["문장 8", [t("This ", { size: 19 }), t("( has been  /  have been )", { size: 19, bold: true, color: NAVY }), t(" Hershey’s slogan since 1990.", { size: 19 })], "주어 This는 단수예요."],
 ["문장 9", [t("Hershey ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" home to the Hershey chocolate factory.", { size: 19 })], "도시 이름 하나는 단수 취급!"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("humor  /  creativity  /  slogans  /  chocolate  /  residents  /  identities  /  story  /  gravity", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Cities use", { size: 19 }), ...BL(1), t("to tell others about who they are.  ", { size: 19 }),
  num(2), t(" The best slogans tell a", { size: 19 }), ...BL(2), t("in a few powerful words.  ", { size: 19 }),
  num(3), t(" Some slogans are created by the city to attract tourists, while others are created by", { size: 19 }), ...BL(3), t("who noticed something interesting about the city life.  ", { size: 19 }),
  num(4), t(" What residents call the city can sometimes tell more about it.  ", { size: 19 }),
  num(5), t(" Some cities have used", { size: 19 }), ...BL(4), t("to celebrate their unique features and attractions.  ", { size: 19 }),
  num(6), t(" Here are some of the best slogans around the U.S.  ", { size: 19 }),
  num(7), t(" The slogan of Hershey, Pennsylvania is “The Sweetest Place On Earth.”  ", { size: 19 }),
  num(8), t(" This has been Hershey’s slogan since 1990.  ", { size: 19 }),
  num(9), t(" Hershey is home to the chocolate factory and the whole town smells like", { size: 19 }), ...BL(5), t(".  ", { size: 19 }),
  num(10), t(" People in Gravity, Iowa use the slogan “We’re Down to Earth. If Gravity Goes, We All Go.”  ", { size: 19 }),
  num(11), t(" They played on the words “down to earth,” which actually means being practical, and the word “", { size: 19 }), ...BL(6), t(".”  ", { size: 19 }),
  num(12), t(" These city slogans show the unique", { size: 19 }), ...BL(7), t("and", { size: 19 }), ...BL(8), t("of the people who live there.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[3, "Some slogans are created by the city to attract tourists, while others are created by residents."],
 [12, "These city slogans show the identities of the people who live there."]].forEach(([n, s], i) => {
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
w7block("1", "이것은 1990년부터 허쉬의 슬로건이었다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 7단어)",
  "been / This / slogan / has / 1990. / Hershey’s / since");
w7block("2", "도시들은 자신이 누구인지 다른 이들에게 알리기 위해 슬로건을 사용한다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 10단어)",
  "tell / Cities / who / slogans / to / are. / use / others / they / about");

/* ═══════════ 12~14면 [DATA] 해설 ═══════════ */
  },

  renderExplain(ctx) {
    const { K, spF, FT } = ctx;
const H = (s) => K.push(T([W], [new TableRow({ children: [
  cel(new Paragraph({ children: [t(s, { size: 18, bold: true, color: NAVY })], spacing: { after: 0, line: 250 } }),
    { w: W, m: { top: 25, bottom: 25, left: 150, right: 0 }, b: { top: NOB, bottom: NOB, right: NOB, left: bd(12, YEL) } }),
] })]));
const B = (s, last) => K.push(p([t(s, { size: 17, color: SUB })], { after: last ? 150 : 26, line: 244, indent: { left: 0 } }));
const Hs = (s) => { K.push(sp(56)); H(s); K.push(sp(30)); };

K.push(...tab("정답 및 해설", "UNIT 16  도시들은 왜 슬로건을 만들까?", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("The best slogans tell a story in a few powerful words.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문4 ", { size: 17, bold: true, color: NAVY2 }), t("What residents call the city(S)·can tell(△V)·about it(M)   ", { size: 17, bold: true }),
     t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("cities(S)·have used(△V)·humor·to celebrate ~(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문12 ", { size: 17, bold: true, color: NAVY2 }), t("slogans(S)·show(△V)·identities and creativity·of the people ~(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 이 그림은 내 남동생이 그렸다  (2) 나는 2019년부터 이 마을에 살아 왔다  (3) 그 공원은 여러 해 동안 아이들에게 사랑받아 왔다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 slogans · identities · creativity        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 대조 · ~부터 · 덧붙임 · 조건   2-2 [B] 만드는 사람 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓑ → ⓓ → ⓐ  ·  City slogans show the identities of the people who live there.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) humor  (2) chocolate  (3) identities  (4) creativity        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 2 ①  문장 5 ②  문장 8 ③  문장 12 ①", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3F · 4T · 5F · 6T · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓒ → ⓑ → ⓐ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓐ · 3ⓓ · 4ⓕ · 5ⓔ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) use  (2) are created  (3) has been  (4) is", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) slogans (2) story (3) residents (4) humor (5) chocolate (6) gravity (7) identities (8) creativity", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) This has been Hershey’s slogan since 1990.  (2) Cities use slogans to tell others about who they are.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 도시 슬로건이 무엇을 하는지 설명하고(문장 1–5) 두 사례를 든 뒤(문장 6–11) 슬로건이 주민의 정체성과 창의성을 보여 준다고 맺는다(문장 12). ①이 소재와 주제를 함께 담았다. ②·③는 지엽적, ④·⑤는 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 9에서 허쉬에 있는 것은 자동차 공장이 아니라 초콜릿 공장이다. car로 바꾼 ④가 본문과 다르다. ①은 문장 2, ②은 문장 3, ③는 문장 7–8, ⑤는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) They는 바로 앞 문장 10의 People in Gravity, Iowa를 가리킨다. 그 주민들이 down to earth와 gravity라는 말을 가지고 말놀이를 한 것이다 — 지시어는 바로 앞에서 찾는다.", true);
Hs("독해 04   배열 영작   ·   The best slogans tell a story in a few powerful words.");
B("문장 2를 그대로 복원하는 문제다. ① 첫 글자는 대문자 The.   ② 주어 The best slogans는 복수 — 동사 tell.   ③ in a few powerful words가 뒤에 붙는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 slogans · identities · creativity     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 도시 슬로건이 그 도시와 주민을 어떻게 드러내는지 설명한다. ① 공장 견학과 ③ 관광지 목록은 예시의 일부일 뿐이다.");
B("1-2   ○표 할 세 단어: slogans(힌트① 주인공) · identities(힌트② 보여 주는 것) · creativity(힌트③ 사람들의 특징). 나머지 셋(chocolate · tourists · factory)은 예시와 배경일 뿐이다.");
B("1-3   문장 4 — it은 the city에 ○.   문장 8 — This는 앞 문장의 허쉬 슬로건에 ○.   문장 12 — These slogans는 앞에서 소개한 슬로건들, there는 그 도시들에 ○.");
B("[학습 포인트]   같은 they라도 문장 1에서는 도시를, 문장 11에서는 사람을 가리킨다. 지시어는 뜻이 아니라 '바로 앞의 자리'로 찾는 것이 원칙이다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 대조 / ~부터 / 덧붙임 / 조건     2-2 [B] 만드는 사람 · [E] 마무리     2-3 ①");
B("2-1   문장 3 while — 시청이 만든 슬로건과 주민이 만든 슬로건을 '대조'.   문장 8 since — 1990년'부터' 지금까지.   문장 9 and — 정보를 '덧붙임'.   문장 10 If — '조건'을 거는 말놀이다.");
B("2-2   [B] 만드는 사람(문장 3–5: 시청이 만드나, 주민이 만드나), [E] 마무리(문장 12: 슬로건은 주민의 정체성을 보여 준다). 보기의 '요리법'은 이 글에 없는 역할이다.");
B("2-3   정답 ①. 슬로건이 무엇인지 설명하고 허쉬와 그래비티를 예로 든 설명문이다. 가격·명령문이 없어 광고가 아니고, 날짜와 I가 없어 일기도 아니다.");
B("[학습 포인트]   설명문에서 예시(For instance, Here are ~)가 나오면 그 앞 문장이 곧 주장이다. 예시를 읽기 전에 앞 문장을 다시 확인하는 습관을 들이자.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 identities and creativity · the people who live there     3-3 ⓒ → ⓑ → ⓓ → ⓐ");
B("3-1  재료 찾기 — (2) 문장 12에서 identities and creativity에 ○: 슬로건이 보여 주는 두 가지다. (3) the people who live there에 ○: 그 정체성의 주인이다. 관광객이 아니라 '사는 사람'이라는 점이 핵심이다.");
B("3-2  뼈대 채우기 — (1) City slogans  (2) identities and creativity  (3) the people who live there.");
B("3-3  정답 순서 — ⓒ City slogans → ⓑ show the unique identities → ⓓ and creativity → ⓐ of the people who live there.");
B("[채점 포인트]  주인공(ⓒ)이 맨 앞, 마침표가 붙은 덩어리(ⓐ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) humor  (2) chocolate  (3) identities  (4) creativity");
B("(1)은 문장 5, (2)는 문장 9, (3)·(4)는 문장 12에서 가져온다. 요약문이 곧 이 글의 뼈대다: 슬로건의 쓰임 → 두 사례 → 결론.", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 2 ①   문장 5 ②   문장 8 ③   문장 12 ①  (정답 선지는 무표시)");
B("문장 2 tell a story in a few powerful words   ① ○ 강한 단어 몇 개로 이야기를 전한다.   ② ✕ [반대] 긴 문장이 많이 필요하다.   ③ ✕ [무관] 관광객에게만 말한다는 근거는 없다.");
B("문장 5 used humor for unique features   ① ✕ [반대] 특징을 숨겼다.   ② ○ 농담으로 특별한 점을 내세웠다.   ③ ✕ [무관] 박물관을 지었다는 말은 없다.");
B("문장 8 has been Hershey’s slogan since 1990   ① ✕ [반대] 곧 없어졌다.   ② ✕ [무관] 가수가 썼다는 말은 없다.   ③ ○ 1990년부터 지금까지 쓰인다.");
B("문장 12 show the identities of the people   ① ○ 주민들이 스스로를 어떻게 보는지 알려 준다.   ② ✕ [반대] 진짜 모습을 감춘다.   ③ ✕ [무관] 도시가 얼마나 부유한지는 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 반드시 바꿔서 묻는다. since 1990처럼 시간을 나타내는 말은 '지금까지 계속'인지 '그때뿐'인지를 꼭 구분하자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 F · 4 T · 5 F · 6 T · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 3: 주민이 만드는 슬로건도 있다.   3 F — 문장 5: 유머를 쓴 도시들이 있다.   4 T — 문장 7.   5 F — 문장 8: 1890년이 아니라 1990년부터다.   6 T — 문장 9.   7 T — 문장 11.   8 F — 문장 11: down to earth는 '웃긴'이 아니라 '실용적인'이라는 뜻이다.  거짓 넷은 모두 한 요소(only, never, 1890, funny)만 비튼 것이다.", true);
Hs("R2   생각의 차례   ·   ⓒ → ⓑ → ⓐ → ⓓ");
B("ⓒ 슬로건은 도시가 자신을 알리는 말이라고 밝힌다(문장 1–2) → ⓑ 누가 왜 만드는지 설명한다(문장 3–5) → ⓐ 허쉬와 그래비티 두 사례를 든다(문장 6–11) → ⓓ 슬로건이 주민의 정체성을 보여 준다고 맺는다(문장 12). 설명문은 대개 주장 → 설명 → 예시 → 결론으로 흐른다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓐ · 3 ⓓ · 4 ⓕ · 5 ⓔ · 6 ⓑ");
B("slogan = 기억하기 쉬운 짧은 문구 · resident = 그곳에 사는 사람 · attract = 오고 싶게 만들다 · unique = 다른 어떤 것과도 같지 않은 · celebrate = 중요한 것을 특별하게 기리다 · practical = 실제 생활에 쓸모 있는.", true);
Hs("R4   어법 기초   ·   (1) use  (2) are created  (3) has been  (4) is");
B("(1) 주어 Cities는 복수 — use.   (2) 슬로건은 만들어지는 쪽이므로 수동태 are created. 2면 구문에서 배운 자리다.   (3) 주어 This는 단수 — has been.   (4) 도시 이름 Hershey는 단수 — is.", true);
Hs("R5   빈칸 클로즈   ·   (1) slogans (2) story (3) residents (4) humor (5) chocolate (6) gravity (7) identities (8) creativity");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: use ___ ← 도시가 쓰는 것, tell a ___ ← 이야기를 들려주다, smells like ___ ← 마을 냄새, the unique ___ and ___ ← 마지막 문장의 두 짝.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 어떤 슬로건은 관광객을 끌어들이기 위해 도시가 만들고, 다른 슬로건은 주민들이 만든다.  — are created는 '만들어진다'는 수동태다.");
B("(2) 이 도시 슬로건들은 그곳에 사는 사람들의 독특한 정체성과 창의성을 보여 준다.  — who live there가 앞의 the people을 꾸민다.", true);
Hs("R7   조건 영작   ·   (1) This has been Hershey’s slogan since 1990.  (2) Cities use slogans to tell others about who they are.");
B("(1) 문장 8의 복원. ㄱ 첫 글자 대문자 This  ㄴ has been이 한 덩어리, 마지막은 since 1990.");
B("(2) 문장 1의 복원. ㄱ 첫 글자 대문자 Cities  ㄴ '~하기 위해'는 to tell  ㄷ about who they are로 문장이 끝난다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("도시들은 자신이 누구인지 다른 이들에게 알리기 위해 슬로건을 사용한다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("최고의 슬로건은 몇 개의 강력한 단어로 이야기를 들려준다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("어떤 슬로건은 관광객을 끌어들이기 위해 도시가 만들고, 다른 슬로건은 도시 생활에서 흥미로운 점을 발견한 주민들이 만든다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("주민들이 그 도시를 뭐라고 부르는지가 때로는 그 도시에 대해 더 많은 것을 말해 준다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("어떤 도시들은 자기만의 특징과 명소를 기리기 위해 유머를 사용해 왔다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("여기 미국 곳곳의 최고의 슬로건 몇 가지가 있다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("펜실베이니아주 허쉬의 슬로건은 ‘지구에서 가장 달콤한 곳’이다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것은 1990년부터 허쉬의 슬로건이었다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("허쉬에는 허쉬 초콜릿 공장이 있고 마을 전체가 초콜릿 냄새를 풍긴다!  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("아이오와주 그래비티 사람들은 ‘우리는 소박합니다. 중력이 사라지면, 우리 모두 사라집니다.’라는 슬로건을 쓴다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 실제로 ‘실용적인’을 뜻하는 ‘down to earth’라는 말과 ‘gravity(중력)’라는 단어를 가지고 말놀이를 했다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 도시 슬로건들은 그곳에 사는 사람들의 독특한 정체성과 창의성을 보여 준다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
