
import { useState } from 'react';
import { useWorkoutsFetch } from './workouts/use-workouts-fetch';
import { useWorkoutsActions } from './workouts/use-workouts-actions';
import { usePreparedWorkouts } from './workouts/use-prepared-workouts';
import { useSavedWorkouts } from './workouts/use-saved-workouts';
import { useWorkoutDetail } from './workout-detail';

// Define and export the custom hook that combines other hooks
export const useWorkouts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchAllWorkouts, fetchSavedWorkouts } = useWorkoutsFetch(isLoading, setIsLoading);
  const { saveWorkout, unsaveWorkout, completeWorkout, scheduleWorkout } = useWorkoutsActions(isLoading, setIsLoading);

  // Define fetchWorkouts function
  const fetchWorkouts = async () => {
    return await fetchAllWorkouts();
  };

  return {
    workouts: [],  // This will be populated by the fetchWorkouts call
    isLoading,
    fetchWorkouts,
    fetchAllWorkouts,
    fetchSavedWorkouts,
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduleWorkout
  };
};

// Export other hooks for use in specific components
export {
  useWorkoutsFetch,
  useWorkoutsActions,
  usePreparedWorkouts,
  useSavedWorkouts,
  useWorkoutDetail
};
