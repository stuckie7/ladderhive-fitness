
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkoutDetail } from "@/hooks/workout-detail";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutDetailLayout from "@/components/workouts/WorkoutDetailLayout";
import { Exercise } from "@/types/exercise";
import PreparedWorkoutsSection from "@/components/workouts/PreparedWorkoutsSection";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    workout,
    workoutExercises: exercises,
    isLoading,
    exercisesLoading,
    handleAddExercise,
  } = useWorkoutDetail(id);

  useEffect(() => {
    // Workout data is fetched inside the useWorkoutDetail hook
  }, [id]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {workout && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">{workout?.title || "Loading..."}</h1>
                <p className="text-muted-foreground mt-1">{workout?.description || ""}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{workout?.duration || 0} minutes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-muted-foreground">Exercises</p>
                    <p className="font-medium">{exercises?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className="font-medium">{workout?.difficulty || ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Exercises</h3>
            <ExerciseSearch onSelectExercise={handleAddExercise} />
          </div>

          <div className="mt-8">
            {isLoading || exercisesLoading ? (
              <p>Loading exercises...</p>
            ) : exercises && exercises.length > 0 ? (
              <div className="space-y-4">
                {exercises.map(exercise => (
                  <div key={exercise.id} className="p-4 border rounded-md">
                    <p>{exercise.exercise?.name}</p>
                    <div className="text-sm text-muted-foreground">
                      Sets: {exercise.sets} • Reps: {exercise.reps}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No exercises in this workout yet</p>
            )}
          </div>
          
          {/* Add the PreparedWorkouts section */}
          <PreparedWorkoutsSection 
            currentWorkoutId={id} 
            onAddExercise={handleAddExercise} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
