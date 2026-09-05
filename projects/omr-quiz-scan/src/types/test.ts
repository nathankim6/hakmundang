
export type QuestionType = 'multiple' | 'subjective' | 'wordArrangement';
export type TestFormat = '45' | 'grammar' | 'writing';

export interface WritingQuestion {
  korean: string;
  english: string;
  arrangeWords: string[];
}

export interface QuestionAnswer {
  type: QuestionType;
  answer: number[] | string; // Changed from number | string to number[] | string
  points?: number; // For 28-question format, questions 18-45 can have custom points
  grammarCategory?: string; // Grammar category name for grammar test format
}

export interface QRDataType {
  title: string;
  testId: string;
  answers: Record<number, QuestionAnswer>;
  questionCount: number;
  timestamp: number;
  isEnded?: boolean;
  testFormat?: TestFormat; // New field to identify test format
  writingQuestions?: WritingQuestion[]; // Writing test questions
}
