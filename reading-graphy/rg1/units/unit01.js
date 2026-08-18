/* UNIT 01 — 과테말라에만 있어요! (Level 1)
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
  no: "01",
  title: "과테말라에만 있어요!",
  level: "1",
  foot: "UNIT 01  과테말라에만 있어요!",
  banner: ["01", "과테말라에만 있어요!", "1"],
  timeline: ["출발|미국의 스쿨버스|아이들을 태우던\\n노란 통학 버스|city",
             "이동|중고로 팔리다|낮은 값에 팔려\\n과테말라로 간다|leaf",
             "변신|화려한 색으로|밝은 색과 무늬로\\n새롭게 칠한다|sparkle_drop",
             "오늘|나라의 명물|낡았지만 여전히\\n특별한 존재|sun"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "In Guatemala, there are special colorful buses called “chicken buses.”",
  "They got this name because sometimes they carry live chickens!",
  "These buses run all over the country.",
  "Riding a chicken bus is also very cheap.",
  "So many people use them to go to work, school, and other places.",
  "These buses were once school buses in America.",
  "People in Guatemala buy them for a low price.",
  "Then, they paint them with bright colors and designs.",
  "Inside the buses, there are fun decorations and sometimes flat-screen TVs!",
  "Many chicken buses in Guatemala are very old and need fixing.",
  "But they are still very special to the country.",
  "People can’t imagine Guatemala without chicken buses.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–5 [C]6–9 [D]10 [E]11–12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 6: "C", 10: "D", 11: "E" };
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
  2: [RM("They"), R(" got "), RM("this name"), R(" because sometimes they carry live chickens!  ")],
  5: [R("So many people use "), RM("them"), R(" to go to work, school, and other places.  ")],
  8: [R("Then, "), RM("they"), R(" paint "), RM("them"), R(" with bright colors and designs.  ")],
  11: [R("But "), RM("they"), R(" are still very special to the country.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u01.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  5: [t("So many people use ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(" to go to work, school, and other places.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Chicken Buses: Guatemala’s Colorful Rides", "② How to Raise Chickens in Guatemala",
 "③ The History of American School Buses", "④ The Cheapest Way to Travel in America",
 "⑤ How to Paint a Bus with Bright Colors"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Chicken buses sometimes carry live chickens.",
 "② People in Guatemala buy the buses for a high price.",
 "③ Inside the buses, there are fun decorations.",
 "④ Many chicken buses are very old and need fixing.",
 "⑤ Chicken buses are still very special to the country."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the chicken buses",
 "② the live chickens",
 "③ the school buses in America",
 "④ the people in Guatemala",
 "⑤ the flat-screen TVs"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("이 버스들은 전국 곳곳을 달린다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 7단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("over / these / run / country / buses / the / all", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 1", { size: 14, bold: true, color: AMB }), t("   과거분사 called의 명사 수식", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("special colorful buses ", { size: 18 }), t("called", { size: 18, bold: true, color: NAVY }), t(" “chicken buses”", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("called 이하가 앞의 명사 buses를 뒤에서 꾸밉니다. '치킨 버스라고 불리는 버스'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   동명사 주어 '~하는 것은'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Riding a chicken bus", { size: 18, bold: true, color: NAVY, underline: {} }), t(" is also very cheap", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사원형+ing가 주어 자리에 오면 '~하는 것은'입니다. 단수 취급이라 is를 써요.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 1 구문", [t("I have a small cat ", { size: 19 }), t("called", { size: 19, bold: true, color: NAVY }), t(" “Nabi.”", { size: 19, underline: {} })]],
 ["문장 4 구문", [t("Playing soccer", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is very fun.", { size: 19 })]],
 ["둘 다!", [t("Eating a fruit ", { size: 19, bold: true, color: NAVY, underline: {} }), t("called", { size: 19, bold: true, color: AMB, underline: {} }), t(" “durian”", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is not easy.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 7을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1350, 2100, 950, 1050, 3480], [new TableRow({ children: [
    exSeg([t("People", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1350),
    exSeg([t("in Guatemala", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2100),
    exSeg([t("buy", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 950, "△"),
    exSeg([t("them", { size: 18 })], "", FAINT, 1050),
    exSeg([t("for a low price", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 3480),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[2, "They got this name because sometimes they carry live chickens!"],
 [5, "So many people use them to go to work, school, and other places."],
 [10, "Many chicken buses in Guatemala are very old and need fixing."]].forEach(([n, c]) => {
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
["① 닭 요리를 파는 과테말라의 시장", "② 과테말라의 화려한 치킨 버스", "③ 미국의 노란 스쿨버스"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["chickens", "닭"], ["buses", "버스"], ["America", "미국"], ["old", "낡은"], ["TVs", "텔레비전"], ["special", "특별한"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 버스들의 지금 상태  ③ 글쓴이의 평가 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · them 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서도 서로 다른 것을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    ["2", "this name", [t("chicken buses (치킨 버스)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["5", "them", chips2("치킨 버스들", "학교와 직장", 1900), false],
    ["8", "they / them", chips8(), false],
    ["11", "they", chips2("치킨 버스들", "과테말라 사람들", 2100), false],
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
    ["2", [t("They got this name ", { size: 17 }), t("because", { size: 17, bold: true, color: NAVY, underline: {} }), t(" sometimes they carry live chickens!", { size: 17 })], ["이유", "반전"]],
    ["5", [t("So", { size: 17, bold: true, color: NAVY, underline: {} }), t(" many people use them to go to work and school.", { size: 17 })], ["결과", "이유"]],
    ["8", [t("Then", { size: 17, bold: true, color: NAVY, underline: {} }), t(", they paint them with bright colors and designs.", { size: 17 })], ["순서", "결과"]],
    ["11", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" they are still very special to the country.", { size: 17 })], ["반전", "순서"]],
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
    chipCellG("쓰임", 1400),
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
  flowCell("C", "변신", "문장 6–9", false),
  arrowCell(),
  flowCell("D", "문제점", "문장 10", false),
  arrowCell(),
  flowCell("E", null, "문장 11–12", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 어떤 대상을 소개하고 사실을 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루에 있었던 일을 적은 일기",
 "④ 친구에게 안부를 전하는 편지",
 "⑤ 옛날이야기를 들려주는 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "1", "이 글의 주인공은 무엇인가요? (두 단어)", "chicken buses", "맨 앞 주어 자리", true),
  matRow("2", "10", "버스들의 지금 상태를 나타낸 말은?", ["old", "new"], "are 뒤 자리 (상태)", false),
  matRow("3", "11", "글쓴이의 평가를 나타낸 말은?", ["special", "cheap"], "very 뒤 자리 (평가)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   are  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t(" , but they are still very  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   to Guatemala.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ but they are still very special     ⓑ Chicken buses     ⓒ to Guatemala.     ⓓ are old,", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓑ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      ⓑ이 맨 앞 — 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("colorful        cheap        school        special", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("In Guatemala, there are (1) ____________ buses called chicken buses. They are (2) ____________ , so many people ride them. These buses were once (3) ____________ buses in America. They are old now, but they are still very (4) ____________ to the country.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 3, main: "run all over the country",
    opts: ["① go to every part of the country", "② stay in one small town", "③ fly to other countries"] },
  { sn: 4, main: "very cheap",
    opts: ["① costs a lot of money", "② does not cost much money", "③ is free for students"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 10, main: "very old and need fixing",
    opts: ["① new and perfect", "② not new, and must be repaired", "③ too big for the road"] },
  { sn: 11, main: "still very special",
    opts: ["① no longer important", "② still mean a lot to people", "③ sold to other countries"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 스쿨버스의 두 번째 인생 (chicken bus)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("미국에서 스쿨버스는 10년쯤 아이들을 태우고 나면 더 이상 통학에 쓰이지 않는다. 이 버스들은 아주 낮은 값에 팔려 과테말라 같은 중남미 나라로 간다. 과테말라 사람들은 버스를 사서 밝은 색과 무늬로 새로 칠하고, 안에는 장식을 달아 세상에 하나뿐인 버스로 바꾼다. 이렇게 다시 태어난 버스가 바로 '치킨 버스'다. 낡은 물건을 버리지 않고 새로운 쓸모를 찾아 주는 것을 '업사이클링(upcycling)'이라고 부른다. 치킨 버스는 그 대표적인 예다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u01.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Chicken buses run all over Guatemala.",
    "Riding a chicken bus costs a lot of money.",
    "The buses were once school buses in America.",
    "People in Guatemala buy the buses for a high price.",
    "People paint the buses with bright colors and designs.",
    "There are no decorations inside the buses.",
    "Many chicken buses are very old and need fixing.",
    "Chicken buses are no longer special to the country.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "치킨 버스에게 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ People in Guatemala buy the buses for a low price.",
      "ⓑ The buses carry people to work and school in Guatemala.",
      "ⓒ The buses were school buses in America.",
      "ⓓ People paint the buses with bright colors."]
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
    ["1  colorful", "ⓐ to take something to another place"],
    ["2  carry", "ⓑ the money you pay for something"],
    ["3  cheap", "ⓒ full of many different colors"],
    ["4  price", "ⓓ to make a broken thing work again"],
    ["5  bright", "ⓔ not costing much money"],
    ["6  fix", "ⓕ having a strong and light color"],
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
[["문장 1", [t("In Guatemala, there ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" special colorful buses.", { size: 19 })], "there 뒤에 오는 명사가 복수인지 보세요."],
 ["문장 4", [t("", { size: 19 }), t("( Riding  /  Ride )", { size: 19, bold: true, color: NAVY }), t(" a chicken bus is also very cheap.", { size: 19 })], "주어 자리에는 '~하는 것'을 뜻하는 동명사!"],
 ["문장 5", [t("So many people use ", { size: 19 }), t("( they  /  them )", { size: 19, bold: true, color: NAVY }), t(" to go to work.", { size: 19 })], "동사 뒤 목적어 자리에 오는 형태는?"],
 ["문장 8", [t("Then, they ", { size: 19 }), t("( paint  /  paints )", { size: 19, bold: true, color: NAVY }), t(" them with bright colors.", { size: 19 })], "주어 they(복수)에 맞는 동사 형태는?"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("paint  /  cheap  /  old  /  carry  /  special  /  colorful  /  price  /  decorations", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" In Guatemala, there are special", { size: 19 }), ...BL(1), t("buses called “chicken buses.”  ", { size: 19 }),
  num(2), t(" They got this name because sometimes they", { size: 19 }), ...BL(2), t("live chickens!  ", { size: 19 }),
  num(3), t(" These buses run all over the country.  ", { size: 19 }),
  num(4), t(" Riding a chicken bus is also very", { size: 19 }), ...BL(3), t(".  ", { size: 19 }),
  num(5), t(" So many people use them to go to work, school, and other places.  ", { size: 19 }),
  num(6), t(" These buses were once school buses in America.  ", { size: 19 }),
  num(7), t(" People in Guatemala buy them for a low", { size: 19 }), ...BL(4), t(".  ", { size: 19 }),
  num(8), t(" Then, they", { size: 19 }), ...BL(5), t("them with bright colors and designs.  ", { size: 19 }),
  num(9), t(" Inside the buses, there are fun", { size: 19 }), ...BL(6), t("and sometimes flat-screen TVs!  ", { size: 19 }),
  num(10), t(" Many chicken buses in Guatemala are very", { size: 19 }), ...BL(7), t("and need fixing.  ", { size: 19 }),
  num(11), t(" But they are still very", { size: 19 }), ...BL(8), t("to the country.  ", { size: 19 }),
  num(12), t(" People can’t imagine Guatemala without chicken buses.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[1, "In Guatemala, there are special colorful buses called “chicken buses.”"],
 [4, "Riding a chicken bus is also very cheap."]].forEach(([n, s], i) => {
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
w7block("1", "그런 다음, 그들은 밝은 색과 무늬로 그것들을 칠한다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 9단어)",
  "they / bright / them / with / and / colors / paint / then / designs");
w7block("2", "이 버스들은 한때 미국의 스쿨버스였다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 8단어)",
  "school / were / America / these / buses / in / once / buses");

/* ═══════════ 12~14면 [DATA] 해설 ═══════════ */
  },

  renderExplain(ctx) {
    const { K, spF, FT } = ctx;
const H = (s) => K.push(T([W], [new TableRow({ children: [
  cel(new Paragraph({ children: [t(s, { size: 18, bold: true, color: NAVY })], spacing: { after: 0, line: 250 } }),
    { w: W, m: { top: 25, bottom: 25, left: 150, right: 0 }, b: { top: NOB, bottom: NOB, right: NOB, left: bd(12, YEL) } }),
] })]));
const B = (s, last) => K.push(p([t(s, { size: 17, color: SUB })], { after: last ? 200 : 38, line: 258, indent: { left: 0 } }));
const Hs = (s) => { K.push(sp(82)); H(s); K.push(sp(46)); };

K.push(...tab("정답 및 해설", "UNIT 01  과테말라에만 있어요!", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("②      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("These buses run all over the country.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문2 ", { size: 17, bold: true, color: NAVY2 }), t("They(S)·got(△V)·because[네모]·they(S′)·carry(△V′)   ", { size: 17, bold: true }),
     t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("people(S)·use(△V)·to go~(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("buses(S)·in Guatemala(M)·are·need(△V)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 '나비'라고 불리는 작은 고양이가 있다  (2) 축구를 하는 것은 매우 재미있다  (3) '두리안'이라고 불리는 과일을 먹는 것은 쉽지 않다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 buses · old · special        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 이유 · 결과 · 순서 · 반전   2-2 [B] 쓰임 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓑ → ⓓ → ⓐ → ⓒ  ·  Chicken buses are old, but they are still very special to Guatemala.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) colorful  (2) cheap  (3) school  (4) special        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 ①  문장 4 ②  문장 10 ②  문장 11 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓒ → ⓐ → ⓓ → ⓑ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓐ · 3ⓔ · 4ⓑ · 5ⓕ · 6ⓓ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) are  (2) Riding  (3) them  (4) paint", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) colorful (2) carry (3) cheap (4) price (5) paint (6) decorations (7) old (8) special", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) Then, they paint them with bright colors and designs.  (2) These buses were once school buses in America.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 과테말라의 화려한 치킨 버스가 어떤 존재인지 소개한다(문장 1·11). 소재(chicken buses)와 특징(colorful)을 함께 담은 ①이 정답이다. ②·④은 본문과 무관하고, ③·⑤는 유래·색칠만 건드린 지엽적 오답이다.", true);
Hs("독해 02   내용 불일치   ·   정답 ②");
B("문장 7에서 사람들은 버스를 '낮은 값(a low price)'에 산다고 했으므로, 비싸게 산다는 ②은 본문과 반대된다. ①은 문장 2, ③는 문장 9, ④은 문장 10, ⑤는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 앞 문장 3·4의 chicken buses를 가리킨다. 사람들이 일터와 학교에 갈 때 타는 것이 무엇인지 생각하면 된다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   These buses run all over the country.");
B("문장 3을 그대로 복원하는 문제다. ① 첫 글자는 대문자 These.   ② 주어가 복수라 run에 -s가 붙지 않는다.   ③ all over the country가 '전국 곳곳'이라는 한 덩어리다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 buses · old · special     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 과테말라의 치킨 버스를 소개한다. ① 닭 요리는 이름의 유래일 뿐이고, ③ 미국 스쿨버스는 이 버스의 출신이다.");
B("1-2   ○표 할 세 단어: buses(힌트① 주인공) · old(힌트② 지금 상태) · special(힌트③ 글쓴이의 평가). 나머지 셋(chickens · America · TVs)은 본문에 나오지만 주제문에는 들어가지 않는다.");
B("1-3   문장 5 — them은 치킨 버스들에 ○.   문장 8 — they는 사람들, them은 버스들에 ○ (한 문장 안에서 대상이 바뀐다).   문장 11 — they는 치킨 버스들에 ○.");
B("[학습 포인트]   문장 8이 이 지문의 백미다. 같은 문장의 they와 them이 서로 다른 것을 가리킨다 — 지시어를 만나면 늘 '누가? 무엇이?'를 확인하자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 이유 / 결과 / 순서 / 반전     2-2 [B] 쓰임 · [E] 마무리     2-3 ①");
B("2-1   문장 2 because — 이름이 붙은 '이유'.   문장 5 So — 값이 싸다는 말의 '결과'.   문장 8 Then — 사고 나서 칠하는 '순서'.   문장 11 But — 낡았지만 특별하다는 '반전'.");
B("2-2   [B] 쓰임(문장 3–5: 전국을 달리고 값이 싸서 많이 탄다), [E] 마무리(문장 11–12: 그래도 아주 특별하다). 보기의 '요리법'은 이 글에 없는 역할이다.");
B("2-3   정답 ①. 치킨 버스라는 대상을 소개하고 사실을 알려 주는 설명문이다. 광고의 신호(사라는 말·가격)도, 일기의 I·날짜도, 편지의 Dear도, 동화의 등장인물도 없다.");
B("[학습 포인트]   because·So·Then·But 네 개만 표시해도 글의 지도가 그려진다. 특히 마무리 직전의 But은 글쓴이가 진짜 하고 싶은 말의 신호다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 old · special     3-3 ⓑ → ⓓ → ⓐ → ⓒ");
B("3-1  재료 찾기 — (2) 문장 10에서 old에 ○: 버스의 지금 상태다. new는 반대말이다. (3) 문장 11에서 special에 ○: 글쓴이의 평가다. cheap은 문장 4의 사실일 뿐 평가가 아니다.");
B("3-2  뼈대 채우기 — (1) Chicken buses  (2) old  (3) special.  넣으면 Chicken buses are old, but they are still very special to Guatemala.가 완성된다.");
B("3-3  정답 순서 — ⓑ Chicken buses → ⓓ are old, → ⓐ but they are still very special → ⓒ to Guatemala.");
B("[채점 포인트]  주인공(ⓑ)이 맨 앞, 마침표가 붙은 덩어리(ⓒ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) colorful  (2) cheap  (3) school  (4) special");
B("(1)은 문장 1의 colorful, (2)는 문장 4의 cheap, (3)은 문장 6의 school, (4)는 문장 11의 special에서 가져온다. 요약문이 곧 이 글의 흐름이다: 소개 → 쓰임 → 유래 → 평가.", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 ①   문장 4 ②   문장 10 ②   문장 11 ②  (정답 선지는 무표시)");
B("문장 3 run all over the country   ① ○ 나라의 모든 곳으로 간다.   ② ✕ [반대] 작은 마을 한 곳에만 머문다.   ③ ✕ [무관] 다른 나라로 날아간다는 말은 없다.");
B("문장 4 very cheap   ① ✕ [반대] 돈이 많이 든다 — 정반대.   ② ○ 돈이 많이 들지 않는다.   ③ ✕ [무관] 학생은 무료라는 말은 지문에 없다.");
B("문장 10 very old and need fixing   ① ✕ [반대] 새것이고 완벽하다 — 정반대.   ② ○ 새것이 아니어서 고쳐야 한다.   ③ ✕ [무관] 도로에 비해 크다는 말은 없다.");
B("문장 11 still very special   ① ✕ [반대] 더 이상 중요하지 않다 — 정반대.   ② ○ 여전히 사람들에게 큰 의미가 있다.   ③ ✕ [무관] 다른 나라에 팔린다는 말은 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. 읽을 때마다 '이 표현을 다른 말로 하면?'을 스스로 물어보자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 3.   2 F — 문장 4: 비싼 게 아니라 아주 싸다(cheap).   3 T — 문장 6.   4 F — 문장 7: 높은 값이 아니라 낮은 값(low price)이다.   5 T — 문장 8.   6 F — 문장 9: 장식이 없는 게 아니라 재미있는 장식이 있다.   7 T — 문장 10.   8 F — 문장 11: 여전히 아주 특별하다.  거짓 문장은 모두 한 요소(a lot of money, high, no, no longer)만 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓒ → ⓐ → ⓓ → ⓑ");
B("ⓒ 미국의 스쿨버스였다(문장 6) → ⓐ 낮은 값에 산다(문장 7) → ⓓ 밝은 색으로 칠한다(문장 8) → ⓑ 사람들을 태우고 달린다(문장 3–5). 본문은 쓰임(문장 3–5)을 유래(문장 6–8)보다 먼저 말한다 — 서술 순서와 사건 순서가 다른 지점이다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓐ · 3 ⓔ · 4 ⓑ · 5 ⓕ · 6 ⓓ");
B("colorful = 여러 색으로 가득한 · carry = 다른 곳으로 옮기다 · cheap = 돈이 많이 들지 않는 · price = 무언가에 내는 돈 · bright = 색이 밝고 진한 · fix = 고장 난 것을 다시 쓰게 만들다.", true);
Hs("R4   어법 기초   ·   (1) are  (2) Riding  (3) them  (4) paint");
B("(1) there 뒤의 명사가 복수(buses)라 are.   (2) 주어 자리에는 동명사 Riding — 2면 구문에서 배운 그 문장이다.   (3) 동사 use 뒤 목적어 자리에는 목적격 them.   (4) 주어 they는 복수라 paint(-s 없음).", true);
Hs("R5   빈칸 클로즈   ·   (1) colorful (2) carry (3) cheap (4) price (5) paint (6) decorations (7) old (8) special");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: special ___ buses ← 색깔, for a low ___ ← 값, still very ___ ← 평가. 채우고 나면 지문을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 과테말라에는 '치킨 버스'라고 불리는 특별하고 화려한 버스들이 있다.  — called 이하가 앞의 buses를 뒤에서 꾸민다.");
B("(2) 치킨 버스를 타는 것은 또한 아주 싸다.  — Riding a chicken bus가 주어, '~하는 것은'으로 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) Then, they paint them with bright colors and designs.  (2) These buses were once school buses in America.");
B("(1) 문장 8의 복원. ㄱ 첫 글자 대문자 Then  ㄴ Then 뒤의 콤마를 빠뜨리지 않는다  ㄷ 주어 they에 맞춰 paint(-s 없음).");
B("(2) 문장 6의 복원. ㄱ 첫 글자 대문자 These  ㄴ were once가 '한때 ~였다'  ㄷ buses가 두 번 쓰인다 — These buses와 school buses.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과테말라에는 '치킨 버스'라고 불리는 특별하고 화려한 버스들이 있다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것들은 가끔 살아 있는 닭을 실어 나르기 때문에 이 이름을 얻었다!  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 버스들은 전국 곳곳을 달린다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("치킨 버스를 타는 것은 또한 아주 싸다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 많은 사람들이 직장, 학교, 그 밖의 장소에 가려고 그것들을 이용한다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 버스들은 한때 미국의 스쿨버스였다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과테말라 사람들은 그것들을 낮은 값에 산다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런 다음, 그들은 밝은 색과 무늬로 그것들을 칠한다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("버스 안에는 재미있는 장식들과 때로는 평면 TV까지 있다!  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과테말라의 많은 치킨 버스는 아주 낡아서 수리가 필요하다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 그것들은 여전히 그 나라에 아주 특별하다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("사람들은 치킨 버스가 없는 과테말라를 상상할 수 없다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
