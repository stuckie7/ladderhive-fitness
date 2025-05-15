
// Import all workout-related hooks
import { useWorkoutsFetch } from './use-workouts-fetch';
import { useWorkoutsActions } from './use-workouts-actions';
import { usePreparedWorkouts } from './use-prepared-workouts';
import { useSavedWorkouts } from './use-saved-workouts';
import { useWorkoutDetail } from '../workout-detail';

// Re-export the hooks
export {
  useWorkoutsFetch,
  useWorkoutsActions,
  usePreparedWorkouts,
  useSavedWorkouts,
  useWorkoutDetail
};
