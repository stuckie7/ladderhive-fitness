
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Dumbbell, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Exercise } from "@/types/exercise";
import { Workout } from "@/types/workout";
import { WorkoutExercise } from "@/hooks/workout-exercises/utils";

interface PreparedWorkoutProps {
  workout: Workout;
  isExpanded: boolean;
  toggleExpand: (workoutId: string) => void;
  workoutExercises: WorkoutExercise[];
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{workout.title}</h4>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">{workout.difficulty}</Badge>
            <span className="text-sm text-muted-foreground">
              {workout.duration} min • {workout.exercises} exercises
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => toggleExpand(workout.id)}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-3 animate-in fade-in-50">
          {isLoading ? (
            <PreparedWorkoutSkeleton />
          ) : workoutExercises?.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                {workout.description || "No description available."}
              </p>
              {workoutExercises.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.exercise?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.sets} sets × {item.reps} reps
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => item.exercise && handleAddExercise(item.exercise)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No exercises found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PreparedWorkoutSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((item) => (
      <div key={item} className="flex justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export default PreparedWorkout;
