
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DailyProgress } from "@/hooks/use-daily-progress";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyProgressCardProps {
  progress: DailyProgress | null;
  isLoading: boolean;
}

const DailyProgressCard = ({ progress, isLoading }: DailyProgressCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Progress</CardTitle>
          <CardDescription>Your daily fitness goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Progress</CardTitle>
          <CardDescription>Unable to load progress data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading your progress. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stepPercentage = Math.round((progress.step_count / progress.step_goal) * 100);
  const minutesPercentage = Math.round((progress.active_minutes / progress.active_minutes_goal) * 100);
  const workoutsPercentage = Math.round((progress.workouts_completed / progress.workouts_goal) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Today's Progress</CardTitle>
        <CardDescription>Your daily fitness goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Step Count</span>
            <span className="text-sm font-medium">
              {progress.step_count.toLocaleString()} / {progress.step_goal.toLocaleString()}
            </span>
          </div>
          <Progress value={stepPercentage} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Minutes</span>
            <span className="text-sm font-medium">
              {progress.active_minutes} / {progress.active_minutes_goal}
            </span>
          </div>
          <Progress value={minutesPercentage} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Workouts</span>
            <span className="text-sm font-medium">
              {progress.workouts_completed} / {progress.workouts_goal}
            </span>
          </div>
          <Progress value={workoutsPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgressCard;
