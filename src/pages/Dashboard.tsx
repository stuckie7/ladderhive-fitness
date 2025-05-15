import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";
import { Activity, Award, Calendar, Dumbbell, Plus, Zap } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useExerciseLibraryNavigation } from "@/hooks/use-exercise-library-navigation";

// Import dashboard components
import WorkoutHistory from "@/components/dashboard/WorkoutHistory";
import MetricsCard from "@/components/dashboard/MetricsCard";
import FavoriteExercises from "@/components/dashboard/FavoriteExercises";
import AchievementCard from "@/components/dashboard/AchievementCard";
import UpcomingWorkouts from "@/components/dashboard/UpcomingWorkouts";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useActivityProgress } from "@/hooks/activity-progress";

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    recentWorkouts, 
    upcomingWorkouts, 
    favoriteExercises,
    achievements,
    metrics: dashboardMetrics,
    weeklyChartData: initialChartData, 
    isLoading: isDashboardLoading,
    error: dashboardError,
    removeFavoriteExercise,
    refreshWorkouts
  } = useDashboardData();
  
  // Use the activity progress hooks for real-time data
  const { progress, isLoading: progressLoading, refreshProgress } = useDailyProgress();
  const { weeklyData, monthlySummary, isLoading: activityLoading, refreshData: refreshActivity } = useActivityProgress();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();
  
  // Combine the dashboard metrics with real activity data
  const [metrics, setMetrics] = useState(dashboardMetrics);
  const [weeklyChartData, setWeeklyChartData] = useState(initialChartData);
  
  // Add exercise library navigation
  const exerciseNav = useExerciseLibraryNavigation();
  
  // Update metrics when both data sources are available
  useEffect(() => {
    if (monthlySummary && !activityLoading) {
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        totalWorkouts: monthlySummary.totalWorkouts || prevMetrics.totalWorkouts,
        workoutsThisWeek: weeklyData.reduce((sum, day) => sum + day.workouts, 0),
        completionRate: monthlySummary.completionRate || prevMetrics.completionRate,
        totalMinutes: monthlySummary.totalActiveMinutes || prevMetrics.totalMinutes,
        currentStreak: prevMetrics.currentStreak, // Keep existing streak data
        totalWeight: prevMetrics.totalWeight, // Keep existing weight data
      }));
      
      // Format weekly data for chart display
      const formattedChartData = weeklyData.map(day => ({
        name: day.day,
        minutes: day.active_minutes,
        weight: Math.round(Math.random() * 1000) + 1000, // Placeholder for weight data
      }));
      
      setWeeklyChartData(formattedChartData);
    }
  }, [monthlySummary, weeklyData, activityLoading]);
  
  // Handle refresh for all dashboard data
  const handleRefreshAll = () => {
    refreshWorkouts();
    refreshActivity();
    refreshProgress();
    toast({
      description: "Refreshing dashboard data...",
    });
  };
  
  // Prepare metrics for the metrics card
  const metricsData = [
    { name: 'Total Workouts', value: metrics.totalWorkouts },
    { name: 'This Week', value: metrics.workoutsThisWeek },
    { name: 'Completion', value: metrics.completionRate, unit: '%', change: 5 },
    { name: 'Active Minutes', value: Math.round(metrics.totalMinutes) },
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
    navigate(`/workouts/${id}`);
  };

  const handleScheduleWorkout = () => {
    toast({
      title: "Quick Schedule",
      description: "Workout scheduling feature coming soon",
    });
  };

  const handleGoToExerciseLibrary = () => {
    exerciseNav.goToExerciseLibrary();
  };

  // Handle start workout functionality
  const handleStartWorkout = () => {
    // Check if there are upcoming workouts to start
    if (upcomingWorkouts && upcomingWorkouts.length > 0) {
      const nextWorkout = upcomingWorkouts[0];
      
      // Use the correct navigation path based on workout type
      const path = nextWorkout.type === 'wod' 
        ? `/wods/${nextWorkout.id}` 
        : `/workouts/${nextWorkout.id}`;
      
      navigate(path);
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
  if (dashboardError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
            <p className="mb-4">{dashboardError}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isLoading = isDashboardLoading || progressLoading || activityLoading;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-heading">Dashboard</h1>
          <div className="space-x-2">
            <Button 
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isLoading}
            >
              Refresh
            </Button>
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
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-800 hover:bg-gray-800/50 hover:text-fitness-orange group"
                onClick={handleGoToExerciseLibrary}
              >
                <Dumbbell className="mr-2 h-5 w-5 text-fitness-orange group-hover:animate-pulse-soft" /> Exercise Library
              </Button>
            </CardContent>
          </Card>
          
          <div className="col-span-2">
            <UpcomingWorkouts 
              workouts={upcomingWorkouts} 
              isLoading={isLoading}
              onScheduleWorkout={handleScheduleWorkout}
              onRefresh={refreshWorkouts}
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
