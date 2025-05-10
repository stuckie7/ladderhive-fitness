
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { WorkoutStateType } from "./use-workout-state";
import { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from "./types";

export const useTemplateManagement = (
  { 
    workout,
    setWorkout,
    exercises,
    templates,
    setTemplates,
    setIsLoadingTemplates,
    setIsSaving
  }: Pick<WorkoutStateType, 
    'workout' | 'setWorkout' | 
    'exercises' | 'templates' | 
    'setTemplates' | 'setIsLoadingTemplates' | 
    'setIsSaving'
  >
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Load available templates
  const loadTemplates = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingTemplates(true);
    try {
      // Query prepared_workouts for templates
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('id, title, description, category, difficulty, created_at')
        .eq('is_template', true)
        .order('created_at', { ascending: false }) as unknown as { 
          data: WorkoutTemplate[] | null; 
          error: any 
        };
      
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load workout templates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [user, toast, setTemplates, setIsLoadingTemplates]);

  // Save workout as template
  const saveAsTemplate = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save templates.",
        variant: "destructive"
      });
      return;
    }
    
    if (exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise to your template.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate estimated duration based on sets, reps and rest time
      const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
      const avgRestSeconds = exercises.length > 0
        ? exercises.reduce((acc, ex) => acc + ex.rest_seconds, 0) / exercises.length
        : 60;
      const estimatedDuration = Math.ceil((totalSets * 45 + (totalSets - exercises.length) * avgRestSeconds) / 60);
      
      // Create a copy of the current workout as a template
      const workoutCopy = {
        title: `${workout.title || 'Workout'} (Template)`,
        description: workout.description,
        difficulty: workout.difficulty,
        category: workout.category,
        is_template: true,
        goal: workout.category, // Using category as goal for now
        duration_minutes: estimatedDuration || 30, // Adding missing duration_minutes
      };
      
      const { data: templateData, error: templateError } = await supabase
        .from('prepared_workouts')
        .insert(workoutCopy)
        .select();
      
      if (templateError) throw templateError;
      const templateId = templateData?.[0]?.id;
      
      if (!templateId) throw new Error("Failed to create template");
      
      // Save the exercises to the template
      const exercisesToInsert = exercises.map((ex, index) => ({
        workout_id: templateId,
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
      
      // Refresh templates
      await loadTemplates();
      
      toast({
        title: "Template Saved",
        description: "Your workout template has been saved successfully.",
      });
      
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save workout template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [workout, exercises, user, toast, loadTemplates, setIsSaving]);

  // Delete a template
  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!user) return;
    
    try {
      // First delete the template exercises
      const { error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .delete()
        .eq('workout_id', templateId);
      
      if (exerciseError) throw exerciseError;
      
      // Then delete the template itself
      const { error: templateError } = await supabase
        .from('prepared_workouts')
        .delete()
        .eq('id', templateId);
      
      if (templateError) throw templateError;
      
      // Refresh templates
      await loadTemplates();
      
      toast({
        title: "Template Deleted",
        description: "Your workout template has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout template. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast, loadTemplates]);

  return {
    loadTemplates,
    saveAsTemplate,
    deleteTemplate
  };
};
