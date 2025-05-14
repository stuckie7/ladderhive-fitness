
import { useCallback, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "./workout-exercises/utils";
import { useManageWorkoutExercises } from "./workout-exercises/use-manage-workout-exercises";
import { useFetchWorkoutExercises } from "./workout-exercises/use-fetch-workout-exercises";

export const useWorkoutExercises = (workoutId?: string) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    isAdding
  } = useManageWorkoutExercises(workoutId);
  
  const fetchWorkoutExercises = useCallback(async (id: string): Promise<WorkoutExercise[]> => {
    if (!id) return [];
    
    setIsLoading(true);
    try {
      console.log("Fetching exercises for workout ID:", id);
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      // Map the data to our expected format
      const mappedExercises = data ? data.map(item => ({
        id: item.id,
        workout_id: item.workout_id,
        exercise_id: item.exercise_id,
        sets: item.sets || 3,
        reps: item.reps || 10,
        weight: item.weight || '',
        rest_time: item.rest_time || 60,
        order_index: item.order_index || 0,
        exercise: item.exercise || undefined
      })) : [];
      
      setExercises(mappedExercises);
      return mappedExercises;
    } catch (error) {
      console.error("Error fetching workout exercises:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set initial loading to false after first data fetch
  useEffect(() => {
    if (workoutId) {
      fetchWorkoutExercises(workoutId).finally(() => {
        setInitialLoading(false);
      });
    } else {
      setInitialLoading(false);
    }
  }, [workoutId, fetchWorkoutExercises]);

  return {
    exercises,
    isLoading: isLoading || initialLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  };
};
