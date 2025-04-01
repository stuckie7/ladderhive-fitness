
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp } from "lucide-react";
import { MonthlySummary } from "@/hooks/use-activity-progress";

interface MonthlyActivityProps {
  monthlySummary: MonthlySummary | null;
  isLoading: boolean;
}

const MonthlyActivity = ({ monthlySummary, isLoading }: MonthlyActivityProps) => {
  if (isLoading || !monthlySummary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Total Steps</span>
                <span className="text-sm font-medium">{monthlySummary.totalSteps.toLocaleString()}</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Avg {monthlySummary.avgStepsPerDay.toLocaleString()} steps per day
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Active Minutes</span>
                <span className="text-sm font-medium">{monthlySummary.totalActiveMinutes} min</span>
              </div>
              <Progress value={90} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Avg {monthlySummary.avgActiveMinutesPerDay} minutes per day
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Workouts</span>
                <span className="text-sm font-medium">{monthlySummary.totalWorkouts}</span>
              </div>
              <Progress value={88} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Avg {monthlySummary.avgWorkoutsPerWeek} workouts per week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Most Active Day</p>
                  <p className="text-sm text-muted-foreground">{monthlySummary.mostActiveDay.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{monthlySummary.mostActiveDay.steps.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">steps</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Workout Completion</p>
                  <p className="text-sm text-muted-foreground">Rate for the month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{monthlySummary.completionRate}%</p>
                <p className="text-sm text-muted-foreground">of planned workouts</p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="font-medium mb-2">Monthly Goal Progress</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>300,000 steps</span>
                    <span>{Math.round((monthlySummary.totalSteps / 300000) * 100)}%</span>
                  </div>
                  <Progress value={(monthlySummary.totalSteps / 300000) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>1,500 active minutes</span>
                    <span>{Math.round((monthlySummary.totalActiveMinutes / 1500) * 100)}%</span>
                  </div>
                  <Progress value={(monthlySummary.totalActiveMinutes / 1500) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyActivity;
