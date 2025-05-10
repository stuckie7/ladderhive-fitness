
import { useState, useCallback } from 'react';
import { useTemplateState } from './use-template-state';
import { useTemplateCrud } from './use-template-crud';
import { useTemplateLoading } from './use-template-loading';
import { WorkoutTemplate } from "../types";

export const useTemplateManagement = () => {
  const {
    currentTemplate,
    setCurrentTemplate,
    templates,
    setTemplates,
    isLoading,
    setIsLoading,
    loadTemplates
  } = useTemplateState();

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

export type { WorkoutTemplate } from "../types";
export { useTemplateState } from './use-template-state';
export { useTemplateCrud } from './use-template-crud';
export { useTemplateLoading } from './use-template-loading';
