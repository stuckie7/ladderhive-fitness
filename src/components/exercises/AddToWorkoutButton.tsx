
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { Exercise } from "@/types/exercise";
import AddToWorkoutModal from "./AddToWorkoutModal";
import { useAddToWorkout } from "@/hooks/use-add-to-workout";

interface AddToWorkoutButtonProps {
  exercise: Exercise;
  variant?: "default" | "outline";
  className?: string;
}

export default function AddToWorkoutButton({ 
  exercise, 
  variant = "default",
  className = ""
}: AddToWorkoutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isRecentlyAdded } = useAddToWorkout();
  const isAdded = isRecentlyAdded(exercise.id);

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        className={className}
        disabled={isAdded}
      >
        {isAdded ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Added!
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add to Workout
          </>
        )}
      </Button>
      
      <AddToWorkoutModal
        exercise={exercise}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
