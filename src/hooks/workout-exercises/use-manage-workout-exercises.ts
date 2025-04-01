
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "./utils";
import { useFetchWorkoutExercises } from "./use-fetch-workout-exercises";

export const useManageWorkoutExercises = (workoutId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { 
    exercises, 
    fetchWorkoutExercises, 
    setExercises 
  } = useFetchWorkoutExercises();

  const addExerciseToWorkout = async (workoutId: string, exercise: Exercise, details: Partial<WorkoutExercise> = {}) => {
    if (!workoutId) return null;
    
    setIsLoading(true);
    try {
      // Get the current highest order
      const currentExercises = await fetchWorkoutExercises(workoutId);
      const nextOrder = currentExercises.length > 0 
        ? Math.max(...currentExercises.map(e => e.order_index)) + 1 
        : 0;
      
      // First, check if the exercise exists in the exercises table
      const { data: existingExercise, error: checkError } = await supabase
        .from('exercises')
        .select('id')
        .eq('id', exercise.id)
        .single();
      
      let exerciseId: string;
      
      if (checkError || !existingExercise) {
        // Exercise doesn't exist yet, add it
        const { data: newExercise, error: insertError } = await supabase
          .from('exercises')
          .insert({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description || '',
            muscle_group: exercise.muscle_group || exercise.bodyPart,
            equipment: exercise.equipment,
            difficulty: exercise.difficulty || 'Intermediate',
            image_url: exercise.image_url || exercise.gifUrl
          })
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        exerciseId = newExercise.id;
      } else {
        exerciseId = existingExercise.id;
      }
      
      // Now add the exercise to the workout
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: details.sets || 3,
          reps: details.reps || 10,
          weight: details.weight || null,
          rest_time: details.rest_time || 60,
          order_index: nextOrder
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh exercises
      await fetchWorkoutExercises(workoutId);
      
      return data;
    } catch (error: any) {
      console.error("Error adding exercise to workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise to workout",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeExerciseFromWorkout = async (exerciseId: string) => {
    if (!workoutId) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      // Update local state
      setExercises(exercises.filter(e => e.id !== exerciseId));
      
      toast({
        title: "Exercise removed",
        description: "The exercise has been removed from your workout."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing exercise from workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove exercise from workout",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercises,
    isLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  };
};
