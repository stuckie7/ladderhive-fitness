import { supabase } from '@/lib/supabase';

const workoutId = '9a46e21a-da14-4bc5-ad13-2806f7acfa89';

const sampleExercises = [
  {
    exercise_id: 9441,
    sets: 3,
    reps: '12',
    rest_seconds: 60,
    order_index: 1,
    notes: 'Focus on form'
  },
  {
    exercise_id: 9381,
    sets: 4,
    reps: '10',
    rest_seconds: 90,
    order_index: 2,
    notes: 'Increase weight gradually'
  },
  {
    exercise_id: 9256,
    sets: 3,
    reps: '15',
    rest_seconds: 45,
    order_index: 3,
    notes: 'Keep core engaged'
  }
];

async function addExercises() {
  try {
    const { data, error } = await supabase
      .from('prepared_workout_exercises')
      .insert(sampleExercises.map(exercise => ({
        ...exercise,
        workout_id: workoutId
      })));

    if (error) throw error;
    console.log('Exercises added successfully:', data);
  } catch (err) {
    console.error('Error adding exercises:', err);
  }
}

// Run the function
addExercises().catch(console.error);
