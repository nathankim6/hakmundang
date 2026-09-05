export interface RCChoice {
  label: string; // ①, ②, ③, ④, ⑤
  text: string;
  percentage?: string; // 오답률
}

export interface RCVocabItem {
  english: string;
  korean: string;
}

export interface RCQuestion {
  id: number; // 문제 번호 (1~160+)
  year?: string; // 출처 (예: "2013년 3월 34번")
  errorRate?: string; // 오답률 (예: "57.5%")
  questionType: string; // 문제 유형 (빈칸, 어법, 순서 등)
  passage: string; // 지문
  choices: RCChoice[];
  answer: string; // 정답 (예: "③")
  translation: string; // 해석
  explanation: string; // 해설/문제풀이
  vocabulary: RCVocabItem[];
}

/**
 * Weekly RC assignment: 8 questions per week
 * First 4 appear after sentences 1-45
 * Last 4 appear after sentences 46-90
 */
export interface WeeklyRCData {
  weekNumber: number;
  firstHalf: RCQuestion[]; // 4 questions after sentences 1-45
  secondHalf: RCQuestion[]; // 4 questions after sentences 46-90
}
