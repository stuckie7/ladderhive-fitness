
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Copy, Save } from "lucide-react";

export interface WorkoutBuilderHeaderProps {
  id?: string;
  isSaving: boolean;
  handleSave: () => Promise<any>; // Change to accept any return type
  handleCreateTemplate: () => Promise<any>; // Change to accept any return type
  setIsTemplateDialogOpen: (open: boolean) => void;
  resetWorkout: () => void;
}

const WorkoutBuilderHeader: React.FC<WorkoutBuilderHeaderProps> = ({
  id,
  isSaving,
  handleSave,
  handleCreateTemplate,
  setIsTemplateDialogOpen,
  resetWorkout
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/workouts')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold gradient-heading">
          {id ? "Edit Workout" : "Create New Workout"}
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={() => setIsTemplateDialogOpen(true)}
          className="flex items-center gap-1"
          disabled={isSaving}
        >
          <BookOpen className="h-4 w-4" />
          Templates
        </Button>
        <Button 
          variant="outline" 
          onClick={handleCreateTemplate}
          className="flex items-center gap-1"
          disabled={isSaving}
        >
          <Copy className="h-4 w-4" />
          Save as Template
        </Button>
        <Button 
          variant="outline" 
          onClick={resetWorkout}
          disabled={isSaving}
        >
          Reset
        </Button>
        <Button 
          className="btn-fitness-primary" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Workout"}
        </Button>
      </div>
    </div>
  );
};

export default WorkoutBuilderHeader;
