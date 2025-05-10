
import { WorkoutStateType } from "../use-workout-state";
import { useWorkoutLoader } from "./use-workout-loader";
import { useWorkoutSaver } from "./use-workout-saver";

export const useWorkoutPersistence = (
  workoutState: Pick<WorkoutStateType, 
    'workout' | 'setWorkout' | 
    'exercises' | 'setExercises' | 
    'setIsLoading' | 'setIsSaving'
  >
) => {
  const { loadWorkout, loadTemplate } = useWorkoutLoader({
    setWorkout: workoutState.setWorkout,
    setExercises: workoutState.setExercises,
    setIsLoading: workoutState.setIsLoading
  });
  
  const { saveWorkout } = useWorkoutSaver({
    workout: workoutState.workout,
    exercises: workoutState.exercises,
    setIsSaving: workoutState.setIsSaving
  });

  return {
    loadWorkout,
    loadTemplate,
    saveWorkout
  };
};

export type { WorkoutStateType } from "../use-workout-state";
