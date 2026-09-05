
import { Employee } from "@/lib/types";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Format birth date for display
export const formatBirthday = (employee: Employee) => {
  if (employee.birthdayMonth && employee.birthdayDay) {
    const calendarType = employee.calendarType === 'lunar' ? '음력' : '양력';
    return `${calendarType} ${employee.birthdayMonth}월 ${employee.birthdayDay}일`;
  } else if (employee.birthday) {
    return format(employee.birthday, 'yyyy년 MM월 dd일', { locale: ko });
  }
  return "-";
};

// Get department badge color
export const getDepartmentBadgeColor = (department: string): string => {
  switch (department) {
    case 'administration':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'elementary':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'middle':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'high':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'operations':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
  }
};

// Get access level badge color
export const getAccessLevelBadgeColor = (level: string): string => {
  switch (level) {
    case 'personal':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    case 'department':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'all':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
  }
};
