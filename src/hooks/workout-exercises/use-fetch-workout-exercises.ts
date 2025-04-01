
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutExercise, mapSupabaseExerciseToExercise } from "./utils";

export const useFetchWorkoutExercises = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const { toast } = useToast();

  const fetchWorkoutExercises = async (id: string) => {
    if (!id) return [];
    
    setIsLoading(true);
    try {
      console.log("Fetching exercises for workout ID:", id);
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
        exercise: item.exercise ? mapSupabaseExerciseToExercise(item.exercise) : undefined
      }));
      
      console.log("Fetched exercises:", mappedExercises.length);
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

  return {
    exercises,
    isLoading,
    fetchWorkoutExercises,
    setExercises,
    setIsLoading
  };
};
