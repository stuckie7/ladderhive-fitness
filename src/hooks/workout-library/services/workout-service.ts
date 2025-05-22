
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { Exercise } from '@/types/exercise';
import { toStringId } from '@/utils/id-conversion';

export interface WorkoutExerciseInput {
  exercise_id: string | number;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
}

export async function createWorkout(
  title: string,
  exercises: WorkoutExerciseInput[]
) {
  try {
    const { data: workout, error: workoutError } = await supabase
      .from('user_created_workouts')
      .insert([
        {
          title,
          difficulty: 'medium',
          user_id: 'user_id', // This should be replaced with actual user ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Insert workout exercises
    for (const exercise of exercises) {
      // Convert string exercise_id to number for DB
      const exerciseId = typeof exercise.exercise_id === 'string' 
        ? parseInt(exercise.exercise_id, 10) 
        : exercise.exercise_id;
      
      const { error: exerciseError } = await supabase
        .from('user_created_workout_exercises')
        .insert({
          workout_id: workout.id,
          exercise_id: exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_seconds,
          order_index: exercise.order_index,
        });

      if (exerciseError) throw exerciseError;
    }

    return workout;
  } catch (error) {
    console.error('Error creating workout:', error);
    throw error;
  }
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string | number,
  sets: number,
  reps: string,
  restSeconds: number,
  orderIndex: number
) {
  try {
    // Check if this is a user created workout or prepared workout
    const { data: workout, error: workoutError } = await supabase
      .from('user_created_workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (workoutError) {
      // If not found in user_created_workouts, check prepared_workouts
      const { data: preparedWorkout, error: preparedError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (preparedError) throw preparedError;

      // Insert into prepared_workout_exercises
      const numericExerciseId = typeof exerciseId === 'string' 
        ? parseInt(exerciseId, 10) 
        : exerciseId;
      
      const { error } = await supabase
        .from('prepared_workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: numericExerciseId,
          sets,
          reps,
          rest_seconds: restSeconds,
          order_index: orderIndex,
        });

      if (error) throw error;
    } else {
      // For user created workouts, we'll convert the ID to number for DB
      const numericExerciseId = typeof exerciseId === 'string'
        ? parseInt(exerciseId, 10)
        : exerciseId;
      
      // Insert into user_created_workout_exercises
      const { error } = await supabase
        .from('user_created_workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: numericExerciseId,
          sets,
          reps,
          rest_seconds: restSeconds,
          order_index: orderIndex,
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error adding exercise to workout:', error);
    throw error;
  }
}

export async function getUserWorkouts() {
  try {
    const { data, error } = await supabase
      .from('user_created_workouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user workouts:', error);
    throw error;
  }
}
