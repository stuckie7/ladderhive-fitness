
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

export const useFetchWorkoutExercises = () => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
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
      let { data: workoutExercises, error: exercisesError } = isPreparedWorkout
        ? await fetchPreparedWorkoutExercises(workoutId)
        : await fetchUserWorkoutExercises(workoutId);
        
      if (exercisesError) throw exercisesError;
      
      if (!workoutExercises || workoutExercises.length === 0) {
        console.log("No exercises found for this workout");
        setExercises([]);
        return;
      }
      
      console.log(`Found ${workoutExercises.length} exercises`);
      
      // Get full exercise details for each exercise
      const exercisesWithDetails = await Promise.all(
        workoutExercises.map(async (we) => {
          // Try exercises_full first (more detail)
          let { data: exerciseData } = await supabase
            .from("exercises_full")
            .select("*")
            .eq("id", we.exercise_id)
            .single();
            
          // If not found, try regular exercises table
          if (!exerciseData) {
            const { data } = await supabase
              .from("exercises")
              .select("*")
              .eq("id", we.exercise_id)
              .single();
              
            exerciseData = data;
          }
          
          return {
            ...we,
            exercise: exerciseData,
          };
        })
      );
      
      setExercises(exercisesWithDetails);
      
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
    exercises,
    isLoading,
    error,
    fetchExercises,
  };
};
