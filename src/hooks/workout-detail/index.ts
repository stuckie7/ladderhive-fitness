
import { useFetchWorkout } from "./use-fetch-workout";
import { useWorkoutActions } from "./use-workout-actions";
import { useState, useEffect } from "react";
import { Exercise } from "@/types/exercise";
import { useWorkoutExercises } from "../use-workout-exercises";
import { WorkoutExercise } from "../workout-exercises/utils";

// Define the hook to handle workout details
const useWorkoutDetail = (workoutId: string) => {
  // States
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [workoutActionLoading, setWorkoutActionLoading] = useState(false);
  
  // Import and initialize the hooks
  const { 
    workout,
    isLoading: workoutLoading,
    isSaved,
    setIsSaved,
    fetchWorkout
  } = useFetchWorkout(workoutId);
  
  const {
    isLoading: actionsLoading,
    handleSaveWorkout,
    handleCompleteWorkout
  } = useWorkoutActions(workoutId, setIsSaved);
  
  // Use the workout exercises hook to fetch and manage exercises
  const {
    exercises,
    isLoading: exercisesIsLoading, 
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails
  } = useWorkoutExercises(workoutId);
  
  // Update local exercises state
  useEffect(() => {
    if (exercises) {
      setWorkoutExercises(exercises);
      setExercisesLoading(false);
    }
  }, [exercises]);
  
  // Refetch when workoutId changes
  useEffect(() => {
    if (workoutId) {
      fetchWorkout();
    }
  }, [workoutId, fetchWorkout]);
  
  // Handle adding an exercise with proper type handling
  const handleAddExercise = async (exercise: Exercise) => {
    setIsAddingExercise(true);
    try {
      await addExerciseToWorkout(exercise);
      return true;
    } catch (err) {
      console.error("Error adding exercise:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setIsAddingExercise(false);
    }
  };
  
  // Consolidate loading states
  const isLoading = workoutLoading || actionsLoading || exercisesIsLoading || isAddingExercise || workoutActionLoading;
  
  // Provide all necessary functions and states to the component
  return {
    workout,
    exercises: workoutExercises,
    isLoading,
    error,
    isSaved,
    workoutExercises,
    exercisesLoading,
    workoutActionLoading,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout,
    // For compatibility with existing code:
    scheduleWorkout: async () => {
      console.warn("scheduleWorkout not implemented");
    },
    startWorkout: async () => {
      console.warn("startWorkout not implemented");
    },
    completeWorkout: handleCompleteWorkout,
    addExerciseToWorkout: handleAddExercise,
    removeExerciseFromWorkout
  };
};

export { useWorkoutDetail };
