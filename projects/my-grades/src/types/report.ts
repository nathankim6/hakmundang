export interface QuestionAnswer {
  questionNumber: number;
  questionType: string;
  isCorrect: boolean;
  isSubjective: boolean;
  partialScore?: number; // 부분점수 (조건영작용, 0-10)
}

export interface StudentAnswers {
  vocabulary: QuestionAnswer[];
  grammar: QuestionAnswer[];
  reading: QuestionAnswer[];
  writing: QuestionAnswer[];
  writingArray: QuestionAnswer[];  // 배열영작
  writingConditional: QuestionAnswer[];  // 조건영작
}

export interface StudentScore {
  name: string;
  grade?: string;
  level?: string;
  className?: string;
  classCode?: string; // 소속반 코드 (예: 1FO, 1AD, 2INTER)
  vocabulary: number;
  grammar: number;
  reading: number;
  writing: number;
  writingArray: number;  // 배열영작 점수
  writingConditional: number;  // 조건영작 점수
  vocabDifficulty?: string;
  grammarDifficulty?: string;
  readingDifficulty?: string;
  writingDifficulty?: string;
  answers?: StudentAnswers;
}

export interface SubjectAverages {
  vocabulary: number;
  grammar: number;
  reading: number;
  writing: number;
  overall: number;
}

export interface LevelCriteria {
  level: string;
  vocabulary: string;
  grammar: string;
  reading: string;
  writing: string;
}

export interface GradeCriteria {
  grade: string;
  levels: LevelCriteria[];
}

// 어휘 난이도: 옳은보카4, 옳은보카5, 옳은보카6
export const GRADE_CRITERIA: GradeCriteria[] = [
  {
    grade: '중1',
    levels: [
      { level: 'FO', vocabulary: '옳은보카4', grammar: 'L1', reading: 'L1', writing: 'L1' },
      { level: 'INTER', vocabulary: '옳은보카5', grammar: 'L2', reading: 'L1', writing: 'L2' },
      { level: 'AD', vocabulary: '옳은보카5', grammar: 'L2', reading: 'L2', writing: 'L2' },
      { level: 'IVY', vocabulary: '옳은보카6', grammar: 'L3', reading: 'L3', writing: 'L3' },
    ],
  },
  {
    grade: '중2',
    levels: [
      { level: 'FO', vocabulary: '옳은보카4', grammar: 'L2', reading: 'L2', writing: 'L2' },
      { level: 'INTER', vocabulary: '옳은보카5', grammar: 'L3', reading: 'L2', writing: 'L2' },
      { level: 'AD', vocabulary: '옳은보카6', grammar: 'L3', reading: 'L2', writing: 'L3' },
    ],
  },
];
