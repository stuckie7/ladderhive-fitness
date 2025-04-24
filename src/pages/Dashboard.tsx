
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { Dumbbell, Calendar, Activity, Plus, ArrowRight } from "lucide-react";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import PreparedWorkoutsSection from "@/components/workouts/PreparedWorkoutsSection";
import { useWorkoutData } from "@/hooks/use-workout-data";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import { Exercise } from "@/types/exercise";

const Dashboard = () => {
  const { workouts, savedWorkouts, isLoading: workoutsLoading } = useWorkoutData();
  const { progress, isLoading: progressLoading } = useDailyProgress();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="mb-6">
          <DailyProgressCard progress={progress} isLoading={progressLoading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/workouts">
                <Button variant="outline" className="w-full justify-start">
                  <Dumbbell className="mr-2 h-5 w-5" /> View Workouts
                </Button>
              </Link>
              <Link to="/schedule">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-5 w-5" /> Schedule
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-5 w-5" /> Track Progress
                </Button>
              </Link>
              <Link to="/exercises">
                <Button variant="outline" className="w-full justify-start">
                  <Dumbbell className="mr-2 h-5 w-5" /> Exercise Library
                </Button>
              </Link>
              <Link to="/advanced-exercises">
                <Button variant="outline" className="w-full justify-start bg-gray-100 dark:bg-slate-800">
                  <Dumbbell className="mr-2 h-5 w-5" /> Advanced Exercises
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Recent Workouts</span>
                <Link to="/workouts">
                  <Button variant="ghost" className="h-8 px-2 text-sm">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutProgress 
                totalExercises={workouts?.[0]?.exercises || 0} 
                completedExercises={Math.floor((workouts?.[0]?.exercises || 0) / 2)} 
                duration={workouts?.[0]?.duration || 0}
                isLoading={workoutsLoading} 
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="suggested" className="mb-8">
          <TabsList>
            <TabsTrigger value="suggested">Suggested Workouts</TabsTrigger>
            <TabsTrigger value="saved">Saved Workouts</TabsTrigger>
          </TabsList>
          <TabsContent value="suggested">
            <PreparedWorkoutsSection 
              currentWorkoutId={null}
              onAddExercise={async (exercise: Exercise) => {
                console.log("Adding exercise:", exercise);
                return Promise.resolve();
              }} 
            />
          </TabsContent>
          <TabsContent value="saved">
            <Card>
              <CardContent className="p-6">
                {savedWorkouts && savedWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Saved workouts would go here */}
                    <p>Your saved workouts will appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No saved workouts yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Start by saving some workouts you like.
                    </p>
                    <Link to="/workouts">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Browse Workouts
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
