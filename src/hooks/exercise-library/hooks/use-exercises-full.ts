
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ExerciseFull } from '@/types/exercise';
import { 
  fetchExercisesFull,
  checkExercisesFullTableExists,
  searchExercisesFull,
  getExerciseFullById,
  getMuscleGroups,
  getEquipmentTypes
} from '../services';

export const useExercisesFull = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkTableExists = async (): Promise<boolean> => {
    try {
      const exists = await checkExercisesFullTableExists();
      setTableExists(exists);
      return exists;
    } catch (error) {
      console.error("Failed to check if table exists:", error);
      setTableExists(null);
      return false;
    }
  };

  const handleApiError = (error: any, errorMessage: string) => {
    console.error(errorMessage, error);
    
    // Format the error message based on the type of error
    let displayMessage = errorMessage;
    
    if (error && error.code) {
      switch (error.code) {
        case '42P01': // Undefined table
          displayMessage = "The exercises_full table doesn't exist in your database. Please create it first.";
          break;
        case '28000': // Invalid authorization
        case '28P01': // Invalid password
          displayMessage = "Authorization failed. Check your Supabase API key and URL.";
          break;
        case '3D000': // Invalid schema
          displayMessage = "Invalid schema specified. Check your database configuration.";
          break;
        default:
          if (error.message) {
            displayMessage = `${errorMessage}: ${error.message}`;
          }
      }
    }
    
    // Don't show toast for network errors as they're common during development
    if (error.message !== "Failed to fetch") {
      toast({
        title: 'Error',
        description: displayMessage,
        variant: 'destructive',
      });
    }
  };

  // Helper function for deduplication with video priority
const isValidYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  return (
    (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/')) &&
    !lowerUrl.includes('lovableproject.com') &&
    !lowerUrl.includes('/video demonstration')
  );
};

const deduplicateExercises = (exercises: ExerciseFull[]): ExerciseFull[] => {
  const uniqueMap = new Map<string, ExerciseFull>();

  exercises.forEach(item => {
    const name = item.name?.toLowerCase().trim() || '';
    if (!name) return;

    const existingItem = uniqueMap.get(name);

    const currentVideoUrl = item.short_youtube_demo || item.video_demonstration_url;
    const currentHasValidYouTube = isValidYouTubeUrl(currentVideoUrl);

    const existingVideoUrl = existingItem?.short_youtube_demo || existingItem?.video_demonstration_url;
    const existingHasValidYouTube = isValidYouTubeUrl(existingVideoUrl);

    // Add or replace logic
    if (!existingItem) {
      uniqueMap.set(name, item);
    } else if (!existingHasValidYouTube && currentHasValidYouTube) {
      uniqueMap.set(name, item); // prefer item with working YouTube link
    }
    // else: keep the existing one
  });

  return Array.from(uniqueMap.values());
};

  const handleFetchExercisesFull = async (limit = 50, offset = 0): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
      // Check if table exists first
      const exists = await checkTableExists();
      if (!exists) {
        toast({
          title: 'Missing Table',
          description: "The exercises_full table doesn't exist in your Supabase database. Please create it first.",
          variant: 'destructive',
        });
        return [];
      }
      
      const rawData = await fetchExercisesFull(limit, offset);
      
      // Use the helper function to deduplicate exercises
      const uniqueExercises = deduplicateExercises(rawData);

      return uniqueExercises;
    } catch (error) {
      handleApiError(error, 'Failed to fetch exercises data');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchExercisesFull = async (
    searchTerm: string, 
    filters = {}, 
    limit = 20, 
    offset = 0
  ): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
      // Check if table exists first
      const exists = await checkTableExists();
      if (!exists) {
        toast({
          title: 'Missing Table',
          description: "The exercises_full table doesn't exist in your Supabase database. Please create it first.",
          variant: 'destructive',
        });
        return [];
      }
      
      if (typeof searchTerm !== 'string') {
        searchTerm = '';
      }
      
      const results = await searchExercisesFull(searchTerm, limit);
      
      // Use the helper function to deduplicate exercises
      const uniqueExercises = deduplicateExercises(results);
      
      return uniqueExercises;
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

  const handleGetMuscleGroups = async (): Promise<string[]> => {
    try {
      return await getMuscleGroups();
    } catch (error) {
      handleApiError(error, 'Failed to fetch muscle groups');
      return [];
    }
  };

  const handleGetEquipmentTypes = async (): Promise<string[]> => {
    try {
      return await getEquipmentTypes();
    } catch (error) {
      handleApiError(error, 'Failed to fetch equipment types');
      return [];
    }
  };

  return {
    isLoading,
    tableExists,
    checkTableExists,
    fetchExercisesFull: handleFetchExercisesFull,
    searchExercisesFull: handleSearchExercisesFull,
    getExerciseFullById: handleGetExerciseFullById,
    getMuscleGroups: handleGetMuscleGroups,
    getEquipmentTypes: handleGetEquipmentTypes,
  };
};
