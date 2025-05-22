
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useWorkoutDetailEnhanced = (id?: string) => {
  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchWorkout = async () => {
      try {
        setIsLoading(true);
        
        // Fetch basic workout data
        const { data: workoutData, error: workoutError } = await supabase
          .from('prepared_workouts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (workoutError) throw workoutError;
        
        // Fetch exercises for this workout separately instead of using a join
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('prepared_workout_exercises')
          .select('*')
          .eq('workout_id', id)
          .order('order_index');
        
        if (exercisesError) throw exercisesError;
        
        // Get all exercise IDs to fetch their details
        const exerciseIds = exercisesData.map(ex => ex.exercise_id);
        
        // Fetch exercise details
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('exercises_full')
          .select('*')
          .in('id', exerciseIds);
          
        if (detailsError) throw detailsError;
        
        // Match exercise details with the workout exercises
        const exercisesWithDetails = exercisesData.map(ex => {
          const details = exerciseDetails?.find(detail => detail.id === ex.exercise_id) || {};
          return {
            ...ex,
            exercise: details
          };
        });
        
        // Combine everything into a complete workout object
        const completeWorkout = {
          ...workoutData,
          exercises: exercisesWithDetails
        };
        
        setWorkout(completeWorkout);
        
      } catch (err: any) {
        console.error('Error fetching workout detail:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to load workout: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [id, toast]);

  return { workout, isLoading, error };
};
