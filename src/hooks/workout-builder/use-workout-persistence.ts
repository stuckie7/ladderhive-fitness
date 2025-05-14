
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { WorkoutStateType } from "./use-workout-state";
import { WorkoutDetail, WorkoutExerciseDetail } from "./types";
import { useNavigate } from "react-router-dom";

export const useWorkoutPersistence = (
  { 
    workout, 
    exercises,
    setIsSaving,
    setWorkout,
    setExercises,
    setIsLoading
  }: Pick<WorkoutStateType, 
    'workout' | 'exercises' | 'setIsSaving' | 
    'setWorkout' | 'setExercises' | 'setIsLoading'
  >
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Save workout
  const saveWorkout = useCallback(async (): Promise<WorkoutDetail | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save workouts.",
        variant: "destructive"
      });
      return null;
    }
    
    if (exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive"
      });
      return null;
    }
    
    setIsSaving(true);
    
    try {
      let workoutId = workout.id;
      let isNewWorkout = !workoutId;
      
      // Calculate estimated duration based on sets, reps and rest time
      const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
      const avgRestSeconds = exercises.length > 0
        ? exercises.reduce((acc, ex) => acc + (ex.rest_seconds || 60), 0) / exercises.length
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
        exercise_id: typeof ex.exercise_id === 'string' ? parseInt(ex.exercise_id as string, 10) : ex.exercise_id, // Ensure it's a number
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds || 60,
        notes: ex.notes || null,
        order_index: index
      }));
      
      const { error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .insert(exercisesToInsert);
      
      if (exerciseError) throw exerciseError;

      toast({
        title: "Success",
        description: `Workout ${isNewWorkout ? 'created' : 'updated'} successfully.`,
      });
      
      // Return updated workout with ID for navigation
      const updatedWorkout = {
        ...workout,
        id: workoutId as string,
        duration_minutes: estimatedDuration
      };
      
      // If it's a new workout, navigate to the workout list
      if (isNewWorkout) {
        setTimeout(() => navigate('/workouts'), 1000);
      }
      
      return updatedWorkout;
      
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
  }, [workout, exercises, user, toast, setIsSaving, navigate]);

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
        is_template: workoutData.is_template || false
      });
      
      // Fetch the workout exercises
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercise_id(*)
        `)
        .eq('workout_id', id)
        .order('order_index', { ascending: true });
        
      if (exerciseError) throw exerciseError;
      
      // Map the exercises
      if (exerciseData && exerciseData.length > 0) {
        const mappedExercises = exerciseData.map(ex => ({
          id: `${ex.id}`,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          order_index: ex.order_index,
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
        .select(`
          *,
          exercise:exercise_id(*)
        `)
        .eq('workout_id', templateId)
        .order('order_index', { ascending: true });
        
      if (exerciseError) throw exerciseError;
      
      // Map the exercises
      if (exerciseData && exerciseData.length > 0) {
        const mappedExercises = exerciseData.map(ex => ({
          id: `temp-${Math.random().toString(36).substring(2, 11)}`, // Generate a temporary ID
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          order_index: ex.order_index,
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

  return {
    saveWorkout,
    loadWorkout,
    loadTemplate
  };
};
