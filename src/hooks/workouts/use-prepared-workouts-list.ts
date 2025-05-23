
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { PreparedWorkout } from '@/types/workout';

export const usePreparedWorkoutsList = () => {
  const [preparedWorkouts, setPreparedWorkouts] = useState<PreparedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch prepared workouts
  useEffect(() => {
    const fetchPreparedWorkouts = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('prepared_workouts')
          .select('*')
          .order('title');
        
        if (error) throw error;
        
        setPreparedWorkouts(data || []);
      } catch (error: any) {
        console.error("Error fetching prepared workouts:", error);
        toast({
          title: "Error",
          description: "Failed to load prepared workouts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreparedWorkouts();
  }, [toast]);

  return {
    preparedWorkouts,
    isLoading
  };
};
