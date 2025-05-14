
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutTemplate, TemplateExercise } from './template-types';

// Export the hook directly without wrapper
export const useLoadTemplate = ({ 
  setCurrentTemplate 
}: {
  setCurrentTemplate: (template: WorkoutTemplate | null) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load a specific template by ID
  const loadTemplate = useCallback(async (templateId: string) => {
    if (!templateId) {
      toast({
        title: "Error",
        description: "No template ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the template
      const { data: templateData, error: templateError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        throw templateError;
      }

      if (!templateData) {
        throw new Error("Template not found");
      }

      // Fetch the exercises for this template
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          id, 
          sets, 
          reps, 
          rest_seconds, 
          notes, 
          order_index,
          exercise_id
        `)
        .eq('workout_id', templateId)
        .order('order_index');

      if (exercisesError) {
        throw exercisesError;
      }

      // Get all unique exercise IDs
      if (exercisesData && exercisesData.length > 0) {
        const exerciseIds = exercisesData.map(ex => ex.exercise_id);

        // Fetch exercise details
        const { data: exerciseDetails, error: exerciseDetailsError } = await supabase
          .from('exercises_full')
          .select('*')
          .in('id', exerciseIds);

        if (exerciseDetailsError) {
          throw exerciseDetailsError;
        }

        // Map exercise details to workout exercises
        const templateExercises: TemplateExercise[] = exercisesData.map(ex => {
          const exerciseDetail = exerciseDetails?.find(detail => 
            detail.id === ex.exercise_id
          );
          
          return {
            id: ex.id,
            exerciseId: String(ex.exercise_id),
            name: exerciseDetail?.name || 'Unknown Exercise',
            sets: ex.sets,
            reps: ex.reps || '10', // Provide default value to avoid undefined
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
          };
        });

        // Transform the data into our template format
        const template: WorkoutTemplate = {
          id: templateData.id,
          title: templateData.title,
          name: templateData.title,
          description: templateData.description,
          category: templateData.category,
          difficulty: templateData.difficulty,
          created_at: templateData.created_at,
          exercises: templateExercises,
        };

        setCurrentTemplate(template);
        
        toast({
          title: "Template Loaded",
          description: `${templateData.title} template loaded successfully.`,
        });
        
        return template;
      } else {
        // Handle case where there are no exercises
        const template: WorkoutTemplate = {
          id: templateData.id,
          title: templateData.title,
          name: templateData.title,
          description: templateData.description,
          category: templateData.category,
          difficulty: templateData.difficulty,
          created_at: templateData.created_at,
          exercises: [],
        };

        setCurrentTemplate(template);
        
        toast({
          title: "Template Loaded",
          description: `${templateData.title} template loaded (no exercises found).`,
        });
        
        return template;
      }
    } catch (error: any) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: `Failed to load template: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, setCurrentTemplate]);

  // Load all templates 
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*');

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: `Failed to load templates: ${error.message}`,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load template from prepared workout
  const loadTemplateFromPreparedWorkout = useCallback(async (workoutId: string) => {
    return await loadTemplate(workoutId);
  }, [loadTemplate]);

  // Load template from WOD
  const loadTemplateFromWod = useCallback(async (wodId: string) => {
    setIsLoading(true);
    try {
      // Fetch the WOD
      const { data: wodData, error: wodError } = await supabase
        .from('wods')
        .select('*')
        .eq('id', wodId)
        .single();

      if (wodError) {
        throw wodError;
      }

      if (!wodData) {
        throw new Error("WOD not found");
      }

      // Create a simple template from the WOD
      const template: WorkoutTemplate = {
        id: undefined, // New template, no ID yet
        title: `${wodData.name} Template`,
        name: wodData.name,
        description: wodData.description,
        category: wodData.category || 'WOD',
        difficulty: wodData.difficulty || 'Intermediate',
        created_at: new Date().toISOString(),
        exercises: [],
        source_wod_id: wodId
      };

      setCurrentTemplate(template);
      
      toast({
        title: "WOD Loaded",
        description: `${wodData.name} loaded as template.`,
      });
      
      return template;
    } catch (error: any) {
      console.error("Error loading WOD as template:", error);
      toast({
        title: "Error",
        description: `Failed to load WOD as template: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, setCurrentTemplate]);

  return {
    loadTemplate,
    loadTemplates,
    loadTemplateFromPreparedWorkout,
    loadTemplateFromWod,
    isLoading
  };
};
