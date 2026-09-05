export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          expiry_date: string
          id: string
          name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expiry_date: string
          id?: string
          name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expiry_date?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      background_settings: {
        Row: {
          created_at: string | null
          gif_url: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          gif_url?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          gif_url?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      backgrounds: {
        Row: {
          created_at: string
          id: string
          is_video: boolean
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_video?: boolean
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_video?: boolean
          url?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          schedule: string | null
          teacher: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          schedule?: string | null
          teacher?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          schedule?: string | null
          teacher?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_calendar: {
        Row: {
          class_id: string | null
          color: string | null
          content: string | null
          created_at: string | null
          date: string
          id: string
        }
        Insert: {
          class_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          date: string
          id?: string
        }
        Update: {
          class_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_calendar_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_memos: {
        Row: {
          created_at: string | null
          date: string
          id: string
          memo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          memo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          memo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      descriptive_scores: {
        Row: {
          average: number | null
          created_at: string | null
          id: string
          score: number | null
          student_id: string | null
          test_type: string
        }
        Insert: {
          average?: number | null
          created_at?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          test_type: string
        }
        Update: {
          average?: number | null
          created_at?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "descriptive_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string | null
          description: string
          end_date: string
          id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date: string
          id?: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string
          id?: string
          start_date?: string
        }
        Relationships: []
      }
      incorrect_options: {
        Row: {
          correct_text: string
          created_at: string
          explanation: string | null
          id: string
          incorrect_text: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          correct_text: string
          created_at?: string
          explanation?: string | null
          id?: string
          incorrect_text: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          correct_text?: string
          created_at?: string
          explanation?: string | null
          id?: string
          incorrect_text?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      manual_classes: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string
          id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date: string
          id?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_test_scores: {
        Row: {
          average: number | null
          created_at: string | null
          id: string
          score: number | null
          student_id: string | null
          test_type: string
        }
        Insert: {
          average?: number | null
          created_at?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          test_type: string
        }
        Update: {
          average?: number | null
          created_at?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_test_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      passages: {
        Row: {
          category: string | null
          content: string
          created_at: string
          difficulty: string | null
          id: string
          item_id: string | null
          source: string | null
          tags: string[] | null
          translation: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          difficulty?: string | null
          id?: string
          item_id?: string | null
          source?: string | null
          tags?: string[] | null
          translation?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          difficulty?: string | null
          id?: string
          item_id?: string | null
          source?: string | null
          tags?: string[] | null
          translation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_records: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string
          homework: string | null
          id: string
          lesson_content: string | null
          youtube_url: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date: string
          homework?: string | null
          id?: string
          lesson_content?: string | null
          youtube_url?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          homework?: string | null
          id?: string
          lesson_content?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          created_at: string | null
          difficult_problems_explanation: string | null
          exam_info: string | null
          exam_scope: string
          grade: string
          highlights: string | null
          hit_question_photos: string[] | null
          id: string
          objective_questions: number
          overall_evaluation: string | null
          problem_types: string
          school: string
          subjective_questions: number
          teacher: string
          teacher_photo: string | null
          total_questions: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          difficult_problems_explanation?: string | null
          exam_info?: string | null
          exam_scope: string
          grade: string
          highlights?: string | null
          hit_question_photos?: string[] | null
          id?: string
          objective_questions: number
          overall_evaluation?: string | null
          problem_types: string
          school: string
          subjective_questions: number
          teacher: string
          teacher_photo?: string | null
          total_questions: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          difficult_problems_explanation?: string | null
          exam_info?: string | null
          exam_scope?: string
          grade?: string
          highlights?: string | null
          hit_question_photos?: string[] | null
          id?: string
          objective_questions?: number
          overall_evaluation?: string | null
          problem_types?: string
          school?: string
          subjective_questions?: number
          teacher?: string
          teacher_photo?: string | null
          total_questions?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      school_logos: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string
          school_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url: string
          school_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string
          school_name?: string
        }
        Relationships: []
      }
      section_titles: {
        Row: {
          created_at: string | null
          id: string
          title: string
          title_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          title_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          title_type?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          absent: number | null
          class_id: string | null
          course_period: string | null
          course_scope: string | null
          created_at: string | null
          days_per_test: number | null
          id: string
          late: number | null
          name: string
          present: number | null
          regular_level: string | null
          special_level: string | null
          teachers: string | null
          test_start_date: string | null
          textbook: string | null
          total_days: number | null
          wordbook: string | null
        }
        Insert: {
          absent?: number | null
          class_id?: string | null
          course_period?: string | null
          course_scope?: string | null
          created_at?: string | null
          days_per_test?: number | null
          id?: string
          late?: number | null
          name: string
          present?: number | null
          regular_level?: string | null
          special_level?: string | null
          teachers?: string | null
          test_start_date?: string | null
          textbook?: string | null
          total_days?: number | null
          wordbook?: string | null
        }
        Update: {
          absent?: number | null
          class_id?: string | null
          course_period?: string | null
          course_scope?: string | null
          created_at?: string | null
          days_per_test?: number | null
          id?: string
          late?: number | null
          name?: string
          present?: number | null
          regular_level?: string | null
          special_level?: string | null
          teachers?: string | null
          test_start_date?: string | null
          textbook?: string | null
          total_days?: number | null
          wordbook?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_comments: {
        Row: {
          avatar: string | null
          comment: string
          created_at: string | null
          id: string
          student_id: string | null
          teacher_name: string
        }
        Insert: {
          avatar?: string | null
          comment: string
          created_at?: string | null
          id?: string
          student_id?: string | null
          teacher_name: string
        }
        Update: {
          avatar?: string | null
          comment?: string
          created_at?: string | null
          id?: string
          student_id?: string | null
          teacher_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_photos: {
        Row: {
          created_at: string | null
          id: string
          is_hit_question: boolean | null
          photo_url: string
          teacher_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_hit_question?: boolean | null
          photo_url: string
          teacher_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_hit_question?: boolean | null
          photo_url?: string
          teacher_name?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          avatar: string | null
          created_at: string | null
          id: string
          name: string
          title: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          name: string
          title?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          name?: string
          title?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          score: number
          student_answers: Json
          student_class: string
          student_name: string
          test_id: string
          total_count: number
        }
        Insert: {
          correct_count: number
          created_at?: string
          id?: string
          score: number
          student_answers: Json
          student_class?: string
          student_name: string
          test_id: string
          total_count: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          score?: number
          student_answers?: Json
          student_class?: string
          student_name?: string
          test_id?: string
          total_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["test_id"]
          },
        ]
      }
      test_schedules: {
        Row: {
          class_id: string | null
          created_at: string | null
          homework_completed: boolean | null
          homework_content: string | null
          id: string
          next_range_end: number | null
          next_range_start: number | null
          previous_range_end: number | null
          previous_range_start: number | null
          previous_result: string | null
          range_end: number
          range_start: number
          result: string | null
          student_id: string | null
          student_wordbook: string | null
          test_date: string
          updated_at: string | null
          wrong_count: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          homework_completed?: boolean | null
          homework_content?: string | null
          id?: string
          next_range_end?: number | null
          next_range_start?: number | null
          previous_range_end?: number | null
          previous_range_start?: number | null
          previous_result?: string | null
          range_end?: number
          range_start?: number
          result?: string | null
          student_id?: string | null
          student_wordbook?: string | null
          test_date: string
          updated_at?: string | null
          wrong_count?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          homework_completed?: boolean | null
          homework_content?: string | null
          id?: string
          next_range_end?: number | null
          next_range_start?: number | null
          previous_range_end?: number | null
          previous_range_start?: number | null
          previous_result?: string | null
          range_end?: number
          range_start?: number
          result?: string | null
          student_id?: string | null
          student_wordbook?: string | null
          test_date?: string
          updated_at?: string | null
          wrong_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_schedules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          answers: Json
          created_at: string
          id: string
          is_ended: boolean | null
          question_count: number
          test_id: string
          title: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          is_ended?: boolean | null
          question_count: number
          test_id: string
          title: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          is_ended?: boolean | null
          question_count?: number
          test_id?: string
          title?: string
        }
        Relationships: []
      }
      user_works: {
        Row: {
          access_code: string
          content: string
          created_at: string
          id: string
          result: string
          step_name: string
          step_number: number
          title: string | null
          updated_at: string
        }
        Insert: {
          access_code: string
          content: string
          created_at?: string
          id?: string
          result: string
          step_name: string
          step_number: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          content?: string
          created_at?: string
          id?: string
          result?: string
          step_name?: string
          step_number?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      veritas_access_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          last_accessed: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          last_accessed?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          last_accessed?: string | null
        }
        Relationships: []
      }
      weekly_contents: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          id: string
          week: number
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          week: number
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          week?: number
        }
        Relationships: []
      }
      workbooks: {
        Row: {
          created_at: string
          id: string
          name: string
          passages: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          passages: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          passages?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
