
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
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json() as Promise<T>;
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
