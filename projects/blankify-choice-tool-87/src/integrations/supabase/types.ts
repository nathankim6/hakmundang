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
          last_accessed: string | null
          name: string
          user_name: string
        }
        Insert: {
          code: string
          created_at?: string
          expiry_date: string
          id?: string
          last_accessed?: string | null
          name?: string
          user_name?: string
        }
        Update: {
          code?: string
          created_at?: string
          expiry_date?: string
          id?: string
          last_accessed?: string | null
          name?: string
          user_name?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string | null
          date: string
          id: string
          status: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          status: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          status?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      backgrounds: {
        Row: {
          created_at: string
          id: string
          is_video: boolean | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_video?: boolean | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_video?: boolean | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          progress: string
          schedule: string
          start_date: string | null
          teacher: string
          teacher_id: string | null
          wordbook: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          progress: string
          schedule: string
          start_date?: string | null
          teacher: string
          teacher_id?: string | null
          wordbook: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          progress?: string
          schedule?: string
          start_date?: string | null
          teacher?: string
          teacher_id?: string | null
          wordbook?: string
        }
        Relationships: []
      }
      curriculum_calendar: {
        Row: {
          class_id: string | null
          color: string | null
          content: string | null
          created_at: string
          date: string
          id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          date: string
          id?: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
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
          created_at: string
          date: string
          id: string
          memo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          memo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          memo?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          absent_students: string | null
          approval_status: string | null
          class_content: string | null
          comments: string | null
          content: string
          created_at: string
          date: string
          employee_id: string
          homework: string | null
          id: string
          progress_status: string | null
          updated_at: string
        }
        Insert: {
          absent_students?: string | null
          approval_status?: string | null
          class_content?: string | null
          comments?: string | null
          content: string
          created_at?: string
          date: string
          employee_id: string
          homework?: string | null
          id?: string
          progress_status?: string | null
          updated_at?: string
        }
        Update: {
          absent_students?: string | null
          approval_status?: string | null
          class_content?: string | null
          comments?: string | null
          content?: string
          created_at?: string
          date?: string
          employee_id?: string
          homework?: string | null
          id?: string
          progress_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_classes: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          original_id: string
          progress: string
          schedule: string
          teacher: string
          wordbook: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id: string
          name: string
          original_id: string
          progress: string
          schedule: string
          teacher: string
          wordbook: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          original_id?: string
          progress?: string
          schedule?: string
          teacher?: string
          wordbook?: string
        }
        Relationships: []
      }
      deleted_students: {
        Row: {
          class_id: string | null
          created_at: string | null
          days_per_test: number
          deleted_at: string | null
          id: string
          name: string
          original_id: string
          test_start_date: string | null
          total_days: number
          wordbook: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          days_per_test?: number
          deleted_at?: string | null
          id: string
          name: string
          original_id: string
          test_start_date?: string | null
          total_days?: number
          wordbook: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          days_per_test?: number
          deleted_at?: string | null
          id?: string
          name?: string
          original_id?: string
          test_start_date?: string | null
          total_days?: number
          wordbook?: string
        }
        Relationships: [
          {
            foreignKeyName: "deleted_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "deleted_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      descriptive_scores: {
        Row: {
          average: number
          created_at: string | null
          id: string
          score: number
          student_id: string
          test_type: string
        }
        Insert: {
          average: number
          created_at?: string | null
          id?: string
          score: number
          student_id: string
          test_type: string
        }
        Update: {
          average?: number
          created_at?: string | null
          id?: string
          score?: number
          student_id?: string
          test_type?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          access_code: string
          access_level: string
          avatar: string | null
          birthday: string | null
          calendar_type: string | null
          created_at: string
          department: Database["public"]["Enums"]["employee_department"]
          id: string
          name: string
          position: string
          updated_at: string
        }
        Insert: {
          access_code: string
          access_level?: string
          avatar?: string | null
          birthday?: string | null
          calendar_type?: string | null
          created_at?: string
          department: Database["public"]["Enums"]["employee_department"]
          id?: string
          name: string
          position: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          access_level?: string
          avatar?: string | null
          birthday?: string | null
          calendar_type?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["employee_department"]
          id?: string
          name?: string
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string
          id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          start_date?: string
        }
        Relationships: []
      }
      manual_classes: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
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
          average: number
          created_at: string | null
          id: string
          score: number
          student_id: string
          test_type: string
        }
        Insert: {
          average: number
          created_at?: string | null
          id?: string
          score: number
          student_id: string
          test_type: string
        }
        Update: {
          average?: number
          created_at?: string | null
          id?: string
          score?: number
          student_id?: string
          test_type?: string
        }
        Relationships: []
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
        }
        Relationships: []
      }
      progress_records: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          homework: string | null
          id: string
          lesson_content: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          homework?: string | null
          id?: string
          lesson_content: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          homework?: string | null
          id?: string
          lesson_content?: string
          updated_at?: string
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
          created_at: string
          days_per_test: number
          id: string
          late: number | null
          name: string
          present: number | null
          regular_level: string | null
          special_level: string | null
          teachers: string | null
          test_start_date: string | null
          textbook: string | null
          total_days: number
          updated_at: string | null
          wordbook: string
        }
        Insert: {
          absent?: number | null
          class_id?: string | null
          course_period?: string | null
          course_scope?: string | null
          created_at?: string
          days_per_test?: number
          id?: string
          late?: number | null
          name: string
          present?: number | null
          regular_level?: string | null
          special_level?: string | null
          teachers?: string | null
          test_start_date?: string | null
          textbook?: string | null
          total_days?: number
          updated_at?: string | null
          wordbook: string
        }
        Update: {
          absent?: number | null
          class_id?: string | null
          course_period?: string | null
          course_scope?: string | null
          created_at?: string
          days_per_test?: number
          id?: string
          late?: number | null
          name?: string
          present?: number | null
          regular_level?: string | null
          special_level?: string | null
          teachers?: string | null
          test_start_date?: string | null
          textbook?: string | null
          total_days?: number
          updated_at?: string | null
          wordbook?: string
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
      tasks: {
        Row: {
          assigned_to: string[] | null
          created_at: string
          deleted_at: string | null
          description: string
          due_date: string | null
          id: string
          is_deleted: boolean | null
          priority: string
          progress: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string[] | null
          created_at?: string
          deleted_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          is_deleted?: boolean | null
          priority: string
          progress?: number
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string[] | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          is_deleted?: boolean | null
          priority?: string
          progress?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_comments: {
        Row: {
          avatar: string
          comment: string
          created_at: string | null
          id: string
          student_id: string
          teacher_name: string
        }
        Insert: {
          avatar: string
          comment: string
          created_at?: string | null
          id?: string
          student_id: string
          teacher_name: string
        }
        Update: {
          avatar?: string
          comment?: string
          created_at?: string | null
          id?: string
          student_id?: string
          teacher_name?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          avatar: string
          created_at: string | null
          id: string
          name: string
          title: string | null
        }
        Insert: {
          avatar: string
          created_at?: string | null
          id?: string
          name: string
          title?: string | null
        }
        Update: {
          avatar?: string
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
          student_name: string | null
          test_id: string
          total_count: number
        }
        Insert: {
          correct_count: number
          created_at?: string
          id?: string
          score: number
          student_answers: Json
          student_name?: string | null
          test_id: string
          total_count: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          score?: number
          student_answers?: Json
          student_name?: string | null
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
          created_at: string
          homework_completed: boolean | null
          homework_content: string | null
          id: string
          next_range_end: string | null
          next_range_start: string | null
          previous_range_end: string | null
          previous_range_start: string | null
          previous_result:
            | Database["public"]["Enums"]["test_result_type"]
            | null
          range_end: string
          range_start: string
          result: string | null
          student_id: string | null
          student_wordbook: string | null
          test_date: string
          updated_at: string | null
          wrong_count: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          homework_completed?: boolean | null
          homework_content?: string | null
          id?: string
          next_range_end?: string | null
          next_range_start?: string | null
          previous_range_end?: string | null
          previous_range_start?: string | null
          previous_result?:
            | Database["public"]["Enums"]["test_result_type"]
            | null
          range_end: string
          range_start: string
          result?: string | null
          student_id?: string | null
          student_wordbook?: string | null
          test_date: string
          updated_at?: string | null
          wrong_count?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          homework_completed?: boolean | null
          homework_content?: string | null
          id?: string
          next_range_end?: string | null
          next_range_start?: string | null
          previous_range_end?: string | null
          previous_range_start?: string | null
          previous_result?:
            | Database["public"]["Enums"]["test_result_type"]
            | null
          range_end?: string
          range_start?: string
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
        Relationships: [
          {
            foreignKeyName: "user_works_access_code_fkey"
            columns: ["access_code"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      veritas_access_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          is_admin: boolean | null
          last_accessed: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vocabulary_sets: {
        Row: {
          created_at: string
          id: string
          model_type: Database["public"]["Enums"]["ai_model_type"]
          title: string
          updated_at: string
          words: Json
        }
        Insert: {
          created_at?: string
          id?: string
          model_type?: Database["public"]["Enums"]["ai_model_type"]
          title: string
          updated_at?: string
          words: Json
        }
        Update: {
          created_at?: string
          id?: string
          model_type?: Database["public"]["Enums"]["ai_model_type"]
          title?: string
          updated_at?: string
          words?: Json
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
      delete_old_test_schedules: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      move_class_to_deleted: {
        Args: {
          class_id: string
        }
        Returns: undefined
      }
      restore_deleted_class: {
        Args: {
          deleted_class_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      ai_model_type: "claude" | "deepseek"
      employee_department: "administration" | "elementary" | "middle" | "high"
      test_result_type: "pass" | "fail" | "absent" | "not-taken"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
