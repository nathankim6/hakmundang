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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_code_card_sets: {
        Row: {
          access_code_id: string
          card_set_id: string
          created_at: string
          id: string
        }
        Insert: {
          access_code_id: string
          card_set_id: string
          created_at?: string
          id?: string
        }
        Update: {
          access_code_id?: string
          card_set_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_code_card_sets_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "student_access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      access_code_exams: {
        Row: {
          access_code_id: string
          created_at: string
          exam_id: string
          id: string
        }
        Insert: {
          access_code_id: string
          created_at?: string
          exam_id: string
          id?: string
        }
        Update: {
          access_code_id?: string
          created_at?: string
          exam_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_code_exams_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "student_access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_code_exams_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
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
      applications: {
        Row: {
          course_id: string
          created_at: string
          id: string
          parent_phone: string
          status: Database["public"]["Enums"]["application_status"]
          student_name: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          parent_phone: string
          status?: Database["public"]["Enums"]["application_status"]
          student_name: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          parent_phone?: string
          status?: Database["public"]["Enums"]["application_status"]
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string | null
          date: string
          id: string
          reason: string | null
          status: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          reason?: string | null
          status: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          reason?: string | null
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
      card_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_type: string
          card_set_id: string
          class_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          score: number | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_type: string
          card_set_id: string
          class_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_type?: string
          card_set_id?: string
          class_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_assignments_card_set_id_fkey"
            columns: ["card_set_id"]
            isOneToOne: false
            referencedRelation: "card_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      card_sets: {
        Row: {
          available_test_modes: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          include_derivatives: boolean | null
          selected_days: string[]
          test_type: string
          title: string
          updated_at: string
          word_data: Json
        }
        Insert: {
          available_test_modes?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          include_derivatives?: boolean | null
          selected_days?: string[]
          test_type?: string
          title: string
          updated_at?: string
          word_data?: Json
        }
        Update: {
          available_test_modes?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          include_derivatives?: boolean | null
          selected_days?: string[]
          test_type?: string
          title?: string
          updated_at?: string
          word_data?: Json
        }
        Relationships: []
      }
      categorized_veritas_pairs: {
        Row: {
          category: string
          correct_form: string
          created_at: string | null
          explanation: string | null
          id: string
          incorrect_form: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          correct_form: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          incorrect_form: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          correct_form?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          incorrect_form?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          question: string
          student_name: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          question: string
          student_name?: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          question?: string
          student_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_room_id: string | null
          employee_id: string | null
          id: string
          is_active: boolean
          joined_at: string
        }
        Insert: {
          chat_room_id?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
        }
        Update: {
          chat_room_id?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_classes_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          application_end_date: string | null
          application_start_date: string | null
          capacity: number
          created_at: string
          description: string | null
          enrolled: number
          fee: number
          grade: string
          id: string
          instructor: string
          poster: string | null
          schedule: string
          title: string
          updated_at: string
        }
        Insert: {
          application_end_date?: string | null
          application_start_date?: string | null
          capacity?: number
          created_at?: string
          description?: string | null
          enrolled?: number
          fee: number
          grade: string
          id?: string
          instructor: string
          poster?: string | null
          schedule: string
          title: string
          updated_at?: string
        }
        Update: {
          application_end_date?: string | null
          application_start_date?: string | null
          capacity?: number
          created_at?: string
          description?: string | null
          enrolled?: number
          fee?: number
          grade?: string
          id?: string
          instructor?: string
          poster?: string | null
          schedule?: string
          title?: string
          updated_at?: string
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
      deleted_test_results_backup: {
        Row: {
          correct_count: number
          deleted_at: string | null
          deleted_by: string | null
          id: string
          original_created_at: string
          original_id: string
          score: number
          student_answers: Json
          student_name: string
          test_id: string
          total_count: number
        }
        Insert: {
          correct_count: number
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          original_created_at: string
          original_id: string
          score: number
          student_answers: Json
          student_name: string
          test_id: string
          total_count: number
        }
        Update: {
          correct_count?: number
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          original_created_at?: string
          original_id?: string
          score?: number
          student_answers?: Json
          student_name?: string
          test_id?: string
          total_count?: number
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
      exam_questions: {
        Row: {
          choices: string[] | null
          correct_answer: string
          created_at: string
          english_definition: string | null
          exam_id: string
          example_sentence: string | null
          id: string
          meaning: string
          question_number: number
          question_type: string
          word: string
        }
        Insert: {
          choices?: string[] | null
          correct_answer: string
          created_at?: string
          english_definition?: string | null
          exam_id: string
          example_sentence?: string | null
          id?: string
          meaning: string
          question_number: number
          question_type: string
          word: string
        }
        Update: {
          choices?: string[] | null
          correct_answer?: string
          created_at?: string
          english_definition?: string | null
          exam_id?: string
          example_sentence?: string | null
          id?: string
          meaning?: string
          question_number?: number
          question_type?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          average_score: number
          created_at: string
          exam_history: Json
          id: string
          student_name: string
          student_session_id: string | null
          total_exams: number
          total_score: number
          updated_at: string
        }
        Insert: {
          average_score?: number
          created_at?: string
          exam_history?: Json
          id?: string
          student_name: string
          student_session_id?: string | null
          total_exams?: number
          total_score?: number
          updated_at?: string
        }
        Update: {
          average_score?: number
          created_at?: string
          exam_history?: Json
          id?: string
          student_name?: string
          student_session_id?: string | null
          total_exams?: number
          total_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      exam_submissions: {
        Row: {
          answers: Json
          correct_count: number | null
          exam_id: string | null
          id: string
          score: number | null
          student_class: string | null
          student_name: string
          student_session_id: string | null
          submitted_at: string
          total_count: number | null
        }
        Insert: {
          answers?: Json
          correct_count?: number | null
          exam_id?: string | null
          id?: string
          score?: number | null
          student_class?: string | null
          student_name: string
          student_session_id?: string | null
          submitted_at?: string
          total_count?: number | null
        }
        Update: {
          answers?: Json
          correct_count?: number | null
          exam_id?: string | null
          id?: string
          score?: number | null
          student_class?: string | null
          student_name?: string
          student_session_id?: string | null
          submitted_at?: string
          total_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          card_set_id: string
          created_at: string
          created_by: string | null
          definition_count: number
          example_count: number
          id: string
          is_ended: boolean | null
          multiple_choice_count: number
          selected_days: string[]
          spelling_count: number
          synonym_antonym_count: number | null
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          card_set_id: string
          created_at?: string
          created_by?: string | null
          definition_count?: number
          example_count?: number
          id?: string
          is_ended?: boolean | null
          multiple_choice_count: number
          selected_days?: string[]
          spelling_count: number
          synonym_antonym_count?: number | null
          title: string
          total_questions: number
          updated_at?: string
        }
        Update: {
          card_set_id?: string
          created_at?: string
          created_by?: string | null
          definition_count?: number
          example_count?: number
          id?: string
          is_ended?: boolean | null
          multiple_choice_count?: number
          selected_days?: string[]
          spelling_count?: number
          synonym_antonym_count?: number | null
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_card_set_id_fkey"
            columns: ["card_set_id"]
            isOneToOne: false
            referencedRelation: "card_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      external_access_codes: {
        Row: {
          code: string
          created_at: string
          expiry_date: string
          id: string
          is_admin: boolean | null
          last_accessed: string | null
          last_synced: string | null
          name: string
          source_project: string
          sync_status: string | null
          updated_at: string
          user_name: string
        }
        Insert: {
          code: string
          created_at?: string
          expiry_date: string
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          last_synced?: string | null
          name?: string
          source_project: string
          sync_status?: string | null
          updated_at?: string
          user_name?: string
        }
        Update: {
          code?: string
          created_at?: string
          expiry_date?: string
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          last_synced?: string | null
          name?: string
          source_project?: string
          sync_status?: string | null
          updated_at?: string
          user_name?: string
        }
        Relationships: []
      }
      generated_questions_storage: {
        Row: {
          access_code: string
          created_at: string
          id: string
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          access_code: string
          created_at?: string
          id?: string
          questions?: Json
          title: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          id?: string
          questions?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      header_settings: {
        Row: {
          created_at: string
          id: string
          logo_url: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string
          subtitle?: string
          title?: string
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
      homework_submissions: {
        Row: {
          answers: Json
          completed_at: string | null
          correct_count: number | null
          created_at: string
          homework_id: string
          id: string
          is_completed: boolean
          retry_count: number
          score: number | null
          student_class: string | null
          student_name: string
          student_phone_last4: string
          submitted_at: string
          time_spent_seconds: number | null
          total_count: number | null
          updated_at: string
          wrong_words: Json | null
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          correct_count?: number | null
          created_at?: string
          homework_id: string
          id?: string
          is_completed?: boolean
          retry_count?: number
          score?: number | null
          student_class?: string | null
          student_name: string
          student_phone_last4: string
          submitted_at?: string
          time_spent_seconds?: number | null
          total_count?: number | null
          updated_at?: string
          wrong_words?: Json | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          correct_count?: number | null
          created_at?: string
          homework_id?: string
          id?: string
          is_completed?: boolean
          retry_count?: number
          score?: number | null
          student_class?: string | null
          student_name?: string
          student_phone_last4?: string
          submitted_at?: string
          time_spent_seconds?: number | null
          total_count?: number | null
          updated_at?: string
          wrong_words?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homeworks"
            referencedColumns: ["id"]
          },
        ]
      }
      homeworks: {
        Row: {
          access_code_id: string
          card_set_id: string
          class_name: string | null
          created_at: string
          created_by: string | null
          due_date: string
          grade: string | null
          homework_types: string[]
          id: string
          is_active: boolean
          selected_days: string[]
          title: string
          updated_at: string
        }
        Insert: {
          access_code_id: string
          card_set_id: string
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          grade?: string | null
          homework_types?: string[]
          id?: string
          is_active?: boolean
          selected_days?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          access_code_id?: string
          card_set_id?: string
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          grade?: string | null
          homework_types?: string[]
          id?: string
          is_active?: boolean
          selected_days?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeworks_card_set_id_fkey"
            columns: ["card_set_id"]
            isOneToOne: false
            referencedRelation: "card_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      incorrect_options: {
        Row: {
          correct_text: string
          created_at: string | null
          explanation: string | null
          id: string
          incorrect_text: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          correct_text: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          incorrect_text: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          correct_text?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          incorrect_text?: string
          updated_at?: string | null
          usage_count?: number | null
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
          student_class: string | null
          student_grade: string | null
          student_name: string
          student_school: string | null
          sub_category_scores: Json
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
          student_class?: string | null
          student_grade?: string | null
          student_name: string
          student_school?: string | null
          sub_category_scores?: Json
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
          student_class?: string | null
          student_grade?: string | null
          student_name?: string
          student_school?: string | null
          sub_category_scores?: Json
          total_score?: number
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
      message_read_status: {
        Row: {
          employee_id: string | null
          id: string
          message_id: string | null
          read_at: string
        }
        Insert: {
          employee_id?: string | null
          id?: string
          message_id?: string | null
          read_at?: string
        }
        Update: {
          employee_id?: string | null
          id?: string
          message_id?: string | null
          read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_status_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_room_id: string | null
          content: string | null
          created_at: string
          file_name: string | null
          file_size: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          message_type: string
          metadata: Json | null
          sender_id: string | null
          updated_at: string
        }
        Insert: {
          chat_room_id?: string | null
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          message_type?: string
          metadata?: Json | null
          sender_id?: string | null
          updated_at?: string
        }
        Update: {
          chat_room_id?: string | null
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          message_type?: string
          metadata?: Json | null
          sender_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      my_wordbook: {
        Row: {
          created_at: string
          difficulty: string | null
          id: string
          last_reviewed: string | null
          meaning: string
          review_count: number | null
          student_name: string
          updated_at: string
          word: string
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          id?: string
          last_reviewed?: string | null
          meaning: string
          review_count?: number | null
          student_name: string
          updated_at?: string
          word: string
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          id?: string
          last_reviewed?: string | null
          meaning?: string
          review_count?: number | null
          student_name?: string
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      orun_access_codes: {
        Row: {
          code: string
          created_at: string
          expiry_date: string
          id: string
          is_admin: boolean | null
          last_accessed: string | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          expiry_date: string
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          expiry_date?: string
          id?: string
          is_admin?: boolean | null
          last_accessed?: string | null
          name?: string
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
          major_category: string | null
          middle_category: string | null
          source: string | null
          sub_category: string | null
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
          major_category?: string | null
          middle_category?: string | null
          source?: string | null
          sub_category?: string | null
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
          major_category?: string | null
          middle_category?: string | null
          source?: string | null
          sub_category?: string | null
          tags?: string[] | null
          translation?: string | null
        }
        Relationships: []
      }
      personal_wordbook: {
        Row: {
          card_set_title: string | null
          created_at: string
          id: string
          meaning: string
          updated_at: string
          user_session_id: string
          word: string
        }
        Insert: {
          card_set_title?: string | null
          created_at?: string
          id?: string
          meaning: string
          updated_at?: string
          user_session_id: string
          word: string
        }
        Update: {
          card_set_title?: string | null
          created_at?: string
          id?: string
          meaning?: string
          updated_at?: string
          user_session_id?: string
          word?: string
        }
        Relationships: []
      }
      problem_comments: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          photo_urls: string[] | null
          problem_id: string
          report_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          photo_urls?: string[] | null
          problem_id: string
          report_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          photo_urls?: string[] | null
          problem_id?: string
          report_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
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
      pronunciation_cache: {
        Row: {
          created_at: string | null
          id: string
          ipa: string | null
          korean: string | null
          updated_at: string | null
          word: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ipa?: string | null
          korean?: string | null
          updated_at?: string | null
          word: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ipa?: string | null
          korean?: string | null
          updated_at?: string | null
          word?: string
        }
        Relationships: []
      }
      qa_history: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          question: string
          response_count: number | null
          student_name: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question: string
          response_count?: number | null
          student_name: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question?: string
          response_count?: number | null
          student_name?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      report_cards: {
        Row: {
          analysis_type: string | null
          created_at: string
          difficult_problems_explanation: string | null
          exam_features: Json | null
          exam_info: string | null
          exam_scope: string
          grade: string
          highlights: Json | null
          hit_question_photos: string[] | null
          id: string
          killer_top5: Json | null
          objective_questions: number
          original_passages: string | null
          overall_evaluation: string | null
          passage_variants: Json | null
          problem_types: Json
          school: string
          school_average: number | null
          subjective_questions: number
          teacher: string
          teacher_photo: string | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          analysis_type?: string | null
          created_at?: string
          difficult_problems_explanation?: string | null
          exam_features?: Json | null
          exam_info?: string | null
          exam_scope: string
          grade: string
          highlights?: Json | null
          hit_question_photos?: string[] | null
          id?: string
          killer_top5?: Json | null
          objective_questions: number
          original_passages?: string | null
          overall_evaluation?: string | null
          passage_variants?: Json | null
          problem_types: Json
          school: string
          school_average?: number | null
          subjective_questions: number
          teacher: string
          teacher_photo?: string | null
          total_questions: number
          updated_at?: string
        }
        Update: {
          analysis_type?: string | null
          created_at?: string
          difficult_problems_explanation?: string | null
          exam_features?: Json | null
          exam_info?: string | null
          exam_scope?: string
          grade?: string
          highlights?: Json | null
          hit_question_photos?: string[] | null
          id?: string
          killer_top5?: Json | null
          objective_questions?: number
          original_passages?: string | null
          overall_evaluation?: string | null
          passage_variants?: Json | null
          problem_types?: Json
          school?: string
          school_average?: number | null
          subjective_questions?: number
          teacher?: string
          teacher_photo?: string | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      saved_mock_exams: {
        Row: {
          analysis_result: Json | null
          created_at: string
          description: string | null
          generated_questions: Json | null
          id: string
          question_configs: Json
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          description?: string | null
          generated_questions?: Json | null
          id?: string
          question_configs: Json
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          description?: string | null
          generated_questions?: Json | null
          id?: string
          question_configs?: Json
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_words: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          word_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          word_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_words_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
      special_class_comments: {
        Row: {
          class_id: string
          comment: string
          created_at: string
          id: string
          student_name: string
          updated_at: string
        }
        Insert: {
          class_id: string
          comment: string
          created_at?: string
          id?: string
          student_name: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          comment?: string
          created_at?: string
          id?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_class_comments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "special_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      special_class_reports: {
        Row: {
          class_id: string
          created_at: string
          id: string
          report_data: Json
          student_name: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          report_data: Json
          student_name: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          report_data?: Json
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_class_reports_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "special_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      special_class_students: {
        Row: {
          class_id: string
          created_at: string
          grade: string | null
          id: string
          school: string | null
          student_name: string
        }
        Insert: {
          class_id: string
          created_at?: string
          grade?: string | null
          id?: string
          school?: string | null
          student_name: string
        }
        Update: {
          class_id?: string
          created_at?: string
          grade?: string | null
          id?: string
          school?: string | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "special_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      special_classes: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          instructor: string
          name: string
          school: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          instructor: string
          name: string
          school?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          instructor?: string
          name?: string
          school?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_access_codes: {
        Row: {
          access_code: string
          created_at: string
          exam_code: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          last_accessed: string | null
          max_users: number | null
          name: string
          student_id: string | null
        }
        Insert: {
          access_code: string
          created_at?: string
          exam_code?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          last_accessed?: string | null
          max_users?: number | null
          name?: string
          student_id?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          exam_code?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          last_accessed?: string | null
          max_users?: number | null
          name?: string
          student_id?: string | null
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          answers: Json
          created_at: string
          grade: string
          id: string
          report_id: string
          school: string
          score: number | null
          student_name: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          grade: string
          id?: string
          report_id: string
          school: string
          score?: number | null
          student_name: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          grade?: string
          id?: string
          report_id?: string
          school?: string
          score?: number | null
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_cards"
            referencedColumns: ["id"]
          },
        ]
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
      student_wordbooks: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          school_id: string
          title: string
          updated_at: string | null
          word_ids: string[] | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          school_id: string
          title: string
          updated_at?: string | null
          word_ids?: string[] | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          school_id?: string
          title?: string
          updated_at?: string | null
          word_ids?: string[] | null
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ta_comments: {
        Row: {
          comment: string
          created_at: string
          date: string
          id: string
          teacher_name: string
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          date: string
          id?: string
          teacher_name: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          date?: string
          id?: string
          teacher_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_employee_progress: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          progress: number
          task_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          progress?: number
          task_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          progress?: number
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_employee_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_employee_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string[] | null
          attachments: string[] | null
          created_at: string
          created_by: string | null
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
          attachments?: string[] | null
          created_at?: string
          created_by?: string | null
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
          attachments?: string[] | null
          created_at?: string
          created_by?: string | null
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
      teacher_photos: {
        Row: {
          created_at: string | null
          id: string
          photo_url: string
          teacher_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_url: string
          teacher_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_url?: string
          teacher_name?: string | null
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
      test_schedules: {
        Row: {
          class_id: string | null
          created_at: string
          homework_completed: boolean | null
          homework_content: string | null
          id: string
          next_homework_completed: boolean | null
          next_homework_content: string | null
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
          teacher_comment: string | null
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
          next_homework_completed?: boolean | null
          next_homework_content?: string | null
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
          teacher_comment?: string | null
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
          next_homework_completed?: boolean | null
          next_homework_content?: string | null
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
          teacher_comment?: string | null
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
      user_subscriptions: {
        Row: {
          created_at: string
          expiry_date: string
          id: string
          is_active: boolean
          subscription_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date: string
          id?: string
          is_active?: boolean
          subscription_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string
          id?: string
          is_active?: boolean
          subscription_name?: string
          updated_at?: string
          user_id?: string
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
      veritas_analyzed_pairs: {
        Row: {
          category: string
          correct_text: string
          created_at: string
          id: string
          incorrect_text: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          category: string
          correct_text: string
          created_at?: string
          id?: string
          incorrect_text: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          category?: string
          correct_text?: string
          created_at?: string
          id?: string
          incorrect_text?: string
          updated_at?: string
          usage_count?: number
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
      word_images: {
        Row: {
          card_set_id: string | null
          created_at: string
          id: string
          image_url: string
          word: string
        }
        Insert: {
          card_set_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          word: string
        }
        Update: {
          card_set_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          word?: string
        }
        Relationships: []
      }
      word_quiz_cache: {
        Row: {
          choices: Json | null
          correct_answers: Json | null
          created_at: string
          english_definition: string
          id: string
          korean_pronunciation: string | null
          meaning: string
          part_of_speech: string
          phonetic_transcription: string | null
          quiz_type: string | null
          updated_at: string
          word: string
          wrong_choices: string[]
        }
        Insert: {
          choices?: Json | null
          correct_answers?: Json | null
          created_at?: string
          english_definition: string
          id?: string
          korean_pronunciation?: string | null
          meaning: string
          part_of_speech: string
          phonetic_transcription?: string | null
          quiz_type?: string | null
          updated_at?: string
          word: string
          wrong_choices: string[]
        }
        Update: {
          choices?: Json | null
          correct_answers?: Json | null
          created_at?: string
          english_definition?: string
          id?: string
          korean_pronunciation?: string | null
          meaning?: string
          part_of_speech?: string
          phonetic_transcription?: string | null
          quiz_type?: string | null
          updated_at?: string
          word?: string
          wrong_choices?: string[]
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
      youtube_videos: {
        Row: {
          created_at: string
          creator_avatar: string
          creator_id: string
          creator_name: string
          description: string | null
          duration: string
          id: string
          published_at: string
          school: string
          thumbnail: string
          title: string
          views: string
        }
        Insert: {
          created_at?: string
          creator_avatar: string
          creator_id: string
          creator_name: string
          description?: string | null
          duration: string
          id: string
          published_at: string
          school: string
          thumbnail: string
          title: string
          views: string
        }
        Update: {
          created_at?: string
          creator_avatar?: string
          creator_id?: string
          creator_name?: string
          description?: string | null
          duration?: string
          id?: string
          published_at?: string
          school?: string
          thumbnail?: string
          title?: string
          views?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_access_code: {
        Args: { admin_code: string; new_code: string; new_expiry_date: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "access_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_delete_access_code: {
        Args: { admin_code: string; target_code: string }
        Returns: boolean
      }
      admin_extend_access_code: {
        Args: {
          admin_code: string
          new_expiry_date: string
          target_code: string
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "access_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_access_codes: {
        Args: { admin_code: string }
        Returns: {
          code: string
          created_at: string
          expiry_date: string
          is_admin: boolean
          last_accessed: string
          name: string
          problem_count: number
          user_name: string
        }[]
      }
      admin_update_access_code_profile: {
        Args: {
          admin_code: string
          new_name: string
          new_user_name: string
          target_code: string
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "access_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      clean_choice_text: { Args: { input_text: string }; Returns: string }
      cleanup_orphaned_student_history: { Args: never; Returns: undefined }
      delete_old_generated_questions: { Args: never; Returns: undefined }
      delete_old_test_schedules: { Args: never; Returns: undefined }
      delete_test_result_by_id: {
        Args: { result_id: string }
        Returns: boolean
      }
      generate_random_access_code: {
        Args: { length?: number }
        Returns: string
      }
      get_current_employee_id: { Args: never; Returns: string }
      is_admin_access_code: { Args: { input_code: string }; Returns: boolean }
      move_class_to_deleted: { Args: { class_id: string }; Returns: undefined }
      normalize_for_comparison: {
        Args: { text_input: string }
        Returns: string
      }
      regrade_all_submissions: {
        Args: never
        Returns: {
          new_correct: number
          new_score: number
          old_correct: number
          old_score: number
          submission_id: string
        }[]
      }
      regrade_exam_submissions: {
        Args: never
        Returns: {
          new_correct: number
          new_score: number
          old_correct: number
          old_score: number
          submission_id: string
        }[]
      }
      restore_deleted_class: {
        Args: { deleted_class_id: string }
        Returns: undefined
      }
      restore_test_result: { Args: { backup_id: string }; Returns: boolean }
      safe_delete_test: { Args: { test_id_param: string }; Returns: boolean }
      sync_external_access_codes: { Args: never; Returns: undefined }
      touch_access_code: { Args: { input_code: string }; Returns: undefined }
      validate_access_code: {
        Args: { input_code: string }
        Returns: {
          expiry_date: string
          is_admin: boolean
          name: string
          user_name: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      ai_model_type: "claude" | "deepseek"
      application_status: "pending" | "approved" | "on_hold"
      employee_department:
        | "administration"
        | "elementary"
        | "middle"
        | "high"
        | "operations"
      test_result_type: "pass" | "fail" | "absent" | "not-taken"
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
      ai_model_type: ["claude", "deepseek"],
      application_status: ["pending", "approved", "on_hold"],
      employee_department: [
        "administration",
        "elementary",
        "middle",
        "high",
        "operations",
      ],
      test_result_type: ["pass", "fail", "absent", "not-taken"],
    },
  },
} as const
