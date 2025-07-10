
interface ExerciseCache {
  exercises: Map<string, any[]>;
  muscleGroups: string[] | null;
  equipmentTypes: string[] | null;
  lastFetch: number;
  cacheDuration: number;
}

export const exerciseCache: ExerciseCache = {
  exercises: new Map(),
  muscleGroups: null,
  equipmentTypes: null,
  lastFetch: 0,
  cacheDuration: 60000, // 1 minute cache
};

export const isCacheValid = (cacheKey: string): boolean => {
  const now = Date.now();
  return (
    exerciseCache.exercises.has(cacheKey) &&
    now - exerciseCache.lastFetch < exerciseCache.cacheDuration
  );
};

export const getCachedExercises = (cacheKey: string) => {
  return exerciseCache.exercises.get(cacheKey) || [];
};

export const setCachedExercises = (cacheKey: string, exercises: any[]) => {
  exerciseCache.exercises.set(cacheKey, exercises);
  exerciseCache.lastFetch = Date.now();
};
