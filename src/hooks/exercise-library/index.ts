
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Exercise } from "@/types/exercise";
import { useExercises } from "../use-exercises";
import { useExercisesFull } from "../use-exercises-full";
import { useExerciseFilters } from "./use-exercise-filters";
import { useFetchExercises } from "./use-fetch-exercises";

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

  // Get filters and filter options
  const {
    filters,
    setFilters,
    resetFilters,
    availableMuscleGroups,
    availableEquipment
  } = useExerciseFilters(getMuscleGroups, getEquipmentTypes);

  // Set up exercise fetching
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

  // Fetch exercises with React Query
  const { data: exercises, isLoading: isLoadingQuery, refetch } = useQuery({
    queryKey: ['exercises', filters, searchQuery, firstMuscleGroup],
    queryFn: fetchExercises,
    enabled: availableMuscleGroups.length > 0
  });

  const isLoading = isLoadingQuery || isLoadingFull;

  // Helper function to get exercises filtered by muscle group
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
    refetch
  };
};
