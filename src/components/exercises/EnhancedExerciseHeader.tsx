
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface EnhancedExerciseHeaderProps {
  onRefresh: () => void;
  onAddNew: () => void;
}

const EnhancedExerciseHeader = ({ onRefresh, onAddNew }: EnhancedExerciseHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Enhanced Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse, search, and manage your exercise database
        </p>
      </div>
      
      <div className="flex gap-2 mt-4 md:mt-0">
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </div>
    </div>
  );
};

export default EnhancedExerciseHeader;
