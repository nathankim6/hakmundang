/* UNIT 27 — 나선형으로 돌며 잠을 잔다고요? (Level 1) · 축약 유닛(5면)
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
  no: "27",
  title: "나선형으로 돌며 잠을 잔다고요?",
  level: "1",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 27  나선형으로 돌며 잠을 잔다고요?",
  banner: ["27", "나선형으로 돌며 잠을 잔다고요?", "1"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "Elephant seals spend about 7 months of the year in the sea.",
  "But they sleep only about two hours a day during this time.",
  "And they don’t sleep all at once.",
  "To rest, they take “dive naps.”",
  "They close their eyes and dive deep into the ocean.",
  "There, they take short naps for less than 20 minutes.",
  "These dive naps keep them safe.",
  "That’s because sharks and killer whales usually stay near the surface.",
  "During their dive naps, elephant seals enter a deep sleep with their bodies straight up.",
  "They then turn upside down as they go into the second stage of sleep.",
  "In this stage, they can’t move and begin to sink down in a spiral.",
  "After their short nap, they swim to the surface to find food.",
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
  2: [R("But they sleep only about two hours a day during "), RM("this time"), R(".  ")],
  6: [RM("There"), R(", they take short naps for less than 20 minutes.  ")],
  7: [RM("These dive naps"), R(" keep "), RM("them"), R(" safe.  ")],
  11: [R("In "), RM("this stage"), R(", they can’t move and begin to sink down in a spiral.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u27.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  6: [t("(A) ", { size: 19, bold: true }), t("There", { size: 19, bold: true, underline: {} }),
      t(", they take short naps for less than 20 minutes.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Sleeping Deep: How Elephant Seals Nap Safely", "② The Biggest Animals in the Ocean",
 "③ How Sharks Hunt Near the Surface", "④ Why the Ocean Is Getting Warmer",
 "⑤ Foods That Elephant Seals Love"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Elephant seals spend about 7 months of the year in the sea.",
 "② They sleep about ten hours a day during this time.",
 "③ Their dive naps are shorter than 20 minutes.",
 "④ Sharks and killer whales usually stay near the surface.",
 "⑤ They swim to the surface to find food after their nap."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) There가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① deep in the ocean",
 "② near the surface of the sea",
 "③ on the beach in the sun",
 "④ inside a large cave",
 "⑤ in the second stage of sleep"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("짧은 낮잠 뒤에, 그들은 먹이를 찾기 위해 수면으로 헤엄쳐 올라간다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 12단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("surface / their / to / After / find / short / they / nap, / swim / food. / the / to", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   to부정사 '~하기 위해' (목적)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("To rest", { size: 18, bold: true, color: NAVY, underline: {} }), t(", they take “dive naps.”", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 '~하기 위해'라는 목적을 나타냅니다. 문장 맨 앞에 올 수도 있어요!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   조동사 can’t — '~할 수 없다'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("they ", { size: 18 }), t("can’t move", { size: 18, bold: true, color: NAVY, underline: {} }), t(" and begin to sink down", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("조동사 can’t 뒤에는 언제나 동사원형이 옵니다. 둘이 한 덩어리의 동사예요.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("To pass the test", { size: 19, bold: true, color: NAVY, underline: {} }), t(", he studied every night.", { size: 19 })]],
 ["문장 11 구문", [t("I ", { size: 19 }), t("can’t open", { size: 19, bold: true, color: NAVY, underline: {} }), t(" this window.", { size: 19 })]],
 ["둘 다!", [t("To see the stars", { size: 19, bold: true, color: NAVY, underline: {} }), t(", we went outside, but we ", { size: 19 }), t("can’t see", { size: 19, bold: true, color: NAVY, underline: {} }), t(" them in the city.", { size: 19 })]],
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

/* [DATA] 먼저 보기 — 다 표시된 문장 (문장 6: M 문두 + S·V·M) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || "\u00A0", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 10을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([900, 900, 900, 1500, 700, 800, 700, 2530], [new TableRow({ children: [
    exSeg([t("They", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 900),
    exSeg([t("then", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어", MRED, 900),
    exSeg([t("turn", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 900, "△"),
    exSeg([t("upside down", { size: 18 })], "", FAINT, 1500),
    exSeg([t("as", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 700),
    exSeg([t("they", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 800),
    exSeg([t("go", { size: 18, bold: true, color: NAVY })], "V′ 동사", NAVY, 700, "△"),
    exSeg([t("into the second stage of sleep.", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2530),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[5, "They close their eyes and dive deep into the ocean."],
 [8, "That’s because sharks and killer whales usually stay near the surface."],
 [9, "During their dive naps, elephant seals enter a deep sleep with their bodies straight up."]].forEach(([n, c]) => {
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
["① 상어와 범고래의 사냥법", "② 바닷속에서 짧게 잠자는 코끼리물범", "③ 물범을 집에서 기르는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["seals", "물범"], ["naps", "짧은 잠"], ["safe", "안전한"], ["ocean", "바다"], ["spiral", "나선"], ["minutes", "분"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 이들이 바다에서 하는 일  ③ 그렇게 해서 얻는 것 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      this · there · them 같은 지시어는 앞에 나온 말을 대신합니다. 장소와 때도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2350, 6950];
const ahd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(aw, [
  thead(["문장", "지시어", "무엇을 가리키는가 \u2014 하나에 \u25cb표"], aw),
  ...(() => {
    const chipC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16 })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 225 } }),
      { w, shade: "FFFFFF", va: VerticalAlign.CENTER, m: { top: 68, bottom: 68, left: 60, right: 60 },
        b: { top: bd(5, CLINE), bottom: bd(5, CLINE), left: bd(5, CLINE), right: bd(5, CLINE) } });
    const gapC = (w) => cel(p(t(""), { after: 0 }), { w, m: { top: 0, bottom: 0, left: 0, right: 0 } });
    const labC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 40 } });
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    const chips8 = () => T([1150, 900, 150, 900, 250, 850, 1300, 150, 1050], [new TableRow({ children: [
      labC("These naps =", 1150), chipC("짧은 잠", 900), gapC(150), chipC("긴 잠", 900), gapC(250),
      labC("them =", 850), chipC("물범들", 1300), gapC(150), chipC("상어들", 1050),
    ] })]);
    return [
    ["2", "this time", [t("바다에서 지내는 7개월", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["6", "There", chips2("깊은 바닷속", "바다 표면", 1900), false],
    ["7", "These dive naps / them", chips8(), false],
    ["11", "this stage", chips2("두 번째 단계", "먹이 찾는 때", 2100), false],
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
    "Elephant seals spend about 7 months of the year in the sea.",
    "They sleep about twelve hours a day during this time.",
    "Elephant seals don’t sleep all at once.",
    "Their dive naps are longer than 20 minutes.",
    "Dive naps keep elephant seals safe.",
    "Sharks and killer whales usually stay deep on the ocean floor.",
    "In the second stage of sleep, they sink down in a spiral.",
    "After their nap, they stay deep in the ocean to sleep more.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "코끼리물범의 잠수 낮잠 ⓐ~ⓓ를 일어나는 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ They turn upside down and sink down in a spiral.",
      "ⓑ They close their eyes and dive deep into the ocean.",
      "ⓒ They swim up to the surface to find food.",
      "ⓓ They enter a deep sleep with their bodies straight up."]
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

/* ═══════════ [DATA] 해설 1면 — 정답 패널 · 독해 · STEP 1 ═══════════ */
K.push(...tab("정답 및 해설", "UNIT 27  나선형으로 돌며 잠을 잔다고요?", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("②      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("After their short nap, they swim to the surface to find food.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("They(S)·close·dive(△V)·into the ocean(M)   ", { size: 17, bold: true }),
     t("문8 ", { size: 17, bold: true, color: NAVY2 }), t("That(S)·’s(△V)·because[네모]·sharks and killer whales(S′)·stay(△V′)", { size: 17, bold: true })], { after: 22 }),
  p([t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("During their dive naps(M)·elephant seals(S)·enter(△V)·with their bodies straight up(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 그 시험에 통과하기 위해, 그는 매일 밤 공부했다  (2) 나는 이 창문을 열 수 없다  (3) 별을 보기 위해 우리는 밖으로 나갔지만, 도시에서는 별을 볼 수 없다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 seals · naps · safe   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓐ → ⓒ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 코끼리물범이 바닷속 깊이 내려가 짧게 자는 '잠수 낮잠'(문장 4–6)과 그것이 안전을 지켜 주는 이유(문장 7–8)를 설명한다. 소재(코끼리물범의 잠)와 특징(깊이 내려가 안전하게)을 담은 ①이 제목이다. ③·⑤는 지엽적 오답, ②·④는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ②");
B("문장 2에서 하루에 약 두 시간만 잔다고 했으므로, 열 시간을 잔다는 ②는 본문과 반대된다. ①은 문장 1, ③은 문장 6, ④는 문장 8, ⑤는 문장 12에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) There는 바로 앞 문장 5에서 물범들이 내려간 깊은 바닷속을 가리킨다. 지시어는 사람·사물만이 아니라 장소도 대신한다 — 바로 앞 문장에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   After their short nap, they swim to the surface to find food.");
B("문장 12를 그대로 복원하는 문제다. ① 첫 글자는 대문자 After.   ② nap 뒤의 콤마를 빠뜨리지 않는다.   ③ to가 두 번 나온다 — to the surface(방향)와 to find(목적)를 구분한다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 seals · naps · safe     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 코끼리물범이 바닷속에서 어떻게 짧게 자는지를 설명한다. ① 상어와 범고래는 안전의 이유를 설명하는 재료일 뿐이고, ③ 기르는 방법은 나오지 않는다.");
B("1-2   ○표 할 세 단어: seals(힌트① 주인공) · naps(힌트② 바다에서 하는 일) · safe(힌트③ 그렇게 해서 얻는 것). 나머지 셋(ocean · spiral · minutes)은 본문에 나오지만 주제문에 들어가지 않는다 — 장소와 모습, 숫자일 뿐이다.");
B("1-3   문장 6 — There는 깊은 바닷속에 ○ (문장 5에서 내려간 곳).   문장 7 — These dive naps는 짧은 잠에, them은 물범들에 ○ (한 문장 안에서 가리키는 대상이 바뀐다).   문장 11 — this stage는 두 번째 단계에 ○ (문장 10의 그 단계).");
B("[학습 포인트]   지시어는 사물뿐 아니라 때(this time)와 장소(There)도 대신한다. 만날 때마다 앞 문장으로 화살표를 그어 짝을 확인하는 습관을 들이자.", true);

/* ═══════════ [DATA] 해설 2면 — R1 · R2 · 전문 해석 ═══════════ */
K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 2: 열두 시간이 아니라 약 두 시간이다.   3 T — 문장 3.   4 F — 문장 6: 20분보다 길지 않고 짧다(less than).   5 T — 문장 7.   6 F — 문장 8: 바닥 깊은 곳이 아니라 수면 가까이(near the surface) 머문다.   7 T — 문장 10–11.   8 F — 문장 12: 더 자는 게 아니라 먹이를 찾으러 수면으로 올라간다.  거짓 문장은 모두 딱 한 요소(twelve, longer, deep on the floor, sleep more)를 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓐ → ⓒ");
B("ⓑ 눈을 감고 깊은 바닷속으로 내려간다(문장 5) → ⓓ 몸을 곧게 세운 채 깊은 잠에 든다(문장 9) → ⓐ 몸을 뒤집고 나선을 그리며 가라앉는다(문장 10–11) → ⓒ 먹이를 찾아 수면으로 올라온다(문장 12). 안전한 이유(문장 7–8)는 과정 사이에 끼어든 설명이므로 순서에 넣지 않는다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("코끼리물범은 한 해의 약 7개월을 바다에서 보낸다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 이 기간 동안 그들은 하루에 약 두 시간만 잔다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그리고 그들은 한 번에 몰아서 자지 않는다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("쉬기 위해, 그들은 ‘잠수 낮잠’을 잔다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 눈을 감고 바닷속 깊이 잠수한다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그곳에서, 그들은 20분이 채 안 되는 짧은 잠을 잔다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 잠수 낮잠이 그들을 안전하게 지켜 준다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("상어와 범고래가 보통 수면 가까이에 머물기 때문이다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("잠수 낮잠을 자는 동안, 코끼리물범은 몸을 곧게 세운 채 깊은 잠에 든다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런 다음 그들은 두 번째 수면 단계로 들어가면서 몸을 거꾸로 뒤집는다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 단계에서, 그들은 움직일 수 없고 나선을 그리며 가라앉기 시작한다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("짧은 낮잠 뒤에, 그들은 먹이를 찾기 위해 수면으로 헤엄쳐 올라간다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
