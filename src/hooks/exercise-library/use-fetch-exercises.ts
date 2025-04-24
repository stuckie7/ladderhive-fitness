
import { useState } from "react";
import { Exercise, ExerciseFilters } from "@/types/exercise";
import { ExerciseFull } from "@/types/exercise";
import { mapExerciseFullToExercise } from "./mappers";

type ExerciseFetchers = {
  searchExercises: (query: string) => Promise<Exercise[]>;
  getExercisesByMuscleGroup: (muscleGroup: string) => Promise<Exercise[]>;
  getExercisesByEquipment: (equipment: string) => Promise<Exercise[]>;
  searchExercisesFull: (searchTerm: string, limit?: number) => Promise<ExerciseFull[]>;
  fetchExercisesFull: (limit?: number, offset?: number) => Promise<ExerciseFull[]>;
};

export const useFetchExercises = (
  fetchers: ExerciseFetchers,
  filters: ExerciseFilters,
  searchQuery: string,
  firstMuscleGroup: string = 'back'
) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchExercises = async (): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      // Try to get exercises from exercises_full first if search query exists
      if (searchQuery) {
        const fullExercises = await fetchers.searchExercisesFull(searchQuery);
        if (fullExercises && fullExercises.length > 0) {
          console.log("Found exercises in exercises_full:", fullExercises.length);
          return fullExercises.map(mapExerciseFullToExercise);
        }
      }
      
      // Apply filters to exercises_full
      if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
        const fullExercises = await fetchers.fetchExercisesFull(20, 0); // Get initial set
        const filtered = fullExercises.filter(ex => 
          ex.target_muscle_group?.toLowerCase() === filters.muscleGroup.toLowerCase() ||
          ex.prime_mover_muscle?.toLowerCase() === filters.muscleGroup.toLowerCase()
        );
        
        if (filtered.length > 0) {
          return filtered.map(mapExerciseFullToExercise);
        }
      }
      
      if (filters.equipment && filters.equipment !== "all_equipment") {
        const fullExercises = await fetchers.fetchExercisesFull(20, 0); // Get initial set
        const filtered = fullExercises.filter(ex => 
          ex.primary_equipment?.toLowerCase() === filters.equipment.toLowerCase() ||
          ex.secondary_equipment?.toLowerCase() === filters.equipment.toLowerCase()
        );
        
        if (filtered.length > 0) {
          return filtered.map(mapExerciseFullToExercise);
        }
      }
      
      // If no suitable exercises found in exercises_full, fall back to original approach
      if (searchQuery) {
        return await fetchers.searchExercises(searchQuery);
      }
      
      if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
        return await fetchers.getExercisesByMuscleGroup(filters.muscleGroup.toLowerCase());
      }
      
      if (filters.equipment && filters.equipment !== "all_equipment") {
        return await fetchers.getExercisesByEquipment(filters.equipment.toLowerCase());
      }
      
      // Default: fetch exercises for the first muscle group
      const exercises = await fetchers.getExercisesByMuscleGroup(firstMuscleGroup);
      
      let filteredData = exercises;
      
      // Apply client-side filtering for difficulty if set
      if (filters.difficulty && filters.difficulty !== "all_difficulties") {
        filteredData = filteredData.filter(ex => 
          ex.difficulty === filters.difficulty
        );
      }
      
      return filteredData;
    } catch (error) {
      console.error("Error fetching exercises:", error);
      
      // Ultimate fallback to original approach
      if (searchQuery) {
        return await fetchers.searchExercises(searchQuery);
      }
      
      return await fetchers.getExercisesByMuscleGroup(firstMuscleGroup);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchExercises,
    isLoading
  };
};
