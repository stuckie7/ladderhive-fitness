
import { Button } from "@/components/ui/button";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { ArrowLeft } from "lucide-react";
import AddToWorkoutButton from "../AddToWorkoutButton";
import { Badge } from "@/components/ui/badge";

interface ExerciseHeaderProps {
  exercise: Exercise | ExerciseFull | null;
  onBackClick: () => void;
}

export default function ExerciseHeader({ exercise, onBackClick }: ExerciseHeaderProps) {
  if (!exercise) {
    return (
      <div className="mb-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3 mb-2"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  // Helper function to get difficulty badge class
  const getDifficultyBadgeClass = (difficulty: string | undefined | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'intermediate':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'advanced':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
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

  const difficulty = getExerciseProperty('difficulty');
  
  return (
    <div className="border-b pb-4 mb-6">
      <h1 className="text-3xl font-bold mb-3">{exercise.name}</h1>
      
      <div className="flex flex-wrap gap-2 items-center mb-2">
        {difficulty && (
          <Badge className={getDifficultyBadgeClass(difficulty)}>
            {difficulty}
          </Badge>
        )}
        
        {getExerciseProperty('target') && (
          <Badge variant="outline">
            {getExerciseProperty('target')}
          </Badge>
        )}
        
        {getExerciseProperty('bodyPart') && getExerciseProperty('bodyPart') !== getExerciseProperty('target') && (
          <Badge variant="outline">
            {getExerciseProperty('bodyPart')}
          </Badge>
        )}
        
        {getExerciseProperty('equipment') && (
          <Badge variant="secondary">
            {getExerciseProperty('equipment')}
          </Badge>
        )}
      </div>
    </div>
  );
}
