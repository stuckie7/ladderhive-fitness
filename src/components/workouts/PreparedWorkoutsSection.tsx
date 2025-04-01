
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Dumbbell, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Exercise } from "@/types/exercise";
import { Workout } from "@/types/workout";
import { WorkoutExercise, mapSupabaseExerciseToExercise } from "@/hooks/workout-exercises/utils";

interface PreparedWorkoutsProps {
  currentWorkoutId: string;
  onAddExercise: (exercise: Exercise) => Promise<void>;
}

const PreparedWorkoutsSection = ({ currentWorkoutId, onAddExercise }: PreparedWorkoutsProps) => {
  const [preparedWorkouts, setPreparedWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Record<string, WorkoutExercise[]>>({});
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch prepared workouts from Supabase
  useEffect(() => {
    const fetchPreparedWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .neq('id', currentWorkoutId) // Exclude current workout
          .limit(5);
        
        if (error) throw error;
        
        setPreparedWorkouts(data);
        
        // Load exercises for all prepared workouts immediately
        if (data && data.length > 0) {
          // Immediately load exercises for the first workout to show something by default
          if (data[0]) {
            setExpandedWorkout(data[0].id);
            fetchWorkoutExercises(data[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching prepared workouts:", error);
        toast({
          title: "Error",
          description: "Failed to load prepared workouts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreparedWorkouts();
  }, [currentWorkoutId, toast]);

  // Fetch exercises for a specific workout when expanded
  const fetchWorkoutExercises = async (workoutId: string) => {
    if (workoutExercises[workoutId]?.length > 0) return; // Already loaded
    
    setLoadingExercises(prev => ({ ...prev, [workoutId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our WorkoutExercise type
      const mappedExercises: WorkoutExercise[] = data.map(item => ({
        id: item.id,
        workout_id: item.workout_id,
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        rest_time: item.rest_time,
        order_index: item.order_index,
        exercise: item.exercise ? mapSupabaseExerciseToExercise(item.exercise) : undefined
      }));
      
      // Update the workoutExercises state with the new data
      setWorkoutExercises((prev) => {
        const updatedState = { ...prev };
        updatedState[workoutId] = mappedExercises;
        return updatedState;
      });
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load workout exercises",
        variant: "destructive",
      });
    } finally {
      setLoadingExercises(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  const toggleExpand = (workoutId: string) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
      fetchWorkoutExercises(workoutId);
    }
  };

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

  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Prepared Workouts</h3>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (preparedWorkouts.length === 0) {
    return null; // Don't show section if no prepared workouts
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Prepared Workouts</h3>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {preparedWorkouts.map((workout) => (
              <div key={workout.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{workout.title}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{workout.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {workout.duration} min • {workout.exercises} exercises
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => toggleExpand(workout.id)}
                  >
                    {expandedWorkout === workout.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {expandedWorkout === workout.id && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-3 animate-in fade-in-50">
                    {loadingExercises[workout.id] ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex justify-between">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : workoutExercises[workout.id]?.length > 0 ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          {workout.description || "No description available."}
                        </p>
                        {workoutExercises[workout.id].map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.exercise?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.sets} sets × {item.reps} reps
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => item.exercise && handleAddExercise(item.exercise)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No exercises found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreparedWorkoutsSection;
