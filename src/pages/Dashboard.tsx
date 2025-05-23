
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

  const handleStartWorkout = async () => {
    try {
      setIsLoadingRandom(true);
      
      // Fetch all available options
      const [workoutsRes, wodsRes, mindfulRes] = await Promise.all([
        fetch('/api/workouts?limit=100'),
        fetch('/api/wods?limit=100'),
        fetch('/api/mindful-movements?limit=100')
      ]);
      
      if (!workoutsRes.ok || !wodsRes.ok || !mindfulRes.ok) {
        throw new Error('Failed to fetch workout options');
      }
      
      const [workoutsData, wodsData, mindfulData] = await Promise.all([
        workoutsRes.json(),
        wodsRes.json(),
        mindfulRes.json()
      ]);
      
      // Filter out any empty or invalid responses
      const allOptions = [
        ...(workoutsData?.data || []).map((w: any) => ({ ...w, type: 'workout' })),
        ...(wodsData?.data || []).map((w: any) => ({ ...w, type: 'wod' })),
        ...(mindfulData?.data || []).map((m: any) => ({ ...m, type: 'mindful' }))
      ];
      
      if (allOptions.length === 0) {
        // Fallback to creating a new workout if no options are available
        navigate('/workouts/new');
        return;
      }
      
      // Select a random item
      const randomItem = allOptions[Math.floor(Math.random() * allOptions.length)];
      
      // Navigate based on the type
      switch (randomItem.type) {
        case 'workout':
          navigate(`/workouts/${randomItem.id}`);
          break;
        case 'wod':
          navigate(`/wods/${randomItem.id}`);
          break;
        case 'mindful':
          navigate(`/mindful-movement/${randomItem.id}`);
          break;
        default:
          navigate('/workouts/new');
      }
    } catch (error) {
      console.error('Error selecting random workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to select a random workout. Creating a new one instead.',
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
