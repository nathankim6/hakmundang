// 학생 인증 관련 유틸리티 함수들

export interface StudentData {
  id: string;
  name: string;
  class_id: string;
  class_name?: string;
  access_code: string;
}

// 현재 로그인된 학생 정보 가져오기
export const getCurrentStudent = (): StudentData | null => {
  try {
    const studentDataStr = sessionStorage.getItem('studentData');
    if (!studentDataStr) return null;
    
    return JSON.parse(studentDataStr) as StudentData;
  } catch (error) {
    console.error('Error parsing student data:', error);
    return null;
  }
};

// 학생이 로그인되어 있는지 확인
export const isStudentLoggedIn = (): boolean => {
  return getCurrentStudent() !== null;
};

// 학생 로그아웃
export const logoutStudent = (): void => {
  sessionStorage.removeItem('studentData');
  sessionStorage.removeItem('accessCode');
  sessionStorage.removeItem('user_session_id');
};