
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ExerciseVideoHandler from '@/components/exercises/ExerciseVideoHandler';
import { Exercise } from '@/types/exercise';

export interface ExerciseListItem {
  id: string;
  name: string;
  sets: number;
  reps: string | number;
  weight?: string;
  restTime?: number;
  description?: string;
  demonstration?: string;
  thumbnailUrl?: string;
}

export interface ExerciseListProps {
  exercises: ExerciseListItem[];
  onRemove?: (id: string) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onRemove }) => {
  // Create a minimal Exercise object for ExerciseVideoHandler
  const getExerciseForVideo = (item: ExerciseListItem): Exercise => {
    return {
      id: item.id,
      name: item.name,
      video_url: item.demonstration
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise List</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Sets</TableHead>
              <TableHead>Exercise</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Rest Time</TableHead>
              {onRemove && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell>{exercise.sets}</TableCell>
                <TableCell>
                  <div className="font-medium">{exercise.name}</div>
                  <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  {exercise.demonstration && (
                    <ExerciseVideoHandler 
                      exercise={getExerciseForVideo(exercise)} 
                      title={exercise.name || "Exercise Video"}
                    />
                  )}
                </TableCell>
                <TableCell>{exercise.reps}</TableCell>
                <TableCell>{exercise.weight || '-'}</TableCell>
                <TableCell>{exercise.restTime || '-'}</TableCell>
                {onRemove && (
                  <TableCell>
                    <button 
                      onClick={() => onRemove(exercise.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
