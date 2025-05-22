
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Dumbbell, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import ExerciseVideoHandler from '@/components/exercises/ExerciseVideoHandler';

interface Exercise {
  id: string;
  name: string;
  video_url?: string;
  thumbnail_url?: string;
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  video_demonstration_url?: string;
  video_explanation_url?: string;
  image_url?: string;
}

interface WorkoutExercise {
  id: string;
  workout_id?: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: number | string;
  rest_seconds?: number;
  rest_time?: number;
  notes?: string;
  trainer_notes?: string;
  order_index: number;
}

interface WorkoutExerciseListProps {
  exercises: WorkoutExercise[];
  completedExercises?: string[];
  onExerciseComplete?: (exerciseId: string) => void;
}

const WorkoutExerciseList: React.FC<WorkoutExerciseListProps> = ({ 
  exercises, 
  completedExercises = [],
  onExerciseComplete 
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Workout Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div 
              key={exercise.id} 
              className={cn(
                "bg-card p-4 rounded-lg border",
                completedExercises.includes(exercise.id) ? "border-green-500" : "border-muted"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{exercise.exercise?.name || "Exercise"}</h3>
                </div>
                {onExerciseComplete && (
                  <Button
                    variant={completedExercises.includes(exercise.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => onExerciseComplete(exercise.id)}
                    className={completedExercises.includes(exercise.id) ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {completedExercises.includes(exercise.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Completed
                      </>
                    ) : (
                      "Mark Complete"
                    )}
                  </Button>
                )}
              </div>

              {exercise.exercise && (
                <div className="mb-4 relative group cursor-pointer" onClick={() => {
                  const videoUrl = exercise.exercise?.short_youtube_demo || 
                                 exercise.exercise?.video_explanation_url || 
                                 exercise.exercise?.video_demonstration_url ||
                                 exercise.exercise?.video_url;
                  if (videoUrl) {
                    window.open(videoUrl, '_blank');
                  }
                }}>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={exercise.exercise.thumbnail_url || exercise.exercise.image_url || '/placeholder-exercise.jpg'} 
                      alt={exercise.exercise.name}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <Play className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Sets</span>
                  <span className="font-medium">{exercise.sets}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Reps</span>
                  <span className="font-medium">{exercise.reps}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Rest Time</span>
                  <span className="font-medium">{exercise.rest_seconds || exercise.rest_time || 60} sec</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Order</span>
                  <span className="font-medium">{exercise.order_index}</span>
                </div>
              </div>

              {(exercise.notes || exercise.trainer_notes) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {exercise.notes || exercise.trainer_notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutExerciseList;
