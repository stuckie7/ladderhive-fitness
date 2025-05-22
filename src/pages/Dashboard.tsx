
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetricsSection from '@/components/dashboard/DashboardMetricsSection';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import FavoritesAndAchievementsSection from '@/components/dashboard/FavoritesAndAchievementsSection';
import WorkoutHistory from '@/components/dashboard/WorkoutHistory';
import { useProfile } from '@/hooks/use-profile';
import { useWorkoutStats } from '@/hooks/use-workout-stats';
import { useRecentWorkouts } from '@/hooks/use-recent-workouts';
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises';
import { useUpcomingWorkouts } from '@/hooks/use-upcoming-workouts';
import DashboardError from '@/components/dashboard/DashboardError';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { weeklyActivityData, isLoading: statsLoading, error: statsError } = useWorkoutStats();
  const { workouts: recentWorkouts, isLoading: recentWorkoutsLoading, error: recentWorkoutsError } = useRecentWorkouts();
  const { exercises: favoriteExercises, isLoading: favoritesLoading, error: favoritesError } = useFavoriteExercises();
  const { workouts: upcomingWorkouts, isLoading: upcomingLoading, error: upcomingError } = useUpcomingWorkouts();

  // Aggregated loading state
  const isLoading = profileLoading || statsLoading || recentWorkoutsLoading || favoritesLoading || upcomingLoading;

  // Error state
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Collect any errors
    const errors = [profileError, statsError, recentWorkoutsError, favoritesError, upcomingError].filter(Boolean);
    
    if (errors.length > 0) {
      // Convert the first error to string
      const firstError = errors[0];
      if (typeof firstError === 'string') {
        setErrorMessage(firstError);
      } else if (firstError instanceof Error) {
        setErrorMessage(firstError.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  }, [profileError, statsError, recentWorkoutsError, favoritesError, upcomingError]);

  // Navigation handlers
  const goToWorkouts = () => navigate('/workouts');
  const goToExercises = () => navigate('/exercises');
  const goToSchedule = () => navigate('/schedule');

  // Promise-based handlers for component props
  const handleRefreshWorkouts = async (): Promise<void> => {
    // This is a placeholder that returns a promise
    return Promise.resolve();
  };

  const handleAddFavorite = async (id: string): Promise<void> => {
    // Placeholder implementation
    return Promise.resolve();
  };

  const handleRemoveFavorite = async (id: string): Promise<void> => {
    // Placeholder implementation
    return Promise.resolve();
  };

  // Mock data for achievements
  const achievements = [
    { id: '1', title: 'First Workout', description: 'Completed your first workout', date: '2023-04-01', icon: '🎯' },
    { id: '2', title: 'Consistency', description: 'Worked out 3 days in a row', date: '2023-04-05', icon: '🔥' },
  ];
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header - fixed to use expected prop name */}
        <DashboardHeader 
          firstName={profile?.first_name || user?.email?.split('@')[0] || 'User'} 
          isLoading={isLoading} 
        />
        
        {/* Handle error state */}
        {errorMessage ? (
          <DashboardError 
            errorMessage={errorMessage} 
          />
        ) : (
          <>
            {/* Quick Actions Panel */}
            <QuickActionsSection 
              upcomingWorkouts={upcomingWorkouts || []}
              isLoading={isLoading}
              onGoToExerciseLibrary={goToExercises}
              onScheduleWorkout={goToSchedule}
              onRefreshWorkouts={handleRefreshWorkouts}
            />
            
            {/* Metrics Section - Activity data */}
            <DashboardMetricsSection 
              activityData={weeklyActivityData || []} 
              isLoading={isLoading} 
            />
            
            {/* Favorites and Achievements */}
            <FavoritesAndAchievementsSection 
              favoriteExercises={favoriteExercises || []}
              achievements={achievements}
              isLoading={isLoading}
              onAddFavorite={handleAddFavorite}
              onRemoveFavorite={handleRemoveFavorite}
            />
            
            {/* Recent Workouts */}
            <WorkoutHistory 
              workouts={recentWorkouts || []}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
