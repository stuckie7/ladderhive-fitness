
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, ActivitySquare, Brain } from "lucide-react";

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: string;
  timeNeeded: string;
  stressType: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

interface YogaWithBreathingProps {
  workout: Workout;
}

export const YogaWithBreathing = ({ workout }: YogaWithBreathingProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="overflow-hidden transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        <div className="relative h-48 md:h-full md:col-span-1 overflow-hidden">
          {workout.thumbnailUrl ? (
            <img 
              src={workout.thumbnailUrl} 
              alt={workout.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
              <ActivitySquare className="h-12 w-12 text-blue-500 dark:text-blue-300" />
            </div>
          )}
          
          {workout.videoUrl && isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity">
              <Button 
                variant="default"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => window.open(workout.videoUrl, "_blank")}
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-5 md:col-span-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{workout.title}</h3>
            <Badge>{workout.duration}</Badge>
          </div>
          
          <p className="text-muted-foreground my-3">{workout.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.timeNeeded}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <ActivitySquare className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.intensity}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Brain className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.stressType}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline">
              Start Practice
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
