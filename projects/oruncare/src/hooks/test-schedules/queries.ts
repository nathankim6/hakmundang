import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { TestSchedule } from "@/types/calendar";
import { NewTestSchedule } from "./types";

const TEST_SCHEDULES_QUERY = `
  *,
  student:students(
    id,
    name, 
    wordbook, 
    total_days,
    days_per_test,
    test_start_date
  ),
  class:classes(id, name, schedule, teacher)
`;

export const fetchTestSchedules = async (selectedTeacher: string) => {
  const { data: schedules, error: schedulesError } = await supabase
    .from('test_schedules')
    .select(TEST_SCHEDULES_QUERY);

  if (schedulesError) {
    console.error('Error fetching test schedules:', schedulesError);
    return [];
  }

  return selectedTeacher === 'all'
    ? schedules as TestSchedule[]
    : (schedules as TestSchedule[]).filter(schedule => schedule.class.teacher === selectedTeacher);
};

export const fetchStudents = async () => {
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select(`
      *,
      class:classes(*)
    `);

  if (studentsError) {
    console.error('Error fetching students:', studentsError);
    return null;
  }

  return students;
};

export const insertTestSchedules = async (newSchedules: NewTestSchedule[]) => {
  // Use 'as any' to bypass TypeScript type checking since we've updated the database schema
  const { error: insertError } = await supabase
    .from('test_schedules')
    .insert(newSchedules as any);

  if (insertError) {
    throw insertError;
  }

  const { data: updatedSchedules, error: updateError } = await supabase
    .from('test_schedules')
    .select(TEST_SCHEDULES_QUERY);

  if (updateError) {
    throw updateError;
  }

  return updatedSchedules as TestSchedule[];
};

export const updateTestResult = async (
  scheduleId: string,
  result: TestSchedule['result'],
  wrongCount?: number | null,
  currentSchedule?: TestSchedule
) => {
  const updateData: any = {
    result,
    updated_at: new Date().toISOString()
  };
  
  // Explicitly set wrong_count to null if absent or not-taken
  if (result === 'absent' || result === 'not-taken') {
    updateData.wrong_count = null;
  } 
  // Otherwise, only include wrong_count if it's explicitly provided (including zero)
  else if (wrongCount !== undefined) {
    updateData.wrong_count = wrongCount;
  }

  if (currentSchedule) {
    updateData.previous_range_start = currentSchedule.range_start;
    updateData.previous_range_end = currentSchedule.range_end;
    updateData.previous_result = currentSchedule.result;
  }

  console.log('Updating test result:', { scheduleId, updateData });

  const { error } = await supabase
    .from('test_schedules')
    .update(updateData)
    .eq('id', scheduleId);

  if (error) {
    console.error('Error updating test result:', error);
    throw error;
  }
};
