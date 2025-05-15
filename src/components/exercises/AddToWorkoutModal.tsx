
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSaving, setIsSaving] = useState(false);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const { toast } = useToast();

  // Fetch available workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      try {
        // Fetch user created workouts
        const { data: userWorkouts, error: userWorkoutsError } = await supabase
          .from("user_created_workouts")
          .select("*")
          .order("title");

        if (userWorkoutsError) throw userWorkoutsError;

        // Fetch prepared workouts
        const { data: preparedWorkouts, error: preparedWorkoutsError } = await supabase
          .from("prepared_workouts")
          .select("*")
          .order("title");

        if (preparedWorkoutsError) throw preparedWorkoutsError;

        // Combine both types of workouts
        const allWorkouts = [
          ...(userWorkouts || []),
          ...(preparedWorkouts || []),
        ];

        setWorkouts(allWorkouts);

        // If there's only one workout or a preselected workout, select it by default
        if (preselectedWorkoutId) {
          setSelectedWorkoutId(preselectedWorkoutId);
        } else if (allWorkouts.length === 1) {
          setSelectedWorkoutId(allWorkouts[0].id);
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
        toast({
          title: "Error",
          description: "Failed to load workouts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchWorkouts();
    }
  }, [open, preselectedWorkoutId, toast]);

  const handleAddToWorkout = async () => {
    if (!selectedWorkoutId) {
      toast({
        title: "Error",
        description: "Please select a workout",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Determine if this is a prepared workout or user workout
      const isPreparedWorkout = selectedWorkoutId.startsWith('prepared_') || 
                               workouts.some(w => w.id === selectedWorkoutId && 'difficulty' in w);
      
      // Convert exerciseId to number if it's numeric
      const exerciseIdValue = !isNaN(Number(exerciseId)) ? Number(exerciseId) : null;
      
      if (!exerciseIdValue) {
        throw new Error("Invalid exercise ID");
      }
      
      // Get the order index (number of existing exercises)
      let existingExercisesCount = 0;
      if (isPreparedWorkout) {
        const { count } = await supabase
          .from("prepared_workout_exercises")
          .select("*", { count: "exact" })
          .eq("workout_id", selectedWorkoutId);
        existingExercisesCount = count || 0;
      } else {
        const { count } = await supabase
          .from("user_created_workout_exercises")
          .select("*", { count: "exact" })
          .eq("workout_id", selectedWorkoutId);
        existingExercisesCount = count || 0;
      }

      // Add exercise to the appropriate table
      if (isPreparedWorkout) {
        const { error } = await supabase
          .from("prepared_workout_exercises")
          .insert({
            workout_id: selectedWorkoutId,
            exercise_id: exerciseIdValue,
            sets: parseInt(sets),
            reps: reps,
            rest_seconds: 60, // Default rest time
            order_index: existingExercisesCount
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_created_workout_exercises")
          .insert({
            workout_id: selectedWorkoutId,
            exercise_id: exerciseIdValue,
            sets: parseInt(sets),
            reps: reps,
            rest_seconds: 60, // Default rest time
            order_index: existingExercisesCount
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Added ${exerciseName} to workout`,
      });
      
      onOpenChange(false); // Close modal
    } catch (error: any) {
      console.error("Error adding exercise to workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise to workout",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Workout</DialogTitle>
          <DialogDescription>
            Add "{exerciseName}" to one of your workouts
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="workout">Select Workout</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : workouts.length > 0 ? (
              <Select
                value={selectedWorkoutId}
                onValueChange={setSelectedWorkoutId}
              >
                <SelectTrigger id="workout">
                  <SelectValue placeholder="Select a workout" />
                </SelectTrigger>
                <SelectContent>
                  {workouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      {workout.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                No workouts found. Create a workout first.
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                min="1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="e.g., 10 or 10-12"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToWorkout} disabled={isSaving || !selectedWorkoutId}>
            {isSaving ? (
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
