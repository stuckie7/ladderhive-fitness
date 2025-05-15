
import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddToWorkoutModal from './AddToWorkoutModal';

interface AddToWorkoutButtonProps extends ButtonProps {
  exerciseId: string | number;
  exerciseName: string;
}

const AddToWorkoutButton = ({ exerciseId, exerciseName, ...props }: AddToWorkoutButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        {...props}
      >
        <Plus className="mr-2 h-4 w-4" /> Add to Workout
      </Button>
      
      <AddToWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exerciseId={exerciseId.toString()}
        exerciseName={exerciseName}
      />
    </>
  );
};

export default AddToWorkoutButton;
