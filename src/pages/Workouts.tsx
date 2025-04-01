
import AppLayout from "@/components/layout/AppLayout";
import WorkoutTabs from "@/components/workouts/WorkoutTabs";
import { useWorkoutData } from "@/hooks/use-workout-data";

const Workouts = () => {
  const {
    activeTab,
    setActiveTab,
    workouts,
    savedWorkouts,
    completedWorkouts,
    plannedWorkouts,
    isLoading
  } = useWorkoutData();
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading workouts...</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <WorkoutTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        workouts={workouts}
        savedWorkouts={savedWorkouts}
        completedWorkouts={completedWorkouts}
        plannedWorkouts={plannedWorkouts}
      />
    </AppLayout>
  );
};

export default Workouts;
