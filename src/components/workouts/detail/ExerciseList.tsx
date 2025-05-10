
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import ExerciseVideoHandler from '@/components/exercises/ExerciseVideoHandler';

interface WorkoutExercise {
  id: string;
  sets: number;
  reps: string | number;
  rest_seconds?: number;
  notes?: string;
  modifications?: string;
  exercise: {
    name: string;
    description?: string;
    video_demonstration_url?: string;
    short_youtube_demo?: string;
    youtube_thumbnail_url?: string;
  };
}

interface ExerciseListProps {
  exercises: WorkoutExercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  if (!exercises || exercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No exercises found for this workout</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-base font-medium">
                  {index + 1}. {exercise.exercise?.name || 'Unknown Exercise'}
                </h3>
                
                {/* Add video button if video URL is available */}
                {(exercise.exercise?.short_youtube_demo || exercise.exercise?.video_demonstration_url) && (
                  <ExerciseVideoHandler 
                    url={exercise.exercise?.short_youtube_demo || exercise.exercise?.video_demonstration_url} 
                    title={exercise.exercise?.name || 'Exercise Video'}
                    thumbnailUrl={exercise.exercise?.youtube_thumbnail_url}
                  />
                )}
              </div>
              
              <div className="flex justify-between items-center mb-1 mt-1">
                <span className="text-sm text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps}
                </span>
                {exercise.rest_seconds && (
                  <span className="text-sm text-muted-foreground">
                    Rest: {exercise.rest_seconds} sec
                  </span>
                )}
              </div>
              
              {exercise.notes && (
                <p className="text-sm text-muted-foreground mt-2">{exercise.notes}</p>
              )}
              
              {exercise.modifications && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Modifications:</span> 
                  <span className="text-muted-foreground"> {exercise.modifications}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
