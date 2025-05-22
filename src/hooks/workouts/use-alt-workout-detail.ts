
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

// Define a type for the exercise details that might come from the database
interface ExerciseDetail {
  id: number;
  name: string;
  short_youtube_demo?: string;
  youtube_thumbnail_url?: string;
  [key: string]: any; // Allow for other properties we might not be explicitly using
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
        
        // First, get the exercises linked to this workout
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('prepared_workout_exercises')
          .select(`
            id, workout_id, exercise_id, sets, reps, rest_seconds, order_index, notes
          `)
          .eq('workout_id', id)
          .order('order_index');
          
        if (exercisesError) throw exercisesError;
        
        // Now get the exercise details separately
        let formattedExercises: WorkoutExercise[] = [];
        
        if (exercisesData && exercisesData.length > 0) {
          // Extract all exercise IDs
          const exerciseIds = exercisesData.map(ex => ex.exercise_id);
          
          // Fetch exercise details
          const { data: exerciseDetails, error: detailsError } = await supabase
            .from('exercises_full')
            .select('id, name, short_youtube_demo, youtube_thumbnail_url')
            .in('id', exerciseIds);
            
          if (detailsError) throw detailsError;
          
          // Map exercise details to workout exercises
          formattedExercises = exercisesData.map(ex => {
            // Find the matching exercise detail or use a default with just the name
            const exerciseDetail: ExerciseDetail = exerciseDetails?.find(detail => 
              detail.id === ex.exercise_id
            ) || { id: ex.exercise_id, name: 'Unknown Exercise' };
            
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
                id: toStringId(ex.exercise_id),
                name: exerciseDetail.name || 'Unknown Exercise',
                // Now TypeScript knows these properties might exist on the ExerciseDetail type
                video_url: exerciseDetail.short_youtube_demo,
                thumbnail_url: exerciseDetail.youtube_thumbnail_url
              }
            };
          });
        }
        
        // Set workout with properly mapped exercises
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
