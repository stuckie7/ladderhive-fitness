
import { useWorkoutState } from "./use-workout-state";
import { useWorkoutInfo } from "./use-workout-info";
import { useExerciseManagement } from "./use-exercise-management";
import { useTemplateManagement } from "./template-management";
import { useWorkoutPersistence } from "./persistence";
import { useEffect } from "react";
import { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from "./types";

export const useWorkoutBuilder = (workoutId?: string) => {
  // Core state
  const workoutState = useWorkoutState();
  
  // Feature hooks
  const workoutInfo = useWorkoutInfo({ 
    workout: workoutState.workout, 
    setWorkout: workoutState.setWorkout 
  });
  
  const exerciseManagement = useExerciseManagement({
    exercises: workoutState.exercises,
    setExercises: workoutState.setExercises,
    searchQuery: workoutState.searchQuery,
    setSearchQuery: workoutState.setSearchQuery,
    searchResults: workoutState.searchResults,
    setSearchResults: workoutState.setSearchResults,
    setIsLoading: workoutState.setIsLoading
  });
  
  const templateManagement = useTemplateManagement();
  
  const workoutPersistence = useWorkoutPersistence({
    workout: workoutState.workout,
    setWorkout: workoutState.setWorkout,
    exercises: workoutState.exercises,
    setExercises: workoutState.setExercises,
    setIsLoading: workoutState.setIsLoading,
    setIsSaving: workoutState.setIsSaving
  });

  // Initial workout loading if editing
  useEffect(() => {
    if (workoutId) {
      workoutPersistence.loadWorkout(workoutId);
    }
  }, [workoutId, workoutPersistence]);

  // Load templates on initial render
  useEffect(() => {
    templateManagement.loadTemplates();
  }, [templateManagement]);
  
  return {
    // State
    workout: workoutState.workout,
    exercises: workoutState.exercises,
    templates: templateManagement.templates,
    isLoading: workoutState.isLoading,
    isSaving: workoutState.isSaving,
    searchQuery: workoutState.searchQuery,
    searchResults: workoutState.searchResults,
    selectedMuscleGroup: workoutState.selectedMuscleGroup,
    selectedEquipment: workoutState.selectedEquipment,
    selectedDifficulty: workoutState.selectedDifficulty,
    
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
    // Update here: use templateManagement.loadTemplateFromPreparedWorkout instead of workoutPersistence.loadTemplate
    loadTemplate: templateManagement.loadTemplateFromPreparedWorkout,
    loadTemplateFromWod: templateManagement.loadTemplateFromWod,
    loadTemplateFromPreparedWorkout: templateManagement.loadTemplateFromPreparedWorkout,
    deleteTemplate: templateManagement.deleteTemplate,
    loadTemplates: templateManagement.loadTemplates,
    
    // Workout persistence
    saveWorkout: workoutPersistence.saveWorkout,
    loadWorkout: workoutPersistence.loadWorkout,
  };
};

export type { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from './types';
