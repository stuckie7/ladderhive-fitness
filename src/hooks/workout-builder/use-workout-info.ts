
import { useCallback } from "react";
import { WorkoutDetail } from "./types";

interface WorkoutInfoProps {
  workout: WorkoutDetail;
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutDetail>>;
}

export const useWorkoutInfo = ({ workout, setWorkout }: WorkoutInfoProps) => {
  // Update workout information
  const setWorkoutInfo = useCallback((info: Partial<WorkoutDetail>) => {
    setWorkout(prev => ({
      ...prev,
      ...info
    }));
  }, [setWorkout]);
  
  // Reset workout to default state
  const resetWorkout = useCallback(() => {
    setWorkout({
      id: '',
      title: 'New Workout',
      description: '',
      difficulty: 'Beginner',
      category: 'General',
      duration_minutes: 30,
      exercises: [] // Initialize with empty array
    });
  }, [setWorkout]);
  
  return {
    setWorkoutInfo,
    resetWorkout
  };
};
