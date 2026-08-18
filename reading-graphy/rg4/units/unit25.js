/* UNIT 25 — 우주를 떠다니는 마시멜로? (Level 4)
   새 유닛 작성법: 이 파일을 unitNN.js로 복사한 뒤, [DATA] 표시된 콘텐츠 블록만
   새 지문에 맞게 교체한다(SKILL.md 체크리스트 순서대로). 레이아웃 코드는 건드리지 않는다. */
const L = require("../scripts/lib");
const { fs, path, WORK, ASSETS,
  Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, VerticalAlign, BorderStyle, WidthType, ShadingType, TabStopType, LineRuleType,
  F, FD, FO, INK, SUB, FAINT, CHAR, NAVY, NAVY2, GOLD, YEL, AMB, TEAL, NAVYD, NAVYL,
  PAPER, COOL, GREY, FIELD, FLINE, HAIR, CLINE, WISP, W, GUT, BODY, NOB, noB,
  bd, t, p, cel, T, chipCellG, chipPairG, sp, brk, tab, thead, ask, ch, box, fieldRow, field, writeField, tagline, R, RM,
} = L;

module.exports = {
  no: "25",
  title: "우주를 떠다니는 마시멜로?",
  level: "4",
  foot: "UNIT 25  우주를 떠다니는 마시멜로?",
  banner: ["25", "우주를 떠다니는 마시멜로?", "4"],
  timeline: ["1단계|별빛 관측|행성이 별 앞을 지나면\\n별빛이 살짝 어두워진다|sun",
             "2단계|크기 재기|어두워진 정도로\\n행성의 지름을 구한다",
             "3단계|무게 재기|별이 흔들리는 정도로\\n행성의 질량을 구한다",
             "4단계|밀도 확인|크기에 비해 아주 가벼우면\\n마시멜로 행성!|sparkle_drop"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 10문장 ═══════════ */
const SENT = [
  "Astronomers in Arizona found a giant planet that’s as light as a marshmallow!",
  "This planet, named TOI-3757 b, is floating in space far away, about 580 light years from us.",
  "It’s so big that it’s a little larger than Jupiter.",
  "In other words, this “marshmallow” is so huge that it could fit more than 1,300 Earths inside!",
  "Even though this planet is as big as Jupiter, it’s much lighter.",
  "It’s so light that it would float in a huge bathtub of water!",
  "To discover TOI-3757 b is a surprise to astronomers.",
  "That’s because they thought it was hard for giant planets to form around red dwarf stars.",
  "Until now, astronomers have only been able to find giant Jupiter-sized planets far away from red dwarf stars.",
  "Finding more such systems with giant planets is part of their goal to understand how planets form.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1 [B]2–4 [C]5–6 [D]7–8 [E]9–10 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 2: "B", 5: "C", 7: "D", 9: "E" };
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
  3: [RM("It"), R("’s so big that it’s a little larger than Jupiter.  ")],
  4: [R("In other words, "), RM("this “marshmallow”"), R(" is so huge that it could fit more than 1,300 Earths inside!  ")],
  8: [R("That’s because "), RM("they"), R(" thought it was hard for giant planets to form around red dwarf stars.  ")],
  10: [R("Finding more such systems with giant planets is part of "), RM("their"), R(" goal to understand how planets form.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u25.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  4: [t("In other words, ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("this “marshmallow”", { size: 19, bold: true, underline: {} }),
      t(" is so huge that it could fit more than 1,300 Earths inside!  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A Giant Planet as Light as a Marshmallow", "② Jupiter: The Biggest Planet in Space",
 "③ Why Red Dwarf Stars Shine Red", "④ How to Count 1,300 Earths",
 "⑤ The History of Marshmallow Candy"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Astronomers in Arizona found the giant planet.",
 "② TOI-3757 b is about 580 light years from us.",
 "③ The planet is a little smaller than Jupiter.",
 "④ The planet is much lighter than Jupiter.",
 "⑤ Astronomers thought giant planets hardly formed around red dwarf stars."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) this “marshmallow”가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the giant planet TOI-3757 b",
 "② a real marshmallow candy",
 "③ a red dwarf star",
 "④ the planet Jupiter",
 "⑤ a huge bathtub of water"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그것은 너무 가벼워서 물이 가득한 거대한 욕조에서도 뜰 것이다!", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 13단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("float / a / that / It’s / water! / so / huge / would / light / in / of / bathtub / it", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 1", { size: 14, bold: true, color: AMB }), t("   원급 비교 as + 형용사 + as", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("as ", { size: 18, bold: true, color: NAVY }), t("light", { size: 18, underline: {} }), t(" as", { size: 18, bold: true, color: NAVY }), t(" a marshmallow", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("as와 as 사이에 형용사를 넣어 '~만큼 …한'이라고 견줍니다. '마시멜로만큼 가벼운'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   so + 형용사 + that … (너무 ~해서 …하다)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("so ", { size: 18, bold: true, color: NAVY }), t("big", { size: 18, underline: {} }), t(" that", { size: 18, bold: true, color: NAVY }), t(" it’s a little larger", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("that 뒤에는 그 결과가 되는 문장이 옵니다. '너무 커서 목성보다 조금 더 크다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 1 구문", [t("My bag is ", { size: 19 }), t("as", { size: 19, bold: true, color: NAVY }), t(" heavy", { size: 19, underline: {} }), t(" as", { size: 19, bold: true, color: NAVY }), t(" a big rock.", { size: 19 })]],
 ["문장 3 구문", [t("The soup was ", { size: 19 }), t("so", { size: 19, bold: true, color: NAVY }), t(" hot", { size: 19, underline: {} }), t(" that", { size: 19, bold: true, color: NAVY }), t(" I couldn’t eat it.", { size: 19 })]],
 ["둘 다!", [t("The puppy is ", { size: 19 }), t("as", { size: 19, bold: true, color: NAVY }), t(" small", { size: 19, underline: {} }), t(" as", { size: 19, bold: true, color: NAVY }), t(" my shoe, and it is ", { size: 19 }), t("so", { size: 19, bold: true, color: NAVY }), t(" cute", { size: 19, underline: {} }), t(" that", { size: 19, bold: true, color: NAVY }), t(" everyone smiles.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 1을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1500, 1400, 950, 1800, 3280], [new TableRow({ children: [
    exSeg([t("Astronomers", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1500),
    exSeg([t("in Arizona", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1400),
    exSeg([t("found", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 950, "△"),
    exSeg([t("a giant planet", { size: 18 })], "", FAINT, 1800),
    exSeg([t("that’s as light as a marshmallow!", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(절)", MRED, 3280),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[5, "Even though this planet is as big as Jupiter, it’s much lighter."],
 [7, "To discover TOI-3757 b is a surprise to astronomers."],
 [9, "Until now, astronomers have only been able to find giant Jupiter-sized planets far away from red dwarf stars."]].forEach(([n, c]) => {
  K.push(p([t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + c, { size: 20 }),
    t("      → 문장에 직접 표시!", { size: 13, color: FAINT })], { after: 58, line: 520 }));
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
["① 마시멜로를 만드는 방법", "② 마시멜로처럼 가벼운 거대 행성의 발견", "③ 목성의 크기와 위성들"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["Jupiter", "목성"], ["planet", "행성"], ["water", "물"], ["light", "가벼운"], ["Arizona", "애리조나"], ["surprise", "놀라움"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 그 놀라운 상태  ③ 천문학자들의 반응 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · this · they 같은 지시어는 앞에 나온 말을 대신합니다. 사물도, 사람도, 앞 내용 전체도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2450, 6850];
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
    const chips8 = () => T([820, 1200, 170, 1200, 300, 930, 1200, 170, 1200], [new TableRow({ children: [
      labC("they =", 820), chipC("사람들", 1200), gapC(170), chipC("버스들", 1200), gapC(300),
      labC("them =", 930), chipC("사람들", 1200), gapC(170), chipC("버스들", 1200),
    ] })]);
    return [
    ["3", "It", [t("TOI-3757 b (그 행성)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "this “marshmallow”", chips2("TOI-3757 b", "진짜 마시멜로", 1900), false],
    ["8", "they", chips2("천문학자들", "거대 행성들", 1900), false],
    ["10", "their", chips2("천문학자들의", "적색왜성들의", 2100), false],
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
  t("      밑줄 친 연결어가 어떤 일을 하는지, 괄호 안에서 골라 ○표 하세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
const gw = [900, 6100, 3000];
const ghd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(gw, [
  thead(["문장", "본문 문장 (연결어 밑줄)", "하는 일"], gw),
  ...[
    ["4", [t("In other words", { size: 17, bold: true, color: NAVY, underline: {} }), t(", this “marshmallow” is so huge that it could fit 1,300 Earths.", { size: 17 })], ["바꿔 말하기", "이유"]],
    ["5", [t("Even though", { size: 17, bold: true, color: NAVY, underline: {} }), t(" this planet is as big as Jupiter, it’s much lighter.", { size: 17 })], ["양보", "결과"]],
    ["6", [t("It’s ", { size: 17 }), t("so", { size: 17, bold: true, color: NAVY, underline: {} }), t(" light ", { size: 17 }), t("that", { size: 17, bold: true, color: NAVY, underline: {} }), t(" it would float in a bathtub of water!", { size: 17 })], ["결과", "바꿔 말하기"]],
    ["8", [t("That’s ", { size: 17 }), t("because", { size: 17, bold: true, color: NAVY, underline: {} }), t(" they thought it was hard for giant planets to form.", { size: 17 })], ["이유", "양보"]],
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
    chipCellG("크기", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("목표", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("가격", 1400),
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
  flowCell("A", "발견", "문장 1", false),
  arrowCell(),
  flowCell("B", null, "문장 2–4", true),
  arrowCell(),
  flowCell("C", "무게", "문장 5–6", false),
  arrowCell(),
  flowCell("D", "놀라움", "문장 7–8", false),
  arrowCell(),
  flowCell("E", null, "문장 9–10", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 새로운 발견을 사실대로 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일을 적은 일기",
 "④ 안부를 묻는 편지",
 "⑤ 상상으로 지어낸 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

/* ═══════════ 5면 [DATA] STEP 3 주제문 만들기 ═══════════ */
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
  matRow("1", "1", "천문학자들이 발견한 것은 무엇인가요?", "planet", "The giant 뒤 자리", true),
  matRow("2", "1", "이 행성의 무게를 나타낸 말은?", ["light", "heavy"], "as ~ as 사이 자리 (현실)", false),
  matRow("3", "7", "천문학자들이 느낀 것은?", ["surprise", "problem"], "a 뒤 자리 (평가)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("The giant  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   as  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  as a marshmallow  is a  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  to astronomers.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ as light as a marshmallow     ⓑ is a surprise     ⓒ The giant planet     ⓓ to astronomers.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("light        Jupiter        surprise        form", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Astronomers found a giant planet as (1) ____________ as a marshmallow. It is a little bigger than (2) ____________, but it is much lighter. This was a big (3) ____________ because giant planets were thought to be hard to (4) ____________ around red dwarf stars.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 1, main: "as light as a marshmallow",
    opts: ["① very heavy for its size", "② not heavy at all", "③ made of real sugar"] },
  { sn: 3, main: "a little larger than Jupiter",
    opts: ["① a bit bigger than Jupiter", "② much smaller than Jupiter", "③ closer to the sun"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 7, main: "is a surprise to astronomers",
    opts: ["① astronomers already knew it", "② astronomers did not expect it", "③ astronomers gave it a name"] },
  { sn: 9, main: "Until now",
    opts: ["① for one hundred years", "② from now on", "③ up to this time"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 적색왜성과 행성 찾기", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("적색왜성(red dwarf)은 태양보다 작고 어두운 별로, 우주에서 가장 흔한 별이다. 별이 작으면 그 주변에 모이는 재료도 적기 때문에, 과학자들은 목성 같은 거대 행성이 적색왜성 곁에서는 잘 만들어지지 않는다고 오래 믿어 왔다. TOI-3757 b의 발견이 놀라운 이유가 여기에 있다. 천문학자들은 행성이 별 앞을 지날 때 별빛이 살짝 어두워지는 정도를 재서 크기를 구하고, 별이 흔들리는 정도를 재서 무게를 구한다. 크기에 비해 무게가 아주 가벼우면 '마시멜로 행성'이 된다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u25.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Astronomers in Arizona found a giant planet.",
    "The planet is about 580 light years from us.",
    "The planet is a little smaller than Jupiter.",
    "The “marshmallow” could fit more than 1,300 Earths inside.",
    "This planet is much heavier than Jupiter.",
    "The planet would sink in a huge bathtub of water.",
    "Astronomers thought it was hard for giant planets to form around red dwarf stars.",
    "Astronomers have found many giant planets close to red dwarf stars.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "천문학자들에게 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Astronomers in Arizona found a giant planet.",
      "ⓑ Astronomers thought giant planets could not form around red dwarf stars.",
      "ⓒ They found that the planet was as light as a marshmallow.",
      "ⓓ They set a goal to understand how planets form."]
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
    ["1  astronomer", "ⓐ to find something for the first time"],
    ["2  float", "ⓑ a person who studies stars and planets"],
    ["3  huge", "ⓒ to stay on top of water or in the air"],
    ["4  fit", "ⓓ very, very big"],
    ["5  discover", "ⓔ something you want to do or reach"],
    ["6  goal", "ⓕ to be the right size for a space"],
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
[["문장 2", [t("This planet ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" floating in space far away.", { size: 19 })], "주어 This planet은 단수예요."],
 ["문장 6", [t("It’s so light that it ", { size: 19 }), t("( would float  /  would floats )", { size: 19, bold: true, color: NAVY }), t(" in a bathtub.", { size: 19 })], "조동사 뒤에는 언제나 동사원형!"],
 ["문장 7", [t("", { size: 19 }), t("( To discover  /  Discover )", { size: 19, bold: true, color: NAVY }), t(" TOI-3757 b is a surprise to astronomers.", { size: 19 })], "주어 자리에는 to+동사원형이 올 수 있어요."],
 ["문장 10", [t("", { size: 19 }), t("( Finding  /  Find )", { size: 19, bold: true, color: NAVY }), t(" more such systems is part of their goal.", { size: 19 })], "동명사(~ing)도 주어가 될 수 있어요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("fit  /  larger  /  goal  /  light  /  float  /  discover  /  floating  /  lighter", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Astronomers in Arizona found a giant planet that’s as", { size: 19 }), ...BL(1), t("as a marshmallow!  ", { size: 19 }),
  num(2), t(" This planet, named TOI-3757 b, is", { size: 19 }), ...BL(2), t("in space far away, about 580 light years from us.  ", { size: 19 }),
  num(3), t(" It’s so big that it’s a little", { size: 19 }), ...BL(3), t("than Jupiter.  ", { size: 19 }),
  num(4), t(" In other words, this “marshmallow” is so huge that it could", { size: 19 }), ...BL(4), t("more than 1,300 Earths inside!  ", { size: 19 }),
  num(5), t(" Even though this planet is as big as Jupiter, it’s much", { size: 19 }), ...BL(5), t(".  ", { size: 19 }),
  num(6), t(" It’s so light that it would", { size: 19 }), ...BL(6), t("in a huge bathtub of water!  ", { size: 19 }),
  num(7), t(" To", { size: 19 }), ...BL(7), t("TOI-3757 b is a surprise to astronomers.  ", { size: 19 }),
  num(8), t(" That’s because they thought it was hard for giant planets to form around red dwarf stars.  ", { size: 19 }),
  num(9), t(" Until now, astronomers have only been able to find giant Jupiter-sized planets far away from red dwarf stars.  ", { size: 19 }),
  num(10), t(" Finding more such systems with giant planets is part of their", { size: 19 }), ...BL(8), t("to understand how planets form.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[1, "Astronomers in Arizona found a giant planet that’s as light as a marshmallow!"],
 [7, "To discover TOI-3757 b is a surprise to astronomers."]].forEach(([n, s], i) => {
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
w7block("1", "그것은 너무 커서 목성보다 조금 더 크다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 10단어)",
  "big / than / It’s / a / larger / so / it’s / Jupiter. / that / little");
w7block("2", "비록 이 행성은 목성만큼 크지만, 그것은 훨씬 더 가볍다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 12단어)",
  "much / as / this / lighter. / though / Jupiter, / big / Even / planet / it’s / as / is");

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

K.push(...tab("정답 및 해설", "UNIT 25  우주를 떠다니는 마시멜로?", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("It’s so light that it would float in a huge bathtub of water!", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("Even though[네모]·this planet(S′)·is(△V′)·it’s(S+△V)   ", { size: 17, bold: true }),
     t("문7 ", { size: 17, bold: true, color: NAVY2 }), t("To discover TOI-3757 b(S)·is(△V)·to astronomers(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("Until now(M)·astronomers(S)·have been able to find(△V)·far away~stars(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 내 가방은 큰 바위만큼 무겁다  (2) 그 수프는 너무 뜨거워서 나는 그것을 먹을 수 없었다  (3) 그 강아지는 내 신발만큼 작고, 너무 귀여워서 모두가 미소 짓는다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 planet · light · surprise        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 바꿔 말하기 · 양보 · 결과 · 이유   2-2 [B] 크기 · [E] 목표   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓐ → ⓑ → ⓓ  ·  The giant planet as light as a marshmallow is a surprise to astronomers.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) light  (2) Jupiter  (3) surprise  (4) form        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 1 ②  문장 3 ①  문장 7 ②  문장 9 ③", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4T · 5F · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓒ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓑ · 2ⓒ · 3ⓓ · 4ⓕ · 5ⓐ · 6ⓔ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) is  (2) would float  (3) To discover  (4) Finding", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) light (2) floating (3) larger (4) fit (5) lighter (6) float (7) discover (8) goal", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) It’s so big that it’s a little larger than Jupiter.  (2) Even though this planet is as big as Jupiter, it’s much lighter.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("마시멜로만큼 가벼운 거대 행성의 발견(문장 1–6)과 그것이 놀라운 이유(문장 7–10)를 알리는 글이다. 소재(거대 행성)와 특징(마시멜로처럼 가볍다)을 담은 ①이 적절하다. ②·④는 비교 대상과 숫자만 건드린 지엽적 오답, ③·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 3에서 이 행성은 목성보다 '조금 더 크다(a little larger)'고 했으므로, 더 작다는 ③은 본문과 반대된다. ①은 문장 1, ②는 문장 2, ④는 문장 5, ⑤는 문장 8에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) this “marshmallow”는 문장 1–2에서 소개한 거대 행성 TOI-3757 b를 가리킨다. 따옴표가 붙은 별명이지 진짜 과자가 아니다 — this+명사는 앞에 나온 것을 다시 부르는 신호다.", true);
Hs("독해 04   배열 영작   ·   It’s so light that it would float in a huge bathtub of water!");
B("문장 6을 그대로 복원하는 문제다. ㄱ 첫 글자는 대문자 It’s.   ㄴ so + 형용사 + that + 결과 문장의 순서를 지킨다.   ㄷ 조동사 would 뒤에는 동사원형 float.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 planet · light · surprise     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 마시멜로처럼 가벼운 거대 행성의 발견을 다룬다. ① 마시멜로는 가벼움을 견주기 위한 비유일 뿐이고, ③ 목성은 크기를 견주는 대상일 뿐이다.");
B("1-2   ○표 할 세 단어: planet(힌트① 주인공) · light(힌트② 그 놀라운 상태) · surprise(힌트③ 천문학자들의 반응). 나머지 셋(Jupiter · water · Arizona)은 본문에 나오지만 주제문에는 들어가지 않는다 — 비교 대상과 배경일 뿐이다.");
B("1-3   문장 4 — this “marshmallow”는 TOI-3757 b에 ○.   문장 8 — they는 천문학자들에 ○.   문장 10 — their는 천문학자들의에 ○ (목표의 주인).");
B("[학습 포인트]   같은 글 안에서도 지시어가 가리키는 대상은 바뀐다. 문장 3의 It은 행성을, 문장 8의 they는 천문학자들을 받는다 — 앞 문장에서 짝을 찾아 화살표로 이어 두자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 바꿔 말하기 / 양보 / 결과 / 이유     2-2 [B] 크기 · [E] 목표     2-3 ①");
B("2-1   문장 4 In other words — 앞의 크기를 쉬운 비유로 '바꿔 말한다'.   문장 5 Even though — 크지만 가볍다는 '양보'.   문장 6 so ~ that — 가벼워서 물에 뜬다는 '결과'.   문장 8 because — 놀라운 '이유'를 댄다.");
B("2-2   [B] 크기(문장 2–4: 목성보다 크고 지구 1,300개가 들어간다), [E] 목표(문장 9–10: 이런 항성계를 더 찾아 행성 형성을 이해하려 한다). 보기의 '가격'은 이 글에 없는 역할이다. [A] 발견 → [B] 크기 → [C] 무게 → [D] 놀라움 → [E] 목표.");
B("2-3   정답 ①. 새로 발견한 행성의 사실을 차례로 알려 주는 설명문이다. ② 사라는 말·가격이 없어 광고가 아니고, ③ I·날짜가 없어 일기도, ④ Dear ~가 없어 편지도, ⑤ 지어낸 이야기도 아니다.");
B("[학습 포인트]   설명문은 '무엇을 발견했나 → 어떤 것인가 → 왜 놀라운가 → 앞으로 무엇을 할 것인가'로 흐른다. 연결어에 동그라미만 쳐도 이 지도가 보인다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 light · surprise     3-3 ⓒ → ⓐ → ⓑ → ⓓ");
B("3-1  재료 찾기 — (2) 문장 1에서 light에 ○: 마시멜로에 견준 것은 무게다. heavy는 정반대. (3) 문장 7에서 surprise에 ○: 천문학자들의 반응이 곧 글쓴이의 평가다. problem은 본문에 없다.");
B("3-2  뼈대 채우기 — (1) planet  (2) light  (3) surprise.  넣으면 The giant planet as light as a marshmallow is a surprise to astronomers.가 완성된다.");
B("3-3  정답 순서 — ⓒ The giant planet → ⓐ as light as a marshmallow → ⓑ is a surprise → ⓓ to astronomers.");
B("[채점 포인트]  주인공(ⓒ)이 맨 앞, 마침표가 붙은 덩어리(ⓓ)가 맨 뒤 — 이 두 자리만 잡으면 가운데는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) light  (2) Jupiter  (3) surprise  (4) form");
B("(1)은 문장 1의 light, (2)는 문장 3의 Jupiter, (3)은 문장 7의 surprise, (4)는 문장 8의 form에서 가져온다. 요약문이 곧 이 글의 흐름이다: 발견(1) → 크기(2) → 놀라움(3) → 이유(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 1 ②   문장 3 ①   문장 7 ②   문장 9 ③  (정답 선지는 무표시)");
B("문장 1 as light as a marshmallow   ① ✕ [반대] 크기에 비해 아주 무겁다 — 정반대.   ② ○ 전혀 무겁지 않다.   ③ ✕ [무관] 진짜 설탕으로 만들었다는 말은 지문에 없다.");
B("문장 3 a little larger than Jupiter   ① ○ 목성보다 조금 더 크다.   ② ✕ [반대] 훨씬 더 작다 — 정반대.   ③ ✕ [무관] 태양과의 거리는 지문에 없다.");
B("문장 7 is a surprise to astronomers   ① ✕ [반대] 이미 알고 있었다 — 정반대.   ② ○ 예상하지 못했다.   ③ ✕ [무관] 이름을 지어 주었다는 말은 지문에 없다.");
B("문장 9 Until now   ① ✕ [무관] 백 년 동안이라는 말은 지문에 없다.   ② ✕ [반대] 지금부터 — 방향이 정반대.   ③ ○ 지금 이 시점까지.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. '이 표현을 다른 말로 하면?'을 스스로 물어보자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 T · 5 F · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 T — 문장 2.   3 F — 문장 3: smaller가 아니라 larger다.   4 T — 문장 4.   5 F — 문장 5: heavier가 아니라 lighter다.   6 F — 문장 6: sink가 아니라 뜬다(float).   7 T — 문장 8.   8 F — 문장 9: close가 아니라 far away에서만 찾아 왔다.  거짓 문장은 모두 딱 한 단어(smaller, heavier, sink, close)를 비튼 것이다 — 그 한 단어를 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓐ → ⓒ → ⓓ");
B("ⓑ 거대 행성은 적색왜성 곁에 못 생긴다고 믿어 왔다(문장 8, 발견 이전) → ⓐ 애리조나에서 거대 행성을 발견한다(문장 1) → ⓒ 마시멜로만큼 가볍다는 것을 알아낸다(문장 5–6) → ⓓ 행성 형성을 이해하겠다는 목표를 세운다(문장 10). 서술 순서는 ⓐ가 먼저지만 실제로는 ⓑ의 믿음이 먼저 있었다 — 그래서 이 발견이 놀라운 것이다.", true);
Hs("R3   영영풀이   ·   1 ⓑ · 2 ⓒ · 3 ⓓ · 4 ⓕ · 5 ⓐ · 6 ⓔ");
B("astronomer = 별과 행성을 연구하는 사람 · float = 물 위나 공중에 떠 있다 · huge = 아주아주 큰 · fit = 어떤 공간에 알맞게 들어가다 · discover = 처음으로 찾아내다 · goal = 이루고자 하는 것.", true);
Hs("R4   어법 기초   ·   (1) is  (2) would float  (3) To discover  (4) Finding");
B("(1) 주어 This planet은 단수 — is.   (2) 조동사 would 뒤에는 동사원형 — would float. 2면 분석 Tip처럼 한 덩어리의 동사다.   (3) 주어 자리의 to부정사 — To discover.   (4) 주어 자리의 동명사 — Finding. (3)과 (4)는 동사를 주어로 만드는 두 가지 방법이다.", true);
Hs("R5   빈칸 클로즈   ·   (1) light (2) floating (3) larger (4) fit (5) lighter (6) float (7) discover (8) goal");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: as ___ as ← 원급 비교, a little ___ than ← 비교급, could ___ ← 조동사 뒤 동사원형, their ___ ← 명사 자리. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 애리조나의 천문학자들이 마시멜로만큼 가벼운 거대 행성을 발견했다!  — that절이 앞의 planet을 꾸미고, as ~ as는 '~만큼 …한'으로 옮긴다.");
B("(2) TOI-3757 b를 발견한 것은 천문학자들에게 놀라운 일이다.  — 문장 맨 앞의 To discover는 '발견하는 것은'이라는 주어다.", true);
Hs("R7   조건 영작   ·   (1) It’s so big that it’s a little larger than Jupiter.  (2) Even though this planet is as big as Jupiter, it’s much lighter.");
B("(1) 문장 3의 복원. ㄱ 첫 글자 대문자 It’s  ㄴ so + 형용사 + that의 순서  ㄷ 비교급 larger 뒤에는 than.");
B("(2) 문장 5의 복원. ㄱ 첫 글자 대문자 Even  ㄴ as big as를 한 덩어리로 붙인다  ㄷ Jupiter 뒤의 콤마를 빠뜨리지 않는다. 2면 구문 카드의 as ~ as가 여기서 다시 나온다 — 워크북은 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("애리조나의 천문학자들이 마시멜로만큼 가벼운 거대 행성을 발견했다!  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("TOI-3757 b라는 이름의 이 행성은 우리에게서 약 580광년 떨어진 우주에 떠 있다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 너무 커서 목성보다 조금 더 크다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("다시 말해, 이 ‘마시멜로’는 너무 거대해서 그 안에 지구를 1,300개 넘게 넣을 수 있다!  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 행성은 목성만큼 크지만, 훨씬 더 가볍다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 너무 가벼워서 물이 가득한 거대한 욕조에서도 뜰 것이다!  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("TOI-3757 b를 발견한 것은 천문학자들에게 놀라운 일이다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 그들이 거대 행성은 적색왜성 주위에서 만들어지기 어렵다고 생각했기 때문이다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("지금까지 천문학자들은 목성 크기의 거대 행성을 적색왜성에서 멀리 떨어진 곳에서만 찾을 수 있었다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("거대 행성이 있는 그런 항성계를 더 많이 찾는 것은 행성이 어떻게 만들어지는지 이해하려는 그들의 목표의 일부다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
