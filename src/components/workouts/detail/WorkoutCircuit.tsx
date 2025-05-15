
import React, { useState, useCallback } from 'react';
import { Activity, PlayCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            <h3 className="font-semibold text-lg">{exerciseData.name}</h3>
            
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
              
              {exercise.rest_seconds && (
                <Badge variant="outline" className="bg-muted">
                  {exercise.rest_seconds}s rest
                </Badge>
              )}
              
              {exerciseData.difficulty && (
                <Badge variant="outline" className="bg-muted capitalize">
                  {exerciseData.difficulty}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2 text-xs text-muted-foreground">
              {exerciseData.primary_equipment && (
                <span>{exerciseData.primary_equipment}</span>
              )}
              {exerciseData.primary_equipment && exerciseData.prime_mover_muscle && (
                <span>•</span>
              )}
              {exerciseData.prime_mover_muscle && (
                <span>{exerciseData.prime_mover_muscle}</span>
              )}
            </div>
            
            {exerciseData.description && (
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
          
          {exerciseData.short_youtube_demo && (
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
      {isLoading ? (
        <p>Loading exercises...</p>
      ) : (
        exercises?.map((exercise, index) => renderExerciseCard(exercise, index))
      )}
    </div>
  );
};

export default WorkoutCircuit;
