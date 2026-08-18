/* UNIT 30 — 오토바이 운전자의 새로운 친구 (Level 1) · 축약 유닛(5면)
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
  no: "30",
  title: "오토바이 운전자의 새로운 친구",
  level: "1",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 30  오토바이 운전자의 새로운 친구",
  banner: ["30", "오토바이 운전자의 새로운 친구", "1"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "Riding a motorcycle is much more dangerous than driving a car.",
  "Motorcycle riders can have serious accidents.",
  "But now, there’s good news for riders: special jeans called “airbag jeans.”",
  "Many injuries from serious motorcycle accidents happen to the lower body.",
  "So, most motorcycle pants usually protect the knees and hips.",
  "But the airbag jeans help protect new areas on the lower body, especially the tailbone.",
  "These jeans are made from the strongest denim in the world.",
  "And here’s the best part: They have airbags inside!",
  "If a rider falls off his motorcycle, the airbags blow up.",
  "These airbags protect the rider from getting hurt.",
  "The airbag jeans help keep riders safe, and are as comfortable as regular pants.",
  "Riders can also use them many times!",
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
  7: [RM("These jeans"), R(" are made from the strongest denim in the world.  ")],
  9: [R("If a rider falls off "), RM("his"), R(" motorcycle, the airbags blow up.  ")],
  10: [RM("These airbags"), R(" protect the rider from getting hurt.  ")],
  12: [R("Riders can also use "), RM("them"), R(" many times!  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u30.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  12: [t("Riders can also use ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(" many times!  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Safe and Comfortable: Jeans with Airbags", "② How to Ride a Motorcycle Fast",
 "③ The History of Blue Denim", "④ Why Cars Are Cheaper Than Motorcycles",
 "⑤ The Best Knee Pads for Riders"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Riding a motorcycle is more dangerous than driving a car.",
 "② Many injuries from serious accidents happen to the lower body.",
 "③ The airbag jeans are made from the weakest denim in the world.",
 "④ The airbags blow up when a rider falls off his motorcycle.",
 "⑤ Riders can use the airbag jeans many times."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the airbag jeans",
 "② their motorcycles",
 "③ regular pants",
 "④ the knees and hips",
 "⑤ serious accidents"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("이 에어백들은 타는 사람이 다치지 않게 보호해 준다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("hurt. / protect / These / from / rider / airbags / the / getting", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 1", { size: 14, bold: true, color: AMB }), t("   동명사 주어 — '~하는 것은'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Riding a motorcycle", { size: 18, bold: true, color: NAVY, underline: {} }), t(" is much more dangerous", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사+~ing가 주어 자리에 오면 '~하는 것은'. 한 덩어리로 단수 취급합니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 7", { size: 14, bold: true, color: AMB }), t("   수동태 be+p.p — '~로 만들어지다'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("These jeans ", { size: 18 }), t("are made", { size: 18, bold: true, color: NAVY, underline: {} }), t(" from the strongest denim", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+과거분사는 '~되다'. from 뒤에 재료가 옵니다. '데님으로 만들어진다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 1 구문", [t("Reading comic books", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is a lot of fun.", { size: 19 })]],
 ["문장 7 구문", [t("This desk ", { size: 19 }), t("is made", { size: 19, bold: true, color: NAVY, underline: {} }), t(" from old wood.", { size: 19 })]],
 ["둘 다!", [t("Riding a bike", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is easy, and my bike ", { size: 19 }), t("is made", { size: 19, bold: true, color: NAVY, underline: {} }), t(" from light metal.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 9를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([700, 1350, 1300, 2200, 1550, 1830], [new TableRow({ children: [
    exSeg([t("If", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 700),
    exSeg([t("a rider", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1350),
    exSeg([t("falls off", { size: 18, bold: true, color: NAVY })], "V′ 동사", NAVY, 1300, "△"),
    exSeg([t("his motorcycle,", { size: 18 })], "", FAINT, 2200),
    exSeg([t("the airbags", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1550),
    exSeg([t("blow up.", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1830, "△"),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[1, "Riding a motorcycle is much more dangerous than driving a car."],
 [5, "So, most motorcycle pants usually protect the knees and hips."],
 [11, "The airbag jeans help keep riders safe, and are as comfortable as regular pants."]].forEach(([n, c]) => {
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
["① 오토바이를 빨리 타는 방법", "② 에어백이 들어 있는 특별한 청바지", "③ 세계에서 가장 튼튼한 데님을 짜는 법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["jeans", "청바지"], ["safe", "안전한"], ["comfortable", "편안한"], ["denim", "데님"], ["knees", "무릎"], ["accidents", "사고"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 이 옷이 해 주는 일  ③ 입었을 때의 느낌 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      these · his · them 같은 지시어는 앞에 나온 말을 대신합니다. 사람도, 물건도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    return [
    ["7", "These jeans", [t("the airbag jeans (에어백 청바지)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["9", "his", chips2("타는 사람의", "정비사의", 1900), false],
    ["10", "These airbags", chips2("에어백들", "무릎 보호대", 1900), false],
    ["12", "them", chips2("에어백 청바지", "오토바이들", 2100), false],
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
    "Riding a motorcycle is much more dangerous than driving a car.",
    "Many injuries from serious accidents happen to the upper body.",
    "Most motorcycle pants usually protect the knees and hips.",
    "The airbag jeans protect new areas, especially the tailbone.",
    "These jeans are made from the weakest denim in the world.",
    "The airbags blow up when a rider falls off his motorcycle.",
    "The airbag jeans are heavier and harder than regular pants.",
    "Riders can use the airbag jeans only one time.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "에어백 청바지가 쓰이는 일 ⓐ~ⓓ를 일어나는 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ The airbags blow up right away.",
      "ⓑ A rider puts on the airbag jeans.",
      "ⓒ The rider uses the same jeans again later.",
      "ⓓ The rider falls off his motorcycle."]
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
K.push(...tab("정답 및 해설", "UNIT 30  오토바이 운전자의 새로운 친구", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("These airbags protect the rider from getting hurt.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문1 ", { size: 17, bold: true, color: NAVY2 }), t("Riding a motorcycle(S)·is(△V)·than driving a car(M)   ", { size: 17, bold: true }),
     t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("most motorcycle pants(S)·usually(M)·protect(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문11 ", { size: 17, bold: true, color: NAVY2 }), t("The airbag jeans(S)·help keep·are(△V)·as comfortable as regular pants(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 만화책을 읽는 것은 아주 재미있다  (2) 이 책상은 오래된 나무로 만들어졌다  (3) 자전거를 타는 것은 쉽고, 내 자전거는 가벼운 금속으로 만들어졌다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 jeans · safe · comfortable   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4T · 5F · 6T · 7F · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓐ → ⓒ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 오토바이 사고에서 몸을 지켜 주는 에어백 청바지(문장 3·6–10)와 일반 바지처럼 편안하다는 장점(문장 11–12)을 소개한다. 소재(에어백 청바지)와 특징(안전하고 편안함)을 담은 ①이 제목이다. ③·⑤는 지엽적 오답, ②·④는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 7에서 이 청바지는 세계에서 가장 튼튼한(strongest) 데님으로 만들어진다. 가장 약한 데님이라고 한 ③이 본문과 반대된다. ①은 문장 1, ②는 문장 4, ④는 문장 9, ⑤는 문장 12에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 앞에서 계속 이야기해 온 에어백 청바지를 가리킨다. 여러 번 다시 쓸 수 있는 것이 무엇인지 생각하면 된다 — 지시어는 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   These airbags protect the rider from getting hurt.");
B("문장 10을 그대로 복원하는 문제다. ① 첫 글자는 대문자 These.   ② 주어가 복수이므로 동사는 protect.   ③ protect A from B(‘A를 B로부터 지키다’)의 from 자리를 지킨다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 jeans · safe · comfortable     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 에어백이 들어 있는 특별한 청바지를 소개한다. ① 타는 방법은 나오지 않고, ③ 데님은 이 청바지의 재료일 뿐이다.");
B("1-2   ○표 할 세 단어: jeans(힌트① 주인공) · safe(힌트② 이 옷이 해 주는 일) · comfortable(힌트③ 입었을 때의 느낌). 나머지 셋(denim · knees · accidents)은 본문에 나오지만 주제문에 들어가지 않는다 — 재료와 배경일 뿐이다.");
B("1-3   문장 9 — his는 타는 사람의에 ○ (a rider의 오토바이).   문장 10 — These airbags는 에어백들에 ○ (문장 8의 청바지 속 에어백).   문장 12 — them은 에어백 청바지에 ○.");
B("[학습 포인트]   these·this가 붙으면 반드시 앞 문장에 짝이 있다. 소유격 his도 지시어처럼 '누구의 것인지'를 앞에서 찾아야 뜻이 또렷해진다.", true);

/* ═══════════ [DATA] 해설 2면 — R1 · R2 · 전문 해석 ═══════════ */
K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 T · 5 F · 6 T · 7 F · 8 F");
B("1 T — 문장 1.   2 F — 문장 4: 상체(upper)가 아니라 하체(lower body)에 부상이 많다.   3 T — 문장 5.   4 T — 문장 6.   5 F — 문장 7: 가장 약한(weakest)이 아니라 가장 튼튼한(strongest) 데님이다.   6 T — 문장 9.   7 F — 문장 11: 일반 바지만큼 편안하다.   8 F — 문장 12: 한 번이 아니라 여러 번 쓸 수 있다.  거짓 문장은 모두 딱 한 요소(upper, weakest, heavier, only one time)를 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓐ → ⓒ");
B("ⓑ 라이더가 에어백 청바지를 입는다 → ⓓ 오토바이에서 떨어진다(문장 9) → ⓐ 에어백이 곧바로 부풀어 오른다(문장 9) → ⓒ 나중에 같은 청바지를 다시 쓴다(문장 12). '여러 번 쓸 수 있다'는 마지막 문장이 곧 마지막 단계라는 것을 잡아내는 것이 핵심이다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("오토바이를 타는 것은 자동차를 운전하는 것보다 훨씬 더 위험하다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("오토바이를 타는 사람들은 심각한 사고를 당할 수 있다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 이제, 라이더들에게 좋은 소식이 있다: ‘에어백 청바지’라고 불리는 특별한 청바지다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("심각한 오토바이 사고로 인한 부상의 상당수는 하체에 생긴다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서, 대부분의 오토바이 바지는 보통 무릎과 엉덩이를 보호한다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 에어백 청바지는 하체의 새로운 부위, 특히 꼬리뼈를 보호해 준다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 청바지는 세계에서 가장 튼튼한 데님으로 만들어진다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그리고 가장 좋은 점은 이것이다: 안에 에어백이 들어 있다!  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("라이더가 오토바이에서 떨어지면, 그 에어백이 부풀어 오른다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 에어백들은 타는 사람이 다치지 않게 보호해 준다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("에어백 청바지는 라이더를 안전하게 지켜 주고, 일반 바지만큼 편안하다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("게다가 라이더들은 그것을 여러 번 쓸 수 있다!", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
