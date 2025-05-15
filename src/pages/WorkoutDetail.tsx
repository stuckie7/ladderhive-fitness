
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutDetail } from '@/hooks/workout-detail';
import { useFetchWorkoutExercises } from '@/hooks/workout-exercises/use-fetch-workout-exercises';
import { useManageWorkoutExercises } from '@/hooks/workout-exercises/use-manage-workout-exercises';
import { Exercise } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';

// Components
import WorkoutDetailHeader from '@/components/workouts/WorkoutDetailHeader';
import WorkoutDetailLayout from '@/components/workouts/WorkoutDetailLayout';
import WorkoutExerciseSection from '@/components/workouts/WorkoutExerciseSection';
import WorkoutDetailStats from '@/components/workouts/WorkoutDetailStats';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the combined workout detail hook
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
  } = useWorkoutDetail(id);
  
  // States for UI feedback
  const [isStarting, setIsStarting] = useState(false);
  const [isCompletingWorkout, setIsCompletingWorkout] = useState(false);
  
  // Handle starting a workout (navigate to workout session)
  const handleStartWorkout = async () => {
    setIsStarting(true);
    try {
      // Implement workout start logic here
      toast({
        title: "Coming Soon",
        description: "Workout session feature will be available soon!",
      });
    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Handle completing a workout
  const completeWorkout = async () => {
    setIsCompletingWorkout(true);
    try {
      await handleCompleteWorkout();
      toast({
        title: "Workout Completed",
        description: "Great job! Your workout has been marked as completed.",
      });
    } catch (error) {
      console.error('Error completing workout:', error);
      toast({
        title: "Error",
        description: "Failed to mark workout as completed",
        variant: "destructive",
      });
    } finally {
      setIsCompletingWorkout(false);
    }
  };

  // Handle saving/unsaving a workout
  const toggleSaveWorkout = async () => {
    try {
      await handleSaveWorkout(!isSaved);
      toast({
        title: isSaved ? "Workout Unsaved" : "Workout Saved",
        description: isSaved ? "Workout removed from saved workouts" : "Workout added to saved workouts",
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save/unsave workout",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding an exercise to workout with Promise
  const addExercise = async (exerciseObj: Exercise): Promise<void> => {
    return handleAddExercise(exerciseObj);
  };
  
  // Handle back navigation
  const handleBackClick = () => {
    navigate('/workouts');
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <Spinner />
        </div>
      </AppLayout>
    );
  }
  
  if (error || !workout) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Error Loading Workout</h2>
            <p className="mb-4">{error || "Workout not found"}</p>
            <Button onClick={handleBackClick}>Go Back to Workouts</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Prepare props for the components
  const headerProps = {
    title: workout.title,
    description: workout.description,
    isSaved: isSaved,
    isLoading: isLoading,
    onToggleSave: toggleSaveWorkout,
    onStartWorkout: handleStartWorkout
  };

  const statsProps = {
    duration: workout.duration || workout.duration_minutes || 0,
    exercises: workoutExercises?.length || 0,
    difficulty: workout.difficulty || "Not specified",
    category: workout.category
  };
  
  return (
    <AppLayout>
      <WorkoutDetailLayout 
        header={
          <WorkoutDetailHeader {...headerProps} />
        }
        stats={
          <WorkoutDetailStats {...statsProps} />
        }
        content={
          <WorkoutExerciseSection 
            workoutId={id}
            exercises={workoutExercises || []}
            isLoading={exercisesLoading}
            onAddExercise={addExercise}
            onRemoveExercise={removeExerciseFromWorkout}
          />
        }
      />
    </AppLayout>
  );
}
