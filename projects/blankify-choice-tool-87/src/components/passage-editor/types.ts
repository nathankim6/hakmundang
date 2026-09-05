
export interface Answer {
  number: number;
  text: string;
  words?: number;
  originalOrder?: string[];
  type: 'blank' | 'choice' | 'order';
  correctOption?: string;
}

export interface HistoryState {
  content: string;
  answers: Answer[];
  choiceAnswers: Answer[];
  orderAnswers: Answer[];
  blanksCount: number;
  choicesCount: number;
  orderCount: number;
}

export interface PassageEditorProps {
  index: number;
  passage: { content: string };
  onPassageChange: (index: number, content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDelete?: (index: number) => void;
}
