
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { WorkoutStateType } from "./use-workout-state";
import { WorkoutExerciseDetail } from "./types";

export const useWorkoutPersistence = (
  { 
    workout, 
    setWorkout,
    exercises, 
    setExercises,
    setIsLoading,
    setIsSaving
  }: Pick<WorkoutStateType, 
    'workout' | 'setWorkout' | 
    'exercises' | 'setExercises' | 
    'setIsLoading' | 'setIsSaving'
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

  // Save workout
  const saveWorkout = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save workouts.",
        variant: "destructive"
      });
      return;
    }
    
    if (exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      let workoutId = workout.id;
      let isNewWorkout = !workoutId;
      
      // Calculate estimated duration based on sets, reps and rest time
      const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
      const avgRestSeconds = exercises.length > 0
        ? exercises.reduce((acc, ex) => acc + ex.rest_seconds, 0) / exercises.length
        : 60;
      const estimatedDuration = Math.ceil((totalSets * 45 + (totalSets - exercises.length) * avgRestSeconds) / 60);
      
      // Save or update workout info
      if (isNewWorkout) {
        const { data: workoutData, error: workoutError } = await supabase
          .from('prepared_workouts')
          .insert({
            title: workout.title,
            description: workout.description,
            difficulty: workout.difficulty,
            category: workout.category,
            goal: workout.category, // Using category as goal for now
            duration_minutes: estimatedDuration || 30,
            is_template: workout.is_template || false
          })
          .select();
        
        if (workoutError) throw workoutError;
        workoutId = workoutData?.[0]?.id;
      } else {
        const { error: workoutError } = await supabase
          .from('prepared_workouts')
          .update({
            title: workout.title,
            description: workout.description,
            difficulty: workout.difficulty,
            category: workout.category,
            goal: workout.category, // Using category as goal for now
            duration_minutes: estimatedDuration || 30,
            is_template: workout.is_template || false,
            updated_at: new Date().toISOString()
          })
          .eq('id', workoutId);
        
        if (workoutError) throw workoutError;
      }
      
      if (!workoutId) throw new Error("Failed to create workout");
      
      // If updating, delete existing exercise entries first
      if (!isNewWorkout) {
        const { error: deleteError } = await supabase
          .from('prepared_workout_exercises')
          .delete()
          .eq('workout_id', workoutId);
          
        if (deleteError) throw deleteError;
      }
      
      // Insert exercise entries
      const exercisesToInsert = exercises.map((ex, index) => ({
        workout_id: workoutId,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
        order_index: index
      }));
      
      const { error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .insert(exercisesToInsert);
      
      if (exerciseError) throw exerciseError;
      
      // Return updated workout with ID for navigation
      return {
        ...workout,
        id: workoutId
      };
      
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [workout, exercises, user, toast, setIsSaving]);

  return {
    loadWorkout,
    loadTemplate,
    saveWorkout
  };
};
