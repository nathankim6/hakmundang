/* UNIT 16 — 축구 게임의 새로운 변화 (Level 2)
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
  no: "16",
  title: "축구 게임의 새로운 변화",
  level: "2",
  foot: "UNIT 16  축구 게임의 새로운 변화",
  banner: ["16", "축구 게임의 새로운 변화", "2"],
  timeline: ["1970|레드·옐로 카드|신호등에서 아이디어를 얻어\\n월드컵에 처음 등장하다",
             "2023|흰 카드 등장|포르투갈 경기에서\\n좋은 행동에 처음 주다",
             "지금|한 나라만 사용|FIFA 승인 전이라\\n포르투갈만 쓰고 있다",
             "미래|전 세계로?|페어플레이 문화와 함께\\n퍼져 나갈지 지켜보는 중"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 10문장 ═══════════ */
const SENT = [
  "In soccer games, referees use red and yellow cards when players don’t follow the rules.",
  "But now, there’s a new white card!",
  "This card is for players, coaches, or medical staff who show good behavior.",
  "In Portugal, a referee named Catarina Campos started to use the white card first.",
  "It was introduced during a game between the two teams, Benfica and Sporting Lisbon.",
  "When a person in the crowd got sick, medical staff from both teams quickly went to help.",
  "The referee was moved by their quick response so she gave them a white card!",
  "But, FIFA hasn’t approved the use of the white card yet.",
  "Only Portugal is using white cards in soccer right now.",
  "Do you think it’s a good idea, and should other countries use white cards too?",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3 [C]4–7 [D]8–9 [E]10 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 4: "C", 8: "D", 10: "E" };
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
  3: [RM("This card"), R(" is for players, coaches, or medical staff who show good behavior.  ")],
  5: [RM("It"), R(" was introduced during a game between the two teams, Benfica and Sporting Lisbon.  ")],
  7: [R("The referee was moved by their quick response so "), RM("she"), R(" gave "), RM("them"), R(" a white card!  ")],
  10: [R("Do you think "), RM("it"), R("’s a good idea, and should other countries use white cards too?  ")],
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
  7: [t("The referee was moved by their quick response so she gave ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(" a white card!  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A New White Card for Good Behavior in Soccer", "② The History of Red and Yellow Cards",
 "③ A Famous Soccer Game in Portugal", "④ How to Become a Soccer Referee",
 "⑤ The Best Soccer Players in the World"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Referees use red and yellow cards when players break the rules.",
 "② The white card is for people who show good behavior.",
 "③ Catarina Campos used the white card for the first time.",
 "④ Medical staff from only one team went to help the sick person.",
 "⑤ FIFA hasn’t approved the white card yet."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the medical staff from both teams",
 "② the players on the field",
 "③ the people in the crowd",
 "④ the two team coaches",
 "⑤ the referees in Portugal"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("지금은 오직 포르투갈만 축구에서 흰 카드를 사용하고 있다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 10단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("is / Portugal / white / only / using / cards / right / in / soccer / now", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 2", { size: 14, bold: true, color: AMB }), t("   There is[are] ~ ‘~이 있다’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("there’s", { size: 18, bold: true, color: NAVY }), t(" a new white card", { size: 18, underline: {} }), t("!", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("There is[are]는 '~이 있다'라는 뜻. 뒤에 오는 명사가 진짜 주어예요. '새 흰 카드가 있다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 8", { size: 14, bold: true, color: AMB }), t("   hasn’t+과거분사 ‘아직 ~하지 않았다’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("FIFA ", { size: 18 }), t("hasn’t approved", { size: 18, bold: true, color: NAVY, underline: {} }), t(" the white card ", { size: 18 }), t("yet", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("have[has]+p.p는 한 덩어리의 동사예요. not과 yet이 붙으면 '아직 ~하지 않았다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 2 구문", [t("There’s", { size: 19, bold: true, color: NAVY }), t(" a big park", { size: 19, underline: {} }), t(" near my house.", { size: 19 })]],
 ["문장 8 구문", [t("I ", { size: 19 }), t("haven’t finished", { size: 19, bold: true, color: NAVY, underline: {} }), t(" my homework ", { size: 19 }), t("yet", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("There’s", { size: 19, bold: true, color: NAVY }), t(" a new library", { size: 19, underline: {} }), t(" in town, but I ", { size: 19 }), t("haven’t visited", { size: 19, bold: true, color: NAVY, underline: {} }), t(" it ", { size: 19 }), t("yet", { size: 19, underline: {} }), t(".", { size: 19 })]],
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

/* 먼저 보기 — 다 표시된 문장 (문장 6: 접속사+종속절+M) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || " ", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 6을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([780, 1950, 850, 2800, 760, 590, 1200], [new TableRow({ children: [
    exSeg([t("When", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 780),
    exSeg([t("a person in the crowd", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1950),
    exSeg([t("got sick", { size: 18, bold: true, color: NAVY })], "V′ 동사", NAVY, 850, "△"),
    exSeg([t("medical staff from both teams", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 2800),
    exSeg([t("quickly", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어", MRED, 760),
    exSeg([t("went", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 590, "△"),
    exSeg([t("to help", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1200),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[1, "In soccer games, referees use red and yellow cards when players don’t follow the rules."],
 [5, "It was introduced during a game between the two teams, Benfica and Sporting Lisbon."],
 [9, "Only Portugal is using white cards in soccer right now."]].forEach(([n, c]) => {
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
["① 선수에게 벌을 주는 레드 카드와 옐로 카드", "② 좋은 행동에 주는 새로운 흰 카드", "③ 포르투갈의 유명한 축구 경기"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["white card", "흰 카드"], ["referee", "심판"], ["good behavior", "좋은 행동"], ["Portugal", "포르투갈"], ["medical staff", "의료진"], ["FIFA", "국제축구연맹"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 카드를 받은 사람들  ③ 카드를 주는 까닭 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · this card · she 같은 지시어는 앞에 나온 말을 대신합니다. 같은 문장 안에서도 다른 것을 가리켜요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
      labC("she =", 820), chipC("심판", 1200), gapC(170), chipC("의료진", 1200), gapC(300),
      labC("them =", 930), chipC("심판", 1200), gapC(170), chipC("의료진", 1200),
    ] })]);
    return [
    ["3", "This card", [t("the white card (새 흰 카드)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["5", "It", chips2("the white card", "the game", 1900), false],
    ["7", "she / them", chips8(), false],
    ["10", "it", chips2("흰 카드 사용", "축구 경기", 1900), false],
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
    ["1", [t("Referees use red and yellow cards ", { size: 17 }), t("when", { size: 17, bold: true, color: NAVY, underline: {} }), t(" players don’t follow the rules.", { size: 17 })], ["때", "이유"]],
    ["7", [t("The referee was moved by their quick response ", { size: 17 }), t("so", { size: 17, bold: true, color: NAVY, underline: {} }), t(" she gave them a white card!", { size: 17 })], ["결과", "반전"]],
    ["8", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(", FIFA hasn’t approved the white card yet.", { size: 17 })], ["반전", "순서"]],
    ["10", [t("Do you think it’s a good idea, ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" should other countries use white cards too?", { size: 17 })], ["덧붙임", "결과"]],
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
    chipCellG("질문", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("광고", 1400),
  ] })]),
  { w: W, shade: GREY, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 90, bottom: 90, left: 2450, right: 120 } })] })]));
K.push(sp(115));
function flowCell(seg, top, body, blank) {
  return cel([
    new Paragraph({ children: [t("[" + seg + "]", { size: 14, bold: true, color: SEGCOL[seg] })], alignment: AlignmentType.CENTER, spacing: { after: 32, line: 180 } }),
    blank
      ? new Paragraph({ children: [new TextRun({ text: "          ", size: 16, font: F, underline: {} })], alignment: AlignmentType.CENTER, spacing: { after: 55, line: 260 } })
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
  flowCell("B", null, "문장 3", true),
  arrowCell(),
  flowCell("C", "첫 사용", "문장 4–7", false),
  arrowCell(),
  flowCell("D", "한계", "문장 8–9", false),
  arrowCell(),
  flowCell("E", null, "문장 10", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 새로운 것을 소개하고 사실을 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일을 기록한 일기",
 "④ 안부를 전하는 편지",
 "⑤ 리듬을 살려 쓴 시"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "2", "새로 생긴 카드의 색을 나타낸 말은?", "white", "card 앞 자리", true),
  matRow("2", "3", "카드를 받는 사람들이 보여 주는 행동은?", ["good", "quick"], "behavior 앞 자리", false),
  matRow("3", "3", "선수·코치와 함께 카드를 받을 수 있는 사람들은?", ["medical staff", "referees"], "or 뒤 자리", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("The  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   card is for players, coaches, or  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   who show  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  behavior.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ good behavior.     ⓑ The white card is for     ⓒ who show     ⓓ players, coaches, or medical staff", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓑ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      ⓑ가 맨 앞 — 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("approved        white        Portugal        behavior", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("In soccer, there is a new (1) ____________ card for people who show good (2) ____________. A referee in (3) ____________ used it first. But FIFA hasn’t (4) ____________ it yet.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 1, main: "don’t follow the rules",
    opts: ["① break the rules", "② keep the rules well", "③ make new rules for the game"] },
  { sn: 6, main: "quickly went to help",
    opts: ["① was late to help", "② hurried to help the person", "③ sold tickets to the crowd"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 7, main: "was moved by their quick response",
    opts: ["① was touched by their fast action", "② was angry at their slow action", "③ was tired after the long game"] },
  { sn: 8, main: "hasn’t approved ~ yet",
    opts: ["① has already said OK to it", "② hasn’t said yes to it yet", "③ has made a new soccer team"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 축구 카드의 역사", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("축구의 레드 카드와 옐로 카드는 1970년 멕시코 월드컵에서 처음 쓰였다. 영국 심판 켄 애스턴이 자동차 신호등을 보고 '노란불은 경고, 빨간불은 정지'라는 아이디어를 떠올린 것이다. 말이 통하지 않는 선수에게도 색깔만으로 뜻을 전할 수 있어, 카드는 곧 전 세계 축구의 규칙이 되었다. 흰 카드는 여기서 한 걸음 더 나아가 벌이 아니라 칭찬을 주려는 시도다. 2023년 포르투갈에서 처음 등장한 이 카드가 세계로 퍼질지, 축구 팬들이 지켜보고 있다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
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
    "In soccer games, referees use red and yellow cards.",
    "The white card is for people who show bad behavior.",
    "A referee named Catarina Campos used the white card first.",
    "The white card was introduced during a game in France.",
    "Medical staff from both teams went to help a sick person.",
    "The referee gave the medical staff a red card.",
    "FIFA has already approved the use of the white card.",
    "Only Portugal is using white cards in soccer right now.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "흰 카드가 처음 등장한 날의 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ The referee gave the medical staff a white card.",
      "ⓑ A person in the crowd got sick.",
      "ⓒ Referees used only red and yellow cards in soccer.",
      "ⓓ Medical staff from both teams went to help."]
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
    ["1  referee", "ⓐ to say officially that something is OK"],
    ["2  behavior", "ⓑ an answer or action that comes after something"],
    ["3  crowd", "ⓒ to use or show something for the first time"],
    ["4  introduce", "ⓓ a person who makes sure players follow the rules"],
    ["5  approve", "ⓔ a large group of people in one place"],
    ["6  response", "ⓕ the way a person acts"],
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
[["문장 1", [t("Referees use cards when players ", { size: 19 }), t("( don’t  /  doesn’t )", { size: 19, bold: true, color: NAVY }), t(" follow the rules.", { size: 19 })], "주어 players(복수)에 맞는 형태를 고르세요."],
 ["문장 2", [t("But now, ", { size: 19 }), t("( there’s  /  there are )", { size: 19, bold: true, color: NAVY }), t(" a new white card!", { size: 19 })], "뒤에 오는 명사 a new white card는 단수예요."],
 ["문장 6", [t("Medical staff from both teams quickly ", { size: 19 }), t("( went  /  go )", { size: 19, bold: true, color: NAVY }), t(" to help.", { size: 19 })], "got sick(과거)과 어울리는 시제를 고르세요."],
 ["문장 9", [t("Only Portugal ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" using white cards right now.", { size: 19 })], "주어 Portugal은 하나의 나라 — 단수예요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("behavior  /  countries  /  white  /  help  /  referee  /  rules  /  approved  /  response", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" In soccer games, referees use red and yellow cards when players don’t follow the", { size: 19 }), ...BL(1), t(".  ", { size: 19 }),
  num(2), t(" But now, there’s a new", { size: 19 }), ...BL(2), t("card!  ", { size: 19 }),
  num(3), t(" This card is for players, coaches, or medical staff who show good", { size: 19 }), ...BL(3), t(".  ", { size: 19 }),
  num(4), t(" In Portugal, a", { size: 19 }), ...BL(4), t("named Catarina Campos started to use the white card first.  ", { size: 19 }),
  num(5), t(" It was introduced during a game between the two teams, Benfica and Sporting Lisbon.  ", { size: 19 }),
  num(6), t(" When a person in the crowd got sick, medical staff from both teams quickly went to", { size: 19 }), ...BL(5), t(".  ", { size: 19 }),
  num(7), t(" The referee was moved by their quick", { size: 19 }), ...BL(6), t("so she gave them a white card!  ", { size: 19 }),
  num(8), t(" But, FIFA hasn’t", { size: 19 }), ...BL(7), t("the use of the white card yet.  ", { size: 19 }),
  num(9), t(" Only Portugal is using white cards in soccer right now.  ", { size: 19 }),
  num(10), t(" Do you think it’s a good idea, and should other", { size: 19 }), ...BL(8), t("use white cards too?", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[3, "This card is for players, coaches, or medical staff who show good behavior."],
 [8, "But, FIFA hasn’t approved the use of the white card yet."]].forEach(([n, s], i) => {
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
w7block("1", "하지만 이제, 새로운 흰 카드가 있다!",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마·느낌표에 주의할 것  (총 7단어)",
  "there’s / new / but / a / now / card / white");
w7block("2", "포르투갈에서, 카타리나 캄포스라는 이름의 심판이 흰 카드를 처음으로 사용하기 시작했다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 14단어)",
  "referee / in / named / Catarina / started / Portugal / a / to / Campos / use / white / the / first / card");

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

K.push(...tab("정답 및 해설", "UNIT 16  축구 게임의 새로운 변화", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("Only Portugal is using white cards in soccer right now.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문1 ", { size: 17, bold: true, color: NAVY2 }), t("referees(S)·use(△V)·when[네모]·players(S′)·don’t follow(△V′)   ", { size: 17, bold: true }),
     t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("It(S)·was introduced(△V)·during a game~(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("Portugal(S)·is using(△V)·in soccer·right now(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 우리 집 근처에 큰 공원이 있다  (2) 나는 아직 숙제를 끝내지 못했다  (3) 마을에 새 도서관이 있지만, 나는 아직 그곳에 가 보지 못했다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 white card · medical staff · good behavior        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 때 · 결과 · 반전 · 덧붙임   2-2 [B] 쓰임 · [E] 질문   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓑ → ⓓ → ⓒ → ⓐ  ·  The white card is for players, coaches, or medical staff who show good behavior.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) white  (2) behavior  (3) Portugal  (4) approved        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 1 ①  문장 6 ②  문장 7 ①  문장 8 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7F · 8T        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓒ → ⓑ → ⓓ → ⓐ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓓ · 2ⓕ · 3ⓔ · 4ⓒ · 5ⓐ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) don’t  (2) there’s  (3) went  (4) is", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) rules (2) white (3) behavior (4) referee (5) help (6) response (7) approved (8) countries", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) But now, there’s a new white card!  (2) In Portugal, a referee named Catarina Campos started to use the white card first.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 좋은 행동에 주는 흰 카드(문장 2–3)와 그것이 처음 쓰인 이야기(문장 4–7)를 소개한다. 소재와 특징을 모두 담은 ①이 제목으로 적절하다. ②·③는 지엽적 오답, ④·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 6에서 양 팀(both teams)의 의료진이 도우러 갔다고 했으므로, 한 팀만 갔다는 ④이 본문과 다르다. ①은 문장 1, ②은 문장 3, ③는 문장 4, ⑤는 문장 8에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 문장 6에서 도우러 간 양 팀의 의료진을 가리킨다. 같은 문장의 she(심판)와는 다른 대상이다.", true);
Hs("독해 04   배열 영작");
B("문장 9를 그대로 복원하는 문제다. ① 첫 단어 Only는 대문자.   ② is using — 진행형은 be+~ing 한 덩어리.   ③ right now(바로 지금)는 문장 끝에 놓는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 · 1-3 아래 참조");
B("1-1   정답 ②. 이 글은 좋은 행동에 주는 새 흰 카드를 소개한다. ① 레드·옐로 카드는 도입부의 배경이고, ③ 경기는 흰 카드가 처음 쓰인 무대일 뿐이다.");
B("1-2   ○표 할 세 단어: white card(힌트①) · medical staff(힌트②) · good behavior(힌트③). 나머지 셋(referee · Portugal · FIFA)은 배경일 뿐이다.");
B("1-3   문장 5 — It은 the white card에 ○.   문장 7 — she는 심판, them은 의료진에 ○ (대상이 다르다!).   문장 10 — it은 흰 카드 사용에 ○.");
B("[학습 포인트]   문장 7에서는 she(심판)와 them(의료진)이 한 문장 안에서 다른 대상을 가리킨다. '누가 누구에게?'를 확인하는 습관이 고등 지칭 추론으로 이어진다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 때 / 결과 / 반전 / 덧붙임     2-2 [B] 쓰임 · [E] 질문     2-3 ①");
B("2-1   문장 1 when — 규칙을 지키지 않을 '때' 카드를 쓴다.   문장 7 so — 감동한 '결과'로 카드를 주었다.   문장 8 But — 아직 승인되지 않았다는 '반전'.   문장 10 and — 두 질문을 나란히 '덧붙임'.");
B("2-2   [B] 쓰임(문장 3: 누구에게 주는 카드인가), [E] 질문(문장 10: 독자에게 묻는 마무리). 보기의 '광고'는 이 글에 없는 역할이다. [A] 소개 → [B] 쓰임 → [C] 첫 사용 → [D] 한계 → [E] 질문 — 새것을 소개하는 설명문의 전형적인 흐름이다.");
B("2-3   정답 ①. 새로운 것(흰 카드)을 소개하고 사실을 알려 주는 설명문이다(문장 1–3의 현재시제, 대상의 이름과 쓰임). ② 광고의 신호(가격·사라는 말)가 없고, ③ 일기·④ 편지·⑤ 시의 형식도 아니다.");
B("[학습 포인트]   마무리의 질문(문장 10)은 글쓴이가 독자를 생각에 초대하는 장치다. 설명문 끝의 물음표를 만나면 '나라면 어떻게 답할까?'까지 생각해 보자.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 good · medical staff     3-3 ⓑ → ⓓ → ⓒ → ⓐ");
B("3-1  재료 찾기 — (2) 문장 3에서 good에 ○: 카드를 주는 까닭이 되는 행동의 성격이다. quick은 문장 7 의료진의 반응일 뿐. (3) 문장 3에서 medical staff에 ○: referees는 카드를 '주는' 쪽이지 받는 쪽이 아니다.");
B("3-2  뼈대 채우기 — (1) white  (2) good  (3) medical staff.  넣으면 The white card is for players, coaches, or medical staff who show good behavior.가 완성된다.");
B("3-3  정답 순서 — ⓑ The white card is for → ⓓ players, coaches, or medical staff → ⓒ who show → ⓐ good behavior.");
B("[채점 포인트]  주인공 The white card(ⓑ)가 주어로 맨 앞, 마침표가 붙은 덩어리(ⓐ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) white  (2) behavior  (3) Portugal  (4) approved");
B("(1)은 문장 2의 white, (2)는 문장 3의 behavior, (3)은 문장 4의 Portugal, (4)는 문장 8의 approved에서 가져온다. 요약문이 곧 이 글의 흐름이다: 새 카드(1) → 쓰임(2) → 첫 사용(3) → 한계(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 1 ①   문장 6 ②   문장 7 ①   문장 8 ②  (정답 선지는 무표시)");
B("문장 1 don’t follow the rules   ① ○ break the rules = 규칙을 어기다.   ② ✕ [반대] 규칙을 잘 지킨다 — 정반대.   ③ ✕ [무관] 새 규칙을 만든다는 말은 지문에 없다.");
B("문장 6 quickly went to help   ① ✕ [반대] 늦게 갔다 — 정반대.   ② ○ hurried to help = 서둘러 도우러 갔다.   ③ ✕ [무관] 표를 팔았다는 말은 지문에 없다.");
B("문장 7 was moved by their quick response   ① ○ was touched by their fast action = 빠른 행동에 감동했다.   ② ✕ [반대] 느린 행동에 화가 났다 — 정반대.   ③ ✕ [무관] 피곤했다는 말은 지문에 없다.");
B("문장 8 hasn’t approved ~ yet   ① ✕ [반대] 이미 승인했다 — 정반대.   ② ○ 아직 허락하지 않았다.   ③ ✕ [무관] 새 팀을 만들었다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. don’t follow = break, quickly = hurried처럼 짝을 지어 두자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 F · 8 T");
B("1 T — 문장 1.   2 F — 문장 3: 나쁜 행동이 아니라 좋은(good) 행동에 주는 카드다.   3 T — 문장 4.   4 F — 문장 4·5: 프랑스가 아니라 포르투갈의 경기였다.   5 T — 문장 6.   6 F — 문장 7: 레드 카드가 아니라 흰(white) 카드를 주었다.   7 F — 문장 8: 아직(yet) 승인하지 않았다.   8 T — 문장 9.  거짓 문장은 모두 본문에서 딱 한 단어(bad, France, red, already)를 비튼 것이다 — 그 한 단어를 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   (c) → (b) → (d) → (a)");
B("ⓒ 심판들이 레드·옐로 카드만 쓰던 시절(문장 1) → ⓑ 관중 한 명이 아팠다(문장 6) → ⓓ 양 팀 의료진이 도우러 갔다(문장 6) → ⓐ 심판이 흰 카드를 주었다(문장 7). 본문은 새 카드(문장 2–3)를 먼저 소개하고 그날의 이야기를 나중에 들려준다 — 서술 순서와 사건 순서가 다른 지점을 잡는 것이 핵심이다.", true);
Hs("R3   영영풀이   ·   1 (d) · 2 (f) · 3 (e) · 4 (c) · 5 (a) · 6 (b)");
B("referee = 선수들이 규칙을 지키는지 확인하는 사람 · behavior = 사람이 행동하는 방식 · crowd = 한곳에 모인 많은 사람들 · introduce = 처음으로 사용하거나 선보이다 · approve = 공식적으로 좋다고 말하다 · response = 어떤 일 뒤에 나오는 대답이나 행동.", true);
Hs("R4   어법 기초   ·   (1) don’t  (2) there’s  (3) went  (4) is");
B("(1) 주어 players는 복수 — don’t.   (2) 뒤에 오는 진짜 주어 a new white card가 단수 — there’s. 2면 구문에서 배운 그 문장이다.   (3) got sick(과거)과 시제를 맞춘다 — went.   (4) 주어 Portugal은 단수, be+~ing 진행형 — is.", true);
Hs("R5   빈칸 클로즈   ·   (1) rules (2) white (3) behavior (4) referee (5) help (6) response (7) approved (8) countries");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: follow the ___ ← 지키는 것, a new ___ card ← 새 카드의 색, show good ___ ← 카드를 받는 까닭, hasn’t ___ yet ← FIFA가 아직 안 한 일. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 이 카드는 좋은 행동을 보여 주는 선수, 코치, 또는 의료진을 위한 것이다.  — who 이하가 앞의 명사들을 뒤에서 꾸민다.");
B("(2) 하지만, FIFA는 아직 흰 카드의 사용을 승인하지 않았다.  — hasn’t+p.p ~ yet을 '아직 ~하지 않았다'로 옮기는 것이 핵심이다.", true);
Hs("R7   조건 영작   ·   (1) But now, there’s a new white card!  (2) In Portugal, a referee named Catarina Campos started to use the white card first.");
B("(1) 문장 2의 복원. ㄱ 첫 글자 대문자 But  ㄴ now 뒤의 콤마  ㄷ 문장 끝은 느낌표.");
B("(2) 문장 4의 복원. ㄱ 첫 글자 대문자 In, Portugal 뒤의 콤마  ㄴ a referee named Catarina Campos — named가 명사를 뒤에서 수식  ㄷ started to use — to부정사가 이어진다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("축구 경기에서, 심판은 선수들이 규칙을 지키지 않을 때 레드 카드와 옐로 카드를 사용한다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 이제, 새로운 흰 카드가 있다!  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 카드는 좋은 행동을 보여 주는 선수, 코치, 또는 의료진을 위한 것이다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("포르투갈에서, 카타리나 캄포스라는 이름의 심판이 흰 카드를 처음으로 사용하기 시작했다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 벤피카와 스포르팅 리스본, 두 팀 간의 경기 중에 도입되었다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("관중석의 한 사람이 아팠을 때, 양 팀의 의료진이 재빨리 도우러 갔다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("심판은 그들의 빠른 반응에 감동해서 그들에게 흰 카드를 주었다!  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만, FIFA는 아직 흰 카드의 사용을 승인하지 않았다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("지금은 오직 포르투갈만 축구에서 흰 카드를 사용하고 있다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("여러분은 그것이 좋은 생각이라고 생각하는가, 그리고 다른 나라들도 흰 카드를 사용해야 할까?", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
