
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import { useActivityProgress } from "@/hooks/use-activity-progress";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Activity, TrendingUp, ChartBar } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const ProgressPage = () => {
  const { progress, isLoading: isDailyLoading } = useDailyProgress();
  const { weeklyData, monthlySummary, isLoading: isActivityLoading } = useActivityProgress();
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

  const renderWeeklyActivitySkeletons = () => (
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
            <DailyProgressCard progress={progress} isLoading={isDailyLoading} />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-6">
            {isActivityLoading ? (
              renderWeeklyActivitySkeletons()
            ) : (
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
            )}
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-6">
            {isActivityLoading || !monthlySummary ? (
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
            ) : (
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
                        <ProgressBar value={85} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg {monthlySummary.avgStepsPerDay.toLocaleString()} steps per day
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Active Minutes</span>
                          <span className="text-sm font-medium">{monthlySummary.totalActiveMinutes} min</span>
                        </div>
                        <ProgressBar value={90} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg {monthlySummary.avgActiveMinutesPerDay} minutes per day
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Workouts</span>
                          <span className="text-sm font-medium">{monthlySummary.totalWorkouts}</span>
                        </div>
                        <ProgressBar value={88} className="h-2" />
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
                            <ProgressBar value={(monthlySummary.totalSteps / 300000) * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>1,500 active minutes</span>
                              <span>{Math.round((monthlySummary.totalActiveMinutes / 1500) * 100)}%</span>
                            </div>
                            <ProgressBar value={(monthlySummary.totalActiveMinutes / 1500) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProgressPage;
