
import { Progress } from "@/components/ui/progress";
import { Clock, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutProgressProps {
  totalExercises: number;
  completedExercises: number;
  duration: number;
  isLoading?: boolean;
  className?: string;
}

const WorkoutProgress = ({
  totalExercises,
  completedExercises,
  duration,
  isLoading = false,
  className
}: WorkoutProgressProps) => {
  const percentage = totalExercises > 0 
    ? Math.min(100, Math.round((completedExercises / totalExercises) * 100)) 
    : 0;
  
  if (isLoading) {
    return (
      <div className={cn("space-y-4 p-2", className)}>
        <Skeleton className="h-6 w-32 bg-gray-800" />
        <Skeleton className="h-4 w-full bg-gray-800" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-20 bg-gray-800" />
          <Skeleton className="h-8 w-20 bg-gray-800" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4 p-1", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Workout Progress</h3>
        <span className="text-sm font-semibold text-fitness-primary">{percentage}%</span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 bg-gray-800"
        indicatorClassName="bg-gradient-to-r from-fitness-primary to-fitness-secondary"
      />
      
      <div className="flex justify-between items-center mt-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4 text-fitness-primary" />
          <span className="text-gray-300">
            {completedExercises}/{totalExercises} exercises
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-fitness-secondary" />
          <span className="text-gray-300">{duration} min</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutProgress;
