export type Level = "상" | "중" | "하";
export type QType = "mc" | "short";

export interface Question {
  level: Level;
  type: QType;
  stem: string;
  choices?: string[];
  answer: number | string;
  alt?: string[];
  why: string;
  no: number;
}

export interface Cat {
  id: string;
  grade: string;
  name: string;
  points: string[];
  questions: Question[];
}

export interface Lesson {
  no: number;
  labels: string[];
  ids: string[];
}

export interface Book {
  pub: string;
  lessons: Lesson[];
}

export interface Bank {
  cats: Cat[];
  books: Record<string, Book[]>;
  orun: Record<"ele" | "mid", OrunTrack>;
}

export interface ExamCfg {
  title: string;
  grade: string;
  book: string;
  cats: string[];
  lvN: Record<Level, number>;
  tyN: { mc: number; short: number };
  total: number;
  noDup: boolean;
  seed: number;
}

export interface PickedQuestion extends Question {
  cat: string;
  catId: string;
  grade: string;
  seq: number;
}

export interface Exam {
  cfg: ExamCfg;
  qs: PickedQuestion[];
}

export const GRADES = ["중1", "중2", "중3", "고등"];
export const LVS: Level[] = ["상", "중", "하"];
export const CIRC = ["①", "②", "③", "④", "⑤"];

/* ── 옳은영어 커리큘럼 (ORUN 교재) ── */
export interface OrunChkQuestion {
  no: number;
  groupHeader?: string;
  kind?: string;
  stem?: string;
  boxed?: boolean;
  bank?: string[];
  choices?: string[];
  bullets?: string[];
}
export interface OrunAnswerKey {
  no: number;
  answer?: string;
  why?: string;
}
export interface OrunRecRow {
  prompt?: string;
  answer?: string;
  lines?: number;
  why?: string;
}
export interface OrunRecSection {
  no: number;
  label?: string;
  instruction?: string;
  kind?: string;
  rows: OrunRecRow[];
}
export interface OrunItem {
  id: string;
  no: number;
  t: string;
  p?: number;
  src?: string;
  chk: { chapter?: string; questions: OrunChkQuestion[]; answerKey?: OrunAnswerKey[] };
  rec?: { chapter?: string; sections: OrunRecSection[] };
}
export interface OrunChapter {
  no: number;
  t: string;
  items: OrunItem[];
}
export interface OrunBook {
  id: string;
  short: string;
  title?: string;
  pub?: string;
  chapters: OrunChapter[];
}
export interface OrunTrack {
  vol: string;
  recall: string;
  check: string;
  unit: string;
  books: OrunBook[];
}
