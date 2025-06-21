
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, Plus, Activity, Footprints } from "lucide-react";
import { HealthStats } from '@/hooks/use-fitbit-data';

interface QuickActionsPanelProps {
  fitbitStats?: Partial<HealthStats>;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ fitbitStats }) => {
  return (
    <Card className="col-span-1 glass-panel">
      <CardContent className="space-y-4 p-4">
        {fitbitStats?.steps !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div className="flex items-center">
              <Footprints className="mr-3 h-6 w-6 text-fitness-green" />
              <span className="font-medium text-white">Today's Steps</span>
            </div>
            <span className="font-bold text-xl text-fitness-green">{fitbitStats.steps.toLocaleString()}</span>
          </div>
        )}
        <Link to="/workout-builder">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-primary group">
            <Plus className="mr-2 h-5 w-5 text-fitness-primary group-hover:animate-pulse-soft" /> Create Workout
          </Button>
        </Link>
        <Link to="/workouts">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-primary group">
            <Dumbbell className="mr-2 h-5 w-5 text-fitness-primary group-hover:animate-pulse-soft" /> View Workouts
          </Button>
        </Link>
        <Link to="/schedule">
          <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-secondary group">
            <Calendar className="mr-2 h-5 w-5 text-fitness-secondary group-hover:animate-pulse-soft" /> Schedule
          </Button>
        </Link>
        <Link to="/exercises/enhanced">
          <Button 
            variant="outline" 
            className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-orange group"
          >
            <Dumbbell className="mr-2 h-5 w-5 text-fitness-orange group-hover:animate-pulse-soft" /> Exercise Library
          </Button>
        </Link>
        <Link to="/profile">
          <Button 
            variant="outline" 
            className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-green group"
          >
            <Activity className="mr-2 h-5 w-5 text-fitness-green group-hover:animate-pulse-soft" /> View Health Stats
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;
