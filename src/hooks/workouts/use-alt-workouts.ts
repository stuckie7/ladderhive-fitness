
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toStringId } from '@/utils/id-conversion';

interface Exercise {
  id: string;
  name: string;
  video_url?: string;
  thumbnail_url?: string;
}

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
        
        // Get all prepared workouts
        const { data, error } = await supabase
          .from('prepared_workouts')
          .select(`
            id, title, description, difficulty, duration_minutes, category, thumbnail_url
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // For each workout, fetch the associated exercises
        const workoutsWithExercises: AltWorkout[] = await Promise.all(
          (data || []).map(async (workout) => {
            const { data: exercisesData, error: exercisesError } = await supabase
              .from('prepared_workout_exercises')
              .select(`
                id, workout_id, exercise_id, sets, reps, rest_seconds, order_index, notes,
                exercise:exercises_full(id, name, short_youtube_demo, youtube_thumbnail_url)
              `)
              .eq('workout_id', workout.id)
              .order('order_index');
              
            if (exercisesError) {
              console.error('Error fetching exercises for workout:', exercisesError);
              return {
                ...workout,
                exercises: []
              } as AltWorkout;
            }
            
            // Convert exercise_id from number to string in each exercise
            const formattedExercises: WorkoutExercise[] = (exercisesData || []).map(ex => ({
              ...ex,
              exercise_id: toStringId(ex.exercise_id),
              exercise: ex.exercise ? {
                id: toStringId(ex.exercise.id),
                name: ex.exercise.name || 'Unknown Exercise',
                video_url: ex.exercise.short_youtube_demo || undefined,
                thumbnail_url: ex.exercise.youtube_thumbnail_url || undefined
              } : {
                id: toStringId(ex.exercise_id),
                name: 'Unknown Exercise'
              }
            }));
            
            return {
              ...workout,
              exercises: formattedExercises
            } as AltWorkout;
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
