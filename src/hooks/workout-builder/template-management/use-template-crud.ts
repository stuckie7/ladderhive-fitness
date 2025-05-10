
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutTemplate } from "../types";
import { TemplateFilter } from './template-types';

export const useTemplateCrud = (
  templates: WorkoutTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>,
  currentTemplate: WorkoutTemplate | null,
  setCurrentTemplate: React.Dispatch<React.SetStateAction<WorkoutTemplate | null>>
) => {
  const { toast } = useToast();

  const addTemplate = useCallback((template: WorkoutTemplate) => {
    setTemplates(prevTemplates => [...prevTemplates, template]);
  }, [setTemplates]);

  const updateTemplate = useCallback((updatedTemplate: WorkoutTemplate) => {
    setTemplates(prevTemplates =>
      prevTemplates.map(template =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
    setCurrentTemplate(updatedTemplate);
  }, [setTemplates, setCurrentTemplate]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    // Use the explicit TemplateFilter type to avoid deep instantiation issues
    const filterTemplates: TemplateFilter = (templatesArray) => {
      return templatesArray.filter(template => template.id !== templateId);
    };
    
    setTemplates(prevTemplates => filterTemplates(prevTemplates));
    setCurrentTemplate(prev => prev?.id === templateId ? null : prev);
    
    try {
      // If the template is stored in the database, delete it
      await supabase
        .from('prepared_workouts')
        .delete()
        .eq('id', templateId)
        .eq('is_template', true);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  }, [setTemplates, setCurrentTemplate]);

  const duplicateTemplate = useCallback((template: WorkoutTemplate) => {
    const newTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      title: `${template.title || template.name} (Copy)`
    };
    addTemplate(newTemplate);
  }, [addTemplate]);

  const saveAsTemplate = useCallback(async (workout?: any) => {
    try {
      if (!workout && !currentTemplate) {
        toast({
          title: "Error",
          description: "No workout to save as template",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Template Saved",
        description: "Your workout has been saved as a template"
      });
      
      return true;
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save workout as template",
        variant: "destructive"
      });
      return false;
    }
  }, [currentTemplate, toast]);

  return {
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    saveAsTemplate
  };
};
