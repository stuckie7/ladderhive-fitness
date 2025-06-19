import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Loader2, Footprints, Target } from "lucide-react"; // Added Footprints icon
import { AppTitle } from "@/components/ui/AppTitle";
import { Progress } from "@/components/ui/progress";

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onStartWorkout: () => void;
  fitbitSteps: number | null;
  fitbitError: string | null;
  dailyStepGoal?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isLoading, 
  onRefresh,
  onStartWorkout,
  fitbitSteps,
  fitbitError,
  dailyStepGoal = 10000
}) => {
  return (
    <div className="flex flex-col gap-2 pb-4"> {/* Adjusted gap and added padding-bottom */} 
      <div className="flex items-start justify-between"> {/* Changed items-center to items-start for better alignment with multiline text */} 
        <div>
          <AppTitle />
          <div className="text-xs text-slate-400 mt-1.5"> {/* Adjusted margin-top */} 
            {fitbitError ? (
              <p className="text-red-500/90 flex items-center">
                <Zap className="mr-1.5 h-3.5 w-3.5" /> {/* Using Zap as a generic error/alert icon here */}
                {fitbitError}
              </p>
            ) : isLoading && fitbitSteps === null ? ( // Show loading only if steps aren't yet available
              <p className="flex items-center">
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Loading steps...
              </p>
            ) : fitbitSteps !== null ? (
              <div className="w-64 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Footprints className="h-4 w-4 text-sky-500" />
                    <span className="text-slate-400">Today's Steps</span>
                  </div>
                  <span className="font-bold text-sky-400">{fitbitSteps.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-slate-400">Goal</span>
                  </div>
                  <span className="font-bold text-green-400">{dailyStepGoal.toLocaleString()}</span>
                </div>
                {dailyStepGoal > 0 && (
                  <div className="pt-1">
                    <Progress value={(fitbitSteps / dailyStepGoal) * 100} className="h-2" />
                  </div>
                )}
              </div>
            ) : (
              // If not loading, no error, and steps are null, show nothing or a generic message
              // Error state for "Connect Fitbit" is handled by fitbitError
              <p>Step data will appear here.</p> // Placeholder if needed
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0"> {/* Added flex-shrink-0 to prevent button squishing */} 
          <Button 
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            Refresh
          </Button>
          <Button 
            className="btn-fitness-primary"
            onClick={onStartWorkout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Selecting...
              </>
            ) : (
              <span className="flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Start Workout
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
