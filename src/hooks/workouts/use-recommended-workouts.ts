
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { addDays, format } from 'date-fns';

export interface RecommendedWorkout {
  id: string;
  title: string;
  date: string;
  duration: number;
  difficulty: string;
  type: 'wod' | 'workout' | 'mindful' | 'yoga';
  thumbnail?: string;
}

export const useRecommendedWorkouts = () => {
  const [workouts, setWorkouts] = useState<RecommendedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Function to fetch recommended workouts from different sources
  const fetchRecommendedWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from different sources
      const [preparedWorkouts, wods, yogaWorkouts] = await Promise.all([
        fetchPreparedWorkouts(),
        fetchWods(),
        fetchYogaWorkouts()
      ]);
      
      // Combine all workouts
      const allWorkouts = [...preparedWorkouts, ...wods, ...yogaWorkouts];
      
      // Shuffle the array to get random recommendations
      const shuffled = shuffleArray(allWorkouts);
      
      // Select a subset (up to 5) of workouts
      const recommendations = shuffled.slice(0, 5);
      
      // Assign dates based on a schedule (today, tomorrow, day after)
      const withDates = assignRecommendationDates(recommendations);
      
      setWorkouts(withDates);
    } catch (err: any) {
      console.error('Error fetching recommended workouts:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load workout recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch prepared workouts (standard workout library)
  const fetchPreparedWorkouts = async (): Promise<RecommendedWorkout[]> => {
    const { data, error } = await supabase
      .from('prepared_workouts')
      .select('id, title, duration_minutes, difficulty, category, thumbnail_url')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    return (data || []).map(workout => ({
      id: workout.id,
      title: workout.title,
      date: '', // Will be assigned later
      duration: workout.duration_minutes,
      difficulty: workout.difficulty,
      type: 'workout',
      thumbnail: workout.thumbnail_url || undefined,
    }));
  };
  
  // Fetch WODs
  const fetchWods = async (): Promise<RecommendedWorkout[]> => {
    const { data, error } = await supabase
      .from('wods')
      .select('id, name, avg_duration_minutes, difficulty')
      .limit(5);
    
    if (error) throw error;
    
    return (data || []).map(wod => ({
      id: wod.id,
      title: wod.name,
      date: '', // Will be assigned later
      duration: wod.avg_duration_minutes || 30,
      difficulty: wod.difficulty || 'Intermediate',
      type: 'wod',
    }));
  };
  
  // Fetch yoga/mindful workouts
  const fetchYogaWorkouts = async (): Promise<RecommendedWorkout[]> => {
    const { data, error } = await supabase
      .from('yoga_workouts')
      .select('id, name, difficulty, youtube_thumbnail_url')
      .limit(5);
    
    if (error) throw error;
    
    return (data || []).map(workout => ({
      id: workout.id,
      title: workout.name,
      date: '', // Will be assigned later
      duration: 20, // Default duration for yoga/mindful sessions
      difficulty: workout.difficulty || 'All Levels',
      type: Math.random() > 0.5 ? 'yoga' : 'mindful', // Randomly assign yoga or mindful
      thumbnail: workout.youtube_thumbnail_url || undefined,
    }));
  };
  
  // Helper to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Assign recommendation dates (today through next 7 days)
  const assignRecommendationDates = (workouts: RecommendedWorkout[]): RecommendedWorkout[] => {
    return workouts.map((workout, index) => {
      // Assign dates from today to 7 days out
      const date = addDays(new Date(), index % 7);
      return {
        ...workout,
        date: format(date, 'yyyy-MM-dd'),
      };
    });
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchRecommendedWorkouts();
  }, [fetchRecommendedWorkouts]);
  
  return {
    recommendedWorkouts: workouts,
    isLoading,
    error,
    refreshRecommendations: fetchRecommendedWorkouts
  };
};
