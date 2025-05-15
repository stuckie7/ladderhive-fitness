
import { useWorkoutsFetch } from './workouts/use-workouts-fetch';
import { useWorkoutsActions } from './workouts/use-workouts-actions';
import { usePreparedWorkouts } from './workouts/use-prepared-workouts';
import { useSavedWorkouts } from './workouts/use-saved-workouts';
import { useWorkoutDetail } from './workout-detail';

// Export all workout-related hooks
export {
  useWorkoutsFetch,
  useWorkoutsActions,
  usePreparedWorkouts,
  useSavedWorkouts,
  useWorkoutDetail
};
