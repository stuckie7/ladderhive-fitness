import { useEffect, useState } from "react";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import UserProfile from "@/components/profile/UserProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Plus, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import { mockWorkouts } from "@/data/mock-workouts";

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const { progress, isLoading: progressLoading } = useDailyProgress();
  
  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        
        // Add some mock stats for the dashboard
        setUserData({
          ...parsedUser,
          stats: {
            workoutsCompleted: progress?.workouts_completed || 0,
            totalMinutes: 135,
            streakDays: 2,
            caloriesBurned: 450
          }
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [progress]);
  
  if (!userData) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Welcome, {userData.name.split(' ')[0]}</h2>
          <Button 
            className="bg-fitness-primary hover:bg-fitness-primary/90"
            onClick={() => navigate('/workouts')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workout
          </Button>
        </div>
        
        <DailyProgressCard progress={progress} isLoading={progressLoading} />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Workouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Schedule</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/schedule')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div 
                  key={day} 
                  className={`rounded-lg p-3 text-center ${
                    index === 0 || index === 2 || index === 4
                      ? "bg-fitness-primary/10 border border-fitness-primary/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <p className="text-sm font-medium">{day}</p>
                  <div className="mt-2 text-xs">
                    {index === 0 && <p className="text-fitness-primary font-medium">Upper Body</p>}
                    {index === 2 && <p className="text-fitness-primary font-medium">Lower Body</p>}
                    {index === 4 && <p className="text-fitness-primary font-medium">Full Body</p>}
                    {(index !== 0 && index !== 2 && index !== 4) && <p className="text-muted-foreground">Rest</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-fitness-primary to-fitness-secondary p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Level Up!</h3>
                <p className="text-sm opacity-90">Complete today's workout</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>80%</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full border-fitness-primary text-fitness-primary hover:bg-fitness-primary/10"
              onClick={() => navigate('/workout/1')}
            >
              Start Workout
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-fitness-primary" />
              <span>Progress Insight</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You've completed {progress?.workouts_completed || 0} workouts today.
              {progress?.workouts_completed === 0 && " Complete your first workout to start building your streak!"}
              {progress?.workouts_completed > 0 && " Keep up the good work!"}
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/progress')}
            >
              View Progress
            </Button>
          </CardContent>
        </Card>
        
        <UserProfile userData={userData} />
      </div>
    </div>
  );
};

export default Dashboard;
