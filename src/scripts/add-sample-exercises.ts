import { supabase } from '@/integrations/supabase/client';

/**
 * Add sample exercises to the database
 */
export const addExercises = async () => {
  try {
    console.log('Adding sample exercises to the database...');
    
    // Sample exercises data
    const exercises = [
      {
        name: 'Barbell Bench Press',
        description: 'A compound chest exercise focusing on pectoral development',
        prime_mover_muscle: 'Chest',
        secondary_muscle: 'Triceps, Shoulders',
        difficulty: 'Intermediate',
        primary_equipment: 'Barbell',
        exercise_classification: 'Compound',
        force_type: 'Push',
        instructions: 'Lie on a bench with feet flat on the floor. Grip the barbell with hands slightly wider than shoulder-width apart. Lower the bar to your chest, then press it back up to the starting position.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/rT7DgCr-3pg/hqdefault.jpg'
      },
      {
        name: 'Squat',
        description: 'A fundamental lower body compound exercise',
        prime_mover_muscle: 'Quadriceps',
        secondary_muscle: 'Glutes, Hamstrings, Lower Back',
        difficulty: 'Intermediate',
        primary_equipment: 'Barbell',
        exercise_classification: 'Compound',
        force_type: 'Push',
        instructions: 'Stand with feet shoulder-width apart, barbell across upper back. Bend knees and hips to lower your body, keeping chest up and knees tracking over toes. Return to standing position.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/ultWZbUMPL8/hqdefault.jpg'
      },
      {
        name: 'Deadlift',
        description: 'A compound exercise that works multiple major muscle groups',
        prime_mover_muscle: 'Lower Back',
        secondary_muscle: 'Glutes, Hamstrings, Traps',
        difficulty: 'Advanced',
        primary_equipment: 'Barbell',
        exercise_classification: 'Compound',
        force_type: 'Pull',
        instructions: 'Stand with feet hip-width apart, barbell over mid-foot. Bend at hips and knees to grip the bar. Keeping back straight, stand up with the weight, extending hips and knees. Return the weight to the floor with control.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/op9kVnSso6Q/hqdefault.jpg'
      },
      {
        name: 'Pull-up',
        description: 'A bodyweight back exercise focusing on lat development',
        prime_mover_muscle: 'Lats',
        secondary_muscle: 'Biceps, Middle Back',
        difficulty: 'Intermediate',
        primary_equipment: 'Bodyweight',
        exercise_classification: 'Compound',
        force_type: 'Pull',
        instructions: 'Hang from a pull-up bar with hands slightly wider than shoulder-width apart. Pull your body up until your chin is over the bar, then lower with control.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/eGo4IYlbE5g/hqdefault.jpg'
      },
      {
        name: 'Dumbbell Shoulder Press',
        description: 'An upper body exercise targeting the shoulders',
        prime_mover_muscle: 'Shoulders',
        secondary_muscle: 'Triceps, Traps',
        difficulty: 'Beginner',
        primary_equipment: 'Dumbbells',
        exercise_classification: 'Compound',
        force_type: 'Push',
        instructions: 'Sit on a bench with back support. Hold dumbbells at shoulder height with palms facing forward. Press the weights up until arms are extended, then lower back to starting position.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/qEwKCR5JCog/hqdefault.jpg'
      },
      {
        name: 'Barbell Row',
        description: 'A compound back exercise for overall back development',
        prime_mover_muscle: 'Middle Back',
        secondary_muscle: 'Lats, Biceps',
        difficulty: 'Intermediate',
        primary_equipment: 'Barbell',
        exercise_classification: 'Compound',
        force_type: 'Pull',
        instructions: 'Bend at hips until torso is almost parallel to floor, knees slightly bent. Grip barbell with hands shoulder-width apart. Pull bar to lower chest, keeping elbows close to body. Lower with control.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=T3N-TO4reLQ',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/T3N-TO4reLQ/hqdefault.jpg'
      },
      {
        name: 'Leg Press',
        description: 'A machine-based lower body exercise',
        prime_mover_muscle: 'Quadriceps',
        secondary_muscle: 'Glutes, Hamstrings',
        difficulty: 'Beginner',
        primary_equipment: 'Machine',
        exercise_classification: 'Compound',
        force_type: 'Push',
        instructions: 'Sit in the leg press machine with feet shoulder-width apart on the platform. Release the safety bars and lower the platform by bending your knees. Push through your heels to return to starting position.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/IZxyjW7MPJQ/hqdefault.jpg'
      },
      {
        name: 'Dumbbell Bicep Curl',
        description: 'An isolation exercise for bicep development',
        prime_mover_muscle: 'Biceps',
        secondary_muscle: 'Forearms',
        difficulty: 'Beginner',
        primary_equipment: 'Dumbbells',
        exercise_classification: 'Isolation',
        force_type: 'Pull',
        instructions: 'Stand with dumbbells in hand, arms extended, palms facing forward. Keeping upper arms stationary, curl weights up to shoulder level. Lower with control.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/ykJmrZ5v0Oo/hqdefault.jpg'
      },
      {
        name: 'Tricep Pushdown',
        description: 'An isolation exercise for tricep development',
        prime_mover_muscle: 'Triceps',
        secondary_muscle: '',
        difficulty: 'Beginner',
        primary_equipment: 'Cable',
        exercise_classification: 'Isolation',
        force_type: 'Push',
        instructions: 'Stand facing a cable machine with high pulley attachment. Grip the bar with hands shoulder-width apart. Keeping elbows at sides, push the bar down until arms are fully extended. Return to starting position.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/2-LAMcpzODU/hqdefault.jpg'
      },
      {
        name: 'Plank',
        description: 'A core stabilization exercise',
        prime_mover_muscle: 'Abs',
        secondary_muscle: 'Lower Back, Shoulders',
        difficulty: 'Beginner',
        primary_equipment: 'Bodyweight',
        exercise_classification: 'Isometric',
        force_type: 'Static',
        instructions: 'Start in push-up position but with forearms on the ground. Keep body in straight line from head to heels. Hold position while breathing normally.',
        short_youtube_demo: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
        youtube_thumbnail_url: 'https://img.youtube.com/vi/pSHjTRCQxIw/hqdefault.jpg'
      }
    ];
    
    // Insert exercises into the database
    const { data, error } = await supabase
      .from('exercises_full')
      .insert(exercises)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully added ${data.length} exercises to the database`);
    return data;
  } catch (error) {
    console.error('Error adding sample exercises:', error);
    throw error;
  }
};
