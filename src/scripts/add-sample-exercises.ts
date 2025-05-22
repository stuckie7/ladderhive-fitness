// Add sample exercises to the database
import { supabase } from '@/integrations/supabase/client';

export const addExercises = async () => {
  console.log('Adding sample exercises to the database...');
  
  const sampleExercises = [
    {
      name: 'Barbell Squat',
      description: 'A compound exercise that targets the quadriceps, hamstrings, and glutes',
      difficulty: 'intermediate',
      prime_mover_muscle: 'Quadriceps, Glutes',
      primary_equipment: 'Barbell',
      short_youtube_demo: 'https://www.youtube.com/watch?v=1oed-UmAxFs',
      youtube_thumbnail_url: 'https://img.youtube.com/vi/1oed-UmAxFs/hqdefault.jpg',
    },
    {
      name: 'Push-Up',
      description: 'A bodyweight exercise that targets the chest, shoulders, and triceps',
      difficulty: 'beginner',
      prime_mover_muscle: 'Chest, Shoulders',
      primary_equipment: 'Bodyweight',
      short_youtube_demo: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      youtube_thumbnail_url: 'https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg',
    },
    {
      name: 'Dumbbell Bench Press',
      description: 'A compound exercise that targets the chest, shoulders, and triceps',
      difficulty: 'beginner',
      prime_mover_muscle: 'Chest',
      primary_equipment: 'Dumbbells',
      short_youtube_demo: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
      youtube_thumbnail_url: 'https://img.youtube.com/vi/VmB1G1K7v94/hqdefault.jpg',
    },
    {
      name: 'Pull-Up',
      description: 'A bodyweight exercise that targets the back and biceps',
      difficulty: 'intermediate',
      prime_mover_muscle: 'Back, Biceps',
      primary_equipment: 'Bodyweight',
      short_youtube_demo: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      youtube_thumbnail_url: 'https://img.youtube.com/vi/eGo4IYlbE5g/hqdefault.jpg',
    },
    {
      name: 'Deadlift',
      description: 'A compound exercise that targets the back, glutes, and hamstrings',
      difficulty: 'advanced',
      prime_mover_muscle: 'Back, Glutes, Hamstrings',
      primary_equipment: 'Barbell',
      short_youtube_demo: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      youtube_thumbnail_url: 'https://img.youtube.com/vi/op9kVnSso6Q/hqdefault.jpg',
    }
  ];

  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .upsert(sampleExercises, { onConflict: 'name' })
      .select();

    if (error) {
      throw error;
    }

    console.log(`Successfully added ${data.length} sample exercises`);
    return data;
  } catch (error) {
    console.error('Error adding sample exercises:', error);
    throw error;
  }
};
