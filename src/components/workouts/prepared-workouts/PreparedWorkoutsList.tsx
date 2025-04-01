
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Exercise } from "@/types/exercise";
import PreparedWorkout from "./PreparedWorkout";
import { usePreparedWorkouts } from "./usePreparedWorkouts";

interface PreparedWorkoutsListProps {
  currentWorkoutId: string;
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
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
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
    return null; // Don't show section if no prepared workouts
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {preparedWorkouts.map((workout) => (
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
      </CardContent>
    </Card>
  );
};

export default PreparedWorkoutsList;
