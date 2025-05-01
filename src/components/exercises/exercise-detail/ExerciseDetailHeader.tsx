
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseFull } from "@/types/exercise";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExerciseDetailHeaderProps {
  exercise: ExerciseFull;
  onBackClick: () => void;
}

export default function ExerciseDetailHeader({
  exercise,
  onBackClick,
}: ExerciseDetailHeaderProps) {
  // Helper function to determine difficulty badge class
  const getDifficultyBadgeClass = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'advanced':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {/* Back Button */}
      <Button variant="outline" className="mb-6" onClick={onBackClick}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Exercises
      </Button>
      
      {/* Exercise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.prime_mover_muscle && (
              <Badge variant="outline">{exercise.prime_mover_muscle}</Badge>
            )}
            {exercise.body_region && exercise.body_region !== exercise.prime_mover_muscle && (
              <Badge variant="outline">{exercise.body_region}</Badge>
            )}
            {exercise.primary_equipment && (
              <Badge variant="secondary">{exercise.primary_equipment}</Badge>
            )}
            {exercise.difficulty && (
              <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add to Workout
          </Button>
        </div>
      </div>
    </>
  );
}
