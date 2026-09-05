
export interface TestResult {
  id: string;
  test_id: string;
  student_name: string;
  score: number;
  student_answers: Record<number, any>;
  correct_count: number;
  total_count: number;
  created_at: string;
  answers?: Record<string, any>;
  correct_answers?: Record<string, any>;
}

export interface Test {
  testId: string;
  title: string;
  answers: Record<number, any>;
}
