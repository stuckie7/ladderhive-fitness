
import { useState, useCallback } from 'react';
import { useWorkoutsFetch } from './workouts/use-workouts-fetch';
import { useWorkoutsActions } from './workouts/use-workouts-actions';
import { Workout } from '@/types/workout';

export const useWorkouts = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<{ workout: Workout, id: string }[]>([]);
  
  const { fetchAllWorkouts, fetchSavedWorkouts } = useWorkoutsFetch(isLoading, setIsLoading);
  const { saveWorkout, unsaveWorkout, completeWorkout, scheduleWorkout } = useWorkoutsActions(isLoading, setIsLoading);
  
  const fetchWorkouts = useCallback(async () => {
    const data = await fetchAllWorkouts();
    setWorkouts(data);
    return data;
  }, [fetchAllWorkouts]);
  
  const fetchSaved = useCallback(async () => {
    const data = await fetchSavedWorkouts();
    setSavedWorkouts(data);
    return data;
  }, [fetchSavedWorkouts]);
  
  const refreshWorkouts = useCallback(async () => {
    await Promise.all([fetchWorkouts(), fetchSaved()]);
  }, [fetchWorkouts, fetchSaved]);
  
  return {
    workouts,
    savedWorkouts,
    isLoading,
    fetchWorkouts,
    fetchSavedWorkouts: fetchSaved,
    refreshWorkouts,
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduleWorkout
  };
};
