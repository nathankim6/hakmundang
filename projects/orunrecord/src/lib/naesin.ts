import naesinData from "@/data/naesin.json";

export type Record2526 = {
  이름: string;
  학교: string;
  학년?: string;
  강사: string;
  점수: string;
  등급?: string;
  시험일?: string;
};

export type RecordYearly = {
  학교학년: string;
  이름: string;
  "1학기중간"?: string;
  "1학기기말"?: string;
  "2학기중간"?: string;
  "2학기기말"?: string;
};

export type DataShape = {
  [key: string]: Record2526[] | RecordYearly[];
};

export const DATA = naesinData as unknown as DataShape;

export const PERIODS = [
  { key: "26년_1중간", label: "2026 1학기 중간", year: "2026" },
  { key: "25년_2기말", label: "2025 2학기 기말", year: "2025" },
  { key: "25년_2중간", label: "2025 2학기 중간", year: "2025" },
  { key: "25년_1기말", label: "2025 1학기 기말", year: "2025" },
  { key: "25년_1중간", label: "2025 1학기 중간", year: "2025" },
] as const;

export type ScoreTier = "perfect" | "high" | "mid" | "low" | "veryLow" | "none";

export function scoreTier(val?: string): ScoreTier {
  if (!val || val === "-") return "none";
  const n = parseInt(val);
  if (isNaN(n)) return "none";
  if (n === 100) return "perfect";
  if (n >= 90) return "high";
  if (n >= 80) return "mid";
  if (n >= 70) return "low";
  return "veryLow";
}

export const tierStyles: Record<ScoreTier, { text: string; bg: string; ring: string; label: string }> = {
  perfect: { text: "text-score-perfect", bg: "bg-score-perfect-bg", ring: "ring-score-perfect/20", label: "100점" },
  high: { text: "text-score-high", bg: "bg-score-high-bg", ring: "ring-score-high/20", label: "90점대" },
  mid: { text: "text-score-mid", bg: "bg-score-mid-bg", ring: "ring-score-mid/20", label: "80점대" },
  low: { text: "text-score-low", bg: "bg-score-low-bg", ring: "ring-score-low/20", label: "70점대" },
  veryLow: { text: "text-score-veryLow", bg: "bg-score-veryLow-bg", ring: "ring-score-veryLow/20", label: "70점 미만" },
  none: { text: "text-score-none", bg: "bg-score-none-bg", ring: "ring-score-none/20", label: "미응시" },
};

export function matchRecord(record: Record<string, unknown>, q: string): boolean {
  if (!q) return true;
  const str = JSON.stringify(record).toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => str.includes(w));
}

/**
 * 강사 이름을 정규화합니다.
 * - 모든 공백 제거
 * - 끝의 'T' / 't' / '쌤' / '선생' / '선생님' 접미사 제거
 * - 영문은 소문자화
 * 예) "Gina T", "GinaT", "gina t" → "gina"
 *     "고영균T", "고영균 T", "고영균쌤" → "고영균"
 */
export function normalizeTeacher(name?: string): string {
  if (!name) return "";
  let s = String(name).replace(/\s+/g, "");
  s = s.replace(/(선생님|선생|쌤)$/u, "");
  s = s.replace(/[Tt]$/u, "");
  return s.toLowerCase();
}

export function teachersEqual(a?: string, b?: string): boolean {
  const na = normalizeTeacher(a);
  const nb = normalizeTeacher(b);
  return !!na && na === nb;
}

/**
 * 학교명 표시용 정규화: 마지막 글자가 "중"이 아니면 "중"을 붙입니다.
 * - "강남중학교" → "강남중학교" (그대로)
 * - "강남중"     → "강남중"
 * - "숭의여자"   → "숭의여자중"
 * - "-" / 빈값   → 빈 문자열
 */
export function formatSchoolName(name?: string): string {
  if (!name) return "";
  const s = String(name).trim();
  if (!s || s === "-") return "";
  if (/중(학교)?$/.test(s)) return s;
  return s + "중";
}

/**
 * "학교학년"이 합쳐진 문자열을 정규화합니다.
 * 학교명 부분만 추출해 "중" 보정 후 학년 표기를 다시 붙입니다.
 * 예) "강남중1"   → "강남중 1학년"
 *     "숭의여자2" → "숭의여자중 2학년"
 *     "강남중 1학년" → "강남중 1학년" (그대로)
 *     "강남"     → "강남중"
 */
export function formatSchoolGrade(value?: string): string {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw || raw === "-") return "";
  // 학년 토큰 추출: 끝의 "1학년" / "1" / "(1)" 등
  const m = raw.match(/^(.*?)[\s·,\-]*([1-3])\s*학년?\s*$/);
  if (m) {
    const schoolPart = m[1].trim();
    const grade = m[2];
    const school = formatSchoolName(schoolPart);
    return school ? `${school} ${grade}학년` : `${grade}학년`;
  }
  return formatSchoolName(raw);
}

/**
 * 시험일의 월에 따라 시험명을 자동 보정합니다.
 * 4·5월 → 1학기 중간, 6·7월 → 1학기 기말,
 * 9·10월 → 2학기 중간, 11·12월 → 2학기 기말.
 * 매칭되지 않으면 fallback 라벨을 사용합니다.
 */
export function examNameFromDate(date?: string): string | null {
  if (!date) return null;
  const m = date.match(/(\d{1,2})\s*[\/\-월\.]/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  if (month === 4 || month === 5) return "1학기 중간";
  if (month === 6 || month === 7) return "1학기 기말";
  if (month === 9 || month === 10) return "2학기 중간";
  if (month === 11 || month === 12) return "2학기 기말";
  return null;
}

export function periodLabelFor(year: string, date: string | undefined, fallback: string): string {
  const exam = examNameFromDate(date);
  if (!exam) return fallback;
  return `${year} ${exam}`;
}

/**
 * "YYYY N학기 중간|기말" 형식의 시험명을 시간순 정렬 가능한 숫자로 변환합니다.
 * 빠른 시험일수록 작은 값을 반환합니다.
 */
export function periodSortKey(label: string): number {
  const m = label.match(/(\d{4})\s*(\d)학기\s*(중간|기말)/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const year = parseInt(m[1], 10);
  const sem = parseInt(m[2], 10); // 1 or 2
  const stage = m[3] === "중간" ? 0 : 1;
  return year * 100 + (sem - 1) * 10 + stage * 5;
}

export type StudentSummary = {
  name: string;
  school: string;
  grade: string;
  teacher: string;
  records: { period: string; score: string; school: string; teacher: string; grade: string }[];
};

export function buildStudentSummaries(q: string): StudentSummary[] {
  if (!q) return [];
  const map: Record<string, StudentSummary> = {};

  const add = (name: string, school: string, grade: string, teacher: string, periodLabel: string, score: string) => {
    if (!map[name]) map[name] = { name, school, grade, teacher, records: [] };
    if (school && school !== "-") map[name].school = school;
    if (grade && grade !== "-") map[name].grade = grade;
    if (teacher && teacher !== "-") map[name].teacher = teacher;
    map[name].records.push({ period: periodLabel, score: String(score || "-"), school: school || "", teacher: teacher || "", grade: grade || "" });
  };

  PERIODS.forEach((p) => {
    (DATA[p.key] as Record2526[] | undefined)?.forEach((r) => {
      if (!r.이름 || !matchRecord(r as unknown as Record<string, unknown>, q)) return;
      add(r.이름, r.학교 || "", r.학년 || "", r.강사 || "", periodLabelFor(p.year, r.시험일, p.label), r.점수);
    });
  });

  (["2024년", "2023년"] as const).forEach((yr) => {
    const yLabel = yr.replace("년", "");
    (DATA[yr] as RecordYearly[] | undefined)?.forEach((r) => {
      if (!r.이름 || !matchRecord(r as unknown as Record<string, unknown>, q)) return;
      const cols: [keyof RecordYearly, string][] = [
        ["1학기중간", `${yLabel} 1학기 중간`],
        ["1학기기말", `${yLabel} 1학기 기말`],
        ["2학기중간", `${yLabel} 2학기 중간`],
        ["2학기기말", `${yLabel} 2학기 기말`],
      ];
      cols.forEach(([col, label]) => {
        const v = r[col];
        if (v && v !== "-") {
          // "장승중 2학년" → "2학년" 추출
          const gm = String(r.학교학년 || "").match(/([1-3])\s*학년/);
          const gradeStr = gm ? `${gm[1]}학년` : "";
          add(r.이름, r.학교학년 || "", gradeStr, "", label, v as string);
        }
      });
    });
  });

  const list = Object.values(map);
  list.forEach((s) => s.records.sort((a, b) => periodSortKey(a.period) - periodSortKey(b.period)));
  return list;
}

export type TeacherEntry = {
  name: string;
  school: string;
  grade: string;
  period: string;
  score: string;
};

export type TeacherSummary = {
  teacher: string;
  entries: TeacherEntry[];
  studentCount: number;
  avg: number | null;
  perfectCount: number;
};

/**
 * 2025/2026 데이터에서 강사 목록을 집계합니다.
 * 동일인은 정규화 키로 합치고, 가장 자주 등장한 원본 표기를 대표 이름으로 사용합니다.
 */
export function getAllTeachers(): string[] {
  const counts: Record<string, Record<string, number>> = {}; // norm -> { original: count }
  PERIODS.forEach((p) => {
    (DATA[p.key] as Record2526[] | undefined)?.forEach((r) => {
      const raw = r.강사;
      if (!raw || raw === "-") return;
      const key = normalizeTeacher(raw);
      if (!key) return;
      counts[key] = counts[key] || {};
      counts[key][raw] = (counts[key][raw] || 0) + 1;
    });
  });
  const display = Object.values(counts).map((variants) => {
    return Object.entries(variants).sort((a, b) => b[1] - a[1])[0][0];
  });
  return display.sort((a, b) => a.localeCompare(b, "ko"));
}

/** 특정 강사의 모든 시험 기록 집계 (동일인 표기 변형 모두 포함) */
export function buildTeacherSummary(teacher: string, q: string): TeacherSummary {
  const entries: TeacherEntry[] = [];
  const studentSet = new Set<string>();

  PERIODS.forEach((p) => {
    (DATA[p.key] as Record2526[] | undefined)?.forEach((r) => {
      if (!teachersEqual(r.강사, teacher)) return;
      if (q && !matchRecord(r as unknown as Record<string, unknown>, q)) return;
      const periodLabel = periodLabelFor(p.year, r.시험일, p.label);
      entries.push({
        name: r.이름 || "",
        school: r.학교 || "",
        grade: r.학년 || "",
        period: periodLabel,
        score: String(r.점수 || "-"),
      });
      if (r.이름) studentSet.add(r.이름);
    });
  });

  const nums = entries.map((e) => parseInt(e.score)).filter((n) => !isNaN(n));
  const avg = nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
  const perfectCount = entries.filter((e) => e.score === "100").length;

  return { teacher, entries, studentCount: studentSet.size, avg, perfectCount };
}

export type ScoreStats = {
  total: number;
  perfect: number;
  high: number; // 90점 이상 (100 포함)
  perfectPct: number;
  highPct: number;
};

function computeStats(scores: (string | undefined)[]): ScoreStats {
  const nums = scores
    .map((s) => parseInt(String(s ?? "")))
    .filter((n) => !isNaN(n));
  const total = nums.length;
  const perfect = nums.filter((n) => n === 100).length;
  const high = nums.filter((n) => n >= 90).length;
  return {
    total,
    perfect,
    high,
    perfectPct: total ? Math.round((perfect / total) * 1000) / 10 : 0,
    highPct: total ? Math.round((high / total) * 1000) / 10 : 0,
  };
}

/** 단일 시험(2025/2026 키)의 통계 */
export function statsForExam(key: string): ScoreStats {
  const arr = (DATA[key] as Record2526[] | undefined) || [];
  return computeStats(arr.map((r) => r.점수));
}

/** 2024/2023 연도 데이터에서 특정 학기 통계 */
export function statsForYearly(yearKey: "2024년" | "2023년", periodCol: keyof RecordYearly): ScoreStats {
  const arr = (DATA[yearKey] as RecordYearly[] | undefined) || [];
  return computeStats(arr.map((r) => r[periodCol] as string | undefined));
}

/** 모든 시험 전체를 통합한 통계 */
export function statsOverall(): ScoreStats {
  const all: (string | undefined)[] = [];
  PERIODS.forEach((p) => {
    (DATA[p.key] as Record2526[] | undefined)?.forEach((r) => all.push(r.점수));
  });
  (["2024년", "2023년"] as const).forEach((yk) => {
    (DATA[yk] as RecordYearly[] | undefined)?.forEach((r) => {
      (["1학기중간", "1학기기말", "2학기중간", "2학기기말"] as const).forEach((c) => all.push(r[c]));
    });
  });
  return computeStats(all);
}
