/* UNIT 07 — 나이가 들수록 좋아지는 이것 (Level 4)
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
  no: "07",
  title: "나이가 들수록 좋아지는 이것",
  level: "4",
  foot: "UNIT 07  나이가 들수록 좋아지는 이것",
  banner: ["07", "나이가 들수록 좋아지는 이것", "4"],
  timeline: ["청년기|능력이 자란다|배우고 익히며\\n기술이 빠르게 는다|leaf",
             "중년 이후|속도가 느려진다|기억과 반응이\\n조금씩 무뎌진다|drop_x",
             "노년기|감정이 익는다|덜 흔들리고\\n긍정에 집중한다|sun"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 12문장 ═══════════ */
const SENT = [
  "When we are young, our skills improve with age and experience.",
  "But as we get older, we may feel like we stop getting better.",
  "We might forget things more, react a little slower, and have less energy.",
  "However, there’s one important exception: older people are better at controlling their emotions.",
  "For the past 20 years, Susan Turk Charles, a psychologist, has been studying emotions in people of all ages.",
  "She has discovered that older people tend to have fewer but more satisfying social connections and experience higher emotional well-being.",
  "They also get less upset over negative experiences.",
  "Why is emotional control better in older people?",
  "As we get older, our brain makes us think more before we act, instead of reacting quickly.",
  "This helps us to stay calm.",
  "Also, older people usually focus on positive things.",
  "These findings might inspire people to pursue a more positive attitude toward getting older.",
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
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–3 [B]4 [C]5–7 [D]8–11 [E]12 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 4: "B", 5: "C", 8: "D", 12: "E" };
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
  6: [RM("She"), R(" has discovered that older people tend to have fewer but more satisfying social connections and experience higher emotional well-being.  ")],
  7: [RM("They"), R(" also get less upset over negative experiences.  ")],
  10: [RM("This"), R(" helps us to stay calm.  ")],
  12: [RM("These findings"), R(" might inspire people to pursue a more positive attitude toward getting older.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u07.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  10: [t("(A) ", { size: 19, bold: true }), t("This", { size: 19, bold: true, underline: {} }),
      t(" helps us to stay calm.  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① Getting Older: Better at Controlling Emotions", "② How to Save Your Energy as You Get Older",
 "③ Why Young People Learn New Skills Faster", "④ A Psychologist Who Studies Children’s Dreams",
 "⑤ The Best Foods for a Healthy Brain"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① When we are young, our skills improve with age and experience.",
 "② Susan Turk Charles has been studying emotions for the past 20 years.",
 "③ Older people tend to have more social connections than young people.",
 "④ Older people get less upset over negative experiences.",
 "⑤ Older people usually focus on positive things."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) This가 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① thinking more before we act",
 "② reacting to things very quickly",
 "③ forgetting things more often",
 "④ having less energy than before",
 "⑤ making new social connections"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("그들은 또한 부정적인 경험에 대해 덜 속상해한다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("over / They / get / experiences / also / negative / less / upset", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
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
    new Paragraph({ children: [t("문장 4", { size: 14, bold: true, color: AMB }), t("   전치사 뒤에는 동명사(-ing)", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("better ", { size: 18 }), t("at", { size: 18, bold: true, color: NAVY }), t(" controlling", { size: 18, bold: true, color: NAVY, underline: {} }), t(" their emotions", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("전치사 at 뒤에는 동사원형이 아니라 동명사(-ing)가 옵니다. '감정을 조절하는 것을 더 잘한다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 10", { size: 14, bold: true, color: AMB }), t("   help+목적어+to부정사", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("This ", { size: 18 }), t("helps", { size: 18, bold: true, color: NAVY }), t(" us ", { size: 18 }), t("to stay", { size: 18, bold: true, color: NAVY, underline: {} }), t(" calm", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("help+목적어+to+동사원형은 '~가 …하도록 돕다'라는 뜻입니다. '우리가 침착함을 유지하도록 돕는다'", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 4 구문", [t("She is good ", { size: 19 }), t("at", { size: 19, bold: true, color: NAVY }), t(" drawing", { size: 19, bold: true, color: NAVY, underline: {} }), t(" animals.", { size: 19 })]],
 ["문장 10 구문", [t("Music ", { size: 19 }), t("helps", { size: 19, bold: true, color: NAVY }), t(" me ", { size: 19 }), t("to relax", { size: 19, bold: true, color: NAVY, underline: {} }), t(" after school.", { size: 19 })]],
 ["둘 다!", [t("This app ", { size: 19 }), t("helps", { size: 19, bold: true, color: NAVY }), t(" us ", { size: 19 }), t("to focus", { size: 19, bold: true, color: NAVY, underline: {} }), t(" ", { size: 19 }), t("on", { size: 19, bold: true, color: NAVY }), t(" learning", { size: 19, bold: true, color: NAVY, underline: {} }), t(" English.", { size: 19 })]],
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
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 1을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1000, 640, 700, 900, 1400, 1300, 2990], [new TableRow({ children: [
    exSeg([t("When", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 1000),
    exSeg([t("we", { size: 18, bold: true, color: SGRN, underline: {} })], "S′ 주어", SGRN, 640),
    exSeg([t("are", { size: 18, bold: true, color: NAVY })], "V′ 본동사", NAVY, 700, "△"),
    exSeg([t("young,", { size: 18 })], "", FAINT, 900),
    exSeg([t("our skills", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1400),
    exSeg([t("improve", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 1300, "△"),
    exSeg([t("with age and experience", { size: 18, bold: true, color: MGRY, underline: {} })], "M 수식어(구)", MRED, 2990),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[5, "For the past 20 years, Susan Turk Charles, a psychologist, has been studying emotions in people of all ages."],
 [9, "As we get older, our brain makes us think more before we act, instead of reacting quickly."],
 [12, "These findings might inspire people to pursue a more positive attitude toward getting older."]].forEach(([n, c]) => {
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
["① 기억력을 지키는 방법", "② 나이가 들수록 좋아지는 감정 조절", "③ 심리학자가 되는 방법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 ○표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["older", "나이 든"], ["emotions", "감정"], ["energy", "에너지"], ["positive", "긍정적인"], ["brain", "뇌"], ["psychologist", "심리학자"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 나이 들수록 좋아지는 것  ③ 그들이 향하는 방향 — 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · they · this 같은 지시어는 앞에 나온 말을 대신합니다. 사람도, 사물도, 앞 문장 전체도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 ○표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2350, 6950];
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
    ["6", "She", [t("Susan Turk Charles (심리학자)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["7", "They", chips2("older people", "psychologists", 1900), false],
    ["10", "This", chips2("생각 후 행동", "빠른 반응", 1900), false],
    ["12", "These findings", chips2("연구로 밝혀진 것", "나이 드는 두려움", 2100), false],
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
    ["2", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" as we get older, we may feel like we stop getting better.", { size: 17 })], ["반전", "덧붙임"]],
    ["9", [t("As", { size: 17, bold: true, color: NAVY, underline: {} }), t(" we get older, our brain makes us think more before we act.", { size: 17 })], ["때", "반전"]],
    ["9", [t("Our brain makes us think more, ", { size: 17 }), t("instead of", { size: 17, bold: true, color: NAVY, underline: {} }), t(" reacting quickly.", { size: 17 })], ["대신", "덧붙임"]],
    ["11", [t("Also", { size: 17, bold: true, color: NAVY, underline: {} }), t(", older people usually focus on positive things.", { size: 17 })], ["덧붙임", "대신"]],
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
    chipCellG("마무리", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("반박", 1400),
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
  flowCell("A", "도입", "문장 1–3", false),
  arrowCell(),
  flowCell("B", null, "문장 4", true),
  arrowCell(),
  flowCell("C", "연구", "문장 5–7", false),
  arrowCell(),
  flowCell("D", "이유", "문장 8–11", false),
  arrowCell(),
  flowCell("E", null, "문장 12", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["① 연구 결과를 근거로 사실을 알려 주는 설명문",
 "② 물건을 팔기 위해 만든 광고",
 "③ 하루 일과를 적은 일기",
 "④ 안부를 전하는 편지",
 "⑤ 상상으로 지어낸 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

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
  matRow("1", "4", "이 글의 주인공은 누구인가요? (두 단어)", "older people", "문장 맨 앞 주어 자리", true),
  matRow("2", "4", "나이 든 사람들이 더 잘하는 것은?", ["controlling", "forgetting"], "better at 뒤 자리 (능력)", false),
  matRow("3", "11", "그들이 집중하는 것은 어떤 것인가요?", ["positive", "negative"], "focus on 뒤 자리 (방향)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("   are better at  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   their emotions and focus on  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("   things .", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("ⓐ are better at controlling     ⓑ older people     ⓒ their emotions     ⓓ and focus on positive things.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("calm        emotional        emotions        positive", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("As we get older, we may forget things more, but we become better at controlling our (1) ____________. Our brain makes us think before we act, so we stay (2) ____________. Older people also focus on (3) ____________ things and enjoy higher (4) ____________ well-being.", { size: 19 })], { line: 425, after: 0 })]));
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
  { sn: 3, main: "have less energy",
    opts: ["① feel more tired than before", "② feel full of power", "③ sleep for eight hours"] },
  { sn: 6, main: "fewer but more satisfying connections",
    opts: ["① many friends who make them tired", "② not many friends, but better ones", "③ friends who live far away"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 7, main: "get less upset over negative experiences",
    opts: ["① become angry more easily", "② are not so bothered by bad things", "③ never remember anything"] },
  { sn: 12, main: "pursue a more positive attitude",
    opts: ["① try to think more positively", "② give up hope about getting older", "③ move to a warmer country"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 나이 듦과 감정 (aging)", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("심리학에는 '노화의 역설(paradox of aging)'이라는 말이 있다. 몸과 기억력은 나이와 함께 조금씩 느려지지만, 감정을 다루는 힘은 오히려 좋아진다는 것이다. 연구자들은 남은 시간이 짧다고 느낄수록 사람은 넓은 관계보다 깊은 관계를, 새로운 정보보다 좋은 기분을 고른다고 설명한다. 그래서 나이 든 사람들은 친구 수는 줄어도 만족도는 높고, 나쁜 일에 덜 흔들린다. 나이 듦은 잃기만 하는 과정이 아니라, 감정이 익어 가는 과정이기도 하다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u07.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
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
    "When we are young, our skills improve with age and experience.",
    "Older people are better at controlling their emotions.",
    "Susan Turk Charles has been studying emotions for the past 50 years.",
    "Older people tend to have more social connections than young people.",
    "Older people get less upset over negative experiences.",
    "As we get older, our brain makes us act before we think.",
    "Older people usually focus on positive things.",
    "These findings might make people afraid of getting older.",
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
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "나이가 들면서 일어나는 일 ⓐ~ⓓ를 실제로 일어나는 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["ⓐ Our brain makes us think more before we act.",
      "ⓑ We get older year by year.",
      "ⓒ We stay calm and control our emotions better.",
      "ⓓ We pursue a more positive attitude toward getting older."]
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
    ["1  improve", "ⓐ unhappy or worried about something"],
    ["2  exception", "ⓑ quiet and relaxed, not excited"],
    ["3  emotion", "ⓒ to become better than before"],
    ["4  upset", "ⓓ the way you think or feel about something"],
    ["5  calm", "ⓔ a strong feeling such as joy or anger"],
    ["6  attitude", "ⓕ a thing that is not like the others"],
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
[["문장 1", [t("When we are young, our skills ", { size: 19 }), t("( improve  /  improves )", { size: 19, bold: true, color: NAVY }), t(" with age.", { size: 19 })], "주어 our skills는 복수 — 동사 형태는?"],
 ["문장 4", [t("Older people are better at ", { size: 19 }), t("( controlling  /  control )", { size: 19, bold: true, color: NAVY }), t(" their emotions.", { size: 19 })], "전치사 at 뒤에는 동명사(-ing)!"],
 ["문장 7", [t("They also ", { size: 19 }), t("( get  /  gets )", { size: 19, bold: true, color: NAVY }), t(" less upset over negative experiences.", { size: 19 })], "주어 They(복수)에 맞는 동사 형태는?"],
 ["문장 10", [t("This ", { size: 19 }), t("( helps  /  help )", { size: 19, bold: true, color: NAVY }), t(" us to stay calm.", { size: 19 })], "주어 This는 3인칭 단수 — -s를 잊지 마세요."],
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
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("calm  /  attitude  /  improve  /  emotions  /  upset  /  exception  /  positive  /  psychologist", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" When we are young, our skills", { size: 19 }), ...BL(1), t("with age and experience.  ", { size: 19 }),
  num(2), t(" But as we get older, we may feel like we stop getting better.  ", { size: 19 }),
  num(3), t(" We might forget things more, react a little slower, and have less energy.  ", { size: 19 }),
  num(4), t(" However, there’s one important", { size: 19 }), ...BL(2), t(": older people are better at controlling their", { size: 19 }), ...BL(3), t(".  ", { size: 19 }),
  num(5), t(" For the past 20 years, Susan Turk Charles, a", { size: 19 }), ...BL(4), t(", has been studying emotions in people of all ages.  ", { size: 19 }),
  num(6), t(" She has discovered that older people tend to have fewer but more satisfying social connections.  ", { size: 19 }),
  num(7), t(" They also get less", { size: 19 }), ...BL(5), t("over negative experiences.  ", { size: 19 }),
  num(8), t(" Why is emotional control better in older people?  ", { size: 19 }),
  num(9), t(" As we get older, our brain makes us think more before we act.  ", { size: 19 }),
  num(10), t(" This helps us to stay", { size: 19 }), ...BL(6), t(".  ", { size: 19 }),
  num(11), t(" Also, older people usually focus on", { size: 19 }), ...BL(7), t("things.  ", { size: 19 }),
  num(12), t(" These findings might inspire people to pursue a more positive", { size: 19 }), ...BL(8), t("toward getting older.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[4, "However, there’s one important exception: older people are better at controlling their emotions."],
 [10, "This helps us to stay calm."]].forEach(([n, s], i) => {
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
w7block("1", "이것은 우리가 침착함을 유지하도록 돕는다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 마침표에 주의할 것  (총 6단어)",
  "us / helps / stay / This / to / calm");
w7block("2", "또한, 나이 든 사람들은 보통 긍정적인 것에 집중한다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 8단어)",
  "on / older / Also / focus / people / positive / usually / things");

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

K.push(...tab("정답 및 해설", "UNIT 07  나이가 들수록 좋아지는 이것", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("①      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("③      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("①", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("They also get less upset over negative experiences.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("For the past 20 years(M)·Charles(S)·has been studying(△V)   ", { size: 17, bold: true }),
     t("문9 ", { size: 17, bold: true, color: NAVY2 }), t("As[네모]·we(S′)·get(△V′)·brain(S)·makes(△V)", { size: 17, bold: true })], { after: 22 }),
  p([t("문12 ", { size: 17, bold: true, color: NAVY2 }), t("findings(S)·might inspire(△V)·people·to pursue~(M)", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 그녀는 동물을 그리는 것을 잘한다  (2) 음악은 내가 방과 후에 긴장을 푸는 것을 돕는다  (3) 이 앱은 우리가 영어를 배우는 데 집중하도록 돕는다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 ②   1-2 older · emotions · positive        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 반전 · 때 · 대신 · 덧붙임   2-2 [B] 예외 · [E] 마무리   2-3 ①", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 ⓑ → ⓐ → ⓒ → ⓓ  ·  Older people are better at controlling their emotions and focus on positive things.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) emotions  (2) calm  (3) positive  (4) emotional        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 ①  문장 6 ②  문장 7 ②  문장 12 ①", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T · 2T · 3F · 4F · 5T · 6F · 7T · 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("ⓑ → ⓐ → ⓒ → ⓓ", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1ⓒ · 2ⓕ · 3ⓔ · 4ⓐ · 5ⓑ · 6ⓓ        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) improve  (2) controlling  (3) get  (4) helps", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) improve (2) exception (3) emotions (4) psychologist (5) upset (6) calm (7) positive (8) attitude", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) This helps us to stay calm.  (2) Also, older people usually focus on positive things.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 ①");
B("이 글은 나이가 들면 여러 능력이 떨어지지만(문장 1–3) 감정 조절만은 오히려 좋아진다(문장 4·11)는 예외를 다룬다. 소재(나이 듦)와 특징(감정 조절)을 함께 담은 ①이 제목으로 적절하다. ②·③는 지엽적 오답, ④·⑤는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 ③");
B("문장 6에서 관계가 '더 적지만 더 만족스럽다(fewer but more satisfying)'고 했으므로, 더 많다는 ③는 본문과 반대된다. ①은 문장 1, ②은 문장 5, ④은 문장 7, ⑤는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 ①");
B("(A) This는 바로 앞 문장 9의 내용, 곧 '행동하기 전에 더 생각하게 되는 것'을 가리킨다. 지시어 this는 단어 하나만이 아니라 앞 문장 전체를 받을 수도 있다.", true);
Hs("독해 04   배열 영작   ·   They also get less upset over negative experiences.");
B("문장 7을 그대로 복원하는 문제다. ① 첫 글자는 대문자 They.   ② also는 일반동사 get 앞.   ③ get less upset over ~ — '~에 대해 덜 속상해하다'.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 ②     1-2 older · emotions · positive     1-3 아래 참조");
B("1-1   정답 ②. 이 글은 나이가 들수록 감정 조절이 좋아진다는 사실을 다룬다. ① 기억력은 문장 3의 부분 소재일 뿐이고, ③ 심리학자가 되는 방법은 나오지 않는다.");
B("1-2   ○표 할 세 단어: older(힌트① 주인공) · emotions(힌트② 좋아지는 것) · positive(힌트③ 향하는 방향). 나머지 셋(energy · brain · psychologist)은 본문에 나오지만 주제문에는 들어가지 않는다 — 배경과 근거일 뿐이다.");
B("1-3   문장 7 — They는 older people에 ○ (문장 6의 나이 든 사람들).   문장 10 — This는 생각 후 행동에 ○ (문장 9의 내용 전체).   문장 12 — These findings는 연구로 밝혀진 것에 ○ (문장 6–11).");
B("[학습 포인트]   this·these는 앞 문장 전체를 통째로 받을 수 있다. 지시어를 만나면 '단어인가, 문장인가'를 먼저 묻자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 – 5", CHAR, "✓"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 반전 / 때 / 대신 / 덧붙임     2-2 [B] 예외 · [E] 마무리     2-3 ①");
B("2-1   문장 2 But — 젊을 때와 달라진다는 '반전'.   문장 9 As — 나이가 들어가는 '때'.   문장 9 instead of — 빨리 반응하는 '대신'에.   문장 11 Also — 앞의 이유에 하나를 더 '덧붙임'.");
B("2-2   [B] 예외(문장 4: 감정 조절만은 예외다), [E] 마무리(문장 12: 나이 듦을 긍정적으로 보자). 보기의 '반박'은 이 글에 없는 역할이다. [A] 도입 → [B] 예외 → [C] 연구 → [D] 이유 → [E] 마무리 — 설명문의 전형적인 흐름이다.");
B("2-3   정답 ①. 심리학자의 연구 결과를 근거로 사실을 알려 주는 설명문이다. ②은 가격·명령문이 없어 광고가 아니고, ③는 I·Today가 없어 일기가 아니며, ④은 Dear·안부가 없고, ⑤는 등장인물과 사건이 없다.");
B("[학습 포인트]   But·However가 나오면 그 뒤가 글쓴이가 진짜 하고 싶은 말이다. 문장 4의 However가 이 글 전체의 방향을 바꾼다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 controlling · positive     3-3 ⓑ → ⓐ → ⓒ → ⓓ");
B("3-1  재료 찾기 — (2) 문장 4에서 controlling에 ○: better at 뒤에는 동명사가 온다. forgetting은 문장 3의 '나빠지는 것'이라 반대다. (3) 문장 11에서 positive에 ○: 나이 든 사람들이 집중하는 방향이다. negative는 문장 7의 대상일 뿐이다.");
B("3-2  뼈대 채우기 — (1) older people  (2) controlling  (3) positive.  넣으면 Older people are better at controlling their emotions and focus on positive things.가 완성된다.");
B("3-3  정답 순서 — ⓑ older people → ⓐ are better at controlling → ⓒ their emotions → ⓓ and focus on positive things.");
B("[채점 포인트]  주인공(ⓑ)이 맨 앞, 마침표가 붙은 덩어리(ⓓ)가 맨 뒤 — 이 두 자리만 잡으면 나머지는 뜻으로 이어진다.", true);
Hs("STEP 4   요약문   ·   (1) emotions  (2) calm  (3) positive  (4) emotional");
B("(1)은 문장 4의 emotions, (2)는 문장 10의 calm, (3)은 문장 11의 positive, (4)는 문장 6의 emotional well-being에서 가져온다. 요약문이 곧 이 글의 흐름이다: 예외(1) → 이유(2) → 방향(3) → 결과(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 ①   문장 6 ②   문장 7 ②   문장 12 ①  (정답 선지는 무표시)");
B("문장 3 have less energy   ① ○ 전보다 더 피곤하다.   ② ✕ [반대] 힘이 넘친다 — 정반대.   ③ ✕ [무관] 여덟 시간 잔다는 말은 지문에 없다.");
B("문장 6 fewer but more satisfying connections   ① ✕ [반대] 친구가 많아 지치게 한다 — 방향이 반대.   ② ○ 친구는 많지 않지만 더 좋은 관계다.   ③ ✕ [무관] 멀리 사는 친구 이야기는 지문에 없다.");
B("문장 7 get less upset over negative experiences   ① ✕ [반대] 더 쉽게 화를 낸다 — 정반대.   ② ○ 나쁜 일에 그다지 흔들리지 않는다.   ③ ✕ [무관] 아무것도 기억하지 못한다는 말은 지문에 없다.");
B("문장 12 pursue a more positive attitude   ① ○ 더 긍정적으로 생각하려 애쓰다.   ② ✕ [반대] 희망을 포기한다 — 정반대.   ③ ✕ [무관] 따뜻한 나라로 이사한다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 반드시 바꿔서 묻는다. 지문을 읽을 때마다 '이 표현을 다른 말로 하면?'을 스스로 물어보자.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 – R7 · 전문 해석", CHAR, "✓"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T · 2 T · 3 F · 4 F · 5 T · 6 F · 7 T · 8 F");
B("1 T — 문장 1.   2 T — 문장 4.   3 F — 문장 5: 50년이 아니라 20년(the past 20 years)이다.   4 F — 문장 6: 더 많은 게 아니라 더 적은(fewer) 관계다.   5 T — 문장 7.   6 F — 문장 9: 생각 전에 행동하는 게 아니라 행동 전에 더 생각한다.   7 T — 문장 11.   8 F — 문장 12: 두렵게 하는 게 아니라 긍정적인 태도를 갖게 한다(inspire).  거짓 문장은 모두 딱 한 요소(50, more, act before we think, afraid)를 비튼 것이다.", true);
Hs("R2   사건 순서   ·   ⓑ → ⓐ → ⓒ → ⓓ");
B("ⓑ 나이가 든다(문장 9) → ⓐ 뇌가 행동 전에 더 생각하게 만든다(문장 9) → ⓒ 침착해지고 감정을 더 잘 조절한다(문장 4·10) → ⓓ 나이 듦에 더 긍정적인 태도를 갖는다(문장 12). 본문은 결과(문장 4)를 먼저 말하고 원인(문장 9)을 나중에 설명한다 — 서술 순서와 실제 순서가 다른 지점이다.", true);
Hs("R3   영영풀이   ·   1 ⓒ · 2 ⓕ · 3 ⓔ · 4 ⓐ · 5 ⓑ · 6 ⓓ");
B("improve = 전보다 더 나아지다 · exception = 다른 것들과 같지 않은 것 · emotion = 기쁨이나 분노 같은 강한 감정 · upset = 속상하거나 걱정스러운 · calm = 조용하고 편안한 · attitude = 무엇에 대해 생각하거나 느끼는 방식.", true);
Hs("R4   어법 기초   ·   (1) improve  (2) controlling  (3) get  (4) helps");
B("(1) 주어 our skills는 복수 — improve.   (2) 전치사 at 뒤에는 동명사 — controlling. 2면 구문 카드의 그 원칙이다.   (3) 주어 They는 복수 — get.   (4) 주어 This는 3인칭 단수 — helps.", true);
Hs("R5   빈칸 클로즈   ·   (1) improve (2) exception (3) emotions (4) psychologist (5) upset (6) calm (7) positive (8) attitude");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: skills ___ with age ← 향상되다, one important ___ ← 예외, stay ___ ← 침착한, a more positive ___ ← 태도. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 그러나 한 가지 중요한 예외가 있다: 나이 든 사람들은 자신의 감정을 조절하는 것을 더 잘한다.  — be better at -ing를 '~하는 것을 더 잘하다'로 옮긴다.");
B("(2) 이것은 우리가 침착함을 유지하도록 돕는다.  — help+목적어+to부정사를 '~가 …하도록 돕다'로 옮기는 것이 핵심이다.", true);
Hs("R7   조건 영작   ·   (1) This helps us to stay calm.  (2) Also, older people usually focus on positive things.");
B("(1) 문장 10의 복원. ㄱ 첫 글자 대문자 This  ㄴ 주어가 3인칭 단수이므로 helps  ㄷ helps us to stay — to를 빠뜨리지 않는다.");
B("(2) 문장 11의 복원. ㄱ 첫 글자 대문자 Also 뒤에 콤마  ㄴ usually는 일반동사 focus 앞  ㄷ focus on positive things로 문장이 끝난다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("우리가 어릴 때는, 우리의 능력이 나이와 경험에 따라 향상된다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 나이가 들면서, 우리는 더 나아지는 것이 멈춘 것처럼 느낄지도 모른다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("우리는 더 많이 잊고, 조금 더 느리게 반응하며, 기운도 더 적을 수 있다.  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그러나 한 가지 중요한 예외가 있다: 나이 든 사람들은 자신의 감정을 조절하는 것을 더 잘한다.  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("지난 20년 동안, 심리학자인 수전 터크 찰스는 모든 연령대 사람들의 감정을 연구해 왔다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그녀는 나이 든 사람들이 더 적지만 더 만족스러운 사회적 관계를 맺는 경향이 있고, 더 높은 정서적 행복을 경험한다는 것을 알아냈다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그들은 또한 부정적인 경험에 대해 덜 속상해한다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("왜 나이 든 사람들에게서 감정 조절이 더 잘될까?  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("나이가 들면서, 우리의 뇌는 빠르게 반응하는 대신 행동하기 전에 더 많이 생각하게 만든다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것은 우리가 침착함을 유지하도록 돕는다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("또한, 나이 든 사람들은 보통 긍정적인 것에 집중한다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이러한 발견들은 사람들이 나이 듦에 대해 더 긍정적인 태도를 추구하도록 영감을 줄지도 모른다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
