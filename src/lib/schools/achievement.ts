import type { AchievementRow, Letter, SchoolAchievement } from "@/types/achievement";

/**
 * 학업성취 지표.
 *
 * 공시가 주는 것: 과목별 수강자수 · 평균 · 표준편차 · 성취도 A~E 비율.
 * 우리가 얹는 것: 1등급 자리(수강자 × 10% 또는 4%, 소수점 버림)와 A 인원(수강자 × A비율).
 *   A 인원이 1등급 자리보다 많으면 90점을 넘겨도 1등급이 아닐 수 있다 → 컷이 90점 위.
 *   A 인원이 1등급 자리보다 적으면 90점만 넘으면 1등급 → 컷이 90점 아래.
 * 이 비교 하나로 '1등급 컷이 어디쯤인가'를 공시 숫자만으로 말할 수 있다.
 */

export type Subject3 = "국어" | "영어" | "수학";
export const SUBJECTS3: Subject3[] = ["국어", "영어", "수학"];
export const LETTERS: Letter[] = ["A", "B", "C", "D", "E"];

export function subject3Of(name: string, area?: string): Subject3 | null {
  const s = `${area ?? ""} ${name}`;
  if (/영어|English/i.test(s)) return "영어";
  if (/수학|미적분|확률|기하|대수|Math/i.test(s)) return "수학";
  if (/국어|화법|작문|언어와|매체|독서|문학|문법/.test(s)) return "국어";
  return null;
}

/** 5등급제는 2025학년도 고1부터 학년을 따라 올라간다. */
export function isFiveGrade(schoolYear: number, grade: number): boolean {
  return schoolYear - (grade - 1) >= 2025;
}

export function seatsFor(n: number, five: boolean): number {
  return Math.floor((n * (five ? 10 : 4)) / 100);
}

export function aCountOf(r: AchievementRow): number {
  return Math.round((r.n * r.dist.A) / 100);
}

export interface SubjectPoint {
  schoolYear: number;
  year: number;
  term?: string;
  subject: string;
  n: number;
  avg: number | null;
  sd: number | null;
  dist: Record<Letter, number>;
  five: boolean;
  seats: number;
  aCount: number;
  /** A 인원 − 1등급 자리. 양수면 컷이 90점 위 */
  gap: number;
}

function toPoint(r: AchievementRow): SubjectPoint {
  const five = isFiveGrade(r.schoolYear, r.grade);
  const seats = seatsFor(r.n, five);
  const aCount = aCountOf(r);
  return { schoolYear: r.schoolYear, year: r.year, term: r.term, subject: r.subject, n: r.n, avg: r.avg, sd: r.sd, dist: r.dist, five, seats, aCount, gap: aCount - seats };
}

/**
 * 학년·과목군별로 학년도마다 대표 행 하나를 고른다.
 * 같은 학년도에 공통국어1·2, 1·2학기처럼 여러 행이 있으면 수강자가 가장 많은 행(대개 1학기 첫 과목).
 */
export function seriesOf(sa: SchoolAchievement, subject: Subject3, grade = 1): SubjectPoint[] {
  const byYear = new Map<number, AchievementRow>();
  for (const r of sa.rows) {
    if (r.grade !== grade || subject3Of(r.subject, r.area) !== subject) continue;
    const prev = byYear.get(r.schoolYear);
    if (!prev || r.n > prev.n || (r.n === prev.n && (r.term ?? "") < (prev.term ?? ""))) byYear.set(r.schoolYear, r);
  }
  return [...byYear.values()].sort((a, b) => a.schoolYear - b.schoolYear).map(toPoint);
}

export function gradesOf(sa: SchoolAchievement): number[] {
  return [...new Set(sa.rows.map((r) => r.grade))].sort();
}

export function yearsOf(sa: SchoolAchievement): number[] {
  return [...new Set(sa.rows.map((r) => r.schoolYear))].sort();
}

/* ── 학교 프로필(우리 생각) ────────────────── */

export type SchoolType = "thick" | "steep" | "flat" | "standard";

export interface AchievementProfile {
  grade: number;
  latestYear: number;
  /** 과목별 최신 점 */
  latest: Partial<Record<Subject3, SubjectPoint>>;
  /** 과목별 3개년 */
  series: Record<Subject3, SubjectPoint[]>;
  type: SchoolType;
  /** 국영수 평균 A비율(최신) */
  aMean: number | null;
  avgMean: number | null;
  sdMean: number | null;
  /** 컷이 90점 위인 과목 수 */
  above90: number;
  /** A비율이 가장 낮은 과목(등급 가르는 과목) */
  keySubject: Subject3 | null;
  /** 3개년 A비율 변화(첫 해 → 마지막 해), 과목 평균 */
  trend: { from: number; to: number; dir: "up" | "down" | "flat" } | null;
}

const mean = (xs: (number | null | undefined)[]) => {
  const v = xs.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

export function profileOf(sa: SchoolAchievement, grade?: number): AchievementProfile | null {
  const grades = gradesOf(sa);
  if (!grades.length) return null;
  const g = grade ?? (grades.includes(1) ? 1 : grades[0]);
  const series = { 국어: seriesOf(sa, "국어", g), 영어: seriesOf(sa, "영어", g), 수학: seriesOf(sa, "수학", g) };
  const years = [...new Set(SUBJECTS3.flatMap((s) => series[s].map((p) => p.schoolYear)))].sort();
  if (!years.length) return null;
  const latestYear = years[years.length - 1];
  const latest: Partial<Record<Subject3, SubjectPoint>> = {};
  for (const s of SUBJECTS3) {
    const p = series[s].find((x) => x.schoolYear === latestYear) ?? series[s][series[s].length - 1];
    if (p) latest[s] = p;
  }
  const pts = SUBJECTS3.map((s) => latest[s]).filter(Boolean) as SubjectPoint[];
  const aMean = mean(pts.map((p) => p.dist.A));
  const avgMean = mean(pts.map((p) => p.avg));
  const sdMean = mean(pts.map((p) => p.sd));
  const above90 = pts.filter((p) => p.gap > 0).length;

  let type: SchoolType = "standard";
  if (aMean != null && aMean >= 15 && above90 >= Math.ceil(pts.length / 2)) type = "thick";
  else if (avgMean != null && sdMean != null && avgMean <= 62 && sdMean >= 19) type = "steep";
  else if (avgMean != null && sdMean != null && avgMean >= 72 && sdMean <= 15) type = "flat";

  let keySubject: Subject3 | null = null;
  let minA = Infinity;
  for (const s of SUBJECTS3) {
    const p = latest[s];
    if (p && p.dist.A < minA) {
      minA = p.dist.A;
      keySubject = s;
    }
  }

  let trend: AchievementProfile["trend"] = null;
  if (years.length >= 2) {
    const first = years[0];
    const fromPts = SUBJECTS3.map((s) => series[s].find((p) => p.schoolYear === first)?.dist.A);
    const from = mean(fromPts);
    if (from != null && aMean != null) {
      const d = aMean - from;
      trend = { from, to: aMean, dir: d >= 2 ? "up" : d <= -2 ? "down" : "flat" };
    }
  }
  return { grade: g, latestYear, latest, series, type, aMean, avgMean, sdMean, above90, keySubject, trend };
}

/** 표에 쓰는 한 줄 — "18.2% · 41명" 처럼 */
export const pct = (v: number | null | undefined, d = 1) => (v == null ? "—" : `${v.toFixed(d)}%`);
export const fix = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toFixed(d));
