
import { useState } from 'react';
import { useFetchWorkout } from './use-fetch-workout';
import { useFetchWorkoutExercises } from '../workout-exercises/use-fetch-workout-exercises';
import { useWorkoutActions } from './use-workout-actions';
import { useNavigate } from 'react-router-dom';
import { Exercise } from '@/types/exercise';

export const useWorkoutDetail = (workoutId?: string) => {
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();
  
  const { workout, isLoading: isLoadingWorkout, error: workoutError } = useFetchWorkout(workoutId);
  const { 
    exercises: workoutExercises, 
    isLoading: isLoadingExercises, 
    error: exercisesError,
    refetch: refetchExercises
  } = useFetchWorkoutExercises(workoutId);
  
  const { isSaved, handleSaveWorkout: toggleSaveWorkout, isLoading: isActionLoading } = useWorkoutActions(workoutId);

  const handleStartWorkout = async () => {
    try {
      setIsStarting(true);
      // Logic to start workout
      // For now just navigate to a page
      navigate(`/active-workout/${workoutId}`);
    } catch (error) {
      console.error('Failed to start workout:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleAddExercise = async (exercise: Exercise) => {
    // Implementation will be added later
    console.log('Adding exercise:', exercise);
    return Promise.resolve(true);
  };

  return {
    workout,
    workoutExercises,
    isLoadingWorkout,
    isLoadingExercises,
    workoutError,
    exercisesError,
    toggleSaveWorkout,
    isSaved,
    isActionLoading,
    handleStartWorkout,
    isStarting,
    handleAddExercise,
    refetchExercises
  };
};
