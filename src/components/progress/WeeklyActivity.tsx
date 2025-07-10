import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ActivityData } from "@/types/activity";

interface WeeklyActivityProps {
  weeklyData: ActivityData[];
  isLoading: boolean;
}

const WeeklyActivity = ({ weeklyData, isLoading }: WeeklyActivityProps) => {
  const chartConfig = {
    steps: {
      label: "Steps",
      theme: {
        light: "#8B5CF6",
        dark: "#A78BFA",
      },
    },
    active: {
      label: "Active Minutes",
      theme: {
        light: "#10B981",
        dark: "#34D399",
      },
    },
    workouts: {
      label: "Workouts",
      theme: {
        light: "#F97316",
        dark: "#FB923C",
      },
    },
  };

  const renderSkeletons = () => (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted/20 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );

  if (isLoading) {
    return renderSkeletons();
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8B5CF6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => {
                          if (name === "steps") return [`${value.toLocaleString()} steps`, "Steps"];
                          if (name === "active_minutes") return [`${value} minutes`, "Active Time"];
                          if (name === "workouts") return [`${value} workout${value !== 1 ? 's' : ''}`, "Workouts"];
                          return [value, name];
                        }}
                      />
                    } 
                  />
                  <Bar 
                    dataKey="steps" 
                    name="steps"
                    fill="var(--color-steps)" 
                    yAxisId="left"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="active_minutes" 
                    name="active_minutes"
                    fill="var(--color-active)" 
                    yAxisId="right"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyData.reduce((sum, day) => sum + day.steps, 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Weekly target: 70,000</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyData.reduce((sum, day) => sum + day.active_minutes, 0)} min</div>
            <div className="text-sm text-muted-foreground">Weekly target: 420 min</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyData.reduce((sum, day) => sum + day.workouts, 0)}</div>
            <div className="text-sm text-muted-foreground">Weekly target: 4 workouts</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WeeklyActivity;
