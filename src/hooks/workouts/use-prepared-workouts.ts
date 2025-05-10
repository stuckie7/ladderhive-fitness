
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PreparedWorkout, PreparedWorkoutExercise } from '@/types/workout';
import { Exercise, ExerciseFull } from "@/types/exercise";
import { mapExerciseFullToExercise } from "@/hooks/exercise-library/mappers";

export const usePreparedWorkouts = (currentWorkoutId?: string) => {
  const [preparedWorkouts, setPreparedWorkouts] = useState<PreparedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Record<string, PreparedWorkoutExercise[]>>({});
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch all prepared workouts
  const fetchPreparedWorkouts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('prepared_workouts')
        .select('*');
      
      // Filter out current workout if we're in a workout detail page
      if (currentWorkoutId) {
        query = query.neq('id', currentWorkoutId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map the database results to our PreparedWorkout type
      const mappedWorkouts: PreparedWorkout[] = data?.map(workout => ({
        ...workout,
        // Add 'exercises' field to match Workout interface
        exercises: 5, // Default assumption that each workout has around 5 exercises
      })) || [];
      
      setPreparedWorkouts(mappedWorkouts);
      
      // If we have workouts, expand the first one by default
      if (mappedWorkouts.length > 0) {
        setExpandedWorkout(mappedWorkouts[0].id);
        fetchWorkoutExercises(mappedWorkouts[0].id);
      }
      
      return mappedWorkouts;
    } catch (error: any) {
      console.error("Error fetching prepared workouts:", error);
      toast({
        title: "Error",
        description: "Failed to load prepared workouts",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkoutId, toast]);

  // Fetch exercises for a specific workout
  const fetchWorkoutExercises = async (workoutId: string) => {
    if (workoutExercises[workoutId]?.length > 0) return; // Already loaded
    
    setLoadingExercises(prev => ({ ...prev, [workoutId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercises_full(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');
        
      if (error) throw error;
      
      // Map the response to include the exercise data
      const exercises = data.map(item => {
        // Safely type check the exercise property before mapping
        let exerciseData: Exercise | undefined = undefined;
        
        // Check if exercise is a valid object and not an error
        if (item.exercise && 
            typeof item.exercise === 'object' && 
            item.exercise !== null && 
            !('error' in item.exercise)) {
          try {
            // Cast to ExerciseFull only after validation
            const exerciseFull = item.exercise as ExerciseFull;
            exerciseData = mapExerciseFullToExercise(exerciseFull);
          } catch (err) {
            console.error("Error mapping exercise data:", err);
          }
        }
        
        return {
          ...item,
          exercise: exerciseData
        };
      });
      
      setWorkoutExercises(prev => ({
        ...prev,
        [workoutId]: exercises
      }));
      
      return exercises;
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load workout exercises",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoadingExercises(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  // Toggle expanded state for a workout
  const toggleExpand = (workoutId: string) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
      fetchWorkoutExercises(workoutId);
    }
  };
  
  // Add an exercise from a prepared workout to user's current workout
  const addExerciseToWorkout = async (exercise: Exercise) => {
    return exercise;
  };

  // Load workouts on initial render
  useEffect(() => {
    fetchPreparedWorkouts();
  }, [fetchPreparedWorkouts]);

  return {
    preparedWorkouts,
    isLoading,
    expandedWorkout,
    workoutExercises,
    loadingExercises,
    toggleExpand,
    fetchWorkoutExercises,
    addExerciseToWorkout
  };
};
