
import { Button } from "@/components/ui/button";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { ArrowLeft } from "lucide-react";
import AddToWorkoutButton from "../AddToWorkoutButton";

interface ExerciseHeaderProps {
  exercise: Exercise | ExerciseFull | null;
  onBackClick: () => void;
}

export default function ExerciseHeader({ exercise, onBackClick }: ExerciseHeaderProps) {
  if (!exercise) {
    return (
      <div className="mb-6">
        <Button variant="outline" className="mb-6" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercises
        </Button>
        <div className="h-8 bg-muted rounded animate-pulse w-1/3 mb-2"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  // Create an exercise object with necessary properties for AddToWorkoutButton
  const exerciseForButton = {
    id: exercise.id,
    name: exercise.name
  };

  // Helper function to get exercise properties based on type
  const getExerciseProperty = (prop: string): string | null => {
    if ('bodyPart' in exercise && prop === 'bodyPart') return exercise.bodyPart || null;
    if ('body_region' in exercise && prop === 'bodyPart') return exercise.body_region || null;
    
    if ('target' in exercise && prop === 'target') return exercise.target || null;
    if ('prime_mover_muscle' in exercise && prop === 'target') return exercise.prime_mover_muscle || null;
    
    if ('equipment' in exercise && prop === 'equipment') return exercise.equipment || null;
    if ('primary_equipment' in exercise && prop === 'equipment') return exercise.primary_equipment || null;
    
    if ('difficulty' in exercise) return exercise.difficulty || null;

    return null;
  };

  return (
    <>
      <Button variant="outline" className="mb-6" onClick={onBackClick}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Exercises
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
          <p className="text-muted-foreground text-sm">
            {getExerciseProperty('bodyPart') && `${getExerciseProperty('bodyPart')} `}
            {getExerciseProperty('target') && getExerciseProperty('target') !== getExerciseProperty('bodyPart') && `· ${getExerciseProperty('target')} `}
            {getExerciseProperty('equipment') && `· Equipment: ${getExerciseProperty('equipment')} `}
            {getExerciseProperty('difficulty') && `· Difficulty: ${getExerciseProperty('difficulty')}`}
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <AddToWorkoutButton exercise={exerciseForButton as Exercise} />
        </div>
      </div>
    </>
  );
}
