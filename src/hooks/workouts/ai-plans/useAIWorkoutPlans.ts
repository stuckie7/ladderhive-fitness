import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIWorkoutPlansState, AIWorkoutPlanFilters, AIWorkoutPlan, Exercise } from '@/types/workouts/ai-plans/types';

export interface DatabaseExercise {
  id: number;
  name: string;
  description: string | null;
  equipment: string | null;
  difficulty: string;
  muscle_groups: string[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

const workoutTypes = ['full-body', 'push-pull-legs', 'upper-lower', 'strength', 'hypertrophy', 'endurance'] as const;
const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
const durations = ['30 mins', '45 mins', '60 mins'] as const;

const equipmentMap = {
  'full-body': ['bodyweight', 'dumbbells'] as string[],
  'push-pull-legs': ['dumbbells', 'barbell'] as string[],
  'upper-lower': ['dumbbells', 'kettlebells'] as string[],
  'strength': ['barbell', 'dumbbells'] as string[],
  'hypertrophy': ['dumbbells', 'cable'] as string[],
  'endurance': ['bodyweight', 'kettlebells'] as string[]
} as const;

const muscleGroups = {
  'full-body': ['chest', 'back', 'legs', 'shoulders', 'arms'] as string[],
  'push-pull-legs': ['chest', 'back', 'legs', 'shoulders', 'arms'] as string[],
  'upper-lower': ['chest', 'back', 'shoulders', 'arms', 'legs'] as string[],
  'strength': ['chest', 'back', 'legs'] as string[],
  'hypertrophy': ['chest', 'back', 'shoulders', 'arms'] as string[],
  'endurance': ['legs', 'core', 'shoulders'] as string[]
} as const;

const getWorkoutExercises = (type: string, exercises: DatabaseExercise[]): Exercise[] => {
  const selectedGroups = muscleGroups[type];
  const filteredExercises = exercises.filter(ex => selectedGroups.some(group => ex.muscle_groups.includes(group)));

  return filteredExercises
    .slice(0, 6)
    .map(ex => ({
      name: ex.name,
      sets: type === 'endurance' ? 3 : 4,
      reps: type === 'strength' ? 5 : 12,
      rest: type === 'endurance' ? '30s' : '60s',
      video_url: ex.video_url || null
    }));
};

const generateWorkoutPlans = (exercises: DatabaseExercise[]): AIWorkoutPlan[] => {
  const plans = workoutTypes.map(type => {
    const workoutExercises = getWorkoutExercises(type, exercises);
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const equipment = equipmentMap[type];

    return {
      id: `plan-${type}`,
      title: `${type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Workout`,
      description: `A ${type.replace(/-/g, ' ')} workout targeting ${muscleGroups[type].join(', ')}`,
      difficulty,
      duration,
      focus: type.replace(/-/g, ' '),
      equipment,
      exercises: workoutExercises
    };
  });

  return plans;
};

export function useAIWorkoutPlans() {
  const [state, setState] = useState<AIWorkoutPlansState>({
    loading: true,
    error: null,
    plans: [],
    selectedPlan: null
  });

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Fetch exercises from database
        const { data: exercises, error: queryError } = await supabase
          .from('exercises')
          .select('*');

        if (queryError) {
          setState(prev => ({ ...prev, loading: false, error: queryError.message }));
          return;
        }

        // Generate workout plans based on exercises
        const workoutPlans = generateWorkoutPlans(exercises as DatabaseExercise[]);

        setState(prev => ({ ...prev, loading: false, plans: workoutPlans }));
      } catch (error) {
        setState(prev => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'An error occurred' }));
      }
    };

    fetchWorkoutPlans();
  }, []);

  return {
    plans: state.plans,
    loading: state.loading,
    error: state.error,
    selectedPlan: state.selectedPlan,
    setSelectedPlan: (plan: AIWorkoutPlan | null) => setState(prev => ({ ...prev, selectedPlan: plan }))
  };
};
