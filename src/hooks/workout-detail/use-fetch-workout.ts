
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface WorkoutDetail {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  duration: number;
  exercises: number;
  created_at: string;
  updated_at: string;
}

export const useWorkoutDetail = (workoutId?: string) => {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkout = useCallback(async () => {
    if (!workoutId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (error) {
        throw error;
      }

      setWorkout(data as WorkoutDetail);
    } catch (error: any) {
      console.error("Error fetching workout:", error.message);
      toast({
        title: "Error",
        description: "Failed to load workout details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast]);

  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  return {
    workout,
    isLoading,
    fetchWorkout,
  };
};
