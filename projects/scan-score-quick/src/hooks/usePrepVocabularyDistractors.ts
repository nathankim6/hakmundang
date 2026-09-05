import { useState, useCallback } from 'react';
import { prepVocabularyQuestions } from '@/data/prepLevelTestQuestions';
import { toast } from 'sonner';

interface DistractorData {
  questionId: number;
  word: string;
  correctAnswers: string[];
  distractors: string[];
  options: string[]; // 정답 + 오답 섞인 선택지
}

/**
 * PREP 어휘 선지는 데이터 파일(prepLevelTestQuestions.ts)의 fixedDistractors로 고정.
 * 누가 언제 어떤 기기로 접속해도 동일한 선지, 동일한 순서로 출제됨.
 * 순서: [...정답, ...오답]. DB/AI 의존 없음.
 */
export function usePrepVocabularyDistractors() {
  // 데이터 파일 기반의 정적 맵 (모듈 로드 시 1회 생성)
  const [distractorsMap] = useState<Map<number, DistractorData>>(() => {
    const map = new Map<number, DistractorData>();
    prepVocabularyQuestions.forEach(q => {
      const correctAnswers = q.correctAnswers || [];
      const distractors = q.fixedDistractors || [];
      // Prefer original option order from the doc when provided.
      const options = (q as any).fixedOptions && (q as any).fixedOptions.length > 0
        ? (q as any).fixedOptions as string[]
        : [...correctAnswers, ...distractors];
      map.set(q.id, {
        questionId: q.id,
        word: q.questionText,
        correctAnswers,
        distractors,
        options,
      });
    });
    return map;
  });

  const getDistractors = useCallback((questionId: number) => {
    return distractorsMap.get(questionId);
  }, [distractorsMap]);

  // 호환성을 위한 no-op (재생성 버튼이 눌려도 고정 선지는 바뀌지 않음)
  const generateDistractors = useCallback(async (_questionId: number, forceRegenerate: boolean = false) => {
    if (forceRegenerate) {
      toast.info('선지는 고정되어 있어 재생성되지 않습니다');
    }
    return distractorsMap.get(_questionId) || null;
  }, [distractorsMap]);

  const isLoading = useCallback((_questionId: number) => false, []);

  return {
    distractorsMap,
    generateDistractors,
    getDistractors,
    isLoading,
    isInitialLoading: false,
  };
}
