
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Search } from "lucide-react";
import ExerciseList from "@/components/workouts/ExerciseList";
import ExerciseSearchModal from "@/components/exercises/ExerciseSearchModal";
import WorkoutExerciseSkeleton from "@/components/workouts/WorkoutExerciseSkeleton";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "@/hooks/workout-exercises/utils";

// Define the interface for the exercise list items to match ExerciseList component
interface ExerciseListItem {
  id: string;
  name: string;
  sets: number;
  reps: string | number;
  weight?: string;
  restTime?: number;
  description?: string;
  demonstration?: string;
}

interface WorkoutExerciseSectionProps {
  workoutId?: string;
  exercises: WorkoutExercise[];
  isLoading: boolean;
  onAddExercise: (exercise: Exercise) => Promise<void>;
}

const WorkoutExerciseSection = ({ 
  workoutId, 
  exercises, 
  isLoading, 
  onAddExercise 
}: WorkoutExerciseSectionProps) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleAddExercise = async (exercise: Exercise): Promise<void> => {
    await onAddExercise(exercise);
    setSearchModalOpen(false);
  };

  // Format exercises to match ExerciseListItem interface
  const exerciseListItems: ExerciseListItem[] = exercises.map(we => ({
    id: we.id,
    name: we.exercise?.name || "Unknown Exercise",
    sets: we.sets,
    reps: we.reps, // This will be string or number already
    weight: we.weight ? String(we.weight) : undefined, // Convert weight to string
    restTime: we.rest_seconds || we.rest_time, // Use rest_seconds with fallback to rest_time
    description: we.exercise?.description,
    demonstration: we.exercise?.video_demonstration_url || 
                  we.exercise?.video_url || 
                  we.exercise?.short_youtube_demo ||
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
        <ExerciseList exercises={exerciseListItems} />
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
