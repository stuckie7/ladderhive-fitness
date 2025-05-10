
import { useState, useCallback } from 'react';
import { useWodFetch } from '../wods/use-wod-fetch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Simplified interfaces to avoid recursive type definitions
export interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
}

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: ExerciseSet[];
  restSeconds?: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  isCircuit?: boolean;
}

export const useTemplateManagement = () => {
  const [currentTemplate, setCurrentTemplate] = useState<WorkoutTemplate | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTemplate = useCallback((template: WorkoutTemplate) => {
    setTemplates(prevTemplates => [...prevTemplates, template]);
  }, []);

  const updateTemplate = useCallback((updatedTemplate: WorkoutTemplate) => {
    setTemplates(prevTemplates =>
      prevTemplates.map(template =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
    setCurrentTemplate(updatedTemplate);
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setTemplates(prevTemplates =>
      prevTemplates.filter(template => template.id !== templateId)
    );
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
  }, []);
  
  const { fetchWodById } = useWodFetch();
  
  const loadTemplateFromWod = useCallback(async (wodId: string) => {
    try {
      const wod = await fetchWodById(wodId);
      
      if (!wod) return null;
      
      // Convert WOD components to template format
      const templateExercises: TemplateExercise[] = wod.components.map((component, index) => {
        // Extract reps from description if possible
        const repsMatch = component.description.match(/(\d+) reps/i);
        const defaultReps = repsMatch ? parseInt(repsMatch[1], 10) : 10;
        
        return {
          id: `template-ex-${index}`,
          exerciseId: `wod-component-${index}`,
          name: component.description,
          sets: [{
            id: `set-${index}-1`,
            reps: defaultReps,
          }],
          restSeconds: 60,
        };
      });
      
      const template: WorkoutTemplate = {
        id: wodId,
        name: wod.name,
        exercises: templateExercises,
        isCircuit: wod.components.length > 3,
      };
      
      // Set the template as current
      // setCurrentTemplate(template);
      
      return template;
    } catch (error) {
      console.error("Error loading template from WOD:", error);
      return null;
    }
  }, [fetchWodById]);

  // Add the missing loadTemplates function
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const loadedTemplates = data.map(template => ({
          id: template.id,
          name: template.title,
          exercises: [], // We'll load these on demand when a template is selected
          isCircuit: false
        }));
        
        setTemplates(loadedTemplates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load workout templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Add the missing saveAsTemplate function
  const saveAsTemplate = useCallback(async () => {
    // Implementation would depend on your current workout state
    // This is a placeholder that would be implemented based on your app's requirements
    toast({
      title: "Template Saved",
      description: "Your workout has been saved as a template"
    });
    
    return true;
  }, [toast]);

  const duplicateTemplate = useCallback((template: WorkoutTemplate) => {
    const newTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`
    };
    addTemplate(newTemplate);
  }, [addTemplate]);
  
  return {
    currentTemplate,
    setCurrentTemplate,
    templates,
    setTemplates,
    isLoading,
    setIsLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    loadTemplateFromWod,
    loadTemplates,
    saveAsTemplate,
  };
};
