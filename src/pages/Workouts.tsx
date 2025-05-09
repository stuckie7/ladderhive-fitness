
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutTabs from "@/components/workouts/WorkoutTabs";
import { useWorkoutData } from "@/hooks/use-workout-data";
import PreparedWorkoutsSection from "@/components/workouts/PreparedWorkoutsSection";

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
  
  // This is a dummy function since we're not in a specific workout
  const handleAddExercise = async () => {
    // In the actual workflow, users would first select a workout
    // and then add exercises to it from the PreparedWorkoutsSection
    return Promise.resolve();
  };
  
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
      
      {/* Add the PreparedWorkouts section */}
      <div className="container mx-auto px-4 py-6">
        <PreparedWorkoutsSection 
          onAddExercise={handleAddExercise} 
        />
      </div>
    </AppLayout>
  );
};

export default Workouts;
