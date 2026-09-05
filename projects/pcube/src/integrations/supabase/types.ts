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
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_admin: boolean
          last_used_at: string | null
          name: string
          role: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_admin?: boolean
          last_used_at?: string | null
          name: string
          role?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_admin?: boolean
          last_used_at?: string | null
          name?: string
          role?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          file_urls: Json | null
          id: string
          image_urls: string[] | null
          is_pinned: boolean
          owner_code_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_urls?: Json | null
          id?: string
          image_urls?: string[] | null
          is_pinned?: boolean
          owner_code_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_urls?: Json | null
          id?: string
          image_urls?: string[] | null
          is_pinned?: boolean
          owner_code_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          owner_code_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          owner_code_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          owner_code_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_word_submissions: {
        Row: {
          assignment_type: string | null
          created_at: string
          id: string
          photo_urls: string[] | null
          reviewed_at: string | null
          status: string
          student_id: string
          submission_date: string
          submitted_at: string
          teacher_note: string | null
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string
          id?: string
          photo_urls?: string[] | null
          reviewed_at?: string | null
          status?: string
          student_id: string
          submission_date?: string
          submitted_at?: string
          teacher_note?: string | null
        }
        Update: {
          assignment_type?: string | null
          created_at?: string
          id?: string
          photo_urls?: string[] | null
          reviewed_at?: string | null
          status?: string
          student_id?: string
          submission_date?: string
          submitted_at?: string
          teacher_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_word_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      dismissed_daily_words: {
        Row: {
          created_at: string
          dismissed_date: string
          id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          dismissed_date: string
          id?: string
          student_id: string
        }
        Update: {
          created_at?: string
          dismissed_date?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dismissed_daily_words_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string
          id: string
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          school_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          homework_group_id: string | null
          id: string
          owner_code_id: string | null
          passage_id: string | null
          round: number
          target_grade_id: string | null
          target_student_id: string | null
          target_type: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          homework_group_id?: string | null
          id?: string
          owner_code_id?: string | null
          passage_id?: string | null
          round?: number
          target_grade_id?: string | null
          target_student_id?: string | null
          target_type: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          homework_group_id?: string | null
          id?: string
          owner_code_id?: string | null
          passage_id?: string | null
          round?: number
          target_grade_id?: string | null
          target_student_id?: string | null
          target_type?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_target_grade_id_fkey"
            columns: ["target_grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_target_student_id_fkey"
            columns: ["target_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          created_at: string
          homework_id: string
          id: string
          photo_urls: string[] | null
          recording_timestamps: Json | null
          recording_url: string | null
          reviewed_at: string | null
          status: string
          student_id: string
          submitted_at: string | null
          teacher_note: string | null
        }
        Insert: {
          created_at?: string
          homework_id: string
          id?: string
          photo_urls?: string[] | null
          recording_timestamps?: Json | null
          recording_url?: string | null
          reviewed_at?: string | null
          status?: string
          student_id: string
          submitted_at?: string | null
          teacher_note?: string | null
        }
        Update: {
          created_at?: string
          homework_id?: string
          id?: string
          photo_urls?: string[] | null
          recording_timestamps?: Json | null
          recording_url?: string | null
          reviewed_at?: string | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          teacher_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exam_scores: {
        Row: {
          created_at: string
          exam_month: number
          exam_year: number
          id: string
          owner_code_id: string | null
          score: number
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_month: number
          exam_year: number
          id?: string
          owner_code_id?: string | null
          score: number
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_month?: number
          exam_year?: number
          id?: string
          owner_code_id?: string | null
          score?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_scores_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_exam_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          recipient_phone: string | null
          recipient_type: string | null
          sent_at: string | null
          status: string
          student_id: string
          submission_type: string | null
          teacher_note: string | null
          type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          recipient_phone?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          status?: string
          student_id: string
          submission_type?: string | null
          teacher_note?: string | null
          type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient_phone?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          status?: string
          student_id?: string
          submission_type?: string | null
          teacher_note?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      passages: {
        Row: {
          content: string
          created_at: string
          grade_id: string | null
          id: string
          korean_content: string | null
          owner_code_id: string | null
          school_id: string | null
          sentences: string[]
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          grade_id?: string | null
          id?: string
          korean_content?: string | null
          owner_code_id?: string | null
          school_id?: string | null
          sentences?: string[]
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          grade_id?: string | null
          id?: string
          korean_content?: string | null
          owner_code_id?: string | null
          school_id?: string | null
          sentences?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "passages_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passages_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_name: string | null
          id: string
          logo_url: string | null
          name: string
          owner_code_id: string | null
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_code_id?: string | null
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tag_assignments: {
        Row: {
          created_at: string
          id: string
          student_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tag_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "student_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          owner_code_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          owner_code_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          owner_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_tags_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          access_code_id: string | null
          created_at: string
          grade_id: string
          id: string
          name: string
          parent_email: string | null
          parent_phone: string | null
          student_phone: string | null
        }
        Insert: {
          access_code_id?: string | null
          created_at?: string
          grade_id: string
          id?: string
          name: string
          parent_email?: string | null
          parent_phone?: string | null
          student_phone?: string | null
        }
        Update: {
          access_code_id?: string | null
          created_at?: string
          grade_id?: string
          id?: string
          name?: string
          parent_email?: string | null
          parent_phone?: string | null
          student_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
        ]
      }
      writing_sentences: {
        Row: {
          created_at: string
          english_sentence: string
          id: string
          korean_sentence: string
          owner_code_id: string | null
          passage_id: string
          sentence_index: number
        }
        Insert: {
          created_at?: string
          english_sentence: string
          id?: string
          korean_sentence: string
          owner_code_id?: string | null
          passage_id: string
          sentence_index: number
        }
        Update: {
          created_at?: string
          english_sentence?: string
          id?: string
          korean_sentence?: string
          owner_code_id?: string | null
          passage_id?: string
          sentence_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "writing_sentences_owner_code_id_fkey"
            columns: ["owner_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "writing_sentences_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
        ]
      }
      writing_submissions: {
        Row: {
          attempted_at: string | null
          created_at: string
          homework_id: string
          id: string
          is_correct: boolean | null
          student_answer: string[]
          student_id: string
          writing_sentence_id: string
        }
        Insert: {
          attempted_at?: string | null
          created_at?: string
          homework_id: string
          id?: string
          is_correct?: boolean | null
          student_answer?: string[]
          student_id: string
          writing_sentence_id: string
        }
        Update: {
          attempted_at?: string | null
          created_at?: string
          homework_id?: string
          id?: string
          is_correct?: boolean | null
          student_answer?: string[]
          student_id?: string
          writing_sentence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "writing_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "writing_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "writing_submissions_writing_sentence_id_fkey"
            columns: ["writing_sentence_id"]
            isOneToOne: false
            referencedRelation: "writing_sentences"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
