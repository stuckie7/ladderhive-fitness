import React, { useEffect } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import FavoriteExercises from "@/components/dashboard/FavoriteExercises";
import UpcomingWorkouts from "@/components/dashboard/UpcomingWorkouts";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const Dashboard = () => {
  const dashboardData = useDashboardData();
  const navigate = useNavigate();

  useEffect(() => {
    if (dashboardData.error) {
      console.error("Error loading dashboard data:", dashboardData.error);
    }
  }, [dashboardData.error]);

  return (
    <AppLayout>
      <div className="dashboard container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <UpcomingWorkouts 
          workouts={dashboardData.upcomingWorkouts} 
          isLoading={dashboardData.isLoading}
          onRefresh={dashboardData.refreshWorkouts}
        />
        <div className="mt-6">
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;
