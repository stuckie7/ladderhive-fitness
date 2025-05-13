
import { supabase } from "@/integrations/supabase/client";

interface WorkoutExercise {
  id: string;
  exercise_id: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  exercise: {
    id: number;
    name: string;
    prime_mover_muscle?: string;
    secondary_muscle?: string;
    description?: string;
    short_youtube_demo?: string;
    youtube_thumbnail_url?: string;
  };
}

interface PreparedWorkout {
  id: string;
  title: string;
  category: string;
  goal: string;
  duration_minutes: number;
  difficulty: string;
  exercises: WorkoutExercise[];
}

export async function generateWorkoutInstructions(): Promise<string> {
  try {
    console.log("Fetching prepared workouts...");
    
    // Fetch all prepared workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from('prepared_workouts')
      .select('id, title, category, goal, duration_minutes, difficulty');
    
    if (workoutsError) {
      console.error("Error fetching workouts:", workoutsError);
      throw workoutsError;
    }
    
    if (!workouts || workouts.length === 0) {
      return "No prepared workouts found.";
    }
    
    console.log(`Found ${workouts.length} workouts.`);
    
    // Process each workout
    const workoutsWithExercises: PreparedWorkout[] = [];
    
    for (const workout of workouts) {
      console.log(`Fetching exercises for workout: ${workout.title}`);
      
      // Fetch exercises for this workout with their details
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          id, exercise_id, sets, reps, rest_seconds, notes, order_index,
          exercise:exercise_id(
            id, name, prime_mover_muscle, secondary_muscle, description,
            short_youtube_demo, youtube_thumbnail_url
          )
        `)
        .eq('workout_id', workout.id)
        .order('order_index');
      
      if (exercisesError) {
        console.error(`Error fetching exercises for workout ${workout.title}:`, exercisesError);
        continue;
      }
      
      // Filter exercises that have video urls
      const validExercises = exercisesData.filter(ex => 
        ex.exercise && (ex.exercise.short_youtube_demo || ex.exercise.youtube_thumbnail_url)
      );
      
      console.log(`Found ${validExercises.length} exercises with videos for workout: ${workout.title}`);
      
      if (validExercises.length > 0) {
        workoutsWithExercises.push({
          ...workout,
          exercises: validExercises as WorkoutExercise[]
        });
      }
    }
    
    // Generate markdown output
    const markdown = generateMarkdown(workoutsWithExercises);
    return markdown;
    
  } catch (error) {
    console.error("Error generating workout instructions:", error);
    return `Error generating workout instructions: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function generateMarkdown(workouts: PreparedWorkout[]): string {
  let output = "# Prepared Workout Instructions\n\n";
  
  workouts.forEach(workout => {
    output += `## ${workout.title}\n`;
    output += `*Category*: ${workout.category || 'N/A'} | *Goal*: ${workout.goal || 'N/A'}\n`;
    output += `*Duration*: ${workout.duration_minutes || 'N/A'} mins | *Difficulty*: ${workout.difficulty || 'N/A'}\n\n`;
    
    output += "**Exercises**:\n\n";
    
    workout.exercises.forEach((exercise, index) => {
      if (!exercise.exercise) return;
      
      output += `${index + 1}. **${exercise.exercise.name}**\n`;
      
      // Focus
      const primaryMuscle = exercise.exercise.prime_mover_muscle || 'Full body';
      const secondaryMuscle = exercise.exercise.secondary_muscle ? `, ${exercise.exercise.secondary_muscle}` : '';
      output += `   - **Focus**: ${primaryMuscle}${secondaryMuscle}\n`;
      
      // Description
      const description = exercise.exercise.description || 'Compound movement targeting multiple muscle groups.';
      output += `   - **Description**: ${description}\n`;
      
      // Instructions
      output += `   - **Instructions**:\n`;
      output += `     - Sets: ${exercise.sets}\n`;
      output += `     - Reps: ${exercise.reps}\n`;
      
      // Rest periods with defaults based on category
      let restSeconds = exercise.rest_seconds;
      if (!restSeconds) {
        if (workout.category?.toLowerCase().includes('strength')) {
          restSeconds = 60;
        } else if (workout.category?.toLowerCase().includes('hiit') || 
                   workout.category?.toLowerCase().includes('cardio')) {
          restSeconds = 30;
        } else {
          restSeconds = 45;
        }
      }
      output += `     - Rest: ${restSeconds} seconds between sets\n`;
      
      // Notes if available
      if (exercise.notes) {
        output += `     - *Pro Tip*: ${exercise.notes}\n`;
      }
      
      // Video link
      const videoUrl = exercise.exercise.short_youtube_demo || exercise.exercise.youtube_thumbnail_url;
      if (videoUrl) {
        output += `   - **Video**: [Watch demonstration](${videoUrl})\n`;
      }
      
      output += `\n`;
    });
    
    output += `---\n\n`;
  });
  
  return output;
}
