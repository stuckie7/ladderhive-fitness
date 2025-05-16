
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
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold gradient-heading">Dashboard</h1>
      <div className="space-x-2">
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
