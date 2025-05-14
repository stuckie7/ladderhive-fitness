
import { useCallback } from "react";
import { WorkoutDetail } from "./types";

export const useWorkoutInfo = ({
  workout,
  setWorkout
}: {
  workout: WorkoutDetail;
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutDetail>>;
}) => {
  // Update workout info
  const setWorkoutInfo = useCallback((info: Partial<WorkoutDetail>) => {
    setWorkout(prevWorkout => ({
      ...prevWorkout,
      ...info
    }));
  }, [setWorkout]);
  
  // Reset workout to default state
  const resetWorkout = useCallback(() => {
    setWorkout({
      title: "New Workout",
      description: "",
      difficulty: "beginner",
      category: "strength",
      goal: "strength",
      duration_minutes: 30,
      is_template: false
    });
  }, [setWorkout]);
  
  return {
    setWorkoutInfo,
    resetWorkout
  };
};
