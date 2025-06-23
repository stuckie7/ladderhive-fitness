
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Dumbbell } from 'lucide-react';
import VideoEmbed from '@/components/workouts/detail/VideoEmbed';
import { getBestVideoUrl } from '@/utils/video';








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
  onExerciseComplete,
}) => {
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Workout Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {exercises.map((exercise) => (
            <AccordionItem key={exercise.id} value={exercise.id.toString()} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-left flex-1">
                    {exercise.exercise?.name || 'Exercise'}
                  </h3>
                  {completedExercises.includes(exercise.id) && (
                    <span className="text-xs text-green-500">Completed</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {/* Video demo */}
                {(() => {
                  const videoUrl = getBestVideoUrl(exercise.exercise);
                  if (!videoUrl) return null;
                  return (
                    <div className="mb-4">
                      <VideoEmbed videoUrl={videoUrl} />
                    </div>
                  );
                })()}

                {/* Specs grid */}
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

                {onExerciseComplete && (
                  <button
                    className="mt-4 px-4 py-2 text-sm rounded-md border hover:bg-accent"
                    onClick={() => onExerciseComplete(exercise.id)}
                  >
                    {completedExercises.includes(exercise.id) ? 'Undo Complete' : 'Mark Complete'}
                  </button>
                )}

                {(exercise.notes || exercise.trainer_notes) && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {exercise.notes || exercise.trainer_notes}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default WorkoutExerciseList;
