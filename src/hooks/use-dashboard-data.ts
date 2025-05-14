
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { Wod } from "@/types/wod";
import { PreparedWorkout } from "@/types/workout";
import { addDays, isBefore, parseISO } from "date-fns";

// Define extended types with scheduledDate property but make problematic required properties optional
interface ScheduledWod extends Omit<Wod, 'components'> {
  scheduledDate: string;
  components?: Wod['components'];
  duration_minutes?: number;
  type?: string;
}

interface ScheduledWorkout extends Omit<PreparedWorkout, 'goal'> {
  scheduledDate: string;
  goal?: string;
  type?: string;
}

// Interface for our favorite exercises that matches the DB structure
interface FavoriteExercise extends Omit<Exercise, 'id'> {
  id: number | string;
  name: string;
  target: string;
  equipment: string;
  image_url: string;
}

// This function will fetch dashboard data from various data sources
export const useDashboardData = () => {
  // Authentication and toast
  const { user } = useAuth();
  const { toast } = useToast();

  // State variables
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<any[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<FavoriteExercise[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalWorkouts: 0,
    workoutsThisWeek: 0,
    completionRate: 0,
    totalMinutes: 0,
    currentStreak: 0,
    totalWeight: 0,
  });
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load all dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Main function to load all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load data in parallel
      await Promise.all([
        loadRecentWorkouts(),
        loadUpcomingWorkouts(),
        loadFavoriteExercises(),
        loadAchievements(),
        loadMetrics(),
      ]);

    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Error loading dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load recent workouts
  const loadRecentWorkouts = async () => {
    if (!user) return;

    try {
      // Query for recent workouts from user_workouts
      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          *,
          workout:prepared_workouts(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Generate sample data for testing
      const sampleRecentWorkouts = data && data.length > 0 
        ? data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            workout_id: item.workout_id,
            status: item.status,
            completed_at: item.completed_at,
            planned_for: item.planned_for,
            created_at: item.created_at,
            workout: item.workout ? {
              id: item.workout.id,
              title: item.workout.title,
              description: item.workout.description,
              duration_minutes: item.workout.duration_minutes,
              difficulty: item.workout.difficulty,
              category: item.workout.category
            } : null
          }))
        : generateSampleWorkouts(5, true);
      setRecentWorkouts(sampleRecentWorkouts);

      // Generate weekly chart data based on workout history
      generateWeeklyChartData(sampleRecentWorkouts);

    } catch (error) {
      console.error("Error loading recent workouts:", error);
    }
  };

  // Generate weekly chart data for visualization
  const generateWeeklyChartData = (workouts: any[]) => {
    // Create array for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString(undefined, { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        minutes: 0,
        count: 0,
      };
    });

    // Map workout data to chart data
    workouts.forEach(workout => {
      const completedDate = workout.completed_at || workout.created_at;
      if (!completedDate) return;
      
      const workoutDate = new Date(completedDate).toISOString().split('T')[0];
      const dayIndex = last7Days.findIndex(day => day.date === workoutDate);

      if (dayIndex !== -1) {
        last7Days[dayIndex].count += 1;
        last7Days[dayIndex].minutes += workout.workout?.duration_minutes || 30;
      }
    });

    setWeeklyChartData(last7Days);
  };

  // Load upcoming scheduled workouts
  const loadUpcomingWorkouts = async () => {
    if (!user) return;

    // First try to load from the database
    await loadScheduledWorkouts();
    
    // If not enough scheduled workouts, mix with upcoming WODs and prepared workouts
    await loadRandomUpcoming();
  };

  // Load scheduled workouts from database
  const loadScheduledWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          *,
          workout:prepared_workouts(*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'scheduled')
        .gt('planned_for', new Date().toISOString())
        .order('planned_for', { ascending: true })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedWorkouts = data.map(item => {
          // Safely extract properties with null checks
          const workoutData = item.workout || {};
          
          return {
            id: item.id,
            title: workoutData.title || 'Unnamed Workout',
            date: item.planned_for, // Use 'date' consistently as expected by UpcomingWorkouts
            duration: workoutData.duration_minutes || 30,
            description: workoutData.description || '',
            difficulty: workoutData.difficulty || 'intermediate',
            category: workoutData.category || 'general',
            type: 'scheduled'
          };
        });
        setUpcomingWorkouts(mappedWorkouts);
      } 

    } catch (error) {
      console.error("Error loading scheduled workouts:", error);
    }
  };

  // Load random upcoming workouts and WODs
  const loadRandomUpcoming = async () => {
    try {
      let combined: any[] = [];
  
      // Load some WODs
      const { data: wods, error: wodsError } = await supabase
        .from('wods')
        .select('*')
        .limit(3);
      
      if (wodsError) throw wodsError;
  
      if (wods && wods.length > 0) {
        const wodItems = wods.map(wod => {
          // Generate a valid date string for upcoming workouts
          const randomFutureDays = Math.floor(Math.random() * 7) + 1;
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + randomFutureDays);
          
          return {
            id: wod.id,
            title: wod.name || 'Unnamed WOD', // Ensure title exists
            description: wod.description || '',
            difficulty: wod.difficulty || 'intermediate',
            duration: wod.avg_duration_minutes || 30,
            date: scheduledDate.toISOString(), // Use ISO string format consistently
            category: wod.category || 'WOD',
            type: 'wod'
          };
        });
        combined = [...combined, ...wodItems];
      }
  
      // Load some prepared workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .limit(3);
      
      if (workoutsError) throw workoutsError;
  
      if (workouts && workouts.length > 0) {
        const workoutItems = workouts.map(workout => {
          // Generate a valid date string for upcoming workouts
          const randomFutureDays = Math.floor(Math.random() * 7) + 1;
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + randomFutureDays);
          
          return {
            id: workout.id,
            title: workout.title || 'Unnamed Workout', // Ensure title exists
            description: workout.description || '',
            difficulty: workout.difficulty || 'intermediate',
            duration: workout.duration_minutes || 30,
            date: scheduledDate.toISOString(), // Use ISO string format consistently
            category: workout.category || 'General',
            type: 'workout'
          };
        });
        combined = [...combined, ...workoutItems];
      }
  
      // Shuffle and limit
      combined.sort(() => Math.random() - 0.5);
      combined = combined.slice(0, 5);
  
      // Sort by date
      combined.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      });
  
      setUpcomingWorkouts(combined);
    } catch (error) {
      console.error("Error loading random upcoming workouts:", error);
    }
  };

  // Load favorite exercises
  const loadFavoriteExercises = async () => {
    if (!user) return;

    try {
      // First check user_favorite_exercises (placeholder implementation)
      let favorites: FavoriteExercise[] = [];

      // If no favorites, generate sample data
      if (favorites.length === 0) {
        const { data, error } = await supabase
          .from('exercises_full')
          .select('*')
          .limit(5);

        if (error) throw error;

        if (data) {
          favorites = data.map(ex => ({
            id: ex.id.toString(), // Convert to string to match Exercise type
            name: ex.name || 'Unknown Exercise',
            target: ex.prime_mover_muscle || 'Full Body',
            equipment: ex.primary_equipment || 'Bodyweight',
            image_url: ex.youtube_thumbnail_url || ''
          }));
        }
      }

      setFavoriteExercises(favorites);
    } catch (error) {
      console.error("Error loading favorite exercises:", error);
    }
  };

  // Load user achievements
  const loadAchievements = async () => {
    // Placeholder implementation - will be replaced with real achievements
    const dummyAchievements = [
      {
        id: '1',
        title: 'First Workout',
        description: 'Completed your first workout',
        icon: '🏆',
        unlocked: true,
        date: new Date().toISOString()
      },
      {
        id: '2',
        title: '5 Workouts',
        description: 'Completed 5 workouts',
        icon: '🔥',
        unlocked: true,
        date: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Consistency',
        description: 'Worked out 3 days in a row',
        icon: '📈',
        unlocked: false
      },
    ];

    setAchievements(dummyAchievements);
  };

  // Load workout metrics
  const loadMetrics = async () => {
    if (!user) return;

    // Sample metrics calculation (to be replaced with real metrics)
    const totalWorkouts = Math.floor(Math.random() * 20) + 5;
    const workoutsThisWeek = Math.floor(Math.random() * 5) + 1;
    const completionRate = Math.floor(Math.random() * 30) + 70;
    const totalMinutes = (Math.floor(Math.random() * 20) + 10) * totalWorkouts;
    const currentStreak = Math.floor(Math.random() * 10) + 1;
    const totalWeight = (Math.floor(Math.random() * 500) + 500) * (Math.floor(totalWorkouts / 2) + 1);

    setMetrics({
      totalWorkouts,
      workoutsThisWeek,
      completionRate,
      totalMinutes,
      currentStreak,
      totalWeight
    });
  };

  // Generate sample workout data for testing
  const generateSampleWorkouts = (count: number, isCompleted: boolean = false) => {
    const workouts = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      workouts.push({
        id: `sample-${i}`,
        user_id: user?.id,
        workout_id: `workout-${i}`,
        status: isCompleted ? 'completed' : 'scheduled',
        completed_at: isCompleted ? date.toISOString() : null,
        planned_for: !isCompleted ? date.toISOString() : null,
        created_at: new Date(date.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        workout: {
          id: `workout-${i}`,
          title: `Sample Workout ${i + 1}`,
          description: `This is a sample workout description for testing purposes.`,
          duration_minutes: 30 + (i * 5),
          difficulty: i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'advanced',
          category: i % 4 === 0 ? 'strength' : i % 4 === 1 ? 'cardio' : i % 4 === 2 ? 'mobility' : 'hiit'
        }
      });
    }

    return workouts;
  };

  const removeFavoriteExercise = async (exerciseId: string): Promise<void> => {
    // Remove exercise from favorites
    setFavoriteExercises(prev => prev.filter(ex => ex.id.toString() !== exerciseId.toString()));
    
    toast({
      title: "Success",
      description: "Exercise removed from favorites",
    });
  };

  const refreshWorkouts = () => {
    loadDashboardData();
    toast({
      title: "Refreshed",
      description: "Your workout data has been refreshed",
    });
  };

  return {
    recentWorkouts,
    upcomingWorkouts,
    favoriteExercises,
    achievements,
    metrics,
    weeklyChartData,
    isLoading,
    error,
    removeFavoriteExercise,
    refreshWorkouts
  };
};
