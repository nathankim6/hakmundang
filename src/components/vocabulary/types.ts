export interface TableRowData {
  headword: string;
  meaning: string;
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
  partOfSpeech: string;
  example?: string;
  synonyms: string[];
  synonymMeanings: string[];
  antonyms: string[];
  antonymMeanings: string[];
}

export interface QuestionData {
  number: number;
  rows: TableRowData[];
}