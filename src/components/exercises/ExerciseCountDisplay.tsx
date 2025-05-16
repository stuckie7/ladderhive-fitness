
import React from "react";

interface ExerciseCountDisplayProps {
  count: number;
  currentPage: number;
  itemsPerPage: number;
  totalCount: number;
}

const ExerciseCountDisplay = ({ 
  count, 
  currentPage, 
  itemsPerPage, 
  totalCount 
}: ExerciseCountDisplayProps) => {
  if (count === 0) return null;
  
  return (
    <p className="mb-4 text-muted-foreground">
      Showing {count} exercises {totalCount > 0 ? 
        `(${currentPage * itemsPerPage + 1}-${Math.min((currentPage + 1) * itemsPerPage, totalCount)} of ${totalCount})` 
        : ''}
    </p>
  );
};

export default ExerciseCountDisplay;
