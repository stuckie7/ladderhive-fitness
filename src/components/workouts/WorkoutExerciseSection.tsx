
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Search } from "lucide-react";
import ExerciseList from "@/components/workouts/detail/ExerciseList";
import ExerciseSearchModal from "@/components/exercises/ExerciseSearchModal";
import WorkoutExerciseSkeleton from "@/components/workouts/WorkoutExerciseSkeleton";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "@/types/workout";

// Define the interface for the exercise list items to match ExerciseList component
interface ExerciseListItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restTime?: number;
  description?: string;
  demonstration?: string;
  thumbnailUrl?: string;
}

interface WorkoutExerciseSectionProps {
  workoutId?: string;
  exercises: WorkoutExercise[];
  isLoading: boolean;
  onAddExercise: (exercise: Exercise) => Promise<void>;
  onRemoveExercise?: (exerciseId: string) => void;
}

const WorkoutExerciseSection = ({ 
  workoutId, 
  exercises, 
  isLoading, 
  onAddExercise,
  onRemoveExercise
}: WorkoutExerciseSectionProps) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleAddExercise = async (exercise: Exercise): Promise<void> => {
    await onAddExercise(exercise);
    setSearchModalOpen(false);
  };

  // Ensures any reps value is converted to string
  const ensureStringReps = (reps: string | number | undefined): string => {
    if (reps === undefined) return '';
    return reps.toString();
  };

  // Format exercises to match ExerciseListItem interface
  const exerciseListItems: ExerciseListItem[] = exercises.map(we => ({
    id: we.id,
    name: we.exercise?.name || "Unknown Exercise",
    sets: we.sets,
    reps: ensureStringReps(we.reps), // Convert reps to string
    weight: we.weight ? String(we.weight) : undefined, // Convert weight to string
    restTime: we.rest_seconds || we.rest_time || 60, // Handle both properties
    description: we.exercise?.description,
    demonstration: we.exercise?.video_demonstration_url || 
                  we.exercise?.video_url || 
                  we.exercise?.short_youtube_demo ||
                  we.exercise?.image_url,
    thumbnailUrl: we.exercise?.youtube_thumbnail_url ||
                 we.exercise?.image_url
  }));

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Workout Exercises</h2>
        <Button 
          onClick={() => setSearchModalOpen(true)}
          className="bg-fitness-primary hover:bg-fitness-primary/90"
        >
          <Search className="h-4 w-4 mr-2" />
          Search & Add Exercise
        </Button>
      </div>
      
      {isLoading ? (
        <WorkoutExerciseSkeleton />
      ) : exercises.length > 0 ? (
        <div className="exercise-list">
          {exerciseListItems.map((exercise) => (
            <div key={exercise.id} className="exercise-item mb-4">
              <h3 className="text-lg font-medium">{exercise.name}</h3>
              <div className="flex text-sm text-muted-foreground gap-4 mb-2">
                <span>{exercise.sets} sets</span>
                <span>{exercise.reps} reps</span>
                {exercise.weight && <span>{exercise.weight}</span>}
                <span>{exercise.restTime}s rest</span>
              </div>
              {onRemoveExercise && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onRemoveExercise(exercise.id)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No exercises yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              This workout doesn't have any exercises yet. Add some to get started.
            </p>
            <Button 
              onClick={() => setSearchModalOpen(true)}
              className="bg-fitness-primary hover:bg-fitness-primary/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Search & Add Exercise
            </Button>
          </CardContent>
        </Card>
      )}

      <ExerciseSearchModal 
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onAddExercise={handleAddExercise}
        workoutId={workoutId}
      />
    </>
  );
};

export default WorkoutExerciseSection;
