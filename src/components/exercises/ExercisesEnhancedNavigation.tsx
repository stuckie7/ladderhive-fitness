
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Table2, Dumbbell } from "lucide-react";

interface ExercisesEnhancedNavigationProps {
  currentView?: string;
}

const ExercisesEnhancedNavigation = ({ currentView }: ExercisesEnhancedNavigationProps) => {
  const navigate = useNavigate();

  const navigateToView = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={currentView === "workouts" ? "default" : "outline"}
        size="sm"
        onClick={() => navigateToView("/workouts")}
        className="flex items-center"
      >
        <Dumbbell className="h-4 w-4 mr-2" />
        Back to Workouts
      </Button>
    </div>
  );
};

export default ExercisesEnhancedNavigation;
