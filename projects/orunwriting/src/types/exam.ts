export interface ExamProblem {
  id: number;
  korean: string;
  english: string;
  words: string[]; // 배열할 단어들
}

export interface Exam {
  id: string;
  title: string;
  creator: string;
  createdAt: string;
  problems: ExamProblem[];
}

export interface ExamSubmission {
  id: string;
  examId: string;
  participantName: string;
  affiliation: string;
  answers: string[];
  score: number;
  totalProblems: number;
  submittedAt: string;
}
