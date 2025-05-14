
import { useState } from "react";
import { Exercise } from "@/types/exercise";
import { useToast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";

export function useAddToWorkout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentlyAddedExercise, setRecentlyAddedExercise] = useState<Exercise | null>(null);
  const { toast } = useToast();

  const handleAddToWorkout = (exercise: Exercise) => {
    setIsModalOpen(true);
  };

  const handleExerciseAdded = (exercise: Exercise) => {
    setRecentlyAddedExercise(exercise);
    
    // Show toast with undo option - using a function to create the action element
    // This avoids using JSX directly in the .ts file
    toast({
      title: "Exercise Added",
      description: `${exercise.name} was added to your workout`,
      action: function UndoButton() {
        return {
          altText: "Undo",
          onClick: () => handleUndoAdd(),
          className: "bg-primary text-primary-foreground px-2 py-1 rounded text-xs",
          children: "Undo"
        } as ToastActionElement;
      }()
    });
    
    // Clear the recently added status after 3 seconds
    setTimeout(() => {
      setRecentlyAddedExercise(null);
    }, 3000);
  };

  const handleUndoAdd = () => {
    // Logic to undo the add operation
    setRecentlyAddedExercise(null);
    
    toast({
      title: "Undone",
      description: "Exercise was removed from workout",
    });
  };

  const isRecentlyAdded = (exerciseId: string): boolean => {
    return recentlyAddedExercise?.id === exerciseId;
  };

  return {
    isModalOpen,
    setIsModalOpen,
    handleAddToWorkout,
    handleExerciseAdded,
    isRecentlyAdded,
  };
}
