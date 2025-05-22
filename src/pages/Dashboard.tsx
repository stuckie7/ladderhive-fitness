
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
        currentStreak: prevMetrics.currentStreak,
        totalWeight: prevMetrics.totalWeight,
      }));

      const formattedChartData = weeklyData.map(day => ({
        name: day.day,
        minutes: day.active_minutes,
        weight: Math.round(Math.random() * 1000) + 1000,
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
    navigate(`/workouts/${id}`);
  };

  const handleScheduleWorkout = () => {
    toast({
      title: "Coming soon",
      description: "Workout scheduling feature will be available soon",
    });
  };

  return (
    <AppLayout>
      <div className="dashboard-header">
        <div className="p-6 bg-card rounded-lg">
          <DashboardHeader 
            isLoading={isDashboardLoading || progressLoading || activityLoading}
            onRefresh={handleRefreshAll}
            onStartWorkout={() => navigate('/workout-builder')}
          />
        </div>
      </div>
      {dashboardError ? (
        <DashboardError errorMessage={dashboardError} />
      ) : (
        <div className="dashboard-content min-h-[calc(100vh-12rem)]">
          <DashboardMetricsSection
            metrics={metricsData}
            chartData={weeklyChartData}
            workouts={recentWorkouts}
            isLoading={isDashboardLoading || progressLoading || activityLoading}
            onSelectDate={setSelectedDate}
            onSelectWorkout={handleSelectWorkout}
          />
          <QuickActionsSection 
            upcomingWorkouts={upcomingWorkouts}
            isLoading={isDashboardLoading || progressLoading || activityLoading}
            onGoToExerciseLibrary={() => exerciseNav.goToExerciseLibrary()}
            onScheduleWorkout={handleScheduleWorkout}
            onRefreshWorkouts={refreshWorkouts}
          />
          <FavoritesAndAchievementsSection 
            isLoading={isDashboardLoading || progressLoading || activityLoading}
            favoriteExercises={favoriteExercises}
            achievements={achievements}
            onRemoveFavorite={removeFavoriteExercise}
            onAddFavorite={handleAddFavorite}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
