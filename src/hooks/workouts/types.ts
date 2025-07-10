
import { PreparedWorkout as BasePreparedWorkout } from '@/types/workout';

export interface PreparedWorkout extends BasePreparedWorkout {}

export interface SaveWorkoutResult {
  success: boolean;
  message?: string;
  error?: any;
}
