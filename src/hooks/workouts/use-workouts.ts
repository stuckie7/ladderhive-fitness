
import { useState } from 'react';
import { useWorkoutsFetch } from './use-workouts-fetch';
import { useWorkoutsActions } from './use-workouts-actions';

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { fetchAllWorkouts, fetchSavedWorkouts } = useWorkoutsFetch(isLoading, setIsLoading);
  const { saveWorkout, unsaveWorkout, completeWorkout, scheduleWorkout } = useWorkoutsActions(isLoading, setIsLoading);

  const fetchWorkouts = async () => {
    try {
      const data = await fetchAllWorkouts();
      setWorkouts(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workouts');
      console.error('Error in fetchWorkouts:', err);
    }
  };

  return {
    workouts,
    isLoading,
    error,
    fetchWorkouts,
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduleWorkout
  };
};
