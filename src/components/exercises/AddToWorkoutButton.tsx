
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddToWorkoutModal from "./AddToWorkoutModal";
import { Exercise, ExerciseFull } from "@/types/exercise";

interface AddToWorkoutButtonProps {
  exerciseId?: string;
  exerciseName?: string;
  exercise?: Exercise | ExerciseFull;
  variant?: "default" | "outline";
  className?: string;
}

export default function AddToWorkoutButton({
  exerciseId,
  exerciseName,
  exercise,
  variant = "default",
  className = ""
}: AddToWorkoutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract ID and name from either direct props or exercise object
  const id = exerciseId || (exercise?.id?.toString() || "");
  const name = exerciseName || (exercise?.name || "Exercise");

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
        exerciseId={id}
        exerciseName={name}
      />
    </>
  );
}
