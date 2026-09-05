
export type QuestionType = 'multiple' | 'subjective';

export interface QuestionAnswer {
  type: QuestionType;
  answer: number | string;
}

export interface QRDataType {
  title: string;
  testId: string;
  answers: Record<number, QuestionAnswer>;
  questionCount: number;
  timestamp: number;
  isEnded?: boolean;
}
