/* UNIT 11 — 냄새만 맡아도 위험해요! (Level 2) · 축약 유닛(5면)
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
  no: "11",
  title: "냄새만 맡아도 위험해요!",
  level: "2",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 11  냄새만 맡아도 위험해요!",
  banner: ["11", "냄새만 맡아도 위험해요!", "2"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "The Alnwick Garden in England is famous worldwide.",
  "However, don’t stop to smell the flowers in its Poison Garden — they can actually poison you!",
  "The 1st Duke of Northumberland created the Alnwick Garden in 1750.",
  "It was passed down in the family for years.",
  "But over time, the garden was forgotten.",
  "In 1995, Jane Percy, the 12th Duke’s wife, decided to recreate the garden.",
  "She made it more beautiful than before.",
  "Then in 2005, Jane added a special garden called “the Poison Garden.”",
  "It’s filled with over 100 different poisonous plants.",
  "Some of the plants are even kept in cages for safety.",
  "Signs in the Poison Garden warn visitors not to touch or smell anything.",
  "But despite the dangers, the Alnwick Garden attracts over 600,000 visitors every year.",
  "Jane hopes the garden will teach people about the good and bad effect of plants.",
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
  2: [R("However, don’t stop to smell the flowers in its Poison Garden — "), RM("they"), R(" can actually poison you!  ")],
  4: [RM("It"), R(" was passed down in the family for years.  ")],
  7: [RM("She"), R(" made it more beautiful than before.  ")],
  9: [RM("It"), R("’s filled with over 100 different poisonous plants.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u11.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  9: [t("(A) ", { size: 19, bold: true }), t("It", { size: 19, bold: true, underline: {} }),
      t("’s filled with over 100 different poisonous plants.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A Garden Full of Poisonous Plants", "② How to Grow Beautiful Flowers at Home",
 "③ The Long History of English Dukes", "④ Safety Rules for Every Public Park",
 "⑤ Jane Percy’s Favorite Flowers"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① The 1st Duke of Northumberland created the Alnwick Garden in 1750.",
 "② Over time, the Alnwick Garden was forgotten.",
 "③ Jane Percy added the Poison Garden in 1995.",
 "④ Some of the poisonous plants are kept in cages.",
 "⑤ The Alnwick Garden attracts over 600,000 visitors every year."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) It이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the Poison Garden",
 "② the whole Alnwick Garden",
 "③ Jane Percy’s family",
 "④ the 1st Duke of Northumberland",
 "⑤ a cage for safety"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그녀는 그것을 전보다 더 아름답게 만들었다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 7단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("than / she / beautiful / it / before / made / more", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 8", { size: 14, bold: true, color: AMB }), t("   과거분사 called의 명사 수식", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("a special garden ", { size: 18 }), t("called", { size: 18, bold: true, color: NAVY }), t(" “the Poison Garden”", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("called 이하가 앞의 명사 garden을 뒤에서 꾸밉니다. ''독 정원'이라고 불리는 특별한 정원'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 9", { size: 14, bold: true, color: AMB }), t("   수동태 be + 과거분사", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("It’s ", { size: 18 }), t("filled", { size: 18, bold: true, color: NAVY, underline: {} }), t(" with over 100 poisonous plants", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+과거분사는 '~되다'라는 뜻입니다. be filled with는 '~로 가득 차 있다'!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 8 구문", [t("I have a dog ", { size: 19 }), t("called", { size: 19, bold: true, color: NAVY }), t(" Coco", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 9 구문", [t("The box ", { size: 19 }), t("is filled", { size: 19, bold: true, color: NAVY, underline: {} }), t(" with old toys.", { size: 19 })]],
 ["둘 다!", [t("A room ", { size: 19 }), t("called", { size: 19, bold: true, color: NAVY }), t(" the attic", { size: 19, underline: {} }), t(" ", { size: 19 }), t("is filled", { size: 19, bold: true, color: NAVY, underline: {} }), t(" with old books.", { size: 19 })]],
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

/* [DATA] 먼저 보기 — 다 표시된 문장 (문장 11: S + M + V + 목적어 + M) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || "\u00A0", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 11을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([750, 2550, 650, 1100, 3880], [new TableRow({ children: [
    exSeg([t("Signs", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 750),
    exSeg([t("in the Poison Garden", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2550),
    exSeg([t("warn", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 650, "△"),
    exSeg([t("visitors", { size: 18 })], "", FAINT, 1100),
    exSeg([t("not to touch or smell anything.", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 3880),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[5, "But over time, the garden was forgotten."],
 [12, "But despite the dangers, the Alnwick Garden attracts over 600,000 visitors every year."],
 [13, "Jane hopes the garden will teach people about the good and bad effect of plants."]].forEach(([n, c]) => {
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
["① 영국 공작 가문의 역사", "② 독이 있는 식물로 가득한 정원", "③ 꽃향기를 즐기는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["plants", "식물"], ["poisonous", "독이 있는"], ["visitors", "방문객"], ["cages", "우리"], ["England", "영국"], ["Duke", "공작"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 정원을 채운 것  ② 그것들의 성질  ③ 그래도 찾아오는 사람들 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · she 같은 지시어는 앞에 나온 말을 대신합니다. 같은 It이라도 앞뒤에서 다른 정원을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2350, 6950];
const ahd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(aw, [
  thead(["문장", "지시어", "무엇을 가리키는가 \u2014 하나에 \u25cb표"], aw),
  ...(() => {
    const chipC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16 })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 225 } }),
      { w, shade: "FFFFFF", va: VerticalAlign.CENTER, m: { top: 68, bottom: 68, left: 60, right: 60 },
        b: { top: bd(5, CLINE), bottom: bd(5, CLINE), left: bd(5, CLINE), right: bd(5, CLINE) } });
    const gapC = (w) => cel(p(t(""), { after: 0 }), { w, m: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    return [
    ["2", "they", [t("독 정원의 꽃들 (the flowers)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "It", chips2("앨른윅 정원", "독 정원", 1900), false],
    ["7", "She", chips2("제인 퍼시", "공작의 딸", 1900), false],
    ["9", "It", chips2("독 정원", "앨른윅 정원", 2100), false],
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
    "The Alnwick Garden in England is famous worldwide.",
    "The 1st Duke of Northumberland created the garden in 1750.",
    "The garden was never forgotten over time.",
    "Jane Percy decided to recreate the garden in 1995.",
    "Jane added the Poison Garden in 1985.",
    "The Poison Garden has over 100 different poisonous plants.",
    "Signs in the Poison Garden tell visitors to smell the flowers.",
    "Fewer than 100,000 visitors come to the garden every year.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "앨른윅 정원에 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Jane Percy decided to recreate the garden.",
      "ⓑ The 1st Duke of Northumberland created the Alnwick Garden.",
      "ⓒ Jane added a special garden called “the Poison Garden.”",
      "ⓓ Over time, the garden was forgotten."]
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
K.push(...tab("정답 및 해설", "UNIT 11  냄새만 맡아도 위험해요!", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("She made it more beautiful than before.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("But[네모]·over time(M)·the garden(S)·was forgotten(△V)   ", { size: 17, bold: true }),
     t("문12 ", { size: 17, bold: true, color: NAVY2 }), t("despite the dangers(M)·the Alnwick Garden(S)·attracts(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문13 ", { size: 17, bold: true, color: NAVY2 }), t("Jane(S)·hopes(△V)·the garden(S′)·will teach(△V′)·people", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 코코라고 불리는 개를 기른다  (2) 그 상자는 오래된 장난감으로 가득 차 있다  (3) 다락방이라고 불리는 방이 오래된 책으로 가득 차 있다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 plants · poisonous · visitors   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4T · 5F · 6T · 7F · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓐ → ⓒ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 앨른윅 정원 안에 있는 '독 정원'(문장 2, 8–10)과 그곳을 찾는 사람들(문장 12–13)을 소개한다. 소재(정원)와 특징(독이 있는 식물)을 함께 담은 ①이 제목으로 적절하다. ③·⑤는 공작 가문·인물만 건드린 지엽적 오답, ②·④은 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 6에서 1995년에 한 일은 정원을 되살리기로 결심한 것이고, 독 정원을 더한 것은 문장 8의 2005년이다. 연도가 뒤바뀐 ③이 본문과 다르다. ①은 문장 3, ②은 문장 5, ④은 문장 10, ⑤는 문장 12에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) It은 바로 앞 문장 8에서 제인이 새로 더한 '독 정원'을 가리킨다. 문장 4의 It(앨른윅 정원 전체)과 철자는 같지만 대상이 다르다 — 지시어는 늘 바로 앞에서 짝을 찾아야 한다.", true);
Hs("독해 04   배열 영작   ·   She made it more beautiful than before.");
B("문장 7을 그대로 복원하는 문제다. ① 첫 글자는 대문자 She.   ② make + 목적어 + 형용사 — '그것을 아름답게 만들다'.   ③ 비교급은 more beautiful, 그 뒤에 than before.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 plants · poisonous · visitors     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 독이 있는 식물로 가득한 정원을 소개한다. ① 공작 가문은 유래를 설명하는 배경이고, ③ 꽃향기를 즐기라는 말은 오히려 하지 말라고 한다.");
B("1-2   ○표 할 세 단어: plants(힌트① 이 정원을 채운 것) · poisonous(힌트② 그것들의 성질) · visitors(힌트③ 그래도 찾아오는 사람들). 나머지 셋(cages · England · Duke)은 본문에 등장하지만 주제문에 들어가지 않는다 — 장치와 배경일 뿐이다. 빈도가 아니라 '주제문에 없으면 말이 안 되는 말'을 고르는 것이 기준이다.");
B("1-3   문장 4 — It은 앨른윅 정원에 ○ (문장 3에서 만든 그 정원).   문장 7 — She는 제인 퍼시에 ○ (문장 6의 인물).   문장 9 — It은 독 정원에 ○ (문장 8에서 새로 더한 정원).");
B("[학습 포인트]   같은 It이 문장 4에서는 앨른윅 정원 전체를, 문장 9에서는 그 안의 독 정원을 가리킨다. 대명사를 만나면 '바로 앞 문장의 주인공이 누구였지?'를 확인하는 습관을 들이자.", true);

/* ═══════════ [DATA] 해설 2면 — R1 · R2 · 전문 해석 ═══════════ */
K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 T · 5 F · 6 T · 7 F · 8 F");
B("1 T — 문장 1.   2 T — 문장 3.   3 F — 문장 5: 잊히지 않은 게 아니라 잊혔다(was forgotten).   4 T — 문장 6.   5 F — 문장 8: 1985년이 아니라 2005년이다.   6 T — 문장 9.   7 F — 문장 11: 냄새를 맡으라는 게 아니라 만지지도 냄새 맡지도 말라고(not to) 경고한다.   8 F — 문장 12: 10만 명 미만이 아니라 60만 명이 넘는다.  거짓 문장은 모두 딱 한 요소(never, 1985, to smell, Fewer than)를 비튼 것이다 — 그 한 부분을 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓐ → ⓒ");
B("ⓑ 1750년에 초대 공작이 정원을 만든다(문장 3) → ⓓ 세월이 흐르며 잊힌다(문장 5) → ⓐ 1995년에 제인이 되살리기로 결심한다(문장 6) → ⓒ 2005년에 독 정원을 더한다(문장 8). 연도가 그대로 순서표가 되는 글이다 — 숫자가 나오면 먼저 동그라미를 치자.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("영국의 앨른윅 정원은 전 세계적으로 유명하다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만, 그곳의 독 정원에서는 멈춰 서서 꽃향기를 맡지 마라 — 그 꽃들은 정말로 여러분을 중독시킬 수 있다!  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("노섬벌랜드의 초대 공작이 1750년에 앨른윅 정원을 만들었다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 여러 해 동안 그 가문에서 대물림되었다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그러나 시간이 흐르면서, 그 정원은 잊혔다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("1995년에, 12대 공작의 아내인 제인 퍼시가 그 정원을 되살리기로 결심했다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그녀는 그것을 전보다 더 아름답게 만들었다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그러고 나서 2005년에, 제인은 '독 정원'이라고 불리는 특별한 정원을 더했다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그곳은 100가지가 넘는 서로 다른 독성 식물들로 가득 차 있다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 식물들 중 일부는 안전을 위해 우리 안에 보관되기까지 한다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("독 정원의 표지판들은 방문객에게 어떤 것도 만지거나 냄새 맡지 말라고 경고한다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 그 위험에도 불구하고, 앨른윅 정원은 해마다 60만 명이 넘는 방문객을 끌어들인다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("제인은 그 정원이 사람들에게 식물의 좋은 영향과 나쁜 영향을 가르쳐 주기를 바란다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
