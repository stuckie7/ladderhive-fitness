
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Workout } from "@/types/workout";

export const useFetchWorkout = (workoutId?: string) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch the workout details
  const fetchWorkout = useCallback(async () => {
    if (!workoutId) {
      toast({
        title: "Error",
        description: "No workout ID provided",
        variant: "destructive",
      });
      setTimeout(() => navigate("/workouts"), 3000);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Fetching workout with ID:", workoutId);
      
      // Fetch the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .maybeSingle(); // Use maybeSingle instead of single to prevent error
      
      if (workoutError) throw workoutError;
      
      if (workoutData) {
        setWorkout(workoutData);
      
        // Check if the workout is saved by the current user
        const { data: userWorkout, error: userWorkoutError } = await supabase
          .from('user_workouts')
          .select('id')
          .eq('workout_id', workoutId)
          .eq('status', 'saved')
          .maybeSingle();
        
        if (!userWorkoutError && userWorkout) {
          setIsSaved(true);
        }
      }
      
      return workoutData;
    } catch (error: any) {
      console.error("Error fetching workout:", error);
      // Don't toast an error here since we might display a mock workout instead
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast, navigate]);

  return {
    workout,
    isLoading,
    isSaved,
    setIsSaved,
    fetchWorkout
  };
};
