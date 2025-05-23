
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
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import DashboardError from '@/components/dashboard/DashboardError';
import { useProfile } from '@/hooks/use-profile';
import { useWorkouts } from '@/hooks/workouts';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell } from 'lucide-react';
import { useActivityProgress } from '@/hooks/use-activity-progress';

// Import components with default exports
import UpcomingWorkouts from '@/components/dashboard/UpcomingWorkouts';

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
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

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

  const handleViewExercises = () => {
    navigate('/exercises');
  };

  const handleViewWorkouts = () => {
    navigate('/workouts');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DashboardHeader 
          isLoading={profileLoading || isLoadingRandom} 
          onRefresh={handleRefresh}
          onStartWorkout={handleStartWorkout}
        />

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
