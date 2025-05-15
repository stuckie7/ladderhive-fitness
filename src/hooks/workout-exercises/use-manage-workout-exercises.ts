
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "./use-fetch-workout-exercises";

export const useManageWorkoutExercises = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add an exercise to a workout
  const addExerciseToWorkout = async (
    workoutId: string,
    exercise: Exercise,
    sets: number = 3,
    reps: string = "10",
    restSeconds: number = 60,
    orderIndex: number = 0
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Adding exercise to workout ${workoutId}:`, exercise);
      
      // Check if it's a prepared workout or user workout
      const isPreparedWorkout = workoutId.startsWith('prepared_') ||
                               await checkIfPreparedWorkout(workoutId);
      
      const exerciseId = typeof exercise.id === 'string' && !isNaN(parseInt(exercise.id))
        ? parseInt(exercise.id)
        : exercise.id;
        
      // Add to appropriate table
      if (isPreparedWorkout) {
        const { error } = await supabase.from("prepared_workout_exercises").insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: sets,
          reps: reps,
          rest_seconds: restSeconds,
          order_index: orderIndex,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_created_workout_exercises").insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: sets,
          reps: reps,
          rest_seconds: restSeconds,
          order_index: orderIndex,
        });

        if (error) throw error;
      }

      console.log("Exercise added successfully");
    } catch (error: any) {
      console.error("Error adding exercise to workout:", error);
      setError(error.message || "Failed to add exercise");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an exercise from a workout
  const removeExerciseFromWorkout = async (exerciseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Removing exercise ${exerciseId} from workout`);
      
      // Try remove from both tables since we don't know which one it's in
      const { error: preparedError } = await supabase
        .from("prepared_workout_exercises")
        .delete()
        .eq("id", exerciseId);
        
      const { error: userError } = await supabase
        .from("user_created_workout_exercises")
        .delete()
        .eq("id", exerciseId);
        
      if (preparedError && userError) {
        throw preparedError;
      }
        
      console.log("Exercise removed successfully");
    } catch (error: any) {
      console.error("Error removing exercise:", error);
      setError(error.message || "Failed to remove exercise");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an exercise in a workout
  const updateWorkoutExercise = async (exercise: WorkoutExercise) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Updating exercise ${exercise.id}`);
      
      const isPreparedWorkout = exercise.workout_id.startsWith('prepared_') ||
                               await checkIfPreparedWorkout(exercise.workout_id);
      
      // Prepare the update data - remove the exercise object and any non-column properties
      const { exercise: _, ...updateData } = exercise;
      
      if (isPreparedWorkout) {
        const { error } = await supabase
          .from("prepared_workout_exercises")
          .update(updateData)
          .eq("id", exercise.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_created_workout_exercises")
          .update(updateData)
          .eq("id", exercise.id);
          
        if (error) throw error;
      }
      
      console.log("Exercise updated successfully");
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      setError(error.message || "Failed to update exercise");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  
  const checkIfPreparedWorkout = async (workoutId: string): Promise<boolean> => {
    const { data } = await supabase
      .from("prepared_workouts")
      .select("id")
      .eq("id", workoutId)
      .single();
      
    return !!data;
  };

  return {
    isLoading,
    error,
    addExerciseToWorkout,
    updateWorkoutExercise,
    removeExerciseFromWorkout,
  };
};
