
import { useState, useCallback } from 'react';
import { useTemplateState } from './use-template-state';
import { useTemplateCrud } from './use-template-crud';
import { useTemplateLoading } from './use-template-loading';
import { WorkoutTemplate } from "./template-types";

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

  const {
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    saveAsTemplate
  } = useTemplateCrud(
    templates,
    setTemplates,
    currentTemplate,
    setCurrentTemplate
  );

  const { loadTemplateFromWod } = useTemplateLoading(setCurrentTemplate);

  return {
    templates,
    setTemplates,
    currentTemplate,
    setCurrentTemplate,
    currentExercises,
    setCurrentExercises,
    isLoading,
    setIsLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    saveAsTemplate,
    loadTemplateFromWod,
    loadTemplates
  };
};

export type { ExerciseTemplate, WorkoutTemplate } from './template-types';
export { useTemplateState } from './use-template-state';
export { useTemplateCrud } from './use-template-crud';
export { useTemplateLoading } from './use-template-loading';
