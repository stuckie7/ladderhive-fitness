import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetricsSection } from '@/components/dashboard/DashboardMetricsSection';
import { QuickActionsSection } from '@/components/dashboard/QuickActionsSection';
import { FavoritesAndAchievementsSection } from '@/components/dashboard/FavoritesAndAchievementsSection';
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises';
import { useUpcomingWorkouts } from '@/hooks/use-upcoming-workouts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { DashboardError } from '@/components/dashboard/DashboardError';
import { useProfile } from '@/hooks/use-profile';
import { useWorkouts } from '@/hooks/workouts';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell } from 'lucide-react';
import { useDailyProgress } from '@/hooks/use-daily-progress';
import { useActivityProgress } from '@/hooks/use-activity-progress';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading: profileLoading } = useProfile();
  const { exercises, isLoading: exercisesLoading } = useFavoriteExercises();
  const { workouts, isLoading: workoutsLoading } = useUpcomingWorkouts();
  const { workouts: recentWorkouts, isLoading: recentWorkoutsLoading } = useWorkouts();
  const { weeklyData, isLoading: weeklyDataLoading } = useActivityProgress();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Placeholder for any dashboard-specific data fetching
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    };

    fetchData();
  }, [user]);

  if (error) {
    return (
      <AppLayout>
        <DashboardError
          message={error?.message || "Something went wrong. Please try again later."}
          onRetry={() => window.location.reload()}
        />
      </AppLayout>
    );
  }

  const handleStartWorkout = () => {
    navigate('/workouts/new');
  };

  const handleViewExercises = () => {
    navigate('/exercises');
  };

  const handleViewWorkouts = () => {
    navigate('/workouts');
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <DashboardHeader 
          name={profile?.first_name || 'User'} 
          isLoading={profileLoading} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - 8 columns on large screens */}
          <div className="lg:col-span-8 space-y-6">
            <DashboardMetricsSection 
              weeklyActivityData={weeklyData || []}
              isLoading={weeklyDataLoading} 
            />

            <FavoritesAndAchievementsSection 
              favoriteExercises={exercises}
              isLoading={exercisesLoading}
              onViewExercise={(id: string) => navigate(`/exercises/${id}`)}
            />
          </div>

          {/* Sidebar - 4 columns on large screens */}
          <div className="lg:col-span-4 space-y-6">
            <QuickActionsSection
              onStartWorkout={handleStartWorkout}
              onViewExercises={handleViewExercises}
              onViewWorkouts={handleViewWorkouts}
            />

            <UpcomingWorkouts 
              workouts={workouts} 
              isLoading={workoutsLoading}
              onViewWorkout={(id: string) => navigate(`/workouts/${id}`)}
            />
            
            <WorkoutHistory 
              workouts={recentWorkouts?.slice(0, 3) || []} 
              isLoading={recentWorkoutsLoading}
              onViewWorkout={(id: string) => navigate(`/workouts/${id}`)}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
