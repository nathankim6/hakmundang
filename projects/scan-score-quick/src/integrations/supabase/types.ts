export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          academy: string
          code: string
          created_at: string
          expiry_date: string
          id: string
          is_admin: boolean | null
          last_accessed: string | null
          name: string
          scope: string
          user_name: string
        }
        Insert: {
          academy?: string
          code: string
          created_at?: string
          expiry_date: string
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          name?: string
          scope?: string
          user_name?: string
        }
        Update: {
          academy?: string
          code?: string
          created_at?: string
          expiry_date?: string
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          name?: string
          scope?: string
          user_name?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
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
          progress?: string
          schedule?: string
          start_date?: string | null
          teacher?: string
          teacher_id?: string | null
          wordbook?: string
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
      deletion_log: {
        Row: {
          associated_records: number | null
          created_at: string
          deleted_at: string
          id: string
          record_id: string
          table_name: string
        }
        Insert: {
          associated_records?: number | null
          created_at?: string
          deleted_at?: string
          id?: string
          record_id: string
          table_name: string
        }
        Update: {
          associated_records?: number | null
          created_at?: string
          deleted_at?: string
          id?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      level_test_results: {
        Row: {
          academy: string
          answers: Json
          created_at: string
          elapsed_time: number
          grade_overrides: Json | null
          id: string
          level: string
          section_scores: Json
          special_class_assignments: Json | null
          student_grade: string | null
          student_name: string
          student_school: string | null
          sub_category_scores: Json
          test_version: string
          total_score: number
        }
        Insert: {
          academy?: string
          answers?: Json
          created_at?: string
          elapsed_time?: number
          grade_overrides?: Json | null
          id?: string
          level?: string
          section_scores?: Json
          special_class_assignments?: Json | null
          student_grade?: string | null
          student_name: string
          student_school?: string | null
          sub_category_scores?: Json
          test_version?: string
          total_score?: number
        }
        Update: {
          academy?: string
          answers?: Json
          created_at?: string
          elapsed_time?: number
          grade_overrides?: Json | null
          id?: string
          level?: string
          section_scores?: Json
          special_class_assignments?: Json | null
          student_grade?: string | null
          student_name?: string
          student_school?: string | null
          sub_category_scores?: Json
          test_version?: string
          total_score?: number
        }
        Relationships: []
      }
      student_test_history: {
        Row: {
          average_score: number | null
          created_at: string | null
          id: string
          student_class: string | null
          student_name: string
          test_count: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          average_score?: number | null
          created_at?: string | null
          id?: string
          student_class?: string | null
          student_name: string
          test_count?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          average_score?: number | null
          created_at?: string | null
          id?: string
          student_class?: string | null
          student_name?: string
          test_count?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_group_names: {
        Row: {
          created_at: string
          custom_name: string
          id: string
          original_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_name: string
          id?: string
          original_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_name?: string
          id?: string
          original_name?: string
          updated_at?: string
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
      tests: {
        Row: {
          answers: Json
          created_at: string
          id: string
          is_ended: boolean | null
          question_count: number
          subtitle: string | null
          test_id: string
          title: string
          writing_questions: Json | null
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          is_ended?: boolean | null
          question_count: number
          subtitle?: string | null
          test_id: string
          title: string
          writing_questions?: Json | null
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          is_ended?: boolean | null
          question_count?: number
          subtitle?: string | null
          test_id?: string
          title?: string
          writing_questions?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vocabulary_distractors: {
        Row: {
          correct_answer: string
          created_at: string
          distractors: string[]
          id: string
          question_id: number
          updated_at: string
          word: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          distractors: string[]
          id?: string
          question_id: number
          updated_at?: string
          word: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          distractors?: string[]
          id?: string
          question_id?: number
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
