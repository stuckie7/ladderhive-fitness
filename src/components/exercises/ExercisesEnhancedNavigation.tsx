
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ListFilter, Grid3X3, Table2 } from "lucide-react";

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
        variant={currentView === "exercise-library" ? "default" : "outline"}
        size="sm"
        onClick={() => navigateToView("/exercise-library")}
        className="flex items-center"
      >
        <Grid3X3 className="h-4 w-4 mr-2" />
        Enhanced Exercise Library
      </Button>
      
      <Button
        variant={currentView === "exercises" ? "default" : "outline"}
        size="sm"
        onClick={() => navigateToView("/exercises")}
        className="flex items-center"
      >
        <Dumbbell className="h-4 w-4 mr-2" />
        Standard Exercise Library
      </Button>
      
      <Button
        variant={currentView === "exercises-full" ? "default" : "outline"}
        size="sm"
        onClick={() => navigateToView("/exercises-full")}
        className="flex items-center"
      >
        <Table2 className="h-4 w-4 mr-2" />
        Raw Exercise Data
      </Button>
    </div>
  );
};

export default ExercisesEnhancedNavigation;
