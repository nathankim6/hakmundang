/* UNIT 13 — 바늘구멍 속의 조각가 (Level 3)
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
  no: "13",
  title: "바늘구멍 속의 조각가",
  level: "3",
  foot: "UNIT 13  바늘구멍 속의 조각가",
  banner: ["13", "바늘구멍 속의 조각가", "3"],
  timeline: ["1단계|현미경 앞에서|바늘로 만든 도구로\\n형태를 깎는다",
             "2단계|심장 박동 사이|속눈썹으로 색을 칠하며\\n맥박을 피해 작업한다",
             "3단계|바늘구멍 속으로|완성된 작품이\\n바늘귀 안에 놓인다"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 9문장 ═══════════ */
const SENT = [
  "Willard Wigan is an artist who makes small sculptures of famous paintings and characters like the Mona Lisa and Pinocchio.",
  "But guess what?",
  "These sculptures are so small that they can be placed even in the eye of a needle!",
  "Making these tiny artworks is a big challenge.",
  "First, the artist has to use a microscope to see them clearly, and use really small tools made from needles.",
  "Then, he paints his sculptures by using an eyelash and must work between heartbeats because even the pulse in his fingers can cause problems.",
  "Wigan\u2019s small artwork has an important message: \u201CSmall things matter in a disappearing world.\u201D",
  "He reminds us that our world is in trouble, and we need to make changes to protect the variety of life on Earth.",
  "His tiny work makes people think that even the smallest things can have a big impact.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4–6 [C]7 [D]8 [E]9 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 7: "C", 8: "D", 9: "E" };
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
  3: [RM("These sculptures"), R(" are so small that they can be placed even in the eye of a needle!  ")],
  5: [R("First, the artist has to use a microscope to see "), RM("them"), R(" clearly, and use really small tools made from needles.  ")],
  8: [RM("He"), R(" reminds "), RM("us"), R(" that our world is in trouble, and we need to make changes to protect the variety of life on Earth.  ")],
  9: [RM("His"), R(" tiny work makes people think that even the smallest things can have a big impact.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u13.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  5: [t("First, the artist has to use a microscope to see ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(" clearly, and use really small tools made from needles.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Tiny Art with a Big Message", "② How Needles Are Made in a Factory",
 "③ The Long History of the Mona Lisa", "④ Artists Who Use a Microscope Every Day",
 "⑤ The Best Way to Protect Wild Animals"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Willard Wigan makes small sculptures of famous paintings and characters.",
 "② His sculptures can be placed even in the eye of a needle.",
 "③ The artist uses a microscope to see his tiny artworks clearly.",
 "④ He paints his sculptures by using a very small brush.",
 "⑤ He wants us to protect the variety of life on Earth."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the tiny sculptures",
 "② the small tools",
 "③ the needles",
 "④ his fingers",
 "⑤ the famous paintings"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("이 아주 작은 예술 작품들을 만드는 것은 큰 도전이다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("is / these / big / making / a / tiny / challenge / artworks", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   동명사 주어 (Making ~ is)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Making these tiny artworks", { size: 18, bold: true, color: NAVY, underline: {} }), t(" is a big challenge", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("'~하는 것은'이라는 주어는 동사원형+ing로 만듭니다. 하나로 보아 is를 씁니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 5", { size: 14, bold: true, color: AMB }), t("   to부정사 '~하기 위해' (목적)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("has to use a microscope ", { size: 18 }), t("to see them clearly", { size: 18, bold: true, color: NAVY, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 '~하기 위해'라는 목적을 나타냅니다. '또렷이 보기 위해 현미경을 쓴다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("Riding a bike", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is good exercise.", { size: 19 })]],
 ["문장 5 구문", [t("I opened the window ", { size: 19 }), t("to get fresh air", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("Growing plants", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is fun, so I get up early ", { size: 19 }), t("to water them", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 3을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1750, 700, 900, 560, 650, 1500, 2870], [new TableRow({ children: [
    exSeg([t("These sculptures", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1750),
    exSeg([t("are", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 700, "\u25b3"),
    exSeg([t("so small", { size: 18 })], "", FAINT, 900),
    exSeg([t("that", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 560),
    exSeg([t("they", { size: 18, bold: true, color: SGRN, underline: {} })], "S\u2032 주어", SGRN, 650),
    exSeg([t("can be placed", { size: 18, bold: true, color: NAVY })], "V\u2032 한 덩어리", NAVY, 1500, "\u25b3"),
    exSeg([t("even in the eye of a needle", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2870),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[4, "Making these tiny artworks is a big challenge."],
 [5, "First, the artist has to use a microscope to see them clearly, and use really small tools made from needles."],
 [9, "His tiny work makes people think that even the smallest things can have a big impact."]].forEach(([n, c]) => {
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
  K.push(writeField(1, 340));
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
["① 바늘을 만드는 공장의 하루", "② 바늘구멍에 들어가는 초소형 조각", "③ 모나리자 그림의 역사"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["artworks", "예술 작품"], ["tiny", "아주 작은"], ["needle", "바늘"], ["impact", "영향"], ["microscope", "현미경"], ["eyelash", "속눈썹"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 위건이 만드는 것  ② 그 작품의 크기  ③ 글쓴이의 평가 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · them 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서 가리키는 대상이 바뀌기도 해요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const chips8 = () => T([700, 1150, 150, 1150, 250, 700, 1150, 150, 1150], [new TableRow({ children: [
      labC("He =", 700), chipC("위건", 1150), gapC(150), chipC("독자들", 1150), gapC(250),
      labC("us =", 700), chipC("우리 모두", 1150), gapC(150), chipC("조각들", 1150),
    ] })]);
    return [
    ["3", "These sculptures", [t("small sculptures (작은 조각들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["5", "them", chips2("조각 작품들", "작은 도구들", 1900), false],
    ["8", "He / us", chips8(), false],
    ["9", "His", chips2("위건의", "관람객의", 1900), false],
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
    ["2", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" guess what?", { size: 17 })], ["반전", "순서"]],
    ["3", [t("These sculptures are ", { size: 17 }), t("so", { size: 17, bold: true, color: NAVY, underline: {} }), t(" small ", { size: 17 }), t("that", { size: 17, bold: true, color: NAVY, underline: {} }), t(" they can be placed in the eye of a needle!", { size: 17 })], ["결과", "이유"]],
    ["5", [t("First", { size: 17, bold: true, color: NAVY, underline: {} }), t(", the artist has to use a microscope to see them clearly.", { size: 17 })], ["순서", "반전"]],
    ["6", [t("He must work between heartbeats ", { size: 17 }), t("because", { size: 17, bold: true, color: NAVY, underline: {} }), t(" the pulse in his fingers can cause problems.", { size: 17 })], ["이유", "결과"]],
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
    chipCellG("제작 과정", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("마무리", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("광고", 1400),
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
  flowCell("A", "소개", "문장 1–3", false),
  arrowCell(),
  flowCell("B", null, "문장 4–6", true),
  arrowCell(),
  flowCell("C", "메시지", "문장 7", false),
  arrowCell(),
  flowCell("D", "당부", "문장 8", false),
  arrowCell(),
  flowCell("E", null, "문장 9", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 한 예술가와 그의 작품을 소개하는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 요리 방법을 알려 주는 글",
 "④ 친구에게 안부를 전하는 편지",
 "⑤ 하루 일을 기록한 일기"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "4", "위건이 만드는 것을 가리키는 말은? (두 단어)", "tiny artworks", "주제문의 주어 자리", true),
  matRow("2", "9", "'가장 작은'을 나타낸 말은?", ["smallest", "biggest"], "even the ___ things 자리", false),
  matRow("3", "9", "작은 것들이 남기는 것을 나타낸 말은?", ["impact", "problem"], "a big ___ 자리", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("Wigan\u2019s  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   show that even the  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  things can have a big  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("\u24D0 can have a big impact.     \u24D1 Wigan\u2019s tiny artworks     \u24D2 that even the smallest things     \u24D3 show", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  \u24D1  )", { size: 19 }), t("  \u2192  (      )  \u2192  (      )  \u2192  (      )", { size: 19 }),
  t("      주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("needle        microscope        message        smallest", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Willard Wigan makes artworks so small that they fit in the eye of a (1) ____________ . He uses a (2) ____________ and an eyelash to make them. His (3) ____________ is that even the (4) ____________ things can have a big impact.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 3, main: "so small that they can be placed in the eye of a needle",
    opts: ["\u2460 too big to go into a needle\u2019s eye", "\u2461 tiny enough to fit in a needle\u2019s eye", "\u2462 made of gold and silver"] },
  { sn: 4, main: "a big challenge",
    opts: ["\u2460 a very difficult job", "\u2461 a very easy job", "\u2462 a fun game for children"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "our world is in trouble",
    opts: ["\u2460 our world is perfectly safe", "\u2461 our world is getting bigger", "\u2462 our world is in danger"] },
  { sn: 9, main: "can have a big impact",
    opts: ["\u2460 can change nothing", "\u2461 can change many things", "\u2462 can be sold at a high price"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 바늘구멍 예술 (micro sculpture)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("바늘구멍 안에 들어갈 만큼 작은 조각을 마이크로 조각(micro sculpture)이라고 한다. 작품 하나의 크기가 머리카락 굵기 안팎이라 맨눈으로는 먼지처럼 보이고, 현미경을 통해야 비로소 형태가 드러난다. 작가들은 바늘 끝을 갈아 만든 도구로 형태를 깎고, 속눈썹 한 올을 붓 삼아 색을 칠한다. 이때 가장 큰 적은 자기 몸이다. 숨을 쉬거나 심장이 뛸 때 생기는 미세한 떨림만으로도 작품이 부서지기 때문에, 작가는 호흡을 늦추고 심장 박동 사이의 짧은 순간에만 손을 움직인다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u13.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Willard Wigan makes small sculptures of famous paintings and characters.",
    "His sculptures are so small that they can be placed in the eye of a needle.",
    "Making these tiny artworks is an easy job.",
    "The artist uses a telescope to see the tiny artworks clearly.",
    "Wigan paints his sculptures by using an eyelash.",
    "He must work during his heartbeats.",
    "Wigan\u2019s message is that small things matter in a disappearing world.",
    "He says that our world has no problems at all.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "위건이 작품을 만드는 과정 ⓐ~ⓓ를 실제 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["\u24D0 He paints the sculpture by using an eyelash.",
      "\u24D1 He looks at the tiny work through a microscope.",
      "\u24D2 He cuts the shape with tools made from needles.",
      "\u24D3 People learn that even the smallest things matter."]
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
    ["1  sculpture", "\u24D0 a strong effect on someone or something"],
    ["2  challenge", "\u24D1 a tool that makes very small things look bigger"],
    ["3  microscope", "\u24D2 a piece of art made from stone, wood, or metal"],
    ["4  pulse", "\u24D3 to keep something safe from harm"],
    ["5  protect", "\u24D4 something difficult that you must try to do"],
    ["6  impact", "\u24D5 the beat of blood that you can feel in your body"],
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
[["문장 4", [t("Making these tiny artworks ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" a big challenge.", { size: 19 })], "동명사 주어는 하나로 봅니다 \u2014 단수 취급!"],
 ["문장 5", [t("The artist ", { size: 19 }), t("( has  /  have )", { size: 19, bold: true, color: NAVY }), t(" to use a microscope.", { size: 19 })], "주어가 3인칭 단수일 때 알맞은 형태는?"],
 ["문장 6", [t("He paints his sculptures by ", { size: 19 }), t("( using  /  use )", { size: 19, bold: true, color: NAVY }), t(" an eyelash.", { size: 19 })], "전치사 by 뒤에는 동사원형이 올 수 없어요."],
 ["문장 8", [t("We need ", { size: 19 }), t("( to make  /  making )", { size: 19, bold: true, color: NAVY }), t(" changes.", { size: 19 })], "need 뒤에는 to+동사원형!"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("impact  /  needle  /  eyelash  /  challenge  /  protect  /  microscope  /  sculptures  /  message", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Willard Wigan is an artist who makes small", { size: 19 }), ...BL(1), t("of famous paintings and characters like the Mona Lisa and Pinocchio.  ", { size: 19 }),
  num(2), t(" But guess what?  ", { size: 19 }),
  num(3), t(" These sculptures are so small that they can be placed even in the eye of a", { size: 19 }), ...BL(2), t("!  ", { size: 19 }),
  num(4), t(" Making these tiny artworks is a big", { size: 19 }), ...BL(3), t(".  ", { size: 19 }),
  num(5), t(" First, the artist has to use a", { size: 19 }), ...BL(4), t("to see them clearly, and use really small tools made from needles.  ", { size: 19 }),
  num(6), t(" Then, he paints his sculptures by using an", { size: 19 }), ...BL(5), t("and must work between heartbeats.  ", { size: 19 }),
  num(7), t(" Wigan\u2019s small artwork has an important", { size: 19 }), ...BL(6), t(": \u201CSmall things matter in a disappearing world.\u201D  ", { size: 19 }),
  num(8), t(" He reminds us that we need to make changes to", { size: 19 }), ...BL(7), t("the variety of life on Earth.  ", { size: 19 }),
  num(9), t(" His tiny work makes people think that even the smallest things can have a big", { size: 19 }), ...BL(8), t(".", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[5, "First, the artist has to use a microscope to see them clearly, and use really small tools made from needles."],
 [9, "His tiny work makes people think that even the smallest things can have a big impact."]].forEach(([n, s], i) => {
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
w7block("1", "위건의 작은 작품에는 중요한 메시지가 담겨 있다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 아포스트로피에 주의할 것  (총 7단어)",
  "message / small / has / an / artwork / Wigan\u2019s / important");
w7block("2", "그는 우리 세계가 위험에 처해 있다는 것을 우리에게 일깨워 준다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 9단어)",
  "in / He / that / world / us / is / reminds / our / trouble");

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

K.push(...tab("정답 및 해설", "UNIT 13  바늘구멍 속의 조각가", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("\u2460      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("\u2463      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("\u2460", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("Making these tiny artworks is a big challenge.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문4 ", { size: 17, bold: true, color: NAVY2 }), t("Making these tiny artworks(S)\u00b7is(\u25b3V)\u00b7a big challenge   ", { size: 17, bold: true }),
     t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("the artist(S)\u00b7has to use(\u25b3V)\u00b7to see them clearly(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("His tiny work(S)\u00b7makes(\u25b3V)\u00b7that[네모]\u00b7the smallest things(S\u2032)\u00b7can have(\u25b3V\u2032)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 자전거를 타는 것은 좋은 운동이다  (2) 나는 신선한 공기를 마시기 위해 창문을 열었다  (3) 식물을 기르는 것은 재미있어서, 나는 물을 주려고 일찍 일어난다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 \u2461   1-2 artworks · tiny · impact        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 반전 · 결과 · 순서 · 이유   2-2 [B] 제작 과정 · [E] 마무리   2-3 \u2460", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 \u24D1 \u2192 \u24D3 \u2192 \u24D2 \u2192 \u24D0  ·  Wigan\u2019s tiny artworks show that even the smallest things can have a big impact.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) needle  (2) microscope  (3) message  (4) smallest        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 \u2461  문장 4 \u2460  문장 8 \u2462  문장 9 \u2461", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("\u24D1 → \u24D2 → \u24D0 → \u24D3", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1\u24D2 · 2\u24D4 · 3\u24D1 · 4\u24D5 · 5\u24D3 · 6\u24D0        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) is  (2) has  (3) using  (4) to make", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) sculptures (2) needle (3) challenge (4) microscope (5) eyelash (6) message (7) protect (8) impact", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) Wigan\u2019s small artwork has an important message.  (2) He reminds us that our world is in trouble.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 \u2460");
B("바늘구멍에 들어갈 만큼 작은 조각(문장 1\u20133)과 그 안에 담긴 메시지(문장 7\u20139)를 함께 소개하는 글이다. 소재와 평가를 모두 담은 \u2460이 제목이다. \u2461\u00b7\u2464는 본문과 무관하고, \u2462\u00b7\u2463은 소재의 일부(모나리자·현미경)만 건드린 지엽적 오답이다.", true);
Hs("독해 02   내용 불일치   ·   정답 \u2463");
B("문장 6에서 위건은 붓이 아니라 속눈썹(an eyelash)으로 색을 칠한다고 했으므로 \u2463이 본문과 다르다. \u2460은 문장 1, \u2461은 문장 3, \u2462는 문장 5, \u2464는 문장 8에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 \u2460");
B("(A) them은 앞 문장 4의 these tiny artworks, 곧 아주 작은 조각들을 가리킨다. 또렷이 보려고 현미경을 들이대는 대상이 무엇인지 생각하면 된다 \u2014 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   Making these tiny artworks is a big challenge.");
B("문장 4를 그대로 복원하는 문제다. \u2460 '~하는 것은'은 동사원형+ing로 시작 \u2014 첫 글자는 대문자 Making.   \u2461 동명사 주어는 단수 취급이므로 is.   \u2462 a big challenge \u2014 관사 a를 빠뜨리지 않는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 \u2461     1-2 artworks · tiny · impact     1-3 아래 참조");
B("1-1   정답 \u2461. 바늘구멍에 들어가는 초소형 조각과 그 의미를 소개하는 글이다. \u2460 바늘은 도구일 뿐 공장 이야기는 없고, \u2462 모나리자는 조각의 소재로 한 번 언급될 뿐이다.");
B("1-2   \u25cb표 할 세 단어: artworks(힌트\u2460 위건이 만드는 것) · tiny(힌트\u2461 작품의 크기) · impact(힌트\u2462 글쓴이의 평가). 나머지 셋(needle · microscope · eyelash)은 본문에 나오지만 도구일 뿐 주제문에 들어가지 않는다.");
B("1-3   문장 5 \u2014 them은 조각 작품들에 \u25cb (문장 4의 tiny artworks).   문장 8 \u2014 He는 위건, us는 우리 모두에 \u25cb.   문장 9 \u2014 His는 위건의에 \u25cb.");
B("[학습 포인트]   문장 8은 한 문장 안에서 가리키는 대상이 바뀐다 \u2014 He(위건)와 us(글을 읽는 우리). 지시어를 만나면 수(단수·복수)와 사람인지 사물인지를 먼저 확인하는 습관을 들이자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 반전 / 결과 / 순서 / 이유     2-2 [B] 제작 과정 · [E] 마무리     2-3 \u2460");
B("2-1   문장 2 But \u2014 앞의 소개에서 방향을 바꾸는 '반전'.   문장 3 so ~ that \u2014 너무 작아서 생기는 '결과'.   문장 5 First \u2014 작업 순서의 첫 단계를 알리는 '순서'.   문장 6 because \u2014 심장 박동 사이에 일해야 하는 '이유'.");
B("2-2   [B] 제작 과정(문장 4\u20136: 현미경\u2192바늘 도구\u2192속눈썹 붓), [E] 마무리(문장 9: 작은 것도 큰 영향을 준다는 평가). 보기의 '광고'는 이 글에 없는 역할이다. [A] 소개 \u2192 [B] 제작 과정 \u2192 [C] 메시지 \u2192 [D] 당부 \u2192 [E] 마무리.");
B("2-3   정답 \u2460. 한 예술가와 그의 작업 방식·메시지를 사실 그대로 알려 주는 설명문이다. \u2461 가격이나 사라는 말이 없어 광고가 아니고, \u2462\u00b7\u2463\u00b7\u2464의 형식적 신호(요리 순서·Dear·날짜)도 없다.");
B("[학습 포인트]   First\u00b7Then처럼 순서를 알리는 말이 나오면 그 뒤는 과정 설명이다. 과정이 끝나는 지점에서 글쓴이의 평가가 시작된다 \u2014 그 자리가 주제문이다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 smallest · impact     3-3 \u24D1 \u2192 \u24D3 \u2192 \u24D2 \u2192 \u24D0");
B("3-1  재료 찾기 \u2014 (2) 문장 9에서 smallest에 \u25cb: '가장 작은'이라는 뜻으로 이 글의 핵심 대비다. biggest는 정반대다. (3) 문장 9에서 impact에 \u25cb: 작은 것이 남기는 '영향'이다. problem은 문장 6의 세부 사항일 뿐이다.");
B("3-2  뼈대 채우기 \u2014 (1) tiny artworks  (2) smallest  (3) impact.  넣으면 Wigan\u2019s tiny artworks show that even the smallest things can have a big impact.가 완성된다.");
B("3-3  정답 순서 \u2014 \u24D1 Wigan\u2019s tiny artworks \u2192 \u24D3 show \u2192 \u24D2 that even the smallest things \u2192 \u24D0 can have a big impact.");
B("[채점 포인트]  주인공(\u24D1)이 주어로 맨 앞, 마침표가 붙은 덩어리(\u24D0)가 맨 뒤 \u2014 두 자리만 잡으면 that절의 순서는 저절로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) needle  (2) microscope  (3) message  (4) smallest");
B("(1)은 문장 3의 needle, (2)는 문장 5의 microscope, (3)은 문장 7의 message, (4)는 문장 9의 smallest에서 가져온다. 요약문이 곧 이 글의 흐름이다: 크기(1) \u2192 제작(2) \u2192 메시지(3) \u2192 평가(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 \u2461   문장 4 \u2460   문장 8 \u2462   문장 9 \u2461  (정답 선지는 무표시)");
B("문장 3 so small that they can be placed in the eye of a needle   \u2460 ✕ [반대] 너무 커서 못 들어간다 \u2014 정반대.   \u2461 ○ 바늘귀에 들어갈 만큼 작다.   \u2462 ✕ [무관] 금·은으로 만든다는 말은 없다.");
B("문장 4 a big challenge   \u2460 ○ 아주 어려운 일이다.   \u2461 ✕ [반대] 아주 쉬운 일 \u2014 정반대.   \u2462 ✕ [무관] 아이들의 놀이라는 말은 지문에 없다.");
B("문장 8 our world is in trouble   \u2460 ✕ [반대] 완전히 안전하다 \u2014 정반대.   \u2461 ✕ [무관] 세상이 커진다는 말은 없다.   \u2462 ○ 위험에 처해 있다.");
B("문장 9 can have a big impact   \u2460 ✕ [반대] 아무것도 바꾸지 못한다 \u2014 정반대.   \u2461 ○ 많은 것을 바꿀 수 있다.   \u2462 ✕ [무관] 비싸게 팔린다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. impact처럼 평가가 담긴 말은 '큰 변화를 준다'로 풀어 쓰는 연습을 해 두자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T \u2014 문장 1.   2 T \u2014 문장 3.   3 F \u2014 문장 4: 쉬운 일(easy job)이 아니라 큰 도전(challenge)이다.   4 F \u2014 문장 5: 망원경(telescope)이 아니라 현미경(microscope)이다.   5 T \u2014 문장 6.   6 F \u2014 문장 6: 심장이 뛰는 동안(during)이 아니라 박동 사이(between)에 작업한다.   7 T \u2014 문장 7.   8 F \u2014 문장 8: 문제가 없는 게 아니라 세상이 위험에 처해 있다.  거짓 넷은 모두 한 요소만 비튼 것이다.", true);
Hs("R2   제작 순서   ·   \u24D1 \u2192 \u24D2 \u2192 \u24D0 \u2192 \u24D3");
B("\u24D1 현미경으로 작품을 들여다본다(문장 5) \u2192 \u24D2 바늘로 만든 도구로 형태를 깎는다(문장 5) \u2192 \u24D0 속눈썹으로 색을 칠한다(문장 6) \u2192 \u24D3 사람들이 작은 것의 가치를 깨닫는다(문장 9). 문장 5에는 두 단계가 한 문장에 담겨 있다 \u2014 '보는 일'이 '깎는 일'보다 먼저다.", true);
Hs("R3   영영풀이   ·   1 \u24D2 · 2 \u24D4 · 3 \u24D1 · 4 \u24D5 · 5 \u24D3 · 6 \u24D0");
B("sculpture = 돌·나무·금속을 깎아 만든 예술품 · challenge = 해내기 어려운 일 · microscope = 아주 작은 것을 크게 보여 주는 도구 · pulse = 몸에서 느껴지는 피의 박동 · protect = 안전하게 지키다 · impact = 강한 영향.", true);
Hs("R4   어법 기초   ·   (1) is  (2) has  (3) using  (4) to make");
B("(1) 동명사 주어 Making ~는 하나로 보아 단수 취급 \u2014 is. 2면 구문 카드의 그 원칙이다.   (2) 주어 The artist는 3인칭 단수 \u2014 has.   (3) 전치사 by 뒤에는 동명사 \u2014 using.   (4) need 뒤에는 to+동사원형 \u2014 to make.", true);
Hs("R5   빈칸 클로즈   ·   (1) sculptures (2) needle (3) challenge (4) microscope (5) eyelash (6) message (7) protect (8) impact");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: makes small ___ \u2190 만드는 것, the eye of a ___ \u2190 바늘귀, use a ___ \u2190 도구, have a big ___ \u2190 평가.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 먼저, 그 예술가는 작품을 또렷이 보기 위해 현미경을 써야 하고, 바늘로 만든 아주 작은 도구를 사용해야 한다.  \u2014 to see them clearly를 '~하기 위해'로 옮기는 것이 핵심이다.");
B("(2) 그의 아주 작은 작품은 사람들에게 가장 작은 것조차 큰 영향을 줄 수 있다는 것을 생각하게 만든다.  \u2014 makes people think는 '~가 …하게 만들다'로 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) Wigan\u2019s small artwork has an important message.  (2) He reminds us that our world is in trouble.");
B("(1) 문장 7의 앞부분 복원. \u3131 첫 글자 대문자 Wigan\u2019s \u2014 아포스트로피를 빠뜨리지 않는다  \u3134 주어가 단수이므로 has.");
B("(2) 문장 8의 앞부분 복원. \u3131 remind+사람+that절 \u2014 us가 reminds 바로 뒤  \u3134 in trouble이 한 덩어리로 문장 끝에 온다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("윌러드 위건은 모나리자와 피노키오 같은 유명한 그림과 캐릭터를 작은 조각으로 만드는 예술가다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런데 놀라운 점이 무엇일까?  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 조각들은 너무 작아서 심지어 바늘구멍 안에도 놓일 수 있다!  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 아주 작은 예술 작품들을 만드는 것은 큰 도전이다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("먼저, 그 예술가는 작품을 또렷이 보기 위해 현미경을 써야 하고, 바늘로 만든 아주 작은 도구를 사용해야 한다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런 다음, 그는 속눈썹을 이용해 조각에 색을 칠하고, 손가락의 맥박조차 문제를 일으킬 수 있기 때문에 심장 박동 사이에 작업해야 한다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("위건의 작은 작품에는 중요한 메시지가 담겨 있다: \u201C사라져 가는 세상에서 작은 것들이 중요하다.\u201D  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 우리 세계가 위험에 처해 있으며, 지구에 사는 생명의 다양성을 지키기 위해 우리가 변화를 만들어야 한다는 것을 일깨워 준다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그의 아주 작은 작품은 사람들에게 가장 작은 것조차 큰 영향을 줄 수 있다는 것을 생각하게 만든다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};