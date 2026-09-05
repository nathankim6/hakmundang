
// This file provides temporary TypeScript definitions for tables that exist
// in the Supabase database but aren't yet included in the generated types

export interface TeacherPhoto {
  id: string;
  photo_url: string;
  teacher_name?: string;
  created_at?: string;
  is_hit_question?: boolean;
}

export interface ReportCard {
  id?: string;
  school: string;
  grade: string;
  exam_scope: string;
  teacher: string;
  teacher_photo?: string | null;
  total_questions: number;
  objective_questions: number;
  subjective_questions: number;
  problem_types: string;
  overall_evaluation?: string | null;
  difficult_problems_explanation?: string | null;
  exam_info?: string | null;
  hit_question_photos?: string[] | null;
  highlights?: string | null;
  created_at?: string;
  updated_at?: string;
}
