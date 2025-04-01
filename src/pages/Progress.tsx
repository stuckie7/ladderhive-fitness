
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, ChartBar } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

// Mock data for weekly progress - in a real app, this would come from the API
const weeklyData = [
  { day: "Mon", steps: 8750, active: 45, workouts: 1 },
  { day: "Tue", steps: 10200, active: 55, workouts: 1 },
  { day: "Wed", steps: 9300, active: 50, workouts: 0 },
  { day: "Thu", steps: 11500, active: 65, workouts: 1 },
  { day: "Fri", steps: 8900, active: 48, workouts: 0 },
  { day: "Sat", steps: 12300, active: 70, workouts: 1 },
  { day: "Sun", steps: 7500, active: 40, workouts: 0 },
];

// Mock data for monthly progress summary
const monthlyStats = {
  totalSteps: 287000,
  avgStepsPerDay: 9566,
  totalActiveMinutes: 1230,
  avgActiveMinutesPerDay: 41,
  totalWorkouts: 14,
  avgWorkoutsPerWeek: 3.5,
  completionRate: 82,
};

const Progress = () => {
  const { progress, isLoading } = useDailyProgress();
  const [activeTab, setActiveTab] = useState("daily");
  
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs 
          defaultValue="daily" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Daily</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              <span>Monthly</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-6">
            <DailyProgressCard progress={progress} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-6">
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
                                if (name === "active") return [`${value} minutes`, "Active Time"];
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
                          dataKey="active" 
                          name="active"
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
                  <div className="text-2xl font-bold">{weeklyData.reduce((sum, day) => sum + day.active, 0)} min</div>
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
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-6">
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
                        <span className="text-sm font-medium">{monthlyStats.totalSteps.toLocaleString()}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg {monthlyStats.avgStepsPerDay.toLocaleString()} steps per day
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Active Minutes</span>
                        <span className="text-sm font-medium">{monthlyStats.totalActiveMinutes} min</span>
                      </div>
                      <Progress value={90} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg {monthlyStats.avgActiveMinutesPerDay} minutes per day
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Workouts</span>
                        <span className="text-sm font-medium">{monthlyStats.totalWorkouts}</span>
                      </div>
                      <Progress value={88} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg {monthlyStats.avgWorkoutsPerWeek} workouts per week
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
                          <p className="text-sm text-muted-foreground">Saturday</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">12,300</p>
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
                        <p className="text-xl font-bold">{monthlyStats.completionRate}%</p>
                        <p className="text-sm text-muted-foreground">of planned workouts</p>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="font-medium mb-2">Monthly Goal Progress</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>300,000 steps</span>
                            <span>{Math.round((monthlyStats.totalSteps / 300000) * 100)}%</span>
                          </div>
                          <Progress value={(monthlyStats.totalSteps / 300000) * 100} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>1,500 active minutes</span>
                            <span>{Math.round((monthlyStats.totalActiveMinutes / 1500) * 100)}%</span>
                          </div>
                          <Progress value={(monthlyStats.totalActiveMinutes / 1500) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Progress;
