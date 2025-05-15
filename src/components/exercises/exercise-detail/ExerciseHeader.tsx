
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
  const getExerciseProperty = (key: string): string | null => {
    if (key === 'bodyPart') {
      return ('body_region' in exercise) ? exercise.body_region || null :
             ('bodyPart' in exercise) ? exercise.bodyPart || null : null;
    }
    
    if (key === 'target') {
      return ('prime_mover_muscle' in exercise) ? exercise.prime_mover_muscle || null :
             ('target' in exercise) ? exercise.target || null : null;
    }
    
    if (key === 'equipment') {
      return ('primary_equipment' in exercise) ? exercise.primary_equipment || null :
             ('equipment' in exercise) ? exercise.equipment || null : null;
    }
    
    if (key === 'difficulty') {
      return ('difficulty' in exercise) ? exercise.difficulty || null : null;
    }

    return null;
  };

  const bodyPart = getExerciseProperty('bodyPart');
  const target = getExerciseProperty('target');
  const equipment = getExerciseProperty('equipment');
  const difficulty = getExerciseProperty('difficulty');

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
            {bodyPart && `${bodyPart} `}
            {target && target !== bodyPart && `· ${target} `}
            {equipment && `· Equipment: ${equipment} `}
            {difficulty && `· Difficulty: ${difficulty}`}
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <AddToWorkoutButton exercise={exerciseForButton as Exercise} />
        </div>
      </div>
    </>
  );
}
