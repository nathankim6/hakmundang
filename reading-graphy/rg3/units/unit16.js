/* UNIT 16 — 폭풍의 눈으로 날아드는 새 (Level 3)
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
  title: "폭풍의 눈으로 날아드는 새",
  level: "3",
  foot: "UNIT 16  폭풍의 눈으로 날아드는 새",
  banner: ["16", "폭풍의 눈으로 날아드는 새", "3"],
  timeline: ["가장자리|강풍 타기|폭풍 가장자리의 바람으로\\n더 빠르게 이동한다",
             "중심|고요한 눈 속|바람이 약한 폭풍의 눈에서\\n최대 여덟 시간 머문다",
             "결과|에너지 절약|육지의 위험을 피하고\\n힘을 아낀다"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 (재분리) ═══════════ */
const SENT = [
  "Shearwaters are birds that live near the ocean.",
  "They have a special way to deal with big storms.",
  "While most birds fly away from them, shearwaters fly straight into them!",
  "Scientists noticed that during storms, these birds sometimes fly very close to the storm\u2019s center, which is called the \u201Ceye.\u201D",
  "They stayed there for up to eight hours.",
  "This was very surprising because no other birds are known to act this way.",
  "To learn more about shearwater behavior, scientists tracked their flight paths during storms for 11 years.",
  "Scientists found out that some shearwaters choose to fly around the storm\u2019s edges.",
  "They use the strong winds there to move faster.",
  "Meanwhile, other shearwaters head straight into the storm\u2019s center.",
  "Scientists think shearwaters might do this to save energy and avoid dangers near the land, like flying things that could hurt them.",
  "Flying into a storm\u2019s center is a smart trick that only shearwaters seem to know!",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4–6 [C]7 [D]8–10 [E]11–12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 7: "C", 8: "D", 11: "E" };
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
  3: [R("While most birds fly away from "), RM("them"), R(", shearwaters fly straight into them!  ")],
  5: [RM("They"), R(" stayed "), RM("there"), R(" for up to eight hours.  ")],
  9: [R("They use the strong winds "), RM("there"), R(" to move faster.  ")],
  11: [R("Scientists think shearwaters might do "), RM("this"), R(" to save energy and avoid dangers near the land, like flying things that could hurt them.  ")],
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
  11: [t("Scientists think shearwaters might do ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("this", { size: 19, bold: true, underline: {} }),
      t(" to save energy and avoid dangers near the land, like flying things that could hurt them.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["\u2460 Into the Eye: The Storm Trick of Shearwaters", "\u2461 How Scientists Track Birds with Cameras",
 "\u2462 The Best Places to Watch Sea Birds", "\u2463 Why Storms Are Getting Stronger Every Year",
 "\u2464 Birds That Always Fly Away from Bad Weather"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["\u2460 Shearwaters are birds that live near the ocean.",
 "\u2461 Most birds fly away from big storms.",
 "\u2462 Some shearwaters stayed near the storm\u2019s center for up to eight hours.",
 "\u2463 Scientists tracked the birds\u2019 flight paths for only one year.",
 "\u2464 Some shearwaters fly around the storm\u2019s edges to move faster."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) this가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["\u2460 flying straight into the storm\u2019s center",
 "\u2461 flying around the storm\u2019s edges",
 "\u2462 staying near the land during storms",
 "\u2463 tracking the birds\u2019 flight paths for 11 years",
 "\u2464 eating more food before a storm"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("슴새는 바다 가까이에 사는 새다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("that / birds / near / Shearwaters / the / live / are / ocean", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 2", { size: 14, bold: true, color: AMB }), t("   to부정사의 명사 수식 ('~할 …')", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("a special way ", { size: 18 }), t("to deal with", { size: 18, bold: true, color: NAVY }), t(" big storms", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("to+동사원형이 앞의 명사 way를 뒤에서 꾸밉니다. '큰 폭풍에 대처할 특별한 방법'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   조동사 might + 동사원형", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("shearwaters ", { size: 18 }), t("might do", { size: 18, bold: true, color: NAVY, underline: {} }), t(" this", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("might은 '~일지도 모른다'는 추측입니다. 조동사 뒤에는 언제나 동사원형!", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 2 구문", [t("We have a plan ", { size: 19 }), t("to visit", { size: 19, bold: true, color: NAVY }), t(" the zoo", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 11 구문", [t("It ", { size: 19 }), t("might rain", { size: 19, bold: true, color: NAVY, underline: {} }), t(" this afternoon.", { size: 19 })]],
 ["둘 다!", [t("She ", { size: 19 }), t("might have", { size: 19, bold: true, color: NAVY, underline: {} }), t(" a good way ", { size: 19 }), t("to fix", { size: 19, bold: true, color: NAVY }), t(" the bike", { size: 19, underline: {} }), t(".", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 3을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([700, 1300, 1150, 1200, 1450, 700, 2430], [new TableRow({ children: [
    exSeg([t("While", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 700),
    exSeg([t("most birds", { size: 18, bold: true, color: SGRN, underline: {} })], "S\u2032 주어", SGRN, 1300),
    exSeg([t("fly away", { size: 18, bold: true, color: NAVY })], "V\u2032 동사", NAVY, 1150, "\u25b3"),
    exSeg([t("from them", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1200),
    exSeg([t("shearwaters", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1450),
    exSeg([t("fly", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 700, "\u25b3"),
    exSeg([t("straight into them", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2430),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[2, "They have a special way to deal with big storms."],
 [7, "To learn more about shearwater behavior, scientists tracked their flight paths during storms for 11 years."],
 [10, "Meanwhile, other shearwaters head straight into the storm\u2019s center."]].forEach(([n, c]) => {
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
["\u2460 폭풍이 만들어지는 과정", "\u2461 폭풍 속으로 날아드는 슴새", "\u2462 과학자들이 쓰는 추적 장비"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["shearwaters", "슴새"], ["storm", "폭풍"], ["trick", "비결"], ["scientists", "과학자"], ["ocean", "바다"], ["winds", "바람"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("\u2460 이 글의 주인공  \u2461 주인공이 뛰어드는 곳  \u2462 글쓴이의 평가 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · there 같은 지시어는 앞에 나온 말을 대신합니다. 같은 there라도 다른 곳을 가리킬 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    const chips8 = () => T([850, 1150, 150, 1150, 250, 900, 1150, 150, 1150], [new TableRow({ children: [
      labC("They =", 850), chipC("슴새들", 1150), gapC(150), chipC("과학자들", 1150), gapC(250),
      labC("there =", 900), chipC("폭풍의 눈", 1150), gapC(150), chipC("바다 위 육지", 1150),
    ] })]);
    return [
    ["3", "them", [t("big storms (큰 폭풍들)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["5", "They / there", chips8(), false],
    ["9", "there", chips2("폭풍 가장자리", "폭풍의 눈", 1900), false],
    ["11", "this", chips2("중심으로 날아들기", "육지로 돌아가기", 2100), false],
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
    ["3", [t("While", { size: 17, bold: true, color: NAVY, underline: {} }), t(" most birds fly away from them, shearwaters fly straight into them!", { size: 17 })], ["대조", "이유"]],
    ["6", [t("This was very surprising ", { size: 17 }), t("because", { size: 17, bold: true, color: NAVY, underline: {} }), t(" no other birds act this way.", { size: 17 })], ["이유", "한편"]],
    ["10", [t("Meanwhile", { size: 17, bold: true, color: NAVY, underline: {} }), t(", other shearwaters head straight into the storm\u2019s center.", { size: 17 })], ["한편", "덧붙임"]],
    ["11", [t("They do this to save energy ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" avoid dangers near the land.", { size: 17 })], ["덧붙임", "대조"]],
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
    chipCellG("놀라운 관찰", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("마무리", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("광고", 1400),
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
  flowCell("B", null, "문장 4–6", true),
  arrowCell(),
  flowCell("C", "연구", "문장 7", false),
  arrowCell(),
  flowCell("D", "두 갈래", "문장 8–10", false),
  arrowCell(),
  flowCell("E", null, "문장 11–12", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["\u2460 동물의 행동을 사실대로 알려 주는 설명문",
 "\u2461 물건을 팔기 위해 만든 광고",
 "\u2462 하루 일을 기록한 일기",
 "\u2463 친구에게 안부를 전하는 편지",
 "\u2464 리듬을 살려 쓴 시"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "12", "슴새들이 하는 행동을 나타낸 말은? (한 단어)", "Flying", "주제문의 주어 자리", true),
  matRow("2", "4", "폭풍의 한가운데를 가리키는 말은?", ["center", "edges"], "storm\u2019s 뒤 자리 (장소)", false),
  matRow("3", "12", "글쓴이가 이 행동을 평가한 말은?", ["trick", "danger"], "a smart ___ 자리 (평가)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   into a storm\u2019s  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   is a smart  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  that only shearwaters know .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("\u24D0 is a smart trick     \u24D1 that only shearwaters know.     \u24D2 Flying into     \u24D3 a storm\u2019s center", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  \u24D2  )", { size: 19 }), t("  \u2192  (      )  \u2192  (      )  \u2192  (      )", { size: 19 }),
  t("      \u24D2가 맨 앞 \u2014 동명사가 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("storms        edges        center        energy", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Shearwaters do not fly away from big (1) ____________ . Some of them fly around the storm\u2019s (2) ____________ to move faster, and others fly into the (3) ____________ . Scientists think they do this to save (4) ____________ and avoid dangers near the land.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 3, main: "fly straight into them",
    opts: ["\u2460 fly far away from the storms", "\u2461 fly right into the storms", "\u2462 stop flying during storms"] },
  { sn: 5, main: "for up to eight hours",
    opts: ["\u2460 for as long as eight hours", "\u2461 for only a few seconds", "\u2462 for eight days without food"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 6, main: "very surprising",
    opts: ["\u2460 quite normal and common", "\u2461 very dangerous for people", "\u2462 hard to believe"] },
  { sn: 9, main: "to move faster",
    opts: ["\u2460 to slow down", "\u2461 to travel more quickly", "\u2462 to find more food"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 \u00b7 폭풍의 눈과 슴새 (shearwater)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("태풍이나 허리케인 같은 큰 폭풍의 한가운데에는 바람이 거의 없는 둥근 공간이 있다. 이곳을 '폭풍의 눈(eye)'이라고 부른다. 눈의 가장자리는 바람이 가장 사나운 반면, 눈 안쪽은 오히려 고요하고 하늘이 보이기도 한다. 슴새는 바다 위에서 몇 달씩 지내는 새라, 폭풍을 피해 육지로 도망치는 대신 이 고요한 눈 속으로 들어가 폭풍이 지나갈 때까지 함께 이동한다. 육지 가까이의 위험을 피하고 날갯짓에 드는 힘도 아낄 수 있기 때문이다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
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
    "Shearwaters are birds that live near the ocean.",
    "Most birds fly straight into big storms.",
    "Some shearwaters fly very close to the storm\u2019s center.",
    "They stayed near the eye for up to eight minutes.",
    "Many other birds are known to act this way.",
    "Scientists tracked the birds\u2019 flight paths for 11 years.",
    "Some shearwaters use the strong winds at the edges to move faster.",
    "Scientists think shearwaters do this to use more energy.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "과학자들이 슴새를 연구한 과정 ⓐ~ⓓ를 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["\u24D0 Scientists tracked the birds\u2019 flight paths for 11 years.",
      "\u24D1 Scientists noticed shearwaters flying close to the storm\u2019s eye.",
      "\u24D2 Scientists think the birds do this to save energy.",
      "\u24D3 Scientists found out that some birds fly around the edges."]
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
    ["1  ocean", "\u24D0 to stay away from something"],
    ["2  storm", "\u24D1 the way a person or animal acts"],
    ["3  notice", "\u24D2 a very large area of salt water"],
    ["4  track", "\u24D3 very bad weather with strong wind and rain"],
    ["5  avoid", "\u24D4 to follow and record where something goes"],
    ["6  behavior", "\u24D5 to see or feel something for the first time"],
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
[["문장 1", [t("Shearwaters ", { size: 19 }), t("( are  /  is )", { size: 19, bold: true, color: NAVY }), t(" birds that live near the ocean.", { size: 19 })], "주어가 복수일 때 알맞은 be동사는?"],
 ["문장 6", [t("This ", { size: 19 }), t("( was  /  were )", { size: 19, bold: true, color: NAVY }), t(" very surprising.", { size: 19 })], "주어 This는 단수예요."],
 ["문장 11", [t("Shearwaters ", { size: 19 }), t("( might do  /  might to do )", { size: 19, bold: true, color: NAVY }), t(" this to save energy.", { size: 19 })], "조동사 뒤에는 언제나 동사원형!"],
 ["문장 12", [t("( Flying  /  Fly )", { size: 19, bold: true, color: NAVY }), t(" into a storm\u2019s center is a smart trick.", { size: 19 })], "'~하는 것은'이라는 주어는 동사원형+ing!"],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("edges  /  ocean  /  energy  /  straight  /  tracked  /  storms  /  surprising  /  center", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Shearwaters are birds that live near the", { size: 19 }), ...BL(1), t(".  ", { size: 19 }),
  num(2), t(" They have a special way to deal with big", { size: 19 }), ...BL(2), t(".  ", { size: 19 }),
  num(3), t(" While most birds fly away from them, shearwaters fly", { size: 19 }), ...BL(3), t("into them!  ", { size: 19 }),
  num(4), t(" Scientists noticed that during storms, these birds sometimes fly very close to the storm\u2019s", { size: 19 }), ...BL(4), t(", which is called the \u201Ceye.\u201D  ", { size: 19 }),
  num(5), t(" They stayed there for up to eight hours.  ", { size: 19 }),
  num(6), t(" This was very", { size: 19 }), ...BL(5), t("because no other birds are known to act this way.  ", { size: 19 }),
  num(7), t(" To learn more about shearwater behavior, scientists", { size: 19 }), ...BL(6), t("their flight paths during storms for 11 years.  ", { size: 19 }),
  num(8), t(" Scientists found out that some shearwaters choose to fly around the storm\u2019s", { size: 19 }), ...BL(7), t(".  ", { size: 19 }),
  num(9), t(" They use the strong winds there to move faster.  ", { size: 19 }),
  num(10), t(" Meanwhile, other shearwaters head straight into the storm\u2019s center.  ", { size: 19 }),
  num(11), t(" Scientists think shearwaters might do this to save", { size: 19 }), ...BL(8), t("and avoid dangers near the land.  ", { size: 19 }),
  num(12), t(" Flying into a storm\u2019s center is a smart trick that only shearwaters seem to know!", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[2, "They have a special way to deal with big storms."],
 [12, "Flying into a storm\u2019s center is a smart trick that only shearwaters seem to know!"]].forEach(([n, s], i) => {
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
w7block("1", "그들은 그곳에 최대 여덟 시간 동안 머물렀다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)",
  "hours / stayed / They / up / eight / for / there / to");
w7block("2", "그들은 그곳의 강한 바람을 이용해 더 빠르게 이동한다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 9단어)",
  "there / winds / They / faster / the / use / to / strong / move");

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

K.push(...tab("정답 및 해설", "UNIT 16  폭풍의 눈으로 날아드는 새", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("Shearwaters are birds that live near the ocean.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문2 ", { size: 17, bold: true, color: NAVY2 }), t("They(S)·have(△V)·to deal with big storms(M)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("Meanwhile(M)·other shearwaters(S)·head(△V)·into the center(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문7 ", { size: 17, bold: true, color: NAVY2 }), t("To learn more~(M)·scientists(S)·tracked(△V)·during storms for 11 years(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 우리는 동물원을 방문할 계획이 있다  (2) 오늘 오후에 비가 올지도 모른다  (3) 그녀는 자전거를 고칠 좋은 방법을 알고 있을지도 모른다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 shearwaters · storm · trick        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 대조 · 이유 · 한편 · 덧붙임   2-2 [B] 놀라운 관찰 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓓ → ⓐ → ⓑ  ·  Flying into a storm’s center is a smart trick that only shearwaters know.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) storms  (2) edges  (3) center  (4) energy        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 ②  문장 5 ①  문장 6 ③  문장 9 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5F · 6T · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓓ → ⓒ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓓ · 3ⓕ · 4ⓔ · 5ⓐ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) are  (2) was  (3) might do  (4) Flying", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) ocean (2) storms (3) straight (4) center (5) surprising (6) tracked (7) edges (8) energy", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) They stayed there for up to eight hours.  (2) They use the strong winds there to move faster.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("대부분의 새와 달리 폭풍 속으로 날아드는 슴새의 행동(문장 1–6)과 11년 추적으로 밝혀진 두 가지 비행법·이유(문장 7–12)를 소개한다. 소재와 평가를 함께 담은 ①이 제목이다. ②은 지엽적이고 ③·④는 무관, ⑤는 본문과 반대다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 7에서 과학자들은 11년 동안 비행 경로를 추적했다고 했으므로, 1년뿐이라는 ④은 본문과 다르다. ①은 문장 1, ②은 문장 3, ③는 문장 4–5, ⑤는 문장 8–9에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) this는 바로 앞 문장 10의 행동, 곧 폭풍의 중심으로 곧장 날아드는 것을 가리킨다. 뒤에 이어지는 '에너지를 아끼려고'가 그 행동의 이유다.", true);
Hs("독해 04   배열 영작   ·   Shearwaters are birds that live near the ocean.");
B("문장 1을 그대로 복원하는 문제다. ① 첫 글자는 대문자 Shearwaters — 복수 주어이므로 are.   ② birds 뒤에 that이 와서 뒤의 설명을 잇는다.   ③ near the ocean이 한 덩어리로 맨 뒤.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 shearwaters · storm · trick     1-3 아래 참조");
B("1-1   정답 ②. 폭풍 속으로 날아드는 슴새의 행동과 그 이유를 다룬 글이다. ① 폭풍이 만들어지는 과정은 나오지 않고, ③ 추적은 연구 방법으로 한 번 언급될 뿐이다.");
B("1-2   ○표 할 세 단어: shearwaters(힌트① 주인공) · storm(힌트② 뛰어드는 곳) · trick(힌트③ 글쓴이의 평가). 나머지 셋(scientists · ocean · winds)은 본문에 나오지만 관찰자와 배경일 뿐이다.");
B("1-3   문장 5 — They는 슴새들, there는 폭풍의 눈에 ○.   문장 9 — there는 폭풍 가장자리에 ○ (문장 8의 edges).   문장 11 — this는 중심으로 날아들기에 ○ (문장 10).");
B("[학습 포인트]   같은 there라도 문장 5에서는 폭풍의 눈, 문장 9에서는 폭풍 가장자리다. 장소를 받는 지시어는 반드시 바로 앞 문장에서 짝을 찾아 확인하자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 대조 / 이유 / 한편 / 덧붙임     2-2 [B] 놀라운 관찰 · [E] 마무리     2-3 ①");
B("2-1   문장 3 While — 다른 새들과 슴새를 맞세우는 '대조'.   문장 6 because — 놀라운 '이유'.   문장 10 Meanwhile — 앞의 무리와 다른 무리를 잇는 '한편'.   문장 11 and — 이유를 하나 더 잇는 '덧붙임'.");
B("2-2   [B] 놀라운 관찰(문장 4–6: 눈 근처에서 여덟 시간을 머무는 모습), [E] 마무리(문장 11–12: 이유와 평가). 보기의 '광고'는 이 글에 없는 역할이다. [A] 소개 → [B] 놀라운 관찰 → [C] 연구 → [D] 두 갈래 → [E] 마무리.");
B("2-3   정답 ①. 슴새라는 동물의 행동과 과학자들의 관찰 결과를 사실대로 알려 주는 설명문이다. ② 가격이나 사라는 말이 없고, ③·④·⑤의 형식적 신호(날짜·Dear·행갈이)도 없다.");
B("[학습 포인트]   대조의 While과 한편의 Meanwhile은 '둘을 나란히 놓는다'는 점이 같다. 이런 말이 보이면 무엇과 무엇이 갈리는지부터 표시해 두자.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 center · trick     3-3 ⓒ → ⓓ → ⓐ → ⓑ");
B("3-1  재료 찾기 — (2) 문장 4에서 center에 ○: 슴새가 향하는 폭풍의 한가운데다. edges는 다른 무리가 도는 가장자리다. (3) 문장 12에서 trick에 ○: 글쓴이의 평가가 담긴 말이다. danger는 문장 11의 세부 사항일 뿐이다.");
B("3-2  뼈대 채우기 — (1) Flying  (2) center  (3) trick.  넣으면 Flying into a storm’s center is a smart trick that only shearwaters know.가 완성된다.");
B("3-3  정답 순서 — ⓒ Flying into → ⓓ a storm’s center → ⓐ is a smart trick → ⓑ that only shearwaters know.");
B("[채점 포인트]  동명사 덩어리(ⓒ+ⓓ)가 통째로 주어다. 주어가 길어도 동사는 하나(is) — 주어 덩어리의 끝을 찾는 것이 요령이다.", true);
Hs("STEP 4   요약문   ·   (1) storms  (2) edges  (3) center  (4) energy");
B("(1)은 문장 2–3의 storms, (2)는 문장 8의 edges, (3)은 문장 10의 center, (4)는 문장 11의 energy에서 가져온다. 요약문이 곧 이 글의 흐름이다: 특이 행동(1) → 두 갈래(2·3) → 이유(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 ②   문장 5 ①   문장 6 ③   문장 9 ②  (정답 선지는 무표시)");
B("문장 3 fly straight into them   ① ✕ [반대] 폭풍에서 멀리 달아난다 — 정반대.   ② ○ 폭풍 속으로 곧장 날아든다.   ③ ✕ [무관] 폭풍 때 나는 것을 멈춘다는 말은 없다.");
B("문장 5 for up to eight hours   ① ○ 여덟 시간이나 되는 동안.   ② ✕ [반대] 단 몇 초 — 정반대.   ③ ✕ [무관] 여드레 동안 굶었다는 말은 지문에 없다.");
B("문장 6 very surprising   ① ✕ [반대] 아주 흔하고 평범하다 — 정반대.   ② ✕ [무관] 사람에게 위험하다는 말은 없다.   ③ ○ 믿기 어려울 만큼 놀랍다.");
B("문장 9 to move faster   ① ✕ [반대] 속도를 늦추려고 — 정반대.   ② ○ 더 빨리 이동하려고.   ③ ✕ [무관] 먹이를 더 찾으려고는 지문에 없다.");
B("[학습 포인트]  up to(최대 ~까지)처럼 수를 꾸미는 말은 시험에서 자주 바뀐다. 숫자만 보지 말고 앞뒤의 꾸밈말까지 함께 읽자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 F · 6 T · 7 T · 8 F");
B("1 T — 문장 1.   2 F — 문장 3: 대부분의 새는 폭풍에서 멀리 달아난다.   3 T — 문장 4.   4 F — 문장 5: 여덟 분(minutes)이 아니라 여덟 시간(hours)이다.   5 F — 문장 6: 이렇게 하는 새는 슴새 말고는 없다.   6 T — 문장 7.   7 T — 문장 8–9.   8 F — 문장 11: 에너지를 더 쓰는 게 아니라 아끼려고 한다.  거짓 넷은 모두 한 요소만 비튼 것이다.", true);
Hs("R2   연구 순서   ·   ⓑ → ⓐ → ⓓ → ⓒ");
B("ⓑ 폭풍의 눈 가까이 나는 슴새를 발견한다(문장 4) → ⓐ 11년 동안 비행 경로를 추적한다(문장 7) → ⓓ 일부는 가장자리를 돈다는 것을 알아낸다(문장 8) → ⓒ 에너지를 아끼려는 행동이라고 추측한다(문장 11). 관찰 → 조사 → 발견 → 해석, 과학 글의 전형적인 순서다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓓ · 3 ⓕ · 4 ⓔ · 5 ⓐ · 6 ⓑ");
B("ocean = 아주 넓은 소금물의 구역 · storm = 강한 바람과 비가 몰아치는 나쁜 날씨 · notice = 처음으로 알아채다 · track = 어디로 가는지 따라가며 기록하다 · avoid = ~에서 떨어져 있다, 피하다 · behavior = 사람이나 동물이 행동하는 방식.", true);
Hs("R4   어법 기초   ·   (1) are  (2) was  (3) might do  (4) Flying");
B("(1) 주어 Shearwaters는 복수 — are.   (2) 주어 This는 단수이고 과거의 일 — was.   (3) 조동사 might 뒤에는 동사원형 — might do. 2면 구문 카드의 그 원칙이다.   (4) '~하는 것은'이라는 주어는 동사원형+ing — Flying.", true);
Hs("R5   빈칸 클로즈   ·   (1) ocean (2) storms (3) straight (4) center (5) surprising (6) tracked (7) edges (8) energy");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: live near the ___ ← 사는 곳, fly ___ into them ← 곧장, the storm’s ___ ← 중심과 가장자리, to save ___ ← 아끼는 것.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 그들은 큰 폭풍에 대처하는 특별한 방법을 가지고 있다.  — to deal with가 앞의 way를 꾸며 '~할 방법'이 된다.");
B("(2) 폭풍의 중심으로 날아드는 것은 오직 슴새만 아는 듯한 영리한 비결이다.  — 동명사 주어 Flying ~ center를 한 덩어리로 잡는 것이 핵심이다.", true);
Hs("R7   조건 영작   ·   (1) They stayed there for up to eight hours.  (2) They use the strong winds there to move faster.");
B("(1) 문장 5의 복원. ㄱ 첫 글자 대문자 They  ㄴ for up to가 한 덩어리로 '최대 ~ 동안'.");
B("(2) 문장 9의 복원. ㄱ the strong winds 뒤에 there(그곳의)가 붙는다  ㄴ to move faster가 목적을 나타내며 맨 뒤에 온다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("슴새는 바다 가까이에 사는 새다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 큰 폭풍에 대처하는 특별한 방법을 가지고 있다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("대부분의 새가 폭풍에서 달아나는 반면, 슴새는 폭풍 속으로 곧장 날아든다!  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과학자들은 폭풍이 치는 동안 이 새들이 이따금 폭풍의 중심, 즉 ‘눈(eye)’이라 불리는 곳 아주 가까이까지 난다는 것을 알아챘다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 그곳에 최대 여덟 시간 동안 머물렀다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것은 매우 놀라운 일이었는데, 이렇게 행동한다고 알려진 새는 달리 없기 때문이다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("슴새의 행동을 더 알아보기 위해, 과학자들은 폭풍이 칠 때의 비행 경로를 11년 동안 추적했다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과학자들은 일부 슴새가 폭풍의 가장자리를 돌아 나는 쪽을 택한다는 것을 알아냈다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 그곳의 강한 바람을 이용해 더 빠르게 이동한다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("한편, 다른 슴새들은 폭풍의 중심으로 곧장 향한다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과학자들은 슴새가 에너지를 아끼고, 부딪힐 수 있는 날아다니는 것들처럼 육지 가까이의 위험을 피하려고 이렇게 하는 것일지도 모른다고 생각한다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("폭풍의 중심으로 날아드는 것은 오직 슴새만 아는 듯한 영리한 비결이다!", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};