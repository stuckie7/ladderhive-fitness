
import React from 'react';
import QuickActionsPanel from './QuickActionsPanel';
import UpcomingWorkouts from "@/components/dashboard/UpcomingWorkouts";
import { useNavigate } from 'react-router-dom';

interface QuickActionsSectionProps {
  upcomingWorkouts: any[];
  isLoading: boolean;
  onGoToExerciseLibrary: () => void;
  onScheduleWorkout: () => void;
  onRefreshWorkouts: () => void;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  upcomingWorkouts,
  isLoading,
  onGoToExerciseLibrary,
  onScheduleWorkout,
  onRefreshWorkouts
}) => {
  const navigate = useNavigate();
  
  // Add a function to handle viewing a workout
  const handleViewWorkout = (id: string) => {
    navigate(`/workouts/${id}`);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <QuickActionsPanel onGoToExerciseLibrary={onGoToExerciseLibrary} />
      <div className="col-span-2">
        <UpcomingWorkouts 
          workouts={upcomingWorkouts} 
          isLoading={isLoading}
          onScheduleWorkout={onScheduleWorkout}
          onRefresh={onRefreshWorkouts}
          onViewWorkout={handleViewWorkout}
        />
      </div>
    </div>
  );
};

export default QuickActionsSection;
