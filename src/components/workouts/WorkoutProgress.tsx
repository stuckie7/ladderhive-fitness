
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Dumbbell, CheckCircle2 } from "lucide-react";

interface WorkoutProgressProps {
  totalExercises: number;
  completedExercises: number;
  duration: number;
  elapsedTime?: number;
  isLoading?: boolean;
}

const WorkoutProgress = ({ 
  totalExercises, 
  completedExercises, 
  duration, 
  elapsedTime = 0,
  isLoading = false
}: WorkoutProgressProps) => {
  const progressPercentage = Math.round((completedExercises / totalExercises) * 100) || 0;
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Workout Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-fitness-primary" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-gray-100 dark:bg-gray-800" />
          <p className="text-xs text-muted-foreground">
            {completedExercises} of {totalExercises} exercises completed
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card flex items-center gap-3">
            <Dumbbell className="h-5 w-5 text-fitness-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Exercises</p>
              <p className="text-lg font-semibold">{totalExercises}</p>
            </div>
          </div>
          
          <div className="stat-card flex items-center gap-3">
            <Clock className="h-5 w-5 text-fitness-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">{duration} min</p>
            </div>
          </div>
        </div>
        
        {elapsedTime > 0 && (
          <div className="pt-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Elapsed Time</p>
              <p className="text-sm font-medium">{formatTime(elapsedTime)}</p>
            </div>
            <Progress 
              value={(elapsedTime / (duration * 60)) * 100} 
              className="h-2 mt-2 bg-gray-100 dark:bg-gray-800" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutProgress;
