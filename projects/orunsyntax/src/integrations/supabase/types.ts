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
          allowed_workbooks: string[] | null
          code: string
          created_at: string
          id: string
          last_used_at: string | null
          use_count: number
        }
        Insert: {
          allowed_workbooks?: string[] | null
          code: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          use_count?: number
        }
        Update: {
          allowed_workbooks?: string[] | null
          code?: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          use_count?: number
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          answer: string
          choices: string[]
          created_at: string
          error_rate: string | null
          explanation: string | null
          id: string
          month: string
          passage: string
          position_in_week: number | null
          question_id: number
          question_number: string
          question_prompt: string
          question_type: string
          translation: string | null
          updated_at: string
          vocabulary: Json | null
          week_number: number | null
          workbook_id: string
          year: string
        }
        Insert: {
          answer: string
          choices?: string[]
          created_at?: string
          error_rate?: string | null
          explanation?: string | null
          id?: string
          month: string
          passage: string
          position_in_week?: number | null
          question_id: number
          question_number: string
          question_prompt: string
          question_type: string
          translation?: string | null
          updated_at?: string
          vocabulary?: Json | null
          week_number?: number | null
          workbook_id?: string
          year: string
        }
        Update: {
          answer?: string
          choices?: string[]
          created_at?: string
          error_rate?: string | null
          explanation?: string | null
          id?: string
          month?: string
          passage?: string
          position_in_week?: number | null
          question_id?: number
          question_number?: string
          question_prompt?: string
          question_type?: string
          translation?: string | null
          updated_at?: string
          vocabulary?: Json | null
          week_number?: number | null
          workbook_id?: string
          year?: string
        }
        Relationships: []
      }
      question_grammar_categories: {
        Row: {
          category: string
          created_at: string
          id: string
          question_id: number
          updated_at: string
          workbook_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          question_id: number
          updated_at?: string
          workbook_id?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          question_id?: number
          updated_at?: string
          workbook_id?: string
        }
        Relationships: []
      }
      syntax_analyses: {
        Row: {
          analysis: string
          created_at: string
          id: string
          question_id: number
          updated_at: string
          workbook_id: string
        }
        Insert: {
          analysis: string
          created_at?: string
          id?: string
          question_id: number
          updated_at?: string
          workbook_id?: string
        }
        Update: {
          analysis?: string
          created_at?: string
          id?: string
          question_id?: number
          updated_at?: string
          workbook_id?: string
        }
        Relationships: []
      }
      weekly_vocabulary: {
        Row: {
          created_at: string
          grade: string
          id: string
          updated_at: string
          vocabulary: Json
          week_number: number
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          updated_at?: string
          vocabulary?: Json
          week_number: number
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          updated_at?: string
          vocabulary?: Json
          week_number?: number
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
