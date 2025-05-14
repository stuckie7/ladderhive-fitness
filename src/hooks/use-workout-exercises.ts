
import { useManageWorkoutExercises } from "./workout-exercises/use-manage-workout-exercises";
import { useCallback, useState, useEffect } from "react";
import { WorkoutExercise } from "./workout-exercises/utils";
import { Exercise } from "@/types/exercise";

export const useWorkoutExercises = (workoutId?: string) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    addExerciseToWorkout,
    isAdding,
    removeExerciseFromWorkout,
    updateExerciseDetails
  } = useManageWorkoutExercises(workoutId);

  const fetchWorkoutExercises = useCallback(async (id: string) => {
    if (!id) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await fetch(`/api/workouts/${id}/exercises`).then(res => res.json());
      
      if (error) throw error;
      
      // Transform the data if needed
      const mappedExercises = data || [];
      setExercises(mappedExercises as WorkoutExercise[]);
      return mappedExercises;
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set initial loading to false after first data fetch
  useEffect(() => {
    if (!isLoading && initialLoading) {
      setInitialLoading(false);
    }
  }, [isLoading, initialLoading]);

  // Initial data fetch if workoutId is provided
  useEffect(() => {
    if (workoutId) {
      fetchWorkoutExercises(workoutId);
    }
  }, [workoutId, fetchWorkoutExercises]);

  return {
    exercises,
    isLoading: isLoading || initialLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    isAdding
  };
};
