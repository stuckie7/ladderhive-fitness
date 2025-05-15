
import { useWorkoutDetailData } from './use-workout-details-data';
import { useWorkoutsFetch } from './use-workouts-fetch';
import { useWorkoutsActions } from './use-workouts-actions';
import { usePreparedWorkouts } from './use-prepared-workouts';
import { useSavedWorkouts } from './use-saved-workouts';

export const useWorkouts = () => {
  const { workouts, isLoading, currentPage, totalWorkouts, error } = useWorkoutsFetch();
  const { loadMoreWorkouts, refetchWorkouts, searchWorkouts } = useWorkoutsActions();
  
  return {
    workouts,
    isLoading,
    currentPage,
    totalWorkouts,
    error,
    loadMoreWorkouts,
    refetchWorkouts,
    searchWorkouts
  };
};

export { usePreparedWorkouts } from './use-prepared-workouts';
export { useSavedWorkouts } from './use-saved-workouts';
export { useWorkoutDetailData } from './use-workout-details-data';
export type { PreparedWorkout } from './use-prepared-workouts';
