
import { format, addDays } from "date-fns";
import { NewTestSchedule } from "./types";
import { TestSchedule } from "@/types/calendar";

export const generateNewSchedules = (
  students: any[],
  selectedTeacher: string,
  existingSchedules: TestSchedule[]
): NewTestSchedule[] => {
  const today = new Date();
  const newSchedules: NewTestSchedule[] = [];

  for (const student of students) {
    if (selectedTeacher !== 'all' && student.class.teacher !== selectedTeacher) {
      continue;
    }

    if (!student.test_start_date) continue;

    const existingStudentSchedules = existingSchedules.filter(s => s.student_id === student.id);
    const testStartDate = new Date(student.test_start_date);
    
    if (testStartDate > today) continue;

    let currentDay = 0;
    let currentDate = new Date(testStartDate);

    const totalTests = Math.ceil(student.total_days / student.days_per_test);
    const existingTestCount = existingStudentSchedules.length;

    if (existingTestCount < totalTests) {
      currentDay = existingTestCount * student.days_per_test;
      
      if (existingTestCount > 0) {
        const lastSchedule = existingStudentSchedules
          .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0];
        currentDate = addDays(new Date(lastSchedule.test_date), 2);
      }

      while (currentDay < student.total_days) {
        const existingSchedule = existingStudentSchedules.find(s => 
          new Date(s.test_date).toDateString() === currentDate.toDateString()
        );

        if (!existingSchedule) {
          const rangeStart = (currentDay + 1).toString();
          const rangeEnd = Math.min(currentDay + student.days_per_test, student.total_days).toString();

          newSchedules.push({
            student_id: student.id,
            class_id: student.class_id,
            test_date: format(currentDate, 'yyyy-MM-dd'),
            range_start: rangeStart,
            range_end: rangeEnd,
            result: null,
            created_at: new Date().toISOString(),
            student: {
              id: student.id,
              name: student.name,
              wordbook: student.wordbook,
              total_days: student.total_days,
              days_per_test: student.days_per_test,
              test_start_date: student.test_start_date
            },
            class: {
              id: student.class.id,
              name: student.class.name,
              teacher: student.class.teacher,
              schedule: student.class.schedule
            }
          });
        }

        currentDay += student.days_per_test;
        currentDate = addDays(currentDate, 2);
      }
    }
  }

  return newSchedules;
};
