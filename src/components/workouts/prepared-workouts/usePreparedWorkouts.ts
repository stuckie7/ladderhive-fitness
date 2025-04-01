
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Workout } from "@/types/workout";
import { WorkoutExercise, mapSupabaseExerciseToExercise } from "@/hooks/workout-exercises/utils";

export const usePreparedWorkouts = (currentWorkoutId: string) => {
  const [preparedWorkouts, setPreparedWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Record<string, WorkoutExercise[]>>({});
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch prepared workouts from Supabase
  useEffect(() => {
    const fetchPreparedWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .neq('id', currentWorkoutId) // Exclude current workout
          .limit(5);
        
        if (error) throw error;
        
        setPreparedWorkouts(data);
        
        // Load exercises for all prepared workouts immediately
        if (data && data.length > 0) {
          // Immediately load exercises for the first workout to show something by default
          if (data[0]) {
            setExpandedWorkout(data[0].id);
            fetchWorkoutExercises(data[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching prepared workouts:", error);
        toast({
          title: "Error",
          description: "Failed to load prepared workouts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreparedWorkouts();
  }, [currentWorkoutId, toast]);

  // Fetch exercises for a specific workout when expanded
  const fetchWorkoutExercises = async (workoutId: string) => {
    if (workoutExercises[workoutId]?.length > 0) return; // Already loaded
    
    setLoadingExercises(prev => ({ ...prev, [workoutId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our WorkoutExercise type
      const mappedExercises: WorkoutExercise[] = data.map(item => ({
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
      
      // Update the workoutExercises state with the new data
      setWorkoutExercises((prev) => {
        const updatedState = { ...prev };
        updatedState[workoutId] = mappedExercises;
        return updatedState;
      });
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load workout exercises",
        variant: "destructive",
      });
    } finally {
      setLoadingExercises(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  const toggleExpand = (workoutId: string) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
      fetchWorkoutExercises(workoutId);
    }
  };

  return {
    preparedWorkouts,
    isLoading,
    expandedWorkout,
    workoutExercises,
    loadingExercises,
    toggleExpand,
  };
};
