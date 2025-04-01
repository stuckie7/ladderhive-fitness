
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useWorkoutExercises } from "@/hooks/use-workout-exercises";
import { useWorkouts } from "@/hooks/use-workouts";
import { validateUuid } from "@/hooks/workout-exercises/utils";
import { Workout } from "@/types/workout";

export const useWorkoutDetail = (workoutId?: string) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    exercises: workoutExercises, 
    isLoading: exercisesLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout
  } = useWorkoutExercises(workoutId);
  
  const { 
    saveWorkout, 
    unsaveWorkout, 
    completeWorkout,
    isLoading: workoutActionLoading 
  } = useWorkouts();

  useEffect(() => {
    let isMounted = true;
    
    const fetchWorkout = async () => {
      if (!workoutId) {
        toast({
          title: "Error",
          description: "No workout ID provided",
          variant: "destructive",
        });
        setTimeout(() => navigate("/workouts"), 3000);
        return;
      }
      
      // Validate UUID format before making the request
      if (!validateUuid(workoutId)) {
        console.error("Invalid UUID format:", workoutId);
        toast({
          title: "Error",
          description: "Invalid workout ID format. Please check the URL.",
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
          .single();
        
        if (workoutError) throw workoutError;
        
        if (isMounted) {
          setWorkout(workoutData);
        
          // Check if the workout is saved by the current user
          const { data: userWorkout, error: userWorkoutError } = await supabase
            .from('user_workouts')
            .select('id')
            .eq('workout_id', workoutId)
            .eq('status', 'saved')
            .maybeSingle();
          
          if (!userWorkoutError && userWorkout && isMounted) {
            setIsSaved(true);
          }
        }
        
        // Only fetch exercises if we have a valid workout
        if (workoutData && isMounted) {
          await fetchWorkoutExercises(workoutId);
        }
      } catch (error: any) {
        console.error("Error fetching workout:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: error.message || "Failed to load workout details",
            variant: "destructive",
          });
          
          setTimeout(() => {
            navigate("/workouts");
          }, 3000);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchWorkout();
    
    return () => {
      isMounted = false;
    };
  }, [workoutId, toast, fetchWorkoutExercises, navigate]);

  const handleAddExercise = async (exercise: any) => {
    if (!workoutId) return;
    
    await addExerciseToWorkout(workoutId, exercise);
  };

  const handleSaveWorkout = async () => {
    if (!workoutId) return;
    
    if (isSaved) {
      const result = await unsaveWorkout(workoutId);
      if (result.success) {
        setIsSaved(false);
      }
    } else {
      const result = await saveWorkout(workoutId);
      if (result.success) {
        setIsSaved(true);
      }
    }
  };

  const handleCompleteWorkout = async () => {
    if (!workoutId) return;
    
    const result = await completeWorkout(workoutId);
    if (result.success) {
      toast({
        title: "Workout Completed",
        description: "Great job! Your workout has been recorded.",
      });
      
      setTimeout(() => {
        navigate("/workouts");
      }, 2000);
    }
  };

  return {
    workout,
    isLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    workoutActionLoading,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout
  };
};
