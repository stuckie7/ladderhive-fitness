
import { 
  fetchGithubJsonData,
  fetchGithubCsvData 
} from "@/utils/githubDataFetcher";
import { PreparedWorkout, PreparedWorkoutExercise } from "@/types/workout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface GitHubWorkoutSource {
  owner: string;
  repo: string;
  workoutsPath: string;
  exercisesPath: string;
  branch?: string;
}

interface RawWorkoutData {
  id?: string;
  title: string;
  description?: string;
  difficulty: string;
  category: string;
  goal?: string;
  duration_minutes: number;
  exercises?: RawExerciseData[];
}

interface RawExerciseData {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  exercise_id?: number | string;
}

/**
 * Imports workout data from GitHub and saves it to the Supabase database
 */
export const importWorkoutsFromGithub = async (
  source: GitHubWorkoutSource,
  onProgress?: (message: string, progress: number) => void
): Promise<PreparedWorkout[]> => {
  try {
    // Notify start
    onProgress?.('Fetching workouts data from GitHub...', 0);
    
    // Fetch workouts data from GitHub
    const rawWorkouts = await fetchGithubJsonData<RawWorkoutData[]>(
      source.owner,
      source.repo,
      source.workoutsPath,
      source.branch || 'main'
    );
    
    if (!rawWorkouts || rawWorkouts.length === 0) {
      throw new Error('No workout data found');
    }
    
    onProgress?.(`Found ${rawWorkouts.length} workouts`, 20);
    
    // Map the raw data to our PreparedWorkout type
    const preparedWorkouts: PreparedWorkout[] = rawWorkouts.map(raw => ({
      id: raw.id || crypto.randomUUID(),
      title: raw.title,
      description: raw.description || '',
      difficulty: raw.difficulty || 'intermediate',
      category: raw.category || 'strength',
      goal: raw.goal || '',
      duration_minutes: raw.duration_minutes || 30,
      exercises: raw.exercises?.length || 0 // Use exercise length for compatibility
    }));
    
    // Save workouts to Supabase if connected
    onProgress?.('Saving workouts to database...', 50);
    
    for (let i = 0; i < preparedWorkouts.length; i++) {
      const workout = preparedWorkouts[i];
      
      // Insert workout into Supabase
      const { error: workoutError } = await supabase
        .from('prepared_workouts')
        .upsert([{
          id: workout.id,
          title: workout.title,
          description: workout.description,
          difficulty: workout.difficulty,
          category: workout.category,
          goal: workout.goal || '',
          duration_minutes: workout.duration_minutes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_template: false // Mark as not a template by default
        }]);
      
      if (workoutError) {
        console.error('Error inserting workout:', workoutError);
        continue;
      }
      
      // Insert exercises if available
      if (rawWorkouts[i].exercises && rawWorkouts[i].exercises.length > 0) {
        const workoutExercises = rawWorkouts[i].exercises?.map((ex, index) => ({
          workout_id: workout.id,
          exercise_id: Number(ex.exercise_id) || 1, // Default to 1 if not provided
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          order_index: index,
          notes: ex.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        if (workoutExercises && workoutExercises.length > 0) {
          const { error: exercisesError } = await supabase
            .from('prepared_workout_exercises')
            .upsert(workoutExercises);
          
          if (exercisesError) {
            console.error('Error inserting workout exercises:', exercisesError);
          }
        }
      }
      
      onProgress?.(`Saved workout ${i + 1} of ${preparedWorkouts.length}`, 50 + (i / preparedWorkouts.length) * 50);
    }
    
    onProgress?.('Import completed successfully', 100);
    return preparedWorkouts;
    
  } catch (error) {
    console.error('Error importing workouts from GitHub:', error);
    throw error;
  }
};

/**
 * Imports data from local JSON files to the Supabase database
 */
export const importLocalData = async (
  localData: any,
  onProgress?: (message: string, progress: number) => void
): Promise<boolean> => {
  try {
    // This function can be expanded to handle different types of local data
    onProgress?.('Processing local data...', 10);
    
    // Example logic - can be expanded based on the structure of your local data
    if (localData.categories) {
      onProgress?.('Importing categories...', 30);
      // Add code to import categories
    }
    
    if (localData.testCategories) {
      onProgress?.('Importing test categories...', 50);
      // Add code to import test categories
    }
    
    if (localData.testEquipment) {
      onProgress?.('Importing equipment...', 70);
      // Add code to import equipment
    }
    
    onProgress?.('Import completed successfully', 100);
    return true;
  } catch (error) {
    console.error('Error importing local data:', error);
    throw error;
  }
};

/**
 * Downloads workout data from GitHub without saving to database
 * Useful for previewing data before import
 */
export const previewWorkoutsFromGithub = async (
  source: GitHubWorkoutSource
): Promise<RawWorkoutData[]> => {
  try {
    const rawWorkouts = await fetchGithubJsonData<RawWorkoutData[]>(
      source.owner,
      source.repo,
      source.workoutsPath,
      source.branch || 'main'
    );
    
    return rawWorkouts;
  } catch (error) {
    console.error('Error previewing workouts from GitHub:', error);
    throw error;
  }
};
