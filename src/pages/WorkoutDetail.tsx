
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { useWorkoutExercises } from "@/hooks/use-workout-exercises";
import { Exercise } from "@/types/exercise";
import { validateUuid } from "@/hooks/workout-exercises/utils";

// Import our components
import WorkoutDetailHeader from "@/components/workouts/WorkoutDetailHeader";
import WorkoutDetailStats from "@/components/workouts/WorkoutDetailStats";
import WorkoutExerciseSection from "@/components/workouts/WorkoutExerciseSection";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    exercises: workoutExercises, 
    isLoading: exercisesLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout
  } = useWorkoutExercises(id);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "No workout ID provided",
          variant: "destructive",
        });
        setTimeout(() => navigate("/workouts"), 3000);
        return;
      }
      
      // Validate UUID format before making the request
      if (!validateUuid(id)) {
        console.error("Invalid UUID format:", id);
        toast({
          title: "Error",
          description: "Invalid workout ID format. Please check the URL.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/workouts"), 3000);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching workout with ID:", id);
        
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setWorkout(data);
        
        // Only fetch exercises if we have a valid workout
        if (data) {
          fetchWorkoutExercises(id);
        }
      } catch (error: any) {
        console.error("Error fetching workout:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load workout details",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/workouts");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id, toast, fetchWorkoutExercises, navigate]);

  const handleAddExercise = async (exercise: Exercise) => {
    if (!id) return;
    
    await addExerciseToWorkout(id, exercise);
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
            <p className="text-muted-foreground mb-6">The workout you're looking for doesn't exist or you don't have access to it.</p>
            <button onClick={() => navigate("/workouts")} className="px-4 py-2 bg-primary text-white rounded">
              Back to Workouts
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <WorkoutDetailHeader workout={workout} />
        
        <WorkoutDetailStats 
          duration={workout.duration} 
          exerciseCount={workoutExercises.length} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <WorkoutExerciseSection 
              workoutId={id}
              exercises={workoutExercises}
              isLoading={exercisesLoading}
              onAddExercise={handleAddExercise}
            />
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
    </AppLayout>
  );
};

export default WorkoutDetail;
