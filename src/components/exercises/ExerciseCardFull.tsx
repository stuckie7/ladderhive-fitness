
import { ExerciseFull } from "@/types/exercise";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Info, Plus, Youtube, Dumbbell } from "lucide-react";

interface ExerciseCardFullProps {
  exercise: ExerciseFull;
  onEdit?: (exercise: ExerciseFull) => void;
  onDelete?: (exercise: ExerciseFull) => void;
}

const ExerciseCardFull = ({ exercise, onEdit, onDelete }: ExerciseCardFullProps) => {
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg line-clamp-1">{exercise.name}</CardTitle>
          <div className="flex gap-1">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onEdit(exercise)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-600" 
                onClick={() => onDelete(exercise)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
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
            {exercise.difficulty && (
              <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
            )}
          </div>
          
          <div className="aspect-video bg-muted rounded-md relative overflow-hidden">
            {exercise.short_youtube_demo ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white text-black border-0"
                  onClick={() => window.open(exercise.short_youtube_demo!, '_blank')}
                >
                  <Youtube className="h-6 w-6" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Dumbbell className="h-8 w-8 opacity-30" />
              </div>
            )}
          </div>
          
          <div className="text-sm">
            {exercise.prime_mover_muscle && (
              <p><span className="font-medium">Primary Muscle:</span> {exercise.prime_mover_muscle}</p>
            )}
            {exercise.mechanics && (
              <p><span className="font-medium">Mechanics:</span> {exercise.mechanics}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full gap-2">
          <Button variant="default" className="flex-1">
            <Info className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add to Workout
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExerciseCardFull;
