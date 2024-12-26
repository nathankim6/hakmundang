export interface TableRowData {
  headword: string;
  meaning: string;
  difficulty: number;
  partOfSpeech: string;
  example?: string;
  exampleTranslation?: string;
  synonyms: string[];
  synonymMeanings: string[];
  antonyms: string[];
  antonymMeanings: string[];
}

export interface QuestionData {
  number: number;
  rows: TableRowData[];
}