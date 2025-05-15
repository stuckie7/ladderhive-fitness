
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import WorkoutDetailHeader from '@/components/workouts/WorkoutDetailHeader';
import WorkoutExerciseSection from '@/components/workouts/WorkoutExerciseSection';
import { useWorkoutDetail } from '@/hooks/workout-detail';
import { Exercise } from '@/types/exercise';
import { useManageWorkoutExercises } from '@/hooks/workout-exercises';
import { Spinner } from '@/components/ui/spinner';

const WorkoutDetail = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Use the workout detail hook
  const {
    workout,
    isLoading,
    error,
    completeWorkout,
    isCompletingWorkout,
    refreshWorkout
  } = useWorkoutDetail(workoutId);

  // Use the exercise management hook
  const {
    exercises,
    isLoading: isLoadingExercises,
    addExerciseToWorkout,
    refetch: refetchExercises
  } = useManageWorkoutExercises(workoutId);

  useEffect(() => {
    if (workout) {
      setIsSaved(workout.is_saved || false);
    }
  }, [workout]);

  const handleToggleSave = async () => {
    if (!workout) return;

    // Simple toggle for now - actual implementation would be added later
    setIsSaved(!isSaved); // Optimistically update the local state
  };

  const onAddExercise = async (exercise: Exercise) => {
    if (!workoutId) {
      console.error("Workout ID is missing.");
      return;
    }

    try {
      await addExerciseToWorkout({
        ...exercise,
        id: exercise.id?.toString() || ""
      });
      await refetchExercises();
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="text-center">
            <Spinner />
            <p className="mt-2">Loading workout details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="text-center">
            <p className="text-red-500">Error: {error}</p>
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
          title={workout.name || workout.title}
          description={workout.description}
          isSaved={isSaved}
          isLoading={isCompletingWorkout}
          onToggleSave={handleToggleSave}
          onStartWorkout={completeWorkout}
        />

        <WorkoutExerciseSection
          workoutId={workoutId}
          exercises={exercises || []}
          isLoading={isLoadingExercises}
          onAddExercise={onAddExercise}
        />
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
