
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Exercise } from "@/types/exercise";
import { useExercises } from "../use-exercises";
import { useExercisesFull } from "./hooks/use-exercises-full";
import { useExerciseFilters } from "./use-exercise-filters";
import { mapExerciseFullToExercise } from "./mappers";

export const useExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { 
    getExercisesByMuscleGroup, 
    getExercisesByEquipment, 
    searchExercises 
  } = useExercises();
  
  const {
    fetchExercisesFull,
    searchExercisesFull,
    getMuscleGroups,
    getEquipmentTypes,
    isLoading: isLoadingFull
  } = useExercisesFull();

  const {
    filters,
    setFilters,
    resetFilters,
    availableMuscleGroups,
    availableEquipment
  } = useExerciseFilters(getMuscleGroups, getEquipmentTypes);

  const firstMuscleGroup = availableMuscleGroups[0]?.toLowerCase() || 'back';

  const handleSearch = async (query: string) => {
    try {
      console.log('Searching exercises with query:', query);
      
      const [apiResults, supabaseResults] = await Promise.all([
        searchExercises(query),
        searchExercisesFull(query)
      ]);

      console.log('API results:', apiResults?.length || 0);
      console.log('Supabase results:', supabaseResults?.length || 0);

      const combined = [
        ...(apiResults || []),
        ...(supabaseResults || []).map(mapExerciseFullToExercise)
      ];

      const uniqueResults = combined.reduce((acc, current) => {
        if (!acc.some(ex => ex.name.toLowerCase() === current.name.toLowerCase())) {
          acc.push(current);
        }
        return acc;
      }, [] as Exercise[]);

      console.log('Total unique results:', uniqueResults.length);
      return uniqueResults;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  };

  const fetchExercises = async (): Promise<Exercise[]> => {
    try {
      // Handle search query first
      if (searchQuery.trim()) {
        return await handleSearch(searchQuery);
      }

      // Handle filters
      let exercises: Exercise[] = [];

      // Try Supabase first based on filters
      if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
        const fullExercises = await fetchExercisesFull(20, 0);
        exercises = fullExercises
          .filter(ex => 
            ex.target_muscle_group?.toLowerCase() === filters.muscleGroup.toLowerCase() ||
            ex.prime_mover_muscle?.toLowerCase() === filters.muscleGroup.toLowerCase()
          )
          .map(mapExerciseFullToExercise);
      }

      if (filters.equipment && filters.equipment !== "all_equipment" && exercises.length === 0) {
        const fullExercises = await fetchExercisesFull(20, 0);
        exercises = fullExercises
          .filter(ex => 
            ex.primary_equipment?.toLowerCase() === filters.equipment.toLowerCase() ||
            ex.secondary_equipment?.toLowerCase() === filters.equipment.toLowerCase()
          )
          .map(mapExerciseFullToExercise);
      }

      // If no results from Supabase, try the API
      if (exercises.length === 0) {
        if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
          exercises = await getExercisesByMuscleGroup(filters.muscleGroup.toLowerCase());
        } else if (filters.equipment && filters.equipment !== "all_equipment") {
          exercises = await getExercisesByEquipment(filters.equipment.toLowerCase());
        } else {
          exercises = await getExercisesByMuscleGroup(firstMuscleGroup);
        }
      }

      // Apply difficulty filter if set
      if (filters.difficulty && filters.difficulty !== "all_difficulties") {
        exercises = exercises.filter(ex => ex.difficulty === filters.difficulty);
      }

      return exercises;
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return [];
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const { data: exercises = [], isLoading: isLoadingQuery, refetch } = useQuery({
    queryKey: ['exercises', filters, searchQuery, firstMuscleGroup],
    queryFn: fetchExercises,
    enabled: availableMuscleGroups.length > 0
  });

  const isLoading = isLoadingQuery || isLoadingFull;

  const getFilteredExercises = (muscleGroup: string) => {
    if (!exercises) return [];
    
    if (muscleGroup === "all") {
      return exercises;
    }
    
    return exercises.filter(ex => 
      ex.muscle_group?.toLowerCase() === muscleGroup.toLowerCase() ||
      ex.bodyPart?.toLowerCase() === muscleGroup.toLowerCase() ||
      ex.target?.toLowerCase() === muscleGroup.toLowerCase()
    );
  };

  useEffect(() => {
    refetch();
  }, [filters, searchQuery, refetch]);

  return {
    exercises,
    isLoading,
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    setSearchQuery,
    setActiveTab,
    setFilters,
    resetFilters,
    getFilteredExercises,
    handleSearchChange,
    handleSearch,
    refetch
  };
};
