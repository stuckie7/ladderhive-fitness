
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format, subDays } from 'date-fns';
import { Exercise } from '@/types/exercise';

export interface DashboardData {
  recentWorkouts: any[];
  upcomingWorkouts: any[];
  favoriteExercises: Exercise[];
  achievements: any[];
  metrics: {
    totalWorkouts: number;
    totalMinutes: number;
    workoutsThisWeek: number;
    completionRate: number;
    currentStreak: number;
    totalWeight: number;
  };
  weeklyChartData: any[];
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentWorkouts: [],
    upcomingWorkouts: [],
    favoriteExercises: [],
    achievements: [],
    metrics: {
      totalWorkouts: 0,
      totalMinutes: 0,
      workoutsThisWeek: 0,
      completionRate: 0,
      currentStreak: 0,
      totalWeight: 0
    },
    weeklyChartData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // For demo purposes, we'll generate some mock data
        // In a real app, you would fetch this from Supabase
        
        // Mock recent workouts (last 7 days)
        const recentWorkouts = Array.from({ length: 5 }, (_, i) => ({
          id: `workout-${i}`,
          title: `Workout ${['A', 'B', 'C', 'D', 'E'][i]}`,
          date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
          duration: 30 + Math.floor(Math.random() * 30),
          exercises: 5 + Math.floor(Math.random() * 5),
          completed: i !== 0
        }));
        
        // Mock upcoming workouts (next 7 days)
        const upcomingWorkouts = Array.from({ length: 3 }, (_, i) => ({
          id: `upcoming-${i}`,
          title: `${['Upper Body', 'Lower Body', 'Full Body'][i]} Workout`,
          date: format(subDays(new Date(), -i - 1), 'yyyy-MM-dd'),
          duration: 45 + Math.floor(Math.random() * 15),
          difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]
        }));
        
        // Mock favorite exercises (would come from user preferences)
        const favoriteExercises = Array.from({ length: 4 }, (_, i) => ({
          id: `exercise-${i}`,
          name: [`Bench Press`, `Squats`, `Deadlift`, `Pull-ups`][i],
          muscle_group: ['Chest', 'Legs', 'Back', 'Back'][i],
          equipment: ['Barbell', 'Barbell', 'Barbell', 'Bodyweight'][i]
        })) as Exercise[];
        
        // Mock achievements
        const achievements = [
          {
            id: 'achievement-1',
            title: 'First Workout',
            description: 'Complete your first workout',
            icon: 'award' as const,
            unlockedAt: '2023-05-01'
          },
          {
            id: 'achievement-2',
            title: '5 Workouts',
            description: 'Complete 5 workouts',
            icon: 'award' as const,
            unlockedAt: '2023-05-10'
          },
          {
            id: 'achievement-3',
            title: '10,000 lbs Lifted',
            description: 'Lift a total of 10,000 lbs',
            icon: 'trophy' as const,
            progress: 7500,
            maxProgress: 10000
          },
          {
            id: 'achievement-4',
            title: '7-Day Streak',
            description: 'Work out for 7 days in a row',
            icon: 'medal' as const,
            progress: 4,
            maxProgress: 7
          }
        ];
        
        // Mock metrics
        const metrics = {
          totalWorkouts: 24,
          totalMinutes: 1250,
          workoutsThisWeek: 3,
          completionRate: 85,
          currentStreak: 4,
          totalWeight: 7500
        };
        
        // Mock weekly chart data
        const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
          const day = format(subDays(new Date(), 6 - i), 'EEE');
          return {
            day,
            weight: Math.floor(Math.random() * 2000) + 1000,
            duration: Math.floor(Math.random() * 60) + 15
          };
        });
        
        setDashboardData({
          recentWorkouts,
          upcomingWorkouts,
          favoriteExercises,
          achievements,
          metrics,
          weeklyChartData
        });
        
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);

  return {
    ...dashboardData,
    isLoading
  };
};
