/* UNIT 25 — 작은 오해에서 비롯된 이름 (Level 2)
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
  no: "25",
  title: "작은 오해에서 비롯된 이름",
  level: "2",
  foot: "UNIT 25  작은 오해에서 비롯된 이름",
  banner: ["25", "작은 오해에서 비롯된 이름", "2"],
  timeline: ["1502|넓은 만 도착|1월 1일, 포르투갈 배가\\n낯선 물길에 닿다|drop_x",
             "오해|강으로 착각|만을 강으로 잘못 보고\\n1월의 강이라 부르다|sparkle_drop",
             "300년|포르투갈의 지배|이름은 그대로 둔 채\\n식민지 시대가 이어지다|city",
             "오늘|강 없는 도시|강은 없어도\\n이름은 남았다|sun"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "Rio de Janeiro is a city in Brazil, South America.",
  "It’s famous for its beautiful nature, exciting culture, and history.",
  "In Portuguese, Rio means “river” and Janeiro means “January.”",
  "So, Rio de Janeiro means “River of January.”",
  "But there isn’t actually a river in Rio de Janeiro!",
  "How did the city get its name?",
  "On January 1, 1502, people from Portugal arrived at a wide bay.",
  "They thought it was a river by mistake!",
  "Since it was January, they decided to call the place “Rio de Janeiro” in Portuguese.",
  "Since then, Brazil was ruled by Portugal for over 300 years.",
  "It became independent in 1882, but Rio de Janeiro’s name stayed the same.",
  "That’s how this beautiful city in Brazil got its name!",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–5 [C]6–7 [D]8–9 [E]10–12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 6: "C", 8: "D", 10: "E" };
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
  2: [RM("It"), R("’s famous for its beautiful nature, exciting culture, and history.  ")],
  8: [RM("They"), R(" thought "), RM("it"), R(" was a river by mistake!  ")],
  10: [R("Since "), RM("then"), R(", Brazil was ruled by Portugal for over 300 years.  ")],
  11: [RM("It"), R(" became independent in 1882, but Rio de Janeiro’s name stayed the same.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u25.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  8: [t("They thought ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("it", { size: 19, bold: true, underline: {} }),
      t(" was a river by mistake!  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① A City Named by a Small Mistake", "② The Longest Rivers in South America",
 "③ Portuguese Words for the Months", "④ How to Travel in Brazil Cheaply",
 "⑤ Why Brazil Became Independent"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Rio de Janeiro is a city in Brazil, South America.",
 "② In Portuguese, Janeiro means “January.”",
 "③ There is a big river in the middle of Rio de Janeiro.",
 "④ People from Portugal arrived at a wide bay in 1502.",
 "⑤ Brazil was ruled by Portugal for over 300 years."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) it이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the wide bay",
 "② the city of Rio de Janeiro",
 "③ the country of Portugal",
 "④ the month of January",
 "⑤ the name of the city"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그때 이후로, 브라질은 300년 넘게 포르투갈의 지배를 받았다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 11단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("ruled / Brazil / for / then, / by / was / Since / years. / 300 / Portugal / over", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 5", { size: 14, bold: true, color: AMB }), t("   there is/are — '~가 있다 / 없다'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("But ", { size: 18 }), t("there isn’t", { size: 18, bold: true, color: NAVY }), t(" actually ", { size: 18 }), t("a river", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("there는 뜻이 없고, 뒤에 오는 명사가 진짜 주어입니다. '강이 없다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 10", { size: 14, bold: true, color: AMB }), t("   수동태 be+p.p — '~되다, ~당하다'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Brazil ", { size: 18 }), t("was ruled", { size: 18, bold: true, color: NAVY, underline: {} }), t(" by Portugal", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+과거분사는 '~되다'. by 뒤에 그 일을 한 쪽이 옵니다. '지배를 받았다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 5 구문", [t("There isn’t", { size: 19, bold: true, color: NAVY }), t(" a bookstore", { size: 19, underline: {} }), t(" in my town.", { size: 19 })]],
 ["문장 10 구문", [t("The window ", { size: 19 }), t("was broken", { size: 19, bold: true, color: NAVY, underline: {} }), t(" by my brother.", { size: 19 })]],
 ["둘 다!", [t("There is", { size: 19, bold: true, color: NAVY }), t(" a letter", { size: 19, underline: {} }), t(", and it ", { size: 19 }), t("was written", { size: 19, bold: true, color: NAVY, underline: {} }), t(" by my aunt.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 11을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([560, 1000, 1250, 1080, 640, 2500, 950, 950], [new TableRow({ children: [
    exSeg([t("It", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 560),
    exSeg([t("became", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1000, "△"),
    exSeg([t("independent", { size: 18 })], "", FAINT, 1250),
    exSeg([t("in 1882,", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1080),
    exSeg([t("but", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 640),
    exSeg([t("Rio de Janeiro’s name", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 2500),
    exSeg([t("stayed", { size: 18, bold: true, color: NAVY })], "V′ 동사", NAVY, 950, "△"),
    exSeg([t("the same.", { size: 18 })], "", FAINT, 950),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[7, "On January 1, 1502, people from Portugal arrived at a wide bay."],
 [9, "Since it was January, they decided to call the place “Rio de Janeiro” in Portuguese."],
 [10, "Since then, Brazil was ruled by Portugal for over 300 years."]].forEach(([n, c]) => {
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
["① 포르투갈어로 배우는 달 이름", "② 작은 오해에서 생긴 도시 이름", "③ 남아메리카에서 가장 긴 강"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["river", "강"], ["name", "이름"], ["culture", "문화"], ["mistake", "실수"], ["Portugal", "포르투갈"], ["stayed", "그대로였다"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 도시가 얻은 것  ② 그 이름이 생긴 계기  ③ 그 뒤 이름에 일어난 일 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · then 같은 지시어는 앞에 나온 말을 대신합니다. 같은 It이라도 다른 것을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
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
    const chips8 = () => T([760, 1150, 150, 1150, 250, 700, 1150, 150, 1150], [new TableRow({ children: [
      labC("They =", 760), chipC("포르투갈인", 1150), gapC(150), chipC("브라질인", 1150), gapC(250),
      labC("it =", 700), chipC("넓은 만", 1150), gapC(150), chipC("긴 강", 1150),
    ] })]);
    return [
    ["2", "It", [t("Rio de Janeiro (그 도시)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["8", "They / it", chips8(), false],
    ["10", "then", chips2("1502년 그 뒤", "1882년 그 뒤", 1900), false],
    ["11", "It", chips2("브라질", "리우데자네이루", 1900), false],
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
    ["4", [t("So", { size: 17, bold: true, color: NAVY, underline: {} }), t(", Rio de Janeiro means “River of January.”", { size: 17 })], ["결과", "반전"]],
    ["5", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" there isn’t actually a river in Rio de Janeiro!", { size: 17 })], ["반전", "이유"]],
    ["9", [t("Since", { size: 17, bold: true, color: NAVY, underline: {} }), t(" it was January, they decided to call the place “Rio de Janeiro.”", { size: 17 })], ["이유", "순서"]],
    ["10", [t("Since then", { size: 17, bold: true, color: NAVY, underline: {} }), t(", Brazil was ruled by Portugal for over 300 years.", { size: 17 })], ["그때부터", "결과"]],
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
    chipCellG("이름 뜻", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("요리법", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("마무리", 1400),
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
  flowCell("A", "소개", "문장 1–2", false),
  arrowCell(),
  flowCell("B", null, "문장 3–5", true),
  arrowCell(),
  flowCell("C", "의문", "문장 6–7", false),
  arrowCell(),
  flowCell("D", "유래", "문장 8–9", false),
  arrowCell(),
  flowCell("E", null, "문장 10–12", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 도시 이름의 유래를 알려 주는 설명문",
 "② 여행 상품을 파는 광고",
 "③ 하루 일과를 적은 일기",
 "④ 친구에게 보내는 편지",
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
  matRow("1", "6", "이 글에서 도시가 얻은 것은 무엇인가요? (한 단어)", "name", "got its 뒤 자리", true),
  matRow("2", "8", "만을 강이라고 잘못 본 일을 나타낸 말은?", ["mistake", "river"], "by 뒤 자리 (계기)", false),
  matRow("3", "11", "그 뒤 이름은 어떻게 되었나요?", ["stayed", "changed"], "name 뒤 자리 (결과)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("Rio de Janeiro got its  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   by  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t(" , but the name  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  the same.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ but the name     ⓑ Rio de Janeiro got     ⓒ stayed the same.     ⓓ its name by mistake,", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("river        mistake        name        same", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Rio de Janeiro means “River of January,” but there is no (1) ____________ there. In 1502, people from Portugal thought a wide bay was a river by (2) ____________ and gave the place this (3) ____________. Even after 300 years, the name stayed the (4) ____________.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 5, main: "there isn’t actually a river",
    opts: ["① a big river runs through the city", "② no river is really there", "③ the river is very short"] },
  { sn: 8, main: "by mistake",
    opts: ["① not on purpose", "② on purpose", "③ with the help of a map"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 10, main: "was ruled by Portugal",
    opts: ["① Brazil ruled Portugal", "② Brazil sold coffee to Portugal", "③ Portugal was in control of Brazil"] },
  { sn: 11, main: "stayed the same",
    opts: ["① changed into a new one", "② did not change", "③ became much longer"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 오해가 만든 지명 (place names)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("세계 지도에는 오해에서 생긴 이름이 뜻밖에 많다. 1502년 1월, 포르투갈 배가 닿은 곳은 강이 아니라 바다가 육지 안으로 깊이 들어온 넓은 만(bay)이었다. 강어귀로 착각한 사람들은 도착한 달을 붙여 '1월의 강'이라고 적었고, 그 이름이 500년 넘게 남았다. 콜럼버스가 아메리카를 인도로 착각해 원주민을 '인디언'이라 부른 것도 같은 종류의 실수다. 지명에는 그 땅을 처음 본 사람의 눈과 말이 그대로 담겨 있어서, 이름 하나에도 역사가 숨어 있다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u25.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Rio de Janeiro is a city in Brazil, South America.",
    "In Portuguese, Rio means “January.”",
    "There isn’t actually a river in Rio de Janeiro.",
    "People from Portugal arrived at a wide bay in 1502.",
    "They thought the bay was a lake by mistake.",
    "They called the place “Rio de Janeiro” because it was January.",
    "Brazil was ruled by Spain for over 300 years.",
    "After Brazil became independent, the city changed its name.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "리우데자네이루의 이름에 얽힌 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Brazil became independent, but the name stayed the same.",
      "ⓑ People from Portugal arrived at a wide bay.",
      "ⓒ Portugal ruled Brazil for over 300 years.",
      "ⓓ They called the place “Rio de Janeiro.”"]
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
    ["1  famous", "ⓐ to get to a place"],
    ["2  arrive", "ⓑ free from the control of others"],
    ["3  bay", "ⓒ known by many people"],
    ["4  mistake", "ⓓ an area of sea with land around it"],
    ["5  rule", "ⓔ to have power over a country"],
    ["6  independent", "ⓕ something you do wrong without meaning to"],
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
[["문장 1", [t("Rio de Janeiro ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" a city in Brazil, South America.", { size: 19 })], "주어가 하나(단수)일 때 be동사는 무엇일까요?"],
 ["문장 5", [t("But there ", { size: 19 }), t("( isn’t  /  aren’t )", { size: 19, bold: true, color: NAVY }), t(" actually a river in Rio de Janeiro!", { size: 19 })], "there 뒤의 명사(a river)가 진짜 주어예요."],
 ["문장 8", [t("They thought it ", { size: 19 }), t("( was  /  is )", { size: 19, bold: true, color: NAVY }), t(" a river by mistake!", { size: 19 })], "thought(과거)와 어울리는 시제를 고르세요."],
 ["문장 10", [t("Brazil ", { size: 19 }), t("( was ruled  /  ruled )", { size: 19, bold: true, color: NAVY }), t(" by Portugal for over 300 years.", { size: 19 })], "'지배를 받았다'는 be동사+과거분사!"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("famous  /  river  /  name  /  arrived  /  mistake  /  ruled  /  independent  /  stayed", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Rio de Janeiro is a city in Brazil, South America.  ", { size: 19 }),
  num(2), t(" It’s", { size: 19 }), ...BL(1), t("for its beautiful nature, exciting culture, and history.  ", { size: 19 }),
  num(3), t(" In Portuguese, Rio means “river” and Janeiro means “January.”  ", { size: 19 }),
  num(4), t(" So, Rio de Janeiro means “River of January.”  ", { size: 19 }),
  num(5), t(" But there isn’t actually a", { size: 19 }), ...BL(2), t("in Rio de Janeiro!  ", { size: 19 }),
  num(6), t(" How did the city get its", { size: 19 }), ...BL(3), t("?  ", { size: 19 }),
  num(7), t(" On January 1, 1502, people from Portugal", { size: 19 }), ...BL(4), t("at a wide bay.  ", { size: 19 }),
  num(8), t(" They thought it was a river by", { size: 19 }), ...BL(5), t("!  ", { size: 19 }),
  num(9), t(" Since it was January, they decided to call the place “Rio de Janeiro” in Portuguese.  ", { size: 19 }),
  num(10), t(" Since then, Brazil was", { size: 19 }), ...BL(6), t("by Portugal for over 300 years.  ", { size: 19 }),
  num(11), t(" It became", { size: 19 }), ...BL(7), t("in 1882, but Rio de Janeiro’s name", { size: 19 }), ...BL(8), t("the same.  ", { size: 19 }),
  num(12), t(" That’s how this beautiful city in Brazil got its name!", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[5, "But there isn’t actually a river in Rio de Janeiro!"],
 [10, "Since then, Brazil was ruled by Portugal for over 300 years."]].forEach(([n, s], i) => {
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
w7block("1", "그들은 그것을 실수로 강이라고 생각했다!",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)",
  "river / They / was / thought / by / it / a / mistake!");
w7block("2", "그 도시는 어떻게 그 이름을 갖게 되었을까?",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 물음표에 주의할 것  (총 7단어)",
  "city / How / its / did / name? / the / get");

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

K.push(...tab("정답 및 해설", "UNIT 25  작은 오해에서 비롯된 이름", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("Since then, Brazil was ruled by Portugal for over 300 years.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문7 ", { size: 17, bold: true, color: NAVY2 }), t("On January 1, 1502(M)·people(S)·arrived(△V)·at a wide bay(M)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("Since then(M)·Brazil(S)·was ruled(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("Since[네모]·it(S′)·was(△V′)·they(S)·decided(△V)·in Portuguese(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 우리 마을에는 서점이 없다  (2) 그 창문은 내 남동생에 의해 깨졌다  (3) 편지가 한 통 있는데, 그것은 나의 이모가 썼다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 name · mistake · stayed        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 결과 · 반전 · 이유 · 그때부터   2-2 [B] 이름 뜻 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓑ → ⓓ → ⓐ → ⓒ  ·  Rio de Janeiro got its name by mistake, but the name stayed the same.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) river  (2) mistake  (3) name  (4) same        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 5 ②  문장 8 ①  문장 10 ③  문장 11 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4T · 5F · 6T · 7F · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓒ → ⓐ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓐ · 3ⓓ · 4ⓕ · 5ⓔ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) is  (2) isn’t  (3) was  (4) was ruled", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) famous (2) river (3) name (4) arrived (5) mistake (6) ruled (7) independent (8) stayed", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) They thought it was a river by mistake!  (2) How did the city get its name?", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 강이 없는데도 '1월의 강'이라는 이름을 갖게 된 도시(문장 5–6)와 그 유래(문장 7–9)를 들려준다. 소재(도시 이름)와 특징(작은 오해)을 함께 담은 ①이 제목으로 적절하다. ③·⑤는 본문의 한 부분만 건드린 지엽적 오답, ②·④은 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 5에서 리우데자네이루에는 실제로 강이 없다고 했으므로, 큰 강이 있다는 ③는 본문과 반대된다. ①은 문장 1, ②은 문장 3, ④은 문장 7, ⑤는 문장 10에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) it은 바로 앞 문장 7의 a wide bay(넓은 만)를 가리킨다. 포르투갈 사람들이 강이라고 잘못 본 대상이 무엇인지 생각하면 된다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   Since then, Brazil was ruled by Portugal for over 300 years.");
B("문장 10을 그대로 복원하는 문제다. ① 첫 글자는 대문자 Since.   ② then 뒤의 콤마를 빠뜨리지 않는다.   ③ was ruled by — 수동태는 be동사+과거분사가 한 덩어리.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 name · mistake · stayed     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 작은 오해에서 생긴 리우데자네이루의 이름을 설명한다. ① 포르투갈어 낱말은 이름을 풀이하는 재료일 뿐이고, ③ 강 이야기는 '강이 없다'는 사실로만 나온다.");
B("1-2   ○표 할 세 단어: name(힌트① 도시가 얻은 것) · mistake(힌트② 이름이 생긴 계기) · stayed(힌트③ 그 뒤 이름에 일어난 일). 나머지 셋(river · culture · Portugal)은 본문에 등장하지만 주제문에 들어가지 않는다 — 배경과 예시일 뿐이다.");
B("1-3   문장 8 — They는 포르투갈인, it은 넓은 만에 ○ (한 문장 안에서 가리키는 대상이 바뀐다).   문장 10 — then은 1502년 그 뒤에 ○.   문장 11 — It은 브라질에 ○ (도시가 아니라 나라가 독립했다).");
B("[학습 포인트]   같은 It이라도 문장 2에서는 도시를, 문장 11에서는 나라를 가리킨다. 지시어를 만나면 앞 문장으로 화살표를 그어 짝을 확인하는 습관을 들이자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 결과 / 반전 / 이유 / 그때부터     2-2 [B] 이름 뜻 · [E] 마무리     2-3 ①");
B("2-1   문장 4 So — 앞의 뜻풀이에서 나온 '결과'.   문장 5 But — 그런데 강이 없다는 '반전'.   문장 9 Since — 1월이었다는 '이유'로 그렇게 불렀다.   문장 10 Since then — '그때부터' 이어진 시간을 나타낸다.");
B("2-2   [B] 이름 뜻(문장 3–5: 이름의 뜻을 풀고 강이 없다는 모순을 던진다), [E] 마무리(문장 10–12: 그 뒤의 역사와 정리). 보기의 '요리법'은 이 글에 없는 역할이다. [A] 소개 → [B] 이름 뜻 → [C] 의문 → [D] 유래 → [E] 마무리 — 유래를 설명하는 글의 전형적인 흐름이다.");
B("2-3   정답 ①. 도시 이름이 어떻게 생겼는지 사실을 알려 주는 설명문이다. ② 광고의 신호(사라는 말·가격)가 없고, ③ 일기의 I·오늘도, ④ 편지의 Dear도, ⑤ 동화의 상상 속 인물도 없다.");
B("[학습 포인트]   연결어만 표시해도 글의 지도가 그려진다. So(결과), But(반전), Since(이유·시점). 특히 But 뒤에는 글쓴이가 진짜 하고 싶은 말이 온다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 mistake · stayed     3-3 ⓑ → ⓓ → ⓐ → ⓒ");
B("3-1  재료 찾기 — (2) 문장 8에서 mistake에 ○: 이름이 생긴 계기다. river는 잘못 본 대상일 뿐 계기가 아니다. (3) 문장 11에서 stayed에 ○: 이름이 그대로였다는 결과다. changed는 본문과 반대다.");
B("3-2  뼈대 채우기 — (1) name  (2) mistake  (3) stayed.  넣으면 Rio de Janeiro got its name by mistake, but the name stayed the same.가 완성된다.");
B("3-3  정답 순서 — ⓑ Rio de Janeiro got → ⓓ its name by mistake, → ⓐ but the name → ⓒ stayed the same.");
B("[채점 포인트]  주인공(도시 이름)이 맨 앞, 마침표가 붙은 덩어리가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) river  (2) mistake  (3) name  (4) same");
B("(1)은 문장 5의 river, (2)는 문장 8의 mistake, (3)은 문장 6의 name, (4)는 문장 11의 same에서 가져온다. 요약문이 곧 이 글의 흐름이다: 모순(1) → 오해(2) → 이름(3) → 그대로(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 5 ②   문장 8 ①   문장 10 ③   문장 11 ②  (정답 선지는 무표시)");
B("문장 5 there isn’t actually a river   ① ✕ [반대] 큰 강이 도시를 지난다 — 정반대.   ② ○ 강이 정말 없다.   ③ ✕ [무관] 강이 짧다는 말은 지문에 없다.");
B("문장 8 by mistake   ① ○ not on purpose = 일부러가 아니라 실수로.   ② ✕ [반대] 일부러 그랬다 — 정반대.   ③ ✕ [무관] 지도를 썼다는 말은 지문에 없다.");
B("문장 10 was ruled by Portugal   ① ✕ [반대] 브라질이 포르투갈을 지배했다 — 주어와 목적어가 뒤바뀐 정반대.   ② ✕ [무관] 커피 무역 이야기는 지문에 없다.   ③ ○ 포르투갈이 브라질을 지배했다.");
B("문장 11 stayed the same   ① ✕ [반대] 새 이름으로 바뀌었다 — 정반대.   ② ○ 바뀌지 않았다.   ③ ✕ [무관] 이름이 길어졌다는 말은 지문에 없다.");
B("[학습 포인트]  수동태는 뒤집어 묻기 좋은 표현이다. 'A was ruled by B'를 만나면 누가 하는 쪽이고 누가 당하는 쪽인지 화살표로 표시해 두자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 T · 5 F · 6 T · 7 F · 8 F");
B("1 T — 문장 1.   2 F — 문장 3: Rio는 January가 아니라 river다.   3 T — 문장 5.   4 T — 문장 7.   5 F — 문장 8: 호수(lake)가 아니라 강(river)이라고 착각했다.   6 T — 문장 9.   7 F — 문장 10: 스페인이 아니라 포르투갈의 지배를 받았다.   8 F — 문장 11: 독립한 뒤에도 이름은 그대로였다.  거짓 문장은 모두 딱 한 요소(January, lake, Spain, changed)를 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓒ → ⓐ");
B("ⓑ 포르투갈 사람들이 넓은 만에 도착한다(문장 7) → ⓓ 그곳을 'Rio de Janeiro'라고 부른다(문장 9) → ⓒ 포르투갈이 300년 넘게 브라질을 지배한다(문장 10) → ⓐ 브라질이 독립하지만 이름은 그대로다(문장 11). 이 글은 이름의 뜻(문장 3–5)을 먼저 말하고 유래를 나중에 밝히지만, 사건 자체는 문장 7–11의 순서 그대로다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓐ · 3 ⓓ · 4 ⓕ · 5 ⓔ · 6 ⓑ");
B("famous = 많은 사람에게 알려진 · arrive = 어떤 곳에 닿다 · bay = 육지가 감싼 바다의 한 부분(만) · mistake = 그러려고 한 것이 아닌데 잘못한 일 · rule = 한 나라를 다스리다 · independent = 남의 지배에서 벗어난.", true);
Hs("R4   어법 기초   ·   (1) is  (2) isn’t  (3) was  (4) was ruled");
B("(1) 주어 Rio de Janeiro는 하나(단수) — is.   (2) there is/are는 뒤의 명사가 주어다. a river는 단수 — isn’t. 2면 구문에서 배운 그 문장이다.   (3) thought(과거)와 시제를 맞춘다 — was.   (4) 지배를 '받은' 쪽이 주어이므로 수동태 — was ruled.", true);
Hs("R5   빈칸 클로즈   ·   (1) famous (2) river (3) name (4) arrived (5) mistake (6) ruled (7) independent (8) stayed");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: It’s ___ for ~ ← famous for, get its ___ ← 이름, was ___ by Portugal ← 수동태. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 하지만 리우데자네이루에는 사실 강이 없다!  — there isn’t는 '~가 없다', actually는 '사실은'으로 옮긴다.");
B("(2) 그때 이후로, 브라질은 300년 넘게 포르투갈의 지배를 받았다.  — was ruled by를 '~에 의해 지배받았다'로 옮기는 것이 핵심이다.", true);
Hs("R7   조건 영작   ·   (1) They thought it was a river by mistake!  (2) How did the city get its name?");
B("(1) 문장 8의 복원. ㄱ 첫 글자 대문자 They  ㄴ thought 뒤에 접속사 that이 생략된 문장이 이어진다  ㄷ 느낌표까지 옮겨 쓴다.");
B("(2) 문장 6의 복원. ㄱ 의문사 How가 맨 앞  ㄴ did 뒤의 동사는 원형 get  ㄷ 물음표를 빠뜨리지 않는다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("리우데자네이루는 남아메리카 브라질에 있는 도시이다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그곳은 아름다운 자연, 흥겨운 문화, 그리고 역사로 유명하다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("포르투갈어로 Rio는 '강'을, Janeiro는 '1월'을 뜻한다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 Rio de Janeiro는 '1월의 강'이라는 뜻이다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 리우데자네이루에는 사실 강이 없다!  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 도시는 어떻게 그 이름을 갖게 되었을까?  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("1502년 1월 1일, 포르투갈에서 온 사람들이 넓은 만에 도착했다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 그것을 실수로 강이라고 생각했다!  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("1월이었기 때문에, 그들은 그곳을 포르투갈어로 'Rio de Janeiro'라고 부르기로 했다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그때 이후로, 브라질은 300년 넘게 포르투갈의 지배를 받았다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("브라질은 1882년에 독립했지만, 리우데자네이루의 이름은 그대로였다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것이 브라질의 이 아름다운 도시가 이름을 갖게 된 사연이다!", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
