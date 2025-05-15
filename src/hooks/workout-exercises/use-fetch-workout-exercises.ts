
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string | number;
  sets: number;
  reps: string | number;
  rest_time?: number;
  rest_seconds?: number;
  order_index: number;
  weight?: string;
  notes?: string;
  exercise?: any;
}

// Interface for the hook return value
export interface FetchWorkoutExercisesReturn {
  workoutExercises: WorkoutExercise[];
  isLoading: boolean;
  error: string | null;
  fetchExercises: (workoutId: string) => Promise<void>;
  exercises: WorkoutExercise[]; // Alias for compatibility
}

// The main hook export
export const useFetchWorkoutExercises = (): FetchWorkoutExercisesReturn => {
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exercises for a specific workout
  const fetchExercises = useCallback(async (workoutId: string) => {
    if (!workoutId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching exercises for workout: ${workoutId}`);
      
      // Check if the workout is a prepared_workout or user_created_workout
      const isPreparedWorkout = workoutId.startsWith('prepared_') || 
                               await checkIfPreparedWorkout(workoutId);
      
      // Fetch from the appropriate table
      let { data: rawWorkoutExercises, error: exercisesError } = isPreparedWorkout
        ? await fetchPreparedWorkoutExercises(workoutId)
        : await fetchUserWorkoutExercises(workoutId);
        
      if (exercisesError) throw exercisesError;
      
      if (!rawWorkoutExercises || rawWorkoutExercises.length === 0) {
        console.log("No exercises found for this workout");
        setWorkoutExercises([]);
        return;
      }
      
      console.log(`Found ${rawWorkoutExercises.length} exercises`);
      
      // Get full exercise details for each exercise
      const exercisesWithDetails = await Promise.all(
        rawWorkoutExercises.map(async (we) => {
          // Create a safe base object with default values
          const safeExerciseData = {
            id: typeof we.exercise_id === 'number' ? we.exercise_id.toString() : String(we.exercise_id),
            name: "Unknown Exercise",
            description: "",
            prime_mover_muscle: "",
            primary_equipment: "",
            difficulty: "",
            youtube_thumbnail_url: "",
            video_demonstration_url: "",
            short_youtube_demo: ""
          };
          
          try {
            // Try exercises_full first (more detail)
            const { data: exerciseData } = await supabase
              .from("exercises_full")
              .select("*")
              .eq("id", we.exercise_id)
              .single();
              
            // If found, use this data
            if (exerciseData) {
              safeExerciseData.id = (exerciseData.id?.toString()) || safeExerciseData.id;
              safeExerciseData.name = exerciseData.name || safeExerciseData.name;
              safeExerciseData.description = (exerciseData as any).description || safeExerciseData.description;
              safeExerciseData.prime_mover_muscle = exerciseData.prime_mover_muscle || safeExerciseData.prime_mover_muscle;
              safeExerciseData.primary_equipment = exerciseData.primary_equipment || safeExerciseData.primary_equipment;
              safeExerciseData.difficulty = exerciseData.difficulty || safeExerciseData.difficulty;
              safeExerciseData.youtube_thumbnail_url = exerciseData.youtube_thumbnail_url || safeExerciseData.youtube_thumbnail_url;
              safeExerciseData.video_demonstration_url = (exerciseData as any).video_demonstration_url || exerciseData.short_youtube_demo || safeExerciseData.video_demonstration_url;
            } else {
              // If not found in exercises_full, try regular exercises table
              const { data } = await supabase
                .from("exercises")
                .select("*")
                .eq("id", we.exercise_id)
                .single();
                
              if (data) {
                safeExerciseData.id = (data.id?.toString()) || safeExerciseData.id;
                safeExerciseData.name = data.name || safeExerciseData.name;
                safeExerciseData.description = data.description || safeExerciseData.description;
                safeExerciseData.prime_mover_muscle = data.muscle_group || safeExerciseData.prime_mover_muscle;
                safeExerciseData.primary_equipment = data.equipment || safeExerciseData.primary_equipment;
                safeExerciseData.difficulty = data.difficulty || safeExerciseData.difficulty;
                safeExerciseData.video_demonstration_url = data.video_url || safeExerciseData.video_demonstration_url;
              }
            }
          } catch (error) {
            console.error("Error fetching exercise details:", error);
          }
            
          // Ensure we have all required fields with proper type handling
          return {
            id: we.id,
            workout_id: we.workout_id,
            exercise_id: we.exercise_id,
            sets: we.sets || 0,
            reps: we.reps || "0",
            rest_time: (we as any).rest_time || we.rest_seconds || 0,
            rest_seconds: we.rest_seconds || (we as any).rest_time || 0,
            order_index: we.order_index || 0,
            weight: (we as any).weight || "",
            notes: we.notes || "",
            exercise: safeExerciseData
          } as WorkoutExercise;
        })
      );
      
      setWorkoutExercises(exercisesWithDetails);
      
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      setError(error.message || "Failed to load exercises");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Helper functions
  
  const checkIfPreparedWorkout = async (workoutId: string): Promise<boolean> => {
    const { data } = await supabase
      .from("prepared_workouts")
      .select("id")
      .eq("id", workoutId)
      .single();
      
    return !!data;
  };
  
  const fetchPreparedWorkoutExercises = async (workoutId: string) => {
    return await supabase
      .from("prepared_workout_exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("order_index");
  };
  
  const fetchUserWorkoutExercises = async (workoutId: string) => {
    return await supabase
      .from("user_created_workout_exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("order_index");
  };

  return {
    workoutExercises,
    isLoading,
    error,
    fetchExercises,
    exercises: workoutExercises // Add alias for compatibility
  };
};

// Make sure we provide the correct export name that's being imported elsewhere
export const useWorkoutExercises = useFetchWorkoutExercises;
