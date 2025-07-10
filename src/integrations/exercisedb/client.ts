
import { Exercise } from "@/types/exercise";

const API_BASE_URL = "https://zylalabs.com/api/392/exercise+database+api";
const DEFAULT_HEADERS = {
  Authorization: `Bearer ${import.meta.env.VITE_EXERCISE_API_KEY || ""}`,
  "Content-Type": "application/json",
};

/**
 * Fetch data from the Exercise Database API
 */
const fetchFromApi = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  // Check if API key is available
  if (!import.meta.env.VITE_EXERCISE_API_KEY) {
    console.warn("Exercise API key is not set. Please set VITE_EXERCISE_API_KEY in environment variables.");
    // For demonstration, return mock data when API key is missing
    return getMockData(endpoint, params) as unknown as T;
  }
  
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error("Exercise API request failed:", error);
    // Fallback to mock data when request fails
    return getMockData(endpoint, params) as unknown as T;
  }
};

/**
 * Get mock data for development when API key is not available
 */
const getMockData = (endpoint: string, params: Record<string, string> = {}): any => {
  // Mock body parts
  if (endpoint.includes("list+of+body+parts")) {
    return ["back", "cardio", "chest", "lower arms", "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist"];
  }
  
  // Mock equipment list
  if (endpoint.includes("list+of+equipment")) {
    return ["barbell", "body weight", "dumbbell", "cable", "machine", "kettlebell", "resistance band", "medicine ball", "stability ball"];
  }
  
  // Mock target muscles
  if (endpoint.includes("list+of+target+muscles")) {
    return ["abs", "biceps", "delts", "chest", "forearms", "glutes", "hamstrings", "lats", "quads", "traps", "triceps"];
  }
  
  // Mock exercises by body part, target, equipment, or search
  const mockExercises = [
    {
      id: "mock-1",
      name: "Push-up",
      bodyPart: "chest",
      target: "pectorals",
      equipment: "body weight",
      gifUrl: "https://via.placeholder.com/400x400.png?text=Push-up",
      secondaryMuscles: ["triceps", "shoulders"],
      instructions: ["Get into a plank position", "Lower your body", "Push back up"],
      muscle_group: "chest",
      description: "A classic bodyweight exercise that works the chest, shoulders, and triceps.",
      difficulty: "Beginner",
      video_url: null,
      image_url: "https://via.placeholder.com/400x400.png?text=Push-up"
    },
    {
      id: "mock-2",
      name: "Bench Press",
      bodyPart: "chest",
      target: "pectorals",
      equipment: "barbell",
      gifUrl: "https://via.placeholder.com/400x400.png?text=Bench+Press",
      secondaryMuscles: ["triceps", "shoulders"],
      instructions: ["Lie on bench", "Lower barbell to chest", "Press upward"],
      muscle_group: "chest",
      description: "A compound exercise using a barbell to target the chest, shoulders, and triceps.",
      difficulty: "Intermediate",
      video_url: null,
      image_url: "https://via.placeholder.com/400x400.png?text=Bench+Press"
    },
    {
      id: "mock-3",
      name: "Squat",
      bodyPart: "upper legs",
      target: "quads",
      equipment: "barbell",
      gifUrl: "https://via.placeholder.com/400x400.png?text=Squat",
      secondaryMuscles: ["glutes", "hamstrings", "lower back"],
      instructions: ["Stand with feet shoulder-width apart", "Lower your body", "Return to starting position"],
      muscle_group: "legs",
      description: "A compound exercise that targets the legs and core muscles.",
      difficulty: "Intermediate",
      video_url: null,
      image_url: "https://via.placeholder.com/400x400.png?text=Squat"
    },
    {
      id: "mock-4",
      name: "Pull-up",
      bodyPart: "back",
      target: "lats",
      equipment: "body weight",
      gifUrl: "https://via.placeholder.com/400x400.png?text=Pull-up",
      secondaryMuscles: ["biceps", "forearms"],
      instructions: ["Hang from bar", "Pull body upward", "Lower back down"],
      muscle_group: "back",
      description: "A bodyweight exercise that targets the back and arm muscles.",
      difficulty: "Intermediate",
      video_url: null,
      image_url: "https://via.placeholder.com/400x400.png?text=Pull-up"
    },
    {
      id: "mock-5",
      name: "Plank",
      bodyPart: "waist",
      target: "abs",
      equipment: "body weight",
      gifUrl: "https://via.placeholder.com/400x400.png?text=Plank",
      secondaryMuscles: ["lower back", "shoulders"],
      instructions: ["Get into push-up position", "Hold the position", "Keep body straight"],
      muscle_group: "core",
      description: "A core exercise that also engages the shoulders and back.",
      difficulty: "Beginner",
      video_url: null,
      image_url: "https://via.placeholder.com/400x400.png?text=Plank"
    }
  ];
  
  // Filter by search query if present
  if (params.query || endpoint.includes("search")) {
    const query = params.query?.toLowerCase() || '';
    return mockExercises.filter(ex => ex.name.toLowerCase().includes(query));
  }
  
  // Filter by body part if applicable
  if (endpoint.includes("list+exercise+by+body+part") && params.bodyPart) {
    return mockExercises.filter(ex => ex.bodyPart === params.bodyPart);
  }
  
  // Filter by target muscle if applicable
  if (endpoint.includes("list+by+target+muscle") && params.target) {
    return mockExercises.filter(ex => ex.target === params.target);
  }
  
  // Filter by equipment if applicable
  if (endpoint.includes("list+by+equipment") && params.equipment) {
    return mockExercises.filter(ex => ex.equipment === params.equipment);
  }
  
  // Default: return a single exercise
  if (endpoint.includes("exercise+by+id")) {
    const exercise = mockExercises.find(ex => ex.id === params.id) || mockExercises[0];
    return exercise;
  }
  
  // Return all exercises as default
  return mockExercises;
};

/**
 * Get list of all body parts
 */
export const getBodyParts = async (): Promise<string[]> => {
  return fetchFromApi<string[]>("309/list+of+body+parts");
};

/**
 * Get list of all equipment types
 */
export const getEquipmentList = async (): Promise<string[]> => {
  return fetchFromApi<string[]>("2082/list+of+equipment");
};

/**
 * Get list of all target muscles
 */
export const getTargetMuscles = async (): Promise<string[]> => {
  return fetchFromApi<string[]>("311/list+of+target+muscles");
};

/**
 * Get exercises by body part
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  return fetchFromApi<Exercise[]>("310/list+exercise+by+body+part", { bodyPart });
};

/**
 * Get exercises by target muscle
 */
export const getExercisesByTarget = async (target: string): Promise<Exercise[]> => {
  return fetchFromApi<Exercise[]>("312/list+by+target+muscle", { target });
};

/**
 * Get exercises by equipment
 */
export const getExercisesByEquipment = async (equipment: string): Promise<Exercise[]> => {
  return fetchFromApi<Exercise[]>("2083/list+by+equipment", { equipment });
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (id: string): Promise<Exercise> => {
  const result = await fetchFromApi<Exercise>("1004/exercise+by+id", { id });
  return result;
};

/**
 * Search exercises by name
 */
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  // In a real implementation, we would use a proper search endpoint
  // Since ExerciseDB doesn't have a direct search endpoint, we would fetch from different sources
  // and filter by name
  return fetchFromApi<Exercise[]>("search", { query });
};

/**
 * Get AI workout plan
 */
export interface WorkoutPlanParams {
  target: string;
  gender: 'male' | 'female';
  weight: string;
  goal: string;
}

export interface WorkoutPlan {
  workout: string;
  exercises: Exercise[];
}

export const getAIWorkoutPlan = async (params: WorkoutPlanParams): Promise<WorkoutPlan> => {
  // Cast params to Record<string, string> to satisfy TypeScript
  return fetchFromApi<WorkoutPlan>("4824/ai+workout+planner", params as unknown as Record<string, string>);
};

/**
 * Calculate calories burned
 */
export interface CaloriesParams {
  age: string;
  gender: 'male' | 'female';
  weight: string;
  exercise_id: string;
  reps?: string;
  lifted_weight?: string;
  minutes?: string;
}

export interface CaloriesResult {
  calories_burned: number;
}

export const getCaloriesBurned = async (params: CaloriesParams): Promise<CaloriesResult> => {
  // Cast params to Record<string, string> to satisfy TypeScript
  return fetchFromApi<CaloriesResult>("4825/calories+burned", params as unknown as Record<string, string>);
};
