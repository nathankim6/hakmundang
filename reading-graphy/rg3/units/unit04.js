/* UNIT 04 — 모기가 못 사는 나라 (Level 3)
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
  no: "04",
  title: "모기가 못 사는 나라",
  level: "3",
  foot: "UNIT 04  모기가 못 사는 나라",
  banner: ["04", "모기가 못 사는 나라", "3"],
  timeline: ["겨울|얼음 밑에 숨기|다른 나라 모기는\\n얼음 아래에서 겨울잠|drop_x",
             "여름|밖으로 나오기|날이 풀리면\\n한꺼번에 깨어난다|sun",
             "아이슬란드|너무 빠른 변화|기온이 오르내려\\n숨을 틈이 없다|sparkle_drop",
             "결과|모기 없는 섬|물릴 걱정 없이\\n자연을 즐긴다|leaf"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "Do you know the most dangerous animal in the world?",
  "It’s the mosquito.",
  "Mosquitoes are insects that can spread diseases, like malaria.",
  "They kill about 725,000 people per year.",
  "But people in Iceland don’t have to worry about them!",
  "Mosquitoes can’t survive there.",
  "Scientists think that this is because Iceland is too cold for mosquitoes.",
  "However, mosquitoes can easily be found in other cold countries, like Greenland and Norway.",
  "What is the difference between those countries and Iceland?",
  "In other countries, mosquitoes can hide under the ice in the winter and come out during the summer.",
  "However, for mosquitoes, the temperature in Iceland changes too quickly to hide from the cold.",
  "If you want to escape from mosquitoes in summer, why don’t you visit Iceland?",
  "You can enjoy the beautiful nature and won’t get any mosquito bites.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–4 [B]5–7 [C]8–9 [D]10–11 [E]12–13 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 5: "B", 8: "C", 10: "D", 12: "E" };
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
  2: [RM("It"), R("’s the mosquito.  ")],
  6: [R("Mosquitoes can’t survive "), RM("there"), R(".  ")],
  7: [R("Scientists think that "), RM("this"), R(" is because Iceland is too cold for mosquitoes.  ")],
  9: [R("What is the difference between "), RM("those countries"), R(" and Iceland?  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u04.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  7: [t("Scientists think that ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("this", { size: 19, bold: true, underline: {} }),
      t(" is because Iceland is too cold for mosquitoes.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① The Country Where Mosquitoes Cannot Live", "② How Malaria Spreads Around the World",
 "③ The Beautiful Nature of Greenland", "④ Why Summer in Norway Is So Short",
 "⑤ Easy Ways to Keep Mosquitoes Out of Your House"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① Mosquitoes are insects that can spread diseases like malaria.",
 "② Mosquitoes kill about 725,000 people every year.",
 "③ Mosquitoes cannot be found in Greenland or Norway.",
 "④ In other countries, mosquitoes hide under the ice in the winter.",
 "⑤ In Iceland, the temperature changes too quickly for mosquitoes."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) this가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① that mosquitoes cannot survive in Iceland",
 "② that mosquitoes kill about 725,000 people a year",
 "③ that Iceland has beautiful nature",
 "④ that mosquitoes spread diseases like malaria",
 "⑤ that Greenland and Norway are cold countries"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("하지만 아이슬란드 사람들은 그것들을 걱정할 필요가 없다!", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 10단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("worry / but / them! / people / have / in / Iceland / to / don’t / about", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 3", { size: 14, bold: true, color: AMB }), t("   주격 관계대명사 that", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("insects ", { size: 18 }), t("that", { size: 18, bold: true, color: NAVY }), t(" can spread diseases", { size: 18, underline: {} })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("that 이하가 앞의 명사 insects를 뒤에서 꾸밉니다. '병을 옮길 수 있는 곤충'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   too ~ to … '너무 ~해서 …할 수 없다'", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("changes ", { size: 18 }), t("too quickly to hide", { size: 18, bold: true, color: NAVY, underline: {} }), t(" from the cold", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("too+형용사/부사+to+동사원형은 '너무 ~해서 …할 수 없다'입니다. '너무 빨리 바뀌어서 숨을 수 없다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 3 구문", [t("I have a friend ", { size: 19 }), t("that", { size: 19, bold: true, color: NAVY }), t(" can play the violin", { size: 19, underline: {} }), t(".", { size: 19 })]],
 ["문장 11 구문", [t("The soup was ", { size: 19 }), t("too hot to eat", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
 ["둘 다!", [t("He bought a bag ", { size: 19 }), t("that", { size: 19, bold: true, color: NAVY }), t(" was ", { size: 19, underline: {} }), t("too big to carry", { size: 19, bold: true, color: NAVY, underline: {} }), t(".", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 12를 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([900, 700, 750, 3630, 2950], [new TableRow({ children: [
    exSeg([t("If", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 900),
    exSeg([t("you", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 700),
    exSeg([t("want", { size: 18, bold: true, color: NAVY })], "V′ 동사", NAVY, 750, "△"),
    exSeg([t("to escape from mosquitoes in summer,", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 3630),
    exSeg([t("why don’t you visit Iceland?", { size: 18 })], "", FAINT, 2950),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[5, "But people in Iceland don’t have to worry about them!"],
 [10, "In other countries, mosquitoes can hide under the ice in the winter and come out during the summer."],
 [11, "However, for mosquitoes, the temperature in Iceland changes too quickly to hide from the cold."]
].forEach(([n, c]) => {
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
["① 세상에서 가장 위험한 동물들의 목록", "② 아이슬란드에 모기가 살지 않는 까닭", "③ 말라리아를 치료하는 새로운 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["mosquitoes", "모기"], ["malaria", "말라리아"], ["Iceland", "아이슬란드"], ["Norway", "노르웨이"], ["temperature", "기온"], ["summer", "여름"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 주인공이 살지 못하는 곳  ③ 그 까닭이 되는 것 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · there · this 같은 지시어는 앞에 나온 말을 대신합니다. 장소나 앞 문장 전체를 받기도 해요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
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
    ["2", "It", [t("the most dangerous animal (가장 위험한 동물)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["6", "there", chips2("아이슬란드에서", "그린란드에서", 1900), false],
    ["7", "this", chips2("모기가 없는 것", "병을 옮기는 것", 1900), false],
    ["9", "those countries", chips2("그린란드·노르웨이", "아이슬란드", 2100), false],
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
    ["5", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" people in Iceland don’t have to worry about them!", { size: 17 })], ["반전", "이유"]],
    ["7", [t("Scientists think that this is ", { size: 17 }), t("because", { size: 17, bold: true, color: NAVY, underline: {} }), t(" Iceland is too cold.", { size: 17 })], ["이유", "순서"]],
    ["11", [t("However", { size: 17, bold: true, color: NAVY, underline: {} }), t(", the temperature in Iceland changes too quickly.", { size: 17 })], ["반전", "결과"]],
    ["12", [t("If", { size: 17, bold: true, color: NAVY, underline: {} }), t(" you want to escape from mosquitoes, visit Iceland!", { size: 17 })], ["조건", "순서"]],
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
    chipCellG("예외", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("제안", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("치료법", 1400),
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
  flowCell("C", "의문", "문장 8–9", false),
  arrowCell(),
  flowCell("D", "까닭", "문장 10–11", false),
  arrowCell(),
  flowCell("E", null, "문장 12–13", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 사실을 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일을 기록한 일기",
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
  matRow("1", "6", "이 글에서 아이슬란드에 살지 못하는 것은? (한 단어)", "Mosquitoes", "맨 앞 주어 자리", true),
  matRow("2", "6", "그 일이 벌어지는 나라의 이름은?", ["Iceland", "Norway"], "in 뒤 자리 (장소)", false),
  matRow("3", "11", "아이슬란드에서 너무 빨리 바뀌는 것은?", ["temperature", "summer"], "because 뒤 주어 자리", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ____________", { size: 19, color: NAVY2 }),
  t("   can’t survive in  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   because the  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ____________", { size: 19, color: NAVY2 }),
  t("   changes too quickly for them.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ in Iceland     ⓑ because the temperature     ⓒ Mosquitoes can’t survive     ⓓ changes too quickly for them.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("cold        bites        temperature        dangerous", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Mosquitoes are the most (1) ____________ animal in the world. But they can’t live in Iceland because it is too (2) ____________ for them. In Iceland, the (3) ____________ changes too quickly, so mosquitoes cannot hide. You can enjoy a summer there without any mosquito (4) ____________.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 4, main: "kill about 725,000 people per year",
    opts: ["① save about 725,000 people each year", "② take about 725,000 lives each year", "③ bite about 725,000 animals each year"] },
  { sn: 6, main: "can’t survive there",
    opts: ["① are not able to live there", "② live very well there", "③ visit there every summer"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "can easily be found",
    opts: ["① are kept in special boxes", "② are almost impossible to find", "③ are not hard to find"] },
  { sn: 12, main: "escape from mosquitoes",
    opts: ["① live together with mosquitoes", "② get away from mosquitoes", "③ study mosquitoes closely"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 모기가 없는 섬, 아이슬란드", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("모기는 사람을 가장 많이 죽이는 동물로 꼽힌다. 모기 자체가 무서운 것이 아니라 말라리아, 뎅기열 같은 병을 옮기기 때문이다. 모기는 고인 물에 알을 낳고, 추운 계절에는 얼음이나 땅속에 숨어 겨울을 난다. 그런데 아이슬란드는 화산섬이라 날씨가 하루에도 여러 번 바뀌고, 겨울에도 얼었다 녹기를 되풀이한다. 숨어 있던 자리가 자꾸 녹아 버리니 모기가 겨울을 넘길 수 없는 것이다. 세계에서 모기가 살지 않는 곳은 아이슬란드와 남극 대륙뿐이라고 알려져 있다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u04.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "Mosquitoes can spread diseases, like malaria.",
    "Mosquitoes kill about 725 people per year.",
    "People in Iceland don’t have to worry about mosquitoes.",
    "Scientists think Iceland is too hot for mosquitoes.",
    "Mosquitoes can easily be found in Greenland and Norway.",
    "In other countries, mosquitoes hide under the ice in the summer.",
    "In Iceland, the temperature changes too quickly for mosquitoes to hide.",
    "In Iceland, you will get a lot of mosquito bites.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "이 글이 설명을 펼쳐 나가는 순서대로 ⓐ~ⓓ을 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ People in Iceland don’t have to worry about mosquitoes.",
      "ⓑ Mosquitoes spread diseases and kill many people.",
      "ⓒ In Iceland, the temperature changes too quickly to hide.",
      "ⓓ You can visit Iceland and enjoy a summer without bites."]
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
    ["1  dangerous", "ⓐ to move to more places or people"],
    ["2  insect", "ⓑ a very small animal with six legs"],
    ["3  spread", "ⓒ to get away from a place or thing"],
    ["4  survive", "ⓓ to stay alive"],
    ["5  temperature", "ⓔ able to hurt or kill someone"],
    ["6  escape", "ⓕ how hot or cold something is"],
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
[["문장 3", [t("Mosquitoes ", { size: 19 }), t("( are  /  is )", { size: 19, bold: true, color: NAVY }), t(" insects that can spread diseases.", { size: 19 })], "주어 Mosquitoes는 복수예요."],
 ["문장 5", [t("People in Iceland don’t have to ", { size: 19 }), t("( worry  /  worries )", { size: 19, bold: true, color: NAVY }), t(" about them.", { size: 19 })], "don’t have to 뒤에는 동사원형!"],
 ["문장 8", [t("Mosquitoes can easily ", { size: 19 }), t("( be found  /  found )", { size: 19, bold: true, color: NAVY }), t(" in other cold countries.", { size: 19 })], "'발견되다'는 be+p.p — 조동사 뒤는 be."],
 ["문장 13", [t("You can ", { size: 19 }), t("( enjoy  /  enjoys )", { size: 19, bold: true, color: NAVY }), t(" the beautiful nature.", { size: 19 })], "조동사 can 뒤에는 동사원형이 와요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("mosquito  /  diseases  /  survive  /  cold  /  temperature  /  quickly  /  escape  /  bites", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" Do you know the most dangerous animal in the world?  ", { size: 19 }),
  num(2), t(" It’s the", { size: 19 }), ...BL(1), t(".  ", { size: 19 }),
  num(3), t(" Mosquitoes are insects that can spread", { size: 19 }), ...BL(2), t(", like malaria.  ", { size: 19 }),
  num(4), t(" They kill about 725,000 people per year.  ", { size: 19 }),
  num(5), t(" But people in Iceland don’t have to worry about them!  ", { size: 19 }),
  num(6), t(" Mosquitoes can’t", { size: 19 }), ...BL(3), t("there.  ", { size: 19 }),
  num(7), t(" Scientists think that this is because Iceland is too", { size: 19 }), ...BL(4), t("for mosquitoes.  ", { size: 19 }),
  num(8), t(" However, mosquitoes can easily be found in other cold countries, like Greenland and Norway.  ", { size: 19 }),
  num(9), t(" What is the difference between those countries and Iceland?  ", { size: 19 }),
  num(10), t(" In other countries, mosquitoes can hide under the ice in the winter and come out during the summer.  ", { size: 19 }),
  num(11), t(" However, for mosquitoes, the", { size: 19 }), ...BL(5), t("in Iceland changes too", { size: 19 }), ...BL(6), t("to hide from the cold.  ", { size: 19 }),
  num(12), t(" If you want to", { size: 19 }), ...BL(7), t("from mosquitoes in summer, why don’t you visit Iceland?  ", { size: 19 }),
  num(13), t(" You can enjoy the beautiful nature and won’t get any mosquito", { size: 19 }), ...BL(8), t(".", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[3, "Mosquitoes are insects that can spread diseases, like malaria."],
 [11, "However, for mosquitoes, the temperature in Iceland changes too quickly to hide from the cold."]
].forEach(([n, s], i) => {
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
w7block("1", "그것들은 한 해에 약 725,000명을 죽인다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 7단어)",
  "people / kill / they / year. / 725,000 / about / per");
w7block("2", "너는 아름다운 자연을 즐길 수 있고 모기에 물리지도 않을 것이다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 12단어)",
  "enjoy / bites. / you / and / nature / can / the / won’t / mosquito / beautiful / get / any");

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

K.push(...tab("정답 및 해설", "UNIT 04  모기가 못 사는 나라", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("But people in Iceland don’t have to worry about them!", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("people(S)·don’t have to worry(△V)·in Iceland(M)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("In other countries(M)·mosquitoes(S)·can hide(△V)·and[네모]·come out(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문11 ", { size: 17, bold: true, color: NAVY2 }), t("the temperature(S)·changes(△V)·for mosquitoes(M)·too quickly to hide(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 바이올린을 켤 수 있는 친구가 있다  (2) 그 수프는 너무 뜨거워서 먹을 수 없었다  (3) 그는 너무 커서 들고 다닐 수 없는 가방을 샀다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 mosquitoes · Iceland · temperature        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 반전 · 이유 · 반전 · 조건   2-2 [B] 예외 · [E] 제안   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓒ → ⓐ → ⓑ → ⓓ  ·  Mosquitoes can’t survive in Iceland because the temperature changes too quickly for them.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) dangerous  (2) cold  (3) temperature  (4) bites        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 4 ②  문장 6 ①  문장 8 ③  문장 12 ②", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2F · 3T · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓒ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓔ · 2ⓑ · 3ⓐ · 4ⓓ · 5ⓕ · 6ⓒ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) are  (2) worry  (3) be found  (4) enjoy", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) mosquito (2) diseases (3) survive (4) cold (5) temperature (6) quickly (7) escape (8) bites", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) They kill about 725,000 people per year.  (2) You can enjoy the beautiful nature and won’t get any mosquito bites.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("모기가 세상에서 가장 위험한 동물이지만(문장 1–4) 아이슬란드에서는 살지 못한다는 것(문장 5–11)이 글의 중심이다. 소재와 특징을 함께 담은 ①이 정답. ②·⑤는 지엽적 오답, ③·④는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 8에서 모기는 그린란드와 노르웨이 같은 다른 추운 나라에서는 쉽게 발견된다고 했으므로, 찾을 수 없다는 ③이 본문과 반대된다. ①은 문장 3, ②는 문장 4, ④는 문장 10, ⑤는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) this는 바로 앞 문장 6의 내용, 곧 '모기가 아이슬란드에서 살아남을 수 없다'를 가리킨다. 지시어는 한 단어만이 아니라 앞 문장 전체를 받을 수도 있다.", true);
Hs("독해 04   배열 영작   ·   But people in Iceland don’t have to worry about them!");
B("문장 5를 그대로 복원하는 문제다. ① 첫 글자는 대문자 But.   ② people in Iceland — 전치사구가 주어 뒤에 붙는다.   ③ don’t have to 뒤에는 동사원형 worry.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 mosquitoes · Iceland · temperature     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 아이슬란드에 모기가 살지 않는 까닭을 설명한다. ① 위험한 동물 목록은 도입일 뿐이고, ③ 말라리아 치료법은 나오지 않는다.");
B("1-2   ○표 할 세 단어: mosquitoes(힌트① 주인공) · Iceland(힌트② 살지 못하는 곳) · temperature(힌트③ 그 까닭). 나머지 셋(malaria · Norway · summer)은 본문에 나오지만 주제문에 들어가지 않는다 — 예시와 비교 대상일 뿐이다.");
B("1-3   문장 6 — there는 아이슬란드에서에 ○ (문장 5의 그 나라).   문장 7 — this는 모기가 없는 것에 ○ (문장 6의 내용).   문장 9 — those countries는 그린란드·노르웨이에 ○ (문장 8).");
B("[학습 포인트]   there는 장소를, this는 앞 문장 전체를 받는다. 지시어를 만나면 '이게 뭘 가리키지?'를 확인해 화살표로 이어 두자 — 고등 독해의 지칭 추론이 여기서 자란다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 반전 / 이유 / 반전 / 조건     2-2 [B] 예외 · [E] 제안     2-3 ①");
B("2-1   문장 5 But — 위험하다는 앞 내용을 뒤집는 '반전'.   문장 7 because — 살지 못하는 '이유'.   문장 11 However — 다른 나라와 다르다는 '반전'.   문장 12 If — '~라면'이라는 '조건'. But과 However는 하는 일이 같다.");
B("2-2   [B] 예외(문장 5–7: 아이슬란드에는 모기가 없다), [E] 제안(문장 12–13: 여름에 아이슬란드에 가 보라). 보기의 '치료법'은 이 글에 없는 역할이다. [A] 소개 → [B] 예외 → [C] 의문 → [D] 까닭 → [E] 제안, 설명문의 전형적인 흐름이다.");
B("2-3   정답 ①. 모기라는 대상의 사실을 알려 주고 까닭을 설명하는 설명문이다. ② 가격·명령문이 없어 광고가 아니고, ③ 날짜와 I가 없으며, ④ Dear ~ 같은 인사가 없고, ⑤ 지어낸 인물과 사건도 없다.");
B("[학습 포인트]   연결어만 표시해도 글의 지도가 그려진다. But·However(반전), because(이유), If(조건). 설명문에서 반전 뒤에 오는 문장이 글쓴이가 진짜 하고 싶은 말인 경우가 많다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 Iceland · temperature     3-3 ⓒ → ⓐ → ⓑ → ⓓ");
B("3-1  재료 찾기 — (2) 문장 6에서 Iceland에 ○: 모기가 살지 못하는 그 나라다. Norway는 오히려 모기가 있는 나라다. (3) 문장 11에서 temperature에 ○: 너무 빨리 바뀌는 것은 여름이 아니라 기온이다.");
B("3-2  뼈대 채우기 — (1) Mosquitoes  (2) Iceland  (3) temperature.  넣으면 Mosquitoes can’t survive in Iceland because the temperature changes too quickly for them.이 완성된다.");
B("3-3  정답 순서 — ⓒ Mosquitoes can’t survive → ⓐ in Iceland → ⓑ because the temperature → ⓓ changes too quickly for them.");
B("[채점 포인트]  주인공(Mosquitoes)이 맨 앞, 마침표가 붙은 덩어리(ⓓ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) dangerous  (2) cold  (3) temperature  (4) bites");
B("(1)은 문장 1의 dangerous, (2)는 문장 7의 cold, (3)은 문장 11의 temperature, (4)는 문장 13의 bites에서 가져온다. 요약문이 곧 이 글의 흐름이다: 소개(1) → 예외(2) → 까닭(3) → 제안(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 4 ②   문장 6 ①   문장 8 ③   문장 12 ②  (정답 선지는 무표시)");
B("문장 4 kill about 725,000 people per year   ① ✕ [반대] 살린다 — 정반대.   ② ○ take lives = 목숨을 앗아간다.   ③ ✕ [무관] 동물을 문다는 말은 지문에 없다.");
B("문장 6 can’t survive there   ① ○ are not able to live there = 그곳에서 살 수 없다.   ② ✕ [반대] 아주 잘 산다 — 정반대.   ③ ✕ [무관] 여름마다 찾아온다는 말은 지문에 없다.");
B("문장 8 can easily be found   ① ✕ [무관] 특별한 상자에 보관한다는 말은 지문에 없다.   ② ✕ [반대] 찾기가 거의 불가능하다 — 정반대.   ③ ○ are not hard to find = 찾기 어렵지 않다.");
B("문장 12 escape from mosquitoes   ① ✕ [반대] 모기와 함께 산다 — 정반대.   ② ○ get away from = ~에게서 벗어나다.   ③ ✕ [무관] 모기를 자세히 연구한다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. 지문을 읽을 때마다 '이 표현을 다른 말로 하면?'을 스스로 물어보자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 F · 3 T · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 3.   2 F — 문장 4: 725명이 아니라 약 725,000명이다.   3 T — 문장 5.   4 F — 문장 7: 너무 더운 게 아니라 너무 춥다(too cold).   5 T — 문장 8.   6 F — 문장 10: 여름이 아니라 겨울(winter)에 얼음 아래 숨는다.   7 T — 문장 11.   8 F — 문장 13: 많이 물리는 게 아니라 전혀 물리지 않는다.  거짓 문장은 모두 딱 한 요소만 비튼 것이다.", true);
Hs("R2   설명 순서   ·   ⓑ → ⓐ → ⓒ → ⓓ");
B("ⓑ 모기가 병을 옮겨 많은 사람을 죽인다(문장 3–4) → ⓐ 그런데 아이슬란드 사람들은 걱정하지 않는다(문장 5) → ⓒ 기온이 너무 빨리 바뀌어 숨을 수 없기 때문이다(문장 11) → ⓓ 그러니 여름에 아이슬란드에 가 보라(문장 12–13). 문제 제기 → 예외 → 까닭 → 제안, 설명문은 이 차례로 흐른다.", true);
Hs("R3   영영풀이   ·   1 ⓔ · 2 ⓑ · 3 ⓐ · 4 ⓓ · 5 ⓕ · 6 ⓒ");
B("dangerous = 다치게 하거나 죽일 수 있는 · insect = 다리가 여섯 개인 아주 작은 동물 · spread = 더 많은 곳이나 사람에게 퍼지다 · survive = 살아남다 · temperature = 얼마나 덥거나 추운지 · escape = 어떤 곳이나 대상에게서 벗어나다.", true);
Hs("R4   어법 기초   ·   (1) are  (2) worry  (3) be found  (4) enjoy");
B("(1) 주어 Mosquitoes는 복수 — are.   (2) don’t have to 뒤에는 동사원형 — worry.   (3) '발견되다'는 be+p.p, 조동사 can 뒤이므로 원형 be found. 2면 분석 Tip의 그 원칙이다.   (4) 조동사 can 뒤에는 동사원형 — enjoy.", true);
Hs("R5   빈칸 클로즈   ·   (1) mosquito (2) diseases (3) survive (4) cold (5) temperature (6) quickly (7) escape (8) bites");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: It’s the ___ ← 정체가 밝혀지는 문장, too ___ for mosquitoes ← 까닭, mosquito ___ ← 물린 자국. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 모기는 말라리아 같은 병을 옮길 수 있는 곤충이다.  — that 이하가 앞의 insects를 꾸민다는 것이 핵심이다.");
B("(2) 하지만 모기에게 아이슬란드의 기온은 너무 빨리 바뀌어서 추위를 피해 숨을 수가 없다.  — too ~ to …를 '너무 ~해서 …할 수 없다'로 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) They kill about 725,000 people per year.  (2) You can enjoy the beautiful nature and won’t get any mosquito bites.");
B("(1) 문장 4의 복원. ㄱ 첫 글자 대문자 They  ㄴ per year(해마다)가 맨 뒤에 온다.");
B("(2) 문장 13의 복원. ㄱ 첫 글자 대문자 You  ㄴ can enjoy와 won’t get이 and로 이어진다  ㄷ mosquito bites는 붙어 다니는 한 덩어리다. R4-(4)의 '조동사 뒤 동사원형'이 여기서 다시 나온다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("세상에서 가장 위험한 동물을 아는가?  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("바로 모기다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("모기는 말라리아 같은 병을 옮길 수 있는 곤충이다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것들은 한 해에 약 725,000명을 죽인다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 아이슬란드 사람들은 그것들을 걱정할 필요가 없다!  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("모기는 그곳에서 살아남을 수 없다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("과학자들은 이것이 아이슬란드가 모기에게 너무 춥기 때문이라고 생각한다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 모기는 그린란드나 노르웨이 같은 다른 추운 나라에서는 쉽게 발견된다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그 나라들과 아이슬란드의 차이는 무엇일까?  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("다른 나라에서는 모기가 겨울에 얼음 아래에 숨었다가 여름에 나온다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 모기에게 아이슬란드의 기온은 너무 빨리 바뀌어서 추위를 피해 숨을 수가 없다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("여름에 모기에게서 벗어나고 싶다면, 아이슬란드를 방문해 보는 것은 어떨까?  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("당신은 아름다운 자연을 즐길 수 있고 모기에 물리지도 않을 것이다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
