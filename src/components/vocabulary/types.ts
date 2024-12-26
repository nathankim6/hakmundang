export interface WordPair {
  word: string;
  meaning: string;
}

export interface VocabularyEntryType {
  word: string;
  meaning: string;
  partOfSpeech: string;
  definition: string;
  difficulty: number;
  synonyms: WordPair[];
  antonyms: WordPair[];
}