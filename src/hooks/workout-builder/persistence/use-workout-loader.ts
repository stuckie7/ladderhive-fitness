
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutDetail, WorkoutExerciseDetail } from "../types";
import { SetStateAction } from "react";

export const useWorkoutLoader = (
  {
    setWorkout,
    setExercises,
    setIsLoading
  }: {
    setWorkout: (workout: SetStateAction<WorkoutDetail>) => void;
    setExercises: (exercises: SetStateAction<WorkoutExerciseDetail[]>) => void;
    setIsLoading: (isLoading: boolean) => void;
  }
) => {
  const { toast } = useToast();

  // Load existing workout
  const loadWorkout = useCallback(async (id: string): Promise<void> => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      // Fetch the workout data
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (workoutError) throw workoutError;
      
      if (!workoutData) throw new Error("Workout not found");
      
      // Set the workout data
      setWorkout({
        id: workoutData.id,
        title: workoutData.title,
        description: workoutData.description,
        difficulty: workoutData.difficulty,
        category: workoutData.category,
        goal: workoutData.goal,
        duration_minutes: workoutData.duration_minutes,
        is_template: !!workoutData.is_template
      });
      
      // Fetch the workout exercises
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .select('*, exercise:exercises_full(*)')
        .eq('workout_id', id)
        .order('order_index', { ascending: true });
        
      if (exerciseError) throw exerciseError;
      
      // Map the exercises
      if (exerciseData && exerciseData.length > 0) {
        const mappedExercises: WorkoutExerciseDetail[] = exerciseData.map(ex => ({
          id: `${ex.id}`,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          order_index: ex.order_index,
          name: ex.exercise?.name || `Exercise ${ex.exercise_id}`,
          exercise: ex.exercise
        }));
        
        setExercises(mappedExercises);
      } else {
        setExercises([]);
      }
      
    } catch (error) {
      console.error("Error loading workout:", error);
      toast({
        title: "Error",
        description: "Failed to load workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setWorkout, setExercises, setIsLoading, toast]);

  // Load from template
  const loadTemplate = useCallback(async (templateId: string): Promise<void> => {
    if (!templateId) return;
    
    setIsLoading(true);
    
    try {
      // Fetch the template data - assuming templates are also in prepared_workouts
      const { data: templateData, error: templateError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', templateId)
        .single();
        
      if (templateError) throw templateError;
      
      if (!templateData) throw new Error("Template not found");
      
      // Create a new workout based on the template
      setWorkout({
        title: `Copy of ${templateData.title}`,
        description: templateData.description,
        difficulty: templateData.difficulty,
        category: templateData.category,
        goal: templateData.goal,
        duration_minutes: templateData.duration_minutes,
        is_template: false // This is a new workout, not a template
      });
      
      // Fetch the template exercises
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .select('*, exercise:exercises_full(*)')
        .eq('workout_id', templateId)
        .order('order_index', { ascending: true });
        
      if (exerciseError) throw exerciseError;
      
      // Map the exercises
      if (exerciseData && exerciseData.length > 0) {
        const mappedExercises: WorkoutExerciseDetail[] = exerciseData.map(ex => ({
          id: `temp-${Math.random().toString(36).substring(2, 11)}`, // Generate a temporary ID
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          order_index: ex.order_index,
          name: ex.exercise?.name || `Exercise ${ex.exercise_id}`,
          exercise: ex.exercise
        }));
        
        setExercises(mappedExercises);
      } else {
        setExercises([]);
      }
      
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: "Failed to load template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setWorkout, setExercises, setIsLoading, toast]);

  // Return functions
  return {
    loadWorkout,
    loadTemplate
  };
};
