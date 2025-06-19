
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetricsSection from '@/components/dashboard/DashboardMetricsSection';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import FavoritesAndAchievementsSection from '@/components/dashboard/FavoritesAndAchievementsSection';
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises';
import { useUpcomingWorkouts } from '@/hooks/use-upcoming-workouts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import DashboardError from '@/components/dashboard/DashboardError';
import { useProfile } from '@/hooks/use-profile';
import { useWorkouts } from '@/hooks/workouts';
import { useActivityProgress } from '@/hooks/use-activity-progress';
import SuggestionDisplay from '@/components/dashboard/SuggestionDisplay';

// Import components with default exports

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: profileLoading } = useProfile();
  const { exercises, isLoading: exercisesLoading } = useFavoriteExercises();
  useUpcomingWorkouts(); // workouts and workoutsLoading were unused
  const { workouts: recentWorkouts } = useWorkouts(); // recentWorkoutsLoading was unused
  const { weeklyData, isLoading: weeklyDataLoading } = useActivityProgress();
  const [error, setError] = useState<Error | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [fitbitSteps, setFitbitSteps] = useState<number | null>(null);
  const [fitbitLoading, setFitbitLoading] = useState<boolean>(false);
  const [fitbitError, setFitbitError] = useState<string | null>(null);
  const [stepGoal, setStepGoal] = useState<number>(10000); // Default goal
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Debug: List available workout tables and counts
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
        
        // Get a sample of available workouts
        const { data: sampleWorkouts } = await supabase
          .from('prepared_workouts')
          .select('*')
          .limit(3);
          
        console.log('Sample workouts:', sampleWorkouts);
        
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

  useEffect(() => {
    if (fitbitSteps !== null && stepGoal > 0) {
      const progress = (fitbitSteps / stepGoal) * 100;
      if (progress >= 70 && progress < 100) {
        setActiveSuggestion("You're close to your step goal, how about a quick walk?");
      } else {
        setActiveSuggestion(null);
      }
    } else {
      setActiveSuggestion(null);
    }
  }, [fitbitSteps, stepGoal]);

  useEffect(() => {
    const fetchFitbitData = async () => {
      if (!user) return;

      setFitbitLoading(true);
      setFitbitError(null);
      try {
        // Fetch user's step goal from their profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('daily_step_goal')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching step goal:', profileError);
          // We can proceed with the default goal, so no need to throw an error
        } else if (profileData?.daily_step_goal) {
          setStepGoal(profileData.daily_step_goal);
        }

        // Ensure the function name matches exactly what's deployed in Supabase
        const { data, error: invokeError } = await supabase.functions.invoke('fitbit-fetch-data', {
          // body: {}, // Send empty body if not needed, or specific parameters
          // method: 'POST', // Supabase client defaults to POST for invoke
        });

        if (invokeError) {
          if (invokeError.message.toLowerCase().includes('fitbit not connected')) {
            setFitbitError('Connect Fitbit in Profile'); // Shorter message for UI
          } else if (invokeError.message.toLowerCase().includes('failed to fetch') || invokeError.message.toLowerCase().includes('network error')) {
            setFitbitError('Network issue fetching steps.');
          } else {
            // Generic error for other Supabase function invocation issues
            setFitbitError('Could not fetch steps.');
          }
          console.error('Supabase function invoke error:', invokeError);
          setFitbitSteps(null);
        } else if (data && typeof data.steps !== 'undefined') {
          setFitbitSteps(data.steps);
        } else {
          // Handle cases where data is returned but not in the expected format
          console.warn('Fitbit data received but steps not found or in unexpected format:', data);
          setFitbitError('Steps data unavailable.');
          setFitbitSteps(null);
        }
      } catch (err: any) {
        console.error("Error fetching Fitbit data:", err);
        setFitbitError("Couldn't load Fitbit steps.");
        setFitbitSteps(null);
      } finally {
        setFitbitLoading(false);
      }
    };

    fetchFitbitData();
  }, [user, supabase]); // Added supabase to dependency array as it's used inside

  if (error) {
    return (
      <AppLayout>
        <DashboardError
          errorMessage={error.message || "Something went wrong. Please try again later."}
        />
      </AppLayout>
    );
  }

  const handleStartWorkout = async () => {
    try {
      setIsLoadingRandom(true);
      
      // Get all available workout types
      const [
        { data: preparedWorkouts, error: preparedError },
        { data: wods, error: wodsError },
        { data: mindfulMovements, error: mindfulError }
      ] = await Promise.all([
        supabase.from('prepared_workouts').select('*').limit(100),
        supabase.from('wods').select('*').limit(100),
        supabase.from('mindful_movements').select('*').limit(100)
      ]);
      
      // Log any errors but continue with available data
      if (preparedError) console.error('Error fetching prepared workouts:', preparedError);
      if (wodsError) console.error('Error fetching WODs:', wodsError);
      if (mindfulError) console.error('Error fetching mindful movements:', mindfulError);
      
      // Filter out any empty or invalid responses
      const allOptions = [
        ...(preparedWorkouts || []).map((w: any) => ({ ...w, type: 'workout' })),
        ...(wods || []).map((w: any) => ({ ...w, type: 'wod' })),
        ...(mindfulMovements || []).map((m: any) => ({ ...m, type: 'mindful' }))
      ].filter(Boolean); // Remove any null/undefined items
      
      console.log('Available workout options:', allOptions);
      
      if (allOptions.length === 0) {
        console.log('No workout options available, redirecting to new workout');
        navigate('/workouts/new');
        return;
      }
      
      // Select a random item
      const randomItem = allOptions[Math.floor(Math.random() * allOptions.length)];
      console.log('Selected random workout:', randomItem);
      
      // Navigate based on the type
      switch (randomItem.type) {
        case 'workout':
          // First check if the workout exists
          const { data: workout, error: workoutError } = await supabase
            .from('prepared_workouts')
            .select('*')
            .eq('id', randomItem.id)
            .single();
            
          if (workoutError || !workout) {
            console.error('Workout not found:', randomItem.id, workoutError);
            throw new Error('Workout not found');
          }
          
          navigate(`/workouts/${randomItem.id}`);
          break;
          
        case 'wod':
          const { data: wod, error: wodError } = await supabase
            .from('wods')
            .select('*')
            .eq('id', randomItem.id)
            .single();
            
          if (wodError || !wod) {
            console.error('WOD not found:', randomItem.id, wodError);
            throw new Error('WOD not found');
          }
          
          navigate(`/wods/${randomItem.id}`);
          break;
          
        case 'mindful':
          const { data: mindful, error: mindfulErrorCheck } = await supabase
            .from('mindful_movements')
            .select('*')
            .eq('id', randomItem.id)
            .single();
            
          if (mindfulErrorCheck || !mindful) {
            console.error('Mindful movement not found:', randomItem.id, mindfulErrorCheck);
            throw new Error('Mindful movement not found');
          }
          
          navigate(`/mindful-movement/${randomItem.id}`);
          break;
          
        default:
          console.log('No valid workout type, redirecting to new workout');
          navigate('/workouts/new');
      }
    } catch (error) {
      console.error('Error in handleStartWorkout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start workout. Creating a new one instead.',
        variant: 'destructive',
      });
      navigate('/workouts/new');
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DashboardHeader 
          isLoading={profileLoading || isLoadingRandom || fitbitLoading}
          onRefresh={handleRefresh}
          onStartWorkout={handleStartWorkout}
          fitbitSteps={fitbitSteps}
          fitbitError={fitbitError}
          dailyStepGoal={stepGoal}
        />
        <SuggestionDisplay suggestion={activeSuggestion} />

        <div className="flex flex-col space-y-8">
          {/* Quick Actions Bar */}
          <div className="w-full">
            <QuickActionsSection
              onScheduleWorkout={handleStartWorkout}
            />
          </div>

          {/* Main Content */}
          <div className="w-full space-y-8">
            <DashboardMetricsSection 
              weeklyChartData={weeklyData || []}
              recentWorkouts={recentWorkouts || []}
              isLoading={weeklyDataLoading} 
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;
