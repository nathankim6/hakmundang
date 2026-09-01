import raw from "@/data/schools.json";
import { ACADEMY_RESULTS } from "@/data/results";
import { getObservation, getObservations } from "@/lib/schools/store";
import type { SchoolFact, SchoolGroup, SchoolRecord } from "@/types/school";

const FACTS = raw as unknown as SchoolFact[];

/** 공시층 전체 */
export function allSchools(): SchoolFact[] {
  return FACTS;
}

/** 화면에 실제로 존재하는 카테고리만, 학교 수와 함께 */
export function groupsWithCounts(): { group: SchoolGroup; count: number }[] {
  const map = new Map<SchoolGroup, number>();
  for (const f of FACTS) map.set(f.group, (map.get(f.group) ?? 0) + 1);
  const order: SchoolGroup[] = [
    "동작구_고",
    "관악구_고",
    "송파구_고",
    "동작구_중",
    "송파구_중",
    "서울_외고국제고",
    "전국단위_자사고",
  ];
  return order
    .filter((g) => map.has(g))
    .map((group) => ({ group, count: map.get(group)! }));
}

export function schoolsInGroups(groups: SchoolGroup[]): SchoolFact[] {
  if (!groups.length) return [];
  const set = new Set(groups);
  return FACTS.filter((f) => set.has(f.group));
}

export function getRecord(code: string): SchoolRecord | undefined {
  const fact = FACTS.find((f) => f.code === code);
  if (!fact) return undefined;
  return {
    fact,
    observation: getObservation(code),
    results: ACADEMY_RESULTS.filter((r) => r.schoolCode === code),
  };
}

export function getRecords(codes: string[]): SchoolRecord[] {
  return codes
    .map((c) => getRecord(c))
    .filter((r): r is SchoolRecord => Boolean(r));
}

/** 관측 자료가 있는 학교 — 분석지에서 상세 페이지를 만들 수 있는 학교 */
export function hasObservation(code: string): boolean {
  return Boolean(getObservations()[code]);
}

export function observedCount(codes: string[]): number {
  return codes.filter(hasObservation).length;
}

/** 학원 위치 — 통학거리 계산 기준점 (동작구 상도동) */
export const ACADEMY_LOCATION = { lat: 37.5024, lng: 126.9484, name: "옳은영어" };
