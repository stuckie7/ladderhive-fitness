
import React from 'react';
import QuickActionsPanel from './QuickActionsPanel';
import UpcomingWorkouts from "@/components/dashboard/UpcomingWorkouts";
import { useNavigate } from 'react-router-dom';
import { useRecommendedWorkouts } from '@/hooks/workouts/use-recommended-workouts';

interface QuickActionsSectionProps {
  onScheduleWorkout: () => void;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onScheduleWorkout,
}) => {
  const navigate = useNavigate();
  const { recommendedWorkouts, isLoading, refreshRecommendations } = useRecommendedWorkouts();
  
  // Handle viewing a workout
  const handleViewWorkout = (id: string) => {
    // Find the workout to determine its type
    const workout = recommendedWorkouts.find(w => w.id === id);
    
    if (workout) {
      switch (workout.type) {
        case 'wod':
          navigate(`/wods/${id}`);
          break;
        case 'yoga':
          navigate(`/yoga/${id}`);
          break;
        case 'mindful':
          navigate(`/mindful-movement/${id}`);
          break;
        default:
          navigate(`/workouts/${id}`);
      }
    } else {
      // Default to workouts route if type can't be determined
      navigate(`/workouts/${id}`);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <QuickActionsPanel />
      <div className="col-span-2">
        <UpcomingWorkouts 
          workouts={recommendedWorkouts} 
          isLoading={isLoading}
          onScheduleWorkout={onScheduleWorkout}
          onRefresh={refreshRecommendations}
          onViewWorkout={handleViewWorkout}
        />
      </div>
    </div>
  );
};

export default QuickActionsSection;
