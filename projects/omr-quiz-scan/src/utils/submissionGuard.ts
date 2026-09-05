const SUBMITTED_PREFIX = 'orun_submitted_';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24시간

const buildKey = (testId: string, studentKey: string) =>
  `${SUBMITTED_PREFIX}${testId}__${studentKey.replace(/\s+/g, '')}`;

export const hasAlreadySubmitted = (testId?: string, studentKey?: string): boolean => {
  if (!testId || !studentKey) return false;
  try {
    const raw = localStorage.getItem(buildKey(testId, studentKey));
    if (!raw) return false;
    const at = Number(raw);
    if (!at || Date.now() - at > MAX_AGE) {
      localStorage.removeItem(buildKey(testId, studentKey));
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const markSubmitted = (testId?: string, studentKey?: string) => {
  if (!testId || !studentKey) return;
  try {
    localStorage.setItem(buildKey(testId, studentKey), String(Date.now()));
  } catch {
    // ignore
  }
};
