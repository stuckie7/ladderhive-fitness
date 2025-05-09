
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkoutDetail } from "@/hooks/use-workout-detail";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutDetailLayout from "@/components/workouts/WorkoutDetailLayout";
import WorkoutDetailHeader from "@/components/workouts/WorkoutDetailHeader";
import WorkoutDetailStats from "@/components/workouts/WorkoutDetailStats";
import WorkoutExerciseSection from "@/components/workouts/WorkoutExerciseSection";
import { Exercise } from "@/types/exercise";
import PreparedWorkoutsSection from "@/components/workouts/PreparedWorkoutsSection";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();

  const {
    workout,
    exercises,
    isLoading,
    fetchWorkout,
    updateWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
  } = useWorkoutDetail(id);

  useEffect(() => {
    if (id) {
      fetchWorkout(id);
    }
  }, [id, fetchWorkout]);

  const handleExerciseAdd = async (exercise: Exercise) => {
    if (!id) return;
    await addExerciseToWorkout(id, exercise.id);
  };

  return (
    <AppLayout>
      <WorkoutDetailLayout>
        <WorkoutDetailHeader
          title={workout?.title || "Loading..."}
          description={workout?.description || ""}
          isLoading={isLoading}
          onUpdate={updateWorkout}
        />

        <WorkoutDetailStats
          duration={workout?.duration || 0}
          exercises={exercises?.length || 0}
          difficulty={workout?.difficulty || ""}
          isLoading={isLoading}
        />

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Exercises</h3>
            <ExerciseSearch onSelectExercise={handleExerciseAdd} />
          </div>

          <WorkoutExerciseSection
            exercises={exercises || []}
            isLoading={isLoading}
            onRemove={removeExerciseFromWorkout}
          />
          
          {/* Add the PreparedWorkouts section */}
          <PreparedWorkoutsSection 
            currentWorkoutId={id} 
            onAddExercise={handleExerciseAdd} 
          />
        </div>
      </WorkoutDetailLayout>
    </AppLayout>
  );
};

export default WorkoutDetail;
