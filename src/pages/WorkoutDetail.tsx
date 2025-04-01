
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import ExerciseList from "@/components/workouts/ExerciseList";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell, CalendarClock, Plus } from "lucide-react";
import { useWorkoutExercises } from "@/hooks/use-workout-exercises";
import ExerciseSearchModal from "@/components/exercises/ExerciseSearchModal";
import { Exercise } from "@/types/exercise";

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exercises: number;
  difficulty: string;
}

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { toast } = useToast();
  const { 
    exercises: workoutExercises, 
    isLoading: exercisesLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout
  } = useWorkoutExercises(id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'elite':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setWorkout(data);
        
        // Fetch exercises for this workout
        fetchWorkoutExercises(id);
      } catch (error: any) {
        console.error("Error fetching workout:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load workout details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id, toast, fetchWorkoutExercises]);

  const handleAddExercise = async (exercise: Exercise) => {
    if (!id) return;
    
    await addExerciseToWorkout(id, exercise);
    setSearchModalOpen(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workout) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
          <p>The workout you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </AppLayout>
    );
  }

  // Convert workoutExercises to the format expected by ExerciseList
  const exerciseListItems = workoutExercises.map(we => ({
    id: we.id,
    name: we.exercise?.name || "Unknown Exercise",
    sets: we.sets,
    reps: we.reps,
    weight: we.weight,
    restTime: we.rest_time,
    description: we.exercise?.description,
    demonstration: we.exercise?.image_url
  }));

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{workout.title}</h1>
            <p className="text-muted-foreground mt-1">{workout.description}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Badge 
              className={`text-sm px-3 py-1 ${getDifficultyColor(workout.difficulty)}`}
            >
              {workout.difficulty}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center">
              <Clock className="h-6 w-6 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{workout.duration} minutes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center">
              <Dumbbell className="h-6 w-6 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Exercises</p>
                <p className="font-medium">{workoutExercises.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center">
              <CalendarClock className="h-6 w-6 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Next scheduled</p>
                <p className="font-medium">Not scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Workout Exercises</h2>
              <Button onClick={() => setSearchModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>
            
            {exercisesLoading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            ) : workoutExercises.length > 0 ? (
              <ExerciseList exercises={exerciseListItems} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No exercises yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    This workout doesn't have any exercises yet. Add some to get started.
                  </p>
                  <Button onClick={() => setSearchModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutProgress 
                  totalExercises={workoutExercises.length} 
                  completedExercises={0}
                  duration={workout?.duration || 0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ExerciseSearchModal 
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onAddExercise={handleAddExercise}
        workoutId={id}
      />
    </AppLayout>
  );
};

export default WorkoutDetail;
