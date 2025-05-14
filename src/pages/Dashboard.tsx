
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { 
    recentWorkouts, 
    upcomingWorkouts, 
    favoriteExercises,
    achievements,
    metrics,
    weeklyChartData, 
    isLoading,
    error,
    removeFavoriteExercise,
    refreshWorkouts
  } = useDashboardData();
  
  const { progress, isLoading: progressLoading, error: progressError } = useDailyProgress();
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
    // Navigate to the workout detail page
    navigate(`/workout/${id}`);
  };

  const handleScheduleWorkout = () => {
    toast({
      title: "Quick Schedule",
      description: "Workout scheduling feature coming soon",
    });
  };

  const handleRefreshWorkouts = () => {
    refreshWorkouts();
  };

  // Handle start workout functionality
  const handleStartWorkout = () => {
    // Check if there are upcoming workouts to start
    if (upcomingWorkouts && upcomingWorkouts.length > 0) {
      const nextWorkout = upcomingWorkouts[0];
      navigate(`/workout/${nextWorkout.id}`);
      toast({
        title: "Starting workout",
        description: `Loading ${nextWorkout.title}`,
      });
    } else {
      // If no upcoming workouts, direct to workouts page
      navigate("/workouts");
      toast({
        title: "No scheduled workouts",
        description: "Select a workout to begin",
      });
    }
  };

  // Handle error states
  if (error || progressError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
            <p className="mb-4">{error || progressError}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-heading">Dashboard</h1>
          <div className="space-x-2">
            <Button 
              className="btn-fitness-primary"
              onClick={handleStartWorkout}
            >
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
              onRefresh={handleRefreshWorkouts}
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
