/* UNIT 28 — 갈등을 푸는 다섯 동물 (Level 3)
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
  title: "갈등을 푸는 다섯 동물",
  level: "3",
  foot: "UNIT 28  갈등을 푸는 다섯 동물",
  banner: ["28", "갈등을 푸는 다섯 동물", "3"],
  timeline: ["거북|회피형|문제에서 도망쳐\\n목표도 관계도 놓는다|drop_x",
             "상어|경쟁형|어떤 대가를 치러도\\n이기려 한다|sparkle_drop",
             "테디베어·여우|양보·절충형|관계를 지키려\\n목표를 내려놓는다|otter",
             "올빼미|협력형|시간이 걸려도\\n모두의 답을 찾는다|sun"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 (자동 분리의 "David W." 오분할을 바로잡음) ═══════════ */
const SENT = [
  "Social psychologist David W. Johnson studied how people usually handle problems.",
  "He found that we tend to think about what we want and what other people want too.",
  "He categorized five styles that people use to deal with conflicts with others.",
  "The Turtle: Turtles run away from problems.",
  "They give up their own goals and relationships.",
  "The Shark: Sharks want to win at any cost and don’t care about others’ needs.",
  "The Teddy Bear: Teddy bears give up their goals to keep their relationships.",
  "The Fox: Foxes can sacrifice some of their goals or persuade others to give up some of theirs.",
  "The Owl: Owls work together to reach solutions.",
  "They try to find a solution everyone is happy with, even if it takes time.",
  "Everyone has their unique ways of solving conflicts, and these styles can influence their relationships.",
  "How people handle conflicts can make the relationship last longer and be more satisfying.",
  "That’s why understanding each person’s style is important.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4–6 [C]7–8 [D]9–10 [E]11–13 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 7: "C", 9: "D", 11: "E" };
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
  5: [RM("They"), R(" give up their own goals and relationships.  ")],
  8: [R("The Fox: Foxes can sacrifice some of their goals or persuade others to give up some of "), RM("theirs"), R(".  ")],
  10: [RM("They"), R(" try to find a solution everyone is happy with, even if it takes time.  ")],
  11: [R("Everyone has their unique ways of solving conflicts, and "), RM("these styles"), R(" can influence their relationships.  ")],
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
  8: [t("The Fox: Foxes can sacrifice some of their goals or persuade others to give up some of ", { size: 19 }),
      t("(A) ", { size: 19, bold: true }), t("theirs", { size: 19, bold: true, underline: {} }), t(".  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Five Animal Styles of Handling Conflicts", "② Why Turtles Live Longer Than Sharks",
 "③ David W. Johnson: A Famous Teacher", "④ The Best Way to Win an Argument",
 "⑤ How Animals Solve Problems in Nature"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Johnson categorized five styles of dealing with conflicts.",
 "② Turtles give up their own goals and relationships.",
 "③ Sharks care a lot about other people’s needs.",
 "④ Teddy bears give up their goals to keep their relationships.",
 "⑤ Owls try to find a solution everyone is happy with."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) theirs가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① other people’s goals",
 "② the foxes’ own goals",
 "③ the turtles’ relationships",
 "④ the sharks’ needs",
 "⑤ the owls’ solutions"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그들은 자신의 목표와 관계를 포기한다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("own / give / They / and / their / relationships. / up / goals", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 7", { size: 14, bold: true, color: AMB }), t("   to부정사 '~하기 위해' (목적)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("give up their goals ", { size: 18 }), t("to keep", { size: 18, bold: true, color: NAVY, underline: {} }), t(" their relationships", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 '~하기 위해'라는 목적을 나타냅니다. '관계를 지키기 위해'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 13", { size: 14, bold: true, color: AMB }), t("   동명사(~ing) 주어 — 단수 취급", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Understanding each person’s style", { size: 18, bold: true, color: NAVY, underline: {} }), t(" is important", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("~ing가 주어면 '~하는 것은'으로 풀고, 동사는 단수(is)를 씁니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 7 구문", [t("I got up early ", { size: 19 }), t("to catch the first train", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
 ["문장 13 구문", [t("Reading comic books", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is fun.", { size: 19 })]],
 ["둘 다!", [t("Saving money", { size: 19, bold: true, color: NAVY, underline: {} }), t(" ", { size: 19 }), t("to buy a bike", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is not easy.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 10을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([800, 700, 4000, 1000, 560, 800, 1070], [new TableRow({ children: [
    exSeg([t("They", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 800),
    exSeg([t("try", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 700, "△"),
    exSeg([t("to find a solution everyone is happy with,", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 4000),
    exSeg([t("even if", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 1000),
    exSeg([t("it", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 560),
    exSeg([t("takes", { size: 18, bold: true, color: NAVY })], "V′ 본동사", NAVY, 800, "△"),
    exSeg([t("time", { size: 18 })], "", FAINT, 1070),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[2, "He found that we tend to think about what we want and what other people want too."],
 [11, "Everyone has their unique ways of solving conflicts, and these styles can influence their relationships."],
 [12, "How people handle conflicts can make the relationship last longer and be more satisfying."]].forEach(([n, c]) => {
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
["① 동물들이 문제를 푸는 방법", "② 갈등을 대하는 다섯 가지 방식", "③ 유명 심리학자의 생애"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["turtle", "거북"], ["conflicts", "갈등"], ["styles", "방식"], ["relationships", "관계"], ["owl", "올빼미"], ["solution", "해결책"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 사람들이 겪는 것  ② 다섯으로 나뉜 것  ③ 그것이 영향을 주는 것 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      they · theirs · these 같은 지시어는 앞에 나온 말을 대신합니다. 같은 They라도 다른 것을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const chips8 = () => T([820, 1200, 170, 1200, 300, 930, 1200, 170, 1200], [new TableRow({ children: [
      labC("they =", 820), chipC("사람들", 1200), gapC(170), chipC("버스들", 1200), gapC(300),
      labC("them =", 930), chipC("사람들", 1200), gapC(170), chipC("버스들", 1200),
    ] })]);
    return [
    ["5", "They", [t("turtles (거북들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["8", "theirs", chips2("남들의 목표", "여우의 목표", 1900), false],
    ["10", "They", chips2("올빼미들", "거북들", 1900), false],
    ["11", "these styles", chips2("다섯 가지 방식", "다섯 동물 이름", 2100), false],
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
    ["8", [t("Foxes can sacrifice some of their goals ", { size: 17 }), t("or", { size: 17, bold: true, color: NAVY, underline: {} }), t(" persuade others to give up some.", { size: 17 })], ["선택", "이유"]],
    ["10", [t("They try to find a solution everyone is happy with, ", { size: 17 }), t("even if", { size: 17, bold: true, color: NAVY, underline: {} }), t(" it takes time.", { size: 17 })], ["양보", "순서"]],
    ["11", [t("Everyone has their unique ways of solving conflicts, ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" these styles can influence them.", { size: 17 })], ["덧붙임", "반전"]],
    ["13", [t("That’s why", { size: 17, bold: true, color: NAVY, underline: {} }), t(" understanding each person’s style is important.", { size: 17 })], ["결과", "양보"]],
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
    chipCellG("회피와 공격", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("마무리", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("실험 결과", 1400),
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
  flowCell("C", "양보와 절충", "문장 7–8", false),
  arrowCell(),
  flowCell("D", "협력", "문장 9–10", false),
  arrowCell(),
  flowCell("E", null, "문장 11–13", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 대상을 나누어 설명하는 설명문",
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
  matRow("1", "11", "이 글이 말하는 주체는 누구인가요? (한 단어)", "Everyone", "문장 맨 앞 (주어)", true),
  matRow("2", "11", "사람마다 방식이 다르다는 말은?", ["unique", "same"], "ways 앞 자리 (형용사)", false),
  matRow("3", "11", "이 방식들이 영향을 주는 것은?", ["relationships", "problems"], "influence 뒤 자리", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  has their  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  ways of solving conflicts, and these styles can influence  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ____________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ and these styles     ⓑ Everyone has their unique ways     ⓒ can influence relationships.     ⓓ of solving conflicts,", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓑ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      (b)가 맨 앞 — 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("styles        conflicts        five        relationships", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Johnson studied how people handle (1) ____________ and found (2) ____________ styles. The Turtle, the Shark, the Teddy Bear, the Fox, and the Owl each act in a different way. These (3) ____________ can influence our (4) ____________, so understanding them is important.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 4, main: "run away from problems",
    opts: ["① face problems bravely", "② avoid dealing with problems", "③ solve problems very quickly"] },
  { sn: 6, main: "want to win at any cost",
    opts: ["① try to win no matter what", "② give up winning easily", "③ enjoy playing games together"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "persuade others to give up some",
    opts: ["① force others to keep all of them", "② talk others into letting some go", "③ pay others for their goals"] },
  { sn: 12, main: "make the relationship last longer",
    opts: ["① end the relationship sooner", "② keep the relationship going longer", "③ make new friends very quickly"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 갈등을 대하는 두 가지 축", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("심리학자들은 갈등을 대하는 방식을 '내 목표를 얼마나 챙기는가'와 '상대와의 관계를 얼마나 챙기는가'라는 두 축으로 설명한다. 거북은 둘 다 내려놓고, 상어는 목표만, 테디베어는 관계만 챙긴다. 여우는 둘을 절반씩 나누고, 올빼미는 시간이 걸려도 둘 다 지키려 한다. 어느 하나가 언제나 정답인 것은 아니다 — 급한 일에는 상어처럼, 사소한 일에는 테디베어처럼 굴 수도 있다. 다만 오래가는 관계를 원한다면 올빼미의 방식을 연습해 둘 필요가 있다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
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
    "Johnson studied how people usually handle problems.",
    "Johnson categorized four styles of dealing with conflicts.",
    "Turtles give up their own goals and relationships.",
    "Sharks care a lot about others’ needs.",
    "Teddy bears give up their goals to keep their relationships.",
    "Owls work alone to reach solutions.",
    "Owls try to find a solution everyone is happy with.",
    "Understanding each person’s style is not important.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "이 글이 이야기를 펼쳐 가는 순서대로 ⓐ~ⓓ를 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Johnson categorized five conflict styles.",
      "ⓑ Johnson studied how people handle problems.",
      "ⓒ The five animal styles are explained one by one.",
      "ⓓ The writer says understanding each style is important."]
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
    ["1  conflict", "ⓐ to give up something important"],
    ["2  goal", "ⓑ a way to fix a problem"],
    ["3  sacrifice", "ⓒ to make someone agree to do something"],
    ["4  persuade", "ⓓ a strong disagreement between people"],
    ["5  solution", "ⓔ to change how something happens"],
    ["6  influence", "ⓕ something you want to do or get"],
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
[["문장 4", [t("Turtles ", { size: 19 }), t("( run  /  runs )", { size: 19, bold: true, color: NAVY }), t(" away from problems.", { size: 19 })], "주어 Turtles(복수)에 맞는 동사 형태는?"],
 ["문장 6", [t("Sharks want ", { size: 19 }), t("( to win  /  winning )", { size: 19, bold: true, color: NAVY }), t(" at any cost.", { size: 19 })], "want 뒤에는 to+동사원형이 옵니다."],
 ["문장 11", [t("Everyone ", { size: 19 }), t("( has  /  have )", { size: 19, bold: true, color: NAVY }), t(" their unique ways of solving conflicts.", { size: 19 })], "Everyone은 단수 취급이에요."],
 ["문장 13", [t("( Understanding  /  Understand )", { size: 19, bold: true, color: NAVY }), t(" each person’s style is important.", { size: 19 })], "주어 자리에는 ~ing(동명사)가 옵니다."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("solution  /  handle  /  win  /  influence  /  goals  /  styles  /  relationships  /  sacrifice", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Social psychologist David W. Johnson studied how people usually", { size: 19 }), ...BL(1), t("problems.  ", { size: 19 }),
  num(2), t(" He found that we tend to think about what we want and what other people want too.  ", { size: 19 }),
  num(3), t(" He categorized five", { size: 19 }), ...BL(2), t("that people use to deal with conflicts.  ", { size: 19 }),
  num(4), t(" The Turtle: Turtles run away from problems.  ", { size: 19 }),
  num(5), t(" They give up their own", { size: 19 }), ...BL(3), t("and relationships.  ", { size: 19 }),
  num(6), t(" The Shark: Sharks want to", { size: 19 }), ...BL(4), t("at any cost.  ", { size: 19 }),
  num(7), t(" The Teddy Bear: Teddy bears give up their goals to keep their", { size: 19 }), ...BL(5), t(".  ", { size: 19 }),
  num(8), t(" The Fox: Foxes can", { size: 19 }), ...BL(6), t("some of their goals or persuade others.  ", { size: 19 }),
  num(9), t(" The Owl: Owls work together to reach solutions.  ", { size: 19 }),
  num(10), t(" They try to find a", { size: 19 }), ...BL(7), t("everyone is happy with, even if it takes time.  ", { size: 19 }),
  num(11), t(" Everyone has their unique ways of solving conflicts, and these styles can", { size: 19 }), ...BL(8), t("their relationships.  ", { size: 19 }),
  num(12), t(" How people handle conflicts can make the relationship last longer.  ", { size: 19 }),
  num(13), t(" That’s why understanding each person’s style is important.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[7, "Teddy bears give up their goals to keep their relationships."],
 [13, "That’s why understanding each person’s style is important."]].forEach(([n, s], i) => {
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
w7block("1", "그는 사람들이 다른 사람과의 갈등을 다루기 위해 사용하는 다섯 가지 방식을 분류했다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 13단어)",
  "use / He / five / that / styles / deal / categorized / people / with / to / others. / conflicts / with");
w7block("2", "상어는 어떤 대가를 치르더라도 이기고 싶어 하고 다른 사람의 필요는 신경 쓰지 않는다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 아포스트로피에 주의할 것  (총 13단어)",
  "at / Sharks / needs. / to / any / want / don’t / win / cost / about / and / care / others’");

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

K.push(...tab("정답 및 해설", "UNIT 28  갈등을 푸는 다섯 동물", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("They give up their own goals and relationships.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문2 ", { size: 17, bold: true, color: NAVY2 }), t("He(S)·found(△V)·that[네모]·we(S′)·tend(△V′)   ", { size: 17, bold: true }),
     t("문11 ", { size: 17, bold: true, color: NAVY2 }), t("Everyone(S)·has(△V)·and[네모]·styles(S)·can influence(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문12 ", { size: 17, bold: true, color: NAVY2 }), t("How people handle conflicts(S)·can make(△V)·last longer·be satisfying", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 첫 기차를 타기 위해 일찍 일어났다  (2) 만화책을 읽는 것은 재미있다  (3) 자전거를 사기 위해 돈을 모으는 것은 쉽지 않다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 conflicts · styles · relationships        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 선택 · 양보 · 덧붙임 · 결과   2-2 [B] 회피와 공격 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓑ → ⓓ → ⓐ → ⓒ  ·  Everyone has their unique ways of solving conflicts, and these styles can influence relationships.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) conflicts  (2) five  (3) styles  (4) relationships        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 4 ②  문장 6 ①  문장 8 ②  문장 12 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓒ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓓ · 2ⓕ · 3ⓐ · 4ⓒ · 5ⓑ · 6ⓔ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) run  (2) to win  (3) has  (4) Understanding", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) handle (2) styles (3) goals (4) win (5) relationships (6) sacrifice (7) solution (8) influence", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) He categorized five styles that people use to deal with conflicts with others.  (2) Sharks want to win at any cost and don’t care about others’ needs.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 존슨이 분류한 다섯 가지 갈등 대처 방식(문장 3–10)과 그 방식이 관계에 미치는 영향(문장 11–13)을 설명한다. 소재(다섯 동물 유형)와 특징(갈등 대처)을 함께 담은 ①이 제목으로 적절하다. ③·④은 지엽적 오답, ②·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 6에서 상어는 다른 사람의 필요를 신경 쓰지 않는다(don’t care)고 했으므로, 많이 신경 쓴다는 ③는 본문과 반대된다. ①은 문장 3, ②은 문장 5, ④은 문장 7, ⑤는 문장 10에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) theirs는 앞의 others를 받아 '다른 사람들의 목표'를 뜻한다. give up some of theirs = 그들의 목표 중 일부를 포기하다 — 소유대명사는 '누구의 것'인지를 앞에서 찾아야 한다.", true);
Hs("독해 04   배열 영작   ·   They give up their own goals and relationships.");
B("문장 5를 그대로 복원하는 문제다. ① 첫 글자는 대문자 They.   ② give up이 한 덩어리의 동사.   ③ their own goals and relationships — and로 두 명사를 잇는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 conflicts · styles · relationships     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 사람들이 갈등을 대하는 다섯 가지 방식을 동물에 빗대어 설명한다. ① 실제 동물 이야기가 아니고, ③ 존슨은 첫 문장의 배경일 뿐이다.");
B("1-2   ○표 할 세 단어: conflicts(힌트① 사람들이 겪는 것) · styles(힌트② 다섯으로 나뉜 것) · relationships(힌트③ 그것이 영향을 주는 것). 나머지 셋(turtle · owl · solution)은 본문에 등장하지만 주제문에 들어가지 않는다 — 예시와 세부 사항이다. 빈도가 아니라 '주제문에 없으면 말이 안 되는 말'을 고르는 것이 기준이다.");
B("1-3   문장 8 — theirs는 남들의 목표에 ○ (others’ goals).   문장 10 — They는 올빼미들에 ○ (문장 9의 Owls).   문장 11 — these styles는 다섯 가지 방식에 ○.");
B("[학습 포인트]   같은 They라도 문장 5에서는 거북, 문장 10에서는 올빼미다. 유형별로 문단이 바뀌는 글에서는 대명사가 '가장 가까운 앞 문장의 주어'를 받는다는 원칙이 특히 잘 통한다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 선택 / 양보 / 덧붙임 / 결과     2-2 [B] 회피와 공격 · [E] 마무리     2-3 ①");
B("2-1   문장 8 or — 여우가 택할 수 있는 두 가지 중 하나라는 '선택'.   문장 10 even if — 시간이 걸리더라도라는 '양보'.   문장 11 and — 앞 내용에 새 사실을 잇는 '덧붙임'.   문장 13 That’s why — 앞의 내용 때문이라는 '결과'.");
B("2-2   [B] 회피와 공격(문장 4–6: 거북과 상어), [E] 마무리(문장 11–13: 방식이 관계를 좌우한다). 보기의 '실험 결과'는 이 글에 없는 역할이다. [A] 소개 → [B] 회피와 공격 → [C] 양보와 절충 → [D] 협력 → [E] 마무리 — 유형을 차례로 나열하는 설명문의 전형이다.");
B("2-3   정답 ①. 다섯 유형을 하나씩 나누어 설명하고 마지막에 의미를 정리하는 설명문이다. ② I·오늘 같은 일기의 신호가 없고, ③ 가격·명령문이 없어 광고도 아니며, ④ 받는 사람도 ⑤ 지어낸 이야기도 없다.");
B("[학습 포인트]   유형을 나열하는 글은 이름(The Turtle, The Shark…)이 곧 소제목이다. 이름 옆에 '목표 / 관계' 두 글자만 적어 두면 다섯 유형이 한눈에 정리된다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 unique · relationships     3-3 (b) → (d) → (a) → (c)");
B("3-1  재료 찾기 — (2) 문장 11에서 unique에 ○: 사람마다 방식이 다르다는 말이다. same은 정반대다. (3) 문장 11에서 relationships에 ○: 이 방식들이 영향을 주는 대상이다. problems는 문장 1의 말일 뿐이다.");
B("3-2  뼈대 채우기 — (1) Everyone  (2) unique  (3) relationships.  넣으면 Everyone has their unique ways of solving conflicts, and these styles can influence relationships.가 완성된다.");
B("3-3  정답 순서 — ⓑ Everyone has their unique ways → ⓓ of solving conflicts, → ⓐ and these styles → ⓒ can influence relationships.");
B("[채점 포인트]  주어 덩어리(ⓑ)가 맨 앞, 마침표가 붙은 덩어리(ⓒ)가 맨 뒤 — and 앞뒤로 두 개의 주어·동사가 있다는 것만 보면 순서가 잡힌다.", true);
Hs("STEP 4   요약문   ·   (1) conflicts  (2) five  (3) styles  (4) relationships");
B("(1)은 문장 3의 conflicts, (2)는 문장 3의 five, (3)은 문장 11의 styles, (4)는 문장 11의 relationships에서 가져온다. 요약문이 곧 이 글의 흐름이다: 연구(1) → 분류(2) → 유형(3) → 영향(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 4 ②   문장 6 ①   문장 8 ②   문장 12 ②  (정답 선지는 무표시)");
B("문장 4 run away from problems   ① ✕ [반대] 문제와 용감히 맞선다 — 정반대.   ② ○ 문제를 다루기를 피한다.   ③ ✕ [무관] 아주 빨리 해결한다는 말은 지문에 없다.");
B("문장 6 want to win at any cost   ① ○ 무슨 일이 있어도 이기려 한다.   ② ✕ [반대] 이기는 것을 쉽게 포기한다 — 정반대.   ③ ✕ [무관] 함께 게임을 즐긴다는 말은 지문에 없다.");
B("문장 8 persuade others to give up some   ① ✕ [반대] 전부 지키게 강요한다 — 정반대.   ② ○ 설득해 일부를 내려놓게 한다.   ③ ✕ [무관] 목표에 돈을 준다는 말은 지문에 없다.");
B("문장 12 make the relationship last longer   ① ✕ [반대] 관계를 더 빨리 끝낸다 — 정반대.   ② ○ 관계를 더 오래 이어 간다.   ③ ✕ [무관] 새 친구를 빨리 사귄다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. 지문을 읽을 때마다 '이 표현을 다른 말로 하면?'을 스스로 물어보자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 3: 네 가지가 아니라 다섯 가지(five) 방식이다.   3 T — 문장 5.   4 F — 문장 6: 신경 쓰는 게 아니라 신경 쓰지 않는다(don’t care).   5 T — 문장 7.   6 F — 문장 9: 혼자가 아니라 함께(together) 협력한다.   7 T — 문장 10.   8 F — 문장 13: 중요하지 않은 게 아니라 중요하다(important).  거짓 문장은 모두 딱 한 요소(four, care, alone, not)만 비튼 것이다.", true);
Hs("R2   전개 순서   ·   (b) → (a) → (c) → (d)");
B("ⓑ 존슨이 사람들이 문제를 다루는 방식을 연구한다(문장 1) → ⓐ 다섯 가지 방식으로 분류한다(문장 3) → ⓒ 다섯 동물 유형을 하나씩 설명한다(문장 4–10) → ⓓ 각자의 방식을 이해하는 것이 중요하다고 마무리한다(문장 13). 설명문은 사건이 아니라 '설명이 쌓이는 순서'를 따라간다.", true);
Hs("R3   영영풀이   ·   1 (d) · 2 (f) · 3 (a) · 4 (c) · 5 (b) · 6 (e)");
B("conflict = 사람들 사이의 강한 의견 충돌(갈등) · goal = 하고 싶거나 얻고 싶은 것(목표) · sacrifice = 중요한 것을 포기하다(희생하다) · persuade = 하도록 동의하게 만들다(설득하다) · solution = 문제를 푸는 방법(해결책) · influence = 일이 되어 가는 모습을 바꾸다(영향을 주다).", true);
Hs("R4   어법 기초   ·   (1) run  (2) to win  (3) has  (4) Understanding");
B("(1) 주어 Turtles는 복수 — run.   (2) want 뒤에는 to부정사 — to win.   (3) Everyone은 -one으로 끝나는 단수 취급 — has.   (4) 주어 자리에는 동명사 — Understanding. 2면 구문 카드에서 배운 그 문장이다.", true);
Hs("R5   빈칸 클로즈   ·   (1) handle (2) styles (3) goals (4) win (5) relationships (6) sacrifice (7) solution (8) influence");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: usually ___ problems ← 문제를 다루다, five ___ ← 다섯 가지 방식, want to ___ ← 상어의 목표, can ___ their relationships ← 마지막 결론. 채우고 나면 지문 한 편을 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 테디베어는 관계를 지키기 위해 자신의 목표를 포기한다.  — to keep(to부정사)을 '~하기 위해'로 옮기는 것이 핵심이다.");
B("(2) 그래서 각 사람의 방식을 이해하는 것이 중요하다.  — 동명사 주어 understanding을 '이해하는 것은'으로 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) He categorized five styles that people use to deal with conflicts with others.  (2) Sharks want to win at any cost and don’t care about others’ needs.");
B("(1) 문장 3의 복원. ㄱ 첫 글자 대문자 He  ㄴ five styles 뒤에 that절이 이어진다  ㄷ deal with conflicts with others — with가 두 번 나오는 자리에 주의한다.");
B("(2) 문장 6의 복원. ㄱ 첫 글자 대문자 Sharks  ㄴ want to win — R4-(2)에서 고른 그 형태다  ㄷ others’의 아포스트로피 위치(복수형 뒤)를 빠뜨리지 않는다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("사회심리학자 데이비드 W. 존슨은 사람들이 보통 문제를 어떻게 다루는지 연구했다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 우리가 자신이 원하는 것과 다른 사람이 원하는 것을 함께 생각하는 경향이 있다는 것을 발견했다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 사람들이 다른 사람과의 갈등을 다루기 위해 사용하는 다섯 가지 방식을 분류했다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("거북형: 거북은 문제에서 도망친다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 자신의 목표와 관계를 포기한다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("상어형: 상어는 어떤 대가를 치르더라도 이기고 싶어 하고 다른 사람의 필요는 신경 쓰지 않는다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("테디베어형: 테디베어는 관계를 지키기 위해 자신의 목표를 포기한다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("여우형: 여우는 자기 목표의 일부를 희생하거나, 다른 사람들이 그들의 목표 일부를 포기하도록 설득할 수 있다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("올빼미형: 올빼미는 해결책에 이르기 위해 함께 협력한다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 시간이 걸리더라도 모두가 만족하는 해결책을 찾으려 한다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("모든 사람은 갈등을 푸는 자기만의 방식을 가지고 있고, 이 방식들은 그들의 관계에 영향을 줄 수 있다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("사람들이 갈등을 다루는 방식은 관계를 더 오래가고 더 만족스럽게 만들 수 있다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 각 사람의 방식을 이해하는 것이 중요하다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
