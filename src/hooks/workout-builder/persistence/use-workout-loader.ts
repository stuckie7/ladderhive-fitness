
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { WorkoutStateType } from "../use-workout-state";
import { WorkoutExerciseDetail } from "../types";

export const useWorkoutLoader = (
  { 
    setWorkout,
    setExercises,
    setIsLoading
  }: Pick<WorkoutStateType, 
    'setWorkout' | 'setExercises' | 'setIsLoading'
  >
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Load workout data if editing an existing workout
  const loadWorkout = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (workoutError) throw workoutError;
      
      if (workoutData) {
        // Check if is_template field exists in database response
        const workoutWithTemplate = workoutData as unknown as (typeof workoutData & { is_template?: boolean });
        const isTemplate = workoutWithTemplate.is_template !== undefined ? Boolean(workoutWithTemplate.is_template) : false;
        
        setWorkout({
          id: workoutData.id,
          title: workoutData.title,
          description: workoutData.description || "",
          difficulty: workoutData.difficulty,
          category: workoutData.category,
          duration_minutes: workoutData.duration_minutes,
          created_at: workoutData.created_at,
          updated_at: workoutData.updated_at,
          is_template: isTemplate
        });
        
        // Fetch the workout exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('prepared_workout_exercises')
          .select(`
            id,
            exercise_id,
            sets,
            reps,
            rest_seconds,
            notes,
            order_index
          `)
          .eq('workout_id', id)
          .order('order_index');
        
        if (exercisesError) throw exercisesError;
        
        if (exercisesData && exercisesData.length > 0) {
          // Get all unique exercise IDs
          const exerciseIds = exercisesData.map(ex => ex.exercise_id);
          
          // Fetch exercise details for all exercises at once
          const { data: exerciseDetails, error: exerciseDetailsError } = await supabase
            .from('exercises_full')
            .select('*')
            .in('id', exerciseIds);
            
          if (exerciseDetailsError) throw exerciseDetailsError;
          
          // Map exercise details to workout exercises
          const workoutExercises = exercisesData.map(ex => {
            const exerciseDetail = exerciseDetails?.find(detail => detail.id === ex.exercise_id);
            return {
              ...ex,
              exercise: exerciseDetail
            } as WorkoutExerciseDetail;
          });
          
          setExercises(workoutExercises);
        }
      }
    } catch (error) {
      console.error("Error loading workout:", error);
      toast({
        title: "Error",
        description: "Failed to load workout details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, setWorkout, setExercises, setIsLoading]);

  // Load a template
  const loadTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      // Load the template workout
      await loadWorkout(templateId);
      
      // Update the title to remove "(Template)" if present
      setWorkout(prev => ({
        ...prev,
        id: undefined, // Create a new workout instead of updating the template
        title: prev.title?.replace(' (Template)', '') || 'New Workout',
        is_template: false
      }));
      
      toast({
        title: "Template Loaded",
        description: "The workout template has been loaded successfully.",
      });
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: "Failed to load workout template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadWorkout, toast, setWorkout, setIsLoading]);

  return {
    loadWorkout,
    loadTemplate
  };
};
