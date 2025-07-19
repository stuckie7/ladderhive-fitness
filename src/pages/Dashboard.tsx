import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetricsSection from '@/components/dashboard/DashboardMetricsSection';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import FavoritesAndAchievementsSection from '@/components/dashboard/FavoritesAndAchievementsSection';
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises';
import { useFitbitData } from '@/hooks/use-fitbit-data';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import DashboardError from '@/components/dashboard/DashboardError';
import { useProfile } from '@/hooks/use-profile';
import { useWorkouts } from '@/hooks/workouts';
import { useActivityProgress } from '@/hooks/use-activity-progress';
import SuggestionDisplay from '@/components/dashboard/SuggestionDisplay';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Test message for deployment verification
  const testMessage = 'Page loaded at: ' + new Date().toLocaleString();
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: profileLoading } = useProfile();
  const { exercises, isLoading: exercisesLoading } = useFavoriteExercises();
  const { 
    stats: fitbitStats, 
    isConnected: isFitbitConnected, 
    isLoading: fitbitLoading, 
    error: fitbitError 
  } = useFitbitData();
  const { workouts: recentWorkouts, isLoading: recentWorkoutsLoading } = useWorkouts();
  const { weeklyData, isLoading: weeklyDataLoading } = useActivityProgress();
  const [error, setError] = useState<Error | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const [stepGoal, setStepGoal] = useState<number>(10000); // Default goal
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);



  // This useEffect is for debugging workout data availability, seems useful to keep.
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching workout data for debugging...');
        
        const [
          { count: workoutsCount },
          { count: wodsCount },
          { count: mindfulCount },
          { count: userWorkoutsCount }
        ] = await Promise.all([
          supabase.from('prepared_workouts').select('*', { count: 'exact', head: true }),
          supabase.from('wods').select('*', { count: 'exact', head: true }),
          supabase.from('mindful_movements').select('*', { count: 'exact', head: true }),
          supabase.from('user_workouts').select('*', { count: 'exact', head: true })
        ]);
        
        console.log('Available workout counts:', {
          preparedWorkouts: workoutsCount || 0,
          wods: wodsCount || 0,
          mindfulMovements: mindfulCount || 0,
          userWorkouts: userWorkoutsCount || 0
        });
        
      } catch (err) {
        console.error("Error fetching dashboard debug data:", err);
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('An unknown error occurred while fetching debug data'));
        }
      }
    };

    if (user) {
        fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleStepGoalChange = (newGoal: number) => {
    setStepGoal(newGoal);
    // Future: Add logic to persist this change (e.g., to user profile in Supabase)
    toast({
      title: "Step Goal Updated",
      description: `Your daily step goal is now ${newGoal.toLocaleString()}.`,
    });
  };

  // useEffect for generating suggestions based on Fitbit data
  useEffect(() => {
    if (fitbitStats?.steps !== undefined && stepGoal > 0) {
      const progress = (fitbitStats.steps / stepGoal) * 100;
      if (progress >= 70 && progress < 100) {
        setActiveSuggestion("You're close to your step goal, how about a quick walk?");
      } else {
        setActiveSuggestion(null);
      }
    } else {
      setActiveSuggestion(null);
    }
  }, [fitbitStats, stepGoal]);

  // useEffect to handle the post-disconnect redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('fitbit_disconnected')) {
      toast({
        title: "Fitbit Disconnected",
        description: "Your Fitbit account has been successfully disconnected.",
      });
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);


  if (error) {
    return (
      <AppLayout>
        <DashboardError
          errorMessage={error.message || "Something went wrong. Please try again later."}
        />
      </AppLayout>
    );
  }

  const handleStartWorkout = async (workoutId?: string) => {
    try {
      setIsLoadingRandom(true);
      
      if (workoutId) {
        // Navigate directly to the workout player for the specific workout
        navigate(`/workout-player/${workoutId}`);
        return;
      }
      
      // Default behavior for the main start button
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        // Navigate to the workout player with the most recent workout
        navigate(`/workout-player/${data.id}`);
      } else {
        // If no workouts exist, create a new one
        const { data: newWorkout, error: createError } = await supabase
          .from('prepared_workouts')
          .insert([{ 
            title: 'Quick Workout',
            description: 'Your personalized workout',
            created_at: new Date().toISOString()
          }])
          .select('id')
          .single();
          
        if (createError) throw createError;
        
        if (newWorkout) {
          navigate(`/workout-player/${newWorkout.id}`);
        }
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: "Error",
        description: "Could not start workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isLoading = profileLoading || isLoadingRandom || fitbitLoading || exercisesLoading || recentWorkoutsLoading || weeklyDataLoading;

  return (
    <AppLayout>
      {/* Test message for deployment verification */}
      {isVisible && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 relative" role="alert">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium">🚀 Deployment Test Active</p>
              <div className="text-sm mt-1">
                <p>{testMessage}</p>
                <p className="mt-1 text-blue-600">This message confirms your deployment was successful!</p>
              </div>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-blue-500 hover:text-blue-700 focus:outline-none"
              aria-label="Close notification"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DashboardHeader 
          isLoading={isLoading}
          fitbitStats={fitbitStats}
          isFitbitConnected={isFitbitConnected}
          fitbitError={fitbitError}
          dailyStepGoal={stepGoal}
          onStepGoalChange={handleStepGoalChange}
        />
        <SuggestionDisplay suggestion={activeSuggestion} />

        <div className="mt-8 flex flex-col space-y-8">
          <QuickActionsSection
            onScheduleWorkout={handleStartWorkout}
            fitbitStats={fitbitStats}
          />

          <DashboardMetricsSection 
            weeklyChartData={weeklyData || []}
            recentWorkouts={recentWorkouts || []}
            isLoading={weeklyDataLoading || recentWorkoutsLoading} 
            onSelectDate={(date) => console.log("Selected date", date)}
            onSelectWorkout={(id) => navigate(`/workouts/${id}`)}
          />

          <FavoritesAndAchievementsSection 
            favoriteExercises={exercises}
            achievements={[]}
            isLoading={exercisesLoading}
            onAddFavorite={() => navigate('/exercises')}
            onRemoveFavorite={async (id) => {
              console.log("Remove favorite", id);
              // Implementation would go here
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
