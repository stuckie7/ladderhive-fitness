
import React, { useState, useCallback, useEffect } from 'react';
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
import ExercisePagination from './ExercisePagination';

interface ExercisesFullTableProps {
  exercises: ExerciseFull[];
  isLoading: boolean;
  onEdit?: (exercise: ExerciseFull) => void;
  onDelete?: (exercise: ExerciseFull) => void;
}

const ExercisesFullTable = ({ exercises: allExercises, isLoading, onEdit, onDelete }: ExercisesFullTableProps) => {
  const navigate = useNavigate();
  
  // Pagination state
  const [pagination, setPagination] = useState(() => {
    const savedPagination = localStorage.getItem('exercisesTablePagination');
    if (savedPagination) {
      try {
        return JSON.parse(savedPagination);
      } catch (e) {
        console.error('Error parsing saved pagination', e);
      }
    }
    return {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: allExercises.length,
      totalPages: Math.ceil(allExercises.length / 10),
    };
  });
  
  // Save pagination settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('exercisesTablePagination', JSON.stringify(pagination));
  }, [pagination]);
  
  // Update total items when exercises change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: allExercises.length,
      totalPages: Math.ceil(allExercises.length / prev.itemsPerPage),
      currentPage: allExercises.length === 0 ? 1 : Math.min(prev.currentPage, Math.ceil(allExercises.length / prev.itemsPerPage)),
    }));
  }, [allExercises]);
  
  // Get current page data
  const paginatedExercises = useCallback(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return allExercises.slice(start, end);
  }, [allExercises, pagination.currentPage, pagination.itemsPerPage]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => {
      const newTotalPages = Math.ceil(prev.totalItems / size);
      return {
        ...prev,
        itemsPerPage: size,
        totalPages: newTotalPages,
        currentPage: Math.min(prev.currentPage, newTotalPages || 1)
      };
    });
  };
  
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
  
  // Get current page exercises
  const currentExercises = paginatedExercises();
  
  return (
    <div className="space-y-4 w-full overflow-auto">
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
          ) : currentExercises.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">No exercises found.</TableCell>
            </TableRow>
          ) : (
            currentExercises.map((exercise) => (
              <TableRow key={exercise.id} onClick={() => handleViewDetails(exercise.id)} className="cursor-pointer">
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(exercise.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Add pagination */}
      {!isLoading && allExercises.length > 0 && (
        <ExercisePagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default ExercisesFullTable;
