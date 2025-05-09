
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Dumbbell, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Exercise } from "@/types/exercise";
import { PreparedWorkout as PreparedWorkoutType, PreparedWorkoutExercise } from "@/types/workout";

interface PreparedWorkoutProps {
  workout: PreparedWorkoutType;
  isExpanded: boolean;
  toggleExpand: (workoutId: string) => void;
  workoutExercises: PreparedWorkoutExercise[];
  isLoading: boolean;
  onAddExercise: (exercise: Exercise) => Promise<void>;
}

const PreparedWorkout = ({ 
  workout, 
  isExpanded, 
  toggleExpand, 
  workoutExercises,
  isLoading,
  onAddExercise
}: PreparedWorkoutProps) => {
  const handleAddExercise = async (exercise: Exercise) => {
    if (!exercise) return;
    await onAddExercise(exercise);
  };

  // Function to determine difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'all levels':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 hover:bg-accent/5 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-foreground">{workout.title}</h4>
          <div className="flex flex-wrap gap-2 mt-1 items-center">
            <Badge 
              variant="outline" 
              className={`${getDifficultyColor(workout.difficulty)}`}
            >
              {workout.difficulty}
            </Badge>
            <Badge variant="secondary">
              {workout.category}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {workout.duration_minutes} min • {workout.exercises || workoutExercises.length || 5} exercises
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8"
          onClick={() => toggleExpand(workout.id)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-4 border-l-2 border-border space-y-3 animate-in fade-in-50 duration-200">
          {isLoading ? (
            <PreparedWorkoutSkeleton />
          ) : workoutExercises?.length > 0 ? (
            <>
              {workout.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {workout.description}
                </p>
              )}
              <div className="font-medium text-sm text-muted-foreground mb-2">Goal: {workout.goal}</div>
              {workoutExercises.map((item) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-2 rounded-md hover:bg-accent/10 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.exercise?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.sets} sets × {item.reps} • {item.rest_seconds}s rest
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    onClick={() => item.exercise && handleAddExercise(item.exercise)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-muted-foreground">No exercises found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PreparedWorkoutSkeleton = () => (
  <div className="space-y-3 py-2">
    {[1, 2, 3].map((item) => (
      <div key={item} className="flex justify-between items-center">
        <div>
          <Skeleton className="h-5 w-36 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    ))}
  </div>
);

export default PreparedWorkout;
