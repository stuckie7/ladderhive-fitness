
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface WorkoutDetailsData {
  id: string;
  title: string;
  short_description?: string;
  duration_minutes: number;
  difficulty: string;
  category: string;
  goal: string;
  created_at?: string;
  updated_at?: string;
  thumbnail_url?: string;
  video_url?: string;
  long_description?: string;
  equipment_needed?: string;
  benefits?: string;
  instructions?: string;
  modifications?: string;
}

export const useWorkoutDetailsData = () => {
  const [workouts, setWorkouts] = useState<WorkoutDetailsData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      setIsLoading(true);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('prepared_workouts')
          .select(`
            id,
            title,
            short_description,
            duration_minutes,
            difficulty,
            category,
            goal,
            created_at,
            updated_at,
            thumbnail_url,
            video_url,
            long_description,
            equipment_needed,
            benefits,
            instructions,
            modifications
          `);

        if (fetchError) throw fetchError;

        setWorkouts(data || []);
      } catch (error: any) {
        console.error("Error fetching workout details:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to load workout details: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [toast]);

  return {
    workouts,
    isLoading,
    error
  };
};
