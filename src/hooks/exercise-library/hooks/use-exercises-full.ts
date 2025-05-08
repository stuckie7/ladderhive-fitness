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

const getBestVideoUrl = (exercise: ExerciseFull): string | null => {
  const validateYoutubeUrl = (url: string | null): string | null => {
    if (!url) return null;
    return url.startsWith('https://youtu.be') ? url : null;
  };
  
  return validateYoutubeUrl(exercise.short_youtube_demo) || 
         validateYoutubeUrl(exercise.in_depth_youtube_exp) || 
         null;
};

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

    let displayMessage = errorMessage;

    if (error && error.code) {
      switch (error.code) {
        case '42P01':
          displayMessage = "The exercises_full table doesn't exist in your database. Please create it first.";
          break;
        case '28000':
        case '28P01':
          displayMessage = "Authorization failed. Check your Supabase API key and URL.";
          break;
        case '3D000':
          displayMessage = "Invalid schema specified. Check your database configuration.";
          break;
        default:
          if (error.message) {
            displayMessage = `${errorMessage}: ${error.message}`;
          }
      }
    }

    if (error.message !== "Failed to fetch") {
      toast({
        title: 'Error',
        description: displayMessage,
        variant: 'destructive',
      });
    }
  };

  const handleFetchExercisesFull = async (limit = 50, offset = 0): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
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

      const uniqueMap = new Map<string, ExerciseFull>();
      
      rawData.forEach(item => {
        const name = item.name?.toLowerCase().trim() || '';
        const existingItem = uniqueMap.get(name);
        const currentHasVideo = Boolean(getBestVideoUrl(item));
        const existingHasVideo = existingItem ? Boolean(getBestVideoUrl(existingItem)) : false;
        
        if (!existingItem || 
            (currentHasVideo && !existingHasVideo) ||
            (currentHasVideo && existingHasVideo && 
             (item.in_depth_youtube_exp && !existingItem.in_depth_youtube_exp))) {
          uniqueMap.set(name, {
            ...item,
            video_demonstration_url: getBestVideoUrl(item),
            video_explanation_url: item.in_depth_youtube_exp || null
          });
        }
      });
      
      return Array.from(uniqueMap.values());
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
      
      const uniqueMap = new Map<string, ExerciseFull>();
      
      results.forEach(item => {
        const name = item.name?.toLowerCase().trim() || '';
        const existingItem = uniqueMap.get(name);
        const currentHasVideo = Boolean(getBestVideoUrl(item));
        const existingHasVideo = existingItem ? Boolean(getBestVideoUrl(existingItem)) : false;
        
        if (!existingItem || 
            (currentHasVideo && !existingHasVideo) ||
            (currentHasVideo && existingHasVideo && 
             (item.in_depth_youtube_exp && !existingItem.in_depth_youtube_exp))) {
          uniqueMap.set(name, {
            ...item,
            video_demonstration_url: getBestVideoUrl(item),
            video_explanation_url: item.in_depth_youtube_exp || null
          });
        }
      });
      
      return Array.from(uniqueMap.values());
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
