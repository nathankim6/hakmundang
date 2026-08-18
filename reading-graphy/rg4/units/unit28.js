/* UNIT 28 — 지구와 하나가 되어가는 플라스틱 (Level 4)
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
  no: "28",
  title: "지구와 하나가 되어가는 플라스틱",
  level: "4",
  foot: "UNIT 28  지구와 하나가 되어가는 플라스틱",
  banner: ["28", "지구와 하나가 되어가는 플라스틱", "4"],
  timeline: ["1단계|바다로|버려진 그물과 병이\\n바다로 흘러든다|drop_x",
             "2단계|해류|해류가 쓰레기를\\n외딴 섬 해변에 쌓는다",
             "3단계|햇볕|뜨거운 태양에\\n플라스틱이 녹는다|sun",
             "4단계|암석화|모래·돌과 뒤엉켜\\n새로운 암석이 된다|city"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 10문장 ═══════════ */
const SENT = [
  "There are few places on Earth as remote as Trindade island, needing a three- or four-day boat trip off the coast of Brazil.",
  "The island is home to rare animals and a place with almost no humans.",
  "However, in 2019, geologist Fernanda Avelar Santos found something unusual there: strange blue-green rocks!",
  "She was curious about them and took some back to her lab.",
  "After analysis, she realized these weren’t ordinary rocks, but a mix of natural rock material and plastic trash.",
  "Santos found that ocean currents had carried and piled plastic trash like fishing nets and bottles to the island.",
  "Under the hot sun, this plastic melted and stuck to the beach, forming these unique rocks.",
  "Santos’s discovery shows human impact on even remote areas.",
  "She said, “These plastic rocks are evidence of how human actions are changing natural processes.",
  "They will leave a lasting mark in Earth’s geological record.”",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–4 [C]5–6 [D]7 [E]8–10 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 5: "C", 7: "D", 8: "E" };
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
  3: [R("However, in 2019, geologist Fernanda Avelar Santos found something unusual "), RM("there"), R(": strange blue-green rocks!  ")],
  4: [R("She was curious about "), RM("them"), R(" and took some back to her lab.  ")],
  7: [R("Under the hot sun, "), RM("this plastic"), R(" melted and stuck to the beach, forming these unique rocks.  ")],
  10: [RM("They"), R(" will leave a lasting mark in Earth’s geological record.”  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u28.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  4: [t("She was curious about ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(" and took some back to her lab.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Plastic Rocks: A New Mark of Human Impact", "② Rare Animals of Trindade Island",
 "③ The Best Boat Trips in Brazil", "④ Why Some Rocks Look Blue-Green",
 "⑤ How to Recycle Old Fishing Nets"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Trindade island needs a three- or four-day boat trip off the coast of Brazil.",
 "② The island is home to rare animals.",
 "③ Santos found strange blue-green rocks on the island in 2019.",
 "④ The blue-green rocks were ordinary rocks made only of natural material.",
 "⑤ Ocean currents carried plastic trash to the island."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the strange blue-green rocks",
 "② the rare animals on the island",
 "③ the fishing nets and bottles",
 "④ the people living on the island",
 "⑤ the ocean currents around Brazil"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("산토스의 발견은 아주 외딴 지역에까지 미친 인간의 영향을 보여 준다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 9단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("impact / remote / Santos’s / on / areas. / shows / discovery / even / human", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 1", { size: 14, bold: true, color: AMB }), t("   There are ~ (~이 있다)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("There are", { size: 18, bold: true, color: NAVY }), t(" few places", { size: 18, underline: {} }), t(" on Earth", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("There 뒤의 명사가 진짜 주어입니다. 복수면 are, 단수면 is!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 5", { size: 14, bold: true, color: AMB }), t("   not A but B (A가 아니라 B)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("weren’t", { size: 18, bold: true, color: NAVY }), t(" ordinary rocks, ", { size: 18, underline: {} }), t("but", { size: 18, bold: true, color: NAVY }), t(" a mix of ~", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("but 앞을 부정하고 뒤를 강조합니다. 진짜 하고 싶은 말은 언제나 but 뒤!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 1 구문", [t("There are", { size: 19, bold: true, color: NAVY }), t(" many books", { size: 19, underline: {} }), t(" on the desk.", { size: 19 })]],
 ["문장 5 구문", [t("This is ", { size: 19 }), t("not", { size: 19, bold: true, color: NAVY }), t(" a cat, ", { size: 19, underline: {} }), t("but", { size: 19, bold: true, color: NAVY }), t(" a small dog", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("There is", { size: 19, bold: true, color: NAVY }), t(" not", { size: 19, bold: true, color: NAVY }), t(" a park, ", { size: 19, underline: {} }), t("but", { size: 19, bold: true, color: NAVY }), t(" a big library", { size: 19, underline: {} }), t(" near my school.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 2를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1500, 620, 2450, 900, 1200, 2260], [new TableRow({ children: [
    exSeg([t("The island", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1500),
    exSeg([t("is", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 620, "△"),
    exSeg([t("home to rare animals", { size: 18 })], "", FAINT, 2450),
    exSeg([t("and", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 900),
    exSeg([t("a place", { size: 18 })], "", FAINT, 1200),
    exSeg([t("with almost no humans", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2260),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[4, "She was curious about them and took some back to her lab."],
 [6, "Santos found that ocean currents had carried and piled plastic trash to the island."],
 [7, "Under the hot sun, this plastic melted and stuck to the beach, forming these unique rocks."]].forEach(([n, c]) => {
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
["① 브라질로 가는 배 여행 코스", "② 외딴 섬에서 발견된 플라스틱 암석", "③ 바위의 색이 변하는 이유"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["Brazil", "브라질"], ["rocks", "바위"], ["bottles", "병"], ["evidence", "증거"], ["island", "섬"], ["human", "인간의"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 산토스가 발견한 것  ② 그것이 지닌 의미  ③ 자연을 바꾸는 주체 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      there · them · this 같은 지시어는 앞에 나온 말을 대신합니다. 장소도, 사물도, 앞 문장도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 1950, 7350];
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
    ["3", "there", [t("on Trindade island (그 섬에서)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "them", chips2("이상한 바위들", "희귀 동물들", 1900), false],
    ["7", "this plastic", chips2("플라스틱 쓰레기", "화산 바위", 1900), false],
    ["10", "They", chips2("plastic rocks", "ocean currents", 2100), false],
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
    ["3", [t("However", { size: 17, bold: true, color: NAVY, underline: {} }), t(", in 2019, a geologist found something unusual there.", { size: 17 })], ["반전", "순서"]],
    ["5", [t("After", { size: 17, bold: true, color: NAVY, underline: {} }), t(" analysis, she realized these weren’t ordinary rocks.", { size: 17 })], ["순서", "예시"]],
    ["6", [t("Ocean currents had carried plastic trash ", { size: 17 }), t("like", { size: 17, bold: true, color: NAVY, underline: {} }), t(" fishing nets and bottles.", { size: 17 })], ["예시", "나열"]],
    ["7", [t("This plastic melted ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" stuck to the beach.", { size: 17 })], ["나열", "반전"]],
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
    chipCellG("발견", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("의미", 1400),
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
  flowCell("A", "섬 소개", "문장 1–2", false),
  arrowCell(),
  flowCell("B", null, "문장 3–4", true),
  arrowCell(),
  flowCell("C", "정체", "문장 5–6", false),
  arrowCell(),
  flowCell("D", "형성", "문장 7", false),
  arrowCell(),
  flowCell("E", null, "문장 8–10", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 과학자의 발견을 사실대로 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일을 적은 일기",
 "④ 리듬을 살려 쓴 시",
 "⑤ 행사에 초대하는 초대장"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "9", "산토스가 발견한 것은 무엇인가요?", "rocks", "These plastic 뒤 자리", true),
  matRow("2", "9", "이 바위들이 무엇이라고 했나요?", ["evidence", "treasure"], "are 뒤 자리 (의미)", false),
  matRow("3", "9", "자연을 바꾸는 것은 누구의 행동인가요?", ["human", "animal"], "actions 앞 자리 (주체)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("These plastic  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   are  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  of how  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  actions are changing natural processes.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ are evidence of     ⓑ how human actions     ⓒ These plastic rocks     ⓓ are changing natural processes.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("remote        plastic        melted        evidence", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Trindade island is a very (1) ____________ place with almost no humans. In 2019, a geologist found strange blue-green rocks there. They were a mix of natural rock and (2) ____________ trash that (3) ____________ under the hot sun. Santos says these rocks are (4) ____________ of human impact on nature.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 2, main: "a place with almost no humans",
    opts: ["① a place full of people", "② a place where few people live", "③ a place with many factories"] },
  { sn: 4, main: "was curious about them",
    opts: ["① wanted to know more about them", "② had no interest in them", "③ was afraid of them"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 5, main: "weren’t ordinary rocks",
    opts: ["① were very expensive rocks", "② were common rocks like others", "③ were not normal rocks"] },
  { sn: 8, main: "shows human impact on remote areas",
    opts: ["① proves people affect faraway places", "② shows people never change nature", "③ shows animals move far away"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 플라스틱이 만든 새로운 돌", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("플라스틱이 모래·자갈과 뒤엉켜 굳은 이 새로운 돌을 과학자들은 '플라스티글로머릿(plastiglomerate)'이라고 부른다. 2014년 하와이 해변에서 처음 보고된 뒤 세계 곳곳에서 발견되고 있다. 바다에 버려진 그물과 병은 해류를 타고 수천 킬로미터를 떠돌다가 사람이 거의 없는 섬 해변까지 닿는다. 그리고 뜨거운 햇볕에 녹아 모래와 돌에 들러붙어 굳는다. 지질학자들은 이런 돌이 훗날 지층에 남아 '인간이 지구를 바꾼 시대'의 증거가 될 것이라고 말한다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u28.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Trindade island needs a three- or four-day boat trip off the coast of Brazil.",
    "Many people live on Trindade island.",
    "Santos found strange blue-green rocks on the island in 2019.",
    "Santos left all the strange rocks on the island.",
    "The rocks were a mix of natural rock material and plastic trash.",
    "Ocean currents carried plastic trash away from the island.",
    "Under the hot sun, the plastic melted and stuck to the beach.",
    "Santos said the plastic rocks would soon disappear.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "트린다지 섬에서 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Santos took some rocks back to her lab.",
      "ⓑ Ocean currents carried plastic trash to the island.",
      "ⓒ The plastic melted under the hot sun and stuck to the beach.",
      "ⓓ Santos found strange blue-green rocks on the beach."]
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
    ["1  remote", "ⓐ to change from solid to liquid by heat"],
    ["2  geologist", "ⓑ far away from other places"],
    ["3  curious", "ⓒ a person who studies rocks and the earth"],
    ["4  ordinary", "ⓓ facts that show something is true"],
    ["5  melt", "ⓔ wanting to know more about something"],
    ["6  evidence", "ⓕ normal, not special"],
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
[["문장 1", [t("", { size: 19 }), t("( There are  /  There is )", { size: 19, bold: true, color: NAVY }), t(" few places on Earth as remote as this island.", { size: 19 })], "There 뒤의 명사가 진짜 주어예요."],
 ["문장 2", [t("The island ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" home to rare animals.", { size: 19 })], "주어 The island는 단수예요."],
 ["문장 4", [t("She was curious about ", { size: 19 }), t("( them  /  they )", { size: 19, bold: true, color: NAVY }), t(" and took some back.", { size: 19 })], "전치사 뒤에는 목적격이 옵니다."],
 ["문장 7", [t("Under the hot sun, this plastic ", { size: 19 }), t("( melted  /  melt )", { size: 19, bold: true, color: NAVY }), t(" and stuck to the beach.", { size: 19 })], "뒤의 stuck과 시제를 맞추세요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("evidence  /  melted  /  remote  /  impact  /  curious  /  geologist  /  ordinary  /  currents", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" There are few places on Earth as", { size: 19 }), ...BL(1), t("as Trindade island, needing a three- or four-day boat trip off the coast of Brazil.  ", { size: 19 }),
  num(2), t(" The island is home to rare animals and a place with almost no humans.  ", { size: 19 }),
  num(3), t(" However, in 2019,", { size: 19 }), ...BL(2), t("Fernanda Avelar Santos found something unusual there: strange blue-green rocks!  ", { size: 19 }),
  num(4), t(" She was", { size: 19 }), ...BL(3), t("about them and took some back to her lab.  ", { size: 19 }),
  num(5), t(" After analysis, she realized these weren’t", { size: 19 }), ...BL(4), t("rocks, but a mix of natural rock material and plastic trash.  ", { size: 19 }),
  num(6), t(" Santos found that ocean", { size: 19 }), ...BL(5), t("had carried and piled plastic trash to the island.  ", { size: 19 }),
  num(7), t(" Under the hot sun, this plastic", { size: 19 }), ...BL(6), t("and stuck to the beach, forming these unique rocks.  ", { size: 19 }),
  num(8), t(" Santos’s discovery shows human", { size: 19 }), ...BL(7), t("on even remote areas.  ", { size: 19 }),
  num(9), t(" She said, “These plastic rocks are", { size: 19 }), ...BL(8), t("of how human actions are changing natural processes.  ", { size: 19 }),
  num(10), t(" They will leave a lasting mark in Earth’s geological record.”", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[1, "There are few places on Earth as remote as Trindade island."],
 [5, "These weren’t ordinary rocks, but a mix of natural rock material and plastic trash."]].forEach(([n, s], i) => {
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
w7block("1", "그 섬은 희귀 동물들의 보금자리이자 사람이 거의 없는 곳이다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 14단어)",
  "rare / island / a / to / and / The / animals / place / humans. / is / home / with / almost / no");
w7block("2", "그녀는 그것들에 대해 호기심이 생겨 몇 개를 자기 실험실로 가져왔다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 12단어)",
  "some / She / about / lab. / curious / and / them / was / her / took / to / back");

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

K.push(...tab("정답 및 해설", "UNIT 28  지구와 하나가 되어가는 플라스틱", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("Santos’s discovery shows human impact on even remote areas.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문4 ", { size: 17, bold: true, color: NAVY2 }), t("She(S)·was(△V)·and[네모]·took(△V)·back to her lab(M)   ", { size: 17, bold: true }),
     t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("Santos(S)·found(△V)·that[네모]·currents(S′)·had carried·piled(△V′)", { size: 17, bold: true })], { after: 22 }),
  p([t("문7 ", { size: 17, bold: true, color: NAVY2 }), t("Under the hot sun(M)·this plastic(S)·melted·stuck(△V)·to the beach(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 책상 위에 많은 책이 있다  (2) 이것은 고양이가 아니라 작은 개다  (3) 우리 학교 근처에는 공원이 아니라 큰 도서관이 있다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 rocks · evidence · human        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 반전 · 순서 · 예시 · 나열   2-2 [B] 발견 · [E] 의미   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓐ → ⓑ → ⓓ  ·  These plastic rocks are evidence of how human actions are changing natural processes.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) remote  (2) plastic  (3) melted  (4) evidence        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 2 ②  문장 4 ①  문장 5 ③  문장 8 ①", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓒ → ⓓ → ⓐ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓑ · 2ⓒ · 3ⓔ · 4ⓕ · 5ⓐ · 6ⓓ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) There are  (2) is  (3) them  (4) melted", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) remote (2) geologist (3) curious (4) ordinary (5) currents (6) melted (7) impact (8) evidence", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) The island is home to rare animals and a place with almost no humans.  (2) She was curious about them and took some back to her lab.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("외딴 섬에서 발견된 파란 초록빛 돌이 사실은 플라스틱과 자연 암석이 섞인 것이었고(문장 3–7), 그것이 인간의 영향을 보여 준다(문장 8–10)는 글이다. 소재와 의미를 함께 담은 ①이 적절하다. ②·④는 섬·색만 건드린 지엽적 오답, ③·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 5에서 이 돌들은 '평범한 돌이 아니라(weren’t ordinary rocks)' 자연 암석과 플라스틱 쓰레기가 섞인 것이라고 했으므로 ④는 본문과 반대된다. ①은 문장 1, ②는 문장 2, ③은 문장 3, ⑤는 문장 6에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 바로 앞 문장 3의 strange blue-green rocks를 가리킨다. 산토스가 궁금해하며 실험실로 가져간 것이 무엇인지 생각하면 된다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   Santos’s discovery shows human impact on even remote areas.");
B("문장 8을 그대로 복원하는 문제다. ㄱ 첫 글자는 대문자 Santos’s.   ㄴ 주어가 단수이므로 동사는 shows.   ㄷ even은 remote 앞에 놓여 '~에까지'를 강조한다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 rocks · evidence · human     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 외딴 섬에서 발견된 플라스틱 암석과 그 의미를 다룬다. ① 배 여행은 섬이 얼마나 먼지 보여 주는 배경일 뿐이고, ③ 색이 변하는 원리를 설명하지는 않는다.");
B("1-2   ○표 할 세 단어: rocks(힌트① 산토스가 발견한 것) · evidence(힌트② 그것이 지닌 의미) · human(힌트③ 자연을 바꾸는 주체). 나머지 셋(Brazil · bottles · island)은 본문에 나오지만 주제문에는 들어가지 않는다.");
B("1-3   문장 4 — them은 이상한 바위들에 ○.   문장 7 — this plastic은 플라스틱 쓰레기에 ○ (문장 6의 그물·병).   문장 10 — They는 plastic rocks에 ○ (문장 9의 그 돌들).");
B("[학습 포인트]   지시어는 장소도 대신한다(문장 3 there = 트린다지 섬). this+명사는 '앞에서 말한 바로 그것'이라는 신호이니, 만날 때마다 앞으로 화살표를 그어 두자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 반전 / 순서 / 예시 / 나열     2-2 [B] 발견 · [E] 의미     2-3 ①");
B("2-1   문장 3 However — 사람 없는 섬이라더니 이상한 것이 나왔다는 '반전'.   문장 5 After — 분석 '뒤에' 알게 되었다는 순서.   문장 6 like — 그물·병을 드는 '예시'.   문장 7 and — 녹고 들러붙었다는 두 동작의 '나열'.");
B("2-2   [B] 발견(문장 3–4: 지질학자가 이상한 돌을 찾아 실험실로 가져간다), [E] 의미(문장 8–10: 인간의 영향이 지층에 남는다). 보기의 '가격'은 이 글에 없는 역할이다. [A] 섬 소개 → [B] 발견 → [C] 정체 → [D] 형성 → [E] 의미.");
B("2-3   정답 ①. 한 과학자의 발견과 그 원인·의미를 사실대로 알려 주는 설명문이다. ② 사라는 말·가격이 없고, ③ I·날짜가 없으며, ④ 시의 형식도, ⑤ 초대장의 형식도 아니다.");
B("[학습 포인트]   However는 글의 방향이 꺾이는 신호다. '사람이 거의 없는 섬'에서 '인간의 흔적'이 나오는 이 반전이 곧 이 글의 핵심이다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 evidence · human     3-3 ⓒ → ⓐ → ⓑ → ⓓ");
B("3-1  재료 찾기 — (2) 문장 9에서 evidence에 ○: 이 돌들은 보물이 아니라 '증거'다. (3) 문장 9에서 human에 ○: 자연의 과정을 바꾸고 있는 것은 인간의 행동이다. 주제문의 재료는 언제나 본문 안에 있다.");
B("3-2  뼈대 채우기 — (1) rocks  (2) evidence  (3) human.  넣으면 These plastic rocks are evidence of how human actions are changing natural processes.가 완성된다.");
B("3-3  정답 순서 — ⓒ These plastic rocks → ⓐ are evidence of → ⓑ how human actions → ⓓ are changing natural processes.");
B("[채점 포인트]  주인공(ⓒ)이 맨 앞, 마침표가 붙은 덩어리(ⓓ)가 맨 뒤 — 이 두 자리만 잡으면 가운데는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) remote  (2) plastic  (3) melted  (4) evidence");
B("(1)은 문장 1의 remote, (2)는 문장 5의 plastic, (3)은 문장 7의 melted, (4)는 문장 9의 evidence에서 가져온다. 요약문이 곧 이 글의 흐름이다: 외딴 섬(1) → 플라스틱(2) → 녹아 굳음(3) → 증거(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 2 ②   문장 4 ①   문장 5 ③   문장 8 ①  (정답 선지는 무표시)");
B("문장 2 a place with almost no humans   ① ✕ [반대] 사람으로 가득하다 — 정반대.   ② ○ 사는 사람이 거의 없다.   ③ ✕ [무관] 공장이 많다는 말은 지문에 없다.");
B("문장 4 was curious about them   ① ○ 더 알고 싶어 했다.   ② ✕ [반대] 관심이 없었다 — 정반대.   ③ ✕ [무관] 무서워했다는 말은 지문에 없다.");
B("문장 5 weren’t ordinary rocks   ① ✕ [무관] 아주 비싼 돌이라는 말은 지문에 없다.   ② ✕ [반대] 흔한 돌이었다 — 정반대.   ③ ○ 평범한 돌이 아니었다.");
B("문장 8 shows human impact on remote areas   ① ○ 사람이 먼 곳에도 영향을 준다는 것을 보여 준다.   ② ✕ [반대] 자연을 전혀 바꾸지 않는다 — 정반대.   ③ ✕ [무관] 동물의 이동은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. '이 표현을 다른 말로 하면?'을 스스로 물어보자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 2: 많은 사람이 아니라 사람이 거의 없다.   3 T — 문장 3.   4 F — 문장 4: 남겨 둔 게 아니라 몇 개를 실험실로 가져갔다.   5 T — 문장 5.   6 F — 문장 6: 섬에서 멀리가 아니라 섬으로(to) 실어 왔다.   7 T — 문장 7.   8 F — 문장 10: 곧 사라지는 게 아니라 오래 남는 흔적이 된다.  거짓은 모두 딱 한 요소(Many, left, away, disappear)를 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓒ → ⓓ → ⓐ");
B("ⓑ 해류가 플라스틱 쓰레기를 섬으로 실어 온다(문장 6) → ⓒ 뜨거운 햇볕에 녹아 해변에 들러붙는다(문장 7) → ⓓ 산토스가 파란 초록빛 돌을 발견한다(문장 3) → ⓐ 몇 개를 실험실로 가져간다(문장 4). 글은 발견(ⓓ)을 먼저 말하고 원인(ⓑ·ⓒ)을 뒤에 설명한다 — 서술 순서와 사건 순서가 다른 지점이 바로 여기다.", true);
Hs("R3   영영풀이   ·   1 ⓑ · 2 ⓒ · 3 ⓔ · 4 ⓕ · 5 ⓐ · 6 ⓓ");
B("remote = 다른 곳에서 멀리 떨어진 · geologist = 암석과 지구를 연구하는 사람 · curious = 더 알고 싶어 하는 · ordinary = 특별하지 않은, 평범한 · melt = 열에 녹다 · evidence = 무언가가 사실임을 보여 주는 근거.", true);
Hs("R4   어법 기초   ·   (1) There are  (2) is  (3) them  (4) melted");
B("(1) There 뒤의 places가 복수이므로 There are.   (2) 주어 The island는 단수 — is.   (3) 전치사 about 뒤에는 목적격 them.   (4) 뒤의 stuck과 시제를 맞춰 과거형 melted. 모두 2면 구문 카드·분석 Tip에서 다룬 원칙이다.", true);
Hs("R5   빈칸 클로즈   ·   (1) remote (2) geologist (3) curious (4) ordinary (5) currents (6) melted (7) impact (8) evidence");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: as ___ as ← 원급 비교, weren’t ___ rocks ← not A but B의 A 자리, ocean ___ ← 바다의 흐름, are ___ of ← 주제문의 핵심어. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 지구에는 트린다지 섬만큼 외딴 곳이 거의 없다.  — There are ~는 '~이 있다', few는 '거의 없는'으로 옮긴다.");
B("(2) 이것들은 평범한 돌이 아니라, 자연 암석 물질과 플라스틱 쓰레기가 섞인 것이었다.  — not A but B는 'A가 아니라 B'다.", true);
Hs("R7   조건 영작   ·   (1) The island is home to rare animals and a place with almost no humans.  (2) She was curious about them and took some back to her lab.");
B("(1) 문장 2의 복원. ㄱ 첫 글자 대문자 The  ㄴ be home to ~는 '~의 보금자리이다'  ㄷ and가 두 개의 보어를 잇는다.");
B("(2) 문장 4의 복원. ㄱ 첫 글자 대문자 She  ㄴ 전치사 about 뒤에는 목적격 them  ㄷ and 뒤의 took은 was와 시제를 맞춘 과거형이다. R4-(3)·(4)와 그대로 이어진다 — 워크북은 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("지구에는 트린다지 섬만큼 외딴 곳이 거의 없는데, 브라질 해안에서 배로 사흘이나 나흘이 걸린다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 섬은 희귀 동물들의 보금자리이자 사람이 거의 없는 곳이다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런데 2019년, 지질학자 페르난다 아벨라르 산토스가 그곳에서 특이한 것을 발견했다: 이상한 파란 초록빛 돌이었다!  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그녀는 그것들에 대해 호기심이 생겨 몇 개를 자기 실험실로 가져왔다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("분석 후에, 그녀는 이것들이 평범한 돌이 아니라 자연 암석 물질과 플라스틱 쓰레기가 섞인 것임을 알게 되었다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("산토스는 해류가 어망과 병 같은 플라스틱 쓰레기를 섬으로 실어 와 쌓아 두었다는 것을 알아냈다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("뜨거운 태양 아래에서, 이 플라스틱이 녹아 해변에 들러붙어 이 독특한 돌들을 만들었다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("산토스의 발견은 아주 외딴 지역에까지 미친 인간의 영향을 보여 준다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그녀는 말했다. “이 플라스틱 돌들은 인간의 행동이 자연의 과정을 어떻게 바꾸고 있는지를 보여 주는 증거입니다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것들은 지구의 지질 기록에 오래 남는 흔적을 남길 것입니다.”", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
