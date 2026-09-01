/** 학교선택 분석지 — 타입 정의 */

export type SchoolGroup =
  | "동작구_고"
  | "동작구_중"
  | "송파구_고"
  | "송파구_중"
  | "관악구_고"
  | "서울_외고국제고"
  | "전국단위_자사고";

export const GROUP_LABEL: Record<SchoolGroup, string> = {
  동작구_고: "동작구 고등학교",
  동작구_중: "동작구 중학교",
  송파구_고: "송파구 고등학교",
  송파구_중: "송파구 중학교",
  관악구_고: "관악구 고등학교",
  서울_외고국제고: "서울 외고·국제고",
  전국단위_자사고: "전국단위 자사고",
};

/**
 * 공시층(FACT) — 학교알리미·NEIS 공시 원문.
 * 사람이 수정할 수 없다. 수집기만 쓴다.
 */
export interface SchoolFact {
  code: string;
  name: string;
  group: SchoolGroup;
  /** 초/중/고 구분 */
  level: "중" | "고";
  /** 일반고등학교 · 자율고등학교 · 특수목적고등학교 등 */
  kind: string | null;
  /** 공립 · 사립 · 국립 */
  foundation: string | null;
  /** 남 · 녀 · 남녀공학 */
  coed: string | null;
  address: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;

  /** 1학년 */
  g1Male: number | null;
  g1Female: number | null;
  g1Total: number | null;
  g1Classes: number | null;
  g1PerClass: number | null;

  /** 학교 전체 */
  studentsTotal: number | null;
  classesTotal: number | null;
  perClass: number | null;

  /** 고1 전출 (이탈 신호) */
  g1MovedOut: number | null;
  g1MoveBase: number | null;

  /** 졸업생 진로 — 고등학교는 대학 진학, 중학교는 고교 유형 */
  grad: number | null;
  path1: number | null; // 고: 전문대 / 중: 일반고
  path2: number | null; // 고: 4년제 / 중: 특성화고
  path3: number | null; // 고: 국외진학 / 중: 특목고
  employed: number | null;
  other: number | null;
  advanceRate: number | null;
  /** 전년도 값 — 이상치 검사용 */
  path2Prev: number | null;
  path1Prev: number | null;

  /** 교육운영 특색사업 */
  subjectClassroom: string | null; // 교과교실제
  autonomousSchool: string | null; // 자율학교
  leveledClass: string | null; // 수준별 수업

  /** 공시 기준 */
  disclosureYear: string;
  pathYear: string | null;
  fetchedAt: string;
}

export type DifficultyLevel = "기초" | "보통" | "상" | "최상";

export interface SignatureQuestion {
  title: string;
  note: string;
  /** src/lib/question-types/school.ts 의 QuestionType.id */
  generatorTypeId?: string;
  imageUrl?: string;
}

/**
 * 관측층(OBS) — 옳은영어가 직접 관측한 것.
 * 공시에 없다. 학원의 1차 자산.
 */
export interface SchoolObservation {
  schoolName: string;
  character: string;
  difficulty: {
    국어: DifficultyLevel;
    영어: DifficultyLevel;
    수학: DifficultyLevel;
    사회: DifficultyLevel;
    과학: DifficultyLevel;
    comment?: string;
  };
  examScope: { term: string; scope: string }[];
  cutoff: { basis: string; grade1: string; grade2: string };
  features: string[];
  signatures: SignatureQuestion[];
  /** 판단층(VIEW) — 사실이 아니라 학원의 견해 */
  fit: string[];
}

/**
 * 학원 실적 — 분모가 두 종류라 반드시 구분해서 표기한다.
 * schoolTop: 학교 전체 1등급 중 우리 학원생이 차지한 비율
 * enrolled:  우리 재원생 중 1등급을 받은 비율
 */
export interface AcademyResult {
  schoolCode: string;
  label: string;
  grade: number;
  basis: "schoolTop" | "enrolled";
  percent: number;
  term: string;
}

export interface SchoolRecord {
  fact: SchoolFact;
  observation?: SchoolObservation;
  results?: AcademyResult[];
}
