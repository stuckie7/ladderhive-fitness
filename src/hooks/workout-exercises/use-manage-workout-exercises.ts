import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "./utils";

export const useManageWorkoutExercises = (workoutId?: string) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Add an exercise to the workout
  const addExerciseToWorkout = async (exercise: Exercise) => {
    if (!workoutId) {
      toast({
        title: "Error",
        description: "No workout ID provided.",
        variant: "destructive",
      });
      return Promise.reject("No workout ID provided");
    }

    setIsAdding(true);

    try {
      // Get count of existing exercises to set order_index
      const { data: existingExercises, error: countError } = await supabase
        .from("workout_exercises")
        .select("id")
        .eq("workout_id", workoutId);

      if (countError) throw countError;

      const orderIndex = existingExercises ? existingExercises.length : 0;

      // Convert exercise_id to string if it's a number
      const exerciseId = typeof exercise.id === 'number' 
        ? exercise.id.toString() 
        : exercise.id;

      // Insert the new exercise
      const { data, error } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: 3,
          reps: 10,
          weight: "",
          rest_time: 60,
          order_index: orderIndex,
        })
        .select();

      if (error) throw error;

      toast({
        description: "Exercise added to workout",
      });

      // Return a properly formatted exercise
      return {
        id: data[0].id,
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets: data[0].sets,
        reps: data[0].reps,
        weight: data[0].weight || "",
        rest_time: data[0].rest_time,
        order_index: data[0].order_index,
        exercise: exercise,
      };
    } catch (error: any) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise to workout",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setIsAdding(false);
    }
  };

  // Remove an exercise from the workout
  const removeExerciseFromWorkout = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("id", exerciseId);

      if (error) throw error;

      toast({
        description: "Exercise removed from workout",
      });
    } catch (error: any) {
      console.error("Error removing exercise:", error);
      toast({
        title: "Error",
        description: "Failed to remove exercise from workout",
        variant: "destructive",
      });
    }
  };

  // Update exercise details
  const updateExercise = async (
    exerciseId: string,
    updates: Partial<WorkoutExercise>
  ) => {
    try {
      const { data, error } = await supabase
        .from("workout_exercises")
        .update(updates)
        .eq("id", exerciseId)
        .select();

      if (error) throw error;

      toast({
        description: "Exercise updated",
      });

      return data ? data[0] : null;
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    addExerciseToWorkout,
    isAdding,
    removeExerciseFromWorkout,
    updateExercise,
  };
};
