/**
 * 학교 소식 — 밖에서 본 것.
 *
 * 학교 홈페이지·뉴스·학교알리미 공시 문서 등 학원 밖의 공개 자료를 옮긴다.
 * 출처 없는 항목은 넣지 않는다. 확인일은 fetchedAt 에 적는다.
 *
 * 채우는 방법: 리서치 결과 JSON을 이 파일의 NEWS 에 학교 코드별로 넣는다.
 */

import raw from "@/data/news.json";

export type NewsKind =
  | "news" // 학교 소식·지정·수상·시설
  | "curriculum" // 교육과정 편제(고교학점제·영어 선택과목 배치)
  | "results" // 학교가 공개한 대입·고입 실적
  | "life" // 급식·자습·통학·교복 등 생활
  | "program" // 특색 프로그램·동아리
  | "english" // 영어 교육 특징(중학교)
  | "freeSemester" // 자유학기·진로(중학교)
  | "admission"; // 전형(특목·자사고)

export interface NewsItem {
  kind: NewsKind;
  title: string;
  summary: string;
  /** YYYY-MM-DD 또는 YYYY-MM */
  date?: string;
  source: { url: string; publisher: string };
  confidence: "high" | "medium";
}

export interface SchoolNews {
  code: string;
  homepage?: string;
  /** 사실만 조합한 한 줄 */
  oneLiner?: string;
  items: NewsItem[];
  /** 조사일 */
  fetchedAt: string;
}

export const NEWS_KIND_LABEL: Record<NewsKind, string> = {
  news: "학교 소식",
  curriculum: "교육과정",
  results: "실적",
  life: "생활",
  program: "프로그램",
  english: "영어",
  freeSemester: "자유학기·진로",
  admission: "전형",
};


/** 학교 코드 → 소식. 리서치 결과를 변환 스크립트로 news.json 에 넣는다. */
export const NEWS: Record<string, SchoolNews> = raw as unknown as Record<string, SchoolNews>;

export function getNews(code: string): SchoolNews | undefined {
  return NEWS[code];
}
