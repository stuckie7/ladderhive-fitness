/**
 * This script adds sample exercises to the database.
 */

import { supabase } from '@/lib/supabase';

// Sample exercise data
const sampleExercises = [
  {
    name: 'Push-up',
    description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps.',
    prime_mover_muscle: 'Chest',
    secondary_muscles: ['Shoulders', 'Triceps'],
    primary_equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width apart',
      'Lower your body until your chest nearly touches the floor',
      'Push yourself back up to the starting position',
      'Repeat for the desired number of repetitions'
    ],
    short_youtube_demo: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg'
  },
  {
    name: 'Squat',
    description: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
    prime_mover_muscle: 'Quadriceps',
    secondary_muscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    primary_equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending your knees and pushing your hips back',
      'Keep your chest up and back straight',
      'Lower until thighs are parallel to the ground or as low as comfortable',
      'Push through your heels to return to the starting position'
    ],
    short_youtube_demo: 'https://www.youtube.com/watch?v=aclHkVaku9U',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/aclHkVaku9U/hqdefault.jpg'
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'An upper body strength exercise that targets the chest, shoulders, and triceps.',
    prime_mover_muscle: 'Chest',
    secondary_muscles: ['Shoulders', 'Triceps'],
    primary_equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Lie on a flat bench with a dumbbell in each hand',
      'Hold the dumbbells at chest level with palms facing forward',
      'Press the dumbbells upward until your arms are fully extended',
      'Lower the dumbbells back to chest level',
      'Repeat for the desired number of repetitions'
    ],
    short_youtube_demo: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/VmB1G1K7v94/hqdefault.jpg'
  },
  {
    name: 'Deadlift',
    description: 'A compound exercise that targets multiple muscle groups including the back, glutes, and hamstrings.',
    prime_mover_muscle: 'Lower Back',
    secondary_muscles: ['Glutes', 'Hamstrings', 'Quadriceps', 'Traps'],
    primary_equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: [
      'Stand with feet hip-width apart, with the barbell over your mid-foot',
      'Bend at the hips and knees to grip the bar with hands shoulder-width apart',
      'Keep your back straight and chest up',
      'Lift the bar by extending your hips and knees',
      'Stand up straight with the bar against your thighs',
      'Return the bar to the ground by hinging at the hips and bending the knees'
    ],
    short_youtube_demo: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/op9kVnSso6Q/hqdefault.jpg'
  },
  {
    name: 'Pull-up',
    description: 'An upper body exercise that primarily targets the back and biceps.',
    prime_mover_muscle: 'Lats',
    secondary_muscles: ['Biceps', 'Shoulders', 'Forearms'],
    primary_equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    instructions: [
      'Hang from a pull-up bar with hands slightly wider than shoulder-width apart',
      'Pull your body up until your chin is over the bar',
      'Lower yourself back to the starting position with control',
      'Repeat for the desired number of repetitions'
    ],
    short_youtube_demo: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/eGo4IYlbE5g/hqdefault.jpg'
  }
];

// Function to add sample exercises
export const addExercises = async () => {
  console.log('Adding sample exercises to the database...');
  
  try {
    // Check if exercises_full table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('exercises_full')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableCheckError) {
      console.error('Error checking if exercises table exists:', tableCheckError);
      return { success: false, message: 'Failed to check if exercises table exists' };
    }
    
    if (!tableExists) {
      console.error('Exercises table does not exist');
      return { success: false, message: 'Exercises table does not exist' };
    }
    
    // Insert sample exercises
    const { data, error } = await supabase
      .from('exercises_full')
      .insert(sampleExercises);
    
    if (error) {
      console.error('Error adding sample exercises:', error);
      return { success: false, message: `Failed to add sample exercises: ${error.message}` };
    }
    
    console.log('Successfully added sample exercises');
    return { success: true, message: `Added ${sampleExercises.length} sample exercises` };
  } catch (err) {
    console.error('Unexpected error adding sample exercises:', err);
    return { success: false, message: `Unexpected error: ${err.message}` };
  }
};

// To make it available for import in run-add-exercises.ts
export default addExercises;
