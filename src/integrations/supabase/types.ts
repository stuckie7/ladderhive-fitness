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
      daily_progress: {
        Row: {
          active_minutes: number
          active_minutes_goal: number
          created_at: string
          date: string
          id: string
          step_count: number
          step_goal: number
          updated_at: string
          user_id: string
          workouts_completed: number
          workouts_goal: number
        }
        Insert: {
          active_minutes?: number
          active_minutes_goal?: number
          created_at?: string
          date?: string
          id?: string
          step_count?: number
          step_goal?: number
          updated_at?: string
          user_id: string
          workouts_completed?: number
          workouts_goal?: number
        }
        Update: {
          active_minutes?: number
          active_minutes_goal?: number
          created_at?: string
          date?: string
          id?: string
          step_count?: number
          step_goal?: number
          updated_at?: string
          user_id?: string
          workouts_completed?: number
          workouts_goal?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          first_name: string | null
          fitness_goals: string[] | null
          fitness_level: string | null
          gender: string | null
          height: number | null
          id: string
          last_name: string | null
          updated_at: string
          weight: number | null
          workout_days: string[] | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          first_name?: string | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          id: string
          last_name?: string | null
          updated_at?: string
          weight?: number | null
          workout_days?: string[] | null
        }
        Update: {
          age?: number | null
          created_at?: string
          first_name?: string | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string
          weight?: number | null
          workout_days?: string[] | null
        }
        Relationships: []
      }
      user_workouts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          planned_for: string | null
          status: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          planned_for?: string | null
          status: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          planned_for?: string | null
          status?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workouts_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          duration: number
          exercises: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty: string
          duration: number
          exercises: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration?: number
          exercises?: number
          id?: string
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
