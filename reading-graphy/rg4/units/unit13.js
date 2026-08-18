/* UNIT 13 — 실수해도 낙담하지 말아요 (Level 4)
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
  no: "13",
  title: "실수해도 낙담하지 말아요",
  level: "4",
  foot: "UNIT 13  실수해도 낙담하지 말아요",
  banner: ["13", "실수해도 낙담하지 말아요", "4"],
  timeline: ["질문|왜 다를까|같은 실수를 겪어도\\n아이마다 반응이 다르다|sun",
             "고정 마인드셋|타고난 능력|‘머리는 정해져 있다’\\n실수를 못 본 척한다|drop_x",
             "성장 마인드셋|자라는 능력|‘노력하면 는다’\\n실수를 들여다본다|leaf",
             "결과|더 빠른 학습|다음 시도에서\\n실수를 바로잡는다|city"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 11문장 ═══════════ */
const SENT = [
  "It’s true that we can learn from our mistakes!",
  "A new study shows that kids who pay attention to their mistakes actually learn faster than those who don’t.",
  "A psychologist at Michigan State University, studied 123 children aged six to eight.",
  "Some of the children believed that they are born with a certain level of intelligence and it cannot change.",
  "Others believed that they can become smarter through hard work.",
  "In the study, the children played a computer game to catch animals.",
  "They wore special hats that recorded their brain activity.",
  "The results showed that children with a growth mindset paid more attention to their mistakes.",
  "They were also better at correcting their mistakes on the next try.",
  "On the other hand, children with a fixed mindset tended to ignore their mistakes.",
  "This study shows that if you believe you can get smarter, you will be more likely to learn from your mistakes.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–5 [C]6–7 [D]8–10 [E]11 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 6: "C", 8: "D", 11: "E" };
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
  2: [R("A new study shows that kids who pay attention to their mistakes actually learn faster than "), RM("those"), R(" who don’t.  ")],
  4: [R("Some of the children believed that "), RM("they"), R(" are born with a certain level of intelligence and "), RM("it"), R(" cannot change.  ")],
  7: [RM("They"), R(" wore special hats that recorded their brain activity.  ")],
  9: [RM("They"), R(" were also better at correcting their mistakes on the next try.  ")],
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
  9: [t("(A) ", { size: 19, bold: true }), t("They", { size: 19, bold: true, underline: {} }),
      t(" were also better at correcting their mistakes on the next try.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Watch Your Mistakes and Learn Faster", "② How to Win a Computer Game about Animals",
 "③ The Best Hats for Sports and Study", "④ A Famous University in Michigan",
 "⑤ Why Children Need More Sleep"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① A new study shows that some kids learn faster than others.",
 "② A psychologist studied 123 children aged six to eight.",
 "③ In the study, the children played a computer game to catch animals.",
 "④ Children with a growth mindset paid less attention to their mistakes.",
 "⑤ Children with a fixed mindset tended to ignore their mistakes."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) They가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① children with a growth mindset",
 "② children with a fixed mindset",
 "③ the researchers at the university",
 "④ the special hats in the study",
 "⑤ the animals in the computer game"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그 연구에서, 아이들은 동물을 잡는 컴퓨터 게임을 했다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 12단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("played / the / In / computer / study, / the / to / children / game / a / catch / animals.", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 2", { size: 14, bold: true, color: AMB }), t("   주격 관계대명사 who의 명사 수식", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("kids ", { size: 18 }), t("who", { size: 18, bold: true, color: NAVY }), t(" pay attention to their mistakes", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("who 이하가 앞의 명사 kids를 뒤에서 꾸밉니다. ‘실수에 주의를 기울이는 아이들’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 9", { size: 14, bold: true, color: AMB }), t("   전치사 뒤에는 동명사(-ing)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("better ", { size: 18 }), t("at", { size: 18, bold: true, color: NAVY }), t(" correcting", { size: 18, bold: true, color: NAVY, underline: {} }), t(" their mistakes", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("전치사 at 뒤의 동사는 -ing 형태가 됩니다. ‘실수를 바로잡는 것을 더 잘하는’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 2 구문", [t("I have a friend ", { size: 19 }), t("who", { size: 19, bold: true, color: NAVY }), t(" plays the guitar every day", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 9 구문", [t("She is very good ", { size: 19 }), t("at", { size: 19, bold: true, color: NAVY }), t(" drawing", { size: 19, bold: true, color: NAVY, underline: {} }), t(" cats.", { size: 19 })]],
 ["둘 다!", [t("The boy ", { size: 19 }), t("who", { size: 19, bold: true, color: NAVY }), t(" sits next to me", { size: 19, underline: {} }), t(" is good ", { size: 19 }), t("at", { size: 19, bold: true, color: NAVY }), t(" solving", { size: 19, bold: true, color: NAVY, underline: {} }), t(" puzzles.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 5를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1150, 1450, 800, 750, 2200, 1100, 1480], [new TableRow({ children: [
    exSeg([t("Others", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1150),
    exSeg([t("believed", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1450, "△"),
    exSeg([t("that", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 800),
    exSeg([t("they", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 750),
    exSeg([t("can grow and become", { size: 18, bold: true, color: NAVY })], "V′ 한 덩어리", NAVY, 2200, "△"),
    exSeg([t("smarter", { size: 18 })], "", FAINT, 1100),
    exSeg([t("through hard work", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1480),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[6, "In the study, the children played a computer game to catch animals."],
 [8, "The results showed that children with a growth mindset paid more attention to their mistakes."],
 [10, "On the other hand, children with a fixed mindset tended to ignore their mistakes."]].forEach(([n, c]) => {
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
["① 컴퓨터 게임을 잘하는 방법", "② 실수에 주의를 기울이는 아이가 더 빨리 배운다는 연구", "③ 뇌 활동을 기록하는 특수 모자"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["mistakes", "실수"], ["attention", "주의"], ["faster", "더 빨리"], ["hats", "모자"], ["animals", "동물"], ["game", "게임"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 핵심 대상  ② 아이들이 그것에 하는 것  ③ 연구가 밝힌 결과 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · those 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서 서로 다른 것을 가리키기도 해요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const chips8 = () => T([820, 1200, 170, 1200, 300, 930, 1200, 170, 1200], [new TableRow({ children: [
      labC("they =", 820), chipC("아이들", 1200), gapC(170), chipC("지능 수준", 1200), gapC(300),
      labC("it =", 930), chipC("아이들", 1200), gapC(170), chipC("지능 수준", 1200),
    ] })]);
    return [
    ["2", "those", [t("실수에 주의하지 않는 아이들", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "they · it", chips8(), false],
    ["7", "They", chips2("연구 속 아이들", "뇌 활동", 1900), false],
    ["9", "They", chips2("성장 마인드셋", "고정 마인드셋", 2100), false],
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
    ["2", [t("Kids who pay attention learn faster ", { size: 17 }), t("than", { size: 17, bold: true, color: NAVY, underline: {} }), t(" those who don’t.", { size: 17 })], ["비교", "이유"]],
    ["9", [t("They were ", { size: 17 }), t("also", { size: 17, bold: true, color: NAVY, underline: {} }), t(" better at correcting their mistakes.", { size: 17 })], ["덧붙임", "순서"]],
    ["10", [t("On the other hand", { size: 17, bold: true, color: NAVY, underline: {} }), t(", children with a fixed mindset ignored them.", { size: 17 })], ["반전", "결과"]],
    ["11", [t("This study shows that ", { size: 17 }), t("if", { size: 17, bold: true, color: NAVY, underline: {} }), t(" you believe you can get smarter, ...", { size: 17 })], ["조건", "때"]],
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
    chipCellG("두 믿음", 1400),
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
  flowCell("A", "도입", "문장 1–2", false),
  arrowCell(),
  flowCell("B", null, "문장 3–5", true),
  arrowCell(),
  flowCell("C", "실험", "문장 6–7", false),
  arrowCell(),
  flowCell("D", "결과", "문장 8–10", false),
  arrowCell(),
  flowCell("E", null, "문장 11", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 연구 결과를 알려 주는 설명문",
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
  matRow("1", "2", "이 글의 주인공을 나타낸 말은? (한 단어)", "Kids", "문장 맨 앞 자리", true),
  matRow("2", "2", "그 아이들이 실수에 하는 행동은?", ["pay attention", "ignore"], "who 뒤 자리 (행동)", false),
  matRow("3", "2", "연구가 밝힌 결과를 나타낸 말은?", ["faster", "slower"], "learn 뒤 자리 (결과)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  who  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("  to their mistakes actually learn  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  than those who don’t.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ actually learn faster     ⓑ than those who don’t.     ⓒ Kids who pay attention     ⓓ to their mistakes", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("attention        mistakes        ignore        faster", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("A psychologist watched 123 children play a game in special hats. Children with a growth mindset paid more (1) ____________ to their (2) ____________, but those with a fixed mindset tended to (3) ____________ them. If you believe you can get smarter, you will learn (4) ____________ from your mistakes.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 2, main: "pay attention to their mistakes",
    opts: ["① pay no attention to their mistakes", "② look carefully at their mistakes", "③ write down their mistakes"] },
  { sn: 5, main: "become smarter through hard work",
    opts: ["① stay the same no matter what", "② get smarter by working hard", "③ become smarter by sleeping more"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 9, main: "better at correcting their mistakes",
    opts: ["① worse at fixing their mistakes", "② faster at finishing the game", "③ more able to fix their mistakes"] },
  { sn: 10, main: "tended to ignore their mistakes",
    opts: ["① usually ignored their mistakes", "② always studied mistakes closely", "③ hid their mistakes from teachers"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 성장 마인드셋 (growth mindset)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("‘머리는 타고나는 것’이라고 믿으면 실수는 창피한 증거가 된다. 반대로 ‘노력하면 자란다’고 믿으면 실수는 다음 판을 위한 정보가 된다. 심리학자 캐럴 드웩은 앞의 믿음을 고정 마인드셋, 뒤의 믿음을 성장 마인드셋이라고 불렀다. 뇌파를 재는 연구들은 성장 마인드셋인 아이의 뇌가 틀린 순간에 더 크게 반응하고, 그다음 문제를 더 정확히 푼다는 것을 보여 준다. 능력은 정해진 크기가 아니라 쓸수록 자라는 근육에 가깝다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
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
    "A new study shows that kids who pay attention to their mistakes learn faster.",
    "The psychologist studied 123 children aged six to eight.",
    "In the study, the children played a computer game to catch fish.",
    "They wore special hats that recorded their brain activity.",
    "Children with a growth mindset paid less attention to their mistakes.",
    "They were also better at correcting their mistakes on the next try.",
    "Children with a fixed mindset tended to correct their mistakes.",
    "The study says that your intelligence can never change.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "연구가 진행된 순서대로 ⓐ~ⓓ를 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ The results showed a difference between the two groups.",
      "ⓑ Some children believed that intelligence cannot change.",
      "ⓒ The children played a computer game wearing special hats.",
      "ⓓ The study concluded that believing in growth helps learning."]
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
    ["1  mistake", "ⓐ the ability to learn and understand things"],
    ["2  attention", "ⓑ to pay no attention to something"],
    ["3  intelligence", "ⓒ something you do in a wrong way"],
    ["4  record", "ⓓ carefully watching or listening"],
    ["5  correct", "ⓔ to make something right again"],
    ["6  ignore", "ⓕ to write or keep information for later use"],
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
[["문장 2", [t("kids ", { size: 19 }), t("who ( pay  /  pays )", { size: 19, bold: true, color: NAVY }), t(" attention to their mistakes", { size: 19 })], "선행사 kids는 복수예요."],
 ["문장 7", [t("They wore special hats that ", { size: 19 }), t("( recorded  /  recording )", { size: 19, bold: true, color: NAVY }), t(" their brain activity.", { size: 19 })], "wore와 시제를 맞추세요."],
 ["문장 9", [t("They were also better at ", { size: 19 }), t("( correcting  /  correct )", { size: 19, bold: true, color: NAVY }), t(" their mistakes.", { size: 19 })], "전치사 at 뒤의 동사 형태는?"],
 ["문장 11", [t("If you believe you ", { size: 19 }), t("( can get  /  can gets )", { size: 19, bold: true, color: NAVY }), t(" smarter, ...", { size: 19 })], "조동사 can 뒤에는 동사원형!"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("growth  /  mistakes  /  attention  /  ignore  /  hats  /  faster  /  correcting  /  intelligence", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" It’s true that we can learn from our mistakes!  ", { size: 19 }),
  num(2), t(" A new study shows that kids who pay", { size: 19 }), ...BL(1), t("to their mistakes actually learn", { size: 19 }), ...BL(2), t("than those who don’t.  ", { size: 19 }),
  num(3), t(" A psychologist at Michigan State University, studied 123 children aged six to eight.  ", { size: 19 }),
  num(4), t(" Some of the children believed that they are born with a certain level of", { size: 19 }), ...BL(3), t("and it cannot change.  ", { size: 19 }),
  num(5), t(" Others believed that they can become smarter through hard work.  ", { size: 19 }),
  num(6), t(" In the study, the children played a computer game to catch animals.  ", { size: 19 }),
  num(7), t(" They wore special", { size: 19 }), ...BL(4), t("that recorded their brain activity.  ", { size: 19 }),
  num(8), t(" The results showed that children with a", { size: 19 }), ...BL(5), t("mindset paid more attention to their mistakes.  ", { size: 19 }),
  num(9), t(" They were also better at", { size: 19 }), ...BL(6), t("their mistakes on the next try.  ", { size: 19 }),
  num(10), t(" On the other hand, children with a fixed mindset tended to", { size: 19 }), ...BL(7), t("their mistakes.  ", { size: 19 }),
  num(11), t(" This study shows that if you believe you can get smarter, you will be more likely to learn from your", { size: 19 }), ...BL(8), t(".", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[2, "A new study shows that kids who pay attention to their mistakes actually learn faster than those who don’t."],
 [9, "They were also better at correcting their mistakes on the next try."]].forEach(([n, s], i) => {
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
w7block("1", "그들은 자신들의 뇌 활동을 기록하는 특수 모자를 썼다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 9단어)",
  "that / They / brain / hats / wore / recorded / activity. / special / their");
w7block("2", "다른 아이들은 열심히 노력하면 자라서 더 똑똑해질 수 있다고 믿었다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 12단어)",
  "believed / they / Others / grow / that / can / become / and / work. / smarter / hard / through");

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

K.push(...tab("정답 및 해설", "UNIT 13  실수해도 낙담하지 말아요", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("In the study, the children played a computer game to catch animals.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("In the study(M)·children(S)·played(△V)·to catch animals(M)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("On the other hand(M)·children(S)·tended to ignore(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문8 ", { size: 17, bold: true, color: NAVY2 }), t("results(S)·showed(△V)·that[네모]·children(S′)·paid(△V′)·more attention(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 매일 기타를 치는 친구가 한 명 있다  (2) 그녀는 고양이를 그리는 것을 아주 잘한다  (3) 내 옆에 앉는 그 소년은 퍼즐 푸는 것을 잘한다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 mistakes · attention · faster        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 비교 · 덧붙임 · 반전 · 조건   2-2 [B] 두 믿음 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓓ → ⓐ → ⓑ  ·  Kids who pay attention to their mistakes actually learn faster than those who don’t.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) attention  (2) mistakes  (3) ignore  (4) faster        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 2 ②  문장 5 ②  문장 9 ③  문장 10 ①", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4T · 5F · 6T · 7F · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓒ → ⓐ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓓ · 3ⓐ · 4ⓕ · 5ⓔ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) pay  (2) recorded  (3) correcting  (4) can get", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) attention (2) faster (3) intelligence (4) hats (5) growth (6) correcting (7) ignore (8) mistakes", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) They wore special hats that recorded their brain activity.  (2) Others believed that they can become smarter through hard work.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 실수에 주의를 기울이는 아이가 더 빨리 배운다는 연구(문장 2·8·9)를 소개한다. 소재(mistakes)와 결과(learn faster)를 함께 담은 ①이 제목으로 적절하다. ②·③는 게임·모자만 건드린 지엽적 오답, ④·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 8에서 성장 마인드셋 아이들은 실수에 '더 많은(more)' 주의를 기울였다. less로 뒤집은 ④이 본문과 반대된다. ①은 문장 2, ②은 문장 3, ③는 문장 6, ⑤는 문장 10에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) They는 바로 앞 문장 8의 children with a growth mindset을 가리킨다. 실수를 눈여겨본 그 아이들이 다음 시도에서 더 잘 고쳤다는 흐름이다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   In the study, the children played a computer game to catch animals.");
B("문장 6을 그대로 복원하는 문제다. ① 문두 In the study 뒤의 콤마.   ② 주어 the children + 과거동사 played.   ③ '~하기 위한/하려고'는 to+동사원형 — to catch animals.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 mistakes · attention · faster     1-3 아래 참조");
B("1-1   정답 ②. 실수를 대하는 태도가 배우는 속도를 바꾼다는 연구다. ① 게임과 ③ 모자는 실험 도구일 뿐 소재가 아니다.");
B("1-2   ○표 할 세 단어: mistakes(힌트① 핵심 대상) · attention(힌트② 아이들이 하는 것) · faster(힌트③ 연구가 밝힌 결과). hats · animals · game은 실험 장치일 뿐 주제문에 들어가지 않는다.");
B("1-3   문장 4 — they는 아이들, it은 지능 수준에 ○ (한 문장 안에서 대상이 바뀐다).   문장 7 — They는 연구 속 아이들.   문장 9 — They는 문장 8의 성장 마인드셋 아이들.");
B("[학습 포인트]   문장 4처럼 한 문장에서 they와 it이 서로 다른 것을 받는 자리가 시험에 나온다. 수 일치(they=복수, it=단수)가 첫 단서다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 비교 / 덧붙임 / 반전 / 조건     2-2 [B] 두 믿음 · [E] 마무리     2-3 ①");
B("2-1   문장 2 than — 두 집단을 '비교'한다.   문장 9 also — 앞 내용에 '덧붙임'.   문장 10 On the other hand — 방향을 바꾸는 '반전'.   문장 11 if — '조건'을 건다.");
B("2-2   [B] 두 믿음(문장 3–5: 지능은 정해져 있다 vs 자란다), [E] 마무리(문장 11: 믿으면 배운다). 보기의 '광고'는 이 글에 없는 역할이다.");
B("2-3   정답 ①. 연구의 대상·방법·결과를 사실대로 알려 주는 설명문이다. 날짜와 I가 없어 일기가 아니고, 가격·명령문이 없어 광고도 아니다.");
B("[학습 포인트]   대조 신호(On the other hand)를 만나면 두 집단을 표로 나눠 적어 보자. 고등 독해의 대조 구조 문항이 여기서 자란다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 pay attention · faster     3-3 ⓒ → ⓓ → ⓐ → ⓑ");
B("3-1  재료 찾기 — (2) 문장 2에서 pay attention에 ○: 아이들이 실수에 하는 행동이다. ignore는 반대편(문장 10)의 태도다. (3) faster에 ○: 연구가 밝힌 결과다.");
B("3-2  뼈대 채우기 — (1) Kids  (2) pay attention  (3) faster. 넣으면 Kids who pay attention to their mistakes actually learn faster than those who don’t.가 완성된다.");
B("3-3  정답 순서 — ⓒ Kids who pay attention → ⓓ to their mistakes → ⓐ actually learn faster → ⓑ than those who don’t.");
B("[채점 포인트]  주인공(Kids)이 맨 앞, 마침표가 붙은 덩어리(ⓑ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) attention  (2) mistakes  (3) ignore  (4) faster");
B("(1)·(2)는 문장 8, (3)은 문장 10, (4)는 문장 2에서 가져온다. 요약문이 곧 이 글의 뼈대다: 실험(모자와 게임) → 두 집단의 차이 → 결론.", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 2 ②   문장 5 ②   문장 9 ③   문장 10 ①  (정답 선지는 무표시)");
B("문장 2 pay attention to their mistakes   ① ✕ [반대] 전혀 주의하지 않는다.   ② ○ 실수를 주의 깊게 살펴본다.   ③ ✕ [무관] 받아 적는다는 말은 없다.");
B("문장 5 become smarter through hard work   ① ✕ [반대] 무슨 일이 있어도 그대로다.   ② ○ 열심히 해서 더 똑똑해진다.   ③ ✕ [무관] 잠은 지문에 없다.");
B("문장 9 better at correcting their mistakes   ① ✕ [반대] 더 못 고친다.   ② ✕ [무관] 게임을 빨리 끝낸다는 말은 없다.   ③ ○ 실수를 더 잘 바로잡는다.");
B("문장 10 tended to ignore their mistakes   ① ○ 대개 실수에 주의를 두지 않았다.   ② ✕ [반대] 늘 자세히 살폈다.   ③ ✕ [무관] 선생님에게 숨겼다는 말은 없다.");
B("[학습 포인트]  시험은 본문 표현을 반드시 바꿔서 묻는다. pay attention ↔ ignore처럼 짝이 되는 표현을 함께 묶어 외워 두자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 T · 5 F · 6 T · 7 F · 8 F");
B("1 T — 문장 2.   2 T — 문장 3.   3 F — 문장 6: fish가 아니라 animals를 잡는 게임이다.   4 T — 문장 7.   5 F — 문장 8: less가 아니라 more attention이다.   6 T — 문장 9.   7 F — 문장 10: correct가 아니라 ignore했다.   8 F — 문장 11: 바뀔 수 없다는 것은 고정 마인드셋 아이들의 믿음(문장 4)일 뿐이다.  거짓 넷은 모두 한 요소(fish, less, correct, never)만 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓒ → ⓐ → ⓓ");
B("ⓑ 아이들의 믿음을 확인해 두 집단으로 나눈다(문장 4–5) → ⓒ 특수 모자를 쓰고 컴퓨터 게임을 한다(문장 6–7) → ⓐ 두 집단의 결과 차이가 드러난다(문장 8–10) → ⓓ 연구의 결론을 정리한다(문장 11). 연구 글은 대상 → 방법 → 결과 → 결론의 차례로 흐른다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓓ · 3 ⓐ · 4 ⓕ · 5 ⓔ · 6 ⓑ");
B("mistake = 잘못한 일 · attention = 주의 깊게 보고 듣는 것 · intelligence = 배우고 이해하는 능력 · record = 나중을 위해 정보를 남기다 · correct = 다시 바르게 만들다 · ignore = 신경 쓰지 않다.", true);
Hs("R4   어법 기초   ·   (1) pay  (2) recorded  (3) correcting  (4) can get");
B("(1) 선행사 kids가 복수이므로 who pay.   (2) 앞의 wore와 시제를 맞춰 recorded.   (3) 전치사 at 뒤의 동사는 -ing — correcting. 2면 구문에서 배운 그 자리다.   (4) 조동사 can 뒤에는 동사원형 — can get.", true);
Hs("R5   빈칸 클로즈   ·   (1) attention (2) faster (3) intelligence (4) hats (5) growth (6) correcting (7) ignore (8) mistakes");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: pay ___ ← 주의를 기울이다, a certain level of ___ ← 지능 수준, at ___ ← 전치사 뒤 -ing, tended to ___ ← 반대편 집단의 태도.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 새로운 연구는 자신의 실수에 주의를 기울이는 아이들이 그렇지 않은 아이들보다 실제로 더 빨리 배운다는 것을 보여 준다.  — who 이하가 앞의 kids를 꾸민다.");
B("(2) 그들은 또한 다음 시도에서 자신의 실수를 더 잘 바로잡았다.  — be better at ~ing는 '~하는 것을 더 잘하다'.", true);
Hs("R7   조건 영작   ·   (1) They wore special hats that recorded their brain activity.  (2) Others believed that they can become smarter through hard work.");
B("(1) 문장 7의 복원. ㄱ 첫 글자 대문자 They  ㄴ 명사 hats 뒤에 that절이 이어져 모자를 설명한다.");
B("(2) 문장 5의 복원. ㄱ believed that 뒤에 '주어+동사'가 온다  ㄴ 조동사 can 뒤의 grow와 become이 and로 이어진다. R4-(4)에서 고른 그 원칙이다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("우리가 실수에서 배울 수 있다는 것은 사실이다!  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("새로운 연구는 자신의 실수에 주의를 기울이는 아이들이 그렇지 않은 아이들보다 실제로 더 빨리 배운다는 것을 보여 준다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("미시간 주립대학교의 한 심리학자가 여섯 살에서 여덟 살 사이의 아이 123명을 연구했다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("아이들 중 일부는 자신이 일정한 수준의 지능을 타고나며 그것은 바뀔 수 없다고 믿었다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("다른 아이들은 열심히 노력하면 자라서 더 똑똑해질 수 있다고 믿었다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 연구에서, 아이들은 동물을 잡는 컴퓨터 게임을 했다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 자신의 뇌 활동을 기록하는 특수한 모자를 썼다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("결과는 성장 마인드셋을 지닌 아이들이 자신의 실수에 더 많은 주의를 기울였다는 것을 보여 주었다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 또한 다음 시도에서 자신의 실수를 더 잘 바로잡았다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("반면에, 고정 마인드셋을 지닌 아이들은 자신의 실수를 무시하는 경향이 있었다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 연구는 여러분이 더 똑똑해질 수 있다고 믿으면, 실수에서 배울 가능성이 더 크다는 것을 보여 준다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
