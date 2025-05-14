
import { useFetchWorkout } from "./use-fetch-workout";
import { useWorkoutActions } from "./use-workout-actions";
import { useState, useEffect } from "react";
import { Exercise } from "@/types/exercise";

// Define an immediately invoked function expression to handle importing these hooks
const useWorkoutDetail = (workoutId: string) => {
  // States
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  
  // Import and initialize the hooks
  const { 
    workout,
    exercises, 
    isLoading,
    error,
    refetchWorkout
  } = useFetchWorkout(workoutId);
  
  const {
    scheduleWorkout,
    startWorkout,
    completeWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    isActionLoading
  } = useWorkoutActions(workoutId);
  
  // Refetch when workoutId changes
  useEffect(() => {
    if (workoutId) {
      refetchWorkout(); // Fix: Call with no arguments since refetchWorkout doesn't expect any
    }
  }, [workoutId, refetchWorkout]);
  
  // Handle adding an exercise with proper type handling
  const handleAddExercise = async (exercise: Exercise) => {
    setIsAddingExercise(true);
    try {
      // Convert the exercise properly
      await addExerciseToWorkout(exercise);
      await refetchWorkout(); // Refresh workout data after adding exercise
      return true;
    } catch (error) {
      console.error("Error adding exercise:", error);
      return false;
    } finally {
      setIsAddingExercise(false);
    }
  };
  
  return {
    workout,
    exercises,
    isLoading: isLoading || isActionLoading || isAddingExercise,
    error,
    scheduleWorkout,
    startWorkout,
    completeWorkout,
    addExerciseToWorkout: handleAddExercise,
    removeExerciseFromWorkout,
  };
};

export { useWorkoutDetail };
