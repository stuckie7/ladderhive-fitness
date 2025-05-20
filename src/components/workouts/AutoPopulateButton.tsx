import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getSuggestedExercisesForWorkout } from '@/hooks/workout-library/services/exercise-suggestion-service';
import { ExerciseFull } from '@/types/exercise';
import type { WorkoutExercise } from '@/types/workout';
import { addExerciseToWorkout } from '@/hooks/workout-library/services/workout-service';

interface AutoPopulateButtonProps {
  workoutId: string;
  workoutCategory: string;
  workoutDifficulty: string;
  targetMuscles: string[];
  onPopulate: (exercises: WorkoutExercise[]) => void;
}



export default function AutoPopulateButton({
  workoutId,
  workoutCategory,
  workoutDifficulty,
  targetMuscles,
  onPopulate,
}: AutoPopulateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAutoPopulate = async () => {
    try {
      setIsLoading(true);
      const suggestedExercises = await getSuggestedExercisesForWorkout(
        workoutCategory,
        workoutDifficulty,
        targetMuscles
      );

      if (suggestedExercises.length === 0) {
        toast({
          title: "No exercises found",
          description: "No exercises match the workout criteria.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Convert exercises to WorkoutExercise format
      const workoutExercises = suggestedExercises.map((exercise, index) => ({
        exercise_id: exercise.id.toString(),
        sets: 3,
        reps: "10",
        rest_seconds: 60,
        order_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        id: `${exercise.id}-${index}-${Date.now()}`,
        workout_id: workoutId
      }));

      // Add exercises to workout
      for (const we of workoutExercises) {
        await addExerciseToWorkout(workoutId, we);
      }

      onPopulate(workoutExercises);
      toast({
        title: "Exercises added",
        description: `${workoutExercises.length} exercises have been added to your workout.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error auto-populating workout:', error);
      toast({
        title: "Error",
        description: "Failed to add exercises to workout.",
        variant: "destructive"
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
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Populating...
        </>
      ) : (
        "Auto-Populate Workout"
      )}
    </Button>
  );
}
