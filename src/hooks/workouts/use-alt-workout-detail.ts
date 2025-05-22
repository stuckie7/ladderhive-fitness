
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

export const useAltWorkoutDetail = (id?: string) => {
  const [workout, setWorkout] = useState<AltWorkout | null>(null);
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
        
        // Fetch the workout details
        const { data: workoutData, error: workoutError } = await supabase
          .from('prepared_workouts')
          .select(`
            id, title, description, difficulty, duration_minutes, category, thumbnail_url
          `)
          .eq('id', id)
          .single();
        
        if (workoutError) throw workoutError;
        
        // Fetch the associated exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('prepared_workout_exercises')
          .select(`
            id, workout_id, exercise_id, sets, reps, rest_seconds, order_index, notes,
            exercise:exercises_full(id, name, short_youtube_demo, youtube_thumbnail_url)
          `)
          .eq('workout_id', id)
          .order('order_index');
          
        if (exercisesError) throw exercisesError;
        
        // Convert exercise_id to string in each exercise with proper type casting
        const formattedExercises: WorkoutExercise[] = (exercisesData || []).map(ex => {
          // Handle potential missing or empty exercise data
          const exerciseData = ex.exercise || {};
          
          // Type guard for proper object access
          if (typeof exerciseData === 'object' && exerciseData !== null) {
            const exerciseId = 'id' in exerciseData ? exerciseData.id : ex.exercise_id;
            const stringId = typeof exerciseId === 'number' ? toStringId(exerciseId) : String(exerciseId);
            
            // Create properly typed exercise object
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
                id: stringId,
                name: 'name' in exerciseData ? String(exerciseData.name || 'Unknown Exercise') : 'Unknown Exercise',
                video_url: 'short_youtube_demo' in exerciseData ? 
                  String(exerciseData.short_youtube_demo || '') : undefined,
                thumbnail_url: 'youtube_thumbnail_url' in exerciseData ? 
                  String(exerciseData.youtube_thumbnail_url || '') : undefined
              }
            };
          } else {
            // Fallback for when exercise data is not an object
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
                id: String(ex.exercise_id),
                name: 'Unknown Exercise'
              }
            };
          }
        });
        
        // Set workout with proper TypeScript typing
        setWorkout({
          ...workoutData,
          exercises: formattedExercises
        });
        
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
