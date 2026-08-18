/* UNIT 19 — 알래스카의 한 마을에 닥친 위험 (Level 2)
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
  no: "19",
  title: "알래스카의 한 마을에 닥친 위험",
  level: "2",
  foot: "UNIT 19  알래스카의 한 마을에 닥친 위험",
  banner: ["19", "알래스카의 한 마을에 닥친 위험", "2"],
  timeline: ["과거|늘 얼어 있던 땅|추운 날씨 덕분에\\n단단하게 유지되다",
             "현재|따뜻해진 지구|얼음이 녹아 집과\\n도로가 흔들리다|sun",
             "결정|마을의 이사|더 안전한 곳으로\\n옮기기로 하다|city",
             "미래|또 다른 뉴톡?|더 많은 마을이 같은\\n위험을 마주할지도|drop_x"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 14문장 ═══════════ */
const SENT = [
  "Newtok is a small village in the Arctic area.",
  "It is on the west coast of Alaska, U.S.",
  "Because of climate change, Newtok is facing a big problem.",
  "Newtok is on land called permafrost.",
  "It’s a kind of soil that stays frozen all the time.",
  "For a very long time, the land didn’t melt thanks to the cold weather.",
  "But, the weather is getting warmer very fast.",
  "This is making the ice inside the permafrost melt.",
  "When permafrost melts, this can break buildings and roads.",
  "In fact, houses in Newtok shake when people walk inside them.",
  "That’s why Newtok has to move to a safer place.",
  "The people of Newtok feel both sad and relieved about it.",
  "Newtok became one of the first villages to move because of climate change.",
  "Sadly, more villages might be like Newtok in the future.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4–6 [C]7–9 [D]10–12 [E]13–14 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 7: "C", 10: "D", 13: "E" };
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
  2: [RM("It"), R(" is on the west coast of Alaska, U.S.  ")],
  5: [RM("It"), R("’s a kind of soil that stays frozen all the time.  ")],
  8: [RM("This"), R(" is making the ice inside the permafrost melt.  ")],
  10: [R("In fact, houses in Newtok shake when people walk inside "), RM("them"), R(".  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u19.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  10: [t("In fact, houses in Newtok shake when people walk inside ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(".  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A Village That Has to Move Because of Climate Change", "② The Beautiful Winter Weather of Alaska",
 "③ How to Build Safe Houses on Frozen Land", "④ Fun Things to Do in the Arctic",
 "⑤ Why People Love Village Life"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Newtok is a small village on the west coast of Alaska.",
 "② Permafrost is a kind of soil that stays frozen all the time.",
 "③ Houses in Newtok shake when people walk inside them.",
 "④ The people of Newtok feel only sad about the move.",
 "⑤ More villages might be like Newtok in the future."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① houses in Newtok",
 "② the people of Newtok",
 "③ buildings and roads",
 "④ safer places in Alaska",
 "⑤ other villages in the Arctic"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("하지만, 날씨가 매우 빠르게 따뜻해지고 있다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("getting / the / but / warmer / is / very / weather / fast", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   과거분사 called의 명사 수식", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("land ", { size: 18 }), t("called", { size: 18, bold: true, color: NAVY }), t(" permafrost", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("called 이하가 앞의 명사 land를 뒤에서 꾸밉니다. '영구 동토층이라고 불리는 땅'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   have(has) to '~해야 한다' (의무)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Newtok ", { size: 18 }), t("has to move", { size: 18, bold: true, color: NAVY, underline: {} }), t(" to a safer place", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("have(has) to+동사원형이 '~해야 한다'는 의무를 나타냅니다. '이사해야 한다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("She has a cat ", { size: 19 }), t("called", { size: 19, bold: true, color: NAVY }), t(" “Nabi.”", { size: 19, underline: {} })]],
 ["문장 11 구문", [t("He ", { size: 19 }), t("has to finish", { size: 19, bold: true, color: NAVY, underline: {} }), t(" his homework today.", { size: 19 })]],
 ["둘 다!", [t("I ", { size: 19 }), t("have to walk", { size: 19, bold: true, color: NAVY, underline: {} }), t(" a dog ", { size: 19 }), t("called", { size: 19, bold: true, color: NAVY }), t(" “Happy”", { size: 19, underline: {} }), t(" every day.", { size: 19 })]],
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

/* [DATA] 먼저 보기 — 다 표시된 문장 (문장 9: 접속사 문두 + 조동사 덩어리) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || " ", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 9를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1000, 1560, 1000, 800, 1400, 3170], [new TableRow({ children: [
    exSeg([t("When", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 1000),
    exSeg([t("permafrost", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1560),
    exSeg([t("melts,", { size: 18, bold: true, color: NAVY })], "V′ 동사", NAVY, 1000, "△"),
    exSeg([t("this", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 800),
    exSeg([t("can break", { size: 18, bold: true, color: NAVY })], "V 한 덩어리", NAVY, 1400, "△"),
    exSeg([t("buildings and roads.", { size: 18 })], "", FAINT, 3170),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[3, "Because of climate change, Newtok is facing a big problem."],
 [6, "For a very long time, the land didn’t melt thanks to the cold weather."],
 [13, "Newtok became one of the first villages to move because of climate change."]].forEach(([n, c]) => {
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
  K.push(writeField(1, 250));
  K.push(spF(3, 30, 0.04));
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
["① 알래스카의 춥고 아름다운 날씨", "② 기후 변화로 이사해야 하는 마을", "③ 영구 동토층에 사는 동물들"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["permafrost", "영구 동토층"], ["move", "이사하다"], ["Alaska", "알래스카"], ["climate change", "기후 변화"], ["houses", "집들"], ["Newtok", "뉴톡 마을"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 마을이 해야 하는 일  ③ 그 일이 일어난 원인 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · this · them 같은 지시어는 앞에 나온 말을 대신합니다. 같은 It이라도 다른 것을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    return [
    ["2", "It", [t("Newtok (뉴톡 마을)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["5", "It", chips2("permafrost", "Alaska", 1900), false],
    ["8", "This", chips2("따뜻해지는 날씨", "얼어 있는 땅", 2100), false],
    ["10", "them", chips2("houses (집들)", "people (사람들)", 2100), false],
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
    ["3", [t("Because of", { size: 17, bold: true, color: NAVY, underline: {} }), t(" climate change, Newtok is facing a big problem.", { size: 17 })], ["이유", "결과"]],
    ["7", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(", the weather is getting warmer very fast.", { size: 17 })], ["반전", "순서"]],
    ["9", [t("When", { size: 17, bold: true, color: NAVY, underline: {} }), t(" permafrost melts, this can break buildings and roads.", { size: 17 })], ["때", "결과"]],
    ["11", [t("That’s why", { size: 17, bold: true, color: NAVY, underline: {} }), t(" Newtok has to move to a safer place.", { size: 17 })], ["결과", "반전"]],
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
    chipCellG("땅의 특징", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("경고", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("유래", 1400),
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
  flowCell("A", "소개", "문장 1–3", false),
  arrowCell(),
  flowCell("B", null, "문장 4–6", true),
  arrowCell(),
  flowCell("C", "위기", "문장 7–9", false),
  arrowCell(),
  flowCell("D", "이사 결정", "문장 10–12", false),
  arrowCell(),
  flowCell("E", null, "문장 13–14", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 한 마을의 문제를 알려 주는 설명문",
 "② 여행지를 소개하는 광고",
 "③ 글쓴이의 하루를 적은 일기",
 "④ 친구에게 보내는 편지",
 "⑤ 상상 속 인물이 나오는 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "13", "이 글의 주인공인 마을 이름은? (한 단어)", "Newtok", "주어 자리 (주인공)", true),
  matRow("2", "11", "마을이 안전한 곳으로 가서 해야 하는 일은?", ["move", "stay"], "to 뒤 자리 (할 일)", false),
  matRow("3", "13", "마을이 이사하게 된 원인은? (두 단어)", ["climate change", "cold weather"], "because of 뒤 (원인)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   became one of the first villages to  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   because of  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 다섯 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ one of the first villages    ⓑ because of climate change.    ⓒ Newtok    ⓓ to move    ⓔ became", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓒ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      ⓒ가 맨 앞 — 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("move        warmer        frozen        melting", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Newtok is a village on (1) ____________ land called permafrost. The weather is getting (2) ____________, so the ice inside the land is (3) ____________. Now Newtok has to (4) ____________ to a safer place.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 3, main: "is facing a big problem",
    opts: ["① is enjoying a quiet life", "② has a big problem to solve", "③ is famous for its food"] },
  { sn: 5, main: "stays frozen all the time",
    opts: ["① is always hard with ice", "② melts away every summer", "③ is good for growing rice"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 11, main: "has to move to a safer place",
    opts: ["① must leave for a less dangerous place", "② can stay where it is now", "③ wants to build a big bridge"] },
  { sn: 12, main: "feel both sad and relieved",
    opts: ["① feel nothing special about it", "② have two feelings at the same time", "③ are angry at the tourists"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 영구 동토층 (permafrost)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("영구 동토층은 2년 넘게 늘 얼어 있는 땅으로, 알래스카·캐나다·시베리아 같은 지구 북쪽에 넓게 펼쳐져 있다. 이 땅은 얼음처럼 단단해서 사람들은 그 위에 집과 도로를 짓고 살아왔다. 하지만 지구가 따뜻해져 땅속 얼음이 녹으면 땅이 물렁해지고 내려앉아, 건물이 기울고 도로가 갈라진다. 그래서 뉴톡처럼 마을 전체가 옮겨 가는 일이 생기는데, 이렇게 기후 때문에 삶터를 떠나는 사람들을 '기후 이주민'이라고 부른다. 과학자들은 앞으로 더 많은 북극 마을이 같은 선택을 해야 할지도 모른다고 걱정한다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u19.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Newtok is a small village in the Arctic area.",
    "Newtok is on the east coast of Alaska, U.S.",
    "Newtok is on land called permafrost.",
    "Permafrost is a kind of soil that stays warm all the time.",
    "The weather is getting warmer very fast.",
    "Houses in Newtok shake when people walk inside them.",
    "The people of Newtok feel both sad and angry about the move.",
    "No more villages will be like Newtok in the future.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "뉴톡에 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Newtok decided to move to a safer place.",
      "ⓑ The land stayed frozen for a very long time.",
      "ⓒ The ice inside the permafrost started to melt.",
      "ⓓ The weather got warmer very fast."]
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
    ["1  village", "ⓐ to change from ice into water"],
    ["2  coast", "ⓑ feeling happy because a worry is gone"],
    ["3  frozen", "ⓒ the land next to the sea"],
    ["4  melt", "ⓓ a very small town in the country"],
    ["5  shake", "ⓔ to move quickly from side to side"],
    ["6  relieved", "ⓕ very cold and hard like ice"],
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
[["문장 5", [t("It’s a kind of soil that ", { size: 19 }), t("( stays  /  stay )", { size: 19, bold: true, color: NAVY }), t(" frozen all the time.", { size: 19 })], "that(=soil, 단수) 뒤에 오는 동사의 형태는?"],
 ["문장 7", [t("But, the weather ", { size: 19 }), t("( is getting  /  getting )", { size: 19, bold: true, color: NAVY }), t(" warmer very fast.", { size: 19 })], "진행형은 be+~ing — 한 덩어리의 동사예요."],
 ["문장 10", [t("Houses in Newtok ", { size: 19 }), t("( shake  /  shakes )", { size: 19, bold: true, color: NAVY }), t(" when people walk inside them.", { size: 19 })], "주어 Houses(복수)에 맞는 동사 형태는?"],
 ["문장 11", [t("Newtok ", { size: 19 }), t("( has to  /  have to )", { size: 19, bold: true, color: NAVY }), t(" move to a safer place.", { size: 19 })], "주어 Newtok(3인칭 단수)에 맞는 형태는?"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("melt  /  village  /  safer  /  frozen  /  climate  /  shake  /  move  /  warmer", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Newtok is a small", { size: 19 }), ...BL(1), t("in the Arctic area.  ", { size: 19 }),
  num(2), t(" It is on the west coast of Alaska, U.S.  ", { size: 19 }),
  num(3), t(" Because of", { size: 19 }), ...BL(2), t("change, Newtok is facing a big problem.  ", { size: 19 }),
  num(4), t(" Newtok is on land called permafrost.  ", { size: 19 }),
  num(5), t(" It’s a kind of soil that stays", { size: 19 }), ...BL(3), t("all the time.  ", { size: 19 }),
  num(6), t(" For a very long time, the land didn’t melt thanks to the cold weather.  ", { size: 19 }),
  num(7), t(" But, the weather is getting", { size: 19 }), ...BL(4), t("very fast.  ", { size: 19 }),
  num(8), t(" This is making the ice inside the permafrost", { size: 19 }), ...BL(5), t(".  ", { size: 19 }),
  num(9), t(" When permafrost melts, this can break buildings and roads.  ", { size: 19 }),
  num(10), t(" In fact, houses in Newtok", { size: 19 }), ...BL(6), t("when people walk inside them.  ", { size: 19 }),
  num(11), t(" That’s why Newtok has to move to a", { size: 19 }), ...BL(7), t("place.  ", { size: 19 }),
  num(12), t(" The people of Newtok feel both sad and relieved about it.  ", { size: 19 }),
  num(13), t(" Newtok became one of the first villages to", { size: 19 }), ...BL(8), t("because of climate change.  ", { size: 19 }),
  num(14), t(" Sadly, more villages might be like Newtok in the future.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[11, "That’s why Newtok has to move to a safer place."],
 [13, "Newtok became one of the first villages to move because of climate change."]].forEach(([n, s], i) => {
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
w7block("1", "뉴톡은 북극 지역에 있는 작은 마을이다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 9단어)",
  "village / in / Newtok / small / the / is / a / area / Arctic");
w7block("2", "뉴톡 사람들은 그것에 대해 슬프면서도 안도하는 마음이 든다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 11단어)",
  "people / sad / The / of / feel / Newtok / both / relieved / and / about / it");

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

K.push(...tab("정답 및 해설", "UNIT 19  알래스카의 한 마을에 닥친 위험", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("But, the weather is getting warmer very fast.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문3 ", { size: 17, bold: true, color: NAVY2 }), t("Because of climate change(M)·Newtok(S)·is facing(△V)   ", { size: 17, bold: true }),
     t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("For a very long time(M)·the land(S)·didn’t melt(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문13 ", { size: 17, bold: true, color: NAVY2 }), t("Newtok(S)·became(△V)·to move(M)·because of climate change(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 그녀는 '나비'라고 불리는 고양이를 기른다  (2) 그는 오늘 숙제를 끝내야 한다  (3) 나는 매일 '해피'라고 불리는 개를 산책시켜야 한다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 Newtok · move · climate change        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 이유 · 반전 · 때 · 결과   2-2 [B] 땅의 특징 · [E] 경고   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓔ → ⓐ → ⓓ → ⓑ  ·  Newtok became one of the first villages to move because of climate change.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) frozen  (2) warmer  (3) melting  (4) move        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 ②  문장 5 ①  문장 11 ①  문장 12 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6T · 7F · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓒ → ⓐ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓓ · 2ⓒ · 3ⓕ · 4ⓐ · 5ⓔ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) stays  (2) is getting  (3) shake  (4) has to", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) village (2) climate (3) frozen (4) warmer (5) melt (6) shake (7) safer (8) move", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) Newtok is a small village in the Arctic area.  (2) The people of Newtok feel both sad and relieved about it.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 기후 변화로 이사해야 하는 마을 뉴톡을 소개한다(문장 3·11·13). 소재와 특징을 모두 담은 ①이 제목으로 적절하다. ②·③는 지엽적 오답, ④·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 12에서 사람들은 '슬프면서도 안도한다(both sad and relieved)'고 했으므로 ④은 본문과 다르다. ①은 문장 1–2, ②은 문장 5, ③는 문장 10, ⑤는 문장 14에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 같은 문장 앞부분의 houses in Newtok을 가리킨다. 사람들이 그 '안에서' 걷는 것이 무엇인지 생각하면 된다 — 복수 them은 복수 명사를 받는다.", true);
Hs("독해 04   배열 영작");
B("문장 7을 그대로 복원하는 문제다. ① 첫 단어는 대문자 But, 바로 뒤에 콤마.   ② 진행형 is getting — be+~ing 한 덩어리.   ③ getting warmer — '점점 더 따뜻해지는'.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 Newtok · move · climate change     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 기후 변화 때문에 이사해야 하는 마을 뉴톡의 이야기다. ① 날씨는 배경일 뿐이고, ③ 동토층의 동물 이야기는 나오지 않는다.");
B("1-2   ○표 할 세 단어: Newtok(힌트① 주인공) · move(힌트② 할 일) · climate change(힌트③ 원인). 나머지 셋(permafrost · Alaska · houses)은 설명 재료일 뿐이다.");
B("1-3   문장 5 — It은 permafrost에 ○.   문장 8 — This는 따뜻해지는 날씨에 ○ (문장 7).   문장 10 — them은 houses에 ○.");
B("[학습 포인트]   문장 2의 It(뉴톡)과 문장 5의 It(영구 동토층)은 같은 단어지만 가리키는 것이 다르다. 지시어마다 '무엇을 받는가'를 새로 확인하자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 이유 / 반전 / 때 / 결과     2-2 [B] 땅의 특징 · [E] 경고     2-3 ①");
B("2-1   문장 3 Because of — 뉴톡이 문제를 겪는 '이유'.   문장 7 But — 오랫동안 녹지 않던 땅에 대한 '반전'.   문장 9 When — 동토층이 녹는 '때'.   문장 11 That’s why — 그래서 이사해야 한다는 '결과'.");
B("2-2   [B] 땅의 특징(문장 4–6: 늘 얼어 있는 영구 동토층), [E] 경고(문장 13–14: 더 많은 마을이 그렇게 될지도). 보기의 '유래'는 이 글에 없는 역할이다. [A] 소개 → [B] 특징 → [C] 위기 → [D] 결정 → [E] 경고 — 문제를 다루는 설명문의 흐름이다.");
B("2-3   정답 ①. 뉴톡이라는 마을의 사실을 알려 주는 설명문이다(현재시제, 대상의 이름과 특징). ② 광고의 신호(사라는 말·가격)가 없고, ③ 일기·④ 편지·⑤ 동화의 형식도 아니다.");
B("[학습 포인트]   문장 7의 But이 이 글의 방향을 바꾼다 — 녹지 않던 땅이 녹기 시작하는 지점. 반전 연결어 뒤에 글의 진짜 문제가 온다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 move · climate change     3-3 ⓒ → ⓔ → ⓐ → ⓓ → ⓑ");
B("3-1  재료 찾기 — (2) 문장 11에서 move에 ○: 마을이 해야 하는 일이다. stay는 본문과 반대 방향. (3) 문장 13에서 climate change에 ○: 이사의 원인이다. cold weather는 문장 6의 사실일 뿐 원인이 아니다.");
B("3-2  뼈대 채우기 — (1) Newtok  (2) move  (3) climate change.  넣으면 Newtok became one of the first villages to move because of climate change.가 완성된다.");
B("3-3  정답 순서 — ⓒ Newtok → ⓔ became → ⓐ one of the first villages → ⓓ to move → ⓑ because of climate change.");
B("[채점 포인트]  주인공(ⓒ)이 주어로 맨 앞, 마침표가 붙은 덩어리(ⓑ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) frozen  (2) warmer  (3) melting  (4) move");
B("(1)은 문장 5의 frozen, (2)는 문장 7의 warmer, (3)은 문장 8의 melt(→ melting), (4)는 문장 11의 move에서 가져온다. 요약문이 곧 이 글의 흐름이다: 언 땅(1) → 따뜻해짐(2) → 녹음(3) → 이사(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 ②   문장 5 ①   문장 11 ①   문장 12 ②  (정답 선지는 무표시)");
B("문장 3 is facing a big problem   ① ✕ [반대] 조용한 삶을 즐긴다 — 정반대.   ② ○ 풀어야 할 큰 문제가 있다.   ③ ✕ [무관] 음식으로 유명하다는 말은 지문에 없다.");
B("문장 5 stays frozen all the time   ① ○ 늘 얼음처럼 단단하다.   ② ✕ [반대] 여름마다 녹아 없어진다 — 정반대.   ③ ✕ [무관] 벼농사 이야기는 지문에 없다.");
B("문장 11 has to move to a safer place   ① ○ 덜 위험한 곳으로 떠나야 한다.   ② ✕ [반대] 지금 자리에 머물 수 있다 — 정반대.   ③ ✕ [무관] 다리를 짓는다는 말은 지문에 없다.");
B("문장 12 feel both sad and relieved   ① ✕ [반대] 아무 감정이 없다 — 정반대.   ② ○ 두 감정을 동시에 느낀다.   ③ ✕ [무관] 관광객 이야기는 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. both A and B(두 감정)처럼 수·방향이 담긴 표현은 바꿔 말해도 그 정보가 남아 있는지 확인하자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 T · 7 F · 8 F");
B("1 T — 문장 1.   2 F — 문장 2: 동쪽이 아니라 서쪽(west) 해안이다.   3 T — 문장 4.   4 F — 문장 5: 늘 따뜻한 게 아니라 늘 얼어(frozen) 있다.   5 T — 문장 7.   6 T — 문장 10.   7 F — 문장 12: 화가 난 게 아니라 슬프면서도 안도했다(relieved).   8 F — 문장 14: 더 많은 마을이 그렇게 될지도 모른다.  거짓 문장은 모두 딱 한 요소(east, warm, angry, no more)를 비튼 것이다 — 그 한 단어를 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   (b) → (d) → (c) → (a)");
B("ⓑ 땅이 아주 오랫동안 얼어 있었다(문장 6) → ⓓ 날씨가 매우 빠르게 따뜻해졌다(문장 7) → ⓒ 동토층 안의 얼음이 녹기 시작했다(문장 8) → ⓐ 뉴톡이 더 안전한 곳으로 이사하기로 했다(문장 11). 원인에서 결과로 흐르는 글이라 문장 순서가 곧 사건 순서다 — 연결어(But, That’s why)가 그 사슬을 이어 준다.", true);
Hs("R3   영영풀이   ·   1 (d) · 2 (c) · 3 (f) · 4 (a) · 5 (e) · 6 (b)");
B("village = 시골의 아주 작은 마을 · coast = 바다 옆의 땅(해안) · frozen = 얼음처럼 아주 차고 단단한 · melt = 얼음이 물로 변하다 · shake = 좌우로 빠르게 움직이다 · relieved = 걱정이 사라져 마음이 놓이는.", true);
Hs("R4   어법 기초   ·   (1) stays  (2) is getting  (3) shake  (4) has to");
B("(1) that은 단수 명사 soil을 받으므로 3인칭 단수 -s — stays.   (2) 진행형은 be+~ing가 한 덩어리의 동사다 — is getting. 2면 분석 Tip의 그 원칙이다.   (3) 주어 Houses는 복수 — shake.   (4) 주어 Newtok은 3인칭 단수 — has to. 2면 구문에서 배운 그 문장이다.", true);
Hs("R5   빈칸 클로즈   ·   (1) village (2) climate (3) frozen (4) warmer (5) melt (6) shake (7) safer (8) move");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: a small ___ ← 마을의 정체, stays ___ ← 땅의 상태, getting ___ ← 날씨의 변화, a ___ place ← 이사의 목적지. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 그래서 뉴톡은 더 안전한 곳으로 이사해야 한다.  — has to를 '~해야 한다'로 옮기는 것이 핵심이다.");
B("(2) 뉴톡은 기후 변화 때문에 이사한 첫 마을들 중 하나가 되었다.  — one of the+복수명사는 '~들 중 하나'로 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) Newtok is a small village in the Arctic area.  (2) The people of Newtok feel both sad and relieved about it.");
B("(1) 문장 1의 복원. ㄱ 첫 글자 대문자 Newtok  ㄴ a small village — 관사 a를 빠뜨리지 않는다  ㄷ in the Arctic area로 마무리.");
B("(2) 문장 12의 복원. ㄱ 주어는 The people of Newtok  ㄴ both sad and relieved — both A and B로 잇는다  ㄷ about it으로 끝난다. R4-(4)의 has to처럼, 워크북은 앞에서 배운 것과 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("뉴톡은 북극 지역에 있는 작은 마을이다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그곳은 미국 알래스카의 서쪽 해안에 있다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("기후 변화 때문에, 뉴톡은 큰 문제에 직면해 있다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("뉴톡은 영구 동토층이라고 불리는 땅 위에 있다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 늘 얼어 있는 흙의 한 종류이다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("아주 오랫동안, 추운 날씨 덕분에 그 땅은 녹지 않았다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만, 날씨가 매우 빠르게 따뜻해지고 있다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것이 영구 동토층 안의 얼음을 녹게 만들고 있다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("영구 동토층이 녹으면, 이것은 건물과 도로를 부술 수 있다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("실제로, 뉴톡의 집들은 사람들이 안에서 걸으면 흔들린다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 뉴톡은 더 안전한 곳으로 이사해야 한다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("뉴톡 사람들은 그것에 대해 슬프면서도 안도하는 마음이 든다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("뉴톡은 기후 변화 때문에 이사한 첫 마을들 중 하나가 되었다.  ", { size: 17, color: SUB }),
     t("14 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("슬프게도, 미래에는 더 많은 마을이 뉴톡처럼 될지도 모른다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
