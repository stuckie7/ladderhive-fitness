
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ExerciseList from "@/components/workouts/ExerciseList";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Pause, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock workout data
const workoutData = {
  id: "1",
  title: "Full Body Strength",
  description: "Build strength with this full body workout focusing on compound movements.",
  duration: 45,
  difficulty: "Intermediate",
  exercises: [
    {
      id: "ex1",
      name: "Barbell Squat",
      sets: 4,
      reps: 8,
      weight: "70% 1RM",
      restTime: 90,
      description: "Stand with feet shoulder-width apart, barbell resting on traps. Bend knees and lower until thighs are parallel to ground, then return to starting position."
    },
    {
      id: "ex2",
      name: "Bench Press",
      sets: 4,
      reps: 8,
      weight: "70% 1RM",
      restTime: 90,
      description: "Lie on bench with feet flat on floor. Grip barbell slightly wider than shoulder width. Lower bar to chest, then press back up to starting position."
    },
    {
      id: "ex3",
      name: "Bent-Over Row",
      sets: 3,
      reps: 10,
      weight: "60% 1RM",
      restTime: 60,
      description: "Bend at hips until torso is almost parallel to floor, back straight. Pull barbell to lower chest, then lower back to starting position."
    },
    {
      id: "ex4",
      name: "Overhead Press",
      sets: 3,
      reps: 10,
      weight: "60% 1RM",
      restTime: 60,
      description: "Stand with feet shoulder-width apart, barbell at shoulder height. Press bar overhead until arms are fully extended, then lower back to starting position."
    },
    {
      id: "ex5",
      name: "Romanian Deadlift",
      sets: 3,
      reps: 12,
      weight: "60% 1RM",
      restTime: 60,
      description: "Stand with feet hip-width apart, holding barbell at thighs. Hinge at hips, keeping back straight, until barbell is just below knees, then return to starting position."
    },
    {
      id: "ex6",
      name: "Dumbbell Bicep Curl",
      sets: 3,
      reps: 12,
      weight: "Moderate",
      restTime: 45,
      description: "Stand with feet shoulder-width apart, holding dumbbells at sides. Curl weights to shoulders, then lower back to starting position."
    },
    {
      id: "ex7",
      name: "Tricep Pushdown",
      sets: 3,
      reps: 12,
      weight: "Moderate",
      restTime: 45,
      description: "Stand facing cable machine, gripping attachment at chest height. Push attachment down until arms are fully extended, then return to starting position."
    },
    {
      id: "ex8",
      name: "Plank",
      sets: 3,
      reps: 60,
      weight: "Body weight",
      restTime: 30,
      description: "Start in push-up position, then bend elbows 90° and rest weight on forearms. Hold body in straight line from head to heels."
    }
  ]
};

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [workout] = useState(workoutData);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const handleExerciseComplete = (exerciseId: string, completed: boolean) => {
    if (completed) {
      setCompletedExercises(prev => [...prev, exerciseId]);
    } else {
      setCompletedExercises(prev => prev.filter(id => id !== exerciseId));
    }
  };

  const toggleWorkout = () => {
    if (!isWorkoutActive) {
      // Start workout timer
      const id = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
      setIsWorkoutActive(true);
    } else {
      // Pause workout timer
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsWorkoutActive(false);
    }
  };

  const completeWorkout = () => {
    // Stop timer
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Get existing user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Update workout stats
    const stats = userData.stats || {
      workoutsCompleted: 0,
      totalMinutes: 0,
      streakDays: 0,
      caloriesBurned: 0
    };
    
    stats.workoutsCompleted += 1;
    stats.totalMinutes += Math.floor(elapsedTime / 60);
    stats.streakDays += 1;
    stats.caloriesBurned += 150; // Mock calorie calculation
    
    // Save updated user data
    localStorage.setItem("user", JSON.stringify({
      ...userData,
      stats
    }));
    
    toast({
      title: "Workout Completed!",
      description: "Great job! Your workout has been logged.",
    });
    
    navigate("/dashboard");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{workout.title}</h1>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <WorkoutProgress 
                totalExercises={workout.exercises.length}
                completedExercises={completedExercises.length}
                duration={workout.duration}
                elapsedTime={elapsedTime}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                className={`flex-1 text-lg ${
                  isWorkoutActive 
                    ? "bg-amber-500 hover:bg-amber-600" 
                    : "bg-fitness-primary hover:bg-fitness-primary/90"
                }`}
                onClick={toggleWorkout}
              >
                {isWorkoutActive ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-fitness-primary text-fitness-primary hover:bg-fitness-primary/10"
                disabled={completedExercises.length < workout.exercises.length}
                onClick={completeWorkout}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Complete
              </Button>
            </div>
          </div>
          
          <ExerciseList 
            exercises={workout.exercises} 
            onComplete={handleExerciseComplete}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkoutDetail;
