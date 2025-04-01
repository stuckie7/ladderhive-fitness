
import { useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useWorkoutDetail } from "@/hooks/use-workout-detail";

// Import our components
import WorkoutDetailHeader from "@/components/workouts/WorkoutDetailHeader";
import WorkoutDetailStats from "@/components/workouts/WorkoutDetailStats";
import WorkoutActions from "@/components/workouts/WorkoutActions";
import WorkoutDetailLayout from "@/components/workouts/WorkoutDetailLayout";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    workout,
    isLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    workoutActionLoading,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout
  } = useWorkoutDetail(id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workout) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
            <p className="text-muted-foreground mb-6">The workout you're looking for doesn't exist or you don't have access to it.</p>
            <button onClick={() => window.location.href = "/workouts"} className="px-4 py-2 bg-primary text-white rounded">
              Back to Workouts
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <WorkoutDetailHeader workout={workout} />
        
        <WorkoutActions 
          isSaved={isSaved}
          isLoading={workoutActionLoading}
          onSave={handleSaveWorkout}
          onComplete={handleCompleteWorkout}
        />
        
        <WorkoutDetailStats 
          duration={workout?.duration || 0} 
          exerciseCount={workoutExercises.length} 
        />

        <WorkoutDetailLayout 
          workoutId={id}
          exercises={workoutExercises}
          isLoading={exercisesLoading}
          duration={workout?.duration || 0}
          onAddExercise={handleAddExercise}
        />
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
