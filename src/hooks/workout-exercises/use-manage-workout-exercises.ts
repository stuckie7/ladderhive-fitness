
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutExercise, ensureStringReps, mapSupabaseExerciseToExercise } from "./utils";
import { Exercise } from "@/types/exercise";

type WorkoutExerciseDetails = {
  sets?: number;
  reps?: string | number;
  weight?: string;
  rest_time?: number;
  notes?: string;
};

export const useManageWorkoutExercises = (workoutId: string) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const hasInitialFetch = useRef(false);

  // Fetch workout exercises
  useEffect(() => {
    if (workoutId && !hasInitialFetch.current) {
      fetchExercises();
      hasInitialFetch.current = true;
    }
  }, [workoutId]);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const mappedExercises: WorkoutExercise[] = data.map(item => ({
          id: item.id,
          workout_id: item.workout_id,
          exercise_id: item.exercise_id,
          sets: item.sets,
          reps: ensureStringReps(item.reps),
          weight: item.weight,
          rest_time: item.rest_time,
          order_index: item.order_index,
          exercise: item.exercise ? mapSupabaseExerciseToExercise(item.exercise) : undefined,
        }));
        setExercises(mappedExercises);
      }
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workout exercises",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast]);

  const addExercise = useCallback(async (exercise: Exercise, details: WorkoutExerciseDetails = {}) => {
    try {
      setIsSaving(true);
      
      // Find the highest order_index
      const maxOrderIndex = exercises.length > 0
        ? Math.max(...exercises.map(ex => ex.order_index))
        : -1;
      
      const newOrderIndex = maxOrderIndex + 1;
      
      // Ensure exercise_id is a string as expected by Supabase
      const exerciseId = String(exercise.id);
      
      // Ensure reps is a string
      const repsAsString = ensureStringReps(details.reps || 10);
      
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: details.sets || 3,
          weight: details.weight || null,
          rest_time: details.rest_time || 60,
          order_index: newOrderIndex,
          reps: repsAsString
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new exercise to the local state with the full exercise details
      const updatedExercise: WorkoutExercise = {
        id: data.id,
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets: details.sets || 3,
        reps: repsAsString,
        weight: details.weight || null,
        rest_time: details.rest_time || 60,
        order_index: newOrderIndex,
        exercise
      };
      
      setExercises(prev => [...prev, updatedExercise]);
      
      toast({
        title: "Success",
        description: `Added ${exercise.name} to workout`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise to workout",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [exercises, workoutId, toast]);

  const updateExercise = useCallback(async (exerciseId: string, details: WorkoutExerciseDetails) => {
    try {
      setIsSaving(true);

      // Ensure reps is a string
      const repsAsString = ensureStringReps(details.reps || 10);

      const { data, error } = await supabase
        .from('workout_exercises')
        .update({
          sets: details.sets,
          reps: repsAsString,
          weight: details.weight,
          rest_time: details.rest_time,
          notes: details.notes,
        })
        .eq('id', exerciseId)
        .select()
        .single();

      if (error) throw error;

      setExercises(prev =>
        prev.map(ex =>
          ex.id === exerciseId ? { ...ex, ...details, reps: repsAsString } : ex
        )
      );

      toast({
        title: "Success",
        description: `Updated exercise`,
      });

      return true;
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update exercise",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const removeExercise = useCallback(async (exerciseId: string) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;

      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));

      toast({
        title: "Success",
        description: `Removed exercise from workout`,
      });

      return true;
    } catch (error: any) {
      console.error("Error removing exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove exercise from workout",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const reorderExercises = useCallback(async (startIndex: number, endIndex: number) => {
    if (!exercises) return;

    const reorderedExercises = [...exercises];
    const [movedExercise] = reorderedExercises.splice(startIndex, 1);
    reorderedExercises.splice(endIndex, 0, movedExercise);

    // Optimistically update the order_index in the local state
    const updatedExercises = reorderedExercises.map((exercise, index) => ({
      ...exercise,
      order_index: index,
    }));
    setExercises(updatedExercises);

    try {
      setIsSaving(true);

      // Update the order_index in the database
      for (const [index, exercise] of updatedExercises.entries()) {
        const { error } = await supabase
          .from('workout_exercises')
          .update({ order_index: index })
          .eq('id', exercise.id);

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "Reordered exercises",
      });

      return true;
    } catch (error: any) {
      console.error("Error reordering exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder exercises",
        variant: "destructive",
      });

      // If there's an error, revert to the original order
      setExercises(exercises);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [exercises, toast]);

  return {
    exercises,
    isLoading,
    isSaving,
    fetchExercises,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
  };
};
