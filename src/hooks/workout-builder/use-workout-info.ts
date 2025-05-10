
import { useCallback } from "react";
import { WorkoutStateType } from "./use-workout-state";

export const useWorkoutInfo = ({ workout, setWorkout }: Pick<WorkoutStateType, 'workout' | 'setWorkout'>) => {
  // Reset workout to default values
  const resetWorkout = useCallback(() => {
    setWorkout({
      title: "",
      difficulty: "beginner",
      category: "strength",
      description: "",
      is_template: false
    });
  }, [setWorkout]);
  
  // Update workout info
  const setWorkoutInfo = useCallback((info: Partial<typeof workout>) => {
    setWorkout(prev => ({ ...prev, ...info }));
  }, [setWorkout]);

  return {
    setWorkoutInfo,
    resetWorkout
  };
};
