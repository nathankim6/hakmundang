import type { AcademyResult } from "@/types/school";

/**
 * 옳은영어 재원생 성적 실적.
 *
 * 분모가 두 종류다. 섞어 쓰면 과장광고가 되므로 반드시 구분해 표기한다.
 *  - schoolTop : 학교 전체 1등급 인원 중 옳은영어 재원생이 차지한 비율
 *  - enrolled  : 옳은영어 재원생 중 1등급을 받은 비율
 */
export const ACADEMY_RESULTS: AcademyResult[] = [
  {
    schoolCode: "S010006621",
    label: "흑석고 1학년",
    grade: 1,
    basis: "schoolTop",
    percent: 42,
    term: "2026년 1학기 기말고사",
  },
  {
    schoolCode: "S010000406",
    label: "당곡고 3학년",
    grade: 3,
    basis: "enrolled",
    percent: 71,
    term: "2026년 1학기 기말고사",
  },
  {
    schoolCode: "S010000497",
    label: "영등포고 1학년",
    grade: 1,
    basis: "enrolled",
    percent: 50,
    term: "2026년 1학기 기말고사",
  },
  {
    schoolCode: "S010005528",
    label: "구암고 1학년",
    grade: 1,
    basis: "enrolled",
    percent: 40,
    term: "2026년 1학기 기말고사",
  },
];

export const RESULT_BASIS_LABEL: Record<AcademyResult["basis"], string> = {
  schoolTop: "학교 1등급 중 옳은영어 재원생 비율",
  enrolled: "옳은영어 재원생 중 1등급 비율",
};

export const RESULT_BASIS_SHORT: Record<AcademyResult["basis"], string> = {
  schoolTop: "학교 1등급의",
  enrolled: "재원생의",
};
