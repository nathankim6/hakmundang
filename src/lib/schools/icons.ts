import type { IconName } from "@/assets/art";
import type { NewsKind } from "@/data/news";

/** 소식 종류별 아이콘. 웹(Sourced.tsx)과 PPT(deck.ts)가 같은 표를 쓴다. */
export const NEWS_KIND_ICON: Record<NewsKind, IconName> = {
  news: "news",
  curriculum: "layers",
  results: "trophy",
  life: "tray",
  program: "sparkle",
  english: "abc",
  freeSemester: "compass",
  admission: "gradcap",
};

/** 소식은 이 순서로 보인다. 학교 소식이 먼저, 생활이 마지막. */
export const NEWS_KIND_ORDER: NewsKind[] = ["news", "curriculum", "english", "program", "freeSemester", "results", "admission", "life"];

/** 선배 TMI 한 줄을 읽고 어울리는 아이콘을 고른다. 못 찾으면 말풍선. */
export function tmiIcon(t: string): IconName {
  if (/급식|밥|식당|메뉴|점심/.test(t)) return "tray";
  if (/매점|편의점|간식|자판기/.test(t)) return "store";
  if (/계단|층|엘리베이터|건물|언덕/.test(t)) return "stairs";
  if (/교복|생활복|체육복|복장|두발|머리|화장/.test(t)) return "shirt";
  if (/통학|버스|지하철|거리|등교|하교|셔틀/.test(t)) return "bus";
  if (/야자|자습|독서실|도서관|공부/.test(t)) return "lamp";
  if (/체육|운동|축구|농구|체전|운동장/.test(t)) return "ball";
  if (/동아리|축제|행사|수학여행|공연/.test(t)) return "sparkle";
  if (/선생|쌤|담임|교사|교장/.test(t)) return "mic";
  if (/시험|내신|등급|점수|수행|숙제|과제/.test(t)) return "paper";
  if (/화장실|시설|에어컨|냉난방|와이파이|정수기/.test(t)) return "school";
  if (/영어|단어|문법|듣기|원어민/.test(t)) return "abc";
  if (/친구|분위기|남녀|여자|남자|선후배/.test(t)) return "family";
  return "speech";
}
