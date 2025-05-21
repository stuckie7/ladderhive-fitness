import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoIcon, Clock, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  video_url?: string;
  sets: number;
  reps: number;
  rest_time: number;
  trainer_notes?: string;
  order_index: number;
}

interface WorkoutExerciseListProps {
  exercises: WorkoutExercise[];
  onExerciseComplete?: (exerciseId: string) => void;
}

const WorkoutExerciseList: React.FC<WorkoutExerciseListProps> = ({ exercises, onExerciseComplete }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Workout Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-fitness-secondary" />
                  <h3 className="font-medium">{exercise.exercise_name}</h3>
                </div>
                {onExerciseComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExerciseComplete(exercise.id)}
                  >
                    Complete
                  </Button>
                )}
              </div>

              {exercise.video_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <video
                    src={exercise.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
                  <span className="font-medium">{exercise.rest_time} sec</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Order</span>
                  <span className="font-medium">{exercise.order_index}</span>
                </div>
              </div>

              {exercise.trainer_notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Trainer Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {exercise.trainer_notes}
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
