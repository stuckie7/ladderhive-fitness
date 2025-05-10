
import { useWorkoutState } from "./use-workout-state";
import { useWorkoutInfo } from "./use-workout-info";
import { useExerciseManagement } from "./use-exercise-management";
import { useTemplateManagement } from "./use-template-management";
import { useWorkoutPersistence } from "./use-workout-persistence";
import { useEffect } from "react";
import { WorkoutDetail } from "./types";

export const useWorkoutBuilder = (workoutId?: string) => {
  // Core state
  const workoutState = useWorkoutState();
  
  // Feature hooks
  const workoutInfo = useWorkoutInfo(workoutState);
  const exerciseManagement = useExerciseManagement(workoutState);
  const templateManagement = useTemplateManagement(workoutState);
  const workoutPersistence = useWorkoutPersistence(workoutState);

  // Initial workout loading if editing
  useEffect(() => {
    if (workoutId) {
      workoutPersistence.loadWorkout(workoutId);
    }
  }, [workoutId, workoutPersistence.loadWorkout]);

  // Load templates on initial render
  useEffect(() => {
    templateManagement.loadTemplates();
  }, [templateManagement.loadTemplates]);
  
  return {
    // State
    workout: workoutState.workout,
    exercises: workoutState.exercises,
    templates: workoutState.templates,
    isLoadingTemplates: workoutState.isLoadingTemplates,
    searchResults: workoutState.searchResults,
    searchQuery: workoutState.searchQuery,
    selectedMuscleGroup: workoutState.selectedMuscleGroup,
    selectedEquipment: workoutState.selectedEquipment,
    selectedDifficulty: workoutState.selectedDifficulty,
    isLoading: workoutState.isLoading,
    isSaving: workoutState.isSaving,
    
    // Workout info methods
    setWorkoutInfo: workoutInfo.setWorkoutInfo,
    resetWorkout: workoutInfo.resetWorkout,
    
    // Exercise management
    handleSearchChange: exerciseManagement.handleSearchChange,
    handleFilterChange: exerciseManagement.handleFilterChange,
    addExerciseToWorkout: exerciseManagement.addExerciseToWorkout,
    removeExerciseFromWorkout: exerciseManagement.removeExerciseFromWorkout,
    updateExerciseDetails: exerciseManagement.updateExerciseDetails,
    moveExerciseUp: exerciseManagement.moveExerciseUp,
    moveExerciseDown: exerciseManagement.moveExerciseDown,
    reorderExercises: exerciseManagement.reorderExercises,
    
    // Template management
    saveAsTemplate: templateManagement.saveAsTemplate,
    loadTemplate: workoutPersistence.loadTemplate,
    deleteTemplate: templateManagement.deleteTemplate,
    loadTemplates: templateManagement.loadTemplates,
    
    // Workout persistence
    saveWorkout: workoutPersistence.saveWorkout,
    loadWorkout: workoutPersistence.loadWorkout,
  };
};

export type { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from './types';
