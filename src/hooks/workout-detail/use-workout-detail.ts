
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFetchWorkoutExercises } from "../workout-exercises/use-fetch-workout-exercises";
import { useManageWorkoutExercises } from "../workout-exercises/use-manage-workout-exercises";
import { Exercise } from "@/types/exercise";

export const useWorkoutDetail = (workoutId?: string) => {
  const [workout, setWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { exercises, isLoading: isLoadingExercises, fetchExercises } = useFetchWorkoutExercises();
  const { addExerciseToWorkout, removeExerciseFromWorkout, updateWorkoutExercise } = useManageWorkoutExercises();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch workout details
  useEffect(() => {
    if (!workoutId) {
      setIsLoading(false);
      setError("No workout ID provided");
      return;
    }

    const fetchWorkoutDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let { data, error } = await supabase
          .from("prepared_workouts")
          .select("*")
          .eq("id", workoutId)
          .single();

        if (error) throw error;
        
        if (data) {
          setWorkout(data);
          await fetchExercises(workoutId);
        } else {
          setError("Workout not found");
        }
      } catch (error: any) {
        console.error("Error fetching workout:", error);
        setError(error.message || "Failed to fetch workout details");
        toast({
          title: "Error",
          description: "Could not load workout details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId, fetchExercises, toast]);

  // Add exercise to workout
  const addExercise = async (exercise: Exercise) => {
    if (!workoutId) return;
    
    setIsSaving(true);
    try {
      await addExerciseToWorkout(
        workoutId,
        exercise,
        3, // default sets
        "10", // default reps
        60, // default rest seconds
        exercises.length // add to end of list
      );
      
      await fetchExercises(workoutId);
      
      toast({
        title: "Success",
        description: `Added ${exercise.name} to workout`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add exercise to workout",
        variant: "destructive",
      });
      console.error("Error adding exercise:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove exercise from workout
  const removeExercise = async (exerciseId: string) => {
    if (!workoutId) return;
    
    setIsSaving(true);
    try {
      await removeExerciseFromWorkout(exerciseId);
      await fetchExercises(workoutId);
      
      toast({
        title: "Success",
        description: "Exercise removed from workout",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove exercise",
        variant: "destructive",
      });
      console.error("Error removing exercise:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update exercise details
  const updateExercise = async (updatedExercise: any) => {
    if (!workoutId) return;
    
    setIsSaving(true);
    try {
      await updateWorkoutExercise(updatedExercise);
      await fetchExercises(workoutId);
      
      toast({
        title: "Success",
        description: "Exercise updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
      console.error("Error updating exercise:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    workout,
    exercises,
    isLoading: isLoading || isLoadingExercises,
    isSaving,
    error,
    addExercise,
    removeExercise,
    updateExercise,
  };
};
