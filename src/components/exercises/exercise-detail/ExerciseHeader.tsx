
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
            {exercise.bodyPart && `${exercise.bodyPart} `}
            {exercise.target && exercise.target !== exercise.bodyPart && `· ${exercise.target} `}
            {exercise.equipment && `· Equipment: ${exercise.equipment} `}
            {exercise.difficulty && `· Difficulty: ${exercise.difficulty}`}
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <AddToWorkoutButton exercise={exerciseForButton as Exercise} />
        </div>
      </div>
    </>
  );
}
