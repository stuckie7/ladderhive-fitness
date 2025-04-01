
import { useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useWorkoutDetail } from "@/hooks/use-workout-detail";
import { useEffect, useState } from "react";

// Import our components
import WorkoutDetailHeader from "@/components/workouts/WorkoutDetailHeader";
import WorkoutDetailStats from "@/components/workouts/WorkoutDetailStats";
import WorkoutActions from "@/components/workouts/WorkoutActions";
import WorkoutDetailLayout from "@/components/workouts/WorkoutDetailLayout";

// Import mock data from Dashboard for development purposes
import { mockWorkouts } from "@/data/mock-workouts";

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [mockWorkout, setMockWorkout] = useState<any>(null);
  
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

  // Check if this is a mock workout from the dashboard
  useEffect(() => {
    if (id) {
      const foundMockWorkout = mockWorkouts.find(w => w.id === id);
      if (foundMockWorkout) {
        console.log("Found mock workout:", foundMockWorkout);
        setMockWorkout(foundMockWorkout);
      }
    }
  }, [id]);

  if (isLoading && !mockWorkout) {
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

  // Use mock workout if database workout not found
  const displayWorkout = workout || mockWorkout;

  if (!displayWorkout) {
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
        <WorkoutDetailHeader workout={displayWorkout} />
        
        <WorkoutActions 
          isSaved={isSaved}
          isLoading={workoutActionLoading}
          onSave={() => handleSaveWorkout(isSaved)}
          onComplete={handleCompleteWorkout}
        />
        
        <WorkoutDetailStats 
          duration={displayWorkout?.duration || 0} 
          exerciseCount={mockWorkout ? 0 : workoutExercises.length} 
        />

        <WorkoutDetailLayout 
          workoutId={id}
          exercises={workoutExercises}
          isLoading={exercisesLoading}
          duration={displayWorkout?.duration || 0}
          onAddExercise={handleAddExercise}
        />
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
