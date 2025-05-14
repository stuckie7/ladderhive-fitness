
import { useCallback } from "react";
import { WorkoutDetail } from "./types";

export const useWorkoutInfo = (
  {
    workout, 
    setWorkout
  }: {
    workout: WorkoutDetail;
    setWorkout: React.Dispatch<React.SetStateAction<WorkoutDetail>>;
  }
) => {
  
  // Function to update workout info
  const setWorkoutInfo = useCallback((field: keyof WorkoutDetail, value: any) => {
    setWorkout(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setWorkout]);

  // Function to completely reset the workout
  const resetWorkout = useCallback(() => {
    setWorkout({
      id: '',
      title: 'New Workout',
      description: '',
      difficulty: 'Beginner',
      category: 'General',
      duration_minutes: 30,
      is_template: false
    });
  }, [setWorkout]);

  return {
    setWorkoutInfo,
    resetWorkout
  };
};
