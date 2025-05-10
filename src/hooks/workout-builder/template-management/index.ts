
import { useState, useCallback } from 'react';
import { useTemplateState } from './use-template-state';
import { useTemplateCrud } from './use-template-crud';
import { useTemplateLoading } from './use-template-loading';
import { WorkoutTemplate } from "../types";
import { WorkoutDetail } from '../types';

export const useTemplateManagement = () => {
  const {
    currentTemplate,
    setCurrentTemplate,
    currentExercises,
    setCurrentExercises,
  } = useTemplateState();
  
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Implement template loading logic here
      // This is a placeholder - actual implementation would load from your data source
      setTemplates([]);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get CRUD operations from the hook
  const templateCrudOps = useTemplateCrud();

  const { 
    loadTemplate,
    loadTemplates: fetchTemplates,
    loadTemplateFromPreparedWorkout,
    loadTemplateFromWod,
    isLoading: templateLoading
  } = useTemplateLoading({
    setCurrentTemplate
  });

  return {
    templates,
    setTemplates,
    currentTemplate,
    setCurrentTemplate,
    currentExercises,
    setCurrentExercises,
    isLoading: isLoading || templateLoading,
    setIsLoading,
    addTemplate: templateCrudOps.createTemplate,
    updateTemplate: templateCrudOps.updateTemplate,
    deleteTemplate: templateCrudOps.deleteTemplate,
    duplicateTemplate: templateCrudOps.duplicateTemplate,
    saveAsTemplate: templateCrudOps.saveAsTemplate,
    loadTemplate,
    loadTemplateFromWod,
    loadTemplateFromPreparedWorkout,
    loadTemplates: fetchTemplates
  };
};

export type { ExerciseTemplate, WorkoutTemplate } from './template-types';
export { useTemplateState } from './use-template-state';
export { useTemplateCrud } from './use-template-crud';
export { useTemplateLoading } from './use-template-loading';
