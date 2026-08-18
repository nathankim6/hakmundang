/* UNIT 14 — 왜 모두 무표정일까요? (Level 1) · 축약 유닛(5면)
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
  no: "14",
  title: "왜 모두 무표정일까요?",
  level: "1",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 14  왜 모두 무표정일까요?",
  banner: ["14", "왜 모두 무표정일까요?", "1"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "In the late 18th and early 19th centuries, most people didn’t smile in photos.",
  "They didn’t smile even at happy events like weddings.",
  "Back then, taking a picture took much longer than today.",
  "It took about 20 minutes to take one picture!",
  "So, people had to sit very still for a long time.",
  "Imagine trying to keep a smile for 20 minutes!",
  "Before cameras, people painted pictures to remember special moments.",
  "In these paintings, big smiles weren’t common.",
  "Many people believed that showing big smiles wasn’t appropriate.",
  "When cameras were invented, people continued this tradition.",
  "They thought that only silly or lower-class people smiled in photos.",
  "So, they kept a serious face.",
  "However, the tradition slowly began to change, and smiles became more common.",
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
  2: [RM("They"), R(" didn’t smile even at happy events like weddings.  ")],
  8: [R("In "), RM("these paintings"), R(", big smiles weren’t common.  ")],
  10: [R("When cameras were invented, people continued "), RM("this tradition"), R(".  ")],
  11: [RM("They"), R(" thought that only silly or lower-class people smiled in photos.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u14.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  10: [t("When cameras were invented, people continued ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("this tradition", { size: 19, bold: true, underline: {} }),
      t(".  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Why Old Photos Have No Smiles", "② How to Take a Good Wedding Photo",
 "③ The First Camera in the World", "④ Famous Painters of the 19th Century",
 "⑤ The Best Way to Keep a Big Smile"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Most people didn’t smile in photos in the late 18th century.",
 "② Taking a picture took much longer than it does today.",
 "③ People had to sit very still for a long time.",
 "④ Before cameras, big smiles were common in paintings.",
 "⑤ The tradition slowly began to change later."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) this tradition이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① not showing big smiles in pictures",
 "② taking pictures only at weddings",
 "③ painting pictures instead of photos",
 "④ sitting very still for 20 minutes",
 "⑤ inventing a new kind of camera"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("이 그림들에서, 큰 미소는 흔하지 않았다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 7단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("smiles / in / common / these / big / paintings, / weren’t", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   동명사 주어 '~하는 것은'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("taking a picture", { size: 18, bold: true, color: NAVY, underline: {} }), t(" took much longer", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사+ing가 주어 자리에 오면 '~하는 것은'. 한 덩어리라서 단수로 봅니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 7", { size: 14, bold: true, color: AMB }), t("   to부정사 '~하기 위해' (목적)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("people painted pictures ", { size: 18 }), t("to remember special moments", { size: 18, bold: true, color: NAVY, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 '~하기 위해'라는 목적을 나타냅니다. '기억하기 위해 그렸다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 3 구문", [t("Riding a bike", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is easy.", { size: 19 })]],
 ["문장 7 구문", [t("She went to the store ", { size: 19 }), t("to buy some milk", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("Saving money", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is important ", { size: 19 }), t("to buy a new bike", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
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

/* [DATA] 먼저 보기 — 다 표시된 문장 (문장 6: M 문두 + S·V·M) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || " ", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 10을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1050, 1450, 1900, 1250, 1650, 1630], [new TableRow({ children: [
    exSeg([t("When", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 1050),
    exSeg([t("cameras", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1450),
    exSeg([t("were invented", { size: 18, bold: true, color: NAVY })], "V′ 한 덩어리", NAVY, 1900, "△"),
    exSeg([t("people", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1250),
    exSeg([t("continued", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1650, "△"),
    exSeg([t("this tradition", { size: 18 })], "", FAINT, 1630),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[5, "So, people had to sit very still for a long time."],
 [7, "Before cameras, people painted pictures to remember special moments."],
 [13, "However, the tradition slowly began to change, and smiles became more common."]].forEach(([n, c]) => {
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
["① 결혼식 사진을 잘 찍는 방법", "② 옛날 사진 속 사람들이 웃지 않은 이유", "③ 그림을 잘 그리는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["smile", "미소"], ["weddings", "결혼식"], ["photos", "사진"], ["minutes", "분"], ["tradition", "전통"], ["paintings", "그림"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 사람들이 하지 않은 것  ② 그 일이 일어난 자리  ③ 그것을 계속 이어 가게 한 것 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · this 같은 지시어는 앞에 나온 말을 대신합니다. 앞 내용 전체를 한 번에 받기도 해요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2350, 6950];
const ahd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(aw, [
  thead(["문장", "지시어", "무엇을 가리키는가 — 하나에 ○표"], aw),
  ...(() => {
    const chipC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16 })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 225 } }),
      { w, shade: "FFFFFF", va: VerticalAlign.CENTER, m: { top: 68, bottom: 68, left: 60, right: 60 },
        b: { top: bd(5, CLINE), bottom: bd(5, CLINE), left: bd(5, CLINE), right: bd(5, CLINE) } });
    const gapC = (w) => cel(p(t(""), { after: 0 }), { w, m: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    return [
    ["2", "They", [t("18~19세기 사람들", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["8", "these paintings", chips2("카메라 이전 그림", "오늘날의 사진", 1900), false],
    ["10", "this tradition", chips2("크게 웃지 않기", "사진 안 찍기", 1900), false],
    ["11", "They", chips2("카메라 쓴 사람들", "사진 속 아이들", 2100), false],
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
  new Paragraph({ children: [t("Step Up! ", { size: 16, bold: true, color: "C3E0DA" }), t("같은 지문을 두 가지 방법으로 다시 만납니다 — 정독(True/False)과 흐름(사건 순서).", { size: 16, color: "C3E0DA" })], spacing: { after: 0, line: 230 } }),
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
    "Most people didn’t smile in photos in the late 18th century.",
    "People smiled a lot at happy events like weddings.",
    "Taking one picture took about 20 minutes.",
    "People could move freely while taking a picture.",
    "Before cameras, people painted pictures to remember special moments.",
    "Many people believed that showing big smiles was appropriate.",
    "They thought that only silly or lower-class people smiled in photos.",
    "The tradition never changed at all.",
  ].map((s, i) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(String(i + 1), { size: 17, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[0], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(s, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: tfw[1], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 150, right: 100 } }),
    cel(new Paragraph({ children: [t("□ T      □ F", { size: 17, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[2], shade: FIELD, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 100, right: 100 } }),
  ] })),
]));
K.push(spF(5, 240, 0.34));

/* ── [DATA] R2 사건 순서 잡기 ── */
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "사진과 그림의 역사 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Cameras were invented, and people continued the tradition.",
      "ⓑ People painted pictures to remember special moments.",
      "ⓒ People sat very still for about 20 minutes for one picture.",
      "ⓓ The tradition slowly began to change."]
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
K.push(...tab("정답 및 해설", "UNIT 14  왜 모두 무표정일까요?", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("In these paintings, big smiles weren’t common.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("people(S)·had to sit(△V)·for a long time(M)   ", { size: 17, bold: true }),
     t("문7 ", { size: 17, bold: true, color: NAVY2 }), t("Before cameras(M)·people(S)·painted(△V)·to remember~(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문13 ", { size: 17, bold: true, color: NAVY2 }), t("the tradition(S)·began(△V)·and[네모]·smiles(S)·became(△V)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 자전거를 타는 것은 쉽다  (2) 그녀는 우유를 사기 위해 가게에 갔다  (3) 새 자전거를 사기 위해 돈을 모으는 것은 중요하다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 smile · photos · tradition   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓒ → ⓓ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 18~19세기 사진 속 사람들이 왜 웃지 않았는지를 긴 촬영 시간(문장 3–5)과 옛 전통(문장 8–11)으로 설명한다. 소재와 이유를 함께 담은 ①이 제목으로 알맞다. ③·④는 지엽적이고, ②·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 8에서 그림 속 큰 미소는 흔하지 않았다(weren’t common)고 했다. 흔했다는 ④는 본문과 반대다. ①은 문장 1, ②는 문장 3, ③은 문장 5, ⑤는 문장 13에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) this tradition은 바로 앞 문장 8–9의 내용, 곧 '큰 미소를 보이지 않는 것'을 가리킨다. this+명사는 앞 내용 전체를 한 번에 받을 수 있다.", true);
Hs("독해 04   배열 영작   ·   In these paintings, big smiles weren’t common.");
B("문장 8을 그대로 복원하는 문제다. ① 첫 글자는 대문자 In.   ② paintings 뒤의 콤마를 빠뜨리지 않는다.   ③ 주어가 복수(big smiles)이므로 weren’t.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 smile · photos · tradition     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 옛날 사진에서 사람들이 웃지 않은 까닭을 설명한다. ① 결혼식은 문장 2의 예시일 뿐이고, ③ 그림 그리는 방법은 나오지 않는다.");
B("1-2   ○표 할 세 단어: smile(힌트① 하지 않은 것) · photos(힌트② 그 일이 일어난 자리) · tradition(힌트③ 이어 가게 한 것). weddings · minutes · paintings는 본문에 나오지만 주제문에는 들어가지 않는다.");
B("1-3   문장 8 — these paintings는 카메라 이전 그림에 ○ (문장 7).   문장 10 — this tradition은 크게 웃지 않기에 ○ (문장 8–9).   문장 11 — They는 카메라 쓴 사람들에 ○ (문장 10).");
B("[학습 포인트]   this/these가 붙으면 반드시 앞 문장에 짝이 있다. 특히 this tradition처럼 앞 내용 전체를 한 단어로 묶는 말에 표시해 두자.", true);

/* ═══════════ [DATA] 해설 2면 — R1 · R2 · 전문 해석 ═══════════ */
K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 2: 결혼식 같은 즐거운 자리에서도 웃지 않았다.   3 T — 문장 3–4.   4 F — 문장 5: 자유롭게 움직인 게 아니라 아주 가만히 앉아 있어야 했다.   5 T — 문장 7.   6 F — 문장 9: 적절하다가 아니라 적절하지 않다고 믿었다.   7 T — 문장 11.   8 F — 문장 13: 전통은 천천히 바뀌기 시작했다.  거짓 문장은 모두 한 요소(smiled a lot, freely, was, never)만 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓐ → ⓒ → ⓓ");
B("ⓑ 카메라 이전에 그림으로 순간을 남긴다(문장 7) → ⓐ 카메라가 발명되고 전통이 이어진다(문장 10) → ⓒ 사진 한 장에 20분씩 가만히 앉아 있는다(문장 3–5) → ⓓ 전통이 천천히 바뀐다(문장 13). 본문은 촬영 시간을 먼저 들려주지만 실제로는 그림의 시대가 더 앞이다 — 서술 순서와 사건 순서가 다른 지점이다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("18세기 후반과 19세기 초반에, 대부분의 사람들은 사진에서 웃지 않았다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 결혼식 같은 즐거운 자리에서도 웃지 않았다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 시절에는, 사진 한 장을 찍는 것이 오늘날보다 훨씬 오래 걸렸다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("사진 한 장을 찍는 데 약 20분이 걸렸다!  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서, 사람들은 오랫동안 아주 가만히 앉아 있어야 했다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("20분 동안 미소를 유지하려고 애쓰는 것을 상상해 보라!  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("카메라가 있기 전에, 사람들은 특별한 순간을 기억하기 위해 그림을 그렸다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 그림들에서, 큰 미소는 흔하지 않았다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("많은 사람들은 큰 미소를 보이는 것이 적절하지 않다고 믿었다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("카메라가 발명되었을 때, 사람들은 이 전통을 이어 갔다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 어리석거나 신분이 낮은 사람들만 사진에서 웃는다고 생각했다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서, 그들은 진지한 얼굴을 유지했다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만, 그 전통은 천천히 바뀌기 시작했고, 미소는 더 흔해졌다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
