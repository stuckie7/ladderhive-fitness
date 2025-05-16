
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoutineStep {
  exercise: string;
  duration: string;
  description?: string;
}

interface YogaRoutineProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  steps: RoutineStep[];
  thumbnailUrl?: string;
}

const YogaRoutineCard = ({
  id,
  title,
  description,
  duration,
  level,
  steps,
  thumbnailUrl
}: YogaRoutineProps) => {
  const navigate = useNavigate();
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const handleStartRoutine = () => {
    navigate(`/yoga/${id}`);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              {duration}
            </CardDescription>
          </div>
          <Badge className={getLevelColor(level)}>
            {level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Routine steps:</h4>
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li key={index} className="flex text-sm">
                <span className="font-medium mr-2">{index + 1}.</span>
                <div>
                  <span>{step.exercise}</span>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{step.duration}</span>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleStartRoutine}
        >
          <Play className="mr-2 h-4 w-4" /> 
          Start Routine
        </Button>
      </CardFooter>
    </Card>
  );
};

export default YogaRoutineCard;
