
import { useState, useEffect } from 'react';
import { Exercise } from '@/types/exercise';

export const useFavoriteExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        // This would normally fetch from an API or database
        // For now, returning an empty array
        setExercises([]);
      } catch (err) {
        console.error('Error fetching favorite exercises:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return { exercises, isLoading, error };
};
