
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "./utils";
import { useFetchWorkoutExercises } from "./use-fetch-workout-exercises";

export const useManageWorkoutExercises = (workoutId?: string) => {
  const { exercises, isLoading, fetchWorkoutExercises, setExercises, setIsLoading } = useFetchWorkoutExercises();
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const initialFetchDone = useRef(false);
  
  useEffect(() => {
    if (workoutId && !initialFetchDone.current) {
      fetchWorkoutExercises(workoutId);
      initialFetchDone.current = true;
    }
  }, [workoutId, fetchWorkoutExercises]);

  const addExerciseToWorkout = useCallback(async (exercise: Exercise, details: Partial<WorkoutExercise> = {}) => {
    if (!workoutId) {
      toast({
        title: "Error",
        description: "No workout selected to add exercise to.",
        variant: "destructive",
      });
      return null;
    }
    
    setIsAdding(true);
    try {
      // Find the highest order_index to add the new exercise at the end
      const maxOrderIndex = exercises.length > 0
        ? Math.max(...exercises.map(e => e.order_index))
        : -1;
      
      const newOrderIndex = maxOrderIndex + 1;
      
      const newExercise = {
        workout_id: workoutId,
        exercise_id: String(exercise.id), // Ensure it's a string
        sets: details.sets || 3,
        reps: details.reps || 10,
        weight: details.weight || null,
        rest_time: details.rest_time || 60,
        order_index: newOrderIndex
      };
      
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert(newExercise)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new exercise to the local state with the full exercise details
      const updatedExercise: WorkoutExercise = {
        ...data,
        exercise
      };
      
      setExercises([...exercises, updatedExercise]);
      
      toast({
        title: "Exercise added",
        description: `${exercise.name} has been added to your workout.`
      });
      
      return updatedExercise;
    } catch (error: any) {
      console.error("Error adding exercise to workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise to workout",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAdding(false);
    }
  }, [workoutId, exercises, setExercises, toast, setIsAdding]);

  const removeExerciseFromWorkout = useCallback(async (exerciseId: string) => {
    if (!exerciseId) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      // Update local state by removing the exercise
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
        description: error.message || "Failed to remove exercise",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [exercises, setExercises, setIsLoading, toast]);

  const updateExerciseDetails = useCallback(async (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    if (!exerciseId) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .update(updates)
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      // Update local state
      setExercises(exercises.map(e => 
        e.id === exerciseId ? { ...e, ...updates } : e
      ));
      
      return true;
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update exercise details",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [exercises, setExercises, setIsLoading, toast]);

  return {
    exercises,
    isLoading,
    isAdding,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails
  };
};
