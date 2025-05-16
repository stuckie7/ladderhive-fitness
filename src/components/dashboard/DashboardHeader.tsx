
import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onStartWorkout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isLoading, 
  onRefresh,
  onStartWorkout 
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <img src="/fitapp icon 48x48.jpg" alt="FitTrack Logo" className="h-8 w-auto" />
        <h1 className="text-3xl font-bold gradient-heading">FitTrack Pro</h1>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
        <Button 
          className="btn-fitness-primary"
          onClick={onStartWorkout}
        >
          <Zap className="mr-2 h-4 w-4" /> Start Workout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
