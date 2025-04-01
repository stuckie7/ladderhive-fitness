
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Dumbbell, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkouts } from "@/hooks/use-workouts";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutCardProps {
  workout: {
    id: string;
    title: string;
    description: string;
    duration: number;
    exercises: number;
    difficulty: string;
    date?: string;
  };
  isSaved?: boolean;
}

const WorkoutCard = ({ workout, isSaved = false }: WorkoutCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { saveWorkout, unsaveWorkout } = useWorkouts();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  const handleSaveWorkout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save workouts.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      if (saved) {
        // Remove from saved
        const result = await unsaveWorkout(workout.id);
        if (result.success) {
          setSaved(false);
        }
      } else {
        // Add to saved
        const result = await saveWorkout(workout.id);
        if (result.success) {
          setSaved(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="workout-card overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{workout.title}</CardTitle>
          <span 
            className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(workout.difficulty)}`}
          >
            {workout.difficulty}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>{workout.exercises} exercises</span>
          </div>
          {workout.date && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{workout.date}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button 
          className="flex-1 bg-fitness-primary hover:bg-fitness-primary/90"
          onClick={() => navigate(`/workout/${workout.id}`)}
        >
          Start Workout
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          onClick={handleSaveWorkout}
          className={saved ? "text-fitness-primary" : ""}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
