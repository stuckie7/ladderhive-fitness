
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useWorkouts } from "@/hooks/use-workouts";

export const useWorkoutActions = (
  workoutId?: string,
  setIsSaved?: (value: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    saveWorkout, 
    unsaveWorkout, 
    completeWorkout
  } = useWorkouts();

  const handleSaveWorkout = async (isSaved: boolean) => {
    if (!workoutId) return;
    
    setIsLoading(true);
    try {
      if (isSaved) {
        const result = await unsaveWorkout(workoutId);
        if (result.success && setIsSaved) {
          setIsSaved(false);
        }
      } else {
        const result = await saveWorkout(workoutId);
        if (result.success && setIsSaved) {
          setIsSaved(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!workoutId) return;
    
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSaveWorkout,
    handleCompleteWorkout
  };
};
