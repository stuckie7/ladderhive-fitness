
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutDetail, WorkoutExerciseDetail, WorkoutTemplate } from "../types";

interface WorkoutLoaderProps {
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutDetail>>;
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExerciseDetail[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useWorkoutLoader = ({
  setWorkout,
  setExercises,
  setIsLoading
}: WorkoutLoaderProps) => {
  const { toast } = useToast();

  // Load workout
  const loadWorkout = useCallback(async (workoutId: string) => {
    if (!workoutId) return;
    
    setIsLoading(true);
    try {
      // Fetch workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (workoutError) throw workoutError;
      
      if (!workoutData) {
        throw new Error("Workout not found");
      }
      
      // Fetch workout exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercises_full(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });
      
      if (exercisesError) throw exercisesError;
      
      // Set workout data - safely check if is_template exists
      const hasIsTemplate = workoutData && typeof workoutData === 'object' && 'is_template' in workoutData;
      
      setWorkout({
        id: workoutData.id,
        title: workoutData.title || "Unnamed Workout",
        description: workoutData.description || "",
        difficulty: workoutData.difficulty || "Beginner",
        category: workoutData.category || "General",
        duration_minutes: workoutData.duration_minutes || 30,
        is_template: hasIsTemplate ? Boolean(workoutData.is_template) : false,
        exercises: []  // We'll set exercises separately
      });
      
      // Transform and set exercises data
      const mappedExercises: WorkoutExerciseDetail[] = (exercisesData || []).map(ex => {
        // Make sure ex.exercise exists and handle if it doesn't
        const exercise = ex.exercise || {};
        
        // Get name with safe property access - ensure it's a string
        const exerciseName = exercise && typeof exercise === 'object' && 'name' in exercise 
          ? String(exercise.name) 
          : "Unknown Exercise";
          
        return {
          id: ex.id || `temp-${Date.now()}-${Math.random()}`,
          exercise_id: ex.exercise_id,
          name: exerciseName, // Now guaranteed to be a string
          sets: ex.sets || 3,
          reps: ex.reps || "10", // Convert to string
          rest_seconds: ex.rest_seconds || 60,
          notes: ex.notes || "",
          order_index: ex.order_index,
          exercise: exercise,
          weight: "" // Default empty weight
        };
      });
      
      setExercises(mappedExercises);
      
      return {
        workout: workoutData,
        exercises: mappedExercises
      };
    } catch (error: any) {
      console.error("Error loading workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workout details.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setWorkout, setExercises, setIsLoading, toast]);
  
  // Load template into workout builder
  const loadTemplate = useCallback(async (template: WorkoutTemplate) => {
    try {
      if (!template || !template.id) {
        throw new Error("Invalid template");
      }
      
      setIsLoading(true);
      
      // Convert template to workout
      setWorkout({
        title: template.title || (template.name || "New Workout from Template"),
        description: template.description || "",
        difficulty: template.difficulty || "Beginner",
        category: template.category || "General",
        duration_minutes: 30, // Default duration
        exercises: [] // We'll set exercises separately
      });
      
      // Transform template exercises to workout exercises
      const mappedExercises: WorkoutExerciseDetail[] = (template.exercises || []).map((ex, index) => ({
        id: `temp-${Date.now()}-${index}`,
        exercise_id: ex.exerciseId,
        name: ex.name || "Unknown Exercise",
        sets: ex.sets || 3,
        reps: String(ex.reps || "10"), // Convert to string explicitly
        rest_seconds: ex.rest_seconds || 60,
        notes: ex.notes || "",
        order_index: index,
        exercise: {}, // Will be populated later if needed
        weight: "" // Default empty weight
      }));
      
      setExercises(mappedExercises);
      
      toast({
        title: "Template Loaded",
        description: `"${template.title || template.name || "Template"}" loaded successfully.`
      });
      
      return {
        workout: template,
        exercises: mappedExercises
      };
    } catch (error: any) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load template.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setWorkout, setExercises, setIsLoading, toast]);

  return {
    loadWorkout,
    loadTemplate
  };
};
