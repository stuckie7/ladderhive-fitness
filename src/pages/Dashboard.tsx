
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardError from '@/components/dashboard/DashboardError';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import DashboardMetricsSection from '@/components/dashboard/DashboardMetricsSection';
import FavoritesAndAchievementsSection from '@/components/dashboard/FavoritesAndAchievementsSection';
import UpcomingWorkouts from '@/components/dashboard/UpcomingWorkouts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useWorkoutStats } from '@/hooks/use-workout-stats';
import { useRecentWorkouts } from '@/hooks/use-recent-workouts';
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises';
import { useUpcomingWorkouts } from '@/hooks/use-upcoming-workouts';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user profile data
  const { profile: profileData, isLoading: isProfileLoading } = useProfile();
  
  // Get workout statistics
  const { 
    weeklyActivityData,
    isLoading: isStatsLoading,
    error: statsError
  } = useWorkoutStats();
  
  // Get recent workouts
  const { 
    workouts: recentWorkouts,
    isLoading: isRecentWorkoutsLoading,
    error: recentWorkoutsError
  } = useRecentWorkouts();
  
  // Get favorite exercises
  const {
    exercises: favoriteExercises,
    isLoading: isFavoritesLoading,
    error: favoritesError
  } = useFavoriteExercises();
  
  // Get upcoming workouts
  const {
    workouts: upcomingWorkouts,
    isLoading: isUpcomingLoading,
    error: upcomingError
  } = useUpcomingWorkouts();
  
  // Combined loading state
  const isLoading = 
    isStatsLoading || 
    isRecentWorkoutsLoading || 
    isFavoritesLoading || 
    isUpcomingLoading;
  
  // Handle errors
  useEffect(() => {
    const errors = [statsError, recentWorkoutsError, favoritesError, upcomingError].filter(Boolean);
    
    if (errors.length > 0) {
      setError(errors[0] || 'An error occurred while loading dashboard data');
      setIsError(true);
    } else {
      setIsError(false);
      setError(null);
    }
  }, [statsError, recentWorkoutsError, favoritesError, upcomingError]);
  
  // Handle workout selection
  const handleSelectWorkout = (id: string) => {
    navigate(`/workout/${id}`);
  };

  // Handle refresh and start workout actions
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleStartWorkout = () => {
    navigate('/workout-builder');
  };

  // Handle go to exercise library
  const handleGoToExerciseLibrary = () => {
    navigate('/exercise-library');
  };

  // Handle schedule workout
  const handleScheduleWorkout = () => {
    navigate('/schedule');
  };

  // Handle add/remove favorites
  const handleAddFavorite = () => {
    navigate('/exercise-library');
  };

  const handleRemoveFavorite = async (id: string) => {
    toast({
      title: "Removed from favorites",
      description: "Exercise removed from favorites",
    });
    return Promise.resolve();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader 
          isLoading={isProfileLoading}
          onRefresh={handleRefresh}
          onStartWorkout={handleStartWorkout}
        />
        
        {isError ? (
          <DashboardError 
            errorMessage={error || 'An error occurred while loading dashboard data'} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuickActionsSection 
                upcomingWorkouts={upcomingWorkouts}
                isLoading={isLoading}
                onGoToExerciseLibrary={handleGoToExerciseLibrary}
                onScheduleWorkout={handleScheduleWorkout}
                onRefreshWorkouts={handleRefresh}
              />
              
              <div className="mb-6">
                <DashboardMetricsSection 
                  weeklyChartData={weeklyActivityData}
                  recentWorkouts={recentWorkouts}
                  isLoading={isLoading}
                  onSelectDate={setSelectedDate}
                  onSelectWorkout={handleSelectWorkout}
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <FavoritesAndAchievementsSection 
                favoriteExercises={favoriteExercises}
                achievements={[]}
                isLoading={isLoading}
                onAddFavorite={handleAddFavorite}
                onRemoveFavorite={handleRemoveFavorite}
              />
              
              <div className="mt-6">
                <UpcomingWorkouts 
                  workouts={upcomingWorkouts} 
                  isLoading={isLoading}
                  onScheduleWorkout={handleScheduleWorkout}
                  onRefresh={handleRefresh}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
