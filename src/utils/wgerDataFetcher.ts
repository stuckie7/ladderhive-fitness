
import { fetchGithubJsonData, fetchGithubTextData } from "./githubDataFetcher";

/**
 * Constants for wger repository access
 */
const WGER_REPO_OWNER = "wger-project";
const WGER_REPO_NAME = "wger";
const WGER_DEFAULT_BRANCH = "master";

/**
 * Common paths for wger data
 */
export const WGER_DATA_PATHS = {
  // Exercise data
  exercises: "wger/exercises/fixtures/exercises.json",
  categories: "wger/exercises/fixtures/categories.json",
  equipment: "wger/exercises/fixtures/equipment.json",
  muscles: "wger/exercises/fixtures/muscles.json",
  
  // Nutrition data
  ingredients: "wger/nutrition/fixtures/ingredients.json",
  nutritionPlans: "wger/nutrition/fixtures/nutrition_plans.json",
  
  // Workout data
  workoutPlans: "wger/manager/fixtures/test-workouts.json"
};

/**
 * Interface for a wger exercise
 */
export interface WgerExercise {
  model: string;
  pk: number;
  fields: {
    name: string;
    uuid: string;
    description: string;
    category: number;
    muscles: number[];
    muscles_secondary: number[];
    equipment: number[];
    language: number;
    license: number;
    license_author: string;
    [key: string]: any;
  };
}

/**
 * Interface for a wger category
 */
export interface WgerCategory {
  model: string;
  pk: number;
  fields: {
    name: string;
  };
}

/**
 * Interface for wger equipment
 */
export interface WgerEquipment {
  model: string;
  pk: number;
  fields: {
    name: string;
  };
}

/**
 * Interface for wger muscles
 */
export interface WgerMuscle {
  model: string;
  pk: number;
  fields: {
    name: string;
    is_front: boolean;
    name_en: string;
  };
}

/**
 * Fetches exercises data from the wger repository
 */
export const fetchWgerExercises = async (): Promise<WgerExercise[]> => {
  return fetchGithubJsonData<WgerExercise[]>(
    WGER_REPO_OWNER,
    WGER_REPO_NAME,
    WGER_DATA_PATHS.exercises,
    WGER_DEFAULT_BRANCH
  );
};

/**
 * Fetches categories data from the wger repository
 */
export const fetchWgerCategories = async (): Promise<WgerCategory[]> => {
  return fetchGithubJsonData<WgerCategory[]>(
    WGER_REPO_OWNER,
    WGER_REPO_NAME,
    WGER_DATA_PATHS.categories,
    WGER_DEFAULT_BRANCH
  );
};

/**
 * Fetches equipment data from the wger repository
 */
export const fetchWgerEquipment = async (): Promise<WgerEquipment[]> => {
  return fetchGithubJsonData<WgerEquipment[]>(
    WGER_REPO_OWNER,
    WGER_REPO_NAME,
    WGER_DATA_PATHS.equipment,
    WGER_DEFAULT_BRANCH
  );
};

/**
 * Fetches muscles data from the wger repository
 */
export const fetchWgerMuscles = async (): Promise<WgerMuscle[]> => {
  return fetchGithubJsonData<WgerMuscle[]>(
    WGER_REPO_OWNER,
    WGER_REPO_NAME,
    WGER_DATA_PATHS.muscles,
    WGER_DEFAULT_BRANCH
  );
};

/**
 * Transforms wger exercise data to our application format
 */
export const transformWgerExercise = (
  exercise: WgerExercise, 
  categories: WgerCategory[], 
  muscles: WgerMuscle[],
  equipment: WgerEquipment[]
) => {
  // Find the category
  const category = categories.find(cat => cat.pk === exercise.fields.category);
  
  // Find primary and secondary muscles
  const primaryMuscles = exercise.fields.muscles
    .map(muscleId => muscles.find(m => m.pk === muscleId))
    .filter(Boolean)
    .map(m => m?.fields.name_en || m?.fields.name);
    
  const secondaryMuscles = exercise.fields.muscles_secondary
    .map(muscleId => muscles.find(m => m.pk === muscleId))
    .filter(Boolean)
    .map(m => m?.fields.name_en || m?.fields.name);
  
  // Find equipment
  const equipmentList = exercise.fields.equipment
    .map(eqId => equipment.find(e => e.pk === eqId))
    .filter(Boolean)
    .map(e => e?.fields.name);
  
  return {
    id: exercise.pk.toString(),
    name: exercise.fields.name,
    description: exercise.fields.description,
    category: category?.fields.name || 'Uncategorized',
    difficulty: 'intermediate', // Default as wger doesn't have difficulty
    primaryMuscle: primaryMuscles.length > 0 ? primaryMuscles[0] : 'Other',
    secondaryMuscles: secondaryMuscles.join(', '),
    equipment: equipmentList.length > 0 ? equipmentList[0] : 'Bodyweight',
    secondaryEquipment: equipmentList.slice(1).join(', '),
    created_at: new Date().toISOString()
  };
};
