
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string | number;
  rest_seconds?: number;
  exercise?: {
    name?: string;
    description?: string;
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
                  {index + 1}. {exercise.exercise?.name || exercise.name}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps}
                </span>
              </div>
              {exercise.exercise?.description && (
                <p className="text-sm text-muted-foreground">{exercise.exercise.description}</p>
              )}
              {exercise.rest_seconds && (
                <div className="mt-1 text-sm text-muted-foreground">
                  Rest: {exercise.rest_seconds} seconds
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
