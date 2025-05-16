
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SimplifiedWorkoutTemplate, TemplateExercise, WorkoutTemplate } from './template-types';

// Simplified state to avoid infinite recursion
interface TemplateCrudState {
  templates: SimplifiedWorkoutTemplate[];
  current: WorkoutTemplate | null;
  status: 'idle' | 'loading' | 'error';
}

export const useTemplateCrud = () => {
  // Initialize state with a simplified template type
  const [state, setState] = useState<TemplateCrudState>({
    templates: [],
    current: null,
    status: 'idle'
  });

  const fetchTemplates = useCallback(async () => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      // We know "prepared_workouts" exists, so use that directly
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*');
      
      if (error) {
        throw error;
      }

      // Transform the data to match our template structure
      const templates: SimplifiedWorkoutTemplate[] = (data || []).map(workout => ({
        id: workout.id,
        name: workout.title,
        title: workout.title,
        category: workout.category || undefined,
        difficulty: workout.difficulty || undefined,
        created_at: workout.created_at || undefined,
        description: workout.description || undefined,
        source_wod_id: undefined
      }));

      setState(prevState => ({
        ...prevState,
        templates: templates,
        status: 'idle'
      }));
      
      return templates;
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
      return [];
    }
  }, []);

  const getTemplate = useCallback(async (id: string) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      // Use prepared_workouts as a source
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Fetch exercises for the template from prepared_workout_exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select('*')
        .eq('workout_id', id);

      if (exercisesError) {
        throw exercisesError;
      }

      // Transform exercises to match TemplateExercise type
      const exercises: TemplateExercise[] = exercisesData.map(ex => ({
        id: ex.id,
        exerciseId: String(ex.exercise_id),
        name: ex.notes || undefined, // We don't have the actual name here
        sets: ex.sets,
        reps: ex.reps || '10', // Ensure reps is not undefined
        rest_seconds: ex.rest_seconds,
        notes: ex.notes
      }));

      // Create a template from the workout
      const template: WorkoutTemplate = {
        id: data.id,
        name: data.title,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        created_at: data.created_at,
        exercises: exercises,
        source_wod_id: undefined
      };

      setState(prevState => ({
        ...prevState,
        current: template,
        status: 'idle'
      }));
      
      return template;
    } catch (error: any) {
      console.error("Error fetching template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
      return null;
    }
  }, []);

  // Placeholder implementations for CRUD operations
  const createTemplate = useCallback(async (template: Omit<WorkoutTemplate, 'id' | 'created_at'>) => {
    console.log("Creating template:", template);
    return null; // Placeholder
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<WorkoutTemplate>) => {
    console.log("Updating template:", id, updates);
    return null; // Placeholder
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    console.log("Deleting template:", id);
  }, []);

  const duplicateTemplate = useCallback(async (id: string) => {
    console.log("Duplicating template:", id);
    return null; // Placeholder
  }, []);

  const saveAsTemplate = useCallback(async (workout: any) => {
    console.log("Saving as template:", workout);
    return null; // Placeholder
  }, []);

  const addExerciseToTemplate = useCallback(async (templateId: string, exercise: TemplateExercise) => {
    console.log("Adding exercise to template:", templateId, exercise);
    return null; // Placeholder
  }, []);

  const updateExerciseInTemplate = useCallback(async (exerciseId: string, updates: Partial<TemplateExercise>) => {
    console.log("Updating exercise in template:", exerciseId, updates);
    return null; // Placeholder
  }, []);

  const deleteExerciseFromTemplate = useCallback(async (exerciseId: string) => {
    console.log("Deleting exercise from template:", exerciseId);
  }, []);

  return {
    templates: state.templates,
    current: state.current,
    status: state.status,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    saveAsTemplate,
    addExerciseToTemplate,
    updateExerciseInTemplate,
    deleteExerciseFromTemplate
  };
};
