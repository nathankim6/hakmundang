// 세션 스토리지 유틸리티 - 브라우저 종료 시 자동 로그아웃
// localStorage 대신 sessionStorage를 사용하여 브라우저 탭/창 종료 시 세션 만료

// 세션 관련 키들
const SESSION_KEYS = [
  'adminLoggedIn',
  'accessCode',
  'studentData',
  'user_session_id',
  'accessManagerLoggedIn'
] as const;

type SessionKey = typeof SESSION_KEYS[number];

// 세션 스토리지에 저장
export const setSessionItem = (key: SessionKey, value: string): void => {
  sessionStorage.setItem(key, value);
};

// 세션 스토리지에서 가져오기
export const getSessionItem = (key: SessionKey): string | null => {
  return sessionStorage.getItem(key);
};

// 세션 스토리지에서 삭제
export const removeSessionItem = (key: SessionKey): void => {
  sessionStorage.removeItem(key);
};

// 모든 세션 데이터 삭제 (로그아웃)
export const clearAllSession = (): void => {
  SESSION_KEYS.forEach(key => {
    sessionStorage.removeItem(key);
  });
};

// 기존 localStorage에서 sessionStorage로 마이그레이션 (한 번만 실행)
export const migrateFromLocalStorage = (): void => {
  SESSION_KEYS.forEach(key => {
    const localValue = localStorage.getItem(key);
    if (localValue && !sessionStorage.getItem(key)) {
      // localStorage에 값이 있고 sessionStorage에 없으면 마이그레이션하지 않음
      // (새 세션이므로 다시 로그인 필요)
    }
    // localStorage의 세션 데이터는 삭제
    localStorage.removeItem(key);
  });
};
