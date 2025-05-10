
import { useTemplateState } from './use-template-state';
import { useTemplateCrud } from './use-template-crud';
import { useTemplateLoading } from './use-template-loading';

export const useTemplateManagement = () => {
  // Hook composition for template management
  const {
    currentTemplate,
    setCurrentTemplate,
    templates,
    setTemplates,
    isLoading,
    setIsLoading
  } = useTemplateState();

  const {
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    saveAsTemplate
  } = useTemplateCrud(templates, setTemplates, currentTemplate, setCurrentTemplate);

  const {
    loadTemplateFromWod,
    loadTemplates
  } = useTemplateLoading(setTemplates, setIsLoading);

  return {
    // State
    currentTemplate,
    setCurrentTemplate,
    templates,
    setTemplates,
    isLoading,
    setIsLoading,
    
    // CRUD operations
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    
    // Loading operations
    loadTemplateFromWod,
    loadTemplates,
    saveAsTemplate,
  };
};
