import * as XLSX from "xlsx";
import type { AchievementRow, Letter, ParsedAchievement } from "@/types/achievement";

/**
 * 학교알리미 「교과별 학업성취 사항」 엑셀 파서.
 *
 * 학교알리미의 '엑셀다운로드'는 진짜 xlsx일 때도 있고, 표를 HTML로 써서 .xls 라고 부르는
 * 파일일 때도 있다. 둘 다 SheetJS가 읽는다. 열 순서는 믿지 않고 머리글 글자로 찾는다.
 *
 * 찾는 것: 학년 · (학기) · (교과) · 과목 · 수강자수 · 평균 · 표준편차 · A~E 비율.
 * 병합된 셀(학년·교과가 첫 행에만 있는 표)은 앞 값을 이어 쓴다.
 */

const LETTERS: Letter[] = ["A", "B", "C", "D", "E"];

function decode(buf: ArrayBuffer): string {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  // 깨진 글자가 많으면 EUC-KR로 다시 읽는다
  const broken = (utf8.match(/�/g) ?? []).length;
  if (broken > 5) {
    try {
      return new TextDecoder("euc-kr").decode(buf);
    } catch {
      return utf8;
    }
  }
  return utf8;
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[,%\s]/g, "").replace(/명$/, "");
  if (!s || s === "-" || s === "—") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function gradeOf(v: string): number | null {
  const m = v.match(/(\d)\s*학년|^(\d)$|[고중]\s*(\d)/);
  if (!m) return null;
  return Number(m[1] ?? m[2] ?? m[3]);
}

function termOf(v: string): string | undefined {
  const m = v.match(/([12])\s*학기/);
  return m ? `${m[1]}학기` : undefined;
}

/** 학기가 있으면 학년도를 추정한다. 1학기 성취는 같은 해 2차 공시, 2학기 성취는 다음 해 1차 공시에 실린다. */
function guessSchoolYear(year: number, term?: string): number {
  if (term === "2학기") return year - 1;
  return year;
}

export async function parseAchievementFile(file: File): Promise<ParsedAchievement> {
  const buf = await file.arrayBuffer();
  const head = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 400)).trimStart().toLowerCase();
  let wb: XLSX.WorkBook;
  if (head.startsWith("<") || head.includes("<table") || head.includes("<html")) {
    wb = XLSX.read(decode(buf), { type: "string" });
  } else {
    wb = XLSX.read(buf, { type: "array" });
  }
  return parseWorkbook(wb, file.name);
}

export function parseWorkbook(wb: XLSX.WorkBook, fileName: string): ParsedAchievement {
  const warnings: string[] = [];
  const rows: AchievementRow[] = [];
  let schoolName: string | undefined;
  let year: number | undefined = Number(fileName.match(/(20\d\d)/)?.[1]) || undefined;
  /** 시트 글에 "2025학년도"처럼 학년도가 적혀 있으면 추정보다 그 값을 믿는다 */
  let schoolYearHint: number | undefined;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: "" });
    if (!grid.length) continue;

    // 학교명·공시연도는 표 바깥 어딘가에 글로 있다
    for (const r of grid) {
      for (const c of r) {
        const s = String(c ?? "");
        if (!schoolName) {
          const m = s.match(/([가-힣A-Za-z0-9·]+(?:고등학교|중학교))/);
          if (m) schoolName = m[1];
        }
        const sy = s.match(/(20\d\d)\s*학년도/);
        if (sy && !schoolYearHint) schoolYearHint = Number(sy[1]);
        const y = s.match(/(20\d\d)\s*년(?!도)/);
        if (y && /공시|기준|년도/.test(s)) year = Number(y[1]);
      }
    }

    const hi = grid.findIndex((r) => r.some((c) => /수강자/.test(String(c))) && r.some((c) => /평균/.test(String(c))));
    if (hi < 0) continue;

    const header = grid[hi].map((c) => String(c ?? "").replace(/\s+/g, ""));
    const next = (grid[hi + 1] ?? []).map((c) => String(c ?? "").replace(/\s+/g, ""));
    const find = (re: RegExp, alsoNext = false) => {
      let i = header.findIndex((h) => re.test(h));
      if (i < 0 && alsoNext) i = next.findIndex((h) => re.test(h));
      return i;
    };
    const iGrade = find(/학년(?!도)/);
    const iTerm = find(/학기/);
    const iYear = find(/학년도/);
    const iArea = find(/^교과(\(군\)|군)?$/);
    const iSubj = find(/과목/);
    const iN = find(/수강자/);
    const iAvg = find(/^평균/);
    const iSd = find(/표준편차/);
    const iDist: Record<Letter, number> = { A: -1, B: -1, C: -1, D: -1, E: -1 };
    for (const L of LETTERS) {
      let i = header.findIndex((h) => h === L || new RegExp(`^${L}(\\(|비율|\\d|%|$)`).test(h));
      if (i < 0) i = next.findIndex((h) => h === L || new RegExp(`^${L}(\\(|비율|\\d|%|$)`).test(h));
      iDist[L] = i;
    }
    // 분포비율이 "성취도별 분포비율(%)" 한 칸 아래에 A~E로 나뉜 2단 머리글이면 자료는 두 줄 아래부터
    const twoRowHeader = next.some((h) => /^[A-E]$/.test(h));
    if (iSubj < 0 || iN < 0) {
      warnings.push(`${sheetName}: 과목·수강자수 열을 못 찾았어요.`);
      continue;
    }
    if (LETTERS.some((L) => iDist[L] < 0)) warnings.push(`${sheetName}: 성취도 A~E 열 일부를 못 찾았어요.`);

    let lastGrade: number | null = null;
    let lastTerm: string | undefined;
    let lastArea: string | undefined;
    let lastYear: number | undefined;
    for (let r = hi + (twoRowHeader ? 2 : 1); r < grid.length; r++) {
      const row = grid[r].map((v) => (v == null ? "" : typeof v === "number" ? v : String(v).trim()));
      if (!row.some((v) => v !== "")) continue;
      const cell = (i: number) => (i >= 0 ? row[i] : "");
      const gradeCell = String(cell(iGrade));
      const g = gradeOf(gradeCell) ?? (iGrade >= 0 && gradeCell === "" ? lastGrade : null) ?? gradeOf(String(cell(iSubj)));
      if (g != null) lastGrade = g;
      const t = termOf(String(cell(iTerm))) ?? (iTerm >= 0 && String(cell(iTerm)) === "" ? lastTerm : undefined);
      if (t) lastTerm = t;
      const area = String(cell(iArea)) || lastArea;
      if (String(cell(iArea))) lastArea = String(cell(iArea));
      const yCell = String(cell(iYear)).match(/20\d\d/)?.[0];
      const yv = yCell ? Number(yCell) : lastYear;
      if (yCell) lastYear = Number(yCell);

      const subject = String(cell(iSubj)).replace(/\s+/g, " ").trim();
      if (!subject || /^(합계|소계|계|총계|평균)$/.test(subject)) continue;
      const n = num(cell(iN));
      if (n == null || n <= 0) continue;
      if (g == null) {
        warnings.push(`${subject}: 학년을 못 읽어 건너뛰었어요.`);
        continue;
      }
      const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 } as Record<Letter, number>;
      for (const L of LETTERS) dist[L] = iDist[L] >= 0 ? (num(cell(iDist[L])) ?? 0) : 0;
      const pubYear = year ?? yv ?? new Date().getFullYear();
      rows.push({
        year: pubYear,
        schoolYear: yv ?? schoolYearHint ?? guessSchoolYear(pubYear, t),
        ...(t ? { term: t } : {}),
        grade: g,
        ...(area ? { area } : {}),
        subject,
        n,
        avg: num(cell(iAvg)),
        sd: num(cell(iSd)),
        dist,
      });
    }
  }
  if (!rows.length) warnings.push("읽을 수 있는 성취도 표가 없어요. 학교알리미 '교과별 학업성취 사항'의 엑셀다운로드 파일인지 확인해 주세요.");
  if (!year) warnings.push("공시연도를 못 찾았어요. 아래에서 골라 주세요.");
  if (!schoolName) warnings.push("학교명을 못 찾았어요. 아래에서 골라 주세요.");
  // 파일에서 연도를 늦게 찾았으면 앞서 만든 행에도 반영
  if (year) for (const r of rows) if (r.year !== year && !r.term) r.year = year;
  return { fileName, schoolName, year, rows, warnings };
}
