
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YoutubeEmbed } from "./YoutubeEmbed";
import { YogaWorkout } from "@/hooks/use-yoga-workouts";

interface YogaWorkoutCardProps {
  workout: YogaWorkout;
}

export const YogaWorkoutCard = ({ workout }: YogaWorkoutCardProps) => {
  const getDifficultyColor = (difficulty?: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-2">{workout.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          {workout.difficulty && (
            <Badge className={getDifficultyColor(workout.difficulty)}>
              {workout.difficulty}
            </Badge>
          )}
          
          {workout.body_region && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {workout.body_region}
            </span>
          )}
        </div>
        
        {workout.prime_mover_muscle && (
          <p className="text-sm mb-4">
            <span className="font-medium">Focus: </span>
            {workout.prime_mover_muscle}
          </p>
        )}
        
        {workout.youtube_thumbnail_url ? (
          <div className="relative mb-4 rounded-md overflow-hidden aspect-video">
            <img 
              src={workout.youtube_thumbnail_url} 
              alt={workout.name}
              className="object-cover w-full h-full"
            />
          </div>
        ) : workout.short_youtube_demo ? (
          <div className="mb-4">
            <YoutubeEmbed url={workout.short_youtube_demo} title={workout.name} />
          </div>
        ) : null}
        
        <div className="mt-auto flex gap-3">
          {workout.short_youtube_demo && (
            <a
              href={workout.short_youtube_demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Quick Demo
            </a>
          )}
          
          {workout.in_depth_youtube_exp && (
            <a
              href={workout.in_depth_youtube_exp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Full Tutorial
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
