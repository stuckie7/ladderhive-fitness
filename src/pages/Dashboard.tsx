
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetricsSection from '@/components/dashboard/DashboardMetricsSection';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import FavoritesAndAchievementsSection from '@/components/dashboard/FavoritesAndAchievementsSection';
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises';
import { useUpcomingWorkouts } from '@/hooks/use-upcoming-workouts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import DashboardError from '@/components/dashboard/DashboardError';
import { useProfile } from '@/hooks/use-profile';
import { useWorkouts } from '@/hooks/workouts';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell } from 'lucide-react';
import { useDailyProgress } from '@/hooks/use-daily-progress';
import { useActivityProgress } from '@/hooks/use-activity-progress';

// Import components with default exports
import UpcomingWorkouts from '@/components/dashboard/UpcomingWorkouts';
import WorkoutHistory from '@/components/dashboard/WorkoutHistory';

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
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('An unknown error occurred'));
        }
      }
    };

    fetchData();
  }, [user]);

  if (error) {
    return (
      <AppLayout>
        <DashboardError
          errorMessage={error.message || "Something went wrong. Please try again later."}
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

  const handleRefresh = () => {
    window.location.reload();
  };

  // Combine loading states
  const isLoading = profileLoading || exercisesLoading || workoutsLoading || recentWorkoutsLoading || weeklyDataLoading;

  // Show loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-800 rounded-lg w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DashboardHeader 
          isLoading={profileLoading} 
          onRefresh={handleRefresh}
          onStartWorkout={handleStartWorkout}
        />

        <div className="flex flex-col space-y-8">
          {/* Quick Actions Bar */}
          <div className="w-full">
            <QuickActionsSection
              onGoToExerciseLibrary={handleViewExercises}
              onScheduleWorkout={handleStartWorkout}
            />
          </div>

          {/* Main Content */}
          <div className="w-full space-y-8">
            <DashboardMetricsSection 
              weeklyChartData={weeklyData || []}
              recentWorkouts={recentWorkouts || []}
              isLoading={weeklyDataLoading} 
              onSelectDate={(date) => navigate(`/workouts?date=${date.toISOString()}`)}
              onSelectWorkout={(id) => navigate(`/workouts/${id}`)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FavoritesAndAchievementsSection 
                favoriteExercises={exercises}
                achievements={[]}
                isLoading={exercisesLoading}
                onAddFavorite={() => navigate('/exercises')}
                onRemoveFavorite={async (id) => {
                  try {
                    // Add your favorite removal logic here
                    toast({
                      title: "Favorite removed",
                      description: "Exercise has been removed from your favorites.",
                    });
                  } catch (error) {
                    console.error("Error removing favorite:", error);
                    toast({
                      title: "Error",
                      description: "Failed to remove favorite. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              />
              
              <div className="space-y-6">
                <UpcomingWorkouts 
                  workouts={workouts?.map(w => ({
                    id: w.id,
                    title: w.title,
                    date: w.scheduled_date,
                    duration: w.duration_minutes,
                    difficulty: w.difficulty,
                    type: 'workout'
                  })) || []}
                  isLoading={workoutsLoading}
                  onViewWorkout={(id) => navigate(`/workouts/${id}`)}
                  onScheduleWorkout={handleStartWorkout}
                  onRefresh={handleRefresh}
                />
                
                <WorkoutHistory 
                  workouts={recentWorkouts?.slice(0, 3) || []} 
                  isLoading={recentWorkoutsLoading}
                  onSelectWorkout={(id) => navigate(`/workouts/${id}`)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
