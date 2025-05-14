
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useWorkoutDetail } from '@/hooks/workout-detail';
import WorkoutDetailLayout from '@/components/workouts/WorkoutDetailLayout';
import WorkoutDetailStats from '@/components/workouts/WorkoutDetailStats';
import WorkoutDetailHeader from '@/components/workouts/WorkoutDetailHeader';
import WorkoutExerciseSection from '@/components/workouts/WorkoutExerciseSection';
import { Exercise } from '@/types/exercise';

const WorkoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Safely use the hook with nullish coalescing to provide a default empty string if id is undefined
  const {
    workout,
    isLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    error,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout,
    removeExerciseFromWorkout
  } = useWorkoutDetail(id ?? "");
  
  useEffect(() => {
    // If we're still loading, don't do anything yet
    if (isLoading) return;
    
    // If no workout was found, and we're not loading, try the enhanced view
    if (!workout && !isLoading) {
      navigate(`/workout-enhanced/${id}`);
    }
  }, [workout, isLoading, id, navigate]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" className="mb-6" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!workout) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" className="mb-6" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Workout Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The workout you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/workouts')}>
              Return to Workouts
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Create an exercise handler that matches the expected signature
  const onAddExercise = async (exercise: Exercise): Promise<void> => {
    await handleAddExercise(exercise);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <WorkoutDetailLayout
          header={
            <WorkoutDetailHeader
              title={workout.title}
              description={workout.description}
              isSaved={isSaved || false}
              isLoading={false}
              onToggleSave={() => handleSaveWorkout(isSaved || false)}
              onStartWorkout={handleCompleteWorkout}
            />
          }
          stats={
            <WorkoutDetailStats
              duration={workout.duration}
              exercises={workout.exercises}
              difficulty={workout.difficulty}
              category={workout.difficulty} // Fallback to using difficulty as category
            />
          }
          content={
            <WorkoutExerciseSection
              exercises={workoutExercises || []}
              isLoading={exercisesLoading || false}
              onAddExercise={onAddExercise}
              workoutId={id}
            />
          }
        />
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
