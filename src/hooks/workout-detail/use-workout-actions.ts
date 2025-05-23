
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const useWorkoutActions = (workoutId: string) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Check if workout is saved
  const checkIfSaved = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return false;
      
      const userId = session.session.user.id;
      
      const { data, error } = await supabase
        .from('user_workouts')
        .select('id')
        .eq('user_id', userId)
        .eq('workout_id', workoutId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
        throw error;
      }
      
      setIsSaved(!!data);
      return !!data;
    } catch (err: any) {
      console.error('Error checking if workout is saved:', err);
      return false;
    }
  }, [workoutId]);

  useEffect(() => {
    if (workoutId) {
      checkIfSaved();
    }
  }, [workoutId, checkIfSaved]);

  const handleSaveWorkout = useCallback(async (currentSavedState: boolean) => {
    if (!workoutId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save workouts",
          variant: "destructive"
        });
        return;
      }
      
      const userId = session.session.user.id;
      
      if (!currentSavedState) {
        // Save workout
        const { error } = await supabase
          .from('user_workouts')
          .insert({
            user_id: userId,
            workout_id: workoutId,
            status: 'saved'
          });
          
        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: "Workout saved",
          description: "Workout has been added to your saved workouts"
        });
      } else {
        // Unsave workout
        const { error } = await supabase
          .from('user_workouts')
          .delete()
          .eq('user_id', userId)
          .eq('workout_id', workoutId);
          
        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: "Workout removed",
          description: "Workout has been removed from your saved workouts"
        });
      }
    } catch (err: any) {
      console.error('Error saving/unsaving workout:', err);
      setError(err);
      toast({
        title: "Error",
        description: err.message || "Failed to update workout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast]);

  const handleCompleteWorkout = useCallback(async () => {
    if (!workoutId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to complete workouts",
          variant: "destructive"
        });
        return;
      }
      
      const userId = session.session.user.id;
      const now = new Date().toISOString();
      
      // Mark workout as completed
      const { error } = await supabase
        .from('user_workouts')
        .upsert({
          user_id: userId,
          workout_id: workoutId,
          status: 'completed',
          completed_at: now
        });
        
      if (error) throw error;
      
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been marked as completed."
      });
    } catch (err: any) {
      console.error('Error completing workout:', err);
      setError(err);
      toast({
        title: "Error",
        description: err.message || "Failed to mark workout as completed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast]);

  return {
    isSaved,
    isLoading,
    error,
    handleSaveWorkout,
    handleCompleteWorkout
  };
};
