import PptxGenJS from "pptxgenjs";
import {
  ORUN_LIGHTHOUSE,
  ORUN_LIGHTHOUSE_WHITE,
  ORUN_LOGO_WHITE,
} from "@/assets/orunLogo";
import type { SchoolRecord } from "@/types/school";
import { RESULT_BASIS_LABEL } from "@/data/results";
import { NEWS_KIND_LABEL, type SchoolNews } from "@/data/news";
import {
  ORUN_MESSAGES,
  ORUN_RESULTS,
  type ExamReport,
  type SourcedSchool,
} from "@/data/sourced";
import {
  dropoutRate,
  headlinePath,
  pathBreakdown,
  seatsForGrade1,
  specialHighDetail,
} from "@/lib/schools/metrics";

/**
 * 설명회 PPT 생성.
 *
 * 옳은영어 v2 에디토리얼 템플릿(orun-pptx 스킬)을 그대로 따른다.
 *  - 옐로우는 점·대형 숫자·다크 배경 위 액센트로만. 옐로우 면 금지.
 *  - 박스 대신 헤어라인. 표는 머리글 배경 없이 잉크 밑줄 + 행 헤어라인.
 *  - 영문 아이브로우(옐로우 점 + 자간 넓은 회색 대문자)와 푸터 ORUN ENGLISH.
 *  - 폰트 Noto Sans KR.
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

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");

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

function eyebrow(s: Slide, text: string, y = 0.45) {
  s.addShape("rect", { x: M, y: y + 0.045, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText(text.toUpperCase(), {
    x: M + 0.24,
    y,
    w: 8,
    h: 0.22,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: GREY,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
}

function footer(s: Slide, page: number, dark = false) {
  s.addText("ORUN ENGLISH", {
    x: M,
    y: H - 0.58,
    w: 3,
    h: 0.24,
    fontFace: FONT,
    fontSize: 8,
    color: dark ? DARK_SUB : GREY,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
  s.addText(String(page).padStart(2, "0"), {
    x: W - M - 1,
    y: H - 0.58,
    w: 1,
    h: 0.24,
    align: "right",
    fontFace: FONT,
    fontSize: 8,
    color: dark ? DARK_SUB : GREY,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
}

function title(s: Slide, text: string, sub?: string) {
  s.addText(text, {
    x: M,
    y: 0.95,
    w: W - M * 2,
    h: 0.75,
    fontFace: FONT,
    fontSize: 30,
    bold: true,
    color: INK,
    isTextBox: true,
    margin: 0,
  });
  if (sub) {
    s.addText(sub, {
      x: M,
      y: 1.72,
      w: W - M * 2 - 1,
      h: 0.5,
      fontFace: FONT,
      fontSize: 12.5,
      color: GREY,
      lineSpacing: 18,
      isTextBox: true,
      margin: 0,
    });
  }
}

/* ── 슬라이드들 ────────────────────────── */

/** 레이아웃 3 — 150pt 옐로우 숫자 + 잉크 헤어라인 + 소형 등대 */
function sectionSlide(pptx: PptxGenJS, no: string, heading: string, summary: string) {
  const s = pptx.addSlide();
  s.addText(no, {
    x: M - 0.12,
    y: 1.35,
    w: 3,
    h: 1.9,
    fontFace: FONT,
    fontSize: 150,
    bold: true,
    color: YELLOW,
    charSpacing: -8,
    isTextBox: true,
    margin: 0,
  });
  s.addShape("line", { x: M, y: 3.5, w: 2, h: 0, line: { color: INK, width: 1.25 } });
  s.addText(heading, {
    x: M,
    y: 3.72,
    w: 8.2,
    h: 0.8,
    fontFace: FONT,
    fontSize: 36,
    bold: true,
    color: INK,
    isTextBox: true,
    margin: 0,
  });
  s.addText(summary, {
    x: M,
    y: 4.62,
    w: 7.6,
    h: 1.1,
    fontFace: FONT,
    fontSize: 12.5,
    color: GREY,
    lineSpacing: 20,
    isTextBox: true,
    margin: 0,
  });
  s.addImage({ data: ORUN_LIGHTHOUSE, x: W - M - 2.5, y: H - 2.9, w: 2.5, h: 2.02 });
  s.addNotes(`[템플릿 사용법] 섹션 표지. 큰 숫자는 순번입니다.\n\n[발표 스크립트] ${heading}. ${summary}`);
}

function coverSlide(pptx: PptxGenJS, records: SchoolRecord[], year: string) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  const onlyMid = records.every((r) => r.fact.level === "중");

  // 다크 배경이므로 흰선 버전. 등대는 우측으로 흘려보낸다(블리드).
  s.addImage({ data: ORUN_LOGO_WHITE, x: M, y: 0.5, w: 1.5, h: 1.5 });
  s.addImage({
    data: ORUN_LIGHTHOUSE_WHITE,
    x: W - 4.6,
    y: 1.15,
    w: 5.2,
    h: 4.2,
    transparency: 86,
  });

  s.addShape("rect", { x: M, y: 2.42, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText("ORUN ENGLISH · 학교 분석지", {
    x: M + 0.24,
    y: 2.38,
    w: 8,
    h: 0.22,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: YELLOW,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });

  s.addText(onlyMid ? "중학교 3년이\n고교 선택을 만듭니다" : "고교 선택이\n입시의 시작입니다", {
    x: M,
    y: 2.8,
    w: 9,
    h: 1.8,
    fontFace: FONT,
    fontSize: 48,
    bold: true,
    color: "FFFFFF",
    lineSpacing: 58,
    isTextBox: true,
    margin: 0,
  });

  s.addText(
    onlyMid
      ? `${year} 예비중1을 위한 학교별 분석`
      : `${year} 예비고1을 위한 학교별 내신 분석`,
    {
      x: M,
      y: 4.75,
      w: 9,
      h: 0.35,
      fontFace: FONT,
      fontSize: 12.5,
      color: DARK_SUB,
      isTextBox: true,
      margin: 0,
    },
  );

  hair(s, 5.35, M, 2, HAIR_DARK);
  s.addText(records.map((r) => short(r.fact.name)).join(" · "), {
    x: M,
    y: 5.55,
    w: W - M * 2,
    h: 0.5,
    fontFace: FONT,
    fontSize: 11,
    color: DARK_SUB,
    lineSpacing: 16,
    isTextBox: true,
    margin: 0,
  });

  s.addText("옳은영어 ORUN ACADEMY · 정확한 분석, 옳은 방향", {
    x: M,
    y: H - 0.58,
    w: 8,
    h: 0.24,
    fontFace: FONT,
    fontSize: 8,
    color: GREY,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
  s.addNotes(
    "[템플릿 사용법] 표지. 학교 목록은 담은 순서 그대로 들어갑니다.\n\n" +
      "[발표 스크립트] 오늘은 " +
      records.length +
      "개 학교를 함께 보겠습니다. 공시 자료가 말해 주는 것과, 저희가 직접 본 것을 나눠서 말씀드리겠습니다.",
  );
}

function tocSlide(pptx: PptxGenJS, records: SchoolRecord[], page: number) {
  const s = pptx.addSlide();
  eyebrow(s, "agenda");
  title(s, "오늘 다룰 학교", `${records.length}곳`);
  s.addImage({ data: ORUN_LIGHTHOUSE, x: W - M - 3.9, y: 2.15, w: 3.9, h: 3.15 });

  let y = 2.5;
  records.slice(0, 9).forEach((r, i) => {
    hair(s, y - 0.12, M, 7.6);
    s.addText(String(i + 1).padStart(2, "0"), {
      x: M,
      y,
      w: 0.5,
      h: 0.3,
      fontFace: FONT,
      fontSize: 11,
      bold: true,
      color: YELLOW_S,
      charSpacing: 1,
      isTextBox: true,
      margin: 0,
    });
    s.addText(r.fact.name, {
      x: M + 0.6,
      y: y - 0.02,
      w: 3.6,
      h: 0.32,
      fontFace: FONT,
      fontSize: 15,
      bold: true,
      color: INK,
      isTextBox: true,
      margin: 0,
    });
    const seats = r.fact.level === "고" && r.fact.g1Total ? seatsForGrade1(r.fact.g1Total) : null;
    s.addText(
      [
        r.fact.g1Total ? `1학년 ${r.fact.g1Total}명` : null,
        seats != null ? `1등급 ${seats}자리` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      {
        x: M + 4.3,
        y: y - 0.02,
        w: 3.3,
        h: 0.32,
        fontFace: FONT,
        fontSize: 11.5,
        color: GREY,
        isTextBox: true,
        margin: 0,
      },
    );
    y += 0.46;
  });
  footer(s, page);
  s.addNotes("[발표 스크립트] 순서대로 한 학교씩 보겠습니다.");
}

/** 표는 한 장에 6행까지. 넘치면 나눠 담는다(템플릿 레이아웃 7). */
function compareSlides(
  pptx: PptxGenJS,
  records: SchoolRecord[],
  level: "고" | "중",
  page: number,
): number {
  const chunks = balancedChunks(records, 6);
  chunks.forEach((chunk, i) => {
    compareSlide(pptx, chunk, level, page++, i + 1, chunks.length);
  });
  return page;
}

function compareSlide(
  pptx: PptxGenJS,
  records: SchoolRecord[],
  level: "고" | "중",
  page: number,
  part = 1,
  parts = 1,
) {
  const s = pptx.addSlide();
  eyebrow(s, "side by side");
  title(
    s,
    parts > 1 ? `나란히 놓고 보기 (${part}/${parts})` : "나란히 놓고 보기",
    level === "고"
      ? "전부 공시 자료 그대로이고, 저희가 손대지 않았습니다"
      : "중학교는 석차등급이 없어 1등급 자리가 없습니다",
  );

  const headLabel = level === "고" ? "4년제" : "특목·자율고";
  const head = ["학교", "1학년", "반", "반당", ...(level === "고" ? ["1등급 자리"] : []), `${level}1 전출`, headLabel];

  const rows: PptxGenJS.TableRow[] = [
    head.map((h, i) => ({
      text: h,
      options: {
        fontFace: FONT,
        fontSize: 10,
        color: GREY,
        charSpacing: 1,
        bold: false,
        align: (i === 0 ? "left" : "right") as PptxGenJS.HAlign,
        border: [
          { type: "none" },
          { type: "none" },
          { type: "solid", color: INK, pt: 1.25 },
          { type: "none" },
        ] as PptxGenJS.TableCellProps["border"],
      },
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
        options: {
          fontFace: FONT,
          fontSize: 11.5,
          color: i === 0 ? INK : BODY,
          bold: i === 0,
          align: (i === 0 ? "left" : "right") as PptxGenJS.HAlign,
          border: [
            { type: "none" },
            { type: "none" },
            { type: "solid", color: HAIR, pt: 0.75 },
            { type: "none" },
          ] as PptxGenJS.TableCellProps["border"],
        },
      })),
    );
  });

  const colW = level === "고" ? [3.2, 1.3, 1.0, 1.2, 1.7, 1.6, 1.9] : [3.6, 1.4, 1.1, 1.3, 1.9, 2.6];
  s.addTable(rows, {
    x: M,
    y: 2.45,
    w: W - M * 2,
    colW,
    rowH: 0.4,
    valign: "middle",
    // margin에 배열을 주면 pptxgenjs가 값을 인치로 써서(6 -> marR 5486400 EMU)
    // 열이 통째로 밀려난다. 기본 여백을 쓴다.
  });

  const noGrad = records.filter((r) => !r.fact.grad).map((r) => short(r.fact.name));
  s.addText(
    "1등급 자리는 1학년 인원의 상위 10%이고 소수점은 버립니다 · 진학 수치는 작년 졸업생 기준" +
      (noGrad.length
        ? ` · ${noGrad.join("·")}는 아직 졸업생이 나오지 않아 진학·전출 자료가 없습니다`
        : ""),
    {
      x: M,
      y: H - 1.05,
      w: W - M * 2,
      h: 0.3,
      fontFace: FONT,
      fontSize: 9,
      color: GREY,
      isTextBox: true,
      margin: 0,
    },
  );
  footer(s, page);
  s.addNotes(
    "[발표 스크립트] 먼저 숫자만 나란히 놓고 보겠습니다. 이건 전부 학교알리미 공시 그대로입니다.",
  );
}

/** 통계 슬라이드는 한 장에 5개까지가 한계다(40pt 숫자 + 세로 헤어라인). */
function seatsSlides(pptx: PptxGenJS, records: SchoolRecord[], page: number): number {
  const list = records.filter((r) => r.fact.g1Total);
  if (!list.length) return page;
  const chunks = balancedChunks(list, 5);
  chunks.forEach((chunk, i) => {
    seatsSlide(pptx, chunk, page++, i === chunks.length - 1);
  });
  return page;
}

function seatsSlide(
  pptx: PptxGenJS,
  records: SchoolRecord[],
  page: number,
  withNote = true,
) {
  const s = pptx.addSlide();
  s.background = { color: INK };

  s.addShape("rect", { x: M, y: 0.5, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText("HOW MANY SEATS", {
    x: M + 0.24,
    y: 0.46,
    w: 8,
    h: 0.22,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: YELLOW,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
  s.addText("1등급, 몇 자리나 있을까", {
    x: M,
    y: 0.95,
    w: 10,
    h: 0.7,
    fontFace: FONT,
    fontSize: 30,
    bold: true,
    color: "FFFFFF",
    isTextBox: true,
    margin: 0,
  });

  const show = records;
  // 장이 나뉘어도 열 폭은 같아야 한다. 5개 기준으로 고정하고 왼쪽부터 채운다.
  const gap = (W - M * 2) / 5;
  show.forEach((r, i) => {
    const x = M + gap * i;
    if (i > 0) {
      s.addShape("line", {
        x,
        y: 2.35,
        w: 0,
        h: 1.6,
        line: { color: HAIR_DARK, width: 0.75 },
      });
    }
    s.addText(short(r.fact.name), {
      x: x + 0.18,
      y: 2.3,
      w: gap - 0.3,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12.5,
      color: DARK_SUB,
      isTextBox: true,
      margin: 0,
    });
    s.addText(String(seatsForGrade1(r.fact.g1Total!)), {
      x: x + 0.18,
      y: 2.65,
      w: gap - 0.3,
      h: 0.85,
      fontFace: FONT,
      fontSize: 40,
      bold: true,
      color: YELLOW,
      isTextBox: true,
      margin: 0,
    });
    s.addText(`1학년 ${r.fact.g1Total}명 중`, {
      x: x + 0.18,
      y: 3.5,
      w: gap - 0.3,
      h: 0.3,
      fontFace: FONT,
      fontSize: 10.5,
      color: GREY,
      isTextBox: true,
      margin: 0,
    });
  });

  hair(s, 4.35, M, W - M * 2, HAIR_DARK);
  if (withNote)
  s.addText(
    "석차등급은 학년 정원이 아니라 그 과목을 고른 사람 수로 매겨집니다. 2·3학년 선택과목에서 수강자가 30명이면 1등급은 3명, 15명이면 1명입니다.\n상위 10% 이내여야 하니 소수점은 버립니다 — 167명이면 16자리입니다.",
    {
      x: M,
      y: 4.6,
      w: W - M * 2,
      h: 1.2,
      fontFace: FONT,
      fontSize: 12.5,
      color: DARK_SUB,
      lineSpacing: 20,
      isTextBox: true,
      margin: 0,
    },
  );
  footer(s, page, true);
  s.addNotes(
    "[발표 스크립트] 숫자 하나만 먼저 보여드리겠습니다. 1등급은 상위 10%입니다. 다만 이건 공통과목 얘기고, 2학년부터 고르는 과목에서는 분모가 확 줄어듭니다.",
  );
}

function nextSchoolSlide(pptx: PptxGenJS, record: SchoolRecord, page: number) {
  const s = pptx.addSlide();
  const f = record.fact;
  const slices = pathBreakdown(f);
  if (!slices) return;

  eyebrow(s, "where they went");
  title(s, `${short(f.name)} 선배들은 어디로 갔나`, `졸업생 ${f.grad}명 · ${f.pathYear}년 공시`);

  const barY = 2.6;
  const barW = W - M * 2;
  let x = M;
  const colorOf = (k: string) =>
    k === "general" ? INK : k === "autonomous" ? BLUE : k === "special" ? YELLOW : k === "vocational" ? GREY : HAIR;
  slices.forEach((sl) => {
    const w = (sl.percent / 100) * barW;
    if (w > 0) {
      s.addShape("rect", { x, y: barY, w, h: 0.42, fill: { color: colorOf(sl.key) } });
      x += w;
    }
  });

  let ly = 3.3;
  slices
    .filter((sl) => sl.count > 0)
    .forEach((sl) => {
      hair(s, ly + 0.34, M, 7.4);
      s.addShape("rect", { x: M, y: ly + 0.07, w: 0.12, h: 0.12, fill: { color: colorOf(sl.key) } });
      s.addText(sl.label, {
        x: M + 0.26,
        y: ly,
        w: 2.2,
        h: 0.3,
        fontFace: FONT,
        fontSize: 12.5,
        bold: true,
        color: INK,
        isTextBox: true,
        margin: 0,
      });
      s.addText(`${sl.count}명`, {
        x: M + 2.5,
        y: ly,
        w: 1.2,
        h: 0.3,
        align: "right",
        fontFace: FONT,
        fontSize: 12.5,
        color: BODY,
        isTextBox: true,
        margin: 0,
      });
      s.addText(`${sl.percent.toFixed(1)}%`, {
        x: M + 3.8,
        y: ly,
        w: 1.2,
        h: 0.3,
        align: "right",
        fontFace: FONT,
        fontSize: 12.5,
        color: GREY,
        isTextBox: true,
        margin: 0,
      });
      ly += 0.46;
    });

  const sp = specialHighDetail(f);
  if (sp) {
    s.addText(
      `특목고 안을 열어보면 — ${sp.items.map((i) => `${i.label} ${i.count}명`).join(" · ")}`,
      {
        x: M + 7.9,
        y: 3.3,
        w: W - M * 2 - 7.9,
        h: 1.2,
        fontFace: FONT,
        fontSize: 12,
        color: BODY,
        lineSpacing: 19,
        isTextBox: true,
        margin: 0,
      },
    );
  }

  footer(s, page);
  s.addNotes(
    "[발표 스크립트] 이 학교를 나온 선배들이 실제로 어디로 갔는지 보겠습니다. 서울 중학교는 학교군 안에서 추첨이라 이건 순위표가 아니라 지도입니다.",
  );
}

function schoolSlides(pptx: PptxGenJS, record: SchoolRecord, startPage: number): number {
  const { fact: f, observation: o } = record;
  if (!o) return startPage;
  let page = startPage;
  const isHigh = f.level === "고";

  // 개요 + 학교 특징
  {
    const s = pptx.addSlide();
    eyebrow(s, "the school");
    title(s, f.name, [f.district, f.foundation, f.kind, f.coed].filter(Boolean).join(" · "));

    const stats: [string, string][] = [
      ["1학년", f.g1Total != null ? `${f.g1Total}명` : "—"],
      ["1학년 반", f.g1Classes != null ? `${f.g1Classes}반` : "—"],
      ["반당", f.g1PerClass != null ? `${f.g1PerClass.toFixed(1)}명` : "—"],
    ];
    if (isHigh && f.g1Total) stats.push(["1등급 자리", `${seatsForGrade1(f.g1Total)}명`]);

    const cw = (W - M * 2) / stats.length;
    stats.forEach(([k, v], i) => {
      const x = M + cw * i;
      s.addShape("rect", { x, y: 2.4, w: cw - 0.15, h: 1.0, fill: { color: PAPER } });
      s.addText(k, {
        x: x + 0.2,
        y: 2.55,
        w: cw - 0.5,
        h: 0.25,
        fontFace: FONT,
        fontSize: 10.5,
        color: GREY,
        isTextBox: true,
        margin: 0,
      });
      s.addText(v, {
        x: x + 0.2,
        y: 2.82,
        w: cw - 0.5,
        h: 0.45,
        fontFace: FONT,
        fontSize: 20,
        bold: true,
        color: INK,
        isTextBox: true,
        margin: 0,
      });
    });

    hair(s, 3.75);
    s.addText("이런 학교입니다", {
      x: M,
      y: 3.95,
      w: 4,
      h: 0.3,
      fontFace: FONT,
      fontSize: 13,
      bold: true,
      color: INK,
      isTextBox: true,
      margin: 0,
    });
    s.addText(o.character, {
      x: M,
      y: 4.35,
      w: W - M * 2,
      h: 1.6,
      fontFace: FONT,
      fontSize: 12.5,
      color: BODY,
      lineSpacing: 20,
      isTextBox: true,
      margin: 0,
    });
    footer(s, page++);
    s.addNotes(`[발표 스크립트] ${f.name}입니다. ${o.character}`);
  }

  // 난이도 + 시험범위 + 커트라인/성취도
  {
    const s = pptx.addSlide();
    eyebrow(s, "what's hard");
    title(s, "어느 과목이 센가", o.difficulty.comment || undefined);

    const subs = ["국어", "영어", "수학", "사회", "과학"] as const;
    const cw = (W - M * 2) / subs.length;
    subs.forEach((sub, i) => {
      const x = M + cw * i;
      const lv = o.difficulty[sub];
      const c = lv === "최상" ? "A8432F" : lv === "상" ? BLUE : lv === "기초" ? GREY : BODY;
      s.addText(sub, {
        x,
        y: 2.6,
        w: cw - 0.2,
        h: 0.3,
        fontFace: FONT,
        fontSize: 12,
        color: GREY,
        isTextBox: true,
        margin: 0,
      });
      s.addText(lv, {
        x,
        y: 2.92,
        w: cw - 0.2,
        h: 0.5,
        fontFace: FONT,
        fontSize: 24,
        bold: true,
        color: c,
        isTextBox: true,
        margin: 0,
      });
      hair(s, 3.5, x, cw - 0.35);
    });

    let y = 3.85;
    s.addText("영어 시험, 어디서 나오나", {
      x: M,
      y,
      w: 5,
      h: 0.3,
      fontFace: FONT,
      fontSize: 13,
      bold: true,
      color: INK,
      isTextBox: true,
      margin: 0,
    });
    y += 0.4;
    o.examScope.slice(0, 3).forEach((e) => {
      s.addText(e.term, {
        x: M,
        y,
        w: 1.6,
        h: 0.3,
        fontFace: FONT,
        fontSize: 11.5,
        bold: true,
        color: INK,
        isTextBox: true,
        margin: 0,
      });
      s.addText(e.scope, {
        x: M + 1.7,
        y,
        w: W - M * 2 - 1.7,
        h: 0.42,
        fontFace: FONT,
        fontSize: 11.5,
        color: BODY,
        lineSpacing: 16,
        isTextBox: true,
        margin: 0,
      });
      y += 0.5;
      hair(s, y - 0.08);
    });

    if (isHigh && o.cutoff.grade1) {
      s.addText(
        [
          { text: "몇 점부터 1등급인가  ", options: { bold: true, color: INK } },
          { text: `${o.cutoff.grade1}점`, options: { bold: true, color: YELLOW_S, fontSize: 16 } },
          { text: `   2등급 ${o.cutoff.grade2}점`, options: { color: GREY } },
        ],
        {
          x: M,
          y: y + 0.15,
          w: W - M * 2,
          h: 0.4,
          fontFace: FONT,
          fontSize: 13,
          isTextBox: true,
          margin: 0,
        },
      );
    } else if (o.middle?.aRatio) {
      s.addText(
        [
          { text: "영어 성취도 A  ", options: { bold: true, color: INK } },
          { text: o.middle.aRatio, options: { bold: true, color: YELLOW_S, fontSize: 16 } },
          o.middle.ratio ? { text: `   지필:수행 ${o.middle.ratio}`, options: { color: GREY } } : { text: "" },
        ],
        {
          x: M,
          y: y + 0.15,
          w: W - M * 2,
          h: 0.4,
          fontFace: FONT,
          fontSize: 13,
          isTextBox: true,
          margin: 0,
        },
      );
    }

    footer(s, page++);
    s.addNotes(
      `[발표 스크립트] ${short(f.name)}는 영어가 ${o.difficulty.영어}입니다. ${o.difficulty.comment ?? ""}`,
    );
  }

  // 시험의 성격 + 시그니처
  {
    const s = pptx.addSlide();
    eyebrow(s, "how they test");
    title(s, "이 시험의 성격");

    let y = 2.35;
    o.features.slice(0, 3).forEach((t, i) => {
      s.addText(String(i + 1).padStart(2, "0"), {
        x: M,
        y,
        w: 0.45,
        h: 0.3,
        fontFace: FONT,
        fontSize: 11,
        bold: true,
        color: YELLOW_S,
        isTextBox: true,
        margin: 0,
      });
      s.addText(t, {
        x: M + 0.55,
        y,
        w: W - M * 2 - 0.55,
        h: 0.55,
        fontFace: FONT,
        fontSize: 12.5,
        color: BODY,
        lineSpacing: 19,
        isTextBox: true,
        margin: 0,
      });
      y += 0.68;
      hair(s, y - 0.1);
    });

    y += 0.2;
    s.addText("이 학교만 내는 문제", {
      x: M,
      y,
      w: 5,
      h: 0.3,
      fontFace: FONT,
      fontSize: 13,
      bold: true,
      color: INK,
      isTextBox: true,
      margin: 0,
    });
    y += 0.42;
    o.signatures.slice(0, 3).forEach((q, i) => {
      s.addShape("rect", { x: M, y: y + 0.07, w: 0.12, h: 0.12, fill: { color: i % 2 ? BLUE : YELLOW } });
      s.addText(q.title, {
        x: M + 0.26,
        y,
        w: W - M * 2 - 0.26,
        h: 0.32,
        fontFace: FONT,
        fontSize: 12,
        bold: true,
        color: INK,
        isTextBox: true,
        margin: 0,
      });
      y += 0.42;
    });

    footer(s, page++);
    s.addNotes(
      `[발표 스크립트] ${short(f.name)} 시험의 성격입니다. ${o.features[0] ?? ""}`,
    );
  }

  // 맞는 학생
  {
    const s = pptx.addSlide();
    eyebrow(s, "who fits");
    title(s, `${short(f.name)}, 이런 학생이 잘 맞습니다`);
    let y = 2.5;
    o.fit.slice(0, 5).forEach((t) => {
      s.addShape("rect", { x: M, y: y + 0.09, w: 0.12, h: 0.12, fill: { color: YELLOW } });
      s.addText(t, {
        x: M + 0.3,
        y,
        w: W - M * 2 - 0.3,
        h: 0.5,
        fontFace: FONT,
        fontSize: 13,
        color: BODY,
        lineSpacing: 20,
        isTextBox: true,
        margin: 0,
      });
      y += 0.62;
      hair(s, y - 0.12);
    });
    s.addText("이 판단은 옳은영어의 견해이며 공시된 사실이 아닙니다", {
      x: M,
      y: H - 1.05,
      w: W - M * 2,
      h: 0.3,
      fontFace: FONT,
      fontSize: 9,
      color: GREY,
      isTextBox: true,
      margin: 0,
    });
    footer(s, page++);
    s.addNotes("[발표 스크립트] 그래서 이런 학생에게 맞습니다.");
  }

  return page;
}


/* ── 출처층(SOURCED) 슬라이드 ─────────── */

const srcLine = (e: { source: { url: string; date: string } }) =>
  `출처 · ${e.source.url.includes("youtube") ? "유튜브 LIVE" : "옳은영어 블로그"} · ${e.source.date.replace(/-/g, ".")}`;

/** 숫자의 이면 — 설명회 오프닝 */
function numbersSlide(pptx: PptxGenJS, page: number) {
  const s = pptx.addSlide();
  eyebrow(s, "read the numbers");
  title(
    s,
    "'1등급 몇 명'보다 먼저 보셔야 할 것",
    "숫자는 정확해 보이지만, 어떤 분모 위에 올려놓았는지에 따라 뜻이 달라집니다",
  );
  let y = 2.45;
  ORUN_MESSAGES.slice(0, 4).forEach((m, i) => {
    s.addText(String(i + 1).padStart(2, "0"), {
      x: M, y, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: YELLOW_S,
      isTextBox: true, margin: 0,
    });
    s.addText(m.text, {
      x: M + 0.6, y, w: W - M * 2 - 0.6, h: 0.72, fontFace: FONT, fontSize: 12.5, color: BODY,
      lineSpacing: 19, isTextBox: true, margin: 0, valign: "top",
    });
    y += 0.9;
    hair(s, y - 0.12);
  });
  s.addText(srcLine(ORUN_MESSAGES[0]), {
    x: M, y: H - 1.0, w: W - M * 2, h: 0.25, fontFace: FONT, fontSize: 8.5, color: GREY, isTextBox: true, margin: 0,
  });
  footer(s, page);
  s.addNotes(
    "[템플릿 사용법] 오프닝. 우리 학원 자랑보다 '숫자 읽는 법'을 먼저 준다.\n\n[발표 스크립트] 100명 중 10명이 1등급인 학원과, 다섯 명 중 한 명이 1등급인 학원. 어느 쪽이 교육력이 높을까요.",
  );
}

/** 2026 1학기 옳은영어 결과 — 다크 + 포스터 */
function orunResultsSlide(pptx: PptxGenJS, page: number, poster?: string) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  s.addShape("rect", { x: M, y: 0.5, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText("WE DID THIS · 2026 1학기", {
    x: M + 0.24, y: 0.46, w: 8, h: 0.22, fontFace: FONT, fontSize: 10, bold: true, color: YELLOW, charSpacing: 3, isTextBox: true, margin: 0,
  });
  s.addText("2026년 1학기, 옳은영어가 낸 결과", {
    x: M, y: 0.95, w: 8, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: "FFFFFF", isTextBox: true, margin: 0,
  });
  const cw = 3.5;
  ORUN_RESULTS.forEach((r, i) => {
    const x = M + (i % 2) * cw;
    const y = 2.1 + Math.floor(i / 2) * 1.85;
    s.addText(r.label, { x, y, w: cw - 0.3, h: 0.3, fontFace: FONT, fontSize: 11.5, color: DARK_SUB, isTextBox: true, margin: 0 });
    s.addText(r.value, { x, y: y + 0.32, w: cw - 0.3, h: 0.75, fontFace: FONT, fontSize: 36, bold: true, color: YELLOW, isTextBox: true, margin: 0 });
    s.addText(`${r.basis} · ${r.term}`, { x, y: y + 1.08, w: cw - 0.3, h: 0.45, fontFace: FONT, fontSize: 9.5, color: GREY, lineSpacing: 14, isTextBox: true, margin: 0 });
    if (i % 2 === 1) s.addShape("line", { x: M + cw - 0.15, y, w: 0, h: 1.5, line: { color: HAIR_DARK, width: 0.75 } });
  });
  if (poster) {
    s.addImage({ data: poster, x: W - M - 3.7, y: 0.85, w: 3.7, h: 5.25 });
    s.addText("옳은영어 블로그 2026.05.15 게시 포스터", {
      x: W - M - 3.7, y: 6.15, w: 3.7, h: 0.25, fontFace: FONT, fontSize: 8, color: GREY, isTextBox: true, margin: 0,
    });
  }
  s.addText("학교 1등급 중 비율과 재원생 중 비율은 분모가 다릅니다 · 옳은영어 블로그 성적우수자 발표 기준", {
    x: M, y: H - 1.0, w: 7.5, h: 0.25, fontFace: FONT, fontSize: 8.5, color: GREY, isTextBox: true, margin: 0,
  });
  footer(s, page, true);
  s.addNotes("[발표 스크립트] 전 과목 1등급 4명, 전교 1등 2명. 포스터에 있는 그대로입니다.");
}

/** 2026 1학기 시험 한눈에 — 표 */
function exam2026TableSlides(pptx: PptxGenJS, records: SchoolRecord[], level: "고" | "중", page: number): number {
  const list = records.filter((r) => r.fact.level === level && r.sourced?.exams.length);
  if (!list.length) return page;
  const grade = level === "고" ? 1 : list.some((r) => r.sourced!.exams.some((e) => e.grade === 3)) ? 3 : 2;
  const chunks = balancedChunks(list, 5);
  chunks.forEach((chunk, ci) => {
    const s = pptx.addSlide();
    eyebrow(s, "the 2026 tests");
    title(
      s,
      chunks.length > 1 ? `2026년 1학기, 시험은 이렇게 나왔다 (${ci + 1}/${chunks.length})` : "2026년 1학기, 시험은 이렇게 나왔다",
      `${level}${grade} 기준 · 옳은영어 강사진이 실제 시험지를 놓고 쓴 상세 분석`,
    );
    const head = ["학교", "중간고사", "기말고사", ...(level === "고" ? ["1등급 컷"] : []), "한 줄로"];
    const border = (color: string, pt: number) =>
      [{ type: "none" }, { type: "none" }, { type: "solid", color, pt }, { type: "none" }] as PptxGenJS.TableCellProps["border"];
    const rows: PptxGenJS.TableRow[] = [
      head.map((h) => ({
        text: h,
        options: { fontFace: FONT, fontSize: 9.5, color: GREY, bold: false, border: border(INK, 1.25), valign: "bottom" as PptxGenJS.VAlign },
      })),
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
          options: {
            fontFace: FONT,
            fontSize: i === 0 ? 11 : 9,
            color: i === 0 ? INK : BODY,
            bold: i === 0 || (level === "고" && i === 3),
            border: border(HAIR, 0.75),
            valign: "top" as PptxGenJS.VAlign,
          },
        })),
      );
    });
    const colW = level === "고" ? [1.5, 3.4, 3.4, 1.0, 2.63] : [1.6, 3.6, 3.6, 3.13];
    s.addTable(rows, { x: M, y: 2.35, w: W - M * 2, colW, valign: "top" });
    s.addText("컷은 학교 발표값이 아니라 우리 학생 성적표와 강사 추정 · 출처는 학교 페이지에", {
      x: M, y: H - 1.0, w: W - M * 2, h: 0.25, fontFace: FONT, fontSize: 8.5, color: GREY, isTextBox: true, margin: 0,
    });
    footer(s, page++);
    s.addNotes("[발표 스크립트] 같은 동네인데 시험의 성격이 이렇게 다릅니다. 객관식 100%인 학교와 서답형 35점인 학교가 나란히 있습니다.");
  });
  return page;
}

/** 학교별 — 2026 시험 카드(중간·기말) */
function examTrendSlide(pptx: PptxGenJS, r: SchoolRecord, grade: number, exams: ExamReport[], page: number) {
  const s = pptx.addSlide();
  const f = r.fact;
  eyebrow(s, "how 2026 went");
  title(s, `${short(f.name)} ${f.level}${grade} · 2026년 1학기 시험`, r.sourced?.oneLiner);
  const cardW = exams.length > 1 ? (W - M * 2 - 0.2) / 2 : W - M * 2;
  exams.forEach((e, i) => {
    const x = M + i * (cardW + 0.2);
    const top = 2.35;
    const cardH = 4.45;
    s.addShape("rect", { x, y: top, w: cardW, h: cardH, fill: { color: PAPER } });
    let y = top + 0.18;
    const isMid = e.term.endsWith("중간");
    s.addText(e.term.toUpperCase(), {
      x: x + 0.22, y, w: 2.5, h: 0.22, fontFace: FONT, fontSize: 9.5, bold: true, color: isMid ? BLUE : YELLOW_S, charSpacing: 2, isTextBox: true, margin: 0,
    });
    s.addText(e.format, {
      x: x + 2.6, y, w: cardW - 2.8, h: 0.22, align: "right", fontFace: FONT, fontSize: 9.5, color: GREY, isTextBox: true, margin: 0,
    });
    y += 0.34;
    if (e.cut?.grade1) {
      // "80점대 후반~90점대 초반 예상" 같은 긴 컷은 큰 숫자로 못 쓴다.
      const big = e.cut.grade1.length <= 8;
      s.addText(
        [
          { text: "1등급 컷  ", options: { fontSize: 10, color: GREY } },
          { text: e.cut.grade1, options: { fontSize: big ? 20 : 12.5, bold: true, color: INK } },
          ...(e.cut.grade2 ? [{ text: `    2등급 ${e.cut.grade2}`, options: { fontSize: 10, color: GREY } }] : []),
          ...(e.cut.avg ? [{ text: `    평균 ${e.cut.avg}`, options: { fontSize: 10, color: GREY } }] : []),
        ],
        { x: x + 0.22, y, w: cardW - 0.44, h: 0.4, fontFace: FONT, isTextBox: true, margin: 0, valign: "bottom" },
      );
      y += 0.48;
    }
    if (e.scope) {
      s.addText(`범위 · ${e.scope}`, {
        x: x + 0.22, y, w: cardW - 0.44, h: 0.3, fontFace: FONT, fontSize: 9.5, color: BODY, isTextBox: true, margin: 0,
      });
      y += 0.32;
    }
    s.addText(e.difficulty, {
      x: x + 0.22, y, w: cardW - 0.44, h: 0.5, fontFace: FONT, fontSize: 11, bold: true, color: INK, lineSpacing: 15, isTextBox: true, margin: 0, valign: "top",
    });
    y += 0.56;
    hair(s, y, x + 0.22, cardW - 0.44);
    y += 0.08;
    const maxK = e.scope && e.cut?.grade1 ? 3 : 4;
    e.killers.slice(0, maxK).forEach((k) => {
      s.addShape("rect", { x: x + 0.22, y: y + 0.07, w: 0.08, h: 0.08, fill: { color: YELLOW } });
      s.addText(k, {
        x: x + 0.38, y, w: cardW - 0.6, h: 0.4, fontFace: FONT, fontSize: 9.5, color: BODY, lineSpacing: 13, isTextBox: true, margin: 0, valign: "top",
      });
      y += 0.42;
    });
    hair(s, y, x + 0.22, cardW - 0.44);
    y += 0.1;
    s.addText(`“${e.verdict}”${e.teacher ? ` — ${e.teacher} T` : ""}`, {
      x: x + 0.22, y, w: cardW - 0.44, h: 0.6, fontFace: FONT, fontSize: 9.5, italic: true, color: BODY, lineSpacing: 13, isTextBox: true, margin: 0, valign: "top",
    });
    s.addText(srcLine(e), {
      x: x + 0.22, y: top + cardH - 0.3, w: cardW - 0.44, h: 0.22, fontFace: FONT, fontSize: 7.5, color: GREY, isTextBox: true, margin: 0,
    });
  });
  footer(s, page);
  s.addNotes(`[발표 스크립트] ${short(f.name)} ${grade}학년 2026년 1학기입니다. ${exams.map((e) => `${e.term}: ${e.difficulty}`).join(" / ")}`);
}

/** 학교별 — 설명회에서 한 말 + 이 학교 실적 */
function insightsSlide(pptx: PptxGenJS, r: SchoolRecord, sc: SourcedSchool, page: number) {
  const s = pptx.addSlide();
  eyebrow(s, "said on stage");
  title(s, `${short(r.fact.name)}, 설명회에서 한 말`);
  let y = 2.3;
  const maxI = sc.results.length ? 4 : 5;
  sc.insights.slice(0, maxI).forEach((it, i) => {
    s.addText(String(i + 1).padStart(2, "0"), { x: M, y, w: 0.45, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: YELLOW_S, isTextBox: true, margin: 0 });
    s.addText(it.text, { x: M + 0.55, y, w: W - M * 2 - 3.2, h: 0.62, fontFace: FONT, fontSize: 11.5, color: BODY, lineSpacing: 16, isTextBox: true, margin: 0, valign: "top" });
    s.addText(srcLine(it), { x: W - M - 2.5, y: y + 0.02, w: 2.5, h: 0.25, align: "right", fontFace: FONT, fontSize: 7.5, color: GREY, isTextBox: true, margin: 0 });
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
      s.addText(res.label, { x: x + 0.15, y, w: cw - 0.3, h: 0.26, fontFace: FONT, fontSize: 9.5, color: GREY, isTextBox: true, margin: 0 });
      s.addText(res.value, { x: x + 0.15, y: y + 0.26, w: cw - 0.3, h: 0.45, fontFace: FONT, fontSize: 22, bold: true, color: INK, isTextBox: true, margin: 0 });
      s.addText(`${res.basis} · ${res.term}`, { x: x + 0.15, y: y + 0.72, w: cw - 0.3, h: 0.32, fontFace: FONT, fontSize: 8, color: GREY, lineSpacing: 11, isTextBox: true, margin: 0 });
    });
  }
  footer(s, page);
  s.addNotes(`[발표 스크립트] ${sc.insights[0]?.text ?? ""}`);
}

/** 학교별 — 선배 TMI */
function tmiSlide(pptx: PptxGenJS, r: SchoolRecord, sc: SourcedSchool, page: number) {
  const s = pptx.addSlide();
  eyebrow(s, "from the seniors");
  title(s, `${short(r.fact.name)} 선배들이 후배에게`, "옳은영어 재원생 선배들이 직접 써 준 답 · 유튜브 LIVE 2025.11.16");
  const items = sc.tmi.slice(0, 10);
  const perCol = Math.ceil(items.length / 2);
  const colW = (W - M * 2 - 0.4) / 2;
  items.forEach((t, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = M + col * (colW + 0.4);
    const y = 2.4 + row * 0.62;
    s.addText(String(i + 1).padStart(2, "0"), { x, y, w: 0.4, h: 0.3, fontFace: FONT, fontSize: 10.5, bold: true, color: YELLOW_S, isTextBox: true, margin: 0 });
    s.addText(t, { x: x + 0.45, y, w: colW - 0.45, h: 0.5, fontFace: FONT, fontSize: 11.5, color: BODY, lineSpacing: 15, isTextBox: true, margin: 0, valign: "top" });
    hair(s, y + 0.52, x, colW);
  });
  footer(s, page);
  s.addNotes("[발표 스크립트] 어른들이 못 알려주는 것들입니다. 급식, 계단, 매점.");
}

/** 학교별 — 학교 소식(밖에서 본 것) */
function newsSlide(pptx: PptxGenJS, r: SchoolRecord, n: SchoolNews, page: number) {
  const s = pptx.addSlide();
  eyebrow(s, "from outside");
  title(s, `${short(r.fact.name)}, 밖에서 본 것`, n.oneLiner);
  let y = 2.35;
  n.items.slice(0, 6).forEach((it) => {
    s.addText(NEWS_KIND_LABEL[it.kind].toUpperCase(), {
      x: M, y: y + 0.03, w: 1.3, h: 0.22, fontFace: FONT, fontSize: 8.5, bold: true,
      color: it.kind === "results" ? YELLOW_S : it.kind === "curriculum" ? BLUE : GREY, charSpacing: 1.5, isTextBox: true, margin: 0,
    });
    s.addText(
      [
        { text: it.title, options: { bold: true, color: INK, fontSize: 11.5, breakLine: true } },
        { text: it.summary, options: { color: BODY, fontSize: 10.5 } },
      ],
      { x: M + 1.4, y, w: W - M * 2 - 1.4 - 2.2, h: 0.62, fontFace: FONT, lineSpacing: 14, isTextBox: true, margin: 0, valign: "top" },
    );
    s.addText(`${it.source.publisher}${it.date ? " · " + it.date.replace(/-/g, ".") : ""}`, {
      x: W - M - 2.1, y: y + 0.03, w: 2.1, h: 0.22, align: "right", fontFace: FONT, fontSize: 7.5, color: GREY, isTextBox: true, margin: 0,
    });
    y += 0.72;
    hair(s, y - 0.1);
  });
  s.addText(`조사일 ${n.fetchedAt} · 학교 홈페이지·언론·학교알리미 공시 문서에서 옮김`, {
    x: M, y: H - 1.0, w: W - M * 2, h: 0.25, fontFace: FONT, fontSize: 8.5, color: GREY, isTextBox: true, margin: 0,
  });
  footer(s, page);
  s.addNotes(`[발표 스크립트] 학교 밖에서 확인되는 것들입니다. ${n.items[0]?.title ?? ""}`);
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

function resultsSlide(pptx: PptxGenJS, records: SchoolRecord[], page: number) {
  const all = records.flatMap((r) => r.results ?? []);
  if (!all.length) return page;
  const s = pptx.addSlide();
  s.background = { color: INK };

  s.addShape("rect", { x: M, y: 0.5, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText("WE DID THIS", {
    x: M + 0.24,
    y: 0.46,
    w: 8,
    h: 0.22,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: YELLOW,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
  s.addText("우리가 만든 결과", {
    x: M,
    y: 0.95,
    w: 10,
    h: 0.7,
    fontFace: FONT,
    fontSize: 30,
    bold: true,
    color: "FFFFFF",
    isTextBox: true,
    margin: 0,
  });

  const groups = (["enrolled", "schoolTop"] as const)
    .map((basis) => ({ basis, list: all.filter((r) => r.basis === basis) }))
    .filter((g) => g.list.length);

  let y = 2.2;
  groups.forEach((g) => {
    s.addText(RESULT_BASIS_LABEL[g.basis], {
      x: M,
      y,
      w: 10,
      h: 0.3,
      fontFace: FONT,
      fontSize: 11,
      color: DARK_SUB,
      charSpacing: 1,
      isTextBox: true,
      margin: 0,
    });
    y += 0.36;
    const cw = (W - M * 2) / Math.max(g.list.length, 1);
    g.list.forEach((r, i) => {
      const x = M + cw * i;
      if (i > 0) s.addShape("line", { x, y, w: 0, h: 1.1, line: { color: HAIR_DARK, width: 0.75 } });
      s.addText(r.label, {
        x: x + 0.18,
        y,
        w: cw - 0.3,
        h: 0.3,
        fontFace: FONT,
        fontSize: 12,
        color: "FFFFFF",
        isTextBox: true,
        margin: 0,
      });
      s.addText(`${r.percent}%`, {
        x: x + 0.18,
        y: y + 0.32,
        w: cw - 0.3,
        h: 0.7,
        fontFace: FONT,
        fontSize: 40,
        bold: true,
        color: YELLOW,
        isTextBox: true,
        margin: 0,
      });
    });
    y += 1.45;
  });

  s.addText(`${all[0].term} · 옳은영어 재원생 자체 집계 · 두 지표는 분모가 다릅니다`, {
    x: M,
    y: H - 1.0,
    w: W - M * 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 9,
    color: GREY,
    isTextBox: true,
    margin: 0,
  });
  footer(s, page, true);
  s.addNotes("[발표 스크립트] 두 숫자는 기준이 다릅니다. 섞어서 비교하시면 안 됩니다.");
  return page + 1;
}

function closingSlide(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: INK };
  s.addImage({ data: ORUN_LIGHTHOUSE_WHITE, x: W - 4.4, y: 1.5, w: 5.0, h: 4.05, transparency: 86 });
  s.addShape("rect", { x: M, y: 2.42, w: 0.12, h: 0.12, fill: { color: YELLOW } });
  s.addText("THANK YOU", {
    x: M + 0.24,
    y: 2.38,
    w: 8,
    h: 0.22,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: YELLOW,
    charSpacing: 3,
    isTextBox: true,
    margin: 0,
  });
  s.addText("정확한 분석,\n옳은 방향", {
    x: M,
    y: 2.8,
    w: 8,
    h: 1.7,
    fontFace: FONT,
    fontSize: 48,
    bold: true,
    color: "FFFFFF",
    lineSpacing: 58,
    isTextBox: true,
    margin: 0,
  });
  s.addText("옳은영어 ORUN ENGLISH", {
    x: M,
    y: 4.9,
    w: 8,
    h: 0.3,
    fontFace: FONT,
    fontSize: 12,
    color: DARK_SUB,
    isTextBox: true,
    margin: 0,
  });
  s.addText(
    "출처 · 학교알리미 2026년 공시 · 졸업생 진로 2025년 공시 · 나이스 교육정보 개방포털",
    {
      x: M,
      y: H - 0.9,
      w: W - M * 2,
      h: 0.3,
      fontFace: FONT,
      fontSize: 8.5,
      color: GREY,
      isTextBox: true,
      margin: 0,
    },
  );
  s.addNotes("[발표 스크립트] 개별 상담은 끝나고 바로 받겠습니다.");
}

/* ── 진입점 ────────────────────────────── */

export interface DeckAssets {
  /** 실적 포스터 data URL — 브라우저에서는 /orun/*.jpg 를 fetch 해 넣는다 */
  posters?: string[];
}

export async function buildDeck(records: SchoolRecord[], year = "2027학년도", assets: DeckAssets = {}) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "옳은영어 ORUN ENGLISH";
  pptx.title = `${year} 학교 분석지`;

  const highs = records.filter((r) => r.fact.level === "고");
  const mids = records.filter((r) => r.fact.level === "중");
  const detailed = records.filter((r) => r.observation || r.sourced);

  coverSlide(pptx, records, year);
  let page = 2;
  tocSlide(pptx, records, page++);

  // 섹션 번호는 실제로 만들어진 섹션에만 붙는다.
  let sec = 0;
  const nextNo = () => String(++sec).padStart(2, "0");

  sectionSlide(
    pptx,
    nextNo(),
    "숫자의 이면",
    "'1등급 몇 명'보다 먼저, 그 숫자가 어떤 분모 위에 있는지부터 봅니다.",
  );
  page++;
  numbersSlide(pptx, page++);
  orunResultsSlide(pptx, page++, assets.posters?.[0]);

  sectionSlide(
    pptx,
    nextNo(),
    "숫자부터 봅니다",
    "학교알리미 공시를 그대로 옮긴 표입니다. 저희 해석은 아직 들어가지 않았습니다.",
  );
  page++;
  if (highs.length) page = compareSlides(pptx, highs, "고", page);
  if (mids.length) page = compareSlides(pptx, mids, "중", page);

  if (records.some((r) => r.sourced?.exams.length)) {
    sectionSlide(
      pptx,
      nextNo(),
      "2026년 시험은 이렇게 나왔다",
      "옳은영어 강사진이 실제 시험지를 놓고 쓴 학교별 상세 분석. 중간과 기말이 어떻게 달랐는지까지.",
    );
    page++;
    page = exam2026TableSlides(pptx, records, "고", page);
    page = exam2026TableSlides(pptx, records, "중", page);
  }

  if (highs.length) {
    sectionSlide(
      pptx,
      nextNo(),
      "1등급, 몇 자리인가",
      "상위 10%가 몇 명인지부터 계산합니다. 분모가 무엇인지가 전부입니다.",
    );
    page++;
    page = seatsSlides(pptx, highs, page);
  }

  const withPath = mids.filter((r) => r.fact.grad);
  if (withPath.length) {
    sectionSlide(
      pptx,
      nextNo(),
      "선배들은 어디로 갔나",
      "서울 중학교는 학교군 추첨입니다. 이건 순위표가 아니라 지도로 보셔야 합니다.",
    );
    page++;
    withPath.forEach((r) => nextSchoolSlide(pptx, r, page++));
  }

  if (detailed.length) {
    sectionSlide(
      pptx,
      nextNo(),
      "학교 하나씩 뜯어봅니다",
      `저희가 직접 시험지를 본 ${detailed.length}곳입니다. 공시로는 안 나오는 부분입니다.`,
    );
    page++;
    detailed.forEach((r) => {
      page = schoolSlides(pptx, r, page);
      page = sourcedSlides(pptx, r, page);
    });
  }

  page = resultsSlide(pptx, records, page);
  closingSlide(pptx);

  const stamp = new Date().toISOString().slice(0, 10);
  await pptx.writeFile({ fileName: `옳은영어_학교분석_${stamp}.pptx` });
}
