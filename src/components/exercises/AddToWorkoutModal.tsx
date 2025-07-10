
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { getUserWorkouts, addExerciseToWorkout, createWorkout } from "@/hooks/workout-library/services/workout-service";

interface AddToWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseId: string;
  exerciseName: string;
  workoutId?: string;
}

export default function AddToWorkoutModal({
  open,
  onOpenChange,
  exerciseId,
  exerciseName,
  workoutId: preselectedWorkoutId,
}: AddToWorkoutModalProps) {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(preselectedWorkoutId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchWorkouts();
    }
  }, [open, preselectedWorkoutId, toast]);

  const fetchWorkouts = async () => {
    try {
      const workoutsData = await getUserWorkouts();
      setWorkouts(workoutsData || []);
      
      if (preselectedWorkoutId) {
        setSelectedWorkoutId(preselectedWorkoutId);
      } else if (workoutsData && workoutsData.length === 1) {
        setSelectedWorkoutId(workoutsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive",
      });
    }
  };

  const handleAddToWorkout = async () => {
    if (!selectedWorkoutId || !sets || !reps) return;

    setIsLoading(true);
    try {
      const isPreparedWorkout = selectedWorkoutId.startsWith('prepared_');

      if (isPreparedWorkout) {
        // For prepared workouts, create a new user workout
        const workout = await createWorkout(
          selectedWorkoutId.replace('prepared_', ''),
          [{
            exercise_id: exerciseId,
            sets,
            reps: reps.toString(),
            rest_seconds: 60,
            order_index: 0
          }]
        );
      } else {
        // For existing user workouts, just add the exercise
        await addExerciseToWorkout(
          selectedWorkoutId,
          exerciseId,
          sets,
          reps.toString(),
          60, // Default rest time
          0 // Order index
        );
      }

      toast({
        title: "Success",
        description: `${exerciseName} has been added to your workout!`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      toast({
        title: "Error",
        description: "Failed to add exercise to workout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Workout</DialogTitle>
          <DialogDescription>
            Add {exerciseName} to your workout
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workout" className="text-right">
              Workout
            </Label>
            <Select
              value={selectedWorkoutId}
              onValueChange={setSelectedWorkoutId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workout" />
              </SelectTrigger>
              <SelectContent>
                {workouts.map((workout) => (
                  <SelectItem key={workout.id} value={workout.id}>
                    {workout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sets" className="text-right">
              Sets
            </Label>
            <Input
              id="sets"
              type="number"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reps" className="text-right">
              Reps
            </Label>
            <Input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToWorkout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Workout"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
