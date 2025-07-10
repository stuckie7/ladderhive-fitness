import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Loader2, Footprints, Target } from "lucide-react"; // Added Footprints icon
import { AppTitle } from "@/components/ui/AppTitle";
import { Progress } from "@/components/ui/progress";

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onStartWorkout: () => void;
  fitbitStats: { [key: string]: any } | null;
  isFitbitConnected: boolean;
  fitbitError: string | null;
  dailyStepGoal?: number;
  onStepGoalChange: (newGoal: number) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isLoading, 
  onRefresh,
  onStartWorkout,
  fitbitStats,
  isFitbitConnected,
  fitbitError,
  dailyStepGoal = 10000,
  onStepGoalChange
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
            ) : isLoading && !fitbitStats ? (
              <p className="flex items-center">
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Loading Fitbit data...
              </p>
            ) : isFitbitConnected && fitbitStats ? (
              <div className="w-64 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Footprints className="h-4 w-4 text-sky-500" />
                    <span className="text-slate-400">Today's Steps</span>
                  </div>
                  <span className="font-bold text-sky-400">{fitbitStats.steps?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-slate-400">Goal</span>
                  </div>
                  <span className="font-bold text-green-400">{dailyStepGoal.toLocaleString()}</span>
                </div>
                {/* Simple input for step goal change - can be styled better later */}
                <div className="flex items-center justify-between text-xs mt-1">
                  <label htmlFor="stepGoalInput" className="text-slate-400">Set Goal:</label>
                  <input 
                    type="number" 
                    id="stepGoalInput"
                    value={dailyStepGoal}
                    onChange={(e) => {
                      const newGoal = parseInt(e.target.value, 10);
                      if (!isNaN(newGoal) && newGoal > 0) {
                        onStepGoalChange(newGoal);
                      }
                    }}
                    className="w-20 p-1 text-right bg-slate-700 text-white rounded border border-slate-600 focus:ring-sky-500 focus:border-sky-500"
                    min="1"
                  />
                </div>
                {dailyStepGoal > 0 && fitbitStats.steps !== null && (
                  <div className="pt-1">
                    <Progress value={(fitbitStats.steps / dailyStepGoal) * 100} className="h-2" />
                  </div>
                )}
                {/* Display additional Fitbit metrics */}
                {fitbitStats.calories !== null && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">Calories Burned:</span>
                    <span className="font-semibold text-orange-400">{fitbitStats.calories?.toLocaleString()} kcal</span>
                  </div>
                )}
                {fitbitStats.distance !== null && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-semibold text-purple-400">{fitbitStats.distance?.toFixed(2)} km</span>
                  </div>
                )}
                {fitbitStats.activeMinutes !== null && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">Active Minutes:</span>
                    <span className="font-semibold text-yellow-400">{fitbitStats.activeMinutes} min</span>
                  </div>
                )}
              </div>
            ) : (
              <p>Connect your Fitbit to see your stats.</p>
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
