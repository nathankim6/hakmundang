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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      day_groups: {
        Row: {
          created_at: string
          day_name: string
          id: string
          sort_order: number
          workbook_id: string
        }
        Insert: {
          created_at?: string
          day_name: string
          id?: string
          sort_order?: number
          workbook_id: string
        }
        Update: {
          created_at?: string
          day_name?: string
          id?: string
          sort_order?: number
          workbook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_groups_workbook_id_fkey"
            columns: ["workbook_id"]
            isOneToOne: false
            referencedRelation: "workbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      organized_vocab_projects: {
        Row: {
          created_at: string
          id: string
          name: string
          total_days: number
          total_words: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          total_days?: number
          total_words?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          total_days?: number
          total_words?: number
          updated_at?: string
        }
        Relationships: []
      }
      organized_vocab_words: {
        Row: {
          created_at: string
          day_name: string
          id: string
          meaning: string
          project_id: string
          sort_order: number
          word: string
        }
        Insert: {
          created_at?: string
          day_name: string
          id?: string
          meaning: string
          project_id: string
          sort_order?: number
          word: string
        }
        Update: {
          created_at?: string
          day_name?: string
          id?: string
          meaning?: string
          project_id?: string
          sort_order?: number
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "organized_vocab_words_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "organized_vocab_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sungnam_meaning_examples: {
        Row: {
          created_at: string
          examples: Json
          updated_at: string
          word: string
        }
        Insert: {
          created_at?: string
          examples: Json
          updated_at?: string
          word: string
        }
        Update: {
          created_at?: string
          examples?: Json
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
      word_examples: {
        Row: {
          created_at: string
          english: string
          id: string
          korean: string | null
          sort_order: number
          word_id: string
        }
        Insert: {
          created_at?: string
          english: string
          id?: string
          korean?: string | null
          sort_order?: number
          word_id: string
        }
        Update: {
          created_at?: string
          english?: string
          id?: string
          korean?: string | null
          sort_order?: number
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_examples_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          antonyms: string[] | null
          antonyms_korean: string[] | null
          created_at: string
          day_group_id: string
          english_definition: string | null
          etymology: string | null
          id: string
          image_url: string | null
          meaning: string
          part_of_speech: string | null
          pronunciation: string | null
          sort_order: number
          synonyms: string[] | null
          synonyms_korean: string[] | null
          word: string
          word_type: string | null
        }
        Insert: {
          antonyms?: string[] | null
          antonyms_korean?: string[] | null
          created_at?: string
          day_group_id: string
          english_definition?: string | null
          etymology?: string | null
          id?: string
          image_url?: string | null
          meaning: string
          part_of_speech?: string | null
          pronunciation?: string | null
          sort_order?: number
          synonyms?: string[] | null
          synonyms_korean?: string[] | null
          word: string
          word_type?: string | null
        }
        Update: {
          antonyms?: string[] | null
          antonyms_korean?: string[] | null
          created_at?: string
          day_group_id?: string
          english_definition?: string | null
          etymology?: string | null
          id?: string
          image_url?: string | null
          meaning?: string
          part_of_speech?: string | null
          pronunciation?: string | null
          sort_order?: number
          synonyms?: string[] | null
          synonyms_korean?: string[] | null
          word?: string
          word_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "words_day_group_id_fkey"
            columns: ["day_group_id"]
            isOneToOne: false
            referencedRelation: "day_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      workbooks: {
        Row: {
          cover_subtitle: string | null
          created_at: string
          difficulty_level: string
          id: string
          include_examples: boolean
          secondary_color: string
          theme_color: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_subtitle?: string | null
          created_at?: string
          difficulty_level?: string
          id?: string
          include_examples?: boolean
          secondary_color?: string
          theme_color?: string
          title?: string
          updated_at?: string
        }
        Update: {
          cover_subtitle?: string | null
          created_at?: string
          difficulty_level?: string
          id?: string
          include_examples?: boolean
          secondary_color?: string
          theme_color?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      load_workbook_data: { Args: { p_workbook_id: string }; Returns: Json }
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
