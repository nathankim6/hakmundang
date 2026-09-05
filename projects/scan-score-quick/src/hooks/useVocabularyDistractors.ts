import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { vocabularyQuestions } from '@/data/levelTestQuestions';

interface DistractorData {
  questionId: number;
  word: string;
  correctAnswers: string[];
  distractors: string[];
  options: string[]; // 정답 + 오답 섞인 선택지
}

export function useVocabularyDistractors() {
  const [distractorsMap, setDistractorsMap] = useState<Map<number, DistractorData>>(new Map());
  const [loadingQuestions, setLoadingQuestions] = useState<Set<number>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 배열 섞기
  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 저장된 선지 불러오기
  useEffect(() => {
    const loadSavedDistractors = async () => {
      try {
        const { data, error } = await supabase
          .from('vocabulary_distractors')
          .select('*');

        if (error) {
          console.error('Error loading distractors:', error);
          return;
        }

        const map = new Map<number, DistractorData>();
        data?.forEach((item: any) => {
          const question = vocabularyQuestions.find(q => q.id === item.question_id);
          if (!question || !question.correctAnswers) return;

          const distractors = item.distractors as string[];
          const correctAnswers = question.correctAnswers;
          
          // 저장된 오답이 있으면 사용 (개수가 부족해도 일단 사용)
          if (distractors && distractors.length > 0) {
            const options = shuffleArray([...correctAnswers, ...distractors]);
            
            map.set(item.question_id, {
              questionId: item.question_id,
              word: item.word,
              correctAnswers,
              distractors,
              options
            });
          }
        });
        setDistractorsMap(map);
      } catch (error) {
        console.error('Error loading distractors:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadSavedDistractors();
  }, []);

  // 선지 생성
  const generateDistractors = useCallback(async (questionId: number, forceRegenerate: boolean = false) => {
    // 이미 있고 강제 재생성이 아니면 스킵
    if (distractorsMap.has(questionId) && !forceRegenerate) {
      return distractorsMap.get(questionId);
    }

    // 로딩 중이면 스킵
    if (loadingQuestions.has(questionId)) {
      return null;
    }

    const question = vocabularyQuestions.find(q => q.id === questionId);
    if (!question || !question.correctAnswers) return null;

    setLoadingQuestions(prev => new Set(prev).add(questionId));

    try {
      const { data, error } = await supabase.functions.invoke('generate-vocabulary-distractors', {
        body: {
          word: question.questionText,
          correctAnswers: question.correctAnswers,
          questionId
        }
      });

      if (error) throw error;

      const distractors = data.distractors as string[];
      const correctAnswers = question.correctAnswers;
      
      // UPSERT로 저장 (중복 키 문제 해결)
      const { error: upsertError } = await supabase
        .from('vocabulary_distractors')
        .upsert({
          question_id: questionId,
          word: question.questionText,
          correct_answer: correctAnswers.join(', '),
          distractors,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'question_id'
        });

      if (upsertError) {
        console.error('Error saving distractors:', upsertError);
      }

      const options = shuffleArray([...correctAnswers, ...distractors]);
      const distractorData: DistractorData = {
        questionId,
        word: question.questionText,
        correctAnswers,
        distractors,
        options
      };

      setDistractorsMap(prev => new Map(prev).set(questionId, distractorData));
      return distractorData;
    } catch (error) {
      console.error('Error generating distractors:', error);
      return null;
    } finally {
      setLoadingQuestions(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  }, [distractorsMap, loadingQuestions]);

  // 특정 문제의 선지 가져오기
  const getDistractors = useCallback((questionId: number) => {
    return distractorsMap.get(questionId);
  }, [distractorsMap]);

  // 로딩 상태 확인
  const isLoading = useCallback((questionId: number) => {
    return loadingQuestions.has(questionId);
  }, [loadingQuestions]);

  return {
    distractorsMap,
    generateDistractors,
    getDistractors,
    isLoading,
    isInitialLoading
  };
}
