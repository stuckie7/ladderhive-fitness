
import { useState, useEffect } from 'react';
import { useExercises } from './useExercises';
import { Exercise } from '@/types/exercise';

// This adapter hook provides compatibility for ExerciseLibrarySimple
export const useExercisesFull = () => {
  const { searchExercises, isLoading } = useExercises();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Initial load with empty search to get featured exercises
  useEffect(() => {
    const fetchInitialExercises = async () => {
      try {
        const results = await searchExercises('a'); // Search for 'a' to get some initial results
        setExercises(results || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load exercises'));
      }
    };
    
    fetchInitialExercises();
  }, [searchExercises]);

  return {
    exercises,
    loading: isLoading,
    error,
    page,
    setPage,
    itemsPerPage,
    searchExercises
  };
};
