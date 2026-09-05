
export type TestResult = 'pass' | 'fail' | 'absent' | 'not-taken' | null;

export interface Holiday {
  id: string;
  start_date: string;
  end_date: string;
  description: string;
  created_at?: string;
}

export interface Class {
  id: string;
  name: string;
  teacher: string;
  schedule?: string;
}

export interface Student {
  id: string;
  name: string;
  wordbook: string;
  total_days: number;
  days_per_test: number;
  test_start_date?: string;
}

export interface TestSchedule {
  id: string;
  student_id?: string;
  class_id?: string;
  test_date: string;
  range_start: number | string;
  range_end: number | string;
  wrong_count?: number;
  created_at: string;
  homework_completed?: boolean;
  next_range_start?: number | string;
  next_range_end?: number | string;
  previous_range_start?: number | string;
  previous_range_end?: number | string;
  previous_result?: TestResult;
  updated_at?: string;
  homework_content?: string;
  next_homework_content?: string;
  teacher_comment?: string | null;
  result?: TestResult;
  student: Student;
  class: Class;
}
