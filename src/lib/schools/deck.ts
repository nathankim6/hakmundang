import PptxGenJS from "pptxgenjs";
import { ORUN_LOGO_WHITE } from "@/assets/orunLogo";
import { ART_RATIO, DARK, LIGHT, artSvg, iconSvg, svgDataUrl, type ArtName, type IconName } from "@/assets/art";
import { TOON_PPT, crestSvg } from "@/assets/toon";
import type { SchoolRecord } from "@/types/school";
import { RESULT_BASIS_LABEL } from "@/data/results";
import { NEWS_KIND_LABEL, type SchoolNews } from "@/data/news";
import { ORUN_MESSAGES, ORUN_RESULTS, type ExamReport, type SourcedSchool } from "@/data/sourced";
import { COVER, DECK } from "@/lib/schools/copy";
import { profileText, repPoint } from "@/lib/schools/achievementText";
import { LETTERS, SUBJECTS3, fix, pct, profileOf, type AchievementProfile } from "@/lib/schools/achievement";
import { NEWS_KIND_ICON, NEWS_KIND_ORDER, tmiIcon } from "@/lib/schools/icons";
import { dropoutRate, headlinePath, pathBreakdown, seatsForGrade1, specialHighDetail } from "@/lib/schools/metrics";

/**
 * 설명회 PPT 생성.
 *
 * 옳은영어 에디토리얼 템플릿(orun-pptx 스킬)을 그대로 따른다.
 *  - 옐로우는 점·대형 숫자·다크 배경 위 액센트로만. 옐로우 면 금지.
 *  - 박스 대신 헤어라인. 표는 머리글 배경 없이 잉크 밑줄 + 행 헤어라인.
 *  - 영문 아이브로우(옐로우 점 + 자간 넓은 회색 대문자)와 푸터 ORUN ENGLISH.
 *  - 폰트 Noto Sans KR.
 *
 * 수정 가능해야 한다.
 *  - 글자는 전부 텍스트 상자, 선과 점은 도형. 그림 위에 글자를 굽지 않는다.
 *  - 삽화·아이콘은 SVG로 넣는다. 파워포인트에서 벡터로 열리고 '도형으로 변환'이 된다.
 *  - 문구는 copy.ts 에서만 온다.
 */

const INK = "1C1C1C";
const BODY = "3A3A3A";
const GREY = "8A8A8A";
const HAIR = "E4E2DD";
const HAIR_DARK = "3A3A3A";
const PAPER = "F7F6F2";
const YELLOW = "FFD400";
const YELLOW_S = "D9B300";
const BLUE = "1A7FBF";
const DARK_SUB = "B5B5B5";
const FONT = "Noto Sans KR";

const M = 0.7; // 여백
const W = 13.333;
const H = 7.5;

type Slide = ReturnType<PptxGenJS["addSlide"]>;
type TextOpts = PptxGenJS.TextPropsOptions;

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");

/** 텍스트 상자 기본값. 모든 글자는 이걸 거친다. */
const T = (o: TextOpts): TextOpts => ({ fontFace: FONT, isTextBox: true, margin: 0, ...o });

/**
 * 목록을 장당 max개 이하로 나누되, 마지막 장에 한 줄만 남는 일이 없게 균등하게 쪼갠다.
 * 7개를 6+1로 자르면 뒷장이 텅 비어 보인다. 4+3이 낫다.
 */
function balancedChunks<T>(list: T[], max: number): T[][] {
  if (list.length <= max) return [list];
  const pages = Math.ceil(list.length / max);
  const per = Math.ceil(list.length / pages);
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += per) out.push(list.slice(i, i + per));
  return out;
}

/* ── 공통 조각 ─────────────────────────── */

function hair(s: Slide, y: number, x = M, w = W - M * 2, color = HAIR) {
  s.addShape("line", { x, y, w, h: 0, line: { color, width: 0.75 } });
}

/** 삽화. 320×220 비율, 폭만 준다. */
function art(s: Slide, name: ArtName, o: { x: number; y: number; w: number; dark?: boolean }) {
  s.addImage({ data: svgDataUrl(artSvg(name, { palette: o.dark ? DARK : LIGHT })), x: o.x, y: o.y, w: o.w, h: o.w / ART_RATIO });
}

/** 아이콘. 기본 0.26인치. */
function icon(s: Slide, name: IconName, x: number, y: number, size = 0.26, dark = false) {
  s.addImage({ data: svgDataUrl(iconSvg(name, { palette: dark ? DARK : LIGHT })), x, y, w: size, h: size });
}

function eyebrow(s: Slide, text: string, y = 0.45, dark = false) {
  s.addShape("rect", { x: M, y: y + 0.045, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText(text.toUpperCase(), T({ x: M + 0.24, y, w: 8, h: 0.22, fontSize: 10, bold: true, color: dark ? YELLOW : GREY, charSpacing: 3 }));
}

function footer(s: Slide, page: number, dark = false) {
  const color = dark ? DARK_SUB : GREY;
  s.addText("ORUN ENGLISH", T({ x: M, y: H - 0.58, w: 3, h: 0.24, fontSize: 8, color, charSpacing: 3 }));
  s.addText(String(page).padStart(2, "0"), T({ x: W - M - 1, y: H - 0.58, w: 1, h: 0.24, align: "right", fontSize: 8, color, charSpacing: 3 }));
}

function title(s: Slide, text: string, sub?: string, dark = false) {
  s.addText(text, T({ x: M, y: 0.95, w: W - M * 2, h: 0.75, fontSize: 30, bold: true, color: dark ? "FFFFFF" : INK }));
  if (sub) s.addText(sub, T({ x: M, y: 1.72, w: W - M * 2 - 1, h: 0.5, fontSize: 12.5, color: dark ? DARK_SUB : GREY, lineSpacing: 18 }));
}

function foot(s: Slide, text: string, w = W - M * 2) {
  s.addText(text, T({ x: M, y: H - 1.0, w, h: 0.28, fontSize: 8.5, color: GREY }));
}

/** 소제목: 아이콘 + 굵은 13pt */
function subhead(s: Slide, ic: IconName, text: string, y: number, x = M, w = 5) {
  icon(s, ic, x, y + 0.02, 0.26);
  s.addText(text, T({ x: x + 0.36, y, w, h: 0.3, fontSize: 13, bold: true, color: INK }));
}

/* ── 표지·목차·섹션 ────────────────────── */

function coverSlide(pptx: PptxGenJS, records: SchoolRecord[], year: string) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  const onlyMid = records.every((r) => r.fact.level === "중");
  const c = onlyMid ? COVER.mid : COVER.high;

  s.addImage({ data: ORUN_LOGO_WHITE, x: M, y: 0.5, w: 1.5, h: 1.5 });
  art(s, "lighthouseTown", { x: W - M - 4.7, y: 1.4, w: 4.7, dark: true });

  eyebrow(s, DECK.cover.eyebrow, 2.38, true);
  s.addText(c.title.join("\n"), T({ x: M, y: 2.8, w: 7.2, h: 1.8, fontSize: 44, bold: true, color: "FFFFFF", lineSpacing: 54 }));
  s.addText(onlyMid ? DECK.cover.subMid(year) : DECK.cover.subHigh(year), T({ x: M, y: 4.75, w: 7.2, h: 0.35, fontSize: 12.5, color: DARK_SUB }));

  hair(s, 5.35, M, 2, HAIR_DARK);
  s.addText(records.map((r) => short(r.fact.name)).join(" · "), T({ x: M, y: 5.55, w: W - M * 2, h: 0.5, fontSize: 11, color: DARK_SUB, lineSpacing: 16 }));
  s.addText(DECK.cover.footer, T({ x: M, y: H - 0.58, w: 8, h: 0.24, fontSize: 8, color: GREY, charSpacing: 3 }));
  s.addNotes(DECK.cover.note(records.length));
}

function tocSlide(pptx: PptxGenJS, records: SchoolRecord[], page: number) {
  const s = pptx.addSlide();
  eyebrow(s, DECK.toc.en);
  title(s, DECK.toc.title, DECK.toc.count(records.length));
  art(s, "sideBySide", { x: W - M - 4.2, y: 2.3, w: 4.2 });

  let y = 2.5;
  records.slice(0, 9).forEach((r, i) => {
    hair(s, y - 0.12, M, 7.6);
    s.addText(String(i + 1).padStart(2, "0"), T({ x: M, y, w: 0.5, h: 0.3, fontSize: 11, bold: true, color: YELLOW_S, charSpacing: 1 }));
    logo(s, r, M + 0.48, y - 0.04, 0.36);
    s.addText(r.fact.name, T({ x: M + 0.95, y: y - 0.02, w: 3.4, h: 0.32, fontSize: 15, bold: true, color: INK }));
    const seats = r.fact.level === "고" && r.fact.g1Total ? seatsForGrade1(r.fact.g1Total) : null;
    s.addText(
      [r.fact.g1Total ? `1학년 ${r.fact.g1Total}명` : null, seats != null ? `1등급 ${seats}자리` : null].filter(Boolean).join(", "),
      T({ x: M + 4.4, y: y - 0.02, w: 3.2, h: 0.32, fontSize: 11.5, color: GREY }),
    );
    y += 0.46;
  });
  footer(s, page);
  s.addNotes(DECK.toc.note);
}

/** 레이아웃 3 — 150pt 옐로우 숫자 + 잉크 헤어라인 + 삽화 */
function sectionSlide(pptx: PptxGenJS, no: string, heading: string, summary: string, artName: ArtName) {
  const s = pptx.addSlide();
  s.addText(no, T({ x: M - 0.12, y: 1.35, w: 3, h: 1.9, fontSize: 150, bold: true, color: YELLOW, charSpacing: -8 }));
  s.addShape("line", { x: M, y: 3.5, w: 2, h: 0, line: { color: INK, width: 1.25 } });
  s.addText(heading, T({ x: M, y: 3.72, w: 8.2, h: 0.8, fontSize: 36, bold: true, color: INK }));
  s.addText(summary, T({ x: M, y: 4.62, w: 7.6, h: 1.1, fontSize: 12.5, color: GREY, lineSpacing: 20 }));
  art(s, artName, { x: W - M - 3.9, y: H - 3.5, w: 3.9 });
  s.addNotes(DECK.sectionNote(heading, summary));
}

/* ── 숫자 읽는 법 ─────────────────────── */

function numbersSlide(pptx: PptxGenJS, page: number) {
  const s = pptx.addSlide();
  eyebrow(s, DECK.numbers.en);
  title(s, DECK.numbers.title, DECK.numbers.sub);
  const textW = W - M * 2 - 4.0;
  let y = 2.45;
  ORUN_MESSAGES.slice(0, 4).forEach((m, i) => {
    s.addText(String(i + 1).padStart(2, "0"), T({ x: M, y, w: 0.5, h: 0.3, fontSize: 12, bold: true, color: YELLOW_S }));
    s.addText(m.text, T({ x: M + 0.6, y, w: textW - 0.6, h: 0.72, fontSize: 12.5, color: BODY, lineSpacing: 19, valign: "top" }));
    y += 0.9;
    hair(s, y - 0.12, M, textW);
  });
  art(s, "fraction", { x: W - M - 3.4, y: 2.5, w: 3.4 });
  footer(s, page);
  s.addNotes(DECK.numbers.note);
}

/** 2026 1학기 옳은영어 성적표 — 다크 + 포스터 */
function orunResultsSlide(pptx: PptxGenJS, page: number, poster?: string) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  eyebrow(s, DECK.orunResults.en, 0.46, true);
  title(s, DECK.orunResults.title, undefined, true);
  const cw = 3.5;
  ORUN_RESULTS.forEach((r, i) => {
    const x = M + (i % 2) * cw;
    const y = 2.1 + Math.floor(i / 2) * 1.85;
    icon(s, i % 2 === 0 ? "trophy" : "sparkle", x, y + 0.02, 0.26, true);
    s.addText(r.label, T({ x: x + 0.36, y, w: cw - 0.66, h: 0.3, fontSize: 11.5, color: DARK_SUB }));
    s.addText(r.value, T({ x, y: y + 0.32, w: cw - 0.3, h: 0.75, fontSize: 36, bold: true, color: YELLOW }));
    s.addText(`${r.basis} · ${r.term}`, T({ x, y: y + 1.08, w: cw - 0.3, h: 0.45, fontSize: 9.5, color: GREY, lineSpacing: 14 }));
    if (i % 2 === 1) s.addShape("line", { x: M + cw - 0.15, y, w: 0, h: 1.5, line: { color: HAIR_DARK, width: 0.75 } });
  });
  if (poster) {
    s.addImage({ data: poster, x: W - M - 3.7, y: 0.85, w: 3.7, h: 5.25 });
  } else {
    art(s, "podium", { x: W - M - 4.2, y: 1.9, w: 4.2, dark: true });
  }
  foot(s, DECK.orunResults.foot, 7.5);
  footer(s, page, true);
  s.addNotes(DECK.orunResults.note);
}

/* ── 한 표로 보는 학교 스펙 ───────────── */

const border = (color: string, pt: number) =>
  [{ type: "none" }, { type: "none" }, { type: "solid", color, pt }, { type: "none" }] as PptxGenJS.TableCellProps["border"];

/** 표는 한 장에 6행까지. 넘치면 나눠 담는다(템플릿 레이아웃 7). */
function compareSlides(pptx: PptxGenJS, records: SchoolRecord[], level: "고" | "중", page: number): number {
  const chunks = balancedChunks(records, 6);
  chunks.forEach((chunk, i) => compareSlide(pptx, chunk, level, page++, i + 1, chunks.length));
  return page;
}

function compareSlide(pptx: PptxGenJS, records: SchoolRecord[], level: "고" | "중", page: number, part = 1, parts = 1) {
  const s = pptx.addSlide();
  const C = DECK.compare;
  eyebrow(s, C.en);
  title(s, parts > 1 ? C.part(part, parts) : C.title, level === "고" ? C.subHigh : C.subMid);

  const head = [C.cols.school, C.cols.g1, C.cols.classes, C.cols.perClass, ...(level === "고" ? [C.cols.seats] : []), C.cols.moved(level), level === "고" ? C.cols.headHigh : C.cols.headMid];
  const rows: PptxGenJS.TableRow[] = [
    head.map((h, i) => ({
      text: h,
      options: { fontFace: FONT, fontSize: 10, color: GREY, charSpacing: 1, bold: false, align: (i === 0 ? "left" : "right") as PptxGenJS.HAlign, border: border(INK, 1.25) },
    })),
  ];
  records.forEach((r) => {
    const f = r.fact;
    const drop = dropoutRate(f);
    const hp = headlinePath(f);
    const cells = [
      short(f.name),
      f.g1Total != null ? String(f.g1Total) : "—",
      f.g1Classes != null ? String(f.g1Classes) : "—",
      f.g1PerClass != null ? f.g1PerClass.toFixed(1) : "—",
      ...(level === "고" ? [f.g1Total ? String(seatsForGrade1(f.g1Total)) : "—"] : []),
      drop != null ? `${drop.toFixed(1)}%` : "—",
      hp.value != null ? `${hp.value.toFixed(0)}%` : "—",
    ];
    rows.push(
      cells.map((c, i) => ({
        text: i === 0 ? `■ ${c}` : c,
        options: { fontFace: FONT, fontSize: 11.5, color: i === 0 ? INK : BODY, bold: i === 0, align: (i === 0 ? "left" : "right") as PptxGenJS.HAlign, border: border(HAIR, 0.75) },
      })),
    );
  });

  const colW = level === "고" ? [3.2, 1.3, 1.0, 1.2, 1.7, 1.6, 1.9] : [3.6, 1.4, 1.1, 1.3, 1.9, 2.6];
  // margin에 배열을 주면 pptxgenjs가 값을 인치로 써서 열이 통째로 밀려난다. 기본 여백을 쓴다.
  s.addTable(rows, { x: M, y: 2.45, w: W - M * 2, colW, rowH: 0.4, valign: "middle" });

  const noGrad = records.filter((r) => !r.fact.grad).map((r) => short(r.fact.name));
  foot(s, C.foot + (noGrad.length ? `. ${C.footNoGrad(noGrad.join(", "))}` : ""));
  footer(s, page);
  s.addNotes(C.note);
}

/* ── 1등급은 딱 몇 자리인가 ──────────── */

/** 통계 슬라이드는 한 장에 5개까지가 한계다(40pt 숫자 + 세로 헤어라인). */
function seatsSlides(pptx: PptxGenJS, records: SchoolRecord[], page: number): number {
  const list = records.filter((r) => r.fact.g1Total);
  if (!list.length) return page;
  const chunks = balancedChunks(list, 5);
  chunks.forEach((chunk, i) => seatsSlide(pptx, chunk, page++, i === chunks.length - 1));
  return page;
}

function seatsSlide(pptx: PptxGenJS, records: SchoolRecord[], page: number, withNote = true) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  const C = DECK.seats;
  eyebrow(s, C.en, 0.46, true);
  title(s, C.title, undefined, true);

  // 장이 나뉘어도 열 폭은 같아야 한다. 5개 기준으로 고정하고 왼쪽부터 채운다.
  const gap = (W - M * 2) / 5;
  records.forEach((r, i) => {
    const x = M + gap * i;
    if (i > 0) s.addShape("line", { x, y: 2.3, w: 0, h: 1.9, line: { color: HAIR_DARK, width: 0.75 } });
    icon(s, "seat", x + 0.18, 2.3, 0.3, true);
    s.addText(short(r.fact.name), T({ x: x + 0.18, y: 2.66, w: gap - 0.3, h: 0.3, fontSize: 12.5, color: DARK_SUB }));
    s.addText(String(seatsForGrade1(r.fact.g1Total!)), T({ x: x + 0.18, y: 2.98, w: gap - 0.3, h: 0.85, fontSize: 40, bold: true, color: YELLOW }));
    s.addText(C.of(r.fact.g1Total!), T({ x: x + 0.18, y: 3.84, w: gap - 0.3, h: 0.3, fontSize: 10.5, color: GREY }));
  });

  hair(s, 4.55, M, W - M * 2, HAIR_DARK);
  if (withNote) s.addText(C.explain, T({ x: M, y: 4.8, w: W - M * 2, h: 1.2, fontSize: 12.5, color: DARK_SUB, lineSpacing: 20 }));
  footer(s, page, true);
  s.addNotes(C.note);
}

/* ── 이 중학교 졸업생은 어디로 갔을까 ─── */

const pathColor = (k: string) => (k === "general" ? INK : k === "autonomous" ? BLUE : k === "special" ? YELLOW : k === "vocational" ? GREY : HAIR);

function nextSchoolSlide(pptx: PptxGenJS, record: SchoolRecord, page: number) {
  const s = pptx.addSlide();
  const f = record.fact;
  const slices = pathBreakdown(f);
  if (!slices) return;
  const C = DECK.paths;

  eyebrow(s, C.en);
  title(s, C.title(short(f.name)), C.sub(f.grad!, f.pathYear ?? ""));

  const barY = 2.6;
  const barW = W - M * 2;
  let x = M;
  slices.forEach((sl) => {
    const w = (sl.percent / 100) * barW;
    if (w > 0) {
      s.addShape("rect", { x, y: barY, w, h: 0.42, fill: { color: pathColor(sl.key) } });
      x += w;
    }
  });

  let ly = 3.3;
  slices
    .filter((sl) => sl.count > 0)
    .forEach((sl) => {
      hair(s, ly + 0.34, M, 7.4);
      s.addShape("rect", { x: M, y: ly + 0.07, w: 0.12, h: 0.12, fill: { color: pathColor(sl.key) } });
      s.addText(sl.label, T({ x: M + 0.26, y: ly, w: 2.2, h: 0.3, fontSize: 12.5, bold: true, color: INK }));
      s.addText(`${sl.count}명`, T({ x: M + 2.5, y: ly, w: 1.2, h: 0.3, align: "right", fontSize: 12.5, color: BODY }));
      s.addText(`${sl.percent.toFixed(1)}%`, T({ x: M + 3.8, y: ly, w: 1.2, h: 0.3, align: "right", fontSize: 12.5, color: GREY }));
      ly += 0.46;
    });

  art(s, "pathsMap", { x: W - M - 3.8, y: 3.15, w: 3.8 });
  const sp = specialHighDetail(f);
  if (sp) {
    s.addText(C.special(sp.items.map((i) => `${i.label} ${i.count}명`).join(", ")), T({ x: W - M - 3.8, y: 5.85, w: 3.8, h: 0.6, fontSize: 10.5, color: BODY, lineSpacing: 15, valign: "top" }));
  }
  footer(s, page);
  s.addNotes(C.note);
}

/* ── 학교 하나씩(관측층) ──────────────── */

function schoolSlides(pptx: PptxGenJS, record: SchoolRecord, startPage: number): number {
  const { fact: f, observation: o } = record;
  if (!o) return startPage;
  let page = startPage;
  const isHigh = f.level === "고";
  const C = DECK.school;

  // 개요 + 한 줄 소개
  {
    const s = pptx.addSlide();
    eyebrow(s, C.en.the);
    title(s, f.name, [f.district, f.foundation, f.kind, f.coed].filter(Boolean).join(" · "));
    logo(s, record, W - M - 1.15, 0.7, 1.15);

    const stats: [IconName, string, string][] = [
      ["family", "1학년", f.g1Total != null ? `${f.g1Total}명` : "—"],
      ["layers", "1학년 반", f.g1Classes != null ? `${f.g1Classes}반` : "—"],
      ["divide", "반당", f.g1PerClass != null ? `${f.g1PerClass.toFixed(1)}명` : "—"],
    ];
    if (isHigh && f.g1Total) stats.push(["seat", "1등급 자리", `${seatsForGrade1(f.g1Total)}명`]);

    const cw = (W - M * 2) / stats.length;
    stats.forEach(([ic, k, v], i) => {
      const x = M + cw * i;
      s.addShape("rect", { x, y: 2.4, w: cw - 0.15, h: 1.0, fill: { color: PAPER } });
      icon(s, ic, x + 0.2, 2.53, 0.22);
      s.addText(k, T({ x: x + 0.5, y: 2.52, w: cw - 0.8, h: 0.25, fontSize: 10.5, color: GREY }));
      s.addText(v, T({ x: x + 0.2, y: 2.82, w: cw - 0.5, h: 0.45, fontSize: 20, bold: true, color: INK }));
    });

    hair(s, 3.75);
    subhead(s, "school", C.character, 3.95);
    s.addText(o.character, T({ x: M, y: 4.35, w: W - M * 2, h: 1.6, fontSize: 12.5, color: BODY, lineSpacing: 20 }));
    footer(s, page++);
    s.addNotes(C.noteCharacter(f.name, o.character));
  }

  // 난이도 + 시험범위 + 커트라인/성취도
  {
    const s = pptx.addSlide();
    eyebrow(s, C.en.hard);
    title(s, C.subjects, o.difficulty.comment || undefined);

    const subs = ["국어", "영어", "수학", "사회", "과학"] as const;
    const cw = (W - M * 2) / subs.length;
    subs.forEach((sub, i) => {
      const x = M + cw * i;
      const lv = o.difficulty[sub];
      const c = lv === "최상" ? "A8432F" : lv === "상" ? BLUE : lv === "기초" ? GREY : BODY;
      s.addText(sub, T({ x, y: 2.6, w: cw - 0.2, h: 0.3, fontSize: 12, color: GREY }));
      s.addText(lv, T({ x, y: 2.92, w: cw - 0.2, h: 0.5, fontSize: 24, bold: true, color: c }));
      hair(s, 3.5, x, cw - 0.35);
    });

    let y = 3.85;
    subhead(s, "range", C.scope, y);
    y += 0.4;
    o.examScope.slice(0, 3).forEach((e) => {
      s.addText(e.term, T({ x: M, y, w: 1.6, h: 0.3, fontSize: 11.5, bold: true, color: INK }));
      s.addText(e.scope, T({ x: M + 1.7, y, w: W - M * 2 - 1.7, h: 0.42, fontSize: 11.5, color: BODY, lineSpacing: 16 }));
      y += 0.5;
      hair(s, y - 0.08);
    });

    if (isHigh && o.cutoff.grade1) {
      icon(s, "cut", M, y + 0.19, 0.24);
      s.addText(
        [
          { text: `${C.cutoff}  `, options: { bold: true, color: INK } },
          { text: `${o.cutoff.grade1}점`, options: { bold: true, color: YELLOW_S, fontSize: 16 } },
          { text: `   2등급 ${o.cutoff.grade2}점`, options: { color: GREY } },
        ],
        T({ x: M + 0.34, y: y + 0.15, w: W - M * 2 - 0.34, h: 0.4, fontSize: 13 }),
      );
    } else if (o.middle?.aRatio) {
      icon(s, "abc", M, y + 0.19, 0.24);
      s.addText(
        [
          { text: `${C.aRatio}  `, options: { bold: true, color: INK } },
          { text: o.middle.aRatio, options: { bold: true, color: YELLOW_S, fontSize: 16 } },
          o.middle.ratio ? { text: `   ${C.ratio(o.middle.ratio)}`, options: { color: GREY } } : { text: "" },
        ],
        T({ x: M + 0.34, y: y + 0.15, w: W - M * 2 - 0.34, h: 0.4, fontSize: 13 }),
      );
    }

    footer(s, page++);
    s.addNotes(C.noteHard(short(f.name), o.difficulty.영어, o.difficulty.comment ?? ""));
  }

  // 시험의 습관 + 시그니처
  {
    const s = pptx.addSlide();
    eyebrow(s, C.en.how);
    title(s, C.features);

    let y = 2.35;
    o.features.slice(0, 3).forEach((t, i) => {
      s.addText(String(i + 1).padStart(2, "0"), T({ x: M, y, w: 0.45, h: 0.3, fontSize: 11, bold: true, color: YELLOW_S }));
      s.addText(t, T({ x: M + 0.55, y, w: W - M * 2 - 0.55, h: 0.55, fontSize: 12.5, color: BODY, lineSpacing: 19 }));
      y += 0.68;
      hair(s, y - 0.1);
    });

    y += 0.2;
    subhead(s, "sparkle", C.signature, y);
    y += 0.42;
    o.signatures.slice(0, 3).forEach((q, i) => {
      s.addShape("rect", { x: M, y: y + 0.07, w: 0.12, h: 0.12, fill: { color: i % 2 ? BLUE : YELLOW } });
      s.addText(q.title, T({ x: M + 0.26, y, w: W - M * 2 - 0.26, h: 0.32, fontSize: 12, bold: true, color: INK }));
      y += 0.42;
    });

    footer(s, page++);
    s.addNotes(C.noteHow(short(f.name), o.features[0] ?? ""));
  }

  // 맞는 학생
  {
    const s = pptx.addSlide();
    eyebrow(s, C.en.fit);
    title(s, C.fit(short(f.name)));
    let y = 2.5;
    o.fit.slice(0, 5).forEach((t) => {
      icon(s, "check", M, y + 0.02, 0.26);
      s.addText(t, T({ x: M + 0.4, y, w: W - M * 2 - 0.4, h: 0.5, fontSize: 13, color: BODY, lineSpacing: 20 }));
      y += 0.62;
      hair(s, y - 0.12);
    });
    footer(s, page++);
    s.addNotes(C.noteFit);
  }

  return page;
}

/* ── 출처층(SOURCED) 슬라이드 ─────────── */

/* ── 국영수 성취도 3개년(학교알리미 공시) ─ */

const SEG = [INK, GREY, "C9C6BF", HAIR, "F1EFE9"];

/** 비교 표 — 한 장에 6개 학교 */
function achieveTableSlides(pptx: PptxGenJS, records: SchoolRecord[], level: "고" | "중", page: number): number {
  const list = records
    .filter((r) => r.fact.level === level && r.achievement)
    .map((r) => ({ r, p: profileOf(r.achievement!) }))
    .filter((x): x is { r: SchoolRecord; p: AchievementProfile } => Boolean(x.p));
  if (!list.length) return page;
  const C = DECK.achieve;
  const isHigh = level === "고";
  const chunks = balancedChunks(list, 6);
  chunks.forEach((chunk, ci) => {
    const s = pptx.addSlide();
    eyebrow(s, C.en);
    const grade = chunk[0].p.grade;
    const year = Math.max(...chunk.map((x) => x.p.latestYear));
    title(s, chunks.length > 1 ? C.part(ci + 1, chunks.length) : C.title, isHigh ? C.sub(grade, year) : C.subMid(grade, year));
    const head = isHigh ? C.cols : [C.cols[0], C.cols[1], C.cols[3], C.cols[4], C.cols[5], C.cols[6]];
    const rows: PptxGenJS.TableRow[] = [
      head.map((h, i) => ({ text: h, options: { fontFace: FONT, fontSize: 9.5, color: GREY, bold: false, align: (i === 0 ? "left" : "right") as PptxGenJS.HAlign, border: border(INK, 1.25), valign: "bottom" as PptxGenJS.VAlign } })),
    ];
    chunk.forEach(({ r, p }) => {
      const rep = repPoint(p);
      const aCell = (sub: "국어" | "영어" | "수학") => {
        const pt = p.latest[sub];
        if (!pt) return { text: "—", options: {} };
        if (!isHigh) return { text: pct(pt.dist.A), options: {} };
        return {
          text: [
            { text: pct(pt.dist.A), options: { bold: true, color: INK } },
            { text: `  ${pt.aCount}명`, options: { color: pt.gap > 0 ? "A8432F" : BLUE, fontSize: 9 } },
          ] as unknown as string,
          options: {},
        };
      };
      const verdict = SUBJECTS3.filter((sub) => p.latest[sub]).map((sub) => `${sub} ${p.latest[sub]!.gap > 0 ? "위" : "아래"}`).join(" · ");
      const cells: { text: unknown; options: Record<string, unknown> }[] = [
        { text: `■ ${short(r.fact.name)}`, options: { bold: true, color: INK, align: "left" } },
        { text: String(rep?.n ?? "—"), options: {} },
        ...(isHigh ? [{ text: String(rep?.seats ?? "—"), options: { bold: true, color: INK } }] : []),
        aCell("국어"),
        aCell("영어"),
        aCell("수학"),
        { text: SUBJECTS3.map((sub) => fix(p.latest[sub]?.avg, 0)).join(" / "), options: {} },
        ...(isHigh ? [{ text: verdict, options: { fontSize: 9, color: BODY } }] : []),
      ];
      rows.push(
        cells.map((c, i) => ({
          text: c.text as string,
          options: { fontFace: FONT, fontSize: 10.5, color: BODY, align: (i === 0 ? "left" : "right") as PptxGenJS.HAlign, border: border(HAIR, 0.75), valign: "middle" as PptxGenJS.VAlign, ...c.options },
        })),
      );
    });
    const colW = isHigh ? [1.9, 0.9, 1.0, 1.55, 1.55, 1.55, 1.5, 1.98] : [2.6, 1.3, 1.6, 1.6, 1.6, 3.23];
    s.addTable(rows, { x: M, y: 2.4, w: W - M * 2, colW, rowH: 0.42, valign: "middle" });
    foot(s, C.foot);
    footer(s, page++);
    s.addNotes(C.note);
  });
  return page;
}

/** 학교 한 장 — 과목별 3개년 막대(도형) + 이런 학생 */
function achieveSchoolSlide(pptx: PptxGenJS, r: SchoolRecord, p: AchievementProfile, page: number) {
  const s = pptx.addSlide();
  logo(s, r, W - M - 0.9, 0.55, 0.9);
  const C = DECK.achieve;
  const isHigh = r.fact.level === "고";
  const t = profileText(p, isHigh);
  eyebrow(s, C.en);
  title(s, C.schoolTitle(short(r.fact.name)), t.name);

  // 왼쪽: 막대
  const left = M;
  const barW = 5.2;
  let y = 2.35;
  SUBJECTS3.forEach((sub) => {
    const pts = p.series[sub];
    if (!pts.length) return;
    const last = pts[pts.length - 1];
    s.addText(`${sub}  ${last.subject}`, T({ x: left, y, w: 3.4, h: 0.26, fontSize: 11, bold: true, color: INK }));
    s.addText(`A ${pct(last.dist.A)}`, T({ x: left + barW + 0.6, y, w: 1.6, h: 0.26, align: "right", fontSize: 10, color: GREY }));
    y += 0.3;
    pts.forEach((pt) => {
      s.addText(String(pt.schoolYear), T({ x: left, y: y + 0.01, w: 0.55, h: 0.2, fontSize: 8.5, color: GREY }));
      let x = left + 0.6;
      LETTERS.forEach((L, i) => {
        const w = (barW * pt.dist[L]) / 100;
        if (w > 0.005) {
          s.addShape("rect", { x, y, w, h: 0.2, fill: { color: SEG[i] }, line: { color: "FFFFFF", width: 0.25 } });
          x += w;
        }
      });
      if (isHigh && pt.n > 0) {
        const tx = left + 0.6 + (barW * pt.seats) / pt.n;
        s.addShape("line", { x: tx, y: y - 0.04, w: 0, h: 0.28, line: { color: YELLOW, width: 2 } });
      }
      s.addText(`${fix(pt.avg, 0)}점 · ${pt.n}명`, T({ x: left + barW + 0.7, y: y + 0.01, w: 1.5, h: 0.2, align: "right", fontSize: 8.5, color: BODY }));
      y += 0.27;
    });
    y += 0.16;
  });
  // 범례
  let lx = left + 0.6;
  LETTERS.forEach((L, i) => {
    s.addShape("rect", { x: lx, y: y + 0.03, w: 0.14, h: 0.14, fill: { color: SEG[i] }, line: { color: HAIR, width: 0.25 } });
    s.addText(L, T({ x: lx + 0.18, y, w: 0.3, h: 0.2, fontSize: 8.5, color: GREY }));
    lx += 0.55;
  });
  if (isHigh) {
    s.addShape("line", { x: lx + 0.1, y: y - 0.02, w: 0, h: 0.24, line: { color: YELLOW, width: 2 } });
    s.addText(C.seatLine, T({ x: lx + 0.2, y, w: 1.4, h: 0.2, fontSize: 8.5, color: GREY }));
  }

  // 오른쪽: 요약 + 이런 학생 + 주의
  const rx = M + 7.9;
  const rw = W - M - rx;
  let ry = 2.35;
  s.addText(t.summary, T({ x: rx, y: ry, w: rw, h: 0.9, fontSize: 12, bold: true, color: INK, lineSpacing: 17, valign: "top" }));
  ry += 1.0;
  subhead(s, "family", C.fit, ry, rx, rw - 0.4);
  ry += 0.36;
  t.fit.slice(0, 3).forEach((f) => {
    s.addShape("rect", { x: rx, y: ry + 0.08, w: 0.1, h: 0.1, fill: { color: YELLOW } });
    s.addText(f, T({ x: rx + 0.22, y: ry, w: rw - 0.22, h: 0.42, fontSize: 10.5, color: BODY, lineSpacing: 14, valign: "top" }));
    ry += 0.46;
  });
  ry += 0.1;
  subhead(s, "alert", C.caution, ry, rx, rw - 0.4);
  ry += 0.36;
  t.caution.slice(0, 2).forEach((f) => {
    s.addShape("rect", { x: rx, y: ry + 0.08, w: 0.1, h: 0.1, fill: { color: HAIR } });
    s.addText(f, T({ x: rx + 0.22, y: ry, w: rw - 0.22, h: 0.42, fontSize: 10.5, color: GREY, lineSpacing: 14, valign: "top" }));
    ry += 0.46;
  });
  footer(s, page);
  s.addNotes(C.noteSchool(short(r.fact.name), t.summary));
}

function achieveSlides(pptx: PptxGenJS, records: SchoolRecord[], page: number): number {
  page = achieveTableSlides(pptx, records, "고", page);
  page = achieveTableSlides(pptx, records, "중", page);
  records.forEach((r) => {
    const p = r.achievement ? profileOf(r.achievement) : null;
    if (p) achieveSchoolSlide(pptx, r, p, page++);
  });
  return page;
}

/** 올해 시험지 한눈에 — 표 */
function exam2026TableSlides(pptx: PptxGenJS, records: SchoolRecord[], level: "고" | "중", page: number): number {
  const list = records.filter((r) => r.fact.level === level && r.sourced?.exams.length);
  if (!list.length) return page;
  const C = DECK.exam2026Table;
  const grade = level === "고" ? 1 : list.some((r) => r.sourced!.exams.some((e) => e.grade === 3)) ? 3 : 2;
  const chunks = balancedChunks(list, 5);
  chunks.forEach((chunk, ci) => {
    const s = pptx.addSlide();
    eyebrow(s, C.en);
    title(s, chunks.length > 1 ? C.part(ci + 1, chunks.length) : C.title, C.sub(level, grade));
    const head = ["학교", "중간고사", "기말고사", ...(level === "고" ? ["1등급 컷"] : []), "한 줄로"];
    const rows: PptxGenJS.TableRow[] = [
      head.map((h) => ({ text: h, options: { fontFace: FONT, fontSize: 9.5, color: GREY, bold: false, border: border(INK, 1.25), valign: "bottom" as PptxGenJS.VAlign } })),
    ];
    chunk.forEach((r) => {
      const sc = r.sourced!;
      const m = sc.exams.find((e) => e.term.endsWith("중간") && e.grade === grade);
      const f = sc.exams.find((e) => e.term.endsWith("기말") && e.grade === grade);
      const cut = f?.cut?.grade1 ?? m?.cut?.grade1 ?? "—";
      const cell = (e?: ExamReport) => (e ? `${e.format}\n${e.difficulty}` : "—");
      const cells = [`■ ${short(r.fact.name)}`, cell(m), cell(f), ...(level === "고" ? [cut] : []), sc.oneLiner ?? "—"];
      rows.push(
        cells.map((c, i) => ({
          text: c,
          options: { fontFace: FONT, fontSize: i === 0 ? 11 : 9, color: i === 0 ? INK : BODY, bold: i === 0 || (level === "고" && i === 3), border: border(HAIR, 0.75), valign: "top" as PptxGenJS.VAlign },
        })),
      );
    });
    const colW = level === "고" ? [1.5, 3.4, 3.4, 1.0, 2.63] : [1.6, 3.6, 3.6, 3.13];
    s.addTable(rows, { x: M, y: 2.35, w: W - M * 2, colW, valign: "top" });
    foot(s, C.foot);
    footer(s, page++);
    s.addNotes(C.note);
  });
  return page;
}

/** 학교별 — 올해 시험지 카드(중간·기말) */
function examTrendSlide(pptx: PptxGenJS, r: SchoolRecord, grade: number, exams: ExamReport[], page: number) {
  const s = pptx.addSlide();
  logo(s, r, W - M - 0.9, 0.55, 0.9);
  const f = r.fact;
  const C = DECK.examTrend;
  eyebrow(s, C.en);
  title(s, C.title(short(f.name), f.level, grade), r.sourced?.oneLiner);
  const cardW = exams.length > 1 ? (W - M * 2 - 0.2) / 2 : W - M * 2;
  exams.forEach((e, i) => {
    const x = M + i * (cardW + 0.2);
    const top = 2.35;
    const cardH = 4.45;
    s.addShape("rect", { x, y: top, w: cardW, h: cardH, fill: { color: PAPER } });
    let y = top + 0.18;
    const isMid = e.term.endsWith("중간");
    s.addText(e.term.toUpperCase(), T({ x: x + 0.22, y, w: 2.5, h: 0.22, fontSize: 9.5, bold: true, color: isMid ? BLUE : YELLOW_S, charSpacing: 2 }));
    s.addText(e.format, T({ x: x + 2.6, y, w: cardW - 2.8, h: 0.22, align: "right", fontSize: 9.5, color: GREY }));
    y += 0.34;
    if (e.cut?.grade1) {
      // "80점대 후반~90점대 초반 예상" 같은 긴 컷은 큰 숫자로 못 쓴다.
      const big = e.cut.grade1.length <= 8;
      s.addText(
        [
          { text: `${C.cut}  `, options: { fontSize: 10, color: GREY } },
          { text: e.cut.grade1, options: { fontSize: big ? 20 : 12.5, bold: true, color: INK } },
          ...(e.cut.grade2 ? [{ text: `    ${C.cut2(e.cut.grade2)}`, options: { fontSize: 10, color: GREY } }] : []),
          ...(e.cut.avg ? [{ text: `    ${C.avg(e.cut.avg)}`, options: { fontSize: 10, color: GREY } }] : []),
        ],
        T({ x: x + 0.22, y, w: cardW - 0.44, h: 0.4, valign: "bottom" }),
      );
      y += 0.48;
    }
    if (e.scope) {
      icon(s, "range", x + 0.22, y + 0.04, 0.2);
      s.addText(e.scope, T({ x: x + 0.5, y, w: cardW - 0.72, h: 0.3, fontSize: 9.5, color: BODY }));
      y += 0.32;
    }
    s.addText(e.difficulty, T({ x: x + 0.22, y, w: cardW - 0.44, h: 0.5, fontSize: 11, bold: true, color: INK, lineSpacing: 15, valign: "top" }));
    y += 0.56;
    hair(s, y, x + 0.22, cardW - 0.44);
    y += 0.08;
    const maxK = e.scope && e.cut?.grade1 ? 3 : 4;
    e.killers.slice(0, maxK).forEach((k) => {
      s.addShape("rect", { x: x + 0.22, y: y + 0.07, w: 0.08, h: 0.08, fill: { color: YELLOW } });
      s.addText(k, T({ x: x + 0.38, y, w: cardW - 0.6, h: 0.4, fontSize: 9.5, color: BODY, lineSpacing: 13, valign: "top" }));
      y += 0.42;
    });
    hair(s, y, x + 0.22, cardW - 0.44);
    y += 0.1;
    icon(s, "quote", x + 0.22, y + 0.02, 0.2);
    s.addText(`${e.verdict}${e.teacher ? ` (${e.teacher} T)` : ""}`, T({ x: x + 0.5, y, w: cardW - 0.72, h: 0.6, fontSize: 9.5, italic: true, color: BODY, lineSpacing: 13, valign: "top" }));
  });
  footer(s, page);
  s.addNotes(C.note(short(f.name), grade, exams.map((e) => `${e.term}: ${e.difficulty}`).join(" / ")));
}

/** 학교별 — 강사진이 짚은 포인트 + 이 학교 실적 */
function insightsSlide(pptx: PptxGenJS, r: SchoolRecord, sc: SourcedSchool, page: number) {
  const s = pptx.addSlide();
  logo(s, r, W - M - 0.9, 0.55, 0.9);
  const C = DECK.insights;
  eyebrow(s, C.en);
  title(s, C.title(short(r.fact.name)));
  let y = 2.3;
  const maxI = sc.results.length ? 4 : 5;
  sc.insights.slice(0, maxI).forEach((it, i) => {
    s.addText(String(i + 1).padStart(2, "0"), T({ x: M, y, w: 0.45, h: 0.3, fontSize: 11, bold: true, color: YELLOW_S }));
    s.addText(it.text, T({ x: M + 0.55, y, w: W - M * 2 - 0.55, h: 0.62, fontSize: 11.5, color: BODY, lineSpacing: 16, valign: "top" }));
    y += 0.7;
    hair(s, y - 0.1);
  });
  if (sc.results.length) {
    y = Math.max(y + 0.05, 4.9);
    const list = sc.results.slice(0, 4);
    const cw = (W - M * 2) / list.length;
    list.forEach((res, i) => {
      const x = M + cw * i;
      if (i > 0) s.addShape("line", { x, y: y + 0.05, w: 0, h: 0.95, line: { color: HAIR, width: 0.75 } });
      icon(s, "trophy", x + 0.15, y + 0.02, 0.22);
      s.addText(res.label, T({ x: x + 0.45, y, w: cw - 0.6, h: 0.26, fontSize: 9.5, color: GREY }));
      s.addText(res.value, T({ x: x + 0.15, y: y + 0.26, w: cw - 0.3, h: 0.45, fontSize: 22, bold: true, color: INK }));
      s.addText(`${res.basis} · ${res.term}`, T({ x: x + 0.15, y: y + 0.72, w: cw - 0.3, h: 0.32, fontSize: 8, color: GREY, lineSpacing: 11 }));
    });
  }
  footer(s, page);
  s.addNotes(`[발표 스크립트] ${sc.insights[0]?.text ?? ""}`);
}

/** 학교별 — 선배들의 TMI */
function tmiSlide(pptx: PptxGenJS, r: SchoolRecord, sc: SourcedSchool, page: number) {
  const s = pptx.addSlide();
  logo(s, r, W - M - 0.9, 0.55, 0.9);
  const C = DECK.tmi;
  eyebrow(s, C.en);
  title(s, C.title(short(r.fact.name)), C.sub);
  const items = sc.tmi.slice(0, 10);
  const perCol = Math.ceil(items.length / 2);
  const colW = (W - M * 2 - 0.4) / 2;
  items.forEach((t, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = M + col * (colW + 0.4);
    const y = 2.4 + row * 0.62;
    icon(s, tmiIcon(t), x, y + 0.02, 0.28);
    s.addText(t, T({ x: x + 0.42, y, w: colW - 0.42, h: 0.5, fontSize: 11.5, color: BODY, lineSpacing: 15, valign: "top" }));
    hair(s, y + 0.52, x, colW);
  });
  footer(s, page);
  s.addNotes(C.note);
}

/** 학교별 — 학교 밖에서 확인한 것 */
function newsSlide(pptx: PptxGenJS, r: SchoolRecord, n: SchoolNews, page: number) {
  const s = pptx.addSlide();
  logo(s, r, W - M - 0.9, 0.55, 0.9);
  const C = DECK.news;
  const clip = (t: string, max: number) => (t.length > max ? t.slice(0, max - 1) + "…" : t);
  // 한 줄 요약이 길면 두 줄까지만 보이고, 첫 행을 그만큼 아래서 시작한다.
  const sub = n.oneLiner ? clip(n.oneLiner, 150) : undefined;
  eyebrow(s, C.en);
  title(s, C.title(short(r.fact.name)), sub);
  let y = sub && sub.length > 70 ? 2.6 : 2.35;
  const labelW = 1.55;
  const textW = W - M * 2 - labelW;
  const bottom = H - 1.1;
  // 글 길이에 맞춰 행 높이를 잡는다. 한 줄에 한글 약 58자(10.5pt, 8.7in).
  const items = [...n.items].sort((a, b) => NEWS_KIND_ORDER.indexOf(a.kind) - NEWS_KIND_ORDER.indexOf(b.kind));
  for (const it of items.slice(0, 6)) {
    const summary = clip(it.summary, 210);
    const lines = 1 + Math.ceil(summary.length / 57);
    const rowH = 0.06 + lines * 0.2;
    if (y + rowH > bottom) break;
    icon(s, NEWS_KIND_ICON[it.kind], M, y + 0.02, 0.22);
    s.addText(NEWS_KIND_LABEL[it.kind].toUpperCase(), T({ x: M + 0.3, y: y + 0.03, w: labelW - 0.3, h: 0.22, fontSize: 8.5, bold: true, color: it.kind === "results" ? YELLOW_S : it.kind === "curriculum" ? BLUE : GREY, charSpacing: 1.5 }));
    s.addText(
      [
        { text: clip(it.title, 70), options: { bold: true, color: INK, fontSize: 11.5, breakLine: true } },
        { text: summary, options: { color: BODY, fontSize: 10.5 } },
      ],
      T({ x: M + labelW, y, w: textW, h: rowH, lineSpacing: 14, valign: "top" }),
    );
    y += rowH + 0.14;
    hair(s, y - 0.08);
  }
  footer(s, page);
  s.addNotes(C.note(n.items[0]?.title ?? ""));
}

/** 출처층 슬라이드 묶음 — 관측이 없는 학교도 만든다 */
function sourcedSlides(pptx: PptxGenJS, r: SchoolRecord, startPage: number): number {
  const sc = r.sourced;
  if (!sc) return startPage;
  let page = startPage;
  if (sc.news?.items.length) newsSlide(pptx, r, sc.news, page++);
  const grades = [...new Set(sc.exams.map((e) => e.grade))].sort();
  grades.forEach((g) => {
    const exams = sc.exams.filter((e) => e.grade === g);
    if (exams.length) examTrendSlide(pptx, r, g, exams, page++);
  });
  if (sc.insights.length || sc.results.length) insightsSlide(pptx, r, sc, page++);
  if (sc.tmi.length) tmiSlide(pptx, r, sc, page++);
  return page;
}

/* ── 옳은영어 성적표 · 마무리 ─────────── */

function resultsSlide(pptx: PptxGenJS, records: SchoolRecord[], page: number) {
  const all = records.flatMap((r) => r.results ?? []);
  if (!all.length) return page;
  const s = pptx.addSlide();
  s.background = { color: INK };
  const C = DECK.results;
  eyebrow(s, C.en, 0.46, true);
  title(s, C.title, undefined, true);

  const groups = (["enrolled", "schoolTop"] as const)
    .map((basis) => ({ basis, list: all.filter((r) => r.basis === basis) }))
    .filter((g) => g.list.length);

  let y = 2.2;
  groups.forEach((g) => {
    s.addText(RESULT_BASIS_LABEL[g.basis], T({ x: M, y, w: 10, h: 0.3, fontSize: 11, color: DARK_SUB, charSpacing: 1 }));
    y += 0.36;
    const cw = (W - M * 2) / Math.max(g.list.length, 1);
    g.list.forEach((r, i) => {
      const x = M + cw * i;
      if (i > 0) s.addShape("line", { x, y, w: 0, h: 1.1, line: { color: HAIR_DARK, width: 0.75 } });
      icon(s, "trophy", x + 0.18, y + 0.03, 0.24, true);
      s.addText(r.label, T({ x: x + 0.5, y, w: cw - 0.6, h: 0.3, fontSize: 12, color: "FFFFFF" }));
      s.addText(`${r.percent}%`, T({ x: x + 0.18, y: y + 0.32, w: cw - 0.3, h: 0.7, fontSize: 40, bold: true, color: YELLOW }));
    });
    y += 1.45;
  });

  foot(s, C.foot(all[0].term));
  footer(s, page, true);
  s.addNotes(C.note);
  return page + 1;
}

function closingSlide(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  const C = DECK.closing;
  art(s, "lighthouseArrow", { x: W - M - 5.4, y: 1.55, w: 5.4, dark: true });
  eyebrow(s, C.en, 2.38, true);
  s.addText(C.title.join("\n"), T({ x: M, y: 2.8, w: 6.6, h: 1.7, fontSize: 48, bold: true, color: "FFFFFF", lineSpacing: 58 }));
  s.addText(C.brand, T({ x: M, y: 4.9, w: 6.6, h: 0.3, fontSize: 12, color: DARK_SUB }));
  s.addText(C.tagline, T({ x: M, y: H - 0.9, w: W - M * 2, h: 0.3, fontSize: 9, color: DARK_SUB, charSpacing: 2 }));
  s.addNotes(C.note);
}

/* ── 진입점 ────────────────────────────── */

export interface DeckAssets {
  /** 실적 포스터 data URL — 브라우저에서는 /orun/*.jpg 를 fetch 해 넣는다 */
  posters?: string[];
  /** 학교 로고 data URL(코드별). 없으면 만화풍 문양을 그린다 */
  logos?: Record<string, string>;
}

let LOGOS: Record<string, string> = {};
function logoData(r: SchoolRecord): string {
  return LOGOS[r.fact.code] ?? svgDataUrl(crestSvg(r.fact.name, { palette: TOON_PPT }));
}
/** 로고 배지: 흰 원 + 로고 */
function logo(s: Slide, r: SchoolRecord, x: number, y: number, size: number) {
  s.addShape("ellipse", { x, y, w: size, h: size, fill: { color: "FFFFFF" }, line: { color: HAIR, width: 0.75 } });
  const pad = size * 0.14;
  s.addImage({ data: logoData(r), x: x + pad, y: y + pad, w: size - pad * 2, h: size - pad * 2 });
}

export async function buildDeck(records: SchoolRecord[], year = "2027학년도", assets: DeckAssets = {}) {
  LOGOS = assets.logos ?? {};
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = DECK.author;
  pptx.title = DECK.title(year);

  const highs = records.filter((r) => r.fact.level === "고");
  const mids = records.filter((r) => r.fact.level === "중");
  const detailed = records.filter((r) => r.observation || r.sourced);
  const S = DECK.sections;

  coverSlide(pptx, records, year);
  let page = 2;
  tocSlide(pptx, records, page++);

  // 섹션 번호는 실제로 만들어진 섹션에만 붙는다.
  let sec = 0;
  const nextNo = () => String(++sec).padStart(2, "0");

  sectionSlide(pptx, nextNo(), S.numbers.title, S.numbers.summary, "iceberg");
  page++;
  numbersSlide(pptx, page++);
  orunResultsSlide(pptx, page++, assets.posters?.[0]);

  sectionSlide(pptx, nextNo(), S.compare.title, S.compare.summary, "sideBySide");
  page++;
  if (highs.length) page = compareSlides(pptx, highs, "고", page);
  if (mids.length) page = compareSlides(pptx, mids, "중", page);

  if (records.some((r) => r.achievement && profileOf(r.achievement))) {
    sectionSlide(pptx, nextNo(), DECK.achieve.sectionTitle, DECK.achieve.sectionSummary, "fraction");
    page++;
    page = achieveSlides(pptx, records, page);
  }

  if (records.some((r) => r.sourced?.exams.length)) {
    sectionSlide(pptx, nextNo(), S.exam2026.title, S.exam2026.summary, "examPaper");
    page++;
    page = exam2026TableSlides(pptx, records, "고", page);
    page = exam2026TableSlides(pptx, records, "중", page);
  }

  if (highs.length) {
    sectionSlide(pptx, nextNo(), S.seats.title, S.seats.summary, "seats");
    page++;
    page = seatsSlides(pptx, highs, page);
  }

  const withPath = mids.filter((r) => r.fact.grad);
  if (withPath.length) {
    sectionSlide(pptx, nextNo(), S.paths.title, S.paths.summary, "pathsMap");
    page++;
    withPath.forEach((r) => nextSchoolSlide(pptx, r, page++));
  }

  if (detailed.length) {
    const seen = detailed.filter((r) => r.observation || r.sourced?.exams.length).length;
    const summary = seen
      ? `${detailed.length}곳을 한 학교씩 들여다봐요. 그중 ${seen}곳은 시험지까지 펴 봤습니다.`
      : `${detailed.length}곳을 한 학교씩 들여다봐요. 분위기, 시험, 소식까지 한 페이지에 모았습니다.`;
    sectionSlide(pptx, nextNo(), S.school.title, summary, "zoom");
    page++;
    detailed.forEach((r) => {
      page = schoolSlides(pptx, r, page);
      page = sourcedSlides(pptx, r, page);
    });
  }

  page = resultsSlide(pptx, records, page);
  closingSlide(pptx);

  const stamp = new Date().toISOString().slice(0, 10);
  await pptx.writeFile({ fileName: DECK.fileName(stamp) });
}
