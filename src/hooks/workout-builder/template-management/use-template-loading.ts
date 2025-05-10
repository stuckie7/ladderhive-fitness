
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutTemplate } from "../types";
import { useWodFetch } from '../../wods/use-wod-fetch';
import { TemplateExercise } from '../types';

export const useTemplateLoading = (
  setTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
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
  }, [setIsLoading, setTemplates, toast]);

  return {
    loadTemplateFromWod,
    loadTemplates
  };
};
