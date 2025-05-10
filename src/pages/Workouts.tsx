
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutTabs from "@/components/workouts/WorkoutTabs";
import { useWorkoutData } from "@/hooks/use-workout-data";
import PreparedWorkoutsSection from "@/components/workouts/PreparedWorkoutsSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold gradient-heading">Workouts</h1>
          <Link to="/workout-builder">
            <Button className="btn-fitness-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Workout
            </Button>
          </Link>
        </div>
      </div>
      
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
