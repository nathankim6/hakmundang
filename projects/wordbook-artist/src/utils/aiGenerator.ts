import { supabase } from '@/integrations/supabase/client';
import { VocabularyWord, DayGroup, MeaningSegment } from '@/types/vocabulary';
import { DifficultyLevel } from '@/components/WorkbookSettings';

interface AIVocabularyResult {
  word: string;
  pronunciation: string;
  meaningSegments?: MeaningSegment[];
  synonyms?: string[];
  antonyms?: string[];
  synonymsKorean?: string[];
  antonymsKorean?: string[];
  examples: { english: string; korean: string }[];
}

export const generateVocabularyWithAI = async (
  dayGroups: DayGroup[],
  difficultyLevel: DifficultyLevel,
  includeExamples: boolean,
  onProgress?: (progress: number) => void
): Promise<DayGroup[]> => {
  // Flatten all words
  const allWords = dayGroups.flatMap(group => group.words);
  const totalWords = allWords.length;
  
  // Process in chunks to avoid timeout
  const chunkSize = 20;
  const results: AIVocabularyResult[] = [];
  
  for (let i = 0; i < allWords.length; i += chunkSize) {
    const chunk = allWords.slice(i, i + chunkSize);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-vocabulary', {
        body: {
          words: chunk.map(w => ({ word: w.word, meaning: w.meaning })),
          difficultyLevel,
          includeExamples
        }
      });
      
      if (error) {
        console.error('AI generation error:', error);
        throw error;
      }
      
      if (data?.results) {
        results.push(...data.results);
      }
    } catch (err) {
      console.error('Failed to generate vocabulary for chunk:', err);
      // Add fallback for failed chunk
      chunk.forEach(w => {
        results.push({
          word: w.word,
          pronunciation: `/${w.word.toLowerCase()}/`,
          meaningSegments: [{ partOfSpeech: '명', meaning: w.meaning }],
          examples: []
        });
      });
    }
    
    if (onProgress) {
      onProgress(Math.min(100, Math.round(((i + chunk.length) / totalWords) * 100)));
    }
  }
  
  // Create a map for quick lookup
  const resultMap = new Map<string, AIVocabularyResult>();
  results.forEach(r => {
    resultMap.set(r.word.toLowerCase(), r);
  });
  
  // Update day groups with AI data
  return dayGroups.map(group => ({
    ...group,
    words: group.words.map(word => {
      const aiData = resultMap.get(word.word.toLowerCase());
      const meaningSegments = aiData?.meaningSegments || [{ partOfSpeech: '명', meaning: word.meaning }];
      
      return {
        ...word,
        pronunciation: aiData?.pronunciation || `/${word.word.toLowerCase()}/`,
        meaningSegments: meaningSegments,
        partsOfSpeech: meaningSegments.map(s => s.partOfSpeech),
        synonyms: aiData?.synonyms || [],
        antonyms: aiData?.antonyms || [],
        synonymsKorean: aiData?.synonymsKorean || [],
        antonymsKorean: aiData?.antonymsKorean || [],
        examples: includeExamples ? (aiData?.examples?.slice(0, 1) || word.examples?.slice(0, 1) || []) : []
      };
    })
  }));
};
