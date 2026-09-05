// 관리자 코드 판별 유틸
const ADMIN_CODES = ['admin', '101100', 'orun0088'];

export const isAdminCode = (code?: string | null): boolean => {
  if (!code) return false;
  return ADMIN_CODES.includes(code);
};

export const isAdminUser = (): boolean => {
  try {
    const code = sessionStorage.getItem('accessCode');
    return isAdminCode(code);
  } catch {
    return false;
  }
};
