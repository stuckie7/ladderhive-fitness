
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutTemplate, ExerciseTemplate } from './template-types';

export interface UseTemplateLoadingProps {
  setCurrentTemplate: (template: WorkoutTemplate | null) => void;
}

export const useTemplateLoading = ({ setCurrentTemplate }: UseTemplateLoadingProps) => {
  // Load a template from a WOD (Workout of the Day)
  const loadTemplateFromWod = useCallback(async (wodId: string) => {
    try {
      // Fetch the WOD details
      const { data: wod, error: wodError } = await supabase
        .from('wods')
        .select('*')
        .eq('id', wodId)
        .single();
      
      if (wodError) throw wodError;
      if (!wod) throw new Error("WOD not found");
      
      // Create a new template based on the WOD
      const template: WorkoutTemplate = {
        id: `wod-${wodId}`,
        title: wod.name,
        name: wod.name,
        description: wod.description || '',
        category: wod.category || 'CrossFit',
        difficulty: wod.difficulty || 'Intermediate',
        exercises: [],
      };
      
      setCurrentTemplate(template);
      return template;
    } catch (error) {
      console.error("Error loading template from WOD:", error);
      return null;
    }
  }, [setCurrentTemplate]);

  // Load template from prepared workout
  const loadTemplateFromPreparedWorkout = useCallback(async (workoutId: string) => {
    try {
      // Fetch the prepared workout details
      const { data: workout, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (workoutError) throw workoutError;
      if (!workout) throw new Error("Prepared workout not found");
      
      // Fetch the workout exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercises_full(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');
        
      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError.message);
        throw new Error("Failed to load workout exercises");
      }
      
      // Create a new template based on the prepared workout
      const mappedExercises: ExerciseTemplate[] = exercises.map(ex => ({
        id: ex.id,
        name: ex.exercises_full?.name || 'Unknown Exercise',
        exerciseId: ex.exercise_id?.toString() || '',
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        order_index: ex.order_index,
        notes: ex.notes || ''
      }));
      
      const template: WorkoutTemplate = {
        id: `prepared-${workoutId}`,
        title: workout.title,
        name: workout.title,
        description: workout.description || '',
        category: workout.category || 'General',
        difficulty: workout.difficulty || 'Intermediate',
        exercises: mappedExercises,
      };
      
      setCurrentTemplate(template);
      return template;
    } catch (error) {
      console.error("Error loading template from prepared workout:", error);
      return null;
    }
  }, [setCurrentTemplate]);

  return {
    loadTemplateFromWod,
    loadTemplateFromPreparedWorkout
  };
};
