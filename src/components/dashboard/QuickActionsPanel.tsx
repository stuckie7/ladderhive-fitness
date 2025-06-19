
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, Plus, Activity } from "lucide-react";

const QuickActionsPanel: React.FC = () => {
  return (
    <Card className="col-span-1 glass-panel">
      <CardContent className="space-y-4 p-4">
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
