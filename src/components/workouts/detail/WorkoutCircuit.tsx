
import React, { useState, useCallback } from 'react';
import { Activity, PlayCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutCircuitProps {
  exercises: any[];
  isLoading: boolean;
}

const WorkoutCircuit = ({ exercises, isLoading }: WorkoutCircuitProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWatchVideo = useCallback((url: string) => {
    setVideoUrl(url);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setVideoUrl(null);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg bg-card">
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex flex-wrap gap-2 mt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle empty exercises array
  if (!exercises || exercises.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg bg-card">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No exercises in this workout yet</h3>
        <p className="text-muted-foreground mt-2">
          This workout doesn't have any exercises added to it.
        </p>
      </div>
    );
  }

  const renderExerciseCard = (exercise: any, index: number) => {
    // Get the actual exercise data
    const exerciseData = exercise?.exercise || exercise;
    
    return (
      <div key={index} className="mb-6 p-4 border rounded-lg bg-card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {exerciseData?.youtube_thumbnail_url || exerciseData?.image_url ? (
              <div className="overflow-hidden rounded-md w-20 h-20">
                <img 
                  src={exerciseData.youtube_thumbnail_url || exerciseData.image_url} 
                  alt={exerciseData.name || "Exercise"} 
                  className="object-cover w-full h-full" 
                />
              </div>
            ) : (
              <div className="flex items-center justify-center bg-muted rounded-md w-20 h-20">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{exerciseData?.name || "Unknown Exercise"}</h3>
            
            <div className="flex flex-wrap gap-2 mt-1">
              {exercise.sets && (
                <Badge variant="outline" className="bg-muted">
                  {exercise.sets} sets
                </Badge>
              )}
              
              {exercise.reps && (
                <Badge variant="outline" className="bg-muted">
                  {exercise.reps} reps
                </Badge>
              )}
              
              {(exercise.rest_seconds || exercise.rest_time) && (
                <Badge variant="outline" className="bg-muted">
                  {exercise.rest_seconds || exercise.rest_time}s rest
                </Badge>
              )}
              
              {exerciseData?.difficulty && (
                <Badge variant="outline" className="bg-muted capitalize">
                  {exerciseData.difficulty}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2 text-xs text-muted-foreground">
              {exerciseData?.primary_equipment && (
                <span>{exerciseData.primary_equipment}</span>
              )}
              {exerciseData?.primary_equipment && exerciseData?.prime_mover_muscle && (
                <span>•</span>
              )}
              {exerciseData?.prime_mover_muscle && (
                <span>{exerciseData.prime_mover_muscle}</span>
              )}
            </div>
            
            {exerciseData?.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {exerciseData.description}
              </p>
            )}
            
            {exercise.notes && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                <strong>Notes:</strong> {exercise.notes}
              </div>
            )}
          </div>
          
          {exerciseData?.short_youtube_demo && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0"
              onClick={() => handleWatchVideo(exerciseData.short_youtube_demo)}
            >
              <PlayCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {exercises?.map((exercise, index) => renderExerciseCard(exercise, index))}
    </div>
  );
};

export default WorkoutCircuit;
