
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";

interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: string;
  rest_time?: number;
  order_index: number; // Changed from 'order' to 'order_index' to match DB schema
  exercise?: Exercise;
}

// Define the shape of the data coming from Supabase
interface SupabaseExercise {
  id: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export const useWorkoutExercises = (workoutId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const { toast } = useToast();

  // Helper function to map Supabase exercise data to our Exercise type
  const mapSupabaseExerciseToExercise = (supabaseExercise: SupabaseExercise): Exercise => {
    return {
      id: supabaseExercise.id,
      name: supabaseExercise.name,
      bodyPart: supabaseExercise.muscle_group || "",
      target: supabaseExercise.muscle_group || "", // Default target to muscle_group if available
      equipment: supabaseExercise.equipment || "",
      muscle_group: supabaseExercise.muscle_group,
      description: supabaseExercise.description,
      difficulty: supabaseExercise.difficulty as any,
      image_url: supabaseExercise.image_url,
      video_url: supabaseExercise.video_url
    };
  };

  const fetchWorkoutExercises = async (id: string) => {
    if (!id) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our WorkoutExercise type
      const mappedExercises: WorkoutExercise[] = (data || []).map(item => ({
        id: item.id,
        workout_id: item.workout_id,
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        rest_time: item.rest_time,
        order_index: item.order_index,
        exercise: item.exercise ? mapSupabaseExerciseToExercise(item.exercise as SupabaseExercise) : undefined
      }));
      
      setExercises(mappedExercises);
      return mappedExercises;
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workout exercises",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addExerciseToWorkout = async (workoutId: string, exercise: Exercise, details: Partial<WorkoutExercise> = {}) => {
    if (!workoutId) return null;
    
    setIsLoading(true);
    try {
      // Get the current highest order
      const currentExercises = await fetchWorkoutExercises(workoutId);
      const nextOrder = currentExercises.length > 0 
        ? Math.max(...currentExercises.map(e => e.order_index)) + 1 
        : 0;
      
      // First, check if the exercise exists in the exercises table
      const { data: existingExercise, error: checkError } = await supabase
        .from('exercises')
        .select('id')
        .eq('id', exercise.id)
        .single();
      
      let exerciseId: string;
      
      if (checkError || !existingExercise) {
        // Exercise doesn't exist yet, add it
        const { data: newExercise, error: insertError } = await supabase
          .from('exercises')
          .insert({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description || '',
            muscle_group: exercise.muscle_group || exercise.bodyPart,
            equipment: exercise.equipment,
            difficulty: exercise.difficulty || 'Intermediate',
            image_url: exercise.image_url || exercise.gifUrl
          })
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        exerciseId = newExercise.id;
      } else {
        exerciseId = existingExercise.id;
      }
      
      // Now add the exercise to the workout
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: details.sets || 3,
          reps: details.reps || 10,
          weight: details.weight || null,
          rest_time: details.rest_time || 60,
          order_index: nextOrder // Changed from 'order' to 'order_index'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh exercises
      await fetchWorkoutExercises(workoutId);
      
      return data;
    } catch (error: any) {
      console.error("Error adding exercise to workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise to workout",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeExerciseFromWorkout = async (exerciseId: string) => {
    if (!workoutId) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      // Update local state
      setExercises(exercises.filter(e => e.id !== exerciseId));
      
      toast({
        title: "Exercise removed",
        description: "The exercise has been removed from your workout."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing exercise from workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove exercise from workout",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercises,
    isLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  };
};
