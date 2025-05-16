import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExerciseFull } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExercisesFullTableProps {
  exercises: ExerciseFull[];
  isLoading: boolean;
  onEdit?: (exercise: ExerciseFull) => void;
  onDelete?: (exercise: ExerciseFull) => void;
}

const ExercisesFullTable = ({ exercises, isLoading, onEdit, onDelete }: ExercisesFullTableProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = useCallback((id: string | number) => {
    // Ensure the ID is a string for routing
    navigate(`/exercises/${id.toString()}`);
  }, [navigate]);
  
  const renderCell = (exercise: ExerciseFull, key: keyof ExerciseFull) => {
    let value = exercise[key];
    
    if (value === null || value === undefined) {
      return <TableCell className="text-muted-foreground">N/A</TableCell>;
    }
    
    if (typeof value === 'boolean') {
      value = value ? 'Yes' : 'No';
    }
    
    if (key === 'difficulty') {
      return (
        <TableCell>
          <Badge className="capitalize">{value}</Badge>
        </TableCell>
      );
    }
    
    return <TableCell>{String(value)}</TableCell>;
  };
  
  const handleEditClick = (e: React.MouseEvent, exercise: ExerciseFull) => {
    e.stopPropagation();
    if (onEdit) onEdit(exercise);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, exercise: ExerciseFull) => {
    e.stopPropagation();
    if (onDelete) onDelete(exercise);
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Muscle Group</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
            </TableRow>
          ) : exercises.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">No exercises found.</TableCell>
            </TableRow>
          ) : (
            exercises.map((exercise) => (
              <TableRow key={exercise.id} onClick={() => handleViewDetails(exercise.id)}>
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell>{exercise.prime_mover_muscle}</TableCell>
                <TableCell>{exercise.primary_equipment}</TableCell>
                {renderCell(exercise, 'difficulty')}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEditClick(e, exercise)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, exercise)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExercisesFullTable;
