
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Workout } from "@/types/workout";
import { Exercise } from "@/types/exercise";
import { useNavigate } from "react-router-dom";
import { useWorkouts } from "@/hooks/use-workouts";
import { useToast } from "@/hooks/use-toast";
import { Plus, Dumbbell, Edit } from "lucide-react";

interface AddToWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise;
}

export default function AddToWorkoutModal({
  open,
  onOpenChange,
  exercise,
}: AddToWorkoutModalProps) {
  const navigate = useNavigate();
  const { workouts, fetchWorkouts, isLoading } = useWorkouts();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch workouts when modal opens
  useEffect(() => {
    if (open) {
      fetchWorkouts();
    }
  }, [open, fetchWorkouts]);
  
  // Handle creating a new workout
  const handleCreateNewWorkout = () => {
    navigate(`/workout-builder?exercise=${exercise.id}`);
    onOpenChange(false);
  };
  
  // Handle adding to existing workout
  const handleAddToWorkout = (workoutId: string) => {
    navigate(`/workouts/${workoutId}/edit?addExercise=${exercise.id}`);
    toast({
      title: "Exercise added",
      description: `${exercise.name} has been added to your workout.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Workout</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Button 
            onClick={handleCreateNewWorkout}
            className="w-full mb-4 justify-start"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Workout with This Exercise
          </Button>
          
          <div className="text-sm font-medium mb-2">Or add to existing workout:</div>
          
          {isLoading ? (
            <div className="text-center py-4">Loading your workouts...</div>
          ) : workouts.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {workouts.map((workout) => (
                <Button
                  key={workout.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAddToWorkout(workout.id)}
                >
                  <span className="truncate mr-2">{workout.title}</span>
                  <Edit className="h-4 w-4" />
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Dumbbell className="mx-auto h-8 w-8 opacity-50 mb-2" />
              <p>You don't have any workouts yet</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
