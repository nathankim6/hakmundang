/* UNIT 14 — 긴장될 땐 요구르트를 마셔봐! (Level 4) · 축약 유닛(5면)
   [DATA] 블록만 지문에 맞게 교체했다. 레이아웃 코드는 건드리지 않는다. */
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
  title: "긴장될 땐 요구르트를 마셔봐!",
  level: "4",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 14  긴장될 땐 요구르트를 마셔봐!",
  banner: ["14", "긴장될 땐 요구르트를 마셔봐!", "4"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 10문장 ═══════════ */
const SENT = [
  "For a long time, people have known that our feelings can affect our stomachs.",
  "For example, when we’re anxious, we might have an upset stomach.",
  "But now, researchers are discovering that our stomachs affect our feelings too: The many tiny bacteria in our guts can influence how we feel.",
  "In a study with mice, researchers removed good bacteria from their guts.",
  "This made the mice more stressed and anxious.",
  "But when they gave the stressed mice good bacteria, which are called probiotics, the mice became less stressed and their anxiety disappeared.",
  "Do these findings apply to humans?",
  "In fact, researchers also found that consuming fermented foods such as yogurt, pickles, and kimchi can reduce these anxious feelings.",
  "The tiny bacteria in these foods help with digestion and our mental health.",
  "They think that these good bacteria might work similarly to medicines that improve our mood.",
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
  5: [RM("This"), R(" made the mice more stressed and anxious.  ")],
  6: [R("But when "), RM("they"), R(" gave the stressed mice good bacteria, which are called probiotics, the mice became less stressed and "), RM("their"), R(" anxiety disappeared.  ")],
  7: [R("Do "), RM("these findings"), R(" apply to humans?  ")],
  9: [R("The tiny bacteria in "), RM("these foods"), R(" help with digestion and our mental health.  ")],
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
  7: [t("Do ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("these findings", { size: 19, bold: true, underline: {} }),
      t(" apply to humans?  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Good Bacteria in Your Gut Can Calm You Down", "② How to Make Yogurt and Kimchi at Home",
 "③ The Best Medicines for a Stomachache", "④ Why Mice Are Used in Every Study",
 "⑤ Foods That Make You Grow Taller"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① When we’re anxious, we might have an upset stomach.",
 "② In a study, researchers removed good bacteria from mice’s guts.",
 "③ Removing the good bacteria made the mice calm and happy.",
 "④ Fermented foods such as yogurt and kimchi can reduce anxious feelings.",
 "⑤ The tiny bacteria in these foods help with digestion."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) these findings가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the results of the study with mice",
 "② the names of some fermented foods",
 "③ the medicines that improve our mood",
 "④ the feelings of the researchers",
 "⑤ the tiny bacteria in our guts"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("이것은 그 쥐들을 더 스트레스받고 불안하게 만들었다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("mice / This / and / stressed / made / anxious. / the / more", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 8", { size: 14, bold: true, color: AMB }), t("   동명사 주어 ‘~하는 것은’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("consuming", { size: 18, bold: true, color: NAVY }), t(" fermented foods", { size: 18, underline: {} }), t(" can reduce these feelings", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사에 -ing를 붙이면 주어 자리에 올 수 있습니다. ‘발효 식품을 먹는 것은’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   현재진행형 be동사+-ing", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("researchers ", { size: 18 }), t("are discovering", { size: 18, bold: true, color: NAVY, underline: {} }), t(" that ~", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+-ing는 한 덩어리의 동사입니다. ‘연구자들은 발견하고 있는 중이다’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 8 구문", [t("Reading", { size: 19, bold: true, color: NAVY }), t(" comic books", { size: 19, underline: {} }), t(" makes me happy.", { size: 19 })]],
 ["문장 3 구문", [t("My sister ", { size: 19 }), t("is learning", { size: 19, bold: true, color: NAVY, underline: {} }), t(" Chinese these days.", { size: 19 })]],
 ["둘 다!", [t("Eating", { size: 19, bold: true, color: NAVY }), t(" breakfast", { size: 19, underline: {} }), t(" ", { size: 19 }), t("is helping", { size: 19, bold: true, color: NAVY, underline: {} }), t(" me stay awake in class.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 1을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1900, 1000, 1500, 700, 1500, 1300, 1030], [new TableRow({ children: [
    exSeg([t("For a long time", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1900),
    exSeg([t("people", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1000),
    exSeg([t("have known", { size: 18, bold: true, color: NAVY })], "V 한 덩어리", NAVY, 1500, "△"),
    exSeg([t("that", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 700),
    exSeg([t("our feelings", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1500),
    exSeg([t("can affect", { size: 18, bold: true, color: NAVY })], "V′ 한 덩어리", NAVY, 1300, "△"),
    exSeg([t("our stomachs", { size: 18 })], "", FAINT, 1030),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[4, "In a study with mice, researchers removed good bacteria from their guts."],
 [9, "The tiny bacteria in these foods help with digestion and our mental health."],
 [10, "They think that these good bacteria might work similarly to medicines that improve our mood."]].forEach(([n, c]) => {
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
["① 집에서 요구르트를 만드는 방법", "② 장 속 좋은 박테리아가 우리 기분에 주는 영향", "③ 실험용 쥐를 기르는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["bacteria", "박테리아"], ["guts", "장"], ["feelings", "감정"], ["mice", "쥐"], ["yogurt", "요구르트"], ["study", "연구"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 그것이 사는 곳  ③ 그것이 영향을 주는 것 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      this · these · they 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서 서로 다른 것을 가리키기도 해요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const labC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 40 } });
    const chips8 = () => T([780, 1150, 150, 1150, 250, 780, 1150, 150, 1150], [new TableRow({ children: [
      labC("they =", 780), chipC("연구자들", 1150), gapC(150), chipC("쥐들", 1150), gapC(250),
      labC("their =", 780), chipC("연구자들", 1150), gapC(150), chipC("쥐들", 1150),
    ] })]);
    return [
    ["5", "This", [t("좋은 박테리아를 없앤 것", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["6", "they · their", chips8(), false],
    ["7", "these findings", chips2("쥐 실험 결과", "요구르트 조리법", 1900), false],
    ["9", "these foods", chips2("발효 식품", "약", 2100), false],
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
    "People have known for a long time that our feelings can affect our stomachs.",
    "When we’re anxious, we might have an upset stomach.",
    "In the study, researchers added good bacteria to the mice’s guts.",
    "Losing the good bacteria made the mice more stressed and anxious.",
    "Probiotics made the stressed mice even more anxious.",
    "Fermented foods such as yogurt and kimchi can increase these anxious feelings.",
    "The tiny bacteria in these foods help with digestion and our mental health.",
    "Researchers think good bacteria have nothing to do with our mood.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "쥐를 대상으로 한 연구에서 일어난 일 ⓐ~ⓓ를 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ The mice became less stressed and their anxiety disappeared.",
      "ⓑ Researchers removed good bacteria from the mice’s guts.",
      "ⓒ Researchers gave the stressed mice probiotics.",
      "ⓓ The mice became more stressed and anxious."]
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
K.push(...tab("정답 및 해설", "UNIT 14  긴장될 땐 요구르트를 마셔봐!", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("This made the mice more stressed and anxious.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문4 ", { size: 17, bold: true, color: NAVY2 }), t("In a study with mice(M)·researchers(S)·removed(△V)·from their guts(M)   ", { size: 17, bold: true }),
     t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("bacteria(S)·help(△V)·with digestion(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("They(S)·think(△V)·that[네모]·bacteria(S′)·might work(△V′)·similarly(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 만화책을 읽는 것은 나를 행복하게 만든다  (2) 내 여동생은 요즘 중국어를 배우고 있다  (3) 아침을 먹는 것이 내가 수업 시간에 깨어 있도록 도와주고 있다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 bacteria · guts · feelings   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4T · 5F · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓒ → ⓐ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 장 속 좋은 박테리아가 우리 감정에 영향을 준다는 연구(문장 3·6·8)를 소개한다. 소재(good bacteria)와 효과(calm you down)를 함께 담은 ①이 제목으로 적절하다. ②·④는 요구르트·쥐만 건드린 지엽적 오답, ③·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 5에서 좋은 박테리아를 없애자 쥐들은 더 스트레스를 받고 불안해졌다. calm and happy로 뒤집은 ③이 본문과 반대된다. ①은 문장 2, ②은 문장 4, ④는 문장 8, ⑤는 문장 9에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) these findings는 바로 앞 문장 4–6의 쥐 실험 결과, 곧 좋은 박테리아가 스트레스와 불안을 줄였다는 발견을 가리킨다 — this/these가 붙으면 앞에서 짝을 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   This made the mice more stressed and anxious.");
B("문장 5를 그대로 복원하는 문제다. ① 첫 글자는 대문자 This.   ② make A B(A를 B 상태로 만들다) — the mice 뒤에 상태가 온다.   ③ more stressed and anxious — 두 말을 and로 잇는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 bacteria · guts · feelings     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 장 속 작은 박테리아가 우리 기분을 바꾼다는 연구를 소개한다. ① 요구르트 만드는 법은 나오지 않고, ③ 쥐는 근거를 보여 주는 실험 대상일 뿐이다.");
B("1-2   ○표 할 세 단어: bacteria(힌트① 주인공) · guts(힌트② 사는 곳) · feelings(힌트③ 영향을 주는 것). 나머지 셋(mice · yogurt · study)은 근거를 보여 주는 예일 뿐 주제문에 들어가지 않는다.");
B("1-3   문장 6 — they는 연구자들, their는 쥐들에 ○ (한 문장 안에서 대상이 바뀐다).   문장 7 — these findings는 쥐 실험 결과.   문장 9 — these foods는 앞 문장의 발효 식품(요구르트·피클·김치).");
B("[학습 포인트]   this/these가 붙은 지시어는 '앞에 나온 바로 그것'이라는 표지다. 문장 7의 these findings처럼 앞 세 문장을 통째로 받기도 한다.", true);

/* ═══════════ [DATA] 해설 2면 — R1 · R2 · 전문 해석 ═══════════ */
K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 T · 5 F · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 T — 문장 2.   3 F — 문장 4: 넣은(added) 것이 아니라 없앴다(removed).   4 T — 문장 5.   5 F — 문장 6: 더 불안해진 게 아니라 불안이 사라졌다(less stressed).   6 F — 문장 8: 늘리는(increase) 것이 아니라 줄인다(reduce).   7 T — 문장 9.   8 F — 문장 10: 기분과 무관한 게 아니라 기분을 좋게 하는 약처럼 작용할 수 있다.  거짓 넷은 모두 한 요소(added, more, increase, nothing to do)만 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓒ → ⓐ");
B("ⓑ 쥐들의 장에서 좋은 박테리아를 없앤다(문장 4) → ⓓ 쥐들이 더 스트레스를 받고 불안해진다(문장 5) → ⓒ 스트레스받은 쥐들에게 프로바이오틱스를 준다(문장 6 앞부분) → ⓐ 쥐들이 안정을 되찾고 불안이 사라진다(문장 6 뒷부분). 문장 6 한 문장 안에 원인(주기)과 결과(사라짐)가 함께 들어 있다는 점이 핵심이다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("오랫동안, 사람들은 우리의 감정이 우리의 위장에 영향을 줄 수 있다는 것을 알고 있었다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("예를 들어, 우리가 불안할 때, 우리는 속이 불편할 수 있다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그러나 이제, 연구자들은 우리의 위장도 우리의 감정에 영향을 준다는 것을 발견하고 있다: 우리 장 속의 수많은 작은 박테리아가 우리가 느끼는 방식에 영향을 줄 수 있다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("쥐를 대상으로 한 연구에서, 연구자들은 쥐들의 장에서 좋은 박테리아를 없앴다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것은 그 쥐들을 더 스트레스받고 불안하게 만들었다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 그들이 스트레스받은 쥐들에게 프로바이오틱스라고 불리는 좋은 박테리아를 주자, 그 쥐들은 스트레스를 덜 받게 되었고 불안도 사라졌다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 발견들이 사람에게도 적용될까?  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("실제로, 연구자들은 요구르트, 피클, 김치 같은 발효 식품을 먹는 것이 이런 불안한 감정을 줄일 수 있다는 것도 알아냈다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 음식들 속의 작은 박테리아는 소화와 우리의 정신 건강에 도움을 준다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 이 좋은 박테리아가 우리의 기분을 좋게 하는 약과 비슷하게 작용할지도 모른다고 생각한다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
