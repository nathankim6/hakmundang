/**
 * 학업성취층 — 학교알리미 「교과별 학업성취 사항」 공시.
 *
 * 학교알리미 Open API에는 이 항목이 없고, 웹 화면은 자동수집을 막는 캡차 뒤에 있다.
 * 그래서 사람이 학교알리미에서 받은 엑셀을 프로그램에 불러온다. 숫자는 공시 원문 그대로다(FACT).
 *
 *  - year       공시연도(파일이 말하는 연도). 2026년 공시는 대개 2025학년도 성취를 담는다.
 *  - schoolYear 학년도. 파일에 학년도 열이 있으면 그 값, 없으면 학기로 추정한다.
 *  - dist       성취도 분포(%) A~E. 고교는 2014학년도부터 성취평가제, A는 90점 이상.
 */

export type Letter = "A" | "B" | "C" | "D" | "E";

export interface AchievementRow {
  /** 공시연도 */
  year: number;
  /** 학년도 */
  schoolYear: number;
  /** "1학기" | "2학기" | undefined */
  term?: string;
  grade: number;
  /** 교과(군) — 국어, 수학, 영어 … 파일에 있을 때만 */
  area?: string;
  /** 과목명 — 공통국어1, 국어, 영어Ⅰ … */
  subject: string;
  /** 수강자 수 */
  n: number;
  avg: number | null;
  sd: number | null;
  dist: Record<Letter, number>;
}

export interface AchievementFile {
  name: string;
  year: number;
  importedAt: string;
  rows: number;
}

export interface SchoolAchievement {
  code: string;
  schoolName: string;
  rows: AchievementRow[];
  files: AchievementFile[];
}

/** 파서가 파일 하나에서 읽어낸 것. 학교·연도는 못 찾을 수 있어 화면에서 고친다. */
export interface ParsedAchievement {
  fileName: string;
  schoolName?: string;
  year?: number;
  rows: AchievementRow[];
  warnings: string[];
}
