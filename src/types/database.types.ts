
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          id: string
          admin_user_id: string
          target_user_id: string | null
          entity_id: string | null
          entity_type: string
          action_type: string
          details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          admin_user_id: string
          target_user_id?: string | null
          entity_id?: string | null
          entity_type: string
          action_type: string
          details?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          admin_user_id?: string
          target_user_id?: string | null
          entity_id?: string | null
          entity_type?: string
          action_type?: string
          details?: Json | null
          created_at?: string | null
        }
      }
      daily_progress: {
        Row: {
          id: string
          user_id: string
          date: string
          step_count: number
          step_goal: number
          active_minutes: number
          active_minutes_goal: number
          workouts_completed: number
          workouts_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          step_count?: number
          step_goal?: number
          active_minutes?: number
          active_minutes_goal?: number
          workouts_completed?: number
          workouts_goal?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          step_count?: number
          step_goal?: number
          active_minutes?: number
          active_minutes_goal?: number
          workouts_completed?: number
          workouts_goal?: number
          created_at?: string
          updated_at?: string
        }
      }
      exercises_full: {
        Row: {
          id: number
          name: string
          prime_mover_muscle: string | null
          secondary_muscle: string | null
          tertiary_muscle: string | null
          exercise_classification: string | null
          laterality: string | null
          mechanics: string | null
          force_type: string | null
          body_region: string | null
          plane_of_motion_1: string | null
          plane_of_motion_2: string | null
          plane_of_motion_3: string | null
          movement_pattern_1: string | null
          movement_pattern_2: string | null
          movement_pattern_3: string | null
          posture: string | null
          primary_equipment: string | null
          secondary_equipment: string | null
          primary_items_count: number | null
          secondary_items_count: number | null
          single_or_double_arm: string | null
          arm_movement_pattern: string | null
          grip: string | null
          load_position: string | null
          leg_movement_pattern: string | null
          foot_elevation: string | null
          combination_exercise: boolean | null
          difficulty: string | null
          short_youtube_demo: string | null
          in_depth_youtube_exp: string | null
          youtube_thumbnail_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: number
          name: string
          prime_mover_muscle?: string | null
          secondary_muscle?: string | null
          tertiary_muscle?: string | null
          exercise_classification?: string | null
          laterality?: string | null
          mechanics?: string | null
          force_type?: string | null
          body_region?: string | null
          plane_of_motion_1?: string | null
          plane_of_motion_2?: string | null
          plane_of_motion_3?: string | null
          movement_pattern_1?: string | null
          movement_pattern_2?: string | null
          movement_pattern_3?: string | null
          posture?: string | null
          primary_equipment?: string | null
          secondary_equipment?: string | null
          primary_items_count?: number | null
          secondary_items_count?: number | null
          single_or_double_arm?: string | null
          arm_movement_pattern?: string | null
          grip?: string | null
          load_position?: string | null
          leg_movement_pattern?: string | null
          foot_elevation?: string | null
          combination_exercise?: boolean | null
          difficulty?: string | null
          short_youtube_demo?: string | null
          in_depth_youtube_exp?: string | null
          youtube_thumbnail_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          prime_mover_muscle?: string | null
          secondary_muscle?: string | null
          tertiary_muscle?: string | null
          exercise_classification?: string | null
          laterality?: string | null
          mechanics?: string | null
          force_type?: string | null
          body_region?: string | null
          plane_of_motion_1?: string | null
          plane_of_motion_2?: string | null
          plane_of_motion_3?: string | null
          movement_pattern_1?: string | null
          movement_pattern_2?: string | null
          movement_pattern_3?: string | null
          posture?: string | null
          primary_equipment?: string | null
          secondary_equipment?: string | null
          primary_items_count?: number | null
          secondary_items_count?: number | null
          single_or_double_arm?: string | null
          arm_movement_pattern?: string | null
          grip?: string | null
          load_position?: string | null
          leg_movement_pattern?: string | null
          foot_elevation?: string | null
          combination_exercise?: boolean | null
          difficulty?: string | null
          short_youtube_demo?: string | null
          in_depth_youtube_exp?: string | null
          youtube_thumbnail_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      forum_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          slug: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          slug: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          slug?: string
          sort_order?: number
          created_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: number
          thread_id: number
          user_id: string | null
          content: string
          attachments: Json | null
          is_solution: boolean
          parent_post_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          thread_id: number
          user_id?: string | null
          content: string
          attachments?: Json | null
          is_solution?: boolean
          parent_post_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          thread_id?: number
          user_id?: string | null
          content?: string
          attachments?: Json | null
          is_solution?: boolean
          parent_post_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: number
          category_id: number
          user_id: string | null
          title: string
          slug: string
          view_count: number
          is_pinned: boolean
          is_locked: boolean
          is_solved: boolean | null
          solved_at: string | null
          last_activity_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          category_id: number
          user_id?: string | null
          title: string
          slug: string
          view_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          solved_at?: string | null
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          category_id?: number
          user_id?: string | null
          title?: string
          slug?: string
          view_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          solved_at?: string | null
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      prepared_workouts: {
        Row: {
          id: string
          title: string
          description: string | null
          short_description: string | null
          duration_minutes: number
          difficulty: string
          category: string
          goal: string | null
          thumbnail_url: string | null
          video_url: string | null
          long_description: string | null
          equipment_needed: string | null
          benefits: string | null
          instructions: string | null
          modifications: string | null
          user_id: string | null
          is_template: boolean | null
          admin_featured: boolean | null
          admin_suggested: boolean | null
          admin_priority: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          short_description?: string | null
          duration_minutes: number
          difficulty: string
          category: string
          goal?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          long_description?: string | null
          equipment_needed?: string | null
          benefits?: string | null
          instructions?: string | null
          modifications?: string | null
          user_id?: string | null
          is_template?: boolean | null
          admin_featured?: boolean | null
          admin_suggested?: boolean | null
          admin_priority?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          short_description?: string | null
          duration_minutes?: number
          difficulty?: string
          category?: string
          goal?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          long_description?: string | null
          equipment_needed?: string | null
          benefits?: string | null
          instructions?: string | null
          modifications?: string | null
          user_id?: string | null
          is_template?: boolean | null
          admin_featured?: boolean | null
          admin_suggested?: boolean | null
          admin_priority?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      prepared_workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: number
          sets: number
          reps: string
          rest_seconds: number
          order_index: number
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: number
          sets: number
          reps: string
          rest_seconds: number
          order_index: number
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: number
          sets?: number
          reps?: string
          rest_seconds?: number
          order_index?: number
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          username: string | null
          avatar_url: string | null
          profile_photo_url: string | null
          bio: string | null
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          fitness_level: string | null
          fitness_goals: string[] | null
          workout_days: string[] | null
          chest: number | null
          waist: number | null
          hips: number | null
          neck: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          avatar_url?: string | null
          profile_photo_url?: string | null
          bio?: string | null
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          fitness_level?: string | null
          fitness_goals?: string[] | null
          workout_days?: string[] | null
          chest?: number | null
          waist?: number | null
          hips?: number | null
          neck?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          avatar_url?: string | null
          profile_photo_url?: string | null
          bio?: string | null
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          fitness_level?: string | null
          fitness_goals?: string[] | null
          workout_days?: string[] | null
          chest?: number | null
          waist?: number | null
          hips?: number | null
          neck?: number | null
          created_at?: string
          updated_at?: string
        }
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
