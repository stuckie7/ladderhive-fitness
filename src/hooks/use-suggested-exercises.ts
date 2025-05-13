
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SuggestedExercise {
  id: number | string;
  name: string;
  description?: string;
  short_youtube_demo?: string;
  youtube_thumbnail_url?: string;
  prime_mover_muscle?: string;
  primary_equipment?: string;
}

export const useSuggestedExercises = (limit = 5) => {
  const [exercises, setExercises] = useState<SuggestedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestedExercises();
  }, [limit]);

  const fetchSuggestedExercises = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('id, name, description, short_youtube_demo, youtube_thumbnail_url, prime_mover_muscle, primary_equipment')
        .not('short_youtube_demo', 'is', null)
        .not('youtube_thumbnail_url', 'is', null)
        .limit(limit)
        .order('name');

      if (error) {
        throw error;
      }

      setExercises(data || []);
    } catch (err: any) {
      console.error('Failed to fetch suggested exercises:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    exercises, 
    isLoading, 
    error,
    refetch: fetchSuggestedExercises
  };
};
