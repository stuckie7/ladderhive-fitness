
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Dumbbell, CalendarClock } from "lucide-react";

interface WorkoutDetailHeaderProps {
  title: string;
  description?: string;
  difficulty: string;
  duration: number;
  exerciseCount: number;
}

const WorkoutDetailHeader = ({ 
  title, 
  description, 
  difficulty, 
  duration,
  exerciseCount
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
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <Badge 
            className={`text-sm px-3 py-1 ${getDifficultyColor(difficulty)}`}
          >
            {difficulty}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{duration} minutes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <Dumbbell className="h-6 w-6 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Exercises</p>
              <p className="font-medium">{exerciseCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <CalendarClock className="h-6 w-6 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Next scheduled</p>
              <p className="font-medium">Not scheduled</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WorkoutDetailHeader;
