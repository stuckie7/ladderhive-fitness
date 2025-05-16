
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";

// Import hooks
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useExerciseLibraryNavigation } from "@/hooks/use-exercise-library-navigation";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import { useActivityProgress } from "@/hooks/activity-progress";

// Import dashboard components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardError from "@/components/dashboard/DashboardError";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import DashboardMetricsSection from "@/components/dashboard/DashboardMetricsSection";
import QuickActionsSection from "@/components/dashboard/QuickActionsSection";
import FavoritesAndAchievementsSection from "@/components/dashboard/FavoritesAndAchievementsSection";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const exerciseNav = useExerciseLibraryNavigation();
  
  // State for date selection
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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
  
  // Combine the dashboard metrics with real activity data
  const [metrics, setMetrics] = useState(dashboardMetrics);
  const [weeklyChartData, setWeeklyChartData] = useState(initialChartData);
  
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
    return <DashboardError errorMessage={dashboardError} />;
  }

  const isLoading = isDashboardLoading || progressLoading || activityLoading;

  return (
    <AppLayout>
     <div className="px-0 py-4 md:px-4 md:py-6">
        {/* Dashboard header with action buttons */}
        <DashboardHeader 
          isLoading={isLoading}
          onRefresh={handleRefreshAll}
          onStartWorkout={handleStartWorkout}
        />
        
        {/* Daily progress card */}
        <div className="mb-6">
          <DailyProgressCard progress={progress} isLoading={progressLoading} />
        </div>
        
        {/* Metrics and charts section */}
        <DashboardMetricsSection 
          metricsData={metricsData}
          weeklyChartData={weeklyChartData}
          recentWorkouts={recentWorkouts}
          isLoading={isLoading}
          onSelectDate={setSelectedDate}
          onSelectWorkout={handleSelectWorkout}
        />
        
        {/* Quick actions and upcoming workouts */}
        <QuickActionsSection 
          upcomingWorkouts={upcomingWorkouts}
          isLoading={isLoading}
          onGoToExerciseLibrary={handleGoToExerciseLibrary}
          onScheduleWorkout={handleScheduleWorkout}
          onRefreshWorkouts={refreshWorkouts}
        />
        
        {/* Favorites and achievements */}
        <FavoritesAndAchievementsSection 
          favoriteExercises={favoriteExercises}
          achievements={achievements}
          isLoading={isLoading}
          onAddFavorite={handleAddFavorite}
          onRemoveFavorite={removeFavoriteExercise}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
