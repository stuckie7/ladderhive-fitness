
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';

export const useFavoriteExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavoriteExercises = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // This is a placeholder since we don't know the exact table structure
        // In a real application, you would fetch user's favorite exercises from a database
        const { data, error } = await supabase
          .from('exercises_full')
          .select('*')
          .limit(5);

        if (error) {
          throw new Error(error.message);
        }

        // Convert database exercises to Exercise type with safe property access
        const formattedExercises: Exercise[] = (data || []).map(ex => ({
          id: String(ex.id),
          name: ex.name || 'Unknown Exercise',
          muscle_group: ex.prime_mover_muscle || '',
          equipment: ex.primary_equipment || 'Bodyweight',
          difficulty: ex.difficulty || 'Beginner',
          description: ex.description || '', // Safely handle missing description
          instructions: Array.isArray(ex.instructions) ? ex.instructions : 
                       typeof ex.instructions === 'string' ? [ex.instructions] : 
                       [ex.name || 'No instructions available'], // Safely handle missing instructions
          video_url: ex.short_youtube_demo || '',
          image_url: ex.youtube_thumbnail_url || '',
          target_muscle_group: ex.prime_mover_muscle || ''
        }));

        setExercises(formattedExercises);
      } catch (err) {
        console.error('Error fetching favorite exercises:', err);
        setError(err instanceof Error ? err.message : 'Failed to load favorite exercises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteExercises();
  }, [user]);

  return { exercises, isLoading, error };
};
