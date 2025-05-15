
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

interface ExerciseListItem {
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

interface ExerciseListProps {
  exercises: ExerciseListItem[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
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
                      url={exercise.demonstration} 
                      title={exercise.name || "Exercise Video"}
                      thumbnailUrl={exercise.thumbnailUrl} 
                    />
                  )}
                </TableCell>
                <TableCell>{exercise.reps}</TableCell>
                <TableCell>{exercise.weight || '-'}</TableCell>
                <TableCell>{exercise.restTime || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
