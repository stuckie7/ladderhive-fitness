import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import WorkoutDetailHeader from '@/components/workouts/WorkoutDetailHeader';
import WorkoutExerciseSection from '@/components/workouts/WorkoutExerciseSection';
import { useWorkoutDetail } from '@/hooks/workout-detail/use-workout-detail';
import { Exercise } from '@/types/exercise';
import { useManageWorkoutExercises } from '@/hooks/workout-exercises/use-manage-workout-exercises';
import { Spinner } from '@/components/ui/spinner';

const WorkoutDetail = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const {
    workout,
    workoutExercises,
    isLoadingWorkout,
    isLoadingExercises,
    workoutError,
    exercisesError,
    toggleSaveWorkout,
    isActionLoading,
    handleStartWorkout,
    isStarting,
    handleAddExercise,
    refetchExercises
  } = useWorkoutDetail(workoutId);

  const {
    addExerciseToWorkout,
    isLoading: isAddingExercise,
    error: addExerciseError
  } = useManageWorkoutExercises(workoutId);

  useEffect(() => {
    if (workout) {
      setIsSaved(workout.is_saved);
    }
  }, [workout]);

  const handleToggleSave = async () => {
    if (!workout) return;

    try {
      await toggleSaveWorkout();
      setIsSaved(!isSaved); // Optimistically update the local state
    } catch (error) {
      console.error("Error toggling save:", error);
      // Optionally, revert the local state if the toggle fails
      setIsSaved(isSaved);
    }
  };

  const onAddExercise = async (exercise: Exercise) => {
    if (!workoutId) {
      console.error("Workout ID is missing.");
      return;
    }

    try {
      await addExerciseToWorkout(workoutId, exercise);
      await refetchExercises();
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  if (isLoadingWorkout) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-2">Loading workout details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (workoutError) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="text-center">
            <p className="text-red-500">Error: {workoutError.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workout) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="text-center">
            <p>Workout not found.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <WorkoutDetailHeader
          title={workout.name}
          description={workout.description}
          isSaved={isSaved}
          isLoading={isActionLoading}
          onToggleSave={handleToggleSave}
          onStartWorkout={handleStartWorkout}
        />

        <WorkoutExerciseSection
          workoutId={workoutId}
          exercises={workoutExercises as any[]} // Type assertion to satisfy the compiler
          isLoading={isLoadingExercises}
          onAddExercise={onAddExercise}
        />
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
