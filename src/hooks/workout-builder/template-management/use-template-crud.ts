import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SimplifiedWorkoutTemplate, TemplateExercise, WorkoutTemplate } from '../types';

// Use a simplified type to avoid infinite recursion
interface TemplateCrudState {
  templates: SimplifiedWorkoutTemplate[];
  current: WorkoutTemplate | null;
  status: 'idle' | 'loading' | 'error';
}

export const useTemplateCrud = () => {
  // Initialize state with a simplified template type to avoid infinite recursion
  const [state, setState] = useState<TemplateCrudState>({
    templates: [],
    current: null,
    status: 'idle'
  });

  const fetchTemplates = useCallback(async () => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*');

      if (error) {
        throw error;
      }

      setState(prevState => ({
        ...prevState,
        templates: data as SimplifiedWorkoutTemplate[],
        status: 'idle'
      }));
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
    }
  }, []);

  const getTemplate = useCallback(async (id: string) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Fetch exercises for the template
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('workout_template_id', id);

      if (exercisesError) {
        throw exercisesError;
      }

      setState(prevState => ({
        ...prevState,
        current: { ...data, exercises: exercisesData } as WorkoutTemplate,
        status: 'idle'
      }));
    } catch (error: any) {
      console.error("Error fetching template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<WorkoutTemplate, 'id' | 'created_at'>) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setState(prevState => ({
        ...prevState,
        templates: [...prevState.templates, data as SimplifiedWorkoutTemplate],
        status: 'idle'
      }));

      return data as WorkoutTemplate;
    } catch (error: any) {
      console.error("Error creating template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
      return null;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<WorkoutTemplate>) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setState(prevState => ({
        ...prevState,
        templates: prevState.templates.map(template =>
          template.id === id ? { ...template, ...data } : template
        ),
        status: 'idle'
      }));

      return data as WorkoutTemplate;
    } catch (error: any) {
      console.error("Error updating template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
      return null;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setState(prevState => ({
        ...prevState,
        templates: prevState.templates.filter(template => template.id !== id),
        status: 'idle'
      }));
    } catch (error: any) {
      console.error("Error deleting template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
    }
  }, []);

  const addExerciseToTemplate = useCallback(async (templateId: string, exercise: TemplateExercise) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { data, error } = await supabase
        .from('template_exercises')
        .insert({ ...exercise, workout_template_id: templateId })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Optionally update the current template in state
      setState(prevState =>
      {
        if (prevState.current && prevState.current.id === templateId) {
          return {
            ...prevState,
            current: {
              ...prevState.current,
              exercises: [...prevState.current.exercises, data]
            },
            status: 'idle'
          };
        }
        return {...prevState, status: 'idle'};
      });

      return data as TemplateExercise;
    } catch (error: any) {
      console.error("Error adding exercise to template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
      return null;
    }
  }, []);

  const updateExerciseInTemplate = useCallback(async (exerciseId: string, updates: Partial<TemplateExercise>) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { data, error } = await supabase
        .from('template_exercises')
        .update(updates)
        .eq('id', exerciseId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setState(prevState => {
        if (prevState.current) {
          return {
            ...prevState,
            current: {
              ...prevState.current,
              exercises: prevState.current.exercises.map(exercise =>
                exercise.id === exerciseId ? { ...exercise, ...data } : exercise
              )
            },
            status: 'idle'
          };
        }
        return {...prevState, status: 'idle'};
      });

      return data as TemplateExercise;
    } catch (error: any) {
      console.error("Error updating exercise in template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
      return null;
    }
  }, []);

  const deleteExerciseFromTemplate = useCallback(async (exerciseId: string) => {
    setState(prevState => ({ ...prevState, status: 'loading' }));
    try {
      const { error } = await supabase
        .from('template_exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) {
        throw error;
      }

      setState(prevState => {
        if (prevState.current) {
          return {
            ...prevState,
            current: {
              ...prevState.current,
              exercises: prevState.current.exercises.filter(exercise => exercise.id !== exerciseId)
            },
            status: 'idle'
          };
        }
        return {...prevState, status: 'idle'};
      });
    } catch (error: any) {
      console.error("Error deleting exercise from template:", error);
      setState(prevState => ({ ...prevState, status: 'error' }));
    }
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
    addExerciseToTemplate,
    updateExerciseInTemplate,
    deleteExerciseFromTemplate
  };
};
