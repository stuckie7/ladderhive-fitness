
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useWorkoutExercises } from "@/hooks/use-workout-exercises";
import { Exercise } from "@/types/exercise";
import { validateUuid } from "@/hooks/workout-exercises/utils";
import { useWorkouts } from "@/hooks/use-workouts";

// Import our components
import WorkoutDetailHeader from "@/components/workouts/WorkoutDetailHeader";
import WorkoutDetailStats from "@/components/workouts/WorkoutDetailStats";
import WorkoutExerciseSection from "@/components/workouts/WorkoutExerciseSection";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";

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
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    exercises: workoutExercises, 
    isLoading: exercisesLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout
  } = useWorkoutExercises(id);
  
  const { 
    saveWorkout, 
    unsaveWorkout, 
    completeWorkout,
    isLoading: workoutActionLoading 
  } = useWorkouts();

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
        
        // Fetch the workout details
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (workoutError) throw workoutError;
        
        setWorkout(workoutData);
        
        // Check if the workout is saved by the current user
        const { data: userWorkout, error: userWorkoutError } = await supabase
          .from('user_workouts')
          .select('id')
          .eq('workout_id', id)
          .eq('status', 'saved')
          .maybeSingle();
        
        if (!userWorkoutError && userWorkout) {
          setIsSaved(true);
        }
        
        // Only fetch exercises if we have a valid workout
        if (workoutData) {
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

  const handleSaveWorkout = async () => {
    if (!id) return;
    
    if (isSaved) {
      const result = await unsaveWorkout(id);
      if (result.success) {
        setIsSaved(false);
      }
    } else {
      const result = await saveWorkout(id);
      if (result.success) {
        setIsSaved(true);
      }
    }
  };

  const handleCompleteWorkout = async () => {
    if (!id) return;
    
    const result = await completeWorkout(id);
    if (result.success) {
      toast({
        title: "Workout Completed",
        description: "Great job! Your workout has been recorded.",
      });
      
      setTimeout(() => {
        navigate("/workouts");
      }, 2000);
    }
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
        
        <div className="flex justify-end gap-3 mb-6">
          <Button 
            variant={isSaved ? "outline" : "default"}
            onClick={handleSaveWorkout}
            disabled={workoutActionLoading}
            className={isSaved ? "border-fitness-primary text-fitness-primary" : "bg-fitness-primary hover:bg-fitness-primary/90"}
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Workout
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleCompleteWorkout}
            disabled={workoutActionLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
        </div>
        
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
