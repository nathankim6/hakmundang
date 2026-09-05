import { useCallback, useRef } from 'react';

type AnswerValue = string | number | number[] | string[] | { subjects: string[]; verbs: string[] };

interface TestState {
  answers: Record<number, AnswerValue>;
  studentName: string;
  studentSchool: string;
  studentGrade: string;
  currentSection: string;
  currentQuestionIndex: number;
  startTime: string | null;
  elapsedTime: number;
}

const STORAGE_KEY_PREFIX = 'orun_test_progress_';

export const useTestAnswerPersistence = (testType: string) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${testType}`;
  const isLoadedRef = useRef(false);

  // 저장된 상태 불러오기
  const loadSavedState = useCallback((): Partial<TestState> | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      console.log(`[Persistence] Loading from ${storageKey}:`, saved ? 'found' : 'not found');
      
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const savedAt = parsed.savedAt || 0;
        const age = now - savedAt;
        const maxAge = 24 * 60 * 60 * 1000; // 24시간
        
        console.log(`[Persistence] Data age: ${Math.round(age / 1000 / 60)} minutes`);
        
        // 24시간 이내의 데이터만 유효
        if (savedAt && age < maxAge) {
          isLoadedRef.current = true;
          console.log(`[Persistence] Valid data found, restoring state`);
          return parsed.state;
        } else {
          // 오래된 데이터 삭제
          console.log(`[Persistence] Data expired, removing`);
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.error('[Persistence] Failed to load saved test state:', e);
    }
    isLoadedRef.current = true;
    return null;
  }, [storageKey]);

  // 상태 저장
  const saveState = useCallback((state: Partial<TestState>) => {
    // 초기 로드가 완료된 후에만 저장 (경쟁 조건 방지)
    if (!isLoadedRef.current) {
      console.log(`[Persistence] Skipping save - initial load not complete`);
      return;
    }
    
    try {
      const dataToSave = {
        state,
        savedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log(`[Persistence] State saved to ${storageKey}`);
    } catch (e) {
      console.error('[Persistence] Failed to save test state:', e);
    }
  }, [storageKey]);

  // 저장된 상태 삭제 (제출 완료 시)
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      isLoadedRef.current = false;
      console.log(`[Persistence] State cleared from ${storageKey}`);
    } catch (e) {
      console.error('[Persistence] Failed to clear saved test state:', e);
    }
  }, [storageKey]);

  // 강제로 로드 완료 상태 설정 (초기 로드 시 저장된 데이터가 없는 경우 호출)
  const markAsLoaded = useCallback(() => {
    isLoadedRef.current = true;
  }, []);

  return {
    loadSavedState,
    saveState,
    clearSavedState,
    markAsLoaded
  };
};

// 일반 시험용 (testId 기반)
export const useRegularTestPersistence = (testId: string | undefined) => {
  const storageKey = testId ? `${STORAGE_KEY_PREFIX}regular_${testId}` : null;
  const isLoadedRef = useRef(false);

  const loadSavedState = useCallback((): { answers: Record<number, { answer: string }>; studentName: string } | null => {
    if (!storageKey) {
      isLoadedRef.current = true;
      return null;
    }
    
    try {
      const saved = localStorage.getItem(storageKey);
      console.log(`[Persistence] Loading from ${storageKey}:`, saved ? 'found' : 'not found');
      
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const savedAt = parsed.savedAt || 0;
        const age = now - savedAt;
        const maxAge = 24 * 60 * 60 * 1000;
        
        console.log(`[Persistence] Data age: ${Math.round(age / 1000 / 60)} minutes`);
        
        if (savedAt && age < maxAge) {
          isLoadedRef.current = true;
          console.log(`[Persistence] Valid data found, restoring state`);
          return parsed.state;
        } else {
          console.log(`[Persistence] Data expired, removing`);
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.error('[Persistence] Failed to load saved test state:', e);
    }
    isLoadedRef.current = true;
    return null;
  }, [storageKey]);

  const saveState = useCallback((state: { answers: Record<number, { answer: string }>; studentName: string }) => {
    if (!storageKey) return;
    
    if (!isLoadedRef.current) {
      console.log(`[Persistence] Skipping save - initial load not complete`);
      return;
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        state,
        savedAt: Date.now()
      }));
      console.log(`[Persistence] State saved to ${storageKey}`);
    } catch (e) {
      console.error('[Persistence] Failed to save test state:', e);
    }
  }, [storageKey]);

  const clearSavedState = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
      isLoadedRef.current = false;
      console.log(`[Persistence] State cleared from ${storageKey}`);
    } catch (e) {
      console.error('[Persistence] Failed to clear saved test state:', e);
    }
  }, [storageKey]);

  const markAsLoaded = useCallback(() => {
    isLoadedRef.current = true;
  }, []);

  return {
    loadSavedState,
    saveState,
    clearSavedState,
    markAsLoaded
  };
};
