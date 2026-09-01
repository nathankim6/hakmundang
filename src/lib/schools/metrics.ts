import type { SchoolFact } from "@/types/school";

/**
 * 2025학년도 고1부터 적용되는 5등급제 누적 비율(%).
 * 1등급 10 · 2등급 34 · 3등급 66 · 4등급 90 · 5등급 100
 */
export const GRADE_BANDS = [
  { grade: 1, cumulative: 10 },
  { grade: 2, cumulative: 34 },
  { grade: 3, cumulative: 66 },
  { grade: 4, cumulative: 90 },
  { grade: 5, cumulative: 100 },
] as const;

/**
 * 누적 인원 = floor(N × 누적비율 / 100).
 *
 * 석차등급은 학생의 석차백분율이 그 등급의 누적 비율 "이하"일 때 부여된다.
 * k등이 1등급이려면 k/N ≤ 0.1 이므로 1등급 인원은 floor(0.1N)이고 반올림이 아니다.
 * 예: 수강자 167명이면 16명이다. 17등은 17/167 = 10.18%로 2등급이다.
 *
 * 정수 연산으로 계산해 부동소수점 오차를 없앤다.
 */
function cumulativeSeats(enrolled: number, cumulativePercent: number): number {
  return Math.floor((enrolled * cumulativePercent) / 100);
}

/**
 * 1등급 자리 수.
 *
 * 석차등급은 학년 정원이 아니라 **과목별 수강자 수** 기준이다.
 * 공통과목은 학년 전체가 수강하므로 정원과 같지만, 선택과목은 수강자 수가 분모다.
 * 그래서 이 함수는 "정원"이 아니라 "수강자 수"를 받는다.
 */
export function seatsForGrade1(enrolled: number): number {
  if (!enrolled || enrolled <= 0) return 0;
  return cumulativeSeats(enrolled, 10);
}

/** 등급별 인원과 누적 — seatsForGrade1과 같은 산식을 쓴다 */
export function gradeSeats(enrolled: number) {
  if (!enrolled || enrolled <= 0) return [];
  let prev = 0;
  return GRADE_BANDS.map((b) => {
    const cum = cumulativeSeats(enrolled, b.cumulative);
    const seats = cum - prev;
    prev = cum;
    return { grade: b.grade, seats, cumulative: cum, percent: b.cumulative };
  });
}

/**
 * 소인수 과목 경고.
 *
 * floor 기준이므로 수강자가 10명 미만이면 1등급 자리가 아예 0이고,
 * 10의 배수 직전(끝자리 9)에서는 한 명만 더 들어와도 자리가 하나 늘어난다.
 */
export function smallClassWarning(enrolled: number): string | null {
  if (!enrolled || enrolled <= 0) return null;
  const seats = seatsForGrade1(enrolled);
  if (seats === 0) {
    return `수강자 ${enrolled}명이면 상위 10%에 드는 자리가 없습니다. 소인수 과목은 등급이 안 나올 수 있어요.`;
  }
  if (seats === 1) {
    return `수강자 ${enrolled}명이면 1등급은 딱 1명입니다.`;
  }
  if (enrolled % 10 === 9) {
    return `수강자 ${enrolled}명은 경계예요. 한 명만 더 들어오면 ${seats + 1}자리가 됩니다.`;
  }
  if (enrolled % 10 === 0) {
    return `수강자 ${enrolled}명은 경계예요. 한 명만 빠져도 ${seats - 1}자리가 됩니다.`;
  }
  return null;
}

/** 고1 이탈률(%) — 순수 공시값의 나눗셈 */
export function dropoutRate(f: SchoolFact): number | null {
  // 전출 0명은 "자료 없음"이 아니라 0%다. falsy 검사를 쓰면 안 된다.
  if (f.g1MovedOut == null || !f.g1MoveBase) return null;
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

/**
 * 졸업생 진로 — 학교급별 해석.
 *
 * 공시 원본은 슬롯(p3~p14)으로 오고 슬롯의 뜻이 학교급마다 다르다.
 * 해석은 여기 한 곳에서만 한다. 매핑이 틀리면 이 함수만 고치면 된다.
 *
 * 근거
 *  - 고등학교: 서울 283개교에서 진학자계 = p3+p4+p5+p6 항등식이 전건 일치.
 *    공시 정의는 전문대학 / 대학교 / 국외진학.
 *  - 중학교: 시도교육청 「초·중등학교 정보공시 시스템 매뉴얼」 부록의 입력표로 12개 열이 확정된다.
 *    p3 일반고 · p4 특성화고 · p5 과학고 · p6 외국어고·국제고 · p7 예술고·체육고 ·
 *    p8 마이스터고 · p9 자율형사립고 · p10 자율형공립고 · p11 기타(영재학교·각종학교 등) ·
 *    p12 취업자 · p13 대안교육기관진학 · p14 무직자및미상.
 *    소계는 응답에 없고 12개가 서로 배타적이다(전국 3,475건 중 99.7%에서 p3~p14 합 = 졸업자).
 *    서울체육중이 p7에 51명 중 40명, 예원학교·선화예술중도 p7에 몰리는 것이 예술·체육고 합산 열임을 뒷받침한다.
 */
export interface PathSlice {
  key: string;
  label: string;
  count: number;
  percent: number;
  /** 설명회에서 강조할 항목 */
  emphasis?: boolean;
}

export function pathBreakdown(f: SchoolFact): PathSlice[] | null {
  if (!f.grad) return null;
  const pct = (v: number | null) => ((v ?? 0) / f.grad) * 100;
  const slice = (key: string, label: string, v: number | null, emphasis?: boolean): PathSlice => ({
    key,
    label,
    count: v ?? 0,
    percent: pct(v),
    emphasis,
  });

  if (f.level === "고") {
    return [
      slice("uni4", "4년제", f.p4, true),
      slice("college", "전문대", f.p3),
      slice("abroad", "국외", f.p6),
      slice("employed", "취업", f.p7),
      slice("other", "기타", f.p8),
    ].filter((s) => s.count > 0 || s.emphasis);
  }

  const special = (f.p5 ?? 0) + (f.p6 ?? 0) + (f.p7 ?? 0) + (f.p8 ?? 0);
  const autonomous = (f.p9 ?? 0) + (f.p10 ?? 0); // 자사고 + 자공고
  const named = [
    slice("general", "일반고", f.p3, true),
    slice("autonomous", "자율고", autonomous, true),
    slice("special", "특목고", special, true),
    slice("vocational", "특성화고", f.p4),
  ];
  // 남는 인원(기타·취업·대안교육·미상)은 하나로 묶는다. 합이 100%가 되어야 한다.
  const rest = f.grad - named.reduce((a, b) => a + b.count, 0);
  const out = [...named];
  if (rest > 0) out.push(slice("rest", "그 외", rest));
  return out.filter((s) => s.count > 0 || s.emphasis);
}

/** 중학교 전용 — 특목고 세부 */
export function specialHighDetail(f: SchoolFact) {
  if (f.level !== "중" || !f.grad) return null;
  const items = [
    { key: "science", label: "과학고", count: f.p5 ?? 0 },
    { key: "foreign", label: "외고·국제고", count: f.p6 ?? 0 },
    { key: "arts", label: "예술·체육고", count: f.p7 ?? 0 },
    { key: "meister", label: "마이스터고", count: f.p8 ?? 0 },
  ];
  const total = items.reduce((a, b) => a + b.count, 0);
  if (!total) return null;
  return { items: items.filter((i) => i.count > 0), total, percent: (total / f.grad) * 100 };
}

/** 비교표에 쓸 대표 진로 지표 — 학교급별로 다르다 */
export function headlinePath(f: SchoolFact): { label: string; value: number | null } {
  if (f.level === "고") {
    return { label: "4년제", value: f.grad ? ((f.p4 ?? 0) / f.grad) * 100 : null };
  }
  const special = (f.p5 ?? 0) + (f.p6 ?? 0) + (f.p7 ?? 0) + (f.p8 ?? 0);
  const autonomous = (f.p9 ?? 0) + (f.p10 ?? 0);
  return {
    label: "특목·자율고",
    value: f.grad ? ((special + autonomous) / f.grad) * 100 : null,
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

  const headline =
    f.level === "고"
      ? { name: "4년제 진학", now: f.p4, prev: f.p4Prev }
      : { name: "일반고 진학", now: f.p3, prev: f.p3Prev };
  // 상대변화만 보면 분모가 작은 학교가 무더기로 걸린다(2→9 = +350%).
  // 절대 인원 변화가 학년 규모에 견줘 의미 있을 때만 경고한다.
  if (headline.now != null && headline.prev != null && headline.prev > 0) {
    const change = (headline.now - headline.prev) / headline.prev;
    const absChange = Math.abs(headline.now - headline.prev);
    const scale = f.grad ?? f.gradPrev ?? 0;
    const meaningful = absChange >= 20 || (scale > 0 && absChange / scale >= 0.15);
    if (Math.abs(change) > 0.5 && meaningful) {
      out.push({
        field: headline.name,
        message: `전년 대비 ${change > 0 ? "+" : ""}${Math.round(change * 100)}% (${headline.prev} → ${headline.now}명). 공시 원문 확인이 필요합니다.`,
      });
    }
  }

  // 전문대와 4년제가 뒤바뀐 것으로 의심되는 경우
  if (
    f.level === "고" &&
    f.p3 != null &&
    f.p4 != null &&
    f.p3Prev != null &&
    f.p4Prev != null &&
    f.p4Prev > f.p3Prev &&
    f.p3 > f.p4
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
