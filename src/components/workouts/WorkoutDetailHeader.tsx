
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";

interface WorkoutDetailHeaderProps {
  title: string;
  description?: string;
  isSaved: boolean;
  isLoading: boolean;
  onToggleSave: () => Promise<void>;
  onStartWorkout: () => Promise<void>;
}

const WorkoutDetailHeader = ({ 
  title, 
  description, 
  isSaved,
  isLoading,
  onToggleSave,
  onStartWorkout
}: WorkoutDetailHeaderProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'elite':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onToggleSave}
          disabled={isLoading}
          className={isSaved ? "text-amber-500" : ""}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
        
        <Button 
          className="bg-fitness-primary hover:bg-fitness-primary/90"
          onClick={onStartWorkout}
          disabled={isLoading}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutDetailHeader;
