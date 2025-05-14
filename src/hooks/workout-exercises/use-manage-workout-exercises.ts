
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise, ensureStringReps } from "./utils";
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
      
      // Convert exercise_id to string if it's a number to resolve the type issue
      const exercise_id = String(exercise.id);
      
      // Use a two-step approach to avoid type issues:
      // 1. First insert without the reps field
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exercise_id, // Now a string
          sets: details.sets || 3,
          weight: details.weight || null,
          rest_time: details.rest_time || 60,
          order_index: newOrderIndex
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // 2. Then update with the reps field as a string
      if (data && data.id) {
        const repsValue = ensureStringReps(details.reps);
        
        const { error: updateError } = await supabase
          .from('workout_exercises')
          .update({ reps: repsValue })
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      }
      
      // Add the new exercise to the local state with the full exercise details
      const updatedExercise: WorkoutExercise = {
        ...data,
        reps: ensureStringReps(details.reps),
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
      const updateData: Record<string, any> = {};
      
      // Handle properties individually to match database expectations
      if (updates.sets !== undefined) updateData.sets = updates.sets;
      if (updates.weight !== undefined) updateData.weight = updates.weight;
      if (updates.rest_time !== undefined) updateData.rest_time = updates.rest_time;
      if (updates.order_index !== undefined) updateData.order_index = updates.order_index;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      // Handle reps separately to ensure string conversion
      if (updates.reps !== undefined) {
        const stringReps = ensureStringReps(updates.reps);
        
        // For database update
        updateData.reps = stringReps;
      }
      
      const { error } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      // Update local state
      setExercises(exercises.map(e => 
        e.id === exerciseId ? { 
          ...e, 
          ...updates,
          reps: updates.reps ? ensureStringReps(updates.reps) : e.reps 
        } : e
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
