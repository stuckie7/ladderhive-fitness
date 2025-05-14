
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Clock, PlayCircle } from "lucide-react";
import { YogaWorkout } from "@/hooks/use-yoga-workouts";
import { BreathingAnimation } from "./BreathingAnimation";
import { YoutubeEmbed } from "@/components/yoga/YoutubeEmbed";

interface YogaWithBreathingProps {
  workout: YogaWorkout & {
    timeCategory?: "quick" | "short" | "long" | null;
    stressCategory?: "work" | "sleep" | "refresh" | null;
    intensityCategory?: "gentle" | "moderate" | "restorative" | null;
  };
}

export const YogaWithBreathing = ({ workout }: YogaWithBreathingProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const getTimeDuration = (category: string | undefined | null) => {
    switch (category) {
      case "quick": return "5-10 minutes";
      case "short": return "10-20 minutes";
      case "long": return "20+ minutes";
      default: return "Variable duration";
    }
  };
  
  const getIntensityColor = (category: string | undefined | null) => {
    switch (category) {
      case "gentle": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "moderate": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "restorative": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  const getStressReliefType = (category: string | undefined | null) => {
    switch (category) {
      case "work": return "Work Stress Relief";
      case "sleep": return "Sleep Preparation";
      case "refresh": return "Energy Refresher";
      default: return "General Relief";
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all ${isExpanded ? "shadow-md" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle>{workout.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              {getTimeDuration(workout.timeCategory)}
            </CardDescription>
          </div>
          <Badge className={getIntensityColor(workout.intensityCategory)}>
            {workout.intensityCategory || workout.difficulty || "Moderate"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-transparent">
                {getStressReliefType(workout.stressCategory)}
              </Badge>
              {workout.prime_mover_muscle && (
                <Badge variant="outline" className="bg-transparent">
                  {workout.prime_mover_muscle}
                </Badge>
              )}
              {workout.body_region && (
                <Badge variant="outline" className="bg-transparent">
                  {workout.body_region}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              {isExpanded && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-3">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Benefits</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        This practice helps with {workout.body_region?.toLowerCase()} mobility and 
                        {workout.prime_mover_muscle 
                          ? ` strengthens ${workout.prime_mover_muscle.toLowerCase()}`
                          : " overall flexibility"
                        }. Great for mental focus and stress reduction.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {showVideo && workout.short_youtube_demo ? (
                <YoutubeEmbed url={workout.short_youtube_demo} title={workout.name} />
              ) : workout.youtube_thumbnail_url ? (
                <div 
                  className="relative rounded-md overflow-hidden cursor-pointer aspect-video"
                  onClick={() => setShowVideo(true)}
                >
                  <img 
                    src={workout.youtube_thumbnail_url} 
                    alt={workout.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                    <div className="bg-blue-500/90 rounded-full p-2 transition-transform hover:scale-110">
                      <PlayCircle className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          
          {isExpanded && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <BreathingAnimation className="w-24 h-24" />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Follow the animation to breathe
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
        
        <div className="flex gap-2">
          {workout.in_depth_youtube_exp && (
            <Button size="sm" variant="outline" asChild>
              <a 
                href={workout.in_depth_youtube_exp} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Full Tutorial
              </a>
            </Button>
          )}
          
          <Button size="sm">
            Start Practice
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
