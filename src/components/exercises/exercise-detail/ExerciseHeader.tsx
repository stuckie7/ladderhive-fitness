
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/types/exercise";
import { ArrowLeft } from "lucide-react";

interface ExerciseHeaderProps {
  exercise: Exercise;
  onBackClick: () => void;
}

export default function ExerciseHeader({ exercise, onBackClick }: ExerciseHeaderProps) {
  return (
    <>
      <Button variant="outline" className="mb-6" onClick={onBackClick}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Exercises
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.bodyPart && <Badge variant="outline">{exercise.bodyPart}</Badge>}
            {exercise.target && exercise.target !== exercise.bodyPart && (
              <Badge variant="outline">{exercise.target}</Badge>
            )}
            {exercise.equipment && <Badge variant="secondary">{exercise.equipment}</Badge>}
            {exercise.difficulty && (
              <Badge className={`
                ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
              `}>
                {exercise.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
