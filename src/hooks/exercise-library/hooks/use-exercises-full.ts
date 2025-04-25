
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ExerciseFull } from '@/types/exercise';
import { 
  fetchExercisesFull,
  searchExercisesFull,
  getExerciseFullById,
  getMuscleGroups,
  getEquipmentTypes
} from '../services';  // Updated to use the index.ts export

export const useExercisesFull = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApiError = (error: any, errorMessage: string) => {
    console.error(errorMessage, error);
    if (error.message !== "Failed to fetch") {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleFetchExercisesFull = async (limit = 50, offset = 0): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
      return await fetchExercisesFull(limit, offset);
    } catch (error) {
      handleApiError(error, 'Failed to fetch exercises data');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchExercisesFull = async (searchTerm: string, limit = 20): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
      return await searchExercisesFull(searchTerm, limit);
    } catch (error) {
      handleApiError(error, 'Failed to search exercises');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
    setIsLoading(true);
    try {
      return await getExerciseFullById(id);
    } catch (error) {
      handleApiError(error, 'Failed to fetch exercise details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchExercisesFull: handleFetchExercisesFull,
    searchExercisesFull: handleSearchExercisesFull,
    getExerciseFullById: handleGetExerciseFullById,
    getMuscleGroups,
    getEquipmentTypes,
  };
};
