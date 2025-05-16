
import { ExerciseFull } from "@/types/exercise";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ExerciseDetailHeaderProps {
  exercise: ExerciseFull;
  onBackClick?: () => void;
  showBackButton?: boolean;
}

export default function ExerciseDetailHeader({ 
  exercise, 
  onBackClick,
  showBackButton = true
}: ExerciseDetailHeaderProps) {
  // Helper function to determine difficulty badge class
  const getDifficultyBadgeClass = (difficulty: string | null | undefined) => {
    if (!difficulty) return "";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'advanced':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="mb-6">
      {showBackButton && onBackClick && (
        <Button variant="ghost" onClick={onBackClick} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}
      
      <div className="flex items-center gap-2 mb-2">
        {exercise.difficulty && (
          <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
        )}
        {exercise.prime_mover_muscle && (
          <Badge variant="outline" className="bg-muted/50">
            {exercise.prime_mover_muscle}
          </Badge>
        )}
        {exercise.primary_equipment && (
          <Badge variant="outline" className="bg-muted/50">
            {exercise.primary_equipment}
          </Badge>
        )}
      </div>
      
      <h1 className="text-3xl font-bold">{exercise.name}</h1>
    </div>
  );
}
