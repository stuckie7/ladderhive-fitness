import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Exercise } from "@/types/exercise";

// This function will simulate fetching dashboard data from various data sources
// In a full implementation, this would call the Supabase client to get the actual data
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

  // Mock upcoming workouts
  const upcomingWorkouts = [
    {
      id: "w-5",
      title: "Push Workout",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 45,
      difficulty: "Intermediate"
    },
    {
      id: "w-6",
      title: "Pull Workout",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 days
      duration: 50,
      difficulty: "Intermediate"
    },
    {
      id: "w-7",
      title: "Leg Day",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // In 5 days
      duration: 55,
      difficulty: "Advanced"
    },
    {
      id: "w-8",
      title: "Recovery & Mobility",
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // In 6 days
      duration: 30,
      difficulty: "Beginner"
    }
  ];

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

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
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

  return {
    isLoading,
    favoriteExercises,
    recentWorkouts,
    upcomingWorkouts,
    achievements,
    metrics,
    weeklyChartData,
    addFavoriteExercise,
    removeFavoriteExercise
  };
};
