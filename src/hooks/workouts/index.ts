
import { useState } from 'react';
import { useWorkoutsFetch } from './use-workouts-fetch';
import { useWorkoutsActions } from './use-workouts-actions';
import { Workout } from '@/types/workout';

export const useWorkouts = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    fetchAllWorkouts, 
    fetchSavedWorkouts 
  } = useWorkoutsFetch(isLoading, setIsLoading);
  
  const { 
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduleWorkout
  } = useWorkoutsActions(isLoading, setIsLoading);

  return {
    isLoading,
    fetchAllWorkouts,
    fetchSavedWorkouts,
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduleWorkout
  };
};

// Re-export component hooks
export * from './use-workouts-fetch';
export * from './use-workouts-actions';
