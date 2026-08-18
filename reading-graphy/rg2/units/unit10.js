/* UNIT 10 — 제 눈이 되어주세요 (Level 2) · 풀 유닛(10면)
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
  no: "10",
  title: "제 눈이 되어주세요",
  level: "2",
  foot: "UNIT 10  제 눈이 되어주세요",
  banner: ["10", "제 눈이 되어주세요", "2"],
  timeline: ["1824|점자|루이 브라유가 손끝으로\\n읽는 점 글자를 만들다",
             "20세기|안내견·흰지팡이|길을 안내하는\\n동반자가 등장하다",
             "2015|Be My Eyes|영상 통화로 세계의\\n자원봉사자와 이어지다",
             "오늘|AI의 눈|인공지능이 사진과 글자를\\n대신 설명해 주다"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "Brian Fischler is blind.",
  "He lost most of his sight when he was 13.",
  "Now, he can only tell if it’s light or dark outside.",
  "However, an app, “Be My Eyes,” is helping him every day!",
  "This app connects Brian with people who can see through video calls.",
  "It has more than 6 million volunteers all over the world.",
  "These volunteers describe things Brian can’t see.",
  "They can read product labels or mail for him, describe photos, or even guide him to a specific place.",
  "Now, “Be My Eyes” is getting an upgrade.",
  "It’s adding a new function, artificial intelligence (AI).",
  "AI can do some things better than humans, but the volunteers are still important.",
  "This upgrade will hopefully help blind people do even more amazing things and improve their lives!",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4 [C]5–8 [D]9–11 [E]12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 5: "C", 9: "D", 12: "E" };
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
  3: [R("Now, he can only tell if "), RM("it"), R("’s light or dark outside.  ")],
  4: [R("However, an app, “Be My Eyes,” is helping "), RM("him"), R(" every day!  ")],
  8: [RM("They"), R(" can read product labels or mail for "), RM("him"), R(", describe photos, or even guide him to a specific place.  ")],
  10: [RM("It"), R("’s adding a new function, artificial intelligence (AI).  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u10.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  8: [t("(A) ", { size: 19, bold: true }), t("They", { size: 19, bold: true, underline: {} }),
      t(" can read product labels or mail for him, describe photos, or even guide him to a specific place.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① An App That Becomes the Eyes of Blind People", "② How to Make Video Calls with Friends",
 "③ The Long History of Artificial Intelligence", "④ A Man Who Lost His Sight at 13",
 "⑤ Easy Jobs for Millions of Volunteers"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Brian Fischler lost most of his sight at 13.",
 "② The app connects Brian with people through video calls.",
 "③ The app has fewer than one million volunteers.",
 "④ The volunteers can read mail or describe photos for Brian.",
 "⑤ “Be My Eyes” is adding artificial intelligence."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) They가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the volunteers of the app",
 "② Brian and his family",
 "③ people who cannot see",
 "④ the product labels and mail",
 "⑤ the app’s new functions"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그는 13살이었을 때 시력의 대부분을 잃었다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 10단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("sight / he / of / lost / when / his / was / most / 13 / he", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   현재진행형 be + ~ing", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("an app ", { size: 18 }), t("is helping", { size: 18, bold: true, color: NAVY, underline: {} }), t(" him every day", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+~ing는 '지금 ~하고 있다'는 뜻입니다. 두 단어를 한 덩어리의 동사로 봅니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   비교급 + than '~보다 더 …'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("AI can do some things ", { size: 18 }), t("better than", { size: 18, bold: true, color: NAVY, underline: {} }), t(" humans", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("than은 '~보다'라는 뜻으로 비교 대상을 이끕니다. well(잘)의 비교급은 better!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("My brother ", { size: 19 }), t("is washing", { size: 19, bold: true, color: NAVY, underline: {} }), t(" the dishes now.", { size: 19 })]],
 ["문장 11 구문", [t("This bag is ", { size: 19 }), t("cheaper than", { size: 19, bold: true, color: NAVY, underline: {} }), t(" that one.", { size: 19 })]],
 ["둘 다!", [t("She ", { size: 19 }), t("is running", { size: 19, bold: true, color: NAVY, underline: {} }), t(" ", { size: 19 }), t("faster than", { size: 19, bold: true, color: NAVY, underline: {} }), t(" her friends today.", { size: 19 })]],
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

/* 먼저 보기 — 다 표시된 문장 (문장 2: 접속사 when + 종속절) */
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
  T([800, 1150, 2700, 1250, 800, 900, 1330], [new TableRow({ children: [
    exSeg([t("He", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 800),
    exSeg([t("lost", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1150, "△"),
    exSeg([t("most of his sight", { size: 18 })], "", FAINT, 2700),
    exSeg([t("when", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 1250),
    exSeg([t("he", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 800),
    exSeg([t("was", { size: 18, bold: true, color: NAVY })], "V′ 본동사", NAVY, 900, "△"),
    exSeg([t("13.", { size: 18 })], "", FAINT, 1330),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[3, "Now, he can only tell if it’s light or dark outside."],
 [6, "It has more than 6 million volunteers all over the world."],
 [7, "These volunteers describe things Brian can’t see."]].forEach(([n, c]) => {
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
["① 영상 통화 앱을 만드는 방법", "② 시각장애인의 눈이 되어 주는 앱", "③ 인공지능 기술의 역사"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["volunteers", "자원봉사자"], ["AI", "인공지능"], ["blind", "눈이 보이지 않는"], ["photos", "사진"], ["calls", "통화"], ["Brian", "브라이언"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 도움을 주는 사람들  ② 새로 더해진 기능  ③ 도움을 받는 사람들 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · him 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서도 가리키는 대상이 달라질 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const chips8 = () => T([900, 1200, 170, 1200, 300, 900, 1200, 170, 1200], [new TableRow({ children: [
      labC("They =", 900), chipC("자원봉사자", 1200), gapC(170), chipC("브라이언", 1200), gapC(300),
      labC("him =", 900), chipC("자원봉사자", 1200), gapC(170), chipC("브라이언", 1200),
    ] })]);
    return [
    ["3", "it", [t("명암을 나타내는 it (가리키는 말이 따로 없음)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "him", chips2("브라이언", "자원봉사자", 1900), false],
    ["8", "They · him", chips8(), false],
    ["10", "It", chips2("앱 Be My Eyes", "인공지능 AI", 2100), false],
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
    ["2", [t("He lost most of his sight ", { size: 17 }), t("when", { size: 17, bold: true, color: NAVY, underline: {} }), t(" he was 13.", { size: 17 })], ["때", "결과"]],
    ["4", [t("However", { size: 17, bold: true, color: NAVY, underline: {} }), t(", an app, “Be My Eyes,” is helping him every day!", { size: 17 })], ["반전", "때"]],
    ["8", [t("They can read product labels ", { size: 17 }), t("or", { size: 17, bold: true, color: NAVY, underline: {} }), t(" mail for him, describe photos.", { size: 17 })], ["나열", "반전"]],
    ["12", [t("This upgrade will help blind people do more ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" improve their lives!", { size: 17 })], ["덧붙임", "이유"]],
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
    chipCellG("앱 등장", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("기대", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("가격 비교", 1400),
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
  flowCell("B", null, "문장 4", true),
  arrowCell(),
  flowCell("C", "쓰임", "문장 5–8", false),
  arrowCell(),
  flowCell("D", "변화", "문장 9–11", false),
  arrowCell(),
  flowCell("E", null, "문장 12", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 새로운 앱과 그 쓰임을 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 있었던 일을 적은 일기",
 "④ 친구에게 안부를 전하는 편지",
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
  matRow("1", "7", "브라이언을 돕는 사람들을 가리키는 말은?", "volunteers", "주어 자리", true),
  matRow("2", "10", "이 앱에 새로 더해지는 기능의 이름은?", ["AI", "video calls"], "and 뒤 자리 (또 하나의 주어)", false),
  matRow("3", "12", "시각장애인이 하게 될 일을 나타낸 말은? (두 단어)", ["amazing things", "product labels"], "do more 뒤 자리", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ____________", { size: 19, color: NAVY2 }),
  t("   and  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ______", { size: 19, color: NAVY2 }),
  t("   in Be My Eyes help blind people do more  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ in Be My Eyes     ⓑ do more amazing things.     ⓒ Volunteers and AI     ⓓ help blind people", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("volunteers        AI        blind        lives", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Brian Fischler is (1) ____________ and cannot see well. An app, “Be My Eyes,” connects him with millions of (2) ____________ who describe things for him. Now the app is adding (3) ____________ , and it will help blind people improve their (4) ____________ .", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 1, main: "is blind",
    opts: ["① can see very well", "② cannot see", "③ works as a doctor"] },
  { sn: 6, main: "more than 6 million volunteers",
    opts: ["① over six million helpers", "② only a few helpers in one city", "③ six million dollars for the app"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "guide him to a specific place",
    opts: ["① show him the way to a certain place", "② leave him alone on the street", "③ drive him to school every day"] },
  { sn: 11, main: "the volunteers are still important",
    opts: ["① volunteers are no longer needed", "② volunteers get paid for their work", "③ volunteers still matter a lot"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 시각장애인의 눈이 되어 온 기술", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("시각장애인이 세상을 읽는 방법은 시대마다 달라졌다. 1824년 프랑스의 루이 브라유는 손끝으로 읽는 점자를 만들었고, 20세기에는 안내견과 흰지팡이가 널리 보급되었다. 2015년 덴마크에서 시작된 'Be My Eyes'는 여기에 영상 통화를 더했다. 앱을 켜면 전 세계 자원봉사자 가운데 한 명이 곧바로 연결되어, 우유의 유통기한이나 버스 번호를 대신 읽어 준다. 최근에는 인공지능이 사진을 문장으로 설명해 주기 시작했다. 기술이 바뀌어도 변하지 않는 것이 하나 있다 — 누군가의 눈이 되어 주려는 마음이다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u10.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Brian Fischler lost most of his sight when he was 13.",
    "Brian can tell if it’s light or dark outside.",
    "The app connects Brian with people through text messages.",
    "The app has more than 6 million volunteers all over the world.",
    "These volunteers describe things Brian can’t see.",
    "The volunteers can only read product labels for Brian.",
    "The app is adding a new function called virtual reality.",
    "The volunteers are no longer important after the upgrade.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "브라이언과 앱에 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ The app began to add artificial intelligence.",
      "ⓑ Brian lost most of his sight at 13.",
      "ⓒ Volunteers started to describe things for Brian.",
      "ⓓ Brian could only tell light from dark."]
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
    ["1  blind", "ⓐ a person who helps without money"],
    ["2  sight", "ⓑ to show someone the way"],
    ["3  volunteer", "ⓒ the power to see things"],
    ["4  describe", "ⓓ to make something better"],
    ["5  guide", "ⓔ not able to see"],
    ["6  improve", "ⓕ to say what something is like"],
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
[["문장 3", [t("Now, he ", { size: 19 }), t("( can only tell  /  can only tells )", { size: 19, bold: true, color: NAVY }), t(" if it’s light or dark outside.", { size: 19 })], "조동사 can 뒤에는 동사원형이 와요."],
 ["문장 4", [t("An app, “Be My Eyes,” ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" helping him every day.", { size: 19 })], "주어 an app은 단수예요."],
 ["문장 6", [t("It ", { size: 19 }), t("( has  /  have )", { size: 19, bold: true, color: NAVY }), t(" more than 6 million volunteers.", { size: 19 })], "주어 It에 맞는 3인칭 단수 형태는?"],
 ["문장 7", [t("These volunteers ", { size: 19 }), t("( describe  /  describes )", { size: 19, bold: true, color: NAVY }), t(" things Brian can’t see.", { size: 19 })], "주어 These volunteers(복수)에 맞는 형태는?"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("labels  /  lives  /  blind  /  describe  /  upgrade  /  sight  /  important  /  volunteers", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Brian Fischler is", { size: 19 }), ...BL(1), t(".  ", { size: 19 }),
  num(2), t(" He lost most of his", { size: 19 }), ...BL(2), t("when he was 13.  ", { size: 19 }),
  num(3), t(" Now, he can only tell if it’s light or dark outside.  ", { size: 19 }),
  num(4), t(" However, an app, “Be My Eyes,” is helping him every day!  ", { size: 19 }),
  num(5), t(" This app connects Brian with people who can see through video calls.  ", { size: 19 }),
  num(6), t(" It has more than 6 million", { size: 19 }), ...BL(3), t("all over the world.  ", { size: 19 }),
  num(7), t(" These volunteers", { size: 19 }), ...BL(4), t("things Brian can’t see.  ", { size: 19 }),
  num(8), t(" They can read product", { size: 19 }), ...BL(5), t("or mail for him, describe photos, or even guide him to a specific place.  ", { size: 19 }),
  num(9), t(" Now, “Be My Eyes” is getting an", { size: 19 }), ...BL(6), t(".  ", { size: 19 }),
  num(10), t(" It’s adding a new function, artificial intelligence (AI).  ", { size: 19 }),
  num(11), t(" AI can do some things better than humans, but the volunteers are still", { size: 19 }), ...BL(7), t(".  ", { size: 19 }),
  num(12), t(" This upgrade will hopefully help blind people do even more amazing things and improve their", { size: 19 }), ...BL(8), t("!", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[5, "This app connects Brian with people who can see through video calls."],
 [11, "AI can do some things better than humans, but the volunteers are still important."]].forEach(([n, s], i) => {
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
w7block("1", "이 자원봉사자들은 브라이언이 볼 수 없는 것들을 설명해 준다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 7단어)",
  "describe / these / see / volunteers / can’t / things / Brian");
w7block("2", "그것은 전 세계에 600만 명이 넘는 자원봉사자를 두고 있다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 11단어)",
  "million / it / all / has / than / world / more / 6 / volunteers / over / the");

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

K.push(...tab("정답 및 해설", "UNIT 10  제 눈이 되어주세요", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("He lost most of his sight when he was 13.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문3 ", { size: 17, bold: true, color: NAVY2 }), t("he(S)·can only tell(△V)·if[네모]·it(S′)·’s(△V′)   ", { size: 17, bold: true }),
     t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("It(S)·has(△V)·all over the world(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문7 ", { size: 17, bold: true, color: NAVY2 }), t("These volunteers(S)·describe(△V)·things·Brian(S′)·can’t see(△V′)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 내 남동생은 지금 설거지를 하고 있다  (2) 이 가방은 저것보다 더 싸다  (3) 그녀는 오늘 친구들보다 더 빨리 달리고 있다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 volunteers · AI · blind        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 때 · 반전 · 나열 · 덧붙임   2-2 [B] 앱 등장 · [E] 기대   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓐ → ⓓ → ⓑ  ·  Volunteers and AI in Be My Eyes help blind people do more amazing things.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) blind  (2) volunteers  (3) AI  (4) lives        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 1 ②  문장 6 ①  문장 8 ①  문장 11 ③", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4T · 5T · 6F · 7F · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓒ → ⓐ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓔ · 2ⓒ · 3ⓐ · 4ⓕ · 5ⓑ · 6ⓓ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) can only tell  (2) is  (3) has  (4) describe", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) blind (2) sight (3) volunteers (4) describe (5) labels (6) upgrade (7) important (8) lives", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) These volunteers describe things Brian can’t see.  (2) It has more than 6 million volunteers all over the world.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 앞이 보이지 않는 브라이언(문장 1–3)에게 자원봉사자와 AI가 눈이 되어 주는 앱을 소개한다(문장 4–12). 소재(앱)와 특징(시각장애인의 눈)을 함께 담은 ①이 제목으로 적절하다. ④·⑤는 세부만 건드린 지엽적 오답, ②·③은 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 6에서 자원봉사자는 600만 명이 넘는다고 했다. 100만 명이 안 된다는 ③이 본문과 반대된다. ①은 문장 2, ②은 문장 5, ④은 문장 8, ⑤는 문장 10에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) They는 바로 앞 문장 7의 These volunteers를 가리킨다. 같은 문장의 him은 브라이언이다 — 한 문장 안에서 주어와 목적어가 서로 다른 것을 가리키는 자리다.", true);
Hs("독해 04   배열 영작   ·   He lost most of his sight when he was 13.");
B("문장 2를 그대로 복원하는 문제다. ① 첫 글자는 대문자 He.   ② most of his sight — of가 두 덩어리를 잇는다.   ③ when 뒤에는 '주어+동사'(he was 13)가 온다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 volunteers · AI · blind     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 시각장애인의 눈이 되어 주는 앱을 소개한다. ① 앱 제작 방법은 나오지 않고, ③ AI는 앱에 새로 더해진 기능일 뿐이다.");
B("1-2   ○표 할 세 단어: volunteers(힌트① 도움을 주는 사람들) · AI(힌트② 새로 더해진 기능) · blind(힌트③ 도움을 받는 사람들). 나머지 셋(photos · calls · Brian)은 본문에 등장하지만 주제문에 들어가지 않는다 — 예시와 한 사람의 사례일 뿐이다.");
B("1-3   문장 4 — him은 브라이언에 ○.   문장 8 — They는 자원봉사자, him은 브라이언에 ○ (한 문장, 두 대상).   문장 10 — It은 앱 Be My Eyes에 ○ (문장 9의 주어).");
B("[학습 포인트]   문장 8처럼 한 문장 안에서 주어(They)와 목적어(him)가 서로 다른 것을 가리키는 자리가 고등 지칭 문항의 단골 재료다. 대명사를 만나면 수(단수·복수)부터 맞춰 보자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 때 / 반전 / 나열 / 덧붙임     2-2 [B] 앱 등장 · [E] 기대     2-3 ①");
B("2-1   문장 2 when — 시력을 잃은 '때'를 알려 준다.   문장 4 However — 어둡던 이야기를 뒤집는 '반전'.   문장 8 or — 자원봉사자가 하는 일을 '나열'한다.   문장 12 and — 하나 더 '덧붙인다'.");
B("2-2   [B] 앱 등장(문장 4: However와 함께 Be My Eyes가 나타난다), [E] 기대(문장 12: 삶이 나아지기를 바란다). 보기의 '가격 비교'는 이 글에 없는 역할이다. [A] 소개 → [B] 앱 등장 → [C] 쓰임 → [D] 변화 → [E] 기대 — 소개형 설명문의 전형적 흐름이다.");
B("2-3   정답 ①. 앱의 정체와 쓰임, 새 기능을 사실 위주로 알려 주는 설명문이다. ② 가격·명령문이 없으니 광고가 아니고, ③ 날짜와 '나의 하루'가 없으니 일기도, ④ Dear·받는 사람이 없으니 편지도 아니다.");
B("[학습 포인트]   However와 But은 글의 방향을 바꾸는 신호다. 문장 4의 However 앞뒤를 비교하면 '보이지 않는 삶'에서 '앱과 함께하는 삶'으로 이야기가 넘어간 것이 한눈에 보인다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 AI · amazing things     3-3 ⓒ → ⓐ → ⓓ → ⓑ");
B("3-1  재료 찾기 — (2) 문장 10에서 AI에 ○: 새로 더해지는 기능의 이름이다. video calls는 이미 있던 방식일 뿐. (3) 문장 12에서 amazing things에 ○: 시각장애인이 하게 될 일이다. product labels는 자원봉사자가 읽어 주는 예시다.");
B("3-2  뼈대 채우기 — (1) Volunteers  (2) AI  (3) amazing things.  넣으면 Volunteers and AI in Be My Eyes help blind people do more amazing things.가 완성된다.");
B("3-3  정답 순서 — ⓒ Volunteers and AI → ⓐ in Be My Eyes → ⓓ help blind people → ⓑ do more amazing things.");
B("[채점 포인트]  주어 덩어리(ⓒ)가 맨 앞, 마침표가 붙은 덩어리(ⓑ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) blind  (2) volunteers  (3) AI  (4) lives");
B("(1)은 문장 1의 blind, (2)는 문장 6의 volunteers, (3)은 문장 10의 AI, (4)는 문장 12의 lives에서 가져온다. 요약문이 곧 이 글의 흐름이다: 상황(1) → 도움(2) → 변화(3) → 기대(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 1 ②   문장 6 ①   문장 8 ①   문장 11 ③  (정답 선지는 무표시)");
B("문장 1 is blind   ① ✕ [반대] 아주 잘 본다 — 정반대.   ② ○ 볼 수 없다.   ③ ✕ [무관] 의사로 일한다는 말은 지문에 없다.");
B("문장 6 more than 6 million volunteers   ① ○ 600만 명이 넘는 조력자.   ② ✕ [반대] 한 도시에 몇 명뿐 — 정반대.   ③ ✕ [무관] 600만 달러라는 말은 지문에 없다.");
B("문장 8 guide him to a specific place   ① ○ 어떤 장소로 가는 길을 알려 준다.   ② ✕ [반대] 길에 혼자 남겨 둔다 — 정반대.   ③ ✕ [무관] 매일 학교까지 태워 준다는 말은 지문에 없다.");
B("문장 11 the volunteers are still important   ① ✕ [반대] 더는 필요 없다 — 정반대.   ② ✕ [무관] 보수를 받는다는 말은 지문에 없다.   ③ ○ 자원봉사자는 여전히 중요하다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. still(여전히) 하나가 ①과 ③의 운명을 가른다 — 작은 부사를 놓치지 말자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 T · 5 T · 6 F · 7 F · 8 F");
B("1 T — 문장 2.   2 T — 문장 3.   3 F — 문장 5: 문자 메시지가 아니라 영상 통화(video calls)로 연결한다.   4 T — 문장 6.   5 T — 문장 7.   6 F — 문장 8: 상표만이 아니라 우편물·사진 설명·길 안내까지 한다.   7 F — 문장 10: 가상현실이 아니라 인공지능(AI)이다.   8 F — 문장 11: 자원봉사자는 여전히(still) 중요하다.  거짓 문장은 모두 딱 한 요소(text messages, only, virtual reality, no longer)를 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓒ → ⓐ");
B("ⓑ 13살에 시력을 대부분 잃는다(문장 2) → ⓓ 밝고 어두운 것만 구분하게 된다(문장 3) → ⓒ 자원봉사자들이 대신 설명해 주기 시작한다(문장 5–7) → ⓐ 앱이 AI를 더하기 시작한다(문장 10). 글은 현재(문장 1)로 시작해 과거(문장 2)로 돌아간다 — 서술 순서와 사건 순서가 다른 지점이다.", true);
Hs("R3   영영풀이   ·   1 ⓔ · 2 ⓒ · 3 ⓐ · 4 ⓕ · 5 ⓑ · 6 ⓓ");
B("blind = 볼 수 없는 · sight = 사물을 보는 힘(시력) · volunteer = 돈을 받지 않고 돕는 사람 · describe = 어떤 것이 어떠한지 말해 주다 · guide = 누군가에게 길을 알려 주다 · improve = 무언가를 더 좋게 만들다.", true);
Hs("R4   어법 기초   ·   (1) can only tell  (2) is  (3) has  (4) describe");
B("(1) 조동사 can 뒤에는 동사원형 — can tell.   (2) 주어 an app은 단수이므로 is helping. 2면 구문에서 배운 진행형이다.   (3) 주어 It에 맞는 3인칭 단수 — has.   (4) 주어 These volunteers는 복수 — describe.", true);
Hs("R5   빈칸 클로즈   ·   (1) blind (2) sight (3) volunteers (4) describe (5) labels (6) upgrade (7) important (8) lives");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: is ___ ← 상태를 나타내는 말, 6 million ___ ← 사람 수, getting an ___ ← 앱에 생기는 변화, improve their ___ ← 나아지는 것. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 이 앱은 영상 통화를 통해 브라이언을 볼 수 있는 사람들과 연결해 준다.  — connect A with B를 'A를 B와 연결하다'로 옮기는 것이 핵심이다.");
B("(2) AI는 어떤 일들은 인간보다 더 잘할 수 있지만, 자원봉사자들은 여전히 중요하다.  — better than을 '~보다 더 잘'로, still을 '여전히'로 살려 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) These volunteers describe things Brian can’t see.  (2) It has more than 6 million volunteers all over the world.");
B("(1) 문장 7의 복원. ㄱ 첫 글자 대문자 These  ㄴ 주어가 복수이므로 describe(-s 없음)  ㄷ things 뒤에 'Brian can’t see'가 이어진다.");
B("(2) 문장 6의 복원. ㄱ 첫 글자 대문자 It  ㄴ more than 6 million이 한 덩어리로 volunteers를 꾸민다  ㄷ all over the world가 맨 뒤. R4-(3)에서 확인한 has가 여기서 다시 나온다 — 워크북은 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("브라이언 피슐러는 앞이 보이지 않는다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 13살이었을 때 시력의 대부분을 잃었다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("지금 그는 바깥이 밝은지 어두운지만 겨우 알 수 있다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그러나 'Be My Eyes(내 눈이 되어 주세요)'라는 앱이 날마다 그를 돕고 있다!  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 앱은 영상 통화를 통해 브라이언을 볼 수 있는 사람들과 연결해 준다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 전 세계에 600만 명이 넘는 자원봉사자를 두고 있다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 자원봉사자들은 브라이언이 볼 수 없는 것들을 설명해 준다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 그를 위해 제품 상표나 우편물을 읽어 주고, 사진을 설명해 주고, 심지어 특정 장소까지 안내해 줄 수도 있다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이제 'Be My Eyes'는 업그레이드를 앞두고 있다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 인공지능(AI)이라는 새로운 기능을 더하는 중이다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("AI는 어떤 일들은 인간보다 더 잘할 수 있지만, 자원봉사자들은 여전히 중요하다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 업그레이드가 시각장애인들이 더욱 놀라운 일들을 해내고 삶을 나아지게 하는 데 도움이 되기를 바란다!", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
