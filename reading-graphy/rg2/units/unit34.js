/* UNIT 34 — 매년 10만 톤 이상을 먹는 음식 (Level 2)
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
  no: "34",
  title: "매년 10만 톤 이상을 먹는 음식",
  level: "2",
  foot: "UNIT 34  매년 10만 톤 이상을 먹는 음식",
  banner: ["34", "매년 10만 톤 이상을 먹는 음식", "2"],
  timeline: ["1300년대|소금과 교환|영국에 소금을 주고\\n대구를 얻다",
             "1930년대|대구 원정|캐나다·그린란드까지\\n잡으러 떠나다",
             "오늘날|노르웨이산|먹는 대구 대부분을\\n수입해 오다",
             "매년|문화가 되다|크리스마스이브 식탁의\\n특별한 주인공"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 14문장 ═══════════ */
const SENT = [
  "In Portugal, people really love to eat cod.",
  "They eat more than 100,000 tons of salted dried cod every year.",
  "Can you believe that?",
  "It\u2019s 20% of all the cod in the whole world!",
  "Portuguese people started eating cod in the 1300s when Portugal traded salt for codfish with England.",
  "In the 1930s, Portuguese fishermen traveled to Canada and Greenland just to catch cod.",
  "Nowadays, most of the cod that people in Portugal eat actually comes from Norway.",
  "Why do people in Portugal love cod so much?",
  "Well, one reason is that it tastes great.",
  "But it\u2019s not just about the taste.",
  "Eating codfish is a big part of Portuguese culture.",
  "Portuguese people have enjoyed cod dishes for a long time.",
  "They especially love having cod on Christmas Eve with cabbage, eggs, and potatoes.",
  "It\u2019s a special meal that they always get excited about!",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–4 [B]5–7 [C]8–9 [D]10–12 [E]13–14 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 5: "B", 8: "C", 10: "D", 13: "E" };
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
  2: [RM("They"), R(" eat more than 100,000 tons of salted dried cod every year.  ")],
  4: [RM("It\u2019s"), R(" 20% of all the cod in the whole world!  ")],
  9: [R("Well, one reason is that "), RM("it"), R(" tastes great.  ")],
  14: [RM("It\u2019s"), R(" a special meal that they always get excited about!  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u34.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  9: [t("Well, one reason is that ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("it", { size: 19, bold: true, underline: {} }),
      t(" tastes great.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["\u2460 Cod: A Special Food in Portuguese Culture", "\u2461 A Fishing Trip to Canada and Greenland",
 "\u2462 Christmas Foods Around the World", "\u2463 How to Stay Healthy by Eating Fish",
 "\u2464 Table Manners in Portugal"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["\u2460 People in Portugal eat more than 100,000 tons of cod every year.",
 "\u2461 Portugal traded salt for codfish with England in the 1300s.",
 "\u2462 In the 1930s, Portuguese fishermen went to Canada and Greenland.",
 "\u2463 Nowadays, most of the cod in Portugal comes from England.",
 "\u2464 Portuguese people love having cod on Christmas Eve."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) it이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["\u2460 the cod",
 "\u2461 the salt from England",
 "\u2462 the great taste",
 "\u2463 the whole world",
 "\u2464 a Christmas gift"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("포르투갈에서, 사람들은 대구 먹는 것을 정말 좋아한다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("people / to / In / really / cod / love / Portugal, / eat", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 6", { size: 14, bold: true, color: AMB }), t("   to부정사 '~하기 위해' (목적)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("traveled to Canada and Greenland ", { size: 18 }), t("just to catch cod", { size: 18, bold: true, color: NAVY, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 '~하기 위해'라는 목적을 나타냅니다. just가 붙으면 '오직 ~하기 위해'!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   동명사 주어 '~하는 것은'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Eating codfish", { size: 18, bold: true, color: NAVY, underline: {} }), t(" is a big part of Portuguese culture", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사원형+ing가 주어 자리에 오면 '~하는 것은'. 동명사 주어는 단수 취급합니다!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 6 구문", [t("I went to the library ", { size: 19 }), t("to read books", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
 ["문장 11 구문", [t("Playing soccer", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is a lot of fun.", { size: 19 })]],
 ["둘 다!", [t("Studying hard", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is important ", { size: 19 }), t("to pass the test", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 9를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1050, 1950, 700, 950, 700, 1600, 1980], [new TableRow({ children: [
    exSeg([t("Well,", { size: 18 })], "", FAINT, 1050),
    exSeg([t("one reason", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1950),
    exSeg([t("is", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 700, "\u25b3"),
    exSeg([t("that", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 950),
    exSeg([t("it", { size: 18, bold: true, color: SGRN, underline: {} })], "S\u2032 주어", SGRN, 700),
    exSeg([t("tastes", { size: 18, bold: true, color: NAVY })], "V\u2032 동사", NAVY, 1600, "\u25b3"),
    exSeg([t("great", { size: 18 })], "", FAINT, 1980),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[6, "In the 1930s, Portuguese fishermen traveled to Canada and Greenland just to catch cod."],
 [11, "Eating codfish is a big part of Portuguese culture."],
 [12, "Portuguese people have enjoyed cod dishes for a long time."]].forEach(([n, c]) => {
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
["\u2460 한국의 도시 '대구' 여행", "\u2461 포르투갈 사람들의 대구(cod) 사랑", "\u2462 캐나다와 그린란드의 어부들"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["cod", "대구(생선)"], ["salt", "소금"], ["love", "사랑하다"], ["fishermen", "어부들"], ["culture", "문화"], ["Norway", "노르웨이"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 사람들의 마음  ③ 사랑의 진짜 이유 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · them 같은 지시어는 앞에 나온 말을 대신합니다. 같은 they라도 다른 것을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
      labC("they =", 820), chipC("사람들", 1200), gapC(170), chipC("버스들", 1200), gapC(300),
      labC("them =", 930), chipC("사람들", 1200), gapC(170), chipC("버스들", 1200),
    ] })]);
    return [
    ["2", "They", [t("people in Portugal (포르투갈 사람들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["4", "It", chips2("먹는 대구의 양", "소금의 양", 1900), false],
    ["9", "it", chips2("cod (대구)", "salt (소금)", 1900), false],
    ["14", "It", chips2("이브의 대구 식사", "크리스마스 선물", 2100), false],
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
    ["5", [t("Portuguese people started eating cod in the 1300s ", { size: 17 }), t("when", { size: 17, bold: true, color: NAVY, underline: {} }), t(" Portugal traded salt with England.", { size: 17 })], ["때", "이유"]],
    ["7", [t("Nowadays", { size: 17, bold: true, color: NAVY, underline: {} }), t(", most of the cod actually comes from Norway.", { size: 17 })], ["현재", "과거"]],
    ["8", [t("Why", { size: 17, bold: true, color: NAVY, underline: {} }), t(" do people in Portugal love cod so much?", { size: 17 })], ["이유 묻기", "장소 묻기"]],
    ["10", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" it\u2019s not just about the taste.", { size: 17 })], ["반전", "순서"]],
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
    chipCellG("유래", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("문화", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("문제점", 1400),
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
  flowCell("A", "소개", "문장 1–4", false),
  arrowCell(),
  flowCell("B", null, "문장 5–7", true),
  arrowCell(),
  flowCell("C", "맛", "문장 8–9", false),
  arrowCell(),
  flowCell("D", null, "문장 10–12", true),
  arrowCell(),
  flowCell("E", "마무리", "문장 13–14", false),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["\u2460 대상을 소개하고 사실을 알려 주는 설명문",
 "\u2461 하루 일을 기록한 일기",
 "\u2462 물건을 팔기 위해 만든 광고",
 "\u2463 안부를 묻는 편지",
 "\u2464 상상의 인물이 나오는 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "1", "이 글의 주인공(소재)은 무엇인가요? (한 단어)", "cod", "love 뒤 자리 (대상)", true),
  matRow("2", "1", "사람들의 마음을 나타낸 말은?", ["love", "catch"], "주어 뒤 자리 (마음)", false),
  matRow("3", "11", "대구 먹기가 큰 부분을 차지하는 것은?", ["culture", "taste"], "Portuguese 뒤 자리 (진짜 이유)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("People in Portugal  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   because it is a big part of Portuguese  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("\u24D0 because it is a big part     \u24D1 love cod     \u24D2 People in Portugal     \u24D3 of Portuguese culture.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  \u24D2  )", { size: 19 }), t("  \u2192  (      )  \u2192  (      )  \u2192  (      )", { size: 19 }),
  t("      \u24D2가 맨 앞 \u2014 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("Norway        culture        love        taste", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("People in Portugal really (1) ____________ cod and eat a lot of it every year. Long ago they traded salt to get it, and today most of it comes from (2) ____________. They love its great (3) ____________, but eating cod is also a big part of Portuguese (4) ____________.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 2, main: "more than 100,000 tons",
    opts: ["\u2460 a very small amount", "\u2461 a very large amount", "\u2462 about 100 kinds of fish"] },
  { sn: 6, main: "just to catch cod",
    opts: ["\u2460 only to get cod", "\u2461 to sell their boats", "\u2462 to stop catching cod"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 9, main: "it tastes great",
    opts: ["\u2460 it looks beautiful", "\u2461 it is delicious", "\u2462 it tastes terrible"] },
  { sn: 14, main: "get excited about",
    opts: ["\u2460 feel very happy about", "\u2461 feel bored with", "\u2462 pay a lot of money for"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 포르투갈의 국민 음식, 바칼랴우 (bacalhau)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("포르투갈 사람들은 대구를 '바칼랴우(bacalhau)'라고 부른다. 냉장고가 없던 시절, 소금에 절여 말린 대구는 오래 두고 먹을 수 있어서 바다에서 먼 마을까지 전해질 수 있었다. 그래서 포르투갈에는 '바칼랴우 요리법이 365가지라서 매일 다르게 먹을 수 있다'는 말이 있을 정도다. 정작 포르투갈 앞바다에서는 대구가 거의 잡히지 않아, 대구는 늘 먼 바다에서 온 귀한 손님이었다. 그런데도 국민 음식이 된 것은, 음식이 맛을 넘어 역사와 추억까지 담고 있기 때문이다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u34.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Steve went for a morning walk in a park in Singapore.",
    "It was bright and sunny when Steve walked.",
    "Steve saw about 20 furry animals near the water.",
    "A jogger stepped on an otter on purpose.",
    "The otters thought Steve was a danger too.",
    "Steve easily stopped the angry otters.",
    "Steve climbed a tree to get away from the otters.",
    "The otters never went back to the water.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "스티브에게 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["\u24D0 Steve climbed a tree to get away.",
      "\u24D1 Steve saw furry animals near the water.",
      "\u24D2 A jogger stepped on an otter by accident.",
      "\u24D3 The otters started biting Steve."]
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
    ["1  furry", "\u24D0 by mistake, not on purpose"],
    ["2  suddenly", "\u24D1 to go up something"],
    ["3  accidentally", "\u24D2 quickly, without warning"],
    ["4  danger", "\u24D3 to become quiet and relaxed"],
    ["5  climb", "\u24D4 covered with soft hair"],
    ["6  calm down", "\u24D5 something that can hurt you"],
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
[["문장 3", [t("While he ", { size: 19 }), t("( was walking  /  walking )", { size: 19, bold: true, color: NAVY }), t(", he saw about 20 furry animals.", { size: 19 })], "진행형은 be+~ing — 한 덩어리의 동사예요."],
 ["문장 8", [t("The otters thought Steve ", { size: 19 }), t("( was  /  is )", { size: 19, bold: true, color: NAVY }), t(" a danger too.", { size: 19 })], "thought(과거)와 어울리는 시제를 고르세요."],
 ["문장 10", [t("Steve climbed a tree ", { size: 19 }), t("( to get  /  got )", { size: 19, bold: true, color: NAVY }), t(" away from the otters.", { size: 19 })], "'~하기 위해'는 to+동사원형!"],
 ["문장 12", [t("Be careful, even if they ", { size: 19 }), t("( look  /  looks )", { size: 19, bold: true, color: NAVY }), t(" cute.", { size: 19 })], "주어 they(복수)에 맞는 동사 형태는?"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("walk  /  otters  /  stepped  /  angry  /  biting  /  tree  /  water  /  careful", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" In a park in Singapore, a man named Steve went for a morning", { size: 19 }), ...BL(1), t(".  ", { size: 19 }),
  num(2), t(" It was still dark and quiet.  ", { size: 19 }),
  num(3), t(" While he was walking, he saw about 20 furry animals near the water.  ", { size: 19 }),
  num(4), t(" They were", { size: 19 }), ...BL(2), t("!  ", { size: 19 }),
  num(5), t(" He stopped for a moment and got close to look at the cute animals.  ", { size: 19 }),
  num(6), t(" Suddenly, a jogger ran by, and he accidentally", { size: 19 }), ...BL(3), t("on an otter.  ", { size: 19 }),
  num(7), t(" The other otters got", { size: 19 }), ...BL(4), t("and scared.  ", { size: 19 }),
  num(8), t(" The otters thought Steve was a danger too, so they ran toward him and started", { size: 19 }), ...BL(5), t("his ankles and legs.  ", { size: 19 }),
  num(9), t(" Steve tried to stop them, but he couldn\u2019t.  ", { size: 19 }),
  num(10), t(" At last, Steve climbed a", { size: 19 }), ...BL(6), t("to get away from the angry otters.  ", { size: 19 }),
  num(11), t(" He stayed there until the otters calmed down and went back to the", { size: 19 }), ...BL(7), t(".  ", { size: 19 }),
  num(12), t(" Steve learned a lesson: always be", { size: 19 }), ...BL(8), t("around wild animals, even if they look cute.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[10, "At last, Steve climbed a tree to get away from the angry otters."],
 [12, "Always be careful around wild animals, even if they look cute."]].forEach(([n, s], i) => {
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
w7block("1", "다른 수달들은 화가 나고 겁을 먹었다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 7단어)",
  "other / angry / got / the / otters / and / scared");
w7block("2", "스티브는 그들을 멈추려고 했지만, 그럴 수 없었다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 8단어)",
  "Steve / tried / to / stop / them / but / he / couldn\u2019t");

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

K.push(...tab("정답 및 해설", "UNIT 34  매년 10만 톤 이상을 먹는 음식", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("\u2460      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("\u2461      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("\u2460", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("It was still dark and quiet.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("jogger(S)\u00b7ran(\u25b3V)\u00b7and[네모]\u00b7he(S)\u00b7stepped(\u25b3V)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("Steve(S)\u00b7climbed(\u25b3V)\u00b7to get away~(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문11 ", { size: 17, bold: true, color: NAVY2 }), t("He(S)\u00b7stayed(\u25b3V)\u00b7until[네모]\u00b7otters(S\u2032)\u00b7calmed down\u00b7went back(\u25b3V\u2032)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 '미나'라는 이름의 소녀를 만났다  (2) 그는 버스를 잡기 위해 빨리 달렸다  (3) 우리는 사진을 찍기 위해 '불국사'라는 절을 방문했다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 \u2461   1-2 otters · angry · careful        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 때 · 결과 · 반전 · ~까지   2-2 [B] 사고 · [E] 교훈   2-3 \u2460", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 \u24D2 \u2192 \u24D0 \u2192 \u24D1 \u2192 \u24D3  ·  Always be careful around wild animals, even if they look cute.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) cute  (2) angry  (3) tree  (4) careful        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 2 \u2461  문장 5 \u2460  문장 9 \u2461  문장 12 \u2460", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("\u24D1 → \u24D2 → \u24D3 → \u24D0", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1\u24D4 · 2\u24D2 · 3\u24D0 · 4\u24D5 · 5\u24D1 · 6\u24D3        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) was walking  (2) was  (3) to get  (4) look", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) walk (2) otters (3) stepped (4) angry (5) biting (6) tree (7) water (8) careful", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) The other otters got angry and scared.  (2) Steve tried to stop them, but he couldn\u2019t.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 \u2460");
B("이 글은 수달에게 물린 남자(문장 6\u20139)와 그가 배운 교훈(문장 12)을 들려주는 이야기다. 소재(otters)와 교훈(cute but dangerous)을 모두 담은 \u2460이 제목으로 적절하다. \u2461·\u2463은 본문의 배경(산책·조깅)만 건드린 지엽적 오답, \u2462·\u2464는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 \u2461");
B("문장 2에서 '아직 어둡고 조용했다(still dark and quiet)'고 했으므로, 밝았다는 \u2461은 본문과 반대된다. \u2460은 문장 3, \u2462는 문장 6, \u2463은 문장 10, \u2464는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 \u2460");
B("(A) them은 바로 앞 문장 8에서 스티브를 물기 시작한 화난 수달들을 가리킨다. 스티브가 멈추려던 대상이 무엇인지 생각하면 된다 \u2014 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   It was still dark and quiet.");
B("문장 2를 그대로 복원하는 문제다. \u2460 날씨·시간을 나타내는 문장의 주어는 It \u2014 첫 글자는 대문자.   \u2461 still(아직)의 위치는 was 뒤.   \u2462 dark and quiet \u2014 두 형용사를 and로 잇는다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 \u2461     1-2 otters · angry · careful     1-3 아래 참조");
B("1-1   정답 \u2461. 이 글은 산책하던 스티브가 화난 수달들에게 물린 사건과 그 교훈을 들려준다. \u2460 산책은 사건의 배경일 뿐이고, \u2462 수달의 먹이 이야기는 나오지 않는다.");
B("1-2   \u25cb표 할 세 단어: otters(힌트\u2460 주인공) · angry(힌트\u2461 수달들의 감정) · careful(힌트\u2462 글쓴이의 교훈). 나머지 셋(park · jogger · water)은 본문에 등장하지만 주제문에 들어가지 않는다 \u2014 배경과 계기일 뿐이다. 빈도가 아니라 '주제문에 없으면 말이 안 되는 말'을 고르는 것이 기준이다.");
B("1-3   문장 9 \u2014 them은 수달들에 \u25cb (스티브가 멈추려던 대상).   문장 11 \u2014 there는 나무 위에 \u25cb (문장 10에서 올라간 곳).   문장 12 \u2014 they는 wild animals에 \u25cb (귀여워 보여도 조심해야 할 대상).");
B("[학습 포인트]   문장 11의 there가 이 지문의 백미다. 지시어는 사람·사물만이 아니라 장소도 대신한다(there = 문장 10의 나무 위). 지시어를 만날 때마다 '이게 뭘 가리키지?'를 확인해 화살표로 연결해 두자. 이 습관이 고등 독해의 지칭 추론 문항으로 그대로 이어진다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 때 / 결과 / 반전 / ~까지     2-2 [B] 사고 · [E] 교훈     2-3 \u2460");
B("2-1   문장 3 While \u2014 걷고 있던 '때'에 수달들을 보았다.   문장 8 so \u2014 위험하다고 생각한 원인의 '결과'로 달려들었다.   문장 9 but \u2014 멈추려 했지만 못 했다는 '반전'.   문장 11 until \u2014 수달들이 진정할 '때까지' 나무 위에 있었다.");
B("2-2   [B] 사고(문장 5\u20136: 다가갔다가 조거가 수달을 밟는 사고가 난다), [E] 교훈(문장 12: 야생 동물을 조심하라). 보기의 '광고'는 이 글에 없는 역할이다. [A] 만남 \u2192 [B] 사고 \u2192 [C] 위기 \u2192 [D] 탈출 \u2192 [E] 교훈 \u2014 사건이 있는 이야기 글의 전형적인 흐름이다.");
B("2-3   정답 \u2460. 스티브가 실제로 겪은 사건을 시간 순서대로 들려주고 마지막에 교훈을 남기는 이야기(경험담)다. \u2461 광고의 신호(사라는 말·가격)가 없고, \u2462 요리법·\u2463 시·\u2464 초대장의 형식도 아니다.");
B("[학습 포인트]   연결어만 표시해도 글의 지도가 그려진다. While(때), so(결과), but(반전), until(끝나는 지점). 특히 이야기 글의 마지막 문장은 글쓴이가 진짜 하고 싶은 말 \u2014 교훈의 신호다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 careful · cute     3-3 (c) \u2192 (a) \u2192 (b) \u2192 (d)");
B("3-1  재료 찾기 \u2014 (2) 문장 12에서 careful에 \u25cb: 교훈의 핵심 태도다. scared는 수달들의 감정이지 교훈이 아니다. (3) 문장 12에서 cute에 \u25cb: even if 뒤에 놓일 겉모습이다. dark는 문장 2의 배경일 뿐. 주제문의 재료는 언제나 본문 안에 있다.");
B("3-2  뼈대 채우기 \u2014 (1) wild animals  (2) careful  (3) cute.  넣으면 Always be careful around wild animals, even if they look cute.가 완성된다.");
B("3-3  정답 순서 \u2014 \u24D2 always be careful \u2192 \u24D0 around wild animals \u2192 \u24D1 even if \u2192 \u24D3 they look cute.  완성 문장: Always be careful around wild animals, even if they look cute.");
B("[채점 포인트]  명령문이므로 동사 덩어리(\u24D2)가 맨 앞, 마침표가 붙은 덩어리(\u24D3)가 맨 뒤 \u2014 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) cute  (2) angry  (3) tree  (4) careful");
B("(1)은 문장 5의 cute, (2)는 문장 7의 angry, (3)은 문장 10의 tree, (4)는 문장 12의 careful에서 가져온다. 요약문이 곧 이 글의 흐름이다: 만남(1) \u2192 위기(2) \u2192 탈출(3) \u2192 교훈(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 2 \u2461   문장 5 \u2460   문장 9 \u2461   문장 12 \u2460  (정답 선지는 무표시)");
B("문장 2 still dark and quiet   \u2460 ✕ [반대] 밝고 시끄럽다 \u2014 정반대.   \u2461 ○ 아직 해가 안 떠서 어둡고 소리가 없다.   \u2462 ✕ [무관] 사람이 많다는 말은 지문에 없다.");
B("문장 5 got close   \u2460 ○ moved near = 가까이 다가갔다.   \u2461 ✕ [반대] 멀리 달아났다 \u2014 정반대.   \u2462 ✕ [무관] 사진을 찍었다는 말은 지문에 없다.");
B("문장 9 tried to stop them, but couldn\u2019t   \u2460 ✕ [반대] 쉽게 멈추게 했다 \u2014 정반대.   \u2461 ○ failed to stop them = 멈추게 하지 못했다.   \u2462 ✕ [무관] 먹이를 주고 싶었다는 말은 지문에 없다.");
B("문장 12 be careful around wild animals   \u2460 ○ watch out near wild animals = 야생 동물 근처에서 조심하다.   \u2461 ✕ [반대] 자유롭게 논다 \u2014 정반대.   \u2462 ✕ [무관] 반려동물로 기른다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. 지문을 읽을 때마다 '이 표현을 다른 말로 하면?'을 스스로 물어보자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T \u2014 문장 1.   2 F \u2014 문장 2: 밝은 게 아니라 아직 어둡고 조용했다.   3 T \u2014 문장 3.   4 F \u2014 문장 6: 일부러(on purpose)가 아니라 실수로(accidentally) 밟았다.   5 T \u2014 문장 8.   6 F \u2014 문장 9: 멈추려 했지만 그럴 수 없었다.   7 T \u2014 문장 10.   8 F \u2014 문장 11: 진정한 뒤 물로 돌아갔다.  거짓 문장은 모두 본문에서 딱 한 단어(bright, on purpose, easily, never)를 비튼 것이다 \u2014 그 한 단어를 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   (b) \u2192 (c) \u2192 (d) \u2192 (a)");
B("\u24D1 물가에서 털북숭이 동물들을 본다(문장 3) \u2192 \u24D2 조거가 실수로 수달을 밟는다(문장 6) \u2192 \u24D3 수달들이 스티브를 물기 시작한다(문장 8) \u2192 \u24D0 스티브가 나무에 올라가 피한다(문장 10). 이 글은 사건이 일어난 순서 그대로 서술된 이야기이므로, 문장 번호를 따라가면 순서가 보인다.", true);
Hs("R3   영영풀이   ·   1 (e) · 2 (c) · 3 (a) · 4 (f) · 5 (b) · 6 (d)");
B("furry = covered with soft hair(부드러운 털로 덮인) · suddenly = 갑자기, 예고 없이 · accidentally = 실수로, 고의가 아니게 · danger = 다치게 할 수 있는 것 · climb = 위로 올라가다 · calm down = 조용하고 편안해지다.", true);
Hs("R4   어법 기초   ·   (1) was walking  (2) was  (3) to get  (4) look");
B("(1) 진행형은 be+~ing가 한 덩어리의 동사다 \u2014 was walking. 2면 분석 Tip의 그 원칙이다.   (2) thought(과거)와 시제를 맞춘다 \u2014 was.   (3) '~하기 위해'는 to+동사원형 \u2014 to get. 2면 구문에서 배운 그 문장이다.   (4) 주어 they는 복수 \u2014 look.", true);
Hs("R5   빈칸 클로즈   ·   (1) walk (2) otters (3) stepped (4) angry (5) biting (6) tree (7) water (8) careful");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: morning ___ \u2190 아침 산책, They were ___! \u2190 정체가 밝혀지는 문장, climbed a ___ \u2190 올라간 곳, always be ___ \u2190 교훈. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 마침내 스티브는 화난 수달들에게서 벗어나기 위해 나무에 올라갔다.  \u2014 to get away(to부정사)를 '~하기 위해'로 옮기는 것이 핵심이다.");
B("(2) 야생 동물이 귀여워 보여도 언제나 조심해라.  \u2014 even if를 '~일지라도/~해 보여도'로 자연스럽게 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) The other otters got angry and scared.  (2) Steve tried to stop them, but he couldn\u2019t.");
B("(1) 문장 7의 복원. \u3131 첫 글자 대문자 The  \u3134 got angry and scared \u2014 두 형용사를 and로 잇는다.");
B("(2) 문장 9의 복원. \u3131 첫 글자 대문자 Steve  \u3134 stop them 뒤의 콤마를 빠뜨리지 않는다  \u3137 but he couldn\u2019t로 문장이 끝난다. R4-(3)의 to부정사와 짝을 이루는 'try to+동사원형'이 여기서 다시 나온다 \u2014 워크북은 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("싱가포르의 한 공원에서, 스티브라는 이름의 남자가 아침 산책에 나섰다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("아직 어둡고 조용했다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("걷고 있던 중에, 그는 물가에서 약 20마리의 털북숭이 동물들을 보았다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것들은 수달이었다!  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 잠시 멈춰 서서 그 귀여운 동물들을 보려고 가까이 다가갔다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("갑자기 한 조거가 옆으로 달려 지나가다가, 실수로 수달 한 마리를 밟았다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("다른 수달들은 화가 나고 겁을 먹었다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("수달들은 스티브도 위험한 존재라고 생각해서, 그를 향해 달려들어 발목과 다리를 물기 시작했다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("스티브는 그들을 멈추려고 했지만, 그럴 수 없었다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("마침내 스티브는 화난 수달들에게서 벗어나기 위해 나무에 올라갔다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그는 수달들이 진정하고 물로 돌아갈 때까지 그곳에 머물렀다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("스티브는 그날 교훈을 배웠다: 야생 동물이 귀여워 보여도, 언제나 조심하라.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
