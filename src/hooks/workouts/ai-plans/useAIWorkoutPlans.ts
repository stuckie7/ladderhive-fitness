
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define simple types to avoid type conflicts
export interface AIWorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  weeks: number;
  days_per_week: number;
  focus: string;
  goal: string;
}

export interface DatabaseExercise {
  id: string;
  name: string;
  description: string;
  target_muscle_group: string;
  difficulty: string;
  equipment: string;
  instructions: string;
  image_url: string;
  video_url: string;
}

export function useAIWorkoutPlans() {
  const [plans, setPlans] = useState<AIWorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AIWorkoutPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch from Supabase or API
        // Mock data for now
        const mockPlans: AIWorkoutPlan[] = [
          {
            id: '1',
            name: 'Strength Builder',
            description: 'Build strength with this 8-week plan',
            difficulty: 'intermediate',
            weeks: 8,
            days_per_week: 4,
            focus: 'Strength',
            goal: 'Strength gain'
          },
          {
            id: '2',
            name: 'Fat Loss',
            description: 'Lose fat with this 12-week plan',
            difficulty: 'advanced',
            weeks: 12,
            days_per_week: 5,
            focus: 'Fat Loss',
            goal: 'Fat loss'
          }
        ];
        
        setPlans(mockPlans);
        if (mockPlans.length > 0) {
          setSelectedPlan(mockPlans[0]);
        }
      } catch (err) {
        console.error("Error fetching workout plans:", err);
        setError('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getExercisesForPlan = async (planId: string): Promise<DatabaseExercise[]> => {
    try {
      // In a real implementation, fetch exercises from database
      // Mock implementation for now
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .limit(10);

      if (error) {
        throw error;
      }

      // Convert to DatabaseExercise with string IDs
      return (data || []).map((ex: any) => ({
        ...ex,
        id: ex.id.toString()
      })) as DatabaseExercise[];
    } catch (err) {
      console.error("Error fetching exercises for plan:", err);
      return [];
    }
  };

  return {
    plans,
    loading,
    error,
    selectedPlan: selectedPlan as AIWorkoutPlan,
    setSelectedPlan: (plan: AIWorkoutPlan) => setSelectedPlan(plan),
    getExercisesForPlan
  };
}

export default useAIWorkoutPlans;
