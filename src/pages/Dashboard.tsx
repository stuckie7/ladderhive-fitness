
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { Dumbbell, Calendar, Activity, Plus, ArrowRight, Zap, Flame } from "lucide-react";
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-heading">Dashboard</h1>
          <div className="space-x-2">
            <Button className="btn-fitness-primary">
              <Zap className="mr-2 h-4 w-4" /> Start Workout
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <DailyProgressCard progress={progress} isLoading={progressLoading} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-center text-fitness-primary">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Link to="/workouts">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-primary group">
                  <Dumbbell className="mr-2 h-5 w-5 text-fitness-primary group-hover:animate-pulse-soft" /> View Workouts
                </Button>
              </Link>
              <Link to="/schedule">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-secondary group">
                  <Calendar className="mr-2 h-5 w-5 text-fitness-secondary group-hover:animate-pulse-soft" /> Schedule
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-accent group">
                  <Activity className="mr-2 h-5 w-5 text-fitness-accent group-hover:animate-pulse-soft" /> Track Progress
                </Button>
              </Link>
              <Link to="/exercises">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-orange group">
                  <Dumbbell className="mr-2 h-5 w-5 text-fitness-orange group-hover:animate-pulse-soft" /> Exercise Library
                </Button>
              </Link>
              <Link to="/advanced-exercises">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-primary group">
                  <Flame className="mr-2 h-5 w-5 text-fitness-primary group-hover:animate-pulse-soft" /> Advanced Exercises
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="col-span-2 glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-center text-fitness-secondary">
                <span>Recent Workouts</span>
                <Link to="/workouts">
                  <Button variant="ghost" className="h-8 px-2 text-sm hover:bg-gray-800/50 hover:text-fitness-secondary">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <WorkoutProgress 
                totalExercises={workouts?.[0]?.exercises || 0} 
                completedExercises={Math.floor((workouts?.[0]?.exercises || 0) / 2)} 
                duration={workouts?.[0]?.duration || 0}
                isLoading={workoutsLoading} 
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 gradient-heading">Exercise Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/exercise-library-enhanced">
              <div className="glass-panel p-6 rounded-xl border border-gray-800/50 hover:border-fitness-primary/50 transition-all hover:shadow-md hover:shadow-fitness-primary/20 flex items-center gap-4 group">
                <div className="bg-fitness-primary/10 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6 text-fitness-primary group-hover:animate-pulse-soft" />
                </div>
                <div>
                  <h3 className="font-medium text-white group-hover:text-fitness-primary transition-colors">Enhanced Exercise Library</h3>
                  <p className="text-sm text-gray-400">
                    Browse and manage exercises with advanced features
                  </p>
                </div>
              </div>
            </Link>
            
            <Link to="/exercise-library">
              <div className="glass-panel p-6 rounded-xl border border-gray-800/50 hover:border-fitness-secondary/50 transition-all hover:shadow-md hover:shadow-fitness-secondary/20 flex items-center gap-4 group">
                <div className="bg-fitness-secondary/10 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6 text-fitness-secondary group-hover:animate-pulse-soft" />
                </div>
                <div>
                  <h3 className="font-medium text-white group-hover:text-fitness-secondary transition-colors">Standard Exercise Library</h3>
                  <p className="text-sm text-gray-400">
                    Browse exercises with basic functionality
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="suggested" className="mb-8">
          <TabsList className="bg-gray-900/60 border border-gray-800/50">
            <TabsTrigger 
              value="suggested" 
              className="data-[state=active]:bg-fitness-primary/20 data-[state=active]:text-fitness-primary"
            >
              Suggested Workouts
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="data-[state=active]:bg-fitness-secondary/20 data-[state=active]:text-fitness-secondary"
            >
              Saved Workouts
            </TabsTrigger>
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
            <Card className="glass-panel">
              <CardContent className="p-6">
                {savedWorkouts && savedWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Saved workouts would go here */}
                    <p className="text-gray-400">Your saved workouts will appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium text-white">No saved workouts yet</h3>
                    <p className="mt-2 text-gray-400">
                      Start by saving some workouts you like.
                    </p>
                    <Link to="/workouts">
                      <Button className="mt-6 btn-fitness-primary">
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
