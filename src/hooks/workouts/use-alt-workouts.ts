
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Exercise } from '@/types/exercise';

interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: number | string;
  rest_seconds: number;
  order_index: number;
  notes?: string;
}

interface AltWorkout {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration_minutes: number;
  category?: string;
  thumbnail_url?: string;
  exercises: WorkoutExercise[];
}

export const useAltWorkouts = () => {
  const [workouts, setWorkouts] = useState<AltWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('prepared_workouts')
          .select(`
            id, title, description, difficulty, duration_minutes, category, thumbnail_url
          `)
          .eq('type', 'alt') // Filter for ALT workouts
          .order('created_at', { ascending: false });

        if (error) throw error;

        // For each workout, fetch the associated exercises
        const workoutsWithExercises = await Promise.all(
          (data || []).map(async (workout) => {
            const { data: exercisesData, error: exercisesError } = await supabase
              .from('prepared_workout_exercises')
              .select(`
                id, workout_id, exercise_id, sets, reps, rest_seconds, order_index, notes,
                exercise:exercise_id(id, name, video_url, thumbnail_url)
              `)
              .eq('workout_id', workout.id)
              .order('order_index');
              
            if (exercisesError) {
              console.error('Error fetching exercises for workout:', exercisesError);
              return {
                ...workout,
                exercises: []
              };
            }
            
            return {
              ...workout,
              exercises: exercisesData || []
            };
          })
        );

        setWorkouts(workoutsWithExercises);
      } catch (err: any) {
        console.error('Error fetching ALT workouts:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to load ALT workouts: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [toast]);

  return {
    workouts,
    isLoading,
    error,
  };
};
