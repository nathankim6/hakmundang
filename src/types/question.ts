export type QuestionType = {
  id: string;
  name: string;
  prompt?: string;
};

export type GeneratedQuestion = {
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
};

export interface PassageEntry {
  id: string;
  text: string;
  result: string;
}

export interface TypeEntry {
  type: QuestionType;
  passages: PassageEntry[];
}