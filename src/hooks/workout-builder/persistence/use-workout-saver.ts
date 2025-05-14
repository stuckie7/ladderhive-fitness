
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { WorkoutStateType } from "../use-workout-state";
import { WorkoutDetail, WorkoutExerciseDetail } from "../types";

export const useWorkoutSaver = (
  { 
    workout, 
    exercises,
    setIsSaving
  }: Pick<WorkoutStateType, 
    'workout' | 'exercises' | 'setIsSaving'
  >
) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
            goal: workout.goal || workout.category, // Using category as goal for now
            duration_minutes: estimatedDuration || 30,
            is_template: workout.is_template // Add this missing field
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
            goal: workout.goal || workout.category, // Using category as goal for now
            duration_minutes: estimatedDuration || 30,
            is_template: workout.is_template, // Add this missing field
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
      
      // Return updated workout with ID for navigation
      return {
        ...workout,
        id: workoutId,
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
    saveWorkout
  };
};
