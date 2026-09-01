import type { SchoolFact } from "@/types/school";

/**
 * 2025학년도 고1부터 적용되는 5등급제 비율.
 * 1등급 10% · 2등급 누적 34% · 3등급 66% · 4등급 90% · 5등급 100%
 */
export const GRADE_BANDS = [
  { grade: 1, cumulative: 0.1, band: 0.1 },
  { grade: 2, cumulative: 0.34, band: 0.24 },
  { grade: 3, cumulative: 0.66, band: 0.32 },
  { grade: 4, cumulative: 0.9, band: 0.24 },
  { grade: 5, cumulative: 1.0, band: 0.1 },
] as const;

/**
 * 1등급 자리 수.
 *
 * 석차등급은 학년 정원이 아니라 **과목별 수강자 수** 기준이다.
 * 공통과목은 학년 전체가 수강하므로 정원과 같지만, 선택과목은 수강자 수가 분모다.
 * 그래서 이 함수는 "정원"이 아니라 "수강자 수"를 받는다.
 */
export function seatsForGrade1(enrolled: number): number {
  if (!enrolled || enrolled <= 0) return 0;
  return Math.round(enrolled * 0.1);
}

/** 등급별 누적 인원 */
export function gradeSeats(enrolled: number) {
  if (!enrolled || enrolled <= 0) return [];
  let prev = 0;
  return GRADE_BANDS.map((b) => {
    const cum = Math.round(enrolled * b.cumulative);
    const seats = cum - prev;
    prev = cum;
    return { grade: b.grade, seats, cumulative: cum, percent: b.band * 100 };
  });
}

/**
 * 소인수 과목 경고.
 * 수강자가 적으면 반올림 한 명 차이로 자리가 갈리고,
 * 아주 적으면 석차등급 자체가 산출되지 않는다.
 */
export function smallClassWarning(enrolled: number): string | null {
  if (!enrolled || enrolled <= 0) return null;
  if (enrolled <= 13) return "수강자가 13명 이하면 1등급은 1명뿐입니다.";
  const exact = enrolled * 0.1;
  const frac = Math.abs(exact - Math.round(exact));
  if (frac > 0.4) {
    return `수강자 ${enrolled}명은 반올림 경계입니다. 한 명만 늘거나 줄어도 1등급 자리가 바뀝니다.`;
  }
  return null;
}

/** 고1 이탈률(%) — 순수 공시값의 나눗셈 */
export function dropoutRate(f: SchoolFact): number | null {
  if (!f.g1MovedOut || !f.g1MoveBase) return null;
  return (f.g1MovedOut / f.g1MoveBase) * 100;
}

/** 남녀 비율(%) */
export function genderSplit(f: SchoolFact): { male: number; female: number } | null {
  const m = f.g1Male ?? 0;
  const w = f.g1Female ?? 0;
  const t = m + w;
  if (!t) return null;
  return { male: Math.round((m / t) * 100), female: Math.round((w / t) * 100) };
}

/** 진로 구성비(%) — 고등학교 기준 */
export function pathMix(f: SchoolFact) {
  if (!f.grad) return null;
  const pct = (v: number | null) => (v == null ? null : (v / f.grad!) * 100);
  return {
    uni4: pct(f.path2),
    college: pct(f.path1),
    abroad: pct(f.path3),
    other: pct(f.other),
  };
}

/**
 * 이상치 검사.
 *
 * 공시데이터에는 학교가 잘못 입력한 값이 실제로 섞여 있다.
 * 예: 잠실여고 2025년 공시는 전문대 38.2% / 4년제 14.7%인데
 *     2024년은 14.0% / 42.6%였다 — 두 칸이 뒤바뀐 것으로 보인다.
 *
 * 그대로 발표 자료에 쓰면 특정 학교를 근거 없이 깎아내리게 되므로,
 * 차단이 아니라 "확인 요청"으로 표시한다.
 */
export interface Anomaly {
  field: string;
  message: string;
}

export function detectAnomalies(f: SchoolFact): Anomaly[] {
  const out: Anomaly[] = [];

  if (f.path2 != null && f.path2Prev != null && f.path2Prev > 0) {
    const change = (f.path2 - f.path2Prev) / f.path2Prev;
    if (Math.abs(change) > 0.5) {
      out.push({
        field: f.level === "고" ? "4년제 진학" : "일반고 진학",
        message: `전년 대비 ${change > 0 ? "+" : ""}${Math.round(change * 100)}% (${f.path2Prev} → ${f.path2}). 공시 원문 확인이 필요합니다.`,
      });
    }
  }

  // 전문대와 4년제가 뒤바뀐 것으로 의심되는 경우
  if (
    f.level === "고" &&
    f.path1 != null &&
    f.path2 != null &&
    f.path1Prev != null &&
    f.path2Prev != null &&
    f.path2Prev > f.path1Prev &&
    f.path1 > f.path2
  ) {
    out.push({
      field: "진로 구성",
      message: "전년과 전문대·4년제 크기가 역전되었습니다. 학교 입력 오류 가능성이 있습니다.",
    });
  }

  if (f.g1Total != null && f.studentsTotal != null && f.g1Total > f.studentsTotal) {
    out.push({
      field: "학생 수",
      message: "1학년 수가 전교생 수보다 많습니다.",
    });
  }

  return out;
}

/** 두 좌표 사이 거리(km) — 통학 거리용 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
