const { createClient } = require('@supabase/supabase-js');

// Ensure we're using CommonJS
require('@supabase/supabase-js');

// Replace with your Supabase project URL and anon key
const supabaseUrl = 'https://jrwyptpespjvjisrwnbh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk';

const supabase = createClient(supabaseUrl, supabaseKey);

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
};

addExercises().catch(console.error);
