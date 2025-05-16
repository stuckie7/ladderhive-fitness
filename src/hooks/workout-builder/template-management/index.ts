
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutDetail } from "../types";
import { WorkoutTemplate, SimplifiedWorkoutTemplate } from "./template-types";
import { useLoadTemplate } from "./use-template-loading";

export const useTemplateManagement = () => {
  const [templates, setTemplates] = useState<SimplifiedWorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<WorkoutTemplate | null>(null);
  const { toast } = useToast();
  
  // Initialize template loading functionality with our setter
  const { 
    loadTemplateFromPreparedWorkout, 
    loadTemplateFromWod 
  } = useLoadTemplate({
    setCurrentTemplate: (template: WorkoutTemplate | null) => setCurrentTemplate(template)
  });

  // Load all templates (prepared workouts marked as templates)
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("prepared_workouts")
        .select("*")
        .eq("is_template", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTemplates(data?.map(template => ({
        id: template.id,
        title: template.title,
        category: template.category,
        difficulty: template.difficulty,
        description: template.description,
        created_at: template.created_at
      })) || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save current workout as a template
  const saveAsTemplate = useCallback(async (workout: WorkoutDetail) => {
    if (!workout.title) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your template",
        variant: "destructive"
      });
      return;
    }

    // Update workout to mark as template
    const workoutWithTemplate = {
      ...workout,
      is_template: true
    };

    try {
      let templateId = workout.id;
      let isNew = !templateId;

      if (isNew) {
        // Create new template
        const { data, error } = await supabase
          .from('prepared_workouts')
          .insert({
            title: workoutWithTemplate.title,
            description: workoutWithTemplate.description || '',
            difficulty: workoutWithTemplate.difficulty,
            category: workoutWithTemplate.category || 'General',
            goal: workoutWithTemplate.category || 'General',
            duration_minutes: workoutWithTemplate.duration_minutes || 30,
            is_template: true
          })
          .select()
          .single();
          
        if (error) throw error;
        templateId = data.id;
        
        // Insert exercises
        if (workout.exercises?.length > 0) {
          const exercisesToInsert = workout.exercises.map((ex, index) => ({
            workout_id: templateId,
            exercise_id: typeof ex.exercise_id === 'string' ? parseInt(ex.exercise_id as string, 10) : ex.exercise_id as number,
            sets: ex.sets,
            reps: String(ex.reps),
            rest_seconds: ex.rest_seconds || 60,
            notes: ex.notes || null,
            order_index: index
          }));
          
          const { error: exerciseError } = await supabase
            .from('prepared_workout_exercises')
            .insert(exercisesToInsert);
            
          if (exerciseError) throw exerciseError;
        }
      } else {
        // Update existing template
        const { error } = await supabase
          .from('prepared_workouts')
          .update({
            is_template: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
          
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Workout saved as template"
      });
      
      // Refresh templates list
      loadTemplates();
      
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  }, [toast, loadTemplates]);

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      // Delete prepared_workout_exercises first
      const { error: exerciseError } = await supabase
        .from('prepared_workout_exercises')
        .delete()
        .eq('workout_id', templateId);
      
      if (exerciseError) throw exerciseError;
      
      // Then delete the template
      const { error } = await supabase
        .from('prepared_workouts')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    templates,
    isLoading,
    loadTemplates,
    saveAsTemplate,
    deleteTemplate,
    loadTemplateFromPreparedWorkout,
    loadTemplateFromWod,
    currentTemplate
  };
};

// Export from this file to maintain backward compatibility
export { useLoadTemplate } from "./use-template-loading";
