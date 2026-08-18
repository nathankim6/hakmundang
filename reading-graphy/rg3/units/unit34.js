/* UNIT 34 — 인터넷은 바다 밑을 지난다 (Level 3)
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
  title: "인터넷은 바다 밑을 지난다",
  level: "3",
  foot: "UNIT 34  인터넷은 바다 밑을 지난다",
  banner: ["34", "인터넷은 바다 밑을 지난다", "3"],
  timeline: ["1858|첫 해저 전신선|대서양을 가로질러\\n전보가 오가다|sparkle_drop",
             "1956|전화 케이블|목소리를 실어 나르는\\n구리선이 깔리다|city",
             "1988|광섬유 시대|빛으로 데이터를\\n보내기 시작하다|sun",
             "오늘|인터넷의 뼈대|전 세계 데이터의\\n95%가 바다 밑으로|drop_x"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "Data doesn’t just float in the cloud; it travels through big cables under the sea.",
  "More than 95 percent of international data is sent by them.",
  "They are hundreds of thousands of miles long and lie 8,000 meters below the ocean’s surface — almost as deep as Mount Everest is tall.",
  "The cables are safest in deep water.",
  "Laying these cables is hard work.",
  "Workers use special ships to place cables and must choose the best path for the cables, avoiding fishing areas or military zones.",
  "This work can take months at sea.",
  "You might wonder, “Why don’t we use satellites for the internet?”",
  "Using satellites can have delays.",
  "But, the undersea cables are very fast because they use optical fibers that send data almost as fast as light!",
  "As more people use the internet, we’ll need more cables.",
  "So, if your internet is slow sometimes, just be more patient.",
  "The workers are doing their best.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–2 [B]3–4 [C]5–7 [D]8–10 [E]11–13 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 3: "B", 5: "C", 8: "D", 11: "E" };
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
  1: [R("Data doesn’t just float in the cloud; "), RM("it"), R(" travels through big cables under the sea.  ")],
  2: [R("More than 95 percent of international data is sent by "), RM("them"), R(".  ")],
  5: [R("Laying "), RM("these cables"), R(" is hard work.  ")],
  10: [R("But, the undersea cables are very fast because "), RM("they"), R(" use optical fibers "), RM("that"), R(" send data almost as fast as light!  ")],
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
  2: [t("More than 95 percent of international data is sent by ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("them", { size: 19, bold: true, underline: {} }),
      t(".  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Under the Sea: The Cables That Carry the Internet", "② How to Become a Ship Worker",
 "③ The Best Places to Go Fishing", "④ Why Satellites Are Slow",
 "⑤ Mount Everest: The World’s Tallest Mountain"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① More than 95 percent of international data is sent by undersea cables.",
 "② The cables lie 8,000 meters below the ocean’s surface.",
 "③ Workers must avoid fishing areas or military zones.",
 "④ Using satellites for the internet has no delays.",
 "⑤ The undersea cables use optical fibers to send data."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) them이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① the big cables under the sea",
 "② the satellites in space",
 "③ the workers on special ships",
 "④ the fishing areas in the ocean",
 "⑤ the optical fibers made of glass"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그 케이블들은 깊은 물속에서 가장 안전하다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 7단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("water / the / safest / cables / deep / are / in", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   원급 비교 as ~ as '…만큼 ~한'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("almost ", { size: 18 }), t("as deep as", { size: 18, bold: true, color: NAVY }), t(" Mount Everest is tall", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("as와 as 사이에는 형용사·부사의 원래 모양이 옵니다. '에베레스트만큼 깊은'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 5", { size: 14, bold: true, color: AMB }), t("   동명사 주어 '~하는 것은'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Laying these cables", { size: 18, bold: true, color: NAVY, underline: {} }), t(" is hard work", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사+ing가 주어 자리에 오면 '~하는 것은'이고, 단수로 취급합니다.", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 3 구문", [t("My bag is ", { size: 19 }), t("as heavy as", { size: 19, bold: true, color: NAVY }), t(" yours", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 5 구문", [t("Swimming in the sea", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is a lot of fun.", { size: 19 })]],
 ["둘 다!", [t("Running fast", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is ", { size: 19 }), t("as important as", { size: 19, bold: true, color: NAVY }), t(" jumping high", { size: 19, underline: {} }), t(".", { size: 19 })]],
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

/* 먼저 보기 — 다 표시된 문장 (문장 2: 모든 표시 등장) */
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
  T([1250, 800, 1500, 1900, 700, 1550, 1230], [new TableRow({ children: [
    exSeg([t("Workers", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1250),
    exSeg([t("use", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 800, "△"),
    exSeg([t("special ships", { size: 18 })], "", FAINT, 1500),
    exSeg([t("to place cables", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 1900),
    exSeg([t("and", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 700),
    exSeg([t("must choose", { size: 18, bold: true, color: NAVY })], "V 한 덩어리", NAVY, 1550, "△"),
    exSeg([t("the best path", { size: 18 })], "", FAINT, 1230),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[1, "Data doesn’t just float in the cloud; it travels through big cables under the sea."],
 [10, "But, the undersea cables are very fast because they use optical fibers that send data almost as fast as light!"],
 [11, "As more people use the internet, we’ll need more cables."]].forEach(([n, c]) => {
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
["① 바다에 사는 물고기의 종류", "② 인터넷 데이터를 나르는 해저 케이블", "③ 인공위성을 쏘아 올리는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["data", "데이터"], ["cables", "케이블"], ["fast", "빠른"], ["satellites", "인공위성"], ["workers", "작업자"], ["ships", "배"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 데이터가 지나가는 길  ③ 그 길의 가장 큰 장점 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · them 같은 지시어는 앞에 나온 말을 대신합니다. 한 문장 안에서도 가리키는 대상이 바뀔 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
      labC("they =", 820), chipC("케이블", 1200), gapC(170), chipC("광섬유", 1200), gapC(300),
      labC("that =", 930), chipC("케이블", 1200), gapC(170), chipC("광섬유", 1200),
    ] })]);
    return [
    ["1", "it", [t("Data (데이터)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["2", "them", chips2("해저 케이블들", "구름들", 1900), false],
    ["5", "these cables", chips2("해저 케이블들", "특별한 배들", 1900), false],
    ["10", "they / that", chips8(), false],
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
    ["6", [t("Workers use special ships to place cables ", { size: 17 }), t("and", { size: 17, bold: true, color: NAVY, underline: {} }), t(" must choose the best path.", { size: 17 })], ["덧붙임", "반전"]],
    ["10", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(", the undersea cables are very fast because they use optical fibers.", { size: 17 })], ["반전", "결과"]],
    ["11", [t("As", { size: 17, bold: true, color: NAVY, underline: {} }), t(" more people use the internet, we’ll need more cables.", { size: 17 })], ["~할수록", "덧붙임"]],
    ["12", [t("So", { size: 17, bold: true, color: NAVY, underline: {} }), t(", if your internet is slow sometimes, just be more patient.", { size: 17 })], ["결과", "~할수록"]],
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
    chipCellG("모습", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("비교", 1400),
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
  flowCell("B", null, "문장 3–4", true),
  arrowCell(),
  flowCell("C", "설치", "문장 5–7", false),
  arrowCell(),
  flowCell("D", null, "문장 8–10", true),
  arrowCell(),
  flowCell("E", "마무리", "문장 11–13", false),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 사실을 알기 쉽게 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일을 적은 일기",
 "④ 등장인물이 나오는 동화",
 "⑤ 행사에 초대하는 초대장"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "2", "이 글의 주인공은 무엇인가요? (두 단어)", "international data", "문장 맨 앞 (주어)", true),
  matRow("2", "1", "데이터가 지나가는 길은?", ["undersea cables", "big clouds"], "through 뒤 자리 (길)", false),
  matRow("3", "10", "글쓴이가 강조한 그 길의 장점은?", ["fast", "slow"], "because절 끝자리 (평가)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("Most  ", { size: 19 }),
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   travels through big  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   because they are very  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t(" .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ because they are very fast.     ⓑ Most international data     ⓒ through big undersea cables     ⓓ travels", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  ⓑ  )", { size: 19 }), t("  →  (      )  →  (      )  →  (      )", { size: 19 }),
  t("      ⓑ이 맨 앞 — 주인공이 주어!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("cables        satellites        deep        fast", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Most international data travels through big (1) ____________ under the sea, not through the cloud. They lie in (2) ____________ water, and laying them is hard work. We do not use (3) ____________ for the internet because they can have delays. Optical fibers make the cables very (4) ____________ .", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 2, main: "more than 95 percent of data is sent by them",
    opts: ["① almost all international data goes through them", "② only a small part of data goes through them", "③ all data is stored inside them"] },
  { sn: 5, main: "Laying these cables is hard work",
    opts: ["① putting the cables down is not easy", "② setting the cables is very simple", "③ cleaning the cables takes one day"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 9, main: "Using satellites can have delays",
    opts: ["① satellites may be slower", "② satellites are always the fastest", "③ satellites are too expensive to build"] },
  { sn: 12, main: "just be more patient",
    opts: ["① wait a little longer", "② get angry right away", "③ buy a new computer"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 바다 밑을 지나는 해저 케이블", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("우리가 말하는 '클라우드'는 하늘이 아니라 바다 밑에 있다. 대륙과 대륙을 잇는 해저 케이블은 1858년 대서양 전신선에서 시작해, 지금은 400개가 넘는 노선이 지구를 감싸고 있다. 굵기는 정원 호스 정도지만 안에는 머리카락보다 가는 광섬유가 들어 있어, 신호를 빛의 형태로 실어 나른다. 얕은 바다에서는 배의 닻이나 어망에 끊기기 쉬워 두꺼운 보호층을 덧입히고, 깊은 바다에서는 오히려 안전해 얇게 만든다. 케이블이 끊기면 수리선이 바다로 나가 며칠에 걸쳐 건져 올려 다시 잇는다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
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
    "More than 95 percent of international data is sent by undersea cables.",
    "The cables lie 800 meters below the ocean’s surface.",
    "The cables are safest in deep water.",
    "Laying these cables is easy work.",
    "Workers must avoid fishing areas or military zones.",
    "This work can take days at sea.",
    "The undersea cables use optical fibers.",
    "As more people use the internet, we will need fewer cables.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "해저 케이블을 놓는 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Workers choose the best path, avoiding fishing and military zones.",
      "ⓑ Special ships carry the cables out to sea and place them.",
      "ⓒ The work takes months at sea.",
      "ⓓ Data travels through the finished cables under the sea."]
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
    ["1  float", "ⓐ the top part of water or land"],
    ["2  surface", "ⓑ able to wait without getting angry"],
    ["3  path", "ⓒ to stay on top of water or air"],
    ["4  avoid", "ⓓ a way from one place to another"],
    ["5  delay", "ⓔ a time when something is later than planned"],
    ["6  patient", "ⓕ to stay away from something"],
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
[["문장 2", [t("More than 95 percent of international data ", { size: 19 }), t("( is  /  are )", { size: 19, bold: true, color: NAVY }), t(" sent by them.", { size: 19 })], "percent of data는 단수로 봅니다."],
 ["문장 5", [t("( Laying  /  Lay )", { size: 19, bold: true, color: NAVY }), t(" these cables is hard work.", { size: 19 })], "주어 자리에는 동사원형이 올 수 없어요."],
 ["문장 6", [t("Workers use special ships ", { size: 19 }), t("( to place  /  placing )", { size: 19, bold: true, color: NAVY }), t(" cables.", { size: 19 })], "'~하기 위해'는 to+동사원형!"],
 ["문장 13", [t("The workers ", { size: 19 }), t("( are  /  is )", { size: 19, bold: true, color: NAVY }), t(" doing their best.", { size: 19 })], "진행형은 be+~ing — 주어의 수에 맞춰요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("months  /  fast  /  cables  /  patient  /  surface  /  delays  /  path  /  hard", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Data doesn’t just float in the cloud; it travels through big", { size: 19 }), ...BL(1), t("under the sea.  ", { size: 19 }),
  num(2), t(" More than 95 percent of international data is sent by them.  ", { size: 19 }),
  num(3), t(" They are hundreds of thousands of miles long and lie 8,000 meters below the ocean’s", { size: 19 }), ...BL(2), t(".  ", { size: 19 }),
  num(4), t(" The cables are safest in deep water.  ", { size: 19 }),
  num(5), t(" Laying these cables is", { size: 19 }), ...BL(3), t("work.  ", { size: 19 }),
  num(6), t(" Workers use special ships to place cables and must choose the best", { size: 19 }), ...BL(4), t("for the cables.  ", { size: 19 }),
  num(7), t(" This work can take", { size: 19 }), ...BL(5), t("at sea.  ", { size: 19 }),
  num(8), t(" You might wonder, “Why don’t we use satellites for the internet?”  ", { size: 19 }),
  num(9), t(" Using satellites can have", { size: 19 }), ...BL(6), t(".  ", { size: 19 }),
  num(10), t(" But, the undersea cables are very", { size: 19 }), ...BL(7), t("because they use optical fibers.  ", { size: 19 }),
  num(11), t(" As more people use the internet, we’ll need more cables.  ", { size: 19 }),
  num(12), t(" So, if your internet is slow sometimes, just be more", { size: 19 }), ...BL(8), t(".  ", { size: 19 }),
  num(13), t(" The workers are doing their best.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[5, "Laying these cables is hard work."],
 [10, "But, the undersea cables are very fast because they use optical fibers that send data almost as fast as light!"]].forEach(([n, s], i) => {
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
w7block("1", "이 작업은 바다에서 몇 달이 걸릴 수 있다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 7단어)",
  "take / this / months / can / sea / work / at");
w7block("2", "국제 데이터의 95퍼센트 이상이 그것들을 통해 전송된다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자에 주의할 것  (총 11단어)",
  "sent / More / data / than / by / 95 / international / percent / is / of / them");

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

K.push(...tab("정답 및 해설", "UNIT 34  인터넷은 바다 밑을 지난다", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("④      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("The cables are safest in deep water.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문1 ", { size: 17, bold: true, color: NAVY2 }), t("Data(S)·doesn’t float(△V)·it(S)·travels(△V)·through big cables(M)", { size: 17, bold: true })], { after: 22 }),
  p([t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("cables(S)·are(△V)·because[네모]·they(S′)·use(△V′)   ", { size: 17, bold: true }),
     t("문11 ", { size: 17, bold: true, color: NAVY2 }), t("As[네모]·people(S′)·use(△V′)·we(S)·’ll need(△V)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 내 가방은 네 것만큼 무겁다  (2) 바다에서 수영하는 것은 아주 재미있다  (3) 빨리 달리는 것은 높이 뛰는 것만큼 중요하다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 data · cables · fast        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 덧붙임 · 반전 · ~할수록 · 결과   2-2 [B] 모습 · [D] 비교   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓑ → ⓓ → ⓒ → ⓐ  ·  Most international data travels through big undersea cables because they are very fast.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) cables  (2) deep  (3) satellites  (4) fast        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 2 ①  문장 5 ①  문장 9 ①  문장 12 ①", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓐ → ⓑ → ⓒ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓐ · 3ⓓ · 4ⓕ · 5ⓔ · 6ⓑ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) is  (2) Laying  (3) to place  (4) are", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) cables (2) surface (3) hard (4) path (5) months (6) delays (7) fast (8) patient", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) This work can take months at sea.  (2) More than 95 percent of international data is sent by them.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 인터넷 데이터가 바다 밑 케이블로 오간다는 사실(문장 1–2)과 그 설치·속도(문장 5–10)를 설명한다. 소재와 특징을 함께 담은 ①이 적절하다. ④·⑤는 지엽적 오답, ②·③은 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ④");
B("문장 9에서 인공위성을 쓰면 지연이 생길 수 있다(can have delays)고 했다. 지연이 없다고 한 ④가 본문과 반대된다. ①은 문장 2, ②는 문장 3, ③은 문장 6, ⑤는 문장 10에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) them은 바로 앞 문장 1의 big cables under the sea를 가리킨다. 데이터가 무엇을 통해 오가는지 생각하면 된다 — 지시어는 바로 앞에서 찾는 것이 원칙이다.", true);
Hs("독해 04   배열 영작   ·   The cables are safest in deep water.");
B("문장 4를 그대로 복원하는 문제다. ① 첫 글자는 대문자 The.   ② safe의 최상급은 safest.   ③ in deep water가 문장 끝에 온다.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 data · cables · fast     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 인터넷 데이터를 나르는 해저 케이블을 다룬다. ① 물고기 이야기는 나오지 않고, ③ 인공위성은 케이블과 비교하려고 등장할 뿐이다.");
B("1-2   ○표 할 세 단어: data(힌트① 주인공) · cables(힌트② 데이터가 지나가는 길) · fast(힌트③ 그 길의 장점). 나머지 셋(satellites · workers · ships)은 본문에 등장하지만 주제문에 들어가지 않는다 — 비교 대상과 설치 과정일 뿐이다.");
B("1-3   문장 2 — them은 해저 케이블들에 ○.   문장 5 — these cables도 해저 케이블들에 ○ (문장 1의 그 케이블).   문장 10 — they는 케이블, that은 광섬유에 ○ — 한 문장 안에서 대상이 바뀐다.");
B("[학습 포인트]   문장 10처럼 한 문장 안에서 지시어가 가리키는 대상이 바뀌기도 한다. that 앞의 명사(optical fibers)를 보면 짝을 바로 찾을 수 있다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 덧붙임 / 반전 / ~할수록 / 결과     2-2 [B] 모습 · [D] 비교     2-3 ①");
B("2-1   문장 6 and — 두 가지 할 일을 '덧붙임'.   문장 10 But — 위성과 방향이 바뀌는 '반전'.   문장 11 As — '~할수록'이라는 비례.   문장 12 So — 앞 내용의 '결과'로 인내를 권한다.");
B("2-2   [B] 모습(문장 3–4: 길이·깊이 등 케이블의 생김새), [D] 비교(문장 8–10: 위성과 견주어 케이블이 빠른 이유). 보기의 '광고'는 이 글에 없는 역할이다. [A] 소개 → [B] 모습 → [C] 설치 → [D] 비교 → [E] 마무리 — 설명문의 전형적인 흐름이다.");
B("2-3   정답 ①. 해저 케이블에 관한 사실을 차례로 알려 주는 설명문이다. ② 가격·명령문이 없어 광고가 아니고, ③ I·날짜, ④ 등장인물과 사건, ⑤ 초대의 형식도 없다.");
B("[학습 포인트]   But 뒤가 글쓴이가 진짜 하고 싶은 말인 경우가 많다. 문장 10의 But 뒤에 이 글의 주제(케이블이 빠르다)가 놓여 있다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 undersea cables · fast     3-3 ⓑ → ⓓ → ⓒ → ⓐ");
B("3-1  재료 찾기 — (2) 문장 1에서 undersea cables에 ○: 데이터가 지나가는 길이다. big clouds는 글쓴이가 아니라고 못 박은 말이다. (3) 문장 10에서 fast에 ○: 케이블의 가장 큰 장점이다. slow는 위성 쪽 이야기다.");
B("3-2  뼈대 채우기 — (1) international data  (2) undersea cables  (3) fast.  넣으면 Most international data travels through big undersea cables because they are very fast.가 완성된다.");
B("3-3  정답 순서 — ⓑ Most international data → ⓓ travels → ⓒ through big undersea cables → ⓐ because they are very fast.");
B("[채점 포인트]  주인공(ⓑ)이 맨 앞, 마침표가 붙은 덩어리(ⓐ)가 맨 뒤 — 주어 바로 뒤에 동사 덩어리(ⓓ)가 온다는 것만 기억하면 된다.", true);
Hs("STEP 4   요약문   ·   (1) cables  (2) deep  (3) satellites  (4) fast");
B("(1)은 문장 1의 cables, (2)는 문장 4의 deep, (3)은 문장 8–9의 satellites, (4)는 문장 10의 fast에서 가져온다. 요약문이 곧 이 글의 흐름이다: 소개(1) → 모습(2) → 비교(3) → 이유(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 2 ①   문장 5 ①   문장 9 ①   문장 12 ①  (정답 선지는 무표시)");
B("문장 2 more than 95 percent ~ is sent by them   ① ○ 거의 모든 국제 데이터가 그것을 지난다.   ② ✕ [반대] 아주 일부만 지난다 — 정반대.   ③ ✕ [무관] 데이터를 안에 저장한다는 말은 지문에 없다.");
B("문장 5 Laying these cables is hard work   ① ○ 케이블을 내려놓는 일은 쉽지 않다.   ② ✕ [반대] 아주 간단하다 — 정반대.   ③ ✕ [무관] 청소에 하루가 걸린다는 말은 지문에 없다.");
B("문장 9 Using satellites can have delays   ① ○ 위성은 더 느릴 수 있다.   ② ✕ [반대] 언제나 가장 빠르다 — 정반대.   ③ ✕ [무관] 만드는 비용이 비싸다는 말은 지문에 없다.");
B("문장 12 just be more patient   ① ○ 조금만 더 기다리라.   ② ✕ [반대] 곧바로 화를 내라 — 정반대.   ③ ✕ [무관] 새 컴퓨터를 사라는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. 지문을 읽을 때마다 '이 표현을 다른 말로 하면?'을 스스로 물어보자. 지금은 반대/무관 두 갈래를 정확히 가르는 것이 먼저다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 2.   2 F — 문장 3: 800미터가 아니라 8,000미터 아래다.   3 T — 문장 4.   4 F — 문장 5: 쉬운(easy) 일이 아니라 힘든(hard) 일이다.   5 T — 문장 6.   6 F — 문장 7: 며칠(days)이 아니라 몇 달(months)이 걸린다.   7 T — 문장 10.   8 F — 문장 11: 더 적은(fewer) 것이 아니라 더 많은(more) 케이블이 필요하다.  거짓 문장은 모두 본문에서 딱 한 요소를 비튼 것이다 — 그 한 곳을 찾는 것이 정독이다.", true);
Hs("R2   사건 순서   ·   ⓐ → ⓑ → ⓒ → ⓓ");
B("ⓐ 어업·군사 구역을 피해 가장 좋은 경로를 고른다(문장 6) → ⓑ 특별한 배가 케이블을 싣고 나가 내려놓는다(문장 6) → ⓒ 그 작업은 바다에서 몇 달이 걸린다(문장 7) → ⓓ 완성된 케이블로 데이터가 오간다(문장 1). 글은 ⓓ를 문장 1에서 가장 먼저 말하지만 실제로는 가장 나중의 일이다 — 서술 순서와 사건 순서가 다른 지점이 이 문항의 핵심이다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓐ · 3 ⓓ · 4 ⓕ · 5 ⓔ · 6 ⓑ");
B("float = 물이나 공기 위에 떠 있다 · surface = 물이나 땅의 맨 윗부분 · path = 한 곳에서 다른 곳으로 가는 길 · avoid = 무엇을 피하다 · delay = 예정보다 늦어지는 시간 · patient = 화내지 않고 기다릴 줄 아는.", true);
Hs("R4   어법 기초   ·   (1) is  (2) Laying  (3) to place  (4) are");
B("(1) 'percent of + 셀 수 없는 명사'는 단수로 본다 — is sent.   (2) 주어 자리에는 동사원형이 올 수 없다 — 동명사 Laying.   (3) '~하기 위해'는 to+동사원형 — to place. 2면 구문과 이어진다.   (4) 주어 The workers는 복수 — are doing.", true);
Hs("R5   빈칸 클로즈   ·   (1) cables (2) surface (3) hard (4) path (5) months (6) delays (7) fast (8) patient");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: through big ___ ← 데이터의 길, the ocean’s ___ ← 바다 표면, the best ___ ← 경로, be more ___ ← 인내. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 이 케이블들을 놓는 일은 힘든 작업이다.  — 동명사 주어 Laying을 '~하는 일은'으로 옮기는 것이 핵심이다.");
B("(2) 하지만 해저 케이블은 빛만큼이나 빠르게 데이터를 보내는 광섬유를 쓰기 때문에 아주 빠르다!  — because 이하가 이유, as fast as light가 '빛만큼 빠르게'다.", true);
Hs("R7   조건 영작   ·   (1) This work can take months at sea.  (2) More than 95 percent of international data is sent by them.");
B("(1) 문장 7의 복원. ㄱ 첫 글자 대문자 This  ㄴ can take는 조동사+동사원형 한 덩어리  ㄷ at sea가 문장 끝에 온다.");
B("(2) 문장 2의 복원. ㄱ 첫 글자 대문자 More  ㄴ More than 95 percent of ~가 하나의 주어 덩어리  ㄷ is sent by them — 수동태는 be+p.p 한 덩어리다. R4-(1)에서 확인한 수 일치가 여기서 다시 나온다 — 워크북은 서로 연결되어 있다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("데이터는 그저 클라우드에 떠 있는 것이 아니다; 그것은 바다 밑의 커다란 케이블을 통해 이동한다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("국제 데이터의 95퍼센트 이상이 그것들을 통해 전송된다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것들은 길이가 수십만 마일에 이르고 바다 표면에서 8,000미터 아래에 놓여 있는데 — 이는 에베레스트산의 높이만큼이나 깊다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 케이블들은 깊은 물속에서 가장 안전하다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 케이블들을 놓는 일은 힘든 작업이다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("작업자들은 특별한 배를 이용해 케이블을 놓고, 어업 구역이나 군사 구역을 피하면서 케이블에 가장 좋은 경로를 골라야 한다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이 작업은 바다에서 몇 달이 걸릴 수 있다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("여러분은 '왜 우리는 인터넷에 인공위성을 쓰지 않을까?'라고 궁금해할지도 모른다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("인공위성을 쓰면 지연이 생길 수 있다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만, 해저 케이블은 빛만큼이나 빠르게 데이터를 보내는 광섬유를 쓰기 때문에 아주 빠르다!  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("더 많은 사람들이 인터넷을 쓸수록, 우리는 더 많은 케이블이 필요할 것이다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그러니, 인터넷이 가끔 느리더라도, 조금만 더 참아 보자.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("작업자들은 최선을 다하고 있다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
