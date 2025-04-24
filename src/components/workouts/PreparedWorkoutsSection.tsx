
import { Exercise } from "@/types/exercise";
import PreparedWorkoutsList from "./prepared-workouts/PreparedWorkoutsList";
import { useToast } from "@/components/ui/use-toast";

interface PreparedWorkoutsProps {
  currentWorkoutId: string | null;
  onAddExercise: (exercise: Exercise) => Promise<void>;
}

const PreparedWorkoutsSection = ({ currentWorkoutId, onAddExercise }: PreparedWorkoutsProps) => {
  const { toast } = useToast();
  
  const handleAddExercise = async (exercise: Exercise) => {
    if (!exercise) return;
    
    try {
      await onAddExercise(exercise);
      
      toast({
        title: "Exercise added",
        description: `${exercise.name} has been added to your workout`,
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise to workout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Prepared Workouts</h3>
      <PreparedWorkoutsList 
        currentWorkoutId={currentWorkoutId || null}
        onAddExercise={handleAddExercise}
      />
    </div>
  );
};

export default PreparedWorkoutsSection;
