
import { useFilteredClasses } from '../useFilteredClasses';

export const useTeachersList = () => {
  const { classes } = useFilteredClasses('all'); // 모든 클래스를 가져와서 선생님 목록 생성
  const teachers = Array.from(new Set(classes.map(cls => cls.teacher))).filter(Boolean);
  return { teachers };
};
