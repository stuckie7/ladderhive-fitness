
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/types/exercise";
import PreparedWorkout from "./PreparedWorkout";
import { usePreparedWorkouts } from "@/hooks/workouts/use-prepared-workouts";

interface PreparedWorkoutsListProps {
  currentWorkoutId?: string;
  onAddExercise: (exercise: Exercise) => Promise<void>;
}

const PreparedWorkoutsList = ({ 
  currentWorkoutId, 
  onAddExercise 
}: PreparedWorkoutsListProps) => {
  const {
    preparedWorkouts,
    isLoading,
    expandedWorkout,
    workoutExercises,
    loadingExercises,
    toggleExpand,
  } = usePreparedWorkouts(currentWorkoutId);

  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (preparedWorkouts.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No prepared workouts available</p>
        </CardContent>
      </Card>
    );
  }

  // Group workouts by category for better organization
  const workoutsByCategory = preparedWorkouts.reduce((acc, workout) => {
    const category = workout.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(workout);
    return acc;
  }, {} as Record<string, typeof preparedWorkouts>);

  return (
    <Card className="border border-border overflow-hidden">
      <CardContent className="p-0">
        {Object.entries(workoutsByCategory).map(([category, workouts]) => (
          <div key={category} className="mb-2">
            <div className="px-4 py-2 bg-accent/10">
              <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">
                {category}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {workouts.map((workout) => (
                <PreparedWorkout
                  key={workout.id}
                  workout={workout}
                  isExpanded={expandedWorkout === workout.id}
                  toggleExpand={toggleExpand}
                  workoutExercises={
                    workoutExercises[workout.id] || []
                  }
                  isLoading={!!loadingExercises[workout.id]}
                  onAddExercise={onAddExercise}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PreparedWorkoutsList;
