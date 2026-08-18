/* UNIT 32 — 호주의 지폐에 무슨 일이? (Level 4) · 축약 유닛(5면)
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
  no: "32",
  title: "호주의 지폐에 무슨 일이?",
  level: "4",
  pages: 5,                                  /* 축약 유닛 = 본문 5면 (풀 유닛은 생략 시 10) */
  foot: "UNIT 32  호주의 지폐에 무슨 일이?",
  banner: ["32", "호주의 지폐에 무슨 일이?", "4"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 10문장 ═══════════ */
const SENT = [
  "Australia will replace the image of Queen Elizabeth II from its 5-dollar note, said the country’s central bank.",
  "The new design will better represent Australia’s history and heritage.",
  "But why was the Queen of England’s image on Australian money?",
  "A long time ago, countries such as Canada, Australia, and New Zealand were ruled by Britain.",
  "So, these countries have honored the British monarchy by putting their image on money.",
  "However, there’s a movement in Australia to change this tradition, especially after Queen Elizabeth II passed away in 2022.",
  "Following her death, her son, King Charles III, became the British king.",
  "Despite this change, Australia has decided not to replace the Queen’s image with King Charles III’s on its 5-dollar note.",
  "Queen Elizabeth’s image has been on Australian money since 1953, so a new money design will be a big change.",
  "But it could be a chance for Australia to be more independent and show its own identity.",
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
  5: [R("So, "), RM("these countries"), R(" have honored the British monarchy by putting "), RM("their"), R(" image on money.  ")],
  6: [R("However, there’s a movement in Australia to change "), RM("this tradition"), R(", especially after Queen Elizabeth II passed away in 2022.  ")],
  10: [R("But "), RM("it"), R(" could be a chance for Australia to be more independent and show its own identity.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u32.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  5: [t("So, these countries have honored the British monarchy by putting ", { size: 19 }), t("(A) ", { size: 19, bold: true }),
      t("their", { size: 19, bold: true, underline: {} }), t(" image on money.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Australia’s 5-Dollar Note Says Goodbye to the Queen", "② How to Become the King of England",
 "③ The History of Paper Money in Canada", "④ Why Queen Elizabeth II Loved Australia",
 "⑤ The Best Way to Design Paper Money"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Australia will replace the Queen’s image on its 5-dollar note.",
 "② Canada, Australia, and New Zealand were once ruled by Britain.",
 "③ Queen Elizabeth II passed away in 2022.",
 "④ Australia decided to put King Charles III’s image on its 5-dollar note.",
 "⑤ Queen Elizabeth’s image has been on Australian money since 1953."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) their가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the British monarchy",
 "② Canada, Australia, and New Zealand",
 "③ the people of Australia",
 "④ the central bank of Australia",
 "⑤ the children of King Charles III"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("새 디자인은 호주의 역사와 유산을 더 잘 나타낼 것이다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 10단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("history / will / new / design / represent / Australia’s / The / better / and / heritage", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   수동태 be동사 + 과거분사", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("countries ", { size: 18 }), t("were ruled", { size: 18, bold: true, color: NAVY }), t(" by Britain", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be동사+과거분사는 '~되다'라는 뜻입니다. by 뒤에는 그 일을 한 쪽이 옵니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 5", { size: 14, bold: true, color: AMB }), t("   전치사 by + 동명사 (~함으로써)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("honored the monarchy ", { size: 18 }), t("by putting", { size: 18, bold: true, color: NAVY, underline: {} }), t(" their image on money", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("전치사 by 뒤에는 동명사(~ing)가 옵니다. '~함으로써'라는 방법을 나타내요.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("This song ", { size: 19 }), t("was loved", { size: 19, bold: true, color: NAVY }), t(" by many students", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 5 구문", [t("She helps her mom ", { size: 19 }), t("by washing", { size: 19, bold: true, color: NAVY, underline: {} }), t(" the dishes.", { size: 19 })]],
 ["둘 다!", [t("The cake ", { size: 19 }), t("was made", { size: 19, bold: true, color: NAVY }), t(" by Mina", { size: 19, underline: {} }), t(" ", { size: 19 }), t("by mixing", { size: 19, bold: true, color: NAVY, underline: {} }), t(" eggs and milk.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 7을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([2300, 2900, 1300, 2430], [new TableRow({ children: [
    exSeg([t("Following her death", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2300),
    exSeg([t("her son, King Charles III,", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 2900),
    exSeg([t("became", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1300, "\u25b3"),
    exSeg([t("the British king", { size: 18 })], "", FAINT, 2430),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

/* [DATA] 구문분석 훈련 3문장 */
[[4, "A long time ago, countries such as Canada, Australia, and New Zealand were ruled by Britain."],
 [6, "However, there’s a movement in Australia to change this tradition."],
 [10, "But it could be a chance for Australia to be more independent and show its own identity."]].forEach(([n, c]) => {
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
["① 여왕이 남긴 편지와 쪽지", "② 호주 5달러 지폐 속 초상이 바뀌는 일", "③ 영국 왕실의 왕위 계승 순서"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["Australia", "호주"], ["image", "초상, 이미지"], ["identity", "정체성"], ["Britain", "영국"], ["king", "왕"], ["tradition", "전통"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공 나라  ② 지폐에서 바뀌는 것  ③ 그 변화가 보여 주려는 것 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · this · their 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서도 서로 다른 것을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    ["5", "these countries", [t("Canada · Australia · New Zealand", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["5", "their", chips2("영국 왕실", "세 나라", 1900), false],
    ["6", "this tradition", chips2("왕실 초상을 넣기", "여왕의 죽음", 1900), false],
    ["10", "it", chips2("새 지폐 디자인", "영국 국왕", 2100), false],
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
    "Australia will replace the Queen’s image on its 5-dollar note.",
    "The new design will better represent Britain’s history and heritage.",
    "Canada, Australia, and New Zealand were ruled by Britain a long time ago.",
    "Queen Elizabeth II passed away in 2012.",
    "King Charles III is Queen Elizabeth II’s son.",
    "Australia decided to put King Charles III’s image on its 5-dollar note.",
    "Queen Elizabeth’s image has been on Australian money since 1953.",
    "A new money design will be a small change for Australia.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "호주 지폐를 둘러싼 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Australia decided to change its 5-dollar note.",
      "ⓑ Britain ruled Canada, Australia, and New Zealand.",
      "ⓒ Queen Elizabeth II passed away and her son became king.",
      "ⓓ Queen Elizabeth’s image went on Australian money in 1953."]
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
K.push(...tab("정답 및 해설", "UNIT 32  호주의 지폐에 무슨 일이?", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("The new design will better represent Australia’s history and heritage.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문4 ", { size: 17, bold: true, color: NAVY2 }), t("A long time ago(M)·countries(S)·were ruled(△V)   ", { size: 17, bold: true }),
     t("문6 ", { size: 17, bold: true, color: NAVY2 }), t("a movement(S)·there’s(△V)·to change this tradition(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("But[네모]·it(S)·could be(△V)·to be more independent~(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 이 노래는 많은 학생들에게 사랑받았다  (2) 그녀는 설거지를 함으로써 엄마를 돕는다  (3) 그 케이크는 달걀과 우유를 섞어 미나에 의해 만들어졌다", { size: 17, bold: true })], { after: 72 }),
  p([t("READ RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 Australia · image · identity   1-3 아래 참조", { size: 19, bold: true })], { after: 75 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓓ → ⓒ → ⓐ", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 호주가 5달러 지폐에서 여왕의 초상을 바꾸기로 한 일(문장 1·8)과 그 배경·의미(문장 4–5, 10)를 다룬다. 소재와 핵심을 담은 ①이 적절하다. ③·⑤는 지엽적, ②·④는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 8에서 호주는 여왕의 초상을 찰스 3세의 초상으로 바꾸지 ‘않기로’ 결정했다. ①은 문장 1, ②는 문장 4, ③은 문장 6, ⑤는 문장 9에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) their는 바로 앞의 the British monarchy(영국 왕실)를 받는다. 세 나라가 왕실을 기리기 위해 ‘왕실의’ 초상을 돈에 넣은 것이므로, 주어인 these countries와 다른 대상이다.", true);
Hs("독해 04   배열 영작   ·   The new design will better represent Australia’s history and heritage.");
B("문장 2를 그대로 복원한다. ① 첫 글자는 대문자 The.   ② 조동사 will 뒤에는 동사원형 represent.   ③ better는 동사 앞에 놓여 ‘더 잘’이라는 뜻이 된다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 Australia · image · identity     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 호주 5달러 지폐 속 초상이 바뀌는 일을 다룬다. ① note를 ‘쪽지’로 읽으면 안 되고, ③ 왕위 계승은 배경으로만 나온다.");
B("1-2   ○표 할 세 단어: Australia(힌트① 주인공 나라) · image(힌트② 지폐에서 바뀌는 것) · identity(힌트③ 변화가 보여 주려는 것). Britain · king · tradition은 배경일 뿐 주제문에 들어가지 않는다.");
B("1-3   문장 5 \u2014 their는 영국 왕실에 ○ (돈에 실린 초상의 주인).   문장 6 \u2014 this tradition은 왕실 초상을 넣기에 ○ (문장 5의 그 관습).   문장 10 \u2014 it은 새 지폐 디자인에 ○ (문장 9의 a new money design).");
B("[학습 포인트]   한 문장 안에서도 지시어가 가리키는 대상은 바뀐다. 문장 5의 these countries는 세 나라, their는 영국 왕실이다 \u2014 주어와 소유격을 따로 확인하는 습관을 들이자.", true);

/* ═══════════ [DATA] 해설 2면 — R1 · R2 · 전문 해석 ═══════════ */
K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R2 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T \u2014 문장 1.   2 F \u2014 문장 2: 영국이 아니라 호주(Australia’s)의 역사와 유산이다.   3 T \u2014 문장 4.   4 F \u2014 문장 6: 2012년이 아니라 2022년이다.   5 T \u2014 문장 7.   6 F \u2014 문장 8: 찰스 3세의 초상으로 바꾸지 않기로 했다.   7 T \u2014 문장 9.   8 F \u2014 문장 9: 작은 변화가 아니라 큰 변화(a big change)다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓓ → ⓒ → ⓐ");
B("ⓑ 영국이 세 나라를 지배한다(문장 4) → ⓓ 1953년부터 여왕의 초상이 호주 돈에 실린다(문장 9) → ⓒ 2022년 여왕이 세상을 떠나고 아들이 왕이 된다(문장 6–7) → ⓐ 호주가 지폐를 바꾸기로 한다(문장 1). 글은 결정(문장 1)부터 말했지만 실제 순서는 정반대다 \u2014 서술 순서와 사건 순서를 구분하자.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("호주는 5달러 지폐에서 엘리자베스 2세 여왕의 초상을 교체할 것이라고, 그 나라의 중앙은행이 말했다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("새 디자인은 호주의 역사와 유산을 더 잘 나타낼 것이다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런데 왜 영국 여왕의 초상이 호주 돈에 있었을까?  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("오래전에, 캐나다, 호주, 뉴질랜드 같은 나라들은 영국의 지배를 받았다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서, 이 나라들은 돈에 그들(영국 왕실)의 초상을 넣음으로써 영국 왕실을 기려 왔다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만, 특히 2022년 엘리자베스 2세 여왕이 세상을 떠난 뒤로, 호주에는 이 전통을 바꾸려는 움직임이 있다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("여왕의 죽음에 뒤이어, 그녀의 아들 찰스 3세 국왕이 영국의 왕이 되었다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 변화에도 불구하고, 호주는 5달러 지폐에서 여왕의 초상을 찰스 3세의 초상으로 교체하지 않기로 결정했다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("엘리자베스 여왕의 초상은 1953년부터 호주 돈에 있어 왔고, 그래서 새 화폐 디자인은 큰 변화가 될 것이다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 그것은 호주가 더 독립적으로 서서 자신만의 정체성을 보여 줄 기회가 될 수도 있다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
