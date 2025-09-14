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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          id: string
          is_on_time: boolean
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          id?: string
          is_on_time: boolean
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          id?: string
          is_on_time?: boolean
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          class: Database["public"]["Enums"]["class_type"]
          created_at: string
          description: string | null
          due_date: string
          id: string
          subject_id: string
          title: string
        }
        Insert: {
          class: Database["public"]["Enums"]["class_type"]
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          subject_id: string
          title: string
        }
        Update: {
          class?: Database["public"]["Enums"]["class_type"]
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          is_present: boolean
          student_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_present: boolean
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_present?: boolean
          student_id?: string
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
      bri_snapshots: {
        Row: {
          bri_score: number
          contributing_factors: Json | null
          created_at: string
          id: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          student_id: string
          week_start_date: string
        }
        Insert: {
          bri_score: number
          contributing_factors?: Json | null
          created_at?: string
          id?: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          student_id: string
          week_start_date: string
        }
        Update: {
          bri_score?: number
          contributing_factors?: Json | null
          created_at?: string
          id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          student_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "bri_snapshots_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          class: Database["public"]["Enums"]["class_type"] | null
          content: string
          created_at: string
          id: string
          sentiment_label: string | null
          sentiment_score: number | null
        }
        Insert: {
          category: string
          class?: Database["public"]["Enums"]["class_type"] | null
          content: string
          created_at?: string
          id?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
        }
        Update: {
          category?: string
          class?: Database["public"]["Enums"]["class_type"] | null
          content?: string
          created_at?: string
          id?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
        }
        Relationships: []
      }
      group_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sentiment_label: string | null
          sentiment_score: number | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_config: {
        Row: {
          assignments_weight: number | null
          attendance_weight: number | null
          created_at: string
          high_risk_threshold: number | null
          id: string
          low_risk_threshold: number | null
          marks_weight: number | null
          sentiment_weight: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignments_weight?: number | null
          attendance_weight?: number | null
          created_at?: string
          high_risk_threshold?: number | null
          id?: string
          low_risk_threshold?: number | null
          marks_weight?: number | null
          sentiment_weight?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignments_weight?: number | null
          attendance_weight?: number | null
          created_at?: string
          high_risk_threshold?: number | null
          id?: string
          low_risk_threshold?: number | null
          marks_weight?: number | null
          sentiment_weight?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          class: Database["public"]["Enums"]["class_type"] | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          roll_no: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          class?: Database["public"]["Enums"]["class_type"] | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          roll_no?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          class?: Database["public"]["Enums"]["class_type"] | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          roll_no?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          counsellor_id: string | null
          created_at: string
          id: string
          notes: string | null
          reason: string
          referred_by: string
          status: Database["public"]["Enums"]["referral_status"] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          counsellor_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reason: string
          referred_by: string
          status?: Database["public"]["Enums"]["referral_status"] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          counsellor_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string
          referred_by?: string
          status?: Database["public"]["Enums"]["referral_status"] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          assignments_on_time_percentage: number | null
          average_marks: number | null
          created_at: string
          current_bri: number | null
          id: string
          overall_attendance_percentage: number | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          assignments_on_time_percentage?: number | null
          average_marks?: number | null
          created_at?: string
          current_bri?: number | null
          id?: string
          overall_attendance_percentage?: number | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          assignments_on_time_percentage?: number | null
          average_marks?: number | null
          created_at?: string
          current_bri?: number | null
          id?: string
          overall_attendance_percentage?: number | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class: Database["public"]["Enums"]["class_type"]
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          class: Database["public"]["Enums"]["class_type"]
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          class?: Database["public"]["Enums"]["class_type"]
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          created_at: string
          id: string
          marks_obtained: number
          student_id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          marks_obtained: number
          student_id: string
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          marks_obtained?: number
          student_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          class: Database["public"]["Enums"]["class_type"]
          created_at: string
          id: string
          max_marks: number
          subject_id: string
          test_date: string
          title: string
        }
        Insert: {
          class: Database["public"]["Enums"]["class_type"]
          created_at?: string
          id?: string
          max_marks: number
          subject_id: string
          test_date: string
          title: string
        }
        Update: {
          class?: Database["public"]["Enums"]["class_type"]
          created_at?: string
          id?: string
          max_marks?: number
          subject_id?: string
          test_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_student: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      class_type: "CSE-K" | "CSE-D"
      referral_status: "Open" | "In Progress" | "Closed"
      risk_level: "Low" | "At Risk" | "High"
      user_role: "student" | "staff" | "admin" | "counsellor"
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
      class_type: ["CSE-K", "CSE-D"],
      referral_status: ["Open", "In Progress", "Closed"],
      risk_level: ["Low", "At Risk", "High"],
      user_role: ["student", "staff", "admin", "counsellor"],
    },
  },
} as const
