import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseFilters } from "@/types/exercise";
import { useExercises } from "../use-exercises";
import { useExercisesFull } from "../use-exercises-full";
import { useExerciseFilters } from "./use-exercise-filters";
import { useFetchExercises } from "./use-fetch-exercises";
import { mapExerciseFullToExercise } from "./mappers";
import { defaultMuscleGroups, defaultEquipmentTypes } from "./constants";

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
  
  const { fetchExercises } = useFetchExercises(
    { 
      searchExercises, 
      getExercisesByMuscleGroup, 
      getExercisesByEquipment,
      searchExercisesFull,
      fetchExercisesFull
    },
    filters,
    searchQuery,
    firstMuscleGroup
  );

  const { data: exercises, isLoading: isLoadingQuery, refetch } = useQuery({
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

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = await handleSearch(query);
      refetch();
    }
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
