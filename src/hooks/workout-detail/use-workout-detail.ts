
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useFetchWorkoutExercises } from '../workout-exercises/use-fetch-workout-exercises';
import { useWorkoutActions } from './use-workout-actions';

export const useWorkoutDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);
  
  // Get workout exercises
  const { workoutExercises, isLoading: exercisesLoading, fetchExercises } = useFetchWorkoutExercises();
  // Alias exercises for backward compatibility
  const exercises = workoutExercises;
  
  // Get workout actions
  const workoutActions = useWorkoutActions();
  
  // Fetch workout details
  const fetchWorkoutDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      // First try user created workouts
      let { data, error } = await supabase
        .from('user_created_workouts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // If not found in user workouts, try prepared workouts
        const { data: preparedData, error: preparedError } = await supabase
          .from('prepared_workouts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (preparedError) {
          throw preparedError;
        }
        
        data = preparedData;
      }
      
      if (!data) {
        throw new Error('Workout not found');
      }
      
      setWorkout(data);
      
      // Also fetch exercises for this workout
      await fetchExercises(id);
    } catch (error: any) {
      console.error('Error fetching workout details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workout details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, fetchExercises, toast]);
  
  useEffect(() => {
    fetchWorkoutDetails();
  }, [fetchWorkoutDetails]);
  
  return {
    workout,
    loading: loading || exercisesLoading,
    exercises, // Use the alias
    workoutExercises, // Keep the original property for compatibility
    ...workoutActions
  };
};
