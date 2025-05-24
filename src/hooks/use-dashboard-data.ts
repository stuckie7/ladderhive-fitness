
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";
import { supabase } from "@/lib/supabase";
import { Wod } from "@/types/wod";
import { PreparedWorkout } from "@/types/workout";
import { addDays, isBefore, parseISO } from "date-fns";

// Define extended types with scheduledDate property but make problematic required properties optional
interface ScheduledWod {
  id: string;
  scheduledDate: string;
  type: string;
  title: string;
  name?: string;
  description: string;
  difficulty: string;
  duration_minutes?: number;  // Made optional to match Wod type
  avg_duration_minutes?: number;
  category: string;
  created_at: string;
  is_favorite?: boolean;
}

interface ScheduledWorkout extends Omit<PreparedWorkout, 'goal'> {
  scheduledDate: string;
  goal?: string;
  type?: string;
}

// This function will fetch dashboard data from various data sources
const fetchDashboardData = async (userId: string) => {
  // In a real implementation, this would fetch data from Supabase tables
  // For now, we'll return mock data that matches your expected structure

  // Mock favorite exercises
  const favoriteExercises = [
    {
      id: "ex-1",
      name: "Barbell Bench Press",
      muscle_group: "Chest",
      bodyPart: "Chest",
      description: "A compound chest exercise focusing on pectoral development",
      difficulty: "Intermediate",
      video_url: null,
      image_url: "https://example.com/bench-press.webp",
    },
    {
      id: "ex-2",
      name: "Squat",
      muscle_group: "Legs",
      bodyPart: "Quadriceps",
      description: "A fundamental lower body compound exercise",
      difficulty: "Intermediate",
      video_url: null,
      image_url: "https://example.com/squat.webp",
    },
    {
      id: "ex-3",
      name: "Deadlift",
      muscle_group: "Back",
      bodyPart: "Lower Back",
      description: "A compound exercise that works multiple major muscle groups",
      difficulty: "Advanced",
      video_url: null,
      image_url: "https://example.com/deadlift.webp",
    },
    {
      id: "ex-4",
      name: "Pull-up",
      muscle_group: "Back",
      bodyPart: "Lats",
      description: "A bodyweight back exercise focusing on lat development",
      difficulty: "Intermediate",
      video_url: null,
      image_url: "https://example.com/pull-up.webp",
    },
  ];

  // Mock recent workouts for workout history
  const recentWorkouts = [
    {
      id: "w-1",
      date: new Date().toISOString(),
      title: "Morning Push Workout",
      duration: 45,
      exercises: 4,
      completed: true,
    },
    {
      id: "w-2",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      title: "Pull Day",
      duration: 55,
      exercises: 5,
      completed: true,
    },
    {
      id: "w-3",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      title: "Leg Day",
      duration: 60,
      exercises: 6,
      completed: true,
    },
    {
      id: "w-4",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      title: "Full Body Workout",
      duration: 75,
      exercises: 8,
      completed: true,
    },
    {
      id: "w-5",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      title: "Planned Push Workout",
      duration: 45,
      exercises: 5,
      completed: false,
    },
  ];

  // Fetch random WODs from Supabase
  let wods: ScheduledWod[] = [];
  try {
    const { data: wodData, error: wodError } = await supabase
      .from('wods')
      .select('id, name, description, difficulty, avg_duration_minutes, category')
      .limit(2);
    
    if (wodError) throw wodError;
    
    if (wodData && wodData.length > 0) {
      wods = wodData.map(wod => ({
        id: wod.id,
        title: wod.name || '',  // Ensure title is set for ScheduledWod
        name: wod.name,
        scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: wod.avg_duration_minutes || 30,
        avg_duration_minutes: wod.avg_duration_minutes,
        description: wod.description || '',
        difficulty: wod.difficulty || 'intermediate',
        category: wod.category || '',
        created_at: new Date().toISOString(),
        type: 'wod'
      }));
    }
  } catch (error) {
    console.error("Error fetching WODs:", error);
  }

  // Fetch random prepared workouts from Supabase
  let preparedWorkouts: ScheduledWorkout[] = [];
  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from('prepared_workouts')
      .select('id, title, description, difficulty, duration_minutes, category')
      .limit(2);
    
    if (workoutError) throw workoutError;
    
    if (workoutData && workoutData.length > 0) {
      preparedWorkouts = workoutData.map(workout => ({
        ...workout,
        scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        type: 'workout'
      }));
    }
  } catch (error) {
    console.error("Error fetching prepared workouts:", error);
  }

  // Combine the fetched WODs and prepared workouts into upcomingWorkouts
  // This will ensure we have a mix of both types
  const upcomingWorkouts = [
    ...wods.map(wod => ({
      id: wod.id,
      title: wod.name || wod.title, 
      date: wod.scheduledDate, 
      duration: wod.avg_duration_minutes || wod.duration_minutes || 30,
      difficulty: wod.difficulty || "Intermediate",
      type: 'wod'
    })),
    ...preparedWorkouts.map(workout => ({
      id: workout.id,
      title: workout.title,
      date: workout.scheduledDate,
      duration: workout.duration_minutes,
      difficulty: workout.difficulty || "Intermediate",
      type: 'workout'
    }))
  ].sort(() => Math.random() - 0.5); // Shuffle the array for randomness

  // Mock achievements
  const achievements = [
    {
      id: "a-1",
      title: "First Workout",
      description: "Completed your first workout",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
      icon: "Trophy",
      completed: true
    },
    {
      id: "a-2",
      title: "Consistent Athlete",
      description: "Workout 3 days in a row",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      icon: "Award",
      completed: true
    },
    {
      id: "a-3",
      title: "Strength Milestone",
      description: "Bench press bodyweight",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      icon: "Dumbbell",
      completed: true
    },
    {
      id: "a-4",
      title: "Century Club",
      description: "Complete 100 total workouts",
      progress: 45,
      icon: "Hundred",
      completed: false
    }
  ];

  // Mock metrics data for charts and stats
  const metrics = {
    totalWorkouts: 45,
    workoutsThisWeek: 3,
    completionRate: 92,
    totalMinutes: 2430,
    currentStreak: 3,
    totalWeight: 18240,
  };

  // Mock weekly chart data
  const weeklyChartData = [
    { name: 'Mon', minutes: 45, weight: 3200 },
    { name: 'Tue', minutes: 0, weight: 0 },
    { name: 'Wed', minutes: 60, weight: 4100 },
    { name: 'Thu', minutes: 30, weight: 2100 },
    { name: 'Fri', minutes: 0, weight: 0 },
    { name: 'Sat', minutes: 75, weight: 5300 },
    { name: 'Sun', minutes: 0, weight: 0 },
  ];

  return {
    favoriteExercises,
    recentWorkouts,
    upcomingWorkouts,
    achievements,
    metrics,
    weeklyChartData
  };
};

// Update the function that processes scheduled Wods
const processScheduledWorkouts = (workoutData: any[]): ScheduledWod[] => {
  if (!workoutData || workoutData.length === 0) return [];
  
  // Map the data to our ScheduledWod interface
  return workoutData.map(item => {
    const title = item.name || item.title || '';
    return {
      id: item.id,
      title: title,
      name: item.name || item.title || '',  // Add name for compatibility
      scheduledDate: item.scheduledDate || new Date().toISOString(),
      type: item.type || 'workout',
      description: item.description || '',
      difficulty: item.difficulty || 'intermediate',
      duration_minutes: item.duration_minutes || item.avg_duration_minutes || 30,
      avg_duration_minutes: item.avg_duration_minutes || item.duration_minutes || 30, // Add for compatibility
      category: item.category || '',
      created_at: item.created_at || new Date().toISOString(),
      is_favorite: item.is_favorite || false
    };
  });
};

// Update the groupWorkoutsByDay function to handle the updated ScheduledWod interface
const groupWorkoutsByDay = (workouts: ScheduledWod[]) => {
  const grouped: { [key: string]: ScheduledWod[] } = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.scheduledDate).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push({
      ...workout,
      title: workout.title || workout.name || '',  // Use title or name
    });
  });
  
  return grouped;
};

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteExercises, setFavoriteExercises] = useState<Exercise[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalWorkouts: 0,
    workoutsThisWeek: 0,
    completionRate: 0,
    totalMinutes: 0,
    currentStreak: 0,
    totalWeight: 0,
  });
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to refresh upcoming workouts periodically
  const refreshUpcomingWorkouts = async () => {
    try {
      const userId = user?.id || 'demo-user';
      const data = await fetchDashboardData(userId);
      setUpcomingWorkouts(data.upcomingWorkouts);
    } catch (error) {
      console.error("Error refreshing upcoming workouts:", error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If user is not logged in, we can still show demo data
        const userId = user?.id || 'demo-user';
        
        // Fetch dashboard data (this would normally come from Supabase)
        const data = await fetchDashboardData(userId);
        
        // Update state with fetched data
        setFavoriteExercises(data.favoriteExercises);
        setRecentWorkouts(data.recentWorkouts);
        setUpcomingWorkouts(data.upcomingWorkouts);
        setAchievements(data.achievements);
        setMetrics(data.metrics);
        setWeeklyChartData(data.weeklyChartData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        toast({
          title: "Error loading dashboard",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Refresh upcoming workouts every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      refreshUpcomingWorkouts();
    }, 300000);

    return () => clearInterval(intervalId);
  }, [user, toast]);

  const addFavoriteExercise = async (exerciseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save favorite exercises",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real implementation, we would call Supabase here
      // await supabase.from('user_favorites').insert({ user_id: user.id, exercise_id: exerciseId });
      
      toast({
        title: "Success",
        description: "Exercise added to favorites",
      });
      
      // Refresh dashboard data
      const data = await fetchDashboardData(user.id);
      setFavoriteExercises(data.favoriteExercises);
    } catch (error) {
      console.error("Error adding favorite exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFavoriteExercise = async (exerciseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage favorite exercises",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real implementation, we would call Supabase here
      // await supabase
      //   .from('user_favorites')
      //   .delete()
      //   .eq('user_id', user.id)
      //   .eq('exercise_id', exerciseId);
      
      // Update state optimistically
      setFavoriteExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      
      toast({
        title: "Success",
        description: "Exercise removed from favorites",
      });
    } catch (error) {
      console.error("Error removing favorite exercise:", error);
      toast({
        title: "Error",
        description: "Failed to remove exercise from favorites",
        variant: "destructive",
      });
      
      // Refresh data to ensure consistency
      const data = await fetchDashboardData(user.id);
      setFavoriteExercises(data.favoriteExercises);
    }
  };

  // Function to manually refresh upcoming workouts
  const refreshWorkouts = async () => {
    setIsLoading(true);
    await refreshUpcomingWorkouts();
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    favoriteExercises,
    recentWorkouts,
    upcomingWorkouts,
    achievements,
    metrics,
    weeklyChartData,
    addFavoriteExercise,
    removeFavoriteExercise,
    refreshWorkouts
  };
};
