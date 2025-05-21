
import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AppTitle } from "@/components/ui/AppTitle";

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
<<<<<<< HEAD
        <h1 className="text-3xl font-bold gradient-heading" data-lovable-title="true" id="lovable-app-title" aria-label="Lovable App Title">FitTrack Pro beta</h1>
=======
        <AppTitle />
>>>>>>> 644545ad63184c0224b8151238bb5c4d916f4088
      </div>
      <div className="flex justify-between items-center">
        <Link to="/alt-workouts" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowRight className="h-5 w-5" />
          <span>ALT Workouts</span>
        </Link>
        <div className="flex gap-2">
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
    </div>
  );
};

export default DashboardHeader;
