
/**
 * Checks if a class has a scheduled lesson on the given day
 * 
 * @param classData The class object
 * @param date The date to check
 * @returns boolean indicating if there's a class on that day
 */
export function checkDayHasClass(classData: any, date: Date): boolean {
  if (!classData || !classData.schedule) return false;
  
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const koreanDayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayChar = koreanDayNames[dayOfWeek];
  
  return classData.schedule.includes(dayChar);
}

/**
 * Checks if a date is a scheduled day for a class based on its schedule
 * 
 * @param date The date to check
 * @param schedule The class schedule string (comma-separated Korean day characters)
 * @returns boolean indicating if there's a class scheduled on that day
 */
export function isClassScheduledDay(date: Date, schedule: string): boolean {
  if (!schedule) return false;
  
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const koreanDayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayChar = koreanDayNames[dayOfWeek];
  
  return schedule.includes(dayChar);
}
