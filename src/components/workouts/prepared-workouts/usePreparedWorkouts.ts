
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Workout } from "@/types/workout";
import { WorkoutExercise, ensureStringReps } from "@/hooks/workout-exercises/utils";
import { Exercise } from "@/types/exercise";

/**
 * Maps a Supabase exercise object to our Exercise type
 */
const mapSupabaseExerciseToExercise = (exerciseData: any): Exercise => {
  return {
    id: exerciseData.id,
    name: exerciseData.name || '',
    description: exerciseData.description || '',
    muscle_group: exerciseData.target_muscle_group || exerciseData.prime_mover_muscle || exerciseData.muscle_group,
    equipment: exerciseData.primary_equipment || exerciseData.equipment,
    difficulty: exerciseData.difficulty || exerciseData.difficulty_level,
    instructions: Array.isArray(exerciseData.instructions) ? exerciseData.instructions : 
      (exerciseData.instructions ? [exerciseData.instructions] : []),
    video_url: exerciseData.video_url || exerciseData.short_youtube_demo || exerciseData.video_demonstration_url,
    image_url: exerciseData.image_url || exerciseData.youtube_thumbnail_url,
    bodyPart: exerciseData.body_region,
    target: exerciseData.target_muscle_group || exerciseData.prime_mover_muscle,
    secondaryMuscles: [
      exerciseData.secondary_muscle,
      exerciseData.tertiary_muscle
    ].filter(Boolean),
    video_demonstration_url: exerciseData.video_demonstration_url || exerciseData.short_youtube_demo,
  };
};

export const usePreparedWorkouts = (currentWorkoutId: string | null = null) => {
  const [preparedWorkouts, setPreparedWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Record<string, WorkoutExercise[]>>({});
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch prepared workouts from Supabase
  useEffect(() => {
    const fetchPreparedWorkouts = async () => {
      try {
        let query = supabase
          .from('workouts')
          .select('*')
          .limit(5);
        
        // Only apply filter if currentWorkoutId is a valid UUID
        if (currentWorkoutId && currentWorkoutId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
          query = query.neq('id', currentWorkoutId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setPreparedWorkouts(data || []);
        
        // Load exercises for all prepared workouts immediately
        if (data && data.length > 0) {
          // Immediately load exercises for the first workout to show something by default
          if (data[0]) {
            setExpandedWorkout(data[0].id);
            fetchWorkoutExercises(data[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching prepared workouts:", error);
        toast({
          title: "Error",
          description: "Failed to load prepared workouts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreparedWorkouts();
  }, [currentWorkoutId, toast]);

  // Fetch exercises for a specific workout when expanded
  const fetchWorkoutExercises = async (workoutId: string) => {
    if (!workoutId || workoutExercises[workoutId]?.length > 0) return; // Already loaded or invalid ID
    
    setLoadingExercises(prev => ({ ...prev, [workoutId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our WorkoutExercise type
      const mappedExercises: WorkoutExercise[] = data.map(item => ({
        id: item.id,
        workout_id: item.workout_id,
        exercise_id: item.exercise_id.toString(),
        sets: item.sets,
        reps: ensureStringReps(item.reps), // Convert to string
        weight: item.weight ? item.weight.toString() : undefined,
        rest_time: item.rest_time,
        rest_seconds: item.rest_time || 60, // Map rest_time to rest_seconds
        order_index: item.order_index,
        exercise: item.exercise ? mapSupabaseExerciseToExercise(item.exercise) : undefined
      }));
      
      // Update the workoutExercises state with the new data
      setWorkoutExercises((prev) => {
        const updatedState = { ...prev };
        updatedState[workoutId] = mappedExercises;
        return updatedState;
      });
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load workout exercises",
        variant: "destructive",
      });
    } finally {
      setLoadingExercises(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  const toggleExpand = (workoutId: string) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
      fetchWorkoutExercises(workoutId);
    }
  };

  return {
    preparedWorkouts,
    isLoading,
    expandedWorkout,
    workoutExercises,
    loadingExercises,
    toggleExpand,
  };
};
