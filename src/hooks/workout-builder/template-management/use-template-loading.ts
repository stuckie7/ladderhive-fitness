
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutTemplate, TemplateExercise } from './template-types';
import { WodComponent } from '@/types/wod'; // Added import for WodComponent type

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
        .select('*, components(*, exercises(*))') // Eagerly load components and their exercises if possible
        .eq('id', wodId)
        .single();

      if (wodError) {
        console.error("Supabase error fetching WOD:", wodError);
        throw wodError;
      }

      if (!wodData) {
        throw new Error("WOD not found");
      }

      let processedExercises: TemplateExercise[] = [];
      let overallOrderIndex = 0;

      // Check if wodData.components is an array before trying to iterate
      if (Array.isArray(wodData.components) && wodData.components.length > 0) {
        const allWodExerciseEntries: any[] = [];
        wodData.components.forEach((component: WodComponent) => { // Added WodComponent type
          // Check if component.exercises is an array
          if (Array.isArray(component.exercises) && component.exercises.length > 0) {
            component.exercises.forEach((exerciseEntry: any) => {
              if (exerciseEntry.exercise_id) { // Ensure exercise_id exists
                allWodExerciseEntries.push({
                  ...exerciseEntry, // Contains exercise_id, reps, sets, notes etc. from WOD component
                  component_description: component.description, // Carry over component description for context
                  order_index: overallOrderIndex++
                });
              }
            });
          }
        });

        if (allWodExerciseEntries.length > 0) {
          const exerciseIdsToFetch = [
            ...new Set(allWodExerciseEntries.map(ex => ex.exercise_id).filter(id => id != null))
          ];

          if (exerciseIdsToFetch.length > 0) {
            const { data: exerciseDetails, error: exerciseDetailsError } = await supabase
              .from('exercises_full') // Assuming 'exercises_full' has comprehensive details
              .select('id, name, prime_mover_muscle, primary_equipment') // Select necessary fields
              .in('id', exerciseIdsToFetch);

            if (exerciseDetailsError) {
              console.error("Supabase error fetching exercise details:", exerciseDetailsError);
              throw exerciseDetailsError;
            }

            if (exerciseDetails) {
              processedExercises = allWodExerciseEntries.map(entry => {
                const detail = exerciseDetails.find(d => d.id === entry.exercise_id);
                return {
                  id: `wod-ex-${entry.exercise_id}-${entry.order_index}`, // Temporary unique ID for the template exercise instance
                  exerciseId: String(entry.exercise_id),
                  name: detail?.name || 'Unknown Exercise',
                  reps: String(entry.reps || ''), // Ensure reps is a string
                  sets: entry.sets || undefined, // Handle optional sets
                  notes: entry.notes || entry.component_description || '', // Prioritize exercise notes, then component desc.
                  // You might want to add other fields like prime_mover_muscle from detail if needed by TemplateExercise
                };
              }).sort((a, b) => {
                // Ensure consistent sorting if order_index was not perfectly sequential or if entries were mixed
                const aOrder = parseInt(a.id.split('-').pop() || '0');
                const bOrder = parseInt(b.id.split('-').pop() || '0');
                return aOrder - bOrder;
              });
            }
          }
        }
      }

      // Create a template from the WOD data including processed exercises
      const template: WorkoutTemplate = {
        id: undefined, // New template, no DB ID yet
        title: `${wodData.name || 'Unnamed WOD'} (from WOD)`,
        name: wodData.name || 'Unnamed WOD',
        description: wodData.description || '',
        category: wodData.category || 'WOD',
        difficulty: wodData.difficulty || 'Intermediate',
        created_at: new Date().toISOString(),
        exercises: processedExercises, // Use the processed exercises
        source_wod_id: wodData.id, // Corrected: use wodData.id instead of undefined wodId variable
      };

      setCurrentTemplate(template);
      
      toast({
        title: "WOD Loaded as Template",
        description: `${wodData.name} and its exercises are ready in the builder.`,
      });
      
      return template;
    } catch (error: any) {
      console.error("Error loading WOD as template:", error);
      toast({
        title: "Error Loading WOD",
        description: `Failed to load WOD as template: ${error.message}`,
        variant: "destructive",
      });
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
