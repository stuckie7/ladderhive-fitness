
import { ExerciseFull } from "@/types/exercise";
import ExerciseCardFull from "./ExerciseCardFull";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseCardGridProps {
  exercises: ExerciseFull[];
  loading: boolean;
  onEdit?: (exercise: ExerciseFull) => void;
  onDelete?: (exercise: ExerciseFull) => void;
  onReset?: () => void;
}

const ExerciseCardGrid = ({
  exercises,
  loading,
  onEdit,
  onDelete,
  onReset
}: ExerciseCardGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (exercises.length === 0) {
    return (
      <div className="text-center py-10">
        <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground mb-4">
          No exercises found matching your criteria
        </p>
        {onReset && (
          <Button onClick={onReset} variant="outline">
            Reset Filters
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCardFull 
          key={exercise.id} 
          exercise={exercise}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ExerciseCardGrid;
