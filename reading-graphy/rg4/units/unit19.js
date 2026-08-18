/* UNIT 19 — 바다 생물의 미래가 보여요 (Level 4)
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
  title: "바다 생물의 미래가 보여요",
  level: "4",
  foot: "UNIT 19  바다 생물의 미래가 보여요",
  banner: ["19", "바다 생물의 미래가 보여요", "4"],
  timeline: ["물 한 컵|바닷물 채취|산호초 옆의 물과 흙을\\n그대로 담는다|sparkle_drop",
             "DNA 읽기|생물의 흔적|물에 남은 DNA로\\n사는 생물을 안다|leaf",
             "자료실|DNA 라이브러리|여러 산호초의 정보를\\n한곳에 모은다|city",
             "관찰|위험 신호 포착|위험한 산호를 찾아\\n미리 되살린다|sun"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "Coral reefs, home to many sea creatures, are struggling because of climate change.",
  "Coral is extremely sensitive to water temperature, but the water is getting warmer.",
  "So, many of them around the world are dying.",
  "Fortunately, scientists have discovered new techniques to help keep corals alive.",
  "They’re trying a new method using environmental DNA (eDNA).",
  "They collect water or soil near the reefs to learn about the sea life there, without harming the corals.",
  "This method gives a clear view of a reef’s condition.",
  "With the help of eDNA, scientists can better understand which corals are in danger and the effects of climate change on them.",
  "They’re creating a large DNA library from various coral reefs.",
  "This DNA library will help the scientists to monitor them easily in the future.",
  "It will let the scientists know where various coral species live and which species are most threatened.",
  "This means they can fix damaged reefs and protect the many types of life depending on them.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4–5 [C]6–7 [D]8–9 [E]10–12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 6: "C", 8: "D", 10: "E" };
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
  3: [R("So, many of "), RM("them"), R(" around the world are dying.  ")],
  7: [RM("This method"), R(" gives a clear view of a reef’s condition.  ")],
  11: [RM("It"), R(" will let the scientists know where various coral species live and which species are most threatened.  ")],
  12: [R("This means "), RM("they"), R(" can fix damaged reefs and protect the many types of life depending on "), RM("them"), R(".  ")],
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
  10: [t("This DNA library will help the scientists to monitor ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(" easily in the future.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① eDNA: A New Way to Watch and Save Coral Reefs", "② How to Collect Water and Soil Safely",
 "③ Water Temperature: The Only Problem for Fish", "④ Popular Diving Spots Around the World",
 "⑤ How to Build a Library in Your Town"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Coral reefs are home to many sea creatures.",
 "② The water around coral reefs is getting warmer.",
 "③ Scientists collect water or soil near the reefs.",
 "④ Collecting eDNA harms the corals a lot.",
 "⑤ Scientists are creating a large DNA library."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① various coral reefs",
 "② the scientists in the library",
 "③ the effects of climate change",
 "④ new techniques for diving",
 "⑤ the warmer waters of the world"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그들은 다양한 산호초에서 커다란 DNA 자료실을 만들고 있다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 10단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("library / creating / They’re / coral / DNA / a / from / large / various / reefs", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   현재완료 have+과거분사", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("scientists ", { size: 18 }), t("have discovered", { size: 18, bold: true, color: NAVY }), t(" new techniques", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("have+과거분사는 한 덩어리의 동사입니다. '과학자들이 새로운 기술을 발견해 냈다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 6", { size: 14, bold: true, color: AMB }), t("   to부정사 '~하기 위해' (목적)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("collect water or soil ", { size: 18 }), t("to learn", { size: 18, bold: true, color: NAVY, underline: {} }), t(" about the sea life", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 '~하기 위해'라는 목적을 나타냅니다. '알아내기 위해 물이나 흙을 모은다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("My sister ", { size: 19 }), t("has finished", { size: 19, bold: true, color: NAVY }), t(" her homework", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 6 구문", [t("I saved money ", { size: 19 }), t("to buy a new bike", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("We ", { size: 19 }), t("have opened", { size: 19, bold: true, color: NAVY }), t(" the window", { size: 19, underline: {} }), t(" ", { size: 19 }), t("to get fresh air", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 2를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([900, 620, 3000, 800, 1150, 1300, 1160], [new TableRow({ children: [
    exSeg([t("Coral", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 900),
    exSeg([t("is", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 620, "△"),
    exSeg([t("extremely sensitive to water temperature", { size: 18 })], "", FAINT, 3000),
    exSeg([t("but", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 800),
    exSeg([t("the water", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 1150),
    exSeg([t("is getting", { size: 18, bold: true, color: NAVY })], "V′ 한 덩어리", NAVY, 1300, "△"),
    exSeg([t("warmer", { size: 18 })], "", FAINT, 1160),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[1, "Coral reefs, home to many sea creatures, are struggling because of climate change."],
 [5, "They’re trying a new method using environmental DNA (eDNA)."],
 [10, "This DNA library will help the scientists to monitor them easily in the future."]].forEach(([n, c]) => {
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
["① 바닷물의 온도를 재는 여러 방법", "② eDNA로 산호초를 살피고 지키는 과학", "③ 도서관에서 DNA 자료를 빌리는 법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["monitor", "관찰하다"], ["soil", "흙"], ["eDNA", "환경 DNA"], ["species", "종(種)"], ["protect", "보호하다"], ["temperature", "온도"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 과학자들이 쓰는 새 도구  ② 그 도구로 하는 일  ③ 최종 목적 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · them 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서도 가리키는 것이 바뀔 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2100, 7200];
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
    const chips8 = () => T([760, 1150, 170, 1150, 300, 900, 1150, 170, 1150], [new TableRow({ children: [
      labC("they =", 760), chipC("과학자들", 1150), gapC(170), chipC("산호초들", 1150), gapC(300),
      labC("them =", 900), chipC("산호초들", 1150), gapC(170), chipC("과학자들", 1150),
    ] })]);
    return [
    ["3", "them", [t("corals (산호들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["7", "This method", chips2("eDNA 방법", "온도 재기", 1900), false],
    ["11", "It", chips2("DNA 자료실", "기후 변화", 1900), false],
    ["12", "they · them", chips8(), false],
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
    ["1", [t("Coral reefs are struggling ", { size: 17 }), t("because of", { size: 17, bold: true, color: NAVY, underline: {} }), t(" climate change.", { size: 17 })], ["이유", "결과"]],
    ["2", [t("Coral is sensitive to water temperature, ", { size: 17 }), t("but", { size: 17, bold: true, color: NAVY, underline: {} }), t(" the water is getting warmer.", { size: 17 })], ["반전", "이유"]],
    ["3", [t("", { size: 17 }), t("So", { size: 17, bold: true, color: NAVY, underline: {} }), t(", many of them around the world are dying.", { size: 17 })], ["결과", "순서"]],
    ["4", [t("", { size: 17 }), t("Fortunately", { size: 17, bold: true, color: NAVY, underline: {} }), t(", scientists have discovered new techniques.", { size: 17 })], ["반전", "순서"]],
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
    chipCellG("해결책", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("자료 모으기", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("요리법", 1400),
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
  flowCell("A", "문제", "문장 1–3", false),
  arrowCell(),
  flowCell("B", null, "문장 4–5", true),
  arrowCell(),
  flowCell("C", "방법", "문장 6–7", false),
  arrowCell(),
  flowCell("D", null, "문장 8–9", true),
  arrowCell(),
  flowCell("E", "기대", "문장 10–12", false),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 새로운 과학 기술을 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일과를 적은 일기",
 "④ 친구에게 안부를 묻는 편지",
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
  matRow("1", "5", "과학자들이 쓰는 새 방법의 이름은? (한 단어)", "eDNA", "use 뒤 자리 (도구)", true),
  matRow("2", "10", "그 자료실로 산호초에 하려는 일은?", ["monitor", "collect"], "to 뒤 자리 (하는 일)", false),
  matRow("3", "12", "산호초에 기대어 사는 생물에게 하려는 일은?", ["protect", "damage"], "and 뒤 자리 (최종 목적)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("Scientists use  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   to  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  coral reefs and  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  the life depending on them .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ to monitor coral reefs     ⓑ and protect the life     ⓒ Scientists use eDNA     ⓓ depending on them.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("dying        eDNA        library        protect", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Coral reefs are (1) ____________ because the water is getting warmer. Scientists use (2) ____________ to check the reefs without harming them. They are building a DNA (3) ____________ to monitor the reefs and (4) ____________ the life there.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 2, main: "extremely sensitive to water temperature",
    opts: ["① reacts strongly to water warmth", "② ignores water temperature", "③ can live only in deep caves"] },
  { sn: 6, main: "without harming the corals",
    opts: ["① without hurting the corals", "② by breaking the corals", "③ with the help of divers"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "which corals are in danger",
    opts: ["① which corals are safe forever", "② which corals may die soon", "③ which corals are the oldest"] },
  { sn: 12, main: "fix damaged reefs",
    opts: ["① repair the broken reefs", "② leave the broken reefs alone", "③ move the reefs to a zoo"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 산호초와 환경 DNA (eDNA)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("산호는 식물이 아니라 동물이다. 아주 작은 산호충들이 모여 단단한 뼈대를 쌓아 올린 것이 산호초이고, 바다 생물의 약 4분의 1이 이곳에서 먹이를 얻고 알을 낳는다. 그래서 산호초를 '바다의 열대우림'이라고 부른다. 물이 너무 따뜻해지면 산호는 함께 살던 조류를 뱉어 내고 하얗게 변하는데, 이것이 백화 현상이다. 최근 과학자들은 바닷물 한 컵만 떠도 그 안에 남은 DNA 조각으로 어떤 생물이 사는지 알아낸다. 산호를 건드리지 않고 바다의 안부를 묻는 방법이다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
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
    "Coral reefs are home to many sea creatures.",
    "Coral is not sensitive to water temperature.",
    "The water around the coral reefs is getting warmer.",
    "Scientists collect water or soil far from the reefs.",
    "Collecting eDNA does not harm the corals.",
    "Scientists are creating a small DNA library.",
    "The DNA library will help the scientists monitor the reefs.",
    "The library will show which coral species are the most beautiful.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "산호초를 지키는 과정 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Scientists put the DNA information into a large library.",
      "ⓑ The warmer water makes many corals die.",
      "ⓒ Scientists collect water or soil near the reefs.",
      "ⓓ Scientists monitor the reefs and fix damaged ones."]
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
    ["1  sensitive", "ⓐ to get things and bring them together"],
    ["2  discover", "ⓑ in danger of dying out"],
    ["3  collect", "ⓒ to hurt or damage something"],
    ["4  harm", "ⓓ changing easily when something is a little different"],
    ["5  monitor", "ⓔ to watch something carefully over time"],
    ["6  threatened", "ⓕ to find something for the first time"],
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
[["문장 1", [t("Coral reefs ", { size: 19 }), t("( are  /  is )", { size: 19, bold: true, color: NAVY }), t(" struggling because of climate change.", { size: 19 })], "주어 Coral reefs는 복수예요."],
 ["문장 4", [t("Scientists ", { size: 19 }), t("( have  /  has )", { size: 19, bold: true, color: NAVY }), t(" discovered new techniques.", { size: 19 })], "have+과거분사의 have도 주어에 맞춰요."],
 ["문장 6", [t("They collect water or soil ", { size: 19 }), t("( to learn  /  learn )", { size: 19, bold: true, color: NAVY }), t(" about the sea life.", { size: 19 })], "'~하기 위해'는 to+동사원형!"],
 ["문장 12", [t("This means they ", { size: 19 }), t("( can fix  /  can fixes )", { size: 19, bold: true, color: NAVY }), t(" damaged reefs.", { size: 19 })], "조동사 can 뒤에는 동사원형이 와요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("dying  /  library  /  harming  /  sensitive  /  condition  /  monitor  /  climate  /  techniques", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Coral reefs, home to many sea creatures, are struggling because of", { size: 19 }), ...BL(1), t("change.  ", { size: 19 }),
  num(2), t(" Coral is extremely", { size: 19 }), ...BL(2), t("to water temperature, but the water is getting warmer.  ", { size: 19 }),
  num(3), t(" So, many of them around the world are", { size: 19 }), ...BL(3), t(".  ", { size: 19 }),
  num(4), t(" Fortunately, scientists have discovered new", { size: 19 }), ...BL(4), t("to help keep corals alive.  ", { size: 19 }),
  num(5), t(" They’re trying a new method using environmental DNA (eDNA).  ", { size: 19 }),
  num(6), t(" They collect water or soil near the reefs to learn about the sea life there, without", { size: 19 }), ...BL(5), t("the corals.  ", { size: 19 }),
  num(7), t(" This method gives a clear view of a reef’s", { size: 19 }), ...BL(6), t(".  ", { size: 19 }),
  num(8), t(" With the help of eDNA, scientists can better understand which corals are in danger and the effects of climate change on them.  ", { size: 19 }),
  num(9), t(" They’re creating a large DNA", { size: 19 }), ...BL(7), t("from various coral reefs.  ", { size: 19 }),
  num(10), t(" This DNA library will help the scientists to", { size: 19 }), ...BL(8), t("them easily in the future.  ", { size: 19 }),
  num(11), t(" It will let the scientists know where various coral species live and which species are most threatened.  ", { size: 19 }),
  num(12), t(" This means they can fix damaged reefs and protect the many types of life depending on them.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[4, "Fortunately, scientists have discovered new techniques to help keep corals alive."],
 [6, "They collect water or soil near the reefs to learn about the sea life there."]].forEach(([n, s], i) => {
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
w7block("1", "이 방법은 산호초의 상태를 명확하게 보여 준다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 10단어)",
  "of / a / gives / this / clear / method / reef’s / view / condition / a");
w7block("2", "그래서, 전 세계의 많은 산호들이 죽어 가고 있다.",
  "단어를 추가하거나 빼지 말 것 · 콤마와 대소문자에 주의할 것  (총 9단어)",
  "world / So, / are / of / many / them / dying / the / around");

/* ═══════════ 12~14면 [DATA] 해설 ═══════════ */
  },

  renderExplain(ctx) {
    const { K, spF, FT } = ctx;
const H = (s) => K.push(T([W], [new TableRow({ children: [
  cel(new Paragraph({ children: [t(s, { size: 18, bold: true, color: NAVY })], spacing: { after: 0, line: 250 } }),
    { w: W, m: { top: 25, bottom: 25, left: 150, right: 0 }, b: { top: NOB, bottom: NOB, right: NOB, left: bd(12, YEL) } }),
] })]));
const B = (s, last) => K.push(p([t(s, { size: 17, color: SUB })], { after: last ? 150 : 26, line: 244, indent: { left: 0 } }));
const Hs = (s) => { K.push(sp(56)); H(s); K.push(sp(30)); };

K.push(...tab("정답 및 해설", "UNIT 19  바다 생물의 미래가 보여요", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("They’re creating a large DNA library from various coral reefs.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문1 ", { size: 17, bold: true, color: NAVY2 }), t("Coral reefs(S)·are struggling(△V)·because of climate change(M)   ", { size: 17, bold: true }),
     t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("They(S)·’re trying(△V)·using eDNA(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("This DNA library(S)·will help(△V)·to monitor them easily(M)·in the future(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 내 여동생은 숙제를 끝냈다  (2) 나는 새 자전거를 사기 위해 돈을 모았다  (3) 우리는 신선한 공기를 마시기 위해 창문을 열었다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 eDNA · monitor · protect        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 이유 · 반전 · 결과 · 반전   2-2 [B] 해결책 · [D] 자료 모으기   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓐ → ⓑ → ⓓ  ·  Scientists use eDNA to monitor coral reefs and protect the life depending on them.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) dying  (2) eDNA  (3) library  (4) protect        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 2 ①  문장 6 ①  문장 8 ②  문장 12 ①", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓒ → ⓐ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓓ · 2ⓕ · 3ⓐ · 4ⓒ · 5ⓔ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) are  (2) have  (3) to learn  (4) can fix", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) climate (2) sensitive (3) dying (4) techniques (5) harming (6) condition (7) library (8) monitor", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) This method gives a clear view of a reef’s condition.  (2) So, many of them around the world are dying.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 기후 변화로 죽어 가는 산호초(문장 1–3)를 eDNA로 살피고 지키려는 과학을 소개한다. 소재와 방법을 함께 담은 ①이 제목으로 적절하다. ②·③는 지엽적이고, ④·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 6에서 물과 흙을 모으는 일은 '산호를 해치지 않고(without harming the corals)' 이루어진다. 해친다고 한 ④이 본문과 반대된다. ①은 문장 1, ②은 문장 2, ③는 문장 6, ⑤는 문장 9에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 바로 앞 문장 9의 various coral reefs를 가리킨다. DNA 자료실이 앞으로 쉽게 관찰하게 해 줄 대상이 무엇인지 생각하면 된다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   They’re creating a large DNA library from various coral reefs.");
B("문장 9를 그대로 복원하는 문제다. ① 첫 글자는 대문자 They’re.   ② a large DNA library — 관사 a를 빠뜨리지 않는다.   ③ from 뒤에 various coral reefs가 이어진다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 eDNA · monitor · protect     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 eDNA로 산호초의 상태를 살피고 지키려는 과학을 소개한다. ① 물 온도는 문제의 원인일 뿐이고, ③의 library는 '도서관'이 아니라 DNA 자료실이다.");
B("1-2   ○표 할 세 단어: eDNA(힌트① 새 도구) · monitor(힌트② 그 도구로 하는 일) · protect(힌트③ 최종 목적). 나머지 셋(soil · species · temperature)은 본문에 나오지만 주제문에는 들어가지 않는다.");
B("1-3   문장 7 — This method는 eDNA 방법에 ○.   문장 11 — It은 DNA 자료실에 ○ (문장 9–10의 그 library).   문장 12 — they는 과학자들, them은 산호초들에 ○.");
B("[학습 포인트]   한 문장 안에서도 they와 them이 서로 다른 것을 가리킬 수 있다. 지시어를 만나면 수(단수·복수)를 먼저 맞춰 보고 바로 앞 문장에서 짝을 찾자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 이유 / 반전 / 결과 / 반전     2-2 [B] 해결책 · [D] 자료 모으기     2-3 ①");
B("2-1   문장 1 because of — 산호초가 어려움을 겪는 '이유'.   문장 2 but — 온도에 민감한데 물은 더워진다는 '반전'.   문장 3 So — 그래서 죽어 간다는 '결과'.   문장 4 Fortunately — 나쁜 소식에서 좋은 소식으로 방향이 바뀌는 '반전'.");
B("2-2   [B] 해결책(문장 4–5: 새 기술 eDNA의 등장), [D] 자료 모으기(문장 8–9: 큰 DNA 자료실 만들기). 보기의 '요리법'은 이 글에 없는 역할이다. [A] 문제 → [B] 해결책 → [C] 방법 → [D] 자료 모으기 → [E] 기대.");
B("2-3   정답 ①. 새로운 과학 기술이 무엇이고 어떻게 쓰이는지 사실을 알려 주는 설명문이다(문장 5–7). ② 가격·명령문이 없어 광고가 아니고, ③ I나 날짜가 없어 일기도 아니다.");
B("[학습 포인트]   문제 → 해결 → 방법 → 기대는 과학 설명문의 기본 골격이다. because of · but · So · Fortunately에 표시만 해도 글의 지도가 그려진다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 monitor · protect     3-3 ⓒ → ⓐ → ⓑ → ⓓ");
B("3-1  재료 찾기 — (2) 문장 10에서 monitor에 ○: 자료실로 산호초를 '관찰한다'. collect는 물과 흙을 모으는 앞 단계일 뿐이다. (3) 문장 12에서 protect에 ○: 산호초에 기대어 사는 생물을 '보호한다'.");
B("3-2  뼈대 채우기 — (1) eDNA  (2) monitor  (3) protect.  넣으면 Scientists use eDNA to monitor coral reefs and protect the life depending on them.이 완성된다.");
B("3-3  정답 순서 — ⓒ Scientists use eDNA → ⓐ to monitor coral reefs → ⓑ and protect the life → ⓓ depending on them.");
B("[채점 포인트]  주인공(Scientists)이 맨 앞, 마침표가 붙은 덩어리(ⓓ)가 맨 뒤 — 두 자리만 잡으면 to와 and가 순서를 알려 준다.", true);
Hs("STEP 4   요약문   ·   (1) dying  (2) eDNA  (3) library  (4) protect");
B("(1)은 문장 3의 dying, (2)는 문장 5의 eDNA, (3)은 문장 9의 library, (4)는 문장 12의 protect에서 가져온다. 요약문이 곧 이 글의 흐름이다: 문제(1) → 방법(2) → 자료(3) → 목적(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 2 ①   문장 6 ①   문장 8 ②   문장 12 ①  (정답 선지는 무표시)");
B("문장 2 extremely sensitive to water temperature   ① ○ 물이 얼마나 따뜻한지에 크게 반응한다.   ② ✕ [반대] 온도에 신경 쓰지 않는다.   ③ ✕ [무관] 깊은 동굴 이야기는 지문에 없다.");
B("문장 6 without harming the corals   ① ○ 산호를 다치게 하지 않고.   ② ✕ [반대] 산호를 부수면서.   ③ ✕ [무관] 잠수부의 도움은 지문에 없다.");
B("문장 8 which corals are in danger   ① ✕ [반대] 영원히 안전한 산호 — 정반대.   ② ○ 곧 죽을 수도 있는 산호.   ③ ✕ [무관] 가장 오래된 산호라는 말은 없다.");
B("문장 12 fix damaged reefs   ① ○ 망가진 산호초를 고치다.   ② ✕ [반대] 망가진 채로 내버려 두다.   ③ ✕ [무관] 동물원으로 옮긴다는 말은 없다.");
B("[학습 포인트]  시험은 본문 표현을 반드시 바꿔서 묻는다. in danger ↔ may die soon처럼 같은 뜻의 다른 표현을 스스로 만들어 보는 습관을 들이자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 2: not이 붙어 뜻이 뒤집혔다(산호는 온도에 매우 민감하다).   3 T — 문장 2.   4 F — 문장 6: far from이 아니라 near(가까이)이다.   5 T — 문장 6.   6 F — 문장 9: small이 아니라 large(큰) 자료실이다.   7 T — 문장 10.   8 F — 문장 11: beautiful이 아니라 threatened(위협받는) 종을 알려 준다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓒ → ⓐ → ⓓ");
B("ⓑ 더워진 물 때문에 산호가 죽는다(문장 2–3) → ⓒ 과학자들이 산호초 근처의 물과 흙을 모은다(문장 6) → ⓐ 모은 정보를 큰 DNA 자료실에 넣는다(문장 9) → ⓓ 산호초를 관찰하고 손상된 곳을 고친다(문장 10–12).", true);
Hs("R3   영영풀이   ·   1 ⓓ · 2 ⓕ · 3 ⓐ · 4 ⓒ · 5 ⓔ · 6 ⓑ");
B("sensitive = 작은 변화에도 쉽게 반응하는 · discover = 처음으로 찾아내다 · collect = 여럿을 모아 한곳에 두다 · harm = 다치게 하거나 망가뜨리다 · monitor = 오랫동안 주의 깊게 지켜보다 · threatened = 사라질 위험에 놓인.", true);
Hs("R4   어법 기초   ·   (1) are  (2) have  (3) to learn  (4) can fix");
B("(1) 주어 Coral reefs는 복수 — are.   (2) 주어 Scientists가 복수이므로 have+과거분사.   (3) '~하기 위해'는 to+동사원형 — to learn. 2면 구문에서 배운 그 문장이다.   (4) 조동사 can 뒤에는 동사원형 — can fix.", true);
Hs("R5   빈칸 클로즈   ·   (1) climate (2) sensitive (3) dying (4) techniques (5) harming (6) condition (7) library (8) monitor");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: because of ___ change ← 기후 변화, without ___ the corals ← 해치지 않고, a large DNA ___ ← 자료실. 채우고 나면 지문을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 다행히, 과학자들은 산호를 살아 있게 하는 데 도움이 되는 새로운 기술들을 발견했다.  — have discovered(현재완료)를 한 덩어리의 동사로 본다.");
B("(2) 그들은 그곳의 바다 생물에 대해 알아내기 위해 산호초 근처의 물이나 흙을 모은다.  — to learn을 '~하기 위해'로 옮기는 것이 핵심이다.", true);
Hs("R7   조건 영작   ·   (1) This method gives a clear view of a reef’s condition.  (2) So, many of them around the world are dying.");
B("(1) 문장 7의 복원. ㄱ 첫 글자 대문자 This  ㄴ a clear view of a reef’s condition — 관사 a가 두 번 들어간다.");
B("(2) 문장 3의 복원. ㄱ So 뒤의 콤마를 빠뜨리지 않는다  ㄴ many of them(그것들 중 다수)  ㄷ are dying(진행형)으로 문장이 끝난다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("많은 바다 생물의 보금자리인 산호초가 기후 변화 때문에 어려움을 겪고 있다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("산호는 물 온도에 매우 민감한데, 물은 점점 더 따뜻해지고 있다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그래서 전 세계의 많은 산호들이 죽어 가고 있다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("다행히, 과학자들은 산호를 살아 있게 하는 데 도움이 되는 새로운 기술들을 발견했다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 환경 DNA(eDNA)를 이용하는 새로운 방법을 시도하고 있다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 그곳의 바다 생물에 대해 알아내기 위해, 산호를 해치지 않고 산호초 근처의 물이나 흙을 모은다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 방법은 산호초의 상태를 명확하게 보여 준다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("eDNA의 도움으로, 과학자들은 어떤 산호가 위험에 처해 있는지, 그리고 기후 변화가 그것들에 미치는 영향을 더 잘 이해할 수 있다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 다양한 산호초에서 커다란 DNA 자료실을 만들고 있다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 DNA 자료실은 과학자들이 앞으로 그것들을 쉽게 관찰하도록 도와줄 것이다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 과학자들에게 다양한 산호 종이 어디에 사는지, 그리고 어떤 종이 가장 위협받고 있는지 알려 줄 것이다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이는 그들이 손상된 산호초를 복구하고 그것에 기대어 사는 많은 종류의 생물을 보호할 수 있다는 뜻이다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
