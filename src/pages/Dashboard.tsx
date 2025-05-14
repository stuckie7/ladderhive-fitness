import React, { useEffect } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import FavoriteExercises from "@/components/dashboard/FavoriteExercises";
import RecentWorkouts from "@/components/dashboard/RecentWorkouts";
import UpcomingWorkouts from "@/components/dashboard/UpcomingWorkouts";
import Achievements from "@/components/dashboard/Achievements";
import Metrics from "@/components/dashboard/Metrics";

const Dashboard = () => {
  const dashboardData = useDashboardData();

  useEffect(() => {
    if (dashboardData.error) {
      console.error("Error loading dashboard data:", dashboardData.error);
    }
  }, [dashboardData.error]);

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Metrics metrics={dashboardData.metrics} isLoading={dashboardData.isLoading} />
      <Achievements achievements={dashboardData.achievements} />
      <RecentWorkouts recentWorkouts={dashboardData.recentWorkouts} isLoading={dashboardData.isLoading} />
      <UpcomingWorkouts upcomingWorkouts={dashboardData.upcomingWorkouts} isLoading={dashboardData.isLoading} />
      <FavoriteExercises 
        exercises={dashboardData.favoriteExercises}
        isLoading={dashboardData.isLoading}
        onAddExercise={() => navigate('/exercise-library')}
        onRemoveFavorite={async (id) => {
          await dashboardData.removeFavoriteExercise(id);
          return Promise.resolve();
        }}
      />
    </div>
  );
};

export default Dashboard;
