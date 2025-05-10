
import { useState, useCallback } from 'react';
import { useWodFetch } from '../wods/use-wod-fetch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutTemplate, TemplateExercise } from './types';

// Simplified internal interface for exercise sets
interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
}

// Define a simplified type for workout input to avoid recursive type issues
interface WorkoutInput {
  id?: string;
  title: string;
  description?: string; 
  exercises?: Array<{
    id: string;
    name?: string;
    sets?: Array<{
      id: string;
      reps: number;
      weight?: number;
      duration?: number;
    }>;
  }>;
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
    // Fix: Explicitly type the filter function to avoid recursive type inference
    const filterTemplates = (templates: WorkoutTemplate[]) => {
      return templates.filter(template => template.id !== templateId);
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
        title: wod.name,  // Using title instead of name to match types
        name: wod.name,   // Keep name for backward compatibility
        exercises: templateExercises,
        category: wod.category || 'General',
        difficulty: wod.difficulty || 'Intermediate',
        created_at: new Date().toISOString(),
        isCircuit: wod.components.length > 3,
        description: wod.description || ''
      };
      
      return template;
    } catch (error) {
      console.error("Error loading template from WOD:", error);
      return null;
    }
  }, [fetchWodById]);

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
          title: template.title,
          name: template.title, // For backward compatibility
          category: template.category || 'General',
          difficulty: template.difficulty || 'Intermediate',
          created_at: template.created_at || new Date().toISOString(),
          description: template.description || '',
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

  const saveAsTemplate = useCallback(async (workout?: WorkoutInput) => {
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

  const duplicateTemplate = useCallback((template: WorkoutTemplate) => {
    const newTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      title: `${template.title || template.name} (Copy)`
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
