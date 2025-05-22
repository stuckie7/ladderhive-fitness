
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
        
        // Fetch all workouts
        const { data: workoutData, error: workoutError } = await supabase
          .from('prepared_workouts')
          .select(`
            id, title, description, difficulty, duration_minutes, category, thumbnail_url
          `)
          .order('title');
        
        if (workoutError) throw workoutError;
        
        if (!workoutData || workoutData.length === 0) {
          setWorkouts([]);
          return;
        }
        
        // For each workout, fetch its exercises
        const workoutsWithExercises = await Promise.all(
          workoutData.map(async (workout) => {
            const { data: exerciseData, error: exerciseError } = await supabase
              .from('prepared_workout_exercises')
              .select(`
                id, workout_id, exercise_id, sets, reps, rest_seconds, order_index, notes,
                exercise:exercises_full(id, name, short_youtube_demo, youtube_thumbnail_url)
              `)
              .eq('workout_id', workout.id)
              .order('order_index');
              
            if (exerciseError) {
              console.error(`Error fetching exercises for workout ${workout.id}:`, exerciseError);
              return {
                ...workout,
                exercises: []
              };
            }
            
            // Format the exercises data
            const formattedExercises = (exerciseData || []).map(ex => {
              // Handle potential SelectQueryError by providing default values
              const exerciseData = ex.exercise || {};
              
              return {
                id: ex.id,
                workout_id: ex.workout_id,
                exercise_id: toStringId(ex.exercise_id),
                sets: ex.sets,
                reps: ex.reps,
                rest_seconds: ex.rest_seconds,
                order_index: ex.order_index,
                notes: ex.notes || '',
                exercise: {
                  id: toStringId(exerciseData.id || ex.exercise_id),
                  name: exerciseData.name || 'Unknown Exercise',
                  video_url: exerciseData.short_youtube_demo || undefined,
                  thumbnail_url: exerciseData.youtube_thumbnail_url || undefined
                }
              };
            });
            
            return {
              ...workout,
              exercises: formattedExercises
            };
          })
        );
        
        setWorkouts(workoutsWithExercises);
        
      } catch (err: any) {
        console.error('Error fetching workouts:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to load workouts: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [toast]);

  return { workouts, isLoading, error };
};
