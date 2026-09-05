import { WordData } from '@/types/vocabulary';

export const processWordMeanings = (words: WordData[]): WordData[] => {
  const wordMeaningsMap = new Map<string, string>();
  
  // First pass: build a map of words and their meanings
  words.forEach(word => {
    wordMeaningsMap.set(word.표제어.toLowerCase(), word.표제어뜻);
  });

  // Second pass: process antonym meanings
  return words.map(word => ({
    ...word,
    반의어뜻: word.반의어뜻.map((meaning, index) => {
      // If the meaning is in the format "word의 뜻", try to find it in the map
      if (meaning === `${word.반의어[index]}의 뜻`) {
        const mappedMeaning = wordMeaningsMap.get(word.반의어[index].toLowerCase());
        return mappedMeaning || meaning;
      }
      return meaning;
    })
  }));
};