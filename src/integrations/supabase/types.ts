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
      equipment: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exercise_calories: {
        Row: {
          calories_per_minute: number
          exercise_name: string
          id: string
          intensity_level: string
          notes: string | null
        }
        Insert: {
          calories_per_minute: number
          exercise_name: string
          id?: string
          intensity_level: string
          notes?: string | null
        }
        Update: {
          calories_per_minute?: number
          exercise_name?: string
          id?: string
          intensity_level?: string
          notes?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          equipment: string | null
          id: string
          image_url: string | null
          instructions: string | null
          muscle_group: string | null
          muscle_groups: string[] | null
          name: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group?: string | null
          muscle_groups?: string[] | null
          name: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group?: string | null
          muscle_groups?: string[] | null
          name?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      exercises_full: {
        Row: {
          arm_movement_pattern: string | null
          body_region: string | null
          combination_exercise: boolean | null
          created_at: string | null
          difficulty: string | null
          exercise_classification: string | null
          foot_elevation: string | null
          force_type: string | null
          grip: string | null
          id: number
          in_depth_youtube_exp: string | null
          laterality: string | null
          leg_movement_pattern: string | null
          load_position: string | null
          mechanics: string | null
          movement_pattern_1: string | null
          movement_pattern_2: string | null
          movement_pattern_3: string | null
          name: string
          plane_of_motion_1: string | null
          plane_of_motion_2: string | null
          plane_of_motion_3: string | null
          posture: string | null
          primary_equipment: string | null
          primary_items_count: number | null
          prime_mover_muscle: string | null
          secondary_equipment: string | null
          secondary_items_count: number | null
          secondary_muscle: string | null
          short_youtube_demo: string | null
          single_or_double_arm: string | null
          tertiary_muscle: string | null
          updated_at: string | null
          youtube_thumbnail_url: string | null
        }
        Insert: {
          arm_movement_pattern?: string | null
          body_region?: string | null
          combination_exercise?: boolean | null
          created_at?: string | null
          difficulty?: string | null
          exercise_classification?: string | null
          foot_elevation?: string | null
          force_type?: string | null
          grip?: string | null
          id?: never
          in_depth_youtube_exp?: string | null
          laterality?: string | null
          leg_movement_pattern?: string | null
          load_position?: string | null
          mechanics?: string | null
          movement_pattern_1?: string | null
          movement_pattern_2?: string | null
          movement_pattern_3?: string | null
          name?: string
          plane_of_motion_1?: string | null
          plane_of_motion_2?: string | null
          plane_of_motion_3?: string | null
          posture?: string | null
          primary_equipment?: string | null
          primary_items_count?: number | null
          prime_mover_muscle?: string | null
          secondary_equipment?: string | null
          secondary_items_count?: number | null
          secondary_muscle?: string | null
          short_youtube_demo?: string | null
          single_or_double_arm?: string | null
          tertiary_muscle?: string | null
          updated_at?: string | null
          youtube_thumbnail_url?: string | null
        }
        Update: {
          arm_movement_pattern?: string | null
          body_region?: string | null
          combination_exercise?: boolean | null
          created_at?: string | null
          difficulty?: string | null
          exercise_classification?: string | null
          foot_elevation?: string | null
          force_type?: string | null
          grip?: string | null
          id?: never
          in_depth_youtube_exp?: string | null
          laterality?: string | null
          leg_movement_pattern?: string | null
          load_position?: string | null
          mechanics?: string | null
          movement_pattern_1?: string | null
          movement_pattern_2?: string | null
          movement_pattern_3?: string | null
          name?: string
          plane_of_motion_1?: string | null
          plane_of_motion_2?: string | null
          plane_of_motion_3?: string | null
          posture?: string | null
          primary_equipment?: string | null
          primary_items_count?: number | null
          prime_mover_muscle?: string | null
          secondary_equipment?: string | null
          secondary_items_count?: number | null
          secondary_muscle?: string | null
          short_youtube_demo?: string | null
          single_or_double_arm?: string | null
          tertiary_muscle?: string | null
          updated_at?: string | null
          youtube_thumbnail_url?: string | null
        }
        Relationships: []
      }
      exercises_new: {
        Row: {
          body_region: string
          created_at: string | null
          description: string | null
          difficulty_level: string
          exercise_classification: string
          force_type: string | null
          id: string
          image_url: string | null
          instructions: string | null
          laterality: string
          mechanics: string
          movement_pattern: string
          name: string
          plane_of_motion: string
          posture: string
          primary_equipment: string
          prime_mover_muscle: string
          secondary_equipment: string | null
          secondary_muscle: string | null
          target_muscle_group: string
          tertiary_muscle: string | null
          updated_at: string | null
          video_demonstration_url: string | null
          video_explanation_url: string | null
        }
        Insert: {
          body_region?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          exercise_classification?: string
          force_type?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          laterality?: string
          mechanics?: string
          movement_pattern?: string
          name: string
          plane_of_motion?: string
          posture?: string
          primary_equipment?: string
          prime_mover_muscle?: string
          secondary_equipment?: string | null
          secondary_muscle?: string | null
          target_muscle_group?: string
          tertiary_muscle?: string | null
          updated_at?: string | null
          video_demonstration_url?: string | null
          video_explanation_url?: string | null
        }
        Update: {
          body_region?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          exercise_classification?: string
          force_type?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          laterality?: string
          mechanics?: string
          movement_pattern?: string
          name?: string
          plane_of_motion?: string
          posture?: string
          primary_equipment?: string
          prime_mover_muscle?: string
          secondary_equipment?: string | null
          secondary_muscle?: string | null
          target_muscle_group?: string
          tertiary_muscle?: string | null
          updated_at?: string | null
          video_demonstration_url?: string | null
          video_explanation_url?: string | null
        }
        Relationships: []
      }
      exercises_raw: {
        Row: {
          body_region: string
          created_at: string | null
          description: string | null
          difficulty_level: string
          exercise_classification: string
          force_type: string | null
          id: string
          image_url: string | null
          instructions: string | null
          laterality: string
          mechanics: string
          movement_pattern: string
          name: string
          plane_of_motion: string
          posture: string
          primary_equipment: string
          prime_mover_muscle: string
          secondary_equipment: string | null
          secondary_muscle: string | null
          target_muscle_group: string
          tertiary_muscle: string | null
          updated_at: string | null
          video_demonstration_url: string | null
          video_explanation_url: string | null
        }
        Insert: {
          body_region?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          exercise_classification?: string
          force_type?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          laterality?: string
          mechanics?: string
          movement_pattern?: string
          name: string
          plane_of_motion?: string
          posture?: string
          primary_equipment?: string
          prime_mover_muscle?: string
          secondary_equipment?: string | null
          secondary_muscle?: string | null
          target_muscle_group?: string
          tertiary_muscle?: string | null
          updated_at?: string | null
          video_demonstration_url?: string | null
          video_explanation_url?: string | null
        }
        Update: {
          body_region?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          exercise_classification?: string
          force_type?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          laterality?: string
          mechanics?: string
          movement_pattern?: string
          name?: string
          plane_of_motion?: string
          posture?: string
          primary_equipment?: string
          prime_mover_muscle?: string
          secondary_equipment?: string | null
          secondary_muscle?: string | null
          target_muscle_group?: string
          tertiary_muscle?: string | null
          updated_at?: string | null
          video_demonstration_url?: string | null
          video_explanation_url?: string | null
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          body_region: string
          id: number
          name: string
        }
        Insert: {
          body_region: string
          id?: never
          name: string
        }
        Update: {
          body_region?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      predesigned_workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          updated_at?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predesigned_workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predesigned_workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "predesigned_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      predesigned_workouts: {
        Row: {
          benefits: string | null
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          equipment_needed: string | null
          focus_area: string | null
          goal: string | null
          id: string
          instructions: string | null
          long_description: string | null
          modifications: string | null
          short_description: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_minutes: number
          equipment_needed?: string | null
          focus_area?: string | null
          goal?: string | null
          id?: string
          instructions?: string | null
          long_description?: string | null
          modifications?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          equipment_needed?: string | null
          focus_area?: string | null
          goal?: string | null
          id?: string
          instructions?: string | null
          long_description?: string | null
          modifications?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      prepared_workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: number
          id: string
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: number
          id?: string
          notes?: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: number
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          updated_at?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prepared_workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "prepared_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      prepared_workouts: {
        Row: {
          benefits: string | null
          category: string
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          equipment_needed: string | null
          goal: string | null
          id: string
          instructions: string | null
          is_template: boolean | null
          long_description: string | null
          modifications: string | null
          short_description: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_minutes: number
          equipment_needed?: string | null
          goal?: string | null
          id?: string
          instructions?: string | null
          is_template?: boolean | null
          long_description?: string | null
          modifications?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          equipment_needed?: string | null
          goal?: string | null
          id?: string
          instructions?: string | null
          is_template?: boolean | null
          long_description?: string | null
          modifications?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
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
          profile_photo_url: string | null
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
          profile_photo_url?: string | null
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
          profile_photo_url?: string | null
          updated_at?: string
          weight?: number | null
          workout_days?: string[] | null
        }
        Relationships: []
      }
      user_created_workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: number
          id: string
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: number
          id?: string
          notes?: string | null
          order_index: number
          reps?: string
          rest_seconds?: number
          sets?: number
          updated_at?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: number
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          updated_at?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_created_workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "user_created_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_created_workouts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          goal: string | null
          id: string
          is_template: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_minutes?: number
          goal?: string | null
          id?: string
          is_template?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          goal?: string | null
          id?: string
          is_template?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_favorite_wods: {
        Row: {
          created_at: string | null
          user_id: string
          wod_id: string
        }
        Insert: {
          created_at?: string | null
          user_id: string
          wod_id: string
        }
        Update: {
          created_at?: string | null
          user_id?: string
          wod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_wods_wod_id_fkey"
            columns: ["wod_id"]
            isOneToOne: false
            referencedRelation: "wods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_wods_wod_id_fkey"
            columns: ["wod_id"]
            isOneToOne: false
            referencedRelation: "workout_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          updated_at?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          updated_at?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "user_workouts"
            referencedColumns: ["id"]
          },
        ]
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
      wods: {
        Row: {
          avg_duration_minutes: number | null
          category: string | null
          components: Json | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          name: string
          part_1: string | null
          part_10: string | null
          part_2: string | null
          part_3: string | null
          part_4: string | null
          part_5: string | null
          part_6: string | null
          part_7: string | null
          part_8: string | null
          part_9: string | null
          video_demo: string | null
        }
        Insert: {
          avg_duration_minutes?: number | null
          category?: string | null
          components?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          name: string
          part_1?: string | null
          part_10?: string | null
          part_2?: string | null
          part_3?: string | null
          part_4?: string | null
          part_5?: string | null
          part_6?: string | null
          part_7?: string | null
          part_8?: string | null
          part_9?: string | null
          video_demo?: string | null
        }
        Update: {
          avg_duration_minutes?: number | null
          category?: string | null
          components?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          name?: string
          part_1?: string | null
          part_10?: string | null
          part_2?: string | null
          part_3?: string | null
          part_4?: string | null
          part_5?: string | null
          part_6?: string | null
          part_7?: string | null
          part_8?: string | null
          part_9?: string | null
          video_demo?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          order_index: number
          reps: number | null
          rest_time: number | null
          sets: number | null
          weight: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          order_index: number
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          weight?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          order_index?: number
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          weight?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_history: {
        Row: {
          calories_burned: number
          created_at: string
          date: string
          duration_minutes: number
          exercises: Json
          id: string
          notes: string | null
          user_id: string | null
          workout_name: string
        }
        Insert: {
          calories_burned?: number
          created_at?: string
          date: string
          duration_minutes: number
          exercises: Json
          id?: string
          notes?: string | null
          user_id?: string | null
          workout_name: string
        }
        Update: {
          calories_burned?: number
          created_at?: string
          date?: string
          duration_minutes?: number
          exercises?: Json
          id?: string
          notes?: string | null
          user_id?: string | null
          workout_name?: string
        }
        Relationships: []
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      yoga_workouts: {
        Row: {
          arm_movement_pattern: string | null
          body_region: string | null
          combination_exercise: boolean | null
          created_at: string | null
          difficulty: string | null
          exercise_classification: string | null
          foot_elevation: string | null
          force_type: string | null
          grip: string | null
          id: string
          in_depth_youtube_exp: string | null
          laterality: string | null
          leg_movement_pattern: string | null
          load_position: string | null
          mechanics: string | null
          movement_pattern_1: string | null
          movement_pattern_2: string | null
          movement_pattern_3: string | null
          name: string
          plane_of_motion_1: string | null
          plane_of_motion_2: string | null
          plane_of_motion_3: string | null
          posture: string | null
          primary_equipment: string | null
          primary_items_count: number | null
          prime_mover_muscle: string | null
          secondary_equipment: string | null
          secondary_items_count: number | null
          secondary_muscle: string | null
          short_youtube_demo: string | null
          tertiary_muscle: string | null
          updated_at: string | null
          x: string | null
          youtube_thumbnail_url: string | null
        }
        Insert: {
          arm_movement_pattern?: string | null
          body_region?: string | null
          combination_exercise?: boolean | null
          created_at?: string | null
          difficulty?: string | null
          exercise_classification?: string | null
          foot_elevation?: string | null
          force_type?: string | null
          grip?: string | null
          id?: string
          in_depth_youtube_exp?: string | null
          laterality?: string | null
          leg_movement_pattern?: string | null
          load_position?: string | null
          mechanics?: string | null
          movement_pattern_1?: string | null
          movement_pattern_2?: string | null
          movement_pattern_3?: string | null
          name: string
          plane_of_motion_1?: string | null
          plane_of_motion_2?: string | null
          plane_of_motion_3?: string | null
          posture?: string | null
          primary_equipment?: string | null
          primary_items_count?: number | null
          prime_mover_muscle?: string | null
          secondary_equipment?: string | null
          secondary_items_count?: number | null
          secondary_muscle?: string | null
          short_youtube_demo?: string | null
          tertiary_muscle?: string | null
          updated_at?: string | null
          x?: string | null
          youtube_thumbnail_url?: string | null
        }
        Update: {
          arm_movement_pattern?: string | null
          body_region?: string | null
          combination_exercise?: boolean | null
          created_at?: string | null
          difficulty?: string | null
          exercise_classification?: string | null
          foot_elevation?: string | null
          force_type?: string | null
          grip?: string | null
          id?: string
          in_depth_youtube_exp?: string | null
          laterality?: string | null
          leg_movement_pattern?: string | null
          load_position?: string | null
          mechanics?: string | null
          movement_pattern_1?: string | null
          movement_pattern_2?: string | null
          movement_pattern_3?: string | null
          name?: string
          plane_of_motion_1?: string | null
          plane_of_motion_2?: string | null
          plane_of_motion_3?: string | null
          posture?: string | null
          primary_equipment?: string | null
          primary_items_count?: number | null
          prime_mover_muscle?: string | null
          secondary_equipment?: string | null
          secondary_items_count?: number | null
          secondary_muscle?: string | null
          short_youtube_demo?: string | null
          tertiary_muscle?: string | null
          updated_at?: string | null
          x?: string | null
          youtube_thumbnail_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      workout_statistics: {
        Row: {
          avg_duration_minutes: number | null
          category: string | null
          components: Json | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string | null
          name: string | null
          part_1: string | null
          part_10: string | null
          part_2: string | null
          part_3: string | null
          part_4: string | null
          part_5: string | null
          part_6: string | null
          part_7: string | null
          part_8: string | null
          part_9: string | null
          video_demo: string | null
        }
        Insert: {
          avg_duration_minutes?: number | null
          category?: string | null
          components?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string | null
          name?: string | null
          part_1?: string | null
          part_10?: string | null
          part_2?: string | null
          part_3?: string | null
          part_4?: string | null
          part_5?: string | null
          part_6?: string | null
          part_7?: string | null
          part_8?: string | null
          part_9?: string | null
          video_demo?: string | null
        }
        Update: {
          avg_duration_minutes?: number | null
          category?: string | null
          components?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string | null
          name?: string | null
          part_1?: string | null
          part_10?: string | null
          part_2?: string | null
          part_3?: string | null
          part_4?: string | null
          part_5?: string | null
          part_6?: string | null
          part_7?: string | null
          part_8?: string | null
          part_9?: string | null
          video_demo?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_exercises_to_prepared_workouts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_exercises_to_workouts: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      add_specified_exercises_to_workouts: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      calculate_workout_calories: {
        Args: { json_data: Json }
        Returns: number
      }
      dmetaphone: {
        Args: { "": string }
        Returns: string
      }
      dmetaphone_alt: {
        Args: { "": string }
        Returns: string
      }
      extract_youtube_id: {
        Args: { url: string }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      search_exercises: {
        Args: {
          p_search_term?: string
          p_muscle_group?: string
          p_equipment?: string
          p_difficulty?: string
          p_body_region?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          body_region: string
          created_at: string | null
          description: string | null
          difficulty_level: string
          exercise_classification: string
          force_type: string | null
          id: string
          image_url: string | null
          instructions: string | null
          laterality: string
          mechanics: string
          movement_pattern: string
          name: string
          plane_of_motion: string
          posture: string
          primary_equipment: string
          prime_mover_muscle: string
          secondary_equipment: string | null
          secondary_muscle: string | null
          target_muscle_group: string
          tertiary_muscle: string | null
          updated_at: string | null
          video_demonstration_url: string | null
          video_explanation_url: string | null
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soundex: {
        Args: { "": string }
        Returns: string
      }
      text_soundex: {
        Args: { "": string }
        Returns: string
      }
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
