import { useState, useEffect } from "react";
import { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from "./types";
import { useWorkoutState } from "./use-workout-state";
import { useWorkoutInfo } from "./use-workout-info";
import { useExerciseManagement } from "./use-exercise-management";
import { useWorkoutPersistence } from "./persistence";
import { useTemplateManagement } from "./template-management";

// Main hook for workout builder functionality
export const useWorkoutBuilder = (workoutId?: string, templateId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workout state management
  const {
    workout, setWorkout,
    exercises, setExercises,
    addExercise, updateExercise, removeExercise,
    moveExercise, resetWorkout
  } = useWorkoutState();

  // Workout info management
  const {
    updateWorkoutInfo,
    updateWorkoutField
  } = useWorkoutInfo(setWorkout);

  // Exercise management
  const {
    searchResults,
    searchQuery,
    isSearching,
    searchExercises,
    addExerciseToWorkout
  } = useExerciseManagement(addExercise);

  // Persistence operations
  const {
    saveWorkout,
    loadWorkout,
    loadTemplate
  } = useWorkoutPersistence({
    workout,
    exercises,
    setWorkout,
    setExercises,
    setIsLoading,
    setIsSaving
  });

  // Template management
  const {
    templates,
    isLoadingTemplates,
    fetchTemplates,
    saveAsTemplate,
    openTemplateModal,
    closeTemplateModal,
    isTemplateModalOpen,
    selectedTemplate,
    setSelectedTemplate
  } = useTemplateManagement({
    workout,
    exercises,
    loadTemplate
  });

  // Initial load based on IDs
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Load from template if specified
      if (templateId) {
        await loadTemplate(templateId);
      }
      // Load existing workout if specified
      else if (workoutId) {
        await loadWorkout(workoutId);
      }
      // Otherwise start with empty state (done in useWorkoutState)
      setIsLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId, templateId]);

  // Function to handle saving workout
  const handleSaveWorkout = async (): Promise<WorkoutDetail | null> => {
    setIsSubmitting(true);
    try {
      const result = await saveWorkout();
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle saving as template
  const handleSaveAsTemplate = async () => {
    setIsSubmitting(true);
    try {
      await saveAsTemplate();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    workout,
    exercises,
    isLoading,
    isSaving,
    isSubmitting,
    
    // Workout info operations
    updateWorkoutInfo,
    updateWorkoutField,
    
    // Exercise operations
    addExercise,
    updateExercise,
    removeExercise,
    moveExercise,
    searchExercises,
    searchResults,
    searchQuery,
    isSearching,
    addExerciseToWorkout,
    
    // Persistence operations
    saveWorkout: handleSaveWorkout,
    resetWorkout,
    
    // Template operations
    templates,
    isLoadingTemplates,
    fetchTemplates,
    saveAsTemplate: handleSaveAsTemplate,
    openTemplateModal,
    closeTemplateModal,
    isTemplateModalOpen,
    selectedTemplate,
    setSelectedTemplate
  };
};

export type { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from './types';
