
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutTemplate } from './template-types';
import { WorkoutDetail, WorkoutExerciseDetail } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface UseTemplateLoadingProps {
  setCurrentTemplate?: React.Dispatch<React.SetStateAction<WorkoutTemplate | null>>;
}

// Export for use in WorkoutBuilder
export const useTemplateLoading = (props?: UseTemplateLoadingProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loadTemplateFromPreparedWorkout = async (templateId: string): Promise<WorkoutDetail | null> => {
    try {
      setIsLoading(true);
      
      console.log("Loading prepared workout template:", templateId);
      
      // Fetch the workout template
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (workoutError) {
        console.error("Error loading prepared workout:", workoutError);
        toast({
          title: "Error",
          description: "Failed to load workout template",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Loaded prepared workout:", workoutData);
      
      // Fetch exercises for this template
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercises_full(*)
        `)
        .eq('workout_id', templateId)
        .order('order_index');
      
      if (exercisesError) {
        console.error("Error loading prepared workout exercises:", exercisesError);
        let errorMessage = "Failed to load workout exercises";
        
        // Safe access to possible error properties
        if (typeof exercisesError === 'object' && exercisesError !== null) {
          errorMessage = (exercisesError as any).message || errorMessage;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Loaded prepared workout exercises:", exercisesData);
      
      // Map exercises to the format expected by WorkoutDetail
      const mappedExercises: WorkoutExerciseDetail[] = exercisesData.map((exercise: any) => {
        return {
          id: exercise.id,
          exercise_id: exercise.exercise_id || exercise.exercise?.id,
          name: exercise.exercise?.name || "Unknown Exercise",
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || "",
          rest_seconds: exercise.rest_seconds || 60,
          notes: exercise.notes || "",
          order_index: exercise.order_index,
          exercise: exercise.exercise || {
            id: exercise.exercise_id,
            name: "Unknown Exercise",
            description: ""
          }
        };
      });
      
      // Create the workout detail object
      const workoutDetail: WorkoutDetail = {
        id: workoutData.id,
        title: workoutData.title,
        description: workoutData.description || "",
        difficulty: workoutData.difficulty || "intermediate",
        duration: workoutData.duration_minutes || 45,
        exercises: mappedExercises
      };
      
      return workoutDetail;
    } catch (error) {
      console.error("Error in loadTemplateFromPreparedWorkout:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred loading the template",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a placeholder loadTemplateFromWod function to satisfy the interface
  const loadTemplateFromWod = async (wodId: string): Promise<WorkoutDetail | null> => {
    try {
      setIsLoading(true);
      toast({
        title: "Info",
        description: "Loading template from WOD is not yet implemented"
      });
      return null;
    } catch (error) {
      console.error("Error in loadTemplateFromWod:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async (): Promise<WorkoutTemplate[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('is_template', true);

      if (error) {
        console.error("Error loading templates:", error);
        toast({
          title: "Error",
          description: "Failed to load workout templates",
          variant: "destructive"
        });
        return [];
      }

      // Map the database results to our WorkoutTemplate type
      const mappedTemplates: WorkoutTemplate[] = data?.map(template => ({
        id: template.id,
        name: template.title, // Use title as name
        title: template.title,
        description: template.description,
        category: template.category || "General",
        difficulty: template.difficulty || "intermediate",
        created_at: template.created_at,
        exercises: [] // Initialize exercises as an empty array
      })) || [];

      return mappedTemplates;
    } catch (error) {
      console.error("Error in loadTemplates:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred loading the templates",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = async (templateId: string): Promise<WorkoutDetail | null> => {
    setIsLoading(true);
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', templateId)
        .single();

      if (workoutError) {
        console.error("Error loading prepared workout:", workoutError);
        toast({
          title: "Error",
          description: "Failed to load workout template",
          variant: "destructive"
        });
        return null;
      }

      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercises_full(*)
        `)
        .eq('workout_id', templateId)
        .order('order_index');

      if (exercisesError) {
        console.error("Error loading prepared workout exercises:", exercisesError);
        toast({
          title: "Error",
          description: "Failed to load workout exercises",
          variant: "destructive"
        });
        return null;
      }

      // Map exercises to the format expected by WorkoutDetail
      const mappedExercises: WorkoutExerciseDetail[] = exercisesData.map((exercise: any) => {
        return {
          id: exercise.id,
          exercise_id: exercise.exercise_id || exercise.exercise?.id,
          name: exercise.exercise?.name || "Unknown Exercise",
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || "",
          rest_seconds: exercise.rest_seconds || 60,
          notes: exercise.notes || "",
          order_index: exercise.order_index,
          exercise: exercise.exercise || {
            id: exercise.exercise_id,
            name: "Unknown Exercise",
            description: ""
          }
        };
      });

      // Create the workout detail object
      const workoutDetail: WorkoutDetail = {
        id: workoutData.id,
        title: workoutData.title,
        description: workoutData.description || "",
        difficulty: workoutData.difficulty || "intermediate",
        duration: workoutData.duration_minutes || 45,
        exercises: mappedExercises
      };

      return workoutDetail;
    } catch (error) {
      console.error("Error in loadTemplate:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred loading the template",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loadTemplate,
    loadTemplates,
    loadTemplateFromPreparedWorkout,
    loadTemplateFromWod
  };
};
