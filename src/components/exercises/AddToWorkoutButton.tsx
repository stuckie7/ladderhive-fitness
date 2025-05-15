
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddToWorkoutModal from "./AddToWorkoutModal";
import { Exercise, ExerciseFull } from "@/types/exercise";

interface AddToWorkoutButtonProps {
  exercise: Exercise | ExerciseFull;
  variant?: "default" | "outline";
  className?: string;
}

export default function AddToWorkoutButton({
  exercise,
  variant = "default",
  className = ""
}: AddToWorkoutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button variant={variant} onClick={handleOpenModal} className={className}>
        <Plus className="h-4 w-4 mr-2" />
        Add to Workout
      </Button>
      
      <AddToWorkoutModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        exerciseId={exercise.id.toString()} 
        exerciseName={exercise.name}
      />
    </>
  );
}
