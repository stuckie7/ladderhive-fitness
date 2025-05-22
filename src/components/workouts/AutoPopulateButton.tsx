
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '@/types/exercise';
import { getSuggestedExercisesForWorkout } from '@/hooks/workout-library/services/exercise-suggestion-service';

interface AutoPopulateButtonProps {
  onExercisesGenerated: (exercises: Exercise[]) => void;
  workoutCategory?: string;
  workoutDifficulty?: string;
}

export default function AutoPopulateButton({ 
  onExercisesGenerated,
  workoutCategory = 'full body',
  workoutDifficulty = 'intermediate'
}: AutoPopulateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Define a set of default target muscles for different categories
  const getTargetMuscles = (category: string): string[] => {
    const targetMap: Record<string, string[]> = {
      'upper body': ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
      'lower body': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      'full body': ['chest', 'back', 'shoulders', 'quadriceps', 'hamstrings', 'glutes'],
      'core': ['abs', 'obliques', 'lower back'],
      'cardio': ['heart', 'lungs'],
      'arms': ['biceps', 'triceps', 'forearms'],
      'chest': ['chest', 'shoulders', 'triceps'],
      'back': ['back', 'lats', 'traps'],
      'legs': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    };
    
    return targetMap[category.toLowerCase()] || ['chest', 'back', 'legs'];
  };
  
  const handleAutoPopulate = async () => {
    setIsLoading(true);
    try {
      const targetMuscles = getTargetMuscles(workoutCategory);
      
      // Now call with the proper number of arguments
      const exercises = await getSuggestedExercisesForWorkout(
        workoutCategory, 
        workoutDifficulty,
        targetMuscles,
        5 // Limit
      );
      
      if (exercises && exercises.length > 0) {
        onExercisesGenerated(exercises);
        toast({
          title: "Exercises Added",
          description: `Added ${exercises.length} suggested exercises to your workout.`,
        });
      } else {
        toast({
          title: "No Exercises Found",
          description: "Couldn't find suitable exercises for this workout type.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error auto-populating exercises:", error);
      toast({
        title: "Error",
        description: "Failed to auto-populate exercises.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleAutoPopulate}
      disabled={isLoading}
      className="flex items-center"
    >
      <Wand2 className="h-4 w-4 mr-2" />
      {isLoading ? "Adding..." : "Auto-Populate"}
    </Button>
  );
}
