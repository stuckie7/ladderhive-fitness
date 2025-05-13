import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";
import { Activity, Award, Calendar, Dumbbell, Plus, Zap } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// Import dashboard components
import WorkoutHistory from "@/components/dashboard/WorkoutHistory";
import MetricsCard from "@/components/dashboard/MetricsCard";
import FavoriteExercises from "@/components/dashboard/FavoriteExercises";
import AchievementCard from "@/components/dashboard/AchievementCard";
import UpcomingWorkouts from "@/components/dashboard/UpcomingWorkouts";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { 
    recentWorkouts, 
    upcomingWorkouts, 
    favoriteExercises,
    achievements,
    metrics,
    weeklyChartData, 
    isLoading,
    removeFavoriteExercise
  } = useDashboardData();
  
  const { progress, isLoading: progressLoading } = useDailyProgress();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();
  
  // Prepare metrics for the metrics card
  const metricsData = [
    { name: 'Total Workouts', value: metrics.totalWorkouts },
    { name: 'This Week', value: metrics.workoutsThisWeek },
    { name: 'Completion', value: metrics.completionRate, unit: '%', change: 5 },
    { name: 'Minutes', value: metrics.totalMinutes },
    { name: 'Current Streak', value: metrics.currentStreak, unit: 'days', change: 10 },
    { name: 'Weight Lifted', value: Math.round(metrics.totalWeight/1000), unit: 'k lbs', change: 15 },
  ];

  const handleAddFavorite = () => {
    toast({
      title: "Coming soon",
      description: "Adding favorites will be available shortly",
    });
  };

  const handleSelectWorkout = (id: string) => {
    toast({
      description: `Selected workout: ${id}`,
    });
  };

  const handleScheduleWorkout = () => {
    toast({
      title: "Quick Schedule",
      description: "Workout scheduling feature coming soon",
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-heading">Dashboard</h1>
          <div className="space-x-2">
            <Button className="btn-fitness-primary">
              <Zap className="mr-2 h-4 w-4" /> Start Workout
            </Button>
          </div>
        </div>
        
        {/* Daily progress card */}
        <div className="mb-6">
          <DailyProgressCard progress={progress} isLoading={progressLoading} />
        </div>
        
        {/* Metrics and charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <MetricsCard 
              title="Workout Metrics" 
              icon={<Activity className="h-5 w-5" />}
              metrics={metricsData} 
              chartData={weeklyChartData}
              isLoading={isLoading} 
            />
          </div>
          <div>
            <WorkoutHistory 
              workouts={recentWorkouts} 
              isLoading={isLoading}
              onSelectDate={setSelectedDate}
              onSelectWorkout={handleSelectWorkout}
            />
          </div>
        </div>
        
        {/* Quick actions section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 glass-panel">
            <CardContent className="space-y-4 p-4">
              <Link to="/workout-builder">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-primary group">
                  <Plus className="mr-2 h-5 w-5 text-fitness-primary group-hover:animate-pulse-soft" /> Create Workout
                </Button>
              </Link>
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
              <Link to="/exercise-library">
                <Button variant="outline" className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-orange group">
                  <Dumbbell className="mr-2 h-5 w-5 text-fitness-orange group-hover:animate-pulse-soft" /> Exercise Library
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <div className="col-span-2">
            <UpcomingWorkouts 
              workouts={upcomingWorkouts} 
              isLoading={isLoading}
              onScheduleWorkout={handleScheduleWorkout}
            />
          </div>
        </div>
        
        {/* Favorites and achievements section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FavoriteExercises 
            exercises={favoriteExercises} 
            isLoading={isLoading}
            onAddExercise={handleAddFavorite}
            onRemoveFavorite={removeFavoriteExercise}
          />
          <AchievementCard 
            achievements={achievements} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
