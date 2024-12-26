export interface TableRowData {
  headword: string;
  meaning: string;
  synonyms: string[];
  synonymMeanings: string[];
  antonyms: string[];
  antonymMeanings: string[];
}

export interface QuestionData {
  number: number;
  rows: TableRowData[];
}