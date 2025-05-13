
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";

// Updated interface to match the actual data structure from useWorkoutDetailEnhanced
interface WorkoutExercise {
  id: string;
  sets: number;
  reps: string | number;
  rest_seconds?: number;
  notes?: string;
  modifications?: string;
  order_index: number;
  exercise: {
    id: number | string;
    name: string;
    description?: string;
    video_demonstration_url?: string;
    short_youtube_demo?: string;
    youtube_thumbnail_url?: string;
  };
}

interface WorkoutCircuitProps {
  exercises: WorkoutExercise[];
}

const WorkoutCircuit: React.FC<WorkoutCircuitProps> = ({ exercises }) => {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    if (expandedExerciseId === id) {
      setExpandedExerciseId(null);
    } else {
      setExpandedExerciseId(id);
    }
  };

  const toggleCompleted = (id: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedExercises(newCompleted);
  };

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No exercises in this workout.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Circuit</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {exercises.map((exercise, index) => {
            const exerciseName = exercise.exercise?.name || '';
            const isExpanded = expandedExerciseId === exercise.id;
            const isCompleted = completedExercises.has(exercise.id);
            const videoUrl = exercise.exercise?.video_demonstration_url || 
                            exercise.exercise?.short_youtube_demo;
            const thumbnailUrl = exercise.exercise?.youtube_thumbnail_url;
            
            return (
              <div 
                key={exercise.id} 
                className={`p-4 transition-colors ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-1 min-w-[32px] h-8 mr-2 ${
                        isCompleted ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                      onClick={() => toggleCompleted(exercise.id)}
                    >
                      <CheckCircle2 className={`h-5 w-5 ${isCompleted ? 'fill-green-500 text-white' : ''}`} />
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {index + 1}. {exerciseName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.rest_seconds && ` • ${exercise.rest_seconds}s rest`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => toggleExpanded(exercise.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pl-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        {exercise.exercise?.description && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Instructions</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.exercise.description}
                            </p>
                          </div>
                        )}
                        
                        {exercise.notes && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                          </div>
                        )}
                        
                        {exercise.modifications && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Modifications</h4>
                            <p className="text-sm text-muted-foreground">{exercise.modifications}</p>
                          </div>
                        )}
                      </div>
                      
                      {videoUrl && (
                        <div className="flex justify-center md:justify-end">
                          <ExerciseVideoHandler 
                            url={videoUrl}
                            thumbnailUrl={thumbnailUrl}
                            className="max-w-[240px] max-h-[180px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCircuit;
