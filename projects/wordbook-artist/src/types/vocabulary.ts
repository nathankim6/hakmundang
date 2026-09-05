export interface Example {
  english: string;
  korean: string;
}

export interface MeaningSegment {
  partOfSpeech: string;
  meaning: string;
}

export type WordType = '표제어' | '파생어' | '핵심표현' | '어원으로 줄줄이';

export interface VocabularyWord {
  id: string;
  day: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  examples?: Example[];
  partOfSpeech?: string;
  partsOfSpeech?: string[];
  meaningSegments?: MeaningSegment[];
  synonyms?: string[];
  antonyms?: string[];
  synonymsKorean?: string[];
  antonymsKorean?: string[];
  englishDefinition?: string;
  etymology?: string;
  imageUrl?: string;
  wordType?: WordType;
}

export interface DayGroup {
  day: string;
  words: VocabularyWord[];
}
