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

  /** 주당 수업시수 */
  weeklyHours: number | null;

  /**
   * 졸업생 진로 — 공시 원본 슬롯을 그대로 보존한다.
   * 슬롯의 의미가 학교급마다 다르므로 해석은 metrics.ts 한 곳에서만 한다.
   *   고등학교 p3 전문대 · p4 4년제 · p6 국외 · p7 취업 · p8 기타
   *   중학교   p3 일반고 · p4 특성화고 · p5~p8 특수목적고 세부 · p9 자율고 …
   */
  grad: number | null;
  gradPrev: number | null;
  p3: number | null; p3Prev: number | null;
  p4: number | null; p4Prev: number | null;
  p5: number | null; p5Prev: number | null;
  p6: number | null; p6Prev: number | null;
  p7: number | null; p7Prev: number | null;
  p8: number | null; p8Prev: number | null;
  p9: number | null; p9Prev: number | null;
  p10: number | null; p10Prev: number | null;
  p11: number | null; p11Prev: number | null;
  p12: number | null; p12Prev: number | null;
  p13: number | null; p13Prev: number | null;
  p14: number | null; p14Prev: number | null;

  /** 교육운영 특색사업 — 공시에서 ○/× 로 온다 */
  subjectClassroom: boolean | null; // 교과교실제
  autonomousSchool: boolean | null; // 자율학교
  leveledClass: boolean | null; // 수준별 이동수업

  /** 방과후학교 */
  afterSchoolPrograms: number | null;
  afterSchoolStudents: number | null;

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
  /** 고등학교 전용 — 중학교는 석차등급이 없다 */
  cutoff: { basis: string; grade1: string; grade2: string };
  /** 중학교 전용 — 성취도 A 비율과 시험 운영 */
  middle?: {
    /** 영어 성취도 A 비율(%) — 공시에 없어 학원이 관측한 값 */
    aRatio: string;
    /** 지필 : 수행 비율 */
    ratio: string;
    /** 자유학기·자유학년으로 지필평가가 없는 학기 */
    freeSemester: string;
    /** 교과서 출판사 */
    textbook: string;
  };
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
  /**
   * 출처층(SOURCED) — 블로그·설명회 등 공개된 자료를 출처와 함께 옮긴 것.
   * 정의는 src/data/sourced.ts. 모든 항목에 url·날짜가 붙는다.
   */
  sourced?: import("@/data/sourced").SourcedSchool;
}
