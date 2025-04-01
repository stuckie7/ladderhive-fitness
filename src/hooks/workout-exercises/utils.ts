
import { Exercise } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";

// Define the shape of the data coming from Supabase
export interface SupabaseExercise {
  id: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: string;
  rest_time?: number;
  order_index: number;
  exercise?: Exercise;
}

// Helper function to map Supabase exercise data to our Exercise type
export const mapSupabaseExerciseToExercise = (supabaseExercise: SupabaseExercise): Exercise => {
  return {
    id: supabaseExercise.id,
    name: supabaseExercise.name,
    bodyPart: supabaseExercise.muscle_group || "",
    target: supabaseExercise.muscle_group || "", // Default target to muscle_group if available
    equipment: supabaseExercise.equipment || "",
    muscle_group: supabaseExercise.muscle_group,
    description: supabaseExercise.description,
    difficulty: supabaseExercise.difficulty as any,
    image_url: supabaseExercise.image_url,
    video_url: supabaseExercise.video_url
  };
};

// Validate UUID format - improved to handle hyphens properly
export const validateUuid = (id: string): boolean => {
  if (!id) return false;
  
  // Standard UUID pattern with hyphens
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return uuidPattern.test(id);
};

export const showInvalidUuidError = () => {
  const { toast } = useToast();
  
  toast({
    title: "Error",
    description: "Invalid workout ID format",
    variant: "destructive",
  });
};
